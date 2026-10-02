import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Review } from '../../data/mockData.ts';
import { RatingStars } from '../ui/RatingStars.tsx';
import { SentimentBadge } from '../ui/SentimentBadge.tsx';

interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.content.length > 120;
  const displayContent = !expanded && isLong
    ? review.content.slice(0, 120) + '…'
    : review.content;

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-indigo-600">{review.author[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <RatingStars rating={review.rating} />
          <span className="text-xs font-medium text-slate-700">{review.author}</span>
          <span className="text-xs text-slate-400">{review.appVersion}</span>
          <span className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{displayContent}</p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </div>
      <div className="shrink-0">
        <SentimentBadge sentiment={review.sentiment} />
      </div>
    </div>
  );
}
