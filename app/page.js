// page.js 파일 내
'use client';

import { useEffect, useState, useCallback } from 'react'; // useCallback 추가

// 페이지 컴포넌트
export default function HomePage() {
  const [newsData, setNewsData] = useState([]);
  const [statusText, setStatusText] = useState('Preparing news feed...');
  const [lastUpdate, setLastUpdate] = useState('Ready...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentEndDate, setCurrentEndDate] = useState(new Date()); // 현재 보여주는 뉴스의 마지막 날짜 (기본은 오늘)
  const [hasMoreNews, setHasMoreNews] = useState(true); // 더 불러올 뉴스가 있는지 여부

  const apiBaseUrl = 'https://newsarchive-ruby.vercel.app'; // `/api` 경로 포함 X

  const getEasternTimeNow = () => { /* ... 기존과 동일 ... */ };
  const getRelativeTime = (date) => { /* ... 기존과 동일 ... */ };

  const loadNews = useCallback(async (isInitialLoad = true, daysOffset = 0) => {
    setStatusText('Fetching news...');
    setIsRefreshing(true);

    let fetchEndDate = currentEndDate; // 기본은 현재 endDate (더보기 시에는 달라짐)
    if (isInitialLoad) {
      fetchEndDate = new Date(); // 초기 로드 또는 새로고침 시에는 오늘부터 시작
      setNewsData([]); // 초기 로드/새로고침 시 기존 뉴스 지우기
    } else {
      // '더보기' 버튼 클릭 시, 현재 가장 오래된 뉴스 날짜에서 하루 더 이전으로 설정
      fetchEndDate = new Date(newsData[newsData.length - 1].pubDate);
      fetchEndDate.setDate(fetchEndDate.getDate() - 1); // 가장 오래된 뉴스 날짜보다 하루 더 이전
    }
    
    // 요청할 start_date 계산 (fetchEndDate 기준으로 7일 전)
    const fetchStartDate = new Date(fetchEndDate);
    fetchStartDate.setDate(fetchStartDate.getDate() - 7);

    // 쿼리 파라미터 추가: start_date와 end_date
    const queryParams = new URLSearchParams({
        start_date: fetchStartDate.toISOString(),
        end_date: fetchEndDate.toISOString(),
    }).toString();

    try {
      const response = await fetch(`${apiBaseUrl}/api/news?${queryParams}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // 불러온 뉴스가 없다면, 더 이상 불러올 뉴스가 없음
      if (data.length === 0) {
        setHasMoreNews(false);
        setStatusText('No more news available for this period.');
      } else {
        // 기존 뉴스에 새로 불러온 뉴스 추가
        setNewsData(prevNews => [...prevNews, ...data]);
        setStatusText('Latest news is ready.');
        // 마지막 날짜 업데이트: 이번에 불러온 데이터의 가장 오래된 날짜
        setCurrentEndDate(new Date(data[data.length - 1].pubDate)); 
      }
      setLastUpdate(getEasternTimeNow());

    } catch (error) {
      console.error('Failed to fetch from backend:', error);
      setStatusText('An error occurred while refreshing.');
      setHasMoreNews(false); // 에러 발생 시 더보기 비활성화
      setLastUpdate('Failed to update');
    } finally {
      setIsRefreshing(false);
    }
  }, [apiBaseUrl, newsData]); // newsData 의존성 추가 (useCallback 경고 해결)

  // 초기 로드
  useEffect(() => {
    loadNews(true); // 초기 로드임을 알림
    const interval = setInterval(() => loadNews(true), 10 * 60 * 1000); // 10분마다 새로고침
    return () => clearInterval(interval);
  }, [loadNews]); // loadNews 의존성 추가

  // '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    loadNews(false); // 더보기임을 알림
  };

  const handleRefresh = () => {
      setNewsData([]); // 새로고침 시 기존 뉴스 제거 (깜빡임 방지)
      setCurrentEndDate(new Date()); // 날짜 범위 초기화
      setHasMoreNews(true); // 더보기 가능하게 설정
      loadNews(true); // 새로고침은 초기 로드처럼 처리
  };


  return (
    <>
      <div className="container">
        <header>
          <h1 className="logo">ARCHIVE</h1>
          <div className="subtitle">Global News Archive - Live News from Major Outlets</div>
        </header>

        <div className="status-bar">
          <div className="loading-indicator">
            <div className={`spinner ${!isRefreshing ? 'hidden' : ''}`} />
            <span id="status-text">{statusText}</span>
          </div>
          <div className="update-section">
            <div id="last-update">Last Updated: {lastUpdate}</div>
            <button className="refresh-btn" onClick={handleRefresh} disabled={isRefreshing}> {/* 핸들러 변경 */}
              <span className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}>🔄</span>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div id="news-list">
          {newsData.length > 0 ? (
            newsData.map((item, index) => (
              <div key={index} className="news-item">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">
                  <div className="news-title">{item.title}</div>
                  <div className="news-summary">{item.summary}</div>
                  <div className="news-meta">
                    <span className="news-source">{item.source}</span>
                    <span className="news-time">{getRelativeTime(item.pubDate)}</span>
                  </div>
                </a>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🌐</div>
              <div className="empty-state-text">
                {isRefreshing ? 'Fetching the latest news...' : 'No news to display. Try refreshing or check your connection.'}
              </div>
            </div>
          )}
          
          {/* '더보기' 버튼 추가 */}
          {newsData.length > 0 && hasMoreNews && !isRefreshing && (
            <div className="load-more-section">
              <button className="load-more-btn" onClick={handleLoadMore}>
                <span className="load-more-icon">▼</span> Show More News
              </button>
            </div>
          )}
          {/* 더이상 불러올 뉴스가 없을 때 메시지 */}
          {!hasMoreNews && !isRefreshing && newsData.length > 0 && (
              <div className="no-more-news-message">All available news loaded.</div>
          )}
        </div>
      </div>
    </>
  );
}