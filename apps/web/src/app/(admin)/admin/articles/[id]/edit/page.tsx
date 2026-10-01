'use client';

import React from 'react';
import { ArticleEditor } from '@/components/admin/article-editor';

export default function EditArticlePage() {
  const sampleArticle = {
    id: '1',
    title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
    slug: 'designing-distributed-rate-limiter',
    excerpt:
      'A deep dive into sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.',
    categoryId: 'system-design',
    difficulty: 'ADVANCED' as const,
    type: 'SYSTEM_DESIGN',
    status: 'PUBLISHED' as const,
    featured: true,
  };

  return <ArticleEditor initialData={sampleArticle} isNew={false} />;
}
