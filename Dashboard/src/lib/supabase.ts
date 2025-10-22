import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  created_at: string;
  updated_at: string;
}
