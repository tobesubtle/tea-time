-- Migration: Create cron_logs table for Cron job execution history & monitoring
-- Created at: 2026-07-29

CREATE TABLE IF NOT EXISTS public.cron_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    message TEXT,
    updated_count INTEGER DEFAULT 0,
    execution_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on created_at for fast cleanup & sorting
CREATE INDEX IF NOT EXISTS idx_cron_logs_created_at ON public.cron_logs (created_at DESC);

-- Enable RLS for cron_logs
ALTER TABLE public.cron_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read cron_logs
CREATE POLICY "Allow authenticated users to read cron_logs"
ON public.cron_logs FOR SELECT
TO authenticated
USING (true);
