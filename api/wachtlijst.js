// Vangnet voor een aanmelding die niet in Supabase past.
//
// Waarom dit bestaat, vastgelegd op 30 oktober 2026. Het Supabase-project stond
// gepauzeerd, de hostnaam bestond niet meer in het DNS, en elke aanmelding viel in de
// `catch` van index.html. De bezoeker las "Er ging iets mis", en dat was het dan: de
// aanmelding bestond nergens meer, ook niet bij ons. Hoeveel mensen dat zijn geweest
// valt niet na te gaan, want ze hebben nooit iets bereikt dat iets bewaart.
//
// Lukt de insert niet, dan sturen de twee homepages de aanmelding hierheen en gaat hij
// per mail naar hello@monaoffline.com. De bezoeker ziet gewoon "Je staat erop", want
// dat is dan ook waar: wij hebben hem. Zodra Supabase weer draait zet je zo iemand met
// de hand in de tabel (Table editor), en dan stuurt de database-webhook hem alsnog zijn
// bevestiging. Dat laatste is bewust niet hier geregeld: twee plekken die dezelfde mail
// versturen levert vroeg of laat twee mails op.
//
// Wat het slechtste geval is als iemand dit adres vindt: mail naar onze eigen inbox.
// Er gaat niets naar de bezoeker, het adres van de ontvanger staat vast in de code, en
// er is niets om uit te lezen.

import { ANTWOORD, lijktOpAdres, verstuur } from '../lib/mail.js';

// Ruim genoeg voor een naam en een adres, krap genoeg om er geen tekst in te kwijt
// te kunnen. De waarden komen uit een formulier met vier velden.
function kort(waarde, max) {
  const s = String(waarde == null ? '' : waarde).trim().replace(/\s+/g, ' ');
  return s.length > max ? s.slice(0, max) + '…' : s;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ fout: 'alleen POST' });
  }

  const sleutel = process.env.SMTP2GO_API_KEY;
  if (!sleutel) {
    console.error('wachtlijst: SMTP2GO_API_KEY ontbreekt in Vercel');
    return res.status(500).json({ fout: 'niet ingesteld' });
  }

  const rij = req.body || {};
  const email = kort(rij.email, 120);

  if (!lijktOpAdres(email)) {
    return res.status(400).json({ fout: 'geen adres' });
  }

  const naam = kort(rij.name, 80);
  const bron = kort(rij.source, 40) || 'onbekend';
  const scroll = kort(rij.scroll_freq, 40) || 'niet ingevuld';
  const telefoon = rij.android === true ? 'Android' : (rij.android === false ? 'iPhone' : 'niet ingevuld');

  const regels = [
    'Deze aanmelding kon niet in Supabase worden opgeslagen, dus hij komt hierlangs.',
    'De bezoeker heeft wel "Je staat erop" gezien.',
    '',
    'Naam: ' + (naam || 'niet ingevuld'),
    'E-mail: ' + email,
    'Telefoon: ' + telefoon,
    'Scrollen: ' + scroll,
    'Bron: ' + bron,
    '',
    'Wat je moet doen: kijk eerst of het Supabase-project nog draait (een gratis',
    'project pauzeert na een week stilte), zet het aan, en voeg deze aanmelding daarna',
    'met de hand toe in de Table editor. De database-webhook stuurt dan de bevestiging.'
  ];

  const gelukt = await verstuur(sleutel, ANTWOORD, 'Aanmelding buiten de database om', regels, 'vangnet');

  if (!gelukt) {
    // Nu is er niets meer over om de aanmelding op te vangen. De pagina laat dan wel
    // de foutmelding zien, zodat de bezoeker weet dat het niet gelukt is.
    console.error('wachtlijst: vangnet mislukt, aanmelding nergens bewaard');
    return res.status(502).json({ fout: 'versturen mislukt' });
  }

  console.log('wachtlijst: aanmelding via het vangnet doorgestuurd, bron ' + bron);
  return res.status(200).json({ bewaard: true });
}
