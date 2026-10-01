import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import {
  Layers,
  Cpu,
  Database,
  Cloud,
  Terminal,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 font-bold text-lg tracking-tight">
              <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                {siteConfig.name}
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-5 text-sm font-medium text-muted-foreground">
              <Link href="/articles" className="hover:text-foreground transition-colors">
                Articles
              </Link>
              <Link href="/categories" className="hover:text-foreground transition-colors">
                Categories
              </Link>
              <Link href="/technologies" className="hover:text-foreground transition-colors">
                Technologies
              </Link>
              <Link href="/series" className="hover:text-foreground transition-colors">
                Series
              </Link>
              <Link href="/write-for-us" className="hover:text-foreground transition-colors">
                Write for Us
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-foreground text-background hover:bg-foreground/90 px-3.5 py-1.5 rounded-md transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-28 border-b border-border/30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Engineering Deep Dives & System Design Case Studies
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Production-grade architecture for modern backend engineers.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                In-depth technical guides, distributed systems blueprints, benchmark studies, and real-world architectures written with code and interactive diagrams.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-md font-medium text-sm hover:bg-foreground/90 transition-colors shadow"
                >
                  Explore Articles <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/guest-post/submit"
                  className="inline-flex items-center gap-2 border border-border bg-card/50 text-foreground px-5 py-2.5 rounded-md font-medium text-sm hover:bg-muted transition-colors"
                >
                  Submit Article <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Focus Areas */}
        <section className="py-16 md:py-20 border-b border-border/30 bg-muted/10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Core Architecture Pillars</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Engineered for scalability, fault-tolerance, and low latency.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border border-border bg-card/60 hover:border-border/80 transition-colors">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Distributed Systems & Sharding</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Consensus algorithms, partitioned caches, Kafka event streaming, and distributed lock patterns.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-card/60 hover:border-border/80 transition-colors">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Databases & Query Optimization</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  PostgreSQL indexing strategies, MongoDB document schema design, and Redis high-throughput caching.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-card/60 hover:border-border/80 transition-colors">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Performance & Microservices</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  NestJS, Spring Boot, gRPC service fabrics, memory profiling, and sub-millisecond API optimizations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 {siteConfig.name}. Built with Next.js 15, NestJS, and MDX.</p>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/rss.xml" className="hover:text-foreground">
              RSS
            </Link>
            <Link href="/sitemap.xml" className="hover:text-foreground">
              Sitemap
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
