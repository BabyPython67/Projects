Ich setze dir gleich per /goal ein Ziel. Hier vorab der Auftrag dazu. Fang noch nicht an: Lies ihn, antworte nur mit „Verstanden“ und warte auf das /goal.

Zwei Aufgaben in diesem Repo, in dieser Reihenfolge: Erst bringst du das Repo in Ordnung, dann entwickelst du ein Spiel zum Zeitvertreib, das ich (Mirko) im Browser auf iPad und Handy spiele. Stelle mir keine Fragen. Triff jede Entscheidung selbst und halte sie kurz im passenden README fest.

Ausgangslage: In diesem Repo liegen schon drei Spiele aus einem früheren Auftrag: `johannisnacht/`, Deichgraf in `spiel/` und Brückenwärter in `spiel/brueckenwaerter/`. Sie laufen technisch einwandfrei, sind für mich insgesamt aber nicht sehr reizvoll. Gute Ansätze hatten sie trotzdem: Beim Spielgefühl hatte der Sound der Glühwürmchen in Johannisnacht seinen Charme, bei Welt und Atmosphäre Johannisnacht und Brückenwärter. Gefehlt haben mir:
- Langzeitmotivation: Nach ein paar Partien ist alles gesehen, es gibt keinen Grund für noch eine.
- Spannende Entscheidungen: zu wenig Tiefe, keine echten Abwägungen, keine verschiedenen Wege zum Ziel.

Teil 1, Repo in Ordnung bringen:
- Eingecheckte Python-Cache-Dateien (`__pycache__`) entfernen und eine `.gitignore` anlegen, die so etwas künftig ausschließt.
- Jedes Spiel in einen eigenen Ordner mit eigenem README. Alte Adressen leiten auf die neuen weiter, damit Links und auf dem Home-Bildschirm abgelegte Spiele weiter funktionieren. Brückenwärter hat einen Service Worker, der zuerst aus dem Speicher liefert: Wer es vom Home-Bildschirm unter der alten Adresse öffnet, soll mit Netz spätestens nach einmal Neuladen in der neuen Fassung landen; offline darf noch die alte erscheinen. Einzige Ausnahme von der Weiterleitung ist `london-sporttag/` (siehe unten).
- Startseite `index.html` und Haupt-`README.md` verlinken und beschreiben alle Spiele richtig.
- Altlasten weg: `london-sporttag/` (nur noch eine Weiterleitung) ohne Ersatz entfernen und die `claude/…`-Branches löschen, die schon vollständig in `main` gemergt sind (nicht deinen eigenen).
- Darüber hinaus darfst du aufräumen, was du für nötig hältst, solange alle Spiele weiter laufen. Begründe jede solche Änderung im Haupt-README unter „Aufräumen“.

Teil 2, Spiel: Sei kreativ: Idee, Genre, Umfang, Technik und Stil wählst du selbst. Das Spiel soll alle vier Punkte erfüllen: Langzeitmotivation, Spielgefühl (Rückmeldung durch Animation, Sound und Wucht), spannende Entscheidungen sowie Welt und Atmosphäre (eine Geschichte, ein Ort, in den man eintaucht). Ob du dafür ein neues Spiel baust oder eins der drei ausbaust, entscheidest du; begründe die Wahl im README des Spiels.
Beginne mit einer Recherche im Web: Was macht Spiele in diesen vier Punkten reizvoll? Zum Beispiel Game-Design-Artikel, Vorträge, Analysen erfolgreicher Spiele. Nutze die Ergebnisse als Anregung, nicht als Vorgabe. Ist die Websuche nicht verfügbar, stütze dich auf dein Wissen über Game Design, nenne die Grundlagen (Bücher, Vorträge, Spiele) ohne Link und vermerke im README, dass nicht live recherchiert wurde.

Grenzen: Beim Aufräumen darfst du im ganzen Repo umbauen, solange alle Spiele weiter laufen. Leg das neue Spiel in einem eigenen neuen Ordner an. Baust du ein altes Spiel aus, arbeite in einer Kopie in diesem neuen Ordner, damit das Original spielbar bleibt. Was ein Spiel zum Bauen und Testen braucht (z. B. `package.json`), liegt in dessen Ordner; installierte Pakete wie `node_modules` committest du nicht. Nutze git, committe nach jedem funktionierenden Schritt, Aufräumen und Spiel in getrennten Commits, und pushe auf deinen Arbeits-Branch; den Merge nach `main` mache ich selbst. Spiel und READMEs auf Deutsch.

Woran du gemessen wirst, steht im /goal.
