import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'description', weight: 0.2 },
    { name: 'tags', weight: 0.2 },
    { name: 'scenarios.title', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const category = req.nextUrl.searchParams.get('category');
  const status = req.nextUrl.searchParams.get('status');

  let articles = getAllArticles();

  if (category) articles = articles.filter((a) => a.category === category);
  if (status) articles = articles.filter((a) => a.status === status);

  if (!q.trim()) return NextResponse.json(articles);

  const fuse = new Fuse(articles, fuseOptions);
  const results = fuse.search(q).map((r) => r.item);

  return NextResponse.json(results);
}
