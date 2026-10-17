// Gedeelde verzendcode voor de twee bevestigingsmails: api/welkom.js (wachtlijst)
// en api/bedankt.js (feedbackformulier). Staat hier los zodat beide mails dezelfde
// afzender, dezelfde voet en dezelfde foutafhandeling houden.
//
// De sleutel staat nooit in dit bestand. Deze repo is publiek.

const SMTP2GO_URL = 'https://api.smtp2go.com/v3/email/send';

export const AFZENDER = 'Mona Offline <hello@monaoffline.com>';
export const ANTWOORD = 'hello@monaoffline.com';

// De app vult een vaste waarde in het naamveld, want daar vraagt hij geen naam.
// Die mag nooit als aanhef gebruikt worden.
const GEEN_ECHTE_NAAM = 'mona tester';

export function aanhef(naam, taal) {
  const n = (naam || '').trim();
  const hoi = taal === 'en' ? 'Hi' : 'Hoi';
  if (!n || n.toLowerCase() === GEEN_ECHTE_NAAM) return hoi;
  return hoi + ' ' + n;
}

// Bewust ruim: dit hoeft alleen te scheiden wat een adres is van wat een
// Instagram-handle of een voornaam is. Streng valideren op e-mail levert vooral
// valse afwijzingen op.
export function lijktOpAdres(s) {
  const v = (s || '').trim();
  return /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(v);
}

function ontsnap(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const VOET_TEKST_WACHTLIJST =
  'Je krijgt deze mail omdat je je hebt aangemeld op monaoffline.com of in de app.\n'
  + 'Wil je van de lijst af? Antwoord op deze mail, dan halen we je eraf.';

const VOET_TEKST_FEEDBACK =
  'Je krijgt deze mail omdat je je adres achterliet bij het feedbackformulier.\n'
  + 'Wil je dat we je antwoorden verwijderen? Antwoord op deze mail, dan doen we dat.';

const VOET_TEKST_WACHTLIJST_EN =
  'You are getting this email because you signed up on monaoffline.com or in the app.\n'
  + 'Want to come off the list? Reply to this email and we will remove you.';

const BEDRIJF = 'tivity B.V., Keizersgracht 720 HV, 1017 EW Amsterdam, KvK 84898569.';
const BEDRIJF_EN =
  'tivity B.V., Keizersgracht 720 HV, 1017 EW Amsterdam, the Netherlands. '
  + 'Chamber of Commerce (KvK) 84898569.';

// De soort eindigt op -en voor een Engelse mail. Alleen de wachtlijstmail kent
// dat nu, want het feedbackformulier blijft Nederlands.
function engels(soort) {
  return String(soort).slice(-3) === '-en';
}

function voetTekst(soort) {
  if (soort === 'feedback') return VOET_TEKST_FEEDBACK;
  return engels(soort) ? VOET_TEKST_WACHTLIJST_EN : VOET_TEKST_WACHTLIJST;
}

function bedrijfTekst(soort) {
  return engels(soort) ? BEDRIJF_EN : BEDRIJF;
}

function afsluiting(soort) {
  return engels(soort) ? 'Best,' : 'Groet,';
}

export function alsTekst(regels, soort) {
  return regels.join('\n')
    + '\n\n' + afsluiting(soort) + '\nMona Offline'
    + '\n\n---\n' + voetTekst(soort)
    + '\n' + bedrijfTekst(soort);
}

export function alsHtml(regels, soort) {
  const body = regels
    .map(function (r) {
      return r === ''
        ? '<p style="margin:0 0 14px"></p>'
        : '<p style="margin:0 0 10px">' + ontsnap(r) + '</p>';
    })
    .join('');
  return '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;'
    + 'line-height:1.6;color:#3A342B;background:#FBF4E4;padding:26px 22px;max-width:520px">'
    + body
    + '<p style="margin:18px 0 0">' + afsluiting(soort) + '<br>Mona Offline</p>'
    + '<hr style="border:none;border-top:1px solid #e7dcc2;margin:22px 0 14px">'
    + '<p style="margin:0;font-size:12px;color:#8a8172">'
    + ontsnap(voetTekst(soort)).replace(/\n/g, ' ') + '</p>'
    + '<p style="margin:8px 0 0;font-size:12px;color:#8a8172">' + ontsnap(bedrijfTekst(soort)) + '</p>'
    + '</div>';
}

// Verstuurt en zegt of het gelukt is. Gooit nooit: de aanroeper beslist wat een
// mislukking betekent. Het adres komt hier nooit in een logregel, conform
// USER-PREFERENCES.md.
export async function verstuur(sleutel, adres, onderwerp, regels, soort) {
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
        to: [adres],
        subject: onderwerp,
        text_body: alsTekst(regels, soort),
        html_body: alsHtml(regels, soort),
        custom_headers: [{ header: 'Reply-To', value: ANTWOORD }]
      })
    });
  } catch (e) {
    console.error('mail: SMTP2GO niet bereikbaar,', e && e.message);
    return false;
  }

  const uitslag = await antwoord.json().catch(function () { return null; });
  const gelukt = antwoord.ok && uitslag && uitslag.data && uitslag.data.succeeded;

  if (!gelukt) {
    console.error('mail: SMTP2GO weigerde, status ' + antwoord.status,
      uitslag && uitslag.data && uitslag.data.error);
    return false;
  }
  return true;
}
