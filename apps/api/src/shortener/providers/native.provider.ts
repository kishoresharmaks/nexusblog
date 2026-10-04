import * as crypto from 'crypto';
import { IShortenerProvider, ShortenOptions, ShortenerTestResult } from '../interfaces/shortener-provider.interface';

export class NativeProvider implements IShortenerProvider {
  readonly name = 'native';

  private generateShortCode(length = 6): string {
    const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  async generate(options: ShortenOptions): Promise<string | null> {
    const code = this.generateShortCode(6);
    let baseDomain = (options.customDomain || options.siteUrl || 'https://nexusnation.in').trim().replace(/\/+$/, '');
    if (!baseDomain.startsWith('http://') && !baseDomain.startsWith('https://')) {
      baseDomain = `https://${baseDomain}`;
    }

    // Return URL and attach code for persistence in ShortenerService
    return `${baseDomain}/s/${code}`;
  }

  async testConnection(options: ShortenOptions): Promise<ShortenerTestResult> {
    const sample = await this.generate({
      ...options,
      url: options.url || 'https://nexusnation.in/articles/test-healthcheck',
    });

    return {
      success: true,
      message: 'Native Internal Shortener is ready! Links will be resolved via /s/:code.',
      sampleShortUrl: sample || undefined,
    };
  }
}
