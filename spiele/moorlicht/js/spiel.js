/* Moorlicht – Oberfläche: Bildschirme, Szene auf dem Canvas, Animationen, Eingabe und Speichern.
   Die Regeln stehen allein in engine.js; hier wird gezeigt, animiert und weitergereicht.
   Adress-Anhängsel: ?seed=7 macht jede neue Nacht gleich, ?tempo=8 beschleunigt alle Animationen. */
(function () {
  "use strict";
  const M = window.Moorlicht, K = window.MoorlichtKlang, I = M.I;
  const { ARTEN, KRAEUTER, TALISMANE, MODS, REGIONEN, WAECHTER, LATERNEN, MONDPHASEN, FREISCHALTUNGEN, NOTIZEN, FIGUREN, GESPRAECHE, TEXTE } = I;

  const parameter = new URLSearchParams(location.search);
  const TEMPO = Math.min(30, Math.max(0.25, Number(parameter.get("tempo")) || 1));
  const FESTER_SEED = parameter.get("seed");
  const ms = (x) => x / TEMPO;
  const SPEICHER = "moorlicht.v1";
  const $ = (s) => document.querySelector(s);
  const bild = $("#bild"), kopf = $("#kopf"), dialog = $("#dialog"), popups = $("#popups");
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const later = (f, x) => setTimeout(f, ms(x));

  const S = { meta: null, run: null, ansicht: "dorf", sperre: false, auswahl: null, laterne: "sturm", mond: 0, picker: null, region: -1 };

  /* ================= Speichern ================= */
  function laden() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(SPEICHER) || "null"); } catch (e) { d = null; }
    S.meta = M.metaReparieren(d && d.meta);
    S.meta.tipps = S.meta.tipps || [];
    S.run = d && d.laufend && d.laufend.version === 1 && d.laufend.phase !== "ende" ? d.laufend : null;
    K.an = !(d && d.ton === false);
    S.laterne = (d && d.laterne) || "sturm";
    S.mond = (d && d.mond) || 0;
    if (M.laternenFrei(S.meta).indexOf(S.laterne) < 0) S.laterne = "sturm";
    if (S.mond > S.meta.mondphaseFrei) S.mond = S.meta.mondphaseFrei;
    S.ansicht = S.meta.introGesehen ? "dorf" : "intro";
  }
  function speichern() {
    try {
      localStorage.setItem(SPEICHER, JSON.stringify({
        meta: S.meta, laufend: S.run && S.run.phase !== "ende" ? S.run : null, ton: K.an, laterne: S.laterne, mond: S.mond
      }));
    } catch (e) { /* privater Modus: dann eben ohne Speichern */ }
  }

  /* ================= Bausteine ================= */
  const ICON = {
    glas: '<svg viewBox="0 0 24 24"><path d="M8 3h8M9 3v3c-2 1-3 3-3 5v7a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-7c0-2-1-4-3-5V3"/><circle cx="11" cy="14" r="1.3" class="f"/><circle cx="14" cy="11" r="1.1" class="f"/><circle cx="13.5" cy="16.5" r="1" class="f"/></svg>',
    ton: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" class="f"/><path d="M15.5 8.8a4.6 4.6 0 0 1 0 6.4M18 6.4a8 8 0 0 1 0 11.2"/></svg>',
    stumm: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" class="f"/><path d="M15.5 9.5l5 5m0-5l-5 5"/></svg>',
    menue: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    hilfe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.7.3-1 .9-1 1.6v.4"/><circle cx="12" cy="17.1" r="1" class="f"/></svg>',
    pfad: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z" class="f"/></svg>',
    nebel: '<svg viewBox="0 0 24 24"><path d="M7 14h10a3.5 3.5 0 0 0 0-7 4.5 4.5 0 0 0-8.6-1.2A3.4 3.4 0 0 0 7 14z"/><path d="M4 18h16M7 21h10"/></svg>',
    fund: '<svg viewBox="0 0 24 24"><path d="M7 3h8l3 3v15H7z"/><path d="M10 10h5M10 13h5M10 16h3"/></svg>',
    rast: '<svg viewBox="0 0 24 24"><path d="M12 3c.8 3 4.5 4.5 4.5 8.5a4.5 4.5 0 0 1-9 0c0-2.2 1.5-3 1.8-5 .9.8 1.2 1.8 1.6 2.6.6-2 .4-4 1.1-6.1z" class="f"/><path d="M5 21l14-3M19 21L5 18"/></svg>',
    haendler: '<svg viewBox="0 0 24 24"><path d="M5 9h14l-1.2 11H6.2z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/></svg>',
    waechter: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3.2" class="f"/></svg>'
  };
  const TYP = {
    pfad: { name: "Pfad", text: "Eine Station am Bohlenweg: Funken ziehen, bis das Licht reicht." },
    nebel: { name: "Nebelbank", text: "Schwer und mit harter Besonderheit, aber ein Talisman als Lohn." },
    fund: { name: "Fund", text: "Etwas liegt am Weg. Eine Geschichte und eine Entscheidung." },
    rast: { name: "Lagerfeuer", text: "Docht flicken oder einen Funken für immer aus dem Glas nehmen." },
    haendler: { name: "Die Krämerin", text: "Funken, Kräuter und Talismane gegen Glanz. Sie treibt auch Irrlichter aus." },
    waechter: { name: "Wächter", text: "" }
  };
  const CHIP = { gluehwuermchen: "1", johannis: "1", gleichtakt: "♪", leuchtkaefer: "4", mondmotte: "×2", nachtfalter: "1", funkenflieger: "∑", glutkaefer: "2", gebunden: "5", irrlicht1: "1", irrlicht2: "2", irrlicht3: "3" };
  const chip = (id, extra) => `<span class="chip ${ARTEN[id].irr ? "irr" : ""} ${extra || ""}" style="--f:${ARTEN[id].farbe}" title="${esc(ARTEN[id].name)}">${CHIP[id]}</span>`;
  const flammen = (n, max) => Array.from({ length: max }, (_, i) => `<i class="fl ${i < n ? "an" : ""}"></i>`).join("");
  const talismanZeichen = (id) => `<span class="talisman-zeichen">${esc(TALISMANE[id].name[0])}</span>`;
  const krautZeichen = (id) => `<span class="kraut-zeichen">${esc(KRAEUTER[id].name[0])}</span>`;
  function mitteVon(el) {
    if (!el) return { x: Z.w / 2, y: Z.h * 0.8 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function popup(text, art, zeile) {
    const p = document.createElement("div");
    p.className = "popup " + (art || "");
    p.textContent = text;
    p.style.left = Z.lx + (zeile ? 0 : (Math.random() - 0.5) * 24) + "px";
    p.style.top = Z.ly - 40 + (zeile || 0) * 28 + "px";
    p.style.animationDuration = ms(1050) + "ms";
    popups.appendChild(p);
    setTimeout(() => p.remove(), ms(1100) + 50);
  }
  function blitz(art) {
    const b = $("#blitz");
    b.className = "";
    void b.offsetWidth;
    b.className = art;
  }
  function beben() {
    const a = $("#app");
    a.classList.remove("beben");
    void a.offsetWidth;
    a.classList.add("beben");
  }
  function vibrieren(muster) { try { if (navigator.vibrate) navigator.vibrate(muster); } catch (e) { /* egal */ } }
  function modal(html) {
    dialog.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="ikon zu" data-aktion="schliessen" aria-label="Schließen">×</button>${html}</div>`;
    dialog.hidden = false;
  }
  function schliessen() { dialog.hidden = true; dialog.innerHTML = ""; }
  function tipp(id, text) {
    if (S.meta.tipps.indexOf(id) >= 0) return "";
    return `<div class="tipp">${text}<button data-aktion="tippWeg" data-id="${id}">Verstanden</button></div>`;
  }

  /* ================= Szene ================= */
  const cv = $("#szene"), cx = cv.getContext("2d");
  const Z = {
    w: 1, h: 1, dpr: 1, art: "", himmel: null, land: null, maske: null, mk: null,
    sterne: [], kaefer: [], partikel: [], flieger: [], kristalle: [],
    lx: 0, ly: 0, laterne: false, kaeferHell: 0.9, sternHell: 1,
    licht: 0.3, lichtZiel: 0.3, kaelte: 0, kaelteZiel: 0, nebel: 0, nebelZiel: 0,
    dunkel: 0.2, dunkelZiel: 0.2, flamme: 1, flammeZiel: 1, wackeln: 0, stopBis: 0, mond: 0.1, turmLicht: 0
  };
  function prng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const sprites = {};
  function glut(farbe) {
    if (sprites[farbe]) return sprites[farbe];
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.16, farbe);
    gr.addColorStop(0.42, farbe + "55");
    gr.addColorStop(1, farbe + "00");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return (sprites[farbe] = c);
  }
  const nebelBild = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(170,188,212,0.5)");
    gr.addColorStop(1, "rgba(170,188,212,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return c;
  })();
  const mondBilder = {};
  function mondBild(f) {
    const key = f.toFixed(2);
    if (mondBilder[key]) return mondBilder[key];
    const c = document.createElement("canvas");
    c.width = c.height = 80;
    const g = c.getContext("2d");
    g.fillStyle = "#f3eed9";
    g.beginPath(); g.arc(40, 40, 30, 0, 6.283); g.fill();
    g.fillStyle = "rgba(180,170,140,0.35)";
    for (const [x, y, r] of [[30, 32, 6], [50, 46, 8], [44, 26, 4], [34, 52, 5]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
    g.globalCompositeOperation = "destination-out";
    g.beginPath(); g.arc(40 - f * 64, 40, 31, 0, 6.283); g.fill();
    return (mondBilder[key] = c);
  }

  function neuerKaefer() {
    return { x: Math.random(), y: 0.52 + Math.random() * 0.44, vx: (Math.random() - 0.5) * 0.02, vy: (Math.random() - 0.5) * 0.01, p: Math.random() * 3, per: 2.2 + Math.random() * 1.6, f: Math.random() < 0.8 ? "#d4f26a" : "#ffcf6e" };
  }
  function groesse() {
    Z.w = window.innerWidth;
    Z.h = window.innerHeight;
    Z.dpr = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(3.2e6 / (Z.w * Z.h)));
    cv.width = Math.round(Z.w * Z.dpr);
    cv.height = Math.round(Z.h * Z.dpr);
    Z.maske = Z.maske || document.createElement("canvas");
    Z.maske.width = cv.width;
    Z.maske.height = cv.height;
    Z.mk = Z.maske.getContext("2d");
    const r = prng(7);
    Z.sterne = Array.from({ length: 120 }, () => ({ x: r(), y: r() * 0.5, g: r() * 1.4 + 0.3, p: r() * 6.3 }));
    Z.kristalle = [];
    for (let i = 0; i < 90; i++) {
      const kante = Math.floor(r() * 4), t = r();
      let x = kante === 0 ? t * Z.w : kante === 1 ? Z.w : kante === 2 ? t * Z.w : 0;
      let y = kante === 0 ? 0 : kante === 1 ? t * Z.h : kante === 2 ? Z.h : t * Z.h;
      let winkel = [Math.PI / 2, Math.PI, -Math.PI / 2, 0][kante] + (r() - 0.5) * 1.4;
      const schwelle = r();
      for (let s = 0; s < 4; s++) {
        const l = (12 + r() * 30) * (1 - s * 0.18);
        const x2 = x + Math.cos(winkel) * l, y2 = y + Math.sin(winkel) * l;
        Z.kristalle.push({ x1: x, y1: y, x2, y2, s: schwelle });
        if (r() < 0.6) Z.kristalle.push({ x1: x2, y1: y2, x2: x2 + Math.cos(winkel + 0.8) * l * 0.5, y2: y2 + Math.sin(winkel + 0.8) * l * 0.5, s: schwelle });
        x = x2; y = y2; winkel += (r() - 0.5) * 0.9;
      }
    }
    if (!Z.kaefer.length) Z.kaefer = Array.from({ length: 26 }, neuerKaefer);
    const art = Z.art;
    Z.art = "";
    if (art) hintergrund(art);
    laternenPosition();
  }

  const PALETTEN = {
    dorf: { himmel: ["#131936", "#3a2a4a", "#a5584a", "#e58e55"], glut: "rgba(255,150,90,0.35)", boden: ["#1b1712", "#0a0908"], fern: "#2a2032", nah: "#0f0b0d" },
    r0: { himmel: ["#060c1b", "#0f1a30", "#1f2f48"], glut: "rgba(120,150,195,0.2)", boden: ["#121a1b", "#060809"], fern: "#0c1420", nah: "#04070a" },
    r1: { himmel: ["#07080f", "#131522", "#2c2b2e"], glut: "rgba(170,140,110,0.16)", boden: ["#17130e", "#070605"], fern: "#100f12", nah: "#050404" },
    r2: { himmel: ["#03050b", "#0a1020", "#17253d"], glut: "rgba(110,150,215,0.22)", boden: ["#0a1018", "#020406"], fern: "#060a12", nah: "#020304" },
    morgen: { himmel: ["#2b3a68", "#8a6a90", "#f2a87a", "#ffdca2"], glut: "rgba(255,212,150,0.55)", boden: ["#2a2a32", "#101016"], fern: "#3a3448", nah: "#16131b" }
  };
  function huegel(g, w, y, r, hoch, farbe) {
    g.fillStyle = farbe;
    g.beginPath();
    g.moveTo(0, y + 40);
    let x = 0, h = y - hoch * r();
    g.lineTo(0, h);
    while (x < w + 40) {
      const nx = x + 30 + r() * 50, nh = y - hoch * (0.3 + r() * 0.7);
      g.quadraticCurveTo(x + (nx - x) / 2, Math.min(h, nh) - hoch * 0.3, nx, nh);
      x = nx; h = nh;
    }
    g.lineTo(w + 40, y + 40);
    g.closePath();
    g.fill();
  }
  function baumreihe(g, w, y, r, hoch, farbe) {
    g.fillStyle = farbe;
    for (let x = -10; x < w + 20; x += 6 + r() * 10) {
      const h = hoch * (0.5 + r() * 0.6), b = 8 + r() * 14;
      g.beginPath();
      g.moveTo(x - b / 2, y + 2);
      g.quadraticCurveTo(x - b * 0.4, y - h * 0.7, x, y - h);
      g.quadraticCurveTo(x + b * 0.4, y - h * 0.7, x + b / 2, y + 2);
      g.fill();
    }
  }
  function bohlenweg(g, w, h, hor, breite, farbe) {
    const vx = w * 0.5;
    g.fillStyle = farbe;
    g.beginPath();
    g.moveTo(vx - 2, hor + 6);
    g.lineTo(vx + 2, hor + 6);
    g.lineTo(vx + breite / 2, h);
    g.lineTo(vx - breite / 2, h);
    g.fill();
    g.strokeStyle = "rgba(0,0,0,0.45)";
    for (let i = 1; i < 26; i++) {
      const f = Math.pow(i / 26, 1.8), y = hor + 6 + (h - hor - 6) * f, b = 2 + (breite / 2 - 2) * f;
      g.lineWidth = 0.5 + f * 2.5;
      g.beginPath(); g.moveTo(vx - b, y); g.lineTo(vx + b, y); g.stroke();
    }
  }
  function birke(g, x, basis, hoehe, breite, r) {
    const gr = g.createLinearGradient(x - breite, 0, x + breite, 0);
    gr.addColorStop(0, "#8f958f"); gr.addColorStop(0.45, "#d9ddd5"); gr.addColorStop(1, "#7d827c");
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(x - breite / 2, basis);
    g.lineTo(x - breite * 0.18, basis - hoehe);
    g.lineTo(x + breite * 0.18, basis - hoehe);
    g.lineTo(x + breite / 2, basis);
    g.fill();
    g.fillStyle = "#1a1c1c";
    for (let y = basis - 6; y > basis - hoehe + 10; y -= 6 + r() * 14) {
      const b = breite * (0.25 + 0.75 * (y - (basis - hoehe)) / hoehe);
      g.fillRect(x - b / 2 + r() * b * 0.4, y, b * (0.3 + r() * 0.5), 1.5 + r() * 2);
    }
    g.strokeStyle = "rgba(20,24,26,0.8)";
    g.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      const y = basis - hoehe * (0.55 + r() * 0.4), s = r() < 0.5 ? -1 : 1;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + s * 14, y - 10, x + s * (20 + r() * 20), y - 4 + r() * 10); g.stroke();
    }
  }
  function schilf(g, x, basis, n, hoch, r, farbe) {
    g.strokeStyle = farbe;
    for (let i = 0; i < n; i++) {
      const xx = x + (r() - 0.5) * 60, h = hoch * (0.5 + r() * 0.6), neig = (r() - 0.5) * 24;
      g.lineWidth = 1 + r() * 1.5;
      g.beginPath(); g.moveTo(xx, basis); g.quadraticCurveTo(xx + neig * 0.3, basis - h * 0.6, xx + neig, basis - h); g.stroke();
      if (r() < 0.3) { g.fillStyle = farbe; g.fillRect(xx + neig - 2, basis - h - 10, 4, 12); }
    }
  }
  function haus(g, x, basis, bw, bh, r, P) {
    g.fillStyle = P.nah;
    g.fillRect(x, basis - bh, bw, bh);
    g.beginPath(); g.moveTo(x - 4, basis - bh); g.lineTo(x + bw / 2, basis - bh - bw * 0.45); g.lineTo(x + bw + 4, basis - bh); g.fill();
    const fenster = 1 + Math.floor(r() * 3);
    for (let i = 0; i < fenster; i++) {
      const fx = x + 6 + (i + 0.5) * ((bw - 12) / fenster) - 4, fy = basis - bh * 0.62;
      const gr = g.createRadialGradient(fx + 4, fy + 4, 0, fx + 4, fy + 4, 26);
      gr.addColorStop(0, "rgba(255,190,100,0.35)"); gr.addColorStop(1, "rgba(255,190,100,0)");
      g.fillStyle = gr; g.fillRect(fx - 22, fy - 22, 52, 52);
      g.fillStyle = r() < 0.85 ? "#ffcf7a" : "#3a2a20";
      g.fillRect(fx, fy, 8, 9);
      g.fillStyle = P.nah;
    }
  }
  function turm(g, x, basis, hoch, farbe, licht) {
    g.fillStyle = farbe;
    g.beginPath(); g.moveTo(x - hoch * 0.09, basis); g.lineTo(x - hoch * 0.05, basis - hoch); g.lineTo(x + hoch * 0.05, basis - hoch); g.lineTo(x + hoch * 0.09, basis); g.fill();
    g.fillRect(x - hoch * 0.075, basis - hoch - hoch * 0.12, hoch * 0.15, hoch * 0.12);
    g.beginPath(); g.moveTo(x - hoch * 0.09, basis - hoch * 1.12); g.lineTo(x, basis - hoch * 1.24); g.lineTo(x + hoch * 0.09, basis - hoch * 1.12); g.fill();
    if (licht) {
      const y = basis - hoch * 1.06, gr = g.createRadialGradient(x, y, 0, x, y, hoch * 0.9);
      gr.addColorStop(0, "rgba(255,226,150,0.95)"); gr.addColorStop(0.15, "rgba(255,190,90,0.55)"); gr.addColorStop(1, "rgba(255,170,80,0)");
      g.fillStyle = gr; g.fillRect(x - hoch, y - hoch, hoch * 2, hoch * 2);
    }
  }
  const LANDSCHAFT = {
    dorf(g, w, h, hor, r, P) {
      huegel(g, w, hor + 4, r, 26, P.fern);
      baumreihe(g, w, hor + 12, r, 30, "#1c1622");
      let x = -20;
      while (x < w + 40) { const bw = 38 + r() * 46, bh = 24 + r() * 22; haus(g, x, hor + 26, bw, bh, r, P); x += bw + 8 + r() * 30; }
      g.fillStyle = P.nah;
      const kx = w * 0.68;
      g.fillRect(kx - 9, hor - 40, 18, 66);
      g.beginPath(); g.moveTo(kx - 11, hor - 40); g.lineTo(kx, hor - 84); g.lineTo(kx + 11, hor - 40); g.fill();
      const gr = g.createLinearGradient(0, hor + 26, 0, h);
      gr.addColorStop(0, P.boden[0]); gr.addColorStop(1, P.boden[1]);
      g.fillStyle = gr; g.fillRect(0, hor + 24, w, h - hor);
      g.strokeStyle = "#060505"; g.lineWidth = 3;
      for (let i = 0; i < w; i += 22) { g.beginPath(); g.moveTo(i, h * 0.86); g.lineTo(i + 2, h * 0.78); g.stroke(); }
      g.beginPath(); g.moveTo(0, h * 0.8); g.lineTo(w, h * 0.81); g.moveTo(0, h * 0.84); g.lineTo(w, h * 0.845); g.stroke();
    },
    r0(g, w, h, hor, r, P) {
      baumreihe(g, w, hor + 2, r, 34, P.fern);
      const gr = g.createLinearGradient(0, hor, 0, h);
      gr.addColorStop(0, P.boden[0]); gr.addColorStop(1, P.boden[1]);
      g.fillStyle = gr; g.fillRect(0, hor, w, h - hor);
      g.fillStyle = "rgba(40,60,90,0.45)";
      for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(r() * w, hor + 20 + r() * (h - hor) * 0.6, 30 + r() * 70, 5 + r() * 9, 0, 0, 6.283); g.fill(); }
      bohlenweg(g, w, h, hor, w * 0.42, "#2a2219");
      const birken = [];
      for (let i = 0; i < 11; i++) {
        let x = r() * w;
        if (Math.abs(x - w / 2) < w * 0.16) x += (x < w / 2 ? -1 : 1) * w * 0.18;
        const tiefe = r();
        birken.push({ x, basis: hor + 6 + tiefe * (h - hor) * 0.75, hoehe: h * (0.35 + tiefe * 0.5), breite: 4 + tiefe * 14 });
      }
      birken.sort((a, b) => a.basis - b.basis).forEach((b) => birke(g, b.x, b.basis, b.hoehe, b.breite, r));
      schilf(g, w * 0.08, h, 22, h * 0.14, r, "#05080a");
      schilf(g, w * 0.92, h, 22, h * 0.14, r, "#05080a");
    },
    r1(g, w, h, hor, r, P) {
      huegel(g, w, hor + 3, r, 10, P.fern);
      const gr = g.createLinearGradient(0, hor, 0, h);
      gr.addColorStop(0, P.boden[0]); gr.addColorStop(1, P.boden[1]);
      g.fillStyle = gr; g.fillRect(0, hor, w, h - hor);
      for (let i = 1; i < 9; i++) {
        const f = Math.pow(i / 9, 1.6), y = hor + (h - hor) * f;
        g.fillStyle = "rgba(4,4,6,0.85)"; g.fillRect(0, y, w, 2 + f * 16);
        g.fillStyle = "rgba(70,80,100,0.18)"; g.fillRect(0, y + 1, w, 1 + f * 3);
      }
      g.fillStyle = "#0b0907";
      for (let i = 0; i < 9; i++) {
        const x = r() * w, y = hor + 14 + r() * (h - hor) * 0.5, s = 0.5 + (y - hor) / (h - hor) * 2;
        if (Math.abs(x - w / 2) < w * 0.15) continue;
        for (let k = 0; k < 4; k++) g.fillRect(x + (k % 2) * 9 * s, y - Math.floor(k / 2) * 6 * s, 8 * s, 5 * s);
      }
      g.strokeStyle = "#0a0a0c"; g.lineWidth = 3;
      const kx = w * 0.8, ky = hor + 8;
      g.beginPath(); g.moveTo(kx - 18, ky); g.lineTo(kx, ky - 90); g.lineTo(kx + 18, ky); g.moveTo(kx, ky - 86); g.lineTo(kx - 70, ky - 60); g.lineTo(kx - 66, ky - 40); g.stroke();
      g.fillStyle = "#0a0a0c"; g.fillRect(kx - 24, ky - 6, 48, 8);
      g.fillRect(w * 0.12, hor + 30, 30, 14); g.beginPath(); g.arc(w * 0.12 + 7, hor + 45, 4, 0, 6.283); g.arc(w * 0.12 + 23, hor + 45, 4, 0, 6.283); g.fill();
      bohlenweg(g, w, h, hor, w * 0.4, "#2a2117");
      schilf(g, w * 0.05, h, 16, h * 0.12, r, "#050404");
      schilf(g, w * 0.95, h, 16, h * 0.12, r, "#050404");
    },
    r2(g, w, h, hor, r, P, morgen) {
      const gr = g.createLinearGradient(0, hor, 0, h);
      gr.addColorStop(0, morgen ? "#d99a7e" : "#101c30"); gr.addColorStop(0.5, morgen ? "#5a4a62" : "#060b14"); gr.addColorStop(1, P.boden[1]);
      g.fillStyle = gr; g.fillRect(0, hor, w, h - hor);
      g.strokeStyle = morgen ? "rgba(255,220,180,0.25)" : "rgba(120,150,200,0.12)";
      for (let i = 0; i < 40; i++) { const y = hor + 4 + Math.pow(r(), 1.5) * (h - hor) * 0.7, x = r() * w, l = 10 + r() * 50; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
      huegel(g, w, hor + 2, r, 6, P.fern);
      turm(g, w * 0.62, hor + 3, h * 0.16, P.fern, morgen);
      g.fillStyle = morgen ? "#2a2430" : "#030407";
      g.beginPath(); g.moveTo(w * 0.3, h); g.lineTo(w * 0.47, hor + (h - hor) * 0.55); g.lineTo(w * 0.53, hor + (h - hor) * 0.55); g.lineTo(w * 0.7, h); g.fill();
      bohlenweg(g, w, h, hor + (h - hor) * 0.55, w * 0.34, morgen ? "#4a3a33" : "#1f1a16");
      schilf(g, w * 0.1, h, 30, h * 0.2, r, P.nah);
      schilf(g, w * 0.9, h, 30, h * 0.2, r, P.nah);
    },
    morgen(g, w, h, hor, r, P) { LANDSCHAFT.r2(g, w, h, hor, r, P, true); }
  };
  function hintergrund(art) {
    if (Z.art === art) return;
    Z.art = art;
    const w = Z.w, h = Z.h, hor = Math.round(h * 0.5);
    const mache = () => {
      const c = document.createElement("canvas");
      c.width = cv.width; c.height = cv.height;
      const g = c.getContext("2d");
      g.setTransform(Z.dpr, 0, 0, Z.dpr, 0, 0);
      return [c, g];
    };
    const [hc, hg] = mache(), [lc, lg] = mache();
    const P = PALETTEN[art];
    let gr = hg.createLinearGradient(0, 0, 0, hor + 4);
    P.himmel.forEach((f, i) => gr.addColorStop(i / (P.himmel.length - 1), f));
    hg.fillStyle = gr; hg.fillRect(0, 0, w, hor + 4);
    gr = hg.createRadialGradient(w * 0.5, hor, 0, w * 0.5, hor, w * 0.9);
    gr.addColorStop(0, P.glut); gr.addColorStop(1, "rgba(0,0,0,0)");
    hg.fillStyle = gr; hg.fillRect(0, 0, w, hor + 4);
    LANDSCHAFT[art](lg, w, h, hor, prng(art.length * 977 + art.charCodeAt(0)), P);
    Z.himmel = hc; Z.land = lc;
  }

  function szene(modus, art) {
    Z.modus = modus;
    hintergrund(art);
    Z.laterne = modus === "station";
    if (modus === "dorf") { Z.dunkelZiel = 0.08; Z.kaeferHell = 0.7; Z.sternHell = 0.6; Z.nebelZiel = 0; K.stimmung && K.ac && K.stimmung("dorf"); }
    else if (modus === "moor") { Z.dunkelZiel = 0.5; Z.kaeferHell = 1; Z.sternHell = 1; Z.nebelZiel = 0.35; Z.kaelteZiel = 0; K.ac && K.stimmung("moor"); }
    else if (modus === "station") { Z.dunkelZiel = 0.9; Z.kaeferHell = 0.7; Z.sternHell = 1; K.ac && K.stimmung("station"); }
    else if (modus === "morgen") { Z.dunkelZiel = 0; Z.kaeferHell = 0.3; Z.sternHell = 0.2; Z.nebelZiel = 0.2; Z.kaelteZiel = 0; }
  }
  function laternenPosition() {
    const ort = $("#laternenOrt");
    if (!ort) { Z.lx = Z.w / 2; Z.ly = Z.h * 0.55; return; }
    const r = ort.getBoundingClientRect();
    Z.lx = r.left + r.width / 2;
    Z.ly = r.top + r.height * 0.56;
  }

  function fliegen(id, von, nach, dauer, fertig) {
    const a = ARTEN[id];
    Z.flieger.push({
      farbe: a.farbe, irr: !!a.irr, x0: von.x, y0: von.y, x1: nach.x, y1: nach.y,
      mx: (von.x + nach.x) / 2 + (Math.random() - 0.5) * 140, my: Math.min(von.y, nach.y) - 60 - Math.random() * 70,
      t0: performance.now(), d: Math.max(30, dauer), fertig, spur: []
    });
  }
  function funkenRegen(x, y, farbe, n, kraft, schwer) {
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 6.283, v = kraft * (0.25 + Math.random());
      Z.partikel.push({ x, y, vx: Math.cos(w) * v, vy: Math.sin(w) * v - kraft * 0.25, l: 0, max: 0.45 + Math.random() * 0.75, farbe, g: schwer ? 520 : 30, s: 5 + Math.random() * 11 });
    }
  }
  const mischen = (a, b, t) => a + (b - a) * t;
  function flammenFarbe(k) { return `${Math.round(mischen(255, 160, k))},${Math.round(mischen(196, 212, k))},${Math.round(mischen(92, 255, k))}`; }

  function laterneMalen(zeit) {
    const x = Z.lx, y = Z.ly, s = Math.min(Z.w, Z.h) * 0.07 + 8, fl = Math.max(0, Z.flamme), kalt = Math.min(1, Z.kaelte);
    const flacker = 1 + Math.sin(zeit * 23) * 0.04 * (0.5 + kalt * 2) + (Math.random() - 0.5) * 0.1 * kalt * kalt;
    const farbe = flammenFarbe(kalt);
    if (fl > 0.02) {
      cx.globalCompositeOperation = "lighter";
      const r = s * (2 + Math.min(1.6, Z.licht) * 1.8) * flacker, gr = cx.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${farbe},${Math.min(0.6, 0.42 * fl)})`); gr.addColorStop(1, `rgba(${farbe},0)`);
      cx.fillStyle = gr; cx.fillRect(x - r, y - r, r * 2, r * 2);
      cx.globalCompositeOperation = "source-over";
    }
    cx.strokeStyle = "#3a322b"; cx.lineWidth = s * 0.09;
    cx.beginPath(); cx.arc(x, y - s * 0.95, s * 0.36, Math.PI, 0); cx.stroke();
    cx.fillStyle = "#43372d";
    cx.beginPath(); cx.moveTo(x - s * 0.52, y - s * 0.7); cx.lineTo(x + s * 0.52, y - s * 0.7); cx.lineTo(x + s * 0.3, y - s * 0.96); cx.lineTo(x - s * 0.3, y - s * 0.96); cx.fill();
    const gg = cx.createLinearGradient(x - s * 0.45, 0, x + s * 0.45, 0), a = Math.min(1, fl);
    gg.addColorStop(0, `rgba(255,228,170,${0.08 + 0.22 * a})`); gg.addColorStop(0.5, `rgba(255,240,205,${0.15 + 0.4 * a})`); gg.addColorStop(1, `rgba(255,228,170,${0.08 + 0.22 * a})`);
    cx.fillStyle = gg;
    cx.fillRect(x - s * 0.42, y - s * 0.7, s * 0.84, s * 1.28);
    if (kalt > 0.05) { cx.fillStyle = `rgba(205,230,255,${kalt * 0.4})`; cx.fillRect(x - s * 0.42, y - s * 0.7, s * 0.84, s * 1.28); }
    if (fl > 0.02) {
      const fh = s * (0.4 + 0.32 * Math.min(1.6, Z.licht)) * Math.min(1.5, fl) * flacker, fx = x + Math.sin(zeit * 7) * s * 0.03, fy = y + s * 0.42;
      const fg = cx.createRadialGradient(fx, fy - fh * 0.35, 0, fx, fy - fh * 0.35, fh * 0.8);
      fg.addColorStop(0, "rgba(255,255,240,1)"); fg.addColorStop(0.45, `rgba(${farbe},0.95)`); fg.addColorStop(1, `rgba(${farbe},0)`);
      cx.fillStyle = fg;
      cx.beginPath();
      cx.moveTo(fx, fy - fh);
      cx.quadraticCurveTo(fx + s * 0.26, fy - fh * 0.35, fx, fy);
      cx.quadraticCurveTo(fx - s * 0.26, fy - fh * 0.35, fx, fy - fh);
      cx.fill();
    }
    cx.strokeStyle = "#3a322b"; cx.lineWidth = s * 0.07;
    cx.beginPath();
    for (const dx of [-0.42, 0, 0.42]) { cx.moveTo(x + dx * s, y - s * 0.7); cx.lineTo(x + dx * s, y + s * 0.58); }
    cx.stroke();
    cx.fillStyle = "#43372d"; cx.fillRect(x - s * 0.52, y + s * 0.56, s * 1.04, s * 0.18);
  }

  function zeichnen(zeit, dt) {
    const w = Z.w, h = Z.h;
    cx.setTransform(Z.dpr, 0, 0, Z.dpr, 0, 0);
    const wx = (Math.random() - 0.5) * Z.wackeln, wy = (Math.random() - 0.5) * Z.wackeln;
    cx.clearRect(0, 0, w, h);
    cx.save();
    cx.translate(wx, wy);
    if (Z.himmel) cx.drawImage(Z.himmel, -8, -8, w + 16, h + 16);
    for (const s of Z.sterne) {
      const a = (0.4 + 0.35 * Math.sin(zeit * 1.3 + s.p)) * Z.sternHell;
      cx.fillStyle = `rgba(230,236,255,${a})`;
      cx.fillRect(s.x * w, s.y * h, s.g, s.g);
    }
    const mx = w * 0.8, my = h * 0.1, mr = Math.min(w, h) * 0.045 + 6;
    cx.globalCompositeOperation = "lighter";
    const mg = cx.createRadialGradient(mx, my, 0, mx, my, mr * 4);
    mg.addColorStop(0, `rgba(220,225,255,${0.12 + 0.18 * Z.mond})`); mg.addColorStop(1, "rgba(220,225,255,0)");
    cx.fillStyle = mg; cx.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
    cx.globalCompositeOperation = "source-over";
    cx.drawImage(mondBild(Z.mond), mx - mr * 1.33, my - mr * 1.33, mr * 2.66, mr * 2.66);
    if (Z.land) cx.drawImage(Z.land, -8, -8, w + 16, h + 16);

    if (Z.nebel > 0.01) {
      cx.globalAlpha = Math.min(1, Z.nebel);
      const y0 = h * (0.5 - 0.1 * (1 - Math.min(1, Z.nebel)));
      for (let i = 0; i < 16; i++) {
        const x = ((i / 16) * (w + 300) + zeit * (6 + (i % 4) * 5)) % (w + 300) - 150;
        const yy = y0 + Math.sin(i * 1.7 + zeit * 0.3) * h * 0.03 + (i % 3) * h * 0.04;
        const s = 190 + (i % 5) * 45;
        cx.drawImage(nebelBild, x - s / 2, yy - s / 3, s, s * 0.6);
      }
      cx.globalAlpha = 1;
    }

    if (Z.dunkel > 0.01) {
      const m = Z.mk;
      m.setTransform(Z.dpr, 0, 0, Z.dpr, 0, 0);
      m.globalCompositeOperation = "source-over";
      m.clearRect(0, 0, w, h);
      m.fillStyle = `rgba(2,4,10,${Math.min(0.98, Z.dunkel)})`;
      m.fillRect(0, 0, w, h);
      if (Z.laterne && Z.flamme > 0.02) {
        const rad = Math.min(w, h) * (0.12 + 0.5 * Math.min(1.5, Z.licht)) * (0.55 + 0.45 * Math.min(1, Z.flamme));
        m.globalCompositeOperation = "destination-out";
        const gr = m.createRadialGradient(Z.lx, Z.ly, rad * 0.08, Z.lx, Z.ly, rad);
        gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(0.55, "rgba(0,0,0,0.78)"); gr.addColorStop(1, "rgba(0,0,0,0)");
        m.fillStyle = gr;
        m.fillRect(Z.lx - rad, Z.ly - rad, rad * 2, rad * 2);
      }
      cx.drawImage(Z.maske, 0, 0, w, h);
    }

    cx.globalCompositeOperation = "lighter";
    for (const k of Z.kaefer) {
      k.vx += (Math.random() - 0.5) * 0.03 * dt; k.vy += (Math.random() - 0.5) * 0.02 * dt;
      k.vx *= 0.995; k.vy *= 0.995;
      k.x += k.vx * dt; k.y += k.vy * dt;
      if (k.x < -0.05) k.x = 1.05; if (k.x > 1.05) k.x = -0.05;
      if (k.y < 0.5) k.vy += 0.02 * dt; if (k.y > 0.97) k.vy -= 0.02 * dt;
      k.p += dt; if (k.p > k.per) k.p -= k.per;
      const b = k.p < 0.6 ? Math.sin((k.p / 0.6) * Math.PI) : 0;
      if (b > 0.02) {
        const s = 10 + 16 * b;
        cx.globalAlpha = b * Z.kaeferHell;
        cx.drawImage(glut(k.f), k.x * w - s / 2, k.y * h - s / 2 - b * 6, s, s);
      }
    }
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";

    if (Z.laterne) laterneMalen(zeit);

    cx.globalCompositeOperation = "lighter";
    const jetzt = performance.now();
    for (let i = Z.flieger.length - 1; i >= 0; i--) {
      const f = Z.flieger[i], t = Math.min(1, (jetzt - f.t0) / f.d), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      let x = (1 - e) * (1 - e) * f.x0 + 2 * (1 - e) * e * f.mx + e * e * f.x1;
      const y = (1 - e) * (1 - e) * f.y0 + 2 * (1 - e) * e * f.my + e * e * f.y1;
      if (f.irr) x += Math.sin(t * 20) * 12 * (1 - t);
      f.spur.push([x, y]);
      if (f.spur.length > 16) f.spur.shift();
      f.spur.forEach((p, j) => { const s = 5 + j * 1.5; cx.globalAlpha = (j / f.spur.length) * 0.55; cx.drawImage(glut(f.farbe), p[0] - s / 2, p[1] - s / 2, s, s); });
      cx.globalAlpha = 1;
      const s = f.irr ? 40 : 34;
      cx.drawImage(glut(f.farbe), x - s / 2, y - s / 2, s, s);
      if (t >= 1) { Z.flieger.splice(i, 1); if (f.fertig) f.fertig(); }
    }
    for (let i = Z.partikel.length - 1; i >= 0; i--) {
      const p = Z.partikel[i];
      p.l += dt;
      if (p.l >= p.max) { Z.partikel.splice(i, 1); continue; }
      p.vy += p.g * dt; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const a = 1 - p.l / p.max, s = p.s * (0.5 + a * 0.5);
      cx.globalAlpha = a;
      cx.drawImage(glut(p.farbe), p.x - s / 2, p.y - s / 2, s, s);
    }
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";

    const frost = Math.pow(Math.min(1, Z.kaelte), 1.6);
    if (Z.laterne && frost > 0.02) {
      const gr = cx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.max(w, h) * 0.75);
      gr.addColorStop(0, "rgba(180,215,255,0)"); gr.addColorStop(1, `rgba(195,228,255,${0.42 * frost})`);
      cx.fillStyle = gr; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = `rgba(228,242,255,${0.6 * frost})`;
      cx.lineWidth = 1;
      cx.beginPath();
      for (const k of Z.kristalle) { if (k.s > frost * 1.1) continue; cx.moveTo(k.x1, k.y1); cx.lineTo(k.x2, k.y2); }
      cx.stroke();
    }
    cx.restore();
  }

  let letzteZeit = performance.now();
  function schleife(jetzt) {
    const dt = Math.min(0.05, (jetzt - letzteZeit) / 1000);
    letzteZeit = jetzt;
    const halt = jetzt < Z.stopBis;
    const d = halt ? 0 : dt;
    const n = (wert, ziel, rate) => wert + (ziel - wert) * Math.min(1, d * rate);
    Z.licht = n(Z.licht, Z.lichtZiel, 5);
    Z.kaelte = n(Z.kaelte, Z.kaelteZiel, 6);
    Z.nebel = n(Z.nebel, Z.nebelZiel, 1.6);
    Z.dunkel = n(Z.dunkel, Z.dunkelZiel, 2.5);
    Z.flamme = n(Z.flamme, Z.flammeZiel, 4);
    Z.wackeln = Math.max(0, Z.wackeln - d * (Z.wackeln * 5 + 2));
    zeichnen(jetzt / 1000, d);
    requestAnimationFrame(schleife);
  }

  /* ================= Kopfzeile ================= */
  function kopfZeichnen(glanzAnzeige) {
    const r = S.run;
    if (S.ansicht === "lauf" && r) {
      const glanz = glanzAnzeige === undefined ? r.glanz : glanzAnzeige;
      kopf.innerHTML = `
        <div class="docht ${r.docht <= 2 ? "wenig" : ""}" aria-label="Docht ${r.docht} von ${r.dochtMax}">${flammen(r.docht, r.dochtMax)}</div>
        <div class="glanz" id="glanzAnzeige" aria-label="Glanz">✦ <b>${glanz}</b></div>
        <div class="ort">${esc(REGIONEN[r.region].name)}</div>
        <button class="ikon" data-aktion="glas" aria-label="Glas ansehen">${ICON.glas}</button>
        <button class="ikon" data-aktion="ton" aria-label="${K.an ? "Ton aus" : "Ton an"}">${K.an ? ICON.ton : ICON.stumm}</button>
        <button class="ikon" data-aktion="menue" aria-label="Menü">${ICON.menue}</button>`;
    } else {
      kopf.innerHTML = `
        <div class="ort marke">${S.ansicht === "intro" ? "" : "Moorlicht"}</div>
        <button class="ikon" data-aktion="regeln" aria-label="Regeln">${ICON.hilfe}</button>
        <button class="ikon" data-aktion="ton" aria-label="${K.an ? "Ton aus" : "Ton an"}">${K.an ? ICON.ton : ICON.stumm}</button>`;
    }
  }
  function glanzSetzen(wert) {
    const g = $("#glanzAnzeige");
    if (!g) return;
    g.querySelector("b").textContent = wert;
    g.classList.remove("puls"); void g.offsetWidth; g.classList.add("puls");
  }

  /* ================= Bildschirme ================= */
  function zeigen() {
    if (S.ansicht === "intro") return introZeigen();
    if (S.ansicht !== "lauf" || !S.run) { S.ansicht = "dorf"; return dorfZeigen(); }
    kopfZeichnen();
    const r = S.run;
    Z.mond = [0.08, 0.25, 0.5, 0.72, 0.88, 1][r.mondphase];
    if (r.phase !== "station" && r.phase !== "ende") szene("moor", "r" + r.region);
    if (r.phase !== "karte" && r.phase !== "station" && r.phase !== "ende") Z.dunkelZiel = 0.72;
    if (r.phase !== "karte") S.auswahl = null;
    switch (r.phase) {
      case "karte": karteZeigen(); break;
      case "station": stationZeigen(); break;
      case "fang": fangZeigen(); break;
      case "beute": beuteZeigen(); break;
      case "rast": rastZeigen(); break;
      case "haendler": haendlerZeigen(); break;
      case "fund": fundZeigen(); break;
      case "ende": endeZeigen(); break;
    }
    if (r.phase === "karte" && S.region !== r.region) { S.region = r.region; regionEinblenden(r.region); }
  }

  function introZeigen() {
    kopfZeichnen();
    szene("dorf", "dorf");
    Z.mond = 0.08;
    bild.innerHTML = `<section class="seite intro">
      ${TEXTE.intro.map((z, i) => `<p style="animation-delay:${ms(300 + i * 1500)}ms">${esc(z)}</p>`).join("")}
      <button class="gross primaer" data-aktion="introFertig" style="animation-delay:${ms(300 + TEXTE.intro.length * 1500)}ms">Die Laterne nehmen</button>
    </section>`;
  }

  function heute() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function dorfZeigen() {
    kopfZeichnen();
    szene("dorf", "dorf");
    const m = S.meta, frei = M.laternenFrei(m), offen = M.gespraeche(m);
    Z.mond = [0.08, 0.25, 0.5, 0.72, 0.88, 1][S.mond];
    const best = m.taeglich[heute()];
    const gesehen = m.gesehen.arten.filter((a) => !ARTEN[a].irr).length;
    bild.innerHTML = `<section class="seite dorf">
      <div class="dorf-titel"><h1>Moorlicht</h1><p>Fennhusen · ${m.siege ? `Jahr ${m.siege + 1} · ` : ""}Johannisnacht Nr. ${m.laeufe + 1}</p></div>
      ${S.run ? `<button class="gross primaer" data-aktion="fortsetzen" id="fortsetzen">Nacht fortsetzen<small>${esc(REGIONEN[S.run.region].name)} · ${S.run.docht} Docht · ${S.run.glanz} Glanz</small></button>` : ""}
      <button class="gross ${S.run ? "" : "primaer"}" id="start" data-aktion="start">${S.run ? "Neue Nacht beginnen" : "In die Nacht"}<small>${esc(LATERNEN[S.laterne].name)} · ${esc(MONDPHASEN[S.mond].name)}</small></button>
      <div class="wahl-zeile" role="group" aria-label="Laterne">${Object.keys(LATERNEN).map((id) => {
        const f = FREISCHALTUNGEN.find((x) => x.id === id);
        return `<button class="opt ${S.laterne === id ? "an" : ""}" data-aktion="laterne" data-id="${id}" ${frei.indexOf(id) >= 0 ? "" : "disabled"}>${esc(LATERNEN[id].name)}${frei.indexOf(id) >= 0 ? "" : `<small>${f.preis} Erinnerungen</small>`}</button>`;
      }).join("")}</div>
      <p class="leise">${esc(LATERNEN[S.laterne].text)}</p>
      ${m.mondphaseFrei > 0 ? `<div class="wahl-zeile" role="group" aria-label="Mondphase">${MONDPHASEN.slice(0, m.mondphaseFrei + 1).map((p, i) =>
        `<button class="opt ${S.mond === i ? "an" : ""}" data-aktion="mond" data-i="${i}">${i === 0 ? "☾" : i}<small>${esc(p.name)}</small></button>`).join("")}</div>
      <p class="leise">${S.mond ? "Härter: " + MONDPHASEN.slice(1, S.mond + 1).map((p) => p.regel).join(" ") : "Mondphasen machen jede weitere Nacht härter, mit mehr Erinnerungen als Lohn."}</p>` : ""}
      <button class="mittel" data-aktion="taeglich" id="taeglich">Nacht des Tages<small>${best ? `heute bisher ${best} Schritte weit` : "ein festes Moor für heute, Sturmlaterne, Neumond"}</small></button>
      <h3>Im Krug „Zur Moorlilie“</h3>
      <div class="figuren">${Object.keys(FIGUREN).map((id) => {
        const g = offen.find((x) => x.wer === id);
        return `<button class="figur ${g ? "neu" : ""}" data-aktion="figur" data-id="${id}"><b>${esc(FIGUREN[id].name)}</b><span>${g ? "hat dir etwas zu erzählen" : esc(FIGUREN[id].rolle)}</span></button>`;
      }).join("")}</div>
      <div class="knopf-zeile">
        <button class="mittel" data-aktion="erinnerungen">Erinnerungen<small>${m.erinnerungen} übrig</small></button>
        <button class="mittel" data-aktion="buch">Naturkunde<small>${gesehen} von ${Object.keys(ARTEN).filter((a) => !ARTEN[a].irr).length} Funken</small></button>
        <button class="mittel" data-aktion="notizen">Almas Notizen<small>${m.notizen.length} von ${NOTIZEN.length}</small></button>
      </div>
      <p class="statistik">${m.laeufe} Nächte · ${m.siege} Siege · am weitesten: ${esc(REGIONEN[m.weitesteRegion].name)}${m.wahresEnde ? " · Alma ist zu Hause" : ""}</p>
    </section>`;
  }

  function regionEinblenden(r) {
    const d = document.createElement("div");
    d.className = "region-titel";
    d.style.animationDuration = ms(2600) + "ms";
    d.innerHTML = `<small>Region ${r + 1} von 3</small><h2>${esc(REGIONEN[r].name)}</h2><p>${esc(REGIONEN[r].text)}</p>`;
    document.body.appendChild(d);
    K.spielen("region");
    setTimeout(() => d.remove(), ms(2600) + 100);
  }

  function knotenText(r, k) {
    if (k.typ === "waechter") {
      const w = WAECHTER[k.waechter];
      return `<b>${esc(w.name)}</b><p>Dunkel ${k.dunkel}. ${esc(w.regel)}</p><p class="leise">${esc(w.text)} Wächter musst du bestehen, jeder Fehlversuch kostet Docht.</p>`;
    }
    const t = TYP[k.typ];
    let s = `<b>${t.name}</b>`;
    if (k.typ === "pfad" || k.typ === "nebel") {
      s += `<p>Dunkel ${k.dunkel}${k.mod ? ` · ${esc(MODS[k.mod].name)}: ${esc(MODS[k.mod].regel)}` : ""}</p>`;
    }
    return s + `<p class="leise">${esc(t.text)}</p>`;
  }
  function karteZeigen() {
    const r = S.run, karte = r.karten[r.region], offen = M.offeneKnoten(r), n = karte.reihen.length;
    const istOffen = (z, i) => offen.some((o) => o.reihe === z && o.index === i);
    const y = (z) => 88 - z * (78 / (n - 1));
    let wege = "";
    if (r.pos.reihe < 0) karte.reihen[0].forEach((k) => { wege += `<line class="weg moeglich" x1="50" y1="99" x2="${k.x * 100}" y2="${y(0)}"/>`; });
    for (let z = 0; z < n - 1; z++) {
      karte.reihen[z].forEach((k, i) => k.nach.forEach((j) => {
        const b = karte.reihen[z + 1][j];
        const hier = r.pos.reihe === z && r.pos.index === i;
        const cls = hier ? "moeglich" : k.besucht && b.besucht ? "gegangen" : "";
        wege += `<line class="weg ${cls}" x1="${k.x * 100}" y1="${y(z)}" x2="${b.x * 100}" y2="${y(z + 1)}"/>`;
      }));
    }
    let knoten = "";
    karte.reihen.forEach((reihe, z) => reihe.forEach((k, i) => {
      const hier = r.pos.reihe === z && r.pos.index === i;
      const gew = S.auswahl && S.auswahl.reihe === z && S.auswahl.index === i;
      const label = k.typ === "pfad" || k.typ === "nebel" || k.typ === "waechter" ? `<small>${k.dunkel}</small>` : "";
      knoten += `<button class="knoten typ-${k.typ} ${istOffen(z, i) ? "offen" : ""} ${k.besucht ? "besucht" : ""} ${hier ? "hier" : ""} ${gew ? "gewaehlt" : ""}"
        style="left:${k.x * 100}%;top:${y(z)}%" data-aktion="knoten" data-r="${z}" data-i="${i}" aria-label="${TYP[k.typ].name}">${ICON[k.typ]}${label}</button>`;
    }));
    const gew = S.auswahl ? M.knotenAn(r, S.auswahl.reihe, S.auswahl.index) : null;
    const gehbar = S.auswahl && istOffen(S.auswahl.reihe, S.auswahl.index);
    const info = gew ? knotenText(r, gew) : `<b>Wohin?</b><p class="leise">Tippe einen Ort an. Die Zahl ist sein Dunkel. Leuchtende Orte kannst du jetzt erreichen.</p>`;
    bild.innerHTML = `<section class="seite karte-seite">
      <div class="region-kopf"><h2>${esc(REGIONEN[r.region].name)}</h2><p>Region ${r.region + 1} von 3 · Glas: ${r.glas.length} Funken · Kälte-Schwelle ${r.schwelle}</p></div>
      ${r.statistik.schritte === 0 && S.meta.laeufe === 0 ? tipp("karte", "Unten beginnt dein Weg, oben wartet der Wächter der Region. Wähle Orte mit Bedacht: Nebelbänke sind hart, aber lohnend; Lagerfeuer und Krämerin helfen dir vor dem Wächter.") : ""}
      <div class="kartenfeld"><svg class="wege" viewBox="0 0 100 100" preserveAspectRatio="none">${wege}</svg><span class="startpunkt"></span>${knoten}</div>
      <div class="panel knoten-info mitte-max">${info}
        <button class="gross ${gehbar ? "primaer" : ""}" id="hingehen" data-aktion="hingehen" ${gehbar ? "" : "disabled"}>${gehbar ? "Hingehen" : gew ? "Von hier aus nicht erreichbar" : "Ort wählen"}</button>
      </div>
    </section>`;
  }

  function stationZeigen() {
    const r = S.run, st = r.station;
    szene("station", "r" + r.region);
    const w = st.waechter ? WAECHTER[st.waechter] : null;
    const titel = w ? w.name : st.art === "nebel" ? "Nebelbank" : "Am Bohlenweg";
    const regel = w ? w.regel : st.mods.map((id) => `${MODS[id].name}: ${MODS[id].regel}`).join(" ");
    bild.innerHTML = `<section class="seite station" id="station">
      <div class="st-kopf">
        <h2>${esc(titel)}${st.versuch > 1 ? `<small>Versuch ${st.versuch}</small>` : ""}</h2>
        ${regel ? `<p class="st-regel">${esc(regel)}</p>` : ""}
        ${S.meta.laeufe === 0 && r.statistik.stationen < 2 ? tipp("station", "Jeder Funke bringt <b>Licht</b>, jedes Irrlicht <b>Kälte</b>. Steigt die Kälte über die Schwelle, erlischt die Laterne (−2 Docht). Reicht das Licht gegen das Dunkel, geh weiter: Überschuss wird Glanz.") : ""}
      </div>
      <div class="st-mitte" id="laternenOrt">
        <div class="dunkel-anzeige"><span>Dunkel</span><b id="dunkelWert">${st.dunkel}</b></div>
        <div class="licht-anzeige" id="lichtAnzeige"><b id="lichtWert">${st.licht}</b><span>Licht</span></div>
      </div>
      <div class="st-unten panel">
        <div class="kaelte">
          <div class="kaelte-kopf"><span>Kälte <b id="kaelteWert"></b></span><span id="risiko" class="risiko"></span></div>
          <div class="kaelte-leiste" id="kaelteLeiste"></div>
        </div>
        <div class="chips" id="gezogen"></div>
        <button class="glas-knopf" id="imGlas" data-aktion="glas"></button>
        <div class="blick" id="blick" hidden></div>
        <div class="kraut-zeile" id="kraeuter"></div>
        <div class="aktionen">
          <button class="gross primaer" id="ziehen" data-aktion="ziehen">Funken ziehen<small id="ziehenInfo"></small></button>
          <button class="gross" id="weiter" data-aktion="weiter">Weitergehen<small id="weiterInfo"></small></button>
        </div>
      </div>
      <div class="overlay-karte panel" id="ergebnis" hidden></div>
      <div class="overlay-karte panel" id="flackern" hidden></div>
    </section>`;
    laternenPosition();
    Z.flamme = Z.flammeZiel = st.status === "erloschen" ? 0 : 1;
    Z.nebel = Z.nebelZiel = st.status === "bestanden" ? 0 : 1;
    Z.dunkel = 0.75;
    Z.dunkelZiel = st.status === "erloschen" ? 0.96 : 0.9;
    stationAktualisieren();
    $("#gezogen").innerHTML = st.gezogen.length ? st.gezogen.slice(-24).map((id) => chip(id)).join("") : '<span class="leise">Noch nichts gezogen.</span>';
    if (st.status === "flackert") flackernZeigen();
    else if (st.status !== "offen") ergebnisZeigen();
  }

  function stationAktualisieren() {
    const r = S.run, st = r.station;
    if (!st || !$("#station")) return;
    const v = M.vorschau(r), g = M.gefahr(r), offen = st.status === "offen";
    Z.lichtZiel = st.licht / Math.max(1, st.dunkel);
    Z.kaelteZiel = Math.min(1.2, st.kaelte / Math.max(1, st.schwelle));
    if (offen || st.status === "flackert") Z.nebelZiel = Math.max(0.15, 1 - 0.75 * Math.min(1, Z.lichtZiel));
    const lw = $("#lichtWert"), dw = $("#dunkelWert");
    if (lw.textContent !== String(st.licht)) { lw.textContent = st.licht; lw.classList.remove("puls"); void lw.offsetWidth; lw.classList.add("puls"); }
    if (dw.textContent !== String(st.dunkel)) { dw.textContent = st.dunkel; dw.classList.remove("puls"); void dw.offsetWidth; dw.classList.add("puls"); }
    $("#lichtAnzeige").classList.toggle("genug", st.licht >= st.dunkel);
    $("#kaelteWert").textContent = `${st.kaelte} / ${st.schwelle}`;
    const leiste = $("#kaelteLeiste");
    let zellen = "";
    for (let i = 1; i <= st.schwelle; i++) zellen += `<i class="zelle ${st.kaelte >= i ? "voll" : ""}"></i>`;
    leiste.innerHTML = zellen + '<i class="zelle aus"></i>';
    leiste.classList.toggle("ueber", st.kaelte > st.schwelle);
    leiste.classList.toggle("knapp", st.kaelte <= st.schwelle && st.kaelte >= st.schwelle - 1 && st.kaelte > 0);
    const ri = $("#risiko");
    ri.textContent = offen ? (st.stapel.length ? `Risiko ${Math.round(g * 100)} %` : "Glas leer") : "";
    ri.className = "risiko " + (g >= 0.45 ? "hoch" : g >= 0.2 ? "mittel-r" : "");
    const rest = M.glasZaehlen(st.stapel);
    const hell = rest.filter((x) => !ARTEN[x.id].irr), irr = rest.filter((x) => ARTEN[x.id].irr);
    const nHell = hell.reduce((a, x) => a + x.anzahl, 0), nIrr = irr.reduce((a, x) => a + x.anzahl, 0);
    $("#imGlas").innerHTML = `<span>Im Glas: ${nHell} Funken, ${nIrr} Irrlichter · antippen für Details</span><span class="chips">${rest.map((x) => `<span class="rest">${chip(x.id)}<sub>${x.anzahl}</sub></span>`).join("") || '<span class="leise">leer</span>'}</span>`;
    const bl = M.blick(r);
    $("#blick").hidden = !bl.length;
    $("#blick").innerHTML = bl.length ? `Als Nächstes: ${bl.map((id) => chip(id)).join("")}` : "";
    $("#kraeuter").innerHTML = r.kraeuter.map((id, i) => `<button class="kraut" data-aktion="krautInfo" data-id="${id}" data-n="${i}" ${M.krautMoeglich(r, id) ? "" : "disabled"}>${esc(KRAEUTER[id].name)}</button>`).join("");
    const zb = $("#ziehen"), wb = $("#weiter");
    zb.disabled = !offen || !st.stapel.length;
    wb.disabled = !offen;
    $("#ziehenInfo").textContent = st.stapel.length ? `noch ${st.stapel.length} im Glas` : "Glas leer";
    const wi = $("#weiterInfo");
    if (v.bestanden) { wi.textContent = `bestanden · +${v.glanz} Glanz`; wi.className = ""; wb.classList.add("primaer"); zb.classList.remove("primaer"); }
    else { wi.textContent = `es fehlen ${v.fehlt} · −${v.schaden} Docht`; wi.className = v.schaden ? "warn" : ""; wb.classList.remove("primaer"); zb.classList.add("primaer"); }
  }

  function ziehen() {
    const r = S.run, st = r.station;
    if (!st || st.status !== "offen" || !st.stapel.length) return;
    const ev = M.ziehen(r);
    if (!ev) return;
    speichern();
    S.sperre = true;
    const von = mitteVon($("#imGlas"));
    stationTeilAktualisieren();
    K.spielen("zug");
    fliegen(ev.id, von, { x: Z.lx, y: Z.ly - 4 }, ms(ev.erloschen || ev.flackert ? 560 : 400), () => ankunft(ev));
  }
  function stationTeilAktualisieren() {
    const st = S.run.station, rest = M.glasZaehlen(st.stapel);
    const chips = $("#imGlas .chips");
    if (chips) chips.innerHTML = rest.map((x) => `<span class="rest">${chip(x.id)}<sub>${x.anzahl}</sub></span>`).join("") || '<span class="leise">leer</span>';
  }
  function ankunft(ev) {
    const r = S.run, st = r.station, a = ARTEN[ev.id];
    if (!st) { S.sperre = false; return; }
    const stufe = st.gezogen.length - 1;
    popup(a.name, "name", 1.6);
    if (a.irr) {
      if (ev.gefangen) { popup("gefangen!", "kalt"); K.spielen("irrlicht", { gefangen: true }); funkenRegen(Z.lx, Z.ly, "#c9a7ff", 12, 130); }
      else if (ev.mondstein) { popup("Mondstein!", "kalt"); K.spielen("irrlicht", { gefangen: true }); funkenRegen(Z.lx, Z.ly, "#e8eeff", 12, 130); }
      else {
        popup(`Kälte +${ev.kaelte}`, "kalt");
        K.spielen("irrlicht", { k: ev.kaelte });
        Z.wackeln = Math.max(Z.wackeln, 3 + ev.kaelte * 3);
        funkenRegen(Z.lx, Z.ly, a.farbe, 8 + ev.kaelte * 5, 150);
        Z.flamme = Math.max(0.35, Z.flamme - 0.2 * ev.kaelte);
      }
      if (ev.licht > 0) popup(`+${ev.licht} Licht`, "hell", 1);
      if (ev.dunkelPlus) popup(`Dunkel +${ev.dunkelPlus}`, "dunkel", 1);
    } else {
      if (ev.licht > 0) popup(`+${ev.licht} Licht${ev.verdoppelt ? " ×2!" : ""}`, "hell");
      else popup(a.verdoppelt ? "der nächste zählt doppelt" : "kein Licht", "leise");
      if (ev.waerme) popup(`Wärme −${ev.waerme}`, "warm", 1);
      if (ev.kaelte) popup(`Kälte +${ev.kaelte}`, "kalt", 1);
      K.spielen("funke", { stufe, id: ev.id, takt: ev.takt });
      funkenRegen(Z.lx, Z.ly - 6, a.farbe, 6 + ev.licht * 3, 90 + ev.licht * 25);
      Z.flamme = Math.min(1.7, Math.max(Z.flamme, 1) + 0.2 + ev.licht * 0.06);
      if (ev.licht >= 5 || ev.takt >= 3) { Z.wackeln = Math.max(Z.wackeln, 5); blitz("warm"); }
    }
    const gz = $("#gezogen");
    if (gz) {
      if (stufe === 0) gz.innerHTML = "";
      gz.insertAdjacentHTML("beforeend", chip(ev.id, "neu"));
      while (gz.children.length > 24) gz.removeChild(gz.firstChild);
    }
    stationAktualisieren();
    if (ev.erloschen) { erloschenSzene(); return; }
    if (ev.flackert) { K.spielen("flackern"); vibrieren(60); flackernZeigen(); S.sperre = false; return; }
    if (M.gefahr(r) >= 0.5) K.spielen("herz");
    later(() => { S.sperre = false; }, 40);
  }
  function erloschenSzene() {
    S.sperre = true;
    Z.stopBis = performance.now() + ms(150);
    later(() => {
      K.spielen("erloschen");
      Z.wackeln = 26;
      Z.flammeZiel = 0; Z.flamme = 0; Z.dunkelZiel = 0.96; Z.lichtZiel = 0.05; Z.nebelZiel = 1;
      funkenRegen(Z.lx, Z.ly, "#cfe6ff", 44, 280, true);
      funkenRegen(Z.lx, Z.ly, "#ffcf6e", 16, 200, true);
      blitz("kalt"); beben(); vibrieren([80, 40, 160]);
      kopfZeichnen();
      later(() => { ergebnisZeigen(); S.sperre = false; }, 800);
    }, 150);
  }
  function flackernZeigen() {
    const r = S.run, st = r.station, el = $("#flackern");
    if (!el) return;
    const knoepfe = ["johanniskraut", "wachs"].filter((id) => M.krautMoeglich(r, id))
      .map((id) => `<button class="gross primaer" data-aktion="kraut" data-id="${id}">${esc(KRAEUTER[id].name)} nutzen<small>${esc(KRAEUTER[id].regel)}</small></button>`).join("");
    el.innerHTML = `<h2>Die Laterne flackert!</h2><p>Kälte ${st.kaelte} liegt über der Schwelle ${st.schwelle}. Noch kannst du sie retten.</p>
      <div class="knopf-stapel">${knoepfe}<button class="gross" data-aktion="erloeschen" id="erloeschenKnopf">Erlöschen lassen<small>−${r.talismane.indexOf("feder") >= 0 ? 1 : 2} Docht, kein Glanz</small></button></div>`;
    el.hidden = false;
  }
  function weiter() {
    const r = S.run;
    if (!r.station || r.station.status !== "offen") return;
    const vorher = r.glanz;
    const v = M.weitergehen(r);
    if (!v) return;
    speichern();
    S.sperre = true;
    stationAktualisieren();
    if (v.bestanden) {
      const stark = !!r.station.waechter || r.station.art === "nebel";
      K.spielen("bestanden", { stark });
      Z.nebelZiel = 0; Z.lichtZiel = Math.max(Z.lichtZiel, 1.45); Z.flamme = 1.6; Z.dunkelZiel = 0.55;
      funkenRegen(Z.lx, Z.ly, "#ffd56b", 50, 280);
      blitz("warm");
      if (stark) { Z.wackeln = 14; beben(); vibrieren(50); }
      if (v.talisman) later(() => K.spielen("talisman"), 500);
      muenzenFliegen(vorher, v.glanz, () => { kopfZeichnen(); ergebnisZeigen(); S.sperre = false; });
    } else {
      K.spielen("verfehlt");
      Z.wackeln = 9; Z.flammeZiel = 0.55; vibrieren(30);
      later(() => { kopfZeichnen(); ergebnisZeigen(); S.sperre = false; }, 500);
    }
  }
  function muenzenFliegen(start, menge, fertig) {
    const ziel = mitteVon($("#glanzAnzeige")), n = Math.min(14, menge);
    if (n <= 0) { later(fertig, 300); return; }
    let angekommen = 0;
    for (let i = 0; i < n; i++) {
      later(() => {
        const m = document.createElement("span");
        m.className = "muenze";
        m.textContent = "✦";
        m.style.transitionDuration = ms(520) + "ms";
        m.style.transform = `translate(${Z.lx + (Math.random() - 0.5) * 50 - 10}px, ${Z.ly + (Math.random() - 0.5) * 40 - 12}px)`;
        document.body.appendChild(m);
        void m.offsetWidth;
        m.style.transform = `translate(${ziel.x - 10}px, ${ziel.y - 12}px) scale(0.7)`;
        setTimeout(() => {
          m.remove();
          angekommen++;
          K.spielen("muenze", { i: angekommen });
          glanzSetzen(start + Math.round((menge * angekommen) / n));
          if (angekommen === n) later(fertig, 120);
        }, ms(520));
      }, 260 + i * 55);
    }
  }
  function ergebnisZeigen() {
    const r = S.run, st = r.station, e = st.ergebnis, el = $("#ergebnis");
    if (!el || !e) return;
    $("#flackern").hidden = true;
    let titel, text;
    if (e.erloschen) { titel = "Die Laterne erlischt"; text = `−${e.schaden} Docht. Kein Glanz an dieser Station.`; }
    else if (e.bestanden) {
      titel = st.waechter ? `${WAECHTER[st.waechter].name} weicht zurück` : "Das Dunkel weicht";
      text = `<span class="ergebnis-glanz">+${e.glanz} Glanz</span>${e.talisman ? ` · Talisman: <b>${esc(TALISMANE[e.talisman].name)}</b> (${esc(TALISMANE[e.talisman].regel)})` : ""}`;
      if (!st.waechter) text += "<br>Ein Funke folgt deinem Licht.";
    } else { titel = "Du kämpfst dich durch"; text = `Es fehlten ${e.fehlt} Licht: −${e.schaden} Docht.`; }
    if (r.docht <= 0) text += "<br>Dein Docht ist heruntergebrannt.";
    else if (st.waechter && !e.bestanden) text += "<br>Der Wächter stellt sich dir erneut.";
    el.innerHTML = `<h2>${esc(titel)}</h2><p>${text}</p><button class="gross primaer" id="ergebnisWeiter" data-aktion="stationWeiter">Weiter</button>`;
    el.hidden = false;
  }

  function fangZeigen() {
    const r = S.run;
    bild.innerHTML = `<section class="seite wahl">
      <h2>Ein Fang</h2>
      <p>Ein Funke folgt deinem Licht. Nimm einen ins Glas, oder lass alle frei: Ein kleineres Glas ist berechenbarer.</p>
      <div class="karten">${r.angebot.arten.map((id, i) => `<button class="wahl-karte" data-aktion="fangen" data-i="${i}">${chip(id, "gross-chip")}<b>${esc(ARTEN[id].name)}</b><span>${esc(ARTEN[id].regel)}</span>${S.meta.gesehen.arten.indexOf(id) < 0 && r.statistik.gesehen.indexOf(id) < 0 ? "<em>neu fürs Naturkundebuch</em>" : ""}</button>`).join("")}</div>
      <button class="leiser-knopf" data-aktion="fangen" data-i="-1">Alle freilassen (+1 Glanz)</button>
    </section>`;
  }
  function beuteZeigen() {
    const r = S.run, t = r.angebot.talismane;
    bild.innerHTML = `<section class="seite wahl">
      <h2>Der Weg ist frei</h2>
      <p>Wo der Wächter stand, liegt etwas im Moos. Nimm einen Talisman mit. Danach atmest du durch: +2 Docht. In der nächsten Region schließt sich dir ein Irrlicht an.</p>
      <div class="karten">${t.map((id, i) => `<button class="wahl-karte" data-aktion="beute" data-i="${i}">${talismanZeichen(id)}<b>${esc(TALISMANE[id].name)}</b><span>${esc(TALISMANE[id].regel)} <i>${esc(TALISMANE[id].text)}</i></span></button>`).join("")}</div>
      ${t.length ? "" : '<p class="leise">Du trägst schon alle Talismane, die es gibt (+5 Glanz).</p>'}
      <button class="${t.length ? "leiser-knopf" : "gross primaer"}" data-aktion="beute" data-i="-1">${t.length ? "Nichts nehmen" : "Weiter"}</button>
    </section>`;
  }
  function glasListe(aktion, nurIrr) {
    const r = S.run;
    return `<div class="karten">${M.glasZaehlen(r.glas).filter((x) => !nurIrr || ARTEN[x.id].irr).map((x) =>
      `<button class="wahl-karte" data-aktion="${aktion}" data-id="${x.id}" ${M.entfernbar(r, x.id) ? "" : "disabled"}>${chip(x.id, "gross-chip")}<b>${x.anzahl}× ${esc(ARTEN[x.id].name)}</b><span>${esc(ARTEN[x.id].regel)}</span></button>`).join("")}</div>`;
  }
  function rastZeigen() {
    const r = S.run;
    if (S.picker === "sichten") {
      bild.innerHTML = `<section class="seite wahl"><h2>Glas sichten</h2><p>Welcher Funke soll für immer gehen? Weniger Irrlichter heißt weniger Kälte, weniger Funken ein berechenbareres Glas.</p>
        ${glasListe("rastEntfernen")}<button class="leiser-knopf" data-aktion="zurueck">Zurück</button></section>`;
      return;
    }
    bild.innerHTML = `<section class="seite wahl">
      <h2>Lagerfeuer</h2>
      <p>Ein Feuer aus Torf, jemand hat es vor dir entzündet. Du hast Zeit für eine Sache.</p>
      <div class="karten">
        <button class="wahl-karte" data-aktion="rastDocht" ${r.docht >= r.dochtMax ? "disabled" : ""}><span class="icon-zeichen">${ICON.rast}</span><b>Docht flicken</b><span>+${M.rastHeilung(r)} Docht (jetzt ${r.docht} von ${r.dochtMax})</span></button>
        <button class="wahl-karte" data-aktion="rastSichten"><span class="icon-zeichen">${ICON.glas}</span><b>Glas sichten</b><span>Einen Funken oder ein Irrlicht für immer aus dem Glas nehmen.</span></button>
      </div>
      ${r.docht >= r.dochtMax ? '<p class="leise">Dein Docht ist heil.</p>' : ""}
    </section>`;
  }
  function haendlerZeigen() {
    const r = S.run, an = r.angebot;
    if (S.picker === "austreiben") {
      bild.innerHTML = `<section class="seite wahl"><h2>Austreiben</h2><p>Für ${M.austreibenKosten(r)} Glanz nimmt die Krämerin einen Funken oder ein Irrlicht aus deinem Glas. Jedes Mal wird es teurer.</p>
        ${glasListe("austreiben")}<button class="leiser-knopf" data-aktion="zurueck">Zurück</button></section>`;
      return;
    }
    const ware = (w, i) => {
      const verkauft = an.verkauft.indexOf(i) >= 0;
      const zeichen = w.typ === "art" ? chip(w.id, "gross-chip") : w.typ === "kraut" ? krautZeichen(w.id) : talismanZeichen(w.id);
      const name = w.typ === "art" ? ARTEN[w.id].name : w.typ === "kraut" ? KRAEUTER[w.id].name : TALISMANE[w.id].name;
      const regel = w.typ === "art" ? ARTEN[w.id].regel : w.typ === "kraut" ? KRAEUTER[w.id].regel : TALISMANE[w.id].regel;
      return `<button class="wahl-karte ${verkauft ? "verkauft" : ""}" data-aktion="kaufen" data-i="${i}" ${M.kaufbar(r, i) ? "" : "disabled"}>${zeichen}<b>${esc(name)} <span class="preis">${verkauft ? "verkauft" : `✦ ${w.preis}`}</span></b><span>${esc(regel)}</span></button>`;
    };
    bild.innerHTML = `<section class="seite wahl">
      <h2>Die Krämerin</h2>
      <p>„Glanz gegen Licht. Und wenn dir was zu kalt ist, nehm ich’s dir ab.“ Du hast <b class="ergebnis-glanz">✦ ${r.glanz}</b>.</p>
      <div class="karten">${an.waren.map(ware).join("")}
        <button class="wahl-karte" data-aktion="austreibenWahl" ${r.glanz >= M.austreibenKosten(r) ? "" : "disabled"}><span class="icon-zeichen">${ICON.nebel}</span><b>Austreiben <span class="preis">✦ ${M.austreibenKosten(r)}</span></b><span>Einen Funken oder ein Irrlicht für immer aus dem Glas nehmen.</span></button>
      </div>
      <button class="gross" data-aktion="haendlerWeg" id="haendlerWeg">Weiterziehen</button>
    </section>`;
  }
  function fundZeigen() {
    const r = S.run, f = M.fundDaten(r.fund), e = r.fund.ergebnis;
    if (!e) {
      bild.innerHTML = `<section class="seite wahl">
        <h2>${esc(f.titel)}</h2>
        <p class="erzaehlung">${esc(f.text)}</p>
        <div class="karten">${f.optionen.map((o, i) => `<button class="wahl-karte" data-aktion="fund" data-i="${i}" ${M.optionMoeglich(r, o) ? "" : "disabled"}><span class="icon-zeichen">${i + 1}</span><b>${esc(o.text)}</b><span>${esc(o.hinweis)}</span></button>`).join("")}</div>
      </section>`;
      return;
    }
    const gewinne = [];
    for (const t of e.talismane) gewinne.push(`Talisman: <b>${esc(TALISMANE[t].name)}</b> – ${esc(TALISMANE[t].regel)}`);
    for (const k of e.kraeuter) gewinne.push(`Kraut: <b>${esc(KRAEUTER[k].name)}</b>`);
    if (e.geopfert) gewinne.push(`Geopfert: ${esc(ARTEN[e.geopfert].name)}`);
    bild.innerHTML = `<section class="seite wahl">
      <h2>${esc(f.titel)}</h2>
      ${e.text ? `<p class="erzaehlung">${esc(e.text)}</p>` : ""}
      ${e.notiz !== undefined ? `<blockquote class="brief">${esc(NOTIZEN[e.notiz])}<small>Almas Notiz ${e.notiz + 1} von ${NOTIZEN.length}</small></blockquote>` : ""}
      ${gewinne.length ? `<div class="panel bilanz">${gewinne.map((g) => `<div>${g}</div>`).join("")}</div>` : ""}
      <button class="gross primaer" data-aktion="fundWeiter" id="fundWeiter">Weiter</button>
    </section>`;
  }
  function endeZeigen() {
    const r = S.run, e = r.ende, b = e.bilanz || { posten: [], summe: 0, neueNotizen: [], neu: [] };
    szene(e.sieg ? "morgen" : "moor", e.sieg ? "morgen" : "r" + r.region);
    if (!e.sieg) { Z.dunkelZiel = 0.85; }
    const titel = e.wahresEnde ? "Heimkehr" : e.sieg ? "Morgengrauen" : "Die Nacht beginnt von vorn";
    const text = e.wahresEnde ? TEXTE.wahresEnde : e.sieg ? TEXTE.sieg : TEXTE.niederlage;
    bild.innerHTML = `<section class="seite ende">
      <h1>${titel}</h1>
      <p class="erzaehlung">${esc(text)}</p>
      <div class="panel bilanz">
        <div><span>Weg</span><span>${esc(REGIONEN[r.region].name)}, ${r.statistik.schritte} Schritte</span></div>
        <div><span>Hellstes Licht</span><span>${r.statistik.hellste}</span></div>
        ${b.posten.map((p) => `<div><span>${esc(p[0])}</span><span>+${p[1]}</span></div>`).join("")}
        <div class="summe"><span>Erinnerungen</span><span>+${b.summe}</span></div>
      </div>
      ${b.neu.length ? `<p class="leise">Neu im Naturkundebuch: ${b.neu.map(esc).join(", ")}</p>` : ""}
      ${e.sieg && r.mondphase < 5 && S.meta.mondphaseFrei > r.mondphase ? `<p class="leise">Neue Mondphase frei: ${esc(MONDPHASEN[r.mondphase + 1].name)}.</p>` : ""}
      <button class="gross primaer" data-aktion="insDorf" id="insDorf">Zurück nach Fennhusen</button>
    </section>`;
  }

  /* ================= Fenster (Dialoge) ================= */
  function regelnZeigen() {
    modal(`<h2>Wie man spielt</h2>
      <p><b>Ziel:</b> Trag das Licht durch drei Regionen bis zum Lichtturm. Jede Region endet an einem Wächter.</p>
      <p><b>An jeder Station</b> ziehst du Funken aus deinem Glas. Glühwürmchen und Käfer bringen Licht, Irrlichter bringen Kälte. Steigt die Kälte über die Schwelle, erlischt die Laterne: −2 Docht, kein Glanz.</p>
      <p><b>Weitergehen</b> kannst du jederzeit. Reicht dein Licht gegen das Dunkel, gibt es Glanz (Grundlohn plus Überschuss, höchstens 10) und danach einen neuen Funken fürs Glas. Reicht es nicht, kostet jede angefangene 3 fehlenden Licht 1 Docht.</p>
      <p><b>Risiko</b> zeigt dir genau, wie wahrscheinlich der nächste Funke die Laterne löscht. Was noch im Glas ist, steht darunter.</p>
      <p><b>Auf der Karte</b> wählst du den Weg: Nebelbänke sind hart, bringen aber Talismane. Lagerfeuer flicken den Docht oder nehmen etwas aus dem Glas, die Krämerin verkauft Funken, Kräuter und Talismane, Funde erzählen Geschichten.</p>
      <p><b>Wächter</b> musst du bestehen, jeder Fehlversuch kostet Docht. Nach jedem Wächter schließt sich dir ein Irrlicht an.</p>
      <p><b>Geht der Docht aus,</b> beginnt die Johannisnacht von vorn. Was du erlebt hast, bleibt als Erinnerung und schaltet im Dorf Neues frei. Almas Notizen erzählen, was mit ihr geschah.</p>
      <p class="leise">Tasten: Leertaste zieht, Enter geht weiter, M schaltet den Ton.</p>`);
  }
  function glasZeigen() {
    const r = S.run;
    if (!r) return;
    modal(`<h2>Dein Glas</h2>
      <p class="leise">${r.glas.length} Funken · Kälte-Schwelle ${r.schwelle}${r.talismane.indexOf("bernstein") >= 0 ? " (+1 Bernstein)" : ""} · Docht ${r.docht}/${r.dochtMax}</p>
      <div class="liste">${M.glasZaehlen(r.glas).map((x) => `<div class="eintrag">${chip(x.id, "gross-chip")}<div><b>${x.anzahl}× ${esc(ARTEN[x.id].name)}</b><span>${esc(ARTEN[x.id].regel)}</span></div></div>`).join("")}</div>
      <h3>Talismane</h3>
      ${r.talismane.length ? `<div class="liste">${r.talismane.map((t) => `<div class="eintrag">${talismanZeichen(t)}<div><b>${esc(TALISMANE[t].name)}</b><span>${esc(TALISMANE[t].regel)}</span></div></div>`).join("")}</div>` : '<p class="leise">Noch keine. Nebelbänke, Wächter, Funde und die Krämerin haben welche.</p>'}
      <h3>Kräuter</h3>
      ${r.kraeuter.length ? `<div class="liste">${r.kraeuter.map((k) => `<div class="eintrag">${krautZeichen(k)}<div><b>${esc(KRAEUTER[k].name)}</b><span>${esc(KRAEUTER[k].regel)}</span></div></div>`).join("")}</div>` : '<p class="leise">Keine. Höchstens drei passen in den Beutel.</p>'}`);
  }
  function erinnerungenZeigen() {
    const m = S.meta;
    modal(`<h2>Erinnerungen</h2>
      <p class="leise">Was du in den Nächten erlebst, bleibt dir. Eine Erinnerung schaltet etwas für alle künftigen Nächte frei. Du hast <b>${m.erinnerungen}</b>.</p>
      <div class="liste">${FREISCHALTUNGEN.map((f) => {
        const hat = m.freigeschaltet.indexOf(f.id) >= 0;
        return `<div class="eintrag ${hat ? "fertig" : ""}"><div><b>${esc(f.name)}</b><span>${esc(f.text)}</span></div>${hat ? "<em>✓</em>" : `<button class="klein ${m.erinnerungen >= f.preis ? "primaer" : ""}" data-aktion="freischalten" data-id="${f.id}" ${m.erinnerungen >= f.preis ? "" : "disabled"}>${f.preis}</button>`}</div>`;
      }).join("")}
      <div class="eintrag ${m.freigeschaltet.indexOf("gebunden") >= 0 ? "fertig" : "fehlt"}"><div><b>Gebundenes Irrlicht</b><span>${m.freigeschaltet.indexOf("gebunden") >= 0 ? "Neuer Funke: 5 Licht, 1 Kälte." : "Schaltet sich frei, wenn du am Schwarzen Wasser jemandem begegnest."}</span></div>${m.freigeschaltet.indexOf("gebunden") >= 0 ? "<em>✓</em>" : ""}</div>
      </div>`);
  }
  function buchZeigen() {
    const m = S.meta, arten = Object.keys(ARTEN), tal = Object.keys(TALISMANE);
    modal(`<h2>Pims Naturkundebuch</h2>
      <p class="leise">Jeder Funke, den du ziehst, und jeder Talisman, den du trägst, landet hier. ${m.gesehen.arten.length} von ${arten.length} Funken, ${m.gesehen.talismane.length} von ${tal.length} Talismanen.</p>
      <div class="liste">${arten.map((id) => m.gesehen.arten.indexOf(id) >= 0
        ? `<div class="eintrag">${chip(id, "gross-chip")}<div><b>${esc(ARTEN[id].name)}</b><span>${esc(ARTEN[id].regel)}</span>${ARTEN[id].notiz ? `<i>${esc(ARTEN[id].notiz)}</i>` : ""}</div></div>`
        : `<div class="eintrag fehlt"><span class="chip gross-chip" style="--f:#2a3550">?</span><div><b>Noch nicht gesehen</b><span>${m.freigeschaltet.indexOf(id) >= 0 || I.BASIS_ARTEN.indexOf(id) >= 0 ? "Irgendwo im Moor." : "Muss erst freigeschaltet werden."}</span></div></div>`).join("")}</div>
      <h3>Talismane</h3>
      <div class="liste">${tal.map((t) => m.gesehen.talismane.indexOf(t) >= 0
        ? `<div class="eintrag">${talismanZeichen(t)}<div><b>${esc(TALISMANE[t].name)}</b><span>${esc(TALISMANE[t].regel)}</span><i>${esc(TALISMANE[t].text)}</i></div></div>`
        : `<div class="eintrag fehlt"><span class="talisman-zeichen">?</span><div><b>Unbekannt</b><span>${I.TRUHE_TALISMANE.indexOf(t) >= 0 && m.freigeschaltet.indexOf("truhe") < 0 ? "Liegt in der Krämerinnentruhe." : "Noch nicht getragen."}</span></div></div>`).join("")}</div>`);
  }
  function notizenZeigen() {
    const m = S.meta;
    modal(`<h2>Almas Notizen</h2>
      <p class="leise">${m.notizen.length} von ${NOTIZEN.length} Seiten. Sie liegen verstreut an Fundorten im Moor, die erste ungelesene findest du meist beim ersten Fund einer Nacht.</p>
      ${NOTIZEN.map((n, i) => m.notizen.indexOf(i) >= 0 ? `<blockquote class="brief">${esc(n)}<small>Seite ${i + 1}</small></blockquote>` : `<div class="eintrag fehlt"><div><b>Seite ${i + 1}</b><span>fehlt noch</span></div></div>`).join("")}`);
  }
  function figurZeigen(id) {
    const m = S.meta, f = FIGUREN[id];
    const neu = M.gespraeche(m).find((g) => g.wer === id);
    let text;
    if (neu) { text = neu.text; M.gespraechGelesen(m, neu.id); speichern(); }
    else {
      const alt = GESPRAECHE.filter((g) => g.wer === id && m.gespraeche.indexOf(g.id) >= 0);
      text = alt.length ? alt[alt.length - 1].text : "…";
    }
    K.spielen("seite");
    modal(`<h2>${esc(f.name)}</h2><p class="leise">${esc(f.rolle)}</p><p class="sprecher">„${esc(text)}“</p>
      ${neu ? "" : '<p class="leise">Mehr gibt es erst nach der nächsten Nacht.</p>'}`);
    dorfZeigen();
  }
  function menueZeigen() {
    modal(`<h2>Pause</h2>
      <div class="knopf-stapel">
        <button class="gross" data-aktion="schliessen">Weiterspielen</button>
        <button class="gross" data-aktion="regeln">Wie man spielt</button>
        <button class="gross" data-aktion="pause">Ins Dorf<small>die Nacht bleibt gespeichert</small></button>
        <button class="gross" data-aktion="aufgeben">Nacht aufgeben<small>zählt als erloschen, Erinnerungen bleiben</small></button>
      </div>`);
  }
  function krautInfo(id) {
    const r = S.run;
    modal(`<h2>${esc(KRAEUTER[id].name)}</h2><p>${esc(KRAEUTER[id].regel)}</p>
      <div class="knopf-stapel"><button class="gross primaer" data-aktion="kraut" data-id="${id}" ${M.krautMoeglich(r, id) ? "" : "disabled"}>Jetzt nutzen</button>
      <button class="gross" data-aktion="schliessen">Behalten</button></div>`);
  }

  /* ================= Abläufe ================= */
  function nachAktion() {
    const r = S.run;
    if (r && r.phase === "ende" && !r.ende.ausgewertet) M.laufAuswerten(S.meta, r);
    speichern();
    zeigen();
  }
  function laufStarten(opt) {
    const seed = FESTER_SEED ? Number(FESTER_SEED) : opt.seed || ((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    S.run = M.neuerLauf({ seed, laterne: opt.laterne, mondphase: opt.mondphase, meta: S.meta, taeglich: opt.taeglich || null });
    S.ansicht = "lauf";
    S.auswahl = null;
    S.picker = null;
    S.region = -1;
    K.spielen("start");
    speichern();
    zeigen();
  }

  const AKTIONEN = {
    introFertig() { S.meta.introGesehen = true; S.ansicht = "dorf"; speichern(); K.spielen("start"); zeigen(); },
    start() {
      if (S.run) {
        modal(`<h2>Neue Nacht?</h2><p>Die laufende Nacht endet dann, als wäre die Laterne erloschen. Erinnerungen daraus bleiben.</p>
          <div class="knopf-stapel"><button class="gross primaer" data-aktion="neuJa">Neue Nacht beginnen</button><button class="gross" data-aktion="schliessen">Abbrechen</button></div>`);
        return;
      }
      laufStarten({ laterne: S.laterne, mondphase: S.mond });
    },
    neuJa() { schliessen(); M.aufgeben(S.run); M.laufAuswerten(S.meta, S.run); S.run = null; laufStarten({ laterne: S.laterne, mondphase: S.mond }); },
    fortsetzen() { S.ansicht = "lauf"; S.region = S.run.region; zeigen(); },
    taeglich() {
      if (S.run) { AKTIONEN.start(); return; }
      laufStarten({ seed: M.datumsSeed(), laterne: "sturm", mondphase: 0, taeglich: heute() });
    },
    laterne(d) { S.laterne = d.id; speichern(); K.spielen("klick"); dorfZeigen(); },
    mond(d) { S.mond = Number(d.i); speichern(); K.spielen("klick"); dorfZeigen(); },
    figur(d) { figurZeigen(d.id); },
    erinnerungen() { erinnerungenZeigen(); },
    freischalten(d) { if (M.freischalten(S.meta, d.id)) { K.spielen("talisman"); speichern(); erinnerungenZeigen(); dorfZeigen(); } },
    buch() { K.spielen("seite"); buchZeigen(); },
    notizen() { K.spielen("seite"); notizenZeigen(); },
    regeln() { regelnZeigen(); },
    ton() { K.setzen(!K.an); speichern(); kopfZeichnen(); if (K.an) K.spielen("klick"); },
    glas() { glasZeigen(); },
    menue() { menueZeigen(); },
    pause() { schliessen(); S.ansicht = "dorf"; speichern(); zeigen(); },
    aufgeben() {
      modal(`<h2>Nacht aufgeben?</h2><p>Die Laterne erlischt, die Nacht beginnt von vorn.</p>
        <div class="knopf-stapel"><button class="gross primaer" data-aktion="aufgebenJa">Aufgeben</button><button class="gross" data-aktion="schliessen">Weiterspielen</button></div>`);
    },
    aufgebenJa() { schliessen(); M.aufgeben(S.run); nachAktion(); },
    insDorf() { S.run = null; S.ansicht = "dorf"; speichern(); zeigen(); },
    schliessen() { schliessen(); },
    tippWeg(d) { if (S.meta.tipps.indexOf(d.id) < 0) S.meta.tipps.push(d.id); speichern(); const t = document.querySelector(".tipp"); if (t) t.remove(); laternenPosition(); },
    knoten(d) { S.auswahl = { reihe: Number(d.r), index: Number(d.i) }; K.spielen("klick"); karteZeigen(); },
    hingehen() {
      const a = S.auswahl;
      if (!a || !M.reisen(S.run, a.reihe, a.index)) return;
      S.auswahl = null;
      K.spielen("schritt");
      nachAktion();
    },
    ziehen() { ziehen(); },
    weiter() { weiter(); },
    krautInfo(d) { krautInfo(d.id); },
    kraut(d) {
      schliessen();
      const r = S.run, st = r.station, warFlackernd = st && st.status === "flackert";
      if (!M.krautNutzen(r, d.id)) return;
      speichern();
      K.spielen("talisman");
      if (warFlackernd) { $("#flackern").hidden = true; Z.flammeZiel = 1; }
      if (d.id === "johanniskraut") {
        const gz = $("#gezogen");
        if (gz && gz.lastElementChild) gz.removeChild(gz.lastElementChild);
        popup("Irrlicht zurück ins Glas", "warm");
      } else if (d.id === "kienspan") { popup("+3 Licht", "hell"); funkenRegen(Z.lx, Z.ly, "#ffb347", 20, 160); }
      else if (d.id === "wachs") popup("Schwelle +2", "warm");
      else if (d.id === "baldrian") popup("Du siehst klarer", "leise");
      stationAktualisieren();
    },
    erloeschen() { if (M.erloeschenLassen(S.run)) { speichern(); $("#flackern").hidden = true; erloschenSzene(); } },
    stationWeiter() { M.stationAbschliessen(S.run); nachAktion(); },
    fangen(d) {
      const i = Number(d.i);
      if (!M.fangen(S.run, i < 0 ? null : i)) return;
      K.spielen(i < 0 ? "muenze" : "funke", { stufe: 4, id: "gluehwuermchen" });
      nachAktion();
    },
    beute(d) {
      const i = Number(d.i);
      if (!M.beuteWaehlen(S.run, i < 0 ? null : i)) return;
      if (i >= 0) K.spielen("talisman");
      nachAktion();
    },
    rastDocht() { if (M.rasten(S.run, "docht")) { K.spielen("bestanden"); nachAktion(); } },
    rastSichten() { S.picker = "sichten"; rastZeigen(); },
    rastEntfernen(d) { if (M.rasten(S.run, "sichten", d.id)) { S.picker = null; K.spielen("seite"); nachAktion(); } },
    kaufen(d) { if (M.kaufen(S.run, Number(d.i))) { K.spielen("kauf"); speichern(); kopfZeichnen(); haendlerZeigen(); } },
    austreibenWahl() { S.picker = "austreiben"; haendlerZeigen(); },
    austreiben(d) { if (M.austreiben(S.run, d.id)) { S.picker = null; K.spielen("kauf"); speichern(); kopfZeichnen(); haendlerZeigen(); } },
    haendlerWeg() { S.picker = null; M.haendlerVerlassen(S.run); nachAktion(); },
    zurueck() { S.picker = null; zeigen(); },
    fund(d) {
      const e = M.fundWaehlen(S.run, Number(d.i));
      if (!e) return;
      K.spielen(e.notiz !== undefined ? "seite" : e.talismane.length ? "talisman" : e.gut === false ? "verfehlt" : "klick");
      nachAktion();
    },
    fundWeiter() { M.fundAbschliessen(S.run); nachAktion(); }
  };
  const IMMER = { ton: 1, schliessen: 1, glas: 1, regeln: 1, menue: 1 };

  document.addEventListener("click", (e) => {
    if (e.target === dialog) { schliessen(); return; }
    const t = e.target.closest("[data-aktion]");
    if (!t || t.disabled) return;
    K.starten();
    const name = t.dataset.aktion;
    if (S.sperre && !IMMER[name]) return;
    const f = AKTIONEN[name];
    if (f) f(t.dataset, t);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dialog.hidden) { schliessen(); return; }
    if (e.key === "m" || e.key === "M") { AKTIONEN.ton(); return; }
    if (!dialog.hidden || S.sperre || !S.run || S.ansicht !== "lauf") return;
    if (S.run.phase === "station") {
      if (e.key === " ") { e.preventDefault(); K.starten(); const b = $("#ziehen"); if (b && !b.disabled) ziehen(); }
      if (e.key === "Enter") {
        e.preventDefault(); K.starten();
        const erg = $("#ergebnisWeiter");
        if (erg && !$("#ergebnis").hidden) AKTIONEN.stationWeiter();
        else { const b = $("#weiter"); if (b && !b.disabled) weiter(); }
      }
    }
  });
  window.addEventListener("resize", () => { groesse(); if (S.run && S.run.phase === "karte" && S.ansicht === "lauf") karteZeigen(); });

  // Schnittstelle für die automatischen Tests.
  window.moorlicht = {
    get run() { return S.run; },
    get meta() { return S.meta; },
    bildschirm() { return S.ansicht !== "lauf" || !S.run ? S.ansicht : S.run.phase; },
    bereit() { return !S.sperre && Z.flieger.length === 0; },
    gefahr() { return S.run && S.run.station ? M.gefahr(S.run) : 0; },
    vorschau() { return S.run && S.run.station ? M.vorschau(S.run) : null; }
  };

  laden();
  groesse();
  zeigen();
  requestAnimationFrame(schleife);
})();
