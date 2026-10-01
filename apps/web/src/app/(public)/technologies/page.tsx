import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { Cpu, Database, ChevronRight, ExternalLink } from 'lucide-react';

export default function TechnologiesPage() {
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
        {siteConfig.technologies.map((tech) => {
          const slug = tech.toLowerCase();
          return (
            <Link
              key={tech}
              href={`/technologies/${slug}`}
              className="group rounded-xl border border-border/70 bg-card/60 p-6 hover:border-border hover:shadow-md hover:bg-card transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">
                    <Database className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-mono">
                  {tech}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Production patterns, scaling recipes, and performance benchmarks for {tech}.
                </p>
              </div>

              <div className="pt-2 text-xs font-mono text-primary font-medium flex items-center gap-1">
                <span>View {tech} guides</span>
                <span>→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
