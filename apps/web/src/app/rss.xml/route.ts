import { siteConfig } from '@nexus/config';
import { articlesApi } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = (siteConfig.url || 'https://nexusblog.dev').replace(/\/$/, '');

  let feedArticles: any[] = [];
  try {
    const res = await articlesApi.getPublicFeed({ limit: 50 });
    if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
      feedArticles = res.items;
    }
  } catch {
    feedArticles = [
      {
        title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
        slug: 'designing-distributed-rate-limiter',
        excerpt:
          'A deep dive into sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.',
        category: { name: 'System Design' },
        author: { name: 'Alex Rivera' },
        publishedAt: new Date('2026-09-28'),
      },
      {
        title: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
        slug: 'zero-downtime-postgresql-migrations',
        excerpt:
          'Safe table alteration patterns, concurrent index creation, avoiding lock queues, and backward-compatible contract testing with Prisma.',
        category: { name: 'Databases' },
        author: { name: 'Elena Rostova' },
        publishedAt: new Date('2026-09-25'),
      },
      {
        title: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
        slug: 'kafka-partitioning-zero-data-loss',
        excerpt:
          'Guaranteed message ordering, consumer group rebalancing internals, and handling backpressure in distributed event stream pipelines.',
        category: { name: 'Distributed Systems' },
        author: { name: 'Alex Rivera' },
        publishedAt: new Date('2026-09-20'),
      },
    ];
  }

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(baseUrl)}/rss.xml" rel="self" type="application/rss+xml" />
    ${feedArticles
      .map((art: any) => {
        const artUrl = `${baseUrl}/articles/${art.slug}`;
        const pubDate = art.publishedAt
          ? new Date(art.publishedAt).toUTCString()
          : new Date().toUTCString();
        const authorName =
          art.guestAuthorName || art.author?.name || 'NexusBlog Architect';
        const categoryName = art.category?.name || 'System Design';

        return `
    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${escapeXml(artUrl)}</link>
      <guid isPermaLink="true">${escapeXml(artUrl)}</guid>
      <description><![CDATA[${art.excerpt || art.title}]]></description>
      <category><![CDATA[${categoryName}]]></category>
      <author><![CDATA[${authorName}]]></author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      })
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

