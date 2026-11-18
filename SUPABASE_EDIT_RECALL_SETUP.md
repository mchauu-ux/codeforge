# CodeForge message edit and recall setup

After updating the two source files, run the following migration once in the Supabase SQL Editor:

`supabase/migrations/20261118230100_add_message_edit_history_and_recall.sql`

This migration:
- Adds a shared `message_edits` table that stores each previous message version.
- Adds `updated_at` and `recalled_at` to `messages`.
- Enforces the 24-hour edit window and 7-day recall window in a database trigger.
- Replaces recalled message content with `Message recalled` for everyone.
- Enables realtime updates for edit-history entries.

Do not rerun the SQL manually if Supabase has already recorded this migration as applied. The migration is designed to be safe to apply once alongside the existing message-reactions migration.
