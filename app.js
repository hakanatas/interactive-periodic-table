/* İnteraktif Periyodik Tablo
   Altıgen karolar + faz animasyonları, sıcaklık ve keşif yılı kaydırıcıları,
   ısı haritaları, grup/periyot vurgusu, karşılaştırma, quiz, TR/EN, URL durumu.
   Bağımlılık yok. */

const { PI, sin, cos, random } = Math;
const TAU = 2 * PI;
const SVG_NS = "http://www.w3.org/2000/svg";

const range = (n) => Array.from({ length: n }, (_, i) => i);
const map = (v, sMin, sMax, dMin, dMax) => dMin + ((v - sMin) / (sMax - sMin)) * (dMax - dMin);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const polar = (ang, r) => [r * cos(ang), r * sin(ang)];
const pick = (arr) => arr[Math.floor(random() * arr.length)];

function svgEl(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (parent) parent.appendChild(el);
  return el;
}

/* ---------- i18n ---------- */
const L = {
  tr: {
    searchPh: "Ara: sembol, isim, numara…",
    modeCat: "Kategori", modePhase: "Faz", heatPh: "Isı haritası…",
    modeEn: "Elektronegatiflik", modeDensity: "Yoğunluk", modeIon: "İyonlaşma enerjisi",
    modeMass: "Atom kütlesi", modeRadius: "Atom yarıçapı", modeYear: "Keşif yılı",
    modeMelt: "Erime noktası", modeBoil: "Kaynama noktası",
    compare: "⚖ Karşılaştır", quiz: "🎯 Quiz",
    pN2: "Sıvı azot", pRoom: "Oda", pIron: "Demir erir", pSun: "Güneş yüzeyi",
    yearLabel: "Keşif yılı", yearAll: "Tümü", elements: "element",
    solid: "Katı", liquid: "Sıvı", gas: "Gaz", unknownP: "Bilinmiyor",
    phaseAt: "{t} K sıcaklıkta faz:",
    orbitals: "Orbital dolulukları", spectrum: "Emisyon spektrumu",
    massP: "Atom kütlesi", densityP: "Yoğunluk", meltP: "Erime noktası",
    boilP: "Kaynama noktası", enP: "Elektronegatiflik", ionP: "1. iyonlaşma E.",
    eaP: "Elektron ilgisi", radiusP: "Atom yarıçapı", oxP: "Oksidasyon basamakları",
    pgP: "Periyot / Grup", econfP: "Elektron dizilimi", shellsP: "Kabuklar",
    discP: "Keşfeden", yearP: "Keşif yılı", ancient: "Antik çağ",
    blockSuffix: "-bloku",
    compareHint: "Karşılaştırmak için tabloda iki elemente tıkla",
    quizFind: "🔍 Tabloda bul:",
    quizHigher: "Hangisinin değeri daha yüksek: {p}?",
    quizCorrect: "Doğru! 🎉", quizWrong: "Yanlış — doğru cevap: {a}",
    quizScore: "Quiz bitti! Skorun: {s}/10", quizAgain: "Tekrar oyna",
    quizProgress: "Soru {i}/10 · Skor {s}",
    isotopes: "🧭 İzotoplar",
    kicker: "⌂ Etkileşimli Bilim Levhaları",
    fig1: "Levha I", fig2: "Levha II", fig3: "Levha III", fig4: "Levha IV", fig5: "Levha V", fig6: "Levha VI", fig7: "Levha VII", fig8: "Levha VIII",
    tabPt: "Periyodik Tablo", tabNuc: "Nüklit Haritası", tabFx: "Fourier Makinesi", tabOrb: "Yörünge Kurucu", tabGalton: "Galton Tahtası", tabWave: "Dalga Laboratuvarı", tabHarm: "Harmonograf", tabDevre: "Devre Kurucu",
    caption1: "Levha I — Elementler · N = 118",
  },
  en: {
    searchPh: "Search: symbol, name, number…",
    modeCat: "Category", modePhase: "Phase", heatPh: "Heatmap…",
    modeEn: "Electronegativity", modeDensity: "Density", modeIon: "Ionization energy",
    modeMass: "Atomic mass", modeRadius: "Atomic radius", modeYear: "Year discovered",
    modeMelt: "Melting point", modeBoil: "Boiling point",
    compare: "⚖ Compare", quiz: "🎯 Quiz",
    pN2: "Liquid N₂", pRoom: "Room", pIron: "Iron melts", pSun: "Sun surface",
    yearLabel: "Discovery year", yearAll: "All", elements: "elements",
    solid: "Solid", liquid: "Liquid", gas: "Gas", unknownP: "Unknown",
    phaseAt: "Phase at {t} K:",
    orbitals: "Orbital filling", spectrum: "Emission spectrum",
    massP: "Atomic mass", densityP: "Density", meltP: "Melting point",
    boilP: "Boiling point", enP: "Electronegativity", ionP: "1st ionization E.",
    eaP: "Electron affinity", radiusP: "Atomic radius", oxP: "Oxidation states",
    pgP: "Period / Group", econfP: "Electron configuration", shellsP: "Shells",
    discP: "Discovered by", yearP: "Year discovered", ancient: "Ancient",
    blockSuffix: " block",
    compareHint: "Click two elements on the table to compare",
    quizFind: "🔍 Find on the table:",
    quizHigher: "Which one has the higher {p}?",
    quizCorrect: "Correct! 🎉", quizWrong: "Wrong — the answer was {a}",
    quizScore: "Quiz finished! Score: {s}/10", quizAgain: "Play again",
    quizProgress: "Question {i}/10 · Score {s}",
    isotopes: "🧭 Isotopes",
    kicker: "⌂ Interactive Science Plates",
    fig1: "Plate I", fig2: "Plate II", fig3: "Plate III", fig4: "Plate IV", fig5: "Plate V", fig6: "Plate VI", fig7: "Plate VII", fig8: "Plate VIII",
    tabPt: "Periodic Table", tabNuc: "Nuclide Map", tabFx: "Fourier Machine", tabOrb: "Orbit Builder", tabGalton: "Galton Board", tabWave: "Wave Lab", tabHarm: "Harmonograph", tabDevre: "Circuit Builder",
    caption1: "Plate I — Elements · N = 118",
  },
};
let lang = "tr";
const T = (key, vars = {}) =>
  (L[lang][key] || key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
const elName = (el) => (lang === "tr" ? el.tr : el.name);

/* ---------- altıgen geometrisi ---------- */
const hexPoints = range(6).map((i) => polar(map(i, 0, 6, 0, TAU) + PI / 2, 50));
const HEX_D = "M" + [...hexPoints, hexPoints[0]].map(([x, y]) => `L${x},${y}`).join("").slice(1);
document.getElementById("hexClipPath").setAttribute("d", HEX_D);

/* ---------- kategoriler ---------- */
const CATEGORY = {
  "diatomic nonmetal":     { color: "#2e6f8e", tr: "Diatomik ametal", en: "Diatomic nonmetal" },
  "polyatomic nonmetal":   { color: "#5e6b85", tr: "Poliatomik ametal", en: "Polyatomic nonmetal" },
  "noble gas":             { color: "#7d4bb5", tr: "Soy gaz", en: "Noble gas" },
  "alkali metal":          { color: "#b5432c", tr: "Alkali metal", en: "Alkali metal" },
  "alkaline earth metal":  { color: "#c77b3a", tr: "Toprak alkali metal", en: "Alkaline earth metal" },
  "metalloid":             { color: "#3f7d6d", tr: "Yarı metal", en: "Metalloid" },
  "post-transition metal": { color: "#6d8f2f", tr: "Geçiş sonrası metal", en: "Post-transition metal" },
  "transition metal":      { color: "#a8862d", tr: "Geçiş metali", en: "Transition metal" },
  "lanthanide":            { color: "#4f5da8", tr: "Lantanit", en: "Lanthanide" },
  "actinide":              { color: "#226577", tr: "Aktinit", en: "Actinide" },
  "unknown":               { color: "#8b8e96", tr: "Bilinmiyor", en: "Unknown" },
};
const catKey = (cat) => (CATEGORY[cat] ? cat : "unknown");
const catLabel = (cat) => CATEGORY[catKey(cat)][lang];

const PHASE_COLOR = { Solid: "#3f7d6d", Liquid: "#2e6f8e", Gas: "#7d4bb5" };
const PHASE_KEY = { Solid: "solid", Liquid: "liquid", Gas: "gas" };

/* ---------- ısı haritası renk skalası ---------- */
const HEAT_STOPS = ["#2e6f8e", "#3f7d6d", "#c2963a", "#b5432c"].map((h) => [
  parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16),
]);
function heatColor(t) {
  t = clamp01(t);
  const seg = Math.min(HEAT_STOPS.length - 2, Math.floor(t * (HEAT_STOPS.length - 1)));
  const f = t * (HEAT_STOPS.length - 1) - seg;
  const [a, b] = [HEAT_STOPS[seg], HEAT_STOPS[seg + 1]];
  const rgb = a.map((c, i) => Math.round(c + (b[i] - c) * f));
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

const MODES = {
  en:      { get: (e) => e.en },
  density: { get: (e) => e.density, log: true },
  ion:     { get: (e) => e.ion },
  mass:    { get: (e) => e.mass },
  radius:  { get: (e) => e.radius },
  year:    { get: (e) => (e.year == null ? null : Math.max(e.year, 1650)) },
  melt:    { get: (e) => e.melt },
  boil:    { get: (e) => e.boil },
};
for (const m of Object.values(MODES)) {
  const vals = ELEMENTS.map(m.get).filter((v) => v != null).map((v) => (m.log ? Math.log10(v) : v));
  m.min = Math.min(...vals);
  m.max = Math.max(...vals);
}
function modeColor(el, mode) {
  if (mode === "cat") return CATEGORY[catKey(el.cat)].color;
  if (mode === "phase") return PHASE_COLOR[phaseAt(el, state.temp)] || "#8b8e96";
  const m = MODES[mode];
  let v = m.get(el);
  if (v == null) return "#b9b4a4";
  if (m.log) v = Math.log10(v);
  return heatColor(map(v, m.min, m.max, 0, 1));
}

/* ---------- sıcaklığa göre faz ---------- */
function phaseAt(el, T) {
  if (el.melt == null && el.boil == null) return el.phase;
  if (el.boil != null && T >= el.boil) return "Gas";
  if (el.melt != null && T >= el.melt) return "Liquid";
  if (el.melt == null) return el.phase === "Gas" ? "Solid" : el.phase; // erime bilinmiyor (Cn, Og)
  return "Solid";
}

/* ---------- durum ---------- */
const state = {
  temp: 293,
  mode: "cat",
  search: "",
  offCats: new Set(),
  year: null,        // null = tümü
  compareMode: false,
  cmpSel: [],
  quiz: null,        // aktif quiz durumu
};

/* ---------- karo yerleşimi ----------
   Masaüstü: klasik 18 sütun × 10 satır.
   Mobil (dikey): tablo 90° çevrilir — periyotlar sütun, gruplar satır olur,
   böylece ekrana kaydırmasız sığar. */
const container = document.getElementById("container");
const mqMobile = window.matchMedia("(max-width: 760px)");
const GRID_D = { w: 95, h: 47.5 };  // masaüstü ızgara birimleri
const GRID_T = { w: 56, h: 84 };    // çevrilmiş (mobil) ızgara birimleri
const xvw = (el) => el.x * 4.8 + ((el.y + 1) % 2) * 2.5 - 2;
const yvw = (el) => el.y * 4.5 - 4;
const xvwT = (el) => el.y * 4.8 + ((el.x + 1) % 2) * 2.5 - 2;
const yvwT = (el) => el.x * 4.5 - 4;

class Tile {
  constructor(el) {
    this.data = el;
    this.root = document.createElement("div");
    this.root.className = "tile";

    this.svg = svgEl("svg", { viewBox: "0 0 100 100", class: "svg" });
    this.root.appendChild(this.svg);
    this.group = svgEl("g", { transform: "translate(50,50)" }, this.svg);
    this.border = svgEl("path", { d: HEX_D, fill: "none", "stroke-width": 1.5 }, this.group);

    this.visuals = {};
    this.phase = null;

    this.numberDiv = document.createElement("div");
    this.numberDiv.className = "element-number";
    this.numberDiv.textContent = el.n;
    this.nameDiv = document.createElement("div");
    this.nameDiv.className = "element-name";
    this.nameDiv.textContent = el.sym;
    this.massDiv = document.createElement("div");
    this.massDiv.className = "element-mass";
    this.massDiv.textContent = el.mass ? el.mass.toFixed(2) : "";
    this.root.append(this.numberDiv, this.nameDiv, this.massDiv);

    this.root.addEventListener("click", () => handleTileClick(this));
    this.root.addEventListener("mouseenter", (ev) => {
      showTooltip(el, ev);
      highlightGroupPeriod(el, true);
    });
    this.root.addEventListener("mousemove", moveTooltip);
    this.root.addEventListener("mouseleave", () => {
      hideTooltip();
      highlightGroupPeriod(el, false);
    });

    container.appendChild(this.root);
    this.setColor(CATEGORY[catKey(el.cat)].color);
    this.setPhase(phaseAt(el, state.temp));
  }

  buildVisual(phase) {
    const g = svgEl("g", {}, this.group);
    if (phase === "Solid") {
      this.solidRect = svgEl("rect", {
        x: -50, y: 18, width: 100, height: 60,
        style: "clip-path: url(#hexClip)",
      }, g);
    } else if (phase === "Liquid") {
      this.liquidA = svgEl("path", { d: "", style: "clip-path: url(#hexClip)" }, g);
      this.liquidB = svgEl("path", { d: "", style: "clip-path: url(#hexClip)" }, g);
    } else if (phase === "Gas") {
      this.atoms = range(5).map(() => {
        const c = svgEl("circle", { cx: 0, cy: 0, r: 4 }, g);
        c._seed1 = random() * TAU;
        c._seed2 = random() * TAU;
        return c;
      });
    }
    return g;
  }

  setPhase(phase) {
    if (phase === this.phase) return;
    if (this.phase && this.visuals[this.phase]) this.visuals[this.phase].style.display = "none";
    this.phase = phase;
    if (!this.visuals[phase]) this.visuals[phase] = this.buildVisual(phase);
    this.visuals[phase].style.display = "";
    this.paintVisual(phase);
  }

  setColor(color) {
    this.color = color;
    this.border.setAttribute("stroke", color + "88");
    this.nameDiv.style.color = color + "cc";
    this.numberDiv.style.color = color + "aa";
    this.massDiv.style.color = color + "aa";
    Object.keys(this.visuals).forEach((p) => this.paintVisual(p));
  }

  paintVisual(phase) {
    const c = this.color;
    if (phase === "Solid" && this.solidRect) this.solidRect.setAttribute("fill", c + "66");
    if (phase === "Liquid" && this.liquidA) {
      this.liquidA.setAttribute("fill", c + "66");
      this.liquidB.setAttribute("fill", c + "33");
    }
    if (phase === "Gas" && this.atoms) this.atoms.forEach((a) => a.setAttribute("fill", c + "88"));
  }

  update(t, path1, path2) {
    if (this.phase === "Liquid" && this.liquidA) {
      this.liquidA.setAttribute("d", path1);
      this.liquidB.setAttribute("d", path2);
    } else if (this.phase === "Gas" && this.atoms) {
      for (const a of this.atoms) {
        a.setAttribute("cx", 25 * sin(a._seed1 + t));
        a.setAttribute("cy", 25 * sin(a._seed2 + t));
      }
    }
  }
}

const tiles = ELEMENTS.map((el) => new Tile(el));
const tileByN = new Map(tiles.map((t) => [t.data.n, t]));

/* ---------- grup & periyot etiketleri ve vurgu ---------- */
const byGroup = new Map();
const byPeriod = new Map();
for (const el of ELEMENTS) {
  if (el.group) byGroup.set(el.group, [...(byGroup.get(el.group) || []), el.n]);
  if (el.period) byPeriod.set(el.period, [...(byPeriod.get(el.period) || []), el.n]);
}

const labels = [];
function addLabel(text, d, t) {
  const node = document.createElement("div");
  node.className = "grid-label";
  node.textContent = text;
  container.appendChild(node);
  labels.push({ node, d, t });
}
for (const [g, ns] of byGroup) {
  const top = ns.map((n) => tileByN.get(n).data).reduce((a, b) => (a.y < b.y ? a : b));
  if (top.y > 7) continue;
  addLabel(g, [xvw(top) + 2.5, yvw(top) - 1.3], [xvwT(top) - 1.4, yvwT(top) + 2.5]);
}
for (const [p, ns] of byPeriod) {
  const left = ns.map((n) => tileByN.get(n).data).filter((e) => e.y <= 7)
    .reduce((a, b) => (a.x < b.x ? a : b), { x: 99 });
  if (!left.n) continue;
  addLabel(p, [xvw(left) - 1.3, yvw(left) + 2.5], [xvwT(left) + 2.5, yvwT(left) - 1.3]);
}

/* yerleşimi uygula: masaüstünde klasik, mobilde çevrilmiş */
function layoutTiles() {
  const mobile = mqMobile.matches;
  container.classList.toggle("transposed", mobile);
  const g = mobile ? GRID_T : GRID_D;
  for (const tile of tiles) {
    const el = tile.data;
    tile.root.style.left = ((mobile ? xvwT(el) : xvw(el)) / g.w) * 100 + "%";
    tile.root.style.top = ((mobile ? yvwT(el) : yvw(el)) / g.h) * 100 + "%";
  }
  for (const lb of labels) {
    const [x, y] = mobile ? lb.t : lb.d;
    lb.node.style.left = (x / g.w) * 100 + "%";
    lb.node.style.top = (y / g.h) * 100 + "%";
  }
}
layoutTiles();
mqMobile.addEventListener("change", layoutTiles);

function highlightGroupPeriod(el, on) {
  const ns = new Set([...(byGroup.get(el.group) || []), ...(byPeriod.get(el.period) || [])]);
  ns.delete(el.n);
  for (const n of ns) tileByN.get(n).root.classList.toggle("hl", on);
}

/* ---------- animasyon döngüsü ---------- */
let step = 0;
function animate() {
  step = (step + 1) % 150;
  const t = map(step, 0, 150, 0, TAU);
  const mkCurve = (amp, off) =>
    range(11)
      .map((i) => {
        const x = map(i, 0, 10, -50, 50);
        const y = 10 + amp * sin(map(i, 0, 10, 0, TAU) + t + off);
        return `L${x},${y}`;
      })
      .join("");
  const base = "M50,10L50,50L-50,50L-50,10";
  const path1 = base + mkCurve(4, 0);
  const path2 = base + mkCurve(6, PI);
  for (const tile of tiles) tile.update(t, path1, path2);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* ---------- sıcaklık ---------- */
const tempSlider = document.getElementById("tempSlider");
const tempK = document.getElementById("tempK");
const tempC = document.getElementById("tempC");
const phaseCounts = document.getElementById("phaseCounts");

function applyTemperature(temp) {
  state.temp = temp;
  tempK.textContent = `${temp} K`;
  tempC.textContent = `${(temp - 273.15).toFixed(0)} °C`;
  const counts = { Solid: 0, Liquid: 0, Gas: 0 };
  for (const tile of tiles) {
    const p = phaseAt(tile.data, temp);
    counts[p]++;
    tile.setPhase(p);
    if (state.mode === "phase") tile.setColor(PHASE_COLOR[p] || "#8b8e96");
  }
  phaseCounts.innerHTML =
    `<span>${T("solid")} <b>${counts.Solid}</b></span>` +
    `<span>${T("liquid")} <b>${counts.Liquid}</b></span>` +
    `<span>${T("gas")} <b>${counts.Gas}</b></span>`;
  if (panelData) renderPanelPhase(panelData);
  syncURL();
}
tempSlider.addEventListener("input", () => applyTemperature(+tempSlider.value));
document.querySelectorAll(".temp-presets button").forEach((b) =>
  b.addEventListener("click", () => {
    tempSlider.value = b.dataset.t;
    applyTemperature(+b.dataset.t);
  })
);

/* ---------- keşif yılı zaman çizelgesi ---------- */
const yearSlider = document.getElementById("yearSlider");
const yearReadout = document.getElementById("yearReadout");

function applyYear(val) {
  state.year = val >= 2020 ? null : val;
  if (state.year == null) {
    yearReadout.textContent = T("yearAll");
  } else {
    const count = ELEMENTS.filter((e) => e.year != null && e.year <= state.year).length;
    yearReadout.textContent = `${state.year} · ${count} ${T("elements")}`;
  }
  applyFilters();
  syncURL();
}
yearSlider.addEventListener("input", () => applyYear(+yearSlider.value));

/* ---------- görünüm modu ---------- */
const modesEl = document.getElementById("modes");
const heatSelect = document.getElementById("heatSelect");

function setMode(mode) {
  state.mode = mode;
  const isHeat = !!MODES[mode];
  modesEl.querySelectorAll("button").forEach((b) =>
    b.classList.toggle("active", !isHeat && b.dataset.mode === mode)
  );
  heatSelect.classList.toggle("active", isHeat);
  heatSelect.value = isHeat ? mode : "";
  for (const tile of tiles) tile.setColor(modeColor(tile.data, mode));
  syncURL();
}
modesEl.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (btn) setMode(btn.dataset.mode);
});
heatSelect.addEventListener("change", () => {
  if (heatSelect.value) setMode(heatSelect.value);
});

/* ---------- lejant / kategori filtresi ---------- */
const legendEl = document.getElementById("legend");
function buildLegend() {
  legendEl.innerHTML = "";
  for (const [key, def] of Object.entries(CATEGORY)) {
    const chip = document.createElement("div");
    chip.className = "legend-chip" + (state.offCats.has(key) ? " off" : "");
    chip.innerHTML = `<span class="dot" style="background:${def.color}"></span>${def[lang]}`;
    chip.addEventListener("click", () => {
      if (state.offCats.has(key)) state.offCats.delete(key);
      else state.offCats.add(key);
      chip.classList.toggle("off", state.offCats.has(key));
      applyFilters();
    });
    legendEl.appendChild(chip);
  }
}
buildLegend();

/* ---------- arama + filtre ---------- */
const searchEl = document.getElementById("search");
searchEl.addEventListener("input", () => {
  state.search = searchEl.value.trim().toLocaleLowerCase("tr");
  applyFilters();
});

function matchesSearch(el, q) {
  if (!q) return true;
  return (
    el.sym.toLocaleLowerCase("tr").startsWith(q) ||
    el.name.toLocaleLowerCase("tr").includes(q) ||
    el.tr.toLocaleLowerCase("tr").includes(q) ||
    String(el.n) === q
  );
}

function applyFilters() {
  for (const tile of tiles) {
    const el = tile.data;
    const dim = state.offCats.has(catKey(el.cat)) || !matchesSearch(el, state.search);
    const undiscovered = state.year != null && (el.year == null || el.year > state.year);
    tile.root.classList.toggle("dim", dim && !undiscovered);
    tile.root.classList.toggle("undiscovered", undiscovered);
  }
}

/* ---------- ipucu (tooltip) ---------- */
const tooltip = document.getElementById("tooltip");
function showTooltip(el, ev) {
  if (state.quiz) return;
  const p = phaseAt(el, state.temp);
  tooltip.innerHTML =
    `<div class="tt-name" style="color:${modeColor(el, state.mode)}">${el.sym} · ${elName(el)}</div>` +
    `<div class="tt-row"><b>${el.n}</b>${el.mass ? " · " + el.mass.toFixed(3) + " u" : ""}</div>` +
    `<div class="tt-row">${catLabel(el.cat)}</div>` +
    `<div class="tt-row">${state.temp} K: <b>${T(PHASE_KEY[p] || "unknownP")}</b></div>`;
  tooltip.hidden = false;
  moveTooltip(ev);
}
function moveTooltip(ev) {
  const pad = 14;
  let x = ev.clientX + pad;
  let y = ev.clientY + pad;
  const r = tooltip.getBoundingClientRect();
  if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - pad;
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
}
function hideTooltip() {
  tooltip.hidden = true;
}

/* ---------- karo tıklama yönlendirmesi ---------- */
function handleTileClick(tile) {
  if (state.quiz) return quizTileAnswer(tile);
  if (state.compareMode) return compareSelect(tile);
  openPanel(tile.data);
}

/* ---------- detay paneli ---------- */
const panel = document.getElementById("panel");
const backdrop = document.getElementById("panelBackdrop");
let panelData = null;

const fmt = (v, unit = "", digits = null) =>
  v == null ? "—" : (digits != null ? (+v).toFixed(digits) : v) + (unit ? " " + unit : "");
const kelvin = (v) => (v == null ? "—" : `${v} K (${(v - 273.15).toFixed(0)} °C)`);

function openPanel(el) {
  panelData = el;
  hideTooltip();
  const color = CATEGORY[catKey(el.cat)].color;
  panel.style.setProperty("--el-color", color);

  const hex = document.getElementById("panelHex");
  hex.innerHTML = "";
  const g = svgEl("g", { transform: "translate(60,60)" }, hex);
  svgEl("path", { d: HEX_D, fill: color + "22", stroke: color, "stroke-width": 2 }, g);
  const st = svgEl("text", {
    "text-anchor": "middle", y: 10, fill: color,
    "font-size": 30, "font-family": "Merriweather, serif", "font-weight": 700,
  }, g);
  st.textContent = el.sym;
  const nt = svgEl("text", { "text-anchor": "middle", y: -22, fill: color + "aa", "font-size": 11 }, g);
  nt.textContent = el.n;

  document.getElementById("pName").textContent = elName(el);
  document.getElementById("pEn").textContent =
    `${lang === "tr" ? el.name : el.tr} · ${el.sym} · ${el.n}`;
  document.getElementById("pCat").textContent =
    catLabel(el.cat) + (el.block ? ` · ${el.block}${T("blockSuffix")}` : "");

  renderPanelPhase(el);

  const img = document.getElementById("pImg");
  img.classList.toggle("hidden", !el.img);
  if (el.img) {
    img.src = el.img;
    img.alt = elName(el);
    img.onerror = () => img.classList.add("hidden");
  }
  document.getElementById("pBlurb").textContent = lang === "tr" ? el.sumtr : el.sumen;

  renderBohr(el, color);
  renderOrbitals(el);

  const props = [
    [T("massP"), fmt(el.mass, "u", 3)],
    [T("densityP"), fmt(el.density, "g/cm³")],
    [T("meltP"), kelvin(el.melt)],
    [T("boilP"), kelvin(el.boil)],
    [T("enP"), fmt(el.en)],
    [T("ionP"), fmt(el.ion, "kJ/mol")],
    [T("eaP"), fmt(el.ea, "kJ/mol")],
    [T("radiusP"), fmt(el.radius, "pm")],
    [T("pgP"), `${el.period ?? "—"} / ${el.group ?? "—"}`],
    [T("yearP"), el.year === 0 ? T("ancient") : el.year ?? "—"],
    [T("oxP"), el.ox || "—", true],
    [T("econfP"), el.econf || "—", true],
    [T("shellsP"), el.shells ? el.shells.join(" · ") : "—", true],
    [T("discP"), el.disc || "—", true],
  ];
  document.getElementById("pProps").innerHTML = props
    .map(([k, v, wide]) => `<div${wide ? ' class="wide"' : ""}><dt>${k}</dt><dd>${v}</dd></div>`)
    .join("");

  const specFig = document.getElementById("specFig");
  specFig.hidden = !el.spec;
  if (el.spec) {
    const spec = document.getElementById("pSpec");
    spec.src = "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(el.spec);
    spec.onerror = () => (specFig.hidden = true);
  }

  document.getElementById("isoLink").href = "nuclides.html#el=" + el.sym;
  document.getElementById("wikiTr").href =
    "https://tr.wikipedia.org/wiki/" + encodeURIComponent(el.tr);
  document.getElementById("wikiEn").href =
    el.wiki || "https://en.wikipedia.org/wiki/" + encodeURIComponent(el.name);

  panel.hidden = false;
  backdrop.hidden = false;
  syncURL();
}

function renderPanelPhase(el) {
  const p = phaseAt(el, state.temp);
  const pc = PHASE_COLOR[p] || "#8d93ab";
  document.getElementById("pPhase").innerHTML =
    `${T("phaseAt", { t: state.temp })} <b style="color:${pc}">${T(PHASE_KEY[p] || "unknownP")}</b>`;
}

function renderBohr(el, color) {
  const bohr = document.getElementById("bohr");
  bohr.innerHTML = "";
  if (!el.shells || !el.shells.length) return;
  const cx = 160, cy = 160;
  const n = el.shells.length;
  const rMax = 148, rMin = 46;
  const stepR = n > 1 ? (rMax - rMin) / (n - 1) : 0;

  svgEl("circle", { cx, cy, r: 26, fill: color + "33", stroke: color, "stroke-width": 1.5 }, bohr);
  const nt = svgEl("text", {
    x: cx, y: cy + 7, "text-anchor": "middle", fill: color,
    "font-size": 20, "font-family": "Merriweather, serif", "font-weight": 700,
  }, bohr);
  nt.textContent = el.sym;

  el.shells.forEach((count, i) => {
    const r = n > 1 ? rMin + i * stepR : (rMin + rMax) / 2;
    svgEl("circle", { cx, cy, r, class: "bohr-ring" }, bohr);
    const g = svgEl("g", { class: "bohr-spin" + (i % 2 ? " rev" : "") }, bohr);
    g.style.setProperty("--dur", 7 + i * 4 + "s");
    range(count).forEach((j) => {
      const ang = map(j, 0, count, 0, TAU);
      svgEl("circle", { cx: cx + r * cos(ang), cy: cy + r * sin(ang), r: 4, fill: color }, g);
    });
  });
}

function renderOrbitals(el) {
  const cont = document.getElementById("orbitals");
  cont.innerHTML = "";
  if (!el.conf) return;
  const BOX_COUNT = { s: 1, p: 3, d: 5, f: 7, g: 9 };
  for (const tok of el.conf.split(" ")) {
    const m = tok.match(/^(\d+)([spdfg])(\d+)$/);
    if (!m) continue;
    const boxes = BOX_COUNT[m[2]];
    const cnt = +m[3];
    const arrows = Array(boxes).fill("");
    for (let i = 0; i < cnt; i++) arrows[i % boxes] += i < boxes ? "↑" : "↓";
    const sub = document.createElement("div");
    sub.className = "orb-sub";
    sub.innerHTML =
      `<span class="orb-lbl">${m[1]}${m[2]}</span>` +
      arrows.map((a) => `<span class="orb-box">${a}</span>`).join("");
    cont.appendChild(sub);
  }
}

function closePanel() {
  panel.hidden = true;
  backdrop.hidden = true;
  panelData = null;
  syncURL();
}
document.getElementById("panelClose").addEventListener("click", closePanel);
backdrop.addEventListener("click", closePanel);
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") {
    closePanel();
    if (state.compareMode) toggleCompare(false);
    if (state.quiz) endQuiz();
  }
});

/* ---------- karşılaştırma ---------- */
const compareBtn = document.getElementById("compareBtn");
const compareCard = document.getElementById("compareCard");
const compareHint = document.getElementById("compareHint");
const compareBody = document.getElementById("compareBody");

const CMP_PROPS = [
  { key: "mass", label: "massP", unit: "u" },
  { key: "density", label: "densityP", unit: "g/cm³" },
  { key: "melt", label: "meltP", unit: "K" },
  { key: "boil", label: "boilP", unit: "K" },
  { key: "en", label: "enP", unit: "" },
  { key: "ion", label: "ionP", unit: "kJ/mol" },
  { key: "radius", label: "radiusP", unit: "pm" },
];

function toggleCompare(on) {
  state.compareMode = on;
  compareBtn.classList.toggle("active", on);
  compareCard.hidden = !on;
  if (on) {
    if (state.quiz) endQuiz();
    closePanel();
    renderCompare();
  } else {
    for (const t of state.cmpSel) tileByN.get(t.n).root.classList.remove("cmp-sel");
    state.cmpSel = [];
  }
}
compareBtn.addEventListener("click", () => toggleCompare(!state.compareMode));
document.getElementById("compareClose").addEventListener("click", () => toggleCompare(false));

function compareSelect(tile) {
  const el = tile.data;
  const i = state.cmpSel.indexOf(el);
  if (i >= 0) {
    state.cmpSel.splice(i, 1);
    tile.root.classList.remove("cmp-sel");
  } else {
    if (state.cmpSel.length === 2) {
      tileByN.get(state.cmpSel.shift().n).root.classList.remove("cmp-sel");
    }
    state.cmpSel.push(el);
    tile.root.classList.add("cmp-sel");
  }
  renderCompare();
}

function renderCompare() {
  const [a, b] = state.cmpSel;
  compareHint.textContent = state.cmpSel.length < 2 ? T("compareHint") : "";
  if (!a || !b) {
    compareBody.innerHTML = a
      ? `<div class="compare-title"><span style="color:${CATEGORY[catKey(a.cat)].color}">${a.sym} · ${elName(a)}</span><span></span></div>`
      : "";
    return;
  }
  const ca = CATEGORY[catKey(a.cat)].color;
  const cb = CATEGORY[catKey(b.cat)].color;
  let html =
    `<div class="compare-title">` +
    `<span style="color:${ca}">${a.sym} · ${elName(a)}</span>` +
    `<span style="color:${cb}">${elName(b)} · ${b.sym}</span></div>`;
  for (const p of CMP_PROPS) {
    const va = a[p.key], vb = b[p.key];
    const mx = Math.max(va ?? 0, vb ?? 0) || 1;
    const wa = va == null ? 0 : (va / mx) * 100;
    const wb = vb == null ? 0 : (vb / mx) * 100;
    const short = (v) => (v == null ? "—" : +v.toPrecision(4) + (p.unit ? " " + p.unit : ""));
    html +=
      `<div class="cmp-row">` +
      `<div class="cmp-bar left"><div class="fill" style="width:${wa}%;background:${ca}aa"></div>` +
      `<span class="cmp-val">${short(va)}</span></div>` +
      `<div class="cmp-label">${T(p.label)}</div>` +
      `<div class="cmp-bar right"><div class="fill" style="width:${wb}%;background:${cb}aa"></div>` +
      `<span class="cmp-val">${short(vb)}</span></div></div>`;
  }
  compareBody.innerHTML = html;
}

/* ---------- quiz ---------- */
const quizBtn = document.getElementById("quizBtn");
const quizCard = document.getElementById("quizCard");
const quizProgress = document.getElementById("quizProgress");
const quizQuestion = document.getElementById("quizQuestion");
const quizAnswers = document.getElementById("quizAnswers");
const quizFeedback = document.getElementById("quizFeedback");

const DUEL_PROPS = [
  { key: "en", label: "enP" },
  { key: "density", label: "densityP" },
  { key: "mass", label: "massP" },
  { key: "melt", label: "meltP" },
];

function genQuestions() {
  const qs = [];
  const used = new Set();
  while (qs.filter((q) => q.type === "find").length < 6) {
    const el = pick(ELEMENTS);
    if (used.has(el.n)) continue;
    used.add(el.n);
    qs.push({ type: "find", el });
  }
  while (qs.length < 10) {
    const prop = pick(DUEL_PROPS);
    const a = pick(ELEMENTS), b = pick(ELEMENTS);
    if (a === b || a[prop.key] == null || b[prop.key] == null || a[prop.key] === b[prop.key]) continue;
    qs.push({ type: "duel", prop, a, b });
  }
  return qs.sort(() => random() - 0.5);
}

function startQuiz() {
  if (state.compareMode) toggleCompare(false);
  closePanel();
  hideTooltip();
  state.quiz = { qs: genQuestions(), i: 0, score: 0, answered: false };
  quizBtn.classList.add("active");
  quizCard.hidden = false;
  renderQuiz();
}

function renderQuiz() {
  const q = state.quiz;
  const cur = q.qs[q.i];
  quizProgress.textContent = T("quizProgress", { i: q.i + 1, s: q.score });
  quizFeedback.textContent = "";
  quizFeedback.className = "quiz-feedback";
  if (cur.type === "find") {
    quizQuestion.textContent = `${T("quizFind")} ${elName(cur.el)}`;
    quizAnswers.innerHTML = "";
  } else {
    quizQuestion.textContent = T("quizHigher", { p: T(cur.prop.label).toLocaleLowerCase(lang) });
    quizAnswers.innerHTML = "";
    for (const el of [cur.a, cur.b]) {
      const btn = document.createElement("button");
      btn.textContent = `${el.sym} · ${elName(el)}`;
      btn.addEventListener("click", () => quizDuelAnswer(el));
      quizAnswers.appendChild(btn);
    }
  }
}

function quizNext() {
  const q = state.quiz;
  q.i++;
  q.answered = false;
  if (q.i >= q.qs.length) {
    quizProgress.textContent = "";
    quizQuestion.textContent = T("quizScore", { s: q.score });
    quizAnswers.innerHTML = "";
    const btn = document.createElement("button");
    btn.textContent = T("quizAgain");
    btn.addEventListener("click", startQuiz);
    quizAnswers.appendChild(btn);
    quizFeedback.textContent = "";
  } else {
    renderQuiz();
  }
}

function quizResult(ok, correctEl) {
  const q = state.quiz;
  q.answered = true;
  if (ok) {
    q.score++;
    quizFeedback.textContent = T("quizCorrect");
    quizFeedback.className = "quiz-feedback ok";
  } else {
    quizFeedback.textContent = T("quizWrong", { a: `${correctEl.sym} · ${elName(correctEl)}` });
    quizFeedback.className = "quiz-feedback bad";
  }
  quizProgress.textContent = T("quizProgress", { i: q.i + 1, s: q.score });
  setTimeout(quizNext, 1500);
}

function flashTile(el, ok) {
  const root = tileByN.get(el.n).root;
  root.classList.remove("flash-ok", "flash-bad");
  void root.offsetWidth;
  root.classList.add(ok ? "flash-ok" : "flash-bad");
}

function quizTileAnswer(tile) {
  const q = state.quiz;
  const cur = q.qs[q.i];
  if (!cur || cur.type !== "find" || q.answered) return;
  const ok = tile.data.n === cur.el.n;
  flashTile(tile.data, ok);
  if (!ok) flashTile(cur.el, true);
  quizResult(ok, cur.el);
}

function quizDuelAnswer(el) {
  const q = state.quiz;
  const cur = q.qs[q.i];
  if (q.answered) return;
  const correct = cur.a[cur.prop.key] > cur.b[cur.prop.key] ? cur.a : cur.b;
  quizResult(el === correct, correct);
}

function endQuiz() {
  state.quiz = null;
  quizBtn.classList.remove("active");
  quizCard.hidden = true;
}
quizBtn.addEventListener("click", () => (state.quiz ? endQuiz() : startQuiz()));
document.getElementById("quizClose").addEventListener("click", endQuiz);

/* ---------- dil ---------- */
const langBtn = document.getElementById("langBtn");
function applyLang(newLang) {
  lang = newLang;
  document.documentElement.lang = lang;
  langBtn.textContent = lang === "tr" ? "EN" : "TR";
  document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = T(n.dataset.i18n)));
  document.querySelectorAll("[data-i18n-ph]").forEach((n) => (n.placeholder = T(n.dataset.i18nPh)));
  document.querySelectorAll(".lang-tr").forEach((n) => (n.hidden = lang !== "tr"));
  document.querySelectorAll(".lang-en").forEach((n) => (n.hidden = lang !== "en"));
  buildLegend();
  applyTemperature(state.temp);
  applyYear(state.year == null ? 2020 : state.year);
  if (panelData) openPanel(panelData);
  if (state.compareMode) renderCompare();
  if (state.quiz && state.quiz.i < state.quiz.qs.length) renderQuiz();
  syncURL();
}
langBtn.addEventListener("click", () => applyLang(lang === "tr" ? "en" : "tr"));

/* ---------- URL durumu ---------- */
let urlReady = false;
function syncURL() {
  if (!urlReady) return;
  const p = new URLSearchParams();
  if (state.temp !== 293) p.set("t", state.temp);
  if (state.mode !== "cat") p.set("m", state.mode);
  if (state.year != null) p.set("y", state.year);
  if (panelData) p.set("el", panelData.sym);
  if (lang !== "tr") p.set("lang", lang);
  const h = p.toString();
  history.replaceState(null, "", h ? "#" + h : location.pathname + location.search);
}

function initFromURL() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.get("lang") === "en") applyLang("en");
  const m = p.get("m");
  if (m && (m === "phase" || MODES[m])) setMode(m);
  const t = parseInt(p.get("t"), 10);
  if (!isNaN(t)) {
    tempSlider.value = Math.max(0, Math.min(6000, t));
    applyTemperature(+tempSlider.value);
  }
  const y = parseInt(p.get("y"), 10);
  if (!isNaN(y)) {
    yearSlider.value = Math.max(1650, Math.min(2020, y));
    applyYear(+yearSlider.value);
  }
  const sym = p.get("el");
  if (sym) {
    const el = ELEMENTS.find((e) => e.sym.toLowerCase() === sym.toLowerCase());
    if (el) openPanel(el);
  }
  urlReady = true;
  syncURL();
}

/* ---------- sayfa geçişi (levha sekmeleri) ---------- */
document.addEventListener("click", (ev) => {
  const a = ev.target.closest("a.page-link");
  if (!a || !a.getAttribute("href") || a.target === "_blank") return;
  ev.preventDefault();
  document.body.classList.add("leaving");
  setTimeout(() => (location.href = a.href), 240);
});

/* ---------- bilgi modalı ---------- */
const infoModal = document.getElementById("infoModal");
document.getElementById("infoBtn").addEventListener("click", () => (infoModal.hidden = false));
document.getElementById("infoClose").addEventListener("click", () => (infoModal.hidden = true));
infoModal.addEventListener("click", (ev) => { if (ev.target === infoModal) infoModal.hidden = true; });
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") infoModal.hidden = true; });

/* ---------- başlangıç ---------- */
applyTemperature(293);
applyYear(2020);
initFromURL();
