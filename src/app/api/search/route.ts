import { NextRequest, NextResponse } from 'next/server';
import { getAllCases, getCasesByCategory } from '@/lib/cases';
import { searchCases } from '@/lib/search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category');

  // Começa com todos os casos ou filtra por categoria
  const baseCases = category ? getCasesByCategory(category) : getAllCases();

  // Aplica busca fuzzy
  const results = searchCases(baseCases, query);

  return NextResponse.json(results);
}
