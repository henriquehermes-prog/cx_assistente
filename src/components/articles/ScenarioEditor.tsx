'use client';

import { useState } from 'react';
import { Scenario, Difficulty, DIFFICULTY_CONFIG } from '@/types/article';
import clsx from 'clsx';
import { ChevronDown, ChevronUp, Trash2, Plus, GripVertical, X } from 'lucide-react';

interface Props {
  scenario: Scenario;
  index: number;
  onChange: (updated: Scenario) => void;
  onDelete: () => void;
}

export default function ScenarioEditor({ scenario, index, onChange, onDelete }: Props) {
  const [expanded, setExpanded] = useState(true);

  const update = (fields: Partial<Scenario>) => onChange({ ...scenario, ...fields });

  const updateStep = (i: number, value: string) => {
    const steps = [...scenario.steps];
    steps[i] = value;
    update({ steps });
  };

  const addStep = () => update({ steps: [...scenario.steps, ''] });

  const removeStep = (i: number) =>
    update({ steps: scenario.steps.filter((_, idx) => idx !== i) });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Scenario header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full shrink-0">
          Cenário {index + 1}
        </span>
        <span className="text-sm font-medium text-gray-700 flex-1 truncate">
          {scenario.title || 'Sem título'}
        </span>
        <span className={clsx('text-xs px-2 py-0.5 rounded-full', DIFFICULTY_CONFIG[scenario.difficulty].color)}>
          {DIFFICULTY_CONFIG[scenario.difficulty].label}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-gray-400 hover:text-red-500 transition rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </div>

      {/* Scenario body */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Título do cenário *</label>
            <input
              type="text"
              value={scenario.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Ex: Erro de webhook no endpoint"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição do cenário *</label>
            <textarea
              value={scenario.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Descreva quando este cenário ocorre..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>

          {/* Difficulty + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nível de dificuldade *</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'advanced'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update({ difficulty: d })}
                    className={clsx(
                      'flex-1 text-xs py-1.5 rounded-lg border font-medium transition',
                      scenario.difficulty === d
                        ? clsx(DIFFICULTY_CONFIG[d].color, 'border-current')
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    {DIFFICULTY_CONFIG[d].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tempo estimado (opcional)</label>
              <input
                type="text"
                value={scenario.estimatedTime ?? ''}
                onChange={(e) => update({ estimatedTime: e.target.value || undefined })}
                placeholder="Ex: 15 min"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Passo a passo *</label>
            <div className="space-y-2">
              {scenario.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Passo ${i + 1}`}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  {scenario.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="p-1 text-gray-400 hover:text-red-400 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              className="mt-2 flex items-center gap-1.5 text-xs text-brand-700 hover:text-brand-600 font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar passo
            </button>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Observações internas <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={scenario.observations ?? ''}
              onChange={(e) => update({ observations: e.target.value || undefined })}
              placeholder="Notas internas, cuidados especiais, exceções..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
