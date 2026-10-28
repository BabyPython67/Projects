// Erzeugt die App-Icons (PNG) mit dem vorinstallierten Chromium.
const { chromium } = require('playwright');
const path = require('path');
const svg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
<defs><radialGradient id="g" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#c3cad3"/><stop offset="1" stop-color="#3f4752"/></radialGradient>
<radialGradient id="j" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffd2a8"/><stop offset="0.5" stop-color="#e8562a"/><stop offset="1" stop-color="#7a1e0a"/></radialGradient>
<radialGradient id="bg" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="#e4cc9c"/><stop offset="1" stop-color="#b8935e"/></radialGradient></defs>
<rect width="100" height="100" fill="url(#bg)"/>
<ellipse cx="50" cy="60" rx="25" ry="22" fill="rgba(40,25,10,.28)"/>
<circle cx="47" cy="52" r="25" fill="url(#g)"/>
<path d="M30 40 Q47 30 66 42" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none"/>
<ellipse cx="76" cy="77" rx="7" ry="6" fill="rgba(40,25,10,.28)"/>
<circle cx="75" cy="74" r="7" fill="url(#j)"/>
</svg>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [name, s] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    await p.setViewportSize({ width: s, height: s });
    await p.setContent(`<html><body style="margin:0">${svg(s)}</body></html>`);
    await p.screenshot({ path: path.join(__dirname, '..', 'icons', name) });
  }
  await b.close();
  console.log('Icons geschrieben');
})();
