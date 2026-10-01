import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/public/article-card';
import { User, Globe, BookOpen, Layers, ArrowLeft } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '@/components/public/brand-icons';

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { username } = await params;

  const author = {
    id: 'a1',
    name: 'Alex Rivera',
    username: username || 'alexdev',
    bio: 'Staff Infrastructure & Distributed Systems Engineer. Writes about consensus algorithms, high-throughput message brokers, and sub-millisecond database tuning.',
    avatar: '',
    role: 'Staff Engineer & Core Contributor',
    stats: {
      articlesCount: 12,
      seriesCount: 2,
      totalViews: '180K+',
    },
    socials: {
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      website: 'https://nexusblog.dev',
    },
    expertise: ['Distributed Systems', 'Redis', 'Kafka', 'NestJS', 'PostgreSQL', 'Go'],
  };

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
        id: author.id,
        name: author.name,
        username: author.username,
      },
      category: {
        id: 'c1',
        name: 'System Design',
        slug: 'system-design',
      },
      technologies: [
        { id: 't1', name: 'Redis', slug: 'redis' },
        { id: 't2', name: 'NestJS', slug: 'nestjs' },
      ],
    },
  ];

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
              {author.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {author.name}
                </h1>
                <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/60">
                  @{author.username}
                </span>
              </div>
              <p className="text-xs font-mono text-primary font-medium">{author.role}</p>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {author.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border/60 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground font-mono mr-1">Topics:</span>
              {author.expertise.map((topic) => (
                <span
                  key={topic}
                  className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground border border-border/50"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              {author.socials.github && (
                <a href={author.socials.github} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  <GithubIcon className="h-4 w-4" />
                </a>
              )}
              {author.socials.twitter && (
                <a href={author.socials.twitter} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  <TwitterIcon className="h-4 w-4" />
                </a>
              )}
              {author.socials.linkedin && (
                <a href={author.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              )}
              {author.socials.website && (
                <a href={author.socials.website} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
          Authored Articles ({sampleArticles.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
