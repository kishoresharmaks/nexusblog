import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pagesApi } from '@/lib/api-client';
import { StaticPageView } from '@/components/public/static-page-view';

export const revalidate = 60;

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await pagesApi.getBySlug(slug);
    if (!page) return { title: 'Page Not Found | NexusBlog' };
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || 'Technical guide and policy page on NexusBlog.',
    };
  } catch {
    return { title: 'Legal & Static Page | NexusBlog' };
  }
}

export default async function GenericDynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  let page: any = null;

  try {
    page = await pagesApi.getBySlug(slug);
  } catch {
    notFound();
  }

  if (!page) {
    notFound();
  }

  return <StaticPageView page={page} />;
}
