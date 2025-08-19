import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

// Translation function using LibreTranslate API (free)
async function translateText(text, targetLang) {
  if (!text || text.trim().length === 0) return text;
  
  try {
    // Using LibreTranslate API (free, no API key required)
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      console.log(`Translation failed for ${targetLang}: ${response.status}`);
      return text; // Return original text if translation fails
    }

    const result = await response.json();
    return result.translatedText || text;
  } catch (error) {
    console.log(`Translation error for ${targetLang}:`, error.message);
    return text; // Return original text if translation fails
  }
}

// Batch translate multiple news items
async function translateNewsBatch(newsItems) {
  const languages = ['ko', 'ja', 'zh'];
  const translatedItems = [];
  
  // Process items in smaller batches to avoid overwhelming the translation API
  const batchSize = 5;
  
  for (let i = 0; i < newsItems.length; i += batchSize) {
    const batch = newsItems.slice(i, i + batchSize);
    
    // Process each item in the batch
    const batchPromises = batch.map(async (item) => {
      const translatedItem = { ...item };
      
      // Translate title and summary for all languages
      const translationPromises = languages.map(async (lang) => {
        const [translatedTitle, translatedSummary] = await Promise.all([
          translateText(item.title, lang),
          translateText(item.aiSummary, lang)
        ]);
        
        return {
          lang,
          title: translatedTitle,
          aiSummary: translatedSummary
        };
      });
      
      try {
        const results = await Promise.all(translationPromises);
        
        // Add translated content to item
        results.forEach(({ lang, title, aiSummary }) => {
          translatedItem[`title_${lang}`] = title;
          translatedItem[`aiSummary_${lang}`] = aiSummary;
        });
        
        return translatedItem;
      } catch (error) {
        console.log(`Translation failed for item:`, error.message);
        return item; // Return original item if translation fails
      }
    });
    
    // Wait for batch to complete
    const batchResults = await Promise.allSettled(batchPromises);
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        translatedItems.push(result.value);
      }
    });
    
    // Add small delay between batches to be respectful to the translation API
    if (i + batchSize < newsItems.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return translatedItems;
}

// Cache for storing news data (module-level cache)
let newsCache = {
  data: [],
  stats: null,
  lastUpdate: null,
  isUpdating: false
};

// Cache cleanup function to prevent memory leaks
const cleanupCache = () => {
  const now = Date.now();
  if (newsCache.lastUpdate && (now - newsCache.lastUpdate) > 5 * 60 * 1000) { // 5 minutes
    newsCache = {
      data: [],
      stats: null,
      lastUpdate: null,
      isUpdating: false
    };
  }
};

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000;

// Two Sentence Summary Function
function generateTwoSentenceSummary(text, maxLength = 300) {
  if (!text || text.length === 0) {
    return 'No content to summarize.';
  }

  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // Split into sentences and filter out very short ones
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  if (sentences.length === 0) {
    return cleanText.substring(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
  }

  // Keyword-based importance calculation
  const keywords = ['announced', 'launched', 'released', 'introduced', 'developed', 'created', 'found', 'discovered', 'revealed', 'confirmed', 'reported', 'stated', 'said', 'according', 'study', 'research', 'analysis', 'data', 'results', 'findings', 'new', 'latest', 'breakthrough', 'innovation', 'technology', 'scientists', 'experts', 'officials', 'government', 'company', 'industry'];
  
  // Score sentences by importance
  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    // Keyword matching score
    keywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) {
        score += 2;
      }
    });
    
    // Length score (prefer moderate length)
    if (sentence.length > 40 && sentence.length < 200) {
      score += 1;
    }
    
    // First sentence bonus
    if (sentence === sentences[0]) {
      score += 1;
    }
    
    return { sentence: sentence.trim(), score };
  });
  
  // Sort by score (highest first) and take top 2
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(item => item.sentence);
  
  // If we have less than 2 sentences, use what we have
  if (topSentences.length === 0) {
    return cleanText.substring(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
  }
  
  // Join the two sentences
  let summary = topSentences.join('. ');
  
  // Add period if it doesn't end with one
  if (!summary.endsWith('.')) {
    summary += '.';
  }
  
  // Adjust length if needed
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
  { name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml' },
  { name: 'BBC Entertainment', url: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml' },
  { name: 'BBC Health', url: 'http://feeds.bbci.co.uk/news/health/rss.xml' },
  { name: 'BBC Science', url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml' },
  { name: 'CNN Politics', url: 'http://rss.cnn.com/rss/edition_politics.rss' },
  { name: 'CNN Entertainment', url: 'http://rss.cnn.com/rss/edition_entertainment.rss' },
  { name: 'CNN Health', url: 'http://rss.cnn.com/rss/edition_health.rss' },
  { name: 'CNN Science', url: 'http://rss.cnn.com/rss/edition_space.rss' },
  { name: 'The Guardian Business', url: 'https://www.theguardian.com/business/rss' },
  { name: 'The Guardian Politics', url: 'https://www.theguardian.com/politics/rss' },
  { name: 'The Guardian Science', url: 'https://www.theguardian.com/science/rss' },
  { name: 'The Guardian Health', url: 'https://www.theguardian.com/society/health/rss' },
  { name: 'The Guardian Sports', url: 'https://www.theguardian.com/sport/rss' },
  { name: 'The Guardian Entertainment', url: 'https://www.theguardian.com/culture/rss' },
  { name: 'The New York Times - Politics', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml' },
  { name: 'The New York Times - Health', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml' },
  { name: 'The New York Times - Sports', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml' },
  { name: 'The New York Times - Arts', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml' },
  { name: 'Reuters Technology', url: 'https://feeds.reuters.com/reuters/technologyNews' },
  { name: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews' },
  { name: 'Reuters World', url: 'https://feeds.reuters.com/reuters/worldNews' },
  { name: 'Reuters Politics', url: 'https://feeds.reuters.com/reuters/politicsNews' },
  { name: 'Reuters Health', url: 'https://feeds.reuters.com/reuters/healthNews' },
  { name: 'Reuters Science', url: 'https://feeds.reuters.com/reuters/scienceNews' },
  { name: 'Reuters Sports', url: 'https://feeds.reuters.com/reuters/sportsNews' },
  { name: 'Reuters Entertainment', url: 'https://feeds.reuters.com/reuters/entertainment' },
  { name: 'Bloomberg Politics', url: 'https://feeds.bloomberg.com/politics/news.rss' },
  { name: 'Bloomberg Markets', url: 'https://feeds.bloomberg.com/markets/news.rss' },
  { name: 'Bloomberg Opinion', url: 'https://feeds.bloomberg.com/opinion/news.rss' },
  { name: 'CNBC Politics', url: 'https://www.cnbc.com/id/10000113/device/rss/rss.html' },
  { name: 'CNBC Markets', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html' },
  { name: 'CNBC Investing', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  { name: 'Forbes Politics', url: 'https://www.forbes.com/politics/feed/' },
  { name: 'Forbes Markets', url: 'https://www.forbes.com/markets/feed/' },
  { name: 'Forbes Innovation', url: 'https://www.forbes.com/innovation/feed/' },
  { name: 'Wired Security', url: 'https://www.wired.com/feed/category/security/latest/rss' },
  { name: 'Wired Science', url: 'https://www.wired.com/feed/category/science/latest/rss' },
  { name: 'Wired Business', url: 'https://www.wired.com/feed/category/business/latest/rss' },
  { name: 'Ars Technica Gaming', url: 'http://feeds.arstechnica.com/arstechnica/gaming' },
  { name: 'Ars Technica Science', url: 'http://feeds.arstechnica.com/arstechnica/science' },
  { name: 'TechCrunch Startups', url: 'http://feeds.feedburner.com/TechCrunch/startups' },
  { name: 'TechCrunch Mobile', url: 'http://feeds.feedburner.com/TechCrunch/mobile' },
  { name: 'TechCrunch Social', url: 'http://feeds.feedburner.com/TechCrunch/social' },
  { name: 'Engadget Mobile', url: 'https://www.engadget.com/rss.xml' },
  { name: 'Engadget Gaming', url: 'https://www.engadget.com/rss.xml' },
  { name: 'Gizmodo Science', url: 'https://gizmodo.com/rss' },
  { name: 'Gizmodo Gaming', url: 'https://gizmodo.com/rss' },
  { name: 'Mashable Tech', url: 'https://mashable.com/feed' },
  { name: 'Mashable Entertainment', url: 'https://mashable.com/feed' },
  { name: 'Vox Politics', url: 'https://www.vox.com/rss/index.xml' },
  { name: 'Vox Technology', url: 'https://www.vox.com/rss/index.xml' },
  { name: 'The Atlantic Politics', url: 'https://www.theatlantic.com/feed/all/' },
  { name: 'The Atlantic Technology', url: 'https://www.theatlantic.com/feed/all/' },
  { name: 'MIT Technology Review AI', url: 'https://www.technologyreview.com/feed/' },
  { name: 'MIT Technology Review Climate', url: 'https://www.technologyreview.com/feed/' },
  { name: 'Scientific American Mind', url: 'http://rss.sciam.com/ScientificAmerican-Mind' },
  { name: 'Scientific American Health', url: 'http://rss.sciam.com/ScientificAmerican-Health' },
  { name: 'ScienceDaily Technology', url: 'https://www.sciencedaily.com/rss/computers_math/technology.xml' },
  { name: 'ScienceDaily Health', url: 'https://www.sciencedaily.com/rss/health_medicine.xml' },
  { name: 'ScienceDaily Environment', url: 'https://www.sciencedaily.com/rss/earth_climate/environment.xml' },
  { name: 'NASA Earth', url: 'https://www.nasa.gov/rss/dyn/earth.rss' },
  { name: 'NASA Solar System', url: 'https://www.nasa.gov/rss/dyn/solar_system.rss' },
  { name: 'NASA Universe', url: 'https://www.nasa.gov/rss/dyn/universe.rss' },
  { name: 'NPR Politics', url: 'https://feeds.npr.org/1014/rss.xml' },
  { name: 'NPR Science', url: 'https://feeds.npr.org/1007/rss.xml' },
  { name: 'NPR Health', url: 'https://feeds.npr.org/1128/rss.xml' },
  { name: 'NPR Business', url: 'https://feeds.npr.org/1006/rss.xml' },
  { name: 'NPR Entertainment', url: 'https://feeds.npr.org/1008/rss.xml' },
  { name: 'The Washington Post Politics', url: 'https://feeds.washingtonpost.com/rss/politics' },
  { name: 'The Washington Post Technology', url: 'https://feeds.washingtonpost.com/rss/business/technology' },
  { name: 'The Washington Post Health', url: 'https://feeds.washingtonpost.com/rss/national/health-science' },
  { name: 'The Washington Post Sports', url: 'https://feeds.washingtonpost.com/rss/sports' },
  { name: 'USA Today Politics', url: 'https://rss.usatoday.com/usatoday-NewsTopStories' },
  { name: 'USA Today Technology', url: 'https://rss.usatoday.com/usatoday-NewsTopStories' },
  { name: 'USA Today Sports', url: 'https://rss.usatoday.com/usatoday-NewsTopStories' },
  { name: 'NBC News Politics', url: 'https://feeds.nbcnews.com/nbcnews/public/politics' },
  { name: 'NBC News Technology', url: 'https://feeds.nbcnews.com/nbcnews/public/tech' },
  { name: 'NBC News Health', url: 'https://feeds.nbcnews.com/nbcnews/public/health' },
  { name: 'ABC News Politics', url: 'https://abcnews.go.com/abcnews/politicsheadlines' },
  { name: 'ABC News Technology', url: 'https://abcnews.go.com/abcnews/technologyheadlines' },
  { name: 'ABC News Health', url: 'https://abcnews.go.com/abcnews/healthheadlines' },
  { name: 'CBS News Politics', url: 'https://www.cbsnews.com/latest/rss/politics' },
  { name: 'CBS News Technology', url: 'https://www.cbsnews.com/latest/rss/tech' },
  { name: 'CBS News Health', url: 'https://www.cbsnews.com/latest/rss/health' },
  { name: 'Fox News Politics', url: 'https://feeds.foxnews.com/foxnews/politics' },
  { name: 'Fox News Technology', url: 'https://feeds.foxnews.com/foxnews/tech' },
  { name: 'Fox News Health', url: 'https://feeds.foxnews.com/foxnews/health' },
  { name: 'Al Jazeera Politics', url: 'https://www.aljazeera.com/xml/rss/politics.xml' },
  { name: 'Al Jazeera Technology', url: 'https://www.aljazeera.com/xml/rss/technology.xml' },
  { name: 'Al Jazeera Health', url: 'https://www.aljazeera.com/xml/rss/health.xml' }
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

       // Sort by date (newest first) and take latest 20 items
       const sortedItems = feed.items
         .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
         .slice(0, 20);

               // Process items and collect for batch translation
        const itemsToTranslate = [];
        
        for (const item of sortedItems) {
          if (item.title && item.link) {
            // Store original summary and auto-generate AI summary
            const originalSummary = item.contentSnippet || item.content || '';
            
            // Auto-generate two sentence summary
            const twoSentenceSummary = generateTwoSentenceSummary(`${item.title}. ${originalSummary}`, 300);
            
            // Classify article category
            const category = classifyArticle(item.title, originalSummary);
            
            // Create base news item
            const newsItem = {
              title: item.title,
              link: item.link,
              source: source.name,
              pubDate: item.pubDate || new Date().toISOString(),
              summary: originalSummary,
              aiSummary: twoSentenceSummary, // Auto-generated two sentence summary
              category: category, // Auto-classified category
            };
            
            itemsToTranslate.push(newsItem);
          }
        }
        
        // Batch translate items
        try {
          const translatedItems = await translateNewsBatch(itemsToTranslate);
          allNews.push(...translatedItems);
        } catch (error) {
          console.log(`Batch translation failed for ${source.name}:`, error.message);
          allNews.push(...itemsToTranslate); // Add original items if translation fails
        }

             successfulSources.push(source.name);
       console.log(`✅ Successfully fetched ${sortedItems.length} items from ${source.name}`);
      
    } catch (error) {
      failedSources.push({ name: source.name, error: error.message });
      console.error(`❌ Failed to fetch from ${source.name}:`, error.message);
    }
  });

  // Wait for all requests to complete
  await Promise.allSettled(promises);

  // Log results
  console.log(`📊 Fetch Summary: ${successfulSources.length}/${newsSources.length} sources successful`);
  console.log(`📈 Total articles from RSS feeds: ${allNews.length}`);
  if (failedSources.length > 0) {
    console.log('❌ Failed sources:', failedSources.map(f => `${f.name} (${f.error})`).join(', '));
  }

  // Remove duplicates and sort by date
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title && t.source === item.source)
  );

  console.log(`🔄 Articles after removing duplicates: ${uniqueNews.length}`);

  // Filter articles from last 14 days
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentNews = uniqueNews.filter(item => {
    const pubDate = new Date(item.pubDate);
    return pubDate >= twoWeeksAgo;
  });

  console.log(`📅 Articles after 14-day filter: ${recentNews.length}`);

  const sortedNews = recentNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  console.log(`📅 Final articles after sorting: ${sortedNews.length}`);

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
  try {
    const now = Date.now();
    
    // Cleanup old cache to prevent memory leaks
    cleanupCache();
    
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
        // Return cached data if available, otherwise return error
        if (newsCache.data.length > 0) {
          console.log('📦 Returning cached data due to fetch error');
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
        throw error;
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
  } catch (error) {
    console.error('❌ Fatal error in GET handler:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to fetch news data'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}