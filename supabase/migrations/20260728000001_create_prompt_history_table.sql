-- Migration: Create prompt_history table and RLS policies
-- Created at: 2026-07-28

CREATE TABLE IF NOT EXISTS public.prompt_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    title TEXT,
    input_variables JSONB DEFAULT '{}'::jsonb,
    final_prompt TEXT NOT NULL,
    result_text TEXT,
    ai_model TEXT NOT NULL DEFAULT 'gemini-3.6-flash',
    like_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own prompt history"
ON public.prompt_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can insert own prompt history"
ON public.prompt_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt history"
ON public.prompt_history FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompt history"
ON public.prompt_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
