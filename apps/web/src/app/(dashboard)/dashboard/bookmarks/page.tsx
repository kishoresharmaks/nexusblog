'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowRight, Clock, Search, Loader2 } from 'lucide-react';
import { bookmarksApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface BookmarkItem {
  id: string;
  articleId: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  difficulty: string;
  readingTime: number;
  savedAt: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookmarksApi.getUserBookmarks();
      if (Array.isArray(data)) {
        setBookmarks(
          data.map((b: any) => ({
            id: b.id,
            articleId: b.articleId || b.article?.id || '',
            title: b.article?.title || 'Saved Technical Article',
            slug: b.article?.slug || '#',
            excerpt: b.article?.excerpt || 'Architectural deep dive and system design reference.',
            category: b.article?.category?.name || 'Architecture',
            difficulty: b.article?.difficulty || 'INTERMEDIATE',
            readingTime: b.article?.readingTimeMinutes || 10,
            savedAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recently',
          }))
        );
      }
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const filtered = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRemove = async (id: string, articleId: string, title: string) => {
    try {
      await bookmarksApi.removeBookmark(articleId);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      toast.success('Bookmark removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove bookmark');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Saved Bookmarks
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Architectural blueprints and engineering guides saved to your personal reading library.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-mono">Loading saved bookmarks...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-border/70 bg-card p-5 hover:border-border hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="rounded bg-muted px-2 py-0.5 text-foreground font-semibold">
                    {item.category}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{item.difficulty}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.readingTime}m read
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Saved {item.savedAt}</span>
                </div>

                <Link href={`/articles/${item.slug}`}>
                  <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h2>
                </Link>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.excerpt}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                <button
                  onClick={() => handleRemove(item.id, item.articleId, item.title)}
                  className="p-2 rounded-lg border border-border/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-500 transition-colors"
                  title="Remove bookmark"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link
                  href={`/articles/${item.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold font-mono hover:opacity-90 transition-all"
                >
                  <span>Read</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
          <Bookmark className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No bookmarks found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? 'No bookmarks match your search query.' : 'Click the bookmark icon on any article to save it for quick reference.'}
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
