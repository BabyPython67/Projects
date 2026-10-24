# DEICHGRAF – ein Sturmflut-Spiel fürs Terminal

Du bist der Deichgraf eines kleinen Dorfs an der Nordsee. Eine Sturmwoche mit
sieben Nächten steht bevor, und jede Nacht läuft die Flut höher auf als die davor.
Du läufst auf dem Deich hin und her, stapelst Sandsäcke und hältst das Wasser
draußen, während Brecher immer wieder Löcher in den Deich schlagen.

## Start

```
python3 spiel/deichgraf.py
```

Braucht nur Python 3 (ab 3.8), keine Pakete, kein Internet, keine Konten.
Optionen: `--seed 42` (wiederholbare Partie), `--autoplay` (der Autopilot
spielt vor), `--ascii` (ohne Blockgrafik, falls das Terminal sie nicht kann).

## Steuerung

| Taste | Wirkung |
|---|---|
| `a` / `←` | einen Abschnitt nach links gehen |
| `d` / `→` | einen Abschnitt nach rechts gehen |
| `s` / Leertaste | Sandsack auf den Abschnitt legen, auf dem du stehst |
| `w` / Enter | Stunde abwarten (restliche Aktionen verfallen) |
| `n` | neues Spiel, jederzeit |
| `q` | beenden |

## Regeln

* Die Sturmwoche hat 7 Nächte zu je 6 Stunden. Pro Stunde hast du 7 Aktionen:
  gehen oder einen Sandsack legen (jeweils eine Aktion).
* Am Ende jeder Stunde treffen Brecher die angezeigten Abschnitte und senken sie
  um 1. Danach springt der Pegel auf den Wert der Flutkurve.
* Jeder Abschnitt, der niedriger als der Pegel ist, bricht. Ein Deichbruch
  kostet ein Haus, höchstens eines pro Stunde. Ohne Häuser ist das Spiel
  verloren.
* Punkte: pro gehaltener Stunde `Pegel × Nacht`, pro Nacht ohne Bruch `25 × Nacht`
  Bonus, beim Sieg 100 je gerettetem Haus.
* Schwierigkeit: Der Höchstpegel steigt jede Nacht um 1 (von 5 auf 11), und ab
  Nacht 4 bzw. 7 schlagen pro Stunde zwei bzw. drei Brecher ein.
* Gewonnen hast du, wenn die siebte Nacht vorbei ist und noch ein Haus steht.

## Tests

```
python3 -m unittest discover -s spiel/tests -v
```

`tests/test_engine.py` prüft die Spiellogik (Punkte, Sieg/Niederlage,
Schwierigkeit, Neustart), `tests/test_smoke.py` startet das Spiel als eigenen
Prozess und spielt eine komplette Partie über die Tasteneingabe durch, inklusive
Neustart; außerdem spielt der Autopilot zwei Partien am Stück.

## Entscheidungen

* **Terminal statt Browser, nur Standardbibliothek:** ein Befehl zum Starten,
  nichts zu installieren, läuft auf Linux, macOS und Windows.
* **Rundenbasiert statt Echtzeit:** jede Taste ist ein Zug. So lässt sich die
  Logik ohne Terminal testen, und der Smoke-Test kann das echte Programm über
  stdin fernsteuern.
* **Logik und Darstellung getrennt:** `deich/engine.py` kennt keine Ein-/Ausgabe,
  `deich/render.py` malt den Deich-Querschnitt, `deich/ui.py` liest Tasten.
* **Balance per Simulation:** der Autopilot (`deich/bot.py`) gewinnt mit den
  Standardwerten rund 85 % seiner Partien, verliert dabei aber Häuser. Ein
  aufmerksamer Mensch kann gewinnen, muss sich aber anstrengen.
