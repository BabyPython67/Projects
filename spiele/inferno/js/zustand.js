// Spielstand: Bedingungen, Effekte, Speichern, Sicherungscode.
// Reines Modul ohne DOM (in Node testbar).
import { loeseZiel } from './skript.js';

export const STAND_VERSION = 1;

export function neuerStand(werk = 'inferno') {
  return {
    v: STAND_VERSION,
    werk,
    ort: null,          // { abschnitt, knoten }
    flags: {},          // name -> true
    zahlen: {},         // name -> Zahl
    gesehen: {},        // "abschnitt:knoten" -> Anzahl Besuche
    gewaehlt: {},       // Schlüssel einmaliger Wahlen -> 1
    gehoert: {},        // Stimmen, die schon gehört wurden
    merk: { seele: {}, prophezeiung: {}, suche: {} },
    getragen: {},       // id -> Name (Namen, die Dante zurückträgt)
    gefunden: {},       // id -> 1 (Ciaccos Liste)
    gesaenge: {},       // Nummer -> 1 (erlebte Gesänge)
    zeit: { start: 0, gespielt: 0 },
    fertig: false,
  };
}

const schluessel = (abschnitt, knoten) => abschnitt + ':' + knoten;

// --- Bedingungen -------------------------------------------------------
export function pruefeBedingung(stand, bed, abschnittId) {
  if (!bed) return true;
  return bed.split(',').map(s => s.trim()).filter(Boolean).every(term => {
    let neg = false;
    if (term.startsWith('!')) { neg = true; term = term.slice(1).trim(); }
    let ok;
    const vergleich = /^([\w.äöüß]+)\s*(>=|<=|==|>|<)\s*(-?\d+)$/.exec(term);
    if (vergleich) {
      const [, name, op, nStr] = vergleich;
      const abgeleitet = { seelen: Object.keys(stand.merk.seele).length, gehoert: Object.keys(stand.gehoert).length, getragen: Object.keys(stand.getragen).length };
      const w = name in abgeleitet ? abgeleitet[name] : (stand.zahlen[name] || 0), n = +nStr;
      ok = op === '>=' ? w >= n : op === '<=' ? w <= n : op === '==' ? w === n : op === '>' ? w > n : w < n;
    } else if (term.startsWith('gesehen:')) {
      const r = loeseZiel(term.slice(8), abschnittId);
      ok = !!stand.gesehen[schluessel(r.abschnitt, r.knoten)];
    } else if (term.startsWith('getragen:')) {
      ok = !!stand.getragen[term.slice(9)];
    } else if (term.startsWith('gefunden:')) {
      ok = !!stand.gefunden[term.slice(9)];
    } else {
      ok = !!stand.flags[term];
    }
    return neg ? !ok : ok;
  });
}

// --- Effekte -----------------------------------------------------------
export function wendeEffektAn(stand, effekt) {
  const [befehl, ...rest] = effekt.split(/\s+/);
  const argText = effekt.slice(befehl.length).trim();
  const felder = argText.split('|').map(s => s.trim());
  switch (befehl) {
    case 'setze': rest.forEach(f => { stand.flags[f] = true; }); break;
    case 'loesche': rest.forEach(f => { delete stand.flags[f]; }); break;
    case 'plus': case 'minus': {
      const n = (rest[1] ? Number(rest[1]) : 1) * (befehl === 'minus' ? -1 : 1);
      stand.zahlen[rest[0]] = (stand.zahlen[rest[0]] || 0) + n;
      break;
    }
    case 'seele': case 'prophezeiung': case 'suche': {
      const [id, ...text] = felder;
      if (!stand.merk[befehl][id]) stand.merk[befehl][id] = text.join(' | ');
      break;
    }
    case 'trage': { const [id, name] = felder; stand.getragen[id] = name || id; break; }
    case 'vergiss': delete stand.getragen[felder[0]]; break;
    case 'gefunden': stand.gefunden[felder[0]] = 1; break;
    case 'gesang': rest.forEach(g => { stand.gesaenge[+g] = 1; }); break;
    case 'fertig': stand.fertig = true; break;
    default: throw new Error('Unbekannter Effekt: ' + effekt);
  }
}

// --- Bewegung ----------------------------------------------------------
// Löst ein Ziel auf und betritt den Knoten. Gibt {abschnitt, knoten} zurück.
export function betrete(stand, werk, ziel, vonAbschnitt) {
  const r = loeseZiel(ziel, vonAbschnitt || (stand.ort && stand.ort.abschnitt));
  if (r.spezial) return { spezial: r.spezial };
  const ab = werk.abschnitte[r.abschnitt];
  if (!ab) throw new Error('Abschnitt fehlt: ' + ziel);
  const kId = r.knoten || ab.start;
  const k = ab.knoten[kId];
  if (!k) throw new Error('Knoten fehlt: ' + ziel);
  const key = schluessel(ab.id, kId);
  const erstesMal = !stand.gesehen[key];
  stand.gesehen[key] = (stand.gesehen[key] || 0) + 1;
  stand.ort = { abschnitt: ab.id, knoten: kId };
  if (k.meta.gesang) k.meta.gesang.forEach(g => { stand.gesaenge[g] = 1; });
  if (erstesMal) k.effekte.forEach(e => {
    if (typeof e === 'string') wendeEffektAn(stand, e);
    else if (pruefeBedingung(stand, e.bed, ab.id)) wendeEffektAn(stand, e.e);
  });
  return { abschnitt: ab, knoten: k, erstesMal };
}

export function wahlSchluessel(abschnittId, knotenId, wahl) {
  return abschnittId + ':' + knotenId + '>' + wahl.ziel + '|' + wahl.text.slice(0, 24);
}

export function sichtbareWahlen(stand, abschnittId, knoten, liste = knoten.wahlen) {
  return liste.filter(w =>
    pruefeBedingung(stand, w.bed, abschnittId) &&
    !(w.einmal && stand.gewaehlt[wahlSchluessel(abschnittId, knoten.id, w)]));
}

export function waehle(stand, abschnittId, knoten, wahl) {
  if (wahl.einmal) stand.gewaehlt[wahlSchluessel(abschnittId, knoten.id, wahl)] = 1;
  (wahl.setzt || []).forEach(f => { stand.flags[f] = true; });
  (wahl.zahlen || []).forEach(({ name, n }) => { stand.zahlen[name] = (stand.zahlen[name] || 0) + n; });
}

export function wendePruefungsErgebnisAn(stand, ergebnis = {}) {
  (ergebnis.setzt || []).forEach(f => { stand.flags[f] = true; });
  Object.entries(ergebnis.zahlen || {}).forEach(([k, v]) => { stand.zahlen[k] = v; });
  Object.entries(ergebnis.plus || {}).forEach(([k, v]) => { stand.zahlen[k] = (stand.zahlen[k] || 0) + v; });
}

// --- Speichern ---------------------------------------------------------
export function serialisiere(stand) {
  return JSON.stringify(stand);
}

export function deserialisiere(text) {
  const roh = JSON.parse(text);
  return pruefeStand(roh);
}

// Prüft und ergänzt einen geladenen Stand (auch aus älteren Fassungen).
export function pruefeStand(roh) {
  if (!roh || typeof roh !== 'object') throw new Error('Kein Spielstand');
  if (typeof roh.v !== 'number' || roh.v > STAND_VERSION) throw new Error('Unbekannte Fassung des Spielstands');
  const leer = neuerStand(roh.werk || 'inferno');
  const s = { ...leer, ...roh };
  for (const k of ['flags', 'zahlen', 'gesehen', 'gewaehlt', 'gehoert', 'getragen', 'gefunden', 'gesaenge']) {
    if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {};
  }
  s.merk = { ...leer.merk, ...(roh.merk || {}) };
  s.zeit = { ...leer.zeit, ...(roh.zeit || {}) };
  if (s.ort && (typeof s.ort.abschnitt !== 'string' || typeof s.ort.knoten !== 'string')) s.ort = null;
  s.v = STAND_VERSION;
  return s;
}

// --- Sicherungscode ----------------------------------------------------
// Format: INF1-<base64url(deflate(json))>-<crc32 hex>
// Ohne Kompression (falls CompressionStream fehlt): INF0-<base64url(json)>-<crc>

const CRC_TABELLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABELLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

function zuBase64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function ausBase64url(text) {
  const b = text.replace(/-/g, '+').replace(/_/g, '/');
  const s = atob(b + '==='.slice((b.length + 3) % 4));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function stroemeDurch(bytes, strom) {
  const antwort = new Response(new Blob([bytes]).stream().pipeThrough(strom));
  return new Uint8Array(await antwort.arrayBuffer());
}

// Kürzt den Stand für den Code: Zeitstempel weg, sonst alles.
export async function erzeugeSicherungscode(stand) {
  const json = new TextEncoder().encode(JSON.stringify(stand));
  let art = 'INF0', nutz = json;
  if (typeof CompressionStream !== 'undefined') {
    try { nutz = await stroemeDurch(json, new CompressionStream('deflate-raw')); art = 'INF1'; } catch { /* unkomprimiert */ }
  }
  return `${art}-${zuBase64url(nutz)}-${crc32(json)}`;
}

export async function liesSicherungscode(code) {
  const sauber = String(code).replace(/\s+/g, '');
  const m = /^(INF[01])-([A-Za-z0-9_-]+)-([0-9a-f]{8})$/.exec(sauber);
  if (!m) throw new Error('Das sieht nicht wie ein Sicherungscode aus. Er beginnt mit „INF1-“.');
  const [, art, daten, pruef] = m;
  let bytes;
  try { bytes = ausBase64url(daten); } catch { throw new Error('Der Code ist beschädigt.'); }
  if (art === 'INF1') {
    if (typeof DecompressionStream === 'undefined') throw new Error('Dieser Browser kann den Code nicht entpacken.');
    try { bytes = await stroemeDurch(bytes, new DecompressionStream('deflate-raw')); } catch { throw new Error('Der Code ist unvollständig oder beschädigt.'); }
  }
  if (crc32(bytes) !== pruef) throw new Error('Der Code ist unvollständig: Prüfsumme stimmt nicht.');
  return pruefeStand(JSON.parse(new TextDecoder().decode(bytes)));
}
