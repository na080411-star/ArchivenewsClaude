'use client';

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <header className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="privacy-subtitle">Last updated: January 2024</p>
        </header>

        <div className="privacy-sections">
          <section className="privacy-section">
            <h2>1. Information We Collect</h2>
            <p>
              News Archive ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information 
              when you visit our website.
            </p>
            
            <h3>1.1 Information You Provide</h3>
            <p>We do not collect personal information such as names, email addresses, or phone numbers.</p>
            
            <h3>1.2 Automatically Collected Information</h3>
            <ul>
              <li><strong>Log Data:</strong> We collect standard log data including IP addresses, browser type, pages visited, and time spent on pages.</li>
              <li><strong>Cookies:</strong> We use cookies to improve your browsing experience and analyze site traffic.</li>
              <li><strong>Device Information:</strong> We may collect information about your device, including device type and operating system.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>To provide and maintain our news aggregation service</li>
              <li>To improve our website functionality and user experience</li>
              <li>To analyze usage patterns and optimize our content</li>
              <li>To detect and prevent technical issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. Advertising and Analytics</h2>
            <p>
              Our website may display advertisements and use analytics services to improve user experience. 
              These services may use cookies and web beacons to collect information, including your IP address, 
              browser type, and pages visited, to provide relevant content and analyze site usage.
            </p>
            <p>
              We are committed to transparency in our advertising practices and will update this policy 
              when we implement specific advertising services.
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
            <ul>
              <li>To comply with legal requirements</li>
              <li>To protect our rights and safety</li>
              <li>With your explicit consent</li>
              <li>To service providers who assist in operating our website (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to our processing of your information</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>7. Cookies Policy</h2>
            <p>
              We use cookies to enhance your browsing experience. You can control cookie settings through your browser preferences. 
              Disabling cookies may affect website functionality.
            </p>
            <h3>Types of Cookies We Use:</h3>
                         <ul>
               <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
               <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
               <li><strong>Advertising Cookies:</strong> May be used for relevant advertising when implemented</li>
             </ul>
          </section>

          <section className="privacy-section">
            <h2>8. Third-Party Links</h2>
            <p>
              Our website contains links to external news sources and third-party websites. 
              We are not responsible for the privacy practices of these external sites. 
              We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our website is not intended for children under 13 years of age. 
              We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
                         <div className="contact-info">
               <p><strong>Email:</strong> na080411@gmail.com</p>
               <p><strong>Response Time:</strong> Within 48 hours</p>
             </div>
          </section>
        </div>

        <footer className="privacy-footer">
          <a href="/" className="back-link">← Back to News Archive</a>
        </footer>
      </div>
    </div>
  );
}
