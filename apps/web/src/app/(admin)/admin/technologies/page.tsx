'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  FolderTree,
  Database,
  Bookmark,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { technologiesApi } from '@/lib/api-client';
import { IconRenderer } from '@/components/common/icon-renderer';
import { IconSelectorModal } from '@/components/common/icon-selector-modal';

interface TechnologyItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  officialUrl?: string;
  docsUrl?: string;
  articleCount?: number;
}

export default function AdminTechnologiesPage() {
  const [technologies, setTechnologies] = useState<TechnologyItem[]>([]);
  const [search, setSearch] = useState('');
  const [editingTech, setEditingTech] = useState<TechnologyItem | null>(null);
  const [deleteConfirmTech, setDeleteConfirmTech] = useState<TechnologyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [isSlugLocked, setIsSlugLocked] = useState(true);

  const loadTechnologies = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await technologiesApi.getAll();
      setTechnologies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load technologies:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTechnologies();
  }, [loadTechnologies]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const filtered = technologies.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())),
  );

  const handleOpenNew = () => {
    setEditingTech({
      id: '',
      name: '',
      slug: '',
      description: '',
      logo: 'tech:docker',
      officialUrl: '',
      docsUrl: '',
      articleCount: 0,
    });
    setIsSlugLocked(true);
    setIsNew(true);
  };

  const handleOpenEdit = (tech: TechnologyItem) => {
    setEditingTech({ ...tech });
    setIsSlugLocked(false);
    setIsNew(false);
  };

  const handleNameChange = (name: string) => {
    if (!editingTech) return;
    setEditingTech({
      ...editingTech,
      name,
      slug: isSlugLocked ? generateSlug(name) : editingTech.slug,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech?.name.trim()) {
      toast.error('Technology name is required');
      return;
    }
    if (!editingTech?.slug.trim()) {
      toast.error('Technology slug is required');
      return;
    }

    const payload: any = {
      name: editingTech.name.trim(),
      slug: editingTech.slug.trim().toLowerCase(),
      description: editingTech.description?.trim() || undefined,
      logo: editingTech.logo?.trim() || undefined,
      officialUrl: editingTech.officialUrl?.trim() || undefined,
      docsUrl: editingTech.docsUrl?.trim() || undefined,
    };

    try {
      if (isNew) {
        await technologiesApi.create(payload);
        toast.success(`Technology "${editingTech.name}" created successfully`);
      } else {
        await technologiesApi.update(editingTech.id, payload);
        toast.success(`Technology "${editingTech.name}" updated successfully`);
      }
      await loadTechnologies();
      setEditingTech(null);
    } catch (err: any) {
      const msg = err.error?.details?.join(', ') || err.message || 'Failed to save technology';
      toast.error(msg);
    }
  };

  const confirmDeleteTechnology = async () => {
    if (!deleteConfirmTech) return;
    setIsDeleting(true);
    try {
      await technologiesApi.delete(deleteConfirmTech.id);
      await loadTechnologies();
      toast.success(`Technology "${deleteConfirmTech.name}" deleted`);
      setDeleteConfirmTech(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete technology');
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
            <Cpu className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Technology Hubs & Infrastructure
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage infrastructure engines, frameworks, logos, and deep-dive hubs displayed across the homepage and technical directory.
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
            href="/admin/article-types"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Article Types</span>
          </Link>
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Technology Hub</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter technologies by name, slug, or tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
          />
        </div>
        <p className="text-xs font-mono text-muted-foreground self-start sm:self-auto">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {technologies.length} infrastructure hubs
        </p>
      </div>

      {/* Technologies Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-mono text-muted-foreground">Loading technology hubs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-muted/10 p-8 space-y-3">
          <Database className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="font-bold text-sm text-foreground">No Technology Hubs Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? 'No technologies match your search query.' : 'Add your first infrastructure hub to showcase specialized deep dives.'}
          </p>
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-medium hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Technology</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tech) => (
            <div
              key={tech.id}
              className="group rounded-2xl border border-border/80 bg-card p-5 space-y-4 hover:border-foreground/20 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform p-2 text-primary">
                      <IconRenderer value={tech.logo} defaultIcon="Database" className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {tech.name}
                      </h3>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                        /{tech.slug}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(tech)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Edit Technology Hub"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTech(tech)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      title="Delete Technology Hub"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {tech.description || 'No description provided.'}
                </p>

                {/* External links */}
                <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground">
                  {tech.officialUrl && (
                    <a
                      href={tech.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Website</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                  {tech.docsUrl && (
                    <a
                      href={tech.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      <BookOpen className="h-2.5 w-2.5" />
                      <span>Documentation</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs font-mono text-muted-foreground">
                <span>
                  <strong className="text-foreground">{tech.articleCount ?? 0}</strong> Published Articles
                </span>
                <Link
                  href={`/technologies/${tech.slug}`}
                  target="_blank"
                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>View Public Hub</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingTech && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTech(null);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm font-mono text-foreground">
                  {isNew ? 'New Technology Hub' : `Edit Technology: ${editingTech.name}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingTech(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono font-semibold text-foreground">Technology Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apache Kafka, Docker, Redis"
                    value={editingTech.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-mono font-semibold text-foreground">URL Slug *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextLocked = !isSlugLocked;
                        setIsSlugLocked(nextLocked);
                        if (nextLocked && editingTech.name) {
                          setEditingTech({ ...editingTech, slug: generateSlug(editingTech.name) });
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
                    placeholder="e.g. kafka, docker, redis"
                    value={editingTech.slug}
                    onChange={(e) => {
                      setIsSlugLocked(false);
                      setEditingTech({ ...editingTech, slug: e.target.value });
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-mono font-semibold text-foreground">Description / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Concise overview of this framework or infrastructure tool..."
                  value={editingTech.description || ''}
                  onChange={(e) => setEditingTech({ ...editingTech, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              {/* Icon Selector Field */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Technology Icon / Logo</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-xs"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{editingTech.logo ? 'Change Icon' : 'Select Icon'}</span>
                  </button>
                </div>

                {editingTech.logo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 text-primary shrink-0">
                        <IconRenderer value={editingTech.logo} className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <span className="font-bold font-mono text-xs text-foreground block">
                          {editingTech.logo.replace(/^(tech:|lucide:)/, '')}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px] block">
                          {editingTech.logo}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsIconModalOpen(true)}
                        className="px-2.5 py-1 rounded-md border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono transition-colors"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTech({ ...editingTech, logo: '' })}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Remove Icon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="w-full py-4 border border-dashed border-border/80 hover:border-primary/50 rounded-xl flex items-center justify-center gap-2 bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground transition-all text-xs font-mono"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Click to choose from 50+ Tech Logos, System Icons, or Media Library</span>
                  </button>
                )}
              </div>

              {/* Official Website & Docs URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono font-semibold text-foreground">Official Website URL</label>
                  <input
                    type="url"
                    placeholder="https://kafka.apache.org"
                    value={editingTech.officialUrl || ''}
                    onChange={(e) => setEditingTech({ ...editingTech, officialUrl: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono font-semibold text-foreground">Documentation URL</label>
                  <input
                    type="url"
                    placeholder="https://kafka.apache.org/documentation"
                    value={editingTech.docsUrl || ''}
                    onChange={(e) => setEditingTech({ ...editingTech, docsUrl: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingTech(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isNew ? 'Create Hub' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTech && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeleteConfirmTech(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-card p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm font-mono text-foreground">Delete Technology Hub</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground">&quot;{deleteConfirmTech.name}&quot;</strong>? This action will remove the technology hub from the homepage and public directories.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border/60">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmTech(null)}
                className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteTechnology}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs font-mono transition-colors shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Selector Modal */}
      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        selectedIcon={editingTech?.logo || ''}
        title="Choose Technology Icon or Logo"
        onSelect={(iconKey) => {
          if (editingTech) {
            setEditingTech({ ...editingTech, logo: iconKey });
          }
          toast.success('Technology icon updated!');
        }}
      />
    </div>
  );
}
