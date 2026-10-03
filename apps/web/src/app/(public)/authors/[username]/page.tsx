import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/public/article-card';
import { User, Globe, BookOpen, Layers, ArrowLeft } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '@/components/public/brand-icons';
import { usersApi, articlesApi } from '@/lib/api-client';

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  let author: any = null;
  let articles: any[] = [];

  try {
    const [authorData, articlesData] = await Promise.all([
      usersApi.getPublicAuthor(decodedUsername).catch(() => null),
      articlesApi.getPublicFeed({ search: decodedUsername, limit: 20 }),
    ]);

    author = authorData;
    articles = articlesData?.items || [];
  } catch (err) {
    console.error(`Failed to fetch author ${decodedUsername}:`, err);
  }

  const authorName = author?.name || decodedUsername;
  const authorBio = author?.bio || 'Staff Infrastructure & Distributed Systems Engineer. Writes about consensus algorithms, high-throughput message brokers, and sub-millisecond database tuning.';
  const authorRole = author?.role || 'Staff Engineer & Core Contributor';
  const authorInitials = authorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-12 font-sans">
      <div className="space-y-4">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Articles
        </Link>

        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono font-bold text-2xl shrink-0">
              {authorInitials}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {authorName}
                </h1>
                <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/60">
                  @{decodedUsername}
                </span>
              </div>
              <p className="text-xs font-mono text-primary font-medium">{authorRole}</p>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {authorBio}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border/60 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground font-mono mr-1">Topics:</span>
              {['Distributed Systems', 'Redis', 'Kafka', 'NestJS', 'PostgreSQL', 'System Design'].map((topic) => (
                <span
                  key={topic}
                  className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground border border-border/50"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              {author?.github && (
                <a href={author.github.startsWith('http') ? author.github : `https://github.com/${author.github}`} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  <GithubIcon className="h-4 w-4" />
                </a>
              )}
              {author?.linkedin && (
                <a href={author.linkedin.startsWith('http') ? author.linkedin : `https://linkedin.com/in/${author.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              )}
              {author?.website && (
                <a href={author.website.startsWith('http') ? author.website : `https://${author.website}`} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">
            Authored Articles ({articles.length})
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">No published articles yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Articles by @{decodedUsername} will appear here once published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

