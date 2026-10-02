import type { Sentiment } from '../../data/mockData.ts';

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const config = {
    positive: { label: 'Positive', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    negative: { label: 'Negative', className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
    neutral: { label: 'Neutral', className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  };
  const { label, className } = config[sentiment];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
