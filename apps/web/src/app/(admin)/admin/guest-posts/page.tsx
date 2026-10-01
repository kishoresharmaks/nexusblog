'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MdxRenderer } from '@/components/mdx/mdx-renderer';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorUsername: string;
  category: string;
  difficulty: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  editorialFeedback?: string;
}

const INITIAL_QUEUE: Submission[] = [
  {
    id: 'gp1',
    title: 'Designing Multi-Region Active-Active Postgres with CockroachDB & Raft',
    slug: 'multi-region-active-active-postgres',
    excerpt: 'Deep dive into distributed consensus, range leases, and cross-region latencies in globally distributed relational databases.',
    content: `# Multi-Region Active-Active Postgres with CockroachDB & Raft

Building active-active relational data architectures requires solving multi-master write conflicts and cross-region consensus.

## Replication Topology

\`\`\`mermaid
graph LR
    US_East[US-East Region (Leader)] -->|Raft Log| EU_West[EU-West Region]
    US_East -->|Raft Log| AP_South[AP-South Region]
\`\`\`

<Callout type="note" title="Range Leases">
CockroachDB separates Raft leadership from range leases to provide local low-latency reads.
</Callout>
`,
    authorName: 'David Chen',
    authorUsername: 'davidchen',
    category: 'Databases',
    difficulty: 'EXPERT',
    status: 'SUBMITTED',
    submittedAt: '3 hours ago',
  },
  {
    id: 'gp2',
    title: 'Building a High-Performance Redis-Backed Priority Queue with Zero-Loss Semantics',
    slug: 'redis-backed-priority-queue',
    excerpt: 'Implementing guaranteed message ordering, dead letter queues, and Lua atomicity on top of Redis Sorted Sets.',
    content: `# High-Performance Redis-Backed Priority Queue

Using Sorted Sets (\`ZADD\`, \`ZPOPMIN\`) with Lua scripting delivers microsecond message enqueueing.
`,
    authorName: 'Sarah Lin',
    authorUsername: 'sarahlin',
    category: 'System Design',
    difficulty: 'ADVANCED',
    status: 'UNDER_REVIEW',
    submittedAt: 'Yesterday',
  },
];

export default function AdminGuestPostsQueuePage() {
  const [queue, setQueue] = useState<Submission[]>(INITIAL_QUEUE);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectingItem, setInspectingItem] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const filtered = queue.filter((item) => {
    if (selectedStatus === 'ALL') return true;
    return item.status === selectedStatus;
  });

  const handleModerate = async (id: string, action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT') => {
    setIsActionLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsActionLoading(false);

    let nextStatus: Submission['status'];
    if (action === 'APPROVE') nextStatus = 'APPROVED';
    else if (action === 'REQUEST_CHANGES') nextStatus = 'CHANGES_REQUESTED';
    else nextStatus = 'REJECTED';

    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus,
              editorialFeedback: feedbackText || item.editorialFeedback,
            }
          : item,
      ),
    );

    if (inspectingItem?.id === id) {
      setInspectingItem(null);
    }
    setFeedbackText('');

    toast.success(`Submission status updated to ${nextStatus}`);
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
        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'].map((st) => (
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
                    <p className="font-semibold text-foreground">{item.authorName}</p>
                    <p className="text-muted-foreground">@{item.authorUsername}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    <span className="rounded bg-muted px-2 py-0.5 text-foreground font-semibold">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                        item.status === 'APPROVED'
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
                    {item.submittedAt}
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
      </div>

      {/* Full Screen Review Drawer Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 sm:p-6">
          <div className="w-full max-w-5xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/30 flex items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-wider">
                  Editorial Inspection
                </span>
                <h2 className="text-base sm:text-lg font-bold text-foreground truncate max-w-xl">
                  {inspectingItem.title}
                </h2>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Split view (MDX Rendered + Review Form) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/60 overflow-hidden">
              {/* Article Preview (2 cols) */}
              <div className="lg:col-span-2 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2 border-b border-border/40 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="bg-muted px-2 py-0.5 rounded font-semibold text-foreground">
                      {inspectingItem.category}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Difficulty: {inspectingItem.difficulty}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Author: {inspectingItem.authorName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{inspectingItem.excerpt}</p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none text-xs">
                  <MdxRenderer content={inspectingItem.content} />
                </div>
              </div>

              {/* Editorial Decision Panel (1 col) */}
              <div className="p-5 space-y-5 bg-card/60 overflow-y-auto flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-foreground">
                    Editorial Feedback
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-muted-foreground">
                      Feedback / Revision Guidance to Author:
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={6}
                      placeholder="Add detailed feedback regarding diagram clarity, benchmark reproducibility, or code snippets..."
                      className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/40">
                  <button
                    onClick={() => handleModerate(inspectingItem.id, 'APPROVE')}
                    disabled={isActionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-mono font-semibold hover:bg-emerald-500 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve & Publish Article</span>
                  </button>

                  <button
                    onClick={() => handleModerate(inspectingItem.id, 'REQUEST_CHANGES')}
                    disabled={isActionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-mono font-semibold hover:bg-rose-500/20 transition-all"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Request Revisions</span>
                  </button>

                  <button
                    onClick={() => handleModerate(inspectingItem.id, 'REJECT')}
                    disabled={isActionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-mono transition-colors"
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
