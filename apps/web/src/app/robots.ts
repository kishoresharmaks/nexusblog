import { MetadataRoute } from 'next';
import { siteConfig } from '@nexus/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url || 'https://nexusblog.dev';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/articles', '/categories', '/technologies', '/series', '/tags', '/write-for-us', '/api/og'],
        disallow: ['/admin', '/admin/*', '/dashboard', '/dashboard/*', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
