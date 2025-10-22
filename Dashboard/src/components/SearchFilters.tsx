import { Search } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ['All', 'Malware', 'Phishing', 'General Security'];

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: SearchFiltersProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-[#00C2FF]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by keyword or source..."
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#1B3B6F]/30 border border-[#00C2FF]/30 rounded-2xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-[#00C2FF] focus:shadow-lg focus:shadow-[#00C2FF]/20 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-[#00C2FF] text-[#0A1E3F] shadow-lg shadow-[#00C2FF]/40'
                : 'bg-[#1B3B6F]/40 text-white border border-[#00C2FF]/30 hover:bg-[#1B3B6F]/60 hover:border-[#00C2FF]/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
