/*
  # Cybersecurity News Dashboard Schema

  1. New Tables
    - `news_articles`
      - `id` (uuid, primary key) - Unique identifier for each article
      - `title` (text) - Article headline
      - `category` (text) - Type of security threat (Malware, Phishing, General Security)
      - `source` (text) - Source publication name
      - `link` (text) - URL to original article
      - `image_url` (text, nullable) - URL to article thumbnail
      - `description` (text, nullable) - Full article summary
      - `region` (text) - Geographic region (Global, Kenya, Uganda, South Africa, Nigeria)
      - `published_at` (timestamptz) - Original publication timestamp
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `news_articles` table
    - Add policy for public read access (news is public information)
    - Future: Add policies for authenticated users to manage articles

  3. Indexes
    - Index on `published_at` for sorting by date
    - Index on `category` for filtering
    - Index on `region` for regional filtering
*/

CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General Security',
  source text NOT NULL,
  link text NOT NULL,
  image_url text,
  description text,
  region text NOT NULL DEFAULT 'Global',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Public read access for all news articles
CREATE POLICY "Anyone can view news articles"
  ON news_articles FOR SELECT
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_region ON news_articles(region);