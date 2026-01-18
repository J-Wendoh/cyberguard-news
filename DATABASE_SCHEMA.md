# CyberSec Community Dashboard - Database Schema Documentation

## Overview

This document provides a complete specification for the database required by the CyberSec Community Dashboard. The dashboard is a cybersecurity news aggregation platform that displays articles from various sources, filtered by category, region, and date.

---

## Table of Contents

1. [Database Tables](#database-tables)
2. [Table: news_articles](#table-news_articles)
3. [Table: regions](#table-regions)
4. [Table: categories](#table-categories)
5. [Table: sources](#table-sources)
6. [Indexes](#indexes)
7. [Relationships](#relationships)
8. [API Endpoints Required](#api-endpoints-required)
9. [Sample Data](#sample-data)
10. [Security Considerations](#security-considerations)
11. [Future Enhancements](#future-enhancements)

---

## Database Tables

| Table Name | Description | Priority |
|------------|-------------|----------|
| `news_articles` | Main table storing all cybersecurity news articles | **Required** |
| `regions` | Lookup table for geographic regions | Optional (can use enum) |
| `categories` | Lookup table for article categories | Optional (can use enum) |
| `sources` | Lookup table for news sources | Optional (for analytics) |

---

## Table: news_articles

This is the **primary table** that stores all cybersecurity news articles displayed on the dashboard.

### Schema

```sql
CREATE TABLE news_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'General Security',
    source          TEXT NOT NULL,
    link            TEXT NOT NULL,
    image_url       TEXT,
    description     TEXT,
    region          TEXT NOT NULL DEFAULT 'Global',
    published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Unique identifier for each article. Auto-generated UUID. |
| `title` | TEXT | NO | - | The headline/title of the article. Displayed prominently on news cards. **Max recommended: 255 chars** |
| `category` | TEXT | NO | `'General Security'` | Type of security threat. Must be one of: `'Malware'`, `'Phishing'`, `'General Security'` |
| `source` | TEXT | NO | - | Name of the publication/website where the article originated (e.g., "Krebs on Security", "The Hacker News") |
| `link` | TEXT | NO | - | Full URL to the original article. Used for "Read More" functionality. **Must be valid URL** |
| `image_url` | TEXT | YES | NULL | URL to article thumbnail/featured image. If NULL, dashboard uses placeholder. **Must be valid image URL** |
| `description` | TEXT | YES | NULL | Full article summary or first paragraph. Displayed in article detail modal. Can contain multiple paragraphs. |
| `region` | TEXT | NO | `'Global'` | Geographic region. Must be one of: `'Global'`, `'Kenya'`, `'Uganda'`, `'South Africa'`, `'Nigeria'` |
| `published_at` | TIMESTAMPTZ | NO | `NOW()` | Original publication date/time of the article. **Critical for sorting and date filtering** |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | When the record was created in our database |
| `updated_at` | TIMESTAMPTZ | YES | `NOW()` | When the record was last modified |

### Category Values (ENUM)

The `category` field accepts these exact values:

| Value | Icon | Description |
|-------|------|-------------|
| `Malware` | :microbe: | Articles about viruses, trojans, ransomware, worms, spyware |
| `Phishing` | :fishing_pole_and_fish: | Articles about email scams, social engineering, credential theft |
| `General Security` | :shield: | General cybersecurity news, vulnerabilities, patches, best practices |

### Region Values (ENUM)

The `region` field accepts these exact values:

| Value | Flag | Description |
|-------|------|-------------|
| `Global` | :earth_africa: | Worldwide/international news (default) |
| `Kenya` | :kenya: | Kenya-specific cybersecurity news |
| `Uganda` | :uganda: | Uganda-specific cybersecurity news |
| `South Africa` | :south_africa: | South Africa-specific cybersecurity news |
| `Nigeria` | :nigeria: | Nigeria-specific cybersecurity news |

---

## Table: regions (Optional)

A lookup table for regions. Can be used instead of hardcoding region values.

### Schema

```sql
CREATE TABLE regions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(50) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    flag_emoji  VARCHAR(10),
    is_active   BOOLEAN DEFAULT true,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Sample Data

```sql
INSERT INTO regions (code, name, flag_emoji, is_active, sort_order) VALUES
('Global', 'Global', NULL, true, 0),
('Kenya', 'Kenya', '🇰🇪', true, 1),
('Uganda', 'Uganda', '🇺🇬', true, 2),
('South Africa', 'South Africa', '🇿🇦', true, 3),
('Nigeria', 'Nigeria', '🇳🇬', true, 4);
```

---

## Table: categories (Optional)

A lookup table for article categories.

### Schema

```sql
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    icon        VARCHAR(10),
    description TEXT,
    is_active   BOOLEAN DEFAULT true,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Sample Data

```sql
INSERT INTO categories (name, icon, description, sort_order) VALUES
('Malware', '🦠', 'Viruses, trojans, ransomware, and other malicious software', 1),
('Phishing', '🎣', 'Email scams, social engineering, and credential theft', 2),
('General Security', '🛡️', 'General cybersecurity news, vulnerabilities, and best practices', 3);
```

---

## Table: sources (Optional - For Analytics)

Track news sources for analytics and management purposes.

### Schema

```sql
CREATE TABLE sources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) UNIQUE NOT NULL,
    website_url     TEXT,
    logo_url        TEXT,
    is_trusted      BOOLEAN DEFAULT true,
    article_count   INTEGER DEFAULT 0,
    last_article_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes

These indexes are **critical for performance** given the dashboard's filtering and sorting requirements.

```sql
-- Primary sorting: Articles are always sorted by publication date (newest first)
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);

-- Category filtering: Users filter by Malware, Phishing, or General Security
CREATE INDEX idx_news_articles_category ON news_articles(category);

-- Region filtering: Dashboard filters Global vs regional news
CREATE INDEX idx_news_articles_region ON news_articles(region);

-- Composite index for common query pattern: region + date sorting
CREATE INDEX idx_news_articles_region_published ON news_articles(region, published_at DESC);

-- Text search on title and source (if using PostgreSQL full-text search)
CREATE INDEX idx_news_articles_title_search ON news_articles USING gin(to_tsvector('english', title));
CREATE INDEX idx_news_articles_source ON news_articles(source);
```

---

## Relationships

### Current Architecture (Simple)

```
┌─────────────────────────────────────────────────────────────────┐
│                        news_articles                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ id (PK)                                                  │   │
│  │ title                                                    │   │
│  │ category ─────────────────┐                              │   │
│  │ source                    │ (string values, not FK)      │   │
│  │ link                      │                              │   │
│  │ image_url                 │                              │   │
│  │ description               │                              │   │
│  │ region ───────────────────┘                              │   │
│  │ published_at                                             │   │
│  │ created_at                                               │   │
│  │ updated_at                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Future Architecture (With Lookup Tables)

```
┌──────────────┐       ┌─────────────────────┐       ┌──────────────┐
│   regions    │       │    news_articles    │       │  categories  │
├──────────────┤       ├─────────────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ region_id (FK)      │───────►│ id (PK)      │
│ code         │       │ category_id (FK)    │       │ name         │
│ name         │       │ source_id (FK)      │       │ icon         │
│ flag_emoji   │       │ title               │       │ description  │
└──────────────┘       │ link                │       └──────────────┘
                       │ image_url           │
┌──────────────┐       │ description         │
│   sources    │       │ published_at        │
├──────────────┤       │ created_at          │
│ id (PK)      │◄──────│ updated_at          │
│ name         │       └─────────────────────┘
│ website_url  │
│ logo_url     │
└──────────────┘
```

---

## API Endpoints Required

The dashboard requires the following API endpoints to function:

### 1. GET /api/articles

Fetch all articles with optional filtering.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `region` | string | No | Filter by region (e.g., `Global`, `Kenya`) |
| `category` | string | No | Filter by category (e.g., `Malware`, `Phishing`) |
| `search` | string | No | Search in title and source |
| `date_from` | ISO date | No | Filter articles from this date (inclusive) |
| `date_to` | ISO date | No | Filter articles up to this date (inclusive) |
| `limit` | integer | No | Number of results (default: 50) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Example Request:**
```
GET /api/articles?region=Global&category=Malware&date_from=2025-01-01&date_to=2025-01-31
```

**Expected Response:**
```json
{
  "articles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "New Ransomware Variant Targets Healthcare Sector",
      "category": "Malware",
      "source": "The Hacker News",
      "link": "https://thehackernews.com/2025/01/ransomware-healthcare",
      "image_url": "https://example.com/image.jpg",
      "description": "Security researchers have discovered...",
      "region": "Global",
      "published_at": "2025-01-15T10:30:00Z",
      "created_at": "2025-01-15T11:00:00Z",
      "updated_at": "2025-01-15T11:00:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### 2. GET /api/articles/:id

Fetch a single article by ID.

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "New Ransomware Variant Targets Healthcare Sector",
  "category": "Malware",
  "source": "The Hacker News",
  "link": "https://thehackernews.com/2025/01/ransomware-healthcare",
  "image_url": "https://example.com/image.jpg",
  "description": "Security researchers have discovered...",
  "region": "Global",
  "published_at": "2025-01-15T10:30:00Z",
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

### 3. POST /api/articles (Admin Only)

Create a new article.

**Request Body:**
```json
{
  "title": "Article Title",
  "category": "Malware",
  "source": "Source Name",
  "link": "https://...",
  "image_url": "https://...",
  "description": "Article description...",
  "region": "Global",
  "published_at": "2025-01-15T10:30:00Z"
}
```

### 4. PUT /api/articles/:id (Admin Only)

Update an existing article.

### 5. DELETE /api/articles/:id (Admin Only)

Delete an article.

---

## Sample Data

Here's sample data to populate the database for testing:

```sql
INSERT INTO news_articles (title, category, source, link, image_url, description, region, published_at) VALUES

-- Global Articles
('Critical Vulnerability Found in Popular VPN Software',
 'General Security',
 'Krebs on Security',
 'https://krebsonsecurity.com/2025/01/vpn-vulnerability',
 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
 'Security researchers have discovered a critical remote code execution vulnerability affecting millions of VPN users worldwide. The vulnerability, tracked as CVE-2025-1234, allows attackers to execute arbitrary code on affected systems without authentication.',
 'Global',
 '2025-01-18T09:00:00Z'),

('New Phishing Campaign Targets Financial Institutions',
 'Phishing',
 'The Hacker News',
 'https://thehackernews.com/2025/01/phishing-banks',
 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
 'A sophisticated phishing campaign has been detected targeting employees of major financial institutions across multiple countries. The attackers are using highly convincing emails that impersonate internal IT departments.',
 'Global',
 '2025-01-17T14:30:00Z'),

('LockBit Ransomware Gang Returns with New Variant',
 'Malware',
 'BleepingComputer',
 'https://bleepingcomputer.com/2025/01/lockbit-returns',
 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
 'Despite law enforcement disruptions last year, the LockBit ransomware gang has returned with a new variant dubbed LockBit 4.0, featuring enhanced encryption and anti-analysis capabilities.',
 'Global',
 '2025-01-16T11:00:00Z'),

-- Regional Articles (Kenya)
('Kenyan Banks Report Surge in Mobile Money Fraud',
 'Phishing',
 'Business Daily Africa',
 'https://businessdailyafrica.com/2025/01/mobile-fraud',
 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
 'Major Kenyan banks have reported a 150% increase in mobile money fraud cases over the past quarter, with attackers using SIM swap techniques to gain access to M-Pesa accounts.',
 'Kenya',
 '2025-01-15T08:00:00Z'),

-- Regional Articles (South Africa)
('South African Government Systems Hit by Cyberattack',
 'Malware',
 'ITWeb Africa',
 'https://itweb.co.za/2025/01/government-attack',
 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
 'Several South African government departments have been forced offline following a coordinated ransomware attack. Officials are working to restore services while investigating the breach.',
 'South Africa',
 '2025-01-14T16:00:00Z'),

-- Regional Articles (Nigeria)
('Nigerian Cybersecurity Agency Issues Malware Warning',
 'Malware',
 'The Guardian Nigeria',
 'https://guardian.ng/2025/01/malware-warning',
 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
 'The Nigerian National Information Technology Development Agency has issued an urgent warning about a new strain of banking malware specifically targeting Nigerian financial applications.',
 'Nigeria',
 '2025-01-13T12:00:00Z'),

-- Regional Articles (Uganda)
('Uganda Launches National Cybersecurity Strategy',
 'General Security',
 'New Vision Uganda',
 'https://newvision.co.ug/2025/01/cybersecurity-strategy',
 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
 'The Ugandan government has unveiled a comprehensive five-year national cybersecurity strategy aimed at protecting critical infrastructure and promoting safe digital practices.',
 'Uganda',
 '2025-01-12T10:00:00Z');
```

---

## Security Considerations

### Row-Level Security (RLS)

If using Supabase or PostgreSQL with RLS:

```sql
-- Enable RLS on news_articles
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view articles)
CREATE POLICY "Public read access"
  ON news_articles FOR SELECT
  TO public
  USING (true);

-- Admin write access (only authenticated admins can modify)
CREATE POLICY "Admin insert access"
  ON news_articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin update access"
  ON news_articles FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin delete access"
  ON news_articles FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Data Validation

1. **URL Validation**: Ensure `link` and `image_url` are valid URLs
2. **Category Validation**: Use CHECK constraint or enum
3. **Region Validation**: Use CHECK constraint or enum
4. **Date Validation**: `published_at` should not be in the future

```sql
-- Add constraints
ALTER TABLE news_articles
ADD CONSTRAINT valid_category CHECK (category IN ('Malware', 'Phishing', 'General Security'));

ALTER TABLE news_articles
ADD CONSTRAINT valid_region CHECK (region IN ('Global', 'Kenya', 'Uganda', 'South Africa', 'Nigeria'));
```

---

## Future Enhancements

### 1. User Authentication Table

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        VARCHAR(50) DEFAULT 'user',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Article Bookmarks

```sql
CREATE TABLE bookmarks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    article_id  UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);
```

### 3. Article Views/Analytics

```sql
CREATE TABLE article_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id  UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    viewed_at   TIMESTAMPTZ DEFAULT NOW(),
    user_agent  TEXT,
    ip_hash     VARCHAR(64)
);
```

### 4. RSS Feed Sources (for automated ingestion)

```sql
CREATE TABLE rss_feeds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    url             TEXT NOT NULL,
    region          VARCHAR(50) DEFAULT 'Global',
    default_category VARCHAR(50) DEFAULT 'General Security',
    is_active       BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Quick Start SQL

Here's a complete SQL script to set up the database:

```sql
-- Create main table
CREATE TABLE news_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'General Security',
    source          TEXT NOT NULL,
    link            TEXT NOT NULL,
    image_url       TEXT,
    description     TEXT,
    region          TEXT NOT NULL DEFAULT 'Global',
    published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_category CHECK (category IN ('Malware', 'Phishing', 'General Security')),
    CONSTRAINT valid_region CHECK (region IN ('Global', 'Kenya', 'Uganda', 'South Africa', 'Nigeria'))
);

-- Create indexes
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_category ON news_articles(category);
CREATE INDEX idx_news_articles_region ON news_articles(region);
CREATE INDEX idx_news_articles_region_published ON news_articles(region, published_at DESC);

-- Enable RLS (if using Supabase/PostgreSQL RLS)
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can view news articles"
  ON news_articles FOR SELECT
  TO public
  USING (true);
```

---

## Contact

For questions about this schema, please contact the development team.

**Document Version:** 1.0
**Last Updated:** 2025-01-18
