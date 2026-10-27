# Projects

Kleine Spiele zum Zeitvertreib, alle für Finger und Maus im Browser. GitHub Pages liefert
alles von `main` aus, jedes Spiel hat einen eigenen Ordner mit eigenem README und eine
eigene Adresse, die Startseite verlinkt alle:

| | Ordner | Adresse |
|---|---|---|
| Startseite | `index.html` | https://babypython67.github.io/Projects/ |
| Johannisnacht, Glühwürmchen mit einer Schlinge aus Licht fangen | [johannisnacht/](johannisnacht/) | https://babypython67.github.io/Projects/johannisnacht/ |
| Deichgraf, Sturmflut-Spiel, rundenbasiert (Handy und Terminal) | [deichgraf/](deichgraf/) | https://babypython67.github.io/Projects/deichgraf/ |
| Brückenwärter, Klappbrücke im Hafen bedienen, Echtzeit, läuft offline | [brueckenwaerter/](brueckenwaerter/) | https://babypython67.github.io/Projects/brueckenwaerter/ |

## Alte Adressen

[spiel/](spiel/) enthält nur noch Weiterleitungen: `spiel/` führt zu `deichgraf/`,
`spiel/brueckenwaerter/` zu `brueckenwaerter/`, jeweils mit Anhängseln wie `?seed=7`. Für
Brückenwärter liegt dort zusätzlich ein Umzugs-Service-Worker, der den alten Offline-Speicher
leert, Einzelheiten in [spiel/README.md](spiel/README.md).

## Tests

Alle Suiten laufen ohne Pakete mit Python 3 und Node ab 18; die Browser-Tests brauchen
zusätzlich Playwright (`npm install playwright && npx playwright install chromium`) und werden
ohne Playwright übersprungen.

```
python3 -m unittest discover -s deichgraf/tests
node --test deichgraf/tests/*.test.js
node --test brueckenwaerter/tests/*.test.js
```

Johannisnacht hat keine Tests (eine einzelne Datei ohne getrennte Spiellogik).

`.nojekyll` sorgt dafür, dass Pages die Dateien unverändert ausliefert, statt sie durch Jekyll
zu schicken (ohne die Datei zeigt Pages für Ordner ohne `index.html` deren README an).

## Aufräumen

Was beim Aufräumen geändert wurde und warum:

* **`__pycache__` entfernt, `.gitignore` angelegt.** Die eingecheckten `.pyc`-Dateien waren
  Bytecode einer bestimmten Python-Version und bei jedem Testlauf anders. `.gitignore` schließt
  Python-Cache, `node_modules/`, Playwright-Berichte und Editor-Dateien künftig aus.
* **Jedes Spiel in einem eigenen Ordner.** `spiel/` enthielt Deichgraf und darin verschachtelt
  Brückenwärter, mit zwei Beschreibungen (`README.md` für Brückenwärter, `DEICHGRAF.md` für
  Deichgraf) im selben Ordner. Jetzt: `deichgraf/` (Terminal- und Browser-Fassung, Tests) und
  `brueckenwaerter/`, jeweils mit eigenem README. Alle Pfade in Tests und READMEs angepasst.
* **Weiterleitungen statt gelöschter Adressen.** `spiel/index.html` und
  `spiel/brueckenwaerter/index.html` leiten zu den neuen Adressen weiter (Meta-Refresh plus
  JavaScript, das Anhängsel mitnimmt), damit Links und Home-Bildschirm-Verknüpfungen weiter
  funktionieren.
* **Umzugs-Service-Worker für Brückenwärter.** Der alte Service Worker lieferte zuerst aus dem
  Speicher, eine reine Weiterleitungsseite hätte Home-Bildschirm-Nutzer nie erreicht.
  `spiel/brueckenwaerter/sw.js` ersetzt ihn beim nächsten Öffnen mit Netz, leert den alten
  Speicher, schickt die Seite zur neuen Adresse und meldet sich ab. Der neue Service Worker unter
  `brueckenwaerter/` nutzt dafür einen eigenen Speicher-Namensraum (`brueckenwaerter/…` statt
  `brueckenwaerter-v1`) und löscht nur eigene alte Stände, damit die alte Fassung offline spielbar
  bleibt, bis der Umzug gelaufen ist. `brueckenwaerter/tests/umzug.test.js` prüft beides im
  Browser; dafür liegt der alte Service Worker als Kopie in `brueckenwaerter/tests/fixtures/`.
* **Brückenwärter-Smoke-Test entflackert.** Die Prüfung „Nichtstun endet mit drei Hupen“ las die
  Hupen-Anzeige direkt nach dem Neustart, bevor das nächste Bild gezeichnet war, und schlug
  gelegentlich fehl (einmal in fünf Läufen). Sie wartet jetzt auf das Neuzeichnen; am Spiel
  wurde nichts geändert.
* **`london-sporttag/` entfernt.** Der Ordner enthielt nur noch eine Weiterleitung zur
  Johannisnacht für Links auf die gelöschte London-Karte; ohne Ersatz gestrichen.
* **Startseite und dieses README** verlinken und beschreiben alle Spiele; die Startseite hatte
  Brückenwärter vorher gar nicht aufgeführt.
* **Gemergte `claude/…`-Branches.** Die vier Branches `claude/blissful-ptolemy-8kfmux`,
  `claude/interactive-course-overview-421ory`, `claude/spiel-game-development-q5kktt` und
  `claude/spiel-game-development-xm77in` sind vollständig in `main` enthalten und können gelöscht
  werden. Aus der Arbeitsumgebung heraus war das Löschen nicht erlaubt (403 vom Git- und
  API-Proxy), deshalb steht die Liste hier zum Löschen von Hand (GitHub: Branches, Papierkorb).
