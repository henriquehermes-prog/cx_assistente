'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article } from '@/types/article';
import AppHeader from '@/components/AppHeader';
import NavTabs from '@/components/NavTabs';
import ArticleCard from '@/components/articles/ArticleCard';
import { Plus, Search, X, FileText } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then((data: Article[]) => {
        setArticles(data);
        setFiltered(data);
        setIsLoading(false);
      });
  }, []);

  const applyFilters = useCallback(async (q: string, tag: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);

    const endpoint = q ? `/api/articles/search?${params}` : '/api/articles';
    const res = await fetch(endpoint);
    let data: Article[] = await res.json();

    if (tag !== 'all') {
      data = data.filter((a) => a.tags.includes(tag));
    }

    setFiltered(data);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters(query, activeTag);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeTag, applyFilters]);

  // Coleta todas as tags únicas dos artigos
  const allTags = [...new Set(articles.flatMap((a) => a.tags))].slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        rightSlot={
          <Link
            href="/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-600 border border-brand-600 rounded-lg text-sm font-medium text-white transition"
          >
            <Plus className="w-4 h-4" />
            Novo artigo
          </Link>
        }
      />
      <NavTabs />

      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-5">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar problemas, tags..."
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtro por tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag('all')}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition border',
                activeTag === 'all'
                  ? 'bg-brand-900 text-white border-brand-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              )}
            >
              Todos ({articles.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? 'all' : tag)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition border',
                  activeTag === tag
                    ? 'bg-brand-900 text-white border-brand-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Resultados */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Carregando artigos...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-gray-600">Nenhum artigo encontrado</p>
            <p className="text-sm mt-1">
              Tente outros termos ou{' '}
              <Link href="/articles/new" className="text-brand-700 hover:underline font-medium">
                crie um novo artigo
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {filtered.length} artigo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
