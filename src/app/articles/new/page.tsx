'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import NavTabs from '@/components/NavTabs';
import ArticleForm from '@/components/articles/ArticleForm';
import { Article } from '@/types/article';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type FormData = Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;

export default function NewArticlePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: FormData) => {
    setIsSaving(true);
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const article = await res.json();
      router.push(`/articles/${article.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <NavTabs />

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/articles"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Novo artigo de suporte</h1>
            <p className="text-xs text-gray-500 mt-0.5">Documente um problema recorrente para o time de CX</p>
          </div>
        </div>

        <ArticleForm
          onSave={handleSave}
          onCancel={() => router.push('/articles')}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
