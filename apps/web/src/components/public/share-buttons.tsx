'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Share2, Link as LinkIcon, Check, Send, Sparkles, Loader2 } from 'lucide-react';
import { TwitterIcon, LinkedinIcon, RedditIcon, WhatsAppIcon } from './brand-icons';
import { shortenerApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title: string;
  url?: string;
  articleId?: string;
  shortUrl?: string;
  excerpt?: string;
  author?: string;
  category?: string;
  className?: string;
}

export function ShareButtons({
  title,
  url,
  articleId,
  shortUrl,
  excerpt,
  author,
  category,
  className = '',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>(url || '');
  const [isShortening, setIsShortening] = useState(false);
  const shortLinksCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (shortUrl) {
      shortLinksCache.current['generic'] = shortUrl;
      shortLinksCache.current['default'] = shortUrl;
    }
  }, [shortUrl]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let resolved = url || window.location.href;
      // If url is a relative path or has localhost but the current browser is running on a live domain/IP
      if (!resolved || resolved.startsWith('/') || (resolved.includes('localhost') && !window.location.hostname.includes('localhost'))) {
        resolved = window.location.href;
      }
      setShareUrl(resolved);
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        setCanNativeShare(true);
      }
    }
  }, [url]);

  const getResolvedUrl = (): string => {
    if (typeof window !== 'undefined') {
      if (shareUrl && !shareUrl.includes('localhost')) {
        return shareUrl;
      }
      return window.location.href;
    }
    return shareUrl || url || '';
  };

  /**
   * Resolve short URL for specific platform with timeout and local fallback
   */
  const resolvePlatformUrl = async (platform: string): Promise<string> => {
    const rawUrl = getResolvedUrl();
    if (shortLinksCache.current[platform]) {
      return shortLinksCache.current[platform];
    }

    try {
      const res = await Promise.race([
        shortenerApi.generateShortUrl({ url: rawUrl, articleId, title, platform }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
      ]);

      if (res && res.shortUrl) {
        shortLinksCache.current[platform] = res.shortUrl;
        return res.shortUrl;
      }
    } catch {
      // Fallback silently to canonical
    }

    return rawUrl;
  };

  const handleCopy = async () => {
    setIsShortening(true);
    const finalUrl = await resolvePlatformUrl('generic');
    setIsShortening(false);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(finalUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = finalUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success(finalUrl.length < getResolvedUrl().length ? 'Short link copied to clipboard!' : 'Article link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleNativeShare = async () => {
    setIsShortening(true);
    const finalUrl = await resolvePlatformUrl('native');
    setIsShortening(false);

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || `${title} on NexusNation`,
          url: finalUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const shareTwitter = async () => {
    const finalUrl = await resolvePlatformUrl('twitter');
    const shareText = author ? `${title} by ${author}` : title;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(finalUrl)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const shareLinkedin = async () => {
    const finalUrl = await resolvePlatformUrl('linkedin');
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(finalUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer,width=600,height=550');
  };

  const shareReddit = async () => {
    const finalUrl = await resolvePlatformUrl('reddit');
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(finalUrl)}&title=${encodeURIComponent(title)}`;
    window.open(redditUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const shareWhatsApp = async () => {
    const finalUrl = await resolvePlatformUrl('whatsapp');
    const text = `${title}\n\n${finalUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex items-center gap-1.5 text-muted-foreground flex-wrap ${className}`}>
      <span className="text-xs font-mono font-semibold uppercase mr-1 flex items-center gap-1 text-foreground/80">
        <Share2 className="h-3.5 w-3.5 text-primary" />
        <span className="hidden sm:inline">Share</span>
      </span>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopy}
        title="Copy article link"
        aria-label="Copy link"
        className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-card/80 p-1.5 text-xs hover:border-primary/50 hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer shadow-2xs"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-150" />
        ) : (
          <LinkIcon className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Share on X / Twitter */}
      <button
        type="button"
        onClick={shareTwitter}
        title="Share on X"
        aria-label="Share on X"
        className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-card/80 p-1.5 text-xs hover:border-sky-500/50 hover:text-sky-400 hover:bg-muted/80 transition-all cursor-pointer shadow-2xs"
      >
        <TwitterIcon className="h-3.5 w-3.5" />
      </button>

      {/* Share on LinkedIn */}
      <button
        type="button"
        onClick={shareLinkedin}
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
        className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-card/80 p-1.5 text-xs hover:border-blue-500/50 hover:text-blue-400 hover:bg-muted/80 transition-all cursor-pointer shadow-2xs"
      >
        <LinkedinIcon className="h-3.5 w-3.5" />
      </button>

      {/* Share on Reddit */}
      <button
        type="button"
        onClick={shareReddit}
        title="Share on Reddit"
        aria-label="Share on Reddit"
        className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-card/80 p-1.5 text-xs hover:border-orange-500/50 hover:text-orange-400 hover:bg-muted/80 transition-all cursor-pointer shadow-2xs"
      >
        <RedditIcon className="h-3.5 w-3.5" />
      </button>

      {/* Share on WhatsApp */}
      <button
        type="button"
        onClick={shareWhatsApp}
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
        className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-card/80 p-1.5 text-xs hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-muted/80 transition-all cursor-pointer shadow-2xs"
      >
        <WhatsAppIcon className="h-3.5 w-3.5" />
      </button>

      {/* Native Mobile / OS Share */}
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          title="Share via device"
          aria-label="Share via device"
          className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1.5 text-xs font-mono font-semibold text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-2xs"
        >
          <Send className="h-3 w-3" />
          <span className="hidden md:inline">Share</span>
        </button>
      )}
    </div>
  );
}
