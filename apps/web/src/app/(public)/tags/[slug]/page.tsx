import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/public/article-card';
import { Hash, ArrowLeft } from 'lucide-react';

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

  const sampleArticles = [
    {
      id: '1',
      title: `Production Patterns & Practices for ${formattedTag}`,
      slug: `production-patterns-${decodedSlug}`,
      excerpt: `An engineering guide covering architecture, resilience, monitoring, and debugging ${formattedTag} in cloud deployments.`,
      difficulty: 'INTERMEDIATE' as const,
      type: 'TUTORIAL' as const,
      featured: false,
      readingTime: 11,
      viewsCount: 9400,
      publishedAt: new Date(),
      author: {
        id: 'a1',
        name: 'Alex Rivera',
        username: 'alexdev',
      },
      category: {
        id: 'c1',
        name: 'System Design',
        slug: 'system-design',
      },
      tags: [
        { id: 'tg1', name: formattedTag, slug: decodedSlug },
      ],
    },
  ];

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
            Articles and engineering guides tagged with #{decodedSlug}.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Articles ({sampleArticles.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
