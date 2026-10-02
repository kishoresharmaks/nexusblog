import { siteConfig } from '@nexus/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  let siteUrl = siteConfig.url || 'http://localhost:3000';
  let indexingMode = 'allow';
  let customContent = '';

  // 1. Try fetching live system settings from the API
  try {
    const res = await fetch(`${siteConfig.apiUrl}/system-settings/public`, {
      next: { revalidate: 0 },
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const payload = data?.data || data;
      if (payload?.siteUrl) {
        siteUrl = payload.siteUrl;
      }
      if (payload?.robotsIndexingMode) {
        indexingMode = payload.robotsIndexingMode;
      }
      if (payload?.robotsCustomContent) {
        customContent = payload.robotsCustomContent;
      }
    }
  } catch {
    // Graceful fallback to env / config defaults if API is temporarily unreachable
  }

  // 2. Dynamic host detection: If siteUrl is localhost or default, but request comes from a real domain (e.g. nexusnation.in), infer live host
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    '';
  const proto =
    request.headers.get('x-forwarded-proto') ||
    (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');

  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    if (!siteUrl || siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
      siteUrl = `${proto}://${host}`;
    }
  }

  // Normalize siteUrl (strip trailing slash)
  const baseUrl = siteUrl.replace(/\/+$/, '');

  let robotsContent = '';

  if (indexingMode === 'disallow_all') {
    robotsContent = `# ==========================================
# Robots.txt - Search Engine Indexing Disabled
# Development / Staging / Testing Mode Active
# ==========================================
User-Agent: *
Disallow: /
`;
  } else if (indexingMode === 'custom' && customContent.trim().length > 0) {
    robotsContent = customContent.trim() + '\n';
  } else {
    // Default: Production Allow Indexing Mode
    robotsContent = `User-Agent: *
Allow: /
Allow: /articles
Allow: /categories
Allow: /technologies
Allow: /series
Allow: /tags
Allow: /write-for-us
Allow: /api/og
Disallow: /admin
Disallow: /admin/*
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /api/*

Sitemap: ${baseUrl}/sitemap.xml
`;
  }

  return new Response(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}
