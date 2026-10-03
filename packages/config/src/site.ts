export function normalizeMediaUrl(rawUrl?: any): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // 1. Strip localhost / 127.0.0.1 origins pointing to /uploads
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/uploads\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/uploads\//i, '/uploads/');
  }

  // 2. Strip legacy nexusblog.dev domain pointing to /uploads
  if (/^https?:\/\/(www\.)?nexusblog\.dev\/uploads\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/(www\.)?nexusblog\.dev\/uploads\//i, '/uploads/');
  }

  // 3. Fix missing leading slash for uploads
  if (/^uploads\//i.test(trimmed)) {
    return `/${trimmed}`;
  }

  // 4. Convert localhost media/images paths to /uploads/
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/(media|images)\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i, '/uploads/');
  }

  return trimmed;
}

function normalizeApiUrl(rawUrl?: string, fallback = 'http://127.0.0.1:4000/api'): string {
  const url = (rawUrl || fallback).trim().replace(/\/+$/, '');
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  return url.startsWith('/') ? (url.endsWith('/api') ? url : `${url}/api`) : `/${url}`;
}

function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.CLIENT_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://nexusnation.in';
}

function getApiUrl(): string {
  if (typeof window === 'undefined') {
    const defaultApiPort = process.env.API_PORT || process.env.PORT || 4000;
    return normalizeApiUrl(
      process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL,
      `http://127.0.0.1:${defaultApiPort}/api`,
    );
  }
  const isLiveOrigin =
    window.location?.origin &&
    !window.location.origin.includes('localhost') &&
    !window.location.origin.includes('127.0.0.1');

  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (isLiveOrigin && (!raw || raw.includes('localhost') || raw.includes('127.0.0.1'))) {
    return '/api';
  }
  return normalizeApiUrl(raw, '/api');
}

export const siteConfig = {
  name: 'NexusBlog',
  description: 'Production-Grade Technical Publishing Platform & Developer Knowledge Portal',
  url: getSiteUrl(),
  get apiUrl() {
    return getApiUrl();
  },
  ogImage: '/images/og-default.png',
  links: {
    github: 'https://github.com/nexusblog',
    twitter: 'https://twitter.com/nexusblog',
  },
  author: {
    name: 'Nexus Engineering Team',
    website: 'https://nexusnation.in',
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
