/* Moorlicht – Spiellogik ohne DOM. Alles Zufällige hängt am Zufallszustand des Laufs (run.rng),
   damit sich Nächte über den Seed wiederholen und testen lassen. Der ganze Lauf ist reines JSON
   und lässt sich jederzeit speichern und fortsetzen. Läuft im Browser und unter Node. */
(function (root, fabrik) {
  if (typeof module === "object" && module.exports) module.exports = fabrik(require("./inhalt.js"));
  else root.Moorlicht = fabrik(root.MoorlichtInhalt);
})(typeof self !== "undefined" ? self : this, function (I) {
  "use strict";
  const { ARTEN, KRAEUTER, TALISMANE, MODS, REGIONEN, WAECHTER, LATERNEN, FUNDE, NOTIZEN, GESPRAECHE, FREISCHALTUNGEN } = I;

  const REGELN = {
    reihen: 4,                 // Reihen je Region vor dem Wächter
    dunkelBasis: [3, 4, 17],   // Dunkel der ersten Reihe je Region (per tools/simulation.js abgestimmt)
    dunkelProReihe: [1, 2, 2],
    taktMax: 4,                // Gleichtakt-Käfer bringen ohne Boni höchstens so viel Licht
    regionIrrlicht: "irrlicht2", // schließt sich beim Betreten einer neuen Region an
    dunkelStreuung: 3,         // 0 bis 2 zusätzlich
    nebelFaktor: 1.3,
    nebelPlus: 1,
    lohn: [2, 3, 4],           // Grundlohn in Glanz je Region
    nebelLohn: 4,
    ueberschussMax: 10,        // so viel Überschuss-Licht wird höchstens zu Glanz
    fehlendJeDocht: 3,         // je angefangene 3 fehlende Licht kostet 1 Docht
    erloschenSchaden: 2,
    rastHeilung: 2,
    waechterHeilung: 2,
    austreibenPreis: 5,
    austreibenAnstieg: 2,
    krautPreis: 3,
    talismanPreis: 10,
    krautPlaetze: 3,
    freilassenGlanz: 1,
    mindestLichtfunken: 3
  };
  const RANG_GEWICHT = { 1: 3, 2: 2, 3: 1 };
  const TYPGEWICHTE = [
    null,
    [["pfad", 5], ["fund", 3], ["haendler", 1], ["rast", 1], ["nebel", 1]],
    [["pfad", 4], ["fund", 2], ["haendler", 2], ["rast", 1], ["nebel", 2]],
    [["pfad", 3], ["fund", 2], ["haendler", 2], ["rast", 2], ["nebel", 2]]
  ];

  /* ---------- Zufall ---------- */
  function zufall(run) { // mulberry32
    let t = (run.rng = (run.rng + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const ganz = (run, n) => Math.floor(zufall(run) * n);
  function mischen(run, liste) {
    for (let i = liste.length - 1; i > 0; i--) {
      const j = ganz(run, i + 1);
      const t = liste[i]; liste[i] = liste[j]; liste[j] = t;
    }
    return liste;
  }
  function gewichtet(run, eintraege) {
    let summe = 0;
    for (const e of eintraege) summe += e[1];
    let r = zufall(run) * summe;
    for (const e of eintraege) { r -= e[1]; if (r < 0) return e[0]; }
    return eintraege[eintraege.length - 1][0];
  }

  /* ---------- Hilfen ---------- */
  const hat = (run, t) => run.talismane.indexOf(t) >= 0;
  const istLicht = (id) => !ARTEN[id].irr;
  function entferneEins(liste, id) {
    const i = liste.indexOf(id);
    if (i < 0) return false;
    liste.splice(i, 1);
    return true;
  }
  function glasZaehlen(liste) {
    const n = {};
    for (const id of liste) n[id] = (n[id] || 0) + 1;
    return Object.keys(ARTEN).filter((id) => n[id]).map((id) => ({ id, anzahl: n[id] }));
  }
  function datumsSeed(d) {
    const dd = d || new Date();
    return dd.getFullYear() * 10000 + (dd.getMonth() + 1) * 100 + dd.getDate();
  }

  /* ---------- Meta (dauerhaft zwischen den Läufen) ---------- */
  function neueMeta() {
    return {
      version: 1, erinnerungen: 0, freigeschaltet: [], notizen: [], gesehen: { arten: [], talismane: [] },
      laeufe: 0, siege: 0, weitesteRegion: 0, waechter: {}, almaGesehen: false, mondphaseFrei: 0, besteMondphase: -1,
      wahresEnde: false, gespraeche: [], taeglich: {}, letzterLauf: null
    };
  }
  function metaReparieren(m) {
    const leer = neueMeta();
    const out = Object.assign(leer, m || {});
    out.gesehen = Object.assign({ arten: [], talismane: [] }, out.gesehen || {});
    return out;
  }
  function poolArten(meta) {
    const pool = I.BASIS_ARTEN.slice();
    for (const id of ["mondmotte", "nachtfalter", "glutkaefer", "funkenflieger", "gebunden"]) {
      if (meta.freigeschaltet.indexOf(id) >= 0) pool.push(id);
    }
    return pool;
  }
  function poolTalismane(meta) {
    return I.BASIS_TALISMANE.concat(meta.freigeschaltet.indexOf("truhe") >= 0 ? I.TRUHE_TALISMANE : []);
  }
  function laternenFrei(meta) {
    return Object.keys(LATERNEN).filter((id) => id === "sturm" || meta.freigeschaltet.indexOf(id) >= 0);
  }
  function freischalten(meta, id) {
    const f = FREISCHALTUNGEN.find((x) => x.id === id);
    if (!f || meta.freigeschaltet.indexOf(id) >= 0 || meta.erinnerungen < f.preis) return false;
    meta.erinnerungen -= f.preis;
    meta.freigeschaltet.push(id);
    return true;
  }
  function gespraeche(meta) {
    const offen = [];
    const figuren = {};
    for (const g of GESPRAECHE) {
      if (figuren[g.wer] || meta.gespraeche.indexOf(g.id) >= 0) continue;
      if (g.wenn(meta)) { figuren[g.wer] = true; offen.push(g); }
    }
    return offen;
  }
  function gespraechGelesen(meta, id) {
    if (meta.gespraeche.indexOf(id) < 0) meta.gespraeche.push(id);
  }

  /* ---------- Lauf anlegen ---------- */
  function neuerLauf(opt) {
    const o = opt || {};
    const meta = metaReparieren(o.meta);
    const laterne = LATERNEN[o.laterne] ? o.laterne : "sturm";
    const lat = LATERNEN[laterne];
    const mondphase = Math.max(0, Math.min(5, o.mondphase | 0));
    const seed = (o.seed >>> 0) || 1;
    const run = {
      version: 1, seed, rng: seed, laterne, mondphase, taeglich: o.taeglich || null,
      dochtMax: lat.docht + (meta.freigeschaltet.indexOf("erbstueck") >= 0 ? 1 : 0) - (mondphase >= 5 ? 1 : 0),
      docht: 0, schwelle: lat.schwelle, glanz: 0,
      glas: lat.glas.slice(), kraeuter: [], talismane: lat.talismane.slice(),
      pool: { arten: poolArten(meta), talismane: poolTalismane(meta) },
      bekannteNotizen: meta.notizen.slice(),
      region: 0, karten: [], pos: { reihe: -1, index: -1 },
      phase: "karte", station: null, angebot: null, fund: null, ende: null,
      austreibenPreis: REGELN.austreibenPreis, fundeGesehen: [],
      statistik: { stationen: 0, bestanden: 0, erloschen: 0, verfehlt: 0, waechter: [], notizen: [], hellste: 0, schritte: 0, gesehen: [], almaGesehen: false }
    };
    if (mondphase >= 2) run.glas.push("irrlicht2");
    if (meta.freigeschaltet.indexOf("kraeuterbeutel") >= 0) run.kraeuter.push("johanniskraut");
    run.docht = run.dochtMax;
    for (let r = 0; r < REGIONEN.length; r++) run.karten.push(karteErzeugen(run, r));
    return run;
  }

  function dunkelFuer(run, r, z, nebel) {
    let d = REGELN.dunkelBasis[r] + z * REGELN.dunkelProReihe[r] + ganz(run, REGELN.dunkelStreuung);
    if (nebel) d = Math.round(d * REGELN.nebelFaktor) + REGELN.nebelPlus;
    if (run.mondphase >= 1) d += 1;
    return d;
  }

  function karteErzeugen(run, r) {
    const reihen = [];
    for (let z = 0; z < REGELN.reihen; z++) {
      const n = 2 + ganz(run, 2);
      const reihe = [];
      for (let i = 0; i < n; i++) {
        reihe.push({ typ: z === 0 ? "pfad" : gewichtet(run, TYPGEWICHTE[z]), x: (i + 0.5) / n, nach: [], mod: null, dunkel: 0, besucht: false });
      }
      reihen.push(reihe);
    }
    const letzte = reihen[REGELN.reihen - 1];
    if (!letzte.some((k) => k.typ === "rast" || k.typ === "haendler")) {
      letzte[ganz(run, letzte.length)].typ = zufall(run) < 0.6 ? "rast" : "haendler";
    }
    reihen.forEach((reihe, z) => reihe.forEach((k) => {
      if (k.typ === "pfad") {
        k.mod = zufall(run) < 0.45 ? gewichtet(run, REGIONEN[r].mods) : null;
        k.dunkel = dunkelFuer(run, r, z, false);
      } else if (k.typ === "nebel") {
        k.mod = gewichtet(run, REGIONEN[r].harte);
        k.dunkel = dunkelFuer(run, r, z, true);
      }
    }));
    const wid = REGIONEN[r].waechter;
    const w = WAECHTER[wid];
    reihen.push([{ typ: "waechter", waechter: wid, x: 0.5, nach: [], mod: null, besucht: false,
      dunkel: w.dunkel + (run.mondphase >= 1 ? 1 : 0) + (run.mondphase >= 4 ? 3 : 0) }]);
    for (let z = 0; z < reihen.length - 1; z++) {
      const b = reihen[z + 1];
      for (const k of reihen[z]) {
        k.nach = [];
        b.forEach((m, j) => { if (Math.abs(m.x - k.x) <= 0.51) k.nach.push(j); });
      }
    }
    return { reihen };
  }

  /* ---------- Karte ---------- */
  function knotenAn(run, reihe, index) {
    const k = run.karten[run.region];
    return k && k.reihen[reihe] ? k.reihen[reihe][index] : null;
  }
  function offeneKnoten(run) {
    if (run.phase !== "karte") return [];
    const k = run.karten[run.region];
    if (run.pos.reihe < 0) return k.reihen[0].map((_, i) => ({ reihe: 0, index: i }));
    const hier = k.reihen[run.pos.reihe][run.pos.index];
    return hier.nach.map((i) => ({ reihe: run.pos.reihe + 1, index: i }));
  }
  function reisen(run, reihe, index) {
    if (!offeneKnoten(run).some((o) => o.reihe === reihe && o.index === index)) return false;
    run.pos = { reihe, index };
    const knoten = knotenAn(run, reihe, index);
    knoten.besucht = true;
    run.statistik.schritte++;
    if (knoten.typ === "pfad" || knoten.typ === "nebel" || knoten.typ === "waechter") {
      run.phase = "station";
      run.station = neueStation(run, knoten);
      if (knoten.waechter === "alma") run.statistik.almaGesehen = true;
    } else if (knoten.typ === "rast") {
      run.phase = "rast";
    } else if (knoten.typ === "haendler") {
      run.phase = "haendler";
      run.angebot = haendlerAngebot(run);
    } else {
      run.phase = "fund";
      run.fund = fundZiehen(run);
    }
    return true;
  }

  /* ---------- Station ---------- */
  function neueStation(run, knoten) {
    const w = knoten.waechter ? WAECHTER[knoten.waechter] : null;
    const mods = knoten.mod ? [knoten.mod] : [];
    let schwelle = run.schwelle + (hat(run, "bernstein") ? 1 : 0);
    if (mods.indexOf("nebel") >= 0) schwelle -= 1;
    if (mods.indexOf("sternklar") >= 0) schwelle += 1;
    if (w && w.schwelle) schwelle += w.schwelle;
    const stapel = run.glas.slice();
    if (w && w.zusatz) for (const z of w.zusatz) stapel.push(z);
    mischen(run, stapel);
    return {
      art: knoten.typ, waechter: knoten.waechter || null, mods, dunkel: knoten.dunkel, dunkelStart: knoten.dunkel,
      schwelle, stapel, gezogen: [], licht: hat(run, "zunder") ? 2 : 0, kaelte: 0,
      verdoppeln: 0, falle: 0, ersterIrr: false, blick: 0, letzte: null,
      status: "offen", ergebnis: null, versuch: 1,
      lohn: knoten.typ === "nebel" ? REGELN.nebelLohn + run.region : REGELN.lohn[run.region]
    };
  }

  // Wie viel Kälte brächte dieser Funke jetzt? Gemeinsam genutzt von ziehen() und gefahr().
  function kaelteVon(run, st, id) {
    const a = ARTEN[id];
    if (!a.kaelte) return { k: 0 };
    let k = a.kaelte;
    if (a.irr) {
      if (st.mods.indexOf("schwarzwasser") >= 0 && k === 1) k = 2;
      if (st.falle > 0) return { k: 0, gefangen: true };
      if (hat(run, "mondstein") && !st.ersterIrr) return { k: 0, mondstein: true };
    }
    return { k };
  }
  function lichtVon(run, st, id) {
    const a = ARTEN[id];
    let l = a.licht || 0;
    if (a.takt) {
      l = Math.min(REGELN.taktMax, 1 + st.gezogen.filter((t) => ARTEN[t].takt).length);
      if (hat(run, "taktstock")) l += 1;
      if (st.mods.indexOf("mondschein") >= 0) l += 1;
    }
    if (a.zaehlt) l = Math.min(6, st.gezogen.length);
    if (id === "johannis" && st.mods.indexOf("birkenlicht") >= 0) l += 1;
    if (id === "gluehwuermchen" && st.waechter === "nebelfrau") l += 1;
    if (a.irr && st.waechter === "alma") l += 2;
    return l;
  }
  function rettungMoeglich(run, st) {
    if (run.kraeuter.indexOf("johanniskraut") >= 0 && st.letzte && st.letzte.irr && st.letzte.kaelte > 0
        && st.kaelte - st.letzte.kaelte <= st.schwelle) return true;
    if (run.kraeuter.indexOf("wachs") >= 0 && st.kaelte <= st.schwelle + 2) return true;
    return false;
  }

  function ziehen(run) {
    const st = run.station;
    if (run.phase !== "station" || !st || st.status !== "offen" || st.stapel.length === 0) return null;
    const id = st.stapel.pop();
    const a = ARTEN[id];
    const ev = { id, licht: 0, kaelte: 0, waerme: 0, verdoppelt: false, gefangen: false, mondstein: false, dunkelPlus: 0, takt: 0 };
    const kv = kaelteVon(run, st, id);
    if (a.irr) {
      if (kv.gefangen) { st.falle--; ev.gefangen = true; } else { st.ersterIrr = true; ev.mondstein = !!kv.mondstein; }
      if (st.waechter === "moorkoenig") { st.dunkel += 2; ev.dunkelPlus = 2; }
    }
    st.kaelte += kv.k;
    ev.kaelte = kv.k;
    let l = lichtVon(run, st, id);
    if (a.takt) ev.takt = st.gezogen.filter((t) => ARTEN[t].takt).length + 1;
    if (l > 0 && st.verdoppeln > 1) { l *= st.verdoppeln; st.verdoppeln = 0; ev.verdoppelt = true; }
    const wind = st.mods.indexOf("wind") >= 0;
    if (a.verdoppelt && !wind) st.verdoppeln = hat(run, "spiegel") ? 3 : 2;
    if (a.faengt && !wind) st.falle += hat(run, "netz") ? 2 : 1;
    if (a.waerme) {
      const w = Math.min(st.kaelte, a.waerme * (hat(run, "tauperle") ? 2 : 1));
      st.kaelte -= w;
      ev.waerme = w;
    }
    st.licht += l;
    ev.licht = l;
    st.gezogen.push(id);
    st.letzte = { id, irr: !!a.irr, kaelte: kv.k, licht: l };
    if (st.blick > 0) st.blick--;
    if (st.licht > run.statistik.hellste) run.statistik.hellste = st.licht;
    if (run.statistik.gesehen.indexOf(id) < 0) run.statistik.gesehen.push(id);
    if (st.kaelte > st.schwelle) {
      if (rettungMoeglich(run, st)) { st.status = "flackert"; ev.flackert = true; }
      else { erloeschen(run); ev.erloschen = true; }
    }
    ev.lichtGesamt = st.licht;
    ev.kaelteGesamt = st.kaelte;
    return ev;
  }

  function erloeschen(run) {
    const st = run.station;
    st.status = "erloschen";
    const schaden = hat(run, "feder") ? 1 : REGELN.erloschenSchaden;
    run.docht = Math.max(0, run.docht - schaden);
    st.ergebnis = { bestanden: false, erloschen: true, schaden, glanz: 0 };
    run.statistik.stationen++;
    run.statistik.erloschen++;
  }
  function erloeschenLassen(run) {
    const st = run.station;
    if (run.phase !== "station" || !st || st.status !== "flackert") return false;
    erloeschen(run);
    return true;
  }

  function krautMoeglich(run, id) {
    const st = run.station;
    if (run.phase !== "station" || !st || run.kraeuter.indexOf(id) < 0) return false;
    if (st.status === "flackert") {
      if (id === "johanniskraut") return !!(st.letzte && st.letzte.irr && st.letzte.kaelte > 0 && st.kaelte - st.letzte.kaelte <= st.schwelle);
      if (id === "wachs") return st.kaelte <= st.schwelle + 2;
      return false;
    }
    if (st.status !== "offen") return false;
    if (id === "johanniskraut") return !!(st.letzte && st.letzte.irr && st.letzte.kaelte > 0);
    if (id === "baldrian") return st.stapel.length > 0;
    return true;
  }
  function krautNutzen(run, id) {
    if (!krautMoeglich(run, id)) return false;
    const st = run.station;
    entferneEins(run.kraeuter, id);
    if (id === "johanniskraut") {
      const l = st.letzte;
      st.gezogen.pop();
      st.kaelte -= l.kaelte;
      st.licht -= l.licht;
      st.stapel.splice(ganz(run, st.stapel.length + 1), 0, l.id);
      st.letzte = null;
    } else if (id === "baldrian") {
      st.blick = 3;
    } else if (id === "kienspan") {
      st.licht += 3;
    } else if (id === "wachs") {
      st.schwelle += 2;
    }
    if (st.status === "flackert" && st.kaelte <= st.schwelle) st.status = "offen";
    return true;
  }
  function blick(run) {
    const st = run.station;
    if (!st || !st.blick) return [];
    return st.stapel.slice(-st.blick).reverse();
  }

  function gefahr(run) {
    const st = run.station;
    if (!st || st.status !== "offen" || st.stapel.length === 0) return 0;
    let n = 0;
    for (const id of st.stapel) {
      if (!ARTEN[id].kaelte) continue;
      if (st.kaelte + kaelteVon(run, st, id).k > st.schwelle) n++;
    }
    return n / st.stapel.length;
  }

  function vorschau(run) {
    const st = run.station;
    if (!st) return null;
    if (st.licht >= st.dunkel) {
      const ueber = Math.min(REGELN.ueberschussMax, st.licht - st.dunkel);
      let glanz = st.lohn + ueber * (st.mods.indexOf("tau") >= 0 ? 2 : 1);
      const letzter = st.gezogen[st.gezogen.length - 1];
      if (letzter && ARTEN[letzter].glut) glanz += ARTEN[letzter].glut + (hat(run, "kohle") ? 3 : 0);
      if (hat(run, "glocke") && st.kaelte === st.schwelle) glanz += 5;
      return { bestanden: true, glanz, schaden: 0, fehlt: 0 };
    }
    const fehlt = st.dunkel - st.licht;
    let schaden = Math.ceil(fehlt / REGELN.fehlendJeDocht);
    if (hat(run, "wurzel") && fehlt <= 2 && !st.waechter) schaden = 0;
    return { bestanden: false, glanz: 0, schaden, fehlt };
  }

  function weitergehen(run) {
    const st = run.station;
    if (run.phase !== "station" || !st || st.status !== "offen") return null;
    const v = vorschau(run);
    st.status = v.bestanden ? "bestanden" : "verfehlt";
    run.glanz += v.glanz;
    run.docht = Math.max(0, run.docht - v.schaden);
    run.statistik.stationen++;
    if (v.bestanden) run.statistik.bestanden++; else run.statistik.verfehlt++;
    if (v.bestanden && st.art === "nebel") {
      const t = talismaneZiehen(run, 1)[0];
      if (t) { run.talismane.push(t); v.talisman = t; } else { run.glanz += 5; v.glanz += 5; }
    }
    if (v.bestanden && st.waechter) run.statistik.waechter.push(st.waechter);
    st.ergebnis = v;
    return v;
  }

  function stationAbschliessen(run) {
    const st = run.station;
    if (run.phase !== "station" || !st || st.status === "offen" || st.status === "flackert") return false;
    if (run.docht <= 0) return beenden(run, false);
    if (st.waechter) {
      if (st.status !== "bestanden") {
        const versuch = st.versuch + 1;
        run.station = neueStation(run, knotenAn(run, run.pos.reihe, run.pos.index));
        run.station.versuch = versuch;
        return true;
      }
      if (run.region === REGIONEN.length - 1) return beenden(run, true);
      run.station = null;
      run.phase = "beute";
      run.angebot = { talismane: talismaneZiehen(run, 3) };
      if (run.angebot.talismane.length === 0) run.glanz += 5;
      return true;
    }
    run.station = null;
    if (st.status === "bestanden") { run.phase = "fang"; run.angebot = { arten: fangAngebot(run) }; }
    else run.phase = "karte";
    return true;
  }

  /* ---------- Belohnungen ---------- */
  function fangAngebot(run) {
    const offen = run.pool.arten.slice();
    const wahl = [];
    while (wahl.length < 3 && offen.length) {
      const id = gewichtet(run, offen.map((a) => [a, RANG_GEWICHT[ARTEN[a].rang] || 1]));
      wahl.push(id);
      entferneEins(offen, id);
    }
    return wahl;
  }
  function fangen(run, index) {
    if (run.phase !== "fang" || !run.angebot) return false;
    if (index === null || index === undefined) run.glanz += REGELN.freilassenGlanz;
    else {
      const id = run.angebot.arten[index];
      if (!id) return false;
      run.glas.push(id);
    }
    run.angebot = null;
    run.phase = "karte";
    return true;
  }
  function talismaneZiehen(run, n) {
    const offen = run.pool.talismane.filter((t) => !hat(run, t));
    mischen(run, offen);
    return offen.slice(0, n);
  }
  function beuteWaehlen(run, index) {
    if (run.phase !== "beute") return false;
    if (index !== null && index !== undefined) {
      const t = run.angebot.talismane[index];
      if (!t) return false;
      run.talismane.push(t);
    }
    run.angebot = null;
    run.region++;
    run.pos = { reihe: -1, index: -1 };
    run.glas.push(REGELN.regionIrrlicht);
    run.docht = Math.min(run.dochtMax, run.docht + REGELN.waechterHeilung);
    run.phase = "karte";
    return true;
  }

  /* ---------- Rast ---------- */
  function rastHeilung(run) {
    return Math.max(1, REGELN.rastHeilung + (hat(run, "korb") ? 1 : 0) - (run.mondphase >= 3 ? 1 : 0));
  }
  function entfernbar(run, id) {
    if (run.glas.indexOf(id) < 0) return false;
    if (istLicht(id) && run.glas.filter(istLicht).length <= REGELN.mindestLichtfunken) return false;
    return true;
  }
  function rasten(run, wahl, id) {
    if (run.phase !== "rast") return false;
    if (wahl === "docht") run.docht = Math.min(run.dochtMax, run.docht + rastHeilung(run));
    else if (wahl === "sichten") {
      if (!entfernbar(run, id)) return false;
      entferneEins(run.glas, id);
    } else return false;
    run.phase = "karte";
    return true;
  }

  /* ---------- Krämerin ---------- */
  function preis(run, p) {
    let x = p + (run.mondphase >= 3 ? 1 : 0);
    if (hat(run, "muenze")) x -= Math.ceil(x / 4);
    return Math.max(1, x);
  }
  function haendlerAngebot(run) {
    const waren = fangAngebot(run).map((id) => ({ typ: "art", id, preis: preis(run, ARTEN[id].preis) }));
    const zusatz = fangAngebot(run).filter((id) => !waren.some((w) => w.id === id))[0];
    if (zusatz) waren.push({ typ: "art", id: zusatz, preis: preis(run, ARTEN[zusatz].preis) });
    const kraeuter = Object.keys(KRAEUTER);
    waren.push({ typ: "kraut", id: kraeuter[ganz(run, kraeuter.length)], preis: preis(run, REGELN.krautPreis) });
    const t = talismaneZiehen(run, 1)[0];
    if (t) waren.push({ typ: "talisman", id: t, preis: preis(run, REGELN.talismanPreis) });
    return { waren, verkauft: [] };
  }
  function kaufbar(run, index) {
    if (run.phase !== "haendler" || !run.angebot) return false;
    const w = run.angebot.waren[index];
    if (!w || run.angebot.verkauft.indexOf(index) >= 0 || run.glanz < w.preis) return false;
    if (w.typ === "kraut" && run.kraeuter.length >= REGELN.krautPlaetze) return false;
    return true;
  }
  function kaufen(run, index) {
    if (!kaufbar(run, index)) return false;
    const w = run.angebot.waren[index];
    run.glanz -= w.preis;
    run.angebot.verkauft.push(index);
    if (w.typ === "art") run.glas.push(w.id);
    else if (w.typ === "kraut") run.kraeuter.push(w.id);
    else run.talismane.push(w.id);
    return true;
  }
  function austreibenKosten(run) { return preis(run, run.austreibenPreis); }
  function austreiben(run, id) {
    if (run.phase !== "haendler" || !entfernbar(run, id) || run.glanz < austreibenKosten(run)) return false;
    run.glanz -= austreibenKosten(run);
    run.austreibenPreis += REGELN.austreibenAnstieg;
    entferneEins(run.glas, id);
    return true;
  }
  function haendlerVerlassen(run) {
    if (run.phase !== "haendler") return false;
    run.angebot = null;
    run.phase = "karte";
    return true;
  }

  /* ---------- Funde ---------- */
  function naechsteNotiz(run) {
    for (let i = 0; i < NOTIZEN.length; i++) {
      if (run.bekannteNotizen.indexOf(i) < 0 && run.statistik.notizen.indexOf(i) < 0) return i;
    }
    return -1;
  }
  function fundZiehen(run) {
    const notiz = naechsteNotiz(run);
    const ersteNotiz = run.fundeGesehen.indexOf("notiz") < 0;
    if (notiz >= 0 && (ersteNotiz || zufall(run) < 0.3)) {
      run.fundeGesehen.push("notiz");
      return { id: "notiz", notiz, ergebnis: null };
    }
    const kandidaten = FUNDE.filter((f) => f.regionen.indexOf(run.region) >= 0 && run.fundeGesehen.indexOf(f.id) < 0);
    const f = kandidaten.length ? kandidaten[ganz(run, kandidaten.length)] : FUNDE.find((x) => x.id === "wiese");
    run.fundeGesehen.push(f.id);
    return { id: f.id, ergebnis: null };
  }
  function fundDaten(fund) {
    if (fund.id === "notiz") {
      return {
        id: "notiz", titel: "Eine Seite im Moos",
        text: "Zwischen Wollgras klemmt ein Blatt, eng beschrieben. Almas Handschrift.",
        optionen: [{ text: "Lesen und einstecken", hinweis: "Almas Notiz, +2 Glanz", wirkung: [{ notiz: true }, { glanz: 2 }], folge: "" }]
      };
    }
    return FUNDE.find((f) => f.id === fund.id);
  }
  function optionMoeglich(run, opt) {
    return !(opt.bedingung && opt.bedingung.glanz && run.glanz < opt.bedingung.glanz);
  }
  function wirkungenAnwenden(run, liste, erg) {
    for (const w of liste) {
      if (w.docht) run.docht = Math.max(0, Math.min(run.dochtMax, run.docht + w.docht));
      if (w.dochtMax) { run.dochtMax = Math.max(1, run.dochtMax + w.dochtMax); run.docht = Math.min(run.docht, run.dochtMax); }
      if (w.glanz) run.glanz = Math.max(0, run.glanz + w.glanz);
      if (w.schwelle) run.schwelle += w.schwelle;
      if (w.funke) run.glas.push(w.funke);
      if (w.entferne) entferneEins(run.glas, w.entferne);
      if (w.entferneIrr) {
        for (let n = 0; n < w.entferneIrr; n++) {
          const id = ["irrlicht1", "irrlicht2", "irrlicht3"].find((x) => run.glas.indexOf(x) >= 0);
          if (id) entferneEins(run.glas, id);
        }
      }
      if (w.opfer) {
        const kandidaten = run.glas.filter(istLicht);
        if (kandidaten.length > REGELN.mindestLichtfunken) {
          kandidaten.sort((a, b) => (ARTEN[b].preis || 0) - (ARTEN[a].preis || 0));
          entferneEins(run.glas, kandidaten[0]);
          erg.geopfert = kandidaten[0];
        }
      }
      if (w.talisman) {
        const t = w.talisman === "zufall" ? talismaneZiehen(run, 1)[0] : (hat(run, w.talisman) ? null : w.talisman);
        if (t) { run.talismane.push(t); erg.talismane.push(t); } else run.glanz += 5;
      }
      if (w.kraut) {
        const ids = Object.keys(KRAEUTER);
        const k = w.kraut === "zufall" ? ids[ganz(run, ids.length)] : w.kraut;
        if (run.kraeuter.length < REGELN.krautPlaetze) { run.kraeuter.push(k); erg.kraeuter.push(k); } else run.glanz += 2;
      }
      if (w.notiz && run.fund && run.fund.notiz >= 0) { run.statistik.notizen.push(run.fund.notiz); erg.notiz = run.fund.notiz; }
      if (w.fang) erg.fang = true;
      if (w.wagnis) {
        const gut = zufall(run) < w.wagnis.chance;
        erg.text = gut ? w.wagnis.gutText : w.wagnis.schlechtText;
        erg.gut = gut;
        wirkungenAnwenden(run, gut ? w.wagnis.gut : w.wagnis.schlecht, erg);
      }
    }
  }
  function fundWaehlen(run, index) {
    if (run.phase !== "fund" || !run.fund || run.fund.ergebnis) return null;
    const f = fundDaten(run.fund);
    const opt = f.optionen[index];
    if (!opt || !optionMoeglich(run, opt)) return null;
    const erg = { text: opt.folge || "", talismane: [], kraeuter: [], fang: false };
    wirkungenAnwenden(run, opt.wirkung, erg);
    run.fund.ergebnis = erg;
    run.fund.wahl = index;
    return erg;
  }
  function fundAbschliessen(run) {
    if (run.phase !== "fund" || !run.fund || !run.fund.ergebnis) return false;
    const erg = run.fund.ergebnis;
    run.fund = null;
    if (run.docht <= 0) return beenden(run, false);
    if (erg.fang) { run.phase = "fang"; run.angebot = { arten: fangAngebot(run) }; }
    else run.phase = "karte";
    return true;
  }

  /* ---------- Ende und Auswertung ---------- */
  function beenden(run, sieg) {
    run.phase = "ende";
    run.angebot = null;
    run.ende = { sieg, region: run.region, ausgewertet: false, bilanz: null, wahresEnde: false };
    return true;
  }
  function aufgeben(run) {
    if (!run || run.phase === "ende") return false;
    run.station = null;
    run.fund = null;
    return beenden(run, false);
  }
  function fortschritt(run) {
    return run.statistik.schritte + (run.ende && run.ende.sieg ? 10 : 0);
  }
  function laufAuswerten(meta, run) {
    if (!run.ende) return null;
    if (run.ende.ausgewertet) return run.ende.bilanz;
    const s = run.statistik;
    const neueNotizen = s.notizen.filter((n) => meta.notizen.indexOf(n) < 0);
    const posten = [["Bestandene Stationen", s.bestanden]];
    if (s.waechter.length) posten.push(["Besiegte Wächter", s.waechter.length * 3]);
    if (neueNotizen.length) posten.push(["Almas Notizen", neueNotizen.length * 2]);
    if (run.ende.sieg) posten.push(["Der Turm brennt", 5 + run.mondphase * 2]);
    const summe = posten.reduce((a, p) => a + p[1], 0);
    const neu = [];
    meta.erinnerungen += summe;
    meta.laeufe++;
    for (const n of neueNotizen) meta.notizen.push(n);
    meta.notizen.sort((a, b) => a - b);
    for (const id of s.gesehen) {
      if (meta.gesehen.arten.indexOf(id) >= 0) continue;
      meta.gesehen.arten.push(id);
      if (!ARTEN[id].irr) neu.push(ARTEN[id].name);
    }
    for (const t of run.talismane) if (meta.gesehen.talismane.indexOf(t) < 0) meta.gesehen.talismane.push(t);
    meta.weitesteRegion = Math.max(meta.weitesteRegion, run.region);
    for (const w of s.waechter) meta.waechter[w] = (meta.waechter[w] || 0) + 1;
    if (s.almaGesehen && !meta.almaGesehen) {
      meta.almaGesehen = true;
      if (meta.freigeschaltet.indexOf("gebunden") < 0) { meta.freigeschaltet.push("gebunden"); neu.push("Gebundenes Irrlicht"); }
    }
    if (run.ende.sieg) {
      meta.siege++;
      meta.besteMondphase = Math.max(meta.besteMondphase, run.mondphase);
      if (run.mondphase >= meta.mondphaseFrei && meta.mondphaseFrei < 5) meta.mondphaseFrei = run.mondphase + 1;
      if (meta.notizen.length >= NOTIZEN.length) {
        run.ende.wahresEnde = true;
        meta.wahresEnde = true;
      }
    }
    if (run.taeglich) {
      const alt = meta.taeglich[run.taeglich] || 0;
      meta.taeglich = { [run.taeglich]: Math.max(alt, fortschritt(run)) };
    }
    meta.letzterLauf = { sieg: run.ende.sieg, region: run.region, bestanden: s.bestanden };
    run.ende.ausgewertet = true;
    run.ende.bilanz = { posten, summe, neueNotizen, neu };
    return run.ende.bilanz;
  }

  return {
    REGELN, I, zufall, glasZaehlen, datumsSeed,
    neueMeta, metaReparieren, poolArten, poolTalismane, laternenFrei, freischalten, gespraeche, gespraechGelesen,
    neuerLauf, offeneKnoten, knotenAn, reisen,
    ziehen, weitergehen, erloeschenLassen, krautMoeglich, krautNutzen, blick, gefahr, vorschau, stationAbschliessen,
    lichtVon, kaelteVon,
    fangen, beuteWaehlen, rastHeilung, entfernbar, rasten,
    kaufbar, kaufen, austreibenKosten, austreiben, haendlerVerlassen,
    fundDaten, optionMoeglich, fundWaehlen, fundAbschliessen,
    laufAuswerten, fortschritt, aufgeben
  };
});
