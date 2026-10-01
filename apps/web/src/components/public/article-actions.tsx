'use client';

import React, { useState } from 'react';
import { Heart, Bookmark, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { siteConfig } from '@nexus/config';
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

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);

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
      const token = localStorage.getItem('nexus_access_token');
      const res = await fetch(`${siteConfig.apiUrl}/articles/${articleId}/bookmark`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await res.json();
      if (data.success) {
        setIsBookmarked(data.data.bookmarked);
        toast.success(
          data.data.bookmarked ? 'Saved to your bookmarks!' : 'Removed from bookmarks',
        );
      }
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
            ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
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
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
