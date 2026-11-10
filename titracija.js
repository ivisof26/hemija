// Алатки: титрации со индикатор (виртуелна лабораторија).
// Прво се бира соодветен индикатор, потоа се изведува титрацијата, па се пресметува концентрацијата.
// Видови: киселинско-базни, комплексометриски (EDTA), таложни (аргентометрија) и редокс титрации.
(function () {
  "use strict";
  const root = document.getElementById("tit-root");
  if (!root) return;

  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  const btn = (text, cls, fn) => { const b = el("button", cls || "btn", text); b.type = "button"; if (fn) b.addEventListener("click", fn); return b; };
  const fmt = (x, d) => x.toFixed(d).replace(".", ",");
  const later = (fn, ms) => setTimeout(fn, reduce ? 0 : ms);
  const KW = 1e-14, VA = 25;
  const log10 = Math.log10;

  /* ---------- Бои на индикатори (од ниска кон висока вредност на сигналот) ---------- */
  const WATER = [207, 230, 245, 0.5];
  const PAL = {
    mo: [[225, 35, 40, .62], [238, 80, 38, .62], [245, 130, 32, .62], [252, 175, 25, .62], [255, 212, 30, .62]],
    mr: [[215, 30, 40, .62], [232, 70, 40, .62], [243, 120, 35, .62], [250, 170, 25, .62], [255, 218, 20, .62]],
    ybl: [[250, 215, 40, .6], [185, 205, 60, .6], [95, 175, 90, .62], [50, 140, 150, .64], [40, 100, 200, .66]],
    pp: [WATER, [247, 218, 234, .42], [241, 150, 200, .62], [233, 70, 160, .74], [215, 20, 120, .82]],
    tp: [WATER, [190, 205, 240, .5], [120, 150, 230, .62], [60, 95, 215, .72], [25, 55, 190, .8]],
    wineblue: [[165, 25, 60, .75], [150, 40, 95, .72], [110, 55, 140, .7], [75, 75, 180, .7], [40, 95, 205, .7]],
    murex: [[225, 105, 140, .72], [200, 95, 165, .72], [165, 85, 185, .72], [140, 75, 190, .72], [118, 68, 192, .72]],
    xo: [[190, 45, 110, .72], [215, 85, 90, .7], [235, 140, 70, .68], [244, 190, 65, .66], [250, 222, 60, .65]],
    mtb: [[45, 95, 205, .72], [90, 130, 170, .66], [140, 165, 130, .62], [195, 200, 100, .6], [240, 230, 90, .6]],
    mohr: [[180, 65, 38, .78], [200, 105, 45, .72], [220, 150, 50, .68], [235, 185, 55, .64], [245, 215, 60, .6]],
    dcf: [[235, 95, 170, .72], [225, 130, 160, .68], [215, 170, 130, .64], [212, 205, 100, .62], [208, 232, 80, .6]],
    eosin: [[230, 55, 105, .76], [238, 105, 95, .72], [245, 150, 85, .68], [248, 180, 80, .62], [250, 205, 85, .58]],
    mno4: [WATER, [245, 222, 236, .4], [235, 155, 205, .6], [215, 75, 165, .76], [190, 30, 140, .86]],
    ferroin: [[200, 30, 45, .72], [185, 80, 85, .66], [145, 120, 150, .6], [105, 150, 190, .54], [75, 155, 210, .5]],
    dps: [WATER, [215, 205, 240, .45], [170, 130, 225, .6], [135, 70, 205, .72], [105, 35, 185, .82]],
    npa: [WATER, [240, 205, 225, .45], [225, 140, 190, .6], [200, 70, 160, .72], [170, 30, 130, .82]],
    mb: [WATER, [170, 200, 240, .5], [110, 160, 230, .6], [60, 120, 215, .68], [30, 90, 200, .75]],
    starch: [WATER, [150, 165, 200, .5], [90, 100, 165, .65], [50, 55, 125, .78], [25, 25, 85, .88]],
    iodine: [WATER, [250, 235, 170, .5], [240, 205, 110, .6], [215, 160, 60, .68], [190, 115, 35, .76]]
  };
  const I = (name, lo, hi, ch, c, o) => Object.assign({ name, lo, hi, ch, c }, o || {});
  const AB = [
    I("Метил оранж", 3.1, 4.4, ["црвена", "жолта"], PAL.mo),
    I("Бромкрезол зелено", 3.8, 5.4, ["жолта", "сина"], PAL.ybl),
    I("Метил црвено", 4.4, 6.2, ["црвена", "жолта"], PAL.mr),
    I("Бромтимол сино", 6.0, 7.6, ["жолта", "сина"], PAL.ybl),
    I("Фенолфталеин", 8.2, 10.0, ["безбојна", "розова"], PAL.pp),
    I("Тимолфталеин", 9.3, 10.5, ["безбојна", "сина"], PAL.tp)
  ];

  /* ---------- Хемија: криви на титрација ---------- */
  function bisectPH(f) {
    let lo = 0, hi = 14;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2, h = Math.pow(10, -mid);
      if (f(h) > 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  const hFrom = x => -log10((x + Math.sqrt(x * x + 4 * KW)) / 2);
  const strongAcid = (n, ct) => (ca, V) => hFrom((n * ca * VA - ct * V) / (VA + V));
  const strongBase = ct => (ca, V) => hFrom((ct * V - ca * VA) / (VA + V));
  const weakAcid = (Ka, ct) => (ca, V) => {
    const tot = VA + V, C = ca * VA / tot, N = ct * V / tot;
    return bisectPH(h => N + h - C * Ka / (Ka + h) - KW / h);
  };
  const weakBase = (Kb, ct) => (ca, V) => {
    const tot = VA + V, C = ca * VA / tot, A = ct * V / tot, Kan = KW / Kb;
    return bisectPH(h => h + C * h / (h + Kan) - A - KW / h);
  };
  const edta = (Kc, ct) => (ca, V) => {          // pM = −log[M]
    const tot = VA + V, C = ca * VA / tot, Y = ct * V / tot, b = Kc * (Y - C) + 1;
    const m = b > 0 ? 2 * C / (b + Math.sqrt(b * b + 4 * Kc * C)) : (-b + Math.sqrt(b * b + 4 * Kc * C)) / (2 * Kc);
    return -log10(m);
  };
  const silver = (Ksp, ct) => (ca, V) => {      // pAg
    const d = (ct * V - ca * VA) / (VA + V);
    return -log10((d + Math.sqrt(d * d + 4 * Ksp)) / 2);
  };
  const feMn = ct => (ca, V) => {               // 5Fe²⁺ + MnO₄⁻
    const ve = ca * VA / (5 * ct), f = V / ve;
    if (f < 1 - 1e-9) return 0.68 + 0.0592 * log10(Math.max(f, 1e-6) / (1 - f));
    if (f > 1 + 1e-9) return 1.51 + 0.01184 * log10(Math.max(f - 1, 1e-9));
    return (0.68 + 5 * 1.51) / 6;
  };
  const feCr = ct => (ca, V) => {               // 6Fe²⁺ + Cr₂O₇²⁻
    const ve = ca * VA / (6 * ct), f = V / ve, tot = VA + V;
    if (f < 1 - 1e-9) return 0.68 + 0.0592 * log10(Math.max(f, 1e-6) / (1 - f));
    if (f > 1 + 1e-9) return 1.33 + 0.00987 * log10(Math.max((V - ve) * tot / (4 * ct * ve * ve), 1e-12));
    return (0.68 + 6 * 1.33) / 7;
  };
  const iodine = ct => (ca, V) => {             // I₂ + 2S₂O₃²⁻ (во присуство на вишок I⁻)
    const ve = 2 * ca * VA / ct, f = V / ve, tot = VA + V, EQ = 0.32;
    if (f < 1 - 1e-9) {
      const i2 = ca * VA * (1 - f) / tot, iod = 0.25 * VA / tot + 2 * ca * VA * f / tot;
      return Math.max(EQ, 0.545 + 0.0296 * log10(Math.max(i2, 1e-14) / (iod * iod)));
    }
    if (f > 1 + 1e-9) {
      const s4 = ca * VA / tot, s2 = Math.max(ct * (V - ve) / tot, 1e-12);
      return Math.min(EQ, 0.08 + 0.0296 * log10(s4 / (s2 * s2)));
    }
    return EQ;
  };

  /* ---------- Видови сигнал (оска на кривата) ---------- */
  const SG = {
    ph: { name: "pH", ymin: 0, ymax: 14, step: 2, dec: 1, axis: "pH", unit: "" },
    pca: { name: "pCa", ymin: 0, ymax: 10, step: 2, dec: 1, axis: "pCa", unit: "" },
    pmg: { name: "pMg", ymin: 0, ymax: 10, step: 2, dec: 1, axis: "pMg", unit: "" },
    pzn: { name: "pZn", ymin: 0, ymax: 12, step: 2, dec: 1, axis: "pZn", unit: "" },
    pag: { name: "pAg", ymin: 0, ymax: 12, step: 2, dec: 1, axis: "pAg", unit: "" },
    e: { name: "E", ymin: 0, ymax: 1.6, step: 0.2, dec: 2, axis: "E / V", unit: " V" }
  };

  /* ---------- Системи за титрација ---------- */
  const SYS = [
    // ===== Киселинско-базни =====
    { id: "hcl", grp: "Киселинско-базни", label: "HCl со NaOH", sym: "HCl", sample: "раствор на хлороводородна киселина (HCl)", titrant: "натриум хидроксид (NaOH)", tshort: "NaOH",
      ct: 0.1, ctDec: 4, nu: 1, crange: [0.08, 0.14], dir: 1, sig: SG.ph, curve: strongAcid(1, 0.1), inds: AB,
      data: "Силна киселина се титрира со силна база.", eq: "HCl + NaOH → NaCl + H₂O", stoich: "n(HCl) = n(NaOH)",
      eqnote: "Солта NaCl не хидролизира, па во еквивалентната точка pH = 7.",
      qa: [["Зошто овде може да се употребат повеќе индикатори?", "Опсегот на pH е голем (од околу 4 до 10), па интервалите на повеќе индикатори паѓаат во него."]] },
    { id: "naoh", grp: "Киселинско-базни", label: "NaOH со HCl", sym: "NaOH", sample: "раствор на натриум хидроксид (NaOH)", titrant: "хлороводородна киселина (HCl)", tshort: "HCl",
      ct: 0.1, ctDec: 4, nu: 1, crange: [0.08, 0.14], dir: -1, sig: SG.ph, curve: strongBase(0.1), inds: AB,
      data: "Силна база се титрира со силна киселина: pH опаѓа од базна кон кисела средина.", eq: "NaOH + HCl → NaCl + H₂O", stoich: "n(NaOH) = n(HCl)",
      eqnote: "Солта NaCl не хидролизира, па во еквивалентната точка pH = 7.",
      qa: [["Како се менува бојата на фенолфталеинот кога базата се титрира со киселина?", "Од розова во безбојна: растворот се обезбојува кога pH ќе падне под околу 8."]] },
    { id: "hac", grp: "Киселинско-базни", label: "CH₃COOH со NaOH", sym: "CH₃COOH", sample: "раствор на оцетна киселина (CH₃COOH)", titrant: "натриум хидроксид (NaOH)", tshort: "NaOH",
      ct: 0.1, ctDec: 4, nu: 1, crange: [0.08, 0.14], dir: 1, sig: SG.ph, curve: weakAcid(1.8e-5, 0.1), inds: AB,
      data: "Слаба киселина (Ka = 1,8·10⁻⁵) се титрира со силна база.", eq: "CH₃COOH + NaOH → CH₃COONa + H₂O", stoich: "n(CH₃COOH) = n(NaOH)",
      eqnote: "Ацетатниот јон хидролизира (CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻), па во еквивалентната точка растворот е базен.", qa: [] },
    { id: "hcooh", grp: "Киселинско-базни", label: "HCOOH со NaOH", sym: "HCOOH", sample: "раствор на мравска киселина (HCOOH)", titrant: "натриум хидроксид (NaOH)", tshort: "NaOH",
      ct: 0.1, ctDec: 4, nu: 1, crange: [0.08, 0.14], dir: 1, sig: SG.ph, curve: weakAcid(1.8e-4, 0.1), inds: AB,
      data: "Слаба киселина (Ka = 1,8·10⁻⁴), посилна од оцетната, се титрира со силна база.", eq: "HCOOH + NaOH → HCOONa + H₂O", stoich: "n(HCOOH) = n(NaOH)",
      eqnote: "Форматниот јон хидролизира (HCOO⁻ + H₂O ⇌ HCOOH + OH⁻), па во еквивалентната точка растворот е слабо базен.", qa: [] },
    { id: "nh3", grp: "Киселинско-базни", label: "NH₃ со HCl", sym: "NH₃", sample: "раствор на амонијак (NH₃)", titrant: "хлороводородна киселина (HCl)", tshort: "HCl",
      ct: 0.1, ctDec: 4, nu: 1, crange: [0.08, 0.14], dir: -1, sig: SG.ph, curve: weakBase(1.8e-5, 0.1), inds: AB,
      data: "Слаба база (Kb = 1,8·10⁻⁵) се титрира со силна киселина.", eq: "NH₃ + HCl → NH₄Cl", stoich: "n(NH₃) = n(HCl)",
      eqnote: "Амониумовиот јон хидролизира (NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺), па во еквивалентната точка растворот е кисел.", qa: [] },
    { id: "h2so4", grp: "Киселинско-базни", label: "H₂SO₄ со NaOH", sym: "H₂SO₄", sample: "раствор на сулфурна киселина (H₂SO₄)", titrant: "натриум хидроксид (NaOH)", tshort: "NaOH",
      ct: 0.1, ctDec: 4, nu: 0.5, crange: [0.04, 0.07], dir: 1, sig: SG.ph, curve: strongAcid(2, 0.1), inds: AB,
      data: "Силна дипротонска киселина: двата H⁺ се неутрализираат (во првиот чекор H₂SO₄ е целосно дисоцирана).", eq: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O", stoich: "n(H₂SO₄) = ½ · n(NaOH)",
      eqnote: "Солта Na₂SO₄ не хидролизира значително, па во еквивалентната точка pH ≈ 7.",
      qa: [["Зошто V(NaOH) е двојно поголем од кај HCl со иста концентрација?", "Секоја молекула H₂SO₄ дава два H⁺, па на 1 mol H₂SO₄ му требаат 2 mol NaOH."]] },

    // ===== Комплексометриски =====
    { id: "ca", grp: "Комплексометриски (EDTA)", thr: [0.25, 0.5], label: "Ca²⁺ со EDTA (pH 12)", sym: "Ca²⁺", sample: "раствор што содржи калциум(II) јони (Ca²⁺), во кој е додаден NaOH (pH ≈ 12)", titrant: "EDTA (динатриумова сол)", tshort: "EDTA",
      ct: 0.01, ctDec: 4, nu: 1, crange: [0.006, 0.012], dir: 1, sig: SG.pca, curve: edta(5e10, 0.01),
      inds: [
        I("Мурексид", 4.5, 5.5, ["розова", "виолетова"], PAL.murex),
        I("Калкон", 4.8, 5.8, ["винско-црвена", "сина"], PAL.wineblue),
        I("Еригром црно Т (EBT)", 3.3, 4.3, ["винско-црвена", "сина"], PAL.wineblue),
        I("Ксиленол-портокалово", 2.2, 3.0, ["црвена", "жолта"], PAL.xo)
      ],
      data: "Определување на калциум (тврдина на вода). Условна константа на стабилност на CaY²⁻ при pH 12: K′ ≈ 5·10¹⁰.", eq: "Ca²⁺ + H₂Y²⁻ → CaY²⁻ + 2H⁺", stoich: "n(Ca²⁺) = n(EDTA)",
      eqnote: "EDTA гради комплекс 1 : 1 со металните јони. Индикаторот е слабо комплексообразувач и мора да ја менува бојата кога слободните Ca²⁺ ќе се потрошат.",
      qa: [["Зошто Ca²⁺ се титрира при pH 12, а Mg²⁺ при pH 10?", "При pH 12 Mg²⁺ се таложи како Mg(OH)₂, па не пречи, а при титрација во присуство на мурексид реагира само Ca²⁺. Комплексите со EDTA се постабилни при повисока pH."]] },
    { id: "mg", grp: "Комплексометриски (EDTA)", thr: [0.25, 0.5], label: "Mg²⁺ со EDTA (pH 10)", sym: "Mg²⁺", sample: "раствор што содржи магнезиум(II) јони (Mg²⁺), во амонијачен пуфер (pH ≈ 10)", titrant: "EDTA (динатриумова сол)", tshort: "EDTA",
      ct: 0.01, ctDec: 4, nu: 1, crange: [0.006, 0.012], dir: 1, sig: SG.pmg, curve: edta(1.7e8, 0.01),
      inds: [
        I("Ериохром црно Т (EBT)", 4.9, 5.9, ["розова", "сина"], PAL.wineblue),
        I("Калмагит", 5.1, 6.1, ["розова", "сина"], PAL.wineblue),
        I("Мурексид", 2.0, 3.0, ["розова", "виолетова"], PAL.murex),
        I("Калкон", 3.6, 4.4, ["розова", "сина"], PAL.wineblue)
      ],
      data: "Условна константа на стабилност на MgY²⁻ при pH 10: K′ ≈ 1,7·10⁸. Скокот е помал отколку кај Ca²⁺.", eq: "Mg²⁺ + H₂Y²⁻ → MgY²⁻ + 2H⁺", stoich: "n(Mg²⁺) = n(EDTA)",
      eqnote: "MgY²⁻ е понестабилен комплекс од CaY²⁻, па скокот е поблага. Затоа е важно да се избере индикатор што ја менува бојата токму во тој интервал.", qa: [] },
    { id: "zn", grp: "Комплексометриски (EDTA)", thr: [0.25, 0.5], label: "Zn²⁺ со EDTA (pH 5,5)", sym: "Zn²⁺", sample: "раствор што содржи цинк(II) јони (Zn²⁺), во ацетатен пуфер (pH ≈ 5,5)", titrant: "EDTA (динатриумова сол)", tshort: "EDTA",
      ct: 0.01, ctDec: 4, nu: 1, crange: [0.006, 0.012], dir: 1, sig: SG.pzn, curve: edta(1.7e11, 0.01),
      inds: [
        I("Ксиленол портокалово", 5.2, 6.2, ["црвено-виолетова", "жолта"], PAL.xo),
        I("Метилтимол сино", 4.0, 5.0, ["сина", "жолта"], PAL.mtb),
        I("Ериохром црно Т (EBT)", 2.5, 3.5, ["розова", "сина"], PAL.wineblue)
      ],
      data: "Условна константа на стабилност на ZnY²⁻ при pH 5,5: K′ ≈ 1,7·10¹¹.", eq: "Zn²⁺ + H₂Y²⁻ → ZnY²⁻ + 2H⁺", stoich: "n(Zn²⁺) = n(EDTA)",
      eqnote: "При pH 5,5 ксиленол-портокаловото е жолт (слободен индикатор) и црвено-виолетов кога е сврзан со Zn²⁺.", qa: [] },

    // ===== Таложни (аргентометрија) =====
    { id: "cl", grp: "Таложни (аргентометрија)", label: "Cl⁻ со AgNO₃", sym: "Cl⁻", sample: "раствор на натриум хлорид (NaCl)", titrant: "сребро нитрат (AgNO₃)", tshort: "AgNO₃",
      ct: 0.1, ctDec: 4, nu: 1, crange: [0.08, 0.14], dir: -1, sig: SG.pag, curve: silver(1.8e-10, 0.1),
      inds: [
        I("Калиум хромат (Мор)", 4.5, 5.1, ["цигла-црвена", "жолта"], PAL.mohr),
        I("Дихлорфлуоресцеин (Фајанс)", 4.2, 5.0, ["розова", "жолто-зелена"], PAL.dcf),
        I("Еозин", 6.2, 6.8, ["розово-црвена", "жолто-портокалова"], PAL.eosin)
      ],
      data: "Определување на хлориди. Ksp(AgCl) = 1,8·10⁻¹⁰. pAg опаѓа додека се додава Ag⁺.", eq: "Ag⁺ + Cl⁻ → AgCl↓", stoich: "n(Cl⁻) = n(Ag⁺)",
      eqnote: "Крајот се гледа кога првиот вишок Ag⁺ ќе даде обоен талог (Ag₂CrO₄) или ќе се врзе индикаторот за површината на AgCl.",
      qa: [["Зошто еозинот не е добар за хлориди?", "Еозинот се атсорбира на AgCl уште пред еквивалентната точка (има голем афинитет), па бојата се менува прерано."]] },
    { id: "br", grp: "Таложни (аргентометрија)", label: "Br⁻ со AgNO₃", sym: "Br⁻", sample: "раствор на калиум бромид (KBr)", titrant: "сребро нитрат (AgNO₃)", tshort: "AgNO₃",
      ct: 0.1, ctDec: 4, nu: 1, crange: [0.08, 0.14], dir: -1, sig: SG.pag, curve: silver(5.0e-13, 0.1),
      inds: [
        I("Еозин", 5.8, 6.4, ["розово-црвена", "жолто-портокалова"], PAL.eosin),
        I("Калиум хромат (Мор)", 4.5, 5.1, ["цигла-црвена", "жолта"], PAL.mohr),
        I("Флуоресцеин", 3.1, 3.9, ["розова", "жолто-зелена"], PAL.dcf)
      ],
      data: "Определување на бромиди. Ksp(AgBr) = 5,0·10⁻¹³.", eq: "Ag⁺ + Br⁻ → AgBr↓", stoich: "n(Br⁻) = n(Ag⁺)",
      eqnote: "AgBr е помалку растворлив од AgCl, па еквивалентната точка е при повисок pAg.",
      qa: [["Зошто флуоресцеинот е лош избор овде?", "Како послаб атсорпционен индикатор бара поголем вишок Ag⁺, па бојата се менува доцна и грешката е голема."]] },

    // ===== Редокс =====
    { id: "mn", grp: "Редокс", label: "Fe²⁺ со KMnO₄", sym: "Fe²⁺", sample: "раствор на железо(II) сулфат (Fe²⁺), закиселен со H₂SO₄", titrant: "калиум перманганат (KMnO₄)", tshort: "KMnO₄",
      ct: 0.02, ctDec: 4, nu: 5, crange: [0.06, 0.12], dir: 1, sig: SG.e, curve: feMn(0.02),
      inds: [
        I("KMnO₄ (самоиндикатор)", 1.465, 1.475, ["безбојна", "розова"], PAL.mno4, { self: true }),
        I("Ферoин", 1.01, 1.11, ["црвена", "бледосина"], PAL.ferroin),
        I("Дифениламин сулфонат", 0.79, 0.89, ["безбојна", "виолетова"], PAL.dps),
        I("Метиленско сино", 0.50, 0.56, ["безбојна", "сина"], PAL.mb)
      ],
      data: "Перманганатометрија во кисела средина. Потенцијалите се формални, за 1 mol/L H⁺.", eq: "5Fe²⁺ + MnO₄⁻ + 8H⁺ → 5Fe³⁺ + Mn²⁺ + 4H₂O", stoich: "n(Fe²⁺) = 5 · n(MnO₄⁻)",
      eqnote: "MnO₄⁻ е виолетов, па првиот вишок од една капка го обојува растворот розово: затоа самиот перманганат служи како индикатор.",
      qa: [["Зошто Fe²⁺ реагира 5 : 1 со MnO₄⁻?", "Mn(VII) прима 5 електрони (до Mn²⁺), а Fe²⁺ дава по еден електрон, па 5 Fe²⁺ му требаат на еден MnO₄⁻."]] },
    { id: "cr", grp: "Редокс", label: "Fe²⁺ со K₂Cr₂O₇", sym: "Fe²⁺", sample: "раствор на железо(II) сулфат (Fe²⁺), закиселен со H₂SO₄ и H₃PO₄", titrant: "калиум дихромат (K₂Cr₂O₇)", tshort: "K₂Cr₂O₇",
      ct: 0.016667, ctDec: 5, nu: 6, crange: [0.06, 0.12], dir: 1, sig: SG.e, curve: feCr(0.016667),
      inds: [
        I("Дифениламин сулфонат", 0.79, 0.89, ["безбојна", "виолетова"], PAL.dps),
        I("Ферoин", 1.01, 1.11, ["црвена", "бледосина"], PAL.ferroin),
        I("N-фенилантранилна киселина", 1.03, 1.13, ["безбојна", "црвено-виолетова"], PAL.npa),
        I("Метиленско сино", 0.50, 0.56, ["безбојна", "сина"], PAL.mb)
      ],
      data: "Дихроматометрија. Самиот дихромат не е добар индикатор (бојата од Cr³⁺ пречи), па се користи редокс индикатор. Концентрација c(K₂Cr₂O₇) = 0,01667 mol/L.", eq: "6Fe²⁺ + Cr₂O₇²⁻ + 14H⁺ → 6Fe³⁺ + 2Cr³⁺ + 7H₂O", stoich: "n(Fe²⁺) = 6 · n(Cr₂O₇²⁻)",
      eqnote: "Редокс-индикаторот ја менува бојата во тесен опсег на потенцијали околу неговиот формален редокс-потенцијал. Затоа, неговиот формален потенцијал треба да биде во опсегот на наглата промена на потенцијалот околу еквивалентната точка.", qa: [] },
    { id: "iod", grp: "Редокс", label: "I₂ со Na₂S₂O₃", sym: "I₂", sample: "раствор на јод (I₂) во калиум јодид (KI)", titrant: "натриум тиосулфат (Na₂S₂O₃)", tshort: "Na₂S₂O₃",
      ct: 0.1, ctDec: 4, nu: 0.5, crange: [0.04, 0.07], dir: -1, sig: SG.e, curve: iodine(0.1),
      inds: [
        I("Скроб", 0.42, 0.465, ["безбојна", "сино-црна"], PAL.starch),
        I("Без индикатор (боја на I₂)", 0.455, 0.49, ["безбојна", "жолто-кафеава"], PAL.iodine),
        I("Метилен-сино", 0.50, 0.56, ["безбојна", "сина"], PAL.mb),
        I("Дифениламин-сулфонат", 0.79, 0.89, ["безбојна", "виолетова"], PAL.dps)
      ],
      data: "Јодометрија: јодот се титрира со тиосулфат. Во пракса скробот се додава кога растворот ќе стане бледожолт (пред крајот), за да не сврзе премногу јод.", eq: "I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻", stoich: "n(I₂) = ½ · n(S₂O₃²⁻)",
      eqnote: "Скробот со јод дава интензивно сино-црн комплекс, па крајот се гледа како исчезнување на сината боја.",
      qa: [["Зошто се користи скроб?", "Скробот со многу мало количество јод дава интензивна боја, па крајот се гледа многу појасно отколку по жолтата боја на јодот."]] }
  ];
  SYS.forEach(s => {
    s.veq = ca => ca * VA / (s.nu * s.ct);
    s.inds.forEach(i => {
      i.a = i.c[0]; i.b = i.c[i.c.length - 1];
    });
  });
  const mix = (c1, c2, t) => c1.map((v, i) => v + (c2[i] - v) * t);
  const css = c => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
  const pk = ind => (ind.lo + ind.hi) / 2;
  function alpha(ind, p) {
    const s = 1.9 / (ind.hi - ind.lo);
    return 1 / (1 + Math.pow(10, -(p - pk(ind)) * s));
  }
  function indColor(ind, p) {
    const x = alpha(ind, p) * (ind.c.length - 1), i = Math.min(ind.c.length - 2, Math.floor(x));
    return mix(ind.c[i], ind.c[i + 1], x - i);
  }
  function Vat(sys, ca, target) {
    let lo = 0, hi = 2 * sys.veq(ca);
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2, p = sys.curve(ca, mid);
      if (sys.dir > 0 ? p < target : p > target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function evalInd(sys, ca, ind) {
    const ve = sys.veq(ca), vk = Vat(sys, ca, pk(ind)), err = (vk - ve) / ve * 100, ae = Math.abs(err);
    const thr = sys.thr || [0.1, 0.5];
    const p1 = sys.curve(ca, ve * 0.999), p2 = sys.curve(ca, ve * 1.001);
    return { vk, err, cls: ae <= thr[0] ? "good" : ae <= thr[1] ? "part" : "bad", jlo: Math.min(p1, p2), jhi: Math.max(p1, p2), peq: sys.curve(ca, ve) };
  }
  const rdec = (sys, ind) => (ind.hi - ind.lo < 0.02 ? 3 : (sys.sig.dec === 1 ? 1 : 2));

  /* ---------- Состојба ---------- */
  const BUR_Y0 = 60, BUR_K = 3.8;
  let S = null;
  function newTask(id) {
    const sys = SYS.find(s => s.id === id) || SYS[Math.floor(Math.random() * SYS.length)];
    const ca = Math.round((sys.crange[0] + Math.random() * (sys.crange[1] - sys.crange[0])) * 1e4) / 1e4;
    S = { sys, ca, picked: null, passed: false, tries: 0, ev: null, prep: { pip: false, ind: false, fill: false },
      v0: 0, r: 0, busy: false, active: false, runs: [] };
  }
  const nu = () => S.sys.nu;

  /* ---------- Скелет на страницата ---------- */
  root.innerHTML = "";
  const intro = el("p", "in-intro", "Вежба: избери вид на титрација, па соодветен индикатор. Подготви ги ерленмаерот и биретата, титрирај до промена на бојата и пресметај ја концентрацијата на непознатиот раствор.");
  const setup = el("div", "ep-setup in-setup");
  const selLab = el("label", "ep-lab", "Задача:");
  const sel = el("select", "calc-num ep-sel in-sel");
  sel.id = "ti-sys";
  (function () {
    const o0 = el("option", "", "🎲 Случајна"); o0.value = ""; sel.appendChild(o0);
    const groups = {};
    SYS.forEach(s => {
      if (!groups[s.grp]) { groups[s.grp] = el("optgroup"); groups[s.grp].label = s.grp; sel.appendChild(groups[s.grp]); }
      const op = el("option", "", s.label); op.value = s.id; groups[s.grp].appendChild(op);
    });
  })();
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
    <clipPath id="ti-pclip"><path d="M-1 -202 V-176.5 C-9 -174 -8.5 -128 -1 -126 V-12 L0 -3 L1 -12 V-126 C8.5 -128 9 -174 1 -176.5 V-202 Z" transform="translate(0 0)"/></clipPath>
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
  <!-- ерленмаер -->
  <g id="ti-flask" class="ti-flask">
    <g clip-path="url(#ti-fclip)">
      <rect id="ti-fliq" class="ti-fliq" x="100" y="404" width="100" height="50" fill="rgb(207,230,245)" fill-opacity=".5"/>
    </g>
    <path d="M138 346 V372 L112 436 Q109 449 122 449 H178 Q191 449 188 436 L162 372 V346" fill="none" stroke="#8fa6bd" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M133 346 H167" stroke="#8fa6bd" stroke-width="4" stroke-linecap="round"/>
    <path d="M139 384 L122 430" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
  </g>
  <!-- одмерна пипета (држена накривено, врвот во ерленмаерот) -->
  <g id="ti-pip" class="ti-pip">
    <g transform="translate(146 380) rotate(14)">
      <path d="M-1.7 -215 V-176 C-12 -173 -11 -127 -1.7 -124 V-12 L-0.8 0 H0.8 L1.7 -12 V-124 C11 -127 12 -173 1.7 -176 V-215 Z" fill="#eef4f9" fill-opacity=".85" stroke="#8fa6bd" stroke-width="1.5" stroke-linejoin="round"/>
      <g clip-path="url(#ti-pclip)"><g id="ti-pipliq" class="ti-pipliq"><rect x="-12" y="-202" width="24" height="204" fill="#8cc4e8"/></g></g>
      <line x1="-5" x2="5" y1="-202" y2="-202" stroke="#2d1b4e" stroke-width="1.5"/>
    </g>
  </g>
  <!-- капалка за индикатор -->
  <g id="ti-dropper" class="ti-dropper">
    <ellipse cx="150" cy="310" rx="5.5" ry="8" fill="#7c2d12"/>
    <rect x="146" y="316" width="8" height="3" rx="1" fill="#4a3b4e"/>
    <path d="M148 319 H152 V334 L150.6 341 H149.4 L148 334 Z" fill="#eef4f9" stroke="#8fa6bd" stroke-width="1.4" stroke-linejoin="round"/>
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
  const burLiq = $("ti-burliq"), stopEl = $("ti-stop"), fliq = $("ti-fliq"), flask = $("ti-flask");
  const pip = $("ti-pip"), pipLiq = $("ti-pipliq"), dropper = $("ti-dropper"), stream = $("ti-stream"), drop = $("ti-drop"), idrops = $("ti-idrops");
  (function ticks() {
    let h = "";
    for (let m = 0; m <= 50; m++) {
      const y = BUR_Y0 + BUR_K * m, long = m % 5 === 0, w = long ? 11 : 6;
      h += `<line x1="137" x2="${137 + w}" y1="${y}" y2="${y}" stroke="#334155" stroke-width="${long ? 1.2 : .8}"/>`;
      if (m % 10 === 0) h += `<text x="151" y="${y + 3}" font-size="8.5" font-weight="700" fill="#1e293b">${m}</text>`;
    }
    $("ti-ticks").innerHTML = h;
  })();

  /* ---------- Сцена ---------- */
  function sceneReset() {
    burLiq.style.transform = "translateY(230px)";
    stopEl.classList.remove("open");
    fliq.style.transform = "scaleY(0)";
    fliq.style.fill = css(WATER); fliq.style.fillOpacity = WATER[3];
    pipLiq.style.transform = "translateY(0)";
    pip.classList.remove("in"); dropper.classList.remove("in");
    stream.setAttribute("opacity", 0); drop.setAttribute("opacity", 0);
    idrops.innerHTML = "";
    meterV.textContent = "—";
  }
  function volume() { return (S.r - S.v0) / 100; }
  function setMeter() { meterV.textContent = fmt(S.r / 100, 2) + " mL"; }
  function setBur() { burLiq.style.transform = `translateY(${(BUR_K * S.r / 100).toFixed(2)}px)`; setMeter(); }
  function setFlaskColor() {
    let c = WATER;
    if (S.prep.ind && S.picked !== null) c = indColor(S.sys.inds[S.picked], S.sys.curve(S.ca, Math.max(0, volume())));
    fliq.style.fill = css(c); fliq.style.fillOpacity = c[3];
  }
  function fall(color, x0, y0, y1, dur, parent) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x0); c.setAttribute("cy", y0); c.setAttribute("r", 2.8); c.setAttribute("fill", color);
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
    const s = S.sys;
    secTask.innerHTML = "";
    secTask.appendChild(el("h4", "", "Задача: " + s.label));
    const p = el("p", "");
    p.innerHTML = `Во ерленмаер има <b>${fmt(VA, 2)} mL</b> ${s.sample} со непозната концентрација. Титрирај го со <b>${s.titrant}</b>, c = <b>${fmt(s.ct, s.ctDec)} mol/L</b>. ${s.data}`;
    const eq = el("div", "in-eq strong", s.eq);
    const todo = el("ol", "ti-todo");
    ["Избери соодветен индикатор.", "Подготви го ерленмаерот и биретата, па титрирај (барем две титрации).", "Пресметај ја концентрацијата на аналитот."].forEach(t => todo.appendChild(el("li", "", t)));
    secTask.append(p, eq, todo);
  }

  /* --- индикатор --- */
  let chartBox, indMsg, indCards = [], helpBtn;
  function renderInd() {
    const s = S.sys;
    secInd.innerHTML = "";
    indCards = [];
    secInd.appendChild(el("h4", "", "1. Избери индикатор"));
    secInd.appendChild(el("p", "in-hint", `Индикаторот треба да ја менува бојата во областа на скокот на ${s.sig.name} околу еквивалентната точка. Одбери индикатор, па провери.`));
    const grid = el("div", "ti-inds");
    s.inds.forEach((ind, i) => {
      const b = el("button", "ti-ind");
      b.type = "button";
      const sw = el("span", "ti-sw");
      let cols = ind.c.map(c => (c === WATER ? "rgb(235,240,245)" : css(c)));
      if (s.dir < 0) cols = cols.slice().reverse();
      sw.style.background = "linear-gradient(90deg, " + cols.join(",") + ")";
      const ch = s.dir > 0 ? ind.ch[0] + " → " + ind.ch[1] : ind.ch[1] + " → " + ind.ch[0];
      b.append(sw, el("span", "ti-in-n", ind.name), el("span", "ti-in-r", `${s.sig.name} ${fmt(ind.lo, rdec(s, ind))} – ${fmt(ind.hi, rdec(s, ind))}${s.sig.unit}`), el("span", "ti-in-c", ch));
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
    helpBtn = btn("💡 Помош: покажи ја кривата на титрација", "btn ghost", drawChart);
    row.append(chk, helpBtn);
    indMsg = el("div", "in-feedback");
    chartBox = el("div", "ti-chartbox");
    secInd.append(grid, row, indMsg, chartBox);
  }
  function drawChart() {
    const ind = S.picked !== null ? S.sys.inds[S.picked] : null;
    chartBox.innerHTML = chartSVG(ind);
    chartBox.appendChild(el("p", "in-hint", "Крива на титрација (" + S.sys.sig.name + " во зависност од додадениот волумен). Обоената лента е интервалот на промена на бојата на индикаторот, а точката покажува каде би завршила титрацијата."));
  }
  function checkInd() {
    if (S.picked === null) { indMsg.innerHTML = ""; indMsg.appendChild(el("p", "in-fb-bad", "Прво избери индикатор.")); return; }
    if (S.passed) return;
    const s = S.sys, ind = s.inds[S.picked], ev = evalInd(s, S.ca, ind);
    S.ev = ev; S.tries++;
    drawChart();
    indMsg.innerHTML = "";
    const d2 = s.sig.dec;
    const pj = `${fmt(ev.jlo, d2)} – ${fmt(ev.jhi, d2)}${s.sig.unit}`;
    const base = `Скокот на ${s.sig.name} околу еквивалентната точка е приближно ${pj} (во еквивалентната точка ${s.sig.name} ≈ ${fmt(ev.peq, d2)}${s.sig.unit}). ${s.eqnote}`;
    const range = `${ind.name} ја менува бојата во интервал ${s.sig.name} ${fmt(ind.lo, rdec(s, ind))} – ${fmt(ind.hi, rdec(s, ind))}${s.sig.unit}.`;
    const sgn = ev.err > 0 ? "+" : "−", ae = Math.abs(ev.err);
    if (ev.cls === "good") {
      indMsg.appendChild(el("p", "in-fb-ok", `✔ Соодветен избор. ${range} Грешката на титрација е занемарлива (≈ ${fmt(ae, 2)} %). ${base}`));
      S.passed = true;
    } else if (ev.cls === "part") {
      indMsg.appendChild(el("p", "in-fb-ok", `✔ Прифатлив избор, но не најдобар. ${range} Бојата се менува малку ${ev.err < 0 ? "пред" : "по"} еквивалентната точка, па ќе има мала систематска грешка (≈ ${sgn}${fmt(ae, 2)} %). ${base} Можеш да продолжиш или да пробаш подобар индикатор.`));
      S.passed = true;
    } else {
      indMsg.appendChild(el("p", "in-fb-bad", `✘ Несоодветен избор. ${range} Тоа е ${ev.err < 0 ? "пред" : "по"} еквивалентната точка: титрацијата би завршила со грешка од ≈ ${sgn}${fmt(ae, 1)} %. ${base} Пробај со друг индикатор.`));
    }
    if (S.passed) {
      indCards.forEach(c => (c.disabled = true));
      secLab.hidden = false;
      renderLab();
    }
  }
  function chartSVG(ind) {
    const s = S.sys, g = s.sig;
    const W = 330, H = 236, L = 40, R = 12, T = 12, B = 32;
    const ve = s.veq(S.ca), vmax = Math.ceil(ve * 1.6 / 5) * 5;
    const X = v => L + (W - L - R) * v / vmax, Y = p => T + (H - T - B) * (1 - (p - g.ymin) / (g.ymax - g.ymin));
    const clampP = p => Math.max(g.ymin, Math.min(g.ymax, p));
    let h = `<svg class="ti-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Крива на титрација">`;
    for (let p = g.ymin; p <= g.ymax + 1e-9; p += g.step) h += `<line class="in-grid" x1="${L}" x2="${W - R}" y1="${Y(p)}" y2="${Y(p)}"/><text class="in-tick" x="${L - 5}" y="${Y(p) + 3}" text-anchor="end">${fmt(p, g.step < 1 ? 1 : 0)}</text>`;
    const step = vmax > 40 ? 10 : 5;
    for (let v = 0; v <= vmax; v += step) h += `<line class="in-grid" x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${H - B}"/><text class="in-tick" x="${X(v)}" y="${H - B + 12}" text-anchor="middle">${v}</text>`;
    if (ind) {
      const c = indColor(ind, ind.hi);
      const y1 = Y(clampP(ind.hi)), y2 = Y(clampP(ind.lo));
      h += `<rect x="${L}" y="${y1}" width="${W - L - R}" height="${Math.max(2, y2 - y1)}" fill="${css(c)}" fill-opacity=".4"/>`;
      h += `<text class="in-tick" x="${W - R - 4}" y="${y1 + 10}" text-anchor="end" font-weight="700">${ind.name}</text>`;
    }
    h += `<line class="in-mark" x1="${X(ve)}" x2="${X(ve)}" y1="${T}" y2="${H - B}"/>`;
    h += `<text class="in-tick" x="${X(ve) + 3}" y="${T + 9}">Veq = ${fmt(ve, 1)} mL</text>`;
    let d = "";
    const n = 260;
    for (let i = 0; i <= n; i++) {
      const v = vmax * i / n;
      d += (i ? "L" : "M") + X(v).toFixed(1) + " " + Y(clampP(s.curve(S.ca, v))).toFixed(1);
    }
    h += `<path class="in-curve" d="${d}"/>`;
    if (ind) {
      const vk = Vat(s, S.ca, pk(ind));
      h += `<circle cx="${X(vk)}" cy="${Y(clampP(pk(ind)))}" r="4.5" fill="#c2410c" stroke="#fff" stroke-width="1.5"/>`;
    }
    h += `<text class="in-axl" x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle">V(${s.tshort}) / mL</text>`;
    h += `<text class="in-axl" transform="translate(10 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle">${g.axis}</text>`;
    return h + "</svg>";
  }

  /* --- лабораторија --- */
  let stepBtns = {}, ctlBox, runMsg, runTable, finBtn, restartBtn, nextBtn, dispBtns = [];
  function renderLab() {
    const ind = S.sys.inds[S.picked];
    secLab.innerHTML = "";
    stepBtns = {}; dispBtns = [];
    secLab.appendChild(el("h4", "", "2. Титрација"));
    secLab.appendChild(el("p", "in-hint", "Следи ги чекорите по ред. Првата титрација може да ти биде ориентациона (додавај од титрантот побрзо); во следните при крајот титрирај капка по капка."));
    const sb = el("div", "in-stepbtns");
    stepBtns.pip = btn("① Со одмерна пипета пренеси 25,00 mL од растворот на аналитот во ерленмаерот", "btn", doPip);
    stepBtns.ind = btn(ind.self ? "② Закиселување со разредена H₂SO₄" : "② Додај 2–3 капки индикатор", "btn", doInd);
    stepBtns.fill = btn("③ Наполни ја биретата со титрант", "btn", doFill);
    sb.append(stepBtns.pip, stepBtns.ind, stepBtns.fill);
    ctlBox = el("div", "ti-ctl"); ctlBox.hidden = true;
    ctlBox.appendChild(el("p", "in-hint", "Отвори ја славината на биретата и додавај титрант (ерленмаерот го мешаш со кружни движења). Следи ја бојата на растворот."));
    const row = el("div", "in-row");
    [["+2,00 mL", 200], ["+0,50 mL", 50], ["+0,20 mL", 20], ["1 капка (0,05 mL)", 5]].forEach(d => {
      const b = btn(d[0], "btn ghost", () => dispense(d[1]));
      dispBtns.push(b); row.appendChild(b);
    });
    const row2 = el("div", "in-row");
    finBtn = btn("⏹ Крај на титрација (запиши)", "btn", endRun);
    restartBtn = btn("↺ Започни одново (нов ерленмаер)", "btn ghost", () => { if (S.prep.fill) prepareRun(); });
    row2.append(finBtn, restartBtn);
    runMsg = el("p", "in-msg");
    ctlBox.append(row, row2, runMsg);
    runTable = el("div", "ti-runs");
    nextBtn = btn("➕ Нова паралелна титрација", "btn", prepareRun);
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
    later(() => { pipLiq.style.transform = "translateY(206px)"; fliq.style.transform = "scaleY(1)"; }, 700);
    later(() => { pip.classList.remove("in"); }, 2100);
    later(() => { S.prep.pip = true; S.busy = false; updateSteps(); }, 2600);
  }
  function doInd() {
    if (S.busy || S.prep.ind || !S.prep.pip) return;
    S.busy = true; updateSteps();
    const ind = S.sys.inds[S.picked];
    const init = S.sys.dir > 0 ? ind.c[0] : ind.c[ind.c.length - 1];
    const col = ind.self ? "rgb(150,190,215)" : css(init === WATER ? ind.c[3] : init);
    dropper.classList.add("in");
    for (let i = 0; i < 3; i++) later(() => fall(col, 150, 342, 408, 380, idrops), 700 + i * 420);
    later(() => { S.prep.ind = true; S.v0 = S.r = 0; setFlaskColor(); }, 1900);
    later(() => dropper.classList.remove("in"), 2300);
    later(() => { S.busy = false; updateSteps(); }, 2800);
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
    const s = S.sys, ind = s.inds[S.picked], V = volume(), p = s.curve(S.ca, V);
    const changed = s.dir > 0 ? p >= pk(ind) : p <= pk(ind);
    if (!changed) { runMsg.textContent = "Бојата уште не се променила трајно. Продолжи со додавање титрант."; runMsg.className = "in-msg warn"; return; }
    const vis = Vat(s, S.ca, pk(ind)), over = V - vis;
    let note = "добро";
    if (over > 0.30) note = `претитрирано (≈ +${fmt(over, 2)} mL)`;
    else if (over > 0.12) note = `малку претитрирано (≈ +${fmt(over, 2)} mL)`;
    S.runs.push({ start: S.v0 / 100, end: S.r / 100, cons: V, note });
    S.active = false;
    runMsg.textContent = over > 0.12 ? "Запишано. Ја помина завршната точка: следниот пат додавај по капка кога бојата почнува да се менува." : "Запишано. Добро определена завршна точка!";
    runMsg.className = over > 0.12 ? "in-msg warn" : "in-msg ok";
    nextBtn.hidden = S.runs.length >= 5;
    updateSteps(); renderRuns(); renderCalc();
  }
  function prepareRun() {
    if (S.busy) return;
    S.v0 = S.r = randStart();
    burLiq.style.transition = reduce ? "none" : "transform 1.2s ease-in-out";
    setBur(); fliq.style.transform = "scaleY(1)"; setFlaskColor();
    S.active = true; nextBtn.hidden = true;
    runMsg.textContent = `Нов ерленмаер со индикатор, биретата е дополнета. Почетно отчитување: ${fmt(S.v0 / 100, 2)} mL.`; runMsg.className = "in-msg";
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
  function renderCalc() {
    const s = S.sys;
    secCalc.innerHTML = "";
    if (S.runs.length < 2) { secCalc.hidden = true; return; }
    secCalc.hidden = false;
    secCalc.appendChild(el("h4", "", "3. Пресметка"));
    const avg = bestAvg();
    if (!avg) {
      secCalc.appendChild(el("p", "in-fb-bad", "Повторените титрации се разликуваат за повеќе од 0,10 mL. Направи уште една титрација (внимателно, капка по капка при крајот)."));
      return;
    }
    secCalc.appendChild(el("p", "in-hint", `Користи ги резултатите од титрациите што се согласуваат (разлика ≤ 0,10 mL). Стехиометрија: ${s.stoich}. Затоа c(${s.sym}) = ${nuText(s.nu)}c(${s.tshort}) · V(${s.tshort}) / V(аналит).`));
    const fields = el("div", "in-fields");
    const l1 = el("label", "", "Просечна потрошувачка V(" + s.tshort + "), mL");
    const i1 = el("input", "calc-num"); i1.type = "text"; i1.inputMode = "decimal"; i1.autocomplete = "off";
    l1.appendChild(i1);
    const l2 = el("label", "", `Концентрација c(${s.sym}), mol/L`);
    const i2 = el("input", "calc-num"); i2.type = "text"; i2.inputMode = "decimal"; i2.autocomplete = "off";
    l2.appendChild(i2);
    fields.append(l1, l2);
    const fb = el("div", "in-feedback");
    const row = el("div", "in-row");
    const num = x => { const v = parseFloat(String(x).trim().replace(",", ".")); return isFinite(v) ? v : NaN; };
    const expOf = () => s.nu * s.ct * avg.avg / VA;
    const chk = btn("✔ Провери", "btn", () => {
      fb.innerHTML = "";
      i1.classList.remove("bad"); i2.classList.remove("bad");
      const v1 = num(i1.value), v2 = num(i2.value), exp = expOf();
      let ok = true;
      if (!(Math.abs(v1 - avg.avg) <= 0.03)) { ok = false; i1.classList.add("bad"); fb.appendChild(el("p", "in-fb-bad", "Сердната вредност од потрошените волумени од титрациите што се согласуваат не е точен. Собери ги потрошените волумени од титрантот и подели со бројот на титрации.")); }
      if (!(Math.abs(v2 - exp) / exp <= 0.01)) { ok = false; i2.classList.add("bad"); fb.appendChild(el("p", "in-fb-bad", `Концентрацијата не е точна. Потсетување: ${s.stoich}, па c(${s.sym}) = ${nuText(s.nu)}c(${s.tshort}) · V(${s.tshort}) / V(аналит).`)); }
      if (!ok) return;
      const err = (exp - S.ca) / S.ca * 100;
      fb.appendChild(el("p", "in-fb-ok", `✔ Точно! c(${s.sym}) = ${fmt(exp, 4)} mol/L.`));
      fb.appendChild(el("div", "in-eq strong", `Вистинска вредност: ${fmt(S.ca, 4)} mol/L · релативна грешка: ${err >= 0 ? "+" : "−"}${fmt(Math.abs(err), 2)} %`));
      let verdict;
      if (Math.abs(err) <= 0.5) verdict = "Одлична прецизност и точност.";
      else if (Math.abs(err) <= 1.5) verdict = "Добар резултат. Малата разлика потекнува од индикаторот или од определувањето на завршната точка на титрацијата.";
      else verdict = "Грешката е поголема од очекуваното: најверојатно си ја поминал/а завршната точка (претитрирање) или индикаторот не е најсоодветен.";
      fb.appendChild(el("p", "in-msg", verdict));
      secQ.hidden = false;
    });
    const sol = btn("🧮 Покажи ја пресметката", "btn ghost", () => {
      const exp = expOf();
      fb.innerHTML = "";
      fb.append(el("div", "in-eq", `V(просек) = ${fmt(avg.avg, 2)} mL`),
        el("div", "in-eq strong", `c(${s.sym}) = ${nuText(s.nu)}${fmt(s.ct, s.ctDec)} · ${fmt(avg.avg, 2)} / ${fmt(VA, 2)} = ${fmt(exp, 4)} mol/L`));
    });
    row.append(chk, sol);
    secCalc.append(fields, row, fb);
  }
  function nuText(n) { return n === 1 ? "" : n === 0.5 ? "½ · " : n + " · "; }

  /* --- прашања --- */
  function renderQ() {
    secQ.innerHTML = "";
    secQ.appendChild(el("h4", "", "Прашања"));
    const qa = (S.sys.qa || []).concat([
      ["Зошто се додаваат само неколку капки индикатор?", "Самиот индикатор е хемиско соединение и троши малку од титрантот. Многу индикатор би внесол грешка."],
      ["Зошто при крајот титрантот се додава капка по капка?", "Околу еквивалентната точка сигналот (pH, pM, pAg или E) се менува нагло: една капка (≈ 0,05 mL) може да ја надмине завршната точка."],
      ["Што значи еквивалентна точка, а што завршна точка на титрацијата?", "Еквивалентната точка е теоретската точка кога реактантите реагираат во стехиометриски однос. Завршна точка е моментот кога индикаторот ја менува бојата. Разликата меѓу нив е грешката на титрацијата."],
      ["Зошто се прават барем две паралелни титрации?", "За да се провери дали резултатите се согласуваат (разлика ≤ 0,10 mL) и да се намали случајната грешка со пресметување средна вредност."]
    ]);
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
  window.__titracija = { indColor, css, SYS, evalInd, Vat, getS: () => S, start };
})();
