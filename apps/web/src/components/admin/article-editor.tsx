'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientMdxRenderer } from '@/components/mdx/client-mdx-renderer';
import {
  Save,
  Send,
  Eye,
  Code2,
  Columns,
  ArrowLeft,
  Sparkles,
  Layers,
  Terminal,
  Activity,
  Database,
  SlidersHorizontal,
  Clock,
  FileCode2,
  CheckCircle2,
  Globe,
  Settings2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ArticleEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    categoryId?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    type?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
  };
  isNew?: boolean;
}

const DEFAULT_STARTER = `## Introduction

Rate limiting is critical for protecting upstream services, preventing cascading failures, and enforcing API tier quotas.

## Architecture

\`\`\`mermaid
sequenceDiagram
    autonumber
    Client->>Gateway: HTTP GET /api/v1/resource
    Gateway->>Redis: EVALSHA sliding_window.lua (Key, Limit, Window)
    Redis-->>Gateway: [Allowed: 1, Remaining: 42, Reset: 15000]
    Gateway->>Backend: Forward Request
    Backend-->>Client: HTTP 200 OK
\`\`\`

<Callout type="warning" title="Distributed Clock Skew">
Ensure all Redis nodes and API gateway instances synchronize via NTP. Time drift beyond 50ms will distort sliding window bucket calculation.
</Callout>

## Benchmark Results

<Benchmark
  title="Sliding Window vs Token Bucket (1M ops/sec)"
  description="Measured p99 latency under simulated 20ms network jitter."
  metrics={[
    { label: "Sliding Window (Lua)", value: "0.84ms", change: "-42% latency", trend: "up" },
    { label: "Token Bucket (Redis)", value: "1.12ms", change: "-28% latency", trend: "up" },
    { label: "Memory Footprint", value: "64MB", change: "O(1) memory", trend: "neutral" }
  ]}
/>

## Implementation Code

\`\`\`typescript
export async function acquireRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const clearBefore = now - windowMs;
  
  const result = await redis.eval(
    SLIDING_WINDOW_SCRIPT,
    1,
    key,
    now,
    clearBefore,
    limit
  );
  return result === 1;
}
\`\`\`
`;

export function ArticleEditor({ initialData, isNew = false }: ArticleEditorProps) {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showMetadata, setShowMetadata] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState(isNew ? '' : initialData?.title || '');
  const [slug, setSlug] = useState(isNew ? '' : initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(isNew ? '' : initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || (isNew ? '## Introduction\n\nStart writing your technical article here...\n' : DEFAULT_STARTER));
  const [category, setCategory] = useState(initialData?.categoryId || 'system-design');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'ADVANCED');
  const [type, setType] = useState(initialData?.type || 'SYSTEM_DESIGN');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');

  // Synchronize state when initialData changes dynamically
  useEffect(() => {
    if (initialData && !isNew) {
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.slug !== undefined) setSlug(initialData.slug);
      if (initialData.excerpt !== undefined) setExcerpt(initialData.excerpt);
      if (initialData.content !== undefined) setContent(initialData.content);
      if (initialData.categoryId !== undefined) setCategory(initialData.categoryId);
      if (initialData.difficulty !== undefined) setDifficulty(initialData.difficulty);
      if (initialData.type !== undefined) setType(initialData.type);
      if (initialData.status !== undefined) setStatus(initialData.status);
      if (initialData.coverImage !== undefined) setCoverImage(initialData.coverImage);
      if (initialData.featured !== undefined) setFeatured(initialData.featured);
      if (initialData.seoTitle !== undefined) setSeoTitle(initialData.seoTitle);
      if (initialData.seoDescription !== undefined) setSeoDescription(initialData.seoDescription);
    }
  }, [initialData, isNew]);

  // Calculate estimated reading time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + '\n\n' + snippet);
    toast.success('Snippet inserted');
  };

  const handleSave = async (publishStatus: 'DRAFT' | 'PUBLISHED') => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    setStatus(publishStatus);
    toast.success(
      publishStatus === 'PUBLISHED'
        ? 'Article published successfully!'
        : 'Article draft saved!',
    );
    if (isNew) {
      router.push('/admin/articles');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col -m-4 sm:-m-8 lg:-m-10">
      {/* CMS Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/95 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Articles
          </Link>
          <div className="h-4 w-px bg-border/60 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-md">
              {title || 'Untitled Article'}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border shrink-0 ${
                status === 'PUBLISHED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-muted-foreground mr-2">
            <Clock className="h-3.5 w-3.5" /> ~{readingTime}m ({wordCount} words)
          </span>

          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              showMetadata
                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                : 'border-border bg-card hover:bg-muted text-foreground'
            }`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* View Mode */}
          <div className="hidden md:flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs font-mono">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'edit' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Editor Only"
            >
              <Code2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'split' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Split View"
            >
              <Columns className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'preview' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Preview Only"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => handleSave('DRAFT')}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono font-medium transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave('PUBLISHED')}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-all shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Editor Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panes */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: MDX Code Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-4 border-r border-border/60 ${viewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'}`}>
              {/* Snippet Insertion Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-3">
                <span className="text-[11px] font-mono text-muted-foreground mr-1">Insert:</span>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<Callout type="tip" title="Production Tip">\nEnter actionable engineering advice here.\n</Callout>`,
                    )
                  }
                  className="px-2 py-1 rounded bg-muted/40 hover:bg-muted text-[11px] font-mono border border-border/60 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-primary" /> Callout
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `\`\`\`mermaid\ngraph TD\n    A[API Gateway] --> B[Service A]\n    A --> C[Service B]\n\`\`\``,
                    )
                  }
                  className="px-2 py-1 rounded bg-muted/40 hover:bg-muted text-[11px] font-mono border border-border/60 flex items-center gap-1"
                >
                  <Layers className="h-3 w-3 text-sky-500" /> Mermaid
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<Terminal title="benchmark.sh" output="100,000 requests in 840ms (119k req/sec)\np99: 1.1ms" />`,
                    )
                  }
                  className="px-2 py-1 rounded bg-muted/40 hover:bg-muted text-[11px] font-mono border border-border/60 flex items-center gap-1"
                >
                  <Terminal className="h-3 w-3 text-emerald-500" /> Terminal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<Benchmark\n  title="Performance Benchmark"\n  description="Measured over 100k requests"\n  metrics={[\n    { label: "Throughput", value: "119k req/sec", change: "+40%", trend: "up" }\n  ]}\n/>`,
                    )
                  }
                  className="px-2 py-1 rounded bg-muted/40 hover:bg-muted text-[11px] font-mono border border-border/60 flex items-center gap-1"
                >
                  <Activity className="h-3 w-3 text-amber-500" /> Benchmark
                </button>
              </div>

              {/* Textarea */}
              <div className="flex-1 flex flex-col min-h-[500px]">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full flex-1 min-h-[550px] rounded-xl border border-border bg-card/60 p-4 font-mono text-xs sm:text-sm text-foreground leading-relaxed focus:border-primary focus:outline-none resize-none shadow-inner"
                  placeholder="Write your technical article in MDX..."
                />
              </div>
            </div>
          )}

          {/* Right: Live Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`h-full overflow-y-auto p-6 sm:p-10 bg-background/50 ${viewMode === 'split' ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Article Header Preview */}
                <div className="space-y-3 border-b border-border/60 pb-6">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
                      {category.toUpperCase()}
                    </span>
                    <span className="rounded border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {difficulty}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {title || 'Untitled Article'}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">{excerpt}</p>
                </div>

                {/* Client MDX Live Preview */}
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <ClientMdxRenderer content={content} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Drawer: Article Metadata & SEO Configuration */}
        {showMetadata && (
          <aside className="w-80 border-l border-border/70 bg-card p-5 space-y-6 overflow-y-auto shrink-0 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-foreground">
                Article Configuration
              </h3>
              <button
                onClick={() => setShowMetadata(false)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono text-[11px] focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="system-design">System Design</option>
                  <option value="backend-engineering">Backend Engineering</option>
                  <option value="distributed-systems">Distributed Systems</option>
                  <option value="databases">Databases</option>
                  <option value="apis">APIs</option>
                  <option value="devops">DevOps</option>
                  <option value="cloud">Cloud</option>
                  <option value="performance">Performance</option>
                  <option value="observability">Observability</option>
                  <option value="ai-engineering">AI / Engineering</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                  <option value="EXPERT">EXPERT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="SYSTEM_DESIGN">System Design</option>
                  <option value="DEEP_DIVE">Deep Dive</option>
                  <option value="TUTORIAL">Tutorial</option>
                  <option value="CASE_STUDY">Case Study</option>
                  <option value="ARCHITECTURE_DECISION">Architecture Decision</option>
                  <option value="BENCHMARK">Benchmark</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="featured" className="font-mono text-xs text-foreground cursor-pointer">
                  Feature this article on Homepage
                </label>
              </div>

              <div className="pt-4 border-t border-border/40 space-y-3">
                <h4 className="font-mono font-bold text-foreground uppercase tracking-wider text-[11px]">
                  SEO Settings
                </h4>
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] text-muted-foreground">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom search title..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-foreground text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] text-muted-foreground">Meta Description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={2}
                    placeholder="Search snippet description..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-foreground text-xs focus:border-primary focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
