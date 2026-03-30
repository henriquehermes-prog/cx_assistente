// Tipos principais da base de conhecimento de CX

export type Category =
  | 'estorno'
  | 'pagamento'
  | 'integracao'
  | 'acesso'
  | 'erro_tecnico'
  | 'outros';

export interface Case {
  id: string;
  title: string;
  category: Category;
  description: string;
  possibleCauses: string[];
  steps: string[];
  clientMessage: string;
  internalNotes: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  item: Case;
  score?: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  estorno: 'Estorno',
  pagamento: 'Pagamento',
  integracao: 'Integração',
  acesso: 'Acesso',
  erro_tecnico: 'Erro Técnico',
  outros: 'Outros',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  estorno: 'bg-orange-100 text-orange-800',
  pagamento: 'bg-green-100 text-green-800',
  integracao: 'bg-blue-100 text-blue-800',
  acesso: 'bg-purple-100 text-purple-800',
  erro_tecnico: 'bg-red-100 text-red-800',
  outros: 'bg-gray-100 text-gray-800',
};
