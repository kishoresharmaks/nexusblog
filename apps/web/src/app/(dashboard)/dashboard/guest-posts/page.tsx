'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Clock,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { guestPostsApi } from '@/lib/api-client';
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

export default function GuestPostsTrackerPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('ALL');
  const [feedbackModal, setFeedbackModal] = useState<Submission | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Submission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const data: any = await guestPostsApi.getUserSubmissions({
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      });
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setSubmissions(
        items.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          category: (typeof item.category === 'object' && item.category !== null ? item.category.name : typeof item.category === 'string' ? item.category : 'System Design') || 'System Design',
          difficulty: item.difficulty || 'INTERMEDIATE',
          status: item.status,
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Recently',
          submittedAt: item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : undefined,
          editorialFeedback: item.editorialFeedback,
          reviewerName: item.reviewer?.name || 'Staff Editor',
        }))
      );
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

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

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await guestPostsApi.delete(itemToDelete.id);
      setSubmissions((prev) => prev.filter((s) => s.id !== itemToDelete.id));
      toast.success('Draft deleted successfully');
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete draft');
    } finally {
      setIsDeleting(false);
    }
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
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-mono">Loading submissions...</p>
        </div>
      ) : submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-5 transition-all space-y-4 shadow-xs ${
                item.status === 'CHANGES_REQUESTED'
                  ? 'border-rose-500/40 bg-rose-500/[0.03]'
                  : item.status === 'PUBLISHED'
                  ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                  : 'border-border/70 bg-card hover:border-border'
              }`}
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
                  {/* Revise Button for CHANGES_REQUESTED */}
                  {item.status === 'CHANGES_REQUESTED' && (
                    <Link
                      href={`/guest-post/submit?edit=${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-all shadow-xs"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Revise & Resubmit</span>
                    </Link>
                  )}

                  {/* Edit Draft */}
                  {item.status === 'DRAFT' && (
                    <Link
                      href={`/guest-post/submit?edit=${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-mono font-medium transition-all"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit Draft</span>
                    </Link>
                  )}

                  {/* View published */}
                  {item.status === 'PUBLISHED' && (
                    <Link
                      href={`/articles/${item.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-mono font-semibold hover:bg-emerald-500 transition-all shadow-xs"
                    >
                      <span>View Live Article</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  {/* Delete draft */}
                  {item.status === 'DRAFT' && (
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-lg border border-border/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Delete draft"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Editorial Feedback Highlight Card for CHANGES_REQUESTED */}
              {item.status === 'CHANGES_REQUESTED' && item.editorialFeedback && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2.5 mt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                      <span>Editorial Feedback & Revision Guidance:</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      From: <strong className="text-foreground">{item.reviewerName || 'Editorial Team'}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap pl-5 border-l-2 border-rose-500/40">
                    {item.editorialFeedback}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-muted-foreground">
                    <span>Click &quot;Revise & Resubmit&quot; above to make the requested edits in the live editor.</span>
                    <Link
                      href={`/guest-post/submit?edit=${item.id}`}
                      className="text-primary hover:underline font-semibold"
                    >
                      Open in Editor &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {/* In Review Notice */}
              {(item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW') && (
                <div className="rounded-lg bg-muted/40 border border-border/40 px-3.5 py-2 text-xs font-mono text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>Your article is in the staff moderation queue. Editors typically review within 24-48 hours.</span>
                </div>
              )}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFeedbackModal(null);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-bold text-base text-foreground font-mono">Editorial Review Notes</h3>
              </div>
              <button
                onClick={() => setFeedbackModal(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <p className="text-xs text-muted-foreground font-mono">Article:</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{feedbackModal.title}</p>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="font-semibold text-foreground">{feedbackModal.reviewerName || 'Editorial Team'}</span>
                  <span>{feedbackModal.updatedAt}</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">
                  {feedbackModal.editorialFeedback}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
              <button
                onClick={() => setFeedbackModal(null)}
                className="px-4 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
              <Link
                href={`/guest-post/submit?edit=${feedbackModal.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Revise Draft Now</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setItemToDelete(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Delete Draft Submission?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-foreground leading-relaxed bg-background p-3 rounded-xl border border-border font-mono shadow-xs">
              &quot;{itemToDelete.title}&quot;
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
