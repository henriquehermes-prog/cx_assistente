'use client';

import { Article, ARTICLE_CATEGORY_LABELS, ARTICLE_CATEGORY_COLORS, ARTICLE_SYSTEM_LABELS } from '@/types/article';
import StatusBadge from './StatusBadge';
import clsx from 'clsx';
import { ChevronRight, Layers, Clock } from 'lucide-react';
import Link from 'next/link';

interface Props {
  article: Article;
}

export default function ArticleCard({ article }: Props) {
  const updatedAt = new Date(article.updatedAt).toLocaleDateString('pt-BR');

  return (
    <Link
      href={`/articles/${article.id}`}
      className={clsx(
        'group block w-full text-left p-4 rounded-xl border border-gray-200 bg-white shadow-sm',
        'hover:border-brand-300 hover:shadow-md transition-all'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', ARTICLE_CATEGORY_COLORS[article.category])}>
              {ARTICLE_CATEGORY_LABELS[article.category]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {ARTICLE_SYSTEM_LABELS[article.system]}
            </span>
            <StatusBadge status={article.status} />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-brand-700 transition-colors">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.description}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {article.scenarios.length} cenário{article.scenarios.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {updatedAt}
            </span>
            {article.responsible && (
              <span className="truncate max-w-[120px]">{article.responsible}</span>
            )}
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {article.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {article.tags.length > 4 && (
                <span className="text-xs text-gray-400">+{article.tags.length - 4}</span>
              )}
            </div>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-gray-300 mt-1 shrink-0 group-hover:text-brand-400 transition-colors" />
      </div>
    </Link>
  );
}
