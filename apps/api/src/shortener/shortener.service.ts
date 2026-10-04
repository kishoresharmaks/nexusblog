import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IShortenerProvider, ShortenOptions, ShortenerTestResult } from './interfaces/shortener-provider.interface';
import { DubProvider } from './providers/dub.provider';
import { BitlyProvider } from './providers/bitly.provider';
import { TinyUrlProvider } from './providers/tinyurl.provider';
import { CustomApiProvider } from './providers/custom-api.provider';
import { NativeProvider } from './providers/native.provider';
import { checkLinkHealth } from './utils/link-health.util';

export interface GenerateShortUrlDto {
  url: string;
  articleId?: string;
  title?: string;
  platform?: 'twitter' | 'linkedin' | 'reddit' | 'whatsapp' | 'generic' | string;
  forceRegenerate?: boolean;
}

export interface ShortUrlResult {
  shortUrl: string;
  isShortened: boolean;
  provider: string;
  originalUrl: string;
  fromDb?: boolean;
  healed?: boolean;
}

@Injectable()
export class ShortenerService {
  private readonly logger = new Logger(ShortenerService.name);
  private readonly providers = new Map<string, IShortenerProvider>();
  private readonly memoryCache = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {
    // Register provider adapters (Strategy Pattern)
    this.registerProvider(new DubProvider());
    this.registerProvider(new BitlyProvider());
    this.registerProvider(new TinyUrlProvider());
    this.registerProvider(new CustomApiProvider());
    this.registerProvider(new NativeProvider());
  }

  private registerProvider(provider: IShortenerProvider) {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  /**
   * Helper to retrieve raw decrypted / set setting value from database or environment
   */
  private async getSetting(key: string, envFallbackKey?: string): Promise<string> {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key },
      });
      if (setting && setting.value && setting.value.trim().length > 0) {
        return setting.value.trim();
      }
      if (envFallbackKey && process.env[envFallbackKey]) {
        return (process.env[envFallbackKey] || '').trim();
      }
    } catch {
      // Return empty if database query fails
    }
    return '';
  }

  /**
   * Append platform UTM parameters to destination URL
   */
  private buildUtmUrl(rawUrl: string, platform?: string): string {
    if (!platform || platform === 'generic') {
      return rawUrl;
    }

    try {
      const parsed = new URL(rawUrl);
      if (!parsed.searchParams.has('utm_source')) {
        parsed.searchParams.set('utm_source', platform);
        parsed.searchParams.set('utm_medium', 'social_share');
        parsed.searchParams.set('utm_campaign', 'nexusblog_share');
      }
      return parsed.toString();
    } catch {
      return rawUrl;
    }
  }

  /**
   * Extract article slug or ID from URL path (e.g. /articles/some-slug)
   */
  private extractSlugFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const match = parsed.pathname.match(/\/articles\/([^\/\?#]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      const match = url.match(/\/articles\/([^\/\?#]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    }
  }

  /**
   * Gather current shortener runtime configuration
   */
  private async getRuntimeOptions(overrideUrl: string, title?: string, slug?: string, articleId?: string): Promise<{
    provider: string;
    options: ShortenOptions;
    autoValidate: boolean;
  }> {
    const provider = (await this.getSetting('shortenerProvider', 'SHORTENER_PROVIDER')) || 'none';
    const apiKey = await this.getSetting('shortenerApiKey', 'SHORTENER_API_KEY');
    const customDomain = await this.getSetting('shortenerCustomDomain', 'SHORTENER_CUSTOM_DOMAIN');
    const workspaceId = await this.getSetting('shortenerWorkspaceId', 'SHORTENER_WORKSPACE_ID');
    const customEndpoint = await this.getSetting('shortenerCustomEndpoint', 'SHORTENER_CUSTOM_ENDPOINT');
    const customMethod = (await this.getSetting('shortenerCustomMethod', 'SHORTENER_CUSTOM_METHOD')) || 'POST';
    const customHeaders = await this.getSetting('shortenerCustomHeaders', 'SHORTENER_CUSTOM_HEADERS');
    const customBodyTemplate = await this.getSetting('shortenerCustomBodyTemplate', 'SHORTENER_CUSTOM_BODY_TEMPLATE');
    const customResponsePath = await this.getSetting('shortenerCustomResponsePath', 'SHORTENER_CUSTOM_RESPONSE_PATH');
    const autoValidateSetting = await this.getSetting('shortenerAutoValidate');
    const autoValidate = autoValidateSetting !== 'false';
    const siteUrl = (await this.getSetting('siteUrl')) || 'https://nexusnation.in';

    return {
      provider: provider.toLowerCase(),
      autoValidate,
      options: {
        url: overrideUrl,
        title,
        slug,
        articleId,
        apiKey,
        customDomain,
        workspaceId,
        customEndpoint,
        customMethod,
        customHeaders,
        customBodyTemplate,
        customResponsePath,
        siteUrl,
      },
    };
  }

  /**
   * Core generation and persistence engine
   */
  async generateShortUrl(dto: GenerateShortUrlDto): Promise<ShortUrlResult> {
    const targetUrl = this.buildUtmUrl(dto.url, dto.platform);
    const { provider, options, autoValidate } = await this.getRuntimeOptions(
      targetUrl,
      dto.title,
      undefined,
      dto.articleId,
    );

    // 1. Check if this request corresponds to an existing article in the database
    let article: any = null;
    const targetSlug = this.extractSlugFromUrl(dto.url);

    if (dto.articleId) {
      article = await this.prisma.article.findUnique({
        where: { id: dto.articleId },
      });
    } else if (targetSlug) {
      article = await this.prisma.article.findUnique({
        where: { slug: targetSlug.toLowerCase() },
      });
    }

    // 2. Persistent Link Validation & Recovery Pipeline
    if (article) {
      options.slug = article.slug;
      options.articleId = article.id;
      options.title = options.title || article.title;

      // Case A: Link already exists in Database & No Force Regeneration requested
      if (article.shortUrl && !dto.forceRegenerate) {
        // If auto-validation is enabled, verify the link is alive
        if (autoValidate) {
          const isAlive = await checkLinkHealth(article.shortUrl, 2000);
          if (isAlive) {
            return {
              shortUrl: article.shortUrl,
              isShortened: true,
              provider: article.shortUrlProvider || 'stored',
              originalUrl: targetUrl,
              fromDb: true,
            };
          } else {
            this.logger.warn(
              `Stored short link [${article.shortUrl}] for article "${article.title}" is unreachable. Initiating auto-healing recovery...`,
            );
          }
        } else {
          // If autoValidate is disabled, return stored link directly (0ms)
          return {
            shortUrl: article.shortUrl,
            isShortened: true,
            provider: article.shortUrlProvider || 'stored',
            originalUrl: targetUrl,
            fromDb: true,
          };
        }
      }

      // Case B: Generate fresh shortlink and save to Database permanently
      if (provider !== 'none') {
        const adapter = this.providers.get(provider);
        if (adapter) {
          try {
            const canonicalArticleUrl = `${options.siteUrl}/articles/${article.slug}`;
            const linkOptions = { ...options, url: canonicalArticleUrl };
            const newShortLink = await adapter.generate(linkOptions);

            if (newShortLink) {
              let shortCode: string | undefined = undefined;
              if (provider === 'native') {
                const match = newShortLink.match(/\/s\/([^\/\?#]+)/);
                if (match) shortCode = match[1];
              }

              // Update database record so the link is permanently persisted
              await this.prisma.article.update({
                where: { id: article.id },
                data: {
                  shortUrl: newShortLink,
                  shortUrlProvider: provider,
                  ...(shortCode ? { shortCode } : {}),
                },
              });

              return {
                shortUrl: newShortLink,
                isShortened: true,
                provider,
                originalUrl: targetUrl,
                fromDb: true,
                healed: Boolean(article.shortUrl),
              };
            }
          } catch (err: any) {
            this.logger.error(`Shortener provider [${provider}] failed for article "${article.title}": ${err.message}`);
          }
        }
      }

      // Fallback for article when provider disabled or errored
      return {
        shortUrl: article.shortUrl || targetUrl,
        isShortened: Boolean(article.shortUrl),
        provider: article.shortUrl ? 'stored' : 'fallback',
        originalUrl: targetUrl,
      };
    }

    // 3. Non-article URL handling with memory cache
    const cacheKey = `${targetUrl}:${dto.platform || 'generic'}`;
    if (this.memoryCache.has(cacheKey) && !dto.forceRegenerate) {
      return {
        shortUrl: this.memoryCache.get(cacheKey)!,
        isShortened: true,
        provider: 'cache',
        originalUrl: targetUrl,
      };
    }

    if (provider === 'none') {
      return {
        shortUrl: targetUrl,
        isShortened: false,
        provider: 'none',
        originalUrl: targetUrl,
      };
    }

    const adapter = this.providers.get(provider);
    if (adapter) {
      try {
        const generated = await adapter.generate(options);
        if (generated) {
          this.memoryCache.set(cacheKey, generated);
          return {
            shortUrl: generated,
            isShortened: true,
            provider,
            originalUrl: targetUrl,
          };
        }
      } catch (err: any) {
        this.logger.error(`Shortener provider [${provider}] failed: ${err.message}`);
      }
    }

    // Graceful fallback to canonical target
    return {
      shortUrl: targetUrl,
      isShortened: false,
      provider: 'fallback',
      originalUrl: targetUrl,
    };
  }

  /**
   * Diagnostic test connection for Admin Settings
   */
  async testConnection(payload: {
    provider: string;
    apiKey?: string;
    customDomain?: string;
    workspaceId?: string;
    customEndpoint?: string;
    customMethod?: string;
    customHeaders?: string;
    customBodyTemplate?: string;
    customResponsePath?: string;
  }): Promise<ShortenerTestResult> {
    const providerName = (payload.provider || 'none').toLowerCase();
    const adapter = this.providers.get(providerName);

    if (!adapter) {
      return {
        success: false,
        message: `Unsupported provider "${payload.provider}". Available: dub, bitly, tinyurl, custom, native.`,
      };
    }

    const siteUrl = (await this.getSetting('siteUrl')) || 'https://nexusnation.in';
    const testOptions: ShortenOptions = {
      url: `${siteUrl}/articles/test-preview`,
      title: 'NexusNation Shortener Test',
      slug: 'test-preview',
      apiKey: payload.apiKey,
      customDomain: payload.customDomain,
      workspaceId: payload.workspaceId,
      customEndpoint: payload.customEndpoint,
      customMethod: payload.customMethod || 'POST',
      customHeaders: payload.customHeaders,
      customBodyTemplate: payload.customBodyTemplate,
      customResponsePath: payload.customResponsePath,
      siteUrl,
    };

    if (adapter.testConnection) {
      return adapter.testConnection(testOptions);
    }

    try {
      const sample = await adapter.generate(testOptions);
      if (sample) {
        return {
          success: true,
          message: `Connected to ${providerName.toUpperCase()} successfully! Test link generated.`,
          sampleShortUrl: sample,
        };
      }
      return {
        success: false,
        message: `Provider ${providerName} returned an empty response.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || `Failed to connect to ${providerName}.`,
      };
    }
  }

  /**
   * Resolve native internal short code (/s/:code) to canonical article URL
   */
  async resolveNativeShortCode(code: string): Promise<{ destinationUrl: string; article: any }> {
    if (!code) {
      throw new NotFoundException('Short code is required');
    }

    const article = await this.prisma.article.findUnique({
      where: { shortCode: code },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
      },
    });

    if (!article) {
      throw new NotFoundException(`Short link code '${code}' was not found.`);
    }

    const siteUrl = (await this.getSetting('siteUrl')) || 'https://nexusnation.in';
    return {
      destinationUrl: `${siteUrl}/articles/${article.slug}`,
      article,
    };
  }

  /**
   * Admin Tool: Bulk Sync, Health Check & Backfill All Published Article Shortlinks
   */
  async syncAllArticles(options: { forceRegenerate?: boolean } = {}) {
    const articles = await this.prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, slug: true, title: true, shortUrl: true, shortUrlProvider: true },
    });

    let updated = 0;
    let validated = 0;
    let failed = 0;

    for (const art of articles) {
      try {
        const res = await this.generateShortUrl({
          url: `https://nexusnation.in/articles/${art.slug}`,
          articleId: art.id,
          title: art.title,
          forceRegenerate: options.forceRegenerate,
        });

        if (res.isShortened && res.shortUrl) {
          if (res.healed || !art.shortUrl || options.forceRegenerate) {
            updated++;
          } else {
            validated++;
          }
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return {
      total: articles.length,
      updated,
      validated,
      failed,
      message: `Completed processing ${articles.length} articles: ${updated} updated/healed, ${validated} validated healthy, ${failed} failed/skipped.`,
    };
  }
}
