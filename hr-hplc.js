/* Течна хроматографија (HPLC, обратно-фазна) – симулатор */
(function () {
  "use strict";
  const H = window.HRO, el = H.el, fmt = H.fmt;
  const VM = 1.6, TD = 0.8, PMAX = 400;              // мртов волумен на колоната (mL), закаснување на градиентот (min), граница на притисок (bar)
  const WL = [214, 254, 280];
  /* соединенија: lkw = log k во чиста вода, ion = [киселина, pKa], eps = релативен одговор на 214/254/280 nm */
  const CMP = {
    mp: { name: "метил парабен", lkw: 1.9, arom: 1, eps: [0.8, 1.0, 0.25] }, ep: { name: "етил парабен", lkw: 2.45, arom: 1, eps: [0.8, 1.0, 0.25] },
    pp: { name: "пропил парабен", lkw: 3.0, arom: 1, eps: [0.8, 1.0, 0.25] }, bp: { name: "бутил парабен", lkw: 3.5, arom: 1, eps: [0.8, 1.0, 0.25] },
    par: { name: "парацетамол", lkw: 1.05, arom: 1, eps: [0.9, 0.8, 0.45] }, caf: { name: "кофеин", lkw: 1.2, arom: 1, eps: [1.0, 0.7, 0.9] },
    asa: { name: "аспирин", lkw: 1.9, ion: ["a", 3.5], arom: 1, eps: [0.9, 0.3, 0.1] }, ibu: { name: "ибупрофен", lkw: 3.7, ion: ["a", 4.4], arom: 1, eps: [0.8, 0.004, 0.004] },
    ben: { name: "бензоева киселина", lkw: 1.95, ion: ["a", 4.2], arom: 1, eps: [1.0, 0.5, 0.1] }, sor: { name: "сорбинска киселина", lkw: 1.65, ion: ["a", 4.76], eps: [0.9, 1.0, 0.25] },
    asp: { name: "аспартам", lkw: 1.25, ion: ["a", 3.1], arom: 1, eps: [0.8, 0.004, 0.004] }, sac: { name: "сахарин", lkw: 0.9, ion: ["a", 1.6], arom: 1, eps: [0.6, 0.15, 0.3] }
  };
  const COLS = { c18: "C18 (октадецил, неполарна), 150 × 4,6 mm, 5 µm", c8: "C8 (октил, помалку неполарна), 150 × 4,6 mm, 5 µm", ph: "Фенил (π–π интеракции со ароматични прстени), 150 × 4,6 mm, 5 µm" };
  const PHS = [[2.5, "pH 2,5 (фосфатен пуфер)"], [3.0, "pH 3,0 (фосфатен пуфер)"], [4.8, "pH 4,8 (ацетатен пуфер)"], [7.0, "pH 7,0 (фосфатен пуфер)"], [10, "pH 10 (амонијачен пуфер) ⚠"]];
  const TASKS = {
    P: { kind: "opt", name: "1. Парабени (конзерванси): изократно раздвојување", ids: ["mp", "ep", "pp", "bp"], limit: 7, def: { p0: 45, p1: 45, mode: "iso", wl: 254 },
      ok: "Парабените (метил-, етил-, пропил- и бутил-парабен) се конзерванси во козметика и лекови. Најди состав на мобилната фаза (% органски растворувач, ACN или MeOH) со кој сите соседни пикови имаат Rs ≥ 1,5, а последниот пик излегува за ≤ 7 min." },
    A: { kind: "opt", name: "2. Аналгетици: pH, градиент и бранова должина", ids: ["par", "caf", "asa", "ibu"], limit: 12, def: { p0: 10, p1: 10, mode: "iso", wl: 254, pH: 7 },
      ok: "Таблета содржи парацетамол, кофеин, аспирин и ибупрофен. Аспиринот и ибупрофенот се киселини, па на pH 7 се јонизирани и слабо се задржуваат. Ибупрофенот слабо апсорбира на 254 nm. Подеси <b>pH</b>, <b>градиент</b> и <b>бранова должина</b> така што сите 4 супстанци се видливи, Rs ≥ 1,5 за сите соседни пикови, а последниот пик излегува за ≤ 12 min." },
    D: { kind: "id", name: "3. Адитиви во пијалок: идентификација", cands: ["sac", "caf", "asp", "sor", "ben"], variants: [{ n: "диетална кола (кофеин + бензоева киселина + аспартам)", ids: ["caf", "ben", "asp"] }, { n: "лимонада (бензоева киселина + сорбинска киселина + сахарин)", ids: ["ben", "sor", "sac"] }, { n: "енергетски пијалок (кофеин + сорбинска киселина + аспартам)", ids: ["caf", "sor", "asp"] }],
      def: { p0: 15, p1: 15, mode: "iso", wl: 254, pH: 3.0 }, ok: "Непознат пијалок (диетална кола, лимонада или енергетски) содржи 3 адитиви. Инјектирај стандарди и примерок при исти услови и определи кои адитиви ги содржи. Внимавај: сите супстанци не апсорбираат подеднакво на секоја бранова должина." },
    Q: { kind: "quant", name: "4. Кофеин во енергетски пијалок (калибрација)", target: "caf", def: { p0: 25, p1: 25, mode: "iso", wl: 254, pH: 3.0 },
      ok: "Колку кофеин има во енергетски пијалок (mg/L)? Примерокот е разреден 1:10. Најпрво најди услови каде кофеинот е раздвоен од другите компоненти, па инјектирај стандарди (10, 25, 50, 100 mg/L) и направи калибрациона права (површина наспроти концентрација), па пресметај. Законската граница за кофеин во пијалок е 320 mg/L." }
  };

  const phiAt = (m, t) => { const tt = t - TD; if (tt <= 0) return m.p0 / 100; if (m.mode === "iso") return m.p0 / 100; const x = Math.min(1, Math.max(0, (tt - m.hold) / m.tG)); return (m.p0 + (m.p1 - m.p0) * x) / 100; };
  function kk(c, m, phi) {
    const S = (2.6 + 0.9 * c.lkw) * (m.org === "met" ? 0.75 : 1); let k = Math.pow(10, c.lkw - S * phi);
    k *= m.col === "c18" ? 1 : m.col === "c8" ? 0.55 : (c.arom ? 1.15 : 0.7); k *= Math.exp(-0.012 * (m.T - 25));
    if (c.ion) { const a = 1 / (1 + Math.pow(10, c.ion[1] - m.pH)); k = k * (1 - a) + k * 0.03 * a; }
    return k;
  }
  const ionFrac = (c, m) => c.ion ? 1 / (1 + Math.pow(10, c.ion[1] - m.pH)) : 0;
  const visc = (m, phi) => { const w = 0.89 * (1 - phi); return m.org === "met" ? w + 0.54 * phi + 0.95 * 4 * phi * (1 - phi) : w + 0.37 * phi + 0.25 * 4 * phi * (1 - phi); };
  function pressure(m) { const lo = Math.min(m.p0, m.p1) / 100, hi = Math.max(m.p0, m.p1) / 100; let mx = 0; for (let f = lo; f <= hi + 1e-9; f += 0.02) mx = Math.max(mx, visc(m, f)); mx = Math.max(mx, visc(m, hi)); return 90 * m.flow * mx * Math.exp(-0.015 * (m.T - 25)); }
  function simulate(m, items) {
    const t0 = VM / m.flow, Hh = 5 + 3 / m.flow + 3 * m.flow, N = 150000 / Hh; const peaks = [{ id: "t0", tR: t0, sg: 0.012 + t0 * 0.03, A: 4, solv: true }];
    items.forEach(it => { const c = CMP[it.id]; let z = 0, t = 0; const dt = 0.004;
      while (z < 1 && t < 45) { z += dt / (t0 * (1 + kk(c, m, phiAt(m, t)))); t += dt; } if (t >= 45) return;
      const ke = kk(c, m, phiAt(m, t)), a = ionFrac(c, m), bro = 1 + 1.2 * 4 * a * (1 - a);
      peaks.push({ id: it.id, tR: t, sg: Math.sqrt(Math.pow(t0 * (1 + ke) * bro / Math.sqrt(N), 2) + 0.008 * 0.008), A: it.c * c.eps[WL.indexOf(m.wl)] * 0.8 * (1 + 0.012 * (Math.random() - 0.5) * 2), h: 0 }); });
    return { peaks, t0, N };
  }
  function trace(sim, m) {
    const last = Math.max(...sim.peaks.map(p => p.tR)), tEnd = Math.min(45, Math.max(3, last * 1.1 + 0.8)), NP = 3000, dt = tEnd / NP, y = [], base = [];
    for (let i = 0; i <= NP; i++) { const t = i * dt; let s = 0; sim.peaks.forEach(p => { const d = (t - p.tR) / p.sg; if (Math.abs(d) < 7) s += p.A / (p.sg * 2.5066) * Math.exp(-d * d / 2); }); y.push(s); base.push(phiAt(m, t)); }
    return { y, base, dt, tEnd };
  }
  function integrate(tr) {
    const y = tr.y, ymax = Math.max(...y), pk = [];
    for (let i = 1; i < y.length - 1; i++) if (y[i] > y[i - 1] && y[i] >= y[i + 1] && y[i] > 0.003 * ymax) pk.push(i);
    return pk.map(i => { let l = i, r = i; const th = y[i] * 0.002; while (l > 0 && y[l - 1] < y[l] && y[l] > th) l--; while (r < y.length - 1 && y[r + 1] < y[r] && y[r] > th) r++;
      let a = 0; for (let k = l; k <= r; k++) a += y[k] * tr.dt; return { t: i * tr.dt, h: y[i], area: a }; });
  }
  const INTRO = `Целта на оваа вежба е да се запознаете со принципот на <b>високоефикасна течна хроматографија</b> (HPLC) и да научите како составот на <b>мобилната фаза</b> и изборот на стационарната фаза влијаат на разделувањето. Се користи <b>реверзно-фазна</b> хроматографија: <b>стационарната фаза</b> е неполарна (C18 — јаглеводородни вериги сврзани на силика гел), а <b>мобилната фаза</b> е поларна смеса од вода (пуфер) и органски растворувач (ацетонитрил, ACN, или метанол, MeOH). Тука супстанците ќе се елуираат по обратен редослед отколку при TLC на силика гел: <b>поларните супстанци излегуваат први</b>, а неполарните се задржуваат подолго. Со зголемување на уделот на органскиот растворувач сите супстанци побрзо излегуваат (се елуираат). Може да се менува: органскиот растворувач, % органски растворувач (изократно или градиентно), pH на пуферот (влијае на јонизацијата), стационарна фаза, протокот, температурата и брановата должина на UV детекторот. Треба да се следи и <b>притисокот</b> на системот (максимум 400 bar).`;

  H.mods.lc = function (root) {
    const S = { runs: [], cur: null, cal: [] };
    const top = el("div", "in-row"), ts = el("select", "chr-num"); ts.style.width = "auto"; for (const k in TASKS) { const o = el("option", "", TASKS[k].name); o.value = k; ts.appendChild(o); }
    top.append(el("span", "", "<b>Задача:</b> "), ts); root.appendChild(top);
    const intro = el("p", "in-hint"); root.appendChild(intro);
    const lay = el("div", "chr-big"); root.appendChild(lay);
    const ctl = el("div", "in-step"), out = el("div"); lay.append(ctl, out);
    let M = {}, vials = [], vialSel = 0, ui = {};
    const tbl = el("div"), log = el("div"), fb = el("div"), calBox = el("div");

    function sliders() {
      ctl.innerHTML = "<h4>Параметри на HPLC</h4>";
      const mkSel = (opts, val, f) => { const s = el("select", "chr-num"); s.style.width = "100%"; opts.forEach(([v, t]) => { const o = el("option", "", t); o.value = v; if (String(v) === String(val)) o.selected = true; s.appendChild(o); }); s.onchange = () => f(s.value); return s; };
      ctl.append(el("p", "in-hint", "<b>Стационарна фаза (колона):</b>"), mkSel(Object.keys(COLS).map(k => [k, COLS[k]]), M.col, v => M.col = v));
      ctl.append(el("p", "in-hint", "<b>Мобилна фаза:</b> A = вода (пуфер), B = органски растворувач"), mkSel([["acn", "B: ацетонитрил (ACN)"], ["met", "B: метанол (MeOH)"]], M.org, v => M.org = v),
        mkSel(PHS, M.pH, v => M.pH = +v), mkSel([["iso", "Изократно (постојан состав)"], ["grad", "Градиент (состав се менува)"]], M.mode, v => { M.mode = v; mkCtl(); }));
      ui.box = el("div"); ctl.appendChild(ui.box); mkCtl();
      const vs = mkSel(vials.map((v, i) => [i, v.name]), vialSel, v => vialSel = +v);
      ctl.append(el("p", "in-hint", "Шишенце за инјектирање (10 µL):"), vs);
      const go = el("button", "btn primary", "💉 Инјектирај"); go.type = "button"; ctl.appendChild(go); go.onclick = inject;
    }
    function mkCtl() {
      ui.box.innerHTML = ""; const add = (k, l, mn, mx, st, u) => { const r = el("div", "chr-ctl"), s = el("input"), o = el("output"); s.type = "range"; s.min = mn; s.max = mx; s.step = st; s.value = M[k];
        const up = () => { M[k] = +s.value; o.textContent = fmt(M[k], st < 1 ? 1 : 0) + u; }; s.oninput = up; up(); r.append(el("span", "", l), s, o); ui.box.appendChild(r); };
      add("p0", M.mode === "iso" ? "% B" : "Почетен % B", 5, 95, 1, " %");
      if (M.mode === "grad") { add("p1", "Краен % B", 5, 100, 1, " %"); add("tG", "Време на градиент", 2, 30, 1, " min"); add("hold", "Почетно задржување", 0, 5, 0.5, " min"); }
      add("flow", "Проток", 0.3, 3, 0.1, " mL/min"); add("T", "Температура", 25, 60, 5, " °C");
      const wl = el("div", "chr-opts"); WL.forEach(w => { const b = el("button", "chr-opt" + (w === M.wl ? " on" : ""), "λ " + w + " nm"); b.type = "button"; b.onclick = () => { M.wl = w; wl.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); }; wl.appendChild(b); });
      ui.box.append(el("p", "in-hint", "Бранова должина на UV детекторот:"), wl);
    }
    function newTask(k) {
      const T = TASKS[k]; S.k = k; S.runs = []; S.cur = null; S.cal = []; vialSel = 0; out.innerHTML = "";
      M = Object.assign({ col: "c18", org: "acn", pH: 3.0, mode: "iso", p0: 30, p1: 70, tG: 10, hold: 0, flow: 1.0, T: 30, wl: 254 }, T.def);
      intro.innerHTML = INTRO + "<br><br><b>Задача:</b> " + T.ok;
      if (T.kind === "opt") vials = [{ name: "Смеса: " + T.ids.map(id => CMP[id].name).join(", "), items: T.ids.map(id => ({ id, c: 50 })) }];
      if (T.kind === "id") { const v = H.pick(T.variants); S.vname = v.n; S.truth = v.ids.slice(); vials = T.cands.map(id => ({ name: "Стандард: " + CMP[id].name + " (50 mg/L)", items: [{ id, c: 50 }] })); vials.push({ name: "❓ Непознат пијалок (разреден)", items: S.truth.map(id => ({ id, c: 50 })), unk: true }); }
      if (T.kind === "quant") { S.cx = Math.round(H.rand(200, 400)); vials = [10, 25, 50, 100].map(c => ({ name: "Стандард: кофеин " + c + " mg/L", items: [{ id: "caf", c }], std: c }));
        vials.push({ name: "Примерок: енергетски пијалок (разреден 1:10)", items: [{ id: "caf", c: S.cx / 10 }, { id: "ben", c: 6 }, { id: "sor", c: 4 }, { id: "asp", c: 8 }], smp: true }); }
      sliders(); build();
    }
    function build() {
      out.innerHTML = ""; const box = el("div", "in-step"); box.innerHTML = "<h4>Хроматограм</h4>";
      const sch = H.svg("svg", { viewBox: "0 0 600 80", class: "chr-schem" }, box);
      sch.innerHTML = `<rect x="2" y="6" width="58" height="34" rx="5" fill="#dbeafe" stroke="#64748b"/><text x="31" y="21" font-size="10" text-anchor="middle">A: вода</text><text x="31" y="33" font-size="9" text-anchor="middle">(пуфер)</text>
      <rect x="2" y="44" width="58" height="30" rx="5" fill="#fef3c7" stroke="#64748b"/><text x="31" y="56" font-size="8.5" text-anchor="middle">B: ACN/MeOH</text><text id="lb" x="31" y="69" font-size="10" font-weight="700" text-anchor="middle" fill="#c2410c"></text>
      <rect x="90" y="18" width="70" height="42" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="125" y="35" font-size="11" text-anchor="middle">Пумпа</text><text id="lp" x="125" y="51" font-size="10" font-weight="700" text-anchor="middle" fill="#334155"></text>
      <rect x="190" y="18" width="64" height="42" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="222" y="35" font-size="11" text-anchor="middle">Инјектор</text><text x="222" y="51" font-size="9" text-anchor="middle">10 µL</text>
      <rect x="284" y="10" width="170" height="58" rx="8" fill="#fff1e6" stroke="#c2410c"/><path d="M296 30 h146" stroke="#475569" stroke-width="3"/><path d="M296 42 h146" stroke="#475569" stroke-width="3"/><text x="369" y="58" font-size="10" text-anchor="middle" fill="#9a3412">колона (стационарна фаза)</text>
      <rect x="486" y="18" width="70" height="42" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="521" y="35" font-size="11" text-anchor="middle">UV детектор</text><text id="lw" x="521" y="51" font-size="10" text-anchor="middle"></text>
      <path d="M60 39 H90 M160 39 H190 M254 39 H284 M454 39 H486 M556 39 H590" stroke="#64748b" stroke-width="2"/>`;
      const sv = H.svg("svg", { viewBox: "0 0 600 270", class: "chr-svg" }, box); S.sv = sv; S.sch = sch;
      sv.innerHTML = '<line x1="50" y1="225" x2="590" y2="225" stroke="#334155"/><line x1="50" y1="20" x2="50" y2="225" stroke="#334155"/><text x="320" y="262" font-size="11" text-anchor="middle" fill="#334155">време (min)</text><text x="14" y="125" font-size="11" fill="#334155" transform="rotate(-90 14 125)" text-anchor="middle">апсорбанција (mAU)</text><g id="gx"></g><clipPath id="gcl"><rect id="gclr" x="50" y="0" width="0" height="270"/></clipPath><path id="gp" fill="none" stroke="#1d4ed8" stroke-width="1.4" clip-path="url(#gcl)"/><g id="gl"></g><line id="gcur" x1="0" x2="0" y1="20" y2="225" stroke="#64748b" stroke-dasharray="3 3" opacity="0"/><text id="gctt" x="0" y="42" font-size="10" fill="#334155" opacity="0"></text><text id="gt" x="56" y="12" font-size="11" fill="#334155"></text>';
      sv.addEventListener("mousemove", e => { if (!S.cur) return; const r = sv.getBoundingClientRect(), x = (e.clientX - r.left) * 600 / r.width; if (x < 50 || x > 590) return;
        const t = (x - 50) / 540 * S.cur.tr.tEnd, ci = Math.round(t / S.cur.tr.dt); sv.querySelector("#gcur").setAttribute("x1", x); sv.querySelector("#gcur").setAttribute("x2", x); sv.querySelector("#gcur").setAttribute("opacity", 1);
        const tx = sv.querySelector("#gctt"); tx.setAttribute("x", Math.min(x + 4, 500)); tx.textContent = "t = " + fmt(t, 2) + " min, " + fmt(S.cur.tr.y[ci] || 0, 1) + " mAU"; tx.setAttribute("opacity", 1); });
      sv.addEventListener("mouseleave", () => { sv.querySelector("#gcur").setAttribute("opacity", 0); sv.querySelector("#gctt").setAttribute("opacity", 0); });
      out.append(box, tbl, fb, log); tbl.innerHTML = fb.innerHTML = log.innerHTML = ""; answerBox();
    }
    function status(m, tcur, p) { const phi = phiAt(m, tcur); S.sch.querySelector("#lb").textContent = Math.round(phi * 100) + " % B"; S.sch.querySelector("#lp").textContent = Math.round(p * (visc(m, phi) / Math.max(0.3, visc(m, Math.max(m.p0, m.p1) / 100)))) + " bar"; S.sch.querySelector("#lw").textContent = m.wl + " nm"; }
    function inject() {
      const m = Object.assign({}, M); fb.innerHTML = "";
      if (m.pH > 8) { fb.innerHTML = "<p class='in-fb-bad'>✘ Колоната е оштетена! Силика гелот (носач на C18 фазата) се раствора при pH над 8. Типичните C18 колони работат на pH 2–8. Колоната е заменета, а pH е вратено на 3.</p>"; M.pH = 3.0; sliders(); return; }
      if (m.mode === "grad" && m.p1 <= m.p0) { fb.innerHTML = "<p class='in-fb-bad'>За градиент крајниот % B мора да е поголем од почетниот.</p>"; return; }
      const P = pressure(m); if (P > PMAX) { fb.innerHTML = `<p class="in-fb-bad">✘ Притисокот (${Math.round(P)} bar) го надминува максимумот од ${PMAX} bar: системот запре. Намали го протокот или зголеми ја температурата (метанол/вода има висок вискозитет, а ACN/вода помал).</p>`; return; }
      const v = vials[vialSel], sim = simulate(m, v.items), tr = trace(sim, m), pk = integrate(tr);
      const run = { n: S.runs.length + 1, m, v, sim, tr, pk, P }; S.runs.push(run); S.cur = run; draw(run, true); runsLog();
    }
    function draw(run, anim) {
      const sv = S.sv, tr = run.tr, m = run.m; const ymax = Math.max(...tr.y) * 1.12;
      const drift = ymax * 0.1 * (m.wl === 214 ? (m.org === "met" ? 1 : 0.35) : m.wl === 254 ? 0.12 : 0.05);
      const X = t => 50 + 540 * t / tr.tEnd, Y = v => 225 - 195 * v / (ymax + drift);
      let d = ""; tr.y.forEach((v, i) => { const noise = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.0012 * ymax; d += (i ? "L" : "M") + X(i * tr.dt).toFixed(1) + " " + Y(v + drift * (m.mode === "iso" ? 0 : tr.base[i] - tr.base[0]) + noise).toFixed(1); });
      sv.querySelector("#gp").setAttribute("d", d); const gx = sv.querySelector("#gx"); gx.innerHTML = "";
      const stp = tr.tEnd > 20 ? 5 : tr.tEnd > 8 ? 2 : 1; for (let t = 0; t <= tr.tEnd; t += stp) { H.svg("line", { x1: X(t), x2: X(t), y1: 225, y2: 230, stroke: "#334155" }, gx); const tx = H.svg("text", { x: X(t), y: 242, "font-size": 10, "text-anchor": "middle", fill: "#334155" }, gx); tx.textContent = t; }
      const gl = sv.querySelector("#gl"); gl.innerHTML = ""; let prevX = -99, lvl = 0;
      run.pk.forEach(p => { const x = X(p.t); lvl = (x - prevX < 28) ? (lvl + 1) % 3 : 0; prevX = x; const topY = Y(p.h + drift * (m.mode === "iso" ? 0 : (tr.base[Math.round(p.t / tr.dt)] || 0) - tr.base[0])), ly = Math.max(16, topY - 5 - lvl * 11);
        if (lvl) H.svg("line", { x1: x, x2: x, y1: ly + 2, y2: topY - 1, stroke: "#94a3b8", "stroke-width": 0.6 }, gl); const tx = H.svg("text", { x, y: ly, "font-size": 9.5, "text-anchor": "middle", fill: "#475569" }, gl); tx.textContent = fmt(p.t, 2); });
      const clr = sv.querySelector("#gclr"), tt = sv.querySelector("#gt"); gl.setAttribute("opacity", 0);
      const fin = () => { clr.setAttribute("width", 540); gl.setAttribute("opacity", 1); tt.textContent = `${COLS[m.col].split(",")[0]}, ${m.org === "acn" ? "ACN" : "MeOH"}, pH ${fmt(m.pH, 1)}, λ ${m.wl} nm, N ≈ ${Math.round(run.sim.N / 1000)}·10³`; status(m, tr.tEnd, run.P); table(run); evalRun(run); calib(run); };
      if (!anim || H.reduced) { fin(); return; } let t0 = null, T = 2800;
      requestAnimationFrame(function f(ts) { if (t0 == null) t0 = ts; const x = Math.min(1, (ts - t0) / T); clr.setAttribute("width", 540 * x); const tc = x * tr.tEnd; tt.textContent = `t = ${fmt(tc, 1)} min · ${Math.round(phiAt(m, tc) * 100)} % B`; status(m, tc, run.P); if (x < 1) requestAnimationFrame(f); else fin(); });
    }
    function table(run) {
      let h = `<h4>Интегрирање (Run #${run.n}: ${run.v.name}), притисок ≈ ${Math.round(run.P)} bar</h4><table class="chr-tbl"><tr><th>Пик</th><th>tR (min)</th><th>Површина (mAU·min)</th><th>Висина (mAU)</th></tr>`;
      run.pk.forEach((p, i) => h += `<tr><td>${i + 1}${i === 0 && Math.abs(p.t - run.sim.t0) < 0.1 ? " (t₀, неретинирана)" : ""}</td><td>${fmt(p.t, 3)}</td><td>${fmt(p.area, 2)}</td><td>${fmt(p.h, 1)}</td></tr>`); tbl.innerHTML = "<div class='chr-scroll'>" + h + "</table></div>";
    }
    function runsLog() {
      let h = "<h4>Дневник на анализи</h4><table class='chr-tbl'><tr><th>#</th><th>Примерок</th><th>Метода</th></tr>";
      S.runs.forEach(r => { const m = r.m; h += `<tr class="chr-run${r === S.cur ? " cur" : ""}" data-n="${r.n}"><td>${r.n}</td><td>${r.v.name}</td><td>${m.col.toUpperCase()}, ${m.org === "acn" ? "ACN" : "MeOH"} ${m.mode === "iso" ? m.p0 + " %" : m.p0 + "→" + m.p1 + " % / " + m.tG + " min"}, pH ${fmt(m.pH, 1)}, ${fmt(m.flow, 1)} mL/min, ${m.T} °C, ${m.wl} nm</td></tr>`; });
      log.innerHTML = "<div class='chr-scroll'>" + h + "</table></div>"; log.querySelectorAll(".chr-run").forEach(tr => tr.onclick = () => { S.cur = S.runs[+tr.dataset.n - 1]; draw(S.cur, false); runsLog(); });
    }
    function detected(run, id) { const p = run.sim.peaks.find(x => x.id === id); if (!p) return null; const hmax = Math.max(...run.pk.map(x => x.h)); const q = run.pk.reduce((b, x) => (!b || Math.abs(x.t - p.tR) < Math.abs(b.t - p.tR) ? x : b), null); return q && Math.abs(q.t - p.tR) < 3 * p.sg && q.h >= 0.02 * hmax ? q : null; }
    function evalRun(run) {
      const T = TASKS[S.k]; if (T.kind !== "opt") { fb.innerHTML = ""; return; }
      const pk = run.sim.peaks.filter(p => !p.solv).sort((a, b) => a.tR - b.tR);
      if (pk.length < T.ids.length) { fb.innerHTML = "<p class='in-fb-bad'>✘ Не сите супстанци излегоа во рамките на анализата. Зголеми го уделот на органскиот растворувач (или градиентот).</p>"; return; }
      const hid = pk.filter(p => !detected(run, p.id)).map(p => CMP[p.id].name);
      if (hid.length) { fb.innerHTML = `<p class="in-fb-bad">✘ Не се гледа: <b>${hid.join(", ")}</b>. Супстанците различно апсорбираат на различни бранови должини, па пробај друга бранова должина (на пр. 214 nm). Може и пиковите да се преклопуваат.</p>`; return; }
      const rs = []; for (let i = 1; i < pk.length; i++) rs.push(1.18 * (pk[i].tR - pk[i - 1].tR) / (2.355 * (pk[i].sg + pk[i - 1].sg)));
      const minRs = Math.min(...rs), last = pk[pk.length - 1].tR, okR = rs.every(x => x >= 1.5), okT = last <= T.limit;
      const msg = `Rs: ${rs.map((x, i) => `${CMP[pk[i].id].name}/${CMP[pk[i + 1].id].name} = <b>${fmt(x, 2)}</b>`).join("; ")}. Последниот пик: ${fmt(last, 1)} min.`;
      fb.innerHTML = okR && okT ? `<p class="in-fb-ok">✔ ${minRs >= 2 ? "Одлично!" : "Задоволително."} Сите Rs ≥ 1,5 и анализата е доволно брза. ${msg}</p>` :
        `<p class="${okR ? "in-fb-ok" : "in-fb-bad"}">${okR ? "✔ Доволно раздвојување, но анализата е предолга (&gt; " + T.limit + " min). Зголеми го % B или протокот, или користи градиент." : "✘ Пиковите не се доволно раздвоени (Rs &lt; 1,5). Промени го составот на мобилната фаза (% B, ACN/MeOH, pH) или користи градиент."} ${msg}</p>`;
    }
    function methodKey(m) { return [m.col, m.org, m.pH, m.mode, m.p0, m.p1, m.tG, m.hold, m.flow, m.T, m.wl].join("|"); }
    function calib(run) {
      const T = TASKS[S.k]; if (T.kind !== "quant") return;
      if (run.v.std) { const q = detected(run, "caf"); if (q) { S.cal = S.cal.filter(x => !(x.c === run.v.std && x.key === methodKey(run.m))); S.cal.push({ c: run.v.std, a: q.area, key: methodKey(run.m) }); } }
      renderCal(run);
    }
    function renderCal(run) {
      const key = methodKey((run || S.cur).m), pts = S.cal.filter(x => x.key === key).sort((a, b) => a.c - b.c); let h = "<h4>Калибрациона права (кофеин) за тековната метода</h4>";
      if (pts.length < 2) { calBox.innerHTML = h + "<p class='in-hint'>Инјектирај најмалку 2 стандарди со истата метода (колона, мобилна фаза, λ…). Ако промениш метода, калибрацијата започнува одново.</p>"; return; }
      const n = pts.length, sx = pts.reduce((s, p) => s + p.c, 0), sy = pts.reduce((s, p) => s + p.a, 0), sxx = pts.reduce((s, p) => s + p.c * p.c, 0), sxy = pts.reduce((s, p) => s + p.c * p.a, 0);
      const a = (n * sxy - sx * sy) / (n * sxx - sx * sx), b0 = (sy - a * sx) / n; const my = sy / n, ssr = pts.reduce((s, p) => s + Math.pow(p.a - (a * p.c + b0), 2), 0), sst = pts.reduce((s, p) => s + Math.pow(p.a - my, 2), 0), r2 = sst ? 1 - ssr / sst : 1;
      h += `<table class="chr-tbl"><tr><th>c (mg/L)</th><th>Површина</th></tr>${pts.map(p => `<tr><td>${p.c}</td><td>${fmt(p.a, 2)}</td></tr>`).join("")}</table><p><b>A = ${fmt(a, 4)} · c ${b0 < 0 ? "−" : "+"} ${fmt(Math.abs(b0), 3)}</b>, R² = ${fmt(r2, 4)}</p><p class="in-hint">Од површината на кофеинот во примерокот пресметај c (mg/L) во разредениот раствор, па помножи со разредувањето.</p>`;
      calBox.innerHTML = h;
    }
    function answerBox() {
      const T = TASKS[S.k]; if (T.kind === "opt") return; const s = el("div", "in-step"); fb.after(s); s.innerHTML = "<h4>Одговор</h4>";
      if (T.kind === "id") { const row = el("div", "chr-opts"), sel = new Set(); T.cands.forEach(id => { const b = el("button", "chr-opt", CMP[id].name); b.type = "button"; b.onclick = () => { sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle("on"); }; row.appendChild(b); });
        const go = el("button", "btn ghost", "✔ Провери"), m = el("div"); go.type = "button"; s.append(el("p", "in-hint", "Означи ги адитивите во непознатиот пијалок (од " + T.cands.length + " можни):"), row, go, m);
        go.onclick = () => { const ok = S.truth.length === sel.size && S.truth.every(x => sel.has(x));
          m.innerHTML = ok ? `<p class="in-fb-ok">✔ Точно! Пијалокот е <b>${S.vname}</b>. Идентификацијата се прави со споредба на времињата на задржување со стандарди под исти услови, а за потврда се користи втора бранова должина или спектар на DAD детектор.</p>` : "<p class='in-fb-bad'>✘ Не е точно. Спореди ги <i>t</i><sub>R</sub> на примерокот со стандардите (иста метода). Некои адитиви (аспартам, ибупрофен…) слабо апсорбираат на 254 nm: пробај 214 nm. Ако два пика се преклопуваат, промени го pH или составот на мобилната фаза.</p>"; }; }
      else { const i = el("input", "chr-num"); i.placeholder = "mg/L"; const go = el("button", "btn ghost", "✔ Провери"), m = el("div"); go.type = "button";
        s.append(calBox, el("p", "in-hint", "Концентрација на кофеин во пијалокот (mg/L, со вклучено разредување 1:10):"), i, go, m);
        go.onclick = () => { const v = H.num(i.value), ok = isFinite(v) && Math.abs(v - S.cx) / S.cx < 0.05;
          m.innerHTML = ok ? `<p class="in-fb-ok">✔ Точно (≈ ${S.cx} mg/L). ${S.cx > 320 ? "Тоа е над границата од 320 mg/L." : "Тоа е под границата од 320 mg/L."}</p>` : "<p class='in-fb-bad'>✘ Не се совпаѓа (±5 %). Дали кофеинот е раздвоен од другите пикови? Дали ја користиш калибрационата права од истата метода и дали го земаш предвид разредувањето?</p>"; }; calBox.innerHTML = "<h4>Калибрациона права (кофеин) за тековната метода</h4><p class='in-hint'>Инјектирај најмалку 2 стандарди со иста метода.</p>"; }
    }
    ts.onchange = () => newTask(ts.value); newTask("P");
  };
  window.__lc = { CMP, simulate, trace, integrate, pressure, kk };
})();
