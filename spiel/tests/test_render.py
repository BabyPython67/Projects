"""Tests der Textdarstellung."""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from deich.engine import WAIT, Config, Game  # noqa: E402
from deich.render import ASCII, UNICODE, render, supports_unicode  # noqa: E402

C = Config()


class TestRender(unittest.TestCase):
    def test_kopfzeile_zeigt_nacht_stunde_punkte_und_haeuser(self):
        g = Game(seed=1)
        text = render(g)
        self.assertIn(f"Nacht 1/{C.nights}", text)
        self.assertIn(f"Stunde 1/{C.hours}", text)
        self.assertIn("Punkte 0", text)
        self.assertIn(UNICODE["heart"] * C.houses, text)
        self.assertIn("[n] neues Spiel", text)

    def test_deichhoehen_und_deichgraf_sind_sichtbar(self):
        g = Game(seed=1)
        g.heights = [1] * C.length
        g.heights[g.pos] = 3
        zeilen = render(g).splitlines()
        reihe3 = next(z for z in zeilen if z.startswith(" 3"))
        reihe4 = next(z for z in zeilen if z.startswith(" 4"))
        self.assertEqual(reihe3.count(UNICODE["block"]), 1)
        self.assertIn(UNICODE["keeper"], reihe4)
        reihe1 = next(z for z in zeilen if z.startswith(" 1"))
        self.assertEqual(reihe1.count(UNICODE["block"]), C.length)
        self.assertIn(UNICODE["water"], reihe1)  # Ebbe-Pegel 1 steht als Wasser in den Lücken

    def test_ascii_modus_kommt_ohne_blockgrafik_aus(self):
        g = Game(seed=1)
        text = render(g, ascii_only=True)
        for glyph in ("block", "heart", "vbar", "marker", "dot"):
            self.assertNotIn(UNICODE[glyph], text)
            self.assertIn(ASCII[glyph], text)

    def test_endbildschirme(self):
        g = Game(seed=2)
        g.heights = [0] * C.length
        for _ in range(C.houses):
            g.step(WAIT)
        self.assertIn("VERLOREN", render(g))
        g = Game(seed=2)
        while not g.over:
            g.heights = [C.max_height] * C.length
            g.step(WAIT)
        self.assertIn("SIEG", render(g))

    def test_unicode_erkennung(self):
        class Strom:
            def __init__(self, enc):
                self.encoding = enc
        self.assertTrue(supports_unicode(Strom("utf-8")))
        self.assertFalse(supports_unicode(Strom("ascii")))


if __name__ == "__main__":
    unittest.main()
