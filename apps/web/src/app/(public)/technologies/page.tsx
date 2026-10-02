import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { technologiesApi } from '@/lib/api-client';
import { Cpu, ChevronRight } from 'lucide-react';
import { IconRenderer } from '@/components/common/icon-renderer';

export const revalidate = 60;

export default async function TechnologiesPage() {
  let technologies: any[] = [];
  try {
    const res = await technologiesApi.getAll();
    if (Array.isArray(res) && res.length > 0) {
      technologies = res;
    }
  } catch {
    technologies = siteConfig.technologies.map((tech) => ({
      name: tech,
      slug: tech.toLowerCase(),
      description: `Production patterns, scaling recipes, and performance benchmarks for ${tech}.`,
    }));
  }

  if (technologies.length === 0) {
    technologies = siteConfig.technologies.map((tech) => ({
      name: tech,
      slug: tech.toLowerCase(),
      description: `Production patterns, scaling recipes, and performance benchmarks for ${tech}.`,
    }));
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-8 font-sans">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span>Infrastructure & Tooling</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Technologies & Stacks
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Deep dives, benchmarking, and real-world implementation case studies categorized by database, runtime, and message broker.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {technologies.map((tech: any) => (
          <Link
            key={tech.slug}
            href={`/articles?technology=${tech.slug}`}
            className="group rounded-2xl border border-border/80 bg-card p-6 hover:border-foreground/30 hover:shadow-lg hover:bg-card transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center p-2.5 group-hover:scale-110 transition-transform shrink-0">
                  <IconRenderer value={tech.logo || tech.slug || tech.name} defaultIcon="Cpu" className="h-7 w-7" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-mono">
                {tech.name}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {tech.description || `Production patterns, scaling recipes, and performance benchmarks for ${tech.name}.`}
              </p>
            </div>

            <div className="pt-2 text-xs font-mono text-primary font-medium flex items-center justify-between border-t border-border/30">
              <span>View {tech.name} guides</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
