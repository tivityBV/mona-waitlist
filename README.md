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

## Feedbackformulier voor testers (`feedback.html`)

Aparte pagina, in dezelfde huisstijl, voor de testers die via Instagram binnenkomen
en die je niet persoonlijk kent. Eén vraag per scherm, tikken om te antwoorden,
ongeveer anderhalve minuut.

**Twee rondes, via de link:**

| Link | Wanneer | Vragen |
|---|---|---|
| `monaoffline.com/feedback?r=kort` | een paar dagen na installatie | 3 |
| `monaoffline.com/feedback` | rond dag 21 | 8 |

De links werken zonder `.html` dankzij `vercel.json` met `cleanUrls`. Zonder dat
bestand geeft `/feedback` een 404, en dat was op 31 aug ook zo tot dit erbij kwam.
De variant mét `.html` blijft werken: Vercel stuurt die door naar de korte vorm.

**Eenmalig instellen:** draai `schema-feedback.sql` in Supabase, SQL Editor. De
Supabase-URL en de publieke sleutel staan al in de pagina, dezelfde als in
`index.html`.

**Waarom die korte ronde apart bestaat.** De belangrijkste vraag is waarom iemand
gestopt is, en juist die mensen reageren een maand later niet meer. Vraag het dus
terwijl het vers is.

**Waarom er meer rijen dan invullers kunnen zijn.** De pagina slaat tussentijds op:
één keer zodra bekend is of iemand Mona nog gebruikt, één keer zodra hij heeft
opgeschreven waarom hij gestopt is, en één keer aan het eind met alles erin. Zo
verdwijnt iemand die halverwege afhaakt niet uit de cijfers. Alle rijen van dezelfde
invuller dragen dezelfde `sid`. De twee uitleesqueries staan onderaan
`schema-feedback.sql`.

**Geen naam verplicht**, en er wordt niets stils meegestuurd: geen toestelgegevens,
geen browserinformatie. Dat past niet bij een app die belooft niets van je bij te
houden.

## Data uitlezen
Supabase → **Table editor → waitlist**, of exporteer naar CSV. (Anon kan niet lezen; jij wel via het dashboard.)
