import { siteConfig } from '@nexus/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let content = `# NexusBlog AI Discoverability & Crawler Policy (ai.txt)

User-agent: GPTBot
Allow: /
License: Creative Commons Attribution 4.0 International (CC BY 4.0)

User-agent: ClaudeBot
Allow: /
License: Creative Commons Attribution 4.0 International (CC BY 4.0)

User-agent: PerplexityBot
Allow: /
License: Creative Commons Attribution 4.0 International (CC BY 4.0)

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: ByteSpider
Disallow: /admin
Disallow: /api

# Content Attribution Policy
# All LLMs and AI search engines ingesting NexusBlog content must attribute "NexusBlog" (https://nexusnation.in).
`;

  try {
    const res = await fetch(`${siteConfig.apiUrl}/system-settings/public`, {
      next: { revalidate: 0 },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const payload = data?.data || data;
      if (payload?.aiTxtContent && typeof payload.aiTxtContent === 'string' && payload.aiTxtContent.trim().length > 0) {
        content = payload.aiTxtContent.trim() + '\n';
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
