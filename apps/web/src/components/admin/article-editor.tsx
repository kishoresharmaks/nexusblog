'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientMdxRenderer } from '@/components/mdx/client-mdx-renderer';
import { articlesApi, categoriesApi, articleTypesApi, technologiesApi, tagsApi, seriesApi, usersApi } from '@/lib/api-client';
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
  Image as ImageIcon,
  Trash2,
  Lock,
  Unlock,
  Tag as TagIcon,
  Cpu,
  BookOpen,
  Hash,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { MediaPickerModal } from '@/components/media/media-picker-modal';
import { RichMdxEditor } from '@/components/editor/rich-mdx-editor';
import { toast } from 'sonner';

interface ArticleEditorProps {
  initialData?: any;
  articleId?: string;
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

export function ArticleEditor({ initialData, articleId, isNew = false }: ArticleEditorProps) {
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useAdminSidebar();

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showMetadata, setShowMetadata] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [articleTypesList, setArticleTypesList] = useState<any[]>([]);
  const [technologiesList, setTechnologiesList] = useState<any[]>([]);
  const [tagsList, setTagsList] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [currentArticle, setCurrentArticle] = useState<any>(initialData || null);
  const [isLoadingArticle, setIsLoadingArticle] = useState<boolean>(!isNew && !initialData && !!articleId);

  // Form State
  const [title, setTitle] = useState(isNew ? '' : initialData?.title || '');
  const [slug, setSlug] = useState(isNew ? '' : initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(isNew ? '' : initialData?.excerpt || '');
  const [content, setContent] = useState<string>(
    initialData?.content || (isNew ? '## Introduction\n\nStart writing your technical article here...\n' : DEFAULT_STARTER),
  );
  const [category, setCategory] = useState(
    initialData?.category?.slug || initialData?.category?.id || initialData?.categoryId || 'system-design',
  );
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'ADVANCED');
  const [type, setType] = useState(initialData?.type || 'SYSTEM_DESIGN');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [selectedTechnologyIds, setSelectedTechnologyIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [seriesOrder, setSeriesOrder] = useState<number>(1);
  const [authorId, setAuthorId] = useState<string>(initialData?.author?.id || initialData?.authorId || '');
  const [authorsList, setAuthorsList] = useState<any[]>([]);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [isSlugLocked, setIsSlugLocked] = useState(true);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'cover' | 'content'>('cover');

  // Helper to slugify title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Fetch all available categories, article types, technologies, tags & series dynamically
  useEffect(() => {
    categoriesApi
      .getAll()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
        }
      })
      .catch(() => {});

    articleTypesApi
      .getAll()
      .then((types) => {
        if (Array.isArray(types) && types.length > 0) {
          setArticleTypesList(types);
        }
      })
      .catch(() => {});

    technologiesApi
      .getAll()
      .then((techs) => {
        if (Array.isArray(techs) && techs.length > 0) {
          setTechnologiesList(techs);
        }
      })
      .catch(() => {});

    tagsApi
      .getAll()
      .then((tags) => {
        if (Array.isArray(tags) && tags.length > 0) {
          setTagsList(tags);
        }
      })
      .catch(() => {});

    seriesApi
      .getAll(true)
      .then((series) => {
        if (Array.isArray(series) && series.length > 0) {
          setSeriesList(series);
        }
      })
      .catch(() => {});

    usersApi
      .getAdminUsers({ limit: 100 })
      .then((res) => {
        if (Array.isArray(res?.items)) {
          setAuthorsList(res.items);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch article if editing and not supplied in SSR props
  useEffect(() => {
    if (!isNew && articleId) {
      setIsLoadingArticle(true);
      articlesApi
        .getById(articleId)
        .catch(() => articlesApi.getBySlug(articleId))
        .then((data) => {
          if (data) {
            setCurrentArticle(data);
          }
        })
        .finally(() => setIsLoadingArticle(false));
    }
  }, [articleId, isNew]);

  // Synchronize state when currentArticle or initialData updates
  useEffect(() => {
    const data = currentArticle || initialData;
    if (data && !isNew) {
      if (data.title !== undefined) setTitle(data.title);
      if (data.slug !== undefined) setSlug(data.slug);
      if (data.excerpt !== undefined) setExcerpt(data.excerpt);
      if (data.content !== undefined) setContent(data.content);
      const catVal = data.category?.slug || data.category?.id || data.categoryId || data.categorySlug || 'system-design';
      setCategory(catVal);
      if (data.difficulty !== undefined) setDifficulty(data.difficulty);
      if (data.type !== undefined) setType(data.type);
      if (data.status !== undefined) setStatus(data.status);
      if (data.coverImage !== undefined) setCoverImage(data.coverImage);
      if (data.featured !== undefined) setFeatured(data.featured);
      if (data.seoTitle !== undefined) setSeoTitle(data.seoTitle);
      if (data.seoDescription !== undefined) setSeoDescription(data.seoDescription);
      if (data.authorId) setAuthorId(data.authorId);
      else if (data.author?.id) setAuthorId(data.author.id);

      // Multi-dimensional taxonomy sync
      if (data.technologies && Array.isArray(data.technologies)) {
        setSelectedTechnologyIds(data.technologies.map((t: any) => t.id || t));
      } else if (data.technologyIds && Array.isArray(data.technologyIds)) {
        setSelectedTechnologyIds(data.technologyIds);
      }

      if (data.tags && Array.isArray(data.tags)) {
        setSelectedTagIds(data.tags.map((t: any) => t.id || t));
      } else if (data.tagIds && Array.isArray(data.tagIds)) {
        setSelectedTagIds(data.tagIds);
      }

      if (data.seriesId) setSelectedSeriesId(data.seriesId);
      else if (data.series?.id) setSelectedSeriesId(data.series.id);
      if (data.seriesOrder !== undefined && data.seriesOrder !== null) {
        setSeriesOrder(data.seriesOrder);
      }
    }
  }, [currentArticle, initialData, isNew]);

  // Calculate estimated reading time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const toggleTech = (techId: string) => {
    setSelectedTechnologyIds((prev) =>
      prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId],
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSave = async (publishStatus: 'DRAFT' | 'PUBLISHED') => {
    setIsSaving(true);
    const targetSlug = slug || (title ? title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') : 'untitled-article');
    const targetId = articleId || currentArticle?.id || initialData?.id;

    const selectedCat = categoriesList.find((c) => c.slug === category || c.id === category);
    const categoryId = selectedCat?.id || (category && category.length === 24 ? category : undefined);
    const categorySlug = selectedCat?.slug || category || 'system-design';
    const targetExcerpt = excerpt?.trim() || content.replace(/^[#\s\n*`_-]+/, '').slice(0, 160).trim() || `${title || 'Technical article breakdown.'}`;

    const payload: any = {
      title: title || 'Untitled Article',
      slug: targetSlug,
      excerpt: targetExcerpt,
      content,
      categorySlug,
      ...(categoryId ? { categoryId } : {}),
      difficulty,
      type,
      status: publishStatus,
      featured,
      coverImage: coverImage || undefined,
      technologyIds: selectedTechnologyIds,
      tagIds: selectedTagIds,
      seriesId: selectedSeriesId || null,
      seriesOrder: selectedSeriesId ? seriesOrder : null,
      ...(authorId ? { authorId } : {}),
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };


    try {
      if (!isNew && targetId) {
        await articlesApi.update(targetId, payload);
      } else if (isNew) {
        await articlesApi.create(payload);
      }

      setStatus(publishStatus);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nexus_articles_updated'));
      }
      toast.success(
        publishStatus === 'PUBLISHED'
          ? 'Article published successfully!'
          : 'Article draft saved!',
      );
      if (isNew) {
        router.push('/admin/articles');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save article';
      toast.error(errorMsg, {
        description: err.details ? (Array.isArray(err.details) ? err.details.join('\n') : String(err.details)) : undefined,
        duration: 6000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background text-foreground font-sans">
      {/* CMS Top Navigation Bar */}
      <header className="shrink-0 border-b border-border/70 bg-card/95 backdrop-blur-md px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 sm:gap-4 z-20">
        {/* Left: Sidebar Toggle, Back & Title */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              !isCollapsed
                ? 'bg-primary/10 border-primary/30 text-primary font-bold'
                : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground shadow-2xs'
            }`}
            title={isCollapsed ? 'Expand Admin Sidebar' : 'Collapse Admin Sidebar'}
            aria-label={isCollapsed ? 'Expand Admin Sidebar' : 'Collapse Admin Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
            <span className="hidden xl:inline text-[11px] font-semibold">{isCollapsed ? 'Sidebar' : 'Collapse'}</span>
          </button>
          <div className="h-4 w-px bg-border/60 shrink-0" />
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Articles</span>
          </Link>
          <div className="h-4 w-px bg-border/60 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm text-foreground truncate max-w-[140px] sm:max-w-xs md:max-w-md">
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

          {/* High-Contrast Active View Mode Toggle */}
          <div className="hidden md:flex items-center bg-muted/80 p-1 rounded-xl border border-border/70 text-xs font-mono shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-mono ${
                viewMode === 'edit'
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              }`}
              title="Editor Only"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-mono ${
                viewMode === 'split'
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              }`}
              title="Split View (Editor + Live Preview)"
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-mono ${
                viewMode === 'preview'
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              }`}
              title="Preview Only"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Preview</span>
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

      {/* Editor Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Editor Panes */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left: MDX Code Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div
              className={`flex flex-col h-full overflow-hidden border-r border-border/60 min-w-0 ${
                viewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'
              }`}
            >
              {/* Rich Visual MDX Editor Pane */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <RichMdxEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your technical article in MDX with visual diagrams and code blocks..."
                  className="h-full border-0 rounded-none shadow-none"
                  minHeight="min-h-full"
                />
              </div>
            </div>
          )}

          {/* Right: Live Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className={`h-full overflow-y-auto p-6 sm:p-10 bg-background/50 min-w-0 ${
                viewMode === 'split' ? 'hidden lg:block lg:w-1/2' : 'w-full'
              }`}
            >
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Article Cover Image Live Preview */}
                {coverImage && (
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm max-h-72">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt={title || 'Cover image preview'}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

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
          <aside className="w-80 border-l border-border/70 bg-card p-5 space-y-6 overflow-y-auto shrink-0 shadow-xl h-full z-10">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-foreground">
                Article Configuration
              </h3>
              <button
                onClick={() => setShowMetadata(false)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors"
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
                    const newTitle = e.target.value;
                    setTitle(newTitle);
                    if (isSlugLocked) {
                      setSlug(generateSlug(newTitle));
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-semibold text-foreground">Slug</label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextLocked = !isSlugLocked;
                      setIsSlugLocked(nextLocked);
                      if (nextLocked) {
                        setSlug(generateSlug(title));
                        toast.success('Slug auto-synced with title!');
                      } else {
                        toast.info('Custom slug mode enabled');
                      }
                    }}
                    className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    {isSlugLocked ? (
                      <>
                        <Lock className="h-3 w-3 text-primary" />
                        <span className="text-primary font-semibold">Auto-sync</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3 text-amber-500" />
                        <span className="text-amber-500 font-semibold">Custom</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugLocked(false);
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_]+/g, '-')
                    );
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono text-[11px] focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground flex items-center justify-between">
                  <span>Author / Contributor</span>
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none text-xs"
                >
                  <option value="">-- Current Author / Default --</option>
                  {authorsList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (@{a.username}) — {a.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  {categoriesList.length > 0 ? (
                    categoriesList.map((cat) => (
                      <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <>
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
                    </>
                  )}
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
                  {articleTypesList.length > 0 ? (
                    articleTypesList.map((t) => (
                      <option key={t.id || t.slug} value={t.slug}>
                        {t.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="SYSTEM_DESIGN">System Design</option>
                      <option value="DEEP_DIVE">Deep Dive</option>
                      <option value="TUTORIAL">Tutorial</option>
                      <option value="CASE_STUDY">Case Study</option>
                      <option value="BENCHMARK">Benchmark</option>
                      <option value="COMPARISON">Comparison</option>
                      <option value="GUIDE">Guide</option>
                      <option value="HOW_TO">How-To</option>
                      <option value="REFERENCE">Reference</option>
                      <option value="OPINION">Opinion</option>
                    </>
                  )}
                </select>
              </div>

              {/* Technology Hubs Multi-Select */}
              <div className="space-y-2 pt-1 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    <span>Technology Hubs</span>
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {selectedTechnologyIds.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 rounded-lg border border-border/60 bg-muted/20">
                  {technologiesList.length > 0 ? (
                    technologiesList.map((tech) => {
                      const isSelected = selectedTechnologyIds.includes(tech.id) || selectedTechnologyIds.includes(tech.slug);
                      return (
                        <button
                          key={tech.id}
                          type="button"
                          onClick={() => toggleTech(tech.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                              : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                          }`}
                        >
                          <span>{tech.name}</span>
                          {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-muted-foreground p-1">No technology hubs configured.</p>
                  )}
                </div>
              </div>

              {/* Tags Multi-Select */}
              <div className="space-y-2 pt-1 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                    <span>Tags Taxonomy</span>
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {selectedTagIds.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 rounded-lg border border-border/60 bg-muted/20">
                  {tagsList.length > 0 ? (
                    tagsList.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id) || selectedTagIds.includes(tag.slug);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-white font-bold shadow-xs'
                              : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                          }`}
                        >
                          <span>#{tag.name}</span>
                          {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-muted-foreground p-1">No tags configured.</p>
                  )}
                </div>
              </div>

              {/* Series Curriculum Association */}
              <div className="space-y-2 pt-1 border-t border-border/40">
                <label className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>Series Curriculum</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={selectedSeriesId}
                      onChange={(e) => setSelectedSeriesId(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none text-xs"
                    >
                      <option value="">None (Standalone Article)</option>
                      {seriesList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      min={1}
                      disabled={!selectedSeriesId}
                      value={seriesOrder}
                      onChange={(e) => setSeriesOrder(parseInt(e.target.value, 10) || 1)}
                      placeholder="Chapter #"
                      title="Chapter sequence number"
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-foreground focus:border-primary focus:outline-none text-xs font-mono disabled:opacity-40"
                    />
                  </div>
                </div>
                {selectedSeriesId && (
                  <p className="text-[10px] font-mono text-muted-foreground">
                    This article will be rendered as Chapter {seriesOrder} of the selected series.
                  </p>
                )}
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

              {/* Cover Image & Media Library Integration */}
              <div className="space-y-2 pt-1 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-semibold text-foreground">Cover Image</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerMode('cover');
                      setIsMediaPickerOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline font-semibold"
                  >
                    <ImageIcon className="h-3 w-3" /> Browse Library
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://... or choose from Media Library"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none font-mono text-[11px]"
                  />

                  {coverImage ? (
                    <div className="relative rounded-xl border border-border bg-muted/30 overflow-hidden group">
                      <div className="h-28 flex items-center justify-center p-2 bg-muted/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverImage}
                          alt="Cover preview"
                          crossOrigin="anonymous"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="p-2 flex items-center justify-between bg-card border-t border-border/50 text-[11px] font-mono">
                        <span className="text-muted-foreground truncate max-w-[150px]">Cover Set</span>
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerMode('cover');
                        setIsMediaPickerOpen(true);
                      }}
                      className="w-full py-3.5 border border-dashed border-border hover:border-primary/50 rounded-xl flex flex-col items-center justify-center gap-1 bg-muted/10 hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] font-mono">Pick from Media Library</span>
                    </button>
                  )}
                </div>
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

      {/* Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Article Cover Image"
        actionLabel="Set as Cover Image"
        onSelect={(url) => {
          setCoverImage(url);
          toast.success('Cover image selected!');
        }}
      />
    </div>
  );
}
