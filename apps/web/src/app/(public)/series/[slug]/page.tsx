import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Layers, ArrowLeft, BookOpen, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { seriesApi } from '@/lib/api-client';

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  let series: any = null;

  try {
    series = await seriesApi.getBySlug(decodedSlug);
  } catch (err) {
    console.error(`Failed to fetch series for ${decodedSlug}:`, err);
  }

  if (!series) {
    notFound();
  }

  const articles = series.articles || [];
  const totalReadingTime = articles.reduce((acc: number, curr: any) => acc + (curr.readingTime || 10), 0);
  const authorName = series.author?.name || 'Nexus Engineering';
  const authorRole = series.author?.role || 'Staff Infrastructure Engineer';
  const authorInitials = authorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14 space-y-12 font-sans">
      <div className="space-y-4">
        <Link
          href="/series"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Series
        </Link>

        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-mono font-semibold text-primary">
              <Layers className="h-3.5 w-3.5" />
              Technical Track
            </span>
            <span className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-mono text-muted-foreground">
              {series.difficulty || 'ADVANCED'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground ml-auto">
              <Clock className="h-3.5 w-3.5" /> ~{totalReadingTime} mins total
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {series.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {series.description}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border/40 text-xs text-muted-foreground">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono">
              {authorInitials}
            </div>
            <div>
              <p className="font-semibold text-foreground">{authorName}</p>
              <p className="text-[11px] text-muted-foreground">{authorRole}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
            Track Curriculum ({articles.length} Articles)
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((item: any, idx: number) => (
              <Link
                key={item.id || item.slug}
                href={`/articles/${item.slug}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/60 p-5 hover:border-border hover:bg-card hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-muted text-foreground border border-border flex items-center justify-center font-mono font-bold text-xs group-hover:border-primary group-hover:text-primary transition-colors">
                    {String(item.seriesOrder || idx + 1).padStart(2, '0')}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0 text-xs font-mono text-muted-foreground">
                  <span>{item.readingTime || 12} min</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">Curriculum in preparation</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              The articles for this series are currently being written.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

