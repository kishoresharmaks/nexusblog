'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { History, Trash2, ArrowRight, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL_HISTORY = [
  {
    id: 'h1',
    articleId: '1',
    title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
    slug: 'designing-distributed-rate-limiter',
    category: 'System Design',
    completionPercentage: 68,
    readingTime: 12,
    lastViewedAt: '2 hours ago',
  },
  {
    id: 'h2',
    articleId: '2',
    title: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
    slug: 'zero-downtime-postgresql-migrations',
    category: 'Databases',
    completionPercentage: 100,
    readingTime: 16,
    lastViewedAt: 'Yesterday',
  },
  {
    id: 'h3',
    articleId: '3',
    title: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
    slug: 'kafka-partitioning-zero-data-loss',
    category: 'Distributed Systems',
    completionPercentage: 35,
    readingTime: 15,
    lastViewedAt: '3 days ago',
  },
];

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  const filtered = history.filter((item) => {
    if (filter === 'IN_PROGRESS') return item.completionPercentage < 100;
    if (filter === 'COMPLETED') return item.completionPercentage === 100;
    return true;
  });

  const handleClearAll = () => {
    setHistory([]);
    toast.success('Reading history cleared');
  };

  const handleRemoveItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    toast.success('Removed from history');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-sky-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Reading History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track reading completion and pick up where you left off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        {[
          { key: 'ALL', label: `All (${history.length})` },
          { key: 'IN_PROGRESS', label: `In Progress (${history.filter((h) => h.completionPercentage < 100).length})` },
          { key: 'COMPLETED', label: `Completed (${history.filter((h) => h.completionPercentage === 100).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-border/70 bg-card p-5 hover:border-border hover:shadow-xs transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    <span className="rounded bg-muted px-2 py-0.5 text-foreground font-semibold">
                      {item.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.readingTime}m total
                    </span>
                    <span>•</span>
                    <span>Last viewed {item.lastViewedAt}</span>
                  </div>

                  <Link href={`/articles/${item.slug}`}>
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h2>
                  </Link>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 rounded-lg border border-border/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-500 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/articles/${item.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold font-mono hover:opacity-90 transition-all"
                  >
                    <span>{item.completionPercentage === 100 ? 'Read Again' : 'Resume'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-border/30">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">
                    {item.completionPercentage === 100 ? (
                      <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                      </span>
                    ) : (
                      `${item.completionPercentage}% complete`
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.completionPercentage === 100
                      ? 'Fully read'
                      : `~${Math.round(item.readingTime * (1 - item.completionPercentage / 100))}m remaining`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${item.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
          <History className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No reading history</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your reading activity and scroll progress across technical guides will appear here.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-xs font-mono text-primary font-semibold hover:underline pt-2"
          >
            Explore articles →
          </Link>
        </div>
      )}
    </div>
  );
}
