'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface KaTeXProps {
  math?: string;
  children?: React.ReactNode;
  block?: boolean;
}

export function KaTeX({ math, children, block = false }: KaTeXProps) {
  const formula =
    math ||
    (typeof children === 'string' ? children : '') ||
    '';

  const html = useMemo(() => {
    try {
      return katex.renderToString(formula.trim(), {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return formula;
    }
  }, [formula, block]);

  if (block) {
    return (
      <div
        className="my-6 p-4 rounded-lg border border-border/60 bg-muted/20 overflow-x-auto text-center font-mono text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className="inline-block px-1 font-mono text-sm align-middle"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
