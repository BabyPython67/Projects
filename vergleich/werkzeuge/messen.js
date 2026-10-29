// Messungen für den Vergleich Rungholt / Moorlicht.
// Spielt beide Spiele über ihre eigene Spiellogik (ohne Browser) automatisiert durch und misst,
// was die Fragen im Bericht stützt: Länge einer Nacht, Zahl und Art der Entscheidungen, wie sehr
// gutes Spielen zählt, Abwechslung zwischen Nächten, Tempo der Freischaltungen und Umfang der Texte.
// Ändert an den Spielen nichts, liest nur deren engine-Dateien.
//
// Aufruf aus dem Repo-Hauptordner:  node vergleich/werkzeuge/messen.js [Nächte] [Spieler]
// Ergebnis: Tabellen auf der Konsole und vergleich/werkzeuge/ergebnisse.json

"use strict";
const fs = require("fs");
const path = require("path");
const R = require("../../spiele/rungholt/engine.js");
const M = require("../../spiele/moorlicht/js/engine.js");
const MB = require("../../spiele/moorlicht/tests/bot.js");

const NAECHTE = Number(process.argv[2]) || 500;   // Nächte je Messung
const SPIELER = Number(process.argv[3]) || 100;   // simulierte Spieler für die Fortschritts-Kurve
const FORTSCHRITT_NAECHTE = 60;                   // so viele Nächte spielt jeder simulierte Spieler

/* ---------- kleine Hilfen ---------- */
function rng(seed) { // mulberry32, nur für die Zufallsspieler und Startzahlen dieses Werkzeugs
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const wahl = (r, liste) => liste[Math.floor(r() * liste.length)];
const mittel = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
function median(xs) {
  const s = xs.filter((x) => x !== null && x !== undefined).sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
const anteil = (xs, f) => xs.filter(f).length / Math.max(1, xs.length);
const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  const schnitt = [...A].filter((x) => B.has(x)).length;
  const verein = new Set([...A, ...B]).size;
  return verein ? schnitt / verein : 1;
};
const woerter = (t) => String(t).split(/\s+/).filter(Boolean).length;
const r1 = (x) => Math.round(x * 10) / 10;
const pz = (x) => Math.round(x * 1000) / 10;

/* =====================================================================
   RUNGHOLT
   ===================================================================== */
const RG = {
  // Alle erlaubten Züge auf dem aktuellen Bildschirm, mit Einordnung als echte Entscheidung.
  optionen(g) {
    const s = g.screen;
    if (s === "map") {
      const o = g.options.map((n, i) => ({ a: { type: "node", i }, art: n.type }));
      return { ort: "karte", o, echt: new Set(o.map((x) => x.art)).size >= 2 };
    }
    if (s === "event") {
      const o = R.EVENTS[g.event].choices.map((c, i) => ({ a: { type: "event", i } }));
      return { ort: "ereignis", o, echt: o.length >= 2 };
    }
    if (s === "rest") {
      const o = g.restOptions.map((x, i) => ({ a: { type: "rest", i }, aus: x.disabled })).filter((x) => !x.aus);
      return { ort: "rast", o, echt: o.length >= 2 };
    }
    if (s === "upgrade") {
      const o = g.gear.map((x, i) => ({ a: { type: "upgrade", i }, aus: x.plus })).filter((x) => !x.aus);
      return { ort: "verbessern", o, echt: o.length >= 2 };
    }
    if (s === "reward") {
      const o = g.rewardOptions.map((x, i) => ({ a: { type: "reward", i } })).concat([{ a: { type: "skip" } }]);
      return { ort: "belohnung", o, echt: g.rewardOptions.length >= 2 };
    }
    if (s === "drop") {
      const o = g.gear.map((x, i) => ({ a: { type: "drop", i } }));
      return { ort: "ablegen", o, echt: o.length >= 2 };
    }
    if (s === "fight") {
      const o = [];
      const wirkungen = new Set();
      g.dice.forEach((d, di) => g.gear.forEach((x, gi) => {
        if (!g.fits(d, x)) return;
        const def = g.gearDef(x);
        wirkungen.add(def.rule.kind === "count" ? "sammeln" : def.effect.kind);
        o.push({ a: { type: "place", die: di, gear: gi } });
      }));
      o.push({ a: { type: "end" } });
      // echt: mindestens zwei verschiedene Wirkungen stehen zur Wahl (z. B. Schlag oder Schutz)
      return { ort: "begegnung", o, echt: wirkungen.size >= 2, wuerfelZug: o.length > 1 };
    }
    return { ort: s, o: [], echt: false };
  },
  ausfuehren(g, a) {
    if (a.type === "skip") return g.skipReward();
    return R.act(g, a);
  },
  // Zwei einfache Gegenstile zum Autopiloten, nur in der Begegnung anders:
  // draufgaenger setzt jeden Würfel auf den stärksten Schlag, vorsichtig zuerst auf Schutz und Heilung.
  stilZug(g, stil) {
    if (g.screen !== "fight") return R.choose(g);
    const intent = g.intent;
    const kommt = intent && !intent.stunned ? intent.damage : 0;
    let best = null;
    g.dice.forEach((d, di) => g.gear.forEach((x, gi) => {
      if (!g.fits(d, x)) return;
      const def = g.gearDef(x);
      const e = def.effect;
      let w;
      if (def.rule.kind === "count") w = 1 + d.v * 0.1;
      else if (stil === "draufgaenger") w = e.kind === "hit" ? 10 + g.amount(e, d.v) : 0.5;
      else if (e.kind === "shield") w = kommt > g.shield ? 20 + g.amount(e, d.v) : 0.5;
      else if (e.kind === "heal") w = g.mut < g.maxMut ? 15 + g.amount(e, d.v) : 0.5;
      else if (e.kind === "stun" || e.kind === "weaken") w = kommt > 0 ? 18 : 0.5;
      else if (e.kind === "hit") w = 5 + g.amount(e, d.v);
      else w = 0.2;
      if (!best || w > best.w) best = { w, di, gi };
    }));
    return best ? { type: "place", die: best.di, gear: best.gi } : { type: "end" };
  },
  // Eine Nacht spielen. stil: "bot" (Autopilot des Spiels) oder "zufall" (gleichverteilt über erlaubte Züge)
  nacht(seed, stil, profil, zr, kit, springflut) {
    const g = new R.Game({ seed, kit: kit || "wattlaeuferin", springflut: springflut || 0, unlocked: profil ? profil.gear : R.BASE_GEAR });
    const z = { eingaben: 0, punkte: 0, echt: 0, jeOrt: {}, optionenSumme: 0, gesehen: new Set(), angeboten: new Set() };
    let schutz = 0;
    while (!g.over && schutz++ < 5000) {
      if (g.screen === "fight" && g.enemy) z.gesehen.add("gegner:" + g.enemy.id);
      if (g.screen === "event") z.gesehen.add("ereignis:" + g.event);
      if (g.screen === "reward") g.rewardOptions.forEach((x) => z.angeboten.add("gegenstand:" + x.id));
      const op = RG.optionen(g);
      let a;
      if (stil === "bot") a = R.choose(g);
      else if (stil === "zufall") a = wahl(zr, op.o).a;
      else a = RG.stilZug(g, stil);
      // Zählung: Würfel-Zuordnung gilt als Entscheidung, wenn mehr als "Runde beenden" möglich ist
      const zaehlt = op.ort === "begegnung" ? op.wuerfelZug : op.o.length >= 2;
      if (zaehlt) {
        z.punkte++;
        z.optionenSumme += op.o.length;
        if (op.echt) z.echt++;
        z.jeOrt[op.ort] = z.jeOrt[op.ort] || { punkte: 0, echt: 0 };
        z.jeOrt[op.ort].punkte++;
        if (op.echt) z.jeOrt[op.ort].echt++;
      }
      if (!RG.ausfuehren(g, a)) break;
      z.eingaben++;
    }
    const s = g.summary();
    return { g, s, z, sieg: s.won, fortschritt: s.stretch - 1 + (s.won ? 1 : 0), schritte: g.step };
  }
};

/* =====================================================================
   MOORLICHT
   ===================================================================== */
const ML = {
  optionen(run) {
    const p = run.phase;
    if (p === "karte") {
      const o = M.offeneKnoten(run).map((k) => ({ a: { t: "reisen", k }, art: M.knotenAn(run, k.reihe, k.index).typ }));
      return { ort: "karte", o, echt: new Set(o.map((x) => x.art)).size >= 2 };
    }
    if (p === "station") {
      const st = run.station;
      if (st.status === "flackert") {
        const o = ["johanniskraut", "wachs"].filter((k) => M.krautMoeglich(run, k)).map((k) => ({ a: { t: "kraut", k } }));
        o.push({ a: { t: "erloeschen" } });
        return { ort: "station", o, echt: o.length >= 2 };
      }
      if (st.status !== "offen") return { ort: "abschluss", o: [{ a: { t: "abschliessen" } }], echt: false };
      const o = [];
      if (st.stapel.length) o.push({ a: { t: "ziehen" } });
      o.push({ a: { t: "weiter" } });
      for (const k of Object.keys(M.I.KRAEUTER)) if (M.krautMoeglich(run, k)) o.push({ a: { t: "kraut", k } });
      // echt: Ziehen kann die Laterne löschen (Risiko > 0) und Weitergehen ist erlaubt
      return { ort: "station", o, echt: st.stapel.length > 0 && M.gefahr(run) > 0 };
    }
    if (p === "fang") {
      const o = run.angebot.arten.map((x, i) => ({ a: { t: "fangen", i } })).concat([{ a: { t: "fangen", i: null } }]);
      return { ort: "fang", o, echt: run.angebot.arten.length >= 2 };
    }
    if (p === "beute") {
      const o = run.angebot.talismane.map((x, i) => ({ a: { t: "beute", i } }));
      if (!o.length) o.push({ a: { t: "beute", i: null } });
      return { ort: "beute", o, echt: o.length >= 2 };
    }
    if (p === "rast") {
      const ids = [...new Set(run.glas)].filter((id) => M.entfernbar(run, id));
      const o = [{ a: { t: "rast", w: "docht" } }].concat(ids.map((id) => ({ a: { t: "rast", w: "sichten", id } })));
      return { ort: "rast", o, echt: o.length >= 2 };
    }
    if (p === "haendler") {
      const o = run.angebot.waren.map((w, i) => i).filter((i) => M.kaufbar(run, i)).map((i) => ({ a: { t: "kaufen", i } }));
      const ids = [...new Set(run.glas)].filter((id) => M.entfernbar(run, id) && run.glanz >= M.austreibenKosten(run));
      for (const id of ids) o.push({ a: { t: "austreiben", id } });
      o.push({ a: { t: "verlassen" } });
      return { ort: "kraemerin", o, echt: o.length >= 2 };
    }
    if (p === "fund") {
      if (run.fund.ergebnis) return { ort: "abschluss", o: [{ a: { t: "fundzu" } }], echt: false };
      const f = M.fundDaten(run.fund);
      const o = f.optionen.map((x, i) => i).filter((i) => M.optionMoeglich(run, f.optionen[i])).map((i) => ({ a: { t: "fund", i } }));
      return { ort: "fund", o, echt: o.length >= 2 };
    }
    return { ort: p, o: [], echt: false };
  },
  ausfuehren(run, a) {
    switch (a.t) {
      case "reisen": return M.reisen(run, a.k.reihe, a.k.index);
      case "ziehen": return !!M.ziehen(run);
      case "weiter": return !!M.weitergehen(run);
      case "kraut": return M.krautNutzen(run, a.k);
      case "erloeschen": return M.erloeschenLassen(run);
      case "abschliessen": return M.stationAbschliessen(run);
      case "fangen": return M.fangen(run, a.i);
      case "beute": return M.beuteWaehlen(run, a.i);
      case "rast": return M.rasten(run, a.w, a.id);
      case "kaufen": return M.kaufen(run, a.i);
      case "austreiben": return M.austreiben(run, a.id);
      case "verlassen": return M.haendlerVerlassen(run);
      case "fund": return !!M.fundWaehlen(run, a.i);
      case "fundzu": return M.fundAbschliessen(run);
    }
    return false;
  },
  nacht(seed, stil, meta, zr, laterne, mondphase) {
    const run = M.neuerLauf({ seed, laterne: laterne || "sturm", mondphase: mondphase || 0, meta: meta || M.neueMeta() });
    const z = { eingaben: 0, punkte: 0, echt: 0, jeOrt: {}, optionenSumme: 0, gesehen: new Set(), angeboten: new Set() };
    let schutz = 0;
    while (run.phase !== "ende" && schutz++ < 20000) {
      if (run.phase === "station" && run.station.mods.length) z.gesehen.add("besonderheit:" + run.station.mods[0]);
      if (run.phase === "station" && run.station.waechter) z.gesehen.add("waechter:" + run.station.waechter);
      if (run.phase === "fund" && !run.fund.ergebnis) z.gesehen.add("fund:" + run.fund.id);
      if (run.phase === "fang") run.angebot.arten.forEach((x) => z.angeboten.add("funke:" + x));
      const op = ML.optionen(run);
      if (op.o.length >= 2) {
        z.punkte++;
        z.optionenSumme += op.o.length;
        if (op.echt) z.echt++;
        z.jeOrt[op.ort] = z.jeOrt[op.ort] || { punkte: 0, echt: 0 };
        z.jeOrt[op.ort].punkte++;
        if (op.echt) z.jeOrt[op.ort].echt++;
      }
      if (stil === "zufall") {
        if (!op.o.length) break;
        if (!ML.ausfuehren(run, wahl(zr, op.o).a)) break;
      } else {
        MB.botZug(run, stil);
      }
      z.eingaben++;
    }
    const sieg = !!(run.ende && run.ende.sieg);
    return { run, z, sieg, fortschritt: run.region + (sieg ? 1 : 0), schritte: run.statistik.schritte };
  }
};

/* =====================================================================
   1. Eine Nacht: Länge, Entscheidungen, Ausgang (Grundstand ohne Freischaltungen)
   ===================================================================== */
function nachtMessung(spiel, stil) {
  const zr = rng(424242);
  const laeufe = [];
  for (let i = 1; i <= NAECHTE; i++) {
    const seed = i * 7919 + 13;
    laeufe.push(spiel === "rungholt" ? RG.nacht(seed, stil, null, zr) : ML.nacht(seed, stil, null, zr));
  }
  const orte = {};
  for (const l of laeufe) for (const [k, v] of Object.entries(l.z.jeOrt)) {
    orte[k] = orte[k] || { punkte: 0, echt: 0 };
    orte[k].punkte += v.punkte; orte[k].echt += v.echt;
  }
  for (const k of Object.keys(orte)) { orte[k].punkte = r1(orte[k].punkte / laeufe.length); orte[k].echt = r1(orte[k].echt / laeufe.length); }
  const ende = laeufe.map((l) => l.fortschritt);
  return {
    naechte: laeufe.length,
    sieg: pz(anteil(laeufe, (l) => l.sieg)),
    // Anteil der Nächte, die mindestens Abschnitt 2 bzw. 3 erreichen (Abschnitt = Strecke bzw. Region)
    abschnitt2: pz(anteil(ende, (x) => x >= 1)),
    abschnitt3: pz(anteil(ende, (x) => x >= 2)),
    eingabenMittel: r1(mittel(laeufe.map((l) => l.z.eingaben))),
    eingabenMedian: median(laeufe.map((l) => l.z.eingaben)),
    entscheidungenMittel: r1(mittel(laeufe.map((l) => l.z.punkte))),
    echteMittel: r1(mittel(laeufe.map((l) => l.z.echt))),
    echteSiegMittel: r1(mittel(laeufe.filter((l) => l.sieg).map((l) => l.z.echt))),
    echteAnteil: pz(mittel(laeufe.map((l) => l.z.echt / Math.max(1, l.z.punkte)))),
    optionenJeEntscheidung: r1(mittel(laeufe.map((l) => l.z.optionenSumme / Math.max(1, l.z.punkte)))),
    kartenSchritte: r1(mittel(laeufe.map((l) => l.schritte))),
    jeOrt: orte,
    _laeufe: laeufe
  };
}

/* =====================================================================
   2. Abwechslung: Wie ähnlich sind zwei Nächte?
   ===================================================================== */
function abwechslung(messung, spiel) {
  const L = messung._laeufe;
  // Nur der erste Abschnitt, damit "wie weit kam man" das Ergebnis nicht verzerrt
  const erster = (l) => {
    const x = [...l.z.gesehen];
    return spiel === "rungholt"
      ? x.filter((id) => { const e = R.ENEMIES[id.split(":")[1]]; const ev = R.EVENTS[id.split(":")[1]]; return (e && e.stretch === 1) || (ev && ev.stretch.includes(1)); })
      : x;
  };
  const js = [];
  for (let i = 0; i + 1 < L.length; i += 2) js.push(jaccard([...L[i].z.gesehen, ...L[i].z.angeboten], [...L[i + 1].z.gesehen, ...L[i + 1].z.angeboten]));
  // Kartenbild: Abfolge der Knotentypen der ersten Strecke/Region als Text
  const bilder = new Set();
  L.forEach((l) => {
    if (spiel === "rungholt") bilder.add(l.g.map.slice(0, 4).map((s) => s.map((n) => n.type[0]).join("")).join("|"));
    else bilder.add(l.run.karten[0].reihen.map((r) => r.map((k) => k.typ[0]).join("")).join("|"));
  });
  return { aehnlichkeitZweierNaechte: pz(mittel(js)), verschiedeneKartenErsterAbschnitt: pz(bilder.size / L.length) };
}

/* =====================================================================
   3. Fortschritt über viele Nächte: Freischaltungen, Geschichte, "etwas Neues"
   ===================================================================== */
function fortschrittRungholt(spielerNr, neugierig) {
  let p = R.newProfile();
  const zr = rng(1000 + spielerNr);
  const ereignisse = { ersterSieg: null, freischaltung: {}, chronikVoll: null, alleGegenstaende: null };
  const neuJeNacht = [];
  const neuGJeNacht = [];   // nur Freischaltungen und Geschichtstexte, ohne "erstmals gesehen"
  const chronikJeNacht = [];
  const gesehen = new Set();
  for (let n = 1; n <= FORTSCHRITT_NAECHTE; n++) {
    const seed = Math.floor(zr() * 2 ** 31);
    const kit = neugierig ? p.kits[(n - 1) % p.kits.length] : "wattlaeuferin";
    const { s, z } = RG.nacht(seed, "bot", p, null, kit, neugierig ? p.springflut : 0);
    const r = R.updateProfile(p, s, null);
    p = r.profile;
    let neu = r.neu.gear.length + r.neu.kits.length + r.neu.chronik.length;
    neuGJeNacht.push(neu > 0);
    for (const id of [...z.gesehen]) if (!gesehen.has(id)) { gesehen.add(id); neu++; }
    neuJeNacht.push(neu > 0);
    chronikJeNacht.push(p.chronik.length);
    for (const u of r.neu.unlocks) ereignisse.freischaltung[u] = n;
    if (s.won && ereignisse.ersterSieg === null) ereignisse.ersterSieg = n;
    if (p.chronik.length >= R.CHRONIK.length && ereignisse.chronikVoll === null) ereignisse.chronikVoll = n;
    if (p.springflut >= 3 && ereignisse.hoechsteStufe === undefined) ereignisse.hoechsteStufe = n;
    if (p.gear.length >= Object.keys(R.GEAR).length && ereignisse.alleGegenstaende === null) ereignisse.alleGegenstaende = n;
  }
  return { ereignisse, neuJeNacht, neuGJeNacht, chronikJeNacht };
}

function fortschrittMoorlicht(spielerNr, neugierig) {
  const meta = M.neueMeta();
  const zr = rng(2000 + spielerNr);
  const ereignisse = { ersterSieg: null, freischaltung: {}, alleNotizen: null, alleFreischaltungen: null, wahresEnde: null };
  const neuJeNacht = [];
  const neuGJeNacht = [];
  const notizenJeNacht = [];
  const gesehen = new Set();
  // Gespräche vor der ersten Nacht lesen
  for (const g of M.gespraeche(meta)) M.gespraechGelesen(meta, g.id);
  for (let n = 1; n <= FORTSCHRITT_NAECHTE; n++) {
    const seed = Math.floor(zr() * 2 ** 31);
    const lat = M.laternenFrei(meta);
    const { run, z } = ML.nacht(seed, "abwaegend", meta, null, neugierig ? lat[(n - 1) % lat.length] : "sturm", neugierig ? meta.mondphaseFrei : 0);
    const bilanz = M.laufAuswerten(meta, run);
    let neu = bilanz.neueNotizen.length + bilanz.neu.length;
    let neuG = bilanz.neueNotizen.length;
    if (meta.freigeschaltet.includes("gebunden") && !ereignisse.freischaltung.gebunden) { ereignisse.freischaltung.gebunden = n; neuG++; }
    for (const id of [...z.gesehen]) if (!gesehen.has(id)) { gesehen.add(id); neu++; }
    // Freischaltungen kaufen, billigste zuerst (Reihenfolge der Liste ist nach Preis sortiert)
    let gekauft = true;
    while (gekauft) {
      gekauft = false;
      for (const f of M.I.FREISCHALTUNGEN) {
        if (M.freischalten(meta, f.id)) { ereignisse.freischaltung[f.id] = n; neu++; neuG++; gekauft = true; break; }
      }
    }
    // Gespräche im Dorf lesen: zählt als Neues
    for (const g of M.gespraeche(meta)) { M.gespraechGelesen(meta, g.id); neu++; neuG++; }
    neuJeNacht.push(neu > 0);
    neuGJeNacht.push(neuG > 0);
    notizenJeNacht.push(meta.notizen.length);
    if (run.ende.sieg && ereignisse.ersterSieg === null) ereignisse.ersterSieg = n;
    if (meta.notizen.length >= M.I.NOTIZEN.length && ereignisse.alleNotizen === null) ereignisse.alleNotizen = n;
    if (meta.freigeschaltet.filter((x) => x !== "gebunden").length >= M.I.FREISCHALTUNGEN.length && ereignisse.alleFreischaltungen === null) ereignisse.alleFreischaltungen = n;
    if (meta.wahresEnde && ereignisse.wahresEnde === null) ereignisse.wahresEnde = n;
    if (meta.mondphaseFrei >= 5 && ereignisse.hoechsteStufe === undefined) ereignisse.hoechsteStufe = n;
  }
  return { ereignisse, neuJeNacht, neuGJeNacht, notizenJeNacht };
}

function fortschrittZusammenfassen(spiel, neugierig) {
  const alle = [];
  for (let i = 0; i < SPIELER; i++) alle.push(spiel === "rungholt" ? fortschrittRungholt(i, neugierig) : fortschrittMoorlicht(i, neugierig));
  // Median über alle Spieler; wer das Ziel in FORTSCHRITT_NAECHTE Nächten nie erreicht, zählt als "später".
  // Liegt der Median dort, steht im Ergebnis ">60".
  const med = (f) => {
    const xs = alle.map(f).map((x) => (x === null || x === undefined ? Infinity : x)).sort((p, q) => p - q);
    const m = xs.length % 2 ? xs[(xs.length - 1) / 2] : (xs[xs.length / 2 - 1] + xs[xs.length / 2]) / 2;
    return Number.isFinite(m) ? m : ">" + FORTSCHRITT_NAECHTE;
  };
  const nie = (f) => pz(anteil(alle, (x) => f(x) === null));
  // Letzte Nacht, nach der noch etwas Neues kam (Median), und Anteil Nächte mit Neuem in Nacht 1-5, 6-10, 11-20, 21-40
  const letzteNeu = med((x) => { let l = 0; x.neuJeNacht.forEach((v, i) => { if (v) l = i + 1; }); return l; });
  const fenster = (a, b, k) => pz(mittel(alle.map((x) => mittel(x[k || "neuJeNacht"].slice(a - 1, b).map((v) => (v ? 1 : 0))))));
  const letzteNeuG = med((x) => { let l = 0; x.neuGJeNacht.forEach((v, i) => { if (v) l = i + 1; }); return l; });
  const out = {
    spieler: SPIELER, naechteJeSpieler: FORTSCHRITT_NAECHTE,
    ersterSiegMedian: med((x) => x.ereignisse.ersterSieg), ohneSieg: nie((x) => x.ereignisse.ersterSieg),
    neuInNacht1bis5: fenster(1, 5), neuInNacht6bis10: fenster(6, 10), neuInNacht11bis20: fenster(11, 20), neuInNacht21bis40: fenster(21, 40),
    letzteNachtMitNeuemMedian: letzteNeu,
    nurGeschichteUndFreischaltung: {
      neuInNacht1bis5: fenster(1, 5, "neuGJeNacht"), neuInNacht6bis10: fenster(6, 10, "neuGJeNacht"),
      neuInNacht11bis20: fenster(11, 20, "neuGJeNacht"), neuInNacht21bis40: fenster(21, 40, "neuGJeNacht"),
      letzteNachtMitNeuemMedian: letzteNeuG
    },
    hoechsteStufeMedian: med((x) => x.ereignisse.hoechsteStufe === undefined ? null : x.ereignisse.hoechsteStufe),
    hoechsteStufeNie: nie((x) => x.ereignisse.hoechsteStufe === undefined ? null : x.ereignisse.hoechsteStufe),
    freischaltungen: {}
  };
  const ids = spiel === "rungholt" ? R.UNLOCKS.map((u) => u.id) : M.I.FREISCHALTUNGEN.map((f) => f.id).concat(["gebunden"]);
  for (const id of ids) out.freischaltungen[id] = { median: med((x) => x.ereignisse.freischaltung[id] || null), nie: nie((x) => x.ereignisse.freischaltung[id] || null) };
  if (spiel === "rungholt") {
    out.chronikVollMedian = med((x) => x.ereignisse.chronikVoll); out.chronikNie = nie((x) => x.ereignisse.chronikVoll);
    out.alleGegenstaendeMedian = med((x) => x.ereignisse.alleGegenstaende);
    out.chronikNachNacht = [1, 3, 5, 10, 20].map((n) => r1(mittel(alle.map((x) => x.chronikJeNacht[n - 1]))));
  } else {
    out.alleNotizenMedian = med((x) => x.ereignisse.alleNotizen); out.alleNotizenNie = nie((x) => x.ereignisse.alleNotizen);
    out.alleFreischaltungenMedian = med((x) => x.ereignisse.alleFreischaltungen);
    out.wahresEndeMedian = med((x) => x.ereignisse.wahresEnde); out.wahresEndeNie = nie((x) => x.ereignisse.wahresEnde);
    out.notizenNachNacht = [1, 3, 5, 10, 20].map((n) => r1(mittel(alle.map((x) => x.notizenJeNacht[n - 1]))));
  }
  return out;
}

/* =====================================================================
   4. Umfang der Inhalte
   ===================================================================== */
function umfang() {
  const rText = {
    chronik: R.CHRONIK.reduce((a, c) => a + woerter(c.text), 0),
    ereignisse: Object.values(R.EVENTS).reduce((a, e) => a + woerter(e.text) + e.choices.reduce((b, c) => b + woerter(c.label), 0), 0),
    figuren: Object.values(R.ENEMIES).reduce((a, e) => a + woerter(e.text), 0) + Object.values(R.GEAR).reduce((a, g) => a + woerter(g.flavor), 0)
  };
  const I = M.I;
  const mText = {
    notizen: I.NOTIZEN.reduce((a, t) => a + woerter(t), 0),
    gespraeche: I.GESPRAECHE.reduce((a, g) => a + woerter(g.text), 0),
    funde: I.FUNDE.reduce((a, f) => a + woerter(f.text) + f.optionen.reduce((b, o) => b + woerter(o.text) + woerter(o.folge || "") + woerter(o.hinweis || ""), 0), 0),
    figuren: Object.values(I.ARTEN).reduce((a, x) => a + woerter(x.notiz || ""), 0) + Object.values(I.TALISMANE).reduce((a, t) => a + woerter(t.text), 0)
      + Object.values(I.WAECHTER).reduce((a, w) => a + woerter(w.text), 0) + I.REGIONEN.reduce((a, r) => a + woerter(r.text), 0),
    texte: JSON.stringify(I.TEXTE).split(/\s+/).length
  };
  return {
    rungholt: {
      gegenstaende: Object.keys(R.GEAR).length, gegenstaendeAmAnfang: R.BASE_GEAR.length, gegnerGesamt: Object.keys(R.ENEMIES).length,
      ereignisse: Object.keys(R.EVENTS).length, chronikBlaetter: R.CHRONIK.length, gefaehrten: Object.keys(R.KITS).length,
      schwierigkeitsstufen: 3, abschnitte: R.STRETCHES.length, woerter: rText, woerterGesamt: Object.values(rText).reduce((a, b) => a + b, 0)
    },
    moorlicht: {
      funkenarten: Object.keys(I.ARTEN).length, funkenAmAnfang: I.BASIS_ARTEN.length + 3 /* drei Irrlicht-Stufen */, talismane: Object.keys(I.TALISMANE).length,
      talismaneAmAnfang: I.BASIS_TALISMANE.length, kraeuter: Object.keys(I.KRAEUTER).length, besonderheiten: Object.keys(I.MODS).length,
      funde: I.FUNDE.length, notizen: I.NOTIZEN.length, gespraeche: I.GESPRAECHE.length, laternen: Object.keys(I.LATERNEN).length,
      freischaltungen: I.FREISCHALTUNGEN.length, schwierigkeitsstufen: I.MONDPHASEN.length - 1, abschnitte: I.REGIONEN.length,
      erinnerungenFuerAlles: I.FREISCHALTUNGEN.reduce((a, f) => a + f.preis, 0),
      woerter: mText, woerterGesamt: Object.values(mText).reduce((a, b) => a + b, 0)
    }
  };
}

/* =====================================================================
   Ausführen
   ===================================================================== */
const t0 = Date.now();
const ergebnis = { stand: new Date().toISOString().slice(0, 10), naechte: NAECHTE, spieler: SPIELER, rungholt: {}, moorlicht: {} };
for (const [spiel, stile] of [["rungholt", ["bot", "draufgaenger", "vorsichtig", "zufall"]], ["moorlicht", ["abwaegend", "draufgaenger", "angsthase", "zufall"]]]) {
  for (const stil of stile) {
    const m = nachtMessung(spiel, stil);
    if (stil === stile[0]) ergebnis[spiel].abwechslung = abwechslung(m, spiel);
    delete m._laeufe;
    ergebnis[spiel]["nacht_" + stil] = m;
  }
  ergebnis[spiel].fortschritt = fortschrittZusammenfassen(spiel, false);
  ergebnis[spiel].fortschrittNeugierig = fortschrittZusammenfassen(spiel, true);
}
ergebnis.umfang = umfang();
ergebnis.laufzeitSekunden = r1((Date.now() - t0) / 1000);

const ziel = path.join(__dirname, "ergebnisse.json");
fs.writeFileSync(ziel, JSON.stringify(ergebnis, null, 2) + "\n");
console.log(JSON.stringify(ergebnis, null, 2));
console.error(`\nGeschrieben: ${path.relative(process.cwd(), ziel)} (${ergebnis.laufzeitSekunden} s)`);
