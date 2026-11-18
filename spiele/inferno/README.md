# Was ich dort hörte – Dantes Inferno

Ein Spiel nach dem ersten Teil von Dantes *Göttlicher Komödie*. Du bist Dante. Mit Vergil steigst du durch die neun Kreise der Hölle hinab, vom dunklen Wald bis zu Luzifer im Eis. Gespielt wird im Browser auf iPad und Handy. Das Spiel ist gesetzt wie eine illustrierte Dante-Ausgabe des 19. Jahrhunderts: Dantes Verse in der Übersetzung von Philalethes (1839–1849), dazu 48 Stiche von Gustave Doré (1861). Erkundet wird vor allem mit den Ohren: Wer den Finger auf ein Bild legt, hört die Seelen, bevor er sie sieht.

**Starten (lokal):** `cd spiele/inferno && npm start`, dann <http://127.0.0.1:8080/> öffnen. Ohne Node genügt jeder statische Server im Ordner `spiele/inferno/`, denn es gibt keinen Build-Schritt.
**Tests:** `npm install`, danach `npm test` (Logik) und `npm run test:browser` (Playwright: Spielstand, Stände aus Runde 2, alle Prüfungen, Layout aller Bildschirme auf iPad und Handy, hoch und quer).

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

**Warum Idee 2 das größte Potential hat:** Sie macht die Begegnungen zum Kern. Man muss sich einer Seele erst zuwenden und hinhören, bevor sie spricht. Sie erlaubt Prüfungen, die jedes Mal anders *gemacht* werden, statt immer nur gewählt. Und sie ist mit Bordmitteln baubar, ohne Bilddateien und Sprachaufnahmen. Die Miniaturen waren SVG, der Klang wird live erzeugt. *(Seit Runde 3 zeigt das Spiel statt der eigenen Miniaturen Gustave Dorés Stiche, siehe „Optik (Runde 3)“.)*

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
| VI | Cerberus, Ciacco | Dritter Kreis: Vergil stopft Cerberus die Mäuler, Ciacco mit der Prüfung „Was ich wissen will“, Vorhersage, Liste der fünf Namen |
| VII | Plutus, Geizige und Verschwender, Fortuna, Styx | Vierter Kreis: Prüfung „Die Gesichter“, Fortuna; Fünfter Kreis: Sumpf, Gurgeln unter Wasser |
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
| XXIV | Aufstieg, Diebe, Vanni Fucci | Achter Kreis: Prüfung „Prüf, ob er trägt“ auf den Trümmern, Vanni Fucci, seine Vorhersage |
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
- **Bild (seit Runde 3):** Gustave Dorés Stiche zum Inferno als Tafeln, gemeinfrei, aus Scans auf Wikimedia Commons. Die eigenen SVG-Miniaturen der Runden 1 und 2 sind entfernt. Einzelheiten unter „Optik (Runde 3)“.
- **Schrift (seit Runde 3):** EB Garamond in drei Schnitten, frei unter der SIL Open Font License (`schrift/OFL.txt`), aus dem npm-Paket `@fontsource/eb-garamond`. Sie liegt im Spielordner, damit iPad und Handy dieselbe Schrift zeigen und das Spiel offline läuft.
- **Klang:** Alles wird mit der Web Audio API live erzeugt: Wind, Regen, Feuer, Eis, Schritte, Murmeln. Keine Tondateien, keine Sprachaufnahmen. Die Stimmen beim Lauschen sind gefiltertes Rauschen mit Silbenrhythmus. Man hört, *dass* jemand spricht und wo, aber nicht was. Die Worte erscheinen als Schrift. Ohne Ton funktioniert alles genauso.
- **Bedienung:** Erkunden heißt lauschen. Finger auf das Bild legen und langsam darüberfahren, wo jemand spricht, wird die Stimme deutlich. Gehörtes lässt sich antippen. Gespräche laufen über Wahlen mit dem Absatzzeichen ¶, Wege mit », gehörte Stimmen mit ~. Alles ist mit dem Finger auf dem iPad gedacht und funktioniert auch mit der Maus.

---

## Optik (Runde 3)

**Warum neu.** Nach Runde 2 wirkte die Optik nicht ernst zu nehmen. Die selbst gezeichneten SVG-Miniaturen sahen gebastelt aus. Die Karte war ein Stapel Trapeze, und unten liefen ihre Beschriftungen über den Rand. Schrift und Zeichen kamen aus verschiedenen Welten: die Systemschrift des Geräts, dazu ☞, → und ∿ aus Ersatzschriften. Das Ziel von Runde 3 war eine Optik, die dem Inferno gerecht wird und wie aus einem Guss wirkt.

**Die Richtung: eine Dante-Ausgabe des 19. Jahrhunderts.** Philalethes' Übersetzung erschien 1839–1849, Gustave Dorés Stiche zum Inferno 1861. Beide stammen aus derselben Zeit, und 1870 kamen Dorés Stiche in Berlin in einer deutschen Ausgabe der Hölle heraus. So sieht das Spiel jetzt aus:
- warmes Papier, schwarze und rote Tinte wie im Buchdruck,
- eine Buchschrift (EB Garamond),
- Dorés Stiche als Tafeln mit Bildunterschrift.

Gold und Lapisblau der Buchmalerei aus den Runden 1 und 2 sind weggefallen. Die Stiche sind schwarz-weiß, und neben ihnen hätte Buchmalerei wie ein Fremdkörper gewirkt.

**Was sich an welchem Bildschirm geändert hat:**
- **Titelblatt:** Dorés „Der Tag verging“ als Frontispiz, darunter Titel, rote Rubrik, eine Linie und das Zitat. Ganz unten steht ein Impressum mit Philalethes und Doré. Nach dem Ende heißt es „Vollendet“, mit den Knöpfen „Den Weg nachlesen“ und „Noch einmal gehen“ statt „Weiterspielen“.
- **Kapitelblatt:** Oben die kleine Karte mit dem aktuellen Kreis in Rot. Die Kreiszahl steht nur noch einmal, nicht als Rubrik und als Überschrift zugleich. Statt „Gesänge V“ heißt es „Gesang V“.
- **Szenen:** Eine Tafel erscheint, wenn der Ort wechselt, nicht auf jeder Seite dieselbe.
  - Rubriken stehen in gesperrten roten Versalien, der Ort kursiv zwischen roten Punkten.
  - Die Initiale ist rot und ohne Kasten.
  - Dantes Verse sind eingerückt, mit einer roten Linie davor.
  - Vor den Wahlen stehen Randzeichen aus der Buchschrift: ¶ für Rede, » für Wege, ~ für gehörte Stimmen.
- **Lauschbilder:** Die Stimmen sind kleine Papierzettel auf dem Stich. Das Spiel hält sie ganz im Bild und schiebt sie auseinander, wo sie sich decken würden.
- **Prüfungen:** Jede Prüfung steht auf einer Doré-Tafel als Bühne, zum Beispiel Pardel und Löwe, der Sturm der Liebenden, die Furien, der Wald der Selbstmörder, die Übelkrallen oder Luzifer. Die Zeichen auf der Bühne haben eine einzige Form: Kreise aus Papierfarbe, Rot für Gefahr. Darüber steht „Prüfung“ mit dem Namen in Kursiv.
- **Menü:** Ein Papierblatt mit Reitern in Versalien, die auch auf dem Handy Platz haben. Das Merkbuch ist eine Liste mit feinen Linien.
- **Karte:** Ein neuer Schnitt durch den Trichter, gezeichnet wie eine gestochene Tafel.
  - Der Fels ist schräg schraffiert. Das Innere des Trichters ist waagrecht schraffiert und wird nach unten dichter.
  - Oben steht Jerusalem, links der Wald. Die neun Simse sind getreppt, mit Acheron, Burg, Styx, den Mauern von Dis, dem Blutfluss, den Bulgen und dem Eis. In der Mitte liegt Luzifer, darunter führt der Weg zu den Sternen.
  - Im Bild selbst stehen nur römische Ziffern, im Fels neben dem Sims. Alle Namen stehen in einer Liste daneben (auf dem Handy darunter), der aktuelle Kreis in Rot. So kann keine Beschriftung mehr über eine Form laufen.
- **Kopfzeile:** Der Titel bricht um, statt abgeschnitten zu werden. Auf dem Handy steht nur der Kreis, ohne Untertitel.

**Wie die Bilder entstehen.**
- **Quelle:** Wikimedia Commons, drei Scanreihen derselben Stiche, alle gemeinfrei.
  - die restaurierte Reihe „Gustave Doré – Dante Alighieri – Inferno – Plate N“,
  - die hochaufgelösten Scans „DVinferno …“,
  - die Seiten der deutschen Ausgabe „Göttliche Komödie. T. 1, Die Hölle“ (Berlin, W. Moeser, 1870). Sie füllen die Szenen, die in den anderen Reihen fehlen.
- **Laden:** Originale verweigerte Wikimedia von hier aus mit HTTP 429 und verlangte Vorschauen in Standardgröße. Geladen sind darum die Vorschauen mit 1280 Pixeln Breite; für die Seiten von 1870 mit 1920 Pixeln, weil der Stich dort nur etwa 60 % der Seite einnimmt.
- **Bearbeiten:** `werkzeuge/tafeln.py` arbeitet in vier Schritten.
  1. Es schneidet den Stich aus. Automatisch nimmt es den größten dunklen Block der Seite; bei den Seiten von 1870 ist der Ausschnitt von Hand gesetzt.
  2. Es wandelt in Graustufen.
  3. Es spreizt die Tonwerte, bis das Papier weiß und die Tinte schwarz ist.
  4. Es verkleinert auf höchstens 1300 Pixel und speichert als JPEG.
- **Im Spiel:** Jedes Bild liegt mit `mix-blend-mode: multiply` auf dem Papier. Das Weiß des Scans wird so zum Papierton der Seite, und der Stich wirkt gedruckt statt eingeklebt.
- **Dateien:** Auswahl, Ausschnitt und Bildunterschrift stehen in `werkzeuge/tafeln-auswahl.json`. Das Ergebnis liegt in `tafeln/` und `daten/tafeln.js`.

**Schärfe und Ladezeit.**
- **Schärfe:** Keine Tafel wird breiter angezeigt als die Hälfte ihrer Pixel; das Spiel setzt die Grenze für jedes Bild aus seiner Größe. Bühnen, die ihr Bild vergrößern, werden entsprechend schmaler. Damit hat jedes Bild mindestens die doppelte Anzeigegröße in Pixeln.
- **Test dazu:** Der Layout-Test (`tests/layout.test.js`) prüft das für jedes sichtbare Bild auf jedem Bildschirm, auf vier Geräten. Auf einer eigenen Prüfseite („tafeln-alle“) prüft er zusätzlich alle 48 Tafeln.
- **Ladezeit:** Die 48 Tafeln wiegen zusammen 17,5 MB, im Schnitt 365 KB. Eine Seite lädt nur ihre eine Tafel.
- **Offline:** Der Service Worker speichert eine Tafel, sobald man sie sieht. Die Tafeln des aktuellen und des nächsten Abschnitts lädt das Spiel im Hintergrund vor, damit man auch ohne Netz weiterspielen kann. Die Schrift wiegt 75 KB.

<details>
<summary>Die 48 Tafeln: Quelle, Lizenz und Auflösung je Bild (zugeklappt, verrät Szenen)</summary>

„Original“ ist die Auflösung der Datei auf Commons, „im Spiel“ die Größe nach dem Zuschnitt. Mehrere Namen in der ersten Spalte bedeuten, dass das Spiel dieselbe Tafel an mehreren Orten zeigt.

| Tafel im Spiel | Gesang | Bildunterschrift | Quelle (Wikimedia Commons) | Lizenz | Original | im Spiel | Datei |
|---|---|---|---|---|---|---|---|
| titel | II | Der Tag verging | [Gustave Doré - Dante Alighieri - Inferno - Plate 6 (Start of Canto II - Day was departing).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_6_%28Start_of_Canto_II_-_Day_was_departing%29.jpg) | gemeinfrei (Public Domain) | 2320×2850 px | 1063×1300 px | 363 KB |
| wald | I | Im dunklen Wald | [Gustave Doré - Dante Alighieri - Inferno - Plate 1 (I found myself within a forest dark...).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_1_%28I_found_myself_within_a_forest_dark...%29.jpg) | gemeinfrei (Public Domain) | 2343×3062 px | 1063×1300 px | 451 KB |
| panther | I | Der Pardel | [Gustave Doré - Dante Alighieri - Inferno - Plate 2 (the panther).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_2_%28the_panther%29.jpg) | gemeinfrei (Public Domain) | 2824×2320 px | 1218×996 px | 387 KB |
| loewe | I | Der Löwe | [Gustave Doré - Dante Alighieri - Inferno - Plate 3 (The lion).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_3_%28The_lion%29.jpg) | gemeinfrei (Public Domain) | 2320×2832 px | 1065×1300 px | 412 KB |
| vergil | I | Einer, heiser durch langes Schweigen | [Gustave Doré - Dante Alighieri - Inferno - Plate 4 (Dante meets Virgil).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_4_%28Dante_meets_Virgil%29.jpg) | gemeinfrei (Public Domain) | 2320×2850 px | 1056×1300 px | 441 KB |
| aufbruch | I | Er ging, und ich folgte ihm | [Gustave Doré - Dante Alighieri - Inferno - Plate 5 (End of Canto I).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_5_%28End_of_Canto_I%29.jpg) | gemeinfrei (Public Domain) | 2320×2850 px | 1056×1300 px | 441 KB |
| beatrice | II | Beatrice | [Gustave Doré - Dante Alighieri - Inferno - Plate 7 (Beatrice).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_7_%28Beatrice%29.jpg) | gemeinfrei (Public Domain) | 2320×2850 px | 1060×1300 px | 401 KB |
| tor | III | Durch mich geht man in die Stadt der Schmerzen | [Gustave Doré - Dante Alighieri - Inferno - Plate 8 (Canto III - Abandon all hope ye who enter here).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_8_%28Canto_III_-_Abandon_all_hope_ye_who_enter_here%29.jpg) | gemeinfrei (Public Domain) | 2820×2314 px | 1218×998 px | 415 KB |
| vorhoelle | III | Die Seelen am Ufer | [DVinfernoDoomedSoulsCrossAcheron.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoDoomedSoulsCrossAcheron.jpg) | gemeinfrei (Public Domain) | 3984×3184 px | 1250×995 px | 331 KB |
| acheron | III | Charon | [Gustave Doré - Dante Alighieri - Inferno - Plate 10 (Canto III - Charon herds the sinners onto his boat).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_10_%28Canto_III_-_Charon_herds_the_sinners_onto_his_boat%29.jpg) | gemeinfrei (Public Domain) | 2826×2314 px | 1218×996 px | 355 KB |
| limbus | IV | Im Limbus | [Gustave Doré - Dante Alighieri - Inferno - Plate 11 (Canto IV - Limbo, the Viruous Pagans).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_11_%28Canto_IV_-_Limbo%2C_the_Viruous_Pagans%29.jpg) | gemeinfrei (Public Domain) | 2826×2314 px | 1218×992 px | 373 KB |
| dichter | IV | Die fünf Dichter | [Gustave Doré - Dante Alighieri - Inferno - Plate 12 (Canto IV - Limbo, Dante is accepted as an equal by the great Greek and Roman poets).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_12_%28Canto_IV_-_Limbo%2C_Dante_is_accepted_as_an_equal_by_the_great_Greek_and_Roman_poets%29.jpg) | gemeinfrei (Public Domain) | 2314×2826 px | 1061×1300 px | 379 KB |
| minos | V | Minos | [Gustave Doré - Dante Alighieri - Inferno - Plate 13 (Canto V - Minos).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_13_%28Canto_V_-_Minos%29.jpg) | gemeinfrei (Public Domain) | 2826×2314 px | 1218×996 px | 319 KB |
| sturm | V | Der Sturm der Hölle | [Gustave Doré - Dante Alighieri - Inferno - Plate 14 (Canto V - The hurricane of souls).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_14_%28Canto_V_-_The_hurricane_of_souls%29.jpg) | gemeinfrei (Public Domain) | 2314×2762 px | 1084×1300 px | 392 KB |
| francesca | V | Francesca und Paolo | [Gustave Doré - Dante Alighieri - Inferno - Plate 15 (Canto V - Francesca di Rimini).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_15_%28Canto_V_-_Francesca_di_Rimini%29.jpg) | gemeinfrei (Public Domain) | 2314×2832 px | 1062×1300 px | 369 KB |
| ohnmacht | V | Ich fiel, wie ein toter Körper fällt | [Gustave Doré - Dante Alighieri - Inferno - Plate 18 (Canto V - Dante has a touch of the vapours).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_18_%28Canto_V_-_Dante_has_a_touch_of_the_vapours%29.jpg) | gemeinfrei (Public Domain) | 2314×2826 px | 1058×1300 px | 438 KB |
| cerberus, regen | VI | Cerberus | [Gottliche Komodie. T. 1, Die Holle 1870 (148618330).jpg](https://commons.wikimedia.org/wiki/File%3AGottliche_Komodie._T._1%2C_Die_Holle_1870_%28148618330%29.jpg) | gemeinfrei (Public Domain) | 6322×4485 px | 1114×817 px | 254 KB |
| lasten | VII | Geizige und Verschwender | [Gustave Doré - Dante Alighieri - Inferno - Plate 22 (Canto VII - Hoarders and Wasters).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_22_%28Canto_VII_-_Hoarders_and_Wasters%29.jpg) | gemeinfrei (Public Domain) | 5878×4678 px | 1226×971 px | 316 KB |
| styx | VII | Die Zornigen im Sumpf | [DVinfernoVirgilShowSoulsOfWrathful m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoVirgilShowSoulsOfWrathful_m.jpg) | gemeinfrei (Public Domain) | 2423×1907 px | 1246×979 px | 357 KB |
| phlegyas | VIII | Über den Styx | [DVinfernoFerryAcrossTheStyx m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoFerryAcrossTheStyx_m.jpg) | gemeinfrei (Public Domain) | 2675×2093 px | 1250×978 px | 381 KB |
| argenti | VIII | Filippo Argenti | [Gottliche Komodie. T. 1, Die Holle 1870 (148618452).jpg](https://commons.wikimedia.org/wiki/File%3AGottliche_Komodie._T._1%2C_Die_Holle_1870_%28148618452%29.jpg) | gemeinfrei (Public Domain) | 4543×6322 px | 1099×1300 px | 340 KB |
| dis | VIII | Vor der Stadt Dis | [Gottliche Komodie. T. 1, Die Holle 1870 (148618466).jpg](https://commons.wikimedia.org/wiki/File%3AGottliche_Komodie._T._1%2C_Die_Holle_1870_%28148618466%29.jpg) | gemeinfrei (Public Domain) | 6322×4543 px | 1114×886 px | 233 KB |
| furien | IX | Die Furien | [DVinfernoMegaeraTisifphoneAlecto m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoMegaeraTisifphoneAlecto_m.jpg) | gemeinfrei (Public Domain) | 1908×2458 px | 1010×1300 px | 399 KB |
| graeber | X | Farinata | [DVinfernoUbertiAddressesDante m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoUbertiAddressesDante_m.jpg) | gemeinfrei (Public Domain) | 1914×2420 px | 1028×1300 px | 397 KB |
| blutfluss | XII | Der Minotaurus | [DVinfernoMinotaurOnCliff m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoMinotaurOnCliff_m.jpg) | gemeinfrei (Public Domain) | 1969×2409 px | 1063×1300 px | 384 KB |
| dornenwald | XIII | Der Wald der Selbstmörder | [DVinfernoForestOfSuicides m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoForestOfSuicides_m.jpg) | gemeinfrei (Public Domain) | 1969×2425 px | 1057×1300 px | 438 KB |
| sand | XIV | Der Feuerregen | [DVinfernoViolentInRainOfFire m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoViolentInRainOfFire_m.jpg) | gemeinfrei (Public Domain) | 3039×2364 px | 1250×972 px | 366 KB |
| brunetto | XV | Brunetto Latini | [DVinfernoBrunettoLatiniAccostsDante m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoBrunettoLatiniAccostsDante_m.jpg) | gemeinfrei (Public Domain) | 2704×2100 px | 1250×970 px | 396 KB |
| geryon | XVII | Auf Geryons Rücken | [DVinfernoIntoAbyssOnGeryonsBack m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoIntoAbyssOnGeryonsBack_m.jpg) | gemeinfrei (Public Domain) | 1952×2436 px | 1042×1300 px | 368 KB |
| malebolge, peitsche, kot | XVIII | Thaïs | [DVinfernoShadeOfThais m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoShadeOfThais_m.jpg) | gemeinfrei (Public Domain) | 1953×2420 px | 1050×1300 px | 410 KB |
| simonie | XIX | Nikolaus III. | [DvinfernoPopeNicholasIII m.jpg](https://commons.wikimedia.org/wiki/File%3ADvinfernoPopeNicholasIII_m.jpg) | gemeinfrei (Public Domain) | 1974×2414 px | 1064×1300 px | 346 KB |
| pech | XXI | Die Übelkrallen | [DVinfernoDemonsThreatenVirgil.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoDemonsThreatenVirgil.jpg) | gemeinfrei (Public Domain) | 2682×2115 px | 1250×985 px | 376 KB |
| ciampolo | XXII | Alichino und Calcabrina | [DVinfernoCiampoloDemonAlichino m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoCiampoloDemonAlichino_m.jpg) | gemeinfrei (Public Domain) | 2668×2123 px | 1250×995 px | 347 KB |
| heuchler | XXIII | Die Heuchler | [DVinfernoHypocritesAddressDante m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoHypocritesAddressDante_m.jpg) | gemeinfrei (Public Domain) | 2594×2049 px | 1246×987 px | 378 KB |
| schlangen | XXIV | Die Diebe | [DVinfernoThievesTorturedBySerpents m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoThievesTorturedBySerpents_m.jpg) | gemeinfrei (Public Domain) | 2683×2108 px | 1250×982 px | 355 KB |
| verwandlung | XXV | Agnello | [DVinfernoAgnelloChangingIntoSerpent m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoAgnelloChangingIntoSerpent_m.jpg) | gemeinfrei (Public Domain) | 1985×2425 px | 1058×1300 px | 357 KB |
| flammen | XXVI | Die Flammen | [DVinfernoFlamingSpiritsOfEvilCounsellors m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoFlamingSpiritsOfEvilCounsellors_m.jpg) | gemeinfrei (Public Domain) | 1914×2387 px | 1043×1300 px | 379 KB |
| zerspalten | XXVIII | Die Zerspaltenen | [DVinfernoMutilatedShades m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoMutilatedShades_m.jpg) | gemeinfrei (Public Domain) | 1952×2384 px | 1066×1300 px | 428 KB |
| bertran | XXVIII | Bertran de Born | [DVinfernoSeveredHeadOfBertranddeBorn m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoSeveredHeadOfBertranddeBorn_m.jpg) | gemeinfrei (Public Domain) | 1952×2404 px | 1057×1300 px | 393 KB |
| faelscher | XXX | Meister Adam und Sinon | [DVinfernoVirgilReprovesDantesCuriosity m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoVirgilReprovesDantesCuriosity_m.jpg) | gemeinfrei (Public Domain) | 1912×2516 px | 988×1300 px | 377 KB |
| riesen | XXXI | Die Riesen | [Gustave Doré - Dante Alighieri - Inferno - Plate 65 (Canto XXXI - The Titans).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_65_%28Canto_XXXI_-_The_Titans%29.jpg) | gemeinfrei (Public Domain) | 5881×4702 px | 1210×963 px | 335 KB |
| antaeus | XXXI | Antaeus | [DVinfernoGiantAntaeusLoweringDanteAndVirgil m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoGiantAntaeusLoweringDanteAndVirgil_m.jpg) | gemeinfrei (Public Domain) | 1965×2425 px | 1050×1300 px | 383 KB |
| eis | XXXII | Im Eis | [Gottliche Komodie. T. 1, Die Holle 1870 (148619530).jpg](https://commons.wikimedia.org/wiki/File%3AGottliche_Komodie._T._1%2C_Die_Holle_1870_%28148619530%29.jpg) | gemeinfrei (Public Domain) | 6386×4641 px | 1124×879 px | 208 KB |
| ugolino | XXXII | Ugolino | [DVinfernoUgolinoGnawingHeadOfRuggieari m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoUgolinoGnawingHeadOfRuggieari_m.jpg) | gemeinfrei (Public Domain) | 2012×1536 px | 1246×953 px | 399 KB |
| turm | XXXIII | Im Hungerturm | [Gottliche Komodie. T. 1, Die Holle 1870 (148619571).jpg](https://commons.wikimedia.org/wiki/File%3AGottliche_Komodie._T._1%2C_Die_Holle_1870_%28148619571%29.jpg) | gemeinfrei (Public Domain) | 6386×4625 px | 1104×883 px | 272 KB |
| luzifer | XXXIV | Luzifer | [DVinfernoLuciferKingOfHell m.jpg](https://commons.wikimedia.org/wiki/File%3ADVinfernoLuciferKingOfHell_m.jpg) | gemeinfrei (Public Domain) | 2020×1588 px | 1250×982 px | 369 KB |
| sterne | XXXIV | Und wir traten hervor, die Sterne zu sehen | [Gottliche Komodie. T. 1, Die Holle 1870 (148619695).jpg](https://commons.wikimedia.org/wiki/File%3AGottliche_Komodie._T._1%2C_Die_Holle_1870_%28148619695%29.jpg) | gemeinfrei (Public Domain) | 4607×6386 px | 1045×1300 px | 291 KB |
| felsen | XXIV | Fels | [Gustave Doré - Dante Alighieri - Inferno - Plate 5 (End of Canto I).jpg](https://commons.wikimedia.org/wiki/File%3AGustave_Dor%C3%A9_-_Dante_Alighieri_-_Inferno_-_Plate_5_%28End_of_Canto_I%29.jpg) | gemeinfrei (Public Domain) | 2320×2850 px | 628×1006 px | 231 KB |

</details>

## So ist das Konzept umgesetzt

**Dante, Vergil und Erkunden.** Du bist Dante und erzählst in der Ich-Form, in der Gegenwart. Vergil geht neben dir: Er erklärt, drängt, tadelt, trägt dich, verhandelt mit Teufeln. Erkundet wird mit den Ohren. Jeder Ort hat eine Tafel nach Doré, auf der Stimmen liegen, verwischt und unleserlich. Legst du den Finger auf das Bild und fährst langsam darüber, werden sie deutlich: Stimmen, Geräusche, Fetzen von Sätzen. Was du gehört hast, kannst du antippen und ihm nachgehen. Manche Stimmen führen zu Seelen, an denen man auch vorbeigehen könnte, manche zum Weg weiter hinab. Der Weg selbst ist Dantes Weg: Kreis für Kreis, in der Reihenfolge der 34 Gesänge.

**Begegnungen und Spielraum.** In den Gesprächen entscheidest du, was Dante sagt, fragt oder tut, ob er schweigt, verspricht, hart oder weich ist. Die Seelen verfolgen dabei ihre eigenen Ziele. Was du tust, merkt sich das Spiel. Es verändert, was du erfährst, was Vergil später zu dir sagt und welche Namen du am Ende hinaufträgst. Den Weg und das Ende ändert es nicht. Das Merkbuch im Menü hält fest, wen du getroffen hast, was dir vorausgesagt wurde und wonach du suchst.

**Prüfungen.** Jeder Kreis prüft dich, aber nicht mit einem Rätsel, das die Strafe nachstellt. Geprüft wird, was Dante selbst in diesem Gesang geprüft wird: Angst, Mitleid, Zorn, Neugier, Scham, Härte, Vertrauen. Jede Prüfung hat ihre eigene Geste, und keine kommt zweimal vor: halten, folgen, fragen, erkennen wollen, brechen, sammeln, prüfen vor dem Greifen, Schritt halten, zögern, hinhören und aufhören zu hören, umkehren. Sie verlangen keine Geschicklichkeit. Man kann sie nicht verlieren, aber man kann sie auf verschiedene Weise bestehen, und das hat Folgen. *Begründung:* Der Pilger ist kein Sünder, der die Strafe nachspielt. Die naheliegende Spiegelung hätte neun gleichartige Rätsel ergeben. So prüft das Spiel den Spieler mit den Werkzeugen, die er die ganze Zeit benutzt, und manchmal wendet es sie gegen ihn.

**Nacherzählte Sprache und Dantes Verse.** Erzählt wird in heutiger, knapper Sprache, nah an Dantes Handlung und Bildern, ohne Zierrat. Wie in den alten Ausgaben beginnt jeder Gesang mit einer roten Rubrik („Hier beginnt der fünfte Gesang. Eine Stufe tiefer.“) und einer roten Initiale. Die Rubrik nennt nur den Ort oder das erste Bild des Gesangs, nie, was geschieht. An den wichtigen Stellen stehen Dantes Verse in der Übersetzung von Philalethes als eigener Block: 161 Blöcke mit zusammen 851 Verszeilen, etwa ein Sechstel des Inferno. Sie werden nicht danach nacherzählt, sondern stehen für sich. Jeder erlebte Gesang lässt sich im Menü vollständig nachlesen.

**Länge.** Zwölf Abschnitte vom Wald bis zu den Sternen, 229 Textknoten, 17 Prüfungen und ein Schlussbild, 19 Lauschbilder mit 42 Stimmen, 151 Wahlen, 63 Einträge im Merkbuch, viele davon mit mehreren Namen. Genaue Zahlen stehen unten unter „Länge“.

**Speichern.** Jeder Schritt wird sofort auf dem Gerät gespeichert, mit einer Sicherheitskopie des vorigen Stands. Das Spiel lässt sich als App auf den Home-Bildschirm legen und weist auf dem Titelblatt darauf hin. Im Menü gibt es einen Sicherungscode zum Kopieren und Wiederherstellen. Ein Service Worker hält alles offline bereit und holt bei jeder Verbindung zuerst die neueste Fassung.

<details>
<summary>Einzelheiten: die Prüfungen Kreis für Kreis (zugeklappt, verrät alles)</summary>

| Ort | Prüfung | Geste | Was geprüft wird | Folge |
|---|---|---|---|---|
| Wald (I) | Der Hügel | „Hinauf“ tippen; die Bühne wechselt vom Pardel zum Löwen | Wann man die Abkürzung aufgibt und der Stimme im Schatten folgt | Wer viermal oder öfter hinaufläuft, dem hält Vergil es vor; es kommt im Schlussbild wieder |
| Vorhölle (III) | Vorübergehen | Finger auf die Menge halten, oder eben nicht | Hinhören lernt man im Spiel als Tugend; hier ist es Zeitverschwendung | Cölestin („der die große Weigerung tat“) sieht jeder. Wer alles anhört, verliert Vergil aus den Augen; bei den Wahrsagern hält er es vor |
| 1 Limbus (IV) | Die Ehre | In die Reihe der fünf Dichter treten (Lücke antippen) oder abseits bleiben | Wie man die größte Ehre annimmt: Dante wird Sechster unter Homer, Horaz, Ovid, Lucan, Vergil | Vor Homer, dazwischen, als Sechster oder abseits; kommt bei den Schmeichlern (XVIII) zurück |
| 2 Wollust (V) | Im Wind | Dem hellen Paar auf dem Sturmbild mit dem Finger folgen | Aushalten, zuhören, mitgerissen werden | Verpasste Verse fehlen; danach der Haltepunkt zum Aufhören für heute |
| 3 Völlerei (VI) | Was ich wissen will | Zwei von vier Fragen an Ciacco, mit ablaufender Frist | Neugier: was man von der Zukunft wissen will, und ob man sich entscheidet | Wer zu lange überlegt, dem sinkt Ciacco weg: keine Antwort, kein Name zum Hinauftragen. Nur wer nach den fünf Männern fragt, sucht sie später |
| 4 Geiz (VII) | Die Gesichter | Auf die Tafel tippen, um näher hinzusehen; das Gesicht verschwimmt | Erkennen wollen, wo nichts mehr zu erkennen ist (Hölle VII, 53–54) | Wer bis zuletzt sucht, bekommt Vergils Satz über die verlorenen Namen |
| 5 Zorn (VIII) | Seine Hände | Antworten oder Argentis Hände auf der Tafel berühren, mit Frist | Zorn, Mitleid oder Zögern: Hier küsst Vergil den Zornigen | Mitleid wird gezählt und später vorgehalten; wer zögert, über den hinweg handelt Vergil |
| Dis (IX) | Medusa | Hand auf die Furien-Tafel legen und halten, der Bildschirm wird schwarz | Nicht hinsehen, während die Furien nach Medusa rufen; sie kommt nicht | Wer loslässt, dem zittern die Hände; Vergil erinnert bei den Übelkrallen daran, das Schlussbild auch |
| 6 Ketzer (X) | Zögern | Antworten mit ablaufender Frist | Ein Wort im falschen Tempus, ein Zögern: Cavalcante glaubt, sein Sohn sei tot | Keine Antwort holt das erste Wort zurück; das Schweigen kommt im Schlussbild wieder |
| 7 Gewalt (XIII–XV) | Der Zweig, Die Blätter, Schritt halten | Einen Zweig mit dem Finger nach unten abbrechen oder sich weigern; Blätter zum Busch ziehen; gleichmäßig „Schritt“ tippen | Berühren als Schuld, Sammeln als Zärtlichkeit, Zuhören, das nicht stehen bleiben darf | Wer sich weigert, dem führt Vergil die Hand. Versprechen an Pier und Brunetto |
| 8 Betrug (XX–XXX) | Die Flucht, Prüf ob er trägt, Zusehen | Nichts tun und sich tragen lassen, obwohl drei Versuchungen locken; Steine antippen und halten; Gedrückt halten | Vertrauen, wo Dante getragen wird; Vergils Rat beim Klettern (Hölle XXIV, 29–30); Zuhören als niedriger Wunsch | Wer sich wehrt, schlägt sich das Knie auf; wer still bleibt, dem bleibt es im Schlussbild. Scham bei Vergil |
| 9 Verrat (XXXII–XXXIV) | Zuhören (Ugolino), Die Umkehr, Die Sterne | Weiterhören oder nicht; an Luzifer hinabwischen, nach der Wende ohne Anleitung hinauf; Sterne antippen | Aushalten; Vertrauen, wenn unten plötzlich oben ist | Ob man Ugolino bis zum Ende hört; wer in die falsche Richtung will, dem ist noch schwindlig; welche Namen Sterne werden |

Dazu kommen Begegnungen, die als Wahl entschieden werden, ohne eigene Geste: Bocca, Alberigo, Guido da Montefeltro, Nikolaus III. und andere.
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

Stand Runde 3, gezählt mit `npm run wortzahl`:
- **Eigene Prosa:** rund 20.600 Wörter, davon 19.298 in Erzählung und Rubriken und 1.323 in Wahlen und Stimmen.
- **Dantes Verse:** 6.256 Wörter in 161 Versblöcken mit 851 Verszeilen.
- **Gesangsbuch:** Das Menü enthält zusätzlich das ganze Inferno (4.719 Verse) zum Nachlesen.

Gegenüber Runde 2 sind 11 Textknoten, 13 Versblöcke und 83 Verszeilen dazugekommen, vor allem im achten Kreis.

**Geschätzte Spielzeit: etwa 4 Stunden für einen Durchgang**, also vier Abende zu je einer Stunde. So setzt sich die Schätzung zusammen:
- Prosa und Wahlen, ruhig gelesen (etwa 170 Wörter pro Minute): rund 2 Stunden.
- Die Verse, langsamer gelesen (etwa 110 Wörter pro Minute): knapp eine Stunde.
- 19 Lauschbilder und 17 Prüfungen: zusammen etwa 45 Minuten.

Wer alle Nebenstimmen aufsucht und die Gesänge im Buch nachliest, braucht deutlich länger. Ein zweiter Durchgang lohnt sich, weil viele Begegnungen und mehrere Prüfungen anders ausgehen.

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
- **Das Buch als Bühne.** Seit Runde 3 eine Dante-Ausgabe des 19. Jahrhunderts: Philalethes' Verse und Dorés Stiche aus derselben Zeit, rote Rubriken, Tafeln mit Bildunterschrift. Die Prüfungen finden auf den Stichen selbst statt. Der Grund um die Seite wird beim Abstieg dunkler, im Eis kälter, die letzte Seite steht vor Nachtblau.
- **Kleine Treue zum Text.** Ciacco nennt fünf Namen. Vier davon findet man unten, den fünften nie, weil Dante ihn auch nicht wieder erwähnt. Vergil verbessert in der Hölle seine eigene *Aeneis*. Im Limbus wird ein Gespräch mit Absicht *nicht* wiedergegeben, weil Dante schreibt, es sei schön, darüber zu schweigen. Luzifer sagt kein einziges Wort.
- **Die Sterne.** Das bekannte letzte Wort des Inferno sind die Sterne. Im Spiel stehen dort die Namen, die man unten versprochen hat hinaufzutragen.

## Prüfen auf dem iPad

Bitte am echten Gerät, weil Playwright Safari auf iOS nicht vollständig nachbildet:

1. **Öffnen:** Die Seite in Safari aufrufen (nach der Übernahme über GitHub Pages, lokal über `npm start` und die IP-Adresse des Rechners im WLAN). „Beginnen“ antippen.
2. **Ton:** Lauter stellen. Im ersten Wald sollte leiser Wind zu hören sein, beim Lauschen ein Murmeln, das lauter wird, wenn der Finger einer Stimme nahekommt. Mit Kopfhörern kommen die Stimmen von links oder rechts. Oben rechts „Ton an/aus“ prüfen. Das Spiel spielt auch bei eingeschaltetem Stummschalter (Audio-Sitzung „playback“). Wer das nicht will, schaltet den Ton im Spiel aus.
3. **Lauschen und Prüfungen:** Finger auf ein Bild legen und langsam ziehen. Die Seite darf dabei nicht scrollen. In der Medusa-Prüfung den Finger lange halten: Es darf kein Kontextmenü und keine Textauswahl aufgehen.
4. **Home-Bildschirm:** Teilen → „Zum Home-Bildschirm“. Das Symbol (blaues Feld, goldenes I) öffnen. Das Spiel muss ohne Safari-Leisten starten und am selben Ort weitermachen wie im Browser. Achtung: Safari und Home-Bildschirm-App haben *getrennte* Speicher. Den Stand vorher mit dem Sicherungscode übertragen, sonst beginnt die App von vorn.
5. **Sicherungscode:** Menü → Sichern → „Code erzeugen und kopieren“, in Notizen einfügen. Dann Menü → Mehr → „Von vorn beginnen“, danach den Code unter „Wiederherstellen“ einfügen. Der alte Ort muss wieder da sein. Ein absichtlich gekürzter Code muss eine Fehlermeldung geben.
6. **Neue Fassung:** Nach einer Änderung am Spiel (neue Version in `sw.js` und `js/version.js`) die App öffnen, kurz warten. Es erscheint „Eine neue Fassung ist da …“, und beim nächsten Umblättern ist sie geladen. Menü → Mehr zeigt die Fassungsnummer.
7. **Offline:** Flugmodus an, App öffnen. Das Spiel muss laufen. Tafeln, die man schon gesehen hat oder die zum aktuellen und nächsten Abschnitt gehören, müssen erscheinen; eine noch nie geladene Tafel darf fehlen, der Text muss trotzdem lesbar bleiben.

**Die Optik am echten Gerät (neu in Runde 3).** Das kann nur das Gerät zeigen, nicht Chromium:

8. **Schrift:** Titelblatt und Text müssen in EB Garamond erscheinen: schmale Antiqua, „Was ich dort hörte“ mit feinen Serifen. Falls Safari für einen Moment eine andere Schrift zeigt und dann springt, ist das der Ladevorgang. Bleibt Georgia oder Times stehen, wurde `schrift/` nicht geladen.
9. **Tafeln gedruckt, nicht eingeklebt:** Die Stiche müssen den Papierton der Seite annehmen (`mix-blend-mode: multiply`). Es darf kein weißer oder grauer Kasten um ein Bild stehen. Am besten sieht man das am Titelblatt und auf der Tafel „Im Eis“, die sehr hell ist.
10. **Schärfe auf dem Retina-Bildschirm:** Bei einer Tafel ganz nah hinsehen: Die Schraffuren müssen als feine Linien zu erkennen sein, nicht als grauer Schleier und nicht pixelig.
11. **Hoch und quer drehen:** Auf einer Lauschseite und in einer Prüfung das iPad drehen. Die Tafel muss ganz zu sehen sein, die Stimmen müssen im Bild bleiben und dürfen sich nicht decken. Auf dem iPhone quer darf die Tafel fast den ganzen Bildschirm füllen.
12. **Karte:** Menü → Karte. Der Trichter muss als feine Strichzeichnung erscheinen, die Liste daneben (iPad quer) oder darunter (hochkant), der aktuelle Kreis rot. Nichts darf über den Rand der Zeichnung laufen.
13. **Kopfzeile und Reiter:** Auf dem iPhone muss der Titel oben ganz zu lesen sein (er darf umbrechen), und alle fünf Reiter im Menü müssen zu sehen sein.
14. **Ladezeit über Mobilfunk:** Mit WLAN aus eine neue Tafel öffnen (etwa ein neues Kapitel). Sie sollte nach ein bis zwei Sekunden da sein. Bis dahin steht ein leeres Feld in Papierfarbe in derselben Größe; der Text darf nicht springen.
15. **Dunkler Grund und Pergament:** Beim Abstieg wird nur der Grund um die Seite dunkler, im Eis kühler. Das Papier selbst bleibt hell und gut lesbar, auch bei gedimmtem Bildschirm.

## Tests

- `npm test`: Logik-Tests mit `node:test`. Geprüft werden der Parser der Textdateien, Bedingungen und Effekte, einmalige Wahlen, Speichern und Laden samt Reparatur alter oder kaputter Stände, der Sicherungscode (Rundreise, Leerraum, Kürzung, falsche Prüfsumme, Rückfall ohne Kompression) und das ganze Inferno mit `npm run pruefe` (alle Ziele, alle Verse, alle 34 Gesänge, Service-Worker-Liste, Versionsgleichheit).
- `npm run test:browser`: Playwright mit Chromium, vier Testdateien.
  - `tests/browser.test.js`: in iPad- und iPhone-Größe das Spiel laden, lauschen und einer Stimme folgen, neu laden und prüfen, dass der Stand noch da ist. Dazu Sicherungscode erzeugen, kein seitliches Scrollen, keine Fehler in der Konsole.
  - `tests/spielstand.test.js`: Ein echter Spielstand aus Runde 2 (`tests/stand-runde2.json`, mit dem Code von Runde 2 im Browser erzeugt) wird übernommen. Das Titelblatt zeigt einen Hinweis, das Spiel läuft am selben Ort weiter, und die Wahl von damals wirkt fort. Ein Stand mit einem Ort, den es nicht mehr gibt, führt zu einem klaren Hinweis und zurück an den Anfang des Abschnitts.
  - `tests/pruefungen.test.js`: Jede der 17 Prüfungen wird mit ihrer Geste abgeschlossen, ob Tippen, Halten, Ziehen, Wischen oder Warten. Danach muss das Spiel an der erwarteten Stelle weitergehen, ohne Fehler. Ausnahme ist „Im Wind“, die man nur mit dem Finger am bewegten Paar besteht; sie spielt der Kritiker.
  - `tests/layout.test.js`: Alle 39 Bildschirmarten auf vier Geräten (iPad hoch und quer, iPhone hoch und quer), also 156 Bildschirme: Titelblatt neu und mit Stand, vier Kapitelblätter, Lauschbild, sechs Szenen, alle 17 Prüfungen, das Ende, eine Seite mit allen 48 Tafeln und das Menü mit allen Reitern samt Gesangstext und Karte. Geprüft wird jeder Text: läuft er vom Bildschirm, ist er abgeschnitten oder breiter als sein Feld, überlappt er einen anderen Text? Text in Zeichnungen (SVG) muss auf der Fläche bleiben, auf der er steht. Jedes sichtbare Bild muss mindestens die doppelte Anzeigegröße in Pixeln haben. Einzelne Bildschirme: `LAYOUT_NUR=menue-karte npm run test:layout`.
- **Nachweis:** Gegen den Stand von Runde 2 (`ef9fd68`) findet der Layout-Test genau den Fehler der alten Karte, auf allen vier Geräten: „SVG-Text „8. Betrug · Übelbulgen“ läuft über den Rand der Fläche, auf der er steht“, ebenso „9. Verrat · Kokytos“. Nachstellen: `git archive ef9fd68 spiele/inferno | tar -x -C /tmp/alt`, dann `tests/bildschirme.js` und `tests/layout.test.js` hineinkopieren und dort `LAYOUT_NUR=menue-karte node --test tests/layout.test.js` laufen lassen.

## Später: Purgatorio und Paradiso

Die Daten sind darauf vorbereitet:
- `daten/werke.js` ist ein Register. Ein neues Werk bekommt einen Eintrag mit Titel, Versdatei (`daten/purgatorio/verse-philalethes.json`, aus derselben Gutenberg-Seite mit demselben Skript zu ziehen) und seinen Textdateien.
- Der Spielstand trägt das Feld `werk`. Merkbuch, getragene Namen und gelesene Gesänge sind pro Werk gespeichert, unter dem Schlüssel `dante.<werk>.stand`. Ein Übergang von der Hölle ins Fegefeuer kann den Stand des Inferno lesen, etwa die getragenen Namen oder ob man Ugolino ganz gehört hat.
- Das Format der Textdateien kennt keine Inferno-Besonderheiten. Neue Prüfungen kommen als Funktion in `js/pruefungen.js` dazu, neue Tafeln über `werkzeuge/tafeln-auswahl.json` und `werkzeuge/tafeln.py` (Purgatorio und Paradiso hat Doré ebenfalls illustriert), neue Klangräume in `js/klang.js`.
- Das Inferno endet mit dem Blick auf den Berg im Meer, also genau dort, wo das Purgatorio beginnt.

## Kritik

Drei Runden waren erlaubt, jede mit einem frischen Unteragenten als Kritiker. Er hat nicht mitgebaut und bekam nur den Spielordner, die lokale Adresse und die fünf Kriterien, ohne Begründungen. Er sollte das README nicht lesen. Er spielte mit Playwright in iPad- und Handygröße, machte eigene Screenshots und änderte keinen Spielcode. Nach jeder Runde habe ich die Probleme von oben nach unten behoben, und jede Runde endete mit einem spielbaren, committeten und gepushten Stand.

### Runde 1 (Fassung 2026.11.17-2)

1. Sog: **nicht bestanden.** Die erste Hälfte zieht, danach wird zu viel nacherzählt und zu wenig selbst getan.
2. Inferno: **bestanden.** Weg, Gestalten und Reihenfolge stimmen; wer es gespielt hat, kennt das Inferno.
3. Text: **nicht bestanden.** Zu viele Pointen am Absatzende, „als hätte“-Vergleiche, Erklärungen direkt nach den Versen, einige OCR-Reste in den Versen.
4. Prüfungen: **nicht bestanden.** Zeitgeber liefen, bevor man die Prüfung sah; manche Prüfungen blieben ohne Folgen; einige wichen von Dante ab.
5. Technik: **nicht bestanden.** Menü und Karte auf dem iPhone abgeschnitten, das Lauschbild reagierte beim Tippen und Loslassen unzuverlässig, zu viele Einblendungen.

**Was sich danach geändert hat:** Zeitgeber starten erst, wenn die Prüfung ganz zu sehen ist, und jede Prüfung trägt einen sichtbaren Titel. Drei Prüfungen, die von Dante abwichen, sind ersetzt oder umgebaut, eine neue ist dazugekommen, und mehrere Begegnungen lassen jetzt eine Wahl, wo vorher nur erzählt wurde. Rund 60 Textstellen sind gestrafft, Merkbuch-Einträge ergänzt und neun OCR-Fehler in den Versen berichtigt. Auf dem iPhone passen Menü und Karte, das Lauschbild reagiert verlässlich, und es gibt weniger Einblendungen.

<details>
<summary>Einzelheiten der Änderungen nach Runde 1 (zugeklappt, verrät Begegnungen und Prüfungen)</summary>

Zeitgeber starten erst, wenn die Prüfung ganz zu sehen ist, und jede Prüfung trägt einen sichtbaren Titel. Cerberus stopft jetzt Vergil, wie bei Dante; dafür prüft Ciacco die Neugier (zwei von vier Fragen). Statt der Lasten sucht man unter den Geizigen ein bekanntes Gesicht und findet keins, wie in Hölle VII. Medusa kommt nicht mehr, sie wird nur gerufen. Francescas Worte im Wind sind jetzt Dantes Verse. Neu ist die Kletterprüfung auf den Trümmern (Hölle XXIV) mit Folge; Ciampolo und Geryon lassen eine Wahl, die Limbus-Dichter sind Wege statt Stimmen. Rund 60 Stellen im Text sind gestrafft: Pointen, „als hätte“ und Erklärungen nach Versen gestrichen, Merkbuch-Einträge ergänzt (Charon, Geryon, Luzifer, Judas, Brutus, Cassius), das Ende greift den Hügel vom Anfang auf und zeigt den Berg noch nicht. Neun OCR-Fehler in den Versen sind berichtigt. Auf dem iPhone passen Menü und Karte, Tippen auf das Lauschbild hört kurz hin, ein Loslassen löst keinen Klick mehr aus, und nur noch die ersten Merkbuch-Einträge melden sich mit einer Einblendung.
</details>

<details>
<summary>Bericht Runde 1 (zugeklappt)</summary>

[kritik/runde-1.md](kritik/runde-1.md)
</details>

### Runde 2 (Fassung 2026.11.17-3)

1. Sog: **bestanden.** Der Anfang und die großen Begegnungen ziehen, und das Ende belohnt den Weg. In der zweiten Hälfte, vor allem im achten Kreis, lässt der Sog nach.
2. Inferno: **bestanden.** Alle 34 Gesänge stehen in Dantes Reihenfolge, mit fast allen Gestalten und Philalethes' Versen. Im achten Kreis ist es dünner: Drei Gesänge haben keinen eigenen Versblock, und eine Nebenfigur fehlt.
3. Text: **nicht bestanden.** Die Prosa erzählt oft den Vers davor nach und erklärt, statt zu zeigen. Viele Knoten enden mit einem kurzen Pointensatz, die Sätze sind gleichförmig kurz, und die Rubriken verraten den Inhalt.
4. Prüfungen: **nicht bestanden** (knapp). Sie sind abwechslungsreich, und mehr als die Hälfte trifft Dante genau. Aber man kann nirgends scheitern, drei wirken nicht nach, und eine macht den Spieler aktiv, wo Dante getragen wird.
5. Technik: **bestanden.** Auf beiden Geräten ohne Fehler, nichts läuft über, Speichern und Weiterspielen klappen. Mängel: Bilder sperrten auf dem Handy das Scrollen, einige Zeilen erschienen in Prüfungen doppelt, und in der Stimmenliste standen doppelte Anführungszeichen.

**Was sich danach geändert hat:** Runde 2 war die letzte. Für eine dritte reichte das Rundenbudget nicht. Danach habe ich nur noch Fehler behoben: Stumme Bilder lassen sich auf dem Handy wieder überscrollen, nur Lauschbilder halten den Finger fest. Die doppelten Zeilen in drei Prüfungen sind weg, die doppelten Anführungszeichen auch. Eine Überleitung vor einem Vers im ersten Gesang passt jetzt zum Vers.

**Offen geblieben** (keine Fehler im Sinn der Regel, darum nicht mehr angefasst): die Textschwächen aus Kriterium 3, Prüfungen ohne Scheitern und teils ohne Nachwirkung, der dünnere achte Kreis, eine fehlende Nebenfigur und der Sprung an den Seitenanfang beim Zurückkehren. Diese Punkte stehen auch unter „Ehrliche Einschätzung“.

<details>
<summary>Bericht Runde 2 (zugeklappt)</summary>

[kritik/runde-2.md](kritik/runde-2.md)
</details>

### Text und Prüfungen: was der Kritiker in Runde 2 bemängelt hat

37 Probleme: 26 behoben, 9 teilweise, 2 nicht behoben.

<details>
<summary>Jedes Problem einzeln (zugeklappt, verrät Begegnungen und Prüfungen)</summary>

Gesammelt aus Kriterium 3 (Text), Kriterium 4 (Prüfungen) und den Punkten der Problemliste, die Text und Prüfungen betreffen ([Bericht Runde 2](kritik/runde-2.md)).

| # | Bereich | Problem in Runde 2 | Stand | Was geändert wurde |
|---|---|---|---|---|
| 1 | Text | Doppelt erzählt: Prosa wiederholt Hölle IV, 52–55 (Limbus, Christi Höllenfahrt) | **behoben** | Ein Versblock IV, 52–63 statt Vers plus Nacherzählung. |
| 2 | Text | Doppelt erzählt: VIII, 82–87 (Dis, die gefallenen Engel auf den Toren) | **behoben** | Die Nacherzählung nach dem Vers ist gestrichen. |
| 3 | Text | Doppelt erzählt: VI, 34–36 (über die Schatten im Regen) | **behoben** | Satz vor dem Vers gestrichen, danach ein Eindruck, den der Vers nicht hat. |
| 4 | Text | Doppelt erzählt: XIII, 58–63 (Pier della Vigna, die Schlüssel) | **behoben** | Die Prosa nennt nur den Namen, den Dante verschweigt, und setzt nach dem Vers mit dem Neid fort. |
| 5 | Text | Dreifach erzählt: I, 85–90 (Wahl, Echo und Vers) | **behoben** | Die Wahlen nennen nur noch die Handlung („Ich sage ihm, was er mir ist“), die Worte stehen allein im Vers. |
| 6 | Text | Erklärt statt gezeigt: „Ich verstehe: Hier sind die …“ (V) | **behoben** | Ersetzt durch Dantes Vers V, 37–39. |
| 7 | Text | Erklärt: „Ich verstehe: mehr. Es wird mehr.“ (VI) | **behoben** | Ersetzt durch ein Bild: Regen auf Haut, die ihn wieder spürt. |
| 8 | Text | Erklärt: „Das hat er gemeint, im ersten Kreis …“ (IX) | **behoben** | Gestrichen; Vergil sieht beim Sprechen auf das Tor. |
| 9 | Text | Erklärt: „Ein Wissen, das von selbst stirbt …“ (X) | **behoben** | Gestrichen, der Vers steht allein. |
| 10 | Text | Erklärt: „Der Tod Christi hat die Hölle zerbrochen …“ (XII) | **behoben** | Ersetzt durch eine Geste: die scharfe Bruchkante, „als wäre sie von gestern“. |
| 11 | Text | Erklärt: „So sieht Betrug aus.“ (XVII) | **behoben** | Gestrichen. |
| 12 | Text | Erklärt: „Also ist heute Karsamstag …“ (XXI) | **teilweise** | Jetzt rechnet Dante mit, während Malacoda spricht. Das Datum steht weiter da, weil man es sonst nicht erfährt. |
| 13 | Text | Erklärt: „Vergeltungsrecht …“ (XXVIII) | **behoben** | Gestrichen; der Vers sagt es selbst. |
| 14 | Text | Erklärt: „Ich lausche, weil ich das jetzt kann …“ (XXXIV) | **behoben** | Umgeschrieben ohne Begründung. |
| 15 | Text | Pointensätze am Knotenende (59 von 195) | **teilweise** | 32 Stellen umgeschrieben. Nach derselben Zählung (Schlusssatz mit höchstens sechs Wörtern) bleiben 21 von 202, fast alle wörtliche Rede. |
| 16 | Text | Gleichförmiger Satzbau: Median 8 Wörter, 27 % Kurzsätze, „Nicht X. Y.“ | **teilweise** | Rund 45 Stellen umgebaut, die Messung hat sich aber kaum bewegt: Median 9 Wörter, 25 % Sätze mit höchstens fünf Wörtern. Der Takt ist über 20.000 Wörter derselbe geblieben. |
| 17 | Text | Glätte der eigenen Prosa neben Dantes Versen | **nicht behoben** | Ohne ein Umschreiben des ganzen Textes nicht zu lösen. |
| 18 | Text | Rubriken verraten den Inhalt (VIII, IX, X, XXIII, XXXIII …) | **behoben** | Alle 31 Rubriken nennen nur noch Ort, Stimmung oder Dantes erstes Bild des Gesangs. |
| 19 | Text | Registerbruch bei den Lauen („beide Seiten hatten irgendwie recht“) | **behoben** | Neue Fetzen ohne heutige Floskeln („ich habe keinem Herrn geschworen“). |
| 20 | Text | Vers und Prosa passen nicht zusammen (Gesang I, „wer_bist_du“) | **behoben** | Seit dem Nachtrag zu Runde 2 und jetzt mit den neuen Wahlen vor I, 85–90. |
| 21 | Text | Argentis Kuss „für Zorn“ statt für gerechte Entrüstung (VIII, 44–45) | **behoben** | „Feuerseele“ wie bei Philalethes; daneben beißen die Zornigen sich selbst. |
| 22 | Text | Berichte statt Szenen: Ciampolos List, Mantua, Romagna, die Diebe ohne Namen | **behoben** | Ciampolo als Szene mit Vers XXII, 118–129 und einer Wahl; Mantua mit Versen XX, 55–60 und 97–99; die Romagna mit XXVII, 37–42; die Diebe als Lauschbild mit vier Namen. |
| 23 | Text | Zweite Hälfte dünn: XXII, XXIII und XXIX ohne Vers, viele Knoten nur mit „Weiter“ | **teilweise** | Alle drei Gesänge haben jetzt Verse, dazu Cacus, die Diebe und die Fälscher als eigene Szenen. Knoten nur mit „Weiter“ gibt es dort weiterhin. |
| 24 | Text | Inhalte nur im Merkbuch oder hinter Bedingungen (Sodomiten, Namen der Diebe, Cölestin); Cacus fehlt | **behoben** | Alles steht jetzt im Spieltext, Cölestin für alle, Cacus mit Vers XXV, 17–33. |
| 25 | Text | Erfundenes ohne Kennzeichnung (Lucan lacht; „vor drei Monaten gesehen“) | **teilweise** | Lucans Satz kommt nur noch, wer abseits stehen bleibt; Cavalcantis „vor drei Monaten“ steht weiter da. |
| 26 | Prüfungen | Ergebnisse wirken nicht nach: Hügel, Gesichter und Flucht ungenutzt | **behoben** | Alle drei werden aufgegriffen, dazu Medusa bei den Übelkrallen und das Verweilen bei den Lauen bei den Wahrsagern. Das Schlussbild greift fünf Prüfungen wieder auf. |
| 27 | Prüfungen | Nirgends kann man scheitern | **teilweise** | Bei Ciacco verliert man durch Zögern alle Antworten und seinen Namen, bei Argenti handelt Vergil über einen hinweg, beim Zweig führt er die Hand. Den Weg selbst kann man, wie bei Dante, nicht verlieren. |
| 28 | Prüfungen | Der Hügel: dreimal derselbe Knopf | **teilweise** | Die Bühne wechselt vom Pardel zum Löwen, die Stimme im Schatten erscheint früher, Sturheit hat eine Folge. Die Geste bleibt Tippen. |
| 29 | Prüfungen | Der Zweig: eines von acht Stöckchen antippen, ablehnen geht nicht | **behoben** | Man bricht den Zweig mit einer Zugbewegung auf dem Stich, oder man weigert sich, und Vergil führt einem die Hand. |
| 30 | Prüfungen | Die Umkehr: einmal runter, einmal hoch wischen | **teilweise** | Die Tafel dreht sich, nach der Wende sagt das Spiel nicht mehr, wohin; wer falsch will, wird gehalten, und das zählt. Im Kern bleibt es Wischen. |
| 31 | Prüfungen | Die Sterne: nur antippen | **nicht behoben** | Bleibt ein ruhiger Abschluss; die Folgen stehen danach im Schlussbild. |
| 32 | Prüfungen | Die Gesichter: verschwommene Ovale, die beste Zeile kommt erst beim vierten Tipp und wiederholt sich | **behoben** | Man sieht in Dorés Stich der Geizigen hinein, er verschwimmt; jede Zeile kommt genau einmal. |
| 33 | Prüfungen | Die Flucht: Reaktionsspiel ohne Teufel, der Spieler aktiv, wo Dante getragen wird | **behoben** | Neu: sich tragen lassen. Auf Dorés Übelkrallen locken drei Versuchungen, wer sie antippt, stört Vergil. |
| 34 | Prüfungen | „Prüfung“ über einfachen Wahlen (Ehre, Ciacco, Argenti) | **behoben** | Die Ehre ist eine Geste (in die Reihe der Dichter treten), Ciacco hat eine Frist, Argenti eine Frist und seine Hände auf dem Stich. |
| 35 | Prüfungen | Das Lauschen verblasst in der zweiten Hälfte; sechs Lauschbilder mit nur einer Stimme | **teilweise** | Zwei neue Lauschbilder mit je vier Stimmen im achten Kreis (Diebe, Fälscher). Die Lauschbilder mit einer Stimme sind geblieben. |
| 36 | Prüfungen | Doppelte Zeilen in Gesichter, Flucht, Griff und Zusehen | **behoben** | Nach Runde 2 behoben; Zusehen hängt bei Wiederholung keinen Zusatz mehr an jede Zeile. |
| 37 | Prüfungen | Vorübergehen belohnt gerade das Hinhören, vor dem Vergil warnt | **behoben** | Cölestin sieht jeder; wer alles anhört, verliert Vergil und bekommt es später vorgehalten. |
</details>

## Was ungeprüft bleibt

- **Ein echtes iPad und iPhone.** Getestet wurde nur mit Chromium in iPad- und iPhone-Größe (Playwright). Safari auf dem Gerät, die Fingerbedienung mit echtem Druck, das Anlegen auf dem Home-Bildschirm, das Löschen nach sieben Tagen und das Nachladen einer neuen Fassung auf dem Gerät hat niemand ausprobiert. Die Schritte dafür stehen unter „Prüfen auf dem iPad“.
- **Der Ton.** Der Klang entsteht im Browser und wurde nur daraufhin geprüft, dass er ohne Fehler startet. Gehört hat ihn kein Mensch. Ob er auf dem iPad bei stummgeschaltetem Gerät spielt, ist offen.
- **Die Spielzeit.** Die Zeit unter „Länge“ ist aus den Wortzahlen geschätzt, nicht an einem Menschen gemessen.
- **Bedienung mit VoiceOver** und anderen Hilfen wurde nicht geprüft.
- **Fünf Quellen** waren aus dieser Umgebung nicht erreichbar (Bot-Schutz, HTTP 403, 404/429, 503). Sie gelten nicht als geöffnet und zählen nicht mit (siehe „Recherche“).

## Ehrliche Einschätzung

**Was trägt.** Das Hören als Art zu erkunden. Es kommt aus dem Inferno selbst und macht aus dem Lesen eine Handlung: Man legt den Finger auf ein Bild und wartet, bis eine Stimme deutlich wird. Am stärksten ist das Spiel dort, wo eine Geste und Dantes Vers zusammenfallen. Dann liest man eine Stelle des Inferno nicht nur, sondern tut selbst etwas, das zu ihr gehört. Die Verse im Text und die vollständigen Gesänge im Menü sorgen dafür, dass man das Inferno danach wirklich kennt. Die Namen, die man hinaufträgt, geben dem langen Abstieg ein eigenes Ziel.

**Was schwach ist.** Die Wahlen ändern Sätze, Einträge und das Ende im Kleinen, aber nie den Weg. Wer zweimal spielt, merkt das schnell. Der Ton ist Rauschen und Murmeln aus dem Synthesizer, stimmungsvoll, aber dünn, und die Miniaturen sind einfache Zeichnungen, keine Buchmalerei. Einige Prüfungen sind im Kern eine Wahl mit gutem Text, andere eine Geste, die man nach dem ersten Mal durchschaut. Verlieren kann man keine, und nicht jede wirkt später nach.

**Wo der Text abfällt.** In der zweiten Hälfte, vor allem im achten Kreis, dem längsten Abschnitt. Dort folgen zu viele Gestalten in zu kurzer Zeit, und manches wird berichtet statt erlebt. Dantes derbe Komik kommt kaum an. Schwächer sind auch Vergils lange Erklärreden, die als Nacherzählung in einem Block stehen. Durchgehend gilt: Die Prosa erzählt den gerade zitierten Vers oft noch einmal nach, viele Abschnitte enden mit einem kurzen Pointensatz, die Rubriken verraten manchmal vorab, was geschieht, und neben Dantes Versen wirkt der eigene Text glatt.
