// Игра „Езеро на работ“: pH, киселински дожд, затоплување и мерки за спас на езерото
(function () {
  const root = document.getElementById("ez-root");
  if (!root) return;

  const YEARS = 10;
  const INCOME = 3;                       // нови поени секоја година
  const ACID = [0, 0.12, 0.28, 0.45];     // колку pH се намалува годишно (ниво на SO₂ / NOx: 0–3)
  const WARM = [0, 0.15, 0.30, 0.45];     // загревање годишно во °C (ниво на CO₂: 0–3)
  const MAX_PH = 9.6;

  // Приближни вредности за играта (не се строги научни граници)
  const LIFE = [
    { id: "pas", e: "🐟", n: "Пастрмка", lo: 6.5, hi: 8.5, t: 16, why: "Бара студена, чиста и кислородна вода." },
    { id: "plo", e: "🐠", n: "Плотица", lo: 5.5, hi: 9.0, t: 27, why: "Прилично издржлива риба." },
    { id: "stu", e: "🐡", n: "Штука", lo: 5.5, hi: 9.0, t: 24, why: "Грабливка: гине ако ѝ исчезне храната." },
    { id: "zab", e: "🐸", n: "Жаби", lo: 6.0, hi: 9.0, t: 30, why: "Јајцата им се многу чувствителни на киселина." },
    { id: "daf", e: "🦐", n: "Дафнии (ракчиња)", lo: 6.5, hi: 8.5, t: 26, why: "Храна за рибите; првите страдаат од кисела вода." }
  ];

  const MEASURES = [
    { id: "lime", ic: "🪨", n: "Вар во езерото", cost: 1,
      d: "CaCO₃ + 2H⁺ → Ca²⁺ + H₂O + CO₂↑ (pH расте за околу 0,8). Привремено: загадувањето продолжува." },
    { id: "filter", ic: "🏭", n: "Филтри на оџаците", cost: 2, max: 3,
      d: "Го намалува SO₂ и NOx (причина за кисел дожд). Трајно, но не го запира загревањето." },
    { id: "energy", ic: "☀️", n: "Сончева енергија", cost: 3, max: 3,
      d: "Помалку согорување: паѓаат и киселите гасови и CO₂ (загревањето)." },
    { id: "trees", ic: "🌳", n: "Дрвја на брегот", cost: 2, max: 3,
      d: "Сенка: водата е околу 1 °C постудена (повеќе кислород)." }
  ];

  let S;
  let helpOpen = true;
  const sup = n => String(n).replace(/-/g, "⁻").replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const fmt = (n, d = 1) => n.toFixed(d).replace(".", ",");
  function hText(pH) {
    const m = Math.pow(10, -pH), ex = Math.floor(Math.log10(m)), mant = m / Math.pow(10, ex);
    return fmt(mant) + "·10" + sup(ex) + " mol/L";
  }

  function fresh() {
    S = {
      year: 1, pH: 6.0, baseT: 13, heat: false, acidRain: false,
      so2: 3, co2: 3, budget: 4, bought: { filter: 0, energy: 0, trees: 0 },
      hp: {}, log: [], over: false
    };
    LIFE.forEach(l => (S.hp[l.id] = 100));
    S.log.push("Езерото е кисело (pH 6,0) и се затоплува. Купи мерки и кликни „Следна година“.");
  }
  const effT = () => S.baseT + (S.heat ? 3 : 0);
  const okFor = l => S.pH >= l.lo && S.pH <= l.hi && effT() <= l.t;
  function reason(l) {
    if (S.pH < l.lo) return "премногу кисело";
    if (S.pH > l.hi) return "премногу базно";
    if (effT() > l.t) return "премногу топло";
    return "";
  }
  const alive = () => LIFE.filter(l => S.hp[l.id] > 0);
  const level = n => ["нула", "мало", "средно", "големо"][n];

  function buy(id) {
    const m = MEASURES.find(x => x.id === id);
    if (S.over || S.budget < m.cost) return;
    if (m.max && S.bought[id] >= m.max) return;
    S.budget -= m.cost;
    if (id === "lime") {
      S.pH = Math.min(MAX_PH, S.pH + 0.8);
      S.log.unshift("🪨 Додаден вар: pH порасна на " + fmt(S.pH) + ".");
      if (S.pH > 9) S.log.unshift("⚠️ Над pH = 9 водата станува премногу базна за повеќето организми.");
    } else if (id === "filter") {
      S.bought.filter++; S.so2 = Math.max(0, S.so2 - 1);
      S.log.unshift("🏭 Филтри: нивото на кисели гасови е сега „" + level(S.so2) + "“.");
    } else if (id === "energy") {
      S.bought.energy++; S.so2 = Math.max(0, S.so2 - 1); S.co2 = Math.max(0, S.co2 - 1);
      S.log.unshift("☀️ Сончева енергија: киселите гасови „" + level(S.so2) + "“, CO₂ „" + level(S.co2) + "“.");
    } else if (id === "trees") {
      S.bought.trees++; S.baseT -= 1;
      S.log.unshift("🌳 Дрвја: температурата падна на " + fmt(effT()) + " °C.");
    }
    render();
  }

  function nextYear() {
    if (S.over) return;
    const notes = [];
    // настани
    S.heat = Math.random() < 0.2;
    S.acidRain = S.so2 > 0 && Math.random() < 0.25;
    // pH
    S.pH -= ACID[S.so2];
    if (S.so2 === 0) S.pH = Math.min(7.2, S.pH + 0.08);   // природно закрепнување
    if (S.acidRain) { S.pH -= 0.4; notes.push("🌧️ Кисел дожд: pH падна дополнително."); }
    S.pH = Math.max(3, S.pH);
    // температура
    S.baseT += WARM[S.co2];
    if (S.heat) notes.push("🔥 Топлотен бран: водата е привремено потопла за 3 °C.");
    // живот
    LIFE.forEach(l => {
      if (S.hp[l.id] <= 0) return;
      if (okFor(l)) S.hp[l.id] = Math.min(100, S.hp[l.id] + 20);
      else {
        S.hp[l.id] = Math.max(0, S.hp[l.id] - 35);
        if (S.hp[l.id] === 0) notes.push("💀 " + l.n + " исчезна (" + reason(l) + ").");
      }
    });
    // синџир на исхрана
    if (S.hp.daf <= 0 && S.hp.stu > 0) { S.hp.stu = Math.max(0, S.hp.stu - 25); notes.push("🍽️ Без дафнии штуката гладува."); }
    S.log.unshift("📅 Година " + S.year + ": pH " + fmt(S.pH) + ", " + fmt(effT()) + " °C.");
    notes.forEach(n => S.log.unshift(n));
    S.year++;
    S.budget += INCOME;
    if (S.year > YEARS) S.over = true;
    render();
  }

  // ---------- приказ ----------
  function waterColors() {
    const p = S.pH;
    if (p < 5) return ["#b59a52", "#7d6a30"];
    if (p < 6) return ["#7fb0a0", "#4b7f78"];
    if (p <= 8.5) return ["#58b3e8", "#1f6fb0"];
    return ["#5ad6bf", "#1c8f86"];
  }

  function stat(label, value, extra) {
    const d = G.el("div", "ez-stat");
    d.appendChild(G.el("span", "ez-stat-l", label));
    d.appendChild(G.el("strong", "ez-stat-v", value));
    if (extra) d.appendChild(G.el("span", "ez-stat-x", extra));
    return d;
  }

  function render() {
    root.textContent = "";
    if (S.over) return renderEnd();

    const help = G.el("details", "ez-help");
    if (helpOpen) help.open = true;
    help.addEventListener("toggle", () => { helpOpen = help.open; });
    help.appendChild(G.el("summary", "", "❓ Како се игра"));
    const ol = G.el("ol", "");
    [
      "Целта: за " + YEARS + " години да остане што повеќе живот во езерото.",
      "Секој вид има свој прифатлив pH и температура (пишува на картичката). Зелено = добро, портокалово = под стрес, црвено = исчезнал.",
      "Потроши ги поените на мерки: варта веднаш го дига pH, а филтрите и сончевата енергија ја запираат причината.",
      "Кликни „Следна година“. Загадувањето пак ја спушта pH и ја зголемува температурата, па планирај однапред.",
      "Видот исчезнува ако е неколку години надвор од своите оптимални услови за живот."
    ].forEach(t => ol.appendChild(G.el("li", "", t)));
    help.appendChild(ol);
    root.appendChild(help);

    const top = G.el("div", "ez-stats");
    top.appendChild(stat("Година", S.year + " / " + YEARS));
    top.appendChild(stat("pH", fmt(S.pH), "[H⁺] = " + hText(S.pH)));
    top.appendChild(stat("Температура", fmt(effT()) + " °C", S.heat ? "топлотен бран" : ""));
    top.appendChild(stat("Поени", String(S.budget)));
    root.appendChild(top);

    // скала за pH
    const scale = G.el("div", "ez-scale");
    const mk = G.el("div", "ez-marker");
    mk.style.left = Math.max(0, Math.min(100, ((S.pH - 3) / 7) * 100)) + "%";
    scale.appendChild(mk);
    root.appendChild(scale);
    const ticks = G.el("div", "ez-ticks");
    [3, 4, 5, 6, 7, 8, 9, 10].forEach(n => ticks.appendChild(G.el("span", "", String(n))));
    root.appendChild(ticks);

    // езеро
    const [w1, w2] = waterColors();
    const lake = G.el("div", "ez-lake" + (effT() > 20 ? " hot" : "") + (S.acidRain ? " rain" : ""));
    lake.style.setProperty("--w1", w1); lake.style.setProperty("--w2", w2);
    lake.setAttribute("role", "img");
    lake.setAttribute("aria-label", "Езеро со " + alive().length + " од " + LIFE.length + " видови живи");
    LIFE.forEach((l, i) => {
      const f = G.el("span", "ez-fish" + (S.hp[l.id] <= 0 ? " dead" : S.hp[l.id] < 100 ? " sick" : ""), S.hp[l.id] <= 0 ? "💀" : l.e);
      f.style.setProperty("--i", i);
      lake.appendChild(f);
    });
    if (S.acidRain) lake.appendChild(G.el("div", "ez-raintxt", "🌧️ кисел дожд"));
    root.appendChild(lake);

    // загадување
    const emis = G.el("p", "ez-emis");
    emis.textContent = "Кисели гасови (SO₂, NOx): " + level(S.so2) + "  ·  CO₂ (загревање): " + level(S.co2);
    root.appendChild(emis);

    // живот
    const grid = G.el("div", "ez-life");
    LIFE.forEach(l => {
      const hp = S.hp[l.id], dead = hp <= 0, ok = okFor(l);
      const c = G.el("div", "ez-card" + (dead ? " dead" : ok ? " ok" : " bad"));
      c.appendChild(G.el("div", "ez-card-h", l.e + " " + l.n));
      c.appendChild(G.el("div", "ez-card-r", "pH " + fmt(l.lo) + "–" + fmt(l.hi) + " · до " + l.t + " °C"));
      const bar = G.el("div", "ez-hp"); const fill = G.el("div", "ez-hp-f");
      fill.style.width = hp + "%"; bar.appendChild(fill); c.appendChild(bar);
      c.appendChild(G.el("div", "ez-card-s", dead ? "Исчезна" : ok ? "Добро" : "Под стрес: " + reason(l)));
      c.title = l.why;
      grid.appendChild(c);
    });
    root.appendChild(grid);

    // мерки
    root.appendChild(G.el("h4", "ez-h", "Мерки"));
    const ms = G.el("div", "ez-measures");
    MEASURES.forEach(m => {
      const used = m.max ? S.bought[m.id] : 0, maxed = m.max && used >= m.max;
      const b = G.el("button", "ez-measure");
      b.type = "button";
      b.disabled = maxed || S.budget < m.cost;
      b.appendChild(G.el("span", "ez-m-t", m.ic + " " + m.n));
      b.appendChild(G.el("span", "ez-m-c", maxed ? "максимум" : m.cost + (m.cost === 1 ? " поен" : " поени")));
      b.appendChild(G.el("span", "ez-m-d", m.d));
      b.addEventListener("click", () => buy(m.id));
      ms.appendChild(b);
    });
    root.appendChild(ms);

    const act = G.el("div", "actions");
    const nb = G.el("button", "btn primary", S.year === YEARS ? "Заврши ја последната година →" : "Следна година →");
    nb.type = "button"; nb.addEventListener("click", nextYear);
    act.appendChild(nb);
    root.appendChild(act);

    const log = G.el("ul", "ez-log");
    log.setAttribute("aria-live", "polite");
    S.log.slice(0, 6).forEach(t => log.appendChild(G.el("li", "", t)));
    root.appendChild(log);

    root.appendChild(G.el("p", "ez-note", "Забелешка: видовите и нивните граници се упростени, за потребите на играта. Секој пад на pH за 1 значи 10 пати повеќе H⁺ јони. Провери со pH-калкулаторот во Алатки."));
  }

  function renderEnd() {
    const n = alive().length, pct = Math.round((n / LIFE.length) * 100);
    const [emoji, msg] = G.grade(pct);
    const box = G.el("div", "ez-end");
    box.appendChild(G.el("div", "ez-end-e", emoji));
    box.appendChild(G.el("h3", "", "Преживеаја " + n + " од " + LIFE.length + " видови"));
    box.appendChild(G.el("p", "", msg));
    const ul = G.el("ul", "ez-end-l");
    LIFE.forEach(l => ul.appendChild(G.el("li", "", (S.hp[l.id] > 0 ? "✅ " : "💀 ") + l.n)));
    box.appendChild(ul);
    box.appendChild(G.el("p", "ez-note", "Како работи: киселинскиот дожд ја намалува pH. Варта (CaCO₃) привремено ја неутрализира киселината, но вистинското решение се филтрите и чистата енергија, кои ја запираат причината. Дрвјата и помалку CO₂ го забавуваат загревањето."));
    const act = G.el("div", "actions");
    const b = G.el("button", "btn primary", "Играј повторно");
    b.type = "button"; b.addEventListener("click", () => { fresh(); render(); });
    act.appendChild(b);
    box.appendChild(act);
    root.appendChild(box);
  }

  fresh(); render();
  window.__ez = { get S() { return S; }, buy, nextYear, fresh, render };
})();
