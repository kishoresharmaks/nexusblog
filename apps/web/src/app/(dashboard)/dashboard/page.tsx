'use client';

import React from 'react';
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
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Saved Bookmarks',
      value: 12,
      href: '/dashboard/bookmarks',
      icon: Bookmark,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Articles in Progress',
      value: 4,
      href: '/dashboard/history',
      icon: History,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Discussions & Comments',
      value: 7,
      href: '/dashboard/comments',
      icon: MessageSquare,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Guest Submissions',
      value: 2,
      href: '/dashboard/guest-posts',
      icon: FileText,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
  ];

  const inProgressArticle = {
    title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
    slug: 'designing-distributed-rate-limiter',
    category: 'System Design',
    progress: 68,
    remainingMins: 4,
    lastViewed: '2 hours ago',
  };

  const recentBookmarks = [
    {
      id: 'b1',
      title: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
      slug: 'zero-downtime-postgresql-migrations',
      category: 'Databases',
      readingTime: 16,
      savedAt: 'Yesterday',
    },
    {
      id: 'b2',
      title: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
      slug: 'kafka-partitioning-zero-data-loss',
      category: 'Distributed Systems',
      readingTime: 15,
      savedAt: '3 days ago',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {user?.name}
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
                <p className="text-2xl font-mono font-extrabold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{item.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Continue Reading Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary">
            <BookOpen className="h-4 w-4" />
            <span>Continue Reading</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {inProgressArticle.lastViewed}
          </span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {inProgressArticle.category}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {inProgressArticle.title}
            </h3>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Progress: {inProgressArticle.progress}%</span>
              <span>~{inProgressArticle.remainingMins} mins remaining</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${inProgressArticle.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            href={`/articles/${inProgressArticle.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
          >
            <span>Resume Reading</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

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

          <div className="space-y-3">
            {recentBookmarks.map((item) => (
              <Link
                key={item.id}
                href={`/articles/${item.slug}`}
                className="group block p-3 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>{item.category}</span>
                  <span>{item.savedAt}</span>
                </div>
                <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
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

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                  UNDER_REVIEW
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">Submitted 2d ago</span>
              </div>
              <h3 className="text-xs font-semibold text-foreground leading-snug">
                Event-Driven Architecture with Debezium and Apache Kafka
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Assigned to editorial reviewer. You will be notified when feedback is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
