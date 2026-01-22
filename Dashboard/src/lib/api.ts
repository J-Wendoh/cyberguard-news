/**
 * Resilio API Client
 * Connects to the CyberSec Dashboard API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface NewsArticle {
  id: number;
  newsletter_id?: number;
  title: string;
  source: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string | null;
  link: string;
  published: string;
  article_id?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ArticlesResponse {
  success: boolean;
  data: NewsArticle[];
  pagination: PaginationInfo;
}

export interface FilterOption {
  priority?: string;
  category?: string;
  source?: string;
  count: string;
}

export interface Statistics {
  total_articles: string;
  total_categories: string;
  total_sources: string;
  total_priorities: string;
  high_priority_count: string;
  medium_priority_count: string;
  low_priority_count: string;
  oldest_article: string;
  newest_article: string;
}

export interface FetchArticlesParams {
  page?: number;
  limit?: number;
  priority?: string;
  category?: string;
  source?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

/**
 * Fetch articles with optional filters and pagination
 */
export async function fetchArticles(params: FetchArticlesParams = {}): Promise<ArticlesResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.priority) searchParams.append('priority', params.priority);
    if (params.category) searchParams.append('category', params.category);
    if (params.source) searchParams.append('source', params.source);
    if (params.search) searchParams.append('search', params.search);
    if (params.start_date) searchParams.append('start_date', params.start_date);
    if (params.end_date) searchParams.append('end_date', params.end_date);
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.sort_order) searchParams.append('sort_order', params.sort_order);

    const url = `${API_BASE_URL}/articles${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

/**
 * Fetch latest articles
 */
export async function fetchLatestArticles(count: number = 10): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/latest?count=${count}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
}

/**
 * Fetch a single article by ID
 */
export async function fetchArticleById(id: number): Promise<NewsArticle | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

/**
 * Fetch available priorities with counts
 */
export async function fetchPriorities(): Promise<FilterOption[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/filters/priorities`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching priorities:', error);
    return [];
  }
}

/**
 * Fetch available categories with counts
 */
export async function fetchCategories(): Promise<FilterOption[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/filters/categories`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch available sources with counts
 */
export async function fetchSources(): Promise<FilterOption[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/filters/sources`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching sources:', error);
    return [];
  }
}

/**
 * Fetch all filter options at once
 */
export async function fetchAllFilters(): Promise<{
  priorities: FilterOption[];
  categories: FilterOption[];
  sources: FilterOption[];
}> {
  const [priorities, categories, sources] = await Promise.all([
    fetchPriorities(),
    fetchCategories(),
    fetchSources(),
  ]);

  return { priorities, categories, sources };
}

/**
 * Fetch statistics
 */
export async function fetchStatistics(): Promise<Statistics | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return null;
  }
}

/**
 * Health check
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
