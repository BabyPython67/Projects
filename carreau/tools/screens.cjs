// Bildschirmfotos im Handy- und iPad-Format: node tools/screens.cjs [ausgabeordner]
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const out = path.resolve(process.argv[2] || path.join(__dirname, '..', 'docs'));
fs.mkdirSync(out, { recursive: true });
const PORT = 8137;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function touchDrag(page, cdp, x0, y0, x1, y1, steps = 12) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / steps, y: y0 + ((y1 - y0) * i) / steps }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function dismissTip(page) {
  if (await page.locator('#scrTip').isVisible()) {
    await page.tap('#tipOk');
    await sleep(150);
  }
}

async function shoot(browser, name, device, hour) {
  const ctx = await browser.newContext({ ...device });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/index.html?test=1&fresh=1&seed=11&speed=1&hour=${hour}`);
  await sleep(900);
  await page.screenshot({ path: path.join(out, `${name}-titel.png`) });
  await page.tap('#btnVillage');
  await sleep(300);
  await page.screenshot({ path: path.join(out, `${name}-gegner.png`) });
  await page.tap('[data-opp="marcel"]');
  const cdp = await ctx.newCDPSession(page);
  // bis der Mensch dran ist (Sau oder Kugel)
  for (let i = 0; i < 80; i++) {
    const ph = await page.evaluate(() => window.__carreau.game.phase);
    if (ph === 'aim') break;
    await sleep(250);
  }
  await sleep(600);
  await page.screenshot({ path: path.join(out, `${name}-tipp.png`) });
  await dismissTip(page);
  await sleep(200);
  await page.screenshot({ path: path.join(out, `${name}-sau.png`) });
  // Sau werfen: Knopf halten und loslassen
  const b = await page.locator('#throwBtn').boundingBox();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }] });
  await sleep(700);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  for (let i = 0; i < 120; i++) {
    const g = await page.evaluate(() => ({ ph: window.__carreau.game.phase, sp: window.__carreau.game.state.phase, rem: window.__carreau.game.state.remaining[0] }));
    if (g.ph === 'aim' && g.sp === 'play') break;
    await sleep(250);
  }
  await sleep(700);
  await dismissTip(page);
  const vp = page.viewportSize();
  await touchDrag(page, cdp, vp.width / 2, vp.height * 0.5, vp.width / 2 + 10, vp.height * 0.45);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }] });
  await sleep(900);
  await page.screenshot({ path: path.join(out, `${name}-zielen.png`) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(500);
  await page.screenshot({ path: path.join(out, `${name}-flug.png`) });
  await sleep(4000);
  await page.screenshot({ path: path.join(out, `${name}-lage.png`) });
  await ctx.close();
  return errors;
}

(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, 'serve.mjs'), String(PORT)], { stdio: 'ignore' });
  await sleep(500);
  const browser = await chromium.launch();
  let errs = [];
  try {
    errs = errs.concat(await shoot(browser, 'handy', devices['iPhone 13'], +(process.env.HOUR || 16)));
    errs = errs.concat(await shoot(browser, 'ipad', devices['iPad (gen 7)'], +(process.env.HOUR || 16)));
    errs = errs.concat(await shoot(browser, 'ipad-quer', devices['iPad (gen 7) landscape'], 21.5));
  } finally {
    await browser.close();
    srv.kill();
  }
  console.log(errs.length ? 'Konsolenfehler:\n' + errs.join('\n') : 'Keine Konsolenfehler');
  console.log('Bilder in', out);
})();
