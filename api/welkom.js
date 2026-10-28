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

// Twee Nederlandse teksten en een Engelse voor wie zich op /en/ aanmeldt. Welke
// het wordt volgt uit de kolom `source`, dus er is geen extra veld nodig.
// ACTIELIJST punt 14b noemde er drie, met een eigen tekst voor iPhone. Die is op
// 28 oktober 2026 vervallen: iPhone en Android zitten allebei in de bètatest en
// krijgen dezelfde wachtlijsttekst.
//
// De pagina onder /en/ schrijft `source` als 'waitlist-en'. Zonder dat verschil
// zou iemand die zich op de Engelse pagina aanmeldt een Nederlandse mail
// terugkrijgen. De soort gaat mee naar verstuur(), die er de voet en de
// afsluiting op kiest.
function bericht(rij) {
  if (rij.source === 'waitlist-en') return berichtEngels(rij);

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

// De wachtlijsttekst van hierboven, in het Engels. De app meldt zich nooit
// in het Engels aan, want zijn testers komen uit de Nederlandse werving.
function berichtEngels(rij) {
  const hi = aanhef(rij.name, 'en');

  return {
    onderwerp: 'You are on the Mona waitlist',
    regels: [
      hi + ',',
      '',
      'You are on the waitlist. Mona is running in a closed test with a small group who',
      'use the app every day, and that group grows step by step.',
      '',
      'As soon as there is room, you will get a message from us with an invitation and',
      'how to join. Until then you do not have to do anything.'
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
  const soort = rij.source === 'waitlist-en' ? 'wachtlijst-en' : 'wachtlijst';
  const gelukt = await verstuur(sleutel, rij.email, b.onderwerp, b.regels, soort);

  if (!gelukt) {
    // 500 zodat Supabase het opnieuw probeert in plaats van de aanmelding stil
    // te laten verdwijnen.
    return res.status(500).json({ fout: 'versturen mislukt' });
  }

  console.log('welkom: bevestiging verstuurd, variant ' +
    (rij.source === 'app' ? 'app'
      : (rij.source === 'waitlist-en' ? 'en-' : '') +
        (rij.android === true ? 'android' : 'iphone')));
  return res.status(200).json({ verstuurd: true });
}
