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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/30 bg-muted/5">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Architecture Blueprints & Engineering Deep Dives
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Production-grade systems engineering.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              In-depth technical guides, distributed systems blueprints, benchmark studies, and real-world architectures written with code and interactive diagrams.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-md font-medium text-sm hover:bg-foreground/90 transition-colors shadow"
              >
                Explore Articles <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guest-post/submit"
                className="inline-flex items-center gap-2 border border-border bg-card/60 text-foreground px-5 py-2.5 rounded-md font-medium text-sm hover:bg-muted transition-colors"
              >
                Submit Guest Post <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Featured Case Studies
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

      {/* Architecture Pillars Grid */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl mb-8 space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Core Technical Categories
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore specialized knowledge hubs designed for backend leads, architects, and systems engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex items-center justify-between p-4 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-xs p-1.5">
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

      {/* Trending Technologies Hub */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span>Technology Hubs</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Deep Dives by Infrastructure
            </h2>
          </div>
          <Link
            href="/technologies"
            className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
          >
            All Tech <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {technologies.slice(0, 6).map((tech: any) => (
            <Link
              key={tech.slug}
              href={`/technologies/${tech.slug}`}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/70 bg-card/60 hover:bg-card hover:border-border hover:shadow transition-all text-center group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2 font-mono font-bold text-xs group-hover:scale-105 transition-transform p-2">
                <IconRenderer value={tech.logo} defaultIcon="Database" className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors font-mono">
                {tech.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
