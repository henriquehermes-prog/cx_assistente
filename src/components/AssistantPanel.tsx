'use client';

import { useState } from 'react';
import { Case } from '@/types/case';
import { searchCases } from '@/lib/search';
import { Zap, X, ArrowRight, Loader2 } from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/case';
import clsx from 'clsx';

interface Props {
  cases: Case[];
  onSelectCase: (c: Case) => void;
  onClose: () => void;
}

// Assistente simulado: analisa a descrição do atendente e sugere casos
export default function AssistantPanel({ cases, onSelectCase, onClose }: Props) {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<Case[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    setHasSearched(false);

    // Simula latência de processamento (substituir por chamada real à IA no futuro)
    await new Promise((r) => setTimeout(r, 600));

    const results = searchCases(cases, description);
    setSuggestions(results.slice(0, 3)); // Mostra top 3
    setIsAnalyzing(false);
    setHasSearched(true);
  };

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-700" />
          <div>
            <h2 className="font-semibold text-brand-900">Assistente Inteligente</h2>
            <p className="text-xs text-brand-600">Descreva o problema do cliente e eu sugiro o caso mais adequado</p>
          </div>
        </div>
        <button onClick={onClose} className="text-brand-400 hover:text-brand-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAnalyze();
            }
          }}
          placeholder="Ex: O cliente foi cobrado duas vezes no cartão... / O webhook não está chegando no sistema deles..."
          rows={2}
          className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !description.trim()}
          className="px-4 py-2 bg-brand-900 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Analisar <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {hasSearched && (
        <div className="mt-4">
          {suggestions.length === 0 ? (
            <p className="text-sm text-brand-700 text-center py-2">
              Nenhum caso encontrado. Tente descrever de outra forma.
            </p>
          ) : (
            <div>
              <p className="text-xs font-semibold text-brand-700 mb-2">
                {suggestions.length} caso{suggestions.length > 1 ? 's' : ''} sugerido{suggestions.length > 1 ? 's' : ''}:
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="flex items-center gap-3 bg-white border border-brand-100 rounded-lg p-3 text-left hover:border-brand-300 hover:shadow-sm transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      <span className={clsx('text-xs px-1.5 py-0.5 rounded-full', CATEGORY_COLORS[c.category])}>
                        {CATEGORY_LABELS[c.category]}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
