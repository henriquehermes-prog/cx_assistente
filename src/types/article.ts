// Tipos e constantes para o sistema de Artigos de Suporte

export type ArticleCategory =
  | 'pagamento'
  | 'integracao'
  | 'erro_tecnico'
  | 'acesso'
  | 'estorno'
  | 'outros';

export type ArticleSystem =
  | 'shopify'
  | 'woocommerce'
  | 'api'
  | 'dashboard'
  | 'checkout'
  | 'webhook'
  | 'outro';

export type ArticleStatus = 'updated' | 'needs_review' | 'outdated';

export type Difficulty = 'easy' | 'medium' | 'advanced';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  steps: string[];
  estimatedTime?: string;
  difficulty: Difficulty;
  observations?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  category: ArticleCategory;
  system: ArticleSystem;
  tags: string[];
  status: ArticleStatus;
  responsible: string;
  scenarios: Scenario[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

// ─── Labels ───────────────────────────────────────────────

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  pagamento: 'Pagamento',
  integracao: 'Integração',
  erro_tecnico: 'Erro Técnico',
  acesso: 'Acesso',
  estorno: 'Estorno',
  outros: 'Outros',
};

export const ARTICLE_SYSTEM_LABELS: Record<ArticleSystem, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  api: 'API',
  dashboard: 'Dashboard',
  checkout: 'Checkout',
  webhook: 'Webhook',
  outro: 'Outro',
};

// ─── Colors ───────────────────────────────────────────────

export const ARTICLE_CATEGORY_COLORS: Record<ArticleCategory, string> = {
  pagamento: 'bg-green-100 text-green-800',
  integracao: 'bg-blue-100 text-blue-800',
  erro_tecnico: 'bg-red-100 text-red-800',
  acesso: 'bg-purple-100 text-purple-800',
  estorno: 'bg-orange-100 text-orange-800',
  outros: 'bg-gray-100 text-gray-800',
};

export const ARTICLE_STATUS_CONFIG: Record<ArticleStatus, { label: string; color: string }> = {
  updated: { label: 'Atualizado', color: 'bg-emerald-100 text-emerald-800' },
  needs_review: { label: 'Precisa revisão', color: 'bg-yellow-100 text-yellow-800' },
  outdated: { label: 'Desatualizado', color: 'bg-red-100 text-red-800' },
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Fácil', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Médio', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: 'Avançado', color: 'bg-red-100 text-red-700' },
};

// ─── Sugestão inteligente de categoria ────────────────────

const CATEGORY_KEYWORDS: Record<ArticleCategory, string[]> = {
  pagamento: ['pagamento', 'pix', 'boleto', 'cartão', 'cobrança', 'charge', 'fatura', 'valor', 'cobrado'],
  integracao: ['integração', 'integrar', 'shopify', 'woocommerce', 'api', 'sistema', 'plataforma', 'plugin'],
  erro_tecnico: ['erro', 'bug', 'falha', 'timeout', '500', '404', 'instável', 'crash', 'não carrega'],
  acesso: ['acesso', 'login', 'senha', 'bloqueio', 'autenticação', 'conta', 'entrar', 'não consegue acessar'],
  estorno: ['estorno', 'reembolso', 'cancelamento', 'devolução', 'chargeback', 'devolver'],
  outros: [],
};

export function suggestCategory(title: string): ArticleCategory | null {
  const lower = title.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ArticleCategory, string[]][]) {
    if (cat === 'outros') continue;
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return null;
}

// ─── Templates por categoria ──────────────────────────────

export const CATEGORY_TEMPLATES: Record<ArticleCategory, Partial<Scenario>> = {
  pagamento: {
    title: 'Cenário 1',
    description: 'Descreva o cenário de pagamento',
    steps: ['Verificar status da transação no dashboard', 'Confirmar dados do pedido', 'Acionar time de pagamentos se necessário'],
    difficulty: 'easy',
  },
  integracao: {
    title: 'Cenário 1',
    description: 'Descreva o cenário de integração',
    steps: ['Verificar configurações da integração', 'Checar logs de erro', 'Validar credenciais de acesso'],
    difficulty: 'medium',
  },
  erro_tecnico: {
    title: 'Cenário 1',
    description: 'Descreva o erro técnico',
    steps: ['Reproduzir o erro', 'Coletar logs e prints', 'Acionar time técnico com evidências'],
    difficulty: 'advanced',
  },
  acesso: {
    title: 'Cenário 1',
    description: 'Descreva o problema de acesso',
    steps: ['Verificar status da conta', 'Orientar reset de senha', 'Checar bloqueios ativos'],
    difficulty: 'easy',
  },
  estorno: {
    title: 'Cenário 1',
    description: 'Descreva o cenário de estorno',
    steps: ['Confirmar elegibilidade do estorno', 'Registrar solicitação', 'Informar prazo ao cliente'],
    difficulty: 'easy',
  },
  outros: {
    title: 'Cenário 1',
    description: 'Descreva o cenário',
    steps: ['Passo 1', 'Passo 2'],
    difficulty: 'easy',
  },
};
