import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CodeBlock } from './code-block';
import { CodeTabs, CodeTab } from './code-tabs';
import { Callout } from './callout';
import { Terminal } from './terminal';
import { Benchmark } from './benchmark';
import { DatabaseSchema } from './database-schema';
import { ApiRequest, ApiResponse } from './api-spec';
import { MermaidDiagram } from './mermaid-diagram';
import { InteractiveDiagram } from './interactive-diagram';
import { KaTeX } from './katex-math';
import { AdSlot } from '../ads/ad-slot';
import { InArticleAd } from '../ads/in-article-ad';

import { normalizeMediaUrl } from '@nexus/config';

export const mdxComponents = {
  // Custom Technical Components
  CodeBlock,
  CodeTabs,
  CodeTab,
  Callout,
  Terminal,
  Benchmark,
  DatabaseSchema,
  ApiRequest,
  ApiResponse,
  MermaidDiagram,
  ArchitectureDiagram: MermaidDiagram,
  InteractiveDiagram,
  KaTeX,
  AdSlot,
  InArticleAd,
  SponsorBreak: InArticleAd,

  // HTML overrides for technical typography
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-10 mb-4 text-foreground scroll-m-20"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-3 text-foreground border-b border-border/40 pb-2 scroll-m-20"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl font-bold tracking-tight mt-6 mb-2 text-foreground scroll-m-20"
      {...props}
    />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="text-lg font-semibold tracking-tight mt-4 mb-2 text-foreground scroll-m-20"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-7 text-foreground/90 my-4 text-base" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 ml-6 list-disc [&>li]:mt-2 text-foreground/90" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-4 ml-6 list-decimal [&>li]:mt-2 text-foreground/90" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground"
      {...props}
    />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto rounded-lg border border-border/60">
      <table className="w-full text-left text-sm border-collapse" {...props} />
    </div>
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border-b border-border/60 bg-muted/40 p-3 font-semibold text-foreground"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="p-3 align-top text-foreground/90" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    // If pre contains code, delegate to CodeBlock
    return <CodeBlock {...props} />;
  },
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !props.className?.includes('language-');
    if (isInline) {
      return (
        <code
          className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-xs text-foreground font-medium border border-border/40"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  a: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href?.startsWith('/')) {
      return (
        <Link
          href={href}
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        {...props}
      />
    );
  },
  img: ({ src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <div className="my-6 overflow-hidden rounded-lg border border-border/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={normalizeMediaUrl(src)}
        crossOrigin="anonymous"
        className="w-full h-auto object-cover"
        alt={props.alt || 'Technical diagram'}
        {...props}
      />
    </div>
  ),
};
