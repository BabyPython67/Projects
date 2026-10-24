"""Textdarstellung des Spielstands – ein Querschnitt durch den Deich."""
from __future__ import annotations

from typing import Dict, List

from .engine import LOST, WON, Game, _liste

UNICODE: Dict[str, str] = dict(
    block="██", water="~", heart="♥", heart_off="♡", vbar="│", corner="└", hbar="─",
    marker="▼", arrow="»", dot="●", dot_off="○", keeper="@", bar="─",
)
ASCII: Dict[str, str] = dict(
    block="##", water="~", heart="*", heart_off=".", vbar="|", corner="+", hbar="-",
    marker="v", arrow=">", dot="o", dot_off=".", keeper="@", bar="-",
)

HELP = (" [a]/[←] links   [d]/[→] rechts   [s]/[Leertaste] Sandsack   "
        "[w]/[Enter] Stunde abwarten   [n] neues Spiel   [q] beenden")


def supports_unicode(stream) -> bool:
    encoding = getattr(stream, "encoding", None) or "utf-8"
    try:
        "".join(UNICODE.values()).encode(encoding)
    except (UnicodeEncodeError, LookupError):
        return False
    return True


def render(game: Game, ascii_only: bool = False) -> str:
    """Der komplette Bildschirm als Text, Zeilen mit '\\n' getrennt."""
    g = ASCII if ascii_only else UNICODE
    c = game.config
    lines: List[str] = []

    hearts = g["heart"] * game.houses + g["heart_off"] * (c.houses - game.houses)
    lines.append(f" DEICHGRAF   Nacht {game.night}/{c.nights}   Stunde {game.hour}/{c.hours}   "
                 f"Punkte {game.score}   Häuser {hearts}")
    lines.append(" " + g["bar"] * 78)

    curve = " ".join(f"[{p}]" if i == game.hour - 1 else str(p) for i, p in enumerate(game.tide))
    lines.append(f" Flutkurve: {curve}   (Pegel am Ende jeder Stunde)      Pegel jetzt: {game.pegel}")
    lines.append(f" Brecher am Stundenende: Abschnitt {_liste(game.next_waves)}")
    dots = g["dot"] * game.actions_left + g["dot_off"] * (c.actions - game.actions_left)
    lines.append(f" Aktionen übrig: {dots} ({game.actions_left})")
    lines.append("")

    for r in range(c.max_height + 1, 0, -1):
        label = f"{r:2d}" if r <= c.max_height else "  "
        mark = g["arrow"] if r == game.next_pegel else " "
        sep = g["water"] if r <= game.pegel else " "
        row = label + mark + g["vbar"]
        for i, h in enumerate(game.heights):
            row += sep
            if r <= h:
                row += g["block"]
            elif r == h + 1 and i == game.pos:
                row += g["keeper"] + sep
            else:
                row += sep * 2
        row += sep
        lines.append(row)
    lines.append("   " + g["corner"] + g["hbar"] * (3 * c.length + 1))
    lines.append("    " + "".join(f" {i + 1:<2}" for i in range(c.length)))
    lines.append("    " + "".join(" " + g["marker"] * 2 if i in game.next_waves else "   "
                                  for i in range(c.length)) + "   Brecher")
    lines.append("")

    for text in game.events[-4:]:
        lines.append(" · " + text)
    lines.append("")

    if game.phase == WON:
        lines.append(f" *** SIEG! Die Sturmwoche ist überstanden – {game.score} Punkte. ***")
        lines.append(" [n] neues Spiel   [q] beenden")
    elif game.phase == LOST:
        lines.append(f" *** VERLOREN. Das Dorf ist überflutet – {game.score} Punkte in Nacht {game.night}. ***")
        lines.append(" [n] neues Spiel   [q] beenden")
    else:
        lines.append(HELP)
    return "\n".join(lines) + "\n"
