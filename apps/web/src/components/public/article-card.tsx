'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Article } from '@nexus/types';
import { Clock, Eye, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { IconRenderer } from '@/components/common/icon-renderer';

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

  const imageSrc = !imageError && (article.coverImage || article.thumbnail) ? (article.coverImage || article.thumbnail) : null;

  const isGuest = Boolean(article.isGuestPost || article.guestAuthorName);
  const authorDisplayName = article.guestAuthorName || article.author?.name || 'Architect';

  return (
    <article
      className={`group relative rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-200 hover:border-foreground/30 hover:shadow-lg ${
        featured
          ? 'md:col-span-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5'
          : 'flex flex-col justify-between'
      }`}
    >
      <div
        className={
          featured
            ? 'flex flex-col-reverse md:flex-row items-stretch justify-between gap-5 sm:gap-6'
            : 'flex flex-row items-start sm:items-stretch justify-between gap-3.5 sm:gap-4 flex-1'
        }
      >
        {/* Left Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            {/* Top Meta Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {article.category && (
                  <Link
                    href={`/categories/${article.category.slug}`}
                    className="rounded-md bg-muted/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    {article.category.name}
                  </Link>
                )}
                {article.difficulty && (
                  <span
                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider font-semibold ${difficultyColors}`}
                  >
                    {article.difficulty}
                  </span>
                )}
                {isGuest && (
                  <span className="rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                    Guest Post
                  </span>
                )}
              </div>

              {article.featured && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-amber-500 font-semibold shrink-0">
                  <Sparkles className="h-3 w-3" /> Featured
                </span>
              )}
            </div>

            {/* Title & Excerpt */}
            <div>
              <Link href={`/articles/${article.slug}`}>
                <h3
                  className={`font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug ${
                    featured ? 'text-xl sm:text-2xl md:text-3xl' : 'text-sm sm:text-base md:text-lg line-clamp-2'
                  }`}
                >
                  {article.title}
                </h3>
              </Link>
              <p
                className={`mt-1.5 text-muted-foreground leading-relaxed ${
                  featured ? 'text-xs sm:text-sm line-clamp-3' : 'text-xs sm:text-sm line-clamp-2'
                }`}
              >
                {article.excerpt}
              </p>
            </div>

            {/* Tags / Technologies */}
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

          {/* Bottom Author & Stats Row */}
          <div className="pt-3.5 mt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2 min-w-0">
              {article.author?.avatar && !isGuest ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.author.avatar}
                  alt={authorDisplayName}
                  className="h-5 w-5 rounded-full object-cover shrink-0"
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
                {authorDisplayName}
              </span>
              {isGuest && (
                <span className="hidden sm:inline-block rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1 py-0.2 text-[9px] font-mono font-semibold shrink-0">
                  Guest
                </span>
              )}
              <span>•</span>
              <span className="shrink-0">{publishedDate}</span>
            </div>

            <div className="flex items-center space-x-3 font-mono text-[11px] shrink-0">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.readingTime || 5}m
              </span>
              {typeof article.viewsCount === 'number' && (
                <span className="hidden sm:flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {article.viewsCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Image Area */}
        <Link
          href={`/articles/${article.slug}`}
          className={`shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/30 relative transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-sm ${
            featured
              ? 'w-full md:w-72 lg:w-88 h-48 sm:h-52 md:h-auto min-h-[180px] self-stretch'
              : 'w-24 h-24 sm:w-36 md:w-40 lg:w-44 sm:h-auto sm:min-h-[130px] self-start sm:self-stretch'
          }`}
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={article.title || 'Article cover'}
              crossOrigin="anonymous"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full min-h-[96px] sm:min-h-[120px] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-muted/30 to-muted/80 p-3 text-center space-y-1.5">
              <div className="p-2 rounded-lg bg-card/80 border border-border/80 shadow-xs text-primary flex items-center justify-center">
                <IconRenderer value={article.category?.image} defaultIcon="Layers" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-wider text-muted-foreground font-semibold line-clamp-1">
                {article.category?.name || 'Technical Deep Dive'}
              </span>
            </div>
          )}
        </Link>
      </div>
    </article>
  );
}
