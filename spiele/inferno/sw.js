// Service Worker: offline spielbar, neue Fassungen kommen zuverlässig an.
// Strategie: Netz zuerst (mit Revalidierung am HTTP-Cache vorbei), sonst Cache.
// Bei jeder Änderung VERSION erhöhen (gleich wie in js/version.js).
const VERSION = '2026.11.17-2';
const CACHE = 'inferno-' + VERSION;
const DATEIEN = [
  './', 'index.html', 'manifest.webmanifest', 'css/stil.css',
  'js/haupt.js', 'js/skript.js', 'js/zustand.js', 'js/bilder.js', 'js/klang.js', 'js/pruefungen.js', 'js/version.js',
  'daten/werke.js', 'daten/inferno/verse-philalethes.json',
  'daten/inferno/text/01-wald.txt', 'daten/inferno/text/02-vorhoelle.txt', 'daten/inferno/text/03-limbus.txt',
  'daten/inferno/text/04-liebende.txt', 'daten/inferno/text/05-regen.txt', 'daten/inferno/text/06-lasten.txt',
  'daten/inferno/text/07-styx.txt', 'daten/inferno/text/08-dis.txt', 'daten/inferno/text/09-graeber.txt',
  'daten/inferno/text/10-gewalt.txt', 'daten/inferno/text/11-malebolge.txt', 'daten/inferno/text/12-verrat.txt',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', ereignis => {
  ereignis.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(DATEIEN.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', ereignis => {
  ereignis.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('inferno-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

function mitFrist(promise, ms) {
  return new Promise((ok, fehler) => {
    const t = setTimeout(() => fehler(new Error('Zeitüberschreitung')), ms);
    promise.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); fehler(e); });
  });
}

self.addEventListener('fetch', ereignis => {
  const req = ereignis.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  ereignis.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const frisch = req.mode === 'navigate' ? new Request(url.href, { cache: 'no-cache' }) : new Request(req, { cache: 'no-cache' });
    try {
      const antwort = await mitFrist(fetch(frisch), 5000);
      if (antwort.ok) cache.put(req, antwort.clone());
      return antwort;
    } catch {
      const treffer = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('index.html') : null);
      return treffer || new Response('Offline und nicht im Speicher.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
