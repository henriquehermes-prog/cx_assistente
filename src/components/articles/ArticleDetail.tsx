'use client';

import { useState } from 'react';
import { Article } from '@/types/article';
import {
  Edit2, Copy, Trash2, Tag, Calendar,
  Info, ChevronDown, ChevronRight, GitBranch, List,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import TreeViewer from './TreeViewer';

interface Props {
  article: Article;
}

export default function ArticleDetail({ article }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set([article.scenarios?.[0]?.id ?? ''])
  );

  const toggleScenario = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    const res = await fetch(`/api/articles/${article.id}/duplicate`, { method: 'POST' });
    if (res.ok) {
      const copy = await res.json();
      router.push(`/articles/${copy.id}/edit`);
    }
    setIsDuplicating(false);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    setIsDeleting(true);
    await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
    router.push('/articles');
  };

  const updatedAt = new Date(article.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const isGuided = article.mode === 'guided';

  return (
    <div className="space-y-5">
      {/* ── Cabeçalho ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badge de modo */}
            <div className="mb-3">
              <span className={clsx(
                'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                isGuided
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {isGuided
                  ? <><GitBranch className="w-3 h-3" /> Fluxo guiado</>
                  : <><List className="w-3 h-3" /> Passo a passo</>
                }
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 leading-snug">{article.problem}</h1>

            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Atualizado em {updatedAt}
              </span>
              {!isGuided && (article.scenarios?.length ?? 0) > 1 && (
                <span>{article.scenarios!.length} cenários de resolução</span>
              )}
            </div>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {article.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => router.push(`/articles/${article.id}/edit`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-900 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              {isDuplicating ? 'Copiando...' : 'Duplicar'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 text-xs font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Conteúdo: Fluxo guiado OR Cenários ── */}
      {isGuided && article.tree ? (

        <TreeViewer tree={article.tree} />

      ) : (

        <div className="space-y-2">
          {(article.scenarios?.length ?? 0) > 1 && (
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1">
              Cenários de resolução
            </h2>
          )}

          {(article.scenarios ?? []).map((scenario, idx) => {
            const isOpen = expanded.has(scenario.id);
            return (
              <div key={scenario.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition"
                  onClick={() => toggleScenario(scenario.id)}
                >
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-gray-800">
                    {scenario.title || `Cenário ${idx + 1}`}
                  </span>
                  {!isOpen && scenario.steps.filter(Boolean).length > 0 && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {scenario.steps.filter(Boolean).length} passos
                    </span>
                  )}
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {scenario.whenToUse && (
                      <div className="flex gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-blue-700 mb-0.5">Quando usar</p>
                          <p className={clsx('text-sm text-blue-800 leading-relaxed')}>{scenario.whenToUse}</p>
                        </div>
                      </div>
                    )}
                    <ol className="space-y-3">
                      {scenario.steps.filter(Boolean).map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
