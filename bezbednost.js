// Игра „Лабораториска безбедност“: најди ги опасните грешки на сликата
(function () {
  const svg = document.getElementById("sf-svg");
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // ---------- Статична сцена (ѕид, полица, маса, под) ----------
  const BASE = `
    <rect width="800" height="500" fill="#efe7da"/>
    <rect y="395" width="800" height="105" fill="#c8c2b8"/>
    <path d="M0 440H800M0 470H800M120 395V500M300 395V500M480 395V500M660 395V500" stroke="#b3ada2" stroke-width="2" fill="none"/>
    <rect x="100" y="26" width="150" height="104" rx="4" fill="#bfe3f5" stroke="#8d7b64" stroke-width="6"/>
    <path d="M175 26V130M100 78H250" stroke="#8d7b64" stroke-width="4"/>
    <path d="M118 44l40 -4M188 100l50 -6" stroke="#fff" stroke-width="3" opacity=".6"/>
    <rect x="262" y="154" width="290" height="8" rx="2" fill="#a07b50"/>
    <path d="M285 162v18M530 162v18" stroke="#8d7b64" stroke-width="5"/>
    <rect x="30" y="346" width="612" height="66" fill="#7b8996"/>
    <path d="M233 346V412M436 346V412" stroke="#667380" stroke-width="3"/>
    <rect x="30" y="330" width="618" height="16" rx="2" fill="#4c5863"/>
    <rect x="574" y="304" width="12" height="12" rx="2" fill="#fff" stroke="#8d7b64" stroke-width="2"/>
    <circle cx="578" cy="310" r="1.5" fill="#444"/><circle cx="582" cy="310" r="1.5" fill="#444"/>
    <!-- горелка (телото е секогаш тука; пламенот е дел од опасноста) -->
    <g><path d="M150 330q-26 6 -40 20" stroke="#6b5b6e" stroke-width="4" fill="none"/><rect x="144" y="292" width="12" height="38" fill="#8a97a4"/><rect x="141" y="300" width="18" height="6" rx="2" fill="#6b7886"/><ellipse cx="150" cy="330" rx="18" ry="4" fill="#5d6a77"/></g>
    <!-- апарат за гаснење (во „лошата“ верзија е закопан зад кутии) -->
    <g><rect x="38" y="196" width="40" height="30" rx="3" fill="#2e9e5b"/><path d="M58 202c-8 8 -6 14 0 20c6 -6 8 -12 0 -20z" fill="#fff"/>
       <rect x="48" y="246" width="20" height="74" rx="8" fill="#d62d20"/><rect x="53" y="236" width="10" height="12" fill="#444"/><path d="M63 240q14 0 16 14t-4 14" stroke="#222" stroke-width="3" fill="none"/><circle cx="58" cy="262" r="5" fill="#fff" stroke="#999"/></g>
    <!-- прва помош (секогаш во ред) -->
    <g><rect x="618" y="196" width="54" height="40" rx="5" fill="#fff" stroke="#2e9e5b" stroke-width="3"/><path d="M645 204v24M633 216h24" stroke="#2e9e5b" stroke-width="7"/></g>
    <!-- затворени шишиња на полица (секогаш во ред) -->
    <g>
      <rect x="282" y="118" width="26" height="36" rx="4" fill="#3b8c5a"/><rect x="290" y="108" width="10" height="12" fill="#3b8c5a"/><rect x="285" y="128" width="20" height="14" fill="#fff"/>
      <rect x="326" y="122" width="24" height="32" rx="4" fill="#c9852e"/><rect x="333" y="112" width="10" height="12" fill="#c9852e"/><rect x="329" y="130" width="18" height="12" fill="#fff"/>
      <rect x="368" y="116" width="26" height="38" rx="4" fill="#4a6fb3"/><rect x="376" y="106" width="10" height="12" fill="#4a6fb3"/><rect x="371" y="128" width="20" height="14" fill="#fff"/>
    </g>`;

  // ---------- Опасности: bad = небезбедно, good = безбедно (null = нема ништо) ----------
  const H = [
    { id: "polica", name: "Тешко шише на работ од полицата",
      hot: [478, 96, 70, 62], hotGood: [418, 96, 60, 62],
      bad: `<rect x="500" y="118" width="30" height="40" rx="4" fill="#8b2f2f" transform="rotate(8 515 138)"/><rect x="508" y="106" width="12" height="14" fill="#8b2f2f" transform="rotate(8 515 138)"/><rect x="503" y="128" width="24" height="14" fill="#fff" transform="rotate(8 515 138)"/>`,
      good: `<rect x="428" y="118" width="30" height="40" rx="4" fill="#8b2f2f"/><rect x="436" y="106" width="12" height="14" fill="#8b2f2f"/><rect x="431" y="128" width="24" height="14" fill="#fff"/><rect x="425" y="154" width="36" height="3" fill="#8d7b64"/>`,
      why: "Тешко шише со киселина е на самиот раб од полицата и може да падне, да се скрши и да се излее.",
      fix: "Тешките и опасни шишиња се чуваат ниско и позади, на полица со раб што ги задржува.",
      ok: "Шишето е сигурно позади на полицата, зад заштитен раб." },
    { id: "aparat", name: "Блокиран апарат за гаснење",
      hot: [24, 186, 86, 150], hotGood: [24, 186, 86, 150],
      bad: `<rect x="32" y="272" width="66" height="54" fill="#b8905f" stroke="#8a6a3d" stroke-width="2"/><rect x="46" y="228" width="50" height="48" fill="#c79d68" stroke="#8a6a3d" stroke-width="2"/><path d="M32 290h66M60 228v48" stroke="#8a6a3d" stroke-width="2"/>`,
      good: ``,
      why: "Апаратот за гаснење е закопан зад кутии. Во итна ситуација нема време за поместување.",
      fix: "Патот до апаратот, туш за итни случаи и излезот мора секогаш да се слободни.",
      ok: "Апаратот за гаснење е на видливо место и пристапот е слободен." },
    { id: "etanol", name: "Отворен етанол покрај пламен",
      hot: [96, 244, 140, 90], hotGood: [96, 244, 140, 90],
      bad: `<path d="M150 296C138 280 142 266 150 252C158 266 162 280 150 296Z" fill="#f6a21b"/><path d="M150 296C145 288 146 280 150 272C154 280 155 288 150 296Z" fill="#fff3a0"/>
        <rect x="190" y="290" width="30" height="42" rx="4" fill="#d9ecf5" stroke="#7aa3bd" stroke-width="2"/><rect x="198" y="280" width="14" height="12" fill="#d9ecf5" stroke="#7aa3bd" stroke-width="2"/>
        <rect x="193" y="300" width="24" height="20" fill="#fff"/><text x="205" y="311" text-anchor="middle" font-size="5" font-weight="700" fill="#b3261e">ЕТАНОЛ</text><path d="M205 314l-3 4h6z" fill="#d62d20"/>
        <rect x="224" y="326" width="14" height="6" rx="2" fill="#c04f2f"/>
        <path d="M200 270q-6 -8 0 -14t0 -12M212 268q-6 -8 0 -14t0 -12" stroke="#8fbfd6" stroke-width="2" fill="none" opacity=".8"/>`,
      good: `<rect x="190" y="290" width="30" height="42" rx="4" fill="#d9ecf5" stroke="#7aa3bd" stroke-width="2"/><rect x="198" y="278" width="14" height="14" rx="2" fill="#c04f2f"/>
        <rect x="193" y="300" width="24" height="20" fill="#fff"/><text x="205" y="311" text-anchor="middle" font-size="5" font-weight="700" fill="#b3261e">ЕТАНОЛ</text><path d="M205 314l-3 4h6z" fill="#d62d20"/>`,
      why: "Шишето со лесно запалив етанол е отворено веднаш до запалена горелка. Пареите можат да се запалат.",
      fix: "Запаливите течности се држат затворени и далеку од пламен. Горелката се пали само кога е потребна.",
      ok: "Горелката е изгасната, а шишето со етанол е затворено." },
    { id: "hrana", name: "Храна и пијалок во лабораторија",
      hot: [262, 292, 76, 44], hotGood: [262, 300, 76, 34],
      bad: `<path d="M268 330l24 -22l24 22z" fill="#e8c27a" stroke="#b58a3c" stroke-width="2"/><path d="M272 326h40" stroke="#6fae4f" stroke-width="4"/><rect x="318" y="308" width="20" height="22" rx="3" fill="#fff" stroke="#9aa5b0" stroke-width="2"/><path d="M338 314q9 0 9 8t-9 8" stroke="#9aa5b0" stroke-width="3" fill="none"/><path d="M324 302q-3 -5 0 -9M331 302q-3 -5 0 -9" stroke="#bbb" stroke-width="2" fill="none"/>`,
      good: `<rect x="270" y="322" width="52" height="8" rx="1" fill="#2d4a8a"/><path d="M326 326h20" stroke="#e0a830" stroke-width="3"/>`,
      why: "Сендвич и чаша на работната маса. Храната може да се загади со хемикалии.",
      fix: "Во лабораторија не се јаде, не се пие и не се чуваат прибор за јадење или храна.",
      ok: "На масата има само тетратка и молив." },
    { id: "bezetiketa", name: "Шише без етикета и истурена течност",
      hot: [364, 284, 70, 62], hotGood: [364, 284, 70, 62],
      bad: `<rect x="380" y="292" width="28" height="38" rx="4" fill="#8a5a2b"/><rect x="387" y="281" width="14" height="13" fill="#8a5a2b" transform="rotate(-18 394 290)"/>
        <ellipse cx="415" cy="332" rx="22" ry="4" fill="#8ed36a" opacity=".85"/><path d="M425 334V356q0 8 -6 8" stroke="#8ed36a" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>`,
      good: `<rect x="380" y="292" width="28" height="38" rx="4" fill="#8a5a2b"/><rect x="387" y="281" width="14" height="13" rx="2" fill="#5b3b1a"/><rect x="383" y="302" width="22" height="18" fill="#fff"/><text x="394" y="313" text-anchor="middle" font-size="6" font-weight="700" fill="#222">HCl 1M</text>`,
      why: "Шишето нема етикета, а од него се излева течност. Не се знае што е.",
      fix: "Секое шише има етикета (име, концентрација, ознака за опасност), а излеаното се чисти веднаш по упатство.",
      ok: "Шишето е затворено и означено." },
    { id: "kabel", name: "Кабел во локва вода",
      hot: [534, 318, 70, 130], hotGood: [440, 292, 170, 40],
      bad: `<rect x="450" y="314" width="92" height="16" rx="3" fill="#3a3f46"/><circle cx="470" cy="322" r="4" fill="#c9852e"/>
        <path d="M542 322q22 10 12 40t-4 60" stroke="#222" stroke-width="3" fill="none"/>
        <ellipse cx="552" cy="446" rx="34" ry="8" fill="#6fb4e8" opacity=".85"/><path d="M536 444q8 -3 16 0" stroke="#fff" stroke-width="2" opacity=".7" fill="none"/><path d="M556 432l-4 8h6l-4 8" stroke="#f5c518" stroke-width="2.5" fill="none"/>`,
      good: `<rect x="450" y="314" width="92" height="16" rx="3" fill="#3a3f46"/><circle cx="470" cy="322" r="4" fill="#c9852e"/><path d="M542 322q16 -6 28 -10t8 -4" stroke="#222" stroke-width="3" fill="none"/>`,
      why: "Кабел од грејач виси надолу и допира локва вода. Има опасност од струен удар и кратко спојување.",
      fix: "Каблите се водат кон ѕидот, подалеку од вода, а излеаното се брише веднаш.",
      ok: "Кабелот е кусо и уредно поврзан со штекер, подалеку од вода." },
    { id: "rabot", name: "Стаклен сад на работ на масата",
      hot: [618, 290, 52, 50], hotGood: [574, 290, 56, 50],
      bad: `<path d="M630 298h26l-3 32h-20z" fill="#cfe8f5" stroke="#7aa3bd" stroke-width="2" transform="rotate(6 643 314)"/><path d="M634 316h18v12h-18z" fill="#6fb4e8" opacity=".8" transform="rotate(6 643 314)"/>`,
      good: `<path d="M588 298h26l-3 32h-20z" fill="#cfe8f5" stroke="#7aa3bd" stroke-width="2"/><path d="M592 316h18v12h-18z" fill="#6fb4e8" opacity=".8"/>`,
      why: "Чашата е на самиот раб од масата и лесно може да падне и да се скрши.",
      fix: "Садовите се ставаат на средина од масата, подалеку од работ.",
      ok: "Чашата стои сигурно на маса, подалеку од работ." },
    { id: "torba", name: "Торба на подот во премин",
      hot: [150, 428, 100, 62], hotGood: null,
      bad: `<rect x="160" y="440" width="80" height="44" rx="12" fill="#b5342a"/><rect x="172" y="456" width="56" height="24" rx="6" fill="#962a22"/><path d="M180 442q20 -22 40 0" stroke="#7a1f19" stroke-width="5" fill="none"/><path d="M164 446l-18 14M240 450l16 10" stroke="#b5342a" stroke-width="5" stroke-linecap="round"/>`,
      good: null,
      why: "Раниче на подот пред масата. Некој може да се сапне и да падне со хемикалии во рака.",
      fix: "Торбите и јакните се оставаат на определено место, подалеку од работните површини и преминот.",
      ok: "" },
    { id: "staklo", name: "Скршено стакло на подот",
      hot: [296, 440, 100, 52], hotGood: null,
      bad: `<path d="M306 480l14 -12l8 14zM336 474l10 -14l12 16zM366 482l8 -10l10 12zM322 484l10 -4l-2 8z" fill="#bfe3f5" stroke="#7aa3bd" stroke-width="1.5"/><path d="M340 462l3 -6M346 460l6 -3" stroke="#fff" stroke-width="2"/>`,
      good: null,
      why: "На подот има парчиња скршено стакло, а можат да нанесат посекотини.",
      fix: "Стаклото не се собира со раце: се користи лопатка и четка, а се фрла во посебен сад за стаклен отпад.",
      ok: "" },
    { id: "ocila", name: "Без заштитни очила и распуштена коса",
      hot: [690, 142, 56, 62], hotGood: [690, 142, 56, 62], fig: true,
      bad: `<path d="M690 168q-4 36 6 56l8 -12v-40zM740 168q4 36 -6 56l-8 -12v-40z" fill="#5a3a20"/><circle cx="715" cy="176" r="24" fill="#f1c9a5"/><path d="M692 172q4 -26 23 -26t23 26q-8 -14 -23 -14t-23 14z" fill="#5a3a20"/><circle cx="706" cy="178" r="2.6" fill="#222"/><circle cx="724" cy="178" r="2.6" fill="#222"/><path d="M708 190q7 5 14 0" stroke="#a5503c" stroke-width="2" fill="none"/>`,
      good: `<path d="M722 142q22 4 26 30q-4 4 -8 0q0 -20 -16 -26z" fill="#5a3a20"/><circle cx="715" cy="176" r="24" fill="#f1c9a5"/><path d="M692 172q4 -26 23 -26t23 26q-8 -14 -23 -14t-23 14z" fill="#5a3a20"/><rect x="694" y="168" width="42" height="16" rx="8" fill="#d6f0fb" fill-opacity=".8" stroke="#2f6fd1" stroke-width="2.5"/><path d="M694 176h-4M736 176h4" stroke="#2f6fd1" stroke-width="2.5"/><circle cx="706" cy="177" r="2.4" fill="#222"/><circle cx="724" cy="177" r="2.4" fill="#222"/><path d="M708 191q7 4 14 0" stroke="#a5503c" stroke-width="2" fill="none"/>`,
      why: "Нема заштитни очила, а долгата коса е распуштена: може да влезе во пламен или во садови.",
      fix: "Заштитните очила се носат цело време во лабораторија, а долгата коса се врзува.",
      ok: "Носи заштитни очила, а косата е врзана." },
    { id: "mantil", name: "Без мантил, голи раце",
      hot: [666, 202, 98, 100], hotGood: [666, 202, 98, 150], fig: true,
      bad: `<rect x="684" y="200" width="62" height="86" rx="10" fill="#3a78c9"/><path d="M684 206l-18 62l12 5l16 -48zM746 206l18 62l-12 5l-16 -48z" fill="#f1c9a5"/><circle cx="672" cy="272" r="7" fill="#f1c9a5"/><circle cx="758" cy="272" r="7" fill="#f1c9a5"/>`,
      good: `<rect x="678" y="200" width="74" height="150" rx="10" fill="#fff" stroke="#c4ccd4" stroke-width="2"/><path d="M678 206l-14 70l14 4zM752 206l14 70l-14 4z" fill="#fff" stroke="#c4ccd4" stroke-width="2"/><path d="M715 204v140" stroke="#c4ccd4" stroke-width="2"/><circle cx="715" cy="226" r="2.5" fill="#9aa5b0"/><circle cx="715" cy="256" r="2.5" fill="#9aa5b0"/><circle cx="670" cy="280" r="7" fill="#f1c9a5"/><circle cx="760" cy="280" r="7" fill="#f1c9a5"/>`,
      why: "Облечена е во кратка маица, без мантил. Прскање на хемикалија удира директно на кожата.",
      fix: "Се носи долг, затворен мантил од памук со долги ракави.",
      ok: "Носи долг, затворен мантил." },
    { id: "chevli", name: "Отворени сандали и шорцеви",
      hot: [690, 350, 56, 128], hotGood: [690, 350, 56, 128], fig: true,
      bad: `<rect x="694" y="284" width="22" height="70" fill="#f1c9a5"/><rect x="718" y="284" width="22" height="70" fill="#f1c9a5"/><rect x="690" y="270" width="52" height="38" rx="6" fill="#2d6a6a"/><path d="M696 354v100M730 354v100" stroke="#f1c9a5" stroke-width="20" stroke-linecap="round"/><rect x="686" y="458" width="34" height="9" rx="4" fill="#c9852e"/><rect x="722" y="458" width="34" height="9" rx="4" fill="#c9852e"/><path d="M700 454l6 5M738 454l6 5" stroke="#7a4f12" stroke-width="3"/><circle cx="690" cy="456" r="3.5" fill="#f1c9a5"/><circle cx="696" cy="456" r="3.5" fill="#f1c9a5"/>`,
      good: `<rect x="692" y="284" width="22" height="174" fill="#3a3f55"/><rect x="718" y="284" width="22" height="174" fill="#3a3f55"/><rect x="688" y="272" width="56" height="30" rx="5" fill="#3a3f55"/><path d="M684 468q0 -12 16 -12h14v12z" fill="#222"/><path d="M716 468q0 -12 16 -12h14v12z" fill="#222"/>`,
      why: "Носи шорцеви и отворени сандали. Хемикалија или стакло што ќе падне на нога го повредува директно.",
      fix: "Во лабораторија се носат затворени чевли и долги панталони.",
      ok: "Носи затворени чевли и долги панталони." },
  ];
  // секогаш во ред (за кликање што учи)
  const SAFE = [
    { name: "Прва помош", hot: [612, 190, 66, 52], ok: "Кутијата за прва помош е на видливо и достапно место: ова е во ред." },
    { name: "Затворени шишиња на полица", hot: [270, 100, 134, 58], ok: "Затворени и означени шишиња на полица со раб: ова е во ред." },
    { name: "Работна маса и прозорец", hot: [100, 26, 150, 104], ok: "Прозорецот обезбедува светлина и проветрување: ова е во ред." },
  ];
  const N_BAD = 8;

  // ---------- состојба ----------
  let active = [], found = new Set(), wrong = 0, hints = 0, over = false, streak = 0;
  const defs = `<defs><filter id="sf-sh"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".25"/></filter></defs>`;

  function figureBase() {
    // тело на ученикот (позадина): за главата, торзото и ногата има посебни „bad/good“ слоеви
    return `<g id="sf-figbase"></g>`;
  }

  function draw() {
    const bad = new Set(active.map(h => h.id));
    let items = "";
    // прво фигурата (под нејзините слоеви)
    items += `<rect x="702" y="196" width="26" height="14" fill="#f1c9a5"/>`; // врат
    // редослед: ноѓе, тело, глава
    ["chevli", "mantil", "ocila"].forEach(id => { const h = H.find(x => x.id === id); items += bad.has(id) ? h.bad : (h.good || ""); });
    H.filter(h => !h.fig).forEach(h => { items += bad.has(h.id) ? h.bad : (h.good || ""); });
    svg.innerHTML = defs + BASE + `<g id="sf-items">${items}</g><g id="sf-marks"></g>`;
    svg.setAttribute("viewBox", "0 0 800 500");
  }

  function mark(h, cls) {
    const [x, y, w, hh] = h.hot;
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "sf-mark " + (cls || ""));
    g.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="12"/><circle cx="${x + w}" cy="${y}" r="13"/><text x="${x + w}" y="${y + 5}" text-anchor="middle">${cls === "miss" ? "!" : "✓"}</text>`;
    $("sf-svg").querySelector("#sf-marks").appendChild(g);
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
  const inRect = (p, r, pad = 0) => p.x >= r[0] - pad && p.x <= r[0] + r[2] + pad && p.y >= r[1] - pad && p.y <= r[1] + r[3] + pad;

  function ripple(p, bad) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 6);
    c.setAttribute("class", "sf-rip " + (bad ? "bad" : "ok"));
    svg.querySelector("#sf-marks").appendChild(c);
    setTimeout(() => c.remove(), 700);
  }

  svg.addEventListener("click", e => {
    if (over) return;
    const p = point(e);
    // најди опасност (приоритет: поголемо поклопување = најмала површина)
    const hits = active.filter(h => inRect(p, h.hot, 2)).sort((a, b) => a.hot[2] * a.hot[3] - b.hot[2] * b.hot[3]);
    if (hits.length) {
      const h = hits[0];
      streak = 0;
      if (found.has(h.id)) { info(`<b>${h.name}</b><br>${h.why}<br><i>Правилно: ${h.fix}</i>`, "bad"); return; }
      found.add(h.id);
      mark(h);
      ripple(p, false);
      info(`<b>Точно! ${h.name}</b><br>${h.why}<br><i>Правилно: ${h.fix}</i>`, "good");
      addToList(h);
      counters();
      if (found.size === active.length) finish();
      return;
    }
    // безбедна варијанта или секогаш-во-ред места
    const safeHit = H.filter(h => !active.includes(h) && h.hotGood && h.ok && inRect(p, h.hotGood, 2)).map(h => h.ok)
      .concat(SAFE.filter(s => inRect(p, s.hot, 2)).map(s => s.ok));
    wrong++; streak++;
    ripple(p, true);
    counters();
    if (safeHit.length) info(`<b>Тука нема грешка.</b> ${safeHit[0]}`, "ok");
    else info(`Тука нема опасност. Погледни добро: ${streak >= 4 ? "ако не знаеш каде, користи „Помош“." : "уште има грешки на сликата."}`, "ok");
  });

  $("sf-hint").addEventListener("click", () => {
    if (over) return;
    const left = active.filter(h => !found.has(h.id));
    if (!left.length) return;
    const h = left[Math.floor(Math.random() * left.length)];
    hints++; counters();
    const [x, y, w, hh] = h.hot;
    const g = document.createElementNS(NS, "ellipse");
    g.setAttribute("cx", x + w / 2); g.setAttribute("cy", y + hh / 2);
    g.setAttribute("rx", Math.max(w, 50) * 0.8); g.setAttribute("ry", Math.max(hh, 50) * 0.8);
    g.setAttribute("class", "sf-hint");
    svg.querySelector("#sf-marks").appendChild(g);
    setTimeout(() => g.remove(), 2600);
    info("Погледни на означеното место…", "ok");
  });

  $("sf-reveal").addEventListener("click", () => {
    if (over) return;
    over = true;
    active.filter(h => !found.has(h.id)).forEach(h => { mark(h, "miss"); addToList(h, true); });
    info("Ги прикажав пропуштените опасности (со знак !). Погледни ги објаснувањата подолу и пробај нова игра.", "ok");
  });

  function finish() {
    over = true;
    const stars = wrong <= 2 && hints === 0 ? 3 : wrong <= 6 && hints <= 2 ? 2 : 1;
    const s = "⭐".repeat(stars) + "☆".repeat(3 - stars);
    info(`<b>Одлично! Ги најде сите ${active.length} опасности.</b><br>${s} · погрешни кликови: ${wrong}, совети: ${hints}.`, "good");
  }

  function start() {
    active = shuffle(H).slice(0, N_BAD);
    found = new Set(); wrong = 0; hints = 0; over = false; streak = 0;
    $("sf-list").replaceChildren();
    draw();
    counters();
    info(`На сликата има <b>${N_BAD}</b> опасни грешки (има и работи што се во ред). Кликни на она што е погрешно.`, "");
  }
  $("sf-new").addEventListener("click", start);
  start();
})();
