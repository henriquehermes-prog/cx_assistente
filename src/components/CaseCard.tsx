'use client';

import { Case, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/case';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

interface Props {
  caseItem: Case;
  isSelected: boolean;
  onClick: () => void;
}

export default function CaseCard({ caseItem, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-xl border transition-all bg-white shadow-sm',
        isSelected
          ? 'border-brand-400 ring-2 ring-brand-100'
          : 'border-gray-200 hover:border-brand-300 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                CATEGORY_COLORS[caseItem.category]
              )}
            >
              {CATEGORY_LABELS[caseItem.category] ?? caseItem.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{caseItem.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{caseItem.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {caseItem.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
      </div>
    </button>
  );
}
