import React from 'react';
import { Metadata } from 'next';
import { pagesApi } from '@/lib/api-client';
import { DEFAULT_STATIC_PAGES } from '@/lib/static-page-defaults';
import { StaticPageView } from '@/components/public/static-page-view';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';

export const revalidate = 60;

const SLUG = 'terms-of-service';
const fallback = DEFAULT_STATIC_PAGES[SLUG];

export async function generateMetadata(): Promise<Metadata> {
  let title = fallback.seoTitle;
  let description = fallback.seoDescription;

  try {
    const page = await pagesApi.getBySlug(SLUG);
    if (page) {
      title = page.seoTitle || page.title;
      description = page.seoDescription || page.excerpt || fallback.seoDescription;
    }
  } catch {
    // Fallback
  }

  return {
    title,
    description,
    alternates: {
      canonical: '/terms-of-service',
    },
    openGraph: {
      title,
      description,
      url: 'https://nexusnation.in/terms-of-service',
      siteName: 'NexusNation',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@nexusnation',
      creator: '@nexusnation',
    },
  };
}

export default async function TermsOfServicePage() {
  let pageData = fallback;

  try {
    const remote = await pagesApi.getBySlug(SLUG);
    if (remote && remote.content) {
      pageData = remote;
    }
  } catch {
    // Fallback
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://nexusnation.in' },
          { name: 'Terms of Service', item: 'https://nexusnation.in/terms-of-service' },
        ]}
      />
      <StaticPageView page={pageData} />
    </>
  );
}
