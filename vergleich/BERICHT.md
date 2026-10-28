# Rungholt gegen Moorlicht: Vergleich zweier Spiele aus fast demselben Auftrag

*Stand 28.10.2026. Rungholt (`rungholt/`) hat Claude Fable 5.1 gebaut, Moorlicht (`moorlicht/`)
Claude Opus 5.5, beide in Claude Code mit /goal und Aufwand „extra hoch“. Geschrieben hat diesen
Bericht Claude Opus 5.5, also dasselbe Modell, das Moorlicht gebaut hat.*

**So liest du den Bericht**

* Jede Aussage trägt eine Kennzeichnung: **[belegt]** heißt, sie steht so im Code, in einem
  README, im Auftrag, in den Sitzungsprotokollen oder kommt aus einer Messung. **[E]** heißt
  Einschätzung: meine Bewertung auf Grundlage der genannten Befunde. **[unsicher]** heißt, der Beleg
  ist dünn oder die Messung hat eine bekannte Schwäche.
* Die Belege sind Links auf GitHub (Branch `main`). **Die Links führen in den Code und in die
  READMEs; dort stehen auch spätere Gegner, Orte und Enden.** Wer nichts verraten haben will,
  verlässt sich auf den Text hier.
* Alles, was du in den ersten zwei, drei Partien nicht siehst, steht nur in zugeklappten Abschnitten
  mit der Überschrift „Spoiler“.
* Weil ich selbst Opus 5.5 bin, nenne ich bei jedem Punkt, an dem Moorlicht vorn liegt, das stärkste
  Gegenargument.

**Inhalt:** [Kurzfazit](#kurzfazit) · [Vergleich je Punkt](#vergleich-je-punkt) ·
[Laufdaten](#laufdaten) · [Messungen](#messungen-mit-methode) ·
[Warum so ähnlich](#warum-so-ähnlich) · [Welches Modell wofür](#welches-modell-wofür) ·
[Bessere Aufträge](#bessere-aufträge) · [Vorschläge je Spiel](#vorschläge-je-spiel) ·
[Deine und meine Bewertung](#deine-bewertung-neben-meiner) · [Grenzen](#grenzen-dieses-vergleichs)

---

## Kurzfazit

1. **Zwei Spiele, eine Bauart.** Beide sind „Roguelites“ (ein Lauf ist eine Nacht, nach dem
   Scheitern beginnt man von vorn, behält aber Freigeschaltetes), beide führen nachts mit einer
   Laterne durch drei Abschnitte mit je einem Wächter am Ende, beide spielen in norddeutscher
   Sagenwelt, beide nutzen den Glöckchenklang aus Johannisnacht. **[belegt]**, Einzelheiten unter
   [Warum so ähnlich](#warum-so-ähnlich).
2. **Der Unterschied liegt im Kern.** Rungholt ist ein Würfel-Puzzle: In jeder Runde verteilst du
   drei Würfel auf Gegenstände mit eigenen Regeln, im Mittel aus 6,5 Möglichkeiten je Entscheidung.
   Moorlicht ist ein Wagnis-Spiel („Push your luck“: weiterziehen oder aufhören): Du ziehst Funken
   aus einem Glas, im Mittel aus 2,2 Möglichkeiten je Entscheidung, und nur etwa jede dritte bis
   vierte davon ist riskant. **[belegt]**, Messung.
3. **Rungholt hat die tieferen Entscheidungen im Moment, Moorlicht den längeren Atem.** Zählt man
   nur neue Freischaltungen und Geschichtstexte, bringt Rungholt einem Spieler auf Bot-Niveau ab der
   sechsten Nacht kaum noch etwas Neues (in 3 % der Nächte 6–10), Moorlicht noch in 74 % dieser
   Nächte. **[belegt]**, Messung; wie gut das auf dich übertragbar ist, ist **[unsicher]**.
4. **Beide Modelle haben sauber und vollständig geliefert.** Alle Tests laufen grün (Rungholt 36
   Logik- und 4 Browser-Tests, Moorlicht 24 und 3), beide Spiele laufen ohne Konto auf dem Handy.
   **[belegt]**, eigener Testlauf. Fable hat sorgfältiger geprüft (Quellen ein zweites Mal
   abgeglichen, Tippflächen gemessen, Offline-Betrieb), Opus hat mehr Welt und Text geschrieben
   (2052 statt 1136 Wörter) und mehr vorausgeplant. **[belegt]**, Einzelheiten im Hauptteil.
5. **Laufdaten:** Ohne das Aufräumen brauchten beide etwa gleich lang (Fable geschätzt 42–46 min,
   Opus 43,5 min) und etwa gleich viele Runden (rund 60). Opus erzeugte deutlich mehr Text und
   Denken (262 000 gegen geschätzt 170 000 Ausgabe-Tokens), kostete laut Sitzungsdaten aber nur
   etwa 10 statt etwa 17 US-Dollar. **[belegt]** bzw. für Fables Spielanteil geschätzt.
6. **Warum so ähnlich:** Der Auftrag beschreibt genau die Lücke, die Roguelites schließen
   („nach ein paar Partien ist alles gesehen“, „keine verschiedenen Wege“), er lobt ausdrücklich
   Klang und Stimmung von Johannisnacht und Brückenwärter, beide Modelle fanden in der Recherche
   dieselben fünf Klassiker, und beide übernahmen den Code-Stil der alten Spiele. **[belegt]** für
   die Ursachen im Auftrag und Repo, **[E]** für ihr Gewicht.
7. **Für die Zukunft:** Für Aufträge, bei denen Prüfen und Nachweisen zählt (Aufräumen, Umbauen,
   Quellen), würde ich Fable nehmen, für Entwürfe mit viel Welt und Text Opus, und einen
   kreativen Auftrag mit einer Ideen-Runde und ausdrücklichen Verboten des Naheliegenden
   beginnen lassen. **[E]**, Begründung unter [Welches Modell wofür](#welches-modell-wofür) und
   [Bessere Aufträge](#bessere-aufträge). Ein Spiel je Modell ist dafür nur eine Stichprobe.

---

## Vergleich je Punkt

Kurz zu den Begriffen: Ein **Bot** (auch Autopilot) ist ein Programm, das das Spiel nach festen
Regeln selbst spielt. Beide Spiele bringen so einen Bot mit, um die Schwierigkeit einzustellen.
**Meta-Fortschritt** heißt: Was man über viele Nächte hinweg behält (Freischaltungen, Geschichte).

### Langzeitmotivation

| | Rungholt | Moorlicht |
|---|---|---|
| Was über die Nächte bleibt | 9 weitere Gegenstände zu den 13 vom Start, 2 weitere Gefährten, 11 Blätter einer Chronik, eine Tagesnacht, Rekorde, dazu, was nach dem ersten Sieg kommt (siehe Spoiler) **[belegt]** ([engine.js:83–88][r-unlocks], [README:56][r-readme-bleibt]) | 9 Freischaltungen, die man mit „Erinnerungen“ kauft, 8 Notizen der verschwundenen Schwester, 22 Gespräche mit drei Leuten im Dorf, ein Naturkundebuch, Nacht des Tages, dazu, was nach dem ersten Sieg kommt (siehe Spoiler) **[belegt]** ([inhalt.js:171–181][m-freischaltungen], [README:47–65][m-readme-lang]) |
| Wie man freischaltet | an Meilensteinen: einen Abschnitt erreichen, gewinnen **[belegt]** ([engine.js:84–88][r-unlocks]) | gegen gesammelte Erinnerungen, die jede Nacht bringt, auch eine verlorene **[belegt]** ([engine.js:678–690][m-auswerten]) |
| Erster Sieg (Bot, Median) | Nacht 2 **[belegt]**, Messung | Nacht 3 **[belegt]**, Messung |
| Alle Freischaltungen (Bot, Median) | Nacht 2 **[belegt]**, Messung | Nacht 6 **[belegt]**, Messung |
| Nächte mit neuer Freischaltung oder neuem Geschichtstext, Nacht 6–10 | 3 % (neugieriger Spieler: 13 %) **[belegt]**, Messung | 74 % (neugieriger Spieler: 72 %) **[belegt]**, Messung |
| Letzte Nacht mit so etwas Neuem (Median) | Nacht 3 (neugierig: 9) **[belegt]**, Messung | Nacht 14 (neugierig: 27) **[belegt]**, Messung |
| Textmenge der Geschichte | 1136 Wörter **[belegt]**, Messung | 2052 Wörter **[belegt]**, Messung |

**Einschätzung.** Moorlicht liegt hier vorn **[E]**: Es gibt nach fast jeder der ersten zehn
Nächte etwas Neues (ein Gespräch, eine Notiz, eine Freischaltung), und weil auch verlorene Nächte
Erinnerungen bringen, fühlt sich Scheitern nicht leer an ([engine.js:683–689][m-auswerten]). Bei
Rungholt hängen die Freischaltungen an Meilensteinen, die ein geübter Spieler in den ersten zwei
Nächten erreicht; danach trägt vor allem das Spiel selbst. Beide Selbsteinschätzungen sagen dasselbe:
„nach zehn bis zwanzig Nächten hat man alles gesehen“ ([Rungholt-README:277–281][r-readme-einsch])
und „nach vielleicht 15 bis 25 Nächten bekannt“ ([Moorlicht-README:238–243][m-readme-einsch])
**[belegt]**.

> **Stärkstes Gegenargument (für Rungholt).** Meine Zahlen kommen von Bots, nicht von dir. Der
> Rungholt-Bot erreicht den dritten Abschnitt schon in 94 % seiner ersten Nächte; ein Mensch, der
> die Regeln erst lernt, braucht dafür länger, und dann verteilen sich Rungholts Freischaltungen
> über mehr Nächte **[unsicher]**. Außerdem ist Moorlichts Vorsprung endlich: Er besteht aus
> vorgeschriebenem Text, der nach rund 14 bis 27 Nächten aufgebraucht ist; danach bleibt in beiden
> Spielen vor allem, besser zu werden, und die Tagesnacht **[belegt]**, Messung und READMEs. Wer
> Langzeitmotivation als „Lust auf das Spiel selbst“ versteht und nicht als „Belohnungen“, für
> den zählt Rungholts tieferer Kern (siehe Entscheidungen) mehr **[E]**.

<details>
<summary>Spoiler: Was genau freigeschaltet wird und wann</summary>

* Rungholt: Beim Erreichen der Priele kommen Fischmesser, Krabbenkorb und Schlickstiefel dazu,
  beim Erreichen der Stadt Harpune, Nebelhorn, Glocke und der Fischer, nach dem ersten Sieg
  Sternkarte, Leuchtfeuer, Rettungsring, der Glöckner und die Springflut in drei Stufen
  ([engine.js:84–88][r-unlocks]). Der Bot schafft die Springflut-Stufen laut README zu 31 %, 13 %
  und 3 % ([README:180][r-readme-lang]). Die Chronik hat 11 Blätter; drei davon hängen an einem
  Sieg mit dem Fischer, einem Sieg mit dem Glöckner und einem Sieg auf Springflut
  ([engine.js:170–175][r-chronik-spaet]). Der neugierige Simulationsspieler (wechselt die Gefährten,
  spielt immer die höchste Springflut) hat nach 20 Nächten im Mittel 10,2 von 11 Blättern; 48 %
  bekommen in 60 Nächten nicht alle.
* Moorlicht: Neue Funken (Mondmotte, Nachtfalter, Glutkäfer, Funkenflieger), Kräuterbeutel,
  Kupfer- und Papierlaterne, Krämerinnentruhe mit sechs Talismanen, Großmutters Docht
  ([inhalt.js:171–181][m-freischaltungen]). Das gebundene Irrlicht wird frei, sobald man dem
  großen Irrlicht am Turm begegnet ([engine.js:701–704][m-sp1]). Fünf Mondphasen machen
  jede Nacht härter ([inhalt.js:161–168][m-sp2]). Wer mit allen acht Notizen gewinnt, sieht
  das wahre Ende ([engine.js:709–712][m-sp3]); der Bot-Spieler schafft das im Median in
  Nacht 13, der neugierige (immer höchste Mondphase) in Nacht 21,5.

</details>

### Spielgefühl

„Spielgefühl“ meint hier, wie direkt und wuchtig das Spiel auf jede Berührung antwortet
(im Game Design oft „Juice“ genannt).

| | Rungholt | Moorlicht |
|---|---|---|
| Antwort auf jede Berührung | gewählter Würfel springt hoch, passende Gegenstände leuchten, Unpassendes wackelt mit dumpfem Ton **[belegt]** ([README:185–188][r-readme-gefuehl]) | Funke fliegt mit Leuchtspur in die Laterne, Funken sprühen, Flamme zuckt, Lichtkreis wächst **[belegt]** ([README:69–73][m-readme-gefuehl]) |
| Wucht nach Größe | Ton und Vibration werden mit dem Schaden tiefer und länger ([index.html:390–391][r-sfx-hit]), eigener Treffer schüttelt das Bild ([index.html:150–151][r-shake]) **[belegt]** | kurzer Halt beim Erlöschen („Hit-Stop“, 150 ms, [spiel.js:907][m-hitstop]), Beben ([spiel.js:91–95][m-beben]), Frost wächst vom Rand ([spiel.js:582–585][m-frost]), Herzschlag ab 50 % Risiko ([spiel.js:902][m-herz]) **[belegt]** |
| Klang | alles aus Web Audio (im Browser erzeugt, nichts geladen), Glöckchen in D-Dur-Pentatonik wie Johannisnacht, Wind, ferne Glocke **[belegt]** ([index.html:383][r-penta]) | ebenso, dazu steigt die Tonhöhe mit jedem gezogenen Funken, sodass eine gierige Reihe zur Melodie wird **[belegt]** ([klang.js:1–8][m-klang]) |
| Bewegung reduzierbar (für Menschen, denen Wackeln unangenehm ist) | nein, nur ein Testschalter `?schnell=1` **[belegt]** (keine Fundstelle für `reduced-motion`) | ja, folgt der Systemeinstellung **[belegt]** ([stil.css:287][m-reduced]) |
| Geprüft auf echtem Gerät | nein, beide geben das offen zu **[belegt]** ([README:24–27][r-readme-geraet]) | nein **[belegt]** ([README:245–250][m-readme-einsch]) |

**Einschätzung.** Hier gebe ich keinem den Vorzug **[E]**. Auf dem Papier hat Moorlicht mehr
Schichten (Hit-Stop, Frost, Herzschlag, steigende Töne), Rungholt dafür die klarere Rückmeldung bei
Fehlgriffen. Ob sich das in der Hand gut anfühlt, kann ich nicht beurteilen: Ich habe keinen Ton
gehört und nichts in der Hand gehabt. Auf meinen Bildschirmfotos im Handy-Format überlagerten sich
bei Moorlicht kurz Hinweistext und fliegende Zahlen über der Laterne; das kann ein Moment mitten in
einer Animation gewesen sein **[unsicher]**. Rungholt wirkte auf den Fotos aufgeräumt, aber karg:
eine Linienzeichnung als Gegner und viel leere Fläche **[unsicher]**, eigene Bildschirmfotos.
Dein Eindruck nach dem Anzocken wiegt hier mehr als meiner.

### Spannende Entscheidungen

| | Rungholt | Moorlicht |
|---|---|---|
| Kernentscheidung | welcher Würfel auf welchen Gegenstand (Schlag, Schutz, Heilen, Sammeln, Würfel verändern), während der Gegner seinen nächsten Zug ansagt **[belegt]** ([engine.js:432–439][r-intent], [engine.js:482–500][r-place]) | noch einen Funken ziehen oder weitergehen; das genaue Risiko steht in Prozent da **[belegt]** ([engine.js:386–395][m-gefahr], [engine.js:397–412][m-vorschau]) |
| Möglichkeiten je Entscheidung (Mittel) | 6,5 **[belegt]**, Messung | 2,2 **[belegt]**, Messung |
| Entscheidungen je Nacht, davon „echte“ (Bot) | 85, davon 72 echt **[belegt]**, Messung; Definition siehe Messungen | 136, davon 38 echt **[belegt]**, Messung |
| Wie stark zählt die Spielweise? Siegquote je Stil | Zufall 0 %, Draufgänger 4 %, Bot 38 %, Vorsichtig 50 % **[belegt]**, Messung | Zufall 0 %, Draufgänger 0,4 %, Angsthase 5 %, Abwägend 20 % **[belegt]**, Messung |
| Karte | je Schritt 2–3 Orte zur Wahl, unabhängig voneinander: Man sieht nur den nächsten Schritt, ein Weg verbaut nichts **[belegt]** ([engine.js:279][r-options]) | verbundene Wege über vier Reihen bis zum Wächter, alles mit Dunkel-Wert sichtbar: Man plant eine Route **[belegt]** ([engine.js:193–199][m-wege], eigenes Bildschirmfoto) |
| Ausrüstung | höchstens 5 Gegenstände, ab dem sechsten muss einer zurückbleiben **[belegt]** ([engine.js:186][r-maxgear]) | das Glas wächst; Irrlichter loswerden kostet Rast oder Glanz **[belegt]** ([engine.js:509–518][m-rast]) |

**Einschätzung.** Rungholt liegt hier vorn **[E]**. In fast jeder Würfelrunde wägt man zwischen
verschiedenen Wirkungen ab, und der angesagte Gegnerzug macht daraus ein kleines Rätsel mit
Lösung. In Moorlicht ist ein großer Teil der Taps ohne Spannung (ziehen, solange das Risiko null
ist); spannend wird es nur an der Risikogrenze. Das sagt Moorlichts eigenes README genauso: „Ziehen
oder gehen kann zur Formel werden (‚bis 20 % ziehen‘)“ ([README:253–254][m-readme-einsch])
**[belegt]**. Beide zeigen in der Messung, dass die Spielweise den Ausgang stark bestimmt: Ein
Zufallsspieler gewinnt in keinem der beiden Spiele **[belegt]**.

Wo Moorlicht besser ist: Die Routenplanung ist echter als Rungholts Karte, weil Wege verbunden
sind und man vorausschaut **[belegt]**, und das Glas über die Nacht zu bauen (was fange ich, was
treibe ich aus) ist eine zweite, langsame Entscheidungsebene **[E]**.

### Welt und Atmosphäre

| | Rungholt | Moorlicht |
|---|---|---|
| Ort und Geschichte | die echte Sage von Rungholt (Nordfriesland, Sturmflut 1362), eine Nacht durchs Watt zur versunkenen Stadt **[belegt]** ([README:3–10][r-readme-intro]) | ein erfundenes Dorf am Moor, die verschwundene Schwester, eine Johannisnacht, die sich wiederholt **[belegt]** ([README:5–9][m-readme-intro]) |
| Wer erzählt | Chronik-Blätter, Ende-Texte, je ein Satz zu Gegnern und Gegenständen **[belegt]** ([engine.js:153–176][r-chronik]) | drei Figuren im Dorf mit Gesprächen nach jeder Nacht, Notizen der Schwester, Funde mit kleinen Geschichten **[belegt]** ([inhalt.js:317–368][m-gespraeche]) |
| Bild | Nachthimmel, Silhouetten je Abschnitt, Nebel, Laternenschein so groß wie dein Mut **[belegt]** ([README:212–215][r-readme-welt]) | die Laterne ist die Kamera: Nur ihr Lichtkreis zeigt das Moor, er wächst mit dem gezogenen Licht **[belegt]** ([README:124–125][m-readme-welt]) |
| Spielregel und Geschichte | Flut als Zeitdruck passt zur Sage **[E]** | die Regel „wer zu gierig ist, erlischt“ ist zugleich der Kern der Geschichte **[belegt]** ([README:120–123][m-readme-welt]) |

**Einschätzung.** Moorlicht liegt hier knapp vorn **[E]**: Es hat Figuren, die auf deinen
Fortschritt reagieren, und Regel und Geschichte erzählen dasselbe. Rungholt hat den stärkeren,
weil echten Stoff, erzählt ihn aber fast nur in Blättern zum Nachlesen.

> **Stärkstes Gegenargument (für Rungholt).** Moorlichts Rahmen (eine Zeitschleife, in der
> Scheitern die Geschichte voranbringt, Figuren im Dorf kommentieren jeden Versuch) ist nah an
> *Hades* abgeschaut; das README nennt das selbst als Vorbild ([README:49–50][m-readme-lang])
> **[belegt]**. Rungholt verbindet dagegen einen echten Ort, ein echtes Datum und eine echte Sage
> mit der Nordsee-Welt, die du an Brückenwärter mochtest; das ist eigenständiger **[E]**. Und
> Moorlichts Dorf ist laut eigenem README „ein Menü vor einer Kulisse, kein Ort zum Herumgehen“
> ([README:260–261][m-readme-einsch]) **[belegt]**.

<details>
<summary>Spoiler: Wohin die Geschichten führen</summary>

* Rungholt: Die Wächter sind Gestalten der Sage (der Graue Mann als ehemaliger Deichvogt, die
  Glöcknerin, die seit 600 Jahren läutet, der Blanke Hans als das Meer selbst). Die Chronik
  erzählt die Sage vom betrunkenen Schwein und dem gezwungenen Pfarrer; wer gewinnt, schlägt die
  Glocke, und die Fenster der Stadt gehen zu „wie Augen“ ([engine.js:153–176][r-chronik]).
* Moorlicht: Almas Notizen erklären, dass die Erloschenen zu Irrlichtern werden und der Turm
  „gebundenes Licht“ braucht. Der letzte Wächter ist Alma selbst als großes Irrlicht; dort
  kippt die Regel und Irrlichter bringen Licht. Mit allen acht Notizen führt ein Sieg zum wahren
  Ende, in dem Alma zurück im Dorf sitzt ([inhalt.js:305–314][m-notizen],
  [inhalt.js:121–137][m-waechter]).

</details>

### Technik und Tests

| | Rungholt | Moorlicht |
|---|---|---|
| Aufbau | eine Seite plus Spiellogik in eigener Datei, kein Build-Schritt **[belegt]** ([README:223–230][r-readme-technik]) | ebenso, Inhalte zusätzlich als reine Daten getrennt **[belegt]** ([README:196–208][m-readme-aufbau]) |
| Umfang (Zeilen, mit Tests) | 2970 **[belegt]**, `wc -l` | 4061 **[belegt]**, `wc -l` |
| Logik-Tests | 36, grün in 0,5 s **[belegt]**, eigener Lauf | 24, grün in 0,8 s **[belegt]**, eigener Lauf |
| Browser-Tests (Handy-Format, per Tippen) | 4, grün in 22 s; prüft auch, dass jede Tippfläche mindestens 44 × 44 Pixel groß ist **[belegt]** ([smoke.test.js:195–208][r-smoke-44]) | 3, grün in 44 s; scheitert bei jedem Fehler in der Browser-Konsole **[belegt]** ([smoke.test.js:20–21][m-smoke-konsole]) |
| Offline spielbar, als App auf dem Home-Bildschirm | ja (Service Worker, also ein Zwischenspeicher im Browser, plus Manifest) **[belegt]** ([index.html:889–890][r-sw]) | nein, kein Service Worker und kein Manifest **[belegt]** ([index.html:8–11][m-html-head]) |
| Angefangene Nacht übersteht Schließen der Seite | nein, gespeichert wird erst am Ende der Nacht **[belegt]** ([index.html:336–339][r-save], [index.html:825–829][r-finish]) | ja, mit Test dafür **[belegt]** ([spiel.js:685][m-fortsetzen], [smoke.test.js:145][m-smoke-reload]) |
| Regeln gegen Rechnung geprüft | jede Regelart einzeln getestet **[belegt]** ([engine.test.js][r-tests]) | die Risiko-Anzeige wird gegen das Auszählen aller Züge geprüft **[belegt]** ([engine.test.js:164][m-test-gefahr]) |
| Recherche | 12 Quellen, Websuche, zweiter Suchdurchgang zur Prüfung, eine falsche Angabe berichtigt **[belegt]** ([README:77–83][r-readme-recherche]) | 9 Quellen, „live im Web recherchiert“ ([README:161][m-readme-recherche]); laut Sitzungsprotokoll 10 Suchanfragen in 20 Sekunden und kein einziger Seitenabruf **[belegt]** |

**Einschätzung.** Gleichstand mit verschiedenen Stärken **[E]**. Rungholt ist schlanker und
gründlicher geprüft, und es läuft offline. Moorlicht verliert keine angefangene Nacht; auf dem
iPad, das Hintergrund-Tabs gern schließt, ist das im Alltag wichtig. Die Quellen in beiden READMEs
konnte ich nicht öffnen (die Arbeitsumgebung sperrt fremde Seiten) **[unsicher]**.

<details>
<summary>Spoiler-Hinweis zu den READMEs der Spiele</summary>

Beide READMEs verraten spätere Inhalte (Wächter, Freischaltungen, bei Moorlicht auch das wahre
Ende). Wer sie vor dem Spielen liest, ist gespoilert. Siehe Vorschläge.

</details>

---

## Laufdaten

Ausgelesen aus den Sitzungsprotokollen beider Läufe (Zugriff auf die anderen Sitzungen war
möglich); die Rohwerte liegen in [`werkzeuge/laufdaten.json`][laufdaten]. Gezählt ist nur der
/goal-Durchlauf, nicht die Nachfragen danach.

| | Fable (ganzer Lauf) | Fable, nur Spiel (geschätzt) | Opus |
|---|---|---|---|
| Dauer | 53,9 min (21:40–22:34 UTC) **[belegt]** | 42–46 min **[E]** | 43,5 min (23:40–00:23 UTC) **[belegt]** |
| Runden (Modellaufrufe laut Protokoll, `num_turns`) | 84 **[belegt]** | etwa 60 **[E]** | 60 **[belegt]** |
| Runden nach eigener Zählung des Modells | 50 („Ich bin bei 50 Arbeitsrunden“, dann Stopp nach der Regel im /goal) **[belegt]** | – | keine Angabe **[belegt]** |
| Ausgabe-Tokens (Text, Code, Denken) | 205 378, davon Denken 62 077 **[belegt]** | etwa 165 000–170 000 **[E]** | 262 233, davon Denken 125 790 **[belegt]** |
| Aus dem Zwischenspeicher gelesen | 12,6 Mio. **[belegt]** | – | 8,5 Mio. **[belegt]** |
| Websuchen | 18, dazu 6 Seitenabrufe (alle gesperrt) **[belegt]** | – | 10, keine Seitenabrufe **[belegt]** |
| Kosten laut Sitzungsdaten (Listenpreis) | 20,95 USD **[belegt]** | etwa 17 USD **[E]** | 10,12 USD **[belegt]** |

**Wie ich das Aufräumen herausgerechnet habe.** Fable hat das Repo zuerst aufgeräumt und um
21:49 den Commit `d4eb43f` erstellt; danach begann die Recherche fürs Spiel **[belegt]**,
Protokoll. Das Aufräumen belegt 8,3 von 53,9 Minuten (15 %), 21 von 72 Werkzeugaufrufen (29 %)
und 18 % des sichtbaren erzeugten Inhalts **[belegt]**. Später kam noch ein wenig Aufräumarbeit
dazu: ein wackliger Brückenwärter-Test (Commit `bf9b664`) und, in der Nacharbeit 22:21–22:34,
Versuche, alte Branches zu löschen **[belegt]**. Daraus ergeben sich die geschätzten Spielwerte
(15–30 % abgezogen) **[E]**. Das Denken des Modells ist im Protokoll nicht lesbar, deshalb ist der
Token-Anteil die unsicherste Zahl **[unsicher]**.

**Was die Laufdaten zeigen.**

* Fable war um 22:20 mit dem Spiel fertig; danach meldete die /goal-Prüfung Einwände, von denen
  drei in der Cloud-Umgebung nicht zu erfüllen waren (Test auf echtem Gerät, Quellseiten öffnen,
  Branches löschen), und Fable arbeitete bis zur 50-Runden-Grenze nach **[belegt]**, Protokoll
  22:21–22:34. Opus ging in einem Durchgang durch, ohne Einwände **[belegt]**. Ein Teil von Fables
  längerer Laufzeit kommt also aus dem anspruchsvolleren /goal, nicht aus dem Modell **[E]**.
* Opus dachte zu Beginn rund 12 Minuten am Stück (zwischen der letzten Suche um 23:40 und dem
  ersten Schreiben um 23:52) und schrieb dann große Dateien in einem Zug; Fable arbeitete in
  kürzeren Schritten **[belegt]**, Protokoll. Das README schrieb Opus in den letzten zwei Minuten
  (00:21:54) **[belegt]**.
* Die „Runden“-Angaben sind nicht sauber vergleichbar: Fables eigene Zählung (50) weicht vom
  Protokoll (84) ab, und wie /goal selbst zählt, ist aus den Protokollen nicht ablesbar
  **[unsicher]**.

---

## Messungen mit Methode

**Werkzeug.** [`vergleich/werkzeuge/messen.js`][messen] lädt die Spiellogik beider Spiele
(dieselbe, die im Browser läuft) und spielt sie ohne Bildschirm durch. Ergebnis:
[`ergebnisse.json`][ergebnisse]. Aufruf `node vergleich/werkzeuge/messen.js`, Laufzeit 12 Sekunden,
feste Startzahlen, also wiederholbar. Die Spiele selbst habe ich nicht geändert. Zusätzlich liefen
die vorhandenen Logik- und Browser-Tests beider Spiele (alle grün) und ich habe Bildschirmfotos der
ersten Bildschirme im iPhone-13-Format gemacht.

**Spieler, die ich gemessen habe.**

* Rungholt: der eingebaute Autopilot („Bot“), zwei eigene Varianten, die nur in der Begegnung anders
  setzen („Draufgänger“: immer der stärkste Schlag; „Vorsichtig“: zuerst Schutz und Heilung), und
  ein Zufallsspieler, der aus allen erlaubten Zügen gleichverteilt wählt.
* Moorlicht: die drei eingebauten Bot-Stile („abwägend“, „Draufgänger“, „Angsthase“) und derselbe
  Zufallsspieler.
* Jeweils 500 Nächte ohne Freischaltungen, auf der Grundschwierigkeit.

**Definitionen.**

* *Eingabe*: ein Spielzug in der Logik. Auf dem Bildschirm sind es mehr Taps (bei Rungholt zwei je
  Würfel, bei Moorlicht ein Bestätigen je Ort).
* *Entscheidung*: ein Moment mit mindestens zwei erlaubten Zügen.
* *Echte Entscheidung*: Rungholt-Begegnung, wenn mindestens zwei *verschiedene Wirkungen* zur Wahl
  stehen (etwa Schlag oder Schutz); Moorlicht-Station, wenn Ziehen die Laterne löschen kann (Risiko
  über null). Karte: wenn mindestens zwei *verschiedene Ortsarten* zur Wahl stehen. Belohnung,
  Ereignis, Rast, Händler, Fund: wenn es mindestens zwei Angebote gibt.
* *Ähnlichkeit zweier Nächte*: Anteil der Inhalte (Gegner, Ereignisse, angebotene Belohnungen bzw.
  Funde, Ortsbesonderheiten, angebotene Funken), die zwei zufällige Nächte gemeinsam haben.
* *Fortschritt über viele Nächte*: 100 simulierte Spieler spielen je 60 Nächte mit dem Bot, mit
  Freischaltungen wie im echten Spiel (Moorlicht: kauft immer die billigste mögliche Freischaltung
  und liest jedes neue Gespräch). „Neugierig“ heißt: wechselt jede Nacht den Gefährten bzw. die
  Laterne und spielt immer die höchste freigeschaltete Schwierigkeit.
* *Neues*: eine Nacht bringt eine Freischaltung, einen Geschichtstext (Chronik-Blatt, Notiz,
  Gespräch) oder einen erstmals gesehenen Gegner, Fund oder ähnliches. Weil der Moorlicht-Bot
  Fundorte selten wählt und deshalb erstmals gesehene Funde noch spät „neu“ sind, gebe ich
  zusätzlich die strengere Zahl an: *nur Freischaltungen und Geschichtstexte*.

**Ergebnisse: eine Nacht** (500 Nächte, Grundschwierigkeit)

| | Rungholt (Bot) | Moorlicht (abwägend) |
|---|---|---|
| Sieg | 38 % | 20 % |
| erreicht Abschnitt 2 / 3 | 100 % / 94 % | 76 % / 44 % |
| Eingaben je Nacht | 104 | 151 |
| Entscheidungen je Nacht | 85 | 136 |
| davon echt | 72 (85 %) | 38 (30 %) |
| Möglichkeiten je Entscheidung | 6,5 | 2,2 |
| Ähnlichkeit zweier Nächte | 63 % | 49 % |
| verschiedene Kartenbilder im ersten Abschnitt (nur Ortsarten) | 72 % | 100 % |

**Ergebnisse: Spielweise** (Siegquote; in Klammern: erreicht Abschnitt 2)

| Rungholt | Zufall 0 % (27 %) · Draufgänger 4 % (98 %) · Bot 38 % (100 %) · Vorsichtig 50 % (100 %) |
|---|---|
| **Moorlicht** | **Zufall 0 % (0 %) · Draufgänger 0,4 % (18 %) · Angsthase 5 % (52 %) · Abwägend 20 % (76 %)** |

**Ergebnisse: über viele Nächte** (100 Spieler, Median)

| | Rungholt | Moorlicht |
|---|---|---|
| erster Sieg | Nacht 2 | Nacht 3 |
| alle Freischaltungen | Nacht 2 | Nacht 6 |
| Nächte mit Neuem 1–5 / 6–10 / 11–20 / 21–40 | 91 % / 41 % / 7 % / 1 % | 100 % / 82 % / 50 % / 15 % |
| dasselbe, nur Freischaltungen und Geschichte | 42 % / 3 % / 0 % / 0 % | 100 % / 74 % / 21 % / 0 % |
| letzte Nacht mit Freischaltung oder Geschichte | Nacht 3 (neugierig: 9) | Nacht 14 (neugierig: 27) |

**Ergebnisse: Umfang** (gezählt in den Inhaltsdaten)

| Rungholt | 22 Gegenstände (13 von Anfang an), 12 Gegner, 8 Ereignisse, 11 Chronik-Blätter, 3 Gefährten, 3 Abschnitte; 1136 Wörter Geschichte und Beschreibung |
|---|---|
| **Moorlicht** | **12 Funkenarten (7 von Anfang an), 13 Talismane, 4 Kräuter, 7 Ortsbesonderheiten, 11 Funde, 8 Notizen, 22 Gespräche, 3 Laternen, 3 Regionen; 2052 Wörter** |

**Geschätzte Dauer einer Nacht.** Rund 160–165 Taps je Bot-Nacht in beiden Spielen; bei 3–5
Sekunden je Tap samt Animation sind das 8–14 Minuten **[E]**. Die READMEs nennen 10–15 bzw. 10–20
Minuten **[belegt]**.

**Grenzen der Messung.** Bots sind keine Menschen: Sie lesen keine Texte, lernen nichts dazu und
spielen jeden Tag gleich gut **[belegt]**. Die Definition „echte Entscheidung“ ist für beide Spiele
verschieden gebaut und deshalb nur ein grober Vergleich **[unsicher]**. Rungholts Siegquote hängt
an meinen Startzahlen (38 % hier, 41 % im README mit anderen Startzahlen). Der „neugierige“ Spieler
bleibt bei der höchsten Schwierigkeit hängen, wo ein Mensch zurückschalten würde **[E]**. Gefühl,
Klang und Lesbarkeit misst das alles nicht.

---

## Warum so ähnlich

**Was beide gemeinsam haben** **[belegt]**

| Gemeinsamkeit | Rungholt | Moorlicht |
|---|---|---|
| Lauf-Struktur mit Freischaltungen (Roguelite) | [README:44–56][r-readme-regeln] | [README:31–41][m-readme-regeln] |
| 3 Abschnitte, jeder endet mit einem Wächter | [engine.js:179–184][r-stretches] | [engine.js:12][m-regeln], [inhalt.js:100–137][m-regionen] |
| Karte mit Rast, Händler, Ereignis; Belohnung „eins von dreien“ | [README:48, 53][r-readme-regeln] | [README:36–39][m-readme-regeln] |
| Nacht, Laterne, Irrlichter, Mond über dem Titel | [engine.js:99][r-irrlicht], eigenes Bildschirmfoto | [README:5–9][m-readme-intro], eigenes Bildschirmfoto |
| Norddeutsche Sage, Johannisnacht-Glöckchen in D-Dur-Pentatonik | [README:191–193][r-readme-gefuehl] | [README:81–83][m-readme-gefuehl] |
| Tagesnacht aus dem Datum | [engine.js:657][r-daily] | [engine.js:80–83][m-datum] |
| Gleicher Zufallsgenerator (mulberry32) wie alle drei alten Spiele | [engine.js:10–19][r-rng] | [engine.js:44–49][m-rng] |
| Spiellogik ohne Bildschirm, Bot stellt die Schwierigkeit ein | [README:226–238][r-readme-technik] | [README:149–155][m-readme-weitere] |
| Dieselben fünf Klassiker in der Recherche: Sid Meier, „Art of Screenshake“, *Into the Breach*, *Hades*, *Slay the Spire* | [README:85, 103, 124, 154, 160][r-readme-recherche] | [README:167, 170, 174, 179, 191][m-readme-recherche] |

**Was sie in diese Richtung gelenkt hat**

1. **Der Auftrag beschreibt die Lösung schon mit.** Er nennt als Mangel „Nach ein paar Partien ist
   alles gesehen“ und „keine verschiedenen Wege zum Ziel“ ([opus-1-auftrag.md:6–7][a-opus1],
   [fable-1-auftrag.md:6–7][a-fable1]) **[belegt]**. Das Lehrbuch-Gegenmittel für genau diese
   zwei Sätze ist das Roguelite mit Meta-Fortschritt und Ausrüstungsbau; beide haben es gewählt
   und begründen es so ([Rungholt-README:61–69][r-readme-warum], [Moorlicht-README:129–135][m-readme-warum])
   **[E]**.
2. **Das Lob für die alten Spiele wirkt wie eine Vorlage.** „Beim Spielgefühl hatte der Sound der
   Glühwürmchen in Johannisnacht seinen Charme, bei Welt und Atmosphäre Johannisnacht und
   Brückenwärter“ ([opus-1-auftrag.md:5][a-opus1]) **[belegt]**. Beide übernehmen daraufhin
   Glöckchenklang, Nacht und Küsten- bzw. Moorstimmung ausdrücklich
   ([Rungholt-README:70–72][r-readme-warum], [Moorlicht-README:136–139][m-readme-warum]) **[belegt]**.
   Ein Lob ist für ein Modell ein starkes Signal, es zu wiederholen **[E]**.
3. **Die Recherche-Frage hat eine Standardantwort.** „Was macht Spiele in diesen vier Punkten
   reizvoll? Zum Beispiel Game-Design-Artikel, Vorträge, Analysen erfolgreicher Spiele“
   ([opus-1-auftrag.md:10][a-opus1]) **[belegt]** führt zu den bekanntesten GDC-Vorträgen; beide
   fanden dieselben fünf, und diese fünf beschreiben fast alle Roguelites mit angesagten Gegnerzügen
   **[belegt]** für die Überschneidung, **[E]** für die Wirkung.
4. **Die Prüfkriterien im /goal begünstigen rundenbasierte Läufe.** Logik-Tests und ein
   Browser-Test, der per Tippen „einen vollständigen Ablauf vom Start bis zu einem Ende- oder
   Zwischenstand“ spielt ([opus-2-goal.md:5–6][a-opus2]) **[belegt]**, sind mit einem Spiel aus
   klaren Zügen und klarem Ende am leichtesten zu erfüllen; Echtzeit oder Physik wären schwerer zu
   testen **[E]**.
5. **Die alten Spiele geben den Code-Stil vor.** Alle drei alten Spiele nutzen denselben
   Zufallsgenerator ([johannisnacht/index.html:302–304][j-rng], [deichgraf/web/engine.js:41–44][d-rng],
   [brueckenwaerter/engine.js:50–54][b-rng]), zwei haben einen Autopiloten für die Balance
   ([deichgraf/README.md:104][d-readme]) **[belegt]**. Beide neuen Spiele bauen genauso **[belegt]**.
   Deichgraf und Brückenwärter liefern außerdem die Nordsee, die Rungholt aufgreift **[belegt]**
   ([Rungholt-README:70–71][r-readme-warum]).
6. **Dieselbe Herkunft.** Beide Modelle stammen von Anthropic und haben vermutlich ähnliche
   Vorlieben gelernt; „Laterne in der Nacht mit Irrlichtern“ als Bild für Atmosphäre liegt beiden
   offenbar nah **[unsicher]**: Mit einem Spiel je Modell lässt sich das nicht vom Auftrag trennen.

Opus kannte Rungholt nicht: Der Startstand `d03aaf2` enthält keinen Ordner `rungholt/`, und im
Protokoll der Opus-Sitzung kommt das Wort nicht vor **[belegt]** (`git ls-tree d03aaf2`,
Protokoll ab 23:38). Die Ähnlichkeit ist also kein Abschreiben **[belegt]**.

**Wo sie sich trotzdem unterscheiden** **[belegt]**: Würfel-Zuordnung gegen Ziehen aus einem Glas;
echte Sage gegen erfundene Familiengeschichte; Offline-App gegen Speichern mitten in der Nacht;
lose Schrittauswahl gegen verbundene Wege.

---

## Welches Modell wofür

Alles hier ist **[E]** und beruht auf je einem Lauf (siehe [Grenzen](#grenzen-dieses-vergleichs)).

**Was ich aus Fables Lauf mitnehme**

* *Stärken:* prüft nach, ohne dass man es verlangt: Quellen in einem zweiten Durchgang abgeglichen
  und eine falsche Angabe berichtigt ([README:77–83][r-readme-recherche]), Tippflächen gemessen
  ([smoke.test.js:195–208][r-smoke-44]), einen wackligen Test der alten Spiele fünfmal
  wiederholt, bevor er ihn reparierte (Protokoll 22:17–22:21) **[belegt]**. Erledigt einen
  Auftrag aus zwei Teilen sauber nacheinander (Aufräumen in 8 Minuten, eigener Commit)
  **[belegt]**. Schlanker Code (2970 statt 4061 Zeilen) **[belegt]**.
* *Schwächen:* weniger Inhalt und eine Langzeitmotivation, die früh ausläuft (Messung)
  **[belegt]**. Hängt sich an Einwände, die in der Umgebung nicht lösbar sind, bis zur Rundengrenze
  **[belegt]**, Protokoll. Teurer je Lauf (Listenpreis etwa das Doppelte bei ähnlicher Laufzeit)
  **[belegt]**.

**Was ich aus Opus' Lauf mitnehme**

* *Stärken:* plant ausführlich vor und baut dann eine größere, zusammenhängende Welt: mehr Text,
  Figuren, die auf Fortschritt reagieren, Regeln, die die Geschichte spiegeln **[belegt]**. Denkt an
  Alltagsfälle wie das Fortsetzen einer Nacht und reduzierte Bewegung **[belegt]**. Belegt die
  eigene Balance mit drei Spielstilen und einem Test dafür ([engine.test.js:468][m-test-stile])
  **[belegt]**. Günstiger je Lauf **[belegt]**.
* *Schwächen:* flacherer Kern (2,2 Möglichkeiten je Entscheidung) **[belegt]**. Die Recherche ist
  nicht geprüft: Quellen nur aus Suchergebnissen, keine Seite geöffnet, das README in zwei Minuten
  am Ende geschrieben **[belegt]**, Protokoll. Kein Offline-Betrieb **[belegt]**.

**Empfehlung**

| Aufgabe | Modell | folgt aus |
|---|---|---|
| Aufräumen, Umbauen, Testen, Fehlersuche, alles mit Nachweis | Fable | Prüfdisziplin, Aufräumen in 8 min |
| Quellenarbeit, Recherche mit Belegen | Fable | zweiter Prüfdurchgang, berichtigte Angabe |
| Erster Entwurf einer Spielwelt, Texte, Figuren, Systeme mit viel Inhalt | Opus | 2052 gegen 1136 Wörter, längere Neuigkeitskurve |
| Spielmechanik mit Tiefe im einzelnen Zug | eher Fable, aber unsicher | 6,5 gegen 2,2 Möglichkeiten; bei n = 1 kann das am Genre liegen |
| Viele Läufe für wenig Geld | Opus | etwa 10 gegen etwa 17 USD |
| Ein Spiel wie dieses | Opus entwerfen und Inhalte schreiben lassen, Fable danach prüfen und nachschärfen lassen | beide Stärkenprofile |

Wenn du Opus nimmst, verlange die Prüfung ausdrücklich, zum Beispiel: „Öffne jede Quelle, bevor du
sie zitierst; was du nicht öffnen konntest, kennzeichne so.“ Wenn du Fable nimmst, gib ihm
Erlaubnis aufzuhören: „Was in der Umgebung nicht geht, nenne einmal und arbeite nicht weiter daran.“

---

## Bessere Aufträge

Alle Vorschläge sind **[E]** und folgen aus den Ursachen unter [Warum so ähnlich](#warum-so-ähnlich).

1. **Erst in die Breite, dann wählen** (gegen Ursache 1 und 3).
   > „Entwirf zuerst sechs Spielideen aus sechs verschiedenen Genres, die sich in Kernmechanik,
   > Schauplatz und Stimmung unterscheiden. Streiche die naheliegendste und sag, warum sie
   > naheliegend war. Baue dann die ungewöhnlichste, die die vier Punkte trotzdem erfüllt, und
   > halte alle sechs im README fest.“
2. **Das Erwartbare ausdrücklich ausschließen** (gegen Ursache 1, 2 und 6).
   > „Kein Roguelike oder Roguelite, keine Karte mit Knoten, keine Belohnung ‚eins aus drei‘.
   > Nicht nachts, keine Laterne, keine Irrlichter, kein Moor und keine Nordsee.“

   Wer nichts ausschließen will, kann stattdessen fragen: „Was würde jedes Modell bei diesem
   Auftrag bauen? Bau das nicht.“
3. **Lob abstrakt formulieren statt mit Namen** (gegen Ursache 2).
   > Statt „der Sound der Glühwürmchen in Johannisnacht hatte Charme“:
   > „Mir gefällt Klang, der auf jede Berührung antwortet und beruhigt. Übernimm keine Klänge,
   > Schauplätze oder Figuren aus den alten Spielen.“
4. **Einen Anker vorgeben, der jedem Lauf eine andere Richtung gibt** (gegen Ursache 6 und für
   faire Modellvergleiche).
   > „Das zentrale Verb des Spiels ist *tauschen*.“ (beim nächsten Lauf: *bauen*, *zuhören*,
   > *verstecken* …)
   > „Schauplatz: ein Ort, den du zufällig aus dieser Liste nimmst: Bahnhof, Unterwasserstation,
   > Bäckerei, Gewächshaus, Orbit. Nenne im README, was du gewürfelt hast.“
5. **Die Recherche aus dem Kanon lenken** (gegen Ursache 3).
   > „Mindestens drei Quellen außerhalb von GDC und Game Developer, etwa Brettspiel-Design,
   > Spielkritik, Interviews mit Spielern. Nicht als Quelle: Sid Meier, ‚Art of Screenshake‘,
   > *Slay the Spire*, *Hades*, *Into the Breach*. Öffne jede Quelle, bevor du sie zitierst.“
6. **Die Tests offen für andere Genres halten** (gegen Ursache 4).
   > „Der Browser-Test darf auch ein Echtzeit- oder Physikspiel bedienen; ein festgelegter Zufall
   > und ein Testmodus mit verlangsamter Zeit sind erlaubt.“
7. **Die Langzeitmotivation messbar machen, ohne die Lösung vorzugeben.**
   > „Nach der zehnten Partie soll es noch etwas geben, das ich noch nicht gesehen habe. Zeig mit
   > einer Simulation, ab welcher Partie nichts Neues mehr kommt.“
8. **Für einen Modellvergleich:** jedem Modell zwei oder drei Läufe mit verschiedenen Ankern geben,
   den Startstand gleich halten und den Aufräumteil weglassen oder beiden geben. Dann lassen sich
   Modell und Auftrag auseinanderhalten.

---

## Vorschläge je Spiel

Alle Vorschläge sind **[E]**; in Klammern steht der Befund, aus dem sie folgen.

### Rungholt

1. **Die angefangene Nacht speichern**, damit ein Tab-Wechsel auf dem iPad keine zehn Minuten
   kostet (Befund: gespeichert wird nur am Ende, [index.html:336–339][r-save]).
2. **Eine Karte mit verbundenen Wegen und Vorausschau**, damit die Wegwahl zur Planung wird (Befund:
   jeder Schritt ist unabhängig, [engine.js:279][r-options]).
3. **Mehr, das zwischen den Nächten erzählt wird**: Menschen auf der Hallig, die auf deinen
   Fortschritt reagieren, oder Chronik-Blätter an mehr und verschiedeneren Bedingungen (Befund:
   neue Geschichte endet beim Bot-Spieler nach Nacht 3 bis 9, Messung).
4. **Mehr Ereignisse und längere Gegnermuster**, auch Zufallsregeln je Nacht (Befund: 8 Ereignisse,
   Gegnermuster aus drei Zügen, [README:292–297][r-readme-einsch]; Ähnlichkeit zweier Nächte 63 %).
5. **Bewegung reduzierbar machen** über die Systemeinstellung (Befund: keine Fundstelle).
6. **Die Gegner sichtbarer machen**: eigene kleine Bewegungen statt fester Linienzeichnung (Befund:
   [README:285–286][r-readme-einsch], eigenes Bildschirmfoto).

### Moorlicht

1. **Mehr Abwägung in den einzelnen Zug bringen**, etwa zwei Funken sehen und einen wählen, einen
   gezogenen Funken gegen Glanz zurücklegen, oder Stationen, die eine bestimmte Kälte verlangen
   (Befund: 2,2 Möglichkeiten je Entscheidung, nur 30 % riskant, README nennt die „Formel“).
2. **Offline und als App spielbar machen** (Service Worker und Manifest) (Befund: fehlt,
   [index.html:8–11][m-html-head]).
3. **Texte auf kleinen Bildschirmen entzerren**: Hinweisbox und fliegende Zahlen nicht über die
   Laterne legen (Befund: Überlagerung auf meinem Bildschirmfoto, **[unsicher]**).
4. **Etwas nach dem Ende der Geschichte**: wechselnde Regeln je Nacht oder Aufgaben der
   Dorfbewohner, damit nach Nacht 14 bis 27 nicht nur die Schwierigkeit bleibt (Befund: Messung,
   [README:258–262][m-readme-einsch]).
5. **Die Regionen spielerisch unterscheiden**, nicht nur im Bild (Befund: [README:261–262][m-readme-einsch]).
6. **Die Recherche nachprüfen**: jede Quelle öffnen und die Übernahmen daran messen (Befund: kein
   Seitenabruf im Lauf).

### Beide

* **Ein spoilerfreies README**: Spielanleitung oben, alles über spätere Inhalte in einen
  zugeklappten Abschnitt (Befund: beide READMEs nennen spätere Wächter und Freischaltungen).
* **Auf einem echten iPad und iPhone ausprobieren**, vor allem den Ton (Befund: beide nur in
  Chromium mit Touch-Nachbildung getestet; die Opus-Sitzung zeigt, dass der Ton am iPad nur bei
  ausgeschaltetem Stummmodus zu hören ist).

---

## Deine Bewertung neben meiner

**Deine Bewertung fehlt.** Im Auftrag stand an dieser Stelle noch der Platzhalter
„<<MEINE BEWERTUNG: …>>“ **[belegt]**. Ohne Rückfrage kann ich sie nicht eintragen; auf der
[Seite zum Durchklicken](index.html#bewertung) kannst du deine Punkte eingeben, dann zeigt sie
die Abweichungen sofort an.

**Meine Bewertung** (1 = schwach, 5 = stark), jeweils **[E]**:

| Punkt | Rungholt | Moorlicht | Begründung |
|---|---|---|---|
| Langzeitmotivation | 3 | 4 | Moorlicht bringt bis etwa Nacht 14 fast jede Nacht Neues, Rungholt beim geübten Spieler nur bis Nacht 3 bis 9 (Messung). Gegenargument: Bot-Zahlen, endlicher Text. |
| Spielgefühl | 3 | 3 | Beide mit vielen Rückmeldungen; ich habe nichts gehört und nichts in der Hand gehabt. |
| Spannende Entscheidungen | 4 | 3 | 6,5 gegen 2,2 Möglichkeiten je Entscheidung, 85 % gegen 30 % echte; Moorlicht dafür mit echter Routenplanung. |
| Welt und Atmosphäre | 3 | 4 | Moorlicht mit Figuren und Regeln, die die Geschichte spiegeln; Rungholt mit echtem Stoff, aber fast nur in Blättern erzählt. Gegenargument: Hades-Rahmen, Dorf als Menü. |
| Technik und Tests | 4 | 4 | Rungholt offline und gründlicher geprüft, Moorlicht verliert keine Nacht. |

**Wo deine Bewertung vermutlich abweicht und warum** **[E]**:

* *Langzeitmotivation:* Nach zwei, drei Partien hast du von beiden Spielen nur den Anfang gesehen.
  Dort sind sie in meiner Messung gleichauf (in den ersten fünf Nächten bringt fast jede Nacht
  etwas Neues); der Unterschied zeigt sich erst ab Nacht 6.
* *Spielgefühl:* Hier misst du etwas, das ich nicht messen kann. Wenn du abweichst, gilt dein Wert.
* *Entscheidungen:* Wer Moorlichts Risiko-Anzeige spannend findet, erlebt das Ziehen als Nervenkitzel
  und nicht als Formel; das ist eine Frage des Geschmacks, nicht der Zählung.
* *Welt:* Mein Urteil stützt sich auch auf Texte, die du noch nicht gelesen hast.

---

## Grenzen dieses Vergleichs

* **Ein Spiel je Modell.** Ob Fable immer tiefere Mechaniken und Opus immer mehr Welt baut, oder ob
  das an den zwei gewählten Genres liegt, lässt sich aus einem Lauf nicht trennen **[belegt]** als
  Grenze. Ein zweiter Lauf desselben Modells könnte ein ganz anderes Spiel liefern **[unsicher]**.
* **Nicht derselbe Auftrag.** Fable musste zusätzlich aufräumen, hatte ein strengeres /goal (Punkt 1
  mit Branch-Löschen und Service-Worker-Test) und startete von einem anderen Stand **[belegt]**
  ([fable-2-goal.md][a-fable2], [opus-2-goal.md][a-opus2]).
* **Befangenheit.** Ich bin Opus 5.5. Ich habe deshalb Gegenargumente ergänzt, aber auch die Wahl,
  was ich messe, kann gefärbt sein **[E]**.
* **Bots statt Menschen**, kein Ton, keine echten Geräte, keine geöffneten Quellseiten (siehe
  [Messungen](#messungen-mit-methode)).

[r-unlocks]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L83-L88
[r-readme-bleibt]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L56
[r-readme-lang]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L174-L183
[r-chronik-spaet]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L170-L175
[r-readme-einsch]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L275-L307
[r-readme-gefuehl]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L185-L195
[r-sfx-hit]: https://github.com/BabyPython67/Projects/blob/main/rungholt/index.html#L390-L391
[r-shake]: https://github.com/BabyPython67/Projects/blob/main/rungholt/index.html#L150-L151
[r-penta]: https://github.com/BabyPython67/Projects/blob/main/rungholt/index.html#L383
[r-readme-geraet]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L20-L27
[r-intent]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L432-L439
[r-place]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L482-L500
[r-options]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L279
[r-maxgear]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L186
[r-readme-intro]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L3-L10
[r-chronik]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L153-L176
[r-readme-welt]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L210-L219
[r-readme-technik]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L221-L242
[r-smoke-44]: https://github.com/BabyPython67/Projects/blob/main/rungholt/tests/smoke.test.js#L195-L208
[r-sw]: https://github.com/BabyPython67/Projects/blob/main/rungholt/index.html#L889-L890
[r-save]: https://github.com/BabyPython67/Projects/blob/main/rungholt/index.html#L336-L339
[r-finish]: https://github.com/BabyPython67/Projects/blob/main/rungholt/index.html#L825-L829
[r-tests]: https://github.com/BabyPython67/Projects/blob/main/rungholt/tests/engine.test.js
[r-readme-recherche]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L75-L170
[r-readme-regeln]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L44-L56
[r-stretches]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L179-L184
[r-irrlicht]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L99
[r-daily]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L657
[r-rng]: https://github.com/BabyPython67/Projects/blob/main/rungholt/engine.js#L10-L19
[r-readme-warum]: https://github.com/BabyPython67/Projects/blob/main/rungholt/README.md#L61-L73
[m-freischaltungen]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/inhalt.js#L171-L181
[m-readme-lang]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L47-L65
[m-auswerten]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L678-L722
[m-sp1]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L701-L704
[m-sp2]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/inhalt.js#L161-L168
[m-sp3]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L709-L712
[m-readme-einsch]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L236-L262
[m-readme-gefuehl]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L67-L83
[m-hitstop]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/spiel.js#L907
[m-beben]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/spiel.js#L91-L95
[m-frost]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/spiel.js#L582-L585
[m-herz]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/spiel.js#L902
[m-klang]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/klang.js#L1-L8
[m-reduced]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/stil.css#L287
[m-gefahr]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L386-L395
[m-vorschau]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L397-L412
[m-wege]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L193-L199
[m-rast]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L509-L518
[m-readme-intro]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L5-L9
[m-gespraeche]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/inhalt.js#L317-L368
[m-readme-welt]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L113-L127
[m-notizen]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/inhalt.js#L305-L314
[m-waechter]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/inhalt.js#L121-L137
[m-readme-aufbau]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L196-L208
[m-smoke-konsole]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/tests/smoke.test.js#L20-L21
[m-html-head]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/index.html#L1-L31
[m-fortsetzen]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/spiel.js#L685
[m-smoke-reload]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/tests/smoke.test.js#L145
[m-test-gefahr]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/tests/engine.test.js#L164
[m-test-stile]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/tests/engine.test.js#L468
[m-readme-recherche]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L159-L194
[m-readme-regeln]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L31-L41
[m-regeln]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L11-L34
[m-regionen]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/inhalt.js#L100-L137
[m-datum]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L80-L83
[m-rng]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/js/engine.js#L44-L49
[m-readme-weitere]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L141-L157
[m-readme-warum]: https://github.com/BabyPython67/Projects/blob/main/moorlicht/README.md#L129-L139
[a-opus1]: https://github.com/BabyPython67/Projects/blob/main/vergleich/auftraege/opus-1-auftrag.md
[a-opus2]: https://github.com/BabyPython67/Projects/blob/main/vergleich/auftraege/opus-2-goal.md
[a-fable1]: https://github.com/BabyPython67/Projects/blob/main/vergleich/auftraege/fable-1-auftrag.md
[a-fable2]: https://github.com/BabyPython67/Projects/blob/main/vergleich/auftraege/fable-2-goal.md
[j-rng]: https://github.com/BabyPython67/Projects/blob/main/johannisnacht/index.html#L302-L304
[d-rng]: https://github.com/BabyPython67/Projects/blob/main/deichgraf/web/engine.js#L41-L44
[b-rng]: https://github.com/BabyPython67/Projects/blob/main/brueckenwaerter/engine.js#L50-L54
[d-readme]: https://github.com/BabyPython67/Projects/blob/main/deichgraf/README.md#L104
[messen]: https://github.com/BabyPython67/Projects/blob/main/vergleich/werkzeuge/messen.js
[ergebnisse]: https://github.com/BabyPython67/Projects/blob/main/vergleich/werkzeuge/ergebnisse.json
[laufdaten]: https://github.com/BabyPython67/Projects/blob/main/vergleich/werkzeuge/laufdaten.json
