'use client';

import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  filename?: string;
  language?: string;
  rawCode?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  className,
  filename,
  language,
  rawCode,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    if (!codeString) return;
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-lg border border-border/80 bg-zinc-950 text-zinc-100 shadow-md overflow-hidden font-mono text-xs sm:text-sm">
      {/* Header bar */}
      <div className="flex h-10 items-center justify-between border-b border-border/40 bg-zinc-900/90 px-4">
        <div className="flex items-center space-x-2 text-zinc-400">
          <Terminal className="h-3.5 w-3.5" />
          {filename ? (
            <span className="font-sans text-xs font-medium text-zinc-200">{filename}</span>
          ) : (
            <span className="text-xs uppercase tracking-wider text-zinc-400">
              {extractedLang}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto p-4 leading-relaxed">
        <pre className="flex">
          {showLineNumbers && (
            <span
              aria-hidden="true"
              className="mr-4 select-none text-right text-zinc-600 font-mono pr-2 border-r border-zinc-800"
            >
              {codeString
                .split('\n')
                .map((_, i) => (
                  <span key={i} className="block">
                    {i + 1}
                  </span>
                ))}
            </span>
          )}
          <code className="flex-1 font-mono text-zinc-100">{children || codeString}</code>
        </pre>
      </div>
    </div>
  );
}
