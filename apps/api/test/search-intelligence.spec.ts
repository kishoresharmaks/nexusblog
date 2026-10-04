import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from '../src/analytics/analytics.service';

describe('Search Intelligence & Telemetry Optimization', () => {
  let analyticsService: AnalyticsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      searchQueryLog: {
        create: vi.fn().mockResolvedValue({ id: 'log-1' }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({ id: 'log-1' }),
        groupBy: vi.fn().mockResolvedValue([]),
      },
      analyticsEvent: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        groupBy: vi.fn().mockResolvedValue([]),
      },
      category: { findMany: vi.fn().mockResolvedValue([]) },
      technology: { findMany: vi.fn().mockResolvedValue([]) },
      article: { aggregate: vi.fn().mockResolvedValue({ _avg: {} }) },
      readingHistory: { aggregate: vi.fn().mockResolvedValue({ _avg: {} }) },
      bookmark: { count: vi.fn().mockResolvedValue(0) },
    };

    analyticsService = new AnalyticsService(mockPrisma as any);
  });

  it('should ignore single or two-character search fragments to save database costs', async () => {
    await analyticsService.logSearchQuery({ query: 'b', resultsCount: 0 });
    await analyticsService.logSearchQuery({ query: 'bu', resultsCount: 1 });
    await analyticsService.logSearchQuery({ query: '  ', resultsCount: 0 });
    await analyticsService.logSearchQuery({ query: '##', resultsCount: 0 });

    expect(mockPrisma.searchQueryLog.create).not.toHaveBeenCalled();
    expect(mockPrisma.searchQueryLog.update).not.toHaveBeenCalled();
  });

  it('should record settled valid search queries (>= 3 chars)', async () => {
    await analyticsService.logSearchQuery({
      query: 'building',
      resultsCount: 5,
      visitorId: 'vis-123',
    });

    expect(mockPrisma.searchQueryLog.create).toHaveBeenCalledWith({
      data: {
        query: 'building',
        resultsCount: 5,
        visitorId: 'vis-123',
      },
    });
  });

  it('should merge progressive keystroke refinements from the same visitor within the session window', async () => {
    // Existing log for "build"
    mockPrisma.searchQueryLog.findFirst.mockResolvedValueOnce({
      id: 'log-existing',
      query: 'build',
      visitorId: 'vis-123',
      timestamp: new Date(),
    });

    // Next query "building" from same visitor
    await analyticsService.logSearchQuery({
      query: 'building',
      resultsCount: 4,
      visitorId: 'vis-123',
    });

    // Should UPDATE existing record instead of creating redundant rows
    expect(mockPrisma.searchQueryLog.update).toHaveBeenCalledWith({
      where: { id: 'log-existing' },
      data: {
        query: 'building',
        resultsCount: 4,
        timestamp: expect.any(Date),
      },
    });
    expect(mockPrisma.searchQueryLog.create).not.toHaveBeenCalled();
  });

  it('should filter out short legacy noise from search intelligence aggregation', async () => {
    mockPrisma.searchQueryLog.groupBy
      .mockResolvedValueOnce([
        { query: 'building', _count: { query: 10 } },
        { query: 'bui', _count: { query: 5 } }, // Should be excluded (< 3 chars or fragment)
        { query: 'b', _count: { query: 8 } },   // Should be excluded
        { query: 'redis', _count: { query: 12 } },
      ])
      .mockResolvedValueOnce([
        { query: 'raft consensus', _count: { query: 4 } },
        { query: 'x', _count: { query: 2 } }, // Should be excluded
      ]);

    const result = await analyticsService.getSearchIntelligence('7d');

    // "b" and single char items must be excluded from top queries and content gaps
    expect(result.topQueries.some((q) => q.query === 'b')).toBe(false);
    expect(result.topQueries.find((q) => q.query === 'building')).toBeDefined();
    expect(result.topQueries.find((q) => q.query === 'redis')).toBeDefined();
    expect(result.contentGaps.some((g) => g.query === 'x')).toBe(false);
  });
});
