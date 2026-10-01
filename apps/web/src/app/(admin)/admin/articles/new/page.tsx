'use client';

import React from 'react';
import { ArticleEditor } from '@/components/admin/article-editor';

export default function NewArticlePage() {
  return <ArticleEditor isNew={true} />;
}
