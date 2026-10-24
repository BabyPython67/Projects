/* BRÜCKENWÄRTER – Spiellogik für Browser und Node. Kennt keine Darstellung und keine Eingabe.
   Alles ist deterministisch: gleiche Startzahl (seed) und gleiche Zeitschritte ergeben dieselbe Schicht. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.Brueckenwaerter = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PLAYING = "läuft", WON = "gewonnen", LOST = "verloren";
  const ROAD = "strasse", WATER = "kanal";          // die beiden Verkehrswege
  const DOWN = "unten", UP = "oben", ANY = "egal";  // was eine Einheit von der Brücke braucht

  /* Verkehrsteilnehmer. speed und length sind Anteile der Streckenlänge (0 bis 1) bzw. davon pro Sekunde.
     patience: Sekunden Wartezeit, bis gehupt wird. strikes: wie viele Hupen eine Beschwerde zählt. */
  const KINDS = Object.freeze({
    auto:    Object.freeze({ lane: ROAD,  needs: DOWN, speed: 0.30,  length: 0.060, patience: 9,        points: 10, bonus: 5,  strikes: 1 }),
    rettung: Object.freeze({ lane: ROAD,  needs: DOWN, speed: 0.36,  length: 0.065, patience: 4,        points: 30, bonus: 10, strikes: 2 }),
    kahn:    Object.freeze({ lane: WATER, needs: ANY,  speed: 0.11,  length: 0.070, patience: Infinity, points: 15, bonus: 5,  strikes: 0 }),
    segler:  Object.freeze({ lane: WATER, needs: UP,   speed: 0.085, length: 0.100, patience: 12,       points: 40, bonus: 20, strikes: 1 }),
  });

  const DEFAULTS = Object.freeze({
    shift: 120,            // Sekunden je Schicht (6 bis 18 Uhr, 10 Sekunden je Stunde)
    startHour: 6,
    endHour: 18,
    strikesToLose: 3,      // so viele Hupen, und der Wärter ist seinen Posten los
    liftTime: 1.4,         // Sekunden für volles Heben oder Senken
    deck: 0.07,            // halbe Breite der Brückenzone auf jeder Strecke
    gap: 0.015,            // Mindestabstand zwischen zwei Einheiten
    roadGap: [3.2, 1.3],   // mittlerer Abstand zweier Ankünfte in Sekunden: Schichtbeginn, Schichtende
    waterGap: [11, 6],
    tallShare: [0.5, 0.8], // Anteil Segler unter den Booten: Schichtbeginn, Schichtende
    ambulanceShare: 0.18,  // Anteil Rettungswagen unter den Autos ...
    ambulanceFrom: 0.2,    // ... sobald dieser Teil der Schicht vorbei ist
    calmBonus: 50,         // beim Feierabend je nicht verbrauchter Hupe
    seed: undefined,       // undefined: zufällige Startzahl
    kinds: KINDS,
  });

  function makeConfig(overrides) {
    const c = Object.assign({}, DEFAULTS, overrides || {});
    const lerp = (pair, p) => pair[0] + (pair[1] - pair[0]) * p;
    c.meanGap = (lane, p) => lerp(lane === ROAD ? c.roadGap : c.waterGap, p);
    c.tallShareAt = (p) => lerp(c.tallShare, p);
    c.ambulanceShareAt = (p) => (p >= c.ambulanceFrom ? c.ambulanceShare : 0);
    return Object.freeze(c);
  }

  /* Kleiner, schneller Zufallsgenerator mit Startzahl (mulberry32). */
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

  function randomSeed() { return Math.floor(Math.random() * 1e9); }

  class Game {
    constructor(options) {
      this.config = makeConfig(options);
      this.rounds = 0;
      this.reset(this.config.seed);
    }

    /* Neue Schicht, ohne die Seite neu zu laden. Ohne Startzahl eine zufällige. */
    reset(seed) {
      this.seed = seed === undefined || seed === null ? randomSeed() : Number(seed) >>> 0;
      this.rng = mulberry32(this.seed);
      this.rounds += 1;
      this.time = 0;
      this.score = 0;
      this.strikes = 0;
      this.passed = 0;
      this.status = PLAYING;
      this.bridge = 0;        // 0 = unten (Autos fahren), 1 = oben (Segler fahren)
      this.held = false;      // Hebel gehalten?
      this.blocked = null;    // warum sich die Brücke gerade nicht bewegt: "auto", "schiff" oder null
      this.units = [];
      this.nextId = 1;
      this.spawnAt = {};
      this.spawnAt[ROAD] = 0.8;
      this.spawnAt[WATER] = 2.5;
      this.events = [];
    }

    get over() { return this.status !== PLAYING; }
    get progress() { return Math.min(1, this.time / this.config.shift); }
    get hour() { return this.config.startHour + this.progress * (this.config.endHour - this.config.startHour); }
    get clock() {
      const minutes = Math.round(this.hour * 60), h = Math.floor(minutes / 60), m = minutes % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    /* Verkehrsstufe 1 bis 5, wächst mit der Schicht. */
    get traffic() { return Math.min(5, 1 + Math.floor(this.progress * 5)); }
    get strikesLeft() { return Math.max(0, this.config.strikesToLose - this.strikes); }

    setHeld(held) { this.held = !!held; }

    /* Eine Einheit von Hand auf die Strecke setzen (für Tests und Vorführungen). */
    addUnit(kind, dir, s) {
      const k = this.config.kinds[kind];
      if (!k) throw new Error("unbekannte Einheit: " + kind);
      const unit = {
        id: this.nextId++, kind, lane: k.lane, dir: dir || 1, s: s || 0,
        patience: k.patience, waiting: false, everWaited: false, entered: false, passed: false,
        hue: Math.floor(this.rng() * 360),
      };
      this.units.push(unit);
      return unit;
    }

    kindOf(unit) { return this.config.kinds[unit.kind]; }
    front(unit) { return unit.s; }
    back(unit) { return unit.s - this.kindOf(unit).length; }
    /* Berührt die Einheit die Brückenzone? */
    onDeck(unit) {
      const d = this.config.deck;
      return this.front(unit) > 0.5 - d && this.back(unit) < 0.5 + d;
    }
    allowed(unit) {
      const needs = this.kindOf(unit).needs;
      if (needs === ANY) return true;
      return needs === DOWN ? this.bridge <= 0 : this.bridge >= 1;
    }

    /* Die Simulation um dt Sekunden weiterdrehen. Gibt die Ereignisse dieses Schritts zurück. */
    tick(dt) {
      if (this.over) return [];
      const c = this.config;
      const events = [];
      this.events = events;
      this.time += dt;

      this.spawn(ROAD, events);
      this.spawn(WATER, events);
      this.moveBridge(dt);
      this.moveUnits(dt, events);

      // Beschwerden: Geduld am Ende -> Hupe, Einheit dreht ab.
      for (const u of this.units.slice()) {
        if (u.patience > 0) continue;
        const k = this.kindOf(u);
        this.strikes += k.strikes;
        events.push({ type: "hupe", unit: snapshot(u, k), strikes: this.strikes });
        this.units.splice(this.units.indexOf(u), 1);
      }
      if (this.strikes >= c.strikesToLose) {
        this.status = LOST;
        this.held = false;
        events.push({ type: "verloren", score: this.score });
        return events;
      }
      if (this.time >= c.shift) {
        const bonus = c.calmBonus * this.strikesLeft;
        this.score += bonus;
        this.status = WON;
        this.held = false;
        events.push({ type: "gewonnen", score: this.score, bonus });
      }
      return events;
    }

    interval(lane) {
      return this.config.meanGap(lane, this.progress) * (0.5 + this.rng());
    }

    spawn(lane, events) {
      if (this.time < this.spawnAt[lane]) return;
      const c = this.config;
      // Platz an der Einfahrt? Sonst kurz später noch einmal versuchen.
      const entry = this.units.filter((u) => this.kindOf(u).lane === lane);
      const dirFree = (dir) => entry.every((u) => u.dir !== dir || this.back(u) > c.gap);
      const dirs = [1, -1].filter(dirFree);
      if (!dirs.length) { this.spawnAt[lane] = this.time + 0.3; return; }
      const dir = dirs[this.rng() < 0.5 ? 0 : dirs.length - 1];
      let kind;
      if (lane === WATER) kind = this.rng() < c.tallShareAt(this.progress) ? "segler" : "kahn";
      else kind = this.rng() < c.ambulanceShareAt(this.progress) ? "rettung" : "auto";
      const unit = this.addUnit(kind, dir, 0);
      this.spawnAt[lane] = this.time + this.interval(lane);
      events.push({ type: "ankunft", unit: snapshot(unit, c.kinds[kind]) });
    }

    moveBridge(dt) {
      const c = this.config;
      const carOnDeck = this.units.some((u) => this.kindOf(u).lane === ROAD && this.onDeck(u));
      const shipUnder = this.units.some((u) => this.kindOf(u).needs === UP && this.onDeck(u));
      this.blocked = null;
      if (this.held && this.bridge < 1) {
        if (carOnDeck) this.blocked = "auto";
        else this.bridge = Math.min(1, this.bridge + dt / c.liftTime);
      } else if (!this.held && this.bridge > 0) {
        if (shipUnder) this.blocked = "schiff";
        else this.bridge = Math.max(0, this.bridge - dt / c.liftTime);
      }
    }

    moveUnits(dt, events) {
      const c = this.config;
      const line = 0.5 - c.deck;  // Haltelinie vor der Brücke
      for (const lane of [ROAD, WATER]) {
        for (const dir of [1, -1]) {
          const queue = this.units.filter((u) => this.kindOf(u).lane === lane && u.dir === dir).sort((a, b) => b.s - a.s);
          let leader = null;
          for (const u of queue) {
            const k = this.kindOf(u);
            const wanted = k.speed * dt;
            let target = u.s + wanted;
            if (!u.entered) {
              if (this.allowed(u)) { if (target >= line) u.entered = true; }
              else target = Math.min(target, line);
            }
            if (leader) target = Math.min(target, this.back(leader) - c.gap);
            target = Math.max(target, u.s);
            const moved = target - u.s;
            u.s = target;
            u.waiting = moved < wanted * 0.5;
            if (u.waiting) { u.everWaited = true; u.patience -= dt; }
            if (!u.passed && this.back(u) > 0.5 + c.deck) {
              u.passed = true;
              const points = k.points + (u.everWaited ? 0 : k.bonus);
              this.score += points;
              this.passed += 1;
              events.push({ type: "passiert", unit: snapshot(u, k), points, bonus: !u.everWaited });
            }
            leader = u;
          }
        }
      }
      this.units = this.units.filter((u) => this.back(u) <= 1.05);
    }
  }

  function snapshot(u, k) {
    return { id: u.id, kind: u.kind, lane: u.lane, dir: u.dir, s: u.s, length: k.length, hue: u.hue };
  }

  /* Autopilot: hält den Hebel, wenn ein Segler kommt, lässt Rettungswagen und lange Autoschlangen vor. */
  function choose(game) {
    const c = game.config, line = 0.5 - c.deck;
    const seglerUnder = game.units.some((u) => u.kind === "segler" && game.onDeck(u));
    if (seglerUnder) return true;
    const rettungNah = game.units.some((u) => u.kind === "rettung" && !u.passed && u.s > line - 0.30);
    if (rettungNah) return false;
    const segler = game.units.filter((u) => u.kind === "segler" && !u.passed && u.s > line - 0.22);
    if (!segler.length) return false;
    const dringend = segler.some((u) => u.waiting && u.patience < 5);
    if (dringend) return true;
    const wartendeAutos = game.units.filter((u) => u.lane === ROAD && u.waiting);
    const ungeduldig = wartendeAutos.some((u) => u.patience < 2.5);
    if (wartendeAutos.length >= 4 && ungeduldig) return false;
    return true;
  }

  /* Eine ganze Schicht mit dem Autopiloten (oder einer eigenen Steuerung) durchrechnen. */
  function simulate(game, pilot, step) {
    const dt = step || 1 / 60, decide = pilot || choose;
    let guard = 0;
    while (!game.over && guard++ < 1e6) {
      game.setHeld(decide(game));
      game.tick(dt);
    }
    return game;
  }

  return { PLAYING, WON, LOST, ROAD, WATER, DOWN, UP, ANY, KINDS, DEFAULTS, makeConfig, mulberry32, Game, choose, simulate };
});
