import { describe, it, expect } from 'vitest';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(content: string, wpm = 200): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wpm));
}

describe('Taxonomy & Publishing Engine Helpers', () => {
  it('should generate URL-safe slugs from technical titles', () => {
    expect(slugify('Building a Distributed Rate Limiter with Redis & NestJS')).toBe(
      'building-a-distributed-rate-limiter-with-redis-nestjs',
    );
    expect(slugify('Next.js 15: Server Components & Actions! (2026)')).toBe(
      'nextjs-15-server-components-actions-2026',
    );
    expect(slugify('  C++20 Coroutines & High-Performance Asynchronous IO  ')).toBe(
      'c20-coroutines-high-performance-asynchronous-io',
    );
  });

  it('should accurately calculate reading time based on word count', () => {
    const shortText = 'One two three four five six seven eight nine ten.';
    expect(calculateReadingTime(shortText)).toBe(1);

    const longText = new Array(500).fill('architecture').join(' ');
    expect(calculateReadingTime(longText, 200)).toBe(3);
  });
});
