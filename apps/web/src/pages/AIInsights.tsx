import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { InsightCard } from '../components/insights/InsightCard.tsx';
import { mockInsights } from '../data/mockData.ts';
import type { InsightCategory } from '../data/mockData.ts';

type FilterType = 'All' | 'Complaints' | 'Feature requests' | 'Positive';

const filterMap: Record<FilterType, InsightCategory[] | null> = {
  All: null,
  Complaints: ['Bug', 'Performance', 'UX'],
  'Feature requests': ['Feature Request'],
  Positive: ['Positive'],
};

const filters: FilterType[] = ['All', 'Complaints', 'Feature requests', 'Positive'];

export function AIInsights() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filtered = mockInsights.filter((insight) => {
    const categories = filterMap[activeFilter];
    if (!categories) return true;
    return categories.includes(insight.category);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">AI Insights</h2>
        <p className="text-sm text-slate-500 mt-0.5">Discover patterns hidden in your app reviews.</p>
      </div>

      {/* Stats banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">AI analysis complete</p>
            <p className="text-xs text-indigo-200 mt-0.5">
              Analyzed 12,480 reviews · Found {mockInsights.length} insight groups · Last updated 2 hours ago
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-2xl font-bold">6</p>
            <p className="text-xs text-indigo-200">Total insights</p>
          </div>
          <div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-xs text-indigo-200">High severity</p>
          </div>
          <div>
            <p className="text-2xl font-bold">342</p>
            <p className="text-xs text-indigo-200">Top issue mentions</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeFilter === filter
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {filter}
          </button>
        ))}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} insights</span>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
