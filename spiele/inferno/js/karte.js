// Die Karte: ein Schnitt durch den Höllentrichter, gezeichnet wie eine Tafel
// in einer Dante-Ausgabe des 19. Jahrhunderts. Im Bild stehen nur Ziffern;
// die Namen stehen als HTML-Liste daneben, damit nie Text aus der Form läuft.

const TINTE = '#2b2118', ROT = '#9c2a1c';

// Ebenen von oben nach unten: Schlüssel (wie "kreis:" in den Textdateien),
// Ziffer im Bild, Name, Gesänge, Tiefe (y) und halbe Breite des Simses.
export const EBENEN = [
  { k: 'W', ziffer: '', name: 'Der dunkle Wald', gesaenge: 'I–II', y: 64, hw: 0 },
  { k: 'V', ziffer: '', name: 'Höllentor und Vorhölle', gesaenge: 'III', y: 96, hw: 214 },
  { k: '1', ziffer: 'I', name: 'Limbus', gesaenge: 'IV', y: 124, hw: 196 },
  { k: '2', ziffer: 'II', name: 'Die Wollüstigen', gesaenge: 'V', y: 150, hw: 178 },
  { k: '3', ziffer: 'III', name: 'Die Schlemmer', gesaenge: 'VI', y: 176, hw: 160 },
  { k: '4', ziffer: 'IV', name: 'Geizige und Verschwender', gesaenge: 'VII', y: 202, hw: 142 },
  { k: '5', ziffer: 'V', name: 'Die Zornigen im Styx', gesaenge: 'VII–VIII', y: 228, hw: 124 },
  { k: 'D', ziffer: '', name: 'Die Stadt Dis', gesaenge: 'VIII–IX', y: 240, hw: 116 },
  { k: '6', ziffer: 'VI', name: 'Die Ketzer', gesaenge: 'X–XI', y: 262, hw: 108 },
  { k: '7', ziffer: 'VII', name: 'Die Gewalttätigen', gesaenge: 'XII–XVII', y: 312, hw: 92 },
  { k: '8', ziffer: 'VIII', name: 'Die Betrüger in den Übelbulgen', gesaenge: 'XVIII–XXXI', y: 392, hw: 62 },
  { k: '9', ziffer: 'IX', name: 'Die Verräter im Eis', gesaenge: 'XXXII–XXXIV', y: 448, hw: 34 },
];

let zaehler = 0;

// Gezeichnet in einem Feld von 600 × 560. aktiv: Schlüssel der Ebene.
export function zeichneKarte(aktiv, { klein = false } = {}) {
  const id = 'k' + (++zaehler);
  const idx = EBENEN.findIndex(e => e.k === String(aktiv));
  const M = 300;
  const kreise = EBENEN.filter(e => e.hw);
  // Kontur der linken Trichterwand: Wand hinab, dann Sims nach innen; rechts gespiegelt.
  const punkte = [[M - 232, 70]];
  let vorher = { hw: 232 };
  for (const e of kreise) { punkte.push([M - vorher.hw + 4, e.y - 3], [M - e.hw, e.y]); vorher = e; }
  punkte.push([M - 22, 470], [M, 476]);
  const alle = [...punkte, ...punkte.slice(0, -1).reverse().map(([x, y]) => [2 * M - x, y])];
  const trichter = 'M' + alle.map(([x, y]) => x + ' ' + y).join(' L') + ' Z';
  const sims = e => `M${M - e.hw} ${e.y}L${M - e.hw + 16} ${e.y + 0.5}M${M + e.hw} ${e.y}L${M + e.hw - 16} ${e.y + 0.5}`;

  let o = `<svg viewBox="0 0 600 560" class="karte${klein ? ' klein' : ''}" role="img" aria-label="Schnitt durch den Höllentrichter${idx >= 0 ? ', markiert: ' + EBENEN[idx].name : ''}">
<defs>
  <pattern id="${id}s" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V5" stroke="${TINTE}" stroke-width=".7" opacity=".55"/></pattern>
  <pattern id="${id}t" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)"><path d="M0 0V7" stroke="${TINTE}" stroke-width=".5" opacity=".35"/></pattern>
  <pattern id="${id}h" width="6" height="2.6" patternUnits="userSpaceOnUse"><path d="M0 .6H6" stroke="${TINTE}" stroke-width=".7"/></pattern>
  <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
  <mask id="${id}m"><rect x="0" y="0" width="600" height="560" fill="url(#${id}l)"/></mask>
  <clipPath id="${id}c"><rect x="8" y="8" width="584" height="544"/></clipPath>
</defs>
<g clip-path="url(#${id}c)" fill="none" stroke="${TINTE}" stroke-linejoin="round">
  <path d="M8 74Q300 52 592 74V552H8Z" fill="url(#${id}s)" stroke="none"/>
  <path d="M8 74Q300 52 592 74V552H8Z" fill="url(#${id}t)" stroke="none"/>
  <path d="${trichter}" fill="#efe6d2" stroke="none"/>
  <path d="${trichter}" fill="url(#${id}h)" stroke="none" mask="url(#${id}m)"/>
  <path d="${trichter}" stroke-width="1.4"/>
  <path d="M8 74Q300 52 592 74" stroke-width="1.6"/>`;
  // Jerusalem über der Öffnung, der Wald links davon
  o += `<path d="M282 61v-9h4v-5h3v-4l3 -3l3 3v4h3v5h4v9M296 43v-7" stroke-width="1"/><path d="M276 62h48" stroke-width="1"/>`;
  for (let i = 0; i < 7; i++) {
    const x = 34 + i * 13, y = 70 - (i % 2) * 3;
    o += `<path d="M${x} ${y}v-6M${x - 5} ${y - 6}q5 -12 10 0z" stroke-width=".9" fill="#efe6d2"/>`;
  }
  // Acheron, Burg im Limbus, Sumpf, Mauern von Dis, Gräber, Blutfluss, Bulgen, Eis
  o += `<path d="M${M - 210} 104q14 -4 28 0t28 0M${M + 154} 104q14 -4 28 0t28 0" stroke-width=".8"/>`;
  o += `<path d="M${M - 168} 124v-9h4v4h4v-4h4v9" stroke-width=".9"/>`;
  o += `<path d="M${M - 120} 232q8 -3 16 0t16 0M${M + 88} 232q8 -3 16 0t16 0" stroke-width=".8"/>`;
  for (const s of [-1, 1]) {
    const x = M + s * 112;
    o += `<path d="M${x - 6} 248v-12h3v-4h6v4h3v12" stroke-width="1" fill="#efe6d2"/>`;
    o += `<path d="M${M + s * 100} 262h${s * -10}v-4h${s * 10}" stroke-width=".8"/>`;
    o += `<path d="M${M + s * 88} 314q5 3 10 0" stroke="${ROT}" stroke-width="1.2"/>`;
    for (let i = 0; i < 4; i++) o += `<path d="M${M + s * (78 - i * 7)} 312v-7" stroke-width=".7"/>`;
  }
  for (let i = 0; i < 5; i++) {
    const x = M - 86 + i * 5;
    o += `<path d="M${x} 390q2.5 3 5 0M${2 * M - x - 5} 390q2.5 3 5 0" stroke-width=".7"/>`;
  }
  o += `<path d="M${M - 34} 448H${M + 34}" stroke-width="2.2" stroke="#5c6f86"/>`;
  // Luzifer in der Mitte, der Gang hinauf zu den Sternen
  o += `<path d="M${M - 10} 460l10 -12l10 12M${M - 18} 452l8 4M${M + 18} 452l-8 4" stroke-width="1.3"/>`;
  o += `<path d="M${M} 476C${M + 18} 500 ${M - 14} 520 ${M + 6} 552" stroke-width="1" stroke-dasharray="3 3"/>`;
  // Hervorhebung der Ebene, in der man ist
  if (idx >= 0) {
    const e = EBENEN[idx];
    if (e.hw) o += `<path d="${sims(e)}" stroke="${ROT}" stroke-width="4" stroke-linecap="round"/>`;
    const mx = e.hw ? M + e.hw + 20 : 98, my = e.hw ? e.y - 2 : 52;
    o += `<circle cx="${mx}" cy="${my}" r="6" fill="${ROT}" stroke="none"/><circle cx="${mx}" cy="${my}" r="10" stroke="${ROT}" stroke-width="1"/>`;
  }
  // Ziffern der neun Kreise links neben der Wand über ihrem Sims, im Fels
  if (!klein) {
    let vorher = { hw: 232 };
    for (const e of kreise) {
      if (e.ziffer) o += `<text x="${M - vorher.hw - 6}" y="${e.y - 2}" text-anchor="end" font-size="14" fill="${EBENEN[idx] === e ? ROT : TINTE}" stroke="none" font-family="EB Garamond, serif">${e.ziffer}</text>`;
      vorher = e;
    }
  }
  o += `</g><rect x="8.5" y="8.5" width="583" height="543" fill="none" stroke="${TINTE}" stroke-width="1"/><rect x="3.5" y="3.5" width="593" height="553" fill="none" stroke="${TINTE}" stroke-width=".6"/></svg>`;
  return o;
}

// Legende als HTML: jede Ebene eine Zeile, die aktuelle hervorgehoben.
export function karteLegende(aktiv, stand) {
  const besucht = new Set();
  if (stand && stand.gesehen) for (const k of Object.keys(stand.gesehen)) besucht.add(k.split(':')[0]);
  return EBENEN.map(e => ({ ...e, aktiv: e.k === String(aktiv) }));
}
