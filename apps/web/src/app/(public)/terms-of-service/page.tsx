import React from 'react';
import { Metadata } from 'next';
import { pagesApi } from '@/lib/api-client';
import { DEFAULT_STATIC_PAGES } from '@/lib/static-page-defaults';
import { StaticPageView } from '@/components/public/static-page-view';

export const revalidate = 60;

const SLUG = 'terms-of-service';
const fallback = DEFAULT_STATIC_PAGES[SLUG];

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pagesApi.getBySlug(SLUG);
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || fallback.seoDescription,
    };
  } catch {
    return {
      title: fallback.seoTitle,
      description: fallback.seoDescription,
    };
  }
}

export default async function TermsOfServicePage() {
  let pageData = fallback;

  try {
    const remote = await pagesApi.getBySlug(SLUG);
    if (remote && remote.content) {
      pageData = remote;
    }
  } catch {
    // Graceful fallback to default content
  }

  return <StaticPageView page={pageData} />;
}
