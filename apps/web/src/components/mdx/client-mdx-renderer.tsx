'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { CodeBlock } from './code-block';
import { MermaidDiagram } from './mermaid-diagram';
import { Callout } from './callout';
import { Terminal } from './terminal';
import { Benchmark } from './benchmark';
import { DatabaseSchema } from './database-schema';
import { InteractiveDiagram } from './interactive-diagram';
import { KaTeX } from './katex-math';

interface ClientMdxRendererProps {
  content?: string;
  source?: string;
  className?: string;
}

export function ClientMdxRenderer({ content, source, className = '' }: ClientMdxRendererProps) {
  const rawText = content || source || '';

  return (
    <div className={`prose prose-zinc dark:prose-invert max-w-none text-foreground leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (lang === 'mermaid') {
              return <MermaidDiagram code={codeString} />;
            }

            const isInline = !match && !String(children).includes('\n');
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-xs text-foreground font-medium border border-border/40"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={lang || 'text'} showLineNumbers={true}>
                {codeString}
              </CodeBlock>
            );
          },
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-10 mb-4 text-foreground scroll-m-20" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-3 text-foreground border-b border-border/40 pb-2 scroll-m-20" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold tracking-tight mt-6 mb-2 text-foreground scroll-m-20" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold tracking-tight mt-4 mb-2 text-foreground scroll-m-20" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-7 text-foreground/90 my-4 text-base" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2 text-foreground/90" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 ml-6 list-decimal [&>li]:mt-2 text-foreground/90" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-6 w-full overflow-y-auto rounded-lg border border-border/60">
              <table className="w-full text-left text-sm border-collapse" {...props} />
            </div>
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border-b border-border/60 bg-muted/40 p-3 font-semibold text-foreground" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="p-3 align-top text-foreground/90" {...props} />
          ),
        }}
      >
        {rawText}
      </ReactMarkdown>
    </div>
  );
}
