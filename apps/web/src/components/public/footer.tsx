'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { BrandLogo } from '@/components/common/brand-logo';
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
  ChevronUp,
  Globe,
  Lock,
  Zap,
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

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-border/60 bg-background text-foreground/90 font-sans relative overflow-hidden">
      {/* Background Decorative Ambient Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-16 space-y-10 md:space-y-12">
        {/* Top Feature: Engineering Dispatch Newsletter Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-5 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Weekly Technical Dispatch</span>
              </div>

              <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Distributed Systems Blueprints in Your Inbox
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                Weekly deep dives into consensus protocols, low-latency cache architectures, lock-free database migrations, and real-world benchmarks. Zero marketing fluff.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 100% Free
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 1-Click Unsubscribe
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" /> No Spam, Ever
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              {isSubscribed ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 sm:p-6 text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-foreground font-mono">You&apos;re on the Dispatch list!</p>
                  <p className="text-xs text-muted-foreground">
                    Watch your inbox every Thursday for new architecture case studies.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="architect@tech.io"
                        className="w-full rounded-xl sm:rounded-2xl border border-border bg-background/90 py-2.5 sm:py-3 pl-10 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-foreground text-background px-5 py-2.5 sm:py-3 text-xs font-bold font-mono hover:bg-foreground/90 transition-all disabled:opacity-50 shadow-md shrink-0 cursor-pointer hover:scale-[1.02]"
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
                  <p className="text-[11px] font-mono text-muted-foreground text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span>Join 25,000+ backend architects and systems engineers.</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Column Directory: 2-Columns on Mobile, 3-Columns on Tablet, 5-Columns on Desktop */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-5 pt-2">
          {/* Section 1: Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1 space-y-3 pb-2 lg:pb-0 border-b lg:border-b-0 border-border/40">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground group"
            >
              <BrandLogo variant="footer" size="sm" />
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm lg:max-w-none">
              Open engineering publications, systems architecture blueprints, and developer guides.
            </p>
          </div>

          {/* Section 2: Architecture Topics */}
          <div className="col-span-1 space-y-3 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Taxonomy</span>
            </span>
            <ul className="space-y-1.5 text-muted-foreground font-sans">
              <li>
                <Link href="/categories/system-design" className="hover:text-primary transition-colors block py-0.5">
                  System Design
                </Link>
              </li>
              <li>
                <Link href="/categories/backend-engineering" className="hover:text-primary transition-colors block py-0.5">
                  Backend
                </Link>
              </li>
              <li>
                <Link href="/categories/distributed-systems" className="hover:text-primary transition-colors block py-0.5">
                  Distributed
                </Link>
              </li>
              <li>
                <Link href="/categories/databases" className="hover:text-primary transition-colors block py-0.5">
                  Databases
                </Link>
              </li>
              <li>
                <Link href="/categories/apis" className="hover:text-primary transition-colors block py-0.5">
                  APIs
                </Link>
              </li>
              <li>
                <Link href="/categories/devops" className="hover:text-primary transition-colors block py-0.5">
                  DevOps
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-primary hover:underline font-mono text-[10px] sm:text-[11px] pt-1 inline-flex items-center gap-0.5 font-semibold">
                  <span>View all</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Technology Hubs */}
          <div className="col-span-1 space-y-3 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span>Infrastructure</span>
            </span>
            <ul className="space-y-1.5 text-muted-foreground font-sans">
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
                <Link href="/technologies" className="text-primary hover:underline font-mono text-[10px] sm:text-[11px] pt-1 inline-flex items-center gap-0.5 font-semibold">
                  <span>All stacks</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 4: Knowledge Hub */}
          <div className="col-span-1 space-y-3 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-primary" />
              <span>Knowledge Hub</span>
            </span>
            <ul className="space-y-1.5 text-muted-foreground font-sans">
              <li>
                <Link href="/case-studies" className="hover:text-primary transition-colors block py-0.5">
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
                  Submit Blueprint
                </Link>
              </li>
              <li>
                <Link href="/write-for-us" className="hover:text-primary transition-colors block py-0.5 font-medium text-foreground">
                  Author Guidelines
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" target="_blank" className="hover:text-amber-500 transition-colors block py-0.5 inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px]">
                  <Rss className="h-3 w-3 text-amber-500" />
                  <span>RSS Atom Feed</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 5: Platform & Legal */}
          <div className="col-span-1 space-y-3 text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>Platform &amp; Legal</span>
            </span>
            <ul className="space-y-1.5 text-muted-foreground font-sans">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors block py-0.5">
                  Reader Dashboard
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-primary transition-colors block py-0.5">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-primary transition-colors block py-0.5">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/content-policy" className="hover:text-primary transition-colors block py-0.5">
                  Content Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors block py-0.5 font-semibold text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-6 sm:pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3.5 gap-y-1.5 text-center md:text-left text-[11px]">
            <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
            <span className="hidden md:inline-block text-border">•</span>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span className="text-border">•</span>
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
            <span className="text-border">•</span>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <span className="text-border">•</span>
            <Link href="/content-policy" className="hover:text-foreground transition-colors">Content Policy</Link>
            <span className="text-border">•</span>
            <Link href="/cookie-policy" className="hover:text-foreground transition-colors">Cookies</Link>
            <span className="text-border">•</span>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>

          {/* Social Icons & Back to Top */}
          <div className="flex items-center space-x-2">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-xl border border-border/80 bg-card/80 hover:bg-muted hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors shadow-2xs"
              title="GitHub"
            >
              <GithubIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-xl border border-border/80 bg-card/80 hover:bg-muted hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors shadow-2xs"
              title="X / Twitter"
            >
              <TwitterIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-xl border border-border/80 bg-card/80 hover:bg-muted hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors shadow-2xs"
              title="LinkedIn"
            >
              <LinkedinIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/rss.xml"
              target="_blank"
              className="h-8 w-8 rounded-xl border border-border/80 bg-card/80 hover:bg-amber-500/10 hover:text-amber-500 flex items-center justify-center text-muted-foreground transition-colors shadow-2xs"
              title="RSS Atom Feed"
            >
              <Rss className="h-3.5 w-3.5" />
            </Link>

            {/* Scroll to Top button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="h-8 w-8 rounded-xl border border-border/80 bg-card/80 hover:bg-muted hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors shadow-2xs cursor-pointer ml-1"
              title="Back to Top"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
