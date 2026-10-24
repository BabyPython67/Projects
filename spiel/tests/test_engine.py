"""Tests der Spiellogik: Punkte, Sieg/Niederlage, Schwierigkeit, Neustart."""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from deich.engine import BUILD, LEFT, LOST, NEW, PLAYING, RIGHT, WAIT, WON, Config, Game  # noqa: E402

C = Config()


def sicher(game):
    """Alle Abschnitte auf Maximalhöhe – so hält der Deich jede Stunde."""
    game.heights = [C.max_height] * C.length


def sichere_stunde(game):
    sicher(game)
    return game.step(WAIT)


class TestStart(unittest.TestCase):
    def test_neues_spiel_beginnt_in_nacht_eins(self):
        g = Game(seed=1)
        self.assertEqual((g.night, g.hour, g.score, g.houses, g.phase), (1, 1, 0, C.houses, PLAYING))
        self.assertEqual(len(g.heights), C.length)
        self.assertTrue(all(C.start_min <= h <= C.start_max for h in g.heights))
        self.assertEqual(g.pos, C.length // 2)
        self.assertEqual(g.actions_left, C.actions)
        self.assertEqual(g.pegel, C.ebb)
        self.assertEqual(len(g.tide), C.hours)
        self.assertEqual(len(g.waves), C.hours)

    def test_gleicher_seed_gleiches_spiel(self):
        a, b = Game(seed=42), Game(seed=42)
        self.assertEqual((a.heights, a.tide, a.waves), (b.heights, b.tide, b.waves))
        for key in (BUILD, LEFT, WAIT, RIGHT, WAIT, WAIT):
            a.step(key)
            b.step(key)
        self.assertEqual((a.heights, a.score, a.houses, a.waves), (b.heights, b.score, b.houses, b.waves))


class TestAktionen(unittest.TestCase):
    def test_gehen_kostet_eine_aktion(self):
        g = Game(seed=2)
        g.step(RIGHT)
        self.assertEqual((g.pos, g.actions_left), (C.length // 2 + 1, C.actions - 1))
        g.step(LEFT)
        self.assertEqual((g.pos, g.actions_left), (C.length // 2, C.actions - 2))

    def test_deichende_kostet_nichts(self):
        g = Game(seed=2)
        g.pos = 0
        meldung = g.step(LEFT)
        self.assertEqual((g.pos, g.actions_left), (0, C.actions))
        self.assertIn("endet", " ".join(meldung))

    def test_sandsack_erhoeht_abschnitt(self):
        g = Game(seed=3)
        vorher = g.heights[g.pos]
        meldung = g.step(BUILD)
        self.assertEqual(g.heights[g.pos], vorher + 1)
        self.assertEqual(g.actions_left, C.actions - 1)
        self.assertIn("Sandsack", " ".join(meldung))

    def test_sandsack_nicht_ueber_maximalhoehe(self):
        g = Game(seed=3)
        g.heights[g.pos] = C.max_height
        g.step(BUILD)
        self.assertEqual(g.heights[g.pos], C.max_height)
        self.assertEqual(g.actions_left, C.actions)

    def test_stunde_endet_nach_letzter_aktion(self):
        g = Game(seed=4)
        sicher(g)
        g.heights[g.pos] = C.max_height - C.actions
        for _ in range(C.actions - 1):
            g.step(BUILD)
            self.assertEqual(g.hour, 1)
        g.step(BUILD)
        self.assertEqual((g.hour, g.actions_left), (2, C.actions))

    def test_warten_beendet_stunde_sofort(self):
        g = Game(seed=4)
        sicher(g)
        g.step(WAIT)
        self.assertEqual((g.hour, g.actions_left), (2, C.actions))

    def test_unbekannte_taste_tut_nichts(self):
        g = Game(seed=4)
        zustand = (g.pos, g.actions_left, list(g.heights), g.hour)
        self.assertEqual(g.step("x"), [])
        self.assertEqual(zustand, (g.pos, g.actions_left, list(g.heights), g.hour))


class TestStundenende(unittest.TestCase):
    def test_brecher_senken_getroffene_abschnitte(self):
        g = Game(seed=5)
        sicher(g)
        treffer = list(g.next_waves)
        self.assertTrue(treffer)
        g.step(WAIT)
        for i in range(C.length):
            self.assertEqual(g.heights[i], C.max_height - (1 if i in treffer else 0))

    def test_pegel_folgt_der_flutkurve(self):
        g = Game(seed=5)
        kurve = list(g.tide)
        for stunde in range(C.hours - 1):
            sichere_stunde(g)
            self.assertEqual(g.pegel, kurve[stunde])

    def test_gehaltene_stunde_bringt_pegel_mal_nacht(self):
        g = Game(seed=6)
        sichere_stunde(g)
        self.assertEqual(g.score, g.tide[0] * 1)
        sichere_stunde(g)
        self.assertEqual(g.score, (g.tide[0] + g.tide[1]) * 1)

    def test_deichbruch_kostet_genau_ein_haus_pro_stunde(self):
        g = Game(seed=6)
        g.heights = [0] * C.length
        meldung = g.step(WAIT)
        self.assertEqual(g.houses, C.houses - 1)
        self.assertEqual(g.score, 0)
        self.assertIn("DEICHBRUCH", " ".join(meldung))

    def test_defizit_beruecksichtigt_brecher(self):
        g = Game(seed=6)
        i = g.next_waves[0]
        g.heights[i] = g.next_pegel
        self.assertEqual(g.deficit(i), 1)
        j = next(k for k in range(C.length) if k not in g.next_waves)
        g.heights[j] = g.next_pegel
        self.assertEqual(g.deficit(j), 0)


class TestSiegUndNiederlage(unittest.TestCase):
    def test_ohne_haeuser_ist_das_spiel_verloren(self):
        g = Game(seed=7)
        g.heights = [0] * C.length
        for _ in range(C.houses - 1):
            g.step(WAIT)
            self.assertEqual(g.phase, PLAYING)
        meldung = g.step(WAIT)
        self.assertEqual((g.phase, g.houses), (LOST, 0))
        self.assertIn("Verloren", " ".join(meldung))

    def test_nach_niederlage_passiert_nichts_mehr(self):
        g = Game(seed=7)
        g.heights = [0] * C.length
        for _ in range(C.houses):
            g.step(WAIT)
        zustand = (g.night, g.hour, g.pos, g.score)
        for key in (BUILD, LEFT, RIGHT, WAIT):
            self.assertEqual(g.step(key), [])
        self.assertEqual(zustand, (g.night, g.hour, g.pos, g.score))

    def test_trockene_nacht_gibt_bonus(self):
        g = Game(seed=8)
        kurve = list(g.tide)
        for _ in range(C.hours):
            sichere_stunde(g)
        self.assertEqual(g.night, 2)
        self.assertEqual(g.score, sum(kurve) * 1 + C.bonus_dry_night * 1)

    def test_nacht_mit_bruch_gibt_keinen_bonus(self):
        g = Game(seed=8)
        kurve = list(g.tide)
        g.heights = [0] * C.length
        g.step(WAIT)                      # Stunde 1 bricht
        for _ in range(C.hours - 1):
            sichere_stunde(g)
        self.assertEqual(g.night, 2)
        self.assertEqual(g.score, sum(kurve[1:]) * 1)

    def test_sieg_nach_der_ganzen_sturmwoche(self):
        g = Game(seed=9)
        erwartet = 0
        while not g.over:
            nacht, kurve = g.night, list(g.tide)
            for _ in range(C.hours):
                sichere_stunde(g)
            erwartet += sum(kurve) * nacht + C.bonus_dry_night * nacht
        erwartet += C.bonus_house * C.houses
        self.assertEqual(g.phase, WON)
        self.assertEqual((g.night, g.houses), (C.nights, C.houses))
        self.assertEqual(g.score, erwartet)
        self.assertIn("überstanden", g.events[-1])
        self.assertEqual(g.step(WAIT), [])


class TestSchwierigkeit(unittest.TestCase):
    def test_hoechstpegel_steigt_jede_nacht(self):
        for n in range(1, C.nights):
            self.assertGreater(C.peak(n + 1), C.peak(n))
            self.assertGreater(max(C.tide(n + 1)), max(C.tide(n)))

    def test_flutkurve_steigt_und_faellt(self):
        kurve = C.tide(1)
        scheitel = kurve.index(max(kurve))
        self.assertEqual(kurve[:scheitel + 1], sorted(kurve[:scheitel + 1]))
        self.assertEqual(kurve[scheitel:], sorted(kurve[scheitel:], reverse=True))

    def test_brecher_werden_mehr(self):
        werte = [C.waves_per_hour(n) for n in range(1, C.nights + 1)]
        self.assertEqual(werte, sorted(werte))
        self.assertGreater(werte[-1], werte[0])
        self.assertLessEqual(werte[-1], C.length)

    def test_im_spiel_wird_jede_nacht_schwerer(self):
        g = Game(seed=10)
        pegel, brecher = [], []
        while not g.over:
            pegel.append(max(g.tide))
            brecher.append(len(g.next_waves))
            for _ in range(C.hours):
                sichere_stunde(g)
        self.assertEqual(len(pegel), C.nights)
        self.assertEqual(pegel, sorted(pegel))
        self.assertTrue(all(a < b for a, b in zip(pegel, pegel[1:])))
        self.assertGreater(brecher[-1], brecher[0])


class TestNeustart(unittest.TestCase):
    def test_neustart_mitten_im_spiel(self):
        g = Game(seed=11)
        g.step(RIGHT)
        for _ in range(C.hours + 1):
            sichere_stunde(g)
        self.assertEqual(g.night, 2)
        self.assertGreater(g.score, 0)
        meldung = g.step(NEW)
        self.assertEqual((g.night, g.hour, g.score, g.houses, g.phase), (1, 1, 0, C.houses, PLAYING))
        self.assertEqual((g.pos, g.actions_left, g.pegel), (C.length // 2, C.actions, C.ebb))
        self.assertTrue(all(C.start_min <= h <= C.start_max for h in g.heights))
        self.assertIn("neues Spiel", " ".join(meldung))

    def test_neustart_nach_niederlage_und_weiterspielen(self):
        g = Game(seed=12)
        g.heights = [0] * C.length
        for _ in range(C.houses):
            g.step(WAIT)
        self.assertEqual(g.phase, LOST)
        g.step(NEW)
        self.assertEqual((g.phase, g.houses, g.score), (PLAYING, C.houses, 0))
        vorher = g.heights[g.pos]
        g.step(BUILD)
        self.assertEqual(g.heights[g.pos], vorher + 1)

    def test_neustart_nach_sieg(self):
        g = Game(seed=13)
        while not g.over:
            sichere_stunde(g)
        self.assertEqual(g.phase, WON)
        g.step(NEW)
        self.assertEqual((g.phase, g.night, g.score), (PLAYING, 1, 0))


if __name__ == "__main__":
    unittest.main()
