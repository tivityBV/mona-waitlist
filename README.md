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

## Bevestigingsmail bij aanmelding (`api/welkom.js`)

Tot 2 september 2026 kreeg niemand die zich aanmeldde iets terug. Dit is punt 14b
uit `ACTIELIJST.md`, nu gebouwd.

Het is een **database-webhook**, geen regel in de verzendcode van de pagina. Reden:
de app schrijft naar dezelfde tabel, met `source` op `app` in plaats van `waitlist`.
Een webhook op de insert vangt allebei de routes, en de verzendlogica van het
formulier hoeft niet aangeraakt te worden.

```
insert op public.waitlist
   -> Supabase Database Webhook
   -> POST https://monaoffline.com/api/welkom
   -> SMTP2GO verstuurt de bevestiging
```

**Drie teksten, automatisch gekozen** uit de kolommen die er al zijn:

| `source` | `android` | Tekst |
|---|---|---|
| `app` | maakt niet uit | je hebt Mona al, je staat op de lijst voor nieuwe versies |
| `waitlist` | `true` | wachtlijst, de besloten test groeit stap voor stap |
| `waitlist` | `false` | iPhone, versie in ontwikkeling, inschrijving bij Apple loopt |

### Instellen, eenmalig

**1. Twee omgevingsvariabelen in Vercel** (Project, Settings, Environment Variables).
Zet ze op alle drie de omgevingen. **Nooit in deze repo**, die is publiek.

- `SMTP2GO_API_KEY` — een API-sleutel uit het SMTP2GO-dashboard onder Sending, API Keys.
  Geef hem alleen het recht om mail te versturen.
- `MONA_WEBHOOK_SECRET` — een zelfbedachte lange reeks tekens. Die voorkomt dat
  iemand die de URL raadt mail kan laten versturen vanaf jouw domein.

Na het toevoegen opnieuw deployen, want een functie ziet alleen de variabelen die
bestonden toen hij werd gebouwd.

**2. De webhook in Supabase** (Database, Webhooks, Create a new hook):

| Veld | Waarde |
|---|---|
| Table | `public.waitlist` |
| Events | alleen **Insert** |
| Type | HTTP Request |
| Method | `POST` |
| URL | `https://monaoffline.com/api/welkom` |
| HTTP Header | naam `x-mona-secret`, waarde dezelfde als `MONA_WEBHOOK_SECRET` |

**3. Controleren.** Meld je aan op de site met een adres dat nog niet op de lijst
staat. In Vercel onder Logs hoort `welkom: bevestiging verstuurd, variant ...` te
staan. Staat er `SMTP2GO weigerde`, dan klopt de sleutel of de domeinverificatie
niet. Staat er niets, dan bereikt de webhook de functie niet: kijk in Supabase
onder Database, Webhooks bij de afleverpogingen.

### Wat de functie bewust wel en niet doet

Bij een mislukking geeft hij **500** terug in plaats van 200, zodat Supabase het
opnieuw probeert in plaats van de aanmelding stil te laten verdwijnen.

Er staat **nooit een e-mailadres in de logregels**, conform `USER-PREFERENCES.md`.
De logregel noemt alleen welke van de drie varianten is verstuurd.

De app vult `Mona tester` in het naamveld, want daar wordt geen naam gevraagd. Die
waarde wordt herkend en niet als aanhef gebruikt.

Afmelden gaat per antwoord op de mail. Er is bewust geen afmeldlink met een eigen
database erachter: dat zou een tweede plek met adressen opleveren.

## Bedankmail na het feedbackformulier (`api/bedankt.js`)

Zelfde opzet als de wachtlijstmail, tweede webhook, op tabel `public.feedback`.
Instellen in Supabase, Database, Webhooks:

| Veld | Waarde |
|---|---|
| Table | `public.feedback` |
| Events | alleen **Insert** |
| URL | `https://monaoffline.com/api/bedankt` |
| HTTP Header | naam `x-mona-secret`, dezelfde waarde als bij `welkom` |

Dezelfde twee omgevingsvariabelen, er hoeft niets bij.

**Twee dingen die makkelijk misgaan als je hieraan sleutelt.**

Het formulier schrijft tot **drie rijen per invuller** weg, allemaal met dezelfde
`sid`: twee keer `stage='deel'` onderweg en aan het eind `stage='compleet'`. Een
webhook die op elke insert mailt stuurt dus drie mails naar dezelfde persoon. De
functie reageert daarom alleen op `compleet`.

Het adres is **optioneel en mag leeg blijven**. De vraag heette tot 2 sep 2026
"je naam of je Instagram" en vraagt sindsdien om een mailadres, want anders valt
er niets terug te sturen. Wie de vraag overslaat blijft anoniem en krijgt niets.
Staat er iets anders dan een adres in, bijvoorbeeld een oude Instagram-handle uit
een eerder ingevuld formulier, dan gaat er ook niets uit.

De pagina zelf controleert het adres licht voordat je verder kunt: een handle of
een adres zonder punt achter de apenstaart wordt geweigerd met een regel eronder.
Overslaan blijft altijd mogelijk.
