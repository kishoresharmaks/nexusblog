import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@nexus/config';
import { MdxRenderer } from '@/components/mdx';
import { TableOfContents } from '@/components/public/table-of-contents';
import { ReadingProgress } from '@/components/public/reading-progress';
import { ShareButtons } from '@/components/public/share-buttons';
import { ArticleActions } from '@/components/public/article-actions';
import { articlesApi } from '@/lib/api-client';
import {
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let article: any = null;
  try {
    article = await articlesApi.getBySlug(slug);
  } catch {
    article = null;
  }

  if (!article) {
    notFound();
  }

  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'MMMM dd, yyyy')
    : 'Recently';

  const isGuestPost = Boolean(article.isGuestPost || article.guestAuthorName);
  const authorName = article.guestAuthorName || article.author?.name || 'Guest Contributor';
  const authorUsername = article.guestAuthorName
    ? article.guestAuthorName.toLowerCase().replace(/\s+/g, '')
    : (article.author?.username || 'nexusdev');
  const authorBio = isGuestPost
    ? 'Guest technical contributor to NexusBlog engineering community.'
    : (article.author?.bio || 'Core technical contributor to NexusBlog.');
  const categoryName = article.category?.name || 'System Design';
  const categorySlug = article.category?.slug || 'system-design';
  const technologies = article.technologies || [];

  // Series Curriculum Context
  const series = article.series;
  let seriesArticles: any[] = [];
  let currentPart = 1;
  let prevArticle: any = null;
  let nextArticle: any = null;

  if (series && Array.isArray(series.articles) && series.articles.length > 0) {
    seriesArticles = series.articles;
    const currentIndex = seriesArticles.findIndex(
      (a) => a.id === article.id || a.slug === article.slug,
    );
    if (currentIndex !== -1) {
      currentPart = article.seriesOrder || currentIndex + 1;
      if (currentIndex > 0) {
        prevArticle = seriesArticles[currentIndex - 1];
      }
      if (currentIndex < seriesArticles.length - 1) {
        nextArticle = seriesArticles[currentIndex + 1];
      }
    } else {
      currentPart = article.seriesOrder || 1;
    }
  }

  return (
    <div className="relative pb-20 font-sans">
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        slug={article.slug}
        datePublished={article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString()}
        authorName={authorName}
        category={categoryName}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://nexusblog.dev' },
          { name: 'Articles', item: 'https://nexusblog.dev/articles' },
          ...(series
            ? [{ name: series.title, item: `https://nexusblog.dev/series/${series.slug}` }]
            : [{ name: categoryName, item: `https://nexusblog.dev/categories/${categorySlug}` }]),
          { name: article.title, item: `https://nexusblog.dev/articles/${article.slug}` },
        ]}
      />
      <ReadingProgress
        articleId={article.id}
        slug={article.slug}
        title={article.title}
        category={categoryName}
        readingTime={article.readingTime || 10}
        coverImage={article.coverImage}
      />

      {/* Hero / Header Section */}
      <div className="border-b border-border/40 bg-muted/5 py-10 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Back link & Breadcrumbs */}
          <div className="mb-6 flex items-center space-x-2 text-xs text-muted-foreground font-mono flex-wrap gap-y-1">
            <Link
              href="/articles"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Articles</span>
            </Link>
            <span>/</span>
            <Link
              href={`/categories/${categorySlug}`}
              className="hover:text-foreground transition-colors"
            >
              {categoryName}
            </Link>
            {series && (
              <>
                <span>/</span>
                <Link
                  href={`/series/${series.slug}`}
                  className="hover:text-primary transition-colors text-primary font-semibold"
                >
                  {series.title}
                </Link>
              </>
            )}
          </div>

          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 font-mono text-[11px] font-semibold">
                {categoryName}
              </span>
              <span className="rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 px-2 py-0.5 font-mono text-[10px] uppercase font-semibold">
                {article.difficulty}
              </span>
              {isGuestPost && (
                <span className="rounded border border-amber-500/40 bg-amber-500/10 text-amber-500 dark:text-amber-400 px-2 py-0.5 font-mono text-[10px] font-semibold">
                  Guest Post
                </span>
              )}
              {series && (
                <Link
                  href={`/series/${series.slug}`}
                  className="rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 font-mono text-[10px] font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <Layers className="h-3 w-3" />
                  <span>Part {currentPart} of {seriesArticles.length || 1} in Series</span>
                </Link>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>

            {/* Author & Meta Row */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/30 text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                <div className={`h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs ${
                  isGuestPost ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                }`}>
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{authorName}</span>
                    {isGuestPost && (
                      <span className="rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-mono font-semibold">
                        Guest Contributor
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">@{authorUsername}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {publishedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {article.readingTime || 10} min read
                </span>
              </div>
            </div>

            {/* Top Interactive Actions Bar (Like, Save, Share) */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/30">
              <ArticleActions
                articleId={article.id}
                initialLikes={article.likesCount || 0}
              />
              <ShareButtons
                title={article.title}
                url={`${siteConfig.url}/articles/${article.slug}`}
              />
            </div>
          </div>
        </div>
      </div>


      {/* 3-Column Reading Layout */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4">
              <TableOfContents content={article.content} />
            </div>
          </aside>

          {/* Center Column: Main Article MDX Content */}
          <main className="lg:col-span-6 min-w-0">
            {/* Series Track Context Header Banner */}
            {series && (
              <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                      <Layers className="h-3 w-3" /> Part {currentPart} of {seriesArticles.length || 1}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Technical Learning Track
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm sm:text-base leading-snug">
                    {series.title}
                  </h4>
                  {series.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {series.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center font-mono text-xs">
                  <Link
                    href={`/series/${series.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors text-xs font-mono font-semibold"
                  >
                    <span>Full Track Roadmap</span>
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                  </Link>
                </div>
              </div>
            )}

            {article.coverImage && (
              <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm max-h-[460px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.coverImage}
                  alt={article.title}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <MdxRenderer source={article.content} />

            {/* Bottom Actions Bar */}
            <div className="mt-12 pt-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
              <ArticleActions
                articleId={article.id}
                initialLikes={article.likesCount || 0}
              />
              <ShareButtons
                title={article.title}
                url={`${siteConfig.url}/articles/${article.slug}`}
              />
            </div>

            {/* Series Next / Previous Navigator Cards */}
            {series && (prevArticle || nextArticle) && (
              <div className="mt-10 rounded-2xl border border-border/80 bg-card/60 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="font-mono text-xs font-bold text-foreground">
                      Track Roadmap: {series.title}
                    </span>
                  </div>
                  <Link
                    href={`/series/${series.slug}`}
                    className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                  >
                    <span>All Chapters ({seriesArticles.length})</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prevArticle ? (
                    <Link
                      href={`/articles/${prevArticle.slug}`}
                      className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-background/60 hover:border-primary/50 hover:bg-background transition-all space-y-2"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Previous Chapter (Part {prevArticle.seriesOrder || currentPart - 1})</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {prevArticle.title}
                      </p>
                    </Link>
                  ) : (
                    <div className="p-4 rounded-xl border border-border/30 bg-muted/10 opacity-50 flex flex-col justify-center">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        ✦ First chapter in this series track
                      </span>
                    </div>
                  )}

                  {nextArticle ? (
                    <Link
                      href={`/articles/${nextArticle.slug}`}
                      className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-background/60 hover:border-primary/50 hover:bg-background transition-all space-y-2 sm:text-right"
                    >
                      <div className="flex items-center sm:justify-end gap-1 text-[11px] font-mono text-primary font-bold">
                        <span>Next Chapter (Part {nextArticle.seriesOrder || currentPart + 1})</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {nextArticle.title}
                      </p>
                    </Link>
                  ) : (
                    <div className="p-4 rounded-xl border border-border/30 bg-muted/10 opacity-50 flex flex-col justify-center sm:text-right">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        ★ You have reached the final chapter of this track!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Author Bio Box */}
            <div className="mt-10 rounded-xl border border-border/80 bg-card/60 p-6 space-y-3 font-sans">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{authorName}</h4>
                  <p className="text-xs text-muted-foreground font-mono">@{authorUsername}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {authorBio}
              </p>
            </div>
          </main>

          {/* Right Column: Article Utilities, Series Curriculum & Technologies */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            <div className="sticky top-20 space-y-6">
              {/* Series Track Curriculum Sidebar Widget */}
              {series && seriesArticles.length > 0 && (
                <div className="rounded-xl border border-border/80 bg-card/60 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      <span>Track Curriculum</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {currentPart}/{seriesArticles.length}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {seriesArticles.map((partArt: any, idx: number) => {
                      const isCurrent = partArt.slug === article.slug || partArt.id === article.id;
                      const partNum = partArt.seriesOrder || idx + 1;
                      return (
                        <Link
                          key={partArt.id || partArt.slug}
                          href={`/articles/${partArt.slug}`}
                          className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-all ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <span
                            className={`h-5 w-5 rounded font-mono text-[10px] flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'bg-primary-foreground/20 text-primary-foreground font-bold'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {partNum}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 leading-tight text-[11px]">{partArt.title}</p>
                            <span
                              className={`text-[9px] font-mono ${
                                isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              }`}
                            >
                              {partArt.readingTime || 5}m read
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-border/40">
                    <Link
                      href={`/series/${series.slug}`}
                      className="text-[11px] font-mono text-primary hover:underline flex items-center justify-center gap-1"
                    >
                      <span>View Full Series Page</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Technologies in this guide */}
              {technologies.length > 0 && (
                <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                    Technologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {technologies.map((tech: any) => (
                      <Link
                        key={tech.slug || tech.name}
                        href={`/technologies/${tech.slug || tech.name.toLowerCase()}`}
                        className="rounded bg-muted/60 px-2 py-1 font-mono text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        #{tech.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter CTA Box */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Weekly Architecture Dispatch
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Join 25,000+ engineers receiving system design deep dives every Tuesday.
                </p>
                <Link
                  href="/#newsletter"
                  className="inline-block w-full text-center rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors shadow"
                >
                  Subscribe
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
