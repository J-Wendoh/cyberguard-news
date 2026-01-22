# CyberSec Dashboard API

A secure, high-performance Node.js API for serving cybersecurity news articles from PostgreSQL to your frontend dashboard.

## Features

- **Latest-First Design**: Articles served newest to oldest by ID
- **Advanced Filtering**: Filter by priority (High/Medium/Low), category, source
- **Full-Text Search**: Search articles by title, summary, description
- **Content Sanitization**: Automatic HTML entity fixing and XSS prevention
- **Security Hardened**: Helmet, CORS, rate limiting
- **Connection Pooling**: Efficient database connection management
- **Graceful Shutdown**: Clean resource cleanup

## Database Tables

The API reads from two tables populated by n8n workflows:

### `security_articles`
| Column | Description |
|--------|-------------|
| `id` | Auto-incrementing primary key |
| `title` | Article headline |
| `source` | News source (e.g., "The Hacker News") |
| `category` | Category (e.g., "Ransomware", "Malware") |
| `priority` | Threat level: **High**, **Medium**, or **Low** |
| `summary` | AI-generated summary |
| `url` | Link to original article |

### `security_newsletters`
| Column | Description |
|--------|-------------|
| `id` | Primary key |
| `date` | Newsletter date |
| `total_items` | Number of items |
| `timestamp` | When generated |

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Test database connection
npm run test:db

# Start server
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/api/v1/health` | Detailed health with DB status |
| GET | `/api/v1/articles` | List articles (filter by priority, category, source) |
| GET | `/api/v1/articles/latest` | Get latest articles |
| GET | `/api/v1/articles/:id` | Get single article |
| GET | `/api/v1/filters/priorities` | Available priorities (High/Medium/Low) |
| GET | `/api/v1/filters/categories` | Available categories |
| GET | `/api/v1/filters/sources` | Available sources |
| GET | `/api/v1/newsletters` | Get newsletters |
| GET | `/api/v1/statistics` | Article statistics |
| GET | `/api/v1/schema` | Debug: show table structure |

See [docs/API.md](docs/API.md) for complete documentation with examples.

## Example Usage

```bash
# Get all articles
curl http://localhost:3000/api/v1/articles

# Get high priority articles only
curl "http://localhost:3000/api/v1/articles?priority=High"

# Get ransomware articles
curl "http://localhost:3000/api/v1/articles?category=Ransomware"

# Search for malware
curl "http://localhost:3000/api/v1/articles?search=malware"

# Combine filters
curl "http://localhost:3000/api/v1/articles?priority=High&category=Ransomware&limit=10"
```

## Configuration

Environment variables (`.env`):

```env
# Server
NODE_ENV=production
PORT=3000

# Database (local PostgreSQL)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=n8n
DB_USER=n8n
DB_PASSWORD=strong_n8n_password

# Pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# Security
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_MAX_REQUESTS=100
```

## Project Structure

```
Resilio_api/
├── src/
│   ├── config/
│   │   ├── index.js          # Configuration loader
│   │   └── database.js       # PostgreSQL connection pool
│   ├── controllers/
│   │   └── articleController.js
│   ├── middleware/
│   │   ├── cors.js           # CORS configuration
│   │   ├── errorHandler.js   # Error handling
│   │   ├── rateLimiter.js    # Rate limiting
│   │   └── security.js       # Helmet & security headers
│   ├── routes/
│   │   ├── index.js          # Route aggregator
│   │   ├── articles.js       # Article endpoints
│   │   └── filters.js        # Filter endpoints
│   ├── services/
│   │   └── articleService.js # Business logic
│   ├── utils/
│   │   ├── logger.js         # Winston logger
│   │   ├── sanitizer.js      # Content sanitization
│   │   └── testConnection.js
│   └── server.js             # Application entry point
├── docs/
│   └── API.md                # Full API documentation
├── logs/                     # Log files (auto-created)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start src/server.js --name cybersec-api
pm2 startup
pm2 save
```
