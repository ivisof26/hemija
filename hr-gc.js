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
    pro: { id: "pro", name: "1-пропанол", np: [0.20, 35], wax: [2.6, 45], rf: 0.55 },
    ben: { id: "ben", name: "бензен", np: [0.19, 34], wax: [0.10, 31], rf: 1.0 },
    ebz: { id: "ebz", name: "етилбензен", np: [1.45, 42], wax: [0.38, 38], rf: 1.0 },
    pxy: { id: "pxy", name: "p-ксилен", np: [1.52, 42], wax: [0.40, 38], rf: 1.0 },
    met: { id: "met", name: "метанол", np: [0.03, 26], wax: [0.9, 40], rf: 0.25 },
    ipr: { id: "ipr", name: "2-пропанол", np: [0.115, 32], wax: [1.6, 43], rf: 0.5 },
    pin: { id: "pin", name: "α-пинен", np: [1.0, 41], wax: [0.45, 38], rf: 1.0 },
    lim: { id: "lim", name: "лимонен", np: [2.3, 44], wax: [1.3, 41], rf: 1.0 },
    lin: { id: "lin", name: "линалол", np: [3.5, 47], wax: [22, 58], rf: 0.8 },
    men: { id: "men", name: "ментол", np: [6.5, 50], wax: [30, 60], rf: 0.8 },
    crv: { id: "crv", name: "карвон", np: [8.0, 52], wax: [45, 62], rf: 0.85 },
    iaa: { id: "iaa", name: "изоамил ацетат", np: [0.6, 37], wax: [0.55, 36], rf: 0.6 },
    ebu: { id: "ebu", name: "етил бутират", np: [0.45, 36], wax: [0.38, 35], rf: 0.65 },
    hac: { id: "hac", name: "хексил ацетат", np: [1.9, 41], wax: [1.0, 39], rf: 0.7 },
    but: { id: "but", name: "1-бутанол", np: [0.60, 39], wax: [4.0, 48], rf: 0.6 }
  };
  const COLS = { np: { name: "Неполарна (100 % диметилполисилоксан), max 300 °C", max: 300 }, wax: { name: "Поларна (полиетилен гликол, WAX), max 250 °C", max: 250 } };
  const TASKS = {
    A: { kind: "opt", name: "1. Оптимизација: н-алкани C10–C14 и изомер", ids: ["C10", "C11", "C12", "iC12", "C13", "C14"], limit: 8, ok: "Подеси ја програмата така што сите соседни пикови имаат Rs ≥ 1,5, а последниот пик излегува за ≤ 8 min." },
    D: { kind: "opt", name: "2. Оптимизација: бензен, толуен, етилбензен, p-ксилен", ids: ["ben", "tol", "ebz", "pxy"], limit: 8, ok: "Ароматични јаглеводороди од бензин. Етилбензенот и p-ксиленот се слични. Постигни Rs ≥ 1,5 за сите соседни пикови, а последниот пик да излезе за ≤ 8 min." },
    B: { kind: "id", name: "3. Идентификација: растворувачи (избор на колона)", cands: ["ace", "eto", "eac", "tol"], must: ["eto", "eac"], ok: "Непознат примерок содржи неколку од: ацетон, етанол, етил ацетат, толуен. Инјектирај стандарди и примерок, па определи." },
    E: { kind: "id", name: "4. Идентификација: алкохоли", cands: ["met", "eto", "ipr", "pro", "but"], must: [], ok: "Непознат примерок содржи 2–3 алкохоли. Инјектирај стандарди и примерок на иста колона и програма, па спореди ги времињата на задржување." },
    F: { kind: "id", name: "E. Етерично масло: од што е?", cands: ["pin", "lim", "lin", "men", "crv"], must: [], variants: [{ n: "лимон", ids: ["lim", "pin"] }, { n: "нане", ids: ["men", "lim"] }, { n: "лаванда", ids: ["lin", "pin"] }, { n: "ким", ids: ["crv", "lim"] }],
      ok: "Непознато етерично масло (лимон, нане, лаванда или ким). Терпените имаат високи точки на вриење, па е потребно температурно програмирање. Инјектирај стандарди и примерок, па определи ги составките." },
    H: { kind: "id", name: "7. 🍌 Естери во овошна арома", cands: ["eac", "iaa", "ebu", "hac"], must: [], variants: [{ n: "банана (изоамил ацетат + етил ацетат)", ids: ["iaa", "eac"] }, { n: "ананас (етил бутират + етил ацетат)", ids: ["ebu", "eac"] }, { n: "јаболко (хексил ацетат + етил бутират)", ids: ["hac", "ebu"] }],
      ok: "Вештачка овошна арома содржи мирисни естери. Инјектирај стандарди и примерок и определи што мирише: банана, ананас или јаболко." },
    Cq: { kind: "quant", fac: 1, unit: "mg/L", name: "5. Квантификација со внатрешен стандард", ok: "Одреди ја концентрацијата на етанол во примерок со внатрешен стандард 1-пропанол (200 mg/L)." },
    G: { kind: "quant", fac: 1000, unit: "g/L", name: "6. 🚗 Алкохол во крв на возач (внатрешен стандард)", ok: "Полицијата зема крв од возач (анализа на пареи над примерокот). Содржината на етанол се одредува со внатрешен стандард 1-пропанол (0,5 g/L). Во крвта има и ацетон. Дали возачот ја надминува дозволената граница од 0,5 g/L?" }
  };
  C.iC12.np = [C.C12.np[0] * 0.92, C.C12.np[1]]; C.iC12.wax = [C.C12.wax[0] * 0.92, C.C12.wax[1]];
  function kT(c, col, T) { const p = c[col]; return p[0] * Math.exp(p[1] * 1000 / R * (1 / (T + 273.15) - 1 / T0K)); }
  function Tof(m, t) { return t < m.hold ? m.T0 : (m.ramp > 0 ? Math.min(m.Tf, m.T0 + m.ramp * (t - m.hold)) : m.T0); }
  function simulate(m, items) {
    const tM = VCOL / m.flow, u = LCM / (tM * 60), Hh = 1.8 * (0.08 + 2.4 / u + 0.003 * u), N = LCM * 10 / Hh;
    const peaks = [{ id: "solv", tR: tM * 1.02, sg: 0.01 + tM * 0.02, A: 40, solv: true }];
    items.forEach(it => { const c = C[it.id]; let z = 0, t = 0, dt = 0.004; const mx = 45;
      while (z < 1 && t < mx) { z += dt / (tM * (1 + kT(c, m.col, Tof(m, t)))); t += dt; }
      if (t >= mx) return; const ke = kT(c, m.col, Tof(m, t));
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

  H.mods.gc = function (root) {
    const S = { runs: [], cur: null };
    const top = el("div", "in-row"), ts = el("select", "chr-num"); ts.style.width = "auto"; for (const k in TASKS) { const o = el("option", "", TASKS[k].name); o.value = k; ts.appendChild(o); }
    top.append(el("span", "", "<b>Задача:</b> "), ts); root.appendChild(top);
    const intro = el("p", "in-hint"); root.appendChild(intro);
    const lay = el("div", "chr-big"); root.appendChild(lay);
    const ctl = el("div", "in-step"), out = el("div"); lay.append(ctl, out);
    const M = { col: "np", flow: 1.2, T0: 60, hold: 1, ramp: 15, Tf: 250 };
    let vials = [], vialSel = 0, ans = null;
    function sliders() {
      ctl.innerHTML = "<h4>Параметри на гасниот хроматограф</h4>";
      const colS = el("select", "chr-num"); colS.style.width = "100%"; for (const k in COLS) { const o = el("option", "", COLS[k].name); o.value = k; if (k === M.col) o.selected = true; colS.appendChild(o); }
      colS.onchange = () => { M.col = colS.value; }; ctl.append(el("p", "in-hint", "Колона (30 m × 0,25 mm), гас носач: хелиум, детектор: FID"), colS);
      [["flow", "Проток", 0.3, 3, 0.1, " mL/min"], ["T0", "Почетна T", 40, 200, 5, " °C"], ["hold", "Задржување", 0, 5, 0.5, " min"], ["ramp", "Нагорување", 0, 40, 1, " °C/min"], ["Tf", "Крајна T", 50, 300, 5, " °C"]].forEach(([k, l, mn, mx, st, u]) => {
        const r = el("div", "chr-ctl"), s = el("input"), o = el("output"); s.type = "range"; s.min = mn; s.max = mx; s.step = st; s.value = M[k];
        const up = () => { M[k] = +s.value; o.textContent = (k === "ramp" && !M[k] ? "изотерма" : fmt(M[k], st < 1 ? 1 : 0) + u); }; s.oninput = up; up(); r.append(el("span", "", l), s, o); ctl.appendChild(r); });
      const vs = el("select", "chr-num"); vs.style.width = "100%"; vials.forEach((v, i) => { const o = el("option", "", v.name); o.value = i; vs.appendChild(o); }); vs.onchange = () => vialSel = +vs.value; vs.value = vialSel;
      ctl.append(el("p", "in-hint", "Шишенце за инјектирање (1 µL):"), vs);
      const go = el("button", "btn primary", "💉 Инјектирај"); go.type = "button"; ctl.appendChild(go); go.onclick = inject;
    }
    function newTask(k) {
      S.k = k; S.runs = []; S.cur = null; ans = null; vialSel = 0; intro.textContent = TASKS[k].ok; out.innerHTML = "";
      const T = TASKS[k];
      if (T.kind === "opt") vials = [{ name: "Смеса: " + T.ids.map(id => C[id].name.replace("n-", "")).join(", "), items: T.ids.map(id => ({ id, c: 200 })) }];
      if (T.kind === "id") { if (T.variants) { const v = H.pick(T.variants); S.vname = v.n; S.truth = v.ids.slice(); } else { S.vname = null; } const extra = H.shuffle(T.cands.filter(x => !T.must.includes(x))); const n = T.must.length ? H.pick([0, 1, 1]) : H.pick([2, 3, 3]); if (!T.variants) { S.truth = T.must.concat(extra.slice(0, n)); if (S.truth.length < 2) S.truth.push(extra[0]); }
        vials = T.cands.concat(k === "B" ? ["pro"] : []).map(id => ({ name: "Стандард: " + C[id].name, items: [{ id, c: 200 }] })); vials.push({ name: "❓ Непознат примерок", items: S.truth.map(id => ({ id, c: 200 })), unk: true }); }
      if (k === "G") { S.cet = Math.round(H.rand(100, 1800)); vials = [{ name: "Стандард: етанол 500 mg/L + 1-пропанол 500 mg/L", items: [{ id: "eto", c: 500 }, { id: "pro", c: 500 }] },
        { name: "Крв на возач + внатрешен стандард (1-пропанол 500 mg/L)", items: [{ id: "eto", c: S.cet }, { id: "ace", c: 60 }, { id: "pro", c: 500 }] }]; }
      if (k === "Cq") { S.cet = Math.round(H.rand(80, 380)); vials = [{ name: "Стандард: етанол 200 mg/L + 1-пропанол 200 mg/L", items: [{ id: "eto", c: 200 }, { id: "pro", c: 200 }] },
        { name: "Примерок + внатрешен стандард (1-пропанол 200 mg/L)", items: [{ id: "eto", c: S.cet }, { id: "eac", c: 150 }, { id: "pro", c: 200 }] }]; }
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
      const m = Object.assign({}, M); if (Math.max(m.T0, m.Tf) > COLS[m.col].max) { fb.innerHTML = `<p class="in-fb-bad">✘ Температурата надминува ${COLS[m.col].max} °C – неподвижната фаза се распаѓа („крвари“). Намали ја температурата.</p>`; return; }
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
      const fin = () => { clr.setAttribute("width", 540); gl.setAttribute("opacity", 1); tt.textContent = `${run.m.col === "np" ? "неполарна" : "поларна"} колона, ${fmt(run.m.flow, 1)} mL/min, N ≈ ${Math.round(run.sim.N / 1000)}·10³`; table(run); evalRun(run); const ov = document.getElementById('goven'); if (ov) ov.textContent = Math.round(Tof(run.m, tr.tEnd)) + ' °C'; };
      if (!anim || H.reduced) { fin(); return; } const T = 2800; let t0 = null;
      requestAnimationFrame(function f(ts) { if (t0 == null) t0 = ts; const x = Math.min(1, (ts - t0) / T); clr.setAttribute("width", 540 * x); const tc = Math.round(Tof(run.m, x * tr.tEnd)); tt.textContent = `T печка: ${tc} °C · t = ${fmt(x * tr.tEnd, 1)} min`; const ov = document.getElementById('goven'); if (ov) ov.textContent = tc + ' °C'; if (x < 1) requestAnimationFrame(f); else fin(); });
    }
    function table(run) {
      let h = `<h4>Интегрирање (Run #${run.n}: ${run.v.name})</h4><table class="chr-tbl"><tr><th>Пик</th><th>tR (min)</th><th>Површина</th><th>Висина</th></tr>`;
      run.pk.forEach((p, i) => h += `<tr><td>${i + 1}${i === 0 ? " (растворувач)" : ""}</td><td>${fmt(p.t, 3)}</td><td>${fmt(p.area, 2)}</td><td>${fmt(p.h, 1)}</td></tr>`); tbl.innerHTML = "<div class='chr-scroll'>" + h + "</table></div>";
    }
    function runsLog() {
      let h = "<h4>Дневник на анализи</h4><table class='chr-tbl'><tr><th>#</th><th>Примерок</th><th>Колона</th><th>Програма</th></tr>";
      S.runs.forEach(r => h += `<tr class="chr-run${r === S.cur ? " cur" : ""}" data-n="${r.n}"><td>${r.n}</td><td>${r.v.name}</td><td>${r.m.col === "np" ? "неполарна" : "поларна"}</td><td>${r.m.T0} °C/${r.m.hold} min${r.m.ramp ? " → " + r.m.Tf + " °C @ " + r.m.ramp : " (изотерма)"}, ${fmt(r.m.flow, 1)} mL/min</td></tr>`);
      log.innerHTML = "<div class='chr-scroll'>" + h + "</table></div>"; log.querySelectorAll(".chr-run").forEach(tr => tr.onclick = () => { S.cur = S.runs[+tr.dataset.n - 1]; draw(S.cur, false); runsLog(); });
    }
    function evalRun(run) {
      const T = TASKS[S.k]; if (T.kind !== "opt") { fb.innerHTML = ""; return; }
      const pk = run.sim.peaks.filter(p => !p.solv).sort((a, b) => a.tR - b.tR); if (pk.length < T.ids.length) { fb.innerHTML = "<p class='in-fb-bad'>✘ Не сите компоненти излегоа од колоната во рамките на анализата. Зголеми ја крајната температура или брзината на нагорување.</p>"; return; }
      const rs = []; for (let i = 1; i < pk.length; i++) rs.push(1.18 * (pk[i].tR - pk[i - 1].tR) / (2.355 * (pk[i].sg + pk[i - 1].sg)));
      const minRs = Math.min(...rs), last = pk[pk.length - 1].tR, okR = rs.every(x => x >= 1.5), okT = last <= T.limit;
      let m = `Rs: ${rs.map((x, i) => `${C[pk[i].id].name.replace("n-", "")}/${C[pk[i + 1].id].name.replace("n-", "")} = <b>${fmt(x, 2)}</b>`).join(", ")}. Последниот пик: ${fmt(last, 1)} min.`;
      fb.innerHTML = okR && okT ? `<p class="in-fb-ok">${minRs >= 2 ? "✔ Одлично! Сите Rs ≥ 2 и анализата е брза." : "✔ Задоволително: сите Rs ≥ 1,5 (пиковите се раздвоени до основната линија), но некои се многу блиску еден до друг на хроматограмот (најмал Rs = " + fmt(minRs, 2) + "). Анализата е брза."} ${m}</p>` : `<p class="${okR ? "in-fb-ok" : "in-fb-bad"}">${okR ? "✔ Доволно раздвојување, но анализата е предолга (&gt; 8 min). Зголеми ја брзината на нагорување." : "✘ Пиковите не се доволно раздвоени (Rs &lt; 1,5). Забави го нагорувањето или намали ја почетната температура."} ${m}</p>`;
    }
    function answerBox() {
      if (TASKS[S.k].kind === "opt") return; const s = el("div", "in-step"); fb.after(s); const keep = out; s.innerHTML = "<h4>Одговор</h4>";
      if (TASKS[S.k].kind === "id") { const row = el("div", "chr-opts"), sel = new Set(); TASKS[S.k].cands.forEach(id => { const b = el("button", "chr-opt", C[id].name); b.type = "button"; b.onclick = () => { sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle("on"); }; row.appendChild(b); });
        const go = el("button", "btn ghost", "✔ Провери"), m = el("div"); go.type = "button"; s.append(el("p", "in-hint", "Означи ги супстанците во непознатиот примерок (од " + TASKS[S.k].cands.length + " можни):"), row, go, m);
        go.onclick = () => { const ok = S.truth.length === sel.size && S.truth.every(x => sel.has(x)); const usedP = S.runs.some(r => r.m.col === "wax" && r.v.unk);
          m.innerHTML = ok ? `<p class="in-fb-ok">✔ Точно!${S.vname ? " Примерокот е " + S.vname + "." : ""} ${S.k !== "B" ? "Идентификацијата се прави со споредба на времињата на задржување со стандарди под исти услови." : usedP ? "Поларната колона го раздвои етанолот од етил ацетатот." : "Внимавај: на неполарна колона етанолот и етил ацетатот речиси се совпаѓаат (слични точки на вриење); за сигурна идентификација треба втора, поларна колона."}</p>` : "<p class='in-fb-bad'>✘ Не е точно. Спореди ги tR на примерокот со стандардите (на иста колона и иста програма). Ако два пика се преклопуваат, пробај поларна колона.</p>"; }; }
      else { const T = TASKS[S.k], i = el("input", "chr-num"); i.placeholder = T.unit; const go = el("button", "btn ghost", "✔ Провери"), m = el("div"); go.type = "button";
        s.append(el("p", "in-hint", "Концентрација на етанол во примерокот (" + T.unit + "). Формула: RRF = (A<sub>етанол</sub>/A<sub>IS</sub>) / (c<sub>етанол</sub>/c<sub>IS</sub>) од стандардот; c<sub>x</sub> = (A<sub>x</sub>/A<sub>IS</sub>) · c<sub>IS</sub> / RRF. Во примерокот има и друга испарлива компонента: внимавај на колоната и на пиковите!"), i, go, m);
        go.onclick = () => { const v = H.num(i.value), tr = S.cet / T.fac; const ok = isFinite(v) && Math.abs(v - tr) / tr < 0.04;
          m.innerHTML = ok ? `<p class="in-fb-ok">✔ Точно (c = ${fmt(tr, T.fac > 1 ? 2 : 0)} ${T.unit}).${S.k === "G" ? (tr > 0.5 ? " Тоа е над дозволената граница од 0,5 g/L: возачот е казнив." : " Тоа е под дозволената граница од 0,5 g/L.") : ""} Внатрешниот стандард ги компензира грешките при инјектирање.</p>` : "<p class='in-fb-bad'>✘ Не се совпаѓа (±4 %). Дали етанолот е раздвоен од другите пикови? Дали ги користиш површините на точните пикови (стандард и примерок под исти услови)?</p>"; }; }
    }
    ts.onchange = () => newTask(ts.value); newTask("A");
  };
  window.__gc = { C, simulate, trace, integrate };
})();
