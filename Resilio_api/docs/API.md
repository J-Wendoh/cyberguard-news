# CyberSec Dashboard API Documentation

## Overview

This API serves cybersecurity news articles from a PostgreSQL database to the CyberSec Dashboard frontend. Articles are returned in reverse chronological order (newest first) by default.

**Base URL:** `http://your-server:3000/api/v1`

---

## Database Schema

The API connects to two main tables populated by n8n workflows:

### Table: `security_articles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key, auto-incrementing |
| `title` | TEXT | Article headline |
| `source` | TEXT | News source (e.g., "The Hacker News", "BleepingComputer") |
| `category` | TEXT | Security category (e.g., "Ransomware", "Malware", "Data Breach") |
| `priority` | TEXT | Threat priority level: **High**, **Medium**, or **Low** |
| `summary` | TEXT | AI-generated summary of the article |
| `description` | TEXT | Article description/excerpt |
| `url` | TEXT | Link to original article |
| `published_date` | TIMESTAMP | When the article was published |
| `created_at` | TIMESTAMP | When record was added to database |

### Table: `security_newsletters`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `date` | TEXT | Newsletter date (e.g., "Sunday, January 18, 2026") |
| `total_items` | INTEGER | Number of items in newsletter |
| `timestamp` | TIMESTAMP | When newsletter was generated |

---

## Quick Start

### 1. Setup

```bash
# Navigate to project directory
cd /path/to/Resilio_api

# Install dependencies
npm install

# Copy environment file and edit with your credentials
cp .env.example .env
nano .env

# Test database connection
npm run test:db

# Start the server
npm start
```

### 2. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Get latest articles
curl http://localhost:3000/api/v1/articles/latest

# Get articles with pagination
curl "http://localhost:3000/api/v1/articles?page=1&limit=20"

# Filter by priority
curl "http://localhost:3000/api/v1/articles?priority=High"

# Filter by category
curl "http://localhost:3000/api/v1/articles?category=Ransomware"

# Search articles
curl "http://localhost:3000/api/v1/articles?search=malware"
```

---

## Authentication

This API does not require authentication. Access is controlled via:

- **CORS**: Only allowed origins can access the API
- **Rate Limiting**: Requests are limited per IP address

---

## API Endpoints

### Health Check

#### `GET /health`

Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T10:30:00.000Z",
  "uptime": 3600
}
```

#### `GET /api/v1/health`

Detailed health check with database status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T10:30:00.000Z",
  "version": "v1",
  "uptime": 3600,
  "database": {
    "connected": true,
    "timestamp": "2026-01-18T10:30:00.000Z",
    "database": "n8n",
    "poolSize": 10,
    "idleConnections": 8,
    "waitingClients": 0
  }
}
```

---

### Articles

#### `GET /api/v1/articles`

Fetch articles with pagination, filtering, and sorting.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `priority` | string | - | Filter by priority: `High`, `Medium`, or `Low` |
| `category` | string | - | Filter by category (e.g., "Ransomware", "Malware") |
| `source` | string | - | Filter by source (e.g., "The Hacker News") |
| `search` | string | - | Full-text search in title, summary, description |
| `start_date` | ISO date | - | Filter articles created after this date |
| `end_date` | ISO date | - | Filter articles created before this date |
| `sort_by` | string | id | Sort column: `id`, `created_at`, `title`, `priority`, `category`, `source` |
| `sort_order` | string | DESC | Sort direction: `ASC` or `DESC` |

**Example Requests:**

```bash
# Get all articles (paginated)
curl "http://localhost:3000/api/v1/articles"

# Get high priority articles only
curl "http://localhost:3000/api/v1/articles?priority=High"

# Get ransomware articles
curl "http://localhost:3000/api/v1/articles?category=Ransomware"

# Search for articles about malware
curl "http://localhost:3000/api/v1/articles?search=malware"

# Combine filters
curl "http://localhost:3000/api/v1/articles?priority=High&category=Ransomware&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "Black Basta Ransomware Leader Added to EU Most Wanted",
      "source": "The Hacker News",
      "category": "Ransomware",
      "priority": "High",
      "summary": "A key leader of the Black Basta ransomware group...",
      "description": "Security researchers have identified...",
      "url": "https://thehackernews.com/article/...",
      "published_date": "2026-01-18T08:00:00.000Z",
      "created_at": "2026-01-18T13:55:53.000Z"
    },
    {
      "id": 4,
      "title": "GootLoader Malware Uses ZIP Archives to Evade Detection",
      "source": "The Hacker News",
      "category": "Malware",
      "priority": "High",
      "summary": "New evasion technique discovered...",
      "description": "Researchers found GootLoader using...",
      "url": "https://thehackernews.com/article/...",
      "published_date": "2026-01-18T07:30:00.000Z",
      "created_at": "2026-01-18T13:55:54.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### `GET /api/v1/articles/latest`

Get the most recent articles (shorthand endpoint).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | integer | 10 | Number of articles (max: 50) |

**Example Request:**
```bash
curl "http://localhost:3000/api/v1/articles/latest?count=5"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "Black Basta Ransomware Leader Added to EU Most Wanted",
      "source": "The Hacker News",
      "category": "Ransomware",
      "priority": "High",
      ...
    }
  ],
  "count": 5
}
```

---

#### `GET /api/v1/articles/:id`

Get a single article by ID.

**Example Request:**
```bash
curl http://localhost:3000/api/v1/articles/5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Black Basta Ransomware Leader Added to EU Most Wanted",
    "source": "The Hacker News",
    "category": "Ransomware",
    "priority": "High",
    "summary": "A key leader of the Black Basta ransomware group...",
    "description": "Security researchers have identified...",
    "url": "https://thehackernews.com/article/...",
    "published_date": "2026-01-18T08:00:00.000Z",
    "created_at": "2026-01-18T13:55:53.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Article not found"
  }
}
```

---

### Filters

#### `GET /api/v1/filters/priorities`

Get all available priority levels with article counts.

**Response:**
```json
{
  "success": true,
  "data": [
    { "priority": "High", "count": "45" },
    { "priority": "Medium", "count": "38" },
    { "priority": "Low", "count": "12" }
  ]
}
```

---

#### `GET /api/v1/filters/categories`

Get all available categories with article counts.

**Response:**
```json
{
  "success": true,
  "data": [
    { "category": "Ransomware", "count": "28" },
    { "category": "Malware", "count": "22" },
    { "category": "Data Breach", "count": "18" },
    { "category": "General Security", "count": "15" },
    { "category": "Phishing", "count": "12" }
  ]
}
```

---

#### `GET /api/v1/filters/sources`

Get all available news sources with article counts.

**Response:**
```json
{
  "success": true,
  "data": [
    { "source": "The Hacker News", "count": "50" },
    { "source": "BleepingComputer", "count": "35" },
    { "source": "SecurityWeek", "count": "28" }
  ]
}
```

---

### Newsletters

#### `GET /api/v1/newsletters`

Fetch newsletters with pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `sort_by` | string | timestamp | Sort column: `id`, `timestamp`, `date`, `total_items` |
| `sort_order` | string | DESC | Sort direction: `ASC` or `DESC` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "date": "Sunday, January 18, 2026",
      "total_items": 4,
      "timestamp": "2026-01-18T13:55:56.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### Statistics

#### `GET /api/v1/statistics`

Get article statistics and metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_articles": "95",
    "total_categories": "8",
    "total_sources": "5",
    "total_priorities": "3",
    "high_priority_count": "45",
    "medium_priority_count": "38",
    "low_priority_count": "12",
    "oldest_article": "2026-01-15T00:00:00.000Z",
    "newest_article": "2026-01-18T13:55:56.000Z"
  }
}
```

---

### Debug Endpoints

#### `GET /api/v1/schema`

Get database table schema (useful for debugging).

**Response:**
```json
{
  "success": true,
  "data": {
    "security_articles": [
      { "column_name": "id", "data_type": "integer", "is_nullable": "NO" },
      { "column_name": "title", "data_type": "text", "is_nullable": "YES" },
      { "column_name": "source", "data_type": "text", "is_nullable": "YES" },
      { "column_name": "category", "data_type": "text", "is_nullable": "YES" },
      { "column_name": "priority", "data_type": "text", "is_nullable": "YES" }
    ],
    "security_newsletters": [
      { "column_name": "id", "data_type": "integer", "is_nullable": "NO" },
      { "column_name": "date", "data_type": "text", "is_nullable": "YES" },
      { "column_name": "total_items", "data_type": "integer", "is_nullable": "YES" }
    ]
  }
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `INVALID_ID` | 400 | Article ID must be a number |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SEARCH_RATE_LIMIT_EXCEEDED` | 429 | Too many search requests |
| `CORS_ERROR` | 403 | Origin not allowed |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_UNAVAILABLE` | 503 | Database connection failed |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| All endpoints | 100 requests | 15 minutes |
| Search queries | 30 requests | 1 minute |

Rate limit headers are included in responses:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1705312800
```

---

## Caching

GET responses are cached for 5 minutes (`Cache-Control: public, max-age=300`).

---

## Frontend Integration Examples

### JavaScript/Fetch API

```javascript
// api.js - API client for CyberSec Dashboard

const API_BASE = 'http://your-server:3000/api/v1';

/**
 * Fetch articles with optional filters
 */
export async function fetchArticles({
  page = 1,
  limit = 20,
  priority,
  category,
  source,
  search
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (priority) params.append('priority', priority);
  if (category) params.append('category', category);
  if (source) params.append('source', source);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE}/articles?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
}

/**
 * Fetch latest articles
 */
export async function fetchLatestArticles(count = 10) {
  const response = await fetch(`${API_BASE}/articles/latest?count=${count}`);
  return response.json();
}

/**
 * Fetch a single article by ID
 */
export async function fetchArticle(id) {
  const response = await fetch(`${API_BASE}/articles/${id}`);
  return response.json();
}

/**
 * Fetch all filter options
 */
export async function fetchFilters() {
  const [priorities, categories, sources] = await Promise.all([
    fetch(`${API_BASE}/filters/priorities`).then(r => r.json()),
    fetch(`${API_BASE}/filters/categories`).then(r => r.json()),
    fetch(`${API_BASE}/filters/sources`).then(r => r.json()),
  ]);

  return {
    priorities: priorities.data,
    categories: categories.data,
    sources: sources.data
  };
}

/**
 * Fetch statistics
 */
export async function fetchStatistics() {
  const response = await fetch(`${API_BASE}/statistics`);
  return response.json();
}
```

### React Component Example

```jsx
// components/Dashboard.jsx
import { useEffect, useState } from 'react';
import { fetchArticles, fetchFilters, fetchStatistics } from '../api';

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [filters, setFilters] = useState({ priorities: [], categories: [], sources: [] });
  const [stats, setStats] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [articlesRes, filtersData, statsRes] = await Promise.all([
          fetchArticles({ priority: selectedPriority, category: selectedCategory }),
          fetchFilters(),
          fetchStatistics(),
        ]);

        setArticles(articlesRes.data);
        setFilters(filtersData);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
      setLoading(false);
    }

    loadData();
  }, [selectedPriority, selectedCategory]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Articles</h3>
          <p>{stats?.total_articles}</p>
        </div>
        <div className="stat-card high">
          <h3>High Priority</h3>
          <p>{stats?.high_priority_count}</p>
        </div>
        <div className="stat-card medium">
          <h3>Medium Priority</h3>
          <p>{stats?.medium_priority_count}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          {filters.priorities.map(p => (
            <option key={p.priority} value={p.priority}>
              {p.priority} ({p.count})
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {filters.categories.map(c => (
            <option key={c.category} value={c.category}>
              {c.category} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Articles List */}
      <div className="articles">
        {articles.map(article => (
          <article key={article.id} className={`article priority-${article.priority.toLowerCase()}`}>
            <div className="article-header">
              <span className={`priority-badge ${article.priority.toLowerCase()}`}>
                {article.priority}
              </span>
              <span className="category">{article.category}</span>
              <span className="source">{article.source}</span>
            </div>
            <h2>{article.title}</h2>
            <p>{article.summary || article.description}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
```

### CSS Styling Example

```css
/* styles/dashboard.css */

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #1a1a2e;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card.high { border-left: 4px solid #ff4757; }
.stat-card.medium { border-left: 4px solid #ffa502; }

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filters select {
  padding: 10px 15px;
  border-radius: 6px;
  background: #16213e;
  color: white;
  border: 1px solid #0f3460;
}

.article {
  background: #1a1a2e;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #0f3460;
}

.article.priority-high { border-left-color: #ff4757; }
.article.priority-medium { border-left-color: #ffa502; }
.article.priority-low { border-left-color: #2ed573; }

.priority-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.priority-badge.high { background: #ff4757; color: white; }
.priority-badge.medium { background: #ffa502; color: black; }
.priority-badge.low { background: #2ed573; color: black; }

.category {
  background: #0f3460;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}
```

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Update `ALLOWED_ORIGINS` with your frontend domain(s)
- [ ] Set `DB_PASSWORD=strong_n8n_password`
- [ ] Configure firewall to block port 5432 from external access
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (nginx) with SSL

### PM2 Setup

```bash
# Install PM2
npm install -g pm2

# Start the API
pm2 start src/server.js --name cybersec-api

# Enable startup on boot
pm2 startup
pm2 save
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Data Flow Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   News Sources  │────▶│    n8n Workflow │────▶│   PostgreSQL    │
│  (RSS/APIs)     │     │  (Fetch & Store)│     │   (n8n DB)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │◀────│   This API      │◀────│ security_articles│
│   Dashboard     │     │  (Node.js)      │     │ security_news... │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Data populated by n8n workflows → Served by this API → Displayed on Dashboard**
