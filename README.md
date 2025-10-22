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
- **Database**: Supabase
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
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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
6. Add your environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

### Environment Variables on Vercel

Make sure to add these environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

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
