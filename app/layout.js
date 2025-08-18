// app/layout.js

import './styles.css';

export const metadata = {
  title: 'News Archive - Global News Aggregator',
  description: 'Live news from 50+ major outlets with AI-powered summaries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}