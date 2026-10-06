'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  BookOpen,
  Layers,
  Cpu,
  ArrowRight,
  Loader2,
  Hash,
  X,
  FileText,
} from 'lucide-react';
import { siteConfig } from '@nexus/config';
import { articlesApi } from '@/lib/api-client';
import { logSearchTelemetry } from '@/lib/search-telemetry';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: { name: string; slug: string };
  readingTime?: number;
  difficulty?: string;
  viewsCount?: number;
}

const SUGGESTED_TOPICS = [
  'Redis',
  'Kafka',
  'PostgreSQL',
  'System Design',
  'NestJS',
  'Distributed Systems',
  'Docker',
  'Next.js',
];

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchArticleItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Perform dynamic search on debounced query
  useEffect(() => {
    if (!open) return;

    if (!debouncedQuery) {
      setResults([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);

    articlesApi
      .getPublicFeed({
        search: debouncedQuery,
        limit: 6,
      })
      .then((res) => {
        if (isSubscribed) {
          const items = res.items || [];
          setResults(items);
          setTotalCount(res.total || items.length);
          logSearchTelemetry(debouncedQuery, items.length, false);
        }
      })
      .catch((err) => {
        console.error('Search command failed:', err);
        if (isSubscribed) {
          setResults([]);
          setTotalCount(0);
        }
      })
      .finally(() => {
        if (isSubscribed) setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [debouncedQuery, open]);

  // ESC key listener when search modal is open
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Global Keyboard shortcut listener for Cmd+K / Ctrl+K and '/' key
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && !open && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName))
      ) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', handleGlobalShortcuts);
    return () => document.removeEventListener('keydown', handleGlobalShortcuts);
  }, [open, onOpenChange]);

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      setQuery('');
      command();
    },
    [onOpenChange],
  );

  const handleSelectArticle = (slug: string) => {
    if (query) {
      logSearchTelemetry(query, results.length, true);
    }
    runCommand(() => router.push(`/articles/${slug}`));
  };

  const handleViewAllResults = () => {
    if (query) {
      logSearchTelemetry(query, totalCount, true);
    }
    runCommand(() => router.push(`/search?q=${encodeURIComponent(query)}`));
  };

  const filteredTechnologies = siteConfig.technologies.filter((tech) =>
    tech.toLowerCase().includes(query.toLowerCase()),
  );

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border/80 bg-card text-card-foreground p-0 shadow-2xl overflow-hidden font-sans text-sm animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="w-full flex flex-col"
          label="Global Technical Search"
          shouldFilter={false} // Dynamic backend searching
        >
          {/* Search Header Input Bar */}
          <div className="flex items-center border-b border-border/60 px-4 py-3.5 bg-muted/20">
            <Search className="h-4 w-4 text-primary mr-3 shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search engineering articles, system designs, architectures..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
              autoFocus
            />
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0 ml-2" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-1 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Close (ESC)"
              >
                ESC
              </button>
            )}
          </div>

          {/* Results Scrollable Container */}
          <Command.List className="max-h-[380px] overflow-y-auto p-2 divide-y divide-border/20 text-xs [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            {/* Live Articles Results */}
            {results.length > 0 && (
              <Command.Group
                heading={`Articles & Architecture Blueprints (${totalCount})`}
                className="p-1 space-y-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-primary"
              >
                {results.map((art) => (
                  <Command.Item
                    key={art.id}
                    value={`article-${art.slug}-${art.title}`}
                    onSelect={() => handleSelectArticle(art.slug)}
                    className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-foreground transition-all group border border-transparent data-[selected=true]:bg-muted/80 data-[selected=true]:border-primary/40 hover:bg-muted/60"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-xs line-clamp-1 group-hover:text-primary transition-colors">
                            {art.title}
                          </span>
                          {art.difficulty && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase border border-border/40">
                              {art.difficulty}
                            </span>
                          )}
                        </div>
                        {art.excerpt && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono pt-0.5">
                          {art.category && (
                            <span className="text-primary font-medium">
                              {art.category.name}
                            </span>
                          )}
                          {art.readingTime && (
                            <>
                              <span>•</span>
                              <span>{art.readingTime} min read</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </Command.Item>
                ))}

                {/* View Full Search Link */}
                <Command.Item
                  value="action-view-all-results"
                  onSelect={handleViewAllResults}
                  className="mt-1 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-primary font-semibold flex items-center justify-between cursor-pointer transition-colors data-[selected=true]:bg-primary/20"
                >
                  <span className="text-xs">
                    View all {totalCount} results on full search page
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Command.Item>
              </Command.Group>
            )}

            {/* Empty State with Suggestions */}
            {query.trim().length > 0 && !isLoading && results.length === 0 && (
              <Command.Empty className="p-6 text-center space-y-4">
                <div className="mx-auto w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">
                    No matching articles found for &quot;{query}&quot;
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Try searching for related technologies, system designs, or explore popular topics below.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setQuery(topic)}
                      className="px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
                    >
                      #{topic}
                    </button>
                  ))}
                </div>
              </Command.Empty>
            )}

            {/* Default State: Quick Navigation */}
            {(!query || query.trim().length === 0) && (
              <Command.Group
                heading="Quick Navigation"
                className="p-1 space-y-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                <Command.Item
                  value="nav-all-articles"
                  onSelect={() => runCommand(() => router.push('/articles'))}
                  className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-foreground text-xs transition-colors group data-[selected=true]:bg-muted/80 data-[selected=true]:border-primary/40 border border-transparent"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium">Browse All Articles &amp; Blueprints</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Command.Item>

                <Command.Item
                  value="nav-categories"
                  onSelect={() => runCommand(() => router.push('/categories'))}
                  className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-foreground text-xs transition-colors group data-[selected=true]:bg-muted/80 data-[selected=true]:border-primary/40 border border-transparent"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium">Explore Architecture Categories</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Command.Item>

                <Command.Item
                  value="nav-technologies"
                  onSelect={() => runCommand(() => router.push('/technologies'))}
                  className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-foreground text-xs transition-colors group data-[selected=true]:bg-muted/80 data-[selected=true]:border-primary/40 border border-transparent"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Cpu className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium">Technologies &amp; Infrastructure Stacks</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Command.Item>
              </Command.Group>
            )}

            {/* Matching Technologies */}
            {filteredTechnologies.length > 0 && (
              <Command.Group
                heading="Architecture Topics & Stacks"
                className="p-1 space-y-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {filteredTechnologies.slice(0, 6).map((tech) => (
                  <Command.Item
                    key={tech}
                    value={`tech-${tech}`}
                    onSelect={() =>
                      runCommand(() => router.push(`/technologies/${tech.toLowerCase()}`))
                    }
                    className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-foreground text-xs transition-colors group data-[selected=true]:bg-muted/80 data-[selected=true]:border-primary/40 border border-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{tech} Deep Dives</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      /technologies/{tech.toLowerCase()}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer Keyboard Navigation Shortcuts Bar */}
          <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
                  ↑
                </kbd>{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
                  ↓
                </kbd>{' '}
                Navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
                  ↵
                </kbd>{' '}
                Open
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">ESC</kbd> to close
            </button>
          </div>
        </Command>
      </div>
    </div>,
    document.body,
  );
}
