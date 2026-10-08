import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import type { ReviewInsight, ReviewInsightCategory, ReviewInsightSeverity } from '@reviewlens/shared';

// ── Badge helpers ─────────────────────────────────────────────────────────────

const severityStyles: Record<ReviewInsightSeverity, { badge: string; dot: string }> = {
  high: {
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    dot: 'bg-rose-500',
  },
  medium: {
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-400',
  },
  low: {
    badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
  },
};

const categoryStyles: Record<ReviewInsightCategory, { badge: string; label: string }> = {
  complaint: { badge: 'bg-rose-50 text-rose-700', label: 'Complaint' },
  feature_request: { badge: 'bg-violet-50 text-violet-700', label: 'Feature Request' },
  positive: { badge: 'bg-emerald-50 text-emerald-700', label: 'Positive' },
};

interface SeverityBadgeProps {
  severity: ReviewInsightSeverity;
}

export function InsightSeverityBadge({ severity }: SeverityBadgeProps) {
  const { badge } = severityStyles[severity];
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}>
      {label}
    </span>
  );
}

interface CategoryBadgeProps {
  category: ReviewInsightCategory;
}

export function InsightCategoryBadge({ category }: CategoryBadgeProps) {
  const { badge, label } = categoryStyles[category];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badge}`}>
      {label}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface ReviewInsightCardProps {
  insight: ReviewInsight;
  compact?: boolean;
}

export function ReviewInsightCard({ insight, compact = false }: ReviewInsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { dot } = severityStyles[insight.severity];

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-2 h-2 rounded-full ${dot} mt-1.5 shrink-0`} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
              {insight.title}
            </h3>
          </div>
          <InsightSeverityBadge severity={insight.severity} />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 mb-3 pl-5">
          <InsightCategoryBadge category={insight.category} />
          <span className="text-xs text-slate-500">
            {insight.mentions.toLocaleString()} mention{insight.mentions !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-600 leading-relaxed pl-5 mb-3">
          {insight.summary}
        </p>

        {/* Keywords */}
        {insight.keywords && insight.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-5 mb-3">
            {insight.keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* First example quote */}
        {insight.examples.length > 0 && (
          <blockquote className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3 ml-5 leading-relaxed">
            "{insight.examples[0]}"
          </blockquote>
        )}

        {/* Expand toggle */}
        {!compact && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 ml-5 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Show less' : 'Show details'}
          </button>
        )}
      </div>

      {/* Expanded section */}
      {!compact && expanded && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          {/* Additional quotes */}
          {insight.examples.length > 1 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">More user quotes</p>
              <div className="space-y-2">
                {insight.examples.slice(1).map((quote, i) => (
                  <blockquote
                    key={i}
                    className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3 leading-relaxed"
                  >
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Suggested action */}
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-900 mb-0.5">
                  Suggested action
                </p>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  {insight.suggestedAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
