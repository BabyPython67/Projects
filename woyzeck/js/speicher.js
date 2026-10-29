// Spielstand und Einstellungen im Browser-Speicher. Jeder Zugriff ist abgesichert: Ein privates Fenster,
// gesperrte Website-Daten oder Safaris Löschen nach sieben Tagen dürfen das Spiel nie zum Absturz bringen.
// Der Stand ist klein (Szene + Entscheidungen), dazu kommt die Leseposition in der Szene.
import { bereinige } from "./engine.js";

export const SCHLUESSEL = { stand: "woyzeck.stand.v1", einstellungen: "woyzeck.einstellungen.v1", position: "woyzeck.position.v1" };

function lies(speicher, key) {
  try { const roh = speicher?.getItem(key); return roh ? JSON.parse(roh) : null; } catch { return null; }
}
function schreib(speicher, key, wert) {
  try { speicher?.setItem(key, JSON.stringify(wert)); return true; } catch { return false; }
}

export function ladeStand(speicher, inhalt) {
  const roh = lies(speicher, SCHLUESSEL.stand);
  return roh ? bereinige(inhalt, roh) : null;
}

export function speichereStand(speicher, stand) {
  return schreib(speicher, SCHLUESSEL.stand, { szene: stand.szene, wahlen: stand.wahlen, zeit: Date.now() });
}

export function loescheStand(speicher) {
  try { speicher?.removeItem(SCHLUESSEL.stand); speicher?.removeItem(SCHLUESSEL.position); } catch { /* egal */ }
}

export const STANDARD = { klang: false, schrift: 1, buechner: false };

export function ladeEinstellungen(speicher) {
  const e = lies(speicher, SCHLUESSEL.einstellungen) ?? {};
  return {
    klang: typeof e.klang === "boolean" ? e.klang : STANDARD.klang,
    schrift: [0.9, 1, 1.15, 1.3].includes(e.schrift) ? e.schrift : STANDARD.schrift,
    buechner: typeof e.buechner === "boolean" ? e.buechner : STANDARD.buechner,
    hinweisGesehen: e.hinweisGesehen === true,
  };
}

export function speichereEinstellungen(speicher, e) { return schreib(speicher, SCHLUESSEL.einstellungen, e); }

export function ladePosition(speicher, szene) {
  const p = lies(speicher, SCHLUESSEL.position);
  return p && p.szene === szene && Number.isFinite(p.anteil) ? Math.min(Math.max(p.anteil, 0), 1) : 0;
}

export function speicherePosition(speicher, szene, anteil) { return schreib(speicher, SCHLUESSEL.position, { szene, anteil }); }
