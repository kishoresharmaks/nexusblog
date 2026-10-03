'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { normalizeMediaUrl } from '@nexus/config';
import { IconRenderer } from '@/components/common/icon-renderer';
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Layers,
  Cpu,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';

export interface DigestArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage?: string | null;
  thumbnail?: string | null;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  type?: string;
  featured?: boolean;
  readingTime?: number;
  viewsCount?: number;
  likesCount?: number;
  publishedAt?: string;
  createdAt?: string;
  author?: {
    id?: string;
    name?: string;
    username?: string;
    avatar?: string | null;
  };
  category?: {
    id?: string;
    name?: string;
    slug?: string;
    image?: string | null;
  };
  technologies?: Array<{ name: string; slug: string }>;
  tags?: Array<{ name: string; slug: string }>;
}

interface DailyArchitectureDigestProps {
  articles: DigestArticle[];
}

export function DailyArchitectureDigest({ articles }: DailyArchitectureDigestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!articles || articles.length === 0) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/70 p-6 text-center space-y-3">
        <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm font-semibold text-foreground">No published blueprint for today yet.</p>
        <p className="text-xs text-muted-foreground">Check back soon as new engineering deep dives are published.</p>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, articles.length - 1);
  const article = articles[safeIndex];

  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'MMMM dd, yyyy')
    : format(new Date(), 'MMMM dd, yyyy');

  const todayFormatted = format(new Date(), 'MMM dd, yyyy');

  const rawImage = !imageError && (article.coverImage || article.thumbnail) ? (article.coverImage || article.thumbnail) : null;
  const imageSrc = rawImage ? normalizeMediaUrl(rawImage) : null;

  const difficultyColors = {
    BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    INTERMEDIATE: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    ADVANCED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    EXPERT: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  }[article.difficulty || 'INTERMEDIATE'];

  const authorName = article.author?.name || 'Nexus Engineering Team';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/articles/${article.slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrev = () => {
    setImageError(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : articles.length - 1));
  };

  const handleNext = () => {
    setImageError(false);
    setCurrentIndex((prev) => (prev < articles.length - 1 ? prev + 1 : 0));
  };

  // Generate clean key takeaways from the article excerpt / content
  const getKeyTakeaways = () => {
    if (!article.excerpt) {
      return [
        'Production-tested architecture pattern with low-latency guarantees.',
        'Deterministic benchmarks and trade-off comparison.',
        'Runnable implementation guidelines and production deployment checklist.',
      ];
    }
    const sentences = article.excerpt.split('.').filter((s) => s.trim().length > 10);
    if (sentences.length >= 2) {
      return sentences.slice(0, 3).map((s) => s.trim());
    }
    return [
      article.excerpt,
      'Architectural trade-off analysis and zero-downtime deployment patterns.',
      'Reproducible code blueprint validated against high concurrency benchmarks.',
    ];
  };

  return (
    <>
      {/* Main Dynamic Daily Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl p-5 sm:p-6 space-y-4 overflow-hidden group hover:border-primary/40 transition-all duration-300">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Bar: Today's Edition & Multi-Article Pager */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-semibold text-primary whitespace-nowrap shrink-0">
              <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
              <span>Today&apos;s Edition</span>
              <span className="text-muted-foreground/60 hidden xs:inline sm:inline">&bull;</span>
              <span className="text-muted-foreground hidden xs:inline sm:inline">{todayFormatted}</span>
            </span>
            {article.featured && (
              <span className="hidden sm:inline-block rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono text-amber-400 font-bold whitespace-nowrap">
                EDITOR&apos;S PICK
              </span>
            )}
          </div>

          {/* Navigation between today's releases */}
          {articles.length > 1 && (
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              <span className="text-[10px] font-mono text-muted-foreground mr-0.5">
                {safeIndex + 1}/{articles.length}
              </span>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous edition"
                className="h-6 w-6 rounded-lg border border-border/70 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next edition"
                className="h-6 w-6 rounded-lg border border-border/70 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Visual Cover Image & Category Badges */}
        <div className="relative rounded-xl overflow-hidden border border-border/70 bg-muted/40 aspect-[16/9] sm:aspect-[16/7] group/img">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={article.title}
              crossOrigin="anonymous"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-card via-muted/40 to-primary/10 text-center space-y-2">
              <div className="p-3 rounded-xl bg-card border border-border text-primary shadow-xs">
                <IconRenderer value={article.category?.image} defaultIcon="Layers" className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-mono font-bold text-foreground">
                {article.category?.name || 'Architecture Blueprint'}
              </span>
            </div>
          )}

          {/* Badges Overlay on Image */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {article.category && (
              <span className="rounded-md bg-background/90 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-bold text-foreground border border-border/60 shadow-xs">
                {article.category.name}
              </span>
            )}
            {article.difficulty && (
              <span className={`rounded-md backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider border shadow-xs ${difficultyColors}`}>
                {article.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* 3. Title & Abstract Excerpt */}
        <div className="space-y-2">
          <Link href={`/articles/${article.slug}`}>
            <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors leading-snug line-clamp-2">
              {article.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        </div>

        {/* 4. Tech Tags */}
        {article.technologies && article.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {article.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech.slug}
                className="rounded-md bg-muted/60 border border-border/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                #{tech.name}
              </span>
            ))}
          </div>
        )}

        {/* 5. Author, Metrics & Action Buttons */}
        <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Author info */}
          <div className="flex items-center space-x-2 min-w-0">
            {article.author?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={normalizeMediaUrl(article.author.avatar)}
                alt={authorName}
                className="h-6 w-6 rounded-full object-cover shrink-0 border border-border"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="leading-none truncate">
              <span className="font-semibold text-xs text-foreground block truncate max-w-[130px] sm:max-w-[150px]">
                {authorName}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-2.5 w-2.5" /> {article.readingTime || 6} min read
              </span>
            </div>
          </div>

          {/* Interactive Actions */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto shrink-0">
            {/* Quick Preview Button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-[11px] sm:text-xs font-mono font-medium transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Quick Preview</span>
            </button>

            {/* Read Blueprint Primary CTA */}
            <Link
              href={`/articles/${article.slug}`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-[11px] sm:text-xs font-mono font-bold transition-all shadow-xs group/read whitespace-nowrap"
            >
              <span>Read Blueprint</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover/read:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Quick-Preview Interactive Drawer / Slide-Over Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-md animate-backdrop-in transition-opacity"
            onClick={() => setIsPreviewOpen(false)}
          />

          {/* Drawer Dialog Container */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl p-4 sm:p-8 space-y-5 sm:space-y-6 z-10 animate-fade-in-scale">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Blueprint Executive Summary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-8 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Share</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Article Headline & Metadata */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {article.category && (
                  <span className="rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 font-mono text-[11px] font-bold">
                    {article.category.name}
                  </span>
                )}
                {article.difficulty && (
                  <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider border ${difficultyColors}`}>
                    {article.difficulty}
                  </span>
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  • {publishedDate}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
                {article.title}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            </div>

            {/* Key Architectural Takeaways */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Key Architectural Takeaways</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                {getKeyTakeaways().map((takeaway, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Author Profile Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20 text-xs font-mono">
              <div className="flex items-center gap-3">
                {article.author?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={normalizeMediaUrl(article.author.avatar)}
                    alt={authorName}
                    className="h-9 w-9 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="font-bold text-foreground block text-sm">
                    {authorName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Author &bull; Production Architecture Reviewer
                  </span>
                </div>
              </div>

              <span className="text-muted-foreground font-mono text-[11px]">
                {article.readingTime || 6} min deep dive
              </span>
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-mono transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <Link
                href={`/articles/${article.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:opacity-90 transition-all shadow-md"
              >
                <span>Read Full Article &amp; Code</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
