// Smoke-Test: öffnet die Seite wie ein Handy, spielt komplette Schichten über die echte Oberfläche
// (Knöpfe, Halten des Hebels), startet neu und prüft, dass die Seite offline aus dem Service Worker lädt.
// Braucht Playwright (npm install playwright); ohne Playwright werden die Tests übersprungen.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");

let playwright = null;
try { playwright = require("playwright"); } catch (e) { /* nicht installiert */ }
const skip = playwright ? false : "Playwright nicht installiert";

const DIR = path.resolve(__dirname, "..");
const SEITE = "file://" + path.join(DIR, "index.html");
const HANDY = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

function beobachten(page) {
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
  return fehler;
}
const zustand = (page) => page.evaluate(() => {
  const g = window.brueckenwaerter.game;
  return { status: g.status, score: g.score, strikes: g.strikes, passed: g.passed, rounds: g.rounds, clock: g.clock, bridge: g.bridge, held: g.held, time: g.time };
});

test("komplette Schicht mit dem Autopiloten, Ergebnis angezeigt, Neustart ohne Neuladen", { skip }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage(HANDY);
    const fehler = beobachten(page);
    await page.goto(SEITE + "?seed=7&tempo=12&autoplay=1");
    assert.equal(await page.title(), "Brückenwärter");
    assert.equal(await page.textContent("#ov-start"), "Schicht beginnen");
    assert.equal(await page.textContent("#clock"), "06:00");
    await page.tap("#ov-start");
    assert.equal(await page.isVisible("#overlay"), false);

    await page.waitForFunction(() => window.brueckenwaerter.game.over, null, { timeout: 90000 });
    const ende = await zustand(page);
    assert.ok(["gewonnen", "verloren"].includes(ende.status), ende.status);
    assert.ok(ende.passed > 20, `nur ${ende.passed} durchgelassen`);
    assert.ok(ende.score > 0);
    if (ende.status === "gewonnen") assert.equal(ende.clock, "18:00");

    await page.waitForSelector("#overlay.show", { timeout: 5000 });
    assert.match(await page.textContent("#ov-title"), /Feierabend!|Gefeuert!/);
    assert.equal(await page.textContent("#ov-score"), `${ende.score} Punkte`);
    assert.equal(await page.textContent("#score"), String(ende.score));
    assert.equal(await page.textContent("#ov-start"), "Noch eine Schicht");

    await page.tap("#ov-start");
    assert.equal(await page.isVisible("#overlay"), false);
    const neu = await zustand(page);
    assert.equal(neu.rounds, 2);
    assert.equal(neu.status, "läuft");
    assert.equal(neu.score, 0);
    assert.equal(neu.strikes, 0);
    await page.waitForFunction(() => window.brueckenwaerter.game.time > 2, null, { timeout: 10000 });
    assert.equal(await page.textContent("#score"), String((await zustand(page)).score));
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
  }
});

test("Hebel halten hebt die Brücke, Nichtstun endet mit drei Hupen und 'Gefeuert!'", { skip }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage(HANDY);
    const fehler = beobachten(page);
    await page.goto(SEITE + "?seed=7&tempo=10");
    await page.tap("#ov-start");

    // Finger auf den Knopf: Brücke geht hoch; Finger weg: Brücke kommt runter.
    await page.dispatchEvent("#btn-lift", "pointerdown", { pointerId: 1, isPrimary: true });
    await page.waitForFunction(() => window.brueckenwaerter.game.bridge >= 1, null, { timeout: 10000 });
    assert.equal((await zustand(page)).held, true);
    assert.equal(await page.getAttribute("#btn-lift", "aria-pressed"), "true");
    await page.dispatchEvent("#btn-lift", "pointerup", { pointerId: 1, isPrimary: true });
    await page.waitForFunction(() => window.brueckenwaerter.game.bridge <= 0, null, { timeout: 10000 });
    assert.equal((await zustand(page)).held, false);

    // Jetzt nichts mehr tun: die Segler hupen, der Posten ist weg.
    await page.waitForFunction(() => window.brueckenwaerter.game.over, null, { timeout: 90000 });
    const ende = await zustand(page);
    assert.equal(ende.status, "verloren");
    assert.ok(ende.strikes >= 3);
    await page.waitForSelector("#overlay.show", { timeout: 5000 });
    assert.equal(await page.textContent("#ov-title"), "Gefeuert!");
    assert.equal(await page.$$eval(".horn.used", (els) => els.length), 3);

    // "Neu" über die Tastatur (n) startet ebenfalls eine frische Schicht.
    await page.keyboard.press("n");
    assert.equal(await page.isVisible("#overlay"), false);
    const neu = await zustand(page);
    assert.equal(neu.status, "läuft");
    assert.equal(neu.strikes, 0);
    assert.equal(await page.$$eval(".horn.used", (els) => els.length), 0);
    // Leertaste halten hebt die Brücke genauso.
    await page.keyboard.down("Space");
    await page.waitForFunction(() => window.brueckenwaerter.game.bridge > 0.3, null, { timeout: 10000 });
    await page.keyboard.up("Space");
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
  }
});

/* Kleiner statischer Server, der wie GitHub Pages aus dem Repo-Wurzelverzeichnis ausliefert. */
function serve(root) {
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png" };
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("404"); return; }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

test("läuft offline: nach dem ersten Besuch liefert der Service Worker die Seite ohne Netz", { skip }, async () => {
  const root = path.resolve(DIR, "..", "..");
  const { server, url } = await serve(root);
  const browser = await playwright.chromium.launch();
  try {
    const context = await browser.newContext(HANDY);
    const page = await context.newPage();
    const fehler = beobachten(page);
    const adresse = url + "/spiel/brueckenwaerter/";
    await page.goto(adresse);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(async () => {
      const keys = await caches.keys();
      if (!keys.length) return false;
      const cache = await caches.open(keys[0]);
      return (await cache.keys()).length >= 6;
    }, null, { timeout: 15000 });
    const gespeichert = await page.evaluate(async () => {
      const cache = await caches.open((await caches.keys())[0]);
      return (await cache.keys()).map((r) => new URL(r.url).pathname.split("/").pop());
    });
    for (const datei of ["index.html", "engine.js", "manifest.webmanifest", "icon-192.png"]) assert.ok(gespeichert.includes(datei), `${datei} nicht im Cache`);

    server.close();                         // der Server ist weg ...
    await context.setOffline(true);         // ... und das Gerät ohne Netz
    await page.goto(adresse + "?seed=3");
    assert.equal(await page.title(), "Brückenwärter");
    await page.tap("#ov-start");
    await page.waitForFunction(() => window.brueckenwaerter.game.time > 1, null, { timeout: 10000 });
    assert.equal((await zustand(page)).status, "läuft");
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
    server.close();
  }
});
