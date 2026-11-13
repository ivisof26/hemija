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
    ebu: { id: "ebu", name: "етил бутаноат", np: [0.45, 36], wax: [0.38, 35], rf: 0.65 },
    hac: { id: "hac", name: "хексил ацетат", np: [1.9, 41], wax: [1.0, 39], rf: 0.7 },
    but: { id: "but", name: "1-бутанол", np: [0.60, 39], wax: [4.0, 48], rf: 0.6 }
  };
  /* стационарна фаза: поларноста (w) е тежина помеѓу неполарна (PDMS) и многу поларна (PEG) */
  const COLS = {
    np: { name: "DB-1: 100 % диметилполисилоксан (неполарна), max 300 °C", short: "DB-1 (неполарна)", w: 0, max: 300 },
    db5: { name: "DB-5: 5 % фенил / 95 % диметилполисилоксан (слабо поларна), max 320 °C", short: "DB-5 (слабо поларна)", w: 0.12, max: 320 },
    mid: { name: "DB-1701: 14 % цијанопропил-фенил (средно поларна), max 280 °C", short: "DB-1701 (средно поларна)", w: 0.5, max: 280 },
    wax: { name: "WAX: полиетилен гликол (поларна), max 250 °C", short: "WAX (поларна)", w: 1, max: 250 }
  };
  const TASKS = {
    A: { kind: "opt", name: "1. Оптимизација: н-алкани C10–C14 и изомер", ids: ["C10", "C11", "C12", "iC12", "C13", "C14"], limit: 8, ok: "Подеси ја програмата така што сите соседни пикови имаат <i>R</i><sub>s</sub> ≥ 1,5, а последниот пик излегува за ≤ 8 min." },
    D: { kind: "opt", name: "2. Оптимизација: бензен, толуен, етилбензен, p-ксилен", ids: ["ben", "tol", "ebz", "pxy"], limit: 8, ok: "Ароматични јаглеводороди од бензин. Етилбензенот и p-ксиленот се слични. Постигни <i>R</i><sub>s</sub> ≥ 1,5 за сите соседни пикови, а последниот пик да излезе за ≤ 8 min." },
    B: { kind: "id", name: "3. Идентификација: растворувачи (избор на колона)", cands: ["ace", "eto", "eac", "tol"], must: ["eto", "eac"], ok: "Непознат примерок содржи неколку од: ацетон, етанол, етил ацетат, толуен. Инјектирај стандарди и примерок, па определи." },
    E: { kind: "id", name: "4. Идентификација: алкохоли", cands: ["met", "eto", "ipr", "pro", "but"], must: [], ok: "Непознат примерок содржи 2–3 алкохоли. Инјектирај стандарди и примерок на иста колона и програма, па спореди ги времињата на задржување." },
    F: { kind: "id", name: "5. Етерично масло: од што е?", cands: ["pin", "lim", "lin", "men", "crv"], must: [], variants: [{ n: "лимон", ids: ["lim", "pin"] }, { n: "нане", ids: ["men", "lim"] }, { n: "лаванда", ids: ["lin", "pin"] }, { n: "ким", ids: ["crv", "lim"] }],
      ok: "Непознато етерично масло (лимон, нане, лаванда или ким). Терпените имаат високи точки на вриење, па е потребно температурно програмирање. Инјектирај стандарди и примерок, па определи ги составките." },
    H: { kind: "id", name: "6. 🍌 Естери во овошна арома", cands: ["eac", "iaa", "ebu", "hac"], must: [], variants: [{ n: "банана (изоамил ацетат + етил ацетат)", ids: ["iaa", "eac"] }, { n: "ананас (етил бутаноат + етил ацетат)", ids: ["ebu", "eac"] }, { n: "јаболко (хексил ацетат + етил бутаноат)", ids: ["hac", "ebu"] }],
      ok: "Вештачка овошна арома содржи мирисни естери. Инјектирај стандарди и примерок и определи што мирише: банана, ананас или јаболко." },
    X: { kind: "opt", name: "9. 🧪 Критичен пар: m- и p-ксилен (избор на стационарна фаза)", ids: ["ebz", "pxy", "mxy", "oxy"], limit: 20, ok: "Етилбензенот и трите ксилена имаат речиси исти точки на вриење. m- и p-ксиленот се речиси исти и на неполарна колона не се разделуваат воопшто. Пробај друга <b>стационарна фаза</b> (поларна), подолга колона или поинаква дебелина на филмот, па постигни <i>R</i><sub>s</sub> ≥ 1,5 за сите соседни пикови за ≤ 20 min." },
    Cq: { kind: "quant", fac: 1, unit: "mg/L", name: "7. Квантификација со внатрешен стандард", ok: "Одреди ја концентрацијата на етанол во примерок со внатрешен стандард пропан-1-ол (200 mg/L)." },
    G: { kind: "quant", fac: 1000, unit: "g/L", name: "8. 🚗 Алкохол во крв на возач (внатрешен стандард)", ok: "Полицијата зема крв од возач (анализа на пареи над примерокот). Содржината на етанол се одредува со внатрешен стандард пропан-1-ол (0,5 g/L). Во крвта има и ацетон. Дали возачот ја надминува дозволената граница од 0,5 g/L?" }
  };
  C.iC12.np = [C.C12.np[0] * 0.92, C.C12.np[1]]; C.iC12.wax = [C.C12.wax[0] * 0.92, C.C12.wax[1]];
  function kT(c, col, T, film) { const w = COLS[col].w, a = c.np, b = c.wax; const k100 = Math.exp(Math.log(a[0]) + w * (Math.log(b[0]) - Math.log(a[0]))), dH = a[1] + w * (b[1] - a[1]);
    return k100 * (film / 0.25) * Math.exp(dH * 1000 / R * (1 / (T + 273.15) - 1 / T0K)); }
  /* температурен програм: почетно задржување → чекор 1 → задржување → чекор 2 → задржување */
  function progPts(m) {
    const P = [[0, m.T0]]; if (!(m.ramp > 0)) { P.push([Math.max(1, m.hold), m.T0]); return P; }
    let t = m.hold; if (t > 0) P.push([t, m.T0]);
    t += Math.max(0, m.Tf - m.T0) / m.ramp; P.push([t, Math.max(m.Tf, m.T0)]);
    if (m.hF > 0) { t += m.hF; P.push([t, m.Tf]); }
    if (m.ramp2 > 0 && m.T2 > m.Tf) { t += (m.T2 - m.Tf) / m.ramp2; P.push([t, m.T2]); if (m.h2 > 0) { t += m.h2; P.push([t, m.T2]); } }
    return P;
  }
  function Tof(m, t) { const P = progPts(m); if (t <= 0) return P[0][1]; for (let i = 1; i < P.length; i++) { if (t <= P[i][0]) { const a = P[i - 1], b = P[i]; return b[0] === a[0] ? b[1] : a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); } } return P[P.length - 1][1]; }
  function progStr(m) {
    if (!(m.ramp > 0)) return m.T0 + " °C (изотерма)";
    let s = m.T0 + " °C/" + m.hold + " min → " + m.Tf + " °C @ " + m.ramp + " °C/min" + (m.hF > 0 ? " (" + m.hF + " min)" : "");
    if (m.ramp2 > 0 && m.T2 > m.Tf) s += " → " + m.T2 + " °C @ " + m.ramp2 + " °C/min" + (m.h2 > 0 ? " (" + m.h2 + " min)" : "");
    return s;
  }
  function simulate(m, items) {
    const len = m.len || 30, film = m.film || 0.25, LC = len * 100, tM = VCOL * (len / 30) / m.flow, u = LC / (tM * 60), Hh = 1.8 * (0.75 + film) * (0.08 + 2.4 / u + 0.003 * u), N = LC * 10 / Hh;
    const peaks = [{ id: "solv", tR: tM * 1.02, sg: 0.01 + tM * 0.02, A: 40, solv: true }];
    items.forEach(it => { const c = C[it.id]; let z = 0, t = 0, dt = 0.004; const mx = 45;
      while (z < 1 && t < mx) { z += dt / (tM * (1 + kT(c, m.col, Tof(m, t), film))); t += dt; }
      if (t >= mx) return; const ke = kT(c, m.col, Tof(m, t), film);
      const sg = Math.sqrt(Math.pow(tM * (1 + ke) / Math.sqrt(N), 2) + 0.008 * 0.008);
      peaks.push({ id: it.id, tR: t, sg, A: it.c * c.rf * 0.5 * (1 + 0.01 * (Math.random() - .5) * 2) }); });
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

  const INTRO = `Целта на оваа вежба е да се запознаете со принципот на <b>гасна хроматографија</b> (GC): разделување на испарливи супстанци што се носат со <b>гас носач</b> (мобилна фаза, хелиум) низ долга капиларна колона обложена со тенок филм од <b>стационарна фаза</b> (течен полимер). Супстанците кои повеќе се распределуваат во стационарната фаза (повисока температура на вриење, слична поларност) се елуираат (излегуваат) подоцна од колоната. Во вежбата може да се прилагоди изборот на стационарна фаза, должината на колоната, температурната програма и протокот, а како резултат се добива хроматограм (сигнал (пикови) во зависност од времето на задржување <i>t</i><sub>R</sub>) со определено разделување на пиковите (резолуција <i>R</i><sub>s</sub>).<br><b>Правило:</b> слично се раствора во слично: поларните супстанци (алкохоли) посилно се задржуваат на поларна стационарна фаза (WAX), а неполарните (јаглеводороди) на неполарна (DB-1).`;
  H.mods.gc = function (root) {
    const S = { runs: [], cur: null };
    const top = el("div", "in-row"), ts = el("select", "chr-num"); ts.style.width = "auto"; for (const k in TASKS) { const o = el("option", "", TASKS[k].name); o.value = k; ts.appendChild(o); }
    top.append(el("span", "", "<b>Задача:</b> "), ts); root.appendChild(top);
    const intro = el("p", "in-hint"); root.appendChild(intro);
    const lay = el("div", "chr-big"); root.appendChild(lay);
    const ctl = el("div", "in-step"), out = el("div"); lay.append(ctl, out);
    const M = { col: "np", len: 30, film: 0.25, flow: 1.2, T0: 60, hold: 1, ramp: 15, Tf: 250, hF: 0, ramp2: 0, T2: 280, h2: 0 };
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
      const rows = {}, prev = el("div", "chr-prog");
      const draw0 = () => { const P = progPts(M), tm = Math.max(...P.map(a => a[0]), 1), Tm = Math.max(...P.map(a => a[1])), Tn = Math.min(...P.map(a => a[1])); const W = 300, Hh = 70, X = t => 28 + (W - 36) * t / tm, Y = T => Hh - 14 - (Hh - 26) * (T - (Tn - 10)) / ((Tm + 10) - (Tn - 10));
        const bad = Math.max(...P.map(a => a[1])) > COLS[M.col].max;
        prev.innerHTML = `<svg viewBox="0 0 ${W} ${Hh}" class="chr-schem" role="img" aria-label="Температурен програм"><line x1="28" y1="${Hh - 14}" x2="${W - 6}" y2="${Hh - 14}" stroke="#334155"/><line x1="28" y1="6" x2="28" y2="${Hh - 14}" stroke="#334155"/><polyline fill="none" stroke="${bad ? "#dc2626" : "#c2410c"}" stroke-width="2" points="${P.map(a => X(a[0]).toFixed(1) + "," + Y(a[1]).toFixed(1)).join(" ")}"/><text x="${W - 6}" y="${Hh - 3}" font-size="9" text-anchor="end" fill="#334155">време: ${fmt(tm, 1)} min</text><text x="30" y="${Y(Tm).toFixed(1) - 2}" font-size="9" fill="#334155">${Math.round(Tm)} °C</text><text x="30" y="${Hh - 3}" font-size="9" fill="#334155">${Math.round(P[0][1])} °C</text></svg>`; };
      const vis = () => { const iso = !(M.ramp > 0); rows.hold.style.display = iso ? "none" : ""; rows.Tf.style.display = rows.hF.style.display = rows.ramp2.style.display = iso ? "none" : "";
        const two = !iso && M.ramp2 > 0; rows.T2.style.display = rows.h2.style.display = two ? "" : "none"; draw0(); };
      ctl.appendChild(el("p", "in-hint", "<b>Температурен програм на печката:</b> почни на ниска T (задржување), загревај со чекор 1, по желба задржи, па додај втор чекор за потешките супстанци. Чекор 0 = изотермно разделување."));
      ctl.appendChild(prev);
      [["flow", "Проток", 0.3, 3, 0.1, " mL/min"], ["T0", "Почетна T", 40, 200, 5, " °C"], ["hold", "Почетно задржување", 0, 5, 0.5, " min"], ["ramp", "Чекор 1", 0, 40, 1, " °C/min"], ["Tf", "T по чекор 1", 50, 300, 5, " °C"], ["hF", "Задржување на T по чекор 1", 0, 10, 0.5, " min"], ["ramp2", "Чекор 2", 0, 60, 1, " °C/min"], ["T2", "Крајна T (чекор 2)", 60, 320, 5, " °C"], ["h2", "Крајно задржување", 0, 10, 0.5, " min"]].forEach(([k, l, mn, mx, st, u]) => {
        const r = el("div", "chr-ctl"), s = el("input"), o = el("output"); s.type = "range"; s.min = mn; s.max = mx; s.step = st; s.value = M[k]; rows[k] = r;
        const up = () => { M[k] = +s.value; o.textContent = ((k === "ramp" || k === "ramp2") && !M[k] ? (k === "ramp" ? "изотерма" : "нема") : fmt(M[k], st < 1 ? 1 : 0) + u); if (rows.h2) vis(); }; s.oninput = up; up(); r.append(el("span", "", l), s, o); ctl.appendChild(r); });
      colS.addEventListener("change", vis); vis();
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
      out.innerHTML = ""; const box = el("div", "in-step"); box.innerHTML = "<h4>Хроматограм</h4>"; const sch = H.svg("svg", { viewBox: "0 0 600 74", class: "chr-schem" }, box);
      sch.innerHTML = `<rect x="2" y="8" width="70" height="46" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="37" y="25" font-size="11" text-anchor="middle">Гас носач</text><text x="37" y="38" font-size="10" text-anchor="middle">(He)</text><text x="37" y="50" font-size="9" text-anchor="middle">мобилна фаза</text>
      <rect x="100" y="8" width="64" height="46" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="132" y="28" font-size="11" text-anchor="middle">Инјектор</text><text x="132" y="44" font-size="10" text-anchor="middle">250 °C, 1 µL</text>
      <rect x="196" y="4" width="290" height="58" rx="8" fill="#fff1e6" stroke="#c2410c"/><path d="M212 33 q15 -22 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="#475569" stroke-width="3"/><text x="341" y="58" font-size="10" text-anchor="middle" fill="#9a3412">печка (колона = стационарна фаза)</text><text id="goven" x="341" y="17" font-size="12" font-weight="700" text-anchor="middle" fill="#c2410c"></text>
      <rect x="514" y="8" width="84" height="46" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="556" y="28" font-size="11" text-anchor="middle">Детектор</text><text x="556" y="44" font-size="10" text-anchor="middle">FID, 300 °C</text>
      <path d="M72 31 H100 M164 31 H196 M486 31 H514" stroke="#64748b" stroke-width="2" marker-end="url(#ar)"/>`;
      const sv = H.svg("svg", { viewBox: "0 0 600 270", class: "chr-svg" }, box);
      sv.addEventListener("mousemove", e => { if (!S.cur) return; const r = sv.getBoundingClientRect(), x = (e.clientX - r.left) * 600 / r.width; if (x < 50 || x > 590) return;
        const t = (x - 50) / 540 * S.cur.tr.tEnd, ci = Math.round(t / S.cur.tr.dt), g = sv.querySelector("#gcur"), tx = sv.querySelector("#gctt");
        g.setAttribute("x1", x); g.setAttribute("x2", x); g.setAttribute("opacity", 1); tx.setAttribute("x", Math.min(x + 4, 520)); tx.textContent = "t = " + fmt(t, 2) + " min, сигнал " + Math.round(S.cur.tr.y[ci] || 0); tx.setAttribute("opacity", 1); });
      sv.addEventListener("mouseleave", () => { sv.querySelector("#gcur").setAttribute("opacity", 0); sv.querySelector("#gctt").setAttribute("opacity", 0); }); S.sv = sv; sv.innerHTML = frame();
      out.append(box, tbl, fb, log); tbl.innerHTML = ""; fb.innerHTML = ""; log.innerHTML = ""; answerBox();
    }
    const frame = () => '<line x1="50" y1="225" x2="590" y2="225" stroke="#334155"/><line x1="50" y1="20" x2="50" y2="225" stroke="#334155"/><text x="320" y="262" font-size="11" text-anchor="middle" fill="#334155">време (min)</text><text x="14" y="125" font-size="11" fill="#334155" transform="rotate(-90 14 125)" text-anchor="middle">сигнал на детекторот</text><g id="gx"></g><clipPath id="gcl"><rect id="gclr" x="50" y="0" width="0" height="270"/></clipPath><path id="gp" fill="none" stroke="#c2410c" stroke-width="1.4" clip-path="url(#gcl)"/><g id="gl"></g><line id="gcur" x1="0" x2="0" y1="20" y2="225" stroke="#64748b" stroke-dasharray="3 3" opacity="0"/><text id="gctt" x="0" y="42" font-size="10" fill="#334155" opacity="0"></text><text id="gt" x="56" y="12" font-size="11" text-anchor="start" fill="#334155"></text>';
    function inject() {
      const m = Object.assign({}, M); if (m.ramp <= 0) { m.ramp2 = 0; m.hF = 0; } if (m.ramp2 > 0 && m.T2 <= m.Tf) { fb.innerHTML = "<p class='in-fb-bad'>Крајната температура на чекор 2 мора да е поголема од T по чекор 1 (или стави чекор 2 на „нема“).</p>"; return; } if (Math.max(...progPts(m).map(a => a[1])) > COLS[m.col].max) { fb.innerHTML = `<p class="in-fb-bad">✘ Програмата достигнува температура над ${COLS[m.col].max} °C за оваа стационарна фаза: фазата се распаѓа („крвари“) и колоната се оштетува. Намали ја температурата или избери друга колона.</p>`; return; }
      if (m.ramp > 0 && m.Tf < m.T0) { fb.innerHTML = "<p class='in-fb-bad'>Крајната температура мора да е поголема од почетната.</p>"; return; }
      const v = vials[vialSel]; const sim = simulate(m, v.items), tr = trace(sim), pk = integrate(tr);
      const run = { n: S.runs.length + 1, m, v, sim, tr, pk }; S.runs.push(run); S.cur = run; fb.innerHTML = ""; draw(run, true); runsLog();
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
      if (!anim || H.reduced) { fin(); return; } const T = 2800; let t0 = null;
      requestAnimationFrame(function f(ts) { if (t0 == null) t0 = ts; const x = Math.min(1, (ts - t0) / T); clr.setAttribute("width", 540 * x); const tc = Math.round(Tof(run.m, x * tr.tEnd)); tt.textContent = `T печка: ${tc} °C · t = ${fmt(x * tr.tEnd, 1)} min`; const ov = document.getElementById('goven'); if (ov) ov.textContent = tc + ' °C'; if (x < 1) requestAnimationFrame(f); else fin(); });
    }
    function table(run) {
      let h = `<h4>Интегрирање (Run #${run.n}: ${run.v.name})</h4><table class="chr-tbl"><tr><th>Пик</th><th>tR (min)</th><th>Површина</th><th>Висина</th></tr>`;
      run.pk.forEach((p, i) => h += `<tr><td>${i + 1}${i === 0 ? " (растворувач)" : ""}</td><td>${fmt(p.t, 3)}</td><td>${fmt(p.area, 2)}</td><td>${fmt(p.h, 1)}</td></tr>`); tbl.innerHTML = "<div class='chr-scroll'>" + h + "</table></div>";
    }
    function runsLog() {
      let h = "<h4>Дневник на анализи</h4><table class='chr-tbl'><tr><th>#</th><th>Примерок</th><th>Колона</th><th>Програма</th></tr>";
      S.runs.forEach(r => h += `<tr class="chr-run${r === S.cur ? " cur" : ""}" data-n="${r.n}"><td>${r.n}</td><td>${r.v.name}</td><td>${COLS[r.m.col].short}, ${r.m.len || 30} m, ${fmt(r.m.film || 0.25, 2)} µm</td><td>${progStr(r.m)}, ${fmt(r.m.flow, 1)} mL/min</td></tr>`);
      log.innerHTML = "<div class='chr-scroll'>" + h + "</table></div>"; log.querySelectorAll(".chr-run").forEach(tr => tr.onclick = () => { S.cur = S.runs[+tr.dataset.n - 1]; draw(S.cur, false); runsLog(); });
    }
    function evalRun(run) {
      const T = TASKS[S.k]; if (T.kind !== "opt") { fb.innerHTML = ""; return; }
      const pk = run.sim.peaks.filter(p => !p.solv).sort((a, b) => a.tR - b.tR); if (pk.length < T.ids.length) { fb.innerHTML = "<p class='in-fb-bad'>✘ Не сите компоненти излегоа од колоната во рамките на анализата. Зголеми ја крајната температура или брзината на загревање.</p>"; return; }
      const rs = []; for (let i = 1; i < pk.length; i++) rs.push(1.18 * (pk[i].tR - pk[i - 1].tR) / (2.355 * (pk[i].sg + pk[i - 1].sg)));
      const minRs = Math.min(...rs), last = pk[pk.length - 1].tR, okR = rs.every(x => x >= 1.5), okT = last <= T.limit;
      let m = `Rs: ${rs.map((x, i) => `${C[pk[i].id].name.replace("n-", "")}/${C[pk[i + 1].id].name.replace("n-", "")} = <b>${fmt(x, 2)}</b>`).join(", ")}. Последниот пик: ${fmt(last, 1)} min.`;
      fb.innerHTML = okR && okT ? `<p class="in-fb-ok">${minRs >= 2 ? "✔ Одлично! Сите <i>R</i><sub>s</sub> ≥ 2 и анализата е брза." : "✔ Задоволително: сите <i>R</i><sub>s</sub> ≥ 1,5 (пиковите се разделени до базната линија), но некои се многу блиску еден до друг на хроматограмот (најмалa <i>R</i><sub>s</sub> = " + fmt(minRs, 2) + "). Анализата е брза."} ${m}</p>` : `<p class="${okR ? "in-fb-ok" : "in-fb-bad"}">${okR ? "✔ Задоволително разделуввање, но анализата е предолга (&gt; " + T.limit + " min). Зголеми ја брзината на загревање или протокот." : "✘ Пиковите не се доволно разделени (<i>R</i><sub>s</sub> &lt; 1,5). Забави го загревањето или намали ја почетната температура."} ${m}</p>`;
    }
    function answerBox() {
      if (TASKS[S.k].kind === "opt") return; const s = el("div", "in-step"); fb.after(s); const keep = out; s.innerHTML = "<h4>Одговор</h4>";
      if (TASKS[S.k].kind === "id") { const row = el("div", "chr-opts"), sel = new Set(); TASKS[S.k].cands.forEach(id => { const b = el("button", "chr-opt", C[id].name); b.type = "button"; b.onclick = () => { sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle("on"); }; row.appendChild(b); });
        const go = el("button", "btn ghost", "✔ Провери"), m = el("div"); go.type = "button"; s.append(el("p", "in-hint", "Означи ги супстанците во непознатиот примерок (од " + TASKS[S.k].cands.length + " можни):"), row, go, m);
        go.onclick = () => { const ok = S.truth.length === sel.size && S.truth.every(x => sel.has(x)); const usedP = S.runs.some(r => COLS[r.m.col].w >= 0.5 && r.v.unk);
          m.innerHTML = ok ? `<p class="in-fb-ok">✔ Точно!${S.vname ? " Примерокот е " + S.vname + "." : ""} ${S.k !== "B" ? "Идентификацијата се прави со споредба на времињата на задржување со стандарди под исти услови." : usedP ? "Поларната стационарна фаза го разделува етанолот од етил ацетатот." : "Внимавај: на неполарна колона етанолот и етил ацетатот речиси се совпаѓаат (слични точки на вриење); за сигурна идентификација треба втора колона со поларна стационарна фаза."}</p>` : "<p class='in-fb-bad'>✘ Не е точно. Спореди ги tR на примерокот со стандардите (на иста колона и иста програма). Ако два пика се преклопуваат, пробај друга стационарна фаза.</p>"; }; }
      else { const T = TASKS[S.k], i = el("input", "chr-num"); i.placeholder = T.unit; const go = el("button", "btn ghost", "✔ Провери"), m = el("div"); go.type = "button";
        s.append(el("p", "in-hint", "Концентрација на етанол во примерокот (" + T.unit + "). Формула: RRF = (A<sub>етанол</sub>/A<sub>IS</sub>) / (c<sub>етанол</sub>/c<sub>IS</sub>) од стандардот; c<sub>x</sub> = (A<sub>x</sub>/A<sub>IS</sub>) · c<sub>IS</sub> / RRF. Во примерокот има и друга испарлива компонента: внимавај на колоната и на пиковите!"), i, go, m);
        go.onclick = () => { const v = H.num(i.value), tr = S.cet / T.fac; const ok = isFinite(v) && Math.abs(v - tr) / tr < 0.04;
          m.innerHTML = ok ? `<p class="in-fb-ok">✔ Точно (c = ${fmt(tr, T.fac > 1 ? 2 : 0)} ${T.unit}).${S.k === "G" ? (tr > 0.5 ? " Тоа е над дозволената граница од 0,5 g/L: возачот е казнив." : " Тоа е под дозволената граница од 0,5 g/L.") : ""} Внатрешниот стандард ги компензира грешките при инјектирање.</p>` : "<p class='in-fb-bad'>✘ Не се совпаѓа (±4 %). Дали етанолот е разделен од другите пикови? Дали ги користиш површините на точните пикови (стандард и примерок под исти услови)?</p>"; }; }
    }
    ts.onchange = () => newTask(ts.value); newTask("A");
  };
  window.__gc = { C, simulate, trace, integrate };
})();
