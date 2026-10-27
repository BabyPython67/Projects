"""Terminal-Ein- und -Ausgabe für DEICHGRAF.

Im Terminal wird jede Taste sofort verarbeitet (Unix: termios, Windows:
msvcrt). Ist die Eingabe keine Konsole – etwa im Smoke-Test – werden Zeilen
gelesen, jedes Zeichen zählt als Taste, eine Leerzeile bedeutet "abwarten".
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from typing import Iterator, List, Optional

from .bot import choose
from .engine import BUILD, LEFT, NEW, RIGHT, WAIT, Game
from .render import render, supports_unicode

QUIT = "q"
KEYMAP = {" ": BUILD, "\r": WAIT, "\n": WAIT, "\x03": QUIT, "\x04": QUIT, "\x1a": QUIT}
ARROWS = {"\x1b[D": LEFT, "\x1b[C": RIGHT, "\x1b[A": BUILD, "\x1b[B": WAIT,
          "\x1bOD": LEFT, "\x1bOC": RIGHT, "\x1bOA": BUILD, "\x1bOB": WAIT}
WIN_ARROWS = {"K": LEFT, "M": RIGHT, "H": BUILD, "P": WAIT}


def normalize(ch: str) -> str:
    return KEYMAP.get(ch, ch.lower())


class LineKeys:
    """Zeilenweise Eingabe (Pipe, Datei, Terminal ohne Rohmodus)."""

    def __init__(self, stream, prompt: str = ""):
        self.stream = stream
        self.prompt = prompt
        self.buffer: List[str] = []

    def next_key(self) -> Optional[str]:
        while not self.buffer:
            if self.prompt:
                sys.stdout.write(self.prompt)
                sys.stdout.flush()
            line = self.stream.readline()
            if not line:
                return None
            line = line.rstrip("\r\n")
            self.buffer = [normalize(ch) for ch in line] if line else [WAIT]
        return self.buffer.pop(0)

    def close(self) -> None:
        pass


class UnixKeys:
    """Einzelne Tasten ohne Enter (termios-Rohmodus)."""

    def __init__(self):
        import termios
        import tty
        self.termios = termios
        self.fd = sys.stdin.fileno()
        self.old = termios.tcgetattr(self.fd)
        tty.setcbreak(self.fd)

    def next_key(self) -> Optional[str]:
        import select
        data = os.read(self.fd, 1)
        if not data:
            return None
        ch = data.decode("utf-8", "ignore")
        if ch == "\x1b":
            seq = ch
            while len(seq) < 3 and select.select([self.fd], [], [], 0.05)[0]:
                seq += os.read(self.fd, 1).decode("utf-8", "ignore")
            return ARROWS.get(seq, "")
        return normalize(ch)

    def close(self) -> None:
        self.termios.tcsetattr(self.fd, self.termios.TCSADRAIN, self.old)


class WindowsKeys:
    def __init__(self):
        import msvcrt
        self.msvcrt = msvcrt

    def next_key(self) -> Optional[str]:
        ch = self.msvcrt.getwch()
        if ch in ("\x00", "\xe0"):
            return WIN_ARROWS.get(self.msvcrt.getwch(), "")
        return normalize(ch)

    def close(self) -> None:
        pass


class BotKeys:
    """Der Autopilot spielt; `rounds` Partien, dann Schluss."""

    def __init__(self, game: Game, delay: float, rounds: int):
        self.game, self.delay, self.rounds = game, delay, rounds

    def next_key(self) -> Optional[str]:
        if self.delay:
            time.sleep(self.delay)
        if self.game.over:
            self.rounds -= 1
            return NEW if self.rounds > 0 else None
        return choose(self.game)

    def close(self) -> None:
        pass


def open_keys(game: Game, args) -> object:
    if args.autoplay:
        return BotKeys(game, args.delay, args.rounds)
    if sys.stdin.isatty():
        try:
            return UnixKeys()
        except (ImportError, OSError, ValueError):
            pass
        try:
            return WindowsKeys()
        except ImportError:
            pass
        return LineKeys(sys.stdin, prompt=" Taste(n) + Enter: ")
    return LineKeys(sys.stdin)


def parse_args(argv=None):
    parser = argparse.ArgumentParser(prog="deichgraf", description="DEICHGRAF – halte den Deich durch die Sturmwoche.")
    parser.add_argument("--seed", type=int, default=None, help="Zufalls-Seed für eine wiederholbare Partie")
    parser.add_argument("--autoplay", action="store_true", help="der Autopilot spielt vor")
    parser.add_argument("--rounds", type=int, default=1, help="Partien im Autopilot (Standard: 1)")
    parser.add_argument("--delay", type=float, default=None, help="Pause pro Zug im Autopilot in Sekunden")
    parser.add_argument("--ascii", action="store_true", help="nur ASCII-Zeichen verwenden")
    args = parser.parse_args(argv)
    if args.delay is None:
        args.delay = 0.25 if sys.stdout.isatty() else 0.0
    return args


def main(argv=None) -> int:
    args = parse_args(argv)
    game = Game(seed=args.seed)
    ascii_only = args.ascii or not supports_unicode(sys.stdout)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")  # Umlaute dürfen nie zum Absturz führen
    clear = sys.stdout.isatty()
    if clear and sys.platform == "win32":
        os.system("")  # schaltet ANSI-Sequenzen in der Windows-Konsole frei
    keys = open_keys(game, args)
    try:
        while True:
            frame = render(game, ascii_only)
            sys.stdout.write(("\x1b[H\x1b[2J" if clear else "\n") + frame)
            sys.stdout.flush()
            key = keys.next_key()
            if key is None or key == QUIT:
                break
            game.step(key)
    except KeyboardInterrupt:
        pass
    finally:
        keys.close()
    sys.stdout.write("Bis zum nächsten Sturm!\n")
    return 0
