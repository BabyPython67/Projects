# Werkzeuge für den Vergleich

> **Achtung, Spoiler:** `messen.js` und `ergebnisse.json` enthalten Namen von späteren
> Gegnern, Freischaltungen und Enden. Der Bericht selbst (`../BERICHT.md`) zeigt solche Dinge nur
> in zugeklappten Abschnitten.

| Datei | Inhalt |
|---|---|
| `messen.js` | spielt Rungholt und Moorlicht über ihre eigene Spiellogik durch (ohne Browser) und misst Länge, Entscheidungen, Abwechslung, Freischalt-Tempo und Textumfang |
| `ergebnisse.json` | Ausgabe von `messen.js` (500 Nächte je Spielstil, 100 simulierte Spieler je 60 Nächte) |
| `laufdaten.json` | Dauer, Runden und Tokens der beiden /goal-Läufe, aus den Sitzungsprotokollen ausgelesen |

Starten aus dem Repo-Hauptordner, braucht nur Node ab 18 und keine Pakete:

```
node vergleich/werkzeuge/messen.js            # 500 Nächte, 100 Spieler, etwa 12 Sekunden
node vergleich/werkzeuge/messen.js 100 20     # schneller Probelauf
```

Alle Zufallszahlen hängen an festen Startzahlen; derselbe Aufruf liefert dieselben Zahlen.
`messen.js` liest nur `spiele/rungholt/engine.js`, `spiele/moorlicht/js/engine.js` und `spiele/moorlicht/tests/bot.js`
und ändert an den Spielen nichts. Was gemessen wird und wie, steht im Bericht unter „Messungen“.
