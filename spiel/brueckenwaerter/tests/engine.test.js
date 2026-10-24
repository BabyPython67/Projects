// Logik-Tests für BRÜCKENWÄRTER: Punkte, Sieg und Niederlage, Schwierigkeit, Neustart.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const B = require("../engine.js");

const DT = 1 / 60;
/* Spiel ohne zufällige Ankünfte, damit sich einzelne Situationen gezielt nachstellen lassen. */
function leer(options) {
  const g = new B.Game(Object.assign({ seed: 1 }, options || {}));
  g.spawnAt[B.ROAD] = Infinity;
  g.spawnAt[B.WATER] = Infinity;
  return g;
}
function laufen(g, sekunden, held) {
  const events = [];
  for (let t = 0; t < sekunden - 1e-9; t += DT) {
    if (held !== undefined) g.setHeld(held);
    events.push(...g.tick(DT));
  }
  return events;
}

test("Startzustand: 6 Uhr, Brücke unten, nichts passiert", () => {
  const g = new B.Game({ seed: 3 });
  assert.equal(g.status, B.PLAYING);
  assert.equal(g.score, 0);
  assert.equal(g.strikes, 0);
  assert.equal(g.bridge, 0);
  assert.equal(g.clock, "06:00");
  assert.equal(g.traffic, 1);
  assert.equal(g.units.length, 0);
  assert.equal(g.rounds, 1);
});

test("Hebel halten hebt die Brücke in liftTime, loslassen senkt sie", () => {
  const g = leer();
  laufen(g, 0.7, true);
  assert.ok(g.bridge > 0.45 && g.bridge < 0.55, `halb oben erwartet, war ${g.bridge}`);
  laufen(g, 0.8, true);
  assert.equal(g.bridge, 1);
  laufen(g, 1.5, false);
  assert.equal(g.bridge, 0);
});

test("Auto fährt bei gesenkter Brücke durch und bringt Punkte plus Bonus fürs freie Durchfahren", () => {
  const g = leer();
  g.addUnit("auto", 1, 0.3);
  const events = laufen(g, 2, false);
  const pass = events.find((e) => e.type === "passiert");
  assert.ok(pass, "Auto ist nicht durchgefahren");
  assert.equal(pass.points, B.KINDS.auto.points + B.KINDS.auto.bonus);
  assert.equal(pass.bonus, true);
  assert.equal(g.score, 15);
  assert.equal(g.passed, 1);
});

test("Auto wartet vor gehobener Brücke, verliert Geduld und hupt; dann ist es weg", () => {
  const g = leer();
  laufen(g, 1.5, true);                    // Brücke oben
  const auto = g.addUnit("auto", 1, 0.35);
  laufen(g, 1, true);
  assert.ok(auto.waiting, "Auto müsste warten");
  assert.ok(auto.s <= 0.5 - g.config.deck + 1e-9, "Auto hat die Haltelinie überfahren");
  assert.equal(g.strikes, 0);
  const events = laufen(g, B.KINDS.auto.patience + 0.2, true);
  const hupe = events.find((e) => e.type === "hupe");
  assert.ok(hupe, "keine Hupe");
  assert.equal(hupe.unit.kind, "auto");
  assert.equal(g.strikes, 1);
  assert.equal(g.units.includes(auto), false);
  assert.equal(g.score, 0);
});

test("Gewartetes Auto bekommt beim Durchfahren keinen Bonus", () => {
  const g = leer();
  laufen(g, 1.5, true);
  g.addUnit("auto", -1, 0.3);
  laufen(g, 2, true);                      // wartet
  const events = laufen(g, 3, false);      // Brücke runter, Auto fährt
  const pass = events.find((e) => e.type === "passiert");
  assert.ok(pass);
  assert.equal(pass.points, B.KINDS.auto.points);
  assert.equal(pass.bonus, false);
});

test("Segler braucht die Brücke oben: wartet unten, fährt oben, wird sonst ungeduldig", () => {
  const g = leer();
  const s = g.addUnit("segler", 1, 0.3);
  laufen(g, 3, false);
  assert.ok(s.waiting);
  assert.ok(s.s <= 0.5 - g.config.deck + 1e-9);
  const events = laufen(g, 6, true);
  const pass = events.find((e) => e.type === "passiert");
  assert.ok(pass, "Segler kam nicht durch");
  assert.equal(pass.unit.kind, "segler");
  assert.equal(g.score, B.KINDS.segler.points);

  const g2 = leer();
  g2.addUnit("segler", -1, 0.3);
  const ev2 = laufen(g2, B.KINDS.segler.patience + 2, false);
  assert.ok(ev2.some((e) => e.type === "hupe" && e.unit.kind === "segler"));
  assert.equal(g2.strikes, 1);
});

test("Kahn passt unter der Brücke durch, egal wie sie steht", () => {
  for (const held of [false, true]) {
    const g = leer();
    g.addUnit("kahn", 1, 0.3);
    const events = laufen(g, 4, held);
    assert.ok(events.some((e) => e.type === "passiert" && e.unit.kind === "kahn"), `Kahn blieb hängen (held=${held})`);
    assert.equal(g.strikes, 0);
  }
});

test("Brücke hebt nicht, solange ein Auto auf dem Deck ist, und senkt nicht über einem Segler", () => {
  const g = leer();
  g.addUnit("auto", 1, 0.5);               // mitten auf der Brücke
  laufen(g, 0.1, true);
  assert.equal(g.bridge, 0);
  assert.equal(g.blocked, "auto");
  laufen(g, 1.5, true);                    // Auto ist runter, jetzt hebt sie
  assert.equal(g.blocked, null);
  assert.ok(g.bridge > 0.5, `Brücke hebt nicht: ${g.bridge}`);

  const g2 = leer();
  laufen(g2, 1.5, true);
  g2.addUnit("segler", 1, 0.5);
  laufen(g2, 0.1, false);
  assert.equal(g2.bridge, 1);
  assert.equal(g2.blocked, "schiff");
});

test("Rettungswagen hat wenig Geduld und zählt doppelt", () => {
  const g = leer();
  laufen(g, 1.5, true);
  g.addUnit("rettung", 1, 0.35);
  laufen(g, B.KINDS.rettung.patience + 1.5, true);
  assert.equal(g.strikes, 2);
});

test("Drei Hupen: verloren, danach bewegt sich nichts mehr", () => {
  const g = leer();
  laufen(g, 1.5, true);
  g.addUnit("auto", 1, 0.35);
  g.addUnit("auto", -1, 0.35);
  g.addUnit("rettung", 1, 0.2);
  const events = laufen(g, 15, true);
  assert.equal(g.status, B.LOST);
  assert.ok(events.some((e) => e.type === "verloren"));
  assert.ok(g.strikes >= g.config.strikesToLose);
  const t = g.time, score = g.score;
  assert.deepEqual(g.tick(DT), []);
  assert.equal(g.time, t);
  assert.equal(g.score, score);
});

test("Schichtende: gewonnen, Uhr auf 18:00, Ruhebonus je übriger Hupe", () => {
  const g = leer({ shift: 10 });
  laufen(g, 5, false);
  assert.equal(g.clock, "12:00");
  const events = laufen(g, 5.1, false);
  assert.equal(g.status, B.WON);
  assert.equal(g.clock, "18:00");
  assert.equal(g.traffic, 5);
  const won = events.find((e) => e.type === "gewonnen");
  assert.equal(won.bonus, 3 * g.config.calmBonus);
  assert.equal(g.score, 3 * g.config.calmBonus);
});

test("Mit zwei Hupen reicht es noch zum Feierabend, nur der Bonus schrumpft", () => {
  const g = leer({ shift: 14 });
  laufen(g, 1.5, true);
  g.addUnit("auto", 1, 0.35);
  g.addUnit("auto", -1, 0.35);
  laufen(g, 13, true);
  assert.equal(g.status, B.WON);
  assert.equal(g.strikes, 2);
  assert.equal(g.score, 1 * g.config.calmBonus);
});

test("Schwierigkeit: dichterer Verkehr, mehr Segler, Rettungswagen erst später", () => {
  const c = B.makeConfig();
  assert.ok(c.meanGap(B.ROAD, 0) > c.meanGap(B.ROAD, 0.5));
  assert.ok(c.meanGap(B.ROAD, 0.5) > c.meanGap(B.ROAD, 1));
  assert.ok(c.meanGap(B.WATER, 0) > c.meanGap(B.WATER, 1));
  assert.ok(c.tallShareAt(0) < c.tallShareAt(1));
  assert.equal(c.ambulanceShareAt(0), 0);
  assert.equal(c.ambulanceShareAt(0.1), 0);
  assert.ok(c.ambulanceShareAt(0.5) > 0);
  const g = leer();
  const stufen = [];
  for (let i = 0; i < 5; i++) { laufen(g, g.config.shift / 5, false); stufen.push(g.traffic); }
  assert.deepEqual(stufen, [1, 2, 3, 4, 5]);
});

test("Schwierigkeit in der Simulation: im letzten Viertel kommen mehr Fahrzeuge als im ersten", () => {
  let fruehe = 0, spaete = 0, rettungFrueh = 0;
  for (let seed = 1; seed <= 10; seed++) {
    const g = new B.Game({ seed });
    const viertel = g.config.shift / 4, sperre = g.config.ambulanceFrom * g.config.shift;
    while (!g.over) {
      g.setHeld(B.choose(g));
      for (const e of g.tick(DT)) {
        if (e.type !== "ankunft") continue;
        if (e.unit.kind === "rettung" && g.time < sperre) rettungFrueh++;
        if (g.time < viertel) fruehe++;
        else if (g.time > 3 * viertel) spaete++;
      }
    }
  }
  assert.ok(spaete > fruehe * 1.5, `früh ${fruehe}, spät ${spaete}`);
  assert.equal(rettungFrueh, 0);
});

test("Neustart setzt alles zurück und zählt die Schicht hoch", () => {
  const g = new B.Game({ seed: 5 });
  B.simulate(g);
  assert.ok(g.over);
  assert.ok(g.score > 0);
  g.reset();
  assert.equal(g.status, B.PLAYING);
  assert.equal(g.score, 0);
  assert.equal(g.strikes, 0);
  assert.equal(g.time, 0);
  assert.equal(g.bridge, 0);
  assert.equal(g.held, false);
  assert.deepEqual(g.units, []);
  assert.equal(g.rounds, 2);
  assert.notEqual(g.seed, 5);
  laufen(g, 3, false);
  assert.ok(g.units.length > 0, "nach dem Neustart kommt wieder Verkehr");
});

test("Gleiche Startzahl, gleiche Schicht; andere Startzahl, andere Schicht", () => {
  const a = B.simulate(new B.Game({ seed: 42 }));
  const b = B.simulate(new B.Game({ seed: 42 }));
  assert.equal(a.score, b.score);
  assert.equal(a.status, b.status);
  assert.equal(a.passed, b.passed);
  const c = B.simulate(new B.Game({ seed: 43 }));
  assert.notEqual(a.score, c.score);
});

test("Autopilot schafft die meisten Schichten, aber nicht alle hupenfrei", () => {
  let siege = 0, hupen = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const g = B.simulate(new B.Game({ seed }));
    if (g.status === B.WON) siege++;
    hupen += g.strikes;
  }
  assert.ok(siege >= 15, `nur ${siege} Siege`);
  assert.ok(hupen > 0, "zu leicht: der Autopilot hört nie eine Hupe");
});
