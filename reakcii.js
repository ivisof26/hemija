// Реакции на катјони (податоци од „Квалитативна аналитичка хемија. Практикум“: табелите на крајот од секоја група и реакциите за идентификација).
// Секоја реакција: ion = катјон, r = реагенс, kind = ppt (талог) / soln (промена на боја на растворот) / gas (гас) / flame (пламен),
// prod = формула на производот, col/hex = боја, eq = равенки, star = 1 за групен реагенс или реакција за идентификација (затемнето поле во табелата).
// excess = подоцнежен чекор (вишок од реагенс). Равенките се проверени програмски (атоми и полнеж).

const KATJONI = [
 {
  "id": "Ag",
  "ion": "Ag⁺",
  "name": "сребро(I)",
  "group": "I",
  "sol": null
 },
 {
  "id": "Pb",
  "ion": "Pb²⁺",
  "name": "олово(II)",
  "group": "I",
  "sol": null
 },
 {
  "id": "Hg2",
  "ion": "Hg₂²⁺",
  "name": "жива(I)",
  "group": "I",
  "sol": null
 },
 {
  "id": "Hg",
  "ion": "Hg²⁺",
  "name": "жива(II)",
  "group": "IIa",
  "sol": null
 },
 {
  "id": "Cu",
  "ion": "Cu²⁺",
  "name": "бакар(II)",
  "group": "IIa",
  "sol": "#4aa3df"
 },
 {
  "id": "Cd",
  "ion": "Cd²⁺",
  "name": "кадмиум",
  "group": "IIa",
  "sol": null
 },
 {
  "id": "Bi",
  "ion": "Bi³⁺",
  "name": "бизмут",
  "group": "IIa",
  "sol": null
 },
 {
  "id": "As",
  "ion": "As³⁺",
  "name": "арсен(III)",
  "group": "IIb",
  "sol": null
 },
 {
  "id": "Sb",
  "ion": "Sb³⁺",
  "name": "антимон(III)",
  "group": "IIb",
  "sol": null
 },
 {
  "id": "Sn",
  "ion": "Sn²⁺",
  "name": "калај(II)",
  "group": "IIb",
  "sol": null
 },
 {
  "id": "Al",
  "ion": "Al³⁺",
  "name": "алуминиум",
  "group": "III",
  "sol": null
 },
 {
  "id": "Cr",
  "ion": "Cr³⁺",
  "name": "хром(III)",
  "group": "III",
  "sol": "#5a8f6e"
 },
 {
  "id": "Fe",
  "ion": "Fe³⁺",
  "name": "железо(III)",
  "group": "III",
  "sol": "#d9a441"
 },
 {
  "id": "Co",
  "ion": "Co²⁺",
  "name": "кобалт",
  "group": "IV",
  "sol": "#e58fb0"
 },
 {
  "id": "Ni",
  "ion": "Ni²⁺",
  "name": "никел",
  "group": "IV",
  "sol": "#7fc97f"
 },
 {
  "id": "Mn",
  "ion": "Mn²⁺",
  "name": "манган",
  "group": "IV",
  "sol": "#f3dfe3"
 },
 {
  "id": "Zn",
  "ion": "Zn²⁺",
  "name": "цинк",
  "group": "IV",
  "sol": null
 },
 {
  "id": "Ca",
  "ion": "Ca²⁺",
  "name": "калциум",
  "group": "V",
  "sol": null
 },
 {
  "id": "Sr",
  "ion": "Sr²⁺",
  "name": "стронциум",
  "group": "V",
  "sol": null
 },
 {
  "id": "Ba",
  "ion": "Ba²⁺",
  "name": "бариум",
  "group": "V",
  "sol": null
 },
 {
  "id": "K",
  "ion": "K⁺",
  "name": "калиум",
  "group": "VI",
  "sol": null
 },
 {
  "id": "NH4",
  "ion": "NH₄⁺",
  "name": "амониум",
  "group": "VI",
  "sol": null
 },
 {
  "id": "Mg",
  "ion": "Mg²⁺",
  "name": "магнезиум",
  "group": "VI",
  "sol": null
 },
 {
  "id": "Na",
  "ion": "Na⁺",
  "name": "натриум",
  "group": "VI",
  "sol": null
 },
 {
  "id": "Li",
  "ion": "Li⁺",
  "name": "литиум",
  "group": "VI",
  "sol": null
 }
];

const GRUPI = {
 "I": {
  "name": "I аналитичка група",
  "hint": "Групен реагенс: разредена HCl (таложи на ладно)",
  "table": "Табела 3",
  "reagents": [
   "HCl",
   "KI",
   "K2CrO4",
   "NaOH",
   "Na2HPO4",
   "NH4Br",
   "NH4OH",
   "H2SO4",
   "H2S"
  ]
 },
 "IIa": {
  "name": "IIa аналитичка група",
  "hint": "Групен реагенс: H₂S во кисела средина",
  "table": "Табела 5",
  "reagents": [
   "H2S",
   "NaOH",
   "NH4OH",
   "KI",
   "SnCl2",
   "Na2SnO2",
   "KCN",
   "K4FeCN6",
   "H2O"
  ]
 },
 "IIb": {
  "name": "IIb аналитичка група",
  "hint": "Групен реагенс: H₂S во кисела средина",
  "table": "Табела 6",
  "reagents": [
   "H2S",
   "Zn",
   "H2O",
   "NaOH",
   "HgCl2",
   "AgNO3"
  ]
 },
 "III": {
  "name": "III аналитичка група",
  "hint": "Групен реагенс: NH₄OH во присуство на NH₄Cl",
  "table": "Табела 10",
  "reagents": [
   "NH4OH",
   "NaOH",
   "KSCN",
   "K4FeCN6",
   "Na2CO3",
   "Na2HPO4",
   "CoNO32",
   "H2O2",
   "S2O8",
   "CH3COONa"
  ]
 },
 "IV": {
  "name": "IV аналитичка група",
  "hint": "Групен реагенс: (NH₄)₂S",
  "table": "Табела 12",
  "reagents": [
   "NH42S",
   "NH4OH",
   "NaOH",
   "Na2CO3",
   "Na2HPO4",
   "PbO2",
   "K4FeCN6",
   "K3FeCN6",
   "CoNO32",
   "NH4SCN",
   "HgSCN4",
   "KNO2",
   "DMG"
  ]
 },
 "V": {
  "name": "V аналитичка група",
  "hint": "Групен реагенс: Na₂CO₃",
  "table": "Табела 14",
  "reagents": [
   "Na2CO3",
   "K2Cr2O7",
   "H2SO4",
   "CaSO4",
   "C2O4",
   "Na2HPO4",
   "K4FeCN6",
   "Flame"
  ]
 },
 "VI": {
  "name": "VI аналитичка група",
  "hint": "Нема групен реагенс",
  "table": "Табела 16",
  "reagents": [
   "tartaric",
   "NaCoNO2",
   "H2PtCl6",
   "HClO4",
   "KH2SbO4",
   "UO2Ac",
   "NaOH",
   "K2HgI4",
   "MgPhos",
   "Na2CO3",
   "Flame"
  ]
 }
};

const REAGENSI = {
 "HCl": {
  "label": "HCl",
  "name": "хлороводородна киселина"
 },
 "KI": {
  "label": "KI",
  "name": "калиум јодид"
 },
 "K2CrO4": {
  "label": "K₂CrO₄",
  "name": "калиум хромат (или K₂Cr₂O₇)"
 },
 "NaOH": {
  "label": "NaOH",
  "name": "натриум хидроксид"
 },
 "Na2HPO4": {
  "label": "Na₂HPO₄",
  "name": "натриум хидрогенфосфат"
 },
 "NH4Br": {
  "label": "NH₄Br",
  "name": "амониум бромид"
 },
 "NH4OH": {
  "label": "NH₄OH",
  "name": "амониум хидроксид"
 },
 "H2SO4": {
  "label": "H₂SO₄",
  "name": "сулфурна киселина"
 },
 "H2S": {
  "label": "H₂S",
  "name": "сулфуроводородна вода"
 },
 "SnCl2": {
  "label": "SnCl₂",
  "name": "калај(II) хлорид"
 },
 "Na2SnO2": {
  "label": "Na₂SnO₂ + NaOH",
  "name": "натриум станит (свежо приготвен)"
 },
 "KCN": {
  "label": "KCN",
  "name": "калиум цијанид (отровен!)"
 },
 "K4FeCN6": {
  "label": "K₄[Fe(CN)₆]",
  "name": "калиум хексацијаноферат(II)"
 },
 "H2O": {
  "label": "H₂O",
  "name": "вода (хидролиза)"
 },
 "Zn": {
  "label": "Sn, Zn, Fe",
  "name": "метал (Zn, Sn или Fe)"
 },
 "HgCl2": {
  "label": "HgCl₂",
  "name": "жива(II) хлорид"
 },
 "AgNO3": {
  "label": "AgNO₃",
  "name": "сребро нитрат"
 },
 "KSCN": {
  "label": "KSCN",
  "name": "калиум тиоцијанат"
 },
 "Na2CO3": {
  "label": "Na₂CO₃",
  "name": "натриум карбонат (CO₃²⁻)"
 },
 "CoNO32": {
  "label": "Co(NO₃)₂",
  "name": "кобалт(II) нитрат (по жарење)"
 },
 "H2O2": {
  "label": "H₂O₂ + NaOH",
  "name": "водород пероксид + натриум хидроксид"
 },
 "S2O8": {
  "label": "(NH₄)₂S₂O₈",
  "name": "амониум пероксодисулфат"
 },
 "CH3COONa": {
  "label": "CH₃COONa",
  "name": "натриум ацетат"
 },
 "NH42S": {
  "label": "(NH₄)₂S",
  "name": "амониум сулфид"
 },
 "PbO2": {
  "label": "PbO₂ + HNO₃",
  "name": "олово(IV) оксид + азотна киселина"
 },
 "K3FeCN6": {
  "label": "K₃[Fe(CN)₆]",
  "name": "калиум хексацијаноферат(III)"
 },
 "NH4SCN": {
  "label": "NH₄SCN",
  "name": "амониум тиоцијанат"
 },
 "HgSCN4": {
  "label": "(NH₄)₂[Hg(SCN)₄]",
  "name": "амониум тетратиоцијанатомеркурат(II)"
 },
 "KNO2": {
  "label": "KNO₂ + CH₃COOH",
  "name": "калиум нитрит + оцетна киселина"
 },
 "DMG": {
  "label": "диметилглиоксим",
  "name": "диметилглиоксим (Чугаев реагенс)"
 },
 "K2Cr2O7": {
  "label": "K₂Cr₂O₇",
  "name": "калиум дихромат"
 },
 "CaSO4": {
  "label": "CaSO₄",
  "name": "гипсна вода (заситен CaSO₄)"
 },
 "C2O4": {
  "label": "(NH₄)₂C₂O₄",
  "name": "амониум оксалат"
 },
 "Flame": {
  "label": "пламен",
  "name": "проба на пламен (по сув пат)"
 },
 "tartaric": {
  "label": "H₂C₄H₄O₆",
  "name": "винска киселина"
 },
 "NaCoNO2": {
  "label": "Na₃[Co(NO₂)₆]",
  "name": "натриум хексанитрокобалтат(III)"
 },
 "H2PtCl6": {
  "label": "H₂[PtCl₆]",
  "name": "хексахлороплатинатна киселина"
 },
 "HClO4": {
  "label": "HClO₄",
  "name": "перхлорна киселина"
 },
 "KH2SbO4": {
  "label": "KH₂SbO₄",
  "name": "калиум дихидрогенантимонат"
 },
 "UO2Ac": {
  "label": "(CH₃COO)₂UO₂",
  "name": "уранил ацетат"
 },
 "K2HgI4": {
  "label": "K₂[HgI₄] + KOH",
  "name": "Несслеров реагенс (алкален)"
 },
 "MgPhos": {
  "label": "Na₂HPO₄ + NH₄OH",
  "name": "натриум хидрогенфосфат + амониум хидроксид"
 }
};

const REAKCII = [
 {
  "ion": "Ag",
  "r": "HCl",
  "kind": "ppt",
  "prod": "AgCl",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ag⁺ + Cl⁻ → AgCl↓"
  ],
  "star": 1,
  "obs": "Бел сирест (колоиден) талог. На светлина со време станува виолетов, па црн.",
  "excess": {
   "label": "Додај NH₄OH",
   "kind": "dissolve",
   "obs": "Талогот се раствора (се образува дијамминсребро(I) јон). Ако растворот се закисели со HNO₃, повторно се таложи бел AgCl – ова е реакцијата за идентификација на Ag⁺.",
   "eq": [
    "AgCl + 2NH₃ → [Ag(NH₃)₂]⁺ + Cl⁻",
    "[Ag(NH₃)₂]⁺ + Cl⁻ + 2H⁺ → AgCl↓ + 2NH₄⁺"
   ]
  }
 },
 {
  "ion": "Ag",
  "r": "KI",
  "kind": "ppt",
  "prod": "AgI",
  "col": "бледо жолт",
  "hex": "#f4ea9b",
  "eq": [
   "Ag⁺ + I⁻ → AgI↓"
  ],
  "star": 0
 },
 {
  "ion": "Ag",
  "r": "K2CrO4",
  "kind": "ppt",
  "prod": "Ag₂CrO₄",
  "col": "керамида црвен",
  "hex": "#b8452f",
  "eq": [
   "2Ag⁺ + CrO₄²⁻ → Ag₂CrO₄↓"
  ],
  "star": 1,
  "obs": "Керамида црвен талог. Се раствора во HNO₃ и NH₄OH."
 },
 {
  "ion": "Ag",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Ag₂O",
  "col": "кафен",
  "hex": "#7a4a24",
  "eq": [
   "2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O"
  ],
  "star": 0,
  "obs": "Се таложи нестабилниот AgOH (бел), кој веднаш се разградува до кафен Ag₂O."
 },
 {
  "ion": "Ag",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "Ag₃PO₄",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "3Ag⁺ + 2HPO₄²⁻ → Ag₃PO₄↓ + H₂PO₄⁻"
  ],
  "star": 0,
  "obs": "Жолт талог (во табелата на практикумот е запишан како Ag₃(PO₄)₂, но според текстот формулата е Ag₃PO₄)."
 },
 {
  "ion": "Ag",
  "r": "NH4Br",
  "kind": "ppt",
  "prod": "AgBr",
  "col": "бледо жолт",
  "hex": "#f4ea9b",
  "eq": [
   "Ag⁺ + Br⁻ → AgBr↓"
  ],
  "star": 0
 },
 {
  "ion": "Ag",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Ag₂O",
  "col": "кафен",
  "hex": "#7a4a24",
  "eq": [
   "2Ag⁺ + 2NH₄OH → Ag₂O↓ + 2NH₄⁺ + H₂O"
  ],
  "star": 0,
  "obs": "Кафен талог од Ag₂O (според текстот на практикумот); во вишок NH₄OH се раствора."
 },
 {
  "ion": "Ag",
  "r": "H2SO4",
  "kind": "ppt",
  "prod": "Ag₂SO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "2Ag⁺ + SO₄²⁻ → Ag₂SO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Ag",
  "r": "H2S",
  "kind": "ppt",
  "prod": "Ag₂S",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "2Ag⁺ + H₂S → Ag₂S↓ + 2H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Pb",
  "r": "HCl",
  "kind": "ppt",
  "prod": "PbCl₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Pb²⁺ + 2Cl⁻ → PbCl₂↓"
  ],
  "star": 1,
  "obs": "Бел талог. Се раствора при загревање, а при ладење кристализираат бели игличести кристали."
 },
 {
  "ion": "Pb",
  "r": "KI",
  "kind": "ppt",
  "prod": "PbI₂",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Pb²⁺ + 2I⁻ → PbI₂↓"
  ],
  "star": 0,
  "obs": "Жолт талог. Се раствора при загревање (при ладење се издвојуваат убави жолти кристалчиња) и во вишок KI.",
  "excess": {
   "label": "Додај вишок KI",
   "kind": "dissolve",
   "obs": "Талогот се раствора во вишок од реагенсот (се образува тетраjодоплумбат(II)).",
   "eq": [
    "PbI₂ + 2I⁻ → [PbI₄]²⁻"
   ]
  }
 },
 {
  "ion": "Pb",
  "r": "K2CrO4",
  "kind": "ppt",
  "prod": "PbCrO₄",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Pb²⁺ + CrO₄²⁻ → PbCrO₄↓"
  ],
  "star": 1,
  "obs": "Жолт талог – реакција за идентификација на олово. Се раствора во HNO₃ и во алкални хидроксиди, а не се раствора во оцетна киселина и NH₄OH."
 },
 {
  "ion": "Pb",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Pb(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Pb²⁺ + 2OH⁻ → Pb(OH)₂↓"
  ],
  "star": 0,
  "obs": "Бел талог од Pb(OH)₂ (амфотерен).",
  "excess": {
   "label": "Додај вишок NaOH",
   "kind": "dissolve",
   "obs": "Талогот се раствора во вишок од алкален хидроксид (се образува плумбит).",
   "eq": [
    "Pb(OH)₂ + 2OH⁻ → PbO₂²⁻ + 2H₂O"
   ]
  }
 },
 {
  "ion": "Pb",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "Pb₃(PO₄)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "3Pb²⁺ + 2HPO₄²⁻ → Pb₃(PO₄)₂↓ + 2H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Pb",
  "r": "NH4Br",
  "kind": "ppt",
  "prod": "PbBr₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Pb²⁺ + 2Br⁻ → PbBr₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Pb",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Pb(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Pb²⁺ + 2NH₄OH → Pb(OH)₂↓ + 2NH₄⁺"
  ],
  "star": 0,
  "obs": "Бел талог од Pb(OH)₂, кој не се раствора во вишок NH₄OH."
 },
 {
  "ion": "Pb",
  "r": "H2SO4",
  "kind": "ppt",
  "prod": "PbSO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Pb²⁺ + SO₄²⁻ → PbSO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Pb",
  "r": "H2S",
  "kind": "ppt",
  "prod": "PbS",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Pb²⁺ + H₂S → PbS↓ + 2H⁺"
  ],
  "star": 0,
  "obs": "Прво се таложи портокалов мешовит хлорид-сулфид, кој со вишок H₂S поцрнува и преминува во црн PbS.",
  "stages": [
   "#f08a24",
   "#17171a"
  ]
 },
 {
  "ion": "Hg2",
  "r": "HCl",
  "kind": "ppt",
  "prod": "Hg₂Cl₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Hg₂²⁺ + 2Cl⁻ → Hg₂Cl₂↓"
  ],
  "star": 1,
  "obs": "Бел талог. Со разреден NH₄OH поцрнува (се издвојува ситно диспергирана жива)."
 },
 {
  "ion": "Hg2",
  "r": "KI",
  "kind": "ppt",
  "prod": "Hg₂I₂",
  "col": "зелен",
  "hex": "#3e9b4f",
  "eq": [
   "Hg₂²⁺ + 2I⁻ → Hg₂I₂↓"
  ],
  "star": 0,
  "obs": "Зелен талог, кој се раствора во вишок KI."
 },
 {
  "ion": "Hg2",
  "r": "K2CrO4",
  "kind": "ppt",
  "prod": "Hg₂CrO₄",
  "col": "црвен",
  "hex": "#d62d20",
  "eq": [
   "Hg₂²⁺ + CrO₄²⁻ → Hg₂CrO₄↓"
  ],
  "star": 0,
  "obs": "Црвен талог, нерастворлив во алкални хидроксиди и разредена HNO₃ (за разлика од Ag₂CrO₄)."
 },
 {
  "ion": "Hg2",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Hg₂O",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Hg₂²⁺ + 2OH⁻ → Hg₂O↓ + H₂O"
  ],
  "star": 0,
  "obs": "Црн талог од жива(I) оксид, кој се раствора во HNO₃."
 },
 {
  "ion": "Hg2",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "Hg₂HPO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Hg₂²⁺ + HPO₄²⁻ → Hg₂HPO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Hg2",
  "r": "NH4Br",
  "kind": "ppt",
  "prod": "Hg₂Br₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Hg₂²⁺ + 2Br⁻ → Hg₂Br₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Hg2",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "HgNH₂Cl + Hg",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Hg₂Cl₂ + 2NH₄OH → HgNH₂Cl↓ + Hg↓ + NH₄⁺ + Cl⁻ + 2H₂O"
  ],
  "star": 1,
  "obs": "Бел Hg₂Cl₂ (од HCl) со NH₄OH поцрнува: се добива бел HgNH₂Cl и ситна црна жива. (Во табелата е запишано „HgO“, но според текстот на практикумот производот е HgNH₂Cl + Hg.)"
 },
 {
  "ion": "Hg2",
  "r": "H2SO4",
  "kind": "ppt",
  "prod": "Hg₂SO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Hg₂²⁺ + SO₄²⁻ → Hg₂SO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Hg2",
  "r": "H2S",
  "kind": "ppt",
  "prod": "HgS + Hg",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Hg₂²⁺ + H₂S → HgS↓ + Hg↓ + 2H⁺"
  ],
  "star": 1,
  "obs": "Црн талог: мешавина од HgS и елементарна жива."
 },
 {
  "ion": "Hg",
  "r": "H2S",
  "kind": "ppt",
  "prod": "HgS",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Hg²⁺ + H₂S → HgS↓ + 2H⁺"
  ],
  "star": 1,
  "obs": "Талогот е прво бел, па жолт (мешовит хлорид-сулфид), а со вишок H₂S поцрнува.",
  "stages": [
   "#fbfaf5",
   "#f2d12b",
   "#17171a"
  ]
 },
 {
  "ion": "Hg",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "HgO",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Hg²⁺ + 2OH⁻ → HgO↓ + H₂O"
  ],
  "star": 0,
  "obs": "Жолт талог од жива(II) оксид (нестабилниот Hg(OH)₂ се разградува)."
 },
 {
  "ion": "Hg",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "HgNH₂Cl",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Hg²⁺ + Cl⁻ + 2NH₄OH → HgNH₂Cl↓ + NH₄⁺ + 2H₂O"
  ],
  "star": 0,
  "obs": "Бел талог од амино жива(II) хлорид, кој се раствора во киселини."
 },
 {
  "ion": "Hg",
  "r": "KI",
  "kind": "ppt",
  "prod": "HgI₂",
  "col": "црвен",
  "hex": "#d62d20",
  "eq": [
   "Hg²⁺ + 2I⁻ → HgI₂↓"
  ],
  "star": 1,
  "obs": "Портокалово-црвен талог – реакција за идентификација на Hg²⁺.",
  "excess": {
   "label": "Додај вишок KI",
   "kind": "dissolve",
   "obs": "Талогот се раствора во вишок KI (стабилен комплекс [HgI₄]²⁻, Несслеров реагенс).",
   "eq": [
    "HgI₂ + 2I⁻ → [HgI₄]²⁻"
   ]
  }
 },
 {
  "ion": "Hg",
  "r": "SnCl2",
  "kind": "ppt",
  "prod": "Hg₂Cl₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "2Hg²⁺ + Sn²⁺ + 2Cl⁻ → Hg₂Cl₂↓ + Sn⁴⁺"
  ],
  "star": 1,
  "obs": "Прво бел талог од Hg₂Cl₂. Со голем вишок SnCl₂ талогот поцрнува (редукција до метална жива) – реакција за идентификација.",
  "excess": {
   "label": "Додај вишок SnCl₂",
   "kind": "recolor",
   "hex": "#17171a",
   "obs": "Со вишок SnCl₂ талогот се редуцира до метална жива и поцрнува.",
   "eq": [
    "Hg₂Cl₂ + Sn²⁺ → 2Hg↓ + Sn⁴⁺ + 2Cl⁻"
   ]
  }
 },
 {
  "ion": "Hg",
  "r": "Na2SnO2",
  "kind": "ppt",
  "prod": "HgO",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Hg²⁺ + 2OH⁻ → HgO↓ + H₂O"
  ],
  "star": 0,
  "obs": "Жолт талог од HgO (како кај NaOH)."
 },
 {
  "ion": "Cu",
  "r": "H2S",
  "kind": "ppt",
  "prod": "CuS",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Cu²⁺ + H₂S → CuS↓ + 2H⁺"
  ],
  "star": 1
 },
 {
  "ion": "Cu",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Cu(OH)₂",
  "col": "син",
  "hex": "#2f6fd1",
  "eq": [
   "Cu²⁺ + 2OH⁻ → Cu(OH)₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Cu",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "(CuOH)₂SO₄",
  "col": "зелен",
  "hex": "#3e9b4f",
  "eq": [
   "2Cu²⁺ + SO₄²⁻ + 2NH₄OH → (CuOH)₂SO₄↓ + 2NH₄⁺"
  ],
  "star": 0,
  "obs": "Прво зеленикав талог од базна сол, кој со вишок NH₄OH се раствора и дава интензивно сина боја – реакција за идентификација на бакар.",
  "excess": {
   "label": "Додај вишок NH₄OH",
   "kind": "dissolve",
   "soln": "#1f3fbf",
   "obs": "Талогот се раствора и растворот станува интензивно темно син (тетраамминбакар(II) јон).",
   "eq": [
    "(CuOH)₂SO₄ + 8NH₄OH → 2[Cu(NH₃)₄]²⁺ + SO₄²⁻ + 2OH⁻ + 8H₂O"
   ]
  }
 },
 {
  "ion": "Cu",
  "r": "KI",
  "kind": "ppt",
  "prod": "CuI",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "2Cu²⁺ + 4I⁻ → 2CuI↓ + I₂"
  ],
  "star": 0,
  "obs": "Се таложи бел CuI, а растворот добива кафеава боја од ослободениот јод (I₂).",
  "soln": "#9a5b1f"
 },
 {
  "ion": "Cu",
  "r": "Na2SnO2",
  "kind": "ppt",
  "prod": "Cu(OH)₂",
  "col": "син",
  "hex": "#2f6fd1",
  "eq": [
   "Cu²⁺ + 2OH⁻ → Cu(OH)₂↓"
  ],
  "star": 1,
  "obs": "Син талог од Cu(OH)₂ (тука Bi³⁺ би дал црн талог)."
 },
 {
  "ion": "Cu",
  "r": "KCN",
  "kind": "ppt",
  "prod": "Cu(CN)₂",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Cu²⁺ + 2CN⁻ → Cu(CN)₂↓",
   "2Cu(CN)₂ → 2CuCN↓ + (CN)₂↑"
  ],
  "star": 0,
  "obs": "Прво жолт Cu(CN)₂, кој се разградува до бел CuCN и гас дициан.",
  "stages": [
   "#f2d12b",
   "#fbfaf5"
  ],
  "gas": "(CN)₂"
 },
 {
  "ion": "Cu",
  "r": "K4FeCN6",
  "kind": "ppt",
  "prod": "Cu₂[Fe(CN)₆]",
  "col": "црвено кафен",
  "hex": "#8a3a22",
  "eq": [
   "2Cu²⁺ + [Fe(CN)₆]⁴⁻ → Cu₂[Fe(CN)₆]↓"
  ],
  "star": 0,
  "obs": "Црвено-кафен талог, нерастворлив во киселини."
 },
 {
  "ion": "Cd",
  "r": "H2S",
  "kind": "ppt",
  "prod": "CdS",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Cd²⁺ + H₂S → CdS↓ + 2H⁺"
  ],
  "star": 1
 },
 {
  "ion": "Cd",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Cd(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Cd²⁺ + 2OH⁻ → Cd(OH)₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Cd",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Cd(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Cd²⁺ + 2NH₄OH → Cd(OH)₂↓ + 2NH₄⁺"
  ],
  "star": 0
 },
 {
  "ion": "Cd",
  "r": "Na2SnO2",
  "kind": "ppt",
  "prod": "Cd(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Cd²⁺ + 2OH⁻ → Cd(OH)₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Cd",
  "r": "KCN",
  "kind": "ppt",
  "prod": "Cd(CN)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Cd²⁺ + 2CN⁻ → Cd(CN)₂↓"
  ],
  "star": 1,
  "obs": "Бел талог, кој се раствора во вишок KCN. Растворот на комплексот со H₂S дава жолт CdS (за разлика од бакарниот комплекс) – така се докажува кадмиум покрај бакар.",
  "excess": {
   "label": "Додај вишок KCN",
   "kind": "dissolve",
   "obs": "Талогот се раствора (комплекс [Cd(CN)₄]²⁻). Со додавање H₂S повторно се таложи жолт CdS.",
   "eq": [
    "Cd(CN)₂ + 2CN⁻ → [Cd(CN)₄]²⁻",
    "[Cd(CN)₄]²⁻ + H₂S → CdS↓ + 2HCN + 2CN⁻"
   ]
  }
 },
 {
  "ion": "Bi",
  "r": "H2S",
  "kind": "ppt",
  "prod": "Bi₂S₃",
  "col": "кафен",
  "hex": "#7a4a24",
  "eq": [
   "2Bi³⁺ + 3H₂S → Bi₂S₃↓ + 6H⁺"
  ],
  "star": 1
 },
 {
  "ion": "Bi",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Bi(OH)₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Bi³⁺ + 3OH⁻ → Bi(OH)₃↓"
  ],
  "star": 0,
  "obs": "Бел талог, кој не се раствора во вишок алкален хидроксид."
 },
 {
  "ion": "Bi",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Bi(OH)₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Bi³⁺ + 3NH₄OH → Bi(OH)₃↓ + 3NH₄⁺"
  ],
  "star": 0
 },
 {
  "ion": "Bi",
  "r": "KI",
  "kind": "ppt",
  "prod": "BiI₃",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Bi³⁺ + 3I⁻ → BiI₃↓"
  ],
  "star": 0
 },
 {
  "ion": "Bi",
  "r": "Na2SnO2",
  "kind": "ppt",
  "prod": "Bi",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "2Bi(OH)₃ + 3SnO₂²⁻ → 2Bi↓ + 3SnO₃²⁻ + 3H₂O"
  ],
  "star": 1,
  "obs": "Црн талог од елементарен бизмут – сигурен доказ за Bi³⁺ (редукција со станит).",
  "note": "Прво се таложи Bi(OH)₃: Bi³⁺ + 3OH⁻ → Bi(OH)₃↓"
 },
 {
  "ion": "Bi",
  "r": "H2O",
  "kind": "ppt",
  "prod": "BiOCl",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Bi³⁺ + Cl⁻ + H₂O → BiOCl↓ + 2H⁺"
  ],
  "star": 0,
  "obs": "Бел талог од бизмутил хлорид (хидролиза). Со додавање киселина талогот се раствора."
 },
 {
  "ion": "As",
  "r": "H2S",
  "kind": "ppt",
  "prod": "As₂S₃",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "2As³⁺ + 3H₂S → As₂S₃↓ + 6H⁺"
  ],
  "star": 1
 },
 {
  "ion": "As",
  "r": "AgNO3",
  "kind": "ppt",
  "prod": "Ag₃AsO₃",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "3Ag⁺ + AsO₃³⁻ → Ag₃AsO₃↓"
  ],
  "star": 1,
  "obs": "Жолт талог од сребро арсенит."
 },
 {
  "ion": "Sb",
  "r": "H2S",
  "kind": "ppt",
  "prod": "Sb₂S₃",
  "col": "портокалов",
  "hex": "#f08a24",
  "eq": [
   "2Sb³⁺ + 3H₂S → Sb₂S₃↓ + 6H⁺"
  ],
  "star": 1
 },
 {
  "ion": "Sb",
  "r": "Zn",
  "kind": "ppt",
  "prod": "Sb",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "2Sb³⁺ + 3Zn → 2Sb↓ + 3Zn²⁺"
  ],
  "star": 1,
  "obs": "Црн талог од метален антимон (Zn, Sn или Fe го истиснуваат антимонот)."
 },
 {
  "ion": "Sb",
  "r": "H2O",
  "kind": "ppt",
  "prod": "SbOX",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sb³⁺ + Cl⁻ + H₂O → SbOCl↓ + 2H⁺"
  ],
  "star": 0,
  "obs": "Бел талог од антимонил сол (хидролиза); X е едновалентен анјон (Cl⁻, NO₃⁻ и сл.)."
 },
 {
  "ion": "Sb",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Sb(OH)₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sb³⁺ + 3OH⁻ → Sb(OH)₃↓"
  ],
  "star": 0
 },
 {
  "ion": "Sn",
  "r": "H2S",
  "kind": "ppt",
  "prod": "SnS",
  "col": "кафен",
  "hex": "#7a4a24",
  "eq": [
   "Sn²⁺ + H₂S → SnS↓ + 2H⁺"
  ],
  "star": 1
 },
 {
  "ion": "Sn",
  "r": "H2O",
  "kind": "ppt",
  "prod": "Sn(OH)+",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sn²⁺ + H₂O → Sn(OH)⁺ + H⁺"
  ],
  "star": 0,
  "obs": "Хидролиза: растворот се матни (бело)."
 },
 {
  "ion": "Sn",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Sn(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sn²⁺ + 2OH⁻ → Sn(OH)₂↓"
  ],
  "star": 0,
  "obs": "Бел пивтиест талог, кој се раствора во вишок NaOH (станит).",
  "excess": {
   "label": "Додај вишок NaOH",
   "kind": "dissolve",
   "obs": "Талогот се раствора во вишок NaOH и се добива станит (Na₂SnO₂).",
   "eq": [
    "Sn(OH)₂ + 2OH⁻ → SnO₂²⁻ + 2H₂O"
   ]
  }
 },
 {
  "ion": "Sn",
  "r": "HgCl2",
  "kind": "ppt",
  "prod": "Hg₂Cl₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "2Hg²⁺ + Sn²⁺ + 2Cl⁻ → Hg₂Cl₂↓ + Sn⁴⁺"
  ],
  "star": 1,
  "obs": "Прво бел талог од Hg₂Cl₂. Со вишок на Sn²⁺ талогот поцрнува (метална жива) – реакција за идентификација.",
  "excess": {
   "label": "Додај уште Sn²⁺",
   "kind": "recolor",
   "hex": "#17171a",
   "obs": "Со вишок на калај(II) талогот се редуцира до метална жива и поцрнува.",
   "eq": [
    "Hg₂Cl₂ + Sn²⁺ → 2Hg↓ + Sn⁴⁺ + 2Cl⁻"
   ]
  }
 },
 {
  "ion": "Al",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Al(OH)₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Al³⁺ + 3NH₄OH → Al(OH)₃↓ + 3NH₄⁺"
  ],
  "star": 1,
  "obs": "Бел пивтиест (желатинозен) талог."
 },
 {
  "ion": "Al",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Al(OH)₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Al³⁺ + 3OH⁻ → Al(OH)₃↓"
  ],
  "star": 1,
  "obs": "Бел пивтиест талог. Al(OH)₃ е амфотерен: се раствора во вишок алкален хидроксид.",
  "excess": {
   "label": "Додај вишок NaOH",
   "kind": "dissolve",
   "obs": "Талогот се раствора во вишок NaOH (се образува метаалуминат).",
   "eq": [
    "Al(OH)₃ + OH⁻ → AlO₂⁻ + 2H₂O"
   ]
  }
 },
 {
  "ion": "Al",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "Al(OH)₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "2Al³⁺ + 3CO₃²⁻ + 3H₂O → 2Al(OH)₃↓ + 3CO₂↑"
  ],
  "star": 0,
  "obs": "Бел талог од Al(OH)₃ и ослободување на CO₂ (хидролиза).",
  "gas": "CO₂"
 },
 {
  "ion": "Al",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "AlPO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Al³⁺ + HPO₄²⁻ → AlPO₄↓ + H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Al",
  "r": "CoNO32",
  "kind": "ppt",
  "prod": "Co(AlO₂)₂",
  "col": "син",
  "hex": "#2f6fd1",
  "eq": [
   "2Al₂(SO₄)₃ + 2Co(NO₃)₂ → 2Co(AlO₂)₂ + 6SO₃ + 4NO₂ + O₂"
  ],
  "star": 0,
  "obs": "Сува реакција: навлажнета филтер-хартија со Al³⁺ и Co(NO₃)₂ се жари – се добива син Co(AlO₂)₂ (Тенарово сино).",
  "note": "Равенката е молекулска (со Al₂(SO₄)₃) и се случува при жарење."
 },
 {
  "ion": "Cr",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Cr(OH)₃",
  "col": "сиво зелен",
  "hex": "#7f9a80",
  "eq": [
   "Cr³⁺ + 3NH₄OH → Cr(OH)₃↓ + 3NH₄⁺"
  ],
  "star": 1
 },
 {
  "ion": "Cr",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Cr(OH)₃",
  "col": "сино зелен",
  "hex": "#2b9a8e",
  "eq": [
   "Cr³⁺ + 3OH⁻ → Cr(OH)₃↓"
  ],
  "star": 0,
  "obs": "Сино-зелен талог од Cr(OH)₃, кој се раствора во вишок NaOH (светло зелен хромит).",
  "excess": {
   "label": "Додај вишок NaOH",
   "kind": "dissolve",
   "soln": "#7fc97f",
   "obs": "Талогот се раствора во вишок NaOH и се добива светло зелен раствор (хромит).",
   "eq": [
    "Cr(OH)₃ + OH⁻ → CrO₂⁻ + 2H₂O"
   ]
  }
 },
 {
  "ion": "Cr",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "CrPO₄",
  "col": "зелен",
  "hex": "#3e9b4f",
  "eq": [
   "Cr³⁺ + HPO₄²⁻ → CrPO₄↓ + H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Cr",
  "r": "H2O2",
  "kind": "soln",
  "prod": "CrO₄²⁻",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "2Cr³⁺ + 3H₂O₂ + 10OH⁻ → 2CrO₄²⁻ + 8H₂O"
  ],
  "star": 1,
  "obs": "Во алкална средина H₂O₂ го оксидира Cr³⁺ до жолт хромат – растворот станува жолт.",
  "soln": "#f2d12b"
 },
 {
  "ion": "Cr",
  "r": "S2O8",
  "kind": "soln",
  "prod": "Cr₂O₇²⁻",
  "col": "портокалов",
  "hex": "#f08a24",
  "eq": [
   "2Cr³⁺ + 3S₂O₈²⁻ + 7H₂O → Cr₂O₇²⁻ + 6SO₄²⁻ + 14H⁺"
  ],
  "star": 0,
  "obs": "Во кисела средина (со Ag⁺ како катализатор, при загревање) Cr³⁺ се оксидира до дихромат – растворот станува портокалов.",
  "soln": "#f08a24"
 },
 {
  "ion": "Fe",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Fe(OH)₃",
  "col": "црвено кафен",
  "hex": "#8a3a22",
  "eq": [
   "Fe³⁺ + 3NH₄OH → Fe(OH)₃↓ + 3NH₄⁺"
  ],
  "star": 1
 },
 {
  "ion": "Fe",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Fe(OH)₃",
  "col": "црвено кафен",
  "hex": "#8a3a22",
  "eq": [
   "Fe³⁺ + 3OH⁻ → Fe(OH)₃↓"
  ],
  "star": 0
 },
 {
  "ion": "Fe",
  "r": "KSCN",
  "kind": "soln",
  "prod": "Fe(SCN)₃",
  "col": "црвен",
  "hex": "#d62d20",
  "eq": [
   "Fe³⁺ + 3SCN⁻ → Fe(SCN)₃"
  ],
  "star": 1,
  "obs": "Растворот станува крвно црвен (Fe(SCN)₃).",
  "soln": "#c8201a"
 },
 {
  "ion": "Fe",
  "r": "K4FeCN6",
  "kind": "ppt",
  "prod": "Fe₄[Fe(CN)₆]₃",
  "col": "син",
  "hex": "#2f6fd1",
  "eq": [
   "4Fe³⁺ + 3[Fe(CN)₆]⁴⁻ → Fe₄[Fe(CN)₆]₃↓"
  ],
  "star": 1,
  "obs": "Интензивно син талог – берлинско сино (реакција за идентификација на Fe³⁺)."
 },
 {
  "ion": "Fe",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "Fe(OH)₃",
  "col": "црвено кафен",
  "hex": "#8a3a22",
  "eq": [
   "2Fe³⁺ + 3CO₃²⁻ + 3H₂O → 2Fe(OH)₃↓ + 3CO₂↑"
  ],
  "star": 0,
  "obs": "Црвено-кафен талог (базна сол/Fe(OH)₃) и ослободување на CO₂.",
  "gas": "CO₂"
 },
 {
  "ion": "Fe",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "FePO₄",
  "col": "бледо жолт",
  "hex": "#f4ea9b",
  "eq": [
   "Fe³⁺ + HPO₄²⁻ → FePO₄↓ + H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Fe",
  "r": "CH3COONa",
  "kind": "soln",
  "prod": "[Fe₃(CH₃COO)₆O]+",
  "col": "црвен",
  "hex": "#d62d20",
  "eq": [
   "3Fe³⁺ + 6CH₃COO⁻ + H₂O → [Fe₃(CH₃COO)₆O]⁺ + 2H⁺"
  ],
  "star": 0,
  "obs": "На ладно се добива црвено комплексно соединение; при загревање се издвојува како талог.",
  "soln": "#b3261e",
  "note": "Во табелата на практикумот оваа реакција е запишана под Cr³⁺, но формулата содржи железо и текстот ја опишува за Fe³⁺."
 },
 {
  "ion": "Co",
  "r": "NH42S",
  "kind": "ppt",
  "prod": "CoS",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Co²⁺ + S²⁻ → CoS↓"
  ],
  "star": 1
 },
 {
  "ion": "Co",
  "r": "NH4OH",
  "kind": "soln",
  "prod": "[Co(NH₃)₆]²⁺",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Co²⁺ + 6NH₄OH → [Co(NH₃)₆]²⁺ + 6H₂O"
  ],
  "star": 0,
  "obs": "Со вишок NH₄OH се добива жолт раствор на комплексен јон.",
  "soln": "#d9a441"
 },
 {
  "ion": "Co",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Co(OH)Cl",
  "col": "син",
  "hex": "#2f6fd1",
  "eq": [
   "Co²⁺ + Cl⁻ + OH⁻ → Co(OH)Cl↓"
  ],
  "star": 0,
  "obs": "Син талог од базна сол; со вишок алкалии преминува во розев Co(OH)₂."
 },
 {
  "ion": "Co",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "(CoOH)₂CO₃",
  "col": "црвена",
  "hex": "#b5395b",
  "eq": [
   "2Co²⁺ + 2CO₃²⁻ + H₂O → (CoOH)₂CO₃↓ + CO₂↑"
  ],
  "star": 0,
  "obs": "Базна сол со црвена боја.",
  "gas": "CO₂"
 },
 {
  "ion": "Co",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "Co₃(PO₄)₂",
  "col": "виолетов",
  "hex": "#7b3fa6",
  "eq": [
   "3Co²⁺ + 2HPO₄²⁻ → Co₃(PO₄)₂↓ + 2H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Co",
  "r": "NH4SCN",
  "kind": "soln",
  "prod": "[Co(SCN)₄]²⁻",
  "col": "син",
  "hex": "#2f6fd1",
  "eq": [
   "Co²⁺ + 4SCN⁻ → [Co(SCN)₄]²⁻"
  ],
  "star": 0,
  "obs": "Син раствор на комплексот (во присуство на амил алкохол).",
  "soln": "#2f6fd1"
 },
 {
  "ion": "Co",
  "r": "HgSCN4",
  "kind": "ppt",
  "prod": "Co[Hg(SCN)₄]",
  "col": "син",
  "hex": "#2f6fd1",
  "eq": [
   "Co²⁺ + [Hg(SCN)₄]²⁻ → Co[Hg(SCN)₄]↓"
  ],
  "star": 1,
  "obs": "Син талог – реакција за идентификација на Co²⁺ (со малку ZnSO₄ како катализатор)."
 },
 {
  "ion": "Co",
  "r": "KNO2",
  "kind": "ppt",
  "prod": "K₃[Co(NO₂)₆]",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Co²⁺ + 7NO₂⁻ + 3K⁺ + 2CH₃COOH → K₃[Co(NO₂)₆]↓ + NO + 2CH₃COO⁻ + H₂O"
  ],
  "star": 0,
  "obs": "Жолт кристален талог од калиум хексанитрокобалтат(III).",
  "gas": "NO"
 },
 {
  "ion": "Ni",
  "r": "NH42S",
  "kind": "ppt",
  "prod": "NiS",
  "col": "црн",
  "hex": "#17171a",
  "eq": [
   "Ni²⁺ + S²⁻ → NiS↓"
  ],
  "star": 1
 },
 {
  "ion": "Ni",
  "r": "NH4OH",
  "kind": "soln",
  "prod": "[Ni(NH₃)₆]²⁺",
  "col": "син",
  "hex": "#2f6fd1",
  "eq": [
   "Ni²⁺ + 6NH₄OH → [Ni(NH₃)₆]²⁺ + 6H₂O"
  ],
  "star": 0,
  "obs": "Прво зелен талог од базна сол, кој со вишок NH₄OH се раствора и дава син раствор.",
  "soln": "#2f6fd1"
 },
 {
  "ion": "Ni",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Ni(OH)₂",
  "col": "зелен",
  "hex": "#3e9b4f",
  "eq": [
   "Ni²⁺ + 2OH⁻ → Ni(OH)₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Ni",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "NiCO₃",
  "col": "зелен",
  "hex": "#3e9b4f",
  "eq": [
   "Ni²⁺ + CO₃²⁻ → NiCO₃↓"
  ],
  "star": 0
 },
 {
  "ion": "Ni",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "Ni₃(PO₄)₂",
  "col": "зелен",
  "hex": "#3e9b4f",
  "eq": [
   "3Ni²⁺ + 2HPO₄²⁻ → Ni₃(PO₄)₂↓ + 2H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Ni",
  "r": "DMG",
  "kind": "ppt",
  "prod": "Ni(C₄H₇N₂O₂)₂",
  "col": "црвен",
  "hex": "#d6334f",
  "eq": [
   "Ni²⁺ + 2C₄H₈N₂O₂ → Ni(C₄H₇N₂O₂)₂↓ + 2H⁺"
  ],
  "star": 1,
  "obs": "Црвен волуминозен талог (бис(диметилглиоксимато)никел(II)) во амонијачна средина – реакција за идентификација на никел."
 },
 {
  "ion": "Mn",
  "r": "NH42S",
  "kind": "ppt",
  "prod": "MnS",
  "col": "месо боја",
  "hex": "#e7b4a0",
  "eq": [
   "Mn²⁺ + S²⁻ → MnS↓"
  ],
  "star": 1,
  "obs": "Талог со боја на месо (розево-портокалово)."
 },
 {
  "ion": "Mn",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Mn(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Mn²⁺ + 2NH₄OH → Mn(OH)₂↓ + 2NH₄⁺"
  ],
  "star": 0
 },
 {
  "ion": "Mn",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Mn(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Mn²⁺ + 2OH⁻ → Mn(OH)₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Mn",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "MnCO₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Mn²⁺ + CO₃²⁻ → MnCO₃↓"
  ],
  "star": 0
 },
 {
  "ion": "Mn",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "Mn₃(PO₄)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "3Mn²⁺ + 2HPO₄²⁻ → Mn₃(PO₄)₂↓ + 2H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Mn",
  "r": "PbO2",
  "kind": "soln",
  "prod": "MnO₄⁻",
  "col": "виолетов",
  "hex": "#7b3fa6",
  "eq": [
   "2Mn²⁺ + 5PbO₂ + 4H⁺ → 2MnO₄⁻ + 5Pb²⁺ + 2H₂O"
  ],
  "star": 1,
  "obs": "Со PbO₂ во азотна киселина (при загревање) Mn²⁺ се оксидира до перманганат – растворот станува виолетов.",
  "soln": "#7b2c9e"
 },
 {
  "ion": "Zn",
  "r": "NH42S",
  "kind": "ppt",
  "prod": "ZnS",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Zn²⁺ + S²⁻ → ZnS↓"
  ],
  "star": 1
 },
 {
  "ion": "Zn",
  "r": "NH4OH",
  "kind": "ppt",
  "prod": "Zn(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Zn²⁺ + 2NH₄OH → Zn(OH)₂↓ + 2NH₄⁺"
  ],
  "star": 0,
  "obs": "Бел талог, кој се раствора во вишок NH₄OH (комплекс).",
  "excess": {
   "label": "Додај вишок NH₄OH",
   "kind": "dissolve",
   "obs": "Талогот се раствора во вишок NH₄OH (комплексен јон [Zn(NH₃)₆]²⁺).",
   "eq": [
    "Zn(OH)₂ + 6NH₄OH → [Zn(NH₃)₆]²⁺ + 2OH⁻ + 6H₂O"
   ]
  }
 },
 {
  "ion": "Zn",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Zn(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Zn²⁺ + 2OH⁻ → Zn(OH)₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Zn",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "ZnCO₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Zn²⁺ + CO₃²⁻ → ZnCO₃↓"
  ],
  "star": 0
 },
 {
  "ion": "Zn",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "Zn₃(PO₄)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "3Zn²⁺ + 2HPO₄²⁻ → Zn₃(PO₄)₂↓ + 2H⁺"
  ],
  "star": 0
 },
 {
  "ion": "Zn",
  "r": "K4FeCN6",
  "kind": "ppt",
  "prod": "K₂Zn₃[Fe(CN)₆]₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "3Zn²⁺ + 2K⁺ + 2[Fe(CN)₆]⁴⁻ → K₂Zn₃[Fe(CN)₆]₂↓"
  ],
  "star": 0,
  "obs": "Бел талог – двоен сол, се раствора во бази. Служи за идентификација на цинк."
 },
 {
  "ion": "Zn",
  "r": "K3FeCN6",
  "kind": "ppt",
  "prod": "Zn₃[Fe(CN)₆]₂",
  "col": "жолто кафен",
  "hex": "#b98a2e",
  "eq": [
   "3Zn²⁺ + 2[Fe(CN)₆]³⁻ → Zn₃[Fe(CN)₆]₂↓"
  ],
  "star": 0
 },
 {
  "ion": "Zn",
  "r": "CoNO32",
  "kind": "ppt",
  "prod": "CoZnO₂",
  "col": "зелен",
  "hex": "#3e9b4f",
  "eq": [
   "Zn(NO₃)₂ + Co(NO₃)₂ → CoZnO₂ + 4NO₂ + O₂"
  ],
  "star": 0,
  "obs": "Сува реакција: филтер-хартија со Zn²⁺ и Co(NO₃)₂ се жари – по работ се добива зелена боја (Ринманово зелено).",
  "note": "Равенката е молекулска и се случува при жарење."
 },
 {
  "ion": "Ca",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "CaCO₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ca²⁺ + CO₃²⁻ → CaCO₃↓"
  ],
  "star": 1
 },
 {
  "ion": "Sr",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "SrCO₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sr²⁺ + CO₃²⁻ → SrCO₃↓"
  ],
  "star": 1
 },
 {
  "ion": "Ba",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "BaCO₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ba²⁺ + CO₃²⁻ → BaCO₃↓"
  ],
  "star": 1
 },
 {
  "ion": "Ba",
  "r": "K2Cr2O7",
  "kind": "ppt",
  "prod": "BaCrO₄",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "2Ba²⁺ + Cr₂O₇²⁻ + H₂O → 2BaCrO₄↓ + 2H⁺"
  ],
  "star": 1,
  "obs": "Жолт талог од BaCrO₄ – реакција за идентификација на Ba²⁺."
 },
 {
  "ion": "Sr",
  "r": "H2SO4",
  "kind": "ppt",
  "prod": "SrSO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sr²⁺ + SO₄²⁻ → SrSO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Ba",
  "r": "H2SO4",
  "kind": "ppt",
  "prod": "BaSO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ba²⁺ + SO₄²⁻ → BaSO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Sr",
  "r": "CaSO4",
  "kind": "ppt",
  "prod": "SrSO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sr²⁺ + SO₄²⁻ → SrSO₄↓"
  ],
  "star": 1,
  "obs": "Со гипсна вода талогот од SrSO₄ се појавува по извесно време (Ca²⁺ не дава талог)."
 },
 {
  "ion": "Ca",
  "r": "C2O4",
  "kind": "ppt",
  "prod": "CaC₂O₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ca²⁺ + C₂O₄²⁻ → CaC₂O₄↓"
  ],
  "star": 1
 },
 {
  "ion": "Sr",
  "r": "C2O4",
  "kind": "ppt",
  "prod": "SrC₂O₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sr²⁺ + C₂O₄²⁻ → SrC₂O₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Ba",
  "r": "C2O4",
  "kind": "ppt",
  "prod": "BaC₂O₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ba²⁺ + C₂O₄²⁻ → BaC₂O₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Ca",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "CaHPO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ca²⁺ + HPO₄²⁻ → CaHPO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Sr",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "SrHPO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Sr²⁺ + HPO₄²⁻ → SrHPO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Ba",
  "r": "Na2HPO4",
  "kind": "ppt",
  "prod": "BaHPO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ba²⁺ + HPO₄²⁻ → BaHPO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Ca",
  "r": "K4FeCN6",
  "kind": "ppt",
  "prod": "Ca(NH₄)₂[Fe(CN)₆]",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ca²⁺ + 2NH₄⁺ + [Fe(CN)₆]⁴⁻ → Ca(NH₄)₂[Fe(CN)₆]↓"
  ],
  "star": 0,
  "obs": "Бел талог (во присуство на NH₄Cl)."
 },
 {
  "ion": "Ba",
  "r": "K4FeCN6",
  "kind": "ppt",
  "prod": "Ba(NH₄)₂[Fe(CN)₆]",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Ba²⁺ + 2NH₄⁺ + [Fe(CN)₆]⁴⁻ → Ba(NH₄)₂[Fe(CN)₆]↓"
  ],
  "star": 0
 },
 {
  "ion": "Ca",
  "r": "Flame",
  "kind": "flame",
  "prod": "",
  "col": null,
  "hex": "#d2552b",
  "eq": [],
  "star": 1,
  "obs": "Тула (цигла) црвена боја на пламенот."
 },
 {
  "ion": "Sr",
  "r": "Flame",
  "kind": "flame",
  "prod": "",
  "col": null,
  "hex": "#e0183c",
  "eq": [],
  "star": 1,
  "obs": "Кармин црвена боја на пламенот."
 },
 {
  "ion": "Ba",
  "r": "Flame",
  "kind": "flame",
  "prod": "",
  "col": null,
  "hex": "#6fcf3a",
  "eq": [],
  "star": 1,
  "obs": "Зелена боја на пламенот."
 },
 {
  "ion": "K",
  "r": "tartaric",
  "kind": "ppt",
  "prod": "KHC₄H₄O₆",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "K⁺ + H₂C₄H₄O₆ → KHC₄H₄O₆↓ + H⁺"
  ],
  "star": 1,
  "obs": "Бел кристален талог од калиум хидрогентартарат."
 },
 {
  "ion": "K",
  "r": "NaCoNO2",
  "kind": "ppt",
  "prod": "K₂Na[Co(NO₂)₆]",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "2K⁺ + Na⁺ + [Co(NO₂)₆]³⁻ → K₂Na[Co(NO₂)₆]↓"
  ],
  "star": 1,
  "obs": "Жолт талог – реакција за идентификација на K⁺ (во отсуство на NH₄⁺, кој исто така дава талог)."
 },
 {
  "ion": "K",
  "r": "H2PtCl6",
  "kind": "ppt",
  "prod": "K₂[PtCl₆]",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "2K⁺ + [PtCl₆]²⁻ → K₂[PtCl₆]↓"
  ],
  "star": 0
 },
 {
  "ion": "K",
  "r": "HClO4",
  "kind": "ppt",
  "prod": "KClO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "K⁺ + ClO₄⁻ → KClO₄↓"
  ],
  "star": 0
 },
 {
  "ion": "K",
  "r": "UO2Ac",
  "kind": "ppt",
  "prod": "KUO₂(CH₃COO)₃",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "K⁺ + UO₂²⁺ + 3CH₃COO⁻ → KUO₂(CH₃COO)₃↓"
  ],
  "star": 0
 },
 {
  "ion": "K",
  "r": "Flame",
  "kind": "flame",
  "prod": "",
  "col": null,
  "hex": "#9b59d0",
  "eq": [],
  "star": 1,
  "obs": "Виолетова боја на пламенот."
 },
 {
  "ion": "NH4",
  "r": "UO2Ac",
  "kind": "ppt",
  "prod": "NH₄UO₂(CH₃COO)₃",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "NH₄⁺ + UO₂²⁺ + 3CH₃COO⁻ → NH₄UO₂(CH₃COO)₃↓"
  ],
  "star": 0
 },
 {
  "ion": "NH4",
  "r": "NaOH",
  "kind": "gas",
  "prod": "NH₃",
  "col": null,
  "hex": null,
  "eq": [
   "NH₄⁺ + OH⁻ → NH₃↑ + H₂O"
  ],
  "star": 0,
  "obs": "Се ослободува амонијак (гас со остар мирис, го вообојува навлажнетата црвена лакмус хартија сино).",
  "gas": "NH₃"
 },
 {
  "ion": "NH4",
  "r": "K2HgI4",
  "kind": "ppt",
  "prod": "[O(Hg)₂NH₂]I",
  "col": "црвено кафен",
  "hex": "#8a3a22",
  "eq": [
   "NH₄⁺ + 2[HgI₄]²⁻ + 4OH⁻ → [O(Hg)₂NH₂]I↓ + 7I⁻ + 3H₂O"
  ],
  "star": 1,
  "obs": "Црвено-кафен талог (Несслеров реагенс) – реакција за идентификација на NH₄⁺. При мала концентрација само се добива црвено-кафена боја."
 },
 {
  "ion": "Mg",
  "r": "UO2Ac",
  "kind": "ppt",
  "prod": "MgUO₂(CH₃COO)₄",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Mg²⁺ + UO₂²⁺ + 4CH₃COO⁻ → MgUO₂(CH₃COO)₄↓"
  ],
  "star": 0
 },
 {
  "ion": "Mg",
  "r": "NaOH",
  "kind": "ppt",
  "prod": "Mg(OH)₂",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Mg²⁺ + 2OH⁻ → Mg(OH)₂↓"
  ],
  "star": 1
 },
 {
  "ion": "Mg",
  "r": "MgPhos",
  "kind": "ppt",
  "prod": "MgNH₄PO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Mg²⁺ + HPO₄²⁻ + NH₄OH → MgNH₄PO₄↓ + H₂O"
  ],
  "star": 1,
  "obs": "Бел кристален талог (под микроскоп во форма на ѕвездички) – реакција за идентификација на Mg²⁺."
 },
 {
  "ion": "Mg",
  "r": "Na2CO3",
  "kind": "ppt",
  "prod": "(MgOH)₂CO₃",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "2Mg²⁺ + 2CO₃²⁻ + H₂O → (MgOH)₂CO₃↓ + CO₂↑"
  ],
  "star": 1,
  "obs": "Бел, аморфен талог од базен магнезиум карбонат.",
  "gas": "CO₂"
 },
 {
  "ion": "Na",
  "r": "KH2SbO4",
  "kind": "ppt",
  "prod": "NaH₂SbO₄",
  "col": "бел",
  "hex": "#fbfaf5",
  "eq": [
   "Na⁺ + H₂SbO₄⁻ → NaH₂SbO₄↓"
  ],
  "star": 1,
  "obs": "Бел кристален талог (потребен е доволно концентриран раствор)."
 },
 {
  "ion": "Na",
  "r": "UO2Ac",
  "kind": "ppt",
  "prod": "NaUO₂(CH₃COO)₃",
  "col": "жолт",
  "hex": "#f2d12b",
  "eq": [
   "Na⁺ + UO₂²⁺ + 3CH₃COO⁻ → NaUO₂(CH₃COO)₃↓"
  ],
  "star": 0
 },
 {
  "ion": "Na",
  "r": "Flame",
  "kind": "flame",
  "prod": "",
  "col": null,
  "hex": "#f5c518",
  "eq": [],
  "star": 1,
  "obs": "Жолта боја на пламенот."
 },
 {
  "ion": "Li",
  "r": "Flame",
  "kind": "flame",
  "prod": "",
  "col": null,
  "hex": "#d81b3a",
  "eq": [],
  "star": 1,
  "obs": "Црвена (кармин) боја на пламенот."
 }
];
