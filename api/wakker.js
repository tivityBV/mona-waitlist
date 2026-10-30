// Eén verzoek per dag aan Supabase, zodat het project niet pauzeert.
//
// Waarom dit bestaat, vastgelegd op 30 oktober 2026. Het wachtlijstformulier gaf
// "Er ging iets mis" omdat het Supabase-project gepauzeerd stond. Een gratis project
// pauzeert na een week zonder activiteit, en dan wordt de hostnaam niet meer bediend:
// `lftibffclhufvwxrpumo.supabase.co` bestond niet eens meer in het DNS. De `fetch` in
// index.html faalt dan al voordat er een statuscode is. De site doet alleen iets bij
// een aanmelding, en in een stille week komt die er niet, dus pauzeerde het project
// precies op het moment dat het nodig was.
//
// Dit verzoek is daar de goedkoopste rem op: één vraag aan de tabel per dag, met de
// publieke sleutel die ook in de pagina staat. Er komt geen rij terug, want anon heeft
// geen leesrechten, maar het verzoek bereikt Postgres en dat is wat telt.
//
// Wat dit niet doet: een project dat al gepauzeerd staat weer aanzetten. Dat kan alleen
// met de hand in het Supabase-dashboard. Dit houdt hem wakker, het maakt hem niet wakker.

// Dezelfde twee waarden als in index.html, en die pagina is publiek. De sleutel is de
// publishable key: hij mag alleen toevoegen, niet lezen. Staan ze in Vercel, dan gaan
// die voor, zodat een nieuw project of een nieuwe sleutel hier niets hoeft te veranderen.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lftibffclhufvwxrpumo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_O_T3-7V3qzaPJDLlln8bIA_PTSsD4bG';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  // Vercel stuurt bij een cron `Authorization: Bearer $CRON_SECRET` mee, als die
  // variabele bestaat. Bestaat hij niet, dan controleren we niets: dit verzoek doet
  // niets wat schade kan aanrichten, het leest zelfs geen rij.
  const geheim = process.env.CRON_SECRET;
  if (geheim && req.headers.authorization !== 'Bearer ' + geheim) {
    return res.status(401).json({ fout: 'geen toegang' });
  }

  const url = SUPABASE_URL + '/rest/v1/waitlist?select=id&limit=1';

  let antwoord;
  try {
    antwoord = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    });
  } catch (e) {
    // Dit is het beeld van een gepauzeerd project: de hostnaam bestaat niet, dus de
    // fetch komt niet eens tot een statuscode. 503 zodat het rood staat in Vercel.
    console.error('wakker: Supabase niet bereikbaar, project vermoedelijk gepauzeerd,',
      e && e.message);
    return res.status(503).json({ wakker: false, reden: 'niet bereikbaar' });
  }

  // Elk antwoord betekent dat het project draait, ook een 401 of een 404. Alleen een
  // 5xx is reden om te kijken, want dan is de database zelf in de war.
  if (antwoord.status >= 500) {
    console.error('wakker: Supabase antwoordde ' + antwoord.status);
    return res.status(503).json({ wakker: false, status: antwoord.status });
  }

  console.log('wakker: Supabase antwoordde ' + antwoord.status);
  return res.status(200).json({ wakker: true, status: antwoord.status });
}
