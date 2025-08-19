'use client';

import { useEffect, useState } from 'react';

export default function LanguageDetector({ onLanguageChange }) {
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    detectUserLanguage();
  }, []);

  const detectUserLanguage = async () => {
    try {
      // 1. 브라우저 언어 감지
      const browserLang = navigator.language || navigator.userLanguage;
      let lang = 'en'; // 기본값

      // 2. 한국어 감지
      if (browserLang.startsWith('ko')) {
        lang = 'ko';
      }
      // 3. 일본어 감지
      else if (browserLang.startsWith('ja')) {
        lang = 'ja';
      }
      // 4. 중국어 감지
      else if (browserLang.startsWith('zh')) {
        lang = 'zh';
      }
      // 5. 기타 언어는 영어로 설정

             // 6. IP 기반 위치 감지 (선택적)
       try {
         const response = await fetch('https://ipapi.co/json/', {
           timeout: 5000 // 5초 타임아웃 추가
         });
         const data = await response.json();
         
         // 위치 기반 언어 설정
         if (data.country_code === 'KR') {
           lang = 'ko';
         } else if (data.country_code === 'JP') {
           lang = 'ja';
         } else if (data.country_code === 'CN' || data.country_code === 'TW') {
           lang = 'zh';
         }
       } catch (error) {
         console.log('IP location detection failed, using browser language:', error.message);
       }

      setDetectedLanguage(lang);
      onLanguageChange(lang);
    } catch (error) {
      console.error('Language detection failed:', error);
      setDetectedLanguage('en');
      onLanguageChange('en');
    } finally {
      setIsDetecting(false);
    }
  };

  const changeLanguage = (lang) => {
    setDetectedLanguage(lang);
    onLanguageChange(lang);
  };

  if (isDetecting) {
    return null; // 감지 중에는 아무것도 표시하지 않음
  }

  return (
    <div className="language-selector">
      <select 
        value={detectedLanguage} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">English</option>
        <option value="ko">한국어</option>
        <option value="ja">日本語</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
}
