import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@nexus/config';
import { ArticleCard } from '@/components/public/article-card';
import { Cpu, ExternalLink, ArrowLeft, BookOpen } from 'lucide-react';
import { technologiesApi, articlesApi } from '@/lib/api-client';
import { IconRenderer } from '@/components/common/icon-renderer';

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

export async function generateMetadata({ params }: TechnologyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  let technology: any = null;
  try {
    technology = await technologiesApi.getBySlug(decodedSlug);
  } catch {
    technology = null;
  }

  const techName = technology?.name || decodedSlug.split(/[-_ ]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const description = technology?.description || `Engineering benchmarks, architecture patterns, and production deep dives using ${techName}.`;

  return {
    title: `${techName} Stack Architecture & Blueprints`,
    description,
    openGraph: {
      title: `${techName} Architecture Stack | NexusBlog`,
      description,
      url: `/technologies/${decodedSlug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(techName)}&category=INFRASTRUCTURE%20STACK`,
          width: 1200,
          height: 630,
          alt: techName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${techName} Stack | NexusBlog`,
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(techName)}&category=INFRASTRUCTURE%20STACK`,
          width: 1200,
          height: 630,
          alt: techName,
        },
      ],
    },
  };
}

export default async function TechnologyDetailPage({ params }: TechnologyPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  const formattedTitle = decodedSlug
    .split(/[-_ ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const docsUrl = TECH_DOCS[decodedSlug] || `https://google.com/search?q=${encodeURIComponent(formattedTitle + ' official documentation')}`;

  let technology: any = null;
  let articles: any[] = [];

  try {
    const [techData, articlesData] = await Promise.all([
      technologiesApi.getBySlug(decodedSlug).catch(() => null),
      articlesApi.getPublicFeed({ technologySlug: decodedSlug, limit: 20 }),
    ]);

    technology = techData;
    articles = articlesData?.items || [];
  } catch (err) {
    console.error(`Failed to fetch technology data for ${decodedSlug}:`, err);
  }

  const techName = technology?.name || formattedTitle;
  const techDescription = technology?.description || `Curated architectural deep-dives, production performance benchmarks, and implementation guides for ${techName}.`;

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
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center p-3 shrink-0 shadow-xs">
              <IconRenderer value={technology?.logo || decodedSlug || techName} defaultIcon="Cpu" className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span>Technology Stack</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {techName}
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {techDescription}
              </p>
            </div>
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
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">
            Articles & Case Studies ({articles.length})
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
            <p className="text-sm font-semibold text-foreground">No articles tagged with {techName} yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Our engineering team is preparing new implementation guides. Check back soon!
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

