import { useEffect, useState } from 'react';

// 페이지 컴포넌트
export default function HomePage() {
  const [newsData, setNewsData] = useState([]);
  const [statusText, setStatusText] = useState('뉴스 준비 중...');
  const [lastUpdate, setLastUpdate] = useState('준비 중...');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 로컬/배포 환경에 따라 API 주소 결정
  const apiBaseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

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
    return new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const loadAllNews = async () => {
    setStatusText('뉴스 로딩 중...');
    setIsRefreshing(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/news`);
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
          <div className="subtitle">Global News Archive - 세계 주요 언론사 실시간 뉴스</div>
        </header>

        <div className="status-bar">
          <div className="loading-indicator">
            <div className={`spinner ${!isRefreshing ? 'hidden' : ''}`} />
            <span id="status-text">{statusText}</span>
          </div>
          <div className="update-section">
            <div id="last-update">마지막 업데이트: {lastUpdate}</div>
            <button className="refresh-btn" onClick={loadAllNews} disabled={isRefreshing}>
              <span className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}>🔄</span>
              {isRefreshing ? '갱신중...' : '갱신'}
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
              <div className="empty-state-text">최신 뉴스를 불러오고 있습니다...</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}