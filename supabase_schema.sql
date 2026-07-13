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

-- 5. Add status, messaging, and caching tables/columns for AI integration

-- Add status tracking and summaries to files table
alter table public.files 
  add column if not exists status text not null check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  add column if not exists status_message text,
  add column if not exists summary jsonb,
  add column if not exists revision_notes jsonb;

-- Create conversations table for session tracking
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table for session conversation history
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb, -- array of { fileName, chunkIndex, pageOrTimestamp, contentSnippet }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create embedding cache table for cost savings
create table if not exists public.embedding_cache (
  hash text primary key,
  embedding double precision[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.embedding_cache enable row level security;

-- Allow users to manage their own conversations
create policy "Users can view their own conversations"
  on public.conversations for select using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on public.conversations for insert with check (auth.uid() = user_id);

-- Allow users to view/insert messages belonging to their conversations
create policy "Users can view messages of their conversations"
  on public.messages for select
  using (exists (
    select 1 from public.conversations 
    where conversations.id = messages.conversation_id and conversations.user_id = auth.uid()
  ));

create policy "Users can insert messages to their conversations"
  on public.messages for insert
  with check (exists (
    select 1 from public.conversations 
    where conversations.id = messages.conversation_id and conversations.user_id = auth.uid()
  ));

-- Allow service role to manage the embedding cache table (or open read-only access for speed)
create policy "Anyone can read embedding cache"
  on public.embedding_cache for select using (true);

create policy "Service role can modify embedding cache"
  on public.embedding_cache for all using (true) with check (true);

