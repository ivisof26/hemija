// Игра „Лабораториска безбедност“: најди ги опасните грешки на сликата
(function () {
  const svg = document.getElementById("sf-svg");
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // ======================================================================
  //  РЕАЛИСТИЧНА СЦЕНА (Коригирана висина на маса и природни нозе)
  // ======================================================================
  let _id = 0; const nid = p => p + (++_id);
  const lg = (id, x1, y1, x2, y2, st) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] !== undefined ? ` stop-opacity="${s[2]}"` : ""}/>`).join("")}</linearGradient>`;
  const rg = (id, cx, cy, r, st, extra = "") => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" ${extra}>${st.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] !== undefined ? ` stop-opacity="${s[2]}"` : ""}/>`).join("")}</radialGradient>`;
  const blur = (n, s) => `<filter id="f-b${n}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

  const DEFS = `<defs>
    ${lg("g-wall", 0, 0, 0, 1, [[0, "#f2ede2"], [.6, "#e4dccd"], [1, "#d3c9b7"]])}
    ${rg("g-wlight", .24, .1, .8, [[0, "#fff4d6", .6], [.45, "#fff4d6", .14], [1, "#fff4d6", 0]])}
    ${lg("g-tface", 0, 0, 0, 1, [[0, "#ffffff"], [.5, "#f3f6f7"], [1, "#e2e8ea"]])}
    <pattern id="p-tile" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#c9d1d5"/>
      <rect x=".8" y=".8" width="24.4" height="11.4" rx="1.4" fill="url(#g-tface)"/><rect x="-12.2" y="13.8" width="24.4" height="11.4" rx="1.4" fill="url(#g-tface)"/><rect x="13.8" y="13.8" width="24.4" height="11.4" rx="1.4" fill="url(#g-tface)"/>
      <path d="M2 1.4H24M-11 14.4H11M15 14.4H37" stroke="#fff" stroke-width=".8" opacity=".9"/></pattern>
    ${lg("g-tileshade", 0, 0, 0, 1, [[0, "#1c2a33", .0], [.55, "#1c2a33", .08], [1, "#1c2a33", .42]])}
    ${lg("g-sky", 0, 0, 0, 1, [[0, "#6fb4e6"], [.55, "#bfe3f6"], [1, "#eaf6e8"]])}
    ${lg("g-frame", 0, 0, 1, 1, [[0, "#fbfaf6"], [1, "#d7d3c9"]])}
    ${lg("g-top", 0, 0, 0, 1, [[0, "#4b545c"], [.5, "#2c333a"], [1, "#171b20"]])}
    ${lg("g-topsheen", 0, 0, 1, 0, [[0, "#ffffff", .0], [.12, "#ffffff", .24], [.3, "#ffffff", .05], [.5, "#ffffff", 0]])}
    ${lg("g-edge", 0, 0, 0, 1, [[0, "#d7dde2"], [1, "#8d98a2"]])}
    ${lg("g-door", 0, 0, 1, 1, [[0, "#c2ccd4"], [.5, "#aeb9c3"], [1, "#98a4af"]])}
    ${lg("g-cabsh", 0, 0, 0, 1, [[0, "#000", .38], [.2, "#000", .1], [1, "#000", 0]])}
    ${lg("g-floor", 0, 0, 0, 1, [[0, "#c4bdad"], [1, "#a39b89"]])}
    ${rg("g-flight", .3, .35, .6, [[0, "#fff6e0", .4], [1, "#fff6e0", 0]])}
    ${lg("g-wood", 0, 0, 0, 1, [[0, "#c9a173"], [.5, "#ad8452"], [1, "#8a6338"]])}
    ${lg("g-metal", 0, 0, 1, 0, [[0, "#6d7781"], [.25, "#e9eef2"], [.5, "#b6c0c9"], [.8, "#7b8791"], [1, "#4f5963"]])}
    ${lg("g-red", 0, 0, 1, 0, [[0, "#7d140d"], [.22, "#e5412f"], [.45, "#c4291b"], [.8, "#8e190f"], [1, "#5e0e08"]])}
    ${lg("g-glass", 0, 0, 1, 0, [[0, "#dff1f8", .85], [.15, "#ffffff", .25], [.5, "#e9f6fb", .12], [.85, "#cfe6f0", .28], [1, "#ffffff", .8]])}
    ${lg("g-liq", 0, 0, 0, 1, [[0, "#8fcdf0", .85], [1, "#3f8fc9", .95]])}
    ${lg("g-refl", 0, 0, 0, 1, [[0, "#fff", .9], [.55, "#fff", 0]])}
    <mask id="m-refl" maskContentUnits="objectBoundingBox"><rect x="0" y="0" width="1" height="1" fill="url(#g-refl)"/></mask>
    <clipPath id="c-top"><path d="M44 318H648L664 352H28Z"/></clipPath>
    ${rg("g-vig", .5, .5, .78, [[.55, "#1a1208", 0], [1, "#1a1208", .42]])}
    ${blur(1, 1)}${blur(2, 2)}${blur(3, 3.4)}${blur(4, 6)}${blur("bg", 1.5)}
    <filter id="f-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  1.6 0 0 0 -.55"/><feComposite in2="SourceAlpha" operator="in"/></filter>
    <filter id="f-plaster" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".018 .03" numOctaves="3" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .32  0 0 0 .9 -.28"/><feComposite in2="SourceAlpha" operator="in"/></filter>
    <filter id="f-card" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".03 .8" numOctaves="2" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 .25  0 0 0 0 .15  0 0 0 0 .05  0 0 0 1.2 -.45"/><feComposite in2="SourceAlpha" operator="in"/></filter>
    <filter id="f-fabric" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.3 -.5"/><feComposite in2="SourceAlpha" operator="in"/></filter>
    <filter id="f-wood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .55" numOctaves="2" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .18  0 0 0 0 .07  0 0 0 1.4 -.5"/><feComposite in2="SourceAlpha" operator="in"/></filter>
  </defs>`;

  const contact = (cx, y, rx, op = .5) => `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${Math.max(2.2, rx * .17)}" fill="#000" opacity="${op}" filter="url(#f-b2)"/>`;
  const cast = (cx, y, rx, op = .3) => `<ellipse cx="${cx + rx * .9}" cy="${y - 1}" rx="${rx * 1.5}" ry="${Math.max(2.4, rx * .2)}" fill="#05080b" opacity="${op}" filter="url(#f-b3)"/>`;
  const refl = (inner, baseY, op = .3) => `<g clip-path="url(#c-top)" opacity="${op}"><g mask="url(#m-refl)"><g transform="matrix(1 0 0 -1 0 ${2 * baseY})">${inner}</g></g></g>`;

  // ---------- просторија (подигната висина на маса на y=318-352) ----------
  const BASE = `
    <rect width="800" height="500" fill="url(#g-wall)"/>
    <rect width="800" height="352" filter="url(#f-plaster)" opacity=".4"/>
    <rect width="800" height="352" fill="url(#g-wlight)"/>
    <!-- плочки (задниот ѕид) -->
    <g><rect x="0" y="206" width="800" height="146" fill="url(#p-tile)"/><rect x="0" y="206" width="800" height="146" fill="url(#g-tileshade)"/>
      <rect x="0" y="204" width="800" height="6" fill="#aeb8bf"/><rect x="0" y="204" width="800" height="1.6" fill="#fff" opacity=".8"/><rect x="0" y="210" width="800" height="5" fill="#000" opacity=".16" filter="url(#f-b2)"/></g>
    <rect y="344" width="800" height="10" fill="#6f7a82"/><rect y="344" width="800" height="2" fill="#a7b2b9"/>
    <!-- прозорец -->
    <g filter="url(#f-b1)"><rect x="84" y="176" width="184" height="16" rx="3" fill="#000" opacity=".16"/></g>
    <rect x="92" y="28" width="168" height="148" rx="4" fill="url(#g-frame)"/>
    <rect x="101" y="37" width="150" height="130" fill="url(#g-sky)"/>
    <g filter="url(#f-bbg)" clip-path="inset(0)"><g>
      <path d="M101 132 q20 -22 40 -8 q16 -22 40 -4 q22 -14 40 4 q16 -8 30 0 V167 H101Z" fill="#6f9a62" opacity=".85"/><path d="M101 148 q30 -14 62 -2 q40 -14 88 2 V167 H101Z" fill="#4f7a49" opacity=".9"/>
      <ellipse cx="132" cy="62" rx="26" ry="9" fill="#fff" opacity=".8"/><ellipse cx="150" cy="56" rx="18" ry="8" fill="#fff" opacity=".8"/><ellipse cx="220" cy="92" rx="22" ry="7" fill="#fff" opacity=".7"/></g></g>
    <path d="M101 37H251L101 167Z" fill="#fff" opacity=".1"/>
    <rect x="174" y="37" width="4" height="130" fill="url(#g-frame)"/><rect x="101" y="100" width="150" height="4" fill="url(#g-frame)"/>
    <rect x="101" y="37" width="150" height="130" fill="none" stroke="#9b978c" stroke-width="1.2" opacity=".6"/>
    <rect x="86" y="170" width="180" height="9" rx="2" fill="url(#g-frame)"/><rect x="86" y="170" width="180" height="1.6" fill="#fff"/>
    <!-- сноп светлина од прозорецот -->
    <path d="M100 178L260 178L452 392L246 392Z" fill="#fff6dc" opacity=".11" filter="url(#f-b3)"/>
    <path d="M118 178L240 178L370 392L226 392Z" fill="#fff6dc" opacity=".08" filter="url(#f-b2)"/>
    <!-- постер: периоден систем -->
    <g><rect x="334" y="177" width="128" height="54" fill="#000" opacity=".22" filter="url(#f-b2)" transform="translate(3 4)"/>
      <rect x="330" y="172" width="128" height="54" rx="1.5" fill="#fbfaf6"/><rect x="330" y="172" width="128" height="54" rx="1.5" fill="none" stroke="#b8b09c" stroke-width="1.4"/>
      <rect x="334" y="174" width="120" height="6" fill="#2d4a8a" opacity=".85"/>
      ${Array.from({ length: 5 * 14 }, (_, i) => { const r = Math.floor(i / 14), c = i % 14; if (r < 2 && c > 0 && c < 12) return ""; const hues = ["#e9a456", "#7fb8de", "#97cc8d", "#e6cf4f", "#c58ed0"]; return `<rect x="${335 + c * 8.4}" y="${182 + r * 8.2}" width="7.4" height="7" rx=".8" fill="${hues[(c + r) % 5]}" opacity=".9"/>`; }).join("")}
      <path d="M330 172H458V226H330Z" fill="url(#g-topsheen)" opacity=".7"/></g>
    <!-- полица -->
    <g><rect x="270" y="166" width="262" height="14" fill="#000" opacity=".26" filter="url(#f-b3)" transform="translate(4 6)"/>
      <path d="M286 163v22M510 163v22" stroke="#59636c" stroke-width="5"/><path d="M286 185h-10M510 185h-10" stroke="#59636c" stroke-width="4"/>
      <rect x="262" y="154" width="268" height="9" rx="1.5" fill="url(#g-wood)"/><rect x="262" y="154" width="268" height="9" rx="1.5" filter="url(#f-wood)" opacity=".6"/><rect x="262" y="154" width="268" height="1.8" fill="#f1d9b2" opacity=".85"/><rect x="262" y="161.4" width="268" height="1.6" fill="#4d3114" opacity=".5"/></g>
    <!-- штекер -->
    <g><rect x="572" y="298" width="18" height="18" rx="3" fill="#000" opacity=".22" filter="url(#f-b1)" transform="translate(1.5 2)"/><rect x="572" y="298" width="18" height="18" rx="3" fill="#f4f2ec" stroke="#bdb8a8" stroke-width="1"/><circle cx="578" cy="307" r="1.7" fill="#3a3a3a"/><circle cx="584" cy="307" r="1.7" fill="#3a3a3a"/></g>
    <!-- прва помош -->
    <g><rect x="563" y="201" width="54" height="40" rx="5" fill="#000" opacity=".28" filter="url(#f-b2)" transform="translate(3 5)"/>
      <rect x="560" y="196" width="54" height="40" rx="5" fill="#f7f8f6"/><rect x="560" y="196" width="54" height="40" rx="5" fill="none" stroke="#c3cbc6" stroke-width="1.4"/>
      <rect x="560" y="196" width="54" height="9" rx="5" fill="#fff" opacity=".7"/><path d="M587 205v22M576 216h22" stroke="#1f9a56" stroke-width="7" stroke-linecap="round"/><path d="M587 205v22" stroke="#46c27f" stroke-width="2" opacity=".6"/>
      <rect x="581" y="231" width="12" height="3.4" rx="1.7" fill="#aab3ad"/></g>
    <!-- апарат за гаснење: ѕиден носач и знак -->
    <g><rect x="40" y="188" width="36" height="30" rx="3" fill="#000" opacity=".25" filter="url(#f-b2)" transform="translate(3 4)"/><rect x="38" y="186" width="36" height="30" rx="3" fill="#1f9a56"/><rect x="38" y="186" width="36" height="30" rx="3" fill="none" stroke="#fff" stroke-width="2"/><path d="M56 192c-8 8 -6 14 0 19c6 -5 8 -11 0 -19z" fill="#fff"/></g>
    <g><rect x="48" y="241" width="22" height="76" rx="9" fill="#000" opacity=".3" filter="url(#f-b2)" transform="translate(5 3)"/>
      <rect x="47" y="240" width="22" height="76" rx="9" fill="url(#g-red)"/><rect x="47" y="240" width="22" height="22" rx="9" fill="#000" opacity=".12"/><rect x="51" y="246" width="3" height="62" rx="1.5" fill="#fff" opacity=".42"/>
      <rect x="53" y="229" width="10" height="14" rx="2" fill="url(#g-metal)"/><path d="M49 229h18" stroke="#2c3238" stroke-width="4" stroke-linecap="round"/><path d="M65 233q16 0 18 16t-5 17" stroke="#16191c" stroke-width="3.4" fill="none"/>
      <circle cx="58" cy="259" r="5.4" fill="#f3f3ee" stroke="#8b8f92" stroke-width="1.2"/><path d="M58 259l2.6 -2.6" stroke="#c4291b" stroke-width="1.2"/>
      <rect x="50" y="278" width="16" height="16" rx="1.5" fill="#f8f6ee"/><path d="M58 281c-3 3 -2 6 0 9c3 -3 3 -6 0 -9z" fill="#c4291b"/>
      <rect x="45" y="268" width="26" height="6" rx="2" fill="#2c3238"/></g>
    <!-- маса: сенка од стоечката, плоча, фронтални врати -->
    <rect x="26" y="352" width="640" height="62" fill="url(#g-door)"/>
    <rect x="26" y="352" width="640" height="62" fill="url(#g-cabsh)"/>
    ${[38, 238, 438].map((x, i) => `<g><rect x="${x}" y="362" width="${i === 2 ? 204 : 190}" height="44" rx="2.5" fill="url(#g-door)" stroke="#7c8893" stroke-width="1.6"/><rect x="${x + 1}" y="363" width="${(i === 2 ? 204 : 190) - 2}" height="1.6" fill="#fff" opacity=".6"/><rect x="${x + (i === 2 ? 86 : 80)}" y="369" width="34" height="5" rx="2.5" fill="url(#g-metal)"/><rect x="${x + (i === 2 ? 86 : 80)}" y="374" width="34" height="2" rx="1" fill="#000" opacity=".25"/></g>`).join("")}
    <rect x="26" y="406" width="640" height="8" fill="#2c3238"/><rect x="26" y="406" width="640" height="1.6" fill="#59636c"/>
    <rect x="22" y="412" width="652" height="16" fill="#000" opacity=".34" filter="url(#f-b3)"/>
    <!-- маса: плоча (епоксид, сјајна) -->
    <path d="M44 318H648L664 352H28Z" fill="url(#g-top)"/>
    <path d="M44 318H648L664 352H28Z" fill="url(#g-topsheen)"/>
    <path d="M44 318H648L664 352H28Z" filter="url(#f-grain)" opacity=".22"/>
    <path d="M28 352H664V357H28Z" fill="url(#g-edge)"/><path d="M28 352H664" stroke="#fff" stroke-width="1.4" opacity=".85"/><path d="M28 357H664" stroke="#000" stroke-width="1" opacity=".3"/>
    <path d="M44 318H648" stroke="#7c8791" stroke-width="1.4" opacity=".6"/>
    <!-- под: со перспектива, светлина од прозорецот -->
    <rect y="392" width="800" height="108" fill="url(#g-floor)"/>
    <rect y="392" width="800" height="108" fill="url(#g-flight)"/>
    <g stroke="#8f8878" stroke-width="1.4" opacity=".75" fill="none">
      <path d="M0 404H800M0 424H800M0 449H800M0 482H800"/>
      ${[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(k => `<path d="M${400 + k * 44} 392L${400 + k * 150} 500"/>`).join("")}</g>
    <g stroke="#fff" stroke-width="1" opacity=".35" fill="none"><path d="M0 405.5H800M0 425.5H800M0 450.5H800M0 483.5H800"/></g>
    <rect y="392" width="800" height="18" fill="url(#g-cabsh)" opacity=".7"/>
    <ellipse cx="715" cy="473" rx="46" ry="6" fill="#000" opacity=".34" filter="url(#f-b2)"/>`;

  const FX = `<rect width="800" height="500" fill="url(#g-vig)" pointer-events="none"/><rect width="800" height="500" filter="url(#f-grain)" opacity=".16" pointer-events="none"/>`;


  // ---------- помошни за боја ----------
  const mixc = (hex, t) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = t < 0 ? 0 : 255, a = Math.abs(t); r = Math.round(r + (f - r) * a); g = Math.round(g + (f - g) * a); b = Math.round(b + (f - b) * a); return `rgb(${r},${g},${b})`; };

  function bottle(x, y, w, h, o = {}) {
    const id = nid("bt"), cx = x + w / 2, nw = w * .38, base = y + h, c = o.c || "#3b8c5a", lq = o.liq || mixc(c, -.15), lev = o.level === undefined ? .62 : o.level;
    const lipY = y + h * .05, shY = y + h * .27, bodyY = y + h * .42;
    const path = `M${cx - nw / 2} ${lipY} V${y + h * .2} C${cx - nw / 2} ${shY + 2} ${x} ${shY - 2} ${x} ${bodyY} V${base - 5} Q${x} ${base} ${x + 5} ${base} H${x + w - 5} Q${x + w} ${base} ${x + w} ${base - 5} V${bodyY} C${x + w} ${shY - 2} ${cx + nw / 2} ${shY + 2} ${cx + nw / 2} ${y + h * .2} V${lipY} Z`;
    const liqTop = base - (base - bodyY + h * .1
