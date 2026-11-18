// Jede Prüfung lässt sich mit ihrer Geste abschließen und führt weiter (iPhone-Größe, Finger).
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
import { starteServer } from '../werkzeuge/server.js';

const server = await starteServer(0);
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();

async function seite(ziel) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', e => fehler.push(e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__inferno && window.__inferno.app.werk);
  await page.evaluate(z => {
    const { app, Z, gehe } = window.__inferno;
    app.stand = Z.neuerStand('inferno');
    app.stand.getragen.ciacco = 'Ciacco'; // ein Name für die Sterne
    const [a] = z.split(':'); gehe(a + ':'); gehe(z);
  }, ziel);
  return { page, fehler, ctx };
}
const ort = () => window.__inferno.app.stand.ort.abschnitt + ':' + window.__inferno.app.stand.ort.knoten;
async function mitte(page, sel) { const b = await page.locator(sel).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, b }; }
async function zieh(page, sel, dx, dy, schritte = 12) {
  await page.locator(sel).first().scrollIntoViewIfNeeded();
  const { x, y } = await mitte(page, sel);
  await page.mouse.move(x, y); await page.mouse.down();
  for (let i = 1; i <= schritte; i++) await page.mouse.move(x + dx * i / schritte, y + dy * i / schritte);
  await page.mouse.up();
}
const klick = (page, name) => page.getByRole('button', { name }).click();

const FAELLE = {
  'wald:rand': async p => { await klick(p, 'Hinauf, zum Licht'); await klick(p, 'Noch einmal hinauf'); await klick(p, 'Zu der Stimme im Schatten'); return 'wald:schatten'; },
  'vorhoelle:die_lauen': async p => { await klick(p, 'Vorübergehen'); return 'vorhoelle:fahne'; },
  'limbus:dichter': async p => { await p.locator('.luecke').nth(5).click(); return 'limbus:sechster'; },
  'regen:ciacco': async p => { await p.locator('.aktionen').last().scrollIntoViewIfNeeded(); await p.waitForFunction(() => window.__inferno.app.stand.ort.knoten !== 'ciacco', null, { timeout: 25000 }); return 'regen:gesunken'; },
  'lasten:kreis': async p => { for (let i = 0; i < 2; i++) { await p.locator('.gesichterfeld').click(); await p.waitForTimeout(2100); } await klick(p, 'Aufhören zu suchen'); return null; },
  'styx:argenti': async p => { await p.locator('.aktionen').last().scrollIntoViewIfNeeded(); await p.waitForFunction(() => window.__inferno.app.stand.ort.knoten !== 'argenti', null, { timeout: 20000 }); return 'styx:wegstossen'; },
  'dis:furien': async p => {
    await p.locator('.hand').scrollIntoViewIfNeeded();
    const { x, y } = await mitte(p, '.hand'); await p.mouse.move(x, y); await p.mouse.down();
    await p.getByRole('button', { name: 'Die Augen öffnen' }).waitFor({ timeout: 25000 }).catch(() => {});
    await p.mouse.up(); await klick(p, 'Die Augen öffnen'); return null;
  },
  'graeber:cavalcante': async p => { await p.locator('.aktionen').last().scrollIntoViewIfNeeded(); await p.waitForFunction(() => window.__inferno.app.stand.ort.knoten !== 'cavalcante', null, { timeout: 20000 }); return null; },
  'gewalt:wald': async p => { await zieh(p, '.zweigfeld .marke', 0, 50); await klick(p, 'Den Zweig fallen lassen'); return 'gewalt:pier'; },
  'gewalt:jagd': async p => {
    for (let i = 0; i < 7; i++) {
      const busch = await mitte(p, '.busch'); const blatt = await mitte(p, '.blatt-stueck');
      await zieh(p, '.blatt-stueck', busch.x - blatt.x, busch.y - blatt.y, 8);
    }
    await klick(p, 'Aufstehen'); return null;
  },
  'gewalt:brunetto': async p => { for (let i = 0; i < 20 && await p.locator('.schritt-knopf').count(); i++) await p.locator('.schritt-knopf').click(); await klick(p, 'Ihm nachsehen'); return 'gewalt:nachsehen'; },
  'malebolge:flucht_anfang': async p => { await p.getByRole('button', { name: 'Aufsehen' }).click({ timeout: 25000 }); return 'malebolge:heuchler'; },
  'malebolge:aufstieg': async p => {
    for (let n = 0; n < 12 && !(await p.getByRole('button', { name: 'Oben. Atmen.' }).count()); n++) {
      const steine = p.locator('.wand .marke:not(.faellt)');
      await steine.first().waitFor();
      await steine.nth(0).click(); await p.waitForTimeout(100);
      const traegt = (await p.locator('.wand .marke.traegt').count()) ? '.wand .marke.traegt' : '.wand .marke:not(.wackelt):not(.faellt)';
      const { x, y } = await mitte(p, traegt); await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up();
      await p.waitForTimeout(400);
    }
    await klick(p, 'Oben. Atmen.'); return null;
  },
  'malebolge:adam': async p => { await klick(p, 'Mich abwenden'); return 'malebolge:scham'; },
  'verrat:ugolino': async p => { await klick(p, 'Weiter zuhören'); await klick(p, 'Nicht mehr hören'); return 'verrat:weggehoert'; },
  'verrat:abstieg': async p => { await zieh(p, '.schacht', 0, 200, 20); await zieh(p, '.schacht', 0, 200, 20); await zieh(p, '.schacht', 0, -200, 20); await zieh(p, '.schacht', 0, -200, 20); await klick(p, 'Weiter'); return null; },
  'verrat:sterne_auf': async p => { await klick(p, 'Weiter'); return 'verrat:ende'; },
};

describe('Jede Prüfung lässt sich abschließen', { concurrency: 6 }, () => {
  for (const [ziel, spiele] of Object.entries(FAELLE)) {
    it(ziel, { timeout: 60000 }, async () => {
      const { page, fehler, ctx } = await seite(ziel);
      try {
        await page.locator('.probe, .frist-knoten').first().waitFor();
        const erwartet = await spiele(page);
        await page.waitForFunction(z => window.__inferno.app.stand.ort.abschnitt + ':' + window.__inferno.app.stand.ort.knoten !== z, ziel, { timeout: 20000 });
        const jetzt = await page.evaluate(ort);
        if (erwartet) assert.equal(jetzt, erwartet);
        assert.deepEqual(fehler, []);
      } finally { await ctx.close(); }
    });
  }
});

after(async () => { await browser.close(); server.close(); });
