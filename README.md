# Mona: wachtlijst-landingspagina

Statische site, negen pagina's zonder bouwstap, met een wachtlijst-formulier dat naar Supabase schrijft. Nederlands in de hoofdmap, Engels in `/en/`.

## Bestanden
- `index.html`: de Nederlandse homepage (Mona-huisstijl, modemgeluid als hero, formulier).
- `over.html`, `contact.html`, `privacy.html`: de Nederlandse onderpagina's.
- `feedback.html`: het formulier voor testers, blijft Nederlands.
- `en/index.html`, `en/about.html`, `en/contact.html`, `en/privacy.html`: de Engelse tegenhangers.
- `modem.mp3`: het inbelgeluid (hero-knop).
- `CHANGELOG.md`: wat er aan de site veranderde en waarom.
- `schema.sql`: draai dit één keer in Supabase (waitlist-tabel + insert-only RLS).
- `api/wakker.js`: één verzoek per dag aan Supabase, zodat het project niet pauzeert.
- `api/wachtlijst.js`: het vangnet, als een aanmelding Supabase niet bereikt.

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

## Twee talen (NL en EN)

Het Nederlands is de bron en staat in de hoofdmap. Het Engels staat in `/en/` als
echte map, dus `en/privacy.html` is met `cleanUrls` gewoon `/en/privacy`. De
Nederlandse URL's zijn daarbij niet veranderd.

| Nederlands | Engels |
|---|---|
| `/` | `/en/` |
| `/over` | `/en/about` |
| `/contact` | `/en/contact` |
| `/privacy` | `/en/privacy` |
| `/feedback` | geen, blijft Nederlands |

Elke pagina draagt een canonical naar zichzelf en drie hreflang-regels: `nl`, `en`
en `x-default`. Die laatste wijst naar het Nederlands, want de werving is
Nederlands eerst.

**De taalwissel** staat als "NL | EN" in de kop en linkt naar de tegenhanger van
die pagina, nooit naar de homepage van de andere taal. De taal waarop je staat is
dik en onderstreept, via `aria-current`.

**Wat het script onderaan de `<head>` doet.** Twee dingen, zonder cookies. Het
onthoudt de keuze in localStorage onder `mona-lang` zodra iemand op NL of EN
klikt, en op de homepage volgt het eenmalig de browsertaal zolang er nog geen
keuze is opgeslagen. Diepe links leiden nooit automatisch om, ook niet met een
opgeslagen keuze. Dat is bewust: wie op `/privacy` of `/en/about` binnenkomt heeft
die URL van iemand gekregen, en `/privacy` moet voor de beoordelaar van Apple
altijd Nederlands blijven. Elke toegang tot localStorage staat in een `try`, dus
een browser met dichtgezette opslag maakt de pagina niet stuk.

**Een pagina erbij.** Zet het Nederlands in de hoofdmap en het Engels in `/en/`,
geef allebei een canonical, drie hreflang-regels, de taalwissel in de kop en
hetzelfde script onderaan de `<head>`. Let op: een pagina in `/en/` staat een map
diep, dus verwijzingen naar `payoff.png`, `modem.mp3` en de achtergrondfoto's
hebben daar een schuine streep ervoor nodig. Zonder die streep zoekt de browser
ze in `/en/` en krijgt hij een 404.

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

## Als het formulier "Er ging iets mis" geeft

Dat is bijna altijd Supabase, niet de pagina. Op 30 oktober 2026 stond het project
gepauzeerd: een gratis Supabase-project pauzeert na een week zonder activiteit, en dan
wordt de hostnaam niet meer bediend. De `fetch` in de pagina faalt dan al voordat er
een statuscode is, en de bezoeker leest de algemene foutmelding.

Zo controleer je het in één regel, zonder dashboard:

```
nslookup lftibffclhufvwxrpumo.supabase.co 8.8.8.8
```

"Non-existent domain" betekent gepauzeerd. Aanzetten kan alleen met de hand, in het
Supabase-dashboard bij de projectlijst (Restore of Resume). Reken daarna op een paar
minuten voor het DNS.

Twee dingen houden dit tegen, allebei sinds 30 oktober 2026:

1. **`api/wakker.js`**, elke dag om 06:00 via de cron in `vercel.json`. Eén vraag aan
   de tabel, met de publieke sleutel die ook in de pagina staat. Dat is genoeg
   activiteit om het pauzeren te voorkomen. Het maakt een gepauzeerd project niet
   wakker, het houdt een draaiend project wakker. Staat `CRON_SECRET` in Vercel, dan
   controleert de functie die kop.
2. **`api/wachtlijst.js`**, het vangnet. Lukt de insert niet, dan sturen de twee
   homepages de aanmelding hierheen en gaat hij per mail naar `hello@monaoffline.com`.
   De bezoeker ziet gewoon "Je staat erop", want wij hebben hem dan. Zet zo iemand met
   de hand in de tabel zodra Supabase weer draait: de database-webhook stuurt dan de
   bevestiging die hij nog niet had. Het vangnet gebruikt `SMTP2GO_API_KEY`, dezelfde
   variabele als de bevestigingsmail, en stuurt nooit iets naar de bezoeker zelf.

Mislukt het vangnet ook, dan ziet de bezoeker alsnog de foutmelding en staat de knop
weer aan. Dat is het enige geval waarin een aanmelding verdwijnt.

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

**Drie teksten, automatisch gekozen** op de kolom `source`. iPhone en Android
zitten allebei in de bètatest, dus `android` maakt voor de tekst niet meer uit.

| `source` | Tekst |
|---|---|
| `app` | je hebt Mona al, je staat op de lijst voor nieuwe versies |
| `waitlist` | wachtlijst, de besloten test groeit stap voor stap |
| `waitlist-en` | dezelfde wachtlijsttekst, in het Engels |
| `beta` | wachtlijsttekst, aangemeld via monaoffline.com/beta |
| `beta-en` | dezelfde, in het Engels |

De Engelse pagina schrijft `source` als `waitlist-en`. Zonder dat verschil krijgt
iemand die zich op `/en/` aanmeldt een Nederlandse bevestiging terug. `lib/mail.js`
kiest de taal op de soort: eindigt die op `-en`, dan worden de aanhef, de
afsluiting, de voet en de bedrijfsregel Engels. De aanmelding vanuit de app blijft
Nederlands, want die testers komen uit de Nederlandse werving.

### Instellen, eenmalig

**1. Twee omgevingsvariabelen in Vercel** (Project, Settings, Environment Variables).
Zet ze op alle drie de omgevingen. **Nooit in deze repo**, die is publiek.

- `SMTP2GO_API_KEY`: een API-sleutel uit het SMTP2GO-dashboard onder Sending, API Keys.
  Geef hem alleen het recht om mail te versturen.
- `MONA_WEBHOOK_SECRET`: een zelfbedachte lange reeks tekens. Die voorkomt dat
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
De logregel noemt alleen welke variant is verstuurd.

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
