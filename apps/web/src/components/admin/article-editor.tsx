'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdxRenderer } from '@/components/mdx/mdx-renderer';
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

const DEFAULT_STARTER = `# Designing a Distributed Rate Limiter with Redis and Lua Scripts

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
  const [title, setTitle] = useState(initialData?.title || 'Designing a Distributed Rate Limiter with Redis and Lua Scripts');
  const [slug, setSlug] = useState(initialData?.slug || 'designing-distributed-rate-limiter');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || 'A deep dive into sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.');
  const [content, setContent] = useState(initialData?.content || DEFAULT_STARTER);
  const [category, setCategory] = useState(initialData?.categoryId || 'system-design');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'ADVANCED');
  const [type, setType] = useState(initialData?.type || 'SYSTEM_DESIGN');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');

  // Calculate estimated reading time
  const wordCount = content.trim().split(/\s+/).length;
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
      {/* CMS Header Bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Articles
          </Link>
          <div className="h-4 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-md">
              {title || 'Untitled Article'}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                status === 'PUBLISHED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-muted-foreground mr-2">
            <Clock className="h-3.5 w-3.5" /> ~{readingTime}m ({wordCount} words)
          </span>

          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              showMetadata
                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                : 'border-border bg-card hover:bg-muted text-foreground'
            }`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* View Mode */}
          <div className="hidden md:flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/60 text-xs font-mono">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-md flex items-center gap-1 ${
                viewMode === 'edit' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground'
              }`}
              title="Editor"
            >
              <Code2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md flex items-center gap-1 ${
                viewMode === 'split' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground'
              }`}
              title="Split View"
            >
              <Columns className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-md flex items-center gap-1 ${
                viewMode === 'preview' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground'
              }`}
              title="Preview"
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

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor / Preview Panes */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 overflow-hidden">
          {/* Left: MDX Code Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Snippet Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-3">
                <span className="text-[11px] font-mono text-muted-foreground mr-1">Insert:</span>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<Callout type="tip" title="Production Tip">\n  Enter actionable engineering advice here.\n</Callout>`,
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
              <div className="flex-1 flex flex-col">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full flex-1 min-h-[600px] rounded-xl border border-border bg-card p-4 font-mono text-xs text-foreground leading-relaxed focus:border-primary focus:outline-none"
                  placeholder="Write your article in MDX..."
                />
              </div>
            </div>
          )}

          {/* Right: Live Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="h-full overflow-y-auto p-6 sm:p-10 bg-background/50">
              <div className="max-w-2xl mx-auto space-y-8">
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

                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <MdxRenderer content={content} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Article Metadata & SEO */}
        {showMetadata && (
          <aside className="w-80 border-l border-border/70 bg-card p-5 space-y-6 overflow-y-auto shrink-0 shadow-lg">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-foreground">
                Article Configuration
              </h3>
              <button
                onClick={() => setShowMetadata(false)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Close
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
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="system-design">System Design</option>
                  <option value="databases">Databases</option>
                  <option value="backend">Backend Architecture</option>
                  <option value="devops">DevOps & Cloud</option>
                  <option value="performance">Performance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Article Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="SYSTEM_DESIGN">System Design</option>
                  <option value="DEEP_DIVE">Deep Dive</option>
                  <option value="TUTORIAL">Tutorial</option>
                  <option value="CASE_STUDY">Case Study</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-border/40 space-y-3">
                <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                  SEO & Social Meta
                </h4>

                <div className="space-y-1.5">
                  <label className="font-mono font-semibold text-foreground">SEO Meta Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom Google title..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono font-semibold text-foreground">SEO Description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={2}
                    placeholder="Custom meta description..."
                    className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:border-primary focus:outline-none"
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
