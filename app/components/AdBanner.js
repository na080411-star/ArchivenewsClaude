'use client';

import { useEffect } from 'react';

const AdBanner = ({ adSlot, adClient, format = 'auto', responsive = true, style = {} }) => {
  useEffect(() => {
    // AdSense 스크립트가 로드되었는지 확인
    if (window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (error) {
        console.log('AdSense error:', error);
      }
    }
  }, []);

  return (
    <div className="ad-banner">
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          ...style
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default AdBanner;
