// Бесилка: ги користи зборовите од anagram-words.js
(function () {
  const ROUND = 6, MAX = 6;
  const ALPHA = Array.from("АБВГДЃЕЖЗЅИЈКЛЉМНЊОПРСТЌУФХЦЧЏШ");
  const stage = document.getElementById("han-stage");
  const counter = document.getElementById("han-counter");
  const scoreLabel = document.getElementById("han-score");
  const bar = document.getElementById("han-bar");
  let order = [], idx = 0, score = 0;

  const SVG = `<svg class="hm-svg" viewBox="0 0 120 140" aria-hidden="true">
    <path d="M10 132h80M30 132V12h56v18" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
      <circle cx="86" cy="42" r="12"/><path d="M86 54v34"/><path d="M86 62l-16 14"/><path d="M86 62l16 14"/><path d="M86 88l-14 22"/><path d="M86 88l14 22"/>
    </g></svg>`;

  function meta() {
    counter.textContent = `Збор ${Math.min(idx + 1, order.length)} од ${order.length}`;
    scoreLabel.textContent = `Поени: ${score}`;
    bar.style.width = `${(idx / order.length) * 100}%`;
  }

  function showWord() {
    if (idx >= order.length) return end();
    meta();
    const item = order[idx];
    const letters = Array.from(item.word);
    const guessed = new Set();
    let wrong = 0, done = false;

    const slide = G.el("div", "slide");
    const draw = G.el("div");
    draw.innerHTML = SVG;
    const parts = Array.from(draw.querySelector("g").children);
    const lives = G.el("p", "hm-lives");
    const slotsBox = G.el("div", "ana-slots");
    const slots = letters.map(() => slotsBox.appendChild(G.el("span", "slot")));
    const keysBox = G.el("div", "hm-keys");
    const hintBox = G.el("p", "ana-hint", "💡 " + item.hint);
    hintBox.hidden = true;
    const hintBtn = G.el("button", "btn ghost", "💡 Помош");
    hintBtn.type = "button";
    const controls = G.el("div", "ana-controls");
    controls.appendChild(hintBtn);
    const actions = G.el("div", "actions");
    const keyBtns = [];

    function render() {
      slots.forEach((s, i) => {
        const shown = guessed.has(letters[i]);
        s.textContent = shown ? letters[i] : "";
        s.classList.toggle("filled", shown);
      });
      parts.forEach((p, i) => (p.style.display = i < wrong ? "" : "none"));
      lives.textContent = `Грешки: ${wrong} од ${MAX}`;
    }

    function finish() {
      done = true;
      keyBtns.forEach(b => (b.disabled = true));
      hintBtn.disabled = true;
      const next = G.el("button", "btn primary", idx === order.length - 1 ? "Види резултат" : "Следно →");
      next.type = "button";
      next.addEventListener("click", () => {
        slide.classList.add("leaving");
        setTimeout(() => { idx++; showWord(); }, 300);
      });
      actions.appendChild(next);
    }

    function guess(ch, b) {
      if (done || guessed.has(ch)) return;
      guessed.add(ch);
      b.disabled = true;
      if (letters.includes(ch)) b.classList.add("hit");
      else { b.classList.add("miss"); wrong++; }
      render();
      if (letters.every(l => guessed.has(l))) {
        score++;
        scoreLabel.textContent = `Поени: ${score}`;
        slots.forEach(s => s.classList.add("correct"));
        finish();
      } else if (wrong >= MAX) {
        letters.forEach((l, i) => {
          slots[i].textContent = l;
          slots[i].classList.add("filled", "revealed");
        });
        finish();
      }
    }

    ALPHA.forEach(ch => {
      const b = G.el("button", "letter key", ch);
      b.type = "button";
      b.addEventListener("click", () => guess(ch, b));
      keysBox.appendChild(b);
      keyBtns.push(b);
    });
    hintBtn.addEventListener("click", () => { hintBox.hidden = false; hintBtn.disabled = true; });

    slide.append(draw, lives, slotsBox, keysBox, controls, hintBox, actions);
    render();
    stage.replaceChildren(slide);
  }

  function end() {
    const pct = Math.round((score / order.length) * 100);
    const [emoji, msg] = G.grade(pct);
    G.result({ stage, bar, counter, emoji, title: `${score} од ${order.length} погодени (${pct}%)`, msg, again: start });
    scoreLabel.textContent = `Поени: ${score}`;
  }

  function start() {
    order = G.shuffle(ANAGRAMS).slice(0, ROUND);
    idx = 0; score = 0;
    showWord();
  }

  start();
})();
