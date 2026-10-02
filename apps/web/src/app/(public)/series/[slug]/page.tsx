import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Layers, ArrowLeft, BookOpen, Clock, CheckCircle2, ChevronRight, User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { seriesApi } from '@/lib/api-client';

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  let series: any = null;

  try {
    series = await seriesApi.getBySlug(decodedSlug);
  } catch {
    // API offline or static generation fallback - use curated map
  }

  // Fallback curated series definitions
  const curatedSeriesMap: Record<string, any> = {
    'distributed-consensus-state-machine': {
      title: 'Distributed Consensus & State Machine Replication',
      slug: 'distributed-consensus-state-machine',
      description:
        'A complete deep dive into Raft consensus, Paxos variations, leader election, log replication, snapshotting, and split-brain resolution in production clusters.',
      difficulty: 'EXPERT',
      author: { name: 'Alex Rivera', role: 'Staff Systems Architect' },
      articles: [
        {
          title: 'Understanding Split-Brain Scenarios and Quorum Intersection',
          slug: 'kafka-partitioning-zero-data-loss',
          excerpt: 'Why simple majorities prevent conflicting terms and how network partitions isolate divergent clusters.',
          readingTime: 12,
          seriesOrder: 1,
        },
        {
          title: 'Raft Leader Election and Heartbeat Coordination',
          slug: 'designing-distributed-rate-limiter',
          excerpt: 'Randomized election timeouts, term numbers, and candidate step-down invariants.',
          readingTime: 15,
          seriesOrder: 2,
        },
        {
          title: 'Log Replication, Commit Indexes, and State Machine Application',
          slug: 'zero-downtime-postgresql-migrations',
          excerpt: 'Log consistency checks, append-only entries, and handling lagging follower recovery.',
          readingTime: 14,
          seriesOrder: 3,
        },
      ],
    },
    'postgresql-internals-scaling': {
      title: 'PostgreSQL Internals, Lock-Free Migrations & Query Planners',
      slug: 'postgresql-internals-scaling',
      description:
        'Master relational database internals: MVCC mechanisms, Write-Ahead Logging (WAL), buffer pool tuning, index optimization (B-tree, GIN, BRIN), and zero-downtime sharding.',
      difficulty: 'ADVANCED',
      author: { name: 'Elena Rostova', role: 'Principal Database Architect' },
      articles: [
        {
          title: 'PostgreSQL MVCC Internals: Heap Tuples, Visibility Maps, and Vacuuming',
          slug: 'zero-downtime-postgresql-migrations',
          excerpt: 'How Postgres isolates transactions, row versioning overhead, and tuning autovacuum aggressive thresholds.',
          readingTime: 10,
          seriesOrder: 1,
        },
        {
          title: 'Zero-Downtime Schema Evolution on High-Throughput Tables',
          slug: 'zero-downtime-postgresql-migrations',
          excerpt: 'Avoiding lock queues, multi-phase column additions, and trigger-assisted backfills.',
          readingTime: 12,
          seriesOrder: 2,
        },
      ],
    },
    'event-streaming-kafka-redis': {
      title: 'High-Throughput Event Streaming with Kafka & Redis',
      slug: 'event-streaming-kafka-redis',
      description:
        'Architecting resilient distributed stream pipelines: partition assignment strategies, consumer group rebalancing internals, exactly-once processing, and sub-millisecond caching.',
      difficulty: 'ADVANCED',
      author: { name: 'Vikram Mehta', role: 'Lead Infrastructure Engineer' },
      articles: [
        {
          title: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
          slug: 'kafka-partitioning-zero-data-loss',
          excerpt: 'Guaranteed message ordering, consumer group rebalancing internals, and handling backpressure.',
          readingTime: 10,
          seriesOrder: 1,
        },
        {
          title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
          slug: 'designing-distributed-rate-limiter',
          excerpt: 'Sub-millisecond sliding window counter algorithms across multi-region API gateways.',
          readingTime: 8,
          seriesOrder: 2,
        },
      ],
    },
  };

  if (!series) {
    series = curatedSeriesMap[decodedSlug];
  }

  if (!series) {
    notFound();
  }

  const articles = series.articles || [];
  const totalReadingTime = articles.reduce((acc: number, curr: any) => acc + (curr.readingTime || 10), 0);
  const authorName = series.author?.name || 'Nexus Engineering';
  const authorRole = series.author?.role || 'Staff Infrastructure Engineer';
  const authorInitials = authorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 space-y-12 font-sans">
      <div className="space-y-4">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to All Series
        </Link>

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 md:p-10 space-y-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-mono font-semibold text-primary">
              <Layers className="h-3.5 w-3.5" />
              Technical Track
            </span>
            <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-mono text-muted-foreground">
              {series.difficulty || 'ADVANCED'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground ml-auto">
              <Clock className="h-3.5 w-3.5" /> ~{totalReadingTime} mins total
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {series.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {series.description}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border/40 text-xs text-muted-foreground">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono">
              {authorInitials}
            </div>
            <div>
              <p className="font-semibold text-foreground">{authorName}</p>
              <p className="text-[11px] text-muted-foreground">{authorRole}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
            Track Curriculum ({articles.length} Parts)
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((item: any, idx: number) => (
              <Link
                key={item.id || item.slug || idx}
                href={`/articles/${item.slug}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-muted text-foreground border border-border flex items-center justify-center font-mono font-bold text-xs group-hover:border-primary group-hover:text-primary transition-colors">
                    {String(item.seriesOrder || idx + 1).padStart(2, '0')}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0 text-xs font-mono text-muted-foreground">
                  <span>{item.readingTime || 12} min</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">Curriculum in preparation</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              The articles for this series are currently being finalized.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
