// Logik-Tests: Skript, Spielstand, Speichern und Laden, Sicherungscode, Werk.
import test from 'node:test';
import assert from 'node:assert/strict';
import { zerlegeAbschnitt, zerlegeVersRef, pruefeWerk } from '../js/skript.js';
import * as Z from '../js/zustand.js';
import { pruefeAlles } from '../werkzeuge/pruefe.js';

const QUELLE = `@abschnitt a
titel: Test
start: eins

=== eins
gesang: 1
& seele x | Xaver | ein Test
& setze gesehen_eins
Erster Absatz.
{wenn frage} Nur nach der Frage.
[vers 1,1-3]
+ Fragen -> zwei {setzt frage} {einmal}
> Gehen -> b:
~ Ein Flüstern -> zwei @10,20

=== zwei
& plus mitleid 2
Zweiter.
-> eins

=== tx
art: text
Zeile eins.
`;
const B = `@abschnitt b
=== start
Ende.
-> @titel
`;
const werk = () => {
  const a = zerlegeAbschnitt(QUELLE, 'a.txt'), b = zerlegeAbschnitt(B, 'b.txt');
  return { abschnitte: { a, b }, liste: [a, b] };
};

test('Skript wird zerlegt', () => {
  const { abschnitte: { a } } = werk();
  assert.equal(a.titel, 'Test');
  const k = a.knoten.eins;
  assert.deepEqual(k.meta.gesang, [1]);
  assert.equal(k.teile.length, 3);
  assert.equal(k.teile[1].bed, 'frage');
  assert.deepEqual(k.wahlen[0], { art: 'rede', text: 'Fragen', ziel: 'zwei', setzt: ['frage'], einmal: true });
  assert.equal(k.wahlen[1].art, 'weg');
  assert.deepEqual([k.stimmen[0].x, k.stimmen[0].y], [10, 20]);
  assert.deepEqual(zerlegeVersRef('5,121-123; 5,127'), [{ g: 5, a: 121, b: 123 }, { g: 5, a: 127, b: 127 }]);
  assert.throws(() => zerlegeAbschnitt('@abschnitt z\n=== a\n+ ohne Ziel', 'z'), /Wahl ohne Ziel/);
});

test('Werkprüfung findet fehlende Ziele und Verse', () => {
  const { liste } = werk();
  assert.deepEqual(pruefeWerk(liste, [['v1', 'v2', 'v3']]), []);
  const kaputt = zerlegeAbschnitt('@abschnitt k\n=== a\n[vers 1,2-9]\n> x -> nirgends', 'k');
  const p = pruefeWerk([kaputt], [['v1', 'v2', 'v3']]);
  assert.ok(p.some(s => s.includes('Knoten fehlt')));
  assert.ok(p.some(s => s.includes('Vers außerhalb')));
});

test('Spielstand: betreten, Effekte einmal, Bedingungen, einmalige Wahlen', () => {
  const w = werk();
  const s = Z.neuerStand();
  const info = Z.betrete(s, w, 'a:', null);
  assert.equal(info.knoten.id, 'eins');
  assert.deepEqual(s.ort, { abschnitt: 'a', knoten: 'eins' });
  assert.equal(s.gesaenge[1], 1);
  assert.match(s.merk.seele.x, /Xaver/);
  assert.ok(Z.pruefeBedingung(s, 'gesehen_eins, !frage, gesehen:eins', 'a'));
  const k = w.abschnitte.a.knoten.eins;
  assert.equal(Z.sichtbareWahlen(s, 'a', k).length, 2);
  Z.waehle(s, 'a', k, k.wahlen[0]);
  assert.ok(s.flags.frage);
  assert.equal(Z.sichtbareWahlen(s, 'a', k).length, 1, 'einmalige Wahl verschwindet');
  Z.betrete(s, w, 'zwei'); Z.betrete(s, w, 'eins'); Z.betrete(s, w, 'zwei');
  assert.equal(s.zahlen.mitleid, 2, 'Effekte nur beim ersten Besuch');
  assert.equal(s.gesehen['a:zwei'], 2);
  assert.ok(Z.pruefeBedingung(s, 'mitleid>=2, mitleid<3, !mitleid>2', 'a'));
  assert.deepEqual(Z.betrete(s, w, '@titel'), { spezial: 'titel' });
});

test('Speichern und Laden: Rundreise und Reparatur', () => {
  const w = werk();
  const s = Z.neuerStand();
  Z.betrete(s, w, 'a:');
  s.getragen.ciacco = 'Ciacco';
  const geladen = Z.deserialisiere(Z.serialisiere(s));
  assert.deepEqual(geladen, s);
  const alt = Z.pruefeStand({ v: 1, ort: { abschnitt: 'a', knoten: 'eins' }, flags: [] });
  assert.deepEqual(alt.flags, {});
  assert.deepEqual(alt.merk, { seele: {}, prophezeiung: {}, suche: {} });
  assert.throws(() => Z.deserialisiere('{"v": 99}'), /Unbekannte Fassung/);
  assert.throws(() => Z.deserialisiere('kein json'));
});

test('Sicherungscode: erzeugen, lesen, Fehler erkennen', async () => {
  const w = werk();
  const s = Z.neuerStand();
  Z.betrete(s, w, 'a:'); Z.betrete(s, w, 'zwei');
  s.getragen.pier = 'Pier della Vigna';
  const code = await Z.erzeugeSicherungscode(s);
  assert.match(code, /^INF1-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
  assert.deepEqual(await Z.liesSicherungscode(code), s);
  const mitUmbruch = code.slice(0, 20) + '\n  ' + code.slice(20);
  assert.deepEqual(await Z.liesSicherungscode(mitUmbruch), s, 'Leerraum wird ignoriert');
  await assert.rejects(Z.liesSicherungscode(code.slice(0, -12) + code.slice(-11)), /unvollständig|beschädigt/);
  await assert.rejects(Z.liesSicherungscode('hallo'), /Sicherungscode/);
  const kaputt = code.replace(/-([0-9a-f]{8})$/, '-00000000');
  await assert.rejects(Z.liesSicherungscode(kaputt), /Prüfsumme/);
  // Ohne CompressionStream: unkomprimierter Code
  const CS = globalThis.CompressionStream;
  globalThis.CompressionStream = undefined;
  try {
    const roh = await Z.erzeugeSicherungscode(s);
    assert.match(roh, /^INF0-/);
    assert.deepEqual(await Z.liesSicherungscode(roh), s);
  } finally { globalThis.CompressionStream = CS; }
});

test('Das ganze Inferno ist schlüssig (Ziele, Verse, 34 Gesänge, Service Worker)', async () => {
  assert.deepEqual(await pruefeAlles(), []);
});
