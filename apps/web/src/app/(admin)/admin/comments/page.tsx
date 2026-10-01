'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, CheckCircle, AlertOctagon, Trash2, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface AdminComment {
  id: string;
  authorName: string;
  authorUsername: string;
  articleTitle: string;
  articleSlug: string;
  content: string;
  status: 'APPROVED' | 'PENDING' | 'REPORTED' | 'SPAM';
  createdAt: string;
}

const INITIAL_COMMENTS: AdminComment[] = [
  {
    id: 'c1',
    authorName: 'Alex Rivera',
    authorUsername: 'alexdev',
    articleTitle: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
    articleSlug: 'designing-distributed-rate-limiter',
    content: 'Excellent breakdown of the sliding window counter algorithm. Have you evaluated Redis Cluster slot hashing implications?',
    status: 'APPROVED',
    createdAt: '3 days ago',
  },
  {
    id: 'c2',
    authorName: 'Guest Engineer',
    authorUsername: 'guest_reader',
    articleTitle: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
    articleSlug: 'zero-downtime-postgresql-migrations',
    content: 'Check out cheap SEO packages at http://spamsite.xyz best rankings guaranteed!!',
    status: 'SPAM',
    createdAt: 'Yesterday',
  },
  {
    id: 'c3',
    authorName: 'Marcus Vance',
    authorUsername: 'mvance',
    articleTitle: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
    articleSlug: 'kafka-partitioning-zero-data-loss',
    content: 'Does this handle group coordinator failure when running on AWS EKS with spot instances?',
    status: 'APPROVED',
    createdAt: '5 hours ago',
  },
];

export default function AdminCommentsModerationPage() {
  const [comments, setComments] = useState<AdminComment[]>(INITIAL_COMMENTS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = comments.filter((c) => {
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchSearch =
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.authorName.toLowerCase().includes(search.toLowerCase()) ||
      c.articleTitle.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleApprove = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'APPROVED' } : c)),
    );
    toast.success('Comment approved');
  };

  const handleSpam = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'SPAM' } : c)),
    );
    toast.success('Comment marked as SPAM');
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success('Comment deleted permanently');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Comment Moderation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review community discussions, filter spam, and approve reader feedback across all articles.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['ALL', 'APPROVED', 'PENDING', 'REPORTED', 'SPAM'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border/70 bg-card p-5 space-y-3 hover:border-border transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-foreground">{item.authorName}</span>
                <span className="font-mono text-muted-foreground text-[11px]">@{item.authorUsername}</span>
                <span className="text-muted-foreground">•</span>
                <Link
                  href={`/articles/${item.articleSlug}`}
                  target="_blank"
                  className="font-semibold text-primary hover:underline flex items-center gap-1 line-clamp-1"
                >
                  <span>{item.articleTitle}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <span
                  className={`px-2 py-0.5 rounded font-semibold ${
                    item.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : item.status === 'SPAM'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
                <span>{item.createdAt}</span>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/40">
              {item.content}
            </p>

            <div className="flex justify-end items-center gap-2 pt-1">
              {item.status !== 'APPROVED' && (
                <button
                  onClick={() => handleApprove(item.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 text-[11px] font-mono font-medium transition-colors"
                >
                  <CheckCircle className="h-3 w-3" /> Approve
                </button>
              )}
              {item.status !== 'SPAM' && (
                <button
                  onClick={() => handleSpam(item.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 text-[11px] font-mono font-medium transition-colors"
                >
                  <AlertOctagon className="h-3 w-3" /> Mark Spam
                </button>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-[11px] font-mono font-medium transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
