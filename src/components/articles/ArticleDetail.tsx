'use client';

import { useState } from 'react';
import {
  Article, ARTICLE_CATEGORY_LABELS, ARTICLE_CATEGORY_COLORS,
  ARTICLE_SYSTEM_LABELS, DIFFICULTY_CONFIG,
} from '@/types/article';
import StatusBadge from './StatusBadge';
import clsx from 'clsx';
import {
  Edit2, Copy, Trash2, ChevronDown, ChevronUp, Clock, AlertCircle,
  ListChecks, Tag, User, Calendar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  article: Article;
}

export default function ArticleDetail({ article }: Props) {
  const router = useRouter();
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(
    new Set(article.scenarios.map((s) => s.id))
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const toggleScenario = (id: string) => {
    setExpandedScenarios((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

  return (
    <div className="space-y-5">
      {/* ── Article header ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full', ARTICLE_CATEGORY_COLORS[article.category])}>
                {ARTICLE_CATEGORY_LABELS[article.category]}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                {ARTICLE_SYSTEM_LABELS[article.system]}
              </span>
              <StatusBadge status={article.status} size="md" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 leading-snug">{article.title}</h1>
            <p className="text-sm text-gray-600 mt-2">{article.description}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {article.responsible}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Atualizado em {updatedAt}
              </span>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {article.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
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

      {/* ── Scenarios ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-brand-700" />
          Cenários ({article.scenarios.length})
        </h2>

        {article.scenarios.map((scenario, idx) => {
          const isExpanded = expandedScenarios.has(scenario.id);
          return (
            <div key={scenario.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Scenario header */}
              <button
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition"
                onClick={() => toggleScenario(scenario.id)}
              >
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{scenario.title}</p>
                  {!isExpanded && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{scenario.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', DIFFICULTY_CONFIG[scenario.difficulty].color)}>
                    {DIFFICULTY_CONFIG[scenario.difficulty].label}
                  </span>
                  {scenario.estimatedTime && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {scenario.estimatedTime}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Scenario body */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-sm text-gray-600">{scenario.description}</p>

                  {/* Steps */}
                  <div className="space-y-2.5">
                    {scenario.steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Observations */}
                  {scenario.observations && (
                    <div className="flex gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-1">Observações internas</p>
                        <p className="text-xs text-amber-800 leading-relaxed">{scenario.observations}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
