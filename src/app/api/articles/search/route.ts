import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    { name: 'problem', weight: 0.55 },
    { name: 'tags', weight: 0.25 },
    { name: 'scenarios.title', weight: 0.12 },
    { name: 'scenarios.whenToUse', weight: 0.08 },
  ],
  threshold: 0.4,
  includeScore: true,
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const articles = getAllArticles();
  if (!q.trim()) return NextResponse.json(articles);
  const fuse = new Fuse(articles, fuseOptions);
  return NextResponse.json(fuse.search(q).map((r) => r.item));
}
