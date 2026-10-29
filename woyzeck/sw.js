// Service Worker für „Woyzeck“: macht das Spiel offline lesbar und liefert neue Fassungen zuverlässig aus.
// Strategie: immer zuerst das Netz (am HTTP-Cache vorbei, „no-cache“), bei fehlendem Netz der Speicher.
// VERSION und DATEIEN schreibt tools/version.mjs – nicht von Hand ändern, sondern `npm run version`.
const VERSION = "da98544a75";
const DATEIEN = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/stil.css",
  "js/app.js",
  "js/bilder.js",
  "js/engine.js",
  "js/inhalt-liste.js",
  "js/klang.js",
  "js/speicher.js",
  "inhalt/01-feld.txt",
  "inhalt/02-erbsen.txt",
  "inhalt/03-strasse.txt",
  "inhalt/04-nacht.txt",
  "inhalt/05-messer.txt",
  "inhalt/06-ende.txt",
  "inhalt/register.txt",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512-maskable.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "js/version.js"
];
const CACHE = `woyzeck-${VERSION}`;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(DATEIEN.map((d) => new Request(d, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n.startsWith("woyzeck-") && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const bereich = new URL("./", self.location).pathname;
  if (url.origin !== self.location.origin || !url.pathname.startsWith(bereich)) return;
  e.respondWith(netzZuerst(req, url));
});

async function netzZuerst(req, url) {
  const cache = await caches.open(CACHE);
  const ausDemNetz = fetch(new Request(url.href, { cache: "no-cache", credentials: "same-origin" })).then((antwort) => {
    if (antwort.ok && !url.search) cache.put(url.href, antwort.clone());
    return antwort;
  });
  const gespeichert = await cache.match(url.href, { ignoreSearch: true })
    ?? (req.mode === "navigate" ? await cache.match(new URL("index.html", self.location).href) : undefined);
  if (!gespeichert) return ausDemNetz;
  // Mit gespeicherter Fassung: höchstens vier Sekunden aufs Netz warten, dann die gespeicherte nehmen.
  const frist = new Promise((fertig) => setTimeout(() => fertig(null), 4000));
  try {
    const antwort = await Promise.race([ausDemNetz, frist]);
    if (antwort && (antwort.ok || antwort.status === 404)) return antwort;
  } catch { /* offline */ }
  return gespeichert;
}
