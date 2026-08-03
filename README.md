# Mona — wachtlijst-landingspagina

Statische pagina (één `index.html` + `modem.mp3`) met een wachtlijst-formulier dat naar Supabase schrijft.

## Bestanden
- `index.html` — de pagina (Mona-huisstijl, modemgeluid als hero, formulier).
- `modem.mp3` — het inbelgeluid (hero-knop).
- `schema.sql` — draai dit één keer in Supabase (waitlist-tabel + insert-only RLS).

## Supabase koppelen (2 plekken invullen)
1. Draai `schema.sql` in Supabase → **SQL Editor**.
2. In `index.html`, bovenaan het `<script>`, vervang:
   - `SUPABASE_URL_HIER` → je **Project URL** (Supabase → Project Settings → API)
   - `SUPABASE_ANON_KEY_HIER` → je **anon public** key (zelfde scherm)
   - De **anon-key mag** client-side. Plak **nooit** je `service_role`-key hier.
3. Zonder ingevulde keys draait de pagina in **preview-modus**: het formulier toont wel de bevestiging, maar slaat niets op (handig om eerst te testen).

## Deployen (Vercel + eigen domein)
1. Zet deze bestanden in de git-repo (`tivityBV/placeholder` kan hergebruikt).
2. Vercel → **Add New → Project** → importeer de repo → Deploy (geen build-config nodig, het is statisch).
3. Vercel → Project → **Settings → Domains** → voeg `monaoffline.com` (+ `makeofflinenormalagain.com` als redirect) toe.
4. Vercel toont de **nameservers** (ns1/ns2.vercel-dns.com) → zet die bij **TierraNet** als de nameservers van het domein.
5. Wachten op DNS-propagatie → live.

## Data uitlezen
Supabase → **Table editor → waitlist**, of exporteer naar CSV. (Anon kan niet lezen; jij wel via het dashboard.)
