// Виртуелна лабораторија: епрувета со катјон + реагенс (податоците се во reakcii.js)
(function () {
  const $ = id => document.getElementById(id);
  const catBox = $("ep-cations");
  if (!catBox || typeof REAKCII === "undefined") return;
  const reagBox = $("ep-reagents"), info = $("ep-info"), svg = $("ep-svg");
  const liquid = $("ep-liquid"), turb = $("ep-turb"), pptG = $("ep-ppt"), bubG = $("ep-bubbles");
  const dropsG = $("ep-drops"), tubeScene = $("ep-tube"), flameScene = $("ep-flamescene");
  const flameOut = $("ep-flame-out"), flameIn = $("ep-flame-in"), label = $("ep-label");
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = ms => (reduce ? Math.min(ms, 60) : ms);

  const NS = "http://www.w3.org/2000/svg";
  const WATER = "#cfe6f5";
  let cat = null, rg = null, cur = null, token = 0, reacted = false, timers = [];

  // режим „непознат раствор“
  const learnBox = $("ep-learn"), quizSetup = $("ep-quizsetup"), quizBox = $("ep-quiz"), rgHead = $("ep-rg-h");
  const modeBtns = document.querySelectorAll(".ep-mode"), grpSel = $("ep-group-sel"), newBtn = $("ep-new");
  let mode = "learn", unknown = null, log = [], answers = {}, sel = "", done = false, lastId = null;

  const find = (i, r) => REAKCII.find(x => x.ion === i && x.r === r);
  const later = (fn, ms) => { const t = token; timers.push(setTimeout(() => { if (t === token) fn(); }, T(ms))); };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---------- избор на катјон ----------
  const order = ["I", "IIa", "IIb", "III", "IV", "V", "VI"];
  const catBtns = {};
  order.forEach(g => {
    const wrap = el("div", "ep-group");
    wrap.appendChild(el("div", "ep-group-t", GRUPI[g].name));
    const row = el("div", "ep-chips");
    KATJONI.filter(k => k.group === g).forEach(k => {
      const b = el("button", "ep-cat", k.ion);
      b.type = "button";
      b.title = k.name;
      b.addEventListener("click", () => pickCat(k.id));
      row.appendChild(b);
      catBtns[k.id] = b;
    });
    wrap.appendChild(row);
    catBox.appendChild(wrap);
  });

  function pickCat(id) {
    cat = KATJONI.find(k => k.id === id);
    rg = null;
    Object.keys(catBtns).forEach(k => catBtns[k].classList.toggle("active", k === id));
    buildReagents();
    resetTube();
    info.replaceChildren(
      el("p", "ep-hint", `Во епруветата е растворот на ${cat.ion} (${cat.name}). Избери реагенс за да го додадеш.`),
      el("p", "ep-hint small", `${GRUPI[cat.group].name}. ${GRUPI[cat.group].hint}.`)
    );
  }

  function buildReagents() {
    reagBox.replaceChildren();
    GRUPI[cat.group].reagents.forEach(r => {
      const x = find(cat.id, r);
      const b = el("button", "ep-rg" + (x ? "" : " muted") + (x && x.star ? " star" : ""));
      b.type = "button";
      b.dataset.r = r;
      b.append(el("span", "ep-rg-f", REAGENSI[r].label + (x && x.star ? " ★" : "")), el("span", "ep-rg-n", REAGENSI[r].name));
      b.addEventListener("click", () => react(r));
      reagBox.appendChild(b);
    });
  }

  // ---------- епрувета ----------
  function baseColor() { return cat && cat.sol ? [cat.sol, 0.78] : [WATER, 0.55]; }
  function setLiquid(color, op) { liquid.style.fill = color; liquid.style.fillOpacity = op; }

  function resetTube() {
    token++; timers.forEach(clearTimeout); timers = [];
    pptG.replaceChildren(); bubG.replaceChildren(); dropsG.replaceChildren();
    turb.style.opacity = 0;
    tubeScene.style.display = ""; flameScene.style.display = "none";
    const [c, o] = baseColor();
    setLiquid(c, o);
    label.textContent = mode === "quiz" ? (unknown ? "?" : "") : (cat ? cat.ion : "");
    cur = null; reacted = false;
    document.querySelectorAll(".ep-rg").forEach(b => b.classList.remove("active"));
  }

  function drops(color, n, done) {
    for (let i = 0; i < n; i++) {
      const c = sv("circle", { cx: 140, cy: 108, r: 4.5, fill: color, stroke: "#6f9bc2", "stroke-width": 1 });
      dropsG.appendChild(c);
      const a = c.animate([{ transform: "translateY(0)", opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: "translateY(68px)", opacity: 1 }],
        { duration: T(520), delay: T(i * 300), easing: "ease-in", fill: "forwards" });
      a.onfinish = () => { c.remove(); ripple(); };
    }
    later(done, n * 300 + 560);
  }
  function ripple() {
    const r = sv("ellipse", { cx: 140, cy: 176, rx: 4, ry: 1.5, fill: "none", stroke: "#ffffff", "stroke-width": 1.2 });
    dropsG.appendChild(r);
    const a = r.animate([{ transform: "scale(1)", opacity: 0.9 }, { transform: "scale(9,3)", opacity: 0 }], { duration: T(600), transformOrigin: "140px 176px" });
    a.onfinish = () => r.remove();
  }

  function precipitate(hex, stages) {
    const N = 110, parts = [];
    turb.style.fill = hex;
    turb.style.opacity = 0;
    turb.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.2 }, { opacity: 0.1 }], { duration: T(4200), fill: "forwards" });
    for (let i = 0; i < N; i++) {
      const r = rnd(2.6, 5.2);
      const y1 = rnd(285, 312);                                   // каде паѓа
      const hw = y1 > 270 ? Math.sqrt(Math.max(0, 45 * 45 - (y1 - 270) ** 2)) : 45;
      const x1 = rnd(140 - hw + r, 140 + hw - r);
      const x0 = rnd(103, 177), y0 = rnd(182, 262);
      const c = sv("circle", { cx: x0, cy: y0, r, fill: hex, stroke: "rgba(0,0,0,.18)", "stroke-width": 0.6 });
      c.style.transition = "fill 1.2s";
      c.style.opacity = 0;
      pptG.appendChild(c);
      parts.push(c);
      const dur = rnd(2400, 4400), delay = rnd(0, 900);
      c.animate([{ transform: "translate(0,0)", opacity: 0 }, { opacity: 0.95, offset: 0.12 }, { transform: `translate(${x1 - x0}px,${y1 - y0}px)`, opacity: 1 }],
        { duration: T(dur), delay: T(delay), easing: "cubic-bezier(.3,.1,.5,1)", fill: "forwards" });
    }
    if (stages && stages.length > 1) {
      stages.slice(1).forEach((col, k) => later(() => { parts.forEach(c => (c.style.fill = col)); turb.style.fill = col; }, 1800 + k * 2200));
    }
    return parts;
  }

  function bubbles(n) {
    for (let i = 0; i < n; i++) {
      const c = sv("circle", { cx: rnd(108, 172), cy: 300, r: rnd(1.8, 4), fill: "rgba(255,255,255,.75)", stroke: "rgba(255,255,255,.95)", "stroke-width": 0.6 });
      bubG.appendChild(c);
      c.animate([{ transform: "translateY(0)", opacity: 0 }, { opacity: 1, offset: 0.1 }, { transform: `translateY(${-rnd(120, 150)}px)`, opacity: 0 }],
        { duration: T(rnd(1400, 2400)), delay: T(rnd(0, 1800)), iterations: 3 });
    }
  }

  function flame(hex) {
    tubeScene.style.display = "none"; flameScene.style.display = "";
    flameOut.style.fill = hex; flameIn.style.fill = "#fff6d8";
    [flameOut, flameIn].forEach(f => {
      f.getAnimations().forEach(a => a.cancel());
      f.animate([{ transform: "scale(.15,.1)", opacity: 0 }, { transform: "scale(1,1)", opacity: 1, offset: 0.35 }, { transform: "scale(1,1)", opacity: 1 }], { duration: T(900), fill: "forwards" });
      later(() => f.animate([{ transform: "scale(1,1)" }, { transform: "scale(.96,1.07)" }, { transform: "scale(1.03,.97)" }, { transform: "scale(1,1)" }], { duration: T(520), iterations: Infinity }), 900);
    });
  }

  // ---------- реакција ----------
  function badge(x) {
    const k = x ? x.kind : "none";
    const txt = { ppt: "Талог", soln: "Промена на боја", gas: "Гас", flame: "Пламен", none: "Нема промена" }[k];
    return el("span", "ep-badge " + k, txt);
  }

  function react(r) {
    if (!cat) return;
    resetTube();
    rg = r;
    document.querySelectorAll(".ep-rg").forEach(b => b.classList.toggle("active", b.dataset.r === r));
    const x = find(cat.id, r);
    cur = x;
    info.replaceChildren(el("p", "ep-hint", "Се додава реагенсот…"));
    if (x && x.kind === "flame") { later(() => { flame(x.hex); showInfo(x); }, 100); return; }
    drops("#cfe6f5", 5, () => {
      if (!x) { showInfo(null); return; }
      if (x.soln) setLiquid(x.soln, 0.82);
      if (x.kind === "ppt") { precipitate(x.hex, x.stages); }
      if (x.kind === "soln") { setLiquid(x.soln || x.hex, 0.85); }
      if (x.gas || x.kind === "gas") bubbles(26);
      reacted = true;
      later(() => showInfo(x), 700);
    });
  }

  function showInfo(x) {
    if (mode === "quiz") { showQuizInfo(x); return; }
    const box = document.createDocumentFragment();
    const head = el("div", "ep-title");
    head.append(el("span", "", `${cat.ion} + ${REAGENSI[rg].label}`), badge(x));
    if (x && x.star) { const s = el("span", "ep-star", "★ кључна реакција"); s.title = "Групен реагенс или реакција за идентификација"; head.appendChild(s); }
    box.appendChild(head);
    if (!x) {
      box.appendChild(el("p", "ep-obs", "Нема реакција."));
    } else {
      if (x.kind !== "flame" && x.prod) {
        const p = el("div", "ep-prod");
        const sw = el("span", "ep-sw");
        sw.style.background = x.hex || x.soln || WATER;
        p.append(sw, el("b", "", x.prod), el("span", "ep-col", x.col ? ` · ${x.col}${x.kind === "ppt" ? " талог" : x.kind === "soln" ? " раствор" : ""}` : ""));
        box.appendChild(p);
      }
      let obs = x.obs;
      if (!obs) obs = x.kind === "ppt" ? `Се образува ${x.col} талог од ${x.prod}.` : x.kind === "soln" ? `Растворот добива ${x.col} боја (${x.prod}).` : x.kind === "gas" ? `Се ослободува гас (${x.gas}).` : "";
      box.appendChild(el("p", "ep-obs", obs));
      if (x.eq.length) {
        const eqs = el("div", "ep-eqs");
        x.eq.forEach(e => eqs.appendChild(el("div", "ep-eq", e)));
        box.appendChild(eqs);
      }
      if (x.note) box.appendChild(el("p", "ep-note", x.note));
      if (x.excess) {
        const b = el("button", "btn ghost ep-excess", "➕ " + x.excess.label);
        b.type = "button";
        b.addEventListener("click", () => doExcess(x, b));
        box.appendChild(b);
      }
    }
    const row = el("div", "ep-foot");
    const clr = el("button", "btn ghost", "🧹 Исчисти епрувета");
    clr.type = "button";
    clr.addEventListener("click", () => { resetTube(); rg = null; info.replaceChildren(el("p", "ep-hint", `Епруветата е исчистена: повторно има раствор на ${cat.ion}.`)); });
    row.appendChild(clr);
    row.appendChild(el("span", "ep-src", `Извор: Практикум, ${GRUPI[cat.group].table} (${GRUPI[cat.group].name})`));
    box.appendChild(row);
    info.replaceChildren(box);
  }

  function doExcess(x, btn) {
    const ex = x.excess;
    btn.disabled = true;
    drops("#cfe6f5", 5, () => {
      const parts = [...pptG.children];
      if (ex.kind === "dissolve") {
        parts.forEach(c => c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T(rnd(1200, 2200)), delay: T(rnd(0, 500)), fill: "forwards" }));
        turb.animate([{ opacity: 0.1 }, { opacity: 0 }], { duration: T(1500), fill: "forwards" });
        const [c, o] = ex.soln ? [ex.soln, 0.85] : baseColor();
        setLiquid(c, o);
      } else {
        parts.forEach(c => (c.style.fill = ex.hex));
        turb.style.fill = ex.hex;
      }
      later(() => {
        const box = el("div", "ep-after");
        if (mode === "quiz") {
          const t = ex.kind === "dissolve" ? "Талогот се раствора." : "Талогот ја менува бојата.";
          box.appendChild(el("p", "ep-obs", t));
          const en = log.find(e => e.x === x);
          if (en) { en.excess = t; renderQuiz(); }
        } else {
          box.appendChild(el("p", "ep-obs", ex.obs));
          const eqs = el("div", "ep-eqs");
          ex.eq.forEach(e => eqs.appendChild(el("div", "ep-eq", e)));
          box.appendChild(eqs);
        }
        btn.replaceWith(box);
      }, 1500);
    });
  }

  // =====================================================
  //  РЕЖИМ „НЕПОЗНАТ РАСТВОР“
  // =====================================================
  const SUBS = "₀₁₂₃₄₅₆₇₈₉";
  const CYR = { "А": "A", "В": "B", "С": "C", "Е": "E", "Н": "H", "К": "K", "М": "M", "О": "O", "Р": "P", "Т": "T", "Х": "X", "а": "a", "с": "c", "е": "e", "о": "o", "р": "p", "х": "x" };
  function normFormula(s) {
    s = (s || "").trim().replace(/[₀-₉]/g, c => String(SUBS.indexOf(c)));
    s = s.replace(/[А-Яа-я]/g, c => CYR[c] || c).replace(/[·↓\s]/g, "").replace(/\[/g, "(").replace(/\]/g, ")");
    return s.split(/\+(?=[A-Za-z(])/).map(p => p.replace(/[+\-⁺⁻]+$/, "")).filter(Boolean).sort().join("+");
  }
  const sameFormula = (a, b) => { const x = normFormula(a); return x !== "" && x === normFormula(b); };

  function allReagentKeys() {
    const seen = [];
    order.forEach(g => GRUPI[g].reagents.forEach(r => { if (seen.indexOf(r) < 0) seen.push(r); }));
    return seen;
  }

  // Категории на реагенси (за да нема многу скролање)
  const RG_CATS = [
    ["Киселини и бази", ["HCl", "H2SO4", "HClO4", "tartaric", "NaOH", "NH4OH"]],
    ["Сулфиди", ["H2S", "NH42S"]],
    ["Карбонати, фосфати, сулфати", ["Na2CO3", "Na2HPO4", "MgPhos", "C2O4", "CaSO4"]],
    ["Халогениди и хромати", ["KI", "NH4Br", "K2CrO4", "K2Cr2O7", "AgNO3", "HgCl2"]],
    ["Цијаниди и тиоцијанати", ["KCN", "K4FeCN6", "K3FeCN6", "KSCN", "NH4SCN", "HgSCN4"]],
    ["Комплексни и органски", ["DMG", "K2HgI4", "CoNO32", "KNO2", "NaCoNO2", "H2PtCl6", "KH2SbO4", "UO2Ac"]],
    ["Редукциони и оксидациони", ["SnCl2", "Na2SnO2", "Zn", "H2O2", "S2O8", "PbO2"]],
    ["Пламен, вода, останато", ["Flame", "H2O", "CH3COONa"]]
  ];
  let rgCat = 0, rgQuery = "";
  const rgTools = el("div", "ep-rgtools");
  const rgChips = el("div", "ep-chips");
  const rgSearch = el("input", "pt-search ep-rgsearch");
  rgSearch.type = "search"; rgSearch.placeholder = "Барај реагенс: формула или име"; rgSearch.autocomplete = "off";
  rgSearch.setAttribute("aria-label", "Барај реагенс");
  rgSearch.addEventListener("input", () => { rgQuery = rgSearch.value.trim().toLowerCase(); renderReagents(); });
  rgTools.append(rgChips, rgSearch);
  rgTools.hidden = true;
  reagBox.parentNode.insertBefore(rgTools, reagBox);

  function catKeys(i) { return RG_CATS[i][1].filter(r => REAGENSI[r]); }
  function ungrouped() {
    const known = new Set(RG_CATS.flatMap(c => c[1]));
    return allReagentKeys().filter(r => !known.has(r));
  }

  function renderChips() {
    rgChips.replaceChildren();
    RG_CATS.forEach((c, i) => {
      const used = catKeys(i).filter(r => log.some(e => e.r === r)).length;
      const b = el("button", "ep-cat ep-catsm" + (i === rgCat && !rgQuery ? " active" : ""), c[0] + (used ? ` (${used}✓)` : ""));
      b.type = "button";
      b.addEventListener("click", () => { rgCat = i; rgQuery = ""; rgSearch.value = ""; renderChips(); renderReagents(); });
      rgChips.appendChild(b);
    });
  }

  function renderReagents() {
    reagBox.replaceChildren();
    let keys;
    if (rgQuery) {
      keys = allReagentKeys().filter(r => (r + " " + REAGENSI[r].label + " " + REAGENSI[r].name).toLowerCase().includes(rgQuery));
    } else {
      keys = catKeys(rgCat).concat(rgCat === RG_CATS.length - 1 ? ungrouped() : []);
    }
    if (!keys.length) { reagBox.appendChild(el("p", "ep-hint small", "Нема таков реагенс.")); return; }
    keys.forEach(r => {
      const b = el("button", "ep-rg" + (log.some(e => e.r === r) ? " used" : "") + (rg === r ? " active" : ""));
      b.type = "button";
      b.dataset.r = r;
      b.disabled = done;
      b.append(el("span", "ep-rg-f", REAGENSI[r].label), el("span", "ep-rg-n", REAGENSI[r].name));
      b.addEventListener("click", () => react(r));
      reagBox.appendChild(b);
    });
  }

  function buildAllReagents() {
    rgTools.hidden = false;
    rgCat = 0; rgQuery = ""; rgSearch.value = "";
    renderChips();
    renderReagents();
  }
  function markUsed() {
    document.querySelectorAll(".ep-rg").forEach(b => b.classList.toggle("used", log.some(e => e.r === b.dataset.r)));
    if (!rgTools.hidden) renderChips();
  }

  // Набљудување без да се открие катјонот или формулата
  function neutralObs(x) {
    if (!x) return "Нема видлива промена.";
    if (x.kind === "flame") return x.obs;
    if (x.kind === "ppt") return `Се образува ${x.col} талог` + (x.gas ? " и се ослободува гас." : ".");
    if (x.kind === "soln") return x.col ? `Растворот добива ${x.col} боја.` : "Растворот ја менува бојата.";
    if (x.kind === "gas") return "Се ослободува гас (проверка: мирис, влажна лакмус хартија).";
    return "";
  }

  function setMode(m) {
    mode = m;
    modeBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === m));
    learnBox.hidden = m !== "learn";
    quizSetup.hidden = m !== "quiz";
    quizBox.hidden = m !== "quiz";
    rgTools.hidden = true;
    cat = null; rg = null; unknown = null; log = []; answers = {}; sel = ""; done = false;
    Object.keys(catBtns).forEach(k => catBtns[k].classList.remove("active"));
    quizBox.replaceChildren();
    info.replaceChildren();
    resetTube();
    if (m === "learn") {
      rgHead.textContent = "2. Избери реагенс";
      reagBox.replaceChildren(el("p", "ep-hint small", "Прво избери катјон."));
      info.appendChild(el("p", "ep-hint", "1. Избери катјон од списокот. 2. Избери реагенс и погледни што се случува во епруветата. Затемнетите полиња од практикумот се означени со ★."));
    } else {
      rgHead.textContent = "Реагенси";
      reagBox.replaceChildren(el("p", "ep-hint small", "Притисни „Нов непознат раствор“ за да почнеш."));
      info.appendChild(el("p", "ep-hint", "Добиваш епрувета со непознат раствор што содржи еден катјон. Додавај реагенси, набљудувај и запишувај. На крај погоди го катјонот и напиши ги формулите на талозите."));
    }
  }

  function newUnknown() {
    const g = grpSel.value;
    let pool = KATJONI.filter(k => g === "all" || k.group === g);
    if (pool.length > 1) pool = pool.filter(k => k.id !== lastId);
    const k = pool[Math.floor(Math.random() * pool.length)];
    lastId = k.id;
    cat = unknown = k; rg = null; log = []; answers = {}; sel = ""; done = false;
    resetTube();
    buildAllReagents();
    info.replaceChildren(
      el("p", "ep-hint", "Во епруветата е непознат раствор. Додавај реагенси еден по еден (секој пат се користи свеж дел од растворот)."),
      el("p", "ep-hint small", g === "all" ? "Катјонот може да биде од која било група." : `Катјонот е од: ${GRUPI[g].name}.`)
    );
    renderQuiz();
  }

  function showQuizInfo(x) {
    const entry = { r: rg, x: x || null, excess: null };
    const i = log.findIndex(e => e.r === rg);
    if (i >= 0) log[i] = entry; else log.push(entry);
    markUsed();
    const box = document.createDocumentFragment();
    const head = el("div", "ep-title");
    head.append(el("span", "", `Непознат раствор + ${REAGENSI[rg].label}`), badge(x));
    box.appendChild(head);
    if (x && x.kind === "ppt") {
      const p = el("div", "ep-prod");
      const sw = el("span", "ep-sw"); sw.style.background = x.hex;
      p.append(sw, el("span", "ep-col", `${x.col} талог`));
      box.appendChild(p);
    }
    box.appendChild(el("p", "ep-obs", neutralObs(x)));
    if (x && x.excess) {
      const lab = /уште/.test(x.excess.label) ? "Додај уште од реагенсот" : x.excess.label;
      const b = el("button", "btn ghost ep-excess", "➕ " + lab);
      b.type = "button";
      b.addEventListener("click", () => doExcess(x, b));
      box.appendChild(b);
    }
    box.appendChild(el("p", "ep-hint small", "Резултатот е запишан во дневникот подолу."));
    const row = el("div", "ep-foot");
    const clr = el("button", "btn ghost", "🧹 Нова епрувета со истиот раствор");
    clr.type = "button";
    clr.addEventListener("click", () => { resetTube(); rg = null; info.replaceChildren(el("p", "ep-hint", "Епруветата е исчистена: повторно го имаш непознатиот раствор.")); });
    row.appendChild(clr);
    box.appendChild(row);
    info.replaceChildren(box);
    renderQuiz();
  }

  function renderQuiz() {
    quizBox.replaceChildren();
    if (!unknown) return;

    // --- дневник
    quizBox.appendChild(el("h3", "ep-h", "📒 Лабораториски дневник"));
    if (!log.length) {
      quizBox.appendChild(el("p", "ep-hint small", "Овде автоматски се запишуваат резултатите од секој реагенс што ќе го додадеш."));
    } else {
      const wrap = el("div", "ep-logwrap"), t = el("table", "ep-log");
      const hr = el("tr");
      ["#", "Реагенс", "Набљудување"].forEach(h => hr.appendChild(el("th", "", h)));
      t.appendChild(el("thead")).appendChild(hr);
      const tb = el("tbody");
      log.forEach((e, i) => {
        const tr = el("tr");
        tr.appendChild(el("td", "", String(i + 1)));
        tr.appendChild(el("td", "ep-log-r", REAGENSI[e.r].label));
        const td = el("td");
        if (e.x && e.x.kind === "ppt") { const sw = el("span", "ep-sw sm"); sw.style.background = e.x.hex; td.appendChild(sw); }
        td.appendChild(document.createTextNode(neutralObs(e.x)));
        if (e.excess) td.appendChild(el("div", "ep-log-ex", "↳ вишок: " + e.excess));
        tr.appendChild(td);
        tb.appendChild(tr);
      });
      t.appendChild(tb); wrap.appendChild(t); quizBox.appendChild(wrap);
    }

    // --- одговор
    const ans = el("div", "ep-answer");
    ans.appendChild(el("h3", "ep-h", "🎯 Твој одговор"));
    ans.appendChild(el("label", "ep-lab", "Катјонот во растворот е:"));
    const s = el("select", "calc-num ep-sel");
    s.appendChild(new Option("— избери катјон —", ""));
    order.forEach(g => {
      const og = document.createElement("optgroup");
      og.label = GRUPI[g].name;
      KATJONI.filter(k => k.group === g).forEach(k => og.appendChild(new Option(`${k.ion} – ${k.name}`, k.id)));
      s.appendChild(og);
    });
    s.value = sel; s.disabled = done;
    s.addEventListener("change", () => { sel = s.value; });
    ans.appendChild(s);

    const ppts = log.filter(e => e.x && e.x.kind === "ppt");
    const inputs = {}, marks = {};
    if (ppts.length) {
      ans.appendChild(el("p", "ep-lab", "Напиши ги хемиските формули на талозите што ги доби (индексите како обични броеви, на пр. Ag2CrO4):"));
      ppts.forEach(e => {
        const row = el("div", "ep-formrow");
        row.appendChild(el("span", "ep-formlab", `${REAGENSI[e.r].label} → ${e.x.col} талог`));
        const inp = el("input", "calc-num ep-formin");
        inp.type = "text"; inp.autocomplete = "off"; inp.autocapitalize = "off"; inp.spellcheck = false;
        inp.placeholder = "формула"; inp.value = answers[e.r] || ""; inp.disabled = done;
        inp.addEventListener("input", () => { answers[e.r] = inp.value; inp.classList.remove("ok", "bad"); marks[e.r].textContent = ""; });
        inp.addEventListener("keydown", ev => { if (ev.key === "Enter") check(); });
        const mk = el("span", "ep-mark");
        inputs[e.r] = inp; marks[e.r] = mk;
        row.append(inp, mk);
        ans.appendChild(row);
      });
    } else if (log.length) {
      ans.appendChild(el("p", "ep-hint small", "За сега немаш добиено талог, па нема формули за пишување. Пробај со други реагенси."));
    }

    const fb = el("div", "ep-fb"); fb.setAttribute("aria-live", "polite");
    const btns = el("div", "ep-foot");
    const ck = el("button", "btn", "✔ Провери"); ck.type = "button"; ck.disabled = done;
    const rv = el("button", "btn ghost", "🏳️ Откриј го одговорот"); rv.type = "button"; rv.disabled = done;
    btns.append(ck, rv);
    ans.append(btns, fb);
    quizBox.appendChild(ans);

    function showSolution(whoGaveUp) {
      done = true;
      markUsed();
      document.querySelectorAll(".ep-rg").forEach(b => (b.disabled = true));
      s.value = unknown.id; s.disabled = true; ck.disabled = true; rv.disabled = true;
      Object.keys(inputs).forEach(r => inputs[r].disabled = true);
      const d = el("div", "ep-sol");
      d.appendChild(el("p", "ep-obs", `Решение: растворот содржи ${unknown.ion} (${unknown.name}), ${GRUPI[unknown.group].name}.`));
      log.forEach(e => {
        if (!e.x) return;
        const line = el("div", "ep-sol-r");
        line.appendChild(el("b", "", REAGENSI[e.r].label + (e.x.prod ? " → " + e.x.prod : "")));
        if (e.x.obs) line.appendChild(el("div", "ep-note", e.x.obs));
        if (e.x.eq && e.x.eq.length) { const eqs = el("div", "ep-eqs"); e.x.eq.forEach(q => eqs.appendChild(el("div", "ep-eq", q))); line.appendChild(eqs); }
        d.appendChild(line);
      });
      const ag = el("button", "btn", "🎲 Нов непознат раствор"); ag.type = "button";
      ag.addEventListener("click", newUnknown);
      d.appendChild(ag);
      fb.appendChild(d);
    }

    function check() {
      fb.replaceChildren();
      if (!log.length) { fb.appendChild(el("p", "ep-fb-bad", "Прво додај барем еден реагенс и запиши што набљудуваш.")); return; }
      if (!sel) { fb.appendChild(el("p", "ep-fb-bad", "Избери кој катјон мислиш дека е.")); return; }
      let allOk = true;
      ppts.forEach(e => {
        const ok = sameFormula(answers[e.r], e.x.prod);
        inputs[e.r].classList.toggle("ok", ok); inputs[e.r].classList.toggle("bad", !ok);
        marks[e.r].textContent = ok ? "✓" : "✗";
        if (!ok) allOk = false;
      });
      const catOK = sel === unknown.id;
      if (!catOK) {
        fb.appendChild(el("p", "ep-fb-bad", "❌ Катјонот не е точен. Пробај со уште реагенси или размисли што укажуваат набљудувањата." + (allOk ? "" : " Формулите означени со ✗ исто така не се точни.")));
        return;
      }
      if (allOk) {
        fb.appendChild(el("p", "ep-fb-ok", `✅ Точно! Катјонот е ${unknown.ion}, а сите формули се точни. Искористени реагенси: ${log.length}.`));
        showSolution();
      } else {
        fb.appendChild(el("p", "ep-fb-bad", "✅ Катјонот е точен, но некои формули на талозите (означени со ✗) не се точни. Поправи ги и провери повторно."));
      }
    }
    ck.addEventListener("click", check);
    rv.addEventListener("click", () => { fb.replaceChildren(); showSolution(true); });
    if (done) { s.value = unknown.id; showSolution(); }
  }

  // ---------- приклучување ----------
  modeBtns.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  grpSel.appendChild(new Option("Сите групи", "all"));
  order.forEach(g => grpSel.appendChild(new Option(GRUPI[g].name, g)));
  newBtn.addEventListener("click", newUnknown);

  // почетна состојба
  setMode("learn");
})();
