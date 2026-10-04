'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    // Log to client console for debugging
    console.error('[Route Error Boundary Captured]:', error);

    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.toLowerCase().includes('chunk') ||
      error?.message?.toLowerCase().includes('failed to fetch dynamically imported module') ||
      error?.message?.toLowerCase().includes('loading css chunk');

    if (isChunkError && typeof window !== 'undefined') {
      const lastReload = sessionStorage.getItem('nexus_last_chunk_reload');
      const now = Date.now();

      // If we haven't auto-reloaded in the last 15 seconds, reload to fetch latest bundle
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('nexus_last_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  const isUpdating =
    error?.name === 'ChunkLoadError' ||
    error?.message?.toLowerCase().includes('chunk') ||
    error?.message?.toLowerCase().includes('fetch') ||
    error?.message?.toLowerCase().includes('network');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 text-center font-sans">
      <div className="max-w-lg w-full bg-card border border-border/80 rounded-2xl p-8 sm:p-10 shadow-lg space-y-6">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>{isUpdating ? 'System Updating' : 'Temporary Connection Hiccup'}</span>
        </div>

        {/* Icon */}
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
          {isUpdating ? <Sparkles className="h-8 w-8 text-primary" /> : <AlertTriangle className="h-8 w-8" />}
        </div>

        {/* Friendly Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {isUpdating ? 'We’re Updating NexusNation' : 'Unable to Load Page'}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isUpdating
              ? 'Our engineering platform is receiving an update or loading new assets. Please refresh the page to view the latest version.'
              : 'An unexpected issue occurred while rendering this technical document. Please try again in a few moments.'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Refresh Page</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono text-foreground hover:bg-muted transition-all"
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            <span>Return to Homepage</span>
          </Link>
        </div>

        {/* Collapsible Technical Details (Hidden from regular users by default) */}
        <div className="pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{showTechnicalDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}</span>
            {showTechnicalDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 text-left p-3.5 rounded-xl bg-muted/40 border border-border font-mono text-xs text-rose-400 space-y-1 overflow-x-auto">
              <p className="font-bold text-foreground">Error Details:</p>
              <p className="break-all">{error.name}: {error.message || 'Unknown runtime error'}</p>
              {error.digest && (
                <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  Digest ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
