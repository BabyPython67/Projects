# Messung (automatisch erzeugt von tools/sim.mjs)

Datum: 2026-10-28 · 416 Bot-Partien bis 13 Punkte · Laufzeit 14.2 min auf 4 Kernen.
Jede Paarung spielt abwechselnd mit beiden Anfangsrechten; jede Partie hat einen eigenen Platz (Saat).

## (a) Können gegen Zufall

| Paarung | Partien | Siege A | Ø Punkte A : B | Ø Aufnahmen |
|---|---:|---:|---:|---:|
| Geübter Bot (Hand wie Madame Roux, volle Taktik) gegen Zufallsspieler | 30 | 30 (100 %) | 14.2 : 0.1 | 5.4 |
| Geübter Bot gegen identischen Bot (nur Zufall entscheidet) | 40 | 21 (53 %) | 10.9 : 10.3 | 14.9 |
| Halbe Streuung (ruhigere Hand) gegen geübten Bot | 30 | 30 (100 %) | 13.7 : 3.0 | 10.5 |
| Doppelte Streuung gegen geübten Bot | 30 | 0 (0 %) | 2.4 : 13.5 | 8.9 |
| Vierfache Streuung gegen geübten Bot | 30 | 0 (0 %) | 0.4 : 13.9 | 6.0 |
| Volle Taktik gegen naive Taktik (nur halbhoch an die Sau, nie schießen) – gleiche Hand | 40 | 27 (68 %) | 12.0 : 9.7 | 15.5 |

## (b) Handgenauigkeit gegen die Dorfbewohner

Der menschliche Wurf streut nur durch das Timing beim Loslassen des pendelnden Punkts. Aus dem Pendelmodell des Spiels (src/game.js) ergibt sich für jede Timing-Genauigkeit eine gleichwertige Streuung (σ, Meter bei 8 m); ein Bot mit genau dieser Hand und voller Taktik spielt gegen jeden Dorfbewohner.

| Hand | σ Rollen / Halbhoch / Hoch / Schuss | Lucien | Opa Marcel | Zoé | Fernand | Madame Roux | Bernadette |
|---|---|---:|---:|---:|---:|---:|---:|
| Anfänger (±200 ms, nimmt den ersten guten Moment) | 0.14 / 0.20 / 0.24 / 0.15 | 100 % | 67 % | 83 % | 0 % | 8 % | 0 % |
| Geübt (±100 ms, wartet auf die Mitte) | 0.10 / 0.14 / 0.18 / 0.11 | 100 % | 100 % | 100 % | 58 % | 58 % | 0 % |
| Meisterhand (±40 ms, wartet auf die Mitte) | 0.05 / 0.07 / 0.09 / 0.06 | 100 % | 100 % | 100 % | 100 % | 100 % | 75 % |

(Werte = Siegquote des Bots mit dieser Hand, je 12 Partien.)

## (b) Wie selten sind die Kunststücke?

Gezählt in allen 416 Partien (beide Seiten):

| Kunststück | Vorkommen | pro Partie |
|---|---:|---:|
| plombee | 557 | 1.34 |
| kuss | 417 | 1.00 |
| carreau | 170 | 0.41 |
| sau-getroffen | 124 | 0.30 |
| doppelschlag | 92 | 0.22 |
| sau-aus | 40 | 0.10 |
| carreau-sur-place | 14 | 0.03 |

## (b) Wie verschieden sind die Plätze?

1500 zufällige Plätze: 126 verschiedene Kombinationen von Merkmalen. Anteil der Plätze mit …

- gefaelle: 72 %
- sand: 69 %
- mulde: 66 %
- grob: 58 %
- wurzel: 50 %
- pfad: 44 %
- buckel: 40 %
- eben: 0 %

Derselbe Wurf (halbhoch, Aufsetzpunkt 5,6 m geradeaus) endet auf 300 Plätzen mit einer Streuung von **4 cm quer und 54 cm längs** – ohne den Boden zu lesen, liegt man daneben.
