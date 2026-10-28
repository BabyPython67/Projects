// Tests der Spiellogik. Aufruf: node --test moorlicht/tests/engine.test.js (Node ab 18, keine Pakete).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const M = require("../js/engine.js");
const { spielen } = require("./bot.js");
const { ARTEN, NOTIZEN, FREISCHALTUNGEN } = M.I;

// Legt einen Lauf an, betritt die erste Station und ersetzt deren Glas: ids[0] wird zuerst gezogen.
function station(ids, opt) {
  const o = opt || {};
  const run = M.neuerLauf({ seed: 5 });
  run.talismane = o.talismane || [];
  run.kraeuter = o.kraeuter || [];
  assert.ok(M.reisen(run, 0, 0));
  const st = run.station;
  st.stapel = ids.slice().reverse();
  st.dunkel = o.dunkel !== undefined ? o.dunkel : 5;
  st.schwelle = o.schwelle !== undefined ? o.schwelle : 7;
  st.mods = o.mods || [];
  st.waechter = o.waechter || null;
  st.licht = o.licht || 0;
  st.lohn = 2;
  return run;
}
const alleZiehen = (run, n) => { const ev = []; for (let i = 0; i < n; i++) ev.push(M.ziehen(run)); return ev; };

test("gleicher Seed ergibt dieselbe Nacht, anderer Seed eine andere", () => {
  const a = M.neuerLauf({ seed: 42 }), b = M.neuerLauf({ seed: 42 }), c = M.neuerLauf({ seed: 43 });
  assert.deepEqual(a.karten, b.karten);
  assert.notDeepEqual(a.karten, c.karten);
  spielen(a, "abwaegend"); spielen(b, "abwaegend");
  assert.deepEqual(a.statistik, b.statistik);
  assert.equal(a.glanz, b.glanz);
});

test("Startglas und Werte der drei Laternen", () => {
  const s = M.neuerLauf({ seed: 1 });
  assert.equal(s.glas.length, 15);
  assert.equal(s.glas.filter((id) => ARTEN[id].irr).reduce((a, id) => a + ARTEN[id].kaelte, 0), 11);
  assert.deepEqual([s.docht, s.dochtMax, s.schwelle], [6, 6, 7]);
  const k = M.neuerLauf({ seed: 1, laterne: "kupfer" });
  assert.equal(k.glas.filter((id) => id === "gleichtakt").length, 3);
  assert.deepEqual(k.talismane, []);
  const p = M.neuerLauf({ seed: 1, laterne: "papier" });
  assert.deepEqual([p.docht, p.schwelle], [4, 8]);
  assert.equal(M.neuerLauf({ seed: 1, laterne: "gibtsnicht" }).laterne, "sturm");
});

test("Funken bringen Licht nach ihren Regeln", () => {
  let run = station(["gluehwuermchen", "leuchtkaefer"]);
  assert.deepEqual(alleZiehen(run, 2).map((e) => e.licht), [1, 4]);
  run = station(["gleichtakt", "gleichtakt", "gleichtakt", "gleichtakt", "gleichtakt"]);
  assert.deepEqual(alleZiehen(run, 5).map((e) => e.licht), [1, 2, 3, 4, 4], "Gleichtakt steigt bis 4");
  run = station(["gleichtakt", "gleichtakt"], { talismane: ["taktstock"], mods: ["mondschein"] });
  assert.deepEqual(alleZiehen(run, 2).map((e) => e.licht), [3, 4]);
  run = station(["mondmotte", "irrlicht1", "leuchtkaefer", "gluehwuermchen"]);
  assert.deepEqual(alleZiehen(run, 4).map((e) => e.licht), [0, 0, 8, 1], "Mondmotte verdoppelt den nächsten leuchtenden Funken");
  run = station(["mondmotte", "leuchtkaefer"], { talismane: ["spiegel"] });
  assert.equal(alleZiehen(run, 2)[1].licht, 12);
  run = station(["gluehwuermchen", "gluehwuermchen", "gluehwuermchen", "funkenflieger"]);
  assert.equal(alleZiehen(run, 4)[3].licht, 3, "Funkenflieger zählt die Funken davor");
  run = station(["gluehwuermchen"], { waechter: "nebelfrau" });
  assert.equal(M.ziehen(run).licht, 2);
  run = station(["johannis"], { mods: ["birkenlicht"] });
  assert.equal(M.ziehen(run).licht, 2);
});

test("Kälte, Wärme, Nachtfalter, Mondstein und Schwarzes Wasser", () => {
  let run = station(["irrlicht2", "johannis"]);
  alleZiehen(run, 2);
  assert.equal(run.station.kaelte, 1, "Johanniswürmchen wärmt um 1");
  run = station(["irrlicht2", "johannis"], { talismane: ["tauperle"] });
  alleZiehen(run, 2);
  assert.equal(run.station.kaelte, 0, "Tauperle verdoppelt die Wärme, aber nicht unter 0");
  run = station(["nachtfalter", "irrlicht3", "irrlicht1"]);
  const ev = alleZiehen(run, 3);
  assert.equal(ev[1].gefangen, true);
  assert.equal(run.station.kaelte, 1, "nur das zweite Irrlicht friert");
  run = station(["nachtfalter", "irrlicht3"], { mods: ["wind"] });
  alleZiehen(run, 2);
  assert.equal(run.station.kaelte, 3, "Wind: Nachtfalter wirkt nicht");
  run = station(["irrlicht3", "irrlicht3"], { talismane: ["mondstein"] });
  alleZiehen(run, 2);
  assert.equal(run.station.kaelte, 3, "Mondstein: erstes Irrlicht friert nicht");
  run = station(["irrlicht1", "irrlicht2"], { mods: ["schwarzwasser"] });
  alleZiehen(run, 2);
  assert.equal(run.station.kaelte, 4);
  run = station(["irrlicht1", "irrlicht1"], { waechter: "moorkoenig", dunkel: 8 });
  alleZiehen(run, 2);
  assert.equal(run.station.dunkel, 12, "Moorkönig wächst je Irrlicht um 2");
  run = station(["irrlicht2"], { waechter: "alma" });
  assert.equal(M.ziehen(run).licht, 2, "am großen Irrlicht bringen Irrlichter Licht");
});

test("Über der Schwelle erlischt die Laterne: −2 Docht, kein Glanz", () => {
  const run = station(["gluehwuermchen", "irrlicht3", "irrlicht3", "irrlicht2", "gluehwuermchen"]);
  const ev = alleZiehen(run, 4);
  assert.equal(ev[3].erloschen, true);
  assert.equal(run.station.status, "erloschen");
  assert.equal(run.docht, 4);
  assert.equal(run.glanz, 0);
  assert.equal(M.ziehen(run), null, "danach lässt sich nicht weiterziehen");
  assert.equal(M.weitergehen(run), null);
  const feder = station(["irrlicht3", "irrlicht3", "irrlicht3"], { talismane: ["feder"] });
  alleZiehen(feder, 3);
  assert.equal(feder.docht, 5, "Rabenfeder: nur 1 Docht");
  const genau = station(["irrlicht3", "irrlicht3", "irrlicht1"]);
  alleZiehen(genau, 3);
  assert.equal(genau.station.status, "offen", "genau auf der Schwelle geht es noch");
});

test("Kräuter: Johanniskraut und Bienenwachs retten eine flackernde Laterne", () => {
  let run = station(["irrlicht3", "irrlicht3", "irrlicht2", "gluehwuermchen"], { kraeuter: ["johanniskraut"] });
  const ev = alleZiehen(run, 3);
  assert.equal(ev[2].flackert, true);
  assert.equal(run.station.status, "flackert");
  assert.equal(M.ziehen(run), null, "flackernd wird nicht gezogen");
  assert.ok(M.krautNutzen(run, "johanniskraut"));
  assert.equal(run.station.status, "offen");
  assert.equal(run.station.kaelte, 6);
  assert.equal(run.station.stapel.length, 2, "das Irrlicht ist zurück im Glas");
  assert.deepEqual(run.kraeuter, []);
  run = station(["irrlicht3", "irrlicht3", "irrlicht3"], { kraeuter: ["wachs"] });
  alleZiehen(run, 3);
  assert.equal(run.station.status, "flackert");
  assert.ok(M.krautNutzen(run, "wachs"));
  assert.deepEqual([run.station.status, run.station.schwelle], ["offen", 9]);
  run = station(["irrlicht3", "irrlicht3", "irrlicht3"], { kraeuter: ["kienspan"] });
  alleZiehen(run, 3);
  assert.equal(run.station.status, "erloschen", "Kienspan rettet nicht");
  run = station(["gluehwuermchen", "irrlicht1", "leuchtkaefer"], { kraeuter: ["baldrian", "kienspan"] });
  assert.ok(M.krautNutzen(run, "baldrian"));
  assert.deepEqual(M.blick(run), ["gluehwuermchen", "irrlicht1", "leuchtkaefer"]);
  M.ziehen(run);
  assert.deepEqual(M.blick(run), ["irrlicht1", "leuchtkaefer"]);
  assert.ok(M.krautNutzen(run, "kienspan"));
  assert.equal(run.station.licht, 4);
});

test("Weitergehen: Glanz für Überschuss, Docht für fehlendes Licht", () => {
  let run = station(["leuchtkaefer", "leuchtkaefer", "leuchtkaefer"], { dunkel: 5 });
  alleZiehen(run, 3);
  assert.deepEqual(M.vorschau(run), { bestanden: true, glanz: 2 + 7, schaden: 0, fehlt: 0 });
  M.weitergehen(run);
  assert.equal(run.glanz, 9);
  run = station(Array(8).fill("leuchtkaefer"), { dunkel: 5 });
  alleZiehen(run, 8);
  assert.equal(M.vorschau(run).glanz, 2 + M.REGELN.ueberschussMax, "Überschuss ist gedeckelt");
  run = station(["gluehwuermchen", "glutkaefer"], { dunkel: 3, mods: ["tau"], talismane: ["kohle"] });
  alleZiehen(run, 2);
  assert.equal(M.vorschau(run).glanz, 2 + 0 + 3 + 3, "Glutkäfer zuletzt, mit Glühender Kohle");
  for (const [licht, schaden] of [[4, 1], [2, 1], [1, 2], [0, 2]]) {
    run = station([], { dunkel: 5, licht });
    assert.equal(M.weitergehen(run).schaden, schaden, `bei ${licht} Licht`);
    assert.equal(run.docht, 6 - schaden);
  }
  run = station([], { dunkel: 5, licht: 3, talismane: ["wurzel"] });
  assert.equal(M.vorschau(run).schaden, 0, "Alraune");
  run = station(["irrlicht3", "irrlicht3", "irrlicht1"], { dunkel: 0, talismane: ["glocke"] });
  alleZiehen(run, 3);
  assert.equal(M.vorschau(run).glanz, 2 + 0 + 5, "Kupferglocke genau auf der Schwelle");
});

test("Gefahr stimmt mit dem Auszählen aller möglichen nächsten Züge überein", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const run = M.neuerLauf({ seed });
    M.reisen(run, 0, 0);
    const n = seed % 9;
    for (let i = 0; i < n && run.station.status === "offen"; i++) M.ziehen(run);
    if (run.station.status !== "offen" || !run.station.stapel.length) continue;
    const json = JSON.stringify(run);
    let aus = 0;
    for (let i = 0; i < run.station.stapel.length; i++) {
      const kopie = JSON.parse(json);
      const id = kopie.station.stapel.splice(i, 1)[0];
      kopie.station.stapel.push(id);
      const ev = M.ziehen(kopie);
      if (ev.erloschen || ev.flackert) aus++;
    }
    assert.equal(M.gefahr(run), aus / run.station.stapel.length, `Seed ${seed}`);
  }
});

test("Karte: zwei bis drei Wege je Reihe, alles erreichbar, Wächter am Ende, Rast oder Krämerin davor", () => {
  for (let seed = 1; seed <= 300; seed++) {
    const run = M.neuerLauf({ seed });
    run.karten.forEach((karte, r) => {
      const reihen = karte.reihen;
      assert.equal(reihen.length, M.REGELN.reihen + 1);
      assert.equal(reihen[reihen.length - 1][0].typ, "waechter");
      assert.equal(reihen[reihen.length - 1][0].waechter, M.I.REGIONEN[r].waechter);
      assert.ok(reihen[0].every((k) => k.typ === "pfad"));
      assert.ok(reihen[M.REGELN.reihen - 1].some((k) => k.typ === "rast" || k.typ === "haendler"));
      for (let z = 0; z < reihen.length - 1; z++) {
        assert.ok(reihen[z].length >= 2 && reihen[z].length <= 3);
        assert.ok(reihen[z].every((k) => k.nach.length >= 1), "jeder Knoten führt weiter");
        reihen[z + 1].forEach((_, j) => assert.ok(reihen[z].some((k) => k.nach.includes(j)), "jeder Knoten ist erreichbar"));
        for (const k of reihen[z]) if (k.typ === "pfad" || k.typ === "nebel") assert.ok(k.dunkel > 0);
      }
    });
  }
});

test("Reisen nur zu offenen Knoten, Phasen folgen dem Knotentyp", () => {
  const run = M.neuerLauf({ seed: 9 });
  assert.equal(M.reisen(run, 1, 0), false);
  assert.equal(M.offeneKnoten(run).length, run.karten[0].reihen[0].length);
  assert.ok(M.reisen(run, 0, 0));
  assert.equal(run.phase, "station");
  assert.deepEqual(M.offeneKnoten(run), [], "während der Station ist die Karte gesperrt");
});

test("Bestandene Station führt zum Fang, Freilassen bringt Glanz", () => {
  const run = station(["leuchtkaefer", "leuchtkaefer"], { dunkel: 3 });
  alleZiehen(run, 2);
  M.weitergehen(run);
  assert.ok(M.stationAbschliessen(run));
  assert.equal(run.phase, "fang");
  assert.equal(run.angebot.arten.length, 3);
  assert.equal(new Set(run.angebot.arten).size, 3);
  assert.ok(run.angebot.arten.every((id) => run.pool.arten.includes(id)));
  const vorher = run.glas.length, glanz = run.glanz;
  const id = run.angebot.arten[1];
  assert.ok(M.fangen(run, 1));
  assert.equal(run.glas.length, vorher + 1);
  assert.equal(run.glas[run.glas.length - 1], id);
  assert.equal(run.phase, "karte");
  const r2 = station(["leuchtkaefer", "leuchtkaefer"], { dunkel: 3 });
  alleZiehen(r2, 2); M.weitergehen(r2); M.stationAbschliessen(r2);
  const g2 = r2.glanz;
  M.fangen(r2, null);
  assert.equal(r2.glanz, g2 + 1);
  assert.equal(glanz >= 0, true);
});

test("Wächter muss bestanden werden: ein Fehlversuch kostet Docht und startet neu", () => {
  const run = M.neuerLauf({ seed: 3 });
  run.pos = { reihe: M.REGELN.reihen - 1, index: 0 };
  assert.ok(M.reisen(run, M.REGELN.reihen, 0));
  assert.equal(run.station.waechter, "nebelfrau");
  assert.equal(run.station.schwelle, 5);
  M.weitergehen(run);
  assert.equal(run.station.status, "verfehlt");
  assert.equal(run.docht, 6 - Math.ceil(run.station.dunkel / 3));
  assert.ok(M.stationAbschliessen(run));
  assert.equal(run.phase, "station");
  assert.equal(run.station.versuch, 2);
  assert.equal(run.station.status, "offen");
  run.station.licht = 99;
  M.weitergehen(run);
  M.stationAbschliessen(run);
  assert.equal(run.phase, "beute");
  const irr = run.glas.filter((id) => id === "irrlicht2").length;
  M.beuteWaehlen(run, 0);
  assert.equal(run.region, 1);
  assert.equal(run.talismane.length, 1);
  assert.equal(run.glas.filter((id) => id === "irrlicht2").length, irr + 1, "ein Irrlicht schließt sich an");
  assert.deepEqual(run.pos, { reihe: -1, index: -1 });
});

test("Letzter Wächter bestanden ist der Sieg, Docht 0 die Niederlage", () => {
  const run = M.neuerLauf({ seed: 3 });
  run.region = 2;
  run.pos = { reihe: M.REGELN.reihen - 1, index: 0 };
  M.reisen(run, M.REGELN.reihen, 0);
  assert.equal(run.station.waechter, "alma");
  assert.equal(run.station.stapel.length, run.glas.length + 3);
  run.station.licht = 999;
  M.weitergehen(run);
  M.stationAbschliessen(run);
  assert.equal(run.phase, "ende");
  assert.equal(run.ende.sieg, true);
  const verloren = station(["irrlicht3", "irrlicht3", "irrlicht3"]);
  verloren.docht = 2;
  alleZiehen(verloren, 3);
  M.stationAbschliessen(verloren);
  assert.equal(verloren.phase, "ende");
  assert.equal(verloren.ende.sieg, false);
});

test("Rast: Docht flicken oder einen Funken aus dem Glas nehmen, nie die letzten Lichtfunken", () => {
  const run = M.neuerLauf({ seed: 4 });
  run.phase = "rast";
  run.docht = 3;
  assert.ok(M.rasten(run, "docht"));
  assert.equal(run.docht, 5);
  run.phase = "rast";
  run.docht = 6;
  M.rasten(run, "docht");
  assert.equal(run.docht, 6, "nicht über das Maximum");
  run.phase = "rast";
  assert.ok(M.rasten(run, "sichten", "irrlicht3"));
  assert.ok(!run.glas.includes("irrlicht3"));
  run.phase = "rast";
  run.glas = ["gluehwuermchen", "gluehwuermchen", "gluehwuermchen", "irrlicht1"];
  assert.equal(M.rasten(run, "sichten", "gluehwuermchen"), false);
  assert.equal(run.phase, "rast");
});

test("Krämerin: kaufen nur mit genug Glanz, Austreiben wird teurer", () => {
  const run = M.neuerLauf({ seed: 11 });
  run.phase = "haendler";
  run.angebot = { waren: [{ typ: "art", id: "leuchtkaefer", preis: 8 }, { typ: "kraut", id: "kienspan", preis: 3 }, { typ: "talisman", id: "bernstein", preis: 10 }], verkauft: [] };
  run.glanz = 7;
  assert.equal(M.kaufen(run, 0), false);
  run.glanz = 21;
  assert.ok(M.kaufen(run, 0));
  assert.equal(M.kaufen(run, 0), false, "schon verkauft");
  assert.ok(M.kaufen(run, 2));
  assert.ok(run.talismane.includes("bernstein"));
  assert.equal(run.glanz, 3);
  run.kraeuter = ["baldrian", "baldrian", "baldrian"];
  assert.equal(M.kaufen(run, 1), false, "Kräuterbeutel voll");
  run.glanz = 20;
  assert.ok(M.austreiben(run, "irrlicht3"));
  assert.equal(run.glanz, 15);
  assert.ok(M.austreiben(run, "irrlicht2"));
  assert.equal(run.glanz, 8);
  const echt = M.neuerLauf({ seed: 12 });
  echt.pos = { reihe: -1, index: -1 };
  echt.phase = "haendler";
  echt.angebot = null;
  assert.ok(M.haendlerVerlassen(echt));
  assert.equal(echt.phase, "karte");
});

test("Funde: Wirkungen, Bedingungen und Almas Notizen", () => {
  const run = M.neuerLauf({ seed: 2 });
  run.phase = "fund";
  run.fund = { id: "notiz", notiz: 0, ergebnis: null };
  const erg = M.fundWaehlen(run, 0);
  assert.equal(erg.notiz, 0);
  assert.deepEqual(run.statistik.notizen, [0]);
  assert.equal(run.glanz, 2);
  M.fundAbschliessen(run);
  assert.equal(run.phase, "karte");
  run.phase = "fund";
  run.fund = { id: "faehrfrau", ergebnis: null };
  assert.equal(M.fundWaehlen(run, 0), null, "Überfahrt ohne 7 Glanz nicht möglich");
  run.glanz = 7;
  const fahrt = M.fundWaehlen(run, 0);
  assert.equal(fahrt.talismane.length, 1);
  assert.equal(run.glanz, 0);
  M.fundAbschliessen(run);
  run.phase = "fund";
  run.fund = { id: "wiese", ergebnis: null };
  M.fundWaehlen(run, 0);
  M.fundAbschliessen(run);
  assert.equal(run.phase, "fang");
  run.phase = "fund";
  run.fund = { id: "reigen", ergebnis: null };
  run.docht = 2;
  const irr = run.glas.filter((id) => ARTEN[id].irr).length;
  M.fundWaehlen(run, 0);
  assert.equal(run.glas.filter((id) => ARTEN[id].irr).length, irr - 2);
  M.fundAbschliessen(run);
  assert.equal(run.phase, "ende", "Docht 0 durch einen Fund beendet die Nacht");
});

test("Der erste Fund einer Nacht ist die nächste ungelesene Notiz", () => {
  const meta = M.neueMeta();
  meta.notizen = [0, 1, 2];
  const run = M.neuerLauf({ seed: 8, meta });
  run.pos = { reihe: 0, index: 0 };
  run.karten[0].reihen[1][0].typ = "fund";
  run.karten[0].reihen[0][0].nach = [0];
  assert.ok(M.reisen(run, 1, 0));
  assert.deepEqual(run.fund, { id: "notiz", notiz: 3, ergebnis: null });
});

test("Auswertung: Erinnerungen, Notizen, Freischaltungen, Mondphasen, nur einmal", () => {
  const meta = M.neueMeta();
  const run = M.neuerLauf({ seed: 3, meta });
  run.statistik.bestanden = 6;
  run.statistik.waechter = ["nebelfrau", "moorkoenig", "alma"];
  run.statistik.notizen = [0, 1];
  run.statistik.almaGesehen = true;
  run.statistik.gesehen = ["gluehwuermchen", "mondmotte"];
  run.region = 2;
  run.phase = "ende";
  run.ende = { sieg: true, region: 2, ausgewertet: false };
  const b = M.laufAuswerten(meta, run);
  assert.equal(b.summe, 6 + 9 + 4 + 5);
  assert.equal(meta.erinnerungen, 24);
  assert.deepEqual(meta.notizen, [0, 1]);
  assert.equal(meta.siege, 1);
  assert.equal(meta.mondphaseFrei, 1);
  assert.ok(meta.freigeschaltet.includes("gebunden"), "Gebundenes Irrlicht nach der Begegnung mit Alma");
  assert.equal(meta.wahresEnde, false);
  assert.equal(M.laufAuswerten(meta, run), b);
  assert.equal(meta.erinnerungen, 24, "zweite Auswertung zählt nicht doppelt");
  const wahr = M.neuerLauf({ seed: 4, meta });
  wahr.statistik.notizen = [2, 3, 4, 5, 6, 7];
  wahr.phase = "ende";
  wahr.ende = { sieg: true, region: 2, ausgewertet: false };
  M.laufAuswerten(meta, wahr);
  assert.equal(meta.notizen.length, NOTIZEN.length);
  assert.equal(wahr.ende.wahresEnde, true);
  assert.equal(meta.wahresEnde, true);
});

test("Freischalten kostet Erinnerungen, neue Funken erscheinen danach im Pool", () => {
  const meta = M.neueMeta();
  assert.equal(M.freischalten(meta, "mondmotte"), false);
  meta.erinnerungen = 10;
  assert.ok(M.freischalten(meta, "mondmotte"));
  assert.equal(meta.erinnerungen, 6);
  assert.equal(M.freischalten(meta, "mondmotte"), false, "nur einmal");
  assert.ok(M.neuerLauf({ seed: 1, meta }).pool.arten.includes("mondmotte"));
  assert.ok(!M.neuerLauf({ seed: 1 }).pool.arten.includes("mondmotte"));
  meta.erinnerungen = 100;
  for (const f of FREISCHALTUNGEN) M.freischalten(meta, f.id);
  assert.equal(meta.freigeschaltet.length, FREISCHALTUNGEN.length);
  const run = M.neuerLauf({ seed: 1, meta });
  assert.equal(run.dochtMax, 7, "Großmutters Docht");
  assert.deepEqual(run.kraeuter, ["johanniskraut"], "Kräuterbeutel");
  assert.equal(run.pool.talismane.length, 13);
  assert.deepEqual(M.laternenFrei(meta), ["sturm", "kupfer", "papier"]);
});

test("Gespräche: je Figur das erste passende, gelesene kommen nicht wieder", () => {
  const meta = M.neueMeta();
  const start = M.gespraeche(meta).map((g) => g.id);
  assert.deepEqual(start, ["h0", "p0"]);
  start.forEach((id) => M.gespraechGelesen(meta, id));
  assert.deepEqual(M.gespraeche(meta), []);
  meta.laeufe = 1;
  assert.deepEqual(M.gespraeche(meta).map((g) => g.id), ["h1", "j1", "p1"]);
  for (let n = 2; n <= 6; n++) {
    meta.laeufe = n;
    const neu = M.gespraeche(meta);
    assert.ok(neu.length >= 1 || n > 4, `nach Lauf ${n} gibt es etwas Neues`);
    neu.forEach((g) => M.gespraechGelesen(meta, g.id));
  }
});

test("Ein Lauf ist reines JSON und lässt sich mitten in der Nacht fortsetzen", () => {
  const a = M.neuerLauf({ seed: 77 });
  const { botZug } = require("./bot.js");
  for (let i = 0; i < 25; i++) botZug(a, "abwaegend");
  const b = JSON.parse(JSON.stringify(a));
  spielen(a, "abwaegend");
  spielen(b, "abwaegend");
  assert.deepEqual(a, b);
});

test("Mondphasen machen die Nacht härter", () => {
  const a = M.neuerLauf({ seed: 6, mondphase: 0 });
  const e = M.neuerLauf({ seed: 6, mondphase: 5 });
  assert.equal(e.dochtMax, a.dochtMax - 1);
  assert.equal(e.glas.length, a.glas.length + 1);
  assert.equal(e.karten[0].reihen[M.REGELN.reihen][0].dunkel, a.karten[0].reihen[M.REGELN.reihen][0].dunkel + 4);
  e.phase = "rast"; e.docht = 1; M.rasten(e, "docht");
  assert.equal(e.docht, 2);
});

function siegquote(stil, n, opt) {
  let siege = 0, schritte = 0, w1 = 0;
  for (let s = 1; s <= n; s++) {
    const run = spielen(M.neuerLauf(Object.assign({ seed: s * 104729 }, opt)), stil);
    if (run.ende.sieg) siege++;
    if (run.statistik.waechter.length) w1++;
    schritte += run.statistik.schritte;
  }
  return { sieg: siege / n, schritte: schritte / n, w1: w1 / n };
}

test("Entscheidungen zählen: Abwägen schlägt Draufgänger und Angsthase deutlich", () => {
  const ab = siegquote("abwaegend", 400), drauf = siegquote("draufgaenger", 400), angst = siegquote("angsthase", 400);
  assert.ok(ab.schritte > drauf.schritte + 1, `abwägend ${ab.schritte} gegen Draufgänger ${drauf.schritte}`);
  assert.ok(ab.schritte > angst.schritte + 1, `abwägend ${ab.schritte} gegen Angsthase ${angst.schritte}`);
  assert.ok(ab.sieg > drauf.sieg + 0.05 && ab.sieg > angst.sieg + 0.05);
});

test("Balance: Die erste Region schafft man oft, den Turm nur manchmal", () => {
  const ab = siegquote("abwaegend", 500);
  assert.ok(ab.w1 > 0.55 && ab.w1 < 0.95, `erster Wächter ${ab.w1}`);
  assert.ok(ab.sieg > 0.08 && ab.sieg < 0.4, `Sieg ${ab.sieg}`);
  const meta = M.neueMeta();
  meta.freigeschaltet = FREISCHALTUNGEN.map((f) => f.id).concat(["gebunden"]);
  const voll = siegquote("abwaegend", 500, { meta });
  assert.ok(voll.sieg > ab.sieg, "Freischaltungen helfen");
  const hart = siegquote("abwaegend", 500, { meta, mondphase: 5 });
  assert.ok(hart.sieg < voll.sieg / 2, `Vollmond ${hart.sieg} gegen ${voll.sieg}`);
  for (const laterne of ["kupfer", "papier"]) {
    const q = siegquote("abwaegend", 300, { meta, laterne });
    assert.ok(q.sieg > 0.04, `${laterne} ist spielbar (${q.sieg})`);
  }
});
