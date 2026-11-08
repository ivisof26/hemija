<!DOCTYPE html>
<html lang="mk">
<head>
    <meta charset="UTF-8">
    <title>Лабораториска безбедност</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
        #game-container { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 840px; }
        .sf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: bold; color: #333; }
        .sf-menu { display: flex; gap: 10px; }
        .sf-menu button { background: #4caf50; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
        .sf-menu button:hover { background: #43a047; }
        .sf-info { margin-top: 15px; padding: 12px; border-radius: 6px; background: #e3f2fd; color: #0d47a1; font-size: 15px; border-left: 5px solid #2196f3; }
        .sf-info.bad { background: #ffebee; color: #b71c1c; border-left-color: #f44336; }
        .sf-info.good { background: #e8f5e9; color: #1b5e20; border-left-color: #4caf50; }
        .sf-info.ok { background: #fffde7; color: #f57f17; border-left-color: #ffeb3b; }
        .sf-list { display: flex; flex-direction: column; gap: 6px; margin-top: 15px; max-height: 160px; overflow-y: auto; }
        .sf-item { background: #f9f9f9; padding: 8px 12px; border-radius: 4px; border-left: 4px solid #4caf50; font-size: 13px; display: flex; justify-content: space-between; }
        .sf-item.missed { border-left-color: #ff5722; }
    </style>
</head>
<body>

<div id="game-container">
    <div class="sf-header">
        <div id="sf-count">Најдени: 0 од 6</div>
        <div id="sf-wrong">Погрешни кликови: 0  ·  Совети: 0</div>
        <div class="sf-menu">
            <button id="sf-hint">💡 Помош</button>
            <button id="sf-reveal">🔍 Прикажи ги сите</button>
            <button id="sf-new">🔄 Нова игра</button>
        </div>
    </div>

    <!-- Место каде што се вчитува сликата и интерактивните елементи -->
    <div id="sf-svg-parent"></div>

    <div id="sf-info" class="sf-info">Добредојдовте! На сликата има скриени безбедносни грешки. Кликни на проблематичните места.</div>
    <div id="sf-list" class="sf-list"></div>
</div>

<script>
(function () {
  const container = document.getElementById("sf-svg-parent");
  if (!container) return;

  // Твојата слика се става во src="..."
  container.innerHTML = `
    <div id="game-wrapper" style="position: relative; width: 800px; height: 500px; margin: 0 auto; user-select: none;">
      <img src="tovojata-slika.jpg" style="width: 100%; height: 100%; display: block; border-radius: 6px;" alt="Лабораториска безбедност">
      <div id="hotspots-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
      <div id="marks-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
    </div>
  `;

  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // Прецизни пиксел координати [x, y, w, h] за кликање на предметите
  const H = [
    {
      id: "polica",
      name: "Тешко шише на работ од полицата",
      why: "Шишето со киселина е на самиот раб и може лесно да падне и да се скрши.",
      fix: "Чувајте ги тешките шишиња на пониски полици и длабоко навнатре.",
      hot: [450, 40, 100, 65]
    },
    {
      id: "etanol",
      name: "Отворен етанол до отворен пламен",
      why: "Запаливата течност е отворена во близина на горилник, што може да предизвика пожар.",
      fix: "Запаливите супстанци се чуваат затворени и подалеку од извори на топлина.",
      hot: [120, 210, 110, 100]
    },
    {
      id: "hrana",
      name: "Храна и пијалок во лабораторија",
      why: "Јадењето и пиењето во лабораторија го зголемува ризикот од труење со хемикалии.",
      fix: "Во лабораторија строго е забрането внесување и консумирање храна.",
      hot: [280, 240, 95, 60]
    },
    {
      id: "kabel",
      name: "Електричен кабел во локва вода",
      why: "Опасност од краток спој, оштетување на опремата и сериозен струен удар.",
      fix: "Каблите мора да бидат суви, исправни и поставени подалеку од подни течности.",
      hot: [490, 310, 100, 85]
    },
    {
      id: "torba",
      name: "Торба поставена во премин",
      why: "Ранецот на подот го блокира патот за итна евакуација и предизвикува сопнување.",
      fix: "Личните работи се оставаат строго на предвидените гардероби или полици.",
      hot: [70, 370, 75, 95]
    },
    {
      id: "staklo",
      name: "Скршено стакло на подот",
      why: "Остатоците од скршено стакло можат да предизвикаат длабоки посекотини на нозете.",
      fix: "Скршеното стакло веднаш се чисти со метла и лопатка, никогаш со голи раце.",
      hot: [270, 420, 130, 70]
    },
    {
      id: "ocila",
      name: "Нема заштитни очила и косата е пуштена",
      why: "Очите и лицето се незаштитени од прскање на киселини, а косата може да се запали.",
      fix: "Задолжително се носат заштитни очила, а долгата коса мора да биде стегната.",
      hot: [730, 200, 70, 85]
    },
    {
      id: "mantil",
      name: "Нема заштитен мантил (кратки ракави)",
      why: "Кожата на рацете е изложена на директен контакт со опасни хемикалии.",
      fix: "Задолжително се носи закопчан бел памучен лабораториски мантил.",
      hot: [720, 285, 90, 130]
    },
    {
      id: "chevli",
      name: "Отворени сандали и кратки панталони",
      why: "Нозете се потполно незаштитени при истурање на хемикалии или стакло.",
      fix: "Во лабораторија се влегува само со затворени чевли и соодветна облека.",
      hot: [725, 415, 80, 85]
    }
  ];

  const N_BAD = 6;
  let active = [], found = new Set(), wrong = 0, hints = 0, over = false;

  function info(html, kind) {
    const box = $("sf-info");
    if (!box) return;
    box.className = "sf-info " + (kind || "");
    box.innerHTML = html;
  }

  function counters() {
    $("sf-count").textContent = `Најдени: ${found.size} од ${active.length}`;
    $("sf-wrong").textContent = `Погрешни кликови: ${wrong}  ·  Совети: ${hints}`;
  }

  function addToList(h, missed) {
    const list = $("sf-list");
    if (!list) return;
    const li = el("div", "sf-item" + (missed ? " missed" : ""));
    li.innerHTML = `<b>${h.name}</b><span>${h.fix}</span>`;
    list.appendChild(li);
  }

  function mark(h, isMissed) {
    const [x, y, w, hh] = h.hot;
    const layer = $("marks-layer");
    if (!layer) return;
    const m = document.createElement("div");
    m.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: ${w}px; height: ${hh}px; border: 3px solid ${isMissed ? '#ff5722' : '#4caf50'}; background: ${isMissed ? 'rgba(255,87,34,0.2)' : 'rgba(76,175,80,0.2)'}; border-radius: 8px; box-sizing: border-box; display: flex; align-items: flex-start; justify-content: flex-end; padding: 4px;`;
    m.innerHTML = `<span style="background: ${isMissed ? '#ff5722' : '#4caf50'}; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${isMissed ? '!' : '✓'}</span>`;
    layer.appendChild(m);
  }

  function renderHotspots() {
    const layer = $("hotspots-layer");
    if (!layer) return;
    layer.innerHTML = "";
    
    active.forEach(h => {
      const [x, y, w, hh] = h.hot;
      const btn = document.createElement("div");
      btn.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: ${w}px; height: ${hh}px; cursor: pointer; background: transparent;`;
      
      btn.addEventListener("click", () => {
        if (over) return;
        if (found.has(h.id)) {
          info(`<b>${h.name}</b><br>${h.why}`, "bad");
          return;
        }
        found.add(h.id);
        mark(h, false);
        info(`<b>Точно!</b> ${h.name}<br><i>${h.fix}</i>`, "good");
        addToList(h);
        counters();

        if (found.size === active.length) finish();
      });

      layer.appendChild(btn);
    });
  }

  function finish() {
    over = true;
    info(`<b>Честитки! Ги најде сите ${active.length} опасности! 🎉</b>`, "good");
  }

  $("sf-new")?.addEventListener("click", start);
  
  $("sf-hint")?.addEventListener("click", () => {
    if (over) return;
    const left = active.filter(h => !found.has(h.id));
    if (!left.length) return;
    const h = left[Math.floor(Math.random() * left.length)];
    hints++;
    counters();

    const [x, y, w, hh] = h.hot;
    const layer = $("marks-layer");
    const hintBox = document.createElement("div");
    hintBox.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: ${w}px; height: ${hh}px; border: 4px dashed #ffeb3b; border-radius: 8px; box-sizing: border-box;`;
    layer.appendChild(hintBox);
    setTimeout(() => hintBox.remove(), 2500);
    info("Погледни во треперечкиот дел на сликата...", "ok");
  });

  $("sf-reveal")?.addEventListener("click", () => {
    if (over) return;
    over = true;
    active.filter(h => !found.has(h.id)).forEach(h => {
      mark(h, true);
      addToList(h, true);
    });
    info("Ги прикажав сите преостанати опасности (означени со !).", "bad");
  });

  function start() {
    active = shuffle(H).slice(0, N_BAD);
    found = new Set(); wrong = 0; hints = 0; over = false;
    const list = $("sf-list");
    if (list) list.replaceChildren();
    const marks = $("marks-layer");
    if (marks) marks.innerHTML = "";
    
    renderHotspots();
    counters();
    info(`На сликата има <b>${N_BAD}</b> скриени безбедносни грешки. Кликни на проблематичните места!`, "");
  }

  start();
})();
</script>

</body>
</html>
