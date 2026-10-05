import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const STEPS = [
  'Reading reviews',
  'Finding recurring themes',
  'Identifying complaints and bugs',
  'Detecting feature requests',
  'Generating recommendations',
];

const STEP_INTERVAL_MS = 2_500;

export function AnalysisLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-indigo-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Analyzing your reviews…</p>
          <p className="text-xs text-slate-500 mt-0.5">This may take 10–30 seconds</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  done
                    ? 'bg-emerald-500'
                    : active
                    ? 'bg-indigo-500'
                    : 'bg-slate-200'
                }`}
              >
                {done ? (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : active ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ) : null}
              </div>
              <span
                className={`text-xs transition-colors ${
                  done
                    ? 'text-slate-400 line-through'
                    : active
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
