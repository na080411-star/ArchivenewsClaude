'use client';

import { useEffect, useState } from 'react';

// 페이지 컴포넌트
export default function HomePage() {
  const [newsData, setNewsData] = useState([]);
  const [statusText, setStatusText] = useState('Preparing news feed...');
  const [lastUpdate, setLastUpdate] = useState('Ready...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [showAISummary, setShowAISummary] = useState(true);
  const [summarizing, setSummarizing] = useState({});

  // 로컬/배포 환경에 따라 API 주소 결정
  const apiBaseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://newsarchive-ruby.vercel.app/' 
    : 'http://localhost:3000';

  // 시간을 미국 동부 시간으로 표시하는 함수
  const getEasternTimeNow = () => {
    return new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false });
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  // AI 요약 생성 함수
  const generateAISummary = async (index, title, summary) => {
    if (summarizing[index]) return; // 이미 요약 중이면 중복 요청 방지
    
    setSummarizing(prev => ({ ...prev, [index]: true }));
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          text: summary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setNewsData(prev => prev.map((item, i) => 
          i === index ? { ...item, aiSummary: data.summary } : item
        ));
      }
    } catch (error) {
      console.error('AI summary generation failed:', error);
    } finally {
      setSummarizing(prev => ({ ...prev, [index]: false }));
    }
  };

  const loadAllNews = async () => {
    setStatusText('Fetching news from 50+ sources...');
    setIsRefreshing(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/news`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // 새로운 API 응답 구조 처리
      const newsItems = data.news || data;
      const responseStats = data.stats;
      
      setNewsData(newsItems);
      setStats(responseStats);
      
      if (responseStats) {
        setStatusText(`Loaded ${responseStats.totalArticles} articles from ${responseStats.successfulSources}/${responseStats.totalSources} sources`);
      } else {
        setStatusText('Latest news is ready.');
      }
      
      setLastUpdate(getEasternTimeNow());
    } catch (error) {
      console.error('Failed to fetch from backend:', error);
      setNewsData([]);
      setStatusText('An error occurred while refreshing.');
      setLastUpdate('Failed to update');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllNews();
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
            {stats && (
              <div className="stats-info">
                <span className="stats-text">
                  📊 {stats.successfulSources}/{stats.totalSources} sources • {stats.totalArticles} articles
                </span>
              </div>
            )}
            <div className="summary-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showAISummary}
                  onChange={(e) => setShowAISummary(e.target.checked)}
                />
                <span className="toggle-text">🤖 AI 요약</span>
              </label>
            </div>
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
                  
                  {/* AI 요약 또는 원본 요약 표시 */}
                  {showAISummary ? (
                    <div className="news-summary-container">
                      {item.aiSummary ? (
                        <div className="news-summary ai-summary">
                          <span className="ai-badge">🤖 AI 요약</span>
                          {item.aiSummary}
                        </div>
                      ) : (
                        <div className="news-summary">
                          {item.summary}
                          <button 
                            className="generate-summary-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              generateAISummary(index, item.title, item.summary);
                            }}
                            disabled={summarizing[index]}
                          >
                            {summarizing[index] ? '🤖 요약 중...' : '🤖 AI 요약 생성'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="news-summary">{item.summary}</div>
                  )}
                  
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