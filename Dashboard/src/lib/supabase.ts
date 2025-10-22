export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  source: string;
  link: string;
  image_url?: string;
  description?: string;
  region: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function fetchNewsFromN8n(): Promise<NewsArticle[]> {
  try {
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N webhook URL not configured');
      return [];
    }

    const response = await fetch(N8N_WEBHOOK_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle different n8n response formats
    // If data is array, use it directly; if it's wrapped in a property, extract it
    const articles = Array.isArray(data) ? data : (data.articles || data.data || []);

    return articles;
  } catch (error) {
    console.error('Error fetching news from n8n:', error);
    return [];
  }
}
