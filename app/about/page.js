'use client';

export default function AboutPage() {
  return (
    <div className="about-container">
      <div className="about-content">
        <header className="about-header">
          <h1>About News Archive</h1>
          <p className="about-subtitle">AI-Powered News Summarizer & Analysis Platform</p>
        </header>

        <div className="about-sections">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              News Archive is dedicated to providing instant, AI-powered news summaries from major global outlets. 
              We believe that staying informed shouldn't take hours of reading. Our advanced AI technology 
              analyzes and condenses news articles into clear, concise summaries, helping you understand 
              the most important stories of the day in minutes.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Do</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>🤖 AI-Powered Summaries</h3>
                <p>Our custom AI algorithm generates intelligent, 2-sentence summaries that capture the essence of each news story.</p>
              </div>
              <div className="feature-item">
                <h3>📰 Multi-Source Aggregation</h3>
                <p>We collect news from 50+ major outlets including BBC, CNN, Reuters, and other trusted sources.</p>
              </div>
              <div className="feature-item">
                <h3>🏷️ Smart Categorization</h3>
                <p>Articles are automatically categorized into Technology, Business, World, Politics, Science, Health, Sports, and Entertainment.</p>
              </div>
              <div className="feature-item">
                <h3>⚡ Real-Time Updates</h3>
                <p>News is updated every 30 seconds from our servers, ensuring you always have the latest information.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Technology</h2>
            <p>
              We use advanced natural language processing and machine learning algorithms to analyze news content. 
              Our system identifies key information, important context, and relevant details to create meaningful 
              summaries that help you stay informed without overwhelming you with information.
            </p>
          </section>

          <section className="about-section">
            <h2>Editorial Standards</h2>
            <p>
              While we use AI to summarize news, we maintain high editorial standards. Our platform aggregates 
              content from reputable news sources and provides additional editorial analysis and context to help 
              readers understand the broader implications of news events.
            </p>
          </section>

          <section className="about-section">
            <h2>Privacy & Transparency</h2>
            <p>
              We are committed to transparency in how we collect, use, and protect your information. 
              We do not collect personal data beyond what is necessary to provide our service. 
              For detailed information about our data practices, please see our Privacy Policy.
            </p>
          </section>

          <section className="about-section">
            <h2>Contact Us</h2>
            <p>
              Have questions, suggestions, or feedback? We'd love to hear from you. 
              You can reach us through our contact form or by emailing us directly.
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> contact@newsarchive.com</p>
              <p><strong>Response Time:</strong> Within 24-48 hours</p>
            </div>
          </section>
        </div>

        <footer className="about-footer">
          <a href="/" className="back-link">← Back to News Archive</a>
        </footer>
      </div>
    </div>
  );
}
