'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  ExternalLink,
  Trash2,
  Eye,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Clock,
  Archive,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllArticles,
  deleteArticle,
  togglePublishArticle,
  ArticleData,
} from '@/lib/articles-data';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const refreshArticles = useCallback(() => {
    setArticles(getAllArticles());
  }, []);

  useEffect(() => {
    refreshArticles();
    window.addEventListener('nexus_articles_updated', refreshArticles);
    return () => window.removeEventListener('nexus_articles_updated', refreshArticles);
  }, [refreshArticles]);

  const filtered = articles.filter((art) => {
    const matchSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.slug.toLowerCase().includes(search.toLowerCase()) ||
      art.category.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || art.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string, title: string) => {
    deleteArticle(id);
    refreshArticles();
    toast.success(`Deleted article: ${title}`);
  };

  const handleTogglePublish = (id: string) => {
    const updated = togglePublishArticle(id);
    refreshArticles();
    toast.success(`Article status changed to ${updated.status}`);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Articles Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Create, edit, schedule, and publish technical guides with synchronized MDX rendering.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, slug, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['ALL', 'PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Data Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 font-mono text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Article Title & Slug</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Engagement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 min-w-[280px]">
                    <div className="space-y-0.5">
                      <Link
                        href={`/admin/articles/${item.id}/edit`}
                        className="font-bold text-foreground hover:text-primary transition-colors leading-snug line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="font-mono text-[11px] text-muted-foreground">/{item.slug}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    <span className="rounded bg-muted px-2 py-0.5 text-foreground font-semibold">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                    {item.difficulty}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {item.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" /> {item.bookmarks}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePublish(item.id)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold transition-all ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-muted text-muted-foreground border border-border hover:text-foreground'
                      }`}
                      title="Click to toggle status"
                    >
                      {item.status}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {item.publishedAt}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status === 'PUBLISHED' && (
                        <Link
                          href={`/articles/${item.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View live article"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/articles/${item.id}/edit`}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit article"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
