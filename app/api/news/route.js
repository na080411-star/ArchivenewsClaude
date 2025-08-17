// app/api/news/route.js
import { NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const API_URL = 'https://newsapi.org/v2/top-headlines';

const newsSources = [
  'bbc-news',
  'the-guardian-uk',
  'cnn',
  'reuters',
  'associated-press',
  'the-verge',
];

export async function GET() {
  if (!NEWS_API_KEY) {
    return NextResponse.json({ error: 'NEWS_API_KEY is not set' }, { status: 500 });
  }

  const allNews = [];
  const promises = newsSources.map(async (sourceId) => {
    const url = `${API_URL}?sources=${sourceId}&apiKey=${NEWS_API_KEY}`;
    try {
      const response = await fetch(url, { next: { revalidate: 3600 } });
      if (!response.ok) {
        throw new Error(`Failed to fetch from NewsAPI for source: ${sourceId}`);
      }
      const data = await response.json();
      if (data.articles) {
        data.articles.forEach(article => {
          allNews.push({
            title: article.title,
            link: article.url,
            source: article.source.name,
            pubDate: article.publishedAt,
            summary: article.description,
          });
        });
      }
    } catch (error) {
      console.error(error.message);
    }
  });

  await Promise.allSettled(promises);

  return NextResponse.json(allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)));
}