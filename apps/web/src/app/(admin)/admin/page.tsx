'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Eye,
  Inbox,
  Mail,
  TrendingUp,
  ArrowRight,
  PenSquare,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Tag,
  Users,
  Image,
  MessageSquare,
  Search,
} from 'lucide-react';
import { articlesApi, guestPostsApi, newsletterApi } from '@/lib/api-client';

export default function AdminOverviewPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [totalArticles, setTotalArticles] = useState<number>(0);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [feedData, queueData, subsStats] = await Promise.all([
        articlesApi.getAdminArticles({ limit: 10 }).catch(() => articlesApi.getPublicFeed({ limit: 10 })),
        guestPostsApi.getModerationQueue().catch(() => []),
        newsletterApi.getStats().catch(() => ({ total: 0, active: 0 })),
      ]);

      setArticles(feedData?.items || []);
      setTotalArticles(feedData?.total || feedData?.items?.length || 0);
      setPendingSubmissions(Array.isArray(queueData) ? queueData : []);
      setSubscribersCount(subsStats?.active || subsStats?.total || 0);
    } catch (err) {
      console.error('Failed to load admin overview metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const totalViews = articles.reduce((acc, a) => acc + (a.viewsCount || a.views || 0), 0);

  const metrics = [
    {
      title: 'Published Articles',
      value: String(totalArticles || articles.length),
      change: 'Active technical publications',
      href: '/admin/articles',
      icon: FileText,
      color: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      title: 'Total Reader Views',
      value: totalViews > 0 ? (totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toLocaleString()) : 'Live Tracking',
      change: 'Across all architecture deep-dives',
      href: '/admin/articles',
      icon: Eye,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Pending Submissions',
      value: String(pendingSubmissions.length),
      change: `${pendingSubmissions.filter((p) => p.status === 'CHANGES_REQUESTED').length} revisions pending`,
      href: '/admin/guest-posts',
      icon: Inbox,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Newsletter Subscribers',
      value: subscribersCount > 0 ? subscribersCount.toLocaleString() : 'Active',
      change: 'Engineering Dispatch recipients',
      href: '/admin/newsletter',
      icon: Mail,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const quickTools = [
    { name: 'Series Roadmaps', href: '/admin/series', icon: Layers, desc: 'Curate multi-chapter curriculums' },
    { name: 'Tags Taxonomy', href: '/admin/tags', icon: Tag, desc: 'Normalize topic tags & indexing' },
    { name: 'Staff & Roles', href: '/admin/users', icon: Users, desc: 'Manage author & editor permissions' },
    { name: 'Media Library', href: '/admin/media', icon: Image, desc: 'Architecture SVGs & WebP variants' },
    { name: 'Discussions', href: '/admin/comments', icon: MessageSquare, desc: 'Moderate reader questions' },
    { name: 'SEO & Social', href: '/admin/seo', icon: Search, desc: 'Twitter / LinkedIn card tester' },
  ];

  const recentArticles = articles.slice(0, 4);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Editorial CMS Dashboard
            </h1>
            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-bold">
              SYSTEM LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage technical publications, moderate contributor guest posts, review SEO health, and inspect audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Write Article</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-3 hover:border-border hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-2xl font-mono font-extrabold text-foreground">{item.value}</p>
                <p className="text-xs font-semibold text-foreground/90">{item.title}</p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.change}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Access Modules */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Editorial & Administration Suites
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="p-3.5 rounded-xl border border-border/70 bg-card/40 hover:bg-muted/40 hover:border-border transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{tool.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 font-mono">
              <FileText className="h-4 w-4 text-primary" />
              <span>Recent Publications</span>
            </h2>
            <Link href="/admin/articles" className="text-xs font-mono text-primary hover:underline">
              View all ({totalArticles})
            </Link>
          </div>

          <div className="space-y-3">
            {recentArticles.length > 0 ? (
              recentArticles.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1 mr-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-semibold">
                        {(typeof art.category === 'object' && art.category !== null ? art.category.name : typeof art.category === 'string' ? art.category : 'System Design') || 'System Design'}
                      </span>
                      <span>•</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-semibold ${
                          art.status === 'PUBLISHED'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {art.status || 'PUBLISHED'}
                      </span>
                      <span>•</span>
                      <span>{(art.viewsCount || art.views || 0).toLocaleString()} views</span>
                    </div>
                    <h3 className="text-xs font-bold text-foreground truncate">{art.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="px-2.5 py-1 text-xs font-mono rounded border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground font-mono py-4 text-center">No recent articles found.</p>
            )}
          </div>
        </div>

        {/* Pending Moderation Queue */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 font-mono">
              <Inbox className="h-4 w-4 text-amber-500" />
              <span>Moderation Queue ({pendingSubmissions.length})</span>
            </h2>
            <Link href="/admin/guest-posts" className="text-xs font-mono text-primary hover:underline">
              Review Queue
            </Link>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.length > 0 ? (
              pendingSubmissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-lg border border-border/40 space-y-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Author: {sub.author?.name || sub.authorName || 'Contributor'}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        sub.status === 'CHANGES_REQUESTED'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-foreground leading-snug">{sub.title}</h3>
                  <div className="flex justify-end pt-1">
                    <Link
                      href="/admin/guest-posts"
                      className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                    >
                      <span>Moderate Article</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground font-mono py-4 text-center">Moderation queue is all caught up!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
