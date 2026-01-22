import { ExternalLink } from 'lucide-react';
import type { NewsArticle } from '../lib/api';

interface NewsCardProps {
  article: NewsArticle;
  isLatest?: boolean;
  onClick: () => void;
}

const categoryIcons: Record<string, string> = {
  Malware: '🦠',
  Phishing: '🎣',
  Ransomware: '🔒',
  'Data Breach': '💾',
  Vulnerability: '🐛',
  'General Security': '🛡️',
};

const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
  High: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  Low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
};

const getPlaceholderImage = (category: string): string => {
  return `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop&q=80`;
};

export function NewsCard({ article, isLatest = false, onClick }: NewsCardProps) {
  const categoryIcon = categoryIcons[article.category] || '🛡️';
  const formattedDate = new Date(article.published_date || article.created_at).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const priority = priorityStyles[article.priority] || priorityStyles.Medium;
  const imageUrl = getPlaceholderImage(article.category);

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-[#1B3B6F]/40 backdrop-blur-sm border border-[#00C2FF]/30 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[#1B3B6F]/60 hover:border-[#00C2FF] hover:shadow-xl hover:shadow-[#00C2FF]/30 hover:-translate-y-1 ${
        isLatest ? 'ring-2 ring-[#00C2FF]/50 shadow-lg shadow-[#00C2FF]/30' : ''
      }`}
    >
      <div className="w-full h-48 overflow-hidden bg-[#0A1F3D] relative">
        <img
          src={imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&q=80';
          }}
        />
        {/* Priority Badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold ${priority.bg} ${priority.text} border ${priority.border}`}>
          {article.priority}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {isLatest && (
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="text-xl sm:text-2xl">🆕</span>
            <span className="text-[#00C2FF] font-bold text-xs sm:text-sm tracking-wide">
              LATEST UPDATE
            </span>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <h3 className="text-white font-semibold text-base sm:text-lg leading-tight group-hover:text-[#00C2FF] transition-colors line-clamp-2">
              {article.title}
            </h3>
            <ExternalLink className="w-4 h-4 text-[#00C2FF] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-lg sm:text-xl">{categoryIcon}</span>
            <span className="text-[#00C2FF] font-medium">{article.category}</span>
          </div>

          {article.summary && (
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">
              {article.summary}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-400">
            <span className="font-medium truncate">{article.source}</span>
            <span className="text-xs whitespace-nowrap">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
