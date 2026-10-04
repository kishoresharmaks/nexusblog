import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GenerateShortUrlDto {
  url: string;
  articleId?: string;
  title?: string;
  platform?: 'twitter' | 'linkedin' | 'reddit' | 'whatsapp' | 'generic' | string;
}

export interface ShortUrlResult {
  shortUrl: string;
  isShortened: boolean;
  provider: string;
  originalUrl: string;
}

@Injectable()
export class ShortenerService {
  private readonly logger = new Logger(ShortenerService.name);
  private readonly cache = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to retrieve raw decrypted / set setting value from database or environment
   */
  private async getSetting(key: string, envFallbackKey?: string): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    if (setting && setting.value && setting.value.trim().length > 0) {
      return setting.value.trim();
    }
    if (envFallbackKey && process.env[envFallbackKey]) {
      return (process.env[envFallbackKey] || '').trim();
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
   * Main entry point to generate a shortened URL on demand with fallback & memory caching
   */
  async generateShortUrl(dto: GenerateShortUrlDto): Promise<ShortUrlResult> {
    const targetUrl = this.buildUtmUrl(dto.url, dto.platform);
    const cacheKey = `${targetUrl}:${dto.platform || 'generic'}`;

    if (this.cache.has(cacheKey)) {
      return {
        shortUrl: this.cache.get(cacheKey)!,
        isShortened: true,
        provider: 'cache',
        originalUrl: targetUrl,
      };
    }

    const provider = (await this.getSetting('shortenerProvider', 'SHORTENER_PROVIDER')) || 'none';
    const apiKey = await this.getSetting('shortenerApiKey', 'SHORTENER_API_KEY');
    const customDomain = await this.getSetting('shortenerCustomDomain', 'SHORTENER_CUSTOM_DOMAIN');
    const workspaceId = await this.getSetting('shortenerWorkspaceId', 'SHORTENER_WORKSPACE_ID');

    if (!provider || provider === 'none' || !apiKey) {
      return {
        shortUrl: targetUrl,
        isShortened: false,
        provider: 'none',
        originalUrl: targetUrl,
      };
    }

    try {
      let shortLink: string | null = null;

      switch (provider.toLowerCase()) {
        case 'dub':
          shortLink = await this.createWithDub(targetUrl, apiKey, customDomain, workspaceId, dto.title);
          break;
        case 'bitly':
          shortLink = await this.createWithBitly(targetUrl, apiKey, customDomain, workspaceId, dto.title);
          break;
        case 'tinyurl':
          shortLink = await this.createWithTinyUrl(targetUrl, apiKey, customDomain, dto.title);
          break;
        default:
          this.logger.warn(`Unsupported shortener provider: ${provider}`);
          break;
      }

      if (shortLink) {
        this.cache.set(cacheKey, shortLink);
        return {
          shortUrl: shortLink,
          isShortened: true,
          provider: provider.toLowerCase(),
          originalUrl: targetUrl,
        };
      }
    } catch (err: any) {
      this.logger.error(`Shortener provider [${provider}] failed: ${err.message}`);
    }

    // Safe fallback to canonical URL
    return {
      shortUrl: targetUrl,
      isShortened: false,
      provider: 'fallback',
      originalUrl: targetUrl,
    };
  }

  /**
   * Dub.co API Integration
   * Endpoint: POST https://api.dub.co/links
   */
  private async createWithDub(
    url: string,
    apiKey: string,
    domain?: string,
    workspaceId?: string,
    title?: string,
  ): Promise<string | null> {
    const endpoint = workspaceId
      ? `https://api.dub.co/links?workspaceId=${encodeURIComponent(workspaceId)}`
      : 'https://api.dub.co/links';

    const payload: Record<string, any> = {
      url,
      ...(domain ? { domain } : {}),
      ...(title ? { title } : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Dub.co HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data?.shortLink || data?.url || (data?.domain && data?.key ? `https://${data.domain}/${data.key}` : null);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Bitly API Integration
   * Endpoint: POST https://api-ssl.bitly.com/v4/shorten
   */
  private async createWithBitly(
    url: string,
    apiKey: string,
    domain?: string,
    groupGuid?: string,
    title?: string,
  ): Promise<string | null> {
    const payload: Record<string, any> = {
      long_url: url,
      ...(domain ? { domain } : {}),
      ...(groupGuid ? { group_guid: groupGuid } : {}),
      ...(title ? { title } : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Bitly HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data?.link || null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * TinyURL API Integration
   * Endpoint: POST https://api.tinyurl.com/create
   */
  private async createWithTinyUrl(
    url: string,
    apiKey: string,
    domain?: string,
    title?: string,
  ): Promise<string | null> {
    const payload: Record<string, any> = {
      url,
      ...(domain ? { domain } : { domain: 'tinyurl.com' }),
      ...(title ? { description: title } : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch('https://api.tinyurl.com/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`TinyURL HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data?.data?.tiny_url || data?.data?.url || null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Diagnostic test connection for Admin Settings
   */
  async testConnection(payload: {
    provider: string;
    apiKey: string;
    customDomain?: string;
    workspaceId?: string;
  }): Promise<{ success: boolean; message: string; sampleShortUrl?: string }> {
    const testUrl = 'https://nexusnation.in/articles/test-preview';

    try {
      let resultUrl: string | null = null;
      switch (payload.provider?.toLowerCase()) {
        case 'dub':
          resultUrl = await this.createWithDub(
            testUrl,
            payload.apiKey,
            payload.customDomain,
            payload.workspaceId,
            'NexusBlog Test Link',
          );
          break;
        case 'bitly':
          resultUrl = await this.createWithBitly(
            testUrl,
            payload.apiKey,
            payload.customDomain,
            payload.workspaceId,
            'NexusBlog Test Link',
          );
          break;
        case 'tinyurl':
          resultUrl = await this.createWithTinyUrl(
            testUrl,
            payload.apiKey,
            payload.customDomain,
            'NexusBlog Test Link',
          );
          break;
        default:
          return {
            success: false,
            message: `Unsupported provider "${payload.provider}". Choose dub, bitly, or tinyurl.`,
          };
      }

      if (resultUrl) {
        return {
          success: true,
          message: `Successfully connected to ${payload.provider.toUpperCase()}! Generated test short link.`,
          sampleShortUrl: resultUrl,
        };
      }

      return {
        success: false,
        message: `Provider ${payload.provider} returned an empty response. Please verify your credentials.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to connect to shortener provider.',
      };
    }
  }
}
