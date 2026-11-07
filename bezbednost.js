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
    <clipPath id="c-top"><path d="M44 268H648L664 302H28Z"/></clipPath>
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

  // ---------- ПРОСТОРИЈА И ПРИРОДНА ВИСИНА НА МАСАТА (Y: 268) ----------
  const BASE = `
    <rect width="800" height="500" fill="url(#g-wall)"/>
    <rect width="800" height="342" filter="url(#f-plaster)" opacity=".4"/>
    <rect width="800" height="342" fill="url(#g-wlight)"/>
    <!-- плочки (задниот ѕид) -->
    <g><rect x="0" y="156" width="800" height="186" fill="url(#p-tile)"/><rect x="0" y="156" width="800" height="186" fill="url(#g-tileshade)"/>
      <rect x="0" y="154" width="800" height="6" fill="#aeb8bf"/><rect x="0" y="154" width="800" height="1.6" fill="#fff" opacity=".8"/><rect x="0" y="160" width="800" height="5" fill="#000" opacity=".16" filter="url(#f-b2)"/></g>
    <rect y="330" width="800" height="12" fill="#6f7a82"/><rect y="330" width="800" height="2" fill="#a7b2b9"/>
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
    <path d="M100 128L260 128L412 342L226 342Z" fill="#fff6dc" opacity=".11" filter="url(#f-b3)"/>
    <path d="M118 128L240 128L340 342L206 342Z" fill="#fff6dc" opacity=".08" filter="url(#f-b2)"/>
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
    <g><rect x="40" y="138" width="36" height="30" rx="3" fill="#000" opacity=".25" filter="url(#f-b2)" transform="translate(3 4)"/><rect x="38" y="136" width="36" height="30" rx="3" fill="#1f9a56"/><rect x="38" y="136" width="36" height="30" rx="3" fill="none" stroke="#fff" stroke-width="2"/><path d="M56 142c-8 8 -6 14 0 19c6 -5 8 -11 0 -19z" fill="#fff"/></g>
    <g><rect x="48" y="191" width="22" height="76" rx="9" fill="#000" opacity=".3" filter="url(#f-b2)" transform="translate(5 3)"/>
      <rect x="47" y="190" width="22" height="76" rx="9" fill="url(#g-red)"/><rect x="47" y="190" width="22" height="22" rx="9" fill="#000" opacity=".12"/><rect x="51" y="196" width="3" height="62" rx="1.5" fill="#fff" opacity=".42"/>
      <rect x="53" y="179" width="10" height="14" rx="2" fill="url(#g-metal)"/><path d="M49 179h18" stroke="#2c3238" stroke-width="4" stroke-linecap="round"/><path d="M65 183q16 0 18 16t-5 17" stroke="#16191c" stroke-width="3.4" fill="none"/>
      <circle cx="58" cy="209" r="5.4" fill="#f3f3ee" stroke="#8b8f92" stroke-width="1.2"/><path d="M58 209l2.6 -2.6" stroke="#c4291b" stroke-width="1.2"/>
      <rect x="50" y="228" width="16" height="16" rx="1.5" fill="#f8f6ee"/><path d="M58 231c-3 3 -2 6 0 9c3 -3 3 -6 0 -9z" fill="#c4291b"/>
      <rect x="45" y="218" width="26" height="6" rx="2" fill="#2c3238"/></g>
    <!-- маса: фиоки и врати -->
    <rect x="26" y="302" width="640" height="62" fill="url(#g-door)"/>
    <rect x="26" y="302" width="640" height="62" fill="url(#g-cabsh)"/>
    ${[38, 238, 438].map((x, i) => `<g><rect x="${x}" y="312" width="${i === 2 ? 204 : 190}" height="44" rx="2.5" fill="url(#g-door)" stroke="#7c8893" stroke-width="1.6"/><rect x="${x + 1}" y="313" width="${(i === 2 ? 204 : 190) - 2}" height="1.6" fill="#fff" opacity=".6"/><rect x="${x + (i === 2 ? 86 : 80)}" y="319" width="34" height="5" rx="2.5" fill="url(#g-metal)"/><rect x="${x + (i === 2 ? 86 : 80)}" y="324" width="34" height="2" rx="1" fill="#000" opacity=".25"/></g>`).join("")}
    <rect x="26" y="356" width="640" height="8" fill="#2c3238"/><rect x="26" y="356" width="640" height="1.6" fill="#59636c"/>
    <rect x="22" y="362" width="652" height="16" fill="#000" opacity=".34" filter="url(#f-b3)"/>
    <!-- маса: плоча -->
    <path d="M44 268H648L664 302H28Z" fill="url(#g-top)"/>
    <path d="M44 268H648L664 302H28Z" fill="url(#g-topsheen)"/>
    <path d="M44 268H648L664 302H28Z" filter="url(#f-grain)" opacity=".22"/>
    <path d="M28 302H664V307H28Z" fill="url(#g-edge)"/><path d="M28 302H664" stroke="#fff" stroke-width="1.4" opacity=".85"/><path d="M28 307H664" stroke="#000" stroke-width="1" opacity=".3"/>
    <path d="M44 268H648" stroke="#7c8791" stroke-width="1.4" opacity=".6"/>
    <!-- под -->
    <rect y="342" width="800" height="158" fill="url(#g-floor)"/>
    <rect y="342" width="800" height="158" fill="url(#g-flight)"/>
    <g stroke="#8f8878" stroke-width="1.4" opacity=".75" fill="none">
      <path d="M0 354H800M0 374H800M0 399H800M0 432H800"/>
      ${[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(k => `<path d="M${400 + k * 44} 342L${400 + k * 150} 500"/>`).join("")}</g>
    <g stroke="#fff" stroke-width="1" opacity=".35" fill="none"><path d="M0 355.5H800M0 375.5H800M0 400.5H800M0 433.5H800"/></g>
    <rect y="342" width="800" height="18" fill="url(#g-cabsh)" opacity=".7"/>`;

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
    <path d="M160 288q22 4 38 -2t34 6" stroke="#0a120d" stroke-width="7" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(0 4)"/>
    <path d="M160 286q22 4 38 -2t34 6" stroke="url(#g-hose)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M160 284q22 4 38 -2t34 6" stroke="#9ec0ab" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>
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

  // ======================================================================
  //  УЧЕНИЧКА: Совршени природни пропорции (висина од глава до пети: ~380px)
  // ======================================================================
  const SKIN = () => `${lg("g-skin", 0, 0, 1, 0, [[0, "#f5d2b4"], [.55, "#e8b995"], [1, "#c98d68"]])}${lg("g-skin2", 0, 0, 1, 0, [[0, "#e6ba98"], [1, "#b97c58"]])}`;
  const HEAD_DEFS = `<defs>${SKIN()}${lg("g-hair", 0, 0, 1, 0, [[0, "#8a5c33"], [.5, "#6a4223"], [1, "#3b2210"]])}${lg("g-coat", 0, 0, 1, 0, [[0, "#ffffff"], [.55, "#eef2f5"], [1, "#c3ccd4"]])}${lg("g-coat2", 0, 0, 1, 0, [[0, "#f4f7f9"], [1, "#b7c1ca"]])}${lg("g-tee", 0, 0, 1, 0, [[0, "#5ed1c1"], [.55, "#35a799"], [1, "#1f7d72"]])}${lg("g-den", 0, 0, 1, 0, [[0, "#7ea6cb"], [.55, "#557fa8"], [1, "#35597e"]])}${lg("g-trs", 0, 0, 1, 0, [[0, "#5d647c"], [.5, "#444a60"], [1, "#2a2e3f"]])}${lg("g-trs2", 0, 0, 1, 0, [[0, "#3b4054"], [1, "#1f2230"]])}</defs>`;
  
  const FACE = `<path d="M712 118L714 144Q724 149 735 145L732 114Z" fill="url(#g-skin2)"/><path d="M714 130Q724 136 733 130V138Q724 144 714 138Z" fill="#a8704c" opacity=".35"/>
    <path d="M717 70C706 70 699 78 699 88L699 94Q697.500 97.500 700 99.500L694 108Q694 111 697.500 111L699 111.500Q698 113.500 700 114.500Q696.500 116.500 700 118Q698 120 700 121Q700 125 704 126.500Q713 129 722 124L730 114C738 105 740 91 735 81C731 73 725 70 717 70Z" fill="url(#g-skin)"/>
    <path d="M722 124Q730 118 733 108" stroke="#b97c58" stroke-width="2" fill="none" opacity=".35"/><ellipse cx="707" cy="111" rx="5" ry="3.600" fill="#e89a8a" opacity=".22"/>
    <ellipse cx="727" cy="106" rx="3.400" ry="6" fill="#d9a07a"/><path d="M725.500 102Q729 106 726 111" stroke="#a8704c" stroke-width="1.200" fill="none"/>
    <path d="M700.500 97Q704 94 708.500 96.500Q704.500 99.800 700.500 97Z" fill="#fbf7f2"/><circle cx="703.800" cy="96.900" r="1.900" fill="#6b4524"/><circle cx="703.600" cy="96.800" r=".9" fill="#140a04"/><circle cx="703.100" cy="96.200" r=".5" fill="#fff"/>
    <path d="M700 96.800Q704.500 93 709 96" stroke="#2b1a0c" stroke-width="1.100" fill="none" stroke-linecap="round"/><path d="M699.500 92Q704.500 89 710.500 91" stroke="#5d3c1f" stroke-width="1.400" fill="none" stroke-linecap="round"/>
    <path d="M700.500 118.500Q703.500 117.500 705.500 119" stroke="#b3544f" stroke-width="1.500" fill="none" stroke-linecap="round"/><path d="M700.500 120.500Q703 122.500 705.500 120" stroke="#cf7a72" stroke-width="1.300" fill="none" stroke-linecap="round"/>`;
  const HAIR_LOOSE = `<path d="M699 87C698 72 708 66 719 67C733 68 742 78 742 96C744 118 742 144 746 172C738 179 730 176 726 166C727 150 727 134 725 118C723 108 722 98 714 90C708 85 703 84 699 87Z" fill="url(#g-hair)"/>
    <path d="M706 72Q718 66 732 74" stroke="#c19a64" stroke-width="2.600" fill="none" opacity=".6" stroke-linecap="round"/><path d="M737 88Q741 118 738 150M732 86Q736 118 732 154M742 108Q744 138 742 164" stroke="#35200f" stroke-width="1.200" fill="none" opacity=".4"/><path d="M739 98Q742 128 741 158" stroke="#b58a58" stroke-width="1.400" fill="none" opacity=".5"/>`;
  const HAIR_TIED = `<path d="M699 87C698 72 708 66 719 67C733 68 741 77 741 92C741 104 738 110 734 114C730 108 726 98 714 90C708 85 703 84 699 87Z" fill="url(#g-hair)"/><path d="M706 72Q718 66 731 74" stroke="#c19a64" stroke-width="2.400" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M738 86C752 84 764 108 760 138C758 152 754 160 749 165C750 148 749 126 741 106Z" fill="url(#g-hair)"/><path d="M749 98C757 114 758 136 754 156" stroke="#b58a58" stroke-width="1.400" fill="none" opacity=".55"/><path d="M745 108Q752 134 748 158" stroke="#35200f" stroke-width="1.100" fill="none" opacity=".4"/>
    <rect x="735" y="85" width="8" height="6" rx="2.600" fill="#2f6fd1" transform="rotate(25 739 88)"/>`;
  const GOGGLES = `<path d="M714 98L738 94" stroke="#1d3a78" stroke-width="3.800" stroke-linecap="round"/><path d="M714 96.800L738 92.800" stroke="#5f8be0" stroke-width="1" opacity=".7"/>
    <path d="M696 90L711 89Q715 90 715 94L715 102Q715 106.500 710.500 106.500L698.500 106.500Q694 106.500 694 102L694 94Q694 90 696 90Z" fill="#cfe9f7" fill-opacity=".28" stroke="#2f6fd1" stroke-width="2.600"/><path d="M697 92Q703 90 711 91" stroke="#fff" stroke-width="1.800" fill="none" opacity=".85" stroke-linecap="round"/>`;
  const HEAD = tied => `<g>${FACE}${tied ? HAIR_TIED + GOGGLES : HAIR_LOOSE}</g>`;

  const HAND = `<path d="M707 252C703 258 702 268 706 273C711 276 717 272 718 264L716 252Z" fill="url(#g-skin)"/><path d="M709 269Q713 272 716 266" stroke="#b97c58" stroke-width="1" fill="none" opacity=".6"/><path d="M704 260Q701 263 703 267" stroke="#e9c2a3" stroke-width="1.4" fill="none" opacity=".7"/>`;
  
  const TORSO_BAD = `<g>
    <path d="M710 188C708 210 706 232 705 252L718 254C719 232 720 210 724 188Z" fill="url(#g-skin)"/><path d="M707 206Q714 212 721 206" stroke="#b97c58" stroke-width="1.400" fill="none" opacity=".5"/>${HAND}
    <path d="M708 135Q698 142 697 156Q694 186 697 214Q698 232 697 246H741Q742 214 740 184Q741 156 737 144Q730 136 722 134Z" fill="url(#g-tee)"/>
    <path d="M708 135Q715 144 722 134" stroke="#1f7d72" stroke-width="2.600" fill="none"/>
    <path d="M700 196Q718 204 738 198M699 220Q718 228 738 222" stroke="#1f7d72" stroke-width="1.600" fill="none" opacity=".45"/><path d="M701 158Q700 192 702 222" stroke="#9af0e4" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
    <path d="M706 138C710 152 712 172 710 188L724 190C726 174 726 156 722 139Z" fill="url(#g-tee)"/><path d="M704 184Q714 190 724 186L725 194Q714 199 704 192Z" fill="#2a968a"/>
    </g>`;

  const SHORTS = `<path d="M697 238H741L743 298Q730 302 720 299L718 274L711 300Q702 303 694 298Z" fill="url(#g-den)"/><path d="M718 244V274M699 248H739" stroke="#2c4e72" stroke-width="1.400" opacity=".6"/><path d="M696 294Q705 298 712 296M722 296Q733 300 742 294" stroke="#aac8e2" stroke-width="1.200" fill="none" stroke-dasharray="2 2"/><path d="M700 252Q703 272 701 292" stroke="#fff" stroke-width="2" fill="none" opacity=".25" stroke-linecap="round"/>`;

  // Нозе со точни пропорции до подот (Y: 298 до 500)
  const LEG_BARE = (dx, far) => `<path d="M${704 + dx} 298C${702 + dx} 345 ${703 + dx} 400 ${705 + dx} 445C${706 + dx} 465 ${707 + dx} 482 ${708 + dx} 496L${718 + dx} 496C${719 + dx} 482 ${720 + dx} 465 ${722 + dx} 445C${724 + dx} 400 ${723 + dx} 345 ${721 + dx} 298Z" fill="url(#${far ? "g-skin2" : "g-skin"})"/>${far ? "" : `<path d="M${715 + dx} 350Q${720 + dx} 380 ${716 + dx} 420" stroke="#9b6040" stroke-width="3" fill="none" opacity=".15" filter="url(#f-b2)"/><path d="M707 306Q706 350 708 480" stroke="#fff" stroke-width="1.5" fill="none" opacity=".25" stroke-linecap="round"/>`}`;
  
  const SANDAL = `<path d="M704 495L703 499H687Q684 499 685 497Q686 495 694 494L704 495Z" fill="url(#g-skin)"/><path d="M692 497H700" stroke="#7b4a1c" stroke-width="2.2" stroke-linecap="round"/><path d="M685 499H721Q724 499 724 501Q724 503 721 503H686Q683 503 683 501Q683 499 685 499Z" fill="#a8672a"/><rect x="685" y="499" width="36" height="1.2" fill="#e3a766" opacity=".7"/>`;
  
  const LEGS_BAD = `<g>${LEG_BARE(3, true)}${LEG_BARE(-2, false)}${SANDAL}${SHORTS}</g>`;

  const TRS = (dx, far) => `<path d="M${702 + dx} 248C${701 + dx} 305 ${702 + dx} 390 ${704 + dx} 455C${705 + dx} 472 ${706 + dx} 488 ${707 + dx} 500L${719 + dx} 500C${720 + dx} 488 ${721 + dx} 472 ${722 + dx} 455C${724 + dx} 390 ${723 + dx} 305 ${721 + dx} 248Z" fill="url(#${far ? "g-trs2" : "g-trs"})"/>${far ? "" : `<path d="M${711 + dx} 350V488" stroke="#7b83a0" stroke-width="1.4" opacity=".4"/>`}`;
  
  const SHOE = `<path d="M686 501Q684 494 693 492L704 488L718 485Q722 489 721 501Z" fill="#23242b"/><path d="M687 497H721V502H685Q684 499 687 497Z" fill="#f2f2f0"/><path d="M694 490L700 492M698 488.5L704 490.5" stroke="#e9e9e9" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>`;
  
  const LEGS_GOOD = `<g>${TRS(3, true)}<g opacity=".9"><path d="M701 500H734V503.5H700Z" fill="#c9c9c6"/></g>${TRS(-2, false)}${SHOE}</g>`;
  
  const COAT_SLEEVE = `<path d="M706 138C702 150 700 168 701 188L698 252L716 254L718 192C719 174 720 156 720 140Z" fill="url(#g-coat)"/><path d="M706 140C703 166 703 202 701 248" stroke="#fff" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/><path d="M712 166Q711 202 712 250" stroke="#aab4bd" stroke-width="1.4" fill="none" opacity=".5"/><path d="M698 248L716 251L716 257L698 254Z" fill="#e3e9ee"/>`;
  
  const TORSO_GOOD = `<g>
    <path d="M708 135C700 140 698 150 697 162Q695 202 696 242Q694 292 693 342Q718 349 746 342Q747 292 746 242Q747 202 743 168Q742 148 736 141Q728 134 722 134Z" fill="url(#g-coat)"/>
    <path d="M697 164Q695 202 696 242Q694 292 693 342" stroke="#ffffff" stroke-width="2.600" fill="none" opacity=".65"/><path d="M742 166Q745 212 745 252Q746 292 745 340" stroke="#9aa6b1" stroke-width="3" fill="none" opacity=".35" filter="url(#f-b1)"/>
    <path d="M715 166Q713 252 714 344" stroke="#cfd7de" stroke-width="1.600" fill="none"/><path d="M728 172Q726 242 728 342" stroke="#b9c3cc" stroke-width="1.800" fill="none" opacity=".5"/><path d="M702 282Q716 288 735 282M700 314Q717 321 738 314" stroke="#c3ccd4" stroke-width="1.500" fill="none" opacity=".7"/>
    <rect x="706" y="272" width="18" height="24" rx="2" fill="none" stroke="#c4ccd4" stroke-width="1.500"/><path d="M714 274V296" stroke="#d3dae0" stroke-width=".8"/>
    <circle cx="699" cy="196" r="2" fill="#a9b4be"/><circle cx="698" cy="234" r="2" fill="#a9b4be"/><circle cx="697" cy="272" r="2" fill="#a9b4be"/><circle cx="696" cy="310" r="2" fill="#a9b4be"/>
    <path d="M706 134L698 148L712 166L722 138Z" fill="#f7f9fb" stroke="#c4ccd4" stroke-width="1.200" stroke-linejoin="round"/><path d="M716 136Q724 142 731 138L734 150L720 162Z" fill="#e6ebf0"/><path d="M707 136Q712 146 718 138" fill="#3a78c9"/>
    </g>${COAT_SLEEVE}${HAND}`;

  const H2SO4 = (x, rot) => bottle(x, 52, 30, 48, { c: "#6b3a1c", liq: "#a56a2a", label: "H₂SO₄", fs: 5.4, lc: "#9c1f18", stripe: "#d9422f", onShelf: 1, rot, level: .7 });
  const RAIL = `<rect x="424" y="92" width="3" height="8" fill="#7c8791"/><rect x="466" y="92" width="3" height="8" fill="#7c8791"/><rect x="424" y="92" width="45" height="2.6" rx="1.3" fill="url(#g-metal)"/>`;
  const warm = `<ellipse cx="150" cy="284" rx="86" ry="14" fill="#ff9a3a" opacity=".3" filter="url(#f-b3)"/>`;
  const VAPOR = `<path d="M204 240q-7 -9 0 -16t0 -14M214 238q-7 -9 0 -16t0 -14" stroke="#cfe6ee" stroke-width="2.600" fill="none" opacity=".5" stroke-linecap="round" filter="url(#f-b1)"/>`;
  const ETHANOL = open => bottle(192, 246, 32, 46, { c: "#e3eff3", liq: "#d4e9f0", label: "ЕТАНОЛ", fs: 5, lc: "#b3261e", stripe: "#d9422f", cap: "#c04f2f", open, level: .72 });

  const FOOD = `<g>${cast(300, 292, 36, .3)}
    <ellipse cx="292" cy="291" rx="34" ry="7.600" fill="#000" opacity=".3" filter="url(#f-b2)"/><ellipse cx="292" cy="289" rx="33" ry="7" fill="#f4f4f1"/><ellipse cx="292" cy="288.600" rx="26" ry="5" fill="#e4e4de"/><ellipse cx="292" cy="288" rx="33" ry="7" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
    <path d="M269 286Q268 279 276 279H308Q316 279 316 286Q316 289 312 289H273Q269 289 269 286Z" fill="#d6a85c"/><path d="M270 283H315" stroke="#a97a32" stroke-width="1" opacity=".5"/>
    <path d="M268 280Q276 275 284 279Q292 273 300 278Q308 274 317 280" stroke="#6fae4f" stroke-width="4.600" fill="none" stroke-linecap="round"/><path d="M270 276Q280 273 292 276Q304 272 315 276" stroke="#8cc86a" stroke-width="2" fill="none" opacity=".7"/>
    <ellipse cx="279" cy="277.500" rx="7" ry="2.300" fill="#d6453a"/><ellipse cx="296" cy="276.500" rx="7" ry="2.200" fill="#cf3c32"/><path d="M270 274H316L313 272H273Z" fill="#f0cf5a"/>
    <path d="M268 272Q268 261 291 261Q315 261 316 272Q316 275 312 275H272Q268 275 268 272Z" fill="url(#g-bread)"/><path d="M273 266Q290 261 308 266" stroke="#fff3c9" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
    <circle cx="330" cy="298" r="0" fill="none"/>
    <ellipse cx="328" cy="291" rx="13" ry="3" fill="#000" opacity=".35" filter="url(#f-b2)"/>
    <path d="M318 268H342L340 288Q340 291 336 291H324Q320 291 320 288Z" fill="url(#g-mug)"/><ellipse cx="330" cy="268" rx="12" ry="3.200" fill="#f1f1ee"/><ellipse cx="330" cy="268.600" rx="10.400" ry="2.500" fill="#5a3a1f"/><ellipse cx="327" cy="268" rx="4" ry="1" fill="#a97a4a" opacity=".6"/>
    <path d="M341 272Q349 272 349 279Q349 286 340 286" stroke="#e9e9e5" stroke-width="3.400" fill="none"/><path d="M341 272Q349 272 349 279" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/>
    <path d="M325 262q-4 -6 0 -11t0 -9M334 262q-4 -6 0 -11t0 -9" stroke="#fff" stroke-width="2.200" fill="none" opacity=".4" stroke-linecap="round" filter="url(#f-b1)"/>
    <circle cx="318" cy="293" r="1" fill="#d6a85c"/><circle cx="352" cy="294" r="1.100" fill="#d6a85c"/><circle cx="262" cy="293" r=".9" fill="#d6a85c"/></g>`;
  
  const FOOD_DEFS = `<defs>${lg("g-bread", 0, 0, 0, 1, [[0, "#e9c277"], [.6, "#d09a48"], [1, "#b97e30"]])}${lg("g-mug", 0, 0, 1, 0, [[0, "#c8cbcc"], [.3, "#ffffff"], [.7, "#f0f0ed"], [1, "#b2b6b8"]])}${lg("g-note", 0, 0, 1, 1, [[0, "#3c5fae"], [1, "#1f3875"]])}${lg("g-pen", 0, 0, 0, 1, [[0, "#ffe27a"], [.5, "#f2bf27"], [1, "#b88a10"]])}</defs>`;
  
  const NOTE = `<g>${FOOD_DEFS}${cast(296, 296, 30, .28)}<path d="M272 297L326 294L328 299L274 302Z" fill="#000" opacity=".3" filter="url(#f-b2)"/>
    <path d="M273 297L326 293.500L326.500 296.800L273.500 300.400Z" fill="#efeee6"/><path d="M273 298.200L326 294.700M273.300 299.300L326.300 295.800" stroke="#c9c7ba" stroke-width=".6"/>
    <path d="M270 288L320 284L327 293.500L273 297Z" fill="url(#g-note)"/><path d="M270 288L320 284" stroke="#8fa8e0" stroke-width="1" opacity=".7"/>
    <path d="M296 285.500L303 295" stroke="#142852" stroke-width="3.400" opacity=".6"/><rect x="283" y="290" width="20" height="3.600" rx=".8" fill="#e9e6d6" opacity=".8" transform="rotate(-4 293 292)"/>
    ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${272.400 + i * 1.100}" cy="${289.500 + i * 1.280}" rx="2.200" ry="1" fill="#c3c9d0" stroke="#7c8791" stroke-width=".5"/>`).join("")}
    <path d="M334 295L362 288" stroke="#000" stroke-width="3" opacity=".3" filter="url(#f-b1)" transform="translate(1 3)"/><path d="M334 293.500L359 287.200L362 288.200L336 296Z" fill="url(#g-pen)"/><path d="M334 293.800L359 287.500" stroke="#fff3b0" stroke-width=".8" opacity=".8"/><path d="M359 287.200L364 286L362 288.200Z" fill="#e6c79c"/><path d="M362.800 286.300L364 286L363.200 287.300Z" fill="#2b2b2b"/><path d="M334 293.500L330 294.800L331.600 297.200L336 296Z" fill="#e48aa0"/></g>`;

  const SPILL = `<g>${cast(400, 300, 34, .25)}
    <ellipse cx="440" cy="295" rx="34" ry="6" fill="#2f5a1a" opacity=".35" filter="url(#f-b2)"/>
    <defs>${lg("g-grn", 0, 0, 0, 1, [[0, "#b7ee8b", .9], [1, "#6fbf45", .95]])}</defs>
    <path d="M417 296Q420 290 440 290Q462 290 470 296Q468 301 450 301Q426 302 417 296Z" fill="url(#g-grn)"/><path d="M426 294Q440 291 458 294" stroke="#f1ffe2" stroke-width="1.600" fill="none" opacity=".8" stroke-linecap="round"/>
    <path d="M440 274Q444 284 441 292" stroke="url(#g-grn)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M439 276Q442 284 440 291" stroke="#e6ffd0" stroke-width="1" fill="none" opacity=".8"/>
    <path d="M463 299Q466 306 464 314Q462 322 465 330" stroke="#79c84d" stroke-width="5.600" fill="none" stroke-linecap="round" opacity=".92"/><path d="M462 302Q464 310 463 318" stroke="#d8ffbd" stroke-width="1.400" fill="none" opacity=".8" stroke-linecap="round"/><ellipse cx="465" cy="332" rx="3.600" ry="4.600" fill="#79c84d"/><ellipse cx="464" cy="331" rx="1" ry="1.600" fill="#e9ffd6"/></g>`;
  
  const UNLABELED = `${SPILL}${bottle(380, 238, 30, 46, { c: "#8a5a2b", liq: "#b27a3c", open: true, rot: 75, level: .35 })}`;

  const HEATER = (good) => `<g>${cast(496, 292, 46, .3)}${contact(496, 292, 50, .5)}
    <defs>${lg("g-hbody", 0, 0, 0, 1, [[0, "#555d66"], [.2, "#363c43"], [1, "#171a1e"]])}${lg("g-hplate", 0, 0, 1, 0, [[0, "#6c7681"], [.3, "#c4ccd3"], [.6, "#8a949e"], [1, "#4c555e"]])}${rg("g-led", .5, .5, .5, [[0, good ? "#ff8a7a" : "#9dffa8"], [1, good ? "#d62d20" : "#1fb34a"]])}</defs>
    <ellipse cx="496" cy="272.400" rx="46" ry="4.200" fill="url(#g-hplate)"/><ellipse cx="496" cy="271.800" rx="40" ry="3" fill="url(#g-hbody)" opacity=".5"/>
    <rect x="450" y="272" width="92" height="19" rx="4" fill="url(#g-hbody)"/><rect x="451" y="272.600" width="90" height="1.800" rx=".9" fill="#fff" opacity=".28"/><rect x="450" y="287" width="92" height="4" rx="2" fill="#000" opacity=".35"/>
    <path d="M488 280h22M488 283h22M488 286h22" stroke="#000" stroke-width="1" opacity=".5"/>
    <circle cx="468" cy="281" r="5.200" fill="#1b1e22"/><circle cx="468" cy="281" r="4.200" fill="#d6892e"/><path d="M468 277.400v3.600" stroke="#fff" stroke-width="1.200"/><circle cx="467" cy="279.500" r="1.200" fill="#fff" opacity=".6"/>
    <circle cx="524" cy="281" r="3.200" fill="url(#g-led)"/><circle cx="524" cy="281" r="7" fill="${good ? "#d62d20" : "#32d062"}" opacity=".25" filter="url(#f-b1)"/></g>`;
  
  const CABLE_BAD = `<g>
    <path d="M542 282C568 286 572 302 562 324C554 344 550 362 553 397" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(6 4)"/>
    <path d="M542 282C568 286 572 302 562 324C554 344 550 362 553 397" stroke="#14171b" stroke-width="3.800" fill="none" stroke-linecap="round"/><path d="M542 281C567 285 571 301 561 323C553 343 549 361 552 396" stroke="#6b7480" stroke-width="1" fill="none" opacity=".6" stroke-linecap="round"/>
    <defs>${lg("g-pud", 0, 0, 0, 1, [[0, "#d9f0fb", .8], [1, "#8cc4e4", .85]])}</defs>
    <ellipse cx="553" cy="404" rx="42" ry="9.400" fill="#1a2a35" opacity=".22" filter="url(#f-b2)"/><ellipse cx="553" cy="402" rx="40" ry="8.600" fill="url(#g-pud)"/><ellipse cx="553" cy="402" rx="40" ry="8.600" fill="none" stroke="#fff" stroke-width="1.400" opacity=".7"/>
    <path d="M526 400Q540 396 552 399" stroke="#fff" stroke-width="2.200" fill="none" opacity=".85" stroke-linecap="round"/><path d="M566 405Q576 404 582 401" stroke="#fff" stroke-width="1.400" fill="none" opacity=".6" stroke-linecap="round"/><ellipse cx="553" cy="399" rx="9" ry="2.200" fill="none" stroke="#fff" stroke-width=".9" opacity=".7"/>
    <path d="M556 388l-4 7h5l-4 8" stroke="#fff6a8" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round" filter="url(#f-b1)"/><path d="M556 388l-4 7h5l-4 8" stroke="#ffe44d" stroke-width="1" fill="none" stroke-linejoin="round" stroke-linecap="round"/></g>`;
  
  const CABLE_GOOD = `<g><path d="M581 266C579 276 562 281 542 282" stroke="#000" stroke-width="4.600" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(2 4)"/><path d="M581 266C579 276 562 281 542 282" stroke="#14171b" stroke-width="3.600" fill="none" stroke-linecap="round"/><path d="M581 265C579 275 562 280 542 281" stroke="#6b7480" stroke-width=".9" fill="none" opacity=".6"/>
    <rect x="572" y="247" width="20" height="19" rx="3.600" fill="#000" opacity=".3" filter="url(#f-b1)" transform="translate(1.500 2.500)"/><rect x="572" y="247" width="20" height="19" rx="3.600" fill="#e9e7e1" stroke="#b3ae9c" stroke-width="1"/><rect x="574" y="249" width="16" height="4" rx="2" fill="#fff" opacity=".7"/><rect x="577" y="261" width="8" height="7" rx="1.600" fill="#d9d6cc"/></g>`;

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
  
  const BOXES = `<g>${contact(78, 292, 60, .5)}<ellipse cx="78" cy="250" rx="52" ry="48" fill="#000" opacity=".18" filter="url(#f-b4)" transform="translate(16 6)"/>
    ${box(32, 238, 82, 54, { d: 14, label: "КРХКО" })}${box(40, 194, 68, 44, { d: 12, rot: -2 })}${box(50, 156, 56, 38, { d: 10, rot: 5, label: "КРХКО" })}</g>`;

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
    { id: "polica", ...T("polica"), hot: [478, 50, 72, 66], hotGood: [418, 52, 60, 62], bad: H2SO4(514, 12), good: H2SO4(428, 0) + RAIL },
    { id: "aparat", ...T("aparat"), hot: [24, 138, 96, 156], hotGood: [24, 138, 86, 150], bad: BOXES, good: "" },
    { id: "etanol", ...T("etanol"), hot: [96, 184, 150, 112], hotGood: [96, 196, 150, 100], bad: warm + FLAME(150, 248) + ETHANOL(true) + VAPOR + `<ellipse cx="238" cy="293" rx="8" ry="2.600" fill="#c04f2f"/><ellipse cx="238" cy="291.600" rx="8" ry="2.600" fill="#e0643f"/>`, good: ETHANOL(false) },
    { id: "hrana", ...T("hrana"), hot: [258, 246, 98, 52], hotGood: [262, 252, 104, 54], bad: FOOD, good: NOTE },
    { id: "bezetiketa", ...T("bezetiketa"), hot: [372, 246, 108, 92], hotGood: [372, 240, 50, 56], bad: UNLABELED, good: bottle(380, 246, 30, 46, { c: "#a9c3cf", liq: "#ead9a0", label: "HCl 1M", fs: 5.4, cap: "#1b1b1b", level: .55 }) },
    { id: "kabel", ...T("kabel"), hot: [532, 282, 84, 130], hotGood: [440, 246, 150, 48], bad: HEATER(false) + CABLE_BAD, good: HEATER(true) + CABLE_GOOD },
    { id: "rabot", ...T("rabot"), hot: [626, 254, 48, 52], hotGood: [598, 250, 44, 44], bad: beaker(634, 262, 30, 36, { rot: 9 }), good: beaker(604, 254, 30, 36) },
    { id: "torba", ...T("torba"), hot: [124, 420, 160, 78], hotGood: null, bad: BAG, good: null },
    { id: "staklo", ...T("staklo"), hot: [282, 456, 130, 44], hotGood: null, bad: GLASS, good: null },
    { id: "ocila", ...T("ocila"), hot: [690, 70, 76, 112], hotGood: [690, 70, 76, 112], fig: true, bad: HEAD(false), good: HEAD(true) },
    { id: "mantil", ...T("mantil"), hot: [690, 134, 62, 110], hotGood: [690, 134, 62, 214], fig: true, bad: TORSO_BAD, good: TORSO_GOOD },
    { id: "chevli", ...T("chevli"), hot: [686, 244, 62, 256], hotGood: [686, 350, 62, 150], fig: true, bad: LEGS_BAD, good: LEGS_GOOD },
  ];
  
  const SAFE = [
    { name: "Прва помош", hot: [554, 142, 66, 52], ok: "Кутијата за прва помош е на видливо и достапно место: ова е во ред." },
    { name: "Затворени шишиња на полица", hot: [270, 56, 134, 58], ok: "Затворени и означени шишиња на полица со раб: ова е во ред." },
    { name: "Прозорец", hot: [88, 4, 180, 160], ok: "Прозорецот обезбедува светлина и проветрување: ова е во ред." },
    { name: "Периоден систем", hot: [330, 122, 128, 54], ok: "Постерот со периодниот систем е на ѕидот за брза проверка: ова е во ред." },
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
