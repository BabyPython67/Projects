// Behutsame Modernisierung der Rechtschreibung von Büchners Text (nur Schreibung, keine Wortformen,
// kein Dialekt, keine Satzzeichen außer überholten Apostrophen). Dieselben Regeln nutzt der Test, der
// jeden Büchner-Satz im Spiel gegen die Quelle prüft. Die Liste ist zugleich die Dokumentation.

// Feste Ersetzungen ganzer Wörter (Groß-/Kleinschreibung wie angegeben).
const woerter = {
  // th -> t
  Athem: "Atem", todt: "tot", Todt: "Tot", todte: "tote", tödten: "töten", tödt: "töt", Todtenhemd: "Totenhemd",
  todtzuschlagen: "totzuschlagen", thun: "tun", thut: "tut", "Thut's": "Tut's", "thut's": "tut's", gethan: "getan",
  anthun: "antun", Thier: "Tier", Thiere: "Tiere", Thierisches: "Tierisches", thierisch: "tierisch", Thür: "Tür",
  Hausthür: "Haustür", roth: "rot", rothe: "rote", rothen: "roten", rother: "roter", Theil: "Teil", Thränen: "Tränen",
  Wirth: "Wirt", Wirthin: "Wirtin", Wirthshaus: "Wirtshaus", Gluth: "Glut", Wehmuth: "Wehmut", schwermüthig: "schwermütig",
  hirnwüthig: "hirnwütig", Lazareth: "Lazarett", verräth: "verrät", theuer: "teuer", thätig: "tätig", Thorheit: "Torheit",
  Thaler: "Taler", Handthierung: "Handtierung", Verhältniß: "Verhältnis", Bedürfniß: "Bedürfnis",
  geheimnißvoll: "geheimnisvoll", Mährchen: "Märchen",
  // ß -> ss nach kurzem Vokal
  daß: "dass", Daß: "Dass", muß: "muss", Muß: "Muss", mußt: "musst", müßt: "müsst", "müßt's": "müsst's", müßte: "müsste",
  müßten: "müssten", Kuß: "Kuss", laß: "lass", Laß: "Lass", laßt: "lasst", läßt: "lässt", Faß: "Fass", Regenfaß: "Regenfass",
  gepißt: "gepisst", pißte: "pisste", ißt: "isst", Ißt: "Isst", paßt: "passt", umfaßt: "umfasst", faßt: "fasst",
  bläßt: "bläst", wüßten: "wüssten", Vergißmeinich: "Vergissmeinich", Vergißmeinicht: "Vergissmeinnicht",
  dieß: "dies", dieße: "diese", dießen: "diesen", dießes: "dieses", Dießer: "Dieser", dießer: "dieser", Biß: "Bis",
  Schooß: "Schoß",
  // y -> i
  seyn: "sein", sey: "sei", seyd: "seid", Seyd: "Seid", bey: "bei", vorbey: "vorbei", Vorbeytanzen: "Vorbeitanzen",
  vorbeytanzen: "vorbeitanzen", Ey: "Ei", ey: "ei", Heyo: "Heio", Hey: "Hei",
  // c -> k/z in eingedeutschten Wörtern (Fremdwörter in Latein und Französisch bleiben)
  Doctor: "Doktor", DOCTOR: "DOKTOR", Doctors: "Doktors", Caserne: "Kaserne", Casernenhof: "Kasernenhof",
  Unterofficier: "Unteroffizier", UNTEROFFICIER: "UNTEROFFIZIER", Officier: "Offizier", Compagnie: "Kompanie",
  Character: "Charakter", Structur: "Struktur", Effect: "Effekt", confus: "konfus", Compliment: "Kompliment",
  Citronen: "Zitronen", Citron: "Zitron", Civilisation: "Zivilisation", Creatur: "Kreatur", Subjects: "Subjekts",
  Subject: "Subjekt", Object: "Objekt", Instinct: "Instinkt", Loupe: "Lupe", Exercirzagel: "Exerzierzagel",
  apoplectische: "apoplektische", Constitution: "Konstitution", Species: "Spezies",
  // -iren -> -ieren
  rasirt: "rasiert", rasirn: "rasiern", Rasirmesser: "Rasiermesser", manifestirt: "manifestiert",
  philosophirt: "philosophiert", probir: "probier", krepirt: "krepiert", studirt: "studiert", pressirt: "pressiert",
  explicirn: "expliziern", vegetiren: "vegetieren", Kastrirte: "Kastrierte", Füsilir: "Füsilier",
  // z -> tz, Dehnungszeichen, sonstiges
  jezt: "jetzt", Jezt: "Jetzt", sizt: "sitzt", sezt: "setzt", Plaz: "Platz", blizt: "blitzt", glizert: "glitzert",
  schwizt: "schwitzt", size: "sitze", siz: "sitz", Size: "Sitze", giebt: "gibt", Giebt: "Gibt", gieb: "gib", Gieb: "Gib",
  Brod: "Brot", unseelig: "unselig", seeligen: "seligen", ächter: "echter", Schaam: "Scham", Ueber: "Über",
  Uebergänge: "Übergänge", Aermchen: "Ärmchen", Wieviel: "Wie viel", wieviel: "wie viel", soviel: "so viel", zuviel: "zu viel",
  Hurenathem: "Hurenatem", werthester: "wertester", Thut: "Tut", rothes: "rotes", roseroth: "roserot",
  rosenroth: "rosenrot", Roth: "Rot", Infusionsthier: "Infusionstier", Sey: "Sei", Bey: "Bei", Laßt: "Lasst",
  Affect: "Affekt", Beschluß: "Beschluss", blaß: "blass", gewiß: "gewiss", naß: "nass", Roß: "Ross", Gaß: "Gass", Morgenthau: "Morgentau", Lichtmeßtag: "Lichtmesstag", Neuntödter: "Neuntöter",
  // Großschreibung von Pronomen und Adverbien
  Abends: "abends", Alles: "alles", Allem: "allem", Niemand: "niemand", Jemand: "jemand", Jedem: "jedem",
  // Zusammenschreibung
  "ganzruhig": "ganz ruhig", "inder": "in der", "inden": "in den", "einfürchterliches": "ein fürchterliches",
  "abscheulicherAberglaube": "abscheulicher Aberglaube", "Niemandertrunken": "niemand ertrunken",
  "dieWelt": "die Welt", "geschaffeStaub": "geschaffe Staub", "keiHose": "kei Hose",
};

// Wortgruppen und Apostrophe (in dieser Reihenfolge angewandt).
const gruppen = [
  [/\bJa wohl\b/g, "Jawohl"], [/\bja wohl\b/g, "jawohl"], [/\bJa, wohl\b/g, "Jawohl"],
  [/\bin's\b/g, "ins"], [/\bIn's\b/g, "Ins"], [/\büber's\b/g, "übers"], [/\bunter's\b/g, "unters"], [/\bauf's\b/g, "aufs"],
  [/\bS' ist\b/g, "'s ist"], [/\bS' is\b/g, "'s is"], [/\bs' ist\b/g, "'s ist"], [/\bs' is\b/g, "'s is"], [/\bS' kommt\b/g, "'s kommt"],
  [/\bs'ist\b/g, "'s ist"], [/\bs'is\b/g, "'s is"], [/\bS'is\b/g, "'s is"],
  [/\bn'e\b/g, "'ne"], [/\bn' Weibsbild\b/g, "'n Weibsbild"], [/\bn'en\b/g, "'nen"], [/\bn'aus\b/g, "'naus"],
  [/\bTambour-Major\b/g, "Tambourmajor"], [/\bTAMBOUR-MAJOR\b/g, "TAMBOURMAJOR"], [/\bTambour- Major\b/g, "Tambourmajor"],
  [/\bHaupt mann\b/g, "Hauptmann"], [/\bein Paar Tage(n?)\b/g, "ein paar Tage$1"], [/\bein's nach\b/g, "eins nach"], [/\bein Paar Kugeln\b/g, "ein paar Kugeln"],
  [/\bauf Paar Lippen\b/g, "auf ein Paar Lippen"],
  [/\b7 Paar\b/g, "sieben Paar"], [/\b2 Groschen\b/g, "zwei Groschen"], [/\b3 Groschen\b/g, "drei Groschen"],
  [/\b360 Monate\b/g, "dreihundertsechzig Monate"], [/\bgewöhnlichen 60\b/g, "gewöhnlichen sechzig"],
  [/\b4 Wochen\b/g, "vier Wochen"], [/\bWochen\? Herr\b/g, "Wochen? Herr"], [/\b2 Auge\b/g, "zwei Auge"],
  [/\b2 Knöpf\b/g, "zwei Knöpf"], [/\b20 solche\b/g, "zwanzig solche"], [/\b4 Hufe\b/g, "vier Hufe"],
  [/\b3 Tage und 3 Nächte\b/g, "drei Tage und drei Nächte"], [/\bAn Pfingsten 2 Jahr\b/g, "An Pfingsten zwei Jahr"],
  [/\balt 30 Jahr, 7 Monat und 12 Tage\b/g, "alt dreißig Jahr, sieben Monat und zwölf Tage"],
  [/\b10 Jahr alt\b/g, "zehn Jahr alt"], [/\bIch sag Ihr, 4\b/g, "Ich sag Ihr, vier"], [/\b1\. Platz\b/g, "ersten Platz"],
  // überholte Apostrophe bei weggefallenem e am Wortende (wär' -> wär); 's und Binnenapostrophe bleiben
  [/([A-Za-zÄÖÜäöüß])'(?=[\s.,;:!?–\-)»«]|$)/gm, "$1"],
  [/\bsteh'n\b/g, "stehn"], [/\bGreif' ihm\b/g, "Greif ihm"],
];

export function modernisiere(text) {
  let t = text;
  for (const [re, ersatz] of gruppen) t = t.replace(re, ersatz);
  t = t.replace(/[A-Za-zÄÖÜäöüß]+(?:'[A-Za-zäöüß]+)?/g, (w) => (Object.hasOwn(woerter, w) ? woerter[w] : w));
  return t;
}

// Vergleichsform für die Prüfung: Leerraum vereinheitlicht, Lehmanns Herausgeberzeichen entfernt,
// Regieanweisungs-Kursiv (_…_) aufgelöst, typografische Striche und Anführungen vereinheitlicht.
export function vergleichsform(text) {
  return text
    .replace(/\[(?:Satz bricht ab\.|\?\?)\]/g, " ")
    .replace(/_/g, " ")
    .replace(/[„“”»«"]/g, "")
    .replace(/[‚‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\.\.\.|…/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

// Namen aus den frühen Entwürfen (Lehmann setzt die endgültigen in Klammern dahinter).
export function endgueltigeNamen(text) {
  return text
    .replace(/\b(?:LOUIS|FRANZ) \[WOYZECK\]/g, "WOYZECK")
    .replace(/\b(?:MARGRETH|LOUISE|LOUISEL) \[MARIE\]/g, "MARIE")
    .replace(/\bUNTEROFFICIER \[TAMBOUR-MAJOR\]/g, "TAMBOUR-MAJOR")
    .replace(/\bUnterofficier \[Tambour- ?Major\]/g, "Tambour-Major")
    .replace(/\b(?:Louis|Louis Woyzeck) \[(Woyzeck|Franz)\]/g, "$1")
    .replace(/\b(?:Magreth|Margreth|Louisel|Magrethchen|Magrethche) \[Marie\]/g, "Marie")
    .replace(/\bLouis Woyzeck\b/g, "Woyzeck")
    .replace(/\bMargreth Marie\b/g, "Marie")
    .replace(/\bLouise Marie\b/g, "Marie")
    .replace(/\bLouisel Marie\b/g, "Marie")
    .replace(/\bFRANZ \[WOYZECK\]/g, "WOYZECK");
}
