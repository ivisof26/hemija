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
    <linearGradient id="g-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5230"/><stop offset="1" stop-color="#4a2e18"/></linearGradient>
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
  // ---------- Ученичката (поубаво нацртана; центар x = 715) ----------
  const mir = x => `<g transform="matrix(-1 0 0 1 1430 0)">${x}</g>`;
  const FACE = `
    <ellipse cx="691.500" cy="181" rx="3.4" ry="5" fill="#eebb96"/><ellipse cx="738.500" cy="181" rx="3.4" ry="5" fill="#eebb96"/>
    <path d="M692 172C692 156 702 148 715 148C728 148 738 156 738 172C738 190 728 204 715 204C702 204 692 190 692 172Z" fill="url(#g-skin)"/>
    <path d="M696 190q19 20 38 0" stroke="#e0ab84" stroke-width="3" fill="none" opacity=".35"/>
    <path d="M700 172q5 -4 10 -1M720 171q5 -3 10 1" stroke="#5a3a20" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M702 178q4 -3.600 8 0q-4 3.200 -8 0zM720 178q4 -3.600 8 0q-4 3.200 -8 0z" fill="#fff"/>
    <circle cx="706" cy="178" r="2.300" fill="#3a2414"/><circle cx="724" cy="178" r="2.300" fill="#3a2414"/><circle cx="706.700" cy="177.200" r=".8" fill="#fff"/><circle cx="724.700" cy="177.200" r=".8" fill="#fff"/>
    <path d="M702 177q4 -3.500 8 0M720 177q4 -3.500 8 0" stroke="#2b1a0c" stroke-width="1.400" fill="none" stroke-linecap="round"/>
    <path d="M715 182q-2.500 5 .500 7" stroke="#d29a74" stroke-width="1.500" fill="none" stroke-linecap="round"/>
    <path d="M707 193q8 6 16 0q-8 2.500 -16 0z" fill="#c8504a"/><path d="M708 193q7 2.800 14 0" stroke="#a63d3a" stroke-width="1.200" fill="none"/>
    <circle cx="700" cy="188" r="4.500" fill="#f4968a" opacity=".28"/><circle cx="730" cy="188" r="4.500" fill="#f4968a" opacity=".28"/>`;
  const HEAD_BASE = tied => {
    const neck = `<path d="M708 198h14v14q-7 5 -14 0z" fill="#e8b88f"/><path d="M708 204q7 6 14 0" stroke="#d9a47c" stroke-width="2" fill="none" opacity=".6"/>`;
    const crown = `<path d="M689 176C686 150 699 138 715 138C731 138 744 150 741 176C738 163 730 155 718 155C704 154 693 163 689 176Z" fill="#6b4526"/><path d="M698 150q8 -8 20 -7" stroke="#9a6c3e" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
    if (!tied) {
      const hairBack = `<path d="M690 168C682 196 682 226 690 248C698 256 708 246 707 232L706 184Z" fill="url(#g-hair)"/>`;
      const hairFront = `<path d="M692 172C688 200 688 226 694 244" stroke="#8a5d33" stroke-width="2" fill="none" opacity=".7"/>`;
      return `<g filter="url(#sf-sh)">${mir(hairBack)}${hairBack}${neck}${FACE}${crown}${hairFront}${mir(hairFront)}</g>`;
    }
    const pony = `<path d="M738 158C760 150 770 178 756 206C752 196 748 182 740 172Z" fill="url(#g-hair)"/><rect x="733" y="158" width="9" height="7" rx="3" fill="#2f6fd1" transform="rotate(-18 737 161)"/>`;
    const goggles = `<path d="M690 177h-4M740 177h4" stroke="#2f6fd1" stroke-width="3.200" stroke-linecap="round"/>
      <rect x="693" y="166" width="44" height="23" rx="11" fill="url(#g-glass)" stroke="#2f6fd1" stroke-width="3.200"/><path d="M715 172v10" stroke="#2f6fd1" stroke-width="3"/><path d="M698 171q7 -3 14 -2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return `<g filter="url(#sf-sh)">${pony}${neck}${FACE}${crown}</g>${goggles}`;
  };
  const ARM_BARE = `<path d="M698 226C689 230 683 244 681 260C679 276 677 290 677 301L691 304C693 291 696 277 700 263C703 251 705 240 703 230Z" fill="url(#g-skin)"/><ellipse cx="685" cy="309" rx="7.500" ry="10" fill="#f0c6a2"/><ellipse cx="693" cy="304" rx="3" ry="6.500" fill="#f0c6a2" transform="rotate(-18 693 304)"/>`;
  const TORSO_BAD = `<g filter="url(#sf-sh)">${ARM_BARE}${mir(ARM_BARE)}
    <path d="M696 222Q715 214 734 222Q745 227 751 240L747 254Q743 252 739 252L739 302Q739 316 715 318Q691 316 691 302L691 252Q687 252 683 254L679 240Q685 227 696 222Z" fill="#33a398"/>
    <path d="M696 222Q715 214 734 222Q745 227 751 240L747 254Q743 252 739 252L739 270L691 270L691 252Q687 252 683 254L679 240Q685 227 696 222Z" fill="#46b8ac"/>
    <path d="M704 219q11 10 22 0" stroke="#2a8379" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M697 280q18 8 36 0" stroke="#2a8379" stroke-width="2" fill="none" opacity=".45"/><path d="M730 244V310" stroke="#2a8379" stroke-width="2" opacity=".25"/></g>`;
  const SLEEVE = `<path d="M690 226C677 234 671 252 669 270C667 286 666 298 665 309L680 312C682 298 686 282 692 264C696 251 698 238 698 228Z" fill="url(#g-coat)" stroke="#c4ccd4" stroke-width="2"/><rect x="664" y="300" width="17" height="9" rx="3" fill="#e9eef2" stroke="#c4ccd4" stroke-width="1.500" transform="rotate(7 672 304)"/><ellipse cx="672" cy="318" rx="7.500" ry="9" fill="#f0c6a2"/><ellipse cx="680" cy="314" rx="3" ry="6" fill="#f0c6a2" transform="rotate(-18 680 314)"/>`;
  const TORSO_GOOD = `<g filter="url(#sf-sh)"><path d="M703 214q12 18 24 0l6 16h-36z" fill="#3a78c9"/>${SLEEVE}${mir(SLEEVE)}
    <path d="M694 221Q715 212 736 221L745 233L751 380Q715 392 679 380L685 233Z" fill="url(#g-coat)" stroke="#c4ccd4" stroke-width="2"/></g>
    <path d="M715 240V384" stroke="#c4ccd4" stroke-width="2"/><path d="M702 216L715 246L728 216" fill="#eef2f5" stroke="#c4ccd4" stroke-width="2" stroke-linejoin="round"/>
    <path d="M689 300q-2 40 0 78M741 300q2 40 0 78" stroke="#e2e7ec" stroke-width="3" fill="none"/>
    <rect x="686" y="306" width="23" height="26" rx="3" fill="none" stroke="#c4ccd4" stroke-width="2"/><rect x="721" y="306" width="23" height="26" rx="3" fill="none" stroke="#c4ccd4" stroke-width="2"/>
    <rect x="722" y="248" width="14" height="14" rx="2" fill="none" stroke="#c4ccd4" stroke-width="1.800"/><path d="M727 244l2 12" stroke="#2f6fd1" stroke-width="2.200" stroke-linecap="round"/>
    <circle cx="721" cy="268" r="2.500" fill="#9aa5b0"/><circle cx="721" cy="296" r="2.500" fill="#9aa5b0"/><circle cx="721" cy="324" r="2.500" fill="#9aa5b0"/><circle cx="721" cy="352" r="2.500" fill="#9aa5b0"/>
    <path d="M692 236q10 4 16 0M724 236q10 4 16 0" stroke="#dfe5ea" stroke-width="2" fill="none"/>`;
  const LEG_SKIN = `<path d="M696 340C694 368 696 392 698 410C699 428 697 440 697 452L712 452C712 440 711 428 712 410C714 392 715 368 714 342Z" fill="url(#g-skin)"/><ellipse cx="705" cy="394" rx="6" ry="4" fill="#fff" opacity=".18"/>`;
  const SANDAL = `<path d="M683 458q0 -8 10 -9l17 0q4 0 4 5l0 4z" fill="#f0c6a2"/><rect x="682" y="457" width="33" height="8" rx="4" fill="#c58a3a"/><path d="M692 452l8 6M706 452l-6 6" stroke="#8a5a1c" stroke-width="3" stroke-linecap="round"/><path d="M696 448h14" stroke="#8a5a1c" stroke-width="3" stroke-linecap="round"/><circle cx="685" cy="455" r="2.800" fill="#f0c6a2"/><circle cx="690" cy="453" r="2.600" fill="#f0c6a2"/>`;
  const LEGS_BAD = `<g filter="url(#sf-sh)">${LEG_SKIN}${mir(LEG_SKIN)}${SANDAL}${mir(SANDAL)}
    <path d="M692 300H738L741 348Q731 352 725 348L715 328L705 348Q699 352 689 348Z" fill="#3c6e91"/><path d="M692 304H738" stroke="#2d5575" stroke-width="3"/><path d="M715 306V328" stroke="#2d5575" stroke-width="2"/><path d="M693 342q8 3 12 0M725 342q8 3 12 0" stroke="#5d8fb3" stroke-width="2" fill="none" stroke-dasharray="3 2"/></g>`;
  const SHOE = `<path d="M683 470q0 -15 17 -15h10q4 0 4 4v11z" fill="#2b2b33"/><rect x="683" y="467" width="31" height="5" rx="2.500" fill="#f4f4f4"/><path d="M692 458l6 -2M696 462l7 -2" stroke="#fff" stroke-width="1.600" stroke-linecap="round"/>`;
  const LEG_PANT = `<path d="M695 300C694 340 695 400 696 454H713C713 400 714 340 714 304Z" fill="#454c66"/><path d="M704 330V452" stroke="#565e7c" stroke-width="2" opacity=".7"/>`;
  const LEGS_GOOD = `<g filter="url(#sf-sh)">${LEG_PANT}${mir(LEG_PANT)}<path d="M692 296H738L739 312Q715 318 691 312Z" fill="#3d4358"/>${SHOE}${mir(SHOE)}</g>`;
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
      bad: HEAD_BASE(false), good: HEAD_BASE(true),
      why: "Нема заштитни очила, а долгата коса е распуштена: може да влезе во пламен или во садови.",
      fix: "Заштитните очила се носат цело време во лабораторија, а долгата коса се врзува.",
      ok: "Носи заштитни очила, а косата е врзана." },
    { id: "mantil", name: "Без мантил, голи раце",
      hot: [662, 204, 106, 100], hotGood: [660, 204, 110, 150], fig: true,
      bad: TORSO_BAD, good: TORSO_GOOD,
      why: "Облечена е во кратка маица, без мантил. Прскање на хемикалија удира директно на кожата.",
      fix: "Се носи долг, затворен мантил од памук со долги ракави.",
      ok: "Носи долг, затворен мантил." },
    { id: "chevli", name: "Отворени сандали и шорцеви",
      hot: [684, 350, 62, 128], hotGood: [684, 392, 62, 86], fig: true,
      bad: LEGS_BAD, good: LEGS_GOOD,
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
