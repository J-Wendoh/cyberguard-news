import { Globe } from 'lucide-react';

interface HeaderProps {
  onRegionClick: () => void;
}

export function Header({ onRegionClick }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#0A1E3F] to-[#1B3B6F] border-b border-[#00C2FF]/20 shadow-lg shadow-[#00C2FF]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="text-2xl sm:text-3xl flex-shrink-0">🛡️</div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate">
              CyberSec Community
            </h1>
            <p className="text-xs sm:text-sm text-[#00C2FF] font-light hidden xs:block">
              Stay ahead of threats — globally.
            </p>
          </div>
        </div>

        <button
          onClick={onRegionClick}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1B3B6F] hover:bg-[#00C2FF]/20 border border-[#00C2FF]/30 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/30 group flex-shrink-0"
          title="Regional News"
        >
          <Globe className="w-5 h-5 text-[#00C2FF] group-hover:scale-110 transition-transform" />
          <span className="text-white text-sm font-medium hidden sm:inline">Regional News</span>
        </button>
      </div>
    </header>
  );
}
