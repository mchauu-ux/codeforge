DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE messages RENAME COLUMN user_id TO sender_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'pinned'
  ) THEN
    ALTER TABLE messages RENAME COLUMN pinned TO is_pinned;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);
