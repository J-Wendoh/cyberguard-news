import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { NewsCard } from './components/NewsCard';
import { RegionalModal } from './components/RegionalModal';
import { NewsDetailModal } from './components/NewsDetailModal';
import { supabase, type NewsArticle } from './lib/supabase';

function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isRegionalModalOpen, setIsRegionalModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('region', 'Global')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.source.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  const latestArticle = filteredArticles[0];
  const previousArticles = filteredArticles.slice(1);

  const groupedArticles = useMemo(() => {
    const groups: Record<string, NewsArticle[]> = {};
    previousArticles.forEach((article) => {
      const date = new Date(article.published_at).toLocaleDateString('en-US', {
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
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00C2FF] border-t-transparent"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
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
