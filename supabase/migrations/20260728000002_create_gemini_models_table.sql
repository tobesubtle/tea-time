-- Migration: Create gemini_models table and update prompt_history
-- Created at: 2026-07-28

CREATE TABLE IF NOT EXISTS public.gemini_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    badge TEXT,
    is_active BOOLEAN DEFAULT true,
    is_latest BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for gemini_models
ALTER TABLE public.gemini_models ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active models
CREATE POLICY "Allow authenticated users to read gemini_models"
ON public.gemini_models FOR SELECT
TO authenticated
USING (true);

-- Initial default models seed
INSERT INTO public.gemini_models (id, name, description, badge, is_active, is_latest)
VALUES
('gemini-3.6-flash', 'Gemini 3.6 Flash (추천)', '최신 모델 (2026.07). 코드 작성, 지식 작업, 멀티모달 최적화 및 높은 토큰 효율성', '최신/인기', true, true),
('gemini-3.5-flash-lite', 'Gemini 3.5 Flash-Lite', '대량 자동화 및 초저지연 응답에 최적화된 경량화 모델', '빠름/저렴', true, false),
('gemini-3.1-pro', 'Gemini 3.1 Pro (Preview)', '복잡한 추론, 심도 깊은 기획 및 정교한 분석을 위한 최상위 모델', '고성능', true, false),
('gemini-3.5-flash-cyber', 'Gemini 3.5 Flash Cyber', '보안 취약점 진단 및 안전한 코드 생성을 위한 보안 전문 특화 모델', '보안특화', true, false)
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description,
badge = EXCLUDED.badge,
is_active = EXCLUDED.is_active,
is_latest = EXCLUDED.is_latest,
updated_at = NOW();
