'use client';

import { useEffect } from 'react';

export default function AdBanner({ 
  adSlot, 
  className = '', 
  style = {},
  format = 'auto',
  responsive = true 
}) {
  useEffect(() => {
    try {
      // AdSense가 로드되었는지 확인
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.log('AdSense not loaded yet');
    }
  }, []);

  return (
    <div className={`ad-banner ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1895301779178331"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
