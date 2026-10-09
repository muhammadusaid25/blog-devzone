-- Run this in Supabase > SQL Editor.
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  cover_url text,
  category text default 'General',
  content text not null,            -- HTML written by you (admin only)
  featured boolean default false,
  published boolean default true,
  created_at timestamptz default now()
);
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  name text not null check (length(name) between 1 and 60),
  body text not null check (length(body) between 1 and 1000),
  created_at timestamptz default now()
);
alter table posts enable row level security;
alter table comments enable row level security;

-- Visitors: read published posts, read/write comments
create policy "read published" on posts for select using (published or auth.role() = 'authenticated');
create policy "read comments" on comments for select using (true);
create policy "add comments" on comments for insert with check (true);
-- Logged-in admin: full control
create policy "admin posts" on posts for all to authenticated using (true) with check (true);
create policy "admin comments" on comments for delete to authenticated using (true);
-- IMPORTANT: Auth > Providers > Email > turn OFF "Allow new users to sign up",
-- then create ONE user manually (Auth > Users). That user is your admin.

-- Newsletter subscribers (used by the hero "Subscribe" box)
create table subscribers (id uuid primary key default gen_random_uuid(), email text unique not null, created_at timestamptz default now());
alter table subscribers enable row level security;
create policy "anyone subscribes" on subscribers for insert with check (true);
create policy "admin reads subscribers" on subscribers for select to authenticated using (true);
