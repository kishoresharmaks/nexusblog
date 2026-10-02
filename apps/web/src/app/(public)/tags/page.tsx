import React from 'react';
import Link from 'next/link';
import { Hash, ArrowRight } from 'lucide-react';
import { tagsApi } from '@/lib/api-client';

export default async function TagsIndexPage() {
  let tags: any[] = [];

  try {
    tags = await tagsApi.getAll();
  } catch (err) {
    console.error('Failed to fetch tags from API:', err);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 font-sans">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Hash className="h-3.5 w-3.5 text-primary" />
          <span>Taxonomy Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Explore by Tag
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Index of engineering concepts, architectural patterns, protocols, and technical keywords.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id || tag.slug}
            href={`/tags/${tag.slug}`}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-muted/40 transition-all font-mono text-xs"
          >
            <span className="text-muted-foreground group-hover:text-primary transition-colors">#</span>
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {tag.name}
            </span>
            {tag.articlesCount !== undefined && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-sans">
                {tag.articlesCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

