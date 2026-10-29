// Speichern: localStorage nach jedem Wurf, dazu ein Sicherungscode zum Abschreiben/Kopieren.
import { defaultProfile } from './career.js';

const KEY = 'carreau.v1';
const BACKUP = 'carreau.v1.backup';

export function load() {
  for (const k of [KEY, BACKUP]) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) return migrate(JSON.parse(raw));
    } catch (e) { /* kaputt oder gesperrt – nächsten Versuch */ }
  }
  return defaultProfile();
}

export function save(profile) {
  try {
    const raw = JSON.stringify(profile);
    localStorage.setItem(KEY, raw);
    localStorage.setItem(BACKUP, raw);
    return true;
  } catch (e) {
    return false;
  }
}

function migrate(p) {
  const d = defaultProfile();
  const out = { ...d, ...p };
  out.stats = { ...d.stats, ...(p.stats || {}) };
  out.settings = { ...d.settings, ...(p.settings || {}) };
  for (const k of ['vs', 'feats', 'featCounts', 'daily', 'tipsSeen']) out[k] = p[k] || {};
  out.history = p.history || [];
  return out;
}

export function exportCode(profile) {
  const json = JSON.stringify({ ...profile, match: profile.match });
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return 'CARREAU1:' + btoa(bin);
}

export function importCode(code) {
  const c = String(code || '').trim();
  if (!c.startsWith('CARREAU1:')) throw new Error('Das ist kein Carreau-Sicherungscode.');
  const bin = atob(c.slice(9).replace(/\s+/g, ''));
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  const p = JSON.parse(new TextDecoder().decode(bytes));
  if (!p || typeof p !== 'object' || typeof p.rating !== 'number') throw new Error('Der Code ist unvollständig.');
  return migrate(p);
}

export async function askPersist() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch (e) { /* nicht unterstützt */ }
  return false;
}

export function isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
}
