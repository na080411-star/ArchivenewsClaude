import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

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
  const allNews = [];
  const successfulSources = [];
  const failedSources = [];

  // 타임아웃을 설정한 fetch 함수
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

  // 각 뉴스 소스를 병렬로 처리하되, 개별 타임아웃 적용
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

      const items = feed.items.slice(0, 10); // 각 소스당 최대 10개 아이템만 가져오기

      items.forEach(item => {
        if (item.title && item.link) {
          // 기존 요약과 AI 요약을 모두 저장
          const originalSummary = item.contentSnippet || item.content || '';
          
          allNews.push({
            title: item.title,
            link: item.link,
            source: source.name,
            pubDate: item.pubDate || new Date().toISOString(),
            summary: originalSummary,
            aiSummary: null, // 나중에 AI 요약으로 업데이트
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

  // 모든 요청을 병렬로 실행하고 완료될 때까지 대기
  await Promise.allSettled(promises);

  // 결과 로깅
  console.log(`📊 Fetch Summary: ${successfulSources.length}/${newsSources.length} sources successful`);
  if (failedSources.length > 0) {
    console.log('❌ Failed sources:', failedSources.map(f => f.name).join(', '));
  }

  // 날짜별로 정렬하고 중복 제거
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title && t.source === item.source)
  );

  const sortedNews = uniqueNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return NextResponse.json({
    news: sortedNews,
    stats: {
      totalSources: newsSources.length,
      successfulSources: successfulSources.length,
      failedSources: failedSources.length,
      totalArticles: sortedNews.length,
      timestamp: new Date().toISOString()
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}