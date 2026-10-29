# Woyzeck – ein Spiel, das man liest

Georg Büchners „Woyzeck“ als Textspiel für iPad und Handy. Du bist Andres, Füsilier, Woyzecks Kamerad, mit dem
er das Bett in der Kaserne teilt. Erzählt wird in der Du-Form. Büchners Text bleibt, das Ende bleibt, keine
Szene fällt weg. Was du als Andres tust, verändert, wie Woyzeck dorthin kommt: ob er sich dir öffnet, wie viel
Kraft er noch hat und was am Ende aus dem wird, was er dir schenkt.

## Spielen

**https://babypython67.github.io/Projects/woyzeck/** (nach dem Merge nach `main`)

Lokal (der Text wird per `fetch` geladen, deshalb über einen kleinen Server, nicht per Doppelklick):

```bash
cd woyzeck && npm start
```

Dann http://localhost:8080 öffnen. Gleichwertig: `python3 -m http.server 8080 -d woyzeck`.

Auf dem iPad: in Safari öffnen, Teilen-Symbol, „Zum Home-Bildschirm“. Warum, steht unter „Speichern“.

## Entscheidungen auf einen Blick

| Frage | Entscheidung | Warum |
|---|---|---|
| Textquelle | zeno.org, Hamburger Ausgabe von W. R. Lehmann (1967), roh per curl | gemeinfrei und eine zuverlässige Lesung aller Handschriften; Wikisource hat nur Franzos 1879 (siehe „Textquelle“) |
| Szenenfolge | Henri Poschmann (1984) | H4 als Leittext, Ursache vor Wirkung, enthält die Andres-Szene H1,8 (siehe „Szenenfolge“) |
| Rechtschreibung | behutsam modernisiert, nach festen Regeln in `tools/modernisierung.mjs` | Dialekt, Wortformen und Satzzeichen bleiben, nur th/ß/y/c und Großschreibung folgen der heutigen Schreibung |
| Form | eine Spalte Text, Szene für Szene; Rede als Zeile mit kleinem Sprechernamen, Andres heißt dort „Du“ | so bleibt Büchners Dialog Wort für Wort stehen, und die Erzählung um ihn herum ist Prosa |
| Entscheidungen | am Ende eines Abschnitts zwei bis drei Zeilen: was Andres sagt oder tut | Andres’ Sätze bei Büchner fallen immer; die Wahl liegt in dem, was danach kommt |
| Wie viele | 13 Entscheidungen in 21 Szenen | genug, dass man Andres spielt; wenig genug, dass man liest |
| Folgen | Zustand (Offenheit, Kraft, Abschied) wählt, welche Fassung einer Stelle erscheint | festes Ende, aber andere Wege dorthin (siehe „Recherche“: Short, Ashwell) |
| Klang | zur Laufzeit erzeugt (Web Audio), ein Klangraum je Ort, standardmäßig aus | keine fremden Dateien, nichts zu laden; das Spiel ist ohne Ton vollständig |
| Andeutungen | wenige Striche als SVG, werden beim Weiterlesen blasser und kommen nicht zurück | die Bilder sollen im Kopf entstehen |
| Speichern | nach jedem Schritt im Browser; Home-Bildschirm-App; Sicherungscode; Service Worker | übersteht geschlossene Tabs und Safaris 7-Tage-Löschung |
| Technik | statische Seite, ES-Module, kein Build, keine Abhängigkeiten außer Playwright für den Test | läuft auf GitHub Pages wie die anderen Spiele im Repo |

## So ist das Konzept umgesetzt

**Andres und Woyzecks eigener Wille.** Du spielst Andres, nicht Woyzeck. Was du wählst, sind Andres’ Worte und
Handgriffe: nachfragen, mitgehen, Brot teilen, sich zur Wand drehen, mitlachen. Woyzeck antwortet darauf nach
seinem eigenen Zustand. Wem er nicht traut, dem folgt er nicht: Er geht allein ins Wirtshaus, wenn er dich
nicht dabeihaben will, steht seine Wache selber und geht weiter zum Doktor, solange er dir nicht genug vertraut
und kein Brot hat. Manches tut er auch bei vollem Vertrauen nicht.

**Du-Form.** Durchgehend ein einziges „du“, und das ist Andres („Du stellst dich an den Brunnen und wartest“).
Es gibt kein verallgemeinerndes „du“ und keine Anrede an den Leser. In Büchners Dialog steht Andres als „Du“,
und seine Sätze bei Büchner bleiben seine.

**Text, Klang, Andeutungen.** Der Text trägt alles. Jede Szene beginnt mit einer Andeutung aus wenigen Strichen
(ein Federbusch, ein Napf Erbsen, ein Kamisol). Sie zeichnet sich langsam und verblasst, je weiter man liest.
Der Klang macht nur den Ort: Wind auf dem Feld, Trommeln und Pfeifen beim Zapfenstreich, Leierkasten auf der
Messe, ein Ländler im Wirtshaus, Atem im Schlafsaal, Wasser und Frösche am Teich, eine tickende Uhr in der
Amtsstube. Er wechselt mitten in der Szene, wenn man an die Stelle kommt. Ohne Ton fehlt nichts.

**Büchners Wortlaut neben meinen Ergänzungen.** Jeder Satz von Büchner steht im Inhalt zwischen `{` und `}` und
wird von einem Test gegen die modernisierte Quelle geprüft; keiner ist umformuliert. Im Spiel lässt er sich im
Menü hinterlegen („Büchners Wortlaut hinterlegen“). Ergänzt sind die Erzählung, Andres’ Antworten, das Gerede
der anderen als Rahmen und Woyzecks innere Welt. Je Durchgang stammen etwa 45 % der Wörter von Büchner.

**Die drei Folgen.** (1) Offenheit: Hörst du zu, erzählt Woyzeck dir selbst, was beim Doktor, beim Professor
und bei Marie war, und zuletzt, was die Stimmen sagen. Hörst du nicht zu, erfährst du dieselben Szenen als
Gerede am Brunnen, in der Kantine, durchs offene Fenster, aus fremdem Mund und mit fremdem Spott.
(2) Kräfte: Brot, Schlaf und ob er beim Doktor aufhört, verändern, wie er kämpft, wie er seine Sachen ordnet,
wie klar er am Ende ist und was der Doktor danach über ihn sagt. (3) Abschied: Ob du verstehst, was es heißt,
dass er dir seine Sachen schenkt, und was du dann tust, bestimmt die letzte Nacht, den Morgen und das, was dir
bleibt. Die Prüfung mit zwei gegensätzlichen Durchgängen steht unter „Folgen spürbar“.

**Woyzecks innere Welt.** Nach vielen Szenen stehen ein paar eingerückte, kursive Zeilen aus Woyzeck heraus:
Bruchstücke, keine Erklärungen. Sie verändern sich mit dir: Wie er dich sieht („Der Andres hat gefragt“ oder
„Der Andres singt“), wie klar er noch denkt, ob er geschlafen hat. Die Stimmen auf dem Feld (H4,12) und, wenn
er es dir nicht selbst sagt, die Mordszene erscheinen nur dort, in seinem Inneren.

**Speichern.** Nach jeder Entscheidung und jedem „Weiter“ wird der Stand gespeichert, dazu die Leseposition in
der Szene. Wer den Tab schließt, liest mit „Weiterlesen“ an derselben Stelle weiter. Gegen Safaris Löschen nach
sieben Tagen ohne Besuch hilft die Home-Bildschirm-App (eigener Speicher, darauf weist das Spiel hin) und der
Sicherungscode im Menü: ein kurzer Code (etwa `WOY-20100-00000-04VX8`), der Szene und Entscheidungen enthält,
mit Prüfsumme gegen Tippfehler. Ein Service Worker hält alles offline bereit und holt bei Netz immer zuerst die
neue Fassung.

<details>
<summary>Die Folgen im Einzelnen (verrät die Geschichte)</summary>

Woyzecks Zustand steckt in drei Größen, die niemand sieht; man merkt sie nur am Text.

**Offenheit** (`offen`, Start 1). Steigt mit jeder zugewandten Antwort und fällt mit jeder abwimmelnden: auf dem
Feld (fragen / drübersingen / schweigend die Stöcke tragen), beim Professor (Brot / „Wackel einmal“), beim
Tambourmajor (ihm sagen, was der prahlt / ihn hinausbringen), beim Doktor, auf der Straße (ihm nachlaufen /
stramm stehen bleiben), in der Wachtstube (mitgehen / „Lauf halt, ich sing derweil“), in der Nacht, auf dem
Kasernenhof, im Wirtshaus beim Kampf. Verzögert wirkt das Schweigen über den Tambourmajor: Auf dem Hof merkt
Woyzeck, dass du es schon wusstest, und die Offenheit fällt dann noch einmal.
- ab 2: Woyzeck erzählt dir selbst vom Professor, von Mariens Ohrringen, vom Doktor (mit der „doppelten Natur“
  und den Schwämmen); sonst erfährst du es von der Margreth am Brunnen, vom Hannes in der Kantine, von der Magd
  des Doktors. Er lässt dich mitgehen ins Wirtshaus (sonst erzählen es dir nachts die betrunkenen Kameraden).
- ab 3: Er setzt sich nach dem Streit mit Marie zu dir an den Brunnen; er schickt dich mit dem Geld zu Marie,
  und du hörst sie in der Bibel lesen (sonst liest die Margreth es spottend vor).
- ab 4: In der Nacht erzählt er dir das Messer am Fenster in der dunklen Gasse und was die Stimmen sagen:
  „stich, stich die Zickwolfin tot“. Dann erkennst du beim Trödler, was er gekauft hat, und kannst am Ende
  zu Marie rennen statt ihm nachzugehen.

**Kräfte** (`kraft`, Start 2). Brot teilen (+1; er nimmt es, auch wenn er sich ziert), beim Doktor aufhören
(+1, aber nur, wenn er dir vertraut und dein Brot hat; sonst „Zwei Groschen sind zwei Groschen“), in der Nacht
wach bleiben oder ihm Schnaps holen (+1) statt dich wegzudrehen (−1), nach dem Kampf seine Wache übernehmen
(+1, wenn er dich lässt), „Zulage ist Zulage“ (−1). Spürbar wird das:
- beim Doktor: Mit deinem Brot im Bauch lügt er ihn an („Immer ordentlich, Herr Doktor“), und ihr lacht
  lautlos auf der Bank; ohne sieht man seine Rippen.
- im Kampf mit dem Tambourmajor: Er hält lange stand und bringt ihn einmal aufs Knie, oder er klappt beim
  ersten Griff zusammen. Sein „Eins nach dem andern“ ist dann eine Rechnung oder ein nachgepfiffenes Wort des
  Hauptmanns.
- beim Verschenken der Sachen: rasiert, gebürstet, ruhig wie zum Appell, oder zitternd, das Ringlein unterm Bett.
- in der Mordnacht (innere Welt): „Ich war ganz klar“ oder „Die Hand gehört dem, der aus der Wand redt“.
- danach beim Richter: Der Doktor sagt, er sei bei Kräften und vollkommen klar gewesen (dein Brot, deine Wache
  werden zum Beleg gegen ihn), oder er habe nichts gegessen als Erbsen, „ein schöner Verlauf“.

**Abschied** (`abschied`). In der Kaserne gibt er dir Kamisol, Kreuz, Ringlein und den Heiligen. Danach:
- „Jawohl“ und hinlegen: Du schläfst. Die Nacht erzählt nur seine innere Welt. Am Morgen weckt dich das Rufen
  der Kinder, sein Bett ist unberührt, und das Gerede bringt dir den Rest. Am Ende liegen die Sachen unten im
  Tornister, und du singst dich in den Schlaf, „Saßen dort zwei Hasen“, und keiner sagt: Still.
- ihm nachgehen: Du siehst ihn mit Marie aus der Gasse gehen und denkst, dann ist er nicht allein. Du wartest im
  Wirtshaus, bis er kommt, mit Blut am Ellenbogen, du hörst ihn im Dunkeln nach dem Messer suchen, und am Teich
  findest du ihn im Wasser.
- zu Marie rennen (nur wenn er dir die Stimmen anvertraut hat): Die Mädchen vor der Tür spielen dir vor, wie
  er sie geholt hat, die Großmutter erzählt ihr Märchen, zwei Leute aus der Vorstadt hören mit dir den Ton vom
  Wasser her, und du stehst dreißig Schritte entfernt am roten Kreuz und findest nichts.
- am Teich: fragen, was er getan hat (bei großer Offenheit erzählt er dir Mariens letzte Worte), ihm die Hände
  waschen oder dich umdrehen. Diesmal hältst du seinen Ärmel, wie er am ersten Tag deinen hielt.
- am Morgen sein Blick vor Mariens Tür, und was dir bleibt: das Kreuz für den Buben, das zu enge Kamisol unter
  dem Rock und das lange Händewaschen am Brunnen, oder das Kamisol beim Trödler, „Zwee Grosche“.
- Beim Richter kannst du nur dann von den Stimmen sprechen, wenn er sie dir anvertraut hat.

</details>

## Textquelle

Büchners Text stammt von **zeno.org**: „Woyzeck“ nach Georg Büchner, *Sämtliche Werke und Briefe*, hg. von
Werner R. Lehmann, Bd. 1, Hamburg/Reinbek 1967 (2. Aufl. München 1974), dort mit der Lizenzangabe „Gemeinfrei“:
http://www.zeno.org/Literatur/M/Büchner,+Georg/Dramen/Woyzeck. Büchner ist 1837 gestorben. Der Schutz einer
wissenschaftlichen Ausgabe nach § 70 UrhG endet 25 Jahre nach Erscheinen, für Lehmanns Ausgabe also 1992
(spätestens 1999 für die zweite Auflage). Die Marburger Ausgabe (2005) ist noch geschützt; sie habe ich nicht benutzt.

`tools/quelle-holen.sh` holt die 50 Seiten roh per curl, `tools/quelle-auszug.mjs` zieht den Werktext
unverändert heraus (`quelle/woyzeck-zeno.txt`), `tools/modernisieren.mjs` schreibt die modernisierte Fassung
(`quelle/woyzeck-modernisiert.txt`), aus der das Spiel zitiert. Lehmann gibt alle Handschriften getrennt wieder
(H1, H2, H3, H4) und setzt in den frühen Entwürfen die endgültigen Namen in Klammern dahinter (`LOUIS [WOYZECK]`).
Das Spiel verwendet die endgültigen Namen.

Warum nicht Wikisource: Dort gibt es den Text nur in der Erstausgabe von Karl Emil Franzos (1879, „Wozzeck“),
die viele Lesefehler hat und eine eigene Szenenfolge baut. Bergemanns Insel-Ausgabe von 1922 (Internet Archive)
wäre ebenfalls gemeinfrei, liegt aber nur als fehlerhafte Texterkennung vor.

**Rechtschreibung.** Behutsam modernisiert, nach den Regeln in `tools/modernisierung.mjs` (die Datei ist zugleich
die vollständige Liste): th → t (Athem → Atem, todt → tot), ß → ss nach kurzem Vokal (daß → dass, muß → muss),
y → i (seyn → sein), c → k/z in eingedeutschten Wörtern (Doctor → Doktor, Caserne → Kaserne; Latein und
Französisch bleiben: aberratio, courage, à propos), -iren → -ieren, jezt → jetzt, giebt → gibt, kleine
Zahlen ausgeschrieben (7 Paar → sieben Paar), überholte Apostrophe entfernt (wär' → wär, in's → ins) und
großgeschriebene Pronomen klein (Alles → alles, außer am Satzanfang). Dialekt (nit, nix, Mensche, gefalln),
Wortformen (Hülfe, ohngefähr, schwindlich), Satzzeichen und Lehmanns Lesungen bleiben.

## Szenenfolge

Büchner hat die Reihenfolge nicht festgelegt. Überliefert sind zwei Entwurfsgruppen (H1, H2), zwei verstreute
Szenen (H3) und eine unvollständige Reinschrift (H4, 17 Szenen, bricht vor dem Mord ab). Die Vorbemerkung bei
zeno.org nennt drei Lesefassungen mit ihren Folgen: Bergemann (1921), Lehmann (1967) und Poschmann (1984).

Ich folge **Poschmann**:

H4,1 – H4,2 – H2,3 mit H1,1 – H2,5 – H1,2 – H1,3 – H3,1 – H4,4 – H4,5 – H4,6 – H4,8 – H4,9 mit H2,7 – H4,7 –
H4,10 – H4,11 – H4,12 – H4,13 – H1,8 – H4,14 – H4,15 – H4,16 – H4,17 – H1,14 – H1,15 – H1,16 – H1,17 – H1,19 –
H1,20 – H1,18 – H3,2 – H1,21

- **Wie Lehmann, anders als Bergemann:** H4 ist Leittext, und es beginnt mit dem freien Feld (Woyzeck und
  Andres), nicht mit der Rasierszene. Für ein Spiel aus Andres’ Sicht ist das der richtige Anfang. Bergemanns
  Fassung mischt Entwürfe stark und galt lange als verbindlich, ist aber überholt.
- **Ursache vor Wirkung:** Poschmann stellt die Straßenszene, in der der Hauptmann von einem Haar aus einem Bart
  spricht (H4,9 mit H2,7), vor die Szene, in der Woyzeck Marie zur Rede stellt (H4,7). Bei Lehmann steht es
  umgekehrt. Der Hof des Professors (H3,1) kommt früh, sodass der Versuch mit den Erbsen von Anfang an da ist.
- **Andres’ Szene H1,8:** Poschmann nimmt den Kasernenhof auf, wo Andres erzählt, was der Tambourmajor gesagt
  hat. Lehmann lässt ihn weg. Für dieses Spiel ist es eine der wichtigsten Szenen.
- **Ein kaltes Ende:** Nach dem Teich kommen die Kinder, Woyzeck mit seinem Kind und zuletzt der Gerichtsdiener
  („Ein guter Mord, ein echter Mord, ein schöner Mord“). Woyzecks Schicksal bleibt offen, wie im Fragment.

Wo eine Szene ohne Andres spielt, kommt sie im Spiel dann, wenn Andres davon erfährt: im Augenblick (durchs
Fenster, auf der Straße), am selben Abend (Woyzeck erzählt), am nächsten Morgen (Gerede). Die Ereignisse
bleiben in Poschmanns Reihenfolge. Ein Test prüft für drei Durchgänge (zuhören, abwimmeln, gemischt), dass aus
jeder Szene dieser Folge Büchners Text im gelesenen Text vorkommt.

## Was von Büchner ist und was ergänzt

- **Von Büchner:** alles zwischen `{` und `}` in `inhalt/*.txt`, im Spiel über „Büchners Wortlaut hinterlegen“
  sichtbar. `tools/pruefe-buechner.mjs` und der Test „Jeder als Büchner markierte Satz …“ prüfen jeden Satz
  wörtlich gegen `quelle/woyzeck-modernisiert.txt`. Je Durchgang rund 45 % der Wörter.
- **Aus den Vorstufen:** Wenn Woyzeck sich öffnet, spricht er Sätze aus Entwürfen, die keine Lesefassung
  aufnimmt (H2,1 das Feld, H1,7 und H1,13 die Nacht, H1,11 die Bank vor dem Wirtshaus). Sie ersetzen nie den
  H4-Text, sie kommen dazu.
- **Ergänzt:** die Erzählung, Andres’ Antworten (außer seinen Sätzen bei Büchner), Woyzecks innere Welt (außer
  den Zeilen aus H4,12, H1,15, H1,19 und H1,20), die Rahmen des Geredes und das Nachspiel beim Richter.
- **Gekürzt:** nur Unlesbares und Bruchstücke, die Lehmann mit [??] oder „[Satz bricht ab.]“ markiert (in H2,3,
  H4,9, H2,7, H1,15), ein Randvermerk in H1,2 („Das ist ein Weibsbild …“) und die letzten Sätze des Hauptmanns
  in H2,7 nach „Haha, hinterdrein“.
- **Bleibt, wie es bei Büchner steht:** auch das Unbequeme, etwa der Jude als Händler und die Schlusspointe der
  Handwerksburschen-Predigt. Es ist Büchners Bild dieser Leute, und kein Satz davon ist geglättet.

<details>
<summary>Die Ergänzungen im Einzelnen (verrät die Geschichte)</summary>

- **Erzählrahmen jeder Szene:** Ort, Licht, Geruch, was Andres tut, wo er steht (am Brunnen an der Ecke, im Gang
  vor dem Zimmer des Hauptmanns, auf der Bank im Hof).
- **Wer erzählt, wenn Andres nicht dabei ist:** Woyzeck selbst (Professor, Ohrringe, Doktor, nach dem Streit mit
  Marie, am Teich), die Nachbarin Margreth am Brunnen (Ohrringe, „Ich seh nichts“, die Bibel), der Hannes in der
  Kantine (Professor, Wirtshaus), die Magd des Doktors (über den Bäcker), der Tambourmajor, der vor der Kantine
  mit Marie prahlt (H4,6 in seinem Mund), der Trödler im Kasernenhof (H4,15 in seinem Mund), die Mädchen vor
  Mariens Tür und der Wirt (H1,14 und H1,17). Ihre Sätze über die anderen sind Büchners Sätze, nur der Rahmen ist neu.
- **Kleine neue Sätze anderer Figuren:** der Unteroffizier, der Woyzeck aus der Bude schickt („Der Hauptmann will
  seinen Wein. Marsch.“), der Hauptmann, der Andres anfährt („Und Er? Was gafft Er?“), der Doktor beim Richter
  (neben zwei echten Sätzen aus H4,8), der Richter in indirekter Rede.
- **Neue Handlungsdetails, die Büchners Handlung nicht ändern:** Andres teilt sein Brot; Woyzeck lügt den
  Doktor an; Andres übernimmt eine Wache; Woyzeck schickt Andres mit dem Geld zu Marie; Andres wartet im
  Wirtshaus, folgt ihm, steht am Teich; die Sachen und was aus ihnen wird; das Nachspiel beim Richter. Dass
  „Zickwolfin“ Mariens Vatersname sei, ist meine Deutung.
- **Woyzecks innere Welt:** alle kursiven Bruchstücke außer den gekennzeichneten Büchner-Zeilen.

</details>

## Recherche

Alle Quellen unten habe ich geöffnet (Seiten per WebFetch, Text- und PDF-Dateien per curl mit `pdftotext`).
Fachquellen stehen vorn; was nur Anregung war, ist als **Ideengeber** markiert.

**Woyzeck: Fassungen und Szenenfolgen**

1. zeno.org, *Woyzeck* mit Vorbemerkung, Text nach Lehmann:
   http://www.zeno.org/Literatur/M/Büchner,+Georg/Dramen/Woyzeck. **Geöffnet** (alle 50 Seiten roh per curl).
   Übernommen: der ganze Text und aus der Vorbemerkung die drei Szenenfolgen von Bergemann, Lehmann und Poschmann.
2. Wikisource, *Wozzeck* (Franzos 1879): https://de.wikisource.org/wiki/Wozzeck. **Geöffnet** (roh, `action=raw`
   und `action=render`). Übernommen: nur die Entscheidung dagegen, wegen der Lesefehler und weil Franzos eine
   eigene Szenenfolge baut.
3. Internet Archive, Bergemanns Insel-Ausgabe 1922: https://archive.org/details/georgbchnerss00bcuoft.
   **Geöffnet** (Texterkennung per curl). Übernommen: der Vergleich mit Bergemanns Folge; als Textgrundlage wegen
   der Erkennungsfehler verworfen.
4. Klaus Kanzog, Rezension der Marburger Ausgabe Bd. 7 (Woyzeck), Fachliteratur:
   https://epub.ub.uni-muenchen.de/25549/1/Kanzog_Rez_25549.pdf. **Geöffnet** (PDF). Übernommen: Lehmann druckt H4
   als Leittext mit den Entwürfen daneben, die Marburger Ausgabe druckt in der Reihenfolge der Handschriften,
   und H4,15 hat keine Vorlage. Jede Lesefassung bleibt eine Entscheidung, die man begründen muss.
5. Wikipedia, *Woyzeck*: https://de.wikipedia.org/wiki/Woyzeck. **Geöffnet** (WebFetch und roh, beim
   Netz-Check). **Ideengeber** (Nachschlagewerk): Überblick über Entstehung und Uraufführung, nichts zitiert.

**Textspiele, Nähe, Du-Erzählung, Entscheidungen mit festem Ende**

6. Emily Short, „Beyond Branching: Quality-Based, Salience-Based, and Waypoint Narrative Structures“ (2016):
   https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/.
   **Geöffnet.** Übernommen: Der Zustand wählt aus, welcher Text als Nächstes erscheint, statt dass jede
   Entscheidung einen eigenen Ast aufmacht. So sind hier die Stellen gebaut.
7. Sam Kabo Ashwell, „Standard Patterns in Choice-Based Games“ (2015):
   https://heterogenoustasks.wordpress.com/2015/01/26/standard-patterns-in-choice-based-games/. **Geöffnet.**
   Übernommen: „branch and bottleneck“ mit starker Zustandsverfolgung. Büchners Szenen sind die Engstellen, durch
   die jeder Weg muss, und der Zustand sorgt dafür, dass sie sich trotzdem anders lesen.
8. Peter Mawhorter, Michael Mateas, Noah Wardrip-Fruin, Arnav Jhala: „Towards a Theory of Choice Poetics“, FDG 2014:
   https://cs.wellesley.edu/~pmwh/research/papers/towards-choice-poetics-fdg-2014.pdf. **Geöffnet** (PDF).
   Übernommen: Verantwortung und Reue entstehen nur, wenn die Optionen zu dem passen, was die Figur realistisch
   tun kann („character realism“). Deshalb hat Andres nur kleine, soldatische Möglichkeiten und keine Rettung.
9. Monika Fludernik: „Second Person Fiction: Narrative You As Addressee And/Or Protagonist“, *Arbeiten aus
   Anglistik und Amerikanistik* 18 (1993): https://freidok.uni-freiburg.de/dnb/download/4916. **Geöffnet** (PDF).
   Übernommen: die Trennung von „du“ als Angesprochenem und „du“ als Hauptfigur. Hier ist das „du“ immer Andres,
   nie der Leser und nie ein allgemeines „man“.
10. Jess Joho, „80 Days writer thinks you should stop playing the hero“, Kill Screen (2016), über Meg Jayanths
    GDC-Vortrag „Forget Protagonists: Writing NPCs with Agency“:
    https://www.killscreen.com/80-days-writer-thinks-you-should-stop-playing-the-hero/. **Geöffnet.**
    Übernommen: Figuren mit eigenem Willen, die nicht tun, was der Spieler will, und Jayanths Satz „agency is an
    effect, not a goal“. Woyzeck folgt Andres nur, wenn Vertrauen da ist.
11. John Wilander, „Full Third-Party Cookie Blocking and More“, WebKit-Blog (2020):
    https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/. **Geöffnet.** Übernommen: Safari
    löscht skriptbeschreibbaren Speicher (localStorage, IndexedDB, Service-Worker-Cache) nach sieben Tagen ohne
    Besuch; Web-Apps auf dem Home-Bildschirm haben einen eigenen Zähler. Daher der Installationshinweis und der
    Sicherungscode.
12. Miguel Penabella, „Opened World: Kentucky Route Zero Act III“, Haywire Magazine (2018):
    https://haywiremag.com/columns/opened-world-kentucky-route-zero-act-iii/. **Geöffnet.** **Ideengeber**
    (Kritik): Dialogwahl als Ausdruck, wie man eine Figur sieht, statt als Weiche für die Handlung.

**Nicht geöffnet** (zählen nicht mit): GDC Vault, Seite von Jayanths Vortrag (leitete auf eine Wartungsseite um);
Fludernik, „Second-Person Narrative as a Test Case for Narratology“, *Style* 1994, bei Project MUSE (Prüfseite
statt Text); ein MDPI-Aufsatz zur Du-Erzählung (HTTP 403); depressionquest.com (HTTP 503; die Idee, dass ein
Zustand Optionen verschließt, kam nur aus Suchergebnissen); die Reclam-Leseprobe zu Dedners Studienausgabe (HTTP 503).

## Länge

<!-- Zeile aus `node tools/durchgaenge.mjs` -->
**Durchgang „zuhören“: 10 404 Wörter, „abwimmeln“: 8 231 Wörter; geschätzte Lesezeit bei 150–200 Wörtern pro
Minute 52–69 bzw. 41–55 Minuten**, dazu die Pausen an den Entscheidungen. Das liegt am unteren Rand des
Richtwerts. Der abwimmelnde Durchgang ist kürzer, weil Woyzeck dann weniger erzählt; das ist gewollt.

## Folgen spürbar

`node tools/durchgaenge.mjs` spielt zwei Durchgänge, A „zuhören“ (immer die zugewandte Option) und B
„abwimmeln“, und listet je Folge die Stellen mit Wortzahlen, an denen sich der Text unterscheidet, ohne den Text
selbst. Gefordert sind je Folge mindestens zwei Stellen mit mindestens 50 geänderten Wörtern. Stand dieser Fassung:
Offenheit 22 solcher Stellen, Kräfte 13, Abschied 9. Dieselbe Prüfung läuft als Test.

## Technik und Inhaltsformat

```
index.html, css/stil.css      Lesefläche, Menü
js/engine.js                  Inhaltsformat lesen, Stand auswerten, Sicherungscode (läuft auch in Node)
js/app.js                     Oberfläche, Speichern, Service-Worker-Anmeldung, Installationshinweis
js/speicher.js                localStorage, abgesichert gegen gesperrten oder gelöschten Speicher
js/klang.js, js/bilder.js     Klangräume (Web Audio) und Andeutungen (SVG)
inhalt/*.txt                  die Geschichte; inhalt/register.txt für den Sicherungscode
quelle/                       Büchners Text roh und modernisiert
sw.js                         Service Worker (aus tools/sw-vorlage.js, Fassung per npm run version)
tools/                        Quelle holen, modernisieren, Vergleich der Durchgänge, Server, Symbole
tests/                        Logik-, Inhalts- und Browser-Tests
```

Ein Spielstand ist nur die Szene und die getroffenen Entscheidungen. Alles andere entsteht, indem die Engine die
Szenen von vorn durchläuft. Deshalb passt der Stand in einen kurzen Code.

Das Inhaltsformat (Auszug):

```
## feld | Freies Feld. Die Stadt in der Ferne.     Szene: Kennung | Überschrift
quelle: H4,1; H2,1                                Handschriften-Szenen, ort:, bild:, zeit:, wenn:
Erzähltext. {Büchners Wortlaut} und _kursiv_.     Absatz
WOYZECK: {Still! Es geht was!}                    Rede (ANDRES erscheint als „Du“)
~ {Saßen dort zwei Hasen,}                        Liedzeile
[stelle feld.brunnen offen] … [/stelle]           Stelle mit Folge (offen | kraft | abschied)
[wenn offen >= 2] … [sonst wenn …] … [sonst] … [ende]
[wahl feld.wahl offen]                            Entscheidung mit Folge
* fragen (zuwenden): „Was hast du gesehen?“       Option: Schlüssel (Haltung) [wenn …]: Text
[setze offen +1, brot = 1]
[/wahl]
[innen feld.innen offen] … [/innen]               Woyzecks innere Welt
[bild messer] [ort teich] [pause]
```

**Für später angelegt:** `js/inhalt-liste.js` führt die Inhaltsdateien je Durchgang (`DURCHGAENGE.andres`); ein
Durchgang aus Maries Sicht bekommt eigene Dateien und ein eigenes Register. Szenen können eine Zeile `wenn:`
tragen und werden dann nur auf passenden Wegen gelesen. Damit lassen sich Abweichungen vom Ende als zusätzliche
Szenen einfügen, ohne die vorhandenen zu ändern. Das Register ist nur zum Anhängen da, alte Sicherungscodes
bleiben dann gültig.

## Tests

```bash
cd woyzeck
```

```bash
npm test
```

```bash
npm run test:browser
```

```bash
npm run durchgaenge
```

`npm test` (ohne Pakete, Node ab 18) prüft Engine, Woyzecks eigenen Willen, den Zustand der drei Folgen nach
zuhörendem und abwimmelndem Spiel, Speichern und Laden (auch mit kaputten Daten und gesperrtem Speicher), den
Sicherungscode (Hin- und Rückweg, Tippfehler) und den Inhalt: Büchners Wortlaut, keine Szene fehlt, jede Variante
hat eine Folge, Register, Erreichbarkeit aller Optionen, spürbare Folgen, aktueller Service Worker.

`npm run test:browser` braucht Playwright (`npm install && npx playwright install chromium`) und wird ohne
Playwright **nicht** übersprungen, sondern schlägt fehl. Er öffnet das Spiel in Chromium mit iPad-Maßen, trifft
eine Entscheidung, lädt neu und prüft, dass der Stand da ist; stellt einen Stand nach gelöschten Daten per Code
wieder her; prüft, dass eine neue Fassung trotz `Cache-Control: max-age=600` (wie bei GitHub Pages) nach einmal
Neuladen da ist und alte Speicher gelöscht werden; liest offline weiter; prüft Handy-Breite und Konsole.

Nach jeder Änderung an ausgelieferten Dateien: `npm run version` (schreibt die Fassung in `sw.js`).

## Prüfen auf dem iPad

Was sich hier nicht prüfen lässt: das echte Gerät, Safari selbst, der Ton, der Home-Bildschirm.

1. **Lesen:** In Safari die Adresse öffnen, „Beginnen“, die erste Szene lesen. Schrift über das Menü anpassen
   (A− bis A++). Hoch- und Querformat probieren. Die Andeutung oben sollte sich zeichnen und beim Scrollen verblassen.
2. **Entscheiden und weiterlesen:** Eine Entscheidung treffen, den Tab schließen, Safari beenden, neu öffnen:
   „Weiterlesen“ führt an dieselbe Stelle.
3. **Ton:** Kopfhörer, im Menü „Klang“ einschalten. Auf dem Feld Wind, beim Zapfenstreich (Szene 2) Trommeln und
   Pfeifen, auf der Messe Leierkasten, im Wirtshaus der Ländler. Auch mit Stummschalter sollte der Ton kommen
   (das Spiel stellt die Audio-Sitzung auf Wiedergabe, wo Safari das schon kann). Bildschirm sperren: Ton hört auf.
4. **Home-Bildschirm:** Zuerst im Menü den Sicherungscode kopieren. Dann Teilen-Symbol, „Zum Home-Bildschirm“.
   Die App öffnet ohne Safari-Leiste und **mit leerem Stand**, denn sie hat eigenen Speicher. Im Menü den Code
   einfügen, „Stand wiederherstellen“. Der Hinweis im Menü sagt jetzt, dass du in der App liest.
5. **Offline:** In der App lesen, Flugmodus an, App schließen und wieder öffnen: Text und Stand sind da.
6. **Neue Fassung:** Im Menü unter „Über dieses Spiel“ steht die Fassung (zehn Zeichen). Nach einer Änderung am
   Spiel und dem Merge: App öffnen, einmal schließen und wieder öffnen. Die Nummer sollte wechseln; erscheint
   unten „Eine neue Fassung ist da“, auf „Neu laden“ tippen. Der Stand bleibt.
7. **Sicherungscode:** Den Code in eine Notiz kopieren, im Menü absichtlich ein Zeichen ändern: Das Spiel sagt,
   dass der Code nicht stimmt. Mit dem richtigen Code geht es an derselben Stelle weiter.
8. **Dunkel:** Mit dunkler Darstellung (Kontrollzentrum) liest man hell auf dunkel.

## Ehrliche Einschätzung

**Was trägt.** Büchners Text trägt fast alles, und die Form lässt ihn stehen: Wer abwimmelt, bekommt dieselben
Szenen aus Margreths Spott und der Kantine, und das ist kälter als jede Erklärung. Die Folgen sind in beiden
Richtungen spürbar und bleiben dabei im Fragment. Am meisten erhoffe ich mir von den Momenten, in denen Andres’
Fürsorge sich gegen Woyzeck wendet: Das geteilte Brot wird beim Richter zum Beleg, dass er „bei Kräften“ war,
und wer am meisten weiß, steht in der Mordnacht dreißig Schritte entfernt im Nebel. Der Ärmel vom ersten Tag,
den Andres am Teich festhält, verbindet Anfang und Ende, ohne dass es jemand sagen muss.

**Was schwach ist.**
- **Kurz:** gut 50 Minuten für den zuhörenden Durchgang, gut 40 für den abwimmelnden, am unteren Rand des
  Richtwerts. Nicht aufgefüllt, aber in der Mitte (Ohrringe, Rasieren, Tambourmajor) liest man mehr Büchner
  als Andres.
- **Zufälle:** Andres steht oft zufällig am richtigen Brunnen und Fenster. Ohne das bliebe vieles nur Bericht,
  aber es wiederholt sich.
- **Gerede:** Die Margreth trägt zu viel davon.
- **Rhythmus:** In der zweiten Hälfte kommen die Entscheidungen dichter als in der ersten.
- **Klang:** synthetisch und einfach, eher Skizze als Raum. Auf einem echten iPad habe ich ihn nicht gehört.
- **Andeutungen:** sehr sparsam; manche Striche (Faust, Handschuh) sind eher Zeichen als Andeutung.

**Wo meine Ergänzungen neben Büchner abfallen.** Büchner erklärt nie; ich tue es manchmal doch. Vergleiche wie
„wie zwei, die an derselben Last tragen“ oder „als wär der Ärmel noch das Einzige, was fest ist“ sind glatter
als jeder Satz bei ihm. Einige Schlusszeilen der inneren Welt sind zu rund und fast schon Pointen („Zwei
können’s tragen. Oder zwei sind schuld.“). Woyzeck spricht dort mehr Hochdeutsch als bei Büchner, und Andres’
Dialekt schwankt zwischen „nit“ und „nicht“. Das Nachspiel beim Richter ist ganz von mir. Es denkt hörbar vom
historischen Fall her, in dem das Gutachten Woyzeck für zurechnungsfähig erklärte, und ist damit eine Deutung,
die Büchners Fragment nicht ausspricht. Die neuen Sätze des Hauptmanns und des Unteroffiziers sind Gebrauchstext
neben Büchners Hauptmann, der in jedem Satz er selbst ist.
