/* Nüklit Haritası — Segrè diyagramı
   IAEA Livechart verisi (nuclides-data.js): [z, n, hl, decays, ab, year]
   hl saniye; -1 = kararlı; null = bilinmiyor. Bağımlılık yok. */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- veri ---------- */
const NUC = NUCLIDES.map(([z, n, hl, dec, ab, year]) => ({ z, n, hl, dec, ab, year }));
const byZN = new Map(NUC.map((u) => [u.z * 1000 + u.n, u]));
const NMAX = Math.max(...NUC.map((u) => u.n)) + 2;
const ZMAX = Math.max(...NUC.map((u) => u.z)) + 2;
const trName = (z) => (z === 0 ? "Nötron" : (ELEMENTS[z - 1] || {}).tr || SYMBOLS[z]);

/* ---------- bozunma modu sınıflandırması ---------- */
const DECAY_CLASSES = [
  { key: "stable", label: "Kararlı", color: "#22334f" },
  { key: "bminus", label: "β⁻", color: "#2e6f8e" },
  { key: "bplus", label: "β⁺ / EC", color: "#b5432c" },
  { key: "alpha", label: "α", color: "#c2963a" },
  { key: "sf", label: "Kendiliğinden fisyon", color: "#3f7d6d" },
  { key: "p", label: "p yayını", color: "#c77b3a" },
  { key: "n", label: "n yayını", color: "#7d4bb5" },
  { key: "unknown", label: "Bilinmiyor", color: "#c4bfae" },
];
const CLASS_COLOR = Object.fromEntries(DECAY_CLASSES.map((d) => [d.key, d.color]));

function decayClass(u) {
  if (u.hl === -1) return "stable";
  const first = (u.dec.split(";")[0] || "").split("=")[0];
  if (!first) return "unknown";
  if (first.startsWith("B-") || first === "2B-") return "bminus";
  if (first.includes("EC") || first.startsWith("B+") || first === "2B+") return "bplus";
  if (first === "A") return "alpha";
  if (first === "SF") return "sf";
  if (first === "P" || first === "2P") return "p";
  if (first === "N" || first === "2N") return "n";
  return "unknown";
}
for (const u of NUC) u.cls = decayClass(u);

/* bozunma ürünü: [dz, dn] */
const DECAY_DELTA = {
  "B-": [1, -1], "2B-": [2, -2], "B-N": [1, -2], "B-2N": [1, -3], "B-A": [-1, -3],
  "B+": [-1, 1], "EC": [-1, 1], "EC+B+": [-1, 1], "2EC": [-2, 2], "2B+": [-2, 2],
  "ECP": [-2, 1], "B+P": [-2, 1],
  "A": [-2, -2], "P": [-1, 0], "2P": [-2, 0], "N": [0, -1], "2N": [0, -2],
};

/* ---------- yarı ömür renk skalası (ısı haritası) ---------- */
const HEAT_STOPS = ["#2e6f8e", "#3f7d6d", "#c2963a", "#b5432c"].map((h) => [
  parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16),
]);
function heatColor(t) {
  t = clamp(t, 0, 1);
  const seg = Math.min(HEAT_STOPS.length - 2, Math.floor(t * (HEAT_STOPS.length - 1)));
  const f = t * (HEAT_STOPS.length - 1) - seg;
  const [a, b] = [HEAT_STOPS[seg], HEAT_STOPS[seg + 1]];
  return "#" + a.map((c, i) => Math.round(c + (b[i] - c) * f).toString(16).padStart(2, "0")).join("");
}
function nuclideColor(u) {
  if (state.mode === "decay") return CLASS_COLOR[u.cls];
  if (u.hl === -1) return "#22334f";
  if (u.hl == null) return "#c4bfae";
  return heatColor((Math.log10(u.hl) + 21) / 39); // 1e-21 .. 1e18 s
}

/* ---------- yarı ömür biçimleme ---------- */
const YEAR = 3.156e7;
function fmtHL(s) {
  if (s == null) return "bilinmiyor";
  if (s < 0) return "kararlı";
  const units = [
    [1e-18, 1e-21, "zs"], [1e-15, 1e-18, "as"], [1e-12, 1e-15, "fs"],
    [1e-9, 1e-12, "ps"], [1e-6, 1e-9, "ns"], [1e-3, 1e-6, "µs"], [1, 1e-3, "ms"],
  ];
  for (const [lim, div, unit] of units) if (s < lim) return short(s / div) + " " + unit;
  if (s < 60) return short(s) + " sn";
  if (s < 3600) return short(s / 60) + " dk";
  if (s < 86400) return short(s / 3600) + " saat";
  if (s < YEAR) return short(s / 86400) + " gün";
  if (s < 1e3 * YEAR) return short(s / YEAR) + " yıl";
  if (s < 1e6 * YEAR) return short(s / (1e3 * YEAR)) + " bin yıl";
  if (s < 1e9 * YEAR) return short(s / (1e6 * YEAR)) + " milyon yıl";
  return short(s / (1e9 * YEAR)) + " milyar yıl";
}
const short = (v) => (v >= 100 ? Math.round(v) : +v.toPrecision(3));

/* ---------- durum ---------- */
const state = {
  mode: "decay",
  tExp: null,          // null = zaman filtresi yok; sayı = log10(saniye)
  magic: true,
  offCls: new Set(),
  highlightZ: null,
  selected: null,      // seçili nüklit
  chain: [],           // seçilinin bozunma zinciri
};

/* ---------- kanvas ve görünüm (zoom/pan) ---------- */
const holder = document.getElementById("chartHolder");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, DPR = 1, CELL = 0;
const view = { k: 1, x: 0, y: 0 }; // hücre biriminde ofset

function resize() {
  DPR = window.devicePixelRatio || 1;
  W = Math.max(holder.clientWidth - 2, 700); // dar ekranda yatay kaydırma
  CELL = W / NMAX;
  H = Math.ceil(CELL * ZMAX);
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  draw();
}
window.addEventListener("resize", resize);

/* hücre -> ekran */
const sx = (n) => (n - view.x) * CELL * view.k;
const sy = (z) => H - (z + 1 - view.y) * CELL * view.k;

const survives = (u) => u.hl === -1 || u.hl == null || state.tExp == null || u.hl >= 10 ** state.tExp;

let rafPending = false;
function draw() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const c = CELL * view.k;
    const gap = c > 4 ? 1 : 0;

    let alive = 0;
    for (const u of NUC) {
      const x = sx(u.n), y = sy(u.z);
      const ok = survives(u);
      if (ok) alive++;
      if (x < -c || y < -c || x > W || y > H) continue;
      const off = state.offCls.has(u.cls);
      ctx.globalAlpha = !ok ? 0.08 : off ? 0.1 : 1;
      ctx.fillStyle = nuclideColor(u);
      ctx.fillRect(x, y, c - gap, c - gap);
    }
    ctx.globalAlpha = 1;

    if (state.magic) drawMagic(c);
    if (state.highlightZ != null) drawRowHighlight(state.highlightZ, c);
    if (state.selected) drawChain(c);

    document.getElementById("surviveCount").innerHTML =
      `kalan çekirdek türü: <b>${alive}</b> / ${NUC.length}`;
  });
}

function drawMagic(c) {
  const MAGIC = [2, 8, 20, 28, 50, 82, 126];
  ctx.strokeStyle = "rgba(34, 51, 79, 0.3)";
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(34, 51, 79, 0.5)";
  ctx.font = '10px "IBM Plex Mono", monospace';
  for (const m of MAGIC) {
    if (m < ZMAX) {
      const y = sy(m) + c;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.fillText("Z=" + m, 4, y - 3);
    }
    const x = sx(m);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    ctx.fillText("N=" + m, x + 3, H - 6);
  }
  ctx.setLineDash([]);
}

function drawRowHighlight(z, c) {
  const iso = NUC.filter((u) => u.z === z);
  if (!iso.length) return;
  const minN = Math.min(...iso.map((u) => u.n));
  const maxN = Math.max(...iso.map((u) => u.n));
  ctx.strokeStyle = "#22334f";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx(minN) - 1, sy(z) - 1, (maxN - minN + 1) * c + 2, c + 1);
}

function drawChain(c) {
  ctx.strokeStyle = "#b5432c";
  ctx.lineWidth = Math.max(1.2, c * 0.12);
  for (let i = 0; i < state.chain.length; i++) {
    const u = state.chain[i];
    const x = sx(u.n) + c / 2, y = sy(u.z) + c / 2;
    ctx.strokeRect(sx(u.n), sy(u.z), c - 1, c - 1);
    if (i) {
      const p = state.chain[i - 1];
      ctx.beginPath();
      ctx.moveTo(sx(p.n) + c / 2, sy(p.z) + c / 2);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}

/* ---------- zoom & pan ---------- */
canvas.addEventListener("wheel", (ev) => {
  ev.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
  const nBefore = view.x + mx / (CELL * view.k);
  const zBefore = view.y + (H - my) / (CELL * view.k) - 1;
  view.k = clamp(view.k * (ev.deltaY < 0 ? 1.18 : 1 / 1.18), 1, 20);
  view.x = nBefore - mx / (CELL * view.k);
  view.y = zBefore - (H - my) / (CELL * view.k) + 1;
  clampView();
  draw();
}, { passive: false });

let dragging = null;
canvas.addEventListener("mousedown", (ev) => {
  dragging = { x: ev.clientX, y: ev.clientY, vx: view.x, vy: view.y, moved: false };
});
window.addEventListener("mousemove", (ev) => {
  if (!dragging) return;
  const dx = ev.clientX - dragging.x, dy = ev.clientY - dragging.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) dragging.moved = true;
  view.x = dragging.vx - dx / (CELL * view.k);
  view.y = dragging.vy + dy / (CELL * view.k);
  clampView();
  canvas.classList.add("dragging");
  draw();
});
window.addEventListener("mouseup", () => {
  canvas.classList.remove("dragging");
  setTimeout(() => (dragging = null), 0);
});
canvas.addEventListener("dblclick", () => {
  view.k = 1; view.x = 0; view.y = 0;
  draw();
});
function clampView() {
  view.x = clamp(view.x, 0, NMAX - NMAX / view.k);
  view.y = clamp(view.y, 0, ZMAX - ZMAX / view.k);
}

/* ---------- fare: ipucu ve seçim ---------- */
const tooltip = document.getElementById("tooltip");
function cellAt(ev) {
  const rect = canvas.getBoundingClientRect();
  const n = Math.floor(view.x + (ev.clientX - rect.left) / (CELL * view.k));
  const z = Math.floor(view.y + (H - (ev.clientY - rect.top)) / (CELL * view.k) - 1e-9);
  return byZN.get(z * 1000 + n);
}
canvas.addEventListener("mousemove", (ev) => {
  const u = cellAt(ev);
  if (!u) { tooltip.hidden = true; return; }
  const cls = DECAY_CLASSES.find((d) => d.key === u.cls);
  tooltip.innerHTML =
    `<div class="tt-name" style="color:${nuclideColor(u)}"><sup>${u.z + u.n}</sup>${SYMBOLS[u.z]} · ${trName(u.z)}</div>` +
    `<div class="tt-row">Z=<b>${u.z}</b> N=<b>${u.n}</b></div>` +
    `<div class="tt-row">Yarı ömür: <b>${fmtHL(u.hl)}</b></div>` +
    `<div class="tt-row">${cls.label}${u.ab != null ? ` · bolluk %${u.ab}` : ""}</div>`;
  tooltip.hidden = false;
  const pad = 14;
  let x = ev.clientX + pad, y = ev.clientY + pad;
  const r = tooltip.getBoundingClientRect();
  if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - pad;
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
});
canvas.addEventListener("mouseleave", () => (tooltip.hidden = true));
canvas.addEventListener("click", (ev) => {
  if (dragging && dragging.moved) return;
  const u = cellAt(ev);
  if (u) openPanel(u);
});

/* ---------- bozunma zinciri ---------- */
function buildChain(u) {
  const chain = [u];
  const seen = new Set([u.z * 1000 + u.n]);
  let cur = u;
  for (let i = 0; i < 60; i++) {
    if (cur.hl === -1) break;
    const mode = (cur.dec.split(";")[0] || "").split("=")[0];
    const d = DECAY_DELTA[mode];
    if (!d) break;
    const next = byZN.get((cur.z + d[0]) * 1000 + (cur.n + d[1]));
    if (!next || seen.has(next.z * 1000 + next.n)) break;
    chain.push(next);
    seen.add(next.z * 1000 + next.n);
    cur = next;
  }
  return chain;
}
const MODE_SYM = {
  "B-": "β⁻", "2B-": "2β⁻", "B-N": "β⁻n", "B-2N": "β⁻2n", "B-A": "β⁻α",
  "B+": "β⁺", "EC": "EC", "EC+B+": "β⁺/EC", "2EC": "2EC", "2B+": "2β⁺",
  "ECP": "ECp", "B+P": "β⁺p", "A": "α", "P": "p", "2P": "2p", "N": "n", "2N": "2n",
  "SF": "SF", "IT": "IT",
};

/* ---------- panel ---------- */
const panel = document.getElementById("panel");
const backdrop = document.getElementById("panelBackdrop");

function openPanel(u) {
  state.selected = u;
  state.chain = buildChain(u);
  tooltip.hidden = true;
  const color = nuclideColor(u);
  panel.style.setProperty("--el-color", color);

  const A = u.z + u.n;
  document.getElementById("nucBadge").innerHTML = `<span><sup>${A}</sup>${SYMBOLS[u.z]}</span>`;
  document.getElementById("pName").textContent = `${trName(u.z)}-${A}`;
  document.getElementById("pSub").textContent = `Z = ${u.z} proton · N = ${u.n} nötron`;
  const cls = DECAY_CLASSES.find((d) => d.key === u.cls);
  document.getElementById("pMode").textContent = cls.label;

  const decHuman = u.dec
    ? u.dec.split(";").map((d) => {
        const [m, p] = d.split("=");
        return (MODE_SYM[m] || m) + (p ? ` %${p}` : "");
      }).join(" · ")
    : "—";
  const props = [
    ["Yarı ömür", fmtHL(u.hl)],
    ["Bozunma", u.hl === -1 ? "kararlı" : decHuman],
    ["Doğal bolluk", u.ab != null ? `%${u.ab}` : "—"],
    ["Keşif yılı", u.year ?? "—"],
  ];
  document.getElementById("pProps").innerHTML = props
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join("");

  const list = document.getElementById("chainList");
  if (state.chain.length < 2) {
    list.innerHTML = `<li class="stable-end"><b>${u.hl === -1 ? "Zaten kararlı." : "Zincir verisi yok."}</b></li>`;
  } else {
    list.innerHTML = state.chain
      .map((c, i) => {
        const mode = (c.dec.split(";")[0] || "").split("=")[0];
        const arrow = c.hl === -1 ? "" : ` <span class="arrow">—${MODE_SYM[mode] || mode}→</span>`;
        const stable = c.hl === -1 ? ' class="stable-end"' : "";
        return `<li${stable}><b><sup>${c.z + c.n}</sup>${SYMBOLS[c.z]}</b> <span class="hl">(${fmtHL(c.hl)})</span>${arrow}</li>`;
      })
      .join("");
  }

  const el = ELEMENTS[u.z - 1];
  const pt = document.getElementById("ptLink");
  pt.style.display = el ? "" : "none";
  if (el) pt.href = `index.html#el=${el.sym}`;

  panel.hidden = false;
  backdrop.hidden = false;
  draw();
}
function closePanel() {
  panel.hidden = true;
  backdrop.hidden = true;
  state.selected = null;
  state.chain = [];
  draw();
}
document.getElementById("panelClose").addEventListener("click", closePanel);
backdrop.addEventListener("click", closePanel);
document.addEventListener("keydown", (ev) => ev.key === "Escape" && closePanel());

/* ---------- zaman kaydırıcısı ---------- */
const timeSlider = document.getElementById("timeSlider");
const timeReadout = document.getElementById("timeReadout");
timeSlider.addEventListener("input", () => {
  const v = +timeSlider.value;
  if (v <= -210) {
    state.tExp = null;
    timeReadout.textContent = "Başlangıç — tüm çekirdekler";
  } else {
    state.tExp = v / 10;
    timeReadout.textContent = "t = " + fmtHL(10 ** state.tExp) + " sonra";
  }
  draw();
});

/* ---------- modlar, sihirli sayılar, lejant, arama ---------- */
document.getElementById("modes").addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  state.mode = btn.dataset.mode;
  document.querySelectorAll("#modes button").forEach((b) => b.classList.toggle("active", b === btn));
  draw();
});
const magicBtn = document.getElementById("magicBtn");
magicBtn.addEventListener("click", () => {
  state.magic = !state.magic;
  magicBtn.classList.toggle("active", state.magic);
  draw();
});

const legendEl = document.getElementById("legend");
for (const d of DECAY_CLASSES) {
  const chip = document.createElement("div");
  chip.className = "legend-chip";
  chip.innerHTML = `<span class="dot" style="background:${d.color}"></span>${d.label}`;
  chip.addEventListener("click", () => {
    if (state.offCls.has(d.key)) state.offCls.delete(d.key);
    else state.offCls.add(d.key);
    chip.classList.toggle("off", state.offCls.has(d.key));
    draw();
  });
  legendEl.appendChild(chip);
}

const searchEl = document.getElementById("search");
searchEl.addEventListener("input", () => {
  const q = searchEl.value.trim().toLocaleLowerCase("tr");
  state.highlightZ = null;
  if (q) {
    const el = ELEMENTS.find(
      (e) =>
        e.sym.toLowerCase() === q ||
        e.tr.toLocaleLowerCase("tr") === q ||
        e.name.toLowerCase() === q ||
        String(e.n) === q
    );
    if (el) state.highlightZ = el.n;
  }
  draw();
});

/* ---------- sayfa geçişi (levha sekmeleri) ---------- */
document.addEventListener("click", (ev) => {
  const a = ev.target.closest("a.page-link");
  if (!a || !a.getAttribute("href") || a.target === "_blank") return;
  ev.preventDefault();
  document.body.classList.add("leaving");
  setTimeout(() => (location.href = a.href), 240);
});

/* ---------- bilgi modalı ---------- */
(() => {
  const m = document.getElementById("infoModal");
  const b = document.getElementById("infoBtn");
  if (!m || !b) return;
  b.addEventListener("click", () => (m.hidden = false));
  document.getElementById("infoClose").addEventListener("click", () => (m.hidden = true));
  m.addEventListener("click", (ev) => { if (ev.target === m) m.hidden = true; });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") m.hidden = true; });
})();


/* ---------- başlangıç ---------- */
(function initFromURL() {
  const p = new URLSearchParams(location.hash.slice(1));
  const sym = p.get("el");
  if (sym) {
    const el = ELEMENTS.find((e) => e.sym.toLowerCase() === sym.toLowerCase());
    if (el) {
      state.highlightZ = el.n;
      searchEl.value = el.sym;
    }
  }
})();
resize();
