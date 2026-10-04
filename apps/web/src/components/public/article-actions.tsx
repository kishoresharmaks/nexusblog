'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { articlesApi, bookmarksApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface ArticleActionsProps {
  articleId: string;
  initialLikes?: number;
  initialBookmarked?: boolean;
  commentsCount?: number;
}

export function ArticleActions({
  articleId,
  initialLikes = 0,
  initialBookmarked = false,
  commentsCount,
}: ArticleActionsProps) {
  const { isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Sync state if initialLikes prop updates
  useEffect(() => {
    if (typeof initialLikes === 'number') {
      setLikes((prev) => {
        if (prev === 0 && initialLikes > 0) return initialLikes;
        return prev > 0 ? prev : initialLikes;
      });
    }
  }, [initialLikes]);

  // Initialize from localStorage and initialBookmarked on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && articleId) {
      const savedLike = localStorage.getItem(`nexus_liked_${articleId}`) === 'true';
      if (savedLike) {
        setHasLiked(true);
        // Ensure that if it is recorded as liked, the display count is at least 1
        setLikes((prev) => (prev === 0 ? Math.max(1, initialLikes || 1) : prev));
      }
      const savedBookmark = localStorage.getItem(`nexus_bookmarked_${articleId}`);
      if (savedBookmark !== null) {
        setIsBookmarked(savedBookmark === 'true');
      } else if (initialBookmarked) {
        setIsBookmarked(true);
      }
    }
  }, [articleId, initialBookmarked, initialLikes]);

  // Check authenticated bookmark status from backend
  useEffect(() => {
    if (isAuthenticated && articleId) {
      bookmarksApi
        .isBookmarked(articleId)
        .then((res: any) => {
          const isSaved =
            typeof res?.bookmarked === 'boolean'
              ? res.bookmarked
              : typeof res?.isBookmarked === 'boolean'
              ? res.isBookmarked
              : undefined;

          if (isSaved !== undefined) {
            setIsBookmarked(isSaved);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`nexus_bookmarked_${articleId}`, String(isSaved));
            }
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, articleId]);

  // Synchronize across multiple ArticleActions on the same page
  useEffect(() => {
    const handleLikedEvent = (e: any) => {
      if (e.detail?.articleId === articleId) {
        if (typeof e.detail.likes === 'number') {
          setLikes(e.detail.likes);
        }
        if (typeof e.detail.hasLiked === 'boolean') {
          setHasLiked(e.detail.hasLiked);
        }
      }
    };

    const handleBookmarkedEvent = (e: any) => {
      if (e.detail?.articleId === articleId) {
        setIsBookmarked(e.detail.isBookmarked);
      }
    };

    window.addEventListener('nexus_article_liked', handleLikedEvent);
    window.addEventListener('nexus_article_bookmarked', handleBookmarkedEvent);
    return () => {
      window.removeEventListener('nexus_article_liked', handleLikedEvent);
      window.removeEventListener('nexus_article_bookmarked', handleBookmarkedEvent);
    };
  }, [articleId]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const nextHasLiked = !hasLiked;
    const nextLikes = nextHasLiked ? Math.max(1, likes + 1) : Math.max(0, likes - 1);

    // Optimistic UI update
    setHasLiked(nextHasLiked);
    setLikes(nextLikes);

    if (typeof window !== 'undefined') {
      if (nextHasLiked) {
        localStorage.setItem(`nexus_liked_${articleId}`, 'true');
      } else {
        localStorage.removeItem(`nexus_liked_${articleId}`);
      }
      window.dispatchEvent(
        new CustomEvent('nexus_article_liked', {
          detail: { articleId, likes: nextLikes, hasLiked: nextHasLiked },
        }),
      );
    }

    try {
      const res: any = await articlesApi.like(articleId, nextHasLiked ? 'like' : 'unlike');
      const serverLikes =
        typeof res?.likesCount === 'number'
          ? res.likesCount
          : typeof res?.data?.likesCount === 'number'
          ? res.data.likesCount
          : nextLikes;

      setLikes(serverLikes);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('nexus_article_liked', {
            detail: { articleId, likes: serverLikes, hasLiked: nextHasLiked },
          }),
        );
      }
      if (nextHasLiked) {
        toast.success('Liked article!');
      } else {
        toast.info('Removed like');
      }
    } catch {
      // Keep optimistic state if network glitch
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to bookmark this article to your dashboard.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await bookmarksApi.toggleBookmark(articleId);
      const nextState =
        typeof res?.bookmarked === 'boolean'
          ? res.bookmarked
          : typeof res?.isBookmarked === 'boolean'
          ? res.isBookmarked
          : !isBookmarked;

      setIsBookmarked(nextState);

      if (typeof window !== 'undefined') {
        localStorage.setItem(`nexus_bookmarked_${articleId}`, String(nextState));
        window.dispatchEvent(
          new CustomEvent('nexus_article_bookmarked', {
            detail: { articleId, isBookmarked: nextState },
          }),
        );
      }
      toast.success(
        nextState ? 'Saved to your bookmarks!' : 'Removed from bookmarks',
      );
    } catch {
      toast.error('Failed to update bookmark');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Like Button */}
      <button
        type="button"
        onClick={handleLike}
        disabled={isLiking}
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
          hasLiked
            ? 'border-rose-500/40 bg-rose-500/10 text-rose-500 font-semibold'
            : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        <Heart className={`h-4 w-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        <span>{likes}</span>
      </button>

      {/* Bookmark Button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleBookmark}
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
          isBookmarked
            ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
            : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
      </button>

      {/* Comment Jump Button */}
      <a
        href="#comments"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        title="Jump to discussion"
      >
        <MessageSquare className="h-4 w-4 text-emerald-500" />
        <span>{typeof commentsCount === 'number' ? commentsCount : 'Comments'}</span>
      </a>
    </div>
  );
}

