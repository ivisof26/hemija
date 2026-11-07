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
    <radialGradient id="g-face" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#fde8d6"/><stop offset=".7" stop-color="#f3c6a6"/><stop offset="1" stop-color="#dfa780"/></radialGradient>
    <linearGradient id="g-teal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#52c3b6"/><stop offset=".6" stop-color="#37a598"/><stop offset="1" stop-color="#2a8a7f"/></linearGradient>
    <linearGradient id="g-denim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6c9cc4"/><stop offset="1" stop-color="#3f6a8f"/></linearGradient>
    <linearGradient id="g-pants" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a6280"/><stop offset="1" stop-color="#3a4056"/></linearGradient>
    <radialGradient id="g-vig" cx="50%" cy="48%" r="75%"><stop offset=".6" stop-color="#2a1a08" stop-opacity="0"/><stop offset="1" stop-color="#2a1a08" stop-opacity=".3"/></radialGradient>
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
    <ellipse cx="715" cy="472" rx="50" ry="7" fill="#2b2118" opacity=".22"/>
    <!-- штекер -->
    <rect x="574" y="302" width="14" height="14" rx="3" fill="#fff" stroke="#9a8468" stroke-width="2"/><circle cx="578.5" cy="309" r="1.6" fill="#444"/><circle cx="583.5" cy="309" r="1.6" fill="#444"/>
    <!-- прва помош (секогаш во ред) -->
    <g filter="url(#sf-sh)"><rect x="560" y="196" width="54" height="40" rx="6" fill="#fff" stroke="#2e9e5b" stroke-width="3"/><path d="M587 204v24M575 216h24" stroke="#2e9e5b" stroke-width="7" stroke-linecap="round"/></g>
    <!-- затворени шишиња на полица (секогаш во ред) -->
    ${bottle(282, 110, 26, 44, "#3b8c5a", { label: "NaCl", fs: 6 })}${bottle(326, 116, 24, 38, "#c9852e", { label: "KI", fs: 6 })}${bottle(366, 108, 26, 46, "#4a6fb3", { label: "H₂O", fs: 6 })}`;

  // ---------- Опасности: bad = небезбедно, good = безбедно (null = нема ништо) ----------
  // ---------- Ученичката (пореална: пропорции на возрасен човек, сенки и набори; центар x = 715) ----------
  const mir = x => `<g transform="matrix(-1 0 0 1 1430 0)">${x}</g>`;
  const FACE = `
    <ellipse cx="696.500" cy="146" rx="2.600" ry="4.600" fill="#e3ab85"/><ellipse cx="733.500" cy="146" rx="2.600" ry="4.600" fill="#e3ab85"/>
    <path d="M697 142C697 127 704 120 715 120C726 120 733 127 733 142C733 156 727 168 715 171C703 168 697 156 697 142Z" fill="url(#g-face)"/>
    <path d="M699 156Q715 176 731 156" stroke="#d99f78" stroke-width="2.500" fill="none" opacity=".25"/>
    <circle cx="703" cy="155" r="4.300" fill="#f1948a" opacity=".2"/><circle cx="727" cy="155" r="4.300" fill="#f1948a" opacity=".2"/>
    <path d="M702 140q5 -2.600 10.500 -1.100M717.500 138.900q5.500 -1.500 10.500 1.100" stroke="#6a4524" stroke-width="1.300" fill="none" stroke-linecap="round"/>
    <path d="M702.500 145q5.500 -4.300 11 0q-5.500 3.700 -11 0zM716.500 145q5.500 -4.300 11 0q-5.500 3.700 -11 0z" fill="#fff"/>
    <circle cx="708" cy="144.800" r="2.500" fill="#6a4524"/><circle cx="722" cy="144.800" r="2.500" fill="#6a4524"/>
    <circle cx="708" cy="144.800" r="1.200" fill="#1c1008"/><circle cx="722" cy="144.800" r="1.200" fill="#1c1008"/>
    <circle cx="708.900" cy="143.900" r=".7" fill="#fff"/><circle cx="722.900" cy="143.900" r=".7" fill="#fff"/>
    <path d="M702.500 145q5.500 -4.900 11 0M716.500 145q5.500 -4.900 11 0" stroke="#2b1a0c" stroke-width="1.300" fill="none" stroke-linecap="round"/>
    <path d="M715 147.500Q712.600 154.500 715.400 157Q717.200 157.500 718.200 156" stroke="#cf9670" stroke-width="1.300" fill="none" stroke-linecap="round"/>
    <path d="M709.500 162.300Q712.500 160.700 715 161.700Q717.500 160.700 720.500 162.300Q715 165.600 709.500 162.300Z" fill="#b9524f"/>
    <path d="M710.500 163Q715 167.800 719.500 163Q715 164.800 710.500 163Z" fill="#d9776f"/>`;
  const NECK = `<path d="M708 165H722V185Q715 190 708 185Z" fill="url(#g-skin)"/><path d="M708 167Q715 177 722 167V174Q715 182 708 174Z" fill="#c98f6a" opacity=".4"/>`;
  const CROWN = `<path d="M696 144C694 121 704 112 716 112C728 112 737 121 734 144C731 132 726 126.500 716 126.500C706 126.500 700 132.500 696 144Z" fill="url(#g-hair)"/><path d="M702 122Q714 114 727 121" stroke="#b5864f" stroke-width="2.400" fill="none" opacity=".65" stroke-linecap="round"/><path d="M706 128Q716 122 726 128" stroke="#3a2210" stroke-width="1.200" fill="none" opacity=".4"/>`;
  const HEAD_BASE = tied => {
    if (!tied) {
      const back = `<path d="M697 124C684 136 683 166 685 196C686 210 696 216 704 208C700 188 699 170 700 150Z" fill="url(#g-hair)"/><path d="M690 150C687 170 688 190 691 204" stroke="#a97a4a" stroke-width="1.800" fill="none" opacity=".55"/><path d="M695 158C693 176 694 192 697 204" stroke="#3a2210" stroke-width="1.400" fill="none" opacity=".35"/>`;
      return `<g filter="url(#sf-sh)">${mir(back)}${back}${NECK}${FACE}${CROWN}</g>`;
    }
    const pony = `<path d="M729 126C752 123 765 153 755 186C752 198 748 206 743 210C746 191 745 171 737 155Z" fill="url(#g-hair)"/><path d="M742 140C752 156 752 178 747 196" stroke="#b5864f" stroke-width="1.800" fill="none" opacity=".6"/><rect x="727" y="125" width="10" height="6.500" rx="3.200" fill="#2f6fd1" transform="rotate(22 732 128)"/>`;
    const goggles = `<path d="M695 143Q690 142 689 147M735 143Q740 142 741 147" stroke="#2f6fd1" stroke-width="2.800" fill="none" stroke-linecap="round"/>
      <path d="M699 136.500H731Q735.500 136.500 735.500 141V148Q735.500 153.500 730 153.500H700Q694.500 153.500 694.500 148V141Q694.500 136.500 699 136.500Z" fill="#d6ecf8" fill-opacity=".22" stroke="#2f6fd1" stroke-width="2.400"/><path d="M712 142Q715 139 718 142" stroke="#2f6fd1" stroke-width="2" fill="none"/><path d="M699 140q6 -2.200 12 -1.600" stroke="#fff" stroke-width="1.800" fill="none" stroke-linecap="round" opacity=".9"/>`;
    return `<g filter="url(#sf-sh)">${pony}${NECK}${FACE}${CROWN}</g>${goggles}`;
  };
  const ARM_BARE = `<path d="M683 212C678 232 676 256 675 280L673 292L686 296L690 282C692 262 694 240 694 220Z" fill="url(#g-skin)"/><path d="M679 258Q684 262 691 260" stroke="#d99f78" stroke-width="1.800" fill="none" opacity=".6"/><path d="M672 292C668 300 669 312 674 316C679 318 686 314 687 304L686 296Z" fill="#f2c6a3"/><path d="M676 310q3 3 7 0" stroke="#d99f78" stroke-width="1" fill="none" opacity=".7"/>`;
  const TORSO_BAD = `<g filter="url(#sf-sh)">${ARM_BARE}${mir(ARM_BARE)}
    <path d="M689 190Q698 183 708 181Q715 191 722 181Q732 183 741 190L750 213L738 219L737 232Q738 264 736 292H694Q692 264 693 232L692 219L680 213Z" fill="url(#g-teal)"/>
    <path d="M708 181Q715 192 722 181" stroke="#277a70" stroke-width="2.400" fill="none"/>
    <path d="M700 252Q715 260 730 252M697 270Q715 278 733 270" stroke="#277a70" stroke-width="1.500" fill="none" opacity=".4"/>
    <path d="M694 232Q700 244 706 250M736 232Q730 244 724 250" stroke="#277a70" stroke-width="1.300" fill="none" opacity=".4"/>
    <path d="M726 196Q734 200 737 214" stroke="#fff" stroke-width="2" fill="none" opacity=".18" stroke-linecap="round"/></g>`;
  const SLEEVE = `<path d="M688 190Q676 198 671 226L665 294L682 298L691 238L694 204Z" fill="url(#g-coat)" stroke="#c4ccd4" stroke-width="1.600"/><path d="M664 288L683 292L682 300L663 296Z" fill="#eef2f5" stroke="#c4ccd4" stroke-width="1.200"/><path d="M663 298C659 308 661 318 667 321C673 323 680 319 681 309L682 300Z" fill="#f2c6a3"/><path d="M676 246Q681 252 689 250M672 270Q678 275 686 273" stroke="#d3dae0" stroke-width="1.600" fill="none"/>`;
  const TORSO_GOOD = `<g filter="url(#sf-sh)">${SLEEVE}${mir(SLEEVE)}
    <path d="M688 190Q698 183 708 181L715 200L722 181Q732 183 742 190L749 222Q751 262 748 304L753 386Q715 394 677 386L682 304Q679 262 681 222Z" fill="url(#g-coat)" stroke="#c4ccd4" stroke-width="1.600"/></g>
    <path d="M708 181L715 200L722 181Q715 189 708 181Z" fill="#3a78c9"/>
    <path d="M705 180L698 192L714 216L715 202ZM725 180L732 192L716 216L715 202Z" fill="#f7f9fb" stroke="#c4ccd4" stroke-width="1.300" stroke-linejoin="round"/>
    <path d="M715 204V389" stroke="#cdd5dc" stroke-width="1.600"/>
    <circle cx="721" cy="236" r="2.200" fill="#aeb8c2"/><circle cx="721" cy="268" r="2.200" fill="#aeb8c2"/><circle cx="721" cy="300" r="2.200" fill="#aeb8c2"/><circle cx="721" cy="332" r="2.200" fill="#aeb8c2"/><circle cx="721" cy="364" r="2.200" fill="#aeb8c2"/>
    <rect x="690" y="312" width="19" height="26" rx="2" fill="none" stroke="#c4ccd4" stroke-width="1.500"/><rect x="721" y="312" width="19" height="26" rx="2" fill="none" stroke="#c4ccd4" stroke-width="1.500"/>
    <rect x="695" y="240" width="14" height="14" rx="1.500" fill="none" stroke="#c4ccd4" stroke-width="1.400"/><path d="M702 236l1.500 12" stroke="#2f6fd1" stroke-width="2.200" stroke-linecap="round"/>
    <path d="M687 296Q684 340 683 384M743 296Q746 340 747 384" stroke="#e2e7ec" stroke-width="2.600" fill="none"/>
    <path d="M700 262Q715 268 730 262M698 290Q715 297 732 290" stroke="#d3dae0" stroke-width="1.500" fill="none"/>`;
  const LEG_SKIN = `<path d="M696 336C695 372 697 400 699 424C700 438 699 450 700 456L712 456C713 446 712 436 713 424C715 400 714 372 714 340Z" fill="url(#g-skin)"/><ellipse cx="705" cy="398" rx="5" ry="3.500" fill="#fff" opacity=".2"/><path d="M700 408Q705 412 711 408" stroke="#d99f78" stroke-width="1.300" fill="none" opacity=".5"/>`;
  const SANDAL = `<path d="M689 462Q689 458 700 458H714Q718 458 718 463V466Q718 468 714 468H693Q689 468 689 462Z" fill="#b97b35"/><path d="M697 456L702 462M709 456L704 462M695 459H712" stroke="#7a4a14" stroke-width="2.600" stroke-linecap="round"/><circle cx="691" cy="461.500" r="2" fill="#f2c6a3"/><circle cx="695" cy="460" r="1.800" fill="#f2c6a3"/>`;
  const LEGS_BAD = `<g filter="url(#sf-sh)">${LEG_SKIN}${mir(LEG_SKIN)}${SANDAL}${mir(SANDAL)}
    <path d="M694 288H736L740 348Q730 352 722 349L715 324L708 349Q700 352 690 348Z" fill="url(#g-denim)"/>
    <path d="M715 292V324M696 296H734" stroke="#2f5170" stroke-width="1.500" opacity=".6"/><path d="M693 342q8 3 13 0M724 342q8 3 13 0" stroke="#8ab3d6" stroke-width="1.500" fill="none" stroke-dasharray="2 2"/>
    <path d="M697 300q4 18 2 34M733 300q-4 18 -2 34" stroke="#2f5170" stroke-width="1.200" fill="none" opacity=".35"/></g>`;
  const SHOE = `<path d="M690 470Q690 458 700 457H712Q716 458 716 464V470Z" fill="#2b2b33"/><rect x="689" y="467" width="28" height="5" rx="2.500" fill="#f4f4f4"/><path d="M696 459l7 -1.500M699 463l7 -1.500" stroke="#fff" stroke-width="1.500" stroke-linecap="round" opacity=".8"/>`;
  const LEG_PANT = `<path d="M696 290C694 340 695 410 697 462H713C714 410 715 350 715 300Z" fill="url(#g-pants)"/><path d="M705 330V460" stroke="#6a7292" stroke-width="1.500" opacity=".5"/>`;
  const LEGS_GOOD = `<g filter="url(#sf-sh)">${LEG_PANT}${mir(LEG_PANT)}${SHOE}${mir(SHOE)}</g>`;
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
      hot: [684, 110, 62, 104], hotGood: [684, 110, 80, 100], fig: true,
      bad: HEAD_BASE(false), good: HEAD_BASE(true),
      why: "Нема заштитни очила, а долгата коса е распуштена: може да влезе во пламен или во садови.",
      fix: "Заштитните очила се носат цело време во лабораторија, а долгата коса се врзува.",
      ok: "Носи заштитни очила, а косата е врзана." },
    { id: "mantil", name: "Без мантил, голи раце",
      hot: [668, 184, 86, 134], hotGood: [660, 184, 110, 206], fig: true,
      bad: TORSO_BAD, good: TORSO_GOOD,
      why: "Облечена е во кратка маица, без мантил. Прскање на хемикалија удира директно на кожата.",
      fix: "Се носи долг, затворен мантил од памук со долги ракави.",
      ok: "Носи долг, затворен мантил." },
    { id: "chevli", name: "Отворени сандали и шорцеви",
      hot: [684, 290, 62, 190], hotGood: [684, 388, 62, 92], fig: true,
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
    svg.innerHTML = defs + BASE + `<g id="sf-items">${items}</g><rect width="800" height="500" fill="url(#g-vig)" pointer-events="none"/><g id="sf-marks"></g>`;
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
