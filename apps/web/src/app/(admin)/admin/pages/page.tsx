'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  Save,
  X,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  Globe,
  FileCode2,
  Sparkles,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { pagesApi } from '@/lib/api-client';
import { ClientMdxRenderer } from '@/components/mdx/client-mdx-renderer';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  published: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt: string;
  createdAt: string;
}

export default function AdminPagesManager() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [search, setSearch] = useState('');
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [deleteConfirmPage, setDeleteConfirmPage] = useState<PageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await pagesApi.getAll(true);
      setPages(data || []);
    } catch (err: any) {
      console.error('Failed to load pages:', err);
      toast.error('Failed to load pages from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase())),
  );

  const handleOpenNew = () => {
    setEditingPage({
      id: '',
      title: '',
      slug: '',
      content: `# New Page Title\n\nWrite your markdown content here. You can use standard GitHub Flavored Markdown, code blocks, lists, and callout components.\n\n### 1. Overview\n\nDetails go here.\n`,
      excerpt: '',
      published: true,
      seoTitle: '',
      seoDescription: '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setIsNew(true);
    setActiveTab('write');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage?.title.trim() || !editingPage?.slug.trim() || !editingPage?.content.trim()) {
      toast.error('Title, Slug, and Content are required');
      return;
    }

    try {
      const payload = {
        title: editingPage.title.trim(),
        slug: editingPage.slug.trim().toLowerCase(),
        content: editingPage.content,
        excerpt: editingPage.excerpt?.trim() || undefined,
        published: editingPage.published,
        seoTitle: editingPage.seoTitle?.trim() || undefined,
        seoDescription: editingPage.seoDescription?.trim() || undefined,
      };

      if (isNew) {
        await pagesApi.create(payload);
        toast.success(`Page "${editingPage.title}" created successfully`);
      } else {
        await pagesApi.update(editingPage.id, payload);
        toast.success(`Page "${editingPage.title}" updated successfully`);
      }
      await loadPages();
      setEditingPage(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save page');
    }
  };

  const confirmDeletePage = async () => {
    if (!deleteConfirmPage) return;
    setIsDeleting(true);
    try {
      await pagesApi.delete(deleteConfirmPage.id);
      await loadPages();
      toast.success(`Page "${deleteConfirmPage.title}" deleted`);
      setDeleteConfirmPage(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete page');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageLiveUrl = (slug: string) => {
    const knownTopLevelSlugs = [
      'privacy-policy',
      'terms-of-service',
      'disclaimer',
      'content-policy',
      'cookie-policy',
      'author-guidelines',
      'contact',
    ];
    return knownTopLevelSlugs.includes(slug) ? `/${slug}` : `/pages/${slug}`;
  };

  const publishedCount = pages.filter((p) => p.published).length;
  const draftCount = pages.length - publishedCount;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Pages &amp; Legal CMS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage dynamic legal policies, author guidelines, disclaimer notices, and custom institutional markdown pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New CMS Page</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border/70">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>Total: <strong className="text-foreground">{pages.length}</strong></span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Published: {publishedCount}</span>
          </span>
          {draftCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="h-3.5 w-3.5" />
              <span>Drafts: {draftCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Pages Grid / Cards */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground font-mono">Loading CMS pages...</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-3">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-sm text-foreground">No pages found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? 'No pages matched your search query.' : 'Create your first dynamic institutional or legal page to get started.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-all shadow-xs mt-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Page</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPages.map((page) => {
            const liveUrl = getPageLiveUrl(page.slug);
            const formattedDate = new Date(page.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={page.id}
                className="group rounded-2xl border border-border/80 bg-card p-5 space-y-4 hover:border-foreground/20 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {page.title}
                        </h3>
                        <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[170px]">
                          {liveUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={liveUrl}
                        target="_blank"
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="View live page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          setEditingPage(page);
                          setIsNew(false);
                          setActiveTab('write');
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        title="Edit page"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmPage(page)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete page"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {page.excerpt || 'No summary excerpt provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                      page.published
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}
                  >
                    {page.published ? 'Published' : 'Draft'}
                  </span>

                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formattedDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Page Edit / Create Modal */}
      {editingPage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingPage(null);
          }}
        >
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/70 px-6 py-4 bg-muted/20">
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-foreground font-mono flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-primary" />
                  <span>{isNew ? 'Create New Dynamic Page' : `Edit Page: ${editingPage.title}`}</span>
                </h3>
                <p className="text-xs text-muted-foreground font-sans">
                  Live Markdown and MDX editing with real-time preview and SEO settings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 space-y-1.5">
                  <label className="font-mono font-semibold text-foreground text-xs">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPage.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingPage({
                        ...editingPage,
                        title: val,
                        slug: isNew
                          ? val
                              .toLowerCase()
                              .replace(/[^\w\s-]/g, '')
                              .replace(/\s+/g, '-')
                          : editingPage.slug,
                      });
                    }}
                    placeholder="e.g. Privacy Policy"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-xs"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="font-mono font-semibold text-foreground text-xs">URL Slug *</label>
                  <div className="flex items-center rounded-xl border border-border bg-background px-3 py-1.5 focus-within:border-primary">
                    <span className="font-mono text-muted-foreground text-xs select-none">/</span>
                    <input
                      type="text"
                      required
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                      placeholder="privacy-policy"
                      className="w-full bg-transparent border-0 p-0 pl-1 text-foreground font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={editingPage.published}
                      onChange={(e) => setEditingPage({ ...editingPage, published: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="font-mono text-xs font-semibold text-foreground">Published</span>
                  </label>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground text-xs">Excerpt / Brief Summary</label>
                <input
                  type="text"
                  value={editingPage.excerpt || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, excerpt: e.target.value })}
                  placeholder="Short description displayed in header hero banner and SEO search snippets..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-xs"
                />
              </div>

              {/* SEO Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-border/70 bg-muted/20">
                <div className="space-y-1.5">
                  <label className="font-mono font-semibold text-foreground text-xs">Custom SEO Title</label>
                  <input
                    type="text"
                    value={editingPage.seoTitle || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                    placeholder="e.g. Privacy Policy & Data Standards | NexusBlog"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono font-semibold text-foreground text-xs">Custom SEO Meta Description</label>
                  <input
                    type="text"
                    value={editingPage.seoDescription || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                    placeholder="Search engine meta description for Google indexing..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Tab Bar for Editor / Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/70 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        activeTab === 'write'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Markdown Editor</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        activeTab === 'preview'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Live MDX Preview</span>
                      </span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                    GitHub Markdown &bull; Tables &bull; Code Syntax Highlight &bull; Mermaid Diagrams
                  </span>
                </div>

                {activeTab === 'write' ? (
                  <div className="space-y-1.5">
                    <textarea
                      required
                      value={editingPage.content}
                      onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                      rows={14}
                      placeholder="Write your markdown document content here..."
                      className="w-full rounded-2xl border border-border bg-background p-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none leading-relaxed shadow-xs min-h-[320px]"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-background p-6 max-h-[420px] overflow-y-auto">
                    <ClientMdxRenderer content={editingPage.content} />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/70 bg-muted/20">
              <div className="text-[11px] font-mono text-muted-foreground">
                Public URL preview: <strong className="text-foreground">{getPageLiveUrl(editingPage.slug)}</strong>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Page</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Page Warning Modal */}
      {deleteConfirmPage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeleteConfirmPage(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm font-mono text-foreground">Confirm Delete Page</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground font-mono">&quot;{deleteConfirmPage.title}&quot;</strong> (/{deleteConfirmPage.slug})? This will permanently remove the page and return 404 on its URL.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border/60">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmPage(null)}
                className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeletePage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs font-mono transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
