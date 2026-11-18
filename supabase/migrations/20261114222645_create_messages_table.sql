/*
# Create messages table for hidden terminal chat room

1. New Tables
- `messages`
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, not null, defaults to the authenticated user, references auth.users)
  - `email` (text, not null, sender display identity)
  - `content` (text, not null, the chat message body)
  - `pinned` (boolean, not null, default false, whether the message is pinned)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `messages`.
- Grant SELECT, INSERT, UPDATE, DELETE to `authenticated` only (the chat requires sign-in).
- Policies: every authenticated user can read all messages (shared room); users can
  insert only their own messages; users can update (pin/unpin) or delete only their
  own messages.

3. Notes
- This is a shared chat room, so SELECT is intentionally open to all authenticated
  users. Writes are strictly owner-scoped via `auth.uid()`.
- The `user_id` default of `auth.uid()` lets the frontend insert without threading
  the owner id through every call.
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  content text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;

DROP POLICY IF EXISTS "authenticated_read_messages" ON messages;
CREATE POLICY "authenticated_read_messages" ON messages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_insert_own_messages" ON messages;
CREATE POLICY "authenticated_insert_own_messages" ON messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "authenticated_update_own_messages" ON messages;
CREATE POLICY "authenticated_update_own_messages" ON messages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "authenticated_delete_own_messages" ON messages;
CREATE POLICY "authenticated_delete_own_messages" ON messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
