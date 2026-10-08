import { useState } from 'react';
import { Sparkles, ArrowRight, MessageSquare } from 'lucide-react';
import type { ReviewInsight, ReviewInsightCategory } from '@reviewlens/shared';
import { ReviewInsightCard } from '../components/insights/ReviewInsightCard.tsx';
import { InsightCard } from '../components/insights/InsightCard.tsx';
import { mockInsights } from '../data/mockData.ts';
import type { InsightCategory } from '../data/mockData.ts';
import type { AnalyzedData, FetchedData } from '../App.tsx';
import type { Page } from '../components/layout/Sidebar.tsx';

// ── Helpers ───────────────────────────────────────────────────────────────────

type RealFilter = 'all' | ReviewInsightCategory;
const REAL_FILTERS: Array<{ value: RealFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'complaint', label: 'Complaints' },
  { value: 'feature_request', label: 'Feature Requests' },
  { value: 'positive', label: 'Positive' },
];

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function sortInsights(insights: ReviewInsight[]): ReviewInsight[] {
  return [...insights].sort((a, b) => {
    const sev = (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
    return sev !== 0 ? sev : b.mentions - a.mentions;
  });
}

// ── Mock-data filter (legacy) ─────────────────────────────────────────────────

type MockFilter = 'All' | 'Complaints' | 'Feature requests' | 'Positive';
const mockFilterMap: Record<MockFilter, InsightCategory[] | null> = {
  All: null,
  Complaints: ['Bug', 'Performance', 'UX'],
  'Feature requests': ['Feature Request'],
  Positive: ['Positive'],
};
const MOCK_FILTERS: MockFilter[] = ['All', 'Complaints', 'Feature requests', 'Positive'];

// ── Component ─────────────────────────────────────────────────────────────────

interface AIInsightsProps {
  analyzed: AnalyzedData | null;
  fetched: FetchedData | null;
  onNavigate: (page: Page) => void;
}

export function AIInsights({ analyzed, fetched, onNavigate }: AIInsightsProps) {
  const [realFilter, setRealFilter] = useState<RealFilter>('all');
  const [mockFilter, setMockFilter] = useState<MockFilter>('All');

  const isReal = analyzed !== null;

  // ── Real insights view ────────────────────────────────────────────────────

  if (isReal) {
    const sorted = sortInsights(analyzed.insights);
    const filtered =
      realFilter === 'all' ? sorted : sorted.filter((i) => i.category === realFilter);

    const highCount = sorted.filter((i) => i.severity === 'high').length;
    const topMentions = Math.max(...sorted.map((i) => i.mentions), 0);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Insights</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Analysis of <span className="font-medium text-slate-700">{analyzed.packageName}</span>
          </p>
        </div>

        {/* Stats banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Analysis complete</p>
              <p className="text-xs text-indigo-200 mt-0.5">
                {fetched ? `${fetched.reviews.length.toLocaleString()} reviews analyzed` : 'Reviews analyzed'} ·{' '}
                {sorted.length} insight{sorted.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-2xl font-bold">{sorted.length}</p>
              <p className="text-xs text-indigo-200">Total insights</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{highCount}</p>
              <p className="text-xs text-indigo-200">High severity</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{topMentions.toLocaleString()}</p>
              <p className="text-xs text-indigo-200">Top issue mentions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {REAL_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setRealFilter(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                realFilter === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} insights</span>
        </div>

        {/* No themes at all */}
        {sorted.length === 0 && (
          <div className="text-center py-14 text-slate-500">
            <p className="text-sm font-medium">No recurring themes found in these reviews.</p>
            <p className="text-xs text-slate-400 mt-1">
              The reviews may be too diverse or too few to form meaningful clusters.
            </p>
          </div>
        )}

        {/* Insight cards */}
        {sorted.length > 0 && filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No insights in this category.
          </div>
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((insight, i) => (
              <ReviewInsightCard key={i} insight={insight} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  // ── No analysis yet: prompt + mock data ──────────────────────────────────

  const filteredMock = mockInsights.filter((insight) => {
    const cats = mockFilterMap[mockFilter];
    if (!cats) return true;
    return cats.includes(insight.category);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Insights</h2>
        <p className="text-sm text-slate-500 mt-0.5">Discover patterns hidden in your app reviews.</p>
      </div>

      {/* Call to action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Analyze your reviews</p>
            <p className="text-xs text-indigo-200 mt-0.5">
              {fetched
                ? `${fetched.reviews.length.toLocaleString()} reviews ready to analyze for ${fetched.packageName}`
                : 'Fetch reviews from Google Play first, then run the analysis.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate(fetched ? 'reviews' : 'overview')}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          {fetched ? (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze reviews
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              Fetch reviews first
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Mock data preview */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">
          Sample insights preview
        </p>

        <div className="flex items-center gap-2 mb-4">
          {MOCK_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setMockFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mockFilter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto">{filteredMock.length} insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMock.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
}
