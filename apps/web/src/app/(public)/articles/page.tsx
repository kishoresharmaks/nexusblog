import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { ArticleCard } from '@/components/public/article-card';
import { articlesApi, categoriesApi } from '@/lib/api-client';
import { BookOpen, Filter, Search, Sparkles } from 'lucide-react';

export const revalidate = 60;

interface ArticlesPageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    technology?: string;
    search?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;

  let articles: any[] = [];
  try {
    const res = await articlesApi.getPublicFeed({
      categorySlug: params.category,
      difficulty: params.difficulty,
      technologySlug: params.technology,
      search: params.search,
    });
    if (res?.items && Array.isArray(res.items)) {
      articles = res.items;
    }
  } catch {
    articles = [];
  }

  // Fetch categories from API with fallback
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

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span>Engineering Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Technical Articles & Blueprints
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
          Browse all architecture case studies, tutorials, and benchmarks curated for distributed systems and backend developers.
        </p>
      </div>

      {/* Filter & Topic Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border/40 py-4 text-xs font-sans">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Categories:
          </span>
          <Link
            href="/articles"
            className={`rounded-full px-3 py-1 font-medium font-mono transition-colors ${
              !params.category ? 'bg-foreground text-background' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </Link>
          {categories.slice(0, 6).map((cat: any) => {
            const isSelected = params.category === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/articles?category=${cat.slug}`}
                className={`rounded-full px-3 py-1 transition-colors font-mono ${
                  isSelected
                    ? 'bg-foreground text-background font-semibold'
                    : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground">Level:</span>
          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
            const isSelected = params.difficulty === lvl.toUpperCase();
            return (
              <Link
                key={lvl}
                href={`/articles?difficulty=${lvl.toUpperCase()}`}
                className={`rounded border px-2 py-0.5 font-mono text-[11px] transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground font-semibold'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {lvl}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3 font-mono">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No articles match your filter criteria.</p>
          <Link href="/articles" className="text-xs text-primary underline">
            Reset all filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={{
                ...article,
                category: article.category || { name: 'System Design', slug: 'system-design' },
                author: article.author || { name: 'Alex Rivera', username: 'alexdev' },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
