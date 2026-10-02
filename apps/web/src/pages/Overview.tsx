import { BarChart2, Star, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Review } from '@reviewlens/shared';
import { MetricCard } from '../components/ui/MetricCard.tsx';
import { ReviewTrendChart } from '../components/charts/ReviewTrendChart.tsx';
import { InsightCard } from '../components/insights/InsightCard.tsx';
import { AppInputForm } from '../components/forms/AppInputForm.tsx';
import { ReviewItem } from '../components/reviews/ReviewItem.tsx';
import { mockInsights, mockReviews } from '../data/mockData.ts';
import type { Page } from '../components/layout/Sidebar.tsx';

interface OverviewProps {
  onNavigate: (page: Page) => void;
  onFetchSuccess: (packageName: string, reviews: Review[]) => void;
}

export function Overview({ onNavigate, onFetchSuccess }: OverviewProps) {
  const recentReviews = mockReviews.slice(0, 4);
  const topInsights = mockInsights.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Good morning, Alex</h2>
          <p className="text-sm text-slate-500 mt-0.5">Understand what your users are saying.</p>
        </div>
        <button
          onClick={() => onNavigate('reviews')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Analyze an app
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* App Input */}
      <AppInputForm onSuccess={onFetchSuccess} />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Reviews"
          value="12,480"
          trend="+12.8%"
          trendUp={true}
          iconBg="bg-indigo-50"
          icon={<BarChart2 className="w-4 h-4 text-indigo-500" />}
        />
        <MetricCard
          label="Average Rating"
          value="4.2 / 5"
          trend="+0.3"
          trendUp={true}
          iconBg="bg-amber-50"
          icon={<Star className="w-4 h-4 text-amber-500" />}
        />
        <MetricCard
          label="Positive Sentiment"
          value="76.4%"
          trend="+5.2%"
          trendUp={true}
          iconBg="bg-emerald-50"
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
        />
        <MetricCard
          label="Issues Detected"
          value="18"
          trend="6 high priority"
          trendUp={false}
          iconBg="bg-rose-50"
          icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
        />
      </div>

      {/* Chart */}
      <ReviewTrendChart />

      {/* Insights + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Insights */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Key insights</h3>
            <button
              onClick={() => onNavigate('insights')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {topInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} compact />
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Recent reviews</h3>
            <button
              onClick={() => onNavigate('reviews')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentReviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
