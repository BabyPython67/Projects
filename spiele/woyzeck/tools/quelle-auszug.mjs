// Zieht aus den rohen zeno.org-Seiten (ISO-8859-1) den Werktext heraus, Szene für Szene, ohne ihn
// zu verändern. Kursives (Regieanweisungen bei Lehmann) steht als _…_, Liedzeilen beginnen mit „  “.
// Aufruf: node tools/quelle-auszug.mjs <ordner mit 01.html …> <zieldatei>
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [ordner, zieldatei] = process.argv.slice(2);
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', nbsp: " ", apos: "'" };
const entschluesseln = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&(\w+);/g, (m, n) => entities[n] ?? m);

const dateien = readdirSync(ordner).filter((d) => /^\d+\.html$/.test(d)).sort();
const teile = [];
for (const d of dateien) {
  const html = new TextDecoder("latin1").decode(readFileSync(join(ordner, d)));
  const haupt = html.split('<div class="zenoCOMain">')[1].split('<div class="zenoCOFooter">')[0];
  const titel = entschluesseln(haupt.match(/<h\d>(.*?)<\/h\d>/s)?.[1] ?? "[Vorbemerkung]").trim();
  const quelleSeite = html.match(/S\. (\d+(?:[–-]\d+)?)\.<\/div>/)?.[1] ?? "?";
  const zeilen = [];
  for (const m of haupt.matchAll(/<p( class="([^"]*)")?>(.*?)<\/p>/gs)) {
    const klasse = m[2] ?? "";
    let t = m[3]
      .replace(/<a [^>]*class="zenoTXKonk"[^>]*>.*?<\/a>\s*/gs, "")
      .replace(/<br\s*\/?>/g, " / ")
      .replace(/<\/?i>/g, "_")
      .replace(/<[^>]+>/g, "");
    t = entschluesseln(t).replace(/\s+/g, " ").trim().replace(/__/g, "");
    if (!t) continue;
    zeilen.push(klasse.startsWith("zenoPL") ? "  " + t : t);
  }
  teile.push(`=== ${titel} (Lehmann S. ${quelleSeite})\n${zeilen.join("\n")}\n`);
}
const kopf = "Georg Büchner: Woyzeck. Text nach: Georg Büchner, Sämtliche Werke und Briefe, hg. von Werner R. Lehmann,\n" +
  "Bd. 1, Hamburg/Reinbek 1967 (2. Aufl. München 1974), in der Fassung von zeno.org (Lizenz dort: gemeinfrei).\n" +
  "Abgerufen roh per curl von http://www.zeno.org/Literatur/M/Büchner,+Georg/Dramen/Woyzeck\n" +
  "Kursiv (Regieanweisungen) steht als _…_, Lied- und Verszeilen sind eingerückt. Sonst unverändert.\n\n";
writeFileSync(zieldatei, kopf + teile.join("\n"));
console.log(`${teile.length} Abschnitte, ${teile.join(" ").split(/\s+/).length} Wörter -> ${zieldatei}`);
