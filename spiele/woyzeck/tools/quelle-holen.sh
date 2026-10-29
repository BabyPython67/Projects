#!/bin/sh
# Holt Büchners „Woyzeck“ roh von zeno.org (Text nach der Hamburger Ausgabe von W. R. Lehmann,
# dort als gemeinfrei gekennzeichnet) und schreibt den Auszug nach quelle/woyzeck-zeno.txt.
# Aufruf aus dem Ordner woyzeck:  sh tools/quelle-holen.sh [arbeitsordner]
set -eu
ziel="${1:-$(mktemp -d)}"
mkdir -p "$ziel"
basis="http://www.zeno.org/Literatur/M/B%C3%BCchner,+Georg/Dramen/Woyzeck"
curl -sSL -o "$ziel/index.html" "$basis"
grep -o -E 'href="/Literatur/M/B%C3%BCchner,\+Georg/Dramen/Woyzeck/[^"]*%5D"' "$ziel/index.html" \
  | sed -E 's/href="([^"]*)"/\1/' | awk '!s[$0]++' > "$ziel/links.txt"
n=0
while read -r pfad; do
  n=$((n + 1))
  curl -sSL -o "$ziel/$(printf '%02d' "$n").html" "http://www.zeno.org$pfad"
  sleep 0.4
done < "$ziel/links.txt"
node tools/quelle-auszug.mjs "$ziel" quelle/woyzeck-zeno.txt
