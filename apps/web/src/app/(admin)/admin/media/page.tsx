'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Copy, Check, Trash2, Search, ExternalLink, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  originalName: string;
  url: string;
  size: string;
  dimensions: string;
  mimeType: string;
  uploadedAt: string;
}

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    originalName: 'redis-rate-limiter-topology.png',
    url: '/uploads/redis-rate-limiter-topology.webp',
    size: '184 KB',
    dimensions: '1920 × 1080',
    mimeType: 'image/webp',
    uploadedAt: '2 days ago',
  },
  {
    id: 'm2',
    originalName: 'postgres-partitioning-flow.png',
    url: '/uploads/postgres-partitioning-flow.webp',
    size: '240 KB',
    dimensions: '2048 × 1152',
    mimeType: 'image/webp',
    uploadedAt: '5 days ago',
  },
  {
    id: 'm3',
    originalName: 'kafka-consumer-groups-rebalance.png',
    url: '/uploads/kafka-consumer-groups-rebalance.webp',
    size: '195 KB',
    dimensions: '1920 × 1080',
    mimeType: 'image/webp',
    uploadedAt: '1 week ago',
  },
];

export default function AdminMediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = mediaList.filter((m) =>
    m.originalName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Media URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    toast.success(`Deleted ${name}`);
  };

  const handleUploadSimulate = () => {
    const newItem: MediaItem = {
      id: `m_${Date.now()}`,
      originalName: `architecture-diagram-${Date.now().toString().slice(-4)}.png`,
      url: `/uploads/architecture-diagram-${Date.now().toString().slice(-4)}.webp`,
      size: '142 KB',
      dimensions: '1920 × 1080',
      mimeType: 'image/webp',
      uploadedAt: 'Just now',
    };
    setMediaList((prev) => [newItem, ...prev]);
    toast.success('Media uploaded and Sharp WebP variants generated');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Media Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage uploaded diagrams, architecture blueprints, WebP variants, and CDN assets.
          </p>
        </div>

        <button
          onClick={handleUploadSimulate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm self-start sm:self-auto"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={handleUploadSimulate}
        className="rounded-2xl border-2 border-dashed border-border/80 bg-card/40 p-8 text-center space-y-3 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Upload className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">
            Click to upload or drag and drop architecture diagrams
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            PNG, JPEG, WebP, SVG up to 10MB • Automatically converted to WebP with blurhash
          </p>
        </div>
      </div>

      {/* Media Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground font-mono">
            All Assets ({filtered.length})
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-border/70 bg-card overflow-hidden hover:border-border hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image Preview Box */}
              <div className="h-40 bg-muted/50 border-b border-border/40 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="h-16 w-16 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <span className="absolute top-2.5 right-2.5 font-mono text-[10px] bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                  {item.mimeType.split('/')[1]?.toUpperCase()}
                </span>
              </div>

              {/* Details & Actions */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground truncate">{item.originalName}</p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    <span>{item.dimensions}</span>
                    <span>•</span>
                    <span>{item.size}</span>
                    <span>•</span>
                    <span>{item.uploadedAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <button
                    onClick={() => handleCopyUrl(item.id, item.url)}
                    className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy CDN URL
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.originalName)}
                    className="p-1.5 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                    title="Delete asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
