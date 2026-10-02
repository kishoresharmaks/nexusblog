'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Search,
  Save,
  X,
  AlertTriangle,
  Cpu,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { categoriesApi } from '@/lib/api-client';
import { IconRenderer } from '@/components/common/icon-renderer';
import { IconSelectorModal } from '@/components/common/icon-selector-modal';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  order: number;
  articlesCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenNew = () => {
    setEditingCategory({
      id: '',
      name: '',
      slug: '',
      description: '',
      image: 'lucide:Layers',
      order: categories.length + 1,
      articlesCount: 0,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name.trim()) return;

    try {
      const payload: any = {
        name: editingCategory.name.trim(),
        slug: editingCategory.slug.trim(),
        description: editingCategory.description?.trim(),
        image: editingCategory.image?.trim() || undefined,
        order: editingCategory.order ?? 0,
      };

      if (isNew) {
        await categoriesApi.create(payload);
        toast.success('Category created successfully');
      } else {
        await categoriesApi.update(editingCategory.id, payload);
        toast.success('Category updated successfully');
      }
      await loadCategories();
      setEditingCategory(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirmCat) return;
    setIsDeleting(true);
    try {
      await categoriesApi.delete(deleteConfirmCat.id);
      await loadCategories();
      toast.success(`Category "${deleteConfirmCat.name}" deleted`);
      setDeleteConfirmCat(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Taxonomy & Categories
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage primary knowledge domains, slugs, display ordering, and category icons.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/technologies"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Technology Hubs</span>
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
          />
        </div>
        <p className="text-xs font-mono text-muted-foreground self-start sm:self-auto">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {categories.length} categories
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="group rounded-2xl border border-border/80 bg-card p-5 space-y-4 hover:border-foreground/20 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 text-primary shrink-0 group-hover:scale-105 transition-transform">
                    <IconRenderer value={cat.image} defaultIcon="Layers" className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="font-mono text-[10px] text-muted-foreground">/{cat.slug}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsNew(false);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmCat(cat)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="text-[10px] bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                Order #{cat.order}
              </span>
              <span className="text-[11px] text-primary font-semibold">
                {cat.articlesCount || 0} Articles
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Edit Modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCategory(null);
          }}
        >
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-foreground font-mono">
                  {isNew ? 'Create New Category' : `Edit Category: ${editingCategory.name}`}
                </h3>
                <p className="text-[11px] text-muted-foreground font-sans">
                  {isNew ? 'Define a new taxonomy topic domain and ordering.' : `Updating category attributes for ${editingCategory.name}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-mono font-semibold text-foreground text-xs">Category Name *</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingCategory({
                        ...editingCategory,
                        name: val,
                        slug: isNew ? val.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') : editingCategory.slug,
                      });
                    }}
                    placeholder="e.g. Distributed Systems"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono font-semibold text-foreground text-xs">URL Slug *</label>
                  <input
                    type="text"
                    value={editingCategory.slug}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    placeholder="e.g. distributed-systems"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground font-mono text-xs focus:border-primary focus:outline-none shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Icon Selector Field */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Category Icon</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-xs"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{editingCategory.image ? 'Change Icon' : 'Select Icon'}</span>
                  </button>
                </div>

                {editingCategory.image ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 text-primary shrink-0">
                        <IconRenderer value={editingCategory.image} className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <span className="font-bold font-mono text-xs text-foreground block">
                          {editingCategory.image.replace(/^(tech:|lucide:)/, '')}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px] block">
                          {editingCategory.image}
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
                        onClick={() => setEditingCategory({ ...editingCategory, image: '' })}
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
                    <span>Click to choose from 50+ System Icons & Tech Logos</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground text-xs">Description</label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={2}
                  placeholder="Brief summary of articles in this category..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none leading-relaxed shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-semibold text-foreground text-xs">Display Sort Order</label>
                <input
                  type="number"
                  value={editingCategory.order}
                  onChange={(e) => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none shadow-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Category Warning Modal */}
      {deleteConfirmCat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeleteConfirmCat(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm font-mono text-foreground">Confirm Delete Category</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground font-mono">&quot;{deleteConfirmCat.name}&quot;</strong>? This will remove the category from public filters and articles.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border/60">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmCat(null)}
                className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteCategory}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs font-mono transition-colors shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Selector Modal */}
      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        selectedIcon={editingCategory?.image || ''}
        title="Choose Category Icon"
        onSelect={(iconKey) => {
          if (editingCategory) {
            setEditingCategory({ ...editingCategory, image: iconKey });
          }
          toast.success('Category icon updated!');
        }}
      />
    </div>
  );
}
