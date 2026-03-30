import { NextRequest, NextResponse } from 'next/server';
import { duplicateArticle } from '@/lib/articles';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const copy = duplicateArticle(params.id);
  if (!copy) return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
  return NextResponse.json(copy, { status: 201 });
}
