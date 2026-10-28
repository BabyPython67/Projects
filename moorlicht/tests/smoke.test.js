// Smoke-Test: öffnet Moorlicht wie ein Handy (Touch, 390 × 844) und spielt nur mit Fingertipps eine ganze
// Nacht vom Intro bis zum Endbildschirm, dazu Fortsetzen nach dem Neuladen und das Layout auf dem iPad.
// Aufruf: node --test moorlicht/tests/smoke.test.js  (braucht Playwright: npm install im Ordner moorlicht)
// Mit MOORLICHT_BILDER=/pfad legt der Test Bildschirmfotos ab.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

let playwright = null;
try { playwright = require("playwright"); } catch (e) { /* nicht installiert */ }
const skip = playwright ? false : "Playwright nicht installiert (im Ordner moorlicht: npm install && npx playwright install chromium)";

const SEITE = "file://" + path.resolve(__dirname, "..", "index.html");
const HANDY = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const IPAD = { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const BILDER = process.env.MOORLICHT_BILDER;

function beobachten(page) {
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
  return fehler;
}
async function tippe(page, sel) {
  await page.waitForSelector(sel, { state: "visible", timeout: 10000 });
  await page.tap(sel);
}
const bereit = (page) => page.waitForFunction(() => window.moorlicht && window.moorlicht.bereit(), null, { timeout: 15000 });
const bildschirm = (page) => page.evaluate(() => window.moorlicht.bildschirm());
async function foto(page, name) { if (BILDER) await page.screenshot({ path: path.join(BILDER, name + ".png") }); }

// Spielt bis zum Endbildschirm. Entscheidet wie ein vorsichtiger Mensch nach Risiko und Vorschau,
// tippt aber ausschließlich auf sichtbare Knöpfe.
async function nachtSpielen(page, protokoll) {
  const fotos = new Set();
  for (let zug = 0; zug < 3000; zug++) {
    await bereit(page);
    const b = await bildschirm(page);
    protokoll.bildschirme.add(b);
    if (!fotos.has(b)) { fotos.add(b); await foto(page, "handy-" + b); }
    if (b === "ende") return;
    if (b === "karte") {
      await tippe(page, ".knoten.offen");
      await tippe(page, "#hingehen");
      protokoll.schritte++;
    } else if (b === "station") {
      const z = await page.evaluate(() => {
        const st = window.moorlicht.run.station;
        return {
          ergebnis: !document.querySelector("#ergebnis").hidden, flackert: !document.querySelector("#flackern").hidden,
          gefahr: window.moorlicht.gefahr(), vorschau: window.moorlicht.vorschau(), leer: st.stapel.length === 0
        };
      });
      if (z.ergebnis) { await tippe(page, "#ergebnisWeiter"); protokoll.stationen++; continue; }
      if (z.flackert) { await tippe(page, '#flackern [data-aktion="kraut"], #erloeschenKnopf'); continue; }
      const ziehen = !z.leer && (z.vorschau.bestanden ? z.gefahr <= 0.2 : (z.vorschau.schaden >= 2 || z.gefahr <= 0.5));
      await tippe(page, ziehen ? "#ziehen" : "#weiter");
      if (ziehen) protokoll.zuege++;
    } else if (b === "fang") {
      await tippe(page, '[data-aktion="fangen"][data-i="0"]');
    } else if (b === "beute") {
      await tippe(page, '[data-aktion="beute"]');
    } else if (b === "rast") {
      if (await page.$('[data-aktion="rastEntfernen"]')) await tippe(page, '[data-aktion="rastEntfernen"]:not([disabled])');
      else await tippe(page, '[data-aktion="rastDocht"]:not([disabled]), [data-aktion="rastSichten"]');
    } else if (b === "haendler") {
      const ware = await page.$('[data-aktion="kaufen"]:not([disabled])');
      if (ware && !protokoll.gekauft) { await ware.tap(); protokoll.gekauft = true; }
      else await tippe(page, "#haendlerWeg");
    } else if (b === "fund") {
      if (await page.$("#fundWeiter")) await tippe(page, "#fundWeiter");
      else await tippe(page, '[data-aktion="fund"]:not([disabled])');
    } else {
      throw new Error("unerwarteter Bildschirm " + b);
    }
  }
  throw new Error("Nacht endet nicht");
}

test("eine ganze Nacht per Touch: Intro, Dorf, Karte, Stationen bis zum Endbildschirm und zurück ins Dorf", { skip, timeout: 300000 }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage(HANDY);
    const fehler = beobachten(page);
    await page.goto(SEITE + "?seed=11&tempo=12");
    assert.equal(await page.title(), "Moorlicht");
    await foto(page, "handy-intro");
    await tippe(page, '[data-aktion="introFertig"]');
    assert.equal(await bildschirm(page), "dorf");
    assert.match(await page.textContent(".dorf-titel"), /Johannisnacht Nr\. 1/);
    await foto(page, "handy-dorf");

    await tippe(page, '[data-aktion="figur"][data-id="hedda"]');
    assert.match(await page.textContent(".modal"), /Laterne/);
    await tippe(page, '[data-aktion="schliessen"]');
    assert.equal(await page.isVisible("#dialog"), false);

    await tippe(page, "#start");
    assert.equal(await bildschirm(page), "karte");
    assert.equal(await page.isDisabled("#hingehen"), true, "erst einen Ort wählen");

    const protokoll = { bildschirme: new Set(), schritte: 0, stationen: 0, zuege: 0, gekauft: false };
    await nachtSpielen(page, protokoll);

    const run = await page.evaluate(() => window.moorlicht.run);
    const meta = await page.evaluate(() => window.moorlicht.meta);
    assert.equal(run.phase, "ende");
    assert.ok(protokoll.schritte >= 3, `nur ${protokoll.schritte} Orte besucht`);
    assert.ok(protokoll.stationen >= 2, `nur ${protokoll.stationen} Stationen`);
    assert.ok(protokoll.zuege >= 5, `nur ${protokoll.zuege} Funken gezogen`);
    assert.ok(["karte", "station", "fang", "ende"].every((b) => protokoll.bildschirme.has(b)), [...protokoll.bildschirme].join(","));
    assert.equal(meta.laeufe, 1, "die Nacht ist ausgewertet");
    assert.ok(meta.erinnerungen > 0 || run.statistik.bestanden === 0);
    assert.match(await page.textContent(".ende h1"), /Morgengrauen|Heimkehr|Die Nacht beginnt von vorn/);
    assert.match(await page.textContent(".bilanz"), /Erinnerungen/);
    console.log(`  Nacht: ${run.ende.sieg ? "Sieg" : "erloschen"} in ${run.karten && ["Birkenbruch", "Torfstiche", "Schwarzes Wasser"][run.region]}, ` +
      `${protokoll.schritte} Orte, ${protokoll.stationen} Stationen, ${protokoll.zuege} Funken gezogen, Bildschirme: ${[...protokoll.bildschirme].join(", ")}`);

    await tippe(page, "#insDorf");
    assert.equal(await bildschirm(page), "dorf");
    assert.match(await page.textContent(".dorf-titel"), /Johannisnacht Nr\. 2/);
    assert.ok(await page.$(".figur.neu"), "nach der Nacht hat jemand etwas Neues zu erzählen");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "nichts ragt seitlich heraus");
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
  }
});

test("eine laufende Nacht übersteht das Neuladen und lässt sich fortsetzen", { skip, timeout: 60000 }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage(HANDY);
    const fehler = beobachten(page);
    await page.goto(SEITE + "?seed=5&tempo=12");
    await tippe(page, '[data-aktion="introFertig"]');
    await tippe(page, "#start");
    await tippe(page, ".knoten.offen");
    await tippe(page, "#hingehen");
    assert.equal(await bildschirm(page), "station");
    await tippe(page, "#ziehen");
    await bereit(page);
    const vorher = await page.evaluate(() => window.moorlicht.run.station.gezogen.slice());
    assert.equal(vorher.length, 1);
    await page.reload();
    assert.equal(await bildschirm(page), "dorf");
    await tippe(page, "#fortsetzen");
    assert.equal(await bildschirm(page), "station");
    assert.deepEqual(await page.evaluate(() => window.moorlicht.run.station.gezogen), vorher);
    assert.equal(await page.locator("#gezogen .chip").count(), 1);
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
  }
});

test("iPad: Dorf und Karte passen ins Bild, alle Orte sind antippbar", { skip, timeout: 60000 }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage(IPAD);
    const fehler = beobachten(page);
    await page.goto(SEITE + "?seed=3&tempo=12");
    await tippe(page, '[data-aktion="introFertig"]');
    await foto(page, "ipad-dorf");
    await tippe(page, "#start");
    const knoten = await page.$$eval(".knoten", (els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }));
    assert.ok(knoten.length >= 9);
    for (const [l, t, r, b] of knoten) assert.ok(l >= 0 && t >= 0 && r <= 820 && b <= 1180, `Ort außerhalb: ${[l, t, r, b]}`);
    await tippe(page, ".knoten.offen");
    await tippe(page, "#hingehen");
    await foto(page, "ipad-station");
    assert.equal(await page.isVisible("#ziehen"), true);
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
  }
});
