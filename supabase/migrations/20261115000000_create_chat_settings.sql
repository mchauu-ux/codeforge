-- Shared chat settings: one row for the shared chat room
CREATE TABLE IF NOT EXISTS public.chat_settings (
  id text PRIMARY KEY CHECK (id = 'main'),
  title text NOT NULL DEFAULT 'Secret Sanctuary',
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.chat_settings TO authenticated;

DROP POLICY IF EXISTS "authenticated_read_chat_settings"
  ON public.chat_settings;
CREATE POLICY "authenticated_read_chat_settings"
  ON public.chat_settings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated_insert_chat_settings"
  ON public.chat_settings;
CREATE POLICY "authenticated_insert_chat_settings"
  ON public.chat_settings
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_chat_settings"
  ON public.chat_settings;
CREATE POLICY "authenticated_update_chat_settings"
  ON public.chat_settings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create a public bucket for shared chat avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-avatars', 'chat-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "chat_avatars_public_read" ON storage.objects;
CREATE POLICY "chat_avatars_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat-avatars');

DROP POLICY IF EXISTS "chat_avatars_authenticated_upload" ON storage.objects;
CREATE POLICY "chat_avatars_authenticated_upload"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-avatars');

DROP POLICY IF EXISTS "chat_avatars_authenticated_update" ON storage.objects;
CREATE POLICY "chat_avatars_authenticated_update"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'chat-avatars')
  WITH CHECK (bucket_id = 'chat-avatars');

DROP POLICY IF EXISTS "chat_avatars_authenticated_delete" ON storage.objects;
CREATE POLICY "chat_avatars_authenticated_delete"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'chat-avatars');

-- Add chat settings to Supabase Realtime if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime
      ADD TABLE public.chat_settings;
  END IF;
END $$;