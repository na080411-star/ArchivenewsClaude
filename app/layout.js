// app/layout.js

import './styles.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'News Archive - Global News Aggregator',
  description: 'Live news from 50+ major outlets with AI-powered summaries',
  metadataBase: new URL('https://www.newsarchive.live'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
              {/* Google AdSense */}
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1895301779178331" crossOrigin="anonymous"></script>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}