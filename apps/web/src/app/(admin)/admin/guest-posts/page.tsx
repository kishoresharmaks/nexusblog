'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ClientMdxRenderer } from '@/components/mdx/client-mdx-renderer';
import {
  Inbox,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  MessageSquare,
  Send,
  X,
  User,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { guestPostsApi } from '@/lib/api-client';

interface Submission {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName?: string;
  authorUsername?: string;
  guestName?: string;
  guestEmail?: string;
  editToken?: string;
  author?: {
    name?: string;
    username?: string;
    email?: string;
  };
  category?: {
    id?: string;
    name?: string;
    slug?: string;
  } | string;
  difficulty: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  createdAt?: string;
  submittedAt?: string;
  editorialFeedback?: string;
}

export default function AdminGuestPostsQueuePage() {
  const [queue, setQueue] = useState<Submission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectingItem, setInspectingItem] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getCategoryName = (cat: any): string => {
    if (!cat) return 'System Design';
    if (typeof cat === 'object') return cat.name || cat.slug || 'System Design';
    if (typeof cat === 'string') return cat;
    return 'System Design';
  };

  const getAuthorName = (item: any): string => {
    if (item.author?.name) return item.author.name;
    if (item.guestName) return `${item.guestName} (Guest)`;
    if (item.authorName) return item.authorName;
    return 'Anonymous Guest';
  };

  const getAuthorUsername = (item: any): string => {
    if (item.author?.username) return `@${item.author.username}`;
    if (item.guestEmail) return item.guestEmail;
    if (item.authorUsername) return `@${item.authorUsername}`;
    return 'guest';
  };

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await guestPostsApi.getModerationQueue({ status: selectedStatus });
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load guest posts queue:', err);
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const filtered = queue.filter((item) => {
    if (selectedStatus === 'ALL') return true;
    return item.status === selectedStatus;
  });

  const handleModerate = async (id: string, action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT') => {
    setIsActionLoading(true);
    try {
      await guestPostsApi.moderateSubmission(id, action, feedbackText);
      toast.success(`Submission successfully updated (${action})`);
      if (inspectingItem?.id === id) {
        setInspectingItem(null);
      }
      setFeedbackText('');
      await loadQueue();
    } catch (err: any) {
      toast.error(err.message || 'Failed to moderate submission');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Guest Post Moderation Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review submitted contributor drafts, request technical revisions, or approve and publish to the main portal.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStatus === st
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-mono">Loading moderation queue...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 font-mono text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Article Title</th>
                  <th className="py-3 px-4">Contributor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 min-w-[260px]">
                      <p className="font-bold text-foreground leading-snug">{item.title}</p>
                      <p className="font-mono text-[11px] text-muted-foreground line-clamp-1">{item.excerpt}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                      <p className="font-semibold text-foreground">{getAuthorName(item)}</p>
                      <p className="text-muted-foreground">@{getAuthorUsername(item)}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <span className="rounded bg-muted px-2 py-0.5 text-foreground font-semibold">
                        {getCategoryName(item.category)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                          item.status === 'APPROVED' || item.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'CHANGES_REQUESTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.submittedAt || 'Recently')}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setInspectingItem(item);
                          setFeedbackText(item.editorialFeedback || '');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold font-mono text-xs hover:opacity-90 transition-all shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Review Draft</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-2 text-muted-foreground">
            <Inbox className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground">No submissions in queue</p>
            <p className="text-xs">There are no guest posts matching the selected status filter.</p>
          </div>
        )}
      </div>

      {/* Full Screen Review Drawer Modal */}
      {inspectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectingItem(null);
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] rounded-2xl border border-border/80 bg-background text-foreground shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                    Editorial Review Inspection
                  </span>
                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      inspectingItem.status === 'APPROVED' || inspectingItem.status === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        : inspectingItem.status === 'CHANGES_REQUESTED'
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    }`}
                  >
                    {inspectingItem.status}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-foreground truncate max-w-2xl">
                  {inspectingItem.title}
                </h2>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                title="Close dialog (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Split view (MDX Rendered + Review Form) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden min-h-0">
              {/* Article Preview (2 cols) */}
              <div className="lg:col-span-2 overflow-y-auto p-6 space-y-6 bg-card">
                <div className="space-y-2 border-b border-border/60 pb-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="bg-muted px-2 py-0.5 rounded font-semibold text-foreground">
                      {getCategoryName(inspectingItem.category)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Difficulty: {inspectingItem.difficulty}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Author: {getAuthorName(inspectingItem)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{inspectingItem.excerpt}</p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm">
                  <ClientMdxRenderer content={inspectingItem.content} />
                </div>
              </div>

              {/* Editorial Decision Panel (1 col) */}
              <div className="p-5 space-y-5 bg-card border-l border-border overflow-y-auto flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      <span>Editorial Feedback</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Guidance and comments entered here will be sent directly to the contributor dashboard and displayed inside their draft editor when revisions are requested.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-semibold text-foreground">
                      Author Revision Notes:
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={8}
                      placeholder="e.g. Please add concrete p99 latency benchmark metrics comparing local vs multi-region quorum leases, and expand on Raft state machine partition recovery..."
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed font-sans resize-y shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/40">
                  <button
                    onClick={() => handleModerate(inspectingItem.id, 'APPROVE')}
                    disabled={isActionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isActionLoading ? 'Processing...' : 'Approve & Publish Article'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!feedbackText.trim()) {
                        toast.error('Please enter revision guidance in the feedback box before requesting changes.');
                        return;
                      }
                      handleModerate(inspectingItem.id, 'REQUEST_CHANGES');
                    }}
                    disabled={isActionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-mono font-semibold hover:bg-rose-500/20 transition-all disabled:opacity-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Request Author Revisions</span>
                  </button>

                  <button
                    onClick={() => handleModerate(inspectingItem.id, 'REJECT')}
                    disabled={isActionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-mono transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject Submission</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
