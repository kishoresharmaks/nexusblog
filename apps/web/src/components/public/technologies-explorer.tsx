'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, X, ChevronRight, Cpu } from 'lucide-react';
import { IconRenderer } from '@/components/common/icon-renderer';

interface TechnologyItem {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

interface TechnologiesExplorerProps {
  technologies: TechnologyItem[];
}

export function TechnologiesExplorer({ technologies }: TechnologiesExplorerProps) {
  const [search, setSearch] = useState('');

  const filtered = technologies.filter((tech) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      tech.name.toLowerCase().includes(q) ||
      tech.slug.toLowerCase().includes(q) ||
      (tech.description && tech.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search technology hubs (e.g. Redis, Kafka, Docker)..."
          className="w-full pl-10 pr-10 py-2.5 text-sm font-mono rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-xs transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length > 0 ? (
          filtered.map((tech) => (
            <Link
              key={tech.slug}
              href={`/articles?technology=${tech.slug}`}
              className="group rounded-2xl border border-border/80 bg-card p-6 hover:border-foreground/30 hover:shadow-lg hover:bg-card transition-all space-y-4 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center p-2.5 group-hover:scale-110 transition-transform shrink-0">
                    <IconRenderer value={tech.logo || tech.slug || tech.name} defaultIcon="Cpu" className="h-7 w-7" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-mono">
                  {tech.name}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {tech.description || `Production patterns, scaling recipes, and performance benchmarks for ${tech.name}.`}
                </p>
              </div>

              <div className="pt-2 text-xs font-mono text-primary font-medium flex items-center justify-between border-t border-border/30">
                <span>View {tech.name} guides</span>
                <span>→</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-3">
            <Cpu className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-mono text-muted-foreground">
              No technology hubs matching &quot;{search}&quot;
            </p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs font-mono text-primary hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
