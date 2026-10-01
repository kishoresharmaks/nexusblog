import React from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, BookOpen, Clock, ArrowRight } from 'lucide-react';

export default function SeriesIndexPage() {
  const seriesList = [
    {
      id: 's1',
      title: 'Distributed Systems & Microservices from Zero to Production',
      slug: 'distributed-systems-from-zero',
      description:
        'A comprehensive multi-part guide covering consensus algorithms (Raft), CQRS, event sourcing with Kafka, and cross-service saga orchestration in NestJS & Go.',
      articleCount: 6,
      completedCount: 6,
      updatedAt: '2026-09-20',
      difficulty: 'ADVANCED',
      coverGradient: 'from-blue-600/20 to-cyan-600/10',
    },
    {
      id: 's2',
      title: 'High-Performance PostgreSQL & TimescaleDB at Scale',
      slug: 'postgresql-at-scale',
      description:
        'Practical indexing strategies, query execution planner internals, connection pooling with PgBouncer, and partitioning terabyte-scale datasets.',
      articleCount: 4,
      completedCount: 4,
      updatedAt: '2026-09-15',
      difficulty: 'INTERMEDIATE',
      coverGradient: 'from-emerald-600/20 to-teal-600/10',
    },
    {
      id: 's3',
      title: 'Production Kubernetes & Cloud-Native Observability',
      slug: 'production-kubernetes-observability',
      description:
        'Master zero-downtime rolling deployments, OpenTelemetry distributed tracing, Prometheus SLO alerting, and custom Kubernetes operators.',
      articleCount: 5,
      completedCount: 5,
      updatedAt: '2026-09-10',
      difficulty: 'ADVANCED',
      coverGradient: 'from-purple-600/20 to-pink-600/10',
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 font-sans">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>Curated Learning Tracks</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Technical Series
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Step-by-step engineering tracks designed to take you from foundational fundamentals to architecting production systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seriesList.map((series) => (
          <Link
            key={series.id}
            href={`/series/${series.slug}`}
            className="group rounded-xl border border-border/70 bg-card/60 p-6 hover:border-border hover:shadow-md hover:bg-card transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-md">
                  <BookOpen className="h-3.5 w-3.5" />
                  {series.articleCount} Parts
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {series.difficulty}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {series.title}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {series.description}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs font-mono text-primary">
              <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Start Track <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] text-muted-foreground font-sans">
                {series.completedCount}/{series.articleCount} available
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
