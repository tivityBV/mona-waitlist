// Bedankmail na het invullen van het feedbackformulier (feedback.html).
//
// Twee dingen om te weten voordat je hieraan sleutelt.
//
// 1. Het formulier schrijft tot drie rijen weg per invuller, allemaal met dezelfde
//    `sid`: twee keer `stage='deel'` onderweg, en aan het eind `stage='compleet'`.
//    Reageren op elke insert zou dus tot drie mails naar dezelfde persoon sturen.
//    Daarom gaat er alleen iets uit op `compleet`.
//
// 2. Het adres is optioneel. Wie de vraag overslaat blijft anoniem en krijgt niets,
//    en dat is de bedoeling: het formulier is gebouwd om te werken zonder te weten
//    wie je bent. Het veld heette tot 2 sep 2026 "je naam of je Instagram" en vraagt
//    sinds die dag om een mailadres, want anders valt er niets terug te sturen.

import { lijktOpAdres, verstuur } from '../lib/mail.js';

const ONDERWERP = 'Dank je wel voor je antwoorden';

const REGELS = [
  'Hoi,',
  '',
  'Je hebt net het feedbackformulier van Mona ingevuld. Dank je wel, daar heeft Edward',
  'echt iets aan.',
  '',
  'Dit soort antwoorden bepaalt wat er als volgende gebouwd wordt. Niet wat handig lijkt',
  'op papier, maar wat er in het echt misgaat of juist werkt.',
  '',
  'Schiet je later nog iets te binnen? Antwoord gewoon op deze mail.'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ fout: 'alleen POST' });
  }

  const sleutel = process.env.SMTP2GO_API_KEY;
  const geheim = process.env.MONA_WEBHOOK_SECRET;
  if (!sleutel || !geheim) {
    console.error('bedankt: omgevingsvariabelen ontbreken in Vercel');
    return res.status(500).json({ fout: 'niet ingesteld' });
  }

  if (req.headers['x-mona-secret'] !== geheim) {
    console.warn('bedankt: verzoek met verkeerd of ontbrekend geheim geweigerd');
    return res.status(401).json({ fout: 'geen toegang' });
  }

  const payload = req.body || {};
  const rij = payload.record || {};

  if (payload.type !== 'INSERT' || payload.table !== 'feedback') {
    return res.status(200).json({ overgeslagen: true });
  }

  // De tussentijdse rijen zijn er om iemand die halverwege stopt niet uit de
  // cijfers te laten verdwijnen. Daar hoort geen mail bij.
  if (rij.stage !== 'compleet') {
    return res.status(200).json({ overgeslagen: 'deelrij' });
  }

  // Leeg gelaten, of iets anders ingevuld dan een adres (een Instagram-handle
  // bijvoorbeeld, zoals de vraag tot 2 sep 2026 vroeg). Dan gaat er niets uit.
  if (!lijktOpAdres(rij.contact)) {
    return res.status(200).json({ overgeslagen: 'geen adres' });
  }

  const gelukt = await verstuur(sleutel, rij.contact.trim(), ONDERWERP, REGELS, 'feedback');

  if (!gelukt) {
    return res.status(500).json({ fout: 'versturen mislukt' });
  }

  console.log('bedankt: bevestiging verstuurd, ronde ' + (rij.ronde || 'onbekend'));
  return res.status(200).json({ verstuurd: true });
}
