import { MessageSquare } from 'lucide-react';
import { ReviewTable } from '../components/reviews/ReviewTable.tsx';

export function AppReviews() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">App Reviews</h2>
          <p className="text-sm text-slate-500 mt-0.5">Browse, search, and filter user reviews.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-700">12,480 total reviews</span>
        </div>
      </div>
      <ReviewTable />
    </div>
  );
}
