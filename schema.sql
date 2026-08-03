-- Mona — wachtlijst-tabel voor Supabase
-- Draai dit één keer in Supabase → SQL Editor.
-- Beveiliging: anonieme bezoekers mogen ALLEEN toevoegen (insert), niet lezen/wijzigen/verwijderen.
-- Jij leest de lijst uit in het Supabase-dashboard (Table editor) of via je service_role-key.

create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  email       text not null,
  android     boolean,
  scroll_freq text,
  source      text
);

-- Eén aanmelding per e-mailadres (hoofdletterongevoelig).
create unique index if not exists waitlist_email_key on public.waitlist (lower(email));

-- Row Level Security aan.
alter table public.waitlist enable row level security;

-- Alleen INSERT toestaan voor anon (de publieke website). Geen select/update/delete-policy =
-- anon kan de lijst dus niet uitlezen. (Verwijder een eventuele oude policy eerst.)
drop policy if exists "anon can insert waitlist" on public.waitlist;
create policy "anon can insert waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);
