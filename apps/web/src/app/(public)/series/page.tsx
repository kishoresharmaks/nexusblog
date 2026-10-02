import React from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, BookOpen, Clock, ArrowRight, Sparkles, CheckCircle2, Shield, Cpu, Database } from 'lucide-react';
import { seriesApi } from '@/lib/api-client';

export const revalidate = 60;

export default async function SeriesIndexPage() {
  let seriesList: any[] = [];

  try {
    seriesList = await seriesApi.getAll();
  } catch {
    // API offline or static generation fallback - use default curated series
  }

  const defaultCuratedSeries = [
    {
      id: 'series-1',
      title: 'Distributed Consensus & State Machine Replication',
      slug: 'distributed-consensus-state-machine',
      description:
        'A complete deep dive into Raft consensus, Paxos variations, leader election, log replication, snapshotting, and split-brain resolution in production clusters.',
      difficulty: 'EXPERT',
      articleCount: 5,
      estimatedHours: '4.5 hrs',
      icon: Layers,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      topics: ['Raft Consensus', 'Leader Election', 'Log Compaction', 'Split-Brain Proofing'],
    },
    {
      id: 'series-2',
      title: 'PostgreSQL Internals, Lock-Free Migrations & Query Planners',
      slug: 'postgresql-internals-scaling',
      description:
        'Master relational database internals: MVCC mechanisms, Write-Ahead Logging (WAL), buffer pool tuning, index optimization (B-tree, GIN, BRIN), and zero-downtime sharding.',
      difficulty: 'ADVANCED',
      articleCount: 4,
      estimatedHours: '3.8 hrs',
      icon: Database,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      topics: ['MVCC Vacuuming', 'Concurrent Indexing', 'Lock Queues', 'Connection Pooling'],
    },
    {
      id: 'series-3',
      title: 'High-Throughput Event Streaming with Kafka & Redis',
      slug: 'event-streaming-kafka-redis',
      description:
        'Architecting resilient distributed stream pipelines: partition assignment strategies, consumer group rebalancing internals, exactly-once processing, and sub-millisecond caching.',
      difficulty: 'ADVANCED',
      articleCount: 6,
      estimatedHours: '5.2 hrs',
      icon: Cpu,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      topics: ['Sticky Rebalancing', 'Dead Letter Queues', 'Sliding Window Caching', 'Backpressure'],
    },
  ];

  const displaySeries = Array.isArray(seriesList) && seriesList.length > 0 ? seriesList : defaultCuratedSeries;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-12 font-sans">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono text-primary font-semibold">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>Knowledge Hub • Learning Tracks</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Technical Curriculum &amp; Series Tracks
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Step-by-step engineering tracks designed to take you from foundational fundamentals to architecting and scaling production distributed systems.
        </p>
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displaySeries.map((series: any) => (
          <Link
            key={series.id || series.slug}
            href={`/series/${series.slug}`}
            className="group rounded-3xl border border-border/80 bg-card p-6 sm:p-7 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent group-hover:via-primary transition-colors" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <BookOpen className="h-3.5 w-3.5" />
                  {series.articles?.length || series.articleCount || 4} Parts
                </span>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  {series.difficulty || 'ADVANCED'}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {series.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {series.description}
                </p>
              </div>

              {/* Topic Badges if available */}
              {series.topics && (
                <div className="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px]">
                  {series.topics.map((t: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs font-mono text-primary">
              <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1.5 font-bold">
                <span>Start Curriculum</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {series.estimatedHours || '~4 hrs'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
