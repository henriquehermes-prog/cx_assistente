'use client';

import { useState } from 'react';
import { Case, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/case';
import clsx from 'clsx';
import { Copy, Check, X, AlertCircle, MessageSquare, ListChecks, HelpCircle } from 'lucide-react';

interface Props {
  caseItem: Case;
  onClose: () => void;
}

export default function CaseDetail({ caseItem, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'steps' | 'message' | 'causes'>('steps');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(caseItem.clientMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                CATEGORY_COLORS[caseItem.category]
              )}
            >
              {CATEGORY_LABELS[caseItem.category] ?? caseItem.category}
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">{caseItem.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{caseItem.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-gray-100 -mb-5 pb-0">
          {[
            { key: 'steps', label: 'Passo a Passo', icon: ListChecks },
            { key: 'message', label: 'Mensagem Pronta', icon: MessageSquare },
            { key: 'causes', label: 'Possíveis Causas', icon: HelpCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition -mb-px',
                tab === key
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto flex-1">
        {tab === 'steps' && (
          <div className="space-y-3">
            {caseItem.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'message' && (
          <div>
            <div className="relative bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {caseItem.clientMessage}
              <button
                onClick={handleCopy}
                className={clsx(
                  'absolute top-3 right-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition',
                  copied
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-brand-50'
                )}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * Substitua os campos em [colchetes] antes de enviar ao cliente.
            </p>
          </div>
        )}

        {tab === 'causes' && (
          <div className="space-y-2">
            {caseItem.possibleCauses.map((cause, i) => (
              <div key={i} className="flex gap-2 items-start">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{cause}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Internal notes footer */}
      {caseItem.internalNotes && (
        <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-1">Notas Internas (não enviar ao cliente)</p>
              <p className="text-xs text-amber-800 leading-relaxed">{caseItem.internalNotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
