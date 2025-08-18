'use client';

import { useEffect, useState } from 'react';

// 페이지 컴포넌트
export default function HomePage() {
  const [newsData, setNewsData] = useState([]);
  const [statusText, setStatusText] = useState('Preparing news feed...');
  const [lastUpdate, setLastUpdate] = useState('Ready...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredNews, setFilteredNews] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh state
  const [displayCount, setDisplayCount] = useState(30); // Display count state

  // 로컬/배포 환경에 따라 API 주소 결정
  const apiBaseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://newsarchive.net/' 
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
      console.log(`Category deselected, showing all articles: ${newsData.length}`);
    } else {
      // Select new category
      setSelectedCategory(category);
      const filtered = newsData.filter(item => item.category === category);
      setFilteredNews(filtered);
      console.log(`Category selected: ${category}, filtered articles: ${filtered.length}`);
    }
    // Reset display count when category changes
    setDisplayCount(30);
  };

  // Load more articles function
  const loadMoreArticles = () => {
    setDisplayCount(prev => prev + 30);
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
        // Auto-refresh 시에도 displayCount를 30으로 리셋 (카테고리 필터링 시)
        setDisplayCount(30);
        console.log(`Category filter applied: ${selectedCategory}, filtered articles: ${filtered.length}`);
      } else {
        setFilteredNews(sanitizedNews);
        // Auto-refresh 시에도 displayCount를 30으로 리셋 (전체 보기 시)
        setDisplayCount(30);
        console.log(`No category filter, total articles: ${sanitizedNews.length}`);
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

  // Get displayed news based on current filter and display count
  const displayedNews = filteredNews.slice(0, displayCount);
  const hasMoreNews = filteredNews.length > displayCount;
  
  // Debug logging
  console.log('Debug Info:', {
    selectedCategory,
    totalNews: newsData.length,
    filteredNews: filteredNews.length,
    displayCount,
    remaining: filteredNews.length - displayCount,
    hasMoreNews
  });

  return (
    <>
      {/* TEST DUMMY TEXT - DEPLOYMENT TEST */}
      <div style={{ 
        background: 'red', 
        color: 'white', 
        padding: '10px', 
        textAlign: 'center', 
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🚀 TEST: newsarchive.net DOMAIN DEPLOYMENT SUCCESS! 🚀
      </div>
      
      <div className="container">
        <header>
          <h1 className="logo">ARCHIVE</h1>
          <div className="subtitle">AI-Powered News Summarizer - Instant Summaries from Major Outlets</div>
          <div className="site-description">
            Get instant AI-generated summaries of the latest news. Our AI analyzes and condenses articles to save you time while keeping you informed.
          </div>
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
            <div className="summary-info">
              <span className="summary-text">🤖 AI-Powered News Summaries</span>
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
          {displayedNews.length > 0 ? (
            <>
              {displayedNews.map((item, index) => (
                <div key={index} className="news-item">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">
                    <div className="news-title">{item.title}</div>
                    
                                         {/* AI Summary Display */}
                     <div className="news-summary-container">
                       <div className="news-summary ai-summary">
                         {item.aiSummary || "AI summary not available"}
                       </div>
                     </div>
                    
                    <div className="news-meta">
                      <span className="news-source">{item.source}</span>
                      <span className="news-category">{item.category}</span>
                      <span className="news-time">{getRelativeTime(item.pubDate)}</span>
                    </div>
                  </a>
                </div>
              ))}
              

              
              {/* Load More Button */}
              {hasMoreNews && (
                <div className="load-more-container">
                  <button className="load-more-btn" onClick={loadMoreArticles}>
                    <span className="load-more-icon">⬇</span>
                     Load More Articles ({filteredNews.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🌐</div>
              <div className="empty-state-text">Fetching the latest news...</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer for AdSense Compliance */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="/about" className="footer-link">About Us</a>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
            <a href="/terms" className="footer-link">Terms of Service</a>
            <a href="/contact" className="footer-link">Contact</a>
          </div>
          <div className="footer-info">
                         <p>&copy; 2025 News Archive. All rights reserved. Providing AI-powered news summaries and analysis.</p>
          </div>
        </div>
      </footer>
    </>
  );
}