'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArticleCard } from '@/components/public/article-card';
import { IconRenderer } from '@/components/common/icon-renderer';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

export interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  articleCount?: number;
  order?: number;
}

interface CategoryArticlesSectionProps {
  categories: CategoryItem[];
  articles: any[];
}

export function CategoryArticlesSection({
  categories,
  articles,
}: CategoryArticlesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // 1. Calculate article count per category
  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const art of articles) {
      const slug = art.category?.slug?.toLowerCase();
      if (slug) {
        map[slug] = (map[slug] || 0) + 1;
      }
    }
    return map;
  }, [articles]);

  // 2. Sort categories by presence of articles, then by order
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const countA = categoryCountMap[a.slug.toLowerCase()] ?? (a.articleCount || 0);
      const countB = categoryCountMap[b.slug.toLowerCase()] ?? (b.articleCount || 0);
      if (countA > 0 && countB === 0) return -1;
      if (countB > 0 && countA === 0) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [categories, categoryCountMap]);

  // 3. Filter articles by selected category and sort strictly by latest date
  const filteredArticles = useMemo(() => {
    let result = articles;
    if (selectedCategory !== 'all') {
      result = articles.filter(
        (art) => art.category?.slug?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return [...result].sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [articles, selectedCategory]);

  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return categories.find(
      (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [categories, selectedCategory]);

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = filteredArticles.length > visibleCount;

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setVisibleCount(6);
  };

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6">
        <div className="space-y-1.5 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Explore Blogs by Category
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            In-depth engineering deep-dives, distributed architectures, and tutorials organized by technical domain.
          </p>
        </div>

        <Link
          href="/categories"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline self-start sm:self-auto shrink-0 pb-1"
        >
          <span>All Categories</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Modern Category Tabs Bar (Zero Scrollbar) */}
      <div className="mb-6">
        <div
          className="flex flex-wrap items-center gap-2 sm:gap-2.5 no-scrollbar py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* "All Topics" Tab */}
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-foreground text-background shadow-md font-semibold ring-1 ring-foreground/20 scale-[1.01]'
                : 'border border-border/70 bg-card/70 hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground backdrop-blur-xs'
            }`}
          >
            <FolderOpen
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                selectedCategory === 'all' ? 'text-background scale-110' : 'text-primary'
              }`}
            />
            <span>All Topics</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                selectedCategory === 'all'
                  ? 'bg-background/25 text-background'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {articles.length}
            </span>
          </button>

          {/* Individual Category Tabs */}
          {sortedCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            const count = categoryCountMap[cat.slug.toLowerCase()] ?? (cat.articleCount || 0);

            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-foreground text-background shadow-md font-semibold ring-1 ring-foreground/20 scale-[1.01]'
                    : 'border border-border/70 bg-card/70 hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground backdrop-blur-xs'
                }`}
              >
                <div className="h-4 w-4 flex items-center justify-center shrink-0">
                  <IconRenderer
                    value={cat.image}
                    defaultIcon="Layers"
                    className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 ${
                      isSelected ? 'text-background' : 'text-primary'
                    }`}
                  />
                </div>
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected
                        ? 'bg-background/25 text-background'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Context Banner */}
      {activeCategoryObj && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-scale shadow-2xs">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 text-primary shrink-0 shadow-2xs">
              <IconRenderer value={activeCategoryObj.image} defaultIcon="Layers" className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {activeCategoryObj.name}
                </h3>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-mono font-semibold text-primary">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'}
                </span>
              </div>
              {activeCategoryObj.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                  {activeCategoryObj.description}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/categories/${activeCategoryObj.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline shrink-0 self-start sm:self-center bg-primary/10 sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-lg transition-colors"
          >
            <span>Explore {activeCategoryObj.name} archive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Articles Grid with Smooth Transition */}
      <div key={selectedCategory} className="animate-fade-in-scale">
        {displayedArticles.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{
                    ...article,
                    category: article.category || {
                      name: activeCategoryObj?.name || 'System Design',
                      slug: activeCategoryObj?.slug || 'system-design',
                    },
                    author: article.author || { name: 'Alex Rivera', username: 'alexdev' },
                  }}
                />
              ))}
            </div>

            {/* Action Footer: Load More / View All Category Articles */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-mono font-semibold transition-all duration-200 cursor-pointer shadow-xs hover:border-foreground/30"
                >
                  <span>Load More Articles ({filteredArticles.length - visibleCount} remaining)</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {selectedCategory !== 'all' && activeCategoryObj && (
                <Link
                  href={`/categories/${activeCategoryObj.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-mono font-semibold transition-all duration-200 shadow-xs hover:shadow-md"
                >
                  <span>Browse All {activeCategoryObj.name} Guides ({filteredArticles.length})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {selectedCategory === 'all' && articles.length > displayedArticles.length && (
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-mono font-semibold transition-all duration-200 shadow-xs hover:shadow-md"
                >
                  <span>Explore Full Engineering Archive ({articles.length})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="py-14 sm:py-16 text-center space-y-3.5 rounded-2xl border border-dashed border-border bg-card/40 p-6">
            <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-foreground">
                No publications in {activeCategoryObj?.name || 'this category'} yet
              </h4>
              <p className="text-xs text-muted-foreground">
                New architectural breakdowns and peer-reviewed articles are published weekly.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-primary font-semibold hover:underline cursor-pointer"
              >
                <span>View all categories</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <span>&bull;</span>
              <Link
                href="/guest-post/submit"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                <span>Submit a guest post</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
