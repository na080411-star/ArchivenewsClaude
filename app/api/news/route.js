import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// 각 언론사의 HTML 구조에 맞는 선택자(selector)를 정의합니다.
const newsSources = [
  { 
    name: 'The Verge', 
    url: 'https://www.theverge.com/',
    selector: '.c-entry-box--compact',
    titleSelector: 'h2.c-entry-box--compact__title a',
    linkSelector: 'h2.c-entry-box--compact__title a',
    summarySelector: 'p.c-entry-box--compact__dek'
  },
  { 
    name: 'TechCrunch', 
    url: 'https://techcrunch.com/',
    selector: '.post-block',
    titleSelector: 'h2.post-block__title a',
    linkSelector: 'h2.post-block__title a',
    summarySelector: '.post-block__content'
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/',
    selector: '.SummaryItem-cTYlC .SummaryItem-dJbQG',
    titleSelector: '.SummaryItemHed-gCjXg',
    linkSelector: '.SummaryItemHed-gCjXg a',
    summarySelector: '.SummaryItemDek-ggnB'
  }
];

export async function GET() {
  const allNews = [];
  // Promise.allSettled를 사용해 모든 스크래핑 작업을 병렬로 처리합니다.
  const promises = newsSources.map(async (source) => {
    try {
      const { data } = await axios.get(source.url);
      const $ = cheerio.load(data);

      // 각 언론사의 선택자에 맞춰 기사를 찾고 데이터를 추출합니다.
      $(source.selector).each((index, element) => {
        const title = $(element).find(source.titleSelector).text().trim();
        const link = $(element).find(source.linkSelector).attr('href');
        const summary = $(element).find(source.summarySelector).text().trim();
        
        if (title && link) {
          allNews.push({
            title,
            link,
            source: source.name,
            pubDate: new Date().toISOString(),
            summary,
          });
        }
      });
    } catch (error) {
      console.error(`Failed to scrape from ${source.name}:`, error.message);
    }
  });

  await Promise.allSettled(promises);

  // 모든 기사를 가져온 후, 최신순으로 정렬하여 반환합니다.
  return NextResponse.json(allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)));
}