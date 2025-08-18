'use client';

import { useEffect, useState } from 'react';

// 페이지 컴포넌트
export default function HomePage() {
  const [newsData, setNewsData] = useState([]);
  const [statusText, setStatusText] = useState('Preparing news feed...');
  const [lastUpdate, setLastUpdate] = useState('Ready...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [showSmartSummary, setShowSmartSummary] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredNews, setFilteredNews] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh state
  // Removed displayCount state since we show all articles

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

  // Category filter function
  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      // Double click - deselect category
      setSelectedCategory(null);
      setFilteredNews(newsData);
    } else {
      // Select new category
      setSelectedCategory(category);
      const filtered = newsData.filter(item => item.category === category);
      setFilteredNews(filtered);
    }
  };

  const loadAllNews = async () => {
    setStatusText('Fetching news from 50+ sources...');
    setIsRefreshing(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/news`, { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate and sanitize data
      const newsItems = Array.isArray(data.news || data) ? (data.news || data) : [];
      const responseStats = data.stats || null;
      
      // Sanitize news items to prevent XSS
      const sanitizedNews = newsItems.map(item => ({
        ...item,
        title: item.title ? String(item.title).replace(/<[^>]*>/g, '') : '',
        summary: item.summary ? String(item.summary).replace(/<[^>]*>/g, '') : '',
        aiSummary: item.aiSummary ? String(item.aiSummary).replace(/<[^>]*>/g, '') : '',
        source: item.source ? String(item.source).replace(/<[^>]*>/g, '') : '',
        category: item.category ? String(item.category).replace(/<[^>]*>/g, '') : 'General',
        link: item.link ? String(item.link) : '#',
        pubDate: item.pubDate ? String(item.pubDate) : new Date().toISOString()
      }));
      
      setNewsData(sanitizedNews);
      setStats(responseStats);
      
      // Apply category filter if selected
      if (selectedCategory) {
        const filtered = sanitizedNews.filter(item => item.category === selectedCategory);
        setFilteredNews(filtered);
      } else {
        setFilteredNews(sanitizedNews);
      }
      
      if (responseStats) {
        setStatusText(`Loaded ${responseStats.totalArticles} articles from ${responseStats.successfulSources}/${responseStats.totalSources} sources`);
      } else {
        setStatusText('Latest news is ready.');
      }
      
      setLastUpdate(getEasternTimeNow());
    } catch (error) {
      console.error('Failed to fetch from backend:', error);
      setNewsData([]);
      setFilteredNews([]);
      setStatusText(`Error: ${error.message}. Please check if the server is running.`);
      setLastUpdate('Failed to update');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllNews();
    // Auto-refresh가 활성화된 경우에만 10초마다 서버에서 최신 뉴스 가져오기
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadAllNews, 10 * 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, apiBaseUrl]); // autoRefresh와 apiBaseUrl이 변경될 때마다 useEffect 재실행

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
                  checked={showSmartSummary}
                  onChange={(e) => setShowSmartSummary(e.target.checked)}
                />
                <span className="toggle-text">🤖 Smart Summary</span>
              </label>
            </div>
            
            {/* Category Filter Buttons */}
            {stats && stats.categoryStats && (
              <div className="category-filters">
                {Object.entries(stats.categoryStats)
                  .sort(([a], [b]) => {
                    // General을 맨 앞으로, 나머지는 알파벳 순
                    if (a === 'General') return -1;
                    if (b === 'General') return 1;
                    return a.localeCompare(b);
                  })
                  .map(([category, count]) => (
                    <button
                      key={category}
                      className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category} ({count})
                    </button>
                  ))}
              </div>
            )}
            
            {/* Auto-refresh toggle and refresh button */}
            <div className="refresh-controls">
              <label className="auto-refresh-toggle">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className="auto-refresh-text">🔄 Auto-refresh (10s)</span>
              </label>
              <button className="refresh-btn" onClick={loadAllNews} disabled={isRefreshing}>
                <span className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}>🔄</span>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

                <div id="news-list">
          {filteredNews.length > 0 ? (
            <>
              {filteredNews.map((item, index) => (
                <div key={index} className="news-item">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">
                    <div className="news-title">{item.title}</div>
                    
                    {/* Smart Summary or Original Summary Display */}
                    {showSmartSummary ? (
                      <div className="news-summary-container">
                        <div className="news-summary ai-summary">
                          <span className="summary-badge">🤖 Smart Summary</span>
                          {item.aiSummary || item.summary}
                        </div>
                      </div>
                    ) : (
                      <div className="news-summary">{item.summary}</div>
                    )}
                    
                    <div className="news-meta">
                      <span className="news-source">{item.source}</span>
                      <span className="news-category">{item.category}</span>
                      <span className="news-time">{getRelativeTime(item.pubDate)}</span>
                    </div>
                  </a>
                </div>
              ))}
              
                             {/* All articles are displayed */}
            </>
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