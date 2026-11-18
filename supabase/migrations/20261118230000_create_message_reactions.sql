/*
  Shared emoji reactions for the shared chat room.
  Each authenticated user may add one instance of each emoji to a message.
*/
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 16),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT message_reactions_unique_user_emoji UNIQUE (message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.message_reactions TO authenticated;

DROP POLICY IF EXISTS "authenticated_read_message_reactions" ON public.message_reactions;
CREATE POLICY "authenticated_read_message_reactions" ON public.message_reactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_own_message_reactions" ON public.message_reactions;
CREATE POLICY "authenticated_insert_own_message_reactions" ON public.message_reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "authenticated_delete_own_message_reactions" ON public.message_reactions;
CREATE POLICY "authenticated_delete_own_message_reactions" ON public.message_reactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id
  ON public.message_reactions(message_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'message_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
  END IF;
END $$;
