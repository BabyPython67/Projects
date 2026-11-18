// Parser für die Textdateien des Spiels ("Pergament-Skript").
// Eine Datei beschreibt einen Abschnitt (z. B. einen Kreis) mit Knoten.
// Reines Modul ohne DOM, damit es in Node getestet werden kann.

const META_ABSCHNITT = ['titel', 'untertitel', 'kreis', 'thema', 'start', 'gesaenge'];
const META_KNOTEN = ['ort', 'bild', 'gesang', 'rubrik', 'klang', 'art', 'probe', 'frist', 'fristziel'];

function zerlegeOptionen(rest) {
  // "{einmal} {wenn a, b>2} {setzt x, y} {plus mitleid 2}" -> Objekt
  const opt = {};
  const re = /\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(rest))) {
    const inhalt = m[1].trim();
    const [wort, ...weiter] = inhalt.split(/\s+/);
    const arg = inhalt.slice(wort.length).trim();
    switch (wort) {
      case 'einmal': opt.einmal = true; break;
      case 'wenn': opt.bed = (opt.bed ? opt.bed + ',' : '') + arg; break;
      case 'nicht': opt.bed = (opt.bed ? opt.bed + ',' : '') + arg.split(',').map(s => '!' + s.trim()).join(','); break;
      case 'setzt': opt.setzt = arg.split(/[,\s]+/).filter(Boolean); break;
      case 'plus': case 'minus': {
        const [name, n] = weiter;
        opt.zahlen = opt.zahlen || [];
        opt.zahlen.push({ name, n: (wort === 'minus' ? -1 : 1) * (n ? Number(n) : 1) });
        break;
      }
      default: throw new Error('Unbekannte Option {' + inhalt + '}');
    }
  }
  return opt;
}

function trenneZiel(zeile) {
  // "Text -> ziel {opts}" -> {text, ziel, opts}
  const i = zeile.lastIndexOf('->');
  if (i < 0) return null;
  const text = zeile.slice(0, i).trim();
  let rest = zeile.slice(i + 2).trim();
  const k = rest.indexOf('{');
  const optText = k >= 0 ? rest.slice(k) : '';
  rest = (k >= 0 ? rest.slice(0, k) : rest).trim();
  return { text, ziel: rest, opts: zerlegeOptionen(optText) };
}

export function zerlegeVersRef(s) {
  // "5,121-123; 5,127" -> [{g:5,a:121,b:123},{g:5,a:127,b:127}]
  return s.split(';').map(t => t.trim()).filter(Boolean).map(t => {
    const m = /^(\d+)\s*,\s*(\d+)(?:\s*-\s*(\d+))?$/.exec(t);
    if (!m) throw new Error('Versangabe unlesbar: ' + t);
    return { g: +m[1], a: +m[2], b: +(m[3] || m[2]) };
  });
}

export function zerlegeAbschnitt(quelltext, dateiname = '?') {
  const zeilen = quelltext.replace(/\r/g, '').split('\n');
  const abschnitt = { id: null, knoten: {}, reihenfolge: [] };
  let knoten = null;
  let imKopf = false; // direkt nach "===" stehen Meta-Zeilen
  const fehler = (nr, msg) => { throw new Error(`${dateiname}:${nr + 1}: ${msg}`); };

  zeilen.forEach((roh, nr) => {
    const z = roh.trim();
    if (!z) { imKopf = false; return; }
    if (z.startsWith('#')) return; // Kommentar
    if (z.startsWith('@abschnitt')) {
      abschnitt.id = z.slice(10).trim();
      imKopf = true; knoten = null; return;
    }
    if (z.startsWith('===')) {
      const id = z.slice(3).trim();
      if (!id) fehler(nr, 'Knoten ohne Namen');
      if (abschnitt.knoten[id]) fehler(nr, 'Knoten doppelt: ' + id);
      knoten = { id, meta: {}, teile: [], effekte: [], stimmen: [], wahlen: [], pruefung: null, weiter: null };
      abschnitt.knoten[id] = knoten;
      abschnitt.reihenfolge.push(id);
      imKopf = true; return;
    }
    const meta = /^([a-zäöü]+):\s*(.*)$/.exec(z);
    if (imKopf && meta) {
      const [, k, v] = meta;
      if (!knoten && META_ABSCHNITT.includes(k)) { abschnitt[k] = v; return; }
      if (knoten && META_KNOTEN.includes(k)) {
        knoten.meta[k] = k === 'gesang' ? v.split(/[,\s]+/).filter(Boolean).map(Number) : v;
        return;
      }
    }
    imKopf = false;
    if (!knoten) fehler(nr, 'Text außerhalb eines Knotens');

    if (z.startsWith('&')) { knoten.effekte.push(z.slice(1).trim()); return; }
    if (z.startsWith('[vers')) {
      const m = /^\[vers\s+([^\]]+)\]$/.exec(z);
      if (!m) fehler(nr, 'Versblock unlesbar');
      knoten.teile.push({ typ: 'vers', refs: zerlegeVersRef(m[1]) });
      return;
    }
    if (z.startsWith('~')) {
      // ~ Text -> ziel @x,y {opts}
      let s = z.slice(1).trim();
      let x = 50, y = 50;
      const pos = /@(\d+)\s*,\s*(\d+)/.exec(s);
      if (pos) { x = +pos[1]; y = +pos[2]; s = s.replace(pos[0], ''); }
      const t = trenneZiel(s);
      if (!t) fehler(nr, 'Stimme ohne Ziel');
      knoten.stimmen.push({ text: t.text, ziel: t.ziel, x, y, ...t.opts });
      return;
    }
    if (z.startsWith('+') || z.startsWith('>')) {
      const t = trenneZiel(z.slice(1).trim());
      if (!t) fehler(nr, 'Wahl ohne Ziel');
      knoten.wahlen.push({ art: z[0] === '+' ? 'rede' : 'weg', text: t.text, ziel: t.ziel, ...t.opts });
      return;
    }
    if (z.startsWith('!')) {
      const t = trenneZiel(z.slice(1).trim());
      if (!t) fehler(nr, 'Prüfung ohne Ziel');
      const [name, ...args] = t.text.split(/\s+/);
      const a = {};
      args.forEach(p => { const [k, v] = p.split('='); a[k] = v === undefined ? true : v; });
      knoten.pruefung = { name, args: a, ziel: t.ziel };
      return;
    }
    if (z.startsWith('->')) {
      const [ziel, label] = z.slice(2).split('|').map(s => s.trim());
      knoten.weiter = { ziel, label: label || null };
      return;
    }
    let bed = null;
    let text = z;
    const b = /^\{(wenn|nicht)\s+([^}]*)\}\s*(.*)$/.exec(z);
    if (b) {
      bed = b[1] === 'wenn' ? b[2] : b[2].split(',').map(s => '!' + s.trim()).join(',');
      text = b[3];
    }
    if (text.startsWith('&')) { knoten.effekte.push({ e: text.slice(1).trim(), bed }); return; }
    if (text.startsWith('[vers')) {
      const m = /^\[vers\s+([^\]]+)\]$/.exec(text);
      if (!m) fehler(nr, 'Versblock unlesbar');
      knoten.teile.push({ typ: 'vers', refs: zerlegeVersRef(m[1]), bed });
      return;
    }
    knoten.teile.push({ typ: 'p', text, bed });
  });

  if (!abschnitt.id) throw new Error(dateiname + ': @abschnitt fehlt');
  if (!abschnitt.start) abschnitt.start = abschnitt.reihenfolge[0];
  if (abschnitt.kreis !== undefined) abschnitt.kreis = String(abschnitt.kreis);
  return abschnitt;
}

// Ziel auflösen: "knoten", "abschnitt:knoten", "abschnitt:" (Start), "@ende"
export function loeseZiel(ziel, aktuellerAbschnitt) {
  if (ziel.startsWith('@')) return { spezial: ziel.slice(1) };
  const i = ziel.indexOf(':');
  if (i < 0) return { abschnitt: aktuellerAbschnitt, knoten: ziel };
  return { abschnitt: ziel.slice(0, i), knoten: ziel.slice(i + 1) || null };
}

// Prüft ein ganzes Werk: alle Ziele vorhanden, alle Verse im Bereich.
export function pruefeWerk(abschnitte, verse) {
  const probleme = [];
  const nachId = Object.fromEntries(abschnitte.map(a => [a.id, a]));
  const pruefeZiel = (z, a, wo) => {
    const r = loeseZiel(z, a.id);
    if (r.spezial) return;
    const ab = nachId[r.abschnitt];
    if (!ab) return probleme.push(`${wo}: Abschnitt fehlt: ${z}`);
    const k = r.knoten || ab.start;
    if (!ab.knoten[k]) probleme.push(`${wo}: Knoten fehlt: ${z}`);
  };
  for (const a of abschnitte) {
    if (!a.knoten[a.start]) probleme.push(`${a.id}: Startknoten fehlt: ${a.start}`);
    for (const id of a.reihenfolge) {
      const k = a.knoten[id];
      const wo = `${a.id}:${id}`;
      k.wahlen.forEach(w => pruefeZiel(w.ziel, a, wo));
      k.stimmen.forEach(w => pruefeZiel(w.ziel, a, wo));
      if (k.pruefung) pruefeZiel(k.pruefung.ziel, a, wo);
      if (k.weiter) pruefeZiel(k.weiter.ziel, a, wo);
      if (k.meta.frist && !k.meta.fristziel) probleme.push(`${wo}: frist ohne fristziel`);
      if (k.meta.fristziel) pruefeZiel(k.meta.fristziel, a, wo);
      if (k.meta.art !== 'text' && !k.wahlen.length && !k.stimmen.length && !k.pruefung && !k.weiter) probleme.push(`${wo}: Sackgasse`);
      // Ein Versverweis mitten im Absatz würde als Rohtext erscheinen
      for (const t of k.teile) if (t.typ === 'p' && /\[vers\b/.test(t.text)) probleme.push(`${wo}: Versverweis im Fließtext (muss in eine eigene Zeile)`);
      if (verse) for (const t of k.teile) if (t.typ === 'vers') for (const r of t.refs) {
        const g = verse[r.g - 1];
        if (!g || r.a < 1 || r.b > g.length || r.a > r.b) probleme.push(`${wo}: Vers außerhalb: ${r.g},${r.a}-${r.b}`);
      }
    }
  }
  return probleme;
}
