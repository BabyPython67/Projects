// Ganze Partien ohne Grafik: für Tests, Bot-Messung und zum Abstimmen der Gegner.
import { newMatch, startMene, makeTerrain, nextThrower, throwHeadless, placeJack } from './rules.js';
import { decide, execute, randomDecide, aiRng } from './ai.js';

// players[i]: { profile } für eine KI oder { random: true } für den Zufallsspieler
export function playMatch({ seed, players, target = 13, maxThrows = 400, onThrow }) {
  const state = newMatch({ seed, target, teams: players.map((p, i) => ({ name: `P${i}`, profile: p.profile?.id })) });
  const terrain = makeTerrain(state);
  startMene(state);
  let throws = 0;
  while (state.phase !== 'matchEnd' && throws < maxThrows) {
    if (state.phase === 'meneEnd') startMene(state);
    const team = nextThrower(state);
    const p = players[team];
    const rng = aiRng(state, team);
    const dec = p.random ? randomDecide(state, terrain, team, rng) : decide(state, terrain, team, p.profile, rng);
    if (dec.place) {
      if (!placeJack(state, terrain, dec.target.x, dec.target.y)) {
        placeJack(state, terrain, state.circle.x, state.circle.y + state.dir * 7);
      }
      continue;
    }
    const land = p.random ? dec.target : execute(state, dec, p.profile, rng);
    const res = throwHeadless(state, terrain, team, dec.shotKey, land);
    if (onThrow) onThrow(state, team, dec, res);
    throws++;
  }
  return { score: state.score, winner: state.winner, menes: state.mene, throws, state };
}
