/* Umzugs-Service-Worker. Brückenwärter liegt jetzt unter ../../brueckenwaerter/.
   Der alte Service Worker hier lieferte zuerst aus dem Speicher; wer das Spiel vom Home-Bildschirm
   öffnet, sieht deshalb erst einmal die alte Fassung. Der Browser prüft bei jedem Öffnen, ob sw.js
   sich geändert hat, und installiert dann diese Datei: Sie leert den alten Speicher, schickt offene
   Seiten zur neuen Adresse und meldet sich selbst ab. Danach kommt die alte Adresse wieder direkt vom
   Netz, also als Weiterleitung. Ohne Netz bleibt bis dahin die alte Fassung spielbar. */
const NEU = new URL("../../brueckenwaerter/", self.location.href).href;
const ALTER_SPEICHER = "brueckenwaerter-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    if (await caches.has(ALTER_SPEICHER)) await caches.delete(ALTER_SPEICHER);
    await self.clients.claim();
    const fenster = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.all(fenster.map((f) => {
      const alt = new URL(f.url);
      return f.navigate(NEU + alt.search + alt.hash).catch(() => {});
    }));
    await self.registration.unregister();
  })());
});
