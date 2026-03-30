'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article, ArticleCategory, ArticleStatus, ARTICLE_CATEGORY_LABELS, ARTICLE_STATUS_CONFIG } from '@/types/article';
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
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

  const applyFilters = useCallback(
    async (q: string, category: string, status: string) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category !== 'all') params.set('category', category);
      if (status !== 'all') params.set('status', status);

      const endpoint = q ? `/api/articles/search?${params}` : `/api/articles?${params}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setFiltered(data);
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters(query, activeCategory, activeStatus);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeCategory, activeStatus, applyFilters]);

  const categories = [...new Set(articles.map((a) => a.category))] as ArticleCategory[];
  const statuses = [...new Set(articles.map((a) => a.status))] as ArticleStatus[];

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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, categoria, tags..."
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

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition border',
                activeCategory === 'all'
                  ? 'bg-brand-900 text-white border-brand-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              )}
            >
              Todas ({articles.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition border',
                  activeCategory === cat
                    ? 'bg-brand-900 text-white border-brand-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                )}
              >
                {ARTICLE_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Status filter */}
          {statuses.length > 0 && (
            <div className="flex flex-wrap gap-2 border-l border-gray-200 pl-4">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveStatus(activeStatus === s ? 'all' : s)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition border',
                    activeStatus === s
                      ? 'bg-brand-900 text-white border-brand-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  )}
                >
                  {ARTICLE_STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Carregando artigos...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-gray-600">Nenhum artigo encontrado</p>
            <p className="text-sm mt-1">Tente outros termos ou{' '}
              <Link href="/articles/new" className="text-brand-700 hover:underline font-medium">crie um novo artigo</Link>
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
