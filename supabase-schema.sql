-- PromptVault Database Schema
-- Run this in the Supabase SQL Editor (top to bottom)

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Create ENUM types
CREATE TYPE ai_model AS ENUM (
  'chatgpt', 'claude', 'gemini', 'grok', 'llama', 'mistral', 'other'
);

CREATE TYPE prompt_category AS ENUM (
  'coding', 'writing', 'marketing', 'design', 'business',
  'education', 'productivity', 'creative', 'research', 'other'
);

-- 3. Profiles table (mirrors auth.users)
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  website_url  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username',
             SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name',
             SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Prompts table
CREATE TABLE public.prompts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  content       TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 8000),
  description   TEXT CHECK (char_length(description) <= 500),
  usage_tips    TEXT CHECK (char_length(usage_tips) <= 2000),
  example_output TEXT CHECK (char_length(example_output) <= 2000),
  model         ai_model NOT NULL DEFAULT 'other',
  category      prompt_category NOT NULL DEFAULT 'other',
  tags          TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(tags, 1) <= 10),
  is_public     BOOLEAN NOT NULL DEFAULT TRUE,
  like_count    INT NOT NULL DEFAULT 0,
  bookmark_count INT NOT NULL DEFAULT 0,
  view_count    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for feed queries
CREATE INDEX prompts_fts_idx ON public.prompts
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX prompts_tags_idx ON public.prompts USING GIN (tags);
CREATE INDEX prompts_created_at_idx ON public.prompts (created_at DESC) WHERE is_public = TRUE;
CREATE INDEX prompts_user_id_idx ON public.prompts (user_id, created_at DESC);
CREATE INDEX prompts_category_idx ON public.prompts (category, created_at DESC) WHERE is_public = TRUE;
CREATE INDEX prompts_like_count_idx ON public.prompts (like_count DESC) WHERE is_public = TRUE;

-- 5. Likes table
CREATE TABLE public.likes (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id  UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, prompt_id)
);

CREATE INDEX likes_prompt_id_idx ON public.likes (prompt_id);

CREATE OR REPLACE FUNCTION public.update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prompts SET like_count = like_count + 1 WHERE id = NEW.prompt_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prompts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.prompt_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_like_count();

-- 6. Bookmarks table
CREATE TABLE public.bookmarks (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id  UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, prompt_id)
);

CREATE INDEX bookmarks_user_id_idx ON public.bookmarks (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prompts SET bookmark_count = bookmark_count + 1 WHERE id = NEW.prompt_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prompts SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = OLD.prompt_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_bookmark_change
  AFTER INSERT OR DELETE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_bookmark_count();

-- 7. Follows table
CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CONSTRAINT follows_no_self_follow CHECK (follower_id <> followed_id)
);

CREATE INDEX follows_follower_id_created_at_idx ON public.follows (follower_id, created_at DESC);
CREATE INDEX follows_followed_id_idx ON public.follows (followed_id);

-- 8. Notifications table
CREATE TABLE public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('like', 'follow')),
  prompt_id    UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_recipient_created_at_idx
  ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX notifications_recipient_unread_idx
  ON public.notifications (recipient_id, is_read, created_at DESC);

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

CREATE TRIGGER on_like_created_notify
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.create_like_notification();

CREATE TRIGGER on_follow_created_notify
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.create_follow_notification();

-- 9. updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. Row Level Security
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles: anyone can read"
  ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "profiles: user can update own"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Prompts policies
CREATE POLICY "prompts: anyone can read public"
  ON public.prompts FOR SELECT TO anon, authenticated
  USING (is_public = TRUE OR (SELECT auth.uid()) = user_id);
CREATE POLICY "prompts: authenticated can insert own"
  ON public.prompts FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "prompts: user can update own"
  ON public.prompts FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "prompts: user can delete own"
  ON public.prompts FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Likes policies
CREATE POLICY "likes: anyone can read"
  ON public.likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "likes: authenticated can insert own"
  ON public.likes FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "likes: user can delete own"
  ON public.likes FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Bookmarks policies (private)
CREATE POLICY "bookmarks: user can read own"
  ON public.bookmarks FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "bookmarks: user can insert own"
  ON public.bookmarks FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "bookmarks: user can delete own"
  ON public.bookmarks FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Follows policies
CREATE POLICY "follows: anyone can read"
  ON public.follows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "follows: authenticated can insert own"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = follower_id AND follower_id <> followed_id);
CREATE POLICY "follows: user can delete own"
  ON public.follows FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = follower_id);

-- Notifications policies
CREATE POLICY "notifications: recipient can read own"
  ON public.notifications FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = recipient_id);
CREATE POLICY "notifications: recipient can update own"
  ON public.notifications FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = recipient_id)
  WITH CHECK ((SELECT auth.uid()) = recipient_id);
CREATE POLICY "notifications: recipient can delete own"
  ON public.notifications FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = recipient_id);

-- 11. View count RPC (SECURITY DEFINER bypasses RLS so any visitor can increment)
CREATE OR REPLACE FUNCTION public.increment_view_count(prompt_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.prompts
  SET view_count = view_count + 1
  WHERE id = prompt_id AND is_public = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Storage bucket policies (run after creating 'avatars' bucket in dashboard)
CREATE POLICY "avatars: authenticated can upload own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (SELECT auth.uid())::text = SPLIT_PART(name, '/', 1));
CREATE POLICY "avatars: authenticated can update own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (SELECT auth.uid())::text = SPLIT_PART(name, '/', 1))
  WITH CHECK (bucket_id = 'avatars' AND (SELECT auth.uid())::text = SPLIT_PART(name, '/', 1));
CREATE POLICY "avatars: authenticated can delete own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (SELECT auth.uid())::text = SPLIT_PART(name, '/', 1));
CREATE POLICY "avatars: anyone can read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');
