// Miniaturen im Stil italienischer Dante-Handschriften des 14./15. Jahrhunderts:
// Goldgrund oder Lapisgrund, flache Farben, Treppenfelsen, Dante in Rot,
// Vergil in Blau, die Seelen nackt und blass. Alles als SVG, ohne Bilddateien.

let zaehler = 0;
const T = '#2a1a10'; // Tinte
const ROT = '#b3261e', ROT2 = '#8e1c16', BLAU = '#2c4a8c', BLAU2 = '#1d3466', GOLD = '#c9a43a', HAUT = '#ecd3b4', SEELE = '#e9dccb';

function defs(id) {
  return `<defs>
  <pattern id="gold${id}" width="16" height="16" patternUnits="userSpaceOnUse">
    <rect width="16" height="16" fill="#d4b24c"/><path d="M8 0L16 8L8 16L0 8Z" fill="none" stroke="#b8932f" stroke-width="0.8"/>
    <circle cx="8" cy="8" r="1.2" fill="#f0d982"/></pattern>
  <pattern id="lapis${id}" width="22" height="22" patternUnits="userSpaceOnUse">
    <rect width="22" height="22" fill="#24407e"/><path d="M11 6l1.2 3.8L16 11l-3.8 1.2L11 16l-1.2-3.8L6 11l3.8-1.2z" fill="#c9a43a" opacity="0.8"/></pattern>
  <linearGradient id="feuer${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0d08"/><stop offset="1" stop-color="#b3261e"/></linearGradient>
  <linearGradient id="nacht${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120c0a"/><stop offset="1" stop-color="#3b2a20"/></linearGradient>
  <linearGradient id="eis${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2433"/><stop offset="1" stop-color="#55657d"/></linearGradient>
  <linearGradient id="sterne${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset="1" stop-color="#22305e"/></linearGradient>
  </defs>`;
}

const grund = (art, id) => {
  const f = { gold: `url(#gold${id})`, lapis: `url(#lapis${id})`, feuer: `url(#feuer${id})`, nacht: `url(#nacht${id})`, eis: `url(#eis${id})`, sterne: `url(#sterne${id})` }[art] || art;
  return `<rect x="0" y="0" width="400" height="260" fill="${f}"/>`;
};

// Treppenfelsen: gestufte Blöcke mit heller Oberseite
function felsen(x, y, w, h, farbe = '#8a7a63', hell = '#c8b796') {
  let s = '';
  const stufen = Math.max(2, Math.round(h / 22));
  for (let i = 0; i < stufen; i++) {
    const sw = w * (1 - i / (stufen + 1)), sx = x + (w - sw) * (i % 2 ? 0.62 : 0.38), sy = y + h - (i + 1) * (h / stufen);
    s += `<path d="M${sx} ${sy + h / stufen}L${sx + 6} ${sy}L${sx + sw - 6} ${sy}L${sx + sw} ${sy + h / stufen}Z" fill="${farbe}" stroke="${T}" stroke-width="1.1"/>`;
    s += `<path d="M${sx + 6} ${sy}L${sx + sw - 6} ${sy}L${sx + sw - 10} ${sy + 4}L${sx + 10} ${sy + 4}Z" fill="${hell}"/>`;
  }
  return s;
}
const boden = (y, farbe = '#6f7a45', hell = '#8f9a5d') => `<path d="M0 ${y}Q100 ${y - 8} 200 ${y}T400 ${y}V260H0Z" fill="${farbe}" stroke="${T}" stroke-width="1.2"/><path d="M0 ${y + 6}Q100 ${y - 2} 200 ${y + 6}T400 ${y + 6}" fill="none" stroke="${hell}" stroke-width="2"/>`;

function kopf(x, y, s, blick, haar = '#5a3a22') {
  return `<circle cx="${x}" cy="${y}" r="${6 * s}" fill="${HAUT}" stroke="${T}" stroke-width="1"/>` +
    `<circle cx="${x + blick * 2.4 * s}" cy="${y - 0.8 * s}" r="${0.9 * s}" fill="${T}"/>` +
    (haar ? `<path d="M${x - 6 * s} ${y - 1 * s}Q${x} ${y - 10 * s} ${x + 6 * s} ${y - 1 * s}" fill="${haar}" stroke="${T}" stroke-width="0.8"/>` : '');
}

// Dante: rotes Gewand, rote Kappe mit weißer Binde, meist im Profil
function dante(x, y, s = 1, blick = 1) {
  const k = y - 46 * s;
  return `<g class="fig-dante">
  <path d="M${x - 9 * s} ${y}Q${x - 11 * s} ${y - 24 * s} ${x - 7 * s} ${y - 38 * s}L${x + 7 * s} ${y - 38 * s}Q${x + 11 * s} ${y - 24 * s} ${x + 10 * s} ${y}Z" fill="${ROT}" stroke="${T}" stroke-width="1.2"/>
  <path d="M${x - 2 * s} ${y - 36 * s}L${x - 4 * s} ${y - 2 * s}M${x + 3 * s} ${y - 34 * s}L${x + 5 * s} ${y - 2 * s}" stroke="${ROT2}" stroke-width="1"/>
  <path d="M${x + blick * 5 * s} ${y - 32 * s}L${x + blick * 14 * s} ${y - 27 * s}" stroke="${ROT}" stroke-width="${4 * s}" stroke-linecap="round"/>
  <circle cx="${x + blick * 15 * s}" cy="${y - 27 * s}" r="${1.8 * s}" fill="${HAUT}" stroke="${T}" stroke-width="0.6"/>
  ${kopf(x, k, s, blick, null)}
  <path d="M${x - 6.5 * s} ${k + 1 * s}Q${x - 7 * s} ${k - 9 * s} ${x} ${k - 9 * s}Q${x + 7 * s} ${k - 9 * s} ${x + 6.5 * s} ${k - 1 * s}L${x - blick * 7 * s} ${k + 6 * s}Z" fill="${ROT}" stroke="${T}" stroke-width="1"/>
  <path d="M${x - 6 * s} ${k + 0.5 * s}Q${x} ${k - 3 * s} ${x + 6 * s} ${k + 0.5 * s}" fill="none" stroke="#f4efe3" stroke-width="${1.6 * s}"/>
  </g>`;
}

// Vergil: blaues Gewand, grauer Umhang, weißer Bart
function vergil(x, y, s = 1, blick = 1) {
  const k = y - 48 * s;
  return `<g class="fig-vergil">
  <path d="M${x - 10 * s} ${y}Q${x - 12 * s} ${y - 26 * s} ${x - 7 * s} ${y - 40 * s}L${x + 7 * s} ${y - 40 * s}Q${x + 12 * s} ${y - 26 * s} ${x + 11 * s} ${y}Z" fill="${BLAU}" stroke="${T}" stroke-width="1.2"/>
  <path d="M${x - 7 * s} ${y - 40 * s}Q${x - 14 * s} ${y - 20 * s} ${x - 9 * s} ${y - 4 * s}L${x - 2 * s} ${y - 6 * s}Q${x - 6 * s} ${y - 24 * s} ${x + 2 * s} ${y - 38 * s}Z" fill="#8c8a86" stroke="${T}" stroke-width="0.9"/>
  <path d="M${x + blick * 5 * s} ${y - 34 * s}L${x + blick * 15 * s} ${y - 31 * s}" stroke="${BLAU}" stroke-width="${4 * s}" stroke-linecap="round"/>
  <circle cx="${x + blick * 16 * s}" cy="${y - 31 * s}" r="${1.8 * s}" fill="${HAUT}" stroke="${T}" stroke-width="0.6"/>
  ${kopf(x, k, s, blick, '#e7e2d6')}
  <path d="M${x - 4 * s} ${k + 3 * s}Q${x + blick * 2 * s} ${k + 12 * s} ${x + blick * 5 * s} ${k + 3 * s}" fill="#efebe2" stroke="${T}" stroke-width="0.7"/>
  <path d="M${x - 7 * s} ${k - 3 * s}Q${x} ${k - 12 * s} ${x + 7 * s} ${k - 3 * s}" fill="none" stroke="#5f7a3a" stroke-width="${2 * s}" stroke-dasharray="${2 * s} ${1.2 * s}"/>
  </g>`;
}

function paar(x, y, s = 1, blick = 1) { return vergil(x + blick * 22 * s, y, s, blick) + dante(x, y, s, blick); }

// Nackte Seele; pose: stehen | fallen | liegen | kopf | gebeugt
function seele(x, y, s = 1, pose = 'stehen', farbe = SEELE) {
  const st = `fill="${farbe}" stroke="${T}" stroke-width="0.9"`;
  if (pose === 'kopf') return `<circle cx="${x}" cy="${y}" r="${5.5 * s}" ${st}/><path d="M${x - 4 * s} ${y - 2 * s}Q${x} ${y - 7 * s} ${x + 4 * s} ${y - 2 * s}" fill="#6b5844"/>`;
  if (pose === 'liegen') return `<ellipse cx="${x}" cy="${y}" rx="${15 * s}" ry="${4 * s}" ${st}/><circle cx="${x - 17 * s}" cy="${y - 1 * s}" r="${4.5 * s}" ${st}/>`;
  const rot = pose === 'fallen' ? 70 : pose === 'gebeugt' ? 25 : 0;
  return `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - 4 * s} ${y}L${x - 5 * s} ${y - 14 * s}Q${x - 6 * s} ${y - 26 * s} ${x} ${y - 28 * s}Q${x + 6 * s} ${y - 26 * s} ${x + 5 * s} ${y - 14 * s}L${x + 4 * s} ${y}Z" ${st}/>
  <path d="M${x - 5 * s} ${y - 24 * s}L${x - 11 * s} ${y - 12 * s}M${x + 5 * s} ${y - 24 * s}L${x + 10 * s} ${y - 31 * s}" stroke="${farbe}" stroke-width="${2.6 * s}" stroke-linecap="round"/>
  <circle cx="${x}" cy="${y - 33 * s}" r="${5 * s}" ${st}/></g>`;
}

function seelen(n, x0, x1, y, s, pose, streu = 8, farbe) {
  let o = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1));
    o += seele(x, y + Math.sin(i * 2.3) * streu, s, pose, farbe);
  }
  return o;
}

function flamme(x, y, h = 30, w = null) {
  w = w || h * 0.45;
  return `<path d="M${x - w / 2} ${y}Q${x - w / 2} ${y - h * 0.5} ${x} ${y - h}Q${x + w * 0.1} ${y - h * 0.55} ${x + w / 2} ${y - h * 0.6}Q${x + w / 2} ${y - h * 0.2} ${x + w / 2} ${y}Z" fill="${ROT}" stroke="${T}" stroke-width="0.9"/>
  <path d="M${x - w / 4} ${y}Q${x - w / 4} ${y - h * 0.35} ${x} ${y - h * 0.65}Q${x + w / 4} ${y - h * 0.35} ${x + w / 4} ${y}Z" fill="#e8812c"/>
  <path d="M${x - w / 9} ${y}Q${x} ${y - h * 0.3} ${x + w / 9} ${y}Z" fill="#f6d35a"/>`;
}
function flammenReihe(n, x0, x1, y, h) { let o = ''; for (let i = 0; i < n; i++) o += flamme(x0 + (x1 - x0) * i / Math.max(1, n - 1), y, h * (0.7 + 0.3 * Math.sin(i * 1.7) ** 2)); return o; }

const wasser = (y, farbe = '#3d5d7a', linie = '#9db7cf') => `<rect x="0" y="${y}" width="400" height="${260 - y}" fill="${farbe}"/>` +
  Array.from({ length: 5 }, (_, i) => `<path d="M${-20 + i * 9} ${y + 10 + i * 12}q20 -6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" fill="none" stroke="${linie}" stroke-width="1.2" opacity="0.8"/>`).join('');

function baum(x, y, s = 1, art = 'gruen') {
  if (art === 'dorn') {
    return `<path d="M${x} ${y}L${x - 2 * s} ${y - 30 * s}L${x - 14 * s} ${y - 44 * s}M${x - 2 * s} ${y - 30 * s}L${x + 4 * s} ${y - 52 * s}L${x - 4 * s} ${y - 66 * s}M${x + 4 * s} ${y - 52 * s}L${x + 16 * s} ${y - 60 * s}M${x - 1 * s} ${y - 18 * s}L${x + 12 * s} ${y - 28 * s}" stroke="#2b1d14" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>` +
      [[-14, -44], [-4, -66], [16, -60], [12, -28]].map(([a, b]) => `<path d="M${x + a * s} ${y + b * s}l${-3 * s} ${-4 * s}m${3 * s} ${4 * s}l${4 * s} ${-3 * s}" stroke="#2b1d14" stroke-width="${1.4 * s}"/>`).join('');
  }
  if (art === 'dunkel') {
    return `<path d="M${x - 2 * s} ${y}L${x - 1.5 * s} ${y - 40 * s}L${x + 1.5 * s} ${y - 40 * s}L${x + 2 * s} ${y}Z" fill="#2b1d14"/>
  <path d="M${x} ${y - 78 * s}C${x - 22 * s} ${y - 70 * s} ${x - 26 * s} ${y - 40 * s} ${x - 14 * s} ${y - 30 * s}L${x + 14 * s} ${y - 30 * s}C${x + 26 * s} ${y - 40 * s} ${x + 22 * s} ${y - 70 * s} ${x} ${y - 78 * s}Z" fill="#1c2a1a" stroke="#0b0f0a" stroke-width="1.2"/>
  <path d="M${x - 10 * s} ${y - 50 * s}q5 -5 10 0q5 -5 10 0M${x - 8 * s} ${y - 62 * s}q4 -4 8 0q4 -4 8 0" fill="none" stroke="#2c4028" stroke-width="1.1"/>`;
  }
  return `<rect x="${x - 2.5 * s}" y="${y - 30 * s}" width="${5 * s}" height="${30 * s}" fill="#5a3a22" stroke="${T}" stroke-width="0.8"/>
  <ellipse cx="${x}" cy="${y - 42 * s}" rx="${16 * s}" ry="${18 * s}" fill="#2f5a2c" stroke="${T}" stroke-width="1"/>
  <path d="M${x - 10 * s} ${y - 44 * s}q5 -6 10 0q5 -6 10 0M${x - 8 * s} ${y - 34 * s}q4 -5 8 0q4 -5 8 0" fill="none" stroke="#4f8247" stroke-width="1.2"/>`;
}

function stadt(x, y, w, farbe = '#8c3a27', hell = '#b35a3a') {
  let o = `<rect x="${x}" y="${y - 40}" width="${w}" height="40" fill="${farbe}" stroke="${T}" stroke-width="1.2"/>`;
  for (let i = 0; i < w; i += 12) o += `<rect x="${x + i}" y="${y - 46}" width="7" height="6" fill="${farbe}" stroke="${T}" stroke-width="0.8"/>`;
  for (let i = 0; i < 4; i++) {
    const tx = x + 10 + i * (w - 30) / 3;
    o += `<rect x="${tx}" y="${y - 80 - (i % 2) * 14}" width="18" height="${44 + (i % 2) * 14}" fill="${hell}" stroke="${T}" stroke-width="1"/>
    <path d="M${tx - 2} ${y - 80 - (i % 2) * 14}L${tx + 9} ${y - 98 - (i % 2) * 14}L${tx + 20} ${y - 80 - (i % 2) * 14}Z" fill="${farbe}" stroke="${T}" stroke-width="1"/>
    <rect x="${tx + 6}" y="${y - 70 - (i % 2) * 14}" width="5" height="8" fill="#f3a73a"/>`;
  }
  return o;
}

function grab(x, y, offen = true) {
  return (offen ? flammenReihe(3, x - 14, x + 14, y - 16, 28) : '') +
    `<path d="M${x - 24} ${y - 18}L${x + 24} ${y - 18}L${x + 22} ${y}L${x - 22} ${y}Z" fill="#9a8f80" stroke="${T}" stroke-width="1.1"/>` +
    `<path d="M${x - 18} ${y - 12}h36M${x - 18} ${y - 6}h36" stroke="#6f655a" stroke-width="0.8"/>` +
    (offen ? `<path d="M${x + 22} ${y - 18}L${x + 34} ${y - 34}L${x + 38} ${y - 30}L${x + 26} ${y - 16}Z" fill="#b7ad9f" stroke="${T}" stroke-width="1"/>` : '');
}

function boot(x, y, faehrmann = true, farbe = '#5a3a22') {
  return `<path d="M${x - 40} ${y - 10}Q${x} ${y + 8} ${x + 40} ${y - 10}L${x + 34} ${y}Q${x} ${y + 12} ${x - 34} ${y}Z" fill="${farbe}" stroke="${T}" stroke-width="1.2"/>` +
    (faehrmann ? `<path d="M${x + 22} ${y - 10}L${x + 20} ${y - 42}L${x + 30} ${y - 42}L${x + 31} ${y - 10}Z" fill="#4a4a4a" stroke="${T}"/><circle cx="${x + 25}" cy="${y - 48}" r="6" fill="${HAUT}" stroke="${T}"/><path d="M${x + 19} ${y - 46}q6 12 12 0" fill="#efebe2" stroke="${T}" stroke-width="0.6"/><path d="M${x + 36} ${y - 60}L${x + 46} ${y + 4}" stroke="#3b2a1a" stroke-width="2.4"/>` : '');
}

function tier(art, x, y, s = 1, blick = -1) {
  const b = blick;
  const koerper = (farbe, flecken) => `<ellipse cx="${x}" cy="${y - 14 * s}" rx="${24 * s}" ry="${10 * s}" fill="${farbe}" stroke="${T}" stroke-width="1.1"/>
    <path d="M${x - 16 * s} ${y - 8 * s}v${8 * s}M${x - 8 * s} ${y - 6 * s}v${6 * s}M${x + 10 * s} ${y - 6 * s}v${6 * s}M${x + 17 * s} ${y - 8 * s}v${8 * s}" stroke="${T}" stroke-width="${3 * s}" stroke-linecap="round"/>
    <path d="M${x - b * 22 * s} ${y - 16 * s}q${-b * 14 * s} ${-4 * s} ${-b * 16 * s} ${-16 * s}" stroke="${farbe}" stroke-width="${3 * s}" fill="none"/>
    <circle cx="${x + b * 26 * s}" cy="${y - 22 * s}" r="${8 * s}" fill="${farbe}" stroke="${T}" stroke-width="1"/><circle cx="${x + b * 29 * s}" cy="${y - 24 * s}" r="${1.2 * s}" fill="${T}"/>` + (flecken || '');
  if (art === 'pardel') return koerper('#d9a441', Array.from({ length: 9 }, (_, i) => `<circle cx="${x - 18 * s + i * 4.5 * s}" cy="${y - 14 * s + Math.sin(i * 2) * 4 * s}" r="${1.6 * s}" fill="${T}"/>`).join(''));
  if (art === 'loewe') return koerper('#c58a3e') + `<circle cx="${x + b * 26 * s}" cy="${y - 22 * s}" r="${12 * s}" fill="#8a5424" stroke="${T}" stroke-width="1" opacity="0.9"/><circle cx="${x + b * 27 * s}" cy="${y - 22 * s}" r="${6.5 * s}" fill="#c58a3e"/><circle cx="${x + b * 29 * s}" cy="${y - 23 * s}" r="${1.2 * s}" fill="${T}"/>`;
  if (art === 'woelfin') return `<ellipse cx="${x}" cy="${y - 14 * s}" rx="${24 * s}" ry="${6 * s}" fill="#7d7468" stroke="${T}" stroke-width="1.1"/>
    <path d="M${x - 18 * s} ${y - 10 * s}v${10 * s}M${x - 9 * s} ${y - 9 * s}v${9 * s}M${x + 10 * s} ${y - 9 * s}v${9 * s}M${x + 18 * s} ${y - 10 * s}v${10 * s}" stroke="${T}" stroke-width="${2.4 * s}"/>
    <path d="M${x + b * 22 * s} ${y - 16 * s}l${b * 16 * s} ${-6 * s}l${b * -2 * s} ${8 * s}z" fill="#7d7468" stroke="${T}"/><path d="M${x + b * 26 * s} ${y - 20 * s}l${b * 2 * s} ${-8 * s}" stroke="${T}" stroke-width="1.4"/>
    <path d="M${x - 10 * s} ${y - 14 * s}h${20 * s}M${x - 8 * s} ${y - 17 * s}h${16 * s}" stroke="#5a5248" stroke-width="0.8"/>`;
  if (art === 'cerberus') {
    let o = `<ellipse cx="${x}" cy="${y - 20 * s}" rx="${32 * s}" ry="${16 * s}" fill="#3b3330" stroke="${T}" stroke-width="1.2"/>`;
    [-18, 0, 18].forEach((dx, i) => {
      o += `<path d="M${x + dx * s} ${y - 30 * s}l${dx * 0.4 * s} ${-20 * s}" stroke="#3b3330" stroke-width="${9 * s}"/>`;
      o += `<g class="cerberus-kopf k${i}"><circle cx="${x + dx * 1.4 * s}" cy="${y - 54 * s}" r="${10 * s}" fill="#3b3330" stroke="${T}" stroke-width="1"/><path d="M${x + dx * 1.4 * s - 7 * s} ${y - 50 * s}h${14 * s}l${-2 * s} ${6 * s}h${-10 * s}z" fill="${ROT}" stroke="${T}" stroke-width="0.8"/><circle cx="${x + dx * 1.4 * s - 3 * s}" cy="${y - 57 * s}" r="${1.6 * s}" fill="#f3c03a"/><circle cx="${x + dx * 1.4 * s + 3 * s}" cy="${y - 57 * s}" r="${1.6 * s}" fill="#f3c03a"/></g>`;
    });
    return o + `<path d="M${x - 24 * s} ${y - 8 * s}v${8 * s}M${x + 24 * s} ${y - 8 * s}v${8 * s}" stroke="${T}" stroke-width="${4 * s}"/>`;
  }
  if (art === 'geryon') {
    return `<path d="M${x - 70 * s} ${y - 10 * s}Q${x - 40 * s} ${y - 40 * s} ${x} ${y - 30 * s}Q${x + 30 * s} ${y - 22 * s} ${x + 50 * s} ${y - 36 * s}" stroke="#6c7c3a" stroke-width="${16 * s}" fill="none" stroke-linecap="round"/>
    <path d="M${x - 70 * s} ${y - 10 * s}Q${x - 40 * s} ${y - 40 * s} ${x} ${y - 30 * s}Q${x + 30 * s} ${y - 22 * s} ${x + 50 * s} ${y - 36 * s}" stroke="#c9a43a" stroke-width="${2 * s}" fill="none" stroke-dasharray="${5 * s} ${5 * s}"/>
    <path d="M${x - 70 * s} ${y - 10 * s}l${-16 * s} ${10 * s}l${4 * s} ${-14 * s}z" fill="#6c7c3a" stroke="${T}"/>
    <path d="M${x - 12 * s} ${y - 36 * s}q${-18 * s} ${-30 * s} ${-36 * s} ${-12 * s}q${16 * s} ${-2 * s} ${22 * s} ${16 * s}" fill="#4f5a2a" stroke="${T}"/>
    ${kopf(x + 56 * s, y - 44 * s, s * 1.6, 1, '#c9b88a')}<path d="M${x + 49 * s} ${y - 38 * s}q${7 * s} ${10 * s} ${14 * s} 0" fill="#d9cfb5" stroke="${T}" stroke-width="0.6"/>`;
  }
  if (art === 'kentaur') {
    return `<ellipse cx="${x}" cy="${y - 16 * s}" rx="${20 * s}" ry="${9 * s}" fill="#8a5a34" stroke="${T}" stroke-width="1.1"/>
    <path d="M${x - 14 * s} ${y - 10 * s}v${10 * s}M${x - 6 * s} ${y - 9 * s}v${9 * s}M${x + 8 * s} ${y - 9 * s}v${9 * s}M${x + 15 * s} ${y - 10 * s}v${10 * s}" stroke="${T}" stroke-width="${2.6 * s}"/>
    <path d="M${x + b * 14 * s} ${y - 20 * s}L${x + b * 16 * s} ${y - 40 * s}" stroke="${HAUT}" stroke-width="${8 * s}"/>${kopf(x + b * 16 * s, y - 46 * s, s, b, '#3a2a1a')}
    <path d="M${x + b * 22 * s} ${y - 52 * s}q${b * 8 * s} ${14 * s} 0 ${26 * s}" stroke="#5a3a22" stroke-width="1.6" fill="none"/>`;
  }
  return '';
}

function daemon(x, y, s = 1, blick = 1) {
  return `<g class="fig-daemon"><path d="M${x - 6 * s} ${y - 30 * s}Q${x - 30 * s} ${y - 50 * s} ${x - 34 * s} ${y - 26 * s}Q${x - 24 * s} ${y - 34 * s} ${x - 18 * s} ${y - 22 * s}Q${x - 14 * s} ${y - 30 * s} ${x - 6 * s} ${y - 22 * s}Z" fill="#2b2523" stroke="${T}" stroke-width="0.8"/>
  <path d="M${x - 7 * s} ${y}L${x - 6 * s} ${y - 32 * s}L${x + 6 * s} ${y - 32 * s}L${x + 7 * s} ${y}Z" fill="#1f1a18" stroke="${T}"/>
  <circle cx="${x}" cy="${y - 38 * s}" r="${6 * s}" fill="#1f1a18" stroke="${T}"/><path d="M${x - 4 * s} ${y - 43 * s}l${-3 * s} ${-7 * s}M${x + 4 * s} ${y - 43 * s}l${3 * s} ${-7 * s}" stroke="#1f1a18" stroke-width="${2 * s}"/>
  <circle cx="${x + blick * 2.5 * s}" cy="${y - 39 * s}" r="${1.2 * s}" fill="#e33"/>
  <path d="M${x + blick * 6 * s} ${y - 28 * s}L${x + blick * 18 * s} ${y - 52 * s}M${x + blick * 18 * s} ${y - 52 * s}l${blick * 4 * s} ${3 * s}l${-blick * 1 * s} ${4 * s}" stroke="#5c4a3a" stroke-width="${2 * s}" fill="none"/></g>`;
}

function riese(x, y, s = 1) {
  return `<path d="M${x - 26 * s} ${y}L${x - 22 * s} ${y - 60 * s}Q${x} ${y - 70 * s} ${x + 22 * s} ${y - 60 * s}L${x + 26 * s} ${y}Z" fill="#a08a70" stroke="${T}" stroke-width="1.2"/>` + kopf(x, y - 76 * s, s * 2.2, 0, '#4a3a2a');
}

function luzifer(x, y, s = 1) {
  const fl = (d) => `<path d="M${x} ${y - 70 * s}Q${x + d * 60 * s} ${y - 120 * s} ${x + d * 110 * s} ${y - 80 * s}Q${x + d * 90 * s} ${y - 70 * s} ${x + d * 96 * s} ${y - 46 * s}Q${x + d * 70 * s} ${y - 58 * s} ${x + d * 64 * s} ${y - 36 * s}Q${x + d * 40 * s} ${y - 54 * s} ${x} ${y - 50 * s}Z" fill="#2a2120" stroke="${T}" stroke-width="1"/>`;
  return fl(-1) + fl(1) + `<path d="M${x - 30 * s} ${y}L${x - 26 * s} ${y - 60 * s}Q${x} ${y - 70 * s} ${x + 26 * s} ${y - 60 * s}L${x + 30 * s} ${y}Z" fill="#3a2e2a" stroke="${T}" stroke-width="1.2"/>
  <circle cx="${x}" cy="${y - 78 * s}" r="${12 * s}" fill="${ROT}" stroke="${T}"/><circle cx="${x - 20 * s}" cy="${y - 72 * s}" r="${10 * s}" fill="#e6d77a" stroke="${T}"/><circle cx="${x + 20 * s}" cy="${y - 72 * s}" r="${10 * s}" fill="#1a1414" stroke="${T}"/>
  <path d="M${x - 5 * s} ${y - 72 * s}h${10 * s}M${x - 24 * s} ${y - 67 * s}h${8 * s}M${x + 16 * s} ${y - 67 * s}h${8 * s}" stroke="${T}" stroke-width="1.4"/>
  ${seele(x - 2 * s, y - 64 * s, s * 0.6, 'fallen')}`;
}

function eisflaeche(y) { return `<rect x="0" y="${y}" width="400" height="${260 - y}" fill="#c9d6e2"/><path d="M0 ${y}H400" stroke="#8ea4bb" stroke-width="2"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${i * 55} ${y + 8}l30 ${10 + i % 3 * 6}l-12 18" fill="none" stroke="#9fb3c7" stroke-width="1"/>`).join(''); }
function koepfeImEis(n, x0, x1, y) { let o = ''; for (let i = 0; i < n; i++) o += seele(x0 + (x1 - x0) * i / Math.max(1, n - 1), y + (i % 2) * 6, 1, 'kopf', '#c8c3bd'); return o; }
function regen(dichte = 40) { let o = ''; for (let i = 0; i < dichte; i++) { const x = (i * 97) % 400, y = (i * 53) % 220; o += `<path d="M${x} ${y}l-6 16" stroke="#cfd8df" stroke-width="1.2" opacity="0.7"/>`; } return o; }
function feuerregen(dichte = 26) { let o = ''; for (let i = 0; i < dichte; i++) { const x = (i * 83) % 400, y = (i * 61) % 180; o += `<path d="M${x} ${y}l-3 9" stroke="#f3a73a" stroke-width="2.4" stroke-linecap="round"/><path d="M${x - 3} ${y + 9}l-1 3" stroke="#f6d35a" stroke-width="2"/>`; } return o; }
function wind() { return Array.from({ length: 5 }, (_, i) => `<path d="M${-20 + i * 30} ${50 + i * 26}Q${120} ${10 + i * 30} ${220} ${60 + i * 20}T${420} ${40 + i * 30}" fill="none" stroke="#e9dccb" stroke-width="1.4" opacity="0.55"/>`).join(''); }
function sterne(n = 40) { let o = '', z = 7; const r = () => (z = (z * 16807) % 2147483647) / 2147483647; for (let i = 0; i < n; i++) { const x = r() * 400, y = r() * 175, g = 0.6 + r() * 1.6; o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${g.toFixed(2)}" fill="#f4e7b0"/>`; } return o; }
function graben(farbe, inhalt = '') { return `<path d="M0 150Q200 130 400 150V260H0Z" fill="#6b5a48" stroke="${T}"/><path d="M30 170Q200 150 370 170L350 250H50Z" fill="${farbe}" stroke="${T}" stroke-width="1.2"/>${inhalt}<path d="M150 120Q200 95 250 120" fill="none" stroke="#9a8f80" stroke-width="10"/><path d="M150 120Q200 95 250 120" fill="none" stroke="${T}" stroke-width="1"/>`; }

// --- Szenen -------------------------------------------------------------------
const SZENEN = {
  titel: id => grund('lapis', id) + felsen(120, 140, 160, 100, '#6e5e4a', '#a8977a') + paar(190, 150, 1.2),
  wald: id => grund('nacht', id) + boden(222, '#1a2214', '#24301c') + [[20, 200, 1.6], [70, 190, 1.4], [120, 205, 1.7], [165, 188, 1.3], [250, 196, 1.6], [300, 186, 1.4], [345, 204, 1.8], [390, 192, 1.5], [40, 240, 1.9], [105, 246, 1.6], [280, 248, 2], [370, 244, 1.7]].map(([x, y, g]) => baum(x, y, g, 'dunkel')).join('') + dante(205, 244, 0.95, 1) + baum(232, 258, 1.6, 'dunkel'),
  huegel: id => grund('gold', id) + felsen(170, 40, 230, 190, '#8a7a63') + `<circle cx="330" cy="40" r="18" fill="#f6d35a" stroke="${T}"/>` + boden(225, '#3e4a2a', '#56653a') + tier('pardel', 250, 200, 0.9) + tier('loewe', 310, 160, 0.9) + tier('woelfin', 230, 130, 0.9) + dante(110, 238, 1, 1),
  vergil: id => grund('gold', id) + felsen(250, 80, 150, 150, '#8a7a63') + boden(225, '#3e4a2a', '#56653a') + dante(160, 240, 1.1, 1) + vergil(235, 240, 1.1, -1),
  tor: id => grund('nacht', id) + felsen(0, 60, 400, 200, '#4a3e33', '#6e604f') + `<path d="M140 240V110Q200 50 260 110V240Z" fill="#120c0a" stroke="${T}" stroke-width="2"/><path d="M128 240V108Q200 30 272 108V240" fill="none" stroke="#7a6a58" stroke-width="10"/>` +
    `<rect x="130" y="58" width="140" height="22" fill="#e9dcc0" stroke="${T}"/><path d="M138 66h124M138 72h100" stroke="${ROT}" stroke-width="1.5"/>` + paar(90, 245, 1, 1),
  vorhoelle: id => grund('nacht', id) + boden(205, '#3b3128', '#4d4135') + `<path d="M330 90L330 60L370 66L330 74" fill="#e9e4d8" stroke="${T}"/><path d="M330 60V120" stroke="${T}" stroke-width="1.5"/>` + seelen(9, 60, 360, 200, 0.9, 'gebeugt', 10) + regen(18).replace(/#cfd8df/g, '#d8c46a') + paar(40, 250, 0.9, 1),
  acheron: id => grund('nacht', id) + wasser(160, '#2a3a40', '#5f7d86') + felsen(0, 120, 120, 60, '#4a3e33', '#6e604f') + seelen(6, 20, 110, 150, 0.7, 'stehen', 4) + boot(250, 190, true),
  limbus: id => grund('gold', id) + boden(200, '#5f7f3c', '#7fa44f') + `<g>${[0, 1, 2].map(i => `<rect x="${140 + i * 10}" y="${80 + i * 14}" width="${120 - i * 20}" height="${120 - i * 14}" fill="none" stroke="#7a6a58" stroke-width="5"/>`).join('')}<rect x="175" y="60" width="50" height="80" fill="#cdbf9c" stroke="${T}"/><path d="M170 60l30 -26l30 26z" fill="${ROT}" stroke="${T}"/></g>` + wasser(232, '#5c86a8', '#bcd3e5') + vergil(70, 228, 0.8, 1) + dante(50, 228, 0.8, 1) + [300, 325, 350, 375].map((x, i) => vergil(x, 226, 0.75, -1).replace(new RegExp(BLAU, 'g'), ['#6b4a8c', '#7a3a2a', '#3a6a4a', '#8a6a2a'][i])).join(''),
  minos: id => grund('feuer', id) + felsen(0, 140, 400, 120, '#4a3e33', '#6e604f') + `<path d="M210 140L208 70L248 70L252 140Z" fill="#3a2e2a" stroke="${T}"/><circle cx="230" cy="60" r="12" fill="#c8a986" stroke="${T}"/><path d="M218 54l-6 -10M242 54l6 -10" stroke="${T}" stroke-width="2.5"/><path d="M250 120Q300 150 270 170Q240 190 290 210Q330 230 300 245" fill="none" stroke="#3a2e2a" stroke-width="7"/>` + seelen(4, 120, 190, 150, 0.8, 'gebeugt', 4) + paar(60, 250, 0.9, 1),
  sturm: id => grund('nacht', id) + wind() + `<g class="treibend">${seele(120, 90, 0.8, 'fallen')}${seele(160, 70, 0.8, 'fallen')}${seele(260, 120, 0.8, 'fallen')}${seele(300, 60, 0.7, 'fallen')}${seele(210, 150, 0.8, 'fallen')}</g>` + `<g class="paar-francesca">${seele(330, 140, 0.9, 'fallen', '#f1e3d3')}${seele(345, 132, 0.9, 'fallen', '#e7d6c3')}</g>` + felsen(0, 200, 160, 60, '#4a3e33', '#6e604f') + paar(50, 212, 0.9, 1),
  cerberus: id => grund('nacht', id) + `<rect x="0" y="190" width="400" height="70" fill="#4a3a2a"/>` + regen(46) + tier('cerberus', 250, 200, 1.2) + seelen(4, 40, 160, 236, 0.9, 'liegen', 6) + paar(80, 210, 0.85, 1),
  regen: id => grund('nacht', id) + `<rect x="0" y="180" width="400" height="80" fill="#4a3a2a"/>` + regen(60) + seelen(6, 40, 360, 230, 0.9, 'liegen', 8) + seele(200, 200, 0.9, 'gebeugt') + paar(300, 205, 0.85, -1),
  lasten: id => grund('gold', id) + `<rect x="0" y="170" width="400" height="90" fill="#7a6a58"/>` + [60, 150, 250, 340].map((x, i) => `<circle cx="${x + (i < 2 ? 14 : -14)}" cy="200" r="16" fill="#5a524a" stroke="${T}" stroke-width="1.2"/>` + seele(x + (i < 2 ? -6 : 6), 225, 0.8, 'gebeugt')).join('') + `<path d="M200 150v100" stroke="${ROT}" stroke-width="2" stroke-dasharray="4 4"/>` + paar(190, 160, 0.7, 1),
  styx: id => grund('nacht', id) + wasser(150, '#2e3a2c', '#56664e') + seelen(5, 30, 380, 175, 0.8, 'kopf', 4, '#8a7a5a') + `<path d="M330 40v70" stroke="#5a3a22" stroke-width="10"/><rect x="320" y="30" width="20" height="16" fill="#f3a73a"/>` + boot(150, 190, true) + dante(140, 180, 0.7, 1) + vergil(120, 180, 0.7, 1),
  dis: id => grund('feuer', id) + wasser(200, '#2e3a2c', '#56664e') + stadt(60, 200, 290) + [140, 200, 260].map(x => `<path d="M${x - 5} 112v-14h10v14" fill="#2b2523"/><circle cx="${x}" cy="94" r="5" fill="#2b2523"/>`).join('') + boot(110, 230, false) + paar(110, 222, 0.7, 1),
  furien: id => grund('feuer', id) + stadt(0, 260, 400) + [120, 200, 280].map(x => `<path d="M${x - 10} 170L${x - 6} 120L${x + 6} 120L${x + 10} 170Z" fill="#6b1a12" stroke="${T}"/><circle cx="${x}" cy="112" r="8" fill="#c8a986" stroke="${T}"/><path d="M${x - 8} 106q-6 -10 -2 -16M${x + 8} 106q6 -10 2 -16M${x} 104q0 -12 4 -16" stroke="#4a7a3a" stroke-width="2.2" fill="none"/>`).join(''),
  graeber: id => grund('feuer', id) + `<rect x="0" y="150" width="400" height="110" fill="#5a4a3a"/>` + grab(60, 200) + grab(170, 240) + grab(300, 210) + grab(380, 250) + `<g>${seele(170, 222, 0.8, 'stehen')}</g>` + paar(240, 175, 0.7, 1),
  blutfluss: id => grund('gold', id) + wasser(170, '#7a1c16', '#c24a3a') + seelen(4, 60, 340, 195, 0.8, 'kopf', 6, '#d9bfa8') + tier('kentaur', 120, 165, 0.9, 1) + tier('kentaur', 230, 165, 0.9, -1) + tier('kentaur', 330, 165, 0.8, -1),
  dornenwald: id => grund('nacht', id) + boden(225, '#3b2e22', '#4d3e2e') + baum(50, 230, 1.3, 'dorn') + baum(130, 236, 1.1, 'dorn') + baum(270, 232, 1.4, 'dorn') + baum(350, 228, 1.2, 'dorn') + `<g>${[90, 310].map(x => `<path d="M${x - 16} 70q16 -12 32 0q-16 4 -32 0z" fill="#3a2e2a"/><circle cx="${x}" cy="64" r="6" fill="#c8a986" stroke="${T}"/>`).join('')}</g>` + paar(190, 245, 0.9, 1),
  sand: id => grund('nacht', id) + `<rect x="0" y="160" width="400" height="100" fill="#c9a96a"/>` + feuerregen(34) + seelen(4, 220, 380, 235, 0.8, 'liegen', 6) + seelen(3, 230, 360, 200, 0.8, 'gebeugt', 4) + `<path d="M0 160L120 160L110 260L0 260Z" fill="#7a6a58" stroke="${T}"/>` + paar(40, 168, 0.75, 1),
  geryon: id => grund('nacht', id) + `<path d="M260 0v260" stroke="#9db7cf" stroke-width="24" opacity="0.7"/><path d="M252 0v260M268 0v260" stroke="#e7eef4" stroke-width="2" opacity="0.6"/>` + tier('geryon', 150, 160, 1.3) + felsen(0, 170, 200, 90, '#4a3e33', '#6e604f'),
  malebolge: id => grund('nacht', id) + `${[0, 1, 2, 3, 4].map(i => `<path d="M${10 + i * 18} ${100 + i * 30}Q200 ${80 + i * 30} ${390 - i * 18} ${100 + i * 30}" fill="none" stroke="#6b5a48" stroke-width="12"/><path d="M${10 + i * 18} ${100 + i * 30}Q200 ${80 + i * 30} ${390 - i * 18} ${100 + i * 30}" fill="none" stroke="${T}" stroke-width="1"/>`).join('')}<path d="M200 70V250" stroke="#9a8f80" stroke-width="14"/><path d="M200 70V250" stroke="${T}" stroke-width="1" stroke-dasharray="10 6"/>` + paar(200, 92, 0.6, 1),
  peitsche: id => grund('gold', id) + graben('#6b5a48', seelen(5, 80, 320, 230, 0.8, 'stehen', 4) + daemon(140, 215, 0.9, 1) + daemon(280, 215, 0.9, -1)) + paar(185, 118, 0.6, 1),
  kot: id => grund('nacht', id) + graben('#5a4a1e', seelen(5, 80, 320, 236, 0.8, 'kopf', 5, '#a08a5a')) + paar(185, 118, 0.6, 1),
  simonie: id => grund('gold', id) + `<rect x="0" y="150" width="400" height="110" fill="#8a7a63"/>` + [70, 160, 250, 340].map(x => `<ellipse cx="${x}" cy="205" rx="18" ry="7" fill="#1a1210" stroke="${T}"/><path d="M${x - 4} 205v-24M${x + 4} 205v-22" stroke="${SEELE}" stroke-width="4"/>` + flamme(x - 4, 182, 14) + flamme(x + 4, 184, 12)).join('') + paar(150, 150, 0.7, 1),
  wahrsager: id => grund('gold', id) + graben('#6b5a48', [90, 150, 210, 270, 330].map(x => seele(x, 236, 0.85, 'stehen') + `<path d="M${x - 4} ${236 - 33 * 0.85 - 2}l-4 3" stroke="${T}"/>`).join('')) + paar(185, 118, 0.6, 1),
  pech: id => grund('nacht', id) + graben('#141010', seelen(3, 120, 300, 228, 0.9, 'kopf', 4, '#5a4a40')) + daemon(60, 160, 1, 1) + daemon(100, 156, 0.9, 1) + daemon(330, 160, 1, -1) + paar(200, 118, 0.6, 1),
  heuchler: id => grund('gold', id) + graben('#6b5a48', [80, 150, 220, 290].map(x => `<path d="M${x - 12} 240L${x - 10} 196Q${x} 184 ${x + 10} 196L${x + 12} 240Z" fill="#d9b44a" stroke="${T}" stroke-width="1.2"/><circle cx="${x}" cy="194" r="5" fill="${HAUT}" stroke="${T}"/>`).join('') + seele(340, 236, 0.9, 'liegen')) + paar(185, 118, 0.6, 1),
  schlangen: id => grund('nacht', id) + graben('#5a4a3a', [100, 200, 300].map(x => seele(x, 236, 0.85, 'stehen') + `<path d="M${x - 14} 230q10 -20 0 -30q-10 -10 4 -20" stroke="#3d6a3a" stroke-width="4" fill="none"/>`).join('')) + paar(185, 118, 0.6, 1),
  flammen: id => grund('nacht', id) + graben('#2a1a14', flammenReihe(6, 70, 340, 240, 34) + `<path d="M190 240Q200 190 210 160Q214 190 230 240Z" fill="${ROT}" stroke="${T}"/><path d="M200 240Q205 200 213 172Q214 205 222 240Z" fill="#e8812c"/>`) + paar(160, 118, 0.6, 1),
  zerspalten: id => grund('feuer', id) + graben('#5a3a2a', seelen(4, 80, 320, 236, 0.85, 'stehen', 4) + daemon(60, 230, 0.9, 1)) + `<g>${seele(250, 140, 0.9, 'stehen')}<circle cx="262" cy="126" r="5" fill="${SEELE}" stroke="${T}"/></g>` + paar(170, 118, 0.6, 1),
  faelscher: id => grund('nacht', id) + graben('#4a4036', seelen(6, 70, 330, 236, 0.85, 'liegen', 5, '#c9b89a')) + paar(185, 118, 0.6, 1),
  riesen: id => grund('nacht', id) + `<ellipse cx="200" cy="230" rx="190" ry="40" fill="#1a1210" stroke="${T}"/>` + riese(80, 230, 1) + riese(200, 240, 1.15) + riese(320, 232, 1) + paar(200, 120, 0.5, 1),
  eis: id => grund('eis', id) + eisflaeche(170) + koepfeImEis(8, 30, 370, 180) + paar(200, 172, 0.75, 1),
  ugolino: id => grund('eis', id) + eisflaeche(170) + seele(190, 182, 1.2, 'kopf', '#c8c3bd') + seele(206, 178, 1.2, 'kopf', '#d5cfc8') + koepfeImEis(4, 40, 140, 186) + paar(300, 172, 0.75, -1),
  luzifer: id => grund('eis', id) + eisflaeche(200) + luzifer(200, 230, 1.1) + paar(340, 202, 0.55, -1),
  sterne: id => grund('sterne', id) + sterne(60) + felsen(0, 200, 400, 60, '#2a2620', '#3e3830') + paar(200, 230, 0.7, 1),
  stille: id => grund('nacht', id),
};

export function zeichne(name) {
  const id = ++zaehler;
  const szene = SZENEN[name] || SZENEN.stille;
  return `<svg viewBox="0 0 400 260" class="bild" role="img" aria-label="Miniatur" preserveAspectRatio="xMidYMid slice">${defs(id)}${szene(id)}
  <rect x="3" y="3" width="394" height="254" fill="none" stroke="${GOLD}" stroke-width="3"/><rect x="0.5" y="0.5" width="399" height="259" fill="none" stroke="${BLAU2}" stroke-width="1"/></svg>`;
}

export const SZENEN_NAMEN = Object.keys(SZENEN);

// --- Karte: der Trichter -------------------------------------------------------
const EBENEN = [
  ['W', 'Der dunkle Wald'], ['V', 'Vorhölle'], ['1', 'Limbus'], ['2', 'Wollust'], ['3', 'Völlerei'], ['4', 'Geiz und Verschwendung'],
  ['5', 'Zorn · Styx'], ['D', 'Stadt Dis'], ['6', 'Ketzer'], ['7', 'Gewalt'], ['8', 'Betrug · Übelbulgen'], ['9', 'Verrat · Kokytos'],
];
export function zeichneKarte(aktiv, stand) {
  const hoehe = 26, top = 20;
  const besucht = new Set();
  if (stand && stand.gesehen) for (const k of Object.keys(stand.gesehen)) besucht.add(k.split(':')[0]);
  const idx = EBENEN.findIndex(e => e[0] === String(aktiv));
  let o = `<svg viewBox="0 0 400 ${top + EBENEN.length * hoehe + 46}" class="karte" role="img" aria-label="Karte der Hölle">`;
  EBENEN.forEach(([k, name], i) => {
    const y = top + i * hoehe, halb = 180 - i * 13;
    const erreicht = idx >= 0 && i <= idx;
    o += `<path d="M${200 - halb} ${y}L${200 + halb} ${y}L${200 + halb - 13} ${y + hoehe}L${200 - halb + 13} ${y + hoehe}Z" fill="${i === idx ? '#e8c9a0' : erreicht ? '#d9c5a3' : '#efe4cf'}" stroke="#5a4632" stroke-width="${i === idx ? 2 : 0.8}" opacity="${erreicht ? 1 : 0.55}"/>`;
    o += `<text x="200" y="${y + 17}" text-anchor="middle" font-size="12" fill="${i === idx ? ROT : '#3b2a1c'}" font-family="inherit">${k.match(/\d/) ? k + '. ' : ''}${name}</text>`;
    if (i === idx) o += `<circle cx="${200 + halb + 8}" cy="${y + 13}" r="5" fill="${ROT}" stroke="${T}"/><circle cx="${200 - halb - 8}" cy="${y + 13}" r="5" fill="${ROT}" stroke="${T}"/>`;
  });
  const yE = top + EBENEN.length * hoehe;
  o += `<path d="M190 ${yE}L200 ${yE + 22}L210 ${yE}Z" fill="#3a2e2a"/><text x="200" y="${yE + 38}" text-anchor="middle" font-size="12" fill="#3b2a1c">Luzifer · Mitte der Erde</text></svg>`;
  void besucht;
  return o;
}
