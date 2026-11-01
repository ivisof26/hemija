// Тест по квалитативна анализа: сите прашања се на една страница (скролање), на крајот „Предај и провери“.
// Прашањата се во qa-questions.js, шемата во qa-scheme.js
(function () {
  const Q = QA_QUESTIONS;
  const stage = document.getElementById("qa-stage");
  const counter = document.getElementById("qa-counter");
  const scoreLabel = document.getElementById("qa-score");
  const bar = document.getElementById("qa-bar");
  const quizBox = document.getElementById("qa-quiz");

  let items = [], submitted = false, total = 0, warned = false, submitNote, submitBtn, submitRow;

  const btn = (txt, cls) => { const b = G.el("button", cls, txt); b.type = "button"; return b; };
  const fmt = n => String(Math.round(n * 10) / 10).replace(".", ",");

  // лентата со напредок останува видлива под заглавието на сајтот
  const sticky = document.getElementById("qa-sticky");
  function placeSticky() {
    const h = document.querySelector(".site-header");
    if (sticky && h) sticky.style.top = h.offsetHeight + "px";
  }
  window.addEventListener("resize", placeSticky);
  placeSticky();

  function meta() {
    const done = items.filter(i => i.answered()).length;
    counter.textContent = `Одговорени: ${done} од ${Q.length}`;
    scoreLabel.textContent = submitted ? `Поени: ${fmt(total)}` : "";
    bar.style.width = `${((submitted ? Q.length : done) / Q.length) * 100}%`;
    if (submitNote && !submitted) {
      warned = false;
      submitNote.textContent = done < Q.length ? `Неодговорени: ${Q.length - done}` : "Сè е одговорено.";
    }
  }

  // ---------- пишување со индекс/степен (секое прашање си има свој режим) ----------

  const SUB = "₀₁₂₃₄₅₆₇₈₉", SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const toSub = c => (/\d/.test(c) ? SUB[+c] : c);
  const toSup = c => (/\d/.test(c) ? SUP[+c] : c === "+" ? "⁺" : /[-‒−]/.test(c) ? "⁻" : c);
  const UN = {};
  [...SUB].forEach((c, i) => (UN[c] = String(i)));
  [...SUP].forEach((c, i) => (UN[c] = String(i)));
  UN["⁺"] = "+"; UN["⁻"] = "-";
  const plain = s => Array.from(s).map(c => UN[c] ?? c).join("").replace(/[\s\u00a0]/g, "").replace(/[‒−–—]/g, "-");
  // ok = точно напишано, fmt = формулата е точна, но индексите/степените не се како треба, bad = погрешно
  const judge = (val, exp) => (plain(val) !== plain(exp) ? "bad" : val.replace(/[\s\u00a0]/g, "").replace(/[‒−–—-]/g, "⁻") === exp.replace(/[\s\u00a0]/g, "") ? "ok" : "fmt");
  const mark = (el, r) => { el.classList.remove("ok", "bad", "fmt"); el.classList.add(r); if (r === "fmt") el.title = "Формулата е точна, провери ги индексите и степените."; };

  function editor(onChange) {
    let mode = "n";
    const tools = G.el("div", "qa-tools");
    tools.appendChild(G.el("span", "qa-tools-label", "Пишување:"));
    const modes = ["n", "sub", "sup"];
    const btns = [["Aa Нормално"], ["x₂ Индекс"], ["x² Степен"]].map(([t], k) => {
      const b = btn(t, "btn ghost" + (k === 0 ? " active" : ""));
      b.addEventListener("pointerdown", e => e.preventDefault()); // полето да не го губи фокусот
      b.addEventListener("click", () => {
        mode = modes[k];
        btns.forEach((x, j) => x.classList.toggle("active", j === k));
      });
      tools.appendChild(b);
      return b;
    });
    tools.appendChild(G.el("span", "qa-tools-hint", "Кликни на линија и пиши. Избери Индекс или Степен пред да ги внесеш цифрите (на пример PO₄³⁻)."));
    function field(cls) {
      const i = G.el("input", "qa-fill " + (cls || ""));
      i.type = "text";
      i.autocomplete = "off";
      i.spellcheck = false;
      i.setAttribute("autocapitalize", "off");
      i.addEventListener("input", e => {
        if (e.data && mode !== "n" && /^insert/.test(e.inputType)) {
          const conv = [...e.data].map(mode === "sub" ? toSub : toSup).join("");
          if (conv !== e.data) {
            const pos = i.selectionStart, start = pos - e.data.length;
            i.value = i.value.slice(0, start) + conv + i.value.slice(pos);
            i.setSelectionRange(start + conv.length, start + conv.length);
          }
        }
        onChange();
      });
      return i;
    }
    return { tools, field };
  }

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

  // ---------- прашања со понудени одговори ----------

  function mc(q, onChange) {
    const box = G.el("div", "options");
    let picked = -1;
    const btns = q.options.map((t, i) => {
      const b = G.el("button", "option", t);
      b.type = "button";
      b.addEventListener("click", () => {
        if (submitted) return;
        picked = i;
        btns.forEach((x, j) => x.classList.toggle("picked", j === i));
        onChange();
      });
      box.appendChild(b);
      return b;
    });
    return {
      nodes: [box],
      answered: () => picked >= 0,
      grade() {
        btns.forEach(b => { b.disabled = true; b.classList.remove("picked"); });
        if (picked === q.answer) btns[picked].classList.add("correct");
        else { if (picked >= 0) btns[picked].classList.add("wrong"); btns[q.answer].classList.add("correct"); }
        return { got: picked === q.answer ? 1 : 0, total: 1 };
      }
    };
  }

  // ---------- 15: шема со полиња за пишување ----------

  function scheme(q, onChange) {
    const D = QA_SCHEME;
    const ed = editor(onChange);
    const nodes = [ed.tools];
    const all = [];

    nodes.push(G.el("p", "qa-q qa-part", "А) Кои јони ги содржи растворот?"));
    const ionRow = G.el("div", "qa-ions");
    const ionFields = D.ions.map(ion => {
      const w = G.el("label", "qa-ion");
      const f = ed.field("inline");
      w.append(G.el("span", "", ion.label + " ="), f);
      ionRow.appendChild(w);
      all.push(f);
      return f;
    });
    nodes.push(ionRow);

    nodes.push(G.el("p", "qa-q qa-part", "Б) На празните линии во шемата запиши ги формулите на формираните талози."));
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
      const f = ed.field();
      f.style.cssText = `left:${(b.x / D.w) * 100}%;top:${(b.y / D.h) * 100}%;width:${(b.w / D.w) * 100}%;height:${(b.h / D.h) * 100}%`;
      f.setAttribute("aria-label", "Формула на талог");
      box.appendChild(f);
      all.push(f);
      return f;
    });
    scroll.appendChild(box);
    nodes.push(scroll);
    box.style.setProperty("--s", 0.6);
    if (window.ResizeObserver) new ResizeObserver(() => box.style.setProperty("--s", box.clientWidth / D.w)).observe(box);

    nodes.push(G.el("p", "qa-q qa-part", "В) Дали следното тврдење е точно: A1 во почетниот раствор може да биде SO₄²⁻."));
    const yn = G.el("div", "qa-yn");
    let pick = null;
    const ynBtns = ["ДА", "НЕ"].map(t => {
      const b = btn(t, "btn ghost");
      b.addEventListener("click", () => {
        if (submitted) return;
        pick = t;
        ynBtns.forEach(x => x.classList.toggle("active", x === b));
        onChange();
      });
      yn.appendChild(b);
      return b;
    });
    nodes.push(yn);

    return {
      nodes,
      answered: () => pick !== null || all.some(f => f.value.trim()),
      grade() {
        let got = 0;
        all.forEach(f => (f.disabled = true));
        ynBtns.forEach(b => (b.disabled = true));
        ionFields.forEach((f, i) => { const r = judge(f.value, D.ions[i].a); mark(f, r); if (r !== "bad") got++; });
        const pairs = {};
        D.blanks.forEach((b, i) => { if (b.pair) (pairs[b.pair] = pairs[b.pair] || []).push(i); });
        D.blanks.forEach((b, i) => {
          const f = blankFields[i];
          let r = judge(f.value, b.a);
          if (r === "bad" && b.pair) { // двата талога во пар може да се запишани со заменет редослед
            const other = pairs[b.pair].find(j => j !== i);
            if (plain(f.value) === plain(D.blanks[other].a) && plain(blankFields[other].value) === plain(b.a)) r = judge(f.value, D.blanks[other].a);
          }
          mark(f, r);
          if (r !== "bad") got++;
        });
        ynBtns.forEach(x => {
          if (x.textContent === D.yesno) x.classList.add("good-pick");
          else if (x.classList.contains("active")) x.classList.add("bad-pick");
        });
        if (pick === D.yesno) got++;
        return { got, total: D.ions.length + D.blanks.length + 1 };
      }
    };
  }

  // ---------- 16: повлечи и пушти ----------

  function dnd(q, onChange) {
    let locked = false, sel = null;
    const chips = [];
    const pool = G.el("div", "dz-body dz-pool");
    const groups = G.el("div", "dnd-groups");
    const bodies = [pool];

    const zoneAt = (x, y) => {
      const el = document.elementsFromPoint(x, y).find(e => e.classList && e.classList.contains("dz-body"));
      return el && bodies.includes(el) ? el : null;
    };

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
            onChange();
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
      onChange();
    }));

    const h2s = G.el("div", "dz-body h2s-row");
    const togs = q.ions.map(l => {
      const t = G.el("button", "chip tog", l);
      t.type = "button";
      t.addEventListener("click", () => { if (!locked) { t.classList.toggle("on"); onChange(); } });
      h2s.appendChild(t);
      return t;
    });

    return {
      nodes: [
        G.el("p", "qa-q qa-part", "Катјони (повлечи ги во групите, или кликни на катјон па на група):"), pool, groups,
        G.el("p", "qa-q qa-part", "Од нив со H₂S(aq) во кисела средина ќе се исталожат (кликни за да избереш):"), h2s
      ],
      answered: () => chips.some(c => c.parentElement !== pool) || togs.some(t => t.classList.contains("on")),
      grade() {
        locked = true;
        if (sel) sel.classList.remove("sel");
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
      }
    };
  }

  // ---------- 17: полиња за пишување ----------

  function fill(q, onChange) {
    const ed = editor(onChange);
    const nodes = [ed.tools];
    const fields = q.parts.map(p => {
      nodes.push(G.el("p", "qa-q qa-part", p.text));
      const row = G.el("label", "qa-ion qa-ion-wide");
      const f = ed.field("inline");
      row.append(G.el("span", "", p.label), f);
      nodes.push(row);
      return f;
    });
    return {
      nodes,
      answered: () => fields.some(f => f.value.trim()),
      grade() {
        let got = 0;
        fields.forEach((f, i) => { f.disabled = true; const r = judge(f.value, q.parts[i].a); mark(f, r); if (r !== "bad") got++; });
        return { got, total: q.parts.length };
      }
    };
  }

  // ---------- страница со сите прашања ----------

  const builders = { mc, scheme, dnd, fill };

  function build() {
    submitted = false; total = 0; warned = false;
    items = Q.map(q => {
      const it = builders[q.type](q, meta);
      it.q = q;
      const el = G.el("section", "qa-item");
      const head = G.el("div", "qa-head");
      it.badge = G.el("span", "qa-badge");
      head.append(G.el("span", "qa-num", `Прашање ${q.n}`), it.badge);
      el.append(head, G.el("h3", "question qa-q", q.q), ...it.nodes);
      if (q.type !== "mc") { it.ans = answerBox(q); el.appendChild(it.ans); }
      it.el = el;
      return it;
    });
    submitNote = G.el("span", "qa-result");
    submitBtn = btn("Предај и провери", "btn primary");
    submitBtn.addEventListener("click", submit);
    submitRow = G.el("div", "actions qa-grade");
    submitRow.append(submitNote, submitBtn);
    stage.replaceChildren(...items.map(i => i.el), submitRow);
    meta();
  }

  function submit() {
    const left = items.filter(i => !i.answered()).length;
    if (left && !warned) {
      warned = true;
      submitNote.textContent = `Има ${left} неодговорени прашања. Кликни повторно за да предадеш.`;
      return;
    }
    submitted = true;
    total = 0;
    const missed = [];
    items.forEach(it => {
      const r = it.grade();
      const frac = r.got / r.total;
      total += frac;
      it.badge.textContent = frac > 0.999 ? "✔ Точно" : r.total === 1 ? "✘ Погрешно" : `Точно: ${r.got} од ${r.total}`;
      it.badge.classList.add(frac > 0.999 ? "good" : "bad");
      if (it.ans) it.ans.classList.add("show");
      if (frac <= 0.999) missed.push(it);
    });

    const pct = Math.round((total / Q.length) * 100);
    const [emoji, msg] = G.grade(pct);
    const sum = G.el("div", "qa-summary");
    sum.append(G.el("p", "big", emoji), G.el("h3", "", `${fmt(total)} од ${Q.length} поени (${pct}%)`), G.el("p", "", msg));
    if (missed.length) {
      const list = G.el("p", "qa-missed", "За повторување: ");
      missed.forEach((it, k) => {
        const a = G.el("button", "qa-jump", `прашање ${it.q.n}`);
        a.type = "button";
        a.addEventListener("click", () => it.el.scrollIntoView({ behavior: "smooth", block: "start" }));
        list.appendChild(a);
        if (k < missed.length - 1) list.appendChild(document.createTextNode(", "));
      });
      sum.appendChild(list);
    }
    stage.insertBefore(sum, stage.firstChild);

    const again = btn("Обиди се пак", "btn primary");
    again.addEventListener("click", () => { build(); quizBox.scrollIntoView({ behavior: "smooth", block: "start" }); });
    submitRow.replaceChildren(again);
    meta();
    sum.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  build();
})();
