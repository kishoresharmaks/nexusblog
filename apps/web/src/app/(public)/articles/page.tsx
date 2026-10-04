import React from 'react';
import { siteConfig } from '@nexus/config';
import { articlesApi, categoriesApi, technologiesApi } from '@/lib/api-client';
import { BookOpen } from 'lucide-react';
import { ArticlesFeed } from '@/components/public/articles-feed';

export const revalidate = 60;

interface ArticlesPageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    technology?: string;
    search?: string;
    filter?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;

  let initialArticles: any[] = [];
  let totalCount = 0;
  try {
    const res = await articlesApi.getPublicFeed({
      categorySlug: params.category,
      difficulty: params.difficulty,
      technologySlug: params.technology,
      search: params.search,
      filter: params.filter as any,
      limit: 40,
    });
    if (res?.items && Array.isArray(res.items)) {
      initialArticles = res.items;
      totalCount = res.total || res.items.length;
    }
  } catch {
    initialArticles = [];
    totalCount = 0;
  }

  // Fetch categories with fallback
  let categories: any[] = [];
  try {
    const catRes = await categoriesApi.getAll();
    if (Array.isArray(catRes) && catRes.length > 0) {
      categories = catRes;
    }
  } catch {
    categories = siteConfig.categories.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }

  if (categories.length === 0) {
    categories = siteConfig.categories.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }

  // Fetch technologies with fallback
  let technologies: any[] = [];
  try {
    const techRes = await technologiesApi.getAll();
    if (Array.isArray(techRes) && techRes.length > 0) {
      technologies = techRes;
    }
  } catch {
    technologies = siteConfig.technologies.map((name) => ({
      name,
      slug: name.toLowerCase(),
    }));
  }

  if (technologies.length === 0) {
    technologies = siteConfig.technologies.map((name) => ({
      name,
      slug: name.toLowerCase(),
    }));
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-8 font-sans">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-cyan-500" />
          <span>Engineering Knowledge Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Technical Articles &amp; Architecture Blueprints
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Explore distributed systems designs, database internals, cloud infrastructure, and low-latency benchmarks curated for backend developers and architects.
        </p>
      </div>

      {/* Interactive Articles Feed with Live Search & Filtering */}
      <ArticlesFeed
        initialArticles={initialArticles}
        initialTotal={totalCount}
        categories={categories}
        technologies={technologies}
        initialCategory={params.category}
        initialTechnology={params.technology}
        initialDifficulty={params.difficulty}
        initialSearch={params.search}
        initialFilter={params.filter}
      />
    </div>
  );
}
