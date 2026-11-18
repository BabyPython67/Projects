// Spielstände aus Runde 2 (Fassung 2026.11.17-4) laden weiter oder führen zu einem klaren Hinweis.
// tests/stand-runde2.json wurde mit dem Code von Runde 2 (Stand ef9fd68) im Browser erzeugt.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium, devices } from 'playwright';
import { starteServer } from '../werkzeuge/server.js';
import * as Z from '../js/zustand.js';

const alt = JSON.parse(await readFile(new URL('./stand-runde2.json', import.meta.url), 'utf8'));

test('Logik: Stand aus Runde 2 wird übernommen und umgeschrieben', () => {
  assert.equal(alt.fassung, '2026.11.17-4');
  assert.equal(alt.stand.v, 1);
  const s = Z.deserialisiere(JSON.stringify(alt.stand));
  assert.equal(s.v, Z.STAND_VERSION);
  assert.deepEqual(s.ort, alt.stand.ort);
  assert.equal(s.flags.sechster, true, 'Die Wahl „demut“ heißt jetzt „sechster“');
  assert.equal(s.flags.demut, undefined);
  assert.deepEqual(s.gesehen, alt.stand.gesehen);
});

async function mitStand(stand, fn) {
  const server = await starteServer(0);
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
    await ctx.addInitScript(t => { if (!sessionStorage.getItem('gesetzt')) { localStorage.setItem('dante.inferno.stand', t); sessionStorage.setItem('gesetzt', '1'); } }, JSON.stringify(stand));
    const page = await ctx.newPage();
    const fehler = [];
    page.on('pageerror', e => fehler.push(e.message));
    await page.goto(url);
    await fn(page);
    assert.deepEqual(fehler, []);
  } finally { await browser.close(); server.close(); }
}

test('Browser: Stand aus Runde 2 läuft weiter, mit Hinweis auf dem Titelblatt', async () => {
  await mitStand(alt.stand, async page => {
    await page.getByText('Dein Weg aus der früheren Fassung ist übernommen').waitFor();
    await page.getByRole('button', { name: 'Weiterspielen' }).click();
    await page.locator('h2.ort', { hasText: 'Erster Kreis, im Licht' }).waitFor();
    // Die Wahl aus Runde 2 wirkt: Dante steht als Sechster am Ende der Reihe
    await page.getByText('Ich stelle mich ans Ende, hinter Vergil').waitFor();
    const gespeichert = await page.evaluate(() => JSON.parse(localStorage.getItem('dante.inferno.stand')));
    assert.equal(gespeichert.v, 2);
    console.log('# Runde-2-Stand geladen: Ort', gespeichert.ort.abschnitt + ':' + gespeichert.ort.knoten, '· Merkzeichen', Object.keys(gespeichert.flags).join(', '));
  });
});

test('Browser: Stand mit einem Ort, den es nicht mehr gibt, führt zu einem klaren Hinweis', async () => {
  const kaputt = { ...alt.stand, ort: { abschnitt: 'limbus', knoten: 'gibt_es_nicht_mehr' } };
  await mitStand(kaputt, async page => {
    await page.getByRole('button', { name: 'Weiterspielen' }).click();
    await page.getByText('Der gespeicherte Ort existiert in dieser Fassung nicht mehr').waitFor();
    await page.locator('.kapitel-titel, h2.ort').first().waitFor();
    console.log('# Ort fehlt: Hinweis gezeigt, weiter am Anfang des Abschnitts Limbus');
  });
});
