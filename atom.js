// ИГРА „ИЗГРАДИ АТОМ“
// Се вчитува на страницата Игри (igri.html), во табот „Атом“.

(function () {
  "use strict";

  // Ако табот не постои на страницата, ништо не правиме
  const stage = document.getElementById("ab-stage");
  if (!stage) return;

  // ---------- ПОДАТОЦИ ----------
  // Елементи со атомски број 1-20: симбол, име, масен број на најчестиот изотоп
  const ELEMENTS = [null,
    {s:"H",  n:"Водород",    a:1},  {s:"He", n:"Хелиум",     a:4},
    {s:"Li", n:"Литиум",     a:7},  {s:"Be", n:"Берилиум",   a:9},
    {s:"B",  n:"Бор",        a:11}, {s:"C",  n:"Јаглерод",   a:12},
    {s:"N",  n:"Азот",       a:14}, {s:"O",  n:"Кислород",   a:16},
    {s:"F",  n:"Флуор",      a:19}, {s:"Ne", n:"Неон",       a:20},
    {s:"Na", n:"Натриум",    a:23}, {s:"Mg", n:"Магнезиум",  a:24},
    {s:"Al", n:"Алуминиум",  a:27}, {s:"Si", n:"Силициум",   a:28},
    {s:"P",  n:"Фосфор",     a:31}, {s:"S",  n:"Сулфур",     a:32},
    {s:"Cl", n:"Хлор",       a:35}, {s:"Ar", n:"Аргон",      a:40},
    {s:"K",  n:"Калиум",     a:39}, {s:"Ca", n:"Калциум",    a:40}
  ];

  // Јони: [атомски број, наелектризирање]
  const IONS = [[1,1],[1,-1],[3,1],[4,2],[7,-3],[8,-2],[9,-1],[11,1],[12,2],
                [13,3],[15,-3],[16,-2],[17,-1],[19,1],[20,2]];

  // Изотопи: [атомски број, масен број, дополнително име]
  const ISOTOPES = [[1,2,"деутериум"],[1,3,"тритиум"],[3,6,""],[5,10,""],[6,13,""],
                    [6,14,""],[7,15,""],[8,17,""],[8,18,""],[10,22,""],[12,26,""],
                    [17,37,""],[18,36,""],[19,41,""]];

  const MAX  = { p: 20, n: 24, e: 24 };      // најмногу честички од секој вид
  const CAPS = [2, 8, 8, 6];                 // колку електрони собира секоја обвивка
  const RING_R = [80, 115, 150, 180];        // радиуси на обвивките во SVG
  const RING_DUR = [4, 7, 11, 15];           // брзина на ротација (секунди)
  const NAMES = { p: "протони", n: "неутрони", e: "електрони" };

  // ---------- СОСТОЈБА ----------
  const state = { mode: "atom", task: null, solved: false };
  const cnt = { p: 0, n: 0, e: 0 };
  let score = { solved: 0, streak: 0 };
  let suppressClick = false;
  const T0 = performance.now();

  const $ = (id) => document.getElementById(id);
  const svg = $("ab-svg");

  // ---------- ПОМОШНИ ФУНКЦИИ ----------
  function rand(n) { return Math.floor(Math.random() * n); }

  function chargeStr(q) {
    if (q === 0) return "";
    return (Math.abs(q) === 1 ? "" : String(Math.abs(q))) + (q > 0 ? "+" : "−");
  }

  // ---------- ЗАДАЧИ ----------
  function makeTask(mode) {
    if (mode === "ion") {
      const [z, q] = IONS[rand(IONS.length)];
      const el = ELEMENTS[z];
      return { mode, z, a: el.a, q, key: "i" + z + "_" + q,
        label: `Изгради го јонот <b>${el.s}<sup>${chargeStr(q)}</sup></b> (${el.n.toLowerCase()}) со масен број <b>${el.a}</b>.` };
    }
    if (mode === "iso") {
      const [z, a, extra] = ISOTOPES[rand(ISOTOPES.length)];
      const el = ELEMENTS[z];
      const ex = extra ? ` (${extra})` : "";
      return { mode, z, a, q: 0, key: "s" + z + "_" + a,
        label: `Изгради го изотопот <b>${el.n.toLowerCase()}-${a}</b>${ex}, <sup>${a}</sup>${el.s}, како неутрален атом.` };
    }
    const z = 1 + rand(20), el = ELEMENTS[z];
    return { mode: "atom", z, a: el.a, q: 0, key: "a" + z,
      label: `Изгради неутрален атом на <b>${el.n.toLowerCase()}</b> (${el.s}) со масен број <b>${el.a}</b>.` };
  }

  function newTask() {
    let t, tries = 0;
    do { t = makeTask(state.mode); tries++; }
    while (state.task && t.key === state.task.key && tries < 10);
    state.task = t;
    state.solved = false;
    cnt.p = cnt.n = cnt.e = 0;
    stage.classList.remove("ab-ok");
    $("ab-btn-check").disabled = false;
    $("ab-task").innerHTML = t.label;
    setMsg("info", "Изгради ја честичката од задачата, па кликни „Провери“.");
    render();
  }

  // ---------- ЦРТАЊЕ НА АТОМОТ ----------
  function nucleusOrder(p, n) {
    const out = []; let pi = 0, ni = 0;
    for (let i = 0; i < p + n; i++) {
      if (pi < p && (ni >= n || pi / p <= ni / n)) { out.push("p"); pi++; }
      else { out.push("n"); ni++; }
    }
    return out;
  }

  function ringFill(e) {
    const out = []; let left = e;
    CAPS.forEach((c) => { const x = Math.min(c, left); out.push(x); left -= x; });
    return out;
  }

  function render() {
    const { p, n, e } = cnt;
    let g = "";
    const rings = ringFill(e);

    RING_R.forEach((r, k) => {
      if (k < 3 || rings[k] > 0) g += `<circle class="ab-s-orbit" cx="200" cy="200" r="${r}"/>`;
    });

    const total = p + n;
    if (total === 0 && e === 0) {
      g += `<text class="ab-s-empty" x="200" y="205">Повлечи ги честичките тука</text>`;
    }

    if (total > 0) {
      const nr = 7.6 * Math.sqrt(total) + 12;
      g += `<circle class="ab-s-glow" cx="200" cy="200" r="${(nr + 8).toFixed(1)}"/>`;
      nucleusOrder(p, n).forEach((t, i) => {
        const rad = 7.6 * Math.sqrt(i + 0.5), ang = i * 2.399963;
        const x = (200 + rad * Math.cos(ang)).toFixed(1);
        const y = (200 + rad * Math.sin(ang)).toFixed(1);
        g += `<circle class="ab-s-${t}" cx="${x}" cy="${y}" r="7.2"/>`;
        if (t === "p") g += `<text class="ab-s-t" x="${x}" y="${y}">+</text>`;
      });
    }

    // Електрони: ротираат; фазата се чува за да нема скокање при секоја промена
    const now = (performance.now() - T0) / 1000;
    rings.forEach((c, k) => {
      if (!c) return;
      const dur = RING_DUR[k], delay = -(now % dur);
      let es = "";
      for (let j = 0; j < c; j++) {
        const a = (2 * Math.PI * j) / c + k * 0.8;
        const x = (200 + RING_R[k] * Math.cos(a)).toFixed(1);
        const y = (200 + RING_R[k] * Math.sin(a)).toFixed(1);
        es += `<circle class="ab-s-e" cx="${x}" cy="${y}" r="6.2"/><text class="ab-s-t" x="${x}" y="${y}">−</text>`;
      }
      g += `<g class="ab-ring" style="animation-duration:${dur}s;animation-delay:${delay.toFixed(2)}s;animation-direction:${k % 2 ? "reverse" : "normal"}">${es}</g>`;
    });

    svg.innerHTML = g;

    // Броила
    ["p", "n", "e"].forEach((t) => { $("ab-cnt-" + t).textContent = cnt[t]; });

    // Ознака во живо
    const z = p, a = p + n, q = p - e;
    const sym = z >= 1 && z <= 20 ? ELEMENTS[z].s : "?";
    $("ab-nota").innerHTML =
      `<span class="nums"><span>${a}</span><span>${z}</span></span><span>${sym}</span>` +
      (q !== 0 ? `<span class="q">${chargeStr(q)}</span>` : "");

    $("ab-facts").innerHTML =
      `Атомски број Z = <b>${z}</b> (број на протони)<br>` +
      `Масен број A = <b>${a}</b> (протони + неутрони)<br>` +
      `Полнеж = <b>${q === 0 ? "0" : (q > 0 ? "+" : "−") + Math.abs(q)}</b>` +
      (z >= 1 && z <= 20 ? `<br>Елемент: <b>${ELEMENTS[z].n}</b>` : "");
  }

  // ---------- ДОДАВАЊЕ И ОТСТРАНУВАЊЕ ----------
  function bump(type) {
    const el = $("ab-cnt-" + type);
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
  }

  function clearIfWrong() {
    const m = $("ab-msg");
    if (m.classList.contains("bad")) setMsg("info", "Продолжи со градењето, па повторно кликни „Провери“.");
  }

  function add(type) {
    if (state.solved) return;
    if (cnt[type] >= MAX[type]) {
      setMsg("info", `Не може повеќе: најмногу ${MAX[type]} ${NAMES[type]} во оваа игра.`);
      return;
    }
    cnt[type]++; clearIfWrong(); render(); bump(type);
  }

  function remove(type) {
    if (state.solved || cnt[type] === 0) return;
    cnt[type]--; clearIfWrong(); render(); bump(type);
  }

  // ---------- ВЛЕКУВАЊЕ ----------
  function inStage(ev) {
    const r = stage.getBoundingClientRect();
    return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
  }

  function startDrag(e, chip) {
    const type = chip.dataset.type, sx = e.clientX, sy = e.clientY;
    let ghost = null, moved = false;
    try { chip.setPointerCapture(e.pointerId); } catch (_) {}

    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        moved = true;
        ghost = document.createElement("div");
        ghost.className = "ab-ghost ab-chip-" + type;
        ghost.textContent = chip.textContent;
        document.body.appendChild(ghost);
      }
      if (moved) {
        ghost.style.transform = `translate(${ev.clientX - 20}px, ${ev.clientY - 20}px)`;
        stage.classList.toggle("ab-over", inStage(ev));
      }
    };

    const up = (ev) => {
      chip.removeEventListener("pointermove", move);
      chip.removeEventListener("pointerup", up);
      chip.removeEventListener("pointercancel", up);
      try { chip.releasePointerCapture(ev.pointerId); } catch (_) {}
      if (moved) {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 60);
        stage.classList.remove("ab-over");
        if (ghost) ghost.remove();
        if (ev.type === "pointerup" && inStage(ev)) add(type);
      }
    };

    chip.addEventListener("pointermove", move);
    chip.addEventListener("pointerup", up);
    chip.addEventListener("pointercancel", up);
  }

  document.querySelectorAll(".ab-chip").forEach((chip) => {
    chip.addEventListener("click", () => { if (!suppressClick) add(chip.dataset.type); });
    chip.addEventListener("pointerdown", (e) => { if (e.button === undefined || e.button === 0) startDrag(e, chip); });
  });
  document.querySelectorAll(".ab-minus").forEach((b) => {
    b.addEventListener("click", () => remove(b.dataset.type));
  });

  // ---------- ПРОВЕРКА ----------
  function setMsg(kind, html) {
    const m = $("ab-msg");
    m.className = "ab-msg " + kind;
    m.innerHTML = html;
  }

  function check() {
    const t = state.task;
    if (!t || state.solved) return;
    const need = { p: t.z, n: t.a - t.z, e: t.z - t.q };
    const wrong = [];
    ["p", "n", "e"].forEach((k) => {
      if (cnt[k] !== need[k]) wrong.push(`${NAMES[k]}: ${cnt[k] < need[k] ? "има премалку" : "има премногу"}`);
    });

    if (wrong.length === 0) {
      state.solved = true;
      score.solved++; score.streak++;
      saveScore(); showScore();
      stage.classList.add("ab-ok");
      $("ab-btn-check").disabled = true;
      const eq = t.q === 0 ? `${t.z}` : `${t.z} ${t.q > 0 ? "−" : "+"} ${Math.abs(t.q)}`;
      setMsg("ok",
        `<b>Точно! 🎉</b><br>` +
        `Протони = Z = ${t.z}.<br>` +
        `Неутрони = A − Z = ${t.a} − ${t.z} = ${t.a - t.z}.<br>` +
        `Електрони = Z − полнеж = ${eq} = ${t.z - t.q}.`);
    } else {
      score.streak = 0; saveScore(); showScore();
      setMsg("bad", `<b>Не баш.</b> Провери: ${wrong.join("; ")}.<br>Не ти оди? Кликни „Совет“.`);
    }
  }

  function hint() {
    const t = state.task, el = ELEMENTS[t.z];
    setMsg("info",
      `<b>Совет:</b> атомскиот број на ${el.n.toLowerCase()} е <b>${t.z}</b>.<br>` +
      `Протони = Z. Неутрони = A − Z. Електрони = Z − полнеж.`);
  }

  // ---------- РЕЗУЛТАТ (се памти во прелистувачот) ----------
  function loadScore() {
    try {
      const s = JSON.parse(localStorage.getItem("ab-score"));
      if (s && typeof s.solved === "number") score = { solved: s.solved, streak: s.streak || 0 };
    } catch (_) {}
  }
  function saveScore() { try { localStorage.setItem("ab-score", JSON.stringify(score)); } catch (_) {} }
  function showScore() { $("ab-score").textContent = `Решени задачи: ${score.solved} · Тековна серија: ${score.streak}`; }

  // ---------- КОПЧИЊА ----------
  $("ab-btn-check").addEventListener("click", check);
  $("ab-btn-hint").addEventListener("click", hint);
  $("ab-btn-new").addEventListener("click", newTask);
  $("ab-btn-clear").addEventListener("click", () => {
    if (state.solved) return;
    cnt.p = cnt.n = cnt.e = 0; render();
    setMsg("info", "Исчистено. Почни одново.");
  });

  document.querySelectorAll(".ab-mode").forEach((b) => {
    b.addEventListener("click", () => {
      state.mode = b.dataset.mode;
      document.querySelectorAll(".ab-mode").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      state.task = null;
      newTask();
    });
  });

  // ---------- СТАРТ ----------
  loadScore(); showScore(); newTask();
})();
