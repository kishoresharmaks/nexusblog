import React from 'react';
import { siteConfig } from '@nexus/config';
import { ArticleCard } from '@/components/public/article-card';
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

  // Initial rich sample articles for instant SSR reading
  const sampleArticles = [
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
        avatar: undefined,
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
    },
    {
      id: '2',
      title: 'PostgreSQL Indexing Under High Concurrency: B-Trees vs BRIN vs GiST',
      slug: 'postgresql-indexing-under-concurrency',
      excerpt:
        'Understanding execution plans, index bloat, partial indexes, and optimizing queries handling millions of rows per hour.',
      difficulty: 'INTERMEDIATE' as const,
      type: 'DEEP_DIVE' as const,
      featured: false,
      readingTime: 8,
      viewsCount: 9800,
      publishedAt: new Date(),
      author: {
        id: 'a2',
        name: 'Elena Rostova',
        username: 'erostova',
        avatar: undefined,
      },
      category: {
        id: 'c2',
        name: 'Databases',
        slug: 'databases',
      },
      technologies: [{ id: 't3', name: 'PostgreSQL', slug: 'postgresql' }],
    },
    {
      id: '3',
      title: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
      slug: 'kafka-partitioning-zero-data-loss',
      excerpt:
        'Guaranteed message ordering, consumer group rebalancing internals, and handling backpressure in distributed event stream pipelines.',
      difficulty: 'ADVANCED' as const,
      type: 'SYSTEM_DESIGN' as const,
      featured: false,
      readingTime: 15,
      viewsCount: 12300,
      publishedAt: new Date(),
      author: {
        id: 'a1',
        name: 'Alex Rivera',
        username: 'alexdev',
        avatar: undefined,
      },
      category: {
        id: 'c3',
        name: 'Distributed Systems',
        slug: 'distributed-systems',
      },
      technologies: [
        { id: 't4', name: 'Kafka', slug: 'kafka' },
        { id: 't5', name: 'Docker', slug: 'docker' },
      ],
    },
    {
      id: '4',
      title: 'Spring Boot 3.4 & Virtual Threads (Project Loom) in Production',
      slug: 'spring-boot-virtual-threads-production',
      excerpt:
        'Benchmarking throughput and memory consumption of reactive WebFlux vs blocking I/O with carrier thread pin avoidance.',
      difficulty: 'ADVANCED' as const,
      type: 'DEEP_DIVE' as const,
      featured: false,
      readingTime: 11,
      viewsCount: 7600,
      publishedAt: new Date(),
      author: {
        id: 'a3',
        name: 'Marcus Vance',
        username: 'marcusv',
        avatar: undefined,
      },
      category: {
        id: 'c4',
        name: 'Backend Engineering',
        slug: 'backend-engineering',
      },
      technologies: [{ id: 't6', name: 'Spring Boot', slug: 'spring-boot' }],
    },
  ];

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
          <a
            href="/articles"
            className="rounded-full bg-foreground text-background px-3 py-1 font-medium font-mono"
          >
            All
          </a>
          {siteConfig.categories.slice(0, 5).map((cat) => {
            const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <a
                key={cat}
                href={`/articles?category=${slug}`}
                className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-mono"
              >
                {cat}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground">Level:</span>
          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <a
              key={lvl}
              href={`/articles?difficulty=${lvl.toUpperCase()}`}
              className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {lvl}
            </a>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
