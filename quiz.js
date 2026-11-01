// Логика на квизот. Прашањата се во questions.js

const stage = document.getElementById("stage");
const progressBar = document.getElementById("progress-bar");
const counter = document.getElementById("counter");
const scoreLabel = document.getElementById("score-label");

document.getElementById("year").textContent = new Date().getFullYear();

const ROUND = 10; // колку прашања има една игра (се бираат случајно од questions.js)

// Поднасловот на страницата Квизови (ако го има) се прилагодува автоматски
const subtitle = document.querySelector(".page-head p");
if (subtitle) {
  subtitle.textContent = `Провери колку знаеш: ${Math.min(ROUND, QUESTIONS.length)} случајни прашања од ${QUESTIONS.length}, по секое има објаснување.`;
}

let current = 0;
let score = 0;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let order = shuffle(QUESTIONS).slice(0, ROUND);

function updateMeta() {
  counter.textContent = `Прашање ${Math.min(current + 1, order.length)} од ${order.length}`;
  scoreLabel.textContent = `Поени: ${score}`;
  progressBar.style.width = `${(current / order.length) * 100}%`;
}

function showQuestion() {
  if (current >= order.length) return showResult();

  const q = order[current];
  updateMeta();

  const slide = document.createElement("div");
  slide.className = "slide";

  const h = document.createElement("h3");
  h.className = "question";
  h.textContent = q.question;
  slide.appendChild(h);

  const optionsBox = document.createElement("div");
  optionsBox.className = "options";

  const explain = document.createElement("div");
  explain.className = "explain";
  explain.textContent = q.explain;

  const actions = document.createElement("div");
  actions.className = "actions";

  // Одговорите се мешаат, за точниот да не биде секогаш на исто место
  const choices = shuffle(q.options.map((text, i) => ({ text, right: i === q.answer })));
  const rightIndex = choices.findIndex(c => c.right);

  choices.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = c.text;
    btn.addEventListener("click", () => {
      const all = optionsBox.querySelectorAll(".option");
      all.forEach(b => (b.disabled = true));

      if (c.right) {
        btn.classList.add("correct");
        score++;
      } else {
        btn.classList.add("wrong");
        all[rightIndex].classList.add("correct");
      }
      scoreLabel.textContent = `Поени: ${score}`;
      explain.classList.add("show");

      const next = document.createElement("button");
      next.className = "btn primary";
      next.textContent = current === order.length - 1 ? "Види резултат" : "Следно →";
      next.addEventListener("click", goNext);
      actions.appendChild(next);
    });
    optionsBox.appendChild(btn);
  });

  slide.append(optionsBox, explain, actions);
  stage.replaceChildren(slide);
}

function goNext() {
  const slide = stage.querySelector(".slide");
  slide.classList.add("leaving");
  setTimeout(() => {
    current++;
    showQuestion();
  }, 300);
}

function showResult() {
  progressBar.style.width = "100%";
  counter.textContent = "Готово!";
  scoreLabel.textContent = `Поени: ${score}`;

  const pct = Math.round((score / order.length) * 100);
  let emoji = "💪", msg = "Продолжи да вежбаш, ќе успееш!";
  if (pct >= 80) { emoji = "🏆"; msg = "Одлично! Вистински хемичар!"; }
  else if (pct >= 50) { emoji = "👍"; msg = "Добро! Уште малку вежбање."; }

  const slide = document.createElement("div");
  slide.className = "slide result";
  slide.innerHTML = `
    <p class="big">${emoji}</p>
    <h3>${score} од ${order.length} точни (${pct}%)</h3>
    <p>${msg}</p>
    <button class="btn primary" id="restart">Играј пак</button>
  `;
  stage.replaceChildren(slide);

  document.getElementById("restart").addEventListener("click", () => {
    current = 0;
    score = 0;
    order = shuffle(QUESTIONS).slice(0, ROUND);
    stage.firstChild.classList.add("leaving");
    setTimeout(showQuestion, 300);
  });
}

showQuestion();
