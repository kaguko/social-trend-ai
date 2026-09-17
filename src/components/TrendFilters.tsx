import React from 'react';
import { Search, TrendingUp, BarChart3, Activity, MessageSquare } from 'lucide-react';
import { FilterState, SocialPlatform, TrendCategory } from '../types';

interface TrendFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
}

const PLATFORMS: { id: 'all' | SocialPlatform; label: string; icon: string }[] = [
  { id: 'all', label: 'All Platforms', icon: '🌐' },
  { id: 'reddit', label: 'Reddit', icon: '🤖' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'twitter', label: 'X (Twitter)', icon: '⚡' },
];

const CATEGORIES: TrendCategory[] = [
  'All',
  'Tech & AI',
  'Gaming',
  'Creator Economy',
  'Finance & Crypto',
  'Lifestyle & Culture',
  'Entertainment'
];

export const TrendFilters: React.FC<TrendFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div id="trend-filters-container" className="space-y-3.5 mb-6">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-trends-input"
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search keywords, topics, or subreddits..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto text-xs text-slate-400 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <span className="px-2 py-1 font-medium text-slate-500">Sort:</span>
          <button
            onClick={() => onFilterChange({ sortBy: 'momentum' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filters.sortBy === 'momentum'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🔥 Virality Score
          </button>
          <button
            onClick={() => onFilterChange({ sortBy: 'growth' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filters.sortBy === 'growth'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            📈 Growth
          </button>
          <button
            onClick={() => onFilterChange({ sortBy: 'volume' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filters.sortBy === 'volume'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            💬 Volume
          </button>
        </div>
      </div>

      {/* Platform Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PLATFORMS.map((p) => {
          const isSelected = filters.platform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onFilterChange({ platform: p.id })}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => onFilterChange({ category: cat })}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isSelected
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
