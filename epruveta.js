// ---------- заедничка епрувета (SVG) ----------
// Геометрија (viewBox 40 14 200 414): пипета над епруветата, епрувета што минува низ дрвен држач.
const GEO = { cx: 140, tip: 160, mouth: 186, surf: 262, bot: 356, base: 377 };

function buildTube(svg, P) {
  const i = n => P + "-" + n;
  const { mouth, surf, bot, base } = GEO;
  svg.setAttribute("viewBox", "40 14 200 414");
  svg.innerHTML = `
  <defs>
    <clipPath id="${i("clip")}"><path d="M122.2 ${mouth} V${bot} A17.8 17.8 0 0 0 157.8 ${bot} V${mouth} Z"/></clipPath>
    <linearGradient id="${i("glassg")}" x1="0" x2="1">
      <stop offset="0" stop-color="#9dbbd4" stop-opacity=".5"/><stop offset=".18" stop-color="#ffffff" stop-opacity=".25"/>
      <stop offset=".5" stop-color="#ffffff" stop-opacity=".03"/><stop offset=".82" stop-color="#ffffff" stop-opacity=".12"/>
      <stop offset="1" stop-color="#8fb0cc" stop-opacity=".5"/>
    </linearGradient>
    <linearGradient id="${i("sheen")}" x1="0" x2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".25" stop-color="#fff" stop-opacity=".2"/>
      <stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/>
    </linearGradient>
    <linearGradient id="${i("depth")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#0a1840" stop-opacity=".3"/>
    </linearGradient>
    <linearGradient id="${i("gasg")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a0522d" stop-opacity=".32"/><stop offset="1" stop-color="#a0522d" stop-opacity=".92"/>
    </linearGradient>
    <linearGradient id="${i("rubber")}" x1="0" x2="1">
      <stop offset="0" stop-color="#6e1f06"/><stop offset=".3" stop-color="#d9531a"/><stop offset=".6" stop-color="#b8400f"/><stop offset="1" stop-color="#5c1904"/>
    </linearGradient>
    <linearGradient id="${i("pglass")}" x1="0" x2="1">
      <stop offset="0" stop-color="#8fa6bd" stop-opacity=".8"/><stop offset=".3" stop-color="#fff" stop-opacity=".8"/>
      <stop offset=".7" stop-color="#eef6fb" stop-opacity=".4"/><stop offset="1" stop-color="#8fa6bd" stop-opacity=".8"/>
    </linearGradient>
    <linearGradient id="${i("metal")}" x1="0" x2="1">
      <stop offset="0" stop-color="#4a3b4e"/><stop offset=".35" stop-color="#9a8a9e"/><stop offset="1" stop-color="#3b2d3f"/>
    </linearGradient>
    <linearGradient id="${i("wood")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfa56d"/><stop offset="1" stop-color="#94693b"/>
    </linearGradient>
    <linearGradient id="${i("woodv")}" x1="0" x2="1">
      <stop offset="0" stop-color="#8f6538"/><stop offset=".5" stop-color="#bf935c"/><stop offset="1" stop-color="#8a6034"/>
    </linearGradient>
    <filter id="${i("blur")}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="${i("blur2")}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4"/></filter>
  </defs>

  <!-- држач: страници, подлога и горна полица (позади епруветата) -->
  <g id="${i("rackback")}">
  <ellipse cx="140" cy="${base + 14}" rx="68" ry="5" fill="#2d1b4e" opacity=".16"/>
  <rect x="82" y="224" width="8" height="${base - 224}" fill="url(#${i("woodv")})"/>
  <rect x="190" y="224" width="8" height="${base - 224}" fill="url(#${i("woodv")})"/>
  <rect x="76" y="${base}" width="128" height="12" rx="4" fill="url(#${i("wood")})"/>
  <rect x="76" y="${base}" width="128" height="2" rx="1" fill="#fff" opacity=".25"/>
  <path d="M88 215 H192 L202 222 H78 Z" fill="#d9b684"/>
  <ellipse cx="140" cy="218.5" rx="21" ry="3.2" fill="#5e4122" opacity=".75"/>
  </g>

  <g id="${i("tube")}">
    <g id="${i("body")}" style="transform-origin:140px ${bot + 20}px">
      <g clip-path="url(#${i("clip")})">
        <rect id="${i("liquid")}" x="110" y="${surf}" width="60" height="140" fill="#b9d9ef" fill-opacity=".85"/>
        <rect x="110" y="${surf}" width="60" height="140" fill="url(#${i("depth")})"/>
        <rect id="${i("layer")}" x="110" y="${bot - 22}" width="60" height="60" fill="#fff" opacity="0"/>
        <rect id="${i("ring")}" x="110" y="${surf + 24}" width="60" height="9" fill="#7a4a22" opacity="0" filter="url(#${i("blur")})"/>
        <rect id="${i("turb")}" x="110" y="${surf}" width="60" height="140" fill="#fff" opacity="0"/>
        <g id="${i("ppt")}"></g>
        <rect id="${i("gas")}" x="110" y="${mouth}" width="60" height="${surf - mouth}" fill="url(#${i("gasg")})" opacity="0" filter="url(#${i("blur")})"/>
        <g id="${i("bubbles")}"></g>
        <rect x="110" y="${mouth}" width="60" height="${surf - mouth + 140}" fill="url(#${i("sheen")})"/>
      </g>
      <!-- површина на течноста -->
      <ellipse cx="140" cy="${surf}" rx="17.8" ry="2.6" fill="#fff" fill-opacity=".4" stroke="#4d7ba0" stroke-opacity=".55" stroke-width=".9"/>
      <!-- стакло -->
      <path d="M120 ${mouth} V${bot} A20 20 0 0 0 160 ${bot} V${mouth} Z" fill="url(#${i("glassg")})"/>
      <path d="M120 ${mouth} V${bot} A20 20 0 0 0 160 ${bot} V${mouth}" fill="none" stroke="#7f9bb5" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M122.2 ${mouth + 6} V${bot} A17.8 17.8 0 0 0 157.8 ${bot} V${mouth + 6}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".9"/>
      <!-- обрач -->
      <ellipse cx="140" cy="${mouth}" rx="22" ry="3.8" fill="#fff" fill-opacity=".14" stroke="#7f9bb5" stroke-width="2.2"/>
      <ellipse cx="140" cy="${mouth}" rx="18" ry="2.6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>
      <!-- одблесоци -->
      <path d="M125 ${mouth + 14} V${bot - 6}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>
      <path d="M126 ${bot + 10} q2 9 9 14" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".5"/>
      <path d="M155 ${mouth + 20} V${surf + 30}" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".35"/>
    </g>

    <!-- предна страна на полицата: епруветата минува низ неа -->
    <rect x="78" y="222" width="124" height="12" rx="2.5" fill="url(#${i("wood")})"/>
    <rect x="78" y="222" width="124" height="1.8" fill="#fff" opacity=".3"/>
    <rect x="78" y="232" width="124" height="2" fill="#5e4122" opacity=".35"/>

    <!-- гас што се прелева преку работ (NO₂ е потежок од воздухот) -->
    <g id="${i("fume")}" filter="url(#${i("blur2")})"></g>

    <!-- ПИПЕТА: мало гумено балонче, стаклена цевка -->
    <g id="${i("dropper")}">
      <g id="${i("bulbg")}" style="transform-origin:140px 56px">
        <path d="M134 56 C132 50 131.5 42 132 35 C132.5 28 147.5 28 148 35 C148.5 42 148 50 146 56 Z" fill="url(#${i("rubber")})"/>
        <path d="M135.5 48 C134.5 43 134.5 38 136 33" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".45"/>
      </g>
      <rect x="133" y="55" width="14" height="7" rx="2" fill="#5c1904"/>
      <rect x="134" y="55.8" width="12" height="1.4" rx=".7" fill="#fff" opacity=".2"/>
      <path d="M134.5 62 h11 l-2.3 9 h-6.4 z" fill="url(#${i("pglass")})" stroke="#8fa6bd" stroke-width="1" stroke-linejoin="round"/>
      <path d="M137.2 71 H142.8 V135 L140.8 150 L140.7 160 H139.3 L139.2 150 L137.2 135 Z" fill="url(#${i("pglass")})" stroke="#8fa6bd" stroke-width="1" stroke-linejoin="round"/>
      <path id="${i("pipliq")}" d="M138.2 104 H141.8 V135 L140.4 152 H139.6 L138.2 135 Z" fill="#b9d9ef" fill-opacity=".9"/>
      <path d="M138.4 75 V131" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".9"/>
    </g>

    <g id="${i("drops")}"></g>
    <text id="${i("label")}" x="140" y="418" text-anchor="middle" font-size="20" font-weight="800" fill="#2d1b4e"></text>
  </g>

  <!-- пламен: Бунзенов пламеник -->
  <g id="${i("flamescene")}" style="display:none" transform="translate(-14 -6) scale(1.1)">
    <defs>
      <linearGradient id="${i("fg-out")}" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#9ec5ff" stop-opacity=".25"/>
        <stop offset=".25" id="${i("fg-s1")}" stop-color="#f5c518" stop-opacity=".55"/>
        <stop offset=".7" id="${i("fg-s2")}" stop-color="#f5c518" stop-opacity=".85"/>
        <stop offset="1" id="${i("fg-s3")}" stop-color="#f5c518" stop-opacity=".25"/>
      </linearGradient>
      <linearGradient id="${i("fg-in")}" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#2358ff" stop-opacity=".95"/>
        <stop offset=".55" stop-color="#6aa2ff" stop-opacity=".9"/>
        <stop offset="1" stop-color="#d6e6ff" stop-opacity=".55"/>
      </linearGradient>
      <radialGradient id="${i("fg-glow")}" cx=".5" cy=".55" r=".5">
        <stop offset="0" id="${i("fg-g1")}" stop-color="#f5c518" stop-opacity=".45"/>
        <stop offset="1" id="${i("fg-g2")}" stop-color="#f5c518" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${i("fg-barrel")}" x1="0" x2="1">
        <stop offset="0" stop-color="#3b2d3f"/><stop offset=".3" stop-color="#b9afbd"/><stop offset=".55" stop-color="#7d7081"/><stop offset="1" stop-color="#2f2433"/>
      </linearGradient>
      <filter id="${i("fg-blur")}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
      <filter id="${i("fg-blur2")}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <ellipse cx="140" cy="341" rx="52" ry="6" fill="#2d1b4e" opacity=".18"/>
    <!-- гумено црево за гас -->
    <path d="M172 335 C200 335 206 321 232 325 C252 328 262 338 300 334" fill="none" stroke="#3f7a55" stroke-width="7" stroke-linecap="butt"/>
    <path d="M172 333.3 C200 333.3 206 319.3 232 323.3 C252 326.3 262 336.3 300 332.3" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.6"/>
    <rect x="164" y="330" width="10" height="10" rx="2" fill="#5b4d60"/>
    <rect x="173" y="331.5" width="5" height="7" rx="1.5" fill="#2f2433"/>
    <!-- сјај околу пламенот -->
    <ellipse id="${i("flame-glow")}" cx="140" cy="215" rx="62" ry="92" fill="url(#${i("fg-glow")})" filter="url(#${i("fg-blur2")})" opacity="0"/>
    <!-- пламеник -->
    <rect x="124" y="296" width="32" height="36" rx="3" fill="url(#${i("fg-barrel")})"/>
    <rect x="127" y="298" width="3" height="32" rx="1.5" fill="#fff" opacity=".35"/>
    <rect x="121" y="284" width="38" height="14" rx="3" fill="#5b4d60"/>
    <rect x="121" y="284" width="38" height="3" rx="1.5" fill="#fff" opacity=".25"/>
    <rect x="121" y="304" width="38" height="9" rx="2.5" fill="#2f2433"/>
    <ellipse cx="140" cy="308.5" rx="9" ry="3" fill="#0b0710"/>
    <path d="M106 340 Q106 330 124 330 H156 Q174 330 174 340 Z" fill="url(#${i("fg-barrel")})"/>
    <rect x="102" y="338" width="76" height="7" rx="3.5" fill="#3b2d3f"/>
    <!-- пламен: надворешен конус (боја на јонот), внатрешен син конус -->
    <path id="${i("flame-out")}" d="M140 286 C112 270 108 232 124 196 C130 182 136 170 140 150 C144 170 150 182 156 196 C172 232 168 270 140 286 Z" fill="url(#${i("fg-out")})" filter="url(#${i("fg-blur")})" style="transform-box:fill-box;transform-origin:50% 100%"/>
    <path id="${i("flame-mid")}" d="M140 286 C122 274 120 246 130 222 C134 212 138 204 140 192 C142 204 146 212 150 222 C160 246 158 274 140 286 Z" fill="url(#${i("fg-out")})" opacity=".9" style="transform-box:fill-box;transform-origin:50% 100%"/>
    <path id="${i("flame-in")}" d="M140 286 C128 276 128 258 134 244 C137 238 139 232 140 224 C141 232 143 238 146 244 C152 258 152 276 140 286 Z" fill="url(#${i("fg-in")})" style="transform-box:fill-box;transform-origin:50% 100%"/>
    <ellipse cx="140" cy="285" rx="9" ry="3" fill="#7fb0ff" opacity=".9"/>
    <!-- жичка (нихром) со проба -->
    <g id="${i("flame-wire")}">
      <path d="M232 138 L176 200 L160 218" fill="none" stroke="#8a8090" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="156" cy="222" rx="7" ry="5" transform="rotate(-48 156 222)" fill="none" stroke="#b9afbd" stroke-width="2"/>
      <circle id="${i("flame-bead")}" cx="156" cy="222" r="4" fill="#f5c518"/>
    </g>
    <text x="140" y="360" text-anchor="middle" font-size="15" font-weight="700" fill="#6b5b6e">проба на пламен</text>
  </g>`;
}

// Виртуелна лабораторија: епрувета со јон + реагенс.
// Една логика за два модула: катјони (податоци во reakcii.js) и анјони (податоци во anjoni-data.js).
// initLab(P, D): P = префикс на id-јата во HTML (ep / an), D = податоци и текстови за модулот.
function initLab(P, D) {
  const $ = id => document.getElementById(id);
  const catBox = $(P + "-cations");
  if (!catBox) return;
  buildTube($(P + "-svg"), P);
  const root = $("at-panel-" + P) || document;
  const KATJONI = D.ions, GRUPI = D.groups, REAGENSI = D.reag, REAKCII = D.reactions, N = D.t;
  const reagBox = $(P + "-reagents"), info = $(P + "-info"), svg = $(P + "-svg");
  const liquid = $(P + "-liquid"), turb = $(P + "-turb"), pptG = $(P + "-ppt"), bubG = $(P + "-bubbles");
  const dropsG = $(P + "-drops"), tubeScene = $(P + "-tube"), flameScene = $(P + "-flamescene");
  const layerEl = $(P + "-layer"), ringEl = $(P + "-ring"), fumeG = $(P + "-fume"), bodyG = $(P + "-body");
  const pipLiq = $(P + "-pipliq"), bulbG = $(P + "-bulbg"), gasEl = $(P + "-gas"), gasG = $(P + "-gasg");
  const flameOut = $(P + "-flame-out"), flameMid = $(P + "-flame-mid"), flameIn = $(P + "-flame-in"), flameGlow = $(P + "-flame-glow"), flameBead = $(P + "-flame-bead"), rackBack = $(P + "-rackback"), label = $(P + "-label");
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = ms => (reduce ? Math.min(ms, 60) : ms);

  const NS = "http://www.w3.org/2000/svg";
  const WATER = "#b9d9ef";
  const { surf, mouth, bot, tip } = GEO;
  let cat = null, rg = null, cur = null, token = 0, reacted = false, timers = [];

  // режим „непознат раствор“
  const learnBox = $(P + "-learn"), quizSetup = $(P + "-quizsetup"), quizBox = $(P + "-quiz"), rgHead = $(P + "-rg-h");
  const modeBtns = root.querySelectorAll(".ep-mode"), grpSel = $(P + "-group-sel"), newBtn = $(P + "-new");
  let mode = "learn", unknown = null, log = [], answers = {}, sel = "", done = false, lastId = null;

  const find = (i, r) => REAKCII.find(x => x.ion === i && x.r === r);
  const later = (fn, ms) => { const t = token; timers.push(setTimeout(() => { if (t === token) fn(); }, T(ms))); };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---------- избор на катјон ----------
  const order = D.order;
  const catBtns = {};
  order.forEach(g => {
    const wrap = el("div", "ep-group");
    wrap.appendChild(el("div", "ep-group-t", GRUPI[g].name));
    const row = el("div", "ep-chips");
    KATJONI.filter(k => k.group === g).forEach(k => {
      const b = el("button", "ep-cat", k.ion);
      b.type = "button";
      b.title = k.name;
      b.addEventListener("click", () => pickCat(k.id));
      row.appendChild(b);
      catBtns[k.id] = b;
    });
    wrap.appendChild(row);
    catBox.appendChild(wrap);
  });

  function pickCat(id) {
    cat = KATJONI.find(k => k.id === id);
    rg = null;
    Object.keys(catBtns).forEach(k => catBtns[k].classList.toggle("active", k === id));
    buildReagents();
    resetTube();
    info.replaceChildren(
      el("p", "ep-hint", `Во епруветата е растворот на ${cat.ion} (${cat.name}). Избери реагенс за да го додадеш.`),
      el("p", "ep-hint small", `${GRUPI[cat.group].name}. ${GRUPI[cat.group].hint}.`)
    );
  }

  function buildReagents() {
    reagBox.replaceChildren();
    (D.reagentsFor ? D.reagentsFor(cat) : GRUPI[cat.group].reagents).forEach(r => {
      const x = find(cat.id, r);
      const b = el("button", "ep-rg" + (x ? "" : " muted") + (x && x.star ? " star" : ""));
      b.type = "button";
      b.dataset.r = r;
      b.append(el("span", "ep-rg-f", REAGENSI[r].label + (x && x.star ? " ★" : "")), el("span", "ep-rg-n", REAGENSI[r].name));
      b.addEventListener("click", () => react(r));
      reagBox.appendChild(b);
    });
  }

  // ---------- епрувета ----------
  function baseColor() { return cat && cat.sol ? [cat.sol, 0.92] : [WATER, 0.85]; }
  function setLiquid(color, op) { liquid.style.fill = color; liquid.style.fillOpacity = op; }

  function resetTube() {
    token++; timers.forEach(clearTimeout); timers = [];
    pptG.replaceChildren(); bubG.replaceChildren(); dropsG.replaceChildren();
    turb.style.opacity = 0;
    [layerEl, ringEl, gasEl].forEach(e => { e.getAnimations().forEach(a => a.cancel()); e.style.opacity = 0; });
    fumeG.replaceChildren();
    tubeScene.style.display = ""; flameScene.style.display = "none"; rackBack.style.display = "";
    const [c, o] = baseColor();
    setLiquid(c, o);
    label.textContent = mode === "quiz" ? (unknown ? "?" : "") : (cat ? cat.ion : "");
    cur = null; reacted = false;
    root.querySelectorAll(".ep-rg").forEach(b => b.classList.remove("active"));
  }

  function drops(color, n, done) {
    pipLiq.style.fill = color;
    for (let i = 0; i < n; i++) {
      const delay = T(i * 380);
      // балончето се стиска и капката се издува на врвот на пипетата
      bulbG.animate([{ transform: "scale(1,1)" }, { transform: "scale(1.1,.86)" }, { transform: "scale(1,1)" }], { duration: T(300), delay, easing: "ease-in-out" });
      const c = sv("circle", { cx: 140, cy: tip + 3, r: 2.4, fill: color, stroke: "#6f9bc2", "stroke-width": 0.7 });
      c.style.transformBox = "fill-box"; c.style.transformOrigin = "50% 0%";
      dropsG.appendChild(c);
      const a = c.animate([
        { transform: "translateY(0) scale(.2)", opacity: 0 },
        { transform: "translateY(0) scale(1)", opacity: 1, offset: 0.3 },
        { transform: `translateY(${surf - tip - 5}px) scale(1,1.15)`, opacity: 1 }],
        { duration: T(620), delay, easing: "cubic-bezier(.5,0,.9,.6)", fill: "both" });
      a.onfinish = () => { c.remove(); ripple(); };
    }
    later(() => { pipLiq.style.fill = WATER; done(); }, n * 380 + 660);
  }
  function ripple() {
    const r = sv("ellipse", { cx: 140, cy: surf + 1, rx: 2, ry: 0.7, fill: "none", stroke: "#ffffff", "stroke-width": 0.9 });
    r.style.transformBox = "fill-box"; r.style.transformOrigin = "center";
    dropsG.appendChild(r);
    const a = r.animate([{ transform: "scale(1)", opacity: 0.9 }, { transform: "scale(8,3)", opacity: 0 }], { duration: T(600) });
    a.onfinish = () => r.remove();
  }

  function precipitate(hex, stages) {
    const N = 80, parts = [];
    turb.style.fill = hex;
    turb.style.opacity = 0;
    turb.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.2 }, { opacity: 0.1 }], { duration: T(4200), fill: "forwards" });
    for (let i = 0; i < N; i++) {
      const r = rnd(1.3, 2.9);
      const y1 = rnd(bot - 10, bot + 16);                                   // каде паѓа
      const hw = y1 > bot ? Math.sqrt(Math.max(0, 17.8 * 17.8 - (y1 - bot) ** 2)) : 17.8;
      const x1 = rnd(140 - hw + r, 140 + hw - r);
      const x0 = rnd(124, 156), y0 = rnd(surf + 8, bot - 20);
      const c = sv("circle", { cx: x0, cy: y0, r, fill: hex, stroke: "rgba(0,0,0,.18)", "stroke-width": 0.6 });
      c.style.transition = "fill 1.2s";
      c.style.opacity = 0;
      pptG.appendChild(c);
      parts.push(c);
      const dur = rnd(2400, 4400), delay = rnd(0, 900);
      c.animate([{ transform: "translate(0,0)", opacity: 0 }, { opacity: 0.95, offset: 0.12 }, { transform: `translate(${x1 - x0}px,${y1 - y0}px)`, opacity: 1 }],
        { duration: T(dur), delay: T(delay), easing: "cubic-bezier(.3,.1,.5,1)", fill: "forwards" });
    }
    if (stages && stages.length > 1) {
      stages.slice(1).forEach((col, k) => later(() => { parts.forEach(c => (c.style.fill = col)); turb.style.fill = col; }, 1800 + k * 2200));
    }
    return parts;
  }

  function bubbles(n, tint) {
    for (let i = 0; i < n; i++) {
      const c = sv("circle", { cx: rnd(124, 156), cy: bot + 6, r: rnd(1, 2.4), fill: tint || "rgba(255,255,255,.75)", "fill-opacity": tint ? 0.45 : 1, stroke: "rgba(255,255,255,.95)", "stroke-width": 0.6 });
      bubG.appendChild(c);
      c.animate([{ transform: "translateY(0)", opacity: 0 }, { opacity: 1, offset: 0.1 }, { transform: `translateY(${-rnd(bot - surf - 20, bot - surf)}px)`, opacity: 0 }],
        { duration: T(rnd(1400, 2400)), delay: T(rnd(0, 1800)), iterations: 3, fill: "backwards" });
    }
  }

  function layerAnim(x) {
    layerEl.style.fill = x.hex;
    bodyG.animate([{ transform: "rotate(0)" }, { transform: "rotate(-4deg)" }, { transform: "rotate(4deg)" }, { transform: "rotate(-3deg)" }, { transform: "rotate(2deg)" }, { transform: "rotate(0)" }],
      { duration: T(1100) });
    turb.style.fill = x.hex;
    turb.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.35 }, { opacity: 0 }], { duration: T(1800) });
    layerEl.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 0, offset: 0.45 }, { opacity: 0.93, transform: "translateY(0)" }],
      { duration: T(2400), fill: "forwards", easing: "ease-out" });
  }
  function ringAnim(x) {
    ringEl.style.fill = x.hex;
    ringEl.animate([{ opacity: 0, transform: "translateY(6px) scaleY(.4)" }, { opacity: 0.95, transform: "translateY(0) scaleY(1)" }],
      { duration: T(2200), fill: "forwards", easing: "ease-out" });
  }
  function fumes(col) {
    // 1) гасот го исполнува горниот дел од епруветата (густ при течноста, редок кон отворот)
    [...gasG.children].forEach(st => st.setAttribute("stop-color", col));
    // гасот се создава во растворот и се дига нагоре: слојот расте од површината кон отворот
    gasEl.style.transformBox = "fill-box"; gasEl.style.transformOrigin = "50% 100%";
    gasEl.animate([{ transform: "scaleY(.04)", opacity: 0 }, { transform: "scaleY(.2)", opacity: 1, offset: 0.12 }, { transform: "scaleY(1)", opacity: 1 }],
      { duration: T(5400), delay: T(400), fill: "forwards", easing: "ease-out" });
    // 2) дури кога епруветата ќе се наполни: тежок гас (потежок од воздухот) малку се прелева преку работ и тоне
    for (let k = 0; k < 14; k++) {
      const side = k % 2 ? 1 : -1;
      const c = sv("circle", { cx: 140 + side * rnd(6, 14), cy: mouth - 2, r: rnd(2.5, 4.5), fill: col, opacity: 0 });
      c.style.transformBox = "fill-box"; c.style.transformOrigin = "center";
      fumeG.appendChild(c);
      const out = side * rnd(14, 22), down = rnd(30, 56);
      c.animate([
        { transform: "translate(0,0) scale(.7)", opacity: 0 },
        { transform: `translate(${out * 0.6}px,-3px) scale(1)`, opacity: 0.4, offset: 0.25 },
        { transform: `translate(${out}px,${down}px) scale(1.5)`, opacity: 0 }],
        { duration: T(rnd(2400, 3600)), delay: T(rnd(6200, 9500)), iterations: 2, easing: "ease-in", fill: "backwards" });
    }
  }

  function flame(hex) {
    tubeScene.style.display = "none"; rackBack.style.display = "none"; flameScene.style.display = "";
    const stops = ["s1", "s2", "s3", "g1", "g2"].map(k => $(P + "-fg-" + k));
    stops.forEach(e => { e.style.transition = "none"; e.style.stopColor = "#9ec5ff"; });
    flameBead.setAttribute("fill", "#e9e4ea");
    // пробата прво влегува во пламенот, па дури потоа се појавува бојата
    later(() => stops.forEach(e => { e.style.transition = "stop-color .25s"; e.style.stopColor = hex; }), 60);
    const parts = [flameOut, flameMid, flameIn];
    parts.forEach((f, k) => {
      f.getAnimations().forEach(a => a.cancel());
      f.animate([{ transform: "scale(.15,.1)", opacity: 0 }, { transform: "scale(1,1)", opacity: 1, offset: 0.35 }, { transform: "scale(1,1)", opacity: 1 }], { duration: T(300), fill: "forwards" });
      later(() => f.animate([
        { transform: "scale(1,1) skewX(0deg)" }, { transform: "scale(.94," + (1.06 + k * .01) + ") skewX(" + (3 - k) + "deg)" },
        { transform: "scale(1.04,.95) skewX(" + (-3 + k) + "deg)" }, { transform: "scale(.97,1.05) skewX(2deg)" }, { transform: "scale(1,1) skewX(0deg)" }
      ], { duration: T(620 + k * 170), iterations: Infinity, easing: "ease-in-out" }), 300);
    });
    flameGlow.getAnimations().forEach(a => a.cancel());
    flameGlow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T(300), fill: "forwards" });
    later(() => flameGlow.animate([{ opacity: 1 }, { opacity: .7 }, { opacity: 1 }], { duration: T(700), iterations: Infinity }), 300);
  }

  // ---------- реакција ----------
  function badge(x) {
    const k = x ? x.kind : "none";
    const txt = { ppt: "Талог", soln: "Промена на боја", gas: "Гас", flame: "Пламен", layer: "Органски слој", ring: "Кафеав прстен", none: "Нема промена" }[k];
    return el("span", "ep-badge " + k, txt);
  }

  function react(r) {
    if (!cat) return;
    resetTube();
    rg = r;
    root.querySelectorAll(".ep-rg").forEach(b => b.classList.toggle("active", b.dataset.r === r));
    const x = find(cat.id, r);
    cur = x;
    info.replaceChildren(el("p", "ep-hint", "Се додава реагенсот…"));
    if (x && x.kind === "flame") { later(() => { flame(x.hex); showInfo(x); }, 100); return; }
    drops((x && x.dropc) || "#cfe6f5", 5, () => {
      if (!x) { showInfo(null); return; }
      if (x.soln) setLiquid(x.soln, 0.93);
      if (x.kind === "ppt") { precipitate(x.hex, x.stages); }
      if (x.kind === "soln") { setLiquid(x.soln || x.hex, 0.93); }
      if (x.kind === "layer") layerAnim(x);
      if (x.kind === "ring") ringAnim(x);
      if (x.gas || x.kind === "gas") bubbles(x.fume ? 18 : 26, x.fume);
      if (x.fume) fumes(x.fume);
      reacted = true;
      later(() => showInfo(x), 700);
    });
  }

  function showInfo(x) {
    if (mode === "quiz") { showQuizInfo(x); return; }
    const box = document.createDocumentFragment();
    const head = el("div", "ep-title");
    head.append(el("span", "", `${cat.ion} + ${REAGENSI[rg].label}`), badge(x));
    if (x && x.star) { const s = el("span", "ep-star", "★ реакција за идентификација"); s.title = "Групен реагенс или реакција за идентификација"; head.appendChild(s); }
    box.appendChild(head);
    if (!x) {
      box.appendChild(el("p", "ep-obs", "Нема реакција."));
    } else {
      if (x.kind !== "flame" && x.prod) {
        const p = el("div", "ep-prod");
        const sw = el("span", "ep-sw");
        sw.style.background = x.hex || x.soln || WATER;
        p.append(sw, el("b", "", x.prod), el("span", "ep-col", x.col ? ` · ${x.col}${x.kind === "ppt" ? " талог" : x.kind === "soln" ? " раствор" : ""}` : ""));
        box.appendChild(p);
      }
      let obs = x.obs;
      if (!obs) obs = x.kind === "ppt" ? `Се образува ${x.col} талог од ${x.prod}.` : x.kind === "soln" ? `Растворот добива ${x.col} боја (${x.prod}).` : x.kind === "gas" ? `Се ослободува гас (${x.gas}).` : "";
      box.appendChild(el("p", "ep-obs", obs));
      if (x.warn) box.appendChild(el("p", "ep-warn", "⚠️ " + x.warn));
      if (x.eq.length) {
        const eqs = el("div", "ep-eqs");
        x.eq.forEach(e => eqs.appendChild(el("div", "ep-eq", e)));
        box.appendChild(eqs);
      }
      if (x.note) box.appendChild(el("p", "ep-note", x.note));
      if (x.excess) {
        const b = el("button", "btn ghost ep-excess", "➕ " + x.excess.label);
        b.type = "button";
        b.addEventListener("click", () => doExcess(x, b));
        box.appendChild(b);
      }
    }
    const row = el("div", "ep-foot");
    const clr = el("button", "btn ghost", "🧹 Исчисти епрувета");
    clr.type = "button";
    clr.addEventListener("click", () => { resetTube(); rg = null; info.replaceChildren(el("p", "ep-hint", `Епруветата е исчистена: повторно има раствор на ${cat.ion}.`)); });
    row.appendChild(clr);
    row.appendChild(el("span", "ep-src", `Извор: Практикум, ${cat.sec || GRUPI[cat.group].table} (${GRUPI[cat.group].name})`));
    box.appendChild(row);
    info.replaceChildren(box);
  }

  function doExcess(x, btn) {
    const ex = x.excess;
    btn.disabled = true;
    drops("#cfe6f5", 5, () => {
      const parts = [...pptG.children];
      if (ex.bubbles) bubbles(22);
      if (ex.kind === "fade") {
        layerEl.animate([{ opacity: 0.93 }, { opacity: 0 }], { duration: T(1800), fill: "forwards" });
      } else if (ex.kind === "none") {
        /* без промена */
      } else if (ex.kind === "dissolve") {
        parts.forEach(c => c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T(rnd(1200, 2200)), delay: T(rnd(0, 500)), fill: "forwards" }));
        turb.animate([{ opacity: 0.1 }, { opacity: 0 }], { duration: T(1500), fill: "forwards" });
        const [c, o] = ex.soln ? [ex.soln, 0.93] : baseColor();
        setLiquid(c, o);
      } else {
        parts.forEach(c => (c.style.fill = ex.hex));
        turb.style.fill = ex.hex;
      }
      later(() => {
        const box = el("div", "ep-after");
        if (mode === "quiz") {
          const t = ex.kind === "dissolve" ? "Талогот се раствора." : ex.kind === "fade" ? "Бојата на органскиот слој исчезнува." : ex.kind === "none" ? "Нема видлива промена." : "Талогот ја менува бојата.";
          box.appendChild(el("p", "ep-obs", t));
          const en = log.find(e => e.x === x);
          if (en) { en.excess = t; renderQuiz(); }
        } else {
          box.appendChild(el("p", "ep-obs", ex.obs));
          const eqs = el("div", "ep-eqs");
          ex.eq.forEach(e => eqs.appendChild(el("div", "ep-eq", e)));
          box.appendChild(eqs);
        }
        btn.replaceWith(box);
      }, 1500);
    });
  }

  // =====================================================
  //  РЕЖИМ „НЕПОЗНАТ РАСТВОР“
  // =====================================================
  const SUBS = "₀₁₂₃₄₅₆₇₈₉";
  const CYR = { "А": "A", "В": "B", "С": "C", "Е": "E", "Н": "H", "К": "K", "М": "M", "О": "O", "Р": "P", "Т": "T", "Х": "X", "а": "a", "с": "c", "е": "e", "о": "o", "р": "p", "х": "x" };
  function normFormula(s) {
    s = (s || "").trim().replace(/[₀-₉]/g, c => String(SUBS.indexOf(c)));
    s = s.replace(/[А-Яа-я]/g, c => CYR[c] || c).replace(/[·↓\s]/g, "").replace(/\[/g, "(").replace(/\]/g, ")");
    return s.split(/\+(?=[A-Za-z(])/).map(p => p.replace(/[+\-⁺⁻]+$/, "")).filter(Boolean).sort().join("+");
  }
  const sameFormula = (a, b) => { const x = normFormula(a); return x !== "" && x === normFormula(b); };

  function allReagentKeys() {
    const seen = [];
    order.forEach(g => GRUPI[g].reagents.forEach(r => { if (seen.indexOf(r) < 0) seen.push(r); }));
    return seen;
  }

  // Категории на реагенси (за да нема многу скролање)
  const RG_CATS = D.rgcats || [
    ["Киселини", ["HCl", "H2SO4", "HClO4", "H2S", "tartaric"]],
    ["Бази", ["NaOH", "NH4OH"]],
    ["Соли: халогениди, цијаниди", ["KI", "NH4Br", "HgCl2", "SnCl2", "KCN", "KSCN", "NH4SCN"]],
    ["Соли: карбонати, фосфати, сулфати", ["Na2CO3", "Na2HPO4", "MgPhos", "CaSO4", "C2O4", "CH3COONa"]],
    ["Соли: останати", ["AgNO3", "CoNO32", "UO2Ac", "K2CrO4", "K2Cr2O7", "KNO2", "KH2SbO4", "NH42S"]],
    ["Комплекси", ["K4FeCN6", "K3FeCN6", "HgSCN4", "NaCoNO2", "H2PtCl6", "K2HgI4", "DMG"]],
    ["Метали и редокс", ["Zn", "Na2SnO2", "H2O2", "S2O8", "PbO2"]],
    ["Пламен и вода", ["Flame", "H2O"]]
  ];
  let rgCat = 0, rgQuery = "";
  const rgTools = el("div", "ep-rgtools");
  const rgChips = el("div", "ep-chips");
  const rgSearch = el("input", "pt-search ep-rgsearch");
  rgSearch.type = "search"; rgSearch.placeholder = "Барај реагенс: формула или име"; rgSearch.autocomplete = "off";
  rgSearch.setAttribute("aria-label", "Барај реагенс");
  rgSearch.addEventListener("input", () => { rgQuery = rgSearch.value.trim().toLowerCase(); renderReagents(); });
  rgTools.append(rgChips, rgSearch);
  rgTools.hidden = true;
  reagBox.parentNode.insertBefore(rgTools, reagBox);

  function catKeys(i) { return RG_CATS[i][1].filter(r => REAGENSI[r]); }
  function ungrouped() {
    const known = new Set(RG_CATS.flatMap(c => c[1]));
    return allReagentKeys().filter(r => !known.has(r));
  }

  function renderChips() {
    rgChips.replaceChildren();
    RG_CATS.forEach((c, i) => {
      const used = catKeys(i).filter(r => log.some(e => e.r === r)).length;
      const b = el("button", "ep-cat ep-catsm" + (i === rgCat && !rgQuery ? " active" : ""), c[0] + (used ? ` (${used}✓)` : ""));
      b.type = "button";
      b.addEventListener("click", () => { rgCat = i; rgQuery = ""; rgSearch.value = ""; renderChips(); renderReagents(); });
      rgChips.appendChild(b);
    });
  }

  function renderReagents() {
    reagBox.replaceChildren();
    let keys;
    if (rgQuery) {
      keys = allReagentKeys().filter(r => (r + " " + REAGENSI[r].label + " " + REAGENSI[r].name).toLowerCase().includes(rgQuery));
    } else {
      keys = catKeys(rgCat).concat(rgCat === RG_CATS.length - 1 ? ungrouped() : []);
    }
    if (!keys.length) { reagBox.appendChild(el("p", "ep-hint small", "Нема таков реагенс.")); return; }
    keys.forEach(r => {
      const b = el("button", "ep-rg" + (log.some(e => e.r === r) ? " used" : "") + (rg === r ? " active" : ""));
      b.type = "button";
      b.dataset.r = r;
      b.disabled = done;
      b.append(el("span", "ep-rg-f", REAGENSI[r].label), el("span", "ep-rg-n", REAGENSI[r].name));
      b.addEventListener("click", () => react(r));
      reagBox.appendChild(b);
    });
  }

  function buildAllReagents() {
    rgTools.hidden = false;
    rgCat = 0; rgQuery = ""; rgSearch.value = "";
    renderChips();
    renderReagents();
  }
  function markUsed() {
    root.querySelectorAll(".ep-rg").forEach(b => b.classList.toggle("used", log.some(e => e.r === b.dataset.r)));
    if (!rgTools.hidden) renderChips();
  }

  // Набљудување без да се открие катјонот или формулата
  function neutralObs(x) {
    if (!x) return "Нема видлива промена.";
    if (x.nobs) return x.nobs;
    if (x.kind === "none") return "Нема видлива промена.";
    if (x.kind === "layer") return `Органскиот слој (на дното) се обојува ${x.col}.`;
    if (x.kind === "ring") return `На границата меѓу двата слоја се појавува ${x.col} прстен.`;
    if (x.kind === "flame") return x.obs;
    if (x.kind === "ppt") return `Се образува ${x.col} талог` + (x.gas ? " и се ослободува гас." : ".");
    if (x.kind === "soln") return x.col ? `Растворот добива ${x.col} боја.` : "Растворот ја менува бојата.";
    if (x.kind === "gas") return "Се ослободува гас (проверка: мирис, влажна лакмус хартија).";
    return "";
  }

  function setMode(m) {
    mode = m;
    modeBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === m));
    learnBox.hidden = m !== "learn";
    quizSetup.hidden = m !== "quiz";
    quizBox.hidden = m !== "quiz";
    rgTools.hidden = true;
    cat = null; rg = null; unknown = null; log = []; answers = {}; sel = ""; done = false;
    Object.keys(catBtns).forEach(k => catBtns[k].classList.remove("active"));
    quizBox.replaceChildren();
    info.replaceChildren();
    resetTube();
    if (m === "learn") {
      rgHead.textContent = "2. Избери реагенс";
      reagBox.replaceChildren(el("p", "ep-hint small", N.pickFirst));
      info.appendChild(el("p", "ep-hint", N.learnHint));
    } else {
      rgHead.textContent = "Реагенси";
      reagBox.replaceChildren(el("p", "ep-hint small", "Притисни „Нов непознат раствор“ за да почнеш."));
      info.appendChild(el("p", "ep-hint", N.quizHint));
    }
  }

  function newUnknown() {
    const g = grpSel.value;
    let pool = KATJONI.filter(k => g === "all" || k.group === g);
    if (pool.length > 1) pool = pool.filter(k => k.id !== lastId);
    const k = pool[Math.floor(Math.random() * pool.length)];
    lastId = k.id;
    cat = unknown = k; rg = null; log = []; answers = {}; sel = ""; done = false;
    resetTube();
    buildAllReagents();
    info.replaceChildren(
      el("p", "ep-hint", "Во епруветата е непознат раствор. Додавај реагенси еден по еден (секој пат се користи свеж дел од растворот)."),
      el("p", "ep-hint small", g === "all" ? N.anyGroup : N.inGroup + GRUPI[g].name + ".")
    );
    renderQuiz();
  }

  function showQuizInfo(x) {
    const entry = { r: rg, x: x || null, excess: null };
    const i = log.findIndex(e => e.r === rg);
    if (i >= 0) log[i] = entry; else log.push(entry);
    markUsed();
    const box = document.createDocumentFragment();
    const head = el("div", "ep-title");
    head.append(el("span", "", `Непознат раствор + ${REAGENSI[rg].label}`), badge(x));
    box.appendChild(head);
    if (x && x.kind === "ppt") {
      const p = el("div", "ep-prod");
      const sw = el("span", "ep-sw"); sw.style.background = x.hex;
      p.append(sw, el("span", "ep-col", `${x.col} талог`));
      box.appendChild(p);
    }
    box.appendChild(el("p", "ep-obs", neutralObs(x)));
    if (x && x.excess) {
      const lab = /уште/.test(x.excess.label) ? "Додај уште од реагенсот" : x.excess.label;
      const b = el("button", "btn ghost ep-excess", "➕ " + lab);
      b.type = "button";
      b.addEventListener("click", () => doExcess(x, b));
      box.appendChild(b);
    }
    box.appendChild(el("p", "ep-hint small", "Резултатот е запишан во дневникот подолу."));
    const row = el("div", "ep-foot");
    const clr = el("button", "btn ghost", "🧹 Нова епрувета со истиот раствор");
    clr.type = "button";
    clr.addEventListener("click", () => { resetTube(); rg = null; info.replaceChildren(el("p", "ep-hint", "Епруветата е исчистена: повторно го имаш непознатиот раствор.")); });
    row.appendChild(clr);
    box.appendChild(row);
    info.replaceChildren(box);
    renderQuiz();
  }

  function renderQuiz() {
    quizBox.replaceChildren();
    if (!unknown) return;

    // --- дневник
    quizBox.appendChild(el("h3", "ep-h", "📒 Лабораториски дневник"));
    if (!log.length) {
      quizBox.appendChild(el("p", "ep-hint small", "Овде автоматски се запишуваат резултатите од секој реагенс што ќе го додадеш."));
    } else {
      const wrap = el("div", "ep-logwrap"), t = el("table", "ep-log");
      const hr = el("tr");
      ["#", "Реагенс", "Набљудување"].forEach(h => hr.appendChild(el("th", "", h)));
      t.appendChild(el("thead")).appendChild(hr);
      const tb = el("tbody");
      log.forEach((e, i) => {
        const tr = el("tr");
        tr.appendChild(el("td", "", String(i + 1)));
        tr.appendChild(el("td", "ep-log-r", REAGENSI[e.r].label));
        const td = el("td");
        if (e.x && e.x.kind === "ppt") { const sw = el("span", "ep-sw sm"); sw.style.background = e.x.hex; td.appendChild(sw); }
        td.appendChild(document.createTextNode(neutralObs(e.x)));
        if (e.excess) td.appendChild(el("div", "ep-log-ex", "↳ вишок: " + e.excess));
        tr.appendChild(td);
        tb.appendChild(tr);
      });
      t.appendChild(tb); wrap.appendChild(t); quizBox.appendChild(wrap);
    }

    // --- одговор
    const ans = el("div", "ep-answer");
    ans.appendChild(el("h3", "ep-h", "🎯 Твој одговор"));
    ans.appendChild(el("label", "ep-lab", N.answerLab));
    const s = el("select", "calc-num ep-sel");
    s.appendChild(new Option(N.selPlaceholder, ""));
    order.forEach(g => {
      const og = document.createElement("optgroup");
      og.label = GRUPI[g].name;
      KATJONI.filter(k => k.group === g).forEach(k => og.appendChild(new Option(`${k.ion} – ${k.name}`, k.id)));
      s.appendChild(og);
    });
    s.value = sel; s.disabled = done;
    s.addEventListener("change", () => { sel = s.value; });
    ans.appendChild(s);

    const ppts = log.filter(e => e.x && e.x.kind === "ppt");
    const inputs = {}, marks = {};
    if (ppts.length) {
      ans.appendChild(el("p", "ep-lab", "Напиши ги хемиските формули на талозите што ги доби (индексите како обични броеви, на пр. Ag2CrO4):"));
      ppts.forEach(e => {
        const row = el("div", "ep-formrow");
        row.appendChild(el("span", "ep-formlab", `${REAGENSI[e.r].label} → ${e.x.col} талог`));
        const inp = el("input", "calc-num ep-formin");
        inp.type = "text"; inp.autocomplete = "off"; inp.autocapitalize = "off"; inp.spellcheck = false;
        inp.placeholder = "формула"; inp.value = answers[e.r] || ""; inp.disabled = done;
        inp.addEventListener("input", () => { answers[e.r] = inp.value; inp.classList.remove("ok", "bad"); marks[e.r].textContent = ""; });
        inp.addEventListener("keydown", ev => { if (ev.key === "Enter") check(); });
        const mk = el("span", "ep-mark");
        inputs[e.r] = inp; marks[e.r] = mk;
        row.append(inp, mk);
        ans.appendChild(row);
      });
    } else if (log.length) {
      ans.appendChild(el("p", "ep-hint small", "За сега немаш добиено талог, па нема формули за пишување. Пробај со други реагенси."));
    }

    const fb = el("div", "ep-fb"); fb.setAttribute("aria-live", "polite");
    const btns = el("div", "ep-foot");
    const ck = el("button", "btn", "✔ Провери"); ck.type = "button"; ck.disabled = done;
    const rv = el("button", "btn ghost", "🏳️ Откриј го одговорот"); rv.type = "button"; rv.disabled = done;
    btns.append(ck, rv);
    ans.append(btns, fb);
    quizBox.appendChild(ans);

    function showSolution(whoGaveUp) {
      done = true;
      markUsed();
      root.querySelectorAll(".ep-rg").forEach(b => (b.disabled = true));
      s.value = unknown.id; s.disabled = true; ck.disabled = true; rv.disabled = true;
      Object.keys(inputs).forEach(r => inputs[r].disabled = true);
      const d = el("div", "ep-sol");
      d.appendChild(el("p", "ep-obs", `Решение: растворот содржи ${unknown.ion} (${unknown.name}), ${GRUPI[unknown.group].name}.`));
      log.forEach(e => {
        if (!e.x) return;
        const line = el("div", "ep-sol-r");
        line.appendChild(el("b", "", REAGENSI[e.r].label + (e.x.prod ? " → " + e.x.prod : "")));
        if (e.x.obs) line.appendChild(el("div", "ep-note", e.x.obs));
        if (e.x.eq && e.x.eq.length) { const eqs = el("div", "ep-eqs"); e.x.eq.forEach(q => eqs.appendChild(el("div", "ep-eq", q))); line.appendChild(eqs); }
        d.appendChild(line);
      });
      const ag = el("button", "btn", "🎲 Нов непознат раствор"); ag.type = "button";
      ag.addEventListener("click", newUnknown);
      d.appendChild(ag);
      fb.appendChild(d);
    }

    function check() {
      fb.replaceChildren();
      if (!log.length) { fb.appendChild(el("p", "ep-fb-bad", "Прво додај барем еден реагенс и запиши што набљудуваш.")); return; }
      if (!sel) { fb.appendChild(el("p", "ep-fb-bad", N.selErr)); return; }
      let allOk = true;
      ppts.forEach(e => {
        const ok = sameFormula(answers[e.r], e.x.prod);
        inputs[e.r].classList.toggle("ok", ok); inputs[e.r].classList.toggle("bad", !ok);
        marks[e.r].textContent = ok ? "✓" : "✗";
        if (!ok) allOk = false;
      });
      const catOK = sel === unknown.id;
      if (!catOK) {
        fb.appendChild(el("p", "ep-fb-bad", N.wrong + " Пробај со уште реагенси или размисли што укажуваат набљудувањата." + (allOk ? "" : " Формулите означени со ✗ исто така не се точни.")));
        return;
      }
      if (allOk) {
        fb.appendChild(el("p", "ep-fb-ok", `✅ Точно! ${N.the} е ${unknown.ion}, а сите формули се точни. Искористени реагенси: ${log.length}.`));
        showSolution();
      } else {
        fb.appendChild(el("p", "ep-fb-bad", "✅ " + N.the + " е точен, но некои формули на талозите (означени со ✗) не се точни. Поправи ги и провери повторно."));
      }
    }
    ck.addEventListener("click", check);
    rv.addEventListener("click", () => { fb.replaceChildren(); showSolution(true); });
    if (done) { s.value = unknown.id; showSolution(); }
  }

  // ---------- приклучување ----------
  modeBtns.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  grpSel.appendChild(new Option("Сите групи", "all"));
  order.forEach(g => grpSel.appendChild(new Option(GRUPI[g].name, g)));
  newBtn.addEventListener("click", newUnknown);

  // почетна состојба
  setMode("learn");
}

if (typeof REAKCII !== "undefined") {
  initLab("ep", {
    ions: KATJONI, groups: GRUPI, reag: REAGENSI, reactions: REAKCII,
    order: ["I", "IIa", "IIb", "III", "IV", "V", "VI"],
    t: {
      pickFirst: "Прво избери катјон.",
      learnHint: "1. Избери катјон од списокот. 2. Избери реагенс и погледни што се случува во епруветата. Затемнетите полиња од практикумот се означени со ★.",
      quizHint: "Добиваш епрувета со непознат раствор што содржи еден катјон. Додавај реагенси, набљудувај и запишувај. На крај погоди го катјонот и напиши ги формулите на талозите.",
      anyGroup: "Катјонот може да биде од која било група.",
      inGroup: "Катјонот е од: ",
      answerLab: "Катјонот во растворот е:",
      selPlaceholder: "— избери катјон —",
      selErr: "Избери кој катјон мислиш дека е.",
      wrong: "❌ Катјонот не е точен.",
      the: "Катјонот"
    }
  });
}
if (typeof ANLAB !== "undefined") initLab("an", ANLAB);
