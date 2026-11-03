// Игра „Имиња на соединенија“: од формула до име или од име до формула
(function () {
  const ROUND = 10;
  const stage = document.getElementById("nam-stage");
  const counter = document.getElementById("nam-counter");
  const scoreLabel = document.getElementById("nam-score");
  const bar = document.getElementById("nam-bar");
  const optsBox = document.getElementById("nam-opts");
  let mode = "f2n";      // f2n = формула → име, n2f = име → формула
  let group = "all";
  let order = [], idx = 0, score = 0;

  function pool() { return group === "all" ? COMPOUNDS : COMPOUNDS.filter(c => c.g === group); }

  // Погрешни одговори: прво слични (ист прв збор или ист остаток), потоа од истата група
  function distractors(item, key) {
    const same = COMPOUNDS.filter(c => c !== item && c.g === item.g);
    const words = item.n.split(" ");
    const similar = same.filter(c => c.n.split(" ")[0] === words[0] || c.n.split(" ").slice(-1)[0] === words.slice(-1)[0]);
    const rest = G.shuffle(same.filter(c => !similar.includes(c)));
    const picked = G.shuffle(similar).slice(0, 2).concat(rest).slice(0, 3);
    let extra = G.shuffle(COMPOUNDS.filter(c => c !== item && !picked.includes(c)));
    while (picked.length < 3) picked.push(extra.pop());
    return picked.map(c => c[key]);
  }

  function showQ() {
    if (idx >= order.length) return end();
    counter.textContent = `Прашање ${idx + 1} од ${order.length}`;
    scoreLabel.textContent = `Поени: ${score}`;
    bar.style.width = `${(idx / order.length) * 100}%`;
    const item = order[idx];
    const askKey = mode === "f2n" ? "f" : "n", ansKey = mode === "f2n" ? "n" : "f";
    const options = G.shuffle([item[ansKey], ...distractors(item, ansKey)]);

    const slide = G.el("div", "slide");
    const q = G.el("h3", "question", mode === "f2n" ? "Како се именува соединението:" : "Која е формулата на соединението:");
    const big = G.el("p", "nam-big", item[askKey]);
    const box = G.el("div", "options");
    const explain = G.el("div", "explain");
    const actions = G.el("div", "actions");
    const btns = options.map(text => {
      const b = G.el("button", "option" + (mode === "n2f" ? " nam-formula" : ""), text);
      b.type = "button";
      box.appendChild(b);
      return b;
    });
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(x => (x.disabled = true));
      const ok = b.textContent === item[ansKey];
      if (ok) { score++; b.classList.add("correct"); }
      else {
        b.classList.add("wrong");
        btns.find(x => x.textContent === item[ansKey]).classList.add("correct");
      }
      scoreLabel.textContent = `Поени: ${score}`;
      const gr = COMPOUND_GROUPS[item.g];
      explain.textContent = `${ok ? "Точно! " : "Точниот одговор: "}${item.f} = ${item.n}. (${gr.name}) ${gr.rule}`;
      requestAnimationFrame(() => explain.classList.add("show"));
      const next = G.el("button", "btn primary", idx === order.length - 1 ? "Види резултат" : "Следно →");
      next.type = "button";
      next.addEventListener("click", () => {
        slide.classList.add("leaving");
        setTimeout(() => { idx++; showQ(); }, 300);
      });
      actions.appendChild(next);
    }));
    slide.append(q, big, box, explain, actions);
    stage.replaceChildren(slide);
  }

  function end() {
    const pct = Math.round((score / order.length) * 100);
    const [emoji, msg] = G.grade(pct);
    G.result({ stage, bar, counter, emoji, title: `${score} од ${order.length} точни (${pct}%)`, msg, again: start });
    scoreLabel.textContent = `Поени: ${score}`;
  }

  function start() {
    order = G.shuffle(pool()).slice(0, ROUND);
    idx = 0; score = 0;
    showQ();
  }

  optsBox.append(
    G.chips("Вежба:", [["f2n", "Формула → име"], ["n2f", "Име → формула"]], mode, v => { mode = v; start(); }),
    G.chips("Група:", [["all", "Сè"], ["oksid", "Оксиди"], ["kiselina", "Киселини"], ["baza", "Бази"], ["sol", "Соли"]], group, v => { group = v; start(); })
  );
  start();
})();
