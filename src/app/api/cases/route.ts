import { NextRequest, NextResponse } from 'next/server';
import { getAllCases, getCasesByCategory } from '@/lib/cases';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const cases = category ? getCasesByCategory(category) : getAllCases();

  return NextResponse.json(cases);
}
