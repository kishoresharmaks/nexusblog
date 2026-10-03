import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectEventDto, SearchQueryDto, AnalyticsEventTypeDto } from './dto/collect-event.dto';
import {
  format,
  subDays,
  subHours,
  startOfDay,
  endOfDay,
  startOfHour,
  endOfHour,
  eachDayOfInterval,
  eachHourOfInterval,
  isWithinInterval,
} from 'date-fns';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Collect non-blocking telemetry events from client beacon
   */
  async collectEvent(dto: CollectEventDto, ip?: string, userAgent?: string, cfCountry?: string) {
    try {
      const parsedOs = dto.os || this.detectOs(userAgent);
      const parsedBrowser = dto.browser || this.detectBrowser(userAgent);
      const parsedDevice = dto.device || this.detectDevice(userAgent);
      const resolvedCountry = dto.country || cfCountry || null;
      let resolvedCountryName = dto.countryName || null;
      if (resolvedCountry && !resolvedCountryName) {
        if (resolvedCountry === 'IN') resolvedCountryName = 'India';
        else if (resolvedCountry === 'US') resolvedCountryName = 'United States';
        else if (resolvedCountry === 'GB') resolvedCountryName = 'United Kingdom';
        else if (resolvedCountry === 'DE') resolvedCountryName = 'Germany';
        else if (resolvedCountry === 'CA') resolvedCountryName = 'Canada';
        else if (resolvedCountry === 'AU') resolvedCountryName = 'Australia';
        else if (resolvedCountry === 'SG') resolvedCountryName = 'Singapore';
        else resolvedCountryName = resolvedCountry;
      }

      // Extract article slug if path is /articles/[slug]
      let detectedSlug = dto.articleSlug;
      if (!detectedSlug && dto.path && dto.path.startsWith('/articles/')) {
        const parts = dto.path.split('/articles/')[1]?.split('?')[0]?.split('#')[0];
        if (parts) detectedSlug = parts;
      }

      // If article pageview, increment article views counter
      let articleId: string | undefined = undefined;
      if (detectedSlug && dto.eventType === AnalyticsEventTypeDto.PAGEVIEW) {
        try {
          const article = await this.prisma.article.findUnique({
            where: { slug: detectedSlug },
            select: { id: true, category: { select: { slug: true } } },
          });
          if (article) {
            articleId = article.id;
            if (!dto.categorySlug && article.category?.slug) {
              dto.categorySlug = article.category.slug;
            }
            await this.prisma.article.update({
              where: { id: article.id },
              data: { viewsCount: { increment: 1 } },
            });
          }
        } catch {
          // Non-blocking
        }
      }

      // Store authentic telemetry event
      await this.prisma.analyticsEvent.create({
        data: {
          eventType: dto.eventType as any,
          path: dto.path,
          articleId,
          articleSlug: detectedSlug,
          categorySlug: dto.categorySlug,
          visitorId: dto.visitorId,
          sessionId: dto.sessionId,
          referrer: dto.referrer || null,
          utmSource: dto.utmSource || null,
          utmMedium: dto.utmMedium || null,
          utmCampaign: dto.utmCampaign || null,
          os: parsedOs,
          browser: parsedBrowser,
          device: parsedDevice,
          country: resolvedCountry,
          countryName: resolvedCountryName,
          scrollDepth: dto.scrollDepth || null,
          metadata: dto.metadata || undefined,
        },
      });

      return { success: true };
    } catch (err: any) {
      this.logger.debug(`Telemetry ingestion error: ${err.message}`);
      return { success: true };
    }
  }

  /**
   * 2. Log search queries for search intelligence & zero-result gap analysis
   */
  async logSearchQuery(dto: SearchQueryDto) {
    try {
      if (!dto.query || dto.query.trim().length === 0) return { success: true };
      await this.prisma.searchQueryLog.create({
        data: {
          query: dto.query.trim().toLowerCase(),
          resultsCount: dto.resultsCount || 0,
          visitorId: dto.visitorId || null,
        },
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  }

  /**
   * 3. Overview KPIs & Pure Real-Data Time-Series Chart
   */
  async getOverview(timeWindow: string = '7d') {
    const { startDate, prevStartDate, isHourly, intervals } = this.resolveTimeIntervals(timeWindow);

    try {
      const [
        totalPageviews,
        uniqueVisitorsRaw,
        codeCopies,
        bookmarksCount,
        prevPageviews,
        prevUniqueVisitorsRaw,
        readingHistoryStats,
        articleStats,
        pageviewEvents,
      ] = await Promise.all([
        this.prisma.analyticsEvent.count({
          where: { eventType: 'PAGEVIEW', timestamp: { gte: startDate } },
        }),
        this.prisma.analyticsEvent.findMany({
          where: { timestamp: { gte: startDate }, visitorId: { not: null } },
          distinct: ['visitorId'],
          select: { visitorId: true },
        }),
        this.prisma.analyticsEvent.count({
          where: { eventType: 'CODE_COPY', timestamp: { gte: startDate } },
        }),
        this.prisma.bookmark.count({
          where: { createdAt: { gte: startDate } },
        }),
        this.prisma.analyticsEvent.count({
          where: { eventType: 'PAGEVIEW', timestamp: { gte: prevStartDate, lt: startDate } },
        }),
        this.prisma.analyticsEvent.findMany({
          where: { timestamp: { gte: prevStartDate, lt: startDate }, visitorId: { not: null } },
          distinct: ['visitorId'],
          select: { visitorId: true },
        }),
        this.prisma.readingHistory.aggregate({
          where: { updatedAt: { gte: startDate } },
          _avg: { completionPercentage: true },
          _count: true,
        }),
        this.prisma.article.aggregate({
          where: { status: 'PUBLISHED' },
          _avg: { readingTime: true },
        }),
        this.prisma.analyticsEvent.findMany({
          where: {
            eventType: 'PAGEVIEW',
            timestamp: { gte: startDate },
          },
          select: { timestamp: true, visitorId: true },
        }),
      ]);

      const uniqueVisitors = uniqueVisitorsRaw.length;
      const prevUnique = prevUniqueVisitorsRaw.length;

      // Delta percentage calculation
      const viewsDelta =
        prevPageviews > 0
          ? Number((((totalPageviews - prevPageviews) / prevPageviews) * 100).toFixed(1))
          : totalPageviews > 0
          ? 100.0
          : 0.0;

      const visitorsDelta =
        prevUnique > 0
          ? Number((((uniqueVisitors - prevUnique) / prevUnique) * 100).toFixed(1))
          : uniqueVisitors > 0
          ? 100.0
          : 0.0;

      const avgScroll = readingHistoryStats?._avg?.completionPercentage
        ? Math.round(readingHistoryStats._avg.completionPercentage)
        : 0;

      const avgReadTimeMinutes = articleStats?._avg?.readingTime
        ? Number(articleStats._avg.readingTime.toFixed(1))
        : 0;

      const bookmarkConversionRate =
        uniqueVisitors > 0
          ? Number(((bookmarksCount / uniqueVisitors) * 100).toFixed(1))
          : 0;

      // Build 100% Real Time Series Curve from recorded events
      const timeSeries = intervals.map((intervalDate: Date) => {
        const label = isHourly
          ? format(intervalDate, 'ha')
          : format(intervalDate, 'MMM dd');

        const intervalStart = isHourly ? startOfHour(intervalDate) : startOfDay(intervalDate);
        const intervalEnd = isHourly ? endOfHour(intervalDate) : endOfDay(intervalDate);

        const bucketEvents = pageviewEvents.filter((ev) =>
          isWithinInterval(new Date(ev.timestamp), { start: intervalStart, end: intervalEnd })
        );

        const bucketViews = bucketEvents.length;
        const bucketVisitors = new Set(bucketEvents.map((e) => e.visitorId).filter(Boolean)).size;

        return {
          date: label,
          fullDate: intervalDate.toISOString(),
          pageviews: bucketViews,
          visitors: bucketVisitors,
        };
      });

      return {
        summary: {
          totalPageviews,
          pageviewsDelta: viewsDelta,
          uniqueVisitors,
          visitorsDelta,
          avgReadTimeMinutes,
          avgScrollDepthPercent: avgScroll,
          codeCopies,
          bookmarksCount,
          bookmarkConversionRate,
        },
        timeSeries,
      };
    } catch (err: any) {
      this.logger.error(`Failed to aggregate overview analytics: ${err.message}`);
      return {
        summary: {
          totalPageviews: 0,
          pageviewsDelta: 0,
          uniqueVisitors: 0,
          visitorsDelta: 0,
          avgReadTimeMinutes: 0,
          avgScrollDepthPercent: 0,
          codeCopies: 0,
          bookmarksCount: 0,
          bookmarkConversionRate: 0,
        },
        timeSeries: [],
      };
    }
  }

  /**
   * 4. Top Performing Blueprints Leaderboard (Pure Real Data)
   */
  async getTopBlueprints(timeWindow: string = '7d', limit: number = 10) {
    const { startDate } = this.resolveTimeIntervals(timeWindow);

    try {
      const articles = await this.prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        take: limit,
        orderBy: [{ viewsCount: 'desc' }, { publishedAt: 'desc' }],
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true, username: true, avatar: true } },
          _count: { select: { bookmarks: true, comments: true } },
        },
      });

      if (articles.length === 0) return [];

      const articleSlugs = articles.map((a) => a.slug);
      const articleIds = articles.map((a) => a.id);

      const [articleEvents, readingHistories] = await Promise.all([
        this.prisma.analyticsEvent.findMany({
          where: {
            articleSlug: { in: articleSlugs },
            timestamp: { gte: startDate },
          },
          select: { articleSlug: true, eventType: true, visitorId: true },
        }),
        this.prisma.readingHistory.findMany({
          where: {
            articleId: { in: articleIds },
          },
          select: { articleId: true, completionPercentage: true },
        }),
      ]);

      return articles.map((art, idx) => {
        const eventsForArt = articleEvents.filter((e) => e.articleSlug === art.slug);
        const uniqueReaders = new Set(eventsForArt.map((e) => e.visitorId).filter(Boolean)).size;
        const codeCopies = eventsForArt.filter((e) => e.eventType === 'CODE_COPY').length;

        const historiesForArt = readingHistories.filter((h) => h.articleId === art.id);
        const avgScroll =
          historiesForArt.length > 0
            ? Math.round(
                historiesForArt.reduce((acc, h) => acc + (h.completionPercentage || 0), 0) /
                  historiesForArt.length
              )
            : 0;

        return {
          id: art.id,
          rank: idx + 1,
          title: art.title,
          slug: art.slug,
          categoryName: art.category?.name || 'Uncategorized',
          categorySlug: art.category?.slug || '',
          authorName: art.author?.name || 'Author',
          viewsCount: art.viewsCount || 0,
          uniqueReaders,
          readingTimeMinutes: art.readingTime || 0,
          scrollCompletionPercent: avgScroll,
          codeCopiesCount: codeCopies,
          bookmarksCount: art._count.bookmarks || 0,
          commentsCount: art._count.comments || 0,
          publishedAt: art.publishedAt || art.createdAt,
        };
      });
    } catch (err: any) {
      this.logger.error(`Error loading top blueprints: ${err.message}`);
      return [];
    }
  }

  /**
   * 5. Technology Taxonomy, Developer OS & Geo Matrix (Pure Database Telemetry)
   */
  async getTechAndGeo(timeWindow: string = '7d') {
    const { startDate } = this.resolveTimeIntervals(timeWindow);

    try {
      const [categories, technologies, osGroup, browserGroup, deviceGroup, countryGroup] =
        await Promise.all([
          this.prisma.category.findMany({
            include: { _count: { select: { articles: true } } },
            orderBy: { articles: { _count: 'desc' } },
            take: 8,
          }),
          this.prisma.technology.findMany({
            include: { _count: { select: { articles: true } } },
            orderBy: { articles: { _count: 'desc' } },
            take: 8,
          }),
          this.prisma.analyticsEvent.groupBy({
            by: ['os'],
            where: { timestamp: { gte: startDate }, os: { not: null } },
            _count: { os: true },
            orderBy: { _count: { os: 'desc' } },
          }),
          this.prisma.analyticsEvent.groupBy({
            by: ['browser'],
            where: { timestamp: { gte: startDate }, browser: { not: null } },
            _count: { browser: true },
            orderBy: { _count: { browser: 'desc' } },
          }),
          this.prisma.analyticsEvent.groupBy({
            by: ['device'],
            where: { timestamp: { gte: startDate }, device: { not: null } },
            _count: { device: true },
            orderBy: { _count: { device: 'desc' } },
          }),
          this.prisma.analyticsEvent.groupBy({
            by: ['country', 'countryName'],
            where: { timestamp: { gte: startDate }, country: { not: null } },
            _count: { country: true },
            orderBy: { _count: { country: 'desc' } },
            take: 10,
          }),
        ]);

      // Category breakdown (Actual article counts)
      const categoryShare = categories
        .filter((cat) => cat._count.articles > 0)
        .map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          count: cat._count.articles,
        }));

      // Stack breakdown (Actual article counts)
      const techShare = technologies
        .filter((tech) => tech._count.articles > 0)
        .map((tech) => ({
          name: tech.name,
          slug: tech.slug,
          count: tech._count.articles,
        }));

      // Developer OS breakdown
      const totalOs = osGroup.reduce((acc, g) => acc + g._count.os, 0);
      const osColorMap: Record<string, string> = {
        macOS: '#38bdf8',
        Linux: '#10b981',
        Windows: '#6366f1',
        iOS: '#f59e0b',
        Android: '#ec4899',
      };
      const operatingSystems = osGroup.map((g) => ({
        name: g.os || 'Unknown',
        percentage: totalOs > 0 ? Math.round((g._count.os / totalOs) * 100) : 0,
        count: g._count.os,
        color: osColorMap[g.os || ''] || '#94a3b8',
      }));

      // Browser breakdown
      const totalBrowser = browserGroup.reduce((acc, g) => acc + g._count.browser, 0);
      const browsers = browserGroup.map((g) => ({
        name: g.browser || 'Unknown',
        percentage: totalBrowser > 0 ? Math.round((g._count.browser / totalBrowser) * 100) : 0,
        count: g._count.browser,
      }));

      // Device breakdown
      const totalDevice = deviceGroup.reduce((acc, g) => acc + g._count.device, 0);
      const devices = deviceGroup.map((g) => ({
        name: g.device || 'Unknown',
        percentage: totalDevice > 0 ? Math.round((g._count.device / totalDevice) * 100) : 0,
        count: g._count.device,
      }));

      // Geographic countries breakdown
      const totalGeo = countryGroup.reduce((acc, g) => acc + g._count.country, 0);
      const countries = countryGroup.map((g) => ({
        code: g.country || 'OTHER',
        name: g.countryName || g.country || 'Other Regions',
        readers: g._count.country,
        percentage: totalGeo > 0 ? Math.round((g._count.country / totalGeo) * 100) : 0,
      }));

      return {
        categories: categoryShare,
        technologies: techShare,
        operatingSystems,
        browsers,
        devices,
        countries,
      };
    } catch (err: any) {
      this.logger.error(`Failed to aggregate tech and geo: ${err.message}`);
      return {
        categories: [],
        technologies: [],
        operatingSystems: [],
        browsers: [],
        devices: [],
        countries: [],
      };
    }
  }

  /**
   * 6. Search Intelligence & Zero-Result Gap Analysis (Pure Database Records)
   */
  async getSearchIntelligence(timeWindow: string = '7d') {
    const { startDate } = this.resolveTimeIntervals(timeWindow);

    try {
      const [topSearches, zeroResults] = await Promise.all([
        this.prisma.searchQueryLog.groupBy({
          by: ['query'],
          where: { timestamp: { gte: startDate }, resultsCount: { gt: 0 } },
          _count: { query: true },
          orderBy: { _count: { query: 'desc' } },
          take: 8,
        }),
        this.prisma.searchQueryLog.groupBy({
          by: ['query'],
          where: { timestamp: { gte: startDate }, resultsCount: 0 },
          _count: { query: true },
          orderBy: { _count: { query: 'desc' } },
          take: 6,
        }),
      ]);

      const topQueries = topSearches.map((s) => ({
        query: s.query,
        searchesCount: s._count.query,
      }));

      const contentGaps = zeroResults.map((s) => ({
        query: s.query,
        missedSearchesCount: s._count.query,
      }));

      const totalSearches =
        topQueries.reduce((acc, q) => acc + q.searchesCount, 0) +
        contentGaps.reduce((acc, g) => acc + g.missedSearchesCount, 0);

      return {
        totalSearches,
        topQueries,
        contentGaps,
      };
    } catch (err: any) {
      this.logger.error(`Error loading search intelligence: ${err.message}`);
      return {
        totalSearches: 0,
        topQueries: [],
        contentGaps: [],
      };
    }
  }

  /**
   * 7. Real-Time Active Readers Pulse (Last 5 Minutes from Database)
   */
  async getRealtimePulse() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    try {
      const activeEvents = await this.prisma.analyticsEvent.findMany({
        where: { timestamp: { gte: fiveMinutesAgo } },
        select: { visitorId: true, path: true, articleSlug: true, country: true },
      });

      const activeVisitorsSet = new Set(activeEvents.map((e) => e.visitorId).filter(Boolean));
      const activeReadersCount = activeVisitorsSet.size;

      // Group active pages
      const pathCounts: Record<string, { count: number; slug?: string }> = {};
      for (const ev of activeEvents) {
        const p = ev.path || '/';
        if (!pathCounts[p]) {
          pathCounts[p] = { count: 0, slug: ev.articleSlug || undefined };
        }
        pathCounts[p].count += 1;
      }

      const activePages = Object.entries(pathCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([path, data]) => ({
          title: data.slug ? data.slug.replace(/-/g, ' ') : path,
          path,
          readers: data.count,
        }));

      return {
        activeReaders: activeReadersCount,
        lastUpdated: new Date().toISOString(),
        activePages,
      };
    } catch (err: any) {
      this.logger.error(`Error getting realtime pulse: ${err.message}`);
      return {
        activeReaders: 0,
        lastUpdated: new Date().toISOString(),
        activePages: [],
      };
    }
  }

  // --- Helper Methods ---

  private resolveTimeIntervals(timeWindow: string) {
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    let isHourly = false;

    switch (timeWindow) {
      case '24h':
      case 'today':
        startDate = subHours(now, 24);
        prevStartDate = subHours(startDate, 24);
        isHourly = true;
        break;
      case '30d':
        startDate = startOfDay(subDays(now, 30));
        prevStartDate = startOfDay(subDays(startDate, 30));
        break;
      case '90d':
        startDate = startOfDay(subDays(now, 90));
        prevStartDate = startOfDay(subDays(startDate, 90));
        break;
      case 'all':
        startDate = startOfDay(subDays(now, 365));
        prevStartDate = startOfDay(subDays(startDate, 365));
        break;
      case '7d':
      default:
        startDate = startOfDay(subDays(now, 7));
        prevStartDate = startOfDay(subDays(startDate, 7));
        break;
    }

    const intervals = isHourly
      ? eachHourOfInterval({ start: startDate, end: now })
      : eachDayOfInterval({ start: startDate, end: endOfDay(now) });

    return { startDate, prevStartDate, isHourly, intervals };
  }

  private detectOs(userAgent?: string): string | null {
    if (!userAgent) return null;
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/windows|win32/i.test(userAgent)) return 'Windows';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
    if (/android/i.test(userAgent)) return 'Android';
    return null;
  }

  private detectBrowser(userAgent?: string): string | null {
    if (!userAgent) return null;
    if (/arc/i.test(userAgent)) return 'Arc';
    if (/edg/i.test(userAgent)) return 'Edge';
    if (/firefox|fxios/i.test(userAgent)) return 'Firefox';
    if (/chrome|crios/i.test(userAgent)) return 'Chrome';
    if (/safari/i.test(userAgent)) return 'Safari';
    return null;
  }

  private detectDevice(userAgent?: string): string | null {
    if (!userAgent) return null;
    if (/ipad|tablet/i.test(userAgent)) return 'Tablet';
    if (/mobile|iphone|android/i.test(userAgent)) return 'Mobile';
    return 'Desktop';
  }
}
