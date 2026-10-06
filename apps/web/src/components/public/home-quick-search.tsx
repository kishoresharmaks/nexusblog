'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, TrendingUp } from 'lucide-react';

const TOPIC_CHIPS = [
  'System Design',
  'Redis Caching',
  'Kafka Streams',
  'PostgreSQL',
  'Distributed Consensus',
  'NestJS',
  'Microservices',
];

export function HomeQuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChipClick = (chip: string) => {
    router.push(`/search?q=${encodeURIComponent(chip)}`);
  };

  return (
    <div className="w-full max-w-xl space-y-2.5 pt-1">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Quick search articles, system designs, tech stacks..."
          className="w-full rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md py-2.5 pl-10 pr-24 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 shadow-2xs transition-all"
        />
        <button
          type="submit"
          className="absolute right-1.5 inline-flex items-center gap-1 rounded-xl bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-mono font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Search</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </form>

      {/* Suggested Quick Search Chips */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
          <TrendingUp className="h-3 w-3 text-primary" /> Trending:
        </span>
        {TOPIC_CHIPS.slice(0, 4).map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="rounded-lg border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            #{chip}
          </button>
        ))}
      </div>
    </div>
  );
}
