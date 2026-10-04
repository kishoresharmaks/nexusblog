import { IShortenerProvider, ShortenOptions, ShortenerTestResult } from '../interfaces/shortener-provider.interface';

export class BitlyProvider implements IShortenerProvider {
  readonly name = 'bitly';

  async generate(options: ShortenOptions): Promise<string | null> {
    if (!options.apiKey) {
      throw new Error('Bitly Generic Access Token / API key is required.');
    }

    const payload: Record<string, any> = {
      long_url: options.url,
      ...(options.customDomain ? { domain: options.customDomain } : {}),
      ...(options.workspaceId ? { group_guid: options.workspaceId } : {}),
      ...(options.title ? { title: options.title } : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch('https://api-ssl.bitly.com/v4/shorten', {
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
        throw new Error(`Bitly HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data?.link || null;
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
          message: 'Connected to Bitly API successfully! Test short link created.',
          sampleShortUrl: sample,
        };
      }

      return {
        success: false,
        message: 'Bitly API returned an empty response.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to authenticate with Bitly API.',
      };
    }
  }
}
