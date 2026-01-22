import { useState, useEffect, useMemo, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { Header } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { NewsCard } from './components/NewsCard';
import { RegionalModal } from './components/RegionalModal';
import { NewsDetailModal } from './components/NewsDetailModal';
import { useFavorites } from './hooks/useFavorites';
import {
  fetchArticles,
  fetchAllFilters,
  type NewsArticle,
  type FilterOption,
} from './lib/api';

function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isRegionalModalOpen, setIsRegionalModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Favorites
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Filter options from API
  const [categories, setCategories] = useState<FilterOption[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadFilters = useCallback(async () => {
    const filters = await fetchAllFilters();
    setCategories(filters.categories);
  }, []);

  // Load articles from API
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: 50,
        };

        // Apply server-side filters
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }

        const result = await fetchArticles(params);

        if (result.success) {
          setAllArticles(result.data);
          setTotalPages(result.pagination.totalPages);
          setHasNextPage(result.pagination.hasNextPage);
        } else {
          setAllArticles([]);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        setAllArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [page, selectedCategory, searchQuery]);

  // Client-side filtering (date + favorites)
  useEffect(() => {
    let filtered = allArticles;

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((article) => {
        const articleDate = new Date(article.published).toISOString().split('T')[0];
        return articleDate === selectedDate;
      });
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter((article) => favorites.includes(article.id));
    }

    setArticles(filtered);
  }, [allArticles, selectedDate, showFavoritesOnly, favorites]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const latestArticle = articles[0];
  const previousArticles = articles.slice(1);

  const groupedArticles = useMemo(() => {
    const groups: Record<string, NewsArticle[]> = {};
    previousArticles.forEach((article) => {
      const date = new Date(article.published).toLocaleDateString('en-US', {
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
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Favorites Toggle */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
              showFavoritesOnly
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                : 'bg-[#1B3B6F]/40 text-white border border-[#00C2FF]/30 hover:bg-[#1B3B6F]/60'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            {showFavoritesOnly ? `Showing Favorites (${favorites.length})` : `Show Favorites (${favorites.length})`}
          </button>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00C2FF] border-t-transparent"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                {showFavoritesOnly ? 'No favorite articles yet. Click the heart icon on articles to save them!' : 'No articles found'}
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {latestArticle && (
                <div>
                  <NewsCard
                    article={latestArticle}
                    isLatest
                    isFavorite={isFavorite(latestArticle.id)}
                    onToggleFavorite={toggleFavorite}
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
                        isFavorite={isFavorite(article.id)}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => setSelectedArticle(article)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && !showFavoritesOnly && (
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
