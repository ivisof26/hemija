// Масена спектрометрија: вежби за решавање масени спектри (EI, 70 eV).
// Спектрите се составени за вежбање: m/z се пресметуваат од формулите (номинални маси),
// изотопските групи (Cl, Br, S, 13C...) се пресметуваат, а релативните интензитети се ориентациони.
(function () {
  "use strict";

  // ---------- изотопи (номинална маса -> удел) ----------
  const ISO = {
    C: { m: 12, p: [[0, 98.93], [1, 1.07]] },
    H: { m: 1, p: [[0, 99.9885], [1, 0.0115]] },
    N: { m: 14, p: [[0, 99.636], [1, 0.364]] },
    O: { m: 16, p: [[0, 99.757], [1, 0.038], [2, 0.205]] },
    S: { m: 32, p: [[0, 94.99], [1, 0.75], [2, 4.25], [4, 0.01]] },
    F: { m: 19, p: [[0, 100]] },
    Cl: { m: 35, p: [[0, 75.78], [2, 24.22]] },
    Br: { m: 79, p: [[0, 50.69], [2, 49.31]] },
    I: { m: 127, p: [[0, 100]] }
  };

  function parseF(f) {
    const c = {}, re = /([A-Z][a-z]?)(\d*)/g;
    let m;
    while ((m = re.exec(f))) { if (!m[1]) continue; c[m[1]] = (c[m[1]] || 0) + (m[2] ? +m[2] : 1); }
    return c;
  }
  const nomMass = c => Object.keys(c).reduce((s, e) => s + ISO[e].m * c[e], 0);

  // изотопска група: {офсет: релативен интензитет (монoизотопен = 100)}
  const patCache = {};
  function pattern(f) {
    if (patCache[f]) return patCache[f];
    const c = parseF(f);
    let cur = { 0: 1 };
    for (const e in c) {
      for (let i = 0; i < c[e]; i++) {
        const nx = {};
        for (const k in cur) for (const [d, p] of ISO[e].p) { const o = +k + d; nx[o] = (nx[o] || 0) + cur[k] * p / 100; }
        cur = nx;
      }
    }
    const base = cur[0], out = {};
    for (const k in cur) out[k] = cur[k] / base * 100;
    return (patCache[f] = out);
  }

  // ---------- податоци ----------
  // [формула, интензитет на монoизотопниот пик, структура (по избор), загубена честичка (по избор)]
  const M_ = (f, i) => [f, i, "M⁺• (молекулски јон)"];
  const D = [
    { id: "etanol", n: "етанол", f: "C2H6O", cl: "алкохол",
      fr: [M_("C2H6O", 45), ["C2H5O", 50, "CH3CH=OH⁺", "H•"], ["CH3O", 100, "CH2=OH⁺", "CH3•"], ["C2H5", 30, "C2H5⁺", "OH•"], ["C2H3", 25, "C2H3⁺"]],
      note: "Основниот пик на m/z 31 (CH2=OH⁺) се добива со α-кинување и е типичен за примарни алкохоли." },
    { id: "metanol", n: "метанол", f: "CH4O", cl: "алкохол",
      fr: [M_("CH4O", 70), ["CH3O", 100, "CH2=OH⁺", "H•"], ["CHO", 65, "HC≡O⁺"], ["CH3", 15, "CH3⁺", "OH•"]],
      note: "Пикот на m/z 31 е CH2=OH⁺ (губење на H•), а m/z 29 е HCO⁺." },
    { id: "propan1ol", n: "пропан-1-ол", f: "C3H8O", cl: "алкохол",
      fr: [M_("C3H8O", 7), ["C3H7O", 12, "[M−H]⁺", "H•"], ["C3H6", 20, "C3H6⁺•", "H2O"], ["CH3O", 100, "CH2=OH⁺", "C2H5•"], ["C2H5", 25, "C2H5⁺"], ["C3H5", 15, "C3H5⁺"]],
      note: "Примарен алкохол: основен пик 31 (CH2=OH⁺) и слаб M⁺•; се гледа и M−18 (губење на вода)." },
    { id: "propan2ol", n: "пропан-2-ол", f: "C3H8O", cl: "алкохол",
      fr: [M_("C3H8O", 5), ["C3H7O", 10, "[M−H]⁺", "H•"], ["C2H5O", 100, "CH3CH=OH⁺", "CH3•"], ["C2H3", 15, "C2H3⁺"], ["CH3", 5, "CH3⁺"]],
      note: "Секундарен алкохол: α-кинувањето ја губи метил-групата, па основен пик е m/z 45 (а не 31 како кај пропан-1-ол)." },
    { id: "dietileter", n: "диетил-етер", f: "C4H10O", cl: "етер",
      fr: [M_("C4H10O", 20), ["C3H7O", 35, "C3H7O⁺", "CH3•"], ["C2H5O", 15, "C2H5O⁺", "C2H5•"], ["CH3O", 100, "CH2=OH⁺", "C3H7•"], ["C2H5", 45, "C2H5⁺", "C2H5O•"]],
      note: "Кај етерите доминира α-кинување и кинување на C–O врската; m/z 31 и 29 се типични." },
    { id: "aceton", n: "пропанон (ацетон)", f: "C3H6O", cl: "кетон",
      fr: [M_("C3H6O", 35), ["C2H3O", 100, "CH3C≡O⁺ (ацетил)", "CH3•"], ["CH3", 15, "CH3⁺", "CH3CO•"]],
      note: "α-кинување на кетонот дава ацетил-јон на m/z 43 (основен пик) и губење на CH3• (M−15)." },
    { id: "butanon", n: "бутан-2-он", f: "C4H8O", cl: "кетон",
      fr: [M_("C4H8O", 25), ["C3H5O", 7, "C2H5CO⁺", "CH3•"], ["C2H3O", 100, "CH3C≡O⁺ (ацетил)", "C2H5•"], ["C2H5", 25, "C2H5⁺", "CH3CO•"], ["C2H3", 10, "C2H3⁺"]],
      note: "Двете α-кинувања: губење на C2H5• дава 43 (основен), а губење на CH3• дава 57 (послаб)." },
    { id: "pentan2on", n: "пентан-2-он", f: "C5H10O", cl: "кетон",
      fr: [M_("C5H10O", 30), ["C4H7O", 20, "C3H7CO⁺", "CH3•"], ["C3H6O", 22, "McLafferty: CH2=C(OH)CH3⁺•", "C2H4"], ["C2H3O", 100, "CH3C≡O⁺ (ацетил)", "C3H7•"]],
      note: "Пикот на m/z 58 е од преуредување на McLafferty (γ-водород, губење на алкен C2H4); основен е ацетил-јонот 43." },
    { id: "pentan3on", n: "пентан-3-он", f: "C5H10O", cl: "кетон",
      fr: [M_("C5H10O", 30), ["C3H5O", 100, "C2H5CO⁺", "C2H5•"], ["C2H5", 40, "C2H5⁺", "C2H5CO•"], ["C2H3", 30, "C2H3⁺"]],
      note: "Симетричен кетон: α-кинување ја губи етил-групата, па основен пик е m/z 57 (C2H5CO⁺). Нема пик на m/z 43 како кај пентан-2-он." },
    { id: "octena", n: "етанска (оцетна) киселина", f: "C2H4O2", cl: "карбоксилна киселина",
      fr: [M_("C2H4O2", 70), ["C2H3O", 100, "CH3C≡O⁺", "OH•"], ["CHO2", 90, "COOH⁺", "CH3•"], ["CH3", 20, "CH3⁺"]],
      note: "Киселината ги дава јоните 43 (M−OH) и 45 (COOH⁺); M⁺• е на m/z 60." },
    { id: "etilacetat", n: "етил-етаноат (етил-ацетат)", f: "C4H8O2", cl: "естер",
      fr: [M_("C4H8O2", 10), ["C4H6O", 12, "M−H2O", "H2O"], ["C2H5O2", 12, "CH3C(OH)2⁺ (преуредување)"], ["C2H3O", 100, "CH3C≡O⁺ (ацетил)", "C2H5O•"], ["C2H5O", 12, "C2H5O⁺", "CH3CO•"], ["C2H5", 25, "C2H5⁺"]],
      note: "Ацетил-јонот 43 е основен пик кај ацетатите; M⁺• е слаб." },
    { id: "butan", n: "бутан", f: "C4H10", cl: "алкан",
      fr: [M_("C4H10", 14), ["C3H7", 100, "C3H7⁺", "CH3•"], ["C3H6", 28, "C3H6⁺•"], ["C3H5", 28, "C3H5⁺"], ["C2H5", 40, "C2H5⁺", "C2H5•"], ["C2H4", 26, "C2H4⁺•"], ["C2H3", 20, "C2H3⁺"]],
      note: "Алканите даваат групи пикови што се разликуваат за 14 (CH2): 29, 43, 57…" },
    { id: "heksan", n: "хексан", f: "C6H14", cl: "алкан",
      fr: [M_("C6H14", 25), ["C5H11", 5, "C5H11⁺", "CH3•"], ["C4H9", 100, "C4H9⁺", "C2H5•"], ["C4H8", 55, "C4H8⁺•"], ["C3H7", 72, "C3H7⁺"], ["C3H6", 35, "C3H6⁺•"], ["C3H5", 75, "C3H5⁺"], ["C2H5", 45, "C2H5⁺"], ["C2H3", 30, "C2H3⁺"]],
      note: "Низа пикови 29, 43, 57, 71 (разлика 14) е типична за незаситени алкани со права низа." },
    { id: "cikloheksan", n: "циклохексан", f: "C6H12", cl: "циклоалкан",
      fr: [M_("C6H12", 62), ["C5H9", 24, "C5H9⁺", "CH3•"], ["C4H8", 100, "C4H8⁺•", "C2H4"], ["C4H7", 35, "C4H7⁺"], ["C3H6", 28, "C3H6⁺•"], ["C3H5", 60, "C3H5⁺"]],
      note: "Циклоалканите имаат силен M⁺•; основниот пик 56 доаѓа од губење на етен (C2H4)." },
    { id: "benzen", n: "бензен", f: "C6H6", cl: "арен",
      fr: [M_("C6H6", 100), ["C6H5", 18, "C6H5⁺ (фенил)", "H•"], ["C4H4", 20, "C4H4⁺•"], ["C4H3", 18, "C4H3⁺"], ["C3H3", 12, "C3H3⁺"]],
      note: "Ароматичните соединенија имаат многу стабилен, силен M⁺•; чест фрагмент е 77 (C6H5⁺) и 51 (C4H3⁺)." },
    { id: "toluen", n: "метилбензен (толуен)", f: "C7H8", cl: "арен",
      fr: [M_("C7H8", 68), ["C7H7", 100, "C7H7⁺ (тропилиум)", "H•"], ["C5H5", 12, "C5H5⁺"], ["C3H3", 10, "C3H3⁺"]],
      note: "Алкилбензените дават тропилиумов јон на m/z 91 (C7H7⁺), најчесто основен пик." },
    { id: "etilbenzen", n: "етилбензен", f: "C8H10", cl: "арен",
      fr: [M_("C8H10", 30), ["C7H7", 100, "C7H7⁺ (тропилиум)", "CH3•"], ["C6H5", 8, "C6H5⁺ (фенил)"], ["C5H5", 8, "C5H5⁺"], ["C4H3", 10, "C4H3⁺"]],
      note: "Бензилното кинување го губи CH3•, па основен пик е тропилиумот 91; M⁺• е на 106." },
    { id: "stiren", n: "етенилбензен (стирен)", f: "C8H8", cl: "арен",
      fr: [M_("C8H8", 100), ["C8H7", 30, "[M−H]⁺", "H•"], ["C6H6", 30, "C6H6⁺•"], ["C6H5", 12, "C6H5⁺ (фенил)"], ["C4H3", 20, "C4H3⁺"]],
      note: "Конјугираниот систем дава силен M⁺• (104) како основен пик." },
    { id: "naftalen", n: "нафталин", f: "C10H8", cl: "арен",
      fr: [M_("C10H8", 100), ["C10H7", 12, "[M−H]⁺", "H•"], ["C8H6", 8, "C8H6⁺•"], ["C9H6", 6, "C9H6⁺•"]],
      note: "Полициклични арени: екстремно стабилен M⁺• (128) и малку фрагменти." },
    { id: "hlorobenzen", n: "хлоробензен", f: "C6H5Cl", cl: "халоарен",
      fr: [M_("C6H5Cl", 100), ["C6H5", 35, "C6H5⁺ (фенил)", "Cl•"], ["C4H3", 12, "C4H3⁺"], ["C4H2", 22, "C4H2⁺•"]],
      note: "M⁺• е на 112 и M+2 на 114 (однос ≈ 3 : 1) — карактеристично за еден атом Cl; фрагментот на 77 нема Cl." },
    { id: "bromobenzen", n: "бромобензен", f: "C6H5Br", cl: "халоарен",
      fr: [M_("C6H5Br", 100), ["C6H5", 55, "C6H5⁺ (фенил)", "Br•"], ["C4H3", 15, "C4H3⁺"]],
      note: "M и M+2 (156 и 158) имаат речиси еднакви интензитети (≈ 1 : 1) — белег за еден атом Br." },
    { id: "hloroetan", n: "хлороетан", f: "C2H5Cl", cl: "халоалкан",
      fr: [M_("C2H5Cl", 100), ["CH2Cl", 23, "CH2Cl⁺", "CH3•"], ["C2H5", 65, "C2H5⁺", "Cl•"], ["C2H4", 42, "C2H4⁺•", "HCl"], ["C2H3", 55, "C2H3⁺"], ["C2H2", 25, "C2H2⁺•"]],
      note: "M⁺• на 64 е основен пик, а M+2 на 66 е 3 : 1 спрема него (еден Cl). Силни се и 29, 28 и 27; загубата на HCl (M−36) дава пик на 28." },
    { id: "bromoetan", n: "бромоетан", f: "C2H5Br", cl: "халоалкан",
      fr: [M_("C2H5Br", 90), ["C2H5", 100, "C2H5⁺", "Br•"], ["C2H4", 20, "C2H4⁺•", "HBr"], ["C2H3", 80, "C2H3⁺"], ["C2H2", 22, "C2H2⁺•"]],
      note: "Двоен пик 108/110 (≈ 1 : 1) укажува на еден Br; фрагментот на 29 (C2H5⁺) нема Br." },
    { id: "dihlorometan", n: "дихлорометан", f: "CH2Cl2", cl: "халоалкан",
      fr: [M_("CH2Cl2", 65), ["CH2Cl", 100, "CH2Cl⁺", "Cl•"], ["CCl", 18, "CCl⁺"]],
      note: "Два Cl: M, M+2 и M+4 во однос ≈ 9 : 6 : 1 (84, 86, 88)." },
    { id: "hloroform", n: "трихлорометан (хлороформ)", f: "CHCl3", cl: "халоалкан",
      fr: [M_("CHCl3", 5), ["CHCl2", 100, "CHCl2⁺", "Cl•"], ["CCl", 18, "CCl⁺"], ["CHCl", 12, "CHCl⁺•"]],
      note: "Три Cl: ≈ 27 : 27 : 9 : 1. M⁺• е многу слаб; основен пик е CHCl2⁺ (83, 85, 87)." },
    { id: "ccl4", n: "тетрахлорометан", f: "CCl4", cl: "халоалкан", noM: true,
      fr: [["CCl3", 100, "CCl3⁺"], ["CCl2", 20, "CCl2⁺•"], ["CCl", 20, "CCl⁺"]],
      note: "M⁺• (152) практично го нема; највисок m/z е CCl3⁺ (117, 119, 121, 123): групата 100 : 96 : 31 : 3 покажува три Cl." },
    { id: "acetofenon", n: "1-фенилетанон (ацетофенон)", f: "C8H8O", cl: "кетон",
      fr: [M_("C8H8O", 40), ["C7H5O", 100, "C6H5C≡O⁺ (бензоил)", "CH3•"], ["C6H5", 85, "C6H5⁺ (фенил)", "CH3CO•"], ["C4H3", 25, "C4H3⁺"], ["C2H3O", 15, "CH3C≡O⁺"]],
      note: "Бензоил-јонот 105 е основен; од него со губење на CO се добива фенил 77." },
    { id: "benzaldehid", n: "бензалдехид", f: "C7H6O", cl: "алдехид",
      fr: [M_("C7H6O", 100), ["C7H5O", 90, "C6H5C≡O⁺ (бензоил)", "H•"], ["C6H5", 85, "C6H5⁺ (фенил)", "CHO•"], ["C4H3", 45, "C4H3⁺"], ["C4H2", 30, "C4H2⁺•"]],
      note: "Алдехидите даваат силни M−1 (губење на H•) и M−29 (губење на CHO•)." },
    { id: "benzoevak", n: "бензоева киселина", f: "C7H6O2", cl: "карбоксилна киселина",
      fr: [M_("C7H6O2", 70), ["C7H5O", 100, "C6H5C≡O⁺ (бензоил)", "OH•"], ["C6H5", 55, "C6H5⁺ (фенил)", "COOH•"], ["C4H3", 20, "C4H3⁺"]],
      note: "M−17 (губење на OH•) дава бензоил 105; M−45 (губење на COOH•) дава фенил 77." },
    { id: "metilbenzoat", n: "метил-бензоат", f: "C8H8O2", cl: "естер",
      fr: [M_("C8H8O2", 45), ["C7H5O", 100, "C6H5C≡O⁺ (бензоил)", "OCH3•"], ["C6H5", 55, "C6H5⁺ (фенил)"], ["C4H3", 20, "C4H3⁺"]],
      note: "M−31 (губење на •OCH3) дава бензоил 105, основен пик на ароматичните естри." },
    { id: "fenol", n: "фенол", f: "C6H6O", cl: "фенол",
      fr: [M_("C6H6O", 100), ["C5H6", 30, "C5H6⁺•", "CO"], ["C5H5", 32, "C5H5⁺", "CHO•"], ["C3H3", 40, "C3H3⁺"]],
      note: "Фенолите се карактеризираат со M−28 (CO) и M−29 (CHO•)." },
    { id: "anilin", n: "анилин", f: "C6H7N", cl: "амин",
      fr: [M_("C6H7N", 100), ["C6H6N", 8, "[M−H]⁺", "H•"], ["C5H6", 30, "C5H6⁺•", "HCN"], ["C5H5", 12, "C5H5⁺"], ["C3H3", 10, "C3H3⁺"]],
      note: "Непарен M (93) укажува на непарен број атоми N (азотно правило); M−27 е губење на HCN." },
    { id: "acetonitril", n: "ацетонитрил", f: "C2H3N", cl: "нитрил",
      fr: [M_("C2H3N", 100), ["C2H2N", 25, "[M−H]⁺", "H•"], ["C2HN", 10, "C2HN⁺•"], ["C2N", 10, "C2N⁺"]],
      note: "Непарен M (41) → непарен број N. M⁺• е основен пик." },
    { id: "trimetilamin", n: "триметиламин", f: "C3H9N", cl: "амин",
      fr: [M_("C3H9N", 45), ["C3H8N", 100, "(CH3)2N⁺=CH2", "H•"], ["C2H6N", 10, "C2H6N⁺", "CH3•"], ["C2H4N", 25, "C2H4N⁺"]],
      note: "Непарен M (59) → еден N. Амините даваат силен [M−H]⁺ со α-кинување." },
    { id: "etantiol", n: "етантиол", f: "C2H6S", cl: "тиол",
      fr: [M_("C2H6S", 100), ["C2H5S", 15, "[M−H]⁺", "H•"], ["CH3S", 75, "CH2=SH⁺", "CH3•"], ["C2H5", 90, "C2H5⁺", "SH•"], ["CHS", 28, "CHS⁺"], ["C2H4", 33, "C2H4⁺•"], ["C2H3", 70, "C2H3⁺"]],
      note: "M⁺• (62) и C2H5⁺ (29) се најинтензивни; се гледаат и 47 (CH2=SH⁺) и 27. Сулфурот се препознава по M+2 од околу 4,4 % од M (изотоп 34S)." },
    { id: "metan", n: "метан", f: "CH4", cl: "алкан",
      fr: [M_("CH4", 100), ["CH3", 85, "CH3⁺", "H•"], ["CH2", 10, "CH2⁺•"], ["CH", 5, "CH⁺"]],
      note: "Најмала молекула: M⁺• (16) и [M−H]⁺ (15); пикови има и на 14 и 13." },
    { id: "etan", n: "етан", f: "C2H6", cl: "алкан",
      fr: [M_("C2H6", 26), ["C2H5", 22, "C2H5⁺", "H•"], ["C2H4", 100, "C2H4⁺•", "H2"], ["C2H3", 33, "C2H3⁺"], ["C2H2", 23, "C2H2⁺•"]],
      note: "Основен пик е 28 (C2H4⁺•, губење на H2); групата 26–30 се разликува за по еден H." },
    { id: "propan", n: "пропан", f: "C3H8", cl: "алкан",
      fr: [M_("C3H8", 26), ["C3H7", 22, "C3H7⁺", "H•"], ["C2H5", 100, "C2H5⁺", "CH3•"], ["C2H4", 60, "C2H4⁺•"], ["C2H3", 40, "C2H3⁺"]],
      note: "Основен пик 29 (C2H5⁺, M−15)." },
    { id: "pentan", n: "пентан", f: "C5H12", cl: "алкан",
      fr: [M_("C5H12", 12), ["C4H9", 30, "C4H9⁺", "CH3•"], ["C3H7", 100, "C3H7⁺", "C2H5•"], ["C3H6", 70, "C3H6⁺•"], ["C3H5", 60, "C3H5⁺"], ["C2H5", 40, "C2H5⁺"], ["C2H3", 40, "C2H3⁺"]],
      note: "Права низа: пикови 29, 43 (основен), 57 и слаб M⁺• (72)." },
    { id: "neopentan", n: "2,2-диметилпропан (неопентан)", f: "C5H12", cl: "алкан", noM: true,
      fr: [["C4H9", 100, "(CH3)3C⁺ (терцијарен јон)", "CH3•"], ["C3H5", 40, "C3H5⁺"], ["C2H5", 28, "C2H5⁺"], ["C2H3", 20, "C2H3⁺"]],
      note: "Силно разгранет алкан: M⁺• (72) го нема, а основен пик е терцијарниот јон на 57. Споредете со пентан." },
    { id: "oktan", n: "октан", f: "C8H18", cl: "алкан",
      fr: [M_("C8H18", 8), ["C6H13", 40, "C6H13⁺", "C2H5•"], ["C5H11", 28, "C5H11⁺", "C3H7•"], ["C5H10", 21, "C5H10⁺•"], ["C4H9", 50, "C4H9⁺", "C4H9•"], ["C4H8", 26, "C4H8⁺•"], ["C3H7", 100, "C3H7⁺"], ["C3H5", 38, "C3H5⁺"], ["C2H5", 30, "C2H5⁺"]],
      note: "Низа од 14 (29, 43, 57, 71, 85) е типична за алкани со права низа; M⁺• е слаб." },
    { id: "izooktan", n: "2,2,4-триметилпентан (изооктан)", f: "C8H18", cl: "алкан", noM: true,
      fr: [["C7H15", 5, "[M−CH3]⁺", "CH3•"], ["C4H9", 100, "(CH3)3C⁺ (терцијарен јон)"], ["C4H8", 30, "C4H8⁺•"], ["C3H7", 35, "C3H7⁺"], ["C3H5", 55, "C3H5⁺"]],
      note: "Разгранет алкан: M⁺• (114) го нема; основен пик е 57 (терцијарен бутил-јон)." },
    { id: "eten", n: "етен", f: "C2H4", cl: "алкен",
      fr: [M_("C2H4", 100), ["C2H3", 65, "C2H3⁺", "H•"], ["C2H2", 60, "C2H2⁺•", "H2"], ["C2H", 10, "C2H⁺"]],
      note: "M⁺• на 28 е основен пик; соседните пикови се разликуваат за по еден H." },
    { id: "propen", n: "пропен", f: "C3H6", cl: "алкен",
      fr: [M_("C3H6", 70), ["C3H5", 100, "CH2=CH–CH2⁺ (алил)", "H•"], ["C3H3", 40, "C3H3⁺"], ["C2H3", 30, "C2H3⁺", "CH3•"]],
      note: "Алкените даваат стабилен алилен јон (m/z 41) како основен пик." },
    { id: "cikloheksen", n: "циклохексен", f: "C6H10", cl: "циклоалкен",
      fr: [M_("C6H10", 45), ["C5H7", 100, "C5H7⁺", "CH3•"], ["C4H6", 80, "C4H6⁺• (ретро-Дилс–Алдер)", "C2H4"], ["C3H5", 30, "C3H5⁺"], ["C3H3", 34, "C3H3⁺"], ["C2H3", 18, "C2H3⁺"]],
      note: "Ретро-Дилс–Алдеровото преуредување го губи етенот (M−28) и дава јон на m/z 54." },
    { id: "etin", n: "етин (ацетилен)", f: "C2H2", cl: "алкин",
      fr: [M_("C2H2", 100), ["C2H", 20, "C2H⁺", "H•"]],
      note: "Многу едноставен спектар: основен пик M⁺• (26) и [M−H]⁺ (25)." },
    { id: "etanal", n: "етанал (ацеталдехид)", f: "C2H4O", cl: "алдехид",
      fr: [M_("C2H4O", 80), ["C2H3O", 45, "[M−H]⁺", "H•"], ["CHO", 100, "HC≡O⁺", "CH3•"], ["CH3", 15, "CH3⁺", "CHO•"]],
      note: "Алдехиди: M−1 (43) и HCO⁺ (29), кој е основен пик." },
    { id: "butanal", n: "бутанал", f: "C4H8O", cl: "алдехид",
      fr: [M_("C4H8O", 65), ["C3H5O", 24, "[M−CH3]⁺", "CH3•"], ["C3H7", 75, "C3H7⁺", "CHO•"], ["C2H4O", 100, "McLafferty: CH2=CHOH⁺•", "C2H4"], ["C3H5", 60, "C3H5⁺"], ["C2H5", 55, "C2H5⁺ / HCO⁺"], ["C2H3", 50, "C2H3⁺"]],
      note: "Изомер на бутан-2-он (M = 72). Основниот пик 44 доаѓа од McLafferty-ово преуредување на алдехидите." },
    { id: "hlorometan", n: "хлорометан", f: "CH3Cl", cl: "халоалкан",
      fr: [M_("CH3Cl", 100), ["CH2Cl", 10, "CH2Cl⁺", "H•"], ["CH3", 85, "CH3⁺", "Cl•"]],
      note: "M⁺• (50) и M+2 (52) во однос 3 : 1 (еден Cl); CH3⁺ (15) нема хлор." },
    { id: "bromometan", n: "бромометан", f: "CH3Br", cl: "халоалкан",
      fr: [M_("CH3Br", 100), ["CH2Br", 18, "CH2Br⁺", "H•"], ["CH3", 80, "CH3⁺", "Br•"]],
      note: "M⁺• и M+2 (94 и 96) се речиси еднакви (еден Br)." },
    { id: "jodometan", n: "јодометан", f: "CH3I", cl: "халоалкан",
      fr: [M_("CH3I", 100), ["CH2I", 12, "CH2I⁺", "H•"], ["I", 14, "I⁺", "CH3•"], ["CH3", 35, "CH3⁺", "I•"]],
      note: "Јодот има само еден стабилен изотоп (127), па нема M+2. Пикот на 127 (I⁺) е типичен." },
    { id: "hlorobutan", n: "1-хлоробутан", f: "C4H9Cl", cl: "халоалкан",
      fr: [M_("C4H9Cl", 5), ["C4H9", 15, "C4H9⁺", "Cl•"], ["C4H8", 100, "C4H8⁺•", "HCl"], ["C3H7", 35, "C3H7⁺"], ["C3H5", 55, "C3H5⁺"], ["C2H5", 35, "C2H5⁺"], ["C2H3", 30, "C2H3⁺"]],
      note: "Основен пик 56 (M−HCl); M⁺• (92) е слаб, но M+2 (94) се познава по односот 3 : 1." },
    { id: "dihloroetan", n: "1,2-дихлороетан", f: "C2H4Cl2", cl: "халоалкан",
      fr: [M_("C2H4Cl2", 30), ["C2H4Cl", 25, "C2H4Cl⁺", "Cl•"], ["C2H3Cl", 100, "C2H3Cl⁺•", "HCl"], ["CH2Cl", 40, "CH2Cl⁺"], ["C2H3", 45, "C2H3⁺"]],
      note: "Два Cl: M, M+2, M+4 ≈ 9 : 6 : 1 (98, 100, 102). Основен пик 62 е M−HCl." },
    { id: "jodobenzen", n: "јодобензен", f: "C6H5I", cl: "халоарен",
      fr: [M_("C6H5I", 100), ["C6H5", 80, "C6H5⁺ (фенил)", "I•"], ["C4H3", 32, "C4H3⁺"], ["C4H2", 18, "C4H2⁺•"]],
      note: "M⁺• на 204 без M+2 (јодот е моноизотопен); M−127 дава фенил 77." },
    { id: "nitrobenzen", n: "нитробензен", f: "C6H5NO2", cl: "нитро-соединение",
      fr: [M_("C6H5NO2", 80), ["C6H5O", 20, "C6H5O⁺", "NO•"], ["C6H5", 100, "C6H5⁺ (фенил)", "NO2•"], ["C5H5", 12, "C5H5⁺"], ["C4H3", 55, "C4H3⁺"]],
      note: "Нитро-групата се губи како NO2• (M−46) или NO• (M−30). Непарна M (123) = еден N." },
    { id: "benzilalk", n: "фенилметанол (бензил-алкохол)", f: "C7H8O", cl: "алкохол",
      fr: [M_("C7H8O", 85), ["C7H7O", 65, "[M−H]⁺", "H•"], ["C6H7", 100, "C6H7⁺", "CHO•"], ["C6H5", 55, "C6H5⁺ (фенил)"], ["C4H3", 15, "C4H3⁺"]],
      note: "Изомер на анизолот (M = 108). Бензил-алкохолот ги дава M−1 (107) и основен пик 79 (M−CHO)." },
    { id: "anizol", n: "метоксибензен (анизол)", f: "C7H8O", cl: "етер",
      fr: [M_("C7H8O", 100), ["C6H5O", 14, "C6H5O⁺", "CH3•"], ["C6H6", 57, "C6H6⁺•", "CH2O"], ["C6H5", 18, "C6H5⁺ (фенил)", "OCH3•"], ["C5H5", 65, "C5H5⁺"], ["C4H3", 19, "C4H3⁺"], ["C3H3", 34, "C3H3⁺"]],
      note: "Арил-метил-етер: M−15 (93) и M−30 (78, губење на формалдехид CH2O)." },
    { id: "benzonitril", n: "бензонитрил", f: "C7H5N", cl: "нитрил",
      fr: [M_("C7H5N", 100), ["C7H4N", 8, "[M−H]⁺", "H•"], ["C6H4", 45, "C6H4⁺•", "HCN"], ["C6H3", 19, "C6H3⁺"], ["C4H3", 27, "C4H3⁺"], ["C4H2", 40, "C4H2⁺•"]],
      note: "Непарна M (103) → еден N; типично M−27 (HCN)." },
    { id: "piridin", n: "пиридин", f: "C5H5N", cl: "хетероцикл",
      fr: [M_("C5H5N", 100), ["C4H4", 70, "C4H4⁺•", "HCN"], ["C4H3", 28, "C4H3⁺"], ["C4H2", 20, "C4H2⁺•"]],
      note: "Ароматичен азотен хетероцикл: M⁺• на 79 и M−27 (HCN) на 52." },
    { id: "dietilamin", n: "диетиламин", f: "C4H11N", cl: "амин",
      fr: [M_("C4H11N", 29), ["C4H10N", 17, "[M−H]⁺", "H•"], ["C3H8N", 100, "CH2=N⁺H–C2H5", "CH3•"], ["C2H6N", 29, "C2H6N⁺"], ["CH4N", 80, "CH2=NH2⁺", "C3H7•"]],
      note: "α-кинување кај амините: најголемата алкил-група што не се губи го дава основниот пик 58. Непарна M (73) = еден N." },
    { id: "propilamin", n: "пропан-1-амин (пропиламин)", f: "C3H9N", cl: "амин",
      fr: [M_("C3H9N", 10), ["C3H8N", 8, "[M−H]⁺", "H•"], ["CH4N", 100, "CH2=NH2⁺", "C2H5•"], ["CH2N", 10, "CH2N⁺"]],
      note: "Примарните амини даваат основен пик на m/z 30 (CH2=NH2⁺). Споредете со триметиламин (исто M = 59)." },
    { id: "cikloheksanon", n: "циклохексанон", f: "C6H10O", cl: "кетон",
      fr: [M_("C6H10O", 70), ["C4H5O", 40, "C4H5O⁺", "C2H5•"], ["C3H3O", 100, "C3H3O⁺", "C3H7•"], ["C3H6", 65, "C3H6⁺•"], ["C3H5", 30, "C3H5⁺"], ["C3H3", 28, "C3H3⁺"]],
      note: "Цикличен кетон: силен M⁺• (98), основен пик 55." },
    { id: "benzofenon", n: "дифенилметанон (бензофенон)", f: "C13H10O", cl: "кетон",
      fr: [M_("C13H10O", 55), ["C7H5O", 100, "C6H5C≡O⁺ (бензоил)", "C6H5•"], ["C6H5", 60, "C6H5⁺ (фенил)", "C6H5CO•"], ["C4H3", 25, "C4H3⁺"]],
      note: "α-кинување дава бензоил-јон (105) и фенил (77)." },
    { id: "furan", n: "фуран", f: "C4H4O", cl: "хетероцикл",
      fr: [M_("C4H4O", 87), ["C3H3", 100, "C3H3⁺", "CHO•"], ["C3H2", 15, "C3H2⁺•"], ["CHO", 12, "HC≡O⁺"]],
      note: "Ароматичен хетероцикл: основен пик е C3H3⁺ (39), а M⁺• (68) е речиси еднакво интензивен." },
    { id: "tiofen", n: "тиофен", f: "C4H4S", cl: "хетероцикл",
      fr: [M_("C4H4S", 100), ["C2H2S", 25, "C2H2S⁺•", "C2H2"], ["CHS", 22, "CHS⁺"], ["C3H3", 25, "C3H3⁺"]],
      note: "Изомер по маса на циклохексанот и CH2Cl2 (M = 84); сулфурот се познава по M+2 од околу 4,5 %." },
    { id: "kumen", n: "изопропилбензен (кумен)", f: "C9H12", cl: "арен",
      fr: [M_("C9H12", 28), ["C8H9", 100, "C6H5–CH⁺–CH3", "CH3•"], ["C7H7", 12, "C7H7⁺ (тропилиум)"], ["C6H7", 12, "C6H7⁺"], ["C6H5", 10, "C6H5⁺ (фенил)"]],
      note: "Изомер на ацетофенонот (M = 120), но основниот пик е 105 од губење на CH3•, а нема 77 како главен." },
    { id: "ksilen", n: "1,4-диметилбензен (п-ксилен)", f: "C8H10", cl: "арен",
      fr: [M_("C8H10", 60), ["C8H9", 25, "[M−H]⁺", "H•"], ["C7H7", 100, "C7H7⁺ (тропилиум)", "CH3•"], ["C6H5", 12, "C6H5⁺ (фенил)"], ["C4H3", 8, "C4H3⁺"]],
      note: "Изомер на етилбензенот (M = 106), но со поинтензивен M⁺• (метил-групи наместо етил)." },
    { id: "butanol", n: "бутан-1-ол", f: "C4H10O", cl: "алкохол",
      fr: [M_("C4H10O", 2), ["C4H8", 100, "C4H8⁺•", "H2O"], ["CH3O", 90, "CH2=OH⁺", "C3H7•"], ["C3H5", 72, "C3H5⁺"], ["C3H7", 60, "C3H7⁺"], ["C2H3", 40, "C2H3⁺"], ["C2H5", 25, "C2H5⁺"]],
      note: "Примарен алкохол: M⁺• е многу слаб. Според MassBank основен пик е 56 (M−18, губење на вода), а 31 (CH2=OH⁺) е речиси еднакво интензивен; во други библиотеки 31 може да е основен." },
    { id: "tbutanol", n: "2-метилпропан-2-ол (трет-бутанол)", f: "C4H10O", cl: "алкохол", noM: true,
      fr: [["C3H7O", 100, "(CH3)2C=OH⁺", "CH3•"], ["CH3O", 40, "CH2=OH⁺", "C3H7•"], ["C3H5", 25, "C3H5⁺"], ["C3H7", 20, "C3H7⁺"]],
      note: "Терцијарен алкохол: M⁺• (74) практично го нема, а основен пик е M−15 (59)." },
    { id: "benzilhlorid", n: "(хлорометил)бензен (бензил-хлорид)", f: "C7H7Cl", cl: "халоарен",
      fr: [M_("C7H7Cl", 25), ["C7H7", 100, "C7H7⁺ (тропилиум)", "Cl•"], ["C5H5", 15, "C5H5⁺"], ["C6H5", 6, "C6H5⁺ (фенил)"]],
      note: "M⁺• (126) и M+2 (128) во однос 3 : 1; губењето на Cl• дава тропилиум 91 како основен пик." },
    { id: "thf", n: "тетрахидрофуран", f: "C4H8O", cl: "етер",
      fr: [M_("C4H8O", 28), ["C4H7O", 27, "[M−H]⁺", "H•"], ["C2H3O", 17, "C2H3O⁺"], ["C3H6", 100, "C3H6⁺•", "CH2O"], ["C3H5", 40, "C3H5⁺"], ["C3H3", 21, "C3H3⁺"]],
      note: "Цикличен етер (M = 72): основен пик 42 (M−CH2O); M⁺• и [M−H]⁺ (72, 71) се слаби (≈ 25–30 %)." },
    { id: "benzoilhlorid", n: "бензоил-хлорид", f: "C7H5ClO", cl: "киселински хлорид",
      fr: [M_("C7H5ClO", 20), ["C7H5O", 100, "C6H5C≡O⁺ (бензоил)", "Cl•"], ["C6H5", 50, "C6H5⁺ (фенил)"], ["C4H3", 15, "C4H3⁺"]],
      note: "M⁺• (140) со M+2 (142) во однос 3 : 1; губење на Cl• дава бензоил 105." },
    { id: "dmso", n: "диметил-сулфоксид", f: "C2H6OS", cl: "сулфоксид",
      fr: [M_("C2H6OS", 65), ["CH3OS", 100, "CH3S≡O⁺", "CH3•"], ["CHS", 35, "CHS⁺"], ["CH3", 25, "CH3⁺"]],
      note: "Основен пик M−15 (63); сулфурот се гледа по M+2 (≈ 4–5 %)." },
    { id: "co2", n: "јаглерод(IV)-оксид", f: "CO2", cl: "неорганско",
      fr: [M_("CO2", 100), ["CO", 10, "CO⁺•", "O"], ["O", 9, "O⁺•"], ["C", 9, "C⁺"]],
      note: "M⁺• (44) е основен пик; фрагментите 28 (CO), 16 (O) и 12 (C) се слаби." },
    { id: "azot", n: "азот (N₂)", f: "N2", cl: "неорганско",
      fr: [M_("N2", 100), ["N", 7, "N⁺", "N•"]],
      note: "M⁺• на 28 (иста номинална маса како CO и C2H4); парна маса и два атома N." },
    { id: "amonijak", n: "амонијак", f: "NH3", cl: "неорганско",
      fr: [M_("NH3", 100), ["NH2", 80, "NH2⁺", "H•"], ["NH", 8, "NH⁺", "H2"]],
      note: "Непарна M (17) → еден N (азотно правило)." },
    { id: "h2s", n: "водород-сулфид", f: "H2S", cl: "неорганско",
      fr: [M_("H2S", 100), ["HS", 42, "HS⁺", "H•"], ["S", 45, "S⁺•", "H2"]],
      note: "Сулфурот се познава по M+2 (36) од ≈ 4,5 % од M⁺• (34)." },
    { id: "hcl", n: "водород-хлорид", f: "HCl", cl: "неорганско",
      fr: [M_("HCl", 100), ["Cl", 17, "Cl⁺", "H•"]],
      note: "M⁺• (36) и M+2 (38) во однос 3 : 1; пик на 35 и 37 (Cl⁺)." }
  ];

  // ---------- загуби и фрагменти (референца) ----------
  const LOSS = {
    "H•": 1, "CH3•": 15, "OH•": 17, "H2O": 18, "HCN": 27, "CO": 28, "C2H4": 28, "C2H5•": 29, "CHO•": 29,
    "OCH3•": 31, "SH•": 33, "Cl•": 35, "HCl": 36, "CH3CO•": 43, "C3H7•": 43, "C2H5O•": 45, "COOH•": 45,
    "C2H5CO•": 57, "Br•": 79, "HBr": 80,
    "H2": 2, "C2H2": 26, "N•": 14, "NH2•": 16, "O": 16, "NO•": 30, "CH2O": 30, "NO2•": 46, "C4H9•": 57, "C6H5•": 77, "I•": 127, "C6H5CO•": 105
  };
  const LOSS_TXT = {
    "H•": "H• (M−1: алдехиди, амини, ароматични)", "CH3•": "CH3• (M−15)", "OH•": "OH• (M−17: киселини, алкохоли)",
    "H2O": "H2O (M−18: алкохоли)", "HCN": "HCN (M−27: арилни амини, нитрили)", "CO": "CO (M−28)", "C2H4": "C2H4 (M−28: McLafferty, циклоалкани)",
    "C2H5•": "C2H5• (M−29)", "CHO•": "CHO• (M−29: алдехиди)", "OCH3•": "•OCH3 (M−31: метил-естри)", "SH•": "SH• (M−33: тиоли)",
    "Cl•": "Cl• (M−35)", "HCl": "HCl (M−36)", "CH3CO•": "CH3CO• (M−43: метил-кетони)", "C3H7•": "C3H7• (M−43)",
    "C2H5O•": "C2H5O• (M−45: етил-естри, етри)", "COOH•": "COOH• (M−45: карбоксилни киселини)", "C2H5CO•": "C2H5CO• (M−57)",
    "Br•": "Br• (M−79)", "HBr": "HBr (M−80)",
    "H2": "H2 (M−2)", "C2H2": "C2H2 (M−26)", "N•": "N• (M−14)", "NH2•": "NH2• (M−16)", "O": "O (M−16)", "NO•": "NO• (M−30: нитро-соединенија)", "CH2O": "CH2O (M−30: метил-арил-етри, циклични етри)",
    "NO2•": "NO2• (M−46: нитро-соединенија)", "C4H9•": "C4H9• (M−57)", "C6H5•": "C6H5• (M−77)", "I•": "I• (M−127)", "C6H5CO•": "C6H5CO• (M−105)"
  };
  const FRAG_REF = [
    [15, "CH3⁺", "метил"], [30, "CH2=NH2⁺", "примарни амини"], [44, "C2H4O⁺• / CO2⁺• / C3H8⁺•", "McLafferty на алдехиди; CO2"], [29, "C2H5⁺ / CHO⁺", "етил; алдехиди"], [31, "CH2=OH⁺", "примарни алкохоли, етри"], [39, "C3H3⁺", "ароматични, алкени"],
    [43, "C3H7⁺ / CH3CO⁺", "пропил; ацетил (метил-кетони, ацетати)"], [45, "CH3CH=OH⁺ / COOH⁺", "секундарни алкохоли; киселини"],
    [51, "C4H3⁺", "ароматични"], [57, "C4H9⁺ / C2H5CO⁺", "бутил; етил-кетони"], [58, "C3H6O⁺•", "McLafferty (метил-кетони)"],
    [65, "C5H5⁺", "ароматични"], [77, "C6H5⁺", "фенил"], [91, "C7H7⁺", "тропилиум (алкилбензени)"], [105, "C6H5CO⁺", "бензоил"]
  ];
  const FRAG_REF_NOTE = "Значењата се типични, не секогаш еднозначни: едниот m/z може да одговара на повеќе јони.";

  // ---------- спектар ----------
  const specCache = {};
  function spectrum(d) {
    if (specCache[d.id]) return specCache[d.id];
    const acc = {};
    d.fr.forEach(a => {
      const m0 = nomMass(parseF(a[0])), pat = pattern(a[0]);
      for (const k in pat) { const mz = m0 + +k; acc[mz] = (acc[mz] || 0) + pat[k] * a[1] / 100; }
    });
    let mx = 0; for (const k in acc) mx = Math.max(mx, acc[k]);
    const peaks = [];
    for (const k in acc) { const v = acc[k] / mx * 100; if (v >= 0.8) peaks.push([+k, v]); }
    peaks.sort((x, y) => x[0] - y[0]);
    const M = nomMass(parseF(d.f));
    const base = peaks.reduce((b, p) => p[1] > b[1] ? p : b, peaks[0]);
    return (specCache[d.id] = { peaks, M, base: base[0], max: peaks[peaks.length - 1][0] });
  }

  // експорт за тестирање
  window.MassSpec = { D, spectrum, parseF, nomMass, pattern, LOSS, FRAG_REF };

  // ---------- UI ----------
  const root = document.getElementById("ms-root");
  if (!root) return;

  const fm = t => String(t).replace(/([A-Za-z\)])(\d+)/g, (m, a, d) => a + d.split("").map(c => "₀₁₂₃₄₅₆₇₈₉"[+c]).join(""));
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = fm(text); return e; };
  const NS = "http://www.w3.org/2000/svg";
  const sv = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text !== undefined) e.textContent = text; return e; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = x => (Math.round(x * 10) / 10).toString().replace(".", ",");
  const sub = f => f.replace(/(\d+)/g, d => d.split("").map(c => "₀₁₂₃₄₅₆₇₈₉"[+c]).join(""));

  // SVG спектар
  function drawSpectrum(d, opt) {
    opt = opt || {};
    const S = spectrum(d), W = 640, H = 280, L = 50, R = 12, T = 22, B = 44;
    const lo = Math.max(0, Math.floor((S.peaks[0][0] - 6) / 10) * 10), hi = Math.ceil((S.max + 6) / 10) * 10;
    const X = mz => L + (mz - lo) / (hi - lo) * (W - L - R), Y = v => T + (100 - v) / 100 * (H - T - B);
    const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, class: "ms-svg", role: "img", "aria-label": "Масен спектар" });
    svg.appendChild(sv("rect", { x: 0, y: 0, width: W, height: H, fill: "#fff" }));
    for (let v = 0; v <= 100; v += 20) {
      svg.appendChild(sv("line", { x1: L, x2: W - R, y1: Y(v), y2: Y(v), stroke: "#eee" }));
      svg.appendChild(sv("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end", "font-size": 14, fill: "#6b5b6e" }, v));
    }
    const step = hi - lo > 160 ? 20 : 10;
    for (let m = lo; m <= hi; m += step) {
      svg.appendChild(sv("line", { x1: X(m), x2: X(m), y1: H - B, y2: H - B + 4, stroke: "#6b5b6e" }));
      svg.appendChild(sv("text", { x: X(m), y: H - B + 17, "text-anchor": "middle", "font-size": 14, fill: "#6b5b6e" }, m));
    }
    svg.appendChild(sv("line", { x1: L, x2: W - R, y1: H - B, y2: H - B, stroke: "#6b5b6e" }));
    svg.appendChild(sv("line", { x1: L, x2: L, y1: T, y2: H - B, stroke: "#6b5b6e" }));
    svg.appendChild(sv("text", { x: (L + W - R) / 2, y: H - 6, "text-anchor": "middle", "font-size": 14, fill: "#2a1f2d" }, "m/z"));
    svg.appendChild(sv("text", { x: 12, y: (T + H - B) / 2, "text-anchor": "middle", "font-size": 14, fill: "#2a1f2d", transform: `rotate(-90 12 ${(T + H - B) / 2})` }, "релативен интензитет, %"));
    S.peaks.forEach(([mz, v]) => {
      const hl = opt.hl && opt.hl.indexOf(mz) >= 0;
      svg.appendChild(sv("line", { x1: X(mz), x2: X(mz), y1: Y(0), y2: Y(v), stroke: hl ? "#1d4ed8" : "#9a3412", "stroke-width": hl ? 3.5 : 2.2 }));
      if (v >= 4 && !opt.noLabels || hl)
        svg.appendChild(sv("text", { x: X(mz), y: Y(v) - 4, "text-anchor": "middle", "font-size": 14, "font-weight": hl ? 700 : 400, fill: hl ? "#1d4ed8" : "#2a1f2d" }, mz));
    });
    return svg;
  }

  // ---------- вежби ----------
  const TYPES = {
    mol:   { name: "Молекулски јон", lvl: 1 },
    base:  { name: "Основен пик", lvl: 1 },
    nitro: { name: "Азотно правило", lvl: 1 },
    loss:  { name: "Загубена честичка", lvl: 2 },
    halo:  { name: "Изотопи: Cl, Br, S", lvl: 2 },
    frag:  { name: "Структура на фрагмент", lvl: 2 },
    id:    { name: "Препознај го соединението", lvl: 3 }
  };

  function opts4(correct, pool, fmt) {
    const set = [correct];
    shuffle(pool).forEach(x => { if (set.length < 4 && set.indexOf(x) < 0) set.push(x); });
    return shuffle(set).map(v => ({ v, t: fmt ? fmt(v) : String(v), ok: v === correct }));
  }

  const hasM = d => !d.noM && d.fr[0][1] >= 5;
  function qMol() {
    const d = pick(D.filter(hasM)), S = spectrum(d);
    const near = [S.M + 2, S.M - 1, S.M + 1, S.M - 15, S.M + 14].filter(x => x > 5);
    const pool = S.peaks.map(p => p[0]).filter(x => x !== S.M).concat(near);
    const hasIso = Object.keys(parseF(d.f)).some(e => e === "Cl" || e === "Br");
    return {
      d, opt: { hl: [] }, title: "Кој пик е молекулскиот јон (M⁺•)?",
      sub: "Молекулскиот јон го претставува пикот што одговара на молекулската маса на соединението (најголема вредност на m/z во главната група пикови). Изотопските пикови M+1 и M+2 не се земаат предвид.",
      options: opts4(S.M, pool, v => "m/z " + v),
      why: `M⁺• е на m/z ${S.M}${hasIso ? " (најмалиот m/z од изотопската група, со најлесните изотопи 35Cl или 79Br)" : ""}. Формула: ${sub(d.f)}.`,
      reveal: d, ans: d.n
    };
  }
  function qBase() {
    const d = pick(D.filter(x => spectrum(x).base !== spectrum(x).M || Math.random() < .3)), S = spectrum(d);
    const pool = S.peaks.map(p => p[0]).filter(x => x !== S.base);
    const extra = [S.base + 1, S.base - 1, S.base + 14, S.base - 14].filter(x => x > 5);
    return {
      d, opt: {}, title: "Кој е основниот пик (најинтензивниот пик во спектарот)?",
      sub: "Основниот пик е со 100 % релативен интензитет.",
      options: opts4(S.base, pool.concat(extra), v => "m/z " + v),
      why: `Основниот пик е на m/z ${S.base}.` + (S.base === S.M ? " Тоа е и молекулскиот јон, што е типично за ароматични соединенија." : ""),
      reveal: d
    };
  }
  function qNitro() {
    const d = pick(D.filter(hasM)), S = spectrum(d), nN = parseF(d.f).N || 0, odd = nN % 2 === 1;
    return {
      d, opt: { hl: [S.M] }, title: `Молекулскиот јон е на m/z ${S.M}. Дали молекулата содржи непарен број атоми азот?`,
      sub: "Азотно правило: непарна маса на M⁺• (при мал број атоми на N, Cl, Br) значи непарен број атоми азот.",
      options: [{ v: 1, t: "Да, непарен број N", ok: odd }, { v: 0, t: "Не, парен број N (вклучувајќи 0)", ok: !odd }],
      why: `M = ${S.M} е ${S.M % 2 ? "непарен" : "парен"}; соединението е ${d.n} (${sub(d.f)}) и има ${nN} атом(и) N.`,
      reveal: d
    };
  }
  function qLoss() {
    const cand = [];
    D.forEach(d => { if (!hasM(d)) return; d.fr.slice(1).forEach(a => { if (a[3] && LOSS[a[3]] !== undefined) cand.push([d, a]); }); });
    const [d, a] = pick(cand), S = spectrum(d), mz = nomMass(parseF(a[0])), dm = S.M - mz;
    const pool = Object.keys(LOSS).filter(k => LOSS[k] !== dm);
    const opts = opts4(a[3], pool, k => LOSS_TXT[k].split(" (")[0]);
    // иста маса не смее да се појави два пати
    const seen = {}, fix = [];
    opts.forEach(o => { const m = LOSS[o.v]; if (!seen[m]) { seen[m] = 1; fix.push(o); } });
    while (fix.length < 4) { const k = pick(pool); if (!fix.some(o => LOSS[o.v] === LOSS[k])) fix.push({ v: k, t: LOSS_TXT[k].split(" (")[0], ok: false }); }
    return {
      d, opt: { hl: [S.M, mz] }, title: `Од M⁺• (m/z ${S.M}) до пикот m/z ${mz} има разлика ${dm}. Која честичка е загубена?`,
      sub: "Загубената честичка е разликата M − m/z на фрагментот.",
      options: shuffle(fix),
      why: `${S.M} − ${mz} = ${dm}: губење на ${LOSS_TXT[a[3]]}. Фрагментот е ${a[2]}.`,
      reveal: d
    };
  }
  const HALO = ["нема Cl, Br, S или I", "1 атом Cl", "2 атома Cl", "3 атома Cl", "1 атом Br", "1 атом S", "1 атом I (нема M+2)"];
  function qHalo() {
    const d = pick(D.filter(x => { const c = parseF(x.f); return hasM(x) && (c.Cl || c.Br || c.S || c.I || Math.random() < .12); })), c = parseF(d.f), S = spectrum(d);
    let ans = "нема Cl, Br, S или I";
    if (c.Cl) ans = c.Cl + (c.Cl === 1 ? " атом Cl" : " атома Cl"); else if (c.Br) ans = "1 атом Br"; else if (c.S) ans = "1 атом S"; else if (c.I) ans = "1 атом I (нема M+2)";
    const pk = {}; S.peaks.forEach(p => pk[p[0]] = p[1]);
    const r2 = (pk[S.M + 2] || 0) / pk[S.M] * 100;
    return {
      d, opt: { hl: [S.M, S.M + 2], noLabels: false }, title: "Според изотопскиот образец на молекулскиот јон, што содржи соединението?",
      sub: "Cl: M+2 ≈ 32 % од M (35Cl : 37Cl ≈ 3 : 1). Br: M+2 ≈ 97 % од M (≈ 1 : 1). S: M+2 ≈ 4–5 % од M. Две Cl: M : M+2 : M+4 ≈ 9 : 6 : 1.",
      options: opts4(ans, HALO),
      why: `M+2/M ≈ ${pct(r2)} %. Соединението е ${d.n} (${sub(d.f)}) и содржи: ${ans}.`,
      reveal: d
    };
  }
  function qFrag() {
    const cand = [];
    D.forEach(d => d.fr.slice(1).forEach(a => { if (a[2] && a[1] >= 15 && !/^M/.test(a[2])) cand.push([d, a]); }));
    const [d, a] = pick(cand), mz = nomMass(parseF(a[0]));
    const all = []; D.forEach(x => x.fr.forEach(b => { if (b[2] && b !== a && nomMass(parseF(b[0])) === mz) return; if (b[2] && b[2] !== a[2] && b[2][0] !== "M") all.push(b[2]); }));
    const base = a[2];
    return {
      d, opt: { hl: [mz] }, title: `Која честичка одговара на означениот пик m/z ${mz}?`, sub: `Спектарот е на ${d.n}. Пикот е означен со сино.`,
      options: opts4(base, all),
      why: `m/z ${mz} = ${base} (${sub(a[0])}).`, reveal: d
    };
  }
  function qId() {
    const d = pick(D.filter(x => x.fr.length > 3)), S = spectrum(d);
    const same = D.filter(x => x !== d && spectrum(x).M === S.M), cls = D.filter(x => x !== d && x.cl === d.cl && !same.includes(x));
    const rest = D.filter(x => x !== d && !same.includes(x) && !cls.includes(x) && Math.abs(spectrum(x).M - S.M) < 40);
    const others = shuffle(same).concat(shuffle(cls)).concat(shuffle(rest)).concat(shuffle(D.filter(x => x !== d))).filter((x, i, a) => a.indexOf(x) === i).slice(0, 3);
    const opts = shuffle([d].concat(others)).map(x => ({ v: x.id, t: x.n + " (" + sub(x.f) + ")", ok: x === d }));
    return {
      d, opt: { hl: hasM(d) ? [S.M] : [] }, hideName: true, title: "Кое соединение дава овој спектар?",
      sub: hasM(d) ? `M⁺• е на m/z ${S.M}${S.M % 2 ? " (непарна маса: размислете за азот)" : ""}. Основен пик: m/z ${S.base}.` : `M⁺• е многу слаб или го нема. Основен пик: m/z ${S.base}.`,
      options: opts, why: `${d.n} (${sub(d.f)}). ${d.note}`, reveal: d
    };
  }
  const GEN = { mol: qMol, base: qBase, nitro: qNitro, loss: qLoss, halo: qHalo, frag: qFrag, id: qId };

  // ---------- состојба и приказ ----------
  const st = { tab: "ex", level: 0, type: "all", ok: 0, n: 0, streak: 0, cur: null, done: false };
  root.textContent = "";
  const tabs = el("div", "ms-tabs");
  const body = el("div", "ms-body");
  root.append(tabs, body);
  [["ex", "🎯 Вежби"], ["lib", "📚 Спектри"], ["ref", "📋 Референца"]].forEach(([k, t]) => {
    const b = el("button", "ms-tab" + (k === st.tab ? " on" : ""), t); b.type = "button";
    b.addEventListener("click", () => { st.tab = k; [...tabs.children].forEach(x => x.classList.toggle("on", x === b)); render(); });
    tabs.appendChild(b);
  });

  function newQ() {
    let types = Object.keys(TYPES);
    if (st.type !== "all") types = [st.type];
    else if (st.level) types = types.filter(k => TYPES[k].lvl === st.level);
    let q, tries = 0;
    do { q = GEN[pick(types)](); tries++; } while (st.cur && q.d === st.cur.d && q.title === st.cur.title && tries < 5);
    st.cur = q; st.done = false;
  }

  function render() {
    body.textContent = "";
    if (st.tab === "ex") renderEx(); else if (st.tab === "lib") renderLib(); else renderRef();
  }

  function renderEx() {
    const bar = el("div", "ms-bar");
    const lv = el("select", "ms-sel"); lv.setAttribute("aria-label", "Ниво");
    [[0, "Сите нивоа"], [1, "Лесно (M⁺•, основен пик, N)"], [2, "Средно (загуби, изотопи, фрагменти)"], [3, "Тешко (препознај соединение)"]].forEach(([v, t]) => { const o = el("option", "", t); o.value = v; lv.appendChild(o); });
    lv.value = st.level;
    const ty = el("select", "ms-sel"); ty.setAttribute("aria-label", "Тип на задача");
    const fill = () => { ty.textContent = ""; const o0 = el("option", "", "Сите типови"); o0.value = "all"; ty.appendChild(o0);
      Object.keys(TYPES).filter(k => !st.level || TYPES[k].lvl === st.level).forEach(k => { const o = el("option", "", TYPES[k].name); o.value = k; ty.appendChild(o); });
      if (![...ty.options].some(o => o.value === st.type)) st.type = "all"; ty.value = st.type; };
    fill();
    lv.addEventListener("change", () => { st.level = +lv.value; fill(); newQ(); render(); });
    ty.addEventListener("change", () => { st.type = ty.value; newQ(); render(); });
    const sc = el("span", "ms-score", `Точно: ${st.ok} / ${st.n}` + (st.streak > 1 ? ` · серија ${st.streak} 🔥` : ""));
    const rs = el("button", "ms-link", "Нулирај"); rs.type = "button";
    rs.addEventListener("click", () => { st.ok = st.n = st.streak = 0; render(); });
    bar.append(lv, ty, sc, rs);
    body.appendChild(bar);

    if (!st.cur) newQ();
    const q = st.cur;
    const card = el("div", "ms-card");
    card.appendChild(el("h3", "ms-q", q.title));
    if (q.sub) card.appendChild(el("p", "ms-sub", q.sub));
    card.appendChild(drawSpectrum(q.d, q.opt));
    const ol = el("div", "ms-opts");
    q.options.forEach(o => {
      const b = el("button", "ms-opt", o.t); b.type = "button";
      b.addEventListener("click", () => {
        if (st.done) return;
        st.done = true; st.n++;
        if (o.ok) { st.ok++; st.streak++; } else st.streak = 0;
        [...ol.children].forEach((x, i) => { x.disabled = true; if (q.options[i].ok) x.classList.add("good"); });
        if (!o.ok) b.classList.add("bad");
        const fb = el("div", "ms-fb " + (o.ok ? "good" : "bad"));
        fb.appendChild(el("b", "", o.ok ? "Точно! " : "Не баш. "));
        fb.appendChild(document.createTextNode(fm(q.why)));
        card.appendChild(fb);
        const nx = el("button", "btn ms-next", "Следна задача →"); nx.type = "button";
        nx.addEventListener("click", () => { newQ(); render(); });
        card.appendChild(nx);
        sc.textContent = `Точно: ${st.ok} / ${st.n}` + (st.streak > 1 ? ` · серија ${st.streak} 🔥` : "");
        nx.focus();
      });
      ol.appendChild(b);
    });
    card.appendChild(ol);
    if (st.done) { /* по ново цртање (промена на табот) — прикажи нова задача */ newQ(); return render(); }
    body.appendChild(card);
    body.appendChild(el("p", "ms-hint", "Совет: прво најди го M⁺•, потоа основниот пик, па разликите меѓу пиковите."));
  }

  function renderLib() {
    const sel = el("select", "ms-sel"); sel.setAttribute("aria-label", "Соединение");
    D.slice().sort((a, b) => a.n.localeCompare(b.n, "mk")).forEach(d => { const o = el("option", "", d.n + " (" + d.f + ")"); o.value = d.id; sel.appendChild(o); });
    const out = el("div", "ms-card");
    const show = () => {
      const d = D.find(x => x.id === sel.value), S = spectrum(d);
      out.textContent = "";
      out.appendChild(el("h3", "ms-q", d.n + " — " + sub(d.f)));
      out.appendChild(el("p", "ms-sub", `M = ${S.M}${d.noM ? " (M⁺• практично го нема)" : ""} · основен пик m/z ${S.base} · класа: ${d.cl}`));
      out.appendChild(drawSpectrum(d, { hl: [S.base] }));
      out.appendChild(el("p", "ms-note", d.note));
      const t = el("table", "ms-tbl");
      const h = el("tr"); ["m/z", "јон", "губење од M⁺•"].forEach(x => h.appendChild(el("th", "", x))); t.appendChild(h);
      d.fr.slice().sort((a, b) => nomMass(parseF(b[0])) - nomMass(parseF(a[0]))).forEach(a => {
        const r = el("tr"); r.appendChild(el("td", "", nomMass(parseF(a[0])))); r.appendChild(el("td", "", a[2] || sub(a[0]) + "⁺"));
        r.appendChild(el("td", "", a[3] ? LOSS_TXT[a[3]] || a[3] : "")); t.appendChild(r);
      });
      out.appendChild(t);
    };
    sel.addEventListener("change", show);
    body.append(el("p", "ms-sub", "Избери соединение и разгледај го спектарот со објаснување на пиковите."), sel, out);
    show();
  }

  function renderRef() {
    const c = el("div", "ms-card");
    c.appendChild(el("h3", "ms-q", "Чести загуби од молекулскиот јон"));
    const t1 = el("table", "ms-tbl"); const h1 = el("tr"); ["M − …", "честичка"].forEach(x => h1.appendChild(el("th", "", x))); t1.appendChild(h1);
    Object.keys(LOSS).sort((a, b) => LOSS[a] - LOSS[b]).forEach(k => { const r = el("tr"); r.appendChild(el("td", "", LOSS[k])); r.appendChild(el("td", "", LOSS_TXT[k])); t1.appendChild(r); });
    c.appendChild(t1);
    c.appendChild(el("h3", "ms-q", "Чести јони (фрагменти)"));
    const t2 = el("table", "ms-tbl"); const h2 = el("tr"); ["m/z", "јон", "каде се среќава"].forEach(x => h2.appendChild(el("th", "", x))); t2.appendChild(h2);
    FRAG_REF.forEach(a => { const r = el("tr"); a.forEach(x => r.appendChild(el("td", "", x))); t2.appendChild(r); });
    c.appendChild(t2);
    c.appendChild(el("p", "ms-note", FRAG_REF_NOTE));
    c.appendChild(el("h3", "ms-q", "Правила за решавање"));
    const ul = el("ol", "ms-steps");
    ["Најди го M⁺• (најголемиот m/z од главната група). Може да е слаб или да го нема (алкохоли, разгранети алкани, CCl4).",
     "Азотно правило: непарна маса на M⁺• значи непарен број атоми азот.",
     "Погледни M+1 и M+2: M+2 ≈ 32 % → Cl; ≈ 97 % → Br; ≈ 4–5 % → S. M+1 (≈ 1,1 % по С атом) ја кажува приближно бројката на јаглеродни атоми.",
     "Пресметај ги разликите M − m/z и препознај ги загубените честички.",
     "Препознај ги карактеристичните јони (77, 91, 105, 43, 31, 45…) и основниот пик.",
     "Состави структура што ги објаснува сите пикови и провери ги отпадоците."].forEach(x => ul.appendChild(el("li", "", x)));
    c.appendChild(ul);
    c.appendChild(el("p", "ms-note", "Спектрите се за вежбање: m/z и изотопските групи се пресметани, а релативните интензитети се ориентациони (во реални спектри зависат од уредот и условите)."));
    body.appendChild(c);
  }

  render();
})();
