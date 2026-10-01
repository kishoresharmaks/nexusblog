'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { CodeBlock } from './code-block';
import { MermaidDiagram } from './mermaid-diagram';
import { Callout } from './callout';
import { Terminal } from './terminal';
import { Benchmark } from './benchmark';
import { DatabaseSchema } from './database-schema';
import { InteractiveDiagram } from './interactive-diagram';
import { CodeTabs, CodeTab } from './code-tabs';
import { ApiRequest, ApiResponse } from './api-spec';
import { KaTeX } from './katex-math';

interface ClientMdxRendererProps {
  content?: string;
  source?: string;
  className?: string;
}

export function ClientMdxRenderer({ content, source, className = '' }: ClientMdxRendererProps) {
  const rawText = content || source || '';

  const customComponents: any = {
    // Code and Syntax Highlighting
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

    // Custom Technical Components (Both lowercase for rehype-raw HTML parser and PascalCase)
    callout: ({ type = 'info', title, children }: any) => (
      <Callout type={type} title={title}>
        {children}
      </Callout>
    ),
    Callout: ({ type = 'info', title, children }: any) => (
      <Callout type={type} title={title}>
        {children}
      </Callout>
    ),

    benchmark: ({ title, description, rows, metrics }: any) => (
      <Benchmark title={title} description={description} rows={rows} metrics={metrics} />
    ),
    Benchmark: ({ title, description, rows, metrics }: any) => (
      <Benchmark title={title} description={description} rows={rows} metrics={metrics} />
    ),

    terminal: ({ title, command, children }: any) => (
      <Terminal title={title} command={command}>
        {children}
      </Terminal>
    ),
    Terminal: ({ title, command, children }: any) => (
      <Terminal title={title} command={command}>
        {children}
      </Terminal>
    ),

    mermaiddiagram: ({ code, caption, children }: any) => (
      <MermaidDiagram code={code} caption={caption}>
        {children}
      </MermaidDiagram>
    ),
    MermaidDiagram: ({ code, caption, children }: any) => (
      <MermaidDiagram code={code} caption={caption}>
        {children}
      </MermaidDiagram>
    ),
    mermaid: ({ code, caption, children }: any) => (
      <MermaidDiagram code={code} caption={caption}>
        {children}
      </MermaidDiagram>
    ),
    Mermaid: ({ code, caption, children }: any) => (
      <MermaidDiagram code={code} caption={caption}>
        {children}
      </MermaidDiagram>
    ),
    architecturediagram: ({ code, caption, children }: any) => (
      <MermaidDiagram code={code} caption={caption}>
        {children}
      </MermaidDiagram>
    ),
    ArchitectureDiagram: ({ code, caption, children }: any) => (
      <MermaidDiagram code={code} caption={caption}>
        {children}
      </MermaidDiagram>
    ),

    databaseschema: ({ tableName, description, columns }: any) => (
      <DatabaseSchema tableName={tableName} description={description} columns={columns} />
    ),
    DatabaseSchema: ({ tableName, description, columns }: any) => (
      <DatabaseSchema tableName={tableName} description={description} columns={columns} />
    ),

    interactivediagram: ({ title, caption, height }: any) => (
      <InteractiveDiagram title={title} caption={caption} height={height} />
    ),
    InteractiveDiagram: ({ title, caption, height }: any) => (
      <InteractiveDiagram title={title} caption={caption} height={height} />
    ),

    codetabs: ({ children, defaultValue }: any) => (
      <CodeTabs defaultValue={defaultValue}>{children}</CodeTabs>
    ),
    CodeTabs: ({ children, defaultValue }: any) => (
      <CodeTabs defaultValue={defaultValue}>{children}</CodeTabs>
    ),

    codetab: ({ title, language, filename, children }: any) => (
      <CodeTab title={title} language={language} filename={filename}>
        {children}
      </CodeTab>
    ),
    CodeTab: ({ title, language, filename, children }: any) => (
      <CodeTab title={title} language={language} filename={filename}>
        {children}
      </CodeTab>
    ),

    apirequest: ({ method = 'GET', endpoint = '', description, headers, body }: any) => (
      <ApiRequest method={method} endpoint={endpoint} description={description} headers={headers} body={body} />
    ),
    ApiRequest: ({ method = 'GET', endpoint = '', description, headers, body }: any) => (
      <ApiRequest method={method} endpoint={endpoint} description={description} headers={headers} body={body} />
    ),

    apiresponse: ({ status = 200, description, body, schema, example }: any) => (
      <ApiResponse status={Number(status) || 200} description={description} body={body || schema || example} />
    ),
    ApiResponse: ({ status = 200, description, body, schema, example }: any) => (
      <ApiResponse status={Number(status) || 200} description={description} body={body || schema || example} />
    ),

    katex: ({ math, block, children }: any) => (
      <KaTeX math={math || (typeof children === 'string' ? children : '')} block={block} />
    ),
    KaTeX: ({ math, block, children }: any) => (
      <KaTeX math={math || (typeof children === 'string' ? children : '')} block={block} />
    ),

    // HTML standard elements
    h1: ({ node, ...props }: any) => (
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-10 mb-4 text-foreground scroll-m-20" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-3 text-foreground border-b border-border/40 pb-2 scroll-m-20" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-xl font-bold tracking-tight mt-6 mb-2 text-foreground scroll-m-20" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-lg font-semibold tracking-tight mt-4 mb-2 text-foreground scroll-m-20" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="leading-7 text-foreground/90 my-4 text-base" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="my-4 ml-6 list-disc [&>li]:mt-2 text-foreground/90" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="my-4 ml-6 list-decimal [&>li]:mt-2 text-foreground/90" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground" {...props} />
    ),
    table: ({ node, ...props }: any) => (
      <div className="my-6 w-full overflow-y-auto rounded-lg border border-border/60">
        <table className="w-full text-left text-sm border-collapse" {...props} />
      </div>
    ),
    tr: ({ node, ...props }: any) => (
      <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border-b border-border/60 bg-muted/40 p-3 font-semibold text-foreground" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="p-3 align-top text-foreground/90" {...props} />
    ),
    a: ({ href, children, ...props }: any) => {
      if (href?.startsWith('/')) {
        return (
          <Link
            href={href}
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            {...props}
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className={`prose prose-zinc dark:prose-invert max-w-none text-foreground leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={customComponents}
      >
        {rawText}
      </ReactMarkdown>
    </div>
  );
}
