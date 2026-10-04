import { IShortenerProvider, ShortenOptions, ShortenerTestResult } from '../interfaces/shortener-provider.interface';

export class DubProvider implements IShortenerProvider {
  readonly name = 'dub';

  async generate(options: ShortenOptions): Promise<string | null> {
    if (!options.apiKey) {
      throw new Error('Dub.co API key is required.');
    }

    const endpoint = options.workspaceId
      ? `https://api.dub.co/links?workspaceId=${encodeURIComponent(options.workspaceId)}`
      : 'https://api.dub.co/links';

    const payload: Record<string, any> = {
      url: options.url,
      ...(options.customDomain ? { domain: options.customDomain } : {}),
      ...(options.title ? { title: options.title } : {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(endpoint, {
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
        throw new Error(`Dub.co HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return (
        data?.shortLink ||
        data?.url ||
        (data?.domain && data?.key ? `https://${data.domain}/${data.key}` : null)
      );
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
          message: 'Connected to Dub.co successfully! Test short link created.',
          sampleShortUrl: sample,
        };
      }

      return {
        success: false,
        message: 'Dub.co returned an empty response.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to authenticate with Dub.co API.',
      };
    }
  }
}
