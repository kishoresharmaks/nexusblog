import { siteConfig } from '@nexus/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let content = `/* TEAM */
  Founder & Principal Engineer: Nexus Core Team (@nexus)
  Site: https://nexusnation.in
  Location: Distributed

/* SITE & TECH STACK */
  Framework: Next.js 15 App Router & React 19
  Backend: NestJS & Node.js Microservices
  Database: PostgreSQL & Prisma ORM
  Cache: Redis Cluster
  Styling: Tailwind CSS v4 & Geist Mono
  Hosting: Distributed Edge Network
`;

  try {
    const res = await fetch(`${siteConfig.apiUrl}/system-settings/public`, {
      next: { revalidate: 0 },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const payload = data?.data || data;
      if (payload?.humansTxtContent && typeof payload.humansTxtContent === 'string' && payload.humansTxtContent.trim().length > 0) {
        content = payload.humansTxtContent.trim() + '\n';
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
