'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import {
  Send,
  Rss,
  Sparkles,
  Mail,
  CheckCircle2,
  Loader2,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Layers,
  Cpu,
  Bookmark,
  Activity,
  FileCode2,
} from 'lucide-react';
import { toast } from 'sonner';
import { newsletterApi } from '@/lib/api-client';
import { GithubIcon, TwitterIcon, LinkedinIcon } from './brand-icons';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await newsletterApi.subscribe(trimmedEmail);
      setIsSubscribed(true);
      toast.success('Successfully subscribed to Engineering Dispatch!');
      setEmail('');
    } catch (err: any) {
      const msg = err.message || 'Failed to subscribe. Please try again.';
      if (msg.toLowerCase().includes('already')) {
        setIsSubscribed(true);
        toast.info('You are already subscribed to Engineering Dispatch!');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-border/50 bg-background text-foreground/80 font-sans relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Top Feature: Engineering Dispatch Newsletter Card */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 md:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Weekly Technical Dispatch</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                Distributed Systems Blueprints in Your Inbox
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                Weekly deep dives into consensus protocols, low-latency cache architectures, lock-free database migrations, and real-world benchmarks. Zero marketing fluff.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 100% Free
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 1-Click Unsubscribe
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No Spam, Ever
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              {isSubscribed ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-foreground font-mono">You&apos;re on the Dispatch list!</p>
                  <p className="text-xs text-muted-foreground">
                    Watch your inbox every Thursday for new architecture case studies.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="architect@tech.io"
                        className="w-full rounded-xl border border-border bg-background/90 py-2.5 pl-10 pr-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-xs font-semibold font-mono hover:bg-foreground/90 transition-all disabled:opacity-50 shadow shrink-0"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Subscribe Free</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground text-center sm:text-left">
                    Join 25,000+ backend architects and systems engineers.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main 5-Column Navigation Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 pt-4">
          {/* Column 1: Brand & Operational Status */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground group"
            >
              <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center font-mono font-bold text-xs group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-mono font-bold text-foreground">
                {siteConfig.name}
              </span>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Production-grade technical publishing platform & developer knowledge portal for distributed systems engineering.
            </p>

            {/* Live Operational Status */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>All Systems Operational</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                href="https://github.com"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>Star on GitHub</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Architecture Topics */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Taxonomy</span>
            </span>
            <ul className="space-y-2 text-muted-foreground font-sans">
              <li>
                <Link href="/categories/system-design" className="hover:text-primary transition-colors block py-0.5">
                  System Design
                </Link>
              </li>
              <li>
                <Link href="/categories/backend-engineering" className="hover:text-primary transition-colors block py-0.5">
                  Backend Engineering
                </Link>
              </li>
              <li>
                <Link href="/categories/distributed-systems" className="hover:text-primary transition-colors block py-0.5">
                  Distributed Systems
                </Link>
              </li>
              <li>
                <Link href="/categories/databases" className="hover:text-primary transition-colors block py-0.5">
                  Databases & Sharding
                </Link>
              </li>
              <li>
                <Link href="/categories/apis" className="hover:text-primary transition-colors block py-0.5">
                  APIs & Microservices
                </Link>
              </li>
              <li>
                <Link href="/categories/devops" className="hover:text-primary transition-colors block py-0.5">
                  DevOps & CI/CD
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-primary hover:underline font-mono text-[11px] pt-1 inline-flex items-center gap-1">
                  <span>View all categories</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Technology Hubs */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span>Infrastructure</span>
            </span>
            <ul className="space-y-2 text-muted-foreground font-sans">
              <li>
                <Link href="/technologies/redis" className="hover:text-primary transition-colors block py-0.5 font-mono text-[11px]">
                  #redis
                </Link>
              </li>
              <li>
                <Link href="/technologies/kafka" className="hover:text-primary transition-colors block py-0.5 font-mono text-[11px]">
                  #kafka
                </Link>
              </li>
              <li>
                <Link href="/technologies/postgresql" className="hover:text-primary transition-colors block py-0.5 font-mono text-[11px]">
                  #postgresql
                </Link>
              </li>
              <li>
                <Link href="/technologies/kubernetes" className="hover:text-primary transition-colors block py-0.5 font-mono text-[11px]">
                  #kubernetes
                </Link>
              </li>
              <li>
                <Link href="/technologies/docker" className="hover:text-primary transition-colors block py-0.5 font-mono text-[11px]">
                  #docker
                </Link>
              </li>
              <li>
                <Link href="/technologies/nestjs" className="hover:text-primary transition-colors block py-0.5 font-mono text-[11px]">
                  #nestjs
                </Link>
              </li>
              <li>
                <Link href="/technologies" className="text-primary hover:underline font-mono text-[11px] pt-1 inline-flex items-center gap-1">
                  <span>View all stacks</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Knowledge Hub */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-primary" />
              <span>Knowledge Hub</span>
            </span>
            <ul className="space-y-2 text-muted-foreground font-sans">
              <li>
                <Link href="/articles" className="hover:text-primary transition-colors block py-0.5">
                  All Case Studies
                </Link>
              </li>
              <li>
                <Link href="/series" className="hover:text-primary transition-colors block py-0.5">
                  Technical Series
                </Link>
              </li>
              <li>
                <Link href="/tags" className="hover:text-primary transition-colors block py-0.5">
                  Topic Tags Cloud
                </Link>
              </li>
              <li>
                <Link href="/guest-post/submit" className="hover:text-primary transition-colors block py-0.5">
                  Submit Guest Post
                </Link>
              </li>
              <li>
                <Link href="/write-for-us" className="hover:text-primary transition-colors block py-0.5">
                  Author Guidelines
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="hover:text-primary transition-colors block py-0.5 inline-flex items-center gap-1">
                  <Rss className="h-3 w-3 text-amber-500" />
                  <span>RSS Atom Feed</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Portal & Platform */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>Platform</span>
            </span>
            <ul className="space-y-2 text-muted-foreground font-sans">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors block py-0.5">
                  Reader Dashboard
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-primary transition-colors block py-0.5 font-mono text-[11px]">
                  Command Search ⌘K
                </Link>
              </li>
              <li>
                <Link href="/write-for-us" className="hover:text-primary transition-colors block py-0.5">
                  Write For Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors block py-0.5">
                  Sign In / Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors block py-0.5">
                  Create Free Account
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground/80 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Production Ready</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
            <span className="hidden sm:inline-block text-border">•</span>
            <p className="text-[11px] text-muted-foreground/80">
              Next.js 15 • NestJS • Tailwind CSS • MDX
            </p>
          </div>

          {/* Social Icons with Themed Round Containers */}
          <div className="flex items-center space-x-2">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-lg border border-border/80 bg-card/80 hover:bg-muted hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors shadow-2xs"
              title="GitHub"
            >
              <GithubIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-lg border border-border/80 bg-card/80 hover:bg-muted hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors shadow-2xs"
              title="X / Twitter"
            >
              <TwitterIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-lg border border-border/80 bg-card/80 hover:bg-muted hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors shadow-2xs"
              title="LinkedIn"
            >
              <LinkedinIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/rss.xml"
              target="_blank"
              className="h-8 w-8 rounded-lg border border-border/80 bg-card/80 hover:bg-amber-500/10 hover:text-amber-500 flex items-center justify-center text-muted-foreground transition-colors shadow-2xs"
              title="RSS Feed"
            >
              <Rss className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

