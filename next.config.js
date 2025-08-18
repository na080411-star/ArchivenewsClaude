/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 배포 최적화
  output: 'standalone',
  
  async headers() {
    return [
      {
        // 모든 API 라우트에 대해 CORS 헤더 추가
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  
  // 외부 이미지 도메인 허용
  images: {
    domains: ['feeds.bbci.co.uk', 'rss.cnn.com', 'www.theguardian.com', 'www.theverge.com', 'rss.nytimes.com'],
    unoptimized: true,
  },
};

module.exports = nextConfig;
