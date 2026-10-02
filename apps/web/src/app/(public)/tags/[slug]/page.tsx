import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/public/article-card';
import { Hash, ArrowLeft, BookOpen } from 'lucide-react';
import { tagsApi, articlesApi } from '@/lib/api-client';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagDetailPage({ params }: TagPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const formattedTag = decodedSlug
    .split(/[-_ ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let tag: any = null;
  let articles: any[] = [];

  try {
    const [tagData, articlesData] = await Promise.all([
      tagsApi.getBySlug(decodedSlug).catch(() => null),
      articlesApi.getPublicFeed({ tagSlug: decodedSlug, limit: 20 }).catch(() => articlesApi.getPublicFeed({ search: decodedSlug, limit: 20 })),
    ]);

    tag = tagData;
    articles = articlesData?.items || [];
  } catch (err) {
    console.error(`Failed to fetch tag data for ${decodedSlug}:`, err);
  }

  const tagName = tag?.name || formattedTag;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 font-sans">
      <div className="space-y-4">
        <Link
          href="/tags"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Tags
        </Link>
        
        <div className="space-y-2 border-b border-border/60 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
            <Hash className="h-3.5 w-3.5 text-primary" />
            <span>Tag Focus</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
            #{decodedSlug}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Articles and engineering guides tagged with #{tagName}.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">
            Articles ({articles.length})
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">No articles tagged with #{decodedSlug} yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Check back soon as new technical deep-dives and blueprints are published weekly.
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1 text-xs font-mono text-primary font-semibold hover:underline pt-2"
            >
              Browse all articles →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

