import { IShortenerProvider, ShortenOptions, ShortenerTestResult } from '../interfaces/shortener-provider.interface';

export class CustomApiProvider implements IShortenerProvider {
  readonly name = 'custom';

  /**
   * Helper to extract a nested property from an object using dot notation (e.g. "data.short_url")
   */
  private getNestedValue(obj: any, path: string): any {
    if (!path || !obj) return null;
    const parts = path.split('.').map((p) => p.trim());
    let current = obj;
    for (const part of parts) {
      if (current === undefined || current === null) return null;
      current = current[part];
    }
    return current;
  }

  async generate(options: ShortenOptions): Promise<string | null> {
    if (!options.customEndpoint) {
      throw new Error('Custom API Endpoint URL is required for custom shortener provider.');
    }

    const method = (options.customMethod || 'POST').toUpperCase();
    let url = options.customEndpoint;

    // Parse custom headers
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (options.customHeaders) {
      try {
        const parsed = JSON.parse(options.customHeaders);
        if (typeof parsed === 'object' && parsed !== null) {
          headers = { ...headers, ...parsed };
        }
      } catch {
        // If not valid JSON, ignore or treat as raw
      }
    }

    if (options.apiKey && !headers['Authorization'] && !headers['apikey']) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    let fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method === 'GET') {
      // Append url as query param if not already present
      const parsedUrl = new URL(url);
      if (!parsedUrl.searchParams.has('url')) {
        parsedUrl.searchParams.set('url', options.url);
      }
      if (options.customDomain && !parsedUrl.searchParams.has('domain')) {
        parsedUrl.searchParams.set('domain', options.customDomain);
      }
      url = parsedUrl.toString();
    } else {
      // POST / PUT: interpolate body template
      let bodyString = options.customBodyTemplate || '{\n  "url": "{{url}}"\n}';
      bodyString = bodyString
        .replace(/\{\{url\}\}/g, options.url)
        .replace(/\{\{domain\}\}/g, options.customDomain || '')
        .replace(/\{\{title\}\}/g, (options.title || '').replace(/"/g, '\\"'))
        .replace(/\{\{slug\}\}/g, options.slug || '');

      fetchOptions.body = bodyString;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Custom API HTTP ${res.status}: ${errText}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        const responsePath = options.customResponsePath || 'shortUrl';

        let extracted = this.getNestedValue(data, responsePath);
        if (!extracted) {
          // Fallback to common candidate field names
          extracted =
            data?.shortUrl ||
            data?.shortURL ||
            data?.short_url ||
            data?.link ||
            data?.url ||
            data?.data?.short_url ||
            data?.data?.tiny_url ||
            data?.result_url;
        }

        if (typeof extracted === 'string' && extracted.startsWith('http')) {
          return extracted;
        }
      } else {
        const text = (await res.text()).trim();
        if (text.startsWith('http')) {
          return text;
        }
      }

      return null;
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
          message: 'Connected to Custom Shortener API successfully! Test link created.',
          sampleShortUrl: sample,
        };
      }

      return {
        success: false,
        message: 'Custom API did not return a valid shortened URL. Check response key path.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to connect to Custom Shortener API.',
      };
    }
  }
}
