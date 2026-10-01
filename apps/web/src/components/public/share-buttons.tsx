'use client';

import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { TwitterIcon, LinkedinIcon } from './brand-icons';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Article link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const shareLinkedin = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="flex items-center space-x-1.5 text-muted-foreground">
      <span className="text-xs font-mono font-semibold uppercase mr-2 flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" /> Share
      </span>

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        className="rounded-md border border-border p-1.5 hover:bg-muted hover:text-foreground transition-colors"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <LinkIcon className="h-3.5 w-3.5" />
        )}
      </button>

      <button
        type="button"
        onClick={shareTwitter}
        aria-label="Share on X"
        className="rounded-md border border-border p-1.5 hover:bg-muted hover:text-foreground transition-colors"
      >
        <TwitterIcon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={shareLinkedin}
        aria-label="Share on LinkedIn"
        className="rounded-md border border-border p-1.5 hover:bg-muted hover:text-foreground transition-colors"
      >
        <LinkedinIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
