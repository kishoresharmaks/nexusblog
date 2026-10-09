import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { siteConfig } from '@nexus/config';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let siteUrl = siteConfig.url || 'https://nexusnation.in';

  // 1. Detect live incoming request host from Next.js headers
  try {
    const headerList = await headers();
    const host =
      headerList.get('x-forwarded-host') ||
      headerList.get('host') ||
      '';
    const proto =
      headerList.get('x-forwarded-proto') ||
      (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');

    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      siteUrl = `${proto}://${host}`;
    }
  } catch {
    // Graceful fallback
  }

  // 2. Fetch live settings if available
  try {
    const res = await fetch(`${siteConfig.apiUrl}/system-settings/public`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const payload = data?.data || data;
      if (payload?.siteUrl && typeof payload.siteUrl === 'string' && payload.siteUrl.trim().length > 0) {
        const configuredUrl = payload.siteUrl.trim();
        // Only use configured URL if it is not localhost (or if we are on localhost)
        if (!configuredUrl.includes('localhost') && !configuredUrl.includes('127.0.0.1')) {
          siteUrl = configuredUrl;
        } else if (!siteUrl || siteUrl.includes('localhost')) {
          siteUrl = configuredUrl;
        }
      }
    }
  } catch {
    // Fallback
  }

  // 3. Final safeguard: never output localhost for canonical sitemaps
  if (!siteUrl || siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
    siteUrl = 'https://nexusnation.in';
  }

  const baseUrl = (siteUrl || 'https://nexusnation.in').replace(/\/+$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/incidents`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/technologies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/write-for-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Legal & Policy Information Pages
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/content-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/author-guidelines`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Categories
  const categoryRoutes: MetadataRoute.Sitemap = siteConfig.categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.toLowerCase().replace(/[\s&]+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Technologies
  const techRoutes: MetadataRoute.Sitemap = siteConfig.technologies.map((tech) => ({
    url: `${baseUrl}/technologies/${tech.toLowerCase().replace(/[\s&]+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic published articles
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articlesRes = await fetch(`${siteConfig.apiUrl}/articles?limit=100`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (articlesRes.ok) {
      const artData = await articlesRes.json();
      const items = artData?.data?.items || artData?.items || artData?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        articleRoutes = items.filter((art: any) => !art.noIndex).map((art: any) => ({
          url: `${baseUrl}/articles/${art.slug}`,
          lastModified: art.updatedAt ? new Date(art.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        }));
      }
    }
  } catch {
    // Fallback if API is offline
  }

  let incidentRoutes: MetadataRoute.Sitemap = [];
  try {
    const incidentsRes = await fetch(`${siteConfig.apiUrl}/incidents?limit=50`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (incidentsRes.ok) {
      const data = await incidentsRes.json();
      const items = data?.data?.items || data?.items || data?.data || [];
      if (Array.isArray(items)) {
        incidentRoutes = items
          .filter((item: any) => item.slug && !item.noIndex)
          .map((item: any) => ({
            url: `${baseUrl}/incidents/${item.slug}`,
            lastModified: item.incident?.updatedAt ? new Date(item.incident.updatedAt) : item.updatedAt ? new Date(item.updatedAt) : new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
          }));
      }
    }
  } catch {
    // Keep the static atlas route when the API is unavailable.
  }

  if (articleRoutes.length === 0) {
    const sampleArticles = [
      'designing-distributed-rate-limiter',
      'zero-downtime-postgresql-migrations',
      'kafka-partitioning-zero-data-loss',
    ];
    articleRoutes = sampleArticles.map((slug) => ({
      url: `${baseUrl}/articles/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    }));
  }

  // Dynamic CMS Pages (Legal, custom policy pages, etc.)
  let cmsPageRoutes: MetadataRoute.Sitemap = [];
  try {
    const pagesRes = await fetch(`${siteConfig.apiUrl}/pages`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (pagesRes.ok) {
      const pData = await pagesRes.json();
      const pageList = Array.isArray(pData?.data) ? pData.data : Array.isArray(pData) ? pData : [];
      if (Array.isArray(pageList) && pageList.length > 0) {
        cmsPageRoutes = pageList
          .filter((pg: any) => pg.published !== false && pg.slug)
          .map((pg: any) => {
            const cleanSlug = pg.slug.replace(/^\//, '');
            return {
              url: `${baseUrl}/${cleanSlug}`,
              lastModified: pg.updatedAt ? new Date(pg.updatedAt) : new Date(),
              changeFrequency: 'monthly' as const,
              priority: 0.7,
            };
          });
      }
    }
  } catch {
    // Fallback
  }

  // Combine and deduplicate all routes by URL
  const allRoutes = [
    ...staticRoutes,
    ...categoryRoutes,
    ...techRoutes,
    ...articleRoutes,
    ...incidentRoutes,
    ...cmsPageRoutes,
  ];

  const seenUrls = new Set<string>();
  const deduplicatedRoutes: MetadataRoute.Sitemap = [];

  for (const route of allRoutes) {
    if (!seenUrls.has(route.url)) {
      seenUrls.add(route.url);
      deduplicatedRoutes.push(route);
    }
  }

  return deduplicatedRoutes;
}
