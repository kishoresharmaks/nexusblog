import { MetadataRoute } from 'next';
import { siteConfig } from '@nexus/config';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let siteUrl = siteConfig.url || 'http://localhost:3000';

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
      if (payload?.siteUrl) {
        siteUrl = payload.siteUrl;
      }
    }
  } catch {
    // Fallback to siteConfig.url
  }

  const baseUrl = siteUrl.replace(/\/+$/, '');

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
        articleRoutes = items.map((art: any) => ({
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

  return [...staticRoutes, ...categoryRoutes, ...techRoutes, ...articleRoutes];
}
