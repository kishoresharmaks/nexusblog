'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  title?: string;
  command?: string;
  children?: React.ReactNode;
}

export function Terminal({
  title = 'bash',
  command,
  children,
}: TerminalProps) {
  const [copied, setCopied] = useState(false);

  const rawText =
    command ||
    (typeof children === 'string' ? children : '') ||
    '';

  const handleCopy = async () => {
    if (!rawText) return;
    await navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-lg border border-border/80 bg-zinc-950 text-zinc-100 shadow-md overflow-hidden font-mono text-xs sm:text-sm">
      {/* Terminal Titlebar */}
      <div className="flex h-9 items-center justify-between border-b border-border/40 bg-zinc-900 px-4">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 font-sans text-xs text-zinc-400 flex items-center gap-1.5">
            <TerminalIcon className="h-3 w-3" />
            {title}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy terminal command"
          className="inline-flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Content */}
      <div className="p-4 overflow-x-auto space-y-1.5">
        {command && (
          <div className="flex items-center text-emerald-400 space-x-2">
            <span className="select-none text-zinc-500 font-bold">$</span>
            <span>{command}</span>
          </div>
        )}
        {children && (
          <div className="text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
