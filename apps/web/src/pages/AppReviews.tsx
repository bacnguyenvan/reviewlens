import { MessageSquare, PackageSearch } from 'lucide-react';
import type { Review } from '@reviewlens/shared';
import { ReviewTable } from '../components/reviews/ReviewTable.tsx';
import { AppInputForm } from '../components/forms/AppInputForm.tsx';
import type { FetchedData } from '../App.tsx';

interface AppReviewsProps {
  fetched: FetchedData | null;
  onFetchSuccess: (packageName: string, reviews: Review[]) => void;
}

export function AppReviews({ fetched, onFetchSuccess }: AppReviewsProps) {
  const isReal = fetched !== null;
  const reviewCount = isReal ? fetched.reviews.length : 12_480;
  const subtitle = isReal
    ? `Showing ${reviewCount} fetched reviews for ${fetched.packageName}`
    : 'Browse, search, and filter user reviews.';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">App Reviews</h2>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg shrink-0">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-700">
            {reviewCount.toLocaleString()} {isReal ? 'fetched' : 'total'}
          </span>
        </div>
      </div>

      {/* Fetch form — shown when no real data yet */}
      {!isReal && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PackageSearch className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500">
              Fetch real reviews from Google Play, or browse the sample data below.
            </p>
          </div>
          <AppInputForm onSuccess={onFetchSuccess} />
        </div>
      )}

      {/* Fetch another app — shown when real data is loaded */}
      {isReal && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs font-medium text-indigo-700 mb-3">
            Fetch reviews for a different app
          </p>
          <AppInputForm onSuccess={onFetchSuccess} />
        </div>
      )}

      <ReviewTable reviews={isReal ? fetched.reviews : undefined} />
    </div>
  );
}
