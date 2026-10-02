import React from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { seriesApi } from '@/lib/api-client';

export default async function SeriesIndexPage() {
  let seriesList: any[] = [];

  try {
    seriesList = await seriesApi.getAll();
  } catch (err) {
    console.error('Failed to fetch series from API:', err);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 font-sans">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>Curated Learning Tracks</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Technical Series
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Step-by-step engineering tracks designed to take you from foundational fundamentals to architecting production systems.
        </p>
      </div>

      {seriesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((series) => (
            <Link
              key={series.id}
              href={`/series/${series.slug}`}
              className="group rounded-xl border border-border/70 bg-card/60 p-6 hover:border-border hover:shadow-md hover:bg-card transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-md">
                    <BookOpen className="h-3.5 w-3.5" />
                    {series.articles?.length || series.articleCount || 0} Parts
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {series.difficulty || 'ADVANCED'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {series.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {series.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs font-mono text-primary">
                <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Start Track <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] text-muted-foreground font-sans">
                  {series.articles?.length || 0} available
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No technical series found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Curated engineering curricula will appear here once published.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-xs font-mono text-primary font-semibold hover:underline pt-2"
          >
            Browse all standalone articles →
          </Link>
        </div>
      )}
    </div>
  );
}

