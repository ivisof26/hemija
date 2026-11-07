// Симетрија на молекули: објаснување, истражувач и игра „Погоди ја точковната група“
(function () {
  const root = document.getElementById("sy-root");
  if (!root || typeof SYM_MOLS === "undefined") return;

  const NS = "http://www.w3.org/2000/svg";
  const GK = Object.keys(SYM_GROUPS);
  const ROUND = 10;
  const sub = s => s.replace(/_([A-Za-z0-9∞]+)/g, "<sub>$1</sub>");
  const gsym = k => k[0] + "<sub>" + k.slice(1).replace("inf", "∞") + "</sub>";
  const H = (tag, cls, html) => { const e = G.el(tag, cls); if (html !== undefined) e.innerHTML = html; return e; };
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  // ---------- вектори ----------
  const norm = v => Math.hypot(v[0], v[1], v[2]);
  const unit = v => { const n = norm(v); return v.map(x => x / n); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  // ---------- изглед на атоми ----------
  const COL = { H: "#f4f4f4", C: "#555a63", N: "#3b5bdb", O: "#e03131", F: "#51cf66", Cl: "#2f9e44", Br: "#a0522d", S: "#f2c230", B: "#e8a0a0", P: "#f08c00", Xe: "#845ef7" };
  const RAD = { H: .31, C: .76, N: .71, O: .66, F: .57, Cl: 1.0, Br: 1.15, S: 1.0, B: .84, P: 1.05, Xe: 1.3 };
  const AXC = { 2: "#d64545", 3: "#7b3fe4", 4: "#e07b00", 6: "#0d8f8f", 0: "#2d1b4e", S: "#c026d3" };
  const PLC = { h: "#2d7ff9", v: "#2e9e5b", d: "#e07b00", x: "#2d7ff9" };
  const planeKind = l => (l.match(/_([hvd])/) || [0, "x"])[1];
  const axisColor = a => a.t === "S" ? AXC.S : (AXC[a.n] || AXC[0]);

  function labelEl(txt, x, y, color, size) {
    const t = sv("text", { x, y, fill: color, "font-size": size || 13, "font-weight": 700, "text-anchor": "middle", "paint-order": "stroke", stroke: "#fff", "stroke-width": 3, "stroke-linejoin": "round" });
    txt.split(/(_[A-Za-z0-9∞']+)/).forEach(part => {
      if (!part) return;
      const s = sv("tspan", part[0] === "_" ? { dy: 3, "font-size": (size || 13) * 0.72 } : {});
      s.textContent = part[0] === "_" ? part.slice(1) : part;
      t.appendChild(s);
      if (part[0] === "_") { const back = sv("tspan", { dy: -3 }); back.textContent = ""; t.appendChild(back); }
    });
    return t;
  }

  // ---------- 3D приказ ----------
  function viewer(mol, opts) {
    opts = opts || {};
    const wrap = G.el("div", "sy-viewer");
    const svg = sv("svg", { viewBox: "0 0 440 330", class: "sy-svg", role: "img", "aria-label": "Просторен приказ на молекулата " + mol.n });
    wrap.appendChild(svg);
    const layersBox = G.el("div", "sy-layers");
    const legend = G.el("div", "sy-legend");
    const hint = G.el("p", "sy-drag", "↻ Повлечи со глувчето или прстот за да ја завртиш молекулата.");
    wrap.append(layersBox, svg, hint, legend);

    const atoms = mol.atoms.map(a => ({ e: a[0], p: [a[1], a[2], a[3]] }));
    const R = Math.max(...atoms.map(a => norm(a.p))) + 0.6;
    const S = 118 / R;
    const bonds = [];
    for (let i = 0; i < atoms.length; i++) for (let j = i + 1; j < atoms.length; j++) {
      const d = norm(atoms[i].p.map((x, k) => x - atoms[j].p[k]));
      if (d < 1.3 * (RAD[atoms[i].e] + RAD[atoms[j].e]) && d > 0.5) bonds.push([i, j]);
    }

    let overlay = !!opts.overlay, ax = 0.42, ay = 0.7;
    const layers = { axes: true, planes: true, inv: true };

    // молекула (x,y,z) со вертикална z-оска: (x, z, -y)
    function proj(p) {
      const X = p[0], Y = p[2], Z = -p[1];
      const x1 = X * Math.cos(ay) + Z * Math.sin(ay), z1 = -X * Math.sin(ay) + Z * Math.cos(ay);
      const y2 = Y * Math.cos(ax) - z1 * Math.sin(ax), z2 = Y * Math.sin(ax) + z1 * Math.cos(ax);
      return { x: 220 + S * x1, y: 165 - S * y2, z: z2 };
    }
    const add = (p, q, k) => p.map((x, i) => x + q[i] * k);

    function draw() {
      svg.textContent = "";
      const items = [];
      // рамнини
      if (overlay && layers.planes) mol.planes.forEach(pn => {
        const n = unit(pn.n);
        const u = unit(cross(n, Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), v = cross(n, u), s = R * 0.95;
        const pts = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([a, b]) => proj(add(add([0, 0, 0], u, a * s), v, b * s)));
        const c = PLC[planeKind(pn.l)];
        const poly = sv("polygon", { points: pts.map(q => q.x.toFixed(1) + "," + q.y.toFixed(1)).join(" "), fill: c, "fill-opacity": 0.13, stroke: c, "stroke-opacity": 0.55, "stroke-width": 1.2 });
        svg.appendChild(poly);
        const top = pts.reduce((m, q) => q.y < m.y ? q : m, pts[0]);
        items.push({ z: 99, label: [pn.l, top.x, top.y + 12, c] });
      });
      // врски и атоми по длабочина
      const pr = atoms.map(a => proj(a.p));
      const draws = [];
      bonds.forEach(([i, j]) => draws.push({ z: (pr[i].z + pr[j].z) / 2 - 0.001, f: () => svg.appendChild(sv("line", { x1: pr[i].x, y1: pr[i].y, x2: pr[j].x, y2: pr[j].y, stroke: "#9b8fa0", "stroke-width": 5, "stroke-linecap": "round" })) }));
      atoms.forEach((a, i) => draws.push({ z: pr[i].z, f: () => {
        const r = Math.max(8, Math.min(24, (RAD[a.e] || .7) * S * 0.42));
        svg.appendChild(sv("circle", { cx: pr[i].x, cy: pr[i].y, r, fill: COL[a.e] || "#bbb", stroke: "#2a1f2d", "stroke-width": 1.2 }));
        if (r >= 10) { const t = sv("text", { x: pr[i].x, y: pr[i].y + 4, "text-anchor": "middle", "font-size": Math.min(13, r), "font-weight": 700, fill: ["H", "S", "F", "B"].includes(a.e) ? "#222" : "#fff", "pointer-events": "none" }); t.textContent = a.e; svg.appendChild(t); }
      } }));
      draws.sort((a, b) => a.z - b.z).forEach(d => d.f());
      // оски
      if (overlay && layers.axes) mol.axes.forEach(a => {
        const d = unit(a.d), L = R * 1.08, c = axisColor(a);
        const p1 = proj(add([0, 0, 0], d, -L)), p2 = proj(add([0, 0, 0], d, L));
        svg.appendChild(sv("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: c, "stroke-width": a.main ? 3 : 2.2, "stroke-dasharray": "7 4", "stroke-linecap": "round" }));
        const e = p1.y < p2.y ? p1 : p2;
        items.push({ z: 100, label: [a.l, e.x, e.y - 6, c] });
      });
      if (overlay && layers.inv && mol.inv) {
        const o = proj([0, 0, 0]);
        svg.appendChild(sv("path", { d: `M${o.x},${o.y - 8} L${o.x + 8},${o.y} L${o.x},${o.y + 8} L${o.x - 8},${o.y} Z`, fill: "#fff", stroke: "#111", "stroke-width": 2 }));
        items.push({ z: 100, label: ["i", o.x + 16, o.y - 8, "#111"] });
      }
      // ознаките не се преклопуваат: ако се судираат, се поместуваат нагоре
      const placed = [];
      items.forEach(it => {
        if (!it.label) return;
        let [txt, x, y, c] = it.label;
        const w = txt.replace(/_/g, "").length * 8 + 6;
        for (let k = 0; k < 8 && placed.some(r => Math.abs(r.x - x) < (r.w + w) / 2 && Math.abs(r.y - y) < 14); k++) y -= 15;
        placed.push({ x, y, w });
        svg.appendChild(labelEl(txt, x, y, c));
      });
    }

    function buildLegend() {
      legend.textContent = ""; layersBox.textContent = "";
      layersBox.hidden = legend.hidden = !overlay;
      if (!overlay) return;
      [["axes", "Оски", mol.axes.length], ["planes", "Рамнини", mol.planes.length], ["inv", "Центар i", mol.inv ? 1 : 0]].forEach(([k, t, n]) => {
        if (!n) return;
        const b = G.el("button", "btn ghost" + (layers[k] ? " active" : ""), t);
        b.type = "button";
        b.addEventListener("click", () => { layers[k] = !layers[k]; b.classList.toggle("active", layers[k]); draw(); });
        layersBox.appendChild(b);
      });
      const seen = new Map();
      const addLeg = (key, color, kind, html) => { if (!seen.has(key)) seen.set(key, { color, kind, html, n: 0 }); seen.get(key).n++; };
      mol.axes.forEach(a => addLeg("a" + a.l, axisColor(a), "line", sub(a.l) + " оска"));
      mol.planes.forEach(p => addLeg("p" + p.l, PLC[planeKind(p.l)], "box", sub(p.l) + " рамнина"));
      if (mol.inv) addLeg("i", "#111", "dia", "центар на инверзија i");
      if (!mol.axes.length && !mol.planes.length && !mol.inv) legend.appendChild(H("p", "sy-none", "Нема елементи на симетрија освен идентитетот E."));
      seen.forEach(o => {
        const row = G.el("span", "sy-leg");
        row.appendChild(H("i", "sy-sw " + o.kind, "")); row.firstChild.style.setProperty("--c", o.color);
        row.appendChild(H("span", "", o.html + (o.n > 1 ? " ×" + o.n : "")));
        legend.appendChild(row);
      });
      const note = [];
      if (mol.rep) note.push("На сликата се прикажани само по еден пример од: " + mol.rep + ".");
      if (mol.note) note.push(mol.note);
      if (note.length) legend.appendChild(H("p", "sy-repnote", note.join(" ")));
    }

    // вртење со влечење
    let drag = null;
    svg.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY }; try { svg.setPointerCapture(e.pointerId); } catch (_) {} });
    svg.addEventListener("pointermove", e => {
      if (!drag) return;
      ay += (e.clientX - drag.x) * 0.011;
      ax = Math.max(-1.45, Math.min(1.45, ax + (e.clientY - drag.y) * 0.011));
      drag = { x: e.clientX, y: e.clientY };
      draw();
    });
    ["pointerup", "pointercancel"].forEach(ev => svg.addEventListener(ev, () => { drag = null; }));

    buildLegend(); draw();
    return { el: wrap, setOverlay(on) { overlay = on; buildLegend(); draw(); } };
  }

  // ---------- објаснување ----------
  function theory() {
    const box = G.el("div", "sy-theory");
    const sec = (title, ...nodes) => { const s = G.el("section", "sy-sec"); s.appendChild(G.el("h4", "", title)); nodes.forEach(n => s.appendChild(n)); box.appendChild(s); return s; };
    const table = (head, rows) => {
      const w = G.el("div", "sy-tablewrap"), t = G.el("table", "sy-table");
      t.appendChild(H("thead", "", "<tr>" + head.map(h => "<th>" + h + "</th>").join("") + "</tr>"));
      t.appendChild(H("tbody", "", rows.map(r => "<tr>" + r.map(c => "<td>" + c + "</td>").join("") + "</tr>").join("")));
      w.appendChild(t); return w;
    };

    sec("1. Што е симетрија на молекулата?",
      H("p", "", "Молекулата е <b>симетрична</b> ако по одредена трансформација (на пример, ротација или пресликување) изгледа потполно исто како и пред неа. Таквата трансформација се нарекува <b>операција на симетрија</b>, а замислената точка, права или рамнина во однос на која се изведува се нарекува <b>елемент на симетрија</b>."),
      H("p", "", "Сите операции на симетрија на една молекула имаат најмалку една заедничка точка што останува неподвижна при нивното изведување. Групата што ги опфаќа сите овие операции се нарекува <b>точковна група</b>."));

    sec("2. Елементи на симетрија",
      table(["Елемент", "Операција", "Што значи", "Пример"], [
        ["E", "идентитет", "Не се прави ништо. Го има секоја молекула.", "сите молекули"],
        [sub("C_n"), "ротација околу оска", "Ротација за 360°/n. Оската со најголемо n е <b>главна оска</b>.", "H₂O: C<sub>2</sub> (180°); NH₃: C<sub>3</sub> (120°); бензен: C<sub>6</sub>"],
        ["σ", "огледало (рамнина)", "Одраз во рамнина. Три вида: <b>σ<sub>h</sub></b> (хоризонтална, нормална на главната оска), <b>σ<sub>v</sub></b> (вертикална, ја содржи главната оска и атоми), <b>σ<sub>d</sub></b> (дијагонална, ја содржи главната оска и ги преполовува аглите меѓу C<sub>2</sub> оските).", "H₂O има две σ<sub>v</sub>; BF₃ има σ<sub>h</sub>"],
        ["i", "инверзија", "Секој атом (x, y, z) оди во (−x, −y, −z), низ центарот.", "CO₂, SF₆, C₂H₄"],
        [sub("S_n"), "неправилна оска", "Ротација за 360°/n, па пресликување преку рамнина нормална на оската. S<sub>1</sub> = σ, S<sub>2</sub> = i.", "CH₄ има S<sub>4</sub>; алена (C₃H₄) има S<sub>4</sub>"]
      ]));

    sec("3. Колку точковни групи има?",
      (() => {
        const ul = G.el("ul", "sy-list");
        [
          "<b>За молекули нема краен број.</b> За секој цел број n постојат семејствата C<sub>n</sub>, C<sub>nv</sub>, C<sub>nh</sub>, S<sub>2n</sub>, D<sub>n</sub>, D<sub>nh</sub>, D<sub>nd</sub>, па заедно со посебните (T, T<sub>d</sub>, T<sub>h</sub>, O, O<sub>h</sub>, I, I<sub>h</sub> и линеарните C<sub>∞v</sub>, D<sub>∞h</sub>) теоретски има бесконечно многу.",
          "<b>Кристалите имаат точно 32 точковни групи.</b> Во кристал се можни само оски од ред 1, 2, 3, 4 и 6, а тоа ги ограничува можностите (кристалографски точкови групи).",
          "<b>Во практика</b> на молекулите најчесто им се среќаваат само неколку десетици групи. Овде ги вежбаш <b>18 најчести</b>, сите се во табелата подолу."
        ].forEach(t => ul.appendChild(H("li", "", t)));
        return ul;
      })());

    const fams = [["Ниска симетрија", "C<sub>1</sub>, C<sub>s</sub>, C<sub>i</sub>"], ["Оскени C<sub>n</sub>", "C<sub>n</sub>, C<sub>nv</sub>, C<sub>nh</sub>, S<sub>2n</sub>"], ["Дихедрални D<sub>n</sub>", "D<sub>n</sub>, D<sub>nh</sub>, D<sub>nd</sub> (C<sub>n</sub> оска и n нормални C<sub>2</sub>)"], ["Линеарни", "C<sub>∞v</sub>, D<sub>∞h</sub>"], ["Високи (повеќе оски од ред ≥ 3)", "T<sub>d</sub>, O<sub>h</sub>, I<sub>h</sub>"]];
    sec("4. Групите што ги учиш овде",
      H("p", "sy-small", "Секој ред е една точковна група: кои елементи ги има и примери од молекули. h е <b>ред на групата</b> (вкупен број операции)."),
      table(["Група", "Елементи на симетрија", "h", "Примери"], GK.map(k => [
        "<b>" + gsym(k) + "</b><br><span class=\"sy-small\">" + SYM_GROUP_NOTE[k] + "</span>",
        sub(SYM_GROUPS[k].el),
        SYM_GROUPS[k].h || "∞",
        SYM_MOLS.filter(m => m.g === k).map(m => m.f).join(", ")
      ])),
      H("p", "sy-small", "Семејства: " + fams.map(f => "<b>" + f[0] + "</b>: " + f[1]).join(" · ")));

    sec("5. Како се одредува точковната група",
      (() => {
        const ol = G.el("ol", "sy-steps");
        [
          "<b>Линеарна ли е?</b> Да → ако има центар на инверзија i: <b>D<sub>∞h</sub></b>; ако нема: <b>C<sub>∞v</sub></b>.",
          "<b>Повеќе оски од ред ≥ 3?</b> Тетраедар → <b>T<sub>d</sub></b>; октаедар → <b>O<sub>h</sub></b>; икосаедар → <b>I<sub>h</sub></b>.",
          "<b>Најди ја главната оска C<sub>n</sub></b> (најголемо n). Нема оска? Има рамнина → <b>C<sub>s</sub></b>; има само центар → <b>C<sub>i</sub></b>; нема ништо → <b>C<sub>1</sub></b>.",
          "<b>Има n нормални C<sub>2</sub> оски?</b> Да → <b>D група</b>: има σ<sub>h</sub> → <b>D<sub>nh</sub></b>; нема σ<sub>h</sub>, но има n σ<sub>d</sub> → <b>D<sub>nd</sub></b>; нема рамнини → <b>D<sub>n</sub></b>.",
          "<b>Нема?</b> → <b>C група</b>: има σ<sub>h</sub> → <b>C<sub>nh</sub></b>; има n σ<sub>v</sub> → <b>C<sub>nv</sub></b>; нема рамнини, но има S<sub>2n</sub> → <b>S<sub>2n</sub></b>; ништо → <b>C<sub>n</sub></b>."
        ].forEach(t => ol.appendChild(H("li", "", t)));
        return ol;
      })());

    // истражувач
    const exp = G.el("div", "sy-explore");
    const sel = G.el("select", "sy-select");
    sel.setAttribute("aria-label", "Избери молекула");
    GK.forEach(k => {
      const og = G.el("optgroup"); og.label = k.replace("inf", "∞");
      SYM_MOLS.filter(m => m.g === k).forEach(m => { const o = G.el("option", "", m.f + " – " + m.n); o.value = SYM_MOLS.indexOf(m); og.appendChild(o); });
      sel.appendChild(og);
    });
    const holder = G.el("div", "sy-holder"), info = G.el("div", "explain show sy-info");
    function show(i) {
      const m = SYM_MOLS[i], v = viewer(m, { overlay: true });
      holder.replaceChildren(v.el);
      info.innerHTML = "<b>" + m.f + "</b> (" + m.n + ") има точковна група <b>" + gsym(m.g) + "</b>.<br>Елементи: " + sub(SYM_GROUPS[m.g].el) + "<br>" + m.why;
    }
    sel.addEventListener("change", () => show(+sel.value));
    sel.value = SYM_MOLS.findIndex(m => m.f === "H₂O");
    exp.append(H("p", "sy-small", "Избери молекула, заврти ја и прикажи или скриј ги оските и рамнините."), sel, holder, info);
    show(+sel.value);
    sec("6. Истражи молекула", exp);

    const go = G.el("div", "actions");
    const gb = G.el("button", "btn primary", "Сфатив: на вежбање →");
    gb.type = "button"; gb.addEventListener("click", () => setTab("game"));
    go.appendChild(gb); box.appendChild(go);
    return box;
  }

  // ---------- игра ----------
  function game() {
    const box = G.el("div", "sy-game");
    const optsBar = G.el("div", "game-opts");
    const bar = G.el("div", "progress-bar"), prog = G.el("div", "progress");
    prog.appendChild(bar);
    const counter = G.el("span"), scoreLabel = G.el("span");
    const meta = G.el("div", "quiz-meta"); meta.append(counter, scoreLabel);
    const stage = G.el("div", "stage sy-stage");
    box.append(optsBar, prog, meta, stage);

    let mode = "easy", order = [], idx = 0, score = 0;
    function modeChips() {
      optsBar.replaceChildren(G.chips("Ниво:", [["easy", "Лесно (4 понуди)"], ["hard", "Тешко (сите групи)"]], mode, v => { mode = v; start(); }));
    }

    function start() { order = G.shuffle(SYM_MOLS).slice(0, ROUND); idx = 0; score = 0; modeChips(); show(); }

    function choices(m) {
      const same = G.shuffle(GK.filter(k => k !== m.g && SYM_GROUPS[k].fam === SYM_GROUPS[m.g].fam));
      const other = G.shuffle(GK.filter(k => k !== m.g && SYM_GROUPS[k].fam !== SYM_GROUPS[m.g].fam));
      return G.shuffle([m.g, ...same.concat(other).slice(0, 3)]);
    }

    function show() {
      if (idx >= order.length) return end();
      const m = order[idx];
      counter.textContent = "Молекула " + (idx + 1) + " од " + order.length;
      scoreLabel.textContent = "Поени: " + score;
      bar.style.width = (idx / order.length * 100) + "%";

      const slide = G.el("div", "slide");
      slide.appendChild(G.el("h3", "question", "Која е точковната група на молекулата?"));
      slide.appendChild(H("p", "sy-mol", "<b>" + m.f + "</b> <span class=\"sy-small\">(" + m.n + ")</span>"));
      slide.appendChild(H("p", "sy-small", "Облик: " + m.shape));
      const v = viewer(m);
      slide.appendChild(v.el);

      const answers = G.el("div", mode === "easy" ? "options" : "sy-grid");
      const explain = G.el("div", "explain"); explain.hidden = true;
      const actions = G.el("div", "actions");
      const btns = [];

      function reveal(pick) {
        btns.forEach(b => { b.disabled = true; if (b.dataset.k === m.g) b.classList.add("correct"); else if (b.dataset.k === pick) b.classList.add("wrong"); });
        skip.hidden = true;
        const ok = pick === m.g;
        if (ok) score++;
        scoreLabel.textContent = "Поени: " + score;
        explain.hidden = false;
        explain.classList.add("show");
        explain.innerHTML = (ok ? "✅ <b>Точно!</b> " : (pick ? "❌ <b>Не точно.</b> " : "💡 ")) + "Точковната група е <b>" + gsym(m.g) + "</b>.<br>" +
          "<b>Елементи на симетрија:</b> " + sub(SYM_GROUPS[m.g].el) + (SYM_GROUPS[m.g].h ? " (h = " + SYM_GROUPS[m.g].h + ")" : "") + "<br>" + m.why;
        v.setOverlay(true);
        const nb = G.el("button", "btn primary", idx + 1 >= order.length ? "Резултат →" : "Следна молекула →");
        nb.type = "button"; nb.addEventListener("click", () => { idx++; show(); });
        actions.appendChild(nb);
      }

      (mode === "easy" ? choices(m) : GK).forEach(k => {
        const b = G.el("button", mode === "easy" ? "option" : "btn ghost sy-gbtn");
        b.type = "button"; b.dataset.k = k; b.innerHTML = gsym(k);
        b.addEventListener("click", () => reveal(k));
        btns.push(b); answers.appendChild(b);
      });
      const skip = G.el("button", "btn ghost sy-skip", "Не знам: прикажи решение");
      skip.type = "button"; skip.addEventListener("click", () => reveal(null));
      slide.append(answers, skip, explain, actions);
      stage.replaceChildren(slide);
    }

    function end() {
      const pct = Math.round(score / order.length * 100), [emoji, msg] = G.grade(pct);
      G.result({ stage, bar, counter, emoji, title: score + " од " + order.length + " точни (" + pct + "%)", msg, again: start });
      scoreLabel.textContent = "Поени: " + score;
    }
    start();
    return box;
  }

  // ---------- табови ----------
  const tabsBar = G.el("div", "sy-tabs");
  const panels = {};
  const defs = [["theory", "📖 Објаснување"], ["game", "🎯 Погоди"]];
  const tabBtns = {};
  function setTab(k) {
    Object.keys(panels).forEach(x => { panels[x].hidden = x !== k; tabBtns[x].classList.toggle("active", x === k); tabBtns[x].setAttribute("aria-selected", x === k); });
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  defs.forEach(([k, t]) => {
    const b = G.el("button", "sy-tab" + (k === "theory" ? " active" : ""), t);
    b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", k === "theory");
    b.addEventListener("click", () => setTab(k));
    tabBtns[k] = b; tabsBar.appendChild(b);
  });
  panels.theory = theory(); panels.game = game(); panels.game.hidden = true;
  root.append(tabsBar, panels.theory, panels.game);
  window.__sy = { viewer, setTab };
})();
