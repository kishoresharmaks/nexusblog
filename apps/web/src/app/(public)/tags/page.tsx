import React from 'react';
import Link from 'next/link';
import { Hash, ArrowRight } from 'lucide-react';

const POPULAR_TAGS = [
  { name: 'Architecture', slug: 'architecture', count: 28 },
  { name: 'Distributed Systems', slug: 'distributed-systems', count: 24 },
  { name: 'Performance', slug: 'performance', count: 19 },
  { name: 'Database Internals', slug: 'database-internals', count: 16 },
  { name: 'Kafka', slug: 'kafka', count: 14 },
  { name: 'Redis', slug: 'redis', count: 12 },
  { name: 'Kubernetes', slug: 'kubernetes', count: 11 },
  { name: 'Observability', slug: 'observability', count: 9 },
  { name: 'PostgreSQL', slug: 'postgresql', count: 15 },
  { name: 'Saga Pattern', slug: 'saga-pattern', count: 7 },
  { name: 'Microservices', slug: 'microservices', count: 22 },
  { name: 'Event Driven', slug: 'event-driven', count: 18 },
  { name: 'Zero Downtime', slug: 'zero-downtime', count: 6 },
  { name: 'Security', slug: 'security', count: 10 },
  { name: 'Sharding', slug: 'sharding', count: 8 },
  { name: 'Docker', slug: 'docker', count: 13 },
];

export default function TagsIndexPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 font-sans">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Hash className="h-3.5 w-3.5 text-primary" />
          <span>Taxonomy Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Explore by Tag
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Index of engineering concepts, architectural patterns, protocols, and technical keywords.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {POPULAR_TAGS.map((tag) => (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-muted/40 transition-all font-mono text-xs"
          >
            <span className="text-muted-foreground group-hover:text-primary transition-colors">#</span>
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {tag.name}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-sans">
              {tag.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
