-- Restrict the private CodeForge chat to accounts explicitly granted access
-- by a trusted administrator through Supabase Auth app_metadata.
-- Set app_metadata.codeforge_chat_access = true for each approved user.

-- The frontend no longer supplies an email address when sending messages.
-- Keep sender identity tied to auth.uid() instead of requiring a client email.
ALTER TABLE public.messages ALTER COLUMN email DROP NOT NULL;

-- Messages: only approved chat members may read or mutate the shared room.
DROP POLICY IF EXISTS "authenticated_read_messages" ON public.messages;
DROP POLICY IF EXISTS "authenticated_insert_own_messages" ON public.messages;
DROP POLICY IF EXISTS "authenticated_update_own_messages" ON public.messages;
DROP POLICY IF EXISTS "authenticated_delete_own_messages" ON public.messages;

CREATE POLICY "chat_members_read_messages" ON public.messages
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true');
CREATE POLICY "chat_members_insert_own_messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true'
    AND auth.uid() = sender_id
  );
CREATE POLICY "chat_members_update_own_messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true'
    AND auth.uid() = sender_id
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true'
    AND auth.uid() = sender_id
  );
CREATE POLICY "chat_members_delete_own_messages" ON public.messages
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true'
    AND auth.uid() = sender_id
  );

-- Reactions: members can see the shared reactions; users can manage their own.
DROP POLICY IF EXISTS "authenticated_read_message_reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "authenticated_insert_own_message_reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "authenticated_delete_own_message_reactions" ON public.message_reactions;
CREATE POLICY "chat_members_read_message_reactions" ON public.message_reactions
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true');
CREATE POLICY "chat_members_insert_own_message_reactions" ON public.message_reactions
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true'
    AND auth.uid() = user_id
  );
CREATE POLICY "chat_members_delete_own_message_reactions" ON public.message_reactions
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true'
    AND auth.uid() = user_id
  );

-- Edit history is visible only to members of the private room.
DROP POLICY IF EXISTS "authenticated_read_message_edits" ON public.message_edits;
DROP POLICY IF EXISTS "chat_members_read_message_edits" ON public.message_edits;
CREATE POLICY "chat_members_read_message_edits" ON public.message_edits
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true');

-- Shared room settings are also private and editable only by approved members.
DROP POLICY IF EXISTS "Authenticated users can read chat settings" ON public.chat_settings;
DROP POLICY IF EXISTS "Authenticated users can insert chat settings" ON public.chat_settings;
DROP POLICY IF EXISTS "Authenticated users can update chat settings" ON public.chat_settings;
CREATE POLICY "chat_members_read_chat_settings" ON public.chat_settings
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true');
CREATE POLICY "chat_members_insert_chat_settings" ON public.chat_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true'
    AND id = 'main'
  );
CREATE POLICY "chat_members_update_chat_settings" ON public.chat_settings
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true' AND id = 'main')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true' AND id = 'main');

-- Uploaded avatars may only be added by approved members.
DROP POLICY IF EXISTS "Authenticated users can upload chat avatars" ON storage.objects;
CREATE POLICY "chat_members_upload_chat_avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-avatars'
    AND (auth.jwt() -> 'app_metadata' ->> 'codeforge_chat_access') = 'true'
  );
