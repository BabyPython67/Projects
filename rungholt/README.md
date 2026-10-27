# RUNGHOLT – eine Nacht durchs Watt zur versunkenen Stadt

Am Abend vor Allerheiligen fällt das Watt tiefer als im ganzen Jahr, und Rungholt steigt
aus dem Schlick: die reiche Stadt, die das Meer 1362 in einer Nacht geholt hat. Du nimmst
die Laterne und gehst hinaus. Zwölf Schritte bis zur Kirche, drei Strecken, drei Wächter,
und die Flut kommt nach fünfzehn Schritten zurück. In jeder Begegnung würfelst du drei
Würfel und setzt sie auf deine Gegenstände: Laterne schlägt, Wanderstab schützt, Fläschchen
heilt, und jeder weitere Fund hat eine eigene Regel. Wer die Glocke schlägt, bringt die
Ertrunkenen zur Ruhe. Was du in einer Nacht erreichst, bleibt: neue Gegenstände am Weg,
neue Gefährten, Blätter der Chronik, die Springflut.

Ein Würfel-Roguelike für Finger und Maus, auf Deutsch, ohne Konto, ohne Server, läuft
offline.

## Spielen

**https://babypython67.github.io/Projects/rungholt/** (GitHub Pages, sobald `main` den
Ordner enthält). Auf iPad und Handy komplett per Touch, über „Zum Home-Bildschirm“ wird
daraus eine App mit eigenem Icon; nach dem ersten Besuch läuft sie auch ohne Netz.

Lokal aus dem Repo mit einem Befehl, dann http://localhost:8000/rungholt/ öffnen:

```
python3 -m http.server 8000
```

(Oder im Ordner `rungholt/` `npm start`, dann http://localhost:8000/.) Die Seite läuft auch
direkt aus der Datei `rungholt/index.html`, dann nur ohne Offline-Speicher. Keine
Abhängigkeiten, kein Build-Schritt, keine API-Keys.

Anhängsel an die Adresse: `?seed=7` macht eine freie Nacht wiederholbar, `?kit=fischer`
wählt den Gefährten, `?springflut=1` die Stufe (soweit freigespielt), `?schnell=1` schaltet
alle Animationen und Wartezeiten ab, `?autoplay=1` lässt den Autopiloten über die echte
Oberfläche spielen, `?nosw=1` verzichtet auf den Service Worker.

## So geht die Nacht

| | |
|---|---|
| Karte | Zwölf Schritte, auf jedem zwei oder drei Wege zur Wahl: Begegnung, Warft (Rast), Etwas am Weg (Ereignis), Fund. Jede Strecke endet mit einem Wächter. |
| Flut | Startet bei 0, jeder Schritt kostet 1, manche Entscheidungen mehr, eine weniger. Bei 15 kommt das Wasser, und wer nicht in der Kirche ist, hat verloren. |
| Begegnung | Drei Würfel je Runde. Würfel tippen, dann den Gegenstand, der ihn nimmt. Die gelbe Regel sagt, welcher passt: jeder, gerade, ungerade, ab 4, bis 3, sammelt N. Punkte oben rechts: so oft nimmt der Gegenstand je Runde. „Runde beenden“, dann zieht der Gegner. |
| Gegner | Zeigt immer den nächsten Zug: Schlag, Schlag ×2, Schutz, Heilt, Nebel (ein Würfel weniger). Betäubt setzt er aus; geschwächt schlägt er leiser; Blanke Hans schlägt ab der fünften Runde härter. |
| Mut | Dein Leben, 30 bei der Wattläuferin. Schutz fängt Schläge ab, verfällt am Rundenende. Bei null kehrst du um; der Rettungsring hält dich einmal. |
| Gegenstände | 22 Stück, höchstens fünf dabei; wer mehr findet, lässt eins zurück. Nach jeder Begegnung eins von drei zur Wahl, Wächter geben Plus-Fassungen, Rast und Krämer verbessern. |
| Punkte | 10 je vertriebenem Schatten, 30 je Wächter, 40 je Strecke, 2 je Mut; Sieg 200 plus 10 je Flutschritt Reserve; Springflut ×1,5, ×2, ×2,5. |
| Nächte | Tagesnacht (Startzahl aus dem Datum, für alle dieselbe, bester Wert je Tag) oder freie Nacht. |
| Bleibt | Gegenstände am Weg (13 von Anfang an, je 3 für Priele, Rungholt, Sieg), Gefährten (Fischer nach Rungholt, Glöckner nach dem Sieg), 11 Blätter der Chronik, Springflut 1 bis 3, Rekorde und die letzten zehn Nächte. Liegt im `localStorage` (`rungholt.v1`). |

Tastatur am Rechner: Ziffern wählen Würfel, Gegenstand, Weg oder Antwort, Enter oder
Leertaste beendet die Runde.

## Warum ein neues Spiel und keins der drei ausgebaut

Johannisnacht ist ein Echtzeit-Geschicklichkeitsspiel in einer Datei, Brückenwärter ein
Reaktionsspiel mit einem Knopf, Deichgraf rundenbasiert, aber mit einem einzigen Weg
(Sandsäcke dorthin, wo das Wasser kommt). Was gefehlt hat, Langzeitmotivation und echte
Abwägungen, lässt sich keinem der drei anbauen, ohne den Kern zu ersetzen: Alle drei haben
eine Mechanik und keine Entscheidung zwischen Mechaniken. Rungholt ist von Grund auf um
Entscheidungen gebaut (welcher Weg, welcher Würfel wohin, was mitnehmen, was liegen
lassen, Zeit gegen Mut) und um eine Struktur, die Wiederholung belohnt (jede Nacht anders,
Freischaltungen, Chronik). Übernommen habe ich, was gut war: die Welt der Nordseeküste aus
Deichgraf und Brückenwärter (Watt, Priele, Halligen, der Blanke Hans), die Glöckchen-Klänge
der Johannisnacht für alles, was gut ausgeht, und die Technik der Vorgänger (eine Seite ohne
Build, Logik getrennt von Darstellung, Service Worker, Autopilot für Balance und Tests).

## Recherche

Websuche war verfügbar; einzelne Seiten (gamedeveloper.com) ließen sich aus der Umgebung
nicht abrufen, dort stütze ich mich auf die Suchzusammenfassungen und mein Wissen. Als
Anregung genutzt, nicht als Vorgabe:

1. **Sid Meier, „a game is a series of interesting decisions“** (GDC-Seminar 2012, Kapitel
   in seiner Memoir) – [GDC-Ankündigung](https://www.engadget.com/2012-01-24-sid-meier-keiji-inafune-and-riot-games-folks-added-to-gdc-semin.html),
   [Besprechung](https://thestrategybridge.org/the-bridge/2021/1/11/reviewing-sid-meiers-lessons-in-game-design-civilization-and-wargames).
   Übernommen: Jede Runde ist eine Zuordnung mit sichtbarem Preis (dieser Würfel auf
   Schlag oder auf Schutz?), und jeder Schritt auf der Karte eine Wahl zwischen ungleichen
   Dingen; nichts ist reine Ausführung.
2. **Game Maker's Toolkit, „The Two Types of Random“** (Input- gegen Output-Zufall) –
   [Video](https://amara.org/en-gb/videos/C3IIn1JRUBXt), [Zusammenfassung bei Kotaku](https://kotaku.com/randomness-in-video-games-is-not-all-the-same-1841049263).
   Übernommen: Der Zufall kommt vor der Entscheidung (die Würfel liegen, bevor du
   wählst), nie danach: Kein Schlag kann danebengehen, jeder Gegnerzug ist angekündigt.
3. **Steve Swink, „Game Feel“ / „Game Feel: The Secret Ingredient“** –
   [Artikel](https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient),
   [Übersicht](https://en.wikipedia.org/wiki/Game_feel). Übernommen: Jede Berührung
   antwortet sofort mit Klang und Bewegung (Würfel springt beim Wählen hoch, Gegenstände
   leuchten, wenn sie passen, Fehlversuche wackeln), bevor die Logik sichtbar wird.
4. **Jan Willem Nijman (Vlambeer), „The Art of Screenshake“** (INDIGO 2013) – als
   [Quelle im GMTK-Video „Secrets of Game Feel and Juice“](https://amara.org/v/C3BGA),
   [Liste bei Kenney](https://kenney.nl/learn/must-see-videos-for-indie-developers).
   Übernommen: Wucht nach Größe des Treffers: Bildschirm-Schütteln, Blitz, rote Vignette,
   fliegende Zahlen, Vibration, tieferer Ton bei härteren Schlägen; der Gegner stößt vor,
   bevor er trifft.
5. **„Replayability in Roguelike Games“** (Masterarbeit, HAW Hamburg 2025) –
   [Volltext](https://reposit.haw-hamburg.de/handle/20.500.12738/19131). Übernommen: Die
   Lauf-Struktur (eine Nacht ist ein Lauf), zufällige Karte und Belohnungen aus einem
   wachsenden Vorrat, und dass Freischaltungen vor allem *Möglichkeiten* öffnen
   (Gegenstände mit neuen Regeln, Gefährten mit anderer Startausrüstung), nicht nur Stärke.
6. **Game-Wisdom, „The Danger of Forced Failure in Game Design“** –
   [Artikel](https://game-wisdom.com/critical/forced-failure-game-design). Übernommen:
   Keine Nacht ist absichtlich unschaffbar: Schon mit dem Grundvorrat gewinnt der
   Autopilot rund 41 % seiner Nächte (Simulation über 300 Startzahlen), Freischaltungen
   sind Abkürzungen, kein Grind, und wer gewinnt, bekommt mit der Springflut mehr
   Schwierigkeit statt mehr Stärke.
7. **„There is No Escape“, First Person Scholar, zu Hades** –
   [Essay](https://www.firstpersonscholar.com/there-is-no-escape/). Übernommen: Die
   Geschichte ist hinter Fortschritt *und* Scheitern einsortiert: Jedes Ende hat einen
   eigenen Text, Blätter der Chronik kommen bei Meilensteinen, und die Figuren der Welt
   (Grauer Mann, Glöcknerin, Pfarrer, Blanke Hans) sind die Gegner selbst.
8. **Raph Koster, „A Theory of Fun for Game Design“** –
   [Rückblick des Autors](https://www.raphkoster.com/wp-content/uploads/2026/07/Theory-of-Fun-10-Years-Later.pdf),
   [Besprechung](https://gamedev.net/blogs/entry/437313-a-theory-of-fun-by-raph-koster).
   Übernommen: Spaß ist Musterlernen. Darum haben Gegenstände Regeln, die man erst
   durchschauen muss (Spiegel liebt die Eins, Harpune die Sechs, Zähl-Gegenstände wollen
   Geduld), Gegner feste Muster, und die Springflut gibt denen, die alles beherrschen,
   ein neues.
9. **Epic Games, „Designing for mobile in Fortnite“** –
   [Richtlinien](https://dev.epicgames.com/documentation/fortnite/designing-for-mobile-in-fortnite).
   Übernommen: Alles Tippen, kein Ziehen, Knöpfe mindestens 48 Pixel hoch, die wichtigsten
   unten im Daumenbereich; ein Schritt der Karte dauert eine bis zwei Minuten, eine ganze
   Nacht zehn bis fünfzehn, und man kann jederzeit aufhören, weil nichts in Echtzeit läuft.
10. **Abatangelo, „Environmental Storytelling and Active Spectatorship“** (DiGRA 2025) –
    [Paper](https://dl.digra.org/index.php/dl/article/view/2696). Übernommen: Die
    atmosphärische Erzählung, die man fühlt statt löst: Himmel, Skyline und Nebel ändern
    sich mit der Strecke, ab den Prielen schlägt alle Weile eine ferne Glocke, jeder
    Gegner und jeder Gegenstand hat einen Satz Hintergrund, kein Tutorial-Text.

Außerdem im Kopf, ohne Link: *Slay the Spire* und *FTL* (Karte mit sichtbaren
Knotentypen, Belohnung aus dreien), *Dicey Dungeons* (Würfel auf Gegenstände setzen,
Zähl-Felder), *Into the Breach* (angekündigte Gegnerzüge), die Sage von Rungholt und
Detlev von Liliencrons „Trutz, Blanke Hans“.

## Was das Spiel reizvoll macht

**Langzeitmotivation.** Eine Nacht ist ein Lauf von zehn bis fünfzehn Minuten, und jede
ist anders: Karte, Gegner, Ereignisse, Würfel und Belohnungen kommen aus einer Startzahl.
Zwischen den Nächten bleibt ein Profil: 13 Gegenstände von Anfang an, je 3 weitere für
das Erreichen der Priele, für Rungholt und für den Sieg (neue *Regeln*, nicht nur größere
Zahlen), zwei weitere Gefährten mit anderer Startausrüstung, 11 Blätter einer Chronik,
die die Sage Stück für Stück erzählt, und nach dem Sieg die Springflut in drei Stufen, die
der Autopilot zu 31 %, 13 % und 3 % schafft. Die Tagesnacht gibt allen am selben Tag
dieselbe Nacht und merkt sich den besten Wert; Rekord und die letzten zehn Nächte stehen
auf der Startseite. Gewählt, weil ein Lauf ein natürliches Ende hat und der nächste einen
Grund (das fehlte den drei Vorgängern am meisten).

**Spielgefühl.** Jede Eingabe antwortet sofort: Der gewählte Würfel springt hoch, passende
Gegenstände leuchten, Unpassendes wackelt mit einem dumpfen Ton. Treffer haben Wucht nach
Größe: Der Gegner blitzt auf und zuckt, Zahlen fliegen, Klang und Vibration werden mit dem
Schaden tiefer und länger; eigene Treffer schütteln den Bildschirm, färben den Rand rot und
stoßen die Figur erst vor, bevor es weh tut. Würfel kullern beim Wurf, Zähl-Gegenstände
füllen sich sichtbar, Betäubung ist ein Glockenschlag, Sieg drei Glocken, Niederlage ein
sinkender Ton. Der ganze Klang entsteht aus Web Audio (nichts geladen): Wind als
gefiltertes Rauschen, dessen Höhe langsam wandert, ab den Prielen alle Weile eine ferne
Glocke, Glöckchen in D-Dur-Pentatonik für alles Gute, wie bei den Glühwürmchen. Gewählt,
weil Rückmeldung in Tausendstelsekunden das ist, was ein Tippspiel von einem Formular
unterscheidet.

**Spannende Entscheidungen.** Vier Ebenen, alle mit sichtbaren Folgen und ohne Würfelglück
*nach* der Wahl: (1) Auf der Karte: Begegnung bringt Belohnung, Rast bringt Mut, Ereignis
bringt Unbekanntes, und jeder Schritt kostet Flut. (2) In der Runde: Drei Würfel, meist
mehr sinnvolle Plätze als Würfel. Der Gegner sagt an, was kommt, also ist jeder Würfel auf
dem Wanderstab einer, der nicht schlägt. Sammeln fürs Netz oder jetzt zuschlagen? Die Vier
auf die Fackel (+2) oder aufs Schild (+3)? Den Fünfer mit der Dochtschere zur Sechs für die
Harpune? (3) Bei Belohnungen: Höchstens fünf Gegenstände, also zwingt jeder Fund ab dem
dritten zur Frage, was zurückbleibt; Wächter geben Plus-Fassungen, der Krämer nimmt Mut
statt Geld. (4) Bei Ereignissen: Zeit gegen Mut (Irrlichtpfad), Mut gegen Gegenstand
(Wrack, Krämer), Flut gegen Chronik (Glockenton). Drei Gefährten spielen sich anders:
Wattläuferin schlägt, Fischer schwächt und hält aus, Glöckner betäubt mit wenig Mut.
Gewählt, weil Abwägen, nicht Reagieren, das war, was Mirko vermisst hat.

**Welt und Atmosphäre.** Ein Ort, der es gab: Rungholt, Nordfriesland, 16. Januar 1362,
die Grote Mandränke, die Sage vom betrunkenen Schwein und dem gezwungenen Pfarrer, die
Glocken, die man bei ruhiger See hören soll, der Blanke Hans. Die Nacht führt durch drei
Strecken mit eigener Palette und Skyline (Salzwiesen, Priele mit Pricken, dann die Giebel
der Stadt mit glimmenden Fenstern), über allem Nebel, der dichter wird, wenn er dich
trifft, und unten der Laternenschein, der so groß ist wie dein Mut. Jeder Gegner ist eine
Gestalt aus der Sage mit einem Satz; die Chronik erzählt in elf kurzen Blättern, was
geschah und wer die Wächter waren, und das Ende hat je nach Ort und Ursache einen eigenen
Text. Gewählt, weil Mirko die Welt von Johannisnacht und Brückenwärter mochte: wieder
Nordsee, wieder Nacht, diesmal mit einer Geschichte, die man sich erwandert.

## Technik und Entscheidungen

* **Eine Seite, kein Build, keine Pakete.** `index.html` plus `engine.js`, von GitHub Pages
  unverändert ausgeliefert; läuft auch aus der Datei. `package.json` enthält nur Skripte
  und Playwright als Entwicklungsabhängigkeit für die Browser-Tests.
* **Logik getrennt von Darstellung, deterministisch.** `engine.js` kennt weder DOM noch
  Ton; alle Zufälle kommen aus einer Startzahl (mulberry32). Die Oberfläche fragt den
  Zustand ab und spielt eine Ereignisliste (`takeEvents()`) als Animation und Klang nach.
  Dadurch sind die Regeln in Node testbar, `?seed=` macht Nächte vergleichbar, und der
  Smoke-Test kann denselben Lauf im Browser und in Node vergleichen.
* **Knöpfe statt Ziehen.** Würfel und Gegenstände sind DOM-Knöpfe (mindestens 48 px,
  `touch-action: manipulation`), die Zuordnung ist Tipp-Tipp, in beiden Reihenfolgen.
  Nur der Hintergrund ist Canvas. Breite Bildschirme (iPad quer) bekommen zwei Spalten.
* **Balance per Simulation.** Der Autopilot (`choose` in `engine.js`, gierig mit
  Sicherheitsabstand) gewinnt mit dem Grundvorrat 41 % seiner Nächte, mit allem 63 %,
  bei Springflut 1 bis 3 noch 31 %, 13 % und 3 % (300 bzw. 200 Startzahlen). Fast alle
  Niederlagen fallen in Strecke 2 und 3. Ein Mensch, der die Ankündigungen liest, sollte
  deutlich besser sein als der Autopilot.
* **Offline über Service Worker und Manifest.** `sw.js` legt die sieben Dateien ab und lädt
  im Hintergrund nach; eigener Speicher-Namensraum `rungholt/…`, damit die anderen Spiele
  auf derselben Adresse unberührt bleiben.
* **Ordner `rungholt/`**, eigenes README, Tests in `tests/`.

## Tests

Logik, ohne Pakete (Node ab 18):

```
node --test rungholt/tests/engine.test.js
```

36 Tests: Determinismus und Tagesnacht, Kartenbau (12 Schritte, Wächter, Rast je Strecke,
keine doppelten Ereignisse), Flut, jede Regelart und jede Wirkungsart der Gegenstände,
Schutz, Mehrfachschlag, Betäuben, Schwächen, Nebel, Rettungsring, Belohnung und
Ablegen, Wächter und Sieg, Niederlage, Steigerung des Blanken Hans, Springflut, alle
Ereignisse und Rastarten, Profil und Freischaltungen, Autopilot (spielt jede Nacht zu Ende;
Siegquoten in plausiblen Grenzen) und Punkte.

Browser (Playwright, sonst übersprungen):

```
node --test rungholt/tests/smoke.test.js
```

Drei Tests im Handy-Viewport (390×844, Touch): eine komplette Nacht nur über Tipp-Eingaben
vom Titel bis zum Ende (der Autopilot sagt, was er täte, getippt wird auf die Knöpfe),
mit Prüfung von Endanzeige, Punkten, gespeichertem Profil, „Noch eine Nacht“ und
Neuladen; eine Begegnung von Hand (Würfel wählen, Gegenstand setzen, Abweisung eines
unpassenden Würfels, Runde beenden, Hilfe, Ton, Chronik); der Offline-Start aus dem
Service Worker bei abgeschaltetem Server.

## Ehrliche Einschätzung

**Langzeitmotivation.** Gelungen: Lauf-Struktur, Freischaltungen, die neue Regeln statt
nur Stärke bringen, Chronik, Tagesnacht, Springflut. Schwach: 22 Gegenstände und 12 Gegner
sind ein kleiner Vorrat; nach zehn bis zwanzig Nächten hat man alles gesehen, und die
Springflut ist nur ein Zahlenregler. Es gibt keine Erfolge, keine Zufallsmodifikatoren je
Nacht und keine Vergleichbarkeit mit anderen Spielern über das eigene Gerät hinaus.

**Spielgefühl.** Gelungen: sofortige Rückmeldung auf jede Berührung, Wucht nach
Treffergröße, synthetischer Klang, der ohne Laden auskommt, Würfelwurf und
Gegnerzug als kleine Sequenz. Schwach: Die Gegner sind statische SVG-Silhouetten ohne
eigene Bewegung, die Animationen sind CSS-Standard, Vibration gibt es nur auf Android,
und der Autopilot-Durchlauf verrät, dass Tippen schneller geht, als die Sequenzen laufen:
wer hastig spielt, wartet manchmal eine halbe Sekunde.

**Spannende Entscheidungen.** Gelungen: angekündigte Gegnerzüge, Zufall vor der Wahl,
Zuordnung mit echtem Preis, fünf Plätze, Flut gegen Mut. Schwach: Der gierige Autopilot
gewinnt mit dem Grundvorrat schon 41 %, also sind viele Runden lösbar, ohne lange
nachzudenken; die Ereignisse sind acht feste Texte mit zwei bis drei Wahlen, die man bald
auswendig kennt; und die Gegnermuster sind kurze Zyklen aus drei Zügen, Synergien zwischen
Gegenständen (Dochtschere plus Harpune, Messer plus Spiegel) gibt es, aber wenige.

**Welt und Atmosphäre.** Gelungen: ein echter Ort mit echter Sage, drei Strecken mit
eigener Stimmung, Nebel und Laterne, ferne Glocke, Texte für jedes Ende, Chronik. Schwach:
Die Welt ist Text plus Hintergrund, keine Figur spricht wirklich mit dir, es gibt keine
Musik, nur Klang, und die Grafik bleibt bei Silhouetten und Verläufen; wer große Bilder
erwartet, bekommt sie nicht. Die Chronik ist mit elf Blättern schnell gelesen.

**Insgesamt:** ein vollständiges, testbares, auf dem Handy gut spielbares Spiel mit mehr
Tiefe und Wiederspielwert als die drei Vorgänger; was fehlt, ist Masse an Inhalt, nicht
Struktur.
