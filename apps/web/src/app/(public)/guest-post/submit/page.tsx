'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ClientMdxRenderer } from '@/components/mdx/client-mdx-renderer';
import {
  PenTool,
  Save,
  Send,
  Eye,
  Code2,
  Columns,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  FileCode2,
  Terminal,
  Activity,
  Database,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_MDX_STARTER = `# Designing High-Performance Distributed Systems

Modern distributed systems require strict isolation, predictable tail latency, and resilient failover topologies.

## System Architecture

Below is the distributed request flow across our edge API gateway, service mesh, and Raft consensus group:

\`\`\`mermaid
graph TD
    Client[Web & Mobile Clients] -->|HTTPS/gRPC| Gateway[Envoy API Gateway]
    Gateway -->|JWT / Rate Limit| Auth[Auth Engine]
    Gateway -->|Internal RPC| Broker[Kafka Event Log]
    Broker -->|CDC Outbox| DB[(TimescaleDB Cluster)]
\`\`\`

<Callout type="tip" title="Production Recommendation">
Always deploy Raft state machines across at least 3 distinct availability zones to survive regional network partitions.
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
export async function acquireDistributedLock(key: string, ttlMs: number): Promise<boolean> {
  const nonce = crypto.randomUUID();
  const acquired = await redis.set(key, nonce, 'PX', ttlMs, 'NX');
  return acquired === 'OK';
}
\`\`\`
`;

export default function GuestPostSubmitPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('Designing High-Performance Distributed Systems');
  const [slug, setSlug] = useState('designing-high-performance-distributed-systems');
  const [excerpt, setExcerpt] = useState('An engineering breakdown of distributed consensus, latency isolation, and Raft failover topologies.');
  const [category, setCategory] = useState('system-design');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('ADVANCED');
  const [type, setType] = useState('SYSTEM_DESIGN');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState(SAMPLE_MDX_STARTER);

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + '\n\n' + snippet);
    toast.success('MDX snippet inserted');
  };

  const handleSaveDraft = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save drafts');
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast.success('Draft saved successfully to your dashboard');
  };

  const handleSubmitForReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit your article');
      return;
    }
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      toast.error('Please fill in title, excerpt, and content');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    toast.success('Article submitted for editorial review!');
    router.push('/dashboard/guest-posts');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/write-for-us"
            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <div className="h-4 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm text-foreground">Guest Post Editor</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50 hidden sm:inline-block">
              MDX Engine v2
            </span>
          </div>
        </div>

        {/* View mode toggle + Actions */}
        <div className="flex items-center space-x-2">
          {/* Layout switches */}
          <div className="hidden md:flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/60 text-xs font-mono">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-md flex items-center gap-1 ${
                viewMode === 'edit' ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground'
              }`}
              title="Editor Only"
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
              title="Preview Only"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono font-medium transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleSubmitForReview}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-all shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
          </button>
        </div>
      </header>

      {/* Editor Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {/* Left: Metadata & Code Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Metadata Section */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Article Metadata
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-foreground">Article Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
                    }}
                    placeholder="e.g. Designing a Distributed Rate Limiter with Redis"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-foreground">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="system-design">System Design</option>
                      <option value="databases">Databases</option>
                      <option value="backend">Backend Architecture</option>
                      <option value="devops">DevOps & Cloud</option>
                      <option value="performance">Performance</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-foreground">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-foreground">Article Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="SYSTEM_DESIGN">System Design</option>
                      <option value="DEEP_DIVE">Deep Dive</option>
                      <option value="TUTORIAL">Tutorial</option>
                      <option value="CASE_STUDY">Case Study</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-semibold text-foreground">Short Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    placeholder="Brief 1-2 sentence technical summary..."
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick MDX Snippet Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Insert MDX Component:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<Callout type="note" title="Engineering Note">\n  Describe crucial design constraints or invariant guarantees here.\n</Callout>`,
                    )
                  }
                  className="px-2.5 py-1 rounded-md border border-border/70 bg-muted/30 hover:bg-muted text-[11px] font-mono text-foreground flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-primary" /> Callout
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `\`\`\`mermaid\nsequenceDiagram\n    autonumber\n    Client->>Gateway: POST /v1/orders (Idempotency Key)\n    Gateway->>Service: Dispatch Order\n    Service-->>Gateway: HTTP 201 Created\n\`\`\``,
                    )
                  }
                  className="px-2.5 py-1 rounded-md border border-border/70 bg-muted/30 hover:bg-muted text-[11px] font-mono text-foreground flex items-center gap-1"
                >
                  <Layers className="h-3 w-3 text-sky-500" /> Mermaid
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<Terminal title="benchmarks/run.sh" output="Running 100k requests over 10 parallel connections...\nAll requests finished in 842ms (118,764 req/sec)\np99: 1.2ms | p99.9: 2.8ms" />`,
                    )
                  }
                  className="px-2.5 py-1 rounded-md border border-border/70 bg-muted/30 hover:bg-muted text-[11px] font-mono text-foreground flex items-center gap-1"
                >
                  <Terminal className="h-3 w-3 text-emerald-500" /> Terminal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<Benchmark\n  title="Throughput Benchmark (100k requests)"\n  description="Measured on c6i.4xlarge AWS instances."\n  metrics={[\n    { label: "Throughput", value: "118k req/sec", change: "+35%", trend: "up" },\n    { label: "p99 Latency", value: "1.2ms", change: "-40%", trend: "up" }\n  ]}\n/>`,
                    )
                  }
                  className="px-2.5 py-1 rounded-md border border-border/70 bg-muted/30 hover:bg-muted text-[11px] font-mono text-foreground flex items-center gap-1"
                >
                  <Activity className="h-3 w-3 text-amber-500" /> Benchmark
                </button>
              </div>
            </div>

            {/* Main MDX Content Textarea */}
            <div className="flex-1 flex flex-col space-y-1">
              <label className="text-xs font-mono font-semibold text-foreground">
                MDX Article Body (Markdown + Components)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={22}
                className="w-full flex-1 rounded-xl border border-border bg-card p-4 font-mono text-xs text-foreground leading-relaxed focus:border-primary focus:outline-none shadow-xs"
                placeholder="Write your article in MDX with code blocks and diagrams..."
              />
            </div>
          </div>
        )}

        {/* Right: Live Parsed Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="h-full overflow-y-auto p-6 sm:p-10 bg-background/50">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Article Preview Header */}
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {excerpt || 'No excerpt provided.'}
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs font-mono text-muted-foreground">
                  <span>Author: {user?.name || 'Author Preview'}</span>
                  <span>•</span>
                  <span>Draft Preview</span>
                </div>
              </div>

              {/* Rendered MDX Output */}
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <ClientMdxRenderer content={content} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
