// Bevestigingsmail bij een nieuwe wachtlijst-aanmelding.
//
// Dit is punt 14b uit ACTIELIJST.md. Tot 2 september 2026 kreeg niemand die zich
// aanmeldde ook maar iets terug, niet via de site en niet via de app.
//
// Waarom een database-webhook en niet gewoon een regel in de verzendcode van de
// pagina: de app schrijft naar dezelfde tabel (`source` is dan 'app' in plaats van
// 'waitlist'). Een webhook op de insert vangt allebei de routes, en de verzendlogica
// van de website hoeft niet aangeraakt te worden.
//
// Instellen staat in README.md onder "Bevestigingsmail". Twee omgevingsvariabelen,
// allebei in Vercel, nooit in deze repo: die is publiek.

import { aanhef, verstuur } from '../lib/mail.js';

// Drie teksten, precies de drie die ACTIELIJST punt 14b noemt. Welke het wordt
// volgt uit de kolommen `android` en `source`, dus er is geen extra veld nodig.
function bericht(rij) {
  const hoi = aanhef(rij.name);

  if (rij.source === 'app') {
    return {
      onderwerp: 'Je staat op de lijst',
      regels: [
        hoi + ',',
        '',
        'Je hebt je vanuit Mona aangemeld, dus je staat nu op de lijst voor nieuwe versies.',
        'Je hoeft verder niets te doen. Als er iets te melden is, hoor je het van ons.',
        '',
        'Loop je ergens tegenaan, of werkt er iets niet zoals je verwacht? Antwoord gewoon',
        'op deze mail. Alles wat testers melden bepaalt wat er gebouwd wordt.'
      ]
    };
  }

  if (rij.android === true) {
    return {
      onderwerp: 'Je staat op de wachtlijst van Mona',
      regels: [
        hoi + ',',
        '',
        'Je staat op de wachtlijst. Mona draait op dit moment in een besloten test bij een',
        'kleine groep die de app dagelijks gebruikt, en die groep groeit stap voor stap.',
        '',
        'Zodra er plek is, krijg je van ons een bericht met een uitnodiging en hoe je',
        'meedoet. Tot die tijd hoef je niets te doen.'
      ]
    };
  }

  return {
    onderwerp: 'Je staat op de lijst, de iPhone-versie komt eraan',
    regels: [
      hoi + ',',
      '',
      'Je staat op de lijst. Wel even eerlijk zijn over waar je aan toe bent: Mona bestaat',
      'nu alleen voor Android. De iPhone-versie is in ontwikkeling. Ons ontwikkelaarsaccount',
      'bij Apple is rond, dus we zijn al druk aan het bouwen.',
      '',
      'Dat betekent dat het bij jou wat langer duurt dan bij Android. Zodra er iets te',
      'installeren valt, ben jij een van de eersten die het hoort.'
    ]
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ fout: 'alleen POST' });
  }

  const sleutel = process.env.SMTP2GO_API_KEY;
  const geheim = process.env.MONA_WEBHOOK_SECRET;
  if (!sleutel || !geheim) {
    console.error('welkom: omgevingsvariabelen ontbreken in Vercel');
    return res.status(500).json({ fout: 'niet ingesteld' });
  }

  // Zonder dit kan iedereen die de URL raadt mail laten versturen op jouw domein.
  if (req.headers['x-mona-secret'] !== geheim) {
    console.warn('welkom: verzoek met verkeerd of ontbrekend geheim geweigerd');
    return res.status(401).json({ fout: 'geen toegang' });
  }

  const payload = req.body || {};
  const rij = payload.record || {};

  if (payload.type !== 'INSERT' || payload.table !== 'waitlist') {
    // Geen fout: de webhook mag rustig iets anders sturen, wij doen er niets mee.
    return res.status(200).json({ overgeslagen: true });
  }
  if (!rij.email) {
    console.error('welkom: rij zonder e-mailadres, niets verstuurd');
    return res.status(200).json({ overgeslagen: true });
  }

  const b = bericht(rij);
  const gelukt = await verstuur(sleutel, rij.email, b.onderwerp, b.regels, 'wachtlijst');

  if (!gelukt) {
    // 500 zodat Supabase het opnieuw probeert in plaats van de aanmelding stil
    // te laten verdwijnen.
    return res.status(500).json({ fout: 'versturen mislukt' });
  }

  console.log('welkom: bevestiging verstuurd, variant ' +
    (rij.source === 'app' ? 'app' : (rij.android === true ? 'android' : 'iphone')));
  return res.status(200).json({ verstuurd: true });
}
