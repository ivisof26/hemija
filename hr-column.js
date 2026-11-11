/* Колонска хроматографија */
(function () {
  "use strict";
  const H = window.HRO, el = H.el, fmt = H.fmt;
  const ELU_N = [["Чист n-хексан", 0], ["Хексан : толуен (1:1)", 1.5], ["Чист толуен", 3.0], ["Толуен : ацетон (9:1)", 3.6], ["Толуен : ацетон (7:3)", 4.5], ["Чист ацетон", 5.9]];
  const ELU_P = [["Чист етил ацетат", 6.1], ["Етил ацетат : етанол (8:2)", 6.8], ["Етил ацетат : етанол (6:4)", 7.5], ["Етил ацетат : етанол (4:6)", 8.1], ["Чист етанол", 9.2], ["Етанол : метанол (1:1)", 9.6]];
  const SCN = [
    { name: "🍃 Пигменти од спанаќ", intro: "Екстракт од спанаќ (β-каротен, хлорофил a, ксантофили) се разделува на колона со <b>силика гел</b> (стационарна фаза).", elu: ELU_N,
      comps: [{ id: "car", name: "β-каротен", p: 0.5, col: [245, 158, 11] }, { id: "cha", name: "хлорофил a", p: 3.0, col: [15, 118, 110] }, { id: "xan", name: "ксантофили", p: 5.0, col: [234, 179, 8] }] },
    { name: "🍅 Каротеноиди од домат", intro: "Екстракт од домат содржи ликопен, β-каротен и лутеин. Првите два се многу слично неполарни, па е потребен внимателен избор на мобилна фаза.", elu: ELU_N,
      comps: [{ id: "lyc", name: "ликопен", p: 0.3, col: [220, 38, 38] }, { id: "bca", name: "β-каротен", p: 1.2, col: [245, 158, 11] }, { id: "lut", name: "лутеин", p: 4.8, col: [234, 179, 8] }] },
    { name: "🍬 Бои од бонбони", intro: "Смеса од три синтетички бои (брилијантно сино E133, тартразин E102, азорубин E122). Тие се многу поларни, па мобилната фаза мора да е поларна.", elu: ELU_P,
      comps: [{ id: "e133", name: "бриљантно сино (E133)", p: 6.2, col: [29, 78, 216] }, { id: "e102", name: "тартразин (E102)", p: 7.8, col: [250, 204, 21] }, { id: "e122", name: "азорубин (E122)", p: 8.6, col: [220, 38, 38] }] }
,
    { name: "🖍️ Бои од фломастер", intro: "Црниот фломастер е смеса од три бои (жолта, цијан и магента). Раздели ги на колона и собери ја секоја боја посебно.", elu: ELU_P,
      comps: [{ id: "my", name: "жолта боја", p: 5.6, col: [250, 204, 21] }, { id: "mc", name: "цијан", p: 7.2, col: [6, 182, 212] }, { id: "mm", name: "магента", p: 8.4, col: [219, 39, 119] }] }
  ];
  let COMPS = SCN[0].comps, ELU = SCN[0].elu;
  const V0 = 20, TUBE = 5, NT = 30, BED = 200;

  H.mods.col = function (host) {
    const top = el("div", "in-row"), ss = el("select", "chr-num"); ss.style.width = "auto"; SCN.forEach((x, i) => { const o = el("option", "", x.name); o.value = i; ss.appendChild(o); });
    top.append(el("span", "", "<b>Задача:</b> "), ss); host.appendChild(top); const holder = el("div"); host.appendChild(holder); let cur = 0;
    const load = i => { cur = i; COMPS = SCN[i].comps; ELU = SCN[i].elu; holder.innerHTML = ""; body(holder, SCN[i]); }; ss.onchange = () => load(+ss.value); H.__colReload = () => load(cur); load(0);
  };
  function body(root, sc) {
    const S = { z: {}, cum: {}, tubes: [], sIdx: 0, vtot: 0 };
    const intro = el("p", "in-hint", sc.intro + " Целта е да собереш чисти фракции од секоја супстанца преку колона со силика гел: подготви ја колоната, нанеси примерок, па елуирај со соодветни растворувачи.");
    root.appendChild(intro);
    const lay = el("div", "chr-big sticky"); root.appendChild(lay);
    const left = el("div"), right = el("div"); lay.append(left, right); H.fold(right);
    const sv = H.svg("svg", { viewBox: "0 0 200 380", class: "chr-svg" }, left);
    sv.innerHTML = `<rect x="70" y="20" width="60" height="${BED}" fill="#fff"/>
    <rect id="cl-bed" x="72" y="70" width="56" height="0" fill="#e5e7eb"/>
    <g id="cl-bands"></g>
    <rect id="cl-liq" x="72" y="30" width="56" height="0" fill="#bae6fd" opacity=".5"/>
    <path d="M68 20 V224 L68 232 H132 V224 V20" fill="none" stroke="#64748b" stroke-width="3"/>
    <path d="M68 224 L92 252 H108 L132 224" fill="none" stroke="#64748b" stroke-width="3"/>
    <rect x="94" y="252" width="12" height="14" fill="#94a3b8"/><rect id="cl-tap" x="86" y="258" width="28" height="4" rx="2" fill="#475569"/>
    <circle id="cl-drop" cx="100" cy="268" r="3" fill="#38bdf8" opacity="0"/>
    <rect x="60" y="290" width="80" height="6" fill="#d6d3d1"/><text id="cl-vol" x="100" y="320" text-anchor="middle" font-size="12" fill="#334155"></text>
    <text id="cl-el" x="100" y="340" text-anchor="middle" font-size="10" fill="#334155"></text>`;
    const bands = sv.querySelector("#cl-bands");
    const bed = sv.querySelector("#cl-bed"), liq = sv.querySelector("#cl-liq");
    const BTOP = 70, BBOT = 224; const BH = BBOT - BTOP;
    const secs = [];
    function section(h, p, keep) { const s = el("div", "in-step" + (keep ? " keep" : "")); s.innerHTML = `<h4>${h}</h4>${p ? `<p class="in-hint">${p}</p>` : ""}`; right.appendChild(s); secs.push(s); return s; }

    /* 1. пакување (поедноставено на 2 опции) */
    const s1 = section("1. Пакување на колоната", "Како ја пакуваш колоната со силика гел?");
    const r1 = el("div", "chr-opts"), m1 = el("div"); s1.append(r1, m1);
    [["1. Суво пакување", 1.5, "Сувиот силика гел се внесува директно во колоната, а потоа постепено се додава почетниот растворувач. Потребно е внимателно набивање за да се спречат воздушни џебови и пукнатини (каналирање)."],
     ["2. Влажно пакување (каша)", 1.0, "Силика гелот претходно се меша со почетниот растворувач во хомогена суспензија (каша) и така се внесува во колоната. Ова е правилниот лабораториски метод кој овозможува рамномерно пакување и чисти, остри ленти."]].forEach(o => {
      const b = el("button", "chr-opt", o[0]); b.type = "button"; b.onclick = () => { S.pack = o[1]; r1.querySelectorAll("button").forEach(x => { x.disabled = true; x.classList.remove("on"); }); b.classList.add("on");
        m1.innerHTML = `<p class="${o[1] === 1 ? "in-fb-ok" : "in-fb-bad"}">${o[1] === 1 ? "✔" : "✘"} ${o[2]}${o[1] === 1 ? "" : " (Потребно е внимателно додавање за да се избегнат пукнатини.)"}</p>`;
        bed.setAttribute("y", BTOP); bed.style.transition = H.reduced ? "none" : "height 1s"; bed.setAttribute("height", BH);
        if (o[1] > 1.2) bed.setAttribute("fill", "#d6d3d1"); S.lvl = 1; liq.setAttribute("y", 30); liq.setAttribute("height", BTOP - 30); stepLoad(); }; r1.appendChild(b); });

    /* 2. нанесување */
    function stepLoad() {
      const s = section("2. Нанесување на примерокот", "Колку екстракт нанесуваш? Премногу = преоптоварена колона (широки ленти); премалку = малку материјал.");
      const row = el("div", "chr-ctl"), rg = el("input"); rg.type = "range"; rg.min = 10; rg.max = 200; rg.step = 10; rg.value = 60; const out = el("output");
      row.append(el("span", "", "Маса на примерок"), rg, out); rg.oninput = () => out.textContent = rg.value + " mg"; rg.oninput();
      const go = el("button", "btn ghost", "💧 Нанеси врз врвот на колоната"); go.type = "button"; s.append(row, go);
      go.onclick = () => { go.disabled = true; rg.disabled = true; S.load = +rg.value; S.sigma = (0.04 * S.pack) * (1 + Math.max(0, S.load - 60) / 80);
        COMPS.forEach(c => { S.z[c.id] = 0.02; S.cum[c.id] = 0; }); drawBands(); stepElute(); };
    }
    function drawBands() {
      bands.innerHTML = "";
      COMPS.forEach(c => { const z = S.z[c.id]; const sg = Math.min(0.5, S.sigma + 0.05 * Math.sqrt(Math.max(0, z)) * S.pack) * (0.4 + S.load / 100);
        const y = BTOP + Math.min(1, z) * BH, h = Math.max(4, 3.2 * sg * BH);
        const r = H.svg("rect", { x: 72, width: 56, y: Math.max(BTOP, y - h / 2), height: Math.min(h, BBOT - Math.max(BTOP, y - h / 2)), fill: `rgb(${c.col})`, opacity: 0.7 }, bands);
        r.style.transition = H.reduced ? "none" : "y .5s, height .5s"; if (z - sg * 2 > 1) r.setAttribute("opacity", 0); });
    }
    /* 3. елуирање */
    let eluLab, volLab, tubesBox;
    function stepElute() {
      const s = section("3. Елуирање", "Избери мобилна фаза (елуент), па собирај фракции од по 5 mL. Започни со неполарен растворувач, па постепено зголемувај ја поларноста (градиент по чекори) за да ги елуираш и посилно задржаните супстанци.", true);
      const row = el("div", "chr-opts"); s.appendChild(row);
      ELU.forEach((e, i) => { const b = el("button", "chr-opt" + (i === 0 ? " on" : ""), e[0]); b.type = "button"; b.onclick = () => { S.sIdx = i; row.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); setLab(); }; row.appendChild(b); });
      volLab = sv.querySelector("#cl-vol"); eluLab = sv.querySelector("#cl-el"); const setLab = () => { eluLab.textContent = ELU[S.sIdx][0]; volLab.textContent = "Собрано: " + S.vtot + " mL"; }; setLab();
      const b1 = el("button", "btn ghost", "▶ Елуирај 1 епрувета (5 mL)"), b5 = el("button", "btn ghost", "⏩ Елуирај 5 епрувети (25 mL)"); b1.type = b5.type = "button";
      const info = el("p", "in-hint"); tubesBox = el("div", "chr-tubes"); s.append(b1, " ", b5, info, tubesBox);
      let busy = false;
      function step() {
        if (S.tubes.length >= NT) return null; const sI = ELU[S.sIdx][1]; const t = {}; let rr = 0, gg = 0, bb = 0, ab = 0;
        COMPS.forEach(c => { const k = H.kSil(c.p, sI); const z0 = S.z[c.id], z1 = z0 + TUBE / (V0 * (1 + k)); const sg = zs => Math.min(0.6, S.sigma + 0.05 * S.pack * Math.sqrt(zs)) * (0.4 + S.load / 100);
          const F = (z) => H.cdf((z - 1) / sg(z)); const f0 = S.cum[c.id], f1 = Math.max(f0, F(z1)); t[c.id] = (f1 - f0); S.cum[c.id] = f1; S.z[c.id] = z1;
          const m = (f1 - f0) * S.load; rr += c.col[0] * m; gg += c.col[1] * m; bb += c.col[2] * m; ab += m; });
        S.tubes.push({ n: S.tubes.length + 1, a: t, grp: 0, eluent: S.sIdx }); S.vtot += TUBE; drawTube(S.tubes[S.tubes.length - 1], ab, rr, gg, bb); drawBands(); setLab();
        const dr = sv.querySelector("#cl-drop"); dr.setAttribute("opacity", 1); H.later(() => dr.setAttribute("opacity", 0), 300); return true;
      }
      function drawTube(t, ab, rr, gg, bb) {
        const d = el("div", "chr-tube"); const col = ab > 0.003 ? `rgb(${Math.round(rr / ab)},${Math.round(gg / ab)},${Math.round(bb / ab)})` : "transparent";
        const op = Math.min(1, ab / (S.load * 0.3) + (ab > 0.003 ? 0.15 : 0));
        d.innerHTML = `<i><b style="background:${col};opacity:${op.toFixed(2)}"></b></i>${t.n}`; t.dom = d; t.col = col; t.op = op; d.onclick = () => toggle(t); tubesBox.appendChild(d); }
      const run = n => { if (busy) return; busy = true; let i = 0; (function go() { if (i++ >= n || !step()) { busy = false; if (S.tubes.length >= 6) showAnalysis(); return; } H.later(go, 350); })(); };
      b1.onclick = () => run(1); b5.onclick = () => run(5);
    }
    /* 4. фракции */
    let sel = new Set(), pools = [], anaSec;
    function toggle(t) { if (t.grp) return; if (sel.has(t)) { sel.delete(t); t.dom.classList.remove("sel"); } else { sel.add(t); t.dom.classList.add("sel"); } }
    function showAnalysis() {
      if (anaSec) return; anaSec = section("4. Спојување на фракции и оцена", "Кликни ги епруветите што сакаш да ги споиш (избраните се означени), па „Спој“. Може да направиш до 3 споени фракции. Задача: секоја супстанца да е со чистота ≥ 95 % и искористување ≥ 70 %. Потоа определи ја секоја фракција.");
      const b = el("button", "btn ghost", "➕ Спој ги избраните"), ev = el("button", "btn ghost", "✔ Оцени"); b.type = ev.type = "button"; const msg = el("div"), tbl = el("div");
      anaSec.append(b, " ", ev, msg, tbl);
      b.onclick = () => { if (!sel.size) { msg.innerHTML = "<p class='in-fb-bad'>Прво избери епрувети.</p>"; return; } if (pools.length >= 3) { msg.innerHTML = "<p class='in-fb-bad'>Најмногу 3 споени фракции.</p>"; return; }
        const arr = [...sel]; arr.forEach(t => { t.grp = pools.length + 1; t.dom.classList.remove("sel"); t.dom.classList.add("p" + (pools.length + 1)); }); pools.push({ tubes: arr, who: "" }); sel.clear(); msg.innerHTML = ""; renderPools(); };
      function renderPools() { tbl.innerHTML = ""; const t = el("table", "chr-tbl"); t.innerHTML = "<tr><th>Фракција</th><th>Епрувети</th><th>Супстанца</th></tr>";
        pools.forEach((p, i) => { const tr = el("tr"); const s = el("select", "chr-num"); s.style.width = "auto"; s.innerHTML = "<option value=''>— избери —</option>" + COMPS.map(c => `<option value="${c.id}"${p.who === c.id ? " selected" : ""}>${c.name}</option>`).join(""); s.onchange = () => p.who = s.value;
          const td = el("td"); td.appendChild(s); tr.append(el("td", "", `<span class="chr-badge">Ф${i + 1}</span>`), el("td", "", p.tubes.map(x => x.n).sort((a, b) => a - b).join(", ")), td); t.appendChild(tr); }); tbl.appendChild(t); }
      ev.onclick = () => {
        if (!pools.length) { msg.innerHTML = "<p class='in-fb-bad'>Спој барем една фракција.</p>"; return; }
        const rows = []; let allOk = true;
        COMPS.forEach(c => { let best = null; pools.forEach((p, i) => { const tot = p.tubes.reduce((s, t) => s + COMPS.reduce((q, d) => q + t.a[d.id], 0), 0); const mine = p.tubes.reduce((s, t) => s + t.a[c.id], 0); const purity = tot > 0 ? mine / tot : 0; if (!best || mine > best.mine) best = { i, mine, purity, rec: mine }; });
          const ok = best && best.purity >= 0.95 && best.rec >= 0.7; if (!ok) allOk = false;
          const id = best && pools[best.i].who === c.id; if (!id) allOk = false; rows.push(`<tr><td>${c.name}</td><td>Ф${best ? best.i + 1 : "–"}</td><td>${best ? fmt(best.purity * 100, 0) : 0} %</td><td>${best ? fmt(best.rec * 100, 0) : 0} %</td><td>${ok ? "✔" : "✘"}</td><td>${id ? "✔" : "✘ непознато/погрешно"}</td></tr>`); });
        msg.innerHTML = `<table class="chr-tbl"><tr><th>Супстанца</th><th>Најдобра фракција</th><th>Чистота</th><th>Искористување</th><th>Цел</th><th>Идентификација</th></tr>${rows.join("")}</table>` +
          (allOk ? "<p class='in-fb-ok'>✔ Одлично! Сите три супстанци се чисти и добро собрани.</p>"
            : "<p class='in-hint'>Совет: промени го градиентот, нанесувањето и провери ја чистотата на фракциите.</p>"); };
      const nw = el("button", "btn ghost", "🔄 Нова колона"); nw.type = "button"; nw.onclick = () => H.__colReload(); anaSec.appendChild(nw);
    }
  };
})();
