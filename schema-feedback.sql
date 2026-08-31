-- Mona, feedbacktabel voor Supabase
-- Draai dit één keer in Supabase, SQL Editor. Zelfde opzet als schema.sql:
-- anonieme bezoekers mogen ALLEEN toevoegen, niet lezen, wijzigen of verwijderen.
-- Jij leest de antwoorden in het dashboard (Table editor) of via je service_role-key.

create extension if not exists "pgcrypto";

create table if not exists public.feedback (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- sid is een willekeurig nummer dat de pagina zelf verzint, puur om twee rijen van
  -- dezelfde invuller aan elkaar te kunnen knopen. Het zegt niets over wie iemand is
  -- en het overleeft het sluiten van de pagina niet.
  sid          text,

  -- 'kort' (een paar dagen na installatie) of 'lang' (rond dag 21).
  ronde        text,

  -- 'deel' of 'compleet'. Zie de toelichting onderaan: de eerste twee antwoorden
  -- worden apart opgeslagen, zodat iemand die halverwege stopt niet helemaal
  -- verdwijnt uit de cijfers.
  stage        text,

  nog_actief       text,   -- gebruikt hij Mona nog
  stop_moment      text,   -- zo nee, wat was het moment
  verschil         text,   -- merkt hij verschil in telefoongebruik
  moment_inbellen  text,   -- wat er gebeurt op het moment dat hij wil inbellen
  inbeltijd        text,   -- hoe de lengte van de handshake voelt
  irritatie        text,   -- wat er misging of irriteerde
  een_zin          text,   -- hoe hij Mona aan iemand zou uitleggen
  aangeraden       text,   -- heeft hij Mona doorverteld

  -- Optioneel. Alleen ingevuld als iemand zelf wil dat je kunt terugvragen.
  contact      text
);

alter table public.feedback enable row level security;

drop policy if exists "anon can insert feedback" on public.feedback;
create policy "anon can insert feedback"
  on public.feedback
  for insert
  to anon
  with check (true);

-- Handig bij het uitlezen: de laatste antwoorden bovenaan.
create index if not exists feedback_created_idx on public.feedback (created_at desc);

-- WAAROM ER TWEE RIJEN PER INVULLER KUNNEN ZIJN
--
-- De belangrijkste vraag van het hele formulier is waarom iemand gestopt is, en juist
-- die mensen maken een formulier het minst vaak af. Daarom slaat de pagina de eerste
-- twee antwoorden meteen op als stage='deel', en aan het eind nog een keer alles als
-- stage='compleet'. Beide rijen dragen dezelfde sid.
--
-- Er kunnen twee 'deel'-rijen per sid zijn: een zodra bekend is of iemand Mona nog
-- gebruikt, en een zodra hij heeft opgeschreven waarom hij gestopt is. Neem bij het
-- uitlezen de laatste 'deel'-rij per sid.
--
-- Bij het uitlezen: neem de rijen met stage='compleet', en kijk daarnaast welke sid's
-- alleen 'deel'-rijen hebben. Dat zijn de afhakers, en daar staat hun antwoord op de
-- afhaakvraag gewoon in.
--
--   select * from public.feedback where stage = 'compleet' order by created_at desc;
--
--   select distinct on (sid) * from public.feedback f
--     where stage = 'deel'
--       and not exists (select 1 from public.feedback c
--                       where c.sid = f.sid and c.stage = 'compleet')
--     order by sid, created_at desc;
