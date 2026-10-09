import { siteConfig } from '@nexus/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let adsTxtContent = `# NexusNation Ads.txt Verification File
google.com, pub-9847291823746501, DIRECT, f08c47fec0942fa0
buysellads.com, pub-19283746, DIRECT, 840fec729a1b4
`;

  try {
    const res = await fetch(`${siteConfig.apiUrl}/ads/public/ads-txt`, {
      next: { revalidate: 0 },
      cache: 'no-store',
    });

    if (res.ok) {
      const text = await res.text();
      let extracted = text;
      try {
        const json = JSON.parse(text);
        if (json && typeof json === 'object') {
          if (typeof json.data === 'string') {
            extracted = json.data;
          } else if (typeof json.message === 'string') {
            extracted = json.message;
          }
        }
      } catch {
        // Plain text content already
      }

      if (extracted && extracted.trim().length > 0) {
        adsTxtContent = extracted;
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return new Response(adsTxtContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
