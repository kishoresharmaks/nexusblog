'use client';

import React, { useEffect, useState, useId, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import {
  Network,
  AlertCircle,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Code2,
  X,
  Check,
  Copy,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface MermaidDiagramProps {
  code?: string;
  children?: React.ReactNode;
  caption?: string;
}

export function MermaidDiagram({ code, children, caption }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();
  const id = useId().replace(/:/g, '_');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // UX State Controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'scroll'>('contain'); // 'contain' = fit container, 'scroll' = 100% scale scrollable
  const [zoom, setZoom] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const renderCount = useRef<number>(0);

  const rawGraphCode =
    code ||
    (typeof children === 'string' ? children : '') ||
    '';

  const isDark = resolvedTheme === 'dark';

  // Render Mermaid Diagram on client
  useEffect(() => {
    if (!rawGraphCode) return;

    renderCount.current += 1;
    const uniqueRenderId = `mermaid_${id}_${renderCount.current}`;

    // Configure high-contrast Mermaid theme parameters
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        darkMode: isDark,
        fontFamily: 'JetBrains Mono, Fira Code, var(--font-mono), monospace',
        fontSize: '13px',
        primaryColor: isDark ? '#18181b' : '#ffffff',
        primaryTextColor: isDark ? '#ffffff' : '#09090b',
        primaryBorderColor: isDark ? '#52525b' : '#94a3b8',
        lineColor: isDark ? '#38bdf8' : '#0284c7',
        secondaryColor: isDark ? '#27272a' : '#f8fafc',
        tertiaryColor: isDark ? '#09090b' : '#ffffff',
        clusterBkg: isDark ? '#09090b' : '#f8fafc',
        clusterBorder: isDark ? '#3f3f46' : '#cbd5e1',
        titleColor: isDark ? '#34d399' : '#059669',
        edgeLabelBackground: isDark ? '#18181b' : '#ffffff',
        nodeBorder: isDark ? '#52525b' : '#94a3b8',
        nodeTextColor: isDark ? '#ffffff' : '#09090b',
        actorBkg: isDark ? '#18181b' : '#ffffff',
        actorBorder: isDark ? '#52525b' : '#cbd5e1',
        actorTextColor: isDark ? '#ffffff' : '#09090b',
        actorLineColor: isDark ? '#52525b' : '#cbd5e1',
        signalColor: isDark ? '#38bdf8' : '#0284c7',
        signalTextColor: isDark ? '#ffffff' : '#09090b',
        labelBoxBkgColor: isDark ? '#18181b' : '#ffffff',
        labelBoxBorderColor: isDark ? '#52525b' : '#cbd5e1',
        labelTextColor: isDark ? '#ffffff' : '#09090b',
        loopTextColor: isDark ? '#ffffff' : '#09090b',
        noteBkgColor: isDark ? '#27272a' : '#fef3c7',
        noteTextColor: isDark ? '#ffffff' : '#78350f',
        noteBorderColor: isDark ? '#52525b' : '#f59e0b',
      },
      securityLevel: 'loose',
    });

    const renderDiagram = async () => {
      try {
        setError(null);
        const { svg: renderedSvg } = await mermaid.render(uniqueRenderId, rawGraphCode.trim());
        setSvg(renderedSvg);
      } catch (err) {
        setError((err as Error).message || 'Failed to render Mermaid diagram');
      }
    };

    renderDiagram();
  }, [rawGraphCode, resolvedTheme, isDark, id]);

  // Keyboard shortcut listener for escape & zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Zoom Actions
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Copy Code Action
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(rawGraphCode.trim());
    setCopiedCode(true);
    toast.success('Mermaid syntax copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  }, [rawGraphCode]);

  // Copy SVG Action
  const handleCopySvg = useCallback(() => {
    if (!svg) return;
    navigator.clipboard.writeText(svg);
    setCopiedSvg(true);
    toast.success('Diagram SVG code copied to clipboard');
    setTimeout(() => setCopiedSvg(false), 2000);
  }, [svg]);

  // Download SVG File
  const handleDownloadSvg = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-architecture-diagram-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Architecture SVG downloaded');
  }, [svg]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-mono text-destructive">
        <div className="flex items-center space-x-2 font-bold mb-1">
          <AlertCircle className="h-4 w-4" />
          <span>Mermaid Diagram Syntax Error</span>
        </div>
        <p>{error}</p>
        <pre className="mt-2 p-2 bg-background/50 rounded text-[11px] overflow-x-auto text-foreground">
          {rawGraphCode}
        </pre>
      </div>
    );
  }

  // Dynamic CSS overrides injected to guarantee 100% legibility in Dark Theme
  const highContrastCss = `
    .mermaid-styled-container svg .node rect,
    .mermaid-styled-container svg .node circle,
    .mermaid-styled-container svg .node polygon,
    .mermaid-styled-container svg .node path {
      fill: ${isDark ? '#18181b' : '#ffffff'} !important;
      stroke: ${isDark ? '#52525b' : '#94a3b8'} !important;
      stroke-width: 1.5px !important;
    }
    .mermaid-styled-container svg .cluster rect {
      fill: ${isDark ? '#09090b' : '#f8fafc'} !important;
      stroke: ${isDark ? '#3f3f46' : '#cbd5e1'} !important;
      stroke-width: 1.5px !important;
    }
    .mermaid-styled-container svg text,
    .mermaid-styled-container svg .nodeLabel,
    .mermaid-styled-container svg .label text {
      fill: ${isDark ? '#ffffff' : '#09090b'} !important;
      color: ${isDark ? '#ffffff' : '#09090b'} !important;
      font-weight: 600 !important;
      font-family: var(--font-mono), monospace !important;
    }
    .mermaid-styled-container svg .cluster text,
    .mermaid-styled-container svg .cluster-label text {
      fill: ${isDark ? '#34d399' : '#059669'} !important;
      font-weight: 700 !important;
      font-family: var(--font-mono), monospace !important;
    }
    .mermaid-styled-container svg .edgePath .path {
      stroke: ${isDark ? '#38bdf8' : '#0284c7'} !important;
      stroke-width: 1.75px !important;
    }
    .mermaid-styled-container svg .marker {
      fill: ${isDark ? '#38bdf8' : '#0284c7'} !important;
      stroke: ${isDark ? '#38bdf8' : '#0284c7'} !important;
    }
    .mermaid-styled-container svg .edgeLabel {
      background-color: ${isDark ? '#18181b' : '#ffffff'} !important;
      color: ${isDark ? '#f4f4f5' : '#0f172a'} !important;
    }
    .mermaid-styled-container svg .edgeLabel text,
    .mermaid-styled-container svg .edgeLabel span {
      fill: ${isDark ? '#f4f4f5' : '#0f172a'} !important;
      color: ${isDark ? '#f4f4f5' : '#0f172a'} !important;
      font-weight: 500 !important;
    }
  `;

  return (
    <>
      <style>{highContrastCss}</style>

      {/* 1. Main Inline Component Block */}
      <div className="my-8 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xs shadow-xs overflow-hidden font-mono group/diagram">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/40 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2 min-w-0">
            <Network className="h-4 w-4 text-primary shrink-0" />
            <span className="font-bold text-foreground uppercase tracking-wider text-[11px] truncate">
              {caption || 'Architecture Diagram'}
            </span>
            <span className="rounded bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.2 text-[9px] font-bold hidden xs:inline-block">
              Mermaid Flow
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1 shrink-0">
            {/* View Raw Code Toggle */}
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              title={showCode ? 'Hide Mermaid code' : 'View Mermaid code'}
              className={`p-1.5 rounded-md border text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                showCode
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Code</span>
            </button>

            {/* Scale / Fit Toggle */}
            <button
              type="button"
              onClick={() => setFitMode(fitMode === 'contain' ? 'scroll' : 'contain')}
              title={fitMode === 'contain' ? 'Switch to 100% Scrollable Scale' : 'Switch to Fit Width'}
              className={`p-1.5 rounded-md border text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                fitMode === 'scroll'
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowUpDown className="h-3.5 w-3.5 rotate-90" />
              <span className="hidden sm:inline">
                {fitMode === 'contain' ? 'Fit Width' : '100% Scale'}
              </span>
            </button>

            {/* Download SVG */}
            <button
              type="button"
              onClick={handleDownloadSvg}
              title="Download SVG diagram"
              className="p-1.5 rounded-md border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden sm:flex"
            >
              <Download className="h-3.5 w-3.5" />
            </button>

            {/* Full Screen View Primary Button */}
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setIsFullscreen(true);
              }}
              className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-[11px] transition-all shadow-2xs cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Full Size</span>
            </button>
          </div>
        </div>

        {/* Code Drawer (if toggled) */}
        {showCode && (
          <div className="border-b border-border/60 bg-zinc-950 p-3 text-zinc-100 text-[11px] relative font-mono">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-zinc-400">
              <span>Mermaid Definition Syntax</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre p-1 text-emerald-400/90 leading-relaxed">
              {rawGraphCode}
            </pre>
          </div>
        )}

        {/* Rendered SVG Display Container */}
        <div
          ref={containerRef}
          onClick={() => {
            if (fitMode === 'contain') {
              setZoom(1);
              setIsFullscreen(true);
            }
          }}
          className={`mermaid-styled-container relative p-4 sm:p-6 transition-all group/canvas bg-card/60 ${
            fitMode === 'contain'
              ? 'overflow-x-auto flex justify-center cursor-zoom-in [&_svg]:max-w-full [&_svg]:h-auto'
              : 'overflow-x-auto block text-left [&_svg]:max-w-none [&_svg]:w-auto [&_svg]:h-auto'
          }`}
        >
          {/* Subtle click to expand floating banner on hover */}
          {fitMode === 'contain' && (
            <div className="absolute top-3 right-3 opacity-0 group-hover/canvas:opacity-100 transition-opacity bg-background/90 backdrop-blur-xs border border-border px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-foreground shadow-xs pointer-events-none flex items-center gap-1.5 z-10">
              <Maximize2 className="h-3 w-3 text-primary" />
              <span>Click for Full Size View</span>
            </div>
          )}

          <div
            className="w-full flex justify-center"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>

        {/* Optional Caption */}
        {caption && (
          <div className="border-t border-border/40 px-4 py-2 bg-muted/10 text-center text-xs text-muted-foreground italic font-sans">
            Figure: {caption}
          </div>
        )}
      </div>

      {/* 2. Full-Screen Interactive Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-fade-in font-mono">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/80 bg-card/80 shrink-0">
            {/* Left: Diagram Info */}
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground leading-none">
                  {caption || 'Architecture System Topology'}
                </h3>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                  <span>Interactive Mermaid Lightbox</span>
                  <span>&bull;</span>
                  <span className="text-primary font-bold">Scale: {Math.round(zoom * 100)}%</span>
                </span>
              </div>
            </div>

            {/* Right: Controls & Actions */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center border border-border rounded-lg bg-background p-0.5 mr-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  title="Zoom Out (-)"
                  className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-bold text-foreground min-w-[42px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  title="Zoom In (+)"
                  className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom (100%)"
                  className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground border-l border-border/60 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Copy SVG */}
              <button
                type="button"
                onClick={handleCopySvg}
                title="Copy SVG XML"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
              >
                {copiedSvg ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                <span>{copiedSvg ? 'Copied' : 'Copy SVG'}</span>
              </button>

              {/* Download SVG */}
              <button
                type="button"
                onClick={handleDownloadSvg}
                title="Download SVG file"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-2"
                title="Close Full Screen (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Full-Screen Canvas Area */}
          <div className="mermaid-styled-container flex-1 relative overflow-auto p-6 sm:p-12 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
            {/* SVG Content Scaled by Zoom */}
            <div
              className="transition-transform duration-150 ease-out flex items-center justify-center min-w-full"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>

          {/* Bottom Help Bar */}
          <div className="px-6 py-2 border-t border-border/60 bg-card/80 text-[11px] text-muted-foreground flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono font-bold">
                Esc
              </span>
              <span>to exit full screen</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Use zoom buttons or mouse wheel to inspect topology details</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
