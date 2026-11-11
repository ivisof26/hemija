/* ТСХ – интерактивна вежба */
(function () {
  "use strict";
  const H = window.HRO, el = H.el, fmt = H.fmt;
  const DYES = [
    { id: "dy", name: "жолта боја", p: 5.6, vis: { visible: "#facc15" } }, { id: "dm", name: "магента", p: 6.4, vis: { visible: "#db2777" } },
    { id: "dc", name: "сина", p: 7.2, vis: { visible: "#06b6d4" } }, { id: "do", name: "портокалова боја", p: 8.0, vis: { visible: "#f97316" } },
    { id: "dv", name: "виолетова боја", p: 8.8, vis: { visible: "#7c3aed" } }];
  const SC = {
    pig: { name: "🍃 Пигменти од спанаќ (обоени)", intro: "Екстракт од лисја од спанаќ содржи повеќе пигменти. Раздели ги на силика гел плоча и определи го секој.",
      modes: ["visible"], comps: [
        { id: "car", name: "β-каротен", p: 0.5, vis: { visible: "#f59e0b" } },
        { id: "cha", name: "хлорофил a", p: 3.0, vis: { visible: "#0f766e" } },
        { id: "chb", name: "хлорофил b", p: 3.8, vis: { visible: "#84a328" } },
        { id: "xan", name: "ксантофили", p: 5.0, vis: { visible: "#eab308" } }], fixedAll: true, mixName: "Екстракт" },
    drug: { name: "💊 Аналгетици (безбојни)", intro: "Таблета содржи 2–3 активни супстанци. Безбојните петна се откриваат под UV светлина или со јод.",
      modes: ["visible", "uv254", "iodine"], comps: [
        { id: "ibu", name: "ибупрофен", p: 2.0, vis: { uv254: "#1e293b", iodine: "#a16207" } },
        { id: "asp", name: "аспирин", p: 4.2, vis: { uv254: "#334155", iodine: "#d6a85c" } },
        { id: "caf", name: "кофеин", p: 5.0, vis: { uv254: "#1e293b", iodine: "#92400e" } },
        { id: "par", name: "парацетамол", p: 6.0, vis: { uv254: "#0f172a", iodine: "#a16207" } }], mixName: "Таблета" },
    caf: { name: "☕ Кофеин во чај, чоколадо или кафе (UV)", intro: "Примерокот е еден од: црн чај, чоколадо или кафе. Секој содржи различна комбинација на пурински алкалоиди (и хлорогенска киселина). Определи од кој е примерокот.",
      modes: ["visible", "uv254"], comps: [
        { id: "caf", name: "кофеин", p: 5.0, vis: { uv254: "#1e293b" } }, { id: "tph", name: "теофилин", p: 6.0, vis: { uv254: "#334155" } },
        { id: "tbr", name: "теобромин", p: 6.8, vis: { uv254: "#1e293b" } }, { id: "chl", name: "хлорогенска киселина", p: 8.0, vis: { uv254: "#0f172a" } }],
      variants: [{ n: "црн чај", ids: ["caf", "tph"] }, { n: "чоколадо", ids: ["caf", "tbr"] }, { n: "кафе", ids: ["caf", "chl"] }], def: ["eac", "eto", 20], mixName: "Примерок" },
    dye: { name: "🍬 Бои во бонбони (E-бои)", intro: "Бонбона е боена со 2–3 синтетички бои. Бидејќи боите се многу поларни, потребен е поларен елуент (етил ацетат / етанол). Определи кои бои ги содржи.",
      modes: ["visible"], comps: [
        { id: "e133", name: "брилијантно сино (E133)", p: 6.2, vis: { visible: "#1d4ed8" } },
        { id: "e110", name: "жолто зајдисонце (E110)", p: 7.0, vis: { visible: "#f97316" } },
        { id: "e102", name: "тартразин (E102)", p: 7.8, vis: { visible: "#facc15" } },
        { id: "e122", name: "азорубин (E122)", p: 8.6, vis: { visible: "#dc2626" } }], def: ["eac", "eto", 40], mixName: "Бонбона" },
    amino: { name: "🧬 Аминокиселини (нинхидрин)", intro: "Хидролизат содржи 2–3 аминокиселини. Тие се безбојни и многу поларни; се откриваат со нинхидрин (виолетови петна по загревање).",
      modes: ["visible", "ninhydrin"], comps: [
        { id: "leu", name: "леуцин", p: 7.0, vis: { ninhydrin: "#7c3aed" } }, { id: "ala", name: "аланин", p: 7.9, vis: { ninhydrin: "#8b5cf6" } },
        { id: "gly", name: "глицин", p: 8.7, vis: { ninhydrin: "#a855f7" } }, { id: "lys", name: "лизин", p: 9.5, vis: { ninhydrin: "#6d28d9" } }], def: ["eto", "met", 30], mixName: "Хидролизат" },
    bev: { name: "🥤 Адитиви во пијалак (UV)", intro: "Три пијалаци: кола, лимонада и енергетски пијалак. Секој содржи различни адитиви (кофеин, бензоева киселина, сорбинска киселина, аспартам). Определи кој пијалак е примерокот.",
      modes: ["visible", "uv254"], comps: [
        { id: "bz", name: "бензоева киселина", p: 3.4, vis: { uv254: "#1e293b" } }, { id: "so", name: "сорбинска киселина", p: 4.2, vis: { uv254: "#334155" } },
        { id: "cf", name: "кофеин", p: 5.0, vis: { uv254: "#1e293b" } }, { id: "as", name: "аспартам", p: 6.6, vis: { uv254: "#0f172a" } }],
      variants: [{ n: "кола (кофеин + бензоева киселина)", ids: ["cf", "bz"] }, { n: "лимонада (бензоева + сорбинска киселина)", ids: ["bz", "so"] }, { n: "енергетски пијалак (кофеин + сорбинска киселина + аспартам)", ids: ["cf", "so", "as"] }], def: ["hex", "eac", 70], mixName: "Пијалак" },
    pen: { name: "🕵️ Криминалистика: чиј е фломастерот?", intro: "На фалсификуван документ е пишувано со еден од 4 фломастери (A–D). Секое мастило е смеса од бои. Нанеси го мастилото од документот и од сите фломастери и најди го совпаѓањето.",
      modes: ["visible"], comps: DYES, pens: [{ id: "A", ids: ["dy", "dm", "dc"] }, { id: "B", ids: ["dy", "dc", "do"] }, { id: "C", ids: ["dm", "do", "dv"] }, { id: "D", ids: ["dy", "dm", "dv"] }], def: ["eac", "eto", 40], mixName: "Документ" }
  };
  const MODE = { visible: "👁 Дневна светлина", uv254: "🔦 UV 254 nm", iodine: "🟤 Јодни пареи", ninhydrin: "🟣 Нинхидрин (спреј + загревање)" };
  const Y0 = 270, PX = 30, LMAX = 8.5, YT = 15, YB = 315, TDEV = 17000;

  H.mods.tlc = function (root) {
    const S = {};
    const box = el("div"); root.appendChild(box);
    const sel = el("select", "chr-num"); sel.style.width = "auto";
    for (const k in SC) { const o = el("option", "", SC[k].name); o.value = k; sel.appendChild(o); }
    const top = el("div", "in-row"); top.appendChild(el("span", "", "<b>Задача:</b> ")); top.appendChild(sel);
    box.appendChild(top);
    
    // Вовед со цел, што се прави и објаснување за ТСХ и Rf
    const introText = `Целта на оваа вежба е да се запознаете со принципот на раздвојување и идентификација на компонентите од смеса со помош на <b>тенкослојна хроматографија</b> (анг. thin layer chromatography, TLC). Раздвојувањето се заснова на различниот афинитет на компонентите кон стационарната фаза (тенок слој силика гел нанесен на плочка) и мобилната фаза (соодветен растворувач). Ќе ги проследите нанесувањето на примерокот, развивањето на хроматограмот и раздвојувањето на компонентите во одделни петна. Ќе се запознаете и со определувањето на ретенциониот фактор (<i>R</i><sub>f</sub>), кој се користи за карактеризација и споредба на компонентите.`;
    const intro = el("p", "in-hint", introText); box.appendChild(intro);

    const lay = el("div", "chr-big sticky"); box.appendChild(lay);
    const left = el("div"), right = el("div"); lay.appendChild(left); lay.appendChild(right);
    const svg = el("div"); left.appendChild(svg);
    right.className = "chr-right"; H.fold(right);
    sel.onchange = () => start(sel.value);

    function start(k) {
      const sc = SC[k]; S.sc = sc; S.p = null; S.k = k;
      if (sc.variants) { S.variant = H.pick(sc.variants); S.mixIds = S.variant.ids.slice(); }
      else if (sc.pens) { S.pen = H.pick(sc.pens); S.mixIds = S.pen.ids.slice(); }
      else S.mixIds = sc.fixedAll ? sc.comps.map(c => c.id) : H.shuffle(sc.comps.map(c => c.id)).slice(0, H.pick([2, 3]));
      
      intro.innerHTML = `${introText}<br><br><b>Задача:</b> ${sc.intro}`;
      
      S.A = "hex"; S.B = k === "pig" ? "ace" : "eac"; S.pct = 30; if (sc.def) { S.A = sc.def[0]; S.B = sc.def[1]; S.pct = sc.def[2]; }
      S.lanes = {}; S.mode = "visible"; S.F = 0; S.stage = 0; S.touch = 2; S.await = null;
      clearTimeout(S.tm); cancelAnimationFrame(S.raf);
      right.innerHTML = ""; svg.innerHTML = ""; drawPlate(); stepEluent();
    }
    const comp = id => S.sc.comps.find(c => c.id === id);
    function lanesList() {
      const L = [{ id: "M", name: S.sc.mixName, ids: S.mixIds, short: S.sc.mixName }];
      if (S.sc.pens) S.sc.pens.forEach(p => L.push({ id: "p" + p.id, name: "Фломастер " + p.id, ids: p.ids, short: "Фл. " + p.id }));
      else S.sc.comps.forEach(c => L.push({ id: c.id, name: c.name, ids: [c.id], short: c.name.split(" ")[0] }));
      return L;
    }
    const sMix = () => H.SOLV.find(s => s.id === S.A).s * (1 - S.pct / 100) + H.SOLV.find(s => s.id === S.B).s * S.pct / 100;
    const rf = c => 1 / (1 + H.kSil(c.p, sMix()));
    const spotR = d => ({ rx: 4.5 + 1.7 * S.touch + d * 0.5, ry: 2.2 + 0.9 * S.touch + d * 0.45 });

    function drawPlate() {
      svg.innerHTML = "";
      const sv = H.svg("svg", { viewBox: "0 0 250 345", class: "chr-svg" }, svg); S.sv = sv;
      sv.innerHTML = `<rect id="tl-bg" x="30" y="${YT}" width="210" height="300" rx="3" fill="#f1f5f9" stroke="#94a3b8"/>
      <g id="tl-jar" opacity="0"><rect x="22" y="150" width="226" height="170" rx="6" fill="none" stroke="#64748b" stroke-width="2"/><rect id="tl-solv" x="24" y="290" width="222" height="28" fill="#bae6fd" opacity=".55"/></g>
      <rect id="tl-wet" x="31" y="${Y0}" width="208" height="0" fill="#7dd3fc" opacity=".3"/>
      <line id="tl-start" x1="30" x2="240" y1="${Y0}" y2="${Y0}" stroke="#475569" stroke-width="1.2" opacity="0"/>
      <line id="tl-front" x1="30" x2="240" y1="0" y2="0" stroke="#475569" stroke-width="1.2" stroke-dasharray="4 3" opacity="0"/>
      <g id="tl-ruler" opacity="0"></g><g id="tl-spots"></g><g id="tl-lab"></g><g id="tl-cur"></g>
      <text id="tl-clock" x="235" y="30" font-size="11" text-anchor="end" fill="#475569"></text>`;
      const rl = sv.querySelector("#tl-ruler");
      for (let i = 0; i <= 17; i++) { const y = Y0 - i * PX / 2; if (y < YT) break; H.svg("line", { x1: 30, x2: i % 2 ? 36 : 42, y1: y, y2: y, stroke: "#334155" }, rl);
        if (i % 2 == 0) { const tx = H.svg("text", { x: 46, y: y + 3, "font-size": 8, fill: "#334155" }, rl); tx.textContent = i / 2; } }
      sv.addEventListener("click", ev => {
        const r = sv.getBoundingClientRect(), y = (ev.clientY - r.top) * 345 / r.height, d = (Y0 - y) / PX;
        if (S.await === "front") { markFront(d, y); return; }
        if (S.stage < 4) return; const g = sv.querySelector("#tl-cur"); g.innerHTML = "";
        H.svg("line", { x1: 30, x2: 240, y1: y, y2: y, stroke: "#dc2626", "stroke-dasharray": "3 3" }, g);
        const t = H.svg("text", { x: 150, y: y - 3, "font-size": 10, fill: "#dc2626", "font-weight": 700 }, g); t.textContent = fmt(d, 2) + " cm";
      });
      const L = lanesList(); S.lx = {}; L.forEach((l, i) => { S.lx[l.id] = 30 + 210 / L.length * (i + .5); });
    }
    function laneLabels() {
      const g = S.sv.querySelector("#tl-lab"); g.innerHTML = "";
      lanesList().forEach(l => { if (!S.lanes[l.id]) return; const t = H.svg("text", { x: S.lx[l.id], y: 332, "font-size": 8, "text-anchor": "middle", fill: "#334155" }, g); t.textContent = l.short; });
    }
    function spotsDraw() {
      const g = S.sv.querySelector("#tl-spots"); g.innerHTML = "";
      lanesList().forEach(l => { if (!S.lanes[l.id]) return;
        if (S.stage < 3) { H.svg("circle", { cx: S.lx[l.id], cy: Y0, r: 1.5 + S.touch * 0.9, fill: "#94a3b8", opacity: .75 }, g); return; }
        l.ids.forEach(id => { const c = comp(id); const col = c.vis[S.mode]; if (!col) return;
          const d = rf(c) * S.F, y = Y0 - d * PX, z = spotR(d), weak = S.touch === 1 && (S.mode === "iodine" || S.mode === "ninhydrin");
          H.svg("ellipse", { cx: S.lx[l.id], cy: y, rx: z.rx, ry: z.ry, fill: col, opacity: weak ? 0.3 : 0.85 }, g); });
      });
      S.sv.querySelector("#tl-bg").setAttribute("fill", S.mode === "uv254" && S.stage >= 4 ? "#bef264" : "#f1f5f9");
    }

    function stepEluent() {
      const sec = el("div", "in-step"); right.appendChild(sec);
      sec.innerHTML = "<h4>1. Избери елуент (мобилна фаза)</h4><p class='in-hint'>Стационарна фаза: силика гел (поларен). Поларните супстанци се задржуваат посилно на плочата. Поларниот елуент ги носи подалеку; неполарниот помалку. Бараме <i>R</i><sub>f</sub> помеѓу ≈0,05 и 0,95 и јасно раздвоени петна.</p>";
      const mk = v => { const s = el("select", "chr-num"); s.style.width = "auto"; H.SOLV.forEach(o => { const op = el("option", "", `${o.name} (ε° ${o.s})`); op.value = o.id; if (o.id === v) op.selected = true; s.appendChild(op); }); return s; };
      const a = mk(S.A), b = mk(S.B);
      const r1 = el("div", "chr-ctl"); r1.append(el("span", "", "Растворувач A"), a, el("span"));
      const r2 = el("div", "chr-ctl"); r2.append(el("span", "", "Растворувач B"), b, el("span"));
      const r3 = el("div", "chr-ctl"); const rg = el("input"); rg.type = "range"; rg.min = 0; rg.max = 100; rg.step = 5; rg.value = S.pct; const out = el("output");
      r3.append(el("span", "", "% од B"), rg, out);
      const info = el("p", "in-hint");
      const upd = () => { S.A = a.value; S.B = b.value; S.pct = +rg.value; out.textContent = S.pct + " %"; info.innerHTML = `Јачина на смесата (ε°): <b>${fmt(sMix(), 1)}</b>`; };
      [a, b, rg].forEach(x => x.oninput = upd); upd();
      const go = el("button", "btn ghost", "✔ Подготви ја комората"); go.type = "button";
      sec.append(r1, r2, r3, info, go);
      go.onclick = () => { go.disabled = true; [a, b, rg].forEach(x => x.disabled = true); stepSpot(); };
    }
    function stepSpot() {
      S.stage = 1; const sec = el("div", "in-step"); right.appendChild(sec);
      sec.innerHTML = "<h4>2. Нанесување на примероците</h4><p class='in-hint'>Најпрво означи ја стартната линија, па со капилара нанеси ја смесата и (по избор) стандарди за споредба.</p>";
      const q = el("div", "in-qa"); q.innerHTML = "<p><b>Со што се означува стартната линија?</b></p>";
      const row = el("div", "chr-opts"); let ok = false; const msg = el("div");
      [["Со пенкало", false], ["Со молив", true], ["Со маркер", false]].forEach(([t, g]) => { const b = el("button", "chr-opt", t); b.type = "button";
        b.onclick = () => { msg.innerHTML = g ? "<p class='in-fb-ok'>✔ Моливот (графитот) не се раствора во елуентот; мастилото би се разнело.</p>" : "<p class='in-fb-bad'>✘ Мастилото се раствора во елуентот и ќе се движи со фронтот. Пробај пак.</p>";
          if (g && !ok) { ok = true; S.sv.querySelector("#tl-start").setAttribute("opacity", 1); showLanes(); } }; row.appendChild(b); });
      q.append(row, msg); sec.appendChild(q);
      const lanesBox = el("div"); sec.appendChild(lanesBox);
      function showLanes() {
        lanesBox.innerHTML = "<p><b>Избери ленти за нанесување:</b></p>"; const r = el("div", "chr-opts");
        lanesList().forEach(l => { const b = el("button", "chr-opt" + (l.id === "M" ? " on" : ""), l.id === "M" ? l.name : "Стандард: " + l.name); b.type = "button";
          S.lanes[l.id] = l.id === "M"; b.onclick = () => { if (l.id === "M") return; S.lanes[l.id] = !S.lanes[l.id]; b.classList.toggle("on", S.lanes[l.id]); }; r.appendChild(b); });
        const tr = el("div", "chr-ctl"), rg = el("input"), o = el("output"); rg.type = "range"; rg.min = 1; rg.max = 5; rg.step = 1; rg.value = S.touch;
        const hint = el("p", "chr-sub"); const up = () => { S.touch = +rg.value; o.textContent = S.touch + "×"; hint.textContent = S.touch === 1 ? "Малку материјал: петната можат слабо да се гледаат." : S.touch >= 4 ? "Многу материјал: петната ќе бидат големи и ќе се преклопуваат." : "Добра количина."; spotsDraw(); };
        rg.oninput = up; tr.append(el("span", "", "Допири со капилара"), rg, o);
        const go = el("button", "btn ghost", "💧 Нанеси"); go.type = "button"; lanesBox.append(r, tr, hint, go); up();
        go.onclick = () => { go.disabled = rg.disabled = true; r.querySelectorAll("button").forEach(b => b.disabled = true); spotsDraw(); laneLabels(); stepChamber(); };
        spotsDraw(); laneLabels();
      }
    }
    function stepChamber() {
      S.stage = 2; spotsDraw(); const sec = el("div", "in-step"); right.appendChild(sec);
      sec.innerHTML = "<h4>3. Комора за развивање</h4><p class='in-hint'>Налеј елуент во комората и затвори ја со капак (заситување на парите). Колку високо да биде нивото?</p>";
      const opts = [["≈ 0,5 cm (под стартната линија)", 300], ["≈ 1,0 cm (под стартната линија)", 285], ["≈ 2,0 cm (над стартната линија)", 255]];
      const row = el("div", "chr-opts"); let lvl = null; const go = el("button", "btn ghost", "▶ Стави ја плочата и затвори"); go.type = "button"; go.disabled = true;
      opts.forEach((o, i) => { const b = el("button", "chr-opt", o[0]); b.type = "button"; b.onclick = () => { lvl = i; row.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); go.disabled = false;
        S.sv.querySelector("#tl-jar").setAttribute("opacity", 1); const s = S.sv.querySelector("#tl-solv"); s.setAttribute("y", o[1]); s.setAttribute("height", 318 - o[1]); }; row.appendChild(b); });
      const msg = el("div"); sec.append(row, go, msg);
      go.onclick = () => { go.disabled = true; row.querySelectorAll("button").forEach(b => b.disabled = true);
        if (lvl === 2) { msg.innerHTML = "<p class='in-fb-bad'>✘ Нивото на елуентот е над стартната линија: примероците се измиле во растворот. Подготви нова плоча.</p>";
          const w = S.sv.querySelector("#tl-spots"); w.style.transition = "opacity 2s"; w.style.opacity = 0; newPlate(sec); return; }
        develop(sec); };
    }
    function newPlate(sec) { const nb = el("button", "btn ghost", "🔄 Нова плоча"); nb.type = "button"; nb.onclick = () => start(sel.value); sec.appendChild(nb); }

    /* ---- развивање: корисникот одлучува кога да ја извади плочата ---- */
    function develop(sec) {
      S.stage = 3; const wet = S.sv.querySelector("#tl-wet"), clock = S.sv.querySelector("#tl-clock"); let t = 0, last = null, stopped = false;
      const st = el("p", "in-hint", "Елуентот се качува по плочата со капиларни сили. <b>Извади ја плочата кога ќе процениш дека е време</b>: ако се извади прерано, петната се слабо раздвоени; ако фронтот стигне до врвот, плочата е изгубена."); sec.appendChild(st);
      const stop = el("button", "btn primary", "⏹ Извади ја плочата"); stop.type = "button"; sec.appendChild(stop);
      const draw = () => { const x = Math.min(1, t / TDEV); S.F = LMAX * Math.sqrt(x); const h = S.F * PX; wet.setAttribute("y", Y0 - h); wet.setAttribute("height", h + 15); spotsDraw(); clock.textContent = "t = " + Math.round(25 * x) + " min"; };
      const fin = () => {
        if (stopped) return; stopped = true; cancelAnimationFrame(S.raf); stop.disabled = true; if (adv) adv.disabled = true;
        if (S.F >= LMAX - 0.03) { st.innerHTML = "<span class='in-fb-bad'>✘ Фронтот стигна до врвот на плочата! Не може да се одреди каде бил фронтот, па <i>R</i><sub>f</sub> не може да се пресмета. Подготви нова плоча и извади ја порано.</span>"; newPlate(sec); return; }
        S.sv.querySelector("#tl-jar").setAttribute("opacity", 0); st.textContent = "Плочата е извадена. Брзо, пред да испари елуентот:";
        S.await = "front"; const m = el("p", "in-fb-bad", "✏️ Означи го фронтот на елуентот со молив: кликни на плочата на границата на навлажнетиот дел."); m.style.background = "var(--accent)"; m.style.color = "inherit"; m.style.borderColor = "var(--primary)"; m.id = "tl-fmsg"; sec.appendChild(m);
        if (!H.reduced) { wet.style.transition = "opacity 40s linear"; wet.setAttribute("opacity", 0.02); S.tm = setTimeout(() => { if (S.await === "front") { S.await = null; m.className = "in-fb-bad"; m.textContent = "✘ Елуентот испари пред да го означиш фронтот. <i>R</i><sub>f</sub> не може да се определи. Подготви нова плоча и означи го фронтот веднаш."; newPlate(sec); } }, 40000); }
      };
      stop.onclick = fin; let adv = null;
      if (H.reduced) { adv = el("button", "btn ghost", "⏩ Чекај 2 min"); adv.type = "button"; sec.appendChild(adv); adv.onclick = () => { t += TDEV * 2 / 25; draw(); if (t >= TDEV) fin(); }; draw(); }
      else { (function f(ts) { if (stopped) return; if (last == null) last = ts; t += ts - last; last = ts; draw(); if (t >= TDEV) { fin(); return; } S.raf = requestAnimationFrame(f); })(performance.now()); }
    }
    function markFront(d, y) {
      const ok = Math.abs(d - S.F) <= 0.3; const m = right.querySelector("#tl-fmsg");
      if (!ok) { m.textContent = "✘ Тоа не е границата на навлажнетиот дел. Пробај пак (фронтот е на границата каде што завршува навлажнетата зона)."; return; }
      clearTimeout(S.tm); S.await = null; const w = S.sv.querySelector("#tl-wet"); w.style.transition = "none"; w.setAttribute("opacity", 0);
      const fl = S.sv.querySelector("#tl-front"); fl.setAttribute("y1", Y0 - S.F * PX); fl.setAttribute("y2", Y0 - S.F * PX); fl.setAttribute("opacity", 1);
      m.className = "in-fb-ok"; m.removeAttribute("style"); m.textContent = "✔ Фронтот е означен."; stepVis();
    }
    /* ---- визуелизација ---- */
    function stepVis() {
      S.stage = 4; spotsDraw(); S.sv.querySelector("#tl-ruler").setAttribute("opacity", 1);
      const sec = el("div", "in-step keep"); right.appendChild(sec);
      sec.innerHTML = "<h4>4. Визуелизација</h4><p class='in-hint'>Плочата е сува. Ако петната не се гледаат, пробај друг начин на визуелизација.</p>";
      const row = el("div", "chr-opts"); sec.appendChild(row);
      S.sc.modes.forEach(m => { const b = el("button", "chr-opt" + (m === S.mode ? " on" : ""), MODE[m]); b.type = "button";
        b.onclick = () => { S.mode = m; row.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); spotsDraw(); }; row.appendChild(b); });
      sec.appendChild(el("p", "chr-tlcnote", "Кликни на плочата за да прочиташ растојание од стартната линија (црвена линија)."));
      /* квалитет: сите споти во сите нанесени ленти */
      const bad = [];
      lanesList().forEach(l => { if (!S.lanes[l.id]) return; const o = l.ids.map(comp).map(c => ({ c, r: rf(c) })).sort((a, b) => b.r - a.r);
        if (o.some(x => x.r < 0.05 || x.r > 0.95) && !bad.length) bad.push("Некои петна се премногу блиску до стартот или фронтот (<i>R</i><sub>f</sub> надвор од опсегот 0,05–0,95).");
        for (let i = 1; i < o.length; i++) { const d1 = o[i - 1].r * S.F, d2 = o[i].r * S.F; const need = (spotR(d1).ry + spotR(d2).ry) / PX + 0.1;
          if (d1 - d2 < need && !bad.length) bad.push(S.F < 4 ? "Плочата е извадена прерано: петната не се доволно оддалечени." : (S.touch >= 4 ? "Петната се преголеми (нанесено е премногу материјал) и се преклопуваат." : "Две петна се преклопуваат: елуентот не ги раздвојува доволно.")); } });
      if (bad.length) { const m = el("p", "in-fb-bad", "✘ " + bad[0] + " Подготви нова плоча."); sec.appendChild(m); newPlate(sec); return; }
      stepMeasure();
    }
    function stepMeasure() {
      const sec = el("div", "in-step"); right.appendChild(sec);
      const ids = S.mixIds.map(comp).map(c => ({ c, r: rf(c) })).sort((a, b) => b.r - a.r);
      sec.innerHTML = "<h4>5. Мерење и идентификација</h4><p class='in-hint'>Мерењата прави ги од првата лента (" + S.sc.mixName + ") во режим во кој петната се гледаат (кликни на секое петно за да го измериш растојанието). <i>R</i><sub>f</sub> = растојание до петната / растојание на фронтот (двете од стартната линија). Запиши ги растојанијата во табелата по редослед од највисокото петно (најблиску до фронтот) кон најниското</p>";
      const fr = el("div", "chr-ctl"); const fi = el("input", "chr-num"); fi.placeholder = "cm"; fr.append(el("span", "", "Фронт (cm)"), fi, el("span")); sec.appendChild(fr);
      const tb = el("table", "chr-tbl"); tb.innerHTML = "<tr><th>Петна (од горе)</th><th>Растојание (cm)</th><th><i>R</i><sub>f</sub></th>" + (S.sc.pens ? "" : "<th>Супстанца</th>") + "</tr>"; sec.appendChild(tb);
      const rows = ids.map((o, i) => { const tr = el("tr"); const d = el("input", "chr-num"), r = el("input", "chr-num"); const s = el("select", "chr-num"); s.style.width = "auto";
        s.innerHTML = "<option value=''>— избери —</option>" + S.sc.comps.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
        const t1 = el("td", "", "#" + (i + 1)), t2 = el("td"), t3 = el("td"); t2.appendChild(d); t3.appendChild(r); tr.append(t1, t2, t3); if (!S.sc.pens) { const t4 = el("td"); t4.appendChild(s); tr.appendChild(t4); } tb.appendChild(tr); return { o, d, r, s }; });
      let penSel = null; if (S.sc.pens) { penSel = el("select", "chr-num"); penSel.style.width = "auto"; penSel.innerHTML = "<option value=''>— избери —</option>" + S.sc.pens.map(p => `<option value="${p.id}">Фломастер ${p.id}</option>`).join(""); const pr = el("div", "in-row"); pr.append(el("b", "", "Документот е пишуван со: "), penSel); sec.appendChild(pr); }
      const go = el("button", "btn ghost", "✔ Провери"); go.type = "button"; const fb = el("div"); sec.append(go, fb);
      go.onclick = () => {
        fb.innerHTML = ""; const F = H.num(fi.value); let okn = 0, msgs = [];
        if (!isFinite(F) || Math.abs(F - S.F) > 0.15) msgs.push("Растојанието на фронтот не е точно измерено (провери со клик на плочата).");
        rows.forEach((r, i) => { const rr = H.num(r.r.value), tr = rf(r.o.c); let g = true;
          if (!isFinite(rr) || Math.abs(rr - tr) > 0.04) { g = false; msgs.push(`Петна #${i + 1}: <i>R</i><sub>f</sub> не е точно (провери: <i>R</i><sub>f</sub> = растојание петна / растојание фронт).`); }
          if (!S.sc.pens && r.s.value !== r.o.c.id) { g = false; msgs.push(`Петна #${i + 1}: идентификацијата не е точна: спореди со стандардите на иста висина (и боја).`); }
          if (g) okn++; });
        if (S.sc.pens && penSel.value !== S.pen.id) msgs.push("Фломастерот не е точен: упореди ги боите и <i>R</i><sub>f</sub> на секое петно на документот со лентите на фломастерите.");
        const all = okn === rows.length && !msgs.length;
        let extra = ""; if (all && S.variant) extra = ` Примерокот е <b>${S.variant.n}</b>.`; if (all && S.sc.pens) extra = ` Документот е пишуван со <b>фломастер ${S.pen.id}</b>: сите бои се совпаѓаат по боја и <i>R</i><sub>f</sub>.`;
        fb.innerHTML = all ? `<p class="in-fb-ok">✔ Точно! <i>R</i><sub>f</sub> е карактеристичен за супстанцата при дадени услови.${extra}</p><p class="in-hint"><i>R</i><sub>f</sub> зависи од елуентот и плочата, па секогаш се споредува со стандарди на иста плоча.</p>` : `<p class="in-fb-bad">✘ ${msgs.slice(0, 4).join("<br>✘ ")}</p>`; };
    }
    start("pig");
  };
})();
