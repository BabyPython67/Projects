// Klang: alles wird live mit der Web Audio API erzeugt, ohne Tondateien.
// Räume (Wind, Regen, Feuer, Eis …), murmelnde Stimmen beim Lauschen,
// kleine Geräusche für Seiten und Prüfungen.

const RAEUME = {
  titel:  { r: [{ t: 'braun', f: 300, g: 0.05, lf: 0.05, lg: 0.03 }], o: [{ f: 55, g: 0.025 }, { f: 82.4, g: 0.015 }] },
  wald:   { r: [{ t: 'braun', f: 500, g: 0.14, lf: 0.08, lg: 0.07 }, { t: 'weiss', ft: 'highpass', f: 5000, g: 0.006 }], e: { a: 'knacken', min: 5, max: 14 } },
  tor:    { r: [{ t: 'braun', f: 260, g: 0.12, lf: 0.11, lg: 0.06 }], o: [{ f: 41, g: 0.03, typ: 'sawtooth', lp: 120 }], e: { a: 'klage', min: 3, max: 7 } },
  vorhoelle: { r: [{ t: 'braun', f: 420, g: 0.1, lf: 0.3, lg: 0.05 }], o: [{ f: 190, g: 0.012, typ: 'sawtooth', lp: 900, vib: 9 }, { f: 233, g: 0.01, typ: 'sawtooth', lp: 900, vib: 11 }], e: { a: 'klage', min: 2, max: 5 } },
  fluss:  { r: [{ t: 'braun', f: 700, g: 0.16, lf: 0.13, lg: 0.05 }, { t: 'weiss', ft: 'bandpass', f: 1800, q: 0.7, g: 0.02 }] },
  limbus: { r: [{ t: 'weiss', ft: 'bandpass', f: 900, q: 0.8, g: 0.03, lf: 0.12, lg: 0.025 }], o: [{ f: 220, g: 0.012 }, { f: 277.2, g: 0.008 }, { f: 329.6, g: 0.008 }], e: { a: 'seufzer', min: 3, max: 8 } },
  sturm:  { r: [{ t: 'weiss', ft: 'lowpass', f: 900, g: 0.22, lf: 0.17, lg: 0.14, lff: 500 }, { t: 'braun', f: 200, g: 0.16, lf: 0.07, lg: 0.08 }], e: { a: 'klage', min: 3, max: 6 } },
  regen:  { r: [{ t: 'weiss', ft: 'highpass', f: 2200, g: 0.09, lf: 0.2, lg: 0.02 }, { t: 'braun', f: 160, g: 0.14 }], e: { a: 'bellen', min: 9, max: 18 } },
  lasten: { r: [{ t: 'braun', f: 130, g: 0.2, lf: 0.09, lg: 0.1 }], e: { a: 'klirren', min: 4, max: 8 } },
  sumpf:  { r: [{ t: 'braun', f: 240, g: 0.15, lf: 0.06, lg: 0.05 }], e: { a: 'blase', min: 0.6, max: 2.5 } },
  dis:    { r: [{ t: 'braun', f: 180, g: 0.14 }], o: [{ f: 49, g: 0.035, typ: 'sawtooth', lp: 160 }], e: { a: 'knistern', min: 0.3, max: 1.4 } },
  graeber: { r: [{ t: 'weiss', ft: 'bandpass', f: 380, q: 0.6, g: 0.09, lf: 0.2, lg: 0.04 }, { t: 'braun', f: 140, g: 0.12 }], e: { a: 'knistern', min: 0.2, max: 0.9 } },
  blut:   { r: [{ t: 'braun', f: 150, g: 0.18, lf: 0.05, lg: 0.06 }], o: [{ f: 38, g: 0.05 }], e: { a: 'klage', min: 4, max: 9 } },
  dornen: { r: [{ t: 'weiss', ft: 'highpass', f: 1500, g: 0.025, lf: 0.09, lg: 0.02 }, { t: 'braun', f: 300, g: 0.06 }], e: { a: 'knarren', min: 3, max: 8 } },
  sand:   { r: [{ t: 'weiss', ft: 'highpass', f: 3000, g: 0.05, lf: 0.3, lg: 0.02 }, { t: 'braun', f: 200, g: 0.09 }], e: { a: 'knistern', min: 0.2, max: 0.7 } },
  abgrund: { r: [{ t: 'weiss', ft: 'lowpass', f: 1300, g: 0.2, lf: 0.04, lg: 0.08 }, { t: 'braun', f: 90, g: 0.22 }] },
  bolgen: { r: [{ t: 'braun', f: 220, g: 0.12, lf: 0.07, lg: 0.05 }], o: [{ f: 46.2, g: 0.03, typ: 'triangle' }], e: { a: 'klage', min: 2, max: 6 } },
  pech:   { r: [{ t: 'braun', f: 200, g: 0.16 }], e: { a: 'blase', min: 0.3, max: 1.2 } },
  flammen: { r: [{ t: 'weiss', ft: 'bandpass', f: 500, q: 0.5, g: 0.11, lf: 0.25, lg: 0.05 }], e: { a: 'knistern', min: 0.2, max: 0.8 } },
  brunnen: { r: [{ t: 'braun', f: 110, g: 0.18, lf: 0.03, lg: 0.06 }], o: [{ f: 32.7, g: 0.05 }] },
  eis:    { r: [{ t: 'weiss', ft: 'highpass', f: 2500, g: 0.05, lf: 0.11, lg: 0.035 }, { t: 'braun', f: 350, g: 0.06, lf: 0.05, lg: 0.04 }], e: { a: 'eisriss', min: 4, max: 11 } },
  stille: { r: [{ t: 'braun', f: 120, g: 0.04 }] },
  sterne: { r: [{ t: 'braun', f: 400, g: 0.03 }], e: { a: 'stern', min: 1.2, max: 3.5 } },
};

export class Klang {
  constructor() {
    this.ctx = null; this.aktiv = false; this.bett = null; this.raumName = null;
    this.stimmen = new Map();
  }

  _init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* egal */ }
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.gain.value = 0;
    const komp = c.createDynamicsCompressor();
    this.master.connect(komp).connect(c.destination);
    this.raumBus = c.createGain(); this.raumBus.connect(this.master);
    const len = c.sampleRate * 3;
    this.weiss = c.createBuffer(1, len, c.sampleRate);
    this.braun = c.createBuffer(1, len, c.sampleRate);
    const w = this.weiss.getChannelData(0), b = this.braun.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const x = Math.random() * 2 - 1;
      w[i] = x;
      last = (last + 0.02 * x) / 1.02; b[i] = last * 3.5;
    }
  }

  an(aktiv) {
    this.aktiv = aktiv;
    if (aktiv && !this.ctx) this._init();
    if (!this.ctx) return;
    if (aktiv && this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    this.master.gain.setTargetAtTime(aktiv ? 0.9 : 0, this.ctx.currentTime, 0.25);
    if (aktiv && this.raumName && !this.bett) this.raum(this.raumName, true);
  }

  _rauschen(t) {
    const s = this.ctx.createBufferSource();
    s.buffer = t === 'weiss' ? this.weiss : this.braun; s.loop = true;
    s.loopStart = Math.random(); s.start(0, Math.random() * 2);
    return s;
  }

  _lfo(freq, menge, ziel) {
    const o = this.ctx.createOscillator(); o.frequency.value = freq * (0.8 + Math.random() * 0.4);
    const g = this.ctx.createGain(); g.gain.value = menge;
    o.connect(g).connect(ziel); o.start();
    return o;
  }

  raum(name, erzwingen = false) {
    if (!RAEUME[name]) name = 'stille';
    if (name === this.raumName && !erzwingen && this.bett) return;
    this.raumName = name;
    if (!this.ctx || !this.aktiv) return;
    const c = this.ctx, jetzt = c.currentTime;
    if (this.bett) { const alt = this.bett; alt.gain.gain.setTargetAtTime(0, jetzt, 1.2); clearTimeout(alt.timer); setTimeout(() => alt.quellen.forEach(q => { try { q.stop(); } catch { /* */ } }), 5000); }
    const rez = RAEUME[name];
    const gain = c.createGain(); gain.gain.value = 0; gain.connect(this.raumBus);
    gain.gain.setTargetAtTime(1, jetzt, 1.5);
    const quellen = [];
    for (const r of rez.r || []) {
      const q = this._rauschen(r.t); quellen.push(q);
      const f = c.createBiquadFilter(); f.type = r.ft || 'lowpass'; f.frequency.value = r.f; f.Q.value = r.q || 0.7;
      const g = c.createGain(); g.gain.value = r.g;
      q.connect(f).connect(g).connect(gain);
      if (r.lf) quellen.push(this._lfo(r.lf, r.lg || 0, g.gain));
      if (r.lff) quellen.push(this._lfo(r.lf * 0.7, r.lff, f.frequency));
    }
    for (const o of rez.o || []) {
      const osz = c.createOscillator(); osz.type = o.typ || 'sine'; osz.frequency.value = o.f;
      const g = c.createGain(); g.gain.value = o.g;
      let kette = osz;
      if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; kette = kette.connect(f); }
      kette.connect(g).connect(gain);
      if (o.vib) quellen.push(this._lfo(o.vib, o.f * 0.03, osz.frequency));
      osz.start(); quellen.push(osz);
    }
    const bett = { gain, quellen, timer: null };
    if (rez.e) {
      const plane = () => {
        bett.timer = setTimeout(() => { if (this.bett === bett) { this.ereignis(rez.e.a, 0.6); plane(); } }, (rez.e.min + Math.random() * (rez.e.max - rez.e.min)) * 1000);
      };
      plane();
    }
    this.bett = bett;
  }

  lauschen(an) {
    if (!this.ctx) return;
    this.raumBus.gain.setTargetAtTime(an ? 0.3 : 1, this.ctx.currentTime, 0.3);
  }

  // Eine murmelnde Stimme: Rauschen mit wanderndem Formant und Silbenrhythmus.
  stimme(key, n, pan = 0) {
    if (!this.ctx || !this.aktiv) return;
    let s = this.stimmen.get(key);
    if (!s && n <= 0.02) return;
    if (!s) {
      const c = this.ctx;
      const q = this._rauschen('weiss');
      const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 6;
      const basis = 500 + (hash(key) % 700);
      f1.frequency.value = basis;
      const silben = c.createGain(); silben.gain.value = 0.5;
      const laut = c.createGain(); laut.gain.value = 0;
      const p = c.createStereoPanner ? c.createStereoPanner() : null;
      q.connect(f1).connect(silben).connect(laut);
      if (p) laut.connect(p).connect(this.master); else laut.connect(this.master);
      const l1 = this._lfo(3.5 + (hash(key) % 30) / 10, 0.5, silben.gain);
      const l2 = this._lfo(0.6 + (hash(key + 'x') % 10) / 10, basis * 0.45, f1.frequency);
      s = { q, laut, p, quellen: [q, l1, l2] };
      this.stimmen.set(key, s);
    }
    const t = this.ctx.currentTime;
    s.laut.gain.setTargetAtTime(Math.pow(n, 1.6) * 0.55, t, 0.08);
    if (s.p) s.p.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), t, 0.08);
  }

  stilleStimmen() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const [key, s] of this.stimmen) {
      s.laut.gain.setTargetAtTime(0, t, 0.15);
      setTimeout(() => { s.quellen.forEach(q => { try { q.stop(); } catch { /* */ } }); }, 900);
      this.stimmen.delete(key);
    }
  }

  _ton(f, dauer, g = 0.15, typ = 'sine', start = 0) {
    const c = this.ctx, t = c.currentTime + start;
    const o = c.createOscillator(); o.type = typ; o.frequency.value = f;
    const v = c.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(v).connect(this.master); o.start(t); o.stop(t + dauer + 0.05);
    return o;
  }

  _stoss(dauer, f, g = 0.2, typ = 'bandpass', q = 1, start = 0, fEnde = null) {
    const c = this.ctx, t = c.currentTime + start;
    const s = this._rauschen('weiss');
    const fl = c.createBiquadFilter(); fl.type = typ; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (fEnde) fl.frequency.exponentialRampToValueAtTime(fEnde, t + dauer);
    const v = c.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + Math.min(0.02, dauer / 4)); v.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    s.connect(fl).connect(v).connect(this.master); s.stop(t + dauer + 0.1);
  }

  gefunden() { if (this.ctx && this.aktiv) { this._ton(660, 1.6, 0.06); this._ton(990, 1.2, 0.03, 'sine', 0.04); } }
  tippen() { if (this.ctx && this.aktiv) this._stoss(0.05, 4000, 0.08, 'highpass'); }
  blatt() { if (this.ctx && this.aktiv) this._stoss(0.45, 800, 0.12, 'bandpass', 0.8, 0, 3000); }

  ereignis(art, laut = 1) {
    if (!this.ctx || !this.aktiv) return;
    const z = Math.random;
    switch (art) {
      case 'knacken': this._stoss(0.04, 1500 + z() * 1500, 0.12 * laut, 'bandpass', 3); break;
      case 'klage': { const o = this._ton(180 + z() * 200, 1.8, 0.018 * laut, 'triangle'); o.frequency.linearRampToValueAtTime(120 + z() * 80, this.ctx.currentTime + 1.7); break; }
      case 'seufzer': this._stoss(1.6, 700 + z() * 400, 0.05 * laut, 'bandpass', 2, 0, 300); break;
      case 'bellen': for (let i = 0; i < 3; i++) this._stoss(0.12, 350 + z() * 150, 0.25 * laut, 'bandpass', 4, i * 0.22); break;
      case 'klirren': this._stoss(0.9, 180, 0.3 * laut, 'lowpass', 1); this._ton(97 + z() * 20, 1.2, 0.05 * laut, 'triangle'); break;
      case 'blase': { const o = this._ton(180 + z() * 200, 0.12, 0.05 * laut); o.frequency.exponentialRampToValueAtTime(600 + z() * 300, this.ctx.currentTime + 0.1); break; }
      case 'knistern': this._stoss(0.02 + z() * 0.03, 2500 + z() * 3000, 0.06 * laut, 'bandpass', 2); break;
      case 'knarren': { const o = this._ton(70 + z() * 40, 0.9, 0.03 * laut, 'sawtooth'); o.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.8); break; }
      case 'eisriss': this._stoss(0.25, 3000, 0.16 * laut, 'highpass', 1); this._stoss(0.6, 200, 0.12 * laut, 'lowpass', 1, 0.05); break;
      case 'stern': this._ton(1046 * [1, 1.25, 1.5, 2][Math.floor(z() * 4)], 2.5, 0.02 * laut); break;
      case 'donner': this._stoss(3, 120, 0.5 * laut, 'lowpass', 0.7, 0, 50); break;
      case 'horn': { const o = this._ton(73, 3.5, 0.18 * laut, 'sawtooth'); const o2 = this._ton(110, 3.4, 0.09 * laut, 'sawtooth'); o.frequency.linearRampToValueAtTime(78, this.ctx.currentTime + 3); o2.frequency.linearRampToValueAtTime(116, this.ctx.currentTime + 3); break; }
      case 'herz': this._ton(55, 0.18, 0.3 * laut); this._ton(50, 0.2, 0.22 * laut, 'sine', 0.22); break;
      case 'stein': this._stoss(1.5, 300, 0.4 * laut, 'lowpass', 1, 0, 60); break;
      case 'brechen': this._stoss(0.08, 2200, 0.3 * laut, 'bandpass', 2); this._stoss(0.3, 600, 0.12 * laut, 'bandpass', 1, 0.05); break;
      case 'schlag': this._stoss(0.3, 160, 0.45 * laut, 'lowpass', 1); break;
      case 'glocke': this._ton(392, 4, 0.08 * laut); this._ton(587, 3, 0.04 * laut); this._ton(784, 2, 0.02 * laut); break;
      case 'wind': this._stoss(2.5, 500, 0.3 * laut, 'lowpass', 0.6, 0, 1400); break;
      case 'schritt': this._stoss(0.09, 260, 0.2 * laut, 'lowpass', 1); break;
      case 'bruellen': this._stoss(1.2, 220, 0.45 * laut, 'bandpass', 2, 0, 90); break;
      default: break;
    }
  }
}

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
