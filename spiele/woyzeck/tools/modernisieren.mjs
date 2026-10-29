// Schreibt quelle/woyzeck-modernisiert.txt aus quelle/woyzeck-zeno.txt (Regeln: tools/modernisierung.mjs).
// Aufruf aus dem Ordner woyzeck: node tools/modernisieren.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { modernisiere, endgueltigeNamen } from "./modernisierung.mjs";

const ordner = join(dirname(fileURLToPath(import.meta.url)), "..");
const roh = readFileSync(join(ordner, "quelle/woyzeck-zeno.txt"), "utf8");
const [kopf, ...rest] = roh.split(/\n(?==== )/);
const text = rest.join("\n");
const neu = "Behutsam modernisierte Schreibung (Regeln: tools/modernisierung.mjs) von quelle/woyzeck-zeno.txt.\n" +
  "Frühe Figurennamen (Louis, Margreth, Louisel) sind durch die endgültigen ersetzt, wie Lehmann sie in Klammern nennt.\n\n" +
  modernisiere(endgueltigeNamen(text));
writeFileSync(join(ordner, "quelle/woyzeck-modernisiert.txt"), neu);
console.log("quelle/woyzeck-modernisiert.txt geschrieben,", neu.split(/\s+/).length, "Wörter");
