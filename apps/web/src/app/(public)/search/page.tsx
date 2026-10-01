'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { ArticleCard } from '@/components/public/article-card';

const SAMPLE_DATABASE = [
  {
    id: '1',
    title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
    slug: 'designing-distributed-rate-limiter',
    excerpt:
      'A deep dive into sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.',
    difficulty: 'ADVANCED' as const,
    type: 'SYSTEM_DESIGN' as const,
    featured: true,
    readingTime: 12,
    viewsCount: 14200,
    publishedAt: new Date(),
    author: {
      id: 'a1',
      name: 'Alex Rivera',
      username: 'alexdev',
    },
    category: {
      id: 'c1',
      name: 'System Design',
      slug: 'system-design',
    },
    technologies: [
      { id: 't1', name: 'Redis', slug: 'redis' },
      { id: 't2', name: 'NestJS', slug: 'nestjs' },
    ],
    tags: [
      { id: 'tg1', name: 'Distributed Systems', slug: 'distributed-systems' },
      { id: 'tg2', name: 'Rate Limiting', slug: 'rate-limiting' },
    ],
  },
  {
    id: '2',
    title: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
    slug: 'zero-downtime-postgresql-migrations',
    excerpt:
      'Safe table alteration patterns, concurrent index creation, avoiding lock queues, and backward-compatible contract testing with Prisma.',
    difficulty: 'ADVANCED' as const,
    type: 'DEEP_DIVE' as const,
    featured: true,
    readingTime: 16,
    viewsCount: 22400,
    publishedAt: new Date(),
    author: {
      id: 'a1',
      name: 'Alex Rivera',
      username: 'alexdev',
    },
    category: {
      id: 'c2',
      name: 'Databases',
      slug: 'databases',
    },
    technologies: [
      { id: 't3', name: 'PostgreSQL', slug: 'postgresql' },
      { id: 't4', name: 'Prisma', slug: 'prisma' },
    ],
    tags: [
      { id: 'tg3', name: 'Database Internals', slug: 'database-internals' },
      { id: 'tg4', name: 'Migrations', slug: 'migrations' },
    ],
  },
  {
    id: '3',
    title: 'Kafka Consumer Group Rebalancing & Exactly-Once Semantics',
    slug: 'kafka-consumer-rebalancing-internals',
    excerpt:
      'Demystifying cooperative sticky assignors, static group membership, and transactional outbox patterns in high-throughput streaming systems.',
    difficulty: 'EXPERT' as const,
    type: 'DEEP_DIVE' as const,
    featured: false,
    readingTime: 18,
    viewsCount: 9100,
    publishedAt: new Date(),
    author: {
      id: 'a2',
      name: 'Elena Rostova',
      username: 'erostova',
    },
    category: {
      id: 'c3',
      name: 'Backend Architecture',
      slug: 'backend',
    },
    technologies: [
      { id: 't5', name: 'Kafka', slug: 'kafka' },
    ],
    tags: [
      { id: 'tg5', name: 'Event Driven', slug: 'event-driven' },
    ],
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredArticles = useMemo(() => {
    return SAMPLE_DATABASE.filter((art) => {
      const matchQuery =
        !query ||
        art.title.toLowerCase().includes(query.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        art.category.name.toLowerCase().includes(query.toLowerCase()) ||
        art.technologies.some((t) => t.name.toLowerCase().includes(query.toLowerCase())) ||
        art.tags?.some((t) => t.name.toLowerCase().includes(query.toLowerCase()));

      const matchDifficulty =
        selectedDifficulty === 'ALL' || art.difficulty === selectedDifficulty;

      const matchCategory =
        selectedCategory === 'ALL' || art.category.slug === selectedCategory;

      return matchQuery && matchDifficulty && matchCategory;
    });
  }, [query, selectedDifficulty, selectedCategory]);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-8 font-sans">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Search className="h-3.5 w-3.5 text-primary" />
          <span>Full-Text Search</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Search Engineering Guides
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Explore architecture blueprints, performance deep dives, and system design case studies.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-3xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, technology (e.g. Redis, Kafka, Raft), or topic..."
          className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60">
          {['ALL', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                selectedDifficulty === diff
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {diff === 'ALL' ? 'All Levels' : diff}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60">
          {[
            { label: 'All Topics', val: 'ALL' },
            { label: 'System Design', val: 'system-design' },
            { label: 'Databases', val: 'databases' },
            { label: 'Backend', val: 'backend' },
          ].map((cat) => (
            <button
              key={cat.val}
              onClick={() => setSelectedCategory(cat.val)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                selectedCategory === cat.val
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filteredArticles.length}</span> result{filteredArticles.length === 1 ? '' : 's'}
          {query && (
            <span>
              {' '}
              for &quot;<span className="text-foreground font-semibold">{query}</span>&quot;
            </span>
          )}
        </p>
      </div>

      {/* Results Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
          <p className="text-base font-semibold text-foreground">No matching articles found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or filters to find what you are looking for.
          </p>
        </div>
      )}
    </div>
  );
}
