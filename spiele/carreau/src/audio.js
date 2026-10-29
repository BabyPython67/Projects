// Klang: alles live synthetisiert – Stahl, Holz, Kies, Zikaden, die Kirchenglocke. Nichts ist aufgenommen.

const SURF_SOUND = {
  kies: { f: 2100, q: 0.9, grains: 9, lp: 6000 },
  sand: { f: 700, q: 0.7, grains: 2, lp: 1800 },
  lehm: { f: 380, q: 1.2, grains: 3, lp: 2500 },
  grob: { f: 2600, q: 0.8, grains: 14, lp: 7000 },
};

export class Sound {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.rollGain = null;
    this.hour = 15;
    this.lastClack = 0;
  }

  unlock() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch (e) { /* älteres Safari */ }
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.build();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  build() {
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = this.enabled ? 0.9 : 0;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(c.destination);
    this.dry = c.createGain();
    this.dry.connect(this.master);
    // Platz-Hall: kurze, helle Fassaden-Reflexionen
    this.verb = c.createConvolver();
    this.verb.buffer = this.impulse(1.8, 2.8);
    this.wet = c.createGain();
    this.wet.gain.value = 0.32;
    this.verb.connect(this.wet).connect(this.master);
    this.noise = this.noiseBuffer(2);
    this.buildRoll();
    this.startAmbience();
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.05);
  }

  impulse(sec, decay) {
    const c = this.ctx, n = Math.floor(c.sampleRate * sec);
    const b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const early = i < c.sampleRate * 0.09 && Math.random() < 0.004 ? 0.8 : 0;
        d[i] = ((Math.random() * 2 - 1) * Math.pow(1 - t, decay) + early) * 0.6;
      }
    }
    return b;
  }

  noiseBuffer(sec) {
    const c = this.ctx, n = Math.floor(c.sampleRate * sec);
    const b = c.createBuffer(1, n, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  out(pan = 0, send = 0.4) {
    const c = this.ctx;
    const g = c.createGain();
    const p = c.createStereoPanner ? c.createStereoPanner() : null;
    if (p) {
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p);
      p.connect(this.dry);
      if (send) {
        const s = c.createGain();
        s.gain.value = send;
        p.connect(s).connect(this.verb);
      }
    } else {
      g.connect(this.dry);
    }
    return g;
  }

  tone(freq, t, peak, decay, dest, type = 'sine', attack = 0.002) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + attack + decay + 0.05);
    return o;
  }

  burst(t, dur, freq, q, vol, dest, type = 'bandpass', attack = 0.002) {
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur);
    s.connect(f).connect(g).connect(dest);
    const off = Math.random() * 1.5;
    s.start(t, off, attack + dur + 0.05);
  }

  ok() {
    return this.ctx && this.enabled && this.ctx.state === 'running';
  }

  // Stahl auf Stahl: unharmonische Teiltöne, kurzer Klick
  clack(speed, pan = 0, seed = 0) {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    if (t - this.lastClack < 0.012) return;
    this.lastClack = t;
    const v = Math.min(1, Math.pow(speed / 5, 0.8)) * 0.55 + 0.03;
    const dest = this.out(pan, 0.55);
    const k = 1 + ((seed % 7) - 3) * 0.012;
    const parts = [[2380, 1, 0.32], [3920, 0.55, 0.22], [5610, 0.4, 0.14], [7980, 0.22, 0.08], [1240, 0.18, 0.12]];
    for (const [f, a, d] of parts) this.tone(f * k, t, v * a * 0.5, d * (0.6 + v), dest);
    this.burst(t, 0.012, 4200, 0.7, v * 0.6, dest, 'highpass', 0.0005);
  }

  // Holz der Sau
  tock(speed, pan = 0) {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const v = Math.min(1, speed / 4) * 0.45 + 0.04;
    const dest = this.out(pan, 0.35);
    this.tone(880, t, v * 0.5, 0.07, dest);
    this.tone(1610, t, v * 0.3, 0.05, dest);
    this.tone(2930, t, v * 0.12, 0.03, dest);
    this.burst(t, 0.015, 1800, 1.2, v * 0.4, dest);
  }

  // Landung im Boden: je nach Untergrund Knirschen, Wumms oder dumpfer Schlag
  land(surf, impact, pan = 0, jack = false) {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const s = SURF_SOUND[surf] || SURF_SOUND.kies;
    const v = Math.min(1, impact / 7) * (jack ? 0.35 : 0.8) + 0.05;
    const dest = this.out(pan, 0.25);
    this.burst(t, 0.06 + v * 0.08, s.f, s.q, v * 0.7, dest);
    this.burst(t, 0.09, 180, 0.8, v * 0.5, dest, 'lowpass');
    if (!jack) this.tone(90, t, v * 0.35, 0.09, dest);
    const n = Math.round(s.grains * (0.4 + v));
    for (let i = 0; i < n; i++) this.burst(t + Math.random() * 0.09, 0.006, s.f * (1 + Math.random()), 2, v * 0.25 * Math.random(), dest);
  }

  board(speed, pan = 0) {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    const v = Math.min(1, speed / 4) * 0.6 + 0.05;
    const dest = this.out(pan, 0.4);
    this.tone(160, t, v * 0.5, 0.12, dest, 'triangle');
    this.tone(330, t, v * 0.25, 0.08, dest);
    this.burst(t, 0.03, 900, 1, v * 0.4, dest);
  }

  whoosh(speed) {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const v = Math.min(1, speed / 9) * 0.25 + 0.04;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.4;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(1400, t + 0.22);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    s.connect(f).connect(g).connect(this.out(0, 0.1));
    s.start(t, Math.random(), 0.4);
  }

  buildRoll() {
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    this.rollFilter = c.createBiquadFilter();
    this.rollFilter.type = 'bandpass';
    this.rollFilter.frequency.value = 1800;
    this.rollFilter.Q.value = 0.8;
    this.rollGain = c.createGain();
    this.rollGain.gain.value = 0;
    s.connect(this.rollFilter).connect(this.rollGain).connect(this.dry);
    s.start();
    this.rollAcc = 0;
  }

  // Rollgeräusch: Rauschen plus einzelne Kieselknackser im Takt der Strecke
  roll(speed, surf, dt, pan = 0) {
    if (!this.ctx || !this.rollGain) return;
    const t = this.ctx.currentTime;
    const s = SURF_SOUND[surf] || SURF_SOUND.kies;
    const v = this.enabled ? Math.min(0.16, speed * 0.05) : 0;
    this.rollGain.gain.setTargetAtTime(v, t, 0.04);
    this.rollFilter.frequency.setTargetAtTime(s.f * 0.9, t, 0.05);
    if (!this.ok() || speed < 0.05) return;
    this.rollAcc += speed * dt * s.grains * 3;
    const dest = this.rollGain && this.out(pan, 0.1);
    let k = 0;
    while (this.rollAcc > 1 && k < 4) {
      this.rollAcc -= 1;
      k++;
      this.burst(t + Math.random() * 0.02, 0.004, s.f * (0.8 + Math.random() * 0.8), 3, Math.min(0.12, speed * 0.04), dest);
    }
  }

  // Bedienung: Holzklick, Auswahl, Ziehen
  tap() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    const d = this.out(0, 0.15);
    this.tone(1320, t, 0.08, 0.04, d);
    this.tone(660, t, 0.06, 0.06, d, 'triangle');
  }

  select(i = 0) {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    const d = this.out(0, 0.3);
    const base = [523.25, 587.33, 659.25, 783.99][i % 4];
    this.tone(base, t, 0.12, 0.25, d);
    this.tone(base * 2.01, t, 0.04, 0.15, d);
  }

  scratch(amount) {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    this.burst(t, 0.01, 2500 + Math.random() * 1500, 2, Math.min(0.06, 0.01 + amount * 0.02), this.out(0, 0));
  }

  holdStart() {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    this.holdStop();
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(196, t);
    o.frequency.linearRampToValueAtTime(262, t + 3);
    const trem = c.createOscillator();
    trem.frequency.value = 5;
    const tg = c.createGain();
    tg.gain.value = 0.01;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.4);
    trem.connect(tg).connect(g.gain);
    o.connect(g).connect(this.out(0, 0.5));
    o.start(t);
    trem.start(t);
    this.hold = { o, trem, g };
  }

  holdStop() {
    if (!this.hold || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.hold.g.gain.setTargetAtTime(0, t, 0.03);
    this.hold.o.stop(t + 0.2);
    this.hold.trem.stop(t + 0.2);
    this.hold = null;
  }

  // Kleines Motiv für besondere Momente
  chime(kind = 'good') {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    const d = this.out(0, 0.6);
    const seq = kind === 'good' ? [659.25, 783.99, 987.77, 1318.5] : kind === 'win' ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [392, 349.23, 293.66];
    seq.forEach((f, i) => {
      this.tone(f, t + i * 0.09, 0.1, 0.6, d, 'triangle');
      this.tone(f * 2, t + i * 0.09, 0.03, 0.3, d);
    });
  }

  applause(intensity = 1) {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    const d = this.out(0, 0.5);
    const n = Math.round(30 * intensity);
    for (let i = 0; i < n; i++) {
      const tt = t + Math.random() * 1.4 * Math.sqrt(intensity);
      this.burst(tt, 0.012, 1200 + Math.random() * 2400, 1.5, 0.05 + Math.random() * 0.06, d);
    }
  }

  // Ferne Kirchenglocke
  bell(strikes = 1) {
    if (!this.ok()) return;
    const t0 = this.ctx.currentTime;
    const d = this.out(-0.4, 0.9);
    for (let s = 0; s < strikes; s++) {
      const t = t0 + s * 2.2;
      const f0 = 311;
      for (const [r, a, dec] of [[0.5, 0.5, 4], [1, 0.6, 3], [1.19, 0.35, 2.4], [1.5, 0.25, 2], [2, 0.3, 1.6], [2.52, 0.12, 1.2], [3.01, 0.08, 0.9]]) {
        this.tone(f0 * r, t, 0.05 * a, dec, d, 'sine', 0.004);
      }
    }
  }

  setHour(h) {
    this.hour = h;
    if (this.amb) this.mixAmbience();
  }

  startAmbience() {
    const c = this.ctx;
    const amb = { voices: [] };
    const bus = c.createGain();
    bus.gain.value = 1;
    bus.connect(this.master);
    amb.bus = bus;
    // Zikaden: gefiltertes Rauschen, schnell gepulst, langsam an- und abschwellend
    for (const [freq, rate, pan, swell] of [[5200, 41, -0.6, 0.07], [6100, 47, 0.55, 0.05], [4700, 37, 0.1, 0.09]]) {
      const s = c.createBufferSource();
      s.buffer = this.noise;
      s.loop = true;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq;
      f.Q.value = 7;
      const am = c.createGain();
      am.gain.value = 0.5;
      const lfo = c.createOscillator();
      lfo.frequency.value = rate;
      const lg = c.createGain();
      lg.gain.value = 0.5;
      lfo.connect(lg).connect(am.gain);
      const sw = c.createGain();
      sw.gain.value = 0.5;
      const slfo = c.createOscillator();
      slfo.frequency.value = swell;
      const sg = c.createGain();
      sg.gain.value = 0.5;
      slfo.connect(sg).connect(sw.gain);
      const out = c.createGain();
      out.gain.value = 0;
      const p = c.createStereoPanner ? c.createStereoPanner() : c.createGain();
      if (p.pan) p.pan.value = pan;
      s.connect(f).connect(am).connect(sw).connect(out).connect(p).connect(bus);
      s.start(0, Math.random());
      lfo.start();
      slfo.start();
      amb.voices.push({ kind: 'cicada', out });
    }
    // Wind in den Platanen
    const ws = c.createBufferSource();
    ws.buffer = this.noise;
    ws.loop = true;
    const wf = c.createBiquadFilter();
    wf.type = 'lowpass';
    wf.frequency.value = 520;
    const wg = c.createGain();
    wg.gain.value = 0.02;
    const wl = c.createOscillator();
    wl.frequency.value = 0.11;
    const wlg = c.createGain();
    wlg.gain.value = 0.014;
    wl.connect(wlg).connect(wg.gain);
    ws.connect(wf).connect(wg).connect(bus);
    ws.start();
    wl.start();
    amb.wind = wg;
    this.amb = amb;
    this.mixAmbience();
    this.ambTimer = setInterval(() => this.ambTick(), 900);
  }

  mixAmbience() {
    if (!this.amb) return;
    const h = this.hour;
    const day = h >= 9 && h < 19.5 ? 1 : h >= 7 && h < 9 ? (h - 7) / 2 : h >= 19.5 && h < 21 ? (21 - h) / 1.5 : 0;
    const t = this.ctx.currentTime;
    for (const v of this.amb.voices) v.out.gain.setTargetAtTime(0.028 * day, t, 1.5);
    this.night = 1 - day;
  }

  ambTick() {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    if (this.night > 0.3 && Math.random() < 0.8) {
      // Grillen am Abend
      const d = this.out(Math.random() * 1.6 - 0.8, 0.2);
      const f = 4300 + Math.random() * 300;
      for (let k = 0; k < 3; k++) this.tone(f, t + k * 0.055, 0.012 * this.night, 0.03, d);
    }
    if (this.night < 0.7 && Math.random() < 0.09) {
      // Spatzen
      const d = this.out(Math.random() * 1.6 - 0.8, 0.4);
      const n = 2 + Math.floor(Math.random() * 4);
      for (let k = 0; k < n; k++) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const tt = t + k * (0.09 + Math.random() * 0.05);
        o.frequency.setValueAtTime(3400 + Math.random() * 800, tt);
        o.frequency.exponentialRampToValueAtTime(5200 + Math.random() * 900, tt + 0.05);
        g.gain.setValueAtTime(0, tt);
        g.gain.linearRampToValueAtTime(0.018, tt + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.07);
        o.connect(g).connect(d);
        o.start(tt);
        o.stop(tt + 0.1);
      }
    }
  }
}
