import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { technologiesApi } from '@/lib/api-client';
import { Cpu } from 'lucide-react';
import { TechnologiesExplorer } from '@/components/public/technologies-explorer';

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

      <TechnologiesExplorer technologies={technologies} />
    </div>
  );
}
