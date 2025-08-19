# News Archive Application

A global news aggregator that fetches news from 50+ RSS sources with AI-powered summaries and automatic categorization.

## Features

- 📰 **50+ News Sources**: Aggregates news from major outlets worldwide
- 🤖 **Smart Summaries**: AI-generated 2-sentence summaries for each article
- 📂 **Auto-Categorization**: Automatically classifies articles into categories
- 🔄 **Real-time Updates**: Auto-refresh every 10 seconds
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Loading**: Server-side caching for optimal performance

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production URL

The application is live at: [https://newsarchive-ruby.vercel.app](https://newsarchive-ruby.vercel.app)

## Deployment

The application is designed to work with Vercel deployment out of the box.

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Technology Stack

- **Frontend**: Next.js, React
- **Styling**: CSS3 with responsive design
- **RSS Parsing**: rss-parser
- **Deployment**: Vercel (recommended)

## News Sources

The application fetches news from various categories:
- Technology (BBC Tech, CNN Tech, Ars Technica, etc.)
- Business (Reuters Business, Bloomberg, Forbes, etc.)
- World News (BBC World, CNN World, The Guardian, etc.)
- Politics, Science, Health, Sports, Entertainment

## Features

- **Smart Summary**: AI-powered 2-sentence summaries
- **Category Filtering**: Filter news by category
- **Auto-refresh**: Toggle automatic updates
- **Load More**: Progressive loading of articles
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live news updates every 10 seconds

## License

MIT License
