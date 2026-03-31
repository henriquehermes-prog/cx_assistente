'use client';

import { useState, useEffect, useRef } from 'react';
import { Article, ArticleMode, DecisionTree, Scenario } from '@/types/article';
import clsx from 'clsx';
import {
  Plus, X, Sparkles, Zap, Layers, ChevronDown, ChevronRight,
  Copy, ArrowUp, ArrowDown, List, GitBranch,
} from 'lucide-react';
import TreeEditor, { makeDefaultTree } from './TreeEditor';

type FormData = Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;

interface Props {
  initial?: Article;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const makeScenario = (title = 'Cenário padrão'): Scenario => ({
  id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  title,
  whenToUse: '',
  steps: ['', '', ''],
});

export default function ArticleForm({ initial, onSave, onCancel, isSaving }: Props) {
  // ── UI display mode (quick vs full) ──────────────────────
  const [displayMode, setDisplayMode] = useState<'quick' | 'full'>('quick');

  // ── Article resolution mode ───────────────────────────────
  const [articleMode, setArticleMode] = useState<ArticleMode>(
    initial?.mode ?? 'steps'
  );

  // ── Common state ──────────────────────────────────────────
  const [problem, setProblem] = useState(initial?.problem ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const suggestTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Steps mode state ──────────────────────────────────────
  const [scenarios, setScenarios] = useState<Scenario[]>(
    initial?.scenarios?.length ? initial.scenarios : [makeScenario()]
  );
  const firstId = initial?.scenarios?.[0]?.id ?? scenarios[0].id;
  const [expanded, setExpanded] = useState<Set<string>>(new Set([firstId]));
  const [converter, setConverter] = useState<{ scenarioId: string; text: string } | null>(null);

  // ── Guided mode state ─────────────────────────────────────
  const [tree, setTree] = useState<DecisionTree>(
    initial?.tree ?? makeDefaultTree()
  );

  // auto full-mode when editing article with tags
  useEffect(() => {
    if (initial?.tags?.length) setDisplayMode('full');
  }, [initial]);

  // similar problem suggestions
  useEffect(() => {
    clearTimeout(suggestTimer.current);
    if (problem.length < 6) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/articles/search?q=${encodeURIComponent(problem)}`);
        const data: Article[] = await res.json();
        setSuggestions((initial ? data.filter((a) => a.id !== initial.id) : data).slice(0, 3));
      } catch { /* noop */ }
    }, 400);
    return () => clearTimeout(suggestTimer.current);
  }, [problem, initial]);

  // ── Scenario helpers ──────────────────────────────────────

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const updateScenario = (id: string, patch: Partial<Scenario>) =>
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const updateStep = (scenarioId: string, stepIdx: number, value: string) =>
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== scenarioId) return s;
        const steps = [...s.steps];
        steps[stepIdx] = value;
        return { ...s, steps };
      })
    );

  const addStep = (scenarioId: string) =>
    setScenarios((prev) =>
      prev.map((s) => s.id === scenarioId ? { ...s, steps: [...s.steps, ''] } : s)
    );

  const removeStep = (scenarioId: string, stepIdx: number) =>
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== scenarioId || s.steps.length <= 1) return s;
        return { ...s, steps: s.steps.filter((_, i) => i !== stepIdx) };
      })
    );

  const addScenario = () => {
    const sc = makeScenario(`Cenário ${scenarios.length + 1}`);
    setScenarios((prev) => [...prev, sc]);
    setExpanded((prev) => new Set([...prev, sc.id]));
  };

  const duplicateScenario = (id: string) => {
    const src = scenarios.find((s) => s.id === id);
    if (!src) return;
    const copy: Scenario = {
      ...src,
      id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: `${src.title} (cópia)`,
    };
    const idx = scenarios.findIndex((s) => s.id === id);
    setScenarios((prev) => [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]);
    setExpanded((prev) => new Set([...prev, copy.id]));
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    setExpanded((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const moveScenario = (id: string, dir: -1 | 1) => {
    const idx = scenarios.findIndex((s) => s.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= scenarios.length) return;
    const next = [...scenarios];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setScenarios(next);
  };

  const applyConverter = () => {
    if (!converter) return;
    const lines = converter.text
      .split(/\n/)
      .map((l) => l.replace(/^[\d\-\*•.]+[\s.)]*/, '').trim())
      .filter(Boolean);
    if (lines.length > 0) updateScenario(converter.scenarioId, { steps: lines });
    setConverter(null);
  };

  // ── Tags ──────────────────────────────────────────────────

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  // ── Validation & submit ───────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!problem.trim()) e.problem = 'Descreva o problema';
    if (articleMode === 'steps') {
      scenarios.forEach((s, i) => {
        if (!s.steps.some((step) => step.trim()))
          e[`steps_${s.id}`] = `Cenário ${i + 1}: adicione ao menos um passo`;
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (articleMode === 'steps') {
      await onSave({
        problem: problem.trim(),
        mode: 'steps',
        scenarios: scenarios.map((s, i) => ({
          ...s,
          title: s.title.trim() || `Cenário ${i + 1}`,
          steps: s.steps.filter((step) => step.trim()),
          whenToUse: s.whenToUse?.trim() || undefined,
        })),
        tags,
      });
    } else {
      await onSave({ problem: problem.trim(), mode: 'guided', tree, tags });
    }
  };

  // ─────────────────────────────────────────────────────────

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-10">

        {/* ── Modo de resolução ── */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Tipo de resolução</p>
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => setArticleMode('steps')}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition flex-1',
                articleMode === 'steps'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              <List className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div>Passo a passo</div>
                <div className={clsx('text-xs font-normal', articleMode === 'steps' ? 'text-gray-300' : 'text-gray-400')}>
                  Cenários com instruções lineares
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setArticleMode('guided')}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition flex-1',
                articleMode === 'guided'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              <GitBranch className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div>Fluxo guiado</div>
                <div className={clsx('text-xs font-normal', articleMode === 'guided' ? 'text-gray-300' : 'text-gray-400')}>
                  Perguntas que levam à solução correta
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── Toggle rápido/completo (apenas em steps) ── */}
        {articleMode === 'steps' && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full w-fit">
            <button
              type="button"
              onClick={() => setDisplayMode('quick')}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition',
                displayMode === 'quick' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              Rápido
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('full')}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition',
                displayMode === 'full' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Completo
            </button>
          </div>
        )}

        {/* ── Problema ── */}
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Qual é o problema?
            <span className="text-red-400 ml-1 font-normal">*</span>
          </label>
          <textarea
            value={problem}
            onChange={(e) => {
              setProblem(e.target.value);
              if (errors.problem) setErrors((prev) => { const n = { ...prev }; delete n.problem; return n; });
            }}
            placeholder="Ex: Cliente não consegue receber webhook após configurar o endpoint..."
            rows={3}
            autoFocus
            className={clsx(
              'w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none transition',
              errors.problem ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
            )}
          />
          {errors.problem && <p className="text-xs text-red-500 mt-1.5">{errors.problem}</p>}

          {suggestions.length > 0 && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Artigos similares — confira antes de criar:
              </p>
              <ul className="space-y-1">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <a href={`/articles/${s.id}`} target="_blank" rel="noreferrer"
                      className="text-xs text-amber-800 hover:text-amber-600 underline line-clamp-1">
                      {s.problem}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Conteúdo: Passo a passo OR Fluxo guiado ── */}
        {articleMode === 'steps' ? (

          /* ── Cenários ── */
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Cenários de resolução</h2>
                {scenarios.length > 1 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {scenarios.length} cenários · cada um com seu próprio passo a passo
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={addScenario}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar cenário
              </button>
            </div>

            <div className="space-y-2">
              {scenarios.map((scenario, idx) => {
                const isOpen = expanded.has(scenario.id);
                const stepError = errors[`steps_${scenario.id}`];

                return (
                  <div
                    key={scenario.id}
                    className={clsx(
                      'rounded-xl border bg-white transition-all',
                      isOpen ? 'border-gray-300 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {/* Cabeçalho */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(scenario.id)}
                        className="shrink-0 text-gray-400 hover:text-gray-600 transition"
                      >
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      {isOpen ? (
                        <input
                          type="text"
                          value={scenario.title}
                          onChange={(e) => updateScenario(scenario.id, { title: e.target.value })}
                          placeholder="Nome do cenário..."
                          className="flex-1 min-w-0 text-sm font-medium text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-gray-300 py-0.5 transition"
                        />
                      ) : (
                        <span
                          className="flex-1 min-w-0 text-sm font-medium text-gray-700 truncate cursor-pointer"
                          onClick={() => toggleExpand(scenario.id)}
                        >
                          {scenario.title || `Cenário ${idx + 1}`}
                          {scenario.steps.filter(Boolean).length > 0 && (
                            <span className="ml-2 text-xs font-normal text-gray-400">
                              {scenario.steps.filter(Boolean).length} passos
                            </span>
                          )}
                        </span>
                      )}

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button type="button" onClick={() => moveScenario(scenario.id, -1)} disabled={idx === 0}
                          title="Mover para cima"
                          className="p-1.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-0 disabled:pointer-events-none transition">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => moveScenario(scenario.id, 1)} disabled={idx === scenarios.length - 1}
                          title="Mover para baixo"
                          className="p-1.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-0 disabled:pointer-events-none transition">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => duplicateScenario(scenario.id)} title="Duplicar cenário"
                          className="p-1.5 rounded text-gray-300 hover:text-gray-600 transition">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => removeScenario(scenario.id)} disabled={scenarios.length <= 1}
                          title="Remover cenário"
                          className="p-1.5 rounded text-gray-300 hover:text-red-400 disabled:opacity-0 disabled:pointer-events-none transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Corpo */}
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-5 border-t border-gray-100 pt-4">

                        {displayMode === 'full' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">
                              Quando usar este cenário
                              <span className="ml-1.5 font-normal text-gray-400">opcional</span>
                            </label>
                            <textarea
                              value={scenario.whenToUse ?? ''}
                              onChange={(e) => updateScenario(scenario.id, { whenToUse: e.target.value })}
                              placeholder="Ex: Quando o endpoint está acessível mas o firewall bloqueia nosso IP..."
                              rows={2}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none transition"
                            />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-500">
                              Passo a passo <span className="text-red-400">*</span>
                            </label>
                            <button type="button" onClick={() => setConverter({ scenarioId: scenario.id, text: '' })}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition">
                              <Sparkles className="w-3 h-3" />
                              Converter texto em passos
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {scenario.steps.map((step, stepIdx) => (
                              <div key={stepIdx} className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {stepIdx + 1}
                                </span>
                                <input type="text" value={step}
                                  onChange={(e) => updateStep(scenario.id, stepIdx, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addStep(scenario.id);
                                      setTimeout(() => {
                                        const inputs = document.querySelectorAll<HTMLInputElement>(`[data-step="${scenario.id}"]`);
                                        inputs[inputs.length - 1]?.focus();
                                      }, 0);
                                    }
                                  }}
                                  data-step={scenario.id}
                                  placeholder={`Passo ${stepIdx + 1}...`}
                                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                                {scenario.steps.length > 1 && (
                                  <button type="button" onClick={() => removeStep(scenario.id, stepIdx)}
                                    className="text-gray-200 hover:text-red-400 transition shrink-0">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {stepError && <p className="text-xs text-red-500 mt-1.5">{stepError}</p>}

                          <button type="button" onClick={() => addStep(scenario.id)}
                            className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition">
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar passo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        ) : (

          /* ── Fluxo guiado ── */
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Fluxo de decisão</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Perguntas com Sim/Não (ou opções customizadas) que levam à solução correta
                </p>
              </div>
            </div>
            <TreeEditor tree={tree} onChange={setTree} />
          </div>
        )}

        {/* ── Tags (completo em steps, sempre em guided) ── */}
        {(displayMode === 'full' || articleMode === 'guided') && (
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-1">
              Tags
              <span className="ml-2 text-xs font-normal text-gray-400">opcional</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Facilita a busca. Pressione Enter para adicionar.</p>
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white min-h-[44px] focus-within:ring-2 focus-within:ring-gray-900 transition">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input type="text" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder={tags.length === 0 ? 'webhook, estorno, shopify...' : ''}
                className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
              />
            </div>
          </div>
        )}

        {/* ── Ações ── */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button type="button" onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition">
            Cancelar
          </button>
          <button type="submit" disabled={isSaving}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {isSaving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar artigo'}
          </button>
        </div>
      </form>

      {/* ── Modal: Converter texto em passos (cenários) ── */}
      {converter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Converter texto em passos</h3>
            <p className="text-xs text-gray-500 mb-4">
              Cole um texto livre. Cada linha ou item numerado vira um passo automaticamente.
            </p>
            <textarea
              value={converter.text}
              onChange={(e) => setConverter((prev) => prev ? { ...prev, text: e.target.value } : null)}
              placeholder={'1. Verificar os logs do dashboard\n2. Confirmar a URL do endpoint\n3. Testar com Postman...'}
              rows={8}
              autoFocus
              className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setConverter(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition">
                Cancelar
              </button>
              <button type="button" onClick={applyConverter} disabled={!converter.text.trim()}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition disabled:opacity-50">
                Converter em passos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
