import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { Terminal, Send, Rss } from 'lucide-react';
import { GithubIcon, TwitterIcon } from './brand-icons';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background text-foreground/80 font-sans">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Newsletter */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2 font-mono font-bold text-lg text-foreground">
              <span>{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {siteConfig.description}. Deep dives, distributed blueprints, and real-world architectures written with code and interactive diagrams.
            </p>

            {/* Newsletter input */}
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Subscribe to Engineering Dispatch
              </span>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-2 flex max-w-md items-center space-x-2"
              >
                <input
                  type="email"
                  placeholder="architect@tech.io"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors shadow"
                >
                  <Send className="h-3 w-3" /> Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Col 2: Topics */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-foreground font-mono">
              Core Topics
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/categories/system-design" className="hover:text-foreground transition-colors">
                  System Design
                </Link>
              </li>
              <li>
                <Link href="/categories/distributed-systems" className="hover:text-foreground transition-colors">
                  Distributed Systems
                </Link>
              </li>
              <li>
                <Link href="/categories/databases" className="hover:text-foreground transition-colors">
                  Databases & Sharding
                </Link>
              </li>
              <li>
                <Link href="/categories/performance" className="hover:text-foreground transition-colors">
                  Performance & Profiling
                </Link>
              </li>
              <li>
                <Link href="/technologies/redis" className="hover:text-foreground transition-colors">
                  Redis Architecture
                </Link>
              </li>
              <li>
                <Link href="/technologies/kafka" className="hover:text-foreground transition-colors">
                  Kafka Event Streaming
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Utilities */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-foreground font-mono">
              Platform
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/articles" className="hover:text-foreground transition-colors">
                  All Articles
                </Link>
              </li>
              <li>
                <Link href="/series" className="hover:text-foreground transition-colors">
                  Technical Series
                </Link>
              </li>
              <li>
                <Link href="/write-for-us" className="hover:text-foreground transition-colors">
                  Write for Us / Guest Post
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About the Platform
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 {siteConfig.name}. Built with Next.js 15, NestJS, and MDX.</p>
          <div className="flex items-center space-x-4">
            <Link href="https://github.com" target="_blank" className="hover:text-foreground transition-colors">
              <GithubIcon className="h-4 w-4" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-foreground transition-colors">
              <TwitterIcon className="h-4 w-4" />
            </Link>
            <Link href="/rss.xml" className="hover:text-foreground transition-colors">
              <Rss className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
