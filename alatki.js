// Алатки: периоден систем на кој се кликнува + калкулатор за моларна маса.
// Ги користи имињата и симболите од elements.js (ELEMENTS).
(function () {
  "use strict";

  // ---------- Релативни атомски маси (Ar), по редослед на атомски број ----------
  // За елементи без стабилен изотоп (RADIO) бројот е масен број на најстабилниот изотоп.
  const MASS = [
    1.008, 4.0026, 6.94, 9.0122, 10.81, 12.011, 14.007, 15.999, 18.998, 20.180,
    22.990, 24.305, 26.982, 28.085, 30.974, 32.06, 35.45, 39.948, 39.098, 40.078,
    44.956, 47.867, 50.942, 51.996, 54.938, 55.845, 58.933, 58.693, 63.546, 65.38,
    69.723, 72.630, 74.922, 78.971, 79.904, 83.798, 85.468, 87.62, 88.906, 91.224,
    92.906, 95.95, 98, 101.07, 102.906, 106.42, 107.868, 112.414, 114.818, 118.710,
    121.760, 127.60, 126.904, 131.293, 132.905, 137.327, 138.905, 140.116, 140.908, 144.242,
    145, 150.36, 151.964, 157.25, 158.925, 162.500, 164.930, 167.259, 168.934, 173.045,
    174.967, 178.486, 180.948, 183.84, 186.207, 190.23, 192.217, 195.084, 196.967, 200.592,
    204.38, 207.2, 208.980, 209, 210, 222, 223, 226, 227, 232.038,
    231.036, 238.029, 237, 244, 243, 247, 247, 251, 252, 257,
    258, 259, 266, 267, 268, 269, 270, 277, 278, 281,
    282, 285, 286, 289, 290, 293, 294, 294
  ];
  const RADIO = new Set([43, 61, 84, 85, 86, 87, 88, 89]);
  for (let z = 93; z <= 118; z++) RADIO.add(z);

  if (typeof ELEMENTS === "undefined" || ELEMENTS.length !== 118 || MASS.length !== 118) {
    console.error("Алатки: недостасуваат податоци за елементите (elements.js).");
    return;
  }

  const EL = ELEMENTS.map(([sym, name], i) => ({ z: i + 1, sym, name, mass: MASS[i], radio: RADIO.has(i + 1) }));
  const BY_SYM = {};
  EL.forEach(e => (BY_SYM[e.sym] = e));

  // ---------- Категории ----------
  const CATS = [
    { id: "alkali",    name: "Алкални метали",        color: "#ff8a65", z: [3, 11, 19, 37, 55, 87] },
    { id: "alkaline",  name: "Земноалкални метали",   color: "#ffb74d", z: [4, 12, 20, 38, 56, 88] },
    { id: "trans",     name: "Преодни метали",        color: "#ffe082", z: range(21, 30).concat(range(39, 48), range(72, 80), range(104, 112)) },
    { id: "post",      name: "Постпреодни метали",    color: "#aed581", z: [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116] },
    { id: "metalloid", name: "Полуметали",            color: "#4db6ac", z: [5, 14, 32, 33, 51, 52] },
    { id: "nonmetal",  name: "Неметали",              color: "#81d4fa", z: [1, 6, 7, 8, 15, 16, 34] },
    { id: "halogen",   name: "Халогени елементи",     color: "#f48fb1", z: [9, 17, 35, 53, 85, 117] },
    { id: "noble",     name: "Племенити гасови",      color: "#b39ddb", z: [2, 10, 18, 36, 54, 86, 118] },
    { id: "lanth",     name: "Лантаноиди",            color: "#d7ccc8", z: range(57, 71) },
    { id: "actin",     name: "Актиноиди",             color: "#bcaaa4", z: range(89, 103) }
  ];
  const CAT_OF = {};
  CATS.forEach(c => c.z.forEach(z => (CAT_OF[z] = c)));
  function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }
  for (let z = 1; z <= 118; z++) if (!CAT_OF[z]) console.error("Нема категорија за елемент", z);

  const GAS = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86]);
  const LIQUID = new Set([35, 80]);
  function stateOf(z) {
    if (GAS.has(z)) return "гас";
    if (LIQUID.has(z)) return "течност";
    if (z === 85 || z === 87 || z >= 104) return "непознато (синтетички елемент)";
    return "цврсто тело";
  }

  // ---------- Место во табелата ----------
  // Групи 1–18, периоди 1–7; лантаноидите (Ce–Lu) и актиноидите (Th–Lr) се во два реда подолу.
  function pos(z) {
    if (z === 1) return [1, 1];
    if (z === 2) return [1, 18];
    if (z <= 4) return [2, z - 2];
    if (z <= 10) return [2, z + 8];
    if (z <= 12) return [3, z - 10];
    if (z <= 18) return [3, z];
    if (z <= 36) return [4, z - 18];
    if (z <= 54) return [5, z - 36];
    if (z <= 56) return [6, z - 54];
    if (z === 57) return [6, 3];
    if (z <= 71) return [9, z - 54];       // Ce(58) -> колона 4 ... Lu(71) -> 17
    if (z <= 86) return [6, z - 68];
    if (z <= 88) return [7, z - 86];
    if (z === 89) return [7, 3];
    if (z <= 103) return [10, z - 86];     // Th(90) -> колона 4 ... Lr(103) -> 17
    return [7, z - 100];
  }
  function groupOf(z) {
    if ((z >= 58 && z <= 71) || (z >= 90 && z <= 103)) return null;
    return pos(z)[1];
  }
  function periodOf(z) {
    if (z >= 58 && z <= 71) return 6;
    if (z >= 90 && z <= 103) return 7;
    return pos(z)[0];
  }
  function valenceOf(z) {
    const g = groupOf(z);
    if (z === 2) return 2;
    if (g === 1 || g === 2) return g;
    if (g >= 13) return g - 10;
    return null;
  }

  const fmtNum = n => String(n).replace(".", ",");
  function massText(e) { return e.radio ? "(" + e.mass + ")" : fmtNum(e.mass); }

  // ---------- Периоден систем ----------
  const grid = document.getElementById("pt-grid");
  const legend = document.getElementById("pt-legend");
  const search = document.getElementById("pt-search");
  const detailTop = document.getElementById("pt-detail-top");
  const detailInline = document.getElementById("pt-detail-inline");
  const cells = {};
  let selected = null, activeCat = null;

  function node(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  EL.forEach(e => {
    const [r, c] = pos(e.z);
    const b = node("button", "pt-cell");
    b.type = "button";
    b.style.gridRow = r;
    b.style.gridColumn = c;
    b.style.setProperty("--c", CAT_OF[e.z].color);
    b.setAttribute("aria-label", `${e.name}, ${e.sym}, атомски број ${e.z}`);
    b.append(node("span", "pt-n", e.z), node("span", "pt-s", e.sym), node("span", "pt-nm", e.name));
    b.addEventListener("click", () => select(e.z));
    grid.appendChild(b);
    cells[e.z] = b;
  });

  // ознаки за двата реда подолу
  [["Лантаноиди", 9], ["Актиноиди", 10]].forEach(([t, r]) => {
    const l = node("div", "pt-rowlabel", t);
    l.style.gridRow = r;
    l.style.gridColumn = "1 / 4";
    grid.appendChild(l);
  });

  CATS.forEach(c => {
    const b = node("button", "pt-chip");
    b.type = "button";
    b.dataset.cat = c.id;
    const dot = node("span", "pt-dot");
    dot.style.background = c.color;
    b.append(dot, document.createTextNode(c.name));
    b.addEventListener("click", () => {
      activeCat = activeCat === c.id ? null : c.id;
      legend.querySelectorAll(".pt-chip").forEach(x => x.classList.toggle("active", x.dataset.cat === activeCat));
      applyFilter();
    });
    legend.appendChild(b);
  });

  function applyFilter() {
    const q = search.value.trim().toLowerCase();
    EL.forEach(e => {
      const okCat = !activeCat || CAT_OF[e.z].id === activeCat;
      const okQ = !q || e.sym.toLowerCase() === q || e.name.toLowerCase().includes(q) || String(e.z) === q;
      cells[e.z].classList.toggle("dim", !(okCat && okQ));
    });
  }
  search.addEventListener("input", () => {
    applyFilter();
    // ако е напишан еден точен резултат, избери го
    const q = search.value.trim().toLowerCase();
    if (!q) return;
    const hits = EL.filter(e => e.sym.toLowerCase() === q || e.name.toLowerCase() === q || String(e.z) === q);
    if (hits.length === 1) select(hits[0].z, true);
  });

  function fact(label, value) {
    const d = node("div", "pt-fact");
    d.append(node("span", "pt-fact-l", label), node("span", "pt-fact-v", value));
    return d;
  }

  function renderDetail(target, e) {
    target.replaceChildren();
    const card = node("div", "pt-detail");
    if (!e) {
      card.classList.add("empty");
      card.append(node("p", "pt-hint", "👆 Кликни на елемент за да ги видиш неговите податоци."));
      target.appendChild(card);
      return;
    }
    const cat = CAT_OF[e.z];
    const tile = node("div", "pt-bigtile");
    tile.style.background = cat.color;
    tile.append(node("span", "pt-bigtile-n", e.z), node("span", "pt-bigtile-s", e.sym));

    const head = node("div", "pt-detail-head");
    head.append(node("h3", "pt-name", e.name), node("span", "pt-cat", cat.name));

    const g = groupOf(e.z), v = valenceOf(e.z);
    const facts = node("div", "pt-facts");
    facts.append(
      fact("Атомски број (Z)", String(e.z)),
      fact("Релативна атомска маса (Ar)", massText(e)),
      fact("Група", g === null ? "— (" + cat.name.toLowerCase() + ")" : String(g)),
      fact("Период", String(periodOf(e.z))),
      fact("Валентни електрони", v === null ? "—" : String(v)),
      fact("Состојба (собна температура)", stateOf(e.z))
    );
    const right = node("div", "pt-detail-right");
    right.append(head, facts);
    card.append(tile, right);
    target.appendChild(card);
  }

  function select(z, fromSearch) {
    if (selected) cells[selected].classList.remove("sel");
    selected = z;
    cells[z].classList.add("sel");
    const e = EL[z - 1];
    renderDetail(detailTop, e);
    renderDetail(detailInline, e);
    if (!fromSearch && window.matchMedia("(max-width: 1059px)").matches) {
      detailTop.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
  renderDetail(detailTop, null);
  renderDetail(detailInline, null);

  // ---------- Табови ----------
  document.querySelectorAll(".at-tab").forEach(t =>
    t.addEventListener("click", () => {
      document.querySelectorAll(".at-tab").forEach(x => {
        const on = x === t;
        x.classList.toggle("active", on);
        x.setAttribute("aria-selected", on);
        document.getElementById("at-panel-" + x.dataset.tab).hidden = !on;
      });
    })
  );

  // ---------- Калкулатор: читање на формула ----------
  const SUBS = "₀₁₂₃₄₅₆₇₈₉";
  // кирилични букви што изгледаат исто како латинични (пишување со македонска тастатура)
  const HOMOGLYPH = { "А": "A", "В": "B", "С": "C", "Е": "E", "Н": "H", "К": "K", "М": "M", "О": "O", "Р": "P", "Т": "T", "Ѕ": "S", "І": "I",
                      "а": "a", "с": "c", "е": "e", "о": "o", "р": "p", "і": "i", "ѕ": "s" };

  function normalize(s) {
    return Array.from(s).map(c => {
      if (SUBS.includes(c)) return String(SUBS.indexOf(c));
      return HOMOGLYPH[c] || c;
    }).join("")
      .replace(/[\s ]/g, "")
      .replace(/[•∙⋅*.]/g, "·")
      .replace(/[\[{]/g, "(")
      .replace(/[\]}]/g, ")");
  }

  function parsePart(s) {
    let i = 0;
    const add = (out, inner, k) => { for (const sym in inner) out[sym] = (out[sym] || 0) + inner[sym] * k; };
    function num() {
      const st = i;
      while (i < s.length && /\d/.test(s[i])) i++;
      if (st === i) return null;
      const n = parseInt(s.slice(st, i), 10);
      if (n === 0) throw new Error("Индексот не може да биде 0.");
      if (n > 999) throw new Error("Бројот е преголем.");
      return n;
    }
    function group(depth) {
      const out = {};
      while (i < s.length) {
        const ch = s[i];
        if (ch === "(") {
          i++;
          const inner = group(depth + 1);
          if (s[i] !== ")") throw new Error("Недостасува затворена заграда ).");
          i++;
          const k = num();
          add(out, inner, k === null ? 1 : k);
        } else if (ch === ")") {
          if (depth === 0) throw new Error("Има затворена заграда ) без отворена.");
          return out;
        } else if (/[A-Z]/.test(ch)) {
          let sym = ch;
          i++;
          if (i < s.length && /[a-z]/.test(s[i])) { sym += s[i]; i++; }
          if (!BY_SYM[sym]) throw new Error(`Непознат симбол „${sym}“. Провери ги големите и малите букви (на пример Co е кобалт, а CO е јаглерод моноксид).`);
          const k = num();
          out[sym] = (out[sym] || 0) + (k === null ? 1 : k);
        } else if (/[a-z]/.test(ch)) {
          throw new Error(`Симболите на елементите почнуваат со голема буква (на пример Na, Cl). Проверка кај „${ch}“.`);
        } else if (/\d/.test(ch)) {
          throw new Error("Бројот мора да стои зад симбол или зад заграда.");
        } else {
          throw new Error(`Непозната ознака „${ch}“.`);
        }
      }
      if (depth > 0) throw new Error("Недостасува затворена заграда ).");
      return out;
    }
    return group(0);
  }

  function parseFormula(raw) {
    const s = normalize(raw);
    if (!s) return null;
    // дели по · надвор од загради (хидрати)
    const parts = [];
    let depth = 0, cur = "";
    for (const ch of s) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "·" && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
    }
    parts.push(cur);
    const total = {};
    parts.forEach(p => {
      if (!p) throw new Error("Празен дел пред или по знакот ·.");
      const m = p.match(/^(\d+)(.*)$/);
      const coef = m ? parseInt(m[1], 10) : 1;
      const body = m ? m[2] : p;
      if (!body) throw new Error("Недостасува формула по бројот.");
      const counts = parsePart(body);
      for (const sym in counts) total[sym] = (total[sym] || 0) + counts[sym] * coef;
    });
    return total;
  }

  // ---------- Калкулатор: приказ ----------
  const input = document.getElementById("calc-input");
  const errBox = document.getElementById("calc-error");
  const resBox = document.getElementById("calc-result");
  const body = document.getElementById("calc-body");
  const NA = 6.02214076e23, VM = 22.4;
  let M = null;

  const fmt = (n, d) => n.toFixed(d).replace(".", ",");
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = n => String(n).split("").map(c => (c === "-" ? "⁻" : SUP[+c])).join("");
  const sub = n => String(n).split("").map(c => SUBS[+c]).join("");

  function formulaPretty(counts) {
    return Object.keys(counts).map(s => s + (counts[s] > 1 ? sub(counts[s]) : "")).join("");
  }

  function calculate() {
    errBox.hidden = true;
    let counts;
    try {
      counts = parseFormula(input.value);
    } catch (e) {
      M = null;
      resBox.hidden = true;
      errBox.textContent = e.message;
      errBox.hidden = false;
      return;
    }
    if (!counts) { M = null; resBox.hidden = true; return; }

    let total = 0, anyRadio = false;
    Object.keys(counts).forEach(s => (total += counts[s] * BY_SYM[s].mass));
    M = total;

    body.replaceChildren();
    Object.keys(counts).forEach(s => {
      const e = BY_SYM[s], sum = counts[s] * e.mass;
      if (e.radio) anyRadio = true;
      const tr = node("tr");
      tr.append(
        node("td", "", `${e.name} (${s})${e.radio ? " *" : ""}`),
        node("td", "", String(counts[s])),
        node("td", "", fmtNum(e.mass)),
        node("td", "", fmt(sum, 3)),
        node("td", "", fmt((sum / total) * 100, 2) + " %")
      );
      body.appendChild(tr);
    });
    document.getElementById("calc-M").textContent = fmt(total, 3);
    document.getElementById("calc-formula").textContent = "M(" + formulaPretty(counts) + ")";
    document.getElementById("calc-radio").hidden = !anyRadio;
    resBox.hidden = false;
    convFrom(lastField);
  }

  // ---------- Претворање ----------
  const f = { m: document.getElementById("cv-m"), n: document.getElementById("cv-n"), N: document.getElementById("cv-N"), V: document.getElementById("cv-V") };
  let lastField = null;

  function parseNumber(str) {
    let s = str.trim();
    if (!s) return null;
    s = Array.from(s).map(c => (SUP.includes(c) ? String(SUP.indexOf(c)) : c === "⁻" ? "-" : c)).join("");
    s = s.replace(/\s/g, "").replace(/,/g, ".").replace(/[·×x*]10\^?/i, "e");
    const v = Number(s);
    return isFinite(v) && v >= 0 ? v : NaN;
  }
  function sci(x) {
    if (x === 0) return "0";
    const exp = Math.floor(Math.log10(x));
    if (exp >= -2 && exp <= 4) return fmt(+x.toPrecision(5), Math.max(0, 4 - exp)).replace(/,?0+$/, "");
    return fmt(x / Math.pow(10, exp), 3) + " · 10" + sup(exp);
  }
  function plain(x) {
    if (x === 0) return "0";
    if (x >= 0.001 && x < 1e6) return String(+x.toPrecision(6)).replace(".", ",");
    return sci(x);
  }

  function convFrom(which) {
    if (M === null) return;
    if (!which) { Object.values(f).forEach(el => (el.classList.remove("bad"))); return; }
    const v = parseNumber(f[which].value);
    Object.keys(f).forEach(k => f[k].classList.remove("bad"));
    if (v === null) { Object.keys(f).forEach(k => { if (k !== which) f[k].value = ""; }); return; }
    if (Number.isNaN(v)) { f[which].classList.add("bad"); return; }
    let n;
    if (which === "m") n = v / M;
    else if (which === "n") n = v;
    else if (which === "N") n = v / NA;
    else n = v / VM;
    if (which !== "m") f.m.value = plain(n * M);
    if (which !== "n") f.n.value = plain(n);
    if (which !== "N") f.N.value = sci(n * NA);
    if (which !== "V") f.V.value = plain(n * VM);
  }
  Object.keys(f).forEach(k =>
    f[k].addEventListener("input", () => { lastField = k; convFrom(k); })
  );

  input.addEventListener("input", calculate);

  // помошни копчиња за пишување
  document.querySelectorAll(".calc-key[data-ins]").forEach(b =>
    b.addEventListener("click", () => {
      const st = input.selectionStart ?? input.value.length, en = input.selectionEnd ?? st;
      input.value = input.value.slice(0, st) + b.dataset.ins + input.value.slice(en);
      input.focus();
      input.setSelectionRange(st + b.dataset.ins.length, st + b.dataset.ins.length);
      calculate();
    })
  );
  document.getElementById("calc-clear").addEventListener("click", () => {
    input.value = "";
    Object.values(f).forEach(el => (el.value = ""));
    lastField = null;
    calculate();
    input.focus();
  });

  // примери
  const EX = ["H2O", "CO2", "NaCl", "H2SO4", "Ca(OH)2", "Al2(SO4)3", "C6H12O6", "CuSO4·5H2O"];
  const exBox = document.getElementById("calc-examples");
  exBox.append(node("span", "calc-ex-l", "Примери:"));
  EX.forEach(x => {
    const b = node("button", "calc-ex", x.replace(/(^|[^·\d])(\d+)/g, (m, a, d) => a + sub(d)));
    b.type = "button";
    b.addEventListener("click", () => {
      input.value = x;
      lastField = null;
      Object.values(f).forEach(el => (el.value = ""));
      calculate();
    });
    exBox.appendChild(b);
  });

  // за тестирање
  window.__alatki = { parseFormula, EL, CAT_OF, pos };
})();
