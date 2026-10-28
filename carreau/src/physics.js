// Physik der Kugeln: Flug, Aufprall, Rollen auf Gefälle, Stöße Stahl auf Stahl, Bande.
// Rein und deterministisch: läuft im Browser, in den Tests und in den Bot-Partien identisch.
import { W, L } from './terrain.js';

export const G = 9.81;
export const BOULE_R = 0.0375;
export const BOULE_M = 0.7;
export const JACK_R = 0.015;
export const JACK_M = 0.018;
export const BOARD = 0.12; // Bande liegt 12 cm hinter der Auslinie
const DEG = Math.PI / 180;
const K_ROLL = 5 / 7; // rollende Vollkugel
const E_STEEL = 0.8;
const E_JACK = 0.55;

export const SHOTS = {
  roll: { key: 'roll', name: 'Rollen', angle: 10 * DEG, h0: 0.5 },
  half: { key: 'half', name: 'Halbhoch', angle: 36 * DEG, h0: 0.6 },
  high: { key: 'high', name: 'Hoch', angle: 60 * DEG, h0: 0.75 },
  shot: { key: 'shot', name: 'Schießen', angle: 24 * DEG, h0: 1.0 },
};
export const SHOT_KEYS = ['roll', 'half', 'high', 'shot'];

export function makeBody(kind, team, id) {
  const jack = kind === 'jack';
  return {
    id, kind, team,
    r: jack ? JACK_R : BOULE_R,
    m: jack ? JACK_M : BOULE_M,
    x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
    air: false, moving: false, alive: true, out: false,
    thrown: false, firstHit: null, landings: 0, path: null,
  };
}

export function cloneBody(b) {
  return { ...b, path: null, firstHit: null };
}

// Abwurfgeschwindigkeit, damit die Kugel unter dem gegebenen Winkel genau auf dem Ziel landet
export function launchVelocity(fx, fy, z0, angle, tx, ty, zt) {
  const dx = tx - fx, dy = ty - fy;
  const d = Math.max(0.05, Math.hypot(dx, dy));
  let a = angle;
  let denom = 2 * Math.cos(a) ** 2 * (d * Math.tan(a) - (zt - z0));
  while (denom <= 1e-4 && a < 80 * DEG) {
    a += 2 * DEG;
    denom = 2 * Math.cos(a) ** 2 * (d * Math.tan(a) - (zt - z0));
  }
  const v = Math.sqrt((G * d * d) / Math.max(denom, 1e-4));
  const vh = v * Math.cos(a);
  return { vx: (vh * dx) / d, vy: (vh * dy) / d, vz: v * Math.sin(a), speed: v };
}

export function launch(terrain, body, from, target, shotKey) {
  const s = SHOTS[shotKey] || SHOTS.half;
  const z0 = terrain.height(from.x, from.y) + s.h0;
  const zt = terrain.height(target.x, target.y) + body.r;
  const v = launchVelocity(from.x, from.y, z0, s.angle, target.x, target.y, zt);
  body.x = from.x;
  body.y = from.y;
  body.z = z0;
  body.vx = v.vx;
  body.vy = v.vy;
  body.vz = v.vz;
  body.air = true;
  body.moving = true;
  body.alive = true;
  body.out = false;
  body.thrown = true;
  body.shot = shotKey;
  body.landings = 0;
  body.firstHit = null;
  return v.speed;
}

const gbuf = [0, 0];

export class World {
  constructor(terrain, bodies, opts = {}) {
    this.terrain = terrain;
    this.bodies = bodies;
    this.time = 0;
    this.events = opts.events ? [] : null;
    this.craters = opts.craters !== false;
    this.trace = !!opts.trace;
  }

  atRest() {
    for (const b of this.bodies) if (b.alive && b.moving) return false;
    return true;
  }

  maxSpeed() {
    let m = 0;
    for (const b of this.bodies) {
      if (!b.alive || !b.moving) continue;
      const s = Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.vz);
      if (s > m) m = s;
    }
    return m;
  }

  emit(e) {
    if (this.events) this.events.push(e);
  }

  step() {
    const vmax = this.maxSpeed();
    let dt = vmax > 0 ? 0.006 / vmax : 1 / 120;
    if (dt > 1 / 120) dt = 1 / 120;
    if (dt < 1 / 2500) dt = 1 / 2500;
    const t = this.terrain;
    for (const b of this.bodies) {
      if (!b.alive || !b.moving) continue;
      if (b.air) {
        b.vz -= G * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.z += b.vz * dt;
        const gh = t.height(b.x, b.y);
        if (b.z - b.r <= gh) this.land(b, gh);
      } else {
        const surf = t.gradient(b.x, b.y, gbuf);
        const fr = surf.mu * G * (b.kind === 'jack' ? 1.15 : 1);
        let ax = -K_ROLL * G * gbuf[0];
        let ay = -K_ROLL * G * gbuf[1];
        const v = Math.hypot(b.vx, b.vy);
        if (v < 0.012) {
          if (Math.hypot(ax, ay) <= fr * 1.3) {
            b.vx = 0;
            b.vy = 0;
            b.moving = false;
            b.z = t.height(b.x, b.y) + b.r;
            continue;
          }
        }
        if (v > 1e-6) {
          ax -= (fr * b.vx) / v;
          ay -= (fr * b.vy) / v;
        }
        const nvx = b.vx + ax * dt, nvy = b.vy + ay * dt;
        if (v > 1e-6 && nvx * b.vx + nvy * b.vy <= 0) {
          b.vx = 0;
          b.vy = 0;
        } else {
          b.vx = nvx;
          b.vy = nvy;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.z = t.height(b.x, b.y) + b.r;
      }
      this.bounds(b);
      if (this.trace && b.path) {
        const last = b.path[b.path.length - 1];
        if (!last || Math.abs(last[0] - b.x) + Math.abs(last[1] - b.y) > 0.03) b.path.push([b.x, b.y, b.air ? 1 : 0]);
      }
    }
    this.collide();
    this.time += dt;
    return dt;
  }

  land(b, gh) {
    const t = this.terrain;
    const surf = t.surfaceAt(b.x, b.y);
    const impact = -b.vz;
    b.z = gh + b.r;
    if (impact > 0) {
      const inField = b.x > 0 && b.x < W && b.y > 0 && b.y < L;
      if (this.craters && inField && b.kind === 'boule' && impact > 2.2) {
        const depth = Math.min(0.012, (0.0013 * (impact - 2.2) + 0.0008) * surf.dig);
        t.addCrater(b.x, b.y, depth, 0.042);
      }
      const vh = Math.hypot(b.vx, b.vy);
      const dv = surf.imp * (1 + surf.e) * impact;
      let f = vh > 1e-6 ? Math.max(0, 1 - dv / vh) : 0;
      f *= Math.max(0.05, 1 - 0.04 * surf.dig * Math.max(0, impact - 3));
      b.vx *= f;
      b.vy *= f;
      b.vz = impact * surf.e * (b.kind === 'jack' ? 0.8 : 1);
      b.landings++;
      this.emit({ type: 'land', id: b.id, kind: b.kind, impact, surf: surf.key, x: b.x, y: b.y, first: b.landings === 1 });
    }
    if (b.vz < 0.3) {
      b.vz = 0;
      b.air = false;
    }
  }

  bounds(b) {
    const lo = -BOARD + b.r;
    let hit = false;
    if (b.x < lo) { b.x = lo; b.vx = -b.vx * 0.3; b.vy *= 0.6; hit = true; }
    if (b.x > W + BOARD - b.r) { b.x = W + BOARD - b.r; b.vx = -b.vx * 0.3; b.vy *= 0.6; hit = true; }
    if (b.y < lo) { b.y = lo; b.vy = -b.vy * 0.3; b.vx *= 0.6; hit = true; }
    if (b.y > L + BOARD - b.r) { b.y = L + BOARD - b.r; b.vy = -b.vy * 0.3; b.vx *= 0.6; hit = true; }
    if (hit) this.emit({ type: 'board', id: b.id, kind: b.kind, speed: Math.hypot(b.vx, b.vy) / 0.3, x: b.x, y: b.y });
    if (!b.out && !b.air && (b.x < -b.r || b.x > W + b.r || b.y < -b.r || b.y > L + b.r)) {
      b.out = true;
      this.emit({ type: 'out', id: b.id, kind: b.kind, x: b.x, y: b.y });
    }
  }

  collide() {
    const bs = this.bodies;
    const n = bs.length;
    for (let i = 0; i < n; i++) {
      const a = bs[i];
      if (!a.alive) continue;
      for (let k = i + 1; k < n; k++) {
        const b = bs[k];
        if (!b.alive || (!a.moving && !b.moving)) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dz = a.air || b.air ? b.z - a.z : 0;
        const rr = a.r + b.r;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= rr * rr) continue;
        const d = Math.sqrt(d2) || 1e-6;
        const nx = dx / d, ny = dy / d, nz = dz / d;
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny + (b.vz - a.vz) * nz;
        if (rv < 0) {
          const e = a.kind === 'jack' || b.kind === 'jack' ? E_JACK : E_STEEL;
          const j = (-(1 + e) * rv) / (1 / a.m + 1 / b.m);
          a.vx -= (j / a.m) * nx; a.vy -= (j / a.m) * ny; a.vz -= (j / a.m) * nz;
          b.vx += (j / b.m) * nx; b.vy += (j / b.m) * ny; b.vz += (j / b.m) * nz;
          if (a.firstHit === null) a.firstHit = { id: b.id, air: a.air, speed: -rv };
          if (b.firstHit === null) b.firstHit = { id: a.id, air: b.air, speed: -rv };
          this.emit({ type: 'hit', a: a.id, b: b.id, ka: a.kind, kb: b.kind, speed: -rv, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, air: a.air || b.air });
        }
        const overlap = rr - d;
        const wa = b.m / (a.m + b.m), wb = a.m / (a.m + b.m);
        a.x -= nx * overlap * wa; a.y -= ny * overlap * wa;
        b.x += nx * overlap * wb; b.y += ny * overlap * wb;
        a.moving = true;
        b.moving = true;
        for (const c of [a, b]) {
          if (!c.air) {
            if (c.vz > 0.7) c.air = true;
            else c.vz = 0;
          }
        }
      }
    }
  }

  run(maxTime = 15) {
    while (!this.atRest() && this.time < maxTime) this.step();
    if (!this.atRest()) for (const b of this.bodies) { b.moving = false; b.vx = b.vy = b.vz = 0; b.air = false; }
    this.finish();
    return this;
  }

  // Tote Kugeln (über die Linie) aus dem Spiel nehmen
  finish() {
    for (const b of this.bodies) if (b.out) b.alive = false;
  }
}

// Bequemer Helfer: ganzen Wurf ohne Grafik durchrechnen
export function simulateThrow(terrain, bodies, thrown, from, target, shotKey, opts = {}) {
  const list = bodies.map(cloneBody);
  const tb = cloneBody(thrown);
  list.push(tb);
  launch(terrain, tb, from, target, shotKey);
  const world = new World(terrain, list, { craters: false, ...opts });
  world.run(opts.maxTime || 15);
  return { bodies: list, thrown: tb, events: world.events, time: world.time };
}
