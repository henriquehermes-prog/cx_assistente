'use client';

import { Article } from '@/types/article';
import { ChevronRight, Clock, Layers, GitBranch } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

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
          {/* Mode badge + título */}
          {article.mode === 'guided' && (
            <div className="mb-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                <GitBranch className="w-2.5 h-2.5" />
                Fluxo guiado
              </span>
            </div>
          )}

          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
            {article.problem}
          </h3>

          {/* Preview: first step of first scenario (steps mode only) */}
          {article.mode === 'steps' && article.scenarios?.[0]?.steps[0] && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">
              {article.scenarios[0].steps[0]}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
            {article.mode === 'steps' && (article.scenarios?.length ?? 0) > 1 && (
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {article.scenarios!.length} cenários
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {updatedAt}
            </span>
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

        <ChevronRight className="w-4 h-4 text-gray-300 mt-0.5 shrink-0 group-hover:text-brand-400 transition-colors" />
      </div>
    </Link>
  );
}
