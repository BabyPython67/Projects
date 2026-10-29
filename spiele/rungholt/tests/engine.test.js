// Logik-Tests für RUNGHOLT: Karte, Würfel und Gegenstände, Kampf, Ereignisse, Rast, Flut, Ende, Profil, Autopilot.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const R = require("../engine.js");

const alle = Object.keys(R.GEAR);
function kampf(enemy, opts) {
  const g = new R.Game(Object.assign({ seed: 1 }, opts || {}));
  g.startFight(enemy);
  g.takeEvents();
  return g;
}
const setzeWuerfel = (g, werte) => { g.dice = werte.map((v) => g.newDie(v)); };
const gearIndex = (g, id) => g.gear.findIndex((x) => x.id === id);

describe("Start und Determinismus", () => {
  test("neue Nacht beginnt auf der Karte mit Startausrüstung", () => {
    const g = new R.Game({ seed: 3 });
    assert.equal(g.screen, "map");
    assert.deepEqual([g.mut, g.maxMut, g.tide, g.step, g.over], [30, 30, 0, 0, false]);
    assert.deepEqual(g.gear.map((x) => x.id), ["laterne", "stab", "flasche"]);
    assert.ok(g.options.length >= 2 && g.options.length <= 3);
  });
  test("gleiche Startzahl, gleiche Nacht; andere Startzahl, andere Nacht", () => {
    const a = new R.Game({ seed: 11 }), b = new R.Game({ seed: 11 }), c = new R.Game({ seed: 12 });
    assert.deepEqual(a.map, b.map);
    R.autoplay(a); R.autoplay(b);
    assert.deepEqual(a.summary(), b.summary());
    assert.notDeepEqual(a.map, c.map);
  });
  test("Tagesnacht: der Kalendertag ergibt eine feste Startzahl", () => {
    assert.equal(R.dailySeed("2026-10-27"), R.dailySeed("2026-10-27"));
    assert.notEqual(R.dailySeed("2026-10-27"), R.dailySeed("2026-10-28"));
  });
  test("Wer du bist: andere Ausrüstung und anderer Mut", () => {
    const f = new R.Game({ seed: 1, kit: "fischer" });
    assert.deepEqual(f.gear.map((x) => x.id), ["laterne", "netz", "seil"]);
    assert.equal(f.maxMut, 34);
    assert.equal(new R.Game({ seed: 1, kit: "gibtsnicht" }).kitId, "wattlaeuferin");
  });
});

describe("Karte", () => {
  test("drei Strecken zu je drei freien Schritten plus Wächter, jede Strecke mit einer Rast", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const g = new R.Game({ seed });
      assert.equal(g.map.length, 12);
      for (let s = 0; s < 3; s++) {
        const schritte = g.map.slice(s * 4, s * 4 + 4);
        assert.deepEqual(schritte[3].map((n) => n.type), ["guardian"]);
        assert.equal(schritte[3][0].enemy, R.STRETCHES[s].guardian);
        assert.ok(schritte.slice(0, 3).some((st) => st.some((n) => n.type === "rest")), `Strecke ${s + 1} ohne Rast (seed ${seed})`);
        for (const st of schritte.slice(0, 3)) {
          assert.ok(st.length >= 2 && st.length <= 3);
          for (const n of st) {
            assert.ok(["fight", "event", "rest", "find"].includes(n.type));
            if (n.type === "fight") assert.ok(R.STRETCHES[s].enemies.includes(n.enemy));
            if (n.type === "event") assert.ok(R.EVENTS[n.event].stretch.includes(s + 1));
          }
        }
      }
      const ereignisse = g.map.flat().filter((n) => n.type === "event").map((n) => n.event);
      assert.equal(new Set(ereignisse).size, ereignisse.length, "ein Ereignis doppelt");
    }
  });
  test("ein Schritt kostet einen Flutschritt und führt zum gewählten Knoten", () => {
    const g = new R.Game({ seed: 1 });
    const node = g.options[0];
    assert.ok(g.chooseNode(0));
    assert.equal(g.tide, 1);
    assert.equal(g.step, 1);
    assert.equal(g.screen, node.type === "fight" ? "fight" : node.type);
    assert.equal(g.chooseNode(0), false, "auf anderem Schirm geht kein Schritt");
  });
  test("ist die Flut zurück, bevor die Kirche erreicht ist, ist die Nacht verloren", () => {
    const g = new R.Game({ seed: 1 });
    g.tide = R.TIDE_MAX - 1;
    const i = g.options.findIndex((n) => n.type === "rest");
    const j = i >= 0 ? i : 0;
    g.chooseNode(j);
    if (g.screen === "rest") g.chooseRest(0);
    else if (g.screen === "event") g.chooseEvent(g.options.length ? 0 : 0);
    else if (g.screen === "fight") { g.enemy.hp = 1; setzeWuerfel(g, [6]); g.placeDie(0, 0); g.skipReward(); }
    else if (g.screen === "reward") g.skipReward();
    assert.equal(g.over, true);
    assert.equal(g.cause, "flut");
  });
});

describe("Würfel und Gegenstände", () => {
  test("Regeln: beliebig, gerade, ungerade, mindestens, höchstens, passiv", () => {
    const g = kampf("irrlicht", { unlocked: alle });
    const passt = (id, v) => { const x = g.makeGear(id); return g.fits(g.newDie(v), x); };
    assert.deepEqual([1, 2, 3, 4, 5, 6].map((v) => passt("laterne", v)), [true, true, true, true, true, true]);
    assert.deepEqual([1, 2, 3, 4, 5, 6].map((v) => passt("fackel", v)), [false, true, false, true, false, true]);
    assert.deepEqual([1, 2, 3, 4, 5, 6].map((v) => passt("schleuder", v)), [true, false, true, false, true, false]);
    assert.deepEqual([3, 4].map((v) => passt("schild", v)), [false, true]);
    assert.deepEqual([3, 4].map((v) => passt("flasche", v)), [true, false]);
    assert.equal(passt("sternkarte", 6), false);
  });
  test("Laterne: Schlag in Würfelhöhe, verbessert +2; Spiegel: 7 minus Augen; Harpune: doppelt", () => {
    const g = kampf("kriecher", { unlocked: alle });
    g.gear = [g.makeGear("laterne"), g.makeGear("laterne", true), g.makeGear("spiegel"), g.makeGear("harpune")];
    setzeWuerfel(g, [4, 4, 1, 5]);
    const hp = g.enemy.hp;
    g.placeDie(0, 0); assert.equal(g.enemy.hp, hp - 4);
    g.placeDie(0, 1); assert.equal(g.enemy.hp, hp - 10);
    g.placeDie(0, 2); assert.equal(g.enemy.hp, hp - 16);
    assert.equal(g.fits(g.dice[0], g.gear[3]), true);
    g.enemy.hp = 50; g.enemy.maxHp = 50;
    g.placeDie(0, 3); assert.equal(g.enemy.hp, 40);
    assert.equal(g.dice.length, 0);
  });
  test("jeder Gegenstand nur einmal je Runde, ein Würfel geht nur einmal", () => {
    const g = kampf("irrlicht");
    setzeWuerfel(g, [2, 3]);
    assert.ok(g.placeDie(0, 0));
    assert.equal(g.placeDie(0, 0), false);
    assert.ok(g.placeDie(0, 1));
    assert.equal(g.dice.length, 0);
    assert.equal(g.placeDie(0, 1), false);
  });
  test("Schutz fängt den Schlag des Gegners ab und verfällt mit der Runde", () => {
    const g = kampf("irrlicht");            // Irrlicht schlägt zuerst 4
    setzeWuerfel(g, [6]);
    g.placeDie(0, gearIndex(g, "stab"));
    assert.equal(g.shield, 6);
    g.endTurn();
    assert.equal(g.mut, 30);
    assert.equal(g.shield, 0);
    g.dice = [];
    g.endTurn();                            // zweiter Zug: 3
    assert.equal(g.mut, 27);
  });
  test("Rum heilt nur mit kleinen Würfeln und nie über den höchsten Mut", () => {
    const g = kampf("irrlicht");
    g.mut = 20;
    setzeWuerfel(g, [5, 2]);
    assert.equal(g.placeDie(0, gearIndex(g, "flasche")), false);
    assert.ok(g.placeDie(1, gearIndex(g, "flasche")));
    assert.equal(g.mut, 23);
    g.gear[gearIndex(g, "flasche")].uses = 0;
    g.mut = 29; setzeWuerfel(g, [3]);
    g.placeDie(0, gearIndex(g, "flasche"));
    assert.equal(g.mut, 30);
  });
  test("Glocke betäubt: der Gegner setzt eine Runde aus; Netz schwächt für einen Schlag", () => {
    const g = kampf("kriecher", { unlocked: alle });   // Kriecher: 5, Schutz 3, 6
    g.gear = [g.makeGear("glocke"), g.makeGear("netz")];
    setzeWuerfel(g, [6]);
    g.placeDie(0, 0);
    assert.equal(g.intent.stunned, true);
    g.endTurn();
    assert.equal(g.mut, 30, "betäubter Gegner darf nicht schlagen");
    assert.equal(g.enemy.moveIndex, 1);
    g.endTurn();                                        // Schutz-Zug des Gegners
    setzeWuerfel(g, [4, 3]);
    g.placeDie(0, 1); g.placeDie(0, 1);                 // 7 Augen: Netz zündet
    assert.equal(g.weakened, 2);
    assert.equal(g.intent.damage, 4);                   // 6 minus 2
    g.endTurn();
    assert.equal(g.mut, 26);
    assert.equal(g.weakened, 0);
  });
  test("Zähl-Gegenstände sammeln Augen über Runden und zünden erst bei der Zahl", () => {
    const g = kampf("irrlicht", { unlocked: alle });
    g.gear = [g.makeGear("seil")];
    setzeWuerfel(g, [2, 3]);
    g.placeDie(0, 0); g.placeDie(0, 0);
    assert.equal(g.gear[0].count, 5);
    assert.equal(g.shield, 0);
    g.endTurn();
    setzeWuerfel(g, [1]);
    g.placeDie(0, 0);
    assert.equal(g.gear[0].count, 0);
    assert.equal(g.shield, 6);
  });
  test("Kompass wirft neu, Messer teilt, Dochtschere erhöht", () => {
    const g = kampf("irrlicht", { unlocked: alle });
    g.gear = [g.makeGear("kompass"), g.makeGear("messer"), g.makeGear("docht")];
    setzeWuerfel(g, [5, 2, 6]);
    g.placeDie(0, 1);
    assert.deepEqual(g.dice.map((d) => d.v).slice(0, 2), [2, 3]);
    assert.equal(g.dice.length, 4);
    g.placeDie(0, 2);
    assert.equal(g.dice[0].v, 3);
    g.placeDie(3, 0);
    assert.equal(g.dice.length, 4);
    const neu = g.dice[3].v;
    assert.ok(neu >= 1 && neu <= 6);
    assert.equal(g.placeDie(3, 2), neu <= 5, "Dochtschere nimmt nur bis 5");
  });
  test("Sternkarte gibt einen Würfel mehr, Stiefel Schutz zu Beginn, Nebel nimmt einen Würfel", () => {
    const g = new R.Game({ seed: 1, unlocked: alle });
    g.gear = [g.makeGear("sternkarte"), g.makeGear("stiefel")];
    g.startFight("nebelweib");
    assert.equal(g.dice.length, 4);
    assert.equal(g.shield, 2);
    g.dice = [];
    g.endTurn();                            // Nebelweib: 4
    g.dice = [];
    g.endTurn();                            // Nebelweib: Nebel
    assert.equal(g.dice.length, 3);
  });
  test("Rettungsring hält einmal", () => {
    const g = kampf("klabauter", { unlocked: alle });
    g.gear = [g.makeGear("ring")];
    g.mut = 3;
    g.dice = []; g.endTurn();              // Klabauter: Schutz
    g.dice = []; g.endTurn();              // Klabauter: 8
    assert.equal(g.mut, 1);
    assert.equal(g.over, false);
    g.dice = []; g.endTurn();              // Klabauter: 5
    assert.equal(g.over, true);
    assert.equal(g.cause, "mut");
  });
});

describe("Kampf, Sieg und Niederlage", () => {
  test("Schutz des Gegners fängt Schlag ab und fällt mit seinem nächsten Zug", () => {
    const g = kampf("kriecher");
    g.dice = []; g.endTurn();              // 5 kassiert
    g.dice = []; g.endTurn();              // Gegner nimmt Schutz 3
    assert.equal(g.enemy.shield, 3);
    setzeWuerfel(g, [2]);
    g.placeDie(0, gearIndex(g, "laterne"));
    assert.equal(g.enemy.shield, 1);
    assert.equal(g.enemy.hp, 18);
  });
  test("Mehrfachschlag trifft mehrmals, Schutz zählt für alle", () => {
    const g = kampf("moewen");             // 3 zweimal
    setzeWuerfel(g, [4]);
    g.placeDie(0, gearIndex(g, "stab"));
    g.endTurn();
    assert.equal(g.mut, 28);
  });
  test("Gegner besiegt: Belohnung aus dem freien Vorrat, nichts Doppeltes, höchstens drei", () => {
    const g = kampf("irrlicht");
    g.enemy.hp = 1;
    setzeWuerfel(g, [1]);
    g.placeDie(0, 0);
    assert.equal(g.screen, "reward");
    assert.equal(g.defeated, 1);
    assert.ok(g.rewardOptions.length <= 3 && g.rewardOptions.length > 0);
    for (const o of g.rewardOptions) { assert.ok(R.BASE_GEAR.includes(o.id)); assert.equal(gearIndex(g, o.id), -1); assert.equal(o.plus, false); }
    const id = g.rewardOptions[0].id;
    g.chooseReward(0);
    assert.equal(g.gear.length, 4);
    assert.equal(g.gear[3].id, id);
    assert.equal(g.screen, "map");
  });
  test("Belohnung ablehnen; mehr als fünf Gegenstände: einen ablegen", () => {
    const g = kampf("irrlicht");
    g.enemy.hp = 1; setzeWuerfel(g, [1]); g.placeDie(0, 0);
    assert.ok(g.skipReward());
    assert.equal(g.gear.length, 3);
    g.gear.push(g.makeGear("horn"), g.makeGear("seil"));
    g.startFight("irrlicht"); g.enemy.hp = 1; setzeWuerfel(g, [1]); g.placeDie(0, 0);
    g.chooseReward(0);
    assert.equal(g.screen, "drop");
    assert.equal(g.gear.length, 6);
    g.chooseDrop(5);
    assert.equal(g.gear.length, 5);
    assert.equal(g.screen, "map");
  });
  test("Wächter besiegt: verbesserte Belohnung; Blanke Hans besiegt: Nacht gewonnen", () => {
    const g = kampf("grauermann");
    g.enemy.hp = 1; setzeWuerfel(g, [1]); g.placeDie(0, 0);
    assert.equal(g.guardians, 1);
    assert.ok(g.rewardOptions.every((o) => o.plus));
    g.skipReward();
    g.startFight("blankehans");
    assert.equal(g.finalReached, true);
    g.enemy.hp = 1; setzeWuerfel(g, [1]); g.placeDie(0, 0);
    assert.equal(g.over, true);
    assert.equal(g.won, true);
    assert.equal(g.cause, "glocke");
    assert.ok(g.score > 200);
  });
  test("Mut auf null: verloren, danach geht nichts mehr", () => {
    const g = kampf("blankehans");
    g.mut = 5;
    g.dice = []; g.endTurn();
    assert.equal(g.over, true);
    assert.equal(g.won, false);
    assert.equal(g.cause, "mut");
    assert.equal(g.endTurn(), false);
    assert.equal(g.chooseNode(0), false);
  });
  test("Blanke Hans schlägt ab der fünften Runde härter", () => {
    const g = kampf("blankehans");
    const erst = g.intent.damage;
    for (let i = 0; i < 4; i++) { g.dice = []; g.endTurn(); g.mut = 30; }
    assert.equal(g.enemy.turn, 5);
    assert.equal(g.intent.damage, R.ENEMIES.blankehans.moves[0][0].n + 2);
    assert.ok(g.intent.damage > erst);
  });
  test("Springflut: mehr Lebenspunkte, härtere Schläge, mehr Punkte", () => {
    const a = kampf("irrlicht"), b = kampf("irrlicht", { springflut: 2 });
    assert.equal(b.enemy.maxHp, Math.round(a.enemy.maxHp * 1.5));
    assert.equal(b.intent.damage, a.intent.damage + 2);
  });
});

describe("Ereignisse und Rast", () => {
  function ereignis(id, seed) {
    const g = new R.Game({ seed: seed || 1 });
    g.event = id; g.screen = "event"; g.step = 1;
    return g;
  }
  test("Wrack durchsuchen kostet Flut und bringt einen Gegenstand", () => {
    const g = ereignis("wrack");
    g.chooseEvent(0);
    assert.equal(g.tide, 1);
    assert.equal(g.gear.length, 4);
    assert.equal(g.screen, "map");
  });
  test("Seehund befreien kostet Mut und heilt dann jede Runde", () => {
    const g = ereignis("seehund");
    g.chooseEvent(0);
    assert.equal(g.mut, 26);
    g.startFight("irrlicht");
    assert.equal(g.mut, 27);
  });
  test("Irrlichtpfad nimmt einen Flutschritt zurück; Glockenton bringt ein Blatt der Chronik", () => {
    const g = ereignis("irrpfad"); g.tide = 3;
    g.chooseEvent(0);
    assert.deepEqual([g.tide, g.mut], [2, 25]);
    const h = ereignis("glockenton"); h.mut = 20;
    h.chooseEvent(0);
    assert.ok(h.chronik.includes("glocken"));
    assert.equal(h.mut, 26);
    assert.ok(h.chronikUnlocked.includes("glocken"));
  });
  test("Krämer: Gegenstand gegen Mut, Verbesserung gegen Mut", () => {
    const g = ereignis("kraemer");
    g.chooseEvent(0);
    assert.equal(g.mut, 24);
    assert.equal(g.screen, "reward");
    g.chooseReward(0);
    const h = ereignis("kraemer");
    h.chooseEvent(1);
    assert.equal(h.screen, "upgrade");
    h.chooseUpgrade(0);
    assert.equal(h.gear[0].plus, true);
    assert.equal(h.gearDef(h.gear[0]).name, "Laterne+");
    assert.equal(h.screen, "map");
  });
  test("Weitergehen ändert nichts außer dem Schirm", () => {
    const g = ereignis("kreuz");
    g.chooseEvent(1);
    assert.deepEqual([g.mut, g.maxMut, g.tide, g.screen], [30, 30, 0, "map"]);
  });
  test("Rast: kurz, lang mit Flut, verbessern", () => {
    const g = new R.Game({ seed: 1 }); g.step = 1;
    g.mut = 10; g.screen = "rest"; g.chooseRest(0); assert.equal(g.mut, 18);
    g.screen = "rest"; g.chooseRest(1); assert.deepEqual([g.mut, g.tide], [30, 1]);
    g.screen = "rest"; g.chooseRest(2); assert.equal(g.screen, "upgrade");
    assert.equal(g.chooseUpgrade(9), false);
    g.chooseUpgrade(1); assert.equal(g.gear[1].plus, true);
    assert.equal(g.chooseUpgrade(1), false, "schon verbessert");
  });
});

describe("Profil über Nächte hinweg", () => {
  test("Freischaltungen hängen an Meilensteinen, nicht am Zufall", () => {
    let p = R.newProfile();
    let r = R.updateProfile(p, { won: false, stretch: 1, guardians: 0, score: 40, kit: "wattlaeuferin", springflut: 0, chronik: ["aufbruch"] });
    assert.deepEqual(r.neu.gear, []); assert.equal(r.profile.runs, 1);
    r = R.updateProfile(r.profile, { won: false, stretch: 2, guardians: 1, score: 90, kit: "wattlaeuferin", springflut: 0, chronik: ["aufbruch"] });
    assert.deepEqual(r.neu.gear, ["messer", "korb", "stiefel"]);
    assert.ok(r.neu.chronik.includes("priele") && r.neu.chronik.includes("grauermann"));
    r = R.updateProfile(r.profile, { won: true, stretch: 3, guardians: 3, finalReached: true, score: 500, kit: "wattlaeuferin", springflut: 0, chronik: ["aufbruch"] });
    assert.deepEqual(r.neu.kits, ["fischer", "gloeckner"]);
    assert.ok(r.profile.gear.includes("sternkarte") && r.profile.gear.includes("harpune"));
    assert.equal(r.profile.springflut, 1);
    assert.equal(r.profile.wins, 1);
    assert.equal(r.profile.bestScore, 500);
    assert.ok(r.profile.chronik.includes("sieg") && r.profile.chronik.includes("blankehans"));
    assert.ok(!r.profile.chronik.includes("fischer"));
    r = R.updateProfile(r.profile, { won: true, stretch: 3, guardians: 3, finalReached: true, score: 300, kit: "fischer", springflut: 1, chronik: [] }, "2026-10-27");
    assert.deepEqual(r.neu.chronik, ["fischer", "springflut"]);
    assert.equal(r.profile.springflut, 2);
    assert.equal(r.profile.daily["2026-10-27"].score, 300);
    assert.equal(r.profile.history.length, 4);
  });
  test("Verlauf behält nur die letzten zehn Nächte", () => {
    let p = R.newProfile();
    for (let i = 0; i < 14; i++) p = R.updateProfile(p, { won: false, stretch: 1, guardians: 0, score: i, kit: "wattlaeuferin", springflut: 0, chronik: [] }).profile;
    assert.equal(p.history.length, 10);
    assert.equal(p.history[0].score, 13);
    assert.equal(p.runs, 14);
  });
});

describe("Autopilot und Balance", () => {
  test("spielt jede Nacht zu Ende, mit jeder Ausrüstung und Springflut", () => {
    for (const kit of Object.keys(R.KITS)) for (let seed = 1; seed <= 15; seed++) {
      const g = new R.Game({ seed, kit, unlocked: alle, springflut: seed % 3 });
      const z = R.autoplay(g);
      assert.equal(g.over, true, `seed ${seed} ${kit} hängt nach ${z} Zügen auf ${g.screen}`);
      assert.ok(["glocke", "mut", "flut"].includes(g.cause));
    }
  });
  test("mit dem Grundvorrat gewinnt er manchmal, nicht immer; mit allem öfter; bei Springflut seltener", () => {
    const quote = (opts, n) => { let w = 0; for (let s = 1; s <= n; s++) { const g = new R.Game(Object.assign({ seed: s }, opts)); R.autoplay(g); if (g.won) w++; } return w / n; };
    const basis = quote({}, 200), frei = quote({ unlocked: alle }, 200), flut = quote({ unlocked: alle, springflut: 2 }, 200);
    assert.ok(basis >= 0.2 && basis <= 0.7, `Grundvorrat: ${basis}`);
    assert.ok(frei > basis, `alles frei ${frei} <= Grundvorrat ${basis}`);
    assert.ok(flut < frei, `Springflut ${flut} >= ${frei}`);
  });
  test("Punkte: eine gewonnene Nacht zählt mehr als eine verlorene, Springflut vervielfacht", () => {
    const g = new R.Game({ seed: 2 }); R.autoplay(g);
    const h = new R.Game({ seed: 2, springflut: 1 });
    h.defeated = g.defeated; h.guardians = g.guardians; h.step = g.step; h.mut = g.mut; h.won = g.won; h.tide = g.tide;
    assert.equal(h.computeScore(), Math.round(g.computeScore() * 1.5));
    assert.ok(g.score > 0);
  });
});
