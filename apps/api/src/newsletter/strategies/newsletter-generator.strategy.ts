import { PrismaService } from '../../prisma/prisma.service';
import { ArticleStatus } from '@prisma/client';
import { EmailTemplateBuilder } from '../../mail/email-template.builder';

export interface GenerateTemplateDto {
  preset: 'weekly_digest' | 'spotlight' | 'trending_roundup' | 'custom';
  articleIds?: string[];
  spotlightSlug?: string;
  customIntro?: string;
  customSubject?: string;
  siteUrl?: string;
}

export interface GeneratedTemplateResult {
  preset: string;
  subject: string;
  previewText: string;
  markdownContent: string;
  htmlContent: string;
  articleIds: string[];
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category?: string;
    viewsCount: number;
    readingTime: number;
    coverImage?: string;
  }>;
}

/**
 * Appends standard newsletter UTM parameters for analytics tracking
 */
export function buildNewsletterUtmUrl(baseUrl: string, campaignSlug: string, contentSlug?: string): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'nexusblog_newsletter');
    url.searchParams.set('utm_medium', 'email');
    url.searchParams.set('utm_campaign', campaignSlug);
    if (contentSlug) {
      url.searchParams.set('utm_content', contentSlug);
    }
    return url.toString();
  } catch {
    const separator = baseUrl.includes('?') ? '&' : '?';
    const contentParam = contentSlug ? `&utm_content=${encodeURIComponent(contentSlug)}` : '';
    return `${baseUrl}${separator}utm_source=nexusblog_newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(campaignSlug)}${contentParam}`;
  }
}

/**
 * Base strategy interface for newsletter generators
 */
export interface INewsletterGeneratorStrategy {
  generate(prisma: PrismaService, dto: GenerateTemplateDto, siteUrl: string): Promise<GeneratedTemplateResult>;
}

/**
 * Strategy 1: Weekly Multi-Section Digest
 * 1 Hero Featured Article + 3 Latest Releases + 2 Trending + Architecture Takeaways
 */
export class WeeklyDigestStrategy implements INewsletterGeneratorStrategy {
  async generate(prisma: PrismaService, dto: GenerateTemplateDto, siteUrl: string): Promise<GeneratedTemplateResult> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const campaignSlug = `weekly_digest_${todayStr}`;

    // 1. Fetch Candidate Published Articles
    const [featured, latest, popular] = await Promise.all([
      prisma.article.findFirst({
        where: { status: ArticleStatus.PUBLISHED, featured: true },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
        take: 6,
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { viewsCount: 'desc' },
        take: 4,
        include: { category: true, author: true },
      }),
    ]);

    // Select Hero article
    const hero = featured || latest[0];
    if (!hero) {
      throw new Error('No published articles available to generate newsletter.');
    }

    // Select distinct secondary articles (avoid duplicate of hero)
    const secondaryList = latest.filter((a) => a.id !== hero.id).slice(0, 3);
    // Add 1-2 trending if not already included
    popular.forEach((p) => {
      if (p.id !== hero.id && !secondaryList.some((s) => s.id === p.id) && secondaryList.length < 5) {
        secondaryList.push(p);
      }
    });

    const allArticles = [hero, ...secondaryList];
    const articleIds = allArticles.map((a) => a.id);

    const subject =
      dto.customSubject ||
      `NexusNation Engineering Dispatch: ${hero.title}`;
    const previewText =
      hero.excerpt ? hero.excerpt.slice(0, 120) : 'Weekly architectural deep-dives and engineering blueprints.';

    const builder = new EmailTemplateBuilder()
      .setSubject(subject)
      .setPreviewText(previewText)
      .setHeader({
        siteUrl,
        siteName: 'NexusNation',
        editionTag: 'Weekly Dispatch',
      });

    // Intro
    const introMd =
      dto.customIntro ||
      `Hi Engineers,\n\nWelcome to this week's **Nexus Engineering Newsletter**. In this edition, we break down high-scale systems architecture, production-grade retrieval algorithms, and resilient backend patterns.`;
    builder.setIntro(
      `<p style="margin:0 0 14px 0;line-height:1.75;color:#d4d4d8;font-size:14px;">Hi Engineers,</p><p style="margin:0 0 14px 0;line-height:1.75;color:#d4d4d8;font-size:14px;">Welcome to this week's <strong>Nexus Engineering Newsletter</strong>. In this edition, we explore high-scale distributed systems architecture, concurrency primitives, and production-grade software patterns.</p>`,
      introMd,
    );

    // Hero Section
    const heroUtmUrl = buildNewsletterUtmUrl(`${siteUrl}/articles/${hero.slug}`, campaignSlug, 'hero');
    builder.setHeroArticle({
      title: hero.title,
      excerpt: hero.excerpt,
      slug: hero.slug,
      url: heroUtmUrl,
      coverImage: hero.coverImage || undefined,
      category: hero.category?.name,
      readingTime: hero.readingTime,
      difficulty: hero.difficulty,
      authorName: hero.author?.name,
    });

    // Secondary Articles (3-Column Grid)
    const secondaryPayloads = secondaryList.map((art, idx) => ({
      title: art.title,
      excerpt: art.excerpt,
      slug: art.slug,
      url: buildNewsletterUtmUrl(`${siteUrl}/articles/${art.slug}`, campaignSlug, `secondary_${idx + 1}`),
      coverImage: art.coverImage || undefined,
      category: art.category?.name,
      readingTime: art.readingTime,
      difficulty: art.difficulty,
    }));
    builder.setSecondaryArticles(secondaryPayloads);

    // Code Example
    builder.setCodeSnippet(
      `// Reciprocal Rank Fusion (RRF) for Hybrid Search\nconst rrfScore = (rank: number, k = 60): number => {\n  return 1 / (k + rank);\n};\n\nconst score = rrfScore(1);\n// Combine dense vector & keyword BM25 rankings`,
      'TypeScript',
      'Code Example',
    );

    // Key Takeaways from hero
    const takeaways = (hero.keyTakeaways && hero.keyTakeaways.length > 0)
      ? hero.keyTakeaways
      : [
          'Design resilient fallback pathways and circuit breakers across inter-service RPC boundaries.',
          'Optimize memory allocation patterns and cache lines to sustain high throughput with sub-millisecond p99 latencies.',
          'Embrace idempotent message processing to survive unexpected distributed partition events.',
        ];
    builder.setKeyTakeaways(takeaways);

    return {
      preset: 'weekly_digest',
      subject,
      previewText,
      markdownContent: builder.compileMarkdown(),
      htmlContent: builder.compileHtml(),
      articleIds,
      articles: allArticles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        category: a.category?.name,
        viewsCount: a.viewsCount,
        readingTime: a.readingTime,
        coverImage: a.coverImage || undefined,
      })),
    };
  }
}

/**
 * Strategy 2: Deep-Dive Spotlight
 * Focus on 1 major technical architectural blueprint
 */
export class SpotlightStrategy implements INewsletterGeneratorStrategy {
  async generate(prisma: PrismaService, dto: GenerateTemplateDto, siteUrl: string): Promise<GeneratedTemplateResult> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const campaignSlug = `spotlight_${todayStr}`;

    let article = null;
    if (dto.spotlightSlug) {
      article = await prisma.article.findUnique({
        where: { slug: dto.spotlightSlug.toLowerCase() },
        include: { category: true, author: true },
      });
    }

    if (!article) {
      article = await prisma.article.findFirst({
        where: { status: ArticleStatus.PUBLISHED, type: 'SYSTEM_DESIGN' },
        orderBy: { viewsCount: 'desc' },
        include: { category: true, author: true },
      });
    }

    if (!article) {
      article = await prisma.article.findFirst({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, author: true },
      });
    }

    if (!article) {
      throw new Error('No published article found for Spotlight newsletter.');
    }

    const subject = dto.customSubject || `Architectural Deep Dive: ${article.title}`;
    const previewText = article.excerpt ? article.excerpt.slice(0, 120) : 'In-depth architectural analysis and implementation guide.';

    const utmUrl = buildNewsletterUtmUrl(`${siteUrl}/articles/${article.slug}`, campaignSlug, 'spotlight');

    const builder = new EmailTemplateBuilder()
      .setSubject(subject)
      .setPreviewText(previewText)
      .setHeader({
        siteUrl,
        siteName: 'NexusNation',
        editionTag: 'Deep-Dive Spotlight',
      });

    const intro =
      dto.customIntro ||
      `Hi Engineers,\n\nWelcome to a specialized **NexusNation Deep-Dive Spotlight**. Today we examine **${article.title}** from first principles to production readiness.`;
    builder.setIntro(
      `<p style="margin:0 0 14px 0;line-height:1.7;color:#cbd5e1;font-size:14px;">Hi Engineers,</p><p style="margin:0 0 14px 0;line-height:1.7;color:#cbd5e1;font-size:14px;">Welcome to a specialized <strong>NexusNation Deep-Dive Spotlight</strong>. Today we break down <strong>${article.title}</strong> from core principles to high-throughput production deployment.</p>`,
      intro,
    );

    builder.setHeroArticle({
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      url: utmUrl,
      coverImage: article.coverImage || undefined,
      category: article.category?.name,
      readingTime: article.readingTime,
      difficulty: article.difficulty,
      authorName: article.author?.name,
    });

    builder.setCodeSnippet(
      `// High-Throughput Stream Ingestion & Processing\nconst processBatch = async <T>(events: T[]): Promise<void> => {\n  await pipeline.flush(events, { concurrency: 16 });\n};\n\nawait processBatch(ingestionBuffer);`,
      'TypeScript',
      'Architecture Blueprint',
    );

    if (article.keyTakeaways && article.keyTakeaways.length > 0) {
      builder.setKeyTakeaways(article.keyTakeaways);
    }

    if (article.prerequisites && article.prerequisites.length > 0) {
      builder.addCallout({
        type: 'info',
        title: 'Core Prerequisites & Context',
        content: article.prerequisites.join(' &bull; '),
      });
    }

    return {
      preset: 'spotlight',
      subject,
      previewText,
      markdownContent: builder.compileMarkdown(),
      htmlContent: builder.compileHtml(),
      articleIds: [article.id],
      articles: [
        {
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          category: article.category?.name,
          viewsCount: article.viewsCount,
          readingTime: article.readingTime,
          coverImage: article.coverImage || undefined,
        },
      ],
    };
  }
}

/**
 * Strategy 3: Trending Tech Roundup
 * Top 5 highest engagement & read articles
 */
export class TrendingRoundupStrategy implements INewsletterGeneratorStrategy {
  async generate(prisma: PrismaService, dto: GenerateTemplateDto, siteUrl: string): Promise<GeneratedTemplateResult> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const campaignSlug = `trending_roundup_${todayStr}`;

    const articles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { viewsCount: 'desc' },
      take: 5,
      include: { category: true, author: true },
    });

    if (articles.length === 0) {
      throw new Error('No published articles available for Trending Roundup.');
    }

    const hero = articles[0];
    const secondary = articles.slice(1);

    const subject = dto.customSubject || `Top Trending Tech Guides & System Design on Nexus`;
    const previewText = `Explore the most-read technical architecture blueprints across the developer community.`;

    const builder = new EmailTemplateBuilder()
      .setSubject(subject)
      .setPreviewText(previewText)
      .setHeader({
        siteUrl,
        siteName: 'Nexus',
        editionTag: 'Community Trends',
      });

    const intro =
      dto.customIntro ||
      `Hi Engineers,\n\nHere are the top-rated and most frequently referenced system design guides on **Nexus** this month.`;
    builder.setIntro(
      `<p style="margin:0 0 14px 0;line-height:1.75;color:#d4d4d8;font-size:14px;">Hi Engineers,</p><p style="margin:0 0 14px 0;line-height:1.75;color:#d4d4d8;font-size:14px;">Here are the top-rated and most frequently referenced technical architecture guides on <strong>Nexus</strong> across the engineering community.</p>`,
      intro,
    );

    builder.setHeroArticle({
      title: hero.title,
      excerpt: hero.excerpt,
      slug: hero.slug,
      url: buildNewsletterUtmUrl(`${siteUrl}/articles/${hero.slug}`, campaignSlug, 'trending_1'),
      coverImage: hero.coverImage || undefined,
      category: hero.category?.name,
      readingTime: hero.readingTime,
      difficulty: hero.difficulty,
      authorName: hero.author?.name,
    });

    builder.setSecondaryArticles(
      secondary.map((a, idx) => ({
        title: a.title,
        excerpt: a.excerpt,
        slug: a.slug,
        url: buildNewsletterUtmUrl(`${siteUrl}/articles/${a.slug}`, campaignSlug, `trending_${idx + 2}`),
        coverImage: a.coverImage || undefined,
        category: a.category?.name,
        readingTime: a.readingTime,
        difficulty: a.difficulty,
      })),
    );

    builder.setCodeSnippet(
      `// Distributed Rate Limiting (Token Bucket)\ninterface RateLimiter {\n  consume(key: string, tokens: number): Promise<boolean>;\n}\n\nconst allowed = await limiter.consume('api:client_1', 1);`,
      'TypeScript',
      'Production Pattern',
    );

    return {
      preset: 'trending_roundup',
      subject,
      previewText,
      markdownContent: builder.compileMarkdown(),
      htmlContent: builder.compileHtml(),
      articleIds: articles.map((a) => a.id),
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        category: a.category?.name,
        viewsCount: a.viewsCount,
        readingTime: a.readingTime,
        coverImage: a.coverImage || undefined,
      })),
    };
  }
}
