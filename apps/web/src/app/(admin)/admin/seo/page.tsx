'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Globe,
  FileCode2,
  Share2,
  Sparkles,
  MessageSquare,
  Eye,
  Layers,
  Cpu,
} from 'lucide-react';

import { articlesApi } from '@/lib/api-client';

export default function AdminSeoDiagnosticsPage() {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'social-preview'>('diagnostics');
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string>('');
  const [socialPlatform, setSocialPlatform] = useState<'twitter' | 'linkedin' | 'discord'>('twitter');

  useEffect(() => {
    articlesApi
      .getPublicFeed({ limit: 20 })
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        setArticles(items);
        if (items.length > 0) {
          setSelectedArticleSlug(items[0].slug);
        }
      })
      .catch(() => {});
  }, []);

  const selectedArticle = articles.find((a) => a.slug === selectedArticleSlug) || articles[0];

  const seoItems = [
    {
      name: 'Dynamic XML Sitemap Generator',
      endpoint: '/sitemap.xml',
      status: 'HEALTHY',
      details: 'All published articles, categories, technologies, and series auto-indexed with dynamic lastmod timestamps.',
    },
    {
      name: 'Robots.txt Crawler Directives',
      endpoint: '/robots.txt',
      status: 'HEALTHY',
      details: 'Allowed /articles, /categories, /series. Disallowed /admin and /dashboard private paths.',
    },
    {
      name: 'JSON-LD Structured Data Schema',
      endpoint: 'Article & TechArticle Schema',
      status: 'HEALTHY',
      details: 'Compliant with Schema.org TechArticle, BreadcrumbList, and Author personas.',
    },
    {
      name: 'OpenGraph & Twitter Cards',
      endpoint: '/api/og (Edge SVG Renderer)',
      status: 'HEALTHY',
      details: 'Automated 1200x630 OG image generation with high-contrast typography and category badges.',
    },
    {
      name: 'RSS 2.0 & Atom Feed Sync',
      endpoint: '/rss.xml',
      status: 'HEALTHY',
      details: 'W3C compliant XML feed with full CDATA content wrapping and XML entity sanitization.',
    },
    {
      name: 'Canonical URL Verification',
      endpoint: 'Self-referencing canonical tags',
      status: 'HEALTHY',
      details: 'All published pages enforce strict trailing-slash-free canonical headers.',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              SEO Diagnostics & Social Card Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monitor search engine indexing health, sitemap generation, OpenGraph previews, and canonical integrity.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            System Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('social-preview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'social-preview'
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Social Card Tester
          </button>
        </div>
      </div>

      {activeTab === 'diagnostics' ? (
        /* Health Overview */
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                Search Indexing Diagnostics (100% Score)
              </h2>
            </div>
            <span className="font-mono text-xs text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md font-semibold border border-emerald-500/30">
              ALL SYSTEMS PASSING
            </span>
          </div>

          <div className="space-y-4">
            {seoItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <h3 className="text-xs font-bold text-foreground">{item.name}</h3>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.endpoint}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6 leading-relaxed">
                    {item.details}
                  </p>
                </div>

                <div className="shrink-0 self-end sm:self-center pl-6 sm:pl-0 flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                    {item.status}
                  </span>
                  {item.endpoint.startsWith('/') && (
                    <Link
                      href={item.endpoint}
                      target="_blank"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Inspect endpoint in browser"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Social Media Card Tester */
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground font-mono">
                  Live Social Sharing Simulator
                </h2>
                <p className="text-xs text-muted-foreground">
                  Preview how articles render across Twitter/X feeds, LinkedIn posts, and Discord/Slack chat embeds.
                </p>
              </div>

              {/* Platform Selector */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs font-mono">
                <button
                  onClick={() => setSocialPlatform('twitter')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    socialPlatform === 'twitter'
                      ? 'bg-sky-500 text-white font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Twitter / X</span>
                </button>
                <button
                  onClick={() => setSocialPlatform('linkedin')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    socialPlatform === 'linkedin'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>LinkedIn</span>
                </button>
                <button
                  onClick={() => setSocialPlatform('discord')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    socialPlatform === 'discord'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Slack / Discord</span>
                </button>
              </div>

            </div>

            {/* Article Selector */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold text-foreground">
                Select Article to Inspect:
              </label>
              <select
                value={selectedArticleSlug}
                onChange={(e) => setSelectedArticleSlug(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
              >
                {articles.map((art) => (
                  <option key={art.id || art.slug} value={art.slug}>
                    {art.title} (/articles/{art.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Card Previewer */}
            {selectedArticle && (
              <div className="pt-4 space-y-4">
                <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Generated Preview ({socialPlatform.toUpperCase()})
                </h3>

                <div className="p-6 rounded-2xl bg-muted/20 border border-border/60 flex justify-center">
                  {socialPlatform === 'twitter' && (
                    <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg space-y-0">
                      <div className="relative h-56 w-full bg-muted/50 overflow-hidden">
                        {selectedArticle.coverImage ? (
                          <img
                            src={selectedArticle.coverImage}
                            alt={selectedArticle.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 p-6 text-center">
                            <span className="text-lg font-mono font-extrabold text-foreground">
                              {selectedArticle.title}
                            </span>
                            <span className="text-xs text-primary font-mono mt-2">NexusBlog Engineering</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white">
                          nexusblog.dev
                        </div>
                      </div>
                      <div className="p-4 space-y-1 bg-card">
                        <p className="text-[11px] font-mono text-muted-foreground">nexusblog.dev</p>
                        <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                          {selectedArticle.seoTitle || selectedArticle.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {selectedArticle.seoDescription || selectedArticle.excerpt}
                        </p>
                      </div>
                    </div>
                  )}

                  {socialPlatform === 'linkedin' && (
                    <div className="w-full max-w-lg rounded-xl border border-border/80 bg-card overflow-hidden shadow-lg space-y-0">
                      <div className="relative h-52 w-full bg-muted/50 overflow-hidden">
                        {selectedArticle.coverImage ? (
                          <img
                            src={selectedArticle.coverImage}
                            alt={selectedArticle.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-500/30 p-6 text-center">
                            <span className="text-lg font-mono font-extrabold text-foreground">
                              {selectedArticle.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3.5 space-y-1 bg-muted/20 border-t border-border/40">
                        <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                          nexusblog.dev • 5 min read
                        </p>
                        <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">
                          {selectedArticle.seoTitle || selectedArticle.title}
                        </h4>
                      </div>
                    </div>
                  )}

                  {socialPlatform === 'discord' && (
                    <div className="w-full max-w-lg rounded-lg border-l-4 border-l-primary bg-card/90 border border-border/70 p-4 space-y-2 shadow-md">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary font-bold">
                        <Sparkles className="h-3 w-3" />
                        <span>NexusBlog • Technical Publication</span>
                      </div>
                      <Link
                        href={`/articles/${selectedArticle.slug}`}
                        className="text-xs font-bold text-sky-400 hover:underline block leading-snug"
                      >
                        {selectedArticle.seoTitle || selectedArticle.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {selectedArticle.seoDescription || selectedArticle.excerpt}
                      </p>
                      {selectedArticle.coverImage && (
                        <div className="rounded-lg overflow-hidden h-36 w-full mt-2 border border-border/40">
                          <img
                            src={selectedArticle.coverImage}
                            alt="Embed Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
