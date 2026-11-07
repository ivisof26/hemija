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
    <clipPath id="c-top"><path d="M44 326H648L664 360H28Z"/></clipPath>
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

  // ---------- СОДРИНА И ИДЕАЛНА ВИСИНА НА МАСАТА (Y: 326) ----------
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
    <g><rect x="572" y="272" width="18" height="18" rx="3" fill="#000" opacity=".22" filter="url(#f-b1)" transform="translate(1.5 2)"/><rect x="572" y="272" width="18" height="18" rx="3" fill="#f4f2ec" stroke="#bdb8a8" stroke-width="1"/><circle cx="578" cy="281" r="1.7" fill="#3a3a3a"/><circle cx="584" cy="281" r="1.7" fill="#3a3a3a"/></g>
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
    <rect x="26" y="326" width="640" height="54" fill="url(#g-door)"/>
    <rect x="26" y="326" width="640" height="54" fill="url(#g-cabsh)"/>
    ${[38, 238, 438].map((x, i) => `<g><rect x="${x}" y="333" width="${i === 2 ? 204 : 190}" height="38" rx="2.5" fill="url(#g-door)" stroke="#7c8893" stroke-width="1.6"/><rect x="${x + 1}" y="334" width="${(i === 2 ? 204 : 190) - 2}" height="1.6" fill="#fff" opacity=".6"/><rect x="${x + (i === 2 ? 86 : 80)}" y="340" width="34" height="4" rx="2" fill="url(#g-metal)"/><rect x="${x + (i === 2 ? 86 : 80)}" y="344" width="34" height="1.6" rx="0.8" fill="#000" opacity=".25"/></g>`).join("")}
    <rect x="26" y="380" width="640" height="8" fill="#2c3238"/><rect x="26" y="380" width="640" height="1.6" fill="#59636c"/>
    <rect x="22" y="386" width="652" height="14" fill="#000" opacity=".34" filter="url(#f-b3)"/>
    <!-- маса: плоча -->
    <path d="M44 326H648L664 360H28Z" fill="url(#g-top)"/>
    <path d="M44 326H648L664 360H28Z" fill="url(#g-topsheen)"/>
    <path d="M44 326H648L664 360H28Z" filter="url(#f-grain)" opacity=".22"/>
    <path d="M28 360H664V365H28Z" fill="url(#g-edge)"/><path d="M28 360H664" stroke="#fff" stroke-width="1.4" opacity=".85"/><path d="M28 365H664" stroke="#000" stroke-width="1" opacity=".3"/>
    <path d="M44 326H648" stroke="#7c8791" stroke-width="1.4" opacity=".6"/>
    <!-- под -->
    <rect y="360" width="800" height="140" fill="url(#g-floor)"/>
    <rect y="360" width="800" height="140" fill="url(#g-flight)"/>
    <g stroke="#8f8878" stroke-width="1.4" opacity=".75" fill="none">
      <path d="M0 372H800M0 392H800M0 418H800M0 452H800"/>
      ${[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(k => `<path d="M${400 + k * 44} 360L${400 + k * 150} 500"/>`).join("")}</g>
    <g stroke="#fff" stroke-width="1" opacity=".35" fill="none"><path d="M0 373.5H800M0 393.5H800M0 419.5H800M0 453.5H800"/></g>
    <rect y="360" width="800" height="16" fill="url(#g-cabsh)" opacity=".7"/>`;

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
    ${cast(150, 312, 20, .32)}${contact(150, 312, 24, .55)}
    <path d="M160 310q22 4 38 -2t34 6" stroke="#0a120d" stroke-width="7" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(0 4)"/>
    <path d="M160 308q22 4 38 -2t34 6" stroke="url(#g-hose)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M160 306q22 4 38 -2t34 6" stroke="#9ec0ab" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>
    <ellipse cx="150" cy="310" rx="22" ry="5.4" fill="url(#g-metal)"/><ellipse cx="150" cy="308" rx="20" ry="4.6" fill="#8a96a1"/><ellipse cx="150" cy="306.4" rx="12" ry="3" fill="#cdd5dc"/>
    <rect x="145" y="268" width="10" height="40" rx="1.6" fill="url(#g-metal)"/><rect x="142" y="288" width="16" height="9" rx="1.6" fill="url(#g-brass)"/><path d="M142 292h16" stroke="#000" stroke-width=".8" opacity=".35"/>
    <ellipse cx="150" cy="268" rx="5.4" ry="1.7" fill="#2a2f35"/><ellipse cx="150" cy="267.6" rx="4" ry="1.1" fill="#0b0e11"/>
    ${refl(`<rect x="145" y="268" width="10" height="40" fill="#aab4bd"/><rect x="142" y="288" width="16" height="9" fill="#b48a30"/>`, 310, .28)}`;

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
  //  УЧЕНИЧКА: Совршени природни пропорции (висина од глава до пети: 380px)
  //  Главата е на Y: 110, Рамената на Y: 180, Базата е на Y: 500
  // ======================================================================
  const SKIN = () => `${lg("g-skin", 0, 0, 1, 0, [[0, "#f5d2b4"], [.55, "#e8b995"], [1, "#c98d68"]])}${lg("g-skin2", 0, 0, 1, 0, [[0, "#e6ba98"], [1, "#b97c58"]])}`;
  const HEAD_DEFS = `<defs>${SKIN()}${lg("g-hair", 0, 0, 1, 0, [[0, "#8a5c33"], [.5, "#6a4223"], [1, "#3b2210"]])}${lg("g-coat", 0, 0, 1, 0, [[0, "#ffffff"], [.55, "#eef2f5"], [1, "#c3ccd4"]])}${lg("g-coat2", 0, 0, 1, 0, [[0, "#f4f7f9"], [1, "#b7c1ca"]])}${lg("g-tee", 0, 0, 1, 0, [[0, "#5ed1c1"], [.55, "#35a799"], [1, "#1f7d72"]])}${lg("g-den", 0, 0, 1, 0, [[0, "#7ea6cb"], [.55, "#557fa8"], [1, "#35597e"]])}${lg("g-trs", 0, 0, 1, 0, [[0, "#5d647c"], [.5, "#444a60"], [1, "#2a2e3f"]])}${lg("g-trs2", 0, 0, 1, 0, [[0, "#3b4054"], [1, "#1f2230"]])}</defs>`;
  
  const FACE = `<path d="M712 142L714 168Q724 173 735 169L732 138Z" fill="url(#g-skin2)"/><path d="M714 154Q724 160 733 154V162Q724 168 714 162Z" fill="#a8704c" opacity=".35"/>
    <path d="M717 94C706 94 699 102 699 112L699 118Q697.5 121.5 700 123.5L694 132Q694 135 697.5 135L699 135.5Q698 137.5 700 138.5Q696.5 140.5 700 142Q698 144 700 145Q700 149 704 150.5Q713 153 722 148L730 138C738 129 740 115 735 105C731 97 725 94 717 94Z" fill="url(#g-skin)"/>
    <path d="M722 148Q730 142 733 132" stroke="#b97c58" stroke-width="2" fill="none" opacity=".35"/><ellipse cx="707" cy="135" rx="5" ry="3.6" fill="#e89a8a" opacity=".22"/>
    <ellipse cx="727" cy="130" rx="3.4" ry="6" fill="#d9a07a"/><path d="M725.5 126Q729 130 726 135" stroke="#a8704c" stroke-width="1.2" fill="none"/>
    <path d="M700.5 121Q704 118 708.5 120.5Q704.5 123.8 700.5 121Z" fill="#fbf7f2"/><circle cx="703.8" cy="120.9" r="1.9" fill="#6b4524"/><circle cx="703.6" cy="120.8" r=".9" fill="#140a04"/><circle cx="703.1" cy="120.2" r=".5" fill="#fff"/>
    <path d="M700 120.8Q704.5 117 709 120" stroke="#2b1a0c" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M699.5 116Q704.5 113 710.5 115" stroke="#5d3c1f" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M700.5 142.5Q703.5 141.5 705.5 143" stroke="#b3544f" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M700.5 144.5Q703 146.5 705.5 144" stroke="#cf7a72" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  const HAIR_LOOSE = `<path d="M699 111C698 96 708 90 719 91C733 92 742 102 742 120C744 142 742 168 746 196C738 203 730 200 726 190C727 174 727 158 725 142C723 132 722 122 714 114C708 109 703 108 699 111Z" fill="url(#g-hair)"/>
    <path d="M706 96Q718 90 732 98" stroke="#c19a64" stroke-width="2.6" fill="none" opacity=".6" stroke-linecap="round"/><path d="M737 112Q741 142 738 174M732 110Q736 142 732 178M742 132Q744 162 742 188" stroke="#35200f" stroke-width="1.2" fill="none" opacity=".4"/><path d="M739 122Q742 152 741 182" stroke="#b58a58" stroke-width="1.4" fill="none" opacity=".5"/>`;
  const HAIR_TIED = `<path d="M699 111C698 96 708 90 719 91C733 92 741 101 741 116C741 128 738 134 734 138C730 132 726 122 714 114C708 109 703 108 699 111Z" fill="url(#g-hair)"/><path d="M706 96Q718 90 731 98" stroke="#c19a64" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M738 110C752 108 764 132 760 162C758 176 754 184 749 189C750 172 749 150 741 130Z" fill="url(#g-hair)"/><path d="M749 122C757 138 758 160 754 180" stroke="#b58a58" stroke-width="1.4" fill="none" opacity=".55"/><path d="M745 132Q752 158 748 182" stroke="#35200f" stroke-width="1.1" fill="none" opacity=".4"/>
    <rect x="735" y="109" width="8" height="6" rx="2.6" fill="#2f6fd1" transform="rotate(25 739 112)"/>`;
  const GOGGLES = `<path d="M714 122L738 118" stroke="#1d3a78" stroke-width="3.8" stroke-linecap="round"/><path d="M714 120.8L738 116.8" stroke="#5f8be0" stroke-width="1" opacity=".7"/>
    <path d="M696 114L711 113Q715 114 715 118L715 126Q715 130.5 710.5 130.5L698.5 130.5Q694 130.5 694 126L694 118Q694 114 696 114Z" fill="#cfe9f7" fill-opacity=".28" stroke="#2f6fd1" stroke-width="2.6"/><path d="M697 116Q703 114 711 115" stroke="#fff" stroke-width="1.8" fill="none" opacity=".85" stroke-linecap="round"/>`;
  const HEAD = tied => `<g>${FACE}${tied ? HAIR_TIED + GOGGLES : HAIR_LOOSE}</g>`;

  const HAND = `<path d="M707 276C703 282 702 292 706 297C711 300 717 296 718 288L716 276Z" fill="url(#g-skin)"/><path d="M709 293Q713 296 716 290" stroke="#b97c58" stroke-width="1" fill="none" opacity=".6"/><path d="M704 284Q701 287 703 291" stroke="#e9c2a3" stroke-width="1.4" fill="none" opacity=".7"/>`;
  
  const TORSO_BAD = `<g>
    <path d="M710 212C708 234 706 256 705 276L718 278C719 256 720 234 724 212Z" fill="url(#g-skin)"/><path d="M707 230Q714 236 721 230" stroke="#b97c58" stroke-width="1.4" fill="none" opacity=".5"/>${HAND}
    <path d="M708 159Q698 166 697 180Q694 210 697 238Q698 256 697 270H741Q742 238 740 208Q741 180 737 168Q730 160 722 158Z" fill="url(#g-tee)"/>
    <path d="M708 159Q715 168 722 158" stroke="#1f7d72" stroke-width="2.6" fill="none"/>
    <path d="M700 220Q718 228 738 222M699 244Q718 252 738 246" stroke="#1f7d72" stroke-width="1.6" fill="none" opacity=".45"/><path d="M701 182Q700 216 702 246" stroke="#9af0e4" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
    <path d="M706 162C710 176 712 196 710 212L724 214C726 198 726 180 722 163Z" fill="url(#g-tee)"/><path d="M704 208Q714 214 724 210L725 218Q714 223 704 216Z" fill="#2a968a"/>
    </g>`;

  const SHORTS = `<path d="M697 262H741L743 322Q730 326 720 323L718 298L711 324Q702 327 694 322Z" fill="url(#g-den)"/><path d="M718 268V298M699 272H739" stroke="#2c4e72" stroke-width="1.4" opacity=".6"/><path d="M696 318Q705 322 712 320M722 320Q733 324 742 318" stroke="#aac8e2" stroke-width="1.2" fill="none" stroke-dasharray="2 2"/><path d="M700 276Q703 296 701 316" stroke="#fff" stroke-width="2" fill="none" opacity=".25" stroke-linecap="round"/>`;

  // Нозе со точни природни пропорции (од Y: 322 до 500)
  const LEG_BARE = (dx, far) => `<path d="M${704 + dx} 322C${702 + dx} 370 ${703 + dx} 420 ${705 + dx} 455C${706 + dx} 472 ${707 + dx} 488 ${708 + dx} 496L${718 + dx} 496C${719 + dx} 488 ${720 + dx} 472 ${722 + dx} 455C${724 + dx} 420 ${723 + dx} 370 ${721 + dx} 322Z" fill="url(#${far ? "g-skin2" : "g-skin"})"/>${far ? "" : `<path d="M${715 + dx} 360Q${720 + dx} 390 ${716 + dx} 440" stroke="#9b6040" stroke-width="3" fill="none" opacity=".15" filter="url(#f-b2)"/><path d="M707 330Q706 380 708 480" stroke="#fff" stroke-width="1.5" fill="none" opacity=".25" stroke-linecap="round"/>`}`;
  
  const SANDAL = `<path d="M704 495L703 499H687Q684 499 685 497Q686 495 694 494L704 495Z" fill="url(#g-skin)"/><path d="M692 497H700" stroke="#7b4a1c" stroke-width="2.2" stroke-linecap="round"/><path d="M685 499H721Q724 499 724 501Q724 503 721 503H686Q683 503 683 501Q683 499 685 499Z" fill="#a8672a"/><rect x="685" y="499" width="36" height="1.2" fill="#e3a766" opacity=".7"/>`;
  
  const LEGS_BAD = `<g>${LEG_BARE(3, true)}${LEG_BARE(-2, false)}${SANDAL}${SHORTS}</g>`;

  const TRS = (dx, far) => `<path d="M${702 + dx} 272C${701 + dx} 325 ${702 + dx} 405 ${704 + dx} 462C${705 + dx} 478 ${706 + dx} 490 ${707 + dx} 500L${719 + dx} 500C${720 + dx} 490 ${721 + dx} 478 ${722 + dx} 462C${724 + dx} 405 ${723 + dx} 325 ${721 + dx} 272Z" fill="url(#${far ? "g-trs2" : "g-trs"})"/>${far ? "" : `<path d="M${711 + dx} 360V488" stroke="#7b83a0" stroke-width="1.4" opacity=".4"/>`}`;
  
  const SHOE = `<path d="M686 501Q684 494 693 492L704 488L718 485Q722 489 721 501Z" fill="#23242b"/><path d="M687 497H721V502H685Q684 499 687 497Z" fill="#f2f2f0"/><path d="M694 490L700 492M698 488.5L704 490.5" stroke="#e9e9e9" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>`;
  
  const LEGS_GOOD = `<g>${TRS(3, true)}<g opacity=".9"><path d="M701 500H734V503.5H700Z" fill="#c9c9c6"/></g>${TRS(-2, false)}${SHOE}</g>`;
  
  const COAT_SLEEVE = `<path d="M706 162C702 174 700 192 701 212L698 276L716 278L718 216C719 198 720 180 720 164Z" fill="url(#g-coat)"/><path d="M706 164C703 190 703 226 701 272" stroke="#fff" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/><path d="M712 190Q711 226 712 274" stroke="#aab4bd" stroke-width="1.4" fill="none" opacity=".5"/><path d="M698 272L716 275L716 281L698 278Z" fill="#e3e9ee"/>`;
  
  const TORSO_GOOD = `<g>
    <path d="M708 159C700 164 698 174 697 186Q695 226 696 266Q694 316 693 366Q718 373 746 366Q747 316 746 266Q747 226 743 192Q742 172 736 165Q728 158 722 158Z" fill="url(#g-coat)"/>
    <path d="M697 188Q695 226 696 266Q694 316 693 366" stroke="#ffffff" stroke-width="2.6" fill="none" opacity=".65"/><path d="M742 190Q745 236 745 276Q746 316 745 364" stroke="#9aa6b1" stroke-width="3" fill="none" opacity=".35" filter="url(#f-b1)"/>
    <path d="M715 190Q713 276 714 368" stroke="#cfd7de" stroke-width="1.6" fill="none"/><path d="M728 196Q726 266 728 366" stroke="#b9c3cc" stroke-width="1.8" fill="none" opacity=".5"/><path d="M702 306Q716 312 735 306M700 338Q717 345 738 338" stroke="#c3ccd4" stroke-width="1.5" fill="none" opacity=".7"/>
    <rect x="706" y="296" width="18" height="24" rx="2" fill="none" stroke="#c4ccd4" stroke-width="1.5"/><path d="M714 298V320" stroke="#d3dae0" stroke-width=".8"/>
    <circle cx="699" cy="220" r="2" fill="#a9b4be"/><circle cx="698" cy="258" r="2" fill="#a9b4be"/><circle cx="697" cy="296" r="2" fill="#a9b4be"/><circle cx="696" cy="334" r="2" fill="#a9b4be"/>
    <path d="M706 158L698 172L712 190L722 162Z" fill="#f7f9fb" stroke="#c4ccd4" stroke-width="1.2" stroke-linejoin="round"/><path d="M716 160Q724 166 731 162L734 174L720 186Z" fill="#e6ebf0"/><path d="M707 160Q712 170 718 162" fill="#3a78c9"/>
    </g>${COAT_SLEEVE}${HAND}`;

  const H2SO4 = (x, rot) => bottle(x, 76, 30, 48, { c: "#6b3a1c", liq: "#a56a2a", label: "H₂SO₄", fs: 5.4, lc: "#9c1f18", stripe: "#d9422f", onShelf: 1, rot, level: .7 });
  const RAIL = `<rect x="424" y="116" width="3" height="8" fill="#7c8791"/><rect x="466" y="116" width="3" height="8" fill="#7c8791"/><rect x="424" y="116" width="45" height="2.6" rx="1.3" fill="url(#g-metal)"/>`;
  const warm = `<ellipse cx="150" cy="308" rx="86" ry="14" fill="#ff9a3a" opacity=".3" filter="url(#f-b3)"/>`;
  const VAPOR = `<path d="M204 264q-7 -9 0 -16t0 -14M214 262q-7 -9 0 -16t0 -14" stroke="#cfe6ee" stroke-width="2.6" fill="none" opacity=".5" stroke-linecap="round" filter="url(#f-b1)"/>`;
  const ETHANOL = open => bottle(192, 270, 32, 46, { c: "#e3eff3", liq: "#d4e9f0", label: "ЕТАНОЛ", fs: 5, lc: "#b3261e", stripe: "#d9422f", cap: "#c04f2f", open, level: .72 });

  const FOOD = `<g>${cast(300, 316, 36, .3)}
    <ellipse cx="292" cy="315" rx="34" ry="7.6" fill="#000" opacity=".3" filter="url(#f-b2)"/><ellipse cx="292" cy="313" rx="33" ry="7" fill="#f4f4f1"/><ellipse cx="292" cy="312.6" rx="26" ry="5" fill="#e4e4de"/><ellipse cx="292" cy="312" rx="33" ry="7" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
    <path d="M269 310Q268 303 276 303H308Q316 303 316 310Q316 313 312 313H273Q269 313 269 310Z" fill="#d6a85c"/><path d="M270 307H315" stroke="#a97a32" stroke-width="1" opacity=".5"/>
    <path d="M268 304Q276 299 284 303Q292 297 300 302Q308 298 317 304" stroke="#6fae4f" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M270 300Q280 297 292 300Q304 296 315 300" stroke="#8cc86a" stroke-width="2" fill="none" opacity=".7"/>
    <ellipse cx="279" cy="301.5" rx="7" ry="2.3" fill="#d6453a"/><ellipse cx="296" cy="300.5" rx="7" ry="2.2" fill="#cf3c32"/><path d="M270 298H316L313 296H273Z" fill="#f0cf5a"/>
    <path d="M268 296Q268 285 291 285Q315 285 316 296Q316 299 312 299H272Q268 299 268 296Z" fill="url(#g-bread)"/><path d="M273 290Q290 285 308 290" stroke="#fff3c9" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
    <circle cx="330" cy="322" r="0" fill="none"/>
    <ellipse cx="328" cy="315" rx="13" ry="3" fill="#000" opacity=".35" filter="url(#f-b2)"/>
    <path d="M318 292H342L340 312Q340 315 336 315H324Q320 315 320 312Z" fill="url(#g-mug)"/><ellipse cx="330" cy="292" rx="12" ry="3.2" fill="#f1f1ee"/><ellipse cx="330" cy="292.6" rx="10.4" ry="2.5" fill="#5a3a1f"/><ellipse cx="327" cy="292" rx="4" ry="1" fill="#a97a4a" opacity=".6"/>
    <path d="M341 296Q349 296 349 303Q349 310 340 310" stroke="#e9e9e5" stroke-width="3.4" fill="none"/><path d="M341 296Q349 296 349 303" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/>
    <path d="M325 286q-4 -6 0 -11t0 -9M334 286q-4 -6 0 -11t0 -9" stroke="#fff" stroke-width="2.2" fill="none" opacity=".4" stroke-linecap="round" filter="url(#f-b1)"/>
    <circle cx="318" cy="317" r="1" fill="#d6a85c"/><circle cx="352" cy="318" r="1.1" fill="#d6a85c"/><circle cx="262" cy="317" r=".9" fill="#d6a85c"/></g>`;
  
  const FOOD_DEFS = `<defs>${lg("g-bread", 0, 0, 0, 1, [[0, "#e9c277"], [.6, "#d09a48"], [1, "#b97e30"]])}${lg("g-mug", 0, 0, 1, 0, [[0, "#c8cbcc"], [.3, "#ffffff"], [.7, "#f0f0ed"], [1, "#b2b6b8"]])}${lg("g-note", 0, 0, 1, 1, [[0, "#3c5fae"], [1, "#1f3875"]])}${lg("g-pen", 0, 0, 0, 1, [[0, "#ffe27a"], [.5, "#f2bf27"], [1, "#b88a10"]])}</defs>`;
  
  const NOTE = `<g>${FOOD_DEFS}${cast(296, 320, 30, .28)}<path d="M272 321L326 318L328 323L274 326Z" fill="#000" opacity=".3" filter="url(#f-b2)"/>
    <path d="M273 321L326 317.5L326.5 320.8L273.5 324.4Z" fill="#efeee6"/><path d="M273 322.2L326 318.7M273.3 323.3L326.3 319.8" stroke="#c9c7ba" stroke-width=".6"/>
    <path d="M270 312L320 308L327 317.5L273 321Z" fill="url(#g-note)"/><path d="M270 312L320 308" stroke="#8fa8e0" stroke-width="1" opacity=".7"/>
    <path d="M296 309.5L303 319" stroke="#142852" stroke-width="3.4" opacity=".6"/><rect x="283" y="314" width="20" height="3.6" rx=".8" fill="#e9e6d6" opacity=".8" transform="rotate(-4 293 316)"/>
    ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${272.4 + i * 1.1}" cy="${313.5 + i * 1.28}" rx="2.2" ry="1" fill="#c3c9d0" stroke="#7c8791" stroke-width=".5"/>`).join("")}
    <path d="M334 319L362 312" stroke="#000" stroke-width="3" opacity=".3" filter="url(#f-b1)" transform="translate(1 3)"/><path d="M334 317.5L359 311.2L362 312.2L336 320Z" fill="url(#g-pen)"/><path d="M334 317.8L359 311.5" stroke="#fff3b0" stroke-width=".8" opacity=".8"/><path d="M359 311.2L364 310L362 312.2Z" fill="#e6c79c"/><path d="M362.8 310.3L364 310L363.2 311.3Z" fill="#2b2b2b"/><path d="M334 317.5L330 318.8L331.6 321.2L336 320Z" fill="#e48aa0"/></g>`;

  const SPILL = `<g>${cast(400, 324, 34, .25)}
    <ellipse cx="440" cy="319" rx="34" ry="6" fill="#2f5a1a" opacity=".35" filter="url(#f-b2)"/>
    <defs>${lg("g-grn", 0, 0, 0, 1, [[0, "#b7ee8b", .9], [1, "#6fbf45", .95]])}</defs>
    <path d="M417 320Q420 314 440 314Q462 314 470 320Q468 325 450 325Q426 326 417 320Z" fill="url(#g-grn)"/><path d="M426 318Q440 315 458 318" stroke="#f1ffe2" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/>
    <path d="M440 298Q444 308 441 316" stroke="url(#g-grn)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M439 300Q442 308 440 315" stroke="#e6ffd0" stroke-width="1" fill="none" opacity=".8"/>
    <path d="M463 323Q466 330 464 338Q462 346 465 354" stroke="#79c84d" stroke-width="5.6" fill="none" stroke-linecap="round" opacity=".92"/><path d="M462 326Q464 334 463 342" stroke="#d8ffbd" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round"/><ellipse cx="465" cy="356" rx="3.6" ry="4.6" fill="#79c84d"/><ellipse cx="464" cy="355" rx="1" ry="1.6" fill="#e9ffd6"/></g>`;
  
  const UNLABELED = `${SPILL}${bottle(380, 262, 30, 46, { c: "#8a5a2b", liq: "#b27a3c", open: true, rot: 75, level: .35 })}`;

  const HEATER = (good) => `<g>${cast(496, 316, 46, .3)}${contact(496, 316, 50, .5)}
    <defs>${lg("g-hbody", 0, 0, 0, 1, [[0, "#555d66"], [.2, "#363c43"], [1, "#171a1e"]])}${lg("g-hplate", 0, 0, 1, 0, [[0, "#6c7681"], [.3, "#c4ccd3"], [.6, "#8a949e"], [1, "#4c555e"]])}${rg("g-led", .5, .5, .5, [[0, good ? "#ff8a7a" : "#9dffa8"], [1, good ? "#d62d20" : "#1fb34a"]])}</defs>
    <ellipse cx="496" cy="296.4" rx="46" ry="4.2" fill="url(#g-hplate)"/><ellipse cx="496" cy="295.8" rx="40" ry="3" fill="url(#g-hbody)" opacity=".5"/>
    <rect x="450" y="296" width="92" height="19" rx="4" fill="url(#g-hbody)"/><rect x="451" y="296.6" width="90" height="1.8" rx=".9" fill="#fff" opacity=".28"/><rect x="450" y="311" width="92" height="4" rx="2" fill="#000" opacity=".35"/>
    <path d="M488 304h22M488 307h22M488 310h22" stroke="#000" stroke-width="1" opacity=".5"/>
    <circle cx="468" cy="305" r="5.2" fill="#1b1e22"/><circle cx="468" cy="305" r="4.2" fill="#d6892e"/><path d="M468 301.4v3.6" stroke="#fff" stroke-width="1.2"/><circle cx="467" cy="303.5" r="1.2" fill="#fff" opacity=".6"/>
    <circle cx="524" cy="305" r="3.2" fill="url(#g-led)"/><circle cx="524" cy="305" r="7" fill="${good ? "#d62d20" : "#32d062"}" opacity=".25" filter="url(#f-b1)"/></g>`;
  
  const CABLE_BAD = `<g>
    <path d="M542 306C568 310 572 326 562 348C554 368 550 386 553 421" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(6 4)"/>
    <path d="M542 306C568 310 572 326 562 348C554 368 550 386 553 421" stroke="#14171b" stroke-width="3.8" fill="none" stroke-linecap="round"/><path d="M542 305C567 309 571 325 561 347C553 367 549 385 552 420" stroke="#6b7480" stroke-width="1" fill="none" opacity=".6" stroke-linecap="round"/>
    <defs>${lg("g-pud", 0, 0, 0, 1, [[0, "#d9f0fb", .8], [1, "#8cc4e4", .85]])}</defs>
    <ellipse cx="553" cy="428" rx="42" ry="9.4" fill="#1a2a35" opacity=".22" filter="url(#f-b2)"/><ellipse cx="553" cy="426" rx="40" ry="8.6" fill="url(#g-pud)"/><ellipse cx="553" cy="426" rx="40" ry="8.6" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/>
    <path d="M526 424Q540 420 552 423" stroke="#fff" stroke-width="2.2" fill="none" opacity=".85" stroke-linecap="round"/><path d="M566 429Q576 428 582 425" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/><ellipse cx="553" cy="423" rx="9" ry="2.2" fill="none" stroke="#fff" stroke-width=".9" opacity=".7"/>
    <path d="M556 412l-4 7h5l-4 8" stroke="#fff6a8" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round" filter="url(#f-b1)"/><path d="M556 412l-4 7h5l-4 8" stroke="#ffe44d" stroke-width="1" fill="none" stroke-linejoin="round" stroke-linecap="round"/></g>`;
  
  const CABLE_GOOD = `<g><path d="M581 290C579 300 562 305 542 306" stroke="#000" stroke-width="4.6" fill="none" stroke-linecap="round" opacity=".35" filter="url(#f-b2)" transform="translate(2 4)"/><path d="M581 290C579 300 562 305 542 306" stroke="#14171b" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M581 289C579 299 562 304 542 305" stroke="#6b7480" stroke-width=".9" fill="none" opacity=".6"/>
    <rect x="572" y="271" width="20" height="19" rx="3.6" fill="#000" opacity=".3" filter="url(#f-b1)" transform="translate(1.5 2.5)"/><rect x="572" y="271" width="20" height="19" rx="3.6" fill="#e9e7e1" stroke="#b3ae9c" stroke-width="1"/><rect x="574" y="273" width="16" height="4" rx="2" fill="#fff" opacity=".7"/><rect x="577" y="285" width="8" height="7" rx="1.6" fill="#d9d6cc"/></g>`;

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
  
  const BOXES = `<g>${contact(78, 316, 60, .5)}<ellipse cx="78" cy="274" rx="52" ry="48" fill="#000" opacity=".18" filter="url(#f-b4)" transform="translate(16 6)"/>
    ${box(32, 262, 82, 54, { d: 14, label: "КРХКО" })}${box(40, 218, 68, 44, { d: 12, rot: -2 })}${box(50, 180, 56, 38, { d: 10, rot: 5, label: "КРХКО" })}</g>`;

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
    { id: "etanol", ...T("etanol"), hot: [96, 208, 150, 112], hotGood: [96, 220, 150, 100], bad: warm + FLAME(150, 272) + ETHANOL(true) + VAPOR + `<ellipse cx="238" cy="317" rx="8" ry="2.6" fill="#c04f2f"/><ellipse cx="238" cy="315.6" rx="8" ry="2.6" fill="#e0643f"/>`, good: ETHANOL(false) },
    { id: "hrana", ...T("hrana"), hot: [258, 282, 98, 52], hotGood: [262, 288, 104, 54], bad: FOOD, good: NOTE },
    { id: "bezetiketa", ...T("bezetiketa"), hot: [372, 270, 108, 92], hotGood: [372, 264, 50, 56], bad: UNLABELED, good: bottle(380, 270, 30, 46, { c: "#a9c3cf", liq: "#ead9a0", label: "HCl 1M", fs: 5.4, cap: "#1b1b1b", level: .55 }) },
    { id: "kabel", ...T("kabel"), hot: [532, 306, 84, 130], hotGood: [440, 272, 150, 48], bad: HEATER(false) + CABLE_BAD, good: HEATER(true) + CABLE_GOOD },
    { id: "rabot", ...T("rabot"), hot: [626, 286, 48, 52], hotGood: [598, 278, 44, 44], bad: beaker(634, 286, 30, 36, { rot: 9 }), good: beaker(604, 278, 30, 36) },
    { id: "torba", ...T("torba"), hot: [124, 420, 160, 78], hotGood: null, bad: BAG, good: null },
    { id: "staklo", ...T("staklo"), hot: [282, 456, 130, 44], hotGood: null, bad: GLASS, good: null },
    { id: "ocila", ...T("ocila"), hot: [690, 94, 76, 112], hotGood: [690, 94, 76, 112], fig: true, bad: HEAD(false), good: HEAD(true) },
    { id: "mantil", ...T("mantil"), hot: [690, 158, 62, 110], hotGood: [690, 158, 62, 214], fig: true, bad: TORSO_BAD, good: TORSO_GOOD },
    { id: "chevli", ...T("chevli"), hot: [686, 268, 62, 256], hotGood: [686, 374, 62, 150], fig: true, bad: LEGS_BAD, good: LEGS_GOOD },
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
