# CyberSec Community Dashboard

A fully responsive cybersecurity news dashboard featuring real-time global threat updates and regional news feeds.

## Features

- **Global News Feed**: Latest cybersecurity threats and updates
- **Regional Coverage**: Localized news for Kenya, Uganda, South Africa, and Nigeria (coming soon)
- **Category Filtering**: Filter by Malware, Phishing, or General Security
- **Search Functionality**: Search articles by keyword or source
- **Fully Responsive**: Optimized for mobile, tablet, and desktop devices
- **Modern UI**: Beautiful gradient design with smooth animations

## Tech Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Data Source**: N8N Workflow Automation
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
cd Dashboard
npm install
```

### Environment Variables

Create a `.env` file in the `Dashboard` directory:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

**Getting your N8N Webhook URL:**
1. In your n8n workflow, add a **Webhook** trigger node
2. Set the HTTP Method to `GET`
3. Copy the **Production URL**
4. Paste it as the value for `VITE_N8N_WEBHOOK_URL`

**Expected Data Format from N8N:**
Your n8n workflow should return an array of news articles with this structure:
```json
[
  {
    "id": "unique-id",
    "title": "Article title",
    "category": "Malware | Phishing | General Security",
    "source": "Source name",
    "link": "https://article-url.com",
    "image_url": "https://image-url.com/image.jpg",
    "description": "Article description",
    "region": "Global | Kenya | Uganda | South Africa | Nigeria",
    "published_at": "2024-01-01T00:00:00Z"
  }
]
```

### Development

```bash
cd Dashboard
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Build

```bash
cd Dashboard
npm run build
```

## Deploying to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will automatically detect the `vercel.json` configuration
6. Add your environment variable in the Vercel dashboard:
   - `VITE_N8N_WEBHOOK_URL`: Your n8n workflow webhook URL
7. Click "Deploy"

### Environment Variables on Vercel

Make sure to add this environment variable in your Vercel project settings:

- `VITE_N8N_WEBHOOK_URL`: Your n8n workflow webhook URL

## Project Structure

```
Cyberguard/
├── Dashboard/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   ├── NewsCard.tsx
│   │   │   ├── NewsDetailModal.tsx
│   │   │   └── RegionalModal.tsx
│   │   ├── lib/
│   │   │   └── supabase.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── supabase/
│   │   └── migrations/
│   ├── package.json
│   └── vite.config.ts
├── vercel.json
└── README.md
```

## License

MIT
