import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { ArticleCard } from '@/components/public/article-card';
import { articlesApi, categoriesApi, technologiesApi } from '@/lib/api-client';
import {
  Layers,
  Cpu,
  Database,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import { IconRenderer } from '@/components/common/icon-renderer';

export const revalidate = 60; // ISR cache for 60 seconds

export default async function HomePage() {
  // 1. Fetch featured & published articles from API
  let articles: any[] = [];
  try {
    const res = await articlesApi.getPublicFeed({ limit: 4 });
    if (res?.items?.length > 0) {
      articles = res.items;
    }
  } catch {
    articles = [];
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

  return (
    <div className="space-y-8 sm:space-y-12 pb-12 sm:pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-12 md:pt-14 md:pb-16 border-b border-border/30 bg-muted/5">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-3.5 sm:space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Architecture Blueprints &amp; Engineering Deep Dives
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Production-grade systems engineering.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              In-depth technical guides, distributed systems blueprints, benchmark studies, and real-world architectures written with code and interactive diagrams.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1.5 sm:pt-2">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 bg-foreground text-background px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm hover:bg-foreground/90 transition-colors shadow-xs"
              >
                Explore Articles <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guest-post/submit"
                className="inline-flex items-center gap-2 border border-border bg-card/60 text-foreground px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm hover:bg-muted transition-colors"
              >
                Submit Guest Post <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

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
          {articles.map((article, idx) => (
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
