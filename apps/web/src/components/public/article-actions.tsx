'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { siteConfig } from '@nexus/config';
import { bookmarksApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface ArticleActionsProps {
  articleId: string;
  initialLikes?: number;
  initialBookmarked?: boolean;
}

export function ArticleActions({
  articleId,
  initialLikes = 0,
  initialBookmarked = false,
}: ArticleActionsProps) {
  const { isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize from localStorage and initialBookmarked on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && articleId) {
      const savedLike = localStorage.getItem(`nexus_liked_${articleId}`) === 'true';
      if (savedLike) {
        setHasLiked(true);
      }
      const savedBookmark = localStorage.getItem(`nexus_bookmarked_${articleId}`);
      if (savedBookmark !== null) {
        setIsBookmarked(savedBookmark === 'true');
      } else if (initialBookmarked) {
        setIsBookmarked(true);
      }
    }
  }, [articleId, initialBookmarked]);

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
        setLikes(e.detail.likes);
        setHasLiked(true);
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
    if (hasLiked) return;
    const nextLikes = likes + 1;
    setHasLiked(true);
    setLikes(nextLikes);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`nexus_liked_${articleId}`, 'true');
      window.dispatchEvent(
        new CustomEvent('nexus_article_liked', {
          detail: { articleId, likes: nextLikes },
        }),
      );
    }

    try {
      await fetch(`${siteConfig.apiUrl}/articles/${articleId}/like`, {
        method: 'POST',
      });
    } catch {
      // silent
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
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
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
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
          isBookmarked
            ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
            : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}

