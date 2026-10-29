// Prüft, ob jeder als Büchner markierte Satz ({…}) wörtlich in der modernisierten Quelle steht.
// Aufruf: node tools/pruefe-buechner.mjs   (Teil der Tests, hier zum schnellen Nachsehen)
import { ladeInhalt, ladeQuelle } from "./lade.mjs";
import { buechnerSpannen } from "../js/engine.js";
import { vergleichsform } from "./modernisierung.mjs";

export function fehlendeSpannen(inhalt, quelle) {
  const q = vergleichsform(quelle);
  const fehlt = [];
  const besuche = (knoten, szene) => {
    for (const k of knoten) {
      if (k.typ === "block") for (const s of buechnerSpannen(k.text)) if (!q.includes(vergleichsform(s))) fehlt.push({ szene, s });
      if (k.typ === "option") for (const s of buechnerSpannen(k.text)) if (!q.includes(vergleichsform(s))) fehlt.push({ szene, s });
      for (const unter of [k.kinder, k.optionen, ...(k.zweige ?? []).map((z) => z.kinder)]) if (unter) besuche(unter, szene);
    }
  };
  for (const s of inhalt.szenen) besuche(s.kinder, s.id);
  return fehlt;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fehlt = fehlendeSpannen(ladeInhalt({ nurVorhandene: true }), ladeQuelle());
  for (const f of fehlt) console.log(`${f.szene}: ${f.s}`);
  console.log(fehlt.length ? `${fehlt.length} Stellen nicht in der Quelle` : "alle Büchner-Stellen gefunden");
  process.exit(fehlt.length ? 1 : 0);
}
