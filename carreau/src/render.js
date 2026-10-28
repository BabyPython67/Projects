// Zeichnen: der Platz als vorgebackene Textur, darüber Kugeln, Schatten, Spuren, Zielhilfe, Licht.
import { W, L, SURFACES } from './terrain.js';
import { BOARD, SHOTS, G } from './physics.js';
import { Rng, hash2, valueNoise, mix } from './rng.js';

const M = 2.4;      // Rand um das Feld in Metern (Pflaster, Bäume)
const TPX = 150;    // Texturauflösung in Pixel pro Meter
const LIGHT = norm(-0.55, 0.75);
const OBL = 0.55;   // Schrägprojektion: Höhe wird nach oben verschoben

function norm(x, y) {
  const d = Math.hypot(x, y);
  return [x / d, y / d];
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cam = { x: W / 2, y: 7, s: 50, rot: 0 };
    this.goal = { ...this.cam };
    this.insets = { top: 70, bottom: 150 };
    this.terrain = null;
    this.tex = null;
    this.time = 0;
    this.hour = 15;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.dpr = dpr;
    this.w = this.canvas.clientWidth || window.innerWidth;
    this.h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
  }

  setInsets(top, bottom) {
    this.insets = { top, bottom };
  }

  viewCenter() {
    const { top, bottom } = this.insets;
    return [this.w / 2, top + (this.h - top - bottom) / 2];
  }

  // Kamera so setzen, dass der Kasten (Weltkoordinaten) sichtbar ist
  frame(box, rot, opts = {}) {
    const pad = opts.pad ?? 18;
    const bw = Math.max(0.3, Math.abs(box.x1 - box.x0));
    const bh = Math.max(0.3, Math.abs(box.y1 - box.y0));
    const vw = this.w - pad * 2;
    const vh = this.h - this.insets.top - this.insets.bottom - pad * 2;
    let s = Math.min(vw / bw, vh / bh);
    s = Math.max(opts.minS ?? 18, Math.min(opts.maxS ?? 320, s));
    this.goal = { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2, s, rot };
    if (opts.instant) this.cam = { ...this.goal };
  }

  update(dt) {
    this.time += dt;
    const k = 1 - Math.exp(-dt * 4.5);
    const c = this.cam, g = this.goal;
    c.x += (g.x - c.x) * k;
    c.y += (g.y - c.y) * k;
    c.s = Math.exp(Math.log(c.s) + (Math.log(g.s) - Math.log(c.s)) * k);
    let dr = g.rot - c.rot;
    while (dr > Math.PI) dr -= 2 * Math.PI;
    while (dr < -Math.PI) dr += 2 * Math.PI;
    c.rot += dr * Math.min(1, k * 0.9);
  }

  proj(cam, x, y, z = 0, center = null) {
    const [vx, vy] = center || this.viewCenter();
    const dx = (x - cam.x) * cam.s, dy = -(y - cam.y) * cam.s;
    const c = Math.cos(cam.rot), sn = Math.sin(cam.rot);
    return [vx + c * dx - sn * dy, vy + sn * dx + c * dy - z * cam.s * OBL];
  }

  w2s(x, y, z = 0) {
    return this.proj(this.cam, x, y, z);
  }

  s2wDelta(dx, dy) {
    const c = Math.cos(this.cam.rot), sn = Math.sin(this.cam.rot);
    const ux = c * dx + sn * dy, uy = -sn * dx + c * dy;
    return [ux / this.cam.s, -uy / this.cam.s];
  }

  s2w(px, py) {
    const [vx, vy] = this.viewCenter();
    const [dx, dy] = this.s2wDelta(px - vx, py - vy);
    return [this.cam.x + dx, this.cam.y + dy];
  }

  // ---------- Textur des Platzes ----------
  buildTerrain(terrain) {
    if (this.tex && this.texSeed === terrain.seed && !terrain.craters.length && !this.cratersPainted) {
      this.terrain = terrain;
      return;
    }
    this.texSeed = terrain.seed;
    this.terrain = terrain;
    const tw = Math.round((W + 2 * M) * TPX), th = Math.round((L + 2 * M) * TPX);
    const cv = document.createElement('canvas');
    cv.width = tw;
    cv.height = th;
    const g = cv.getContext('2d');
    this.tex = cv;
    this.tg = g;
    const rng = new Rng(mix(terrain.seed, 4242));
    const T = (v) => (v + M) * TPX;
    // Pflaster
    g.fillStyle = '#b7a283';
    g.fillRect(0, 0, tw, th);
    const sw = 0.24, sh = 0.17;
    for (let row = 0, y = -M; y < L + M; y += sh, row++) {
      for (let x = -M - (row % 2) * sw * 0.5; x < W + M; x += sw) {
        if (x > -BOARD - 0.35 && x < W + BOARD + 0.12 && y > -BOARD - 0.35 && y < L + BOARD + 0.12) continue;
        const h = hash2(Math.round(x * 50), row, 9);
        const l = 168 + Math.round(h * 34);
        g.fillStyle = `rgb(${l + 18},${l + 4},${l - 22})`;
        roundRect(g, T(x) + 2, T(y) + 2, sw * TPX - 4, sh * TPX - 4, 5);
        g.fill();
      }
    }
    // Feld pixelweise: Bodenart, Relief-Schattierung, Körnung
    const fx0 = -BOARD, fy0 = -BOARD, fx1 = W + BOARD, fy1 = L + BOARD;
    const px0 = Math.floor(T(fx0)), py0 = Math.floor(T(fy0));
    const pw = Math.ceil((fx1 - fx0) * TPX), ph = Math.ceil((fy1 - fy0) * TPX);
    const img = g.createImageData(pw, ph);
    const d = img.data;
    const e = 0.03;
    for (let j = 0; j < ph; j++) {
      const y = fy0 + j / TPX;
      for (let i = 0; i < pw; i++) {
        const x = fx0 + i / TPX;
        const jx = (valueNoise(x * 9, y * 9, 31) - 0.5) * 0.07, jy = (valueNoise(x * 9, y * 9, 32) - 0.5) * 0.07;
        const s = terrain.surfaceAt(x + jx, y + jy);
        const gx = (terrain.macro(x + e, y) - terrain.macro(x - e, y)) / (2 * e);
        const gy = (terrain.macro(x, y + e) - terrain.macro(x, y - e)) / (2 * e);
        let shade = 1 - 11 * (gx * LIGHT[0] + gy * LIGHT[1]);
        shade = Math.max(0.68, Math.min(1.3, shade));
        const hh = hash2(i + px0, j + py0, 5);
        let grain = 1 + (hh - 0.5) * 0.09;
        if (s.key === 'kies' || s.key === 'grob') {
          if (hh < 0.07) grain *= 0.8;
          else if (hh > 0.96) grain *= 1.16;
        }
        if (s.key === 'sand') grain = 1 + (hh - 0.5) * 0.05;
        const v = valueNoise(x * 3, y * 3, 77) * 0.08 + 0.96;
        const k = shade * grain * v;
        const [r, gg, b] = s.color;
        const o = (j * pw + i) * 4;
        d[o] = Math.min(255, r * k);
        d[o + 1] = Math.min(255, gg * k);
        d[o + 2] = Math.min(255, b * k * 0.98);
        d[o + 3] = 255;
      }
    }
    g.putImageData(img, px0, py0);
    // Grobe Kiesel
    for (let k = 0; k < 2600; k++) {
      const x = rng.range(0, W), y = rng.range(0, L);
      const s = terrain.surfaceAt(x, y);
      if (s.key !== 'grob' && rng.next() > 0.08) continue;
      const r = (s.key === 'grob' ? rng.range(0.008, 0.02) : rng.range(0.005, 0.01)) * TPX;
      const l = 120 + rng.int(80);
      g.fillStyle = `rgba(${l + 10},${l + 4},${l - 6},0.9)`;
      g.beginPath();
      g.ellipse(T(x), T(y), r, r * rng.range(0.6, 1), rng.range(0, 3), 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,250,235,0.35)';
      g.beginPath();
      g.arc(T(x) - r * 0.3, T(y) + r * 0.3, r * 0.4, 0, Math.PI * 2);
      g.fill();
    }
    // Risse im Lehm
    g.strokeStyle = 'rgba(90,60,40,0.35)';
    g.lineWidth = 1;
    for (let k = 0; k < 900; k++) {
      const x = rng.range(0, W), y = rng.range(0, L);
      if (terrain.surfaceAt(x, y).key !== 'lehm') continue;
      g.beginPath();
      g.moveTo(T(x), T(y));
      let a = rng.range(0, 6.3), cx = x, cy = y;
      for (let s = 0; s < 4; s++) {
        a += rng.range(-0.8, 0.8);
        cx += Math.cos(a) * 0.04;
        cy += Math.sin(a) * 0.04;
        g.lineTo(T(cx), T(cy));
      }
      g.stroke();
    }
    // Platanenwurzel
    if (terrain.root) {
      const pts = terrain.root.pts;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const [w, col] of [[0.09, 'rgba(70,50,32,0.55)'], [0.06, '#8b6a48'], [0.025, 'rgba(200,170,130,0.55)']]) {
        g.strokeStyle = col;
        g.lineWidth = w * TPX;
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(T(x), T(y + (w < 0.03 ? 0.012 : 0))) : g.moveTo(T(x), T(y))));
        g.stroke();
      }
    }
    // Bande aus Holz
    const plank = (x, y, w, h) => {
      g.fillStyle = '#7a5434';
      g.fillRect(T(x), T(y), w * TPX, h * TPX);
      g.fillStyle = 'rgba(255,220,170,0.18)';
      g.fillRect(T(x), T(y), w * TPX, Math.min(h, 0.03) * TPX);
      g.strokeStyle = 'rgba(40,25,10,0.35)';
      g.lineWidth = 1;
      for (let k = 0; k < 6; k++) {
        g.beginPath();
        if (w > h) {
          g.moveTo(T(x), T(y + (h * (k + 0.5)) / 6));
          g.lineTo(T(x + w), T(y + (h * (k + 0.5)) / 6));
        } else {
          g.moveTo(T(x + (w * (k + 0.5)) / 6), T(y));
          g.lineTo(T(x + (w * (k + 0.5)) / 6), T(y + h));
        }
        g.stroke();
      }
    };
    const bw = 0.09;
    plank(-BOARD - bw, -BOARD - bw, W + 2 * BOARD + 2 * bw, bw);
    plank(-BOARD - bw, L + BOARD, W + 2 * BOARD + 2 * bw, bw);
    plank(-BOARD - bw, -BOARD, bw, L + 2 * BOARD);
    plank(W + BOARD, -BOARD, bw, L + 2 * BOARD);
    // Auslinie als Schnur
    g.strokeStyle = 'rgba(250,246,235,0.75)';
    g.lineWidth = 0.008 * TPX;
    g.strokeRect(T(0), T(0), W * TPX, L * TPX);
    // Platanen, Bank, Laub
    const trees = [[-1.7, 3.6, 0.36], [W + 1.6, 10.8, 0.4], [-1.9, 13.2, 0.3]];
    if (terrain.root) {
      const p0 = terrain.root.pts[0];
      trees.push([p0[0] < 1 ? -0.9 : W + 0.9, p0[1], 0.38]);
    }
    for (const [x, y, r] of trees) drawTrunk(g, T(x), T(y), r * TPX, rng);
    drawBench(g, T(-1.1), T(7.4), TPX, true);
    drawBench(g, T(W + 1.1), T(5.2), TPX, true);
    for (let k = 0; k < 70; k++) {
      const x = rng.range(-M + 0.2, W + M - 0.2), y = rng.range(-M + 0.2, L + M - 0.2);
      const inField = x > 0 && x < W && y > 0 && y < L;
      if (inField && rng.next() > 0.2) continue;
      drawLeaf(g, T(x), T(y), rng.range(0.06, 0.1) * TPX, rng.range(0, 6.3), rng);
    }
    this.cratersPainted = 0;
    this.paintCraters();
    this.buildShade(terrain);
  }

  paintCraters() {
    const t = this.terrain;
    if (!t || !this.tg) return;
    const g = this.tg;
    const T = (v) => (v + M) * TPX;
    for (let k = this.cratersPainted; k < t.craters.length; k++) {
      const [x, y, depth, r] = t.craters[k];
      const a = Math.min(0.5, depth * 45);
      const rad = g.createRadialGradient(T(x), T(y), 0, T(x), T(y), r * 1.6 * TPX);
      rad.addColorStop(0, `rgba(60,42,25,${a})`);
      rad.addColorStop(0.55, `rgba(80,58,36,${a * 0.6})`);
      rad.addColorStop(0.8, `rgba(255,245,220,${a * 0.45})`);
      rad.addColorStop(1, 'rgba(255,245,220,0)');
      g.fillStyle = rad;
      g.beginPath();
      g.arc(T(x), T(y), r * 1.6 * TPX, 0, Math.PI * 2);
      g.fill();
    }
    this.cratersPainted = t.craters.length;
  }

  // Platanenschatten: weiche Flecken, die im Wind wandern
  buildShade(terrain) {
    const sp = 28;
    const cw = Math.round((W + 2 * M) * sp), ch = Math.round((L + 2 * M) * sp);
    const cv = document.createElement('canvas');
    cv.width = cw;
    cv.height = ch;
    const g = cv.getContext('2d');
    const img = g.createImageData(cw, ch);
    const seed = mix(terrain.seed, 555);
    for (let j = 0; j < ch; j++) {
      for (let i = 0; i < cw; i++) {
        const x = i / sp - M, y = j / sp - M;
        const n = valueNoise(x / 0.8, y / 0.8, seed) * 0.55 + valueNoise(x / 0.22, y / 0.22, seed + 1) * 0.45;
        const big = valueNoise(x / 5, y / 5, seed + 2);
        const a = Math.max(0, Math.min(1, (n - 0.52) * 7)) * Math.max(0, Math.min(1, (big - 0.3) * 2.5));
        const o = (j * cw + i) * 4;
        img.data[o] = 20;
        img.data[o + 1] = 30;
        img.data[o + 2] = 40;
        img.data[o + 3] = a * 255;
      }
    }
    g.putImageData(img, 0, 0);
    this.shade = cv;
  }

  worldTransform(ctx, cam, center) {
    const [vx, vy] = center || this.viewCenter();
    ctx.translate(vx, vy);
    ctx.rotate(cam.rot);
    ctx.scale(cam.s, -cam.s);
    ctx.translate(-cam.x, -cam.y);
  }

  // ---------- Bild zusammensetzen ----------
  draw(scene) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#a8957a';
    ctx.fillRect(0, 0, this.w, this.h);
    if (!this.tex) return;
    if (this.terrain && this.cratersPainted !== this.terrain.craters.length) this.paintCraters();
    this.drawWorld(ctx, this.cam, scene, null, true);
    this.drawLight(ctx);
    if (scene.lupe && this.cam.s < 150) this.drawLupe(ctx, scene);
    if (scene.circle && scene.showCircleHint) this.drawCircleHint(ctx, scene);
  }

  drawWorld(ctx, cam, scene, center, main) {
    ctx.save();
    this.worldTransform(ctx, cam, center);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.tex, -M, -M, W + 2 * M, L + 2 * M);
    // Spuren der letzten Würfe
    if (scene.traces) {
      for (const tr of scene.traces) {
        if (!tr.path || tr.path.length < 2) continue;
        ctx.strokeStyle = tr.color;
        ctx.lineWidth = 0.022;
        ctx.setLineDash([0.035, 0.03]);
        ctx.globalAlpha = tr.alpha ?? 0.35;
        ctx.beginPath();
        let on = false;
        for (const [x, y, air] of tr.path) {
          if (air) { on = false; continue; }
          if (!on) { ctx.moveTo(x, y); on = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (tr.land) {
          ctx.setLineDash([]);
          ctx.lineWidth = 0.012;
          ctx.beginPath();
          ctx.arc(tr.land[0], tr.land[1], 0.05, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.setLineDash([]);
    }
    // Wurfkreis (roter Kunststoffring)
    if (scene.circle) {
      ctx.strokeStyle = 'rgba(60,20,10,0.3)';
      ctx.lineWidth = 0.035;
      ctx.beginPath();
      ctx.arc(scene.circle.x + 0.012, scene.circle.y - 0.012, 0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#c8372b';
      ctx.lineWidth = 0.028;
      ctx.beginPath();
      ctx.arc(scene.circle.x, scene.circle.y, 0.25, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (scene.jackZone && main) {
      const z = scene.jackZone;
      ctx.fillStyle = 'rgba(255,250,230,0.10)';
      ctx.strokeStyle = 'rgba(255,250,230,0.45)';
      ctx.lineWidth = 0.015;
      ctx.setLineDash([0.08, 0.06]);
      ctx.beginPath();
      const a0 = scene.dir > 0 ? 0 : Math.PI;
      ctx.arc(z.x, z.y, z.max, a0, a0 + Math.PI);
      ctx.arc(z.x, z.y, z.min, a0 + Math.PI, a0, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Schatten der Platanen
    if (this.shade) {
      const wx = Math.sin(this.time * 0.35) * 0.06 + Math.sin(this.time * 0.9) * 0.015;
      const wy = Math.cos(this.time * 0.27) * 0.04;
      ctx.globalAlpha = this.shadeAlpha();
      ctx.drawImage(this.shade, -M + wx, -M + wy, W + 2 * M, L + 2 * M);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    this.drawMeasure(ctx, cam, scene, center);
    this.drawBodies(ctx, cam, scene, center);
    if (main) this.drawAim(ctx, cam, scene, center);
    this.drawParticles(ctx, cam, scene, center);
  }

  shadeAlpha() {
    const h = this.hour;
    if (h < 7 || h > 20.5) return 0.06;
    return 0.17;
  }

  drawBodies(ctx, cam, scene, center) {
    if (!scene.bodies) return;
    const t = this.terrain;
    const list = scene.bodies.filter((b) => b.alive !== false || b.fade > 0).slice().sort((a, b) => a.z - b.z);
    const sd = this.screenDir(cam, LIGHT[0], LIGHT[1]);
    for (const b of list) {
      const gh = t ? t.macro(b.x, b.y) : 0;
      const hz = Math.max(0, b.z - b.r - gh);
      const [gx, gy] = this.proj(cam, b.x, b.y, 0, center);
      const [sx, sy] = this.proj(cam, b.x, b.y, hz + b.r * 0.0, center);
      const rp = Math.max(b.kind === 'jack' ? 2 : 3, b.r * cam.s);
      const alpha = b.alive === false ? Math.max(0, b.fade ?? 0) : 1;
      ctx.globalAlpha = alpha;
      // Schatten
      const so = rp * 0.45 + hz * cam.s * 0.5;
      ctx.fillStyle = `rgba(30,20,10,${0.38 / (1 + hz * 4)})`;
      ctx.beginPath();
      ctx.ellipse(gx - sd[0] * so, gy - sd[1] * so, rp * (1.05 + hz * 1.5), rp * (0.85 + hz * 1.2), 0, 0, Math.PI * 2);
      ctx.fill();
      drawBall(ctx, sx, sy - hz * 0, rp, b, scene.teamStyle);
      if (scene.highlight && scene.highlight.has(b.id)) {
        ctx.strokeStyle = scene.highlightColor || '#ffe48a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, rp + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  screenDir(cam, x, y) {
    const c = Math.cos(cam.rot), sn = Math.sin(cam.rot);
    return [c * x + sn * y, sn * x - c * y].map((v) => -v);
  }

  drawAim(ctx, cam, scene, center) {
    const a = scene.aim;
    if (!a) return;
    const [mx, my] = this.proj(cam, a.x, a.y, 0, center);
    // Flugbahn bis zum Landepunkt
    if (a.from) {
      const s = SHOTS[a.shotKey] || SHOTS.half;
      const dx = a.lx - a.from.x, dy = a.ly - a.from.y;
      const d = Math.hypot(dx, dy);
      const tanA = Math.tan(s.angle);
      const h0 = s.h0;
      // vereinfachte Parabel durch Abwurfhöhe und Landepunkt
      const k = (h0 + d * tanA) / (d * d);
      ctx.fillStyle = 'rgba(255,252,240,0.85)';
      for (let i = 1; i < 30; i++) {
        const u = i / 30;
        const xx = a.from.x + dx * u, yy = a.from.y + dy * u;
        const z = h0 + tanA * d * u - k * (d * u) ** 2;
        const [px, py] = this.proj(cam, xx, yy, Math.max(0, z), center);
        ctx.globalAlpha = 0.25 + 0.6 * u;
        ctx.beginPath();
        ctx.arc(px, py, 1.6 + u * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Streu-Ellipse und Hand-Punkt
    if (a.amp) {
      const ux = a.ux, uy = a.uy;
      ctx.strokeStyle = 'rgba(255,248,225,0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const th = (i / 40) * Math.PI * 2;
        const lat = Math.cos(th) * a.amp * 0.75, len = Math.sin(th) * a.amp;
        const [px, py] = this.proj(cam, a.x + ux * len - uy * lat, a.y + uy * len + ux * lat, 0, center);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Zielmarke
    ctx.strokeStyle = 'rgba(30,20,10,0.6)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#fffaf0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.moveTo(mx - 14, my);
    ctx.lineTo(mx - 5, my);
    ctx.moveTo(mx + 5, my);
    ctx.lineTo(mx + 14, my);
    ctx.moveTo(mx, my - 14);
    ctx.lineTo(mx, my - 5);
    ctx.moveTo(mx, my + 5);
    ctx.lineTo(mx, my + 14);
    ctx.stroke();
    if (a.hand) {
      const [hx, hy] = this.proj(cam, a.hand.x, a.hand.y, 0, center);
      ctx.fillStyle = '#ffcf3f';
      ctx.strokeStyle = 'rgba(40,25,5,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (a.label) {
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(30,20,10,0.55)';
      ctx.fillText(a.label, mx + 1, my - 22);
      ctx.fillStyle = '#fffaf0';
      ctx.fillText(a.label, mx, my - 23);
    }
  }

  drawMeasure(ctx, cam, scene, center) {
    const m = scene.measure;
    if (!m) return;
    const [jx, jy] = this.proj(cam, m.jack.x, m.jack.y, 0, center);
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const it of m.items) {
      const [bx, by] = this.proj(cam, it.x, it.y, 0, center);
      ctx.strokeStyle = it.counts ? it.color : 'rgba(255,255,255,0.6)';
      ctx.lineWidth = it.counts ? 2.2 : 1.4;
      ctx.setLineDash(it.counts ? [] : [4, 3]);
      ctx.beginPath();
      ctx.moveTo(jx, jy);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);
      const lx = bx + (bx - jx) * 0.15, ly = by + (by - jy) * 0.15 - 8;
      const text = it.cm < 100 ? `${it.cm.toFixed(it.cm < 10 ? 1 : 0)} cm` : `${(it.cm / 100).toFixed(2)} m`;
      ctx.fillStyle = 'rgba(20,14,8,0.7)';
      const w = ctx.measureText(text).width + 8;
      roundRect(ctx, lx - w / 2, ly - 11, w, 16, 5);
      ctx.fill();
      ctx.fillStyle = it.counts ? '#fff3c4' : '#f0ebe0';
      ctx.fillText(text, lx, ly + 1);
    }
  }

  drawParticles(ctx, cam, scene, center) {
    if (!scene.particles) return;
    for (const p of scene.particles) {
      const [px, py] = this.proj(cam, p.x, p.y, p.z, center);
      const a = Math.max(0, p.life / p.max);
      ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a * p.a})`;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.8, p.size * cam.s * (1 + (1 - a) * p.grow)), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawLight(ctx) {
    const h = this.hour;
    let tint = null, mode = 'multiply';
    if (h >= 5.5 && h < 8.5) tint = 'rgba(200,214,250,0.16)';
    else if (h >= 8.5 && h < 15.5) tint = null;
    else if (h >= 15.5 && h < 18.8) tint = 'rgba(255,214,160,0.16)';
    else if (h >= 18.8 && h < 20.8) tint = 'rgba(250,160,130,0.26)';
    else tint = 'rgba(70,80,150,0.5)';
    if (tint) {
      ctx.save();
      ctx.globalCompositeOperation = mode;
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.restore();
    }
    if (h >= 20.3 || h < 5.8) {
      // Lichterkette über dem Platz
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let y = 0.5; y < L; y += 1.6) {
        for (const x of [-0.6, W + 0.6]) {
          const [px, py] = this.w2s(x, y, 2.2);
          const r = 2.6 * this.cam.s;
          const gr = ctx.createRadialGradient(px, py, 0, px, py, r);
          gr.addColorStop(0, 'rgba(255,185,105,0.30)');
          gr.addColorStop(1, 'rgba(255,190,110,0)');
          ctx.fillStyle = gr;
          ctx.fillRect(px - r, py - r, r * 2, r * 2);
          ctx.fillStyle = 'rgba(255,230,170,0.9)';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    // Vignette
    const vg = ctx.createRadialGradient(this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.35, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(40,20,5,0.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  drawLupe(ctx, scene) {
    const r = Math.min(64, this.w * 0.17);
    const cx = this.w - r - 12, cy = this.insets.top + r + 12;
    const cam = { x: scene.lupe.x, y: scene.lupe.y, s: 420, rot: this.cam.rot };
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    this.drawWorld(ctx, cam, { ...scene, aim: null, particles: null }, [cx, cy], false);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,250,235,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(40,25,10,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawCircleHint(ctx, scene) {
    const [px, py] = this.w2s(scene.circle.x, scene.circle.y);
    const bottom = this.h - this.insets.bottom;
    if (py < bottom - 10 && py > this.insets.top && px > 0 && px < this.w) return;
    const x = Math.max(30, Math.min(this.w - 30, px));
    const y = bottom - 14;
    ctx.fillStyle = 'rgba(30,20,10,0.55)';
    roundRect(ctx, x - 52, y - 12, 104, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#fff6e6';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`▼ Wurfkreis ${scene.circleDist ? scene.circleDist.toFixed(1).replace('.', ',') + ' m' : ''}`, x, y + 4);
  }
}

// ---------- Kugeln ----------
const STYLES = {
  0: { hi: '#ffffff', mid: '#c3cad3', lo: '#4d5560', groove: 'rgba(60,70,80,0.0)' },
  1: { hi: '#ffe2b8', mid: '#a86f3c', lo: '#36200f', groove: 'rgba(35,18,6,0.75)' },
  jack: { hi: '#ffd2a8', mid: '#e8562a', lo: '#7a1e0a' },
};

export function drawBall(ctx, x, y, r, b, teamStyle) {
  const st = b.kind === 'jack' ? STYLES.jack : STYLES[b.team] || STYLES[0];
  const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
  g.addColorStop(0, st.hi);
  g.addColorStop(0.45, st.mid);
  g.addColorStop(1, st.lo);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (b.kind === 'boule' && b.team === 1 && r > 4) {
    // Rillen der Bronze-Kugeln
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = st.groove;
    ctx.lineWidth = Math.max(1, r * 0.12);
    const ph = b.roll || 0;
    for (const o of [-0.45, 0.45]) {
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(ph) * r * 0.2, y + o * r, r * 1.1, r * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (b.kind === 'boule' && b.team === 0 && r > 4) {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.62, -2.4, -0.9);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(20,12,5,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function drawTrunk(g, x, y, r, rng) {
  g.fillStyle = 'rgba(40,30,15,0.3)';
  g.beginPath();
  g.ellipse(x + r * 0.25, y - r * 0.25, r * 1.25, r * 1.15, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#b9b296';
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.save();
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.clip();
  for (let k = 0; k < 26; k++) {
    const cols = ['#8f8a6c', '#d9d3bd', '#6f6b52', '#a9a487', '#c9c6a8'];
    g.fillStyle = cols[rng.int(cols.length)];
    g.beginPath();
    g.ellipse(x + rng.range(-r, r), y + rng.range(-r, r), rng.range(0.15, 0.4) * r, rng.range(0.1, 0.3) * r, rng.range(0, 3), 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  g.strokeStyle = 'rgba(50,40,20,0.4)';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.stroke();
}

function drawBench(g, x, y, tpx, vertical) {
  const w = vertical ? 0.42 * tpx : 1.6 * tpx, h = vertical ? 1.6 * tpx : 0.42 * tpx;
  g.fillStyle = 'rgba(40,30,15,0.25)';
  g.fillRect(x - w / 2 + 6, y - h / 2 - 6, w, h);
  g.fillStyle = '#5c7a4a';
  for (let k = 0; k < 4; k++) {
    if (vertical) g.fillRect(x - w / 2 + (k * w) / 4 + 1, y - h / 2, w / 4 - 3, h);
    else g.fillRect(x - w / 2, y - h / 2 + (k * h) / 4 + 1, w, h / 4 - 3);
  }
  g.fillStyle = '#2f3a2a';
  if (vertical) {
    g.fillRect(x - w / 2 - 2, y - h / 2 + 8, w + 4, 6);
    g.fillRect(x - w / 2 - 2, y + h / 2 - 14, w + 4, 6);
  }
}

function drawLeaf(g, x, y, s, ang, rng) {
  const cols = ['#c58b3a', '#a8662c', '#d8a750', '#8a5a2b', '#b9a046'];
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  g.fillStyle = cols[rng.int(cols.length)];
  g.globalAlpha = 0.85;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const rr = i % 2 === 0 ? s : s * 0.45;
    g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(80,45,15,0.5)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(-s * 1.3, 0);
  g.stroke();
  g.restore();
}

export { G };
