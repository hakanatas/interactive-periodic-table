/* ============================================================
   İnteraktif Sayılar Tablosu — Levha X
   Bağımlılık yok: tüm veriler sayfa açılışında hesaplanır.
   ============================================================ */

"use strict";

/* ---------- sayı kuramı yardımcıları ---------- */

function computeDivisors(n) {
  const small = [], large = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      small.push(d);
      if (d !== n / d) large.push(n / d);
    }
  }
  return small.concat(large.reverse());
}

function computeFactors(n) {          // [[asal, üs], ...]
  const out = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      let e = 0;
      while (m % p === 0) { m /= p; e++; }
      out.push([p, e]);
    }
  }
  if (m > 1) out.push([m, 1]);
  return out;
}

function collatzOrbit(n) {
  const orbit = [n];
  let x = n;
  while (x !== 1 && orbit.length < 400) {
    x = x % 2 === 0 ? x / 2 : 3 * x + 1;
    orbit.push(x);
  }
  return orbit;
}

function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
function lcm(a, b) { return a / gcd(a, b) * b; }

function digitSum(n) { return String(n).split("").reduce((s, d) => s + +d, 0); }

const ROMAN = [[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
function toRoman(n) {
  let out = "";
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}

const BIRLER = ["","bir","iki","üç","dört","beş","altı","yedi","sekiz","dokuz"];
const ONLAR  = ["","on","yirmi","otuz","kırk","elli","altmış","yetmiş","seksen","doksan"];
function sayiYazi(n) {
  const y = Math.floor(n / 100), o = Math.floor((n % 100) / 10), b = n % 10;
  const parts = [];
  if (y) parts.push((y > 1 ? BIRLER[y] + " " : "") + "yüz");
  if (o) parts.push(ONLAR[o]);
  if (b) parts.push(BIRLER[b]);
  return parts.join(" ") || "sıfır";
}

/* ---------- kategoriler ---------- */

const CATS = [
  { key: "perfect", label: "Mükemmel",  color: "#8a6a13" },
  { key: "prime",   label: "Asal",      color: "#b5432c" },
  { key: "square",  label: "Tam kare",  color: "#2e6f8e" },
  { key: "cube",    label: "Küp",       color: "#6d548f" },
  { key: "tri",     label: "Üçgensel",  color: "#3f7d6d" },
  { key: "fib",     label: "Fibonacci", color: "#c2963a" },
  { key: "other",   label: "Diğer",     color: "#e7e2d2" },
];
const CAT_BY_KEY = Object.fromEntries(CATS.map(c => [c.key, c]));

const HEATS = {
  dcount:   { label: "Çarpan sayısı",        get: i => i.dCount,       skew: false },
  dsum:     { label: "Çarpanlar toplamı",    get: i => i.dSum,         skew: true  },
  lpf:      { label: "En büyük asal çarpan", get: i => i.lpf,          skew: true  },
  omega:    { label: "Asal çarpan sayısı",   get: i => i.omega,        skew: false },
  collatz:  { label: "Collatz adım sayısı",  get: i => i.collatzSteps, skew: false },
  digitsum: { label: "Basamak toplamı",      get: i => i.digitSum,     skew: false },
};

/* seçilmiş ilginç bilgiler */
const FACTS = {
  1:   "1 ne asal ne bileşiktir: yalnızca bir çarpanı vardır. Asalların tanımı bu yüzden 1'i dışarıda bırakır.",
  2:   "Tek çift asal sayı — diğer bütün çift sayılar 2'ye bölündüğü için bileşiktir.",
  6:   "En küçük mükemmel sayı: kendisi hariç çarpanlarının toplamı kendisine eşittir (1+2+3 = 6).",
  7:   "Zar atışlarında iki zarın toplamı en çok 7 gelir — çünkü 7'yi veren en çok kombinasyon vardır.",
  9:   "Basamakları toplamı 9'un katı olan her sayı 9'a bölünür; 9 bu kuralın kaynağıdır.",
  12:  "Bir düzine! 1, 2, 3, 4, 6 ve 12'ye bölünür — bu 'bol bölenlilik' yüzünden saat ve yumurta 12'yle sayılır.",
  13:  "Batıda uğursuz sayılan 13 aslında güzel bir asaldır ve bir Fibonacci sayısıdır.",
  16:  "Hem 2⁴ hem 4² — üs ve tabanı takas edebildiğin tek durum: 2⁴ = 4².",
  24:  "4 faktöriyel: 1×2×3×4 = 24. Bir günün saat sayısı.",
  27:  "Collatz oyununda 27 tam 111 adımda 1'e ulaşır ve yolda 9232'ye kadar tırmanır!",
  28:  "İkinci mükemmel sayı: 1+2+4+7+14 = 28. Ay'ın dolanma süresi de yaklaşık 28 gündür.",
  36:  "Hem tam kare (6²) hem üçgensel (1+2+…+8) olan en küçük sayı (1'den sonra).",
  49:  "7² — bir asal sayının karesi olduğu için tam üç çarpanı vardır: 1, 7, 49.",
  60:  "Babilliler 60 tabanında sayardı — dakikanın 60 saniye olması bu yüzden. 60'ın tam 12 çarpanı var.",
  64:  "Hem tam kare (8²) hem küp (4³) hem de 2⁶. Satranç tahtasında 64 kare vardır.",
  73:  "21. asal sayıdır; tersi olan 37 ise 12. asaldır — 21'in tersi! Ayna gibi bir asal.",
  100: "10² — yüzde (%) kavramının temeli. İlk 9 asalın olduğu aralık: 100'e kadar 25 asal vardır.",
  101: "Bir palindrom asal: tersten okunuşu da 101.",
  120: "1×2×3×4×5 = 120. 1'den 400'e kadar en çok çarpanı olan sayılardan: tam 16 çarpan!",
  121: "11² — tersten okunuşu da kendisi olan bir tam kare.",
  128: "2⁷ — yalnızca 2'lerin çarpımı. Bilgisayarlar bu yüzden 128, 256 gibi sayıları çok sever.",
  144: "12² ve aynı zamanda bir Fibonacci sayısı — 1'den büyük tek kare Fibonacci!",
  153: "1³ + 5³ + 3³ = 153. Kendi basamaklarının küplerinin toplamına eşit!",
  196: "14² — ve tersine ekleme oyununda palindroma ulaşmadığından şüphelenilen en küçük sayı.",
  220: "284 ile 'dost sayılar': her birinin çarpanları toplamı ötekini verir. İlk kez Pisagorcular fark etti.",
  256: "2⁸ — bir bayttaki değer sayısı. Bilgisayar renkleri bu yüzden 0–255 arasındadır.",
  284: "220 ile 'dost sayılar' çiftinin öteki yarısı: 1+2+4+71+142 = 220.",
  360: "Çemberin 360 derece olması boşuna değil: 360'ın tam 24 çarpanı var, her şeye bölünüyor!",
  365: "Bir yılın gün sayısı: 365 = 13² + 14² . Ardışık iki karenin toplamı!",
  400: "20² — bu levhanın son sayısı. Kalburda 19'a kadar elemek yetti, çünkü 20×20 = 400.",
};

/* önbellek: her sayının analizi */
const INFO = [null];

function analyze(n) {
  const divisors = computeDivisors(n);
  const factors = computeFactors(n);
  const dSum = divisors.reduce((a, b) => a + b, 0);
  const aliquot = dSum - n;
  const s = Math.round(Math.sqrt(n));
  const c = Math.round(Math.cbrt(n));
  const k = Math.floor((Math.sqrt(8 * n + 1) - 1) / 2);
  const orbit = collatzOrbit(n);
  const str = String(n);
  return {
    n, divisors, factors,
    dCount: divisors.length,
    dSum, aliquot,
    isPrime: divisors.length === 2,
    square: s * s === n ? s : 0,
    cube: c * c * c === n ? c : 0,
    tri: k * (k + 1) / 2 === n ? k : 0,
    fib: false,                       // aşağıda işaretlenir
    perfect: n > 1 && aliquot === n,
    abundant: aliquot > n,
    palindrome: n > 10 && str === [...str].reverse().join(""),
    even: n % 2 === 0,
    lpf: factors.length ? factors[factors.length - 1][0] : 1,
    omega: factors.reduce((a, [, e]) => a + e, 0),
    digitSum: digitSum(n),
    collatzSteps: orbit.length - 1,
    collatzMax: Math.max(...orbit),
    orbit,
  };
}

const MAX_N = 400;
for (let n = 1; n <= MAX_N; n++) INFO.push(analyze(n));
for (let a = 1, b = 1; b <= MAX_N; [a, b] = [b, a + b]) INFO[b].fib = true;

/* birincil kategori (renk önceliği) */
function primaryCat(i) {
  if (i.n === 1) return "other";
  if (i.perfect) return "perfect";
  if (i.isPrime) return "prime";
  if (i.square) return "square";
  if (i.cube) return "cube";
  if (i.tri) return "tri";
  if (i.fib) return "fib";
  return "other";
}

function catList(i) {                 // tüm üyelikler (rozetler için)
  const out = [];
  if (i.n === 1) out.push({ label: "ne asal ne bileşik", color: null });
  if (i.perfect) out.push({ label: "mükemmel ⭐", color: CAT_BY_KEY.perfect.color });
  if (i.isPrime) out.push({ label: "asal", color: CAT_BY_KEY.prime.color });
  if (i.n > 1 && !i.isPrime) out.push({ label: "bileşik", color: null });
  if (i.square) out.push({ label: `tam kare (${i.square}²)`, color: CAT_BY_KEY.square.color });
  if (i.cube) out.push({ label: `küp (${i.cube}³)`, color: CAT_BY_KEY.cube.color });
  if (i.tri) out.push({ label: "üçgensel", color: CAT_BY_KEY.tri.color });
  if (i.fib && i.n > 1) out.push({ label: "Fibonacci", color: CAT_BY_KEY.fib.color });
  if (i.palindrome) out.push({ label: "palindrom", color: null });
  out.push({ label: i.even ? "çift" : "tek", color: null });
  return out;
}

/* ---------- ısı haritası renkleri ---------- */

const HEAT_STOPS = [
  [231, 226, 210],  // #e7e2d2
  [46, 111, 142],   // #2e6f8e
  [63, 125, 109],   // #3f7d6d
  [194, 150, 58],   // #c2963a
  [181, 67, 44],    // #b5432c
];
function heatColor(t) {
  t = Math.max(0, Math.min(1, t));
  const seg = Math.min(3, Math.floor(t * 4));
  const f = t * 4 - seg;
  const a = HEAT_STOPS[seg], b = HEAT_STOPS[seg + 1];
  const rgb = a.map((v, j) => Math.round(v + (b[j] - v) * f));
  return { css: `rgb(${rgb.join(",")})`, dark: t > 0.28 };
}

/* ---------- durum ---------- */

const state = {
  max: 100,
  mode: "cat",            // cat | heat | sieve | div
  heat: "dcount",
  sieveStep: 0,
  divSel: [],             // en çok 2 bölen
  catsOff: new Set(),
  search: "",
  selected: null,
  compare: { active: false, a: null, b: null },
  quiz: null,
};

/* ---------- DOM kısayolları ---------- */

const $ = id => document.getElementById(id);
const grid = $("grid");
const tooltip = $("tooltip");

/* ---------- ızgara kurulumu ---------- */

let cells = [];           // index: n-1

function buildGrid() {
  const cols = state.max === 100 ? 10 : 20;
  grid.style.setProperty("--cols", cols);
  grid.style.setProperty("--cell-font",
    cols === 10 ? "clamp(0.95rem, 2.4vw, 1.6rem)" : "clamp(0.55rem, 1.35vw, 1.05rem)");
  grid.innerHTML = "";
  cells = [];
  const frag = document.createDocumentFragment();
  for (let n = 1; n <= state.max; n++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.n = n;
    cell.textContent = n;
    if (INFO[n].perfect) {
      const star = document.createElement("span");
      star.className = "perfect-star";
      star.textContent = "⭐";
      cell.appendChild(star);
    }
    frag.appendChild(cell);
    cells.push(cell);
  }
  grid.appendChild(frag);
  $("plateCaption").textContent = `Levha X — Doğal Sayılar · 1 – ${state.max}`;
}

/* ---------- görünüm uygulama ---------- */

const CLEAR_CLASSES = ["dim","hl","lit","sieved","sieve-prime","sieve-current",
  "div-a","div-b","div-both","div-none","is-mult","is-div","is-self"];

function applyView() {
  const heat = HEATS[state.heat];
  let lo = Infinity, hi = -Infinity;
  if (state.mode === "heat") {
    for (let n = 1; n <= state.max; n++) {
      const v = heat.get(INFO[n]);
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    $("heatLabel").textContent = heat.label;
    $("heatMin").textContent = lo;
    $("heatMax").textContent = hi;
  }

  const sp = sievePrimes();
  const sieveState = state.mode === "sieve" ? computeSieve(sp) : null;
  const [da, db] = state.divSel;

  for (let n = 1; n <= state.max; n++) {
    const cell = cells[n - 1];
    const info = INFO[n];
    cell.classList.remove(...CLEAR_CLASSES);
    cell.style.background = "";

    if (state.mode === "cat") {
      const cat = CAT_BY_KEY[primaryCat(info)];
      cell.style.background = cat.color;
      if (cat.key !== "other") cell.classList.add("lit");
      if (state.catsOff.has(cat.key)) cell.classList.add("dim");
    } else if (state.mode === "heat") {
      let t = hi > lo ? (heat.get(info) - lo) / (hi - lo) : 0;
      if (heat.skew) t = Math.sqrt(t);
      const c = heatColor(t);
      cell.style.background = c.css;
      if (c.dark) cell.classList.add("lit");
    } else if (state.mode === "sieve") {
      const st = sieveState[n];
      if (st === "out") cell.classList.add("sieved");
      else if (st === "prime") cell.classList.add("sieve-prime", "lit");
      if (state.sieveStep > 0 && n === sp[state.sieveStep - 1]) cell.classList.add("sieve-current");
    } else if (state.mode === "div") {
      if (!da) { /* seçim yok: nötr */ }
      else {
        const ha = n % da === 0, hb = db ? n % db === 0 : false;
        if (ha && hb) cell.classList.add("div-both", "lit");
        else if (ha) cell.classList.add("div-a", "lit");
        else if (hb) cell.classList.add("div-b", "lit");
        else cell.classList.add("div-none");
      }
    }

    if (state.compare.a === n || state.compare.b === n) cell.classList.add("cmp-sel");
  }

  applySearch();
  updateStrips();
}

/* mod şeritlerinin görünürlüğü + içerikleri */
function updateStrips() {
  $("legendRow").hidden = !(state.mode === "cat");
  $("heatRow").hidden = state.mode !== "heat";
  $("sieveRow").hidden = state.mode !== "sieve";
  $("divRow").hidden = state.mode !== "div";
  if (state.mode === "sieve") renderSieveStrip();
  if (state.mode === "div") renderDivStrip();
}

/* ---------- lejant ---------- */

function buildLegend() {
  const legend = $("legend");
  legend.innerHTML = "";
  for (const cat of CATS) {
    const chip = document.createElement("span");
    chip.className = "legend-chip";
    chip.dataset.key = cat.key;
    chip.innerHTML = `<span class="dot" style="background:${cat.color}"></span>${cat.label}`;
    chip.addEventListener("click", () => {
      if (state.catsOff.has(cat.key)) state.catsOff.delete(cat.key);
      else state.catsOff.add(cat.key);
      chip.classList.toggle("off");
      applyView();
    });
    chip.addEventListener("mouseenter", () => {
      if (state.mode !== "cat") return;
      for (let n = 1; n <= state.max; n++) {
        const i = INFO[n];
        const member = cat.key === "other" ? primaryCat(i) === "other" :
          (cat.key === "prime" && i.isPrime) || (cat.key === "square" && i.square) ||
          (cat.key === "cube" && i.cube) || (cat.key === "tri" && i.tri) ||
          (cat.key === "fib" && i.fib && n > 1) || (cat.key === "perfect" && i.perfect);
        cells[n - 1].classList.toggle("hl", !!member);
      }
    });
    chip.addEventListener("mouseleave", () => {
      cells.forEach(c => c.classList.remove("hl"));
      applySearch();
    });
    legend.appendChild(chip);
  }
}

/* ---------- Eratosthenes Kalburu ---------- */

function sievePrimes() {              // sqrt(max)'a kadar asallar
  const lim = Math.floor(Math.sqrt(state.max));
  return INFO.slice(2, lim + 1).filter(i => i.isPrime).map(i => i.n);
}

/* her sayı için: "in" (aday) | "out" (elendi) | "prime" (kesinleşti) */
function computeSieve(sp) {
  const s = state.sieveStep;
  const st = new Array(state.max + 1).fill("in");
  if (s === 0) return st;
  st[1] = "out";
  for (let k = 0; k < s; k++) {
    const p = sp[k];
    st[p] = "prime";
    for (let m = p * p; m <= state.max; m += p) if (st[m] === "in") st[m] = "out";
    for (let m = 2 * p; m < p * p; m += p) st[m] = "out";
  }
  const nextP = s < sp.length ? sp[s] : Infinity;
  const confirmLim = nextP === Infinity ? Infinity : nextP * nextP;
  for (let n = 2; n <= state.max; n++) {
    if (st[n] === "in" && n < confirmLim) st[n] = "prime";
  }
  return st;
}

function renderSieveStrip() {
  const sp = sievePrimes();
  const slider = $("sieveSlider");
  slider.max = sp.length;
  slider.value = state.sieveStep;
  const s = state.sieveStep;
  let msg;
  if (s === 0) msg = "Başlangıç — kaydırıcıyı sürükle";
  else {
    const p = sp[s - 1];
    msg = `${s}. adım: 1 ve ${p}'${sonEk(p)} katları elendi`;
    if (s === sp.length) msg += ` — bitti! √${state.max} = ${Math.sqrt(state.max)} yetti`;
  }
  $("sieveReadout").textContent = msg;

  const st = computeSieve(sp);
  let prime = 0, out = 0, cand = 0;
  for (let n = 1; n <= state.max; n++) {
    if (st[n] === "prime") prime++;
    else if (st[n] === "out") out++;
    else cand++;
  }
  $("sieveCounts").innerHTML =
    `<span>Bulunan asal: <b>${prime}</b></span><span>Elenen: <b>${out}</b></span><span>Aday: <b>${cand}</b></span>`;
}

/* ---------- bölünebilme modu ---------- */

const DIV_RULES = {
  2:  "son basamağı çift ise (0, 2, 4, 6, 8)",
  3:  "basamakları toplamı 3'ün katıysa",
  4:  "son iki basamağının oluşturduğu sayı 4'ün katıysa",
  5:  "son basamağı 0 veya 5 ise",
  6:  "hem 2'ye hem 3'e bölünüyorsa",
  9:  "basamakları toplamı 9'un katıysa",
  10: "son basamağı 0 ise",
};

function buildDivChips() {
  const wrap = $("divChips");
  wrap.innerHTML = "";
  for (const d of [2, 3, 4, 5, 6, 9, 10]) {
    const chip = document.createElement("button");
    chip.className = "div-chip";
    chip.textContent = d;
    chip.addEventListener("click", () => {
      const idx = state.divSel.indexOf(d);
      if (idx >= 0) state.divSel.splice(idx, 1);
      else {
        state.divSel.push(d);
        if (state.divSel.length > 2) state.divSel.shift();
      }
      applyView();
      syncHash();
    });
    wrap.appendChild(chip);
  }
}

function renderDivStrip() {
  const [a, b] = state.divSel;
  [...$("divChips").children].forEach(chip => {
    const d = +chip.textContent;
    chip.classList.toggle("on", state.divSel.includes(d));
    chip.classList.toggle("second", d === b);
  });
  let html = "";
  if (!a) html = "Bir sayı seç: katları tabloda boyanır. İkinci bir sayı seçersen ortak katlar da görünür.";
  else {
    html = `<b>${a} ile bölünebilme:</b> ${DIV_RULES[a]}.`;
    if (b) {
      html += ` <b>${b} ile bölünebilme:</b> ${DIV_RULES[b]}.`;
      html += ` <span class="r-both">Yeşil kareler her ikisinin ortak katları — yani EKOK(${a}, ${b}) = ${lcm(a, b)}'${sonEk(lcm(a,b))} katları.</span>`;
    }
  }
  $("divRules").innerHTML = html;
}

/* Türkçe iyelik eki kabaca: 2'ye/3'e… için değil, "X'in katları" kalıbı için */
function sonEk(n) {
  // 2'nin 3'ün 4'ün 5'in 6'nın 9'un 10'un 11'in 13'ün 19'un 20'nin 100'ün...
  const map = { 1:"in", 2:"nin", 3:"ün", 4:"ün", 5:"in", 6:"nın", 7:"nin", 8:"in", 9:"un",
                10:"un", 20:"nin", 30:"un", 40:"ın", 50:"nin", 60:"ın", 70:"in", 80:"in", 90:"ın" };
  if (map[n]) return map[n];
  if (n % 100 === 0) return "ün";                   // 100'ün, 200'ün, 300'ün
  return map[n % 10] || map[n % 100 - (n % 10)] || "nin";
}

/* ---------- hover: katlar ve çarpanlar ---------- */

let hovered = null;

function setHover(n) {
  if (hovered === n) return;
  clearHover();
  hovered = n;
  if (state.mode !== "cat" && state.mode !== "heat") return;
  for (let m = 2 * n; m <= state.max; m += n) cells[m - 1].classList.add("is-mult");
  for (const d of INFO[n].divisors) if (d !== n) cells[d - 1].classList.add("is-div");
  cells[n - 1].classList.add("is-self");
}

function clearHover() {
  if (hovered === null) return;
  cells.forEach(c => c.classList.remove("is-mult", "is-div", "is-self"));
  hovered = null;
}

/* ---------- tooltip ---------- */

function showTooltip(n, x, y) {
  const i = INFO[n];
  const cats = catList(i).map(c => c.label).join(" · ");
  const formula = i.n === 1 ? "—" :
    i.factors.map(([p, e]) => e > 1 ? `${p}<sup>${e}</sup>` : p).join(" · ");
  let extra = "";
  if (state.mode === "heat") {
    const h = HEATS[state.heat];
    extra = `<div class="tt-row">${h.label}: <b>${h.get(i)}</b></div>`;
  }
  tooltip.innerHTML = `
    <div class="tt-name">${n} — ${sayiYazi(n)}</div>
    <div class="tt-cats">${cats}</div>
    <div class="tt-row">Çarpan sayısı: <b>${i.dCount}</b> · Toplamı: <b>${i.dSum}</b></div>
    <div class="tt-row">Asal çarpanları: <b>${formula}</b></div>
    ${extra}`;
  tooltip.hidden = false;
  const r = tooltip.getBoundingClientRect();
  tooltip.style.left = Math.min(x + 14, innerWidth - r.width - 8) + "px";
  tooltip.style.top = Math.min(y + 14, innerHeight - r.height - 8) + "px";
}

/* ---------- detay paneli ---------- */

function openPanel(n) {
  state.selected = n;
  const i = INFO[n];
  const color = CAT_BY_KEY[primaryCat(i)];
  const panel = $("panel");
  panel.style.setProperty("--num-color", color.key === "other" ? "#51607a" : color.color);

  $("pNum").textContent = n;
  $("pWord").textContent = sayiYazi(n);
  $("pChips").innerHTML = catList(i).map(c =>
    `<span class="cat-chip${c.color ? "" : " neutral"}"${c.color ? ` style="background:${c.color}"` : ""}>${c.label}</span>`
  ).join("");

  const fact = FACTS[n];
  $("pFact").hidden = !fact;
  if (fact) $("pFact").textContent = fact;

  /* asal çarpan merdiveni */
  const ladder = $("pLadder");
  if (n === 1) {
    ladder.innerHTML = `<tr><td>1</td><td></td></tr>`;
    $("pFormula").innerHTML = "1'in asal çarpanı yoktur";
  } else {
    let rows = "", m = n;
    for (const [p, e] of i.factors) {
      for (let k = 0; k < e; k++) { rows += `<tr><td>${m}</td><td>${p}</td></tr>`; m /= p; }
    }
    rows += `<tr><td>1</td><td></td></tr>`;
    ladder.innerHTML = rows;
    const formula = i.factors.map(([p, e]) => e > 1 ? `${p}<sup>${e}</sup>` : p).join(" · ");
    $("pFormula").innerHTML = i.isPrime
      ? `${n} asaldır — bölünmez!`
      : `${n} = ${formula}`;
  }

  /* çarpanlar */
  $("pDivisors").innerHTML = i.divisors.map(d =>
    `<span${INFO[d] && INFO[d].isPrime ? ' class="dprime"' : ""}>${d}</span>`).join("");
  $("pDCount").textContent = i.dCount;
  $("pDSum").textContent = i.dSum;
  let aliText;
  if (n === 1) aliText = "0 — tek çarpanı kendisi";
  else if (i.perfect) aliText = `${i.aliquot} = ${n} → mükemmel sayı ⭐`;
  else if (i.abundant) aliText = `${i.aliquot} > ${n} → bol sayı`;
  else aliText = `${i.aliquot} < ${n} → eksik sayı`;
  $("pAliquot").textContent = aliText;

  /* bölünebilme kontrolleri */
  $("pDivTable").innerHTML = [2, 3, 4, 5, 6, 9, 10].map(d => {
    const yes = n % d === 0;
    let why = "";
    const last = n % 10, last2 = n % 100, ds = i.digitSum;
    if (d === 2) why = `son basamak ${last} → ${last % 2 === 0 ? "çift" : "tek"}`;
    if (d === 3) why = `${String(n).split("").join("+")} = ${ds} → ${ds % 3 === 0 ? "3'ün katı" : "3'ün katı değil"}`;
    if (d === 4) why = n < 100 ? `${n} → ${yes ? "4'ün katı" : "4'ün katı değil"}` : `son iki basamak ${String(last2).padStart(2, "0")} → ${last2 % 4 === 0 ? "4'ün katı" : "değil"}`;
    if (d === 5) why = `son basamak ${last}`;
    if (d === 6) why = `2'ye ${n % 2 === 0 ? "✓" : "✗"} ve 3'e ${n % 3 === 0 ? "✓" : "✗"}`;
    if (d === 9) why = `basamak toplamı ${ds} → ${ds % 9 === 0 ? "9'un katı" : "9'un katı değil"}`;
    if (d === 10) why = `son basamak ${last}`;
    return `<div class="div-check ${yes ? "yes" : "no"}">
      <span class="dc-n">${d}</span><span class="dc-mark">${yes ? "✓" : "✗"}</span>
      <span class="dc-why">${why}</span></div>`;
  }).join("");

  /* şekilli sayı çizimi */
  renderFigure(i);

  /* Collatz */
  if (n === 1) {
    $("pCollatzInfo").innerHTML = "1 zaten hedefte — oyun başlamadan bitti!";
  } else {
    $("pCollatzInfo").innerHTML =
      `<b>${i.collatzSteps} adımda</b> 1'e ulaşır · en yüksek nokta: <b>${i.collatzMax}</b>` +
      "<br><span style='font-size:0.7rem'>Kural: çiftse ikiye böl, tekse 3 katının 1 fazlasını al.</span>";
  }
  renderCollatz(i);

  /* farklı gösterimler */
  const forms = [
    ["Roma rakamı", toRoman(n)],
    ["İkilik (binary)", n.toString(2)],
    ["Yazıyla", sayiYazi(n)],
  ];
  if (i.square) forms.push(["Kare olarak", `${i.square}² = ${n}`]);
  if (i.cube) forms.push(["Küp olarak", `${i.cube}³ = ${n}`]);
  if (i.tri) forms.push(["Üçgensel", `1+2+…+${i.tri} = ${n}`]);
  $("pForms").innerHTML = forms.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  $("wikiTr").href = `https://tr.wikipedia.org/wiki/${n}_(say%C4%B1)`;

  $("panelBackdrop").hidden = false;
  panel.hidden = false;
  panel.scrollTop = 0;
  syncHash();
}

function closePanel() {
  state.selected = null;
  $("panel").hidden = true;
  $("panelBackdrop").hidden = true;
  syncHash();
}

/* kare/üçgensel sayılar için nokta çizimi */
function renderFigure(i) {
  const wrap = $("pFigWrap");
  const svg = $("pFig");
  let rows = null, title = "";
  if (i.square && i.n <= 225) {
    rows = Array.from({ length: i.square }, () => i.square);
    title = `Şekilli sayı — ${i.square} × ${i.square} kare`;
  } else if (i.tri && i.n <= 210) {
    rows = Array.from({ length: i.tri }, (_, r) => r + 1);
    title = `Şekilli sayı — üçgen (satırlar: 1'den ${i.tri}'e)`;
  }
  if (!rows) { wrap.hidden = true; return; }
  wrap.hidden = false;
  $("pFigTitle").textContent = title;
  const maxRow = Math.max(...rows);
  const unit = 100 / Math.max(maxRow, rows.length);
  const rPix = unit * 0.34;
  let dots = "";
  rows.forEach((count, r) => {
    const offset = (maxRow - count) / 2;   // üçgeni ortala
    for (let c = 0; c < count; c++) {
      dots += `<circle cx="${(offset + c + 0.5) * unit}" cy="${(r + 0.5) * unit}" r="${rPix}"/>`;
    }
  });
  svg.setAttribute("viewBox", `0 0 ${maxRow * unit} ${rows.length * unit}`);
  svg.innerHTML = dots;
}

/* Collatz yörüngesi çizgisi (log ölçek) */
function renderCollatz(i) {
  const svg = $("pCollatz");
  const orbit = i.orbit;
  if (orbit.length < 2) { svg.innerHTML = ""; return; }
  const W = 300, H = 90, pad = 6;
  const maxLog = Math.log(i.collatzMax);
  const pts = orbit.map((v, idx) => {
    const x = pad + (W - 2 * pad) * idx / (orbit.length - 1);
    const y = H - pad - (H - 2 * pad) * (Math.log(v) / (maxLog || 1));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  svg.innerHTML = `<polyline points="${pts.join(" ")}"/>` +
    `<circle cx="${pts[0].split(",")[0]}" cy="${pts[0].split(",")[1]}" r="2.5"/>` +
    `<circle cx="${pts[pts.length-1].split(",")[0]}" cy="${pts[pts.length-1].split(",")[1]}" r="2.5"/>`;
}

/* ---------- karşılaştırma: EBOB / EKOK ---------- */

function toggleCompare(force) {
  const on = force !== undefined ? force : !state.compare.active;
  state.compare = { active: on, a: null, b: null };
  $("compareBtn").classList.toggle("active", on);
  $("compareCard").hidden = !on;
  if (on) {
    $("compareHint").textContent = "Tablodan iki sayıya tıkla — EBOB ve EKOK'ları hesaplansın.";
    $("compareBody").innerHTML = "";
  }
  applyView();
}

function comparePick(n) {
  const c = state.compare;
  if (c.a === n || c.b === n) return;
  if (!c.a) c.a = n;
  else if (!c.b) c.b = n;
  else { c.a = c.b; c.b = n; }
  if (c.a && c.b) renderCompare(c.a, c.b);
  else $("compareHint").textContent = `${c.a} seçildi — şimdi ikinci sayıya tıkla.`;
  applyView();
}

function factorFormula(n) {
  if (n === 1) return "1";
  return INFO[n].factors.map(([p, e]) => e > 1 ? `${p}<sup>${e}</sup>` : p).join(" · ");
}

function renderCompare(a, b) {
  const g = gcd(a, b), l = lcm(a, b);
  const commons = computeDivisors(g);

  /* EBOB/EKOK'un asal çarpanlardan nasıl çıktığı */
  const fa = new Map(INFO[a].factors), fb = new Map(INFO[b].factors);
  const allP = [...new Set([...fa.keys(), ...fb.keys()])].sort((x, y) => x - y);
  const gParts = [], lParts = [];
  for (const p of allP) {
    const ea = fa.get(p) || 0, eb = fb.get(p) || 0;
    const mn = Math.min(ea, eb), mx = Math.max(ea, eb);
    if (mn > 0) gParts.push(mn > 1 ? `${p}<sup>${mn}</sup>` : `${p}`);
    lParts.push(mx > 1 ? `${p}<sup>${mx}</sup>` : `${p}`);
  }

  $("compareHint").textContent = "";
  $("compareBody").innerHTML = `
    <div class="compare-title"><span>${a}</span><span class="vs">×</span><span>${b}</span></div>
    <div class="cmp-factors">
      <div class="cmp-fcol"><div class="f-head">${a}</div><div class="f-formula">${factorFormula(a)}</div></div>
      <div class="cmp-fcol"><div class="f-head">${b}</div><div class="f-formula">${factorFormula(b)}</div></div>
    </div>
    <div class="gcd-grid" style="margin-top:0.7rem">
      <div class="gcd-box">
        <div class="g-label">EBOB — en büyük ortak bölen</div>
        <div class="g-val">${g}</div>
        <div class="g-how">${gParts.length ? "ortak asalların <b>küçük</b> üsleri: " + gParts.join(" · ") : "ortak asal çarpan yok → aralarında asal!"}</div>
      </div>
      <div class="gcd-box">
        <div class="g-label">EKOK — en küçük ortak kat</div>
        <div class="g-val">${l}</div>
        <div class="g-how">tüm asalların <b>büyük</b> üsleri: ${lParts.join(" · ")}</div>
      </div>
    </div>
    <div class="cmp-common">Ortak bölenler (EBOB'un çarpanları):
      <div class="divisor-chips">${commons.map(d => `<span>${d}</span>`).join("")}</div>
    </div>
    <div class="cmp-note">Sınavda işine yarar: <b>${a} × ${b} = ${a * b}</b> ve
      <b>EBOB × EKOK = ${g} × ${l} = ${g * l}</b> — her zaman eşittir!</div>`;
}

/* ---------- quiz ---------- */

function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeQuestion() {
  const max = state.max;
  const type = randInt(1, 7);

  /* tabloda-bul pencereleri */
  const windowWith = pred => {
    for (let tries = 0; tries < 60; tries++) {
      const a = randInt(2, max - 14), b = a + 12;
      for (let n = a; n <= b; n++) if (pred(n)) return [a, b];
    }
    return [2, max];
  };

  if (type === 1) {
    const [a, b] = windowWith(n => INFO[n].isPrime);
    return { kind: "find", text: `Tabloda bul: ${a} ile ${b} arasında bir <b>asal sayıya</b> tıkla.`,
      check: n => n >= a && n <= b && INFO[n].isPrime };
  }
  if (type === 2) {
    const pairs = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 9]];
    const [p, q] = pairs[randInt(0, pairs.length - 1)];
    const [a, b] = windowWith(n => n % p === 0 && n % q === 0);
    return { kind: "find", text: `Tabloda bul: ${a}–${b} arasında hem <b>${p}'e</b> hem <b>${q}'a bölünen</b> bir sayıya tıkla.`,
      check: n => n >= a && n <= b && n % p === 0 && n % q === 0 };
  }
  if (type === 3) {
    const [a, b] = windowWith(n => INFO[n].square);
    return { kind: "find", text: `Tabloda bul: ${a} ile ${b} arasındaki <b>tam kare</b> sayıya tıkla.`,
      check: n => n >= a && n <= b && INFO[n].square > 0 };
  }
  if (type === 4) {
    const g0 = [2, 3, 4, 5, 6][randInt(0, 4)];
    const a = g0 * randInt(2, 8), b = g0 * randInt(2, 8);
    if (a === b) return makeQuestion();
    const g = gcd(a, b);
    const opts = shuffle([...new Set([g, 1, Math.min(a, b), g * 2])].slice(0, 4));
    return { kind: "mc", text: `EBOB(${a}, ${b}) kaçtır?`, options: opts, answer: g };
  }
  if (type === 5) {
    const a = randInt(3, 12), b = randInt(3, 12);
    if (a === b) return makeQuestion();
    const l = lcm(a, b);
    const opts = shuffle([...new Set([l, a * b, gcd(a, b), a + b])].slice(0, 4));
    return { kind: "mc", text: `EKOK(${a}, ${b}) kaçtır?`, options: opts, answer: l };
  }
  if (type === 6) {
    const primes = INFO.slice(2, max + 1).filter(i => i.isPrime);
    const p = primes[randInt(0, primes.length - 1)].n;
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = randInt(4, max);
      if (!INFO[w].isPrime && w !== p) wrong.add(w);
    }
    return { kind: "mc", text: "Hangisi <b>asal</b> sayıdır?", options: shuffle([p, ...wrong]), answer: p };
  }
  /* type 7 */
  let a = randInt(10, max), b = randInt(10, max);
  while (INFO[a].dCount === INFO[b].dCount) { a = randInt(10, max); b = randInt(10, max); }
  const ans = INFO[a].dCount > INFO[b].dCount ? a : b;
  return { kind: "mc", text: "Hangisinin <b>çarpan sayısı</b> daha fazla?", options: [a, b], answer: ans,
    explain: `${a}'${sonEk(a)} ${INFO[a].dCount}, ${b}'${sonEk(b)} ${INFO[b].dCount} çarpanı var.` };
}

function startQuiz() {
  state.quiz = { i: 0, score: 0, total: 10, q: null, answered: false, tried: false };
  $("quizBtn").classList.add("active");
  $("quizCard").hidden = false;
  toggleCompare(false);
  nextQuestion();
}

function nextQuestion() {
  const qz = state.quiz;
  qz.i++;
  if (qz.i > qz.total) return endQuiz();
  qz.q = makeQuestion();
  qz.answered = false;
  qz.tried = false;
  $("quizProgress").textContent = `Soru ${qz.i} / ${qz.total} · Skor ${qz.score}`;
  $("quizQuestion").innerHTML = qz.q.text;
  $("quizFeedback").textContent = "";
  $("quizFeedback").className = "quiz-feedback";
  const answers = $("quizAnswers");
  answers.innerHTML = "";
  if (qz.q.kind === "mc") {
    for (const opt of qz.q.options) {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.addEventListener("click", () => answerMC(opt, btn));
      answers.appendChild(btn);
    }
  }
}

function answerMC(opt, btn) {
  const qz = state.quiz;
  if (qz.answered) return;
  qz.answered = true;
  const ok = opt === qz.q.answer;
  if (ok && !qz.tried) qz.score++;
  const fb = $("quizFeedback");
  fb.textContent = ok ? "Doğru! ✓" + (qz.q.explain ? " " + qz.q.explain : "")
                      : `Yanlış — doğru cevap ${qz.q.answer}.` + (qz.q.explain ? " " + qz.q.explain : "");
  fb.className = "quiz-feedback " + (ok ? "ok" : "bad");
  btn.style.borderColor = ok ? "#3f7d6d" : "#b5432c";
  setTimeout(nextQuestion, ok ? 900 : 1900);
}

function quizPick(n) {
  const qz = state.quiz;
  if (!qz || qz.q.kind !== "find" || qz.answered) return false;
  const ok = qz.q.check(n);
  cells[n - 1].classList.remove("flash-ok", "flash-bad");
  void cells[n - 1].offsetWidth;                 // animasyonu yeniden tetikle
  cells[n - 1].classList.add(ok ? "flash-ok" : "flash-bad");
  const fb = $("quizFeedback");
  if (ok) {
    qz.answered = true;
    if (!qz.tried) qz.score++;
    fb.textContent = "Doğru! ✓";
    fb.className = "quiz-feedback ok";
    setTimeout(nextQuestion, 900);
  } else {
    qz.tried = true;
    fb.textContent = "Olmadı — tekrar dene!";
    fb.className = "quiz-feedback bad";
  }
  return true;
}

function endQuiz() {
  const qz = state.quiz;
  $("quizProgress").textContent = "Oyun bitti";
  const s = qz.score;
  $("quizQuestion").innerHTML = `Skorun: <b>${s} / ${qz.total}</b> — ` +
    (s >= 9 ? "Sayı ustası! 🏆" : s >= 6 ? "Çok iyi! 👏" : "Tabloyu biraz daha keşfet, tekrar dene! 💪");
  const answers = $("quizAnswers");
  answers.innerHTML = "";
  const again = document.createElement("button");
  again.textContent = "Tekrar oyna";
  again.addEventListener("click", startQuiz);
  answers.appendChild(again);
  $("quizFeedback").textContent = "";
}

function closeQuiz() {
  state.quiz = null;
  $("quizCard").hidden = true;
  $("quizBtn").classList.remove("active");
}

/* ---------- arama ---------- */

const SEARCH_KEYS = {
  "asal": i => i.isPrime,
  "kare": i => i.square > 0, "tam kare": i => i.square > 0,
  "küp": i => i.cube > 0, "kup": i => i.cube > 0,
  "üçgensel": i => i.tri > 0, "ucgensel": i => i.tri > 0, "üçgen": i => i.tri > 0,
  "fibonacci": i => i.fib, "fib": i => i.fib,
  "mükemmel": i => i.perfect, "mukemmel": i => i.perfect,
  "çift": i => i.even, "cift": i => i.even,
  "tek": i => !i.even,
  "palindrom": i => i.palindrome,
  "bol": i => i.abundant,
};

function applySearch() {
  const q = state.search.trim().toLowerCase();
  if (!q) return;
  const num = /^\d+$/.test(q) ? +q : null;
  const pred = SEARCH_KEYS[q];
  for (let n = 1; n <= state.max; n++) {
    const cell = cells[n - 1];
    if (num !== null) {
      cell.classList.toggle("hl", n === num);
      if (n !== num) cell.classList.add("dim");
    } else if (pred) {
      const hit = pred(INFO[n]);
      cell.classList.toggle("hl", hit);
      if (!hit) cell.classList.add("dim");
    }
  }
  if (num !== null && num >= 1 && num <= state.max) {
    cells[num - 1].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

/* ---------- URL paylaşımı ---------- */

let hashLock = false;

function syncHash() {
  const p = new URLSearchParams();
  if (state.max !== 100) p.set("max", state.max);
  if (state.mode !== "cat") p.set("m", state.mode);
  if (state.mode === "heat") p.set("h", state.heat);
  if (state.mode === "sieve" && state.sieveStep) p.set("s", state.sieveStep);
  if (state.mode === "div" && state.divSel.length) p.set("d", state.divSel.join(","));
  if (state.selected) p.set("n", state.selected);
  hashLock = true;
  const str = p.toString();
  history.replaceState(null, "", str ? "#" + str : location.pathname + location.search);
  hashLock = false;
}

function readHash() {
  if (hashLock || !location.hash) return;
  const p = new URLSearchParams(location.hash.slice(1));
  const max = +p.get("max");
  if ([100, 200, 400].includes(max)) state.max = max;
  const m = p.get("m");
  if (["cat", "heat", "sieve", "div"].includes(m)) state.mode = m;
  if (p.get("h") && HEATS[p.get("h")]) { state.heat = p.get("h"); if (state.mode === "heat") $("heatSelect").value = state.heat; }
  if (p.get("s")) state.sieveStep = Math.max(0, +p.get("s") || 0);
  if (p.get("d")) state.divSel = p.get("d").split(",").map(Number).filter(d => DIV_RULES[d]).slice(0, 2);
  const n = +p.get("n");
  if (n >= 1 && n <= state.max) setTimeout(() => openPanel(n), 100);
}

/* ---------- olaylar ---------- */

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll("#modes button").forEach(b =>
    b.classList.toggle("active", b.dataset.mode === mode));
  const hs = $("heatSelect");
  hs.classList.toggle("active", mode === "heat");
  if (mode !== "heat") hs.value = "";
  clearHover();
  applyView();
  syncHash();
}

function wireEvents() {
  /* ızgara: tıklama + hover (olay delegasyonu) */
  grid.addEventListener("click", e => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    const n = +cell.dataset.n;
    if (state.quiz && state.quiz.q && state.quiz.q.kind === "find") { if (quizPick(n)) return; }
    if (state.compare.active) { comparePick(n); return; }
    openPanel(n);
  });
  grid.addEventListener("mouseover", e => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    const n = +cell.dataset.n;
    setHover(n);
    showTooltip(n, e.clientX, e.clientY);
  });
  grid.addEventListener("mousemove", e => {
    if (!tooltip.hidden) {
      const r = tooltip.getBoundingClientRect();
      tooltip.style.left = Math.min(e.clientX + 14, innerWidth - r.width - 8) + "px";
      tooltip.style.top = Math.min(e.clientY + 14, innerHeight - r.height - 8) + "px";
    }
  });
  grid.addEventListener("mouseleave", () => { clearHover(); tooltip.hidden = true; });

  /* modlar */
  document.querySelectorAll("#modes button").forEach(btn =>
    btn.addEventListener("click", () => setMode(btn.dataset.mode)));

  $("heatSelect").addEventListener("change", e => {
    if (!e.target.value) { setMode("cat"); return; }
    state.heat = e.target.value;
    setMode("heat");
  });

  $("rangeSelect").addEventListener("change", e => {
    state.max = +e.target.value;
    state.sieveStep = Math.min(state.sieveStep, sievePrimes().length);
    if (state.selected > state.max) closePanel();
    buildGrid();
    applyView();
    syncHash();
  });

  $("sieveSlider").addEventListener("input", e => {
    state.sieveStep = +e.target.value;
    applyView();
    syncHash();
  });

  /* arama */
  $("search").addEventListener("input", e => {
    state.search = e.target.value;
    applyView();
  });
  $("search").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const q = e.target.value.trim();
      if (/^\d+$/.test(q) && +q >= 1 && +q <= state.max) openPanel(+q);
    }
  });

  /* panel */
  $("panelClose").addEventListener("click", closePanel);
  $("panelBackdrop").addEventListener("click", closePanel);
  $("pCompareAdd").addEventListener("click", () => {
    const n = state.selected;
    closePanel();
    if (!state.compare.active) toggleCompare(true);
    comparePick(n);
  });

  /* karşılaştırma */
  $("compareBtn").addEventListener("click", () => toggleCompare());
  $("compareClose").addEventListener("click", () => toggleCompare(false));

  /* quiz */
  $("quizBtn").addEventListener("click", () => state.quiz ? closeQuiz() : startQuiz());
  $("quizClose").addEventListener("click", closeQuiz);

  /* bilgi modalı */
  $("infoBtn").addEventListener("click", () => { $("infoModal").hidden = false; });
  $("infoClose").addEventListener("click", () => { $("infoModal").hidden = true; });
  $("infoModal").addEventListener("click", e => {
    if (e.target === $("infoModal")) $("infoModal").hidden = true;
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (!$("infoModal").hidden) $("infoModal").hidden = true;
      else if (!$("panel").hidden) closePanel();
      else if (state.quiz) closeQuiz();
      else if (state.compare.active) toggleCompare(false);
    }
  });

  window.addEventListener("hashchange", () => { if (!hashLock) location.reload(); });
}

/* ---------- başlat ---------- */

function init() {
  readHash();
  $("rangeSelect").value = state.max;
  if (state.mode === "heat") $("heatSelect").value = state.heat;
  buildGrid();
  buildLegend();
  buildDivChips();
  wireEvents();
  setMode(state.mode);
}

init();
