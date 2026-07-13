-- Supabase Database Schema Setup for AI OS

-- 1. Create a table for uploaded files metadata
create table public.files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_type text not null,
  file_size text,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create a table for memory timeline events
create table public.memory_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  event_type text not null check (event_type in ('ingestion', 'recall', 'synthesis')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Set up Row Level Security (RLS)
alter table public.files enable row level security;
alter table public.memory_events enable row level security;

-- Allow users to see only their own files
create policy "Users can view their own files"
  on public.files for select
  using (auth.uid() = user_id);

create policy "Users can insert their own files"
  on public.files for insert
  with check (auth.uid() = user_id);

-- Allow users to see only their own memory events
create policy "Users can view their own memory events"
  on public.memory_events for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memory events"
  on public.memory_events for insert
  with check (auth.uid() = user_id);

-- 4. Set up Storage Bucket
-- (Run this in the SQL Editor or create it manually via the Supabase Dashboard)
insert into storage.buckets (id, name, public) 
values ('knowledge_base', 'knowledge_base', false);

-- Set up RLS for Storage Bucket
create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check (bucket_id = 'knowledge_base' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read their own folder"
  on storage.objects for select
  using (bucket_id = 'knowledge_base' and auth.uid()::text = (storage.foldername(name))[1]);
