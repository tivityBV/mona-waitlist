// monaoffline.com/android: de link voor Android-testers die al op de lijst staan.
//
// Waarom een apart adres naast /beta (29 okt 2026): de Android-test is een interne test.
// Alleen wie met zijn Google-adres op de lijst "Founding members" in Play Console staat,
// kan installeren; voor alle anderen eindigt de opt-in-link in "app niet beschikbaar".
// Daarom stuurt /beta Android-telefoons naar de wachtlijst, en gaat dit adres alleen in
// een persoonlijk bericht naar iemand die net op de lijst is gezet.
//
// De opt-in-link staat in Vercel als ANDROID_TESTER_URL, niet in de repo. Bewust een
// andere naam dan BETA_ANDROID_URL: die zou ook /beta laten doorsturen, en dan lopen
// onbekende Android-bezoekers alsnog dood. Ontbreekt de variabele, dan gaat de bezoeker
// naar de wachtlijst, net als bij /beta.

export default function handler(req, res) {
  const taal = String(req.headers['accept-language'] || '').trim().toLowerCase();
  const nl = taal.startsWith('nl');

  const doel = process.env.ANDROID_TESTER_URL
    || (nl ? '/?source=beta#wachtlijst' : '/en/?source=beta#wachtlijst');

  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', doel);
  res.status(302).end();
}
