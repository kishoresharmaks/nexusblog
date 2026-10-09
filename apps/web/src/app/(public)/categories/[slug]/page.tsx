import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@nexus/config';
import { ArticleCard } from '@/components/public/article-card';
import { Layers, ArrowLeft, BookOpen } from 'lucide-react';
import { categoriesApi, articlesApi } from '@/lib/api-client';
import { IconRenderer } from '@/components/common/icon-renderer';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  let category: any = null;
  try {
    category = await categoriesApi.getBySlug(decodedSlug);
  } catch {
    category = null;
  }

  const categoryName = category?.name || decodedSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const description = category?.description || `Technical articles, system designs, and distributed systems guides for ${categoryName}.`;

  return {
    title: `${categoryName} Blueprints & Guides`,
    description,
    openGraph: {
      title: `${categoryName} | NexusNation Architecture Domain`,
      description,
      url: `/categories/${decodedSlug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(categoryName)}&category=ARCHITECTURE%20DOMAIN`,
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} | NexusNation`,
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(categoryName)}&category=ARCHITECTURE%20DOMAIN`,
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
    },
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  const formattedTitle = decodedSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let category: any = null;
  let articles: any[] = [];

  try {
    const [catData, articlesData] = await Promise.all([
      categoriesApi.getBySlug(decodedSlug).catch(() => null),
      articlesApi.getPublicFeed({ categorySlug: decodedSlug, limit: 20 }),
    ]);

    category = catData;
    articles = articlesData?.items || [];
  } catch (err) {
    console.error(`Failed to fetch category data for ${decodedSlug}:`, err);
  }

  const categoryName = category?.name || formattedTitle;
  const categoryDescription = category?.description || `Comprehensive collection of architecture guides, case studies, and engineering breakdowns on ${categoryName}.`;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-8 font-sans">
      <div className="space-y-3">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Categories
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 text-primary shrink-0">
            <IconRenderer value={category?.image} defaultIcon="Layers" className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {categoryName}
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          {categoryDescription}
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">
            Articles ({articles.length})
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">No articles in this category yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Check back soon as new technical deep-dives and blueprints are published weekly.
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1 text-xs font-mono text-primary font-semibold hover:underline pt-2"
            >
              Browse all articles →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

