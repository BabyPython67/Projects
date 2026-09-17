# Olympia-Tag London — interaktive Karte

Zoombare Landkarte für die Planung eines Sport-Tagesausflugs nach London mit einem
Leistungskurs Sport (15 Personen, ab Eastbourne, Aktivitätsbudget ≤ 15 £/Person).

`index.html` ist eine eigenständige Datei ohne Build-Schritt — im Browser öffnen genügt.
Externe Abhängigkeiten: nur die Schriften von Google Fonts.

## Bedienung

| Aktion | Wirkung |
|---|---|
| Ziehen, Scrollen, Pinch | Karte bewegen und zoomen |
| Gebiet anklicken | zoomt hinein, das Gebiet zerfällt in seine einzelnen Angebote |
| Angebot anklicken | Karte öffnet sich mit Ort, Dauer, Kosten, Buchung, LK-Bezug, offenen Punkten |
| A / B / C | blendet eine Tagesvariante als Route samt Zeitleiste ein |
| Übersicht, +, −, Tasten 0 + − | Zoomsteuerung; Esc schließt Karte bzw. Variante |

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

## Rendering

Der transformierte Layer enthält ausschließlich Geometrie — Flüsse, Parks, Linien. Jede
Beschriftung, jeder Pin und jede Karte liegt in einem Overlay im Bildschirmkoordinaten-
system und wird pro Frame nur verschoben, nie skaliert. Zoomen kostet damit eine einzige
composited Transform plus rund 35 `translate3d`-Schreibvorgänge statt einer Neuberechnung
der Textlayouts; gemessener Median 16,7 ms pro Frame.

Das Zoomen läuft über eine exponentielle Glättung in einer rAF-Schleife: Mausrad und
Buttons setzen ein Ziel, der Punkt unter dem Cursor bleibt währenddessen fixiert. Ziehen
und Pinch greifen ohne Glättung direkt durch, damit sie 1:1 am Finger hängen. Der Wechsel
zwischen Übersicht und Detail hat eine Hysterese (rein ab 0,70, raus unter 0,60) und
blendet beide Ebenen per Opacity über, statt DOM neu zu bauen.

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
