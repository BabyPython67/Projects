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

<details>
<summary><strong>Die 34 Gesänge und wo sie im Spiel vorkommen</strong> (zugeklappt, verrät Begegnungen und Prüfungen)</summary>

| Gesang | Bei Dante | Stelle im Spiel |
|---|---|---|
| I | Der dunkle Wald, drei Tiere, Vergil | Der dunkle Wald: Erwachen (Lauschbild), Prüfung „Der Hügel“, Vergil im Schatten |
| II | Dantes Zweifel, Beatrice hat Vergil geschickt | Der dunkle Wald: Abend, „Ich bin nicht Aeneas“, die drei Frauen |
| III | Höllentor, die Lauen, Acheron, Charon | Das Tor und die Vorhölle: Inschrift, Prüfung „Vorübergehen“, Charon, Beben |
| IV | Limbus, die Dichter, das edle Schloss | Limbus: Seufzer, Christi Höllenfahrt, „der Sechste“, Schloss mit Philosophen |
| V | Minos, der Sturm, Francesca und Paolo | Zweiter Kreis: Minos, Lauschbild im Sturm, Prüfung „Im Wind“, das Buch, Haltepunkt „An diesem Tag lasen wir nicht weiter“ |
| VI | Cerberus, Ciacco | Dritter Kreis: Prüfung „Cerberus“, Ciacco, Vorhersage, Liste der fünf Namen |
| VII | Plutus, Geizige und Verschwender, Fortuna, Styx | Vierter Kreis: Prüfung „Die Lasten“, Fortuna; Fünfter Kreis: Sumpf, Gurgeln unter Wasser |
| VIII | Phlegyas, Filippo Argenti, die Stadt Dis | Fünfter Kreis: Turm, Fährmann, Argenti; Stadt Dis: gefallene Engel, verschlossenes Tor |
| IX | Furien, Medusa, Himmelsbote, Ketzergräber | Stadt Dis: Erichtho, Prüfung „Medusa“, der Bote, die Gräber |
| X | Farinata, Cavalcante | Sechster Kreis: Farinata, Prüfung „Zögern“, Vorhersage der Verbannung |
| XI | Ordnung der Hölle | Sechster Kreis: Grab des Anastasius, Vergils Erklärung (Unmaß, Gewalt, Betrug, Wucher) |
| XII | Minotaurus, Blutfluss, Kentauren | Siebter Kreis: Bergsturz, Chiron, Nessus, Tyrannen |
| XIII | Wald der Selbstmörder, Pier della Vigna | Siebter Kreis: Prüfung „Der Zweig“, Pier della Vigna, die Jagd |
| XIV | Feuersand, Kapaneus, Greis von Kreta | Siebter Kreis: Prüfung „Die Blätter“, Kapaneus, der Greis |
| XV | Brunetto Latini | Siebter Kreis: Prüfung „Schritt halten“ |
| XVI | Drei Florentiner, Wasserfall, Schnur | Siebter Kreis: Guido Guerra, Tegghiaio, Rusticucci, die Schnur |
| XVII | Geryon, Wucherer, Flug | Siebter Kreis: Geryon, Wucherer, Flug im Dunkeln |
| XVIII | Übelbulgen; Kuppler, Verführer, Schmeichler | Achter Kreis: Venedico, Jason, Alessio, Thaïs |
| XIX | Simonisten, Nikolaus III. | Achter Kreis: Nikolaus, Dantes Rede gegen die Päpste |
| XX | Wahrsager | Achter Kreis: Tränen und Vergils Tadel, Manto und Mantua |
| XXI | Bestechliche im Pech, Malebranche | Achter Kreis: Pech, Malacoda, Datierung auf Karsamstag 1300 |
| XXII | Ciampolo, Teufel im Pech | Achter Kreis: Ciampolo |
| XXIII | Flucht, Heuchler, Kaiphas | Achter Kreis: Prüfung „Flucht“, Heuchler |
| XXIV | Aufstieg, Diebe, Vanni Fucci | Achter Kreis: Trümmer, Vanni Fucci, seine Vorhersage |
| XXV | Feigen gegen Gott, Verwandlungen | Achter Kreis: Feigen, Verwandlungen |
| XXVI | Odysseus' letzte Fahrt | Achter Kreis: Doppelflamme, Odysseus |
| XXVII | Guido da Montefeltro | Achter Kreis: Guido |
| XXVIII | Zwietracht; Mosca, Bertran de Born | Achter Kreis: Mohammed und Ali (knapp), Pier da Medicina, Curio, Mosca, Bertran |
| XXIX | Geri del Bello, Alchemisten | Achter Kreis: Geri, Griffolino, Capocchio |
| XXX | Fälscher, Streit Adam–Sinon | Achter Kreis: Schicchi, Myrrha, Adam, Sinon, Prüfung „Zuschauen“ |
| XXXI | Die Riesen am Brunnen | Brunnen: Horn, Nimrod, Ephialtes, Antaeus |
| XXXII | Caina, Antenora, Bocca | Neunter Kreis: Eis, Brüder, Camicion, Bocca |
| XXXIII | Ugolino, Tolomea, Alberigo | Neunter Kreis: Prüfung „Ugolino“, Alberigo |
| XXXIV | Judecca, Luzifer, Ausgang zu den Sternen | Neunter Kreis: Luzifer, Prüfung „Umkehr“, der Bach, die Sterne |

Es fehlt kein Gesang. `npm run pruefe` bricht ab, wenn einer nicht vorkommt.
</details>

---

## Entscheidungen

- **Technik:** HTML, CSS und JavaScript-Module ohne Framework und ohne Build-Schritt. So läuft das Spiel direkt von GitHub Pages und offline. Die Geschichte steht in einfachen Textdateien (`daten/inferno/text/*.txt`) in einem eigenen kleinen Format: Knoten, Wahlen, Stimmen, Prüfungen, Effekte. Ein Parser liest sie, und `npm run pruefe` prüft, dass jedes Ziel existiert, jeder Vers im Bereich liegt und alle 34 Gesänge vorkommen.
- **Erweiterbar:** `daten/werke.js` ist ein Register der Werke. Purgatorio und Paradiso werden weitere Einträge mit eigenen Textdateien und Versen. Spielstand, Merkbuch und Gesangsbuch sind pro Werk angelegt.
- **Bild:** Miniaturen im Stil italienischer Dante-Handschriften, als SVG aus einem kleinen Baukasten gezeichnet (Treppenfelsen, Goldgrund, Lapisgrund, Dante in Rot, Vergil in Blau, nackte Seelen). Keine Bilddateien. Das Pergament wird beim Abstieg dunkler und im Eis fahlblau.
- **Klang:** Alles wird mit der Web Audio API live erzeugt: Wind, Regen, Feuer, Eis, Schritte, Murmeln. Keine Tondateien, keine Sprachaufnahmen. Die Stimmen beim Lauschen sind gefiltertes Rauschen mit Silbenrhythmus. Man hört, *dass* jemand spricht und wo, aber nicht was. Die Worte erscheinen als Schrift. Ohne Ton funktioniert alles genauso.
- **Bedienung:** Erkunden heißt lauschen. Finger auf das Bild legen und langsam darüberfahren, wo jemand spricht, wird die Stimme deutlich. Gehörtes lässt sich antippen. Gespräche laufen über Wahlen mit Zeigehand (☞), Wege mit Pfeil (→). Alles ist mit dem Finger auf dem iPad gedacht und funktioniert auch mit der Maus.

---

## So ist das Konzept umgesetzt

**Dante, Vergil und Erkunden.** Du bist Dante und erzählst in der Ich-Form, in der Gegenwart. Vergil geht neben dir: Er erklärt, drängt, tadelt, trägt dich, verhandelt mit Teufeln. Erkundet wird mit den Ohren. Jeder Ort ist eine Miniatur, auf der Stimmen liegen, verwischt und unleserlich. Legst du den Finger auf das Bild und fährst langsam darüber, werden sie deutlich: Stimmen, Geräusche, Fetzen von Sätzen. Was du gehört hast, kannst du antippen und ihm nachgehen. Manche Stimmen führen zu Seelen, an denen man auch vorbeigehen könnte, manche zum Weg weiter hinab. Der Weg selbst ist Dantes Weg: Kreis für Kreis, in der Reihenfolge der 34 Gesänge.

**Begegnungen und Spielraum.** In den Gesprächen entscheidest du, was Dante sagt, fragt oder tut, ob er schweigt, verspricht, hart oder weich ist. Die Seelen verfolgen dabei ihre eigenen Ziele. Was du tust, merkt sich das Spiel. Es verändert, was du erfährst, was Vergil später zu dir sagt und welche Namen du am Ende hinaufträgst. Den Weg und das Ende ändert es nicht. Das Merkbuch im Menü hält fest, wen du getroffen hast, was dir vorausgesagt wurde und wonach du suchst.

**Prüfungen.** Jeder Kreis prüft dich, aber nicht mit einem Rätsel, das die Strafe nachstellt. Geprüft wird, was Dante selbst in diesem Gesang geprüft wird: Angst, Mitleid, Zorn, Neugier, Scham, Härte, Vertrauen. Jede Prüfung hat ihre eigene Geste, und keine kommt zweimal vor: halten, folgen, schieben, werfen, brechen, sammeln, Schritt halten, zögern, hinhören und aufhören zu hören, umkehren. Sie verlangen keine Geschicklichkeit. Man kann sie nicht verlieren, aber man kann sie auf verschiedene Weise bestehen, und das hat Folgen. *Begründung:* Der Pilger ist kein Sünder, der die Strafe nachspielt. Die naheliegende Spiegelung hätte neun gleichartige Rätsel ergeben. So prüft das Spiel den Spieler mit den Werkzeugen, die er die ganze Zeit benutzt, und manchmal wendet es sie gegen ihn.

**Nacherzählte Sprache und Dantes Verse.** Erzählt wird in heutiger, knapper Sprache, nah an Dantes Handlung und Bildern, ohne Zierrat. Wie in den alten Handschriften beginnt jeder Gesang mit einer roten Rubrik („Hier beginnt der fünfte Gesang …“) und einer Goldinitiale. An den wichtigen Stellen stehen Dantes Verse in der Übersetzung von Philalethes als eigener Block: 143 Blöcke mit zusammen 748 Verszeilen, etwa ein Sechstel des Inferno. Sie werden nicht danach nacherzählt, sondern stehen für sich. Jeder erlebte Gesang lässt sich im Menü vollständig nachlesen.

**Länge.** Zwölf Abschnitte vom Wald bis zu den Sternen, 215 Textknoten, 14 Prüfungen und ein Schlussbild, 40 Lauschstellen, 137 Wahlen, rund 60 benannte Seelen und Gestalten. Genaue Zahlen stehen unten unter „Länge“.

**Speichern.** Jeder Schritt wird sofort auf dem Gerät gespeichert, mit einer Sicherheitskopie des vorigen Stands. Das Spiel lässt sich als App auf den Home-Bildschirm legen und weist auf dem Titelblatt darauf hin. Im Menü gibt es einen Sicherungscode zum Kopieren und Wiederherstellen. Ein Service Worker hält alles offline bereit und holt bei jeder Verbindung zuerst die neueste Fassung.

<details>
<summary>Einzelheiten: die Prüfungen Kreis für Kreis (zugeklappt, verrät alles)</summary>

| Ort | Prüfung | Geste | Was geprüft wird | Folge |
|---|---|---|---|---|
| Wald (I) | Der Hügel | Immer wieder „hinauf“ tippen | Die Abkürzung aufgeben, umkehren, einer fremden Stimme folgen | Wie oft man es versucht hat |
| Vorhölle (III) | Vorübergehen | Finger auf die Menge halten, oder eben nicht | Hinhören lernt man im Spiel als Tugend; hier ist es Zeitverschwendung. Wer zu lange zuhört, erkennt den, „der die große Weigerung tat“ | Ein Eintrag mehr, ein Satz mehr |
| 1 Limbus (IV) | Die Ehre | Wahl | Wie man die größte Schmeichelei annimmt: Dante wird Sechster unter Homer, Horaz, Ovid, Lucan, Vergil | Kommt bei den Schmeichlern (XVIII) zurück |
| 2 Wollust (V) | Im Wind | Dem Paar mit dem Finger folgen, um Francesca zu hören | Aushalten, zuhören, mitgerissen werden | Verpasste Sätze fehlen; danach der Haltepunkt zum Aufhören für heute |
| 3 Völlerei (VI) | Cerberus | Erde in den offenen Rachen werfen | Ein kurzer Moment der Tat, dann der Hunger nach Wissen bei Ciacco | Fünf Namen zum Suchen |
| 4 Geiz (VII) | Die Lasten | Einen Stein gegen die anderen schieben | Für zwei Runden einer von ihnen sein; erkennen, dass man keinen erkennt | Wer länger schiebt, wird bemerkt |
| 5 Zorn (VIII) | Argenti | Wahl | Mitleid oder Zorn: Hier küsst Vergil den Zornigen | Mitleid wird gezählt und später vorgehalten |
| Dis (IX) | Medusa | Hand auf die Augen legen und halten | Nicht hinsehen, während die Furien schreien | Wer loslässt, behält graue Fingerspitzen |
| 6 Ketzer (X) | Zögern | Antworten mit ablaufender Frist | Ein Wort im falschen Tempus, ein Zögern: Cavalcante glaubt, sein Sohn sei tot | Keine Antwort holt das erste Wort zurück |
| 7 Gewalt (XIII–XV) | Der Zweig, Die Blätter, Schritt halten | Tippen tut weh; Blätter zurücklegen; gleichmäßig gehen | Berühren als Schuld, Sammeln als Zärtlichkeit, Zuhören, das nicht stehen bleiben darf | Versprechen an Pier, Brunetto |
| 8 Betrug (XX–XXX) | Tränen, Flucht, Odysseus, Zuschauen | Wahl, schnelles Tippen, Wahl, Halten | Mitleid wird getadelt; Vertrauen in Teufel; die eigene Neugier im Spiegel des Odysseus; Zuhören als niedriger Wunsch | Vergils Strenge, Scham, Spieler, die viel erkundet haben, werden erkannt |
| 9 Verrat (XXXII–XXXIV) | Bocca, Ugolino, Alberigo, Umkehr | Wahl, Weiterhören oder nicht, Wahl, Wischen | Grausamkeit, Aushalten, ein Schwur mit Hintertür, und der Moment, in dem unten oben wird | Ob man Ugolino bis zum Ende hört; welche Namen Sterne werden |
</details>

<details>
<summary>Einzelheiten: Begegnungen und ihre Folgen (zugeklappt)</summary>

- **Namen hinauftragen:** Ciacco, Pier della Vigna, Brunetto, die drei Florentiner, Pier da Medicina, Ugolino (nur wer ihn bis zum Ende hört) und, gegen seinen Willen, Bocca (nur wer ihn an den Haaren reißt). Am Ende wird jeder Name ein Stern.
- **Ciaccos Liste:** Farinata, Tegghiaio, Rusticucci, Arrigo und Mosca. Man findet sie im 6., 7. und 8. Kreis. Arrigo findet man nie, auch Dante nennt ihn danach nicht mehr.
- **Mitleid:** Argenti, Pier della Vigna und Geri del Bello zählen. Beim Tadel der Wahrsager hält Vergil es einem vor oder lobt.
- **Ehre im Limbus:** Stolz, Demut oder Bescheidenheit kehren bei den Schmeichlern als eigener Gedanke wieder.
- **Guido da Montefeltro:** Wer ihm ehrlich sagt, dass er zurückkehrt, erfährt seine Geschichte nicht.
- **Alberigo:** Wer den Schwur mit der Hintertür nicht leistet, erfährt nicht, wer er ist.
- **Nikolaus III.:** Wer die Rede gegen die Päpste hält, wird von Vergil umarmt; wer schweigt, nur getragen.
- **Odysseus:** Wer unterwegs sehr viele Seelen aufgesucht hat, wird bei Odysseus an die eigene Neugier erinnert.
</details>

## Länge

**Spieltext: rund 19.800 Wörter eigene Prosa** (18.565 Wörter Erzählung und Rubriken, 1.282 Wörter in Wahlen und Stimmen), dazu **5.528 Wörter Dante-Verse** in 748 Verszeilen. Gezählt mit `npm run wortzahl`. Das Gesangsbuch im Menü enthält zusätzlich das ganze Inferno (4.719 Verse) zum Nachlesen.

**Geschätzte Spielzeit: etwa 3½ bis 4 Stunden für einen Durchgang**, also drei bis vier Abende zu je einer Stunde. Die Schätzung setzt sich so zusammen: Prosa und Wahlen bei ruhigem Lesen (etwa 170 Wörter pro Minute) rund 2 Stunden, die Verse langsamer gelesen (etwa 110 Wörter pro Minute) rund 50 Minuten, 40 Lauschstellen und 14 Prüfungen zusammen etwa 40 Minuten. Wer alle Nebenstimmen aufsucht und die Gesänge im Buch nachliest, braucht deutlich länger. Ein zweiter Durchgang lohnt sich, weil viele Begegnungen anders verlaufen.

Ein natürlicher Haltepunkt nach dem zweiten Kreis lädt dazu ein, für den ersten Abend aufzuhören. Danach kann man an jedem Kapitelblatt aufhören, der Stand bleibt.

## Speichern und Sicherung

- **Automatisch:** Jeder Schritt landet sofort im Speicher des Browsers (`localStorage`), dazu eine Kopie des vorigen Stands für den Fall, dass einer beschädigt ist. Geschlossene Tabs verlieren nichts. Das Spiel bittet außerdem um dauerhaften Speicher (`navigator.storage.persist`).
- **Safari und die 7 Tage:** Safari löscht Daten von Websites, die man etwa sieben Tage nicht besucht hat. Als Home-Bildschirm-App ist das Spiel davon ausgenommen. Das Titelblatt und die Sicherungsseite weisen darauf hin, solange das Spiel nicht installiert ist.
- **Sicherungscode:** Menü → Sicherung → „Code erzeugen und kopieren“. Der Code (`INF1-…`) enthält den ganzen Stand, komprimiert und mit Prüfsumme. Ein Tippfehler wird erkannt, statt still einen kaputten Stand zu laden. Einfügen und „Wiederherstellen“ geht auf jedem Gerät. Alle drei Abschnitte erinnert das Kapitelblatt daran, den Code zu erneuern.
- **Neue Fassungen:** Der Service Worker (`sw.js`) holt jede Datei zuerst aus dem Netz, am HTTP-Cache vorbei, und speichert sie für offline. Ist das Netz weg oder nach 5 Sekunden still, kommt die gespeicherte Fassung. Eine neue Fassung zeigt einen Hinweis und lädt beim nächsten Umblättern, damit kein Schritt verloren geht. Die Fassung steht im Menü unter „Mehr“. `npm run pruefe` prüft, dass jede Datei in der Liste des Service Workers steht und `sw.js` und `js/version.js` dieselbe Version tragen.

## Handschrift

Das ist das Dante-Spiel, das ich selbst gern gemacht hätte. Meine Handschrift erkennt man an diesen Stellen:

- **Hören vor Sehen.** Die Hölle beginnt bei Dante mit Geräuschen, und Vergil erkennt man an seiner heiseren Stimme. Darum erkundet man im Spiel lauschend. Die Stimmen sind erst ein Murmeln und werden dann Schrift. Das Ende des Spiels findet man auch so, wie Dante es beschreibt: nicht mit dem Auge, sondern mit dem Ohr (Hölle XXXIV, 129).
- **Die Gesten wenden sich gegen den Spieler.** Was man hundertmal getan hat, Antippen, Zuhören, Erkunden, wird an einigen Stellen selbst zur Prüfung. Wie, steht zugeklappt oben.
- **Ein Haltepunkt mitten im Spiel.** An einer Stelle sagt das Spiel selbst, dass man jetzt aufhören kann, mit Dantes eigenem Satz. Das passt zum Spielen über mehrere Abende.
- **Die Handschrift als Bühne.** Rote Rubriken wie in den Codices („Hier beginnt der …“), Goldinitialen auf Lapis, Miniaturen mit Dante in Rot und Vergil in Blau. Das Pergament wird beim Abstieg dunkler und im Eis fahlblau, die letzte Seite ist Nachtblau.
- **Kleine Treue zum Text.** Ciacco nennt fünf Namen. Vier davon findet man unten, den fünften nie, weil Dante ihn auch nicht wieder erwähnt. Vergil verbessert in der Hölle seine eigene *Aeneis*. Im Limbus wird ein Gespräch mit Absicht *nicht* wiedergegeben, weil Dante schreibt, es sei schön, darüber zu schweigen. Luzifer sagt kein einziges Wort.
- **Die Sterne.** Das bekannte letzte Wort des Inferno sind die Sterne. Im Spiel stehen dort die Namen, die man unten versprochen hat hinaufzutragen.

## Prüfen auf dem iPad

Bitte am echten Gerät, weil Playwright Safari auf iOS nicht vollständig nachbildet:

1. **Öffnen:** Die Seite in Safari aufrufen (nach der Übernahme über GitHub Pages, lokal über `npm start` und die IP-Adresse des Rechners im WLAN). „Beginnen“ antippen.
2. **Ton:** Lauter stellen. Im ersten Wald sollte leiser Wind zu hören sein, beim Lauschen ein Murmeln, das lauter wird, wenn der Finger einer Stimme nahekommt. Mit Kopfhörern kommen die Stimmen von links oder rechts. Oben rechts „Ton an/aus“ prüfen. Das Spiel spielt auch bei eingeschaltetem Stummschalter (Audio-Sitzung „playback“). Wer das nicht will, schaltet den Ton im Spiel aus.
3. **Lauschen und Prüfungen:** Finger auf ein Bild legen und langsam ziehen. Die Seite darf dabei nicht scrollen. In der Medusa-Prüfung den Finger lange halten: Es darf kein Kontextmenü und keine Textauswahl aufgehen.
4. **Home-Bildschirm:** Teilen → „Zum Home-Bildschirm“. Das Symbol (blaues Feld, goldenes I) öffnen. Das Spiel muss ohne Safari-Leisten starten und am selben Ort weitermachen wie im Browser. Achtung: Safari und Home-Bildschirm-App haben *getrennte* Speicher. Den Stand vorher mit dem Sicherungscode übertragen, sonst beginnt die App von vorn.
5. **Sicherungscode:** Menü → Sicherung → „Code erzeugen und kopieren“, in Notizen einfügen. Dann Menü → Mehr → „Von vorn beginnen“, danach den Code unter „Wiederherstellen“ einfügen. Der alte Ort muss wieder da sein. Ein absichtlich gekürzter Code muss eine Fehlermeldung geben.
6. **Neue Fassung:** Nach einer Änderung am Spiel (neue Version in `sw.js` und `js/version.js`) die App öffnen, kurz warten. Es erscheint „Eine neue Fassung ist da …“, und beim nächsten Umblättern ist sie geladen. Menü → Mehr zeigt die Fassungsnummer.
7. **Offline:** Flugmodus an, App öffnen. Das Spiel muss laufen.

## Tests

- `npm test`: Logik-Tests mit `node:test`. Geprüft werden der Parser der Textdateien, Bedingungen und Effekte, einmalige Wahlen, Speichern und Laden samt Reparatur alter oder kaputter Stände, der Sicherungscode (Rundreise, Leerraum, Kürzung, falsche Prüfsumme, Rückfall ohne Kompression) und das ganze Inferno mit `npm run pruefe` (alle Ziele, alle Verse, alle 34 Gesänge, Service-Worker-Liste, Versionsgleichheit).
- `npm run test:browser`: Playwright mit Chromium in iPad- und iPhone-Größe. Spiel laden, lauschen und einer Stimme folgen, neu laden, prüfen, dass der Stand noch da ist, Sicherungscode erzeugen, kein seitliches Scrollen, keine Fehler in der Konsole.
- Nebenbei: Ein Bot-Skript (nicht im Repo) hat das ganze Spiel in Handygröße durchgespielt, mit jeder Prüfung.
