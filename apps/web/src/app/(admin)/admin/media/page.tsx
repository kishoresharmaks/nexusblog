'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Trash2,
  Search,
  Loader2,
  ExternalLink,
  Layers,
  Code,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { mediaApi } from '@/lib/api-client';
import { normalizeMediaUrl } from '@nexus/config';
import { toast } from 'sonner';

interface MediaVariant {
  name: 'original' | 'large' | 'medium' | 'small' | 'thumbnail' | string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  url: string;
}

interface MediaItem {
  id: string;
  originalName: string;
  url: string;
  size: string;
  rawSize?: number;
  dimensions: string;
  width?: number;
  height?: number;
  mimeType: string;
  uploadedAt: string;
  altText?: string;
  variants: MediaVariant[];
}


export default function AdminMediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [inspectingItem, setInspectingItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await mediaApi.getAll({
        search: search.trim() || undefined,
        limit: 50,
      });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setMediaList(
        items.map((m: any) => {
          let parsedVariants: MediaVariant[] = [];
          if (Array.isArray(m.variants)) {
            parsedVariants = m.variants.map((v: any) => ({
              ...v,
              url: normalizeMediaUrl(v.url),
            }));
          } else if (typeof m.variants === 'object' && m.variants !== null) {
            parsedVariants = Object.entries(m.variants).map(([k, v]: [string, any]) => ({
              name: k,
              url: normalizeMediaUrl(typeof v === 'string' ? v : v.url || ''),
              width: v.width,
              height: v.height,
              size: v.size,
              format: v.format || 'webp',
            }));
          }

          const rawMainUrl = m.url || parsedVariants.find((v) => v.name === 'original')?.url || '';
          const mainUrl = normalizeMediaUrl(rawMainUrl);

          return {
            id: m.id,
            originalName: m.originalName || m.filename || 'asset.webp',
            url: mainUrl,
            rawSize: m.size,
            size: m.size ? `${Math.round(m.size / 1024)} KB` : 'N/A',
            dimensions: m.width && m.height ? `${m.width} × ${m.height}` : 'Variable',
            width: m.width,
            height: m.height,
            mimeType: m.mimeType || 'image/webp',
            uploadedAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recently',
            altText: m.alt || m.originalName || 'NexusNation Asset',
            variants: parsedVariants,
          };
        })
      );
    } catch {
      // Fallback empty if backend has no items
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchMedia]);

  const handleCopyText = (key: string, text: string, label: string = 'URL') => {
    const cleanText = normalizeMediaUrl(text);
    navigator.clipboard.writeText(cleanText);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await mediaApi.delete(id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      if (inspectingItem?.id === id) setInspectingItem(null);
      toast.success(`Deleted ${name}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete media asset');
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    try {
      await mediaApi.upload(file, file.name);
      toast.success('Media uploaded and WebP variants generated successfully!');
      await fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload media asset');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getVariantLabel = (name: string) => {
    switch (name) {
      case 'large':
        return { label: 'Large (1280w)', role: 'Cover / Hero Header' };
      case 'medium':
        return { label: 'Medium (960w)', role: 'In-Article Diagrams' };
      case 'small':
        return { label: 'Small (640w)', role: 'Mobile / Cards' };
      case 'thumbnail':
        return { label: 'Thumb (320w)', role: 'Avatars & Sidebars' };
      default:
        return { label: 'Original', role: 'Full Resolution Source' };
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Media Library & Variant Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage uploaded technical diagrams, auto-generated WebP variants (Original, Large 1280w, Medium 960w, Small 640w, Thumb 320w), and CDN assets.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing & Generating WebP Variants...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Upload New Media</span>
            </>
          )}
        </button>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="rounded-2xl border-2 border-dashed border-border/80 bg-card p-8 text-center space-y-3 cursor-pointer hover:border-primary hover:bg-muted/20 transition-all shadow-xs"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">
            {uploading ? 'Processing WebP pipeline and generating variants...' : 'Click to select or drag and drop architecture diagrams & covers'}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            PNG, JPEG, WebP, SVG up to 10MB • Sharp auto-generates 1280w, 960w, 640w & 320w WebP variants with blurhash
          </p>
        </div>
      </div>

      {/* Media Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground font-mono">
              All Media Assets ({mediaList.length})
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Sharp WebP Enabled
            </span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-mono">Loading media assets and variant mappings...</p>
          </div>
        ) : mediaList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mediaList.map((item) => {
              return (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-border/80 bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Image Preview Box */}
                  <div
                    className="h-44 bg-muted/30 border-b border-border/50 flex items-center justify-center p-3 relative overflow-hidden cursor-pointer"
                    onClick={() => setInspectingItem(item)}
                    title="Click to inspect all variants"
                  >
                    {item.url && (item.url.startsWith('http') || item.url.startsWith('/')) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.originalName}
                        crossOrigin="anonymous"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] bg-black/75 text-white px-2 py-0.5 rounded-md backdrop-blur-xs font-semibold">
                        {item.mimeType.split('/')[1]?.toUpperCase() || 'WEBP'}
                      </span>
                      {item.variants.length > 0 && (
                        <span className="font-mono text-[10px] bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <Layers className="h-2.5 w-2.5" />
                          {item.variants.length} Variants
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingItem(item);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/85 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-xs"
                      title="Inspect Variants & Details"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    </button>
                  </div>

                  {/* Details & Actions */}
                  <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-xs font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                          title={item.originalName}
                          onClick={() => setInspectingItem(item)}
                        >
                          {item.originalName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                        <span>{item.dimensions}</span>
                        <span>•</span>
                        <span>{item.size}</span>
                        <span>•</span>
                        <span>{item.uploadedAt}</span>
                      </div>
                    </div>

                    {/* Variant Pills with 1-Click Copy */}
                    {item.variants && item.variants.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                          <span className="font-semibold text-foreground">Available Variants:</span>
                          <span>Click to copy URL</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.variants.map((v) => {
                            const info = getVariantLabel(v.name);
                            const copyKey = `${item.id}-${v.name}`;
                            const isCopied = copiedKey === copyKey;
                            return (
                              <button
                                key={v.name}
                                type="button"
                                onClick={() => handleCopyText(copyKey, v.url, `${info.label} URL`)}
                                className={`px-2 py-1 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1 transition-all ${
                                  isCopied
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                                    : 'bg-muted/40 border-border hover:border-primary hover:bg-primary/5 text-foreground'
                                }`}
                                title={`${info.role} - Click to copy direct URL`}
                              >
                                {isCopied ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                                )}
                                <span>{v.name}</span>
                                {v.size ? (
                                  <span className="text-[9px] text-muted-foreground font-normal">
                                    ({Math.round(v.size / 1024)}KB)
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-muted-foreground bg-muted/20 px-2 py-1 rounded border border-border/40">
                        Single Original WebP
                      </div>
                    )}

                    {/* Bottom bar actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText(`orig-${item.id}`, item.url, 'Main URL')}
                          className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                        >
                          {copiedKey === `orig-${item.id}` ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copy Default
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setInspectingItem(item)}
                          className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:underline"
                        >
                          <Info className="h-3 w-3" /> Inspect
                        </button>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id, item.originalName)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card">
            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">No media assets found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Upload architecture diagrams and technical illustrations to generate optimized WebP variants.
            </p>
          </div>
        )}
      </div>

      {/* Asset & Variant Inspector Modal */}
      {inspectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectingItem(null);
          }}
        >
          <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground font-mono">
                    Asset & Resolution Inspector
                  </h3>
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {inspectingItem.originalName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Preview */}
              <div className="h-52 rounded-xl bg-muted/40 border border-border flex items-center justify-center p-3 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inspectingItem.url}
                  alt={inspectingItem.originalName}
                  crossOrigin="anonymous"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* General Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-border bg-muted/20">
                  <p className="text-[10px] font-mono text-muted-foreground">Original Dimensions</p>
                  <p className="text-xs font-bold font-mono text-foreground mt-0.5">
                    {inspectingItem.dimensions}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-muted/20">
                  <p className="text-[10px] font-mono text-muted-foreground">Total File Size</p>
                  <p className="text-xs font-bold font-mono text-foreground mt-0.5">
                    {inspectingItem.size}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-muted/20">
                  <p className="text-[10px] font-mono text-muted-foreground">MIME Format</p>
                  <p className="text-xs font-bold font-mono text-foreground mt-0.5">
                    {inspectingItem.mimeType}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-muted/20">
                  <p className="text-[10px] font-mono text-muted-foreground">Generated Variants</p>
                  <p className="text-xs font-bold font-mono text-primary mt-0.5">
                    {inspectingItem.variants.length} Resolutions
                  </p>
                </div>
              </div>

              {/* Variants Table / List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Available Resolution Variants & Usage Guidelines</span>
                </h4>

                <div className="space-y-2.5">
                  {inspectingItem.variants && inspectingItem.variants.length > 0 ? (
                    inspectingItem.variants.map((variant) => {
                      const meta = getVariantLabel(variant.name);
                      const keyUrl = `modal-url-${variant.name}`;
                      const keyMd = `modal-md-${variant.name}`;
                      const markdownSnippet = `![${inspectingItem.altText || inspectingItem.originalName}](${variant.url})`;

                      return (
                        <div
                          key={variant.name}
                          className="p-3.5 rounded-xl border border-border bg-muted/10 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-foreground">
                                {meta.label}
                              </span>
                              <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                WebP
                              </span>
                              {variant.size && (
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {Math.round(variant.size / 1024)} KB
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Recommended usage: <strong className="text-foreground">{meta.role}</strong>
                            </p>
                            <p className="text-[11px] font-mono text-muted-foreground break-all">
                              {variant.url}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyText(keyUrl, variant.url, `${meta.label} URL`)}
                              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-mono font-medium hover:border-primary hover:text-primary transition-all flex items-center gap-1 shadow-xs"
                            >
                              {copiedKey === keyUrl ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>Copy URL</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(keyMd, markdownSnippet, 'Markdown syntax')
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-mono font-medium hover:border-primary hover:text-primary transition-all flex items-center gap-1 shadow-xs"
                              title="Copy ![alt](url) markdown syntax"
                            >
                              {copiedKey === keyMd ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Code className="h-3 w-3" />
                              )}
                              <span>Copy MDX</span>
                            </button>

                            <a
                              href={variant.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary transition-all shadow-xs"
                              title="Open variant in new tab"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3.5 rounded-xl border border-border bg-muted/10 flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">
                        Single Original WebP: {inspectingItem.url}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText('single-orig', inspectingItem.url, 'Asset URL')
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-mono font-medium hover:border-primary flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy URL</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-mono font-semibold hover:bg-muted transition-colors"
              >
                Close Inspector
              </button>

              <button
                type="button"
                onClick={() => handleDelete(inspectingItem.id, inspectingItem.originalName)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-mono font-semibold transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
