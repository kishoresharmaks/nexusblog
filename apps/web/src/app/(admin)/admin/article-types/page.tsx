'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  AlertTriangle,
  FolderTree,
  Cpu,
  Layers,
  Lock,
  Unlock,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { articleTypesApi } from '@/lib/api-client';

interface ArticleTypeItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  badgeColor?: string;
  order?: number;
  articleCount?: number;
}

const BADGE_COLORS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  blue: { label: 'Blue', bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/30' },
  violet: { label: 'Violet', bg: 'bg-violet-500/10', text: 'text-violet-500 dark:text-violet-400', border: 'border-violet-500/30' },
  emerald: { label: 'Emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/30' },
  amber: { label: 'Amber', bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/30' },
  rose: { label: 'Rose', bg: 'bg-rose-500/10', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/30' },
  cyan: { label: 'Cyan', bg: 'bg-cyan-500/10', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-500/30' },
  indigo: { label: 'Indigo', bg: 'bg-indigo-500/10', text: 'text-indigo-500 dark:text-indigo-400', border: 'border-indigo-500/30' },
  teal: { label: 'Teal', bg: 'bg-teal-500/10', text: 'text-teal-500 dark:text-teal-400', border: 'border-teal-500/30' },
  sky: { label: 'Sky', bg: 'bg-sky-500/10', text: 'text-sky-500 dark:text-sky-400', border: 'border-sky-500/30' },
  purple: { label: 'Purple', bg: 'bg-purple-500/10', text: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/30' },
};

export default function AdminArticleTypesPage() {
  const [types, setTypes] = useState<ArticleTypeItem[]>([]);
  const [search, setSearch] = useState('');
  const [editingType, setEditingType] = useState<ArticleTypeItem | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<ArticleTypeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlugLocked, setIsSlugLocked] = useState(true);

  const loadTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await articleTypesApi.getAll();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load article types:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const generateSlug = (text: string) => {
    return text
      .toUpperCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s-]+/g, '_');
  };

  const filtered = types.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())),
  );

  const handleOpenNew = () => {
    setEditingType({
      id: '',
      name: '',
      slug: '',
      description: '',
      badgeColor: 'blue',
      order: types.length + 1,
      articleCount: 0,
    });
    setIsSlugLocked(true);
    setIsNew(true);
  };

  const handleOpenEdit = (item: ArticleTypeItem) => {
    setEditingType({ ...item });
    setIsSlugLocked(false);
    setIsNew(false);
  };

  const handleNameChange = (name: string) => {
    if (!editingType) return;
    setEditingType({
      ...editingType,
      name,
      slug: isSlugLocked ? generateSlug(name) : editingType.slug,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType?.name.trim()) {
      toast.error('Article type name is required');
      return;
    }
    if (!editingType?.slug.trim()) {
      toast.error('Article type slug is required');
      return;
    }

    const payload: any = {
      name: editingType.name.trim(),
      slug: editingType.slug.trim().toUpperCase().replace(/[\s-]+/g, '_'),
      description: editingType.description?.trim() || undefined,
      badgeColor: editingType.badgeColor?.trim() || 'blue',
      order: Number(editingType.order) || 0,
    };

    try {
      if (isNew) {
        await articleTypesApi.create(payload);
        toast.success(`Article Type "${editingType.name}" created successfully`);
      } else {
        await articleTypesApi.update(editingType.id, payload);
        toast.success(`Article Type "${editingType.name}" updated successfully`);
      }
      await loadTypes();
      setEditingType(null);
    } catch (err: any) {
      const msg = err.error?.details?.join(', ') || err.message || 'Failed to save article type';
      toast.error(msg);
    }
  };

  const confirmDeleteType = async () => {
    if (!deleteConfirmType) return;
    setIsDeleting(true);
    try {
      await articleTypesApi.delete(deleteConfirmType.id);
      await loadTypes();
      toast.success(`Article Type "${deleteConfirmType.name}" deleted`);
      setDeleteConfirmType(null);
    } catch (err: any) {
      const msg = err.error?.details?.join(', ') || err.message || 'Failed to delete article type';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Article Types & Blueprints
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage structural article blueprints (Tutorial, System Design, Benchmark, Whitepaper) used across the editor and directory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <FolderTree className="h-3.5 w-3.5" />
            <span>Categories</span>
          </Link>
          <Link
            href="/admin/technologies"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Technology Hubs</span>
          </Link>
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Article Type</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter article types by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
          />
        </div>
        <p className="text-xs font-mono text-muted-foreground self-start sm:self-auto">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {types.length} article blueprints
        </p>
      </div>

      {/* Types Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-mono text-muted-foreground">Loading article types...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-muted/10 p-8 space-y-3">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="font-bold text-sm text-foreground">No Article Types Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? 'No types match your filter query.' : 'Create your first structural article type blueprint.'}
          </p>
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-medium hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Article Type</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const colorMeta = BADGE_COLORS[item.badgeColor || 'blue'] || BADGE_COLORS.blue;
            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-border/80 bg-card p-5 space-y-4 hover:border-foreground/20 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border}`}
                        >
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                          #{item.order ?? 0}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground pt-0.5">
                        Code: <code className="text-foreground">{item.slug}</code>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit Article Type"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmType(item)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Delete Article Type"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs font-mono text-muted-foreground">
                  <span>
                    <strong className="text-foreground">{item.articleCount ?? 0}</strong> Published Articles
                  </span>
                  <span className="text-[10px] text-muted-foreground/80">
                    Active in Editor
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingType(null);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm font-mono text-foreground">
                  {isNew ? 'New Article Type' : `Edit Article Type: ${editingType.name}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingType(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono font-semibold text-foreground">Type Label / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architecture Radar, Whitepaper"
                    value={editingType.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-mono font-semibold text-foreground">Internal Slug / Code *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextLocked = !isSlugLocked;
                        setIsSlugLocked(nextLocked);
                        if (nextLocked && editingType.name) {
                          setEditingType({ ...editingType, slug: generateSlug(editingType.name) });
                        }
                      }}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      {isSlugLocked ? (
                        <>
                          <Lock className="h-2.5 w-2.5 text-primary" />
                          <span className="text-primary font-semibold">Auto</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-2.5 w-2.5 text-amber-500" />
                          <span className="text-amber-500 font-semibold">Custom</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ARCHITECTURE_RADAR"
                    value={editingType.slug}
                    onChange={(e) => {
                      setIsSlugLocked(false);
                      setEditingType({
                        ...editingType,
                        slug: e.target.value.toUpperCase().replace(/[\s-]+/g, '_'),
                      });
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-mono font-semibold text-foreground">Description / Guidelines</label>
                <textarea
                  rows={2}
                  placeholder="Explain when authors should choose this structural article type..."
                  value={editingType.description || ''}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              {/* Badge Theme Color & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-mono font-semibold text-foreground">Badge Accent Color</label>
                  <select
                    value={editingType.badgeColor || 'blue'}
                    onChange={(e) => setEditingType({ ...editingType, badgeColor: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none capitalize"
                  >
                    {Object.keys(BADGE_COLORS).map((colorKey) => (
                      <option key={colorKey} value={colorKey}>
                        {BADGE_COLORS[colorKey].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono font-semibold text-foreground">Display Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={editingType.order ?? 0}
                    onChange={(e) =>
                      setEditingType({ ...editingType, order: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Live Badge Preview */}
              <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block font-semibold">
                  Live UI Badge Preview:
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  {(() => {
                    const colorMeta = BADGE_COLORS[editingType.badgeColor || 'blue'] || BADGE_COLORS.blue;
                    return (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-mono font-bold border ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border}`}
                      >
                        {editingType.name || 'Sample Article Type'}
                      </span>
                    );
                  })()}
                  <span className="text-[11px] font-mono text-muted-foreground">
                    (How this tag appears on feed cards & article headers)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingType(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isNew ? 'Create Type' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeleteConfirmType(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-card p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm font-mono text-foreground">Delete Article Type</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground">&quot;{deleteConfirmType.name}&quot;</strong>? This action cannot be undone if articles are linked to this type.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border/60">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmType(null)}
                className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteType}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs font-mono transition-colors shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
