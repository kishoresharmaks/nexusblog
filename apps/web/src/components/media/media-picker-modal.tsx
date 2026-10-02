'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  Copy,
  X,
  Loader2,
  Link as LinkIcon,
  FolderOpen,
  ShieldCheck,
} from 'lucide-react';
import { mediaApi } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export interface MediaVariant {
  name: 'original' | 'large' | 'medium' | 'small' | 'thumbnail' | string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  url: string;
}

export interface MediaItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: string;
  dimensions: string;
  url: string;
  altText?: string;
  uploadedAt: string;
  variants?: MediaVariant[];
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, altText?: string) => void;
  title?: string;
  actionLabel?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Media Image Picker',
  actionLabel = 'Select Image',
}: MediaPickerModalProps) {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>(
    isAuthenticated ? 'library' : 'upload',
  );

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedVariantUrl, setSelectedVariantUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Direct URL state
  const [customUrl, setCustomUrl] = useState('');
  const [customAlt, setCustomAlt] = useState('');

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // Sync tab if auth state changes
  useEffect(() => {
    if (!isAuthenticated && activeTab === 'library') {
      setActiveTab('upload');
    }
  }, [isAuthenticated, activeTab]);

  // When selectedItem changes, pick the best variant URL
  useEffect(() => {
    if (selectedItem) {
      const isCover = actionLabel.toLowerCase().includes('cover') || title.toLowerCase().includes('cover');
      const vars = selectedItem.variants || [];
      if (vars.length > 0) {
        if (isCover) {
          const large = vars.find((v) => v.name === 'large');
          const orig = vars.find((v) => v.name === 'original');
          setSelectedVariantUrl(large?.url || orig?.url || selectedItem.url);
        } else {
          const medium = vars.find((v) => v.name === 'medium');
          const large = vars.find((v) => v.name === 'large');
          const orig = vars.find((v) => v.name === 'original');
          setSelectedVariantUrl(medium?.url || large?.url || orig?.url || selectedItem.url);
        }
      } else {
        setSelectedVariantUrl(selectedItem.url);
      }
    } else {
      setSelectedVariantUrl('');
    }
  }, [selectedItem, actionLabel, title]);

  const fetchMedia = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await mediaApi.getAll({ search: search || undefined, limit: 30 });
      if (res && Array.isArray(res.items)) {
        setMediaList(
          res.items.map((item: any) => ({
            id: item.id,
            originalName: item.originalName || item.filename || 'Untitled Asset',
            mimeType: item.mimeType || 'image/webp',
            size:
              item.sizeFormatted || (item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'Unknown'),
            dimensions:
              item.width && item.height ? `${item.width}x${item.height}` : 'Original',
            url: item.url || item.variants?.original?.url || item.variants?.medium?.url || '',
            altText: item.altText || item.alt || '',
            uploadedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently',
            variants: Array.isArray(item.variants)
              ? item.variants
              : typeof item.variants === 'object' && item.variants !== null
              ? Object.entries(item.variants).map(([k, v]: [string, any]) => ({
                  name: k,
                  url: v.url || v,
                  width: v.width,
                  height: v.height,
                  size: v.size,
                  format: v.format,
                }))
              : [],
          })),
        );
      }
    } catch {
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search]);

  useEffect(() => {
    if (isOpen && isAuthenticated && activeTab === 'library') {
      fetchMedia();
    }
  }, [isOpen, isAuthenticated, activeTab, fetchMedia]);

  const processUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml|avif)$/)) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP, GIF, SVG, AVIF)');
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await mediaApi.upload(file, file.name.split('.')[0]);
      toast.success('Image successfully uploaded!');
      const uploadedUrl =
        uploaded.url || uploaded.variants?.original?.url || uploaded.variants?.[0]?.url;

      if (uploadedUrl) {
        const item: MediaItem = {
          id: uploaded.id || 'new',
          originalName: uploaded.originalName || file.name,
          mimeType: uploaded.mimeType || file.type,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          dimensions: uploaded.width ? `${uploaded.width}x${uploaded.height}` : 'Original',
          url: uploadedUrl,
          altText: uploaded.alt || file.name,
          uploadedAt: 'Just now',
        };
        setSelectedItem(item);
        if (isAuthenticated) {
          fetchMedia();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload media image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleCopyUrl = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    toast.success('Image URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmSelection = () => {
    if (activeTab === 'url') {
      if (!customUrl.trim()) {
        toast.error('Please enter a valid image URL');
        return;
      }
      onSelect(customUrl.trim(), customAlt.trim() || 'Article Image');
      onClose();
      return;
    }

    if (selectedItem) {
      const finalUrl = selectedVariantUrl || selectedItem.url;
      onSelect(finalUrl, selectedItem.altText || selectedItem.originalName);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground font-mono">{title}</h3>
              <p className="text-xs text-muted-foreground">
                {isAuthenticated
                  ? 'Browse your personal media library, choose image variants, or upload new assets.'
                  : 'Upload images directly for your guest article or paste an image URL.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 py-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'library'
                    ? 'bg-background text-foreground font-bold shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5 text-primary" />
                <span>My Media Library</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-background text-foreground font-bold shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <Upload className="h-3.5 w-3.5 text-primary" />
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-background text-foreground font-bold shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5 text-primary" />
              <span>External URL</span>
            </button>
          </div>

          {!isAuthenticated && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Guest Upload Mode</span>
            </span>
          )}
        </div>

        {/* Tab 1: Library (Authenticated Only) */}
        {activeTab === 'library' && isAuthenticated && (
          <div className="flex-1 flex flex-col min-h-[340px] overflow-hidden">
            {/* Search Bar */}
            <div className="p-3.5 border-b border-border/60 bg-muted/10 flex items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter uploaded media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
                />
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-xs shrink-0">
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>{isUploading ? 'Uploading...' : 'Upload Asset'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-card space-y-4">
              {loading ? (
                <div className="h-56 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-mono">Loading your media assets...</p>
                </div>
              ) : mediaList.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {mediaList.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-md'
                              : 'border-border bg-background hover:border-foreground/30 hover:shadow-xs'
                          }`}
                        >
                          <div className="h-28 bg-muted/40 flex items-center justify-center p-2 relative overflow-hidden">
                            {item.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.url}
                                alt={item.originalName}
                                crossOrigin="anonymous"
                                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            )}
                            {isSelected && (
                              <div className="absolute top-2 left-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          <div className="p-2 space-y-0.5">
                            <p
                              className="text-xs font-semibold text-foreground truncate"
                              title={item.originalName}
                            >
                              {item.originalName}
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                              <span>{item.dimensions}</span>
                              <span>{item.size}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleCopyUrl(e, item)}
                            className="absolute bottom-2 right-2 p-1 rounded bg-card/80 text-muted-foreground hover:text-foreground border border-border/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy URL"
                          >
                            {copiedId === item.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Item Variant & Resolution Picker */}
                  {selectedItem && selectedItem.variants && selectedItem.variants.length > 0 && (
                    <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-primary" />
                          <span>Choose Resolution Variant for: {selectedItem.originalName}</span>
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {selectedItem.variants.length} WebP Variants Available
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {selectedItem.variants.map((v) => {
                          const isCurrent =
                            (selectedVariantUrl || selectedItem.url) === v.url;
                          const getLabel = (name: string) => {
                            switch (name) {
                              case 'large':
                                return { label: 'Large', usage: 'Cover / Hero (1280w)' };
                              case 'medium':
                                return { label: 'Medium', usage: 'Article Body (960w)' };
                              case 'small':
                                return { label: 'Small', usage: 'Card / Mobile (640w)' };
                              case 'thumbnail':
                                return { label: 'Thumbnail', usage: 'Avatar (320w)' };
                              default:
                                return { label: 'Original', usage: 'Full Resolution' };
                            }
                          };
                          const info = getLabel(v.name);
                          return (
                            <button
                              key={v.name}
                              type="button"
                              onClick={() => setSelectedVariantUrl(v.url)}
                              className={`p-2 rounded-lg border text-left transition-all ${
                                isCurrent
                                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                  : 'border-border bg-card hover:bg-muted/60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold font-mono text-foreground">
                                  {info.label}
                                </span>
                                {isCurrent && <Check className="h-3 w-3 text-primary" />}
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                {info.usage}
                              </p>
                              {v.size && (
                                <p className="text-[9px] font-mono text-primary/80 mt-0.5">
                                  {(v.size / 1024).toFixed(0)} KB • WebP
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed border-border text-center p-6 bg-muted/10">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">No media assets found</p>
                  <p className="text-[11px] text-muted-foreground">
                    Upload an architecture diagram, illustration, or screenshot above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Direct File Upload */}
        {activeTab === 'upload' && (
          <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center space-y-4 cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 bg-muted/10 hover:bg-muted/20'
              }`}
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : (
                  <Upload className="h-7 w-7" />
                )}
              </div>

              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-bold text-foreground">
                  {isUploading
                    ? 'Processing and generating optimized WebP variants...'
                    : 'Drag & drop your image here, or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WebP, GIF, SVG, AVIF up to 10MB
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-sm">
                <Upload className="h-4 w-4" />
                <span>Browse From Computer</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Selected / Uploaded Preview & Variants */}
            {selectedItem && (
              <div className="space-y-3">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-background border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedVariantUrl || selectedItem.url}
                        alt={selectedItem.originalName}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {selectedItem.originalName}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        Ready to insert • {selectedItem.size}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-primary font-semibold flex items-center gap-1 shrink-0">
                    <Check className="h-4 w-4" /> Selected
                  </span>
                </div>

                {/* Variant Selector for newly uploaded item */}
                {selectedItem.variants && selectedItem.variants.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2">
                    <span className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                      <span>Select Resolution Variant:</span>
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {selectedItem.variants.map((v) => {
                        const isCurrent =
                          (selectedVariantUrl || selectedItem.url) === v.url;
                        const getLabel = (name: string) => {
                          switch (name) {
                            case 'large':
                              return { label: 'Large', usage: 'Cover / Hero (1280w)' };
                            case 'medium':
                              return { label: 'Medium', usage: 'Article Body (960w)' };
                            case 'small':
                              return { label: 'Small', usage: 'Card / Mobile (640w)' };
                            case 'thumbnail':
                              return { label: 'Thumbnail', usage: 'Avatar (320w)' };
                            default:
                              return { label: 'Original', usage: 'Full Resolution' };
                          }
                        };
                        const info = getLabel(v.name);
                        return (
                          <button
                            key={v.name}
                            type="button"
                            onClick={() => setSelectedVariantUrl(v.url)}
                            className={`p-2 rounded-lg border text-left transition-all ${
                              isCurrent
                                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                : 'border-border bg-card hover:bg-muted/60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-mono text-foreground">
                                {info.label}
                              </span>
                              {isCurrent && <Check className="h-3 w-3 text-primary" />}
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {info.usage}
                            </p>
                            {v.size && (
                              <p className="text-[9px] font-mono text-primary/80 mt-0.5">
                                {(v.size / 1024).toFixed(0)} KB • WebP
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === 'url' && (
          <div className="p-6 sm:p-8 space-y-5 flex-1 overflow-y-auto">
            <div className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-foreground">
                  Image CDN / Web URL *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or https://cdn.example.com/diagram.png"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs font-mono text-foreground focus:border-primary focus:outline-none shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-foreground">
                  Alt Text / Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed lock consensus architecture"
                  value={customAlt}
                  onChange={(e) => setCustomAlt(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none shadow-xs"
                />
              </div>

              {customUrl && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono text-muted-foreground">Live URL Preview:</span>
                  <div className="h-40 rounded-xl border border-border bg-muted/20 flex items-center justify-center p-3 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customUrl}
                      alt={customAlt || 'Preview'}
                      className="max-h-full max-w-full object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-muted-foreground truncate max-w-sm">
            {activeTab === 'url' ? (
              customUrl ? (
                <span>URL Entered</span>
              ) : (
                <span>Paste image URL above</span>
              )
            ) : selectedItem ? (
              <span>
                Selected:{' '}
                <strong className="text-foreground">{selectedItem.originalName}</strong>
              </span>
            ) : (
              <span>Select or upload an image above</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={activeTab === 'url' ? !customUrl.trim() : !selectedItem}
              onClick={handleConfirmSelection}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{actionLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

