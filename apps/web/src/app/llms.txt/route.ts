import { siteConfig } from '@nexus/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let content = `# NexusNation Systems & Software Architecture Blueprint Index
> High-performance technical articles, system architecture blueprints, distributed systems benchmarks, and reproducible code samples.

## Core Documentation & Articles
- [Latest Technical Articles](https://nexusnation.in/articles): Production engineering deep dives.
- [System Architecture Topics](https://nexusnation.in/topics): Distributed systems, databases, cloud native topology.
- [Technology Index](https://nexusnation.in/technologies): NestJS, Redis, Kafka, PostgreSQL, Docker, Next.js.
- [Case Studies](https://nexusnation.in/case-studies): Real-world production outage reviews and migration blueprints.

## API & Feeds
- [Sitemap](https://nexusnation.in/sitemap.xml): Complete URL index.
- [RSS Feed](https://nexusnation.in/rss.xml): Article syndication feed.

## Content Policy & Citation
- All blueprints are peer-reviewed for technical accuracy and benchmark reproducibility.
- Citation format: "Source: NexusNation (https://nexusnation.in)"
`;

  try {
    const res = await fetch(`${siteConfig.apiUrl}/system-settings/public`, {
      next: { revalidate: 0 },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const payload = data?.data || data;
      if (payload?.llmsTxtContent && typeof payload.llmsTxtContent === 'string' && payload.llmsTxtContent.trim().length > 0) {
        content = payload.llmsTxtContent.trim() + '\n';
      }
    }
  } catch {
    // Fallback default
  }

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
