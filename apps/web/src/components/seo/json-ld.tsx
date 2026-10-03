import React from 'react';
import { siteConfig } from '@nexus/config';

interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  category: string;
  images?: string[];
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  category,
  images = [],
}: ArticleJsonLdProps) {
  const base = (() => {
    const raw = siteConfig.url;
    if (raw && !raw.includes('localhost') && !raw.includes('127.0.0.1')) {
      return raw.replace(/\/+$/, '');
    }
    return 'https://nexusnation.in';
  })();
  const url = `${base}/articles/${slug}`;
  const defaultOg = `${base}/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&author=${encodeURIComponent(authorName)}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: description,
    image: images.length > 0 ? images : [defaultOg],
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'NexusNation Engineering',
      logo: {
        '@type': 'ImageObject',
        url: `${base}/brand/png/transparent-background/nexus-192px-transparent.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  item: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
