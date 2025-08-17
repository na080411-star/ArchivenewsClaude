import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const newsSources = [
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'BBC Sport', url: 'http://feeds.bbci.co.uk/sport/rss.xml' },
  { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'The New York Times - World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
  { name: 'The New York Times - Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' },
  { name: 'Google News', url: 'https://news.google.com/rss' },
  { name: 'Ars Technica', url: 'http://feeds.arstechnica.com/arstechnica/index' },
  { name: 'TechCrunch', url: 'http://feeds.feedburner.com/TechCrunch' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
  { name: 'Lifehacker', url: 'https://lifehacker.com/rss' },
  { name: 'Forbes Business', url: 'https://www.forbes.com/business/feed/' },
  { name: 'Fortune', url: 'https://fortune.com/feed' },
  { name: 'CNBC Top News', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  { name: 'Scientific American', url: 'http://rss.sciam.com/ScientificAmerican-Global' },
  { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml' },
  { name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
  { name: 'NPR Hidden Brain', url: 'https://feeds.npr.org/510308/podcast.xml' },
  { name: 'The Onion', url: 'https://www.theonion.com/rss' },
  { name: 'xkcd', url: 'https://xkcd.com/rss.xml' },
  { name: 'Slashfilm', url: 'https://feeds2.feedburner.com/slashfilm' },
  { name: 'Variety', url: 'https://variety.com/feed/' },
  { name: 'Smitten Kitchen', url: 'http://feeds.feedburner.com/smittenkitchen' },
  { name: 'Serious Eats - Recipes', url: 'http://feeds.feedburner.com/seriouseats/recipes' },
  { name: 'The Kitchn', url: 'https://www.thekitchn.com/main.rss' },
  { name: 'Stratechery', url: 'http://stratechery.com/feed/' },
  { name: 'Slashdot', url: 'http://rss.slashdot.org/Slashdot/slashdotMain' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed' }
];


export async function GET() {
  const allNews = [];

  const promises = newsSources.map(async (source) => {
    try {
      // 🚨 이 부분이 핵심이야! 🚨
      // rss-parser.parseURL() 대신 직접 fetch를 사용하고 캐싱 옵션을 줘.
      const rssResponse = await fetch(source.url, { 
        cache: 'no-store' // <--- 여기서 캐싱을 비활성화! 
      });

      // HTTP 응답이 성공적인지 확인
      if (!rssResponse.ok) {
          throw new Error(`Failed to fetch RSS from ${source.name}: ${rssResponse.statusText}`);
      }

      const rssText = await rssResponse.text(); // 응답을 텍스트로 읽어와
      const feed = await parser.parseString(rssText); // 텍스트를 파싱

      feed.items.forEach(item => {
        allNews.push({
          title: item.title,
          link: item.link,
          source: source.name,
          pubDate: item.pubDate,
          summary: item.contentSnippet,
        });
      });
    } catch (error) {
      console.error(`Error fetching or parsing RSS for ${source.name}:`, error.message);
    }
  });

  await Promise.allSettled(promises);

  return NextResponse.json(allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)));
}