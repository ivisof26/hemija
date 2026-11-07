// Игра „Лабораториска безбедност“: најди ги опасните грешки на сликата
(function () {
  const svg = document.getElementById("sf-svg");
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // ======================================================================
  //  РЕАЛИСТИЧНА СЦЕНА: Совршени пропорции на ученичката (раце, нозе, стапала)
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
    <!-- маса: плоча и врати -->
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
    <!-- под: со перспектива -->
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

  const FLAME = (cx, by) => `<g>
    <ellipse cx="${cx}" cy="${by - 22}" rx="34" ry="42" fill="#ff9b3a" opacity=".22" filter="url(#f-b4)"/>
    <path d="M${cx} ${by + 2}C${cx - 15} ${by - 12} ${cx - 13} ${by - 32} ${cx - 4} ${by - 50}C${cx - 2} ${by - 56} ${cx + 1} ${by - 58} ${cx + 2} ${by - 63}C${cx + 6} ${by - 50} ${cx + 15} ${by - 34} ${cx + 13} ${by - 12}C${cx + 12} ${by - 6} ${cx + 6} ${by} ${cx} ${by + 2}Z" fill="url(#g-fl1)" filter="url(#f-b1)"/>
    <path d="M${cx} ${by + 1}C${cx - 9} ${by - 8} ${cx - 8} ${by - 20} ${cx} ${by - 33}C${cx + 8} ${by - 20} ${cx + 9} ${by - 8} ${cx} ${by + 1}Z" fill="url(#g-fl2)"/>
    <path d="M${cx} ${by} C${cx - 4} ${by - 4} ${cx - 4} ${by - 10} ${cx} ${by - 17} C${cx + 4} ${by - 10} ${cx + 4} ${by - 4} ${cx} ${by}Z" fill="#cfeaff" opacity=".9"/>
    <path d="M${cx - 9} ${by - 74}q6 -8 0 -16t2 -16M${cx + 6} ${by - 78}q6 -8 0 -16t2 -14" stroke="#fff" stroke-width="2.4" fill="none" opacity=".16" filter="url(#f-b1)"/></g>`;
  const FLAME_DEFS = `${lg("g-fl1", 0, 1, 0, 0, [[0, "#3a7bd8", .9], [.25, "#ff9a2e", .9], [.7, "#ffd35a", .75], [1, "#fff3b0", .0]])}${lg("g-fl2", 0, 1, 0, 0, [[0, "#2f6fe0"], [.5, "#6fb6ff"], [1, "#d7efff", .3]])}`;

  const BURNER = `<defs>${FLAME_DEFS}${lg("g-brass", 0, 0, 1, 0, [[0, "#6b4f1c"], [.3, "#e8c670"], [.55, "#b48a30"], [1, "#4d3510"]])}${lg("g-hose", 0, 0, 0, 1, [[0, "#2d4a3a"], [.4, "#59806a"], [1, "#1c2f24"]])}</defs>
    ${cast(150, 306, 20, .32)}${contact(150, 306, 24, .55)}
    <path d="M160 304q22 4 38 -2t34 6" stroke="#0a120d" stroke-width="7" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(0 4)"/>
    <path d="M160 302q22 4 38 -2t34 6" stroke="url(#g-hose)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M160 300q22 4 38 -2t34 6" stroke="#9ec0ab" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>
    <ellipse cx="150" cy="304" rx="22" ry="5.4" fill="url(#g-metal)"/><ellipse cx="150" cy="302" rx="20" ry="4.6" fill="#8a96a1"/><ellipse cx="150" cy="300.4" rx="12" ry="3" fill="#cdd5dc"/>
    <rect x="145" y="262" width="10" height="40" rx="1.6" fill="url(#g-metal)"/><rect x="142" y="282" width="16" height="9" rx="1.6" fill="url(#g-brass)"/><path d="M142 286h16" stroke="#000" stroke-width=".8" opacity=".35"/>
    <ellipse cx="150" cy="262" rx="5.4" ry="1.7" fill="#2a2f35"/><ellipse cx="150" cy="261.6" rx="4" ry="1.1" fill="#0b0e11"/>
    ${refl(`<rect x="145" y="262" width="10" height="40" fill="#aab4bd"/><rect x="142" y="282" width="16" height="9" fill="#b48a30"/>`, 304, .28)}`;

  const SHELF = bottle(282, 108, 26, 46, { c: "#3a8f58", label: "NaCl", fs: 6, onShelf: 1, level: .5 }) + bottle(327, 115, 24, 39, { c: "#c98428", label: "KI", fs: 6, onShelf: 1, level: .5 }) + bottle(367, 107, 26, 47, { c: "#4d73b8", label: "H₂O", fs: 6, onShelf: 1, level: .55 });
  const BASE2 = BASE.replace("</defs>", "");

  const box = (x, y, w, h, o = {}) => { const d = o.d || 12, id = nid("bx"); return `<g${o.rot ? ` transform="rotate(${o.rot} ${x + w / 2} ${y + h})"` : ""}>
    <defs>${lg(id + "f", 0, 0, 1, 0, [[0, "#d2aa72"], [.6, "#c39a62"], [1, "#a97f48"]])}</defs>
    <path d="M${x + w} ${y}L${x + w + d * .55} ${y - d * .6}V${y + h - d * .6}L${x + w} ${y + h}Z" fill="#8a6338"/>
    <path d="M${x} ${y}L${x + d * .55} ${y - d * .6}H${x + w + d * .55}L${x + w} ${y}Z" fill="#e0bf8a"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}f)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#f-card)" opacity=".5"/>
    <rect x="${x + w / 2 - 6}" y="${y}" width="12" height="${h}" fill="#e6d2a2" opacity=".78"/><rect x="${x + w / 2 - 6}" y="${y}" width="2" height="${h}" fill="#fff" opacity=".35"/>
    <path d="M${x + w / 2 - 6} ${y - d * .6 + 1}L${x + w / 2 - 6 + d * .55} ${y - d * .6 + 1}" stroke="#e6d2a2" stroke-width="1"/>
    <rect x="${x}" y="${y}" width="${w}" height="3" fill="#fff" opacity=".22"/><rect x="${x}" y="${y + h - 4}" width="${w}" height="4" fill="#000" opacity=".2"/>
    ${o.label ? `<rect x="${x + 6}" y="${y + h - 22}" width="${w * .38}" height="14" rx="1" fill="#f6f2e6"/><text x="${x + 6 + w * .19}" y="${y + h - 12.4}" text-anchor="middle" font-size="6.4" font-weight="700" font-family="Arial,sans-serif" fill="#7a2a1c">${o.label}</text>` : ""}</g>`; };

  // ======================================================================
  //  ПРЕПРАВЕНИ ДЕЛОВИ ЗА УЧЕНИЧКАТА (Раце, правилни нозе и стапала)
  // ======================================================================
  const SKIN = () => `${lg("g-skin", 0, 0, 1, 0, [[0, "#f5d2b4"], [.55, "#e8b995"], [1, "#c98d68"]])}${lg("g-skin2", 0, 0, 1, 0, [[0, "#e6ba98"], [1, "#b97c58"]])}`;
  const HEAD_DEFS = `<defs>${SKIN()}${lg("g-hair", 0, 0, 1, 0, [[0, "#8a5c33"], [.5, "#6a4223"], [1, "#3b2210"]])}${lg("g-coat", 0, 0, 1, 0, [[0, "#ffffff"], [.55, "#eef2f5"], [1, "#c3ccd4"]])}${lg("g-coat2", 0, 0, 1, 0, [[0, "#f4f7f9"], [1, "#b7c1ca"]])}${lg("g-tee", 0, 0, 1, 0, [[0, "#5ed1c1"], [.55, "#35a799"], [1, "#1f7d72"]])}${lg("g-den", 0, 0, 1, 0, [[0, "#7ea6cb"], [.55, "#557fa8"], [1, "#35597e"]])}${lg("g-trs", 0, 0, 1, 0, [[0, "#5d647c"], [.5, "#444a60"], [1, "#2a2e3f"]])}${lg("g-trs2", 0, 0, 1, 0, [[0, "#3b4054"], [1, "#1f2230"]])}</defs>`;
  
  const FACE = `<path d="M712 128L714 154Q724 159 735 155L732 124Z" fill="url(#g-skin2)"/><path d="M714 140Q724 146 733 140V148Q724 154 714 148Z" fill="#a8704c" opacity=".35"/>
    <path d="M717 80C706 80 699 88 699 98L699 104Q697.500 107.500 700 109.500L694 118Q694 121 697.500 121L699 121.500Q698 123.500 700 124.500Q696.500 126.500 700 128Q698 130 700 131Q700 135 704 136.500Q713 139 722 134L730 124C738 115 740 101 735 91C731 83 725 80 717 80Z" fill="url(#g-skin)"/>
    <path d="M722 134Q730 128 733 118" stroke="#b97c58" stroke-width="2" fill="none" opacity=".35"/><ellipse cx="707" cy="121" rx="5" ry="3.600" fill="#e89a8a" opacity=".22"/>
    <ellipse cx="727" cy="116" rx="3.400" ry="6" fill="#d9a07a"/><path d="M725.500 112Q729 116 726 121" stroke="#a8704c" stroke-width="1.200" fill="none"/>
    <path d="M700.500 107Q704 104 708.500 106.500Q704.500 109.800 700.500 107Z" fill="#fbf7f2"/><circle cx="703.800" cy="106.900" r="1.900" fill="#6b4524"/><circle cx="703.600" cy="106.800" r=".9" fill="#140a04"/><circle cx="703.100" cy="106.200" r=".5" fill="#fff"/>
    <path d="M700 106.800Q704.500 103 709 106" stroke="#2b1a0c" stroke-width="1.100" fill="none" stroke-linecap="round"/><path d="M699.500 102Q704.500 99 710.500 101" stroke="#5d3c1f" stroke-width="1.400" fill="none" stroke-linecap="round"/>
    <path d="M700.500 128.500Q703.500 127.500 705.500 129" stroke="#b3544f" stroke-width="1.500" fill="none" stroke-linecap="round"/><path d="M700.500 130.500Q703 132.500 705.500 130" stroke="#cf7a72" stroke-width="1.300" fill="none" stroke-linecap="round"/>`;
  const HAIR_LOOSE = `<path d="M699 97C698 82 708 76 719 77C733 78 742 88 742 106C744 128 742 154 746 182C738 189 730 186 726 176C727 160 727 144 725 128C723 118 722 108 714 100C708 95 703 94 699 97Z" fill="url(#g-hair)"/>
    <path d="M706 82Q718 76 732 84" stroke="#c19a64" stroke-width="2.600" fill="none" opacity=".6" stroke-linecap="round"/><path d="M737 98Q741 128 738 160M732 96Q736 128 732 164M742 118Q744 148 742 174" stroke="#35200f" stroke-width="1.200" fill="none" opacity=".4"/><path d="M739 108Q742 138 741 168" stroke="#b58a58" stroke-width="1.400" fill="none" opacity=".5"/>`;
  const HAIR_TIED = `<path d="M699 97C698 82 708 76 719 77C733 78 741 87 741 102C741 114 738 120 734 124C730 118 726 108 714 100C708 95 703 94 699 97Z" fill="url(#g-hair)"/><path d="M706 82Q718 76 731 84" stroke="#c19a64" stroke-width="2.400" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M738 96C752 94 764 118 760 148C758 162 754 170 749 175C750 158 749 136 741 116Z" fill="url(#g-hair)"/><path d="M749 108C757 124 758 146 754 166" stroke="#b58a58" stroke-width="1.400" fill="none" opacity=".55"/><path d="M745 118Q752 144 748 168" stroke="#35200f" stroke-width="1.100" fill="none" opacity=".4"/>
    <rect x="735" y="95" width="8" height="6" rx="2.600" fill="#2f6fd1" transform="rotate(25 739 98)"/>`;
  const GOGGLES = `<path d="M714 108L738 104" stroke="#1d3a78" stroke-width="3.800" stroke-linecap="round"/><path d="M714 106.800L738 102.800" stroke="#5f8be0" stroke-width="1" opacity=".7"/>
    <path d="M696 100L711 99Q715 100 715 104L715 112Q715 116.500 710.500 116.500L698.500 116.500Q694 116.500 694 112L694 104Q694 100 696 100Z" fill="#cfe9f7" fill-opacity=".28" stroke="#2f6fd1" stroke-width="2.600"/><path d="M697 102Q703 100 711 101" stroke="#fff" stroke-width="1.800" fill="none" opacity=".85" stroke-linecap="round"/>`;
  const HEAD = tied => `<g>${FACE}${tied ? HAIR_TIED + GOGGLES : HAIR_LOOSE}</g>`;

  // Природна рака и рачна дланка поврзана со телото
  const HAND = `<path d="M707 268C703 274 702 284 706 289C711 292 717 288 718 280L716 268Z" fill="url(#g-skin)"/><path d="M709 285Q713 288 716 282" stroke="#b97c58" stroke-width="1" fill="none" opacity=".6"/><path d="M704 276Q701 279 703 283" stroke="#e9c2a3" stroke-width="1.4" fill="none" opacity=".7"/>`;
  
  const TORSO_BAD = `<g>
    <path d="M710 204C708 226 706 248 705 268L718 270C719 248 720 226 724 204Z" fill="url(#g-skin)"/><path d="M707 222Q714 228 721 222" stroke="#b97c58" stroke-width="1.4" fill="none" opacity=".5"/>${HAND}
    <path d="M708 151Q698 158 697 172Q694 202 697 230Q698 248 697 262H741Q742 230 740 200Q741 172 737 160Q730 152 722 150Z" fill="url(#g-tee)"/>
    <path d="M708 151Q715 160 722 150" stroke="#1f7d72" stroke-width="2.600" fill="none"/>
    <path d="M700 212Q718 220 738 214M699 236Q718 244 738 238" stroke="#1f7d72" stroke-width="1.600" fill="none" opacity=".45"/><path d="M701 174Q700 208 702 238" stroke="#9af0e4" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
    <path d="M706 154C710 168 712 188 710 204L724 206C726 190 726 172 722 155Z" fill="url(#g-tee)"/><path d="M704 200Q714 206 724 202L725 210Q714 215 704 208Z" fill="#2a968a"/>
    </g>`;

  const SHORTS = `<path d="M697 254H741L743 314Q730 318 720 315L718 290L711 316Q702 319 694 314Z" fill="url(#g-den)"/><path d="M718 260V290M699 264H739" stroke="#2c4e72" stroke-width="1.400" opacity=".6"/><path d="M696 310Q705 314 712 312M722 312Q733 316 742 310" stroke="#aac8e2" stroke-width="1.200" fill="none" stroke-dasharray="2 2"/><path d="M700 268Q703 288 701 308" stroke="#fff" stroke-width="2" fill="none" opacity=".25" stroke-linecap="round"/>`;

  // Прецизни, елегантни и природни нозе со нормална дебелина
  const LEG_BARE = (dx, far) => `<path d="M${704 + dx} 312C${702 + dx} 345 ${703 + dx} 385 ${705 + dx} 420C${706 + dx} 440 ${707 + dx} 456 ${708 + dx} 472L${718 + dx} 472C${719 + dx} 456 ${720 + dx} 440 ${722 + dx} 420C${724 + dx} 385 ${723 + dx} 345 ${721 + dx} 312Z" fill="url(#${far ? "g-skin2" : "g-skin"})"/>${far ? "" : `<path d="M${715 + dx} 380Q${720 + dx} 400 ${716 + dx} 425" stroke="#9b6040" stroke-width="3" fill="none" opacity=".15" filter="url(#f-b2)"/><path d="M707 320Q706 360 708 450" stroke="#fff" stroke-width="1.5" fill="none" opacity=".25" stroke-linecap="round"/>`}`;
  
  // Правилно споени сандали и стапала (без раздвоени ефекти)
  const SANDAL = `<path d="M704 471L703 477H687Q684 477 685 474Q686 471 694 470L704 471Z" fill="url(#g-skin)"/><path d="M692 474H700" stroke="#7b4a1c" stroke-width="2.2" stroke-linecap="round"/><path d="M685 477H721Q724 477 724 479.5Q724 482 721 482H686Q683 482 683 479.5Q683 477 685 477Z" fill="#a8672a"/><rect x="685" y="477" width="36" height="1.2" fill="#e3a766" opacity=".7"/>`;
  
  const LEGS_BAD = `<g><ellipse cx="735" cy="300" rx="18" ry="150" fill="#2a1d10" opacity=".08" filter="url(#f-b4)"/>
    ${LEG_BARE(3, true)}
    ${LEG_BARE(-2, false)}${SANDAL}${SHORTS}</g>`;

  // Пантолони и затворени чевли со точни пропорции
  const TRS = (dx, far) => `<path d="M${702 + dx} 264C${701 + dx} 320 ${702 + dx} 390 ${704 + dx} 435C${705 + dx} 450 ${706 + dx} 462 ${707 + dx} 474L${719 + dx} 474C${720 + dx} 462 ${721 + dx} 450 ${722 + dx} 435C${724 + dx} 390 ${723 + dx} 320 ${721 + dx} 264Z" fill="url(#${far ? "g-trs2" : "g-trs"})"/>${far ? "" : `<path d="M${711 + dx} 380V462" stroke="#7b83a0" stroke-width="1.4" opacity=".4"/>`}`;
  
  const SHOE = `<path d="M686 481Q684 474 693 472L704 468L718 465Q722 469 721 481Z" fill="#23242b"/><path d="M687 477H721V482H685Q684 479 687 477Z" fill="#f2f2f0"/><path d="M694 470L700 472M698 468.5L704 470.5" stroke="#e9e9e9" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>`;
  
  const LEGS_GOOD = `<g><ellipse cx="735" cy="300" rx="18" ry="150" fill="#2a1d10" opacity=".08" filter="url(#f-b4)"/>${TRS(3, true)}<g opacity=".9"><path d="M701 480H734V483.5H700Z" fill="#c9c9c6"/></g>${TRS(-2, false)}${SHOE}</g>`;
  
  // Ракави со природна дебелина и рака на мантилот
  const COAT_SLEEVE = `<path d="M706 154C702 166 700 184 701 204L698 268L716 270L718 208C719 190 720 172 720 156Z" fill="url(#g-coat)"/><path d="M706 156C703 182 703 218 701 264" stroke="#fff" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/><path d="M712 182Q711 218 712 266" stroke="#aab4bd" stroke-width="1.4" fill="none" opacity=".5"/><path d="M698 264L716 267L716 273L698 270Z" fill="#e3e9ee"/>`;
  
  const TORSO_GOOD = `<g>
    <path d="M708 151C700 156 698 166 697 178Q695 218 696 258Q694 308 693 358Q718 365 746 358Q747 308 746 258Q747 218 743 184Q742 164 736 157Q728 150 722 150Z" fill="url(#g-coat)"/>
    <path d="M697 180Q695 218 696 258Q694 308 693 358" stroke="#ffffff" stroke-width="2.600" fill="none" opacity=".65"/><path d="M742 182Q745 228 745 268Q746 308 745 356" stroke="#9aa6b1" stroke-width="3" fill="none" opacity=".35" filter="url(#f-b1)"/>
    <path d="M715 182Q713 268 714 360" stroke="#cfd7de" stroke-width="1.600" fill="none"/><path d="M728 188Q726 258 728 358" stroke="#b9c3cc" stroke-width="1.800" fill="none" opacity=".5"/><path d="M702 298Q716 304 735 298M700 330Q717 337 738 330" stroke="#c3ccd4" stroke-width="1.500" fill="none" opacity=".7"/>
    <rect x="706" y="288" width="18" height="24" rx="2" fill="none" stroke="#c4ccd4" stroke-width="1.500"/><path d="M714 290V312" stroke="#d3dae0" stroke-width=".8"/>
    <circle cx="699" cy="212" r="2" fill="#a9b4be"/><circle cx="698" cy="250" r="2" fill="#a9b4be"/><circle cx="697" cy="288" r="2" fill="#a9b4be"/><circle cx="696" cy="326" r="2" fill="#a9b4be"/>
    <path d="M706 150L698 164L712 182L722 154Z" fill="#f7f9fb" stroke="#c4ccd4" stroke-width="1.200" stroke-linejoin="round"/><path d="M716 152Q724 158 731 154L734 166L720 178Z" fill="#e6ebf0"/><path d="M707 152Q712 162 718 154" fill="#3a78c9"/>
    </g>${COAT_SLEEVE}${HAND}`;

  // ---------- останати предмети и елементи ----------
  const H2SO4 = (x, rot) => bottle(x, 74, 30, 48, { c: "#6b3a1c", liq: "#a56a2a", label: "H₂SO₄", fs: 5.4, lc: "#9c1f18", stripe: "#d9422f", onShelf: 1, rot, level: .7 });
  const RAIL = `<rect x="424" y="114" width="3" height="8" fill="#7c8791"/><rect x="466" y="114" width="3" height="8" fill="#7c8791"/><rect x="424" y="114" width="45" height="2.6" rx="1.3" fill="url(#g-metal)"/>`;
  const warm = `<ellipse cx="150" cy="302" rx="86" ry="14" fill="#ff9a3a" opacity=".3" filter="url(#f-b3)"/>`;
  const VAPOR = `<path d="M204 258q-7 -9 0 -16t0 -14M214 256q-7 -9 0 -16t0 -14" stroke="#cfe6ee" stroke-width="2.600" fill="none" opacity=".5" stroke-linecap="round" filter="url(#f-b1)"/>`;
  const ETHANOL = open => bottle(192, 264, 32, 46, { c: "#e3eff3", liq: "#d4e9f0", label: "ЕТАНОЛ", fs: 5, lc: "#b3261e", stripe: "#d9422f", cap: "#c04f2f", open, level: .72 });

  const FOOD = `<g>${cast(300, 310, 36, .3)}
    <ellipse cx="292" cy="309" rx="34" ry="7.600" fill="#000" opacity=".3" filter="url(#f-b2)"/><ellipse cx="292" cy="307" rx="33" ry="7" fill="#f4f4f1"/><ellipse cx="292" cy="306.600" rx="26" ry="5" fill="#e4e4de"/><ellipse cx="292" cy="306" rx="33" ry="7" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
    <path d="M269 304Q268 297 276 297H308Q316 297 316 304Q316 307 312 307H273Q269 307 269 304Z" fill="#d6a85c"/><path d="M270 301H315" stroke="#a97a32" stroke-width="1" opacity=".5"/>
    <path d="M268 298Q276 293 284 297Q292 291 300 296Q308 292 317 298" stroke="#6fae4f" stroke-width="4.600" fill="none" stroke-linecap="round"/><path d="M270 294Q280 291 292 294Q304 290 315 294" stroke="#8cc86a" stroke-width="2" fill="none" opacity=".7"/>
    <ellipse cx="279" cy="295.500" rx="7" ry="2.300" fill="#d6453a"/><ellipse cx="296" cy="294.500" rx="7" ry="2.200" fill="#cf3c32"/><path d="M270 292H316L313 290H273Z" fill="#f0cf5a"/>
    <path d="M268 290Q268 279 291 279Q315 279 316 290Q316 293 312 293H272Q268 293 268 290Z" fill="url(#g-bread)"/><path d="M273 284Q290 279 308 284" stroke="#fff3c9" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
    <circle cx="330" cy="316" r="0" fill="none"/>
    <ellipse cx="328" cy="309" rx="13" ry="3" fill="#000" opacity=".35" filter="url(#f-b2)"/>
    <path d="M318 286H342L340 306Q340 309 336 309H324Q320 309 320 306Z" fill="url(#g-mug)"/><ellipse cx="330" cy="286" rx="12" ry="3.200" fill="#f1f1ee"/><ellipse cx="330" cy="286.600" rx="10.400" ry="2.500" fill="#5a3a1f"/><ellipse cx="327" cy="286" rx="4" ry="1" fill="#a97a4a" opacity=".6"/>
    <path d="M341 290Q349 290 349 297Q349 304 340 304" stroke="#e9e9e5" stroke-width="3.400" fill="none"/><path d="M341 290Q349 290 349 297" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/>
    <path d="M325 280q-4 -6 0 -11t0 -9M334 280q-4 -6 0 -11t0 -9" stroke="#fff" stroke-width="2.200" fill="none" opacity=".4" stroke-linecap="round" filter="url(#f-b1)"/>
    <circle cx="318" cy="311" r="1" fill="#d6a85c"/><circle cx="352" cy="312" r="1.100" fill="#d6a85c"/><circle cx="262" cy="311" r=".9" fill="#d6a85c"/></g>`;
  
  const FOOD_DEFS = `<defs>${lg("g-bread", 0, 0, 0, 1, [[0, "#e9c277"], [.6, "#d09a48"], [1, "#b97e30"]])}${lg("g-mug", 0, 0, 1, 0, [[0, "#c8cbcc"], [.3, "#ffffff"], [.7, "#f0f0ed"], [1, "#b2b6b8"]])}${lg("g-note", 0, 0, 1, 1, [[0, "#3c5fae"], [1, "#1f3875"]])}${lg("g-pen", 0, 0, 0, 1, [[0, "#ffe27a"], [.5, "#f2bf27"], [1, "#b88a10"]])}</defs>`;
  
  const NOTE = `<g>${FOOD_DEFS}${cast(296, 314, 30, .28)}<path d="M272 315L326 312L328 317L274 320Z" fill="#000" opacity=".3" filter="url(#f-b2)"/>
    <path d="M273 315L326 311.500L326.500 314.800L273.500 318.400Z" fill="#efeee6"/><path d="M273 316.200L326 312.700M273.300 317.300L326.300 313.800" stroke="#c9c7ba" stroke-width=".6"/>
    <path d="M270 306L320 302L327 311.500L273 315Z" fill="url(#g-note)"/><path d="M270 306L320 302" stroke="#8fa8e0" stroke-width="1" opacity=".7"/>
    <path d="M296 303.500L303 313" stroke="#142852" stroke-width="3.400" opacity=".6"/><rect x="283" y="308" width="20" height="3.600" rx=".8" fill="#e9e6d6" opacity=".8" transform="rotate(-4 293 310)"/>
    ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${272.400 + i * 1.100}" cy="${307.500 + i * 1.280}" rx="2.200" ry="1" fill="#c3c9d0" stroke="#7c8791" stroke-width=".5"/>`).join("")}
    <path d="M334 313L362 306" stroke="#000" stroke-width="3" opacity=".3" filter="url(#f-b1)" transform="translate(1 3)"/><path d="M334 311.500L359 305.200L362 306.200L336 314Z" fill="url(#g-pen)"/><path d="M334 311.800L359 305.500" stroke="#fff3b0" stroke-width=".8" opacity=".8"/><path d="M359 305.200L364 304L362 306.200Z" fill="#e6c79c"/><path d="M362.800 304.300L364 304L363.200 305.300Z" fill="#2b2b2b"/><path d="M334 311.500L330 312.800L331.600 315.200L336 314Z" fill="#e48aa0"/></g>`;

  const SPILL = `<g>${cast(400, 318, 34, .25)}
    <ellipse cx="440" cy="313" rx="34" ry="6" fill="#2f5a1a" opacity=".35" filter="url(#f-b2)"/>
    <defs>${lg("g-grn", 0, 0, 0, 1, [[0, "#b7ee8b", .9], [1, "#6fbf45", .95]])}</defs>
    <path d="M417 314Q420 308 440 308Q462 308 470 314Q468 319 450 319Q426 320 417 314Z" fill="url(#g-grn)"/><path d="M426 312Q440 309 458 312" stroke="#f1ffe2" stroke-width="1.600" fill="none" opacity=".8" stroke-linecap="round"/>
    <path d="M440 292Q444 302 441 310" stroke="url(#g-grn)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M439 294Q442 302 440 309" stroke="#e6ffd0" stroke-width="1" fill="none" opacity=".8"/>
    <path d="M463 317Q466 324 464 332Q462 340 465 348" stroke="#79c84d" stroke-width="5.600" fill="none" stroke-linecap="round" opacity=".92"/><path d="M462 320Q464 328 463 336" stroke="#d8ffbd" stroke-width="1.400" fill="none" opacity=".8" stroke-linecap="round"/><ellipse cx="465" cy="350" rx="3.600" ry="4.600" fill="#79c84d"/><ellipse cx="464" cy="349" rx="1" ry="1.600" fill="#e9ffd6"/></g>`;
  
  const UNLABELED = `${SPILL}${bottle(380, 256, 30, 46, { c: "#8a5a2b", liq: "#b27a3c", open: true, rot: 75, level: .35 })}`;

  const HEATER = (good) => `<g>${cast(496, 310, 46, .3)}${contact(496, 310, 50, .5)}
    <defs>${lg("g-hbody", 0, 0, 0, 1, [[0, "#555d66"], [.2, "#363c43"], [1, "#171a1e"]])}${lg("g-hplate", 0, 0, 1, 0, [[0, "#6c7681"], [.3, "#c4ccd3"], [.6, "#8a949e"], [1, "#4c555e"]])}${rg("g-led", .5, .5, .5, [[0, good ? "#ff8a7a" : "#9dffa8"], [1, good ? "#d62d20" : "#1fb34a"]])}</defs>
    <ellipse cx="496" cy="290.400" rx="46" ry="4.200" fill="url(#g-hplate)"/><ellipse cx="496" cy="289.800" rx="40" ry="3" fill="#5b646d" opacity=".5"/>
    <rect x="450" y="290" width="92" height="19" rx="4" fill="url(#g-hbody)"/><rect x="451" y="290.600" width="90" height="1.800" rx=".9" fill="#fff" opacity=".28"/><rect x="450" y="305" width="92" height="4" rx="2" fill="#000" opacity=".35"/>
    <path d="M488 298h22M488 301h22M488 304h22" stroke="#000" stroke-width="1" opacity=".5"/>
    <circle cx="468" cy="299" r="5.200" fill="#1b1e22"/><circle cx="468" cy="299" r="4.200" fill="#d6892e"/><path d="M468 295.400v3.600" stroke="#fff" stroke-width="1.200"/><circle cx="467" cy="297.500" r="1.200" fill="#fff" opacity=".6"/>
    <circle cx="524" cy="299" r="3.200" fill="url(#g-led)"/><circle cx="524" cy="299" r="7" fill="${good ? "#d62d20" : "#32d062"}" opacity=".25" filter="url(#f-b1)"/></g>`;
  
  const CABLE_BAD = `<g>
    <path d="M542 300C568 304 572 320 562 342C554 362 550 380 553 415" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(6 4)"/>
    <path d="M542 300C568 304 572 320 562 342C554 362 550 380 553 415" stroke="#14171b" stroke-width="3.800" fill="none" stroke-linecap="round"/><path d="M542 299C567 303 571 319 561 341C553 361 549 379 552 414" stroke="#6b7480" stroke-width="1" fill="none" opacity=".6" stroke-linecap="round"/>
    <defs>${lg("g-pud", 0, 0, 0, 1, [[0, "#d9f0fb", .8], [1, "#8cc4e4", .85]])}</defs>
    <ellipse cx="553" cy="422" rx="42" ry="9.400" fill="#1a2a35" opacity=".22" filter="url(#f-b2)"/><ellipse cx="553" cy="420" rx="40" ry="8.600" fill="url(#g-pud)"/><ellipse cx="553" cy="420" rx="40" ry="8.600" fill="none" stroke="#fff" stroke-width="1.400" opacity=".7"/>
    <path d="M526 418Q540 414 552 417" stroke="#fff" stroke-width="2.200" fill="none" opacity=".85" stroke-linecap="round"/><path d="M566 423Q576 422 582 419" stroke="#fff" stroke-width="1.400" fill="none" opacity=".6" stroke-linecap="round"/><ellipse cx="553" cy="417" rx="9" ry="2.200" fill="none" stroke="#fff" stroke-width=".9" opacity=".7"/>
    <path d="M556 406l-4 7h5l-4 8" stroke="#fff6a8" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round" filter="url(#f-b1)"/><path d="M556 406l-4 7h5l-4 8" stroke="#ffe44d" stroke-width="1" fill="none" stroke-linejoin="round" stroke-linecap="round"/></g>`;
  
  const CABLE_GOOD = `<g><path d="M581 284C579 294 562 299 542 300" stroke="#000" stroke-width="4.600" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(2 4)"/><path d="M581 284C579 294 562 299 542 300" stroke="#14171b" stroke-width="3.600" fill="none" stroke-linecap="round"/><path d="M581 283C579 293 562 298 542 299" stroke="#6b7480" stroke-width=".9" fill="none" opacity=".6"/>
    <rect x="572" y="265" width="20" height="19" rx="3.600" fill="#000" opacity=".3" filter="url(#f-b1)" transform="translate(1.500 2.500)"/><rect x="572" y="265" width="20" height="19" rx="3.600" fill="#e9e7e1" stroke="#b3ae9c" stroke-width="1"/><rect x="574" y="267" width="16" height="4" rx="2" fill="#fff" opacity=".7"/><rect x="577" y="279" width="8" height="7" rx="1.600" fill="#d9d6cc"/></g>`;

  const BAG = `<g>${contact(206, 490, 62, .5)}
    <defs>${lg("g-bag", 0, 0, 1, 1, [[0, "#ea5646"], [.5, "#c63a2d"], [1, "#8f2218"]])}${lg("g-bag2", 0, 0, 0, 1, [[0, "#b3281d"], [1, "#7c1a12"]])}</defs>
    <path d="M168 470Q140 474 132 494Q150 500 170 488" stroke="#000" stroke-width="10" fill="none" opacity=".25" filter="url(#f-b2)" transform="translate(0 4)"/><path d="M168 470Q140 474 132 494Q150 500 170 488" stroke="#7c1a12" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M167 468Q140 472 133 491" stroke="#d8604f" stroke-width="1.600" fill="none" opacity=".6" stroke-linecap="round"/><rect x="128" y="488" width="8" height="5" rx="1.500" fill="#2a2a2a" transform="rotate(-20 132 490)"/>
    <path d="M244 470Q268 478 274 496Q256 500 242 488" stroke="#7c1a12" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M244 468Q266 476 272 492" stroke="#d8604f" stroke-width="1.600" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M184 446Q205 420 228 446" stroke="#4a100b" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M185 446Q205 424 227 446" stroke="#b9382b" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>
    <rect x="160" y="440" width="92" height="50" rx="17" fill="url(#g-bag)"/><rect x="160" y="440" width="92" height="50" rx="17" filter="url(#f-fabric)" opacity=".45"/><rect x="164" y="442" width="84" height="9" rx="4.500" fill="#fff" opacity=".22"/><rect x="160" y="478" width="92" height="12" rx="6" fill="#000" opacity=".22"/>
    <rect x="173" y="460" width="66" height="27" rx="9" fill="url(#g-bag2)"/><rect x="173" y="460" width="66" height="27" rx="9" filter="url(#f-fabric)" opacity=".4"/><path d="M178 462H234" stroke="#e7dfc9" stroke-width="2" stroke-dasharray="3 2.200"/><rect x="203" y="458" width="10" height="5" rx="1.500" fill="url(#g-metal)"/><circle cx="208" cy="476" r="3.400" fill="#e9dcb4" stroke="#8a7b4e" stroke-width=".8"/>
    <path d="M166 454Q170 448 178 446" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/></g>`;
  
  const SHARD = (pts, k) => { const p = pts.map(q => q.join(",")).join(" "); return `<polygon points="${pts.map(q => (q[0] + 3) + "," + (q[1] + 3)).join(" ")}" fill="#1a2a35" opacity=".28" filter="url(#f-b1)"/><polygon points="${p}" fill="url(#g-shard)" stroke="#fff" stroke-width=".9" stroke-opacity=".85"/><path d="M${pts[0][0]} ${pts[0][1]}L${pts[1][0]} ${pts[1][1]}" stroke="#fff" stroke-width="1.600" opacity="...`; }; // крај на стаклата
  
  const GLASS = `<g><defs>${lg("g-shard", 0, 0, 1, 1, [[0, "#f6fcff", .85], [.5, "#cfe7f2", .55], [1, "#9cc4d8", .7]])}</defs>
    ${[[[303,486],[309,474],[321,467],[333,481],[324,489]], [[336,481],[343,468],[351,459],[364,477],[352,484]], [[366,487],[372,476],[380,471],[391,484],[381,490]], [[319,490],[327,484],[336,486],[331,492]], [[393,484],[399,476],[407,480],[404,488]], [[345,490],[352,485],[359,488],[353,493]], [[285,491],[292,485],[298,489],[291,494]], [[408,492],[414,488],[417,493]]].map(SHARD).join("")}
    <path d="M338 470l4 -9M352 470l6 -4" stroke="#fff" stroke-width="1.600" stroke-linecap="round" opacity=".9"/><path d="M320 470l0 -6M317 467h6" stroke="#fff" stroke-width="1.200" opacity=".9"/><path d="M381 474l0 -5M378.500 471.500h5" stroke="#fff" stroke-width="1.100" opacity=".9"/>
    <path d="M308 492Q340 500 378 494" stroke="#bcd8e6" stroke-width="2.200" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  
  const BOXES = `<g>${contact(78, 310, 60, .5)}<ellipse cx="78" cy="270" rx="52" ry="48" fill="#000" opacity=".18" filter="url(#f-b4)" transform="translate(16 6)"/>
    ${box(32, 256, 82, 54, { d: 14, label: "КРХКО" })}${box(40, 212, 68, 44, { d: 12, rot: -2 })}${box(50, 174, 56, 38, { d: 10, rot: 5, label: "КРХКО" })}</g>`;

  const TXT = {
    "polica": { "name": "Тешко шише на работ од полицата", "why": "Тешко шише со киселина е на самиот раб од полицата и може да падне, да се скрши и да се излее.", "fix": "Тешките и опасни шишиња се чуваат ниско и позади, на полица со раб што ги задржува.", "ok": "Шишето е сигурно позади на полицата, зад заштитен раб." },
    "aparat": { "name": "Блокиран апарат за гаснење", "why": "Апаратот за гаснење е закопан зад кутии. Во итна ситуација нема време за поместување.", "fix": "Патот до апаратот, тушот за итни случаи и излезот мора секогаш да се слободни.", "ok": "Апаратот за гаснење е на видливо место и пристапот е слободен." },
    "etanol": { "name": "Отворен етанол покрај пламен", "why": "Шишето со лесно запалив етанол е отворено веднаш до запалена горелка. Пареите можат да се запалат.", "fix": "Запаливите течности се држат затворени и далеку од пламен. Горелката се пали само кога е потребна.", "ok": "Горелката е изгасната, а шишето со етанол е затворено." },
    "hrana": { "name": "Храна и пијалок во лабораторија", "why": "Сендвич и чаша на работната маса. Храната може да се загади со хемикалии.", "fix": "Во лабораторија не се јаде, не се пие и не се чуваат прибор за јадење или храна.", "ok": "На масата има само тетратка и молив." },
    "bezetiketa": { "name": "Шише без етикета и истурена течност", "why": "Шишето нема етикета, а од него се излева течност. Не се знае што е.", "fix": "Секое шише има етикета (име, концентрација, ознака за опасност), а излеаното се чисти веднаш по упатство.", "ok": "Шишето е затворено и означено." },
    "kabel": { "name": "Кабел во локва вода", "why": "Кабел од грејач виси надолу и допира локва вода. Има опасност од струен удар и кратко спојување.", "fix": "Каблите се водат кон ѕидот, подалеку од вода, а излеаното се брише веднаш.", "ok": "Кабелот е кусо и уредно поврзан со штекер, подалеку од вода." },
    "rabot": { "name": "Стаклен сад на работ на масата", "why": "Чашата е на самиот раб од масата и лесно може да падне и да се скрши.", "fix": "Садовите се ставаат на средина од масата, подалеку од работ.", "ok": "Чашата стои сигурно на маса, подалеку од работ." },
    "torba": { "name": "Торба на подот во премин", "why": "Раниче на подот пред масата. Некој може да се сапне и да падне со хемикалии во рака.", "fix": "Торбите и јакните се оставаат на определено место, подалеку од работните површини и преминот.", "ok": "" },
    "staklo": { "name": "Скршено стакло на подот", "why": "На подот има парчиња скршено стакло, а можат да нанесат посекотини.", "fix": "Стаклото не се собира со раце: се користи лопатка и четка, а се фрла во посебен сад за стаклен отпад.", "ok": "" },
    "ocila": { "name": "Без заштитни очила и распуштена коса", "why": "Нема заштитни очила, а долгата коса е распуштена: може да влезе во пламен или во садови.", "fix": "Заштитните очила се носат цело време во лабораторија, а долгата коса се врзува.", "ok": "Носи заштитни очила, а косата е врзана." },
    "mantil": { "name": "Без мантил, голи раце", "why": "Облечена е во кратка маица, без мантил. Прскање на хемикалија удира директно на кожата.", "fix": "Се носи долг, затворен мантил од памук со долги ракави.", "ok": "Носи долг, затворен мантил." },
    "chevli": { "name": "Отворени сандали и шорцеви", "why": "Носи шорцеви и отворени сандали. Хемикалија или стакло што ќе падне на нога го повредува директно.", "fix": "Во лабораторија се носат затворени чевли и долги панталони.", "ok": "Носи затворени чевли и долги панталони." }
  };
  const T = id => TXT[id];
  const H = [
    { id: "polica", ...T("polica"), hot: [478, 62, 72, 66], hotGood: [418, 64, 60, 62], bad: H2SO4(514, 12), good: H2SO4(428, 0) + RAIL },
    { id: "aparat", ...T("aparat"), hot: [24, 154, 96, 156], hotGood: [24, 154, 86, 150], bad: BOXES, good: "" },
    { id: "etanol", ...T("etanol"), hot: [96, 200, 150, 112], hotGood: [96, 212, 150, 100], bad: warm + FLAME(150, 262) + ETHANOL(true) + VAPOR + `<ellipse cx="238" cy="309" rx="8" ry="2.600" fill="#c04f2f"/><ellipse cx="238" cy="307.600" rx="8" ry="2.600" fill="#e0643f"/>`, good: ETHANOL(false) },
    { id: "hrana", ...T("hrana"), hot: [258, 264, 98, 52], hotGood: [262, 268, 104, 54], bad: FOOD, good: NOTE },
    { id: "bezetiketa", ...T("bezetiketa"), hot: [372, 264, 108, 92], hotGood: [372, 258, 50, 56], bad: UNLABELED, good: bottle(380, 264, 30, 46, { c: "#a9c3cf", liq: "#ead9a0", label: "HCl 1M", fs: 5.4, cap: "#1b1b1b", level: .55 }) },
    { id: "kabel", ...T("kabel"), hot: [532, 300, 84, 130], hotGood: [440, 264, 150, 48], bad: HEATER(false) + CABLE_BAD, good: HEATER(true) + CABLE_GOOD },
    { id: "rabot", ...T("rabot"), hot: [626, 272, 48, 52], hotGood: [598, 268, 44, 44], bad: beaker(634, 280, 30, 36, { rot: 9 }), good: beaker(604, 272, 30, 36) },
    { id: "torba", ...T("torba"), hot: [124, 420, 160, 78], hotGood: null, bad: BAG, good: null },
    { id: "staklo", ...T("staklo"), hot: [282, 456, 130, 44], hotGood: null, bad: GLASS, good: null },
    { id: "ocila", ...T("ocila"), hot: [690, 74, 76, 112], hotGood: [690, 74, 76, 112], fig: true, bad: HEAD(false), good: HEAD(true) },
    { id: "mantil", ...T("mantil"), hot: [690, 150, 62, 110], hotGood: [690, 148, 62, 214], fig: true, bad: TORSO_BAD, good: TORSO_GOOD },
    { id: "chevli", ...T("chevli"), hot: [686, 258, 62, 186], hotGood: [686, 360, 62, 84], fig: true, bad: LEGS_BAD, good: LEGS_GOOD },
  ];
  
  const SAFE = [
    { name: "Прва помош", hot: [554, 190, 66, 52], ok: "Кутијата за прва помош е на видливо и достапно место: ова е во ред." },
    { name: "Затворени шишиња на полица", hot: [270, 100, 134, 58], ok: "Затворени и означени шишиња на полица со раб: ова е во ред." },
    { name: "Прозорец", hot: [88, 26, 180, 160], ok: "Прозорецот обезбедува светлина и проветрување: ова е во ред." },
    { name: "Периоден систем", hot: [330, 172, 128, 54], ok: "Постерот со периодниот систем е на ѕидот за брза проверка: ова е во ред." },
  ];

  const N_BAD = 8;

  let active = [], found = new Set(), wrong = 0, hints = 0, over = false, streak = 0;
  const defs = DEFS + HEAD_DEFS + FOOD_DEFS;

  function draw() {
    const bad = new Set(active.map(h => h.id));
    let items = "";
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
