'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  Filter,
  X,
  Loader2,
  Sparkles,
  ArrowUpDown,
  Tag,
  Layers,
  Cpu,
  Flame,
  Bookmark,
  Clock,
  ThumbsUp,
} from 'lucide-react';
import { ArticleCard, ArticleCardItem } from './article-card';
import { articlesApi, analyticsApi } from '@/lib/api-client';

interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
}

interface TechnologyItem {
  id?: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface ArticlesFeedProps {
  initialArticles: ArticleCardItem[];
  initialTotal: number;
  categories: CategoryItem[];
  technologies: TechnologyItem[];
  initialCategory?: string;
  initialTechnology?: string;
  initialDifficulty?: string;
  initialSearch?: string;
  initialFilter?: string;
}

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest Blueprints', icon: Clock },
  { id: 'popular', label: 'Most Viewed', icon: Flame },
  { id: 'bookmarked', label: 'Most Bookmarked', icon: Bookmark },
  { id: 'liked', label: 'Top Rated', icon: ThumbsUp },
  { id: 'quick_read', label: 'Quick Read (< 5m)', icon: Clock },
  { id: 'deep_dive', label: 'Deep Dive (> 10m)', icon: BookOpen },
];

const DIFFICULTY_LEVELS = [
  { id: 'ALL', label: 'All Levels' },
  { id: 'BEGINNER', label: 'Beginner' },
  { id: 'INTERMEDIATE', label: 'Intermediate' },
  { id: 'ADVANCED', label: 'Advanced' },
  { id: 'EXPERT', label: 'Expert' },
];

const POPULAR_SEARCH_CHIPS = [
  'Redis',
  'Kafka',
  'PostgreSQL',
  'System Design',
  'Distributed Systems',
  'NestJS',
  'Docker',
  'RAG',
];

export function ArticlesFeed({
  initialArticles,
  initialTotal,
  categories,
  technologies,
  initialCategory = '',
  initialTechnology = '',
  initialDifficulty = 'ALL',
  initialSearch = '',
  initialFilter = 'latest',
}: ArticlesFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTech, setSelectedTech] = useState(initialTechnology);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [selectedSort, setSelectedSort] = useState(initialFilter);

  const [articles, setArticles] = useState<ArticleCardItem[]>(initialArticles);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 280);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync state to URL without full refresh
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory && selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedTech && selectedTech !== 'ALL') params.set('technology', selectedTech);
    if (selectedDifficulty && selectedDifficulty !== 'ALL') params.set('difficulty', selectedDifficulty);
    if (selectedSort && selectedSort !== 'latest') params.set('filter', selectedSort);

    const queryString = params.toString();
    const targetUrl = queryString ? `/articles?${queryString}` : '/articles';
    startTransition(() => {
      router.replace(targetUrl, { scroll: false });
    });
  }, [debouncedSearch, selectedCategory, selectedTech, selectedDifficulty, selectedSort, router]);

  // Query API when filters change
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await articlesApi.getPublicFeed({
        search: debouncedSearch || undefined,
        categorySlug: selectedCategory && selectedCategory !== 'ALL' ? selectedCategory : undefined,
        technologySlug: selectedTech && selectedTech !== 'ALL' ? selectedTech : undefined,
        difficulty: selectedDifficulty && selectedDifficulty !== 'ALL' ? selectedDifficulty : undefined,
        filter: selectedSort as any,
        limit: 40,
      });

      const items = res.items || [];
      setArticles(items);
      setTotalCount(res.total || items.length);

      // Log telemetry for search queries
      if (debouncedSearch) {
        analyticsApi.logSearchQuery(debouncedSearch, items.length).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
      setArticles([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedTech, selectedDifficulty, selectedSort]);

  // Trigger fetch on filter modification (skip initial mount if matching initial props)
  const isFirstMount = React.useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    fetchArticles();
  }, [fetchArticles]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedTech('');
    setSelectedDifficulty('ALL');
    setSelectedSort('latest');
  };

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      (selectedCategory && selectedCategory !== 'ALL') ||
      (selectedTech && selectedTech !== 'ALL') ||
      (selectedDifficulty && selectedDifficulty !== 'ALL') ||
      selectedSort !== 'latest',
  );

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Interactive Search & Sort Bar */}
      <div className="space-y-4 rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-cyan-500">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search engineering blueprints, algorithms, databases, keywords..."
              className="w-full rounded-2xl border border-border bg-background/90 py-3 pl-11 pr-11 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-2xs transition-all"
            />
            {isLoading ? (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
                <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" />
              </div>
            ) : search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {/* Sort Dropdown Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative inline-flex items-center">
              <span className="absolute left-3 pointer-events-none text-muted-foreground">
                <ArrowUpDown className="h-3.5 w-3.5 text-cyan-500" />
              </span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none rounded-2xl border border-border bg-background/90 py-3 pl-9 pr-9 text-xs sm:text-sm font-mono font-medium text-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-2xs cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-card text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 pointer-events-none text-[10px] text-muted-foreground font-mono">
                ▼
              </span>
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-xs font-mono font-semibold text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Reset all active search and filter constraints"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Popular Search Suggestions */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-border/40">
          <span className="text-muted-foreground font-mono text-[11px] flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-500" /> Suggestions:
          </span>
          {POPULAR_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setSearch(chip)}
              className="px-2.5 py-1 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground font-mono text-[11px] transition-colors cursor-pointer"
            >
              #{chip}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Taxonomy & Difficulty Filters Bar */}
      <div className="space-y-4">
        {/* Categories Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
              <Layers className="h-3.5 w-3.5 text-cyan-500" /> Topic Categories
            </span>
            <span>{categories.length} Topics</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                !selectedCategory
                  ? 'bg-foreground text-background shadow-xs font-bold'
                  : 'border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-black font-bold shadow-xs'
                      : 'border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Technologies & Difficulty Multi-Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-border/40">
          {/* Technology Stacks */}
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" /> Technology Hubs
              </span>
              {selectedTech && selectedTech !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedTech('')}
                  className="text-[11px] text-cyan-500 hover:underline cursor-pointer"
                >
                  Clear Tech Filter
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {technologies.slice(0, 10).map((tech) => {
                const isSelected = selectedTech === tech.slug;
                return (
                  <button
                    key={tech.slug}
                    type="button"
                    onClick={() => setSelectedTech(isSelected ? '' : tech.slug)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-bold'
                        : 'border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {tech.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Level Segmented Control */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
                <Filter className="h-3.5 w-3.5 text-amber-400" /> Difficulty Level
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {DIFFICULTY_LEVELS.map((lvl) => {
                const isSelected = selectedDifficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(lvl.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'border border-amber-500/40 bg-amber-500/15 text-amber-400 font-bold'
                        : 'border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Results Overview Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 pt-2 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-500" />
          <span>
            Showing <strong className="text-foreground">{articles.length}</strong> of{' '}
            <strong className="text-foreground">{totalCount}</strong> published blueprints
          </span>
        </div>

        {hasActiveFilters && (
          <span className="text-[11px] text-cyan-400 font-semibold hidden sm:inline">
            Filters Active
          </span>
        )}
      </div>

      {/* 4. Articles Grid / Empty State */}
      {articles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center space-y-4 font-mono">
          <div className="h-14 w-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="h-7 w-7 text-cyan-500/70" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-foreground">No Engineering Blueprints Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No published articles match your active search terms and filter criteria. Try adjusting keywords or resetting filters.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl bg-cyan-500 text-black px-4 py-2 text-xs font-bold hover:bg-cyan-400 transition-colors cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
            <Link
              href="/write-for-us"
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              Contribute This Topic &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id || article.slug}
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
