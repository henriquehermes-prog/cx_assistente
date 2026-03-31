'use client';

import { useState } from 'react';
import { DecisionTree } from '@/types/article';
import { ArrowLeft, RotateCcw, CheckCircle2, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

interface PathEntry {
  nodeId: string;
  answerLabel: string;
}

interface Props {
  tree: DecisionTree;
}

export default function TreeViewer({ tree }: Props) {
  const [path, setPath] = useState<PathEntry[]>([
    { nodeId: tree.rootNodeId, answerLabel: '' },
  ]);

  const current = path[path.length - 1];
  const node = tree.nodes[current.nodeId];

  const choose = (nextNodeId: string, label: string) => {
    setPath((prev) => [...prev, { nodeId: nextNodeId, answerLabel: label }]);
  };

  const goBack = () => setPath((prev) => prev.slice(0, -1));

  const restart = () => setPath([{ nodeId: tree.rootNodeId, answerLabel: '' }]);

  if (!node) return null;

  return (
    <div className="space-y-4">
      {/* Breadcrumb — caminho percorrido */}
      {path.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <span className="text-xs text-gray-400">Caminho:</span>
          {path.slice(1).map((entry, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300 text-xs">→</span>}
              <span className="text-xs px-2.5 py-1 bg-brand-100 text-brand-800 rounded-full font-medium">
                {entry.answerLabel}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Nó atual */}
      {node.type === 'question' ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-2.5 mb-5">
            <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-base font-semibold text-gray-900 leading-snug">
              {node.question || '(pergunta sem texto)'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(node.answers ?? []).map((answer) => {
              const available = !!answer.nextNodeId;
              return (
                <button
                  key={answer.id}
                  onClick={() => available && choose(answer.nextNodeId!, answer.label)}
                  disabled={!available}
                  className={clsx(
                    'px-5 py-2.5 rounded-xl text-sm font-medium border transition',
                    available
                      ? 'bg-white border-gray-200 text-gray-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-800'
                      : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                  )}
                >
                  {answer.label}
                  {!available && (
                    <span className="ml-2 text-xs font-normal text-gray-300">(sem destino)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Solução encontrada */
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <h3 className="text-base font-semibold text-emerald-900">
              {node.solutionTitle || 'Solução encontrada'}
            </h3>
          </div>

          {(node.steps ?? []).filter(Boolean).length > 0 && (
            <ol className="space-y-3">
              {(node.steps ?? []).filter(Boolean).map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-emerald-800 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Navegação */}
      {path.length > 1 && (
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={restart}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Recomeçar
          </button>
        </div>
      )}
    </div>
  );
}
