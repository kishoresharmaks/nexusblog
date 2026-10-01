'use client';

import React, { useEffect, useState, useId } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import { Network, AlertCircle } from 'lucide-react';

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

  const rawGraphCode =
    code ||
    (typeof children === 'string' ? children : '') ||
    '';

  useEffect(() => {
    if (!rawGraphCode) return;

    const isDark = resolvedTheme === 'dark';
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'neutral',
      themeVariables: {
        darkMode: isDark,
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '13px',
        primaryColor: isDark ? '#27272a' : '#f4f4f5',
        primaryTextColor: isDark ? '#fafafa' : '#18181b',
        primaryBorderColor: isDark ? '#3f3f46' : '#d4d4d8',
        lineColor: isDark ? '#a1a1aa' : '#71717a',
        secondaryColor: isDark ? '#18181b' : '#ffffff',
        tertiaryColor: isDark ? '#09090b' : '#f4f4f5',
      },
      securityLevel: 'loose',
    });

    const renderDiagram = async () => {
      try {
        setError(null);
        const { svg: renderedSvg } = await mermaid.render(`mermaid_${id}`, rawGraphCode.trim());
        setSvg(renderedSvg);
      } catch (err) {
        setError((err as Error).message || 'Failed to render Mermaid diagram');
      }
    };

    renderDiagram();
  }, [rawGraphCode, resolvedTheme, id]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs font-mono text-destructive">
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

  return (
    <div className="my-8 rounded-lg border border-border/80 bg-card/60 p-4 sm:p-6 shadow-sm overflow-hidden text-center">
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4 text-xs text-muted-foreground font-mono">
        <div className="flex items-center space-x-2">
          <Network className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground uppercase tracking-wider">
            Architecture Diagram
          </span>
        </div>
        <span>Mermaid Flow</span>
      </div>

      <div
        className="overflow-x-auto flex justify-center py-2 [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {caption && (
        <p className="mt-3 text-xs text-muted-foreground italic font-sans">
          Figure: {caption}
        </p>
      )}
    </div>
  );
}
