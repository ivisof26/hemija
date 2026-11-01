// Заеднички помошни функции за игрите (меморија, равенки, бесилка)
const G = {
  el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  },
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  // Редица со избор (копчиња). items = [[вредност, текст], ...]
  chips(label, items, value, onPick) {
    const row = G.el("div", "opt-row");
    row.appendChild(G.el("span", "opt-label", label));
    items.forEach(([v, t]) => {
      const b = G.el("button", "btn ghost" + (v === value ? " active" : ""), t);
      b.type = "button";
      b.addEventListener("click", () => {
        row.querySelectorAll("button").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        onPick(v);
      });
      row.appendChild(b);
    });
    return row;
  },
  grade(pct) {
    if (pct >= 80) return ["🏆", "Одлично! Вистински хемичар!"];
    if (pct >= 50) return ["👍", "Добро! Уште малку вежбање."];
    return ["💪", "Продолжи да вежбаш, ќе успееш!"];
  },
  // Екран со резултат. o = { stage, bar, counter, emoji, title, msg, again }
  result(o) {
    o.bar.style.width = "100%";
    o.counter.textContent = "Готово!";
    const slide = G.el("div", "slide result");
    slide.append(G.el("p", "big", o.emoji), G.el("h3", "", o.title), G.el("p", "", o.msg));
    const b = G.el("button", "btn primary", "Играј пак");
    b.type = "button";
    b.addEventListener("click", () => {
      slide.classList.add("leaving");
      setTimeout(o.again, 300);
    });
    slide.appendChild(b);
    o.stage.replaceChildren(slide);
  }
};
