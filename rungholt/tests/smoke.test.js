// Smoke-Tests für RUNGHOLT: öffnen die Seite wie ein Handy und spielen über die echte Oberfläche,
// nur mit Tipp-Eingaben. Braucht Playwright (npm install playwright && npx playwright install chromium);
// ohne Playwright werden die Tests übersprungen.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");
const R = require("../engine.js");

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
const ruhe = (page) => page.waitForFunction(() => !window.rungholt.busy, null, { timeout: 15000 });
const zustand = (page) => page.evaluate(() => {
  const g = window.rungholt.game;
  return { screen: document.querySelector("#app").dataset.screen, over: g.over, won: g.won, cause: g.cause, score: g.score, mut: g.mut, step: g.step, tide: g.tide, dice: g.dice.length, enemyHp: g.enemy ? g.enemy.hp : null, gear: g.gear.length, defeated: g.defeated };
});

/* Spielt eine Nacht komplett über Tipp-Eingaben: Der Autopilot sagt nur, was er tun würde, getippt wird auf die Knöpfe. */
async function nachtSpielen(page) {
  let tipps = 0;
  for (let i = 0; i < 4000; i++) {
    await ruhe(page);
    const a = await page.evaluate(() => { const g = window.rungholt.game; return g.over ? null : window.rungholt.R.choose(g); });
    if (!a) break;
    if (a.type === "node") await page.tap(`.node[data-node="${a.i}"]`);
    else if (a.type === "event" || a.type === "rest") await page.tap(`.choice[data-choice="${a.i}"]`);
    else if (a.type === "reward" || a.type === "upgrade" || a.type === "drop") await page.tap(`.pick[data-pick="${a.i}"]`);
    else if (a.type === "place") { await page.tap(`.die[data-die="${a.die}"]`); await page.tap(`.gear[data-gear="${a.gear}"]`); }
    else if (a.type === "end") await page.tap("#btn-end");
    tipps++;
  }
  await page.waitForSelector('#app[data-screen="over"]', { timeout: 15000 });
  await ruhe(page);
  return tipps;
}

test("komplette Nacht per Touch bis zum Ende, Anzeige stimmt, Fortschritt bleibt, noch eine Nacht", { skip }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage(HANDY);
    const fehler = beobachten(page);
    await page.goto(SEITE + "?seed=7&schnell=1");
    assert.equal(await page.title(), "Rungholt");
    assert.equal(await page.textContent("#btn-start"), "Laterne nehmen");
    assert.match(await page.textContent("#stats"), /Noch keine Nacht/);
    await page.tap("#btn-start");
    assert.equal((await zustand(page)).screen, "map");

    const tipps = await nachtSpielen(page);
    const ende = await zustand(page);
    assert.ok(tipps > 30, `nur ${tipps} Tipps`);
    assert.equal(ende.over, true);
    assert.ok(["glocke", "mut", "flut"].includes(ende.cause), ende.cause);
    assert.match(await page.textContent("#ov-title"), /Die Glocke|Umkehr|Die Flut/);
    assert.equal(await page.textContent("#ov-score"), `${ende.score} Punkte`);
    assert.equal(await page.textContent("#hud-score"), String(ende.score));
    // Dieselbe Nacht in Node mit demselben Autopiloten: gleiche Startzahl, gleiches Ergebnis.
    const node = new R.Game({ seed: 7 }); R.autoplay(node);
    assert.deepEqual([ende.won, ende.cause, ende.score], [node.won, node.cause, node.score]);
    const profil = await page.evaluate(() => window.rungholt.profile);
    assert.equal(profil.runs, 1);
    assert.equal(profil.bestScore, ende.score);
    assert.equal(profil.history.length, 1);

    await page.tap("#btn-again");
    await ruhe(page);
    const neu = await zustand(page);
    assert.equal(neu.screen, "map");
    assert.deepEqual([neu.over, neu.step, neu.tide, neu.gear], [false, 0, 0, 3]);

    await page.reload();
    assert.match(await page.textContent("#stats"), /1 Nacht, /);
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
  }
});

test("Begegnung von Hand: Würfel tippen, Gegenstand tippen, Runde beenden; Falsches wird abgewiesen; Hilfe und Ton", { skip }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage(HANDY);
    const fehler = beobachten(page);
    await page.goto(SEITE + "?seed=7&schnell=1");
    await page.tap("#btn-start");
    await page.tap('.node[data-node="0"]');         // der erste Weg ist immer eine Begegnung
    await ruhe(page);
    let z = await zustand(page);
    assert.equal(z.screen, "fight");
    assert.equal(z.dice, 3);
    assert.equal(await page.$$eval(".die", (els) => els.length), 3);
    assert.equal(await page.$$eval(".gear", (els) => els.length), 3);
    assert.match(await page.textContent("#intent"), /Nächster Zug/);

    // Würfel wählen: er wird markiert, passende Gegenstände leuchten.
    await page.tap('.die[data-die="0"]');
    assert.equal(await page.$$eval(".die.sel", (els) => els.length), 1);
    assert.ok((await page.$$eval(".gear.fits", (els) => els.length)) >= 2);
    const augen = parseInt(await page.getAttribute('.die[data-die="0"]', "data-value"), 10);
    const hp = z.enemyHp;
    await page.tap('.gear[data-gear="0"]');          // Laterne: Schlag in Würfelhöhe
    await ruhe(page);
    z = await zustand(page);
    assert.equal(z.dice, 2);
    assert.equal(z.enemyHp, hp - augen);
    assert.match(await page.textContent("#enemy-hp"), new RegExp(`^${hp - augen}/`));

    // Ein Würfel über 3 passt nicht aufs Fläschchen: nichts passiert.
    const werte = await page.$$eval(".die", (els) => els.map((e) => parseInt(e.dataset.value, 10)));
    const gross = werte.findIndex((v) => v > 3);
    if (gross >= 0) {
      await page.tap(`.die[data-die="${gross}"]`);
      await page.tap('.gear[data-gear="2"]');
      await ruhe(page);
      assert.equal((await zustand(page)).dice, 2, "unpassender Würfel wurde angenommen");
    }
    const mut = z.mut;
    await page.tap("#btn-end");
    await ruhe(page);
    z = await zustand(page);
    assert.ok(z.dice >= 2, "nach der Runde gibt es neue Würfel");
    assert.ok(z.mut <= mut, "der Gegner hat geschlagen oder Schutz gebaut");
    assert.equal(z.screen, "fight");

    await page.tap("#btn-help");
    assert.ok(await page.isVisible("#help"));
    await page.tap("#help-close");
    assert.equal(await page.isVisible("#help"), false);
    assert.equal(await page.textContent("#btn-sound"), "♪ Ton");
    await page.tap("#btn-sound");
    assert.equal(await page.textContent("#btn-sound"), "♪ aus");
    assert.equal(await page.evaluate(() => window.rungholt.profile.sound), false);
    await page.tap("#btn-chronik");
    assert.equal(await page.$$eval("#chronik-list details", (els) => els.length), 1);
    await page.tap("#chronik-close");
    assert.equal((await zustand(page)).screen, "fight");
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
  }
});

/* Kleiner statischer Server, der wie GitHub Pages aus dem Repo-Wurzelverzeichnis ausliefert. */
function serve(root) {
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };
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
  const { server, url } = await serve(path.resolve(DIR, ".."));
  const browser = await playwright.chromium.launch();
  try {
    const context = await browser.newContext(HANDY);
    const page = await context.newPage();
    const fehler = beobachten(page);
    await page.goto(url + "/rungholt/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(async () => (await caches.has("rungholt/v1")) && (await (await caches.open("rungholt/v1")).keys()).length >= 6, null, { timeout: 15000 });
    server.close();
    await context.setOffline(true);
    await page.goto(url + "/rungholt/?seed=3&schnell=1");
    assert.equal(await page.title(), "Rungholt");
    await page.tap("#btn-start");
    await page.tap('.node[data-node="0"]');
    await ruhe(page);
    assert.equal((await zustand(page)).screen, "fight");
    assert.deepEqual(fehler, []);
  } finally {
    await browser.close();
    server.close();
  }
});

test("Handy und iPad quer: jede Tippfläche mindestens 44×44 px, eine Runde nur per Tipp, nichts ragt über den Rand", { skip }, async () => {
  const browser = await playwright.chromium.launch();
  try {
    for (const vp of [{ name: "Handy hochkant", width: 390, height: 844 }, { name: "iPad quer", width: 1180, height: 820 }]) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, isMobile: true, hasTouch: true });
      const fehler = beobachten(page);
      await page.goto(SEITE + "?seed=11&schnell=1");
      const messen = async (schirm) => {
        const kleine = await page.$$eval("button", (els) => els
          .filter((b) => !b.disabled && b.offsetParent !== null)
          .map((b) => { const r = b.getBoundingClientRect(); return { knopf: b.textContent.trim().slice(0, 24) || b.id, w: Math.round(r.width), h: Math.round(r.height) }; })
          .filter((b) => b.w < 44 || b.h < 44));
        assert.deepEqual(kleine, [], `${vp.name}, ${schirm}: zu kleine Tippflächen`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${vp.name}, ${schirm}: Seite breiter als der Bildschirm`);
      };
      await messen("Titel");
      await page.tap("#btn-start");
      await messen("Karte");
      await page.tap('.node[data-node="0"]');
      await ruhe(page);
      assert.equal((await zustand(page)).screen, "fight");
      await messen("Begegnung");
      // Jeden Würfel per Tipp auf den ersten Gegenstand setzen, der ihn nimmt; dann die Runde beenden.
      let gesetzt = 0;
      for (let k = 0; k < 8; k++) {
        const paar = await page.evaluate(() => { const g = window.rungholt.game; for (let di = 0; di < g.dice.length; di++) for (let gi = 0; gi < g.gear.length; gi++) if (g.fits(g.dice[di], g.gear[gi])) return { di, gi }; return null; });
        if (!paar) break;
        await page.tap(`.die[data-die="${paar.di}"]`);
        await page.tap(`.gear[data-gear="${paar.gi}"]`);
        await ruhe(page);
        gesetzt++;
        if ((await zustand(page)).screen !== "fight") break;
      }
      assert.ok(gesetzt >= 1, "kein Würfel ließ sich per Tipp setzen");
      if ((await zustand(page)).screen === "fight") {
        await page.tap("#btn-end");
        await ruhe(page);
        const z = await zustand(page);
        assert.ok(["fight", "reward", "over"].includes(z.screen), z.screen);
        if (z.screen === "fight") assert.ok(z.dice >= 1, "keine neuen Würfel nach der Runde");
      }
      assert.deepEqual(fehler, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
