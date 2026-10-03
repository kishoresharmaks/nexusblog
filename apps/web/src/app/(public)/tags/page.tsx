'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Hash, ArrowRight, Search, Sparkles, Layers, Cpu, Database, Server, Filter } from 'lucide-react';
import { tagsApi } from '@/lib/api-client';

export default function TagsIndexPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const defaultCuratedTags = [
    { name: 'Redis', slug: 'redis', count: 14, domain: 'Databases & Storage' },
    { name: 'Kafka', slug: 'kafka', count: 12, domain: 'Distributed Systems' },
    { name: 'PostgreSQL', slug: 'postgresql', count: 18, domain: 'Databases & Storage' },
    { name: 'Kubernetes', slug: 'kubernetes', count: 15, domain: 'Cloud & DevOps' },
    { name: 'Docker', slug: 'docker', count: 11, domain: 'Cloud & DevOps' },
    { name: 'NestJS', slug: 'nestjs', count: 9, domain: 'Backend & Protocols' },
    { name: 'Distributed Consensus', slug: 'distributed-consensus', count: 8, domain: 'Distributed Systems' },
    { name: 'Raft Protocol', slug: 'raft-protocol', count: 6, domain: 'Distributed Systems' },
    { name: 'Rate Limiting', slug: 'rate-limiting', count: 7, domain: 'Architecture Patterns' },
    { name: 'Zero Downtime', slug: 'zero-downtime', count: 10, domain: 'Databases & Storage' },
    { name: 'Sharding', slug: 'sharding', count: 8, domain: 'Databases & Storage' },
    { name: 'Microservices', slug: 'microservices', count: 16, domain: 'Architecture Patterns' },
    { name: 'gRPC', slug: 'grpc', count: 7, domain: 'Backend & Protocols' },
    { name: 'GraphQL', slug: 'graphql', count: 6, domain: 'Backend & Protocols' },
    { name: 'Event Driven', slug: 'event-driven', count: 13, domain: 'Distributed Systems' },
    { name: 'High Availability', slug: 'high-availability', count: 11, domain: 'Architecture Patterns' },
    { name: 'Observability', slug: 'observability', count: 8, domain: 'Cloud & DevOps' },
    { name: 'Concurrency', slug: 'concurrency', count: 9, domain: 'Backend & Protocols' },
    { name: 'Benchmarking', slug: 'benchmarking', count: 7, domain: 'Architecture Patterns' },
    { name: 'eBPF', slug: 'ebpf', count: 5, domain: 'Cloud & DevOps' },
    { name: 'MongoDB', slug: 'mongodb', count: 8, domain: 'Databases & Storage' },
    { name: 'Lock-Free', slug: 'lock-free', count: 6, domain: 'Backend & Protocols' },
  ];

  useEffect(() => {
    tagsApi
      .getAll()
      .then((data: any) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
              ? data.data
              : [];
        if (list.length > 0) {
          setTags(list);
        } else {
          setTags(defaultCuratedTags);
        }
      })
      .catch(() => {
        setTags(defaultCuratedTags);
      })
      .finally(() => setLoading(false));
  }, []);

  const domains = [
    'all',
    'Distributed Systems',
    'Databases & Storage',
    'Architecture Patterns',
    'Cloud & DevOps',
    'Backend & Protocols',
  ];

  const safeTags = Array.isArray(tags) ? tags : defaultCuratedTags;
  const filteredTags = safeTags.filter((tag) => {
    const matchesSearch =
      (tag?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tag?.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain =
      selectedDomain === 'all' || tag?.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-12 font-sans">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono text-primary font-semibold">
          <Hash className="h-3.5 w-3.5 text-primary" />
          <span>Knowledge Hub • Taxonomy Cloud</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Topic Tags &amp; Engineering Taxonomy
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Explore architectural concepts, protocols, storage engines, distributed consensus algorithms, and infrastructure components across our published technical deep dives.
        </p>
      </div>

      {/* Interactive Search & Domain Filter Bar */}
      <div className="space-y-4 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tags (e.g. #kafka, #redis, #concurrency)..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground shrink-0 self-center">
            <span>Showing {filteredTags.length} tags</span>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 font-mono text-xs">
          <span className="text-muted-foreground mr-1 text-[11px] font-semibold">Domain:</span>
          {domains.map((domain) => {
            const isSelected = selectedDomain === domain;
            return (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-foreground text-background font-bold shadow-2xs'
                    : 'border border-border/70 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {domain === 'all' ? 'All Domains' : domain}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Cloud Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredTags.map((tag) => (
            <Link
              key={tag.id || tag.slug}
              href={`/tags/${tag.slug}`}
              className="group flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:bg-muted/40 hover:shadow-xs transition-all font-mono text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">#</span>
                <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {tag.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-sans font-semibold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {tag.count || tag.articlesCount || 6}+
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {filteredTags.length === 0 && (
          <div className="py-16 text-center space-y-2 rounded-2xl border border-dashed border-border bg-card/40 font-mono text-xs text-muted-foreground">
            <p>No topic tags matched &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('all');
              }}
              className="text-primary hover:underline font-semibold"
            >
              Clear search filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
