/* DEICHGRAF – Spiellogik für Browser und Node. Spiegelt deich/engine.py Regel für Regel. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.Deichgraf = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PLAYING = "läuft", WON = "gewonnen", LOST = "verloren";
  const LEFT = "a", RIGHT = "d", BUILD = "s", WAIT = "w", NEW = "n";
  const KEYS = [LEFT, RIGHT, BUILD, WAIT, NEW];

  const DEFAULTS = Object.freeze({
    length: 8,          // Deichabschnitte
    nights: 7,          // Nächte der Sturmwoche
    hours: 6,           // Stunden pro Nacht
    actions: 7,         // Aktionen pro Stunde
    houses: 3,          // Häuser im Dorf ("Leben")
    maxHeight: 12,      // höher lässt sich nicht stapeln
    startMin: 5,        // Anfangshöhe der Abschnitte (von ... bis)
    startMax: 7,
    ebb: 1,             // Pegel bei Ebbe, zu Beginn jeder Nacht
    bonusDryNight: 25,  // mal Nachtnummer, wenn kein Abschnitt brach
    bonusHouse: 100,    // je gerettetem Haus beim Sieg
    peakBase: 4,        // Höchstpegel = peakBase + Nachtnummer
    wavesEvery: 3,      // alle so viele Nächte ein Brecher mehr pro Stunde
    maxWaves: 3,        // höchstens so viele Brecher pro Stunde
  });

  function makeConfig(overrides) {
    const c = Object.assign({}, DEFAULTS, overrides || {});
    c.peak = (night) => c.peakBase + night;
    c.tide = (night) => {
      const crest = Math.floor(c.hours / 2), p = c.peak(night), out = [];
      for (let h = 0; h < c.hours; h++) out.push(Math.max(c.ebb, p - Math.abs(h - crest)));
      return out;
    };
    c.wavesPerHour = (night) => Math.min(c.maxWaves, 1 + Math.floor((night - 1) / c.wavesEvery));
    return Object.freeze(c);
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class Rng {
    constructor(seed) { this.next = mulberry32(seed); }
    int(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); }
    sample(n, k) {
      const arr = Array.from({ length: n }, (_, i) => i);
      for (let i = 0; i < k; i++) {
        const j = i + Math.floor(this.next() * (n - i));
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr.slice(0, k);
    }
  }

  /* [2, 5, 7] -> "3, 6 und 8" (Abschnitte werden ab 1 gezählt) */
  function liste(nummern) {
    const namen = nummern.map((i) => String(i + 1));
    if (namen.length <= 1) return namen.join("");
    return namen.slice(0, -1).join(", ") + " und " + namen[namen.length - 1];
  }

  class Game {
    constructor(seed, config) {
      this.config = config || makeConfig();
      if (seed === undefined || seed === null || Number.isNaN(seed)) seed = Math.floor(Math.random() * 4294967296);
      this.seed = seed >>> 0;
      this.rng = new Rng(this.seed);
      this.events = [];
      this._new = [];
      this.newGame();
    }

    /* Neustart ohne Neuladen: alles zurück auf Nacht 1. */
    newGame() {
      const c = this.config;
      this.phase = PLAYING;
      this.score = 0;
      this.houses = c.houses;
      this.night = 0;
      this.heights = Array.from({ length: c.length }, () => this.rng.int(c.startMin, c.startMax));
      this.pos = Math.floor(c.length / 2);
      this.events = [];
      this._log("Ein neues Spiel beginnt. Halte den Deich die ganze Sturmwoche.");
      this._startNight();
    }

    _startNight() {
      const c = this.config;
      this.night += 1;
      this.hour = 1;
      this.actionsLeft = c.actions;
      this.pegel = c.ebb;
      this.tide = c.tide(this.night);
      const n = c.wavesPerHour(this.night);
      this.waves = Array.from({ length: c.hours }, () => this.rng.sample(c.length, n).sort((a, b) => a - b));
      this.dryNight = true;
      this._log(`Nacht ${this.night} bricht an. Höchstpegel heute: ${Math.max(...this.tide)}.`);
    }

    _log(text) {
      this.events.push(text);
      this._new.push(text);
      if (this.events.length > 50) this.events.splice(0, this.events.length - 50);
    }

    get over() { return this.phase !== PLAYING; }
    /* Pegel, der am Ende der laufenden Stunde erreicht wird. */
    get nextPegel() { return this.tide[this.hour - 1]; }
    /* Abschnitte (0-basiert), die am Ende der laufenden Stunde getroffen werden. */
    get nextWaves() { return this.waves[this.hour - 1]; }

    /* Wie viele Sandsäcke fehlen, damit der Abschnitt den nächsten Pegel hält. */
    deficit(index) {
      const expected = this.heights[index] - (this.nextWaves.includes(index) ? 1 : 0);
      return Math.max(0, this.nextPegel - expected);
    }

    /* Eine Taste verarbeiten. Gibt die neuen Ereignismeldungen zurück. */
    step(key) {
      this._new = [];
      if (key === NEW) { this.newGame(); return this._new; }
      if (this.over) return this._new;
      if (key === LEFT) this._move(-1);
      else if (key === RIGHT) this._move(+1);
      else if (key === BUILD) this._build();
      else if (key === WAIT) { this.actionsLeft = 0; this._log("Du wartest das Ende der Stunde ab."); }
      else return this._new;
      if (this.actionsLeft <= 0) this._endHour();
      return this._new;
    }

    _move(delta) {
      const next = this.pos + delta;
      if (next < 0 || next >= this.config.length) { this._log("Hier endet der Deich."); return; }
      this.pos = next;
      this.actionsLeft -= 1;
    }

    _build() {
      const h = this.heights[this.pos];
      if (h >= this.config.maxHeight) {
        this._log(`Abschnitt ${this.pos + 1} ist schon ${h} hoch – höher geht es nicht.`);
        return;
      }
      this.heights[this.pos] = h + 1;
      this.actionsLeft -= 1;
      this._log(`Sandsack auf Abschnitt ${this.pos + 1}: jetzt ${h + 1} hoch.`);
    }

    _endHour() {
      const c = this.config;
      for (const i of this.nextWaves) {
        if (this.heights[i] > 0) {
          this.heights[i] -= 1;
          this._log(`Brecher trifft Abschnitt ${i + 1}: nur noch ${this.heights[i]} hoch.`);
        }
      }
      this.pegel = this.nextPegel;
      this._log(`Der Pegel steht jetzt bei ${this.pegel}.`);

      const broken = [];
      this.heights.forEach((h, i) => { if (h < this.pegel) broken.push(i); });
      if (broken.length) {
        this.houses -= 1;
        this.dryNight = false;
        this._log(`DEICHBRUCH bei Abschnitt ${liste(broken)}! Ein Haus ist verloren (${this.houses} übrig).`);
        if (this.houses <= 0) {
          this.phase = LOST;
          this._log(`Das Dorf steht unter Wasser. Verloren in Nacht ${this.night} mit ${this.score} Punkten.`);
          return;
        }
      } else {
        const gained = this.pegel * this.night;
        this.score += gained;
        this._log(`Der Deich hält. +${gained} Punkte.`);
      }

      if (this.hour < c.hours) {
        this.hour += 1;
        this.actionsLeft = c.actions;
        return;
      }
      if (this.dryNight) {
        const bonus = c.bonusDryNight * this.night;
        this.score += bonus;
        this._log(`Trockene Nacht! +${bonus} Punkte Bonus.`);
      }
      if (this.night >= c.nights) {
        const bonus = c.bonusHouse * this.houses;
        this.score += bonus;
        this.phase = WON;
        this._log(`Die Sturmwoche ist überstanden! +${bonus} Punkte für gerettete Häuser. Endstand: ${this.score} Punkte.`);
        return;
      }
      this._startNight();
    }
  }

  /* ---- Autopilot: flickt zuerst Gefährdetes, baut dann für den Höchstpegel vor. ---- */
  function nearest(game, candidates) {
    if (!candidates.length) return null;
    return candidates.reduce((best, i) => {
      const d = Math.abs(i - game.pos), bd = Math.abs(best - game.pos);
      return d < bd || (d === bd && i < best) ? i : best;
    });
  }

  function choose(game) {
    if (game.over) return NEW;
    const c = game.config;
    const exp = game.heights.slice();
    for (const i of game.nextWaves) exp[i] = Math.max(0, exp[i] - 1);
    const buildable = [];
    for (let i = 0; i < c.length; i++) if (game.heights[i] < c.maxHeight) buildable.push(i);
    if (!buildable.length) return WAIT;

    const urgent = buildable.filter((i) => exp[i] < game.nextPegel);
    const reachable = urgent.filter((i) => Math.abs(i - game.pos) + (game.nextPegel - exp[i]) <= game.actionsLeft);
    let target = nearest(game, reachable);
    if (target === null) target = nearest(game, urgent);
    if (target === null) {
      const peakRest = Math.max(...game.tide.slice(game.hour - 1));
      target = nearest(game, buildable.filter((i) => exp[i] < peakRest));
    }
    if (target === null) {
      const lowest = Math.min(...buildable.map((i) => exp[i]));
      target = nearest(game, buildable.filter((i) => exp[i] === lowest));
    }
    if (target === game.pos) return BUILD;
    return target < game.pos ? LEFT : RIGHT;
  }

  function play(game, maxSteps) {
    const keys = [];
    const limit = maxSteps || 100000;
    while (!game.over && keys.length < limit) {
      const key = choose(game);
      keys.push(key);
      game.step(key);
    }
    return keys;
  }

  return { PLAYING, WON, LOST, LEFT, RIGHT, BUILD, WAIT, NEW, KEYS, DEFAULTS, makeConfig, Game, choose, play, liste };
});
