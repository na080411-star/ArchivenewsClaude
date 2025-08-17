import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const newsSources = [
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Reuters Top News', url: 'http://feeds.reuters.com/reuters/topNews' },
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