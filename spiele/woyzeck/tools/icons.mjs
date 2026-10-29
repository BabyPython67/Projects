// Erzeugt die PNG-Symbole für Home-Bildschirm und Manifest aus icons/icon.svg (braucht Playwright).
// Aufruf aus dem Ordner woyzeck: node tools/icons.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORDNER } from "./lade.mjs";
import { ladePlaywright } from "./playwright.mjs";

const pw = ladePlaywright();
if (!pw) { console.error("Playwright fehlt: npm install && npx playwright install chromium"); process.exit(1); }
const svg = readFileSync(join(ORDNER, "icons/icon.svg"), "utf8");
const browser = await pw.chromium.launch();
for (const [name, groesse, rand] of [["icon-180.png", 180, 0], ["icon-192.png", 192, 0], ["icon-512.png", 512, 0], ["icon-512-maskable.png", 512, 0.12]]) {
  const page = await browser.newPage({ viewport: { width: groesse, height: groesse } });
  const innen = Math.round(groesse * (1 - 2 * rand));
  await page.setContent(`<body style="margin:0;background:#1f1b16;display:grid;place-items:center;height:${groesse}px">
    <div style="width:${innen}px;height:${innen}px">${svg.replace("<svg ", `<svg width="${innen}" height="${innen}" `)}</div></body>`);
  await page.screenshot({ path: join(ORDNER, "icons", name) });
  await page.close();
  console.log("icons/" + name);
}
await browser.close();
