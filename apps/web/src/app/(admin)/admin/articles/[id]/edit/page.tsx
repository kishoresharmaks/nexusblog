import React from 'react';
import { ArticleEditor } from '@/components/admin/article-editor';
import { articlesApi } from '@/lib/api-client';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  let article: any = null;

  try {
    article = await articlesApi.getById(id).catch(() => null);
    if (!article) {
      article = await articlesApi.getBySlug(id).catch(() => null);
    }
    if (!article) {
      const feed = await articlesApi.getAdminArticles({ limit: 100 }).catch(() => null);
      article = feed?.items?.find((a: any) => a.id === id || a.slug === id) || null;
    }
  } catch (err) {
    console.error(`Failed to fetch article ${id} from API:`, err);
  }

  return <ArticleEditor initialData={article || undefined} articleId={id} isNew={false} />;
}

