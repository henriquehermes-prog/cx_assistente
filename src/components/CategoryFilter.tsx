'use client';

import { Case, Category, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/case';
import clsx from 'clsx';

interface Props {
  cases: Case[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ cases, active, onChange }: Props) {
  // Conta quantos casos há por categoria
  const counts = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});

  const categories = Object.keys(counts) as Category[];

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('all')}
        className={clsx(
          'px-3 py-1.5 rounded-full text-sm font-medium transition',
          active === 'all'
            ? 'bg-brand-900 text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
        )}
      >
        Todos ({cases.length})
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-sm font-medium transition',
            active === cat
              ? 'bg-brand-900 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
          )}
        >
          {CATEGORY_LABELS[cat] ?? cat} ({counts[cat]})
        </button>
      ))}
    </div>
  );
}
