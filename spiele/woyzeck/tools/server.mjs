// Kleiner statischer Server zum lokalen Spielen und für den Browser-Test. Er schickt dieselben
// Cache-Kopfzeilen wie GitHub Pages (max-age=600, ETag), damit der Test prüft, dass neue Fassungen
// trotzdem sofort ankommen. Aufruf aus dem Ordner woyzeck: node tools/server.mjs 8080
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { ORDNER } from "./lade.mjs";

const TYPEN = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
  ".webmanifest": "application/manifest+json", ".json": "application/json", ".md": "text/markdown; charset=utf-8",
};

export function starteServer({ wurzel = ORDNER, port = 0 } = {}) {
  const server = createServer(async (req, res) => {
    try {
      let pfad = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (pfad.endsWith("/")) pfad += "index.html";
      const datei = normalize(join(wurzel, pfad));
      if (!datei.startsWith(normalize(wurzel))) { res.writeHead(403).end(); return; }
      const info = await stat(datei);
      const etag = `"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
      const kopf = { "Content-Type": TYPEN[extname(datei)] ?? "application/octet-stream", "Cache-Control": "max-age=600", ETag: etag };
      if (req.headers["if-none-match"] === etag) { res.writeHead(304, kopf).end(); return; }
      res.writeHead(200, kopf).end(await readFile(datei));
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("nicht gefunden");
    }
  });
  return new Promise((fertig) => server.listen(port, "127.0.0.1", () => fertig({ url: `http://127.0.0.1:${server.address().port}/`, schliessen: () => new Promise((f) => server.close(f)) })));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { url } = await starteServer({ port: Number(process.argv[2] ?? 8080) });
  console.log(`Woyzeck läuft auf ${url}`);
}
