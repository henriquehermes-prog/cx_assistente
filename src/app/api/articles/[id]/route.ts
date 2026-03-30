import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle, incrementUsage } from '@/lib/articles';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const article = getArticleById(params.id);
  if (!article) return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
  incrementUsage(params.id);
  return NextResponse.json(article);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = updateArticle(params.id, body);
  if (!updated) return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const deleted = deleteArticle(params.id);
  if (!deleted) return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
  return NextResponse.json({ success: true });
}
