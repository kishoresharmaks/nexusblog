'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Tag as TagIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  Hash,
  FileText,
  Save,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { tagsApi } from '@/lib/api-client';

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount?: number;
  _count?: { articles: number };
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<TagItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tagsApi.getAll();
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tags:', err);
      toast.error('Failed to load tags taxonomy');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const filtered = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenNew = () => {
    setEditingTag({
      id: '',
      name: '',
      slug: '',
      description: '',
      articleCount: 0,
    });
    setIsNew(true);
  };

  const handleOpenEdit = (t: TagItem) => {
    setEditingTag(t);
    setIsNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag?.name.trim()) {
      toast.error('Please provide a tag name');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: editingTag.name.trim(),
        slug: editingTag.slug.trim() || generateSlug(editingTag.name),
        description: editingTag.description?.trim() || undefined,
      };

      if (isNew) {
        await tagsApi.create(payload);
        toast.success('Tag created successfully');
      } else {
        await tagsApi.update(editingTag.id, payload);
        toast.success('Tag updated successfully');
      }
      await loadTags();
      setEditingTag(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save tag');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTag) return;
    setIsDeleting(true);
    try {
      await tagsApi.delete(deleteConfirmTag.id);
      setTags((prev) => prev.filter((t) => t.id !== deleteConfirmTag.id));
      toast.success(`Deleted tag: #${deleteConfirmTag.slug}`);
      setDeleteConfirmTag(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete tag');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalUsages = tags.reduce(
    (acc, t) => acc + (t.articleCount ?? t._count?.articles ?? 0),
    0,
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tags Taxonomy Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage granular technical tags, normalize duplicate naming, and inspect usage counts across publications.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Tag</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Total Unique Tags</span>
          <p className="text-2xl font-mono font-extrabold text-foreground">{tags.length}</p>
          <span className="text-[11px] font-mono text-muted-foreground">Active taxonomy entries</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Total Tag Associations</span>
          <p className="text-2xl font-mono font-extrabold text-emerald-400">{totalUsages}</p>
          <span className="text-[11px] font-mono text-emerald-500 font-semibold">Across articles & guides</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Average Tags per Article</span>
          <p className="text-2xl font-mono font-extrabold text-primary">
            {tags.length > 0 ? (totalUsages / Math.max(1, tags.length)).toFixed(1) : '0'}
          </p>
          <span className="text-[11px] font-mono text-muted-foreground">Index density</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tags by name, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none font-mono"
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          Showing {filtered.length} of {tags.length} tags
        </span>
      </div>

      {/* Tags Table */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2 text-muted-foreground font-mono text-xs">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p>Loading tags...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-muted/10">
          <TagIcon className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No tags found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? 'Try searching with different keywords.' : 'Create your first tag to help organize technical articles.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-medium hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Create Tag
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 font-mono text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Tag Name & Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Article Usage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((t) => {
                  const count = t.articleCount ?? t._count?.articles ?? 0;
                  return (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                            <Hash className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="font-bold text-foreground">{t.name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">#{t.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground max-w-md truncate">
                        {t.description || <span className="italic text-muted-foreground/50">No description</span>}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                            count > 0
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <FileText className="h-3 w-3" />
                          {count} {count === 1 ? 'article' : 'articles'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit tag"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTag(t)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete tag"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingTag && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTag(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground font-mono">
                  {isNew ? 'Create New Tag' : 'Edit Tag'}
                </h3>
              </div>
              <button
                onClick={() => setEditingTag(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raft Consensus"
                  value={editingTag.name}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    setEditingTag((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: nameVal,
                            slug: isNew ? generateSlug(nameVal) : prev.slug,
                          }
                        : null,
                    );
                  }}
                  className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Tag Slug *
                </label>
                <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden px-3">
                  <span className="font-mono text-muted-foreground text-[11px] select-none">
                    #
                  </span>
                  <input
                    type="text"
                    required
                    value={editingTag.slug}
                    onChange={(e) =>
                      setEditingTag((prev) => (prev ? { ...prev, slug: generateSlug(e.target.value) } : null))
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
                  placeholder="Briefly describe what articles with this tag encompass..."
                  value={editingTag.description || ''}
                  onChange={(e) =>
                    setEditingTag((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
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
                  <span>{isSaving ? 'Saving...' : isNew ? 'Create Tag' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTag && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmTag(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Tag?</h3>
                <p className="text-xs text-muted-foreground">This action removes the tag from all articles.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">#{deleteConfirmTag.slug}</strong>?{' '}
              {deleteConfirmTag.articleCount ? `It is currently used in ${deleteConfirmTag.articleCount} articles.` : ''}
            </p>

            <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmTag(null)}
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
    </div>
  );
}
