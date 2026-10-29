// Logik-Tests: Engine (Bedingungen, Folgen-Zustand, Woyzecks eigener Wille), Speichern und Laden,
// Sicherungscode. Aufruf aus dem Ordner woyzeck: node --test tests/logik.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseInhalt, auswerten, neuerStand, waehle, weiter, durchspielen, bereinige, codeAus, standAus, segmente, woerter,
} from "../js/engine.js";
import { ladeStand, speichereStand, loescheStand, ladeEinstellungen, speichereEinstellungen, ladePosition, speicherePosition, SCHLUESSEL } from "../js/speicher.js";
import { ladeInhalt, ladeRegister } from "../tools/lade.mjs";
import { strategie } from "../tools/durchgaenge.mjs";

const inhalt = ladeInhalt();
const register = ladeRegister();

// Kleiner Speicher wie localStorage, optional mit Fehlern.
function speicher({ kaputt = false } = {}) {
  const daten = new Map();
  return {
    daten,
    getItem: (k) => { if (kaputt) throw new Error("SecurityError"); return daten.has(k) ? daten.get(k) : null; },
    setItem: (k, v) => { if (kaputt) throw new Error("QuotaExceededError"); daten.set(k, String(v)); },
    removeItem: (k) => { daten.delete(k); },
  };
}

const MINI = `
## a | Erste
[setze x = 1]
Hallo {Büchner} _kursiv_.
[wahl a.w offen]
* ja (zuwenden): „Ja.“
Gut.
[setze x +2]
* nein (abwimmeln): „Nein.“
[setze x -1]
* geheim (neutral) [wenn x >= 5]: „Nie sichtbar.“
[/wahl]
[stelle a.s offen]
[wenn x >= 3 und a.w = ja]
Viel.
[sonst wenn nicht x]
Null.
[sonst]
Wenig.
[ende]
[/stelle]

## b | Zweite
WOYZECK: {Ich muss fort.}
~ {Ein Lied}
~ {Zweite Zeile}
`;

test("Parser und Auswertung eines kleinen Inhalts", () => {
  const i = parseInhalt([{ name: "mini", text: MINI }]);
  assert.deepEqual(i.szenen.map((s) => s.id), ["a", "b"]);
  let st = neuerStand(i);
  let a = auswerten(i, st);
  assert.equal(a.aktuell.wahl.id, "a.w");
  assert.deepEqual(a.aktuell.wahl.optionen.map((o) => o.key), ["ja", "nein"], "Option mit Bedingung bleibt verborgen");
  assert.equal(weiter(i, st), null, "vor der Wahl geht es nicht weiter");
  st = waehle(i, st, "a.w", "ja");
  a = auswerten(i, st);
  assert.equal(a.vars.x, 3);
  assert.ok(a.aktuell.ende);
  const texte = a.aktuell.bloecke.map((b) => b.text);
  assert.ok(texte.includes("Viel."));
  assert.equal(a.aktuell.bloecke.find((b) => b.text === "Viel.").stelle, "a.s");
  assert.equal(a.aktuell.bloecke.find((b) => b.art === "gewaehlt").folge, "offen");
  st = weiter(i, st);
  a = auswerten(i, st);
  assert.equal(a.aktuell.szene.id, "b");
  assert.equal(a.aktuell.bloecke[0].sprecher, "WOYZECK");
  assert.equal(a.aktuell.bloecke[1].art, "lied");
  assert.ok(a.aktuell.letzte);
  assert.equal(weiter(i, st), null, "am Ende gibt es kein Weiter");
  const nein = waehle(i, neuerStand(i), "a.w", "nein");
  assert.ok(auswerten(i, nein).aktuell.bloecke.some((b) => b.text === "Null."));
  assert.throws(() => waehle(i, neuerStand(i), "a.w", "geheim"), /nicht möglich/);
});

test("Segmente trennen Büchners Wortlaut und Kursives", () => {
  assert.deepEqual(segmente("a {b _c_} d"), [
    { t: "a ", b: false, i: false }, { t: "b ", b: true, i: false }, { t: "c", b: true, i: true }, { t: " d", b: false, i: false },
  ]);
  assert.equal(woerter("{Ich muss} fort, _sagt_ er."), 5);
});

test("Fehler im Inhaltsformat werden mit Datei und Zeile gemeldet", () => {
  assert.throws(() => parseInhalt([{ name: "x", text: "## a | A\n[wenn offen >= ]\n" }]), /x:2/);
  assert.throws(() => parseInhalt([{ name: "x", text: "## a | A\n[stelle s offen]\nText\n" }]), /offene Blöcke/);
  assert.throws(() => parseInhalt([{ name: "x", text: "## a | A\n* ja (zuwenden): Ja\n" }]), /außerhalb/);
});

test("Zuhören und Abwimmeln führen zu gegensätzlichen Zuständen in allen drei Folgen", () => {
  const a = durchspielen(inhalt, strategie("zuwenden")).auswertung.vars;
  const b = durchspielen(inhalt, strategie("abwimmeln")).auswertung.vars;
  // (1) Offenheit
  assert.ok(a.offen >= 7, `offen A ${a.offen}`);
  assert.ok(b.offen <= -5, `offen B ${b.offen}`);
  assert.equal(a.weiss_zickwolf, 1);
  assert.ok(!b.weiss_zickwolf && !b.weiss_messer);
  // (2) Kräfte: Brot, Doktor, Schlaf
  assert.ok(a.kraft >= 5 && a.brot === 1 && a.doktor_ende === 1 && a.wache === 1, JSON.stringify(a));
  assert.ok(b.kraft <= 0 && !b.brot && !b.doktor_ende, JSON.stringify(b));
  // (3) Abschied
  assert.equal(a.abschied, "marie");
  assert.equal(a.teich, "gefragt");
  assert.equal(b.abschied, "liegen");
  assert.equal(b.teich, undefined);
});

test("Woyzeck hat seinen eigenen Willen: ohne Vertrauen hört er nicht auf beim Doktor", () => {
  let st = neuerStand(inhalt);
  const plan = { "feld.wahl": "singen", "professor.wahl": "brot", "tm.wahl": "schweigen", "doktor.wahl": "aufhoeren" };
  for (let n = 0; n < 50; n++) {
    const a = auswerten(inhalt, st);
    if (a.aktuell.wahl) {
      if (!plan[a.aktuell.wahl.id]) break;
      st = waehle(inhalt, st, a.aktuell.wahl.id, plan[a.aktuell.wahl.id]);
      continue;
    }
    st = weiter(inhalt, st);
  }
  const v = auswerten(inhalt, st).vars;
  assert.equal(v.brot, 1, "das Brot nimmt er");
  assert.equal(v.doktor_ende, undefined, "zum Doktor geht er trotzdem weiter");
});

test("Rat mit Vertrauen wirkt: Doktor-Ende nur mit Offenheit und Brot", () => {
  const plan = { "feld.wahl": "fragen", "professor.wahl": "brot", "tm.wahl": "sagen", "doktor.wahl": "aufhoeren" };
  let st = neuerStand(inhalt);
  for (let n = 0; n < 50; n++) {
    const a = auswerten(inhalt, st);
    if (a.aktuell.wahl) { if (!plan[a.aktuell.wahl.id]) break; st = waehle(inhalt, st, a.aktuell.wahl.id, plan[a.aktuell.wahl.id]); continue; }
    st = weiter(inhalt, st);
  }
  assert.equal(auswerten(inhalt, st).vars.doktor_ende, 1);
});

test("Option „zu Marie rennen“ gibt es nur, wenn Woyzeck sich ganz geöffnet hat", () => {
  const offenStand = durchspielen(inhalt, strategie("zuwenden")).stand;
  const vorKaserne = { szene: "kaserne", wahlen: Object.fromEntries(Object.entries(offenStand.wahlen).filter(([id]) => !["kaserne.wahl", "teich.wahl", "epilog.wahl"].includes(id))) };
  assert.ok(auswerten(inhalt, vorKaserne).aktuell.wahl.optionen.some((o) => o.key === "marie"));
  const zuStand = durchspielen(inhalt, strategie("abwimmeln")).stand;
  const vorKaserne2 = { szene: "kaserne", wahlen: Object.fromEntries(Object.entries(zuStand.wahlen).filter(([id]) => !["kaserne.wahl", "epilog.wahl"].includes(id))) };
  assert.ok(!auswerten(inhalt, vorKaserne2).aktuell.wahl.optionen.some((o) => o.key === "marie"));
});

test("Speichern und Laden: Stand übersteht Neuladen, kaputte Daten führen nicht zum Absturz", () => {
  const s = speicher();
  assert.equal(ladeStand(s, inhalt), null);
  let st = neuerStand(inhalt);
  st = waehle(inhalt, st, "feld.wahl", "fragen");
  assert.ok(speichereStand(s, st));
  assert.deepEqual(ladeStand(s, inhalt), st);
  s.daten.set(SCHLUESSEL.stand, "{kaputt");
  assert.equal(ladeStand(s, inhalt), null);
  s.daten.set(SCHLUESSEL.stand, JSON.stringify({ szene: "feld", wahlen: { "feld.wahl": "gibtsnicht", "alt.wahl": "x" } }));
  assert.deepEqual(ladeStand(s, inhalt), { szene: "feld", wahlen: {} });
  s.daten.set(SCHLUESSEL.stand, JSON.stringify({ szene: "unbekannt", wahlen: {} }));
  assert.equal(ladeStand(s, inhalt), null);
  loescheStand(s);
  assert.equal(s.daten.size, 0);
  const k = speicher({ kaputt: true });
  assert.equal(ladeStand(k, inhalt), null);
  assert.equal(speichereStand(k, st), false);
  assert.equal(ladeStand(null, inhalt), null);
});

test("Einstellungen und Leseposition", () => {
  const s = speicher();
  assert.deepEqual(ladeEinstellungen(s), { klang: false, schrift: 1, buechner: false, hinweisGesehen: false });
  speichereEinstellungen(s, { klang: true, schrift: 1.15, buechner: true, hinweisGesehen: true });
  assert.deepEqual(ladeEinstellungen(s), { klang: true, schrift: 1.15, buechner: true, hinweisGesehen: true });
  s.daten.set(SCHLUESSEL.einstellungen, JSON.stringify({ klang: "ja", schrift: 99 }));
  assert.deepEqual(ladeEinstellungen(s), { klang: false, schrift: 1, buechner: false, hinweisGesehen: false });
  speicherePosition(s, "feld", 0.4);
  assert.equal(ladePosition(s, "feld"), 0.4);
  assert.equal(ladePosition(s, "fenster"), 0);
});

test("Sicherungscode: Hin- und Rückweg für viele Stände", () => {
  let zufall = 7;
  const rnd = () => ((zufall = (zufall * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let lauf = 0; lauf < 60; lauf++) {
    let st = neuerStand(inhalt);
    const stopp = Math.floor(rnd() * 40);
    for (let n = 0; n < stopp; n++) {
      const a = auswerten(inhalt, st);
      if (a.aktuell.wahl) { const o = a.aktuell.wahl.optionen; st = waehle(inhalt, st, a.aktuell.wahl.id, o[Math.floor(rnd() * o.length)].key); continue; }
      const w = weiter(inhalt, st);
      if (!w) break;
      st = w;
    }
    const code = codeAus(st, register);
    assert.match(code, /^WOY(-[0-9A-HJKMNP-TV-Z]{1,5})+$/);
    assert.deepEqual(standAus(code, register), st, code);
    assert.deepEqual(standAus(code.toLowerCase().replace(/-/g, " "), register), st, "Kleinschreibung und Leerzeichen sind egal");
    assert.deepEqual(auswerten(inhalt, standAus(code, register)).vars, auswerten(inhalt, st).vars);
  }
});

test("Sicherungscode: Tippfehler werden erkannt, Verwechslungen O/0 und I/1 verziehen", () => {
  const st = durchspielen(inhalt, strategie("zuwenden")).stand;
  const code = codeAus(st, register);
  const roh = code.slice(4).replace(/-/g, "");
  for (let i = 0; i < roh.length; i++) {
    const anders = roh.slice(0, i) + (roh[i] === "7" ? "8" : "7") + roh.slice(i + 1);
    assert.equal(standAus(anders, register), null, `Fehler an Stelle ${i} nicht erkannt`);
  }
  assert.equal(standAus("", register), null);
  assert.equal(standAus("WOY-UUUU", register), null);
  assert.equal(standAus("Hallo Welt", register), null);
  assert.deepEqual(standAus(code.replace(/0/g, "O").replace(/1/g, "I"), register), st);
});

test("Bereinigen lässt nur bekannte Szenen und Optionen durch", () => {
  assert.equal(bereinige(inhalt, null), null);
  assert.equal(bereinige(inhalt, { szene: 5 }), null);
  assert.deepEqual(bereinige(inhalt, { szene: "hof", wahlen: { "feld.wahl": "fragen", "x.y": "z", "hof.wahl": 3 } }), { szene: "hof", wahlen: { "feld.wahl": "fragen" } });
});
