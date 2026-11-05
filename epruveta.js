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
    label.textContent = cat ? cat.ion : "";
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
        box.appendChild(el("p", "ep-obs", ex.obs));
        const eqs = el("div", "ep-eqs");
        ex.eq.forEach(e => eqs.appendChild(el("div", "ep-eq", e)));
        box.appendChild(eqs);
        btn.replaceWith(box);
      }, 1500);
    });
  }

  // почетна состојба
  info.appendChild(el("p", "ep-hint", "1. Избери катјон од списокот. 2. Избери реагенс и погледни што се случува во епруветата. Затемнетите полиња од практикумот се означени со ★."));
  resetTube();
})();
