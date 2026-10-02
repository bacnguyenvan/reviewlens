import { useState } from 'react';
import { Search, Upload, Loader2 } from 'lucide-react';

interface AppInputFormProps {
  onFetch?: (query: string) => void;
}

export function AppInputForm({ onFetch }: AppInputFormProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetch = () => {
    if (!value.trim()) return;
    setLoading(true);
    // Simulate API call — replace with real fetch later
    setTimeout(() => {
      setLoading(false);
      onFetch?.(value);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFetch();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Search className="w-4 h-4 text-indigo-500" />
        <label className="text-sm font-semibold text-slate-900">Analyze a Google Play app</label>
      </div>
      <p className="text-xs text-slate-500 mb-4">Enter a package name or Google Play URL to fetch and analyze reviews.</p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="com.example.myapp"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
        />
        <button
          onClick={handleFetch}
          disabled={loading || !value.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching…
            </>
          ) : (
            'Fetch reviews'
          )}
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <button className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-700 rounded-lg transition-colors">
        <Upload className="w-4 h-4" />
        Import CSV
      </button>
    </div>
  );
}
