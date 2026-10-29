// Inhalts-Tests: Büchners Wortlaut, keine Szene fehlt in irgendeinem Durchgang, jede Variante gehört zu
// einer Folge, Register und Inhalt passen zusammen, die Folgen sind spürbar.
// Aufruf aus dem Ordner woyzeck: node --test tests/inhalt.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { durchspielen, buechnerSpannen, auswerten, waehle, weiter, neuerStand } from "../js/engine.js";
import { ladeInhalt, ladeRegister, ladeQuelle, ORDNER } from "../tools/lade.mjs";
import { fehlendeSpannen } from "../tools/pruefe-buechner.mjs";
import { modernisiere, endgueltigeNamen, vergleichsform } from "../tools/modernisierung.mjs";
import { strategie, vergleiche, bewerte, SCHWELLE } from "../tools/durchgaenge.mjs";

const inhalt = ladeInhalt();
const quelle = ladeQuelle();

// Szenenfolge nach Poschmann (Leipzig 1984), wie zeno.org sie in der Vorbemerkung nennt.
export const POSCHMANN = ["H4,1", "H4,2", "H4,3", "H2,3", "H1,1", "H2,5", "H1,2", "H1,3", "H3,1", "H4,4", "H4,5", "H4,6", "H4,8",
  "H4,9", "H2,7", "H4,7", "H4,10", "H4,11", "H4,12", "H4,13", "H1,8", "H4,14", "H4,15", "H4,16", "H4,17", "H1,14", "H1,15",
  "H1,16", "H1,17", "H1,19", "H1,20", "H1,18", "H3,2", "H1,21"];

// Quelltext je Handschriften-Szene, in Vergleichsform.
const proSzene = new Map();
for (const teil of quelle.split(/\n(?==== )/)) {
  const m = teil.match(/^=== \[(H\d), Szene (\d+)\]/);
  if (m) proSzene.set(`${m[1]},${m[2]}`, vergleichsform(teil));
}

test("Jeder als Büchner markierte Satz steht wörtlich in der modernisierten Quelle", () => {
  const fehlt = fehlendeSpannen(inhalt, quelle);
  assert.deepEqual(fehlt, []);
});

test("Die modernisierte Quelle ist aus der Rohquelle mit den dokumentierten Regeln erzeugt", () => {
  const roh = readFileSync(join(ORDNER, "quelle/woyzeck-zeno.txt"), "utf8");
  const text = roh.split(/\n(?==== )/).slice(1).join("\n");
  assert.ok(quelle.endsWith(modernisiere(endgueltigeNamen(text))), "quelle/woyzeck-modernisiert.txt neu erzeugen: node tools/modernisieren.mjs");
});

test("Die Spielszenen folgen Poschmanns Reihenfolge und nennen jede Szene der Lesefassung", () => {
  const genannt = inhalt.szenen.flatMap((s) => s.quelle).filter((q) => /^H\d,\d+$/.test(q));
  for (const q of POSCHMANN) assert.ok(genannt.includes(q), `${q} fehlt`);
  // Reihenfolge: das erste Auftreten jeder Leittext-Szene (H4) steigt monoton
  const h4 = genannt.filter((q) => q.startsWith("H4")).map((q) => POSCHMANN.indexOf(q));
  assert.deepEqual(h4, [...h4].sort((a, b) => a - b));
});

for (const [name, haltung] of [["zuhören", "zuwenden"], ["abwimmeln", "abwimmeln"], ["dazwischen", "neutral"]]) {
  test(`Keine Szene fällt weg: Durchgang „${name}“ enthält Büchners Text aus jeder Szene der Lesefassung`, () => {
    const a = durchspielen(inhalt, strategie(haltung)).auswertung;
    const spannen = a.szenen.flatMap((s) => s.bloecke).flatMap((b) => (b.text ? buechnerSpannen(b.text) : [])).map(vergleichsform);
    for (const q of POSCHMANN) {
      if (q === "H4,3") continue; // in H4 nur die Überschrift, Text aus H2,3 und H1,1
      const text = proSzene.get(q);
      assert.ok(spannen.some((s) => s.length > 3 && text.includes(s)), `${q} fehlt im Durchgang „${name}“`);
    }
  });
}

test("Jede Variante liegt in einer Stelle mit Folge", () => {
  const fehler = [];
  const besuche = (knoten, inStelle, szene) => {
    for (const k of knoten) {
      if (k.typ === "wenn" && !inStelle) fehler.push(`${szene}: [wenn] ohne [stelle]`);
      const drin = inStelle || ((k.typ === "stelle" || k.typ === "innen" || k.typ === "wahl") && ["offen", "kraft", "abschied"].includes(k.folge));
      if ((k.typ === "stelle" || k.typ === "innen" || k.typ === "wahl") && !["offen", "kraft", "abschied"].includes(k.folge)) fehler.push(`${szene}: ${k.id} ohne gültige Folge`);
      for (const unter of [k.kinder, k.optionen, ...(k.zweige ?? []).map((z) => z.kinder)]) if (unter) besuche(unter, drin, szene);
    }
  };
  for (const s of inhalt.szenen) besuche(s.kinder, false, s.id);
  assert.deepEqual(fehler, []);
});

test("Jede Wahl hat eine Option ohne Bedingung", () => {
  for (const w of inhalt.wahlen.values()) assert.ok(w.optionen.some((o) => !o.bedingung), w.id);
});

test("Register und Inhalt passen zusammen", () => {
  const reg = ladeRegister();
  assert.deepEqual(reg.szenen.slice(0, inhalt.szenen.length), inhalt.szenen.map((s) => s.id));
  for (const w of inhalt.wahlen.values()) {
    const r = reg.wahlen.find((x) => x.id === w.id);
    assert.ok(r, `${w.id} fehlt im Register`);
    assert.deepEqual([...r.optionen].sort(), w.optionen.map((o) => o.key).sort(), w.id);
  }
  assert.equal(reg.wahlen.length, inhalt.wahlen.size);
});

test("Jede Option ist in irgendeinem Durchgang erreichbar", () => {
  const gesehen = new Set();
  let zufall = 3;
  const rnd = () => ((zufall = (zufall * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let lauf = 0; lauf < 400; lauf++) {
    let st = neuerStand(inhalt);
    for (let n = 0; n < 200; n++) {
      const a = auswerten(inhalt, st);
      if (a.aktuell.wahl) {
        const o = a.aktuell.wahl.optionen;
        const k = o[Math.floor(rnd() * o.length)].key;
        gesehen.add(`${a.aktuell.wahl.id}/${k}`);
        st = waehle(inhalt, st, a.aktuell.wahl.id, k);
        continue;
      }
      const w = weiter(inhalt, st);
      if (!w) break;
      st = w;
    }
  }
  const alle = [...inhalt.wahlen.values()].flatMap((w) => w.optionen.map((o) => `${w.id}/${o.key}`));
  assert.deepEqual(alle.filter((x) => !gesehen.has(x)), []);
});

test(`Die Folgen sind spürbar: jede Folge ändert mindestens zwei Stellen um je ≥ ${SCHWELLE} Wörter`, () => {
  const { proFolge, ohne, ok } = bewerte(vergleiche(inhalt));
  assert.deepEqual(ohne, [], "Stellen ohne Folge");
  for (const [f, p] of Object.entries(proFolge)) assert.ok(p.stark >= 2, `${f}: nur ${p.stark}`);
  assert.ok(ok);
});
