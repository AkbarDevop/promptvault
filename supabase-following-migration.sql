-- PromptVault migration: add follows for personalized feed
-- Run this once in Supabase SQL editor for existing projects.

CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CONSTRAINT follows_no_self_follow CHECK (follower_id <> followed_id)
);

CREATE INDEX follows_follower_id_created_at_idx ON public.follows (follower_id, created_at DESC);
CREATE INDEX follows_followed_id_idx ON public.follows (followed_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows: anyone can read"
  ON public.follows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "follows: authenticated can insert own"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = follower_id AND follower_id <> followed_id);
CREATE POLICY "follows: user can delete own"
  ON public.follows FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = follower_id);
