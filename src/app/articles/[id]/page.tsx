'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Article } from '@/types/article';
import AppHeader from '@/components/AppHeader';
import NavTabs from '@/components/NavTabs';
import ArticleDetail from '@/components/articles/ArticleDetail';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setArticle(data); });
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <NavTabs />

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/articles"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm text-gray-500">Artigos de Suporte</span>
        </div>

        {notFound && (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium text-gray-600">Artigo não encontrado</p>
            <Link href="/articles" className="text-sm text-brand-700 hover:underline mt-2 inline-block">
              Voltar para a lista
            </Link>
          </div>
        )}

        {!article && !notFound && (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        )}

        {article && <ArticleDetail article={article} />}
      </div>
    </div>
  );
}
