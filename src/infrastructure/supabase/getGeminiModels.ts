import { GeminiModel } from '@/domain/entities/GeminiModel';
import { createClient } from './server';

export async function getActiveGeminiModels(): Promise<GeminiModel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gemini_models')
    .select('*')
    .eq('is_active', true)
    .order('is_latest', { ascending: false });

  if (error || !data || data.length === 0) {
    // DB 조회 실패 또는 데이터가 아직 없을 시 기본 최신 모델 반환
    return [
      {
        id: 'gemini-3.6-flash',
        name: 'Gemini 3.6 Flash (추천)',
        description: '최신 모델 (2026.07). 코드 작성, 지식 작업, 멀티모달 최적화 및 높은 토큰 효율성',
        badge: '최신/인기',
        isLatest: true,
      },
      {
        id: 'gemini-3.5-flash-lite',
        name: 'Gemini 3.5 Flash-Lite',
        description: '대량 자동화 및 초저지연 응답에 최적화된 경량화 모델',
        badge: '빠름/저렴',
        isLatest: false,
      },
      {
        id: 'gemini-3.1-pro',
        name: 'Gemini 3.1 Pro (Preview)',
        description: '복잡한 추론, 심도 깊은 기획 및 정교한 분석을 위한 최상위 모델',
        badge: '고성능',
        isLatest: false,
      },
      {
        id: 'gemini-3.5-flash-cyber',
        name: 'Gemini 3.5 Flash Cyber',
        description: '보안 취약점 진단 및 안전한 코드 생성을 위한 보안 전문 특화 모델',
        badge: '보안특화',
        isLatest: false,
      },
    ];
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    badge: item.badge,
    isActive: item.is_active,
    isLatest: item.is_latest,
    updatedAt: item.updated_at,
  }));
}
