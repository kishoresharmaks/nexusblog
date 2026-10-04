'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  BookOpen,
  Clock,
  Tag,
  Hash,
  X,
  Sparkles,
  Layers,
  Cpu,
  Loader2,
  Filter,
  Flame,
  Calendar,
} from 'lucide-react';
import { ArticleCard } from '@/components/public/article-card';
import { articlesApi, categoriesApi, technologiesApi } from '@/lib/api-client';
import { logSearchTelemetry } from '@/lib/search-telemetry';

const SUGGESTED_QUERIES = [
  'Redis',
  'Kafka',
  'PostgreSQL',
  'System Design',
  'NestJS',
  'Distributed Systems',
  'RAG',
  'Microservices',
  'Docker',
  'Next.js',
];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialTechnology = searchParams.get('tech') || 'ALL';
  const initialDifficulty = searchParams.get('difficulty') || 'ALL';
  const initialFilter = (searchParams.get('filter') as 'featured' | 'popular' | undefined) || undefined;

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(initialDifficulty);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedTech, setSelectedTech] = useState<string>(initialTechnology);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'featured' | 'popular'>(
    initialFilter || 'all',
  );

  const [articles, setArticles] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load available categories and technologies for filter dropdowns
  useEffect(() => {
    Promise.all([
      categoriesApi.getAll().catch(() => []),
      technologiesApi.getAll().catch(() => []),
    ]).then(([cats, techs]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setTechnologies(Array.isArray(techs) ? techs : []);
    });
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (selectedCategory && selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedTech && selectedTech !== 'ALL') params.set('tech', selectedTech);
    if (selectedDifficulty && selectedDifficulty !== 'ALL') params.set('difficulty', selectedDifficulty);
    if (selectedFilter && selectedFilter !== 'all') params.set('filter', selectedFilter);

    const qs = params.toString();
    const newUrl = qs ? `/search?${qs}` : '/search';
    router.replace(newUrl, { scroll: false });
  }, [debouncedQuery, selectedCategory, selectedTech, selectedDifficulty, selectedFilter, router]);

  // Fetch articles based on active filters
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await articlesApi.getPublicFeed({
        search: debouncedQuery || undefined,
        categorySlug: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        technologySlug: selectedTech !== 'ALL' ? selectedTech : undefined,
        difficulty: selectedDifficulty !== 'ALL' ? selectedDifficulty : undefined,
        filter: selectedFilter !== 'all' ? selectedFilter : undefined,
        limit: 30,
      });

      const items = res.items || [];
      setArticles(items);
      setTotalCount(res.total || items.length);

      if (debouncedQuery) {
        logSearchTelemetry(debouncedQuery, items.length, false);
      }
    } catch (err) {
      console.error('Failed to fetch search results:', err);
      setArticles([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedCategory, selectedTech, selectedDifficulty, selectedFilter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const clearAllFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedCategory('ALL');
    setSelectedTech('ALL');
    setSelectedDifficulty('ALL');
    setSelectedFilter('all');
  };

  const hasActiveFilters =
    query ||
    selectedCategory !== 'ALL' ||
    selectedTech !== 'ALL' ||
    selectedDifficulty !== 'ALL' ||
    selectedFilter !== 'all';

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-8 font-sans">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Search className="h-3.5 w-3.5 text-cyan-500" />
          <span>Full-Text Engineering Search</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Search Technical Articles &amp; Blueprints
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Explore distributed systems designs, database internals, cloud architectures, and production-grade engineering guides.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative max-w-3xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-cyan-500">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, technology (e.g. Redis, Kafka, Raft), or topic..."
          className="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-12 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm transition-all"
        />
        {isLoading ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" />
          </div>
        ) : query ? (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Suggested Quick Search Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground font-mono text-[11px]">Suggested:</span>
        {SUGGESTED_QUERIES.map((item) => (
          <button
            key={item}
            onClick={() => setQuery(item)}
            className="px-2.5 py-1 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground font-mono text-[11px] transition-colors"
          >
            #{item}
          </button>
        ))}
      </div>

      {/* Filter Controls Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground font-mono uppercase tracking-wider">
            <SlidersHorizontal className="h-4 w-4 text-cyan-500" />
            <span>Refine Search Results</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-500 hover:underline font-mono font-medium flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-muted-foreground uppercase">
              Architecture Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Technology Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-muted-foreground uppercase">
              Technology Stack
            </label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Technologies</option>
              {technologies.map((tech) => (
                <option key={tech.id} value={tech.slug}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-muted-foreground uppercase">
              Engineering Depth
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Depths</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          {/* Sort / Ranking Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-muted-foreground uppercase">
              Sort By
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Latest Published</option>
              <option value="popular">Most Popular (Views)</option>
              <option value="featured">Featured Blueprints</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <p className="text-xs font-mono text-muted-foreground">
          Found <strong className="text-foreground">{totalCount}</strong> published blueprint
          {totalCount === 1 ? '' : 's'}
          {debouncedQuery && (
            <span>
              {' '}
              matching &quot;<strong className="text-cyan-500">{debouncedQuery}</strong>&quot;
            </span>
          )}
        </p>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-pulse"
            >
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4 rounded-2xl border border-dashed border-border bg-card/40">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">No matching blueprints found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn&apos;t find any published articles matching your criteria. Try loosening your filters or searching for broader topics.
            </p>
          </div>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Clear Filters &amp; Browse All
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
            <span>Loading search engine...</span>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
