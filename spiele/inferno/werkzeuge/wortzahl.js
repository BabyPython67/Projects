// Zählt die Wörter des Spieltexts (eigene Prosa ohne Dantes Verse) und der Verse.
import { ladeAlles } from './pruefe.js';
import { fileURLToPath } from 'node:url';
export async function zaehle() {
  const { abschnitte, verse } = await ladeAlles();
  const w = s => (s.match(/[\p{L}\p{N}’'-]+/gu) || []).length;
  let prosa = 0, wahlen = 0, versWoerter = 0, knoten = 0;
  const proAbschnitt = {};
  for (const a of abschnitte) {
    let n = 0;
    for (const k of Object.values(a.knoten)) {
      knoten++;
      for (const t of k.teile) {
        if (t.typ === 'p') n += w(t.text);
        else for (const r of t.refs) versWoerter += verse[r.g - 1].slice(r.a - 1, r.b).reduce((s, z) => s + w(z), 0);
      }
      for (const x of [...k.wahlen, ...k.stimmen]) wahlen += w(x.text);
      if (k.meta.rubrik) n += w(k.meta.rubrik);
    }
    proAbschnitt[a.id] = n; prosa += n;
  }
  return { prosa, wahlen, versWoerter, knoten, proAbschnitt, gesamt: prosa + wahlen };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(await zaehle());
