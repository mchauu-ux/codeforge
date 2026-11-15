-- Shared settings for the single chat room.
-- Run this migration in your Supabase project.

create table if not exists public.chat_settings (
  id text primary key check (id = 'main'),
  title text not null default 'Secret Sanctuary',
  avatar_url text,
  updated_at timestamptz not null default now()
);

insert into public.chat_settings (id, title)
values ('main', 'Secret Sanctuary')
on conflict (id) do nothing;

alter table public.chat_settings enable row level security;

drop policy if exists "Authenticated users can read chat settings"
  on public.chat_settings;
create policy "Authenticated users can read chat settings"
  on public.chat_settings
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert chat settings"
  on public.chat_settings;
create policy "Authenticated users can insert chat settings"
  on public.chat_settings
  for insert
  to authenticated
  with check (id = 'main');

drop policy if exists "Authenticated users can update chat settings"
  on public.chat_settings;
create policy "Authenticated users can update chat settings"
  on public.chat_settings
  for update
  to authenticated
  using (id = 'main')
  with check (id = 'main');

-- Public bucket: uploaded avatar images can be viewed by anyone with the URL.
insert into storage.buckets (id, name, public)
values ('chat-avatars', 'chat-avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Authenticated users can upload chat avatars"
  on storage.objects;
create policy "Authenticated users can upload chat avatars"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'chat-avatars');

-- No DELETE policy is needed because each upload uses a unique filename.
