'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@nexus/types';
import { normalizeMediaUrl } from '@nexus/config';
import { Clock, Eye, Star } from 'lucide-react';
import { format } from 'date-fns';
import { IconRenderer } from '@/components/common/icon-renderer';

const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxODE4MWIiLz48L3N2Zz4=';

export interface ArticleCardItem extends Partial<Omit<Article, 'author' | 'category' | 'technologies' | 'tags'>> {
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
  technologies?: Array<{ id?: string; name: string; slug: string; logo?: string | null }>;
  tags?: Array<{ id?: string; name: string; slug: string }>;
}

interface ArticleCardProps {
  article: ArticleCardItem;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);

  const difficultyColors = {
    BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    INTERMEDIATE: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    ADVANCED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    EXPERT: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  }[article.difficulty || 'INTERMEDIATE'];

  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'MMM dd, yyyy')
    : 'Recent';

  const rawImage = !imageError && (article.coverImage || article.thumbnail) ? (article.coverImage || article.thumbnail) : null;
  const imageSrc = rawImage ? normalizeMediaUrl(rawImage) : null;

  const isGuest = Boolean(article.isGuestPost || article.guestAuthorName);
  const authorDisplayName = article.guestAuthorName || article.author?.name || 'Architect';

  const getEditorialProvenance = () => {
    if (isGuest) {
      return {
        label: 'Guest Blueprint',
        color: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30',
      };
    }
    const type = (article.type || '').toUpperCase();
    if (type === 'BENCHMARK') {
      return {
        label: 'Original Benchmark',
        color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30',
      };
    }
    if (type === 'CASE_STUDY') {
      return {
        label: 'Case Study',
        color: 'bg-primary/10 text-primary border-primary/20',
      };
    }
    if (type === 'DEEP_DIVE') {
      return {
        label: 'Deep Dive Research',
        color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      };
    }
    return {
      label: 'Staff Explainer',
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    };
  };

  const provenance = getEditorialProvenance();

  return (
    <article
      className={`group relative rounded-2xl border bg-card p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
        featured
          ? 'border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 hover:border-primary/60'
          : 'border-border/80 hover:border-foreground/30'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-4 flex-1">
        {/* Left Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            {/* Top Meta Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {article.category && (
                  <Link
                    href={`/categories/${article.category.slug}`}
                    className="rounded-md bg-muted/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {article.category.name}
                  </Link>
                )}
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap ${provenance.color}`}
                >
                  {provenance.label}
                </span>
                {article.difficulty && (
                  <span
                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap ${difficultyColors}`}
                  >
                    {article.difficulty}
                  </span>
                )}
              </div>

              {article.featured && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-amber-500 font-semibold shrink-0">
                  <Star className="h-3 w-3 fill-amber-500/20" /> Featured
                </span>
              )}
            </div>

            {/* Mobile-only Full-Width Image (Rendered only on mobile screens < md) */}
            <Link
              href={`/articles/${article.slug}`}
              className="block md:hidden relative w-full aspect-[16/9] sm:aspect-[16/8] rounded-xl overflow-hidden border border-border/70 bg-muted/30 group/img transition-all duration-300 group-hover:border-primary/40"
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={article.title || 'Article cover'}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL={DEFAULT_BLUR_DATA_URL}
                  unoptimized={true}
                  className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-card via-muted/30 to-primary/10 p-4 text-center space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-card border border-border/80 shadow-xs text-primary flex items-center justify-center">
                    <IconRenderer value={article.category?.image} defaultIcon="Layers" className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {article.category?.name || 'Architecture Blueprint'}
                  </span>
                </div>
              )}
            </Link>

            {/* Title & Abstract Excerpt */}
            <div className="space-y-1.5">
              <Link href={`/articles/${article.slug}`}>
                <h3 className="font-bold tracking-tight text-foreground text-base sm:text-lg group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
            </div>

            {/* Tech Tags */}
            {article.technologies && article.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {article.technologies.slice(0, 3).map((tech) => (
                  <Link
                    key={tech.slug}
                    href={`/technologies/${tech.slug}`}
                    className="rounded bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    #{tech.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Author & Stats Footer */}
          <div className="pt-3.5 mt-auto border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2 min-w-0">
              {article.author?.avatar && !isGuest ? (
                <Image
                  src={normalizeMediaUrl(article.author.avatar)}
                  alt={authorDisplayName}
                  width={20}
                  height={20}
                  unoptimized={true}
                  className="h-5 w-5 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div
                  className={`h-5 w-5 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 ${
                    isGuest ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                  }`}
                >
                  {authorDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-foreground truncate max-w-[100px] sm:max-w-[130px]">
                {article.author?.username && !isGuest ? (
                  <Link href={`/authors/${encodeURIComponent(article.author.username)}`} className="hover:text-primary transition-colors">
                    {authorDisplayName}
                  </Link>
                ) : authorDisplayName}
              </span>
              {isGuest && (
                <span className="rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1 py-0.2 text-[9px] font-mono font-semibold shrink-0">
                  Guest
                </span>
              )}
              <span>•</span>
              <span className="shrink-0 font-mono text-[11px]" suppressHydrationWarning>
                {publishedDate}
              </span>
            </div>

            <div className="flex items-center space-x-3 font-mono text-[11px] tabular-nums shrink-0">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.readingTime || 5}m
              </span>
              {typeof article.viewsCount === 'number' && (
                <span className="hidden sm:flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {article.viewsCount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop/Laptop Right Side Image Area (Hidden on mobile < md, visible on md+) */}
        <Link
          href={`/articles/${article.slug}`}
          className="hidden md:block shrink-0 w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-48 xl:h-48 rounded-2xl overflow-hidden border border-border/70 bg-muted/30 relative transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md self-center md:self-stretch"
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={article.title || 'Article cover'}
              fill
              sizes="(max-width: 1200px) 200px, 250px"
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_DATA_URL}
              unoptimized={true}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-card via-muted/30 to-primary/10 p-3 text-center space-y-1.5">
              <div className="p-2 rounded-lg bg-card border border-border/80 shadow-xs text-primary flex items-center justify-center">
                <IconRenderer value={article.category?.image} defaultIcon="Layers" className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-mono font-bold text-muted-foreground line-clamp-1">
                {article.category?.name || 'Blueprint'}
              </span>
            </div>
          )}
        </Link>
      </div>
    </article>
  );
}
