// Oberfläche: Seiten, Lauschbilder, Menü, Speichern, neue Fassungen.
import { zerlegeAbschnitt } from './skript.js';
import * as Z from './zustand.js';
import { WERKE } from '../daten/werke.js';
import { VERSION } from './version.js';
import { zeichne, zeichneKarte } from './bilder.js';
import { Klang } from './klang.js';
import { PRUEFUNGEN } from './pruefungen.js';

const WERK_ID = 'inferno';
const SPEICHER = 'dante.' + WERK_ID + '.stand';
const EINSTELLUNG = 'dante.einstellungen';
const ROEMISCH = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV'];

const $ = (sel, wurzel = document) => wurzel.querySelector(sel);
function el(tag, attrs = {}, ...kinder) {
  const [name, ...klassen] = tag.split('.');
  const e = document.createElement(name || 'div');
  if (klassen.length) e.className = klassen.join(' ');
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kinder.flat()) if (k !== null && k !== undefined) e.append(k);
  return e;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const formatiere = s => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

// --- Zustand der Sitzung -------------------------------------------------
const app = {
  werk: null, verse: null, stand: null,
  einst: { ton: true, schrift: 1, bewegung: true },
  klang: null,
  neueFassung: false,
  letzteAktivitaet: Date.now(),
};

function ladeEinstellungen() {
  try { Object.assign(app.einst, JSON.parse(localStorage.getItem(EINSTELLUNG) || '{}')); } catch { /* egal */ }
  document.documentElement.style.setProperty('--schrift', app.einst.schrift);
}
function speichereEinstellungen() {
  localStorage.setItem(EINSTELLUNG, JSON.stringify(app.einst));
  document.documentElement.style.setProperty('--schrift', app.einst.schrift);
}

function speichere() {
  if (!app.stand) return;
  const jetzt = Date.now();
  const delta = Math.min(jetzt - app.letzteAktivitaet, 5 * 60 * 1000);
  app.stand.zeit.gespielt += Math.max(0, delta);
  app.letzteAktivitaet = jetzt;
  try {
    const alt = localStorage.getItem(SPEICHER);
    if (alt) localStorage.setItem(SPEICHER + '.vorher', alt);
    localStorage.setItem(SPEICHER, Z.serialisiere(app.stand));
  } catch (e) { zeigeHinweis('Speichern fehlgeschlagen: ' + e.message); }
}

function ladeStand() {
  for (const k of [SPEICHER, SPEICHER + '.vorher']) {
    const t = localStorage.getItem(k);
    if (!t) continue;
    try { return Z.deserialisiere(t); } catch { /* nächsten Versuch */ }
  }
  return null;
}

// --- Laden der Daten -------------------------------------------------------
async function ladeWerk(id) {
  const def = WERKE[id];
  const texte = await Promise.all(def.abschnitte.map(p => fetch(p).then(r => {
    if (!r.ok) throw new Error(p + ': ' + r.status);
    return r.text();
  })));
  const abschnitte = texte.map((t, i) => zerlegeAbschnitt(t, def.abschnitte[i]));
  const verse = await fetch(def.verse).then(r => r.json());
  return {
    def,
    abschnitte: Object.fromEntries(abschnitte.map(a => [a.id, a])),
    reihe: abschnitte.map(a => a.id),
    verse: verse.gesaenge,
  };
}

// --- Thema (Farbe, Klang) ------------------------------------------------
function setzeThema(thema) {
  document.body.dataset.thema = thema || 'wald';
  if (app.klang) app.klang.raum(thema);
}

// --- Seiten --------------------------------------------------------------
const seite = () => $('#seite');

function leereSeite(klasse = '') {
  const s = seite();
  s.className = klasse;
  s.replaceChildren();
  window.scrollTo(0, 0);
  return s;
}

function versBlock(refs) {
  const block = el('blockquote.vers');
  refs.forEach((r, i) => {
    const zeilen = app.werk.verse[r.g - 1].slice(r.a - 1, r.b);
    if (i > 0) block.append(el('div.vers-luecke', { 'aria-hidden': 'true' }, '· · ·'));
    zeilen.forEach(z => block.append(el('span.verszeile', {}, z)));
  });
  const q = refs.map(r => `${ROEMISCH[r.g]}, ${r.a}${r.b > r.a ? '–' + r.b : ''}`).join('; ');
  block.append(el('cite', {}, `Hölle ${q} · Philalethes`));
  return block;
}

function zeigeKopf(abschnitt) {
  $('#kopf-titel').textContent = abschnitt.titel + (abschnitt.untertitel ? ' · ' + abschnitt.untertitel : '');
}

function gehe(ziel, echo = null, vonAbschnitt = null) {
  if (app.neueFassung) { // neue Fassung beim Umblättern laden
    const info = Z.betrete(app.stand, app.werk, ziel, vonAbschnitt);
    speichere();
    if (!info.spezial) { location.reload(); return; }
  }
  const vorher = app.stand.ort && app.stand.ort.abschnitt;
  const zaehle = () => [Object.keys(app.stand.merk.seele).length, Object.keys(app.stand.merk.prophezeiung).length, Object.keys(app.stand.getragen).length, Object.keys(app.stand.merk.suche).length];
  const vor = zaehle();
  const info = Z.betrete(app.stand, app.werk, ziel, vonAbschnitt);
  speichere();
  const nach = zaehle();
  const neu = ['Ins Merkbuch geschrieben', 'Eine Vorhersage notiert', 'Ein Name, den ich hinauftrage', 'Ein Auftrag notiert'].filter((_, i) => nach[i] > vor[i]);
  if (neu.length) setTimeout(() => zeigeHinweis(neu.join(' · ') + ' (Menü → Merkbuch)'), 600);
  if (info.spezial === 'titel') return zeigeTitel();
  if (vorher !== info.abschnitt.id && info.knoten.id === info.abschnitt.start && info.erstesMal) {
    return zeigeKapitelblatt(info.abschnitt, () => zeigeKnoten(info.abschnitt, info.knoten, echo));
  }
  zeigeKnoten(info.abschnitt, info.knoten, echo);
}

function zeigeKapitelblatt(ab, weiter) {
  setzeThema(ab.thema);
  zeigeKopf(ab);
  const s = leereSeite('kapitel');
  const nr = app.werk.reihe.indexOf(ab.id);
  s.append(
    el('div.kapitel-karte', { html: zeichneKarte(ab.kreis, app.stand) }),
    el('p.rubrik', {}, ab.kreis && /^\d$/.test(ab.kreis) ? `${['', 'Erster', 'Zweiter', 'Dritter', 'Vierter', 'Fünfter', 'Sechster', 'Siebter', 'Achter', 'Neunter'][+ab.kreis]} Kreis` : ''),
    el('h1.kapitel-titel', {}, ab.titel),
    ab.untertitel ? el('p.kapitel-unter', {}, ab.untertitel) : null,
    ab.gesaenge ? el('p.kapitel-gesaenge', {}, 'Gesänge ' + ab.gesaenge) : null,
  );
  if (nr > 0 && nr % 3 === 0) {
    s.append(el('p.kapitel-hinweis', {}, 'Ein guter Moment, den Sicherungscode zu erneuern: Menü → Sicherung.'));
  }
  s.append(el('div.aktionen', {}, el('button.wahl.weiter', { onclick: () => { app.klang && app.klang.blatt(); weiter(); } }, 'Hinab')));
}

function zeigeKnoten(ab, k, echo) {
  setzeThema(k.meta.klang || ab.thema);
  zeigeKopf(ab);
  const s = leereSeite('blatt');
  if (echo) s.append(el('p.echo', {}, echo));
  if (k.meta.rubrik) s.append(el('p.rubrik', {}, k.meta.rubrik));
  if (k.meta.ort) s.append(el('h2.ort', {}, k.meta.ort));

  const stimmen = k.stimmen.filter(st => Z.pruefeBedingung(app.stand, st.bed, ab.id));
  if (k.meta.bild || stimmen.length) s.append(lauschbild(ab, k, stimmen));

  let ersterAbsatz = !!k.meta.rubrik;
  for (const t of k.teile) {
    if (!Z.pruefeBedingung(app.stand, t.bed, ab.id)) continue;
    if (t.typ === 'vers') { s.append(versBlock(t.refs)); continue; }
    const p = el('p', { html: formatiere(t.text) });
    if (ersterAbsatz && /^[A-ZÄÖÜ„»]/.test(t.text)) { p.classList.add('initial'); ersterAbsatz = false; }
    s.append(p);
  }

  const aktionen = el('div.aktionen');
  s.append(aktionen);
  if (k.pruefung) return starteProbe(ab, k, aktionen);

  const wahlen = Z.sichtbareWahlen(app.stand, ab.id, k);
  for (const w of wahlen) {
    aktionen.append(el('button.wahl.' + w.art, {
      onclick: () => {
        app.klang && app.klang.tippen();
        Z.waehle(app.stand, ab.id, k, w);
        gehe(w.ziel, w.art === 'rede' ? w.text : null, ab.id);
      },
    }, el('span.zeiger', { 'aria-hidden': 'true' }, w.art === 'rede' ? '☞' : '→'), el('span', { html: formatiere(w.text) })));
  }
  if (k.weiter) {
    aktionen.append(el('button.wahl.weiter', { onclick: () => { app.klang && app.klang.blatt(); gehe(k.weiter.ziel, null, ab.id); } }, k.weiter.label || 'Weiter'));
  }
  if (!wahlen.length && !k.weiter && !stimmen.length) {
    // Darf nicht vorkommen; Ausweg statt Sackgasse.
    aktionen.append(el('button.wahl.weiter', { onclick: () => gehe(ab.id + ':' + ab.start, null, ab.id) }, 'Zurück zum Anfang des Abschnitts'));
  }
}

// --- Lauschbild: hören, bevor man sieht ---------------------------------
function lauschbild(ab, k, stimmen) {
  const fig = el('figure.miniatur', { html: zeichne(k.meta.bild || ab.thema) });
  if (!stimmen.length) return fig;
  fig.classList.add('lauschen');
  const schicht = el('div.stimmen');
  fig.append(schicht);
  const liste = el('div.gehoert-liste');
  const huelle = el('div.lausch-huelle', {}, fig, liste);
  const knoten = stimmen.map((st, i) => {
    const key = ab.id + ':' + k.id + '~' + i;
    const b = el('button.stimme', { style: `left:${st.x}%;top:${st.y}%`, tabindex: '-1' }, st.text);
    b.dataset.key = key;
    const eintrag = { st, key, b, zeit: 0, gehoert: !!app.stand.gehoert[key] };
    b.addEventListener('click', () => { if (eintrag.gehoert) folge(eintrag); });
    schicht.append(b);
    return eintrag;
  });
  const folge = e => {
    app.klang && app.klang.stilleStimmen();
    gehe(e.st.ziel, null, ab.id);
  };
  const markiere = e => {
    if (e.gehoert && e.listenKnopf) return;
    e.gehoert = true;
    app.stand.gehoert[e.key] = 1;
    e.b.classList.add('gehoert');
    e.listenKnopf = el('button.wahl.stimme-wahl', { onclick: () => folge(e) },
      el('span.zeiger', { 'aria-hidden': 'true' }, '∿'), el('span', {}, '„' + e.st.text + '“'));
    liste.append(e.listenKnopf);
    app.klang && app.klang.gefunden();
  };
  knoten.forEach(e => { if (e.gehoert) markiere(e); });

  const hinweis = el('p.lausch-hinweis', {}, app.stand.flags._lauschenGelernt
    ? 'Finger auf das Bild legen und lauschen.'
    : 'Halte den Finger auf das Bild und fahre langsam darüber. Wo jemand spricht, wird die Stimme deutlich. Was du gehört hast, kannst du antippen.');
  huelle.insertBefore(hinweis, liste);

  let lauscht = false, letzt = 0;
  const kreis = el('div.hoerkreis');
  fig.append(kreis);
  const aktualisiere = (x, y, dt) => {
    const r = fig.getBoundingClientRect();
    const radius = Math.max(70, r.width * 0.22);
    kreis.style.left = (x - r.left) + 'px'; kreis.style.top = (y - r.top) + 'px';
    kreis.style.width = kreis.style.height = radius * 2 + 'px';
    for (const e of knoten) {
      const br = e.b.getBoundingClientRect();
      const d = Math.hypot(br.left + br.width / 2 - x, br.top + br.height / 2 - y);
      const n = Math.max(0, 1 - d / radius);
      e.b.style.setProperty('--n', n.toFixed(2));
      if (app.klang) app.klang.stimme(e.key, n, ((br.left + br.width / 2 - r.left) / r.width) * 2 - 1);
      if (n > 0.45) { e.zeit += dt; if (e.zeit > 450 && !e.gehoert) markiere(e); }
    }
  };
  const ende = () => {
    lauscht = false; fig.classList.remove('lauscht');
    knoten.forEach(e => e.b.style.setProperty('--n', 0));
    app.klang && app.klang.stilleStimmen();
  };
  fig.addEventListener('pointerdown', ev => {
    lauscht = true; letzt = performance.now();
    fig.classList.add('lauscht');
    app.stand.flags._lauschenGelernt = true;
    try { fig.setPointerCapture(ev.pointerId); } catch { /* egal */ }
    app.klang && app.klang.lauschen(true);
    aktualisiere(ev.clientX, ev.clientY, 0);
    ev.preventDefault();
  });
  fig.addEventListener('pointermove', ev => {
    if (!lauscht) return;
    const jetzt = performance.now();
    aktualisiere(ev.clientX, ev.clientY, jetzt - letzt);
    letzt = jetzt;
  });
  // Auch stilles Halten zählt: Zeit läuft weiter.
  const tick = setInterval(() => {
    if (!document.body.contains(fig)) return clearInterval(tick);
    if (lauscht && fig._letztePos) aktualisiere(fig._letztePos.x, fig._letztePos.y, 120);
  }, 120);
  fig.addEventListener('pointermove', ev => { fig._letztePos = { x: ev.clientX, y: ev.clientY }; });
  fig.addEventListener('pointerdown', ev => { fig._letztePos = { x: ev.clientX, y: ev.clientY }; });
  fig.addEventListener('pointerup', () => { ende(); app.klang && app.klang.lauschen(false); speichere(); });
  fig.addEventListener('pointercancel', ende);
  fig.addEventListener('contextmenu', ev => ev.preventDefault());

  // Hilfe, wenn lange nichts gefunden wird.
  const hilfe = setTimeout(() => {
    if (!document.body.contains(fig)) return;
    const offen = knoten.filter(e => !e.gehoert);
    if (!offen.length) return;
    huelle.insertBefore(el('button.wahl.hilfe', {
      onclick: ev => { offen.forEach(markiere); ev.currentTarget.remove(); },
    }, el('span.zeiger', {}, '☞'), el('span', {}, 'Vergil: „Hör genauer hin.“ (alle Stimmen zeigen)')), liste);
  }, 30000);
  fig.addEventListener('pointerdown', () => clearTimeout(hilfe), { once: true });
  return huelle;
}

// --- Prüfungen -------------------------------------------------------------
function starteProbe(ab, k, wurzel) {
  const p = PRUEFUNGEN[k.pruefung.name];
  if (!p) throw new Error('Prüfung fehlt: ' + k.pruefung.name);
  const buehne = el('div.probe.probe-' + k.pruefung.name);
  wurzel.append(buehne);
  const textKnoten = id => {
    const tk = ab.knoten[id];
    if (!tk) throw new Error('Textknoten fehlt: ' + id);
    return tk.teile.filter(t => Z.pruefeBedingung(app.stand, t.bed, ab.id));
  };
  const hilfen = {
    klang: app.klang, el, vers: refs => versBlock(refs), stand: app.stand, formatiere,
    texte: id => textKnoten(id).filter(t => t.typ === 'p').map(t => t.text),
    texteMitVersen: textKnoten,
  };
  Promise.resolve(p(buehne, k.pruefung.args, hilfen)).then(ergebnis => {
    Z.wendePruefungsErgebnisAn(app.stand, ergebnis || {});
    speichere();
    gehe((ergebnis && ergebnis.ziel) || k.pruefung.ziel, null, ab.id);
  });
}

// --- Titel -----------------------------------------------------------------
function istIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function istInstalliert() { return window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; }

function zeigeTitel() {
  setzeThema('titel');
  $('#kopf-titel').textContent = '';
  const s = leereSeite('titelblatt');
  const hatStand = app.stand && app.stand.ort;
  s.append(
    el('div.titel-initial', { 'aria-hidden': 'true' }, 'I'),
    el('h1', {}, 'Was ich dort hörte'),
    el('p.unter', {}, 'Dantes Inferno · ein Spiel in vierunddreißig Gesängen'),
    el('p.titel-zitat', {}, '„Als ich auf halbem Weg stand unsers Lebens …“'),
  );
  const aktionen = el('div.aktionen');
  if (hatStand) {
    const ab = app.werk.abschnitte[app.stand.ort.abschnitt];
    aktionen.append(el('button.wahl.weiter', { onclick: () => { starteTon(); zeigeOrt(); } }, 'Weiterspielen'),
      el('p.titel-ort', {}, (ab ? ab.titel : '') + ' · ' + Math.round(app.stand.zeit.gespielt / 60000) + ' Minuten unterwegs'));
  } else {
    aktionen.append(el('button.wahl.weiter', { onclick: () => { starteTon(); neuesSpiel(); } }, 'Beginnen'));
  }
  s.append(aktionen);
  s.append(el('p.titel-ton', {}, 'Mit Ton gespielt, am besten mit Kopfhörern. Es geht auch stumm.'));
  if (!istInstalliert()) {
    s.append(el('div.install', {},
      el('strong', {}, 'Damit dein Weg nicht verloren geht'),
      el('p', {}, istIOS()
        ? 'Tippe in Safari auf das Teilen-Symbol und dann auf „Zum Home-Bildschirm“. Safari löscht Daten von Seiten, die man etwa sieben Tage nicht besucht; die installierte App ist davon ausgenommen.'
        : 'Installiere das Spiel über das Browsermenü als App („Zum Startbildschirm hinzufügen“ oder „Installieren“). Dann bleibt der Spielstand sicher erhalten.'),
      el('p', {}, 'Zusätzlich gibt es im Menü unter „Sicherung“ einen Code, mit dem du deinen Stand überall wiederherstellen kannst.')));
  }
}

function neuesSpiel() {
  app.stand = Z.neuerStand(WERK_ID);
  app.stand.zeit.start = Date.now();
  app.letzteAktivitaet = Date.now();
  gehe(app.werk.def.anfang);
}

function zeigeOrt() {
  const { abschnitt, knoten } = app.stand.ort;
  const ab = app.werk.abschnitte[abschnitt];
  if (!ab || !ab.knoten[knoten]) { zeigeHinweis('Der gespeicherte Ort existiert in dieser Fassung nicht mehr. Du beginnst am Anfang des Abschnitts.'); return gehe((ab ? ab.id : app.werk.reihe[0]) + ':'); }
  app.letzteAktivitaet = Date.now();
  zeigeKnoten(ab, ab.knoten[knoten], null);
}

// --- Ton -----------------------------------------------------------------
function starteTon() {
  if (!app.klang) app.klang = new Klang();
  app.klang.an(app.einst.ton);
  aktualisiereTonKnopf();
}
function aktualisiereTonKnopf() {
  const b = $('#ton-knopf');
  b.textContent = app.einst.ton ? 'Ton an' : 'Ton aus';
  b.setAttribute('aria-pressed', app.einst.ton ? 'true' : 'false');
}

// --- Menü -----------------------------------------------------------------
function oeffneMenue(tab = 'merkbuch') {
  const schicht = $('#schicht');
  schicht.hidden = false;
  const reiter = [['merkbuch', 'Merkbuch'], ['gesaenge', 'Gesänge'], ['karte', 'Karte'], ['sicherung', 'Sicherung'], ['einstellungen', 'Mehr']];
  const inhalt = el('div.menue-inhalt');
  const leiste = el('nav.reiter', {}, reiter.map(([id, name]) => el('button' + (id === tab ? '.aktiv' : ''), { onclick: () => oeffneMenue(id) }, name)));
  const panel = el('div.menue', { role: 'dialog', 'aria-label': 'Menü' },
    el('div.menue-kopf', {}, leiste, el('button.schliessen', { onclick: schliesseMenue, 'aria-label': 'Schließen' }, '×')),
    inhalt);
  schicht.replaceChildren(panel);
  ({ merkbuch: menueMerkbuch, gesaenge: menueGesaenge, karte: menueKarte, sicherung: menueSicherung, einstellungen: menueEinstellungen })[tab](inhalt);
}
function schliesseMenue() { $('#schicht').hidden = true; $('#schicht').replaceChildren(); }

function menueMerkbuch(w) {
  if (!app.stand) { w.append(el('p', {}, 'Noch ist nichts aufgeschrieben.')); return; }
  const m = app.stand.merk;
  const liste = (titel, obj, leer, fn = (id, t) => t) => {
    const e = Object.entries(obj);
    w.append(el('h3', {}, titel));
    if (!e.length) return w.append(el('p.leer', {}, leer));
    w.append(el('ul.merkliste', {}, e.map(([id, t]) => el('li', { html: fn(id, t) }))));
  };
  const zeile = t => { const [name, ...rest] = t.split(' | '); return `<strong>${esc(name)}</strong>${rest.length ? ' – ' + formatiere(rest.join(' ')) : ''}`; };
  liste('Namen, die ich hinauftrage', app.stand.getragen, 'Noch hat mich niemand gebeten, an ihn zu erinnern. Oder ich habe es nicht versprochen.', (id, n) => esc(n));
  liste('Wen ich getroffen habe', m.seele, 'Noch niemanden.', (id, t) => zeile(t));
  liste('Was mir vorausgesagt wurde', m.prophezeiung, 'Noch nichts.', (id, t) => formatiere(t));
  if (Object.keys(m.suche).length) liste('Nach wem ich fragen soll', m.suche, '', (id, t) => (app.stand.gefunden[id] ? '✓ ' : '◦ ') + zeile(t));
}

function menueGesaenge(w) {
  w.append(el('p', {}, 'Jeder Gesang, den du erlebt hast, steht hier in Dantes Versen, übersetzt von Philalethes. Zum Nachlesen, wann du willst.'));
  const raster = el('div.gesang-raster');
  for (let g = 1; g <= 34; g++) {
    const offen = app.stand && app.stand.gesaenge[g];
    raster.append(el('button' + (offen ? '' : '.zu'), { disabled: !offen, onclick: () => leseGesang(w, g) }, ROEMISCH[g]));
  }
  w.append(raster);
}

function leseGesang(w, g) {
  w.replaceChildren(el('button.zurueck', { onclick: () => { w.replaceChildren(); menueGesaenge(w); } }, '← Alle Gesänge'),
    el('h3', {}, `${ROEMISCH[g]}. Gesang`));
  const block = el('div.gesang-text');
  app.werk.verse[g - 1].forEach((z, i) => {
    block.append(el('span.verszeile', {}, z, (i + 1) % 3 === 0 ? el('span.nr', {}, String(i + 1)) : null));
    if ((i + 1) % 3 === 0) block.append(el('span.terzine-luecke'));
  });
  w.append(block);
  w.closest('.menue').scrollTop = 0;
}

function menueKarte(w) {
  const ab = app.stand && app.stand.ort ? app.werk.abschnitte[app.stand.ort.abschnitt] : null;
  w.append(el('div.karte-gross', { html: zeichneKarte(ab ? ab.kreis : '0', app.stand) }));
  w.append(el('p', {}, 'Die Hölle ist ein Trichter unter Jerusalem. Neun Kreise, jeder enger als der vorige. Oben die Maßlosen, in der Mitte die Gewalttätigen, unten die Betrüger und Verräter.'));
  if (ab) w.append(el('p', {}, el('strong', {}, 'Du bist hier: '), ab.titel + (ab.untertitel ? ' – ' + ab.untertitel : '')));
}

function menueSicherung(w) {
  w.append(el('p', {}, 'Der Spielstand wird bei jedem Schritt auf diesem Gerät gespeichert. Der Sicherungscode enthält deinen ganzen Weg. Kopiere ihn in eine Notiz oder schick ihn dir selbst. Mit ihm kannst du auf jedem Gerät weiterspielen.'));
  const feld = el('textarea.code', { readonly: true, rows: 4, 'aria-label': 'Sicherungscode' });
  const status = el('p.status');
  const erzeugen = el('button.wahl', {
    onclick: async () => {
      speichere();
      feld.value = await Z.erzeugeSicherungscode(app.stand);
      feld.select();
      try { await navigator.clipboard.writeText(feld.value); status.textContent = 'Kopiert. Füge ihn in eine Notiz ein.'; } catch { status.textContent = 'Markiert. Jetzt kopieren (lange drücken → Kopieren).'; }
    },
  }, el('span.zeiger', {}, '☞'), el('span', {}, 'Code erzeugen und kopieren'));
  w.append(erzeugen, feld, status);
  w.append(el('h3', {}, 'Wiederherstellen'));
  const ein = el('textarea.code', { rows: 4, placeholder: 'INF1-…', 'aria-label': 'Code zum Wiederherstellen' });
  const status2 = el('p.status');
  w.append(ein, el('button.wahl', {
    onclick: async () => {
      try {
        const s = await Z.liesSicherungscode(ein.value);
        if (!confirm('Den aktuellen Stand durch den Code ersetzen?')) return;
        app.stand = s; speichere(); schliesseMenue(); zeigeTitel();
        zeigeHinweis('Stand wiederhergestellt.');
      } catch (e) { status2.textContent = e.message; }
    },
  }, el('span.zeiger', {}, '☞'), el('span', {}, 'Stand aus Code wiederherstellen')), status2);
  if (!istInstalliert()) w.append(el('p.hinweis', {}, istIOS() ? 'Tipp: Als App installieren (Teilen → „Zum Home-Bildschirm“). Dann löscht Safari den Stand nicht nach sieben Tagen.' : 'Tipp: Als App installieren, dann bleibt der Stand dauerhaft.'));
}

function menueEinstellungen(w) {
  const ton = el('button.wahl', { onclick: () => { app.einst.ton = !app.einst.ton; speichereEinstellungen(); starteTon(); oeffneMenue('einstellungen'); } },
    el('span.zeiger', {}, '♪'), el('span', {}, app.einst.ton ? 'Ton ausschalten' : 'Ton einschalten'));
  const groesse = el('div.schriftwahl', {}, el('span', {}, 'Schrift: '),
    ...[[0.9, 'klein'], [1, 'mittel'], [1.15, 'groß'], [1.3, 'sehr groß']].map(([f, n]) =>
      el('button' + (app.einst.schrift === f ? '.aktiv' : ''), { onclick: () => { app.einst.schrift = f; speichereEinstellungen(); oeffneMenue('einstellungen'); } }, n)));
  w.append(ton, groesse);
  if (app.stand && app.stand.ort) {
    w.append(el('button.wahl', { onclick: () => { schliesseMenue(); zeigeTitel(); } }, el('span.zeiger', {}, '☞'), el('span', {}, 'Zum Titelblatt')));
  }
  w.append(el('button.wahl.gefahr', {
    onclick: () => {
      if (!confirm('Wirklich von vorn beginnen? Der jetzige Stand geht verloren (außer du hast einen Sicherungscode).')) return;
      localStorage.removeItem(SPEICHER); localStorage.removeItem(SPEICHER + '.vorher');
      app.stand = null; schliesseMenue(); zeigeTitel();
    },
  }, el('span.zeiger', {}, '✕'), el('span', {}, 'Von vorn beginnen')));
  w.append(el('p.klein', {}, `Fassung ${VERSION}. Verse: Dante Alighieri, Die Hölle, übersetzt von Philalethes (gemeinfrei). Alles andere: neu erzählt.`));
}

// --- Hinweise --------------------------------------------------------------
function zeigeHinweis(text, knopf = null) {
  const h = el('div.toast', { role: 'status' }, el('span', {}, text), knopf);
  document.body.append(h);
  setTimeout(() => h.classList.add('weg'), knopf ? 9000 : 4000);
  setTimeout(() => h.remove(), knopf ? 10000 : 5000);
}

// --- Service Worker ----------------------------------------------------------
function registriereSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const hatteController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    const pruefen = () => reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pruefen(); });
    setInterval(pruefen, 30 * 60 * 1000);
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hatteController) return; // erste Installation
    app.neueFassung = true;
    if (!app.stand || !app.stand.ort || $('.titelblatt')) { location.reload(); return; }
    zeigeHinweis('Eine neue Fassung ist da. Sie lädt beim nächsten Umblättern.');
  });
}

// --- Start -----------------------------------------------------------------
async function start() {
  ladeEinstellungen();
  aktualisiereTonKnopf();
  $('#menue-knopf').addEventListener('click', () => oeffneMenue());
  $('#ton-knopf').addEventListener('click', () => { app.einst.ton = !app.einst.ton; speichereEinstellungen(); starteTon(); });
  $('#schicht').addEventListener('click', ev => { if (ev.target.id === 'schicht') schliesseMenue(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') speichere(); else app.letzteAktivitaet = Date.now(); });
  registriereSW();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  try {
    app.werk = await ladeWerk(WERK_ID);
  } catch (e) {
    leereSeite().append(el('p', {}, 'Das Spiel konnte nicht geladen werden: ' + e.message));
    throw e;
  }
  app.stand = ladeStand();
  zeigeTitel();
  window.__inferno = { app, gehe, Z }; // für Tests
}

start();
