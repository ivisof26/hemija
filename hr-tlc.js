/* ТСХ – интерактивна вежба */
(function () {
  "use strict";
  const H = window.HRO, el = H.el, fmt = H.fmt;
  const SC = {
    pig: { name: "🍃 Пигменти од спанаќ (обоени)", intro: "Екстракт од лисја од спанаќ содржи повеќе пигменти. Раздели ги на силикагел плоча и определи го секој.",
      modes: ["visible"], comps: [
        { id: "car", name: "β-каротен", p: 0.5, vis: { visible: "#f59e0b" } },
        { id: "cha", name: "хлорофил a", p: 3.0, vis: { visible: "#0f766e" } },
        { id: "chb", name: "хлорофил b", p: 3.8, vis: { visible: "#84a328" } },
        { id: "xan", name: "ксантофили", p: 5.0, vis: { visible: "#eab308" } }], fixedAll: true },
    drug: { name: "💊 Аналгетици (безбојни)", intro: "Таблета содржи 2–3 активни супстанци. Безбојните дамки се откриваат под UV светлина или со јод.",
      modes: ["visible", "uv254", "iodine"], comps: [
        { id: "ibu", name: "ибупрофен", p: 2.0, vis: { uv254: "#1e293b", iodine: "#a16207" } },
        { id: "asp", name: "аспирин", p: 4.2, vis: { uv254: "#334155", iodine: "#d6a85c" } },
        { id: "caf", name: "кофеин", p: 5.0, vis: { uv254: "#1e293b", iodine: "#92400e" } },
        { id: "par", name: "парацетамол", p: 6.0, vis: { uv254: "#0f172a", iodine: "#a16207" } }] }
  };
  const MODE = { visible: "👁 Дневна светлина", uv254: "🔦 UV 254 nm", iodine: "🟤 Јодни пареи" };
  const Y0 = 270, PX = 30, L = 7.0, YT = 15, YB = 315;

  H.mods.tlc = function (root) {
    const S = {};
    const box = el("div"); root.appendChild(box);
    const sel = el("select", "chr-num"); sel.style.width = "auto";
    for (const k in SC) { const o = el("option", "", SC[k].name); o.value = k; sel.appendChild(o); }
    const top = el("div", "in-row"); top.appendChild(el("span", "", "<b>Задача:</b> ")); top.appendChild(sel);
    box.appendChild(top);
    const intro = el("p", "in-hint"); box.appendChild(intro);
    const lay = el("div", "chr-big"); box.appendChild(lay);
    const left = el("div"), right = el("div"); lay.appendChild(left); lay.appendChild(right);
    const svg = el("div"); left.appendChild(svg);
    right.className = "chr-right";
    sel.onchange = () => start(sel.value);

    function start(k) {
      const sc = SC[k]; S.sc = sc; S.attempt = (S.attempt || 0); S.p = null;
      S.mixIds = sc.fixedAll ? sc.comps.map(c => c.id) : H.shuffle(sc.comps.map(c => c.id)).slice(0, H.pick([2, 3]));
      intro.textContent = sc.intro; S.A = "hex"; S.B = k === "pig" ? "ace" : "eac"; S.pct = 30;
      S.lanes = {}; S.solv = null; S.mode = "visible"; S.prog = 0; S.stage = 0; S.reads = [];
      right.innerHTML = ""; svg.innerHTML = ""; S.attempt++;
      drawPlate(); stepEluent();
    }
    const lanesList = () => [{ id: "M", name: "Смеса" }].concat(S.sc.comps.map(c => ({ id: c.id, name: c.name })));
    const comp = id => S.sc.comps.find(c => c.id === id);
    const sMix = () => H.SOLV.find(s => s.id === S.A).s * (1 - S.pct / 100) + H.SOLV.find(s => s.id === S.B).s * S.pct / 100;
    const rf = c => 1 / (1 + H.kSil(c.p, sMix()));

    /* ---- плоча ---- */
    function drawPlate() {
      svg.innerHTML = "";
      const sv = H.svg("svg", { viewBox: "0 0 250 345", class: "chr-svg" }, svg); S.sv = sv;
      sv.innerHTML = `<rect x="30" y="${YT}" width="210" height="300" rx="3" fill="#f1f5f9" stroke="#94a3b8"/>
      <g id="tl-jar" opacity="0"><rect x="22" y="150" width="226" height="170" rx="6" fill="none" stroke="#64748b" stroke-width="2"/><rect id="tl-solv" x="24" y="290" width="222" height="28" fill="#bae6fd" opacity=".55"/></g>
      <rect id="tl-wet" x="31" y="${Y0}" width="208" height="0" fill="#7dd3fc" opacity=".28"/>
      <line id="tl-start" x1="30" x2="240" y1="${Y0}" y2="${Y0}" stroke="#475569" stroke-width="1.2" opacity="0"/>
      <line id="tl-front" x1="30" x2="240" y1="${YT + 45}" y2="${YT + 45}" stroke="#475569" stroke-width="1.2" stroke-dasharray="4 3" opacity="0"/>
      <g id="tl-ruler" opacity="0"></g><g id="tl-spots"></g><g id="tl-lab"></g><g id="tl-cur"></g>`;
      const rl = sv.querySelector("#tl-ruler");
      for (let i = 0; i <= 14; i++) { const y = Y0 - i * PX / 2; if (y < YT) break; const t = H.svg("line", { x1: 30, x2: i % 2 ? 36 : 42, y1: y, y2: y, stroke: "#334155" }, rl);
        if (i % 2 == 0) { const tx = H.svg("text", { x: 46, y: y + 3, "font-size": 8, fill: "#334155" }, rl); tx.textContent = i / 2; } }
      sv.addEventListener("click", ev => {
        if (S.stage < 4) return; const r = sv.getBoundingClientRect(); const y = (ev.clientY - r.top) * 345 / r.height;
        const d = (Y0 - y) / PX; const g = sv.querySelector("#tl-cur"); g.innerHTML = "";
        H.svg("line", { x1: 30, x2: 240, y1: y, y2: y, stroke: "#dc2626", "stroke-dasharray": "3 3" }, g);
        const t = H.svg("text", { x: 150, y: y - 3, "font-size": 10, fill: "#dc2626", "font-weight": 700 }, g); t.textContent = fmt(d, 2) + " cm";
      });
      const ln = [{ id: "M" }].concat(S.sc.comps).length; S.lx = {};
      lanesList().forEach((l, i) => { S.lx[l.id] = 30 + 210 / (ln + 0) * (i + .5); });
    }
    function laneLabels() {
      const g = S.sv.querySelector("#tl-lab"); g.innerHTML = "";
      lanesList().forEach((l, i) => { if (!S.lanes[l.id]) return;
        const t = H.svg("text", { x: S.lx[l.id], y: 332, "font-size": 8.5, "text-anchor": "middle", fill: "#334155" }, g); t.textContent = l.id === "M" ? "Смеса" : l.name.split(" ")[0]; });
    }
    function spotsDraw() {
      const g = S.sv.querySelector("#tl-spots"); g.innerHTML = "";
      lanesList().forEach(l => { if (!S.lanes[l.id]) return;
        const ids = l.id === "M" ? S.mixIds : [l.id];
        if (S.stage < 3) { H.svg("circle", { cx: S.lx[l.id], cy: Y0, r: 3, fill: "#94a3b8", opacity: S.stage >= 2 ? 0.5 : 0.8 }, g); return; }
        ids.forEach(id => { const c = comp(id); const col = c.vis[S.mode]; if (!col) return;
          const d = rf(c) * L * S.prog; const y = Y0 - d * PX;
          const ry = 3.5 + d * 0.9, rx = 7 + d * 0.6; H.svg("ellipse", { cx: S.lx[l.id], cy: y, rx, ry, fill: col, opacity: S.mode === "uv254" ? 0.8 : 0.85 }, g); });
      });
      if (S.stage >= 3 && S.mode === "uv254") S.sv.querySelector("rect").setAttribute("fill", "#d9f99d"); else if (S.sc.modes.length > 1 || true) S.sv.querySelector("rect").setAttribute("fill", S.mode === "uv254" && S.stage >= 4 ? "#bef264" : "#f1f5f9");
    }

    /* ---- чекор 1: елуент ---- */
    function stepEluent() {
      const sec = el("div", "in-step"); right.appendChild(sec);
      sec.innerHTML = "<h4>1. Избери елуент (подвижна фаза)</h4><p class='in-hint'>Неподвижна фаза: силикагел (поларен). Поларните супстанци се задржуваат посилно. Поларниот елуент ги носи подалеку; неполарниот помалку. Бараме Rf помеѓу ≈0,15 и 0,85 и јасно раздвоени дамки.</p>";
      const mk = (v) => { const s = el("select", "chr-num"); s.style.width = "auto"; H.SOLV.forEach(o => { const op = el("option", "", `${o.name} (ε° ${o.s})`); op.value = o.id; if (o.id === v) op.selected = true; s.appendChild(op); }); return s; };
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
    /* ---- чекор 2: нанесување ---- */
    function stepSpot() {
      S.stage = 1; const sec = el("div", "in-step"); right.appendChild(sec);
      sec.innerHTML = "<h4>2. Нанесување на примероците</h4><p class='in-hint'>Најпрво означи ја стартната линија, па со капилара нанеси ја смесата и (по избор) стандарди за споредба.</p>";
      const q = el("div", "in-qa"); q.innerHTML = "<p><b>Со што се означува стартната линија?</b></p>";
      const row = el("div", "chr-opts"); let ok = false;
      const msg = el("div");
      [["Со пенкало", false], ["Со молив", true], ["Со маркер", false]].forEach(([t, g]) => { const b = el("button", "chr-opt", t); b.type = "button";
        b.onclick = () => { msg.innerHTML = g ? "<p class='in-fb-ok'>✔ Моливот (графитот) не се раствора во елуентот; мастилото би се разнело.</p>" : "<p class='in-fb-bad'>✘ Мастилото се раствора во елуентот и ќе се движи со фронтот. Пробај пак.</p>";
          if (g && !ok) { ok = true; S.sv.querySelector("#tl-start").setAttribute("opacity", 1); showLanes(); } }; row.appendChild(b); });
      q.append(row, msg); sec.appendChild(q);
      const lanesBox = el("div"); sec.appendChild(lanesBox);
      function showLanes() {
        lanesBox.innerHTML = "<p><b>Избери ленти за нанесување:</b></p>"; const r = el("div", "chr-opts");
        lanesList().forEach(l => { const b = el("button", "chr-opt" + (l.id === "M" ? " on" : ""), l.id === "M" ? "Смеса" : "Стандард: " + l.name); b.type = "button";
          S.lanes[l.id] = l.id === "M"; b.onclick = () => { if (l.id === "M") return; S.lanes[l.id] = !S.lanes[l.id]; b.classList.toggle("on", S.lanes[l.id]); }; r.appendChild(b); });
        const go = el("button", "btn ghost", "💧 Нанеси"); go.type = "button"; lanesBox.append(r, go);
        go.onclick = () => { go.disabled = true; r.querySelectorAll("button").forEach(b => b.disabled = true); spotsDraw(); laneLabels(); stepChamber(); };
        spotsDraw(); laneLabels();
      }
    }
    /* ---- чекор 3: комора ---- */
    function stepChamber() {
      S.stage = 2; spotsDraw(); const sec = el("div", "in-step"); right.appendChild(sec);
      sec.innerHTML = "<h4>3. Комора за развивање</h4><p class='in-hint'>Налеј елуент во комората и затвори ја со капак (заситување на парите). Колку високо да биде нивото?</p>";
      const opts = [["≈ 0,5 cm (под стартната линија)", 0.5, 300], ["≈ 1,0 cm (под стартната линија)", 1.0, 285], ["≈ 2,0 cm (над стартната линија)", 2.0, 255]];
      const row = el("div", "chr-opts"); let lvl = null; const go = el("button", "btn ghost", "▶ Стави ја плочата и затвори"); go.type = "button"; go.disabled = true;
      opts.forEach((o, i) => { const b = el("button", "chr-opt", o[0]); b.type = "button"; b.onclick = () => { lvl = i; row.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); go.disabled = false;
        const j = S.sv.querySelector("#tl-jar"); j.setAttribute("opacity", 1); const s = S.sv.querySelector("#tl-solv"); s.setAttribute("y", o[2]); s.setAttribute("height", 318 - o[2]); }; row.appendChild(b); });
      const msg = el("div"); sec.append(row, go, msg);
      go.onclick = () => { go.disabled = true; row.querySelectorAll("button").forEach(b => b.disabled = true);
        if (lvl === 2) { msg.innerHTML = "<p class='in-fb-bad'>✘ Нивото на елуентот е над стартната линија – примероците се измиле во растворот и плочата е непотребна. Подготви нова плоча.</p>";
          const w = S.sv.querySelector("#tl-spots"); w.style.transition = "opacity 2s"; w.style.opacity = 0; const nb = el("button", "btn ghost", "🔄 Нова плоча"); nb.type = "button"; nb.onclick = () => start(sel.value); sec.appendChild(nb); return; }
        develop(sec, lvl); };
    }
    /* ---- развивање ---- */
    function develop(sec, lvl) {
      S.stage = 3; const wet = S.sv.querySelector("#tl-wet"); const T = H.reduced ? 1 : 6500; let t0 = null;
      const st = el("p", "in-hint", "Елуентот се качува по плочата со капиларни сили…"); sec.appendChild(st);
      function frame(ts) { if (t0 == null) t0 = ts; const x = Math.min(1, (ts - t0) / T); S.prog = Math.sqrt(x);
        const h = L * PX * S.prog; wet.setAttribute("y", Y0 - h); wet.setAttribute("height", h + (lvl ? 15 : 8)); spotsDraw();
        if (x < 1) requestAnimationFrame(frame); else done(); }
      function done() { st.textContent = "Фронтот на елуентот стигна близу до врвот."; const b = el("button", "btn ghost", "📤 Извади ја плочата и означи го фронтот"); b.type = "button"; sec.appendChild(b);
        b.onclick = () => { b.disabled = true; S.sv.querySelector("#tl-front").setAttribute("opacity", 1); S.sv.querySelector("#tl-wet").setAttribute("opacity", 0); S.sv.querySelector("#tl-jar").setAttribute("opacity", 0); stepVis(); }; }
      if (H.reduced) { frame(1e9); S.prog = 1; wet.setAttribute("y", Y0 - L * PX); wet.setAttribute("height", L * PX); spotsDraw(); done(); } else requestAnimationFrame(frame);
    }
    /* ---- визуелизација ---- */
    function stepVis() {
      S.stage = 4; spotsDraw(); S.sv.querySelector("#tl-ruler").setAttribute("opacity", 1);
      const sec = el("div", "in-step"); right.appendChild(sec);
      sec.innerHTML = "<h4>4. Визуелизација</h4><p class='in-hint'>Плочата е суво. Ако дамките не се гледаат, пробај друг начин на откривање.</p>";
      const row = el("div", "chr-opts"); sec.appendChild(row);
      S.sc.modes.concat(S.sc.modes.length < 2 ? [] : []).forEach(m => { const b = el("button", "chr-opt" + (m === S.mode ? " on" : ""), MODE[m]); b.type = "button";
        b.onclick = () => { S.mode = m; row.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); spotsDraw(); S.sv.querySelector("#tl-ruler").setAttribute("opacity", 1); }; row.appendChild(b); });
      const hdr = el("p", "chr-tlcnote", "Кликни на плочата за да прочиташ растојание од стартната линија (црвена линија).");
      sec.appendChild(hdr);
      /* квалитет */
      const ids = S.mixIds.map(comp).map(c => ({ c, r: rf(c) })).sort((a, b) => b.r - a.r);
      let bad = ids.some(o => o.r < 0.1 || o.r > 0.9) ? "Некои дамки се залепени за стартот или фронтот (Rf надвор од 0,1–0,9)." : "";
      for (let i = 1; i < ids.length; i++) if (ids[i - 1].r - ids[i].r < 0.08) bad = bad || "Две дамки се преклопуваат (ΔRf < 0,08).";
      if (bad) { const m = el("p", "in-fb-bad", "✘ " + bad + " Со овој елуент разделувањето не е доволно. Подготви нова плоча со друг елуент."); const nb = el("button", "btn ghost", "🔄 Нова плоча"); nb.type = "button"; nb.onclick = () => { S.attempt; start(sel.value); }; sec.append(m, nb); return; }
      const vis = ids.filter(o => o.c.vis[S.mode]);
      stepMeasure(ids, sec);
    }
    function stepMeasure(ids, secPrev) {
      const sec = el("div", "in-step"); right.appendChild(sec);
      sec.innerHTML = "<h4>5. Мерење и идентификација</h4><p class='in-hint'>Мерењата прави ги на лентата „Смеса“ во режим во кој дамките се гледаат. Rf = растојание на дамката / растојание на фронтот (двете од стартната линија).</p>";
      const fr = el("div", "chr-ctl"); const fi = el("input", "chr-num"); fi.placeholder = "cm"; fr.append(el("span", "", "Фронт (cm)"), fi, el("span"));
      sec.appendChild(fr);
      const tb = el("table", "chr-tbl"); tb.innerHTML = "<tr><th>Дамка (од горе)</th><th>Растојание (cm)</th><th>Rf</th><th>Супстанца</th></tr>"; sec.appendChild(tb);
      const rows = ids.map((o, i) => { const tr = el("tr"); const d = el("input", "chr-num"); const r = el("input", "chr-num"); const s = el("select", "chr-num"); s.style.width = "auto";
        s.innerHTML = "<option value=''>— избери —</option>" + S.sc.comps.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
        [el("td", "", "#" + (i + 1)), el("td"), el("td"), el("td")].forEach((td, j) => { tr.appendChild(td); if (j === 1) td.appendChild(d); if (j === 2) td.appendChild(r); if (j === 3) td.appendChild(s); }); tb.appendChild(tr); return { o, d, r, s }; });
      const go = el("button", "btn ghost", "✔ Провери"); go.type = "button"; const fb = el("div"); sec.append(go, fb);
      go.onclick = () => {
        fb.innerHTML = ""; const F = H.num(fi.value); let okn = 0, msgs = [];
        if (!isFinite(F) || Math.abs(F - L) > 0.15) msgs.push("Растојанието на фронтот не е точно измерено (провери со клик на плочата).");
        rows.forEach((r, i) => { const rr = H.num(r.r.value), dd = H.num(r.d.value), tr = rf(r.o.c); let g = true;
          if (!isFinite(rr) || Math.abs(rr - tr) > 0.04) { g = false; msgs.push(`Дамка #${i + 1}: Rf не е точно (≈ ${fmt(dd / L, 2)} ако d = ${fmt(dd, 1)}).`); }
          if (r.s.value !== r.o.c.id) { g = false; msgs.push(`Дамка #${i + 1}: идентификацијата не е точна – спореди со стандардите на иста висина.`); }
          if (g) okn++; });
        const all = okn === rows.length && !msgs.length;
        fb.innerHTML = all ? `<p class="in-fb-ok">✔ Точно! Идентификувани се сите дамки. Ова е нормален резултат за ${S.attempt} обид(и).</p>` : `<p class="in-fb-bad">✘ ${msgs.slice(0, 4).join("<br>✘ ")}</p>`;
        if (all) { const q = el("p", "in-hint", "Забелешка: Rf зависи од елуентот и од плочата, па секогаш се споредува со стандарди на иста плоча."); fb.appendChild(q); } };
    }
    start("pig");
  };
})();
