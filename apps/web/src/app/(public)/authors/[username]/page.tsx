import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, ExternalLink, Globe, PenLine } from 'lucide-react';
import { normalizeMediaUrl, siteConfig } from '@nexus/config';
import { ArticleCard } from '@/components/public/article-card';
import { GithubIcon, LinkedinIcon } from '@/components/public/brand-icons';
import { AuthorProfileJsonLd } from '@/components/seo/json-ld';
import { articlesApi, usersApi } from '@/lib/api-client';

interface AuthorPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 12;

function getExternalUrl(value?: string | null, base?: string) {
  if (!value?.trim()) return null;

  try {
    const cleanValue = value.trim().replace(/^@/, '');
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(cleanValue)
      ? cleanValue
      : /^(www\.)?[\w-]+\.[\w.-]+(?:\/|$)/i.test(cleanValue)
        ? `https://${cleanValue}`
        : `${base || 'https://'}${cleanValue}`;
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function getAbsoluteUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    return new URL(value, siteConfig.url || 'https://nexusnation.in').toString();
  } catch {
    return undefined;
  }
}

const getAuthor = cache(async (username: string) => usersApi.getPublicAuthor(username));

export async function generateMetadata({ params, searchParams }: AuthorPageProps): Promise<Metadata> {
  const [{ username: rawUsername }, query] = await Promise.all([params, searchParams]);
  const username = decodeURIComponent(rawUsername);
  const author = await getAuthor(username).catch(() => null);
  if (!author) return { title: 'Author Not Found', robots: { index: false, follow: true } };

  const name = author.name || username;
  const base = (siteConfig.url || 'https://nexusnation.in').replace(/\/+$/, '');
  const path = `/authors/${encodeURIComponent(username)}`;
  const articleCount = Number(author.stats?.articlesCount || 0);
  const descriptionSource = author.bio?.trim().replace(/\s+/g, ' ') ||
    `Read ${articleCount} technical ${articleCount === 1 ? 'article' : 'articles'} by ${name}, covering system design, backend engineering, and software architecture.`;
  const description = descriptionSource.length > 160
    ? `${descriptionSource.slice(0, 157).trimEnd()}…`
    : descriptionSource;
  const page = Math.max(1, Number.parseInt(query?.page || '1', 10) || 1);
  const pagePath = page > 1 ? `${path}?page=${page}` : path;
  const pageCount = Math.max(1, Math.ceil(articleCount / PAGE_SIZE));
  const canonicalUrl = `${base}${path}`;
  const image = author.avatar ? normalizeMediaUrl(author.avatar) : null;

  return {
    title: { absolute: `Articles by ${name} | NexusNation` },
    description,
    authors: [{ name, url: canonicalUrl }],
    creator: name,
    alternates: { canonical: pagePath },
    robots: {
      index: articleCount > 0 && page <= pageCount,
      follow: true,
      'max-image-preview': 'large',
      googleBot: { index: articleCount > 0 && page <= pageCount, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
      type: 'profile',
      title: `Articles by ${name} | NexusNation`,
      description,
      url: `${base}${pagePath}`,
      siteName: siteConfig.name,
      locale: 'en_US',
      images: image ? [{ url: image, alt: `${name} author profile` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Articles by ${name} | NexusNation`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function AuthorProfilePage({ params, searchParams }: AuthorPageProps) {
  const [{ username: rawUsername }, query] = await Promise.all([params, searchParams]);
  const username = decodeURIComponent(rawUsername);
  const author = await getAuthor(username);

  if (!author) notFound();

  const requestedPage = Number.parseInt(query.page || '1', 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const feed = await articlesApi.getPublicFeed({ authorId: author.id, page, limit: PAGE_SIZE });
  const articles = feed.items || [];
  const total = Number(author.stats?.articlesCount ?? feed.total ?? articles.length);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const initials = (author.name || username)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase();
  const joinedYear = author.createdAt ? new Date(author.createdAt).getFullYear() : null;
  const topics = Array.from(new Set([
    ...articles.flatMap((article: any) => article.technologies?.map((technology: any) => technology.name) || []),
    ...articles.map((article: any) => article.category?.name).filter(Boolean),
  ])).slice(0, 8);
  const avatarUrl = author.avatar ? normalizeMediaUrl(author.avatar) : null;
  const websiteUrl = getExternalUrl(author.website);
  const githubUrl = getExternalUrl(author.github, 'https://github.com/');
  const linkedinUrl = getExternalUrl(author.linkedin, 'https://www.linkedin.com/in/');
  const profileUrl = `${(siteConfig.url || 'https://nexusnation.in').replace(/\/+$/, '')}/authors/${encodeURIComponent(username)}`;
  const currentPageUrl = page > 1 ? `${profileUrl}?page=${page}` : profileUrl;
  const authorDescription = author.bio || `Technical articles by ${author.name || username} on system design, backend engineering, and software architecture.`;
  const socialUrls = [websiteUrl, githubUrl, linkedinUrl].filter((url): url is string => Boolean(url));

  return (
    <div className="font-sans">
      <AuthorProfileJsonLd
        name={author.name || username}
        username={username}
        description={authorDescription}
        url={profileUrl}
        pageUrl={currentPageUrl}
        image={getAbsoluteUrl(avatarUrl)}
        sameAs={socialUrls}
      />
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/articles" className="transition-colors hover:text-foreground">Articles</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-foreground">{author.name || username}</span>
          </nav>

          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-8">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/25 bg-primary/10 text-2xl font-bold text-primary sm:h-32 sm:w-32">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={author.name || username} fill sizes="128px" unoptimized className="object-cover" />
              ) : initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">NexusBlog author</p>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">{author.name || username}</h1>
                <span className="font-mono text-sm text-muted-foreground">@{username}</span>
              </div>
              {author.bio ? (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{author.bio}</p>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Contributor to the NexusBlog engineering library.</p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{total} {total === 1 ? 'published article' : 'published articles'}</span>
                {joinedYear && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />Joined NexusBlog {joinedYear}</span>}
                <div className="flex items-center gap-3">
                  {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer" aria-label="Personal website" className="rounded-full p-1.5 transition-colors hover:bg-muted hover:text-foreground"><Globe className="h-4 w-4" /></a>}
                  {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="rounded-full p-1.5 transition-colors hover:bg-muted hover:text-foreground"><GithubIcon className="h-4 w-4" /></a>}
                  {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="rounded-full p-1.5 transition-colors hover:bg-muted hover:text-foreground"><LinkedinIcon className="h-4 w-4" /></a>}
                </div>
              </div>
            </div>

            <Link
              href="/write-for-us"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <PenLine className="h-4 w-4" /> Write for NexusBlog
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:py-14">
        <section aria-labelledby="author-articles-heading" className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border/50 pb-4">
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">From the author</p>
              <h2 id="author-articles-heading" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Published articles</h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{total} total</span>
          </div>

          {articles.length ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {articles.map((article: any) => <ArticleCard key={article.id} article={article} />)}
            </div>
          ) : (
            <div className="border-y border-border/50 py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">No published articles yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Published work by this author will appear here.</p>
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Author article pages" className="mt-8 flex items-center justify-between border-t border-border/50 pt-5">
              {page > 1 ? (
                <Link href={`/authors/${encodeURIComponent(username)}?page=${page - 1}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Newer articles
                </Link>
              ) : <span />}
              <span className="font-mono text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              {page < totalPages ? (
                <Link href={`/authors/${encodeURIComponent(username)}?page=${page + 1}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Older articles <ArrowRight className="h-4 w-4" />
                </Link>
              ) : <span />}
            </nav>
          )}
        </section>

        <aside className="space-y-8">
          <section className="border-t-2 border-primary pt-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">Topics covered</h2>
            {topics.length ? (
              <ul className="mt-4 divide-y divide-border/50">
                {topics.map((topic) => (
                  <li key={topic} className="py-2.5 text-sm text-muted-foreground">{topic}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Topics will appear as this author publishes more work.</p>
            )}
          </section>

          <section className="border-t border-border/60 pt-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">Contribute to NexusBlog</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Share practical engineering knowledge with readers building real systems.</p>
            <Link href="/write-for-us" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Submission details <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
