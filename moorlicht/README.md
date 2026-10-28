# Moorlicht

Ein Laternen-Roguelite für den Browser, gebaut für iPad und Handy, komplett per Touch spielbar.

In jeder Johannisnacht trägt jemand aus Fennhusen das Licht über das Große Moor zum Lichtturm. Letztes
Jahr ging Alma, deine Schwester, und kam nicht zurück. Jetzt trägst du die Laterne. An jeder Station
ziehst du Funken aus deinem Glas: Glühwürmchen und Käfer bringen Licht, Irrlichter bringen Kälte. Reicht
das Licht gegen das Dunkel, gehst du weiter. Wirst du gierig und die Kälte steigt über die Schwelle,
erlischt die Laterne. Geht der Docht aus, beginnt die Johannisnacht von vorn, und nur du erinnerst dich.

## Spielen

**https://babypython67.github.io/Projects/moorlicht/** (sobald `main` über GitHub Pages ausgeliefert wird)

Ohne Konto, ohne API-Keys, ohne Build-Schritt und ohne Dateien von fremden Servern: Alles liegt in diesem
Ordner, Klang und Grafik entstehen zur Laufzeit. Lokal aus dem Repo-Hauptordner starten und
http://localhost:8000 öffnen:

```
python3 -m http.server 8000 -d moorlicht
```

(gleichwertig: `cd moorlicht && npm start`). `moorlicht/index.html` lässt sich auch direkt im Browser
öffnen. Über „Zum Home-Bildschirm“ wird auf dem iPad eine Vollbild-App daraus. Spielstand, Fortschritt und
eine angefangene Nacht liegen im `localStorage` des Browsers (`moorlicht.v1`); wer die Seite schließt,
kann die Nacht später über „Nacht fortsetzen“ weiterspielen.

Anhängsel an die Adresse: `?seed=7` macht jede neue Nacht gleich, `?tempo=8` beschleunigt alle
Animationen (für Tests).

## So wird gespielt

| | |
|---|---|
| Station | „Funken ziehen“ holt einen zufälligen Funken aus dem Glas in die Laterne. Licht zählt gegen das **Dunkel** der Station, Kälte gegen die **Kälte-Schwelle** (Start: 7). |
| Weitergehen | Jederzeit. Licht ≥ Dunkel: bestanden, Glanz = Grundlohn + Überschuss (höchstens 10), danach darfst du einen von drei Funken fangen. Licht < Dunkel: je angefangene 3 fehlende Licht 1 Docht. |
| Erlöschen | Kälte über der Schwelle: −2 Docht, kein Glanz. Johanniskraut oder Bienenwachs retten eine flackernde Laterne. |
| Anzeige | „Risiko“ nennt die genaue Wahrscheinlichkeit, dass der nächste Funke die Laterne löscht; darunter steht alles, was noch im Glas ist, und der Knopf „Weitergehen“ zeigt vorher, was er bringt oder kostet. |
| Karte | Drei Regionen (Birkenbruch, Torfstiche, Schwarzes Wasser) mit je vier Reihen und einem Wächter. Pfad, Nebelbank (hart, Talisman als Lohn), Fund (Geschichte mit Entscheidung), Lagerfeuer (Docht flicken oder Glas sichten), Krämerin (Funken, Kräuter, Talismane, Austreiben). |
| Wächter | Die Nebelfrau (Schwelle −2), der Moorkönig (jedes Irrlicht vergrößert das Dunkel), das große Irrlicht am Turm (drei Irrlichter mehr im Glas, dafür bringt jedes Irrlicht Licht). Wächter muss man bestehen, jeder Fehlversuch kostet Docht. Nach jedem Wächter schließt sich ein Irrlicht an. |
| Dorf | Gespräche im Krug, Erinnerungen ausgeben, Laterne und Mondphase wählen, Pims Naturkundebuch, Almas Notizen, Nacht des Tages. |

Tastatur (für den Rechner): Leertaste zieht, Enter geht weiter, M schaltet den Ton.

## Was das Spiel reizvoll macht

### Langzeitmotivation

* **Die Geschichte rückt mit jeder Nacht vor, auch mit jeder verlorenen.** Wie in *Hades* ist das
  Scheitern Teil der Erzählung: Die Johannisnacht wiederholt sich, nur du merkst es. Hedda, Jasper und Pim
  sagen nach jeder Nacht etwas Neues, abhängig davon, wie weit du kamst und was du gefunden hast. Acht
  Seiten aus Almas Tagebuch liegen verstreut im Moor (die erste ungelesene meist beim ersten Fund einer
  Nacht). Sie erzählen, was die Irrlichter sind und was der Turm braucht. Ein Sieg mit allen acht Seiten
  löst das wahre Ende aus. Warum: Ein offenes Rätsel ist der stärkste Grund für „noch eine Nacht“.
* **Erinnerungen als dauerhafte Freischaltungen.** Jede Nacht bringt Erinnerungen (bestandene Stationen,
  Wächter, Notizen, Sieg). Damit schaltet man vier neue Funkenarten, sechs weitere Talismane, zwei
  Laternen, den Kräuterbeutel und einen Extra-Docht frei. Warum: Freischaltungen erweitern vor allem die
  Möglichkeiten statt die rohe Stärke, so wie *Slay the Spire* neue Karten freischaltet. Die Nächte bleiben
  spannend, und jede Freischaltung erklärt sich in der nächsten Nacht von selbst.
* **Mondphasen als Leiter.** Jeder Sieg schaltet die nächste von fünf Mondphasen frei, jede macht die
  Nacht härter (mehr Dunkel, ein Irrlicht mehr, schwächere Rast, stärkere Wächter, weniger Docht) und
  bringt mehr Erinnerungen. Warum: Wer die Geschichte durch hat, hat ein klares nächstes Ziel.
* **Sammeln und Wiederkommen.** Pims Naturkundebuch füllt sich mit jeder Funkenart und jedem Talisman
  (mit kleinen Feldnotizen), die **Nacht des Tages** liefert jeden Tag dasselbe Moor zum Wiederholen und
  merkt sich den weitesten Weg. Jede Nacht ist anders: neue Karte, andere Besonderheiten, andere Funde.

### Spielgefühl

* **Jeder Zug hat Wucht.** Der Funke fliegt mit Leuchtspur aus dem Glas in die Laterne. Beim Aufprall
  sprühen Funken, die Flamme zuckt hoch, eine Zahl steigt auf, der Lichtkreis wächst und gibt mehr vom Moor
  frei, und der Nebel weicht zurück. Großer Leuchtkäfer und Gleichtakt-Ketten bringen dazu einen
  Lichtblitz und ein kurzes Wackeln. Warum: „Maximale Rückmeldung für minimale Eingabe“, wie es
  *Juice it or lose it* vorführt.
* **Kälte, die man spürt.** Irrlichter fliegen in Schlangenlinien, klingen als kalter Tritonus, lassen die
  Flamme bläulich flackern, und vom Bildrand wachsen Eiskristalle herein. Ab 50 % Risiko schlägt ein Herz.
* **Erlöschen als Höhepunkt.** Kurzer Halt (Hit-Stop), starkes Beben des ganzen Bildes, die Laterne
  zerspringt in Splitter, dumpfer Schlag mit Glasklirren, Vibration auf Android, dann Dunkelheit.
  Bestehen ist das Gegenstück: Akkord, Nebel löst sich auf, Glanz-Münzen fliegen klingelnd in die Anzeige.
  Warum: *The Art of Screenshake* zeigt, dass gerade die Stärke solcher Ausschläge, abgestuft nach
  Wichtigkeit, Treffer gewichtig macht.
* **Der Klang aus Johannisnacht.** Die Glühwürmchen klingen wie dort als Glöckchen in D-Dur-Pentatonik mit
  Echo. Hier steigen sie mit jedem Zug eine Stufe höher, so dass eine lange, gierige Reihe hörbar zur
  Melodie wird. Dazu Grillen und Wind. Alles entsteht live mit Web Audio.

### Spannende Entscheidungen

* **Ziehen oder gehen**, bei jedem einzelnen Funken. Weiterziehen bringt Glanz (für die Krämerin) und mehr
  Sicherheit gegen das Dunkel, riskiert aber zwei Docht. Weil das genaue Risiko und das Ergebnis des
  Weitergehens immer angezeigt werden, ist jede Niederlage eine eigene Entscheidung, nie Willkür
  (der Gedanke hinter *Into the Breach*). Johanniskraut und Bienenwachs machen aus dem Erlöschen noch
  einmal eine Wahl.
* **Das Glas bauen.** Nach jeder Station einen von drei Funken fangen, oder keinen (ein kleines Glas ist
  berechenbarer). An Lagerfeuer und Krämerin Irrlichter loswerden oder Docht flicken. Mehrere Wege führen
  zum Turm: Gleichtakt-Ketten (wachsen mit jedem Käfer), Mondmotten als Verdoppler für Leuchtkäfer,
  Nachtfalter und Mondstein gegen Kälte, Johanniswürmchen zum Wärmen, Glutkäfer und Kupferglocke für Glanz,
  das gebundene Irrlicht als Wagnis. Drei Laternen geben unterschiedliche Startpunkte.
* **Den Weg wählen.** Die Karte zeigt alle Orte samt Dunkel und Besonderheit vorab. Nebelbank für einen
  Talisman oder sicherer Pfad? Lagerfeuer oder Krämerin vor dem Wächter?
* **Funde mit echten Abwägungen**, etwa: Almas Zunder (jede Station startet mit Licht) gegen ein dauerhaftes
  Irrlicht, ein Tanz mit den Irrlichtern (zwei weniger im Glas) gegen zwei Docht, ein Hünengrab mit 50 %.
* **Nachweis, dass Abwägen zählt:** Die Simulation (`tools/simulation.js`, 1000 Nächte je Stil, Sturmlaterne,
  Neumond, ohne Freischaltungen) lässt drei Spielweisen gegeneinander antreten:

  | Stil | erster Wächter | zweiter Wächter | Sieg |
  |---|---|---|---|
  | abwägend (zieht bis etwa 20 % Risiko, wenn das Licht reicht) | 75 % | 43 % | 21 % |
  | Draufgänger (zieht bis 65 % Risiko) | 18 % | 1 % | 0,3 % |
  | Angsthase (geht beim kleinsten Risiko) | 55 % | 21 % | 6 % |

  Mit allen Freischaltungen gewinnt der abwägende Bot 28 %, auf Vollmond 2 %. Ein Mensch, der die Karte
  plant und das Glas gezielt baut, sollte deutlich besser sein als der Bot, der das kaum tut.

### Welt und Atmosphäre

* **Ein Ort mit eigener Sage.** Fennhusen am Großen Moor, die Johannisnacht (die Glühwürmchen-Nacht aus
  Johannisnacht), der Brauch des Lichttragens, der dunkle Lichtturm am Schwarzen Wasser. Drei Regionen
  sehen unterschiedlich aus: weiße Birken, Torfstiche mit versunkenem Kran, ein See ohne Spiegelbild mit dem
  Turm am Horizont. Das Dorf liegt im Abendrot mit warmen Fenstern; gewinnt man, wird es Morgen und der
  Turm brennt.
* **Die Mechanik erzählt die Geschichte mit** (Umgebungs-Erzählen nach Smith und Worch): Wer gierig nach
  Licht wird, erlischt, und die Erloschenen werden Irrlichter. Das steht in Jaspers Sagen, in Almas
  Notizen und in der Spielregel selbst. Am Ende kippt die Regel: Beim großen Irrlicht bringen Irrlichter
  Licht, und das gebundene Irrlicht schaltet sich erst frei, wenn man ihm begegnet ist.
* **Die Laterne ist die Kamera.** Das Moor ist dunkel, nur der Lichtkreis zeigt die Umgebung, und er wächst
  mit dem Licht, das man zieht. Atmosphäre und Spielstand sind dasselbe Bild.
* **Figuren statt Menü-Texte**: Hedda (Wirtin), Jasper (Torfstecher), Pim (Nachbarskind mit dem
  Naturkundebuch), die Krämerin, die Fährfrau. Alle Texte sind auf Deutsch und kurz genug für den Daumen.

## Neues Spiel statt Ausbau, und warum

Ich habe ein neues Spiel gebaut statt eins der drei auszubauen. Johannisnacht, Deichgraf und
Brückenwärter tragen ihren Kern in Geschicklichkeit oder fester Abfolge (Schlinge ziehen, Sandsäcke
stapeln, Knopf halten). Langzeitmotivation und echte Abwägungen hätten sich dort nur danebenhängen
lassen, der Kern wäre derselbe geblieben, und genau der hat nach ein paar Partien nichts Neues mehr
geboten. Moorlicht baut deshalb vom Kern aus auf Entscheidungen (ziehen oder gehen, Glas bauen, Weg
wählen) und auf Fortschritt über viele Nächte, und übernimmt gezielt, was an den alten Spielen gut war:
den Glöckchenklang und die Glühwürmchen-Welt der Johannisnacht (sogar dieselben Arten: *Photinus
pyralis*, der Gleichtakt-Käfer *Photinus carolinus*, das heimische Johanniswürmchen) und die abendliche
Ortsstimmung aus Johannisnacht und Brückenwärter. Die alten Spiele bleiben unverändert spielbar.

## Weitere Entscheidungen

* **Genre:** Push-your-luck mit Beutel-Bau (angeregt vom Brettspiel *Die Quacksalber von Quedlinburg*, aus
  eigenem Wissen) plus Routenkarte und Meta-Fortschritt wie in Roguelites. Gut für kurze Sitzungen: Eine
  Station dauert Sekunden, eine Nacht 10 bis 20 Minuten, und man kann jederzeit unterbrechen.
* **Technik:** reines HTML, CSS und JavaScript ohne Bibliotheken und Build-Schritt, Grafik auf einem Canvas
  (prozedural gezeichnet), Klang per Web Audio, Bedienung über große Knöpfe statt Gesten, damit es auf
  Handy und iPad gleich gut geht. Systemschriften statt Webfonts, damit nichts von außen nachgeladen wird.
* **Spiellogik getrennt von der Oberfläche** (`js/engine.js` ohne DOM, ein Lauf ist reines JSON), damit sie
  sich testen, simulieren und speichern lässt.
* **Balance per Simulation:** Dunkel-Werte und Wächter wurden mit Bots abgestimmt, bis der abwägende Bot
  ohne Freischaltungen etwa jede fünfte Nacht gewinnt. Dabei fielen zwei Fehler im Entwurf auf und wurden
  behoben: quadratisch wachsende Gleichtakt-Ketten (jetzt höchstens 4 Licht je Käfer) und ein zu leichtes
  Ende, weil ein großes Glas die Irrlichter verdünnt (jetzt schließt sich nach jedem Wächter ein Irrlicht
  an, und die dritte Region ist deutlich dunkler).
* **Fairness:** Alles Zufällige hängt an einem Seed; die Nacht des Tages nimmt das Datum als Seed.
* **Erste Nacht:** zwei kurze Hinweise statt eines Tutorials, Regeln jederzeit über „?“ oder das Menü.

## Recherche

Live im Web recherchiert (Oktober 2026). Was ich daraus übernommen habe:

1. **Martin Jonasson und Petri Purho, „Juice it or lose it“** (Nordic Game 2012),
   https://www.gamedeveloper.com/design/video-is-your-game-juicy-enough- – Übernommen: „maximale
   Rückmeldung für minimale Eingabe“, deshalb hat jeder einzelne Zug Flug, Funken, Zahl, Klang und
   wachsendes Licht.
2. **Jan Willem Nijman, „The Art of Screenshake“** (Vlambeer, INDIGO 2013), gelistet unter
   https://kenney.nl/learn/must-see-videos-for-indie-developers – Übernommen: Wackeln, Hit-Stop und Blitz,
   abgestuft nach Bedeutung, mit dem Erlöschen als stärkstem Ausschlag.
3. **Sid Meier, „Interesting Decisions“** (GDC 2012),
   https://gamedeveloper.com/design/video-sid-meier-explores-interesting-decisions-in-gameplay –
   Übernommen: Das Spiel besteht aus vielen kleinen Entscheidungen mit echten Gegengewichten, und der Spieler
   bekommt genug Rückmeldung, um sie zu treffen.
4. **Subset Games, „Into the Breach“ Design Postmortem** (GDC 2019),
   https://gdcvault.com/play/1025772/-Into-the-Breach-Design, und die UX-Analyse
   https://blog.prototypr.io/into-the-breachs-ux-makes-you-feel-smart-a9cb03210757 – Übernommen: perfekte
   Information, also exaktes Risiko in Prozent, Inhalt des Glases und Vorschau des Weitergehens, damit
   jede Niederlage die eigene ist.
5. **Greg Kasavin über *Hades*** (Interview bei Tom’s Guide),
   https://www.tomsguide.com/uk/features/hades-exclusive-interview-supergiant – Übernommen: Scheitern treibt
   die Geschichte voran, eine Zeitschleife erklärt das Wiederholen, Figuren reagieren auf den Fortschritt.
6. **Harvey Smith und Matthias Worch, „What Happened Here? Environmental Storytelling“** (GDC 2010),
   https://gdcvault.com/play/1012647/What-Happened-Here-Environmental – Übernommen: Die Prämisse spiegelt
   sich in Ort und Regeln („Echos“): Gier nach Licht lässt erlöschen, die Erloschenen sind die Irrlichter.
7. **Daniel Cook, „Loops and Arcs“** (Lostgarden 2012), https://lostgarden.com/2012/04/30/loops-and-arcs –
   Übernommen: eine wiederholbare Schleife (ziehen oder gehen) verbunden mit einem Bogen, der sich nicht
   wiederholt (Almas Geschichte mit Ende).
8. **Meta-Progression in Roguelikes** (Glossar https://www.gamebrief.net/glossary/meta-progression und
   die Notiz https://notes.hamatti.org/Gaming/Video-games/Meta-progression-with-gradual-tutorial-in-roguelike-games)
   – Übernommen: Freischaltungen als schrittweises Tutorial, die Möglichkeiten erweitern statt die Nächte
   zu trivialisieren, plus eine Schwierigkeitsleiter wie die Ascension von *Slay the Spire*.
9. ***Dorfromantik*** (https://en.wikipedia.org/wiki/Dorfromantik) – Übernommen: ruhige Präsentation,
   ein einfacher Kern mit Aufgaben, die neue Inhalte freischalten, und Sitzungen, die man jederzeit beenden
   kann.

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html`, `stil.css`, `icon.svg` | Seite, Gestaltung, Symbol |
| `js/inhalt.js` | alle Inhalte als Daten: Funken, Talismane, Kräuter, Orte, Wächter, Funde, Notizen, Gespräche, Texte |
| `js/engine.js` | Spiellogik ohne DOM: Zufall mit Seed, Karte, Station, Belohnungen, Auswertung, Meta-Fortschritt |
| `js/klang.js` | Klang mit Web Audio |
| `js/spiel.js` | Oberfläche, Canvas-Szene, Animationen, Eingabe, Speichern |
| `tests/engine.test.js` | Logik-Tests |
| `tests/smoke.test.js` | Browser-Test im Handy- und iPad-Viewport |
| `tests/bot.js`, `tools/simulation.js` | Bot-Spieler und Balance-Simulation |
| `package.json` | Skripte und Playwright als Entwicklungsabhängigkeit |

## Tests

Logik-Tests, nur Node ab 18, keine Pakete (aus dem Repo-Hauptordner):

```
node --test moorlicht/tests/engine.test.js
```

Sie prüfen Licht- und Kälteregeln aller Funken, Erlöschen und Rettung, Glanz und Docht beim Weitergehen,
dass die Risiko-Anzeige mit dem Auszählen aller möglichen Züge übereinstimmt, die Karte (alles erreichbar,
Wächter am Ende), Krämerin, Rast, Funde, Notizen, Auswertung, Freischaltungen, Gespräche, Speichern als
JSON, Mondphasen und die Balance (Abwägen schlägt Draufgänger und Angsthase).

Browser-Smoke-Test mit Playwright:

```
cd moorlicht && npm install && npx playwright install chromium
node --test tests/smoke.test.js
```

Er öffnet das Spiel in einem Handy-Viewport (390 × 844, Touch) und spielt ausschließlich mit Fingertipps
eine ganze Nacht vom Intro über Dorf, Karte, Stationen, Fang, Funde und Krämerin bis zum Endbildschirm und
zurück ins Dorf. Dazu prüft er, dass eine angefangene Nacht das Neuladen übersteht, und dass auf dem iPad
(820 × 1180) alle Orte der Karte im Bild und antippbar sind. Fehler in der Konsole lassen ihn scheitern.
Ohne installiertes Playwright wird er übersprungen. Balance prüfen: `node moorlicht/tools/simulation.js 1000`.

## Ehrliche Einschätzung

**Langzeitmotivation.** Gelungen: drei Stränge greifen ineinander (Geschichte mit acht Notizen und wahrem
Ende, Freischaltungen, Mondphasen), und nach jeder Nacht wartet im Dorf etwas Neues. Schwach: Der
Inhalt ist endlich, 12 Funkenarten, 13 Talismane, 11 Funde und gut 20 Gesprächszeilen sind nach vielleicht
15 bis 25 Nächten bekannt. Danach tragen nur noch Mondphasen und die Nacht des Tages, die keinen Vergleich
mit anderen kennt. Die Kurve habe ich nur mit Bots gemessen, nicht mit Menschen; ob die erste gewonnene
Nacht nach drei oder nach zwölf Versuchen kommt, weiß ich nicht.

**Spielgefühl.** Gelungen: Jeder Zug hat mehrere Schichten Rückmeldung, Erlöschen und Bestehen fühlen sich
deutlich verschieden an, der Klang knüpft an Johannisnacht an. Schwach: Ich konnte den Klang in meiner
Umgebung nicht hören, nur prüfen, dass er ohne Fehler läuft; Lautstärken und Mischung sind daher
ungeprüft. Vibration gibt es auf dem iPhone nicht (Safari unterstützt sie nicht). Die Grafik ist einfach
und prozedural (Silhouetten, Leuchtpunkte), Figuren sieht man nie. Auf einem echten iPad oder Handy ist das
Spiel nicht getestet, nur in Chromium mit Touch-Emulation.

**Spannende Entscheidungen.** Gelungen: Die Kernentscheidung ist bei jedem Zug echt und transparent, Glas,
Weg und Funde bieten mehrere Wege, und die Simulation zeigt, dass Spielweise klar zählt. Schwach: Ziehen
oder gehen kann zur Formel werden („bis 20 % ziehen“), sobald man sie durchschaut hat. Einige Talismane
sind blass (Weidenkorb, Krämermünze), die Papierlaterne ist mit allen Freischaltungen spürbar leichter
als die anderen, und das zufällige Fang-Angebot gibt manchmal nichts, was zum eigenen Glas passt.

**Welt und Atmosphäre.** Gelungen: Ort, Sage und Regeln erzählen dieselbe Geschichte, die Zeitschleife
erklärt das Wiederholen, das Licht der Laterne ist zugleich Spielstand und Stimmung. Schwach: Erzählt wird
fast nur in Text, ohne Bilder der Figuren oder eigene Zwischenszenen. Das Dorf ist ein Menü vor einer
Kulisse, kein Ort zum Herumgehen, und die drei Regionen unterscheiden sich mehr im Bild als im Spiel. Nach
dem wahren Ende gibt es keine weitere Geschichte.
