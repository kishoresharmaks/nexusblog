import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { articlesApi } from '@/lib/api-client';
import {
  Bookmark,
  ArrowRight,
  Layers,
  Cpu,
  Database,
  Server,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { BreadcrumbJsonLd, CollectionJsonLd } from '@/components/seo/json-ld';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Industry Architecture Case Studies & Postmortems',
  description:
    'Deep architectural teardowns and failure postmortems of high-throughput production systems, distributed databases, and multi-region infrastructure on NexusNation.',
  alternates: {
    canonical: '/case-studies',
  },
  openGraph: {
    title: 'Industry Architecture Case Studies & Postmortems — NexusNation',
    description:
      'Deep architectural teardowns and failure postmortems of high-throughput production systems, distributed databases, and multi-region infrastructure.',
    url: 'https://nexusnation.in/case-studies',
    siteName: 'NexusNation',
    images: [
      {
        url: '/api/og?title=Industry%20Architecture%20Case%20Studies&category=CASE%20STUDIES',
        width: 1200,
        height: 630,
        alt: 'Industry Architecture Case Studies — NexusNation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industry Architecture Case Studies & Postmortems — NexusNation',
    description:
      'Deep architectural teardowns and failure postmortems of high-throughput production systems, distributed databases, and multi-region infrastructure.',
    site: '@nexusnation',
    creator: '@nexusnation',
    images: [
      {
        url: '/api/og?title=Industry%20Architecture%20Case%20Studies&category=CASE%20STUDIES',
        width: 1200,
        height: 630,
        alt: 'Industry Architecture Case Studies — NexusNation',
      },
    ],
  },
};

interface CaseStudiesPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function CaseStudiesPage({ searchParams }: CaseStudiesPageProps) {
  const params = await searchParams;
  let articles: any[] = [];

  try {
    const res = await articlesApi.getPublicFeed({
      type: 'CASE_STUDY',
      categorySlug: params.category,
      limit: 20,
    });
    if (res?.items && Array.isArray(res.items)) {
      articles = res.items;
    }
  } catch {
    articles = [];
  }

  // Curated fallback case studies if database is fresh
  const featuredCaseStudies = [
    {
      title: 'Designing a Distributed Rate Limiter with Redis & Lua at 100,000 QPS',
      slug: 'designing-distributed-rate-limiter',
      excerpt:
        'A comprehensive teardown of coordinating sub-millisecond rate limits across multi-region edge gateways using sliding window counter algorithms in Redis cluster.',
      category: 'System Design',
      categorySlug: 'system-design',
      readingTime: 8,
      difficulty: 'ADVANCED',
      metrics: [
        { label: 'Throughput', value: '100k QPS' },
        { label: 'Latency', value: 'p99 < 1.8ms' },
        { label: 'Availability', value: '99.999%' },
      ],
      technologies: ['Redis', 'Lua', 'NestJS', 'Docker'],
      problem: 'Coordinating high-frequency API rate limiting across 12 edge regions without lock contention or redis thread blocking.',
      solution: 'Atomic Lua scripts executing sliding-log counters with local sliding window approximations.',
    },
    {
      title: 'Zero-Downtime PostgreSQL Schema Migrations on a 5TB Database',
      slug: 'zero-downtime-postgresql-migrations',
      excerpt:
        'Safe multi-step column additions, concurrent index creation, avoiding AccessExclusiveLocks, and maintaining backward-compatible ORM contracts during live traffic.',
      category: 'Databases',
      categorySlug: 'databases',
      readingTime: 12,
      difficulty: 'EXPERT',
      metrics: [
        { label: 'Data Volume', value: '5 TB DB' },
        { label: 'Downtime', value: '0.00s' },
        { label: 'Lock Wait', value: '< 50ms' },
      ],
      technologies: ['PostgreSQL', 'Prisma', 'Docker', 'Kubernetes'],
      problem: 'Altering large tables with hundreds of millions of rows caused query timeouts due to exclusive lock queues.',
      solution: 'Expand-contract migration pipeline using shadow columns, trigger synchronization, and concurrent indexing.',
    },
    {
      title: 'Kafka Partitioning & Consumer Rebalancing for Zero Data Loss',
      slug: 'kafka-partitioning-zero-data-loss',
      excerpt:
        'Eliminating message duplication and out-of-order execution in financial transaction pipelines using custom partitioners and cooperative sticky assignors.',
      category: 'Distributed Systems',
      categorySlug: 'distributed-systems',
      readingTime: 10,
      difficulty: 'ADVANCED',
      metrics: [
        { label: 'Message Loss', value: '0.00%' },
        { label: 'Event Rate', value: '45k msgs/s' },
        { label: 'Rebalance Lag', value: '< 200ms' },
      ],
      technologies: ['Kafka', 'Spring Boot', 'Kubernetes', 'Redis'],
      problem: 'Eager partition rebalancing caused consumer stop-the-world pauses and duplicate event processing.',
      solution: 'CooperativeStickyAssignor with transactional producer IDs and exactly-once processing semantics.',
    },
  ];

  const displayStudies = articles.length > 0 ? articles : featuredCaseStudies;

  const categories = [
    { name: 'All Topics', slug: '' },
    { name: 'System Design', slug: 'system-design' },
    { name: 'Distributed Systems', slug: 'distributed-systems' },
    { name: 'Databases & Storage', slug: 'databases' },
    { name: 'DevOps & Cloud', slug: 'devops' },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-12 font-sans">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://nexusnation.in' },
          { name: 'Case Studies', item: 'https://nexusnation.in/case-studies' },
        ]}
      />
      <CollectionJsonLd
        name="Industry Architecture Case Studies & Postmortems — NexusNation"
        description="Deep architectural teardowns and failure postmortems of high-throughput production systems, distributed databases, and multi-region infrastructure on NexusNation."
        url="https://nexusnation.in/case-studies"
      />
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono text-primary font-semibold">
          <Bookmark className="h-3.5 w-3.5 text-primary" />
          <span>Knowledge Hub • Case Studies</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Architectural Case Studies &amp; System Postmortems
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          In-depth breakdowns of production architectures, consensus protocol bottlenecks, extreme database migrations, and high-throughput infrastructure running at scale.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-y border-border/50 py-4 font-mono text-xs">
        <span className="text-muted-foreground mr-2 font-semibold">Filter:</span>
        {categories.map((cat) => {
          const isSelected = (!params.category && cat.slug === '') || params.category === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={cat.slug ? `/case-studies?category=${cat.slug}` : '/case-studies'}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                isSelected
                  ? 'bg-foreground text-background font-bold shadow-xs'
                  : 'border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Case Studies Grid */}
      <div className="grid grid-cols-1 gap-8">
        {displayStudies.map((study: any, idx: number) => {
          const metrics = study.metrics || [
            { label: 'Architecture', value: 'Production' },
            { label: 'Status', value: 'Verified' },
            { label: 'Reading Time', value: `${study.readingTime || 8} min` },
          ];
          const techList = study.technologies || ['Distributed Systems', 'Architecture'];

          return (
            <div
              key={study.slug || idx}
              className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 md:p-10 shadow-sm hover:border-primary/40 hover:shadow-md transition-all space-y-6 group relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                    {typeof study.category === 'object' && study.category
                      ? study.category.name || study.category.slug
                      : typeof study.category === 'string'
                      ? study.category
                      : 'System Design'}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {study.readingTime || 8} min read
                  </span>
                </div>

                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  {study.difficulty || 'ADVANCED'}
                </span>
              </div>

              <div className="space-y-3">
                <Link href={`/articles/${study.slug}`} className="block">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
                    {study.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {study.excerpt || study.description}
                </p>
              </div>

              {/* Problem vs Solution Summary */}
              {study.problem && study.solution && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 text-xs">
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-rose-400 uppercase text-[10px] tracking-wider">
                      The Architecture Bottleneck:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">{study.problem}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-emerald-400 uppercase text-[10px] tracking-wider">
                      The Engineering Solution:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">{study.solution}</p>
                  </div>
                </div>
              )}

              {/* Metrics Highlights Bar */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40 font-mono text-center">
                {metrics.map((m: any, mIdx: number) => (
                  <div key={mIdx} className="space-y-0.5">
                    <p className="text-base sm:text-lg font-extrabold text-foreground">{m.value}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Tech Badges & Read Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {techList.map((tech: any, tIdx: number) => {
                    const techName =
                      typeof tech === 'string'
                        ? tech
                        : typeof tech === 'object' && tech
                        ? tech.name || tech.slug || ''
                        : '';
                    if (!techName) return null;
                    return (
                      <span
                        key={tech?.id || tech?.slug || tIdx}
                        className="px-2.5 py-1 rounded-lg bg-muted border border-border/60 text-muted-foreground"
                      >
                        #{techName.toLowerCase()}
                      </span>
                    );
                  })}
                </div>

                <Link
                  href={`/articles/${study.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background font-mono font-bold text-xs hover:bg-foreground/90 transition-all group-hover:translate-x-0.5 self-start sm:self-auto shrink-0 shadow-sm"
                >
                  <span>Read Full Case Study</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
