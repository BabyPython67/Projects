/* Moorlicht – Klang. Alles entsteht live mit Web Audio, es gibt keine Tondateien.
   Funken klingen wie die Glöckchen aus Johannisnacht (D-Dur-Pentatonik mit Echo) und steigen mit jedem
   Zug eine Stufe höher; Irrlichter sind ein kalter Tritonus, Erlöschen ein dumpfer Schlag mit Glassplittern.
   Dazu leise Grillen und Wind. */
(function (root) {
  "use strict";
  const PENTA = [293.66, 329.63, 369.99, 440, 493.88];
  const ton = (stufe) => PENTA[((stufe % 5) + 5) % 5] * Math.pow(2, Math.floor(stufe / 5));

  const K = {
    an: true, ac: null, bus: null, dry: null, wet: null, buf: null, wind: null, grillen: 0.5, grillenTimer: null,

    starten() {
      if (this.ac) {
        if (this.ac.state === "suspended") this.ac.resume();
        return;
      }
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return;
      try { this.ac = new AC(); } catch (e) { this.ac = null; return; }
      const ac = this.ac;
      this.out = ac.createGain();
      this.out.gain.value = this.an ? 0.9 : 0;
      this.out.connect(ac.destination);
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
      comp.connect(this.out);
      this.bus = comp;
      this.dry = ac.createGain(); this.dry.connect(comp);
      const d = ac.createDelay(1.5), fb = ac.createGain(), lp = ac.createBiquadFilter();
      d.delayTime.value = 0.31; fb.gain.value = 0.38; lp.type = "lowpass"; lp.frequency.value = 2400;
      this.wet = ac.createGain(); this.wet.gain.value = 0.42;
      this.wet.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(comp);
      const len = Math.floor(ac.sampleRate * 2);
      this.buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = this.buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.windStarten();
      this.grillenTimer = setInterval(() => this.grille(), 1300);
      document.addEventListener("visibilitychange", () => {
        if (!this.ac) return;
        if (document.hidden) this.ac.suspend(); else this.ac.resume();
      });
    },

    setzen(an) {
      this.an = an;
      if (this.out) this.out.gain.setTargetAtTime(an ? 0.9 : 0, this.ac.currentTime, 0.05);
    },

    // Stimmung: "dorf", "moor" oder "station" regelt Wind und Grillen.
    stimmung(art) {
      this.grillen = art === "dorf" ? 0.9 : art === "moor" ? 0.6 : 0.3;
      if (this.wind) this.wind.gain.setTargetAtTime(art === "dorf" ? 0.006 : art === "moor" ? 0.02 : 0.03, this.ac.currentTime, 1.2);
    },

    windStarten() {
      const ac = this.ac, s = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = this.buf; s.loop = true;
      lp.type = "lowpass"; lp.frequency.value = 380; lp.Q.value = 0.6;
      g.gain.value = 0.0001;
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 0.07; lg.gain.value = 160;
      lfo.connect(lg); lg.connect(lp.frequency);
      s.connect(lp); lp.connect(g); g.connect(this.bus);
      s.start(); lfo.start();
      this.wind = g;
    },

    grille() {
      if (!this.ac || !this.an || document.hidden || Math.random() > this.grillen) return;
      const t = this.ac.currentTime + Math.random() * 0.5, f = 4300 + Math.random() * 500;
      for (let i = 0; i < 3; i++) this.osz("sine", f, t + i * 0.045, 0.03, 0.006 + Math.random() * 0.004, this.dry);
    },

    osz(typ, f, t0, dauer, laut, ziel, gleiten) {
      const ac = this.ac, o = ac.createOscillator(), e = ac.createGain();
      o.type = typ;
      o.frequency.setValueAtTime(f, t0);
      if (gleiten) o.frequency.exponentialRampToValueAtTime(gleiten, t0 + dauer);
      e.gain.setValueAtTime(0.0001, t0);
      e.gain.exponentialRampToValueAtTime(laut, t0 + Math.min(0.012, dauer / 4));
      e.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
      o.connect(e); e.connect(ziel || this.dry);
      o.start(t0); o.stop(t0 + dauer + 0.05);
      return e;
    },

    glocke(f, t0, dauer, laut, ohneEcho) {
      const e = this.osz("sine", f, t0, dauer, laut, this.dry);
      const p = this.osz("sine", f * 2.76, t0, dauer * 0.45, laut * 0.18, this.dry);
      if (!ohneEcho) { e.connect(this.wet); p.connect(this.wet); }
    },

    rauschen(t0, dauer, laut, typ, f0, f1, q, ziel) {
      const ac = this.ac, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), e = ac.createGain();
      s.buffer = this.buf; s.loop = true;
      fl.type = typ; fl.frequency.setValueAtTime(f0, t0);
      if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t0 + dauer);
      fl.Q.value = q || 1;
      e.gain.setValueAtTime(0.0001, t0);
      e.gain.exponentialRampToValueAtTime(laut, t0 + Math.min(0.03, dauer / 3));
      e.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
      s.connect(fl); fl.connect(e); e.connect(ziel || this.dry);
      s.start(t0, Math.random()); s.stop(t0 + dauer + 0.05);
      return e;
    },

    spielen(name, a) {
      if (!this.ac || !this.an) return;
      const f = this.KLAENGE[name];
      if (!f) return;
      try { f.call(this, this.ac.currentTime + 0.01, a || {}); } catch (e) { /* Ton ist Zugabe */ }
    },

    KLAENGE: {
      zug(t) { this.rauschen(t, 0.18, 0.03, "bandpass", 900, 2600, 1.2); },
      funke(t, a) {
        const s = 5 + Math.min(14, a.stufe || 0), f = ton(s);
        switch (a.id) {
          case "leuchtkaefer":
            this.glocke(f, t, 1.8, 0.17); this.glocke(f / 2, t, 2, 0.12); this.osz("sine", 98, t, 0.25, 0.18, this.dry, 60); break;
          case "gleichtakt":
            for (let i = 0; i < Math.max(1, a.takt || 1); i++) this.glocke(ton(s + i * 2), t + i * 0.055, 1.3, 0.09);
            break;
          case "mondmotte":
            this.osz("triangle", f * 2, t, 0.7, 0.04, this.wet); this.glocke(f * 2, t + 0.05, 0.9, 0.05); break;
          case "nachtfalter":
            for (let i = 0; i < 3; i++) this.rauschen(t + i * 0.04, 0.05, 0.05, "bandpass", 2500, 0, 2);
            this.glocke(f, t + 0.1, 1, 0.09); break;
          case "johannis":
            this.glocke(f, t, 1.5, 0.11); this.osz("triangle", f / 2, t, 1.2, 0.05, this.wet); break;
          case "funkenflieger":
            this.osz("sine", f / 2, t, 0.32, 0.08, this.dry, f * 2); this.glocke(f * 2, t + 0.3, 1.1, 0.09); break;
          case "glutkaefer":
            for (let i = 0; i < 5; i++) this.rauschen(t + i * 0.03 + Math.random() * 0.02, 0.025, 0.07, "highpass", 3000);
            this.glocke(f * 0.75, t, 1.2, 0.11); break;
          case "gebunden":
            this.glocke(f, t, 1.8, 0.13); this.osz("sine", f * 1.5, t, 1.4, 0.04, this.wet); break;
          default:
            this.glocke(f, t, 1.2, 0.12);
        }
      },
      irrlicht(t, a) {
        if (a.gefangen) { this.osz("sine", 900, t, 0.14, 0.09, this.dry, 300); this.glocke(ton(2), t + 0.05, 0.8, 0.05); return; }
        const k = Math.max(1, a.k || 1);
        this.osz("triangle", 622.25, t, 0.6, 0.035 * k, this.wet, 430);
        this.osz("triangle", 440, t, 0.6, 0.035 * k, this.dry, 300);
        this.rauschen(t, 0.55, 0.035 * k, "bandpass", 1800, 800, 3);
        if (k >= 3) this.osz("sine", 110, t, 0.5, 0.2, this.dry, 70);
      },
      flackern(t) {
        this.osz("sine", 1180, t, 0.7, 0.04, this.wet, 1000);
        this.KLAENGE.herz.call(this, t + 0.05);
      },
      herz(t) {
        this.osz("sine", 72, t, 0.16, 0.28, this.dry, 45);
        this.osz("sine", 72, t + 0.22, 0.18, 0.2, this.dry, 45);
      },
      erloschen(t) {
        this.osz("sine", 130, t, 1, 0.55, this.dry, 30);
        this.rauschen(t, 1, 0.38, "lowpass", 2200, 110, 0.7);
        for (let i = 0; i < 12; i++) this.osz("sine", 2200 + Math.random() * 4200, t + 0.02 + Math.random() * 0.3, 0.06 + Math.random() * 0.1, 0.045, this.wet);
        this.glocke(ton(3), t + 0.7, 2.4, 0.06);
        this.glocke(ton(1), t + 1.0, 2.8, 0.05);
      },
      bestanden(t, a) {
        const st = a.stark ? [0, 2, 4, 5, 7, 9, 10] : [0, 2, 4, 5, 7];
        st.forEach((s, i) => this.glocke(ton(5 + s), t + i * 0.07, 1.7, 0.09));
        this.rauschen(t, 1.1, 0.12, "bandpass", 300, 3200, 0.8);
        this.osz("triangle", 146.83, t, 1.9, 0.06, this.wet);
        this.osz("triangle", 220, t, 1.9, 0.045, this.wet);
        if (a.stark) this.osz("sine", 73.4, t, 1.2, 0.3, this.dry, 55);
      },
      verfehlt(t) {
        this.glocke(ton(4), t, 0.9, 0.08);
        this.glocke(ton(1), t + 0.18, 1.3, 0.08);
        this.rauschen(t, 0.45, 0.1, "lowpass", 700, 160);
      },
      muenze(t, a) {
        this.osz("sine", 1760 + (a.i || 0) * 55, t, 0.08, 0.06, this.dry);
        this.osz("sine", 2637 + (a.i || 0) * 80, t, 0.06, 0.02, this.wet);
      },
      kauf(t) {
        this.KLAENGE.muenze.call(this, t, { i: 0 }); this.KLAENGE.muenze.call(this, t + 0.06, { i: 3 });
        this.glocke(ton(7), t + 0.1, 0.9, 0.07);
      },
      talisman(t) {
        [5, 9, 12, 14].forEach((s, i) => this.glocke(ton(s), t + i * 0.12, 2, 0.08));
        this.osz("triangle", ton(17), t + 0.3, 1.4, 0.02, this.wet);
      },
      schritt(t) { this.rauschen(t, 0.14, 0.14, "lowpass", 520, 150, 1); this.rauschen(t + 0.16, 0.12, 0.09, "lowpass", 480, 150, 1); },
      klick(t) { this.osz("sine", 1300, t, 0.035, 0.03, this.dry); },
      seite(t) { this.rauschen(t, 0.28, 0.06, "highpass", 1800, 6000, 0.5); },
      start(t) { this.glocke(ton(5), t, 1.6, 0.09); this.glocke(ton(9), t + 0.16, 1.8, 0.08); this.glocke(ton(12), t + 0.32, 2.2, 0.07); },
      region(t) {
        this.osz("triangle", 110, t, 2.6, 0.07, this.wet);
        this.osz("sine", 164.8, t + 0.25, 2.3, 0.05, this.wet);
        this.glocke(ton(5), t + 0.5, 2.2, 0.05);
      },
      sieg(t) {
        [146.83, 220, 293.66, 369.99].forEach((f, i) => this.osz("triangle", f, t + i * 0.05, 4, 0.05, this.wet));
        for (let i = 0; i < 10; i++) this.glocke(ton(5 + i), t + 0.3 + i * 0.12, 2.4, 0.07);
      }
    }
  };

  root.MoorlichtKlang = K;
})(typeof self !== "undefined" ? self : this);
