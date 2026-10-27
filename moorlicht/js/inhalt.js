/* Moorlicht – alle Inhalte: Funken, Talismane, Kräuter, Orte, Wächter, Funde, Notizen, Gespräche.
   Reine Daten (plus kleine Bedingungen für Gespräche), damit sich das Spiel ohne Code-Änderung erweitern lässt. */
(function (root, fabrik) {
  if (typeof module === "object" && module.exports) module.exports = fabrik();
  else root.MoorlichtInhalt = fabrik();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Funken im Glas. rang steuert, wie oft sie angeboten werden (1 häufig, 3 selten).
  const ARTEN = {
    gluehwuermchen: {
      name: "Glühwürmchen", licht: 1, preis: 2, rang: 1, farbe: "#d4f26a",
      regel: "1 Licht.",
      notiz: "Photinus pyralis zeichnet beim Aufleuchten ein J in die Luft. Pim: „Wie ein Fragezeichen, nur fröhlich.“"
    },
    johannis: {
      name: "Johanniswürmchen", licht: 1, waerme: 1, preis: 4, rang: 1, farbe: "#ffcf6e",
      regel: "1 Licht. Wärmt: Kälte −1.",
      notiz: "Das Kleine Johanniswürmchen blinkt nicht, es glimmt ruhig. Als einziges hier ist es im Moor wirklich zu Hause."
    },
    gleichtakt: {
      name: "Gleichtakt-Käfer", licht: 1, takt: true, preis: 4, rang: 1, farbe: "#9ff0c8",
      regel: "1 Licht, +1 für jeden Gleichtakt-Käfer, der schon in der Laterne ist (bis 4 Licht).",
      notiz: "Photinus carolinus blinkt in den Smoky Mountains zu Tausenden im selben Takt. Pim behauptet, sie zählen leise mit."
    },
    leuchtkaefer: {
      name: "Großer Leuchtkäfer", licht: 4, preis: 8, rang: 3, farbe: "#fff1a8",
      regel: "4 Licht.",
      notiz: "So groß wie ein Daumennagel und so hell wie ein Streichholz. Jasper sagt, früher gab es mehr davon."
    },
    mondmotte: {
      name: "Mondmotte", licht: 0, verdoppelt: true, preis: 5, rang: 2, farbe: "#cfd8ff",
      regel: "Kein eigenes Licht. Der nächste leuchtende Funke zählt doppelt.",
      notiz: "Keine Käfer, sondern Falter mit silbrigen Flügeln. Sie werfen jedes Licht zurück wie ein kleiner Spiegel."
    },
    nachtfalter: {
      name: "Nachtfalter", licht: 1, faengt: true, preis: 5, rang: 2, farbe: "#c9a7ff",
      regel: "1 Licht. Fängt das nächste Irrlicht: es friert nicht.",
      notiz: "Ein brauner Falter, der Irrlichter jagt wie andere Falter Laternen. Er verbrennt sich nie."
    },
    funkenflieger: {
      name: "Funkenflieger", licht: 0, zaehlt: true, preis: 6, rang: 2, farbe: "#ff9d5c",
      regel: "So viel Licht, wie schon Funken in der Laterne sind (höchstens 6).",
      notiz: "Er kommt spät und will dahin, wo schon Gedränge ist. Je voller die Laterne, desto heller glüht er."
    },
    glutkaefer: {
      name: "Glutkäfer", licht: 2, glut: 3, preis: 5, rang: 2, farbe: "#ff7a45",
      regel: "2 Licht. Ist er der letzte Funke, wenn du weitergehst: +3 Glanz.",
      notiz: "Rot wie Kohle. Er glüht nach, wenn alle anderen schon schlafen, und das mögen die Händler."
    },
    gebunden: {
      name: "Gebundenes Irrlicht", licht: 5, kaelte: 1, preis: 7, rang: 3, farbe: "#bfe8ff",
      regel: "5 Licht, aber 1 Kälte.",
      notiz: "Ein Irrlicht, das mitkommen will. Es friert ein wenig, aber es leuchtet für fünf. Alma hatte recht."
    },
    irrlicht1: { name: "Irrlicht", kaelte: 1, irr: true, farbe: "#a9d6ff", regel: "Kälte 1." },
    irrlicht2: { name: "Irrlicht", kaelte: 2, irr: true, farbe: "#8fc3ff", regel: "Kälte 2." },
    irrlicht3: { name: "Großes Irrlicht", kaelte: 3, irr: true, farbe: "#7aa8ff", regel: "Kälte 3." }
  };

  const BASIS_ARTEN = ["gluehwuermchen", "johannis", "gleichtakt", "leuchtkaefer"];

  // Kräuter: einmal nutzbar, höchstens drei gleichzeitig.
  const KRAEUTER = {
    johanniskraut: { name: "Johanniskraut", regel: "Das zuletzt gezogene Irrlicht kehrt ins Glas zurück. Rettet auch eine flackernde Laterne." },
    baldrian: { name: "Baldrian", regel: "Zeigt die nächsten drei Funken im Glas." },
    kienspan: { name: "Kienspan", regel: "+3 Licht an dieser Station." },
    wachs: { name: "Bienenwachs", regel: "Kälte-Schwelle +2 an dieser Station. Rettet auch eine flackernde Laterne, wenn es reicht." }
  };

  const TALISMANE = {
    mondstein: { name: "Mondstein", regel: "Das erste Irrlicht jeder Station friert nicht.", text: "Glatt und kühl, mit einem Schimmer, der nicht vom Himmel kommt." },
    zunder: { name: "Almas Zunder", regel: "Jede Station beginnt mit 2 Licht.", text: "Eine Blechdose, innen verrußt. Auf dem Deckel ein eingeritztes A." },
    glocke: { name: "Kupferglocke", regel: "Gehst du genau auf der Kälte-Schwelle weiter: +5 Glanz.", text: "Sie klingt nur, wenn es eng wird." },
    korb: { name: "Weidenkorb", regel: "Rasten flickt 1 Docht mehr.", text: "Hedda hat Brot hineingelegt. Es ist immer noch warm." },
    feder: { name: "Rabenfeder", regel: "Erlischt die Laterne, kostet es nur 1 Docht.", text: "Raben finden im Dunkeln immer nach Hause." },
    bernstein: { name: "Bernstein", regel: "Kälte-Schwelle +1.", text: "Darin eingeschlossen: ein Glühwürmchen, älter als das Moor." },
    taktstock: { name: "Taktstock", regel: "Gleichtakt-Käfer leuchten 1 heller.", text: "Ein Weidenzweig, mit dem Pim den Glühwürmchen den Takt vorgibt." },
    tauperle: { name: "Tauperle", regel: "Johanniswürmchen wärmen doppelt.", text: "Ein Tropfen Johannistau, der nicht verdunstet." },
    spiegel: { name: "Spiegelscherbe", regel: "Mondmotten verdreifachen statt zu verdoppeln.", text: "Ein Splitter vom Turmspiegel. Er zeigt mehr Licht, als da ist." },
    kohle: { name: "Glühende Kohle", regel: "Glutkäfer bringen 3 Glanz mehr.", text: "Aus dem Johannisfeuer, eingewickelt in nasses Moos." },
    netz: { name: "Spinnennetz", regel: "Nachtfalter fangen zwei Irrlichter statt einem.", text: "Voller Tau, und jeder Tropfen spiegelt einen Funken." },
    wurzel: { name: "Alraune", regel: "Fehlen dir höchstens 2 Licht, kostet es keinen Docht (nicht bei Wächtern).", text: "Sie flüstert, wenn du zu früh aufgibst." },
    muenze: { name: "Krämermünze", regel: "Bei der Krämerin kostet alles ein Viertel weniger.", text: "Sie hat ein Loch in der Mitte, damit man sie nicht verliert." }
  };
  const BASIS_TALISMANE = ["mondstein", "zunder", "glocke", "korb", "feder", "bernstein", "taktstock"];
  const TRUHE_TALISMANE = ["tauperle", "spiegel", "kohle", "netz", "wurzel", "muenze"];

  // Besonderheiten einer Station.
  const MODS = {
    nebel: { name: "Dichter Nebel", regel: "Kälte-Schwelle −1." },
    sternklar: { name: "Sternklar", regel: "Kälte-Schwelle +1." },
    mondschein: { name: "Mondschein", regel: "Gleichtakt-Käfer leuchten 1 heller." },
    birkenlicht: { name: "Birkenlicht", regel: "Johanniswürmchen leuchten 1 heller." },
    schwarzwasser: { name: "Schwarzes Wasser", regel: "Irrlichter mit Kälte 1 frieren doppelt." },
    wind: { name: "Wind", regel: "Mondmotten und Nachtfalter wirken nicht." },
    tau: { name: "Tau", regel: "Überschüssiges Licht bringt doppelt Glanz." }
  };

  const REGIONEN = [
    {
      name: "Birkenbruch", waechter: "nebelfrau",
      text: "Weiße Stämme, schwarzes Wasser dazwischen. Hier fängt das Moor an, und hier hört der Weg auf.",
      mods: [["nebel", 2], ["sternklar", 2], ["mondschein", 2], ["birkenlicht", 2], ["tau", 1], ["wind", 1]],
      harte: [["nebel", 3], ["wind", 2]]
    },
    {
      name: "Torfstiche", waechter: "moorkoenig",
      text: "Gerade Gräben, von Menschen gestochen. Rostige Loren, ein versunkener Kran. Das Moor holt sich alles zurück.",
      mods: [["nebel", 2], ["sternklar", 1], ["mondschein", 2], ["birkenlicht", 1], ["schwarzwasser", 2], ["tau", 1], ["wind", 2]],
      harte: [["nebel", 2], ["schwarzwasser", 3], ["wind", 2]]
    },
    {
      name: "Schwarzes Wasser", waechter: "alma",
      text: "Ein See ohne Spiegelbild. Am anderen Ufer steht der Lichtturm, dunkel seit einem Jahr.",
      mods: [["nebel", 3], ["sternklar", 1], ["mondschein", 1], ["schwarzwasser", 3], ["tau", 1], ["wind", 2]],
      harte: [["nebel", 2], ["schwarzwasser", 3], ["wind", 2]]
    }
  ];

  const WAECHTER = {
    nebelfrau: {
      name: "Die Nebelfrau", dunkel: 9, schwelle: -2,
      regel: "Kälte-Schwelle −2. Glühwürmchen leuchten 1 heller.",
      text: "Eine Gestalt aus Nebel, mit einer leeren Laterne in der Hand. Sie weicht nur vor viel Licht zurück."
    },
    moorkoenig: {
      name: "Der Moorkönig", dunkel: 8,
      regel: "Jedes Irrlicht vergrößert das Dunkel um 2.",
      text: "Der Schlund, in dem der Bagger versank. Er atmet Kälte, und jedes Irrlicht macht ihn größer."
    },
    alma: {
      name: "Das große Irrlicht", dunkel: 42, zusatz: ["irrlicht2", "irrlicht2", "irrlicht2"],
      regel: "Drei zusätzliche Irrlichter (Kälte 2) im Glas. Jedes Irrlicht bringt aber 2 Licht.",
      text: "Am Fuß des Turms schwebt ein Licht, so groß wie ein Mensch. Es friert nicht. Es wartet."
    }
  };

  const LATERNEN = {
    sturm: {
      name: "Sturmlaterne", docht: 6, schwelle: 7, talismane: [],
      glas: ["gluehwuermchen", "gluehwuermchen", "gluehwuermchen", "gluehwuermchen", "gluehwuermchen", "gluehwuermchen",
        "johannis", "gleichtakt", "irrlicht1", "irrlicht1", "irrlicht1", "irrlicht1", "irrlicht2", "irrlicht2", "irrlicht3"],
      text: "Almas Laterne. Robust, 6 Docht, Kälte-Schwelle 7."
    },
    kupfer: {
      name: "Kupferlaterne", docht: 5, schwelle: 7, talismane: ["taktstock"],
      glas: ["gluehwuermchen", "gluehwuermchen", "gluehwuermchen", "gleichtakt", "gleichtakt", "gleichtakt",
        "irrlicht1", "irrlicht1", "irrlicht1", "irrlicht1", "irrlicht2", "irrlicht2", "irrlicht3"],
      text: "Für Gleichtakt gebaut: drei Gleichtakt-Käfer und der Taktstock, dafür nur 5 Docht."
    },
    papier: {
      name: "Papierlaterne", docht: 4, schwelle: 9, talismane: [],
      glas: ["gluehwuermchen", "gluehwuermchen", "gluehwuermchen", "gluehwuermchen", "nachtfalter", "nachtfalter",
        "johannis", "irrlicht1", "irrlicht1", "irrlicht1", "irrlicht1", "irrlicht2", "irrlicht2", "irrlicht3"],
      text: "Leicht und zugig: Kälte-Schwelle 9 und zwei Nachtfalter, aber nur 4 Docht."
    }
  };

  // Mondphasen machen jede weitere Johannisnacht härter; sie wirken kumulativ.
  const MONDPHASEN = [
    { name: "Neumond", regel: "Die Nacht, wie sie ist." },
    { name: "Sichel", regel: "Alle Stationen: Dunkel +1." },
    { name: "Halbmond", regel: "Ein zusätzliches Irrlicht (Kälte 2) im Startglas." },
    { name: "Dreiviertel", regel: "Rasten flickt 1 Docht weniger, die Krämerin verlangt 1 Glanz mehr." },
    { name: "Fast voll", regel: "Wächter: Dunkel +3." },
    { name: "Vollmond", regel: "1 Docht weniger." }
  ];

  // Dauerhafte Freischaltungen im Dorf, bezahlt mit Erinnerungen.
  const FREISCHALTUNGEN = [
    { id: "mondmotte", preis: 4, name: "Mondmotte", text: "Neuer Funke: verdoppelt den nächsten." },
    { id: "nachtfalter", preis: 4, name: "Nachtfalter", text: "Neuer Funke: fängt ein Irrlicht." },
    { id: "kraeuterbeutel", preis: 6, name: "Kräuterbeutel", text: "Jede Nacht mit einem Johanniskraut beginnen." },
    { id: "glutkaefer", preis: 6, name: "Glutkäfer", text: "Neuer Funke: Glanz, wenn er zuletzt kommt." },
    { id: "kupfer", preis: 8, name: "Kupferlaterne", text: "Neue Laterne für Gleichtakt-Ketten." },
    { id: "funkenflieger", preis: 8, name: "Funkenflieger", text: "Neuer Funke: hell in voller Laterne." },
    { id: "truhe", preis: 10, name: "Krämerinnentruhe", text: "Sechs neue Talismane können auftauchen." },
    { id: "papier", preis: 12, name: "Papierlaterne", text: "Neue Laterne: hohe Schwelle, wenig Docht." },
    { id: "erbstueck", preis: 12, name: "Großmutters Docht", text: "Jede Laterne hat 1 Docht mehr." }
  ];

  // Funde unterwegs: kleine Geschichten mit Abwägungen. Wirkungen werden in engine.js angewendet.
  const FUNDE = [
    {
      id: "laterne", regionen: [0, 1], titel: "Eine Laterne im Gras",
      text: "Am Wegrand liegt eine zerbeulte Sturmlaterne, genau wie deine. Am Griff ist ein A eingeritzt. Sie ist kalt.",
      optionen: [
        { text: "Den Zunder herausnehmen", hinweis: "Talisman Almas Zunder, aber ein Irrlicht (Kälte 2) kommt ins Glas",
          wirkung: [{ talisman: "zunder" }, { funke: "irrlicht2" }], folge: "Die Dose ist noch warm. Etwas Kaltes schlüpft mit in dein Glas." },
        { text: "Ihr Öl in deine Laterne gießen", hinweis: "+2 Docht", wirkung: [{ docht: 2 }], folge: "Dein Docht saugt sich voll. Es riecht nach Almas Mantel." },
        { text: "Sie aufrecht hinstellen", hinweis: "+2 Glühwürmchen", wirkung: [{ funke: "gluehwuermchen" }, { funke: "gluehwuermchen" }],
          folge: "Wie ein Grablicht. Zwei Glühwürmchen setzen sich darauf, dann fliegen sie zu dir." }
      ]
    },
    {
      id: "torfstecher", regionen: [0, 1], titel: "Der Torfstecher",
      text: "Ein alter Mann steckt bis zu den Knien im Moor. Er flucht leise, als wäre das schon öfter passiert.",
      optionen: [
        { text: "Ihn herausziehen", hinweis: "−1 Docht, +2 Johanniswürmchen", wirkung: [{ docht: -1 }, { funke: "johannis" }, { funke: "johannis" }],
          folge: "Er ist schwerer, als er aussieht. Zum Dank schüttelt er zwei Johanniswürmchen aus der Mütze." },
        { text: "Nach dem Weg fragen", hinweis: "ein Kraut", wirkung: [{ kraut: "zufall" }],
          folge: "„Immer dem Licht nach, aber nie zu weit.“ Er drückt dir ein Büschel Kräuter in die Hand." },
        { text: "Weitergehen", hinweis: "nichts", wirkung: [], folge: "Hinter dir flucht er weiter. Es klingt fast zufrieden." }
      ]
    },
    {
      id: "wiese", regionen: [0, 1, 2], titel: "Eine Glühwürmchenwiese",
      text: "Eine Lichtung voller Funken. Sie blinken durcheinander, dann, für einen Atemzug, alle zugleich.",
      optionen: [
        { text: "Fangen", hinweis: "wähle einen von drei Funken", wirkung: [{ fang: true }], folge: "Du wartest auf den Gleichtakt und greifst zu." },
        { text: "Im Gras rasten", hinweis: "+1 Docht, +2 Glanz", wirkung: [{ docht: 1 }, { glanz: 2 }], folge: "Du liegst auf dem Rücken und schaust zu. Für einen Moment ist die Nacht nicht gefährlich." }
      ]
    },
    {
      id: "reigen", regionen: [1, 2], titel: "Der Irrlichter-Reigen",
      text: "Blasse Lichter tanzen im Kreis über dem Wasser. Sie laden dich ein. Sie sind kalt, aber sie lachen.",
      optionen: [
        { text: "Mittanzen", hinweis: "−2 Docht, zwei kleine Irrlichter verlassen dein Glas", wirkung: [{ docht: -2 }, { entferneIrr: 2 }],
          folge: "Dir wird kalt bis in die Knochen. Als der Tanz endet, bleiben zwei Irrlichter im Kreis zurück." },
        { text: "Ein Lied pfeifen", hinweis: "halbe Chance: ein Irrlicht geht, sonst kommt eins dazu",
          wirkung: [{ wagnis: { chance: 0.5, gut: [{ entferneIrr: 1 }], schlecht: [{ funke: "irrlicht1" }],
            gutText: "Eines der Lichter tanzt zu deinem Lied davon.", schlechtText: "Ein Licht gefällt das Lied so gut, dass es dir folgt." } }] },
        { text: "Wegsehen", hinweis: "nichts", wirkung: [], folge: "Du gehst weiter. Das Lachen folgt dir noch eine Weile." }
      ]
    },
    {
      id: "faehrfrau", regionen: [2], titel: "Die Fährfrau",
      text: "Ein flacher Kahn, eine Frau mit Stake. „Rüber kostet. Durchs Wasser kostet auch. Such’s dir aus.“",
      optionen: [
        { text: "Die Überfahrt bezahlen", hinweis: "−7 Glanz, ein Talisman", bedingung: { glanz: 7 }, wirkung: [{ glanz: -7 }, { talisman: "zufall" }],
          folge: "Mitten auf dem See hält sie dir einen Talisman hin. „Gehört dir. Hat jemand liegen lassen, der so aussah wie du.“" },
        { text: "Durchs Wasser waten", hinweis: "−1 Docht, +5 Glanz", wirkung: [{ docht: -1 }, { glanz: 5 }],
          folge: "Eiskalt. Im Schlamm stößt dein Fuß gegen etwas Glänzendes." },
        { text: "Ihr ein Glühwürmchen schenken", hinweis: "−1 Glühwürmchen, ein Kraut", wirkung: [{ entferne: "gluehwuermchen" }, { kraut: "zufall" }],
          folge: "Sie lächelt zum ersten Mal und gibt dir ein Kraut aus ihrer Schürze." }
      ]
    },
    {
      id: "huenengrab", regionen: [1, 2], titel: "Das Hünengrab",
      text: "Schwere Steine, darunter ein Spalt. Von unten schimmert es golden. Oder blau. Schwer zu sagen.",
      optionen: [
        { text: "Hinabsteigen", hinweis: "halbe Chance: Talisman, sonst ein großes Irrlicht und −1 Docht",
          wirkung: [{ wagnis: { chance: 0.5, gut: [{ talisman: "zufall" }], schlecht: [{ funke: "irrlicht3" }, { docht: -1 }],
            gutText: "Zwischen alten Knochen liegt ein Talisman, als hätte er auf dich gewartet.", schlechtText: "Es war blau. Ein großes Irrlicht klettert mit dir hinauf." } }] },
        { text: "Weitergehen", hinweis: "nichts", wirkung: [], folge: "Manche Türen bleiben besser zu." }
      ]
    },
    {
      id: "kraemerin", regionen: [0, 1, 2], titel: "Die Krämerin am Feuer",
      text: "Eine Frau mit Kiepe wärmt sich an einem winzigen Feuer. „Kräuter? Geschichten? Beides kostet.“",
      optionen: [
        { text: "Kräuter kaufen", hinweis: "−5 Glanz, zwei Kräuter", bedingung: { glanz: 5 }, wirkung: [{ glanz: -5 }, { kraut: "zufall" }, { kraut: "zufall" }],
          folge: "Sie wickelt zwei Büschel in Zeitungspapier vom letzten Jahr." },
        { text: "Ihre Geschichte hören", hinweis: "+1 Docht", wirkung: [{ docht: 1 }],
          folge: "„Die Irrlichter waren alle mal wie du. Gierig nach Licht. Wer gierig ist, erlischt.“ Das Feuer wärmt trotzdem." }
      ]
    },
    {
      id: "kreuzstein", regionen: [0, 1], titel: "Der Kreuzweg-Stein",
      text: "Ein Stein mit eingemeißeltem Kreuz, davor Opfergaben: Münzen, eine Kinderschleife, ein ausgebrannter Docht.",
      optionen: [
        { text: "Deinen hellsten Funken opfern", hinweis: "der hellste Funke geht, dafür ein Talisman", wirkung: [{ opfer: true }, { talisman: "zufall" }],
          folge: "Der Funke steigt auf und wird ein Stern. Auf dem Stein liegt jetzt etwas, das vorher nicht da war." },
        { text: "Dreimal umrunden, wie es Brauch ist", hinweis: "−1 Docht dauerhaft, Kälte-Schwelle +1 dauerhaft", wirkung: [{ dochtMax: -1 }, { schwelle: 1 }],
          folge: "Beim dritten Mal wird dir schwindlig, und danach ist dir nie mehr ganz so kalt." },
        { text: "Weitergehen", hinweis: "nichts", wirkung: [], folge: "Der Stein sieht dir nach." }
      ]
    },
    {
      id: "brunnen", regionen: [0, 1, 2], titel: "Der Moorbrunnen",
      text: "Ein gemauerter Brunnen mitten im Moor. Das Wasser darin ist klar und sehr tief.",
      optionen: [
        { text: "Trinken", hinweis: "+1 Docht dauerhaft, aber ein kleines Irrlicht ins Glas", wirkung: [{ dochtMax: 1 }, { docht: 1 }, { funke: "irrlicht1" }],
          folge: "Es schmeckt nach Eisen und Sommer. Aus der Tiefe steigt ein kleines Licht und folgt dir." },
        { text: "Eine Münze werfen", hinweis: "−3 Glanz, mit 60 % zwei Kräuter", bedingung: { glanz: 3 },
          wirkung: [{ glanz: -3 }, { wagnis: { chance: 0.6, gut: [{ kraut: "zufall" }, { kraut: "zufall" }], schlecht: [],
            gutText: "Es plätschert, dann schwimmen zwei Kräuter an die Oberfläche.", schlechtText: "Es plätschert. Sonst nichts." } }] },
        { text: "Weitergehen", hinweis: "nichts", wirkung: [], folge: "Dein Spiegelbild bleibt im Brunnen." }
      ]
    },
    {
      id: "pim", regionen: [0], titel: "Pims Einmachglas",
      text: "Pim ist dir heimlich nachgelaufen, mit einem Einmachglas voller Glühwürmchen. „Für dich. Damit du nicht allein bist.“",
      optionen: [
        { text: "Das Glas annehmen", hinweis: "+1 Glühwürmchen, +1 Gleichtakt-Käfer", wirkung: [{ funke: "gluehwuermchen" }, { funke: "gleichtakt" }],
          folge: "„Der da blinkt im Takt“, sagt Pim stolz. Dann schickst du Pim nach Hause." },
        { text: "Pim nach Hause bringen", hinweis: "+2 Docht", wirkung: [{ docht: 2 }],
          folge: "Ihr geht ein Stück zurück. Die Sorge um Pim fällt von dir ab, und der Docht brennt ruhiger." }
      ]
    },
    {
      id: "stimme", regionen: [1, 2], titel: "Eine Stimme im Nebel",
      text: "Jemand ruft deinen Namen. Es ist Almas Stimme, ganz nah und ganz weit zugleich.",
      optionen: [
        { text: "Der Stimme folgen", hinweis: "halbe Chance: Talisman, sonst −2 Docht",
          wirkung: [{ wagnis: { chance: 0.5, gut: [{ talisman: "zufall" }], schlecht: [{ docht: -2 }],
            gutText: "Wo die Stimme verstummt, liegt etwas im Moos.", schlechtText: "Die Stimme führt dich im Kreis, bis du nicht mehr weißt, wo vorn ist." } }] },
        { text: "Die Ohren zuhalten", hinweis: "nichts", wirkung: [], folge: "Du zählst deine Schritte laut, bis die Stimme aufgibt." }
      ]
    }
  ];

  // Almas Notizen: über viele Nächte verstreut, sie erzählen, was mit ihr geschah.
  const NOTIZEN = [
    "Erste Nacht. Die Laterne ist schwerer, als sie aussieht. Jasper sagt, ich soll nicht gierig sein. Gierig nach Licht? Das ist doch das Einzige, wonach man hier gierig sein darf.",
    "Ich bin im Krug aufgewacht. Hedda hat dieselbe Suppe gekocht wie gestern. Es ist dieselbe Nacht. Ich glaube, das Moor lässt sie nicht enden, bis jemand das Feuer anzündet.",
    "Die Irrlichter sind kalt, aber nicht böse. Eines ist mir bis zum Birkenrand gefolgt und hat sich in mein Glas gesetzt, als wollte es mitgenommen werden.",
    "Die Nebelfrau trägt eine Laterne wie meine. Leer. Sie hat mich angesehen, als würde sie mich kennen. Oder als würde sie sich an etwas erinnern.",
    "In den Torfstichen liegen Laternen. Dutzende. In jeder ist ein Name eingeritzt. Ich habe ein A in meine geritzt, damit man mich findet.",
    "Jetzt weiß ich es. Wer zu lange zieht, erlischt, und wer erlischt, wird ein Irrlicht. Sie wollen nicht schaden. Sie wollen nur zurück in ein Glas.",
    "Der Turm braucht kein helles Licht. Er braucht gebundenes Licht, das Licht der Verlorenen. Man muss sie mitnehmen, nicht vertreiben.",
    "Wenn du das liest, bist du weit gekommen. Ich bin nicht mehr weit weg. Ich bin das große Licht am Schwarzen Wasser. Hab keine Angst vor mir. Nimm mich mit nach Hause."
  ];

  // Gespräche im Dorf. Jede Figur zeigt ihr erstes ungelesenes Gespräch, dessen Bedingung erfüllt ist.
  const FIGUREN = {
    hedda: { name: "Hedda", rolle: "Wirtin im Krug „Zur Moorlilie“" },
    jasper: { name: "Jasper", rolle: "Torfstecher, kennt die alten Geschichten" },
    pim: { name: "Pim", rolle: "Nachbarskind, führt das Naturkundebuch" }
  };
  const GESPRAECHE = [
    { id: "h0", wer: "hedda", wenn: (m) => m.laeufe === 0,
      text: "Die Laterne steht schon an der Tür. Almas Laterne, ich hab sie geputzt. Komm heil wieder, hörst du? Und wenn es zu dunkel wird: Geh lieber weiter, statt zu warten. Hell wird es da draußen nicht von allein." },
    { id: "h1", wer: "hedda", wenn: (m) => m.laeufe >= 1,
      text: "Da bist du ja. Du siehst aus, als hättest du ein Gespenst gesehen. Iss was, es ist Johannisnacht, da braucht man was im Bauch. Was meinst du mit „schon wieder“?" },
    { id: "h2", wer: "hedda", wenn: (m) => m.laeufe >= 2,
      text: "Du sagst mir, was in der Suppe ist, bevor ich den Deckel hebe. Liebstöckel, Graupen, ein Stück Speck. … Na gut. Ich glaube dir. Die Nacht fängt immer wieder von vorn an, und nur du merkst es." },
    { id: "h3", wer: "hedda", wenn: (m) => m.weitesteRegion >= 1,
      text: "Bis zu den Torfstichen? Dann hast du die Nebelfrau gesehen. Meine Mutter hat gesagt, man soll ihr nicht in die Augen schauen. Aber meine Mutter hat auch gesagt, Kartoffeln wachsen besser bei Vollmond." },
    { id: "h4", wer: "hedda", wenn: (m) => m.laeufe >= 4,
      text: "Weißt du, was ich nicht loswerde? Ich hab Alma letztes Jahr genau diese Suppe hingestellt. Vielleicht ist es für sie auch immer noch dieselbe Nacht." },
    { id: "h5", wer: "hedda", wenn: (m) => m.siege >= 1,
      text: "Das Moorfeuer! Ich hab es vom Dachboden gesehen, ganz klein, wie ein Stern, der zu tief hängt. Und trotzdem stehst du wieder in meiner Tür, und draußen ist Abendrot. Ein neues Jahr, sagst du? Der Mond ist jedenfalls dicker als letztes Mal." },
    { id: "h6", wer: "hedda", wenn: (m) => m.wahresEnde,
      text: "Zwei Teller. Ich hab einfach zwei Teller hingestellt, ohne nachzudenken. Sie sitzt da drüben am Fenster und redet mit Pim über Käfer. Ich muss mich erst daran gewöhnen. Schön ist es trotzdem." },
    { id: "j1", wer: "jasper", wenn: (m) => m.laeufe >= 1,
      text: "Irrlichter sind keine Geister, sagt man. Mein Großvater sagte: Es sind Leute, die zu lange ins Dunkel geguckt haben. Die Laterne will noch einen Funken und noch einen, und dann ist sie aus." },
    { id: "j2", wer: "jasper", wenn: (m) => m.laeufe >= 2,
      text: "Zieh nie mehr Funken aus dem Glas, als du tragen kannst. Das hab ich Alma auch gesagt. Sie hat gelacht: „Und wenn ich mehr tragen kann, als du denkst?“" },
    { id: "j3", wer: "jasper", wenn: (m) => m.weitesteRegion >= 1,
      text: "Die Torfstiche hab ich gestochen, vierzig Jahre lang. Da drin liegt ein ganzer Bagger. Der Moorkönig hat ihn geholt, sagen die Leute. Ich sag: Der Boden war zu weich. Aber nachts sag ich lieber auch Moorkönig." },
    { id: "j4", wer: "jasper", wenn: (m) => (m.waechter.nebelfrau || 0) >= 1,
      text: "Die Nebelfrau war die Erste, die das Licht getragen hat. So erzählt man es. Sie wollte so hell sein, dass das Moor nie wieder dunkel wird. Seitdem ist sie der Nebel." },
    { id: "j5", wer: "jasper", wenn: (m) => m.weitesteRegion >= 2,
      text: "Schwarzes Wasser. Da drüben steht der Turm. Keiner weiß, wer ihn gebaut hat. Mein Großvater meinte, er war schon da, als das Moor noch ein See war." },
    { id: "j6", wer: "jasper", wenn: (m) => m.notizen.length >= 5,
      text: "Alma schreibt, man muss die Irrlichter mitnehmen? Nicht vertreiben? Mein Großvater hätte gesagt, sie ist verrückt geworden. Ich sag: Vielleicht hat sie als Erste hingehört." },
    { id: "j7", wer: "jasper", wenn: (m) => m.siege >= 1,
      text: "Das Feuer hat gebrannt, ich hab’s gerochen, Torfrauch bis hierher. Wenn das Moor jetzt jedes Jahr wieder hungrig wird, dann eben jedes Jahr. Ich stech dir Torf für die Laterne." },
    { id: "j8", wer: "jasper", wenn: (m) => m.mondphaseFrei >= 3,
      text: "Der Mond wird jedes Jahr voller und das Moor wacher. Pass auf deinen Docht auf. Und auf dich." },
    { id: "p0", wer: "pim", wenn: (m) => m.laeufe === 0,
      text: "Nimmst du mein Buch mit? Das Naturkundebuch. Da schreib ich alle Funken rein, die du fängst. Alma hat mir das erste Glühwürmchen gezeigt. Es hat ein J in die Luft gemalt." },
    { id: "p1", wer: "pim", wenn: (m) => m.laeufe >= 1,
      text: "Hast du welche gesehen, die im Takt blinken? Die gibt’s wirklich, in Amerika, in den Bergen! Je mehr zusammen sind, desto heller, sagt Alma." },
    { id: "p2", wer: "pim", wenn: (m) => m.gesehen.arten.filter((a) => !a.startsWith("irrlicht")).length >= 5,
      text: "Mondmotten sind gar keine Glühwürmchen. Aber sie fliegen zum Licht, und dann ist es doppelt hell. Ich hab’s mit der Taschenlampe ausprobiert. Hedda hat geschimpft." },
    { id: "p3", wer: "pim", wenn: (m) => m.laeufe >= 3,
      text: "Du warst schon mal da draußen, oder? Du guckst wie Alma, wenn sie vom Moor kam. So, als wärst du noch halb dort." },
    { id: "p4", wer: "pim", wenn: (m) => m.almaGesehen,
      text: "Hast du sie gesehen? Alma? … Du guckst so. Hast du. Ist sie ein Irrlicht? Irrlichter sind nicht böse, das steht in meinem Buch. Das hab ich selbst reingeschrieben." },
    { id: "p5", wer: "pim", wenn: (m) => m.notizen.length >= 8,
      text: "Du hast alle Seiten gefunden? Dann weißt du jetzt, was zu tun ist. Bring sie mit. Bitte." },
    { id: "p6", wer: "pim", wenn: (m) => m.wahresEnde,
      text: "Alma sagt, du hast sie getragen, den ganzen Weg. Sie sagt, du warst ein bisschen gierig. Aber nur ein bisschen." }
  ];

  const TEXTE = {
    intro: [
      "Fennhusen, am Rand des Großen Moores.",
      "In jeder Johannisnacht trägt jemand das Licht über das Moor zum alten Lichtturm. Brennt dort das Moorfeuer, bleibt der Nebel ein Jahr lang draußen.",
      "Letztes Jahr ging Alma, deine Schwester. Das Feuer hat nie gebrannt, und Alma kam nicht zurück.",
      "Jetzt ist wieder Johannisnacht. Die Laterne ist deine."
    ],
    niederlage: "Die Laterne erlischt. Kälte kriecht dir in die Finger, dann in die Gedanken. Das Letzte, was du siehst, ist ein blasses Licht, das sich neben dich setzt. … Du erwachst im Krug. Durchs Fenster fällt Abendrot. Es ist wieder Johannisnacht.",
    sieg: "Der Lichtturm brennt. Über dem Schwarzen Wasser wird es grau, dann rosa, dann golden. Zum ersten Mal seit einem Jahr endet die Johannisnacht. Die Irrlichter sinken ins Schilf wie müde Kinder. Eines bleibt, lange, bis die Sonne es auflöst.",
    wahresEnde: "Du hebst das große Irrlicht in dein Glas. Es ist nicht kalt. Es ist warm wie eine Hand. Als das Moorfeuer aufflammt, hörst du Alma lachen, so wie damals, als sie Pim das erste Glühwürmchen gezeigt hat. Am Morgen gehst du zurück nach Fennhusen. Ihr geht zu zweit."
  };

  return {
    ARTEN, BASIS_ARTEN, KRAEUTER, TALISMANE, BASIS_TALISMANE, TRUHE_TALISMANE, MODS, REGIONEN, WAECHTER,
    LATERNEN, MONDPHASEN, FREISCHALTUNGEN, FUNDE, NOTIZEN, FIGUREN, GESPRAECHE, TEXTE
  };
});
