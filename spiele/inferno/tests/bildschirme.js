// Katalog aller Bildschirmarten des Spiels und wie man sie erreicht.
// Genutzt vom Layout-Test (tests/layout.test.js) und vom Screenshot-Werkzeug.
import { devices } from 'playwright';

export const GERAETE = [
  { name: 'ipad-hoch', ...devices['iPad (gen 7)'] },
  { name: 'ipad-quer', ...devices['iPad (gen 7) landscape'] },
  { name: 'handy-hoch', ...devices['iPhone 13'] },
  { name: 'handy-quer', ...devices['iPhone 13 landscape'] },
];

// art: titel | kapitel | szene | lausch | pruefung | ende | tafeln | menue
export const BILDSCHIRME = [
  { name: 'titel-neu', art: 'titel' },
  { name: 'titel-weiter', art: 'titel', mitStand: true },
  { name: 'kapitel-wald', art: 'kapitel', ziel: 'wald:' },
  { name: 'kapitel-liebende', art: 'kapitel', ziel: 'liebende:' },
  { name: 'kapitel-malebolge', art: 'kapitel', ziel: 'malebolge:' },
  { name: 'kapitel-verrat', art: 'kapitel', ziel: 'verrat:' },
  { name: 'lausch-wald', art: 'lausch', ziel: 'wald:erwachen', ohneKapitel: true },
  { name: 'szene-vergil', art: 'szene', ziel: 'wald:schatten' },
  { name: 'szene-limbus', art: 'szene', ziel: 'limbus:donner', ohneKapitel: true },
  { name: 'szene-sturm', art: 'lausch', ziel: 'liebende:sturm' },
  { name: 'szene-dis', art: 'szene', ziel: 'dis:stadt', ohneKapitel: true },
  { name: 'szene-malebolge', art: 'szene', ziel: 'malebolge:uebel', ohneKapitel: true },
  { name: 'szene-luzifer', art: 'szene', ziel: 'verrat:luzifer' },
  { name: 'pruefung-huegel', art: 'pruefung', ziel: 'wald:rand' },
  { name: 'pruefung-vorueber', art: 'pruefung', ziel: 'vorhoelle:die_lauen' },
  { name: 'pruefung-ehre', art: 'pruefung', ziel: 'limbus:dichter' },
  { name: 'pruefung-wind', art: 'pruefung', ziel: 'liebende:paar' },
  { name: 'pruefung-ciacco', art: 'pruefung', ziel: 'regen:ciacco' },
  { name: 'pruefung-gesichter', art: 'pruefung', ziel: 'lasten:kreis' },
  { name: 'pruefung-argenti', art: 'pruefung', ziel: 'styx:argenti' },
  { name: 'pruefung-medusa', art: 'pruefung', ziel: 'dis:furien' },
  { name: 'pruefung-zoegern', art: 'pruefung', ziel: 'graeber:cavalcante' },
  { name: 'pruefung-zweig', art: 'pruefung', ziel: 'gewalt:wald' },
  { name: 'pruefung-blaetter', art: 'pruefung', ziel: 'gewalt:jagd' },
  { name: 'pruefung-schritt', art: 'pruefung', ziel: 'gewalt:brunetto' },
  { name: 'pruefung-flucht', art: 'pruefung', ziel: 'malebolge:flucht_anfang' },
  { name: 'pruefung-griff', art: 'pruefung', ziel: 'malebolge:aufstieg' },
  { name: 'pruefung-zusehen', art: 'pruefung', ziel: 'malebolge:adam' },
  { name: 'pruefung-ugolino', art: 'pruefung', ziel: 'verrat:ugolino' },
  { name: 'pruefung-umkehr', art: 'pruefung', ziel: 'verrat:abstieg' },
  { name: 'pruefung-sterne', art: 'pruefung', ziel: 'verrat:sterne_auf' },
  { name: 'ende', art: 'ende', ziel: 'verrat:ende' },
  { name: 'tafeln-alle', art: 'tafeln' },
  { name: 'menue-merkbuch', art: 'menue', reiter: 'Merkbuch' },
  { name: 'menue-gesaenge', art: 'menue', reiter: 'Gesänge' },
  { name: 'menue-gesang', art: 'menue', reiter: 'Gesänge', gesang: true },
  { name: 'menue-karte', art: 'menue', reiter: 'Karte' },
  { name: 'menue-sicherung', art: 'menue', reiter: 'Sicherung' },
  { name: 'menue-mehr', art: 'menue', reiter: 'Mehr' },
];

// Bringt die Seite auf den gewünschten Bildschirm. Jede Bildschirmart beginnt
// mit frisch geladener Seite, damit keine Zeitgeber älterer Prüfungen stören.
export async function zeige(page, url, b, { schnell = false } = {}) {
  const w = ms => page.waitForTimeout(schnell ? Math.round(ms / 4) : ms);
  await page.goto(url);
  await page.waitForFunction(() => window.__inferno && window.__inferno.app.werk);
  if (b.art === 'titel') {
    if (b.mitStand) {
      await page.evaluate(() => { const { app, Z, gehe } = window.__inferno; app.stand = Z.neuerStand('inferno'); gehe('liebende:minos'); });
      await page.goto(url);
      await page.waitForFunction(() => window.__inferno && window.__inferno.app.werk);
    }
    await w(900);
    return;
  }
  if (b.art === 'tafeln') {
    // Alle Tafeln des Spiels auf einer Seite, in der Größe, in der das Spiel sie zeigt
    await page.evaluate(() => {
      const { app, Z, baueTafel, TAFELN } = window.__inferno;
      app.stand = Z.neuerStand('inferno');
      const s = document.querySelector('#seite'); s.className = 'blatt'; s.replaceChildren();
      const gesehen = new Set();
      for (const [n, t] of Object.entries(TAFELN)) { if (gesehen.has(t.datei)) continue; gesehen.add(t.datei); s.append(baueTafel(n).fig); }
    });
    await page.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 60000 });
    return;
  }
  // Ein Stand, der schon einige Gesänge kennt (für Menü und Gesangsbuch).
  await page.evaluate(({ ziel, ohneKapitel, art }) => {
    const { app, Z, gehe } = window.__inferno;
    app.stand = Z.neuerStand('inferno');
    for (let g = 1; g <= 6; g++) app.stand.gesaenge[g] = 1;
    if (ohneKapitel || art === 'menue') { gehe('wald:'); }
    if (art === 'menue') { gehe('liebende:sturm'); return; }
    if (ohneKapitel) {
      // Abschnitt einmal betreten, damit kein Kapitelblatt kommt
      const [a] = ziel.split(':');
      gehe(a + ':');
    }
    gehe(ziel);
  }, { ziel: b.ziel || '', ohneKapitel: !!b.ohneKapitel, art: b.art });
  if (b.art === 'kapitel') await page.locator('.kapitel-titel').waitFor();
  if (b.art === 'pruefung') await w(1600);
  if (b.art === 'menue') {
    await page.getByRole('button', { name: 'Menü öffnen' }).click();
    await page.locator('.reiter button', { hasText: b.reiter }).click();
    if (b.gesang) await page.locator('.gesang-raster button:not([disabled])').first().click();
  }
  await page.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 20000 });
  await w(700); // Einblend-Animationen
}
