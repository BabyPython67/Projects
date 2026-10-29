// Berechnet die Fassung aus dem Inhalt aller ausgelieferten Dateien und schreibt sie in sw.js und
// js/version.js, zusammen mit der Liste der Dateien für den Offline-Speicher. Nach jeder Änderung:
//   npm run version     (der Test „Service Worker ist aktuell“ schlägt sonst fehl)
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
import { ORDNER } from "./lade.mjs";

const AUSGELIEFERT = ["index.html", "manifest.webmanifest", "css", "js", "inhalt", "icons"];
const VORLAGE = readFileSync(join(ORDNER, "tools/sw-vorlage.js"), "utf8");

export function dateien() {
  const liste = [];
  const lauf = (p) => {
    const voll = join(ORDNER, p);
    if (statSync(voll).isDirectory()) for (const k of readdirSync(voll).sort()) lauf(join(p, k));
    else if (p !== "js/version.js") liste.push(relative(ORDNER, voll).split("\\").join("/"));
  };
  for (const p of AUSGELIEFERT) lauf(p);
  return liste;
}

export function berechne() {
  const liste = dateien();
  const h = createHash("sha256");
  for (const d of liste) { h.update(d); h.update(readFileSync(join(ORDNER, d))); }
  h.update(VORLAGE);
  const version = h.digest("hex").slice(0, 10);
  const alle = ["./", ...liste, "js/version.js"];
  const sw = VORLAGE.replace("__VERSION__", version).replace("__DATEIEN__", JSON.stringify(alle, null, 2).replace(/\n/g, "\n"));
  const versionJs = `// Von tools/version.mjs geschrieben.\nexport const VERSION = "${version}";\n`;
  return { version, sw, versionJs };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { version, sw, versionJs } = berechne();
  writeFileSync(join(ORDNER, "sw.js"), sw);
  writeFileSync(join(ORDNER, "js/version.js"), versionJs);
  console.log(`Fassung ${version}: sw.js und js/version.js geschrieben`);
}
