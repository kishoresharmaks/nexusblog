'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  BookOpen,
  Image as ImageIcon,
  Save,
  X,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ListOrdered,
} from 'lucide-react';
import { toast } from 'sonner';
import { seriesApi } from '@/lib/api-client';
import { MediaPickerModal } from '@/components/media/media-picker-modal';

interface SeriesItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  published: boolean;
  articleCount?: number;
  articles?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminSeriesPage() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesItem | null>(null);
  const [inspectingSeries, setInspectingSeries] = useState<SeriesItem | null>(null);
  const [deleteConfirmSeries, setDeleteConfirmSeries] = useState<SeriesItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSeries = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: any = await seriesApi.getAll(true);
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setSeriesList(items);
    } catch (err) {
      console.error('Failed to load series:', err);
      setSeriesList([]);
      toast.error('Failed to load learning series');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const safeSeriesList = Array.isArray(seriesList) ? seriesList : [];
  const filtered = safeSeriesList.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.slug?.toLowerCase().includes(search.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenNew = () => {
    setEditingSeries({
      id: '',
      title: '',
      slug: '',
      description: '',
      coverImage: '',
      published: true,
      articleCount: 0,
    });
    setIsNew(true);
  };

  const handleOpenEdit = async (s: SeriesItem) => {
    setIsLoading(true);
    try {
      const full = await seriesApi.getBySlug(s.slug).catch(() => s);
      setEditingSeries(full);
      setIsNew(false);
    } catch {
      setEditingSeries(s);
      setIsNew(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectChapters = async (s: SeriesItem) => {
    try {
      const full = await seriesApi.getBySlug(s.slug);
      setInspectingSeries(full);
    } catch {
      setInspectingSeries(s);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeries?.title.trim()) {
      toast.error('Please provide a series title');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: editingSeries.title.trim(),
        slug: editingSeries.slug.trim() || generateSlug(editingSeries.title),
        description: editingSeries.description?.trim() || undefined,
        coverImage: editingSeries.coverImage?.trim() || undefined,
        published: editingSeries.published,
      };

      if (isNew) {
        await seriesApi.create(payload);
        toast.success('Series created successfully');
      } else {
        await seriesApi.update(editingSeries.id, payload);
        toast.success('Series updated successfully');
      }
      await loadSeries();
      setEditingSeries(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save series');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublished = async (s: SeriesItem) => {
    try {
      await seriesApi.update(s.id, { published: !s.published });
      setSeriesList((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, published: !item.published } : item)),
      );
      toast.success(`Series marked as ${!s.published ? 'Published' : 'Draft'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle published status');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmSeries) return;
    setIsDeleting(true);
    try {
      await seriesApi.delete(deleteConfirmSeries.id);
      setSeriesList((prev) => prev.filter((s) => s.id !== deleteConfirmSeries.id));
      toast.success(`Deleted series: ${deleteConfirmSeries.title}`);
      setDeleteConfirmSeries(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete series');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPublished = safeSeriesList.filter((s) => s.published).length;
  const totalArticlesLinked = safeSeriesList.reduce((acc, s) => acc + (s.articleCount || 0), 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Series & Learning Paths
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Curate multi-chapter engineering guides, roadmaps, and ordered architectural deep-dives.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Series</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Total Learning Series</span>
          <p className="text-2xl font-mono font-extrabold text-foreground">{seriesList.length}</p>
          <span className="text-[11px] font-mono text-muted-foreground">Curated multi-part guides</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Published Series</span>
          <p className="text-2xl font-mono font-extrabold text-emerald-400">{totalPublished}</p>
          <span className="text-[11px] font-mono text-emerald-500 font-semibold">Live on portal</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Enclosed Chapters / Articles</span>
          <p className="text-2xl font-mono font-extrabold text-primary">{totalArticlesLinked}</p>
          <span className="text-[11px] font-mono text-muted-foreground">Sequenced technical guides</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search series by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none font-mono"
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          Showing {filtered.length} of {seriesList.length} series
        </span>
      </div>

      {/* Series Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2 text-muted-foreground font-mono text-xs">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p>Loading learning series...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-muted/10">
          <Layers className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No series found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? 'Try adjusting your search terms.' : 'Create your first multi-part technical series to guide engineers through complex architectures.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-medium hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Create Series
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col justify-between hover:border-border transition-all shadow-xs group"
            >
              {/* Cover Image Header */}
              <div className="relative h-36 w-full bg-muted/40 border-b border-border/60 overflow-hidden">
                {s.coverImage ? (
                  <img
                    src={s.coverImage}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 bg-gradient-to-br from-muted/30 to-muted/80">
                    <Layers className="h-10 w-10 mb-1" />
                    <span className="text-[10px] font-mono">No cover image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePublished(s)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                      s.published
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {s.published ? 'PUBLISHED' : 'DRAFT'}
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-primary font-bold inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {s.articleCount || 0} {(s.articleCount === 1 ? 'Chapter' : 'Chapters')}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      /series/{s.slug}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                    {s.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {s.description || 'No description provided for this series.'}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleInspectChapters(s)}
                    className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                    <span>View Chapters</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/series/${s.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      title="View on live portal"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit series"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmSeries(s)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete series"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Series Modal */}
      {editingSeries && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingSeries(null);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground font-mono">
                  {isNew ? 'Create New Learning Series' : 'Edit Series'}
                </h3>
              </div>
              <button
                onClick={() => setEditingSeries(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Series Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Masterclass"
                  value={editingSeries.title}
                  onChange={(e) => {
                    const titleVal = e.target.value;
                    setEditingSeries((prev) =>
                      prev
                        ? {
                            ...prev,
                            title: titleVal,
                            slug: isNew ? generateSlug(titleVal) : prev.slug,
                          }
                        : null,
                    );
                  }}
                  className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  URL Slug *
                </label>
                <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden px-3">
                  <span className="font-mono text-muted-foreground text-[11px] select-none">
                    /series/
                  </span>
                  <input
                    type="text"
                    required
                    value={editingSeries.slug}
                    onChange={(e) =>
                      setEditingSeries((prev) => (prev ? { ...prev, slug: generateSlug(e.target.value) } : null))
                    }
                    className="w-full bg-transparent py-2 pl-1 text-xs font-mono text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain the learning path, prerequisites, and key competencies covered..."
                  value={editingSeries.description || ''}
                  onChange={(e) =>
                    setEditingSeries((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Cover Image Picker */}
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Cover Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... or /media/cover.webp"
                    value={editingSeries.coverImage || ''}
                    onChange={(e) =>
                      setEditingSeries((prev) => (prev ? { ...prev, coverImage: e.target.value } : null))
                    }
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-mono text-foreground shrink-0 transition-colors"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Media Library</span>
                  </button>
                </div>
                {editingSeries.coverImage && (
                  <div className="relative mt-2 h-24 w-full rounded-lg border border-border/60 overflow-hidden bg-muted/20">
                    <img
                      src={editingSeries.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Published Switch */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                <div className="space-y-0.5">
                  <p className="font-mono font-bold text-foreground text-xs">Publish Status</p>
                  <p className="text-[11px] text-muted-foreground">
                    When active, this series is visible in public series directories.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSeries.published}
                    onChange={(e) =>
                      setEditingSeries((prev) => (prev ? { ...prev, published: e.target.checked } : null))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSeries(null)}
                  className="px-4 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-mono font-medium text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Saving...' : isNew ? 'Create Series' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapters Inspector Modal */}
      {inspectingSeries && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectingSeries(null);
          }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground font-mono">
                    Chapters in &quot;{inspectingSeries.title}&quot;
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Sequenced articles associated via Article Editor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingSeries(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {inspectingSeries.articles && inspectingSeries.articles.length > 0 ? (
                inspectingSeries.articles.map((art, idx) => (
                  <div
                    key={art.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                      <span className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {art.seriesOrder ?? idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{art.title}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                          {art.readingTime || 5} min read • By @{art.author?.username || 'nexus'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="px-2.5 py-1 text-xs font-mono rounded border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center space-y-2 bg-muted/10 rounded-xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground">
                    No articles currently assigned to this series.
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Open any article in the Article Editor and assign it to &quot;{inspectingSeries.title}&quot; with a sequence number.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border/40 flex justify-end">
              <button
                onClick={() => setInspectingSeries(null)}
                className="px-4 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-mono text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSeries && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmSeries(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Series?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete the series{' '}
              <strong className="text-foreground">&quot;{deleteConfirmSeries.title}&quot;</strong>? Any linked articles will remain intact in the database.
            </p>

            <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmSeries(null)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-mono text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-mono font-bold hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setEditingSeries((prev) => (prev ? { ...prev, coverImage: url } : null));
          setIsMediaPickerOpen(false);
          toast.success('Cover image selected');
        }}
      />
    </div>
  );
}
