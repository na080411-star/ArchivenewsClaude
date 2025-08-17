// app/layout.js

import './styles.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en"> {/* Change lang="ko" to lang="en" */}
      <body>
        {children}
      </body>
    </html>
  );
}