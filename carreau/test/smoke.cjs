// Smoke-Test im Browser: Handy-Viewport, nur Touch-Eingaben, eine ganze Partie bis 7 Punkte.
// Start: npm run smoke   (braucht Playwright mit Chromium)
// Testmodus der Seite: ?test=1 -> fester Zufall (seed), Zeitraffer (speed), feste Tageszeit.
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 8139;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_MS = 6 * 60 * 1000;

async function touch(cdp, type, x, y) {
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(x), y: Math.round(y) }] });
}

(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, '..', 'tools', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
  await sleep(600);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const cdp = await ctx.newCDPSession(page);
  const t0 = Date.now();
  let ok = false, throws = 0, drags = 0, menes = 0, result = '';
  try {
    await page.goto(`http://localhost:${PORT}/index.html?test=1&fresh=1&seed=5&speed=8&hour=15`);
    await page.waitForSelector('#btnVillage');
    console.log('Viewport', JSON.stringify(page.viewportSize()), 'Touch:', await page.evaluate(() => navigator.maxTouchPoints > 0));
    await page.tap('#btnVillage');
    await page.tap('[data-len="7"]');
    await page.tap('[data-opp="lucien"]');
    const shots = ['half', 'roll', 'high', 'half', 'shot'];
    while (Date.now() - t0 < MAX_MS) {
      if (await page.locator('#scrEnd').isVisible()) {
        result = (await page.textContent('#endTitle')) + ' ' + (await page.textContent('#endScore'));
        ok = true;
        break;
      }
      if (await page.locator('#scrTip').isVisible()) { await page.tap('#tipOk'); continue; }
      if (await page.locator('#meneCard').isVisible()) { menes++; await page.tap('#meneNext'); continue; }
      const g = await page.evaluate(() => {
        const G = window.__carreau.game;
        const s = G.state;
        const jack = s && s.bodies.find((b) => b.kind === 'jack' && b.alive);
        const j = jack ? G.r.w2s(jack.x, jack.y) : null;
        return { phase: G.phase, sp: s && s.phase, team: G.team, jack: j, place: G.aim && G.aim.place, score: s && s.score };
      });
      if (g.phase !== 'aim' || g.team !== 0) { await sleep(120); continue; }
      await sleep(450); // Tipps erscheinen kurz nach Zugbeginn
      if (await page.locator('#scrTip').isVisible()) { await page.tap('#tipOk'); await sleep(100); }
      const btn = await page.locator('#throwBtn').boundingBox();
      if (g.place) { await page.tap('#throwBtn'); continue; }
      if (g.sp === 'play') {
        const key = shots[throws % shots.length];
        await page.tap(`#shotbar [data-shot="${key}"]`);
        if (key === 'shot' && g.jack) {
          // Schießen: auf die Kugel an der Sau tippen (rastet ein)
          await touch(cdp, 'touchStart', g.jack[0], g.jack[1]);
          await touch(cdp, 'touchEnd');
        } else {
          // Zielmarke mit dem Finger ein Stück verschieben
          const x0 = 200, y0 = 420;
          await touch(cdp, 'touchStart', x0, y0);
          for (let i = 1; i <= 8; i++) await touch(cdp, 'touchMove', x0 + (i * (throws % 3 - 1) * 3), y0 - i * 2);
          await touch(cdp, 'touchEnd');
          drags++;
        }
      }
      // Wurfknopf halten (Pendel läuft) und loslassen
      await touch(cdp, 'touchStart', btn.x + btn.width / 2, btn.y + btn.height / 2);
      await sleep(350 + (throws % 4) * 170);
      await touch(cdp, 'touchEnd');
      throws++;
      await sleep(150);
    }
    const state = await page.evaluate(() => {
      const p = window.__carreau.profile;
      return { games: p.games, rating: p.rating, match: p.match };
    });
    console.log(`Würfe per Touch: ${throws} (davon ${drags} mit Ziehen) · Aufnahmen bestätigt: ${menes}`);
    console.log(`Ende erreicht: ${ok} · ${result} · Profil: ${state.games} Partie(n), Wertung ${state.rating}, offene Partie: ${state.match ? 'ja' : 'nein'}`);
    await page.screenshot({ path: path.join(__dirname, '..', 'docs', 'smoke-ende.png') });
  } finally {
    await browser.close();
    srv.kill();
  }
  console.log(`Dauer ${(Date.now() - t0) / 1000 | 0} s · Konsolenfehler: ${errors.length}`);
  for (const e of errors) console.log('  ', e);
  if (!ok || errors.length) {
    console.log('SMOKE-TEST FEHLGESCHLAGEN');
    process.exit(1);
  }
  console.log('SMOKE-TEST BESTANDEN');
})().catch((e) => { console.error(e); process.exit(1); });
