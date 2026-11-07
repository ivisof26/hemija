// Игра „Лабораториска безбедност“: најди ги опасните грешки на сликата
(function () {
  const svg = document.getElementById("sf-svg");
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // ---------- Цртање на сцената ----------
  const DEFS = `<defs>
    <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#faf4ea"/><stop offset="1" stop-color="#ecdfca"/></linearGradient>
    <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6cfc1"/><stop offset="1" stop-color="#bdb5a6"/></linearGradient>
    <linearGradient id="g-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a7b8b"/><stop offset="1" stop-color="#46535f"/></linearGradient>
    <linearGradient id="g-cab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93a2b0"/><stop offset="1" stop-color="#74838f"/></linearGradient>
    <linearGradient id="g-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98f5e"/><stop offset="1" stop-color="#97703f"/></linearGradient>
    <linearGradient id="g-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3e9ee"/><stop offset=".5" stop-color="#a9b4be"/><stop offset="1" stop-color="#7e8a95"/></linearGradient>
    <linearGradient id="g-red" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0594a"/><stop offset=".55" stop-color="#d62d20"/><stop offset="1" stop-color="#a51f16"/></linearGradient>
    <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".45" stop-color="#dff0f9" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity=".85"/></linearGradient>
    <linearGradient id="g-skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f8d9bc"/><stop offset="1" stop-color="#e6b48c"/></linearGradient>
    <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0f2"/><stop offset="1" stop-color="#d8f0fb"/></linearGradient>
    <linearGradient id="g-liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4ee"/><stop offset="1" stop-color="#3f93cf"/></linearGradient>
    <linearGradient id="g-coat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f3f6f8"/><stop offset="1" stop-color="#dfe5ea"/></linearGradient>
    <pattern id="p-tile" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#f6f9fb"/><path d="M0 0H28M0 0V28" stroke="#dce4ea" stroke-width="2"/></pattern>
    <filter id="sf-sh" x="-25%" y="-25%" width="160%" height="160%"><feDropShadow dx="1.5" dy="2.5" stdDeviation="2" flood-color="#3a2e22" flood-opacity=".3"/></filter>
    <filter id="sf-sh2" x="-25%" y="-25%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#3a2e22" flood-opacity=".25"/></filter>
  </defs>`;

  // шише: (x,y) горен лев агол, w×h; c = боја на стаклото; label = текст на етикетата
  const bottle = (x, y, w, h, c, o = {}) => {
    const nh = h * 0.26, nw = w * 0.42, by = y + nh, cx = x + w / 2;
    const lab = o.label ? `<rect x="${x + w * 0.1}" y="${y + h * 0.5}" width="${w * 0.8}" height="${h * 0.3}" rx="2" fill="#fff"/><text x="${cx}" y="${y + h * 0.5 + h * 0.19}" text-anchor="middle" font-size="${o.fs || 6}" font-weight="700" fill="${o.lc || '#222'}">${o.label}</text>` : "";
    const cap = o.noCap ? "" : `<rect x="${cx - nw / 2 - 1}" y="${y}" width="${nw + 2}" height="${nh * 0.45}" rx="2" fill="${o.cap || '#3b3b3b'}"/>`;
    return `<g filter="url(#sf-sh)"${o.rot ? ` transform="rotate(${o.rot} ${cx} ${y + h})"` : ""}>
      <rect x="${cx - nw / 2}" y="${y + nh * 0.3}" width="${nw}" height="${nh * 0.9}" fill="${c}"/>
      <path d="M${cx - nw / 2} ${by} L${x + 3} ${by + 9} L${x + w - 3} ${by + 9} L${cx + nw / 2} ${by}Z" fill="${c}"/>
      <rect x="${x}" y="${by + 4}" width="${w}" height="${h - nh - 4}" rx="6" fill="${c}"/>
      <rect x="${x + 4}" y="${by + 10}" width="4" height="${h - nh - 22}" rx="2" fill="#fff" opacity=".5"/>
      <rect x="${x + w - 8}" y="${by + 12}" width="3" height="${h - nh - 26}" rx="1.5" fill="#000" opacity=".12"/>${lab}${cap}</g>`;
  };
  const beaker = (x, y, w, h, liq = true) => `<g filter="url(#sf-sh)"><path d="M${x} ${y} h${w} l-4 ${h} q0 4 -4 4 h${-(w - 8)} q-4 0 -4 -4z" fill="url(#g-glass)" stroke="#86aac2" stroke-width="2"/>
      ${liq ? `<path d="M${x + 3} ${y + h * 0.42} h${w - 6} l-3 ${h * 0.58 - 1} q0 3 -3 3 h${-(w - 14)} q-3 0 -3 -3z" fill="url(#g-liq)" opacity=".9"/><path d="M${x + 4} ${y + h * 0.42} q${(w - 8) / 2} 4 ${w - 8} 0" stroke="#e7f6ff" stroke-width="1.5" fill="none"/>` : ""}
      <path d="M${x + w - 12} ${y + 10}h6M${x + w - 12} ${y + 20}h6M${x + w - 12} ${y + 30}h6" stroke="#86aac2" stroke-width="1.4"/><rect x="${x + 5}" y="${y + 4}" width="3" height="${h - 10}" rx="1.5" fill="#fff" opacity=".7"/></g>`;

  const BASE = `
    <rect width="800" height="500" fill="url(#g-wall)"/>
    <rect y="236" width="800" height="96" fill="url(#p-tile)"/>
    <rect y="231" width="800" height="7" fill="#c9d4dc"/>
    <rect y="410" width="800" height="90" fill="url(#g-floor)"/>
    <path d="M0 440H800M0 472H800M130 410V500M300 410V500M470 410V500M640 410V500" stroke="#aea696" stroke-width="2" opacity=".7"/>
    <rect x="22" y="408" width="632" height="16" fill="#2b2118" opacity=".16"/>
    <!-- прозорец со светлина -->
    <polygon points="100,130 250,130 330,240 150,240" fill="#fff" opacity=".22"/>
    <rect x="100" y="26" width="150" height="104" rx="4" fill="url(#g-sky)" stroke="#9a8468" stroke-width="7"/>
    <path d="M175 26V130M100 78H250" stroke="#9a8468" stroke-width="5"/>
    <ellipse cx="135" cy="52" rx="20" ry="8" fill="#fff" opacity=".85"/><ellipse cx="150" cy="48" rx="14" ry="7" fill="#fff" opacity=".85"/><ellipse cx="215" cy="100" rx="18" ry="7" fill="#fff" opacity=".8"/>
    <rect x="94" y="130" width="162" height="9" rx="3" fill="#b09878"/>
    <!-- постер: периоден систем -->
    <g filter="url(#sf-sh)"><rect x="330" y="172" width="128" height="52" rx="3" fill="#fff" stroke="#c9b9a0" stroke-width="2"/>
      ${Array.from({ length: 5 * 14 }, (_, i) => { const r = Math.floor(i / 14), c = i % 14; if ((r < 2 && c > 0 && c < 12) || (r === 0 && c > 0 && c < 13 && false)) return ""; const hues = ["#f39c3f", "#7cc4ee", "#8fd18a", "#f2d12b", "#d68be0"]; return `<rect x="${336 + c * 8.4}" y="${178 + r * 8.2}" width="7.4" height="7" rx="1" fill="${hues[(c + r) % 5]}" opacity=".85"/>`; }).join("")}</g>
    <!-- полица -->
    <rect x="262" y="154" width="268" height="9" rx="2" fill="url(#g-wood)" filter="url(#sf-sh)"/>
    <path d="M286 163v20l-9 0M510 163v20l-9 0" stroke="#7d6a52" stroke-width="5" fill="none"/>
    <!-- горелка: цревото и основата -->
    <g filter="url(#sf-sh)"><path d="M150 330q-26 4 -40 22" stroke="#7a6a82" stroke-width="5" fill="none"/>
      <rect x="144" y="290" width="12" height="40" rx="2" fill="url(#g-metal)"/><rect x="140" y="300" width="20" height="7" rx="3" fill="#6f7c89"/><ellipse cx="150" cy="330" rx="19" ry="5" fill="#5d6a77"/></g>
    <!-- апарат за гаснење -->
    <g><rect x="38" y="194" width="40" height="32" rx="4" fill="#2e9e5b" stroke="#fff" stroke-width="2"/><path d="M58 200c-9 9 -7 15 0 21c7 -6 9 -12 0 -21z" fill="#fff"/>
       <g filter="url(#sf-sh)"><rect x="47" y="247" width="22" height="76" rx="9" fill="url(#g-red)"/><rect x="53" y="236" width="10" height="14" rx="2" fill="#333"/><path d="M50 236h16" stroke="#333" stroke-width="4" stroke-linecap="round"/><path d="M63 242q16 0 18 16t-5 16" stroke="#222" stroke-width="3.5" fill="none"/><circle cx="58" cy="266" r="5.5" fill="#fff" stroke="#999"/><rect x="50" y="288" width="16" height="14" rx="2" fill="#fff"/><path d="M58 291c-3 3 -2 5 0 8c3 -3 3 -5 0 -8z" fill="#d62d20"/></g></g>
    <!-- маса -->
    <rect x="30" y="346" width="618" height="62" fill="url(#g-cab)"/>
    <rect x="30" y="404" width="618" height="8" fill="#3d4650"/>
    <rect x="38" y="354" width="190" height="46" rx="3" fill="#8695a3" stroke="#6a7885" stroke-width="2"/><rect x="238" y="354" width="190" height="46" rx="3" fill="#8695a3" stroke="#6a7885" stroke-width="2"/><rect x="438" y="354" width="204" height="46" rx="3" fill="#8695a3" stroke="#6a7885" stroke-width="2"/>
    <rect x="118" y="360" width="30" height="5" rx="2.5" fill="#d4dce3"/><rect x="318" y="360" width="30" height="5" rx="2.5" fill="#d4dce3"/><rect x="522" y="360" width="30" height="5" rx="2.5" fill="#d4dce3"/>
    <rect x="26" y="328" width="626" height="19" rx="3" fill="url(#g-top)" filter="url(#sf-sh2)"/>
    <rect x="30" y="330" width="618" height="3" rx="1.5" fill="#fff" opacity=".3"/>
    <!-- штекер -->
    <rect x="574" y="302" width="14" height="14" rx="3" fill="#fff" stroke="#9a8468" stroke-width="2"/><circle cx="578.5" cy="309" r="1.6" fill="#444"/><circle cx="583.5" cy="309" r="1.6" fill="#444"/>
    <!-- прва помош (секогаш во ред) -->
    <g filter="url(#sf-sh)"><rect x="560" y="196" width="54" height="40" rx="6" fill="#fff" stroke="#2e9e5b" stroke-width="3"/><path d="M587 204v24M575 216h24" stroke="#2e9e5b" stroke-width="7" stroke-linecap="round"/></g>
    <!-- затворени шишиња на полица (секогаш во ред) -->
    ${bottle(282, 110, 26, 44, "#3b8c5a", { label: "NaCl", fs: 6 })}${bottle(326, 116, 24, 38, "#c9852e", { label: "KI", fs: 6 })}${bottle(366, 108, 26, 46, "#4a6fb3", { label: "H₂O", fs: 6 })}`;

  // ---------- Опасности: bad = небезбедно, good = безбедно (null = нема ништо) ----------
  const FLAME = `<g><path d="M150 300C132 280 138 262 150 240C162 262 168 280 150 300Z" fill="#f08a1c"/><path d="M150 300C140 288 142 274 150 258C158 274 160 288 150 300Z" fill="#ffd23f"/><path d="M150 300C146 294 147 288 150 284C153 288 154 294 150 300Z" fill="#6ec6ff"/></g>`;
  const H = [
    { id: "polica", name: "Тешко шише на работ од полицата",
      hot: [478, 94, 72, 66], hotGood: [418, 96, 60, 62],
      bad: bottle(508, 110, 30, 46, "#9c3030", { label: "H₂SO₄", fs: 5.5, lc: "#9c3030", rot: 12 }),
      good: bottle(428, 110, 30, 46, "#9c3030", { label: "H₂SO₄", fs: 5.5, lc: "#9c3030" }) + `<rect x="424" y="152" width="38" height="3" rx="1.5" fill="#7d6a52"/>`,
      why: "Тешко шише со киселина е на самиот раб од полицата и може да падне, да се скрши и да се излее.",
      fix: "Тешките и опасни шишиња се чуваат ниско и позади, на полица со раб што ги задржува.",
      ok: "Шишето е сигурно позади на полицата, зад заштитен раб." },
    { id: "aparat", name: "Блокиран апарат за гаснење",
      hot: [24, 186, 86, 150], hotGood: [24, 186, 86, 150],
      bad: `<g filter="url(#sf-sh)"><g><rect x="30" y="274" width="68" height="54" fill="#c79d68" stroke="#8a6a3d" stroke-width="2"/><path d="M30 274h68l-6 -10h-56z" fill="#d8b07a" stroke="#8a6a3d" stroke-width="2"/><rect x="58" y="274" width="12" height="54" fill="#e8d3a8" opacity=".7"/></g>
        <g transform="rotate(-4 70 250)"><rect x="46" y="224" width="52" height="50" fill="#b8905f" stroke="#8a6a3d" stroke-width="2"/><rect x="66" y="224" width="12" height="50" fill="#e8d3a8" opacity=".7"/><text x="56" y="262" font-size="7" fill="#6b4c25" font-weight="700" transform="rotate(-8 56 262)">КРХКО</text></g></g>`,
      good: ``,
      why: "Апаратот за гаснење е закопан зад кутии. Во итна ситуација нема време за поместување.",
      fix: "Патот до апаратот, тушот за итни случаи и излезот мора секогаш да се слободни.",
      ok: "Апаратот за гаснење е на видливо место и пристапот е слободен." },
    { id: "etanol", name: "Отворен етанол покрај пламен",
      hot: [96, 236, 150, 100], hotGood: [96, 244, 150, 92],
      bad: FLAME + bottle(192, 290, 32, 46, "#e1f1f9", { label: "ЕТАНОЛ", fs: 5, lc: "#b3261e", noCap: true }) +
        `<g filter="url(#sf-sh)"><rect x="228" y="326" width="16" height="8" rx="3" fill="#c04f2f"/></g><path d="M202 282q-7 -9 0 -16t0 -14M214 280q-7 -9 0 -16t0 -14" stroke="#8fbfd6" stroke-width="2" fill="none" opacity=".85" stroke-linecap="round"/><path d="M208 306l-4 7h8z" fill="#d62d20"/>`,
      good: bottle(192, 290, 32, 46, "#e1f1f9", { label: "ЕТАНОЛ", fs: 5, lc: "#b3261e", cap: "#c04f2f" }),
      why: "Шишето со лесно запалив етанол е отворено веднаш до запалена горелка. Пареите можат да се запалат.",
      fix: "Запаливите течности се држат затворени и далеку од пламен. Горелката се пали само кога е потребна.",
      ok: "Горелката е изгасната, а шишето со етанол е затворено." },
    { id: "hrana", name: "Храна и пијалок во лабораторија",
      hot: [262, 292, 84, 44], hotGood: [262, 300, 88, 34],
      bad: `<g filter="url(#sf-sh)"><path d="M266 332q0 -8 12 -10l26 -4q12 0 12 8v6z" fill="#e8c27a" stroke="#b58a3c" stroke-width="1.5"/><path d="M268 326q18 -4 44 -2" stroke="#6fae4f" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M270 321q16 -3 38 0" stroke="#d6453a" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M266 332h50v-2q0 -6 -6 -6" fill="#d9aa55"/>
        <rect x="322" y="306" width="22" height="26" rx="4" fill="#fff" stroke="#9aa5b0" stroke-width="2"/><path d="M344 312q10 0 10 9t-10 9" stroke="#9aa5b0" stroke-width="3.5" fill="none"/><rect x="324" y="308" width="18" height="6" fill="#7b4b24" opacity=".85"/></g><path d="M328 300q-4 -6 0 -11M336 300q-4 -6 0 -11" stroke="#bbb" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      good: `<g filter="url(#sf-sh)"><rect x="268" y="322" width="54" height="9" rx="2" fill="#2d4a8a"/><rect x="268" y="322" width="6" height="9" fill="#1c3366"/></g><path d="M328 328h26" stroke="#e0a830" stroke-width="3.5" stroke-linecap="round"/><path d="M354 328l5 0" stroke="#c9852e" stroke-width="3.5" stroke-linecap="round"/>`,
      why: "Сендвич и чаша на работната маса. Храната може да се загади со хемикалии.",
      fix: "Во лабораторија не се јаде, не се пие и не се чуваат прибор за јадење или храна.",
      ok: "На масата има само тетратка и молив." },
    { id: "bezetiketa", name: "Шише без етикета и истурена течност",
      hot: [364, 280, 80, 80], hotGood: [364, 284, 70, 50],
      bad: `<ellipse cx="418" cy="334" rx="26" ry="4.5" fill="#8ed36a" opacity=".9"/><path d="M432 336V352q0 12 -8 12" stroke="#8ed36a" stroke-width="5.5" stroke-linecap="round" fill="none" opacity=".9"/><ellipse cx="420" cy="366" rx="9" ry="3" fill="#8ed36a" opacity=".75"/>` +
        bottle(380, 290, 30, 46, "#8a5a2b", { cap: "#3b3b3b", rot: 22 }).replace("sf-sh", "sf-sh"),
      good: bottle(380, 290, 30, 46, "#8a5a2b", { label: "HCl 1M", fs: 5.5, cap: "#222" }),
      why: "Шишето нема етикета, а од него се излева течност. Не се знае што е.",
      fix: "Секое шише има етикета (име, концентрација, ознака за опасност), а излеаното се чисти веднаш по упатство.",
      ok: "Шишето е затворено и означено." },
    { id: "kabel", name: "Кабел во локва вода",
      hot: [534, 318, 76, 134], hotGood: [440, 290, 170, 44],
      bad: `<g filter="url(#sf-sh)"><rect x="450" y="312" width="92" height="17" rx="4" fill="#2f353c"/><rect x="454" y="314" width="84" height="4" rx="2" fill="#fff" opacity=".18"/><circle cx="472" cy="322" r="4.5" fill="#d6892e"/><circle cx="520" cy="321" r="2.5" fill="#6bd06b"/></g>
        <path d="M542 322q24 12 14 40t-6 64" stroke="#1d2126" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="552" cy="448" rx="38" ry="9" fill="#7cc4ee" opacity=".85"/><ellipse cx="552" cy="448" rx="38" ry="9" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/><path d="M534 446q9 -3 17 0" stroke="#fff" stroke-width="2" opacity=".8" fill="none"/>
        <path d="M562 428l-5 9h7l-5 10" stroke="#f5c518" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`,
      good: `<g filter="url(#sf-sh)"><rect x="450" y="312" width="92" height="17" rx="4" fill="#2f353c"/><rect x="454" y="314" width="84" height="4" rx="2" fill="#fff" opacity=".18"/><circle cx="472" cy="322" r="4.5" fill="#d6892e"/><circle cx="520" cy="321" r="2.5" fill="#d6453a"/></g><path d="M542 322q18 -8 30 -9" stroke="#1d2126" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      why: "Кабел од грејач виси надолу и допира локва вода. Има опасност од струен удар и кратко спојување.",
      fix: "Каблите се водат кон ѕидот, подалеку од вода, а излеаното се брише веднаш.",
      ok: "Кабелот е кусо и уредно поврзан со штекер, подалеку од вода." },
    { id: "rabot", name: "Стаклен сад на работ на масата",
      hot: [616, 288, 56, 56], hotGood: [588, 288, 56, 50],
      bad: `<g transform="rotate(7 640 330)">${beaker(626, 296, 30, 36)}</g>`,
      good: beaker(598, 296, 30, 36),
      why: "Чашата е на самиот раб од масата и лесно може да падне и да се скрши.",
      fix: "Садовите се ставаат на средина од масата, подалеку од работ.",
      ok: "Чашата стои сигурно на маса, подалеку од работ." },
    { id: "torba", name: "Торба на подот во премин",
      hot: [150, 426, 110, 66], hotGood: null,
      bad: `<g filter="url(#sf-sh)"><path d="M178 446q22 -26 44 0" stroke="#7a1f19" stroke-width="6" fill="none"/><rect x="160" y="442" width="84" height="46" rx="14" fill="#c23a2e"/><rect x="172" y="462" width="60" height="22" rx="7" fill="#a52d23"/><path d="M172 462h60" stroke="#e8e0cc" stroke-width="2.5" stroke-dasharray="4 3"/><rect x="164" y="448" width="76" height="6" rx="3" fill="#fff" opacity=".22"/><circle cx="202" cy="472" r="3.5" fill="#e8d3a8"/><path d="M162 452l-18 12M242 456l16 10" stroke="#c23a2e" stroke-width="6" stroke-linecap="round"/></g>`,
      good: null,
      why: "Раниче на подот пред масата. Некој може да се сапне и да падне со хемикалии во рака.",
      fix: "Торбите и јакните се оставаат на определено место, подалеку од работните површини и преминот.",
      ok: "" },
    { id: "staklo", name: "Скршено стакло на подот",
      hot: [296, 438, 104, 56], hotGood: null,
      bad: `<g filter="url(#sf-sh)"><path d="M306 482l14 -14l9 15z" fill="#d4ecf8" stroke="#86aac2" stroke-width="1.5"/><path d="M336 476l11 -16l13 18z" fill="#e4f3fb" stroke="#86aac2" stroke-width="1.5"/><path d="M368 484l9 -11l11 14z" fill="#d4ecf8" stroke="#86aac2" stroke-width="1.5"/><path d="M322 486l10 -5l-1 8z" fill="#e4f3fb" stroke="#86aac2" stroke-width="1.5"/><path d="M392 480l7 -6l4 9z" fill="#d4ecf8" stroke="#86aac2" stroke-width="1.5"/></g><path d="M344 456l3 -7M350 458l7 -3M352 448l1 -4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
      good: null,
      why: "На подот има парчиња скршено стакло, а можат да нанесат посекотини.",
      fix: "Стаклото не се собира со раце: се користи лопатка и четка, а се фрла во посебен сад за стаклен отпад.",
      ok: "" },
    // ----- ученикот (три посебни слоја: нозе, тело, глава) -----
    { id: "ocila", name: "Без заштитни очила и распуштена коса",
      hot: [688, 140, 60, 70], hotGood: [688, 140, 60, 70], fig: true,
      bad: `<path d="M690 168q-8 40 4 70l10 -6l2 -56z" fill="#5a3a20"/><path d="M740 168q8 40 -4 70l-10 -6l-2 -56z" fill="#5a3a20"/>
        <rect x="707" y="198" width="16" height="14" fill="#e6b48c"/><ellipse cx="715" cy="176" rx="25" ry="26" fill="url(#g-skin)"/>
        <path d="M689 174q0 -30 26 -30t26 30q-9 -15 -26 -15t-26 15z" fill="#6b4526"/><path d="M698 152q10 -6 22 -4" stroke="#8b6238" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="706" cy="178" rx="3.6" ry="4.2" fill="#fff"/><ellipse cx="724" cy="178" rx="3.6" ry="4.2" fill="#fff"/><circle cx="706.5" cy="178.5" r="2.2" fill="#2b1a0c"/><circle cx="724.5" cy="178.5" r="2.2" fill="#2b1a0c"/>
        <path d="M700 170q6 -3 11 0M719 170q6 -3 11 0" stroke="#4a2f17" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M715 181q-2 6 1 8" stroke="#c9906a" stroke-width="1.6" fill="none"/><path d="M707 192q8 6 16 0" stroke="#b5503e" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="700" cy="189" r="4.5" fill="#f08c80" opacity=".3"/><circle cx="730" cy="189" r="4.5" fill="#f08c80" opacity=".3"/>`,
      good: `<rect x="707" y="198" width="16" height="14" fill="#e6b48c"/><circle cx="743" cy="154" r="11" fill="#5a3a20"/><rect x="734" y="154" width="6" height="10" rx="2" fill="#2f6fd1"/><ellipse cx="715" cy="176" rx="25" ry="26" fill="url(#g-skin)"/>
        <path d="M689 174q0 -30 26 -30t26 30q-9 -15 -26 -15t-26 15z" fill="#6b4526"/>
        <ellipse cx="706" cy="178" rx="3.6" ry="4.2" fill="#fff"/><ellipse cx="724" cy="178" rx="3.6" ry="4.2" fill="#fff"/><circle cx="706.5" cy="178.5" r="2.2" fill="#2b1a0c"/><circle cx="724.5" cy="178.5" r="2.2" fill="#2b1a0c"/>
        <path d="M715 181q-2 6 1 8" stroke="#c9906a" stroke-width="1.6" fill="none"/><path d="M707 192q8 6 16 0" stroke="#b5503e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <rect x="692" y="167" width="46" height="21" rx="10" fill="url(#g-glass)" stroke="#2f6fd1" stroke-width="3"/><path d="M692 177h-5M738 177h5" stroke="#2f6fd1" stroke-width="3" stroke-linecap="round"/><path d="M697 171q6 -3 14 -2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      why: "Нема заштитни очила, а долгата коса е распуштена: може да влезе во пламен или во садови.",
      fix: "Заштитните очила се носат цело време во лабораторија, а долгата коса се врзува.",
      ok: "Носи заштитни очила, а косата е врзана." },
    { id: "mantil", name: "Без мантил, голи раце",
      hot: [662, 204, 106, 100], hotGood: [660, 204, 110, 150], fig: true,
      bad: `<g filter="url(#sf-sh)"><path d="M672 246Q663 272 666 298" stroke="#f0c8a3" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M758 246Q767 272 764 298" stroke="#f0c8a3" stroke-width="16" stroke-linecap="round" fill="none"/><circle cx="666" cy="302" r="8.5" fill="#f0c8a3"/><circle cx="764" cy="302" r="8.5" fill="#f0c8a3"/>
        <path d="M688 210Q715 198 742 210L750 238L742 246L742 304Q715 312 688 304L688 246L680 238Z" fill="#3a78c9"/><path d="M688 210Q715 198 742 210L750 238L742 246L742 252L688 252L688 246L680 238Z" fill="#4f8fe0"/><path d="M702 206q13 12 26 0" stroke="#2a5fa8" stroke-width="3" fill="none"/><path d="M700 270q15 6 30 0" stroke="#2f66b3" stroke-width="2" fill="none" opacity=".6"/></g>`,
      good: `<g filter="url(#sf-sh)"><path d="M676 240Q665 270 667 292" stroke="#c8d0d8" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M754 240Q765 270 763 292" stroke="#c8d0d8" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M676 240Q665 270 667 292" stroke="url(#g-coat)" stroke-width="19" stroke-linecap="round" fill="none"/><path d="M754 240Q765 270 763 292" stroke="url(#g-coat)" stroke-width="19" stroke-linecap="round" fill="none"/><circle cx="667" cy="302" r="8" fill="#f0c8a3"/><circle cx="763" cy="302" r="8" fill="#f0c8a3"/>
        <path d="M684 210Q715 198 746 210L752 378Q715 386 678 378Z" fill="url(#g-coat)" stroke="#c4ccd4" stroke-width="2"/></g>
        <path d="M715 214V378" stroke="#c4ccd4" stroke-width="2"/><path d="M702 208L715 242L728 208" fill="#e9eef2" stroke="#c4ccd4" stroke-width="2" stroke-linejoin="round"/>
        <rect x="686" y="304" width="22" height="26" rx="3" fill="none" stroke="#c4ccd4" stroke-width="2"/><rect x="722" y="304" width="22" height="26" rx="3" fill="none" stroke="#c4ccd4" stroke-width="2"/>
        <circle cx="722" cy="262" r="2.6" fill="#9aa5b0"/><circle cx="722" cy="290" r="2.6" fill="#9aa5b0"/><circle cx="722" cy="318" r="2.6" fill="#9aa5b0"/><rect x="726" y="256" width="9" height="12" rx="1.5" fill="#2f6fd1" opacity=".85"/>`,
      why: "Облечена е во кратка маица, без мантил. Прскање на хемикалија удира директно на кожата.",
      fix: "Се носи долг, затворен мантил од памук со долги ракави.",
      ok: "Носи долг, затворен мантил." },
    { id: "chevli", name: "Отворени сандали и шорцеви",
      hot: [684, 350, 62, 128], hotGood: [684, 392, 62, 86], fig: true,
      bad: `<g filter="url(#sf-sh)"><rect x="694" y="318" width="19" height="132" rx="9" fill="url(#g-skin)"/><rect x="718" y="318" width="19" height="132" rx="9" fill="url(#g-skin)"/>
        <path d="M689 296Q715 304 741 296L744 336Q735 340 731 336L715 322L699 336Q695 340 686 336Z" fill="#2d7d7d"/><path d="M715 306V322" stroke="#1f5a5a" stroke-width="2"/>
        <rect x="685" y="450" width="32" height="10" rx="5" fill="#c58a3a"/><rect x="718" y="450" width="32" height="10" rx="5" fill="#c58a3a"/>
        <path d="M697 448l7 6M709 448l-5 6" stroke="#8a5a1c" stroke-width="3"/><path d="M727 448l7 6M739 448l-5 6" stroke="#8a5a1c" stroke-width="3"/>
        <circle cx="687" cy="451" r="3.4" fill="#f0c8a3"/><circle cx="693" cy="448" r="3.2" fill="#f0c8a3"/><circle cx="748" cy="451" r="3.4" fill="#f0c8a3"/><circle cx="742" cy="448" r="3.2" fill="#f0c8a3"/></g>`,
      good: `<g filter="url(#sf-sh)"><path d="M692 296Q715 304 738 296L737 454H718V334L715 330L712 334V454H693Z" fill="#3d4358"/><path d="M715 304V332" stroke="#2a2f40" stroke-width="2"/><path d="M700 340V450M730 340V450" stroke="#4d546e" stroke-width="2" opacity=".6"/>
        <path d="M684 470q0 -14 18 -14h12v14z" fill="#262626"/><path d="M716 470q0 -14 18 -14h14v14z" fill="#262626"/><rect x="684" y="468" width="30" height="4" rx="2" fill="#f2f2f2"/><rect x="716" y="468" width="32" height="4" rx="2" fill="#f2f2f2"/></g>`,
      why: "Носи шорцеви и отворени сандали. Хемикалија или стакло што ќе падне на нога го повредува директно.",
      fix: "Во лабораторија се носат затворени чевли и долги панталони.",
      ok: "Носи затворени чевли и долги панталони." },
  ];
  // секогаш во ред (за кликање што учи)
  const SAFE = [
    { name: "Прва помош", hot: [554, 190, 66, 52], ok: "Кутијата за прва помош е на видливо и достапно место: ова е во ред." },
    { name: "Затворени шишиња на полица", hot: [270, 100, 134, 58], ok: "Затворени и означени шишиња на полица со раб: ова е во ред." },
    { name: "Прозорец", hot: [100, 26, 150, 104], ok: "Прозорецот обезбедува светлина и проветрување: ова е во ред." },
    { name: "Периоден систем", hot: [330, 172, 128, 52], ok: "Постерот со периодниот систем е на ѕидот за брза проверка: ова е во ред." },
  ];
  const N_BAD = 8;

  // ---------- состојба ----------
  let active = [], found = new Set(), wrong = 0, hints = 0, over = false, streak = 0;
  const defs = DEFS;

  function figureBase() {
    // тело на ученикот (позадина): за главата, торзото и ногата има посебни „bad/good“ слоеви
    return `<g id="sf-figbase"></g>`;
  }

  function draw() {
    const bad = new Set(active.map(h => h.id));
    let items = "";
    // прво фигурата (под нејзините слоеви)
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
