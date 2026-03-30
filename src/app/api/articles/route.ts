import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, getArticlesByCategory, createArticle } from '@/lib/articles';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  const status = req.nextUrl.searchParams.get('status');

  let articles = category ? getArticlesByCategory(category) : getAllArticles();

  if (status) {
    articles = articles.filter((a) => a.status === status);
  }

  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { title, description, category, system, tags, status, responsible, scenarios } = body;

  if (!title || !description || !category || !system || !responsible) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
  }

  const article = createArticle({ title, description, category, system, tags: tags ?? [], status: status ?? 'needs_review', responsible, scenarios: scenarios ?? [] });

  return NextResponse.json(article, { status: 201 });
}
