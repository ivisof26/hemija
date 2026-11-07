// Игра „Лабораториска безбедност“: најди ги опасните грешки на сликата (Подобрена верзија)
(function () {
  const svg = document.getElementById("sf-svg");
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  // ---------- Дефиниции и стилови ----------
  const DEFS = `<defs>
    <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset="1" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
    <linearGradient id="g-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="g-cab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#64748b"/><stop offset="1" stop-color="#475569"/></linearGradient>
    <linearGradient id="g-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a16207"/><stop offset="1" stop-color="#854d0e"/></linearGradient>
    <linearGradient id="g-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1f5f9"/><stop offset=".5" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
    <linearGradient id="g-red" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ef4444"/><stop offset=".55" stop-color="#dc2626"/><stop offset="1" stop-color="#b91c1c"/></linearGradient>
    <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".45" stop-color="#e0f2fe" stop-opacity=".6"/><stop offset="1" stop-color="#ffffff" stop-opacity=".9"/></linearGradient>
    <linearGradient id="g-skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffedd5"/><stop offset="1" stop-color="#fed7aa"/></linearGradient>
    <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#bae6fd"/></linearGradient>
    <linearGradient id="g-liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/></linearGradient>
    <linearGradient id="g-coat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f8fafc"/><stop offset="1" stop-color="#f1f5f9"/></linearGradient>
    <linearGradient id="g-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#451a03"/><stop offset="1" stop-color="#291102"/></linearGradient>
    <pattern id="p-tile" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="#f8fafc"/><path d="M0 0H32M0 0V32" stroke="#e2e8f0" stroke-width="2"/></pattern>
    <filter id="sf-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity=".2"/></filter>
    <filter id="sf-sh2" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0f172a" flood-opacity=".25"/></filter>
  </defs>`;

  const bottle = (x, y, w, h, c, o = {}) => {
    const nh = h * 0.26, nw = w * 0.42, by = y + nh, cx = x + w / 2;
    const lab = o.label ? `<rect x="${x + w * 0.1}" y="${y + h * 0.48}" width="${w * 0.8}" height="${h * 0.35}" rx="3" fill="#fff"/><text x="${cx}" y="${y + h * 0.48 + h * 0.23}" text-anchor="middle" font-size="${o.fs || 6}" font-weight="700" fill="${o.lc || '#0f172a'}">${o.label}</text>` : "";
    const cap = o.noCap ? "" : `<rect x="${cx - nw / 2 - 1}" y="${y}" width="${nw + 2}" height="${nh * 0.45}" rx="2" fill="${o.cap || '#334155'}"/>`;
    return `<g filter="url(#sf-sh)"${o.rot ? ` transform="rotate(${o.rot} ${cx}${y + h})"` : ""}>
      <rect x="${cx - nw / 2}" y="${y + nh * 0.3}" width="${nw}" height="${nh * 0.9}" fill="${c}" rx="2"/>
      <path d="M${cx - nw / 2} ${by} L${x + 2} ${by + 8} L${x + w - 2} ${by + 8} L${cx + nw / 2} ${by}Z" fill="${c}"/>
      <rect x="${x}" y="${by + 4}" width="${w}" height="${h - nh - 4}" rx="5" fill="${c}"/>
      <rect x="${x + 4}" y="${by + 8}" width="3" height="${h - nh - 18}" rx="1.5" fill="#fff" opacity=".5"/>${lab}${cap}</g>`;
  };
  const beaker = (x, y, w, h, liq = true) => `<g filter="url(#sf-sh)"><path d="M${x} ${y} h${w} l-3 ${h} q0 3 -3 3 h${-(w - 6)} q-3 0 -3 -3z" fill="url(#g-glass)" stroke="#64748b" stroke-width="1.8"/>
      ${liq ? `<path d="M${x + 3} ${y + h * 0.4} h${w - 6} l-2.5 ${h * 0.6 - 1} q0 2 -2 2 h${-(w - 11)} q-2 0 -2 -2z" fill="url(#g-liq)" opacity=".9"/><path d="M${x + 3}${y + h * 0.4} q${(w - 6) / 2} 3${w - 6} 0" stroke="#bae6fd" stroke-width="1.5" fill="none"/>` : ""}
      <path d="M${x + w - 10} ${y + 8}h5M${x + w - 10} ${y + 16}h5M${x + w - 10} ${y + 24}h5" stroke="#64748b" stroke-width="1.2"/><rect x="${x + 4}" y="${y + 3}" width="2.5" height="${h - 8}" rx="1" fill="#fff" opacity=".7"/></g>`;

  const BASE = `
    <rect width="800" height="500" fill="url(#g-wall)"/>
    <rect y="236" width="800" height="96" fill="url(#p-tile)"/>
    <rect y="231" width="800" height="6" fill="#cbd5e1"/>
    <rect y="410" width="800" height="90" fill="url(#g-floor)"/>
    <path d="M0 440H800M0 472H800M150 410V500M350 410V500M550 410V500" stroke="#94a3b8" stroke-width="2" opacity=".5"/>
    <!-- Прозорец -->
    <rect x="90" y="24" width="160" height="110" rx="6" fill="url(#g-sky)" stroke="#64748b" stroke-width="6"/>
    <path d="M170 24V134M90 79H250" stroke="#64748b" stroke-width="4"/>
    <ellipse cx="130" cy="50" rx="18" ry="7" fill="#fff" opacity=".9"/><ellipse cx="205" cy="95" rx="22" ry="8" fill="#fff" opacity=".9"/>
    <rect x="84" y="134" width="172" height="8" rx="3" fill="#94a3b8"/>
    <!-- Постер: периоден систем -->
    <g filter="url(#sf-sh)"><rect x="320" y="168" width="140" height="56" rx="4" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
      ${Array.from({ length: 4 * 16 }, (_, i) => { const r = Math.floor(i / 16), c = i % 16; const hues = ["#f87171", "#60a5fa", "#4ade80", "#facc15", "#c084fc"]; return `<rect x="${326 + c * 8}" y="${174 + r * 11}" width="7" height="9" rx="1.5" fill="${hues[(c + r) % 5]}" opacity=".8"/>`; }).join("")}</g>
    <!-- Полица -->
    <rect x="250" y="150" width="290" height="8" rx="2" fill="url(#g-wood)" filter="url(#sf-sh)"/>
    <path d="M276 158v18M514 158v18" stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none"/>
    <!-- Горелка основа -->
    <g filter="url(#sf-sh)"><path d="M150 330q-20 6 -35 25" stroke="#64748b" stroke-width="4" fill="none"/>
      <rect x="145" y="295" width="10" height="35" rx="2" fill="url(#g-metal)"/><rect x="141" y="305" width="18" height="6" rx="2" fill="#475569"/><ellipse cx="150" cy="330" rx="16" ry="4" fill="#334155"/></g>
    <!-- Апарат за гаснење -->
    <g><rect x="34" y="190" width="48" height="36" rx="6" fill="#16a34a" stroke="#fff" stroke-width="2"/><path d="M58 198c-8 8 -6 13 0 18c6 -5 8 -10 0 -18z" fill="#fff"/>
       <g filter="url(#sf-sh)"><rect x="47" y="244" width="22" height="78" rx="8" fill="url(#g-red)"/><rect x="53" y="234" width="10" height="12" rx="2" fill="#1e293b"/><path d="M50 234h16" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/><path d="M62 240q14 0 16 14t-4 14" stroke="#0f172a" stroke-width="3" fill="none"/><circle cx="58" cy="264" r="5" fill="#fff" stroke="#94a3b8"/><rect x="51" y="286" width="14" height="12" rx="2" fill="#fff"/></g></g>
    <!-- Работна маса -->
    <rect x="20" y="346" width="638" height="64" fill="url(#g-cab)"/>
    <rect x="20" y="404" width="638" height="6" fill="#1e293b"/>
    <rect x="30" y="354" width="194" height="44" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/><rect x="238" y="354" width="194" height="44" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/><rect x="446" y="354" width="202" height="44" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/>
    <rect x="115" y="358" width="26" height="4" rx="2" fill="#e2e8f0"/><rect x="323" y="358" width="26" height="4" rx="2" fill="#e2e8f0"/><rect x="535" y="358" width="26" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="16" y="326" width="646" height="20" rx="3" fill="url(#g-top)" filter="url(#sf-sh2)"/>
    <rect x="20" y="328" width="638" height="3" rx="1.5" fill="#fff" opacity=".3"/>
    <!-- Штекер -->
    <rect x="580" y="300" width="14" height="14" rx="3" fill="#fff" stroke="#64748b" stroke-width="2"/><circle cx="584" cy="307" r="1.5" fill="#1e293b"/><circle cx="590" cy="307" r="1.5" fill="#1e293b"/>
    <!-- Прва помош -->
    <g filter="url(#sf-sh)"><rect x="560" y="192" width="52" height="38" rx="6" fill="#fff" stroke="#16a34a" stroke-width="3"/><path d="M586 200v22M575 211h22" stroke="#16a34a" stroke-width="6" stroke-linecap="round"/></g>
    ${bottle(270, 106, 26, 42, "#15803d", { label: "NaCl", fs: 6 })}${bottle(312, 110, 24, 38, "#b45309", { label: "KI", fs: 6 })}${bottle(352, 104, 26, 44, "#1d4ed8", { label: "H₂O", fs: 6 })}`;

  const mir = x => `<g transform="matrix(-1 0 0 1 1430 0)">${x}</g>`;
  
  // Подобрен и почист дизајн на ученичката (центар околу x = 715)
  const FACE = `
    <ellipse cx="692" cy="180" rx="3.5" ry="5" fill="#fdbf8f"/><ellipse cx="738" cy="180" rx="3.5" ry="5" fill="#fdbf8f"/>
    <path d="M692 170C692 152 702 144 715 144C728 144 738 152 738 170C738 188 728 202 715 202C702 202 692 188 692 170Z" fill="url(#g-skin)"/>
    <path d="M700 170q5 -3 10 0M720 170q5 -3 10 0" stroke="#334155" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="706" cy="177" r="2.2" fill="#1e293b"/><circle cx="724" cy="177" r="2.2" fill="#1e293b"/><circle cx="706.8" cy="176.2" r=".8" fill="#fff"/><circle cx="724.8" cy="176.2" r=".8" fill="#fff"/>
    <path d="M715 181q-2 4 0 6" stroke="#d89662" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M708 191q7 4 14 0" stroke="#be123c" stroke-width="2" fill="none" stroke-linecap="round"/>`;

  const HEAD_BASE = tied => {
    const neck = `<path d="M708 196h14v16q-7 4 -14 0z" fill="#fed7aa"/>`;
    const crown = `<path d="M688 174C685 148 698 136 715 136C732 136 745 148 742 174C739 160 730 152 718 152C704 152 692 160 688 174Z" fill="url(#g-hair)"/>`;
    if (!tied) {
      const hairBack = `<path d="M688 166C680 194 680 224 688 246C696 254 706 244 705 230L704 182Z" fill="url(#g-hair)"/>`;
      const hairFront = `<path d="M690 170C686 198 686 224 692 242" stroke="#451a03" stroke-width="2" fill="none" opacity=".8"/>`;
      return `<g filter="url(#sf-sh)">${mir(hairBack)}${hairBack}${neck}${FACE}${crown}${hairFront}${mir(hairFront)}</g>`;
    }
    const pony = `<path d="M738 156C762 148 772 176 758 204C754 194 750 180 740 170Z" fill="url(#g-hair)"/><rect x="733" y="156" width="9" height="7" rx="3" fill="#2563eb" transform="rotate(-15 737 159)"/>`;
    const goggles = `<rect x="692" y="164" width="46" height="22" rx="10" fill="url(#g-glass)" stroke="#2563eb" stroke-width="3"/><path d="M715 170v10" stroke="#2563eb" stroke-width="2.5"/><path d="M698 169q7 -3 14 -2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return `<g filter="url(#sf-sh)">${pony}${neck}${FACE}${crown}</g>${goggles}`;
  };

  const ARM_BARE = `<path d="M698 224C690 228 684 242 682 258C680 274 678 288 678 298L692 302C694 289 697 275 701 261C704 249 706 238 704 228Z" fill="url(#g-skin)"/><ellipse cx="686" cy="306" rx="7" ry="9" fill="#fed7aa"/>`;
  const TORSO_BAD = `<g filter="url(#sf-sh)">${ARM_BARE}${mir(ARM_BARE)}
    <path d="M696 220Q715 212 734 220Q745 225 751 238L747 252Q743 250 739 250L739 300Q739 314 715 316Q691 314 691 300L691 250Q687 250 683 252L679 238Q685 225 696 220Z" fill="#0d9488"/>
    <path d="M696 220Q715 212 734 220Q745 225 751 238L747 252Q743 250 739 250L739 268L691 268L691 250Q687 250 683 252L679 238Q685 225 696 220Z" fill="#14b8a6"/>
    <path d="M704 217q11 9 22 0" stroke="#0f766e" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`;

  const SLEEVE = `<path d="M690 224C678 232 672 250 670 268C668 284 667 296 666 306L681 309C683 295 687 279 693 261C697 248 699 236 699 226Z" fill="url(#g-coat)" stroke="#cbd5e1" stroke-width="2"/><ellipse cx="673" cy="314" rx="7" ry="8" fill="#fed7aa"/>`;
  const TORSO_GOOD = `<g filter="url(#sf-sh)"><path d="M703 212q12 16 24 0l6 15h-36z" fill="#2563eb"/>${SLEEVE}${mir(SLEEVE)}
    <path d="M694 219Q715 210 736 219L745 231L751 380Q715 392 679 380L685 231Z" fill="url(#g-coat)" stroke="#cbd5e1" stroke-width="2"/></g>
    <path d="M715 238V382" stroke="#cbd5e1" stroke-width="2"/><path d="M702 214L715 244L728 214" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="721" cy="266" r="2.2" fill="#94a3b8"/><circle cx="721" cy="294" r="2.2" fill="#94a3b8"/><circle cx="721" cy="322" r="2.2" fill="#94a3b8"/><circle cx="721" cy="350" r="2.2" fill="#94a3b8"/>`;

  const LEG_SKIN = `<path d="M696 340C694 368 696 392 698 410C699 428 697 440 697 452L712 452C712 440 711 428 712 410C714 392 715 368 714 342Z" fill="url(#g-skin)"/>`;
  const SANDAL = `<path d="M683 456q0 -7 10 -8l17 0q4 0 4 4l0 4z" fill="#fed7aa"/><rect x="682" y="455" width="33" height="7" rx="3.5" fill="#b45309"/><path d="M692 450l8 6M706 450l-6 6" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>`;
  const LEGS_BAD = `<g filter="url(#sf-sh)">${LEG_SKIN}${mir(LEG_SKIN)}${SANDAL}${mir(SANDAL)}
    <path d="M692 298H738L741 346Q731 350 725 346L715 326L705 346Q699 350 689 346Z" fill="#1e40af"/><path d="M692 302H738" stroke="#1d4ed8" stroke-width="2.5"/><path d="M715 304V326" stroke="#1d4ed8" stroke-width="1.8"/></g>`;
  
  const SHOE = `<path d="M683 468q0 -14 17 -14h10q4 0 4 4v10z" fill="#1e293b"/><rect x="683" y="465" width="31" height="4" rx="2" fill="#f8fafc"/>`;
  const LEG_PANT = `<path d="M695 298C694 338 695 398 696 452H713C713 398 714 338 714 302Z" fill="#334155"/><path d="M704 328V450" stroke="#475569" stroke-width="1.8" opacity=".7"/>`;
  const LEGS_GOOD = `<g filter="url(#sf-sh)">${LEG_PANT}${mir(LEG_PANT)}<path d="M692 294H738L739 310Q715 316 691 310Z" fill="#1e293b"/>${SHOE}${mir(SHOE)}</g>`;
  
  const FLAME = `<g><path d="M150 300C132 280 138 262 150 240C162 262 168 280 150 300Z" fill="#f97316"/><path d="M150 300C140 288 142 274 150 258C158 274 160 288 150 300Z" fill="#facc15"/><path d="M150 300C146 294 147 288 150 284C153 288 154 294 150 300Z" fill="#38bdf8"/></g>`;

  const H = [
    { id: "polica", name: "Тешко шише на работ од полицата",
      hot: [478, 94, 72, 66], hotGood: [418, 96, 60, 62],
      bad: bottle(508, 110, 30, 46, "#b91c1c", { label: "H₂SO₄", fs: 5.5, lc: "#b91c1c", rot: 12 }),
      good: bottle(428, 110, 30, 46, "#b91c1c", { label: "H₂SO₄", fs: 5.5, lc: "#b91c1c" }) + `<rect x="424" y="150" width="38" height="3" rx="1.5" fill="#78350f"/>`,
      why: "Тешко шише со киселина е на самиот раб од полицата и може да падне, да се скрши и да се излее.",
      fix: "Тешките и опасни шишиња се чуваат ниско и позади, на полица со раб што ги задржува.",
      ok: "Шишето е сигурно позади на полицата, зад заштитен раб." },
    { id: "aparat", name: "Блокиран апарат за гаснење",
      hot: [24, 186, 86, 150], hotGood: [24, 186, 86, 150],
      bad: `<g filter="url(#sf-sh)"><rect x="30" y="274" width="68" height="54" fill="#b45309" stroke="#78350f" stroke-width="2"/><path d="M30 274h68l-6 -10h-56z" fill="#d97706" stroke="#78350f" stroke-width="2"/><rect x="58" y="274" width="12" height="54" fill="#fde68a" opacity=".6"/></g>
        <g transform="rotate(-4 70 250)"><rect x="46" y="224" width="52" height="50" fill="#92400e" stroke="#78350f" stroke-width="2"/><rect x="66" y="224" width="12" height="50" fill="#fde68a" opacity=".6"/><text x="56" y="260" font-size="7" fill="#fff" font-weight="700" transform="rotate(-8 56 260)">КУТИЈА</text></g>`,
      good: ``,
      why: "Апаратот за гаснење е закопан зад кутии. Во итна ситуација нема време за поместување.",
      fix: "Патот до апаратот, тушот за итни случаи и излезот мора секогаш да се слободни.",
      ok: "Апаратот за гаснење е на видливо место и пристапот е слободен." },
    { id: "etanol", name: "Отворен етанол покрај пламен",
      hot: [96, 236, 150, 100], hotGood: [96, 244, 150, 92],
      bad: FLAME + bottle(192, 290, 32, 46, "#f0fdf4", { label: "ЕТАНОЛ", fs: 5, lc: "#dc2626", noCap: true }) +
        `<g filter="url(#sf-sh)"><rect x="228" y="326" width="16" height="8" rx="3" fill="#ef4444"/></g><path d="M202 282q-7 -9 0 -16t0 -14M214 280q-7 -9 0 -16t0 -14" stroke="#bae6fd" stroke-width="2" fill="none" opacity=".85" stroke-linecap="round"/><path d="M208 306l-4 7h8z" fill="#dc2626"/>`,
      good: bottle(192, 290, 32, 46, "#f0fdf4", { label: "ЕТАНОЛ", fs: 5, lc: "#dc2626", cap: "#ef4444" }),
      why: "Шишето со лесно запалив етанол е отворено веднаш до запалена горелка. Пареите можат да се запалат.",
      fix: "Запаливите течности се држат затворени и далеку од пламен. Горелката се пали само кога е потребна.",
      ok: "Горелката е изгасната, а шишето со етанол е затворено." },
    { id: "hrana", name: "Храна и
