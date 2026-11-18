-- Adds shared edit history and time-limited edit/recall behavior.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS recalled_at timestamptz;

CREATE TABLE IF NOT EXISTS public.message_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  editor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  old_content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.message_edits ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.message_edits TO authenticated;
DROP POLICY IF EXISTS "authenticated_read_message_edits" ON public.message_edits;
CREATE POLICY "authenticated_read_message_edits" ON public.message_edits
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_message_edits_message_id_created_at
  ON public.message_edits(message_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_message_edit_recall_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_at IS DISTINCT FROM OLD.created_at OR NEW.sender_id IS DISTINCT FROM OLD.sender_id THEN
    RAISE EXCEPTION 'Message creation time and sender cannot be changed';
  END IF;

  IF OLD.recalled_at IS NOT NULL AND NEW.recalled_at IS DISTINCT FROM OLD.recalled_at THEN
    RAISE EXCEPTION 'A recalled message cannot be restored';
  END IF;

  IF NEW.content IS DISTINCT FROM OLD.content THEN
    IF OLD.sender_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'You can only edit your own messages';
    END IF;
    IF OLD.created_at < now() - interval '24 hours' THEN
      RAISE EXCEPTION 'Messages can only be edited within 24 hours';
    END IF;
    IF OLD.recalled_at IS NOT NULL THEN
      RAISE EXCEPTION 'A recalled message cannot be edited';
    END IF;
    INSERT INTO public.message_edits(message_id, editor_id, old_content)
    VALUES (OLD.id, auth.uid(), OLD.content);
    NEW.updated_at := now();
  END IF;

  IF NEW.recalled_at IS DISTINCT FROM OLD.recalled_at AND NEW.recalled_at IS NOT NULL THEN
    IF OLD.sender_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'You can only recall your own messages';
    END IF;
    IF OLD.created_at < now() - interval '7 days' THEN
      RAISE EXCEPTION 'Messages can only be recalled within 7 days';
    END IF;
    NEW.recalled_at := now();
    NEW.content := 'Message recalled';
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_enforce_edit_recall_rules ON public.messages;
CREATE TRIGGER messages_enforce_edit_recall_rules
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_message_edit_recall_rules();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'message_edits'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_edits;
  END IF;
END $$;
