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

## Datenstand

Recherchestand 14.09.2026. Preise sind vor der Buchung zu verifizieren — insbesondere der
Schwimmpreis im London Aquatics Centre (keine offizielle Preistabelle mehr veröffentlicht)
und die Court-Tarife der Copper Box Arena (Richtwerte aus den Better-Standardpreisen).
Jede Karte führt ihre offenen Punkte selbst auf.
