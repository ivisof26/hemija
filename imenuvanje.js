// Игра „Имиња на соединенија“: внесување или избор
(function () {
  const ROUND = 10;
  const stage = document.getElementById("nam-stage");
  const counter = document.getElementById("nam-counter");
  const scoreLabel = document.getElementById("nam-score");
  const bar = document.getElementById("nam-bar");
  const optsBox = document.getElementById("nam-opts");
  let mode = "f2n";      // f2n = формула → име, n2f = име → формула
  let inputMode = true;  // true = пишување со текст
  let group = "all";
  let order = [], idx = 0, score = 0;

  function pool() { return group === "all" ? COMPOUNDS : COMPOUNDS.filter(c => c.g === group); }

  // Чистење и нормализација на внесениот текст за правилна споредба
  function cleanText(str) {
    return str.toLowerCase()
      .replace(/[\s\-_()]/g, "") // отстранува празни места, цртички, загради
      .replace(/₀/g, "0").replace(/₁/g, "1").replace(/₂/g, "2")
      .replace(/₃/g, "3").replace(/₄/g, "4").replace(/₅/g, "5")
      .replace(/₆/g, "6").replace(/₇/g, "7").replace(/₈/g, "8").replace(/₉/g, "9")
      .replace(/⁺/g, "+").replace(/⁻/g, "-");
  }

  function checkAnswer(userVal, correctVal) {
    // Ако е име со алтернативи разделени со „или“
    const options = correctVal.split(" или ").map(o => cleanText(o));
    return options.includes(cleanText(userVal));
  }

  function showQ() {
    if (idx >= order.length) return end();
    counter.textContent = `Прашање ${idx + 1} од ${order.length}`;
    scoreLabel.textContent = `Поени: ${score}`;
    bar.style.width = `${(idx / order.length) * 100}%`;
    const item = order[idx];
    const askKey = mode === "f2n" ? "f" : "n", ansKey = mode === "f2n" ? "n" : "f";

    const slide = G.el("div", "slide");
    const q = G.el("h3", "question", mode === "f2n" ? "Како се вика соединението:" : "Која е формулата на соединението:");
    const big = G.el("p", "nam-big", item[askKey]);
    const explain = G.el("div", "explain");
    const actions = G.el("div", "actions");

    // Режим на пишување текст
    const form = G.el("form", "nam-form");
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "12px";
    form.style.maxWidth = "400px";
    form.style.margin = "0 auto";

    const input = G.el("input", "nam-text-input");
    input.type = "text";
    input.placeholder = mode === "f2n" ? "Внеси име (на пр. сулфурна киселина)..." : "Внеси формула (на пр. H2SO4)...";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.style.padding = "12px 16px";
    input.style.fontSize = "1.1rem";
    input.style.borderRadius = "8px";
    input.style.border = "2px solid var(--border, #ccc)";
    input.style.outline = "none";
    input.style.textAlign = "center";

    const submitBtn = G.el("button", "btn primary", "Провери");
    submitBtn.type = "submit";

    form.append(input, submitBtn);
    slide.append(q, big, form, explain, actions);
    stage.replaceChildren(slide);

    setTimeout(() => input.focus(), 50);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;

      input.disabled = true;
      submitBtn.disabled = true;

      const ok = checkAnswer(val, item[ansKey]);
      if (ok) {
        score++;
        input.style.borderColor = "#2e7d4f";
        input.style.background = "#e8f5e9";
      } else {
        input.style.borderColor = "#b3261e";
        input.style.background = "#ffebee";
      }
      scoreLabel.textContent = `Поени: ${score}`;

      const gr = COMPOUND_GROUPS[item.g];
      explain.innerHTML = `${ok ? "<strong>Точно!</strong> " : `<strong>Неточно.</strong> Точниот одговор е: <strong>${item[ansKey]}</strong>.`}<br><small>(${gr.name}) ${gr.rule}</small>`;
      requestAnimationFrame(() => explain.classList.add("show"));

      const next = G.el("button", "btn primary", idx === order.length - 1 ? "Види резултат" : "Следно →");
      next.type = "button";
      next.addEventListener("click", () => {
        slide.classList.add("leaving");
        setTimeout(() => { idx++; showQ(); }, 300);
      });
      actions.replaceChildren(next);
      next.focus();
    });
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

  optsBox.replaceChildren(
    G.chips("Вежба:", [["f2n", "Формула → име"], ["n2f", "Име → формула"]], mode, v => { mode = v; start(); }),
    G.chips("Група:", [["all", "Сè"], ["oksid", "Оксиди"], ["kiselina", "Киселини"], ["baza", "Бази"], ["sol", "Соли"], ["kompleks", "Комплекси"]], group, v => { group = v; start(); })
  );
  start();
})();
