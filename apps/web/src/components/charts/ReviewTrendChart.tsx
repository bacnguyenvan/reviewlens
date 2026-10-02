import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockTrendData } from '../../data/mockData.ts';

const ranges = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const;

interface TooltipPayloadEntry {
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-3 text-xs">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      <p className="text-slate-600">Reviews: <span className="font-semibold text-slate-900">{payload[0]?.value}</span></p>
      <p className="text-slate-600">Avg Rating: <span className="font-semibold text-slate-900">{payload[1]?.value}</span></p>
    </div>
  );
}

export function ReviewTrendChart() {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const data = mockTrendData.slice(-range);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Review Volume</h3>
          <p className="text-xs text-slate-500 mt-0.5">Daily reviews over time</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {ranges.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => setRange(days)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                range === days
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            interval={range === 7 ? 0 : range === 30 ? 5 : 14}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={(props) => <CustomTooltip active={props.active} payload={props.payload as unknown as TooltipPayloadEntry[] | undefined} label={String(props.label ?? '')} />} />
          <Area
            type="monotone"
            dataKey="reviews"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#reviewGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
          <Area
            type="monotone"
            dataKey="avgRating"
            stroke="#10b981"
            strokeWidth={1.5}
            fill="none"
            dot={false}
            activeDot={{ r: 3, fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-indigo-500 rounded" />
          <span className="text-xs text-slate-500">Review volume</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-500 rounded" />
          <span className="text-xs text-slate-500">Avg rating</span>
        </div>
      </div>
    </div>
  );
}
