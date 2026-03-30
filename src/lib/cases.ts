// Funções utilitárias para carregar e acessar os casos da base de conhecimento

import casesData from '../../data/cases.json';
import { Case } from '@/types/case';

// Retorna todos os casos
export function getAllCases(): Case[] {
  return casesData as Case[];
}

// Retorna um caso pelo ID
export function getCaseById(id: string): Case | undefined {
  return (casesData as Case[]).find((c) => c.id === id);
}

// Retorna casos filtrados por categoria
export function getCasesByCategory(category: string): Case[] {
  return (casesData as Case[]).filter((c) => c.category === category);
}

// Retorna as categorias únicas disponíveis
export function getCategories(): string[] {
  const categories = (casesData as Case[]).map((c) => c.category);
  return [...new Set(categories)];
}
