// Andeutungen: wenige Striche, die beim Weiterlesen verblassen. Die Bilder sollen im Kopf entstehen;
// hier steht nur ein Anhaltspunkt, ein Gegenstand, eine Linie. Alles als SVG-Pfad, ohne Dateien.
const P = (d, rot = false) => ({ d, rot });
const pilze = (xs, y) => xs.map((x) => P(`M${x - 4} ${y} q4 -7 8 0 M${x} ${y} v4`));
const punkte = (liste) => liste.map(([x, y, r = 3.5]) => P(`M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`));
const kreis = (x, y, r, rot = false) => P(`M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`, rot);

export const BILDER = {
  streif: [P("M5 66 Q60 52 110 59 T195 55"), P("M150 56 v-13 l3 -6 l3 6 v13"), P("M18 92 Q90 78 182 88"), P("M20 99 Q95 86 184 95"), ...pilze([44, 72, 101, 130, 158], 92)],
  federbusch: [P("M100 116 L100 32"), kreis(100, 30, 4), P("M100 27 C90 8 78 6 68 13"), P("M100 26 C98 6 105 0 113 4"), P("M101 27 C109 11 123 10 131 18"), P("M99 29 C91 18 85 20 80 27")],
  pferd: [P("M70 104 C70 72 80 52 95 40 L100 26 L106 37 C126 42 141 57 143 73 C144 81 136 85 130 81 L118 71 C112 79 108 91 110 104"), P("M113 53 h0.5"), P("M84 72 q-10 -6 -14 2 q8 4 14 -2 q2 10 -4 16 M84 72 q10 -2 12 8", true)],
  katze: [P("M18 8 h52 v40 h-52 z M44 8 v40 M18 28 h52"), P("M92 62 C102 47 126 47 136 62"), P("M136 62 l6 -7 l2 7 l4 -7 l1 9"), P("M97 60 l-6 10 M129 60 l4 10"), P("M92 62 C84 66 82 76 88 82"), P("M112 84 v8 M120 88 v8")],
  ohrring: [kreis(78, 40, 8), P("M78 50 l-3 9 l3 4 l3 -4 z"), kreis(104, 40, 8), P("M104 50 l-3 9 l3 4 l3 -4 z"), P("M122 70 L167 62 L152 106 Z"), P("M142 76 l7 -4")],
  handschuh: [P("M80 112 L80 72 C78 62 73 52 75 45 C77 40 84 42 85 50 L88 63 L88 31 C88 24 96 24 96 31 L97 59 L99 25 C99 18 107 18 107 25 L107 59 L110 29 C110 22 118 22 118 29 L117 63 L121 41 C122 34 130 35 129 42 L124 75 C122 91 118 101 118 112")],
  erbsen: [P("M36 92 C36 77 66 77 66 92 C66 102 36 102 36 92 Z"), P("M66 89 L172 70"), ...punkte([[86, 104], [97, 97], [109, 106], [121, 99], [133, 107], [52, 64], [148, 94]])],
  bart: [P("M38 70 Q100 122 162 70"), P("M38 70 Q100 82 162 70"), P("M88 75 C94 60 100 73 106 58"), P("M110 73 C114 62 120 67 123 56")],
  mund: [P("M60 62 C80 46 95 53 100 57 C105 53 120 46 140 62 C120 80 80 80 60 62 Z", true), P("M62 62 Q100 68 138 62", true)],
  glocke: [P("M80 82 C80 42 90 27 100 27 C110 27 120 42 120 82 L128 90 L72 90 Z"), P("M100 27 v-9"), P("M96 90 a4 4 0 0 0 8 0"), P("M140 52 q6 6 0 12 M150 47 q10 10 0 22")],
  geige: [P("M100 18 L100 40"), P("M92 40 C80 40 80 58 90 62 C80 66 80 88 100 90 C120 88 120 66 110 62 C120 58 120 40 108 40 Z"), P("M96 56 v12 M104 56 v12"), P("M58 104 L152 30")],
  boden: [P("M8 92 h184"), P("M48 87 C60 80 92 80 112 85 L144 87"), kreis(151, 83, 6), ...[26, 34, 62, 170, 180].map((x) => P(`M${x} 92 l2 -9 M${x + 5} 92 l-1 -6`))],
  bett: [P("M18 92 h164 M18 92 v14 M182 92 v14"), P("M28 92 C40 70 80 72 100 81 C120 72 160 70 172 92"), P("M24 84 q10 -9 22 0")],
  flasche: [P("M92 18 h16 v22 C120 50 122 60 122 70 V112 H78 V70 C78 60 80 50 92 40 Z"), P("M86 76 h28")],
  faust: [P("M60 90 C55 60 70 50 85 52 C88 44 100 44 104 52 C108 46 120 48 122 56 C128 52 138 58 136 68 C140 80 132 100 115 104 L80 104 C70 104 62 98 60 90 Z"), P("M85 53 v17 M104 53 v17 M122 57 v13")],
  messer: [P("M28 72 L140 56 L151 63 L140 71 Z"), P("M151 63 L186 65 L186 73 L148 73")],
  bibel: [P("M100 42 C80 32 50 32 30 42 V97 C50 87 80 87 100 97 C120 87 150 87 170 97 V42 C150 32 120 32 100 42 V97"), P("M58 20 C80 42 122 8 152 30")],
  kreuz: [P("M78 8 C78 40 122 40 122 8"), P("M100 38 v42 M87 51 h26"), P("M130 92 a11 6 0 1 0 22 0 a11 6 0 1 0 -22 0")],
  mond: [kreis(100, 42, 26, true), P("M58 96 h84 M70 103 h60", true), P("M82 110 h36")],
  reiter: [P("M58 112 L140 30"), P("M140 30 C150 19 168 21 171 30 C173 38 161 41 152 38 L140 30"), P("M145 26 l-4 -7 M151 23 l-3 -7")],
  kamisol: [P("M70 20 L85 15 L100 40 L115 15 L130 20 L140 50 L135 110 L105 110 L100 72 L95 110 L65 110 L60 50 Z"), P("M100 78 h0.5 M100 92 h0.5")],
};

export function bildSvg(name) {
  const pfade = BILDER[name];
  if (!pfade) return "";
  const inhalt = pfade.map((p) => `<path class="strich${p.rot ? " rot" : ""}" d="${p.d}"/>`).join("");
  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" role="presentation">${inhalt}</svg>`;
}

// Setzt die Strichlänge für das Nachzeichnen.
export function vorbereiten(figur) {
  for (const p of figur.querySelectorAll("path")) {
    try { p.style.setProperty("--l", Math.ceil(p.getTotalLength() + 2)); } catch { /* ältere Browser */ }
  }
}

// Verblassen beim Weiterlesen: Je weiter die Andeutung nach oben aus dem Blick rückt, desto blasser wird
// sie, und sie kehrt nicht zurück, wenn man zurückblättert.
export function verblassen(figuren) {
  const vh = window.innerHeight || 800;
  for (const f of figuren) {
    const r = f.getBoundingClientRect();
    const fortschritt = Math.min(Math.max((vh * 0.6 - r.top) / (vh * 0.85), 0), 1);
    const ziel = 0.8 * (1 - fortschritt);
    const bisher = Number(f.dataset.deckkraft ?? 0.8);
    const neu = Math.min(bisher, ziel);
    f.dataset.deckkraft = neu.toFixed(3);
    f.style.opacity = neu.toFixed(3);
  }
}
