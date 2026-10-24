"""Tests der Terminal-Ein-/Ausgabe (ohne echtes Terminal)."""
import contextlib
import io
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from deich.engine import BUILD, LEFT, RIGHT, WAIT  # noqa: E402
from deich.ui import LineKeys, main, normalize, parse_args  # noqa: E402


class TestLineKeys(unittest.TestCase):
    def test_jedes_zeichen_ist_eine_taste(self):
        keys = LineKeys(io.StringIO("ad s\n"))
        self.assertEqual([keys.next_key() for _ in range(4)], [LEFT, RIGHT, BUILD, BUILD])

    def test_leerzeile_bedeutet_abwarten(self):
        keys = LineKeys(io.StringIO("\nA\n"))
        self.assertEqual(keys.next_key(), WAIT)
        self.assertEqual(keys.next_key(), LEFT)

    def test_dateiende_beendet(self):
        self.assertIsNone(LineKeys(io.StringIO("")).next_key())

    def test_enter_und_leertaste(self):
        self.assertEqual(normalize("\r"), WAIT)
        self.assertEqual(normalize(" "), BUILD)
        self.assertEqual(normalize("Q"), "q")


class TestMain(unittest.TestCase):
    def test_argumente(self):
        args = parse_args(["--seed", "5", "--autoplay", "--rounds", "2", "--ascii"])
        self.assertEqual((args.seed, args.autoplay, args.rounds, args.ascii), (5, True, 2, True))

    def test_autopilot_spielt_eine_partie_im_prozess(self):
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            code = main(["--autoplay", "--seed", "1", "--delay", "0"])
        self.assertEqual(code, 0)
        text = out.getvalue()
        self.assertIn("Nacht 1/", text)
        self.assertTrue("SIEG" in text or "VERLOREN" in text)
        self.assertIn("Bis zum nächsten Sturm!", text)

    def test_eingabe_q_beendet_sofort(self):
        out = io.StringIO()
        with contextlib.redirect_stdout(out), mock.patch("sys.stdin", io.StringIO("q\n")):
            code = main(["--seed", "1"])
        self.assertEqual(code, 0)
        self.assertEqual(out.getvalue().count("DEICHGRAF"), 1)


if __name__ == "__main__":
    unittest.main()
