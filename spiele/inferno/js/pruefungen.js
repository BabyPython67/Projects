// Die Prüfungen. Jede bekommt eine Bühne (DOM-Element), Argumente aus dem
// Skript und Hilfen; sie gibt ein Ergebnis zurück ({setzt, zahlen, ziel}).
// Ihre Texte stehen in den Textdateien (Knoten mit "art: text").
// Die Bühnen sind Dorés Stiche (h.buehne), auf denen man handelt.

const warte = ms => new Promise(r => setTimeout(r, ms));
const zeilen = (h, args) => (args.text ? h.texte(args.text) : []);

function knopf(h, text, fn, klasse = '', zeichen = 'rede') {
  return h.el('button.wahl' + klasse, { onclick: fn }, h.zeichen(zeichen), h.el('span', { html: h.formatiere(text) }));
}
// rollen: false, solange man auf eine Bühne zielt – die Seite soll sich dann nicht bewegen.
function schreibe(h, ziel, text, klasse = 'p', rollen = true) {
  const p = h.el(klasse.startsWith('p') ? klasse : 'p.' + klasse, { html: h.formatiere(text) });
  ziel.append(p);
  if (rollen && !ziel.closest('.buehne')) sichtbar(p);
  return p;
}
// Neue Zeilen nur dann ins Bild holen, wenn sie unter dem Bildschirmrand liegen,
// und ohne Ruckeln, während man auf eine Bühne zielt.
function sichtbar(p) {
  const r = p.getBoundingClientRect();
  if (r.bottom > window.innerHeight - 20) p.scrollIntoView({ block: 'end', behavior: 'auto' });
}
const ton = (h, art, laut) => h.klang && h.klang.ereignis(art, laut);
const aktionen = (h, ...k) => h.el('div.aktionen', {}, ...k);

// Startet fn erst, wenn el wirklich auf dem Bildschirm ist (und dann noch kurz Zeit zum Lesen).
function sobaldSichtbar(el, fn, gnade = 1200) {
  if (typeof IntersectionObserver === 'undefined') return setTimeout(fn, gnade);
  const io = new IntersectionObserver(eintraege => {
    if (eintraege.some(e => e.isIntersecting)) { io.disconnect(); setTimeout(fn, gnade); }
  }, { threshold: 0.6 });
  io.observe(el);
}

// Halte-Geste: Ruft an(), solange der Finger liegt, und aus() beim Loslassen.
function halteFlaeche(flaeche, an, aus) {
  let aktiv = false;
  flaeche.addEventListener('pointerdown', e => { aktiv = true; try { flaeche.setPointerCapture(e.pointerId); } catch { /* */ } e.preventDefault(); an(e); });
  const los = () => { if (aktiv) { aktiv = false; aus(); } };
  flaeche.addEventListener('pointerup', los);
  flaeche.addEventListener('pointercancel', los);
  flaeche.addEventListener('contextmenu', e => e.preventDefault());
  return () => aktiv;
}
const relativ = (feld, e) => { const r = feld.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
function marke(h, x, y, label, klasse = '') {
  return h.el('button.marke' + klasse, { style: `left:${x}%;top:${y}%`, 'aria-label': label });
}
function wechsleGrund(h, buehne, name) {
  const neu = h.buehne(name);
  const alt = buehne.querySelector('img.grund'), img = neu.querySelector('img.grund');
  if (alt && img) { alt.src = img.src; buehne.style.aspectRatio = neu.style.aspectRatio; buehne.style.width = neu.style.width; }
}

export const PRUEFUNGEN = {
  // I: Der Hügel. Hinauf wollen, zurückgetrieben werden. Wann gibt man auf?
  async huegel(b, args, h) {
    const t = zeilen(h, args); // [Pardel, Löwe, Wölfin, wieder, Stimme, stur]
    const buehne = h.buehne('panther', '.huegel');
    const log = h.el('div.probe-log');
    const akt = aktionen(h);
    b.append(buehne, log, akt);
    let n = 0;
    return new Promise(fertig => {
      const hinauf = async () => {
        akt.replaceChildren();
        if (n === 1) wechsleGrund(h, buehne, 'loewe');
        buehne.classList.remove('zurueck'); void buehne.offsetWidth; buehne.classList.add('steigen');
        ton(h, 'schritt'); await warte(350); ton(h, 'schritt');
        await warte(700);
        ton(h, n === 1 ? 'bruellen' : 'knacken');
        schreibe(h, log, t[Math.min(n, 3)]);
        buehne.classList.remove('steigen'); buehne.classList.add('zurueck');
        n++;
        await warte(900);
        if (n === 2) schreibe(h, log, t[4], 'p.leise');
        if (n === 4) schreibe(h, log, t[5] || '', 'p.leise');
        const stimme = knopf(h, 'Zu der Stimme im Schatten', () => fertig({ zahlen: { huegel: n }, setzt: n >= 4 ? ['huegel_stur'] : [] }), '.stimme-wahl', 'stimme');
        if (n < 2) akt.append(knopf(h, 'Noch einmal hinauf', hinauf, '', 'weg'));
        else if (n < 5) akt.append(knopf(h, 'Noch einmal hinauf', hinauf, '', 'weg'), stimme);
        else akt.append(stimme);
      };
      akt.append(knopf(h, 'Hinauf, zum Licht', hinauf, '', 'weg'));
    });
  },

  // III: Vorübergehen. Wer hinhört, hört nur Ausreden – und verliert Zeit.
  async vorueber(b, args, h) {
    const t = zeilen(h, args);
    const feld = h.buehne('vorhoelle', '.lauschfeld');
    feld.setAttribute('aria-label', 'Die Lauen');
    const vergil = h.el('div.probe-log');
    b.append(h.el('p.lausch-hinweis', {}, 'Leg den Finger auf die Menge, wenn du hinhören willst. Oder geh vorüber.'), feld, vergil);
    const stimmen = t.map((s, i) => {
      // Zwei Spalten, vier Reihen: die Fetzen decken sich nicht.
      const e = h.el('span.fetzen', { style: `left:${i % 2 ? 51 : 3}%;top:${6 + Math.floor(i / 2) * 23}%;animation-delay:${-i * 0.7}s` }, s);
      feld.append(e); return { e, gehoert: false };
    });
    let gehoert = 0;
    const vergilSagt = ['„Sprich nicht von ihnen. Sieh hin und geh vorüber.“', '„Die Welt hat keinen Ruf für sie. Und du gibst ihnen deine Zeit?“', 'Vergil ist schon ein ganzes Stück voraus. Er dreht sich nicht um.'];
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
          if (gehoert === 2) schreibe(h, vergil, vergilSagt[0], 'p.vergil-stimme');
          if (gehoert === 4) schreibe(h, vergil, vergilSagt[1], 'p.vergil-stimme');
          if (gehoert === 6) schreibe(h, vergil, vergilSagt[2], 'p.leise');
        }
      }
    });
    return new Promise(fertig => b.append(aktionen(h, knopf(h, 'Vorübergehen', () => fertig({ zahlen: { verweilt: gehoert }, setzt: gehoert >= 6 ? ['zurueckgeblieben'] : [] }), '', 'weg'))));
  },

  // IV: Die Ehre. Wo stelle ich mich hin, wenn die fünf größten Dichter mich aufnehmen?
  async ehre(b, args, h) {
    const t = zeilen(h, args); // [Hinweis]
    const buehne = h.buehne('dichter', '.reihe-buehne');
    const reihe = h.el('div.dichterreihe', { role: 'group', 'aria-label': 'Die Reihe der Dichter' });
    const namen = ['Homer', 'Horaz', 'Ovid', 'Lucan', 'Vergil'];
    b.append(buehne, h.el('p.lausch-hinweis', {}, t[0] || 'Tippe auf die Lücke, in die du dich stellst.'), reihe);
    return new Promise(fertig => {
      const platz = i => h.el('button.luecke', { 'aria-label': i === 0 ? 'Vor Homer' : i === 5 ? 'Als Sechster, hinter Vergil' : 'Zwischen ' + namen[i - 1] + ' und ' + namen[i], onclick: () => waehle(i) });
      for (let i = 0; i <= 5; i++) { reihe.append(platz(i)); if (i < 5) reihe.append(h.el('span.dichter', {}, namen[i])); }
      const waehle = i => {
        reihe.querySelectorAll('button').forEach(k => { k.disabled = true; });
        const l = reihe.querySelectorAll('.luecke')[i];
        l.classList.add('gewaehlt'); l.textContent = 'Ich';
        ton(h, 'schritt', 0.5);
        const was = i === 0 ? 'stolz' : i === 5 ? 'sechster' : 'dazwischen';
        setTimeout(() => fertig({ setzt: [was] }), 900);
      };
      b.append(aktionen(h, knopf(h, 'Ich bleibe abseits stehen. Hierher gehöre ich nicht.', () => fertig({ setzt: ['abseits'] }), '.leise', 'weg')));
    });
  },

  // V: Im Wind. Dem Paar mit dem Finger folgen, um Francesca zu hören.
  async wind(b, args, h) {
    const teile = h.texteMitVersen(args.text);
    const t = teile.map(x => x.typ === 'vers' ? x.refs.map(r => h.verszeilen(r).join(' ')).join(' ') : x.text);
    const feld = h.buehne('sturm', '.windfeld');
    const paar = h.el('div.windpaar', { 'aria-hidden': 'true' });
    const satz = h.el('div.windsatz');
    feld.append(paar, satz);
    const log = h.el('div.probe-log.francesca');
    b.append(h.el('p.lausch-hinweis', {}, 'Leg den Finger auf das helle Paar und folge ihm. Nur solange du bei ihnen bist, hörst du sie.'), feld, log);
    let px = 0.5, py = 0.5, fx = -1, fy = -1, halten = false, i = 0, fort = 0, verpasst = 0, gehoert = 0;
    const dauer = k => Math.max(2600, (t[k] || '').length * 45);
    halteFlaeche(feld, e => { halten = true; setze(e); }, () => { halten = false; });
    const setze = e => { const p = relativ(feld, e); fx = p.x; fy = p.y; };
    feld.addEventListener('pointermove', e => { if (halten) setze(e); });
    const start = performance.now();
    return new Promise(fertig => {
      let weg = 0;
      const schritt = jetzt => {
        if (!document.body.contains(feld)) return;
        const tt = (jetzt - start) / 1000;
        const tempo = 0.22 + i * 0.015;
        px = 0.5 + 0.34 * Math.sin(tt * tempo * 1.3) * Math.cos(tt * tempo * 0.4);
        py = 0.42 + 0.28 * Math.sin(tt * tempo * 0.9 + 1);
        paar.style.left = px * 100 + '%'; paar.style.top = py * 100 + '%';
        const r = feld.getBoundingClientRect();
        const nah = halten && Math.hypot((px - fx) * r.width, (py - fy) * r.height) < Math.max(55, r.width * 0.13);
        feld.classList.toggle('nah', nah);
        if (h.klang) h.klang.stimme('francesca', nah ? 0.8 : 0, px * 2 - 1);
        if (nah) { fort += 16; weg = 0; } else { weg += 16; }
        satz.textContent = t[i] || '';
        satz.style.setProperty('--fort', Math.min(1, fort / dauer(i)));
        satz.classList.toggle('klar', nah);
        if (fort >= dauer(i)) {
          if (teile[i].typ === 'vers') log.append(h.vers(teile[i].refs)); else schreibe(h, log, t[i], 'p', false);
          gehoert++; i++; fort = 0;
        } else if (weg > 2600 && fort > 0) {
          schreibe(h, log, '… (der Wind nimmt die Worte mit)', 'p.leise', false); verpasst++; i++; fort = 0; weg = 0;
          ton(h, 'wind', 0.6);
        }
        if (i >= t.length) {
          h.klang && h.klang.stilleStimmen();
          feld.classList.add('vorbei');
          b.append(aktionen(h, knopf(h, 'Weiter', () => fertig({ zahlen: { francesca: gehoert, francesca_verpasst: verpasst } }))));
          return;
        }
        requestAnimationFrame(schritt);
      };
      requestAnimationFrame(schritt);
    });
  },

  // VII: Die Gesichter. Unter den Geizigen einen erkennen wollen – und keinen finden.
  async gesichter(b, args, h) {
    const t = zeilen(h, args); // [Hinweis, vier Versuche …]
    const feld = h.buehne('lasten', '.gesichterfeld');
    const log = h.el('div.probe-log');
    b.append(h.el('p.lausch-hinweis', {}, t[0] || ''), feld, log);
    let versuche = 0, aufgegeben = null;
    return new Promise(fertig => {
      const img = feld.querySelector('img.grund');
      feld.addEventListener('pointerdown', e => {
        if (feld.classList.contains('nah') || versuche >= t.length - 1) return;
        const p = relativ(feld, e);
        if (img) { img.style.transformOrigin = `${p.x * 100}% ${p.y * 100}%`; }
        feld.classList.add('nah'); versuche++; ton(h, 'klirren', 0.5);
        setTimeout(() => feld.classList.add('verwischt'), 700);
        setTimeout(() => {
          feld.classList.remove('nah', 'verwischt');
          schreibe(h, log, t[versuche]);
          if (versuche === 2 && !aufgegeben) { aufgegeben = aktionen(h, knopf(h, 'Aufhören zu suchen', () => fertig({ zahlen: { gesichter: versuche } }), '', 'weg')); b.append(aufgegeben); }
          if (versuche >= t.length - 1) { feld.classList.add('vorbei'); }
        }, 1900);
      });
    });
  },

  // VIII: Argenti. Seine Hände greifen nach dem Boot. Was tue ich, bevor Vergil es tut?
  async hand(b, args, h) {
    const t = zeilen(h, args); // Wahlen: id | Text, letzte Zeile: Zögern
    const wahlen = t.slice(0, -1).map(z => { const [id, ...r] = z.split('|'); return { id: id.trim(), text: r.join('|').trim() }; });
    const buehne = h.buehne('argenti', '.handfeld');
    const haende = marke(h, 46, 62, 'Argentis Hände', '.haende');
    buehne.append(haende);
    const linie = h.el('div.frist', {}, h.el('span'));
    const akt = aktionen(h);
    b.append(buehne, h.el('p.lausch-hinweis', {}, 'Du kannst ihm antworten. Oder seine Hände berühren.'), linie, akt);
    const frist = Number(args.sekunden || 10) * 1000;
    return new Promise(fertig => {
      let vorbei = false, tim = null;
      const ende = id => { if (vorbei) return; vorbei = true; clearTimeout(tim); fertig({ setzt: [id], plus: id !== 'zorn_argenti' && id !== 'gezoegert_argenti' ? { mitleid: 1 } : {}, ziel: args['ziel_' + id] }); };
      wahlen.forEach(w => akt.append(knopf(h, w.text, () => ende(w.id))));
      haende.addEventListener('click', () => { haende.classList.add('gebrochen'); ton(h, 'schritt', 0.4); setTimeout(() => ende('hand_argenti'), 500); });
      sobaldSichtbar(akt, () => {
        if (vorbei) return;
        linie.firstChild.style.animationDuration = frist + 'ms';
        linie.classList.add('laeuft');
        tim = setTimeout(() => ende('gezoegert_argenti'), frist);
      }, 800);
    });
  },

  // IX: Medusa. Die Augen zuhalten, solange die Furien schreien.
  async medusa(b, args, h) {
    const t = zeilen(h, args);
    const hand = h.buehne('furien', '.hand');
    hand.setAttribute('role', 'button'); hand.setAttribute('aria-label', 'Augen zuhalten');
    hand.append(h.el('span', {}, 'Hier die Hand auf die Augen legen und halten'));
    // Das Dunkel hängt am <body>, nicht in der Prüfung: Dort würde jede Animation
    // (transform, filter) es auf den Kasten der Prüfung beschränken.
    const dunkel = h.el('div.dunkel', { 'aria-live': 'polite' });
    b.append(hand);
    const augenAuf = () => { document.body.classList.remove('augen-zu'); dunkel.classList.remove('an'); dunkel.remove(); };
    const log = h.el('div.probe-log');
    b.append(log);
    let fehler = 0;
    return new Promise(fertig => {
      let lauf = null;
      const beginne = () => {
        document.body.classList.add('augen-zu');
        dunkel.replaceChildren(); document.body.append(dunkel); dunkel.classList.add('an');
        let i = 0;
        const zeige = () => {
          if (i < t.length - 1) {
            dunkel.append(h.el('p', { html: h.formatiere(t[i]) }));
            // Ältere Zeilen weichen, bevor eine oben abgeschnitten würde
            while (dunkel.childElementCount > 1 && dunkel.scrollHeight > dunkel.clientHeight) dunkel.firstElementChild.remove();
            ton(h, i % 2 ? 'klage' : 'bruellen', 0.7); i++; lauf = setTimeout(zeige, 2100);
          }
          else { lauf = null; augenAuf(); hand.remove(); schreibe(h, log, t[t.length - 1]); b.append(aktionen(h, knopf(h, 'Die Augen öffnen', () => fertig({ zahlen: { medusa_fehler: fehler } })))); }
        };
        zeige();
      };
      const abbruch = () => {
        if (!lauf) return;
        clearTimeout(lauf); lauf = null; fehler++;
        augenAuf();
        ton(h, 'stein');
        b.classList.add('versteinert'); setTimeout(() => b.classList.remove('versteinert'), 1400);
        schreibe(h, log, fehler === 1 ? 'Vergil reißt mich herum. „Augen zu! Wenn sie sich zeigt und du siehst sie, gibt es keinen Weg mehr nach oben.“' : 'Vergil legt seine eigenen Hände über meine. „Noch einmal. Bis ich es sage.“', 'p.leise');
      };
      halteFlaeche(hand, beginne, abbruch);
    });
  },

  // X: Zögern. Wer zu lange schweigt, hat auch geantwortet.
  async zoegern(b, args, h) {
    const t = zeilen(h, args).map(z => { const [id, ...r] = z.split('|'); return { id: id.trim(), text: r.join('|').trim() }; });
    const frist = Number(args.sekunden || 8) * 1000;
    const linie = h.el('div.frist', {}, h.el('span'));
    const akt = aktionen(h);
    b.append(linie, akt);
    return new Promise(fertig => {
      let vorbei = false, tim = null;
      const ende = id => { if (vorbei) return; vorbei = true; clearTimeout(tim); fertig({ setzt: ['antwort_' + id], ziel: id === 'zoegern' ? args.zu_spaet : undefined }); };
      t.forEach(a => akt.append(knopf(h, a.text, () => ende(a.id))));
      sobaldSichtbar(akt, () => {
        if (vorbei) return;
        linie.firstChild.style.animationDuration = frist + 'ms';
        linie.classList.add('laeuft');
        tim = setTimeout(() => ende('zoegern'), frist);
      }, 600);
    });
  },

  // XIII: Der Zweig. Vergil verlangt, dass ich einen abbreche. Ich kann mich weigern – er nicht.
  async zweig(b, args, h) {
    const t = zeilen(h, args); // [Vergil drängt, Stimme, Blut, Vergil führt die Hand]
    const buehne = h.buehne('dornenwald', '.zweigfeld');
    const log = h.el('div.probe-log');
    const akt = aktionen(h);
    b.append(h.el('p.lausch-hinweis', {}, 'Leg den Finger auf einen Zweig und zieh ihn nach unten, bis er bricht.'), buehne, log, akt);
    return new Promise(fertig => {
      let gebrochen = false, selbst = true;
      const brich = async (x, y) => {
        if (gebrochen) return; gebrochen = true;
        buehne.querySelectorAll('.marke').forEach(k => { k.disabled = true; });
        akt.replaceChildren();
        ton(h, 'brechen');
        const tropfen = h.el('span.tropfen', { style: `left:${x}%;top:${y}%` });
        buehne.append(tropfen);
        await warte(700); schreibe(h, log, t[1]); ton(h, 'klage', 0.8);
        await warte(1500); schreibe(h, log, t[2]);
        akt.append(knopf(h, 'Den Zweig fallen lassen', () => fertig({ setzt: selbst ? ['zweig_selbst'] : ['zweig_vergil'] })));
      };
      [[30, 34], [56, 26], [74, 44], [40, 58]].forEach(([x, y]) => {
        const z = marke(h, x, y, 'Zweig');
        let start = null;
        z.addEventListener('pointerdown', e => { start = e.clientY; try { z.setPointerCapture(e.pointerId); } catch { /* */ } e.preventDefault(); });
        z.addEventListener('pointermove', e => { if (start !== null && e.clientY - start > 28) { start = null; z.classList.add('gebrochen'); brich(x, y); } });
        z.addEventListener('pointerup', () => { start = null; });
        z.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { z.classList.add('gebrochen'); brich(x, y); } });
        buehne.append(z);
      });
      const draengen = setTimeout(() => {
        if (gebrochen) return;
        schreibe(h, log, t[0], 'p.leise');
        akt.append(knopf(h, '„Ich kann das nicht.“', async () => {
          if (gebrochen) return;
          selbst = false;
          schreibe(h, log, t[3] || '', 'p.leise');
          await warte(1400);
          const z = buehne.querySelector('.marke'); z && z.classList.add('gebrochen');
          brich(30, 34);
        }, '.leise'));
      }, 7000);
      void draengen;
    });
  },

  // XIV: Die Blätter. Die zerrissenen Blätter zurück an den Busch legen.
  async blaetter(b, args, h) {
    const t = zeilen(h, args);
    const feld = h.buehne('dornenwald', '.blattfeld');
    const busch = h.el('div.busch', { style: 'left:66%;top:48%;width:24%;aspect-ratio:1' }, h.el('span', {}, 'der Busch'));
    feld.append(busch);
    b.append(h.el('p.lausch-hinweis', {}, 'Zieh die Blätter zum Busch.'), feld);
    const log = h.el('div.probe-log');
    b.append(log);
    const blattSvg = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 32C8 16 20 6 34 6C33 21 23 32 6 32Z" fill="#e9e1c8" stroke="#231a12" stroke-width="1.6"/><path d="M6 32L27 13" stroke="#231a12" stroke-width="1.2" fill="none"/></svg>';
    let uebrig = 7;
    return new Promise(fertig => {
      for (let i = 0; i < 7; i++) {
        const bl = h.el('div.blatt-stueck', { html: blattSvg, style: `left:${10 + (i * 29) % 44}%;top:${16 + (i * 41) % 66}%;transform:rotate(${i * 47}deg)` });
        let ziehen = false;
        halteFlaeche(bl, () => { ziehen = true; bl.classList.add('gehoben'); }, () => {
          ziehen = false; bl.classList.remove('gehoben');
          const z = busch.getBoundingClientRect(), r = bl.getBoundingClientRect();
          if (Math.hypot(z.left + z.width / 2 - r.left - r.width / 2, z.top + z.height / 2 - r.top - r.height / 2) < z.width * 0.75) {
            bl.remove(); uebrig--; ton(h, 'knacken', 0.3);
            if (uebrig === 4) schreibe(h, log, t[0] || '');
            if (uebrig === 0) { schreibe(h, log, t[1] || ''); b.append(aktionen(h, knopf(h, 'Aufstehen', () => fertig({})))); }
          }
        });
        bl.addEventListener('pointermove', e => {
          if (!ziehen) return;
          const p = relativ(feld, e);
          bl.style.left = Math.max(0, Math.min(100, p.x * 100)) + '%';
          bl.style.top = Math.max(0, Math.min(100, p.y * 100)) + '%';
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
    b.append(h.tafel('brunetto'), h.el('p.lausch-hinweis', {}, 'Tippe gleichmäßig „Schritt“. Wer von ihnen stehen bleibt, muss hundert Jahre liegen, ohne das Feuer abwehren zu dürfen.'), weg, log, fuss);
    let i = 0, schritte = 0, letzte = null, pausen = 0, gewarnt = false;
    return new Promise(fertig => {
      const pruef = setInterval(() => {
        if (!document.body.contains(fuss)) return clearInterval(pruef);
        if (letzte !== null && performance.now() - letzte > 3500 && !gewarnt && i < t.length) {
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
            b.append(aktionen(h, knopf(h, 'Ihm nachsehen', () => fertig({ zahlen: { brunetto_pausen: pausen } }))));
          }
        }
      });
    });
  },

  // XXIII: Die Flucht. Vergil trägt mich. Die Prüfung: nichts tun, sich tragen lassen.
  async flucht(b, args, h) {
    const t = zeilen(h, args); // Zeilen der Flucht …, [vorletzte: Vergil, wenn man zappelt], [letzte: unten]
    const zeilenFlucht = t.slice(0, -2), zappelText = t[t.length - 2], unten = t[t.length - 1];
    const buehne = h.buehne('pech', '.fluchtfeld', 1.25);
    const text = h.el('div.buehne-text');
    buehne.append(text);
    const zeit = h.el('div.flucht-zeit', {}, h.el('span'));
    const log = h.el('div.probe-log');
    const versuchung = aktionen(h);
    b.append(buehne, zeit, versuchung, log);
    const reize = ['Mich losreißen und selbst laufen', 'Mich umdrehen, nach den Teufeln', 'Nach einem Felsen greifen, um zu bremsen'];
    let gezappelt = 0;
    return new Promise(fertig => {
      reize.forEach(r => versuchung.append(knopf(h, r, () => {
        gezappelt++; ton(h, 'stein', 0.4);
        buehne.classList.remove('wankt'); void buehne.offsetWidth; buehne.classList.add('wankt');
        schreibe(h, log, gezappelt === 1 ? zappelText : 'Er stolpert, fängt sich, und hält mich fester.', 'p.leise', false);
      }, '.leise', 'weg')));
      let i = 0;
      const dauer = Math.max(4, zeilenFlucht.length) * 2600;
      const start = performance.now();
      const takt = setInterval(() => {
        if (!document.body.contains(buehne)) return clearInterval(takt);
        const f = Math.min(1, (performance.now() - start) / dauer);
        zeit.style.setProperty('--fort', f.toFixed(3));
        const soll = Math.min(zeilenFlucht.length, Math.floor(f * zeilenFlucht.length) + 1);
        while (i < soll) { text.textContent = zeilenFlucht[i]; schreibe(h, log, zeilenFlucht[i], 'p', false); i++; ton(h, 'schritt', 0.4); }
        if (f >= 1) {
          clearInterval(takt);
          versuchung.remove(); buehne.classList.add('unten'); ton(h, 'stein', 0.5);
          text.textContent = '';
          schreibe(h, log, unten);
          b.append(aktionen(h, knopf(h, 'Aufsehen', () => fertig({ zahlen: { flucht_gezappelt: gezappelt }, setzt: gezappelt ? [] : ['getragen_still'] }))));
        }
      }, 200);
    });
  },

  // XXIV: Der Griff. Erst prüfen, ob der Stein trägt, dann greifen.
  async griff(b, args, h) {
    const t = zeilen(h, args); // [Hinweis, locker, gerutscht, oben]
    const wand = h.buehne('felsen', '.wand');
    const log = h.el('div.probe-log');
    b.append(h.el('p.lausch-hinweis', {}, t[0] || ''), wand, log);
    const stufen = 5;
    let stufe = 0, rutscher = 0, geprueft = 0;
    return new Promise(fertig => {
      const baue = () => {
        wand.querySelectorAll('.marke, .kletterer2').forEach(k => k.remove());
        wand.append(h.el('div.kletterer2', { style: `bottom:${6 + stufe * 16}%` }));
        if (stufe >= stufen) {
          schreibe(h, log, t[3] || '');
          b.append(aktionen(h, knopf(h, 'Oben. Atmen.', () => fertig({ zahlen: { griff_rutscher: rutscher, griff_geprueft: geprueft } }))));
          return;
        }
        const locker = Math.random() < 0.5 ? 0 : 1;
        [0, 1].forEach(seite => {
          const st = marke(h, seite ? 64 : 36, 100 - (12 + (stufe + 1) * 16), 'Stein');
          let langZeit = null;
          st.addEventListener('pointerdown', e => {
            e.preventDefault();
            langZeit = setTimeout(() => { langZeit = null; greife(); }, 550);
          });
          const kurz = () => {
            if (langZeit === null) return;
            clearTimeout(langZeit); langZeit = null;
            geprueft++; ton(h, 'knacken', 0.5);
            st.classList.add(seite === locker ? 'wackelt' : 'traegt');
            if (seite === locker && !wand.dataset.gewarnt) { wand.dataset.gewarnt = '1'; schreibe(h, log, t[1] || '', 'p.leise'); }
          };
          st.addEventListener('pointerup', kurz);
          st.addEventListener('pointerleave', () => { if (langZeit) { clearTimeout(langZeit); langZeit = null; } });
          st.addEventListener('contextmenu', e => e.preventDefault());
          const greife = () => {
            if (seite === locker) {
              rutscher++; ton(h, 'stein', 0.6); st.classList.add('faellt');
              schreibe(h, log, t[2] || '', 'p.leise');
              stufe = Math.max(0, stufe - 1);
              setTimeout(baue, 900);
            } else { ton(h, 'schritt'); stufe++; setTimeout(baue, 250); }
          };
          wand.append(st);
        });
      };
      baue();
    });
  },

  // XXX: Zusehen. Ein Streit, dem man gern zuhört.
  async zuschauen(b, args, h) {
    const t = zeilen(h, args);
    const vergil = ['Vergil, hinter mir, leise: „Schau nur weiter hin.“', 'Vergil: „Es fehlt nicht viel, und ich streite mit dir.“'];
    const halt = h.el('button.hinhoeren', {}, 'Gedrückt halten, um weiter zuzuhören');
    const log = h.el('div.probe-log.streit');
    b.append(h.tafel('faelscher'), log, halt);
    let i = 0, an = false, timer = null;
    const zeige = () => {
      if (!an) return;
      if (i === 6) schreibe(h, log, vergil[0], 'p.vergil-stimme');
      if (i === 10) schreibe(h, log, vergil[1], 'p.vergil-stimme');
      if (i < t.length) schreibe(h, log, t[i]);
      else if (i === t.length) schreibe(h, log, 'Sie fangen von vorn an. Es hört nicht auf.', 'p.leise');
      ton(h, i % 2 ? 'schlag' : 'klage', 0.5);
      i++;
      timer = setTimeout(zeige, 2300);
    };
    return new Promise(fertig => {
      halteFlaeche(halt, () => { an = true; halt.classList.add('an'); zeige(); }, () => { an = false; clearTimeout(timer); halt.classList.remove('an'); });
      b.append(aktionen(h, knopf(h, 'Mich abwenden', () => { an = false; clearTimeout(timer); fertig({ zahlen: { zugehoert: i }, setzt: i >= 7 ? ['zu_lange_zugehoert'] : [] }); }, '', 'weg')));
    });
  },

  // XXXIII: Ugolino. Bis zum Ende zuhören – oder nicht.
  async ugolino(b, args, h) {
    const t = h.texteMitVersen(args.text);
    const log = h.el('div.probe-log.ugolino');
    const akt = aktionen(h);
    b.append(log, akt);
    let i = 0;
    return new Promise(fertig => {
      const weiter = () => {
        const teil = t[i++];
        if (teil.typ === 'vers') { const v = h.vers(teil.refs); log.append(v); sichtbar(v); } else schreibe(h, log, teil.text);
        ton(h, 'herz', 0.4);
        akt.replaceChildren();
        if (i >= t.length) { akt.append(knopf(h, 'Schweigen', () => fertig({ setzt: ['ugolino_ganz'], zahlen: { ugolino: i } }))); return; }
        akt.append(knopf(h, 'Weiter zuhören', weiter), knopf(h, 'Nicht mehr hören', () => fertig({ zahlen: { ugolino: i }, ziel: args.abbruch }), '.leise', 'weg'));
      };
      weiter();
    });
  },

  // XXXIV: Die Umkehr. Hinab an Luzifers Fell – und plötzlich ist unten oben.
  // Nach der Wende sagt das Spiel nicht mehr, wohin. Man muss Vergil glauben.
  async umkehr(b, args, h) {
    const t = zeilen(h, args); // [Wende, Vergil, oben, falsch]
    const schacht = h.buehne('luzifer', '.schacht');
    schacht.append(h.el('div.kletterer'));
    const anzeige = h.el('p.lausch-hinweis', {}, 'Wisch nach unten, um an seinem Fell hinabzuklettern.');
    const log = h.el('div.probe-log');
    b.append(anzeige, schacht, log);
    let weg = 0, gedreht = false, startY = null, falsch = 0, fertigGesagt = false;
    return new Promise(fertig => {
      schacht.addEventListener('pointerdown', e => { startY = e.clientY; try { schacht.setPointerCapture(e.pointerId); } catch { /* */ } e.preventDefault(); });
      schacht.addEventListener('pointermove', e => {
        if (startY === null || fertigGesagt) return;
        const dy = e.clientY - startY;
        const richtig = gedreht ? -dy : dy;
        if (richtig > 0) { weg += richtig / 600; startY = e.clientY; }
        else if (gedreht && richtig < -60) {
          startY = e.clientY; falsch++;
          if (falsch === 1) schreibe(h, log, t[3] || '', 'p.leise');
        }
        schacht.style.setProperty('--weg', Math.min(1, gedreht ? 1 - (weg - 0.5) * 2 : weg * 2));
        if (!gedreht && weg >= 0.5) {
          // Der Rest dieses Wischs zählt nicht mehr: Nach der Wende braucht es einen neuen Griff.
          gedreht = true; startY = null; schacht.classList.add('gedreht'); ton(h, 'donner', 0.6);
          schreibe(h, log, t[0] || ''); schreibe(h, log, t[1] || '', 'p.vergil-stimme');
          anzeige.textContent = '„Halt dich gut fest.“';
        }
        if (weg >= 1) {
          fertigGesagt = true; startY = null; schacht.classList.add('fertig'); schreibe(h, log, t[2] || '');
          b.append(aktionen(h, knopf(h, 'Weiter', () => fertig({ zahlen: { umkehr_falsch: falsch } }))));
        }
      });
      schacht.addEventListener('pointerup', () => { startY = null; });
    });
  },

  // Ende: Die Sterne. Jeder getragene Name ein Licht.
  async sterne(b, args, h) {
    const namen = Object.values(h.stand.getragen);
    const himmel = h.buehne('sterne', '.himmel');
    const name = h.el('p.sternname', { 'aria-live': 'polite' }, namen.length ? 'Tippe die Sterne an.' : '');
    b.append(himmel, name);
    namen.forEach((n, i) => {
      const s = h.el('button.stern', { style: `left:${12 + (i * 53) % 76}%;top:${10 + (i * 37) % 44}%;animation-delay:${i * 0.8}s`, 'aria-label': n });
      s.addEventListener('click', () => { name.textContent = n; ton(h, 'stern'); s.classList.add('gelesen'); });
      himmel.append(s);
    });
    await warte(namen.length ? 2500 : 800);
    return new Promise(fertig => b.append(aktionen(h, knopf(h, 'Weiter', () => fertig({})))));
  },
};
