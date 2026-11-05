// Анаграм игра. Зборовите се во anagram-words.js

(function () {
  const ROUND = 10; // колку збора има во една игра

  const stage = document.getElementById("ana-stage");
  const counter = document.getElementById("ana-counter");
  const scoreLabel = document.getElementById("ana-score");
  const bar = document.getElementById("ana-bar");

  let order = [];
  let idx = 0;
  let score = 0;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Меша букви, но внимава резултатот да не биде истиот збор
  function scramble(word) {
    const letters = Array.from(word);
    let s = shuffle(letters);
    let tries = 0;
    while (s.join("") === word && tries < 20) {
      s = shuffle(letters);
      tries++;
    }
    return s;
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function updateMeta() {
    counter.textContent = `Збор ${Math.min(idx + 1, order.length)} од ${order.length}`;
    scoreLabel.textContent = `Поени: ${score}`;
    bar.style.width = `${(idx / order.length) * 100}%`;
  }

  function showWord() {
    if (idx >= order.length) return showResult();
    updateMeta();

    const item = order[idx];
    const word = item.word;
    let letters = scramble(word);
    let picked = []; // индекси од измешаните букви, по редослед на кликање
    let locked = false;
    let done = false;

    const slide = el("div", "slide");

    // Помошта е скриена додека играчот не кликне на копчето
    const hintBox = el("p", "ana-hint", "💡 " + item.hint);
    hintBox.hidden = true;

    const slotsBox = el("div", "ana-slots");
    const slots = Array.from(word).map(() => {
      const s = el("span", "slot");
      slotsBox.appendChild(s);
      return s;
    });

    const poolBox = el("div", "ana-pool");
    let poolBtns = [];

    function buildPool() {
      poolBox.replaceChildren();
      poolBtns = letters.map((ch, i) => {
        const b = el("button", "letter", ch);
        b.type = "button";
        b.addEventListener("click", () => pick(i));
        poolBox.appendChild(b);
        return b;
      });
    }

    const controls = el("div", "ana-controls");
    const hintBtn = el("button", "btn ghost", "💡 Помош");
    const undoBtn = el("button", "btn ghost", "⌫ Избриши");
    const shuffleBtn = el("button", "btn ghost", "🔀 Измешај");
    const skipBtn = el("button", "btn ghost", "Прикажи одговор");
    [hintBtn, undoBtn, shuffleBtn, skipBtn].forEach(b => (b.type = "button"));
    controls.append(hintBtn, undoBtn, shuffleBtn, skipBtn);

    hintBtn.addEventListener("click", () => {
      hintBox.hidden = false;
      hintBtn.disabled = true;
    });

    const actions = el("div", "actions");

    function refresh() {
      slots.forEach((s, i) => {
        const p = picked[i];
        s.textContent = p === undefined ? "" : letters[p];
        s.classList.toggle("filled", p !== undefined);
      });
      poolBtns.forEach((b, i) => {
        b.disabled = locked || picked.includes(i);
      });
    }

    function finish(reveal) function finish(reveal) {
      done = true;
      locked = true;
      if (reveal) {
        // Ги поставуваме точните букви во слотовите директно од зборот
        picked = [];
        Array.from(word).forEach((ch, i) => {
          slots[i].textContent = ch;
          slots[i].classList.remove("wrong");
          slots[i].classList.add("filled", "revealed");
        });
      }
      refresh();
      hintBtn.disabled = true;
      undoBtn.disabled = true;
      shuffleBtn.disabled = true;
      skipBtn.disabled = true;

      const next = el("button", "btn primary",
        idx === order.length - 1 ? "Види резултат" : "Следно →");
      next.type = "button";
      next.addEventListener("click", goNext);
      actions.appendChild(next);
      next.focus(); // автоматски фокус на копчето за следно прашање
    }
      refresh();
      hintBtn.disabled = true;
      undoBtn.disabled = true;
      shuffleBtn.disabled = true;
      skipBtn.disabled = true;

      const next = el("button", "btn primary",
        idx === order.length - 1 ? "Види резултат" : "Следно →");
      next.type = "button";
      next.addEventListener("click", goNext);
      actions.appendChild(next);
    }

    function check() {
      const attempt = picked.map(i => letters[i]).join("");
      if (attempt === word) {
        score++;
        scoreLabel.textContent = `Поени: ${score}`;
        slots.forEach(s => s.classList.add("correct"));
        finish(false);
      } else {
        slots.forEach(s => s.classList.add("wrong"));
        locked = true;
        refresh();
        setTimeout(() => {
          if (done) return;
          slots.forEach(s => s.classList.remove("wrong"));
          picked = [];
          locked = false;
          refresh();
        }, 700);
      }
    }

    function pick(i) {
      if (locked || picked.includes(i) || picked.length >= word.length) return;
      picked.push(i);
      refresh();
      if (picked.length === word.length) check();
    }

    undoBtn.addEventListener("click", () => {
      if (locked) return;
      picked.pop();
      refresh();
    });

    shuffleBtn.addEventListener("click", () => {
      if (locked) return;
      letters = scramble(word);
      picked = [];
      buildPool();
      refresh();
    });

    skipBtn.addEventListener("click", () => {
      if (done) return;
      finish(true);
    });

    slide.append(slotsBox, poolBox, controls, hintBox, actions);
    buildPool();
    refresh();
    stage.replaceChildren(slide);
  }

  function goNext() {
    const slide = stage.querySelector(".slide");
    slide.classList.add("leaving");
    setTimeout(() => {
      idx++;
      showWord();
    }, 300);
  }

  function showResult() {
    bar.style.width = "100%";
    counter.textContent = "Готово!";
    scoreLabel.textContent = `Поени: ${score}`;

    const pct = Math.round((score / order.length) * 100);
    let emoji = "💪", msg = "Продолжи да вежбаш, ќе успееш!";
    if (pct >= 80) { emoji = "🏆"; msg = "Одлично! Вистински хемичар!"; }
    else if (pct >= 50) { emoji = "👍"; msg = "Добро! Уште малку вежбање."; }

    const slide = el("div", "slide result");
    slide.innerHTML = `
      <p class="big">${emoji}</p>
      <h3>${score} од ${order.length} точни (${pct}%)</h3>
      <p>${msg}</p>
    `;
    const again = el("button", "btn primary", "Играј пак");
    again.type = "button";
    again.addEventListener("click", () => {
      slide.classList.add("leaving");
      setTimeout(start, 300);
    });
    slide.appendChild(again);
    stage.replaceChildren(slide);
  }

  function start() {
    order = shuffle(ANAGRAMS).slice(0, ROUND);
    idx = 0;
    score = 0;
    showWord();
  }

  start();
})();
