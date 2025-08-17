import Parser from 'rss-parser';
import { NextResponse } from 'next/server';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:group']
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  }
});

const newsSources = [
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
    // { name: 'CNN Top Stories', url: 'http://rss.cnn.com/rss/cnn_topstories.rss' },
    // { name: 'Reuters World', url: 'https://www.reuters.com/arc/outboundfeeds/rss/worldNews/' }
];

export async function GET() {
  try {
    const fetchPromises = newsSources.map(source => 
        parser.parseURL(source.url).then(feed => ({
            source: source.name,
            items: feed.items
        }))
    );
    
    const results = await Promise.allSettled(fetchPromises);
    let allNews = [];

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            const { source, items } = result.value;
            const parsedItems = items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                source: source
            }));
            allNews.push(...parsedItems);
        } else {
            console.error(`Error fetching RSS for a source:`, result.reason);
        }
    });

    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    return NextResponse.json(allNews.slice(0, 50));
  } catch (error) {
    console.error('API Handler Error:', error);
    return NextResponse.json({ message: 'Failed to fetch news data.' }, { status: 500 });
  }
}