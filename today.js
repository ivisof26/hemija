// „Денес во хемијата“: прикажува кој хемичар е роден на денешниот датум (chemists.js)
(function () {
  const box = document.getElementById("today-box");
  if (!box) return;

  const MONTHS = ["јануари","февруари","март","април","мај","јуни","јули","август","септември","октомври","ноември","декември"];
  const pad = n => String(n).padStart(2, "0");
  const key = (m, d) => `${pad(m)}-${pad(d)}`;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  const now = new Date();
  const todayKey = key(now.getMonth() + 1, now.getDate());
  document.getElementById("today-date").textContent = `${now.getDate()} ${MONTHS[now.getMonth()]}`;

  const matches = CHEMISTS.filter(c => c.d === todayKey);

  if (matches.length) {
    matches.forEach(c => {
      const card = el("article", "today-card");
      card.append(el("span", "today-year", `роден/а ${c.year}`), el("h3", "", c.name), el("p", "", c.text));
      box.appendChild(card);
    });
  } else {
    // Нема запис за денес — покажи го следниот хемичар по датум
    const sorted = [...CHEMISTS].sort((a, b) => a.d.localeCompare(b.d));
    const next = sorted.find(c => c.d > todayKey) || sorted[0];
    const [m, d] = next.d.split("-").map(Number);
    const card = el("article", "today-card muted");
    card.append(
      el("span", "today-year", "Денес нема забележан роденден во листата"),
      el("h3", "", `Следно: ${next.name}`),
      el("p", "", `Роден/а на ${d} ${MONTHS[m - 1]} ${next.year}. ${next.text}`)
    );
    box.appendChild(card);
  }
})();
