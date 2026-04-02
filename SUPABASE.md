Setup Supabase table and policies for storing guest login data

1) Create table SQL (run in Supabase SQL editor or psql):

-- Create extension for UUIDs (Supabase usually has pgcrypto enabled)
-- If `gen_random_uuid()` is not available, enable pgcrypto: `create extension if not exists pgcrypto;`

create table if not exists public.guest_logins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  role text,
  photo text,
  location text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security and allow anonymous insert (for public web client using anon key)
-- Enable Row Level Security (correct syntax)
alter table public.guest_logins enable row level security;

-- Simple permissive insert policy for anonymous clients (adjust as needed):
-- Note: for INSERT policies only the WITH CHECK expression is applied —
-- the USING expression is not used for INSERT, so do not include USING here.
create policy allow_insert_for_anon
  on public.guest_logins
  for insert
  with check (true);

-- Allow reads for everyone (optional)
create policy allow_select
  on public.guest_logins
  for select
  using (true);

-- Optionally block updates / deletes from anon/public clients:
create policy deny_update
  on public.guest_logins
  for update
  using (false);

create policy deny_delete
  on public.guest_logins
  for delete
  using (false);

2) How the frontend connects
- Provide two environment variables to the frontend build (Vite):
  - `VITE_SUPABASE_URL` = your Supabase project URL (e.g. https://xyzcompany.supabase.co)
  - `VITE_SUPABASE_ANON_KEY` = the project's anon public API key

  Example (in `.env` at `frontend/.env`):

  VITE_SUPABASE_URL=https://qjddgukoeevcuqimzrcf.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZGRndWtvZWV2Y3VxaW16cmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTIxMjksImV4cCI6MjA4MTI4ODEyOX0.tYwpoJSVXkCW-_kFO70jQfmwkzccQzhjtaxeGJXvoBs

- Alternatively you can store them in localStorage as `SUPABASE_URL` and `SUPABASE_ANON_KEY` for local testing.

3) What the code does
- The app will attempt to call `insertGuestLogin(...)` during the guest login flow.
- If Supabase client is not configured, the insertion is a no-op and the app falls back to existing server tracking.

4) Security notes
- If you expose the anon key in a public web app, it can be used by anyone to insert into public tables. Use RLS policies to limit columns or add rate limits.
- For stricter control, route guest login writes through a server-side function (supabase Edge Function or your backend) that validates and writes data using a service_role key.

5) Example SELECT query (to view recent guests):

select id, name, email, role, photo, location, metadata, created_at
from public.guest_logins
order by created_at desc
limit 100;
