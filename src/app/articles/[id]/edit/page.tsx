'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Article } from '@/types/article';
import AppHeader from '@/components/AppHeader';
import NavTabs from '@/components/NavTabs';
import ArticleForm from '@/components/articles/ArticleForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type FormData = Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then(setArticle);
  }, [id]);

  const handleSave = async (data: FormData) => {
    setIsSaving(true);
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) router.push(`/articles/${id}`);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <NavTabs />

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/articles/${id}`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Editar artigo</h1>
            <p className="text-xs text-gray-500 mt-0.5">Mantenha o conteúdo sempre atualizado</p>
          </div>
        </div>

        {!article ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : (
          <ArticleForm
            initial={article}
            onSave={handleSave}
            onCancel={() => router.push(`/articles/${id}`)}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}
