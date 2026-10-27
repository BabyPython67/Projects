// Umzugs-Test: Brückenwärter lag früher unter spiel/brueckenwaerter/ mit einem Service Worker, der
// zuerst aus dem Speicher lieferte. Wer das Spiel von dort (z. B. vom Home-Bildschirm) öffnet, soll
// mit Netz spätestens nach einmal Neuladen unter der neuen Adresse brueckenwaerter/ landen.
// Der Test stellt den alten Stand nach (Spieldateien unter der alten Adresse plus der alte Service
// Worker aus tests/fixtures/), lässt ihn installieren, schaltet den Server dann auf das echte Repo um
// und lädt einmal neu. Braucht Playwright; ohne Playwright werden die Tests übersprungen.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

let playwright = null;
try { playwright = require("playwright"); } catch (e) { /* nicht installiert */ }
const skip = playwright ? false : "Playwright nicht installiert";

const SPIEL = path.resolve(__dirname, "..");          // brueckenwaerter/
const REPO = path.resolve(SPIEL, "..");               // Wurzel, wie GitHub Pages sie ausliefert
const HANDY = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

/* Alter Stand: die Spieldateien unter spiel/brueckenwaerter/, dazu der alte Service Worker. */
function alterStand() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "brueckenwaerter-alt-"));
  const ziel = path.join(tmp, "spiel", "brueckenwaerter");
  fs.mkdirSync(ziel, { recursive: true });
  for (const datei of ["index.html", "engine.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"]) {
    fs.copyFileSync(path.join(SPIEL, datei), path.join(ziel, datei));
  }
  fs.copyFileSync(path.join(__dirname, "fixtures", "sw-alt-v1.js"), path.join(ziel, "sw.js"));
  return tmp;
}

/* Statischer Server, dessen Wurzelverzeichnis sich im Lauf umschalten lässt (alt -> neu). */
function serve(root) {
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png" };
  const state = { root, treffer: [] };
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    state.treffer.push(p);
    const file = path.join(state.root, p);
    if (!file.startsWith(state.root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("404"); return; }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, state, url: `http://127.0.0.1:${server.address().port}` })));
}

const imSpiel = async (page) => (await page.$("#btn-lift")) !== null && await page.evaluate(() => !!(window.brueckenwaerter && window.brueckenwaerter.game));

/* Alten Stand besuchen, bis der alte Service Worker installiert ist und alles im Speicher liegt. */
async function altInstallieren(page, adresse) {
  await page.goto(adresse);
  assert.equal(await page.title(), "Brückenwärter");
  assert.ok(await imSpiel(page), "alter Stand zeigt das Spiel nicht");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(async () => {
    if (!(await caches.has("brueckenwaerter-v1"))) return false;
    const cache = await caches.open("brueckenwaerter-v1");
    return (await cache.keys()).length >= 6;
  }, null, { timeout: 15000 });
}

test("alter Stand im Speicher, Netz da: nach einmal Neuladen läuft die neue Fassung unter brueckenwaerter/", { skip }, async () => {
  const alt = alterStand();
  const { server, state, url } = await serve(alt);
  const browser = await playwright.chromium.launch();
  try {
    const context = await browser.newContext(HANDY);
    const page = await context.newPage();
    const fehler = [];
    page.on("pageerror", (e) => fehler.push(String(e)));
    const alteAdresse = url + "/spiel/brueckenwaerter/";
    await altInstallieren(page, alteAdresse);

    // Beweis, dass wirklich der alte Worker liefert: Server weg, Seite kommt trotzdem.
    state.root = path.join(alt, "leer");
    await page.goto(alteAdresse + "?seed=5");
    assert.ok(await imSpiel(page), "alter Worker liefert nicht aus dem Speicher");
    assert.equal(page.url(), alteAdresse + "?seed=5");

    // Umzug: der Server liefert jetzt das echte Repo mit den Weiterleitungen und der neuen Fassung.
    state.root = REPO;
    state.treffer.length = 0;
    await page.reload();                                   // genau ein Neuladen durch den Spieler
    await page.waitForURL((u) => u.pathname === "/brueckenwaerter/", { timeout: 20000 });
    await page.waitForSelector("#btn-lift", { timeout: 10000 });
    assert.equal(page.url(), url + "/brueckenwaerter/?seed=5", "Anhängsel geht beim Umzug verloren");
    assert.equal(await page.title(), "Brückenwärter");
    await page.tap("#ov-start");
    await page.waitForFunction(() => window.brueckenwaerter.game.time > 0.5, null, { timeout: 10000 });
    assert.equal(await page.evaluate(() => window.brueckenwaerter.game.status), "läuft");
    assert.ok(state.treffer.includes("/brueckenwaerter/index.html"), "neue Fassung kam nicht vom Server: " + state.treffer.join(" "));

    // Aufgeräumt: alter Speicher weg, alte Anmeldung weg, die neue Fassung hat ihren eigenen Worker.
    await page.waitForFunction(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      return !(await caches.has("brueckenwaerter-v1")) && regs.every((r) => !r.scope.includes("/spiel/"));
    }, null, { timeout: 15000 });
    await page.evaluate(() => navigator.serviceWorker.ready);
    const neuScope = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).scope);
    assert.equal(neuScope, url + "/brueckenwaerter/");

    // Wer die alte Adresse noch einmal öffnet, wird jetzt direkt weitergeleitet.
    await page.goto(alteAdresse + "?seed=9");
    await page.waitForURL((u) => u.pathname === "/brueckenwaerter/", { timeout: 20000 });
    assert.equal(page.url(), url + "/brueckenwaerter/?seed=9");
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(alt, { recursive: true, force: true });
  }
});

test("alter Stand im Speicher, ohne Netz: die alte Fassung bleibt spielbar", { skip }, async () => {
  const alt = alterStand();
  const { server, url } = await serve(alt);
  const browser = await playwright.chromium.launch();
  try {
    const context = await browser.newContext(HANDY);
    const page = await context.newPage();
    const alteAdresse = url + "/spiel/brueckenwaerter/";
    await altInstallieren(page, alteAdresse);
    server.close();
    await context.setOffline(true);
    await page.goto(alteAdresse);
    assert.equal(page.url(), alteAdresse);
    assert.ok(await imSpiel(page), "alte Fassung läuft offline nicht mehr");
    await page.tap("#ov-start");
    await page.waitForFunction(() => window.brueckenwaerter.game.time > 0.5, null, { timeout: 10000 });
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(alt, { recursive: true, force: true });
  }
});
