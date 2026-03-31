// Tipos para o sistema de Artigos de Suporte

// ── Modo de resolução ─────────────────────────────────────────────────────────

export type ArticleMode = 'steps' | 'guided';

// ── Modo "Passo a passo" ──────────────────────────────────────────────────────

export interface Scenario {
  id: string;
  title: string;       // Nome curto do cenário
  whenToUse?: string;  // Contexto de quando aplicar (opcional)
  steps: string[];     // Passo a passo
}

// ── Modo "Fluxo guiado" (Decision Tree) ──────────────────────────────────────

export interface TreeAnswer {
  id: string;
  label: string;           // Ex: "Sim", "Não", "Mais de 6 meses"
  nextNodeId: string | null; // null = destino ainda não definido
}

export interface TreeNode {
  id: string;
  type: 'question' | 'solution';
  // Campos de pergunta:
  question?: string;
  answers?: TreeAnswer[];
  // Campos de solução:
  solutionTitle?: string;
  steps?: string[];
}

export interface DecisionTree {
  rootNodeId: string;
  nodes: Record<string, TreeNode>;
}

// ── Artigo ────────────────────────────────────────────────────────────────────

export interface Article {
  id: string;
  problem: string;        // O problema que este artigo resolve (obrigatório)
  mode: ArticleMode;      // Como a solução é apresentada
  scenarios?: Scenario[]; // Usado quando mode === 'steps'
  tree?: DecisionTree;    // Usado quando mode === 'guided'
  tags: string[];         // Tags para busca e filtro
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}
