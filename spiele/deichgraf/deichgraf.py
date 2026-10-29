#!/usr/bin/env python3
"""Startet DEICHGRAF:  python3 spiele/deichgraf/deichgraf.py"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from deich.ui import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main())
