// Engine von „Woyzeck“: liest das Inhaltsformat (inhalt/*.txt), wertet einen Spielstand aus und erzeugt
// daraus den Text. Läuft unverändert im Browser und in Node (Tests, Werkzeuge). Keine Abhängigkeiten.
//
// Ein Spielstand ist nur: die Szene, in der man liest, und die getroffenen Entscheidungen. Alles andere
// (Woyzecks Zustand, was er erzählt, welche Fassung einer Stelle erscheint) folgt daraus, indem die
// Szenen von vorn durchlaufen werden. Deshalb lässt sich jeder Stand in einen kurzen Code fassen.

// ---------------------------------------------------------------- Parser

const RE_REDE = /^((?:\d\. )?[A-ZÄÖÜ][A-ZÄÖÜ. -]*[A-ZÄÖÜ]): (.+)$/;
const RE_OPTION = /^\* ([a-zäöüß0-9-]+) \((zuwenden|abwimmeln|neutral)\)(?: \[wenn (.+?)\])?: (.+)$/;
const RE_ANWEISUNG = /^\[(\/?)([a-zäöü]+)(?: (.*))?\]$/;
const RE_SZENE = /^## ([a-z0-9-]+) \| (.+)$/;
const META = new Set(["quelle", "ort", "bild", "zeit", "wenn"]);

export class InhaltsFehler extends Error {}

export function parseInhalt(dateien) {
  const szenen = [];
  const wahlen = new Map();
  for (const { name, text } of dateien) parseDatei(name, text, szenen, wahlen);
  const index = new Map(szenen.map((s, i) => [s.id, i]));
  if (index.size !== szenen.length) throw new InhaltsFehler("Szenen-ID doppelt vergeben");
  return { szenen, index, wahlen };
}

function parseDatei(name, text, szenen, wahlen) {
  const zeilen = text.replace(/\r/g, "").split("\n");
  let szene = null;
  let stapel = []; // offene Container: {knoten, kinder}
  let absatz = [];
  let nr = 0;
  const fehler = (z, msg) => { throw new InhaltsFehler(`${name}:${z + 1}: ${msg}`); };
  const kinder = () => stapel[stapel.length - 1].kinder;
  const imInnen = () => stapel.some((s) => s.knoten.typ === "innen");
  const block = (art, text, extra = {}) => {
    nr++;
    kinder().push({ typ: "block", art, text, id: `${szene.id}.${nr}`, ...extra });
  };
  const flush = () => {
    if (!absatz.length) return;
    block(imInnen() ? "innen" : "erz", imInnen() ? absatz.join("\n") : absatz.join(" "));
    absatz = [];
  };
  let lied = null;
  const liedFlush = () => { if (lied) { block("lied", lied.join("\n")); lied = null; } };

  for (let z = 0; z < zeilen.length; z++) {
    const roh = zeilen[z];
    const zeile = roh.trim();
    if (zeile.startsWith("//")) continue;
    const kopf = zeile.match(RE_SZENE);
    if (kopf) {
      flush(); liedFlush();
      if (szene && stapel.length !== 1) fehler(z, `Szene ${szene.id} hat offene Blöcke`);
      szene = { id: kopf[1], titel: kopf[2], quelle: [], ort: null, bild: null, zeit: null, bedingung: null, kinder: [], datei: name };
      szenen.push(szene);
      stapel = [{ knoten: szene, kinder: szene.kinder }];
      nr = 0;
      continue;
    }
    if (!szene) { if (zeile) fehler(z, "Text vor der ersten Szene"); continue; }
    if (!zeile) { flush(); liedFlush(); continue; }
    const meta = zeile.match(/^([a-z]+): (.+)$/);
    if (meta && META.has(meta[1]) && szene.kinder.length === 0 && stapel.length === 1 && !absatz.length) {
      if (meta[1] === "quelle") szene.quelle = meta[2].split(/;\s*/).map((q) => q.trim());
      else if (meta[1] === "wenn") szene.bedingung = parseBedingung(meta[2], (m) => fehler(z, m));
      else szene[meta[1]] = meta[2].trim();
      continue;
    }
    if (zeile.startsWith("~ ")) { flush(); (lied ??= []).push(zeile.slice(2)); continue; }
    liedFlush();
    const anw = zeile.match(RE_ANWEISUNG);
    if (anw) {
      flush();
      const [, zu, wort, rest = ""] = anw;
      const oben = stapel[stapel.length - 1];
      if (zu) {
        let k = oben.knoten.typ === "option" ? stapel[stapel.length - 2].knoten : oben.knoten;
        if (k.typ !== wort) fehler(z, `[/${wort}] schließt ${k.typ}`);
        if (oben.knoten.typ === "option") stapel.pop();
        stapel.pop();
        continue;
      }
      switch (wort) {
        case "wenn": {
          const k = { typ: "wenn", zweige: [{ bedingung: parseBedingung(rest, (m) => fehler(z, m)), kinder: [] }] };
          kinder().push(k);
          stapel.push({ knoten: k, kinder: k.zweige[0].kinder });
          break;
        }
        case "sonst": {
          if (oben.knoten.typ !== "wenn") fehler(z, "[sonst] ohne [wenn]");
          const bed = rest.startsWith("wenn ") ? parseBedingung(rest.slice(5), (m) => fehler(z, m)) : null;
          const zweig = { bedingung: bed, kinder: [] };
          oben.knoten.zweige.push(zweig);
          oben.kinder = zweig.kinder;
          break;
        }
        case "ende":
          if (oben.knoten.typ !== "wenn") fehler(z, "[ende] ohne [wenn]");
          stapel.pop();
          break;
        case "stelle": case "innen": {
          const [id, folge = null] = rest.split(/\s+/);
          if (!id) fehler(z, `[${wort}] ohne ID`);
          const k = { typ: wort, id, folge, kinder: [] };
          kinder().push(k);
          stapel.push({ knoten: k, kinder: k.kinder });
          break;
        }
        case "wahl": {
          const [id, folge = null] = rest.split(/\s+/);
          if (!id || wahlen.has(id)) fehler(z, `Wahl ohne oder mit doppelter ID: ${id}`);
          const k = { typ: "wahl", id, folge, optionen: [], szene: szene.id };
          wahlen.set(id, k);
          kinder().push(k);
          stapel.push({ knoten: k, kinder: [] });
          break;
        }
        case "setze":
          kinder().push({ typ: "setze", aenderungen: parseSetze(rest, (m) => fehler(z, m)) });
          break;
        case "bild": case "ort": case "pause":
          kinder().push({ typ: wort, name: rest.trim() || null });
          break;
        default:
          fehler(z, `unbekannte Anweisung [${wort}]`);
      }
      continue;
    }
    const opt = zeile.match(RE_OPTION);
    if (opt) {
      flush();
      let oben = stapel[stapel.length - 1];
      if (oben.knoten.typ === "option") { stapel.pop(); oben = stapel[stapel.length - 1]; }
      if (oben.knoten.typ !== "wahl") fehler(z, "Option außerhalb von [wahl]");
      const o = {
        typ: "option", key: opt[1], haltung: opt[2], text: opt[4], kinder: [],
        bedingung: opt[3] ? parseBedingung(opt[3], (m) => fehler(z, m)) : null,
      };
      if (oben.knoten.optionen.some((x) => x.key === o.key)) fehler(z, `Option ${o.key} doppelt`);
      oben.knoten.optionen.push(o);
      stapel.push({ knoten: o, kinder: o.kinder });
      continue;
    }
    if (stapel[stapel.length - 1].knoten.typ === "wahl") fehler(z, "Text in [wahl] vor der ersten Option");
    const rede = !imInnen() && zeile.match(RE_REDE);
    if (rede) { flush(); block("rede", rede[2], { sprecher: rede[1] }); continue; }
    absatz.push(zeile);
  }
  flush(); liedFlush();
  if (szene && stapel.length !== 1) fehler(zeilen.length - 1, `Szene ${szene.id} hat offene Blöcke`);
}

// Bedingungen: offen >= 2, kraft < 1 und nicht brot, abschied = nach, feld.wahl = fragen, (a oder b)
function parseBedingung(text, fehler) {
  const tokens = [];
  const re = /\s*(>=|<=|!=|=|>|<|\(|\)|-?\d+|[A-Za-zÄÖÜäöüß_][\wäöüßÄÖÜ.-]*)/y;
  let m;
  re.lastIndex = 0;
  while (re.lastIndex < text.length && (m = re.exec(text))) tokens.push(m[1]);
  if (tokens.join("").length !== text.replace(/\s+/g, "").length) fehler(`Bedingung nicht lesbar: ${text}`);
  let i = 0;
  const sieh = () => tokens[i];
  const nimm = () => tokens[i++];
  const oder = () => { let l = und(); while (sieh() === "oder") { nimm(); l = { op: "oder", l, r: und() }; } return l; };
  const und = () => { let l = nicht(); while (sieh() === "und") { nimm(); l = { op: "und", l, r: nicht() }; } return l; };
  const nicht = () => (sieh() === "nicht" ? (nimm(), { op: "nicht", a: nicht() }) : vergleich());
  const vergleich = () => {
    if (sieh() === "(") { nimm(); const a = oder(); if (nimm() !== ")") fehler(`Klammer fehlt: ${text}`); return a; }
    const name = nimm();
    if (!name || !/^[A-Za-zÄÖÜäöüß_]/.test(name)) fehler(`Name erwartet: ${text}`);
    if ([">=", "<=", "!=", "=", ">", "<"].includes(sieh())) {
      const op = nimm();
      const w = nimm();
      if (w === undefined) fehler(`Wert fehlt: ${text}`);
      return { op, name, wert: /^-?\d+$/.test(w) ? Number(w) : w };
    }
    return { op: "wahr", name };
  };
  const ast = oder();
  if (i !== tokens.length) fehler(`Bedingung zu lang: ${text}`);
  return ast;
}

function parseSetze(text, fehler) {
  return text.split(",").map((teil) => {
    const m = teil.trim().match(/^([a-zäöüß_][\wäöüß]*) (?:([+-])(\d+)|= ?(-?\d+|[a-zäöüß_][\wäöüß-]*))$/);
    if (!m) fehler(`[setze] nicht lesbar: ${teil}`);
    if (m[2]) return { name: m[1], op: m[2], wert: Number(m[3]) };
    return { name: m[1], op: "=", wert: /^-?\d+$/.test(m[4]) ? Number(m[4]) : m[4] };
  });
}

// ---------------------------------------------------------------- Auswertung

function wert(name, ctx) {
  if (name.includes(".")) return ctx.wahlen[name] ?? null;
  return ctx.vars[name] ?? 0;
}

export function pruefe(b, ctx) {
  switch (b.op) {
    case "oder": return pruefe(b.l, ctx) || pruefe(b.r, ctx);
    case "und": return pruefe(b.l, ctx) && pruefe(b.r, ctx);
    case "nicht": return !pruefe(b.a, ctx);
    case "wahr": { const w = wert(b.name, ctx); return w !== 0 && w !== null && w !== ""; }
  }
  const w = wert(b.name, ctx);
  const z = b.wert;
  switch (b.op) {
    case "=": return w === z;
    case "!=": return w !== z;
    case ">=": return w >= z;
    case "<=": return w <= z;
    case ">": return w > z;
    case "<": return w < z;
  }
  return false;
}

const HALT = Symbol("halt");

function lauf(knoten, ctx, rahmen) {
  for (const k of knoten) {
    switch (k.typ) {
      case "block":
        ctx.aus.push({
          art: rahmen.innen && k.art === "erz" ? "innen" : k.art, text: k.text, sprecher: k.sprecher ?? null,
          stelle: rahmen.stelle ?? k.id, folge: rahmen.folge ?? null,
        });
        break;
      case "wenn": {
        const zweig = k.zweige.find((z) => z.bedingung === null || pruefe(z.bedingung, ctx));
        if (zweig && lauf(zweig.kinder, ctx, rahmen) === HALT) return HALT;
        break;
      }
      case "stelle": case "innen":
        if (lauf(k.kinder, ctx, { stelle: k.id, folge: k.folge, innen: rahmen.innen || k.typ === "innen" }) === HALT) return HALT;
        break;
      case "wahl": {
        const verfuegbar = k.optionen.filter((o) => !o.bedingung || pruefe(o.bedingung, ctx));
        const key = ctx.wahlen[k.id];
        const o = key && verfuegbar.find((x) => x.key === key);
        if (!o) {
          ctx.offen = { id: k.id, folge: k.folge, optionen: verfuegbar.map(({ key, haltung, text }) => ({ key, haltung, text })) };
          return HALT;
        }
        const r = { stelle: k.id, folge: k.folge, innen: rahmen.innen };
        ctx.aus.push({ art: "gewaehlt", text: o.text, sprecher: "ANDRES", stelle: k.id, folge: k.folge, haltung: o.haltung });
        ctx.gewaehlt.push({ id: k.id, key: o.key, haltung: o.haltung });
        if (lauf(o.kinder, ctx, r) === HALT) return HALT;
        break;
      }
      case "setze":
        for (const a of k.aenderungen) {
          if (a.op === "=") ctx.vars[a.name] = a.wert;
          else ctx.vars[a.name] = (ctx.vars[a.name] ?? 0) + (a.op === "+" ? a.wert : -a.wert);
        }
        break;
      case "bild": case "ort": case "pause":
        ctx.aus.push({ art: k.typ, name: k.name, stelle: rahmen.stelle ?? null, folge: rahmen.folge ?? null });
        break;
    }
  }
  return null;
}

// Wertet einen Stand aus: alle Szenen bis zur aktuellen, die aktuelle bis zur ersten offenen Wahl.
// Ergebnis: { vars, szenen: [{ szene, bloecke }], aktuell: { szene, bloecke, wahl, ende, letzte } }
export function auswerten(inhalt, stand) {
  const ziel = inhalt.index.get(stand.szene) ?? 0;
  const ctx = { vars: {}, wahlen: stand.wahlen ?? {}, aus: [], offen: null, gewaehlt: [] };
  const szenen = [];
  for (let i = 0; i <= ziel; i++) {
    const s = inhalt.szenen[i];
    if (i < ziel && s.bedingung && !pruefe(s.bedingung, ctx)) continue; // Szene gehört nicht zu diesem Weg
    ctx.aus = [];
    ctx.offen = null;
    lauf(s.kinder, ctx, {});
    szenen.push({ szene: s, bloecke: ctx.aus });
    if (ctx.offen) break; // eine frühere Szene ist noch nicht fertig entschieden
  }
  const letzte = szenen[szenen.length - 1];
  const idx = inhalt.index.get(letzte.szene.id);
  const naechste = inhalt.szenen.findIndex((s, i) => i > idx && (!s.bedingung || pruefe(s.bedingung, ctx)));
  return {
    naechste: naechste < 0 ? null : inhalt.szenen[naechste].id,
    vars: { ...ctx.vars },
    gewaehlt: ctx.gewaehlt,
    szenen,
    aktuell: {
      szene: letzte.szene, bloecke: letzte.bloecke, wahl: ctx.offen, ende: !ctx.offen,
      letzte: naechste < 0, nummer: idx + 1, von: inhalt.szenen.length,
    },
  };
}

export function neuerStand(inhalt) {
  return { szene: inhalt.szenen[0].id, wahlen: {} };
}

export function waehle(inhalt, stand, wahlId, key) {
  const a = auswerten(inhalt, stand);
  const w = a.aktuell.wahl;
  if (!w || w.id !== wahlId || !w.optionen.some((o) => o.key === key)) throw new Error(`Wahl ${wahlId}/${key} gerade nicht möglich`);
  return { szene: a.aktuell.szene.id, wahlen: { ...stand.wahlen, [wahlId]: key } };
}

export function weiter(inhalt, stand) {
  const a = auswerten(inhalt, stand);
  if (!a.aktuell.ende || a.aktuell.letzte) return null;
  return { szene: a.naechste, wahlen: { ...stand.wahlen } };
}

// Bereinigt einen geladenen Stand: unbekannte Szenen und Wahlen fallen weg, sodass ein alter Stand nach
// einer neuen Fassung lesbar bleibt.
export function bereinige(inhalt, stand) {
  if (!stand || typeof stand !== "object" || typeof stand.szene !== "string") return null;
  if (!inhalt.index.has(stand.szene)) return null;
  const wahlen = {};
  for (const [id, key] of Object.entries(stand.wahlen ?? {})) {
    const w = inhalt.wahlen.get(id);
    if (w && typeof key === "string" && w.optionen.some((o) => o.key === key)) wahlen[id] = key;
  }
  return { szene: stand.szene, wahlen };
}

// Spielt von vorn bis zum Ende; strategie(wahl, vars) liefert den Schlüssel der Option.
export function durchspielen(inhalt, strategie) {
  let stand = neuerStand(inhalt);
  for (let schritt = 0; schritt < 10000; schritt++) {
    const a = auswerten(inhalt, stand);
    if (a.aktuell.wahl) { stand = waehle(inhalt, stand, a.aktuell.wahl.id, strategie(a.aktuell.wahl, a.vars)); continue; }
    const n = weiter(inhalt, stand);
    if (!n) return { stand, auswertung: a };
    stand = n;
  }
  throw new Error("Durchgang endet nicht");
}

// ---------------------------------------------------------------- Text

// Zerlegt Text mit {Büchner} und _kursiv_ in Abschnitte.
export function segmente(text) {
  const out = [];
  let b = false, i = false, puffer = "";
  const push = () => { if (puffer) out.push({ t: puffer, b, i }); puffer = ""; };
  for (const c of text) {
    if (c === "{" || c === "}") { push(); b = c === "{"; continue; }
    if (c === "_") { push(); i = !i; continue; }
    puffer += c;
  }
  push();
  return out;
}

export const klartext = (text) => text.replace(/[{}_]/g, "");

export function woerter(text) {
  return klartext(text).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export function buechnerSpannen(text) {
  return [...text.matchAll(/\{([^}]*)\}/g)].map((m) => m[1]);
}

// ---------------------------------------------------------------- Register und Sicherungscode

// inhalt/register.txt: „szene <id>“ und „wahl <id>: <option1> <option2> …“, nur anhängen, nie umordnen.
export function parseRegister(text) {
  const szenen = [], wahlen = [];
  for (const zeile of text.split("\n").map((z) => z.trim())) {
    if (!zeile || zeile.startsWith("#")) continue;
    let m;
    if ((m = zeile.match(/^szene ([a-z0-9-]+)$/))) szenen.push(m[1]);
    else if ((m = zeile.match(/^wahl ([a-z0-9.-]+): (.+)$/))) wahlen.push({ id: m[1], optionen: m[2].split(/\s+/) });
    else throw new InhaltsFehler(`register.txt: ${zeile}`);
  }
  return { szenen, wahlen };
}

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford, ohne I L O U
const CODE_VERSION = 1;

function crc16(bytes) {
  let crc = 0xffff;
  for (const b of bytes) {
    crc ^= b << 8;
    for (let k = 0; k < 8; k++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc;
}

export function codeAus(stand, register) {
  const bits = [];
  const schreibe = (wert, n) => { for (let k = n - 1; k >= 0; k--) bits.push((wert >> k) & 1); };
  const si = register.szenen.indexOf(stand.szene);
  if (si < 0) throw new Error(`Szene ${stand.szene} fehlt im Register`);
  schreibe(CODE_VERSION, 4);
  schreibe(si, 8);
  for (const w of register.wahlen) {
    const key = stand.wahlen[w.id];
    schreibe(key ? w.optionen.indexOf(key) + 1 : 0, 3);
  }
  while (bits.length % 8) bits.push(0);
  const bytes = [];
  for (let k = 0; k < bits.length; k += 8) bytes.push(parseInt(bits.slice(k, k + 8).join(""), 2));
  const crc = crc16(bytes);
  bytes.push(crc >> 8, crc & 0xff);
  let s = "", puffer = 0, n = 0;
  for (const b of bytes) {
    puffer = (puffer << 8) | b; n += 8;
    while (n >= 5) { s += ALPHABET[(puffer >> (n - 5)) & 31]; n -= 5; }
    puffer &= (1 << n) - 1;
  }
  if (n) s += ALPHABET[(puffer << (5 - n)) & 31];
  return "WOY-" + s.match(/.{1,5}/g).join("-");
}

export function standAus(code, register) {
  let s = String(code).toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  if (s.startsWith("W0Y")) s = s.slice(3);
  let puffer = 0, n = 0;
  const bytes = [];
  for (const c of s) {
    const v = ALPHABET.indexOf(c);
    if (v < 0) return null;
    puffer = (puffer << 5) | v; n += 5;
    if (n >= 8) { bytes.push((puffer >> (n - 8)) & 0xff); n -= 8; puffer &= (1 << n) - 1; }
  }
  if (puffer !== 0 || n >= 5) return null; // Füllbits müssen leer sein, sonst wäre das letzte Zeichen ungeprüft
  if (bytes.length < 4) return null;
  const nutz = bytes.slice(0, -2);
  const crc = (bytes[bytes.length - 2] << 8) | bytes[bytes.length - 1];
  if (crc16(nutz) !== crc) return null;
  const bits = nutz.flatMap((b) => [7, 6, 5, 4, 3, 2, 1, 0].map((k) => (b >> k) & 1));
  let p = 0;
  const lies = (k) => { let v = 0; for (let j = 0; j < k; j++) v = (v << 1) | (bits[p++] ?? 0); return v; };
  if (lies(4) !== CODE_VERSION) return null;
  const szene = register.szenen[lies(8)];
  if (!szene) return null;
  const wahlen = {};
  for (const w of register.wahlen) {
    if (p + 3 > bits.length) break;
    const v = lies(3);
    if (v) { if (!w.optionen[v - 1]) return null; wahlen[w.id] = w.optionen[v - 1]; }
  }
  return { szene, wahlen };
}
