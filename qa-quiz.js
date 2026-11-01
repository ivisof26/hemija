// Тест по квалитативна анализа. Прашањата се во qa-questions.js, шемата во qa-scheme.js
(function () {
  const Q = QA_QUESTIONS;
  const stage = document.getElementById("qa-stage");
  const counter = document.getElementById("qa-counter");
  const scoreLabel = document.getElementById("qa-score");
  const bar = document.getElementById("qa-bar");
  let idx = 0, score = 0, missed = [];

  const btn = (txt, cls) => { const b = G.el("button", cls, txt); b.type = "button"; return b; };
  const fmt = n => String(Math.round(n * 10) / 10).replace(".", ",");

  function meta() {
    counter.textContent = `Прашање ${Math.min(idx + 1, Q.length)} од ${Q.length}`;
    scoreLabel.textContent = `Поени: ${fmt(score)}`;
    bar.style.width = `${(idx / Q.length) * 100}%`;
  }

  function goNext(slide) {
    slide.classList.add("leaving");
    setTimeout(() => { idx++; show(); }, 300);
  }

  function show() {
    if (idx >= Q.length) return end();
    meta();
    mode = "n";
    const q = Q[idx];
    const slide = G.el("div", "slide");
    slide.appendChild(G.el("h3", "question qa-q", q.q));
    ({ mc, scheme, dnd, fill }[q.type])(slide, q);
    stage.replaceChildren(slide);
  }

  // ---------- заеднички делови за задачите со пишување/влечење ----------

  const SUB = "₀₁₂₃₄₅₆₇₈₉", SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const toSub = c => (/\d/.test(c) ? SUB[+c] : c);
  const toSup = c => (/\d/.test(c) ? SUP[+c] : c === "+" ? "⁺" : /[-‒−]/.test(c) ? "⁻" : c);
  const UN = {};
  [...SUB].forEach((c, i) => (UN[c] = String(i)));
  [...SUP].forEach((c, i) => (UN[c] = String(i)));
  UN["⁺"] = "+"; UN["⁻"] = "-";
  const plain = s => Array.from(s).map(c => UN[c] ?? c).join("").replace(/[\s\u00a0]/g, "").replace(/[‒−–—]/g, "-");
  // "ok" = точно напишано, "fmt" = формулата е точна, но индексите/степените не се како треба
  const judge = (val, exp) => (plain(val) !== plain(exp) ? "bad" : val.replace(/[\s\u00a0]/g, "").replace(/[‒−–—-]/g, "⁻") === exp.replace(/[\s\u00a0]/g, "") ? "ok" : "fmt");

  let mode = "n"; // n = нормално, sub = индекс, sup = степен

  function toolbar() {
    const bar = G.el("div", "qa-tools");
    bar.appendChild(G.el("span", "qa-tools-label", "Пишување:"));
    const btns = [["n", "Aa Нормално"], ["sub", "x₂ Индекс"], ["sup", "x² Степен"]].map(([m, t]) => {
      const b = btn(t, "btn ghost" + (m === mode ? " active" : ""));
      b.addEventListener("pointerdown", e => e.preventDefault()); // полето да не го губи фокусот
      b.addEventListener("click", () => {
        mode = m;
        btns.forEach((x, i) => x.classList.toggle("active", ["n", "sub", "sup"][i] === m));
      });
      bar.appendChild(b);
      return b;
    });
    bar.appendChild(G.el("span", "qa-tools-hint", "Кликни на линија и пиши. Избери Индекс или Степен пред да ги внесеш цифрите (на пример PO₄³⁻)."));
    return bar;
  }

  function field(cls) {
    const i = G.el("input", "qa-fill " + (cls || ""));
    i.type = "text";
    i.autocomplete = "off";
    i.spellcheck = false;
    i.setAttribute("autocapitalize", "off");
    i.addEventListener("input", e => {
      if (!e.data || mode === "n" || !/^insert/.test(e.inputType)) return;
      const conv = [...e.data].map(mode === "sub" ? toSub : toSup).join("");
      if (conv === e.data) return;
      const pos = i.selectionStart, start = pos - e.data.length;
      i.value = i.value.slice(0, start) + conv + i.value.slice(pos);
      i.setSelectionRange(start + conv.length, start + conv.length);
    });
    return i;
  }

  const mark = (el, r) => { el.classList.remove("ok", "bad", "fmt"); el.classList.add(r); if (r === "fmt") el.title = "Формулата е точна, провери ги индексите и степените."; };

  function answerBox(q) {
    const ans = G.el("div", "explain qa-answer");
    ans.append(G.el("strong", "", "Точен одговор"), G.el("div", "qa-answer-text", q.answer));
    if (q.imgAnswer) {
      const im = G.el("img", "qa-img");
      im.src = q.imgAnswer;
      im.alt = "Шема со одговорите";
      ans.appendChild(im);
    }
    return ans;
  }

  // Проверка + прикажи одговор за задача со повеќе полиња. grade() враќа дел од поените (0–1) и ги заклучува полињата
  function finishable(slide, q, grade, lock) {
    const ans = answerBox(q);
    const actions = G.el("div", "actions qa-grade");
    const note = G.el("span", "qa-result");
    const check = btn("✔ Провери", "btn primary");
    const show = btn("Прикажи одговор", "btn ghost");
    const done = frac => {
      lock();
      ans.classList.add("show");
      score += frac;
      if (frac < 0.999) missed.push(q.n);
      scoreLabel.textContent = `Поени: ${fmt(score)}`;
      const next = btn(idx === Q.length - 1 ? "Види резултат" : "Следно →", "btn primary");
      next.addEventListener("click", () => goNext(slide));
      actions.replaceChildren(note, next);
    };
    check.addEventListener("click", () => {
      const r = grade();
      note.textContent = `Точно: ${r.got} од ${r.total}`;
      done(r.got / r.total);
    });
    show.addEventListener("click", () => { note.textContent = "Одговорот е прикажан."; done(0); });
    actions.append(check, show);
    slide.append(ans, actions);
  }

  // ---------- прашања со понудени одговори ----------

  function mc(slide, q) {
    const box = G.el("div", "options");
    const actions = G.el("div", "actions");
    q.options.forEach((t, i) => {
      const b = G.el("button", "option", t);
      b.type = "button";
      b.addEventListener("click", () => {
        const all = box.querySelectorAll(".option");
        all.forEach(x => (x.disabled = true));
        if (i === q.answer) { b.classList.add("correct"); score++; }
        else { b.classList.add("wrong"); all[q.answer].classList.add("correct"); missed.push(q.n); }
        scoreLabel.textContent = `Поени: ${fmt(score)}`;
        const next = btn(idx === Q.length - 1 ? "Види резултат" : "Следно →", "btn primary");
        next.addEventListener("click", () => goNext(slide));
        actions.appendChild(next);
      });
      box.appendChild(b);
    });
    slide.append(box, actions);
  }

  // ---------- 15: шема со полиња за пишување ----------

  function scheme(slide, q) {
    const D = QA_SCHEME;
    const inputs = [];

    slide.appendChild(toolbar());

    slide.appendChild(G.el("p", "qa-q qa-part", "А) Кои јони ги содржи растворот?"));
    const ionRow = G.el("div", "qa-ions");
    const ionFields = D.ions.map(ion => {
      const w = G.el("label", "qa-ion");
      const f = field("inline");
      w.append(G.el("span", "", ion.label + " ="), f);
      ionRow.appendChild(w);
      inputs.push(f);
      return f;
    });
    slide.appendChild(ionRow);

    slide.appendChild(G.el("p", "qa-q qa-part", "Б) На празните линии во шемата запиши ги формулите на формираните талози."));
    const scroll = G.el("div", "qa-scheme-scroll");
    const box = G.el("div", "qa-scheme");
    box.style.aspectRatio = `${D.w} / ${D.h}`;
    let s = `<svg class="qa-svg" viewBox="0 0 ${D.w} ${D.h}" aria-hidden="true"><defs><marker id="qa-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0L10 5L0 10z" fill="#222"/></marker></defs>`;
    D.boxes.forEach(b => {
      s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${b.g ? "#e6e6e6" : "#fff"}" stroke="#222" stroke-width="2"/>`;
      b.t.forEach((line, i) => {
        s += `<text x="${b.x + b.w / 2}" y="${b.y + b.h / 2 + (i - (b.t.length - 1) / 2) * 32 + 9}" text-anchor="middle">${line}</text>`;
      });
    });
    D.arrows.forEach(a => { s += `<path d="${a.d}" fill="none" stroke="#222" stroke-width="2"${a.head ? ' marker-end="url(#qa-ah)"' : ""}/>`; });
    D.labels.forEach(l => { s += `<text x="${l.x}" y="${l.y}" text-anchor="${l.a || "middle"}">${l.t}</text>`; });
    s += "</svg>";
    box.innerHTML = s;
    const blankFields = D.blanks.map(b => {
      const f = field();
      f.style.cssText = `left:${(b.x / D.w) * 100}%;top:${(b.y / D.h) * 100}%;width:${(b.w / D.w) * 100}%;height:${(b.h / D.h) * 100}%`;
      f.setAttribute("aria-label", "Формула на талог");
      box.appendChild(f);
      inputs.push(f);
      return f;
    });
    scroll.appendChild(box);
    slide.appendChild(scroll);
    if (window.ResizeObserver) new ResizeObserver(() => box.style.setProperty("--s", box.clientWidth / D.w)).observe(box);
    box.style.setProperty("--s", 0.6);

    slide.appendChild(G.el("p", "qa-q qa-part", "В) Дали следното тврдење е точно: A1 во почетниот раствор може да биде SO₄²⁻."));
    const yn = G.el("div", "qa-yn");
    let pick = null;
    const ynBtns = ["ДА", "НЕ"].map(t => {
      const b = btn(t, "btn ghost");
      b.addEventListener("click", () => { pick = t; ynBtns.forEach(x => x.classList.toggle("active", x === b)); });
      yn.appendChild(b);
      return b;
    });
    slide.appendChild(yn);

    finishable(slide, q, () => {
      let got = 0;
      ionFields.forEach((f, i) => { const r = judge(f.value, D.ions[i].a); mark(f, r); if (r !== "bad") got++; });
      const pairs = {};
      D.blanks.forEach((b, i) => { if (b.pair) (pairs[b.pair] = pairs[b.pair] || []).push(i); });
      D.blanks.forEach((b, i) => {
        const f = blankFields[i];
        let r = judge(f.value, b.a);
        if (r === "bad" && b.pair) {
          // двата талога во пар може да се запишани со заменет редослед
          const other = pairs[b.pair].find(j => j !== i);
          if (plain(f.value) === plain(D.blanks[other].a) && plain(blankFields[other].value) === plain(b.a)) r = judge(f.value, D.blanks[other].a);
        }
        mark(f, r);
        if (r !== "bad") got++;
      });
      const yes = pick === D.yesno;
      ynBtns.forEach(x => { if (x.textContent === D.yesno) x.classList.add("good-pick"); else if (x.classList.contains("active")) x.classList.add("bad-pick"); });
      if (yes) got++;
      return { got, total: D.ions.length + D.blanks.length + 1 };
    }, () => {
      inputs.forEach(f => (f.disabled = true));
      ynBtns.forEach(b => (b.disabled = true));
    });
  }

  // ---------- 16: повлечи и пушти ----------

  function dnd(slide, q) {
    let locked = false, sel = null;
    const chips = [];
    const pool = G.el("div", "dz-body dz-pool");
    const groups = G.el("div", "dnd-groups");
    const bodies = [pool];

    function zoneAt(x, y) {
      const el = document.elementsFromPoint(x, y).find(e => e.classList && e.classList.contains("dz-body"));
      return el && bodies.includes(el) ? el : null;
    }

    function makeChip(label) {
      const c = G.el("div", "chip", label);
      c.dataset.ion = label;
      c.addEventListener("pointerdown", e => {
        if (locked || e.button > 0) return;
        e.preventDefault();
        c.setPointerCapture(e.pointerId);
        const r = c.getBoundingClientRect();
        const sx = e.clientX, sy = e.clientY, ox = sx - r.left, oy = sy - r.top;
        let moved = false, ghost = null, over = null;
        const clearOver = () => over && over.classList.remove("over");
        c.onpointermove = ev => {
          if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
          if (!moved) {
            moved = true;
            ghost = c.cloneNode(true);
            ghost.classList.add("ghost");
            document.body.appendChild(ghost);
            c.classList.add("dragging");
          }
          ghost.style.left = ev.clientX - ox + "px";
          ghost.style.top = ev.clientY - oy + "px";
          const z = zoneAt(ev.clientX, ev.clientY);
          if (z !== over) { clearOver(); over = z; if (z) z.classList.add("over"); }
        };
        const end = ev => {
          c.onpointermove = c.onpointerup = c.onpointercancel = null;
          clearOver();
          if (ghost) ghost.remove();
          c.classList.remove("dragging");
          if (moved) {
            const z = zoneAt(ev.clientX, ev.clientY);
            if (z) z.appendChild(c);
            if (sel) { sel.classList.remove("sel"); sel = null; }
          } else if (sel === c) { c.classList.remove("sel"); sel = null; }
          else { if (sel) sel.classList.remove("sel"); sel = c; c.classList.add("sel"); }
        };
        c.onpointerup = end;
        c.onpointercancel = end;
      });
      chips.push(c);
      return c;
    }

    G.shuffle(q.ions).forEach(l => pool.appendChild(makeChip(l)));

    q.groups.forEach(([name]) => {
      const g = G.el("div", "dz-group");
      const body = G.el("div", "dz-body");
      body.dataset.group = name;
      g.append(G.el("h4", "", name), body);
      groups.appendChild(g);
      bodies.push(body);
    });
    bodies.forEach(b => b.addEventListener("click", e => {
      if (locked || !sel || e.target.closest(".chip")) return;
      b.appendChild(sel);
      sel.classList.remove("sel");
      sel = null;
    }));

    slide.appendChild(G.el("p", "qa-q qa-part", "Катјони (повлечи ги во групите, или кликни на катјон па на група):"));
    slide.append(pool, groups);

    slide.appendChild(G.el("p", "qa-q qa-part", "Од нив со H₂S(aq) во кисела средина ќе се исталожат (кликни за да избереш):"));
    const h2s = G.el("div", "dz-body h2s-row");
    const togs = q.ions.map(l => {
      const t = G.el("button", "chip tog", l);
      t.type = "button";
      t.addEventListener("click", () => { if (!locked) t.classList.toggle("on"); });
      h2s.appendChild(t);
      return t;
    });
    slide.appendChild(h2s);

    finishable(slide, q, () => {
      let got = 0;
      const where = {};
      q.groups.forEach(([name, ions]) => ions.forEach(i => (where[i] = name)));
      chips.forEach(c => {
        const ok = c.parentElement.dataset.group === where[c.dataset.ion];
        c.classList.add(ok ? "ok" : "bad");
        if (!ok) c.title = "Точна група: " + where[c.dataset.ion];
        if (ok) got++;
      });
      let hits = 0, fp = 0;
      togs.forEach(t => {
        const should = q.h2s.includes(t.textContent), on = t.classList.contains("on");
        if (on && should) { hits++; t.classList.add("ok"); }
        else if (on) { fp++; t.classList.add("bad"); }
        else if (should) t.classList.add("missing");
      });
      return { got: got + Math.max(0, hits - fp), total: q.ions.length + q.h2s.length };
    }, () => { locked = true; if (sel) sel.classList.remove("sel"); });
  }

  // ---------- 17: полиња за пишување ----------

  function fill(slide, q) {
    slide.appendChild(toolbar());
    const fields = q.parts.map(p => {
      slide.appendChild(G.el("p", "qa-q qa-part", p.text));
      const row = G.el("label", "qa-ion qa-ion-wide");
      const f = field("inline");
      row.append(G.el("span", "", p.label), f);
      slide.appendChild(row);
      return f;
    });
    finishable(slide, q, () => {
      let got = 0;
      fields.forEach((f, i) => { const r = judge(f.value, q.parts[i].a); mark(f, r); if (r !== "bad") got++; });
      return { got, total: q.parts.length };
    }, () => fields.forEach(f => (f.disabled = true)));
  }

  function end() {
    const pct = Math.round((score / Q.length) * 100);
    const [emoji, msg] = G.grade(pct);
    const extra = missed.length ? ` За повторување: прашање ${missed.join(", ")}.` : "";
    G.result({ stage, bar, counter, emoji, title: `${fmt(score)} од ${Q.length} поени (${pct}%)`, msg: msg + extra, again: start });
    scoreLabel.textContent = `Поени: ${fmt(score)}`;
  }

  function start() { idx = 0; score = 0; missed = []; show(); }

  start();
})();
