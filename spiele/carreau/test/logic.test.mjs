// Spiellogik: Zufall, Gelände, Physik, Regeln, KI, Fortschritt. Start: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { Rng, hashStr } from '../src/rng.js';
import { Terrain, NX, CELL, W, L } from '../src/terrain.js';
import { makeBody, simulateThrow, BOULE_R, JACK_R } from '../src/physics.js';
import { newMatch, startMene, holder, nextThrower, meneOutcome, endMene, validJack, commitThrow, makeTerrain, throwHeadless } from '../src/rules.js';
import { solveLanding, decide, villager, evaluate, aiRng } from '../src/ai.js';
import { playMatch } from '../src/headless.js';
import { exportCode, importCode } from '../src/storage.js';
import { defaultProfile, recordMatch, unlocked, expected } from '../src/career.js';
import { swayOffset, swayAmp } from '../src/game.js';

function flat(surf = 0, seed = 1) {
  const t = new Terrain(seed);
  t.h.fill(0);
  t.s.fill(surf);
  return t;
}
const FROM = { x: 2, y: 1.5 };
function boule(team, id, x, y) {
  const b = makeBody('boule', team, id);
  Object.assign(b, { x, y, z: BOULE_R });
  return b;
}
function stateWith(bodies, rem = [3, 3]) {
  const s = newMatch({ seed: 5, teams: [{ name: 'A', human: true }, { name: 'B', profile: 'zoe' }] });
  startMene(s);
  s.phase = 'play';
  s.bodies = bodies.map((b) => ({ id: b.id, kind: b.kind, team: b.team, x: b.x, y: b.y, alive: true }));
  s.remaining = rem;
  return s;
}
const jackAt = (x, y) => ({ id: 'j', kind: 'jack', team: -1, x, y });

test('Zufall ist reproduzierbar', () => {
  const a = new Rng(42), b = new Rng(42);
  for (let i = 0; i < 100; i++) assert.equal(a.next(), b.next());
  assert.notEqual(new Rng(1).next(), new Rng(2).next());
  assert.equal(hashStr('carreau'), hashStr('carreau'));
});

test('Gelände: gleiche Saat gleicher Platz, Krater verändern die Höhe', () => {
  const a = new Terrain(99), b = new Terrain(99), c = new Terrain(100);
  assert.equal(a.height(1.3, 7.7), b.height(1.3, 7.7));
  assert.equal(a.name, b.name);
  assert.notEqual(a.height(1.3, 7.7), c.height(1.3, 7.7));
  const before = a.macro(2, 5);
  a.addCrater(2, 5, 0.01, 0.04);
  assert.ok(a.macro(2, 5) < before - 0.005, 'Krater senkt den Boden');
  const r = new Terrain(99);
  r.restoreCraters(a.craters);
  assert.equal(r.macro(2, 5), a.macro(2, 5), 'Krater lassen sich wiederherstellen');
  assert.ok(a.describe().length >= 1);
});

test('Physik: hoher Wurf bleibt fast liegen, halbhoch rollt weiter', () => {
  const t = flat();
  const hi = simulateThrow(t, [], makeBody('boule', 0, 'h'), FROM, { x: 2, y: 8 }, 'high').thrown;
  const half = simulateThrow(t, [], makeBody('boule', 0, 'm'), FROM, { x: 2, y: 8 }, 'half').thrown;
  assert.ok(Math.abs(hi.y - 8) < 0.5, `Hoch landet tot (${hi.y})`);
  assert.ok(half.y - 8 > 1, `Halbhoch rollt aus (${half.y})`);
  assert.ok(Math.abs(hi.x - 2) < 1e-6);
});

test('Physik: Carreau – Volltreffer tauscht die Plätze', () => {
  const t = flat();
  const target = boule(1, 'o', 2, 9.5);
  const r = simulateThrow(t, [target], makeBody('boule', 0, 's'), FROM, { x: 2, y: 9.5 }, 'shot');
  const tb = r.thrown, ob = r.bodies[0];
  assert.ok(Math.hypot(tb.x - 2, tb.y - 9.5) < 0.1, 'Schütze bleibt liegen');
  assert.ok(!ob.alive || Math.hypot(ob.x - 2, ob.y - 9.5) > 2, 'Getroffene Kugel fliegt weg');
  assert.equal(tb.firstHit.id, 'o');
  assert.equal(tb.firstHit.air, true);
});

test('Physik: Gefälle lenkt rollende Kugeln, gleiche Eingabe gleiches Ergebnis', () => {
  const t = flat();
  for (let j = 0; j < t.h.length / NX; j++) for (let i = 0; i < NX; i++) t.h[j * NX + i] = 0.012 * i * CELL;
  const a = simulateThrow(t, [], makeBody('boule', 0, 'a'), FROM, { x: 2, y: 3.5 }, 'roll').thrown;
  const b = simulateThrow(t, [], makeBody('boule', 0, 'a'), FROM, { x: 2, y: 3.5 }, 'roll').thrown;
  assert.ok(a.x < 1.97, `Kugel läuft bergab nach links (${a.x})`);
  assert.equal(a.x, b.x);
  assert.equal(a.y, b.y);
});

test('Physik: über die Linie ist tot', () => {
  const t = flat();
  const r = simulateThrow(t, [], makeBody('boule', 0, 'x'), FROM, { x: 2, y: 13 }, 'shot');
  assert.equal(r.thrown.alive, false);
});

test('Regeln: Punkt halten und zählen', () => {
  const s = stateWith([jackAt(2, 8), boule(0, 'b00', 2.05, 8), boule(0, 'b01', 2, 8.12), boule(1, 'b10', 2, 8.3), boule(0, 'b02', 2.6, 8)], [0, 2]);
  const h = holder(s);
  assert.equal(h.team, 0);
  assert.equal(h.n, 2, 'zwei Kugeln liegen besser als die beste gegnerische');
  assert.equal(nextThrower(s), 1, 'wer nicht hält, wirft');
  s.remaining = [1, 0];
  assert.equal(nextThrower(s), 0, 'hat der Gegner keine Kugeln mehr, wirft der Halter weiter');
  s.remaining = [0, 0];
  assert.equal(nextThrower(s), null);
  const out = endMene(s);
  assert.deepEqual([out.team, out.points], [0, 2]);
  assert.deepEqual(s.score, [2, 0]);
  assert.equal(s.jackThrower, 0, 'Sieger der Aufnahme wirft die nächste Sau');
});

test('Regeln: Sau im Aus', () => {
  const s = stateWith([boule(0, 'b00', 2, 8)], [2, 0]);
  assert.deepEqual(meneOutcome(s), { team: 0, points: 2, reason: 'sau-aus' });
  s.remaining = [1, 1];
  assert.equal(meneOutcome(s).team, null);
});

test('Regeln: gültige Sau und nächster Kreis', () => {
  const s = newMatch({ seed: 9, teams: [{ name: 'A' }, { name: 'B' }] });
  startMene(s);
  assert.ok(validJack(s, { alive: true, x: 2, y: 1.5 + 7 }));
  assert.ok(!validJack(s, { alive: true, x: 2, y: 1.5 + 5 }), 'zu kurz');
  assert.ok(!validJack(s, { alive: true, x: 0.2, y: 8 }), 'zu nah am Rand');
  s.lastJack = { x: 1.6, y: 10.5 };
  startMene(s);
  assert.deepEqual(s.circle, { x: 1.6, y: 10.5 });
  assert.equal(s.dir, -1, 'gespielt wird zur Seite mit mehr Platz');
});

test('Regeln: ungültige Sau zweimal – der Gegner legt sie', () => {
  const s = newMatch({ seed: 3, teams: [{ name: 'A' }, { name: 'B' }] });
  const t = makeTerrain(s);
  startMene(s);
  const thrower = s.jackThrower;
  throwHeadless(s, t, thrower, 'half', { x: 2, y: 3 });
  assert.equal(s.phase, 'jack');
  throwHeadless(s, t, thrower, 'half', { x: 2, y: 3 });
  assert.equal(nextThrower(s), 1 - thrower);
});

test('KI: Löser trifft den Zielpunkt auf ebenem Kies', () => {
  const t = flat();
  for (const k of ['roll', 'half', 'high']) {
    const sol = solveLanding(t, FROM, { x: 2.3, y: 8.4 }, k);
    assert.ok(sol.e < 0.05, `${k}: Abweichung ${sol.e}`);
  }
});

test('KI: Zoé schießt eine Kugel weg, die an der Sau klebt', () => {
  const s = stateWith([jackAt(2, 8.5), boule(0, 'b00', 2, 8.45)], [2, 3]);
  s.circle = { ...FROM };
  const t = flat();
  const d = decide(s, t, 1, villager('zoe'), aiRng(s, 1));
  assert.equal(d.shotKey, 'shot');
  const m = decide(s, t, 1, villager('marcel'), aiRng(s, 1));
  assert.notEqual(m.shotKey, 'shot', 'Opa Marcel legt lieber');
});

test('KI: Bewertung bevorzugt den Punkt', () => {
  const near = [{ kind: 'jack', alive: true, x: 2, y: 8 }, { kind: 'boule', team: 0, alive: true, x: 2, y: 8.08 }, { kind: 'boule', team: 1, alive: true, x: 2, y: 8.5 }];
  assert.ok(evaluate(near, [2, 2], 0) > 0);
  assert.ok(evaluate(near, [2, 2], 1) < 0);
});

test('Ganze Partie läuft durch und ist reproduzierbar', () => {
  const p = [{ profile: villager('marcel') }, { profile: villager('lucien') }];
  const a = playMatch({ seed: 77, players: p, target: 7 });
  const b = playMatch({ seed: 77, players: p, target: 7 });
  assert.ok(Math.max(...a.score) >= 7);
  assert.equal(a.state.phase, 'matchEnd');
  assert.deepEqual(a.score, b.score);
});

test('Pendel: Ausschlag begrenzt, wächst bei zu langem Halten', () => {
  const amp = swayAmp('half', 8);
  let m1 = 0, m2 = 0;
  for (let t = 0; t < 2; t += 0.01) m1 = Math.max(m1, Math.abs(swayOffset(amp, t, [0, 0]).len));
  for (let t = 4; t < 6; t += 0.01) m2 = Math.max(m2, Math.abs(swayOffset(amp, t, [0, 0]).len));
  assert.ok(m1 <= amp + 1e-9);
  assert.ok(m2 > m1 * 1.5, 'wer zu lange zielt, zittert');
  assert.equal(swayOffset(amp, 0, [0, 0]).lat, 0);
});

test('Fortschritt: Sicherungscode hin und zurück, Wertung, Freischalten', () => {
  const p = defaultProfile();
  assert.deepEqual(unlocked(p), ['lucien', 'marcel']);
  const s = newMatch({ seed: 1, mode: 'ai', target: 13, teams: [{ name: 'Du', human: true }, { name: 'Lucien', profile: 'lucien' }] });
  s.score = [13, 0];
  s.winner = 0;
  s.history = [{ team: 0, points: 3 }];
  const r = recordMatch(p, s);
  assert.ok(r.delta > 0 && p.rating > 900);
  assert.ok(r.newFeats.includes('fanny') && r.newFeats.includes('mene3'));
  assert.ok(unlocked(p).includes('zoe'));
  const back = importCode(exportCode(p));
  assert.equal(back.rating, p.rating);
  assert.deepEqual(back.feats, p.feats);
  assert.throws(() => importCode('quatsch'));
  assert.ok(Math.abs(expected(1000, 1000) - 0.5) < 1e-9);
});
