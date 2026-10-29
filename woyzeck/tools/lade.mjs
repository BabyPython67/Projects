// Lädt Inhalt und Register von der Platte (für Tests und Werkzeuge).
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseInhalt, parseRegister } from "../js/engine.js";
import { DATEIEN, REGISTER } from "../js/inhalt-liste.js";

export const ORDNER = join(dirname(fileURLToPath(import.meta.url)), "..");

export function ladeInhalt({ nurVorhandene = false } = {}) {
  const dateien = DATEIEN.filter((d) => !nurVorhandene || existsSync(join(ORDNER, d)))
    .map((name) => ({ name, text: readFileSync(join(ORDNER, name), "utf8") }));
  return parseInhalt(dateien);
}

export function ladeRegister() {
  return parseRegister(readFileSync(join(ORDNER, REGISTER), "utf8"));
}

export function ladeQuelle() {
  return readFileSync(join(ORDNER, "quelle/woyzeck-modernisiert.txt"), "utf8");
}
