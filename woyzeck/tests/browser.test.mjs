// Browser-Test mit Chromium (Playwright): Spiel laden, eine Entscheidung treffen, neu laden, der Stand ist
// noch da; Sicherungscode über gelöschte Daten hinweg; neue Fassung kommt trotz HTTP-Cache (max-age=600
// wie bei GitHub Pages) sofort an; offline lesbar; Handy-Breite ohne Querscrollen.
// Aufruf aus dem Ordner woyzeck: node --test tests/browser.test.mjs
// Ohne Playwright schlägt der Test fehl (er wird nicht übersprungen): npm install && npx playwright install chromium
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ORDNER } from "../tools/lade.mjs";
import { starteServer } from "../tools/server.mjs";
import { ladePlaywright } from "../tools/playwright.mjs";

const pw = ladePlaywright();
const IPAD = { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const HANDY = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
let browser, server, wurzel;
const fehler = [];

function beobachte(page) {
  page.on("pageerror", (e) => fehler.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
  page.on("dialog", (d) => d.accept());
}
const bereit = (page) => page.waitForFunction(() => window.woyzeck && window.woyzeck.bereit(), null, { timeout: 15000 });
const stand = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("woyzeck.stand.v1")));

before(async () => {
  assert.ok(pw, "Playwright fehlt: im Ordner woyzeck `npm install && npx playwright install chromium` ausführen");
  wurzel = mkdtempSync(join(tmpdir(), "woyzeck-"));
  for (const d of ["index.html", "manifest.webmanifest", "sw.js", "css", "js", "inhalt", "icons"]) cpSync(join(ORDNER, d), join(wurzel, d), { recursive: true });
  server = await starteServer({ wurzel });
  browser = await pw.chromium.launch();
});

after(async () => {
  await browser?.close();
  await server?.schliessen();
  if (wurzel) rmSync(wurzel, { recursive: true, force: true });
});

test("Spiel laden, Entscheidung treffen, neu laden: der Stand ist noch da", async () => {
  const ctx = await browser.newContext(IPAD);
  const page = await ctx.newPage();
  beobachte(page);
  await page.goto(server.url);
  await bereit(page);
  assert.equal(await page.isVisible("#weiterlesen"), false, "neuer Browser: nichts gespeichert");
  await page.tap("#beginnen");
  await page.waitForSelector("#szenenTitel:has-text('Freies Feld')");
  const option = page.locator("#wahl button[data-key='fragen']");
  await option.scrollIntoViewIfNeeded();
  await option.tap();
  await page.waitForSelector("#text .du-wahl");
  assert.match(await page.textContent("#text .du-wahl"), /Was hast du gesehen, Franz\?/);
  assert.deepEqual((await stand(page)).wahlen, { "feld.wahl": "fragen" });

  await page.reload();
  await bereit(page);
  assert.match(await page.textContent("#weiterlesen"), /Freies Feld/);
  await page.tap("#weiterlesen");
  await page.waitForSelector("#text .du-wahl");
  assert.equal(await page.locator("#wahl button").count(), 0, "die Entscheidung ist getroffen, keine Auswahl mehr");
  assert.ok(await page.isVisible("#weiter"));
  await page.locator("#weiter").scrollIntoViewIfNeeded();
  await page.tap("#weiter");
  await page.waitForSelector("#szenenTitel:has-text('Marie mit ihrem Kind')");
  assert.equal((await stand(page)).szene, "fenster");

  await page.reload();
  await bereit(page);
  await page.tap("#weiterlesen");
  await page.waitForSelector("#szenenTitel:has-text('Marie mit ihrem Kind')");
  assert.equal(await page.textContent("#szenenZahl"), "2 / 21");
  await ctx.close();
});

test("Sicherungscode: Stand nach gelöschten Website-Daten wiederherstellen", async () => {
  const ctx = await browser.newContext(IPAD);
  const page = await ctx.newPage();
  beobachte(page);
  await page.goto(server.url);
  await bereit(page);
  await page.tap("#beginnen");
  await page.locator("#wahl button[data-key='singen']").tap();
  await page.locator("#weiter").scrollIntoViewIfNeeded();
  await page.tap("#weiter");
  await page.waitForSelector("#szenenTitel:has-text('Marie mit ihrem Kind')");
  const vorher = await stand(page);
  await page.tap("#menuKnopf");
  const code = (await page.textContent("#codeAnzeige")).trim();
  assert.match(code, /^WOY-/);

  await page.evaluate(() => localStorage.clear()); // wie Safaris Löschen nach sieben Tagen
  await page.reload();
  await bereit(page);
  assert.equal(await page.isVisible("#weiterlesen"), false);
  await page.tap("#beginnen");
  await page.tap("#menuKnopf");
  await page.fill("#codeEingabe", code.toLowerCase());
  await page.tap("#codeLaden");
  await page.waitForSelector("#szenenTitel:has-text('Marie mit ihrem Kind')");
  const nachher = await stand(page);
  assert.equal(nachher.szene, vorher.szene);
  assert.deepEqual(nachher.wahlen, vorher.wahlen);

  await page.tap("#menuKnopf");
  await page.fill("#codeEingabe", "WOY-12345-ABCDE");
  await page.tap("#codeLaden");
  assert.match(await page.textContent("#codeMeldung"), /stimmt nicht/);
  await ctx.close();
});

test("Service Worker: neue Fassung kommt trotz HTTP-Cache sofort an, danach offline lesbar", async () => {
  const ctx = await browser.newContext(IPAD);
  const page = await ctx.newPage();
  beobachte(page);
  await page.goto(server.url);
  await bereit(page);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 });
  await page.tap("#beginnen");
  await page.locator("#wahl button").first().tap();
  const alt = await page.evaluate(() => window.woyzeck.version);

  // Neue Fassung auf dem Server: geänderte Datei und geänderter Service Worker.
  writeFileSync(join(wurzel, "js/version.js"), 'export const VERSION = "testneu";\n');
  writeFileSync(join(wurzel, "sw.js"), readFileSync(join(wurzel, "sw.js"), "utf8").replace(`"${alt}"`, '"testneu"'));
  await page.reload();
  await bereit(page);
  assert.equal(await page.evaluate(() => window.woyzeck.version), "testneu", "neue Fassung nach einmal Neuladen");
  await page.waitForFunction(async () => (await caches.keys()).includes("woyzeck-testneu"), null, { timeout: 15000 });
  await page.waitForFunction(async () => !(await caches.keys()).some((k) => k.startsWith("woyzeck-") && k !== "woyzeck-testneu"), null, { timeout: 15000 });

  await ctx.setOffline(true);
  await page.reload();
  await bereit(page);
  assert.equal(await page.evaluate(() => window.woyzeck.version), "testneu");
  assert.ok(await page.isVisible("#weiterlesen"), "offline: Stand und Text sind da");
  await page.tap("#weiterlesen");
  await page.waitForSelector("#text .du-wahl, #text .du-tat");
  await ctx.setOffline(false);
  await ctx.close();
});

test("Handy-Breite: nichts ragt seitlich hinaus, Menü lässt sich öffnen", async () => {
  const ctx = await browser.newContext(HANDY);
  const page = await ctx.newPage();
  beobachte(page);
  await page.goto(server.url);
  await bereit(page);
  const breit = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok((await breit()) <= 0, "Startseite");
  await page.tap("#beginnen");
  await page.locator("#wahl button").first().scrollIntoViewIfNeeded();
  assert.ok((await breit()) <= 0, "Lesen");
  await page.tap("#menuKnopf");
  assert.ok(await page.isVisible("#codeAnzeige"));
  assert.ok((await breit()) <= 0, "Menü");
  await ctx.close();
});

test("Keine Fehler in der Konsole", () => {
  assert.deepEqual(fehler, []);
});
