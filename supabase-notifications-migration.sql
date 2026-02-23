-- PromptVault migration: add notifications backend foundation
-- Run this once in Supabase SQL editor for existing projects.

CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('like', 'follow')),
  prompt_id    UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_recipient_created_at_idx
  ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_recipient_unread_idx
  ON public.notifications (recipient_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications: recipient can read own" ON public.notifications;
CREATE POLICY "notifications: recipient can read own"
  ON public.notifications FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = recipient_id);

DROP POLICY IF EXISTS "notifications: recipient can update own" ON public.notifications;
CREATE POLICY "notifications: recipient can update own"
  ON public.notifications FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = recipient_id)
  WITH CHECK ((SELECT auth.uid()) = recipient_id);

DROP POLICY IF EXISTS "notifications: recipient can delete own" ON public.notifications;
CREATE POLICY "notifications: recipient can delete own"
  ON public.notifications FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = recipient_id);

CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  prompt_owner UUID;
BEGIN
  SELECT user_id INTO prompt_owner
  FROM public.prompts
  WHERE id = NEW.prompt_id;

  IF prompt_owner IS NOT NULL AND prompt_owner <> NEW.user_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, prompt_id)
    VALUES (prompt_owner, NEW.user_id, 'like', NEW.prompt_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.followed_id <> NEW.follower_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type)
    VALUES (NEW.followed_id, NEW.follower_id, 'follow');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_like_created_notify ON public.likes;
CREATE TRIGGER on_like_created_notify
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.create_like_notification();

DROP TRIGGER IF EXISTS on_follow_created_notify ON public.follows;
CREATE TRIGGER on_follow_created_notify
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.create_follow_notification();
