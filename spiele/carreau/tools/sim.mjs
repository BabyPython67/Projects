// Messung: Bot-Partien ohne Grafik. node tools/sim.mjs [schnell]
// Schreibt die Ergebnisse nach docs/messung.md (wird im README zitiert).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { playMatch } from '../src/headless.js';
import { villager, botProfile, VILLAGERS } from '../src/ai.js';
import { Terrain } from '../src/terrain.js';
import { makeBody, simulateThrow } from '../src/physics.js';
import { swayAmp, swayOffset } from '../src/game.js';
import { Rng } from '../src/rng.js';

function player(spec) {
  if (spec.random) return { random: true };
  if (spec.villager) return { profile: villager(spec.villager) };
  return { profile: botProfile(spec.scale ?? 1, spec.opts || {}) };
}

if (!isMainThread) {
  parentPort.on('message', (job) => {
    if (job === null) return process.exit(0);
    const flip = job.i % 2 === 1; // Seiten tauschen, damit der Münzwurf nichts verzerrt
    const ps = [player(job.a), player(job.b)];
    const r = playMatch({ seed: job.seed, players: flip ? [ps[1], ps[0]] : ps, target: job.target });
    const ia = flip ? 1 : 0;
    const feats = {};
    for (const f of r.state.feats) feats[f.id] = (feats[f.id] || 0) + 1;
    parentPort.postMessage({ key: job.key, win: r.winner === ia, pa: r.score[ia], pb: r.score[1 - ia], menes: r.menes, throws: r.throws, feats });
  });
} else {
  const quick = process.argv.includes('schnell');
  const N = (n) => (quick ? Math.max(4, Math.round(n / 5)) : n);
  const exps = [];
  const add = (key, a, b, n, target = 13) => exps.push({ key, a, b, n: N(n), target });

  // (a) Können gegen Zufall
  add('geuebt-vs-zufall', { scale: 1 }, { random: true }, 30);
  add('gleich-vs-gleich', { scale: 1 }, { scale: 1 }, 40);
  for (const sc of [0.5, 2, 4]) add(`sigma${sc}-vs-sigma1`, { scale: sc }, { scale: 1 }, 30);
  // (b) Taktik als eigene Könnens-Schicht: gleiche Hand, anderer Kopf
  add('taktik-vs-naiv', { scale: 1 }, { scale: 1, opts: { naive: true, lofts: ['half'], shootBias: -9, jackShots: false } }, 40);

  // Handgenauigkeit eines Menschen -> gleichwertige Streuung
  function humanSigma(tau, strategy) {
    const rng = new Rng(11);
    const res = {};
    for (const k of ['roll', 'half', 'high', 'shot']) {
      const d = k === 'roll' ? 2.8 : k === 'half' ? 5.6 : 7.6;
      const amp = swayAmp(k, d);
      let sl = 0, st = 0;
      const n = 400;
      for (let i = 0; i < n; i++) {
        const ph = [rng.range(0, 6.283), rng.range(0, 6.283)];
        // Spieler wartet auf den Moment, in dem der Punkt der Mitte am nächsten ist (bis 2,2 s)
        let bestT = 0.3, best = Infinity;
        for (let t = 0.3; t < (strategy === 'erstbester' ? 1.0 : 2.2); t += 0.01) {
          const o = swayOffset(amp, t, ph);
          const m = k === 'shot' ? Math.abs(o.lat) * 2 + Math.abs(o.len) * 0.3 : Math.hypot(o.lat, o.len);
          if (m < best) { best = m; bestT = t; }
        }
        const o = swayOffset(amp, bestT + rng.gauss() * tau, ph);
        sl += o.len * o.len;
        st += o.lat * o.lat;
      }
      const errScale = 0.35 + (0.65 * d) / 8;
      const len = Math.sqrt(sl / n), lat = Math.sqrt(st / n);
      res[k] = Math.sqrt((len * len + (lat / 0.7) ** 2) / 2) / errScale;
    }
    return res;
  }
  const hands = [
    { name: 'Anfänger (±200 ms, nimmt den ersten guten Moment)', tau: 0.2, strategy: 'erstbester' },
    { name: 'Geübt (±100 ms, wartet auf die Mitte)', tau: 0.1, strategy: 'warten' },
    { name: 'Meisterhand (±40 ms, wartet auf die Mitte)', tau: 0.04, strategy: 'warten' },
  ];
  for (const h of hands) h.sigma = humanSigma(h.tau, h.strategy);
  for (const [hi, h] of hands.entries()) {
    for (const v of VILLAGERS) add(`hand${hi}-vs-${v.id}`, { scale: 1, opts: { sigma: h.sigma } }, { villager: v.id }, 12);
  }

  const jobs = [];
  let seed = 5000;
  for (const e of exps) for (let i = 0; i < e.n; i++) jobs.push({ key: e.key, a: e.a, b: e.b, target: e.target, i, seed: seed++ });
  const results = {};
  const t0 = Date.now();
  const workers = Math.min(os.cpus().length, 8);
  let next = 0, done = 0;
  await new Promise((resolve) => {
    for (let w = 0; w < workers; w++) {
      const wk = new Worker(fileURLToPath(import.meta.url), { workerData: {} });
      const feed = () => {
        if (next < jobs.length) wk.postMessage(jobs[next++]);
        else wk.postMessage(null);
      };
      wk.on('message', (r) => {
        (results[r.key] = results[r.key] || []).push(r);
        done++;
        if (done % 20 === 0) process.stderr.write(`${done}/${jobs.length} Partien, ${((Date.now() - t0) / 1000) | 0} s\n`);
        if (done === jobs.length) resolve();
        feed();
      });
      feed();
    }
  });

  const sum = (k) => {
    const rs = results[k] || [];
    const n = rs.length;
    const w = rs.filter((r) => r.win).length;
    const pa = rs.reduce((s, r) => s + r.pa, 0) / n, pb = rs.reduce((s, r) => s + r.pb, 0) / n;
    const menes = rs.reduce((s, r) => s + r.menes, 0) / n;
    return { n, w, rate: (100 * w) / n, pa, pb, menes };
  };
  const pct = (x) => `${Math.round(x)} %`;
  let md = `# Messung (automatisch erzeugt von tools/sim.mjs)\n\nDatum: ${new Date().toISOString().slice(0, 10)} · ${jobs.length} Bot-Partien bis 13 Punkte · Laufzeit ${((Date.now() - t0) / 60000).toFixed(1)} min auf ${workers} Kernen.\n`;
  md += `Jede Paarung spielt abwechselnd mit beiden Anfangsrechten; jede Partie hat einen eigenen Platz (Saat).\n\n`;
  md += `## (a) Können gegen Zufall\n\n| Paarung | Partien | Siege A | Ø Punkte A : B | Ø Aufnahmen |\n|---|---:|---:|---:|---:|\n`;
  const lab = {
    'geuebt-vs-zufall': 'Geübter Bot (Hand wie Madame Roux, volle Taktik) gegen Zufallsspieler',
    'gleich-vs-gleich': 'Geübter Bot gegen identischen Bot (nur Zufall entscheidet)',
    'sigma0.5-vs-sigma1': 'Halbe Streuung (ruhigere Hand) gegen geübten Bot',
    'sigma2-vs-sigma1': 'Doppelte Streuung gegen geübten Bot',
    'sigma4-vs-sigma1': 'Vierfache Streuung gegen geübten Bot',
    'taktik-vs-naiv': 'Volle Taktik gegen naive Taktik (nur halbhoch an die Sau, nie schießen) – gleiche Hand',
  };
  for (const k of Object.keys(lab)) {
    const s = sum(k);
    md += `| ${lab[k]} | ${s.n} | ${s.w} (${pct(s.rate)}) | ${s.pa.toFixed(1)} : ${s.pb.toFixed(1)} | ${s.menes.toFixed(1)} |\n`;
  }
  md += `\n## (b) Handgenauigkeit gegen die Dorfbewohner\n\nDer menschliche Wurf streut nur durch das Timing beim Loslassen des pendelnden Punkts. Aus dem Pendelmodell des Spiels (src/game.js) ergibt sich für jede Timing-Genauigkeit eine gleichwertige Streuung (σ, Meter bei 8 m); ein Bot mit genau dieser Hand und voller Taktik spielt gegen jeden Dorfbewohner.\n\n`;
  md += `| Hand | σ Rollen / Halbhoch / Hoch / Schuss | ${VILLAGERS.map((v) => v.name).join(' | ')} |\n|---|---|${VILLAGERS.map(() => '---:').join('|')}|\n`;
  for (const [hi, h] of hands.entries()) {
    const sg = ['roll', 'half', 'high', 'shot'].map((k) => h.sigma[k].toFixed(2)).join(' / ');
    md += `| ${h.name} | ${sg} | ${VILLAGERS.map((v) => pct(sum(`hand${hi}-vs-${v.id}`).rate)).join(' | ')} |\n`;
  }
  md += `\n(Werte = Siegquote des Bots mit dieser Hand, je ${N(12)} Partien.)\n`;
  // Kunststücke
  const all = Object.values(results).flat().filter((r) => !String(r).includes('zufall'));
  const fc = {};
  for (const r of all) for (const [k, v] of Object.entries(r.feats)) fc[k] = (fc[k] || 0) + v;
  md += `\n## (b) Wie selten sind die Kunststücke?\n\nGezählt in allen ${all.length} Partien (beide Seiten):\n\n| Kunststück | Vorkommen | pro Partie |\n|---|---:|---:|\n`;
  for (const [k, v] of Object.entries(fc).sort((a, b) => b[1] - a[1])) md += `| ${k} | ${v} | ${(v / all.length).toFixed(2)} |\n`;
  // Plätze
  const feat = {};
  const combos = new Set();
  const ends = [];
  for (let sd = 1; sd <= 1500; sd++) {
    const t = new Terrain(sd * 7919);
    const types = [...new Set(t.features.map((f) => f.type))].sort();
    combos.add(types.join('+'));
    for (const ty of types) feat[ty] = (feat[ty] || 0) + 1;
    if (sd <= 300) {
      const r = simulateThrow(t, [], makeBody('boule', 0, 'p'), { x: 2, y: 1.5 }, { x: 2, y: 7.1 }, 'half');
      ends.push([r.thrown.x, r.thrown.y]);
    }
  }
  const mx = ends.reduce((s, e) => s + e[0], 0) / ends.length, my = ends.reduce((s, e) => s + e[1], 0) / ends.length;
  const sx = Math.sqrt(ends.reduce((s, e) => s + (e[0] - mx) ** 2, 0) / ends.length), sy = Math.sqrt(ends.reduce((s, e) => s + (e[1] - my) ** 2, 0) / ends.length);
  md += `\n## (b) Wie verschieden sind die Plätze?\n\n1500 zufällige Plätze: ${combos.size} verschiedene Kombinationen von Merkmalen. Anteil der Plätze mit …\n\n`;
  md += Object.entries(feat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${Math.round((100 * v) / 1500)} %`).join('\n');
  md += `\n\nDerselbe Wurf (halbhoch, Aufsetzpunkt 5,6 m geradeaus) endet auf 300 Plätzen mit einer Streuung von **${(sx * 100).toFixed(0)} cm quer und ${(sy * 100).toFixed(0)} cm längs** – ohne den Boden zu lesen, liegt man daneben.\n`;
  const out = new URL('../docs/messung.md', import.meta.url);
  writeFileSync(out, md);
  console.log(md);
  process.exit(0);
}
