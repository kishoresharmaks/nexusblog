function normalizeApiUrl(rawUrl?: string, fallback = 'http://127.0.0.1:4000/api'): string {
  const url = (rawUrl || fallback).trim().replace(/\/+$/, '');
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  return url.startsWith('/') ? (url.endsWith('/api') ? url : `${url}/api`) : `/${url}`;
}

export const siteConfig = {
  name: 'NexusBlog',
  description: 'Production-Grade Technical Publishing Platform & Developer Knowledge Portal',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    'http://localhost:3000',
  apiUrl:
    typeof window === 'undefined'
      ? normalizeApiUrl(process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL, 'http://127.0.0.1:4000/api')
      : normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL, '/api'),
  ogImage: '/images/og-default.png',
  links: {
    github: 'https://github.com/nexusblog',
    twitter: 'https://twitter.com/nexusblog',
  },
  author: {
    name: 'Nexus Engineering Team',
    website: 'https://nexusblog.dev',
  },
  categories: [
    'System Design',
    'Backend Engineering',
    'Distributed Systems',
    'Databases',
    'APIs',
    'DevOps',
    'Cloud',
    'Performance',
    'Observability',
    'AI / Engineering',
  ],
  technologies: [
    'Redis',
    'Kafka',
    'PostgreSQL',
    'MongoDB',
    'NestJS',
    'Spring Boot',
    'Next.js',
    'Kubernetes',
    'Docker',
  ],
};
