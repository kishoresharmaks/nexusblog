'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  Bookmark,
  History,
  MessageSquare,
  FileText,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { bookmarksApi, readingHistoryApi, commentsApi, guestPostsApi } from '@/lib/api-client';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [guestPosts, setGuestPosts] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [bmRes, histRes, commRes, gpRes] = await Promise.allSettled([
          bookmarksApi.getUserBookmarks(),
          readingHistoryApi.getUserHistory(),
          commentsApi.getUserComments(),
          guestPostsApi.getUserSubmissions(),
        ]);

        if (bmRes.status === 'fulfilled') {
          const val: any = bmRes.value;
          const items = Array.isArray(val) ? val : Array.isArray(val?.items) ? val.items : Array.isArray(val?.data) ? val.data : [];
          setBookmarks(items);
        }
        let histItems: any[] = [];
        if (histRes.status === 'fulfilled') {
          const val: any = histRes.value;
          const items = Array.isArray(val) ? val : Array.isArray(val?.items) ? val.items : Array.isArray(val?.data) ? val.data : [];
          histItems = items;
        }

        // Merge local storage history if available
        try {
          const localRaw = localStorage.getItem('nexus_reading_history');
          if (localRaw) {
            const localList = JSON.parse(localRaw);
            if (Array.isArray(localList)) {
              localList.forEach((localItem: any) => {
                const exists = histItems.some(
                  (h) => (h.articleId && h.articleId === localItem.articleId) || (h.article?.slug && h.article?.slug === localItem.slug)
                );
                if (!exists) {
                  histItems.push({
                    id: localItem.articleId,
                    articleId: localItem.articleId,
                    completionPercentage: localItem.completionPercentage || 0,
                    lastPosition: localItem.lastPosition || 0,
                    lastViewedAt: localItem.lastViewedAt,
                    article: {
                      id: localItem.articleId,
                      title: localItem.title,
                      slug: localItem.slug,
                      readingTime: localItem.readingTime || 10,
                      category: { name: localItem.category || 'Architecture' },
                    },
                  });
                }
              });
            }
          }
        } catch {}

        setHistory(histItems);
        if (commRes.status === 'fulfilled') {
          const val: any = commRes.value;
          const items = Array.isArray(val) ? val : Array.isArray(val?.items) ? val.items : Array.isArray(val?.data) ? val.data : [];
          setComments(items);
        }
        if (gpRes.status === 'fulfilled') {
          const val: any = gpRes.value;
          const items = Array.isArray(val) ? val : Array.isArray(val?.items) ? val.items : Array.isArray(val?.data) ? val.data : [];
          setGuestPosts(items);
        }
      } catch {
        // Handled silently
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const safeBookmarks = Array.isArray(bookmarks) ? bookmarks : [];
  const safeHistory = Array.isArray(history) ? history : [];
  const safeComments = Array.isArray(comments) ? comments : [];
  const safeGuestPosts = Array.isArray(guestPosts) ? guestPosts : [];

  const stats = [
    {
      title: 'Saved Bookmarks',
      value: safeBookmarks.length,
      href: '/dashboard/bookmarks',
      icon: Bookmark,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Articles in Progress',
      value: safeHistory.filter((h) => (h?.completionPercentage || 0) < 100).length,
      href: '/dashboard/history',
      icon: History,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Discussions & Comments',
      value: safeComments.length,
      href: '/dashboard/comments',
      icon: MessageSquare,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Guest Submissions',
      value: safeGuestPosts.length,
      href: '/dashboard/guest-posts',
      icon: FileText,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
  ];

  const inProgressArticle = safeHistory.find((h) => (h?.completionPercentage || 0) < 100) || safeHistory[0];
  const recentBookmarks = safeBookmarks.slice(0, 3);
  const latestGuestPost = safeGuestPosts[0];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {user?.name || 'Reader'}
            </h1>
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-primary">
              {user?.role || 'READER'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track your reading progress, manage saved architectural blueprints, and monitor contributor drafts.
          </p>
        </div>

        <Link
          href="/articles"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all font-mono self-start sm:self-auto"
        >
          <span>Browse Articles</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 space-y-3 hover:border-border hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-mono font-extrabold text-foreground">
                  {loading ? '...' : item.value}
                </p>
                <p className="text-xs text-muted-foreground font-medium">{item.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Continue Reading Card */}
      {inProgressArticle && inProgressArticle.article && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary">
              <BookOpen className="h-4 w-4" />
              <span>Continue Reading</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {inProgressArticle.lastViewedAt
                ? new Date(inProgressArticle.lastViewedAt).toLocaleDateString()
                : 'Recently'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {inProgressArticle.article?.category?.name || 'Technical Guide'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {inProgressArticle.article?.title}
              </h3>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Progress: {inProgressArticle.completionPercentage || 0}%</span>
                <span>
                  {inProgressArticle.completionPercentage === 100
                    ? 'Completed'
                    : `~${Math.max(1, Math.round(((inProgressArticle.article?.readingTime || inProgressArticle.article?.readingTimeMinutes) || 10) * (1 - (inProgressArticle.completionPercentage || 0) / 100)))} mins remaining`}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${inProgressArticle.completionPercentage || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href={`/articles/${inProgressArticle.article?.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
            >
              <span>{inProgressArticle.completionPercentage === 100 ? 'Read Again' : 'Resume Reading'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Bookmarks */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-500" />
              <span>Recent Bookmarks</span>
            </h2>
            <Link href="/dashboard/bookmarks" className="text-xs font-mono text-primary hover:underline">
              View all
            </Link>
          </div>

          {recentBookmarks.length > 0 ? (
            <div className="space-y-3">
              {recentBookmarks.map((item) => (
                <Link
                  key={item.id}
                  href={`/articles/${item.article?.slug || item.slug}`}
                  className="group block p-3 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>{item.article?.category?.name || 'Guide'}</span>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Saved'}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {item.article?.title || item.title}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">No bookmarks saved yet.</p>
          )}
        </div>

        {/* Contributor Highlights */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <span>Contributor Activity</span>
            </h2>
            <Link href="/dashboard/guest-posts" className="text-xs font-mono text-primary hover:underline">
              Manage Posts
            </Link>
          </div>

          {latestGuestPost ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                    {latestGuestPost.status}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {latestGuestPost.submittedAt
                      ? new Date(latestGuestPost.submittedAt).toLocaleDateString()
                      : 'Recently'}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-foreground leading-snug">
                  {latestGuestPost.title}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {latestGuestPost.editorialFeedback || 'Assigned to editorial reviewer. You will be notified when feedback is ready.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">Ready to share your technical blueprint with our community?</p>
              <Link
                href="/guest-post/submit"
                className="inline-flex items-center gap-1 text-xs font-mono text-primary font-semibold hover:underline"
              >
                Write Guest Post →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
