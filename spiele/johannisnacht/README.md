# Johannisnacht — ein Glühwürmchen-Spiel

Ein Spiel zum Zeitvertreib für Handy, Tablet und Desktop. Man fängt Glühwürmchen mit
einer Schlinge aus Licht, die man mit Finger oder Maus zieht, und lässt sie im
Morgengrauen wieder frei.

`index.html` ist eine eigenständige Datei ohne Build-Schritt — im Browser öffnen genügt.
Externe Abhängigkeiten: nur die Schriften von Google Fonts (Alegreya, Alegreya Sans).

## Regeln

| | |
|---|---|
| Schlinge ziehen | Wo sich der Strich selbst kreuzt oder zum Anfang zurückkehrt, schließt sich die Schlinge. Gefangen wird nur, wer in diesem Moment leuchtet (bis 0,62 s nach Beginn des Blitzes). |
| Punkte | 10 × Anzahl², also 1 → 10, 5 → 250, 10 → 1.000. Blitzen alle (mindestens drei) innerhalb von 0,12 s, zählt der Fang als Gleichtakt doppelt. |
| Nachahmerin | Orange, mit Ring, blinkt doppelt und hält keinen Takt. Leuchtet sie in der Schlinge, flieht der Fang, sie frisst bis zu drei aus dem Glas, und es gibt 100 Punkte Abzug. |
| Nacht | 2½ Minuten; der Mond wandert über den Himmel, die letzten 25 Sekunden dämmert es. Alle 38 Sekunden kommt eine weitere Nachahmerin dazu, bis zu drei (auf großen Bildschirmen vier). |
| Ruhige Nacht | Ohne Uhr und ohne Nachahmerin; über die Pause beenden. Zählt nicht für den Rekord. |

Die Schlinge ist ein fester Faden aus Licht (145 U, U = ein Hundertstel der kürzeren
Bildschirmseite): Zeichnet man weiter, verglimmt das Ende. Ohne abzusetzen lassen sich
mehrere Schlingen hintereinander ziehen.

Tasten: Esc oder P pausiert, M schaltet den Ton.

## Was dahintersteckt

**Gleichtakt.** Jedes Glühwürmchen hat eine innere Uhr mit leicht eigener Periode um
2,5 s. Blitzt eines, stellt es die Uhren aller Nachbarn im Umkreis von 16 U ein Stück
vor (Pulskopplung nach Mirollo und Strogatz, 1990); wer dabei über die Schwelle
geschoben wird, blitzt im selben Augenblick mit. Direkt nach einem Blitz ignoriert ein
Tier seine Nachbarn. So wachsen aus anfangs unabhängigen Funken Schwärme, die
gemeinsam aufleuchten — und genau auf die wartet man.

**Vorbilder.** Der J-förmige Aufwärtsbogen beim Blitz stammt von *Photinus pyralis*,
der Massen-Gleichtakt von *Photinus carolinus* aus den Great Smoky Mountains, die
Nachahmerin von *Photuris*-Weibchen, die fremde Blinkcodes imitieren, um Männchen zu
fressen. Die heimischen Johanniswürmchen leuchten dagegen gleichmäßig; das steht auch in
der Feldnotiz auf der Startseite.

**Schwarmbewegung.** Leichtes Umherirren, schwacher Zusammenhalt im Umkreis von 20 U,
Abstand 3 U untereinander und 7 U zur Nachahmerin, damit sich eine Lücke für die
Schlinge finden lässt. Die Nachahmerin jagt in Schüben auf das nächste Glühwürmchen zu.

**Darstellung.** Ein Canvas; Himmel und Landschaft werden bei jeder Größenänderung
einmal vorgerendert (Himmel und Land getrennt, damit die Dämmerung hinter den Bäumen
aufgehen kann). Punkte-Einblendungen und das Etikett am Glas sind HTML, weil Alegreya
auf dem Canvas nur Mediävalziffern zeichnet. Ton entsteht mit Web Audio: Glöckchen
in D-Dur-Pentatonik, ein Akkord für den Gleichtakt, Grillen um 4,5 kHz.

Rekord, Gesamtzahl der gefangenen Glühwürmchen und die Toneinstellung liegen im
`localStorage` des Browsers (`johannisnacht.v1`).
