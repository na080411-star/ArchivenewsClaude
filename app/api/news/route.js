import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

// Cache for storing news data
let newsCache = {
  data: [],
  stats: null,
  lastUpdate: null,
  isUpdating: false
};

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000;

// Smart Summary Function (AI-like effect)
function generateSmartSummary(text, maxLength = 150) {
  if (!text || text.length === 0) {
    return 'No content to summarize.';
  }

  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // Split into sentences and calculate importance
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) {
    return cleanText.substring(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
  }

  // Keyword-based importance calculation
  const keywords = ['announced', 'launched', 'released', 'introduced', 'developed', 'created', 'found', 'discovered', 'revealed', 'confirmed', 'reported', 'stated', 'said', 'according', 'study', 'research', 'analysis', 'data', 'results', 'findings', 'new', 'latest', 'breakthrough', 'innovation', 'technology', 'scientists', 'experts', 'officials', 'government', 'company', 'industry'];
  
  let bestSentence = sentences[0];
  let bestScore = 0;
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    // Keyword matching score
    keywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) {
        score += 2;
      }
    });
    
    // Length score (prefer moderate length)
    if (sentence.length > 50 && sentence.length < 200) {
      score += 1;
    }
    
    // First sentence bonus
    if (sentence === sentences[0]) {
      score += 1;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  });
  
  let summary = bestSentence.trim();
  
  // Adjust length
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }
  
  return summary;
}

// Category Classification Function
function classifyArticle(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  
  // Category keywords
  const categories = {
    'Technology': ['tech', 'technology', 'software', 'app', 'ai', 'artificial intelligence', 'machine learning', 'startup', 'digital', 'internet', 'web', 'mobile', 'computer', 'programming', 'coding', 'developer', 'cybersecurity', 'blockchain', 'crypto', 'bitcoin', 'ethereum', 'social media', 'facebook', 'twitter', 'google', 'apple', 'microsoft', 'amazon', 'tesla', 'spacex', 'nvidia', 'amd', 'intel', 'smartphone', 'iphone', 'android', 'gaming', 'vr', 'ar', 'virtual reality', 'augmented reality'],
    'Business': ['business', 'economy', 'market', 'stock', 'finance', 'financial', 'investment', 'trading', 'wall street', 'nasdaq', 'dow', 's&p', 'earnings', 'revenue', 'profit', 'loss', 'ceo', 'executive', 'corporate', 'company', 'merger', 'acquisition', 'ipo', 'venture capital', 'funding', 'startup', 'entrepreneur', 'entrepreneurship', 'banking', 'bank', 'insurance', 'real estate', 'property', 'retail', 'e-commerce', 'amazon', 'walmart', 'target', 'costco'],
    'World': ['world', 'international', 'global', 'foreign', 'diplomacy', 'diplomatic', 'embassy', 'ambassador', 'united nations', 'un', 'nato', 'european union', 'eu', 'brexit', 'china', 'russia', 'ukraine', 'middle east', 'iran', 'iraq', 'syria', 'afghanistan', 'pakistan', 'india', 'japan', 'south korea', 'north korea', 'australia', 'canada', 'mexico', 'brazil', 'argentina', 'africa', 'south africa', 'nigeria', 'egypt', 'migration', 'refugee', 'immigration'],
    'Politics': ['politics', 'political', 'government', 'president', 'congress', 'senate', 'house', 'democrat', 'republican', 'election', 'vote', 'voting', 'campaign', 'policy', 'legislation', 'bill', 'law', 'supreme court', 'judge', 'justice', 'attorney general', 'fbi', 'cia', 'department', 'administration', 'white house', 'capitol', 'washington', 'biden', 'trump', 'clinton', 'obama'],
    'Science': ['science', 'scientific', 'research', 'study', 'discovery', 'breakthrough', 'innovation', 'scientist', 'researcher', 'laboratory', 'lab', 'experiment', 'data', 'analysis', 'findings', 'publication', 'journal', 'peer review', 'climate', 'environment', 'environmental', 'climate change', 'global warming', 'pollution', 'conservation', 'biodiversity', 'species', 'extinction', 'renewable energy', 'solar', 'wind', 'nuclear'],
    'Health': ['health', 'medical', 'medicine', 'doctor', 'physician', 'hospital', 'patient', 'treatment', 'therapy', 'drug', 'pharmaceutical', 'vaccine', 'vaccination', 'disease', 'illness', 'infection', 'virus', 'bacteria', 'covid', 'coronavirus', 'pandemic', 'epidemic', 'symptoms', 'diagnosis', 'prognosis', 'clinical trial', 'fda', 'who', 'centers for disease control', 'cdc', 'mental health', 'psychology', 'psychiatry'],
    'Sports': ['sports', 'athletic', 'game', 'match', 'tournament', 'championship', 'olympics', 'world cup', 'football', 'soccer', 'basketball', 'baseball', 'tennis', 'golf', 'hockey', 'boxing', 'mma', 'ufc', 'nfl', 'nba', 'mlb', 'nhl', 'premier league', 'la liga', 'serie a', 'bundesliga', 'player', 'team', 'coach', 'manager', 'score', 'win', 'loss', 'victory', 'defeat'],
    'Entertainment': ['entertainment', 'movie', 'film', 'tv', 'television', 'show', 'series', 'actor', 'actress', 'director', 'producer', 'hollywood', 'netflix', 'disney', 'amazon prime', 'hbo', 'streaming', 'box office', 'award', 'oscar', 'grammy', 'emmy', 'music', 'song', 'album', 'artist', 'singer', 'rapper', 'concert', 'tour', 'festival', 'celebrity', 'star', 'fame', 'red carpet']
  };
  
  let bestCategory = 'General';
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(categories)) {
    let score = 0;
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1;
      }
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  // If no strong category match, classify as General
  if (bestScore < 2) {
    return 'General';
  }
  
  return bestCategory;
}

const newsSources = [
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'BBC Sport', url: 'http://feeds.bbci.co.uk/sport/rss.xml' },
  { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss' },
  { name: 'CNN Technology', url: 'http://rss.cnn.com/rss/edition_technology.rss' },
  { name: 'CNN Business', url: 'http://rss.cnn.com/rss/edition_business.rss' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
  { name: 'The Guardian Technology', url: 'https://www.theguardian.com/technology/rss' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'The New York Times - World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
  { name: 'The New York Times - Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' },
  { name: 'The New York Times - Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml' },
  { name: 'The New York Times - Science', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml' },
  { name: 'Google News', url: 'https://news.google.com/rss' },
  { name: 'Ars Technica', url: 'http://feeds.arstechnica.com/arstechnica/index' },
  { name: 'TechCrunch', url: 'http://feeds.feedburner.com/TechCrunch' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
  { name: 'Lifehacker', url: 'https://lifehacker.com/rss' },
  { name: 'Forbes Business', url: 'https://www.forbes.com/business/feed/' },
  { name: 'Forbes Technology', url: 'https://www.forbes.com/technology/feed/' },
  { name: 'Fortune', url: 'https://fortune.com/feed' },
  { name: 'CNBC Top News', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  { name: 'CNBC Technology', url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html' },
  { name: 'Scientific American', url: 'http://rss.sciam.com/ScientificAmerican-Global' },
  { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml' },
  { name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
  { name: 'NPR Hidden Brain', url: 'https://feeds.npr.org/510308/podcast.xml' },
  { name: 'NPR Technology', url: 'https://feeds.npr.org/1019/rss.xml' },
  { name: 'The Onion', url: 'https://www.theonion.com/rss' },
  { name: 'xkcd', url: 'https://xkcd.com/rss.xml' },
  { name: 'Slashfilm', url: 'https://feeds2.feedburner.com/slashfilm' },
  { name: 'Variety', url: 'https://variety.com/feed/' },
  { name: 'Smitten Kitchen', url: 'http://feeds.feedburner.com/smittenkitchen' },
  { name: 'Serious Eats - Recipes', url: 'http://feeds.feedburner.com/seriouseats/recipes' },
  { name: 'The Kitchn', url: 'https://www.thekitchn.com/main.rss' },
  { name: 'Stratechery', url: 'http://stratechery.com/feed/' },
  { name: 'Slashdot', url: 'http://rss.slashdot.org/Slashdot/slashdotMain' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'The Atlantic', url: 'https://www.theatlantic.com/feed/all/' },
  { name: 'Reuters Technology', url: 'https://feeds.reuters.com/reuters/technologyNews' },
  { name: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews' },
  { name: 'Reuters World', url: 'https://feeds.reuters.com/reuters/worldNews' },
  { name: 'Bloomberg Technology', url: 'https://feeds.bloomberg.com/technology/news.rss' },
  { name: 'Bloomberg Business', url: 'https://feeds.bloomberg.com/business/news.rss' },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
  { name: 'Gizmodo', url: 'https://gizmodo.com/rss' },
  { name: 'Mashable', url: 'https://mashable.com/feed' },
  { name: 'Vox', url: 'https://www.vox.com/rss/index.xml' },
  { name: 'The Washington Post', url: 'https://feeds.washingtonpost.com/rss/world' },
  { name: 'USA Today', url: 'https://rss.usatoday.com/usatoday-NewsTopStories' },
  { name: 'NBC News', url: 'https://feeds.nbcnews.com/nbcnews/public/world' },
  { name: 'ABC News', url: 'https://abcnews.go.com/abcnews/usheadlines' },
  { name: 'CBS News', url: 'https://www.cbsnews.com/latest/rss/main' },
  { name: 'Fox News', url: 'https://feeds.foxnews.com/foxnews/latest' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'BBC Technology', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml' },
  { name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml' }
];

// Fetch all news from RSS sources
async function fetchAllNews() {
  const allNews = [];
  const successfulSources = [];
  const failedSources = [];

  // Timeout-enabled fetch function
  const fetchWithTimeout = async (url, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Process each news source in parallel with individual timeout
  const promises = newsSources.map(async (source) => {
    try {
      console.log(`Fetching from ${source.name}...`);
      
      const rssResponse = await fetchWithTimeout(source.url, 15000);

      if (!rssResponse.ok) {
        throw new Error(`HTTP ${rssResponse.status}: ${rssResponse.statusText}`);
      }

      const rssText = await rssResponse.text();
      
      if (!rssText || rssText.trim().length === 0) {
        throw new Error('Empty response');
      }

      const feed = await parser.parseString(rssText);

      if (!feed.items || feed.items.length === 0) {
        throw new Error('No items found in RSS feed');
      }

      const items = feed.items.slice(0, 10); // Maximum 10 items per source

             items.forEach(item => {
         if (item.title && item.link) {
           // Store original summary and auto-generate AI summary
           const originalSummary = item.contentSnippet || item.content || '';
           
           // Auto-generate AI summary
           const smartSummary = generateSmartSummary(`${item.title}. ${originalSummary}`, 150);
           
           // Classify article category
           const category = classifyArticle(item.title, originalSummary);
           
           allNews.push({
             title: item.title,
             link: item.link,
             source: source.name,
             pubDate: item.pubDate || new Date().toISOString(),
             summary: originalSummary,
             aiSummary: smartSummary, // Auto-generated AI summary
             category: category, // Auto-classified category
           });
         }
       });

      successfulSources.push(source.name);
      console.log(`✅ Successfully fetched ${items.length} items from ${source.name}`);
      
    } catch (error) {
      failedSources.push({ name: source.name, error: error.message });
      console.error(`❌ Failed to fetch from ${source.name}:`, error.message);
    }
  });

  // Wait for all requests to complete
  await Promise.allSettled(promises);

  // Log results
  console.log(`📊 Fetch Summary: ${successfulSources.length}/${newsSources.length} sources successful`);
  if (failedSources.length > 0) {
    console.log('❌ Failed sources:', failedSources.map(f => f.name).join(', '));
  }

  // Remove duplicates and sort by date
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title && t.source === item.source)
  );

  // Filter articles from last 7 days only
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentNews = uniqueNews.filter(item => {
    const pubDate = new Date(item.pubDate);
    return pubDate >= oneWeekAgo;
  });

  const sortedNews = recentNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Calculate category statistics
  const categoryStats = {};
  sortedNews.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
  });

  return {
    news: sortedNews,
    stats: {
      totalSources: newsSources.length,
      successfulSources: successfulSources.length,
      failedSources: failedSources.length,
      totalArticles: sortedNews.length,
      categoryStats: categoryStats,
      timestamp: new Date().toISOString()
    }
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  const now = Date.now();
  
  // Check if cache is valid (less than 30 seconds old)
  if (newsCache.data.length > 0 && 
      newsCache.lastUpdate && 
      (now - newsCache.lastUpdate) < CACHE_DURATION) {
    console.log('📦 Returning cached news data');
    return NextResponse.json({
      news: newsCache.data,
      stats: newsCache.stats
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // If cache is invalid or empty, fetch new data
  if (!newsCache.isUpdating) {
    newsCache.isUpdating = true;
    
    try {
      console.log('🔄 Fetching fresh news data...');
      const result = await fetchAllNews();
      
      // Update cache
      newsCache.data = result.news;
      newsCache.stats = result.stats;
      newsCache.lastUpdate = now;
      
      console.log('✅ Cache updated successfully');
    } catch (error) {
      console.error('❌ Error updating cache:', error);
    } finally {
      newsCache.isUpdating = false;
    }
  }

  return NextResponse.json({
    news: newsCache.data,
    stats: newsCache.stats
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}