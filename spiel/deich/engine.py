"""Spiellogik von DEICHGRAF.

Reine Logik ohne Ein- und Ausgabe. Alles Zufällige kommt aus einem seedbaren
Zufallsgenerator, damit Tests und Smoke-Test deterministisch ablaufen.

Ablauf einer Partie:
  * Die Sturmwoche hat `nights` Nächte zu je `hours` Stunden.
  * Pro Stunde hat der Deichgraf `actions` Aktionen: einen Abschnitt nach
    links oder rechts gehen oder einen Sandsack auf den Abschnitt legen, auf
    dem er steht.
  * Am Stundenende treffen Brecher (senken Abschnitte um 1) und der Pegel
    springt auf den Wert der Flutkurve. Jeder Abschnitt, der niedriger als der
    Pegel ist, bricht. Pro Stunde kostet das höchstens ein Haus.
  * Ohne Häuser ist das Spiel verloren, nach der letzten Nacht gewonnen.
"""
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import List, Optional

PLAYING = "läuft"
WON = "gewonnen"
LOST = "verloren"

LEFT, RIGHT, BUILD, WAIT, NEW = "a", "d", "s", "w", "n"
KEYS = (LEFT, RIGHT, BUILD, WAIT, NEW)


@dataclass(frozen=True)
class Config:
    length: int = 10        # Deichabschnitte
    nights: int = 7         # Nächte der Sturmwoche
    hours: int = 6          # Stunden pro Nacht
    actions: int = 5        # Aktionen pro Stunde
    houses: int = 3         # Häuser im Dorf ("Leben")
    max_height: int = 12    # höher lässt sich nicht stapeln
    start_min: int = 4      # Anfangshöhe der Abschnitte (von ... bis)
    start_max: int = 6
    ebb: int = 1            # Pegel bei Ebbe, zu Beginn jeder Nacht
    bonus_dry_night: int = 25   # mal Nachtnummer, wenn kein Abschnitt brach
    bonus_house: int = 100      # je gerettetem Haus beim Sieg

    def peak(self, night: int) -> int:
        """Höchstpegel einer Nacht – steigt jede Nacht um eins."""
        return 4 + night

    def tide(self, night: int) -> List[int]:
        """Pegel am Ende jeder Stunde: steigt bis zur Mitte der Nacht, fällt dann."""
        crest = self.hours // 2
        p = self.peak(night)
        return [max(self.ebb, p - abs(h - crest)) for h in range(self.hours)]

    def waves_per_hour(self, night: int) -> int:
        """Brecher pro Stunde – alle drei Nächte einer mehr, höchstens drei."""
        return min(3, 1 + (night - 1) // 3)


def _liste(nummern: List[int]) -> str:
    """[2, 5, 9] -> '3, 6 und 10' (Abschnitte werden ab 1 gezählt)."""
    namen = [str(i + 1) for i in nummern]
    if len(namen) <= 1:
        return "".join(namen)
    return ", ".join(namen[:-1]) + " und " + namen[-1]


class Game:
    """Zustand und Regeln einer Partie. `step(taste)` treibt das Spiel voran."""

    def __init__(self, seed: Optional[int] = None, config: Config = Config()):
        self.config = config
        self.rng = random.Random(seed)
        self.events: List[str] = []
        self._new: List[str] = []
        self.new_game()

    # ------------------------------------------------------------ Aufbau
    def new_game(self) -> None:
        """Neustart ohne Programmneustart: alles zurück auf Nacht 1."""
        c = self.config
        self.phase = PLAYING
        self.score = 0
        self.houses = c.houses
        self.night = 0
        self.heights = [self.rng.randint(c.start_min, c.start_max) for _ in range(c.length)]
        self.pos = c.length // 2
        self.events = []
        self._log("Ein neues Spiel beginnt. Halte den Deich die ganze Sturmwoche.")
        self._start_night()

    def _start_night(self) -> None:
        c = self.config
        self.night += 1
        self.hour = 1
        self.actions_left = c.actions
        self.pegel = c.ebb
        self.tide = c.tide(self.night)
        n = c.waves_per_hour(self.night)
        self.waves = [sorted(self.rng.sample(range(c.length), n)) for _ in range(c.hours)]
        self.dry_night = True
        self._log(f"Nacht {self.night} bricht an. Höchstpegel heute: {max(self.tide)}.")

    def _log(self, text: str) -> None:
        self.events.append(text)
        self._new.append(text)
        del self.events[:-50]

    # ---------------------------------------------------------- Abfragen
    @property
    def over(self) -> bool:
        return self.phase != PLAYING

    @property
    def next_pegel(self) -> int:
        """Pegel, der am Ende der laufenden Stunde erreicht wird."""
        return self.tide[self.hour - 1]

    @property
    def next_waves(self) -> List[int]:
        """Abschnitte (0-basiert), die am Ende der laufenden Stunde getroffen werden."""
        return self.waves[self.hour - 1]

    def deficit(self, index: int) -> int:
        """Wie viele Sandsäcke fehlen, damit der Abschnitt den nächsten Pegel hält."""
        expected = self.heights[index] - (1 if index in self.next_waves else 0)
        return max(0, self.next_pegel - expected)

    # ----------------------------------------------------------- Aktionen
    def step(self, key: str) -> List[str]:
        """Eine Taste verarbeiten. Gibt die neuen Ereignismeldungen zurück."""
        self._new = []
        if key == NEW:
            self.new_game()
            return self._new
        if self.over:
            return self._new
        if key == LEFT:
            self._move(-1)
        elif key == RIGHT:
            self._move(+1)
        elif key == BUILD:
            self._build()
        elif key == WAIT:
            self.actions_left = 0
            self._log("Du wartest das Ende der Stunde ab.")
        else:
            return self._new
        if self.actions_left <= 0:
            self._end_hour()
        return self._new

    def _move(self, delta: int) -> None:
        new = self.pos + delta
        if not 0 <= new < self.config.length:
            self._log("Hier endet der Deich.")
            return
        self.pos = new
        self.actions_left -= 1

    def _build(self) -> None:
        h = self.heights[self.pos]
        if h >= self.config.max_height:
            self._log(f"Abschnitt {self.pos + 1} ist schon {h} hoch – höher geht es nicht.")
            return
        self.heights[self.pos] = h + 1
        self.actions_left -= 1
        self._log(f"Sandsack auf Abschnitt {self.pos + 1}: jetzt {h + 1} hoch.")

    # ------------------------------------------------------- Stundenende
    def _end_hour(self) -> None:
        c = self.config
        for i in self.next_waves:
            if self.heights[i] > 0:
                self.heights[i] -= 1
                self._log(f"Brecher trifft Abschnitt {i + 1}: nur noch {self.heights[i]} hoch.")
        self.pegel = self.next_pegel
        self._log(f"Der Pegel steht jetzt bei {self.pegel}.")

        broken = [i for i, h in enumerate(self.heights) if h < self.pegel]
        if broken:
            self.houses -= 1
            self.dry_night = False
            self._log(f"DEICHBRUCH bei Abschnitt {_liste(broken)}! Ein Haus ist verloren "
                      f"({self.houses} übrig).")
            if self.houses <= 0:
                self.phase = LOST
                self._log(f"Das Dorf steht unter Wasser. Verloren in Nacht {self.night} "
                          f"mit {self.score} Punkten.")
                return
        else:
            gained = self.pegel * self.night
            self.score += gained
            self._log(f"Der Deich hält. +{gained} Punkte.")

        if self.hour < c.hours:
            self.hour += 1
            self.actions_left = c.actions
            return

        if self.dry_night:
            bonus = c.bonus_dry_night * self.night
            self.score += bonus
            self._log(f"Trockene Nacht! +{bonus} Punkte Bonus.")
        if self.night >= c.nights:
            bonus = c.bonus_house * self.houses
            self.score += bonus
            self.phase = WON
            self._log(f"Die Sturmwoche ist überstanden! +{bonus} Punkte für gerettete Häuser. "
                      f"Endstand: {self.score} Punkte.")
            return
        self._start_night()
