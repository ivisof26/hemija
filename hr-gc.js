/* Гасна хроматографија – симулатор */
(function () {
  "use strict";
  const H = window.HRO, el = H.el, fmt = H.fmt;
  const R = 8.314, T0K = 373.15, VCOL = 1.47, LCM = 3000;
  const alk = (n, nm) => ({ id: "C" + n, name: "n-" + nm, np: [0.12 * Math.exp(0.77 * (n - 6)), 30 + 5 * (n - 6)], wax: [0.04 * Math.exp(0.77 * (n - 6)), 29 + 5 * (n - 6)], rf: 1 });
  const C = {
    C10: alk(10, "декан"), C11: alk(11, "ундекан"), C12: alk(12, "додекан"), iC12: Object.assign(alk(12, "додекан"), { id: "iC12", name: "2-метилундекан" }), C13: alk(13, "тридекан"), C14: alk(14, "тетрадекан"),
    ace: { id: "ace", name: "ацетон", np: [0.060, 28], wax: [0.20, 33], rf: 0.55 },
    eto: { id: "eto", name: "етанол", np: [0.070, 31], wax: [1.2, 42], rf: 0.45 },
    eac: { id: "eac", name: "етил ацетат", np: [0.0705, 31], wax: [0.30, 33], rf: 0.60 },
    tol: { id: "tol", name: "толуен", np: [0.55, 38], wax: [0.15, 34], rf: 1.0 },
    pro: { id: "pro", name: "пропан-1-ол", np: [0.20, 35], wax: [2.6, 45], rf: 0.55 },
    ben: { id: "ben", name: "бензен", np: [0.19, 34], wax: [0.10, 31], rf: 1.0 },
    ebz: { id: "ebz", name: "етилбензен", np: [1.45, 42], wax: [0.38, 38], rf: 1.0 },
    pxy: { id: "pxy", name: "p-ксилен", np: [1.52, 42], wax: [0.40, 38], rf: 1.0 },
    mxy: { id: "mxy", name: "m-ксилен", np: [1.53, 42], wax: [0.435, 38], rf: 1.0 },
    oxy: { id: "oxy", name: "o-ксилен", np: [1.95, 42.5], wax: [0.62, 39], rf: 1.0 },
    met: { id: "met", name: "метанол", np: [0.03, 26], wax: [0.9, 40], rf: 0.25 },
    ipr: { id: "ipr", name: "пропан-2-ол", np: [0.115, 32], wax: [1.6, 43], rf: 0.5 },
    pin: { id: "pin", name: "α-пинен", np: [1.0, 41], wax: [0.45, 38], rf: 1.0 },
    lim: { id: "lim", name: "лимонен", np: [2.3, 44], wax: [1.3, 41], rf: 1.0 },
    lin: { id: "lin", name: "линалол", np: [3.5, 47], wax: [22, 58], rf: 0.8 },
    men: { id: "men", name: "ментол", np: [6.5, 50], wax: [30, 60], rf: 0.8 },
    crv: { id: "crv", name: "карвон", np: [8.0, 52], wax: [45, 62], rf: 0.85 },
    iaa: { id: "iaa", name: "изоамил ацетат", np: [0.6, 37], wax: [0.55, 36], rf: 0.6 },
    ebu: { id: "ebu", name: "етил бутират", np: [0.45, 36], wax: [0.38, 35], rf: 0.65 },
    hac: { id: "hac", name: "хексил ацетат", np: [1.9, 41], wax: [1.0, 39], rf: 0.7 },
    but: { id: "but", name: "бутан--1-ол", np: [0.60, 39], wax: [4.0, 48], rf: 0.6 }
  };
  /* стационарна фаза: поларноста (w) е тежина помеѓу неполарна (PDMS) и многу поларна (PEG) */
  const COLS = {
    np: { name: "DB-1: 100 % диметилполисилоксан (неполарна), max 300 °C", short: "DB-1 (неполарна)", w: 0, max: 300 },
    db5: { name: "DB-5: 5 % фенил / 95 % диметилполисилоксан (слабо поларна), max 320 °C", short: "DB-5 (слабо поларна)", w: 0.12, max: 320 },
    mid: { name: "DB-1701: 14 % цијанопропил-фенил (средно поларна), max 280 °C", short: "DB-1701 (средно поларна)", w: 0.5, max: 280 },
    wax: { name: "WAX: полиетилен гликол (поларна), max 250 °C", short: "WAX (поларна)", w: 1, max: 250 }
  };
  const TASKS = {
    A: { kind: "opt", name: "1. Оптимизација: n-алкани C10–C14 и изомер", ids: ["C10", "C11", "C12", "iC12", "C13", "C14"], limit: 8, ok: "Подеси ја програмата така што сите соседни пикови имаат <i>R</i><sub>s</sub> ≥ 1,5, а последниот пик излегува за ≤ 8 min." },
    D: { kind: "opt", name: "2. Оптимизација: бензен, толуен, етилбензен, p-ксилен", ids: ["ben", "tol", "ebz", "pxy"], limit: 8, ok: "Ароматични јаглеводороди од бензин. Етилбензенот и p-ксиленот се слични. Постигни <i>R</i><sub>s</sub> ≥ 1,5 за сите соседни пикови, а последниот пик да излезе за ≤ 8 min." },
    B: { kind: "id", name: "3. Идентификација: растворувачи (избор на колона)", cands: ["ace", "eto", "eac", "tol"], must: ["eto", "eac"], ok: "Непознат примерок содржи неколку од: ацетон, етанол, етил ацетат, толуен. Инјектирај стандарди и примерок, па определи." },
    E: { kind: "id", name: "4. Идентификација: алкохоли", cands: ["met", "eto", "ipr", "pro", "but"], must: [], ok: "Непознат примерок содржи 2–3 алкохоли. Инјектирај стандарди и примерок на иста колона и програма, па спореди ги времињата на задржување." },
    F: { kind: "id", name: "5. Етерично масло: од што е?", cands: ["pin", "lim", "lin", "men", "crv"], must: [], variants: [{ n: "лимон", ids: ["lim", "pin"] }, { n: "нане", ids: ["men", "lim"] }, { n: "лаванда", ids: ["lin", "pin"] }, { n: "ким", ids: ["crv", "lim"] }],
      ok: "Непознато етерично масло (лимон, нане, лаванда или ким). Терпените имаат високи точки на вриење, па е потребно температурно програмирање. Инјектирај стандарди и примерок, па определи ги составките." },
    H: { kind: "id", name: "6. 🍌 Естери во овошна арома", cands: ["eac", "iaa", "ebu", "hac"], must: [], variants: [{ n: "банана (изоамил ацетат + етил ацетат)", ids: ["iaa", "eac"] }, { n: "ананас (етил бутират + етил ацетат)", ids: ["ebu", "eac"] }, { n: "јаболко (хексил ацетат + етил бутират)", ids: ["hac", "ebu"] }],
      ok: "Вештачка овошна арома содржи мирисни естери. Инјектирај стандарди и примерок и определи што мирише: банана, ананас или јаболко." },
    X: { kind: "opt", name: "9. 🧪 Критичен пар: m- и p-ксилен (избор на стационарна фаза)", ids: ["ebz", "pxy", "mxy", "oxy"], limit: 20, ok: "Етилбензенот и трите ксилена имаат речиси исти точки на вриење. m- и p-ксиленот се речиси исти и на неполарна колона не се разделуваат воопшто. Пробај друга <b>стационарна фаза</b> (поларна), подолга колона или поинаква дебелина на филмот, па постигни <i>R</i><sub>s</sub> ≥ 1,5 за сите соседни пикови за ≤ 20 min." },
    Cq: { kind: "quant", fac: 1, unit: "mg/L", name: "7. Квантификација со внатрешен стандард", ok: "Одреди ја концентрацијата на етанол во примерок со внатрешен стандард пропан-1-ол (200 mg/L)." },
    G: { kind: "quant", fac: 1000, unit: "g/L", name: "8. 🚗 Алкохол во крв на возач (внатрешен стандард)", ok: "Полицијата зема крв од возач (анализа на пареи над примерокот). Содржината на етанол се одредува со внатрешен стандард пропан-1-ол (0,5 g/L). Во крвта има и ацетон. Дали возачот ја надминува дозволената граница од 0,5 g/L?" }
  };
  C.iC12.np = [C.C12.np[0] * 0.92, C.C12.np[1]]; C.iC12.wax = [C.C12.wax[0] * 0.92, C.C12.wax[1]];
  function kT(c, col, T, film) { const w = COLS[col].w, a = c.np, b = c.wax; const k100 = Math.exp(Math.log(a[0]) + w * (Math.log(b[0]) - Math.log(a[0]))), dH = a[1] + w * (b[1] - a[1]);
    return k100 * (film / 0.25) * Math.exp(dH * 1000 / R * (1 / (T + 273.15) - 1 / T0K)); }
  function Tof(m, t) { return t < m.hold ? m.T0 : (m.ramp > 0 ? Math.min(m.Tf, m.T0 + m.ramp * (t - m.hold)) : m.T0); }
  function simulate(m, items) {
    const len = m.len || 30, film = m.film || 0.25, LC = len * 100, tM = VCOL * (len / 30) / m.flow, u = LC / (tM * 60), Hh = 1.8 * (0.75 + film) * (0.08 + 2.4 / u + 0.003 * u), N = LC * 10 / Hh;
    const peaks = [{ id: "solv", tR: tM * 1.02, sg: 0.01 + tM * 0.02, A: 40, solv: true, ve: 1 / (tM * 1.02) }];
    items.forEach(it => { const c = C[it.id]; let z = 0, t = 0, dt = 0.004, cnt = 0; const mx = 45, traj = [0];
      while (z < 1 && t < mx) { z += dt / (tM * (1 + kT(c, m.col, Tof(m, t), film))); t += dt; if (++cnt % 5 === 0) traj.push(Math.min(1, z)); }
      if (t >= mx) return; const ke = kT(c, m.col, Tof(m, t), film);
      const sg = Math.sqrt(Math.pow(tM * (1 + ke) / Math.sqrt(N), 2) + 0.008 * 0.008);
      peaks.push({ id: it.id, tR: t, sg, traj, ve: 1 / (tM * (1 + ke)), A: it.c * c.rf * 0.5 * (1 + 0.01 * (Math.random() - .5) * 2) }); });
    return { peaks, tM, N };
  }
  function trace(sim) {
    const last = Math.max(...sim.peaks.map(p => p.tR)); const tEnd = Math.min(45, Math.max(3, last * 1.08 + 0.7)); const NP = 4000, dt = tEnd / NP; const y = [];
    for (let i = 0; i <= NP; i++) { const t = i * dt; let s = 0; sim.peaks.forEach(p => { const d = (t - p.tR) / p.sg; if (Math.abs(d) < 7) s += p.A / (p.sg * 2.5066) * Math.exp(-d * d / 2); }); y.push(s); }
    return { y, dt, tEnd };
  }
  function integrate(tr) {
    const y = tr.y, ymax = Math.max(...y), pk = [];
    for (let i = 1; i < y.length - 1; i++) if (y[i] > y[i - 1] && y[i] >= y[i + 1] && y[i] > 0.003 * ymax) pk.push(i);
    return pk.map((i, j) => { let l = i, r = i; const th = y[i] * 0.002;
      while (l > 0 && y[l - 1] < y[l] && y[l] > th) l--; while (r < y.length - 1 && y[r + 1] < y[r] && y[r] > th) r++;
      let a = 0; for (let k = l; k <= r; k++) a += y[k] * tr.dt; return { t: i * tr.dt, h: y[i], area: a }; });
  }

  const INTRO = `Целта на оваа вежба е да се запознаете со принципот на <b>гасна хроматографија</b> (GC): разделување на испарливи супстанци што се носат со <b>гас носач</b> (мобилна фаза, хелиум) низ долга капиларна колона обложена со тенок филм од <b>стационарна фаза</b> (течен полимер). Супстанците кои повеќе се распределуваат во стационарната фаза (повисока точка на вриење, слична поларност) излегуваат подоцна. Може да се менува изборот на стационарна фаза, должината на колоната, температурната програма и протокот, а како резултат се добива хроматограм (сигнал (пикови) во зависност од времето на задржување <i>t</i><sub>R</sub>)) со определено разделување (резолуција <i>R</i><sub>s</sub>).<br><b>Правило:</b> слично се раствора во слично: поларните супстанци (алкохоли) посилно се задржуваат на поларна стационарна фаза (WAX), а неполарните (јаглеводороди) на неполарна (DB-1).`;
  H.mods.gc = function (root) {
    const S = { runs: [], cur: null, tok: 0, spd: 1 };
    const top = el("div", "in-row"), ts = el("select", "chr-num"); ts.style.width = "auto"; for (const k in TASKS) { const o = el("option", "", TASKS[k].name); o.value = k; ts.appendChild(o); }
    top.append(el("span", "", "<b>Задача:</b> "), ts); root.appendChild(top);
    const intro = el("p", "in-hint"); root.appendChild(intro);
    const lay = el("div", "chr-big"); root.appendChild(lay);
    const ctl = el("div", "in-step"), out = el("div"); lay.append(ctl, out);
    const M = { col: "np", len: 30, film: 0.25, flow: 1.2, T0: 60, hold: 1, ramp: 15, Tf: 250 };
    let vials = [], vialSel = 0, ans = null;
    function sliders() {
      ctl.innerHTML = "<h4>Параметри на гасниот хроматограф</h4>";
      const colS = el("select", "chr-num"); colS.style.width = "100%"; for (const k in COLS) { const o = el("option", "", COLS[k].name); o.value = k; if (k === M.col) o.selected = true; colS.appendChild(o); }
      colS.onchange = () => { M.col = colS.value; };
      const lenS = el("select", "chr-num"), filmS = el("select", "chr-num"); lenS.style.width = filmS.style.width = "100%";
      [15, 30, 60].forEach(v => { const o = el("option", "", "Должина: " + v + " m"); o.value = v; if (v === M.len) o.selected = true; lenS.appendChild(o); });
      [0.1, 0.25, 1.0].forEach(v => { const o = el("option", "", "Дебелина на филмот на стационарната фаза: " + fmt(v, v < 0.2 ? 2 : (v === 1 ? 1 : 2)) + " µm"); o.value = v; if (v === M.film) o.selected = true; filmS.appendChild(o); });
      lenS.onchange = () => M.len = +lenS.value; filmS.onchange = () => M.film = +filmS.value;
      ctl.append(el("p", "in-hint", "<b>Колона</b> (внатрешен дијаметар 0,25 mm), гас носач: хелиум, детектор: FID. Избери <b>стационарна фаза</b>:"), colS, lenS, filmS);
      [["flow", "Проток", 0.3, 3, 0.1, " mL/min"], ["T0", "Почетна T", 40, 200, 5, " °C"], ["hold", "Задржување", 0, 5, 0.5, " min"], ["ramp", "Загревање", 0, 40, 1, " °C/min"], ["Tf", "Крајна T", 50, 300, 5, " °C"]].forEach(([k, l, mn, mx, st, u]) => {
        const r = el("div", "chr-ctl"), s = el("input"), o = el("output"); s.type = "range"; s.min = mn; s.max = mx; s.step = st; s.value = M[k];
        const up = () => { M[k] = +s.value; o.textContent = (k === "ramp" && !M[k] ? "изотерма" : fmt(M[k], st < 1 ? 1 : 0) + u); }; s.oninput = up; up(); r.append(el("span", "", l), s, o); ctl.appendChild(r); });
      const vs = el("select", "chr-num"); vs.style.width = "100%"; vials.forEach((v, i) => { const o = el("option", "", v.name); o.value = i; vs.appendChild(o); }); vs.onchange = () => vialSel = +vs.value; vs.value = vialSel;
      ctl.append(el("p", "in-hint", "Шишенце за инјектирање (1 µL):"), vs);
      const go = el("button", "btn primary", "💉 Инјектирај"); go.type = "button"; ctl.appendChild(go); go.onclick = inject;
    }
    function newTask(k) {
      S.k = k; S.runs = []; S.cur = null; ans = null; vialSel = 0; intro.innerHTML = INTRO + "<br><br><b>Задача:</b> " + TASKS[k].ok; out.innerHTML = "";
      const T = TASKS[k];
      if (T.kind === "opt") vials = [{ name: "Смеса: " + T.ids.map(id => C[id].name.replace("n-", "")).join(", "), items: T.ids.map(id => ({ id, c: 200 })) }];
      if (T.kind === "id") { if (T.variants) { const v = H.pick(T.variants); S.vname = v.n; S.truth = v.ids.slice(); } else { S.vname = null; } const extra = H.shuffle(T.cands.filter(x => !T.must.includes(x))); const n = T.must.length ? H.pick([0, 1, 1]) : H.pick([2, 3, 3]); if (!T.variants) { S.truth = T.must.concat(extra.slice(0, n)); if (S.truth.length < 2) S.truth.push(extra[0]); }
        vials = T.cands.concat(k === "B" ? ["pro"] : []).map(id => ({ name: "Стандард: " + C[id].name, items: [{ id, c: 200 }] })); vials.push({ name: "❓ Непознат примерок", items: S.truth.map(id => ({ id, c: 200 })), unk: true }); }
      if (k === "G") { S.cet = Math.round(H.rand(100, 1800)); vials = [{ name: "Стандард: етанол 500 mg/L + пропан-1-ол 500 mg/L", items: [{ id: "eto", c: 500 }, { id: "pro", c: 500 }] },
        { name: "Крв на возач + внатрешен стандард (пропан-1-ол 500 mg/L)", items: [{ id: "eto", c: S.cet }, { id: "ace", c: 60 }, { id: "pro", c: 500 }] }]; }
      if (k === "Cq") { S.cet = Math.round(H.rand(80, 380)); vials = [{ name: "Стандард: етанол 200 mg/L + пропан-1-ол 200 mg/L", items: [{ id: "eto", c: 200 }, { id: "pro", c: 200 }] },
        { name: "Примерок + внатрешен стандард (пропан-1-ол 200 mg/L)", items: [{ id: "eto", c: S.cet }, { id: "eac", c: 150 }, { id: "pro", c: 200 }] }]; }
      sliders(); build();
    }
    const view = el("div"), tbl = el("div"), log = el("div"), fb = el("div");
    function build() {
      out.innerHTML = ""; const box = el("div", "in-step"); box.innerHTML = "<h4>Гасен хроматограф</h4>"; const sch = H.svg("svg", { viewBox: "0 -66 600 380", class: "chr-schem" }, box); sch.style.cssText = "width:100%;height:auto;max-height:none;display:block";
      const colD = colPathD();
      sch.innerHTML = `<defs><linearGradient id="gs-cyl" x1="0" x2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset=".5" stop-color="#f8fafc"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
        <linearGradient id="gs-int" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5058"/><stop offset="1" stop-color="#2f343b"/></linearGradient>
        <linearGradient id="gs-met" x1="0" x2="1"><stop offset="0" stop-color="#9ca3af"/><stop offset=".5" stop-color="#e5e7eb"/><stop offset="1" stop-color="#6b7280"/></linearGradient></defs>
      <rect x="10" y="146" width="36" height="138" rx="10" fill="url(#gs-cyl)" stroke="#64748b" stroke-width="1.5"/><rect x="22" y="134" width="12" height="14" rx="3" fill="#475569"/><rect x="18" y="132" width="20" height="5" rx="2" fill="#334155"/>
      <circle cx="28" cy="166" r="7" fill="#fff" stroke="#64748b"/><path d="M28 166L32 162" stroke="#dc2626" stroke-width="1.2"/>
      <text x="28" y="230" font-size="14" font-weight="700" text-anchor="middle" fill="#334155">He</text><text x="28" y="300" font-size="9" text-anchor="middle" fill="#475569">гас носач</text>
      <path d="M28 132V62H118" fill="none" stroke="#94a3b8" stroke-width="3"/><path class="gs-fd" d="M28 132V62H118" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 12" opacity=".85"/>
      <rect x="80" y="104" width="500" height="180" rx="12" fill="#d1d5db" stroke="#6b7280" stroke-width="1.5"/>
      <rect x="92" y="116" width="476" height="134" rx="6" fill="url(#gs-int)" stroke="#4b5563"/><rect id="gs-glow" x="92" y="116" width="476" height="134" rx="6" fill="#f97316" opacity=".04"/>
      <circle cx="530" cy="225" r="19" fill="#111827" stroke="#6b7280" stroke-width="1.5"/><g id="gs-fan" fill="#9ca3af"><ellipse cx="530" cy="215" rx="3.8" ry="8"/><ellipse cx="530" cy="215" rx="3.8" ry="8" transform="rotate(90 530 225)"/><ellipse cx="530" cy="215" rx="3.8" ry="8" transform="rotate(180 530 225)"/><ellipse cx="530" cy="215" rx="3.8" ry="8" transform="rotate(270 530 225)"/></g><circle cx="530" cy="225" r="3.5" fill="#4b5563"/>
      <text x="190" y="214" font-size="10" text-anchor="middle" fill="#e5e7eb">капиларна колона</text>
      <rect x="100" y="256" width="96" height="20" rx="3" fill="#0f172a"/><text id="goven" x="148" y="271" font-size="13" font-family="monospace" font-weight="700" text-anchor="middle" fill="#86efac"></text>
      <text x="370" y="270" font-size="10" text-anchor="middle" fill="#374151">печка (колона = стационарна фаза)</text><circle id="gs-led" cx="552" cy="266" r="4" fill="#9ca3af"/>
      <rect x="118" y="52" width="34" height="52" rx="4" fill="url(#gs-met)" stroke="#6b7280" stroke-width="1.3"/><rect x="118" y="90" width="34" height="8" fill="#fb923c" opacity=".6"/>
      <rect x="125" y="56" width="20" height="44" rx="3" fill="#bae6fd" fill-opacity=".5" stroke="#7dd3fc"/><path d="M128 78q3 -4 6 0t6 0t5 0" stroke="#fff" stroke-width="1.4" fill="none"/>
      <rect x="121" y="42" width="28" height="10" rx="2" fill="#475569"/><path d="M125 43v8M129 43v8M133 43v8M137 43v8M141 43v8M145 43v8" stroke="#94a3b8" stroke-width=".8"/><rect x="130" y="50" width="10" height="3" fill="#111827"/>
      <path d="M152 86H178" stroke="#94a3b8" stroke-width="2.5"/><path class="gs-fd" d="M152 86H178" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 8" opacity=".8"/><text x="181" y="89" font-size="8" fill="#475569">split вентил</text>
      <text x="158" y="58" font-size="10" font-weight="700" fill="#334155">Инјектор</text><text x="158" y="70" font-size="9" fill="#9a3412">250 °C</text>
      <rect x="483" y="64" width="34" height="40" rx="4" fill="url(#gs-met)" stroke="#6b7280" stroke-width="1.3"/><rect x="488" y="38" width="24" height="28" rx="3" fill="#e0f2fe" fill-opacity=".5" stroke="#7dd3fc" stroke-width="1.3"/>
      <rect x="494" y="30" width="12" height="4" rx="1" fill="#475569"/><line x1="500" y1="34" x2="500" y2="40" stroke="#475569"/>
      <path id="gs-fl" d="M500 64q-6 -9 0 -20q6 11 0 20z" fill="#fb923c" transform="translate(500 64) scale(.5) translate(-500 -64)"/>
      <rect x="486" y="74" width="7" height="26" rx="1.5" fill="#fff" stroke="#94a3b8"/><rect id="gs-bar" x="487" y="99" width="5" height="0" fill="#ea580c"/>
      <path d="M560 74H517" stroke="#94a3b8" stroke-width="2.5"/><path class="gs-fd" d="M560 74H517" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 8" opacity=".8"/><text x="563" y="77" font-size="9" fill="#475569">H₂</text>
      <path d="M560 90H517" stroke="#94a3b8" stroke-width="2.5"/><path class="gs-fd" d="M560 90H517" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 8" opacity=".8"/><text x="563" y="93" font-size="9" fill="#475569">воздух</text>
      <text x="500" y="20" font-size="10" font-weight="700" text-anchor="middle" fill="#334155">Детектор FID</text><text x="500" y="9" font-size="9" text-anchor="middle" fill="#9a3412">300 °C</text>
      <path id="gs-col" d="${colD}" fill="none" stroke="#6b7280" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path class="gs-fd" d="${colD}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 14" opacity=".5"/>
      <g id="gs-bands"></g>
      <ellipse id="gs-puff" cx="135" cy="80" rx="4" ry="9" fill="#fde68a" opacity="0"/>
      <g id="gs-syr" transform="translate(0 -34)"><line x1="135" y1="26" x2="135" y2="70" stroke="#64748b" stroke-width="1.5"/><rect x="127" y="-8" width="16" height="34" rx="2.5" fill="#f1f5f9" fill-opacity=".92" stroke="#64748b" stroke-width="1.4"/><path d="M143 0h-4M143 6h-3M143 12h-4M143 18h-3" stroke="#94a3b8"/>
        <rect x="128.5" y="8" width="13" height="16" fill="#7dd3fc" opacity=".85"/><g id="gs-plg"><rect x="131" y="-6" width="8" height="14" fill="#cbd5e1" stroke="#64748b"/><line x1="135" y1="-26" x2="135" y2="-6" stroke="#64748b" stroke-width="2"/><rect x="126" y="-30" width="18" height="4" rx="2" fill="#475569"/></g></g>
      <g id="gs-leg"></g>`;
      S.sch = sch; S.G = { col: sch.querySelector("#gs-col"), syr: sch.querySelector("#gs-syr"), plg: sch.querySelector("#gs-plg"), bar: sch.querySelector("#gs-bar"), fl: sch.querySelector("#gs-fl"), glow: sch.querySelector("#gs-glow"), fan: sch.querySelector("#gs-fan"), led: sch.querySelector("#gs-led"), puff: sch.querySelector("#gs-puff"), fds: sch.querySelectorAll(".gs-fd"), bands: sch.querySelector("#gs-bands"), leg: sch.querySelector("#gs-leg") };
      const ctr = el("div", "in-row"), rp = el("button", "btn ghost", "🔁 Повтори ја анимацијата"), sp = el("select", "chr-num"); rp.type = "button"; sp.style.width = "auto"; sp.setAttribute("aria-label", "Брзина на анимацијата");
      [[0.5, "бавно"], [1, "нормално"], [2, "брзо"], [4, "многу брзо"]].forEach(([v, l]) => { const o = el("option", "", "Брзина: " + l); o.value = v; if (v === S.spd) o.selected = true; sp.appendChild(o); });
      sp.onchange = () => { S.spd = +sp.value; }; rp.onclick = () => { if (S.cur) draw(S.cur, true); }; ctr.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0"; ctr.append(rp, sp); box.appendChild(ctr); box.appendChild(el("h4", "", "Хроматограм"));
      const sv = H.svg("svg", { viewBox: "0 0 600 270", class: "chr-svg" }, box);
      sv.addEventListener("mousemove", e => { if (!S.cur) return; const r = sv.getBoundingClientRect(), x = (e.clientX - r.left) * 600 / r.width; if (x < 50 || x > 590) return;
        const t = (x - 50) / 540 * S.cur.tr.tEnd, ci = Math.round(t / S.cur.tr.dt), g = sv.querySelector("#gcur"), tx = sv.querySelector("#gctt");
        g.setAttribute("x1", x); g.setAttribute("x2", x); g.setAttribute("opacity", 1); tx.setAttribute("x", Math.min(x + 4, 520)); tx.textContent = "t = " + fmt(t, 2) + " min, сигнал " + Math.round(S.cur.tr.y[ci] || 0); tx.setAttribute("opacity", 1); });
      sv.addEventListener("mouseleave", () => { sv.querySelector("#gcur").setAttribute("opacity", 0); sv.querySelector("#gctt").setAttribute("opacity", 0); }); S.sv = sv; sv.innerHTML = frame();
      out.append(box, tbl, fb, log); tbl.innerHTML = ""; fb.innerHTML = ""; log.innerHTML = ""; answerBox();
    }
    const frame = () => '<line x1="50" y1="225" x2="590" y2="225" stroke="#334155"/><line x1="50" y1="20" x2="50" y2="225" stroke="#334155"/><text x="320" y="262" font-size="11" text-anchor="middle" fill="#334155">време (min)</text><text x="14" y="125" font-size="11" fill="#334155" transform="rotate(-90 14 125)" text-anchor="middle">сигнал на детекторот</text><g id="gx"></g><clipPath id="gcl"><rect id="gclr" x="50" y="0" width="0" height="270"/></clipPath><path id="gp" fill="none" stroke="#c2410c" stroke-width="1.4" clip-path="url(#gcl)"/><g id="gl"></g><line id="gcur" x1="0" x2="0" y1="20" y2="225" stroke="#64748b" stroke-dasharray="3 3" opacity="0"/><text id="gctt" x="0" y="42" font-size="10" fill="#334155" opacity="0"></text><text id="gt" x="56" y="12" font-size="11" text-anchor="start" fill="#334155"></text>';
    function inject() {
      const m = Object.assign({}, M); if (Math.max(m.T0, m.Tf) > COLS[m.col].max) { fb.innerHTML = `<p class="in-fb-bad">✘ Температурата надминува ${COLS[m.col].max} °C за оваа стационарна фаза: фазата се распаѓа („крвари“) и колоната се оштетува. Намали ја температурата или избери друга колона.</p>`; return; }
      if (m.ramp > 0 && m.Tf < m.T0) { fb.innerHTML = "<p class='in-fb-bad'>Крајната температура мора да е поголема од почетната.</p>"; return; }
      const v = vials[vialSel]; const sim = simulate(m, v.items), tr = trace(sim), pk = integrate(tr);
      const run = { n: S.runs.length + 1, m, v, sim, tr, pk }; S.runs.push(run); S.cur = run; fb.innerHTML = ""; draw(run, true); runsLog();
    }
    const COLORS = ["#e11d48", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#be185d", "#65a30d", "#475569"], INJ = 1100, cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    function zAt(p, t) { if (p.solv) return cl(t / p.tR); const q = t / 0.02, i = Math.floor(q), tj = p.traj; if (i >= tj.length - 1) return 1; return cl(tj[i] + (tj[i + 1] - tj[i]) * (q - i)); }
    function colPathD() { const cx = 330, cy = 183, r0 = 50, dr = 6.9, N = 5.25, steps = Math.round(N * 36); let d = "M135 98V124Q135 133 160 133H330";
      for (let i = 1; i <= steps; i++) { const th = 2 * Math.PI * N * i / steps, r = r0 - dr * N * i / steps; d += `L${(cx + r * Math.sin(th)).toFixed(1)} ${(cy - r * Math.cos(th)).toFixed(1)}`; }
      return d + "H490Q500 183 500 173V98"; }
    function idleSch() { const G = S.G; if (!G) return; G.bands.innerHTML = ""; G.syr.setAttribute("transform", "translate(0 -34)"); G.plg.setAttribute("transform", "translate(0 0)"); G.bar.setAttribute("height", 0); G.bar.setAttribute("y", 99); G.glow.setAttribute("opacity", ".04"); G.puff.setAttribute("opacity", 0); G.led.setAttribute("fill", "#9ca3af");
      G.fl.setAttribute("transform", "translate(500 64) scale(.5) translate(-500 -64)"); }
    function buildBands(run) {
      const G = S.G; G.bands.innerHTML = ""; G.leg.innerHTML = ""; const ord = run.sim.peaks.filter(p => !p.solv).sort((a, b) => a.tR - b.tR);
      run.bands = run.sim.peaks.map(p => { const c = p.solv ? "#94a3b8" : COLORS[ord.indexOf(p) % COLORS.length];
        return { p, pl: H.svg("polyline", { fill: "none", stroke: c, "stroke-width": p.solv ? 5 : 8, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, G.bands) }; });
      if (TASKS[S.k].kind === "opt") { let x = 100; ord.forEach((p, i) => { const nm = C[p.id].name.replace("n-", ""); H.svg("circle", { cx: x, cy: 303, r: 4, fill: COLORS[i % COLORS.length] }, G.leg); const tx = H.svg("text", { x: x + 8, y: 306.5, "font-size": 10, fill: "#334155" }, G.leg); tx.textContent = nm; x += 22 + nm.length * 5.6; }); }
    }
    function frameSch(run, el0, tm, ymax) {
      const G = S.G, L = G.col.getTotalLength(), P = z => G.col.getPointAtLength(cl(z) * L), u = el0 / INJ, desc = cl(u / .3), push = cl((u - .3) / .3), rise = cl((u - .75) / .25), vis = cl((el0 - INJ * .55) / (INJ * .45)), off = -el0 / 22, f0 = cl((Tof(run.m, tm) - 40) / 260);
      G.syr.setAttribute("transform", `translate(0 ${-34 * (1 - desc + rise)})`); G.plg.setAttribute("transform", `translate(0 ${10 * push * (1 - rise)})`);
      G.puff.setAttribute("opacity", (.8 * push * (1 - cl((u - .85) / .35))).toFixed(2)); G.puff.setAttribute("rx", (4 + 8 * push).toFixed(1)); G.puff.setAttribute("cy", (78 + 20 * cl((u - .7) / .6)).toFixed(1));
      G.fds.forEach(e => e.setAttribute("stroke-dashoffset", off)); G.fan.setAttribute("transform", `rotate(${(el0 * .35) % 360} 530 225)`);
      G.glow.setAttribute("opacity", (.04 + .34 * f0).toFixed(2)); G.led.setAttribute("fill", "#22c55e"); G.led.setAttribute("opacity", (.65 + .35 * Math.sin(el0 / 160)).toFixed(2));
      run.bands.forEach(b => { const p = b.p; if (tm >= p.tR) { b.pl.setAttribute("opacity", 0); return; }
        const z = zAt(p, tm), hl = Math.max(.004, 2.2 * p.sg * p.ve * Math.sqrt(Math.max(z, .04))), pts = [];
        for (let k = 0; k < 7; k++) { const q = P(z - hl + 2 * hl * k / 6); pts.push(q.x.toFixed(1) + "," + q.y.toFixed(1)); }
        b.pl.setAttribute("points", pts.join(" ")); b.pl.setAttribute("opacity", (vis * .93).toFixed(2)); });
      const idx = Math.min(run.tr.y.length - 1, Math.round(tm / run.tr.dt)), f = cl(run.tr.y[idx] / (ymax / 1.1)), h = 24 * f;
      G.bar.setAttribute("y", 99 - h); G.bar.setAttribute("height", h); G.fl.setAttribute("transform", `translate(500 64) scale(${(.5 + 1.1 * f).toFixed(2)}) translate(-500 -64)`);
    }
    function draw(run, anim) {
      const sv = S.sv, tr = run.tr, ymax = Math.max(...tr.y) * 1.1; const X = t => 50 + 540 * t / tr.tEnd, Y = v => 225 - 200 * v / ymax;
      let d = ""; tr.y.forEach((v, i) => { const noise = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.0015 * ymax; d += (i ? "L" : "M") + X(i * tr.dt).toFixed(1) + " " + Y(v + noise).toFixed(1); });
      sv.querySelector("#gp").setAttribute("d", d); const gx = sv.querySelector("#gx"); gx.innerHTML = "";
      const stp = tr.tEnd > 20 ? 5 : tr.tEnd > 8 ? 2 : 1; for (let t = 0; t <= tr.tEnd; t += stp) { H.svg("line", { x1: X(t), x2: X(t), y1: 225, y2: 230, stroke: "#334155" }, gx); const tx = H.svg("text", { x: X(t), y: 242, "font-size": 10, "text-anchor": "middle", fill: "#334155" }, gx); tx.textContent = t; }
      const gl = sv.querySelector("#gl"); gl.innerHTML = "";
      let prevX = -99, lvl = 0;
      run.pk.forEach((p, i) => { const x = X(p.t); lvl = (x - prevX < 28) ? (lvl + 1) % 3 : 0; prevX = x; const top = Y(p.h), ly = Math.max(16, top - 5 - lvl * 11);
        if (lvl) H.svg("line", { x1: x, x2: x, y1: ly + 2, y2: top - 1, stroke: "#94a3b8", "stroke-width": 0.6 }, gl);
        const tx = H.svg("text", { x, y: ly, "font-size": 9.5, "text-anchor": "middle", fill: "#475569" }, gl); tx.textContent = fmt(p.t, 2); });
      const clr = sv.querySelector("#gclr"), tt = sv.querySelector("#gt"); gl.setAttribute("opacity", 0);
      const fin = () => { clr.setAttribute("width", 540); gl.setAttribute("opacity", 1); tt.textContent = `${COLS[run.m.col].short}, ${run.m.len || 30} m, ${fmt(run.m.film || 0.25, 2)} µm, ${fmt(run.m.flow, 1)} mL/min, N ≈ ${Math.round(run.sim.N / 1000)}·10³`; table(run); evalRun(run); const ov = document.getElementById('goven'); if (ov) ov.textContent = Math.round(Tof(run.m, tr.tEnd)) + ' °C'; };
      const my = ++S.tok; if (!anim || H.reduced) { idleSch(); fin(); return; }
      const T = 6500 / (S.spd || 1); let t0 = null; buildBands(run); clr.setAttribute("width", 0);
      requestAnimationFrame(function f(ts) { if (my !== S.tok) return; if (t0 == null) t0 = ts; const el0 = ts - t0 * 1, x = cl((el0 - INJ) / T), tm = x * tr.tEnd;
        clr.setAttribute("width", 540 * x); frameSch(run, el0, tm, ymax);
        const tc = Math.round(Tof(run.m, tm)); tt.textContent = el0 < INJ ? "Инјектирање на пробата (1 µL)…" : `T печка: ${tc} °C · t = ${fmt(tm, 1)} min`; const ov = document.getElementById('goven'); if (ov) ov.textContent = tc + ' °C';
        if (x < 1) requestAnimationFrame(f); else { idleSch(); fin(); } });
    }
    function table(run) {
      let h = `<h4>Интегрирање (Run #${run.n}: ${run.v.name})</h4><table class="chr-tbl"><tr><th>Пик</th><th>tR (min)</th><th>Површина</th><th>Висина</th></tr>`;
      run.pk.forEach((p, i) => h += `<tr><td>${i + 1}${i === 0 ? " (растворувач)" : ""}</td><td>${fmt(p.t, 3)}</td><td>${fmt(p.area, 2)}</td><td>${fmt(p.h, 1)}</td></tr>`); tbl.innerHTML = "<div class='chr-scroll'>" + h + "</table></div>";
    }
    function runsLog() {
      let h = "<h4>Дневник на анализи</h4><table class='chr-tbl'><tr><th>#</th><th>Примерок</th><th>Колона</th><th>Програма</th></tr>";
      S.runs.forEach(r => h += `<tr class="chr-run${r === S.cur ? " cur" : ""}" data-n="${r.n}"><td>${r.n}</td><td>${r.v.name}</td><td>${COLS[r.m.col].short}, ${r.m.len || 30} m, ${fmt(r.m.film || 0.25, 2)} µm</td><td>${r.m.T0} °C/${r.m.hold} min${r.m.ramp ? " → " + r.m.Tf + " °C @ " + r.m.ramp : " (изотерма)"}, ${fmt(r.m.flow, 1)} mL/min</td></tr>`);
      log.innerHTML = "<div class='chr-scroll'>" + h + "</table></div>"; log.querySelectorAll(".chr-run").forEach(tr => tr.onclick = () => { S.cur = S.runs[+tr.dataset.n - 1]; draw(S.cur, false); runsLog(); });
    }
    function evalRun(run) {
      const T = TASKS[S.k]; if (T.kind !== "opt") { fb.innerHTML = ""; return; }
      const pk = run.sim.peaks.filter(p => !p.solv).sort((a, b) => a.tR - b.tR); if (pk.length < T.ids.length) { fb.innerHTML = "<p class='in-fb-bad'>✘ Не сите компоненти излегоа од колоната во рамките на анализата. Зголеми ја крајната температура или брзината на загревање.</p>"; return; }
      const rs = []; for (let i = 1; i < pk.length; i++) rs.push(1.18 * (pk[i].tR - pk[i - 1].tR) / (2.355 * (pk[i].sg + pk[i - 1].sg)));
      const minRs = Math.min(...rs), last = pk[pk.length - 1].tR, okR = rs.every(x => x >= 1.5), okT = last <= T.limit;
      let m = `<i>R</i><sub>s</sub>: ${rs.map((x, i) => `${C[pk[i].id].name.replace("n-", "")}/${C[pk[i + 1].id].name.replace("n-", "")} = <b>${fmt(x, 2)}</b>`).join(", ")}. Последниот пик: ${fmt(last, 1)} min.`;
      fb.innerHTML = okR && okT ? `<p class="in-fb-ok">${minRs >= 2 ? "✔ Одлично! Сите <i>R</i><sub>s</sub> ≥ 2 и анализата е брза." : "✔ Задоволително: сите <i>R</i><sub>s</sub> ≥ 1,5 (пиковите се разделени до базната линија), но некои се многу блиску еден до друг на хроматограмот (најмал <i>R</i><sub>s</sub> = " + fmt(minRs, 2) + "). Анализата е брза."} ${m}</p>` : `<p class="${okR ? "in-fb-ok" : "in-fb-bad"}">${okR ? "✔ Доволно разделување, но анализата е предолга (&gt; " + T.limit + " min). Зголеми ја брзината на загревање или протокот." : "✘ Пиковите не се доволно разделени (<i>R</i><sub>s</sub> &lt; 1,5). Забави го загревањето или намали ја почетната температура."} ${m}</p>`;
    }
    function answerBox() {
      if (TASKS[S.k].kind === "opt") return; const s = el("div", "in-step"); fb.after(s); const keep = out; s.innerHTML = "<h4>Одговор</h4>";
      if (TASKS[S.k].kind === "id") { const row = el("div", "chr-opts"), sel = new Set(); TASKS[S.k].cands.forEach(id => { const b = el("button", "chr-opt", C[id].name); b.type = "button"; b.onclick = () => { sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle("on"); }; row.appendChild(b); });
        const go = el("button", "btn ghost", "✔ Провери"), m = el("div"); go.type = "button"; s.append(el("p", "in-hint", "Означи ги супстанците во непознатиот примерок (од " + TASKS[S.k].cands.length + " можни):"), row, go, m);
        go.onclick = () => { const ok = S.truth.length === sel.size && S.truth.every(x => sel.has(x)); const usedP = S.runs.some(r => COLS[r.m.col].w >= 0.5 && r.v.unk);
          m.innerHTML = ok ? `<p class="in-fb-ok">✔ Точно!${S.vname ? " Примерокот е " + S.vname + "." : ""} ${S.k !== "B" ? "Идентификацијата се прави со споредба на времињата на задржување со стандарди под исти услови." : usedP ? "Поларната стационарна фаза го раздели етанолот од етил ацетатот." : "Внимавај: на неполарна колона етанолот и етил ацетатот речиси се совпаѓаат (слични точки на вриење); за сигурна идентификација треба втора колона со поларна стационарна фаза."}</p>` : "<p class='in-fb-bad'>✘ Не е точно. Спореди ги tR на примерокот со стандардите (на иста колона и иста програма). Ако два пика се преклопуваат, пробај друга стационарна фаза.</p>"; }; }
      else { const T = TASKS[S.k], i = el("input", "chr-num"); i.placeholder = T.unit; const go = el("button", "btn ghost", "✔ Провери"), m = el("div"); go.type = "button";
        s.append(el("p", "in-hint", "Концентрација на етанол во примерокот (" + T.unit + "). Формула: RRF = (A<sub>етанол</sub>/A<sub>IS</sub>) / (c<sub>етанол</sub>/c<sub>IS</sub>) од стандардот; c<sub>x</sub> = (A<sub>x</sub>/A<sub>IS</sub>) · c<sub>IS</sub> / RRF. Во примерокот има и друга испарлива компонента: внимавај на колоната и на пиковите!"), i, go, m);
        go.onclick = () => { const v = H.num(i.value), tr = S.cet / T.fac; const ok = isFinite(v) && Math.abs(v - tr) / tr < 0.04;
          m.innerHTML = ok ? `<p class="in-fb-ok">✔ Точно (c = ${fmt(tr, T.fac > 1 ? 2 : 0)} ${T.unit}).${S.k === "G" ? (tr > 0.5 ? " Тоа е над дозволената граница од 0,5 g/L: возачот е казнив." : " Тоа е под дозволената граница од 0,5 g/L.") : ""} Внатрешниот стандард ги компензира грешките при инјектирање.</p>` : "<p class='in-fb-bad'>✘ Не се совпаѓа (±4 %). Дали етанолот е разделен од другите пикови? Дали ги користиш површините на точните пикови (стандард и примерок под исти услови)?</p>"; }; }
    }
    ts.onchange = () => newTask(ts.value); newTask("A");
  };
  window.__gc = { C, simulate, trace, integrate };
})();
