// Игра „Лабораториска безбедност“ - Нов модерен стил
(function () {
  const svg = document.getElementById("sf-svg");
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]][a[j], a[i]]; } return a; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // Дефиниција на сите опасности и нивните интерактивни зони [x, y, w, h]
  const H = [
    {
      id: "polica",
      name: "Тешко шише на работ од полицата",
      why: "Шишето со киселина е на самиот раб и може лесно да падне и да се скрши.",
      fix: "Чувајте ги тешките шишиња на пониски полици и длабоко навнатре.",
      hot: [460, 45, 90, 60],
      bad: `<rect x="470" y="50" width="40" height="50" rx="6" fill="#a0522d"/><text x="490" y="80" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">H₂SO₄</text><path d="M490 50 L520 30" stroke="#ff4500" stroke-width="3" stroke-dasharray="4"/>`,
      good: `<rect x="470" y="65" width="40" height="35" rx="6" fill="#2e8b57"/><text x="490" y="88" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">H₂SO₄</text><rect x="460" y="95" width="110" height="5" fill="#4682b4" rx="2"/>`
    },
    {
      id: "etanol",
      name: "Отворен етанол до отворен пламен",
      why: "Запаливата течност е отворена во близина на горилник, што може да предизвика пожар.",
      fix: "Запаливите супстанци се чуваат затворени и подалеку од извори на топлина.",
      hot: [120, 210, 100, 90],
      bad: `<path d="M150 240 Q150 200 170 180 Q190 200 190 240 Z" fill="#ff4500" opacity="0.8"/><rect x="130" y="240" width="40" height="50" rx="5" fill="#ddd"/><text x="150" y="270" font-size="9" text-anchor="middle" font-weight="bold">ЕТАНОЛ</text>`,
      good: `<rect x="130" y="240" width="40" height="50" rx="5" fill="#4682b4"/><text x="150" y="270" font-size="9" text-anchor="middle" font-weight="bold" fill="#fff">ЕТАНОЛ</text>`
    },
    {
      id: "hrana",
      name: "Храна и пијалок во лабораторија",
      why: "Јадењето и пиењето во лабораторија го зголемува ризикот од труење со хемикалии.",
      fix: "Во лабораторија строго е забрането внесување и консумирање храна.",
      hot: [260, 240, 90, 60],
      bad: `<ellipse cx="300" cy="270" rx="35" ry="15" fill="#f5deb3"/><path d="M280 260 L320 250 L310 275 Z" fill="#cd853f"/><circle cx="340" cy="265" r="12" fill="#fff" stroke="#ccc"/>`,
      good: `<rect x="280" y="250" width="50" height="35" rx="3" fill="#4682b4"/><text x="305" y="272" fill="#fff" font-size="10" text-anchor="middle">Тетратка</text>`
    },
    {
      id: "kabel",
      name: "Електричен кабел во локва вода",
      why: "Опасност од краток спој, оштетување на опремата и сериозен струен удар.",
      fix: "Каблите мора да бидат суви, исправни и поставени подалеку од подни течности.",
      hot: [480, 310, 100, 80],
      bad: `<ellipse cx="530" cy="360" rx="40" ry="15" fill="#87ceeb" opacity="0.7"/><path d="M490 310 Q530 380 570 350" stroke="#000" stroke-width="4" fill="none"/>`,
      good: `<path d="M490 320 Q530 310 570 320" stroke="#333" stroke-width="4" fill="none"/>`
    },
    {
      id: "torba",
      name: "Торба поставена во премин",
      why: "Ранецот на подот го блокира патот за итна евакуација и предизвикува сопнување.",
      fix: "Личните работи се оставаат строго на предвидените гардероби или полици.",
      hot: [80, 380, 80, 90],
      bad: `<rect x="90" y="390" width="60" height="70" rx="15" fill="#b22222"/><rect x="105" y="380" width="30" height="15" rx="5" fill="#8b0000"/>`,
      good: ``
    },
    {
      id: "staklo",
      name: "Скршено стакло на подот",
      why: "Остатоците од скршено стакло можат да предизвикаат длабоки посекотини на нозете.",
      fix: "Скршеното стакло веднаш се чисти со метла и лопатка, никогаш со голи раце.",
      hot: [280, 420, 110, 60],
      bad: `<polygon points="290,450 310,430 320,460" fill="#e0f7fa"/><polygon points="330,440 350,470 340,435" fill="#e0f7fa"/><polygon points="360,445 380,430 375,465" fill="#e0f7fa"/>`,
      good: ``
    },
    {
      id: "ocila",
      name: "Нема заштитни очила и косата е пуштена",
      why: "Очите и лицето се незаштитени од прскање на киселини, а косата може да се запали.",
      fix: "Задолжително се носат заштитни очила, а долгата коса мора да биде стегната.",
      hot: [650, 90, 70, 75],
      bad: `<circle cx="685" cy="125" r="22" fill="#f5d0b1"/><path d="M660 100 Q685 80 710 110 Q715 150 685 150 Q655 150 660 100" fill="#8b4513"/>`,
      good: `<circle cx="685" cy="125" r="22" fill="#f5d0b1"/><rect x="665" y="115" width="40" height="15" rx="3" fill="#1e90ff" opacity="0.6"/><path d="M685 100 Q710 110 705 130" fill="#333"/>`
    },
    {
      id: "mantil",
      name: "Нема заштитен мантил (кратки ракави)",
      why: "Кожата на рацете е изложена на директен контакт со опасни хемикалии.",
      fix: "Задолжително се носи закопчан бел памучен лабораториски мантил.",
      hot: [635, 165, 100, 110],
      bad: `<path d="M650 170 L720 170 L710 270 L660 270 Z" fill="#20b2aa"/>`,
      good: `<path d="M645 170 L725 170 L730 280 L640 280 Z" fill="#ffffff" stroke="#ccc" stroke-width="2"/>`
    },
    {
      id: "chevli",
      name: "Отворени сандали и кратки панталони",
      why: "Нозете се потполно незаштитени при истурање на хемикалии или стакло.",
      fix: "Во лабораторија се влегува само со затворени чевли и долги панталони/здолниште без отвори.",
      hot: [640, 275, 90, 200],
      bad: `<path d="M660 280 L710 280 L705 360 L665 360 Z" fill="#4682b4"/><rect x="670" y="360" width="35" height="100" fill="#f5d0b1"/><rect x="665" y="455" width="45" height="20" fill="#a0522d" rx="5"/>`,
      good: `<path d="M655 280 L715 280 L710 450 L660 450 Z" fill="#2f4f4f"/><rect x="662" y="450" width="48" height="25" rx="6" fill="#111"/>`
    }
  ];

  const N_BAD = 6; // Број на активни грешки во една игра
  let active = [], found = new Set(), wrong = 0, hints = 0, over = false;

  function drawScene() {
    const badIds = new Set(active.map(h => h.id));
    
    // Основни позадински елементи (Модерен чист векторски изглед)
    let bgHTML = `
      <rect width="800" height="500" fill="#faf9f6"/>
      <!-- Позадински ѕид и плочки -->
      <rect x="0" y="0" width="800" height="350" fill="#f0edf4"/>
      <line x1="0" y1="350" x2="800" y2="350" stroke="#d1c4e9" stroke-width="4"/>
      <rect x="0" y="350" width="800" height="150" fill="#e0e0e0"/>
      
      <!-- Прозорец -->
      <rect x="80" y="40" width="160" height="140" rx="8" fill="#e3f2fd" stroke="#b0bec5" stroke-width="4"/>
      <line x1="160" y1="40" x2="160" y2="180" stroke="#b0bec5" stroke-width="3"/>
      <line x1="80" y1="110" x2="240" y2="110" stroke="#b0bec5" stroke-width="3"/>

      <!-- Полици на ѕид -->
      <rect x="430" y="105" width="220" height="12" fill="#bcaaa4" rx="2"/>
      <rect x="430" y="210" width="220" height="12" fill="#bcaaa4" rx="2"/>
      
      <!-- Работна клупа / маса -->
      <rect x="100" y="270" width="480" height="80" fill="#cfd8dc" rx="4"/>
      <rect x="100" y="260" width="480" height="15" fill="#90a4ae" rx="2"/>
    `;

    // Рендерирање на елементите (грешка или исправена состојба)
    H.forEach(item => {
      const isBad = badIds.has(item.id);
      bgHTML += `<g id="item-${item.id}">${isBad ? item.bad : item.good}</g>`;
    });

    // Контејнер за маркери и кликови
    bgHTML += `<g id="sf-marks"></g>`;
    svg.innerHTML = bgHTML;
    svg.setAttribute("viewBox", "0 0 800 500");
  }

  function mark(h, isMissed) {
    const [x, y, w, hh] = h.hot;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.innerHTML = `
      <rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="8" fill="${isMissed ? 'rgba(255,87,34,0.3)' : 'rgba(76,175,80,0.3)'}" stroke="${isMissed ? '#ff5722' : '#4caf50'}" stroke-width="3"/>
      <circle cx="${x + w - 15}" cy="${y + 15}" r="12" fill="${isMissed ? '#ff5722' : '#4caf50'}"/>
      <text x="${x + w - 15}" y="${y + 19}" fill="#fff" font-size="14" text-anchor="middle" font-weight="bold">${isMissed ? '!' : '✓'}</text>
    `;
    svg.querySelector("#sf-marks").appendChild(g);
  }

  function info(html, kind) {
    const box = $("sf-info");
    box.className = "sf-info " + (kind || "");
    box.innerHTML = html;
  }

  function counters() {
    $("sf-count").textContent = `Најдени: ${found.size} од ${active.length}`;
    $("sf-wrong").textContent = `Погрешни кликови: ${wrong}  ·  Совети: ${hints}`;
  }

  function addToList(h, missed) {
    const li = el("div", "sf-item" + (missed ? " missed" : ""));
    li.innerHTML = `<b>${h.name}</b><span>${h.fix}</span>`;
    $("sf-list").appendChild(li);
  }

  function point(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function inRect(p, r) {
    return p.x >= r[0] && p.x <= r[0] + r[2] && p.y >= r[1] && p.y <= r[1] + r[3];
  }

  svg.addEventListener("click", e => {
    if (over) return;
    const p = point(e);
    
    // Провери дали е кликната некоја активна опасност
    const hit = active.find(h => inRect(p, h.hot));
    
    if (hit) {
      if (found.has(hit.id)) {
        info(`<b>${hit.name}</b><br>${hit.why}`, "bad");
        return;
      }
      found.add(hit.id);
      mark(hit, false);
      info(`<b>Точно!</b> ${hit.name}<br><i>${hit.fix}</i>`, "good");
      addToList(hit);
      counters();
      
      // Ажурирај го приказот за оваа точка да стагне во „добра“ состојба
      const group = $(`item-${hit.id}`);
      if (group) group.innerHTML = hit.good;

      if (found.size === active.length) finish();
      return;
    }

    // Ако е кликнато на празно место (грешка)
    wrong++;
    counters();
    info("Тука нема безбедносна грешка. Продолжи да бараш внимателно!", "ok");
  });

  $("sf-hint").addEventListener("click", () => {
    if (over) return;
    const left = active.filter(h => !found.has(h.id));
    if (!left.length) return;
    const h = left[Math.floor(Math.random() * left.length)];
    hints++;
    counters();
    
    const [x, y, w, hh] = h.hot;
    const hintBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    hintBox.setAttribute("x", x);
    hintBox.setAttribute("y", y);
    hintBox.setAttribute("width", w);
    hintBox.setAttribute("height", hh);
    hintBox.setAttribute("rx", "8");
    hintBox.setAttribute("fill", "none");
    hintBox.setAttribute("stroke", "#ffeb3b");
    hintBox.setAttribute("stroke-width", "4");
    hintBox.setAttribute("stroke-dasharray", "6");
    svg.querySelector("#sf-marks").appendChild(hintBox);
    setTimeout(() => hintBox.remove(), 2500);
    info("Внимателно погледни во треперечкиот дел на сликата...", "ok");
  });

  $("sf-reveal").addEventListener("click", () => {
    if (over) return;
    over = true;
    active.filter(h => !found.has(h.id)).forEach(h => {
      mark(h, true);
      addToList(h, true);
      const group = $(`item-${h.id}`);
      if (group) group.innerHTML = h.good;
    });
    info("Ги прикажав сите преостанати опасности (означени со !). Проучи ги правилата и започни нова игра.", "bad");
  });

  function finish() {
    over = true;
    info(`<b>Честитки! Ги најде сите ${active.length} опасности! 🎉</b><br>Играта е успешно завршена со ${wrong} грешки и ${hints} совети.`, "good");
  }

  function start() {
    active = shuffle(H).slice(0, N_BAD);
    found = new Set();
    wrong = 0;
    hints = 0;
    over = false;
    $("sf-list").replaceChildren();
    drawScene();
    counters();
    info(`На сликата има <b>${N_BAD}</b> скриени безбедносни грешки. Кликни на проблематичните места!`, "");
  }

  $("sf-new").addEventListener("click", start);
  start();
})();
