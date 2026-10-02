'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  Check,
  Cpu,
  Database,
  Layers,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { LUCIDE_ICON_MAP, TECH_SVG_MAP, IconRenderer } from './icon-renderer';
import { MediaPickerModal } from '@/components/media/media-picker-modal';

interface IconSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconKey: string) => void;
  selectedIcon?: string;
  title?: string;
}

const LUCIDE_CATEGORIES: Record<string, { label: string; icons: string[] }> = {
  infrastructure: {
    label: 'Infrastructure & Compute',
    icons: ['Cpu', 'Server', 'Cloud', 'HardDrive', 'Terminal', 'Boxes', 'Layers', 'Network', 'Globe', 'Radio'],
  },
  databases: {
    label: 'Databases & Storage',
    icons: ['Database', 'FolderTree', 'FileCode', 'FileCode2', 'Archive', 'Save', 'Layers', 'HardDrive'],
  },
  architecture: {
    label: 'Architecture & Workflows',
    icons: ['Workflow', 'GitBranch', 'Activity', 'Share2', 'Compass', 'Sliders', 'Shuffle', 'Code', 'Code2'],
  },
  security: {
    label: 'Security & Auth',
    icons: ['Shield', 'ShieldCheck', 'Lock', 'Key', 'Eye', 'Search', 'Bell'],
  },
  performance: {
    label: 'Performance & Scale',
    icons: ['Zap', 'Flame', 'Rocket', 'Sparkles', 'Gauge', 'Scale', 'Bookmark', 'BookOpen'],
  },
};

export function IconSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedIcon = '',
  title = 'Select Icon or Logo',
}: IconSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<'tech' | 'lucide' | 'custom'>('tech');
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState(selectedIcon);
  const [customUrl, setCustomUrl] = useState(
    selectedIcon.startsWith('http') || selectedIcon.startsWith('/uploads') ? selectedIcon : ''
  );
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  if (!isOpen) return null;

  // Filter Tech SVGs
  const filteredTechs = Object.entries(TECH_SVG_MAP).filter(
    ([key, item]) =>
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter Lucide Icons
  const allLucideIcons = Object.keys(LUCIDE_ICON_MAP);
  const filteredLucide = allLucideIcons.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = () => {
    if (activeTab === 'custom' && customUrl) {
      onSelect(customUrl.trim());
    } else if (tempSelected) {
      onSelect(tempSelected);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-mono text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">
                Choose a vector tech logo, system architecture icon, or upload custom media.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="p-4 border-b border-border/60 bg-muted/20 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-muted/80 p-1 rounded-xl border border-border/70 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('tech')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-semibold ${
                  activeTab === 'tech'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Tech Logos ({Object.keys(TECH_SVG_MAP).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lucide')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-semibold ${
                  activeTab === 'lucide'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>System Icons ({allLucideIcons.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-semibold ${
                  activeTab === 'custom'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Custom Media</span>
              </button>
            </div>

            {/* Search Input */}
            {activeTab !== 'custom' && (
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter icons by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 min-h-[300px]">
          {/* TAB 1: TECH LOGOS */}
          {activeTab === 'tech' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {filteredTechs.map(([key, item]) => {
                  const isSelected = tempSelected === `tech:${key}` || tempSelected === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTempSelected(`tech:${key}`)}
                      className={`relative p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2.5 text-center transition-all group ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                          : 'border-border/70 bg-card hover:bg-muted/50 hover:border-foreground/20'
                      }`}
                    >
                      <div className="h-8 w-8 flex items-center justify-center transition-transform group-hover:scale-110">
                        {item.svg}
                      </div>
                      <span className="text-xs font-mono font-medium text-foreground truncate max-w-full">
                        {item.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredTechs.length === 0 && (
                <div className="py-12 text-center space-y-2 text-muted-foreground">
                  <Cpu className="h-8 w-8 mx-auto opacity-40" />
                  <p className="text-xs font-mono">No tech logos found matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LUCIDE SYSTEM ICONS */}
          {activeTab === 'lucide' && (
            <div className="space-y-6">
              {searchQuery ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {filteredLucide.map((iconName) => {
                    const isSelected =
                      tempSelected === `lucide:${iconName}` || tempSelected === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setTempSelected(`lucide:${iconName}`)}
                        className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all group ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                            : 'border-border/70 bg-card hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className="h-7 w-7 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                          <IconRenderer value={`lucide:${iconName}`} className="h-6 w-6" />
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground truncate max-w-full">
                          {iconName}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-2 w-2 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                Object.entries(LUCIDE_CATEGORIES).map(([catKey, cat]) => (
                  <div key={catKey} className="space-y-2.5">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {cat.label}
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      {cat.icons.map((iconName) => {
                        const isSelected =
                          tempSelected === `lucide:${iconName}` || tempSelected === iconName;
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setTempSelected(`lucide:${iconName}`)}
                            className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all group ${
                              isSelected
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                                : 'border-border/70 bg-card hover:bg-muted/50 hover:border-foreground/20'
                            }`}
                          >
                            <div className="h-7 w-7 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                              <IconRenderer value={`lucide:${iconName}`} className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground truncate max-w-full">
                              {iconName}
                            </span>
                            {isSelected && (
                              <div className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <Check className="h-2 w-2 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM URL & MEDIA LIBRARY */}
          {activeTab === 'custom' && (
            <div className="space-y-4 max-w-lg mx-auto py-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-foreground">
                  Custom Image / SVG URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... or choose from Media Library"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setTempSelected(e.target.value);
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-mono font-semibold transition-colors shrink-0"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Library</span>
                  </button>
                </div>
              </div>

              {customUrl && (
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-card border border-border flex items-center justify-center p-2 shrink-0">
                    <IconRenderer value={customUrl} className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-foreground">Live Image Preview</p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-xs">{customUrl}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-card border border-border flex items-center justify-center p-1.5">
              <IconRenderer value={tempSelected} className="h-6 w-6 text-primary" />
            </div>
            <div className="text-xs font-mono">
              <span className="text-muted-foreground block text-[10px]">SELECTED ICON:</span>
              <span className="font-bold text-foreground truncate max-w-[200px] block">
                {tempSelected || 'None'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Apply Icon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Nested Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Icon from Media Library"
        actionLabel="Use as Icon"
        onSelect={(url) => {
          setCustomUrl(url);
          setTempSelected(url);
        }}
      />
    </div>
  );
}
