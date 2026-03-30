// Motor de busca fuzzy usando Fuse.js
// Tolera erros de digitação e busca em múltiplos campos

import Fuse from 'fuse.js';
import { Case } from '@/types/case';

// Configuração do Fuse.js — ajuste threshold para maior/menor tolerância
const FUSE_OPTIONS: Fuse.IFuseOptions<Case> = {
  // Campos onde a busca será realizada, com pesos diferentes
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'tags', weight: 0.3 },
    { name: 'description', weight: 0.2 },
    { name: 'possibleCauses', weight: 0.1 },
  ],
  // 0.0 = match perfeito exigido; 1.0 = qualquer coisa
  threshold: 0.4,
  // Inclui o score de relevância no resultado
  includeScore: true,
  // Mínimo de caracteres para considerar partial match
  minMatchCharLength: 2,
};

let fuseInstance: Fuse<Case> | null = null;

// Inicializa (ou reutiliza) a instância do Fuse com os casos
export function getSearchEngine(cases: Case[]): Fuse<Case> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(cases, FUSE_OPTIONS);
  }
  return fuseInstance;
}

// Reinicia a instância (útil quando os dados mudam)
export function resetSearchEngine(): void {
  fuseInstance = null;
}

// Realiza a busca e retorna casos ordenados por relevância
export function searchCases(cases: Case[], query: string): Case[] {
  if (!query.trim()) return cases;

  const fuse = getSearchEngine(cases);
  const results = fuse.search(query);

  // Retorna apenas os itens, ordenados por score (menor = mais relevante)
  return results.map((r) => r.item);
}
