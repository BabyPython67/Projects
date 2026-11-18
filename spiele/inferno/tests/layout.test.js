// Layout-Test: Jede Bildschirmart auf iPad und Handy, hoch und quer.
// Geprüft wird, dass kein Text aus seinem Feld, seiner Form oder vom Bildschirm läuft,
// dass sich keine Texte überlappen, dass nichts abgeschnitten wird und dass jedes
// Bild mindestens die doppelte Anzeigegröße in Pixeln hat.
// Nur einzelne Bildschirme: LAYOUT_NUR=menue-karte,titel-neu npm run test:layout
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { starteServer } from '../werkzeuge/server.js';
import { GERAETE, BILDSCHIRME, zeige } from './bildschirme.js';

const NUR = process.env.LAYOUT_NUR ? process.env.LAYOUT_NUR.split(',') : null;
const liste = BILDSCHIRME.filter(b => !NUR || NUR.includes(b.name));

// Läuft im Browser. Gibt eine Liste von Befunden zurück.
function pruefeSeite() {
  const befunde = [];
  const vw = window.innerWidth;
  const kurz = s => s.replace(/\s+/g, ' ').trim().slice(0, 48);
  const sichtbar = el => {
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
      if (a.hidden) return false;
    }
    return true;
  };
  // 1. Die Seite ist nicht breiter als der Bildschirm
  if (document.documentElement.scrollWidth > vw + 1) befunde.push(`Seite breiter als der Bildschirm: ${document.documentElement.scrollWidth} > ${vw} px`);

  // 2. Text im HTML
  const texte = [];
  // Ist ein Menü offen, verdeckt es die Seite: dann zählt nur, was im Menü steht.
  const schicht = document.querySelector('#schicht');
  const wurzel = schicht && !schicht.hidden && schicht.childElementCount ? schicht : document.body;
  const gang = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT);
  while (gang.nextNode()) {
    const t = gang.currentNode;
    if (!t.textContent.trim()) continue;
    const el = t.parentElement;
    if (!el || el.closest('svg, script, style, noscript, .toast') || !sichtbar(el)) continue;
    const r = document.createRange(); r.selectNodeContents(t);
    for (const rc of r.getClientRects()) {
      if (rc.width < 1 || rc.height < 1) continue;
      const wo = `„${kurz(t.textContent)}“`;
      if (rc.left < -1 || rc.right > vw + 1) befunde.push(`Text läuft vom Bildschirm: ${wo}`);
      for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
        const pr = p.getBoundingClientRect();
        const senkrechtRollbar = /auto|scroll/.test(cs.overflowY);
        if (rc.left < pr.left - 1 || rc.right > pr.right + 1 || (!senkrechtRollbar && (rc.top < pr.top - 1 || rc.bottom > pr.bottom + 1))) {
          befunde.push(`Text abgeschnitten von ${p.tagName.toLowerCase()}${p.className ? '.' + String(p.className).split(' ')[0] : ''}: ${wo}`);
          break;
        }
      }
      texte.push({ el, rc, wo });
    }
  }
  // Text, der breiter ist als sein eigenes Feld (z. B. mit Auslassungspunkten gekürzt)
  for (const el of wurzel.querySelectorAll('*')) {
    if (el.closest('svg') || !el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    if (!sichtbar(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'auto') befunde.push(`Text breiter als sein Feld: „${kurz(el.textContent)}“`);
  }
  // 3. Überlappende Texte (verschiedene Elemente, keines enthält das andere)
  for (let i = 0; i < texte.length; i++) {
    for (let j = i + 1; j < texte.length; j++) {
      const a = texte[i], b = texte[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = Math.min(a.rc.right, b.rc.right) - Math.max(a.rc.left, b.rc.left);
      const y = Math.min(a.rc.bottom, b.rc.bottom) - Math.max(a.rc.top, b.rc.top);
      if (x > 2 && y > 2) {
        // Unter einer festen Leiste (Kopfzeile, Menükopf) wegrollender Text ist verdeckt, nicht überlappt.
        const px = Math.max(a.rc.left, b.rc.left) + x / 2, py = Math.max(a.rc.top, b.rc.top) + y / 2;
        const oben = document.elementFromPoint(px, py);
        let leiste = null;
        for (let e = oben; e && e !== document.body; e = e.parentElement) { const pos = getComputedStyle(e).position; if (pos === 'sticky' || pos === 'fixed') { leiste = e; break; } }
        if (leiste && (leiste.contains(a.el) !== leiste.contains(b.el))) continue;
        befunde.push(`Texte überlappen: ${a.wo} und ${b.wo}`);
      }
    }
  }
  // 4. Text in Bildern (SVG): im Bild und auf der Fläche, auf der er steht
  for (const svg of wurzel.querySelectorAll('svg')) {
    if (!sichtbar(svg)) continue;
    const sr = svg.getBoundingClientRect();
    const formen = [...svg.querySelectorAll('path, rect, circle, ellipse, polygon')].filter(f => getComputedStyle(f).fill !== 'none');
    for (const tx of svg.querySelectorAll('text')) {
      const wo = `SVG-Text „${kurz(tx.textContent)}“`;
      const tr = tx.getBoundingClientRect();
      if (tr.left < sr.left - 1 || tr.right > sr.right + 1 || tr.top < sr.top - 1 || tr.bottom > sr.bottom + 1) { befunde.push(`${wo} läuft aus dem Bild`); continue; }
      const vorher = formen.filter(f => f.compareDocumentPosition(tx) & Node.DOCUMENT_POSITION_FOLLOWING);
      const oben = (x, y) => {
        const pt = new DOMPoint(x, y);
        for (let i = vorher.length - 1; i >= 0; i--) { try { if (vorher[i].isPointInFill(pt)) return vorher[i]; } catch { /* */ } }
        return null;
      };
      const bb = tx.getBBox();
      const mitte = oben(bb.x + bb.width / 2, bb.y + bb.height / 2);
      const ecken = [[bb.x + 0.5, bb.y + 0.5], [bb.x + bb.width - 0.5, bb.y + 0.5], [bb.x + 0.5, bb.y + bb.height - 0.5], [bb.x + bb.width - 0.5, bb.y + bb.height - 0.5]];
      if (ecken.some(([x, y]) => oben(x, y) !== mitte)) befunde.push(`${wo} läuft über den Rand der Fläche, auf der er steht`);
    }
  }
  // 5. Bilder: mindestens doppelt so viele Pixel wie angezeigt
  for (const img of wurzel.querySelectorAll('img')) {
    if (!sichtbar(img)) continue;
    const r = img.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (!img.complete || !img.naturalWidth) { befunde.push(`Bild nicht geladen: ${img.getAttribute('src')}`); continue; }
    // object-fit: cover zeigt nur einen Ausschnitt; maßgeblich ist der Maßstab
    const masstab = Math.min(img.naturalWidth / r.width, img.naturalHeight / r.height);
    if (masstab < 1.98) befunde.push(`Bild zu klein für die Anzeige: ${img.getAttribute('src')} hat ${img.naturalWidth}×${img.naturalHeight} px für ${Math.round(r.width)}×${Math.round(r.height)} (nur ${masstab.toFixed(2)}-fach)`);
  }
  return [...new Set(befunde)];
}

describe('Layout aller Bildschirmarten', { concurrency: true }, () => {
  for (const g of GERAETE) {
    it(`${g.name}: ${liste.length} Bildschirme ohne Überlauf, Überlappung und unscharfe Bilder`, { timeout: 600000 }, async () => {
      const server = await starteServer(0);
      const url = `http://127.0.0.1:${server.address().port}/`;
      const browser = await chromium.launch();
      const alle = [];
      let geprueft = 0;
      try {
        const { name, ...opts } = g;
        const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce', serviceWorkers: 'block' });
        const page = await ctx.newPage();
        const fehler = [];
        page.on('pageerror', e => fehler.push(e.message));
        for (const b of liste) {
          try { await zeige(page, url, b, { schnell: true }); } catch (e) { alle.push(`${b.name}: nicht erreichbar (${e.message.split('\n')[0]})`); continue; }
          await page.evaluate(() => document.fonts && document.fonts.ready);
          if (b.art !== 'menue') { await page.evaluate(() => window.scrollTo(0, 0)); }
          const befunde = await page.evaluate(pruefeSeite);
          // Menüs und lange Seiten: auch weiter unten prüfen (Menü rollt in sich)
          if (b.art === 'menue') {
            await page.evaluate(() => { const m = document.querySelector('.menue'); if (m) m.scrollTop = m.scrollHeight; });
            befunde.push(...await page.evaluate(pruefeSeite));
          }
          for (const f of new Set(befunde)) alle.push(`${b.name}: ${f}`);
          geprueft++;
        }
        for (const f of fehler) alle.push(`JavaScript-Fehler: ${f}`);
        await ctx.close();
      } finally {
        await browser.close();
        server.close();
      }
      console.log(`# ${g.name}: ${geprueft} Bildschirme geprüft, ${alle.length} Befunde`);
      assert.deepEqual(alle, [], `${g.name}:\n  ` + alle.join('\n  '));
    });
  }
});
