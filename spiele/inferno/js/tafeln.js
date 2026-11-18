// Tafeln: Gustave Dorés Stiche zum Inferno (1861), gemeinfrei, Scans von Wikimedia Commons.
// Die Liste der Tafeln (Datei, Größe, Gesang, Bildunterschrift, Quelle) erzeugt
// werkzeuge/tafeln.py nach daten/tafeln.js.
import { TAFELN } from '../daten/tafeln.js';

export { TAFELN };

export function tafelDaten(name) {
  return TAFELN[name] || null;
}

export const tafelPfad = t => 'tafeln/' + t.datei;

// Alle Dateien, die ein Abschnitt zeigt (zum Vorausladen für unterwegs).
export function tafelnFuer(abschnitt) {
  const namen = new Set();
  for (const k of Object.values(abschnitt.knoten)) if (k.meta.bild && TAFELN[k.meta.bild]) namen.add(tafelPfad(TAFELN[k.meta.bild]));
  return [...namen];
}
