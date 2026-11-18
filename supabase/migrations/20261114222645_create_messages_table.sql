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
