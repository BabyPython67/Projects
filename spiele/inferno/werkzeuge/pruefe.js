// Prüft das Werk: Skripte lesbar, alle Ziele vorhanden, Verse im Bereich,
// alle Gesänge vorkommend, Service-Worker-Liste vollständig, Versionen gleich.
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zerlegeAbschnitt, pruefeWerk } from '../js/skript.js';
import { WERKE } from '../daten/werke.js';

const W = join(dirname(fileURLToPath(import.meta.url)), '..');
export async function ladeAlles() {
  const def = WERKE.inferno;
  const abschnitte = [];
  for (const p of def.abschnitte) abschnitte.push(zerlegeAbschnitt(await readFile(join(W, p), 'utf8'), p));
  const verse = JSON.parse(await readFile(join(W, def.verse), 'utf8')).gesaenge;
  return { def, abschnitte, verse };
}

async function alleDateien(dir) {
  const out = [];
  for (const e of await readdir(join(W, dir), { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await alleDateien(p)); else out.push(p);
  }
  return out;
}

export async function pruefeAlles() {
  const probleme = [];
  const { abschnitte, verse } = await ladeAlles();
  probleme.push(...pruefeWerk(abschnitte, verse));
  const gesaenge = new Set();
  for (const a of abschnitte) for (const k of Object.values(a.knoten)) (k.meta.gesang || []).forEach(g => gesaenge.add(g));
  for (let g = 1; g <= 34; g++) if (!gesaenge.has(g)) probleme.push(`Gesang ${g} kommt nirgends vor (meta gesang)`);
  const sw = await readFile(join(W, 'sw.js'), 'utf8');
  const liste = JSON.parse('[' + /const DATEIEN = \[([\s\S]*?)\];/.exec(sw)[1].replace(/'/g, '"').replace(/,\s*$/, '') + ']');
  const noetig = [...await alleDateien('js'), ...await alleDateien('css'), ...await alleDateien('daten'), ...await alleDateien('icons'), 'index.html', 'manifest.webmanifest'].map(p => relative('.', p));
  for (const d of noetig) if (!liste.includes(d)) probleme.push('Fehlt im Service Worker: ' + d);
  for (const d of liste) if (d !== './' && !noetig.includes(d)) probleme.push('Service Worker nennt nicht vorhandene Datei: ' + d);
  const v1 = /VERSION = '([^']+)'/.exec(sw)[1];
  const v2 = /VERSION = '([^']+)'/.exec(await readFile(join(W, 'js/version.js'), 'utf8'))[1];
  if (v1 !== v2) probleme.push(`Version ungleich: sw.js ${v1}, version.js ${v2}`);
  return probleme;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const p = await pruefeAlles();
  if (p.length) { console.log(p.join('\n')); process.exitCode = 1; } else console.log('Alles in Ordnung.');
}
