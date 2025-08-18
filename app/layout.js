// app/layout.js

import './styles.css';

export const metadata = {
  title: 'News Archive - Global News Aggregator',
  description: 'Live news from 50+ major outlets with AI-powered summaries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}