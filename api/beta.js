// monaoffline.com/beta: de link voor nieuwe testers, onder het eerste instructieplaatje.
//
// Een doorverwijzing, geen pagina. Drie redenen, vastgelegd op 29 okt 2026:
//
// 1. De TestFlight-link staat niet in deze repo. Wie hem heeft kan meedoen, dus hij
//    leeft alleen in Vercel als omgevingsvariabele (BETA_IOS_URL). Komt er een nieuwe
//    groep of een nieuwe link, dan verander je die variabele en blijven de plaatjes en
//    berichten kloppen.
// 2. Eén adres voor beide telefoons. Een iPhone of iPad gaat naar TestFlight, Android
//    naar BETA_ANDROID_URL (de opt-in-link van Play). Een telefoon zonder testlink
//    (de variabele ontbreekt, of het is geen iPhone of Android) gaat naar de wachtlijst.
//    Een computer krijgt /beta-telefoon: een QR-code naar dit adres, om met de
//    telefoon te scannen. Sinds 29 okt 2026, daarvoor ging alles naar de homepage.
// 3. Niet vindbaar. Er is niets om te indexeren, en de kop X-Robots-Tag zegt het
//    zoekmachines ook nog. Niet vindbaar is wel iets anders dan geheim: wie het adres
//    krijgt, komt erin.

export default function handler(req, res) {
  const ua = String(req.headers['user-agent'] || '');
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const android = /Android/i.test(ua);

  const telefoon = ios || android || /Mobi/i.test(ua);

  // Dezelfde regel als de homepage: Nederlands als de eerste browsertaal Nederlands is.
  const taal = String(req.headers['accept-language'] || '').trim().toLowerCase();
  const nl = taal.startsWith('nl');

  let doel;
  if (ios && process.env.BETA_IOS_URL) doel = process.env.BETA_IOS_URL;
  else if (android && process.env.BETA_ANDROID_URL) doel = process.env.BETA_ANDROID_URL;
  else if (telefoon) doel = nl ? '/#wachtlijst' : '/en/#wachtlijst';
  else doel = nl ? '/beta-telefoon' : '/en/beta-phone';

  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', doel);
  res.status(302).end();
}
