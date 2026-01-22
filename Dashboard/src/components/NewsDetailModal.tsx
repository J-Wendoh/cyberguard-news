import { X, ExternalLink } from 'lucide-react';
import type { NewsArticle } from '../lib/api';

interface NewsDetailModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, string> = {
  Malware: '🦠',
  Phishing: '🎣',
  Ransomware: '🔒',
  'Data Breach': '💾',
  Vulnerability: '🐛',
  'General Security': '🛡️',
};

const priorityStyles: Record<string, { bg: string; text: string }> = {
  High: { bg: 'bg-red-500/20', text: 'text-red-400' },
  Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  Low: { bg: 'bg-green-500/20', text: 'text-green-400' },
};

export function NewsDetailModal({ article, isOpen, onClose }: NewsDetailModalProps) {
  if (!isOpen || !article) return null;

  const categoryIcon = categoryIcons[article.category] || '🛡️';
  const priority = priorityStyles[article.priority] || priorityStyles.Medium;
  const formattedDate = new Date(article.published_date || article.created_at).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-gradient-to-br from-[#0A1E3F] to-[#1B3B6F] border border-[#00C2FF]/30 rounded-2xl shadow-2xl shadow-[#00C2FF]/20 max-w-3xl w-full my-4 sm:my-8 animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 hover:bg-[#00C2FF]/20 rounded-xl transition-colors z-10"
        >
          <X className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
        </button>

        <div className="w-full h-48 sm:h-64 rounded-t-2xl overflow-hidden bg-[#0A1F3D]">
          <img
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop&q=80"
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop&q=80';
            }}
          />
        </div>

        <div className="p-5 sm:p-8 space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pr-8">
            <span className="text-2xl sm:text-3xl">{categoryIcon}</span>
            <span className="px-3 sm:px-4 py-1 bg-[#00C2FF]/20 text-[#00C2FF] rounded-xl text-xs sm:text-sm font-medium">
              {article.category}
            </span>
            <span className={`px-3 sm:px-4 py-1 ${priority.bg} ${priority.text} rounded-xl text-xs sm:text-sm font-bold`}>
              {article.priority} Priority
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight pr-8">
            {article.title}
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <span className="font-medium text-[#00C2FF]">{article.source}</span>
            <span className="hidden sm:inline">•</span>
            <span>{formattedDate}</span>
          </div>

          {article.summary && (
            <div className="pt-3 sm:pt-4 border-t border-[#00C2FF]/20">
              <h4 className="text-sm font-semibold text-[#00C2FF] mb-2">Summary</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{article.summary}</p>
            </div>
          )}

          {article.description && (
            <div className="pt-3 sm:pt-4 border-t border-[#00C2FF]/20">
              <h4 className="text-sm font-semibold text-[#00C2FF] mb-2">Description</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{article.description}</p>
            </div>
          )}

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#00C2FF] hover:bg-[#00C2FF]/80 text-[#0A1E3F] text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-[#00C2FF]/30 hover:shadow-xl hover:shadow-[#00C2FF]/40"
          >
            <span>Read Full Article</span>
            <ExternalLink className="w-4 sm:w-5 h-4 sm:h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
