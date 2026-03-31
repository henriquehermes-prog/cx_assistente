import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, createArticle } from '@/lib/articles';
import { ArticleMode, Scenario, DecisionTree } from '@/types/article';

export async function GET(_req: NextRequest) {
  return NextResponse.json(getAllArticles());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { problem, mode, scenarios, tree, tags } = body;

  if (!problem?.trim()) {
    return NextResponse.json({ error: 'O campo "problema" é obrigatório' }, { status: 400 });
  }

  const articleMode: ArticleMode = mode === 'guided' ? 'guided' : 'steps';

  if (articleMode === 'steps') {
    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      return NextResponse.json({ error: 'Adicione ao menos um cenário de resolução' }, { status: 400 });
    }
    const hasSteps = scenarios.every(
      (s: Scenario) => Array.isArray(s.steps) && s.steps.some((step: string) => step.trim())
    );
    if (!hasSteps) {
      return NextResponse.json({ error: 'Cada cenário deve ter ao menos um passo' }, { status: 400 });
    }
  }

  if (articleMode === 'guided' && (!tree || !tree.rootNodeId || !tree.nodes)) {
    return NextResponse.json({ error: 'Fluxo guiado inválido' }, { status: 400 });
  }

  const article = createArticle({
    problem: problem.trim(),
    mode: articleMode,
    ...(articleMode === 'steps' ? { scenarios } : { tree: tree as DecisionTree }),
    tags: tags ?? [],
  });

  return NextResponse.json(article, { status: 201 });
}
