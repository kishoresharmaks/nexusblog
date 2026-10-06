'use client';

import React, { useState } from 'react';
import { Check, Copy, Terminal, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { trackCodeCopy } from '@/lib/telemetry';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  filename?: string;
  language?: string;
  rawCode?: string;
  showLineNumbers?: boolean;
}

const COLLAPSE_THRESHOLD = 16; // Number of lines before collapsing

export function CodeBlock({
  children,
  className,
  filename,
  language,
  rawCode,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract language from className if not passed directly (e.g. language-typescript)
  const extractedLang =
    language ||
    (className?.includes('language-')
      ? className.replace(/.*language-(\w+).*/, '$1')
      : 'text');

  // Extract text content if rawCode is not provided
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (React.isValidElement(node) && (node.props as any)?.children) {
      return getTextContent((node.props as any).children);
    }
    return '';
  };

  const codeString = rawCode || getTextContent(children).trim();
  const lines = codeString ? codeString.split('\n') : [];
  const totalLines = lines.length;
  const isCollapsible = totalLines > COLLAPSE_THRESHOLD;

  const handleCopy = async () => {
    if (!codeString) return;
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      trackCodeCopy({
        language: extractedLang,
        filename,
        snippet: codeString,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative my-6 rounded-2xl border border-border/80 bg-zinc-950 text-zinc-100 shadow-md overflow-hidden font-mono text-xs sm:text-sm group/code">
      {/* 1. Header bar */}
      <div className="flex h-10 items-center justify-between border-b border-border/40 bg-zinc-900/90 px-4 py-2 text-xs">
        <div className="flex items-center space-x-2 text-zinc-400 min-w-0">
          <Terminal className="h-3.5 w-3.5 text-primary shrink-0" />
          {filename ? (
            <span className="font-sans text-xs font-medium text-zinc-200 truncate">{filename}</span>
          ) : (
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold truncate">
              {extractedLang}
            </span>
          )}
          {isCollapsible && (
            <span className="rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 px-1.5 py-0.2 text-[10px] font-mono font-medium hidden xs:inline-block">
              {totalLines} lines
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Header Expand/Collapse Toggle */}
          {isCollapsible && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse code block' : 'Expand code block'}
              className="hidden sm:inline-flex items-center gap-1 rounded bg-zinc-800/80 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="h-3 w-3" />
                  <span className="font-sans text-[11px]">Collapse</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3 text-primary" />
                  <span className="font-sans text-[11px]">Expand</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
            className="inline-flex items-center gap-1.5 rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-sans font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="font-sans">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Code content area with smooth height transition */}
      <div
        className={`relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsible && !isExpanded
            ? 'max-h-[340px] overflow-hidden'
            : 'max-h-[20000px] overflow-x-auto'
        }`}
      >
        <div className="overflow-x-auto p-4 leading-relaxed">
          <pre className="flex">
            {showLineNumbers && (
              <span
                aria-hidden="true"
                className="mr-4 select-none text-right text-zinc-600 font-mono pr-3 border-r border-zinc-800/80 shrink-0"
              >
                {lines.map((_, i) => (
                  <span key={i} className="block">
                    {i + 1}
                  </span>
                ))}
              </span>
            )}
            <code className="flex-1 font-mono text-zinc-100">{children || codeString}</code>
          </pre>
        </div>

        {/* 3. Gradient Fade Overlay & Floating Expand CTA (when collapsed) */}
        {isCollapsible && !isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-transparent pointer-events-none flex items-end justify-center pb-3.5 z-10">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/95 border border-zinc-700/90 text-zinc-100 text-xs font-mono font-bold shadow-2xl backdrop-blur-md hover:bg-zinc-800 hover:border-primary/60 hover:text-white transition-all active:scale-[0.98] cursor-pointer group"
            >
              <ChevronDown className="h-4 w-4 text-primary group-hover:translate-y-0.5 transition-transform" />
              <span>Show Full Code ({totalLines} lines)</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Footer Bar with Collapse Action (when expanded) */}
      {isCollapsible && isExpanded && (
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/60 py-2 px-4 text-xs font-mono text-zinc-400">
          <span className="text-[11px]">Showing all {totalLines} lines</span>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/70 text-zinc-200 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <ChevronUp className="h-3.5 w-3.5 text-primary" />
            <span>Collapse Code</span>
          </button>
        </div>
      )}
    </div>
  );
}
