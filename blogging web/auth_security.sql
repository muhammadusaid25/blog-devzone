-- Run in Supabase > SQL Editor AFTER schema.sql. Only the admin email may manage content.
-- 1) Put your real admin email below (same as ADMIN_EMAIL in config.js).
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email','')) = lower('PASTE_YOUR_ADMIN_EMAIL_HERE')
$$;

drop policy if exists "read published" on posts;
drop policy if exists "admin posts" on posts;
drop policy if exists "admin comments" on comments;
drop policy if exists "admin reads subscribers" on subscribers;

create policy "read published" on posts for select using (published or public.is_admin());
create policy "admin posts" on posts for all using (public.is_admin()) with check (public.is_admin());
create policy "admin comments" on comments for delete using (public.is_admin());
create policy "admin reads subscribers" on subscribers for select using (public.is_admin());
-- 2) Auth > Providers > Email: you can now leave sign-ups ON. Keep "Confirm email" ON too.
