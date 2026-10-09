import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { technologiesApi } from '@/lib/api-client';
import { Cpu } from 'lucide-react';
import { TechnologiesExplorer } from '@/components/public/technologies-explorer';
import { BreadcrumbJsonLd, CollectionJsonLd } from '@/components/seo/json-ld';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Technologies & Infrastructure Hubs',
  description:
    'Deep dives, benchmarking, and real-world implementation case studies categorized by database, runtime, and message broker on NexusNation.',
  alternates: {
    canonical: '/technologies',
  },
  openGraph: {
    title: 'Technologies & Infrastructure Hubs — NexusNation',
    description:
      'Deep dives, benchmarking, and real-world implementation case studies categorized by database, runtime, and message broker.',
    url: 'https://nexusnation.in/technologies',
    siteName: 'NexusNation',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technologies & Infrastructure Hubs — NexusNation',
    description:
      'Deep dives, benchmarking, and real-world implementation case studies categorized by database, runtime, and message broker.',
    site: '@nexusnation',
    creator: '@nexusnation',
  },
};

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
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://nexusnation.in' },
          { name: 'Technologies', item: 'https://nexusnation.in/technologies' },
        ]}
      />
      <CollectionJsonLd
        name="Technologies & Infrastructure Hubs — NexusNation"
        description="Deep dives, benchmarking, and real-world implementation case studies categorized by database, runtime, and message broker on NexusNation."
        url="https://nexusnation.in/technologies"
      />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span>Infrastructure & Tooling</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Technologies &amp; Stacks
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Deep dives, benchmarking, and real-world implementation case studies categorized by database, runtime, and message broker.
        </p>
      </div>

      <TechnologiesExplorer technologies={technologies} />
    </div>
  );
}
