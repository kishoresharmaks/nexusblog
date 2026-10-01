import React from 'react';

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
  const url = `https://nexusblog.dev/articles/${slug}`;
  const defaultOg = `https://nexusblog.dev/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&author=${encodeURIComponent(authorName)}`;

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
      name: 'NexusBlog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nexusblog.dev/logo.png',
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
