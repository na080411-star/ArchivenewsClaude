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


// GET 함수 수정 (request 인자 추가)
export async function GET(request) { // request 객체를 받아서 쿼리 파라미터 접근
  const allNews = [];
  const { searchParams } = new URL(request.url); // URL에서 searchParams 추출

  // 쿼리 파라미터로 'start_date' (ISO string)와 'end_date' (ISO string)를 받을 수 있도록
  const requestedStartDate = searchParams.get('start_date');
  const requestedEndDate = searchParams.get('end_date');
  
  // 기본적으로 '최근 7일'로 설정
  let endDate = requestedEndDate ? new Date(requestedEndDate) : new Date(); // 오늘 날짜
  let startDate = requestedStartDate ? new Date(requestedStartDate) : new Date();
  
  if (!requestedStartDate) { // start_date가 없으면 end_date 기준으로 7일 전 계산
    startDate.setDate(endDate.getDate() - 7);
  }

  // Promise.allSettled로 모든 RSS 피드 가져오기 (이전 코드와 동일, 'cache: no-store' 포함)
  const promises = newsSources.map(async (source) => {
    try {
      const rssResponse = await fetch(source.url, { cache: 'no-store' });
      if (!rssResponse.ok) {
        throw new Error(`Failed to fetch RSS from ${source.name}: ${rssResponse.statusText}`);
      }
      const rssText = await rssResponse.text();
      const feed = await parser.parseString(rssText);

      feed.items.forEach(item => {
        // pubDate가 유효한 날짜인지 확인
        const itemPubDate = new Date(item.pubDate);
        if (isNaN(itemPubDate.getTime())) { // 유효하지 않은 날짜인 경우 건너뛰기
            return;
        }

        // 요청된 기간(start_date ~ end_date) 내의 뉴스만 추가
        // 주의: 날짜 비교는 UTC 기준으로 하는 것이 안전함. 또는 모든 날짜를 일관된 타임존으로 변환.
        // 여기서는 pubDate가 Timezone 포함된 string이라면 new Date()가 알아서 파싱하므로 그대로 진행.
        if (itemPubDate >= startDate && itemPubDate <= endDate) {
            allNews.push({
                title: item.title,
                link: item.link,
                source: source.name,
                pubDate: item.pubDate,
                summary: item.contentSnippet,
            });
        }
      });
    } catch (error) {
      console.error(`Error fetching or parsing RSS for ${source.name}:`, error.message);
    }
  });

  await Promise.allSettled(promises);

  // 날짜 기준으로 내림차순 정렬
  allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  // 중복 제거 (선택 사항: 동일한 제목과 링크의 뉴스가 여러 소스에서 올 수 있음)
  const uniqueNews = [];
  const seen = new Set();
  for (const newsItem of allNews) {
    const identifier = `${newsItem.title}-${newsItem.link}`;
    if (!seen.has(identifier)) {
      uniqueNews.push(newsItem);
      seen.add(identifier);
    }
  }

  return NextResponse.json(uniqueNews); // 필터링 및 정렬된 고유 뉴스 반환
}