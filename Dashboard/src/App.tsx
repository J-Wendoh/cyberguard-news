import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { NewsCard } from './components/NewsCard';
import { RegionalModal } from './components/RegionalModal';
import { NewsDetailModal } from './components/NewsDetailModal';
import {
  fetchArticles,
  fetchAllFilters,
  type NewsArticle,
  type FilterOption,
} from './lib/api';

function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isRegionalModalOpen, setIsRegionalModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Filter options from API
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [priorities, setPriorities] = useState<FilterOption[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadFilters = useCallback(async () => {
    const filters = await fetchAllFilters();
    setCategories(filters.categories);
    setPriorities(filters.priorities);
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 50,
        sort_by: 'created_at',
        sort_order: 'DESC',
      };

      // Apply server-side filters
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (selectedPriority !== 'All') {
        params.priority = selectedPriority;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (dateFrom) {
        params.start_date = dateFrom;
      }
      if (dateTo) {
        params.end_date = dateTo;
      }

      const result = await fetchArticles(params);

      if (result.success) {
        setArticles(result.data);
        setTotalPages(result.pagination.totalPages);
        setHasNextPage(result.pagination.hasNextPage);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, selectedPriority, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setPage(1);
  }, [selectedCategory, selectedPriority, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const latestArticle = articles[0];
  const previousArticles = articles.slice(1);

  const groupedArticles = useMemo(() => {
    const groups: Record<string, NewsArticle[]> = {};
    previousArticles.forEach((article) => {
      const date = new Date(article.published_date || article.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(article);
    });
    return groups;
  }, [previousArticles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1E3F] via-[#1B3B6F] to-[#0A1E3F] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300C2FF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10">
        <Header onRegionClick={() => setIsRegionalModalOpen(true)} />

        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          categories={categories}
          priorities={priorities}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00C2FF] border-t-transparent"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No articles found</p>
            </div>
          ) : (
            <div className="space-y-12">
              {latestArticle && (
                <div>
                  <NewsCard
                    article={latestArticle}
                    isLatest
                    onClick={() => setSelectedArticle(latestArticle)}
                  />
                </div>
              )}

              {Object.entries(groupedArticles).map(([date, dateArticles]) => (
                <div key={date} className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#00C2FF]/30"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gradient-to-r from-[#0A1E3F] via-[#1B3B6F] to-[#0A1E3F] px-6 py-2 text-[#00C2FF] font-bold text-sm tracking-wide shadow-lg shadow-[#00C2FF]/20">
                        {date}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dateArticles.map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        onClick={() => setSelectedArticle(article)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-[#1B3B6F]/40 border border-[#00C2FF]/30 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1B3B6F]/60 hover:border-[#00C2FF]/50 transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-white">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNextPage}
                    className="px-4 py-2 bg-[#1B3B6F]/40 border border-[#00C2FF]/30 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1B3B6F]/60 hover:border-[#00C2FF]/50 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <RegionalModal
        isOpen={isRegionalModalOpen}
        onClose={() => setIsRegionalModalOpen(false)}
      />

      <NewsDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}

export default App;
