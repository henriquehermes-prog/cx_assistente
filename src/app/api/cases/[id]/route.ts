import { NextRequest, NextResponse } from 'next/server';
import { getCaseById } from '@/lib/cases';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const caseItem = getCaseById(params.id);

  if (!caseItem) {
    return NextResponse.json({ error: 'Caso não encontrado' }, { status: 404 });
  }

  return NextResponse.json(caseItem);
}
