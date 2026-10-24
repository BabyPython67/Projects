"""Ein einfacher Autopilot für DEICHGRAF.

Er dient dem Smoke-Test, dem Vorführmodus (`--autoplay`) und als Maßstab für
die Schwierigkeit. Strategie: zuerst Abschnitte flicken, die am Stundenende
brechen würden, danach für den Höchstpegel der Nacht vorbauen, sonst den
niedrigsten Abschnitt erhöhen.
"""
from __future__ import annotations

from typing import List, Optional

from .engine import BUILD, LEFT, NEW, RIGHT, WAIT, Game


def _expected(game: Game) -> List[int]:
    """Höhen nach den Brechern dieser Stunde."""
    exp = list(game.heights)
    for i in game.next_waves:
        exp[i] = max(0, exp[i] - 1)
    return exp


def _nearest(game: Game, candidates: List[int]) -> Optional[int]:
    if not candidates:
        return None
    return min(candidates, key=lambda i: (abs(i - game.pos), i))


def choose(game: Game) -> str:
    """Nächste Taste für den aktuellen Spielstand."""
    if game.over:
        return NEW
    c = game.config
    exp = _expected(game)
    buildable = [i for i in range(c.length) if game.heights[i] < c.max_height]
    if not buildable:
        return WAIT

    # 1. Dringend: Abschnitte, die am Stundenende unter dem Pegel lägen.
    urgent = [i for i in buildable if exp[i] < game.next_pegel]
    reachable = [i for i in urgent
                 if abs(i - game.pos) + (game.next_pegel - exp[i]) <= game.actions_left]
    target = _nearest(game, reachable) or _nearest(game, urgent)

    # 2. Vorsorge: für den höchsten Pegel, der in dieser Nacht noch kommt.
    if target is None:
        peak_rest = max(game.tide[game.hour - 1:])
        target = _nearest(game, [i for i in buildable if exp[i] < peak_rest])

    # 3. Sonst: den niedrigsten Abschnitt erhöhen (nächstgelegener bei Gleichstand).
    if target is None:
        lowest = min(exp[i] for i in buildable)
        target = _nearest(game, [i for i in buildable if exp[i] == lowest])

    if target == game.pos:
        return BUILD
    return LEFT if target < game.pos else RIGHT


def play(game: Game, max_steps: int = 100000) -> List[str]:
    """Spielt eine Partie bis zum Ende und liefert die gedrückten Tasten."""
    keys: List[str] = []
    while not game.over and len(keys) < max_steps:
        key = choose(game)
        keys.append(key)
        game.step(key)
    return keys
