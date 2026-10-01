import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { mdxComponents } from './mdx-components';

interface MdxRendererProps {
  source: string;
  customComponents?: Record<string, React.ComponentType<any>>;
}

export function MdxRenderer({ source, customComponents }: MdxRendererProps) {
  const mergedComponents = {
    ...mdxComponents,
    ...(customComponents || {}),
  };

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none text-foreground leading-relaxed">
      <MDXRemote
        source={source}
        components={mergedComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeKatex, rehypeSlug],
          },
        }}
      />
    </div>
  );
}
