import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const newsSources = [
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
  { name: 'The New York Times World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
  { name: 'The New York Times Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' }
];

export async function GET() {
  const allNews = [];

  const promises = newsSources.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
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
      console.error(`Error fetching RSS for ${source.name}:`, error.message);
    }
  });

  await Promise.allSettled(promises);

  return NextResponse.json(allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)));
}