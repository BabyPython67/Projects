// Balance-Simulation: lässt die Bot-Stile viele Nächte spielen und druckt Sieg- und Fortschrittswerte.
// Aufruf: node moorlicht/tools/simulation.js [Anzahl] [Laterne] [Mondphase]
const M = require("../js/engine.js");
const { spielen, STILE } = require("../tests/bot.js");

const anzahl = Number(process.argv[2]) || 400;
const laterne = process.argv[3] || "sturm";
const mondphase = Number(process.argv[4]) || 0;
const voll = M.neueMeta();
voll.freigeschaltet = M.I.FREISCHALTUNGEN.map((f) => f.id).concat(["gebunden"]);

for (const [name, meta] of [["ohne Freischaltungen", M.neueMeta()], ["alles freigeschaltet", voll]]) {
  console.log(`\n${laterne}, Mondphase ${mondphase}, ${name}, ${anzahl} Nächte je Stil`);
  for (const stil of Object.keys(STILE)) {
    let siege = 0, region = 0, bestanden = 0, schritte = 0, erloschen = 0, waechter = [0, 0, 0];
    for (let s = 1; s <= anzahl; s++) {
      const run = spielen(M.neuerLauf({ seed: s * 7919, laterne, mondphase, meta }), stil);
      if (run.ende.sieg) siege++;
      region += run.region;
      bestanden += run.statistik.bestanden;
      schritte += run.statistik.schritte;
      erloschen += run.statistik.erloschen;
      run.statistik.waechter.forEach((_, i) => waechter[i]++);
    }
    const p = (x) => (100 * x / anzahl).toFixed(1).padStart(5) + " %";
    console.log(`  ${stil.padEnd(13)} Sieg ${p(siege)} | Wächter 1/2/3 ${p(waechter[0])} ${p(waechter[1])} ${p(waechter[2])} | ` +
      `Schritte ${(schritte / anzahl).toFixed(1)} | bestanden ${(bestanden / anzahl).toFixed(1)} | erloschen ${(erloschen / anzahl).toFixed(1)}`);
  }
}
