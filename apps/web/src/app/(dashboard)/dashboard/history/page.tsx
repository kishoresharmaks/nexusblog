'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  History,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  BookOpen,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { readingHistoryApi } from '@/lib/api-client';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

interface HistoryItem {
  id: string;
  articleId: string;
  title: string;
  slug: string;
  category: string;
  completionPercentage: number;
  readingTime: number;
  coverImage?: string;
  excerpt?: string;
  lastViewedAt: string;
}

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      let items: HistoryItem[] = [];

      // Fetch from API if logged in
      if (authClient.isAuthenticated()) {
        try {
          const data: any = await readingHistoryApi.getUserHistory();
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.data)
                ? data.data
                : [];
          if (list.length > 0) {
            items = list.map((h: any) => ({
              id: h.id || h.historyId || h.articleId || Math.random().toString(),
              articleId: h.articleId || h.article?.id || '',
              title: h.article?.title || h.title || 'Technical Blueprint',
              slug: h.article?.slug || h.slug || '#',
              category: h.article?.category?.name || h.category || 'Architecture',
              completionPercentage: typeof h.completionPercentage === 'number' ? h.completionPercentage : 0,
              readingTime: h.article?.readingTime || h.readingTime || 10,
              coverImage: h.article?.coverImage || h.coverImage,
              excerpt: h.article?.excerpt || h.excerpt,
              lastViewedAt: h.lastViewedAt ? new Date(h.lastViewedAt).toLocaleDateString() : 'Recently',
            }));
          }
        } catch {
          // Backend call failed or offline
        }
      }

      // Check localStorage for any items read while guest or offline
      try {
        const localRaw = localStorage.getItem('nexus_reading_history');
        if (localRaw) {
          const localList = JSON.parse(localRaw);
          if (Array.isArray(localList) && localList.length > 0) {
            localList.forEach((localItem: any) => {
              const exists = items.some(
                (item) =>
                  (item.articleId && item.articleId === localItem.articleId) ||
                  (item.slug && item.slug === localItem.slug)
              );

              if (!exists) {
                items.push({
                  id: localItem.articleId || Math.random().toString(),
                  articleId: localItem.articleId || '',
                  title: localItem.title || 'Technical Article',
                  slug: localItem.slug || '#',
                  category: localItem.category || 'Engineering',
                  completionPercentage: localItem.completionPercentage || 0,
                  readingTime: localItem.readingTime || 10,
                  coverImage: localItem.coverImage,
                  excerpt: localItem.excerpt,
                  lastViewedAt: localItem.lastViewedAt
                    ? new Date(localItem.lastViewedAt).toLocaleDateString()
                    : 'Recently',
                });

                // Background sync un-synced local items to API if authenticated
                if (authClient.isAuthenticated() && localItem.articleId) {
                  readingHistoryApi
                    .updateProgress({
                      articleId: localItem.articleId,
                      completionPercentage: localItem.completionPercentage || 0,
                      lastPosition: localItem.lastPosition || 0,
                    })
                    .catch(() => {});
                }
              }
            });
          }
        }
      } catch {
        // Ignore local parse issues
      }

      setHistory(items);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const safeHistory = Array.isArray(history) ? history : [];
  const filtered = safeHistory
    .filter((item) => {
      if (filter === 'IN_PROGRESS') return (item?.completionPercentage || 0) < 100;
      if (filter === 'COMPLETED') return (item?.completionPercentage || 0) >= 100;
      return true;
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        (item?.title || '').toLowerCase().includes(query) ||
        (item?.category || '').toLowerCase().includes(query) ||
        (item?.excerpt && item.excerpt.toLowerCase().includes(query))
      );
    });

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      if (authClient.isAuthenticated()) {
        await readingHistoryApi.clearHistory();
      }
      localStorage.removeItem('nexus_reading_history');
      setHistory([]);
      setShowClearConfirm(false);
      toast.success('Reading history cleared successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear history');
    } finally {
      setIsClearing(false);
    }
  };

  const handleRemoveItem = async (id: string, articleId: string) => {
    try {
      if (authClient.isAuthenticated() && articleId) {
        await readingHistoryApi.removeFromHistory(articleId);
      }

      // Also remove from localStorage
      try {
        const stored = localStorage.getItem('nexus_reading_history');
        if (stored) {
          let list = JSON.parse(stored);
          if (Array.isArray(list)) {
            list = list.filter((h: any) => h.articleId !== articleId && h.id !== id);
            localStorage.setItem('nexus_reading_history', JSON.stringify(list));
          }
        }
      } catch {}

      setHistory((prev) => prev.filter((h) => h.id !== id && h.articleId !== articleId));
      toast.success('Removed from reading history');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove history item');
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Reading History
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-1">
            Track reading completion, pick up where you left off, and resume architectural deep-dives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {safeHistory.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 text-xs font-mono text-muted-foreground transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {[
            { key: 'ALL', label: `All (${safeHistory.length})` },
            {
              key: 'IN_PROGRESS',
              label: `In Progress (${safeHistory.filter((h) => (h?.completionPercentage || 0) < 100).length})`,
            },
            {
              key: 'COMPLETED',
              label: `Completed (${safeHistory.filter((h) => (h?.completionPercentage || 0) >= 100).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                filter === tab.key
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50 hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        {history.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reading history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border/70 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-mono">Syncing reading history...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => {
            const isCompleted = item.completionPercentage >= 100;
            const remainingMins = Math.max(
              1,
              Math.round(item.readingTime * (1 - item.completionPercentage / 100))
            );

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-border/70 bg-card/60 p-5 hover:border-border hover:shadow-md transition-all space-y-4 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground flex-wrap">
                      <span className="rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 font-semibold">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.readingTime} min read
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Last viewed {item.lastViewedAt}
                      </span>
                    </div>

                    <Link href={`/articles/${item.slug}`}>
                      <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {item.title}
                      </h2>
                    </Link>

                    {item.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleRemoveItem(item.id, item.articleId)}
                      className="p-2 rounded-xl border border-border/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                      title="Remove from history"
                      aria-label="Remove from history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <Link
                      href={`/articles/${item.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold font-mono hover:opacity-90 transition-all shadow-xs"
                    >
                      <span>{isCompleted ? 'Read Again' : 'Resume Reading'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Progress Bar and Indicator */}
                <div className="space-y-1.5 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground font-medium">
                      {isCompleted ? (
                        <span className="text-emerald-500 flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="text-foreground font-semibold">
                          {item.completionPercentage}% complete
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {isCompleted ? 'Fully read' : `~${remainingMins}m remaining`}
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-primary to-sky-400'
                      }`}
                      style={{ width: `${item.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : searchQuery ? (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
          <Search className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No matching history found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No articles match your search term &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center gap-1 text-xs font-mono text-primary font-semibold hover:underline pt-2 cursor-pointer"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 rounded-2xl border border-dashed border-border bg-card/40 px-4">
          <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 mx-auto">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-foreground">No reading history yet</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Articles and engineering guides you read will automatically be tracked here with your scroll
              progress so you can pick up where you left off.
            </p>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold font-mono hover:opacity-90 transition-all shadow-xs"
          >
            <span>Explore Technical Articles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Confirmation Modal for Clear History */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Clear Reading History?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              All stored reading progress and article completion records will be permanently removed from
              your account.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearing}
                className="px-4 py-2 rounded-xl border border-border/70 hover:bg-muted text-xs font-semibold font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold font-mono transition-colors cursor-pointer"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Yes, Clear All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

