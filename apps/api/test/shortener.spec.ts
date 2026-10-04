import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShortenerService } from '../src/shortener/shortener.service';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      systemSetting: {
        findUnique: vi.fn().mockImplementation(async ({ where }: { where: { key: string } }) => {
          if (where.key === 'shortenerProvider') return { value: 'none' };
          return null;
        }),
      },
    };
    service = new ShortenerService(mockPrisma);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return original URL when provider is "none" and no platform is set', async () => {
    const originalUrl = 'https://nexusnation.in/articles/test-post';
    const result = await service.generateShortUrl({ url: originalUrl });

    expect(result.provider).toBe('none');
    expect(result.shortUrl).toBe(originalUrl);
    expect(result.isShortened).toBe(false);
  });

  it('should append UTM parameters when platform is provided', async () => {
    const originalUrl = 'https://nexusnation.in/articles/test-post';
    const result = await service.generateShortUrl({ url: originalUrl, platform: 'twitter' });

    expect(result.provider).toBe('none');
    expect(result.shortUrl).toContain('utm_source=twitter');
    expect(result.shortUrl).toContain('utm_medium=social_share');
    expect(result.shortUrl).toContain('utm_campaign=nexusblog_share');
    expect(result.isShortened).toBe(false);
  });

  it('should call TinyURL API and return shortened url', async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === 'shortenerProvider') return { value: 'tinyurl' };
      if (where.key === 'shortenerApiKey') return { value: 'tiny-token-123' };
      return null;
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          tiny_url: 'https://tinyurl.com/abc1234',
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await service.generateShortUrl({ url: 'https://nexusnation.in/articles/post-1' });

    expect(result.provider).toBe('tinyurl');
    expect(result.shortUrl).toBe('https://tinyurl.com/abc1234');
    expect(result.isShortened).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tinyurl.com/create',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer tiny-token-123',
        }),
      }),
    );
  });

  it('should gracefully fallback to canonical URL on provider error', async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === 'shortenerProvider') return { value: 'dub' };
      if (where.key === 'shortenerApiKey') return { value: 'dub-invalid-key' };
      if (where.key === 'shortenerCustomDomain') return { value: 'dub.sh' };
      return null;
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });
    vi.stubGlobal('fetch', mockFetch);

    const originalUrl = 'https://nexusnation.in/articles/post-fail';
    const result = await service.generateShortUrl({ url: originalUrl, platform: 'whatsapp' });

    expect(result.isShortened).toBe(false);
    expect(result.provider).toBe('fallback');
    expect(result.shortUrl).toContain(originalUrl);
  });
});
