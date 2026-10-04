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
  provider?: string;
  apiKey?: string;
  customDomain?: string;
  workspaceId?: string;
  customEndpoint?: string;
  customMethod?: string;
  customHeaders?: string;
  customBodyTemplate?: string;
  customResponsePath?: string;
  autoValidate?: boolean;
}

export interface ShortUrlResult {
  shortUrl: string;
  isShortened: boolean;
  provider: string;
  originalUrl: string;
  fromDb?: boolean;
  healed?: boolean;
  error?: string;
}

export interface SyncAllOptions {
  forceRegenerate?: boolean;
  provider?: string;
  apiKey?: string;
  customDomain?: string;
  workspaceId?: string;
  customEndpoint?: string;
  customMethod?: string;
  customHeaders?: string;
  customBodyTemplate?: string;
  customResponsePath?: string;
  autoValidate?: boolean;
}

export interface SyncErrorDetail {
  articleId: string;
  slug: string;
  title: string;
  reason: string;
}

export interface SyncArticlesResult {
  total: number;
  updated: number;
  validated: number;
  failed: number;
  activeProvider: string;
  message: string;
  errorSummary?: string;
  errors: SyncErrorDetail[];
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
   * Gather current shortener runtime configuration with support for dynamic overrides
   */
  private async getRuntimeOptions(
    overrideUrl: string,
    title?: string,
    slug?: string,
    articleId?: string,
    overrides?: Partial<GenerateShortUrlDto>,
  ): Promise<{
    provider: string;
    options: ShortenOptions;
    autoValidate: boolean;
  }> {
    const rawProvider =
      overrides?.provider !== undefined
        ? overrides.provider
        : (await this.getSetting('shortenerProvider', 'SHORTENER_PROVIDER')) || 'none';
    const apiKey =
      overrides?.apiKey !== undefined
        ? overrides.apiKey
        : await this.getSetting('shortenerApiKey', 'SHORTENER_API_KEY');
    const customDomain =
      overrides?.customDomain !== undefined
        ? overrides.customDomain
        : await this.getSetting('shortenerCustomDomain', 'SHORTENER_CUSTOM_DOMAIN');
    const workspaceId =
      overrides?.workspaceId !== undefined
        ? overrides.workspaceId
        : await this.getSetting('shortenerWorkspaceId', 'SHORTENER_WORKSPACE_ID');
    const customEndpoint =
      overrides?.customEndpoint !== undefined
        ? overrides.customEndpoint
        : await this.getSetting('shortenerCustomEndpoint', 'SHORTENER_CUSTOM_ENDPOINT');
    const customMethod =
      overrides?.customMethod !== undefined
        ? overrides.customMethod
        : (await this.getSetting('shortenerCustomMethod', 'SHORTENER_CUSTOM_METHOD')) || 'POST';
    const customHeaders =
      overrides?.customHeaders !== undefined
        ? overrides.customHeaders
        : await this.getSetting('shortenerCustomHeaders', 'SHORTENER_CUSTOM_HEADERS');
    const customBodyTemplate =
      overrides?.customBodyTemplate !== undefined
        ? overrides.customBodyTemplate
        : await this.getSetting('shortenerCustomBodyTemplate', 'SHORTENER_CUSTOM_BODY_TEMPLATE');
    const customResponsePath =
      overrides?.customResponsePath !== undefined
        ? overrides.customResponsePath
        : await this.getSetting('shortenerCustomResponsePath', 'SHORTENER_CUSTOM_RESPONSE_PATH');
    const autoValidateSetting = await this.getSetting('shortenerAutoValidate');
    const autoValidate =
      overrides?.autoValidate !== undefined
        ? overrides.autoValidate
        : autoValidateSetting !== 'false';
    const siteUrl = (await this.getSetting('siteUrl')) || 'https://nexusnation.in';

    return {
      provider: (rawProvider || 'none').toLowerCase(),
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
      dto,
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
      // Shortlinks are strictly generated and persisted ONLY when the article status is PUBLISHED
      if (article.status !== 'PUBLISHED') {
        return {
          shortUrl: targetUrl,
          isShortened: false,
          provider: 'draft_bypass',
          originalUrl: targetUrl,
        };
      }

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
            const errMsg = err.message || `Provider [${provider}] failed`;
            this.logger.error(`Shortener provider [${provider}] failed for article "${article.title}": ${errMsg}`);
            return {
              shortUrl: article.shortUrl || targetUrl,
              isShortened: Boolean(article.shortUrl),
              provider: article.shortUrl ? 'stored' : 'fallback',
              originalUrl: targetUrl,
              error: errMsg,
            };
          }
        } else {
          return {
            shortUrl: article.shortUrl || targetUrl,
            isShortened: Boolean(article.shortUrl),
            provider: 'fallback',
            originalUrl: targetUrl,
            error: `Unsupported provider "${provider}"`,
          };
        }
      }

      // Fallback for article when provider disabled or errored
      return {
        shortUrl: article.shortUrl || targetUrl,
        isShortened: Boolean(article.shortUrl),
        provider: article.shortUrl ? (article.shortUrlProvider || 'stored') : 'none',
        originalUrl: targetUrl,
        error: article.shortUrl ? undefined : 'Shortener provider is currently disabled ("none").',
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
        error: 'Shortener provider is currently set to "none".',
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
        const errMsg = err.message || `Provider [${provider}] failed`;
        this.logger.error(`Shortener provider [${provider}] failed: ${errMsg}`);
        return {
          shortUrl: targetUrl,
          isShortened: false,
          provider: 'fallback',
          originalUrl: targetUrl,
          error: errMsg,
        };
      }
    }

    // Graceful fallback to canonical target
    return {
      shortUrl: targetUrl,
      isShortened: false,
      provider: 'fallback',
      originalUrl: targetUrl,
      error: `Unsupported provider "${provider}"`,
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

    if (article.status !== 'PUBLISHED') {
      throw new NotFoundException(`Article is currently not published.`);
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
  async syncAllArticles(options: SyncAllOptions = {}): Promise<SyncArticlesResult> {
    const runtime = await this.getRuntimeOptions('https://nexusnation.in/articles/probe', undefined, undefined, undefined, options);
    const activeProvider = runtime.provider;

    const articles = await this.prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, slug: true, title: true, shortUrl: true, shortUrlProvider: true },
    });

    if (articles.length === 0) {
      return {
        total: 0,
        updated: 0,
        validated: 0,
        failed: 0,
        activeProvider,
        message: 'No published articles found in database to sync.',
        errors: [],
      };
    }

    if (activeProvider === 'none') {
      const errorMsg = 'Shortener provider is currently disabled ("none"). Select an active provider (Dub.co, Bitly, TinyURL, Custom API, or Native) and click "Save Configuration" before syncing.';
      return {
        total: articles.length,
        updated: 0,
        validated: 0,
        failed: articles.length,
        activeProvider,
        message: `Sync skipped for ${articles.length} articles: Shortener provider is disabled ("none").`,
        errorSummary: errorMsg,
        errors: articles.map((art) => ({
          articleId: art.id,
          slug: art.slug,
          title: art.title,
          reason: 'Provider is set to "none". Please select and configure a provider in Dev Config first.',
        })),
      };
    }

    let updated = 0;
    let validated = 0;
    let failed = 0;
    const errors: SyncErrorDetail[] = [];
    const reasonCounts: Record<string, number> = {};

    for (const art of articles) {
      try {
        const res = await this.generateShortUrl({
          url: `https://nexusnation.in/articles/${art.slug}`,
          articleId: art.id,
          title: art.title,
          forceRegenerate: options.forceRegenerate,
          ...options,
        });

        if (res.isShortened && res.shortUrl) {
          if (res.healed || !art.shortUrl || options.forceRegenerate) {
            updated++;
          } else {
            validated++;
          }
        } else {
          failed++;
          const reason =
            res.error ||
            (art.shortUrl
              ? 'Stored short link validation probe failed'
              : `Provider "${activeProvider}" failed to generate short link`);
          errors.push({
            articleId: art.id,
            slug: art.slug,
            title: art.title,
            reason,
          });
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        }
      } catch (err: any) {
        failed++;
        const reason = err.message || 'Unexpected exception during sync';
        errors.push({
          articleId: art.id,
          slug: art.slug,
          title: art.title,
          reason,
        });
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      }
    }

    let errorSummary: string | undefined = undefined;
    if (errors.length > 0) {
      const topReasons = Object.entries(reasonCounts)
        .map(([r, count]) => `${count}x: ${r}`)
        .join('; ');
      errorSummary = `Provider [${activeProvider.toUpperCase()}] issues detected: ${topReasons}`;
    }

    return {
      total: articles.length,
      updated,
      validated,
      failed,
      activeProvider,
      message: `Completed processing ${articles.length} articles (${activeProvider.toUpperCase()}): ${updated} updated/healed, ${validated} validated healthy, ${failed} failed/skipped.`,
      errorSummary,
      errors,
    };
  }
}
