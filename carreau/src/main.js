// Einstieg: Bildschirme, Spielmodi, Fortschritt.
import { Game } from './game.js';
import { Sound } from './audio.js';
import { load, save, exportCode, importCode, askPersist, isStandalone } from './storage.js';
import { VILLAGERS, villager } from './ai.js';
import { newMatch, startMene } from './rules.js';
import { FEATS, unlocked, recordMatch, featName, todayKey } from './career.js';
import { hashStr, mix } from './rng.js';
import { Terrain } from './terrain.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const TEST = params.has('test');
const test = TEST ? { speed: +(params.get('speed') || 4), hour: params.has('hour') ? +params.get('hour') : 15 } : { hour: params.has('hour') ? +params.get('hour') : undefined };
if (test.hour === undefined) delete test.hour;

let profile = load();
if (TEST && params.has('fresh')) profile = { ...load(), match: null };
const sound = new Sound();
sound.setEnabled(profile.settings.sound);
let selLen = profile.settings.short ? 7 : 13;
let duoLen = 13;
let lastSetup = null;

const game = new Game({
  canvas: $('cv'),
  sound,
  test,
  hooks: {
    save: (state) => {
      profile.match = state;
      save(profile);
    },
    matchEnd: (state) => onMatchEnd(state),
    tip: (text) => {
      $('tipText').textContent = text;
      $('scrTip').hidden = false;
    },
  },
});

function newSeed() {
  if (TEST) return (+(params.get('seed') || 7) + (profile.history.length * 7919)) >>> 0;
  return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
}

// ---------- Bildschirme ----------
function show(id) {
  for (const s of document.querySelectorAll('#screens .screen')) s.hidden = s.id !== id;
}
function hideAll() {
  for (const s of document.querySelectorAll('#screens .screen')) s.hidden = true;
}

function showcase() {
  // Ein ruhiges Bild des Tagesplatzes hinter dem Titel
  const key = todayKey();
  const seed = hashStr('carreau-' + key);
  const st = newMatch({ seed, mode: 'show', teams: [{ name: 'A' }, { name: 'B' }] });
  startMene(st);
  st.phase = 'play';
  const c = { x: 2, y: 8.2 };
  st.bodies = [
    { id: 'j', kind: 'jack', team: -1, x: c.x, y: c.y, alive: true },
    { id: 'b00', kind: 'boule', team: 0, x: c.x - 0.09, y: c.y - 0.11, alive: true },
    { id: 'b10', kind: 'boule', team: 1, x: c.x + 0.17, y: c.y + 0.05, alive: true },
    { id: 'b01', kind: 'boule', team: 0, x: c.x + 0.36, y: c.y - 0.42, alive: true },
    { id: 'b11', kind: 'boule', team: 1, x: c.x - 0.3, y: c.y + 0.31, alive: true },
  ];
  game.state = st;
  game.terrain = new Terrain(st.terrainSeed);
  game.r.buildTerrain(game.terrain);
  game.phase = 'idle';
  game.traces = [];
  game.measure = null;
  game.r.resize();
  game.r.setInsets(0, Math.round(window.innerHeight * 0.55));
  game.r.frame({ x0: c.x - 0.9, x1: c.x + 0.9, y0: c.y - 0.75, y1: c.y + 0.7 }, 0.35, { instant: true, maxS: 420 });
}

function refreshTitle() {
  game.stop();
  showcase();
  show('scrTitle');
  const m = profile.match;
  const resumable = m && m.phase !== 'matchEnd' && m.mode !== 'show';
  $('btnResume').hidden = !resumable;
  if (resumable) {
    const opp = m.mode === 'duo' ? `${m.teams[0].name} gegen ${m.teams[1].name}` : m.mode === 'practice' ? 'Übungsplatz' : `gegen ${m.teams[1].name}`;
    $('btnResume').innerHTML = `Weiterspielen<small>${opp}${m.mode === 'practice' ? '' : ` · ${m.score[0]} : ${m.score[1]}`}</small>`;
  }
  const d = dailySetup();
  const played = profile.daily[d.key];
  $('btnDaily').innerHTML = `Tagesplatz<small>${d.place} · gegen ${villager(d.opp).name} · bis 7${played ? ` · heute: ${played.score[0]}:${played.score[1]}` : ''}</small>`;
  const g = profile.games;
  $('titleInfo').textContent = g ? `Dorfwertung ${profile.rating} · ${profile.wins} von ${g} Partien gewonnen` : 'Ein Nachmittag in Saint-Aurel. Die Zikaden sind schon da.';
  $('btnSound').textContent = profile.settings.sound ? 'Ton an' : 'Ton aus';
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && !isStandalone()) {
    $('installHint').hidden = false;
    $('installHint').textContent = 'Tipp für iPad und iPhone: Teilen → „Zum Home-Bildschirm“. Dann löscht Safari deinen Fortschritt nie und Carreau läuft auch offline.';
  } else $('installHint').hidden = true;
}

function dailySetup() {
  const key = todayKey();
  const seed = hashStr('carreau-' + key);
  const opp = VILLAGERS[seed % VILLAGERS.length].id;
  const t = new Terrain(mix(seed, 1234));
  return { key, seed, opp, place: t.name };
}

// ---------- Partien starten ----------
function startMatch(setup) {
  lastSetup = setup;
  sound.unlock();
  let state;
  if (setup.mode === 'ai') {
    const v = villager(setup.opp);
    state = newMatch({ seed: newSeed(), mode: 'ai', target: setup.target, teams: [{ name: 'Du', human: true }, { name: v.name, profile: v.id }] });
  } else if (setup.mode === 'daily') {
    const d = dailySetup();
    const v = villager(d.opp);
    state = newMatch({ seed: d.seed, mode: 'daily', target: 7, teams: [{ name: 'Du', human: true }, { name: v.name, profile: v.id }] });
    state.daily = d.key;
  } else if (setup.mode === 'duo') {
    state = newMatch({ seed: newSeed(), mode: 'duo', target: setup.target, teams: [{ name: setup.a || 'Silber', human: true }, { name: setup.b || 'Bronze', human: true }] });
  } else {
    state = newMatch({ seed: newSeed(), mode: 'practice', target: 99, teams: [{ name: 'Du', human: true }, { name: '–' }] });
    state.jackThrower = 0;
    state.remaining = [99, 0];
  }
  profile.match = state;
  save(profile);
  hideAll();
  game.load(state, profile);
  if (state.mode === 'practice') state.remaining = [99, 0];
}

function resume() {
  sound.unlock();
  hideAll();
  game.load(profile.match, profile);
}

function onMatchEnd(state) {
  const out = state.mode === 'duo' ? { won: null, delta: 0, newFeats: [] } : recordMatch(profile, state, { date: state.daily });
  const before = new Set(lastUnlock);
  profile.match = null;
  save(profile);
  game.stop();
  showcase();
  const humanWon = state.winner === 0;
  if (state.mode === 'duo') {
    $('endTitle').textContent = `${state.teams[state.winner].name} gewinnt!`;
  } else {
    $('endTitle').textContent = humanWon ? 'Gewonnen!' : 'Verloren';
  }
  $('endScore').textContent = `${state.score[0]} : ${state.score[1]}`;
  let html = '';
  if (state.mode === 'ai' || state.mode === 'daily') {
    const sign = out.delta >= 0 ? '+' : '';
    html += `<p>Dorfwertung ${profile.rating} (${sign}${out.delta})</p>`;
    const st = state.stats;
    html += `<p class="hint">Aufnahmen ${state.mene} · Schüsse ${st.shotHits[0]}/${st.shots[0]} getroffen · Carreaux ${st.carreaux[0]} · Küsse ${st.kisses[0]}</p>`;
  }
  for (const f of out.newFeats) html += `<div class="newfeat">Neues Kunststück: <b>${featName(f)}</b></div>`;
  const now = unlocked(profile);
  for (const id of now) if (!before.has(id)) html += `<div class="newfeat">${villager(id).name}, ${villager(id).title}, fordert dich heraus.</div>`;
  lastUnlock = now;
  $('endBody').innerHTML = html;
  $('endShare').hidden = state.mode !== 'daily';
  $('endAgain').textContent = state.mode === 'daily' ? 'Nochmal (zählt nicht)' : 'Revanche';
  $('endOther').hidden = state.mode !== 'ai';
  show('scrEnd');
  sound.chime(humanWon || state.mode === 'duo' ? 'win' : 'bad');
  if (humanWon) sound.applause(1.4);
  lastEnd = state;
}
let lastEnd = null;
let lastUnlock = unlocked(profile);

function renderVillagers() {
  const open = new Set(unlocked(profile));
  $('villagers').innerHTML = VILLAGERS.map((v) => {
    const rec = profile.vs[v.id];
    const isOpen = open.has(v.id);
    const initial = v.name.replace('Opa ', '').replace('Madame ', '')[0];
    if (!isOpen) return `<div class="vcard locked"><div class="face" style="background:#9b8b72">?</div><div class="who"><b>Noch unbekannt</b><span>Gewinne gegen die Leute weiter oben, dann kommt jemand Neues auf den Platz.</span></div><div class="rec"></div></div>`;
    return `<button class="vcard" data-opp="${v.id}"><div class="face" style="background:${v.color}">${initial}</div><div class="who"><b>${v.name} <small style="font-weight:500;opacity:.75">${v.title}</small></b><span>${v.blurb}</span></div><div class="rec">Stärke ${v.rating}<br>${rec ? `${rec.w} : ${rec.l}` : 'neu'}</div></button>`;
  }).join('');
  for (const b of $('villagers').querySelectorAll('[data-opp]')) b.addEventListener('click', () => {
    sound.unlock();
    sound.select(1);
    startMatch({ mode: 'ai', opp: b.dataset.opp, target: selLen });
  });
  for (const b of document.querySelectorAll('[data-len]')) b.classList.toggle('on', +b.dataset.len === selLen);
}

function renderStats() {
  const p = profile;
  const st = p.stats;
  const rate = st.shots ? Math.round((100 * st.shotHits) / st.shots) : 0;
  let html = `<div class="stat"><span>Dorfwertung</span><b>${p.rating}</b><span>Partien (gewonnen)</span><b>${p.games} (${p.wins})</b><span>Würfe</span><b>${st.throws}</b><span>Schüsse getroffen</span><b>${st.shotHits}/${st.shots} (${rate} %)</b><span>Carreaux</span><b>${st.carreaux}</b><span>Küsse an der Sau</span><b>${st.kisses}</b><span>Tagesplätze gespielt</span><b>${Object.keys(p.daily).length}</b></div>`;
  html += '<h3>Gegen wen</h3><div class="stat">';
  for (const v of VILLAGERS) {
    const r = p.vs[v.id];
    if (r) html += `<span>${v.name}</span><b>${r.w} : ${r.l}</b>`;
  }
  html += '</div><h3>Kunststücke</h3>';
  for (const f of FEATS) {
    const got = p.feats[f.id];
    html += `<div class="feat ${got ? '' : 'off'}"><b>${f.name}</b><em>${got ? `${p.featCounts[f.id] || 1}×` : 'noch nicht'}</em><span>${f.text}</span></div>`;
  }
  $('statsBody').innerHTML = html;
}

// ---------- Knöpfe ----------
function on(id, fn) {
  $(id).addEventListener('click', (e) => {
    sound.unlock();
    sound.tap();
    fn(e);
  });
}
on('btnResume', resume);
on('btnVillage', () => {
  renderVillagers();
  show('scrSelect');
});
on('btnDaily', () => startMatch({ mode: 'daily' }));
on('btnDuo', () => {
  for (const b of document.querySelectorAll('[data-dlen]')) b.classList.toggle('on', +b.dataset.dlen === duoLen);
  show('scrDuo');
});
on('btnPractice', () => startMatch({ mode: 'practice' }));
on('btnHelp', () => show('scrHelp'));
on('btnStats', () => {
  renderStats();
  show('scrStats');
});
on('btnBackup', async () => {
  show('scrBackup');
  $('backupMsg').textContent = '';
  const ok = await askPersist();
  $('persistInfo').textContent = isStandalone()
    ? 'Carreau läuft als App vom Home-Bildschirm – der Speicher ist geschützt.'
    : ok ? 'Der Browser hat den Speicher als dauerhaft markiert.' : 'Der Browser garantiert den Speicher nicht dauerhaft – Home-Bildschirm oder Sicherungscode empfohlen.';
});
on('btnSound', () => {
  profile.settings.sound = !profile.settings.sound;
  sound.setEnabled(profile.settings.sound);
  save(profile);
  $('btnSound').textContent = profile.settings.sound ? 'Ton an' : 'Ton aus';
});
for (const b of document.querySelectorAll('[data-len]')) b.addEventListener('click', () => {
  selLen = +b.dataset.len;
  profile.settings.short = selLen === 7;
  save(profile);
  sound.select(0);
  renderVillagers();
});
for (const b of document.querySelectorAll('[data-dlen]')) b.addEventListener('click', () => {
  duoLen = +b.dataset.dlen;
  sound.select(0);
  for (const x of document.querySelectorAll('[data-dlen]')) x.classList.toggle('on', +x.dataset.dlen === duoLen);
});
on('duoGo', () => startMatch({ mode: 'duo', target: duoLen, a: $('duoA').value.trim() || 'Silber', b: $('duoB').value.trim() || 'Bronze' }));
for (const b of document.querySelectorAll('[data-back]')) b.addEventListener('click', () => {
  sound.tap();
  refreshTitle();
});
on('btnCopy', async () => {
  const code = exportCode(profile);
  $('codeBox').value = code;
  try {
    await navigator.clipboard.writeText(code);
    $('backupMsg').textContent = 'Kopiert. Leg den Code an einen sicheren Ort, z. B. in die Notizen.';
  } catch (e) {
    $('codeBox').select();
    $('backupMsg').textContent = 'Der Code steht im Feld – markieren und kopieren.';
  }
});
on('btnImport', () => {
  try {
    const p = importCode($('codeBox').value);
    profile = p;
    save(profile);
    lastUnlock = unlocked(profile);
    $('backupMsg').textContent = `Eingespielt: Dorfwertung ${p.rating}, ${p.games} Partien.`;
  } catch (e) {
    $('backupMsg').textContent = e.message;
  }
});
on('endAgain', () => {
  if (!lastSetup) return refreshTitle();
  startMatch(lastSetup.mode === 'daily' ? { mode: 'ai', opp: dailySetup().opp, target: 7 } : lastSetup);
});
on('endOther', () => {
  renderVillagers();
  show('scrSelect');
});
on('endHome', refreshTitle);
on('endShare', async () => {
  const s = lastEnd;
  if (!s) return;
  const d = dailySetup();
  const marks = s.history.map((h) => (h.team === 0 ? '🟢'.repeat(Math.min(3, h.points)) || '⚪' : h.team === 1 ? '🟤'.repeat(Math.min(3, h.points)) : '⚪')).join('');
  const text = `Carreau · Tagesplatz ${d.key}\n${d.place} gegen ${villager(d.opp).name}\n${s.score[0]} : ${s.score[1]} ${s.winner === 0 ? '✓' : ''}\n${marks}`;
  try {
    await navigator.clipboard.writeText(text);
    $('endShare').textContent = 'Kopiert!';
  } catch (e) {
    $('endShare').textContent = 'Kopieren nicht erlaubt';
  }
});
on('btnMenu', () => {
  $('pSound').textContent = profile.settings.sound ? 'Ton an' : 'Ton aus';
  $('pGiveUp').hidden = !game.state || game.state.mode === 'practice';
  show('scrPause');
});
on('pResume', hideAll);
on('pHelp', () => show('scrHelp'));
on('pSound', () => {
  profile.settings.sound = !profile.settings.sound;
  sound.setEnabled(profile.settings.sound);
  save(profile);
  $('pSound').textContent = profile.settings.sound ? 'Ton an' : 'Ton aus';
});
on('pHome', refreshTitle);
on('pGiveUp', () => {
  const s = game.state;
  if (!s) return refreshTitle();
  s.score[1] = Math.max(s.score[1], s.target);
  s.winner = 1;
  s.phase = 'matchEnd';
  game.stop();
  onMatchEnd(s);
});
on('tipOk', () => ($('scrTip').hidden = true));

// Hilfe öffnet im Spiel als Overlay; „zurück“ führt dann ins Spiel
for (const b of document.querySelectorAll('#scrHelp [data-back]')) b.addEventListener('click', (e) => {
  if (game.state && game.state.mode !== 'show' && !$('hud').hidden) {
    e.stopImmediatePropagation();
    hideAll();
  }
}, true);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) save(profile);
});
window.addEventListener('pagehide', () => save(profile));
document.addEventListener('gesturestart', (e) => e.preventDefault());

if ('serviceWorker' in navigator && !TEST && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

if (TEST) window.__carreau = { game, get profile() { return profile; }, startMatch };
refreshTitle();
