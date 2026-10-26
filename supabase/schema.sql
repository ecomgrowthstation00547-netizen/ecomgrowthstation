-- Ecom Growth Station: Supabase schema
-- Run this whole file once in: Supabase Dashboard > SQL Editor.

-- 1) Enquiries submitted from the website forms -------------------------------
create table if not exists public.submissions (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  form_type  text not null check (form_type in ('contact','hire','academy','join')),
  name       text not null check (char_length(name)  between 1 and 200),
  email      text not null check (char_length(email) between 3 and 320),
  whatsapp   text check (char_length(whatsapp) <= 60),
  service    text check (char_length(service)  <= 200),
  message    text check (char_length(message)  <= 5000),
  details    jsonb not null default '{}'::jsonb check (pg_column_size(details) < 20000),
  status     text not null default 'new' check (status in ('new','contacted','closed')),
  notes      text check (char_length(notes) <= 5000)
);
create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

-- 2) Who is allowed to see them (admins) --------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email   text
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3) Row Level Security --------------------------------------------------------
alter table public.submissions enable row level security;
alter table public.admins      enable row level security;

revoke all on public.submissions from anon, authenticated;
revoke all on public.admins      from anon, authenticated;
grant insert                 on public.submissions to anon, authenticated;
grant select, update, delete on public.submissions to authenticated;
grant select                 on public.admins      to authenticated;

drop policy if exists "visitors can submit enquiries" on public.submissions;
create policy "visitors can submit enquiries" on public.submissions
  for insert to anon, authenticated
  with check (status = 'new' and notes is null);

drop policy if exists "admins read enquiries"   on public.submissions;
drop policy if exists "admins update enquiries" on public.submissions;
drop policy if exists "admins delete enquiries" on public.submissions;
create policy "admins read enquiries"   on public.submissions for select to authenticated using ((select public.is_admin()));
create policy "admins update enquiries" on public.submissions for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete enquiries" on public.submissions for delete to authenticated using ((select public.is_admin()));

drop policy if exists "users read own admin row" on public.admins;
create policy "users read own admin row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- 4) After creating your admin user (Authentication > Users > Add user),
--    make them an admin by running this with THEIR email:
--
--    insert into public.admins (user_id, email)
--    select id, email from auth.users where email = 'ADMIN_EMAIL_HERE';
