'use client';

import { useEffect, useState } from 'react';

// 페이지 컴포넌트
export default function HomePage() {
  const [newsData, setNewsData] = useState([]);
  const [statusText, setStatusText] = useState('뉴스 준비 중...');
  const [lastUpdate, setLastUpdate] = useState('준비 중...');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 로컬/배포 환경에 따라 API 주소 결정
 const apiBaseUrl = 'https://archivenews-claude.vercel.app';

  const toKoreanTime = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  const getKoreanNow = () => {
  // This function is no longer needed, you can delete it if you want.
  // We'll use a new English-formatted time below.
  return new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
};

const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Change relative time strings to English
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
};

const loadAllNews = async () => {
    setStatusText('Preparing news feed...');
    setIsRefreshing(true);

    try {
      // 캐싱을 방지하기 위해 cache 옵션을 추가합니다.
      const response = await fetch(`${apiBaseUrl}/api/news`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setNewsData(data);
      setLastUpdate(getKoreanNow());
      setStatusText('최신 뉴스 준비 완료');
    } catch (error) {
      console.error('Failed to fetch from backend:', error);
      setNewsData([]);
      setStatusText('갱신 중 오류가 발생했습니다');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 페이지 로드 시 뉴스 로딩
    loadAllNews();
    // 10분마다 자동 갱신
    const interval = setInterval(loadAllNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
          <button className="refresh-btn" onClick={loadAllNews} disabled={isRefreshing}>
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
            <div className="empty-state-text">Fetching the latest news...</div>
          </div>
        )}
      </div>
    </div>
  </>
);
}