// Die Leute aus Saint-Aurel: jede Figur spielt mit eigener Hand (Streuung) und eigenem Kopf (Taktik).
import { simulateThrow, makeBody, BOULE_R, JACK_R } from './physics.js';
import { W, L } from './terrain.js';
import { liveBodies, newBoule, newJack, jackRange, EDGE } from './rules.js';
import { Rng, mix } from './rng.js';

// sigma: Streuung des Landepunkts in Metern bei 8 m Wurfweite
export const VILLAGERS = [
  {
    id: 'lucien', name: 'Lucien', title: 'der Bäckerjunge', rating: 800, color: '#d39b5a',
    blurb: 'Spielt erst seit dem Sommer. Wirft alles halbhoch und schießt fast nie.',
    sigma: { roll: 0.55, half: 0.42, high: 0.6, shot: 0.55 }, lofts: ['half'], shootBias: -1.6,
    jackShots: false, samples: 3, jackDist: [6.5, 8], think: 0.5,
  },
  {
    id: 'marcel', name: 'Opa Marcel', title: 'der Leger', rating: 1000, color: '#8a6f4e',
    blurb: 'Rollt seine Kugeln mit Engelsgeduld an die Sau und legt sie gern weit.',
    sigma: { roll: 0.15, half: 0.21, high: 0.32, shot: 0.36 }, lofts: ['roll', 'half'], shootBias: -0.5,
    jackShots: false, samples: 5, jackDist: [8.5, 10], think: 0.7,
  },
  {
    id: 'zoe', name: 'Zoé', title: 'die Schützin', rating: 1150, color: '#c4513d',
    blurb: 'Legt mittelmäßig, schießt aber wie ein Uhrwerk. Wer zu nah legt, wird abgeräumt.',
    sigma: { roll: 0.32, half: 0.27, high: 0.36, shot: 0.085 }, lofts: ['half'], shootBias: 0.45,
    jackShots: false, samples: 5, jackDist: [6, 7], think: 0.6,
  },
  {
    id: 'fernand', name: 'Fernand', title: 'der Postbote', rating: 1250, color: '#3f6e8c',
    blurb: 'Wirft hohe Bogenkugeln, die wie Steine liegen bleiben. Rauer Boden ist ihm egal.',
    sigma: { roll: 0.36, half: 0.22, high: 0.13, shot: 0.22 }, lofts: ['high', 'half'], shootBias: -0.1,
    jackShots: false, samples: 5, jackDist: [7, 9], think: 0.8,
  },
  {
    id: 'roux', name: 'Madame Roux', title: 'die Taktikerin', rating: 1350, color: '#6b4a7a',
    blurb: 'Sieht drei Würfe voraus, verschiebt die Sau und legt dir Kugeln in den Weg.',
    sigma: { roll: 0.16, half: 0.15, high: 0.19, shot: 0.13 }, lofts: ['roll', 'half', 'high'], shootBias: 0,
    jackShots: true, samples: 7, jackDist: [6, 10], think: 1.0,
  },
  {
    id: 'bernadette', name: 'Bernadette', title: 'die Bürgermeisterin', rating: 1500, color: '#2f5d50',
    blurb: 'Dreifache Dorfmeisterin. Spielt jede Wurfart und macht kaum Fehler.',
    sigma: { roll: 0.1, half: 0.1, high: 0.12, shot: 0.075 }, lofts: ['roll', 'half', 'high'], shootBias: 0,
    jackShots: true, samples: 8, jackDist: [6, 10], think: 1.1,
  },
];

export function villager(id) {
  return VILLAGERS.find((v) => v.id === id) || VILLAGERS[0];
}

// Bot-Profile für die Messung
export function botProfile(sigmaScale = 1, opts = {}) {
  const base = villager('roux');
  const sigma = {};
  for (const k in base.sigma) sigma[k] = base.sigma[k] * sigmaScale;
  return { ...base, id: 'bot', name: 'Bot', sigma, ...opts };
}

export function errorScale(dist) {
  return 0.35 + (0.65 * dist) / 8;
}

export function aimError(profile, shotKey, dist, rng) {
  const s = profile.sigma[shotKey] * errorScale(dist);
  return { lat: rng.gauss() * s * 0.7, len: rng.gauss() * s };
}

export function applyError(from, target, err) {
  const dx = target.x - from.x, dy = target.y - from.y;
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d, uy = dy / d;
  return { x: target.x + ux * err.len - uy * err.lat, y: target.y + uy * err.len + ux * err.lat };
}

// Welcher Landepunkt bringt eine Kugel (allein auf dem Platz) genau zum Ziel?
export function solveLanding(terrain, from, goal, shotKey, kind = 'boule', iters = 8) {
  const dx = goal.x - from.x, dy = goal.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist, uy = dy / dist, px = -uy, py = ux;
  const frac = { roll: 0.35, half: 0.72, high: 0.95, shot: 0.8 }[shotKey] ?? 0.7;
  let s = dist * frac, lat = 0;
  let prevS = null, prevA = null, best = null;
  for (let it = 0; it < iters; it++) {
    const land = { x: from.x + ux * s + px * lat, y: from.y + uy * s + py * lat };
    const body = makeBody(kind, 0, 'probe');
    const r = simulateThrow(terrain, [], body, from, land, shotKey, { craters: false });
    const fx = r.thrown.x - from.x, fy = r.thrown.y - from.y;
    const along = fx * ux + fy * uy, side = fx * px + fy * py;
    const err = dist - along;
    const e2 = Math.hypot(err, side);
    if (!best || e2 < best.e) best = { land, e: e2, end: { x: r.thrown.x, y: r.thrown.y } };
    if (e2 < 0.012) break;
    let ns;
    if (prevS !== null && Math.abs(along - prevA) > 1e-4) ns = s + (err * (s - prevS)) / (along - prevA);
    else ns = s + err * (shotKey === 'roll' ? 0.3 : shotKey === 'half' ? 0.5 : 0.9);
    prevS = s;
    prevA = along;
    s = Math.min(dist + 1.5, Math.max(0.3, ns));
    lat -= side * Math.min(1, Math.max(0.3, s / Math.max(0.5, along)));
  }
  return best;
}

// Bewertung einer Lage aus Sicht von "me": erwartete Punkte dieser Aufnahme.
// Kleines rekursives Modell: Wer nicht hält, wirft; mit Wahrscheinlichkeit p(d) nimmt er den Punkt.
function pRetake(d) {
  return Math.min(0.85, Math.max(0.12, 0.15 + 1.2 * d));
}
function expect(remH, remN, d, n) {
  if (remN === 0) return n + remH * 0.45;
  const p = pRetake(d);
  return p * -expect(remN - 1, remH, d * 0.5, 1) + (1 - p) * expect(remH, remN - 1, d, n);
}

export function evaluate(bodies, rem, me) {
  const op = 1 - me;
  const jack = bodies.find((b) => b.kind === 'jack' && b.alive);
  if (!jack) {
    if (rem[me] > 0 && rem[op] === 0) return rem[me];
    if (rem[op] > 0 && rem[me] === 0) return -rem[op];
    return 0;
  }
  const best = [Infinity, Infinity];
  const ds = [];
  for (const b of bodies) {
    if (b.kind !== 'boule' || !b.alive) continue;
    const d = Math.hypot(b.x - jack.x, b.y - jack.y) - BOULE_R - JACK_R;
    ds.push([b.team, d]);
    if (d < best[b.team]) best[b.team] = d;
  }
  if (!ds.length) return 0.3 * (rem[me] - rem[op]);
  const h = best[0] < best[1] ? 0 : 1;
  const nh = 1 - h;
  const n = ds.filter(([t, d]) => t === h && d < best[nh]).length;
  const v = expect(rem[h], rem[nh], Math.max(0, best[h]), n);
  return h === me ? v : -v;
}

function candidates(state, terrain, team, profile) {
  const jack = state.bodies.find((b) => b.kind === 'jack' && b.alive);
  const from = state.circle;
  const out = [];
  if (!jack) return out;
  const dx = jack.x - from.x, dy = jack.y - from.y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d, uy = dy / d, px = -uy, py = ux;
  const touch = BOULE_R + JACK_R + 0.004;
  const goals = [
    { tag: 'an die Sau', x: jack.x - ux * touch, y: jack.y - uy * touch },
    { tag: 'hinter die Sau', x: jack.x + ux * 0.12, y: jack.y + uy * 0.12 },
    { tag: 'neben die Sau', x: jack.x - ux * 0.03 + px * 0.09, y: jack.y - uy * 0.03 + py * 0.09 },
    { tag: 'neben die Sau', x: jack.x - ux * 0.03 - px * 0.09, y: jack.y - uy * 0.03 - py * 0.09 },
  ];
  const mine = state.bodies.filter((b) => b.kind === 'boule' && b.alive && b.team === team);
  if (mine.length) goals.push({ tag: 'vorlegen', x: jack.x - ux * 0.35, y: jack.y - uy * 0.35 });
  if (profile.jackShots) goals.push({ tag: 'Sau schieben', x: jack.x + ux * 0.25, y: jack.y + uy * 0.25 });
  for (const loft of profile.lofts) {
    for (const g of goals) {
      const sol = solveLanding(terrain, from, g, loft);
      if (sol) out.push({ shotKey: loft, target: sol.land, label: 'legt', tag: g.tag });
    }
  }
  const opp = state.bodies.filter((b) => b.kind === 'boule' && b.alive && b.team !== team);
  for (const b of opp) {
    if (Math.hypot(b.x - jack.x, b.y - jack.y) < 1.6) out.push({ shotKey: 'shot', target: { x: b.x, y: b.y }, label: 'schießt', tag: 'auf deine Kugel', targetId: b.id });
  }
  if (profile.jackShots) out.push({ shotKey: 'shot', target: { x: jack.x, y: jack.y }, label: 'schießt', tag: 'auf die Sau', targetId: 'j' });
  return out;
}

export function decide(state, terrain, team, profile, rng) {
  if (state.phase === 'jack') return decideJack(state, terrain, team, profile, rng);
  const cands = candidates(state, terrain, team, profile);
  const from = state.circle;
  const bodies = liveBodies(state, terrain);
  const rem = state.remaining.slice();
  rem[team]--;
  let best = null;
  for (const c of cands) {
    let sum = 0;
    const dist = Math.hypot(c.target.x - from.x, c.target.y - from.y);
    for (let k = 0; k < profile.samples; k++) {
      const land = applyError(from, c.target, aimError(profile, c.shotKey, dist, rng));
      const r = simulateThrow(terrain, bodies, newBoule(state, team), from, land, c.shotKey, { craters: false });
      for (const b of r.bodies) if (b.out) b.alive = false;
      sum += evaluate(r.bodies, rem, team);
    }
    let v = sum / profile.samples;
    if (c.shotKey === 'shot') v += profile.shootBias;
    v += rng.gauss() * 0.02; // kleine Unentschlossenheit
    if (!best || v > best.value) best = { ...c, value: v };
  }
  if (!best) {
    const jack = state.bodies.find((b) => b.kind === 'jack' && b.alive) || { x: from.x, y: from.y + state.dir * 7 };
    best = { shotKey: 'half', target: { x: jack.x, y: jack.y - state.dir * 1.5 }, label: 'legt', tag: 'an die Sau', value: 0 };
  }
  return best;
}

function decideJack(state, terrain, team, profile, rng) {
  const rngJ = jackRange(state);
  const [a, b] = profile.jackDist;
  const dist = Math.min(rngJ.max - 0.3, Math.max(rngJ.min + 0.3, rng.range(a, b)));
  const c = state.circle;
  const lat = rng.range(-0.8, 0.8);
  let gx = Math.min(W - EDGE - 0.4, Math.max(EDGE + 0.4, c.x + lat));
  const gy = c.y + state.dir * Math.sqrt(Math.max(1, dist * dist - (gx - c.x) ** 2));
  if (state.jackPlacer !== null && state.jackPlacer !== undefined) {
    return { place: true, target: { x: gx, y: gy }, label: 'legt die Sau', tag: '' };
  }
  const sol = solveLanding(terrain, c, { x: gx, y: gy }, 'half', 'jack', 5);
  return { shotKey: 'half', target: sol ? sol.land : { x: gx, y: gy }, label: 'wirft die Sau', tag: '' };
}

// Ausführung mit der eigenen Hand des Profils
export function execute(state, decision, profile, rng) {
  const from = state.circle;
  const dist = Math.hypot(decision.target.x - from.x, decision.target.y - from.y);
  const key = state.phase === 'jack' ? 'half' : decision.shotKey;
  const sig = state.phase === 'jack' ? { ...profile, sigma: { half: profile.sigma.half * 0.8 } } : profile;
  return applyError(from, decision.target, aimError(sig, key, dist, rng));
}

// Zufallsspieler für die Messung: wirft irgendeine Wurfart irgendwohin in Richtung Sau
export function randomDecide(state, terrain, team, rng) {
  const from = state.circle;
  if (state.phase === 'jack') {
    const d = rng.range(5.5, 10.5);
    const lat = rng.range(-1, 1);
    const tgt = { x: from.x + lat, y: from.y + state.dir * d };
    if (state.jackPlacer !== null && state.jackPlacer !== undefined) {
      return { place: true, target: { x: Math.min(W - 0.6, Math.max(0.6, from.x + lat * 0.5)), y: from.y + state.dir * 7 } };
    }
    return { shotKey: 'half', target: tgt };
  }
  const jack = state.bodies.find((b) => b.kind === 'jack' && b.alive);
  const dx = jack.x - from.x, dy = jack.y - from.y;
  const ang = Math.atan2(dy, dx) + rng.range(-0.12, 0.12);
  const shotKey = rng.pick(['roll', 'half', 'high', 'shot']);
  const dist = rng.range(1.5, Math.hypot(dx, dy) + 1);
  return { shotKey, target: { x: from.x + Math.cos(ang) * dist, y: from.y + Math.sin(ang) * dist }, label: 'wirft' };
}

export function aiRng(state, team) {
  return new Rng(mix(mix(state.seed, state.throwIndex + 1), team + 17 + state.mene * 131));
}
