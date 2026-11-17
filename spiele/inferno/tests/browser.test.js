// Browser-Test: Spiel laden, eine Handlung ausführen, neu laden, Stand ist noch da.
// Läuft in iPad- und Handygröße mit Chromium (Playwright).
import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
import { starteServer } from '../werkzeuge/server.js';

for (const geraet of ['iPad (gen 7)', 'iPhone 13']) {
  test(`Spielstand übersteht Neuladen (${geraet})`, async () => {
    const server = await starteServer(0);
    const url = `http://127.0.0.1:${server.address().port}/`;
    const browser = await chromium.launch();
    try {
      const ctx = await browser.newContext({ ...devices[geraet] });
      const page = await ctx.newPage();
      const fehler = [];
      page.on('pageerror', e => fehler.push(e.message));
      page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
      await page.goto(url);
      await page.getByRole('button', { name: 'Beginnen' }).click();
      await page.getByRole('button', { name: 'Hinab' }).click();
      // Handlung: lauschen (Finger auf das Bild halten) und der Stimme folgen
      await page.locator('figure.miniatur').scrollIntoViewIfNeeded();
      const fig = await page.locator('figure.miniatur').boundingBox();
      const stimme = await page.locator('.stimme').nth(2).boundingBox();
      await page.mouse.move(stimme.x + stimme.width / 2, stimme.y + stimme.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(900);
      await page.mouse.up();
      assert.ok(fig.width > 200);
      await page.locator('.gehoert-liste button').first().click();
      await page.getByText('Am Fuß des Hügels').waitFor();
      // Neu laden: Stand muss noch da sein
      await page.reload();
      await page.getByRole('button', { name: 'Weiterspielen' }).click();
      await page.getByText('Am Fuß des Hügels').waitFor();
      const stand = await page.evaluate(() => JSON.parse(localStorage.getItem('dante.inferno.stand')));
      assert.deepEqual(stand.ort, { abschnitt: 'wald', knoten: 'rand' });
      assert.ok(stand.gesehen['wald:erwachen'] >= 1);
      // Sicherungscode im Menü
      await page.getByRole('button', { name: 'Menü öffnen' }).click();
      await page.getByRole('button', { name: 'Sicherung' }).click();
      await page.getByText('Code erzeugen und kopieren').click();
      await page.waitForFunction(() => document.querySelector('textarea.code').value.length > 10);
      const code = await page.locator('textarea.code').first().inputValue();
      assert.match(code, /^INF1-/);
      // Nichts ragt seitlich heraus
      const breit = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(breit <= 1, 'kein seitliches Scrollen');
      assert.deepEqual(fehler, []);
    } finally {
      await browser.close();
      server.close();
    }
  });
}
