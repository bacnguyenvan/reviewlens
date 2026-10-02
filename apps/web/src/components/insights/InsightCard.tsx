import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import type { Insight } from '../../data/mockData.ts';

interface InsightCardProps {
  insight: Insight;
  compact?: boolean;
}

const severityConfig = {
  High: { className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
  Medium: { className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  Low: { className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
};

const categoryConfig = {
  Performance: { className: 'bg-orange-50 text-orange-700' },
  UX: { className: 'bg-blue-50 text-blue-700' },
  'Feature Request': { className: 'bg-violet-50 text-violet-700' },
  Bug: { className: 'bg-rose-50 text-rose-700' },
  Positive: { className: 'bg-emerald-50 text-emerald-700' },
};

export function InsightCard({ insight, compact = false }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { className: severityClass } = severityConfig[insight.severity];
  const { className: categoryClass } = categoryConfig[insight.category];

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">{insight.title}</h3>
          </div>
          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${severityClass}`}>
            {insight.severity}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${categoryClass}`}>
            {insight.category}
          </span>
          <span className="text-xs text-slate-500">{insight.mentions.toLocaleString()} mentions</span>
        </div>
        <blockquote className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-3 leading-relaxed">
          "{insight.quotes[0]}"
        </blockquote>
        {!compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Show less' : 'Show details'}
          </button>
        )}
      </div>
      {!compact && expanded && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-700 mb-2">More user quotes</p>
            <div className="space-y-2">
              {insight.quotes.slice(1).map((quote, i) => (
                <blockquote key={i} className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-3 leading-relaxed">
                  "{quote}"
                </blockquote>
              ))}
            </div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-indigo-900 mb-0.5">Suggested action</p>
                <p className="text-xs text-indigo-700 leading-relaxed">{insight.suggestedAction}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
