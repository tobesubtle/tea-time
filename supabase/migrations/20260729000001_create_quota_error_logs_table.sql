-- Gemini API 쿼터 및 비용 초과 에러 로그 테이블 생성
CREATE TABLE IF NOT EXISTS public.quota_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    model_name TEXT NOT NULL,
    error_message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quota_error_logs_created_at ON public.quota_error_logs (created_at DESC);

ALTER TABLE public.quota_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert and read quota_error_logs"
ON public.quota_error_logs FOR ALL
TO authenticated
USING (true);
