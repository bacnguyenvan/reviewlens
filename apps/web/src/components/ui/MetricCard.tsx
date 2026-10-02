import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  icon: ReactNode;
  iconBg: string;
}

export function MetricCard({ label, value, trend, trendUp = true, icon, iconBg }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</span>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
