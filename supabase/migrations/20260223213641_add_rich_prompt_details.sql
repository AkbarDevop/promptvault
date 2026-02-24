-- PromptVault migration: add rich prompt detail fields
-- Run this once in Supabase SQL editor for existing projects.

ALTER TABLE public.prompts
  ADD COLUMN IF NOT EXISTS usage_tips TEXT CHECK (char_length(usage_tips) <= 2000),
  ADD COLUMN IF NOT EXISTS example_output TEXT CHECK (char_length(example_output) <= 2000);
