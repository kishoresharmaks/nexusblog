'use client';

import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Layers, Search, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  articlesCount: number;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'c1', name: 'System Design', slug: 'system-design', description: 'Architectural blueprints, rate limiting, and scalability.', order: 1, articlesCount: 14 },
  { id: 'c2', name: 'Distributed Systems', slug: 'distributed-systems', description: 'Consensus, Raft, Paxos, and multi-region fault tolerance.', order: 2, articlesCount: 12 },
  { id: 'c3', name: 'Databases', slug: 'databases', description: 'Indexing, storage engines, sharding, and query planning.', order: 3, articlesCount: 9 },
  { id: 'c4', name: 'Backend Architecture', slug: 'backend', description: 'NestJS, Go, Spring Boot, and high-concurrency protocols.', order: 4, articlesCount: 8 },
  { id: 'c5', name: 'DevOps & Cloud', slug: 'devops', description: 'Kubernetes, Docker, eBPF, and cloud infrastructure.', order: 5, articlesCount: 6 },
  { id: 'c6', name: 'Performance', slug: 'performance', description: 'Benchmarking, profiling, memory leaks, and latency.', order: 6, articlesCount: 5 },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenNew = () => {
    setEditingCategory({
      id: `c_${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      order: categories.length + 1,
      articlesCount: 0,
    });
    setIsNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name.trim()) return;

    if (isNew) {
      setCategories((prev) => [...prev, editingCategory]);
      toast.success('Category created successfully');
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? editingCategory : c)),
      );
      toast.success('Category updated successfully');
    }

    setEditingCategory(null);
  };

  const handleDelete = (id: string, name: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success(`Category "${name}" deleted`);
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
            Manage primary knowledge domains, slugs, display ordering, and category metadata.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="rounded-xl border border-border/70 bg-card p-5 space-y-3 hover:border-border transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Order #{cat.order}
                </span>
                <span className="text-[11px] font-mono text-primary font-semibold">
                  {cat.articlesCount} Articles
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">{cat.name}</h3>
                <p className="font-mono text-[11px] text-muted-foreground">/{cat.slug}</p>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
            </div>

            <div className="pt-3 border-t border-border/40 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingCategory(cat);
                  setIsNew(false);
                }}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Edit category"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                title="Delete category"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-sm text-foreground font-mono">
                {isNew ? 'Create New Category' : 'Edit Category'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-mono font-semibold text-foreground">Category Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingCategory({
                      ...editingCategory,
                      name: val,
                      slug: val.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
                    });
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono font-semibold text-foreground">Slug</label>
                <input
                  type="text"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono text-[11px] focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono font-semibold text-foreground">Description</label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono font-semibold text-foreground">Display Order</label>
                <input
                  type="number"
                  value={editingCategory.order}
                  onChange={(e) => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-3.5 py-2 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
