// Der Platz: Höhenrelief, Bodenarten, Merkmale – und die Krater, die Würfe hinterlassen.
import { Rng, valueNoise, mix } from './rng.js';

export const W = 4;      // Breite in Metern
export const L = 15;     // Länge in Metern
export const CELL = 0.025;
export const NX = Math.round(W / CELL) + 1;
export const NY = Math.round(L / CELL) + 1;
const SCELL = 0.05;
const SNX = Math.round(W / SCELL) + 1;
const SNY = Math.round(L / SCELL) + 1;

// mu: Rollwiderstand, e: Rücksprung, imp: Reibung beim Aufprall, micro: Mikro-Unebenheit (m),
// wave: deren Wellenlänge, dig: wie tief Kugeln Krater schlagen
export const SURFACES = [
  { id: 0, key: 'kies', name: 'Kies', mu: 0.22, e: 0.22, imp: 0.34, micro: 0.0012, wave: 0.04, dig: 1.0, color: [214, 190, 148] },
  { id: 1, key: 'sand', name: 'Sand', mu: 0.38, e: 0.08, imp: 0.55, micro: 0.0001, wave: 0.05, dig: 1.7, color: [226, 205, 162] },
  { id: 2, key: 'lehm', name: 'Lehm', mu: 0.12, e: 0.36, imp: 0.24, micro: 0.0002, wave: 0.05, dig: 0.35, color: [190, 143, 102] },
  { id: 3, key: 'grob', name: 'Grobkies', mu: 0.25, e: 0.26, imp: 0.4, micro: 0.0045, wave: 0.07, dig: 0.7, color: [172, 164, 152] },
];

const PLACE_NAMES = [
  'Unter den Platanen', 'Am alten Brunnen', 'Hinterm Café du Midi', 'Kirchplatz', 'Am Waschhaus',
  'Beim Bäcker', 'An der Stadtmauer', 'Schulhof', 'Bei der Ölmühle', 'Am Markt', 'Unterm Glockenturm',
  'Am Lavendelfeld', 'Hinter der Post', 'Am Bahnhöfle', 'Bei den drei Bänken',
];

export class Terrain {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.h = new Float32Array(NX * NY);
    this.s = new Uint8Array(SNX * SNY);
    this.craters = [];
    this.features = [];
    this.version = 0; // steigt bei jeder Veränderung (für das Neuzeichnen)
    this.generate();
  }

  generate() {
    const rng = new Rng(mix(this.seed, 77));
    const tiltX = rng.range(-0.012, 0.012);
    const tiltY = rng.range(-0.008, 0.008);
    const a1 = rng.range(0.01, 0.024), a2 = rng.range(0.003, 0.008);
    const ns1 = mix(this.seed, 1), ns2 = mix(this.seed, 2);
    const bumps = [];
    if (Math.abs(tiltX) > 0.006) this.features.push({ type: 'gefaelle', text: 'deutliches Gefälle zur Seite' });
    if (Math.abs(tiltY) > 0.0045) this.features.push({ type: 'gefaelle', text: 'der Platz fällt der Länge nach ab' });

    const nHollow = rng.int(3);
    for (let i = 0; i < nHollow; i++) {
      const b = { x: rng.range(0.6, W - 0.6), y: rng.range(2, L - 2), r: rng.range(0.4, 0.9), d: -rng.range(0.008, 0.02) };
      bumps.push(b);
    }
    if (nHollow) this.features.push({ type: 'mulde', text: nHollow > 1 ? `${nHollow} flache Mulden` : 'eine flache Mulde' });
    if (rng.chance(0.4)) {
      bumps.push({ x: rng.range(0.6, W - 0.6), y: rng.range(2, L - 2), r: rng.range(0.4, 0.8), d: rng.range(0.008, 0.016) });
      this.features.push({ type: 'buckel', text: 'ein Buckel' });
    }

    // Platanenwurzel: ein Wulst, der von der Seite in den Platz läuft
    let root = null;
    if (rng.chance(0.5)) {
      const fromLeft = rng.chance(0.5);
      const y0 = rng.range(3, L - 3);
      const len = rng.range(1.2, 2.8);
      const ang = rng.range(-0.5, 0.5);
      const pts = [];
      for (let t = 0; t <= 1.0001; t += 0.1) {
        const xx = fromLeft ? t * len * Math.cos(ang) : W - t * len * Math.cos(ang);
        const yy = y0 + t * len * Math.sin(ang) + 0.12 * Math.sin(t * 7 + y0);
        pts.push([xx, yy]);
      }
      root = { pts, hgt: rng.range(0.012, 0.022), w: 0.045 };
      this.features.push({ type: 'wurzel', text: 'eine Platanenwurzel ragt in den Platz', pts });
    }

    // Bodenarten als Flecken
    const blobs = [];
    if (rng.chance(0.55)) blobs.push({ surf: 1, x: rng.range(0.5, W - 0.5), y: rng.range(2.5, L - 2.5), r: rng.range(0.5, 1.2), ns: mix(this.seed, 11) });
    if (rng.chance(0.5)) blobs.push({ surf: 3, x: rng.range(0.5, W - 0.5), y: rng.range(2.5, L - 2.5), r: rng.range(0.5, 1.1), ns: mix(this.seed, 12) });
    if (rng.chance(0.3)) blobs.push({ surf: 1, x: rng.range(0.5, W - 0.5), y: rng.range(2.5, L - 2.5), r: rng.range(0.4, 0.8), ns: mix(this.seed, 13) });
    let path = null;
    if (rng.chance(0.45)) {
      // Trampelpfad aus festgetretenem Lehm, schräg über den Platz
      path = { x0: rng.range(-0.5, W + 0.5), y0: rng.range(3, L - 3), ang: rng.range(-0.9, 0.9), w: rng.range(0.25, 0.45), ns: mix(this.seed, 14) };
      this.features.push({ type: 'pfad', text: 'ein festgetretener Lehmpfad quer über den Platz' });
    }
    const baseSurf = rng.chance(0.18) ? 3 : 0; // manchmal ist der ganze Platz grob
    if (baseSurf === 3) this.features.push({ type: 'grob', text: 'überall grober Kies' });
    for (const b of blobs) {
      const name = b.surf === 1 ? 'ein Sandfleck' : 'ein Fleck mit grobem Kies';
      if (!this.features.some((f) => f.text === name)) this.features.push({ type: SURFACES[b.surf].key, text: name });
    }

    // Höhen backen
    for (let j = 0; j < NY; j++) {
      const y = j * CELL;
      for (let i = 0; i < NX; i++) {
        const x = i * CELL;
        let z = tiltX * (x - W / 2) + tiltY * (y - L / 2);
        z += a1 * (valueNoise(x / 2.6, y / 2.6, ns1) - 0.5) * 2;
        z += a2 * (valueNoise(x / 0.9, y / 0.9, ns2) - 0.5) * 2;
        for (const b of bumps) {
          const dx = x - b.x, dy = y - b.y;
          z += b.d * Math.exp(-(dx * dx + dy * dy) / (b.r * b.r));
        }
        if (root) {
          const d = distToPolyline(x, y, root.pts);
          if (d < 0.2) z += root.hgt * Math.exp(-(d * d) / (root.w * root.w));
        }
        this.h[j * NX + i] = z;
      }
    }
    // Bodenarten backen
    for (let j = 0; j < SNY; j++) {
      const y = j * SCELL;
      for (let i = 0; i < SNX; i++) {
        const x = i * SCELL;
        let s = baseSurf;
        if (path) {
          const c = Math.cos(path.ang), sn = Math.sin(path.ang);
          const d = Math.abs(-(x - path.x0) * sn + (y - path.y0) * c);
          if (d + 0.15 * (valueNoise(x * 3, y * 3, path.ns) - 0.5) < path.w) s = 2;
        }
        for (const b of blobs) {
          const dx = x - b.x, dy = y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy) / b.r + 0.5 * (valueNoise(x * 2.2, y * 2.2, b.ns) - 0.5);
          if (d < 1) s = b.surf;
        }
        this.s[j * SNX + i] = s;
      }
    }
    this.root = root;
    const nameRng = new Rng(mix(this.seed, 99));
    this.name = nameRng.pick(PLACE_NAMES);
    if (!this.features.length) this.features.push({ type: 'eben', text: 'ein ebener, gepflegter Kiesplatz' });
  }

  surfaceAt(x, y) {
    const i = clampI(Math.round(x / SCELL), SNX), j = clampI(Math.round(y / SCELL), SNY);
    return SURFACES[this.s[j * SNX + i]];
  }

  // Makro-Höhe (bilinear) ohne Mikro-Unebenheit
  macro(x, y) {
    const fx = clamp(x, 0, W) / CELL, fy = clamp(y, 0, L) / CELL;
    let i = Math.floor(fx), j = Math.floor(fy);
    if (i >= NX - 1) i = NX - 2;
    if (j >= NY - 1) j = NY - 2;
    const tx = fx - i, ty = fy - j;
    const k = j * NX + i;
    const h00 = this.h[k], h10 = this.h[k + 1], h01 = this.h[k + NX], h11 = this.h[k + NX + 1];
    return (h00 * (1 - tx) + h10 * tx) * (1 - ty) + (h01 * (1 - tx) + h11 * tx) * ty;
  }

  micro(x, y, surf) {
    if (!surf.micro) return 0;
    return surf.micro * (valueNoise(x / surf.wave, y / surf.wave, this.seed ^ 0x5bd1e995) - 0.5) * 2;
  }

  height(x, y) {
    return this.macro(x, y) + this.micro(x, y, this.surfaceAt(x, y));
  }

  // Gradient der Oberfläche (inkl. Mikro-Unebenheit) -> out[0], out[1]
  gradient(x, y, out) {
    const fx = clamp(x, 0, W) / CELL, fy = clamp(y, 0, L) / CELL;
    let i = Math.floor(fx), j = Math.floor(fy);
    if (i >= NX - 1) i = NX - 2;
    if (j >= NY - 1) j = NY - 2;
    const tx = fx - i, ty = fy - j;
    const k = j * NX + i;
    const h00 = this.h[k], h10 = this.h[k + 1], h01 = this.h[k + NX], h11 = this.h[k + NX + 1];
    let gx = ((h10 - h00) * (1 - ty) + (h11 - h01) * ty) / CELL;
    let gy = ((h01 - h00) * (1 - tx) + (h11 - h10) * tx) / CELL;
    const surf = this.surfaceAt(x, y);
    if (surf.micro) {
      const e = 0.004;
      gx += (this.micro(x + e, y, surf) - this.micro(x - e, y, surf)) / (2 * e);
      gy += (this.micro(x, y + e, surf) - this.micro(x, y - e, surf)) / (2 * e);
    }
    out[0] = gx;
    out[1] = gy;
    return surf;
  }

  // Eine Kugel, die von oben einschlägt, hinterlässt eine Delle mit kleinem Wall
  addCrater(x, y, depth, radius, record = true) {
    if (x < 0 || x > W || y < 0 || y > L) return;
    const reach = radius * 2.2;
    const i0 = clampI(Math.floor((x - reach) / CELL), NX), i1 = clampI(Math.ceil((x + reach) / CELL), NX);
    const j0 = clampI(Math.floor((y - reach) / CELL), NY), j1 = clampI(Math.ceil((y + reach) / CELL), NY);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const dx = i * CELL - x, dy = j * CELL - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const dent = -depth * Math.exp(-(d * d) / (radius * radius));
        const rim = 0.3 * depth * Math.exp(-((d - 1.4 * radius) ** 2) / ((0.4 * radius) ** 2));
        this.h[j * NX + i] += dent + rim;
      }
    }
    if (record) this.craters.push([round4(x), round4(y), round4(depth), round4(radius)]);
    this.version++;
  }

  restoreCraters(list) {
    for (const c of list) this.addCrater(c[0], c[1], c[2], c[3], true);
  }

  describe() {
    return this.features.map((f) => f.text);
  }
}

function distToPolyline(x, y, pts) {
  let best = 1e9;
  for (let k = 0; k < pts.length - 1; k++) {
    const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
    const vx = bx - ax, vy = by - ay;
    const t = clamp(((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy), 0, 1);
    const dx = x - (ax + vx * t), dy = y - (ay + vy * t);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < best) best = d;
  }
  return best;
}

function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}
function clampI(v, n) {
  return v < 0 ? 0 : v > n - 1 ? n - 1 : v;
}
function round4(v) {
  return Math.round(v * 10000) / 10000;
}
