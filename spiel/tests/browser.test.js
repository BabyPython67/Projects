// Browser-Smoke-Test: öffnet index.html wie ein Handy, spielt eine Partie über die Touch-Buttons,
// startet neu und prüft, dass keine Fehler auftreten. Braucht Playwright (npm install playwright);
// ohne Playwright wird der Test übersprungen.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

let playwright = null;
try { playwright = require("playwright"); } catch (e) { /* nicht installiert */ }

const SEITE = "file://" + path.resolve(__dirname, "..", "index.html");

test("komplette Partie auf dem Handy, dann Neustart", { skip: playwright ? false : "Playwright nicht installiert" }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const fehler = [];
    page.on("pageerror", (e) => fehler.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
    await page.goto(SEITE + "?seed=7");
    await page.tap("#rules-close");                      // Regeln beim ersten Besuch wegtippen
    assert.equal(await page.textContent("#night"), "1/7");
    assert.equal(await page.textContent("#score"), "0");

    const knopf = { a: "#btn-left", d: "#btn-right", s: "#btn-build", w: "#btn-wait" };
    let zuege = 0;
    for (; zuege < 3000; zuege++) {
      const { over, key } = await page.evaluate(() => {
        const g = window.deichgraf.game;
        return { over: g.over, key: window.Deichgraf.choose(g) };
      });
      if (over) break;
      await page.tap(knopf[key]);
    }
    assert.ok(zuege > 40, "die Partie endete verdächtig früh");
    const ergebnis = await page.evaluate(() => ({ phase: window.deichgraf.game.phase, score: window.deichgraf.game.score }));
    assert.ok(["gewonnen", "verloren"].includes(ergebnis.phase));
    await page.waitForSelector("#overlay.show", { timeout: 5000 });
    assert.match(await page.textContent("#ov-title"), /Sieg!|Verloren/);
    assert.equal(await page.textContent("#ov-score"), `${ergebnis.score} Punkte`);

    await page.tap("#ov-new");                            // Neustart ohne Neuladen
    assert.equal(await page.isVisible("#overlay"), false);
    assert.equal(await page.textContent("#night"), "1/7");
    assert.equal(await page.textContent("#score"), "0");
    await page.tap("#btn-build");
    assert.match(await page.textContent("#log"), /Sandsack auf Abschnitt/);
    await page.tap(".col[data-i='0']");                   // Tipp auf Abschnitt 1: hinlaufen
    await page.waitForFunction(() => window.deichgraf.game.pos === 0 || window.deichgraf.game.hour > 1, null, { timeout: 5000 });
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
  }
});
