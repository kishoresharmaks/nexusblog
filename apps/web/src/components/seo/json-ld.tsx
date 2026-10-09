import React from 'react';
import { siteConfig } from '@nexus/config';

/**
 * Root WebSite & Organization Schema Graph
 * Establishes NexusNation as an authoritative entity in System Design & Backend Engineering.
 */
export function WebSiteOrgJsonLd() {
  const base = siteConfig.url || 'https://nexusnation.in';
  const cleanBase = base.replace(/\/+$/, '');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${cleanBase}/#website`,
        url: `${cleanBase}/`,
        name: 'NexusNation',
        alternateName: ['NexusNation Engineering', 'NexusNation Tech Portal', 'NexusNation Platform'],
        description:
          'Explore production-grade system design, backend engineering, distributed systems, and real-world software architecture guides with practical code and engineering insights.',
        publisher: {
          '@id': `${cleanBase}/#organization`,
        },
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${cleanBase}/articles?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${cleanBase}/#organization`,
        name: 'NexusNation',
        legalName: 'NexusNation',
        url: `${cleanBase}/`,
        logo: {
          '@type': 'ImageObject',
          '@id': `${cleanBase}/#logo`,
          url: `${cleanBase}/brand/original/nexus-master-original.png`,
          contentUrl: `${cleanBase}/brand/original/nexus-master-original.png`,
          caption: 'NexusNation — System Design & Backend Engineering',
        },
        image: {
          '@id': `${cleanBase}/#logo`,
        },
        sameAs: [
          'https://github.com/nexusnation',
          'https://twitter.com/nexusnation',
        ],
        knowsAbout: [
          'System Design',
          'Backend Engineering',
          'Distributed Systems',
          'Database Internals',
          'Software Architecture',
          'APIs & Microservices',
          'Cloud Infrastructure',
          'Low-Latency Systems',
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

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
  keywords?: string[];
  pathPrefix?: string;
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
  keywords = [],
  pathPrefix = '/articles',
}: ArticleJsonLdProps) {
  const base = (siteConfig.url || 'https://nexusnation.in').replace(/\/+$/, '');
  const url = `${base}${pathPrefix}/${slug}`;
  const defaultOg = `${base}/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&author=${encodeURIComponent(authorName)}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${url}#article`,
        isPartOf: {
          '@id': `${base}/#website`,
        },
        headline: title,
        description: description,
        inLanguage: 'en-US',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        datePublished: datePublished,
        dateModified: dateModified || datePublished,
        author: {
          '@type': 'Person',
          name: authorName,
          ...(authorUrl ? { url: authorUrl } : {}),
        },
        publisher: {
          '@id': `${base}/#organization`,
        },
        image: images.length > 0 ? images : [defaultOg],
        articleSection: category,
        keywords: keywords.length > 0 ? keywords.join(', ') : category,
        proficiencyLevel: 'Expert',
      },
    ],
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

interface CollectionJsonLdProps {
  name: string;
  description: string;
  url: string;
}

export function CollectionJsonLd({ name, description, url }: CollectionJsonLdProps) {
  const base = (siteConfig.url || 'https://nexusnation.in').replace(/\/+$/, '');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url: url,
    name: name,
    description: description,
    isPartOf: {
      '@id': `${base}/#website`,
    },
    publisher: {
      '@id': `${base}/#organization`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
