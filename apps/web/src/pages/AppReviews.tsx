import { useState } from 'react';
import { MessageSquare, PackageSearch, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Review, ReviewInsight } from '@reviewlens/shared';
import { ReviewTable } from '../components/reviews/ReviewTable.tsx';
import { AppInputForm } from '../components/forms/AppInputForm.tsx';
import { AnalysisLoader } from '../components/insights/AnalysisLoader.tsx';
import { analyzeReviews, ApiError } from '../services/api.ts';
import type { FetchedData, AnalyzedData } from '../App.tsx';

interface AppReviewsProps {
  fetched: FetchedData | null;
  analyzed: AnalyzedData | null;
  onFetchSuccess: (packageName: string, reviews: Review[]) => void;
  onAnalyzeSuccess: (packageName: string, insights: ReviewInsight[]) => void;
}

type AnalyzeState = 'idle' | 'loading' | 'error';

export function AppReviews({
  fetched,
  analyzed,
  onFetchSuccess,
  onAnalyzeSuccess,
}: AppReviewsProps) {
  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>('idle');
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const isReal = fetched !== null;
  const isAnalyzing = analyzeState === 'loading';
  const reviewCount = isReal ? fetched.reviews.length : 12_480;

  // Already analyzed this same package
  const alreadyAnalyzed =
    analyzed !== null && fetched !== null && analyzed.packageName === fetched.packageName;

  const handleAnalyze = async () => {
    if (!fetched || isAnalyzing) return;
    setAnalyzeState('loading');
    setAnalyzeError(null);
    try {
      const result = await analyzeReviews(fetched.reviews);
      onAnalyzeSuccess(fetched.packageName, result.insights);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      setAnalyzeError(msg);
      setAnalyzeState('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">App Reviews</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isReal
              ? `${reviewCount} reviews fetched for ${fetched.packageName}`
              : 'Browse, search, and filter user reviews.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg shrink-0">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-700">
            {reviewCount.toLocaleString()} {isReal ? 'fetched' : 'total'}
          </span>
        </div>
      </div>

      {/* Analyze reviews — shown when real reviews are available */}
      {isReal && !isAnalyzing && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Analyze reviews</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {alreadyAnalyzed
                    ? `Already analyzed — ${analyzed.insights.length} insights found.`
                    : `Identify patterns across ${reviewCount.toLocaleString()} reviews automatically.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => void handleAnalyze()}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 ${
                alreadyAnalyzed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300 disabled:cursor-not-allowed'
              }`}
            >
              {alreadyAnalyzed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  View insights
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze reviews
                </>
              )}
            </button>
          </div>

          {/* Error state */}
          {analyzeState === 'error' && analyzeError && (
            <div className="mt-3 flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{analyzeError}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && <AnalysisLoader />}

      {/* Fetch form — no real data yet */}
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

      {/* Fetch another app — real data loaded */}
      {isReal && !isAnalyzing && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors list-none flex items-center gap-1">
            <Loader2 className="w-3 h-3 group-open:rotate-90 transition-transform" />
            Fetch a different app
          </summary>
          <div className="mt-3">
            <AppInputForm onSuccess={onFetchSuccess} />
          </div>
        </details>
      )}

      {/* Review list */}
      <ReviewTable reviews={isReal ? fetched.reviews : undefined} />
    </div>
  );
}
