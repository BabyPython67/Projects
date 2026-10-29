// Spielt zwei Durchgänge mit gegensätzlichem Verhalten und zeigt, wo sich der Text unterscheidet:
//   „zuhören“   – Andres fragt nach, bleibt da, hilft (Optionen mit Haltung „zuwenden“)
//   „abwimmeln“ – Andres singt drüber, dreht sich weg, lacht mit (Haltung „abwimmeln“)
// Ausgabe getrennt nach den drei Folgen (offen, kraft, abschied), je Stelle nur Kennung und Wortzahlen,
// nie der Text. Prüft außerdem, dass jede Folge mindestens zwei Stellen um je mindestens 50 Wörter ändert.
// Aufruf aus dem Ordner woyzeck: node tools/durchgaenge.mjs   (Exit-Code 1, wenn die Prüfung scheitert)
import { durchspielen, klartext, buechnerSpannen } from "../js/engine.js";
import { ladeInhalt } from "./lade.mjs";

export const FOLGEN = { offen: "Offenheit (ob er sich dir öffnet)", kraft: "Kräfte (Doktor, Schlaf, Klarheit)", abschied: "Abschied (die Sachen, und was du dann tust)" };
export const SCHWELLE = 50;

export const strategie = (bevorzugt) => (wahl) =>
  (wahl.optionen.find((o) => o.haltung === bevorzugt) ?? wahl.optionen.find((o) => o.haltung === "neutral") ?? wahl.optionen[0]).key;

const tokens = (text) => klartext(text).split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")).filter(Boolean);

function stellenTexte(auswertung) {
  const m = new Map();
  for (const { bloecke } of auswertung.szenen) {
    for (const b of bloecke) {
      if (!b.text || !b.stelle) continue;
      const e = m.get(b.stelle) ?? { folge: b.folge, teile: [] };
      e.teile.push(b.text);
      m.set(b.stelle, e);
    }
  }
  return m;
}

// Anzahl geänderter Wörter: was in A fehlt plus was in B fehlt (Wortfolgen-Vergleich, längste gemeinsame Teilfolge).
export function geaenderteWoerter(a, b) {
  const n = a.length, m = b.length;
  let vorher = new Uint16Array(m + 1), jetzt = new Uint16Array(m + 1);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) jetzt[j] = a[i - 1] === b[j - 1] ? vorher[j - 1] + 1 : Math.max(vorher[j], jetzt[j - 1]);
    [vorher, jetzt] = [jetzt, vorher];
  }
  const lcs = vorher[m];
  return n - lcs + (m - lcs);
}

export function vergleiche(inhalt) {
  const a = durchspielen(inhalt, strategie("zuwenden")).auswertung;
  const b = durchspielen(inhalt, strategie("abwimmeln")).auswertung;
  const ta = stellenTexte(a), tb = stellenTexte(b);
  const ids = [...new Set([...ta.keys(), ...tb.keys()])];
  const stellen = [];
  for (const id of ids) {
    const wa = tokens((ta.get(id)?.teile ?? []).join(" "));
    const wb = tokens((tb.get(id)?.teile ?? []).join(" "));
    const geaendert = geaenderteWoerter(wa, wb);
    if (geaendert === 0) continue;
    stellen.push({ id, folge: ta.get(id)?.folge ?? tb.get(id)?.folge ?? null, woerterA: wa.length, woerterB: wb.length, geaendert });
  }
  const summe = (aus) => aus.szenen.reduce((n, s) => n + s.bloecke.reduce((k, x) => k + (x.text ? tokens(x.text).length : 0), 0), 0);
  const buechner = (aus) => aus.szenen.reduce((n, s) => n + s.bloecke.reduce((k, x) => k + (x.text ? buechnerSpannen(x.text).reduce((j, t) => j + tokens(t).length, 0) : 0), 0), 0);
  return { stellen, woerterA: summe(a), woerterB: summe(b), buechnerA: buechner(a), buechnerB: buechner(b), varsA: a.vars, varsB: b.vars };
}

export function bewerte(ergebnis) {
  const proFolge = {};
  for (const f of Object.keys(FOLGEN)) {
    const s = ergebnis.stellen.filter((x) => x.folge === f).sort((x, y) => y.geaendert - x.geaendert);
    proFolge[f] = { stellen: s, stark: s.filter((x) => x.geaendert >= SCHWELLE).length };
  }
  const ohne = ergebnis.stellen.filter((x) => !FOLGEN[x.folge]);
  const ok = Object.values(proFolge).every((p) => p.stark >= 2) && ohne.length === 0;
  return { proFolge, ohne, ok };
}

export const lesezeit = (woerter, wpm) => Math.round(woerter / wpm);

if (import.meta.url === `file://${process.argv[1]}`) {
  const erg = vergleiche(ladeInhalt());
  const { proFolge, ohne, ok } = bewerte(erg);
  const zeile = (s) => `  ${s.id.padEnd(24)} ${String(s.woerterA).padStart(6)} ${String(s.woerterB).padStart(7)} ${String(s.geaendert).padStart(10)}${s.geaendert >= SCHWELLE ? "  ✓" : ""}`;
  console.log("Durchgang A „zuhören“ gegen B „abwimmeln“: Stellen, an denen sich der Text unterscheidet");
  console.log("(Wörter A / Wörter B = Länge der Stelle im jeweiligen Durchgang, geändert = Wörter, die nur in einem stehen)\n");
  for (const [f, titel] of Object.entries(FOLGEN)) {
    const p = proFolge[f];
    console.log(`Folge ${f}: ${titel}`);
    console.log(`  ${"Stelle".padEnd(24)} ${"Wörter A".padStart(6)} ${"Wörter B".padStart(7)} ${"geändert".padStart(10)}`);
    for (const s of p.stellen) console.log(zeile(s));
    console.log(`  → ${p.stellen.length} Stellen verschieden, ${p.stark} davon um mindestens ${SCHWELLE} Wörter${p.stark >= 2 ? "" : "  ✗ (zu wenig)"}\n`);
  }
  if (ohne.length) { console.log("Stellen ohne Folge (Fehler):"); for (const s of ohne) console.log(zeile(s)); console.log(); }
  console.log(`Wörter gesamt: A „zuhören“ ${erg.woerterA}, B „abwimmeln“ ${erg.woerterB}`);
  const anteil = (b, g) => Math.round((100 * b) / g);
  console.log(`davon von Büchner: A ${erg.buechnerA} (${anteil(erg.buechnerA, erg.woerterA)} %), B ${erg.buechnerB} (${anteil(erg.buechnerB, erg.woerterB)} %)`);
  console.log(`Lesezeit bei 150–200 Wörtern pro Minute: A ${lesezeit(erg.woerterA, 200)}–${lesezeit(erg.woerterA, 150)} min, B ${lesezeit(erg.woerterB, 200)}–${lesezeit(erg.woerterB, 150)} min`);
  console.log(ok ? "Prüfung bestanden: jede Folge ändert mindestens zwei Stellen um je mindestens 50 Wörter." : "Prüfung NICHT bestanden.");
  process.exit(ok ? 0 : 1);
}
