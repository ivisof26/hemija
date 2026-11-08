// Игра „Лабораториска безбедност“: најди ги опасните грешки на сликата
(function () {
  const svg = document.getElementById("sf-svg");
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

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
    ${lg("g-top", 0, 0, 0, 1, [[0, "#6b757e"], [.5, "#454d55"], [1, "#2a3036"]])}
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
    <clipPath id="c-top"><path d="M34 250H658L664 302H28Z"/></clipPath>
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

  // ---------- СТАНДАРДНА ВИСИНА НА МАСАТА (Y: 268) ----------
  const BASE = `
    <rect width="800" height="500" fill="url(#g-wall)"/>
    <rect width="800" height="392" filter="url(#f-plaster)" opacity=".4"/>
    <rect width="800" height="392" fill="url(#g-wlight)"/>
    <!-- плочки (задниот ѕид) -->
    <g><rect x="0" y="156" width="800" height="236" fill="url(#p-tile)"/><rect x="0" y="156" width="800" height="236" fill="url(#g-tileshade)"/>
      <rect x="0" y="154" width="800" height="6" fill="#aeb8bf"/><rect x="0" y="154" width="800" height="1.6" fill="#fff" opacity=".8"/><rect x="0" y="160" width="800" height="5" fill="#000" opacity=".16" filter="url(#f-b2)"/></g>
    <rect y="380" width="800" height="12" fill="#6f7a82"/><rect y="380" width="800" height="2" fill="#a7b2b9"/>
    <!-- прозорец -->
    <g filter="url(#f-b1)"><rect x="84" y="126" width="184" height="16" rx="3" fill="#000" opacity=".16"/></g>
    <rect x="92" y="2" width="168" height="138" rx="4" fill="url(#g-frame)"/>
    <rect x="101" y="11" width="150" height="120" fill="url(#g-sky)"/>
    <g filter="url(#f-bbg)" clip-path="inset(0)"><g>
      <path d="M101 102 q20 -22 40 -8 q16 -22 40 -4 q22 -14 40 4 q16 -8 30 0 V131 H101Z" fill="#6f9a62" opacity=".85"/><path d="M101 118 q30 -14 62 -2 q40 -14 88 2 V131 H101Z" fill="#4f7a49" opacity=".9"/>
      <ellipse cx="132" cy="38" rx="26" ry="9" fill="#fff" opacity=".8"/><ellipse cx="150" cy="32" rx="18" ry="8" fill="#fff" opacity=".8"/><ellipse cx="220" cy="66" rx="22" ry="7" fill="#fff" opacity=".7"/></g></g>
    <path d="M101 11H251L101 131Z" fill="#fff" opacity=".1"/>
    <rect x="174" y="11" width="4" height="120" fill="url(#g-frame)"/><rect x="101" y="74" width="150" height="4" fill="url(#g-frame)"/>
    <rect x="101" y="11" width="150" height="120" fill="none" stroke="#9b978c" stroke-width="1.2" opacity=".6"/>
    <rect x="86" y="120" width="180" height="9" rx="2" fill="url(#g-frame)"/><rect x="86" y="120" width="180" height="1.6" fill="#fff"/>
    <!-- сноп светлина од прозорецот -->
    <path d="M100 128L260 128L412 392L226 392Z" fill="#fff6dc" opacity=".11" filter="url(#f-b3)"/>
    <path d="M118 128L240 128L340 392L206 392Z" fill="#fff6dc" opacity=".08" filter="url(#f-b2)"/>
    <!-- постер: периоден систем -->
    <g><rect x="334" y="127" width="128" height="54" fill="#000" opacity=".22" filter="url(#f-b2)" transform="translate(3 4)"/>
      <rect x="330" y="122" width="128" height="54" rx="1.5" fill="#fbfaf6"/><rect x="330" y="122" width="128" height="54" rx="1.5" fill="none" stroke="#b8b09c" stroke-width="1.4"/>
      <rect x="334" y="124" width="120" height="6" fill="#2d4a8a" opacity=".85"/>
      ${Array.from({ length: 5 * 14 }, (_, i) => { const r = Math.floor(i / 14), c = i % 14; if (r < 2 && c > 0 && c < 12) return ""; const hues = ["#e9a456", "#7fb8de", "#97cc8d", "#e6cf4f", "#c58ed0"]; return `<rect x="${335 + c * 8.4}" y="${132 + r * 8.2}" width="7.4" height="7" rx=".8" fill="${hues[(c + r) % 5]}" opacity=".9"/>`; }).join("")}
      <path d="M330 122H458V176H330Z" fill="url(#g-topsheen)" opacity=".7"/></g>
    <!-- полица -->
    <g><rect x="270" y="116" width="262" height="14" fill="#000" opacity=".26" filter="url(#f-b3)" transform="translate(4 6)"/>
      <path d="M286 113v22M510 113v22" stroke="#59636c" stroke-width="5"/><path d="M286 135h-10M510 135h-10" stroke="#59636c" stroke-width="4"/>
      <rect x="262" y="104" width="268" height="9" rx="1.5" fill="url(#g-wood)"/><rect x="262" y="104" width="268" height="9" rx="1.5" filter="url(#f-wood)" opacity=".6"/><rect x="262" y="104" width="268" height="1.8" fill="#f1d9b2" opacity=".85"/><rect x="262" y="111.4" width="268" height="1.6" fill="#4d3114" opacity=".5"/></g>
    <!-- штекер -->
    <g><rect x="572" y="248" width="18" height="18" rx="3" fill="#000" opacity=".22" filter="url(#f-b1)" transform="translate(1.5 2)"/><rect x="572" y="248" width="18" height="18" rx="3" fill="#f4f2ec" stroke="#bdb8a8" stroke-width="1"/><circle cx="578" cy="257" r="1.7" fill="#3a3a3a"/><circle cx="584" cy="257" r="1.7" fill="#3a3a3a"/></g>
    <!-- прва помош -->
    <g><rect x="563" y="151" width="54" height="40" rx="5" fill="#000" opacity=".28" filter="url(#f-b2)" transform="translate(3 5)"/>
      <rect x="560" y="146" width="54" height="40" rx="5" fill="#f7f8f6"/><rect x="560" y="146" width="54" height="40" rx="5" fill="none" stroke="#c3cbc6" stroke-width="1.4"/>
      <rect x="560" y="146" width="54" height="9" rx="5" fill="#fff" opacity=".7"/><path d="M587 155v22M576 166h22" stroke="#1f9a56" stroke-width="7" stroke-linecap="round"/><path d="M587 155v22" stroke="#46c27f" stroke-width="2" opacity=".6"/>
      <rect x="581" y="181" width="12" height="3.4" rx="1.7" fill="#aab3ad"/></g>
    <!-- апарат за гаснење -->
    <g><rect x="40" y="136" width="34" height="34" rx="3" fill="#000" opacity=".25" filter="url(#f-b2)" transform="translate(3 4)"/><g transform="translate(38 132) scale(.36)"><rect width="100" height="100" rx="5" fill="#a61f1d"/><rect x="2.5" y="2.5" width="95" height="95" rx="4" fill="none" stroke="#fff" stroke-width="3"/>
      <path d="M20 46Q20 38 30 35H42Q52 38 52 46V90H20Z" fill="#fff"/><rect x="28" y="22" width="16" height="12" fill="#fff"/><path d="M16 42V30Q16 24 24 20L32 12H48V20H36L26 28V42Z" fill="#fff"/><rect x="26" y="54" width="20" height="14" fill="#a61f1d"/>
      <path d="M60 48Q74 50 80 36Q82 50 92 54V66Q72 66 60 48Z" fill="#fff"/><path d="M60 70Q74 70 84 58Q86 70 92 74V84Q72 84 60 70Z" fill="#fff"/><path d="M62 88Q72 84 80 78Q82 86 92 88V92H62Z" fill="#fff"/></g></g>
    <g><rect x="48" y="191" width="22" height="76" rx="9" fill="#000" opacity=".3" filter="url(#f-b2)" transform="translate(5 3)"/>
      <rect x="47" y="190" width="22" height="76" rx="9" fill="url(#g-red)"/><rect x="47" y="190" width="22" height="22" rx="9" fill="#000" opacity=".12"/><rect x="51" y="196" width="3" height="62" rx="1.5" fill="#fff" opacity=".42"/>
      <rect x="53" y="179" width="10" height="14" rx="2" fill="url(#g-metal)"/><path d="M49 179h18" stroke="#2c3238" stroke-width="4" stroke-linecap="round"/><path d="M65 183q16 0 18 16t-5 17" stroke="#16191c" stroke-width="3.4" fill="none"/>
      <circle cx="58" cy="209" r="5.4" fill="#f3f3ee" stroke="#8b8f92" stroke-width="1.2"/><path d="M58 209l2.6 -2.6" stroke="#c4291b" stroke-width="1.2"/>
      <rect x="50" y="228" width="16" height="16" rx="1.5" fill="#f8f6ee"/><path d="M58 231c-3 3 -2 6 0 9c3 -3 3 -6 0 -9z" fill="#c4291b"/>
      <rect x="45" y="218" width="26" height="6" rx="2" fill="#2c3238"/></g>
    <!-- маса: фиоки и врати -->
    <rect x="26" y="302" width="640" height="82" fill="url(#g-door)"/>
    <rect x="26" y="302" width="640" height="82" fill="url(#g-cabsh)"/>
    ${[38, 238, 438].map((x, i) => `<g><rect x="${x}" y="312" width="${i === 2 ? 204 : 190}" height="64" rx="2.5" fill="url(#g-door)" stroke="#7c8893" stroke-width="1.6"/><rect x="${x + 1}" y="313" width="${(i === 2 ? 204 : 190) - 2}" height="1.6" fill="#fff" opacity=".6"/><rect x="${x + (i === 2 ? 86 : 80)}" y="319" width="34" height="5" rx="2.5" fill="url(#g-metal)"/><rect x="${x + (i === 2 ? 86 : 80)}" y="324" width="34" height="2" rx="1" fill="#000" opacity=".25"/></g>`).join("")}
    <rect x="26" y="384" width="640" height="8" fill="#2c3238"/><rect x="26" y="384" width="640" height="1.6" fill="#59636c"/>
    <rect x="22" y="390" width="652" height="16" fill="#000" opacity=".34" filter="url(#f-b3)"/>
    <!-- маса: плоча -->
    <path d="M34 250H658L664 302H28Z" fill="url(#g-top)"/>
    <path d="M34 250H658L664 302H28Z" fill="url(#g-topsheen)"/>
    <path d="M34 250H658L664 302H28Z" filter="url(#f-grain)" opacity=".22"/>
    <path d="M28 302H664V307H28Z" fill="url(#g-edge)"/><path d="M28 302H664" stroke="#fff" stroke-width="1.4" opacity=".85"/><path d="M28 307H664" stroke="#000" stroke-width="1" opacity=".3"/>
    <path d="M34 250H658" stroke="#7c8791" stroke-width="1.4" opacity=".6"/>
    <!-- под -->
    <rect y="392" width="800" height="108" fill="url(#g-floor)"/>
    <rect y="392" width="800" height="108" fill="url(#g-flight)"/>
    <g stroke="#8f8878" stroke-width="1.4" opacity=".75" fill="none">
      <path d="M0 408H800M0 428H800M0 454H800M0 484H800"/>
      ${[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(k => `<path d="M${400 + k * 44} 392L${400 + k * 150} 500"/>`).join("")}</g>
    <g stroke="#fff" stroke-width="1" opacity=".35" fill="none"><path d="M0 409.5H800M0 429.5H800M0 455.5H800M0 485.5H800"/></g>
    <rect y="392" width="800" height="18" fill="url(#g-cabsh)" opacity=".7"/>`;

  const FX = `<rect width="800" height="500" fill="url(#g-vig)" pointer-events="none"/><rect width="800" height="500" filter="url(#f-grain)" opacity=".16" pointer-events="none"/>`;

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
    ${cast(150, 290, 20, .32)}${contact(150, 290, 24, .55)}
    ${cast(244, 262, 16, .3)}${contact(244, 262, 14, .55)}
    <path d="M160 289C188 298 214 292 224 270C228 254 226 238 237 231" stroke="#0a120d" stroke-width="7" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(0 4)"/>
    <path d="M160 287C188 296 214 290 224 268C228 252 226 236 237 229" stroke="url(#g-hose)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M160 285C188 294 214 288 224 266C228 250 226 234 237 227" stroke="#9ec0ab" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>
    <defs>${lg("g-gas", 0, 0, 1, 0, [[0, "#3c5d78"], [.35, "#7fb0d4"], [.6, "#4f7fa3"], [1, "#2b455b"]])}</defs>
    <rect x="233" y="232" width="22" height="30" rx="5" fill="url(#g-gas)"/><rect x="233" y="244" width="22" height="9" fill="#f3f3ee" opacity=".9"/><path d="M233 244h22M233 253h22" stroke="#2b455b" stroke-width=".7" opacity=".6"/><rect x="236" y="236" width="3" height="22" rx="1.5" fill="#fff" opacity=".35"/>
    <rect x="238.4" y="225" width="13" height="8" rx="2" fill="url(#g-brass)"/><rect x="241" y="220" width="8" height="6" rx="1.6" fill="#c4291b"/><rect x="234" y="226.6" width="6" height="4" rx="1.4" fill="url(#g-brass)"/>
    <ellipse cx="150" cy="288" rx="22" ry="5.4" fill="url(#g-metal)"/><ellipse cx="150" cy="286" rx="20" ry="4.6" fill="#8a96a1"/><ellipse cx="150" cy="284.4" rx="12" ry="3" fill="#cdd5dc"/>
    <rect x="145" y="246" width="10" height="40" rx="1.6" fill="url(#g-metal)"/><rect x="142" y="266" width="16" height="9" rx="1.6" fill="url(#g-brass)"/><path d="M142 270h16" stroke="#000" stroke-width=".8" opacity=".35"/>
    <ellipse cx="150" cy="246" rx="5.4" ry="1.7" fill="#2a2f35"/><ellipse cx="150" cy="245.6" rx="4" ry="1.1" fill="#0b0e11"/>
    ${refl(`<rect x="145" y="246" width="10" height="40" fill="#aab4bd"/><rect x="142" y="266" width="16" height="9" fill="#b48a30"/>`, 288, .28)}`;

  const SHELF = bottle(282, 64, 26, 46, { c: "#3a8f58", label: "NaCl", fs: 6, onShelf: 1, level: .5 }) + bottle(327, 71, 24, 39, { c: "#c98428", label: "KI", fs: 6, onShelf: 1, level: .5 }) + bottle(367, 63, 26, 47, { c: "#4d73b8", label: "H₂O", fs: 6, onShelf: 1, level: .55 });

  const box = (x, y, w, h, o = {}) => { const d = o.d || 12, id = nid("bx"); return `<g${o.rot ? ` transform="rotate(${o.rot} ${x + w / 2} ${y + h})"` : ""}>
    <defs>${lg(id + "f", 0, 0, 1, 0, [[0, "#d2aa72"], [.6, "#c39a62"], [1, "#a97f48"]])}</defs>
    <path d="M${x + w} ${y}L${x + w + d * .55} ${y - d * .6}V${y + h - d * .6}L${x + w} ${y + h}Z" fill="#8a6338"/>
    <path d="M${x} ${y}L${x + d * .55} ${y - d * .6}H${x + w + d * .55}L${x + w} ${y}Z" fill="#e0bf8a"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}f)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#f-card)" opacity=".5"/>
    <rect x="${x + w / 2 - 6}" y="${y}" width="12" height="${h}" fill="#e6d2a2" opacity=".78"/><rect x="${x + w / 2 - 6}" y="${y}" width="2" height="${h}" fill="#fff" opacity=".35"/>
    <path d="M${x + w / 2 - 6} ${y - d * .6 + 1}L${x + w / 2 - 6 + d * .55} ${y - d * .6 + 1}" stroke="#e6d2a2" stroke-width="1"/>
    <rect x="${x}" y="${y}" width="${w}" height="3" fill="#fff" opacity=".22"/><rect x="${x}" y="${y + h - 4}" width="${w}" height="4" fill="#000" opacity=".2"/>
    ${o.label ? `<rect x="${x + 6}" y="${y + h - 22}" width="${w * .38}" height="14" rx="1" fill="#f6f2e6"/><text x="${x + 6 + w * .19}" y="${y + h - 12.4}" text-anchor="middle" font-size="6.4" font-weight="700" font-family="Arial,sans-serif" fill="#7a2a1c">${o.label}</text>` : ""}</g>`; };

  const SKIN = () => `${lg("g-skin", 0, 0, 1, 0, [[0, "#f5d2b4"], [.55, "#e8b995"], [1, "#c98d68"]])}${lg("g-skin2", 0, 0, 1, 0, [[0, "#e6ba98"], [1, "#b97c58"]])}`;
  const HEAD_DEFS = `<defs>${SKIN()}${lg("g-hair", 0, 0, 1, 0, [[0, "#8a5c33"], [.5, "#6a4223"], [1, "#3b2210"]])}${lg("g-coat", 0, 0, 1, 0, [[0, "#ffffff"], [.55, "#eef2f5"], [1, "#c3ccd4"]])}${lg("g-coat2", 0, 0, 1, 0, [[0, "#f4f7f9"], [1, "#b7c1ca"]])}${lg("g-tee", 0, 0, 1, 0, [[0, "#5ed1c1"], [.55, "#35a799"], [1, "#1f7d72"]])}${lg("g-den", 0, 0, 1, 0, [[0, "#7ea6cb"], [.55, "#557fa8"], [1, "#35597e"]])}${lg("g-trs", 0, 0, 1, 0, [[0, "#5d647c"], [.5, "#444a60"], [1, "#2a2e3f"]])}${lg("g-trs2", 0, 0, 1, 0, [[0, "#3b4054"], [1, "#1f2230"]])}</defs>`;
  
  // ======================================================================
  //  УЧЕНИЧКА (поглед однапред): центар x=730, глава Y 104–172, нозе до Y 495
  // ======================================================================
  const MIR = g => `<g transform="translate(1460 0) scale(-1 1)">${g}</g>`;
  const FIG_DEFS = `<defs>${rg("g-skinR", .5, .38, .75, [[0, "#fbe3cc"], [.55, "#f0c8a8"], [1, "#d9a57f"]])}${lg("g-hairw", 0, 0, 1, 0, [[0, "#9a6a3a"], [.5, "#7a4d28"], [1, "#4a2a12"]])}${lg("g-navy", 0, 0, 1, 0, [[0, "#5a617a"], [.5, "#424963"], [1, "#2a2f44"]])}</defs>`;

  const EYE = `<path d="M716.4 141.6Q721.5 137 726.6 141.6Q721.5 145 716.4 141.6Z" fill="#fdfbf8"/><circle cx="721.7" cy="141.2" r="2.7" fill="#6b4a2a"/><circle cx="721.7" cy="141.2" r="1.3" fill="#120a05"/><circle cx="722.7" cy="140.2" r=".8" fill="#fff"/>
    <path d="M715.6 141.8Q721.5 135.6 727.4 141.8" stroke="#24150a" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M715.8 141.6L713.6 140.2M717.4 139.2L716 137.4" stroke="#24150a" stroke-width=".9" stroke-linecap="round"/>
    <path d="M717.4 137.8Q721.5 134.8 725.8 137.6" stroke="#b07a5a" stroke-width=".7" fill="none" opacity=".7"/><path d="M714.4 134.8Q720 130.6 727.4 133" stroke="#5a3a1e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;

  const FACE = `<path d="M722 166V184Q730 190 738 184V166Z" fill="url(#g-skin2)"/><path d="M722 172Q730 180 738 172V181Q730 188 722 181Z" fill="#a8704c" opacity=".3"/>
    <ellipse cx="709.4" cy="143" rx="3" ry="5.4" fill="#e6b392"/><ellipse cx="750.6" cy="143" rx="3" ry="5.4" fill="#e0ab88"/>
    <path d="M710 138C710 121 719 113 730 113C741 113 750 121 750 138C750 154 744 167 730 172C716 167 710 154 710 138Z" fill="url(#g-skinR)"/>
    <ellipse cx="717.5" cy="153" rx="6.2" ry="3.8" fill="#ee9488" opacity=".3"/><ellipse cx="742.5" cy="153" rx="6.2" ry="3.8" fill="#ee9488" opacity=".3"/>
    <path d="M711 146Q712 160 722 168M749 146Q748 160 738 168" stroke="#c4906d" stroke-width="1" fill="none" opacity=".3"/>
    <g transform="translate(-1.2 0)">${EYE}</g>${MIR(`<g transform="translate(-1.2 0)">${EYE}</g>`)}
    <path d="M727.2 144Q726 150 727 153.6" stroke="#c4906d" stroke-width="1.6" fill="none" opacity=".35"/><path d="M730 143Q728.8 149.6 727.2 153.4Q730 156 732.8 153.4Q731.2 149.6 730 143" fill="none" stroke="#bf8663" stroke-width=".9" opacity=".7"/>
    <ellipse cx="728.2" cy="154" rx="1.1" ry=".7" fill="#8e5a42" opacity=".6"/><ellipse cx="731.8" cy="154" rx="1.1" ry=".7" fill="#8e5a42" opacity=".6"/><ellipse cx="730" cy="151.4" rx="1.4" ry="1.8" fill="#fff" opacity=".25"/>
    <path d="M722.4 160.2Q726 157.2 730 158.8Q734 157.2 737.6 160.2Q730 162.8 722.4 160.2Z" fill="#c4575a"/><path d="M723.4 160.6Q730 163.6 736.6 160.6Q734.6 166.6 730 166.8Q725.4 166.6 723.4 160.6Z" fill="#da786f"/><path d="M727 164Q730 165.2 733 164" stroke="#fff" stroke-width=".8" fill="none" opacity=".55"/><path d="M722.6 160.4Q730 162.4 737.4 160.4" stroke="#8b3a3a" stroke-width=".7" fill="none"/>
    <ellipse cx="730" cy="169.4" rx="4.4" ry="1.2" fill="#c4906d" opacity=".25"/>`;

  const LOCK = `<path d="M722 117C714 120 710 130 709 146C708 158 713 166 711 176C709 188 703 194 704 206C705 218 713 224 711 236C709 246 704 254 700 266C706 262 713 254 716 244C718 234 716 226 714 218C713 208 718 198 719 188C720 176 718 162 717 148C716 136 718 126 722 117Z" fill="url(#g-hairw)"/>
    <path d="M714 130Q710 152 713 168Q714 184 708 198Q705 212 711 226M717 160Q716 186 716 206Q716 224 716 240" stroke="#2f1b0c" stroke-width="1" fill="none" opacity=".35"/><path d="M712 136Q709 158 712 172Q712 188 707 200" stroke="#e0bb88" stroke-width="1.4" fill="none" opacity=".55" stroke-linecap="round"/>`;
  const CAP = `<path d="M708.6 146C703 116 716 102 731 102C746 102 757 116 751.4 146C750 134 747 128 742 124C736 119.6 728 117 722 117C715 119.6 711 128 708.6 146Z" fill="url(#g-hairw)"/>
    <path d="M714 112Q724 104 740 108" stroke="#e0bb88" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/><path d="M722 117Q732 121 744 126M720 116Q716 124 712 134" stroke="#2f1b0c" stroke-width="1" fill="none" opacity=".35"/>`;
  const HAIR_BACK_LOOSE = `<path d="M707 124C698 148 695 180 693 205C691 220 695 230 701 238C706 234 710 228 713 231C716 234 719 230 722 234C726 237 730 231 730 234C732 231 735 237 738 234C741 230 744 234 747 231C750 228 754 234 759 238C765 230 769 220 767 205C765 180 762 148 753 124Z" fill="url(#g-hairw)"/>
    <path d="M700 170Q697 196 699 222M760 170Q763 196 761 222M712 190Q711 214 714 230M748 190Q749 214 746 230" stroke="#2f1b0c" stroke-width="1.1" fill="none" opacity=".3"/>`;
  const HAIR_BACK_TIED = `<path d="M743 112C768 104 792 130 784 174C780 198 788 214 776 238C772 246 763 242 766 233C770 223 762 215 764 197C766 178 762 160 748 140Z" fill="url(#g-hairw)"/><path d="M766 122Q786 140 778 176Q774 196 780 214M758 130Q772 150 766 178" stroke="#2f1b0c" stroke-width="1.1" fill="none" opacity=".35"/><path d="M774 128Q784 150 780 176" stroke="#e0bb88" stroke-width="1.5" fill="none" opacity=".5" stroke-linecap="round"/>
    <rect x="741" y="114" width="12" height="8" rx="3.5" fill="#2f6fd1" transform="rotate(-24 747 118)"/><path d="M743 115L752 118" stroke="#9cc0f2" stroke-width="1" opacity=".8"/>`;
  const HAIR_FRONT_LOOSE = `${LOCK}${MIR(LOCK)}${CAP}`;
  const HAIR_FRONT_TIED = `<path d="M708.6 146C703 116 716 102 731 102C746 102 757 116 751.4 146C750 134 747 128 742 124C736 119.6 728 117 722 117C715 119.6 711 128 708.6 146Z" fill="url(#g-hairw)"/><path d="M714 112Q724 104 740 108" stroke="#e0bb88" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/><path d="M722 117Q716 124 711 136M728 106Q732 114 738 122" stroke="#2f1b0c" stroke-width="1" fill="none" opacity=".35"/>`;
  const GOGGLES = `<path d="M709 140H702M751 140H758" stroke="#1d3a78" stroke-width="3.6" stroke-linecap="round"/><path d="M709 133.6Q719 130 728 133.6L728 146Q719 151 709 146Z" fill="#cfe9f7" fill-opacity=".3" stroke="#2f6fd1" stroke-width="2" stroke-linejoin="round"/><path d="M751 133.6Q741 130 732 133.6L732 146Q741 151 751 146Z" fill="#cfe9f7" fill-opacity=".3" stroke="#2f6fd1" stroke-width="2" stroke-linejoin="round"/><path d="M728 138Q730 136.4 732 138" stroke="#2f6fd1" stroke-width="2.4" fill="none"/><path d="M712 135.4Q717 133.6 724 135M735 135Q742 133.6 748 135.4" stroke="#fff" stroke-width="1.5" fill="none" opacity=".8" stroke-linecap="round"/>`;
  const HEAD = tied => `<g>${FACE}${tied ? HAIR_FRONT_TIED + GOGGLES : HAIR_FRONT_LOOSE}</g>`;
  const HAIR_BACK = tied => `<g>${tied ? HAIR_BACK_TIED : HAIR_BACK_LOOSE}</g>`;

  const HANDL = `<path d="M690 287L701.4 287C702 294 704 299 703 307C702 315 701 322 699 327C697 331 692 332 690 328C687 322 687 312 688 304C688.4 297 689.6 293 690 287Z" fill="url(#g-skin)"/><path d="M692.4 315V326M695.4 314.6L696 325.6" stroke="#b97c58" stroke-width=".7" fill="none" opacity=".6"/><path d="M702 303Q704 309 701.6 316" stroke="#b97c58" stroke-width=".8" fill="none" opacity=".5"/>`;
  const ARMBARE = `<path d="M693 234L708 238L707 253C706 266 704 280 701.4 291C702 295 704 299 703 307C702 315 701 322 699 327C697 331 692 332 690 328C687 322 687 312 688 304C688.4 297 689.6 293 690 291C690.6 278 691 262 692 248Z" fill="url(#g-skin)"/><path d="M696.4 268Q698 273 696.4 278" stroke="#b97c58" stroke-width="1" fill="none" opacity=".35"/><path d="M692.4 315V326M695.4 314.6L696 325.6" stroke="#b97c58" stroke-width=".7" fill="none" opacity=".6"/><path d="M702 303Q704 309 701.6 316" stroke="#b97c58" stroke-width=".8" fill="none" opacity=".5"/>`;

  const TORSO_BAD = `<g>${ARMBARE}${MIR(ARMBARE)}
    <path d="M722 181C712 183 703 187 697 193C692 201 689 218 687 244L710 254L711 262C707 272 703 282 701 294Q730 301 759 294C757 282 753 272 749 262L750 254L773 244C771 218 768 201 763 193C757 187 748 183 738 181Q730 194 722 181Z" fill="url(#g-tee)"/>
    <path d="M722 181Q730 194 738 181" stroke="#1f7d72" stroke-width="2.4" fill="none"/><path d="M710 244Q730 252 750 244M704 276Q730 284 756 276" stroke="#1f7d72" stroke-width="1.4" fill="none" opacity=".35"/><path d="M700 196Q694 214 692 230" stroke="#9af0e4" stroke-width="1.8" fill="none" opacity=".4" stroke-linecap="round"/>
    <path d="M711 258C709 270 706 282 705 292" stroke="#9af0e4" stroke-width="1.8" fill="none" opacity=".25" stroke-linecap="round"/>
    <path d="M730 208Q733 216 730 222" stroke="#1f7d72" stroke-width="1" fill="none" opacity=".3"/></g>`;

  const LEGL_PATH = `M703 334C701 362 705 386 709 402C704 418 701 438 707 454C710 464 712 472 713 480L726 480C726 470 727 462 726 452C725 436 727 418 725 402C728 386 731 362 731 334Z`;
  const LEG_BARE = `<path d="${LEGL_PATH}" fill="url(#g-skin)"/><path d="${LEGL_PATH}" fill="none" stroke="#b97c58" stroke-width=".9" opacity=".4"/><ellipse cx="716" cy="403" rx="6" ry="4.4" fill="#e3b08c" opacity=".35"/><path d="M708 340Q706 368 711 392" stroke="#fff" stroke-width="2.2" fill="none" opacity=".3" stroke-linecap="round"/><path d="M705 424Q706 442 711 456" stroke="#fff" stroke-width="1.8" fill="none" opacity=".25" stroke-linecap="round"/><path d="M724 420Q725 440 724 458" stroke="#a8704c" stroke-width="1.6" fill="none" opacity=".25"/>`;
  const SANDAL_F = `<path d="M712 477Q712 475 716 475H724Q728 475 729 478L731 488Q732 493 729 495H712Q708 493 709 488Z" fill="url(#g-skin)"/>
    <path d="M711.6 495.4Q710 495 710.4 493.4" stroke="none"/><ellipse cx="712.4" cy="492.8" rx="1.9" ry="2.4" fill="#f0c8a8"/><ellipse cx="716.4" cy="493.6" rx="1.8" ry="2.4" fill="#f0c8a8"/><ellipse cx="720.4" cy="494" rx="1.7" ry="2.3" fill="#f0c8a8"/><ellipse cx="724.4" cy="493.6" rx="1.6" ry="2.2" fill="#f0c8a8"/><ellipse cx="728" cy="492.6" rx="1.5" ry="2" fill="#f0c8a8"/>
    <path d="M707 497.4Q707 495.6 710 495.6H731Q734 495.6 733.6 497.6Q733 499.4 730 499.4H710Q707 499.4 707 497.4Z" fill="#7b4a1c"/><path d="M710 496.2H731" stroke="#b07a42" stroke-width=".8" opacity=".8"/>
    <path d="M710.4 484.4Q720 481 730 484.4" stroke="#a86022" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M720 482.6V491" stroke="#a86022" stroke-width="2" stroke-linecap="round"/>`;
  const SHORTS = `<path d="M701 288Q730 298 759 288L765 360Q730 368 695 360Z" fill="url(#g-den)"/><path d="M697 357Q730 365 763 357" stroke="#aac8e2" stroke-width="1.1" fill="none" stroke-dasharray="2 2" opacity=".8"/><path d="M730 312V364" stroke="#2c4e72" stroke-width="1" opacity=".3"/><path d="M730 296V312M714 304Q722 308 727 306M746 304Q738 308 733 306" stroke="#2c4e72" stroke-width="1.2" fill="none" opacity=".55"/><path d="M706 318Q708 340 706 356M754 318Q752 340 754 356" stroke="#35597e" stroke-width="1.1" fill="none" opacity=".35"/>`;
  const FLOOR_SH = `<ellipse cx="730" cy="495" rx="40" ry="4" fill="#000" opacity=".3" filter="url(#f-b2)"/>`;
  const LEGS_BAD = `<g>${FLOOR_SH}${LEG_BARE}${MIR(LEG_BARE)}${SANDAL_F}${MIR(SANDAL_F)}${SHORTS}</g>`;

  const TRS_L = `<path d="M703 292C702 330 706 380 708 404C706 430 706 450 712 478L727 478C727 452 728 430 727 404C729 380 731 340 731 296Z" fill="url(#g-navy)"/><path d="M718 330Q717 410 719 476" stroke="#1f2335" stroke-width="1" fill="none" opacity=".4"/>`;
  const SHOE_F = `<path d="M711 477Q711 473 716 473H724Q729 473 730 477L733 488Q735 494 731 496H709Q705 494 708 488Z" fill="#2b2d36"/><path d="M709 490Q720 486 732 490L732.4 494Q731 496.4 728 496.4H712Q708 496.4 708 493Z" fill="#fafaf8"/><path d="M706 496.2H735V498.6Q735 500 732 500H709Q706 500 706 498.4Z" fill="#e7e7e3"/>
    <path d="M714 478.6H726M713.4 482H726.6M712.6 485.4H727.4" stroke="#e8e8e8" stroke-width="1.2" stroke-linecap="round"/><path d="M714 476Q720 474.4 726 476" stroke="#fff" stroke-width="1" fill="none" opacity=".35"/>`;
  const LEGS_GOOD = `<g>${FLOOR_SH}${TRS_L}${MIR(TRS_L)}${SHOE_F}${MIR(SHOE_F)}</g>`;

  const COAT_SLEEVE = `<g transform="translate(-1.5 2)">${HANDL}</g><path d="M694 196C689 220 686 262 683 298L700 302C702 270 706 244 710 224Z" fill="url(#g-coat)" stroke="#c4ccd4" stroke-width="1"/><path d="M692 214C688 240 686 266 684 292" stroke="#fff" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/><path d="M697 240Q701 250 699 262" stroke="#b9c3cc" stroke-width="1.2" fill="none" opacity=".6"/><path d="M683 293L700 297V304L683 300Z" fill="#e3e9ee" stroke="#c4ccd4" stroke-width=".8"/>`;
  const TORSO_GOOD = `<g>
    <path d="M722 181C710 183 700 188 694 196C690 212 690 240 690 262C689 300 688 350 686 398Q730 407 774 398C772 350 771 300 770 262C770 240 770 212 766 196C760 188 750 183 738 181Q730 194 722 181Z" fill="url(#g-coat)"/>
    <path d="M766 200C770 240 770 300 774 396" stroke="#9aa6b1" stroke-width="3" fill="none" opacity=".25" filter="url(#f-b1)"/>
    <path d="M721 182L730 230L739 182Z" fill="#3f7fd1"/>
    <path d="M721 181L711 191L724 216L730 230L727 198Z" fill="#fbfcfd" stroke="#c4ccd4" stroke-width="1" stroke-linejoin="round"/><path d="M739 181L749 191L736 216L730 230L733 198Z" fill="#eef2f5" stroke="#c4ccd4" stroke-width="1" stroke-linejoin="round"/>
    <path d="M730 230V402" stroke="#c4ccd4" stroke-width="1.3"/>
    <circle cx="726" cy="250" r="1.9" fill="#aeb9c3"/><circle cx="726" cy="282" r="1.9" fill="#aeb9c3"/><circle cx="726" cy="314" r="1.9" fill="#aeb9c3"/><circle cx="726" cy="346" r="1.9" fill="#aeb9c3"/><circle cx="726" cy="378" r="1.9" fill="#aeb9c3"/>
    <path d="M700 330L718 334L719 360L701 357Z" fill="none" stroke="#c4ccd4" stroke-width="1.3"/><path d="M760 330L742 334L741 360L759 357Z" fill="none" stroke="#c4ccd4" stroke-width="1.3"/>
    <path d="M688 398Q730 406 772 398" stroke="#c4ccd4" stroke-width="1.2" fill="none"/>
    </g>${COAT_SLEEVE}${MIR(COAT_SLEEVE)}`;

  const H2SO4 = (x, rot) => bottle(x, 60, 30, 48, { c: "#6b3a1c", liq: "#a56a2a", label: "H₂SO₄", fs: 5.4, lc: "#9c1f18", stripe: "#d9422f", onShelf: 1, rot, level: .7 });
  const RAIL = `<rect x="424" y="92" width="3" height="8" fill="#7c8791"/><rect x="466" y="92" width="3" height="8" fill="#7c8791"/><rect x="424" y="92" width="45" height="2.6" rx="1.3" fill="url(#g-metal)"/>`;
  const warm = `<ellipse cx="150" cy="284" rx="86" ry="14" fill="#ff9a3a" opacity=".3" filter="url(#f-b3)"/>`;
  const VAPOR = `<path d="M204 240q-7 -9 0 -16t0 -14M214 238q-7 -9 0 -16t0 -14" stroke="#cfe6ee" stroke-width="2.6" fill="none" opacity=".5" stroke-linecap="round" filter="url(#f-b1)"/>`;
  const ETHANOL = open => bottle(192, 222, 32, 46, { c: "#e3eff3", liq: "#d4e9f0", label: "ЕТАНОЛ", fs: 5, lc: "#b3261e", stripe: "#d9422f", cap: "#c04f2f", open, level: .72 });

  const FOOD = `<g>${cast(300, 268, 36, .3)}
    <ellipse cx="292" cy="267" rx="34" ry="7.6" fill="#000" opacity=".3" filter="url(#f-b2)"/><ellipse cx="292" cy="265" rx="33" ry="7" fill="#f4f4f1"/><ellipse cx="292" cy="264.6" rx="26" ry="5" fill="#e4e4de"/><ellipse cx="292" cy="264" rx="33" ry="7" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
    <path d="M269 262Q268 255 276 255H308Q316 255 316 262Q316 265 312 265H273Q269 265 269 262Z" fill="#d6a85c"/><path d="M270 259H315" stroke="#a97a32" stroke-width="1" opacity=".5"/>
    <path d="M268 256Q276 251 284 255Q292 249 300 254Q308 250 317 256" stroke="#6fae4f" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M270 252Q280 249 292 252Q304 248 315 252" stroke="#8cc86a" stroke-width="2" fill="none" opacity=".7"/>
    <ellipse cx="279" cy="253.5" rx="7" ry="2.3" fill="#d6453a"/><ellipse cx="296" cy="252.5" rx="7" ry="2.2" fill="#cf3c32"/><path d="M270 250H316L313 248H273Z" fill="#f0cf5a"/>
    <path d="M268 248Q268 237 291 237Q315 237 316 248Q316 251 312 251H272Q268 251 268 248Z" fill="url(#g-bread)"/><path d="M273 242Q290 237 308 242" stroke="#fff3c9" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
    <circle cx="330" cy="274" r="0" fill="none"/>
    <ellipse cx="328" cy="267" rx="13" ry="3" fill="#000" opacity=".35" filter="url(#f-b2)"/>
    <path d="M318 244H342L340 264Q340 267 336 267H324Q320 267 320 264Z" fill="url(#g-mug)"/><ellipse cx="330" cy="244" rx="12" ry="3.2" fill="#f1f1ee"/><ellipse cx="330" cy="244.6" rx="10.4" ry="2.5" fill="#5a3a1f"/><ellipse cx="327" cy="244" rx="4" ry="1" fill="#a97a4a" opacity=".6"/>
    <path d="M341 248Q349 248 349 255Q349 262 340 262" stroke="#e9e9e5" stroke-width="3.4" fill="none"/><path d="M341 248Q349 248 349 255" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/>
    <path d="M325 238q-4 -6 0 -11t0 -9M334 238q-4 -6 0 -11t0 -9" stroke="#fff" stroke-width="2.2" fill="none" opacity=".4" stroke-linecap="round" filter="url(#f-b1)"/>
    <circle cx="318" cy="269" r="1" fill="#d6a85c"/><circle cx="352" cy="270" r="1.1" fill="#d6a85c"/><circle cx="262" cy="269" r=".9" fill="#d6a85c"/></g>`;
  
  const FOOD_DEFS = `<defs>${lg("g-bread", 0, 0, 0, 1, [[0, "#e9c277"], [.6, "#d09a48"], [1, "#b97e30"]])}${lg("g-mug", 0, 0, 1, 0, [[0, "#c8cbcc"], [.3, "#ffffff"], [.7, "#f0f0ed"], [1, "#b2b6b8"]])}${lg("g-note", 0, 0, 1, 1, [[0, "#3c5fae"], [1, "#1f3875"]])}${lg("g-pen", 0, 0, 0, 1, [[0, "#ffe27a"], [.5, "#f2bf27"], [1, "#b88a10"]])}</defs>`;
  
  const NOTE = `<g>${FOOD_DEFS}${cast(296, 272, 30, .28)}<path d="M272 273L326 270L328 275L274 278Z" fill="#000" opacity=".3" filter="url(#f-b2)"/>
    <path d="M273 273L326 269.5L326.5 272.8L273.5 276.4Z" fill="#efeee6"/><path d="M273 274.2L326 270.7M273.3 275.3L326.3 271.8" stroke="#c9c7ba" stroke-width=".6"/>
    <path d="M270 264L320 260L327 269.5L273 273Z" fill="url(#g-note)"/><path d="M270 264L320 260" stroke="#8fa8e0" stroke-width="1" opacity=".7"/>
    <path d="M296 261.5L303 271" stroke="#142852" stroke-width="3.4" opacity=".6"/><rect x="283" y="266" width="20" height="3.6" rx=".8" fill="#e9e6d6" opacity=".8" transform="rotate(-4 293 268)"/>
    ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${272.4 + i * 1.1}" cy="${265.5 + i * 1.28}" rx="2.2" ry="1" fill="#c3c9d0" stroke="#7c8791" stroke-width=".5"/>`).join("")}
    <path d="M334 271L362 264" stroke="#000" stroke-width="3" opacity=".3" filter="url(#f-b1)" transform="translate(1 3)"/><path d="M334 269.5L359 263.2L362 264.2L336 272Z" fill="url(#g-pen)"/><path d="M334 269.8L359 263.5" stroke="#fff3b0" stroke-width=".8" opacity=".8"/><path d="M359 263.2L364 262L362 264.2Z" fill="#e6c79c"/><path d="M362.8 262.3L364 262L363.2 263.3Z" fill="#2b2b2b"/><path d="M334 269.5L330 270.8L331.6 273.2L336 272Z" fill="#e48aa0"/></g>`;

  const SPILL = `<g>${cast(400, 276, 34, .25)}
    <defs>${lg("g-grn", 0, 0, 0, 1, [[0, "#c4f2a0", .9], [1, "#7cc653", .95]])}</defs>
    <ellipse cx="446" cy="274" rx="32" ry="6.4" fill="#2f5a1a" opacity=".28" filter="url(#f-b2)" transform="translate(2 2)"/>
    <ellipse cx="446" cy="272.6" rx="31" ry="6.2" fill="url(#g-grn)" stroke="#5aa634" stroke-width=".8"/>
    <ellipse cx="446" cy="272.6" rx="22" ry="3.8" fill="none" stroke="#f3ffe6" stroke-width=".9" opacity=".6"/><path d="M425 271Q436 267.6 452 269" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/>
    <path d="M442 261C446 264 447 268 446 272" stroke="url(#g-grn)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M443 262.6C445.6 265 446 268 445.6 270" stroke="#f3ffe6" stroke-width="1" fill="none" opacity=".8"/>
    <ellipse cx="480" cy="276" rx="2.6" ry="1.2" fill="#7cc653" opacity=".9"/><ellipse cx="486" cy="272" rx="1.6" ry=".8" fill="#7cc653" opacity=".8"/><ellipse cx="410" cy="277" rx="2" ry="1" fill="#7cc653" opacity=".8"/></g>`;
  
  const UNLABELED = `${SPILL}${bottle(380, 214, 30, 46, { c: "#8a5a2b", liq: "#b27a3c", open: true, rot: 90, level: .35 })}`;

  const HEATER = (good) => `<g>${cast(496, 268, 46, .3)}${contact(496, 268, 50, .5)}
    <defs>${lg("g-hbody", 0, 0, 0, 1, [[0, "#555d66"], [.2, "#363c43"], [1, "#171a1e"]])}${lg("g-hplate", 0, 0, 1, 0, [[0, "#6c7681"], [.3, "#c4ccd3"], [.6, "#8a949e"], [1, "#4c555e"]])}${rg("g-led", .5, .5, .5, [[0, good ? "#ff8a7a" : "#9dffa8"], [1, good ? "#d62d20" : "#1fb34a"]])}</defs>
    <ellipse cx="496" cy="248.4" rx="46" ry="4.2" fill="url(#g-hplate)"/><ellipse cx="496" cy="247.8" rx="40" ry="3" fill="url(#g-hbody)" opacity=".5"/>
    <rect x="450" y="248" width="92" height="19" rx="4" fill="url(#g-hbody)"/><rect x="451" y="248.6" width="90" height="1.8" rx=".9" fill="#fff" opacity=".28"/><rect x="450" y="263" width="92" height="4" rx="2" fill="#000" opacity=".35"/>
    <path d="M488 256h22M488 259h22M488 262h22" stroke="#000" stroke-width="1" opacity=".5"/>
    <circle cx="468" cy="257" r="5.2" fill="#1b1e22"/><circle cx="468" cy="257" r="4.2" fill="#d6892e"/><path d="M468 253.4v3.6" stroke="#fff" stroke-width="1.2"/><circle cx="467" cy="255.5" r="1.2" fill="#fff" opacity=".6"/>
    <circle cx="524" cy="257" r="3.2" fill="url(#g-led)"/><circle cx="524" cy="257" r="7" fill="${good ? "#d62d20" : "#32d062"}" opacity=".25" filter="url(#f-b1)"/></g>`;
  
  const CABLE_BAD = `<g>
    <path d="M542 258C568 262 572 278 562 300C554 330 549 384 556 414C558 424 564 428 574 427" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(6 4)"/>
    <path d="M542 258C568 262 572 278 562 300C554 330 549 384 556 414C558 424 564 428 574 427" stroke="#14171b" stroke-width="3.8" fill="none" stroke-linecap="round"/><path d="M542 257C567 261 571 277 561 299C553 329 548 383 555 413C557 423 563 427 573 426" stroke="#6b7480" stroke-width="1" fill="none" opacity=".6" stroke-linecap="round"/>
    <g transform="translate(0 50)"><defs>${lg("g-pud", 0, 0, 0, 1, [[0, "#d9f0fb", .8], [1, "#8cc4e4", .85]])}</defs>
    <ellipse cx="553" cy="380" rx="42" ry="9.4" fill="#1a2a35" opacity=".22" filter="url(#f-b2)"/><ellipse cx="553" cy="378" rx="40" ry="8.6" fill="url(#g-pud)"/><ellipse cx="553" cy="378" rx="40" ry="8.6" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/>
    <path d="M526 376Q540 372 552 375" stroke="#fff" stroke-width="2.2" fill="none" opacity=".85" stroke-linecap="round"/><path d="M566 381Q576 380 582 377" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/><ellipse cx="553" cy="375" rx="9" ry="2.2" fill="none" stroke="#fff" stroke-width=".9" opacity=".7"/>
    <rect x="571" y="371.4" width="13" height="8" rx="2.4" fill="#262a31" stroke="#0b0d10" stroke-width=".8"/><path d="M584 373.6h5M584 377.2h5" stroke="#d3d9de" stroke-width="1.6" stroke-linecap="round"/><path d="M590 370l-4 7h5l-4 8" stroke="#fff6a8" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round" filter="url(#f-b1)"/><path d="M590 370l-4 7h5l-4 8" stroke="#ffe44d" stroke-width="1" fill="none" stroke-linejoin="round" stroke-linecap="round"/></g></g>`;
  
  const CABLE_GOOD = `<g><path d="M581 242C579 252 562 257 542 258" stroke="#000" stroke-width="4.6" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(2 4)"/><path d="M581 242C579 252 562 257 542 258" stroke="#14171b" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M581 241C579 251 562 256 542 257" stroke="#6b7480" stroke-width=".9" fill="none" opacity=".6"/>
    <rect x="572" y="223" width="20" height="19" rx="3.6" fill="#000" opacity=".3" filter="url(#f-b1)" transform="translate(1.5 2.5)"/><rect x="572" y="223" width="20" height="19" rx="3.6" fill="#e9e7e1" stroke="#b3ae9c" stroke-width="1"/><rect x="574" y="225" width="16" height="4" rx="2" fill="#fff" opacity=".7"/><rect x="577" y="237" width="8" height="7" rx="1.6" fill="#d9d6cc"/></g>`;

  const BAG = `<g>${contact(206, 490, 62, .5)}
    <defs>${lg("g-bag", 0, 0, 1, 1, [[0, "#ea5646"], [.5, "#c63a2d"], [1, "#8f2218"]])}${lg("g-bag2", 0, 0, 0, 1, [[0, "#b3281d"], [1, "#7c1a12"]])}</defs>
    <path d="M168 470Q140 474 132 494Q150 500 170 488" stroke="#000" stroke-width="10" fill="none" opacity=".25" filter="url(#f-b2)" transform="translate(0 4)"/><path d="M168 470Q140 474 132 494Q150 500 170 488" stroke="#7c1a12" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M167 468Q140 472 133 491" stroke="#d8604f" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/><rect x="128" y="488" width="8" height="5" rx="1.5" fill="#2a2a2a" transform="rotate(-20 132 490)"/>
    <path d="M244 470Q268 478 274 496Q256 500 242 488" stroke="#7c1a12" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M244 468Q266 476 272 492" stroke="#d8604f" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M184 446Q205 420 228 446" stroke="#4a100b" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M185 446Q205 424 227 446" stroke="#b9382b" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>
    <rect x="160" y="440" width="92" height="50" rx="17" fill="url(#g-bag)"/><rect x="160" y="440" width="92" height="50" rx="17" filter="url(#f-fabric)" opacity=".45"/><rect x="164" y="442" width="84" height="9" rx="4.5" fill="#fff" opacity=".22"/><rect x="160" y="478" width="92" height="12" rx="6" fill="#000" opacity=".22"/>
    <rect x="173" y="460" width="66" height="27" rx="9" fill="url(#g-bag2)"/><rect x="173" y="460" width="66" height="27" rx="9" filter="url(#f-fabric)" opacity=".4"/><path d="M178 462H234" stroke="#e7dfc9" stroke-width="2" stroke-dasharray="3 2.2"/><rect x="203" y="458" width="10" height="5" rx="1.5" fill="url(#g-metal)"/><circle cx="208" cy="476" r="3.4" fill="#e9dcb4" stroke="#8a7b4e" stroke-width=".8"/>
    <path d="M166 454Q170 448 178 446" stroke="#fff" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/></g>`;
  
  const SHARD = (pts, k) => { const p = pts.map(q => q.join(",")).join(" "); return `<polygon points="${pts.map(q => (q[0] + 3) + "," + (q[1] + 3)).join(" ")}" fill="#1a2a35" opacity=".28" filter="url(#f-b1)"/><polygon points="${p}" fill="url(#g-shard)" stroke="#fff" stroke-width=".9" stroke-opacity=".85"/><path d="M${pts[0][0]} ${pts[0][1]}L${pts[1][0]} ${pts[1][1]}" stroke="#fff" stroke-width="1.6" opacity=".9"/>`; };
  
  const GLASS = `<g><defs>${lg("g-shard", 0, 0, 1, 1, [[0, "#f6fcff", .85], [.5, "#cfe7f2", .55], [1, "#9cc4d8", .7]])}</defs>
    ${[[[303,486],[309,474],[321,467],[333,481],[324,489]], [[336,481],[343,468],[351,459],[364,477],[352,484]], [[366,487],[372,476],[380,471],[391,484],[381,490]], [[319,490],[327,484],[336,486],[331,492]], [[393,484],[399,476],[407,480],[404,488]], [[345,490],[352,485],[359,488],[353,493]], [[285,491],[292,485],[298,489],[291,494]], [[408,492],[414,488],[417,493]]].map(SHARD).join("")}
    <path d="M338 470l4 -9M352 470l6 -4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/><path d="M320 470l0 -6M317 467h6" stroke="#fff" stroke-width="1.2" opacity=".9"/><path d="M381 474l0 -5M378.5 471.5h5" stroke="#fff" stroke-width="1.1" opacity=".9"/>
    <path d="M308 492Q340 500 378 494" stroke="#bcd8e6" stroke-width="2.2" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  
  const BOXES = `<g>
    ${box(32, 214, 82, 54, { d: 14 })}${box(40, 170, 68, 44, { d: 12, rot: -2 })}${box(50, 132, 56, 38, { d: 10, rot: 5 })}</g>`;

  const TXT = {
    "polica": { "name": "Тешко шише на работ од полицата", "why": "Тешко шише со киселина е на самиот раб од полицата и може да падне, да се скрши и да се излее.", "fix": "Тешките шишиња и шишињата со опасни супстанции се чуваат на долните полици.", "ok": "Шишето е добро поставено на полицата." },
    "aparat": { "name": "Блокиран апарат за гаснење пожар", "why": "Апаратот за гаснење пожар е скриен зад кутии. Во итна ситуација нема време за поместување.", "fix": "Патот до апаратот, тушот за итни случаи и излезот мора секогаш да се слободни.", "ok": "Апаратот за гаснење е на видливо место и пристапот е слободен." },
    "etanol": { "name": "Отворен етанол покрај пламен", "why": "Шишето со лесно запалив етанол е отворено веднаш до запален пламеник. Пареите можат да се запалат.", "fix": "Запаливите течности се чуваат затворени и далеку од пламен. Пламеникот се пали само кога е потребен.", "ok": "Горелката е изгасната, а шишето со етанол е затворено." },
    "hrana": { "name": "Храна и пијалок во лабораторија", "why": "Сендвич и чаша на работната маса. Храната може да се загади со хемикалии.", "fix": "Во лабораторија не се јаде, не се пие и не се чуваат прибор за јадење или храна.", "ok": "На масата има само тетратка и молив." },
    "bezetiketa": { "name": "Шише без етикета и истурена течност", "why": "Шишето нема етикета, а од него се излева течност. Не се знае што е.", "fix": "Секое шише има етикета (име, концентрација, ознака за опасност), а излеаното се чисти веднаш по упатство.", "ok": "Шишето е затворено и означено." },
    "kabel": { "name": "Кабел во локва вода", "why": "Кабелот виси надолу и допира локва вода. Има опасност од струен удар и кратко спојување.", "fix": "Каблите се поставуваат покрај ѕидот, подалеку од вода, а излеаното се брише веднаш.", "ok": "Кабелот е уредно поврзан со штекер." },
    "rabot": { "name": "Стаклен сад на работ на масата", "why": "Чашата е на самиот раб од масата и лесно може да падне и да се скрши.", "fix": "Садовите се ставаат на средина од масата, подалеку од работ.", "ok": "Чашата е сигурно поставена на масата, подалеку од работ." },
    "torba": { "name": "Чанта на подот", "why": "Чанта на подот пред масата. Некој може да се сопне и да се повреди. Особено е опасно во лабораторија со хемикалии", "fix": "Торбите и јакните се оставаат на определено место, подалеку од работните површини и преминот.", "ok": "" },
    "staklo": { "name": "Скршено стакло на подот", "why": "На подот има парчиња скршено стакло кои можат да нанесат исекотини.", "fix": "Стаклото не се собира со раце: се користи метла и лопата, а се фрла во посебен сад за стаклен отпад.", "ok": "" },
    "ocila": { "name": "Без заштитни очила и распуштена коса", "why": "Нема заштитни очила, а долгата коса не ѝ е собрана, па постои опасност да дојде во контакт со пламен или хемикалии.", "fix": "Заштитните очила се носат цело време во лабораторија, а долгата коса се врзува.", "ok": "Носи заштитни очила, а косата е врзана." },
    "mantil": { "name": "Без мантил, откриени раце", "why": "Носи кратка маица наместо лабораториски мантил, па при прскање хемикалиите може директно да дојдат во контакт со кожата.", "fix": "Се носи долг, затворен мантил од памук со долги ракави.", "ok": "Носи долг, затворен мантил." },
    "chevli": { "name": "Отворени сандали и шорцеви", "why": "Носи кратко здолниште и отворени сандали, па кожата на нозете и стапалата е незаштитена од истурени хемикалии и скршено стакло.", "fix": "Во лабораторија се носат затворени чевли и долги панталони.", "ok": "Носи затворени чевли и долги панталони." }
  };
  const T = id => TXT[id];
  const H = [
    { id: "polica", ...T("polica"), hot: [478, 56, 72, 66], hotGood: [418, 60, 60, 54], bad: H2SO4(507), good: H2SO4(428, 0) + `<g transform="translate(0 8)">${RAIL}</g>` },
    { id: "aparat", ...T("aparat"), hot: [24, 138, 96, 156], hotGood: [24, 138, 86, 150], bad: BOXES, good: "" },
    { id: "etanol", ...T("etanol"), hot: [96, 184, 150, 112], hotGood: [96, 196, 150, 100], bad: warm + FLAME(150, 248) + ETHANOL(true) + VAPOR + `<ellipse cx="238" cy="293" rx="8" ry="2.6" fill="#c04f2f"/><ellipse cx="238" cy="291.6" rx="8" ry="2.6" fill="#e0643f"/>`, good: ETHANOL(false) },
    { id: "hrana", ...T("hrana"), hot: [258, 234, 98, 52], hotGood: [262, 240, 104, 54], bad: FOOD, good: NOTE },
    { id: "bezetiketa", ...T("bezetiketa"), hot: [372, 222, 108, 92], hotGood: [372, 216, 50, 56], bad: UNLABELED, good: bottle(380, 222, 30, 46, { c: "#a9c3cf", liq: "#ead9a0", label: "HCl 1M", fs: 5.4, cap: "#1b1b1b", level: .55 }) },
    { id: "kabel", ...T("kabel"), hot: [532, 258, 84, 190], hotGood: [440, 224, 150, 48], bad: HEATER(false) + CABLE_BAD, good: HEATER(true) + CABLE_GOOD },
    { id: "rabot", ...T("rabot"), hot: [626, 238, 48, 52], hotGood: [598, 230, 44, 44], bad: beaker(634, 238, 30, 36, { rot: 9 }), good: beaker(604, 230, 30, 36) },
    { id: "torba", ...T("torba"), hot: [124, 420, 160, 78], hotGood: null, bad: BAG, good: null },
    { id: "staklo", ...T("staklo"), hot: [282, 456, 130, 44], hotGood: null, bad: GLASS, good: null },
    { id: "ocila", ...T("ocila"), hot: [702, 100, 56, 80], hotGood: [702, 100, 56, 80], fig: true, bad: HEAD(false), good: HEAD(true) },
    { id: "mantil", ...T("mantil"), hot: [680, 182, 100, 126], hotGood: [680, 182, 100, 226], fig: true, bad: TORSO_BAD, good: TORSO_GOOD },
    { id: "chevli", ...T("chevli"), hot: [698, 330, 64, 168], hotGood: [698, 400, 64, 98], fig: true, bad: LEGS_BAD, good: LEGS_GOOD },
  ];
  
  const SAFE = [
    { name: "Прва помош", hot: [554, 142, 66, 52], ok: "Кутијата за прва помош е на видливо и достапно место: ова е во ред." },
    { name: "Затворени шишиња на полица", hot: [270, 56, 134, 58], ok: "Затворени и означени шишиња на полица со раб: ова е во ред." },
    { name: "Прозорец", hot: [88, 4, 180, 160], ok: "Прозорецот обезбедува светлина и проветрување: ова е во ред." },
    { name: "Периоден систем", hot: [330, 122, 128, 54], ok: "Постерот со периодниот систем е на ѕидот за брза проверка: ова е во ред." },
  ];

  const N_BAD = 8;

  let active = [], found = new Set(), wrong = 0, hints = 0, over = false, streak = 0;
  const defs = DEFS + HEAD_DEFS + FIG_DEFS + FOOD_DEFS;

  function draw() {
    const bad = new Set(active.map(h => h.id));
    let items = "";
    items += HAIR_BACK(!bad.has("ocila"));
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
    return pt.matrixTransform(svg.createSVGMatrix ? svg.getScreenCTM().inverse() : svg.getScreenCTM().inverse());
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
