// Ein einfacher Spieler für Tests und Simulation. Der Stil bestimmt nur, wie viel Risiko er an
// der Station eingeht; Karte, Fang, Rast und Krämerin spielt er immer gleich.
const M = require("../js/engine.js");
const { ARTEN } = M.I;

const STILE = {
  abwaegend: { gier: 0.2, not: 0.5, zaghaft: false },
  draufgaenger: { gier: 0.65, not: 0.95, zaghaft: false },
  angsthase: { gier: 0, not: 0.1, zaghaft: true }
};

function knotenWert(run, k) {
  const knapp = run.docht <= 2;
  if (k.typ === "rast") return run.docht <= run.dochtMax - 2 ? (knapp ? 10 : 5) : 1;
  if (k.typ === "haendler") return run.glanz >= 8 ? 6 : 2;
  if (k.typ === "fund") return 3;
  if (k.typ === "nebel") return knapp ? 0 : 4;
  return 3.5;
}

function funkeWert(run, id) {
  if (id === "gleichtakt") return 2.5 + run.glas.filter((t) => t === "gleichtakt").length * 0.5;
  return { leuchtkaefer: 5, gebunden: 5, johannis: 3, glutkaefer: 3, mondmotte: 3, nachtfalter: 3.2, funkenflieger: 3, gluehwuermchen: 1.5 }[id] || 1;
}

function stationZug(run, s) {
  const st = run.station;
  if (st.status === "flackert") {
    if (!M.krautNutzen(run, "johanniskraut") && !M.krautNutzen(run, "wachs")) M.erloeschenLassen(run);
    return;
  }
  if (st.status !== "offen") { M.stationAbschliessen(run); return; }
  if (st.stapel.length === 0) { M.weitergehen(run); return; }
  const g = M.gefahr(run);
  const v = M.vorschau(run);
  if (!v.bestanden && v.fehlt <= 3 && g > s.not && M.krautMoeglich(run, "kienspan")) { M.krautNutzen(run, "kienspan"); return; }
  if (!v.bestanden && g > s.not && M.krautMoeglich(run, "wachs")) { M.krautNutzen(run, "wachs"); return; }
  if (v.bestanden) { if (g <= s.gier) M.ziehen(run); else M.weitergehen(run); return; }
  if ((!s.zaghaft && v.schaden >= 2) || g <= s.not) M.ziehen(run); else M.weitergehen(run);
}

function botZug(run, stil) {
  const s = typeof stil === "string" ? STILE[stil] : (stil || STILE.abwaegend);
  switch (run.phase) {
    case "karte": {
      const offen = M.offeneKnoten(run);
      let best = offen[0], bestWert = -1;
      for (const o of offen) {
        const w = knotenWert(run, M.knotenAn(run, o.reihe, o.index));
        if (w > bestWert) { best = o; bestWert = w; }
      }
      M.reisen(run, best.reihe, best.index);
      return;
    }
    case "station": stationZug(run, s); return;
    case "fang": {
      const arten = run.angebot.arten;
      let best = 0;
      arten.forEach((id, i) => { if (funkeWert(run, id) > funkeWert(run, arten[best])) best = i; });
      M.fangen(run, arten.length ? best : null);
      return;
    }
    case "beute": M.beuteWaehlen(run, run.angebot.talismane.length ? 0 : null); return;
    case "rast": {
      const irr = ["irrlicht3", "irrlicht2", "irrlicht1"].find((id) => M.entfernbar(run, id));
      if (run.docht <= run.dochtMax - 2 || !irr) M.rasten(run, "docht");
      else M.rasten(run, "sichten", irr);
      return;
    }
    case "haendler": {
      let gekauft = true;
      while (gekauft) {
        gekauft = false;
        const waren = run.angebot.waren.map((w, i) => ({ w, i })).filter((x) => M.kaufbar(run, x.i));
        waren.sort((a, b) => (b.w.typ === "talisman" ? 9 : funkeWert(run, b.w.id)) - (a.w.typ === "talisman" ? 9 : funkeWert(run, a.w.id)));
        const ware = waren.find((x) => x.w.typ !== "kraut") || waren[0];
        if (ware) { M.kaufen(run, ware.i); gekauft = true; continue; }
        const irr = ["irrlicht3", "irrlicht2"].find((id) => M.entfernbar(run, id));
        if (irr && run.glanz >= M.austreibenKosten(run)) { M.austreiben(run, irr); gekauft = true; }
      }
      M.haendlerVerlassen(run);
      return;
    }
    case "fund": {
      if (run.fund.ergebnis) { M.fundAbschliessen(run); return; }
      const f = M.fundDaten(run.fund);
      const moeglich = f.optionen.map((o, i) => i).filter((i) => M.optionMoeglich(run, f.optionen[i]));
      M.fundWaehlen(run, run.docht <= 2 ? moeglich[moeglich.length - 1] : moeglich[0]);
      return;
    }
    default: return;
  }
}

function spielen(run, stil, maxZuege) {
  const grenze = maxZuege || 20000;
  let n = 0;
  while (run.phase !== "ende" && n++ < grenze) botZug(run, stil);
  if (run.phase !== "ende") throw new Error("Bot steckt fest in Phase " + run.phase);
  return run;
}

module.exports = { STILE, botZug, spielen, funkeWert };
