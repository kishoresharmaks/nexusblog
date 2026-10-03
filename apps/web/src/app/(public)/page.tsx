import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { ArticleCard } from '@/components/public/article-card';
import { CategoryArticlesSection } from '@/components/public/category-articles-section';
import { DailyArchitectureDigest } from '@/components/public/daily-architecture-digest';
import { articlesApi, categoriesApi, technologiesApi } from '@/lib/api-client';
import {
  Layers,
  Cpu,
  Database,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Terminal,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Code2,
} from 'lucide-react';

import { IconRenderer } from '@/components/common/icon-renderer';
import { HomeTopAd, HomeFeedAd } from '@/components/ads/in-article-ad';

export const revalidate = 60; // ISR cache for 60 seconds

export default async function HomePage() {
  // 1. Fetch featured articles for the top featured section & latest articles for category explorer
  let featuredArticles: any[] = [];
  let allArticles: any[] = [];

  try {
    const [featRes, allRes] = await Promise.all([
      articlesApi.getPublicFeed({ limit: 6, filter: 'featured' }).catch(() => null),
      articlesApi.getPublicFeed({ limit: 50 }).catch(() => null),
    ]);

    if (allRes && Array.isArray(allRes.items) && allRes.items.length > 0) {
      allArticles = allRes.items;
    }

    if (featRes && Array.isArray(featRes.items) && featRes.items.length > 0) {
      featuredArticles = featRes.items;
    } else {
      featuredArticles = allArticles.slice(0, 6);
    }
  } catch {
    featuredArticles = [];
    allArticles = [];
  }

  // 2. Fetch Categories from API with fallback
  let categories: any[] = [];
  try {
    const catsRes = await categoriesApi.getAll();
    if (Array.isArray(catsRes) && catsRes.length > 0) {
      categories = catsRes;
    }
  } catch {
    categories = siteConfig.categories.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }

  if (categories.length === 0) {
    categories = siteConfig.categories.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }

  // 3. Fetch Technologies with fallback
  let technologies: any[] = [];
  try {
    const techRes = await technologiesApi.getAll();
    if (Array.isArray(techRes) && techRes.length > 0) {
      technologies = techRes;
    }
  } catch {
    technologies = siteConfig.technologies.map((name) => ({
      name,
      slug: name.toLowerCase(),
    }));
  }

  if (technologies.length === 0) {
    technologies = siteConfig.technologies.map((name) => ({
      name,
      slug: name.toLowerCase(),
    }));
  }

  // Combine featured and latest for the Daily Digest Card
  const digestArticles = featuredArticles.length > 0 ? featuredArticles : allArticles;

  return (
    <div className="space-y-10 sm:space-y-14 pb-12 sm:pb-16">
      {/* High-Tech Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 md:pt-18 md:pb-20 border-b border-border/40 bg-gradient-to-b from-card/30 via-background to-background">
        {/* Ambient Lighting & Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[360px] bg-gradient-to-tr from-primary/15 via-emerald-500/10 to-sky-500/15 blur-3xl opacity-60 pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] text-foreground/[0.03] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:36px_36px] pointer-events-none" />

        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-3.5 sm:space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-mono text-foreground shadow-2xs max-w-full">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20 shrink-0" />
                <span className="font-semibold text-foreground shrink-0">NexusBlog</span>
                <span className="text-muted-foreground/60 shrink-0">•</span>
                <span className="text-muted-foreground font-normal truncate hidden sm:inline">System Design &amp; Technology Portal</span>
                <span className="text-muted-foreground font-normal truncate sm:hidden">Systems &amp; Architecture</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.18] sm:leading-[1.12]">
                Master Real-World{' '}
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-primary/70 bg-clip-text text-transparent">
                  System Design &amp; Tech Stacks.
                </span>
              </h1>

              <p className="text-xs sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Practical, code-backed engineering deep dives, distributed database internals, low-latency benchmarks, and battle-tested architectures. Zero fluff — built by developers for developers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-row items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <Link
                  href="/articles"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-foreground text-background px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm hover:bg-foreground/90 transition-all duration-200 shadow-xs hover:shadow-md group text-center whitespace-nowrap"
                >
                  <span>Explore Blueprints</span>
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
                </Link>
                <Link
                  href="/technologies"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 border border-border/80 bg-card/80 backdrop-blur-md text-foreground px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm hover:bg-muted hover:border-border transition-all duration-200 text-center whitespace-nowrap"
                >
                  <Cpu className="h-4 w-4 text-primary shrink-0" />
                  <span>Technology Hubs</span>
                </Link>
              </div>

              {/* Engineering Guarantees / Quality Highlights */}
              <div className="pt-2 sm:pt-3 border-t border-border/40 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 100% Code-Backed
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Activity className="h-3.5 w-3.5 text-sky-500 shrink-0" /> Latency Benchmarked
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" /> Peer-Reviewed
                </span>
              </div>
            </div>

            {/* Right Dynamic Admin-Fed Daily Blueprint Spotlight */}
            <div className="lg:col-span-6">
              <DailyArchitectureDigest articles={digestArticles} />
            </div>
          </div>
        </div>
      </section>

      {/* Top Home Leaderboard / Sponsor Ad Placement */}
      <HomeTopAd />

      {/* Featured Articles Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Featured Engineering Blueprints
            </h2>
          </div>
          <Link
            href="/articles"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
          >
            View all articles <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredArticles.map((article, idx) => (
            <ArticleCard
              key={article.id}
              article={{
                ...article,
                category: article.category || { name: 'System Design', slug: 'system-design' },
                author: article.author || { name: 'Alex Rivera', username: 'alexdev' },
              }}
              featured={idx === 0}
            />
          ))}
        </div>
      </section>

      {/* Blogs by Categories Section (Sorted by Latest) */}
      <CategoryArticlesSection
        categories={categories}
        articles={allArticles}
      />

      {/* Mid-Feed In-Between Banner Ad Placement */}
      <HomeFeedAd />

      {/* Architecture Topics Grid */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border/80 bg-card/40 p-5 sm:p-8 md:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="max-w-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                <Layers className="h-3.5 w-3.5" />
                <span>Domain Taxonomy</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Browse by Architecture Topic
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Core domain taxonomy covering system design, backend internals, databases, consensus, and cloud operations.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-xs font-mono text-primary hover:underline self-start sm:self-auto flex items-center gap-1 shrink-0"
            >
              <span>All Topics</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-xs p-1.5">
                    <IconRenderer value={cat.image} defaultIcon="Layers" className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stacks Hub */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span>Infrastructure Index</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Technology Stacks &amp; Hubs
            </h2>
          </div>
          <Link
            href="/technologies"
            className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
          >
            <span>All Stacks</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {technologies.slice(0, 6).map((tech: any) => (
            <Link
              key={tech.slug}
              href={`/technologies/${tech.slug}`}
              className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 text-center group"
            >
              <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 p-2.5">
                <IconRenderer value={tech.logo || tech.slug || tech.name} defaultIcon="Cpu" className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors font-mono">
                {tech.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Transparency & Contributor Banner */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Editorial Transparency &amp; Standards</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Rigorous, Peer-Reviewed Engineering Content
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Every publication on NexusBlog adheres to our 5-pillar technical standards: original research, reproducible code samples, concrete latency benchmarks, clear architecture diagrams, and transparent trade-off analysis.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
                <Link href="/content-policy" className="hover:text-primary underline underline-offset-4">
                  Editorial Standards &rarr;
                </Link>
                <span>&bull;</span>
                <Link href="/author-guidelines" className="hover:text-primary underline underline-offset-4">
                  Author Guidelines &rarr;
                </Link>
                <span>&bull;</span>
                <Link href="/disclaimer" className="hover:text-primary underline underline-offset-4">
                  Technical Disclaimer &rarr;
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Link
                href="/write-for-us"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-xs font-bold font-mono hover:opacity-90 transition-all shadow-sm"
              >
                <span>Write for NexusBlog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guest-post/submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-muted px-5 py-3 text-xs font-bold font-mono text-foreground transition-all"
              >
                <span>Open Blueprint Editor</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
