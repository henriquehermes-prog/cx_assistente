// CRUD server-side para artigos — usa fs para ler/escrever data/articles.json

import fs from 'fs';
import path from 'path';
import { Article } from '@/types/article';

const DATA_PATH = path.join(process.cwd(), 'data', 'articles.json');

function readArticles(): Article[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as Article[];
}

function writeArticles(articles: Article[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(articles, null, 2), 'utf-8');
}

export function getAllArticles(): Article[] {
  return readArticles();
}

export function getArticleById(id: string): Article | undefined {
  return readArticles().find((a) => a.id === id);
}

export function getArticlesByCategory(category: string): Article[] {
  return readArticles().filter((a) => a.category === category);
}

export function createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Article {
  const articles = readArticles();
  const article: Article = {
    ...data,
    id: `art_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };
  articles.push(article);
  writeArticles(articles);
  return article;
}

export function updateArticle(id: string, data: Partial<Omit<Article, 'id' | 'createdAt'>>): Article | null {
  const articles = readArticles();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  articles[idx] = { ...articles[idx], ...data, updatedAt: new Date().toISOString() };
  writeArticles(articles);
  return articles[idx];
}

export function deleteArticle(id: string): boolean {
  const articles = readArticles();
  const filtered = articles.filter((a) => a.id !== id);
  if (filtered.length === articles.length) return false;
  writeArticles(filtered);
  return true;
}

export function duplicateArticle(id: string): Article | null {
  const original = getArticleById(id);
  if (!original) return null;
  const copy: Article = {
    ...original,
    id: `art_${Date.now()}`,
    title: `${original.title} (cópia)`,
    status: 'needs_review',
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const articles = readArticles();
  articles.push(copy);
  writeArticles(articles);
  return copy;
}

export function incrementUsage(id: string): void {
  const articles = readArticles();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    articles[idx].usageCount += 1;
    writeArticles(articles);
  }
}
