"""Smoke-Test: startet das Spiel als eigenen Prozess und spielt komplette Partien.

1. Eine ganze Partie über die normale Tasteneingabe (stdin), danach Neustart
   mit [n] und Beenden mit [q] – genau wie ein Spieler es täte.
2. Der eingebaute Autopilot (`--autoplay`) spielt zwei Partien hintereinander.
"""
import os
import subprocess
import sys
import unittest

SPIEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, SPIEL)

from deich.bot import play  # noqa: E402
from deich.engine import WON, Config, Game  # noqa: E402

LAUNCHER = os.path.join(SPIEL, "deichgraf.py")
C = Config()


def starte(args, eingabe=None):
    return subprocess.run([sys.executable, LAUNCHER, *args], input=eingabe, text=True,
                          encoding="utf-8", capture_output=True, timeout=120)


class TestSmoke(unittest.TestCase):
    def test_komplette_partie_mit_neustart_ueber_die_tastatur(self):
        seed = 7
        vorlage = Game(seed=seed)
        tasten = play(vorlage)                      # Zugfolge des Autopiloten
        self.assertTrue(vorlage.over)
        ende = "SIEG" if vorlage.phase == WON else "VERLOREN"
        eingabe = "".join(tasten) + "\nn\ns\nq\n"   # Partie, Neustart, ein Sandsack, Ende

        lauf = starte(["--seed", str(seed)], eingabe)

        self.assertEqual(lauf.returncode, 0, lauf.stderr)
        self.assertNotIn("Traceback", lauf.stderr)
        text = lauf.stdout
        self.assertIn(f"Nacht 1/{C.nights}   Stunde 1/{C.hours}   Punkte 0", text)
        self.assertIn(ende, text)
        self.assertIn(f"{vorlage.score} Punkte", text)
        danach = text[text.index(ende):]
        self.assertIn(f"Nacht 1/{C.nights}   Stunde 1/{C.hours}   Punkte 0", danach)  # Neustart
        self.assertIn("Sandsack auf Abschnitt", danach)                              # weitergespielt
        self.assertTrue(text.rstrip().endswith("Bis zum nächsten Sturm!"))

    def test_autopilot_spielt_zwei_partien(self):
        lauf = starte(["--autoplay", "--seed", "11", "--rounds", "2", "--delay", "0"])
        self.assertEqual(lauf.returncode, 0, lauf.stderr)
        self.assertNotIn("Traceback", lauf.stderr)
        text = lauf.stdout
        self.assertEqual(text.count("*** SIEG") + text.count("*** VERLOREN"), 2)
        self.assertGreaterEqual(text.count(f"Nacht 1/{C.nights}   Stunde 1/{C.hours}   Punkte 0"), 2)

    def test_hilfe_und_ascii_modus(self):
        hilfe = starte(["--help"])
        self.assertEqual(hilfe.returncode, 0)
        self.assertIn("DEICHGRAF", hilfe.stdout)
        lauf = starte(["--ascii", "--seed", "1"], "s\n\nq\n")
        self.assertEqual(lauf.returncode, 0, lauf.stderr)
        self.assertIn("##", lauf.stdout)

    def test_readme_nennt_den_startbefehl(self):
        with open(os.path.join(SPIEL, "README.md"), encoding="utf-8") as f:
            readme = f.read()
        self.assertIn("python3 deichgraf/deichgraf.py", readme)
        self.assertTrue(os.path.exists(LAUNCHER))


if __name__ == "__main__":
    unittest.main()
