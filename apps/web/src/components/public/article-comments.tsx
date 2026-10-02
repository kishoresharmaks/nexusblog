'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Reply,
  Trash2,
  Edit3,
  Check,
  X,
  ShieldCheck,
  Loader2,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { commentsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface CommentUser {
  id: string;
  name: string;
  username: string;
  avatar?: string | null;
  role?: string;
}

interface CommentItem {
  id: string;
  articleId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  user?: CommentUser;
  replies?: CommentItem[];
}

interface ArticleCommentsProps {
  articleId: string;
  articleSlug?: string;
  articleAuthorUsername?: string;
}

export function ArticleComments({
  articleId,
  articleSlug,
  articleAuthorUsername,
}: ArticleCommentsProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Load article comments
  const loadComments = useCallback(async () => {
    if (!articleId) return;
    try {
      setLoading(true);
      const data = await commentsApi.getForArticle(articleId);
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Count all comments including nested replies
  const totalCommentsCount = React.useMemo(() => {
    const countReplies = (list: CommentItem[]): number => {
      let count = 0;
      for (const item of list) {
        count += 1;
        if (item.replies && item.replies.length > 0) {
          count += countReplies(item.replies);
        }
      }
      return count;
    };
    return countReplies(comments);
  }, [comments]);

  // Submit a top-level comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newCommentText.trim();
    if (!content) {
      toast.error('Please enter your comment or architectural note.');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please sign in to join the discussion.');
      return;
    }

    setSubmitting(true);
    try {
      await commentsApi.create(articleId, content);
      setNewCommentText('');
      toast.success('Comment posted successfully!');
      await loadComments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit a reply
  const handlePostReply = async (parentId: string) => {
    const content = replyText.trim();
    if (!content) {
      toast.error('Please enter your reply.');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please sign in to post a reply.');
      return;
    }

    setSubmittingReply(true);
    try {
      await commentsApi.create(articleId, content, parentId);
      setReplyText('');
      setReplyingToId(null);
      toast.success('Reply posted successfully!');
      await loadComments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Save edit
  const handleSaveEdit = async (commentId: string) => {
    const content = editText.trim();
    if (!content) {
      toast.error('Comment content cannot be empty.');
      return;
    }

    setSubmittingEdit(true);
    try {
      await commentsApi.update(commentId, content);
      setEditingId(null);
      setEditText('');
      toast.success('Comment updated successfully');
      await loadComments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update comment.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsApi.delete(commentId);
      toast.success('Comment deleted.');
      await loadComments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment.');
    }
  };

  // Format relative timestamp safely
  const formatTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Render a single comment node with recursive reply tree
  const renderCommentItem = (item: CommentItem, isReply = false) => {
    const isAuthor =
      articleAuthorUsername &&
      item.user?.username &&
      item.user.username.toLowerCase() === articleAuthorUsername.toLowerCase();
    const isStaff = item.user?.role === 'SUPER_ADMIN' || item.user?.role === 'ADMIN';
    const isOwnComment = user?.id === item.userId;
    const canDelete = isOwnComment || isAdmin;
    const isEditing = editingId === item.id;
    const isReplying = replyingToId === item.id;

    return (
      <div
        key={item.id}
        className={`group relative rounded-xl border transition-all ${
          isReply
            ? 'border-border/60 bg-muted/20 p-3.5 sm:p-4 mt-3 ml-3 sm:ml-8'
            : 'border-border/80 bg-card/60 p-4 sm:p-5'
        }`}
      >
        {/* Comment Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                isStaff
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : isAuthor
                  ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30'
                  : 'bg-muted text-foreground border border-border'
              }`}
            >
              {item.user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span>{(item.user?.name || 'A').charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-semibold text-xs sm:text-sm text-foreground">
                {item.user?.name || 'Anonymous Engineer'}
              </span>

              {item.user?.username && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  @{item.user.username}
                </span>
              )}

              {isAuthor && (
                <span className="rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                  Author
                </span>
              )}

              {isStaff && (
                <span className="rounded bg-primary/10 text-primary border border-primary/30 px-1.5 py-0.2 text-[9px] font-mono font-bold flex items-center gap-0.5">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  <span>Nexus Staff</span>
                </span>
              )}

              <span className="text-[10px] font-mono text-muted-foreground" suppressHydrationWarning>
                • {formatTimeAgo(item.createdAt)}
              </span>
            </div>
          </div>

          {/* Action buttons (Reply / Edit / Delete) */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground opacity-90 group-hover:opacity-100 transition-opacity">
            {isAuthenticated && !isEditing && (
              <button
                type="button"
                onClick={() => {
                  if (isReplying) {
                    setReplyingToId(null);
                    setReplyText('');
                  } else {
                    setReplyingToId(item.id);
                    setReplyText('');
                    setEditingId(null);
                  }
                }}
                className="hover:text-foreground inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
                title="Reply to comment"
              >
                <Reply className="h-3 w-3" />
                <span className="hidden sm:inline">Reply</span>
              </button>
            )}

            {isOwnComment && !isEditing && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(item.id);
                  setEditText(item.content);
                  setReplyingToId(null);
                }}
                className="hover:text-foreground inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
                title="Edit comment"
              >
                <Edit3 className="h-3 w-3" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {canDelete && !isEditing && (
              <button
                type="button"
                onClick={() => handleDeleteComment(item.id)}
                className="hover:text-rose-500 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Delete comment"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Comment Body / Edit Mode */}
        <div className="mt-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans pl-10">
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <div className="flex items-center justify-end gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  disabled={submittingEdit}
                  className="px-2.5 py-1 rounded border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(item.id)}
                  disabled={submittingEdit || !editText.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingEdit ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  <span>Save</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">{item.content}</div>
          )}
        </div>

        {/* Inline Reply Form */}
        {isReplying && (
          <div className="mt-4 pt-3 border-t border-border/40 pl-10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Replying to @{item.user?.username || item.user?.name || 'Engineer'}</span>
              <button
                type="button"
                onClick={() => setReplyingToId(null)}
                className="hover:text-foreground inline-flex items-center gap-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </button>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your technical reply..."
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handlePostReply(item.id)}
                disabled={submittingReply || !replyText.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submittingReply ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                <span>Reply</span>
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {item.replies && item.replies.length > 0 && (
          <div className="space-y-3 mt-1">
            {item.replies.map((reply) => renderCommentItem(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="comments" className="mt-14 pt-8 border-t border-border/60 scroll-mt-24 font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>Discussion &amp; Technical Notes</span>
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-mono font-bold">
                {totalCommentsCount}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Peer architectural reviews, benchmark insights, and implementation Q&amp;A
            </p>
          </div>
        </div>
      </div>

      {/* Main Comment Input Box (or Sign-in Prompt) */}
      <div className="mb-8 rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 shadow-xs">
        {isAuthenticated ? (
          <form onSubmit={handlePostComment} className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="font-semibold text-foreground">
                Commenting as {user?.name || user?.username}
              </span>
              <span>(@{user?.username || 'user'})</span>
            </div>

            <div className="relative">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Share your technical analysis, questions, edge case considerations, or implementation notes..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background/80 p-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-y"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] font-mono text-muted-foreground">
                Be constructive and adhere to our{' '}
                <Link href="/content-policy" className="text-primary hover:underline">
                  Content Policy
                </Link>
                .
              </span>

              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Post Comment</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Join the Technical Discussion</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sign in to ask questions, share benchmark findings, or participate in architecture reviews.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname || `/articles/${articleSlug || ''}`)}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors shadow-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
              >
                <span>Register</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Comment List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs font-mono">Loading discussions...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-10 text-center rounded-2xl border border-dashed border-border/70 bg-card/20 p-6 space-y-2">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <h4 className="text-sm font-bold text-foreground">No comments yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Be the first engineer to leave architectural feedback or ask a technical question about this blueprint.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((item) => renderCommentItem(item, false))}
        </div>
      )}
    </section>
  );
}
