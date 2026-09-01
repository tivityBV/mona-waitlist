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

const SMTP2GO_URL = 'https://api.smtp2go.com/v3/email/send';
const AFZENDER = 'Mona Offline <hello@monaoffline.com>';
const ANTWOORD = 'hello@monaoffline.com';

// De app vult een vaste waarde in het naamveld, want daar vraagt hij geen naam.
// Die moet nooit als aanhef gebruikt worden.
const GEEN_ECHTE_NAAM = 'mona tester';

function aanhef(naam) {
  const n = (naam || '').trim();
  if (!n || n.toLowerCase() === GEEN_ECHTE_NAAM) return 'Hoi';
  return 'Hoi ' + n;
}

// Drie teksten, precies de drie die ACTIELIJST punt 14b noemt. Welke het wordt
// volgt uit de kolommen `android` en `source`, dus er is geen extra veld nodig.
function bericht(rij) {
  const hoi = aanhef(rij.name);
  const viaApp = rij.source === 'app';
  const android = rij.android === true;

  if (viaApp) {
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

  if (android) {
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
      'nu alleen voor Android. De iPhone-versie is in ontwikkeling en onze inschrijving bij',
      'Apple loopt.',
      '',
      'Dat betekent dat het bij jou wat langer duurt dan bij Android. Zodra er iets te',
      'installeren valt, ben jij een van de eersten die het hoort.'
    ]
  };
}

function alsTekst(regels) {
  return regels.join('\n')
    + '\n\nGroet,\nMona Offline'
    + '\n\n---\nJe krijgt deze mail omdat je je hebt aangemeld op monaoffline.com of in de app.'
    + '\nWil je van de lijst af? Antwoord op deze mail, dan halen we je eraf.'
    + '\ntivity B.V., Keizersgracht 720 HV, 1017 EW Amsterdam, KvK 84898569.';
}

function ontsnap(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function alsHtml(regels) {
  const body = regels
    .map(function (r) { return r === '' ? '<p style="margin:0 0 14px"></p>' : '<p style="margin:0 0 10px">' + ontsnap(r) + '</p>'; })
    .join('');
  return '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;'
    + 'line-height:1.6;color:#3A342B;background:#FBF4E4;padding:26px 22px;max-width:520px">'
    + body
    + '<p style="margin:18px 0 0">Groet,<br>Mona Offline</p>'
    + '<hr style="border:none;border-top:1px solid #e7dcc2;margin:22px 0 14px">'
    + '<p style="margin:0;font-size:12px;color:#8a8172">Je krijgt deze mail omdat je je hebt '
    + 'aangemeld op monaoffline.com of in de app. Wil je van de lijst af? Antwoord op deze '
    + 'mail, dan halen we je eraf.</p>'
    + '<p style="margin:8px 0 0;font-size:12px;color:#8a8172">tivity B.V., Keizersgracht 720 HV, '
    + '1017 EW Amsterdam, KvK 84898569</p>'
    + '</div>';
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

  let antwoord;
  try {
    antwoord = await fetch(SMTP2GO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': sleutel,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: AFZENDER,
        to: [rij.email],
        subject: b.onderwerp,
        text_body: alsTekst(b.regels),
        html_body: alsHtml(b.regels),
        custom_headers: [{ header: 'Reply-To', value: ANTWOORD }]
      })
    });
  } catch (e) {
    // Netwerkfout: 500 terug, dan probeert Supabase het opnieuw.
    console.error('welkom: SMTP2GO niet bereikbaar', e && e.message);
    return res.status(500).json({ fout: 'versturen mislukt' });
  }

  const uitslag = await antwoord.json().catch(function () { return null; });
  const verstuurd = uitslag && uitslag.data && uitslag.data.succeeded;

  if (!antwoord.ok || !verstuurd) {
    // Nooit het adres in de logs, dat is de afspraak uit USER-PREFERENCES.md.
    console.error('welkom: SMTP2GO weigerde, status ' + antwoord.status,
      uitslag && uitslag.data && uitslag.data.error);
    return res.status(500).json({ fout: 'versturen mislukt' });
  }

  console.log('welkom: bevestiging verstuurd, variant ' +
    (rij.source === 'app' ? 'app' : (rij.android === true ? 'android' : 'iphone')));
  return res.status(200).json({ verstuurd: true });
}
