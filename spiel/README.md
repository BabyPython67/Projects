# BRÜCKENWÄRTER – ein Klappbrücken-Spiel für den Browser

Du bist Brückenwärter im Hafen. Eine Straße kreuzt den Kanal über eine
Klappbrücke, und du bist das Gegengewicht: Solange du den Knopf hältst, hebt
sich die Brücke, lässt du los, senkt sie sich. Autos brauchen die Brücke unten,
Segler brauchen sie oben, flache Kähne passen immer drunter durch. Wer zu lange
wartet, hupt, und nach drei Hupen bist du deinen Posten los. Schaff die Schicht
von 6 bis 18 Uhr, in der der Verkehr immer dichter wird.

## Spielen

Auf jedem Gerät mit Browser, ohne Konto, ohne Installation, auch offline:

**https://babypython67.github.io/Projects/spiel/brueckenwaerter/**

Nach dem ersten Besuch liegt die Seite im Browser-Speicher (Service Worker)
und startet auch ohne Netz. Über „Zum Home-Bildschirm hinzufügen“ wird daraus
eine App mit eigenem Icon.

Lokal aus dem Repo mit einem Befehl, dann http://localhost:8000 öffnen:

```
python3 -m http.server 8000 -d spiel/brueckenwaerter
```

Die Seite läuft auch direkt aus der Datei (`spiel/brueckenwaerter/index.html`
im Browser öffnen), dann nur ohne Offline-Speicher. Keine Abhängigkeiten, kein
Build-Schritt, keine API-Keys. Anhängsel an die Adresse: `?seed=7` macht die
Schicht wiederholbar, `?autoplay=1` lässt den Autopiloten spielen, `?tempo=3`
lässt die Zeit dreimal so schnell laufen.

## Steuerung

| Eingabe | Wirkung |
|---|---|
| Knopf „Brücke heben“ oder Spielfeld gedrückt halten | Brücke hebt sich; loslassen senkt sie |
| `Leertaste`, `↑` oder `W` gedrückt halten | dasselbe mit der Tastatur |
| „Neu“ oder `N` | neue Schicht, jederzeit, ohne die Seite neu zu laden |
| „?“ oder `H` | Regeln anzeigen (Spiel pausiert) |

## Regeln

* Eine Schicht dauert 120 Sekunden, von 6 bis 18 Uhr (10 Sekunden je Stunde).
* Die Brücke braucht 1,4 Sekunden zum Heben oder Senken. Sie hebt nicht,
  solange ein Auto auf ihr ist, und senkt nicht, solange ein Segler darunter ist.
* Autos (10 Punkte) brauchen die Brücke ganz unten, Segler (40) ganz oben,
  Kähne (15) kommen immer durch. Wer nie anhalten musste, bekommt Bonus:
  Auto +5, Segler +20, Kahn +5, Rettungswagen +10.
* Geduld: Autos hupen nach 9 Sekunden Warten, Segler nach 12, Rettungswagen
  schon nach 4, und ein Rettungswagen zählt wie zwei Hupen. Wer gehupt hat,
  dreht ab.
* Verloren: drei Hupen, der Hafenmeister feuert dich.
* Gewonnen: 18 Uhr erreicht. Feierabend bringt 50 Punkte je übriger Hupe.
* Schwierigkeit: Der Abstand zwischen Autos sinkt über die Schicht von 3,2 auf
  1,3 Sekunden, zwischen Booten von 11 auf 6. Der Anteil Segler unter den Booten
  steigt von 50 auf 80 Prozent, und ab 8:24 Uhr kommen Rettungswagen.
* Der Rekord bleibt auf dem Gerät gespeichert.

## Tests

Braucht Node ab Version 18, keine Pakete:

```
node --test spiel/brueckenwaerter/tests/engine.test.js
```

`tests/engine.test.js` prüft die Spiellogik: Punkte und Bonus, Hupen, Sieg
und Niederlage, Blockieren der Brücke, steigende Schwierigkeit, Neustart,
Determinismus und die Balance des Autopiloten.

```
node --test spiel/brueckenwaerter/tests/smoke.test.js
```

`tests/smoke.test.js` öffnet die Seite in einem Handy-Viewport und spielt
über die echte Oberfläche: eine komplette Schicht mit dem Autopiloten samt
Endbildschirm und Neustart, den Hebel per Finger und Tastatur, eine Schicht,
die durch Nichtstun mit drei Hupen endet, und den Offline-Start aus dem
Service Worker bei abgeschaltetem Server. Dafür muss Playwright installiert
sein (`npm install playwright && npx playwright install chromium`), sonst
werden diese Tests übersprungen.

## Entscheidungen

* **Browser statt Terminal, eine Seite, kein Build:** `index.html` plus
  `engine.js` werden von GitHub Pages unverändert ausgeliefert und laufen auch
  aus der Datei. So ist das Spiel auf Handy, Tablet und Rechner erreichbar.
* **Offline über Service Worker und Manifest:** `sw.js` legt die sieben
  Dateien beim ersten Besuch ab und lädt im Hintergrund nach, falls es etwas
  Neues gibt. Das Manifest macht die Seite installierbar.
* **Halten statt Umschalten:** Der Spieler ist das Gegengewicht. Ein einziger
  Knopf, den man gedrückt hält, funktioniert mit Daumen, Maus und Tastatur
  gleich gut und erzeugt die Spannung: Jede Sekunde oben ist eine Sekunde, in
  der sich Autos stauen.
* **Logik getrennt von Darstellung, deterministisch:** `engine.js` kennt weder
  Canvas noch Eingabe und läuft mit festen Zeitschritten und einer Startzahl.
  Dadurch lässt sich jede Regel in Node testen, und `?seed=` macht Schichten
  vergleichbar.
* **Balance per Simulation:** Der Autopilot (`choose` in `engine.js`) gewinnt
  rund 90 Prozent seiner Schichten, hört dabei aber im Schnitt eine Hupe. Wer
  nie hebt, verliert nach etwa 90 Sekunden, wer immer hebt, nach 17.
* **Ordner `spiel/brueckenwaerter/`:** `spiel/` enthielt bereits Deichgraf
  (siehe unten) mit fester Pages-Adresse. Das neue Spiel liegt daneben, damit
  alte Links weiter funktionieren.

## Außerdem in diesem Ordner: Deichgraf

Das Sturmflut-Spiel fürs Terminal und Handy ist in [DEICHGRAF.md](DEICHGRAF.md)
beschrieben. Es läuft unter https://babypython67.github.io/Projects/spiel/ und
mit `python3 spiel/deichgraf.py`.
