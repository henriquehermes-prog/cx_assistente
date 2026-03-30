import { ARTICLE_STATUS_CONFIG, ArticleStatus } from '@/types/article';
import clsx from 'clsx';

interface Props {
  status: ArticleStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const config = ARTICLE_STATUS_CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        config.color,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          status === 'updated' ? 'bg-emerald-500' :
          status === 'needs_review' ? 'bg-yellow-500' : 'bg-red-500'
        )}
      />
      {config.label}
    </span>
  );
}
