// Pétanque-Regeln für Tête-à-tête (je 3 Kugeln): wer spielt, wer punktet, wann eine Aufnahme endet.
import { W, L, Terrain } from './terrain.js';
import { makeBody, simulateThrow, BOULE_R, JACK_R } from './physics.js';
import { Rng, mix } from './rng.js';

export const BOULES = 3;
export const JACK_MIN = 6;
export const JACK_MAX = 10;
export const EDGE = 0.5;
const TIE = 0.001;

export function newMatch({ seed, mode = 'ai', target = 13, teams, terrainSeed }) {
  const rng = new Rng(mix(seed, 5));
  return {
    v: 1,
    seed: seed >>> 0,
    mode,
    target,
    teams: teams.map((t) => ({ name: t.name, human: !!t.human, profile: t.profile || null })),
    score: [0, 0],
    mene: 0,
    throwIndex: 0,
    terrainSeed: (terrainSeed ?? mix(seed, 1234)) >>> 0,
    craters: [],
    circle: { x: W / 2, y: 1.5 },
    dir: 1,
    jackThrower: rng.next() < 0.5 ? 0 : 1,
    phase: 'jack',
    bodies: [],
    remaining: [BOULES, BOULES],
    lastThrower: null,
    jackAttempt: 0,
    jackPlacer: null,
    history: [],
    stats: { carreaux: [0, 0], kisses: [0, 0], throws: [0, 0], shots: [0, 0], shotHits: [0, 0] },
    feats: [],
    winner: null,
    lastJack: null,
  };
}

export function makeTerrain(state) {
  const t = new Terrain(state.terrainSeed);
  t.restoreCraters(state.craters);
  return t;
}

export function startMene(state) {
  state.mene++;
  if (state.mene > 1 && state.lastJack) {
    const c = { x: clamp(state.lastJack.x, 1, W - 1), y: clamp(state.lastJack.y, 1, L - 1) };
    state.circle = c;
    state.dir = L - c.y >= c.y ? 1 : -1;
  } else if (state.mene === 1) {
    state.circle = { x: W / 2, y: 1.5 };
    state.dir = 1;
  }
  state.bodies = [];
  state.remaining = [BOULES, BOULES];
  state.lastThrower = null;
  state.jackAttempt = 0;
  state.jackPlacer = null;
  state.phase = 'jack';
}

export function jackRange(state) {
  const c = state.circle;
  const room = state.dir > 0 ? L - EDGE - c.y : c.y - EDGE;
  return { min: JACK_MIN, max: Math.min(JACK_MAX, room) };
}

export function validJack(state, jack) {
  if (!jack || !jack.alive) return false;
  if (jack.x < EDGE || jack.x > W - EDGE || jack.y < EDGE || jack.y > L - EDGE) return false;
  const d = Math.hypot(jack.x - state.circle.x, jack.y - state.circle.y);
  if ((jack.y - state.circle.y) * state.dir <= 0) return false;
  return d >= JACK_MIN - 1e-9 && d <= JACK_MAX + 1e-9;
}

export function getJack(state) {
  return state.bodies.find((b) => b.kind === 'jack' && b.alive) || null;
}

// Wer hält den Punkt, mit wie vielen Kugeln?
export function holder(state, bodies = state.bodies) {
  const jack = bodies.find((b) => b.kind === 'jack' && b.alive);
  if (!jack) return null;
  const list = bodies
    .filter((b) => b.kind === 'boule' && b.alive)
    .map((b) => ({ b, d: Math.hypot(b.x - jack.x, b.y - jack.y) - BOULE_R - JACK_R }))
    .sort((p, q) => p.d - q.d);
  if (!list.length) return { team: null, n: 0, list, best: [Infinity, Infinity] };
  const best = [Infinity, Infinity];
  for (const p of list) if (p.d < best[p.b.team]) best[p.b.team] = p.d;
  if (Math.abs(best[0] - best[1]) < TIE) return { team: null, tie: true, n: 0, list, best };
  const team = best[0] < best[1] ? 0 : 1;
  const n = list.filter((p) => p.b.team === team && p.d < best[1 - team]).length;
  return { team, n, list, best };
}

export function nextThrower(state) {
  if (state.mode === 'practice') return state.phase === 'jack' || state.phase === 'play' ? 0 : null;
  if (state.phase === 'jack') return state.jackPlacer ?? state.jackThrower;
  if (state.phase !== 'play') return null;
  const rem = state.remaining;
  if (!getJack(state)) return null;
  if (rem[0] === 0 && rem[1] === 0) return null;
  const h = holder(state);
  if (!h || h.team === null) {
    // keine Kugel liegt (oder Gleichstand): wer zuletzt geworfen hat, wirft noch einmal
    const t = state.lastThrower === null ? state.jackThrower : state.lastThrower;
    if (rem[t] > 0) return t;
    return rem[1 - t] > 0 ? 1 - t : null;
  }
  const other = 1 - h.team;
  if (rem[other] > 0) return other;
  if (rem[h.team] > 0) return h.team;
  return null;
}

export function meneOutcome(state) {
  const rem = state.remaining;
  if (!getJack(state)) {
    if (rem[0] > 0 && rem[1] === 0) return { team: 0, points: rem[0], reason: 'sau-aus' };
    if (rem[1] > 0 && rem[0] === 0) return { team: 1, points: rem[1], reason: 'sau-aus' };
    return { team: null, points: 0, reason: 'null' };
  }
  const h = holder(state);
  if (!h || h.team === null) return { team: null, points: 0, reason: 'gleich' };
  return { team: h.team, points: h.n, reason: 'punkt' };
}

export function newBoule(state, team) {
  const idx = BOULES - state.remaining[team];
  return makeBody('boule', team, `b${team}${idx}`);
}

export function newJack() {
  return makeBody('jack', -1, 'j');
}

// Körper zum Simulieren aus dem gespeicherten Zustand bauen
export function liveBodies(state, terrain) {
  return state.bodies
    .filter((b) => b.alive)
    .map((s) => {
      const b = makeBody(s.kind, s.team, s.id);
      b.x = s.x;
      b.y = s.y;
      b.z = terrain.height(s.x, s.y) + b.r;
      return b;
    });
}

function store(b) {
  return { id: b.id, kind: b.kind, team: b.team, x: round5(b.x), y: round5(b.y), alive: b.alive };
}

// Nach einem Wurf: Zustand fortschreiben. bodies = alle Körper nach dem Ausrollen.
export function commitThrow(state, terrain, team, bodies, thrown, shotKey) {
  const before = state.bodies.map((b) => ({ ...b }));
  state.bodies = bodies.filter((b) => b.alive).map(store);
  state.craters = terrain.craters.map((c) => c.slice());
  state.throwIndex++;
  const feats = [];
  if (state.phase === 'jack') {
    const jack = getJack(state);
    if (validJack(state, jack)) {
      state.phase = 'play';
      state.jackPlacer = null;
    } else {
      state.bodies = [];
      state.jackAttempt++;
      if (state.jackAttempt >= 2) state.jackPlacer = 1 - state.jackThrower;
      return { jackInvalid: true, feats };
    }
    return { jackValid: true, feats };
  }
  if (state.mode === 'practice') {
    state.lastThrower = team;
    analyse(state, before, team, thrown, shotKey, feats);
    return { feats, practice: true };
  }
  state.remaining[team]--;
  state.lastThrower = team;
  state.stats.throws[team]++;
  if (shotKey === 'shot') state.stats.shots[team]++;
  analyse(state, before, team, thrown, shotKey, feats);
  let ended = null;
  if (nextThrower(state) === null) ended = endMene(state);
  return { feats, ended };
}

// Ablegen der Sau von Hand (wenn der Werfer zweimal ungültig geworfen hat)
export function placeJack(state, terrain, x, y) {
  const j = newJack();
  j.x = x;
  j.y = y;
  if (!validJack(state, j)) return false;
  state.bodies = [store(j)];
  state.phase = 'play';
  state.jackPlacer = null;
  return true;
}

export function endMene(state) {
  const out = meneOutcome(state);
  const jack = getJack(state);
  if (out.team !== null) state.score[out.team] += out.points;
  state.history.push({ mene: state.mene, team: out.team, points: out.points, reason: out.reason });
  if (jack) state.lastJack = { x: jack.x, y: jack.y };
  if (out.team !== null) state.jackThrower = out.team;
  if (state.score[0] >= state.target || state.score[1] >= state.target) {
    state.phase = 'matchEnd';
    state.winner = state.score[0] > state.score[1] ? 0 : 1;
  } else {
    state.phase = 'meneEnd';
  }
  return out;
}

// Besondere Würfe erkennen (Kunststücke)
function analyse(state, before, team, thrown, shotKey, feats) {
  if (!thrown) return;
  const after = new Map(state.bodies.map((b) => [b.id, b]));
  const jackB = before.find((b) => b.kind === 'jack');
  const jackA = getJack(state);
  const tb = after.get(thrown.id);
  const hit = thrown.firstHit;
  const oppBefore = before.filter((b) => b.kind === 'boule' && b.team === 1 - team && b.alive);
  const displaced = oppBefore.filter((b) => {
    const a = after.get(b.id);
    return !a || Math.hypot(a.x - b.x, a.y - b.y) > 0.6;
  });
  if (hit && hit.air && shotKey === 'shot') {
    const target = before.find((b) => b.id === hit.id);
    if (target && target.kind === 'boule' && target.team !== team) {
      state.stats.shotHits[team]++;
      const ta = after.get(target.id);
      const moved = !ta || Math.hypot(ta.x - target.x, ta.y - target.y) > 0.5;
      if (moved && tb) {
        const dd = Math.hypot(tb.x - target.x, tb.y - target.y);
        if (dd < 0.16) {
          state.stats.carreaux[team]++;
          feats.push({ team, id: dd < 0.05 ? 'carreau-sur-place' : 'carreau', d: dd });
        }
      }
    } else if (target && target.kind === 'jack') {
      feats.push({ team, id: 'sau-getroffen' });
    }
  }
  if (displaced.length >= 2) feats.push({ team, id: 'doppelschlag' });
  if (jackB && !jackA) {
    const rem = state.remaining;
    if (rem[1 - team] === 0 && rem[team] >= 1) feats.push({ team, id: 'sau-aus', points: rem[team] });
  }
  if (tb && jackA && shotKey !== 'shot') {
    const gap = Math.hypot(tb.x - jackA.x, tb.y - jackA.y) - BOULE_R - JACK_R;
    if (gap < 0.006) {
      state.stats.kisses[team]++;
      feats.push({ team, id: 'kuss' });
    }
    if (shotKey === 'high' && gap < 0.025) feats.push({ team, id: 'plombee' });
  }
  state.feats.push(...feats.map((f) => ({ ...f, mene: state.mene })));
}

// Ganzen Wurf ohne Grafik ausführen (Bots, Tests, Fortsetzen nach Neuladen)
export function throwHeadless(state, terrain, team, shotKey, target) {
  const from = state.circle;
  const isJack = state.phase === 'jack';
  const body = isJack ? newJack() : newBoule(state, team);
  const res = simulateThrow(terrain, liveBodies(state, terrain), body, from, target, isJack ? 'half' : shotKey, { craters: true });
  return commitThrow(state, terrain, team, res.bodies, res.thrown, shotKey);
}

export function boulesOnGround(state, team) {
  return state.bodies.filter((b) => b.kind === 'boule' && b.alive && (team === undefined || b.team === team));
}

function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}
function round5(v) {
  return Math.round(v * 100000) / 100000;
}
