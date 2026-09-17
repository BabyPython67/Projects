# Olympia-Tag London — interaktive Karte

Zoombare Landkarte für die Planung eines Sport-Tagesausflugs nach London mit einem
Leistungskurs Sport (15 Personen, ab Eastbourne, Aktivitätsbudget ≤ 15 £/Person).

`index.html` ist eine eigenständige Datei ohne Build-Schritt — im Browser öffnen genügt.
Externe Abhängigkeiten: nur die Schriften von Google Fonts.

## Bedienung

| Aktion | Wirkung |
|---|---|
| Ein Finger ziehen, Maus ziehen | Karte bewegen |
| Zwei Finger (Pinch) | zoomen und im selben Zug verschieben |
| Doppeltippen, Doppelklick | eine Stufe hinein (mit Alt hinaus) |
| Mausrad | zoomt auf den Cursor; darf während des Ziehens laufen |
| Gebiet antippen | zoomt hinein, das Gebiet zerfällt in seine einzelnen Angebote |
| Angebot antippen | Karte öffnet sich mit Ort, Dauer, Kosten, Buchung, LK-Bezug, offenen Punkten |
| A / B / C | blendet eine Tagesvariante als Route samt Zeitleiste ein |
| Übersicht, +, −, Tasten 0 + − | Zoomsteuerung; Pfeiltasten bewegen; Esc schließt Karte bzw. Variante |

Für die Präsentation vom Tablet aus ist der Pinch der Hauptweg: Finger spreizen und
gleichzeitig über das Glas schieben zoomt und bewegt die Karte in denselben Frames.
Der Punkt, den die Finger beim Aufsetzen greifen, bleibt unter ihnen — auch wenn ein
Finger mittendrin abhebt, läuft die Bewegung mit dem verbliebenen ohne Sprung weiter.

## Aufbau

Zwei Ebenen. Herausgezoomt zeigt die Karte drei Gebiete — Queen Elizabeth Olympic Park,
Royal Parks und die verstreuten weiteren Standorte. Hineingezoomt zerfallen sie in die
14 einzelnen Angebote, jedes mit einem Punkt an seiner tatsächlichen Lage und einem
versetzten Label.

Die Geografie ist echt (äquidistante Zylinderprojektion um 51,505° N / 0,105° W, Themse
und Parks als Polylinien und Flächen). Zwei bewusste Ausnahmen: Eastbourne sitzt als
Endpunkt der Bahnstrecke deutlich näher an London, als es der Wirklichkeit entspricht —
die Strecke ist als „nicht maßstäblich“ markiert; und die Labels sind gegen den Zoom
skaliert, damit sie auf jeder Zoomstufe lesbar bleiben.

Die drei Tagesvarianten sind keine Gebiete, sondern Routen über die Karte: A und C
spielen beide im Olympic Park und lassen sich geografisch nicht trennen.

## Orientierung

Die Karte trägt sechs feste Bezugssysteme, damit man nicht im Leeren steht:

- **Stadtkörper** — die bebaute Fläche des inneren London als geglättete Form, damit Stadt
  von Umland unterscheidbar ist
- **Stadtteilnamen** — 18 Viertel an ihrer echten Lage, sechs davon auf jeder Zoomstufe
- **Entfernungsringe** um London Victoria bei 2, 5 und 10 km Luftlinie, weil jede Fahrt dort beginnt
- **Maßstabsleiste**, die sich mit dem Zoom auf 1/2/5er-Schritte einrastet, plus Nordpfeil
- **Standortanzeige** in Worten: was die Bildschirmmitte gerade zeigt, plus Entfernung und
  Himmelsrichtung ab Victoria
- **Übersichtskarte** unten rechts mit dem aktuellen Ausschnitt als Rahmen; Klick springt zurück

Dazu Gewässer (Themse, Lea, Regent's Canal, Serpentine) und acht nachgezeichnete Parks.

## Rendering

Der transformierte Layer enthält ausschließlich Geometrie — Flüsse, Parks, Linien. Jede
Beschriftung, jeder Pin und jede Karte liegt in einem Overlay im Bildschirmkoordinaten-
system und wird pro Frame nur verschoben, nie skaliert. Zoomen kostet damit eine einzige
composited Transform plus rund 35 `translate3d`-Schreibvorgänge statt einer Neuberechnung
der Textlayouts; gemessener Median 16,7 ms pro Frame.

Zoom und Verschiebung sind eine einzige Kamera aus Maßstab und Versatz, kein Sonderfall
für den Zoom. Mausrad, Buttons und Tasten setzen ein Ziel, das in einer rAF-Schleife
exponentiell eingeholt wird; weil Maßstab und Versatz denselben Faktor benutzen, gilt
`tx(t) = sx − wx·z(t)` in jedem Zwischenschritt und der Punkt unter dem Cursor bleibt
ohne festgenagelten Anker fixiert. Genau deshalb bleibt der Versatz frei beschreibbar:
Ziehen addiert seinen Weg auf beide Seiten und greift damit 1:1 durch, ohne den
laufenden Zoom abzuwürgen. Der Pinch leitet Maßstab und Versatz in jedem Schritt aus
dem einen Weltpunkt ab, der beim Aufsetzen unter der Fingermitte lag — Spreizen und
Schieben wirken zusammen statt gegeneinander, und es sammelt sich keine Drift an
(gemessen 0,06 px Abweichung über einen Pinch auf das Doppelte).

Eingaben ändern nur den Zustand; geschrieben wird einmal pro Frame. Zwei Finger melden
zwei `pointermove` pro Frame, erzeugen aber einen DOM-Durchlauf statt zweier (gemessen
12 Transform-Schreibvorgänge für 12 Gesten-Schritte, Median 16,7 ms). Die Maße des
Viewports werden beim Gestenstart und bei Resize gelesen statt pro Frame, weil ein
`clientWidth` nach einem Transform-Schreibvorgang ein synchrones Layout erzwingt.

Der Wechsel zwischen Übersicht und Detail hat eine Hysterese (rein ab 0,70, raus unter
0,60) und blendet beide Ebenen per Opacity über, statt DOM neu zu bauen.

## Farben

Die Grundkarte ist absichtlich nahezu unbunt. Wasser und Parkflächen tragen nur eine
Spur Farbton, damit die drei Varianten-Farben die einzigen gesättigten Flächen auf dem
Schirm bleiben. Die Trias Blau/Grün/Orange ist gegen Farbfehlsichtigkeit geprüft
(CVD-ΔE ≥ 9,2 in beiden Modi); jede Farbe hat zusätzlich eine dunklere Textvariante,
damit Beschriftungen die 4,5:1-Schwelle halten.

## Datenstand

Recherchestand 14.09.2026. Preise sind vor der Buchung zu verifizieren — insbesondere der
Schwimmpreis im London Aquatics Centre (keine offizielle Preistabelle mehr veröffentlicht)
und die Court-Tarife der Copper Box Arena (Richtwerte aus den Better-Standardpreisen).
Jede Karte führt ihre offenen Punkte selbst auf.
