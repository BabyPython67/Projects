// Rendert die App-Icons aus icons/icon.svg (einmalig, Ergebnis liegt im Repo).
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const svg = await readFile(new URL('../icons/icon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch();
for (const g of [180, 192, 512]) {
  const page = await browser.newPage({ viewport: { width: g, height: g }, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0}</style>${svg.replace('<svg ', `<svg width="${g}" height="${g}" `)}`);
  await page.screenshot({ path: new URL(`../icons/icon-${g}.png`, import.meta.url).pathname });
  await page.close();
}
await browser.close();
console.log('Icons erzeugt.');
