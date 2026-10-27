# spiel/ – nur noch Weiterleitungen

Hier lagen früher [Deichgraf](../deichgraf/) (`spiel/`) und
[Brückenwärter](../brueckenwaerter/) (`spiel/brueckenwaerter/`). Beide haben jetzt eigene
Ordner. Dieser Ordner bleibt, damit alte Links und auf dem Home-Bildschirm abgelegte
Verknüpfungen weiter funktionieren:

| Alte Adresse | Leitet weiter nach |
|---|---|
| https://babypython67.github.io/Projects/spiel/ | https://babypython67.github.io/Projects/deichgraf/ |
| https://babypython67.github.io/Projects/spiel/brueckenwaerter/ | https://babypython67.github.io/Projects/brueckenwaerter/ |

Anhängsel wie `?seed=7` werden mitgenommen.

`spiel/brueckenwaerter/sw.js` ist ein Umzugs-Service-Worker: Der alte Brückenwärter lieferte
zuerst aus dem Offline-Speicher, deshalb sieht, wer ihn vom Home-Bildschirm öffnet, zunächst noch
die alte Fassung. Der Browser prüft bei jedem Öffnen, ob sich `sw.js` geändert hat, installiert dann
diese Datei, und die leert den alten Speicher, schickt die Seite zur neuen Adresse und meldet sich
ab. Mit Netz landet man so spätestens nach einmal Neuladen in der neuen Fassung
(`brueckenwaerter/tests/umzug.test.js` prüft das im Browser), ohne Netz bleibt bis dahin die alte
spielbar.
