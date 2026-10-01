import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/public/article-card';
import { Layers, ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const formattedTitle = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const sampleArticles = [
    {
      id: '1',
      title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
      slug: 'designing-distributed-rate-limiter',
      excerpt:
        'A deep dive into sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.',
      difficulty: 'ADVANCED' as const,
      type: 'SYSTEM_DESIGN' as const,
      featured: true,
      readingTime: 12,
      viewsCount: 14200,
      publishedAt: new Date(),
      author: {
        id: 'a1',
        name: 'Alex Rivera',
        username: 'alexdev',
      },
      category: {
        id: 'c1',
        name: formattedTitle,
        slug,
      },
      technologies: [
        { id: 't1', name: 'Redis', slug: 'redis' },
        { id: 't2', name: 'NestJS', slug: 'nestjs' },
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-8 font-sans">
      <div className="space-y-3">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Categories
        </Link>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {formattedTitle}
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Comprehensive collection of architecture guides, case studies, and engineering breakdowns on {formattedTitle}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {sampleArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
