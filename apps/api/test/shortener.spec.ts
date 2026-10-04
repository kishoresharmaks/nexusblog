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
          if (where.key === 'siteUrl') return { value: 'https://nexusnation.in' };
          if (where.key === 'shortenerAutoValidate') return { value: 'true' };
          return null;
        }),
      },
      article: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({ id: 'art-123' }),
        findMany: vi.fn().mockResolvedValue([]),
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
      if (where.key === 'siteUrl') return { value: 'https://nexusnation.in' };
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
  });

  it('should support Custom REST API provider with payload interpolation and response path traversal', async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === 'shortenerProvider') return { value: 'custom' };
      if (where.key === 'shortenerCustomEndpoint') return { value: 'https://api.short.io/links' };
      if (where.key === 'shortenerCustomMethod') return { value: 'POST' };
      if (where.key === 'shortenerCustomHeaders') return { value: '{"Authorization": "secret_key"}' };
      if (where.key === 'shortenerCustomBodyTemplate') return { value: '{"originalURL": "{{url}}"}' };
      if (where.key === 'shortenerCustomResponsePath') return { value: 'data.short_url' };
      if (where.key === 'siteUrl') return { value: 'https://nexusnation.in' };
      return null;
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: {
          short_url: 'https://nx.to/cstm123',
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await service.generateShortUrl({ url: 'https://nexusnation.in/articles/custom-test' });

    expect(result.provider).toBe('custom');
    expect(result.shortUrl).toBe('https://nx.to/cstm123');
    expect(result.isShortened).toBe(true);
  });

  it('should generate Native internal short link (/s/:code) without external dependencies', async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === 'shortenerProvider') return { value: 'native' };
      if (where.key === 'siteUrl') return { value: 'https://nexusnation.in' };
      return null;
    });

    const result = await service.generateShortUrl({ url: 'https://nexusnation.in/articles/system-design' });

    expect(result.provider).toBe('native');
    expect(result.shortUrl).toMatch(/^https:\/\/nexusnation\.in\/s\/[A-Za-z0-9]{6}$/);
    expect(result.isShortened).toBe(true);
  });

  it('should reuse existing stored shortUrl from DB and skip API calls when link is healthy', async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === 'shortenerProvider') return { value: 'dub' };
      if (where.key === 'shortenerAutoValidate') return { value: 'true' };
      if (where.key === 'siteUrl') return { value: 'https://nexusnation.in' };
      return null;
    });

    mockPrisma.article.findUnique.mockResolvedValue({
      id: 'art-001',
      title: 'Distributed Transactions',
      slug: 'distributed-transactions',
      status: 'PUBLISHED',
      shortUrl: 'https://dub.sh/tx123',
      shortUrlProvider: 'dub',
    });

    // Mock link probe returning 200 OK
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await service.generateShortUrl({
      url: 'https://nexusnation.in/articles/distributed-transactions',
      articleId: 'art-001',
    });

    expect(result.shortUrl).toBe('https://dub.sh/tx123');
    expect(result.fromDb).toBe(true);
    expect(result.provider).toBe('dub');
  });

  it('should auto-heal and regenerate new link if stored link is dead', async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === 'shortenerProvider') return { value: 'tinyurl' };
      if (where.key === 'shortenerApiKey') return { value: 'tiny-token-123' };
      if (where.key === 'shortenerAutoValidate') return { value: 'true' };
      if (where.key === 'siteUrl') return { value: 'https://nexusnation.in' };
      return null;
    });

    mockPrisma.article.findUnique.mockResolvedValue({
      id: 'art-002',
      title: 'Database Sharding',
      slug: 'database-sharding',
      status: 'PUBLISHED',
      shortUrl: 'https://deadlink.com/broken',
      shortUrlProvider: 'dub',
    });

    // Mock HEAD returning 404 (dead link), followed by TinyURL API create returning 200
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
      callCount++;
      if (opts?.method === 'HEAD' || opts?.method === 'GET') {
        return { status: 404, ok: false };
      }
      return {
        ok: true,
        json: async () => ({
          data: {
            tiny_url: 'https://tinyurl.com/healed99',
          },
        }),
      };
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await service.generateShortUrl({
      url: 'https://nexusnation.in/articles/database-sharding',
      articleId: 'art-002',
    });

    expect(result.shortUrl).toBe('https://tinyurl.com/healed99');
    expect(result.healed).toBe(true);
    expect(mockPrisma.article.update).toHaveBeenCalledWith({
      where: { id: 'art-002' },
      data: expect.objectContaining({
        shortUrl: 'https://tinyurl.com/healed99',
        shortUrlProvider: 'tinyurl',
      }),
    });
  });

  it('should bypass shortlink creation for DRAFT or unpublished articles', async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === 'shortenerProvider') return { value: 'tinyurl' };
      if (where.key === 'shortenerApiKey') return { value: 'tiny-token-123' };
      if (where.key === 'siteUrl') return { value: 'https://nexusnation.in' };
      return null;
    });

    mockPrisma.article.findUnique.mockResolvedValue({
      id: 'art-draft-001',
      title: 'Unpublished Draft Article',
      slug: 'unpublished-draft-article',
      status: 'DRAFT',
    });

    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    const result = await service.generateShortUrl({
      url: 'https://nexusnation.in/articles/unpublished-draft-article',
      articleId: 'art-draft-001',
    });

    expect(result.isShortened).toBe(false);
    expect(result.provider).toBe('draft_bypass');
    expect(result.shortUrl).toBe('https://nexusnation.in/articles/unpublished-draft-article');
    // Ensure no external API call or DB update was made
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it('should gracefully fallback to canonical URL on provider error', async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === 'shortenerProvider') return { value: 'dub' };
      if (where.key === 'shortenerApiKey') return { value: 'dub-invalid-key' };
      if (where.key === 'shortenerCustomDomain') return { value: 'dub.sh' };
      if (where.key === 'siteUrl') return { value: 'https://nexusnation.in' };
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
