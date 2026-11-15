/*
# Rename messages columns to sender_id and is_pinned

1. Modified Tables
- `messages`
  - `user_id` renamed to `sender_id` (same data, same default of auth.uid(), same foreign key to auth.users)
  - `pinned` renamed to `is_pinned` (same data, same boolean type)
  - Added index on `created_at` for efficient ordering of the chat stream.

2. Security
- No changes: row level security policies and grants reference the column by
  internal identifier, so they follow the renames automatically. Ownership
  checks now read `auth.uid() = sender_id`.

3. Notes
- Renames are conditional (idempotent): they only run if the old column name
  still exists, so re-applying is safe.
- No data is lost: renames preserve every existing row and value.
*/

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
