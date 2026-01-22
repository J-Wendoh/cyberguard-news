import { Search, Calendar } from 'lucide-react';
import type { FilterOption } from '../lib/api';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  categories: FilterOption[];
  priorities: FilterOption[];
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

const priorityColors: Record<string, string> = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
};

const priorityActiveColors: Record<string, string> = {
  High: 'bg-red-500 text-white shadow-lg shadow-red-500/40',
  Medium: 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/40',
  Low: 'bg-green-500 text-white shadow-lg shadow-green-500/40',
};

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  categories,
  priorities,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: SearchFiltersProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-[#00C2FF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by keyword or source..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#1B3B6F]/30 border border-[#00C2FF]/30 rounded-2xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-[#00C2FF] focus:shadow-lg focus:shadow-[#00C2FF]/20 transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00C2FF]" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-3 py-2.5 sm:py-3 bg-[#1B3B6F]/30 border border-[#00C2FF]/30 rounded-2xl text-sm sm:text-base text-white focus:outline-none focus:border-[#00C2FF] focus:shadow-lg focus:shadow-[#00C2FF]/20 transition-all [color-scheme:dark]"
              placeholder="From date"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00C2FF]" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-3 py-2.5 sm:py-3 bg-[#1B3B6F]/30 border border-[#00C2FF]/30 rounded-2xl text-sm sm:text-base text-white focus:outline-none focus:border-[#00C2FF] focus:shadow-lg focus:shadow-[#00C2FF]/20 transition-all [color-scheme:dark]"
              placeholder="To date"
            />
          </div>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Priority</span>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => onPriorityChange('All')}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 ${
              selectedPriority === 'All'
                ? 'bg-[#00C2FF] text-[#0A1E3F] shadow-lg shadow-[#00C2FF]/40'
                : 'bg-[#1B3B6F]/40 text-white border border-[#00C2FF]/30 hover:bg-[#1B3B6F]/60 hover:border-[#00C2FF]/50'
            }`}
          >
            All
          </button>
          {priorities.map((p) => (
            <button
              key={p.priority}
              onClick={() => onPriorityChange(p.priority || '')}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 border ${
                selectedPriority === p.priority
                  ? priorityActiveColors[p.priority || ''] || 'bg-[#00C2FF] text-[#0A1E3F]'
                  : priorityColors[p.priority || ''] || 'bg-[#1B3B6F]/40 text-white border-[#00C2FF]/30'
              }`}
            >
              {p.priority} ({p.count})
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Category</span>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => onCategoryChange('All')}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 ${
              selectedCategory === 'All'
                ? 'bg-[#00C2FF] text-[#0A1E3F] shadow-lg shadow-[#00C2FF]/40'
                : 'bg-[#1B3B6F]/40 text-white border border-[#00C2FF]/30 hover:bg-[#1B3B6F]/60 hover:border-[#00C2FF]/50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => onCategoryChange(cat.category || '')}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 ${
                selectedCategory === cat.category
                  ? 'bg-[#00C2FF] text-[#0A1E3F] shadow-lg shadow-[#00C2FF]/40'
                  : 'bg-[#1B3B6F]/40 text-white border border-[#00C2FF]/30 hover:bg-[#1B3B6F]/60 hover:border-[#00C2FF]/50'
              }`}
            >
              {cat.category} ({cat.count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
