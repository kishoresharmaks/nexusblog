import { IShortenerProvider, ShortenOptions, ShortenerTestResult } from '../interfaces/shortener-provider.interface';

export class TinyUrlProvider implements IShortenerProvider {
  readonly name = 'tinyurl';

  async generate(options: ShortenOptions): Promise<string | null> {
    if (!options.apiKey) {
      throw new Error('TinyURL API token is required.');
    }

    const payload: Record<string, any> = {
      url: options.url,
      ...(options.customDomain ? { domain: options.customDomain } : { domain: 'tinyurl.com' }),
      ...(options.title ? { description: options.title } : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch('https://api.tinyurl.com/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
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

  async testConnection(options: ShortenOptions): Promise<ShortenerTestResult> {
    try {
      const sample = await this.generate({
        ...options,
        url: options.url || 'https://nexusnation.in/articles/test-healthcheck',
        title: 'NexusNation Connection Test',
      });

      if (sample) {
        return {
          success: true,
          message: 'Connected to TinyURL API successfully! Test short link created.',
          sampleShortUrl: sample,
        };
      }

      return {
        success: false,
        message: 'TinyURL API returned an empty response.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to authenticate with TinyURL API.',
      };
    }
  }
}
