// ---------- Ученичката (модернизиран, чист и професионален векторски изглед) ----------
  const mir = x => `<g transform="matrix(-1 0 0 1 1430 0)">${x}</g>`;
  
  // Подобрено лице и пропорции
  const FACE = `
    <ellipse cx="696.500" cy="146" rx="2.600" ry="4.600" fill="#e3ab85"/><ellipse cx="733.500" cy="146" rx="2.600" ry="4.600" fill="#e3ab85"/>
    <path d="M697 142C697 127 704 120 715 120C726 120 733 127 733 142C733 156 727 168 715 171C703 168 697 156 697 142Z" fill="url(#g-face)"/>
    <path d="M699 156Q715 176 731 156" stroke="#d99f78" stroke-width="2.500" fill="none" opacity=".25"/>
    <circle cx="703" cy="155" r="4.300" fill="#f1948a" opacity=".2"/><circle cx="727" cy="155" r="4.300" fill="#f1948a" opacity=".2"/>
    <path d="M702 140q5 -2.600 10.500 -1.100M717.500 138.900q5.500 -1.500 10.500 1.100" stroke="#6a4524" stroke-width="1.300" fill="none" stroke-linecap="round"/>
    <circle cx="708" cy="144.800" r="2.500" fill="#6a4524"/><circle cx="722" cy="144.800" r="2.500" fill="#6a4524"/>
    <circle cx="708" cy="144.800" r="1.200" fill="#1c1008"/><circle cx="722" cy="144.800" r="1.200" fill="#1c1008"/>
    <circle cx="708.900" cy="143.900" r=".7" fill="#fff"/><circle cx="722.900" cy="143.900" r=".7" fill="#fff"/>
    <path d="M702.500 145q5.500 -4.900 11 0M716.500 145q5.500 -4.900 11 0" stroke="#2b1a0c" stroke-width="1.300" fill="none" stroke-linecap="round"/>
    <path d="M715 147.500Q712.600 154.500 715.400 157Q717.200 157.500 718.200 156" stroke="#cf9670" stroke-width="1.300" fill="none" stroke-linecap="round"/>
    <path d="M709.500 162.300Q712.500 160.700 715 161.700Q717.500 160.700 720.500 162.300Q715 15.600 709.500 162.300Z" fill="#b9524f"/>`;

  const NECK = `<path d="M708 165H722V185Q715 190 708 185Z" fill="url(#g-skin)"/><path d="M708 167Q715 177 722 167V174Q715 182 708 174Z" fill="#c98f6a" opacity=".4"/>`;
  
  const CROWN = `<path d="M696 144C694 121 704 112 716 112C728 112 737 121 734 144C731 132 726 126.500 716 126.500C706 126.500 700 132.500 696 144Z" fill="url(#g-hair)"/>`;

  const HEAD_BASE = tied => {
    if (!tied) {
      // Распуштена коса (небезбедна опција)
      const back = `<path d="M697 124C684 136 683 166 685 196C686 210 696 216 704 208C700 188 699 170 700 150Z" fill="url(#g-hair)"/>`;
      return `<g filter="url(#sf-sh)">${mir(back)}${back}${NECK}${FACE}${CROWN}</g>`;
    }
    // Врзана коса во репче + заштитни очила (безбедна опција)
    const pony = `<path d="M729 126C752 123 765 153 755 186C752 198 748 206 743 210C746 191 745 171 737 155Z" fill="url(#g-hair)"/><rect x="727" y="125" width="10" height="6.500" rx="3.200" fill="#2f6fd1" transform="rotate(22 732 128)"/>`;
    const goggles = `<path d="M699 136.500H731Q735.500 136.500 735.500 141V148Q735.500 153.500 730 153.500H700Q694.500 153.500 694.500 148V141Q694.500 136.500 699 136.500Z" fill="#d6ecf8" fill-opacity=".35" stroke="#2f6fd1" stroke-width="2.400"/><path d="M712 142Q715 139 718 142" stroke="#2f6fd1" stroke-width="2" fill="none"/>`;
    return `<g filter="url(#sf-sh)">${pony}${NECK}${FACE}${CROWN}</g>${goggles}`;
  };

  const ARM_BARE = `<path d="M683 212C678 232 676 256 675 280L673 292L686 296L690 282C692 262 694 240 694 220Z" fill="url(#g-skin)"/>`;
  
  // Небезбедно торзо (кратка маица и голи раце)
  const TORSO_BAD = `<g filter="url(#sf-sh)">${ARM_BARE}${mir(ARM_BARE)}
    <path d="M689 190Q698 183 708 181Q715 191 722 181Q732 183 741 190L750 213L738 219L737 232Q738 264 736 292H694Q692 264 693 232L692 219L680 213Z" fill="url(#g-teal)"/></g>`;

  const SLEEVE = `<path d="M688 190Q676 198 671 226L665 294L682 298L691 238L694 204Z" fill="url(#g-coat)" stroke="#c4ccd4" stroke-width="1.600"/>`;
  
  // Безбедно торзо (целосен бел лабораториски мантил)
  const TORSO_GOOD = `<g filter="url(#sf-sh)">${SLEEVE}${mir(SLEEVE)}
    <path d="M688 190Q698 183 708 181L715 200L722 181Q732 183 742 190L749 222Q751 262 748 304L753 386Q715 394 677 386L682 304Q679 262 681 222Z" fill="url(#g-coat)" stroke="#c4ccd4" stroke-width="1.600"/></g>
    <path d="M715 204V389" stroke="#cdd5dc" stroke-width="1.600"/>
    <circle cx="721" cy="236" r="2.200" fill="#aeb8c2"/><circle cx="721" cy="268" r="2.200" fill="#aeb8c2"/><circle cx="721" cy="300" r="2.200" fill="#aeb8c2"/>`;

  const LEG_SKIN = `<path d="M696 336C695 372 697 400 699 424C700 438 699 450 700 456L712 456C713 446 712 436 713 424C715 400 714 372 714 340Z" fill="url(#g-skin)"/>`;
  const SANDAL = `<path d="M689 462Q689 458 700 458H714Q718 458 718 463V466Q718 468 714 468H693Q689 468 689 462Z" fill="#b97b35"/>`;
  
  // Небезбедни нозе (шорцеви и сандали)
  const LEGS_BAD = `<g filter="url(#sf-sh)">${LEG_SKIN}${mir(LEG_SKIN)}${SANDAL}${mir(SANDAL)}
    <path d="M694 288H736L740 348Q730 352 722 349L715 324L708 349Q700 352 690 348Z" fill="url(#g-denim)"/></g>`;

  const SHOE = `<path d="M690 470Q690 458 700 457H712Q716 458 716 464V470Z" fill="#2b2b33"/><rect x="689" y="467" width="28" height="5" rx="2.500" fill="#f4f4f4"/>`;
  const LEG_PANT = `<path d="M696 290C694 340 695 410 697 462H713C714 410 715 350 715 300Z" fill="url(#g-pants)"/>`;
  
  // Безбедни нозе (долги панталони и затворени чевли)
  const LEGS_GOOD = `<g filter="url(#sf-sh)">${LEG_PANT}${mir(LEG_PANT)}${SHOE}${mir(SHOE)}</g>`;
