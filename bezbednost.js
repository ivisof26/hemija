// Игра „Лабораториска безбедност“: најди ги опасните грешки на сликата
(function () {
  const svg = document.getElementById("sf-svg");
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // ======================================================================
  //  РЕАЛИСТИЧНА СЦЕНА: светлина од прозорец (лево), меки сенки, сјајна маса со одраз, текстури
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

  // ---------- просторија ----------
  const BASE = `
    <rect width="800" height="500" fill="url(#g-wall)"/>
    <rect width="800" height="392" filter="url(#f-plaster)" opacity=".4"/>
    <rect width="800" height="392" fill="url(#g-wlight)"/>
    <!-- плочки (задниот ѕид) -->
    <g><rect x="0" y="206" width="800" height="186" fill="url(#p-tile)"/><rect x="0" y="206" width="800" height="186" fill="url(#g-tileshade)"/>
      <rect x="0" y="204" width="800" height="6" fill="#aeb8bf"/><rect x="0" y="204" width="800" height="1.6" fill="#fff" opacity=".8"/><rect x="0" y="210" width="800" height="5" fill="#000" opacity=".16" filter="url(#f-b2)"/></g>
    <rect y="380" width="800" height="12" fill="#6f7a82"/><rect y="380" width="800" height="2" fill="#a7b2b9"/>
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

  // шише од стакло: (x,y) горен лев агол, w×h; o: {c: боја на стаклото, liq: боја на течност, label, lc, cap, open, rot, level, refl}
  function bottle(x, y, w, h, o = {}) {
    const id = nid("bt"), cx = x + w / 2, nw = w * .38, base = y + h, c = o.c || "#3b8c5a", lq = o.liq || mixc(c, -.15), lev = o.level === undefined ? .62 : o.level;
    const lipY = y + h * .05, shY = y + h * .27, bodyY = y + h * .42;
    const path = `M${cx - nw / 2} ${lipY} V${y + h * .2} C${cx - nw / 2} ${shY + 2} ${x} ${shY - 2} ${x} ${bodyY} V${base - 5} Q${x} ${base} ${x + 5} ${base} H${x + w - 5} Q${x + w} ${base} ${x + w} ${base - 5} V${bodyY} C${x + w} ${shY - 2} ${cx + nw / 2} ${shY + 2} ${cx + nw / 2} ${y + h * .2} V${lipY} Z`;
    const liqTop = base - (base - bodyY + h * .1) * lev - 2;
    const lab = o.label ? `<path d="M${x + 1.5} ${y + h * .5}Q${cx} ${y + h * .5 + 3} ${x + w - 1.5} ${y + h * .5}V${y + h * .5 + h * .3}Q${cx} ${y + h * .5 + h * .3 + 3} ${x + 1.5} ${y + h * .5 + h * .3}Z" fill="url(#${id}l)"/><text x="${cx}" y="${y + h * .5 + h * .19 + 2}" text-anchor="middle" font-size="${o.fs || 6}" font-weight="700" font-family="Arial,sans-serif" fill="${o.lc || "#222"}">${o.label}</text>${o.stripe ? `<rect x="${x + 1.5}" y="${y + h * .5 + 1}" width="${w - 3}" height="2.6" fill="${o.stripe}"/>` : ""}` : "";
    const cap = o.open ? `<ellipse cx="${cx}" cy="${lipY}" rx="${nw / 2 + 1}" ry="2.2" fill="#17110a" opacity=".55"/><ellipse cx="${cx}" cy="${lipY}" rx="${nw / 2}" ry="1.7" fill="#8bbdd3" opacity=".5"/>` :
      `<rect x="${cx - nw / 2 - 1.5}" y="${lipY - h * .1}" width="${nw + 3}" height="${h * .13}" rx="2" fill="url(#${id}c)"/><path d="M${cx - nw / 2 + 1} ${lipY - h * .05}v${h * .08}M${cx - nw / 2 + 4} ${lipY - h * .05}v${h * .08}M${cx + nw / 2 - 4} ${lipY - h * .05}v${h * .08}M${cx + nw / 2 - 1} ${lipY - h * .05}v${h * .08}" stroke="#000" stroke-width=".8" opacity=".35"/><rect x="${cx - nw / 2}" y="${lipY - h * .1}" width="2.6" height="${h * .13}" rx="1" fill="#fff" opacity=".35"/>`;
    const body = `<defs>${lg(id + "g", 0, 0, 1, 0, [[0, mixc(c, -.55)], [.14, mixc(c, -.1)], [.3, mixc(c, .38)], [.5, c], [.82, mixc(c, -.3)], [1, mixc(c, -.62)]])}
      ${lg(id + "q", 0, 0, 1, 0, [[0, mixc(lq, -.5)], [.25, mixc(lq, .1)], [.55, lq], [1, mixc(lq, -.5)]])}${lg(id + "l", 0, 0, 1, 0, [[0, "#cfcfc4"], [.2, "#f7f7f0"], [.7, "#fff"], [1, "#c6c6bb"]])}${lg(id + "c", 0, 0, 1, 0, [[0, "#0a0a0a"], [.3, "#4a4a4a"], [.6, o.cap ? o.cap : "#1b1b1b"], [1, "#050505"]])}
      <clipPath id="${id}k"><path d="${path}"/></clipPath></defs>
      <path d="${path}" fill="url(#${id}g)"/>
      <g clip-path="url(#${id}k)"><rect x="${x}" y="${liqTop}" width="${w}" height="${base - liqTop}" fill="url(#${id}q)" opacity=".92"/><ellipse cx="${cx}" cy="${liqTop}" rx="${w / 2}" ry="2.4" fill="${mixc(lq, .35)}" opacity=".9"/><rect x="${x}" y="${base - 5}" width="${w}" height="5" fill="#000" opacity=".28"/></g>
      ${lab}
      <path d="M${x + 3.2} ${bodyY + 2}V${base - 9}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".6"/><path d="M${x + w - 3.5} ${bodyY + 3}V${base - 10}" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".28"/>
      <path d="M${x + 4} ${shY + 1}Q${cx - nw / 2 - 1} ${shY - 3} ${cx - nw / 2 + .5} ${y + h * .2}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="${mixc(c, -.5)}" stroke-width=".9" opacity=".6"/>${cap}`;
    const rot = o.rot ? ` transform="rotate(${o.rot} ${cx} ${base})"` : "";
    const sh = o.onShelf ? `<ellipse cx="${cx + w * .55}" cy="${y + h * .55}" rx="${w * .7}" ry="${h * .5}" fill="#3a2c16" opacity=".22" filter="url(#f-b3)" transform="translate(5 3)"/>` : cast(cx, base, w / 2, .3) + contact(cx, base, w / 2 + 1, .55);
    return `${sh}${o.onShelf ? "" : refl(body, base, .32)}<g${rot}>${body}</g>`;
  }

  // чаша (стакло, со капка на оригинален изглед одозгора)
  function beaker(x, y, w, h, o = {}) {
    const id = nid("bk"), cx = x + w / 2, ry = 3.4, lev = o.level === undefined ? .55 : o.level, base = y + h, ly = base - h * lev;
    const body = `<defs>${lg(id + "g", 0, 0, 1, 0, [[0, "#cfe3ec", .75], [.12, "#ffffff", .5], [.45, "#e6f3f9", .16], [.85, "#cfe3ec", .3], [1, "#ffffff", .75]])}${lg(id + "q", 0, 0, 0, 1, [[0, "#9bd5f2", .8], [1, "#4f9fd2", .95]])}<clipPath id="${id}k"><path d="M${x} ${y}L${x + 2} ${base - 3}Q${x + 3} ${base} ${x + 6} ${base}H${x + w - 6}Q${x + w - 3} ${base} ${x + w - 2} ${base - 3}L${x + w} ${y}Z"/></clipPath></defs>
      <path d="M${x} ${y}L${x + 2} ${base - 3}Q${x + 3} ${base} ${x + 6} ${base}H${x + w - 6}Q${x + w - 3} ${base} ${x + w - 2} ${base - 3}L${x + w} ${y}Z" fill="url(#${id}g)"/>
      <g clip-path="url(#${id}k)"><rect x="${x}" y="${ly}" width="${w}" height="${base - ly}" fill="url(#${id}q)"/><ellipse cx="${cx}" cy="${ly}" rx="${w / 2 - 1}" ry="${ry - .6}" fill="#cdeaf9" opacity=".8"/></g>
      <path d="M${x + w - 9} ${y + 8}h6M${x + w - 9} ${y + 15}h4M${x + w - 9} ${y + 22}h6M${x + w - 9} ${y + 29}h4" stroke="#6c8fa3" stroke-width="1" opacity=".8"/>
      <ellipse cx="${cx}" cy="${y}" rx="${w / 2}" ry="${ry}" fill="rgba(255,255,255,.18)" stroke="#d6eaf2" stroke-width="1.5"/><ellipse cx="${cx}" cy="${y}" rx="${w / 2 - 1.6}" ry="${ry - 1.2}" fill="none" stroke="#6b8fa1" stroke-width=".6" opacity=".6"/>
      <path d="M${x + 4} ${y + 4}V${base - 7}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".75"/><path d="M${x + w - 3} ${y + 4}V${base - 6}" stroke="#fff" stroke-width="1.2" opacity=".35"/>
      <path d="M${x + 3} ${base - 2}Q${cx} ${base + 2.4} ${x + w - 3} ${base - 2}" stroke="#7aa0b3" stroke-width="1.2" fill="none" opacity=".7"/>`;
    const rot = o.rot ? ` transform="rotate(${o.rot} ${cx} ${base})"` : "";
    return `${cast(cx, base, w / 2, .3)}${contact(cx, base, w / 2 + 1, .5)}${refl(body, base, .3)}<g${rot}>${body}</g>`;
  }

  // пламен (реален: сина основа, жолто-портокалов врв, сјај и треперење на воздухот)
  const FLAME = (cx, by) => `<g>
    <ellipse cx="${cx}" cy="${by - 22}" rx="34" ry="42" fill="#ff9b3a" opacity=".22" filter="url(#f-b4)"/>
    <path d="M${cx} ${by + 2}C${cx - 15} ${by - 12} ${cx - 13} ${by - 32} ${cx - 4} ${by - 50}C${cx - 2} ${by - 56} ${cx + 1} ${by - 58} ${cx + 2} ${by - 63}C${cx + 6} ${by - 50} ${cx + 15} ${by - 34} ${cx + 13} ${by - 12}C${cx + 12} ${by - 6} ${cx + 6} ${by} ${cx} ${by + 2}Z" fill="url(#g-fl1)" filter="url(#f-b1)"/>
    <path d="M${cx} ${by + 1}C${cx - 9} ${by - 8} ${cx - 8} ${by - 20} ${cx} ${by - 33}C${cx + 8} ${by - 20} ${cx + 9} ${by - 8} ${cx} ${by + 1}Z" fill="url(#g-fl2)"/>
    <path d="M${cx} ${by} C${cx - 4} ${by - 4} ${cx - 4} ${by - 10} ${cx} ${by - 17} C${cx + 4} ${by - 10} ${cx + 4} ${by - 4} ${cx} ${by}Z" fill="#cfeaff" opacity=".9"/>
    <path d="M${cx - 9} ${by - 74}q6 -8 0 -16t2 -16M${cx + 6} ${by - 78}q6 -8 0 -16t2 -14" stroke="#fff" stroke-width="2.4" fill="none" opacity=".16" filter="url(#f-b1)"/></g>`;
  const FLAME_DEFS = `${lg("g-fl1", 0, 1, 0, 0, [[0, "#3a7bd8", .9], [.25, "#ff9a2e", .9], [.7, "#ffd35a", .75], [1, "#fff3b0", .0]])}${lg("g-fl2", 0, 1, 0, 0, [[0, "#2f6fe0"], [.5, "#6fb6ff"], [1, "#d7efff", .3]])}`;

  // Бунзенова горелка (секогаш на масата)
  const BURNER = `<defs>${FLAME_DEFS}${lg("g-brass", 0, 0, 1, 0, [[0, "#6b4f1c"], [.3, "#e8c670"], [.55, "#b48a30"], [1, "#4d3510"]])}${lg("g-hose", 0, 0, 0, 1, [[0, "#2d4a3a"], [.4, "#59806a"], [1, "#1c2f24"]])}</defs>
    ${cast(150, 340, 20, .32)}${contact(150, 340, 24, .55)}
    <path d="M160 338q22 4 38 -2t34 6" stroke="#0a120d" stroke-width="7" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(0 4)"/>
    <path d="M160 336q22 4 38 -2t34 6" stroke="url(#g-hose)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M160 334q22 4 38 -2t34 6" stroke="#9ec0ab" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>
    <ellipse cx="150" cy="338" rx="22" ry="5.4" fill="url(#g-metal)"/><ellipse cx="150" cy="336" rx="20" ry="4.6" fill="#8a96a1"/><ellipse cx="150" cy="334.4" rx="12" ry="3" fill="#cdd5dc"/>
    <rect x="145" y="296" width="10" height="40" rx="1.6" fill="url(#g-metal)"/><rect x="142" y="316" width="16" height="9" rx="1.6" fill="url(#g-brass)"/><path d="M142 320h16" stroke="#000" stroke-width=".8" opacity=".35"/>
    <ellipse cx="150" cy="296" rx="5.4" ry="1.7" fill="#2a2f35"/><ellipse cx="150" cy="295.6" rx="4" ry="1.1" fill="#0b0e11"/>
    ${refl(`<rect x="145" y="296" width="10" height="40" fill="#aab4bd"/><rect x="142" y="316" width="16" height="9" fill="#b48a30"/>`, 338, .28)}`;

  // етикетирани шишиња на полица (секогаш во ред)
  const SHELF = bottle(282, 108, 26, 46, { c: "#3a8f58", label: "NaCl", fs: 6, onShelf: 1, level: .5 }) + bottle(327, 115, 24, 39, { c: "#c98428", label: "KI", fs: 6, onShelf: 1, level: .5 }) + bottle(367, 107, 26, 47, { c: "#4d73b8", label: "H₂O", fs: 6, onShelf: 1, level: .55 });
  const BASE2 = BASE.replace("</defs>", "");


  // ---------- кутии (картон) ----------
  const box = (x, y, w, h, o = {}) => { const d = o.d || 12, id = nid("bx"); return `<g${o.rot ? ` transform="rotate(${o.rot} ${x + w / 2} ${y + h})"` : ""}>
    <defs>${lg(id + "f", 0, 0, 1, 0, [[0, "#d2aa72"], [.6, "#c39a62"], [1, "#a97f48"]])}</defs>
    <path d="M${x + w} ${y}L${x + w + d * .55} ${y - d * .6}V${y + h - d * .6}L${x + w} ${y + h}Z" fill="#8a6338"/>
    <path d="M${x} ${y}L${x + d * .55} ${y - d * .6}H${x + w + d * .55}L${x + w} ${y}Z" fill="#e0bf8a"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}f)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#f-card)" opacity=".5"/>
    <rect x="${x + w / 2 - 6}" y="${y}" width="12" height="${h}" fill="#e6d2a2" opacity=".78"/><rect x="${x + w / 2 - 6}" y="${y}" width="2" height="${h}" fill="#fff" opacity=".35"/>
    <path d="M${x + w / 2 - 6} ${y - d * .6 + 1}L${x + w / 2 - 6 + d * .55} ${y - d * .6 + 1}" stroke="#e6d2a2" stroke-width="1"/>
    <rect x="${x}" y="${y}" width="${w}" height="3" fill="#fff" opacity=".22"/><rect x="${x}" y="${y + h - 4}" width="${w}" height="4" fill="#000" opacity=".2"/>
    ${o.label ? `<rect x="${x + 6}" y="${y + h - 22}" width="${w * .38}" height="14" rx="1" fill="#f6f2e6"/><text x="${x + 6 + w * .19}" y="${y + h - 12.4}" text-anchor="middle" font-size="6.4" font-weight="700" font-family="Arial,sans-serif" fill="#7a2a1c">${o.label}</text>` : ""}</g>`; };

  // ---------- ученичка (профил, свртена налево кон масата) ----------
  const SKIN = () => `${lg("g-skin", 0, 0, 1, 0, [[0, "#f5d2b4"], [.55, "#e8b995"], [1, "#c98d68"]])}${lg("g-skin2", 0, 0, 1, 0, [[0, "#e6ba98"], [1, "#b97c58"]])}`;
  const HEAD_DEFS = `<defs>${SKIN()}${lg("g-hair", 0, 0, 1, 0, [[0, "#8a5c33"], [.5, "#6a4223"], [1, "#3b2210"]])}${lg("g-coat", 0, 0, 1, 0, [[0, "#ffffff"], [.55, "#eef2f5"], [1, "#c3ccd4"]])}${lg("g-coat2", 0, 0, 1, 0, [[0, "#f4f7f9"], [1, "#b7c1ca"]])}${lg("g-tee", 0, 0, 1, 0, [[0, "#5ed1c1"], [.55, "#35a799"], [1, "#1f7d72"]])}${lg("g-den", 0, 0, 1, 0, [[0, "#7ea6cb"], [.55, "#557fa8"], [1, "#35597e"]])}${lg("g-trs", 0, 0, 1, 0, [[0, "#5d647c"], [.5, "#444a60"], [1, "#2a2e3f"]])}${lg("g-trs2", 0, 0, 1, 0, [[0, "#3b4054"], [1, "#1f2230"]])}</defs>`;
  const FACE = `<path d="M712 160L714 186Q724 191 735 187L732 156Z" fill="url(#g-skin2)"/><path d="M714 172Q724 178 733 172V180Q724 186 714 180Z" fill="#a8704c" opacity=".35"/>
    <path d="M717 112C706 112 699 120 699 130L699 136Q697.500 139.500 700 141.500L694 150Q694 153 697.500 153L699 153.500Q698 155.500 700 156.500Q696.500 158.500 700 160Q698 162 700 163Q700 167 704 168.500Q713 171 722 166L730 156C738 147 740 133 735 123C731 115 725 112 717 112Z" fill="url(#g-skin)"/>
    <path d="M722 166Q730 160 733 150" stroke="#b97c58" stroke-width="2" fill="none" opacity=".35"/><ellipse cx="707" cy="153" rx="5" ry="3.600" fill="#e89a8a" opacity=".22"/>
    <ellipse cx="727" cy="148" rx="3.400" ry="6" fill="#d9a07a"/><path d="M725.500 144Q729 148 726 153" stroke="#a8704c" stroke-width="1.200" fill="none"/>
    <path d="M700.500 139Q704 136 708.500 138.500Q704.500 141.800 700.500 139Z" fill="#fbf7f2"/><circle cx="703.800" cy="138.900" r="1.900" fill="#6b4524"/><circle cx="703.600" cy="138.800" r=".9" fill="#140a04"/><circle cx="703.100" cy="138.200" r=".5" fill="#fff"/>
    <path d="M700 138.800Q704.500 135 709 138" stroke="#2b1a0c" stroke-width="1.100" fill="none" stroke-linecap="round"/><path d="M699.500 134Q704.500 131 710.500 133" stroke="#5d3c1f" stroke-width="1.400" fill="none" stroke-linecap="round"/>
    <path d="M700.500 160.500Q703.500 159.500 705.500 161" stroke="#b3544f" stroke-width="1.500" fill="none" stroke-linecap="round"/><path d="M700.500 162.500Q703 164.500 705.500 162" stroke="#cf7a72" stroke-width="1.300" fill="none" stroke-linecap="round"/>`;
  const HAIR_LOOSE = `<path d="M699 129C698 114 708 108 719 109C733 110 742 120 742 138C744 160 742 186 746 214C738 221 730 218 726 208C727 192 727 176 725 160C723 150 722 140 714 132C708 127 703 126 699 129Z" fill="url(#g-hair)"/>
    <path d="M706 114Q718 108 732 116" stroke="#c19a64" stroke-width="2.600" fill="none" opacity=".6" stroke-linecap="round"/><path d="M737 130Q741 160 738 192M732 128Q736 160 732 196M742 150Q744 180 742 206" stroke="#35200f" stroke-width="1.200" fill="none" opacity=".4"/><path d="M739 140Q742 170 741 200" stroke="#b58a58" stroke-width="1.400" fill="none" opacity=".5"/>`;
  const HAIR_TIED = `<path d="M699 129C698 114 708 108 719 109C733 110 741 119 741 134C741 146 738 152 734 156C730 150 726 140 714 132C708 127 703 126 699 129Z" fill="url(#g-hair)"/><path d="M706 114Q718 108 731 116" stroke="#c19a64" stroke-width="2.400" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M738 128C752 126 764 150 760 180C758 194 754 202 749 207C750 190 749 168 741 148Z" fill="url(#g-hair)"/><path d="M749 140C757 156 758 178 754 198" stroke="#b58a58" stroke-width="1.400" fill="none" opacity=".55"/><path d="M745 150Q752 176 748 200" stroke="#35200f" stroke-width="1.100" fill="none" opacity=".4"/>
    <rect x="735" y="127" width="8" height="6" rx="2.600" fill="#2f6fd1" transform="rotate(25 739 130)"/>`;
  const GOGGLES = `<path d="M714 140L738 136" stroke="#1d3a78" stroke-width="3.800" stroke-linecap="round"/><path d="M714 138.800L738 134.800" stroke="#5f8be0" stroke-width="1" opacity=".7"/>
    <path d="M696 132L711 131Q715 132 715 136L715 144Q715 148.500 710.500 148.500L698.500 148.500Q694 148.500 694 144L694 136Q694 132 696 132Z" fill="#cfe9f7" fill-opacity=".28" stroke="#2f6fd1" stroke-width="2.600"/><path d="M697 134Q703 132 711 133" stroke="#fff" stroke-width="1.800" fill="none" opacity=".85" stroke-linecap="round"/>`;
  const HEAD = tied => `<g>${tied ? "" : `<ellipse cx="736" cy="150" rx="12" ry="40" fill="#000" opacity="0"/>`}${tied ? "" : ""}${FACE}${tied ? HAIR_TIED + GOGGLES : HAIR_LOOSE}</g>`;

  const HAND = `<path d="M698 303C694 311 695 322 700 326C706 329 712 325 714 316L715 303Z" fill="url(#g-skin)"/><path d="M702 322Q706 326 711 321" stroke="#b97c58" stroke-width="1" fill="none" opacity=".6"/><path d="M696 312Q693 316 696 320" stroke="#e9c2a3" stroke-width="1.600" fill="none" opacity=".7"/>`;
  const TORSO_BAD = `<g>
    <path d="M706 238C704 262 704 286 702 304L716 306C717 284 718 262 722 240Z" fill="url(#g-skin)"/><path d="M703 256Q710 262 718 258" stroke="#b97c58" stroke-width="1.400" fill="none" opacity=".5"/>${HAND}
    <path d="M708 183Q698 190 697 204Q694 234 697 262Q698 280 697 294H741Q742 262 740 232Q741 204 737 192Q730 184 722 182Z" fill="url(#g-tee)"/>
    <path d="M708 183Q715 192 722 182" stroke="#1f7d72" stroke-width="2.600" fill="none"/>
    <path d="M700 244Q718 252 738 246M699 268Q718 276 738 270" stroke="#1f7d72" stroke-width="1.600" fill="none" opacity=".45"/><path d="M701 206Q700 240 702 270" stroke="#9af0e4" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
    <path d="M706 186C710 200 712 220 710 236L724 238C726 222 726 204 722 187Z" fill="url(#g-tee)"/><path d="M704 232Q714 238 724 234L725 242Q714 247 704 240Z" fill="#2a968a"/>
    </g>`;
  const SHORTS = `<path d="M697 286H741L743 346Q730 350 720 347L718 322L711 348Q702 351 694 346Z" fill="url(#g-den)"/><path d="M718 292V322M699 296H739" stroke="#2c4e72" stroke-width="1.400" opacity=".6"/><path d="M696 342Q705 346 712 344M722 344Q733 348 742 342" stroke="#aac8e2" stroke-width="1.200" fill="none" stroke-dasharray="2 2"/><path d="M700 300Q703 320 701 340" stroke="#fff" stroke-width="2" fill="none" opacity=".25" stroke-linecap="round"/>`;
  const LEG_BARE = (dx, far) => `<path d="M${698 + dx} 344C${697 + dx} 368 ${699 + dx} 388 ${701 + dx} 402C${703 + dx} 422 ${706 + dx} 440 ${707 + dx} 456L${721 + dx} 456C${721 + dx} 440 ${724 + dx} 424 ${731 + dx} 406C${737 + dx} 388 ${737 + dx} 366 ${737 + dx} 344Z" fill="url(#${far ? "g-skin2" : "g-skin"})"/>${far ? "" : `<path d="M${726 + dx} 392Q${736 + dx} 410 ${728 + dx} 432" stroke="#9b6040" stroke-width="5" fill="none" opacity=".18" filter="url(#f-b2)"/><ellipse cx="${708 + dx}" cy="392" rx="6" ry="4" fill="#fff" opacity=".18"/><path d="M${702 + dx} 388Q${706 + dx} 392 ${710 + dx} 388" stroke="#b97c58" stroke-width="1.200" fill="none" opacity=".5"/><path d="M${702 + dx} 352Q${701 + dx} 380 ${704 + dx} 440" stroke="#fff" stroke-width="2.200" fill="none" opacity=".3" stroke-linecap="round"/>`}`;
  const SANDAL = `<path d="M722 457L722 466H692Q688 466 689 463Q690 459 698 458L708 456Z" fill="url(#g-skin)"/><path d="M692 463.500q1.800 1.600 3.400 0M695.500 462.500q1.800 1.600 3.400 0" stroke="#b97c58" stroke-width=".8" fill="none"/><path d="M706 456L710 466M714 456L716 466M700 460H712" stroke="#7b4a1c" stroke-width="2.600" stroke-linecap="round"/><path d="M687 466.500H726Q729 466.500 729 469Q729 471.500 726 471.500H688Q685 471.500 685 469Q685 466.500 687 466.500Z" fill="#a8672a"/><rect x="687" y="466.500" width="40" height="1.400" fill="#e3a766" opacity=".7"/>`;
  const LEGS_BAD = `<g><ellipse cx="760" cy="300" rx="22" ry="150" fill="#2a1d10" opacity=".1" filter="url(#f-b4)"/>
    ${LEG_BARE(7, true)}<g opacity=".92"><path d="M694 466.500H736Q739 466.500 739 469Q739 471.500 736 471.500H695Q692 471.500 692 469Q692 466.500 694 466.500Z" fill="#8a5220" opacity=".8"/></g>
    ${LEG_BARE(0, false)}${SANDAL}${SHORTS}</g>`;
  const TRS = (dx, far) => `<path d="M${697 + dx} 296C${696 + dx} 340 ${699 + dx} 384 ${700 + dx} 420C${701 + dx} 436 ${702 + dx} 448 ${703 + dx} 459L${719 + dx} 459C${720 + dx} 446 ${723 + dx} 430 ${729 + dx} 410C${739 + dx} 390 ${742 + dx} 340 ${741 + dx} 296Z" fill="url(#${far ? "g-trs2" : "g-trs"})"/>${far ? "" : `<path d="M${702 + dx} 392V452" stroke="#7b83a0" stroke-width="1.800" opacity=".4"/><path d="M${700 + dx} 440Q${708 + dx} 446 ${716 + dx} 441" stroke="#1b1e2b" stroke-width="2" fill="none" opacity=".5"/>`}`;
  const SHOE = `<path d="M690 470Q687 462 696 460L708 456L722 453Q726 457 725 470Z" fill="#23242b"/><path d="M691 466H726V471H689Q688 468 691 466Z" fill="#f2f2f0"/><path d="M698 460L704 462M702 458.500L708 460.500M706 457L712 459" stroke="#e9e9e9" stroke-width="1.400" stroke-linecap="round" opacity=".85"/><path d="M692 463Q696 461 704 460" stroke="#fff" stroke-width="1.200" fill="none" opacity=".25"/>`;
  const LEGS_GOOD = `<g><ellipse cx="760" cy="300" rx="22" ry="150" fill="#2a1d10" opacity=".1" filter="url(#f-b4)"/>${TRS(7, true)}<g opacity=".9"><path d="M697 468H738V471.500H696Z" fill="#c9c9c6"/></g>${TRS(0, false)}${SHOE}</g>`;
  const COAT_SLEEVE = `<path d="M706 186C702 198 700 216 701 236L698 302L717 305L720 240C721 222 722 204 722 188Z" fill="url(#g-coat)"/><path d="M706 188C703 214 703 250 701 296" stroke="#fff" stroke-width="2.600" fill="none" opacity=".55" stroke-linecap="round"/><path d="M714 214Q712 250 713 298" stroke="#aab4bd" stroke-width="1.800" fill="none" opacity=".5"/><path d="M709 244Q714 250 720 247M708 268Q713 273 719 270" stroke="#c4ccd4" stroke-width="1.400" fill="none"/><path d="M697 298L718 301L718 309L697 306Z" fill="#e3e9ee"/><path d="M697 298L718 301" stroke="#fff" stroke-width="1.200" opacity=".8"/>`;
  const TORSO_GOOD = `<g>
    <path d="M708 183C700 188 698 198 697 210Q695 250 696 290Q694 340 693 390Q718 397 746 390Q747 340 746 290Q747 250 743 216Q742 196 736 189Q728 182 722 182Z" fill="url(#g-coat)"/>
    <path d="M697 212Q695 250 696 290Q694 340 693 390" stroke="#ffffff" stroke-width="2.600" fill="none" opacity=".65"/><path d="M742 214Q745 260 745 300Q746 340 745 388" stroke="#9aa6b1" stroke-width="3" fill="none" opacity=".35" filter="url(#f-b1)"/>
    <path d="M715 214Q713 300 714 392" stroke="#cfd7de" stroke-width="1.600" fill="none"/><path d="M728 220Q726 290 728 390" stroke="#b9c3cc" stroke-width="1.800" fill="none" opacity=".5"/><path d="M702 330Q716 336 735 330M700 362Q717 369 738 362" stroke="#c3ccd4" stroke-width="1.500" fill="none" opacity=".7"/>
    <rect x="706" y="320" width="18" height="24" rx="2" fill="none" stroke="#c4ccd4" stroke-width="1.500"/><path d="M714 322V344" stroke="#d3dae0" stroke-width=".8"/>
    <circle cx="699" cy="244" r="2" fill="#a9b4be"/><circle cx="698" cy="282" r="2" fill="#a9b4be"/><circle cx="697" cy="320" r="2" fill="#a9b4be"/><circle cx="696" cy="358" r="2" fill="#a9b4be"/>
    <path d="M706 182L698 196L712 214L722 186Z" fill="#f7f9fb" stroke="#c4ccd4" stroke-width="1.200" stroke-linejoin="round"/><path d="M716 184Q724 190 731 186L734 198L720 210Z" fill="#e6ebf0"/><path d="M707 184Q712 194 718 186" fill="#3a78c9"/>
    </g>${COAT_SLEEVE}${HAND}`;


  // ---------- шишиња, храна, кабел, торба, стакло ----------
  const H2SO4 = (x, rot) => bottle(x, 106, 30, 48, { c: "#6b3a1c", liq: "#a56a2a", label: "H₂SO₄", fs: 5.4, lc: "#9c1f18", stripe: "#d9422f", onShelf: 1, rot, level: .7 });
  const RAIL = `<rect x="424" y="146" width="3" height="8" fill="#7c8791"/><rect x="466" y="146" width="3" height="8" fill="#7c8791"/><rect x="424" y="146" width="45" height="2.6" rx="1.3" fill="url(#g-metal)"/>`;
  const warm = `<ellipse cx="150" cy="334" rx="86" ry="14" fill="#ff9a3a" opacity=".3" filter="url(#f-b3)"/>`;
  const VAPOR = `<path d="M204 290q-7 -9 0 -16t0 -14M214 288q-7 -9 0 -16t0 -14" stroke="#cfe6ee" stroke-width="2.600" fill="none" opacity=".5" stroke-linecap="round" filter="url(#f-b1)"/>`;
  const ETHANOL = open => bottle(192, 296, 32, 46, { c: "#e3eff3", liq: "#d4e9f0", label: "ЕТАНОЛ", fs: 5, lc: "#b3261e", stripe: "#d9422f", cap: "#c04f2f", open, level: .72 });

  const FOOD = `<g>${cast(300, 342, 36, .3)}
    <ellipse cx="292" cy="341" rx="34" ry="7.600" fill="#000" opacity=".3" filter="url(#f-b2)"/><ellipse cx="292" cy="339" rx="33" ry="7" fill="#f4f4f1"/><ellipse cx="292" cy="338.600" rx="26" ry="5" fill="#e4e4de"/><ellipse cx="292" cy="338" rx="33" ry="7" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
    <path d="M269 336Q268 329 276 329H308Q316 329 316 336Q316 339 312 339H273Q269 339 269 336Z" fill="#d6a85c"/><path d="M270 333H315" stroke="#a97a32" stroke-width="1" opacity=".5"/>
    <path d="M268 330Q276 325 284 329Q292 323 300 328Q308 324 317 330" stroke="#6fae4f" stroke-width="4.600" fill="none" stroke-linecap="round"/><path d="M270 326Q280 323 292 326Q304 322 315 326" stroke="#8cc86a" stroke-width="2" fill="none" opacity=".7"/>
    <ellipse cx="279" cy="327.500" rx="7" ry="2.300" fill="#d6453a"/><ellipse cx="296" cy="326.500" rx="7" ry="2.200" fill="#cf3c32"/><path d="M270 324H316L313 322H273Z" fill="#f0cf5a"/>
    <path d="M268 322Q268 311 291 311Q315 311 316 322Q316 325 312 325H272Q268 325 268 322Z" fill="url(#g-bread)"/><path d="M273 316Q290 311 308 316" stroke="#fff3c9" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
    <circle cx="330" cy="348" r="0" fill="none"/>
    <ellipse cx="328" cy="341" rx="13" ry="3" fill="#000" opacity=".35" filter="url(#f-b2)"/>
    <path d="M318 318H342L340 338Q340 341 336 341H324Q320 341 320 338Z" fill="url(#g-mug)"/><ellipse cx="330" cy="318" rx="12" ry="3.200" fill="#f1f1ee"/><ellipse cx="330" cy="318.600" rx="10.400" ry="2.500" fill="#5a3a1f"/><ellipse cx="327" cy="318" rx="4" ry="1" fill="#a97a4a" opacity=".6"/>
    <path d="M341 322Q349 322 349 329Q349 336 340 336" stroke="#e9e9e5" stroke-width="3.400" fill="none"/><path d="M341 322Q349 322 349 329" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/>
    <path d="M325 312q-4 -6 0 -11t0 -9M334 312q-4 -6 0 -11t0 -9" stroke="#fff" stroke-width="2.200" fill="none" opacity=".4" stroke-linecap="round" filter="url(#f-b1)"/>
    <circle cx="318" cy="343" r="1" fill="#d6a85c"/><circle cx="352" cy="344" r="1.100" fill="#d6a85c"/><circle cx="262" cy="343" r=".9" fill="#d6a85c"/></g>`;
  const FOOD_DEFS = `<defs>${lg("g-bread", 0, 0, 0, 1, [[0, "#e9c277"], [.6, "#d09a48"], [1, "#b97e30"]])}${lg("g-mug", 0, 0, 1, 0, [[0, "#c8cbcc"], [.3, "#ffffff"], [.7, "#f0f0ed"], [1, "#b2b6b8"]])}${lg("g-note", 0, 0, 1, 1, [[0, "#3c5fae"], [1, "#1f3875"]])}${lg("g-pen", 0, 0, 0, 1, [[0, "#ffe27a"], [.5, "#f2bf27"], [1, "#b88a10"]])}</defs>`;
  const NOTE = `<g>${FOOD_DEFS}${cast(296, 346, 30, .28)}<path d="M272 347L326 344L328 349L274 352Z" fill="#000" opacity=".3" filter="url(#f-b2)"/>
    <path d="M273 347L326 343.500L326.500 346.800L273.500 350.400Z" fill="#efeee6"/><path d="M273 348.200L326 344.700M273.300 349.300L326.300 345.800" stroke="#c9c7ba" stroke-width=".6"/>
    <path d="M270 338L320 334L327 343.500L273 347Z" fill="url(#g-note)"/><path d="M270 338L320 334" stroke="#8fa8e0" stroke-width="1" opacity=".7"/>
    <path d="M296 335.500L303 345" stroke="#142852" stroke-width="3.400" opacity=".6"/><rect x="283" y="340" width="20" height="3.600" rx=".8" fill="#e9e6d6" opacity=".8" transform="rotate(-4 293 342)"/>
    ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${272.400 + i * 1.100}" cy="${339.500 + i * 1.280}" rx="2.200" ry="1" fill="#c3c9d0" stroke="#7c8791" stroke-width=".5"/>`).join("")}
    <path d="M334 345L362 338" stroke="#000" stroke-width="3" opacity=".3" filter="url(#f-b1)" transform="translate(1 3)"/><path d="M334 343.500L359 337.200L362 338.200L336 346Z" fill="url(#g-pen)"/><path d="M334 343.800L359 337.500" stroke="#fff3b0" stroke-width=".8" opacity=".8"/><path d="M359 337.200L364 336L362 338.200Z" fill="#e6c79c"/><path d="M362.800 336.300L364 336L363.200 337.300Z" fill="#2b2b2b"/><path d="M334 343.500L330 344.800L331.600 347.200L336 346Z" fill="#e48aa0"/></g>`;

  const SPILL = `<g>${cast(400, 350, 34, .25)}
    <ellipse cx="440" cy="345" rx="34" ry="6" fill="#2f5a1a" opacity=".35" filter="url(#f-b2)"/>
    <defs>${lg("g-grn", 0, 0, 0, 1, [[0, "#b7ee8b", .9], [1, "#6fbf45", .95]])}</defs>
    <path d="M417 346Q420 340 440 340Q462 340 470 346Q468 351 450 351Q426 352 417 346Z" fill="url(#g-grn)"/><path d="M426 344Q440 341 458 344" stroke="#f1ffe2" stroke-width="1.600" fill="none" opacity=".8" stroke-linecap="round"/>
    <path d="M440 324Q444 334 441 342" stroke="url(#g-grn)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M439 326Q442 334 440 341" stroke="#e6ffd0" stroke-width="1" fill="none" opacity=".8"/>
    <path d="M463 349Q466 356 464 364Q462 372 465 380" stroke="#79c84d" stroke-width="5.600" fill="none" stroke-linecap="round" opacity=".92"/><path d="M462 352Q464 360 463 368" stroke="#d8ffbd" stroke-width="1.400" fill="none" opacity=".8" stroke-linecap="round"/><ellipse cx="465" cy="382" rx="3.600" ry="4.600" fill="#79c84d"/><ellipse cx="464" cy="381" rx="1" ry="1.600" fill="#e9ffd6"/></g>`;
  const UNLABELED = `${SPILL}${bottle(380, 288, 30, 46, { c: "#8a5a2b", liq: "#b27a3c", open: true, rot: 75, level: .35 })}`;

  const HEATER = (good) => `<g>${cast(496, 342, 46, .3)}${contact(496, 342, 50, .5)}
    <defs>${lg("g-hbody", 0, 0, 0, 1, [[0, "#555d66"], [.2, "#363c43"], [1, "#171a1e"]])}${lg("g-hplate", 0, 0, 1, 0, [[0, "#6c7681"], [.3, "#c4ccd3"], [.6, "#8a949e"], [1, "#4c555e"]])}${rg("g-led", .5, .5, .5, [[0, good ? "#ff8a7a" : "#9dffa8"], [1, good ? "#d62d20" : "#1fb34a"]])}</defs>
    <ellipse cx="496" cy="322.400" rx="46" ry="4.200" fill="url(#g-hplate)"/><ellipse cx="496" cy="321.800" rx="40" ry="3" fill="#5b646d" opacity=".5"/>
    <rect x="450" y="322" width="92" height="19" rx="4" fill="url(#g-hbody)"/><rect x="451" y="322.600" width="90" height="1.800" rx=".9" fill="#fff" opacity=".28"/><rect x="450" y="337" width="92" height="4" rx="2" fill="#000" opacity=".35"/>
    <path d="M488 330h22M488 333h22M488 336h22" stroke="#000" stroke-width="1" opacity=".5"/>
    <circle cx="468" cy="331" r="5.200" fill="#1b1e22"/><circle cx="468" cy="331" r="4.200" fill="#d6892e"/><path d="M468 327.400v3.600" stroke="#fff" stroke-width="1.200"/><circle cx="467" cy="329.500" r="1.200" fill="#fff" opacity=".6"/>
    <circle cx="524" cy="331" r="3.200" fill="url(#g-led)"/><circle cx="524" cy="331" r="7" fill="${good ? "#d62d20" : "#32d062"}" opacity=".25" filter="url(#f-b1)"/></g>`;
  const CABLE_BAD = `<g>
    <path d="M542 332C568 336 572 352 562 374C554 394 550 412 553 447" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(6 4)"/>
    <path d="M542 332C568 336 572 352 562 374C554 394 550 412 553 447" stroke="#14171b" stroke-width="3.800" fill="none" stroke-linecap="round"/><path d="M542 331C567 335 571 351 561 373C553 393 549 411 552 446" stroke="#6b7480" stroke-width="1" fill="none" opacity=".6" stroke-linecap="round"/>
    <defs>${lg("g-pud", 0, 0, 0, 1, [[0, "#d9f0fb", .8], [1, "#8cc4e4", .85]])}</defs>
    <ellipse cx="553" cy="454" rx="42" ry="9.400" fill="#1a2a35" opacity=".22" filter="url(#f-b2)"/><ellipse cx="553" cy="452" rx="40" ry="8.600" fill="url(#g-pud)"/><ellipse cx="553" cy="452" rx="40" ry="8.600" fill="none" stroke="#fff" stroke-width="1.400" opacity=".7"/>
    <path d="M526 450Q540 446 552 449" stroke="#fff" stroke-width="2.200" fill="none" opacity=".85" stroke-linecap="round"/><path d="M566 455Q576 454 582 451" stroke="#fff" stroke-width="1.400" fill="none" opacity=".6" stroke-linecap="round"/><ellipse cx="553" cy="449" rx="9" ry="2.200" fill="none" stroke="#fff" stroke-width=".9" opacity=".7"/>
    <path d="M556 438l-4 7h5l-4 8" stroke="#fff6a8" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round" filter="url(#f-b1)"/><path d="M556 438l-4 7h5l-4 8" stroke="#ffe44d" stroke-width="1" fill="none" stroke-linejoin="round" stroke-linecap="round"/></g>`;
  const CABLE_GOOD = `<g><path d="M581 316C579 326 562 331 542 332" stroke="#000" stroke-width="4.600" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(2 4)"/><path d="M581 316C579 326 562 331 542 332" stroke="#14171b" stroke-width="3.600" fill="none" stroke-linecap="round"/><path d="M581 315C579 325 562 330 542 331" stroke="#6b7480" stroke-width=".9" fill="none" opacity=".6"/>
    <rect x="572" y="297" width="20" height="19" rx="3.600" fill="#000" opacity=".3" filter="url(#f-b1)" transform="translate(1.500 2.500)"/><rect x="572" y="297" width="20" height="19" rx="3.600" fill="#e9e7e1" stroke="#b3ae9c" stroke-width="1"/><rect x="574" y="299" width="16" height="4" rx="2" fill="#fff" opacity=".7"/><rect x="577" y="311" width="8" height="7" rx="1.600" fill="#d9d6cc"/></g>`;

  const BAG = `<g>${contact(206, 490, 62, .5)}
    <defs>${lg("g-bag", 0, 0, 1, 1, [[0, "#ea5646"], [.5, "#c63a2d"], [1, "#8f2218"]])}${lg("g-bag2", 0, 0, 0, 1, [[0, "#b3281d"], [1, "#7c1a12"]])}</defs>
    <path d="M168 470Q140 474 132 494Q150 500 170 488" stroke="#000" stroke-width="10" fill="none" opacity=".25" filter="url(#f-b2)" transform="translate(0 4)"/><path d="M168 470Q140 474 132 494Q150 500 170 488" stroke="#7c1a12" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M167 468Q140 472 133 491" stroke="#d8604f" stroke-width="1.600" fill="none" opacity=".6" stroke-linecap="round"/><rect x="128" y="488" width="8" height="5" rx="1.500" fill="#2a2a2a" transform="rotate(-20 132 490)"/>
    <path d="M244 470Q268 478 274 496Q256 500 242 488" stroke="#7c1a12" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M244 468Q266 476 272 492" stroke="#d8604f" stroke-width="1.600" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M184 446Q205 420 228 446" stroke="#4a100b" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M185 446Q205 424 227 446" stroke="#b9382b" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>
    <rect x="160" y="440" width="92" height="50" rx="17" fill="url(#g-bag)"/><rect x="160" y="440" width="92" height="50" rx="17" filter="url(#f-fabric)" opacity=".45"/><rect x="164" y="442" width="84" height="9" rx="4.500" fill="#fff" opacity=".22"/><rect x="160" y="478" width="92" height="12" rx="6" fill="#000" opacity=".22"/>
    <rect x="173" y="460" width="66" height="27" rx="9" fill="url(#g-bag2)"/><rect x="173" y="460" width="66" height="27" rx="9" filter="url(#f-fabric)" opacity=".4"/><path d="M178 462H234" stroke="#e7dfc9" stroke-width="2" stroke-dasharray="3 2.200"/><rect x="203" y="458" width="10" height="5" rx="1.500" fill="url(#g-metal)"/><circle cx="208" cy="476" r="3.400" fill="#e9dcb4" stroke="#8a7b4e" stroke-width=".8"/>
    <path d="M166 454Q170 448 178 446" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/></g>`;
  const SHARD = (pts, k) => { const p = pts.map(q => q.join(",")).join(" "); return `<polygon points="${pts.map(q => (q[0] + 3) + "," + (q[1] + 3)).join(" ")}" fill="#1a2a35" opacity=".28" filter="url(#f-b1)"/><polygon points="${p}" fill="url(#g-shard)" stroke="#fff" stroke-width=".9" stroke-opacity=".85"/><path d="M${pts[0][0]} ${pts[0][1]}L${pts[1][0]} ${pts[1][1]}" stroke="#fff" stroke-width="1.600" opacity=".9"/>`; };
  const GLASS = `<g><defs>${lg("g-shard", 0, 0, 1, 1, [[0, "#f6fcff", .85], [.5, "#cfe7f2", .55], [1, "#9cc4d8", .7]])}</defs>
    ${[[[303,486],[309,474],[321,467],[333,481],[324,489]], [[336,481],[343,468],[351,459],[364,477],[352,484]], [[366,487],[372,476],[380,471],[391,484],[381,490]], [[319,490],[327,484],[336,486],[331,492]], [[393,484],[399,476],[407,480],[404,488]], [[345,490],[352,485],[359,488],[353,493]], [[285,491],[292,485],[298,489],[291,494]], [[408,492],[414,488],[417,493]]].map(SHARD).join("")}
    <path d="M338 470l4 -9M352 470l6 -4" stroke="#fff" stroke-width="1.600" stroke-linecap="round" opacity=".9"/><path d="M320 470l0 -6M317 467h6" stroke="#fff" stroke-width="1.200" opacity=".9"/><path d="M381 474l0 -5M378.500 471.500h5" stroke="#fff" stroke-width="1.100" opacity=".9"/>
    <path d="M308 492Q340 500 378 494" stroke="#bcd8e6" stroke-width="2.200" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  const BOXES = `<g>${contact(78, 342, 60, .5)}<ellipse cx="78" cy="300" rx="52" ry="48" fill="#000" opacity=".18" filter="url(#f-b4)" transform="translate(16 6)"/>
    ${box(32, 288, 82, 54, { d: 14, label: "КРХКО" })}${box(40, 244, 68, 44, { d: 12, rot: -2 })}${box(50, 206, 56, 38, { d: 10, rot: 5, label: "КРХКО" })}</g>`;


  // ---------- Опасности: bad = небезбедно, good = безбедно (null = нема ништо) ----------
  const TXT = {
 "polica": {
  "name": "Тешко шише на работ од полицата",
  "why": "Тешко шише со киселина е на самиот раб од полицата и може да падне, да се скрши и да се излее.",
  "fix": "Тешките и опасни шишиња се чуваат ниско и позади, на полица со раб што ги задржува.",
  "ok": "Шишето е сигурно позади на полицата, зад заштитен раб."
 },
 "aparat": {
  "name": "Блокиран апарат за гаснење",
  "why": "Апаратот за гаснење е закопан зад кутии. Во итна ситуација нема време за поместување.",
  "fix": "Патот до апаратот, тушот за итни случаи и излезот мора секогаш да се слободни.",
  "ok": "Апаратот за гаснење е на видливо место и пристапот е слободен."
 },
 "etanol": {
  "name": "Отворен етанол покрај пламен",
  "why": "Шишето со лесно запалив етанол е отворено веднаш до запалена горелка. Пареите можат да се запалат.",
  "fix": "Запаливите течности се држат затворени и далеку од пламен. Горелката се пали само кога е потребна.",
  "ok": "Горелката е изгасната, а шишето со етанол е затворено."
 },
 "hrana": {
  "name": "Храна и пијалок во лабораторија",
  "why": "Сендвич и чаша на работната маса. Храната може да се загади со хемикалии.",
  "fix": "Во лабораторија не се јаде, не се пие и не се чуваат прибор за јадење или храна.",
  "ok": "На масата има само тетратка и молив."
 },
 "bezetiketa": {
  "name": "Шише без етикета и истурена течност",
  "why": "Шишето нема етикета, а од него се излева течност. Не се знае што е.",
  "fix": "Секое шише има етикета (име, концентрација, ознака за опасност), а излеаното се чисти веднаш по упатство.",
  "ok": "Шишето е затворено и означено."
 },
 "kabel": {
  "name": "Кабел во локва вода",
  "why": "Кабел од грејач виси надолу и допира локва вода. Има опасност од струен удар и кратко спојување.",
  "fix": "Каблите се водат кон ѕидот, подалеку од вода, а излеаното се брише веднаш.",
  "ok": "Кабелот е кусо и уредно поврзан со штекер, подалеку од вода."
 },
 "rabot": {
  "name": "Стаклен сад на работ на масата",
  "why": "Чашата е на самиот раб од масата и лесно може да падне и да се скрши.",
  "fix": "Садовите се ставаат на средина од масата, подалеку од работ.",
  "ok": "Чашата стои сигурно на маса, подалеку од работ."
 },
 "torba": {
  "name": "Торба на подот во премин",
  "why": "Раниче на подот пред масата. Некој може да се сапне и да падне со хемикалии во рака.",
  "fix": "Торбите и јакните се оставаат на определено место, подалеку од работните површини и преминот.",
  "ok": ""
 },
 "staklo": {
  "name": "Скршено стакло на подот",
  "why": "На подот има парчиња скршено стакло, а можат да нанесат посекотини.",
  "fix": "Стаклото не се собира со раце: се користи лопатка и четка, а се фрла во посебен сад за стаклен отпад.",
  "ok": ""
 },
 "ocila": {
  "name": "Без заштитни очила и распуштена коса",
  "why": "Нема заштитни очила, а долгата коса е распуштена: може да влезе во пламен или во садови.",
  "fix": "Заштитните очила се носат цело време во лабораторија, а долгата коса се врзува.",
  "ok": "Носи заштитни очила, а косата е врзана."
 },
 "mantil": {
  "name": "Без мантил, голи раце",
  "why": "Облечена е во кратка маица, без мантил. Прскање на хемикалија удира директно на кожата.",
  "fix": "Се носи долг, затворен мантил од памук со долги ракави.",
  "ok": "Носи долг, затворен мантил."
 },
 "chevli": {
  "name": "Отворени сандали и шорцеви",
  "why": "Носи шорцеви и отворени сандали. Хемикалија или стакло што ќе падне на нога го повредува директно.",
  "fix": "Во лабораторија се носат затворени чевли и долги панталони.",
  "ok": "Носи затворени чевли и долги панталони."
 }
};
  const T = id => TXT[id];
  const H = [
    { id: "polica", ...T("polica"), hot: [478, 94, 72, 66], hotGood: [418, 96, 60, 62], bad: H2SO4(514, 12), good: H2SO4(428, 0) + RAIL },
    { id: "aparat", ...T("aparat"), hot: [24, 186, 96, 156], hotGood: [24, 186, 86, 150], bad: BOXES, good: "" },
    { id: "etanol", ...T("etanol"), hot: [96, 232, 150, 112], hotGood: [96, 244, 150, 100], bad: warm + FLAME(150, 294) + ETHANOL(true) + VAPOR + `<ellipse cx="238" cy="341" rx="8" ry="2.600" fill="#c04f2f"/><ellipse cx="238" cy="339.600" rx="8" ry="2.600" fill="#e0643f"/>`, good: ETHANOL(false) },
    { id: "hrana", ...T("hrana"), hot: [258, 296, 98, 52], hotGood: [262, 300, 104, 54], bad: FOOD, good: NOTE },
    { id: "bezetiketa", ...T("bezetiketa"), hot: [372, 296, 108, 92], hotGood: [372, 290, 50, 56], bad: UNLABELED, good: bottle(380, 296, 30, 46, { c: "#a9c3cf", liq: "#ead9a0", label: "HCl 1M", fs: 5.4, cap: "#1b1b1b", level: .55 }) },
    { id: "kabel", ...T("kabel"), hot: [532, 332, 84, 130], hotGood: [440, 296, 150, 48], bad: HEATER(false) + CABLE_BAD, good: HEATER(true) + CABLE_GOOD },
    { id: "rabot", ...T("rabot"), hot: [626, 304, 48, 52], hotGood: [598, 300, 44, 44], bad: beaker(634, 312, 30, 36, { rot: 9 }), good: beaker(604, 304, 30, 36) },
    { id: "torba", ...T("torba"), hot: [124, 420, 160, 78], hotGood: null, bad: BAG, good: null },
    { id: "staklo", ...T("staklo"), hot: [282, 456, 130, 44], hotGood: null, bad: GLASS, good: null },
    { id: "ocila", ...T("ocila"), hot: [690, 106, 76, 112], hotGood: [690, 106, 76, 112], fig: true, bad: HEAD(false), good: HEAD(true) },
    { id: "mantil", ...T("mantil"), hot: [690, 182, 62, 110], hotGood: [690, 180, 62, 214], fig: true, bad: TORSO_BAD, good: TORSO_GOOD },
    { id: "chevli", ...T("chevli"), hot: [686, 290, 62, 186], hotGood: [686, 392, 62, 84], fig: true, bad: LEGS_BAD, good: LEGS_GOOD },
  ];
  // секогаш во ред (за кликање што учи)
  const SAFE = [
    { name: "Прва помош", hot: [554, 190, 66, 52], ok: "Кутијата за прва помош е на видливо и достапно место: ова е во ред." },
    { name: "Затворени шишиња на полица", hot: [270, 100, 134, 58], ok: "Затворени и означени шишиња на полица со раб: ова е во ред." },
    { name: "Прозорец", hot: [88, 26, 180, 160], ok: "Прозорецот обезбедува светлина и проветрување: ова е во ред." },
    { name: "Периоден систем", hot: [330, 172, 128, 54], ok: "Постерот со периодниот систем е на ѕидот за брза проверка: ова е во ред." },
  ];

  const N_BAD = 8;

  // ---------- состојба ----------
  let active = [], found = new Set(), wrong = 0, hints = 0, over = false, streak = 0;
  const defs = DEFS + HEAD_DEFS + FOOD_DEFS;

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
    svg.innerHTML = defs + BASE + BURNER + SHELF + `<g id="sf-items">${items}</g>${FX}<g id="sf-marks"></g>`;
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
