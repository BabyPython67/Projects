// Die Prüfungen. Jede bekommt eine Bühne (DOM-Element), Argumente aus dem
// Skript und Hilfen; sie gibt ein Ergebnis zurück ({setzt, zahlen, ziel}).
// Ihre Texte stehen in den Textdateien (Knoten mit "art: text").
import { zeichne } from './bilder.js';

const warte = ms => new Promise(r => setTimeout(r, ms));
const zeilen = (h, args) => (args.text ? h.texte(args.text) : []);

function knopf(h, text, fn, klasse = '') {
  return h.el('button.wahl' + klasse, { onclick: fn }, h.el('span.zeiger', { 'aria-hidden': 'true' }, '☞'), h.el('span', { html: h.formatiere(text) }));
}
function schreibe(h, ziel, text, klasse = 'p') {
  const p = h.el(klasse.startsWith('p') ? klasse : 'p.' + klasse, { html: h.formatiere(text) });
  ziel.append(p);
  p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return p;
}
const ton = (h, art, laut) => h.klang && h.klang.ereignis(art, laut);

// Hält-Geste: Ruft an(), solange der Finger liegt, und aus() beim Loslassen.
function halteFlaeche(flaeche, an, aus) {
  let aktiv = false;
  flaeche.addEventListener('pointerdown', e => { aktiv = true; try { flaeche.setPointerCapture(e.pointerId); } catch { /* */ } e.preventDefault(); an(e); });
  const los = () => { if (aktiv) { aktiv = false; aus(); } };
  flaeche.addEventListener('pointerup', los);
  flaeche.addEventListener('pointercancel', los);
  flaeche.addEventListener('contextmenu', e => e.preventDefault());
  return () => aktiv;
}

export const PRUEFUNGEN = {
  // I: Der Hügel. Hinauf wollen, zurückgetrieben werden.
  async huegel(b, args, h) {
    const t = zeilen(h, args); // [Pardel, Löwe, Wölfin, wieder, Stimme]
    const bild = h.el('figure.miniatur.huegel-bild', { html: zeichne('huegel') });
    const log = h.el('div.probe-log');
    const akt = h.el('div.aktionen');
    b.append(bild, log, akt);
    let n = 0;
    return new Promise(fertig => {
      const hinauf = async () => {
        akt.replaceChildren();
        bild.classList.remove('zurueck'); void bild.offsetWidth; bild.classList.add('steigen');
        ton(h, 'schritt'); await warte(350); ton(h, 'schritt');
        await warte(600);
        ton(h, n === 1 ? 'bruellen' : 'knacken');
        schreibe(h, log, t[Math.min(n, 3)]);
        bild.classList.remove('steigen'); bild.classList.add('zurueck');
        n++;
        await warte(900);
        if (n < 3) akt.append(knopf(h, 'Noch einmal hinauf', hinauf));
        else {
          if (n === 3) schreibe(h, log, t[4], 'p.leise');
          akt.append(knopf(h, 'Noch einmal hinauf', hinauf), knopf(h, 'Zu der Stimme im Schatten', () => fertig({ zahlen: { huegel: n } }), '.stimme-wahl'));
        }
      };
      akt.append(knopf(h, 'Hinauf, zum Licht', hinauf));
    });
  },

  // III: Vorübergehen. Wer hinhört, hört nur Ausreden.
  async vorueber(b, args, h) {
    const t = zeilen(h, args);
    const feld = h.el('div.lauschfeld.vorueber', { 'aria-label': 'Die Lauen' });
    const vergil = h.el('div.probe-log');
    b.append(h.el('p.lausch-hinweis', {}, 'Halte den Finger auf die Menge, wenn du hinhören willst.'), feld, vergil);
    const stimmen = t.map((s, i) => {
      const e = h.el('span.fetzen', { style: `left:${8 + (i * 37) % 80}%;top:${10 + (i * 23) % 75}%;animation-delay:${-i * 0.7}s` }, s);
      feld.append(e); return { e, gehoert: false };
    });
    let gehoert = 0;
    const vergilSagt = ['„Sprich nicht von ihnen. Sieh hin und geh vorüber.“', '„Die Welt hat keinen Ruf für sie. Komm.“'];
    halteFlaeche(feld, () => feld.classList.add('lauscht'), () => feld.classList.remove('lauscht'));
    feld.addEventListener('pointermove', ev => {
      if (!feld.classList.contains('lauscht')) return;
      for (const s of stimmen) {
        const r = s.e.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - ev.clientX, r.top + r.height / 2 - ev.clientY);
        const n = Math.max(0, 1 - d / 90);
        s.e.style.setProperty('--n', n.toFixed(2));
        if (n > 0.5 && !s.gehoert) {
          s.gehoert = true; gehoert++; s.e.classList.add('gehoert'); ton(h, 'klage', 0.4);
          if (gehoert === 2 || gehoert === 5) schreibe(h, vergil, vergilSagt[gehoert === 2 ? 0 : 1]);
        }
      }
    });
    return new Promise(fertig => b.append(h.el('div.aktionen', {}, knopf(h, 'Vorübergehen', () => fertig({ zahlen: { verweilt: gehoert }, setzt: gehoert >= 4 ? ['erkannt_weigerung'] : [] })))));
  },

  // V: Im Wind. Dem Paar mit dem Finger folgen, um Francesca zu hören.
  async wind(b, args, h) {
    const t = zeilen(h, args);
    const feld = h.el('div.windfeld');
    const paar = h.el('div.windpaar', { 'aria-hidden': 'true' }, h.el('span'), h.el('span'));
    const satz = h.el('div.windsatz');
    feld.append(paar, satz);
    const log = h.el('div.probe-log.francesca');
    b.append(h.el('p.lausch-hinweis', {}, 'Leg den Finger auf die beiden Lichter und folge ihnen. Nur solange du bei ihnen bist, hörst du sie.'), feld, log);
    let px = 0.5, py = 0.5, fx = -1, fy = -1, halten = false, i = 0, fort = 0, verpasst = 0, gehoert = 0;
    halteFlaeche(feld, e => { halten = true; setze(e); }, () => { halten = false; });
    const setze = e => { const r = feld.getBoundingClientRect(); fx = (e.clientX - r.left) / r.width; fy = (e.clientY - r.top) / r.height; };
    feld.addEventListener('pointermove', e => { if (halten) setze(e); });
    const start = performance.now();
    return new Promise(fertig => {
      let weg = 0;
      const schritt = jetzt => {
        if (!document.body.contains(feld)) return;
        const tt = (jetzt - start) / 1000;
        const tempo = 0.22 + i * 0.015;
        px = 0.5 + 0.36 * Math.sin(tt * tempo * 1.3) * Math.cos(tt * tempo * 0.4);
        py = 0.5 + 0.32 * Math.sin(tt * tempo * 0.9 + 1);
        paar.style.left = px * 100 + '%'; paar.style.top = py * 100 + '%';
        const r = feld.getBoundingClientRect();
        const nah = halten && Math.hypot((px - fx) * r.width, (py - fy) * r.height) < Math.max(55, r.width * 0.13);
        feld.classList.toggle('nah', nah);
        if (h.klang) h.klang.stimme('francesca', nah ? 0.8 : 0, px * 2 - 1);
        if (nah) { fort += 16; weg = 0; } else { weg += 16; }
        satz.textContent = t[i] || '';
        satz.style.setProperty('--fort', Math.min(1, fort / 2600));
        satz.classList.toggle('klar', nah);
        if (fort >= 2600) {
          schreibe(h, log, t[i]); gehoert++; i++; fort = 0;
        } else if (weg > 2600 && fort > 0) {
          schreibe(h, log, '… (der Wind nimmt die Worte mit)', 'p.leise'); verpasst++; i++; fort = 0; weg = 0;
          ton(h, 'wind', 0.6);
        }
        if (i >= t.length) {
          h.klang && h.klang.stilleStimmen();
          feld.classList.add('vorbei');
          b.append(h.el('div.aktionen', {}, knopf(h, 'Weiter', () => fertig({ zahlen: { francesca: gehoert, francesca_verpasst: verpasst } }))));
          return;
        }
        requestAnimationFrame(schritt);
      };
      requestAnimationFrame(schritt);
    });
  },

  // VI: Cerberus. Erde in den Rachen werfen, der gerade offen ist.
  async cerberus(b, args, h) {
    const t = zeilen(h, args);
    const bild = h.el('figure.miniatur.cerberus-bild', { html: zeichne('cerberus') });
    const koepfe = h.el('div.cerberus-ziele');
    const log = h.el('div.probe-log');
    b.append(h.el('p.lausch-hinweis', {}, t[0] || ''), bild, koepfe, log);
    const satt = [false, false, false];
    let fehler = 0, offen = -1;
    const knoepfe = [0, 1, 2].map(i => {
      const k = h.el('button.cerberus-kopf-knopf', { 'aria-label': ['linker', 'mittlerer', 'rechter'][i] + ' Rachen' }, ['links', 'Mitte', 'rechts'][i]);
      k.addEventListener('click', () => {
        if (satt[i]) return;
        if (offen === i) {
          satt[i] = true; k.classList.add('satt'); bild.classList.add('satt' + i); ton(h, 'schlag', 0.6);
          schreibe(h, log, t[1 + satt.filter(Boolean).length] || '');
        } else { fehler++; ton(h, 'bellen'); bild.classList.add('schnappt'); setTimeout(() => bild.classList.remove('schnappt'), 300); if (fehler === 2) schreibe(h, log, t[5] || '', 'p.leise'); }
      });
      koepfe.append(k); return k;
    });
    return new Promise(fertig => {
      const takt = setInterval(() => {
        if (satt.every(Boolean)) {
          clearInterval(takt); knoepfe.forEach(k => k.classList.remove('offen'));
          b.append(h.el('div.aktionen', {}, knopf(h, 'Über die Liegenden hinweg', () => fertig({ zahlen: { cerberus_fehler: fehler } }))));
          return;
        }
        const frei = [0, 1, 2].filter(i => !satt[i]);
        offen = frei[Math.floor(Math.random() * frei.length)];
        knoepfe.forEach((k, i) => k.classList.toggle('offen', i === offen));
        [0, 1, 2].forEach(i => bild.classList.toggle('offen' + i, i === offen));
        if (Math.random() < 0.4) ton(h, 'bellen', 0.5);
      }, 1300);
    });
  },

  // VII: Die Lasten. Schieben, zusammenprallen, zurück.
  async lasten(b, args, h) {
    const t = zeilen(h, args);
    const bahn = h.el('div.lastbahn', {}, h.el('div.mitte'));
    const stein = h.el('div.last', { role: 'slider', 'aria-label': 'Last', tabindex: '0' });
    bahn.append(stein);
    const log = h.el('div.probe-log');
    b.append(h.el('p.lausch-hinweis', {}, 'Leg den Finger auf die Last und schieb sie zur Mitte.'), bahn, log);
    let pos = 0, runden = 0, ziehen = false, sperre = false;
    const setze = () => { stein.style.left = (4 + pos * 46) + '%'; };
    setze();
    return new Promise(fertig => {
      const knoepfe = h.el('div.aktionen');
      b.append(knoepfe);
      halteFlaeche(stein, () => { ziehen = true; }, () => { ziehen = false; });
      bahn.addEventListener('pointermove', async e => {
        if (!ziehen || sperre) return;
        const r = bahn.getBoundingClientRect();
        const ziel = Math.max(0, Math.min(1, ((e.clientX - r.left) / r.width - 0.04) / 0.46));
        pos += (ziel - pos) * 0.08; // schwer
        setze();
        if (pos > 0.97) {
          sperre = true; ziehen = false; ton(h, 'klirren'); bahn.classList.add('prall');
          schreibe(h, log, t[runden % 2] || '„Warum hältst du?“');
          runden++;
          await warte(1200); bahn.classList.remove('prall');
          if (runden === 2) schreibe(h, log, t[2] || '', 'p.leise');
          if (runden === 3) schreibe(h, log, t[3] || '', 'p.leise');
          pos = 0; setze(); sperre = false;
          if (runden >= 2 && !knoepfe.children.length) knoepfe.append(knopf(h, 'Loslassen und weitergehen', () => fertig({ zahlen: { lasten: runden } })));
        }
      });
    });
  },

  // IX: Medusa. Die Augen zuhalten, solange die Furien schreien.
  async medusa(b, args, h) {
    const t = zeilen(h, args);
    const hand = h.el('button.hand', { 'aria-label': 'Augen zuhalten' }, h.el('span', {}, 'Hier die Hand auf die Augen legen und halten'));
    const dunkel = h.el('div.dunkel', { 'aria-live': 'polite' });
    b.append(hand, dunkel);
    const log = h.el('div.probe-log');
    b.append(log);
    let fehler = 0;
    return new Promise(fertig => {
      let lauf = null;
      const beginne = () => {
        document.body.classList.add('augen-zu');
        dunkel.replaceChildren(); dunkel.classList.add('an');
        let i = 0;
        const zeige = () => {
          if (i < t.length - 1) { dunkel.append(h.el('p', { html: h.formatiere(t[i]) })); ton(h, i % 2 ? 'klage' : 'bruellen', 0.7); i++; lauf = setTimeout(zeige, 2100); }
          else { lauf = null; document.body.classList.remove('augen-zu'); dunkel.classList.remove('an'); hand.remove(); schreibe(h, log, t[t.length - 1]); b.append(h.el('div.aktionen', {}, knopf(h, 'Die Augen öffnen', () => fertig({ zahlen: { medusa_fehler: fehler } })))); }
        };
        zeige();
      };
      const abbruch = () => {
        if (!lauf) return;
        clearTimeout(lauf); lauf = null; fehler++;
        document.body.classList.remove('augen-zu'); dunkel.classList.remove('an');
        ton(h, 'stein');
        b.classList.add('versteinert'); setTimeout(() => b.classList.remove('versteinert'), 1400);
        schreibe(h, log, fehler === 1 ? '„Dreh dich um! Augen zu!“ Vergil reißt mich herum. Etwas Kaltes ist schon in meinen Fingerspitzen.' : 'Vergil legt seine eigenen Hände über meine. „Noch einmal. Bis ich es sage.“', 'p.leise');
      };
      halteFlaeche(hand, beginne, abbruch);
    });
  },

  // X: Zögern. Wer zu lange schweigt, hat auch geantwortet.
  async zoegern(b, args, h) {
    const t = zeilen(h, args).map(z => { const [id, ...r] = z.split('|'); return { id: id.trim(), text: r.join('|').trim() }; });
    const frist = Number(args.sekunden || 7) * 1000;
    const linie = h.el('div.frist', {}, h.el('span'));
    const akt = h.el('div.aktionen');
    b.append(linie, akt);
    return new Promise(fertig => {
      let vorbei = false;
      const ende = id => { if (vorbei) return; vorbei = true; clearTimeout(tim); fertig({ setzt: ['antwort_' + id], ziel: id === 'zoegern' ? args.zu_spaet : undefined }); };
      t.forEach(a => akt.append(knopf(h, a.text, () => ende(a.id))));
      linie.firstChild.style.animationDuration = frist + 'ms';
      const tim = setTimeout(() => ende('zoegern'), frist);
    });
  },

  // XIII: Der Zweig. Vergil verlangt, dass ich einen abbreche.
  async zweig(b, args, h) {
    const t = zeilen(h, args);
    const bild = h.el('figure.miniatur.zweig-bild', { html: zeichne('dornenwald') });
    const zweige = h.el('div.zweige');
    bild.append(zweige);
    const log = h.el('div.probe-log');
    b.append(bild, log);
    return new Promise(fertig => {
      const draengen = setTimeout(() => schreibe(h, log, t[0], 'p.leise'), 9000);
      [[18, 30], [33, 55], [47, 22], [62, 48], [78, 28], [88, 58], [25, 72], [70, 70]].forEach(([x, y]) => {
        const z = h.el('button.zweigknopf', { style: `left:${x}%;top:${y}%`, 'aria-label': 'Zweig' });
        z.addEventListener('click', async () => {
          clearTimeout(draengen);
          zweige.querySelectorAll('button').forEach(k => { k.disabled = true; });
          z.classList.add('gebrochen'); ton(h, 'brechen');
          await warte(700); schreibe(h, log, t[1]); ton(h, 'klage', 0.8);
          await warte(1500); schreibe(h, log, t[2]);
          b.append(h.el('div.aktionen', {}, knopf(h, 'Den Zweig fallen lassen', () => fertig({}))));
        });
        zweige.append(z);
      });
    });
  },

  // XIV: Die Blätter. Die zerrissenen Blätter zurück an den Busch legen.
  async blaetter(b, args, h) {
    const t = zeilen(h, args);
    const feld = h.el('div.blattfeld', {}, h.el('div.busch', {}, 'der Busch'));
    b.append(h.el('p.lausch-hinweis', {}, 'Zieh die Blätter zum Busch.'), feld);
    const log = h.el('div.probe-log');
    b.append(log);
    let uebrig = 7;
    return new Promise(fertig => {
      for (let i = 0; i < 7; i++) {
        const bl = h.el('div.blatt-stueck', { style: `left:${8 + (i * 29) % 70}%;top:${14 + (i * 41) % 66}%;transform:rotate(${i * 47}deg)` });
        let ziehen = false;
        halteFlaeche(bl, () => { ziehen = true; bl.classList.add('gehoben'); }, () => {
          ziehen = false; bl.classList.remove('gehoben');
          const busch = feld.querySelector('.busch').getBoundingClientRect(), r = bl.getBoundingClientRect();
          if (Math.hypot(busch.left + busch.width / 2 - r.left - r.width / 2, busch.top + busch.height / 2 - r.top - r.height / 2) < busch.width * 0.7) {
            bl.remove(); uebrig--; ton(h, 'knacken', 0.3);
            if (uebrig === 4) schreibe(h, log, t[0] || '');
            if (uebrig === 0) { schreibe(h, log, t[1] || ''); b.append(h.el('div.aktionen', {}, knopf(h, 'Aufstehen', () => fertig({})))); }
          }
        });
        bl.addEventListener('pointermove', e => {
          if (!ziehen) return;
          const r = feld.getBoundingClientRect();
          bl.style.left = ((e.clientX - r.left) / r.width * 100 - 3) + '%';
          bl.style.top = ((e.clientY - r.top) / r.height * 100 - 4) + '%';
        });
        feld.append(bl);
      }
    });
  },

  // XV: Schritt halten. Brunetto spricht nur, solange wir gehen.
  async schritt(b, args, h) {
    const t = zeilen(h, args);
    const weg = h.el('div.wegbahn', {}, h.el('div.wanderer'));
    const log = h.el('div.probe-log');
    const fuss = h.el('button.schritt-knopf', {}, 'Schritt');
    b.append(h.el('p.lausch-hinweis', {}, 'Tippe gleichmäßig „Schritt“. Wer hier stehen bleibt, muss hundert Jahre liegen, ohne das Feuer abwehren zu dürfen.'), weg, log, fuss);
    let i = 0, schritte = 0, letzte = performance.now(), pausen = 0, gewarnt = false;
    return new Promise(fertig => {
      const pruef = setInterval(() => {
        if (performance.now() - letzte > 3500 && !gewarnt && i < t.length) {
          gewarnt = true; pausen++; weg.classList.add('steht');
          schreibe(h, log, pausen === 1 ? 'Er bleibt mit mir stehen. Auf seine Schultern fallen Flocken aus Feuer, und er schlägt sie nicht weg. Er sieht mich nur an.' : 'Wieder steht er. Wieder fällt das Feuer.', 'p.leise');
          ton(h, 'knistern');
        }
      }, 300);
      fuss.addEventListener('click', () => {
        letzte = performance.now(); schritte++; ton(h, 'schritt', 0.5);
        if (gewarnt) { gewarnt = false; weg.classList.remove('steht'); }
        weg.style.setProperty('--weg', (schritte % 20) / 20);
        if (schritte % 2 === 0 && i < t.length) {
          schreibe(h, log, t[i]); i++;
          if (i === t.length) {
            clearInterval(pruef); fuss.remove();
            b.append(h.el('div.aktionen', {}, knopf(h, 'Ihm nachsehen', () => fertig({ zahlen: { brunetto_pausen: pausen } }))));
          }
        }
      });
    });
  },

  // XXIII: Die Flucht vor den Teufeln.
  async flucht(b, args, h) {
    const t = zeilen(h, args);
    const feld = h.el('div.fluchtfeld', {}, h.el('div.verfolger'));
    const log = h.el('div.probe-log');
    b.append(h.el('p.lausch-hinweis', {}, 'Vergil trägt mich. Tippe auf jeden Halt, der auftaucht, schnell.'), feld, log);
    let treffer = 0, runde = 0;
    return new Promise(fertig => {
      const naechster = () => {
        if (runde >= 7) {
          feld.classList.add('unten'); ton(h, 'stein', 0.5);
          schreibe(h, log, t[t.length - 1] || '');
          b.append(h.el('div.aktionen', {}, knopf(h, 'Aufsehen', () => fertig({ zahlen: { flucht: treffer } }))));
          return;
        }
        runde++;
        const halt = h.el('button.halt', { style: `left:${10 + Math.random() * 75}%;top:${15 + Math.random() * 65}%`, 'aria-label': 'Halt' });
        let ok = false;
        halt.addEventListener('click', () => { ok = true; treffer++; ton(h, 'schritt'); halt.remove(); feld.style.setProperty('--nah', Math.max(0, runde - treffer) / 7); if (t[runde - 1] && runde % 2) schreibe(h, log, t[Math.floor(runde / 2)] || ''); naechster(); });
        feld.append(halt);
        setTimeout(() => { if (!ok) { halt.remove(); ton(h, 'bruellen', 0.5); feld.style.setProperty('--nah', Math.max(0, runde - treffer) / 7); naechster(); } }, 1700);
      };
      naechster();
    });
  },

  // XXX: Zuschauen. Ein Streit, dem man gern zuhört.
  async zuschauen(b, args, h) {
    const t = zeilen(h, args);
    const vergil = ['Vergil, hinter mir, leise: „Schau nur weiter hin.“', 'Vergil: „Es fehlt nicht viel, und ich streite mit dir.“'];
    const halt = h.el('button.hinhoeren', {}, 'Gedrückt halten, um weiter zuzuhören');
    const log = h.el('div.probe-log.streit');
    b.append(log, halt);
    let i = 0, an = false, timer = null;
    const zeige = () => {
      if (!an) return;
      if (i === 6) schreibe(h, log, vergil[0], 'p.vergil-stimme');
      if (i === 10) schreibe(h, log, vergil[1], 'p.vergil-stimme');
      schreibe(h, log, t[i % t.length] + (i >= t.length ? ' (Von vorn. Es hört nicht auf.)' : ''));
      ton(h, i % 2 ? 'schlag' : 'klage', 0.5);
      i++;
      timer = setTimeout(zeige, 2300);
    };
    return new Promise(fertig => {
      halteFlaeche(halt, () => { an = true; halt.classList.add('an'); zeige(); }, () => { an = false; clearTimeout(timer); halt.classList.remove('an'); });
      b.append(h.el('div.aktionen', {}, knopf(h, 'Mich abwenden', () => { an = false; clearTimeout(timer); fertig({ zahlen: { zugehoert: i }, setzt: i >= 7 ? ['zu_lange_zugehoert'] : [] }); })));
    });
  },

  // XXXIII: Ugolino. Bis zum Ende zuhören – oder nicht.
  async ugolino(b, args, h) {
    const t = h.texteMitVersen(args.text);
    const log = h.el('div.probe-log.ugolino');
    const akt = h.el('div.aktionen');
    b.append(log, akt);
    let i = 0;
    return new Promise(fertig => {
      const weiter = () => {
        const teil = t[i++];
        if (teil.typ === 'vers') log.append(h.vers(teil.refs)); else schreibe(h, log, teil.text);
        ton(h, 'herz', 0.4);
        akt.replaceChildren();
        if (i >= t.length) { akt.append(knopf(h, 'Schweigen', () => fertig({ setzt: ['ugolino_ganz'], zahlen: { ugolino: i } }))); return; }
        akt.append(knopf(h, 'Weiter zuhören', weiter), knopf(h, 'Nicht mehr hören', () => fertig({ zahlen: { ugolino: i }, ziel: args.abbruch }), '.leise'));
      };
      weiter();
    });
  },

  // XXXIV: Die Umkehr. Hinab an Luzifers Fell – und plötzlich ist unten oben.
  async umkehr(b, args, h) {
    const t = zeilen(h, args);
    const schacht = h.el('div.schacht', {}, h.el('div.fell'), h.el('div.kletterer'));
    const anzeige = h.el('p.lausch-hinweis', {}, 'Wisch nach unten, um hinabzuklettern.');
    const log = h.el('div.probe-log');
    b.append(anzeige, schacht, log);
    let weg = 0, gedreht = false, startY = null;
    return new Promise(fertig => {
      schacht.addEventListener('pointerdown', e => { startY = e.clientY; try { schacht.setPointerCapture(e.pointerId); } catch { /* */ } });
      schacht.addEventListener('pointermove', e => {
        if (startY === null) return;
        const dy = e.clientY - startY;
        const richtig = gedreht ? -dy : dy;
        if (richtig > 0) { weg += richtig / 600; startY = e.clientY; }
        schacht.style.setProperty('--weg', Math.min(1, weg));
        if (!gedreht && weg >= 0.5) {
          gedreht = true; schacht.classList.add('gedreht'); ton(h, 'donner', 0.6);
          schreibe(h, log, t[0] || ''); schreibe(h, log, t[1] || '');
          anzeige.textContent = 'Jetzt nach oben wischen.';
        }
        if (weg >= 1) {
          startY = null; schacht.classList.add('fertig'); schreibe(h, log, t[2] || '');
          if (!b.querySelector('.aktionen')) b.append(h.el('div.aktionen', {}, knopf(h, 'Weiter', () => fertig({}))));
        }
      });
      schacht.addEventListener('pointerup', () => { startY = null; });
    });
  },

  // Ende: Die Sterne. Jeder getragene Name ein Licht.
  async sterne(b, args, h) {
    const namen = Object.values(h.stand.getragen);
    const himmel = h.el('div.himmel');
    const name = h.el('p.sternname', { 'aria-live': 'polite' }, namen.length ? 'Tippe die Sterne an.' : '');
    b.append(himmel, name);
    namen.forEach((n, i) => {
      const s = h.el('button.stern', { style: `left:${10 + (i * 53) % 80}%;top:${10 + (i * 37) % 70}%;animation-delay:${i * 0.8}s`, 'aria-label': n });
      s.addEventListener('click', () => { name.textContent = n; ton(h, 'stern'); s.classList.add('gelesen'); });
      himmel.append(s);
    });
    for (let i = 0; i < 40; i++) himmel.append(h.el('span.punkt', { style: `left:${(i * 47) % 100}%;top:${(i * 29) % 100}%;animation-delay:${(i % 7) * 0.5}s` }));
    await warte(namen.length ? 2500 : 800);
    return new Promise(fertig => b.append(h.el('div.aktionen', {}, knopf(h, 'Weiter', () => fertig({})))));
  },
};
