'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Terminal,
  Activity,
  Database,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Table,
  Image as ImageIcon,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  Type,
  Lock,
  Unlock,
  X,
  Plus,
  Info,
  Trash2,
  Copy,
  Check,
  Share2,
  Key,
  User as UserIcon,
  Mail,
  ExternalLink,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { MediaPickerModal } from '@/components/media/media-picker-modal';
import { RichMdxEditor } from '@/components/editor/rich-mdx-editor';
import { normalizeMediaUrl } from '@nexus/config';
import { toast } from 'sonner';
import { guestPostsApi, categoriesApi, articleTypesApi } from '@/lib/api-client';

const SAMPLE_MDX_STARTER = `# Designing High-Performance Distributed Systems

Modern distributed systems require strict isolation, predictable tail latency, and resilient failover topologies.

## System Architecture

Below is the distributed request flow across our edge API gateway, service mesh, and Raft consensus group:

\`\`\`mermaid
graph TD
    Client[Web & Mobile Clients] -->|HTTPS / gRPC| Gateway[Envoy API Gateway]
    Gateway -->|JWT Auth & Rate Limit| AuthEngine[Auth Engine]
    Gateway -->|Internal RPC| Broker[Kafka Event Log]
    Broker -->|CDC Outbox| DB[(TimescaleDB Cluster)]
\`\`\`

<Callout type="tip" title="Production Architecture Tip">
Always deploy Raft state machines across at least 3 distinct availability zones to survive regional network partitions without split-brain anomalies.
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

## Terminal Verification

<Terminal
  title="benchmarks/run-load.sh"
  command="./run-load.sh --concurrency=50 --duration=30s"
>
Running 100k requests over 50 parallel gRPC streams...
All requests finished in 842ms (118,764 req/sec)
p50: 0.42ms | p90: 0.78ms | p99: 1.12ms | p99.9: 2.84ms
Status: 0 packet loss, 100% idempotency verified.
</Terminal>
`;

function GuestPostSubmitContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const tokenParam = searchParams.get('token');

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isSlugLocked, setIsSlugLocked] = useState(true);
  const [showMobileNotice, setShowMobileNotice] = useState(false);

  // Guest poster details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [editToken, setEditToken] = useState(tokenParam || '');
  const [magicLinkModal, setMagicLinkModal] = useState<{
    isOpen: boolean;
    url: string;
    token: string;
    action: 'submitted' | 'saved';
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [title, setTitle] = useState('Designing High-Performance Distributed Systems');
  const [slug, setSlug] = useState('designing-high-performance-distributed-systems');
  const [excerpt, setExcerpt] = useState('An engineering breakdown of distributed consensus, latency isolation, and Raft failover topologies.');
  const [category, setCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [articleTypesList, setArticleTypesList] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('ADVANCED');
  const [type, setType] = useState('SYSTEM_DESIGN');
  const [coverImage, setCoverImage] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [content, setContent] = useState(SAMPLE_MDX_STARTER);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'cover' | 'content'>('cover');

  // Existing post data for edit mode
  const [existingPost, setExistingPost] = useState<any>(null);
  const [editorialFeedback, setEditorialFeedback] = useState<string | null>(null);

  // Load categories & article types
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, types] = await Promise.all([
          categoriesApi.getAll().catch(() => []),
          articleTypesApi.getAll().catch(() => []),
        ]);
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
          if (!category) {
            setCategory(cats[0].id);
          }
        }
        if (Array.isArray(types) && types.length > 0) {
          setArticleTypesList(types);
        }
      } catch (err) {
        console.error('Failed to load categories/types', err);
      }
    }
    loadData();
  }, []);

  // Helper to slugify title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Mobile device check & default to edit mode
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setViewMode((current) => (current === 'split' ? 'edit' : current));
        const hasDismissed = sessionStorage.getItem('nexus_mobile_editor_notice');
        if (!hasDismissed) {
          setShowMobileNotice(true);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dismissMobileNotice = () => {
    setShowMobileNotice(false);
    try {
      sessionStorage.setItem('nexus_mobile_editor_notice', 'true');
    } catch {}
  };

  // Load existing post if in edit mode
  useEffect(() => {
    if (!editId) return;

    async function loadPostToEdit() {
      setIsLoadingPost(true);
      try {
        const token = tokenParam || editToken || undefined;
        const post = await guestPostsApi.getById(editId as string, token);
        if (post) {
          setExistingPost(post);
          setTitle(post.title || '');
          setSlug(post.slug || '');
          if (post.title && post.slug) {
            const expectedSlug = generateSlug(post.title);
            setIsSlugLocked(expectedSlug === post.slug || !post.slug);
          }
          setExcerpt(post.excerpt || '');
          setContent(post.content || '');
          setCategory(post.categoryId || post.category?.id || '');
          setDifficulty(post.difficulty || 'INTERMEDIATE');
          setType(post.type || 'SYSTEM_DESIGN');
          setCoverImage(post.coverImage || '');
          setAuthorBio(post.authorBio || '');
          if (post.guestName) setGuestName(post.guestName);
          if (post.guestEmail) setGuestEmail(post.guestEmail);
          if (post.editToken) setEditToken(post.editToken);
          if (post.editorialFeedback) {
            setEditorialFeedback(post.editorialFeedback);
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load guest post draft. Please check your token or login.');
      } finally {
        setIsLoadingPost(false);
      }
    }

    loadPostToEdit();
  }, [editId, tokenParam]);

  // Sync token from URL param if available
  useEffect(() => {
    if (tokenParam && tokenParam !== editToken) {
      setEditToken(tokenParam);
    }
  }, [tokenParam]);

  // Save to local storage cache for anonymous authors
  const saveToLocalTracker = (item: { id: string; title: string; token: string; status: string }) => {
    try {
      const existingRaw = localStorage.getItem('nexus_guest_submissions');
      const list = existingRaw ? JSON.parse(existingRaw) : [];
      const filtered = list.filter((x: any) => x.id !== item.id);
      filtered.unshift({ ...item, updatedAt: new Date().toISOString() });
      localStorage.setItem('nexus_guest_submissions', JSON.stringify(filtered.slice(0, 20)));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Reading time & stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Handle Title change & slug auto-generation
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isSlugLocked) {
      setSlug(generateSlug(newTitle));
    }
  };



  // Save Draft Handler
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error('Please provide an article title');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        categoryId: category || (categoriesList[0]?.id || undefined),
        difficulty,
        type,
        coverImage: coverImage.trim() || undefined,
        authorBio: authorBio.trim() || undefined,
        guestName: !isAuthenticated ? guestName.trim() || 'Anonymous Contributor' : undefined,
        guestEmail: !isAuthenticated ? guestEmail.trim() || undefined : undefined,
        submitForReview: false,
      };

      if (editId) {
        await guestPostsApi.update(editId, payload, editToken || undefined);
        toast.success('Draft updated successfully!');
      } else {
        const created = await guestPostsApi.submit(payload);
        toast.success('Draft created and saved!');
        const token = created.editToken || '';
        if (token) {
          setEditToken(token);
          saveToLocalTracker({ id: created.id, title: created.title, token, status: 'DRAFT' });
          const magicUrl = `${window.location.origin}/guest-post/submit?edit=${created.id}&token=${token}`;
          setMagicLinkModal({
            isOpen: true,
            url: magicUrl,
            token,
            action: 'saved',
          });
        }
        if (created?.id) {
          const nextUrl = `/guest-post/submit?edit=${created.id}${token ? `&token=${token}` : ''}`;
          router.replace(nextUrl);
        }
      }
    } catch (err: any) {
      const msg = err.error?.details?.join(', ') || err.message || 'Failed to save draft';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit For Review Handler
  const handleSubmitForReview = async () => {
    if (!title.trim()) {
      toast.error('Please provide an article title');
      return;
    }

    if (!content.trim() || content.length < 50) {
      toast.error('Please write some substantive article content before submitting');
      return;
    }

    if (!isAuthenticated && !guestName.trim()) {
      toast.error('Please provide your name or pen name for the guest post');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        categoryId: category || (categoriesList[0]?.id || undefined),
        difficulty,
        type,
        coverImage: coverImage.trim() || undefined,
        authorBio: authorBio.trim() || undefined,
        guestName: !isAuthenticated ? guestName.trim() : undefined,
        guestEmail: !isAuthenticated ? guestEmail.trim() || undefined : undefined,
        submitForReview: true,
        ...(editId && existingPost?.status === 'CHANGES_REQUESTED' ? { resubmit: true } : {}),
      };

      if (editId) {
        await guestPostsApi.update(editId, payload, editToken || undefined);
        toast.success('Article submitted for editorial review!');
        if (isAuthenticated) {
          router.push('/dashboard/guest-posts');
        } else {
          const token = editToken || '';
          if (token) {
            saveToLocalTracker({ id: editId, title, token, status: 'SUBMITTED' });
            const magicUrl = `${window.location.origin}/guest-post/submit?edit=${editId}&token=${token}`;
            setMagicLinkModal({
              isOpen: true,
              url: magicUrl,
              token,
              action: 'submitted',
            });
          }
        }
      } else {
        const created = await guestPostsApi.submit(payload);
        toast.success('Article submitted for editorial review!');
        const token = created.editToken || '';
        if (token) {
          setEditToken(token);
          saveToLocalTracker({ id: created.id, title: created.title, token, status: 'SUBMITTED' });
          const magicUrl = `${window.location.origin}/guest-post/submit?edit=${created.id}&token=${token}`;
          setMagicLinkModal({
            isOpen: true,
            url: magicUrl,
            token,
            action: 'submitted',
          });
          router.replace(`/guest-post/submit?edit=${created.id}&token=${token}`);
        } else if (isAuthenticated) {
          router.push('/dashboard/guest-posts');
        }
      }
    } catch (err: any) {
      const msg = err.error?.details?.join(', ') || err.message || 'Failed to submit article';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleCopyMagicLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Secret Magic Revision Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs font-mono text-muted-foreground">Loading draft data into editor...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">
      {/* Top Bar Navigation */}
      <header className="shrink-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center space-x-3 min-w-0">
          <Link
            href={isAuthenticated ? (editId ? '/dashboard/guest-posts' : '/write-for-us') : '/write-for-us'}
            className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded bg-primary/10 text-primary shrink-0">
              <PenTool className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {title || 'Untitled Guest Post'}
            </span>

            {/* Status Pill */}
            {existingPost?.status ? (
              <span
                className={`hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                  existingPost.status === 'CHANGES_REQUESTED'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : existingPost.status === 'SUBMITTED'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : existingPost.status === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {existingPost.status}
              </span>
            ) : (
              <span className="hidden md:inline-flex text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50">
                New Draft
              </span>
            )}
          </div>
        </div>

        {/* Stats + View mode toggle + Action Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* Live Statistics */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-1 rounded-lg border border-border/50">
            <span title="Word count">
              <strong className="text-foreground">{wordCount}</strong> words
            </span>
            <span>•</span>
            <span title="Estimated reading time" className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              <span>~{estimatedReadTime} min read</span>
            </span>
          </div>

          {/* High-Contrast Active View Mode Toggle */}
          <div className="flex items-center bg-muted/80 p-0.5 sm:p-1 rounded-xl border border-border/70 text-xs font-mono shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-mono ${
                viewMode === 'edit'
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              }`}
              title="Code Editor Only"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-mono ${
                viewMode === 'split'
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              }`}
              title="Split Screen (Editor + Live Preview)"
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-mono ${
                viewMode === 'preview'
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              }`}
              title="Live Rendered Preview Only"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono font-medium transition-colors shadow-2xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Submit / Resubmit for Review */}
          <button
            onClick={handleSubmitForReview}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-all shadow-sm shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>
              {isSubmitting
                ? 'Submitting...'
                : existingPost?.status === 'PUBLISHED'
                ? 'Update Article'
                : existingPost?.status === 'CHANGES_REQUESTED'
                ? 'Resubmit Revision'
                : 'Submit for Review'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Friendly Warning Advisory Banner */}
      {showMobileNotice && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 text-xs text-foreground flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
              <Monitor className="h-4 w-4" />
            </div>
            <p className="text-[11px] sm:text-xs leading-tight text-foreground/90">
              <strong className="font-semibold text-amber-400 font-mono">Desktop Recommended:</strong>{' '}
              <span className="hidden sm:inline text-muted-foreground">
                For the best split-screen writing, diagramming, and MDX live preview experience, we recommend using a desktop or large display.
              </span>
              <span className="sm:hidden text-muted-foreground">
                Desktop recommended for split-screen writing & diagrams.
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={dismissMobileNotice}
            className="px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-[11px] font-mono text-foreground shrink-0 transition-colors shadow-2xs"
          >
            Got It
          </button>
        </div>
      )}

      {/* Editorial Feedback Notice Banner - Only when CHANGES_REQUESTED */}
      {existingPost?.status === 'CHANGES_REQUESTED' && editorialFeedback && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 px-4 sm:px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  Editorial Review Feedback
                </h4>
                <button
                  onClick={() => setEditorialFeedback(null)}
                  className="text-muted-foreground hover:text-foreground text-xs p-1"
                  title="Dismiss note"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
                {editorialFeedback}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground pt-1">
                Tip: Revise your article according to the feedback above, then click &quot;Resubmit Revision&quot; to send it back to the editorial staff.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Published & Live Banner */}
      {existingPost?.status === 'PUBLISHED' && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 sm:px-6 py-3">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Guest Post Published & Live
                </p>
                <p className="text-xs text-foreground/90">
                  Your guest post has been approved and published to the NexusBlog technical directory!
                </p>
              </div>
            </div>
            <Link
              href={`/articles/${existingPost.slug || slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>View Live Article</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Approved Status Banner */}
      {existingPost?.status === 'APPROVED' && (
        <div className="bg-sky-500/10 border-b border-sky-500/30 px-4 sm:px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-sky-400 shrink-0" />
            <div>
              <p className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Article Approved
              </p>
              <p className="text-xs text-foreground/90">
                Your guest article was approved by the editorial team and is scheduled to be published.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/60 min-h-0 overflow-hidden">
        {/* Left Side: Metadata & Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-4 ${
              viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full max-w-5xl mx-auto'
            }`}
          >
            {/* Metadata Accordion Card */}
            <div className="rounded-xl border border-border/70 bg-card/70 overflow-hidden shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => setShowMetadata(!showMetadata)}
                className="w-full flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                    Article Metadata & Categorization
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <span>{showMetadata ? 'Collapse' : 'Expand'}</span>
                  {showMetadata ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </div>
              </button>

              {showMetadata && (
                <div className="p-4 space-y-3.5 border-t border-border/40">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-foreground flex items-center justify-between">
                        <span>Article Title *</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {title.length}/120
                        </span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Designing a Distributed Rate Limiter with Redis"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-semibold text-foreground">URL Slug</label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextLocked = !isSlugLocked;
                            setIsSlugLocked(nextLocked);
                            if (nextLocked) {
                              const autoSlug = generateSlug(title);
                              setSlug(autoSlug);
                              toast.success('Slug auto-synced with title!');
                            } else {
                              toast.info('Custom slug mode enabled');
                            }
                          }}
                          className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-muted/60 transition-colors cursor-pointer"
                          title="Click to toggle between auto-generating slug and custom slug"
                        >
                          {isSlugLocked ? (
                            <>
                              <Lock className="h-3 w-3 text-primary" />
                              <span className="text-primary font-semibold">Auto-sync with Title</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3 text-amber-500" />
                              <span className="text-amber-500 font-semibold">Custom Slug</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-mono text-muted-foreground select-none">
                          /
                        </span>
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
                          placeholder="designing-distributed-rate-limiter"
                          className="w-full rounded-lg border border-border bg-background pl-6 pr-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category, Difficulty, Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-semibold text-foreground">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        {categoriesList.length > 0 ? (
                          categoriesList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="system-design">System Design</option>
                            <option value="databases">Databases</option>
                            <option value="backend">Backend Architecture</option>
                            <option value="devops">DevOps & Cloud</option>
                            <option value="performance">Performance</option>
                          </>
                        )}
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
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-semibold text-foreground flex items-center justify-between">
                      <span>Article Summary / Excerpt</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {excerpt.length}/300
                      </span>
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={2}
                      placeholder="Concise 1-2 sentence engineering summary displayed in feed cards..."
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Guest Poster Profile (When unauthenticated) */}
                  {!isAuthenticated && (
                    <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                          <UserIcon className="h-3.5 w-3.5" />
                          <span>Guest Contributor Identity</span>
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                          No Account Required
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-mono font-semibold text-foreground">
                            Your Name / Pen Name *
                          </label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="e.g. Alex Rivera"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-mono font-semibold text-foreground flex items-center justify-between">
                            <span>Email (Optional)</span>
                            <span className="text-[10px] text-muted-foreground font-normal">For review alerts</span>
                          </label>
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="alex@example.com"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                        💡 <strong className="text-foreground">How anonymous revisions work:</strong> When you submit or save this draft, you&apos;ll get a unique <span className="text-primary font-mono font-semibold">Magic Revision Link</span> containing a secret edit token. You can use that link at any time to revise your draft if editorial feedback is requested.
                      </p>
                    </div>
                  )}

                  {/* Cover Image & Author Bio */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/40">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-semibold text-foreground">
                          Cover Image
                        </label>
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

                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://... or choose from Media Library"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                      />

                      {coverImage ? (
                        <div className="relative rounded-xl border border-border bg-muted/30 overflow-hidden">
                          <div className="h-28 flex items-center justify-center p-2 bg-muted/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={normalizeMediaUrl(coverImage)}
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
                          className="w-full py-3 border border-dashed border-border hover:border-primary/50 rounded-xl flex items-center justify-center gap-1.5 bg-muted/10 hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
                        >
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] font-mono">Select from Media Library</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-semibold text-foreground">
                        Custom Author Byline (Optional)
                      </label>
                      <input
                        type="text"
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                        placeholder="Staff Infrastructure Engineer at TechCorp"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Displayed in the article header below the title to give context about your role or specialization.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rich Visual MDX Editor */}
            <div className="shrink-0 flex flex-col space-y-1.5 min-h-[500px]">
              <RichMdxEditor
                value={content}
                onChange={setContent}
                placeholder="Write your article in Markdown/MDX with interactive diagrams and benchmarks..."
                minHeight="min-h-[460px]"
              />
            </div>
          </div>
        )}

        {/* Right Side: Live Parsed Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`h-full overflow-y-auto p-6 sm:p-10 bg-background/50 ${
              viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full max-w-4xl mx-auto'
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Article Preview Header */}
              <div className="space-y-3.5 border-b border-border/60 pb-6">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
                    {categoriesList.find((c) => c.id === category)?.name || 'SYSTEM DESIGN'}
                  </span>
                  <span className="rounded border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {difficulty}
                  </span>
                  <span className="rounded border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {type}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {title || 'Untitled Article'}
                </h1>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {excerpt || 'No excerpt provided.'}
                </p>

                {coverImage && (
                  <div className="rounded-xl overflow-hidden border border-border my-4 aspect-video bg-muted relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeMediaUrl(coverImage)}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-[10px]">
                      {(guestName || user?.name || 'G')[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-foreground">
                      {guestName || user?.name || 'Guest Contributor'}
                    </span>
                    <span className="rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-mono font-semibold">
                      Guest Post
                    </span>
                    {authorBio && <span className="text-muted-foreground/70 hidden sm:inline">({authorBio})</span>}
                  </div>
                  <span>~{estimatedReadTime} min read</span>
                </div>
              </div>

              {/* Rendered MDX Output */}
              <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm">
                <ClientMdxRenderer content={content} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Magic Revision Link Modal for Anonymous Guest Posters */}
      {magicLinkModal && magicLinkModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMagicLinkModal(null);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground font-mono">
                    {magicLinkModal.action === 'submitted'
                      ? '🎉 Submission Received!'
                      : '💾 Draft Saved Successfully!'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your Secret Magic Revision Link
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMagicLinkModal(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-foreground/90 leading-relaxed">
                Because you are submitting as an anonymous guest contributor without logging in, this unique link contains your cryptographic authorization token.
              </p>

              <div className="p-3.5 rounded-xl border border-border/80 bg-background space-y-2">
                <label className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider block">
                  Secret Revision URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={magicLinkModal.url}
                    className="w-full rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs font-mono text-foreground focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyMagicLink(magicLinkModal.url)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5 text-xs">
                <p className="font-semibold text-amber-400 flex items-center gap-1 font-mono">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Bookmark or Save This Link:</span>
                </p>
                <p className="text-[11px] text-foreground/80 leading-relaxed font-sans">
                  If the editorial team requests revisions, you can open this link from any browser to view the review notes and update your article.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setMagicLinkModal(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity"
              >
                Got It, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal for Cover Image */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Article Cover Image"
        actionLabel="Set as Cover Image"
        onSelect={(url) => {
          setCoverImage(normalizeMediaUrl(url));
          toast.success('Cover image selected!');
        }}
      />
    </div>
  );
}

export default function GuestPostSubmitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <GuestPostSubmitContent />
    </Suspense>
  );
}

