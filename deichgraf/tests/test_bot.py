"""Tests des Autopiloten – er dient auch als Maßstab für die Schwierigkeit."""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from deich.bot import choose, play  # noqa: E402
from deich.engine import BUILD, KEYS, LEFT, NEW, RIGHT, WAIT, WON, Config, Game  # noqa: E402

C = Config()


class TestBot(unittest.TestCase):
    def test_liefert_nur_gueltige_tasten(self):
        g = Game(seed=1)
        for _ in range(200):
            if g.over:
                break
            key = choose(g)
            self.assertIn(key, KEYS)
            g.step(key)

    def test_flickt_zuerst_die_gefaehrdete_stelle(self):
        g = Game(seed=1)
        g.heights = [C.max_height] * C.length
        ziel = g.pos + 2
        g.heights[ziel] = g.next_pegel - 1
        self.assertEqual(choose(g), RIGHT)
        g.step(RIGHT)
        g.step(RIGHT)
        self.assertEqual(choose(g), BUILD)

    def test_baut_auf_dem_niedrigsten_abschnitt_wenn_nichts_droht(self):
        g = Game(seed=1)
        g.heights = [C.max_height] * C.length
        g.heights[0] = C.max_height - 1
        g.pos = 1
        self.assertEqual(choose(g), LEFT)

    def test_wartet_wenn_nichts_mehr_zu_bauen_ist(self):
        g = Game(seed=1)
        g.heights = [C.max_height] * C.length
        self.assertEqual(choose(g), WAIT)

    def test_nach_spielende_neustart(self):
        g = Game(seed=1)
        g.heights = [0] * C.length
        for _ in range(C.houses):
            g.step(WAIT)
        self.assertEqual(choose(g), NEW)

    def test_spielt_eine_partie_zu_ende(self):
        g = Game(seed=3)
        keys = play(g)
        self.assertTrue(g.over)
        self.assertGreater(len(keys), C.hours)

    def test_schwierigkeit_ist_schaffbar_aber_nicht_trivial(self):
        siege, haeuser = 0, 0
        for seed in range(30):
            g = Game(seed=seed)
            play(g)
            siege += g.phase == WON
            haeuser += g.houses
        self.assertGreaterEqual(siege, 18, "zu schwer: der Autopilot gewinnt kaum noch")
        self.assertLess(haeuser, 30 * C.houses, "zu leicht: nie ein Haus verloren")


if __name__ == "__main__":
    unittest.main()
