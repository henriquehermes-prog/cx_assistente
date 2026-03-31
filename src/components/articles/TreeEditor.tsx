'use client';

import { useState } from 'react';
import { DecisionTree, TreeNode, TreeAnswer } from '@/types/article';
import clsx from 'clsx';
import { Plus, X, HelpCircle, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

// ── ID factories ──────────────────────────────────────────────────────────────
const uid = () => `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const aid = () => `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

// ── Node factories ────────────────────────────────────────────────────────────
const makeQuestion = (): TreeNode => ({
  id: uid(),
  type: 'question',
  question: '',
  answers: [
    { id: aid(), label: 'Sim', nextNodeId: null },
    { id: aid(), label: 'Não', nextNodeId: null },
  ],
});

const makeSolution = (): TreeNode => ({
  id: uid(),
  type: 'solution',
  solutionTitle: '',
  steps: [''],
});

// ── Tree helpers ──────────────────────────────────────────────────────────────
function getDescendants(nodes: Record<string, TreeNode>, nodeId: string): string[] {
  const node = nodes[nodeId];
  if (!node) return [];
  const result: string[] = [nodeId];
  if (node.type === 'question' && node.answers) {
    for (const ans of node.answers) {
      if (ans.nextNodeId) result.push(...getDescendants(nodes, ans.nextNodeId));
    }
  }
  return result;
}

function pruneSubtree(
  nodes: Record<string, TreeNode>,
  rootId: string
): Record<string, TreeNode> {
  const toDelete = new Set(getDescendants(nodes, rootId));
  const result = { ...nodes };
  toDelete.forEach((id) => delete result[id]);
  return result;
}

// ── Default tree (exported for ArticleForm) ───────────────────────────────────
export function makeDefaultTree(): DecisionTree {
  const root = makeQuestion();
  return { rootNodeId: root.id, nodes: { [root.id]: root } };
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  tree: DecisionTree;
  onChange: (tree: DecisionTree) => void;
}

export default function TreeEditor({ tree, onChange }: Props) {
  const [converter, setConverter] = useState<{ nodeId: string; text: string } | null>(null);

  // ── Node updates ─────────────────────────────────────────────────────────────

  const patchNode = (id: string, patch: Partial<TreeNode>) =>
    onChange({
      ...tree,
      nodes: { ...tree.nodes, [id]: { ...tree.nodes[id], ...patch } },
    });

  const patchAnswer = (nodeId: string, answerId: string, patch: Partial<TreeAnswer>) => {
    const node = tree.nodes[nodeId];
    if (!node?.answers) return;
    patchNode(nodeId, {
      answers: node.answers.map((a) => (a.id === answerId ? { ...a, ...patch } : a)),
    });
  };

  // ── Answer management ────────────────────────────────────────────────────────

  const addAnswer = (nodeId: string) => {
    const node = tree.nodes[nodeId];
    if (!node?.answers) return;
    patchNode(nodeId, {
      answers: [...node.answers, { id: aid(), label: 'Opção', nextNodeId: null }],
    });
  };

  const removeAnswer = (nodeId: string, answerId: string) => {
    const node = tree.nodes[nodeId];
    if (!node?.answers) return;
    const ans = node.answers.find((a) => a.id === answerId);
    const cleaned = ans?.nextNodeId
      ? pruneSubtree(tree.nodes, ans.nextNodeId)
      : { ...tree.nodes };
    onChange({
      ...tree,
      nodes: {
        ...cleaned,
        [nodeId]: { ...node, answers: node.answers.filter((a) => a.id !== answerId) },
      },
    });
  };

  // ── Destination management ────────────────────────────────────────────────────

  const addDestination = (
    nodeId: string,
    answerId: string,
    type: 'question' | 'solution'
  ) => {
    const newNode = type === 'question' ? makeQuestion() : makeSolution();
    const node = tree.nodes[nodeId];
    if (!node?.answers) return;
    onChange({
      ...tree,
      nodes: {
        ...tree.nodes,
        [newNode.id]: newNode,
        [nodeId]: {
          ...node,
          answers: node.answers.map((a) =>
            a.id === answerId ? { ...a, nextNodeId: newNode.id } : a
          ),
        },
      },
    });
  };

  const detachNode = (nodeId: string, parentNodeId: string, parentAnswerId: string) => {
    const cleaned = pruneSubtree(tree.nodes, nodeId);
    const parent = cleaned[parentNodeId];
    if (parent?.answers) {
      cleaned[parentNodeId] = {
        ...parent,
        answers: parent.answers.map((a) =>
          a.id === parentAnswerId ? { ...a, nextNodeId: null } : a
        ),
      };
    }
    onChange({ ...tree, nodes: cleaned });
  };

  // ── Steps management (solution nodes) ────────────────────────────────────────

  const updateStep = (nodeId: string, idx: number, value: string) => {
    const node = tree.nodes[nodeId];
    if (!node?.steps) return;
    const steps = [...node.steps];
    steps[idx] = value;
    patchNode(nodeId, { steps });
  };

  const addStep = (nodeId: string) => {
    const node = tree.nodes[nodeId];
    patchNode(nodeId, { steps: [...(node?.steps ?? []), ''] });
  };

  const removeStep = (nodeId: string, idx: number) => {
    const node = tree.nodes[nodeId];
    if (!node?.steps || node.steps.length <= 1) return;
    patchNode(nodeId, { steps: node.steps.filter((_, i) => i !== idx) });
  };

  const applyConverter = () => {
    if (!converter) return;
    const lines = converter.text
      .split(/\n/)
      .map((l) => l.replace(/^[\d\-\*•.]+[\s.)]*/, '').trim())
      .filter(Boolean);
    if (lines.length > 0) patchNode(converter.nodeId, { steps: lines });
    setConverter(null);
  };

  // ── Recursive renderer ────────────────────────────────────────────────────────

  const renderNode = (
    nodeId: string,
    depth: number,
    parentNodeId?: string,
    parentAnswerId?: string
  ): React.ReactNode => {
    const node = tree.nodes[nodeId];
    if (!node) return null;

    if (node.type === 'question') {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50/40">
          {/* Question header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-100">
            <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <input
              type="text"
              value={node.question ?? ''}
              onChange={(e) => patchNode(nodeId, { question: e.target.value })}
              placeholder="Digite a pergunta..."
              className="flex-1 min-w-0 text-sm font-medium text-gray-900 bg-transparent outline-none placeholder-blue-300"
            />
            {parentNodeId && parentAnswerId && (
              <button
                type="button"
                onClick={() => detachNode(nodeId, parentNodeId, parentAnswerId)}
                title="Remover esta pergunta e todos os ramos"
                className="shrink-0 p-1 rounded text-blue-200 hover:text-red-400 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Answers */}
          <div className="px-4 pt-3 pb-4 space-y-4">
            {(node.answers ?? []).map((answer) => (
              <div key={answer.id}>
                {/* Answer label row */}
                <div className="flex items-center gap-1.5 mb-2">
                  <ChevronRight className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <input
                    type="text"
                    value={answer.label}
                    onChange={(e) =>
                      patchAnswer(nodeId, answer.id, { label: e.target.value })
                    }
                    className="text-xs font-semibold bg-white border border-blue-200 rounded-full px-3 py-1 text-blue-700 outline-none focus:ring-2 focus:ring-blue-300 transition min-w-[52px]"
                    style={{ width: `${Math.max(answer.label.length * 8 + 36, 52)}px` }}
                  />
                  {(node.answers?.length ?? 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(nodeId, answer.id)}
                      className="text-gray-300 hover:text-red-400 transition shrink-0"
                      title="Remover resposta"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Child node or add-destination buttons */}
                <div className="ml-5 pl-3 border-l-2 border-blue-100">
                  {answer.nextNodeId ? (
                    renderNode(answer.nextNodeId, depth + 1, nodeId, answer.id)
                  ) : (
                    <div className="flex items-center gap-2 py-1">
                      <button
                        type="button"
                        onClick={() => addDestination(nodeId, answer.id, 'question')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Adicionar pergunta
                      </button>
                      <button
                        type="button"
                        onClick={() => addDestination(nodeId, answer.id, 'solution')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Definir solução
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add answer */}
            <button
              type="button"
              onClick={() => addAnswer(nodeId)}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-600 transition ml-5"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar resposta
            </button>
          </div>
        </div>
      );
    }

    // Solution node
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40">
        {/* Solution header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <input
            type="text"
            value={node.solutionTitle ?? ''}
            onChange={(e) => patchNode(nodeId, { solutionTitle: e.target.value })}
            placeholder="Título da solução (ex: Solicitar estorno direto)..."
            className="flex-1 min-w-0 text-sm font-medium text-gray-900 bg-transparent outline-none placeholder-emerald-300"
          />
          {parentNodeId && parentAnswerId && (
            <button
              type="button"
              onClick={() => detachNode(nodeId, parentNodeId, parentAnswerId)}
              title="Remover esta solução"
              className="shrink-0 p-1 rounded text-emerald-200 hover:text-red-400 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Steps */}
        <div className="px-4 pt-3 pb-4 space-y-1.5">
          {(node.steps ?? []).map((step, stepIdx) => (
            <div key={stepIdx} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                {stepIdx + 1}
              </span>
              <input
                type="text"
                value={step}
                onChange={(e) => updateStep(nodeId, stepIdx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addStep(nodeId);
                    setTimeout(() => {
                      const inputs = document.querySelectorAll<HTMLInputElement>(
                        `[data-sol="${nodeId}"]`
                      );
                      inputs[inputs.length - 1]?.focus();
                    }, 0);
                  }
                }}
                data-sol={nodeId}
                placeholder={`Passo ${stepIdx + 1}...`}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
              {(node.steps?.length ?? 0) > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(nodeId, stepIdx)}
                  className="text-gray-200 hover:text-red-400 transition shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => addStep(nodeId)}
              className="flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar passo
            </button>
            <button
              type="button"
              onClick={() => setConverter({ nodeId, text: '' })}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              <Sparkles className="w-3 h-3" />
              Converter texto
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div>{renderNode(tree.rootNodeId, 0)}</div>

      {/* Converter modal */}
      {converter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Converter texto em passos</h3>
            <p className="text-xs text-gray-500 mb-4">
              Cole um texto livre. Cada linha ou item numerado vira um passo automaticamente.
            </p>
            <textarea
              value={converter.text}
              onChange={(e) =>
                setConverter((prev) => (prev ? { ...prev, text: e.target.value } : null))
              }
              placeholder={'1. Verificar logs\n2. Confirmar endpoint\n3. Acionar time técnico'}
              rows={8}
              autoFocus
              className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setConverter(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyConverter}
                disabled={!converter.text.trim()}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
              >
                Converter em passos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
