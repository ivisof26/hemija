// Страница „Теми“: табови, анимации и мини квизови
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const $ = (id) => document.getElementById(id);
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function s(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, props, kids) {
    const e = document.createElement(tag);
    for (const k in props || {}) {
      if (k === "text") e.textContent = props[k];
      else if (k === "html") e.innerHTML = props[k];
      else e.setAttribute(k, props[k]);
    }
    (kids || []).forEach((c) => e.appendChild(c));
    return e;
  }

  /* ---------- Табови ---------- */
  const tabs = Array.from(document.querySelectorAll("#tabs .tab"));
  function showTab(id, push) {
    if (!document.getElementById(id) || !tabs.some((t) => t.dataset.tab === id)) id = "atom";
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
    document.querySelectorAll(".tab-panel").forEach((p) => { p.hidden = p.id !== id; });
    if (push) { try { history.replaceState(null, "", "#" + id); } catch (e) {} }
  }
  tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab, true)));
  window.addEventListener("hashchange", () => showTab(location.hash.slice(1), false));

  /* ---------- АТОМ ---------- */
  const NAMES = ["", "Водород", "Хелиум", "Литиум", "Берилиум", "Бор", "Јаглерод", "Азот", "Кислород", "Флуор", "Неон",
    "Натриум", "Магнезиум", "Алуминиум", "Силициум", "Фосфор", "Сулфур", "Хлор", "Аргон", "Калиум", "Калциум"];
  const SYM = ["", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca"];
  const MASS = [0, 1, 4, 7, 9, 11, 12, 14, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 40, 39, 40];
  const SUPD = { 0: "⁰", 1: "¹", 2: "²", 3: "³" };
  const atom = { p: 6, n: 6, e: 6 };

  function shellsOf(e) {
    const out = [0, 0, 0, 0];
    let r = e;
    out[0] = Math.min(2, r); r -= out[0];
    out[1] = Math.min(8, r); r -= out[1];
    out[2] = Math.min(8, r); r -= out[2];
    out[3] = r;
    return out;
  }
  function chargeStr(c) {
    if (c === 0) return "";
    const a = Math.abs(c);
    return (a === 1 ? "" : SUPD[a]) + (c > 0 ? "⁺" : "⁻");
  }
  function drawAtom() {
    const svg = $("atom-svg");
    svg.innerHTML = "";
    const cx = 170, cy = 170, R = [62, 98, 132, 160];
    const sh = shellsOf(atom.e);
    let last = 0; sh.forEach((c, k) => { if (c) last = k; });
    const half = Math.max(R[last], 62) + 16;
    svg.setAttribute("viewBox", (cx - half) + " " + (cy - half) + " " + (2 * half) + " " + (2 * half));
    R.forEach((r, k) => { if (k === 0 || sh[k] > 0) s("circle", { cx, cy, r, fill: "none", stroke: "#e2d8cf", "stroke-width": 1.5 }, svg); });
    const N = atom.p + atom.n;
    const nuc = s("g", {}, svg);
    for (let i = 0; i < N; i++) {
      const isP = Math.floor((i + 1) * atom.p / N) - Math.floor(i * atom.p / N) === 1;
      const rr = 5.4 * Math.sqrt(i + 0.5), th = i * 2.39996;
      s("circle", { cx: cx + rr * Math.cos(th), cy: cy + rr * Math.sin(th), r: 5, class: isP ? "dot-p" : "dot-n", stroke: "#fff", "stroke-width": .8 }, nuc);
    }
    sh.forEach((c, k) => {
      if (!c) return;
      const g = s("g", { class: "shell", style: "transform-origin:" + cx + "px " + cy + "px;animation-duration:" + [7, 12, 18, 25][k] + "s;" + (k % 2 ? "animation-direction:reverse" : "") }, svg);
      for (let i = 0; i < c; i++) {
        const a = (2 * Math.PI * i) / c + k;
        s("circle", { cx: cx + R[k] * Math.cos(a), cy: cy + R[k] * Math.sin(a), r: 6.5, class: "dot-e", stroke: "#fff", "stroke-width": 1 }, g);
      }
    });
    // текст
    const c = atom.p - atom.e, nm = NAMES[atom.p], A = atom.p + atom.n;
    let state = c === 0 ? "неутрален атом" : c > 0 ? "позитивен јон (катјон): изгубил " + c + " електрон" + (c > 1 ? "и" : "") : "негативен јон (анјон): примил " + (-c) + " електрон" + (c < -1 ? "и" : "");
    const iso = atom.n === MASS[atom.p] - atom.p ? "најчест изотоп" : "изотоп со различен број неутрони";
    $("atom-read").innerHTML = "<b>" + nm + "-" + A + "</b> (" + SYM[atom.p] + chargeStr(c) + ") · " + state +
      "<br>Z = " + atom.p + " · A = " + A + " · " + iso +
      "<br>Распоред на електрони: " + (sh.filter((x) => x > 0).join(", ") || "нема електрони");
    updCtl();
  }
  const ctlOut = {};
  function buildAtomCtl() {
    const box = $("atom-ctl");
    [["p", "Протони", 1, 20], ["n", "Неутрони", 0, 30], ["e", "Електрони", 0, 20]].forEach((d) => {
      const key = d[0];
      const out = h("output", { text: "0" }); ctlOut[key] = out;
      const minus = h("button", { class: "t-btn round", "aria-label": d[1] + " −", text: "−" });
      const plus = h("button", { class: "t-btn round", "aria-label": d[1] + " +", text: "+" });
      minus.addEventListener("click", () => change(key, -1));
      plus.addEventListener("click", () => change(key, 1));
      box.appendChild(h("div", { class: "ctl" }, [h("span", { text: d[1] }), h("div", { class: "t-row" }, [minus, out, plus])]));
    });
  }
  function updCtl() { ["p", "n", "e"].forEach((k) => { ctlOut[k].textContent = atom[k]; }); }
  function change(k, d) {
    const wasNeutral = atom.e === atom.p;
    atom[k] = Math.max(k === "p" ? 1 : 0, atom[k] + d);
    if (k === "p") { atom.p = Math.min(20, atom.p); if (wasNeutral) atom.e = atom.p; }
    if (k === "n") atom.n = Math.min(30, atom.n);
    atom.e = Math.min(atom.e, Math.min(atom.p + 3, 20));
    drawAtom();
  }
  function buildPresets() {
    const box = $("atom-presets");
    [["H", 1, 0, 1], ["C", 6, 6, 6], ["O", 8, 8, 8], ["Na", 11, 12, 11], ["Na⁺", 11, 12, 10], ["Cl⁻", 17, 18, 18], ["Ca", 20, 20, 20]].forEach((d) => {
      const b = h("button", { class: "t-btn", text: d[0] });
      b.addEventListener("click", () => { atom.p = d[1]; atom.n = d[2]; atom.e = d[3]; drawAtom(); });
      box.appendChild(b);
    });
  }

  /* ---------- pH ---------- */
  const STOPS = [[0, "#d7191c"], [2, "#ef4a2b"], [3, "#f46d43"], [4, "#fb9a29"], [5, "#fdd835"], [6, "#cddc39"], [7, "#43a047"], [8, "#26a69a"], [9, "#1e88e5"], [11, "#3f51b5"], [13, "#7b1fa2"], [14, "#6a1b9a"]];
  function hex2rgb(x) { return [1, 3, 5].map((i) => parseInt(x.substr(i, 2), 16)); }
  function phColor(p) {
    for (let i = 1; i < STOPS.length; i++) {
      if (p <= STOPS[i][0]) {
        const a = STOPS[i - 1], b = STOPS[i], t = (p - a[0]) / (b[0] - a[0]);
        const ca = hex2rgb(a[1]), cb = hex2rgb(b[1]);
        return "rgb(" + ca.map((v, j) => Math.round(v + (cb[j] - v) * t)).join(",") + ")";
      }
    }
    return STOPS[STOPS.length - 1][1];
  }
  const parts = [];
  let phSvg, liquid, phVal = 7, neuTimer = null;
  function buildPh() {
    phSvg = $("ph-svg");
    const defs = s("defs", {}, phSvg);
    const cp = s("clipPath", { id: "ph-clip" }, defs);
    s("rect", { x: 62, y: 80, width: 176, height: 163, rx: 12 }, cp);
    liquid = s("rect", { x: 62, y: 80, width: 176, height: 163, "clip-path": "url(#ph-clip)" }, phSvg);
    s("path", { d: "M60 28 L60 230 Q60 245 75 245 L225 245 Q240 245 240 230 L240 28", fill: "none", stroke: "#64748b", "stroke-width": 4, "stroke-linecap": "round" }, phSvg);
    for (let y = 100; y < 230; y += 40) s("line", { x1: 60, x2: 74, y1: y, y2: y, stroke: "#64748b", "stroke-width": 2 }, phSvg);
    const layer = s("g", { "clip-path": "url(#ph-clip)" }, phSvg);
    for (let i = 0; i < 40; i++) {
      const isH = i < 20;
      const g = s("g", {}, layer);
      s("circle", { r: 8, fill: isH ? "#e11d48" : "#2563eb", stroke: "#fff", "stroke-width": 1.2 }, g);
      const t = s("text", { "text-anchor": "middle", y: 3.5, fill: "#fff", "font-size": 10, "font-weight": 700 }, g);
      t.textContent = isH ? "+" : "−";
      parts.push({ g, isH, x: 80 + Math.random() * 140, y: 100 + Math.random() * 130, vx: (Math.random() - .5) * 1.4, vy: (Math.random() - .5) * 1.4, i: i % 20 });
    }
    const drop = s("circle", { id: "ph-drop", cx: 150, cy: 4, r: 6, fill: "#94a3b8", opacity: 0 }, phSvg);
    $("ph-range").addEventListener("input", (e) => { stopNeu(); setPh(parseFloat(e.target.value)); });
    const box = $("ph-chips");
    [["Желудочна киселина", 1.5], ["Лимон", 2], ["Оцет", 2.9], ["Дожд", 5.6], ["Вода", 7], ["Крв", 7.4], ["Сода бикарбона", 8.3], ["Сапун", 10], ["Амонијак", 11.5], ["Белило", 12.5]].forEach((d) => {
      const b = h("button", { class: "t-btn", text: d[0] });
      b.addEventListener("click", () => { stopNeu(); setPh(d[1]); });
      box.appendChild(b);
    });
    $("neu-btn").addEventListener("click", neutralize);
    setPh(7);
    if (!reduce) requestAnimationFrame(tickPh);
    else parts.forEach(place);
  }
  function place(p) { p.g.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")"); }
  function tickPh() {
    parts.forEach((p) => {
      if (p.g.style.display === "none") return;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 72 || p.x > 228) p.vx *= -1;
      if (p.y < 98 || p.y > 232) p.vy *= -1;
      p.vx += (Math.random() - .5) * .12; p.vy += (Math.random() - .5) * .12;
      p.vx = Math.max(-1.2, Math.min(1.2, p.vx)); p.vy = Math.max(-1.2, Math.min(1.2, p.vy));
      place(p);
    });
    requestAnimationFrame(tickPh);
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function setPh(p) {
    phVal = Math.max(0, Math.min(14, p));
    $("ph-range").value = phVal;
    liquid.setAttribute("fill", phColor(phVal));
    $("ph-big").textContent = "pH " + phVal.toFixed(1);
    const d = 7 - phVal;
    const nH = Math.max(0, Math.round(d >= 0 ? 3 + d * 2.4 : 3 + d * 0.43));
    const nO = Math.max(0, Math.round(d <= 0 ? 3 - d * 2.4 : 3 - d * 0.43));
    parts.forEach((q) => { q.g.style.display = q.i < (q.isH ? nH : nO) ? "" : "none"; if (reduce) place(q); });
    const kind = phVal < 6.95 ? "кисел раствор" : phVal > 7.05 ? "базен раствор" : "неутрален раствор";
    let more = "H⁺ и OH⁻ јоните се во еднаква количина.";
    const ratio = Math.round(Math.pow(10, Math.abs(d)));
    if (d > 0.05) more = "Околу " + fmt(ratio) + " пати повеќе H⁺ јони отколку во чиста вода.";
    else if (d < -0.05) more = "Околу " + fmt(ratio) + " пати помалку H⁺ јони (а повеќе OH⁻) отколку во чиста вода.";
    $("ph-read").innerHTML = "<b>" + kind + "</b><br>" + more;
  }
  function stopNeu() { if (neuTimer) { clearInterval(neuTimer); neuTimer = null; } $("ph-drop").setAttribute("opacity", 0); $("ph-drop").classList.remove("drip"); }
  function neutralize() {
    stopNeu();
    const out = $("neu-read");
    if (Math.abs(phVal - 7) < 0.15) { out.textContent = "Растворот е веќе неутрален. Помести го лизгачот на киселина или база."; return; }
    const acid = phVal < 7;
    const drop = $("ph-drop");
    drop.setAttribute("fill", acid ? "#2563eb" : "#e11d48");
    if (!reduce) { drop.setAttribute("opacity", 1); drop.classList.add("drip"); }
    out.innerHTML = acid ? "Додаваме база (NaOH) капка по капка…<br><b>HCl + NaOH → NaCl + H₂O</b>" : "Додаваме киселина (HCl) капка по капка…<br><b>NaOH + HCl → NaCl + H₂O</b>";
    neuTimer = setInterval(() => {
      const step = reduce ? 0.5 : 0.1;
      const nv = acid ? Math.min(7, phVal + step) : Math.max(7, phVal - step);
      setPh(nv);
      if (Math.abs(nv - 7) < 0.001) {
        stopNeu();
        out.innerHTML = "<b>Неутрализирано! pH = 7.</b><br>H⁺ и OH⁻ се споиле во вода (H₂O), а останала е солта NaCl.";
      }
    }, reduce ? 150 : 90);
  }

  /* ---------- Врски ---------- */
  function player(svgId, btnId, readId, caps) {
    const svg = $(svgId), btn = $(btnId), out = $(readId);
    let timers = [];
    function set(i) { svg.setAttribute("data-step", i); out.innerHTML = caps[i]; }
    function reset() { timers.forEach(clearTimeout); timers = []; set(0); }
    btn.addEventListener("click", () => {
      reset();
      btn.textContent = "↺ Повтори";
      const t = reduce ? [0, 0] : [250, 2700];
      timers.push(setTimeout(() => set(1), t[0]));
      timers.push(setTimeout(() => set(2), t[1] + (reduce ? 0 : 0)));
    });
    set(0);
  }
  player("ion-svg", "ion-btn", "ion-read", [
    "Натриумот (Na) има 1 електрон во последната обвивка, а хлорот (Cl) – 7. Хлорот му недостига само еден!",
    "Na го предава својот електрон на Cl. Сега Na е <b>Na⁺</b> (катјон), а Cl е <b>Cl⁻</b> (анјон).",
    "Спротивните полнежи се привлекуваат: Na⁺ и Cl⁻ се врзани со <b>јонска врска</b> – така настанува кујнската сол, <b>NaCl</b>."
  ]);
  player("cov-svg", "cov-btn", "cov-read", [
    "Секој водороден атом има 1 електрон, а би сакал да има 2 (како хелиумот).",
    "Ниеден не сака да го предаде електронот, па атомите се приближуваат една кон друга.",
    "Споделуваат еден електронски пар: секој атом го „брои“ и двата електрона како свои. Тоа е <b>ковалентна врска</b>, молекулата <b>H₂</b>."
  ]);

  // Метална
  (function metal() {
    const svg = $("met-svg");
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
      const g = s("g", { transform: "translate(" + (62 + c * 56) + " " + (52 + r * 58) + ")" }, svg);
      s("circle", { r: 17, fill: "#fbbf24", stroke: "#d97706", "stroke-width": 1.5 }, g);
      const t = s("text", { "text-anchor": "middle", y: 5, "font-size": 14, "font-weight": 700, fill: "#2a1f2d" }, g);
      t.textContent = "+";
    }
    const arrow = s("text", { x: 200, y: 214, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#9a3412", opacity: 0 }, svg);
    arrow.textContent = "− електрони се движат кон + →";
    const els = [];
    for (let i = 0; i < 24; i++) {
      const c = s("circle", { r: 4.5, fill: "#2563eb" }, svg);
      els.push({ c, x: 20 + Math.random() * 360, y: 12 + Math.random() * 196, a: Math.random() * 6.28 });
    }
    let on = false;
    function tick() {
      els.forEach((e) => {
        e.a += (Math.random() - .5) * .8;
        e.x += Math.cos(e.a) * 1.3 + (on ? 1.6 : 0);
        e.y += Math.sin(e.a) * 1.3;
        if (e.x > 392) e.x = 8; if (e.x < 8) e.x = 392;
        if (e.y < 8) e.y = 8; if (e.y > 212) e.y = 212;
        e.c.setAttribute("cx", e.x.toFixed(1)); e.c.setAttribute("cy", e.y.toFixed(1));
      });
      if (!reduce) requestAnimationFrame(tick);
    }
    tick();
    $("met-btn").addEventListener("click", function () {
      on = !on;
      this.textContent = on ? "⏹ Исклучи напон" : "🔋 Вклучи напон";
      this.classList.toggle("on", on);
      arrow.setAttribute("opacity", on ? 1 : 0);
      $("met-read").innerHTML = on ? "Со напон електроните се движат во иста насока: тоа е <b>електрична струја</b>. Затоа металите ја спроведуваат." : "Електроните слободно талкаат меѓу металните јони.";
      if (reduce) tick();
    });
  })();

  /* ---------- Периоден систем ---------- */
  const EL = [
    [1, "H", "Водород"], [2, "He", "Хелиум"], [3, "Li", "Литиум"], [4, "Be", "Берилиум"], [5, "B", "Бор"], [6, "C", "Јаглерод"],
    [7, "N", "Азот"], [8, "O", "Кислород"], [9, "F", "Флуор"], [10, "Ne", "Неон"], [11, "Na", "Натриум"], [12, "Mg", "Магнезиум"],
    [13, "Al", "Алуминиум"], [14, "Si", "Силициум"], [15, "P", "Фосфор"], [16, "S", "Сулфур"], [17, "Cl", "Хлор"], [18, "Ar", "Аргон"],
    [19, "K", "Калиум"], [20, "Ca", "Калциум"], [21, "Sc", "Скандиум"], [22, "Ti", "Титан"], [23, "V", "Ванадиум"], [24, "Cr", "Хром"],
    [25, "Mn", "Манган"], [26, "Fe", "Железо"], [27, "Co", "Кобалт"], [28, "Ni", "Никел"], [29, "Cu", "Бакар"], [30, "Zn", "Цинк"],
    [31, "Ga", "Галиум"], [32, "Ge", "Германиум"], [33, "As", "Арсен"], [34, "Se", "Селен"], [35, "Br", "Бром"], [36, "Kr", "Криптон"]
  ];
  const CAT = {
    alk: ["Алкални метали", "c-alk"], ear: ["Земноалкални метали", "c-ear"], tr: ["Преодни елементи", "c-tr"], met: ["Други метали", "c-met"],
    semi: ["Полуметали", "c-semi"], non: ["Неметали", "c-non"], hal: ["Халогени елементи", "c-hal"], nob: ["Благородни гасови", "c-nob"]
  };
  function catOf(z) {
    if ([3, 11, 19].includes(z)) return "alk";
    if ([4, 12, 20].includes(z)) return "ear";
    if (z >= 21 && z <= 30) return "tr";
    if ([13, 31].includes(z)) return "met";
    if ([5, 14, 32, 33].includes(z)) return "semi";
    if ([9, 17, 35].includes(z)) return "hal";
    if ([2, 10, 18, 36].includes(z)) return "nob";
    return "non";
  }
  // позиции: [периода, група]
  const POS = {};
  EL.forEach((e) => {
    const z = e[0];
    let per, grp;
    if (z <= 2) { per = 1; grp = z === 1 ? 1 : 18; }
    else if (z <= 18) { per = z <= 10 ? 2 : 3; const k = z - (z <= 10 ? 2 : 10); grp = k <= 2 ? k : k + 10; }
    else { per = 4; grp = z - 18; }
    POS[z] = [per, grp];
  });
  function valence(z) {
    const g = POS[z][1];
    if (g >= 3 && g <= 12) return "различен број (преоден елемент)";
    if (z === 2) return 2;
    return g <= 2 ? g : g - 10;
  }
  let ptSel = 0, ptFilter = "all";
  const ptBtn = {};
  function buildPt() {
    const grid = $("pt");
    for (let per = 1; per <= 4; per++) {
      for (let g = 1; g <= 18; g++) {
        const z = Object.keys(POS).find((k) => POS[k][0] === per && POS[k][1] === g);
        if (!z) { grid.appendChild(h("div", { class: "gap" })); continue; }
        const e = EL[z - 1];
        const b = h("button", { class: CAT[catOf(+z)][1], text: e[1], title: e[2], "aria-label": e[2] + ", " + e[1] });
        b.addEventListener("click", () => selEl(+z));
        ptBtn[z] = b;
        grid.appendChild(b);
      }
    }
    const leg = $("pt-leg");
    Object.keys(CAT).forEach((k) => leg.appendChild(h("span", { html: '<i class="' + CAT[k][1] + '"></i>' + CAT[k][0] })));
    const fb = $("pt-filters");
    const filters = [["all", "Сите"], ["g1", "Група 1"], ["g2", "Група 2"], ["g17", "Група 17"], ["g18", "Група 18"], ["p2", "Периода 2"], ["p3", "Периода 3"], ["tr", "Преодни"]];
    filters.forEach((f) => {
      const b = h("button", { class: "t-btn" + (f[0] === "all" ? " on" : ""), text: f[1] });
      b.addEventListener("click", () => {
        ptFilter = f[0];
        Array.from(fb.children).forEach((x) => x.classList.toggle("on", x === b));
        applyFilter();
      });
      fb.appendChild(b);
    });
    selEl(11);
  }
  function inFilter(z) {
    const f = ptFilter, p = POS[z];
    if (f === "all") return true;
    if (f === "tr") return catOf(z) === "tr";
    if (f[0] === "g") return p[1] === +f.slice(1);
    return p[0] === +f.slice(1);
  }
  function applyFilter() { Object.keys(ptBtn).forEach((z) => ptBtn[z].classList.toggle("dim", !inFilter(+z))); }
  function selEl(z) {
    if (ptSel) ptBtn[ptSel].classList.remove("sel");
    ptSel = z; ptBtn[z].classList.add("sel");
    const e = EL[z - 1], c = CAT[catOf(z)];
    $("el-card").innerHTML = "";
    $("el-card").appendChild(h("div", { class: "el-big " + c[1], html: "<small>" + z + "</small><span>" + e[1] + "</span>" }));
    $("el-card").appendChild(h("div", { class: "el-info", html: "<b>" + e[2] + "</b><br>" + c[0] + "<br>Група " + POS[z][1] + " · Периода " + POS[z][0] + "<br>Валентни електрони: " + valence(z) }));
  }

  /* ---------- Мини квизови ---------- */
  const QUIZ = {
    atom: [
      ["Која честичка одредува за кој елемент станува збор?", ["Протоните", "Неутроните", "Електроните"], 0, "Бројот на протони е атомскиот број Z: секој елемент има свој број."],
      ["Атом на натриум има 11 протони. Колку електрони има неутралниот атом?", ["1", "11", "23"], 1, "Во неутрален атом бројот на електрони е еднаков на бројот на протони."],
      ["Што се случува кога Na станува Na⁺?", ["Добива електрон", "Губи електрон", "Губи протон"], 1, "Позитивен јон настанува кога атомот изгуби електрон."],
      ["Атоми од ист елемент со различен број неутрони се…", ["Јони", "Изотопи", "Молекули"], 1, "Изотопите имаат ист број протони, но различен број неутрони."]
    ],
    kiselini: [
      ["Раствор со pH 3 е…", ["кисел", "базен", "неутрален"], 0, "pH помало од 7 значи кисел раствор."],
      ["Колку пати повеќе H⁺ јони има раствор со pH 3 од раствор со pH 4?", ["2 пати", "10 пати", "100 пати"], 1, "pH скалата е логаритамска: секоја единица е 10 пати."],
      ["Фенолфталеинот во базен раствор станува…", ["розев", "жолт", "останува безбоен"], 0, "Во база фенолфталеинот е розев, во киселина и неутрално безбоен."],
      ["Што настанува при реакцијата HCl + NaOH?", ["NaCl + H₂O", "NaH + ClOH", "Na + HCl"], 0, "Неутрализација: киселина + база → сол + вода."]
    ],
    vrski: [
      ["Каква врска има во натриум хлоридот (NaCl)?", ["Ковалентна", "Јонска", "Метална"], 1, "Метал (Na) предава електрон на неметал (Cl): јонска врска."],
      ["Што се случува кај ковалентна врска?", ["Атомите споделуваат електронски пар", "Еден атом го губи електронот", "Електроните се слободни во „море“"], 0, "Ковалентна врска = заеднички електронски парови."],
      ["Зошто металите добро спроведуваат струја?", ["Имаат многу неутрони", "Имаат слободни електрони", "Се јонски соединенија"], 1, "Електроните слободно се движат меѓу катјоните."],
      ["Кој атом најлесно прима електрон?", ["Хлор", "Натриум", "Неон"], 0, "Хлорот има 7 валентни електрони и му недостига уште еден."]
    ],
    periodenSistem: [
      ["Колку групи (колони) има периодниот систем?", ["7", "18", "8"], 1, "Има 18 групи и 7 периоди."],
      ["Што е заедничко за елементите од иста група?", ["Ист број валентни електрони", "Иста маса", "Ист број неутрони"], 0, "Затоа имаат слични хемиски својства."],
      ["Кои елементи се благородни гасови?", ["Хелиум, неон, аргон", "Литиум, натриум, калиум", "Флуор, хлор, бром"], 0, "Благородните гасови се во група 18 и имаат полна последна обвивка."],
      ["Во која група е калиумот (K)?", ["1", "2", "17"], 0, "Калиумот е алкален метал, група 1."]
    ]
  };
  document.querySelectorAll(".mq").forEach((box) => {
    const qs = QUIZ[box.dataset.quiz];
    let i = 0, score = 0;
    function render() {
      box.innerHTML = "";
      if (i >= qs.length) {
        box.appendChild(h("h4", { text: "Мини квиз – резултат" }));
        box.appendChild(h("p", { class: "q", text: score + " од " + qs.length + (score === qs.length ? " – одлично! 🎉" : " – пробај пак!") }));
        const b = h("button", { class: "t-btn", text: "↺ Повтори" });
        b.addEventListener("click", () => { i = 0; score = 0; render(); });
        box.appendChild(b);
        return;
      }
      const q = qs[i];
      box.appendChild(h("h4", { text: "Мини квиз · " + (i + 1) + "/" + qs.length }));
      box.appendChild(h("p", { class: "q", text: q[0] }));
      const opts = h("div", { class: "opts" });
      const why = h("p", { class: "why" });
      const nxt = h("button", { class: "t-btn nxt", text: i + 1 < qs.length ? "Следно →" : "Резултат →", hidden: "" });
      q[1].forEach((t, k) => {
        const b = h("button", { class: "opt", text: t });
        b.addEventListener("click", () => {
          Array.from(opts.children).forEach((o, j) => { o.disabled = true; if (j === q[2]) o.classList.add("good"); });
          if (k === q[2]) score++; else b.classList.add("bad");
          why.textContent = (k === q[2] ? "✔ Точно! " : "✘ Не точно. ") + q[3];
          nxt.hidden = false;
        });
        opts.appendChild(b);
      });
      nxt.addEventListener("click", () => { i++; render(); });
      box.appendChild(opts); box.appendChild(why); box.appendChild(nxt);
    }
    render();
  });

  /* ---------- Старт ---------- */
  buildAtomCtl(); buildPresets(); drawAtom();
  buildPh(); buildPt();
  showTab(location.hash.slice(1) || "atom", false);
})();
