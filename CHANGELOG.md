# Changelog

Wat er aan monaoffline.com veranderde, met de reden erbij. De commits staan in
`git log`, dit bestand legt uit waarom iets zo is en niet anders.

---


## 30 oktober 2026

**Vier punten uit een terugkoppeling op de site verwerkt.**

*Over Mona noemde alleen Android,* terwijl het formulier, de privacypagina en de
bètatest allang ook iPhone noemen. De openingszin zegt nu "een app voor Android en
iPhone", en bij "Wat bereikbaar blijft" staat waarin de twee verschillen: op Android
onderbreekt een lokale VPN-verbinding het verkeer en kies je welke apps bereikbaar
blijven, op iPhone zet Mona met Schermtijd de apps die jij kiest achter de kiestoon,
dus daar staat het omgekeerd en valt de systeemverbinding nooit weg.

*De werking stond nergens concreet op de homepage.* In de inbelband staan nu drie
regels: 16 sec inbellen, 3, 7 of 30 min online, en je eigen lijst blijft bereikbaar.
Bewust daar en niet in de drie kolommen erboven, want die lijnen op elkaars hoogte uit
en worden scheef van een extra regel. Onder 560 pixels staat de waarde boven zijn eigen
omschrijving, anders valt elke omschrijving over twee regels en wordt het een blok.

*Privacy, drie aanscherpingen.* De gebruiksstatistiek heet nu pseudoniem en niet
anoniem, met de reden erbij: de installatiecode blijft gelijk, dus de berichten van
één installatie vormen een reeks, en dat is precies wat anoniem niet is. "De app leest
de datapakketjes" naast "er wordt niets uitgelezen" las als een tegenspraak; er staat
nu dat de app de pakketjes van de tunnel afhaalt en weggooit, dat dat afhalen moet
omdat de tunnel anders volloopt, en dat geen regel code kijkt wat erin zit. En de
bewaartermijnen bij SMTP2GO en Vercel staan er hard in (35 dagen voor de gegevens over
een verstuurde mail, de inhoud bewaart SMTP2GO niet; een uur of een dag voor de
logregels van Vercel) in plaats van een belofte om het later aan te vullen. Nog te
bevestigen: welk Vercel-plan voor dit project geldt, dan kan die zin korter.

*Engels natuurlijker.* "Mona makes that reflex a little stiffer" is "Mona puts a
little friction in the way of that reflex" geworden, en op de overpagina zijn "takes
another road", "screeching and hiss", "nothing is forbidden to you" en "whatever data
does go around" herschreven. De Nederlandse copy is niet aangeraakt, en de introtekst
in de hero in beide talen ook niet: die is van de oprichter zelf.


**Het wachtlijstformulier gaf "Er ging iets mis". Oorzaak: het Supabase-project staat
gepauzeerd.** Een aanmelding vanaf een pc mislukte, en de melding bleek niet aan de
pagina te liggen. De hostnaam van het project, `lftibffclhufvwxrpumo.supabase.co`,
bestaat niet meer in het DNS: zowel de resolver van Google als die van deze machine
antwoordt "non-existent domain", terwijl supabase.com en monaoffline.com gewoon
antwoorden. Supabase doet dat bij een gepauzeerd project: de hostnaam wordt niet meer
bediend, dus elke `fetch` vanuit de browser faalt al voordat er een statuscode is. In
`index.html` valt dat in dezelfde `catch` als een echte fout, en de bezoeker leest
"Er ging iets mis. Probeer het zo nog eens."

Wat dit betekent: sinds het pauzeren is geen enkele aanmelding opgeslagen, in beide
talen, en de bevestigingsmail (die aan een database-webhook hangt) is dus ook niet
verstuurd. Die aanmeldingen zijn niet te herstellen, ze hebben de database nooit
bereikt. Een gratis Supabase-project pauzeert na een week zonder activiteit, en de
site doet alleen iets bij een aanmelding, dus het pauzeert opnieuw zodra het een week
stil blijft.

Niet de oorzaak, wel de eerste verdenking: `source = 'beta'` uit commit 38d0462. Dat
is uitgesloten, want het DNS faalt voor elke aanmelding, met of zonder `?source=beta`.
Het schema zet `source` ook als vrije tekst, zonder check-constraint.

**Twee vangnetten, zodat dit niet terugkomt.** Het eerste is `api/wakker.js`, elke dag
om 06:00 via een cron in `vercel.json`: één vraag aan de tabel met de publieke sleutel
die ook in de pagina staat. Er komt geen rij terug, want anon mag niet lezen, maar het
verzoek bereikt Postgres en dat is de activiteit die het pauzeren tegenhoudt. Het maakt
een gepauzeerd project niet wakker, dat blijft handwerk in het dashboard.

Het tweede is `api/wachtlijst.js`, het vangnet voor een aanmelding die Supabase niet
bereikt: hij gaat dan per mail naar hello@monaoffline.com, en de bezoeker ziet gewoon
"Je staat erop", want wij hebben hem dan ook. De bevestigingsmail blijft aan de
database-webhook hangen, dus die krijgt iemand zodra de aanmelding met de hand in de
tabel staat. Bewust niet ook hier versturen: twee plekken die dezelfde mail sturen
leveren vroeg of laat twee mails op. Mislukt het vangnet ook, dan ziet de bezoeker
alsnog de foutmelding, en dat is het enige geval waarin een aanmelding verdwijnt.

Nagelopen met een nagebootste `fetch`: een gepauzeerd project geeft 503 op /api/wakker
en elk ander antwoord 200 (ook een 401, want dat betekent dat het project draait), het
vangnet weigert een niet-adres met 400 en een mislukte verzending met 502, en de twee
homepages tonen "Je staat erop" zodra het vangnet lukt en de foutmelding zodra ook dat
mislukt. De aanmelding die dan doorgaat draagt de juiste bron, `waitlist` of
`waitlist-en`.

De privacypagina noemt dit in beide talen bij SMTP2GO: is Supabase niet bereikbaar, dan
draagt SMTP2GO de aanmelding naar ons eigen adres. Zonder die regel zou er een route
bestaan die er niet staat.


## 29 oktober 2026

**/beta stuurt Android nu ook direct naar Play.** Eis van de oprichter: monaoffline.com/beta
moet doen wat de lange links deden, dus iPhone naar TestFlight en Android naar de opt-in van
Play. /beta gebruikt daarvoor `ANDROID_TESTER_URL` als `BETA_ANDROID_URL` ontbreekt. Gevolg,
bewust geaccepteerd: wie nog niet op de lijst "Founding members" staat, ziet bij Google
"niet beschikbaar" in plaats van de wachtlijst.

**monaoffline.com/android, voor Android-testers die al op de lijst staan.** De Android-test
is intern: alleen wie op de lijst "Founding members" in Play Console staat kan installeren.
/beta stuurt Android-telefoons daarom naar de wachtlijst. Wie op de lijst is gezet, krijgt in
een persoonlijk bericht monaoffline.com/android, en dat gaat naar de opt-in-link van Play
(`ANDROID_TESTER_URL` in Vercel, `api/android.js`). Bewust een andere variabele dan
`BETA_ANDROID_URL`, zodat /beta niet meeverandert. Zonder variabele: de wachtlijst. Noindex
zoals /beta.

**monaoffline.com/beta, de link voor nieuwe testers.** Staat onder het eerste
instructieplaatje dat testers in WhatsApp krijgen. Het is een doorverwijzing
(`api/beta.js`, plus een rewrite in `vercel.json`): een iPhone gaat naar TestFlight,
Android naar de opt-in-link van Play. De links zelf staan niet in de repo maar in Vercel
als `BETA_IOS_URL` en `BETA_ANDROID_URL`. Ontbreekt er een, of komt iemand van een
computer, dan landt die op de homepage. De kop `X-Robots-Tag: noindex` houdt het adres
uit zoekmachines.

**/beta voor wie geen testlink krijgt.** Een computer gaat nu naar
`/beta-telefoon` (EN `/en/beta-phone`, gekozen op de eerste browsertaal, zoals de
homepage): "Open deze link op je telefoon", met een QR-code naar
monaoffline.com/beta en een verwijzing naar de wachtlijst. Een telefoon zonder
testlink (de variabele ontbreekt, of het is geen iPhone of Android) gaat naar de
wachtlijst op de homepage. iPhone en Android met link gaan zoals voorheen naar
TestFlight en Play. De QR (`assets/beta-qr.svg`) is lokaal gemaakt met segno en
nagelezen met een QR-lezer. Niet vindbaar: meta robots en de kop `X-Robots-Tag`
(via `vercel.json`) op beide pagina's en de QR, en geen link vanaf de site. Er is
bewust geen robots.txt-regel: een Disallow zou Google beletten de noindex te
lezen, en robots.txt is openbaar.

**Aanmeldingen via /beta zijn herkenbaar.** De telefoons zonder testlink en de
link "Zet je op de wachtlijst" op de QR-pagina gaan naar `/?source=beta#wachtlijst`
(EN `/en/?source=beta#wachtlijst`). Het formulier schrijft dan `source` als `beta`
of `beta-en` in plaats van `waitlist` of `waitlist-en`, zodat in Supabase te zien
is wie via de testlink kwam. De bevestigingsmail kiest Engels nu voor alles wat op
`-en` eindigt, dus `beta-en` krijgt ook de Engelse mail.

---

## 28 oktober 2026

**Intro op de homepage.** "Van een familiefoto" werd "Van een foto van je neefje
in de familie-app", en de slotregel werd "Het wordt allemaal doorgeduwd, maar
ooit was het internet op gaan je eigen beslissing." Het Engels volgt: "From a
photo of your nephew in the family group chat" en "It all gets pushed to you,
but going online used to be your own decision."

**iPhone en Android zitten allebei in de bètatest.** De hints op het formulier
zeiden nog dat de iPhone-versie in ontwikkeling was en Android als eerste kwam.
Nu is er één hint voor beide: "Mona zit in de bètatest. Zodra er plek is, krijg
je een uitnodiging." (EN "Mona is in beta. As soon as there is room, you will
get an invitation."). De bevestigingsmail volgt: de aparte iPhone-tekst ("Mona
bestaat nu alleen voor Android") is weg, iPhone krijgt dezelfde wachtlijstmail
als Android, in beide talen.

**De introtekst staat 4 pixels naar rechts** (NL en EN). De payoff heeft een
ruwe rand en de M en N beginnen iets naar binnen, waardoor de tekst op dezelfde
lijn optisch te ver naar links stond. De knoppen blijven op de lijn.

---

## 24 oktober 2026

**Terminal in de inbelband.** Tussen de ruis en CONNECT verschijnt nu
"hardware handshake…", in beide talen gelijk, in de grijze stijl van de
ruisregel. Met geluid valt hij halverwege tussen de ruis en CONNECT, zonder
geluid 1300 ms na de vorige regel, net als de rest. De CD-led gaat pas aan bij
CONNECT, zoals voorheen. De code telt het einde (NO CARRIER) nu af van het
aantal regels in plaats van een vast getal, zodat een volgende regel erbij geen
losse aanpassingen meer vraagt. (`45c0683`)

**"… 7 minuten online …" werd "… 7 minuten later …"** (EN "… 7 minutes later
…"). De reeks eindigt met NO CARRIER omdat Mona de lijn vanzelf laat vallen,
maar zo las het alsof inbellen op ophangen uitliep. Met "later" is duidelijk
dat er tijd verstrijkt: eerst online, dan valt de lijn weg.

**"Lijn weg. Tijd voor buiten." werd "Lijn weg. Tijd om naar buiten te gaan."**
"Tijd voor buiten" is geen goed Nederlands. Het Engelse "Line gone. Time to go
outside." zei het al goed en blijft staan.

**Onderschrift bij de modemfoto.** "US Robotics Sportster, 14.400 bps" werd
"1993 dial-up modem, 14.400 bps" (EN met 14,400). Het voorstel was 1996, maar
de Sportster 14.400 kwam rond 1992-1993 uit en in 1996 waren 28.800 en 33.600
bps gangbaar. Het Centre for Computing History dateert hem op 1993. De
alt-tekst van de foto noemt het merk nog wel.

---

## 22 oktober 2026

**De drie kolommen in de verhaalband delen nu dezelfde rasterlijnen** (subgrid).
De bodytekst in de middelste kolom begon 37 pixels hoger, precies een kopregel,
omdat "Je bent altijd online." een regel is en de andere twee koppen er twee
zijn. In het Engels viel het niet op. Opgelost met gedeelde rijen in plaats van
een minimale hoogte, zodat het ook klopt als een kop drie regels wordt.

**De drie gezichtjes hebben een eigen kleur**, via een masker in plaats van een
nieuwe export: de png levert de tekening, de css de kleur. Groen, rood en
#FFD400. Dat laatste is bewust geler dan het eerste voorstel, want #FF7A00 stond
qua helderheid te dicht bij het rood. Ze zweven los op het salie, op verzoek.
Dat kost contrast: groen haalt daar 1,89 staat tot 1, geel-oranje 1,79 en rood
1,39. Voor een sierlijntekening mag dat. Met een donker vlakje eronder haalden
dezelfde kleuren 9,51, 4,93 en 3,63, voor als het ooit terug moet.

**De afloop van het ritueel stond in beeld voordat er was ingebeld.** De regel
"Lijn weg. Tijd voor buiten." draagt een hidden-attribuut, maar de eigen
display:flex won daarvan. Dat gaf de clou weg en is nu rechtgezet. Daarbij viel
de terminaltekst naar de onderkant van het venster, want dat verdeelde zijn
ruimte over drie blokken waarvan er een verdween; de regels staan nu bovenaan en
de afsluiter plakt onderaan.

**De modemfoto staat in de inbelband**, links naast de terminal en in hetzelfde
kader. Het terminalvenster is onzichtbaar tot je op de belknop drukt en veert
dan tevoorschijn; zijn plek wordt wel altijd gereserveerd, anders springt de foto
opzij op het moment van klikken: een US Robotics
Sportster van de oprichter zelf, met op het schermpje op de achtergrond CONNECT
14400. Het echte apparaat naast de nagebootste terminal, in dezelfde ontzadiging
als de hero en met dezelfde harde schaduw als de kaarten elders.

## 21 oktober 2026

**Engelse copy.** "For a family photo to a headline" werd "From a family photo
to a headline", zodat het Engels gelijkloopt met het Nederlandse "Van een
familiefoto tot een krantenkop". (`a9b985f`)

**Intro op de homepage.** De laatste regel van de subregel werd "Het internet op
gaan was ooit je eigen beslissing." en in het Engels "Going online used to be
your own decision." Die vervangt de zin over naar je telefoon grijpen en de
reflex, en ook "Online gaan was iets wat je koos", dat er nu dubbel in zou
zitten. De og:description, de tekst bij een gedeelde link, volgt dezelfde zin.

---

## 20 oktober 2026

### De landingspagina opnieuw gebouwd

De hele site draagt nu het ontwerp uit de handoff `design_handoff_landing_page`:
volle kleurbanden in het palet Buitenadem, de handgetekende assets in plaats van
tekst, en IBM Plex Mono met Grandstander in plaats van Comfortaa. Eerst de
Nederlandse homepage (`2e7869e`), dan de Engelse (`c85f819`), dan Over, Contact
en Privacy in beide talen (`78352a5`).

Bij die laatste zes pagina's is alleen de schil vervangen: de stijl, de kop en
de voet. Alles tussen `<main>` en `</main>` is letterlijk blijven staan, en dat
is nagemeten in plaats van aangenomen: de zichtbare tekst van alle zes is teken
voor teken gelijk aan die van ervoor. Dat is vooral voor de privacypagina's van
belang, want die zijn juridisch nagelezen.

**Vijf plekken waar het bouwwerk bewust afwijkt van de ontwerpbriefing:**

1. **De lettertypes staan zelf gehost** in `/fonts/`, acht bestanden en samen
   127 kB. De briefing haalt Grandstander en IBM Plex Mono bij Google, maar dan
   gaat het IP-adres van elke bezoeker daarheen voordat er iets is aangeklikt.
   Precies daarom staat Comfortaa sinds 1 september al zelf gehost. Allebei de
   lettertypes staan onder de SIL Open Font License, dus dit mag.
2. **De voet draagt de bedrijfsregel** (tivity B.V., adres, KvK) en links naar
   Over, Privacy en Contact. Het ontwerp liet die weg, en dat is letterlijk
   waarop Apple de inschrijving eerder afwees: nergens stond welke rechtspersoon
   achter het domein zat en er was geen enkele interne link.
3. **De scrollvraag blijft in het formulier.** Die wordt als `scroll_freq`
   opgeslagen en staat met zoveel woorden in het privacybeleid, dus weglaten zou
   dat beleid onwaar maken en de reeks antwoorden breken.
4. **De telefoonkeuze heeft geen standaardwaarde.** Het ontwerp begint op
   iPhone, maar dan telt iedereen die niet kijkt als iPhone, en juist dat getal
   bepaalt welk platform voorgaat.
5. **De inbelreeks hangt aan het geluid**, niet aan vaste stappen van 1300 ms.
   De opname duurt hier 19,3 seconde en niet de 16,4 uit de app, dus met de
   tijden uit het ontwerp stond NO CARRIER al op het scherm terwijl de handshake
   nog piepte. De laatste twee regels rekenen terug vanaf het eind van het
   bestand, zodat het blijft kloppen als de opname wordt vervangen. Lukt
   afspelen niet, dan valt hij terug op de tijden uit het ontwerp.

Eén woord in de terminal gewijzigd: "20 minuten online" werd "7 minuten
online", want de app biedt 3, 7 of 30 minuten en 20 bestaat niet.

### De hero, in stappen

De copy en de opmaak van de hero zijn die dag een stuk of zeven keer bijgesteld.
De eindstand:

- **Alle copy links van het beeld**, in de volgorde die de eigenaar aangaf, met
  de belofte en de knoppen eronder. (`4d7e7c5`)
- **De kolom is links uitgelijnd** in plaats van gecentreerd. De briefing
  centreerde die kolom, maar dat rekende op een subregel van een of twee regels.
  Met acht regels krijgt elke regel een andere lengte en heeft het oog geen lijn
  om langs te lopen.
- **Elke aangegeven regel is een eigen blokje** met `text-wrap: balance`. Met
  een `<br>` balanceert de browser de alinea als geheel en blijft er een los
  woord op de laatste regel staan. (`f9721d8`, `13bbcbc`)
- **De kop staat op dezelfde linkerlijn als de copy.** Het beeldvlak stond al
  exact boven de tekstkolom, maar `mona-tagline-mos.png` draagt 3,3 procent
  transparante ruimte links en 2,9 procent rechts, dus de inkt begon negentien
  pixels naar rechts. Die rand is gemeten door de alfa van de png in een canvas
  af te tasten, en als negatieve marge gecompenseerd. (`13bbcbc`)
- **De tekstkolom moest breder** om die regels te laten passen: de hero ging van
  1360 naar 1560 pixels, waarmee elke kolom op 672 uitkomt.
- **Het beeld is een carrousel** van metro, boot en speeltuin. Drie lagen over
  elkaar die met opacity overvloeien, elke zeven seconden een wissel van 1,6
  seconde. Overvloeien met opacity en niet met een wissel van `background-image`,
  zodat de browser niets opnieuw hoeft te tekenen. Staat beweging uit bij de
  bezoeker, dan blijft het eerste beeld staan. (`58a1365`)
- **Verzadiging op 0,60** en een liggend vlak van 672 bij 484. De beelden kwamen
  vol uit de camera en dat las als gemaakt. Als filter in de CSS en niet in de
  bestanden, zodat eraan te draaien valt zonder nieuwe export. (`97efbc2`)
- **Het label "De online wereld" en de NO CARRIER-sticker zijn weg.** Die laatste
  klopte inhoudelijk niet: NO CARRIER betekent dat de lijn is weggevallen,
  terwijl op die foto's juist iedereen verbonden is. Het woord staat nog wel in
  de inbelband, waar het betekenis heeft als de reeks afloopt. (`4d7e7c5`)

### Datum privacybeleid

Van 17 naar 19 oktober 2026, gelijk aan de inhoud. Een beleid met een datum die
ouder is dan zijn tekst is precies wat een lezer niet verwacht, en dit is de
pagina die bij Apple wordt opgegeven. (`c5dcfcc`)

---

## 19 oktober 2026

**Drie aanvullingen op het privacybeleid**, in beide talen. (`d680bdf`)

1. **Wat Google bij de ping ziet.** De ping gaat naar Google Apps Script, en de
   ontvanger ziet daarbij het IP-adres van de verbinding. Dat stond er niet,
   terwijl het beleid belooft precies te vertellen wat er weggaat.
2. **Waar je de Schermtijd-toestemming intrekt**: "in de instellingen van je
   toestel, onder Schermtijd". De naam van het scherm daaronder noemen we
   bewust niet. Die vond ik alleen op pagina's van derden en nergens bij Apple
   zelf, en in iOS 26.4 is dat gedrag veranderd doordat intrekken achter de
   Schermtijd-code is gezet.
3. **De bewaartermijnen bij SMTP2GO en Vercel**, als expliciet open punt. Wat de
   twee diensten documenteren staat er (35 dagen bij SMTP2GO, een uur tot enkele
   dagen voor de logregels bij Vercel), met erbij dat niet vaststaat welke
   termijn voor onze eigen accounts geldt.

---

## 17 oktober 2026

**De site werd tweetalig.** (`5882468` tot `155920f`)

- `/en/` als echte map, dus `en/privacy.html` is met `cleanUrls` gewoon
  `/en/privacy`. De Nederlandse URL's zijn niet veranderd.
- Canonical per taal en drie hreflang-regels per pagina, met `x-default` op het
  Nederlands.
- De taalwissel "NL | EN" linkt naar de tegenhanger van díe pagina, nooit naar
  de homepage van de andere taal.
- De keuze wordt onthouden in localStorage onder `mona-lang`, zonder cookies.
  Op de homepage wordt eenmalig de browsertaal gevolgd zolang er geen keuze is
  opgeslagen. **Diepe links leiden nooit automatisch om**, ook niet met een
  opgeslagen keuze: wie op `/privacy` binnenkomt heeft die URL van iemand
  gekregen, en die pagina moet voor de beoordelaar van Apple Nederlands blijven.
- De Engelse pagina schrijft `source` als `waitlist-en`. Zonder dat verschil
  krijgt iemand die zich daar aanmeldt een Nederlandse bevestiging terug.
  `lib/mail.js` kiest de taal op de soort: eindigt die op `-en`, dan worden de
  aanhef, de afsluiting, de voet en de bedrijfsregel Engels.
- De meta-description zei "geen software van derden". Dat klopt voor de app,
  maar niet voor deze site, die op Vercel draait en Supabase en SMTP2GO
  gebruikt. Er staat nu "geen software van derden in de app".

`feedback.html` is buiten de tweetaligheid gebleven: dat is het testersformulier,
de werving is Nederlands, en de antwoordopties zijn letterlijk de waarden die in
Supabase belanden.

---

## Wat er nog openstaat

- **`feedback.html` draagt nog het oude ontwerp**, met Comfortaa en het
  petrolpalet. De enige pagina die nog om moet.
- **Het Engels is niet door een moedertaalspreker gelezen**, inclusief het
  privacybeleid dat bij Apple wordt opgegeven.
- **De bewaartermijnen bij SMTP2GO en Vercel** staan in de tekst als open punt.
  Zodra bekend is op welk abonnement die accounts zitten, kan daar een harde
  termijn staan.
- **De branches `claude/redesign-nl`, `claude/privacy-ip` en
  `claude/redesign-rest`** zitten allemaal in main en kunnen weg.

## Hoe je dit nakijkt

Alle tests in deze reeks zijn met een nagebootste Supabase gedaan, zodat er geen
testrij in de echte tabel belandt. De vijf foutpaden van het wachtlijstformulier
zijn in beide talen gedraaid: leeg veld, ongeldig adres, dubbel adres (409, telt
als gelukt), netwerkfout en serverfout. Het schema is niet aangeraakt.
