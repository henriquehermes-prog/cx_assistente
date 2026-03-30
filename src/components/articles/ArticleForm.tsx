'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Article, Scenario, ArticleCategory, ArticleSystem, ArticleStatus,
  ARTICLE_CATEGORY_LABELS, ARTICLE_SYSTEM_LABELS, ARTICLE_STATUS_CONFIG,
  suggestCategory, CATEGORY_TEMPLATES,
} from '@/types/article';
import ScenarioEditor from './ScenarioEditor';
import clsx from 'clsx';
import { Plus, Sparkles, X, Tag, AlertCircle } from 'lucide-react';

type FormData = Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;

interface Props {
  initial?: Article;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const newScenario = (category: ArticleCategory): Scenario => ({
  id: `sc_${Date.now()}`,
  title: '',
  description: '',
  steps: [''],
  difficulty: 'easy',
  ...(CATEGORY_TEMPLATES[category] ?? {}),
});

export default function ArticleForm({ initial, onSave, onCancel, isSaving }: Props) {
  const [form, setForm] = useState<FormData>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? 'outros',
    system: initial?.system ?? 'outro',
    tags: initial?.tags ?? [],
    status: initial?.status ?? 'needs_review',
    responsible: initial?.responsible ?? '',
    scenarios: initial?.scenarios ?? [],
  });

  const [tagInput, setTagInput] = useState('');
  const [categorySuggestion, setCategorySuggestion] = useState<ArticleCategory | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sugestão automática de categoria conforme o título
  useEffect(() => {
    const suggestion = suggestCategory(form.title);
    if (suggestion && suggestion !== form.category) {
      setCategorySuggestion(suggestion);
    } else {
      setCategorySuggestion(null);
    }
  }, [form.title, form.category]);

  const setField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  }, []);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setField('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setField('tags', form.tags.filter((t) => t !== tag));

  const addScenario = () =>
    setField('scenarios', [...form.scenarios, newScenario(form.category)]);

  const updateScenario = (idx: number, updated: Scenario) => {
    const scenarios = [...form.scenarios];
    scenarios[idx] = updated;
    setField('scenarios', scenarios);
  };

  const deleteScenario = (idx: number) =>
    setField('scenarios', form.scenarios.filter((_, i) => i !== idx));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Título obrigatório';
    if (!form.description.trim()) e.description = 'Descrição obrigatória';
    if (!form.responsible.trim()) e.responsible = 'Responsável obrigatório';
    if (form.scenarios.length === 0) e.scenarios = 'Adicione ao menos um cenário';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Informações Básicas ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Informações Básicas</h2>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Título do artigo *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Ex: Webhook não está sendo recebido pelo cliente"
            className={clsx(
              'w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-400',
              errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
            )}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}

          {/* Sugestão de categoria */}
          {categorySuggestion && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-brand-50 border border-brand-200 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="text-xs text-brand-700">
                Sugestão: categoria <strong>{ARTICLE_CATEGORY_LABELS[categorySuggestion]}</strong>
              </span>
              <button
                type="button"
                onClick={() => { setField('category', categorySuggestion); setCategorySuggestion(null); }}
                className="ml-auto text-xs font-medium text-brand-700 hover:text-brand-600 transition"
              >
                Aceitar
              </button>
              <button
                type="button"
                onClick={() => setCategorySuggestion(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição curta *</label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Descreva resumidamente o problema que este artigo resolve..."
            rows={2}
            className={clsx(
              'w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none',
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
            )}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Category + System */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria *</label>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value as ArticleCategory)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              {(Object.keys(ARTICLE_CATEGORY_LABELS) as ArticleCategory[]).map((cat) => (
                <option key={cat} value={cat}>{ARTICLE_CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sistema / Integração *</label>
            <select
              value={form.system}
              onChange={(e) => setField('system', e.target.value as ArticleSystem)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              {(Object.keys(ARTICLE_SYSTEM_LABELS) as ArticleSystem[]).map((sys) => (
                <option key={sys} value={sys}>{ARTICLE_SYSTEM_LABELS[sys]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status + Responsible */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status *</label>
            <select
              value={form.status}
              onChange={(e) => setField('status', e.target.value as ArticleStatus)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              {(Object.keys(ARTICLE_STATUS_CONFIG) as ArticleStatus[]).map((s) => (
                <option key={s} value={s}>{ARTICLE_STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Responsável *</label>
            <input
              type="text"
              value={form.responsible}
              onChange={(e) => setField('responsible', e.target.value)}
              placeholder="Ex: Time de Integrações"
              className={clsx(
                'w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-400',
                errors.responsible ? 'border-red-300 bg-red-50' : 'border-gray-200'
              )}
            />
            {errors.responsible && <p className="text-xs text-red-500 mt-1">{errors.responsible}</p>}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Tags</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 flex-wrap min-h-[38px]">
              <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-brand-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder={form.tags.length === 0 ? 'Digite uma tag e pressione Enter...' : ''}
                className="flex-1 min-w-[120px] text-xs outline-none bg-transparent"
              />
            </div>
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 text-xs bg-brand-100 text-brand-800 rounded-lg hover:bg-brand-200 transition font-medium"
            >
              Adicionar
            </button>
          </div>
        </div>
      </section>

      {/* ── Cenários ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Cenários</h2>
            <p className="text-xs text-gray-500 mt-0.5">Cada cenário representa uma situação específica dentro deste problema</p>
          </div>
          <button
            type="button"
            onClick={addScenario}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-900 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo cenário
          </button>
        </div>

        {errors.scenarios && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors.scenarios}
          </div>
        )}

        {form.scenarios.length === 0 ? (
          <div
            onClick={addScenario}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition"
          >
            <Plus className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 font-medium">Adicionar primeiro cenário</p>
            <p className="text-xs text-gray-400 mt-1">Clique para adicionar um cenário de atendimento</p>
          </div>
        ) : (
          form.scenarios.map((sc, idx) => (
            <ScenarioEditor
              key={sc.id}
              scenario={sc}
              index={idx}
              onChange={(updated) => updateScenario(idx, updated)}
              onDelete={() => deleteScenario(idx)}
            />
          ))
        )}
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-brand-900 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar artigo'}
        </button>
      </div>
    </form>
  );
}
