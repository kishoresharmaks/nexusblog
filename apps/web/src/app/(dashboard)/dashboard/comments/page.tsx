'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Trash2, Edit3, Check, X, ArrowRight, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL_COMMENTS = [
  {
    id: 'c1',
    articleId: '1',
    articleTitle: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
    articleSlug: 'designing-distributed-rate-limiter',
    category: 'System Design',
    content: 'Excellent breakdown of the sliding window counter algorithm. Have you evaluated Redis Cluster slot hashing implications when using Lua multi-key operations?',
    status: 'APPROVED',
    createdAt: '3 days ago',
  },
  {
    id: 'c2',
    articleId: '2',
    articleTitle: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
    articleSlug: 'zero-downtime-postgresql-migrations',
    category: 'Databases',
    content: 'Using lock_timeout is indeed critical before running ALTER TABLE. We encountered an incident last year where a blocked lock queued all incoming OLTP traffic.',
    status: 'APPROVED',
    createdAt: '1 week ago',
  },
];

export default function CommentsPage() {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleStartEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: editText } : c)),
    );
    setEditingId(null);
    toast.success('Comment updated successfully');
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success('Comment deleted');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-border/60 pb-6 space-y-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-emerald-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            My Comments & Discussions
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review and manage your comments and technical feedback across all articles.
        </p>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/70 bg-card p-5 space-y-3 hover:border-border transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded font-semibold text-foreground">
                    {item.category}
                  </span>
                  <Link
                    href={`/articles/${item.articleSlug}`}
                    className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 line-clamp-1"
                  >
                    <span>{item.articleTitle}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                    {item.status}
                  </span>
                  <span>{item.createdAt}</span>
                </div>
              </div>

              {editingId === item.id ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
                    >
                      <Check className="h-3.5 w-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/40">
                  {item.content}
                </p>
              )}

              {editingId !== item.id && (
                <div className="flex justify-end items-center gap-2 pt-1">
                  <button
                    onClick={() => handleStartEdit(item.id, item.content)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border/60 hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-[11px] font-mono text-muted-foreground hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No comments yet</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Participate in discussions and share technical feedback at the bottom of published articles.
          </p>
        </div>
      )}
    </div>
  );
}
