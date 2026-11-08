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
    ${lg("g-tank", 0, 0, 1, 0, [[0, "#3e7058"], [.3, "#6da68b"], [.7, "#4f856d"], [1, "#294d3c"]])}
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

  const BASE = `
    <rect width="800" height="500" fill="url(#g-wall)"/>
    <rect width="800" height="392" filter="url(#f-plaster)" opacity=".4"/>
    <rect width="800" height="392" fill="url(#g-wlight)"/>
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
    <!-- кутија за прва помош -->
    <g><rect x="563" y="151" width="54" height="40" rx="5" fill="#000" opacity=".28" filter="url(#f-b2)" transform="translate(3 5)"/>
      <rect x="560" y="146" width="54" height="40" rx="5" fill="#f7f8f6"/><rect x="560" y="146" width="54" height="40" rx="5" fill="none" stroke="#c3cbc6" stroke-width="1.4"/>
      <rect x="560" y="146" width="54" height="9" rx="5" fill="#fff" opacity=".7"/><path d="M587 155v22M576 166h22" stroke="#1f9a56" stroke-width="7" stroke-linecap="round"/><path d="M587 155v22" stroke="#46c27f" stroke-width="2" opacity=".6"/>
      <rect x="581" y="181" width="12" height="3.4" rx="1.7" fill="#aab3ad"/></g>
    
    <!-- Точен ISO Знак за ПП апарат (десно горе) -->
    <g transform="translate(710, 30)">
      <rect x="0" y="0" width="70" height="70" fill="#a21d11"/>
      <rect x="2" y="2" width="66" height="66" fill="#c4291b"/>
      <rect x="14" y="20" width="16" height="32" rx="2" fill="#ffffff"/>
      <rect x="18" y="14" width="8" height="6" fill="#ffffff"/>
      <path d="M22 14c4 0 7 3 7 6" stroke="#ffffff" stroke-width="2.5" fill="none"/>
      <path d="M42 54c-5 0-9-4-9-9c0-6 5-10 7-18c2 8 7 12 7 18c0 5-4 9-7 9z" fill="#ffffff"/>
    </g>

    <!-- БЛОКИРАН ПП АПАРАТ СО КУТИИ (ГРЕШКА) на десната страна -->
    <g transform="translate(640, 190)">
      <rect x="20" y="30" width="70" height="60" fill="#c49a62" stroke="#8a6338" stroke-width="1.5"/>
      <path d="M20 30 L35 15 L105 15 L90 30 Z" fill="#d4aa72"/>
      <path d="M90 30 L105 15 L105 75 L90 90 Z" fill="#9f7743"/>
      <text x="55" y="65" font-family="Arial" font-size="9" fill="#222" font-weight="bold" text-anchor="middle">ХЕМИКАЛИИ</text>
      
      <rect x="50" y="-20" width="65" height="55" fill="#b88d55" stroke="#7a552b" stroke-width="1.5"/>
      <path d="M50 -20 L65 -32 L130 -32 L115 -20 Z" fill="#c99f68"/>
      <path d="M115 -20 L130 -32 L130 23 L115 35 Z" fill="#8c6537"/>
      <text x="82" y="10" font-family="Arial" font-size="8" fill="#fff" font-weight="bold" text-anchor="middle">СТАКЛО</text>
    </g>

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

  const SHELF = bottle(282, 64, 26, 46, { c: "#3a8f58", label: "NaCl", fs: 6, onShelf: 1, level: .5 }) + bottle(327, 71, 24, 39, { c: "#c98428", label: "KI", fs: 6, onShelf: 1, level: .5 }) + bottle(367, 63, 26, 47, { c: "#4d73b8", label: "H₂O", fs: 6, onShelf: 1, level: .55 });

  svg.innerHTML = DEFS + BASE + SHELF + FX;
})();
