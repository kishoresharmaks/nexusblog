'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  RotateCw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type StatusType =
  | 'ALL'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

interface Submission {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  updatedAt: string;
  submittedAt?: string;
  editorialFeedback?: string;
  reviewerName?: string;
}

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'gp1',
    title: 'Designing Multi-Region Active-Active Postgres with CockroachDB & Raft',
    slug: 'multi-region-active-active-postgres',
    category: 'Databases',
    difficulty: 'EXPERT',
    status: 'CHANGES_REQUESTED',
    updatedAt: 'Yesterday, 18:20',
    submittedAt: '3 days ago',
    reviewerName: 'Staff Editor Alex',
    editorialFeedback:
      'Great architectural depth! Could you please expand section 3 with a concrete Mermaid sequence diagram showing what happens during a network partition split-brain scenario? Also check the benchmark reproduction steps.',
  },
  {
    id: 'gp2',
    title: 'Building a High-Performance Redis-Backed Priority Queue with Zero-Loss Semantics',
    slug: 'redis-backed-priority-queue',
    category: 'System Design',
    difficulty: 'ADVANCED',
    status: 'UNDER_REVIEW',
    updatedAt: '2 days ago',
    submittedAt: '2 days ago',
  },
  {
    id: 'gp3',
    title: 'Sub-Millisecond gRPC Transcoding with Envoy and Rust',
    slug: 'sub-millisecond-grpc-transcoding',
    category: 'Backend Architecture',
    difficulty: 'ADVANCED',
    status: 'PUBLISHED',
    updatedAt: '1 week ago',
    submittedAt: '2 weeks ago',
  },
  {
    id: 'gp4',
    title: 'Deep Dive into Linux eBPF for Container Network Observability',
    slug: 'linux-ebpf-container-observability',
    category: 'DevOps & Cloud',
    difficulty: 'EXPERT',
    status: 'DRAFT',
    updatedAt: '4 hours ago',
  },
];

export default function GuestPostsTrackerPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('ALL');
  const [feedbackModal, setFeedbackModal] = useState<Submission | null>(null);

  const filtered = submissions.filter((sub) => {
    if (selectedStatus === 'ALL') return true;
    return sub.status === selectedStatus;
  });

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-border">DRAFT</span>;
      case 'SUBMITTED':
        return <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-blue-500/30">SUBMITTED</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-amber-500/30">UNDER_REVIEW</span>;
      case 'CHANGES_REQUESTED':
        return <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-rose-500/30">CHANGES_REQUESTED</span>;
      case 'APPROVED':
        return <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-purple-500/30">APPROVED</span>;
      case 'PUBLISHED':
        return <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-emerald-500/30">PUBLISHED</span>;
      case 'REJECTED':
        return <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-rose-500/30">REJECTED</span>;
    }
  };

  const handleDelete = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    toast.success('Draft deleted');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Contributor Submissions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track guest posts, review editorial comments, make revisions, and view published articles.
          </p>
        </div>

        <Link
          href="/guest-post/submit"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Guest Post</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'DRAFT', label: 'Drafts' },
          { key: 'SUBMITTED', label: 'Submitted' },
          { key: 'UNDER_REVIEW', label: 'In Review' },
          { key: 'CHANGES_REQUESTED', label: 'Changes Requested' },
          { key: 'PUBLISHED', label: 'Published' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStatus === tab.key
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-border/70 bg-card p-5 hover:border-border hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded font-semibold text-foreground">
                    {item.category}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{item.difficulty}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  {getStatusBadge(item.status)}
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Updated {item.updatedAt}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-foreground leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-xs font-mono text-muted-foreground">
                    Slug: <span className="text-foreground/80">/{item.slug}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Feedback button if changes requested or has notes */}
                  {item.editorialFeedback && (
                    <button
                      onClick={() => setFeedbackModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-mono font-semibold hover:bg-rose-500/20 transition-all"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>View Editorial Feedback</span>
                    </button>
                  )}

                  {/* Edit / Revise */}
                  {item.status !== 'PUBLISHED' && (
                    <Link
                      href={`/guest-post/submit?edit=${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-mono font-medium transition-all"
                    >
                      <Edit className="h-3 w-3" />
                      <span>{item.status === 'CHANGES_REQUESTED' ? 'Revise Draft' : 'Edit Draft'}</span>
                    </Link>
                  )}

                  {/* View published */}
                  {item.status === 'PUBLISHED' && (
                    <Link
                      href={`/articles/${item.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-all"
                    >
                      <span>View Article</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}

                  {/* Delete draft */}
                  {item.status === 'DRAFT' && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border border-border/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Delete draft"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No submissions found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Ready to publish with us? Create your first technical article draft.
          </p>
          <Link
            href="/guest-post/submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm mt-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Write Guest Post</span>
          </Link>
        </div>
      )}

      {/* Editorial Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-bold text-sm text-foreground font-mono">Editorial Review Notes</h3>
              </div>
              <button
                onClick={() => setFeedbackModal(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground font-mono">Article:</p>
                <p className="text-sm font-bold text-foreground">{feedbackModal.title}</p>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="font-semibold text-foreground">{feedbackModal.reviewerName || 'Editorial Team'}</span>
                  <span>{feedbackModal.updatedAt}</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {feedbackModal.editorialFeedback}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFeedbackModal(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
              <Link
                href={`/guest-post/submit?edit=${feedbackModal.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Revise Draft Now</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
