# Changelog

Wat er aan monaoffline.com veranderde, met de reden erbij. De commits staan in
`git log`, dit bestand legt uit waarom iets zo is en niet anders.

---

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
