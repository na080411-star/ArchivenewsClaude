'use client';

export default function ContactPage() {
  return (
    <div className="contact-container">
      <div className="contact-content">
        <header className="contact-header">
          <h1>Contact Us</h1>
          <p className="contact-subtitle">Get in touch with the News Archive team</p>
        </header>

        <div className="contact-sections">
          <section className="contact-section">
            <h2>We'd Love to Hear from You</h2>
            <p>
              Whether you have questions about our service, suggestions for improvement, 
              or feedback about our AI-powered news summaries, we're here to help.
            </p>
          </section>

          <section className="contact-section">
            <h2>Contact Information</h2>
            <div className="contact-methods">
              <div className="contact-method">
                <h3>📧 General Inquiries</h3>
                <p><strong>Email:</strong> contact@newsarchive.com</p>
                <p><strong>Response Time:</strong> Within 24-48 hours</p>
              </div>
              
              <div className="contact-method">
                <h3>🔒 Privacy & Data</h3>
                <p><strong>Email:</strong> privacy@newsarchive.com</p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
              </div>
              
              <div className="contact-method">
                <h3>⚖️ Legal & Terms</h3>
                <p><strong>Email:</strong> legal@newsarchive.com</p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
              </div>
              
              <div className="contact-method">
                <h3>🤖 Technical Support</h3>
                <p><strong>Email:</strong> support@newsarchive.com</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
              </div>
            </div>
          </section>

          <section className="contact-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>How does your AI summarization work?</h3>
                <p>
                  Our AI uses advanced natural language processing to analyze news articles and extract 
                  the most important information. It identifies key facts, context, and implications 
                  to create concise, informative summaries.
                </p>
              </div>
              
              <div className="faq-item">
                <h3>How often is the news updated?</h3>
                <p>
                  Our servers fetch new articles from RSS feeds every 30 seconds, and the website 
                  refreshes content every 10 seconds when auto-refresh is enabled.
                </p>
              </div>
              
              <div className="faq-item">
                <h3>Can I request specific news sources?</h3>
                <p>
                  We're always looking to expand our source list. If you have suggestions for 
                  reputable news sources, please email us with your recommendations.
                </p>
              </div>
              
              <div className="faq-item">
                <h3>How do you ensure content accuracy?</h3>
                <p>
                  We aggregate content from established, reputable news sources and provide 
                  direct links to original articles. Our AI summaries are designed to capture 
                  the essence while encouraging users to read the full articles for complete context.
                </p>
              </div>
            </div>
          </section>

          <section className="contact-section">
            <h2>Report Issues</h2>
            <p>
              If you encounter any technical issues, broken links, or have concerns about content, 
              please let us know. Include as much detail as possible to help us resolve the issue quickly.
            </p>
            <div className="report-types">
              <div className="report-type">
                <h3>🐛 Technical Issues</h3>
                <p>Website not loading, broken features, or performance problems</p>
              </div>
              <div className="report-type">
                <h3>🔗 Broken Links</h3>
                <p>News articles that don't load or redirect to incorrect pages</p>
              </div>
              <div className="report-type">
                <h3>📰 Content Concerns</h3>
                <p>Inappropriate content, inaccurate summaries, or source attribution issues</p>
              </div>
            </div>
          </section>

          <section className="contact-section">
            <h2>Business Inquiries</h2>
            <p>
              For business partnerships, advertising opportunities, or media inquiries, 
              please contact us at business@newsarchive.com
            </p>
          </section>
        </div>

        <footer className="contact-footer">
          <a href="/" className="back-link">← Back to News Archive</a>
        </footer>
      </div>
    </div>
  );
}
