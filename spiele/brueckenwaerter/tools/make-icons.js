// Erzeugt icon-192.png und icon-512.png aus icon.svg. Einmalig: node spiele/brueckenwaerter/tools/make-icons.js
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
(async () => {
  const dir = path.resolve(__dirname, "..");
  const svg = fs.readFileSync(path.join(dir, "icon.svg"), "utf8");
  const browser = await chromium.launch();
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
    await page.screenshot({ path: path.join(dir, `icon-${size}.png`), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
  }
  await browser.close();
  console.log("Icons geschrieben");
})();
