// Меморија: најди ги паровите симбол – име на елемент (елементите се во elements.js)
(function () {
  const stage = document.getElementById("mem-stage");
  const counter = document.getElementById("mem-counter");
  const scoreLabel = document.getElementById("mem-score");
  const bar = document.getElementById("mem-bar");

  let pool = 118;   // од колку први елементи се бира
  let N = 8;        // парови во една игра
  let moves, found, first, lock;

  const opts = G.el("div", "game-opts");
  opts.append(
    G.chips("Елементи:", [[20, "Првите 20"], [54, "Првите 54"], [118, "Сите 118"]], pool, v => { pool = v; start(); }),
    G.chips("Парови:", [[6, "6"], [8, "8"], [12, "12"]], N, v => { N = v; start(); })
  );
  stage.parentNode.insertBefore(opts, stage);

  function meta() {
    counter.textContent = `Парови: ${found} од ${N}`;
    scoreLabel.textContent = `Потези: ${moves}`;
    bar.style.width = `${(found / N) * 100}%`;
  }

  function finish() {
    const [emoji, msg] = G.grade(moves <= N * 1.5 ? 100 : moves <= N * 2.25 ? 60 : 0);
    G.result({ stage, bar, counter, emoji, title: `Сите парови за ${moves} потези`, msg, again: start });
  }

  function flip(b, c) {
    if (lock || b.classList.contains("open") || b.classList.contains("done")) return;
    b.classList.add("open");
    b.textContent = c.t;
    if (!first) { first = { b, c }; return; }
    moves++;
    const a = first;
    first = null;
    if (a.c.id === c.id) {
      a.b.classList.add("done"); b.classList.add("done");
      found++;
      meta();
      if (found === N) setTimeout(finish, 700);
    } else {
      lock = true;
      meta();
      setTimeout(() => {
        [a.b, b].forEach(x => { x.classList.remove("open"); x.textContent = ""; });
        lock = false;
      }, 800);
    }
  }

  function start() {
    moves = 0; found = 0; first = null; lock = false;
    const picked = G.shuffle(ELEMENTS.slice(0, pool)).slice(0, N);
    const cards = G.shuffle(
      picked.flatMap(([s, n], i) => [{ id: i, t: s, sym: true }, { id: i, t: n }])
    );
    const grid = G.el("div", "mem-grid slide");
    cards.forEach(c => {
      const b = G.el("button", "mem-card" + (c.sym ? " sym" : ""));
      b.type = "button";
      b.setAttribute("aria-label", "Картичка");
      b.addEventListener("click", () => flip(b, c));
      grid.appendChild(b);
    });
    stage.replaceChildren(grid);
    meta();
  }

  start();
})();
