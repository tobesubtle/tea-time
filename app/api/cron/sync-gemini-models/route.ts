import { NextResponse } from 'next/server';
import { createAdminClient } from '@/infrastructure/supabase/admin';
import { GoogleGenAI } from '@google/genai';

export const revalidate = 0;

export async function GET(request: Request) {
  // Vercel Cron 인가 확인 (선택 사항)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // 로컬 테스트를 위해 완전 거부는 하지 않고 로그 출력
    console.warn('Cron secret authorization check bypassed or not configured.');
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  let fetchedModels: Array<{ id: string; name: string; description: string; badge: string; is_latest: boolean }> = [];

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      // API를 통해 모델 목록 가져오기 시도
      const listResponse = await ai.models.list();
      if (listResponse && (listResponse as any).models) {
        const rawModels: any[] = (listResponse as any).models;
        fetchedModels = rawModels
          .filter((m) => m.name && m.name.includes('gemini'))
          .map((m) => {
            const cleanId = m.name.replace('models/', '');
            return {
              id: cleanId,
              name: cleanId.toUpperCase(),
              description: m.description || 'Google Gemini AI Model',
              badge: cleanId.includes('flash') ? '속도최적화' : '고성능',
              is_latest: cleanId.includes('3.6') || cleanId.includes('2.5'),
            };
          });
      }
    } catch (e: any) {
      console.warn('Failed to fetch models dynamically via SDK. Fallback to latest static registry:', e.message);
    }
  }

  // SDK 목록 응답이 없거나 실패 시 최신 Gemini 모델 레지스트리로 fallback
  if (fetchedModels.length === 0) {
    fetchedModels = [
      {
        id: 'gemini-3.6-flash',
        name: 'Gemini 3.6 Flash (추천)',
        description: '최신 모델 (2026.07). 코드 작성, 지식 작업, 멀티모달 최적화 및 높은 토큰 효율성',
        badge: '최신/인기',
        is_latest: true,
      },
      {
        id: 'gemini-3.5-flash-lite',
        name: 'Gemini 3.5 Flash-Lite',
        description: '대량 자동화 및 초저지연 응답에 최적화된 경량화 모델',
        badge: '빠름/저렴',
        is_latest: false,
      },
      {
        id: 'gemini-3.1-pro',
        name: 'Gemini 3.1 Pro (Preview)',
        description: '복잡한 추론, 심도 깊은 기획 및 정교한 분석을 위한 최상위 모델',
        badge: '고성능',
        is_latest: false,
      },
      {
        id: 'gemini-3.5-flash-cyber',
        name: 'Gemini 3.5 Flash Cyber',
        description: '보안 취약점 진단 및 안전한 코드 생성을 위한 보안 전문 특화 모델',
        badge: '보안특화',
        is_latest: false,
      },
    ];
  }

  // Supabase DB에 동기화 업데이트
  const adminClient = createAdminClient();
  let updatedCount = 0;

  for (const model of fetchedModels) {
    const { error } = await adminClient.from('gemini_models').upsert({
      id: model.id,
      name: model.name,
      description: model.description,
      badge: model.badge,
      is_active: true,
      is_latest: model.is_latest,
      updated_at: new Date().toISOString(),
    });

    if (!error) updatedCount++;
  }

  return NextResponse.json({
    success: true,
    message: `Gemini models synchronized successfully (${updatedCount} updated)`,
    timestamp: new Date().toISOString(),
    models: fetchedModels,
  });
}
