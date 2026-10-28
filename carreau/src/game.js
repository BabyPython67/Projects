// Der Ablauf einer Partie auf dem Bildschirm: zielen, pendeln, werfen, zuschauen, messen.
import { Renderer } from './render.js';
import { World, launch, SHOTS } from './physics.js';
import { W, L, SURFACES } from './terrain.js';
import {
  makeTerrain, startMene, nextThrower, commitThrow, liveBodies, newBoule, newJack, holder, getJack,
  jackRange, placeJack, throwHeadless, BOULES,
} from './rules.js';
import { decide, execute, aiRng, villager } from './ai.js';
import { Rng, mix } from './rng.js';
import { featName } from './career.js';

const TEAM_COLORS = ['#dfe6ee', '#c98a4b'];
const SWAY_K = { roll: 0.012, half: 0.017, high: 0.021, shot: 0.0115, jack: 0.02 };
const DEFAULT_FRAC = { roll: 0.33, half: 0.7, high: 0.94, shot: 1 };
const $ = (id) => document.getElementById(id);

export function swayAmp(shotKey, dist) {
  return (SWAY_K[shotKey] ?? 0.017) * dist + 0.03;
}

// Pendelnde Hand: wo die Kugel landet, wenn man jetzt loslässt (Versatz quer/längs in Metern)
export function swayOffset(amp, t, ph, pressure = 1) {
  const grow = t > 2.2 ? 1 + 0.45 * (t - 2.2) : 1;
  const f1 = 0.62 * pressure, f2 = 0.83 * pressure;
  return {
    lat: amp * 0.75 * grow * Math.sin(2 * Math.PI * f1 * t + ph[0]),
    len: amp * grow * Math.sin(2 * Math.PI * f2 * t + ph[1]),
    grow,
  };
}

export class Game {
  constructor({ canvas, sound, hooks, test }) {
    this.canvas = canvas;
    this.r = new Renderer(canvas);
    this.sound = sound;
    this.hooks = hooks;
    this.test = test || {};
    this.phase = 'idle';
    this.particles = [];
    this.traces = [];
    this.fading = [];
    this.memory = {};
    this.speed = 1;
    this.last = performance.now();
    this.el = {
      hud: $('hud'), lage: $('lage'), toast: $('toast'), shotbar: $('shotbar'), throwBtn: $('throwBtn'),
      throwLabel: $('throwLabel'), aiBar: $('aiBar'), meneCard: $('meneCard'), meneTitle: $('meneTitle'),
      meneText: $('meneText'), meneNext: $('meneNext'), meneNo: $('meneNo'), sb: [$('sb0'), $('sb1')],
      practiceBar: $('practiceBar'), bottom: $('bottombar'), top: $('topbar'), big: $('bigToast'),
    };
    this.bind();
    this.r.hour = this.test.hour ?? currentHour();
    if (this.sound) this.sound.setHour(this.r.hour);
    requestAnimationFrame((t) => this.loop(t));
  }

  // ---------- Partie laden ----------
  load(state, profile) {
    this.state = state;
    this.profile = profile;
    this.terrain = makeTerrain(state);
    if (state.pending) {
      const p = state.pending;
      delete state.pending;
      throwHeadless(state, this.terrain, p.team, p.shotKey, p.landing);
    }
    this.r.buildTerrain(this.terrain);
    this.traces = [];
    this.particles = [];
    this.fading = [];
    this.el.hud.hidden = false;
    this.el.practiceBar.hidden = state.mode !== 'practice';
    this.layout();
    this.updateBoard();
    if (state.phase === 'meneEnd' || state.phase === 'matchEnd') {
      this.showMeneEnd(state.history[state.history.length - 1]);
    } else if (state.bodies.length || state.mene > 0) {
      this.frameField(true);
      this.beginTurn();
    } else {
      startMene(state);
      this.intro();
    }
  }

  stop() {
    this.phase = 'idle';
    this.el.hud.hidden = true;
    this.el.meneCard.hidden = true;
    this.sound && this.sound.holdStop();
  }

  layout() {
    this.r.resize();
    const top = Math.max(this.el.top.getBoundingClientRect().bottom, this.el.lage.getBoundingClientRect().bottom) + 6;
    const bottom = window.innerHeight - this.el.bottom.getBoundingClientRect().top + 6;
    this.r.setInsets(top, Math.max(60, bottom));
  }

  teamName(t) {
    return this.state.teams[t].name;
  }

  verb(t, du, er) {
    return this.state.mode === 'ai' || this.state.mode === 'daily' || this.state.mode === 'practice' ? (t === 0 ? du : er) : er;
  }

  rot() {
    return this.state.dir > 0 ? 0 : Math.PI;
  }

  save() {
    this.hooks.save && this.hooks.save(this.state);
  }

  // ---------- Ablauf ----------
  intro() {
    const s = this.state;
    this.el.meneCard.hidden = true;
    this.frameField(s.mene === 1);
    this.phase = 'intro';
    this.timer = this.fast(1.5);
    this.traces = [];
    if (this.sound) this.sound.bell(s.mene === 1 ? 2 : 1);
    if (s.mode === 'practice') this.toast('Übungsplatz: wirf die Sau, dann so viele Kugeln du willst.');
    else this.toast(`Aufnahme ${s.mene} · ${this.teamName(s.jackThrower)} ${this.verb(s.jackThrower, 'wirfst', 'wirft')} die Sau`);
    this.updateBoard();
    this.save();
  }

  fast(t) {
    return this.test.speed ? t / Math.max(1, this.test.speed) / 2 : t;
  }

  beginTurn() {
    const s = this.state;
    this.updateBoard();
    const team = nextThrower(s);
    if (team === null) return;
    this.team = team;
    const t = s.teams[team];
    if (t.human) this.startAim(team);
    else this.startAI(team);
  }

  startAim(team) {
    const s = this.state;
    const place = s.phase === 'jack' && s.jackPlacer === team;
    const isJack = s.phase === 'jack';
    const mem = this.memory[team] || {};
    const shotKey = isJack ? 'jack' : mem.shotKey || 'half';
    this.aim = { team, shotKey, place, isJack, dragged: false, x: 0, y: 0 };
    this.placeMarker(true);
    this.phase = 'aim';
    this.holding = null;
    const ph = new Rng(mix(s.seed, s.throwIndex * 13 + 5 + team));
    this.swayPh = [ph.range(0, 6.283), ph.range(0, 6.283)];
    this.el.aiBar.hidden = true;
    this.el.throwBtn.hidden = false;
    this.el.shotbar.hidden = isJack;
    this.el.throwLabel.textContent = place ? 'Sau ablegen' : isJack ? 'Sau werfen' : 'Halten · Loslassen';
    this.el.throwBtn.classList.toggle('place', place);
    this.markShot();
    if (place) this.toast(`${this.teamName(team)}: Leg die Sau von Hand ab (6–10 m vom Kreis).`);
    else if (s.mode === 'duo') this.toast(`${this.teamName(team)} ist dran`);
    this.tips();
    this.updateBoard();
  }

  placeMarker(reset) {
    const s = this.state, a = this.aim;
    const c = s.circle;
    const jack = getJack(s);
    if (a.isJack) {
      const r = jackRange(s);
      a.x = c.x;
      a.y = c.y + s.dir * Math.min(r.max - 0.5, 7.5);
      return;
    }
    const dx = jack.x - c.x, dy = jack.y - c.y;
    const d = Math.hypot(dx, dy);
    const ux = dx / d, uy = dy / d;
    if (a.shotKey === 'shot') {
      const opp = s.bodies.filter((b) => b.kind === 'boule' && b.alive && b.team !== a.team);
      let best = null;
      for (const b of opp) {
        const dd = Math.hypot(b.x - jack.x, b.y - jack.y);
        if (!best || dd < best.dd) best = { b, dd };
      }
      const t = best ? best.b : jack;
      a.x = t.x;
      a.y = t.y;
      return;
    }
    const mem = this.memory[a.team] && this.memory[a.team][a.shotKey];
    if (mem && !reset) {
      a.x = jack.x + mem[0];
      a.y = jack.y + mem[1];
    } else if (mem) {
      a.x = jack.x + mem[0];
      a.y = jack.y + mem[1];
    } else {
      const f = DEFAULT_FRAC[a.shotKey];
      a.x = c.x + ux * d * f;
      a.y = c.y + uy * d * f;
    }
    this.clampMarker();
  }

  clampMarker() {
    const a = this.aim, s = this.state;
    a.x = Math.max(-0.1, Math.min(W + 0.1, a.x));
    a.y = Math.max(-0.1, Math.min(L + 0.1, a.y));
    const along = (a.y - s.circle.y) * s.dir;
    if (along < 0.6) a.y = s.circle.y + s.dir * 0.6;
  }

  setShot(key) {
    if (!this.aim || this.aim.isJack || this.phase !== 'aim') return;
    if (this.aim.shotKey === key) return;
    this.aim.shotKey = key;
    this.memory[this.aim.team] = { ...(this.memory[this.aim.team] || {}), shotKey: key };
    if (!this.aim.dragged || key === 'shot') this.placeMarker(false);
    this.markShot();
    this.sound && this.sound.select(['roll', 'half', 'high', 'shot'].indexOf(key));
  }

  markShot() {
    for (const b of this.el.shotbar.querySelectorAll('button')) b.classList.toggle('on', this.aim && b.dataset.shot === this.aim.shotKey);
  }

  pressure() {
    const s = this.state;
    return s.score[0] >= s.target - 1 || s.score[1] >= s.target - 1 ? 1.2 : 1;
  }

  currentAmp() {
    const a = this.aim, c = this.state.circle;
    const d = Math.hypot(a.x - c.x, a.y - c.y);
    return swayAmp(a.isJack ? 'jack' : a.shotKey, d);
  }

  handPoint(t) {
    const a = this.aim, c = this.state.circle;
    const dx = a.x - c.x, dy = a.y - c.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d;
    const o = swayOffset(this.currentAmp(), t, this.swayPh, this.pressure());
    return { x: a.x + ux * o.len - uy * o.lat, y: a.y + uy * o.len + ux * o.lat, grow: o.grow };
  }

  releaseThrow() {
    const a = this.aim;
    if (!a || this.phase !== 'aim') return;
    const s = this.state;
    if (a.place) {
      if (placeJack(s, this.terrain, a.x, a.y)) {
        this.sound && this.sound.tock(1.2, 0);
        this.save();
        this.updateBoard();
        this.beginTurn();
      } else {
        this.toast('Hier nicht erlaubt: 6 bis 10 m vor dem Kreis, 50 cm vom Rand.');
        this.sound && this.sound.chime('bad');
      }
      return;
    }
    const h = this.handPoint(this.holding ? this.holding.t : 0);
    const jack = getJack(s);
    if (jack && !a.isJack) this.memory[a.team] = { ...(this.memory[a.team] || {}), shotKey: a.shotKey, [a.shotKey]: [a.x - jack.x, a.y - jack.y] };
    this.holding = null;
    this.sound && this.sound.holdStop();
    this.startThrow(a.team, a.isJack ? 'half' : a.shotKey, { x: h.x, y: h.y });
  }

  startAI(team) {
    const s = this.state;
    const prof = villager(s.teams[team].profile);
    this.ai = { team, prof, decision: null, rng: aiRng(s, team) };
    this.phase = 'think';
    this.timer = this.test.speed ? 0.05 : prof.think * (0.7 + Math.random() * 0.5);
    this.aim = null;
    this.el.throwBtn.hidden = true;
    this.el.shotbar.hidden = true;
    this.el.aiBar.hidden = false;
    this.el.aiBar.textContent = `${prof.name} überlegt …`;
    this.frameHead();
  }

  startThrow(team, shotKey, landing) {
    const s = this.state;
    s.pending = { team, shotKey, landing };
    this.save();
    const isJack = s.phase === 'jack';
    const bodies = liveBodies(s, this.terrain);
    const thrown = isJack ? newJack() : newBoule(s, team);
    thrown.path = [];
    const speed = launch(this.terrain, thrown, s.circle, landing, isJack ? 'half' : shotKey);
    this.world = new World(this.terrain, [...bodies, thrown], { events: true, craters: true, trace: true });
    this.thrown = thrown;
    this.throwInfo = { team, shotKey, landing, isJack, firstLand: null };
    this.flyClock = 0;
    this.speed = 1;
    this.phase = 'fly';
    this.aim = null;
    this.el.throwBtn.hidden = true;
    this.el.shotbar.hidden = true;
    this.el.aiBar.hidden = true;
    this.sound && this.sound.whoosh(speed);
  }

  finishThrow() {
    const s = this.state;
    const w = this.world;
    w.finish();
    const info = this.throwInfo;
    delete s.pending;
    for (const b of w.bodies) if (!b.alive) this.fading.push({ ...b, fade: 1 });
    const res = commitThrow(s, this.terrain, info.team, w.bodies, this.thrown, info.shotKey);
    if (this.thrown.path && this.thrown.path.length) {
      this.traces.push({ path: this.thrown.path, land: info.firstLand, color: info.isJack ? '#e8562a' : TEAM_COLORS[info.team], alpha: 0.45 });
      if (this.traces.length > 2) this.traces.shift();
      this.traces.forEach((t, i) => (t.alpha = i === this.traces.length - 1 ? 0.45 : 0.2));
    }
    this.world = null;
    this.save();
    this.updateBoard();
    for (const f of res.feats || []) this.celebrate(f);
    if (res.jackInvalid) {
      const who = s.jackPlacer !== null ? this.teamName(s.jackPlacer) : this.teamName(s.jackThrower);
      this.toast(s.jackPlacer !== null ? `Sau ungültig – ${who} ${this.verb(s.jackPlacer, 'legst', 'legt')} sie jetzt von Hand.` : 'Sau ungültig (6–10 m, 50 cm vom Rand) – noch ein Versuch.');
      this.sound && this.sound.chime('bad');
      this.phase = 'settle';
      this.timer = this.fast(1.1);
      this.afterSettle = () => this.beginTurn();
      return;
    }
    if (res.practice) {
      const jack = getJack(s);
      const tb = s.bodies.find((b) => b.id === this.thrown.id);
      if (jack && tb && !info.isJack) this.toast(`${fmtDist(Math.hypot(tb.x - jack.x, tb.y - jack.y) - 0.0525)} von der Sau`);
    }
    this.phase = 'settle';
    this.timer = this.fast(res.ended ? 0.9 : 0.55);
    this.afterSettle = () => {
      if (res.ended) this.showMeneEnd(res.ended);
      else this.beginTurn();
    };
  }

  celebrate(f) {
    const name = featName(f.id);
    const mine = this.state.teams[f.team].human;
    if (f.id === 'carreau' || f.id === 'carreau-sur-place') {
      this.bigToast(name + '!');
      this.sound && (this.sound.chime(mine ? 'good' : 'bad'), this.sound.applause(f.id === 'carreau' ? 0.8 : 1.3));
    } else if (f.id === 'kuss') {
      this.bigToast('Bise!');
      this.sound && this.sound.chime('good');
    } else if (f.id === 'doppelschlag' || f.id === 'sau-aus' || f.id === 'plombee' || f.id === 'sau-getroffen') {
      this.bigToast(name);
      if (f.id !== 'plombee') this.sound && this.sound.applause(0.6);
    }
  }

  showMeneEnd(out) {
    const s = this.state;
    this.phase = 'meneEnd';
    this.el.throwBtn.hidden = true;
    this.el.shotbar.hidden = true;
    this.el.aiBar.hidden = true;
    this.frameHead(true);
    const jack = getJack(s);
    if (jack) {
      const h = holder(s);
      this.measure = {
        jack,
        items: h.list.slice(0, 6).map((p) => ({
          x: p.b.x, y: p.b.y, cm: Math.max(0, p.d * 100), counts: h.team !== null && p.b.team === h.team && p.d < h.best[1 - h.team],
          color: p.b.team === 0 ? '#f2f6fa' : '#f0b273',
        })),
      };
    }
    let title, text;
    if (!out) {
      title = 'Aufnahme vorbei';
      text = '';
    } else if (out.team === null) {
      title = out.reason === 'null' ? 'Sau im Aus' : 'Gleich weit';
      text = 'Die Aufnahme zählt nicht. Die Sau wirft, wer sie zuletzt geworfen hat.';
    } else {
      const p = out.points;
      title = `${this.teamName(out.team)} ${this.verb(out.team, 'machst', 'macht')} ${p} ${p === 1 ? 'Punkt' : 'Punkte'}`;
      text = out.reason === 'sau-aus' ? 'Die Sau ist im Aus – jede Kugel in der Hand zählt.' : '';
    }
    if (s.phase === 'matchEnd') text = `${text} Endstand ${s.score[0]} : ${s.score[1]}.`.trim();
    this.el.meneTitle.textContent = title;
    this.el.meneText.textContent = text;
    this.el.meneNext.textContent = s.phase === 'matchEnd' ? 'Zum Ergebnis' : 'Nächste Aufnahme';
    this.el.meneCard.hidden = false;
    if (out && out.team !== null && s.mode !== 'duo') this.sound && this.sound.chime(out.team === 0 ? 'good' : 'bad');
    this.updateBoard();
  }

  nextMene() {
    const s = this.state;
    this.sound && this.sound.tap();
    this.measure = null;
    this.el.meneCard.hidden = true;
    if (s.phase === 'matchEnd') {
      this.phase = 'idle';
      this.hooks.matchEnd && this.hooks.matchEnd(s);
      return;
    }
    startMene(s);
    this.intro();
  }

  practiceCollect(newJack) {
    const s = this.state;
    if (s.mode !== 'practice' || (this.phase !== 'aim' && this.phase !== 'settle')) return;
    this.sound && this.sound.tap();
    if (newJack) {
      s.bodies = [];
      s.phase = 'jack';
    } else {
      s.bodies = s.bodies.filter((b) => b.kind === 'jack');
    }
    s.remaining = [99, 0];
    this.traces = [];
    this.save();
    this.beginTurn();
  }

  // ---------- Kamera ----------
  frameField(instant) {
    const s = this.state;
    this.r.frame({ x0: -0.4, y0: -0.4, x1: W + 0.4, y1: L + 0.4 }, this.rot(), { instant, minS: 10 });
  }

  frameJackZone() {
    const s = this.state, c = s.circle;
    const r = jackRange(s);
    this.r.frame({ x0: 0, y0: c.y - s.dir * 0.4, x1: W, y1: c.y + s.dir * (r.max + 0.6) }, this.rot(), { minS: 10 });
  }

  headPoints() {
    const s = this.state;
    const jack = getJack(s);
    if (!jack) return [];
    return s.bodies.filter((b) => b.alive && Math.hypot(b.x - jack.x, b.y - jack.y) < 1.4).map((b) => [b.x, b.y]);
  }

  frameBox(pts, padLat, padLen, opts) {
    const s = this.state;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [x, y] of pts) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const hw = Math.max((x1 - x0) / 2 + padLat, 0.6), hh = Math.max((y1 - y0) / 2 + padLen, 0.7);
    this.r.frame({ x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh }, this.rot(), opts);
  }

  frameHead(instant) {
    const pts = this.headPoints();
    if (!pts.length) return this.frameJackZone();
    this.frameBox(pts, 0.32, 0.36, { maxS: 320, instant: false });
  }

  frameAim() {
    const a = this.aim;
    if (!a) return;
    if (a.isJack) return this.frameJackZone();
    const jack = getJack(this.state);
    const pts = this.headPoints().filter(([x, y]) => Math.hypot(x - jack.x, y - jack.y) < 0.7);
    pts.push([a.x, a.y]);
    const amp = this.currentAmp() * (this.holding ? 1.3 : 1);
    pts.push([a.x + amp * 0.8, a.y + amp], [a.x - amp * 0.8, a.y - amp]);
    this.frameBox(pts, 0.22, 0.28, { maxS: 300 });
  }

  frameFly() {
    const w = this.world;
    const tb = this.thrown;
    const pts = [[tb.x, tb.y]];
    const jack = getJack(this.state) || (tb.kind === 'jack' ? null : null);
    if (jack && !this.throwInfo.isJack) pts.push([jack.x, jack.y]);
    for (const b of w.bodies) if (b.moving && b.alive) pts.push([b.x, b.y]);
    this.frameBox(pts, 0.7, 0.8, { maxS: 230, minS: 30 });
  }

  // ---------- Eingabe ----------
  bind() {
    const cv = this.canvas;
    cv.addEventListener('pointerdown', (e) => this.onDown(e));
    window.addEventListener('pointermove', (e) => this.onMove(e));
    window.addEventListener('pointerup', (e) => this.onUp(e));
    window.addEventListener('pointercancel', () => (this.drag = null));
    const tb = this.el.throwBtn;
    tb.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.phase !== 'aim' || !this.aim) return;
      if (this.aim.place) return;
      try { tb.setPointerCapture(e.pointerId); } catch (_) { /* egal */ }
      this.holding = { t: 0, id: e.pointerId, x: e.clientX, y: e.clientY };
      tb.classList.add('hold');
      this.sound && this.sound.holdStart();
    });
    const end = (e, cancel) => {
      tb.classList.remove('hold');
      if (this.phase !== 'aim' || !this.aim) return;
      if (this.aim.place) {
        if (!cancel) this.releaseThrow();
        return;
      }
      if (!this.holding) return;
      const far = Math.hypot(e.clientX - this.holding.x, e.clientY - this.holding.y) > 120;
      if (cancel || far) {
        this.holding = null;
        this.sound && this.sound.holdStop();
        this.toast('Wurf abgebrochen');
        return;
      }
      this.releaseThrow();
    };
    tb.addEventListener('pointerup', (e) => end(e, false));
    tb.addEventListener('pointercancel', (e) => end(e, true));
    for (const b of this.el.shotbar.querySelectorAll('button')) {
      b.addEventListener('click', () => this.setShot(b.dataset.shot));
    }
    this.el.meneNext.addEventListener('click', () => this.nextMene());
    $('pCollect').addEventListener('click', () => this.practiceCollect(false));
    $('pNewJack').addEventListener('click', () => this.practiceCollect(true));
    window.addEventListener('resize', () => this.state && this.layout());
  }

  onDown(e) {
    if (this.phase === 'fly' || this.phase === 'think' || this.phase === 'show') {
      this.speed = 3;
      this.sound && this.sound.tap();
      return;
    }
    if (this.phase !== 'aim' || this.holding) return;
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: 0, acc: 0 };
  }

  onMove(e) {
    const d = this.drag;
    if (!d || d.id !== e.pointerId || this.phase !== 'aim' || !this.aim) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    const m = Math.hypot(dx, dy);
    d.moved += m;
    d.acc += m;
    if (d.moved < 6) return;
    const [wx, wy] = this.r.s2wDelta(dx, dy);
    this.aim.x += wx;
    this.aim.y += wy;
    this.aim.dragged = true;
    this.clampMarker();
    if (d.acc > 9) {
      d.acc = 0;
      this.sound && this.sound.scratch(Math.min(1, m / 20));
    }
  }

  onUp(e) {
    const d = this.drag;
    this.drag = null;
    if (!d || d.id !== e.pointerId || this.phase !== 'aim' || !this.aim) return;
    if (d.moved >= 6) return;
    // Tippen: Zielmarke direkt setzen, beim Schießen auf die nächste Kugel einrasten
    const [wx, wy] = this.r.s2w(e.clientX, e.clientY);
    const a = this.aim;
    if (a.shotKey === 'shot' && !a.isJack) {
      let best = null;
      for (const b of this.state.bodies) {
        if (!b.alive) continue;
        const [px, py] = this.r.w2s(b.x, b.y);
        const dd = Math.hypot(px - e.clientX, py - e.clientY);
        if (dd < 34 && (!best || dd < best.dd)) best = { b, dd };
      }
      if (best) {
        a.x = best.b.x;
        a.y = best.b.y;
        a.dragged = true;
        this.sound && this.sound.select(3);
        return;
      }
    }
    a.x = wx;
    a.y = wy;
    a.dragged = true;
    this.clampMarker();
    this.sound && this.sound.scratch(0.6);
  }

  // ---------- Schleife ----------
  loop(now) {
    const rdt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const dt = rdt * (this.test.speed || 1);
    try {
      this.update(dt, rdt);
      this.render();
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt, rdt) {
    this.r.update(rdt * (this.test.speed ? 3 : 1));
    const s = this.state;
    if (!s) return;
    switch (this.phase) {
      case 'intro':
        this.timer -= dt;
        if (this.timer < this.fast(0.8)) this.frameJackZone();
        if (this.timer <= 0) this.beginTurn();
        break;
      case 'aim':
        if (this.holding) this.holding.t += rdt;
        this.frameAim();
        break;
      case 'think': {
        this.timer -= dt;
        const ai = this.ai;
        if (!ai.decision && this.timer < (this.test.speed ? 0.04 : ai.prof.think * 0.4)) {
          ai.decision = decide(s, this.terrain, ai.team, ai.prof, ai.rng);
        }
        if (this.timer <= 0 && ai.decision) {
          if (ai.decision.place) {
            placeJack(s, this.terrain, ai.decision.target.x, ai.decision.target.y) || placeJack(s, this.terrain, s.circle.x, s.circle.y + s.dir * 7);
            this.sound && this.sound.tock(1, 0);
            this.toast(`${ai.prof.name} legt die Sau ab.`);
            this.save();
            this.beginTurn();
            break;
          }
          this.phase = 'show';
          this.timer = this.test.speed ? 0.05 : 0.85;
          const label = `${ai.prof.name} ${ai.decision.label}`;
          this.el.aiBar.textContent = ai.decision.tag ? `${label} · ${ai.decision.tag}` : label;
          this.showAim = { x: ai.decision.target.x, y: ai.decision.target.y, label: ai.decision.label };
        }
        break;
      }
      case 'show':
        this.timer -= dt;
        if (this.timer <= 0) {
          const ai = this.ai;
          const land = execute(s, ai.decision, ai.prof, ai.rng);
          this.showAim = null;
          this.startThrow(ai.team, ai.decision.shotKey, land);
        }
        break;
      case 'fly':
        this.stepWorld(dt * this.speed);
        break;
      case 'settle':
        this.timer -= dt;
        this.frameHead();
        if (this.timer <= 0) {
          this.phase = 'wait';
          const f = this.afterSettle;
          this.afterSettle = null;
          f && f();
        }
        break;
      case 'meneEnd':
        break;
    }
    // Partikel und verblassende Kugeln
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z = Math.max(0, p.z + p.vz * dt);
      p.vz -= 3 * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.fading) f.fade -= dt * 1.2;
    this.fading = this.fading.filter((f) => f.fade > 0);
    if (this.phase !== 'fly' && this.sound) this.sound.roll(0, 'kies', dt);
  }

  stepWorld(dt) {
    const w = this.world;
    this.flyClock += dt;
    let n = 0;
    while (w.time < this.flyClock && !w.atRest() && n < 6000) {
      w.step();
      n++;
    }
    const pan = (x) => {
      const [sx] = this.r.w2s(x, 0);
      return Math.max(-1, Math.min(1, (sx / this.r.w) * 2 - 1)) * 0.7;
    };
    for (const e of w.events) {
      if (e.type === 'land') {
        if (e.id === this.thrown.id && e.first) this.throwInfo.firstLand = [e.x, e.y];
        this.sound && this.sound.land(e.surf, e.impact, pan(e.x), e.kind === 'jack');
        this.dust(e.x, e.y, e.impact, e.surf);
      } else if (e.type === 'hit') {
        if (e.ka === 'jack' || e.kb === 'jack') this.sound && this.sound.tock(e.speed, pan(e.x));
        else {
          this.sound && this.sound.clack(e.speed, pan(e.x), e.a.charCodeAt(2) + e.b.charCodeAt(2));
          if (e.speed > 2) this.spark(e.x, e.y);
        }
      } else if (e.type === 'board') {
        this.sound && this.sound.board(e.speed, pan(e.x));
      } else if (e.type === 'out') {
        this.toast(e.kind === 'jack' ? 'Die Sau ist im Aus!' : 'Kugel im Aus');
      }
    }
    w.events.length = 0;
    let sp = 0, surf = 'kies';
    for (const b of w.bodies) {
      if (!b.moving || b.air || !b.alive) continue;
      const v = Math.hypot(b.vx, b.vy);
      b.roll = (b.roll || 0) + (v * dt) / b.r;
      if (v > sp) {
        sp = v;
        surf = this.terrain.surfaceAt(b.x, b.y).key;
      }
    }
    this.sound && this.sound.roll(sp, surf, dt, pan(this.thrown.x));
    this.frameFly();
    if (w.atRest() || w.time > 15) {
      if (!w.atRest()) w.run(16);
      this.finishThrow();
    }
  }

  dust(x, y, impact, surfKey) {
    const s = SURFACES.find((q) => q.key === surfKey) || SURFACES[0];
    const n = Math.min(26, 5 + Math.round(impact * 2.5));
    const c = s.color.map((v) => Math.min(255, v + 25));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 0.25 * (0.5 + impact / 6);
      this.particles.push({ x, y, z: 0.01, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: Math.random() * 0.5, life: 0.5 + Math.random() * 0.8, max: 1.3, size: 0.008 + Math.random() * 0.02, grow: 1.5, a: 0.55, c });
    }
  }

  spark(x, y) {
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({ x, y, z: 0.04, vx: Math.cos(a) * 0.8, vy: Math.sin(a) * 0.8, vz: 0.5, life: 0.18, max: 0.18, size: 0.004, grow: 0, a: 1, c: [255, 250, 220] });
    }
  }

  render() {
    const s = this.state;
    if (!s || !this.terrain) return;
    const scene = { circle: s.circle, dir: s.dir, traces: this.traces, particles: this.particles, measure: this.measure };
    const bodies = this.world ? this.world.bodies : liveBodies(s, this.terrain).map((b) => ({ ...b }));
    scene.bodies = bodies.concat(this.fading.map((f) => ({ ...f, alive: false })));
    const jack = bodies.find((b) => b.kind === 'jack' && b.alive);
    if (jack) scene.lupe = { x: jack.x, y: jack.y };
    if (this.phase === 'aim' && this.aim) {
      const a = this.aim;
      const c = s.circle;
      const dx = a.x - c.x, dy = a.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      const hand = this.holding ? this.handPoint(this.holding.t) : null;
      scene.aim = {
        x: a.x, y: a.y, from: a.place ? null : c, lx: a.x, ly: a.y, shotKey: a.isJack ? 'half' : a.shotKey,
        amp: a.place ? 0 : this.currentAmp() * (hand ? hand.grow : 1), ux: dx / d, uy: dy / d, hand,
        label: a.place ? 'Sau hier ablegen' : null,
      };
      if (a.isJack) {
        const r = jackRange(s);
        scene.jackZone = { x: c.x, y: c.y, min: r.min, max: r.max };
      }
      scene.showCircleHint = true;
      scene.circleDist = d;
      if (a.shotKey === 'shot' && !a.isJack) {
        let best = null;
        for (const b of bodies) {
          const dd = Math.hypot(b.x - a.x, b.y - a.y);
          if (b.alive && dd < 0.08 && (!best || dd < best.dd)) best = { b, dd };
        }
        if (best) {
          scene.highlight = new Set([best.b.id]);
          scene.highlightColor = '#ff8a5c';
        }
      }
    } else if (this.phase === 'show' && this.showAim) {
      scene.aim = { x: this.showAim.x, y: this.showAim.y, label: this.showAim.label };
    } else if (this.phase === 'intro' && s.phase === 'jack') {
      const r = jackRange(s);
      scene.jackZone = { x: s.circle.x, y: s.circle.y, min: r.min, max: r.max };
    }
    this.r.draw(scene);
  }

  // ---------- Anzeige ----------
  updateBoard() {
    const s = this.state;
    if (!s) return;
    for (let t = 0; t < 2; t++) {
      const el = this.el.sb[t];
      el.querySelector('.nm').textContent = s.teams[t] ? s.teams[t].name : '';
      el.querySelector('.pts').textContent = s.mode === 'practice' ? '' : s.score[t];
      const rem = s.mode === 'practice' ? 0 : s.remaining[t];
      el.querySelector('.bl').innerHTML = s.mode === 'practice' ? '' : Array.from({ length: BOULES }, (_, i) => `<i class="${i < rem ? 'on' : ''} t${t}"></i>`).join('');
      el.classList.toggle('turn', (this.phase === 'aim' || this.phase === 'think' || this.phase === 'show') && this.team === t);
    }
    this.el.meneNo.textContent = s.mode === 'practice' ? 'Übung' : `${s.mene}. Aufn. · bis ${s.target}`;
    this.el.lage.textContent = this.lage();
  }

  lage() {
    const s = this.state;
    if (s.phase === 'jack') {
      const t = s.jackPlacer ?? s.jackThrower;
      return `${this.teamName(t)} ${s.jackPlacer !== null ? this.verb(t, 'legst', 'legt') : this.verb(t, 'wirfst', 'wirft')} die Sau · 6–10 m`;
    }
    const h = holder(s);
    if (!h) return '';
    if (h.team === null) return h.tie ? 'Gleich weit – wer zuletzt warf, wirft noch einmal.' : 'Noch liegt keine Kugel.';
    const d = h.best[h.team];
    const n = h.n > 1 ? ` mit ${h.n}` : '';
    return `${this.teamName(h.team)} ${this.verb(h.team, 'liegst', 'liegt')}${n} · ${fmtDist(d)}`;
  }

  toast(text, ms = 2400) {
    const el = this.el.toast;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this.toastT);
    this.toastT = setTimeout(() => el.classList.remove('show'), this.test.speed ? 600 : ms);
  }

  bigToast(text) {
    const el = this.el.big;
    el.textContent = text;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  tips() {
    const p = this.profile;
    if (!p || !p.settings.hints || this.state.mode === 'duo') return;
    const s = this.state;
    const show = (id, text) => {
      if (p.tipsSeen[id]) return false;
      p.tipsSeen[id] = 1;
      setTimeout(() => this.hooks.tip && this.hooks.tip(text), 350);
      return true;
    };
    if (s.phase === 'jack' && !this.aim.place) {
      show('jack', 'Zieh mit dem Finger irgendwo auf dem Platz – die Zielmarke folgt. Dann den runden Knopf gedrückt halten: Der gelbe Punkt pendelt und zeigt, wo die Kugel landet. Loslassen, wenn er gut steht.');
      return;
    }
    if (s.phase !== 'play') return;
    if (show('shots', 'Vier Wurfarten: Rollen setzt früh auf und rollt weit, Halbhoch landet auf halber Strecke, Hoch bleibt fast liegen, wo es aufkommt. Schießen fliegt direkt auf eine Kugel. Die Zielmarke ist der Aufsetzpunkt – wie weit die Kugel danach rollt, musst du lesen.')) return;
    const h = holder(s);
    if (h && h.team === 1 && h.best[1] < 0.12 && s.remaining[0] >= 2) {
      if (show('shoot', 'Die Kugel liegt sehr nah. Wenn du nicht besser legen kannst, schieß sie weg: Wähle „Schießen“ und tippe auf die Kugel.')) return;
    }
    const surf = getJack(s) && this.terrain.surfaceAt(getJack(s).x, getJack(s).y);
    if (surf && (surf.key === 'grob' || surf.key === 'sand')) show('boden', `Um die Sau liegt ${surf.name}. ${surf.key === 'sand' ? 'Sand bremst stark' : 'Grober Kies lenkt rollende Kugeln ab'} – ein hoher Wurf landet, ohne viel zu rollen.`);
  }
}

export function fmtDist(m) {
  const cm = Math.max(0, m * 100);
  if (cm < 100) return `${cm < 10 ? cm.toFixed(1).replace('.', ',') : Math.round(cm)} cm`;
  return `${(cm / 100).toFixed(2).replace('.', ',')} m`;
}

export function currentHour() {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}
