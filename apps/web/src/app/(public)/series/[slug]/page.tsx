import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Layers, ArrowLeft, BookOpen, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  
  const series = {
    id: 's1',
    title: 'Distributed Systems & Microservices from Zero to Production',
    slug: 'distributed-systems-from-zero',
    description:
      'A comprehensive multi-part engineering track covering consensus algorithms (Raft), CQRS, event sourcing with Kafka, and cross-service saga orchestration in NestJS & Go.',
    difficulty: 'ADVANCED',
    totalParts: 6,
    totalReadingTime: 85,
    author: {
      name: 'Alex Rivera',
      username: 'alexdev',
      role: 'Staff Infrastructure Engineer',
    },
    articles: [
      {
        order: 1,
        title: 'Core Fundamentals: CAP Theorem, PACELC, and Partition Tolerance',
        slug: 'cap-theorem-pacelc-explained',
        readingTime: 12,
        difficulty: 'INTERMEDIATE',
        excerpt: 'Deconstructing network partitions, latency trade-offs, and why CP vs AP is often an oversimplification in real networks.',
      },
      {
        order: 2,
        title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
        slug: 'designing-distributed-rate-limiter',
        readingTime: 14,
        difficulty: 'ADVANCED',
        excerpt: 'Sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.',
      },
      {
        order: 3,
        title: 'Event-Driven Microservices with Apache Kafka & Outbox Pattern',
        slug: 'kafka-outbox-pattern',
        readingTime: 18,
        difficulty: 'ADVANCED',
        excerpt: 'Guaranteed at-least-once message delivery, CDC with Debezium, and avoiding dual-write database corruption.',
      },
      {
        order: 4,
        title: 'Distributed Transactions: Implementing the Saga Orchestrator',
        slug: 'saga-orchestrator-pattern',
        readingTime: 16,
        difficulty: 'ADVANCED',
        excerpt: 'Compensating transactions, idempotency keys, and handling transient network failures in high-volume e-commerce.',
      },
      {
        order: 5,
        title: 'Consensus in Practice: Building a Lightweight Raft State Machine',
        slug: 'lightweight-raft-consensus',
        readingTime: 25,
        difficulty: 'EXPERT',
        excerpt: 'Leader election, log replication, heartbeats, and cluster membership reconfiguration from scratch.',
      },
    ],
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14 space-y-12 font-sans">
      <div className="space-y-4">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Series
        </Link>

        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-mono font-semibold text-primary">
              <Layers className="h-3.5 w-3.5" />
              Technical Track
            </span>
            <span className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-mono text-muted-foreground">
              {series.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground ml-auto">
              <Clock className="h-3.5 w-3.5" /> ~{series.totalReadingTime} mins total
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
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono">
              AR
            </div>
            <div>
              <p className="font-semibold text-foreground">{series.author.name}</p>
              <p className="text-[11px] text-muted-foreground">{series.author.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
            Track Curriculum ({series.articles.length} Articles)
          </h2>
        </div>

        <div className="space-y-4">
          {series.articles.map((item, idx) => (
            <Link
              key={item.slug}
              href={`/articles/${item.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/60 p-5 hover:border-border hover:bg-card hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-muted text-foreground border border-border flex items-center justify-center font-mono font-bold text-xs group-hover:border-primary group-hover:text-primary transition-colors">
                  0{item.order}
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
                <span>{item.readingTime} min</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
