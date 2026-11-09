// Алатки: титрација со индикатор (виртуелна лабораторија).
// Прво се бира соодветен индикатор, потоа се изведува титрацијата со бирета, па се пресметува концентрацијата.
(function () {
  "use strict";
  const root = document.getElementById("tit-root");
  if (!root) return;

  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  const btn = (text, cls, fn) => { const b = el("button", cls || "btn", text); b.type = "button"; if (fn) b.addEventListener("click", fn); return b; };
  const fmt = (x, d) => x.toFixed(d).replace(".", ",");
  const later = (fn, ms) => setTimeout(fn, reduce ? 0 : ms);
  const KW = 1e-14, VA = 25, CT = 0.1;

  /* ---------- Системи за титрација ---------- */
  const SYS = {
    hcl: {
      id: "hcl", dir: 1, label: "HCl со NaOH",
      analyte: "хлороводородна киселина (HCl)", titrant: "натриум хидроксид (NaOH)", tshort: "NaOH",
      data: "Силна киселина титрирана со силна база.",
      eq: "HCl + NaOH → NaCl + H₂O",
      eqnote: "Солта NaCl не хидролизира, па во еквивалентната точка pH = 7."
    },
    hac: {
      id: "hac", dir: 1, label: "CH₃COOH со NaOH", Ka: 1.8e-5,
      analyte: "оцетна киселина (CH₃COOH)", titrant: "натриум хидроксид (NaOH)", tshort: "NaOH",
      data: "Слаба киселина (Ka = 1,8·10⁻⁵) титрирана со силна база.",
      eq: "CH₃COOH + NaOH → CH₃COONa + H₂O",
      eqnote: "Ацетатниот јон хидролизира (CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻), па во еквивалентната точка растворот е базен."
    },
    nh3: {
      id: "nh3", dir: -1, label: "NH₃ со HCl", Kb: 1.8e-5,
      analyte: "амонијак (NH₃)", titrant: "хлороводородна киселина (HCl)", tshort: "HCl",
      data: "Слаба база (Kb = 1,8·10⁻⁵) титрирана со силна киселина.",
      eq: "NH₃ + HCl → NH₄Cl",
      eqnote: "Амониумовиот јон хидролизира (NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺), па во еквивалентната точка растворот е кисел."
    }
  };

  /* ---------- Индикатори ---------- */
  const WATER = [207, 230, 245, 0.5];
  const IND = [
    { name: "Метил-портокалово", lo: 3.1, hi: 4.4, change: "црвена → жолта", c: [[225, 35, 40, .62], [238, 80, 38, .62], [245, 130, 32, .62], [252, 175, 25, .62], [255, 212, 30, .62]] },
    { name: "Бромкрезол-зелено", lo: 3.8, hi: 5.4, change: "жолта → сина", c: [[250, 215, 40, .6], [185, 205, 60, .6], [95, 175, 90, .62], [50, 140, 150, .64], [40, 100, 200, .66]] },
    { name: "Метил-црвено", lo: 4.4, hi: 6.2, change: "црвена → жолта", c: [[215, 30, 40, .62], [232, 70, 40, .62], [243, 120, 35, .62], [250, 170, 25, .62], [255, 218, 20, .62]] },
    { name: "Бромтимол-сино", lo: 6.0, hi: 7.6, change: "жолта → сина", c: [[250, 215, 40, .6], [185, 205, 60, .6], [95, 175, 90, .62], [50, 140, 150, .64], [40, 100, 200, .66]] },
    { name: "Фенолфталеин", lo: 8.2, hi: 10.0, change: "безбојна → розева", c: [WATER, [247, 218, 234, .42], [241, 150, 200, .62], [233, 70, 160, .74], [215, 20, 120, .82]] },
    { name: "Тимолфталеин", lo: 9.3, hi: 10.5, change: "безбојна → сина", c: [WATER, [190, 205, 240, .5], [120, 150, 230, .62], [60, 95, 215, .72], [25, 55, 190, .8]] }
  ];
  IND.forEach(i => { i.a = i.c[0]; i.b = i.c[i.c.length - 1]; i.m = i.c[Math.floor(i.c.length / 2)]; });
  const mix = (c1, c2, t) => c1.map((v, i) => v + (c2[i] - v) * t);
  const css = c => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
  // удел на базната форма на индикаторот (сигмоида околу средината на интервалот)
  function alpha(ind, pH) {
    const s = 1.9 / (ind.hi - ind.lo);
    return 1 / (1 + Math.pow(10, -(pH - pk(ind)) * s));
  }
  function indColor(ind, pH) {
    const x = alpha(ind, pH) * (ind.c.length - 1), i = Math.min(ind.c.length - 2, Math.floor(x));
    return mix(ind.c[i], ind.c[i + 1], x - i);
  }
  const pk = ind => (ind.lo + ind.hi) / 2;

  /* ---------- Хемија: pH во зависност од волумен ---------- */
  function bisectPH(f) {
    let lo = 0, hi = 14;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2, h = Math.pow(10, -mid);
      if (f(h) > 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function pHat(sys, ca, V) {
    const tot = VA + V;
    if (sys.id === "hcl") {
      const x = (ca * VA - CT * V) / tot;
      return -Math.log10((x + Math.sqrt(x * x + 4 * KW)) / 2);
    }
    if (sys.id === "hac") {
      const C = ca * VA / tot, N = CT * V / tot, Ka = sys.Ka;
      return bisectPH(h => N + h - C * Ka / (Ka + h) - KW / h);
    }
    const C = ca * VA / tot, A = CT * V / tot, Kan = KW / sys.Kb;
    return bisectPH(h => h + C * h / (h + Kan) - A - KW / h);
  }
  const Veq = ca => ca * VA / CT;
  function Vat(sys, ca, target) {
    let lo = 0, hi = 2 * Veq(ca);
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2, p = pHat(sys, ca, mid);
      if (sys.dir > 0 ? p < target : p > target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function evalInd(sys, ca, ind) {
    const ve = Veq(ca), vk = Vat(sys, ca, pk(ind));
    const err = (vk - ve) / ve * 100, ae = Math.abs(err);
    const p1 = pHat(sys, ca, ve * 0.999), p2 = pHat(sys, ca, ve * 1.001);
    return { vk, err, cls: ae <= 0.1 ? "good" : ae <= 0.5 ? "part" : "bad", jlo: Math.min(p1, p2), jhi: Math.max(p1, p2), peq: pHat(sys, ca, ve) };
  }

  /* ---------- Состојба ---------- */
  const BUR_Y0 = 60, BUR_K = 3.8;
  let S = null;
  function newTask(id) {
    const keys = Object.keys(SYS);
    const sys = SYS[id && SYS[id] ? id : keys[Math.floor(Math.random() * keys.length)]];
    const ca = Math.round((0.08 + Math.random() * 0.06) * 1000) / 1000;
    S = { sys, ca, picked: null, passed: false, tries: 0, ev: null, prep: { pip: false, ind: false, fill: false },
      v0: 0, r: 0, busy: false, active: false, runs: [], calcDone: false };
  }

  /* ---------- Скелет на страницата ---------- */
  root.innerHTML = "";
  const intro = el("p", "in-intro", "Реална вежба: прво избери индикатор што одговара на титрацијата, па подготви ја колбата и биретата, титрирај до промена на бојата и пресметај ја концентрацијата на непознатиот раствор.");
  const setup = el("div", "ep-setup in-setup");
  const selLab = el("label", "ep-lab", "Задача:");
  const sel = el("select", "calc-num ep-sel in-sel");
  sel.id = "ti-sys";
  [["", "🎲 Случајна"], ["hcl", "HCl со NaOH"], ["hac", "CH₃COOH со NaOH"], ["nh3", "NH₃ со HCl"]].forEach(o => { const op = el("option", "", o[1]); op.value = o[0]; sel.appendChild(op); });
  selLab.htmlFor = "ti-sys";
  const newBtn = btn("🎲 Нова задача", "btn ghost", () => start(sel.value));
  setup.append(selLab, sel, newBtn);

  const layout = el("div", "in-layout");
  const stageCol = el("div", "in-stagecol");
  const stage = el("div", "in-stage");
  stage.innerHTML = `
<svg id="ti-svg" class="ti-svg" viewBox="0 0 300 470" role="img" aria-label="Бирета и ерленмаер">
  <defs>
    <clipPath id="ti-bclip"><rect x="136" y="44" width="28" height="218"/></clipPath>
    <clipPath id="ti-fclip"><path d="M138 346 V372 L112 436 Q109 449 122 449 H178 Q191 449 188 436 L162 372 V346 Z"/></clipPath>
  </defs>
  <!-- статив -->
  <rect x="26" y="452" width="248" height="12" rx="3" fill="#4a3b4e"/>
  <rect x="40" y="30" width="7" height="424" fill="#6b5b6e"/>
  <rect x="44" y="104" width="98" height="7" rx="2" fill="#6b5b6e"/>
  <rect x="128" y="98" width="44" height="19" rx="4" fill="#8b7a8f"/>
  <!-- бирета -->
  <g id="ti-bur">
    <g clip-path="url(#ti-bclip)">
      <g id="ti-burliq" class="ti-burliq" style="transform:translateY(230px)">
        <rect x="136" y="60" width="28" height="230" fill="#8ec9ee" fill-opacity=".8"/>
        <ellipse cx="150" cy="60" rx="13" ry="2.4" fill="#5b8db3" fill-opacity=".55"/>
      </g>
    </g>
    <g id="ti-ticks"></g>
    <rect x="135" y="44" width="30" height="218" rx="3" fill="none" stroke="#8fa6bd" stroke-width="2.5"/>
    <path d="M139 266 H161 L157 276 H143 Z" fill="#e6eef5" stroke="#8fa6bd" stroke-width="2"/>
    <path d="M146 276 H154 L152.5 297 H147.5 Z" fill="#e6eef5" stroke="#8fa6bd" stroke-width="1.8"/>
    <g transform="translate(150 271)"><g id="ti-stop" class="ti-stop"><rect x="7" y="-3" width="24" height="6" rx="3" fill="#c2410c"/></g></g>
  </g>
  <!-- колба -->
  <g id="ti-flask" class="ti-flask">
    <g clip-path="url(#ti-fclip)">
      <rect id="ti-fliq" class="ti-fliq" x="100" y="404" width="100" height="50" fill="rgb(207,230,245)" fill-opacity=".5"/>
    </g>
    <path d="M138 346 V372 L112 436 Q109 449 122 449 H178 Q191 449 188 436 L162 372 V346" fill="none" stroke="#8fa6bd" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M133 346 H167" stroke="#8fa6bd" stroke-width="4" stroke-linecap="round"/>
    <path d="M139 384 L122 430" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
  </g>
  <!-- пипета -->
  <g id="ti-pip" class="ti-pip">
    <path d="M148.6 298 V312 C140 314 139 332 140 336 C141 342 146 344 148.6 346 V378 L149.6 386 H150.4 L151.4 378 V346 C154 344 159 342 160 336 C161 332 160 314 151.4 312 V298 Z" fill="#eef4f9" fill-opacity=".85" stroke="#8fa6bd" stroke-width="1.6" stroke-linejoin="round"/>
    <g id="ti-pipliq" class="ti-pipliq">
      <path d="M149.5 306 V313 C143 316 142 332 143 336 C144 341 147 343 149.5 345 V378 L150 383 L150.5 378 V345 C153 343 156 341 157 336 C158 332 157 316 150.5 313 V306 Z" fill="#8cc4e8"/>
    </g>
    <line x1="146" x2="154" y1="304" y2="304" stroke="#2d1b4e" stroke-width="1.6"/>
  </g>

  <!-- капка и млаз од биретата -->
  <rect id="ti-stream" x="149" y="297" width="2" height="108" fill="#8cc4e8" opacity="0"/>
  <circle id="ti-drop" cx="150" cy="298" r="2.8" fill="#8cc4e8" opacity="0"/>
  <g id="ti-idrops"></g>
</svg>`;
  const meter = el("div", "in-meter");
  const meterL = el("div", "in-meter-l", "Отчитување од бирета");
  const meterV = el("div", "in-meter-v", "—");
  meter.append(meterL, meterV);
  stageCol.append(stage, meter);

  const right = el("div", "ti-right");
  layout.append(stageCol, right);
  root.append(intro, setup, layout);

  const $ = id => root.querySelector("#" + id);
  const svg = $("ti-svg"), burLiq = $("ti-burliq"), stopEl = $("ti-stop"), fliq = $("ti-fliq"), flask = $("ti-flask");
  const pip = $("ti-pip"), pipLiq = $("ti-pipliq"), stream = $("ti-stream"), drop = $("ti-drop"), idrops = $("ti-idrops");
  // скала на биретата
  (function ticks() {
    const g = $("ti-ticks");
    let h = "";
    for (let m = 0; m <= 50; m++) {
      const y = BUR_Y0 + BUR_K * m, long = m % 5 === 0, w = long ? 11 : 6;
      h += `<line x1="137" x2="${137 + w}" y1="${y}" y2="${y}" stroke="#334155" stroke-width="${long ? 1.2 : .8}"/>`;
      if (m % 10 === 0) h += `<text x="151" y="${y + 3}" font-size="8.5" font-weight="700" fill="#1e293b">${m}</text>`;
    }
    g.innerHTML = h;
  })();

  /* ---------- Сцена ---------- */
  function sceneReset() {
    burLiq.style.transform = "translateY(230px)";
    stopEl.classList.remove("open");
    fliq.style.transform = "scaleY(0)";
    fliq.style.fill = css(WATER); fliq.style.fillOpacity = WATER[3];
    pipLiq.style.transform = "scaleY(1)";
    pip.classList.remove("in");
    stream.setAttribute("opacity", 0); drop.setAttribute("opacity", 0);
    idrops.innerHTML = "";
    meterV.textContent = "—";
  }
  function volume() { return (S.r - S.v0) / 100; }
  function setMeter() { meterV.textContent = fmt(S.r / 100, 2) + " mL"; }
  function setBur() { burLiq.style.transform = `translateY(${(BUR_K * S.r / 100).toFixed(2)}px)`; setMeter(); }
  function setFlaskColor() {
    let c = WATER;
    if (S.prep.ind && S.picked !== null) c = indColor(IND[S.picked], pHat(S.sys, S.ca, Math.max(0, volume())));
    fliq.style.fill = css(c); fliq.style.fillOpacity = c[3];
  }
  function fall(circleColor, x0, y0, y1, dur, parent) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x0); c.setAttribute("cy", y0); c.setAttribute("r", 2.8); c.setAttribute("fill", circleColor);
    parent.appendChild(c);
    if (c.animate && !reduce) {
      const a = c.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${y1 - y0}px)`, opacity: .9 }], { duration: dur, easing: "ease-in" });
      a.onfinish = () => c.remove();
    } else c.remove();
  }

  /* ---------- Десна страна ---------- */
  const secTask = el("div", "in-step");
  const secInd = el("div", "in-step");
  const secLab = el("div", "in-step"); secLab.hidden = true;
  const secCalc = el("div", "in-step"); secCalc.hidden = true;
  const secQ = el("div", "in-qs"); secQ.hidden = true;
  right.append(secTask, secInd, secLab, secCalc, secQ);

  function renderTask() {
    secTask.innerHTML = "";
    secTask.appendChild(el("h4", "", "Задача"));
    const p = el("p", "");
    p.innerHTML = `Во ерленмаер има <b>${fmt(VA, 2)} mL</b> раствор на <b>${S.sys.analyte}</b> со непозната концентрација. Титрирај го со <b>${S.sys.titrant}</b>, c = <b>${fmt(CT, 4)} mol/L</b>. ${S.sys.data}`;
    const eq = el("div", "in-eq strong", S.sys.eq);
    const todo = el("ol", "ti-todo");
    ["Избери соодветен индикатор.", "Подготви ја колбата и биретата, па титрирај (барем две паралелни титрации).", "Пресметај ја концентрацијата на аналитот."].forEach(t => todo.appendChild(el("li", "", t)));
    secTask.append(p, eq, todo);
  }

  /* --- индикатор --- */
  let chartBox, indMsg, indCards = [], contBtn, helpBtn;
  function renderInd() {
    secInd.innerHTML = "";
    indCards = [];
    secInd.appendChild(el("h4", "", "1. Избери индикатор"));
    secInd.appendChild(el("p", "in-hint", "Индикаторот треба да ја менува бојата во областа на скокот на pH околу еквивалентната точка. Допри индикатор, па провери."));
    const grid = el("div", "ti-inds");
    IND.forEach((ind, i) => {
      const b = el("button", "ti-ind");
      b.type = "button";
      const sw = el("span", "ti-sw");
      sw.style.background = "linear-gradient(90deg, " + ind.c.map((c, k) => (c === WATER ? "rgb(235,240,245)" : css(c)) ).join(",") + ")";
      b.append(sw, el("span", "ti-in-n", ind.name), el("span", "ti-in-r", `pH ${fmt(ind.lo, 1)} – ${fmt(ind.hi, 1)}`), el("span", "ti-in-c", ind.change));
      b.addEventListener("click", () => {
        if (S.passed) return;
        S.picked = i;
        indCards.forEach((x, j) => x.classList.toggle("sel", j === i));
        indMsg.textContent = "";
        chartBox.innerHTML = "";
      });
      grid.appendChild(b); indCards.push(b);
    });
    const row = el("div", "in-row");
    const chk = btn("✔ Провери го изборот", "btn", checkInd);
    helpBtn = btn("💡 Помош: покажи ја кривата на титрација", "btn ghost", () => { drawChart(); });
    contBtn = btn("Продолжи со титрација →", "btn primary", () => { secLab.hidden = false; secLab.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }); });
    contBtn.hidden = true;
    row.append(chk, helpBtn);
    indMsg = el("div", "in-feedback");
    chartBox = el("div", "ti-chartbox");
    secInd.append(grid, row, indMsg, chartBox);
    if (S.passed) {
      indCards[S.picked].classList.add("sel");
      indCards.forEach(c => (c.disabled = true));
    }
  }
  function drawChart() {
    const ind = S.picked !== null ? IND[S.picked] : null;
    chartBox.innerHTML = chartSVG(ind);
    const cap = el("p", "in-hint", "Кривата на титрација (pH во зависност од додадениот волумен). Обоената лента е интервалот на промена на бојата на индикаторот.");
    chartBox.appendChild(cap);
  }
  function checkInd() {
    if (S.picked === null) { indMsg.innerHTML = ""; indMsg.appendChild(el("p", "in-fb-bad", "Прво избери индикатор.")); return; }
    if (S.passed) return;
    const ind = IND[S.picked], ev = evalInd(S.sys, S.ca, ind);
    S.ev = ev; S.tries++;
    drawChart();
    indMsg.innerHTML = "";
    const pj = `${fmt(ev.jlo, 1)} – ${fmt(ev.jhi, 1)}`;
    const base = `Скокот на pH околу еквивалентната точка е приближно ${pj} (pH во еквивалентната точка ≈ ${fmt(ev.peq, 1)}). ${S.sys.eqnote}`;
    const range = `${ind.name} ја менува бојата во интервал pH ${fmt(ind.lo, 1)} – ${fmt(ind.hi, 1)}.`;
    if (ev.cls === "good") {
      indMsg.appendChild(el("p", "in-fb-ok", `✔ Соодветен избор. ${range} Грешката на титрација е занемарлива (≈ ${fmt(Math.abs(ev.err), 2)} %). ${base}`));
      S.passed = true;
    } else if (ev.cls === "part") {
      indMsg.appendChild(el("p", "in-fb-ok", `✔ Прифатлив избор, но не најдобар. ${range} Бојата се менува малку ${ev.err < 0 ? "пред" : "по"} еквивалентната точка, па ќе има мала систематска грешка (≈ ${ev.err > 0 ? "+" : "−"}${fmt(Math.abs(ev.err), 2)} %). ${base} Можеш да продолжиш или да пробаш подобар индикатор.`));
      S.passed = true;
    } else {
      indMsg.appendChild(el("p", "in-fb-bad", `✘ Несоодветен избор. ${range} Тоа е ${ev.err < 0 ? "пред" : "по"} еквивалентната точка: титрацијата би завршила со грешка од ≈ ${ev.err > 0 ? "+" : "−"}${fmt(Math.abs(ev.err), 1)} %. ${base} Пробај со друг индикатор.`));
    }
    if (S.passed) {
      indCards.forEach(c => (c.disabled = true));
      contBtn.hidden = false;
      secLab.hidden = false;
      renderLab();
    }
  }
  function chartSVG(ind) {
    const W = 330, H = 236, L = 36, R = 12, T = 12, B = 32;
    const ve = Veq(S.ca), vmax = Math.ceil(ve * 1.6 / 5) * 5;
    const X = v => L + (W - L - R) * v / vmax, Y = p => T + (H - T - B) * (1 - p / 14);
    let h = `<svg class="ti-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Крива на титрација">`;
    for (let p = 0; p <= 14; p += 2) h += `<line class="in-grid" x1="${L}" x2="${W - R}" y1="${Y(p)}" y2="${Y(p)}"/><text class="in-tick" x="${L - 5}" y="${Y(p) + 3}" text-anchor="end">${p}</text>`;
    const step = vmax > 40 ? 10 : 5;
    for (let v = 0; v <= vmax; v += step) h += `<line class="in-grid" x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${H - B}"/><text class="in-tick" x="${X(v)}" y="${H - B + 12}" text-anchor="middle">${v}</text>`;
    if (ind) {
      const c = indColor(ind, ind.hi);
      h += `<rect x="${L}" y="${Y(ind.hi)}" width="${W - L - R}" height="${Y(ind.lo) - Y(ind.hi)}" fill="${css(c)}" fill-opacity=".38"/>`;
      h += `<text class="in-tick" x="${W - R - 4}" y="${Y(ind.hi) + 10}" text-anchor="end" font-weight="700">${ind.name}</text>`;
    }
    h += `<line class="in-mark" x1="${X(ve)}" x2="${X(ve)}" y1="${T}" y2="${H - B}"/>`;
    h += `<text class="in-tick" x="${X(ve) + 3}" y="${T + 9}">Veq = ${fmt(ve, 1)} mL</text>`;
    let d = "";
    const n = 260;
    for (let i = 0; i <= n; i++) {
      const v = vmax * i / n;
      d += (i ? "L" : "M") + X(v).toFixed(1) + " " + Y(Math.max(0, Math.min(14, pHat(S.sys, S.ca, v)))).toFixed(1);
    }
    h += `<path class="in-curve" d="${d}"/>`;
    if (ind) {
      const vk = Vat(S.sys, S.ca, pk(ind));
      h += `<circle cx="${X(vk)}" cy="${Y(pk(ind))}" r="4.5" fill="#c2410c" stroke="#fff" stroke-width="1.5"/>`;
    }
    h += `<text class="in-axl" x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle">V(${S.sys.tshort}) / mL</text>`;
    h += `<text class="in-axl" transform="translate(10 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle">pH</text>`;
    return h + "</svg>";
  }

  /* --- лабораторија --- */
  let stepBtns = {}, ctlBox, runMsg, runTable, finBtn, restartBtn, nextBtn, dispBtns = [];
  function renderLab() {
    secLab.innerHTML = "";
    stepBtns = {}; dispBtns = [];
    secLab.appendChild(el("h4", "", "2. Титрација"));
    secLab.appendChild(el("p", "in-hint", "Следи ги чекорите по ред. Првата титрација може да ти биде ориентациона (додавај побрзо); во следните доведи го крајот по капка."));
    const sb = el("div", "in-stepbtns");
    stepBtns.pip = btn("① Пренеси 25,00 mL аналит со пипета во колбата", "btn", doPip);
    stepBtns.ind = btn("② Додај 2–3 капки индикатор", "btn", doInd);
    stepBtns.fill = btn("③ Наполни ја биретата со титрант", "btn", doFill);
    sb.append(stepBtns.pip, stepBtns.ind, stepBtns.fill);
    ctlBox = el("div", "ti-ctl"); ctlBox.hidden = true;
    ctlBox.appendChild(el("p", "in-hint", "Отвори ја рачката на биретата и додавај титрант (колбата ја мешаш со вртење). Следи ја бојата на растворот."));
    const row = el("div", "in-row");
    [["+2,00 mL", 200], ["+0,50 mL", 50], ["+0,20 mL", 20], ["1 капка (0,05 mL)", 5]].forEach(d => {
      const b = btn(d[0], "btn ghost", () => dispense(d[1]));
      dispBtns.push(b); row.appendChild(b);
    });
    const row2 = el("div", "in-row");
    finBtn = btn("⏹ Крај на титрација (запиши)", "btn", endRun);
    restartBtn = btn("↺ Започни одново (нова колба)", "btn ghost", () => { if (S.active || S.prep.fill) { prepareRun(true); } });
    row2.append(finBtn, restartBtn);
    runMsg = el("p", "in-msg");
    ctlBox.append(row, row2, runMsg);
    runTable = el("div", "ti-runs");
    nextBtn = btn("➕ Нова паралелна титрација", "btn", () => { prepareRun(false); });
    nextBtn.hidden = true;
    secLab.append(sb, ctlBox, runTable, nextBtn);
    updateSteps(); renderRuns();
  }
  function updateSteps() {
    stepBtns.pip.disabled = S.prep.pip || S.busy;
    stepBtns.ind.disabled = !S.prep.pip || S.prep.ind || S.busy;
    stepBtns.fill.disabled = !S.prep.ind || S.prep.fill || S.busy;
    stepBtns.pip.classList.toggle("done", S.prep.pip);
    stepBtns.ind.classList.toggle("done", S.prep.ind);
    stepBtns.fill.classList.toggle("done", S.prep.fill);
    ctlBox.hidden = !S.prep.fill;
    dispBtns.forEach(b => (b.disabled = !S.active || S.busy));
    finBtn.disabled = !S.active || S.busy;
  }
  function doPip() {
    if (S.busy || S.prep.pip) return;
    S.busy = true; updateSteps();
    pip.classList.add("in");
    later(() => { pipLiq.style.transform = "scaleY(0)"; fliq.style.transform = "scaleY(1)"; }, 700);
    later(() => { pip.classList.remove("in"); }, 2100);
    later(() => { S.prep.pip = true; S.busy = false; updateSteps(); }, 2600);
  }
  function doInd() {
    if (S.busy || S.prep.ind || !S.prep.pip) return;
    S.busy = true; updateSteps();
    const ind = IND[S.picked];
    const col = css(ind.a === WATER ? ind.c[2] : ind.a);
    for (let i = 0; i < 3; i++) later(() => fall(col, 158, 322, 402, 420, idrops), 250 + i * 380);
    later(() => { S.prep.ind = true; S.v0 = S.r = 0; setFlaskColor(); }, 1500);
    later(() => { S.busy = false; updateSteps(); }, 2100);
  }
  function randStart() { return Math.floor(Math.random() * 17) * 5; } // 0,00 – 0,80 mL
  function doFill() {
    if (S.busy || S.prep.fill || !S.prep.ind) return;
    S.busy = true; updateSteps();
    S.v0 = S.r = randStart();
    burLiq.style.transition = reduce ? "none" : "transform 1.6s ease-in-out";
    setBur();
    later(() => { S.prep.fill = true; S.active = true; S.busy = false; runMsg.textContent = `Почетно отчитување: ${fmt(S.v0 / 100, 2)} mL.`; runMsg.className = "in-msg"; updateSteps(); setFlaskColor(); }, 1700);
  }
  function dispense(a) {
    if (!S.active || S.busy) return;
    if (S.r + a > 5000) { runMsg.textContent = "Биретата е речиси празна. Започни одново."; runMsg.className = "in-msg bad"; return; }
    S.busy = true; updateSteps();
    burLiq.style.transition = reduce ? "none" : "transform .35s ease-out";
    S.r += a;
    runMsg.textContent = ""; runMsg.className = "in-msg";
    stopEl.classList.add("open");
    setBur();
    const big = a >= 20;
    if (big) {
      stream.setAttribute("opacity", 1);
      later(() => stream.setAttribute("opacity", 0), 300 + (a >= 50 ? 150 : 0));
    } else {
      drop.setAttribute("opacity", 0);
      fall("#8cc4e8", 150, 298, 404, 420, idrops);
    }
    later(() => stopEl.classList.remove("open"), big ? 420 : 200);
    later(() => { setFlaskColor(); }, big ? 350 : 300);
    flask.classList.remove("swirl"); void flask.getBoundingClientRect(); flask.classList.add("swirl");
    later(() => { S.busy = false; updateSteps(); }, big ? 700 : 520);
  }
  function endRun() {
    if (!S.active || S.busy) return;
    const ind = IND[S.picked], V = volume(), p = pHat(S.sys, S.ca, V);
    const changed = S.sys.dir > 0 ? p >= pk(ind) : p <= pk(ind);
    if (!changed) { runMsg.textContent = "Бојата уште не се променила трајно. Продолжи со додавање титрант."; runMsg.className = "in-msg warn"; return; }
    const vis = Vat(S.sys, S.ca, pk(ind)), over = V - vis;
    let note = "добро";
    if (over > 0.30) note = `пре-титрирано (≈ +${fmt(over, 2)} mL)`;
    else if (over > 0.12) note = `малку пре-титрирано (≈ +${fmt(over, 2)} mL)`;
    S.runs.push({ start: S.v0 / 100, end: S.r / 100, cons: V, note });
    S.active = false;
    runMsg.textContent = over > 0.12 ? "Запишано. Го помина крајот: следниот пат додавај по капка кога бојата почнува да се менува." : "Запишано. Добро доведен крај!";
    runMsg.className = over > 0.12 ? "in-msg warn" : "in-msg ok";
    nextBtn.hidden = S.runs.length >= 5;
    updateSteps(); renderRuns(); renderCalc();
  }
  function prepareRun(discard) {
    if (S.busy) return;
    if (discard) { S.active = true; }
    S.v0 = S.r = randStart();
    burLiq.style.transition = reduce ? "none" : "transform 1.2s ease-in-out";
    setBur(); fliq.style.transform = "scaleY(1)"; setFlaskColor();
    S.active = true; nextBtn.hidden = true;
    runMsg.textContent = `Нова колба со индикатор, биретата е дополнета. Почетно отчитување: ${fmt(S.v0 / 100, 2)} mL.`; runMsg.className = "in-msg";
    updateSteps();
  }
  function renderRuns() {
    runTable.innerHTML = "";
    if (!S.runs.length) return;
    const t = el("table", "in-tbl");
    t.innerHTML = "<thead><tr><th>#</th><th>Почеток (mL)</th><th>Крај (mL)</th><th>V(" + S.sys.tshort + ") (mL)</th><th>Белешка</th></tr></thead>";
    const tb = el("tbody");
    S.runs.forEach((r, i) => {
      const tr = el("tr");
      [String(i + 1), fmt(r.start, 2), fmt(r.end, 2), fmt(r.cons, 2), r.note].forEach((x, k) => { const td = el("td", "", x); if (k === 4) td.style.textAlign = "left"; tr.appendChild(td); });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    const w = el("div", "in-tblwrap"); w.appendChild(t);
    runTable.append(el("div", "in-cap", "Резултати"), w);
  }

  /* --- пресметка --- */
  function bestAvg() {
    const v = S.runs.map(r => r.cons);
    if (v.length < 2) return null;
    let best = null;
    const n = v.length;
    for (let mask = 1; mask < (1 << n); mask++) {
      const sub = []; for (let i = 0; i < n; i++) if (mask & (1 << i)) sub.push(v[i]);
      if (sub.length < 2) continue;
      const range = Math.max(...sub) - Math.min(...sub);
      if (range > 0.2 + 1e-9) continue;
      if (!best || sub.length > best.n || (sub.length === best.n && range < best.range)) best = { n: sub.length, range, avg: sub.reduce((a, b) => a + b, 0) / sub.length };
    }
    return best;
  }
  let calcState = { checked: false };
  function renderCalc() {
    secCalc.innerHTML = "";
    if (S.runs.length < 2) { secCalc.hidden = true; return; }
    secCalc.hidden = false;
    secCalc.appendChild(el("h4", "", "3. Пресметка"));
    const avg = bestAvg();
    if (!avg) {
      secCalc.appendChild(el("p", "in-fb-bad", "Паралелните титрации се разликуваат за повеќе од 0,20 mL. Направи уште една титрација (внимателно, по капка при крајот)."));
      return;
    }
    secCalc.appendChild(el("p", "in-hint", `Користи ги титрациите што се согласуваат (разлика ≤ 0,20 mL). Формула: c(аналит) · V(аналит) = c(титрант) · V(титрант), реакцијата оди 1 : 1.`));
    const fields = el("div", "in-fields");
    const l1 = el("label", "", "Просечна потрошувачка V(" + S.sys.tshort + "), mL");
    const i1 = el("input", "calc-num"); i1.type = "text"; i1.inputMode = "decimal"; i1.autocomplete = "off";
    l1.appendChild(i1);
    const l2 = el("label", "", "Концентрација на аналитот, c (mol/L)");
    const i2 = el("input", "calc-num"); i2.type = "text"; i2.inputMode = "decimal"; i2.autocomplete = "off";
    l2.appendChild(i2);
    fields.append(l1, l2);
    const fb = el("div", "in-feedback");
    const row = el("div", "in-row");
    const num = s => { const v = parseFloat(String(s).trim().replace(",", ".")); return isFinite(v) ? v : NaN; };
    const chk = btn("✔ Провери", "btn", () => {
      fb.innerHTML = "";
      i1.classList.remove("bad"); i2.classList.remove("bad");
      const v1 = num(i1.value), v2 = num(i2.value);
      const exp = CT * avg.avg / VA;
      let ok = true;
      if (!(Math.abs(v1 - avg.avg) <= 0.03)) { ok = false; i1.classList.add("bad"); fb.appendChild(el("p", "in-fb-bad", "Просекот на титрациите што се согласуваат не е точен. Собери ги нивните потрошувачки и подели со бројот на титрации.")); }
      if (!(Math.abs(v2 - exp) / exp <= 0.01)) { ok = false; i2.classList.add("bad"); fb.appendChild(el("p", "in-fb-bad", "Концентрацијата не е точна. Потсетување: c(аналит) = c(титрант) · V(титрант) / V(аналит).")); }
      if (!ok) return;
      const err = (exp - S.ca) / S.ca * 100;
      fb.appendChild(el("p", "in-fb-ok", `✔ Точно! c(${S.sys.id === "nh3" ? "NH₃" : S.sys.id === "hac" ? "CH₃COOH" : "HCl"}) = ${fmt(exp, 4)} mol/L.`));
      const res = el("div", "in-eq strong");
      res.textContent = `Вистинска вредност: ${fmt(S.ca, 4)} mol/L · релативна грешка: ${err >= 0 ? "+" : "−"}${fmt(Math.abs(err), 2)} %`;
      fb.appendChild(res);
      let verdict;
      if (Math.abs(err) <= 0.5) verdict = "Одлична прецизност и точност.";
      else if (Math.abs(err) <= 1.5) verdict = "Добар резултат. Малата разлика доаѓа од индикаторот или од крајот на титрацијата.";
      else verdict = "Грешката е поголема од очекуваното: најверојатно си го помина крајот (пре-титрирање) или индикаторот не е најсоодветен.";
      fb.appendChild(el("p", "in-msg", verdict));
      secQ.hidden = false;
    });
    const sol = btn("🧮 Покажи ја пресметката", "btn ghost", () => {
      const exp = CT * avg.avg / VA;
      fb.innerHTML = "";
      const e1 = el("div", "in-eq", `V(просек) = ${fmt(avg.avg, 2)} mL`);
      const e2 = el("div", "in-eq strong", `c = ${fmt(CT, 4)} · ${fmt(avg.avg, 2)} / ${fmt(VA, 2)} = ${fmt(exp, 4)} mol/L`);
      fb.append(e1, e2);
    });
    row.append(chk, sol);
    secCalc.append(fields, row, fb);
  }

  /* --- прашања --- */
  function renderQ() {
    secQ.innerHTML = "";
    secQ.appendChild(el("h4", "", "Прашања"));
    const qa = [
      ["Зошто се додаваат само 2–3 капки индикатор?", "Индикаторот е слаба киселина или база и самиот реагира со титрантот. Многу индикатор би внесол грешка."],
      ["Зошто при крајот се додава по капка?", "Околу еквивалентната точка pH се менува нагло: една капка (≈ 0,05 mL) може да го помине крајот. Затоа се титрира бавно и со мешање."],
      ["Зошто pH во еквивалентната точка не е секогаш 7?", S.sys.eqnote],
      ["Зошто се прават барем две паралелни титрации?", "За да се провери дали резултатите се согласуваат (разлика ≤ 0,20 mL) и да се намали случајната грешка со просек."]
    ];
    qa.forEach(q => {
      const d = el("details", "in-qa"); d.appendChild(el("summary", "", q[0])); d.appendChild(el("p", "", q[1]));
      secQ.appendChild(d);
    });
  }

  /* ---------- Старт ---------- */
  function start(id) {
    newTask(id);
    sceneReset();
    renderTask(); renderInd();
    secLab.hidden = true; secLab.innerHTML = "";
    secCalc.hidden = true; secCalc.innerHTML = "";
    secQ.hidden = true; renderQ();
  }
  start("");
  window.__titracija = { indColor, css, SYS, IND, pHat, Veq, Vat, evalInd, getS: () => S };
})();
