'use client';

import React from 'react';
import { ClientMdxRenderer } from './client-mdx-renderer';

export interface MdxRendererProps {
  source?: string;
  content?: string;
  className?: string;
  customComponents?: Record<string, React.ComponentType<any>>;
}

export function MdxRenderer({ source, content, className = '', customComponents }: MdxRendererProps) {
  const mdxSource = source || content || '';
  return (
    <ClientMdxRenderer
      source={mdxSource}
      className={className}
      customComponents={customComponents}
    />
  );
}

