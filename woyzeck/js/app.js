// Oberfläche: liest den Inhalt, zeigt die aktuelle Szene, nimmt Entscheidungen an, speichert nach jedem
// Schritt. Alles, was die Geschichte ausmacht, steckt in engine.js und inhalt/*.txt.
import { parseInhalt, parseRegister, auswerten, neuerStand, waehle, weiter, segmente, codeAus, standAus, bereinige } from "./engine.js";
import { DATEIEN, REGISTER } from "./inhalt-liste.js";
import * as sp from "./speicher.js";
import { bildSvg, vorbereiten, verblassen } from "./bilder.js";
import * as klang from "./klang.js";
import { VERSION } from "./version.js";

const $ = (id) => document.getElementById(id);
const lokal = (() => { try { return window.localStorage; } catch { return null; } })();
let inhalt = null, register = null, stand = null, einstellungen = sp.ladeEinstellungen(lokal);
let gerendert = 0, bereit = false, aktuelleSzene = null;

const NAMEN = { ANDRES: "Du", GROSSMUTTER: "Großmutter", ANDRE: "Andre" };
const sprecherName = (s) => NAMEN[s] ?? s.toLowerCase().replace(/(^|[\s.-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

// ---------------------------------------------------------------- Text in DOM

function fuelle(el, text) {
  for (const s of segmente(text)) {
    const teile = s.t.split("\n");
    teile.forEach((teil, i) => {
      if (i > 0) el.append(document.createElement("br"));
      if (!teil) return;
      let knoten = document.createTextNode(teil);
      if (s.i) { const em = document.createElement("em"); em.append(knoten); knoten = em; }
      if (s.b) { const b = document.createElement("span"); b.className = "b"; b.append(knoten); knoten = b; }
      el.append(knoten);
    });
  }
  return el;
}

function element(tag, klasse, text) {
  const el = document.createElement(tag);
  if (klasse) el.className = klasse;
  if (text !== undefined) fuelle(el, text);
  return el;
}

function blockElement(b, ziel) {
  switch (b.art) {
    case "erz": return element("p", "erz", b.text);
    case "rede": {
      const p = element("p", b.sprecher === "ANDRES" ? "rede du" : "rede");
      p.append(element("span", "sprecher", sprecherName(b.sprecher)));
      fuelle(p, b.text);
      return p;
    }
    case "lied": return element("p", "lied", b.text);
    case "innen": {
      const letzte = ziel.lastElementChild;
      const p = element("p", null, b.text);
      if (letzte?.classList.contains("innen") && letzte.dataset.stelle === b.stelle) { letzte.append(p); return null; }
      const div = element("div", "innen");
      div.dataset.stelle = b.stelle;
      div.append(p);
      return div;
    }
    case "gewaehlt": {
      if (b.text.startsWith("„")) {
        const p = element("p", "du-wahl rede du");
        p.append(element("span", "sprecher", "Du"));
        fuelle(p, /^„[^„“]*“$/.test(b.text) ? b.text.slice(1, -1) : b.text);
        return p;
      }
      return element("p", "erz du-tat", b.text);
    }
    case "bild": {
      const f = element("figure", "andeutung klein zeichnen");
      f.setAttribute("aria-hidden", "true");
      f.innerHTML = bildSvg(b.name);
      vorbereiten(f);
      return f;
    }
    case "ort": { const m = element("span", "ortmarke"); m.dataset.ort = b.name; return m; }
    case "pause": return element("hr", "pause");
  }
  return null;
}

function haengeAn(bloecke, ziel, { neu }) {
  let erstes = null;
  for (const b of bloecke) {
    const el = blockElement(b, ziel);
    if (!el) continue;
    if (neu && el.tagName !== "SPAN") el.classList.add("neu");
    ziel.append(el);
    erstes ??= el;
  }
  return erstes;
}

// ---------------------------------------------------------------- Lesen

function zeigeLesen() {
  $("start").hidden = true;
  $("lesen").hidden = false;
}

function speichern() {
  sp.speichereStand(lokal, stand);
  try { navigator.storage?.persist?.(); } catch { /* egal */ }
}

function renderSzene({ neu, position = 0 } = {}) {
  const a = auswerten(inhalt, stand);
  const sz = a.aktuell.szene;
  const text = $("text");
  if (neu || aktuelleSzene !== sz.id) {
    text.replaceChildren();
    gerendert = 0;
    aktuelleSzene = sz.id;
    $("szenenTitel").textContent = sz.titel;
    $("szenenZeit").textContent = sz.zeit ?? "";
    const bild = $("bild");
    bild.innerHTML = bildSvg(sz.bild);
    bild.dataset.deckkraft = "0.8";
    bild.style.opacity = "0.8";
    bild.classList.toggle("zeichnen", Boolean(neu));
    vorbereiten(bild);
    $("szenenZahl").textContent = `${a.aktuell.nummer} / ${a.aktuell.von}`;
    document.title = `Woyzeck – ${sz.titel}`;
  }
  const dazu = a.aktuell.bloecke.slice(gerendert);
  const erstes = haengeAn(dazu, text, { neu: gerendert > 0 });
  gerendert = a.aktuell.bloecke.length;
  zeigeWahl(a.aktuell.wahl);
  $("weiterBox").hidden = !(a.aktuell.ende && !a.aktuell.letzte);
  $("ende").hidden = !(a.aktuell.ende && a.aktuell.letzte);
  ortAktualisieren();
  if (neu) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      window.scrollTo(0, position > 0 ? Math.round(position * max) : 0);
      beimScrollen();
    }));
  }
  return erstes;
}

function zeigeWahl(wahl) {
  const box = $("wahl");
  box.replaceChildren();
  box.hidden = !wahl;
  if (!wahl) return;
  for (const o of wahl.optionen) {
    const b = element("button", null, o.text);
    b.dataset.key = o.key;
    b.addEventListener("click", () => entscheide(wahl.id, o.key), { once: true });
    box.append(b);
  }
}

function entscheide(wahlId, key) {
  try { stand = waehle(inhalt, stand, wahlId, key); } catch { return; }
  speichern();
  const erstes = renderSzene({});
  if (erstes) {
    const y = erstes.getBoundingClientRect().top + scrollY - innerHeight * 0.25;
    window.scrollTo({ top: Math.max(y, 0), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
}

function weiterlesen() {
  const n = weiter(inhalt, stand);
  if (!n) return;
  stand = n;
  speichern();
  sp.speicherePosition(lokal, stand.szene, 0);
  document.body.animate?.([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 700 });
  setTimeout(() => renderSzene({ neu: true }), 250);
}

// Ort für den Klang: die letzte Ortsmarke, die schon oben im Bild ist, sonst der Ort der Szene.
function ortAktualisieren() {
  if (!aktuelleSzene) return;
  let ort = inhalt.szenen[inhalt.index.get(aktuelleSzene)].ort;
  for (const m of document.querySelectorAll("#text .ortmarke")) if (m.getBoundingClientRect().top < innerHeight * 0.5) ort = m.dataset.ort;
  klang.ort(ort);
}

let scrollGeplant = false, positionsTimer = null;
function beimScrollen() {
  if (scrollGeplant) return;
  scrollGeplant = true;
  requestAnimationFrame(() => {
    scrollGeplant = false;
    verblassen(document.querySelectorAll("#szene .andeutung"));
    ortAktualisieren();
    clearTimeout(positionsTimer);
    positionsTimer = setTimeout(() => {
      if (!stand || $("lesen").hidden) return;
      const max = document.documentElement.scrollHeight - innerHeight;
      sp.speicherePosition(lokal, stand.szene, max > 0 ? scrollY / max : 0);
    }, 400);
  });
}

// ---------------------------------------------------------------- Menü, Zurückblättern, Sicherungscode

function oeffneMenu() {
  const a = auswerten(inhalt, stand);
  const liste = $("inhaltListe");
  liste.replaceChildren();
  a.szenen.forEach(({ szene, bloecke }, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.append(element("span", "nr", String(i + 1)), document.createTextNode(szene.titel));
    b.addEventListener("click", () => zeigeZurueck(szene, bloecke));
    li.append(b);
    liste.append(li);
  });
  $("codeAnzeige").textContent = codeAus(stand, register);
  $("codeMeldung").textContent = "";
  $("menu").showModal();
}

function zeigeZurueck(szene, bloecke) {
  $("menu").close();
  const ziel = $("zurueckText");
  ziel.replaceChildren(element("h2", "titel", szene.titel), element("p", "zeit", szene.zeit ?? ""));
  haengeAn(bloecke, ziel, { neu: false });
  $("zurueckTitel").textContent = "Zurückgeblättert";
  $("zurueck").hidden = false;
  $("zurueck").scrollTo(0, 0);
}

async function kopiereCode() {
  const code = $("codeAnzeige").textContent;
  try { await navigator.clipboard.writeText(code); toast("Code kopiert."); return; } catch { /* Fallback */ }
  const r = document.createRange();
  r.selectNodeContents($("codeAnzeige"));
  const sel = getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
  try { document.execCommand("copy"); toast("Code kopiert."); } catch { toast("Code markiert – jetzt kopieren."); }
}

function ladeCode() {
  const neu = bereinige(inhalt, standAus($("codeEingabe").value, register));
  if (!neu) { $("codeMeldung").textContent = "Der Code stimmt nicht. Prüf ihn Zeichen für Zeichen."; return; }
  if (!confirm("Stand aus dem Code übernehmen? Der bisherige Stand auf diesem Gerät wird ersetzt.")) return;
  stand = neu;
  speichern();
  $("codeEingabe").value = "";
  $("menu").close();
  zeigeLesen();
  renderSzene({ neu: true });
  toast("Stand wiederhergestellt.");
}

function vonVorn() {
  if (!confirm("Wirklich von vorn beginnen? Dein bisheriger Stand geht verloren (außer du hast den Code).")) return;
  sp.loescheStand(lokal);
  stand = neuerStand(inhalt);
  speichern();
  $("menu").open && $("menu").close();
  zeigeLesen();
  renderSzene({ neu: true });
}

let toastTimer = null;
function toast(text, knopf, aktion) {
  const t = $("toast");
  t.replaceChildren(document.createTextNode(text));
  if (knopf) { const b = document.createElement("button"); b.textContent = knopf; b.addEventListener("click", aktion); t.append(b); }
  t.hidden = false;
  clearTimeout(toastTimer);
  if (!knopf) toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

// ---------------------------------------------------------------- Einstellungen

function setzeSchalter(el, wert) { el.setAttribute("aria-checked", String(wert)); }

function wendeEinstellungenAn() {
  document.documentElement.style.setProperty("--schrift", String(einstellungen.schrift));
  document.body.classList.toggle("zeige-buechner", einstellungen.buechner);
  setzeSchalter($("klangStart"), einstellungen.klang);
  setzeSchalter($("klangSchalter"), einstellungen.klang);
  setzeSchalter($("buechnerSchalter"), einstellungen.buechner);
  $("klangKnopf").textContent = einstellungen.klang ? "Klang an" : "Klang aus";
  for (const b of $("schriftWahl").querySelectorAll("button")) b.setAttribute("aria-pressed", String(Number(b.dataset.schrift) === einstellungen.schrift));
}

function aendere(neu) {
  einstellungen = { ...einstellungen, ...neu };
  sp.speichereEinstellungen(lokal, einstellungen);
  wendeEinstellungenAn();
}

async function klangUmschalten() {
  const an = !einstellungen.klang;
  aendere({ klang: an });
  if (an) { if (!(await klang.einschalten())) { toast("Dieser Browser kann keinen Klang erzeugen."); aendere({ klang: false }); } else ortAktualisieren(); }
  else klang.ausschalten();
}

// ---------------------------------------------------------------- Installieren und Speichern dauerhaft machen

const istApp = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const istIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let installEreignis = null;

function installHinweis() {
  for (const id of ["installHinweis", "installHinweisMenu"]) {
    const box = $(id);
    box.replaceChildren();
    if (istApp()) {
      if (id === "installHinweisMenu") { box.append(element("p", null, "Du liest in der Home-Bildschirm-App. Hier bleibt dein Stand, auch wenn du wochenlang nicht liest.")); box.hidden = false; }
      else box.hidden = true;
      continue;
    }
    box.append(element("p", null, "_Damit dein Stand nicht verloren geht:_"));
    if (istIOS()) {
      box.append(element("p", null, "Tippe in Safari auf das Teilen-Symbol und dann auf „Zum Home-Bildschirm“. Safari löscht gespeicherte Daten von Seiten, die du sieben Tage lang nicht öffnest; die App auf dem Home-Bildschirm hat eigenen Speicher und ist davon nicht betroffen."));
      box.append(element("p", null, "Die App beginnt mit leerem Speicher. Nimm deinen Stand mit dem Sicherungscode mit (Menü → Code kopieren, dann in der App einfügen)."));
    } else {
      box.append(element("p", null, "Installiere das Spiel über das Browsermenü („App installieren“ oder „Zum Startbildschirm“). Den Stand sicherst du jederzeit mit dem Sicherungscode im Menü."));
    }
    if (installEreignis) {
      const b = element("button", "knopf", "Jetzt installieren");
      b.addEventListener("click", async () => { installEreignis.prompt(); installEreignis = null; installHinweis(); });
      box.append(b);
    }
    box.hidden = false;
  }
}

function serviceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  const hatteSteuerung = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((reg) => {
    const pruefen = () => reg.update().catch(() => {});
    document.addEventListener("visibilitychange", () => { if (!document.hidden) pruefen(); });
    setInterval(pruefen, 30 * 60 * 1000);
  }).catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hatteSteuerung) toast("Eine neue Fassung ist da. Dein Stand bleibt.", "Neu laden", () => location.reload());
  });
}

// ---------------------------------------------------------------- Start

async function ladeTexte() {
  const holen = async (pfad) => {
    const r = await fetch(pfad, { cache: "no-cache" });
    if (!r.ok) throw new Error(`${pfad}: ${r.status}`);
    return r.text();
  };
  const texte = await Promise.all(DATEIEN.map(holen));
  inhalt = parseInhalt(DATEIEN.map((name, i) => ({ name, text: texte[i] })));
  register = parseRegister(await holen(REGISTER));
}

async function starte() {
  wendeEinstellungenAn();
  $("versionAnzeige").textContent = `Fassung ${VERSION}`;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEreignis = e; installHinweis(); });
  installHinweis();
  serviceWorker();
  try { await ladeTexte(); }
  catch (e) { $("startMeldung").textContent = "Der Text konnte nicht geladen werden. Bitte mit Netz noch einmal öffnen."; console.error(e); return; }

  const gespeichert = sp.ladeStand(lokal, inhalt);
  if (gespeichert) {
    stand = gespeichert;
    const a = auswerten(inhalt, stand);
    const w = $("weiterlesen");
    w.hidden = false;
    w.textContent = `Weiterlesen: ${a.aktuell.szene.titel}`;
    w.classList.add("haupt");
    $("beginnen").textContent = "Von vorn beginnen";
    $("beginnen").classList.remove("haupt");
  }

  const losLesen = async (neu) => {
    if (neu && stand && !confirm("Wirklich von vorn beginnen? Dein bisheriger Stand geht verloren (außer du hast den Code).")) return;
    if (neu || !stand) { sp.loescheStand(lokal); stand = neuerStand(inhalt); speichern(); }
    if (einstellungen.klang) await klang.einschalten();
    zeigeLesen();
    renderSzene({ neu: true, position: neu ? 0 : sp.ladePosition(lokal, stand.szene) });
  };
  $("beginnen").addEventListener("click", () => losLesen(true));
  $("weiterlesen").addEventListener("click", () => losLesen(false));
  $("klangStart").addEventListener("click", () => aendere({ klang: !einstellungen.klang }));
  $("klangKnopf").addEventListener("click", klangUmschalten);
  $("klangSchalter").addEventListener("click", klangUmschalten);
  $("buechnerSchalter").addEventListener("click", () => aendere({ buechner: !einstellungen.buechner }));
  for (const b of $("schriftWahl").querySelectorAll("button")) b.addEventListener("click", () => aendere({ schrift: Number(b.dataset.schrift) }));
  $("weiter").addEventListener("click", weiterlesen);
  $("nochmal").addEventListener("click", vonVorn);
  $("vonVorn").addEventListener("click", vonVorn);
  $("menuKnopf").addEventListener("click", oeffneMenu);
  $("menuZu").addEventListener("click", () => $("menu").close());
  $("menu").addEventListener("click", (e) => { if (e.target === $("menu")) $("menu").close(); });
  $("codeKopieren").addEventListener("click", kopiereCode);
  $("codeLaden").addEventListener("click", ladeCode);
  $("zurueckZu").addEventListener("click", () => { $("zurueck").hidden = true; });
  addEventListener("scroll", beimScrollen, { passive: true });
  addEventListener("resize", beimScrollen);
  bereit = true;
}

// Für Tests und zur Fehlersuche.
window.woyzeck = {
  bereit: () => bereit,
  version: VERSION,
  stand: () => stand,
  code: () => (stand && register ? codeAus(stand, register) : null),
  szene: () => aktuelleSzene,
};

starte();
