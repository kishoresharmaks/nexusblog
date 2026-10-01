import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/public/article-card';
import { Cpu, ExternalLink, ArrowLeft, BookOpen } from 'lucide-react';

interface TechnologyPageProps {
  params: Promise<{ slug: string }>;
}

const TECH_DOCS: Record<string, string> = {
  redis: 'https://redis.io/docs/',
  kafka: 'https://kafka.apache.org/documentation/',
  mongodb: 'https://www.mongodb.com/docs/',
  postgresql: 'https://www.postgresql.org/docs/',
  docker: 'https://docs.docker.com/',
  kubernetes: 'https://kubernetes.io/docs/',
  nestjs: 'https://docs.nestjs.com/',
  'spring-boot': 'https://spring.io/projects/spring-boot',
  nextjs: 'https://nextjs.org/docs',
  clickhouse: 'https://clickhouse.com/docs',
  elasticsearch: 'https://www.elastic.co/guide/index.html',
};

export default async function TechnologyDetailPage({ params }: TechnologyPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  const formattedTitle = decodedSlug
    .split(/[-_ ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const docsUrl = TECH_DOCS[decodedSlug] || `https://google.com/search?q=${encodeURIComponent(formattedTitle + ' official documentation')}`;

  const sampleArticles = [
    {
      id: '1',
      title: `Scaling ${formattedTitle} in High-Throughput Production Environments`,
      slug: `scaling-${decodedSlug}-in-production`,
      excerpt: `Architectural best practices, connection pooling, memory optimization, and benchmarked failover strategies for ${formattedTitle} at scale.`,
      difficulty: 'ADVANCED' as const,
      type: 'DEEP_DIVE' as const,
      featured: true,
      readingTime: 14,
      viewsCount: 18200,
      publishedAt: new Date(),
      author: {
        id: 'a1',
        name: 'Alex Rivera',
        username: 'alexdev',
      },
      category: {
        id: 'c1',
        name: 'Backend Architecture',
        slug: 'backend',
      },
      technologies: [
        { id: 't1', name: formattedTitle, slug: decodedSlug },
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 font-sans">
      <div className="space-y-4">
        <Link
          href="/technologies"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Technologies
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span>Technology Stack</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
              {formattedTitle}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Curated architectural deep-dives, production performance benchmarks, and implementation guides.
            </p>
          </div>

          <div>
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-mono font-medium transition-all"
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>Official Docs</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Articles & Case Studies ({sampleArticles.length})
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
