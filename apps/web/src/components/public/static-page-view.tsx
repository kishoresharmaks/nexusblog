import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, FileText } from 'lucide-react';
import { ClientMdxRenderer } from '@/components/mdx/client-mdx-renderer';

interface StaticPageViewProps {
  page: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    updatedAt?: string | Date;
  };
  backUrl?: string;
  backLabel?: string;
}

export function StaticPageView({
  page,
  backUrl = '/',
  backLabel = 'Back to Home',
}: StaticPageViewProps) {
  const formattedDate = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 2026';

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16 space-y-10 font-sans">
      {/* Top Back Navigation */}
      <div className="space-y-4">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{backLabel}</span>
        </Link>

        {/* Header Hero Banner */}
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal &amp; Platform Policies</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {page.title}
          </h1>

          {page.excerpt && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              {page.excerpt}
            </p>
          )}

          <div className="pt-2 flex items-center gap-4 text-xs font-mono text-muted-foreground border-t border-border/40">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Last updated: {formattedDate}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Verified Policy</span>
            </span>
          </div>
        </div>
      </div>

      {/* Page Body */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
        <ClientMdxRenderer content={page.content} />
      </div>
    </div>
  );
}
