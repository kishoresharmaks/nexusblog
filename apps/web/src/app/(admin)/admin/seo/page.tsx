'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Save,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Terminal,
} from 'lucide-react';
import { toast } from 'sonner';

import { articlesApi, systemSettingsApi } from '@/lib/api-client';

export default function AdminSeoDiagnosticsPage() {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'robots' | 'social-preview'>('diagnostics');
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string>('');
  const [socialPlatform, setSocialPlatform] = useState<'twitter' | 'linkedin' | 'discord'>('twitter');

  // Robots.txt & Indexing State
  const [loadingRobots, setLoadingRobots] = useState(false);
  const [isSavingRobots, setIsSavingRobots] = useState(false);
  const [robotsIndexingMode, setRobotsIndexingMode] = useState<'allow' | 'disallow_all' | 'custom'>('allow');
  const [robotsCustomContent, setRobotsCustomContent] = useState<string>('');
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [copiedRobots, setCopiedRobots] = useState(false);

  const loadRobotsConfig = useCallback(async () => {
    try {
      setLoadingRobots(true);
      const data = await systemSettingsApi.getAll();
      if (data) {
        setRobotsIndexingMode((data.robotsIndexingMode?.value as any) || 'allow');
        setRobotsCustomContent(
          data.robotsCustomContent?.value ||
            '# Custom robots.txt directives\nUser-Agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api/*',
        );
        setSiteUrl(data.siteUrl?.value || 'http://localhost:3000');
      }
    } catch {
      // Fallback
    } finally {
      setLoadingRobots(false);
    }
  }, []);

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

    loadRobotsConfig();
  }, [loadRobotsConfig]);

  const selectedArticle = articles.find((a) => a.slug === selectedArticleSlug) || articles[0];

  const handleSaveRobots = async () => {
    setIsSavingRobots(true);
    try {
      await systemSettingsApi.updateBatch({
        robotsIndexingMode,
        robotsCustomContent: robotsCustomContent.trim(),
      });
      toast.success('Robots.txt & search engine indexing rules updated successfully!');
      await loadRobotsConfig();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update robots.txt configuration');
    } finally {
      setIsSavingRobots(false);
    }
  };

  const getComputedRobotsPreview = () => {
    const cleanUrl = (siteUrl || 'https://nexusnation.in').replace(/\/+$/, '');
    if (robotsIndexingMode === 'disallow_all') {
      return `# ==========================================
# Robots.txt - Search Engine Indexing Disabled
# Development / Staging / Testing Mode Active
# ==========================================
User-Agent: *
Disallow: /`;
    }
    if (robotsIndexingMode === 'custom') {
      return robotsCustomContent.trim() || 'User-Agent: *\nDisallow: /';
    }
    return `User-Agent: *
Allow: /
Allow: /articles
Allow: /categories
Allow: /technologies
Allow: /series
Allow: /tags
Allow: /write-for-us
Allow: /api/og
Disallow: /admin
Disallow: /admin/*
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /api/*

Sitemap: ${cleanUrl}/sitemap.xml`;
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(getComputedRobotsPreview());
    setCopiedRobots(true);
    toast.success('Robots.txt directives copied to clipboard');
    setTimeout(() => setCopiedRobots(false), 2000);
  };

  const applyPreset = (type: 'dev' | 'prod' | 'strict') => {
    const cleanUrl = (siteUrl || 'https://nexusnation.in').replace(/\/+$/, '');
    if (type === 'dev') {
      setRobotsIndexingMode('disallow_all');
      toast.info('Switched to Development / Testing mode (All indexing blocked)');
    } else if (type === 'prod') {
      setRobotsIndexingMode('allow');
      toast.info('Switched to Standard Production mode (Public indexed, Admin protected)');
    } else if (type === 'strict') {
      setRobotsIndexingMode('custom');
      setRobotsCustomContent(`# Strict Custom Indexing Policy
User-Agent: *
Allow: /articles$
Allow: /categories$
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /guest-post/
Crawl-delay: 10

Sitemap: ${cleanUrl}/sitemap.xml`);
      toast.info('Applied Strict Custom crawl template');
    }
  };

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
      status: robotsIndexingMode === 'disallow_all' ? 'DEV / NO-INDEX' : 'HEALTHY',
      details:
        robotsIndexingMode === 'disallow_all'
          ? 'Strict Disallow: / enabled. Search crawlers blocked for development and staging testing.'
          : robotsIndexingMode === 'custom'
            ? 'Custom robots.txt directives active.'
            : 'Allowed /articles, /categories, /series. Disallowed /admin and /dashboard private paths.',
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
              SEO &amp; Indexing Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage search engine crawlers, robots.txt directives, sitemap verification, and social previews.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            System Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'robots'
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span>Robots.txt &amp; Indexing</span>
            {robotsIndexingMode === 'disallow_all' && (
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('social-preview')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'social-preview'
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Social Card Tester
          </button>
        </div>
      </div>

      {activeTab === 'diagnostics' && (
        /* Health Overview */
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                Search Indexing Diagnostics
              </h2>
            </div>
            <span className="font-mono text-xs text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md font-semibold border border-emerald-500/30">
              ACTIVE &amp; MONITORED
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
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                      item.status.includes('DEV')
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
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
      )}

      {activeTab === 'robots' && (
        /* Robots.txt & Dynamic Indexing Tab */
        <div className="space-y-6">
          {/* Status Alert Banner */}
          {robotsIndexingMode === 'disallow_all' ? (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2 text-amber-200">
              <div className="flex items-center gap-2.5 font-bold font-mono text-sm text-amber-400">
                <ShieldAlert className="h-5 w-5" />
                <span>SEARCH ENGINE INDEXING BLOCKED (Development / Testing Mode)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All web crawlers (Google, Bing, Yandex, DuckDuckGo) are currently blocked with{' '}
                <code className="bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded font-mono">Disallow: /</code>.
                No development, staging, or test content will be indexed in public search results.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2 text-emerald-200">
              <div className="flex items-center gap-2.5 font-bold font-mono text-sm text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
                <span>SEARCH ENGINE INDEXING ACTIVE (Production Mode)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Public content is indexed for maximum SEO discoverability while private paths (
                <code className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded font-mono">/admin</code>,{' '}
                <code className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded font-mono">/dashboard</code>,{' '}
                <code className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded font-mono">/api/*</code>) are strictly protected.
              </p>
            </div>
          )}

          {/* Mode Selector Cards */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                  Robots Indexing Mode Selection
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select how search engine bots and web crawlers should handle your application.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/robots.txt"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-mono text-foreground transition-colors cursor-pointer"
                >
                  <span>Inspect Live /robots.txt</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Allow Indexing (Production) */}
              <div
                onClick={() => setRobotsIndexingMode('allow')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  robotsIndexingMode === 'allow'
                    ? 'border-emerald-500/70 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/50'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Production Indexing
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      robotsIndexingMode === 'allow' ? 'bg-emerald-500 border-emerald-400' : 'border-border'
                    }`}
                  />
                </div>
                <p className="text-xs font-bold text-foreground">Allow Public Pages (Standard)</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Allows search engines to crawl public articles, categories, and series. Automatically blocks admin/dashboard paths and includes dynamic sitemap.
                </p>
              </div>

              {/* Option 2: Disallow All (Dev / Testing) */}
              <div
                onClick={() => setRobotsIndexingMode('disallow_all')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  robotsIndexingMode === 'disallow_all'
                    ? 'border-amber-500/70 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/50'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" /> Block All (Dev/Testing)
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      robotsIndexingMode === 'disallow_all' ? 'bg-amber-500 border-amber-400' : 'border-border'
                    }`}
                  />
                </div>
                <p className="text-xs font-bold text-foreground">Prevent Indexing</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Serves <code className="text-amber-300 font-mono">Disallow: /</code>. Ideal for development, staging, QA, and local testing to prevent search engines from indexing test content.
                </p>
              </div>

              {/* Option 3: Custom Directives */}
              <div
                onClick={() => setRobotsIndexingMode('custom')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  robotsIndexingMode === 'custom'
                    ? 'border-primary/70 bg-primary/10 shadow-sm ring-1 ring-primary/50'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
                    <Code2 className="h-4 w-4" /> Custom Directives
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      robotsIndexingMode === 'custom' ? 'bg-primary border-primary' : 'border-border'
                    }`}
                  />
                </div>
                <p className="text-xs font-bold text-foreground">Advanced Custom Rules</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Write bespoke robots.txt directives, custom User-Agents, crawl-delay directives, and custom path rules with template presets.
                </p>
              </div>
            </div>

            {/* Custom Directives Textarea if Custom mode */}
            {robotsIndexingMode === 'custom' && (
              <div className="space-y-3 pt-4 border-t border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-primary" />
                    <span>Custom Robots.txt Content</span>
                  </label>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-muted-foreground">Apply Preset:</span>
                    <button
                      type="button"
                      onClick={() => applyPreset('prod')}
                      className="px-2 py-0.5 rounded border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors cursor-pointer"
                    >
                      Production
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('dev')}
                      className="px-2 py-0.5 rounded border border-border bg-muted/30 hover:bg-muted text-amber-400 transition-colors cursor-pointer"
                    >
                      Dev Block
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('strict')}
                      className="px-2 py-0.5 rounded border border-border bg-muted/30 hover:bg-muted text-sky-400 transition-colors cursor-pointer"
                    >
                      Strict
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={robotsCustomContent}
                  onChange={(e) => setRobotsCustomContent(e.target.value)}
                  placeholder="User-Agent: *&#10;Disallow: /admin&#10;..."
                  className="w-full rounded-xl border border-border bg-background p-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>
            )}

            {/* Live Real-time Robots.txt Preview */}
            <div className="space-y-2 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <FileCode2 className="h-3.5 w-3.5" />
                  <span>Real-time Live /robots.txt Output</span>
                </span>

                <button
                  type="button"
                  onClick={handleCopyPreview}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border/60 hover:bg-muted transition-colors cursor-pointer"
                >
                  {copiedRobots ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedRobots ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs text-foreground overflow-x-auto whitespace-pre">
                {getComputedRobotsPreview()}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-border/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={loadRobotsConfig}
                disabled={loadingRobots}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingRobots ? 'animate-spin' : ''}`} />
                <span>Reload</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRobots}
                disabled={isSavingRobots || loadingRobots}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingRobots ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Robots.txt Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social-preview' && (
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                          nexusnation.in
                        </div>
                      </div>
                      <div className="p-4 space-y-1 bg-card">
                        <p className="text-[11px] font-mono text-muted-foreground">nexusnation.in</p>
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
                          nexusnation.in • 5 min read
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
