// Tests der Browser-Spiellogik (node --test). Spiegel von test_engine.py.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const D = require("../web/engine.js");

const C = D.makeConfig();
const sicher = (g) => { g.heights = Array(C.length).fill(C.maxHeight); };
const sichereStunde = (g) => { sicher(g); return g.step(D.WAIT); };
const verlieren = (g) => { g.heights = Array(C.length).fill(0); for (let i = 0; i < C.houses; i++) g.step(D.WAIT); };

describe("Start und Determinismus", () => {
  test("neues Spiel beginnt in Nacht 1", () => {
    const g = new D.Game(1);
    assert.deepEqual([g.night, g.hour, g.score, g.houses, g.phase], [1, 1, 0, C.houses, D.PLAYING]);
    assert.equal(g.heights.length, C.length);
    assert.ok(g.heights.every((h) => h >= C.startMin && h <= C.startMax));
    assert.deepEqual([g.pos, g.actionsLeft, g.pegel], [Math.floor(C.length / 2), C.actions, C.ebb]);
  });
  test("gleicher Seed, gleiches Spiel", () => {
    const a = new D.Game(42), b = new D.Game(42);
    assert.deepEqual([a.heights, a.tide, a.waves], [b.heights, b.tide, b.waves]);
    for (const k of [D.BUILD, D.LEFT, D.WAIT, D.RIGHT, D.WAIT, D.WAIT]) { a.step(k); b.step(k); }
    assert.deepEqual([a.heights, a.score, a.waves], [b.heights, b.score, b.waves]);
  });
  test("ohne Seed ist jedes Spiel anders", () => {
    const seeds = new Set(Array.from({ length: 5 }, () => new D.Game().seed));
    assert.ok(seeds.size > 1);
  });
});

describe("Aktionen", () => {
  test("gehen kostet eine Aktion, Deichende kostet nichts", () => {
    const g = new D.Game(2);
    g.step(D.RIGHT);
    assert.deepEqual([g.pos, g.actionsLeft], [Math.floor(C.length / 2) + 1, C.actions - 1]);
    g.pos = 0;
    const meldung = g.step(D.LEFT);
    assert.deepEqual([g.pos, g.actionsLeft], [0, C.actions - 1]);
    assert.match(meldung.join(" "), /endet/);
  });
  test("Sandsack erhöht, aber nicht über die Maximalhöhe", () => {
    const g = new D.Game(3);
    const vorher = g.heights[g.pos];
    g.step(D.BUILD);
    assert.equal(g.heights[g.pos], vorher + 1);
    g.heights[g.pos] = C.maxHeight;
    g.step(D.BUILD);
    assert.deepEqual([g.heights[g.pos], g.actionsLeft], [C.maxHeight, C.actions - 1]);
  });
  test("Stunde endet nach der letzten Aktion oder beim Warten", () => {
    const g = new D.Game(4);
    sicher(g);
    g.heights[g.pos] = C.maxHeight - C.actions;
    for (let i = 0; i < C.actions; i++) g.step(D.BUILD);
    assert.deepEqual([g.hour, g.actionsLeft], [2, C.actions]);
    sicher(g);
    g.step(D.WAIT);
    assert.equal(g.hour, 3);
  });
  test("unbekannte Taste tut nichts", () => {
    const g = new D.Game(4);
    const vorher = JSON.stringify([g.pos, g.actionsLeft, g.heights, g.hour]);
    assert.deepEqual(g.step("x"), []);
    assert.equal(JSON.stringify([g.pos, g.actionsLeft, g.heights, g.hour]), vorher);
  });
});

describe("Stundenende und Punkte", () => {
  test("Brecher senken die getroffenen Abschnitte", () => {
    const g = new D.Game(5);
    sicher(g);
    const treffer = g.nextWaves.slice();
    assert.ok(treffer.length > 0);
    g.step(D.WAIT);
    g.heights.forEach((h, i) => assert.equal(h, C.maxHeight - (treffer.includes(i) ? 1 : 0)));
  });
  test("Pegel folgt der Flutkurve, gehaltene Stunde bringt Pegel mal Nacht", () => {
    const g = new D.Game(6);
    const kurve = g.tide.slice();
    sichereStunde(g);
    assert.deepEqual([g.pegel, g.score], [kurve[0], kurve[0]]);
    sichereStunde(g);
    assert.deepEqual([g.pegel, g.score], [kurve[1], kurve[0] + kurve[1]]);
  });
  test("Deichbruch kostet genau ein Haus pro Stunde", () => {
    const g = new D.Game(6);
    g.heights = Array(C.length).fill(0);
    const meldung = g.step(D.WAIT);
    assert.deepEqual([g.houses, g.score], [C.houses - 1, 0]);
    assert.match(meldung.join(" "), /DEICHBRUCH/);
  });
  test("Defizit berücksichtigt den Brecher", () => {
    const g = new D.Game(6);
    const i = g.nextWaves[0];
    g.heights[i] = g.nextPegel;
    assert.equal(g.deficit(i), 1);
  });
});

describe("Sieg und Niederlage", () => {
  test("ohne Häuser ist das Spiel verloren und nichts geht mehr", () => {
    const g = new D.Game(7);
    verlieren(g);
    assert.deepEqual([g.phase, g.houses], [D.LOST, 0]);
    assert.match(g.events[g.events.length - 1], /Verloren/);
    const vorher = JSON.stringify([g.night, g.hour, g.pos, g.score]);
    for (const k of [D.BUILD, D.LEFT, D.RIGHT, D.WAIT]) assert.deepEqual(g.step(k), []);
    assert.equal(JSON.stringify([g.night, g.hour, g.pos, g.score]), vorher);
  });
  test("trockene Nacht gibt Bonus, Nacht mit Bruch nicht", () => {
    const g = new D.Game(8);
    const kurve = g.tide.slice();
    for (let i = 0; i < C.hours; i++) sichereStunde(g);
    assert.deepEqual([g.night, g.score], [2, kurve.reduce((a, b) => a + b, 0) + C.bonusDryNight]);
    const k2 = g.tide.slice();
    const punkte = g.score;
    g.heights = Array(C.length).fill(0);
    g.step(D.WAIT);
    for (let i = 0; i < C.hours - 1; i++) sichereStunde(g);
    assert.deepEqual([g.night, g.score], [3, punkte + k2.slice(1).reduce((a, b) => a + b, 0) * 2]);
  });
  test("Sieg nach der ganzen Sturmwoche mit erwarteter Punktzahl", () => {
    const g = new D.Game(9);
    let erwartet = 0;
    while (!g.over) {
      const nacht = g.night, summe = g.tide.reduce((a, b) => a + b, 0);
      for (let i = 0; i < C.hours; i++) sichereStunde(g);
      erwartet += summe * nacht + C.bonusDryNight * nacht;
    }
    erwartet += C.bonusHouse * C.houses;
    assert.deepEqual([g.phase, g.night, g.houses, g.score], [D.WON, C.nights, C.houses, erwartet]);
    assert.match(g.events[g.events.length - 1], /überstanden/);
  });
});

describe("Schwierigkeit", () => {
  test("Höchstpegel steigt jede Nacht, Brecher werden mehr", () => {
    for (let n = 1; n < C.nights; n++) assert.ok(Math.max(...C.tide(n + 1)) > Math.max(...C.tide(n)));
    const werte = Array.from({ length: C.nights }, (_, i) => C.wavesPerHour(i + 1));
    assert.deepEqual(werte, werte.slice().sort((a, b) => a - b));
    assert.ok(werte[werte.length - 1] > werte[0]);
  });
  test("im Spiel wird jede Nacht schwerer", () => {
    const g = new D.Game(10);
    const pegel = [], brecher = [];
    while (!g.over) {
      pegel.push(Math.max(...g.tide));
      brecher.push(g.nextWaves.length);
      for (let i = 0; i < C.hours; i++) sichereStunde(g);
    }
    assert.equal(pegel.length, C.nights);
    assert.ok(pegel.every((p, i) => i === 0 || p > pegel[i - 1]));
    assert.ok(brecher[brecher.length - 1] > brecher[0]);
  });
});

describe("Neustart", () => {
  test("mitten im Spiel", () => {
    const g = new D.Game(11);
    g.step(D.RIGHT);
    for (let i = 0; i < C.hours + 1; i++) sichereStunde(g);
    assert.equal(g.night, 2);
    const meldung = g.step(D.NEW);
    assert.deepEqual([g.night, g.hour, g.score, g.houses, g.phase, g.pos, g.actionsLeft, g.pegel],
      [1, 1, 0, C.houses, D.PLAYING, Math.floor(C.length / 2), C.actions, C.ebb]);
    assert.match(meldung.join(" "), /neues Spiel/);
  });
  test("nach Niederlage und nach Sieg", () => {
    const g = new D.Game(12);
    verlieren(g);
    g.step(D.NEW);
    assert.deepEqual([g.phase, g.houses, g.score], [D.PLAYING, C.houses, 0]);
    const vorher = g.heights[g.pos];
    g.step(D.BUILD);
    assert.equal(g.heights[g.pos], vorher + 1);
    while (!g.over) sichereStunde(g);
    assert.equal(g.phase, D.WON);
    g.step(D.NEW);
    assert.deepEqual([g.phase, g.night, g.score], [D.PLAYING, 1, 0]);
  });
});

describe("Autopilot", () => {
  test("liefert gültige Tasten und spielt zu Ende", () => {
    const g = new D.Game(3);
    const keys = D.play(g);
    assert.ok(g.over);
    assert.ok(keys.every((k) => D.KEYS.includes(k)));
    assert.ok(keys.length > C.hours);
  });
  test("flickt zuerst die gefährdete Stelle", () => {
    const g = new D.Game(1);
    sicher(g);
    g.heights[g.pos + 2] = g.nextPegel - 1;
    assert.equal(D.choose(g), D.RIGHT);
    g.step(D.RIGHT); g.step(D.RIGHT);
    assert.equal(D.choose(g), D.BUILD);
  });
  test("Schwierigkeit ist schaffbar, aber nicht trivial", () => {
    let siege = 0, haeuser = 0;
    for (let seed = 0; seed < 30; seed++) {
      const g = new D.Game(seed);
      D.play(g);
      siege += g.phase === D.WON ? 1 : 0;
      haeuser += g.houses;
    }
    assert.ok(siege >= 18, `zu schwer: nur ${siege}/30 Siege`);
    assert.ok(haeuser < 30 * C.houses, "zu leicht: nie ein Haus verloren");
  });
});
