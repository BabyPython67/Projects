# Was ich dort hörte – Dantes Inferno

Ein Spiel nach dem ersten Teil von Dantes *Göttlicher Komödie*. Du bist Dante. Mit Vergil steigst du durch die neun Kreise der Hölle hinab, vom dunklen Wald bis zu Luzifer im Eis. Gespielt wird im Browser auf iPad und Handy. Das Spiel sieht aus wie eine bebilderte Handschrift des 14. Jahrhunderts. Erkundet wird vor allem mit den Ohren: Wer den Finger auf ein Bild legt, hört die Seelen, bevor er sie sieht.

**Starten (lokal):** `cd spiele/inferno && npm start`, dann <http://127.0.0.1:8080/> öffnen. Ohne Node genügt jeder statische Server im Ordner `spiele/inferno/`, denn es gibt keinen Build-Schritt.
**Tests:** `npm install`, danach `npm test` (Logik) und `npm run test:browser` (Playwright, iPad- und Handygröße).

> Was in den Begegnungen und Prüfungen im Einzelnen geschieht, steht unten nur in zugeklappten Abschnitten. Wer sich nichts verderben will, lässt sie zu.

---

## Wie die Idee entstand

Breite zuerst: Ich habe neun verschiedene Wege gesammelt, das Inferno als Spiel nachzuerleben.

| # | Idee | Kurz | Urteil |
|---|------|------|--------|
| 1 | ~~**Kreis-für-Kreis-Textabenteuer mit Spiegelrätseln**~~ | Text pro Kreis, Dialogwahl, und jede Prüfung ist ein Rätsel, das die Strafe des Kreises spiegelt (im Wind gegen den Sturm laufen, im Eis etwas auftauen). | **Gestrichen, die naheliegendste.** Sie macht den Pilger zum Sünder, der die Strafe nachspielt, obwohl Dante gerade nicht bestraft wird, sondern geprüft. Sie ergibt neun Rätsel derselben Machart. Außerdem liegt sie zu nah an dem Textspiel nach einem Theaterstück, das es im Repo schon gibt. |
| 2 | **Was ich dort hörte** | Eine bebilderte Handschrift, in der man lauschend erkundet. Die Prüfungen nutzen die Gesten des Geräts (halten, folgen, schieben, zögern, brechen, sammeln) und prüfen Dantes Herz statt seiner Geschicklichkeit. | **Gebaut.** |
| 3 | Botticellis Karte | Die ganze Hölle als ein riesiges Trichterbild wie Botticellis *Mappa dell'Inferno*, in das man hineinzoomt, ein Wimmelbild der Verdammten. | Großer Überblick, aber die Begegnungen schrumpfen zu Bildpunkten. Als Karte im Menü übernommen. |
| 4 | Ravenna, 1321 | Der alte Dante diktiert im Exil das Inferno. Man setzt die Reise aus Erinnerungsfetzen zusammen und prüft, ob man sich richtig erinnert. | Schöner Rahmen, verletzt aber das Konzept: Ich soll mit Vergil gehen, nicht mich erinnern. Übrig geblieben ist ein einzelner Satz am Ende. |
| 5 | Der Bote der Toten | Viele Seelen bitten Dante, auf der Erde an sie zu erinnern. Ein Spiel über Botschaften: wen trage ich hinauf, was sage ich? | Als Strang übernommen: „Namen, die ich hinauftrage“ werden am Ende zu Sternen. |
| 6 | Hörspiel im Dunkeln | Bildschirm schwarz, Orientierung nur über räumlichen Klang, wie die Totenreich-Hörspiele von Somethin' Else. | Starke Immersion. Ohne Sprecher und Kopfhörer bricht es aber zusammen, und Dantes Verse wären nur Ton. Das Lauschen ist als Kern geblieben, die Schrift auch. |
| 7 | Kartenspiel der Gesänge | 34 Gesänge als Karten. Jeder Kreis ist eine Hand, die man ausspielen muss. | Zu abstrakt, die Seelen würden zu Werten. |
| 8 | Schattentheater | Dante und Vergil als Scherenschnitt-Figuren, die man über eine beleuchtete Bühne führt. | Schön, aber teuer in der Herstellung und für Gespräche schwerfällig. |
| 9 | Die Übersetzung | Man übersetzt Dantes Italienisch Vers für Vers, und die Prüfungen sind Übersetzungsentscheidungen. | Gute Idee für Kenner, für alle anderen eine Sprachübung. |

**Anker.** Vor dem Sammeln habe ich zwei Listen aufgestellt und mit `shuf` gewürfelt:
- Kunstformen: 1 Buchmalerei, 2 Holz-/Kupferstich (wie Doré), 3 Hörspiel, 4 Schattentheater, 5 Kartografie (wie Botticelli), 6 Oratorium, 7 Graphic Novel, 8 Pilger-Reisetagebuch
- Interaktionsprinzipien: 1 Abstieg durch Wischen, 2 Zuhören: der Ton führt, 3 Nachzeichnen mit dem Finger, 4 Abwägen, 5 Gesprächsfäden, 6 Gedächtnis, 7 Licht und Dunkel, 8 Übersetzen

**Gewürfelt: 1 Buchmalerei und 2 Zuhören.** Das hat gepasst, weil Dantes Hölle zuerst gehört wird. Im dritten Gesang hört er Seufzer, Weinen und Heulen „durch den sternenlosen Luftkreis“, bevor er etwas sieht. Vergil erkennt er an der Stimme, die „heiser schien durch langgewohntes Schweigen“. Und ein Gesang ist ein *Lied*. Die Buchmalerei gab die Form: Pergament, rote Rubriken, Goldinitialen, kleine Miniaturen mit Dante in Rot und Vergil in Blau, so wie das Gedicht im 14. und 15. Jahrhundert gelesen wurde.

**Warum Idee 2 das größte Potential hat:** Sie macht die Begegnungen zum Kern. Man muss sich einer Seele erst zuwenden und hinhören, bevor sie spricht. Sie erlaubt Prüfungen, die jedes Mal anders *gemacht* werden, statt immer nur gewählt. Und sie ist mit Bordmitteln baubar, ohne Bilddateien und Sprachaufnahmen. Die Miniaturen sind SVG, der Klang wird live erzeugt.

---

## Recherche

Alle hier gezählten Quellen habe ich selbst geöffnet: Webseiten über das Abruf-Werkzeug, den Versetext roh per `curl`. Für jede steht, was ich übernommen habe. **abseits** heißt: abseits der bekanntesten Titel und Namen, also nicht Wikipedia und nicht die meistgenannten Dante-Spiele oder -Bücher.

**(a) Dante: Aufbau, Kreise, Gesänge, Übersetzung**

1. **[Projekt Gutenberg: Dante Alighieri, *Göttliche Komödie*, übersetzt von Philalethes](https://projekt-gutenberg.org/authors/dante-alighieri/books/goettliche-komoedie/)**. Originalquelle (gemeinfreie Übersetzung 1839–1849). **geöffnet**, roh per `curl`, 17.11.2026. *Übernommen:* der Wortlaut aller Verse im Spiel und im Gesangsbuch.
2. **[Danteworlds](https://danteworlds.laits.utexas.edu/)** mit der Seite [„Dante's Hell (Overview)“](https://danteworlds.laits.utexas.edu/textpopup/inf0000.html). Guy Raffa, University of Texas at Austin; Fachleute, Lehrangebot einer Universität. **geöffnet** · **abseits**. *Übernommen:* die Gliederung der Hölle in Unmaß (Kreise 2–5), Gewalt (7) und Betrug (8–9), dazu Limbus und Ketzer als Sonderfälle. Außerdem Dantes Erfindung, dass Verräter an Gästen schon zu Lebzeiten in die Hölle fallen und ein Teufel ihren Körper weiterlebt. Das trägt eine Begegnung im neunten Kreis.
3. **[Utpictura18: „2nd circle. Minos judges souls“ (Yates Thompson 36, Priamo della Quercia)](https://utpictura18.univ-amu.fr/en/notice/22987-2nd-circle-minos-judges-souls-divine-comedy-yates-thompson-36-priamo-della-quercia)**. Bilddatenbank der Université d'Aix-Marseille (Stéphane Lojkine). **geöffnet** (nur die Metadaten sind lesbar, das Bild selbst nicht) · **abseits**. *Übernommen:* Eine Dante-Handschrift von 1442–1450 gibt jedem Abschnitt eines Gesangs eine eigene Miniatur, hier fol. 8v zu Hölle V, 1–24. Deshalb gibt es im Spiel nicht ein Bild pro Kreis, sondern eins pro Ort.

**(b) Wie Spiele eine bekannte Geschichte nacherleben lassen, Sog erzeugen und Begegnungen tragen**

4. **[Tracy Fullerton: „Walden, a game“](https://ugpc.sutty.nl/how-to-play-video-games/essay/walden-a-game/)**. Essay der Entwicklerin über ihr eigenes Spiel, erschienen in *How to Play Video Games* (NYU Press, Hg. Payne/Huntemann). **geöffnet** (lesbar war nur der Anfang des Essays) · **abseits**. *Übernommen:* „Games as an aesthetic form are typically understood as a medium of action.“ Ein Buch nachzuerleben verlangt das Gegenteil, nämlich Nachdenken und Langsamkeit. Deshalb prüfen meine Prüfungen eine Haltung und keine Fingerfertigkeit.
5. **[Sam Kabo Ashwell: „Standard Patterns in Choice-Based Games“](https://heterogenoustasks.wordpress.com/2015/01/26/standard-patterns-in-choice-based-games/)** (2015). Fachbeitrag eines Spieleautors und Kritikers für interaktive Literatur. **geöffnet** · **abseits**. *Übernommen:* die Struktur „Branch and Bottleneck“. Feste Engstellen sind Dantes unveränderlicher Weg. Dazwischen verzweigen die Begegnungen, und der Spielstand merkt sich, wie man war (Mitleid, Namen, Fragen). So zählen Entscheidungen, ohne den Weg zu ändern.
6. **[Emily Short: „Small-Scale Structures in CYOA“](https://emshort.blog/2016/11/05/small-scale-structures-in-cyoa/)** (2016). Autorin und Forscherin interaktiver Erzählung über ihr Fach. **geöffnet** · **abseits**. *Übernommen:* Gesprächsthemen, die sich erst öffnen, „when the player has learned preliminary information“. Im Spiel fragt man manche Seelen erst nach etwas, wenn man es vorher von einer anderen erfahren hat. Außerdem ein Schluss, der zusammenzählt, was man gesammelt hat: die Sterne.
7. **[Aaron A. Reed: „2014: 80 Days“](https://if50.substack.com/p/2014-80-days)** (2021), aus *50 Years of Text Games*, später als Buch erschienen. Fachliteratur zur Geschichte der Textspiele. **geöffnet**. *Übernommen:* Bei *80 Days*, der Nacherzählung eines bekannten Romans, verfolgen die Nebenfiguren ihre eigenen Geschichten, und der Spieler kreuzt sie nur kurz. So sind meine Seelen gebaut. Sie erzählen *ihre* Geschichte und wollen etwas von Dante: erinnert werden, eine Nachricht, eine Antwort.
8. **[Game Developer: „GDC 2016: Learn to write great NPCs from *80 Days* scribe Meg Jayanth“](https://www.gamedeveloper.com/design/gdc-2016-learn-to-write-great-npcs-from-i-80-days-i-scribe-meg-jayanth)** (2015). Etabliertes Fachmedium, Ankündigung des Vortrags der Autorin. **geöffnet** (nur die Vorschau, nicht der Vortrag). *Übernommen:* „When NPCs have agency, drive and motivation … your game world is more vibrant.“ Farinata will über Politik reden, nicht über sich. Ugolino erzählt, um seinen Feind zu schänden. Bocca will gerade *nicht* genannt werden.
9. **[Winifred Phillips: „Sound is Magic: insights for the game music composer“](https://www.gamedeveloper.com/audio/-quot-sound-is-magic-quot-insights-for-the-game-music-composer)** (Game Developer, 2015). Spielekomponistin über einen Vortrag des Sounddesigners Nick Ryan zu den Audio-Spielen *Papa Sangre* (ein Totenreich, in dem man nichts sieht). **geöffnet** · **abseits**. *Übernommen:* Hörer ergänzen den Ursprung eines Klangs selbst, und Schrittgeräusche erzeugen das Gefühl, unterwegs zu sein. Darum murmeln die Stimmen erst unverständlich, bevor sie Worte werden, und darum ist Gehen ein hörbares Geräusch.

**Nicht geöffnet (zählen nicht mit):** [Digital Dante, Commento Baroliniano zu Inferno 5](https://digitaldante.columbia.edu/dante/divine-comedy/inferno/inferno-5/) (Bot-Schutz verweigerte den Abruf); [Illuminated Dante Project, Neapel](https://www.dante.unina.it/idp/public/pagine/progetto) (HTTP 503); [University of Melbourne, Ausstellung zu Yates Thompson 36](https://library.unimelb.edu.au/asc/whats-on/exhibitions/epic-and-divine/art-and-the-afterlife/yates-thompson) (HTTP 403); [World of Dante, Galerie Yates Thompson](https://worldofdante.org/gallery_yates_thompson.html) (HTTP 503); [de.wikipedia „Inferno (Dante)“](https://de.wikipedia.org/wiki/Inferno_(Dante)) (HTTP 404/429).

**Nur Ideengeber, kein Beleg:** Die Zusammenfassungen der Websuche (maschinell erzeugte Texte) haben mir Fundstellen gezeigt, zum Beispiel dass Philalethes bei Projekt Gutenberg steht. Zitiert habe ich nur, was ich danach selbst geöffnet habe.

---

## Übersetzung und Verse

**Übersetzung: Philalethes**, das ist König Johann von Sachsen. Seine Übersetzung erschien 1839–1849, er starb 1873, sie ist also gemeinfrei. Gewählt habe ich sie, weil sie ungereimt und genau ist und Vers für Vers dem Italienischen folgt. Die Verszahlen stimmen daher mit jeder Ausgabe überein. Gereimte Übersetzungen wie die von Streckfuß klingen glatter, verbiegen dafür aber oft den Sinn.

**Wie die Verse geholt wurden:** Die ganze Seite von Projekt Gutenberg habe ich am 17.11.2026 roh per `curl` geladen. Den Text hat ein kleines Python-Skript aus dem HTML gezogen, Zeile für Zeile, ohne Zusammenfassung oder Umformulierung. Gegengeprüft habe ich die Verszahl jedes Gesangs mit der italienischen Zählung (4720 Verse). Zwei Satzfehler der Vorlage sind korrigiert: an der Grenze XIII/XIV standen drei Verse vertauscht, und XXI,78 war auf zwei Zeilen umbrochen. In Gesang XI fehlt in der Vorlage ein Vers (114 statt 115). Ergebnis: [`daten/inferno/verse-philalethes.json`](daten/inferno/verse-philalethes.json).

Im Spiel stehen die Verse an den wichtigen Stellen als eigener Block mit Quellenangabe, zum Beispiel „Hölle V, 121–123 · Philalethes“. Jeder Gesang, den man erlebt hat, lässt sich außerdem im Menü unter „Gesänge“ vollständig nachlesen.

<!-- TABELLE-GESAENGE -->

---

## Entscheidungen

- **Technik:** HTML, CSS und JavaScript-Module ohne Framework und ohne Build-Schritt. So läuft das Spiel direkt von GitHub Pages und offline. Die Geschichte steht in einfachen Textdateien (`daten/inferno/text/*.txt`) in einem eigenen kleinen Format: Knoten, Wahlen, Stimmen, Prüfungen, Effekte. Ein Parser liest sie, und `npm run pruefe` prüft, dass jedes Ziel existiert, jeder Vers im Bereich liegt und alle 34 Gesänge vorkommen.
- **Erweiterbar:** `daten/werke.js` ist ein Register der Werke. Purgatorio und Paradiso werden weitere Einträge mit eigenen Textdateien und Versen. Spielstand, Merkbuch und Gesangsbuch sind pro Werk angelegt.
- **Bild:** Miniaturen im Stil italienischer Dante-Handschriften, als SVG aus einem kleinen Baukasten gezeichnet (Treppenfelsen, Goldgrund, Lapisgrund, Dante in Rot, Vergil in Blau, nackte Seelen). Keine Bilddateien. Das Pergament wird beim Abstieg dunkler und im Eis fahlblau.
- **Klang:** Alles wird mit der Web Audio API live erzeugt: Wind, Regen, Feuer, Eis, Schritte, Murmeln. Keine Tondateien, keine Sprachaufnahmen. Die Stimmen beim Lauschen sind gefiltertes Rauschen mit Silbenrhythmus. Man hört, *dass* jemand spricht und wo, aber nicht was. Die Worte erscheinen als Schrift. Ohne Ton funktioniert alles genauso.
- **Bedienung:** Erkunden heißt lauschen. Finger auf das Bild legen und langsam darüberfahren, wo jemand spricht, wird die Stimme deutlich. Gehörtes lässt sich antippen. Gespräche laufen über Wahlen mit Zeigehand (☞), Wege mit Pfeil (→). Alles ist mit dem Finger auf dem iPad gedacht und funktioniert auch mit der Maus.
