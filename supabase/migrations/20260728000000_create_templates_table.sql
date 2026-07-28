-- Migration: Create templates table and RLS policies
-- Created at: 2026-07-28

CREATE TABLE IF NOT EXISTS public.templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    ai_model TEXT NOT NULL DEFAULT 'gemini-3.6-flash',
    category TEXT DEFAULT '보고서',
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- 1. Read policy for authenticated users
CREATE POLICY "Allow authenticated users to read templates"
ON public.templates FOR SELECT
TO authenticated
USING (true);

-- 2. Insert policy for authenticated users
CREATE POLICY "Allow authenticated users to insert templates"
ON public.templates FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Update policy for creator
CREATE POLICY "Allow users to update own templates"
ON public.templates FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- 4. Delete policy for creator
CREATE POLICY "Allow users to delete own templates"
ON public.templates FOR DELETE
TO authenticated
USING (auth.uid() = created_by);
