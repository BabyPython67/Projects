// Browser-Smoke-Test: öffnet index.html wie ein Handy, spielt eine Partie über die Touch-Buttons,
// startet neu und prüft, dass keine Fehler auftreten. Braucht Playwright (npm install playwright);
// ohne Playwright wird der Test übersprungen.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const http = require("http");
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

/* Kleiner statischer Server, der wie GitHub Pages aus dem Repo-Wurzelverzeichnis ausliefert,
   für fehlende Adressen mit der 404.html des Repos (Status 404), wie Pages es tut. */
function serve(root) {
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const seite = path.join(root, "404.html");
      if (fs.existsSync(seite)) { res.writeHead(404, { "content-type": types[".html"] }); fs.createReadStream(seite).pipe(res); }
      else { res.writeHead(404); res.end("404"); }
      return;
    }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

test("Startseite verlinkt alle Spiele unter spiele/; alte Adressen leiten über die 404.html weiter", { skip: playwright ? false : "Playwright nicht installiert" }, async () => {
  const root = path.resolve(__dirname, "..", "..", "..");
  const { server, url } = await serve(root);
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const fehler = [];
    page.on("pageerror", (e) => fehler.push(String(e)));
    await page.goto(url + "/");
    const hrefs = await page.$$eval("a.card", (as) => as.map((a) => a.getAttribute("href")));
    for (const g of ["woyzeck", "carreau", "rungholt", "moorlicht", "johannisnacht", "deichgraf", "brueckenwaerter"]) {
      assert.ok(hrefs.includes(`spiele/${g}/`), `${g} fehlt auf der Startseite: ` + hrefs.join(" "));
    }
    assert.ok(hrefs.every((h) => h.startsWith("spiele/") || h === "vergleich/"), "Startseite zeigt auf alte Adressen: " + hrefs.join(" "));
    for (const href of hrefs) {
      assert.ok(fs.existsSync(path.join(root, href, "index.html")), `${href}index.html fehlt`);
      const antwort = await page.request.get(url + "/" + href);
      assert.equal(antwort.status(), 200, href);
    }
    await page.tap("a.card[href='spiele/deichgraf/']");
    await page.waitForSelector("#btn-build");
    assert.equal(page.url(), url + "/spiele/deichgraf/");
    assert.equal(await page.title(), "Deichgraf");
    // Alte Adressen: die 404.html leitet samt Anhängsel weiter, dann läuft das Spiel.
    for (const [alt, neu] of [["/spiel/?seed=7", "/spiele/deichgraf/?seed=7"], ["/deichgraf/?seed=7", "/spiele/deichgraf/?seed=7"]]) {
      await page.goto(url + alt);
      await page.waitForURL((u) => u.pathname === "/spiele/deichgraf/", { timeout: 10000 });
      assert.equal(page.url(), url + neu);
      await page.waitForSelector("#btn-build");
      assert.equal(await page.title(), "Deichgraf");
    }
    for (const [alt, neu] of [["/spiel/brueckenwaerter/", "/spiele/brueckenwaerter/"], ["/carreau", "/spiele/carreau/"], ["/woyzeck/#x", "/spiele/woyzeck/#x"], ["/johannisnacht/", "/spiele/johannisnacht/"]]) {
      await page.goto(url + alt);
      await page.waitForURL((u) => u.pathname === neu.split("#")[0], { timeout: 10000 });
      assert.equal(page.url(), url + neu);
    }
    assert.equal(await page.title(), "Johannisnacht");
    // Unbekannte Adressen, auch unter spiele/, leiten nicht weiter (keine Schleife).
    for (const adresse of ["/gibtsnicht/", "/spiele/gibtsnicht/"]) {
      const antwort = await page.goto(url + adresse);
      assert.equal(antwort.status(), 404);
      await page.waitForTimeout(300);
      assert.equal(page.url(), url + adresse);
    }
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
    server.close();
  }
});
