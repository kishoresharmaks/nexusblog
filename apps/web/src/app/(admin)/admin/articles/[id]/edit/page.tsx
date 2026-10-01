import React from 'react';
import { ArticleEditor } from '@/components/admin/article-editor';
import { getArticleById } from '@/lib/articles-data';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = getArticleById(id);

  return <ArticleEditor initialData={article} isNew={false} />;
}
