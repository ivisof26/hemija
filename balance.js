// Балансирање равенки. Равенките се во equations.js
(function () {
  const ROUND = 8;
  const stage = document.getElementById("bal-stage");
  const counter = document.getElementById("bal-counter");
  const scoreLabel = document.getElementById("bal-score");
  const bar = document.getElementById("bal-bar");
  let order = [], idx = 0, score = 0;
  let level = "all";

  // Тежина според најголемиот коефициент
  const levelOf = e => { const m = Math.max(...e.c); return m <= 2 ? "easy" : m <= 4 ? "mid" : "hard"; };

  const opts = G.el("div", "game-opts");
  opts.appendChild(G.chips("Тежина:", [["all", "Сите"], ["easy", "Лесни"], ["mid", "Средни"], ["hard", "Тешки"]], level, v => { level = v; start(); }));
  stage.parentNode.insertBefore(opts, stage);

  const btn = (txt, cls) => { const b = G.el("button", cls, txt); b.type = "button"; return b; };

  function meta() {
    counter.textContent = `Равенка ${Math.min(idx + 1, order.length)} од ${order.length}`;
    scoreLabel.textContent = `Поени: ${score}`;
    bar.style.width = `${(idx / order.length) * 100}%`;
  }

  function showEq() {
    if (idx >= order.length) return end();
    meta();
    const e = order[idx];
    const names = [...e.r, ...e.p];
    const vals = names.map(() => 1);
    let locked = false, revealed = false;

    const slide = G.el("div", "slide");
    const eq = G.el("div", "bal-eq");
    const nums = [];
    names.forEach((f, k) => {
      if (k > 0) eq.appendChild(G.el("span", "bal-op", k === e.r.length ? "→" : "+"));
      const term = G.el("div", "bal-term");
      const ctl = G.el("div", "bal-ctl");
      const minus = btn("−"), plus = btn("+");
      const n = G.el("span", "bal-n", "1");
      nums.push(n);
      const step = d => () => {
        if (locked) return;
        vals[k] = Math.max(1, Math.min(9, vals[k] + d));
        n.textContent = vals[k];
      };
      minus.addEventListener("click", step(-1));
      plus.addEventListener("click", step(1));
      minus.setAttribute("aria-label", "Намали");
      plus.setAttribute("aria-label", "Зголеми");
      ctl.append(minus, n, plus);
      term.append(ctl, G.el("span", "bal-f", f));
      eq.appendChild(term);
    });

    const msg = G.el("p", "bal-msg", "Користи најмали цели броеви.");
    const controls = G.el("div", "ana-controls");
    const checkBtn = btn("✔ Провери", "btn ghost");
    const showBtn = btn("Прикажи одговор", "btn ghost");
    controls.append(checkBtn, showBtn);
    const actions = G.el("div", "actions");

    function finish() {
      locked = true;
      eq.querySelectorAll("button").forEach(b => (b.disabled = true));
      checkBtn.disabled = true;
      showBtn.disabled = true;
      const next = btn(idx === order.length - 1 ? "Види резултат" : "Следно →", "btn primary");
      next.addEventListener("click", () => {
        slide.classList.add("leaving");
        setTimeout(() => { idx++; showEq(); }, 300);
      });
      actions.appendChild(next);
    }

    checkBtn.addEventListener("click", () => {
      if (locked) return;
      if (vals.every((v, k) => v === e.c[k])) {
        score++;
        scoreLabel.textContent = `Поени: ${score}`;
        eq.classList.add("ok");
        msg.textContent = "Точно! Равенката е израмнета — атомите се исти од двете страни.";
        finish();
      } else {
        eq.classList.add("bad");
        msg.textContent = "Уште не е израмнето — изброј ги атомите од двете страни.";
        setTimeout(() => eq.classList.remove("bad"), 500);
      }
    });
    showBtn.addEventListener("click", () => {
      if (locked) return;
      e.c.forEach((v, k) => { vals[k] = v; nums[k].textContent = v; });
      msg.textContent = "Ова е точниот одговор.";
      finish();
    });

    slide.append(eq, msg, controls, actions);
    stage.replaceChildren(slide);
  }

  function end() {
    const pct = Math.round((score / order.length) * 100);
    const [emoji, msg] = G.grade(pct);
    G.result({ stage, bar, counter, emoji, title: `${score} од ${order.length} точни (${pct}%)`, msg, again: start });
    scoreLabel.textContent = `Поени: ${score}`;
  }

  function start() {
    order = G.shuffle(EQS.filter(e => level === "all" || levelOf(e) === level)).slice(0, ROUND);
    idx = 0; score = 0;
    showEq();
  }

  start();
})();
