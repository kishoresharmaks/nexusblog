import { siteConfig } from '@nexus/config';

export async function GET() {
  const baseUrl = siteConfig.url || 'https://nexusblog.dev';

  const articles = [
    {
      title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
      slug: 'designing-distributed-rate-limiter',
      excerpt:
        'A deep dive into sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.',
      category: 'System Design',
      author: 'Alex Rivera',
      pubDate: new Date('2026-09-28').toUTCString(),
    },
    {
      title: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
      slug: 'zero-downtime-postgresql-migrations',
      excerpt:
        'Safe table alteration patterns, concurrent index creation, avoiding lock queues, and backward-compatible contract testing with Prisma.',
      category: 'Databases',
      author: 'Alex Rivera',
      pubDate: new Date('2026-09-25').toUTCString(),
    },
    {
      title: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
      slug: 'kafka-partitioning-zero-data-loss',
      excerpt:
        'Guaranteed message ordering, consumer group rebalancing internals, and handling backpressure in distributed event stream pipelines.',
      category: 'Distributed Systems',
      author: 'Alex Rivera',
      pubDate: new Date('2026-09-20').toUTCString(),
    },
  ];

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${siteConfig.name}</title>
  <link>${baseUrl}</link>
  <description>${siteConfig.description}</description>
  <language>en-US</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
  ${articles
    .map(
      (art) => `
  <item>
    <title><![CDATA[${art.title}]]></title>
    <link>${baseUrl}/articles/${art.slug}</link>
    <guid isPermaLink="true">${baseUrl}/articles/${art.slug}</guid>
    <description><![CDATA[${art.excerpt}]]></description>
    <category>${art.category}</category>
    <author>${art.author}</author>
    <pubDate>${art.pubDate}</pubDate>
  </item>`,
    )
    .join('')}
</channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
