// Виртуелни лаборатории: инструментални методи (спектрофотометрија, кондуктометрија, pH-метрија).
// Моделите се во model.js (window.InstModel). Параметрите се калибрирани според реални мерења од вежбите.
(function () {
  const root = document.getElementById("inst-root");
  const M = window.InstModel;
  if (!root || !M) return;

  // ---------- помошни ----------
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const NS = "http://www.w3.org/2000/svg";
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const fmt = (x, d = 2) => (isFinite(x) ? x.toFixed(d).replace(".", ",").replace("-", "−") : "–");
  const num = s => parseFloat(String(s).trim().replace(",", "."));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const btn = (text, cls, fn) => { const b = el("button", cls || "btn", text); b.type = "button"; if (fn) b.addEventListener("click", fn); return b; };
  const qa = (q, a) => { const d = el("details", "in-qa"); d.appendChild(el("summary", "", q)); d.appendChild(el("p", "", a)); return d; };

  function ticks(a, b, n) {
    const r = b - a || 1, raw = r / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    const s = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p, out = [];
    for (let v = Math.ceil(a / s - 1e-9) * s; v <= b + 1e-9; v += s) out.push(+v.toFixed(10));
    return { t: out, s };
  }
  const dec = s => (s >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(s) - 1e-9)));

  // Едноставен SVG графикон: o = {xl, yl, pts:[{x,y,c,hit}], lines:[{a,b,x0,x1,c}], xmin,xmax,ymin,ymax, onpt, curve:[{x,y}]}
  function chart(box, o) {
    box.replaceChildren();
    const W = o.w || 520, H = o.h || 270, m = { l: 58, r: 14, t: 12, b: 42 };
    const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, class: "in-chart", role: "img", "aria-label": o.title || "графикон" });
    const xs = [], ys = [];
    (o.pts || []).forEach(p => { xs.push(p.x); ys.push(p.y); });
    (o.curve || []).forEach(p => { xs.push(p.x); ys.push(p.y); });
    let x0 = o.xmin !== undefined ? o.xmin : Math.min(0, ...xs), x1 = o.xmax !== undefined ? o.xmax : Math.max(...xs, x0 + 1);
    let y0 = o.ymin !== undefined ? o.ymin : Math.min(...ys, 0), y1 = o.ymax !== undefined ? o.ymax : Math.max(...ys, y0 + 1);
    if (!isFinite(x0)) { x0 = 0; x1 = 1; } if (!isFinite(y0)) { y0 = 0; y1 = 1; }
    const padY = (y1 - y0) * 0.06; if (o.ymin === undefined) y0 -= padY; if (o.ymax === undefined) y1 += padY;
    const X = v => m.l + (v - x0) / (x1 - x0 || 1) * (W - m.l - m.r), Y = v => H - m.b - (v - y0) / (y1 - y0 || 1) * (H - m.t - m.b);
    const tx = ticks(x0, x1, 6), ty = ticks(y0, y1, 5);
    tx.t.forEach(v => {
      svg.appendChild(sv("line", { x1: X(v), x2: X(v), y1: m.t, y2: H - m.b, class: "in-grid" }));
      const t = sv("text", { x: X(v), y: H - m.b + 15, "text-anchor": "middle", class: "in-tick" }); t.textContent = fmt(v, dec(tx.s)); svg.appendChild(t);
    });
    ty.t.forEach(v => {
      svg.appendChild(sv("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), class: "in-grid" }));
      const t = sv("text", { x: m.l - 6, y: Y(v) + 4, "text-anchor": "end", class: "in-tick" }); t.textContent = fmt(v, dec(ty.s)); svg.appendChild(t);
    });
    svg.appendChild(sv("line", { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: "in-axis" }));
    svg.appendChild(sv("line", { x1: m.l, x2: m.l, y1: m.t, y2: H - m.b, class: "in-axis" }));
    const xl = sv("text", { x: (m.l + W - m.r) / 2, y: H - 6, "text-anchor": "middle", class: "in-axl" }); xl.textContent = o.xl || ""; svg.appendChild(xl);
    const yl = sv("text", { transform: `translate(13 ${(m.t + H - m.b) / 2}) rotate(-90)`, "text-anchor": "middle", class: "in-axl" }); yl.textContent = o.yl || ""; svg.appendChild(yl);
    const clip = "c" + Math.random().toString(36).slice(2, 8);
    const cp = sv("clipPath", { id: clip }); cp.appendChild(sv("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b })); svg.appendChild(cp);
    const g = sv("g", { "clip-path": `url(#${clip})` }); svg.appendChild(g);
    (o.lines || []).forEach(l => g.appendChild(sv("line", { x1: X(l.x0), y1: Y(l.a * l.x0 + l.b), x2: X(l.x1), y2: Y(l.a * l.x1 + l.b), class: "in-line " + (l.c || "") })));
    if (o.curve && o.curve.length) g.appendChild(sv("path", { d: o.curve.map((p, i) => (i ? "L" : "M") + X(p.x).toFixed(1) + " " + Y(p.y).toFixed(1)).join(" "), class: "in-curve" }));
    (o.pts || []).forEach((p, i) => {
      const c = sv("circle", { cx: X(p.x), cy: Y(p.y), r: p.r || 4, class: "in-pt " + (p.c || "") });
      if (o.onpt) { c.style.cursor = "pointer"; c.addEventListener("click", () => o.onpt(i)); }
      g.appendChild(c);
    });
    (o.marks || []).forEach(k => {
      g.appendChild(sv("line", { x1: X(k.x), x2: X(k.x), y1: m.t, y2: H - m.b, class: "in-mark" }));
    });
    box.appendChild(svg);
  }

  // ============================================================
  //  СПЕКТРОФОТОМЕТРИЈА
  // ============================================================
  const PHOTO = {
    pho: {
      title: "Фотометриско определување на фосфати", flaskV: 25, lam0: 600, develop: true,
      species: [{ k: "P", name: "PO₄³⁻", stock: 130, targets: [3, 6, 9, 12, 15], need: [600] }],
      sample: () => ({ P: +rnd(4, 14).toFixed(2) }), tol: 0.05, abs: { P: 0.4, m: 10 },
      intro: "Фосфатите со амониум молибдат даваат фосфомолибденска киселина, која со метол се редуцира во молибденско сино. Подготви стандардна серија, измери ја апсорбанцата на 600 nm и определи ја масата на фосфати во пробата."
    },
    mix: {
      title: "Cr(VI) и Mn(VII) во смеса", flaskV: 50, lam0: 550, develop: false,
      species: [
        { k: "Cr", name: "Cr₂O₇²⁻", stock: 1000, targets: [40, 80, 120, 160, 200], need: [430] },
        { k: "Mn", name: "MnO₄⁻", stock: 100, targets: [2, 5, 10, 15, 20], need: [550, 430] }],
      sample: () => ({ Cr: +rnd(50, 190).toFixed(1), Mn: +rnd(3, 18).toFixed(1) }), tol: 0.06, abs: { Cr: 4, Mn: 0.4 },
      intro: "Дихроматот и перманганатот се апсорбираат на различни бранови должини, па може да се определат во смеса: Mn на 550 nm (таму Cr не апсорбира), а Cr на 430 nm откако ќе се одземе придонесот на Mn."
    }
  };
  const COLORS = { P: [30, 90, 200], Cr: [240, 160, 30], Mn: [150, 20, 130] };

  function buildPhoto(host, cfg) {
    const S = { flasks: [], journal: [], lam: cfg.lam0, t: 0, reagent: false, prepared: false, zero: null, sel: null, last: null, truth: cfg.sample() };
    host.replaceChildren();
    host.appendChild(el("p", "in-intro", cfg.intro));
    const layout = el("div", "in-layout"), stageCol = el("div", "in-stagecol"), ctl = el("div", "in-ctl");
    layout.append(stageCol, ctl); host.appendChild(layout);

    // --- инструмент (SVG)
    const svg = sv("svg", { viewBox: "0 0 300 250", class: "in-spec", role: "img", "aria-label": "Спектрофотометар" });
    svg.innerHTML = `
      <rect x="10" y="40" width="280" height="150" rx="14" fill="#dfe6ee" stroke="#8fa6bd" stroke-width="3"/>
      <rect x="28" y="56" width="150" height="62" rx="8" fill="#16241f" stroke="#5c7468" stroke-width="3"/>
      <text id="lcd1" x="38" y="82" font-size="17" font-family="monospace" fill="#8cf5b5"></text>
      <text id="lcd2" x="38" y="108" font-size="22" font-weight="700" font-family="monospace" fill="#8cf5b5"></text>
      <rect x="196" y="56" width="78" height="62" rx="8" fill="#c9d4df" stroke="#8fa6bd" stroke-width="2"/>
      <rect x="214" y="64" width="42" height="46" rx="3" fill="#f6fbff" stroke="#6f87a0" stroke-width="2"/>
      <rect id="cuv" x="216" y="78" width="38" height="30" fill="#fff" fill-opacity="0"/>
      <text x="235" y="130" text-anchor="middle" font-size="10" fill="#4a5d70">кивета</text>
      <circle cx="60" cy="155" r="14" fill="#b8c6d4" stroke="#7d93a8" stroke-width="3"/><text x="60" y="180" text-anchor="middle" font-size="10" fill="#4a5d70">λ</text>
      <rect x="120" y="143" width="60" height="22" rx="6" fill="#eaf0f6" stroke="#7d93a8"/><text x="150" y="159" text-anchor="middle" font-size="12" fill="#2d1b4e">ZERO</text>
      <rect x="200" y="143" width="60" height="22" rx="6" fill="#eaf0f6" stroke="#7d93a8"/><text x="230" y="159" text-anchor="middle" font-size="12" fill="#2d1b4e">READ</text>
      <text id="lcdw" x="150" y="215" text-anchor="middle" font-size="12" fill="#b34a00"></text>`;
    const stage = el("div", "in-stage"); stage.appendChild(svg); stageCol.appendChild(stage);
    const lcd1 = svg.querySelector("#lcd1"), lcd2 = svg.querySelector("#lcd2"), lcdw = svg.querySelector("#lcdw"), cuv = svg.querySelector("#cuv");
    const clock = el("div", "in-clock"); stageCol.appendChild(clock);

    // --- колба
    const fcol = flask => {
      if (flask.type === "blank" || !flask.conc) return [[200, 220, 235], 0.12];
      let cum = 0, rgb = [0, 0, 0], tot = 0;
      for (const k in flask.conc) {
        let w = flask.conc[k] / (k === "Cr" ? 200 : k === "Mn" ? 20 : 15) * 0.8 + (flask.conc[k] > 0 ? 0.1 : 0);
        if (k === "P") w *= cfg.develop ? (S.reagent ? M.dev(S.t) : 0.05) : 1;
        w = clamp(w, 0, 0.92); const c = COLORS[k];
        rgb = rgb.map((v, i) => v + c[i] * w); tot += w; cum = 1 - (1 - cum) * (1 - w);
      }
      if (!tot) return [[200, 220, 235], 0.1];
      return [rgb.map(v => Math.round(v / tot)), Math.max(0.1, cum)];
    };
    const css = f => { const [c, o] = fcol(f); return `rgba(${c[0]},${c[1]},${c[2]},${o.toFixed(2)})`; };

    // --- КОРАК 1: стандардни раствори
    const c1 = el("div", "in-step"); c1.appendChild(el("h4", "", "1. Подготви стандардни раствори"));
    c1.appendChild(el("p", "in-hint", `Стандардните раствори се во тиквички од ${cfg.flaskV} cm³. Пресметај колку cm³ од основниот раствор да се земат: γ₁·V₁ = γ₂·V₂.`));
    const tbl = el("table", "in-tbl"), thead = el("thead"), trh = el("tr");
    ["Раствор", "γ₂ (μg/cm³)", "V₁ (cm³)", "Добиено γ"].forEach(h => trh.appendChild(el("th", "", h))); thead.appendChild(trh); tbl.appendChild(thead);
    const tb = el("tbody"); tbl.appendChild(tb); c1.appendChild(el("div", "in-tblwrap")).appendChild(tbl);
    const inputs = [];
    cfg.species.forEach(sp => {
      const tr0 = el("tr", "in-sub"); const td = el("td", "", `Основен раствор на ${sp.name}: γ₁ = ${sp.stock} μg/cm³`); td.colSpan = 4; tr0.appendChild(td); tb.appendChild(tr0);
      sp.targets.forEach(t => {
        const tr = el("tr"), inp = el("input", "calc-num in-in"); inp.type = "text"; inp.inputMode = "decimal"; inp.autocomplete = "off"; inp.placeholder = "cm³";
        const out = el("td", "in-out", "–");
        tr.append(el("td", "", sp.k === "P" ? "Фосфат" : sp.name), el("td", "", String(t)), (() => { const d = el("td"); d.appendChild(inp); return d; })(), out);
        tb.appendChild(tr); inputs.push({ sp, t, inp, out });
      });
    });
    const prep = btn("🧪 Подготви ги тиквичките (дополни до марка)", "btn", () => {
      let ok = true;
      inputs.forEach(r => { const v = num(r.inp.value); if (!(v > 0) || v > cfg.flaskV) { ok = false; r.inp.classList.add("bad"); } else r.inp.classList.remove("bad"); });
      if (!ok) { msg1.textContent = "Внеси позитивен волумен (cm³) за секој раствор."; msg1.className = "in-msg bad"; return; }
      S.flasks = S.flasks.filter(f => f.type !== "std");
      inputs.forEach(r => {
        const V = num(r.inp.value), g = r.sp.stock * V / cfg.flaskV, off = Math.abs(g - r.t) / r.t > 0.03;
        r.out.textContent = fmt(g, 2) + (off ? " ⚠" : " ✓"); r.out.className = "in-out " + (off ? "warn" : "ok");
        S.flasks.push({ id: `${r.sp.k}${r.t}`, type: "std", sp: r.sp.k, label: `${r.sp.k === "P" ? "PO₄³⁻" : r.sp.name} ${r.t}`, conc: { [r.sp.k]: g }, target: r.t });
      });
      S.prepared = true; S.t = 0; S.reagent = false; S.zero = null;
      const bad = inputs.filter(r => Math.abs(num(r.inp.value) * r.sp.stock / cfg.flaskV - r.t) / r.t > 0.03).length;
      msg1.textContent = bad ? `Тиквичките се подготвени, но ${bad} од нив немаат бараната концентрација (⚠). Поправи ги волумените и подготви повторно, или продолжи со добиените вредности.` : "Сите тиквички се подготвени со точна концентрација.";
      msg1.className = "in-msg " + (bad ? "warn" : "ok");
      refresh();
    });
    const msg1 = el("p", "in-msg"); c1.append(prep, msg1);

    // --- КОРАК 2: реагенси и време (само фосфати)
    const c2 = el("div", "in-step"); c2.appendChild(el("h4", "", "2. Реагенси и развивање на бојата"));
    const rbtn = btn("➕ Додај реагенси во сите тиквички", "btn", () => {
      if (!S.prepared) { msg2.textContent = "Прво подготви ги стандардните раствори."; msg2.className = "in-msg bad"; return; }
      S.reagent = true; S.t = 0; S.zero = null;
      msg2.textContent = "Додадени: 0,5 cm³ Na₂S₂O₅, 1 cm³ (NH₄)₆Mo₇O₂₄ и 1 cm³ метол; дополнето со вода до марка. Остави ги растворите да стојат."; msg2.className = "in-msg ok"; refresh();
    });
    const tw = el("div", "in-row");
    const wait = n => btn(`⏱ Почекај ${n} min`, "btn ghost", () => { if (!S.reagent) { msg2.textContent = "Прво додај ги реагенсите."; msg2.className = "in-msg bad"; return; } S.t += n; refresh(); });
    tw.append(wait(5), wait(30));
    const msg2 = el("p", "in-msg"); c2.append(el("p", "in-hint", "Додај: 0,5 cm³ Na₂S₂O₅, 1 cm³ (NH₄)₆Mo₇O₂₄ и 1 cm³ метол, а потоа дополни со вода до марка. Растворите треба да стојат 30 min пред мерење."), rbtn, tw, msg2);
    if (!cfg.develop) c2.hidden = true;

    // --- КОРАК 3: мерење
    const c3 = el("div", "in-step"); c3.appendChild(el("h4", "", (cfg.develop ? "3" : "2") + ". Мерење на апсорбанца"));
    const chips = el("div", "in-flasks"); c3.appendChild(chips);
    const wrow = el("div", "in-row"), wl = el("label", "in-lab", "Бранова должина λ (nm): ");
    const wr = el("input"); wr.type = "range"; wr.min = 350; wr.max = 800; wr.step = 5; wr.value = S.lam;
    const wn = el("input", "calc-num in-in in-wn"); wn.type = "text"; wn.inputMode = "numeric"; wn.value = S.lam;
    wr.addEventListener("input", () => setLam(+wr.value));
    wn.addEventListener("change", () => setLam(clamp(Math.round(num(wn.value) / 5) * 5 || S.lam, 350, 800)));
    wl.append(wr, wn); wrow.appendChild(wl); c3.appendChild(wrow);
    const brow = el("div", "in-row");
    const zeroB = btn(cfg.develop ? "⓪ Нулирај (слепа проба)" : "⓪ Нулирај (дестилирана вода)", "btn ghost", () => {
      if (cfg.develop && !S.reagent) { msg3.textContent = "Слепата проба добива реагенси; додај ги прво реагенсите (чекор 2)."; msg3.className = "in-msg warn"; }
      S.zero = { lam: S.lam, A: cfg.develop && S.reagent ? M.REAGENT_BLANK : 0 }; S.last = { A: 0, f: "слепа проба" }; show();
    });
    const measB = btn("📏 Измери", "btn", () => {
      const f = S.flasks.find(x => x.id === S.sel);
      if (!f) { msg3.textContent = "Избери тиквичка."; msg3.className = "in-msg bad"; return; }
      if (cfg.develop && f.type !== "blank" && !S.reagent) { msg3.textContent = "Во тиквичката нема реагенси: нема да се образува обојување."; msg3.className = "in-msg warn"; }
      else if (cfg.develop && S.t < 30) { msg3.textContent = `Изминале се само ${S.t} min: бојата не е целосно развиена, па апсорбанцата е премногу ниска.`; msg3.className = "in-msg warn"; }
      else { msg3.textContent = ""; msg3.className = "in-msg"; }
      let A = M.trueA(S.lam, f.conc || {}) * (cfg.develop ? (S.reagent ? M.dev(S.t) : 0) : 1);
      if (cfg.develop && S.reagent) A += M.REAGENT_BLANK;
      const z = S.zero && S.zero.lam === S.lam;
      if (z) A -= S.zero.A;
      A += gauss() * 0.0015;
      S.last = { A, f: f.label, fid: f.id, zeroed: z, lam: S.lam }; show();
    });
    const recB = btn("📝 Запиши во дневникот", "btn ghost", () => {
      if (!S.last || S.last.fid === undefined) { msg3.textContent = "Прво измери."; msg3.className = "in-msg bad"; return; }
      if (!S.last.zeroed) { msg3.textContent = "Инструментот не е нулиран на оваа бранова должина."; msg3.className = "in-msg warn"; }
      const f = S.flasks.find(x => x.id === S.last.fid);
      S.journal.push({ fid: f.id, label: f.label, type: f.type, sp: f.sp, lam: S.last.lam, A: S.last.A }); renderRes();
    });
    const scanB = btn("🌈 Снимај спектар", "btn ghost", () => {
      const f = S.flasks.find(x => x.id === S.sel); if (!f) { msg3.textContent = "Избери тиквичка."; msg3.className = "in-msg bad"; return; }
      const cur = []; for (let l = 350; l <= 800; l += 5) { let A = M.trueA(l, f.conc || {}) * (cfg.develop ? (S.reagent ? M.dev(S.t) : 0) : 1); cur.push({ x: l, y: Math.max(0, A + gauss() * 0.0008) }); }
      chart(specBox, { xl: "λ / nm", yl: "A", curve: cur, xmin: 350, xmax: 800, ymin: 0, title: "UV-Vis спектар на " + f.label, marks: [{ x: S.lam }] });
      specBox.prepend(el("div", "in-cap", "Спектар: " + f.label + " (вертикалната линија = избраната λ)"));
    });
    brow.append(zeroB, measB, recB, scanB); c3.appendChild(brow);
    const msg3 = el("p", "in-msg"); c3.appendChild(msg3);
    const specBox = el("div", "in-specbox"); c3.appendChild(specBox);
    const jbox = el("div", "in-journal"); c3.appendChild(jbox);

    // --- РЕЗУЛТАТИ
    const c4 = el("div", "in-step"); c4.appendChild(el("h4", "", (cfg.develop ? "4" : "3") + ". Стандардни криви и пресметка"));
    const resBox = el("div", "in-res"); c4.appendChild(resBox);
    const ans = el("div", "in-ans"); c4.appendChild(ans);

    const qs = el("div", "in-qs"); qs.appendChild(el("h4", "", "Прашања"));
    if (cfg.develop) {
      qs.append(qa("Зошто растворите треба да стојат 30 min пред мерење?", "Редукцијата на фосфомолибденската киселина до молибденско сино е бавна реакција; потребно е време за да се развие бојата до константна вредност. Ако се мери порано, апсорбанцата е пониска и нестабилна."),
        qa("Која светлина се апсорбира кај сино обоен раствор?", "Растворот изгледа сино бидејќи ја пропушта сината светлина, а апсорбира комплементарна (портокалово-црвена, околу 600–700 nm). Затоа се мери на 600 nm."),
        qa("Може ли да се мери на друга бранова должина?", "Да, на секоја λ каде што молибденското сино апсорбира (на пример 650–700 nm има поголема осетливост). Пробај со спектарот и ќе видиш."));
    } else {
      qs.append(qa("Зошто Cr и Mn може да се определат во смеса?", "Бидејќи на 550 nm апсорбира практично само MnO₄⁻, а Cr₂O₇²⁻ не. На 430 nm апсорбираат и двата, но придонесот на Mn се одзема преку неговата стандардна крива."),
        qa("Која е целта на снимањето UV-Vis спектар на аналитите?", "Да се одберат бранови должини на максимална апсорпција и/или најмала интерференција, за мерењето да биде осетливо и селективно."));
    }

    ctl.append(c1, c2, c3, c4, qs);

    // --- состојби
    function setLam(l) { S.lam = l; wr.value = l; wn.value = l; show(); }
    function selectFlask(id) { S.sel = id; renderChips(); show(); }
    function renderChips() {
      chips.replaceChildren();
      S.flasks.forEach(f => {
        const b = el("button", "in-flask" + (f.id === S.sel ? " sel" : ""));
        b.type = "button"; b.title = f.label;
        const liq = el("span", "in-liq"); liq.style.background = css(f); b.append(liq, el("span", "in-fl", f.label.replace("PO₄³⁻ ", "")));
        b.addEventListener("click", () => selectFlask(f.id)); chips.appendChild(b);
      });
    }
    function show() {
      const f = S.flasks.find(x => x.id === S.sel);
      cuv.setAttribute("fill", f ? css(f) : "#fff"); cuv.setAttribute("fill-opacity", f ? 1 : 0);
      lcd1.textContent = `λ = ${S.lam} nm`;
      lcd2.textContent = S.last ? `A = ${fmt(S.last.A, 3)}` : "A = –";
      lcdw.textContent = S.last && S.last.fid !== undefined && !S.last.zeroed ? "⚠ нулирај на оваа λ" : (f ? "кивета: " + f.label : "избери тиквичка");
      clock.textContent = cfg.develop ? (S.reagent ? `⏱ Од додавање на реагенсите: ${S.t} min` : "⏱ Реагенсите сè уште не се додадени") : "";
    }
    function refresh() { renderChips(); show(); renderRes(); }
    function renderJournal() {
      jbox.replaceChildren(); if (!S.journal.length) return;
      jbox.appendChild(el("div", "in-cap", "Дневник на мерења"));
      const t = el("table", "in-tbl"), h = el("tr"); ["Раствор", "λ / nm", "A"].forEach(x => h.appendChild(el("th", "", x))); t.appendChild(el("thead")).appendChild(h);
      const b = el("tbody"); S.journal.slice(-14).forEach(j => { const r = el("tr"); r.append(el("td", "", j.label), el("td", "", String(j.lam)), el("td", "", fmt(j.A, 3))); b.appendChild(r); });
      t.appendChild(b); jbox.appendChild(el("div", "in-tblwrap")).appendChild(t);
      jbox.appendChild(btn("🗑 Исчисти дневник", "btn ghost", () => { S.journal = []; renderRes(); }));
    }
    const latest = (fid, lam) => { for (let i = S.journal.length - 1; i >= 0; i--) if (S.journal[i].fid === fid && S.journal[i].lam === lam) return S.journal[i].A; return null; };
    const cals = {};
    function renderRes() {
      renderJournal(); resBox.replaceChildren();
      const grid = el("div", "in-charts");
      cfg.species.forEach(sp => sp.need.forEach(lam => {
        const pts = S.flasks.filter(f => f.type === "std" && f.sp === sp.k).map(f => ({ f, A: latest(f.id, lam) })).filter(p => p.A !== null).map(p => ({ x: p.f.conc[sp.k], y: p.A }));
        const reg = pts.length >= 3 ? M.linreg(pts) : null; cals[sp.k + lam] = reg;
        const box = el("div", "in-chartbox"); box.appendChild(el("div", "in-cap", `${sp.name} на ${lam} nm`));
        const cb = el("div"); box.appendChild(cb);
        const xmax = Math.max(...sp.targets) * 1.05;
        chart(cb, { w: 360, h: 230, xl: "γ / (μg/cm³)", yl: "A", pts, xmin: 0, xmax, ymin: 0, lines: reg ? [{ a: reg.a, b: reg.b, x0: 0, x1: xmax }] : [], title: "Стандардна крива" });
        box.appendChild(el("div", "in-eq", reg ? `A = ${fmt(reg.a, 5)}·γ ${reg.b < 0 ? "−" : "+"} ${fmt(Math.abs(reg.b), 4)}   (R² = ${fmt(reg.r2, 4)})` : `Запиши ја A за најмалку 3 стандарди на ${lam} nm (λ = ${lam}).`));
        grid.appendChild(box);
      }));
      resBox.appendChild(grid);
      renderAns();
    }
    let ansState = { checked: false, vals: {} };
    function renderAns() {
      ans.replaceChildren();
      const fields = cfg.species.map(sp => ({ k: sp.k, label: `γ(${sp.name}) во пробата (μg/cm³)` }));
      if (cfg.develop) fields.push({ k: "m", label: `m(PO₄³⁻) во пробата од ${cfg.flaskV} cm³ (μg)` });
      ans.appendChild(el("h5", "", "Анализирана проба"));
      ans.appendChild(el("p", "in-hint", cfg.develop ? "Измери ја пробата (тиквичка „Проба“) на 600 nm, запиши ја A и отчитај γ од стандардната крива. Потоа пресметај ја масата." : "Измери ја пробата на 550 nm и на 430 nm и запиши ги двете апсорбанци. Mn го читаш од кривата на 550 nm, а за Cr го одземаш придонесот на Mn на 430 nm."));
      const g = el("div", "in-fields"), ins = {};
      fields.forEach(f => { const l = el("label", "in-lab", f.label); const i = el("input", "calc-num"); i.type = "text"; i.inputMode = "decimal"; i.autocomplete = "off"; i.value = ansState.vals[f.k] || ""; i.addEventListener("input", () => (ansState.vals[f.k] = i.value)); l.appendChild(i); g.appendChild(l); ins[f.k] = i; });
      ans.appendChild(g);
      const out = el("div", "in-feedback");
      const chk = btn("✔ Провери", "btn", () => {
        out.replaceChildren(); let all = true;
        const truth = {}; cfg.species.forEach(sp => (truth[sp.k] = S.truth[sp.k])); if (cfg.develop) truth.m = S.truth.P * cfg.flaskV;
        fields.forEach(f => {
          const v = num(ins[f.k].value), t = truth[f.k], tol = Math.max(cfg.tol * t, cfg.abs[f.k] || 0), ok = isFinite(v) && Math.abs(v - t) <= tol; all = all && ok;
          out.appendChild(el("p", ok ? "in-fb-ok" : "in-fb-bad", `${ok ? "✅" : "❌"} ${f.label.split(" (")[0]}: ${isFinite(v) ? fmt(v, 2) : "–"} (вистинска вредност: ${fmt(t, 2)}, дозволено ±${fmt(tol, 2)})`));
        });
        out.appendChild(el("p", all ? "in-fb-ok" : "in-msg", all ? "🎉 Точно определување!" : "Провери ги мерењата, нулирањето и стандардната крива, па обиди се повторно."));
      });
      const sol = btn("🧮 Покажи ја пресметката", "btn ghost", () => {
        out.replaceChildren(); const L = steps(); L.forEach(t => out.appendChild(el("div", "in-eq", t)));
      });
      const nw = btn("🎲 Нова непозната проба", "btn ghost", () => { S.truth = cfg.sample(); S.journal = S.journal.filter(j => j.fid !== "sample"); ansState = { checked: false, vals: {} }; renderRes(); });
      ans.append(chk, sol, nw, out);
    }
    function steps() {
      const L = [], sA = lam => latest("sample", lam);
      const need = (k, lam) => { const r = cals[k + lam]; return r; };
      if (cfg.develop) {
        const r = need("P", 600), A = sA(600);
        if (!r || A === null) return ["Потребни се: стандардна крива на 600 nm (≥3 точки) и измерена проба на 600 nm."];
        const g = (A - r.b) / r.a; L.push(`γ = (A − b)/a = (${fmt(A, 3)} − ${fmt(r.b, 4)}) / ${fmt(r.a, 5)} = ${fmt(g, 2)} μg/cm³`, `m = γ · V = ${fmt(g, 2)} · ${cfg.flaskV} = ${fmt(g * cfg.flaskV, 1)} μg`);
        return L;
      }
      const rMn550 = need("Mn", 550), rMn430 = need("Mn", 430), rCr = need("Cr", 430), A550 = sA(550), A430 = sA(430);
      if (!rMn550 || !rMn430 || !rCr || A550 === null || A430 === null) return ["Потребни се сите три стандардни криви (≥3 точки) и пробата измерена на 550 и на 430 nm."];
      const gMn = (A550 - rMn550.b) / rMn550.a, aMn430 = rMn430.a * gMn + rMn430.b, aCr = A430 - aMn430, gCr = (aCr - rCr.b) / rCr.a;
      L.push(`1) γ(Mn) = (A₅₅₀ − b)/a = (${fmt(A550, 3)} − ${fmt(rMn550.b, 4)}) / ${fmt(rMn550.a, 5)} = ${fmt(gMn, 2)} μg/cm³`,
        `2) A(Mn) на 430 nm од кривата 2 = ${fmt(aMn430, 3)}`, `3) A(Cr) на 430 nm = A₄₃₀(проба) − A(Mn) = ${fmt(A430, 3)} − ${fmt(aMn430, 3)} = ${fmt(aCr, 3)}`,
        `4) γ(Cr) = (A(Cr) − b)/a = ${fmt(gCr, 1)} μg/cm³`);
      return L;
    }

    // почетни колби (слепа проба и проба)
    S.flasks.push({ id: "blank", type: "blank", label: cfg.develop ? "Слепа" : "Вода", conc: {} });
    S.flasks.push({ id: "sample", type: "sample", label: "Проба", conc: S.truth });
    // пробата се нова при повторно
    Object.defineProperty(S.flasks[1], "conc", { get: () => S.truth });
    S.sel = "sample"; refresh();
  }

  // ============================================================
  //  ТИТРАЦИИ (кондуктометрија и pH-метрија)
  // ============================================================
  const SAMPLES = { s: "H₂SO₄", a: "CH₃COOH", m: "смеса H₂SO₄ + CH₃COOH" };

  function buildTitration(host) {
    host.replaceChildren();
    host.appendChild(el("p", "in-intro", "Изведи титрација со NaOH. Пипетирај 20 cm³ од примерокот, разреди го до околу 100 cm³, потопи ја електродата и додавај база во порции. Завршната точка се определува од кривата."));
    const T = { method: "cond", kind: "s", S: null };
    const top = el("div", "in-row in-setup");
    const mSel = el("select", "calc-num in-sel"), kSel = el("select", "calc-num in-sel");
    [["cond", "Кондуктометриска"], ["ph", "pH-метриска"]].forEach(o => mSel.appendChild(new Option(o[1], o[0])));
    Object.keys(SAMPLES).forEach(k => kSel.appendChild(new Option(SAMPLES[k], k)));
    const lm = el("label", "in-lab", "Метода: "); lm.appendChild(mSel); const lk = el("label", "in-lab", "Примерок: "); lk.appendChild(kSel);
    top.append(lm, lk, btn("🎲 Нов примерок", "btn", () => init()));
    host.appendChild(top);

    const layout = el("div", "in-layout"), stageCol = el("div", "in-stagecol"), ctl = el("div", "in-ctl");
    layout.append(stageCol, ctl); host.appendChild(layout);

    // --- сцена
    const svg = sv("svg", { viewBox: "0 0 260 360", class: "in-spec", role: "img", "aria-label": "Бирета, чаша и електрода" });
    svg.innerHTML = `
      <rect x="120" y="14" width="26" height="150" rx="3" fill="#f4f9ff" stroke="#8fa6bd" stroke-width="3"/>
      <rect id="bur" x="123" y="17" width="20" height="144" fill="#cfe6f5" fill-opacity=".8"/>
      <g stroke="#8fa6bd" stroke-width="1">${Array.from({ length: 11 }, (_, i) => `<line x1="120" x2="${i % 2 ? 128 : 134}" y1="${17 + i * 14.4}" y2="${17 + i * 14.4}"/>`).join("")}</g>
      <rect x="127" y="166" width="12" height="10" fill="#c2410c"/><path d="M130 176 h6 v14 l-3 6 l-3 -6 z" fill="#e6eef5" stroke="#8fa6bd" stroke-width="2"/>
      <path d="M60 214 V318 a10 10 0 0 0 10 10 H190 a10 10 0 0 0 10 -10 V214" fill="rgba(255,255,255,.35)" stroke="#8fa6bd" stroke-width="4"/>
      <clipPath id="tclip"><path d="M62 214 V318 a8 8 0 0 0 8 8 H190 a8 8 0 0 0 8 -8 V214 Z"/></clipPath>
      <rect id="liq" x="60" y="326" width="140" height="0" fill="#cfe6f5" fill-opacity=".7" clip-path="url(#tclip)"/>
      <ellipse id="bar" cx="130" cy="318" rx="14" ry="4" fill="#3b3b44"/>
      <g id="probe"><rect x="172" y="120" width="12" height="190" rx="4" fill="#d8dee6" stroke="#7d93a8" stroke-width="2"/><rect x="170" y="300" width="16" height="18" rx="8" fill="#9ec7e8" stroke="#6f87a0" stroke-width="2"/></g>
      <g id="drops"></g>`;
    const stage = el("div", "in-stage"); stage.appendChild(svg); stageCol.appendChild(stage);
    const bur = svg.querySelector("#bur"), liq = svg.querySelector("#liq"), bar = svg.querySelector("#bar"), probe = svg.querySelector("#probe"), dropsG = svg.querySelector("#drops");
    const meter = el("div", "in-meter"); const mLab = el("div", "in-meter-l", ""), mVal = el("div", "in-meter-v", "–"); meter.append(mLab, mVal); stageCol.appendChild(meter);
    const bRead = el("div", "in-clock"); stageCol.appendChild(bRead);

    // --- контроли
    const c1 = el("div", "in-step"); c1.appendChild(el("h4", "", "1. Подготовка на пробата"));
    const stepsBox = el("div", "in-stepbtns"); c1.appendChild(stepsBox);
    const msgS = el("p", "in-msg"); c1.appendChild(msgS);
    const c2 = el("div", "in-step"); c2.appendChild(el("h4", "", "2. Титрација"));
    const addRow = el("div", "in-row"); c2.appendChild(addRow);
    const msgT = el("p", "in-msg"); c2.appendChild(msgT);
    const runTabs = el("div", "in-runs"); c2.appendChild(runTabs);
    const tblBox = el("div", "in-tblwrap"); c2.appendChild(tblBox);
    const c3 = el("div", "in-step"); c3.appendChild(el("h4", "", "3. Графикон и завршна точка"));
    const chBox = el("div"), ch2 = el("div"), anBox = el("div", "in-an"); c3.append(chBox, ch2, anBox);
    const qs = el("div", "in-qs"); qs.appendChild(el("h4", "", "Прашања"));
    ctl.append(c1, c2, c3, qs);

    let S = null, run = null;

    function init() {
      T.method = mSel.value; T.kind = kSel.value;
      const cN = +rnd(0.095, 0.11).toFixed(4); let ns = 0, na = 0;
      if (T.kind === "s") ns = rnd(4, 8) * cN / 2;
      if (T.kind === "a") na = rnd(8, 12) * cN;
      if (T.kind === "m") { ns = rnd(3, 5) * cN / 2; na = rnd(5, 8) * cN; }
      S = { cN, ns, na, runs: [], cur: 0, calibrated: false, ansVals: {} }; newRun();
      qs.replaceChildren(el("h4", "", "Прашања")); questions();
      renderAll();
    }
    function newRun() { run = { stage: 0, V: 0, pts: [], eq: [], br: [] }; S.runs.push(run); S.cur = S.runs.length - 1; }
    const nEq = () => (T.kind === "m" ? 2 : 1);
    const Vtrue = () => M.trueVeq(S.ns, S.na, S.cN);
    const lab = () => (T.method === "cond" ? "κ / (μS/cm)" : "pH");
    const stepList = () => {
      const a = [["💧 Пипетирај 20 cm³ од примерокот во чаша"], ["🚰 Разреди со дестилирана вода до ≈ 100 cm³"]];
      if (T.method === "ph") a.push(["🎚 Калибрирај го pH-метарот (пуфери 4,00 и 7,00)"]);
      a.push([T.method === "cond" ? "🔌 Стави мешалка и потопи ја кондуктометриската ќелија" : "🔌 Стави мешалка и потопи ја комбинираната електрода"]);
      a.push(["📖 Отчитај ја почетната вредност (V = 0)"]);
      return a;
    };
    function doStep(i) {
      const L = stepList(), name = L[i][0];
      if (i !== run.stage) return;
      if (name.startsWith("📖")) { record(0, 0); }
      run.stage++; renderAll();
    }
    function level() { // ниво на течност (cm³ → висина)
      const v = run.stage === 0 ? 0 : (run.stage === 1 ? 20 : 100) + (run.stage >= stepList().length - 1 ? run.V : 0);
      return clamp(v / 130, 0, 1);
    }
    function reading(V) {
      let y = M.titration(T.method, S.ns, S.na, S.cN, V);
      if (T.method === "cond") y = y * (1 + 0.004 * gauss() * 0.7) + 0.3 * gauss(); else y = Math.round((y + 0.003 * gauss()) * 100) / 100;   // pH-метар: 2 децимали
      return y;
    }
    function record(dv, V) {
      run.pts.push({ x: +V.toFixed(2), y: reading(V), V: +V.toFixed(2) });
    }
    function addVol(dv) {
      if (run.stage < stepList().length) { msgT.textContent = "Заврши ја подготовката (чекор 1)."; msgT.className = "in-msg bad"; return; }
      if (!(dv > 0)) { msgT.textContent = "Внеси позитивен волумен."; msgT.className = "in-msg bad"; return; }
      if (run.V + dv > 25 + 1e-9) { msgT.textContent = "Буретата е од 25 cm³; нема повеќе база."; msgT.className = "in-msg bad"; return; }
      msgT.textContent = ""; msgT.className = "in-msg";
      run.V = +(run.V + dv).toFixed(2); record(dv, run.V); drop(); renderAll();
    }
    function drop() {
      if (reduce) return;
      for (let i = 0; i < 3; i++) {
        const c = sv("circle", { cx: 133, cy: 192, r: 3.5, fill: "#cfe6f5", stroke: "#6f9bc2" }); dropsG.appendChild(c);
        const y1 = 326 - level() * 112;
        const a = c.animate([{ transform: "translateY(0)", opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translateY(${y1 - 192}px)`, opacity: 1 }], { duration: 380, delay: i * 120, easing: "ease-in" });
        a.onfinish = () => c.remove();
      }
    }
    function lastReading() { const p = run.pts[run.pts.length - 1]; return p ? p.y : null; }

    function renderAll() {
      // сцена
      const hL = level() * 112; liq.setAttribute("y", 326 - hL); liq.setAttribute("height", hL);
      bar.style.animation = run.stage >= stepList().length - 1 && !reduce ? "inSpin .5s linear infinite" : "none"; bar.style.transformOrigin = "130px 318px";
      bur.setAttribute("y", 17 + 144 * (run.V / 25)); bur.setAttribute("height", 144 * (1 - run.V / 25));
      bRead.textContent = `Бирета: потрошено ${fmt(run.V, 2)} cm³ NaOH (c = ${fmt(S.cN, 4)} mol/L)`;
      const lr = lastReading();
      mLab.textContent = T.method === "cond" ? "Кондуктометар" : "pH-метар"; mVal.textContent = lr === null ? "–" : T.method === "cond" ? `${fmt(lr, 1)} μS/cm` : `pH ${fmt(lr, 2)}`;
      // чекори
      stepsBox.replaceChildren();
      stepList().forEach((s, i) => {
        const b = btn((i < run.stage ? "✓ " : "") + s[0], "btn " + (i === run.stage ? "" : "ghost") + (i < run.stage ? " done" : ""), () => doStep(i));
        b.disabled = i !== run.stage; stepsBox.appendChild(b);
      });
      msgS.textContent = ""; // додавање
      addRow.replaceChildren();
      const ready = run.stage >= stepList().length;
      [0.1, 0.5, 1].forEach(v => { const b = btn(`+ ${fmt(v, 1)} cm³`, "btn ghost", () => addVol(v)); b.disabled = !ready; addRow.appendChild(b); });
      const ci = el("input", "calc-num in-in"); ci.type = "text"; ci.inputMode = "decimal"; ci.placeholder = "cm³"; ci.disabled = !ready;
      const cb = btn("Додај", "btn", () => addVol(num(ci.value))); cb.disabled = !ready;
      addRow.append(ci, cb);
      addRow.appendChild(btn("➕ Нов примерок (повторување)", "btn ghost", () => { newRun(); renderAll(); }));
      runTabs.replaceChildren();
      if (S.runs.length > 1) S.runs.forEach((r, i) => { const b = btn(`${i + 1}. титрација`, "ep-cat" + (i === S.cur ? " active" : ""), () => { S.cur = i; run = S.runs[i]; renderAll(); }); runTabs.appendChild(b); });
      renderTable(); renderCharts();
    }
    function sel(i, list) { const k = list.indexOf(i); if (k >= 0) list.splice(k, 1); else { list.push(i); if (list.length > nEq()) list.shift(); } }
    function renderTable() {
      tblBox.replaceChildren(); const p = run.pts; if (!p.length) return;
      const t = el("table", "in-tbl"), h = el("tr");
      const heads = T.method === "cond" ? ["V(NaOH) / cm³", "κ / (μS/cm)", "гранка"] : ["V(NaOH) / cm³", "pH", "ΔpH", "ΔV", "V̄ / cm³", "ΔpH/ΔV", "З.Т.Т."];
      heads.forEach(x => h.appendChild(el("th", "", x))); t.appendChild(el("thead")).appendChild(h);
      const b = el("tbody");
      p.forEach((q, i) => {
        const r = el("tr");
        if (T.method === "cond") {
          r.append(el("td", "", fmt(q.V, 2)), el("td", "", fmt(q.y, 1)));
          const s = el("select", "in-brsel"); const nb = T.kind === "m" ? 3 : 2;
          s.appendChild(new Option("–", 0)); for (let k = 1; k <= nb; k++) s.appendChild(new Option(String(k), k));
          s.value = run.br[i] || 0; s.addEventListener("change", () => { run.br[i] = +s.value; renderCharts(); });
          const td = el("td"); td.appendChild(s); r.appendChild(td);
        } else {
          const prev = p[i - 1];
          const dY = prev ? q.y - prev.y : null, dV = prev ? q.V - prev.V : null, vm = prev ? (q.V + prev.V) / 2 : null, d = prev ? dY / dV : null;
          r.append(el("td", "", fmt(q.V, 2)), el("td", "", fmt(q.y, 2)), el("td", "", prev ? fmt(dY, 2) : ""), el("td", "", prev ? fmt(dV, 2) : ""), el("td", "", prev ? fmt(vm, 2) : ""), el("td", "", prev ? fmt(d, 2) : ""));
          const td = el("td"); if (prev) { const rb = el("input"); rb.type = "checkbox"; rb.checked = run.eq.includes(i); rb.addEventListener("change", () => { sel(i, run.eq); renderTable(); renderCharts(); }); td.appendChild(rb); }
          r.appendChild(td); if (run.eq.includes(i)) r.className = "in-sel-row";
        }
        b.appendChild(r);
      });
      t.appendChild(b); tblBox.appendChild(t);
    }
    function lineSet() {
      const nb = T.kind === "m" ? 3 : 2, lines = [];
      for (let k = 1; k <= nb; k++) { const pts = run.pts.filter((q, i) => run.br[i] === k); lines.push(pts.length >= 2 ? Object.assign(M.linreg(pts), { pts }) : null); }
      return lines;
    }
    function renderCharts() {
      const p = run.pts; ch2.replaceChildren(); anBox.replaceChildren();
      if (p.length < 2) { chBox.replaceChildren(el("p", "in-hint", "Графиконот се појавува откако ќе направиш мерења.")); return; }
      const Vmax = Math.max(...p.map(q => q.x), 1) * 1.05;
      if (T.method === "cond") {
        const L = lineSet(), nb = L.length, inter = [];
        for (let k = 0; k < nb - 1; k++) if (L[k] && L[k + 1] && L[k].a !== L[k + 1].a) inter.push((L[k + 1].b - L[k].b) / (L[k].a - L[k + 1].a));
        const lines = [];
        L.forEach((l, k) => { if (!l) return; const xs = l.pts.map(q => q.x); lines.push({ a: l.a, b: l.b, x0: Math.max(0, Math.min(...xs) - 0.5), x1: Math.max(...xs) + 0.5, c: "b" + (k + 1) }); });
        chart(chBox, { xl: "V(NaOH) / cm³", yl: "κ / (μS/cm)", pts: p.map((q, i) => ({ x: q.x, y: q.y, c: "b" + (run.br[i] || 0) })), lines, xmin: 0, xmax: Vmax, marks: inter.filter(isFinite).map(x => ({ x })), title: "Кондуктометриска титрациона крива" });
        const tools = el("div", "in-row");
        tools.appendChild(btn("🪄 Автоматски предлог за гранки", "btn ghost", () => { if (p.length < 8) { msgT.textContent = "Потребни се барем 8 мерења."; msgT.className = "in-msg warn"; return; } const br = M.autoBranches(p, nb); if (br) { run.br = br; renderTable(); renderCharts(); } }));
        tools.appendChild(btn("↺ Ресетирај гранки", "btn ghost", () => { run.br = []; renderTable(); renderCharts(); }));
        anBox.appendChild(tools);
        anBox.appendChild(el("p", "in-hint", `Означи во табелата која точка припаѓа на која права (1–${nb}); точките околу прегибот остави ги „–“. Од пресекот на правите се чита завршната точка.`));
        L.forEach((l, k) => { if (l) anBox.appendChild(el("div", "in-eq", `Права ${k + 1}: y = ${fmt(l.a, 2)}·x ${l.b < 0 ? "−" : "+"} ${fmt(Math.abs(l.b), 1)}   (R² = ${fmt(l.r2, 4)}, ${l.n} точки)`)); });
        if (inter.length === nb - 1 && inter.every(isFinite)) { inter.forEach((x, k) => anBox.appendChild(el("div", "in-eq strong", `Пресек ${k + 1}: V = ${fmt(x, 2)} cm³`))); answers(inter); }
      } else {
        const pts = p.map((q, i) => ({ x: q.x, y: q.y }));
        chart(chBox, { xl: "V(NaOH) / cm³", yl: "pH", pts, curve: pts, xmin: 0, xmax: Vmax, title: "pH-метриска титрациона крива" });
        const dpts = []; for (let i = 1; i < p.length; i++) dpts.push({ x: (p[i].V + p[i - 1].V) / 2, y: (p[i].y - p[i - 1].y) / (p[i].V - p[i - 1].V), c: run.eq.includes(i) ? "sel" : "", i });
        chart(ch2, { xl: "V̄ / cm³", yl: "ΔpH/ΔV", pts: dpts, xmin: 0, xmax: Vmax, ymin: 0, title: "Диференцијална крива", onpt: k => { sel(dpts[k].i, run.eq); renderTable(); renderCharts(); } });
        ch2.prepend(el("div", "in-cap", "Диференцијална крива (кликни на врвот за да ја означиш З.Т.Т.)"));
        const vs = run.eq.slice().sort((a, b) => a - b).map(i => (p[i].V + p[i - 1].V) / 2);
        anBox.appendChild(el("p", "in-hint", `Означи ${nEq() === 2 ? "две завршни точки (од најголемиот скок на ΔpH/ΔV)" : "завршна точка (најголем скок на pH)"} во табелата или на диференцијалната крива. За поточен резултат повтори ја титрацијата со по 0,1 cm³ околу скокот.`));
        vs.forEach((v, k) => anBox.appendChild(el("div", "in-eq strong", `З.Т.Т. ${vs.length > 1 ? k + 1 : ""}: V = ${fmt(v, 2)} cm³`)));
        if (vs.length === nEq()) answers(vs);
      }
    }
    function answers(Vs) {
      const fld = [];
      if (T.kind === "s") fld.push({ k: "s", label: "m(H₂SO₄) во 20 cm³ (mg)", hint: `m = ½·V·c(NaOH)·M(H₂SO₄)`, t: S.ns * M.MW.H2SO4, calc: () => 0.5 * Vs[0] * S.cN * M.MW.H2SO4 });
      if (T.kind === "a") fld.push({ k: "a", label: "m(CH₃COOH) во 20 cm³ (mg)", hint: `m = V·c(NaOH)·M(CH₃COOH)`, t: S.na * M.MW.HAc, calc: () => Vs[0] * S.cN * M.MW.HAc });
      if (T.kind === "m") {
        fld.push({ k: "s", label: "m(H₂SO₄) во 20 cm³ (mg)", hint: "m = ½·V₁·c·M(H₂SO₄)", t: S.ns * M.MW.H2SO4, calc: () => 0.5 * Vs[0] * S.cN * M.MW.H2SO4 });
        fld.push({ k: "a", label: "m(CH₃COOH) во 20 cm³ (mg)", hint: "m = (V₂ − V₁)·c·M(CH₃COOH)", t: S.na * M.MW.HAc, calc: () => (Vs[1] - Vs[0]) * S.cN * M.MW.HAc });
      }
      const box = el("div", "in-ansbox"); box.appendChild(el("h5", "", "Пресметка на масата"));
      box.appendChild(el("p", "in-hint", fld.map(f => f.hint).join(" · ") + "  (M(H₂SO₄) = 98,08 g/mol, M(CH₃COOH) = 60,05 g/mol)"));
      const g = el("div", "in-fields"), ins = {};
      fld.forEach(f => { const l = el("label", "in-lab", f.label); const i = el("input", "calc-num"); i.type = "text"; i.inputMode = "decimal"; i.autocomplete = "off"; i.value = S.ansVals[f.k] || ""; i.addEventListener("input", () => (S.ansVals[f.k] = i.value)); l.appendChild(i); g.appendChild(l); ins[f.k] = i; });
      box.appendChild(g);
      const out = el("div", "in-feedback");
      box.append(btn("✔ Провери", "btn", () => {
        out.replaceChildren(); let all = true;
        fld.forEach(f => { const v = num(ins[f.k].value), ok = isFinite(v) && Math.abs(v - f.t) / f.t <= 0.05; all = all && ok; out.appendChild(el("p", ok ? "in-fb-ok" : "in-fb-bad", `${ok ? "✅" : "❌"} ${f.label.split(" (")[0]}: ${isFinite(v) ? fmt(v, 2) : "–"} mg (вистинска: ${fmt(f.t, 2)} mg, ±5%)`)); });
        const T0 = Vtrue();
        out.appendChild(el("p", "in-hint", `Вистински V(З.Т.Т.): ${T.kind === "m" ? fmt(T0.V1, 2) + " и " + fmt(T0.V2, 2) : T.kind === "s" ? fmt(T0.V1, 2) : fmt(T0.V2, 2)} cm³; твоите: ${Vs.map(v => fmt(v, 2)).join(" и ")} cm³.`));
        out.appendChild(el("p", all ? "in-fb-ok" : "in-msg", all ? "🎉 Точно определување!" : "Не е во границите. Провери ги гранките/З.Т.Т. и пресметката."));
        if (!all && T.method === "ph") out.appendChild(el("p", "in-hint", "Совет: З.Т.Т. се чита како средина на интервалот (V̄), па кај чекори од 1 cm³ грешката може да е до ±0,5 cm³. Притисни „➕ Нов примерок“, додај база грубо до пред скокот, а потоа по 0,1 cm³ низ скокот."));
      }), btn("🧮 Покажи пресметка", "btn ghost", () => { out.replaceChildren(); fld.forEach(f => out.appendChild(el("div", "in-eq", `${f.label.split(" (")[0]} = ${fmt(f.calc(), 2)} mg`))); }));
      box.appendChild(out); anBox.appendChild(box);
    }
    function questions() {
      if (T.method === "cond") {
        if (T.kind === "s") qs.append(qa("Зошто се забележува само една З.Т.Т., иако H₂SO₄ е дипротонска?", "Втората дисоцијација на H₂SO₄ е доволно силна (Ka₂ ≈ 1,2·10⁻²), па двата протона се неутрализираат практично истовремено; затоа има една завршна точка при n(NaOH) = 2·n(H₂SO₄)."), qa("Кои јони се присутни во З.Т.Т.?", "Na⁺ и SO₄²⁻ (плус занемарливо мали количества H⁺ и OH⁻ од водата)."));
        if (T.kind === "a") qs.append(qa("Зошто почетната спроводливост е мала и постепено расте до З.Т.Т.?", "CH₃COOH е слаба киселина (малку дисоцира). Со додавање NaOH се образува CH₃COONa, јак електролит, па концентрацијата на јони расте. По З.Т.Т. нагло расте од вишокот OH⁻ (голема подвижност)."), qa("Колкава е pH во З.Т.Т. и зошто?", "pH > 7, затоа што ацетатниот јон хидролизира: CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻."));
        if (T.kind === "m") qs.append(qa("Зошто прво реагира силната, а потоа слабата киселина?", "OH⁻ прво ги неутрализира слободните H⁺ од силната киселина; дисоцијацијата на слабата киселина е потисната додека има многу H⁺, па таа реагира подоцна."), qa("Зошто до првата З.Т.Т. спроводливоста паѓа?", "Многу подвижните H⁺ се заменуваат со помалку подвижните Na⁺."));
      } else {
        qs.append(qa("Каков раствор се образува пред З.Т.Т. кај CH₃COOH?", "Пуфер од CH₃COOH и CH₃COO⁻; pH се менува бавно. Во половината од З.Т.Т. pH ≈ pKa = 4,76."), qa("Зошто во З.Т.Т. pH е над 7?", "Затоа што во растворот на CH₃COONa ацетатот хидролизира и дава OH⁻."), qa("Зошто во близина на З.Т.Т. се титрира со по 0,1 cm³?", "Скокот на pH е многу остар; помали чекори даваат попрецизно определување на V(З.Т.Т.)."));
      }
    }
    mSel.addEventListener("change", init); kSel.addEventListener("change", init);
    init();
  }

  // ============================================================
  //  НАВИГАЦИЈА
  // ============================================================
  const labs = [
    { id: "pho", name: "🔵 Фосфати (фотометрија)", build: h => buildPhoto(h, PHOTO.pho) },
    { id: "mix", name: "🟣 Cr(VI) и Mn(VII) во смеса", build: h => buildPhoto(h, PHOTO.mix) },
    { id: "tit", name: "⚗️ Титрации (κ и pH)", build: h => buildTitration(h) }
  ];
  const nav = el("div", "ep-chips in-nav"), body = el("div", "in-body");
  const hosts = {};
  labs.forEach((l, i) => {
    const b = el("button", "ep-cat" + (i ? "" : " active"), l.name); b.type = "button";
    const h = el("div", "in-lab-host"); h.hidden = !!i; hosts[l.id] = h; body.appendChild(h);
    b.addEventListener("click", () => { nav.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b)); labs.forEach(k => (hosts[k.id].hidden = k.id !== l.id)); });
    nav.appendChild(b);
    l.build(h);
  });
  root.append(nav, body);

  // табот „Инструментални методи“ (ако alatki.js не го обработува, го прави овој код)
  const tab = document.getElementById("at-tab-inst"), panel = document.getElementById("at-panel-inst");
  if (tab && panel) {
    document.querySelectorAll(".at-tab").forEach(t => t.addEventListener("click", () => {
      const mine = t === tab;
      panel.hidden = !mine; tab.classList.toggle("active", mine); tab.setAttribute("aria-selected", mine ? "true" : "false");
      if (mine) document.querySelectorAll(".at-panel").forEach(p => { if (p !== panel) p.hidden = true; });
    }));
  }
})();
