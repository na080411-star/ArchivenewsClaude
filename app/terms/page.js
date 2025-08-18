'use client';

export default function TermsPage() {
  return (
    <div className="terms-container">
      <div className="terms-content">
        <header className="terms-header">
          <h1>Terms of Service</h1>
          <p className="terms-subtitle">Last updated: January 2024</p>
        </header>

        <div className="terms-sections">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using News Archive ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Description of Service</h2>
            <p>
              News Archive is an AI-powered news aggregation and summarization platform that collects, 
              analyzes, and summarizes news articles from various sources. Our service includes:
            </p>
            <ul>
              <li>AI-generated news summaries</li>
              <li>News categorization and filtering</li>
              <li>Real-time news updates</li>
              <li>Editorial content and analysis</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on News Archive's website for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
              and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. User Conduct</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the Service</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Content and Copyright</h2>
            <p>
              The content on News Archive includes both original content and aggregated content from third-party sources. 
              We respect intellectual property rights and expect users to do the same.
            </p>
            <h3>5.1 Original Content</h3>
            <p>
              Original content created by News Archive is protected by copyright and other intellectual property laws.
            </p>
            <h3>5.2 Third-Party Content</h3>
            <p>
              News summaries and links to original articles are provided for informational purposes. 
              We do not claim ownership of third-party content and provide proper attribution to original sources.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Disclaimers</h2>
            <p>
              The materials on News Archive's website are provided on an 'as is' basis. News Archive makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including without limitation, 
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
              of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Limitations</h2>
            <p>
              In no event shall News Archive or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
              to use the materials on News Archive's website, even if News Archive or a News Archive authorized 
              representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Accuracy of Materials</h2>
            <p>
              The materials appearing on News Archive's website could include technical, typographical, or photographic errors. 
              News Archive does not warrant that any of the materials on its website are accurate, complete, or current. 
              News Archive may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Links</h2>
            <p>
              News Archive has not reviewed all of the sites linked to its website and is not responsible for the contents 
              of any such linked site. The inclusion of any link does not imply endorsement by News Archive of the site. 
              Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Modifications</h2>
            <p>
              News Archive may revise these terms of service for its website at any time without notice. 
              By using this website you are agreeing to be bound by the then current version of these Terms of Service.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably 
              submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> legal@newsarchive.com</p>
              <p><strong>Response Time:</strong> Within 48 hours</p>
            </div>
          </section>
        </div>

        <footer className="terms-footer">
          <a href="/" className="back-link">← Back to News Archive</a>
        </footer>
      </div>
    </div>
  );
}
