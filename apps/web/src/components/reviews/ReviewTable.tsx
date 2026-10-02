import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { mockReviews } from '../../data/mockData.ts';
import type { Sentiment } from '../../data/mockData.ts';
import { ReviewItem } from './ReviewItem.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { LoadingSkeleton } from '../ui/LoadingSkeleton.tsx';

interface ReviewTableProps {
  loading?: boolean;
}

type SortOrder = 'newest' | 'oldest';
type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';
type SentimentFilter = 'all' | Sentiment;

export function ReviewTable({ loading = false }: ReviewTableProps) {
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const filtered = useMemo(() => {
    let items = [...mockReviews];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((r) => r.content.toLowerCase().includes(q) || r.author.toLowerCase().includes(q));
    }
    if (ratingFilter !== 'all') {
      items = items.filter((r) => r.rating === parseInt(ratingFilter));
    }
    if (sentimentFilter !== 'all') {
      items = items.filter((r) => r.sentiment === sentimentFilter);
    }
    items.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return items;
  }, [search, ratingFilter, sentimentFilter, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value as RatingFilter); setPage(1); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} stars</option>
            ))}
          </select>
          <select
            value={sentimentFilter}
            onChange={(e) => { setSentimentFilter(e.target.value as SentimentFilter); setPage(1); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value as SortOrder); setPage(1); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500">{filtered.length} reviews found</p>

      {/* List */}
      {paginated.length === 0 ? (
        <EmptyState
          icon={<Search className="w-5 h-5" />}
          title="No reviews found"
          description="Try adjusting your search or filters to find reviews."
        />
      ) : (
        <div className="space-y-2">
          {paginated.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
