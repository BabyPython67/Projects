// Fortschritt: Dorfwertung (Elo), wer schon herausgefordert werden kann, Kunststücke, Statistik.
import { VILLAGERS } from './ai.js';

export const FEATS = [
  { id: 'kuss', name: 'Bise', text: 'Eine gelegte Kugel küsst die Sau – sie berührt sie.' },
  { id: 'carreau', name: 'Carreau', text: 'Schuss auf eine gegnerische Kugel: sie fliegt weg, deine bleibt an ihrer Stelle liegen.' },
  { id: 'carreau-sur-place', name: 'Carreau sur place', text: 'Ein Carreau, bei dem deine Kugel keine 5 cm vom Platz der alten liegen bleibt.' },
  { id: 'plombee', name: 'Plombée', text: 'Hoher Wurf, der keine 2,5 cm von der Sau entfernt liegen bleibt.' },
  { id: 'doppelschlag', name: 'Doppelschlag', text: 'Ein Wurf räumt zwei gegnerische Kugeln aus dem Spiel.' },
  { id: 'sau-getroffen', name: 'Auf die Sau', text: 'Ein Schuss trifft die Sau direkt aus der Luft.' },
  { id: 'sau-aus', name: 'Sau ins Aus', text: 'Die Sau fliegt ins Aus, als nur du noch Kugeln hattest – jede zählt einen Punkt.' },
  { id: 'mene3', name: 'Volle Aufnahme', text: 'Drei Punkte in einer Aufnahme: alle deine Kugeln liegen besser.' },
  { id: 'knapp', name: 'Auf Messers Schneide', text: 'Eine Partie mit einem einzigen Punkt Vorsprung gewinnen.' },
  { id: 'remontada', name: 'Remontada', text: 'Gewinnen, obwohl du schon 7 Punkte hinten lagst.' },
  { id: 'fanny', name: 'Fanny', text: 'Zu Null gewinnen. In der Provence muss der Verlierer jetzt die Fanny küssen.' },
  { id: 'scharfschuetze', name: 'Scharfschütze', text: 'Fünf Schuss-Treffer in einer Partie.' },
  { id: 'dorf', name: 'Ganz Saint-Aurel', text: 'Jeden Menschen aus dem Dorf mindestens einmal geschlagen.' },
  { id: 'stammgast', name: 'Stammgast', text: 'An sieben verschiedenen Tagen den Tagesplatz gespielt.' },
];

export function defaultProfile() {
  return {
    v: 1,
    created: new Date().toISOString(),
    rating: 900,
    games: 0,
    wins: 0,
    vs: {},
    feats: {},
    featCounts: {},
    stats: { throws: 0, carreaux: 0, kisses: 0, shots: 0, shotHits: 0, points: 0, menes: 0 },
    settings: { sound: true, short: false, hints: true },
    daily: {},
    tipsSeen: {},
    history: [],
    match: null,
  };
}

export function unlocked(profile) {
  let top = -1;
  VILLAGERS.forEach((v, i) => {
    if (profile.vs[v.id] && profile.vs[v.id].w > 0) top = Math.max(top, i);
  });
  const n = Math.max(2, top + 3);
  return VILLAGERS.slice(0, Math.min(VILLAGERS.length, n)).map((v) => v.id);
}

export function expected(r, ro) {
  return 1 / (1 + Math.pow(10, (ro - r) / 400));
}

// Ergebnis einer Partie in das Profil schreiben, neue Kunststücke zurückgeben
export function recordMatch(profile, state, opts = {}) {
  const human = 0;
  const won = state.winner === human;
  const newFeats = [];
  const gain = (id) => {
    profile.featCounts[id] = (profile.featCounts[id] || 0) + 1;
    if (!profile.feats[id]) {
      profile.feats[id] = new Date().toISOString();
      newFeats.push(id);
    }
  };
  const st = profile.stats;
  st.throws += state.stats.throws[human];
  st.carreaux += state.stats.carreaux[human];
  st.kisses += state.stats.kisses[human];
  st.shots += state.stats.shots[human];
  st.shotHits += state.stats.shotHits[human];
  st.points += state.score[human];
  st.menes += state.mene;
  let delta = 0;
  if (state.mode === 'ai' || state.mode === 'daily') {
    profile.games++;
    if (won) profile.wins++;
    const opp = state.teams[1].profile;
    const rec = (profile.vs[opp] = profile.vs[opp] || { w: 0, l: 0, best: null });
    if (won) rec.w++;
    else rec.l++;
    const v = VILLAGERS.find((x) => x.id === opp);
    if (v) {
      const k = state.target >= 13 ? 32 : 20;
      delta = Math.round(k * ((won ? 1 : 0) - expected(profile.rating, v.rating)));
      profile.rating += delta;
    }
    if (won) {
      const margin = state.score[0] - state.score[1];
      if (margin === 1) gain('knapp');
      if (state.score[1] === 0) gain('fanny');
      let worst = 0, a = 0, b = 0;
      for (const h of state.history) {
        if (h.team === 0) a += h.points;
        if (h.team === 1) b += h.points;
        worst = Math.min(worst, a - b);
      }
      if (worst <= -7) gain('remontada');
      if (VILLAGERS.every((x) => profile.vs[x.id] && profile.vs[x.id].w > 0)) gain('dorf');
    }
  }
  if (state.mode === 'daily' && opts.date) {
    profile.daily[opts.date] = { score: state.score.slice(), won, opp: state.teams[1].profile };
    if (Object.keys(profile.daily).length >= 7) gain('stammgast');
  }
  if (state.history.some((h) => h.team === 0 && h.points >= 3)) gain('mene3');
  if (state.stats.shotHits[human] >= 5) gain('scharfschuetze');
  for (const f of state.feats) if (f.team === human && FEATS.some((x) => x.id === f.id)) gain(f.id);
  profile.history.unshift({ date: new Date().toISOString(), mode: state.mode, opp: state.teams[1].profile, score: state.score.slice(), won });
  profile.history = profile.history.slice(0, 60);
  return { won, delta, newFeats };
}

export function featName(id) {
  return (FEATS.find((f) => f.id === id) || { name: id }).name;
}

export function todayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
