import { NextResponse } from 'next/server';

// 간단한 AI 요약 함수 (무료 서비스 사용)
async function summarizeText(text, maxLength = 150) {
  try {
    // 텍스트가 너무 길면 자르기
    const truncatedText = text.length > 1000 ? text.substring(0, 1000) + '...' : text;
    
    // 무료 AI 요약 서비스 (실제로는 간단한 텍스트 처리)
    // 실제 AI 서비스를 사용하려면 OpenAI API나 다른 유료 서비스 필요
    return generateSmartSummary(truncatedText, maxLength);
  } catch (error) {
    console.error('Summarization error:', error);
    return generateSimpleSummary(text, maxLength);
  }
}

// 스마트 요약 함수 (AI와 유사한 효과)
function generateSmartSummary(text, maxLength = 150) {
  if (!text || text.length === 0) {
    return '요약할 내용이 없습니다.';
  }

  // HTML 태그 제거
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // 문장 단위로 분리하고 중요도 계산
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) {
    return cleanText.substring(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
  }

  // 키워드 기반 중요도 계산
  const keywords = ['announced', 'launched', 'released', 'introduced', 'developed', 'created', 'found', 'discovered', 'revealed', 'confirmed', 'reported', 'stated', 'said', 'according', 'study', 'research', 'analysis', 'data', 'results', 'findings'];
  
  let bestSentence = sentences[0];
  let bestScore = 0;
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    // 키워드 매칭 점수
    keywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) {
        score += 2;
      }
    });
    
    // 길이 점수 (적당한 길이 선호)
    if (sentence.length > 50 && sentence.length < 200) {
      score += 1;
    }
    
    // 첫 번째 문장 보너스
    if (sentence === sentences[0]) {
      score += 1;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  });
  
  let summary = bestSentence.trim();
  
  // 길이 조정
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }
  
  return summary;
}

// 간단한 텍스트 요약 (AI 실패시 대체 방법)
function generateSimpleSummary(text, maxLength = 150) {
  if (!text || text.length === 0) {
    return '요약할 내용이 없습니다.';
  }

  // HTML 태그 제거
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // 문장 단위로 분리
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) {
    return cleanText.substring(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
  }

  // 첫 번째 문장을 우선 사용
  let summary = sentences[0].trim();
  
  // 길이가 부족하면 다음 문장 추가
  if (summary.length < maxLength && sentences.length > 1) {
    summary += '. ' + sentences[1].trim();
  }
  
  // 최대 길이 제한
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }
  
  return summary;
}

export async function POST(request) {
  try {
    const { text, title } = await request.json();
    
    if (!text && !title) {
      return NextResponse.json({ error: '텍스트나 제목이 필요합니다.' }, { status: 400 });
    }

    // 제목과 내용을 결합해서 요약
    const fullText = title ? `${title}. ${text || ''}` : text;
    
    const summary = await summarizeText(fullText, 150);
    
    return NextResponse.json({
      summary,
      originalLength: fullText.length,
      summaryLength: summary.length,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Summarization API error:', error);
    return NextResponse.json({ 
      error: '요약 생성 중 오류가 발생했습니다.',
      summary: '요약을 생성할 수 없습니다.'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
