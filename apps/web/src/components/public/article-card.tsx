import React from 'react';
import Link from 'next/link';
import { Article } from '@nexus/types';
import { Clock, Eye, Bookmark, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

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
  };
  technologies?: Array<{ id?: string; name: string; slug: string }>;
  tags?: Array<{ id?: string; name: string; slug: string }>;
}

interface ArticleCardProps {
  article: ArticleCardItem;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const difficultyColors = {
    BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    INTERMEDIATE: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    ADVANCED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    EXPERT: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  }[article.difficulty || 'INTERMEDIATE'];

  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'MMM dd, yyyy')
    : 'Recent';

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-5 sm:p-6 transition-all hover:border-border hover:shadow-md hover:bg-card/90 ${
        featured ? 'md:col-span-2 border-primary/30 bg-primary/5' : ''
      }`}
    >
      <div className="space-y-3">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {article.category && (
              <Link
                href={`/categories/${article.category.slug}`}
                className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
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
          </div>

          {article.featured && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-500 font-semibold">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
        </div>

        {/* Title & Excerpt */}
        <div>
          <Link href={`/articles/${article.slug}`}>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
              {article.title}
            </h3>
          </Link>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Tags / Technologies */}
        {article.technologies && article.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
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
      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          {article.author?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
              {article.author?.name?.charAt(0) || 'A'}
            </div>
          )}
          <span className="font-medium text-foreground truncate max-w-[120px]">
            {article.author?.name || 'Architect'}
          </span>
          <span>•</span>
          <span>{publishedDate}</span>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readingTime || 5}m
          </span>
          {typeof article.viewsCount === 'number' && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {article.viewsCount}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
