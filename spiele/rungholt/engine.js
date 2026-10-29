/* RUNGHOLT – Spiellogik. Kennt weder Bildschirm noch Eingabe noch Ton; läuft in Node (Tests) und im Browser.
   Alles Zufällige kommt aus einer Startzahl, dadurch ist jede Nacht wiederholbar (?seed=…) und testbar. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Rungholt = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- Zufall ---------- */
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashSeed(str) {
    let h = 2166136261;
    for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  function shuffle(rng, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ---------- Gegenstände ----------
     rule: welcher Würfel passt. any | even | odd | min n | max n | count n (sammelt Augen bis n, dann zündet es) | passive
     effect: hit (Schlag), shield (Schutz), heal (Mut), stun (Gegner setzt aus), weaken (Gegner schlägt schwächer),
             reroll (Würfel neu werfen), split (Würfel teilen), plus (Würfel +1).
     value: "die" = Augenzahl, "inv" = 7 minus Augenzahl, Zahl = fest. add kommt dazu. uses = Einsätze je Runde. */
  const GEAR = {
    laterne:    { name: "Laterne", rule: { kind: "any" }, effect: { kind: "hit", value: "die", add: 0 }, uses: 1, value: 5,
                  flavor: "Licht vertreibt, was im Nebel wohnt.", plus: { effect: { kind: "hit", value: "die", add: 2 } } },
    stab:       { name: "Wanderstab", rule: { kind: "any" }, effect: { kind: "shield", value: "die", add: 0 }, uses: 1, value: 4,
                  flavor: "Aus Eschenholz, vom Großvater.", plus: { effect: { kind: "shield", value: "die", add: 2 } } },
    flasche:    { name: "Fläschchen Rum", rule: { kind: "max", n: 3 }, effect: { kind: "heal", value: "die", add: 1 }, uses: 1, value: 3,
                  flavor: "Wärmt. Hilft nur in kleinen Schlucken.", plus: { effect: { kind: "heal", value: "die", add: 3 } } },
    spiegel:    { name: "Handspiegel", rule: { kind: "any" }, effect: { kind: "hit", value: "inv", add: 0 }, uses: 1, value: 4,
                  flavor: "Zeigt den Schatten, was sie sind.", plus: { effect: { kind: "hit", value: "inv", add: 2 } } },
    schleuder:  { name: "Steinschleuder", rule: { kind: "odd" }, effect: { kind: "hit", value: "die", add: 2 }, uses: 1, value: 5,
                  flavor: "Kiesel vom Deichfuß.", plus: { effect: { kind: "hit", value: "die", add: 4 } } },
    fackel:     { name: "Teerfackel", rule: { kind: "even" }, effect: { kind: "hit", value: "die", add: 2 }, uses: 1, value: 5,
                  flavor: "Brennt auch im Wind.", plus: { effect: { kind: "hit", value: "die", add: 4 } } },
    netz:       { name: "Fischernetz", rule: { kind: "count", n: 7 }, effect: { kind: "weaken", value: 2, add: 0 }, uses: 9, value: 3,
                  flavor: "Was drin hängt, schlägt nicht mehr so hart.", plus: { rule: { kind: "count", n: 5 } } },
    seil:       { name: "Tau", rule: { kind: "count", n: 6 }, effect: { kind: "shield", value: 6, add: 0 }, uses: 9, value: 4,
                  flavor: "Ein Stück Festmacher, salzig und steif.", plus: { effect: { kind: "shield", value: 9, add: 0 } } },
    bernstein:  { name: "Bernstein", rule: { kind: "max", n: 2 }, effect: { kind: "heal", value: 3, add: 0 }, uses: 1, value: 3,
                  flavor: "Warm in der Hand, wie ein kleines Herz.", plus: { effect: { kind: "heal", value: 5, add: 0 } } },
    kompass:    { name: "Kompass", rule: { kind: "any" }, effect: { kind: "reroll" }, uses: 1, value: 3,
                  flavor: "Die Nadel zittert, aber sie lügt nicht.", plus: { uses: 2 } },
    horn:       { name: "Muschelhorn", rule: { kind: "any" }, effect: { kind: "hit", value: 4, add: 0 }, uses: 1, value: 4,
                  flavor: "Ein Ton, den das Watt kennt.", plus: { effect: { kind: "hit", value: 6, add: 0 } } },
    schild:     { name: "Treibholzschild", rule: { kind: "min", n: 4 }, effect: { kind: "shield", value: "die", add: 3 }, uses: 1, value: 4,
                  flavor: "Planke eines Schiffs, das keinen Namen mehr hat.", plus: { effect: { kind: "shield", value: "die", add: 5 } } },
    messer:     { name: "Fischmesser", rule: { kind: "min", n: 2 }, effect: { kind: "split" }, uses: 1, value: 4,
                  flavor: "Teilt, was zu groß ist.", plus: { uses: 2 } },
    korb:       { name: "Krabbenkorb", rule: { kind: "count", n: 9 }, effect: { kind: "heal", value: 6, add: 0 }, uses: 9, value: 3,
                  flavor: "Nach jedem Zug ein bisschen voller.", plus: { rule: { kind: "count", n: 7 } } },
    stiefel:    { name: "Schlickstiefel", rule: { kind: "passive" }, passive: "shieldStart", amount: 2, value: 4,
                  flavor: "Stehen fest, wo alles rutscht.", plus: { amount: 3 } },
    harpune:    { name: "Harpune", rule: { kind: "min", n: 5 }, effect: { kind: "hit", value: "die", add: 0, mult: 2 }, uses: 1, value: 6,
                  flavor: "Für die großen Schatten.", plus: { effect: { kind: "hit", value: "die", add: 2, mult: 2 } } },
    nebelhorn:  { name: "Nebelhorn", rule: { kind: "count", n: 8 }, effect: { kind: "stun" }, uses: 9, value: 5,
                  flavor: "Danach ist es einen Atemzug lang still.", plus: { rule: { kind: "count", n: 6 } } },
    glocke:     { name: "Kleine Glocke", rule: { kind: "min", n: 6 }, effect: { kind: "stun" }, uses: 1, value: 6,
                  flavor: "Aus Rungholter Bronze, sagt der Krämer.", plus: { rule: { kind: "min", n: 5 } } },
    sternkarte: { name: "Sternkarte", rule: { kind: "passive" }, passive: "extraDie", amount: 1, value: 8,
                  flavor: "Wer die Sterne liest, hat eine Hand mehr frei.", plus: { amount: 2 } },
    leuchtfeuer:{ name: "Leuchtfeuer", rule: { kind: "count", n: 12 }, effect: { kind: "hit", value: 16, add: 0 }, uses: 9, value: 6,
                  flavor: "Sammle Funken, bis es brennt.", plus: { effect: { kind: "hit", value: 22, add: 0 } } },
    ring:       { name: "Rettungsring", rule: { kind: "passive" }, passive: "lifeline", amount: 1, value: 5,
                  flavor: "Einmal hält er dich.", plus: { amount: 2 } },
    docht:      { name: "Dochtschere", rule: { kind: "max", n: 5 }, effect: { kind: "plus" }, uses: 2, value: 3,
                  flavor: "Ein Schnitt, und die Flamme steht höher.", plus: { uses: 3 } },
  };
  const BASE_GEAR = ["laterne", "stab", "flasche", "spiegel", "schleuder", "fackel", "netz", "seil", "bernstein", "kompass", "horn", "schild", "docht"];
  const UNLOCKS = [
    { id: "priele", when: (s) => s.stretch >= 2, gear: ["messer", "korb", "stiefel"], text: "Du hast die Priele erreicht: Fischmesser, Krabbenkorb und Schlickstiefel liegen ab jetzt am Weg." },
    { id: "rungholt", when: (s) => s.stretch >= 3, gear: ["harpune", "nebelhorn", "glocke"], kit: "fischer", text: "Du hast Rungholt gesehen: Harpune, Nebelhorn und Glocke sind frei, und der Fischer geht mit dir." },
    { id: "sieg", when: (s) => s.won, gear: ["sternkarte", "leuchtfeuer", "ring"], kit: "gloeckner", text: "Die Glocke hat geläutet: Sternkarte, Leuchtfeuer und Rettungsring sind frei, der Glöckner auch, und die Springflut wartet." },
  ];

  /* ---------- Wer du bist ---------- */
  const KITS = {
    wattlaeuferin: { name: "Wattläuferin", mut: 30, dice: 3, gear: ["laterne", "stab", "flasche"], text: "Kennt jeden Priel. Laterne, Wanderstab und ein Fläschchen Rum." },
    fischer:       { name: "Fischer", mut: 34, dice: 3, gear: ["laterne", "netz", "seil"], text: "Zäh und geduldig. Laterne, Fischernetz und ein Stück Tau: schwächen, aushalten, zuschlagen." },
    gloeckner:     { name: "Glöckner", mut: 26, dice: 3, gear: ["glocke", "horn", "stab"], text: "Wenig Mut, aber die Glocke. Schlag sie, und die Schatten halten den Atem an." },
  };

  /* ---------- Gegner ---------- */
  const ENEMIES = {
    irrlicht:    { name: "Irrlicht", hp: 14, stretch: 1, moves: [[{ kind: "hit", n: 4 }], [{ kind: "hit", n: 3 }], [{ kind: "hit", n: 5 }]], text: "Tanzt über dem Schlick, wo kein Boden ist." },
    kriecher:    { name: "Schlickkriecher", hp: 18, stretch: 1, moves: [[{ kind: "hit", n: 5 }], [{ kind: "shield", n: 3 }], [{ kind: "hit", n: 6 }]], text: "Hat keine Augen. Braucht keine." },
    moewen:      { name: "Möwenschwarm", hp: 15, stretch: 1, moves: [[{ kind: "hit", n: 3, times: 2 }], [{ kind: "hit", n: 4 }], [{ kind: "hit", n: 3, times: 2 }]], text: "Weiß, wer hier nicht hingehört." },
    grauermann:  { name: "Der Graue Mann", hp: 36, stretch: 1, guardian: true, moves: [[{ kind: "hit", n: 6 }], [{ kind: "fog" }, { kind: "hit", n: 4 }], [{ kind: "hit", n: 8 }]], text: "Steht am Rand des Lichts. Immer nur einen Schritt dahinter." },
    ertrunkener: { name: "Ertrunkener", hp: 24, stretch: 2, moves: [[{ kind: "hit", n: 6 }], [{ kind: "hit", n: 6 }], [{ kind: "fog" }]], text: "Seine Taschen sind voll Sand." },
    nebelweib:   { name: "Nebelweib", hp: 21, stretch: 2, moves: [[{ kind: "hit", n: 4 }], [{ kind: "fog" }], [{ kind: "hit", n: 8 }]], text: "Singt, und die Laterne wird kleiner." },
    klabauter:   { name: "Klabautermann", hp: 27, stretch: 2, moves: [[{ kind: "shield", n: 5 }], [{ kind: "hit", n: 8 }], [{ kind: "hit", n: 5 }]], text: "Hämmert an Planken, die es nicht mehr gibt." },
    gloecknerin: { name: "Die Glöcknerin", hp: 48, stretch: 2, guardian: true, moves: [[{ kind: "hit", n: 7 }], [{ kind: "shield", n: 4 }, { kind: "hit", n: 5 }], [{ kind: "hit", n: 10 }]], text: "Sie läutet seit sechshundert Jahren. Niemand kommt." },
    buerger:     { name: "Schattenbürger", hp: 30, stretch: 3, moves: [[{ kind: "hit", n: 6 }], [{ kind: "hit", n: 8 }], [{ kind: "hit", n: 6 }]], text: "Zählt Münzen, die zu Muscheln geworden sind." },
    ratten:      { name: "Ratten von Rungholt", hp: 23, stretch: 3, moves: [[{ kind: "hit", n: 4, times: 2 }], [{ kind: "hit", n: 4, times: 2 }], [{ kind: "hit", n: 4, times: 3 }]], text: "Sie waren die Ersten, die gingen. Und die Ersten, die zurückkamen." },
    pfarrer:     { name: "Der Pfarrer", hp: 36, stretch: 3, moves: [[{ kind: "hit", n: 5 }], [{ kind: "heal", n: 6 }], [{ kind: "hit", n: 9 }]], text: "Er hat das Schwein gesegnet. Er bereut es jede Nacht." },
    blankehans:  { name: "Blanke Hans", hp: 75, stretch: 3, guardian: true, final: true, escalate: 2,
                   moves: [[{ kind: "hit", n: 8 }], [{ kind: "hit", n: 5 }, { kind: "fog" }], [{ kind: "hit", n: 11 }], [{ kind: "shield", n: 6 }]], text: "Das Meer selbst. Es hat die Stadt geholt, und es will sie behalten." },
  };

  /* ---------- Ereignisse (Entscheidungen ohne Kampf) ---------- */
  const EVENTS = {
    wrack: { title: "Das Wrack", stretch: [1, 2], text: "Ein Ewer liegt halb im Schlick, der Mast zeigt nach Rungholt. In der Kajüte könnte noch etwas liegen. Aber das Wasser gluckert schon unter den Planken.",
      choices: [
        { label: "Durchsuchen (Flut +1, ein Gegenstand)", tide: 1, reward: "random", bot: 2 },
        { label: "Eine Planke mitnehmen (Mut −3, ein Gegenstand wird besser)", mut: -3, upgrade: true, bot: 1 },
        { label: "Weitergehen", bot: 0 }] },
    seehund: { title: "Der Seehund", stretch: [1, 2], text: "Ein Seehund hängt in einem Netz, die Augen groß und schwarz. Er wehrt sich nicht, als du näher kommst.",
      choices: [
        { label: "Befreien (Mut −4, er geht mit: +1 Mut je Runde)", mut: -4, passive: "seehund", bot: 2 },
        { label: "Weitergehen", bot: 0 }] },
    irrpfad: { title: "Der Irrlichtpfad", stretch: [1, 2, 3], text: "Ein Licht hüpft voraus, immer ein Stück weiter, immer dort, wo der Boden fest aussieht. Es führt dich schneller. Oder tiefer.",
      choices: [
        { label: "Folgen (Flut −1, Mut −5)", tide: -1, mut: -5, bot: 1 },
        { label: "Eigenen Weg suchen", bot: 0 }] },
    glockenton: { title: "Der Glockenton", stretch: [1, 2, 3], text: "Unter deinen Füßen, ganz tief, schlägt etwas. Einmal. Du könntest stehen bleiben und lauschen.",
      choices: [
        { label: "Lauschen (Flut +1, Mut +6, ein Blatt der Chronik)", tide: 1, mut: 6, chronik: "glocken", bot: 2 },
        { label: "Weitergehen", bot: 0 }] },
    kraemer: { title: "Der Krämer", stretch: [2, 3], text: "Ein Mann mit einem Bauchladen steht im Watt, trocken bis zum Knie. Er sagt, er verkauft hier seit 1362. Er nimmt kein Geld, nur Mut.",
      choices: [
        { label: "Ein Gegenstand für 6 Mut", mut: -6, reward: "choice", bot: 2 },
        { label: "Etwas verbessern lassen für 5 Mut", mut: -5, upgrade: true, bot: 1 },
        { label: "Danke, nein", bot: 0 }] },
    kreuz: { title: "Das Kreuz", stretch: [2, 3], text: "Ein Holzkreuz, schief, mit Muscheln bewachsen. Keine Inschrift. Jemand hat Blumen gebracht, vor sehr langer Zeit.",
      choices: [
        { label: "Innehalten (Flut +1, höchster Mut +5)", tide: 1, maxMut: 5, bot: 1 },
        { label: "Weitergehen", bot: 0 }] },
    priel: { title: "Der steigende Priel", stretch: [2, 3], text: "Der Priel vor dir ist breiter, als er auf der Karte war. Das Wasser läuft schon wieder auf.",
      choices: [
        { label: "Durchwaten (Mut −3, Laterne nass: nächste Begegnung ein Würfel weniger)", mut: -3, fog: 1, bot: 1 },
        { label: "Umweg (Flut +1)", tide: 1, bot: 2 }] },
    laterne: { title: "Die fremde Laterne", stretch: [1], text: "Jemand hat eine Laterne in den Schlick gestellt und ist nicht zurückgekommen. Sie brennt noch.",
      choices: [
        { label: "Mitnehmen (ein Gegenstand)", reward: "random", bot: 2 },
        { label: "Brennen lassen (Mut +4)", mut: 4, bot: 1 }] },
  };

  /* ---------- Chronik: die Geschichte, Blatt für Blatt ---------- */
  const CHRONIK = [
    { id: "aufbruch", title: "Aufbruch", when: () => true,
      text: "Am Abend vor Allerheiligen fällt das Watt tiefer als im ganzen Jahr. Dann, sagen die Alten auf der Hallig, steigt Rungholt aus dem Schlick: die reiche Stadt, die das Meer am 16. Januar 1362 in einer Nacht geholt hat. Wer bis zur Kirche kommt und die Glocke schlägt, bringt die Ertrunkenen zur Ruhe. Niemand ist je zurückgekommen, um zu erzählen, ob das stimmt. Du nimmst die Laterne. Die Flut kommt in sechs Stunden." },
    { id: "priele", title: "Die Priele", when: (s) => s.stretch >= 2,
      text: "Hinter den Salzwiesen beginnen die Priele, Adern aus Wasser, die bei Ebbe leer laufen und bei Flut zuerst wieder voll sind. Hier verliert man den Weg nicht, weil man sich verläuft, sondern weil er aufhört zu existieren. Die Fischer sagen, man soll nie über einen Priel gehen, der einen beim Namen ruft." },
    { id: "grauermann", title: "Der Graue Mann", when: (s) => s.guardians >= 1,
      text: "Der Graue Mann war der Deichvogt von Rungholt. In der Sturmnacht hat er die Tore der Stadt von innen verschlossen, damit niemand floh und die Wachen nicht allein blieben. Seitdem geht er am Rand des Lichts, immer einen Schritt dahinter, und prüft, wer das Watt betritt. Wer an ihm vorbeikommt, den lässt er gehen. Aufhalten kann er niemanden mehr. Nur erschrecken." },
    { id: "glocken", title: "Die Glocken", when: (s) => s.chronik && s.chronik.includes("glocken"),
      text: "Bei ruhiger See, sagt man, hört man Rungholts Glocken vom Grund. Es sind drei: die kleine, die zum Gebet rief, die mittlere für die Feuer, und die große, die nur geläutet wurde, wenn das Meer kam. In der Nacht der Mandränke hat sie zu spät geschlagen. Jetzt schlägt sie jede Nacht, und immer noch zu spät." },
    { id: "rungholt", title: "Rungholt", when: (s) => s.stretch >= 3,
      text: "Die Stadt steht. Nicht ganz, nicht fest, aber sie steht: Giebel aus Schlick, Gassen aus Wasser, Fenster, hinter denen etwas glimmt. Auf dem Markt liegen Münzen, und wer eine aufhebt, hält eine Muschel in der Hand. Die Leute von Rungholt waren reich und wurden übermütig. Sie haben ein Schwein betrunken gemacht, es in ein Bett gelegt und den Pfarrer geholt, damit er es mit den Sterbesakramenten versieht. Er hat sich geweigert. Sie haben ihn gezwungen. Dann hat er gebetet, und das Meer hat ihn erhört." },
    { id: "gloecknerin", title: "Die Glöcknerin", when: (s) => s.guardians >= 2,
      text: "Sie war ein Mädchen, das in der Sturmnacht als Einzige zum Turm lief. Sie hat die große Glocke geläutet, bis das Wasser den Strick aus den Händen nahm. Jetzt läutet sie weiter. Sie glaubt, die Stadt könne noch gewarnt werden. Wer ihr die Glocke abnimmt, der muss sie selbst schlagen. Sonst hört es nie auf." },
    { id: "blankehans", title: "Blanke Hans", when: (s) => s.finalReached,
      text: "So nennen sie das Meer, wenn es wütend ist: Blanke Hans, der weiße Hans, nach dem Schaum auf den Wellenkämmen. Er hat keine Gestalt, und doch hat er eine, wenn er will. Er will die Stadt behalten. Nicht aus Bosheit. Er hat sie gehabt, seit 1362, und was das Meer einmal hat, das gibt es ungern her." },
    { id: "sieg", title: "Die Glocke", when: (s) => s.won,
      text: "Ein Schlag. Der Ton läuft über das Watt, über die Priele, bis zur Hallig, wo die Alten die Köpfe heben. Die Fenster der Stadt werden dunkel, eins nach dem anderen, nicht wie Licht, das erlischt, sondern wie Augen, die endlich zugehen. Der Boden unter dir wird weich. Du gehst, ohne dich umzudrehen. Hinter dir läuft die Flut auf, ruhig, wie jede Nacht. Morgen wird jemand fragen, wo du warst. Du wirst sagen: spazieren." },
    { id: "fischer", title: "Der Fischer", when: (s) => s.won && s.kit === "fischer",
      text: "Der Fischer hat die Glocke geschlagen und ist dann noch lange auf der Warft gesessen. Er sagt, er habe seinen Vater unter den Schatten gesehen, in der dritten Gasse. Er habe genickt, und der Vater habe zurückgenickt. Mehr sagt er nicht. Er geht wieder hinaus, jede Nacht vor Allerheiligen. Nicht um die Stadt zu erlösen. Um zu nicken." },
    { id: "gloeckner", title: "Der Glöckner", when: (s) => s.won && s.kit === "gloeckner",
      text: "Der Glöckner hatte die kleine Glocke dabei, die vom Krämer. Als er die große schlug, hat die kleine mitgeschwungen, von selbst, in seiner Tasche. Er hat sie auf den Altar gelegt und ist gegangen. Der Krämer hat sie am nächsten Jahr wieder im Bauchladen gehabt. Er nimmt kein Geld." },
    { id: "springflut", title: "Springflut", when: (s) => s.won && s.springflut >= 1,
      text: "Es gibt Nächte, da fällt das Watt tiefer und die Flut kommt schneller: Springflut, wenn Mond und Sonne an einem Strang ziehen. Dann sind die Schatten dichter, und die Stadt steht länger. Wer in einer solchen Nacht die Glocke schlägt, von dem erzählen die Alten noch, wenn sie längst selbst unter den Schatten gehen." },
  ];

  /* ---------- Spiel ---------- */
  const STRETCHES = [
    { name: "Salzwiesen", enemies: ["irrlicht", "kriecher", "moewen"], guardian: "grauermann" },
    { name: "Priele", enemies: ["ertrunkener", "nebelweib", "klabauter"], guardian: "gloecknerin" },
    { name: "Rungholt", enemies: ["buerger", "ratten", "pfarrer"], guardian: "blankehans" },
  ];
  const STEPS_PER_STRETCH = 4;          // drei freie Schritte, dann der Wächter
  const TIDE_MAX = 15;                  // Schritte, bis die Flut zurück ist (12 Knoten + 3 Spielraum)
  const MAX_GEAR = 5;

  class Game {
    constructor(opts) {
      opts = opts || {};
      this.seed = opts.seed === undefined ? 1 : opts.seed >>> 0;
      this.rng = makeRng(this.seed);
      this.kitId = opts.kit && KITS[opts.kit] ? opts.kit : "wattlaeuferin";
      this.springflut = opts.springflut || 0;
      this.unlocked = (opts.unlocked || BASE_GEAR).filter((id) => GEAR[id]);
      const kit = KITS[this.kitId];
      this.maxMut = kit.mut;
      this.mut = kit.mut;
      this.baseDice = kit.dice;
      this.gear = kit.gear.map((id) => this.makeGear(id, false));
      this.passives = {};                 // seehund usw. aus Ereignissen
      this.tide = 0;
      this.step = 0;                      // Index des nächsten Schritts (0..11)
      this.map = this.makeMap();
      this.screen = "map";
      this.enemy = null;
      this.dice = [];
      this.turn = 0;
      this.fog = 0;
      this.shield = 0;
      this.weakened = 0;
      this.lifelineUsed = 0;
      this.defeated = 0;
      this.guardians = 0;
      this.finalReached = false;
      this.chronik = ["aufbruch"];
      this.event = null;
      this.rewardOptions = null;
      this.pendingAfterReward = null;
      this.over = false;
      this.won = false;
      this.cause = null;
      this.score = 0;
      this.events = [];                   // für die Oberfläche: was gerade passiert ist
      this.dieId = 0;
      this.log = [];
    }

    /* --- Hilfen --- */
    emit(e) { this.events.push(e); }
    takeEvents() { const e = this.events; this.events = []; return e; }
    say(text) { this.log.push(text); if (this.log.length > 40) this.log.shift(); this.emit({ type: "log", text }); }
    makeGear(id, plus) { return { id, plus: !!plus, uses: 0, count: 0 }; }
    gearDef(g) {
      const base = GEAR[g.id];
      if (!g.plus) return base;
      return Object.assign({}, base, base.plus || {}, { name: base.name + "+" });
    }
    get stretch() { return Math.min(3, Math.floor(this.step / STEPS_PER_STRETCH) + 1); }
    get stretchName() { return STRETCHES[Math.min(2, Math.floor(Math.max(0, this.step - (this.screen === "map" ? 0 : 1)) / STEPS_PER_STRETCH))].name; }
    scale(hp) { return Math.round(hp * (1 + 0.25 * this.springflut)); }

    /* --- Karte --- */
    makeMap() {
      const map = [];
      for (let s = 0; s < STRETCHES.length; s++) {
        const st = STRETCHES[s];
        let hasRest = false;
        for (let i = 0; i < STEPS_PER_STRETCH - 1; i++) {
          const n = 2 + (this.rng() < 0.5 ? 1 : 0);
          const nodes = [];
          const used = new Set();
          for (let k = 0; k < n; k++) {
            let type;
            const r = this.rng();
            if (i === 0 && k === 0) type = "fight";
            else if (r < 0.48) type = "fight";
            else if (r < 0.68) type = "event";
            else if (r < 0.84) type = "rest";
            else type = "find";
            if (i === STEPS_PER_STRETCH - 2 && !hasRest && k === n - 1 && !nodes.some((x) => x.type === "rest")) type = "rest";
            if (type !== "fight" && used.has(type)) type = "fight";
            used.add(type);
            const node = { type, stretch: s + 1 };
            if (type === "fight") node.enemy = pick(this.rng, st.enemies);
            if (type === "event") {
              const pool = Object.keys(EVENTS).filter((id) => EVENTS[id].stretch.includes(s + 1) && !map.some((step) => step.some((x) => x.event === id)));
              node.event = pool.length ? pick(this.rng, pool) : "irrpfad";
            }
            if (type === "rest") hasRest = true;
            nodes.push(node);
          }
          map.push(nodes);
        }
        map.push([{ type: "guardian", enemy: st.guardian, stretch: s + 1 }]);
      }
      return map;
    }
    get options() { return this.over || this.screen !== "map" || this.step >= this.map.length ? [] : this.map[this.step]; }

    chooseNode(i) {
      if (this.screen !== "map" || this.over) return false;
      const node = this.options[i];
      if (!node) return false;
      this.tide += 1;
      this.step += 1;
      this.current = node;
      this.emit({ type: "node", node, step: this.step });
      if (node.type === "fight" || node.type === "guardian") this.startFight(node.enemy);
      else if (node.type === "event") { this.event = node.event; this.screen = "event"; }
      else if (node.type === "rest") this.screen = "rest";
      else if (node.type === "find") this.offerReward("find");
      return true;
    }
    /* Die Flut: geprüft, sobald man wieder auf der Karte steht. */
    checkTide() {
      if (this.over) return;
      if (this.step >= this.map.length) return;
      if (this.tide >= TIDE_MAX) this.end(false, "flut");
    }
    backToMap() {
      this.screen = "map";
      this.current = null;
      this.checkTide();
    }

    /* --- Ereignis --- */
    chooseEvent(i) {
      if (this.screen !== "event" || this.over) return false;
      const ev = EVENTS[this.event];
      const c = ev.choices[i];
      if (!c) return false;
      if (c.tide) this.tide += c.tide;
      if (c.mut) this.changeMut(c.mut);
      if (c.maxMut) { this.maxMut += c.maxMut; this.changeMut(c.maxMut); }
      if (c.fog) this.fog += c.fog;
      if (c.passive) this.passives[c.passive] = (this.passives[c.passive] || 0) + 1;
      if (c.chronik) this.addChronik(c.chronik);
      this.emit({ type: "event", id: this.event, choice: i });
      this.say(ev.title + ": " + c.label);
      if (this.mut <= 0) { this.end(false, "mut"); return true; }
      if (c.upgrade) { this.screen = "upgrade"; this.pendingAfterReward = "map"; return true; }
      if (c.reward === "random") {
        const pool = this.rewardPool();
        if (pool.length) { this.gainGear(pick(this.rng, pool)); }
        this.event = null;
        if (this.gear.length > MAX_GEAR) { this.screen = "drop"; this.pendingAfterReward = "map"; return true; }
        this.backToMap();
        return true;
      }
      if (c.reward === "choice") { this.event = null; this.offerReward("event"); return true; }
      this.event = null;
      this.backToMap();
      return true;
    }

    /* --- Rast --- */
    get restOptions() {
      return [
        { id: "kurz", label: "Kurz verschnaufen (Mut +8)" },
        { id: "lang", label: "Lange rasten (Mut +15, Flut +1)" },
        { id: "upgrade", label: "Einen Gegenstand verbessern", disabled: !this.gear.some((g) => !g.plus) },
      ];
    }
    chooseRest(i) {
      if (this.screen !== "rest" || this.over) return false;
      const o = this.restOptions[i];
      if (!o || o.disabled) return false;
      if (o.id === "kurz") this.changeMut(8);
      if (o.id === "lang") { this.changeMut(15); this.tide += 1; }
      this.say("Rast: " + o.label);
      if (o.id === "upgrade") { this.screen = "upgrade"; this.pendingAfterReward = "map"; return true; }
      this.backToMap();
      return true;
    }
    chooseUpgrade(i) {
      if (this.screen !== "upgrade" || this.over) return false;
      const g = this.gear[i];
      if (!g || g.plus) return false;
      g.plus = true;
      this.emit({ type: "upgrade", gear: i });
      this.say(this.gearDef(g).name + " ist jetzt besser.");
      this.afterReward();
      return true;
    }

    /* --- Belohnung --- */
    rewardPool() {
      const owned = new Set(this.gear.map((g) => g.id));
      return this.unlocked.filter((id) => !owned.has(id));
    }
    offerReward(kind) {
      const pool = shuffle(this.rng, this.rewardPool()).slice(0, 3);
      const plus = kind === "guardian";
      this.rewardOptions = pool.map((id) => ({ id, plus }));
      this.rewardKind = kind;
      this.pendingAfterReward = "map";
      if (!pool.length) { this.rewardOptions = null; this.afterReward(); return; }
      this.screen = "reward";
    }
    chooseReward(i) {
      if (this.screen !== "reward" || this.over) return false;
      const o = this.rewardOptions[i];
      if (!o) return false;
      this.gainGear(o.id, o.plus);
      this.rewardOptions = null;
      if (this.gear.length > MAX_GEAR) { this.screen = "drop"; return true; }
      this.afterReward();
      return true;
    }
    skipReward() {
      if (this.screen !== "reward" || this.over) return false;
      this.rewardOptions = null;
      this.say("Du lässt es liegen.");
      this.afterReward();
      return true;
    }
    /* Ein Gegenstand zu viel: einen ablegen (auch den neuen). */
    chooseDrop(i) {
      if (this.screen !== "drop" || this.over) return false;
      const g = this.gear[i];
      if (!g) return false;
      this.gear.splice(i, 1);
      this.say(this.gearDef(g).name + " bleibt im Watt.");
      this.emit({ type: "drop", id: g.id });
      this.afterReward();
      return true;
    }
    gainGear(id, plus) {
      this.gear.push(this.makeGear(id, plus));
      this.emit({ type: "gain", id, plus: !!plus });
      this.say(GEAR[id].name + (plus ? "+" : "") + " gefunden.");
    }
    afterReward() {
      if (this.pendingAfterReward === "win") { this.end(true, "glocke"); return; }
      this.backToMap();
    }

    /* --- Kampf --- */
    startFight(enemyId) {
      const def = ENEMIES[enemyId];
      this.enemy = { id: enemyId, name: def.name, hp: this.scale(def.hp), maxHp: this.scale(def.hp), shield: 0, stunned: false, moveIndex: 0, turn: 1, def };
      if (def.final) this.finalReached = true;
      this.screen = "fight";
      this.turn = 0;
      this.shield = 0;
      this.weakened = 0;
      this.emit({ type: "fight", enemy: enemyId });
      this.say(def.name + " tritt aus dem Nebel.");
      this.startTurn();
    }
    get intent() {
      if (!this.enemy) return null;
      const e = this.enemy;
      const parts = e.def.moves[e.moveIndex % e.def.moves.length].map((p) => Object.assign({}, p));
      const bonus = this.escalation();
      for (const p of parts) if (p.kind === "hit") p.n = Math.max(0, p.n + bonus + this.springflut - this.weakened);
      return { parts, stunned: e.stunned, damage: parts.reduce((s, p) => s + (p.kind === "hit" ? p.n * (p.times || 1) : 0), 0) };
    }
    escalation() {
      const e = this.enemy;
      if (!e || !e.def.escalate || e.turn <= 4) return 0;
      return e.def.escalate * Math.ceil((e.turn - 4) / 3);
    }
    passiveSum(name) {
      let s = 0;
      for (const g of this.gear) { const d = this.gearDef(g); if (d.rule.kind === "passive" && d.passive === name) s += d.amount; }
      return s;
    }
    startTurn() {
      this.turn += 1;
      this.shield = this.passiveSum("shieldStart");
      if (this.shield) this.emit({ type: "shield", n: this.shield, who: "player" });
      if (this.passives.seehund) this.changeMut(this.passives.seehund);
      for (const g of this.gear) g.uses = 0;
      let n = this.baseDice + this.passiveSum("extraDie") - this.fog;
      if (this.fog) this.say("Nebel: ein Würfel weniger.");
      this.fog = 0;
      n = Math.max(1, n);
      this.dice = [];
      for (let i = 0; i < n; i++) this.dice.push(this.newDie());
      this.emit({ type: "roll", dice: this.dice.map((d) => d.v) });
    }
    newDie(v) { return { id: this.dieId++, v: v || 1 + Math.floor(this.rng() * 6) }; }
    fits(die, g) {
      const d = this.gearDef(g);
      const r = d.rule;
      if (r.kind === "passive") return false;
      if (g.uses >= (d.uses || 1)) return false;
      if (r.kind === "any") return true;
      if (r.kind === "even") return die.v % 2 === 0;
      if (r.kind === "odd") return die.v % 2 === 1;
      if (r.kind === "min") return die.v >= r.n;
      if (r.kind === "max") return die.v <= r.n;
      if (r.kind === "count") return true;
      return false;
    }
    amount(effect, v) {
      const base = effect.value === "die" ? v : effect.value === "inv" ? 7 - v : effect.value;
      return Math.max(0, base * (effect.mult || 1) + (effect.add || 0));
    }
    placeDie(di, gi) {
      if (this.screen !== "fight" || this.over) return false;
      const die = this.dice[di];
      const g = this.gear[gi];
      if (!die || !g || !this.fits(die, g)) return false;
      const d = this.gearDef(g);
      const r = d.rule;
      this.dice.splice(di, 1);
      g.uses += 1;
      let effect = d.effect;
      if (r.kind === "count") {
        g.count += die.v;
        this.emit({ type: "count", gear: gi, count: g.count, n: r.n });
        if (g.count < r.n) return true;
        g.count = 0;
      }
      this.applyEffect(effect, die, gi, di);
      return true;
    }
    applyEffect(effect, die, gi, di) {
      const v = die.v;
      const e = this.enemy;
      if (effect.kind === "hit") {
        let dmg = this.amount(effect, v);
        const blocked = Math.min(dmg, e.shield);
        e.shield -= blocked;
        dmg -= blocked;
        e.hp = Math.max(0, e.hp - dmg);
        this.emit({ type: "hit", who: "enemy", n: dmg, blocked, gear: gi });
        if (e.hp <= 0) this.winFight();
      } else if (effect.kind === "shield") {
        const n = this.amount(effect, v);
        this.shield += n;
        this.emit({ type: "shield", n, who: "player", gear: gi });
      } else if (effect.kind === "heal") {
        this.changeMut(this.amount(effect, v), gi);
      } else if (effect.kind === "stun") {
        e.stunned = true;
        this.emit({ type: "stun", gear: gi });
        this.say(e.name + " hält inne.");
      } else if (effect.kind === "weaken") {
        this.weakened += effect.value;
        this.emit({ type: "weaken", n: effect.value, gear: gi });
      } else if (effect.kind === "reroll") {
        const nd = this.newDie();
        this.dice.splice(di, 0, nd);
        this.emit({ type: "reroll", from: v, to: nd.v, gear: gi });
      } else if (effect.kind === "split") {
        const a = Math.floor(v / 2), b = v - a;
        this.dice.splice(di, 0, this.newDie(a), this.newDie(b));
        this.emit({ type: "split", from: v, to: [a, b], gear: gi });
      } else if (effect.kind === "plus") {
        this.dice.splice(di, 0, this.newDie(Math.min(6, v + 1)));
        this.emit({ type: "plus", from: v, to: Math.min(6, v + 1), gear: gi });
      }
    }
    changeMut(n, gi) {
      if (n > 0) {
        const before = this.mut;
        this.mut = Math.min(this.maxMut, this.mut + n);
        if (this.mut > before) this.emit({ type: "heal", n: this.mut - before, gear: gi });
      } else if (n < 0) {
        this.mut = Math.max(0, this.mut + n);
        this.emit({ type: "hurt", n: -n });
      }
    }
    endTurn() {
      if (this.screen !== "fight" || this.over) return false;
      const e = this.enemy;
      if (e.stunned) {
        e.stunned = false;
        this.say(e.name + " setzt aus.");
        this.emit({ type: "enemySkip" });
      } else {
        e.shield = 0;
        const intent = this.intent;
        for (const p of intent.parts) {
          if (p.kind === "hit") {
            for (let t = 0; t < (p.times || 1); t++) {
              let dmg = p.n;
              const blocked = Math.min(dmg, this.shield);
              this.shield -= blocked;
              dmg -= blocked;
              this.mut = Math.max(0, this.mut - dmg);
              this.emit({ type: "hit", who: "player", n: dmg, blocked });
              if (this.mut <= 0) {
                const lives = this.passiveSum("lifeline");
                if (lives > this.lifelineUsed) { this.lifelineUsed += 1; this.mut = 1; this.emit({ type: "lifeline" }); this.say("Der Rettungsring hält dich."); }
                else { this.end(false, "mut"); return true; }
              }
            }
          } else if (p.kind === "shield") { e.shield += p.n; this.emit({ type: "shield", n: p.n, who: "enemy" }); }
          else if (p.kind === "heal") { e.hp = Math.min(e.maxHp, e.hp + p.n); this.emit({ type: "heal", n: p.n, who: "enemy" }); }
          else if (p.kind === "fog") { this.fog += 1; this.emit({ type: "fog" }); this.say("Nebel zieht auf."); }
        }
        this.emit({ type: "enemyAct", parts: intent.parts });
      }
      e.moveIndex += 1;
      e.turn += 1;
      this.weakened = 0;
      this.startTurn();
      return true;
    }
    winFight() {
      const e = this.enemy;
      this.defeated += 1;
      const guardian = !!e.def.guardian;
      if (guardian) this.guardians += 1;
      this.emit({ type: "defeat", enemy: e.id, guardian });
      this.say(e.name + " zerfließt im Licht.");
      this.enemy = null;
      this.dice = [];
      if (e.def.final) { this.pendingAfterReward = "win"; this.end(true, "glocke"); return; }
      this.offerReward(guardian ? "guardian" : "fight");
    }

    /* --- Ende --- */
    addChronik(id) { if (!this.chronik.includes(id)) { this.chronik.push(id); this.emit({ type: "chronik", id }); } }
    end(won, cause) {
      if (this.over) return;
      this.over = true;
      this.won = won;
      this.cause = cause;
      this.screen = "over";
      this.enemy = null;
      this.score = this.computeScore();
      this.emit({ type: "over", won, cause, score: this.score });
    }
    computeScore() {
      let s = this.defeated * 10 + this.guardians * 30 + (this.stretchReached - 1) * 40 + this.mut * 2;
      if (this.won) s += 200 + Math.max(0, TIDE_MAX - this.tide) * 10;
      return Math.round(s * (1 + 0.5 * this.springflut));
    }
    get stretchReached() { return Math.min(3, Math.floor(Math.max(0, this.step - 1) / STEPS_PER_STRETCH) + 1); }
    summary() {
      return { won: this.won, cause: this.cause, score: this.score, stretch: this.stretchReached, guardians: this.guardians, finalReached: this.finalReached,
        defeated: this.defeated, kit: this.kitId, springflut: this.springflut, seed: this.seed, chronik: this.chronik.slice(), tide: this.tide };
    }
    get chronikUnlocked() { return CHRONIK.filter((c) => c.when(this.summary())).map((c) => c.id); }
  }

  /* ---------- Profil: was über die Nächte hinweg bleibt ---------- */
  function newProfile() {
    return { runs: 0, wins: 0, bestScore: 0, bestStretch: 0, gear: BASE_GEAR.slice(), kits: ["wattlaeuferin"], chronik: ["aufbruch"], unlocks: [], springflut: 0, daily: {}, history: [], sound: true };
  }
  /* Rechnet eine beendete Nacht ins Profil ein. Gibt das neue Profil und die neuen Freischaltungen zurück. */
  function updateProfile(profile, s, dateKey) {
    const p = JSON.parse(JSON.stringify(profile || newProfile()));
    const neu = { gear: [], kits: [], chronik: [], unlocks: [] };
    p.runs += 1;
    if (s.won) p.wins += 1;
    p.bestScore = Math.max(p.bestScore, s.score);
    p.bestStretch = Math.max(p.bestStretch, s.stretch);
    if (s.won && s.springflut >= p.springflut) p.springflut = Math.min(3, s.springflut + 1);
    for (const u of UNLOCKS) {
      if (p.unlocks.includes(u.id) || !u.when(s)) continue;
      p.unlocks.push(u.id);
      neu.unlocks.push(u.id);
      for (const g of u.gear) if (!p.gear.includes(g)) { p.gear.push(g); neu.gear.push(g); }
      if (u.kit && !p.kits.includes(u.kit)) { p.kits.push(u.kit); neu.kits.push(u.kit); }
    }
    for (const c of CHRONIK) {
      if (!p.chronik.includes(c.id) && c.when(s)) { p.chronik.push(c.id); neu.chronik.push(c.id); }
    }
    if (dateKey) {
      const d = p.daily[dateKey] || { score: 0, runs: 0 };
      d.runs += 1;
      d.score = Math.max(d.score, s.score);
      d.won = d.won || s.won;
      p.daily[dateKey] = d;
    }
    p.history.unshift({ score: s.score, won: s.won, stretch: s.stretch, kit: s.kit, springflut: s.springflut, cause: s.cause, daily: !!dateKey });
    p.history = p.history.slice(0, 10);
    return { profile: p, neu };
  }
  const dailySeed = (dateKey) => hashSeed("rungholt-" + dateKey);

  /* ---------- Autopilot: spielt vernünftig, nicht perfekt; für Balance, Tests und ?autoplay=1 ---------- */
  function choose(g) {
    if (g.over) return null;
    if (g.screen === "map") {
      const o = g.options;
      const low = g.mut < g.maxMut * 0.55;
      const prio = (n) => n.type === "rest" ? (low ? 5 : 1) : n.type === "find" ? 4 : n.type === "event" ? (low ? 0 : 3) : 2;
      let best = 0;
      for (let i = 1; i < o.length; i++) if (prio(o[i]) > prio(o[best])) best = i;
      return { type: "node", i: best };
    }
    if (g.screen === "event") {
      const ch = EVENTS[g.event].choices;
      let best = 0;
      for (let i = 1; i < ch.length; i++) {
        const ok = (c) => !(c.mut < 0 && g.mut + c.mut < 8) && !(c.tide > 0 && g.tide + c.tide >= TIDE_MAX - 1);
        if ((ch[i].bot || 0) > (ch[best].bot || 0) && ok(ch[i])) best = i;
        else if (!ok(ch[best]) && ok(ch[i])) best = i;
      }
      return { type: "event", i: best };
    }
    if (g.screen === "rest") {
      const ro = g.restOptions;
      if (g.mut < g.maxMut * 0.5 && g.tide < TIDE_MAX - 2) return { type: "rest", i: 1 };
      if (g.mut < g.maxMut * 0.8 || ro[2].disabled) return { type: "rest", i: 0 };
      return { type: "rest", i: 2 };
    }
    if (g.screen === "upgrade") {
      let best = -1;
      for (let i = 0; i < g.gear.length; i++) if (!g.gear[i].plus && (best < 0 || GEAR[g.gear[i].id].value > GEAR[g.gear[best].id].value)) best = i;
      return { type: "upgrade", i: Math.max(0, best) };
    }
    if (g.screen === "reward") {
      let best = 0;
      for (let i = 1; i < g.rewardOptions.length; i++) if (GEAR[g.rewardOptions[i].id].value > GEAR[g.rewardOptions[best].id].value) best = i;
      return { type: "reward", i: best };
    }
    if (g.screen === "drop") {
      let worst = 0;
      for (let i = 1; i < g.gear.length; i++) if (GEAR[g.gear[i].id].value < GEAR[g.gear[worst].id].value) worst = i;
      return { type: "drop", i: worst };
    }
    if (g.screen === "fight") return chooseInFight(g);
    return null;
  }
  function chooseInFight(g) {
    const e = g.enemy;
    const intent = g.intent;
    const incoming = intent.stunned ? 0 : intent.damage;
    const danger = incoming - g.shield > 0 && (g.mut - (incoming - g.shield) <= Math.max(6, g.maxMut * 0.3));
    const lethalNow = (v, eff) => eff.kind === "hit" && g.amount(eff, v) >= e.hp + e.shield;
    let best = null;
    const consider = (score, di, gi) => { if (!best || score > best.score) best = { score, di, gi }; };
    g.dice.forEach((die, di) => {
      g.gear.forEach((gear, gi) => {
        if (!g.fits(die, gear)) return;
        const d = g.gearDef(gear);
        const eff = d.effect;
        let score = 0;
        if (d.rule.kind === "count") {
          const reach = gear.count + die.v >= d.rule.n;
          score = reach ? (eff.kind === "stun" ? (incoming >= 5 ? 60 : 20) : eff.kind === "hit" ? 25 + g.amount(eff, die.v) : eff.kind === "shield" ? (danger ? 50 : 8) : eff.kind === "heal" ? (g.mut < g.maxMut * 0.7 ? 30 : 2) : eff.kind === "weaken" ? (incoming > 0 ? 25 : 3) : 5)
                        : 6 + die.v * 0.5;   // sammeln lohnt sich mit großen Würfeln, aber weniger als Zuschlagen
        } else if (eff.kind === "hit") {
          const n = g.amount(eff, die.v);
          score = lethalNow(die.v, eff) ? 100 : 10 + n * 2;
        } else if (eff.kind === "shield") {
          const n = g.amount(eff, die.v);
          const useful = Math.min(n, Math.max(0, incoming - g.shield));
          score = useful > 0 ? (danger ? 55 + useful : 9 + useful * 1.5) : -1;
        } else if (eff.kind === "heal") {
          const n = g.amount(eff, die.v);
          score = g.mut < g.maxMut - n ? 12 + n * (g.mut < g.maxMut * 0.5 ? 3 : 1) : -1;
        } else if (eff.kind === "stun") {
          score = incoming >= 5 && !intent.stunned ? 70 : (incoming > 0 && !intent.stunned ? 22 : -1);
        } else if (eff.kind === "weaken") {
          score = incoming > 0 && !intent.stunned ? 20 : -1;
        } else if (eff.kind === "reroll") {
          score = die.v <= 2 ? 15 : -1;
        } else if (eff.kind === "split") {
          score = die.v >= 4 && g.gear.some((x) => x.id !== gear.id && GEAR[x.id].effect && GEAR[x.id].effect.kind === "hit" && GEAR[x.id].rule.kind !== "min") ? 14 : -1;
        } else if (eff.kind === "plus") {
          score = die.v === 3 || die.v === 5 ? 13 : (die.v <= 4 ? 7 : -1);
        }
        if (score >= 0) consider(score, di, gi);
      });
    });
    if (best) return { type: "place", die: best.di, gear: best.gi };
    return { type: "end" };
  }
  function act(g, a) {
    if (!a) return false;
    if (a.type === "node") return g.chooseNode(a.i);
    if (a.type === "event") return g.chooseEvent(a.i);
    if (a.type === "rest") return g.chooseRest(a.i);
    if (a.type === "upgrade") return g.chooseUpgrade(a.i);
    if (a.type === "reward") return g.chooseReward(a.i);
    if (a.type === "drop") return g.chooseDrop(a.i);
    if (a.type === "place") return g.placeDie(a.die, a.gear);
    if (a.type === "end") return g.endTurn();
    return false;
  }
  /* Eine ganze Nacht mit dem Autopiloten; gibt die Zahl der Züge zurück. */
  function autoplay(g, limit) {
    let n = 0;
    while (!g.over && n < (limit || 5000)) { if (!act(g, choose(g))) break; n++; }
    return n;
  }

  return { Game, GEAR, BASE_GEAR, UNLOCKS, KITS, ENEMIES, EVENTS, CHRONIK, STRETCHES, STEPS_PER_STRETCH, TIDE_MAX, MAX_GEAR,
           makeRng, hashSeed, dailySeed, newProfile, updateProfile, choose, act, autoplay };
});
