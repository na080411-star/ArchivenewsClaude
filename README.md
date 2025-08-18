# News Archive Application

A global news aggregator that fetches news from 50+ RSS sources with AI-powered summaries and automatic categorization.

## Features

- 📰 **50+ News Sources**: Aggregates news from major outlets worldwide
- 🤖 **Smart Summaries**: AI-generated 2-sentence summaries for each article
- 📂 **Auto-Categorization**: Automatically classifies articles into categories
- 🔄 **Real-time Updates**: Auto-refresh every 10 seconds
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Loading**: Server-side caching for optimal performance

## Configuration

### API URL Configuration

The application automatically detects the correct API URL based on the environment:

1. **Development**: Uses `http://localhost:3000`
2. **Production**: Uses the current domain automatically
3. **Custom Domain**: Set environment variable `NEXT_PUBLIC_API_URL`

#### To set a custom API URL:

1. Create a `.env.local` file in the root directory
2. Add the following line:
   ```
   NEXT_PUBLIC_API_URL=https://your-custom-domain.com
   ```
3. Restart the development server

#### Example configurations:

```bash
# For development
NEXT_PUBLIC_API_URL=http://localhost:3000

# For production with custom domain
NEXT_PUBLIC_API_URL=https://mynewsapp.com

# For Vercel deployment (auto-detected)
# No environment variable needed
```

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

## Deployment

The application is designed to work with Vercel deployment out of the box. The API URL will automatically adapt to your deployment domain.

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
