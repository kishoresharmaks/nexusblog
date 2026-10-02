import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { categoriesApi } from '@/lib/api-client';
import { Layers, ChevronRight, FileText } from 'lucide-react';
import { IconRenderer } from '@/components/common/icon-renderer';

export const revalidate = 60;

export default async function CategoriesPage() {
  let categories: any[] = [];
  try {
    const res = await categoriesApi.getAll();
    if (Array.isArray(res) && res.length > 0) {
      categories = res;
    }
  } catch {
    categories = siteConfig.categories.map((name, idx) => ({
      id: String(idx + 1),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: `Deep dives, case studies, and engineering guidelines focusing on ${name}.`,
      _count: { articles: idx < 4 ? 1 : 0 },
    }));
  }

  if (categories.length === 0) {
    categories = siteConfig.categories.map((name, idx) => ({
      id: String(idx + 1),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: `Deep dives, case studies, and engineering guidelines focusing on ${name}.`,
      _count: { articles: idx < 4 ? 1 : 0 },
    }));
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-8 font-sans">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>Taxonomy Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Architecture Categories
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Structured technical domains curated for backend developers, infrastructure engineers, and systems architects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat: any) => {
          const articleCount = cat._count?.articles ?? (cat.articlesCount || 0);
          return (
            <Link
              key={cat.slug}
              href={`/articles?category=${cat.slug}`}
              className="group rounded-2xl border border-border/80 bg-card p-6 hover:border-foreground/30 hover:shadow-lg hover:bg-card transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 text-primary group-hover:scale-105 transition-transform shrink-0">
                    <IconRenderer value={cat.image} defaultIcon="Layers" className="h-6 w-6 text-primary" />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                    <FileText className="h-3 w-3" /> {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {cat.description || `Deep dives, case studies, and engineering guidelines focusing on ${cat.name}.`}
                </p>
              </div>

              <div className="pt-2 text-xs font-mono text-primary font-medium flex items-center justify-between border-t border-border/30">
                <span>Explore category</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
