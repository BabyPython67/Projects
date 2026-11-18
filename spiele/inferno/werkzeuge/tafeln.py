#!/usr/bin/env python3
"""Erzeugt die Tafeln des Spiels: Gustave Dorés Stiche zu Dantes Inferno (1861),
gemeinfrei, aus Scans auf Wikimedia Commons (zwei restaurierte Reihen und die
deutsche Ausgabe „Dante Alighieri's Göttliche Komödie. Die Hölle“, Berlin: W. Moeser 1870).

Aufruf:  python3 werkzeuge/tafeln.py <ordner-mit-scans>
Die Scans liegen dort unter dem Dateinamen aus der Auswahl, geladen als Vorschau in
Standardgröße (1280 px breit) von upload.wikimedia.org. Die Auswahl, der Ausschnitt und die Unterschrift jeder
Tafel stehen in werkzeuge/tafeln-auswahl.json. Ergebnis: tafeln/*.jpg und daten/tafeln.js.

Bearbeitung je Tafel: Ausschnitt (nur der Stich, ohne Seitenrand und Bildlegende),
Graustufen, Tonwerte so gespreizt, dass das Papier weiß und die Tinte schwarz wird
(im Spiel wird das Bild mit „multiply“ auf das Papier gedruckt), dann höchstens
1300 Pixel auf der langen Seite (genug für die doppelte Anzeigegröße), JPEG progressiv.
"""
import json, os, sys
from PIL import Image, ImageOps, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
SPIEL = os.path.dirname(HIER)
LANG = 1300

def tonwerte(im, unten=0.6, oben=93.0):
    hist = im.histogram(); n = sum(hist)
    def perzentil(p):
        s = 0
        for i, c in enumerate(hist):
            s += c
            if s >= n * p / 100: return i
        return 255
    lo, hi = perzentil(unten), perzentil(oben)
    hi = max(hi, lo + 40)
    lut = [0 if i <= lo else 255 if i >= hi else round(((i - lo) / (hi - lo)) ** 0.92 * 255) for i in range(256)]
    return im.point(lut)

def lauf(werte, grenze):
    """Längster zusammenhängender Bereich, in dem werte < grenze."""
    best, start = (0, len(werte)), None
    laenge = 0
    for i, w in enumerate(list(werte) + [255]):
        if w < grenze and start is None: start = i
        if (w >= grenze or i == len(werte)) and start is not None:
            if i - start > laenge: laenge, best = i - start, (start, i)
            start = None
    return best

def automatisch(im):
    """Findet den Stich auf der Seite: den größten dunklen Block, ohne Rand und Legende."""
    g = ImageOps.grayscale(im).resize((im.width // 4, im.height // 4))
    w, h = g.size; px = g.load()
    zeilen = [sum(px[x, y] for x in range(w)) / w for y in range(h)]
    o, u = lauf(zeilen, 205)
    spalten = [sum(px[x, y] for y in range(o, u)) / max(1, u - o) for x in range(w)]
    l, r = lauf(spalten, 205)
    rand = 0.012
    bw, bh = (r - l) / w, (u - o) / h
    return [l / w + rand * bw, o / h + rand * bh, r / w - rand * bw, u / h - rand * bh]

def main():
    scans = sys.argv[1]
    auswahl = json.load(open(os.path.join(HIER, 'tafeln-auswahl.json'), encoding='utf-8'))
    os.makedirs(os.path.join(SPIEL, 'tafeln'), exist_ok=True)
    daten = {}
    for t in auswahl['tafeln']:
        pfad = os.path.join(scans, t['datei'])
        if not os.path.exists(pfad): pfad = os.path.join(scans, t['datei'].replace('H1870_', 'G1870_'))
        im = Image.open(pfad)
        w, h = im.size
        l, o, r, u = t['ausschnitt'] if t.get('ausschnitt') else automatisch(im)
        im = im.crop((round(l * w), round(o * h), round(r * w), round(u * h)))
        if t.get('drehen'): im = im.rotate(t['drehen'], expand=True)
        im = ImageOps.grayscale(im)
        im = tonwerte(im, *t.get('tonwerte', [0.6, 93.0]))
        f = min(1, LANG / max(im.size))
        if f < 1: im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im = im.filter(ImageFilter.GaussianBlur(0.3))
        datei = t['name'] + '.jpg'
        im.save(os.path.join(SPIEL, 'tafeln', datei), quality=t.get('qualitaet', 56), optimize=True, progressive=True)
        groesse = os.path.getsize(os.path.join(SPIEL, 'tafeln', datei))
        daten[t['name']] = {
            'datei': datei, 'w': im.width, 'h': im.height, 'gesang': t['gesang'], 'titel': t['titel'],
            'alt': t.get('alt', t['titel']), 'commons': t['datei_commons'], 'quelle': t['quelle'], 'lizenz': t.get('lizenz', 'gemeinfrei (Public Domain)'), 'original': t['original'], 'bytes': groesse,
        }
        for a in t.get('aliase', []): daten[a] = daten[t['name']]
        print(f"{datei:24} {im.width}x{im.height} {groesse // 1024} KB")
    kopf = ('// Erzeugt von werkzeuge/tafeln.py – nicht von Hand ändern.\n'
            '// Gustave Doré, Stiche zu Dantes Inferno (1861). Gemeinfrei, Scans von Wikimedia Commons.\n')
    with open(os.path.join(SPIEL, 'daten', 'tafeln.js'), 'w', encoding='utf-8') as f:
        f.write(kopf + 'export const TAFELN = ' + json.dumps(daten, ensure_ascii=False, indent=1) + ';\n')
    eigene = {d['datei']: d for d in daten.values()}
    print(len(eigene), 'Tafeln,', sum(d['bytes'] for d in eigene.values()) // 1024, 'KB')

if __name__ == '__main__':
    main()
