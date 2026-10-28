# Carreau – Boule unter Platanen

Ein Nachmittag auf dem Dorfplatz von Saint-Aurel: Kies, Zikaden, das Klacken von Stahl auf Stahl.
Du spielst Boule (Pétanque) Mann gegen Mann gegen die Leute aus dem Dorf – jeder mit eigener Art
zu spielen –, auf Plätzen, die jedes Mal anders sind und sich jede Aufnahme ein bisschen verändern.
Jeder Wurf ist eine Entscheidung (legen oder schießen? rollen oder hoch werfen? wohin?) und eine
Ausführung mit der eigenen Hand. Kein Würfel entscheidet für dich.

- **Künftige Adresse (live, sobald Mirko das Spiel nach `main` übertragen hat):**
  `https://babypython67.github.io/Projects/carreau/`
- **Lokal starten:** `cd carreau && npm start` → <http://localhost:8080/> öffnen
  (ohne npm geht auch `cd carreau && python3 -m http.server 8080`).
- Kein Konto, keine API-Keys, keine externen Server. Alles läuft als statische Seite.

*Dieses README entsteht während der Entwicklung und wird fortlaufend ergänzt.*

---

## Recherche

**Wichtig vorab:** Die Websuche funktionierte, das *Öffnen* fremder Seiten nicht – das Netzwerk dieser
Cloud-Umgebung sperrt alle Hosts außer Paketquellen (Fehler `getaddrinfo ENOTFOUND` für
lostgarden.com, skeletoncodemachine.com, indieorama.com, newsblog.drexel.edu, meeplemountain.com).
Ich konnte deshalb **keine Quelle selbst öffnen**; was unten steht, stützt sich auf die Auszüge, die
die Suche zu jeder Seite geliefert hat, plus mein Vorwissen. Jede Quelle ist entsprechend markiert.

| # | Quelle | Art | Was ich übernommen habe | Geöffnet? |
|---|--------|-----|-------------------------|-----------|
| 1 | Daniel Cook: [„Loops and Arcs“](https://lostgarden.com/2012/04/30/loops-and-arcs), Lostgarden (2012) | Designer-Blog (außerhalb der Klassiker) | Dauerhafter Reiz kommt aus *Schleifen*, die das mentale Modell des Spielers immer wieder aktualisieren; *Bögen* (Story, Freischaltungen) werden verbraucht. Darum trägt Carreau die Wurf-Schleife mit sichtbarem Feedback (Rollspur bleibt im Kies) und nicht Inhalte. | Nein – Host gesperrt, nur Suchauszug |
| 2 | Skeleton Code Machine: [„Input-Output Randomness (Part 1)“](https://www.skeletoncodemachine.com/p/input-output-randomness-part-1) (nach Geoff Engelstein) | Brettspiel-Design (außerhalb) | Zufall *vor* der Entscheidung fordert Können, Zufall *nach* der Entscheidung macht gute Züge kaputt. Darum werden Platz und Gegner vorher ausgewürfelt; der Wurf selbst hat keinen versteckten Würfel – die Streuung kommt nur aus deinem Timing. | Nein – Host gesperrt, nur Suchauszug |
| 3 | Rich Vreeland (Disasterpeace) im Interview: [„The Programmed Music of Mini Metro“](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace), Designing Sound | Interview (außerhalb) | Kaum Trennung zwischen Klangdesign und Musik, Klang aus Spielereignissen statt aus Loops. Jeder Klang in Carreau wird live aus Aufprallgeschwindigkeit, Material und Boden synthetisiert – nichts ist aufgenommen. | Nein – nur Suchauszug |
| 4 | [„How the World's Greatest Game Designer Designs Games“](https://mentalfloss.com/article/26896/how-worlds-greatest-game-designer-designs-games) (Reiner Knizia, Mental Floss) und [Meeple Mountain interviews Dr. Reiner Knizia](https://www.meeplemountain.com/interviews/meeple-mountain-interviews-dr-reiner-knizia/) | Brettspiel-Interviews (außerhalb) | Testen und Verfeinern sind laut Knizia das „Lebenselixier“ des Designs, aber „Spieldesign ist keine Wissenschaft, sondern Kunst“. Daraus: Hunderte Bot-Partien als unermüdliche Testspieler – und trotzdem Feinschliff nach Gefühl, wenn die Zahlen stimmen, das Spiel sich aber falsch anfühlt. | Nein – Host gesperrt, nur Suchauszug |
| 5 | Kritiken zu *Desert Golfing*: [The Tiny Narrative](https://thetinynarrative.substack.com/p/desert-golfing), [Vice/Creators](https://creators.vice.com/en/article/wnjg4b/why-hardcore-gamers-are-hooked-on-a-2d-desert-golf-game) | Spielkritik (außerhalb) | Eine einzige Geste plus endlos neue, prozedurale Bahnen trägt über Monate; das Spiel lässt sich jederzeit aufnehmen und weglegen und „ist noch da, wenn man zurückkommt“. Daraus: prozedurale Plätze, kurze Aufnahmen, Speichern nach jedem Wurf. | Nein – nur Suchauszug |
| 6 | Elias, Garfield, Gutschera: [*Characteristics of Games*](https://mitpressbookstore.mit.edu/book/9780262542692) (MIT Press) und Garfield zu Glück, zitiert bei [Tom Sloper](https://sloperama.com/mahjongg/column2/column808.html) | Buch und Kolumne von Karten-/Brettspiel-Designern (außerhalb) | Glück und Können sind zwei getrennte Achsen; ein wenig Glück wirkt als „sozialer Ausgleich“, damit Schwächere dranbleiben. Daraus: Glück gibt es nur als kleine, *sichtbare* Unebenheit (Grobkies) und den Münzwurf am Anfang – gemessen wird, dass Können klar dominiert (siehe „Messung“). | Nein – nur Suchauszug |
| 7 | [„Q+A: The Legacy of Tetris“](https://newsblog.drexel.edu/2023/04/05/qa-the-legacy-of-tetris/), Drexel University | Wissenschaftliche Spielkritik (außerhalb) | Tetris als fast perfektes „leicht zu lernen, schwer zu meistern“: jede Partie ist ein neues Spiel, die Schwierigkeit verschwindet nie. Daraus: keine auswendig lernbaren Level – jeder Platz und jede Lage um die Sau ist neu. | Nein – Host gesperrt, nur Suchauszug |
| 8 | Obut: [„How to shoot your pétanque boule properly“](https://obut.com/en/blog/petanque/how-to-shoot-your-petanque-boule-properly), ActiveSG: [„Common petanque strategies“](https://www.activesgcircle.gov.sg/learn/petanque/common-petanque-strategies) | Fachwissen Pétanque | Wer nicht den Punkt hat, wählt zwischen Legen und Schießen; der beste Punkt ist manchmal nicht der nächste, sondern einer, der blockiert. Das steckt in der Bewertungsfunktion der Dorf-KI und in den Tipps. | Nein – nur Suchauszug |
| 9 | GDC Board Game Design Day: [„White, Brown, and Pink: The Flavors of Tabletop Game Randomness“](https://gdcvault.com/play/1024920/Board-Game-Design-Day-White) und Game Developer zu [„Mini Metro: When Less Is More“](https://www.gamedeveloper.com/design/attend-gdc-2017-and-learn-the-value-of-less-is-more-from-a-i-mini-metro-i-dev) | Klassiker (GDC / Game Developer) | Bestätigung von 2 (Zufall muss Form haben) und: in einem reduzierten Spiel *ist* Grafikdesign Spieldesign. Daraus: wenige, klar lesbare Elemente (Kugeln, Sau, Schattierung des Bodens) statt Effektgewitter. | Nein – nur Suchauszug |

Quellen 1–8 liegen außerhalb der üblichen Klassiker (Designer-Blog, Brettspiel-Design, Interviews,
Spielkritik, Fachliteratur); nur 9 gehört dazu.

---

## Wie die Idee entstand

### Anker

Zwei breit gestreute Listen, dann je ein Eintrag per Zufallszahl:

| Nr. | Kernverb | Schauplatz |
|----:|----------|------------|
| 1 | werfen | Dorfplatz in der Provence |
| 2 | lenken | Raumstation im Orbit |
| 3 | stapeln | Glockenturm einer Stadtkirche |
| 4 | tauschen | Karawanserei in der Wüste |
| 5 | verbinden | Steilwand im Hochgebirge |
| 6 | schneiden | Uhrmacherwerkstatt |
| 7 | balancieren | zugefrorener Alpensee |
| 8 | lauschen | Nachtmarkt in Taipeh |
| 9 | wachsen lassen | Tiefsee-Forschungsstation |
| 10 | verhandeln | barocke Klosterbibliothek |
| 11 | umleiten | Waldboden / Pilzgeflecht |
| 12 | falten | Teehaus in Kyoto |
| 13 | jonglieren | Vulkaninsel |
| 14 | verstecken | Fahrradwerkstatt im Hinterhof |
| 15 | klettern | U-Bahn-Netz einer Großstadt |
| 16 | takten | Zirkuszelt |

Befehl und Ergebnis (Zahlen von 1 bis 16, kryptografischer Zufall):

```
$ node -e "const c=require('crypto');const v=c.randomInt(1,17), o=c.randomInt(1,17);console.log('Verb-Nr.', v, '| Schauplatz-Nr.', o)"
Verb-Nr. 11 | Schauplatz-Nr. 12
```

**Anker: „umleiten“ × „Teehaus in Kyoto“.**

### Sieben Ideen

1. **Kakehi** *(direkt aus dem Anker)* – Echtzeit-Fluss-Puzzle in einem Kyotoer Teegarten: Du drehst
   Bambusrinnen und leitest Wasser so um, dass Shishi-odoshi (Bambus-Wippen) im Takt kippen; der Garten
   wird zum Rhythmusinstrument. Ruhig, meditativ, Holz und Wasser.
2. **Chaji** *(auch aus dem Anker)* – Du bist Teemeister und leitest das *Gespräch* einer Teezeremonie
   um: Gäste mit verborgenen Stimmungen, Themenkarten, Harmonie halten, ohne dass jemand das Gesicht
   verliert. Leises soziales Taktikspiel.
3. **Carreau** – Boule (Pétanque) auf prozeduralen Dorfplätzen in der Provence, nachmittags unter
   Platanen. Physik-Wurf mit eigener Hand, echte Taktik (legen oder schießen, Kugeln in Reserve, die Sau
   verschieben), Dorfbewohner als Gegner mit eigenem Stil. Warm, sonnig, gesellig.
4. **Wechselläuten** – Glockenturm einer Stadtkirche am Sonntagmorgen: Du lenkst die Reihenfolge von
   sechs Glocken (englisches Change Ringing). Jede Reihe darf nur einmal erklingen, musikalische Reihen
   bringen Punkte, am Ende musst du zurück in die Ausgangsreihe finden. Ein Permutations-Puzzle, das klingt.
5. **Umlauf** – Ein kleiner Schlepper an einer Raumstation im Orbit. Mit wenigen Schubimpulsen
   Schrott einsammeln und Fracht zustellen; echte Bahnmechanik (gegen die Fahrtrichtung bremsen, um
   schneller zu werden). Kühl, still, weit.
6. **Myzel** – Abstraktes Territorialspiel auf dem Waldboden: zwei Pilzgeflechte wachsen um Nährstoffe,
   Go-artige Tiefe, organische Grafik.
7. **Seilschaft** – Rundenbasierte Kletterroute in einer Granitwand: Griffe wählen, Sicherungen setzen
   (kosten Zeit, retten beim Sturz), Wetter zieht auf. Push-your-luck in der Senkrechten.

### Gestrichen: die naheliegendste

**Kakehi.** Sie ist die wörtlichste Übersetzung des Ankers und landet sofort in einer Genre-Schablone:
Wasser durch Rohre umleiten ist *Pipe Mania* mit Bambus, und „Zen-Garten mit Wasserklang“ ist eines der
häufigsten Bilder im Mobile-Puzzle-Regal. Dazu kommt: Wasser lenken war schon der Kern des
Sturmflut-Spiels am Deich – genau die Wiederholung, die vermieden werden soll.

### Die Wahl: Carreau

Gemessen an den vier Ansprüchen:

- **Über Wochen fesselnd:** Boule ist ein Spiel, das Menschen ihr Leben lang jeden Nachmittag spielen –
  ohne Freischaltungen. Der Reiz steckt im System: Physik + Taktik + immer neue Plätze + Gegner mit Stil.
  *Desert Golfing* zeigt, dass eine Geste auf endlos neuen Bahnen Monate trägt; Carreau hat dazu noch
  einen Gegner, der zurückschlägt.
- **Tiefe zum Meistern:** Drei Schichten Können – Hand (Timing des Wurfs), Auge (Boden lesen: Gefälle,
  Sand, Grobkies, Wurzeln, Krater früherer Würfe) und Kopf (Taktik: legen oder schießen, wann eine
  Kugel in Reserve halten, die Sau ins Aus schießen). Zufall gibt es fast nur *vor* der Entscheidung.
- **Andere würden es spielen:** Die Regeln kennt jeder in fünf Minuten, das Klacken eines Carreaus
  versteht man ohne Erklärung, und zu zweit an einem iPad ist es ein echtes Partyspiel. Ein Boule-Spiel
  mit dieser Mischung aus Physik und Taktik gibt es im Browser praktisch nicht.
- **Ausbaufähig:** Doublette/Triplette mit Mitspielern, Turniere, Online-Duelle mit gleichem Platz-Seed,
  Karriere durch Dörfer und Plätze, weitere Wurfarten (Effet) – alles setzt auf denselben Physik- und
  Regelkern.

Warum nicht die anderen: *Wechselläuten* ist die eigenwilligste Idee und hat mich gereizt, aber
die Einstiegshürde (Permutationen im Kopf) ist so hoch, dass kaum jemand es Freunden schicken würde.
*Umlauf* hat Tiefe, droht aber zur Lieferroutine zu werden, und präzise Bahnplanung per Finger auf dem
Handy ist zäh. *Myzel* steht und fällt mit einer starken KI für ein Go-artiges Spiel – riskant in einer
ersten Version. *Chaji* und *Seilschaft* haben zu wenig messbares Können (Gesprächsstimmungen bzw. viel
Zufall beim Wetter).

Carreau unterscheidet sich klar von den früheren Spielen: Kernmechanik ist ein Physik-Wurf mit
Taktik gegen einen Gegner (kein Roguelite, kein Fangen, keine Simulation, keine Runden-Strategie gegen
die Natur), Schauplatz ist ein sonniger südfranzösischer Dorfplatz (nicht nachts, nicht Küste, nicht
Norddeutschland), Stimmung ist warm, gesellig und ein bisschen kompetitiv.
