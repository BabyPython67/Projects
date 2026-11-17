// Register der Werke. Purgatorio und Paradiso lassen sich später als
// weitere Einträge mit eigenen Abschnitten und Versen ergänzen; Spielstand,
// Merkbuch und Gesangsbuch sind pro Werk angelegt.
export const WERKE = {
  inferno: {
    titel: 'Inferno',
    teil: 'Die Hölle',
    verse: 'daten/inferno/verse-philalethes.json',
    versQuelle: 'Philalethes (1839–1849)',
    abschnitte: [
      '01-wald', '02-vorhoelle', '03-limbus', '04-liebende', '05-regen', '06-lasten',
      '07-styx', '08-dis', '09-graeber', '10-gewalt', '11-malebolge', '12-verrat',
    ].map(n => `daten/inferno/text/${n}.txt`),
    anfang: 'wald:',
  },
  // purgatorio: { titel: 'Purgatorio', teil: 'Das Fegefeuer', ... }  – folgt vielleicht
  // paradiso:   { titel: 'Paradiso',   teil: 'Das Paradies',  ... }  – folgt vielleicht
};
