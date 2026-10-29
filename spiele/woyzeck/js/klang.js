// Klang macht die Orte: Wind auf dem Feld, Trommeln beim Zapfenstreich, Leierkasten auf der Messe, Geigen
// im Wirtshaus, Atem im Schlafsaal, Wasser am Teich. Alles wird zur Laufzeit mit Web Audio erzeugt (keine
// Dateien). Der Klang ist nur Raum, nie Information: Das Spiel ist ohne Ton vollständig.
let ctx = null, master = null, rauschPuffer = null;
let aktiv = null, ortName = null, an = false, takt = null;

const TON = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI-Notennummer → Hz

function puffer(art) {
  const n = ctx.sampleRate * 3;
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0);
  let l = 0, p0 = 0, p1 = 0, p2 = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (art === "braun") { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; }
    else if (art === "rosa") { p0 = 0.997 * p0 + 0.029591 * w; p1 = 0.985 * p1 + 0.032534 * w; p2 = 0.95 * p2 + 0.048056 * w; d[i] = (p0 + p1 + p2 + 0.1848 * w) * 0.5; }
    else d[i] = w;
  }
  return b;
}

function rauschen(art, ziel) {
  rauschPuffer ??= {};
  rauschPuffer[art] ??= puffer(art);
  const q = ctx.createBufferSource();
  q.buffer = rauschPuffer[art];
  q.loop = true;
  q.loopStart = Math.random();
  q.connect(ziel);
  q.start(ctx.currentTime, Math.random() * 2);
  return q;
}

function filter(typ, f, Q = 0.7) { const b = ctx.createBiquadFilter(); b.type = typ; b.frequency.value = f; b.Q.value = Q; return b; }
function verstaerker(w) { const g = ctx.createGain(); g.gain.value = w; return g; }
function lfo(frequenz, tiefe, ziel) { const o = ctx.createOscillator(); o.frequency.value = frequenz; const g = verstaerker(tiefe); o.connect(g).connect(ziel); o.start(); return o; }

// Ein Ton mit Hüllkurve (für Melodien, Glocken, Grillen).
function ton({ f, t, dauer, art = "sine", laut = 0.2, ziel, angriff = 0.01, vibrato = 0 }) {
  const o = ctx.createOscillator();
  o.type = art;
  o.frequency.setValueAtTime(f, t);
  if (vibrato) { const v = ctx.createOscillator(); v.frequency.value = 5.5; const vg = verstaerker(f * vibrato); v.connect(vg).connect(o.frequency); v.start(t); v.stop(t + dauer + 0.2); }
  const g = verstaerker(0);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(laut, t + angriff);
  g.gain.exponentialRampToValueAtTime(0.0005, t + dauer);
  o.connect(g).connect(ziel);
  o.start(t);
  o.stop(t + dauer + 0.05);
}

function knall({ t, f = 1500, dauer = 0.12, laut = 0.3, ziel, Q = 1 }) {
  const q = ctx.createBufferSource();
  rauschPuffer ??= {};
  rauschPuffer.weiss ??= puffer("weiss");
  q.buffer = rauschPuffer.weiss;
  const b = filter("bandpass", f, Q);
  const g = verstaerker(0);
  g.gain.setValueAtTime(laut, t);
  g.gain.exponentialRampToValueAtTime(0.0005, t + dauer);
  q.connect(b).connect(g).connect(ziel);
  q.start(t, Math.random() * 2);
  q.stop(t + dauer + 0.05);
}

// ---- Schichten. Jede baut ihre Knoten an `bus` und gibt optional eine Planungsfunktion zurück.
const SCHICHTEN = {
  wind(bus, s) {
    const b = filter("bandpass", 420, 0.6), g = verstaerker(s);
    rauschen("braun", b); b.connect(g).connect(bus);
    lfo(0.05 + Math.random() * 0.03, 260, b.frequency); lfo(0.07, s * 0.6, g.gain);
  },
  raum(bus, s) { const b = filter("lowpass", 180); const g = verstaerker(s); rauschen("braun", b); b.connect(g).connect(bus); },
  atem(bus, s) {
    for (const f of [0.17, 0.23]) {
      const b = filter("lowpass", 520), g = verstaerker(s * 0.5);
      rauschen("braun", b); b.connect(g).connect(bus); lfo(f, s * 0.5, g.gain);
    }
  },
  wasser(bus, s) {
    const b = filter("lowpass", 850), h = filter("highpass", 140), g = verstaerker(s);
    rauschen("rosa", b); b.connect(h).connect(g).connect(bus); lfo(0.11, s * 0.4, g.gain);
    return (t) => { if (Math.random() < 0.5) knall({ t: t + Math.random(), f: 1800 + Math.random() * 2000, dauer: 0.06, laut: s * 0.5, ziel: bus, Q: 8 }); };
  },
  murmeln(bus, s) {
    const gs = [300, 520, 760].map((f) => { const b = filter("bandpass", f, 2.2), g = verstaerker(s * 0.4); rauschen("rosa", b); b.connect(g).connect(bus); return g; });
    return (t) => { for (const g of gs) g.gain.setTargetAtTime(s * (0.15 + Math.random() * 0.6), t + Math.random(), 0.25); };
  },
  grillen(bus, s) {
    return (t) => { for (let k = 0; k < 3; k++) { const t0 = t + Math.random(); for (let j = 0; j < 3; j++) ton({ f: 4300 + Math.random() * 300, t: t0 + j * 0.06, dauer: 0.04, laut: s, ziel: bus }); } };
  },
  kaefer(bus, s) { // „das Summen der Käfer wie gesprungne Glocken“
    return (t) => { if (Math.random() < 0.35) { const f = 380 + Math.random() * 200; ton({ f, t, dauer: 2.5, laut: s, ziel: bus, angriff: 0.6 }); ton({ f: f * 1.013, t, dauer: 2.5, laut: s, ziel: bus, angriff: 0.6 }); } };
  },
  froesche(bus, s) {
    return (t) => { if (Math.random() < 0.6) { const t0 = t + Math.random(); for (let j = 0; j < 4; j++) ton({ f: 140 + Math.random() * 30, t: t0 + j * 0.05, dauer: 0.05, art: "square", laut: s * 0.4, ziel: bus }); } };
  },
  voegel(bus, s) {
    return (t) => {
      if (Math.random() < 0.45) {
        const o = ctx.createOscillator(), g = verstaerker(0), t0 = t + Math.random();
        o.frequency.setValueAtTime(2400, t0); o.frequency.exponentialRampToValueAtTime(3600, t0 + 0.08); o.frequency.exponentialRampToValueAtTime(2800, t0 + 0.16);
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(s, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0005, t0 + 0.2);
        o.connect(g).connect(bus); o.start(t0); o.stop(t0 + 0.25);
      }
    };
  },
  glocke(bus, s, { selten = 0.04 } = {}) {
    return (t) => {
      if (Math.random() < selten) for (const [m, l] of [[1, 1], [2, 0.5], [2.4, 0.35], [3, 0.25], [4.2, 0.15]]) ton({ f: 196 * m, t, dauer: 5 / m + 1, laut: s * l, ziel: bus, angriff: 0.005 });
    };
  },
  uhr(bus, s) { return (t) => { knall({ t, f: 3200, dauer: 0.02, laut: s, ziel: bus, Q: 4 }); knall({ t: t + 0.5, f: 2600, dauer: 0.02, laut: s * 0.8, ziel: bus, Q: 4 }); }; },
  // Melodien laufen in Takten; jede Planung legt einen Takt (eine Sekunde) an.
  zapfenstreich(bus, s) {
    const fern = filter("lowpass", 1100); fern.connect(bus);
    const muster = [1, 0, 1, 1, 1, 0, 1, 0]; const melodie = [74, 76, 78, 81, 78, 76, 74, 69]; let i = 0;
    return (t) => {
      for (let k = 0; k < 4; k++) {
        const tk = t + k * 0.25;
        if (muster[i % 8]) { knall({ t: tk, f: 1700, dauer: 0.09, laut: s, ziel: fern }); ton({ f: 95, t: tk, dauer: 0.15, laut: s * 0.6, ziel: fern }); }
        if (i % 2 === 0) ton({ f: TON(melodie[(i / 2) % 8]), t: tk, dauer: 0.42, art: "triangle", laut: s * 0.35, ziel: fern, vibrato: 0.006 });
        i++;
      }
    };
  },
  leier(bus, s) {
    const dumpf = filter("lowpass", 1400); dumpf.connect(bus);
    const melodie = [67, 72, 72, 74, 76, 74, 72, 71, 72, 67, 69, 71, 72, 72, 0, 0]; let i = 0;
    return (t) => {
      for (let k = 0; k < 3; k++) {
        const n = melodie[i++ % melodie.length], tk = t + k * 0.33;
        if (n) { ton({ f: TON(n), t: tk, dauer: 0.32, art: "square", laut: s * 0.18, ziel: dumpf }); ton({ f: TON(n - 12), t: tk, dauer: 0.32, art: "triangle", laut: s * 0.12, ziel: dumpf }); }
        ton({ f: TON(48), t: tk, dauer: 0.3, art: "sawtooth", laut: s * 0.05, ziel: dumpf });
      }
    };
  },
  laendler(bus, s, { dumpf: grenze = 2600 } = {}) {
    const d = filter("lowpass", grenze); d.connect(bus);
    const melodie = [76, 79, 84, 83, 81, 79, 78, 79, 81, 79, 76, 74, 72, 76, 79, 79, 77, 74]; let i = 0;
    return (t) => {
      for (let k = 0; k < 3; k++) {
        const tk = t + k * 0.333;
        ton({ f: TON(melodie[i % melodie.length]), t: tk, dauer: 0.32, art: "sawtooth", laut: s * 0.16, ziel: d, vibrato: 0.008 });
        if (k === 0) { ton({ f: TON(48), t: tk, dauer: 0.3, laut: s * 0.5, ziel: d }); knall({ t: tk, f: 120, dauer: 0.12, laut: s * 0.5, ziel: d }); }
        else ton({ f: TON(i % 6 < 3 ? 64 : 62), t: tk, dauer: 0.2, art: "triangle", laut: s * 0.12, ziel: d });
        i++;
      }
    };
  },
};

const ORTE = {
  feld: { wind: 0.5, grillen: 0.012, glocke: [0.08, { selten: 0.03 }] },
  nachtfeld: { wind: 0.7, kaefer: 0.02, grillen: 0.008 },
  stadt: { wind: 0.15, murmeln: 0.08, glocke: [0.07, { selten: 0.05 }] },
  zapfenstreich: { wind: 0.12, murmeln: 0.06, zapfenstreich: 0.32 },
  jahrmarkt: { murmeln: 0.22, leier: 0.5 },
  kaserne: { raum: 0.25, murmeln: 0.04 },
  wachtstube: { raum: 0.2, laendler: [0.18, { dumpf: 700 }], glocke: [0.06, { selten: 0.04 }] },
  wirtshaus: { murmeln: 0.25, laendler: 0.5 },
  schlafsaal: { atem: 0.35, raum: 0.1, glocke: [0.03, { selten: 0.02 }] },
  hof: { wind: 0.25, murmeln: 0.05, voegel: 0.04 },
  teich: { wasser: 0.45, froesche: 0.12, wind: 0.2 },
  morgen: { voegel: 0.06, murmeln: 0.08, glocke: [0.08, { selten: 0.08 }], wind: 0.1 },
  amtsstube: { uhr: 0.12, raum: 0.15 },
};

function baue(name) {
  const bus = verstaerker(0);
  bus.connect(master);
  const planer = [];
  for (const [schicht, wert] of Object.entries(ORTE[name] ?? {})) {
    const [s, opt] = Array.isArray(wert) ? wert : [wert, undefined];
    const p = SCHICHTEN[schicht](bus, s, opt);
    if (p) planer.push(p);
  }
  bus.gain.setTargetAtTime(1, ctx.currentTime, 1.2);
  return { bus, planer, naechste: ctx.currentTime + 0.1 };
}

function planen() {
  if (!ctx || !aktiv) return;
  while (aktiv.naechste < ctx.currentTime + 1.5) {
    for (const p of aktiv.planer) p(aktiv.naechste);
    aktiv.naechste += 1;
  }
}

function wechsle(name) {
  if (aktiv) { const alt = aktiv; alt.bus.gain.setTargetAtTime(0, ctx.currentTime, 0.8); setTimeout(() => alt.bus.disconnect(), 5000); }
  aktiv = name && ORTE[name] ? baue(name) : null;
}

export const istAn = () => an;

export async function einschalten() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    if (navigator.audioSession) navigator.audioSession.type = "playback"; // iOS: auch bei Stummschalter
  } catch { /* nicht überall */ }
  ctx ??= new AC();
  if (!master) { master = verstaerker(0.35); const k = ctx.createDynamicsCompressor(); master.connect(k).connect(ctx.destination); }
  await ctx.resume();
  an = true;
  wechsle(ortName);
  takt ??= setInterval(planen, 250);
  return true;
}

export function ausschalten() {
  an = false;
  if (!ctx) return;
  wechsle(null);
  setTimeout(() => { if (!an) ctx.suspend(); }, 1500);
}

export function ort(name) {
  if (name === ortName) return;
  ortName = name;
  if (an && ctx) wechsle(name);
}

// Seite im Hintergrund: Klang anhalten, damit er nicht weiterläuft, wenn das iPad gesperrt ist.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (an) ctx.resume();
  });
}
