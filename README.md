# Projects

Kleine Spiele zum Zeitvertreib, alle für Finger und Maus im Browser. GitHub Pages liefert
alles von `main` aus. Jedes Spiel hat unter `spiele/` einen eigenen Ordner mit eigenem README
und eine eigene Adresse, die Startseite verlinkt alle:

| | Ordner | Adresse |
|---|---|---|
| Startseite | `index.html` | https://babypython67.github.io/Projects/ |
| **Woyzeck**, ein Spiel, das man liest: Büchners Woyzeck als Textspiel, du bist Andres an seiner Seite (neu) | [spiele/woyzeck/](spiele/woyzeck/) | https://babypython67.github.io/Projects/spiele/woyzeck/ |
| Carreau, Boule unter Platanen: Dorfpartien auf immer neuen Plätzen, Können statt Würfel | [spiele/carreau/](spiele/carreau/) | https://babypython67.github.io/Projects/spiele/carreau/ |
| Rungholt, Würfel-Roguelike: eine Nacht durchs Watt zur versunkenen Stadt | [spiele/rungholt/](spiele/rungholt/) | https://babypython67.github.io/Projects/spiele/rungholt/ |
| Moorlicht, Laternen-Roguelite: Funken ziehen, Licht gegen Kälte, eine Geschichte über viele Nächte | [spiele/moorlicht/](spiele/moorlicht/) | https://babypython67.github.io/Projects/spiele/moorlicht/ |
| Johannisnacht, Glühwürmchen mit einer Schlinge aus Licht fangen | [spiele/johannisnacht/](spiele/johannisnacht/) | https://babypython67.github.io/Projects/spiele/johannisnacht/ |
| Deichgraf, Sturmflut-Spiel, rundenbasiert (Handy und Terminal) | [spiele/deichgraf/](spiele/deichgraf/) | https://babypython67.github.io/Projects/spiele/deichgraf/ |
| Brückenwärter, Klappbrücke im Hafen bedienen, Echtzeit, läuft offline | [spiele/brueckenwaerter/](spiele/brueckenwaerter/) | https://babypython67.github.io/Projects/spiele/brueckenwaerter/ |

## Aufbau

```
Projects/
├── index.html            Startseite
├── 404.html              leitet alte Adressen an die neue Stelle unter spiele/ weiter
├── README.md             diese Übersicht
├── .nojekyll             Pages liefert die Dateien unverändert aus (ohne Jekyll)
├── .gitignore            node_modules, Testberichte, Python-Cache, Editor-Dateien
├── spiele/               ein Ordner pro Spiel, jeder mit README, Tests und eigener Adresse
│   ├── woyzeck/          Textspiel nach Büchner (neu)
│   ├── carreau/          Boule unter Platanen
│   ├── rungholt/         Würfel-Roguelike im Watt
│   ├── moorlicht/        Laternen-Roguelite im Moor
│   ├── johannisnacht/    Glühwürmchen fangen
│   ├── deichgraf/        Sturmflut, Browser- und Terminal-Fassung
│   └── brueckenwaerter/  Klappbrücke im Hafen
└── vergleich/            Bericht Rungholt gegen Moorlicht, Seite und Messwerkzeug
```

Ein neues Spiel bekommt einen Ordner `spiele/<name>/`, eine Karte oben auf der Startseite und eine
Zeile oben in der Tabelle.

**Alte Adressen.** Bis zum 29.10.2026 lagen die Spiele direkt im Hauptordner (`…/Projects/carreau/`),
Deichgraf und Brückenwärter davor unter `spiel/`. Für jede Adresse, die es nicht gibt, zeigt Pages die
`404.html`; sie schickt alte Adressen samt Anhängseln (`?seed=7`) an die neue Stelle. Spielstände im
Browser bleiben erhalten, weil sie an der Domain hängen und nicht am Ordner. Eine App auf dem
Home-Bildschirm hat dagegen eigenen Speicher und muss von der neuen Adresse neu hinzugefügt werden.

## Vergleich Rungholt gegen Moorlicht

Rungholt (Claude Fable 5.1) und Moorlicht (Claude Opus 5.5) entstanden aus fast demselben Auftrag.
Der Vergleich steht als Seite zum Durchklicken unter
https://babypython67.github.io/Projects/vergleich/ ([vergleich/index.html](vergleich/index.html)) und als
Text in [vergleich/BERICHT.md](vergleich/BERICHT.md); Messwerkzeug und Rohdaten liegen in
[vergleich/werkzeuge/](vergleich/werkzeuge/). Die Belege verweisen auf den Stand beim Schreiben
(Commit `7419d05`), damit Zeilennummern und Pfade stimmen. Spätere Spielinhalte stehen dort nur in
zugeklappten Spoiler-Abschnitten.

## Tests

Alle Suiten laufen aus dem Hauptordner, ohne Pakete mit Python 3 und Node ab 18; die
Browser-Tests brauchen zusätzlich Playwright (`npm install playwright && npx playwright install
chromium`) und werden ohne Playwright übersprungen (Woyzeck: schlägt dann fehl, siehe dessen README).

```
python3 -m unittest discover -s spiele/deichgraf/tests
node --test spiele/deichgraf/tests/*.test.js
node --test spiele/brueckenwaerter/tests/*.test.js
node --test spiele/rungholt/tests/*.test.js
node --test spiele/moorlicht/tests/engine.test.js
node --test spiele/moorlicht/tests/smoke.test.js
node --test spiele/carreau/test/*.test.mjs
node --test spiele/woyzeck/tests/logik.test.mjs spiele/woyzeck/tests/inhalt.test.mjs
node --test spiele/woyzeck/tests/browser.test.mjs
```

Johannisnacht hat keine Tests (eine einzelne Datei ohne getrennte Spiellogik). Der Browser-Test von
Deichgraf prüft auch die Startseite und die Weiterleitungen der `404.html`.
