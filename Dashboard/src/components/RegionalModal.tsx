import { X } from 'lucide-react';

interface RegionalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const regions = [
  { title: 'KENYA', flag: '🇰🇪', status: 'Coming Soon' },
  { title: 'UGANDA', flag: '🇺🇬', status: 'Coming Soon' },
  { title: 'SOUTH AFRICA', flag: '🇿🇦', status: 'Coming Soon' },
  { title: 'NIGERIA', flag: '🇳🇬', status: 'Coming Soon' },
];

export function RegionalModal({ isOpen, onClose }: RegionalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-gradient-to-br from-[#0A1E3F] to-[#1B3B6F] border border-[#00C2FF]/30 rounded-2xl shadow-2xl shadow-[#00C2FF]/20 max-w-3xl w-full p-5 sm:p-8 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 hover:bg-[#00C2FF]/20 rounded-xl transition-colors z-10"
        >
          <X className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
        </button>

        <div className="mb-6 sm:mb-8 pr-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Regional News</h2>
          <p className="text-sm sm:text-base text-gray-400">
            Select a region to view localized cybersecurity updates
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {regions.map((region) => (
            <div
              key={region.title}
              className="bg-[#1B3B6F]/40 border border-[#00C2FF]/30 rounded-2xl p-5 sm:p-6 text-center space-y-3 sm:space-y-4 opacity-60 cursor-not-allowed"
            >
              <div className="text-5xl sm:text-6xl">{region.flag}</div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                {region.title}
              </h3>
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00C2FF]/20 text-[#00C2FF] rounded-xl text-xs sm:text-sm font-medium">
                {region.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
