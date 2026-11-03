// pH-калкулатор (се вчитува по alatki.js; табовите ги управува alatki.js)
(function () {
  const $ = id => document.getElementById(id);
  const F = { pH: $("ph-pH"), pOH: $("ph-pOH"), H: $("ph-H"), OH: $("ph-OH") };
  if (!F.pH) return;
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = n => String(n).split("").map(c => (c === "-" ? "⁻" : SUP[+c])).join("");

  function parse(str) {
    let s = str.trim();
    if (!s) return null;
    s = s.replace(/\s/g, "").replace(/,/g, ".").replace(/−/g, "-").replace(/[·×x*]10\^?/i, "e");
    s = Array.from(s).map(c => (SUP.includes(c) ? String(SUP.indexOf(c)) : c === "⁻" ? "-" : c)).join("");
    const v = Number(s);
    return isFinite(v) ? v : NaN;
  }
  const fmtPH = x => String(+x.toFixed(2)).replace(".", ",");
  function fmtConc(x) {
    if (x >= 0.01 && x < 1000) return String(+x.toPrecision(3)).replace(".", ",");
    const e = Math.floor(Math.log10(x));
    const m = +(x / Math.pow(10, e)).toPrecision(3);
    return String(m).replace(".", ",") + " · 10" + sup(e);
  }

  let last = null;
  function showError(msg) { $("ph-error").textContent = msg; $("ph-error").hidden = !msg; }

  function setAll(pH) {
    if (pH < -2 || pH > 16) { showError("Вредноста е надвор од реалниот опсег (pH обично е меѓу 0 и 14)."); $("ph-result").hidden = true; return; }
    showError("");
    Object.values(F).forEach(e => e.classList.remove("bad"));
    const pOH = 14 - pH;
    if (last !== "pH") F.pH.value = fmtPH(pH);
    if (last !== "pOH") F.pOH.value = fmtPH(pOH);
    if (last !== "H") F.H.value = fmtConc(Math.pow(10, -pH));
    if (last !== "OH") F.OH.value = fmtConc(Math.pow(10, -pOH));
    render(pH);
  }

  function render(pH) {
    const res = $("ph-result");
    res.hidden = false;
    const r = Math.round(pH * 100) / 100;
    let verdict, c1, c2;
    if (Math.abs(r - 7) < 0.005) { verdict = "Неутрален раствор"; c1 = "#2e7d4f"; c2 = "#3f9d6a"; }
    else if (r < 7) { verdict = r < 3 ? "Силно кисел раствор" : "Кисел раствор"; c1 = "#b3261e"; c2 = "#e0692c"; }
    else { verdict = r > 11 ? "Силно базен раствор" : "Базен раствор"; c1 = "#2d4a9a"; c2 = "#6a2c70"; }
    $("ph-verdict").textContent = verdict;
    $("ph-val").textContent = fmtPH(pH);
    $("ph-big").style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
    $("ph-marker").style.left = Math.max(0, Math.min(100, (pH / 14) * 100)) + "%";
  }

  function from(which) {
    last = which;
    const v = parse(F[which].value);
    Object.values(F).forEach(e => e.classList.remove("bad"));
    if (v === null) { Object.keys(F).forEach(k => { if (k !== which) F[k].value = ""; }); $("ph-result").hidden = true; showError(""); return; }
    if (Number.isNaN(v) || ((which === "H" || which === "OH") && v <= 0)) {
      F[which].classList.add("bad"); $("ph-result").hidden = true;
      showError(which === "H" || which === "OH" ? "Концентрацијата мора да е позитивен број (на пример 0,001 или 1e-3)." : "Внеси број, на пример 3 или 7,4.");
      return;
    }
    let pH;
    if (which === "pH") pH = v;
    else if (which === "pOH") pH = 14 - v;
    else if (which === "H") pH = -Math.log10(v);
    else pH = 14 + Math.log10(v);
    setAll(pH);
  }
  Object.keys(F).forEach(k => F[k].addEventListener("input", () => from(k)));

  // силна киселина / база (со поправена формула за H2SO4 преку Ka2)
  function fromConc() {
    const v = parse($("ph-c").value);
    $("ph-c").classList.remove("bad");
    if (v === null) return;
    if (Number.isNaN(v) || v <= 0) { $("ph-c").classList.add("bad"); showError("Концентрацијата мора да е позитивен број."); return; }
    
    const t = $("ph-type").value;
    let pH;

    if (t === "a2") { 
      // Пресметка за H2SO4 со земање предвид на вториот степен на дисоцијација (Ka2 ≈ 0.012)
      const Ka2 = 0.012;
      const a = 1;
      const b = v + Ka2;
      const c = -Ka2 * v;
      const x = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      const hTotal = v + x;
      pH = -Math.log10(hTotal);
    } else {
      const n = t.endsWith("2") ? 2 : 1;
      pH = t[0] === "a" ? -Math.log10(v * n) : 14 + Math.log10(v * n);
    }

    last = null;
    setAll(pH);
    showError(pH < 0 || pH > 14 ? "Забелешка: при толку голема концентрација формулата pH = −log[H⁺] е само приближна." : "");
  }
  $("ph-c").addEventListener("input", fromConc);
  $("ph-type").addEventListener("change", fromConc);

  // примери
  const EX = [["Желудочна киселина", 1.5], ["Лимонов сок", 2.2], ["Кафе", 5], ["Чиста вода", 7], ["Крв", 7.4], ["Морска вода", 8.1], ["Сапун", 10], ["Амонијак", 11.5], ["Белило", 12.5]];
  const box = $("ph-examples");
  const lab = document.createElement("span"); lab.className = "calc-ex-l"; lab.textContent = "Примери:"; box.appendChild(lab);
  EX.forEach(([n, v]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "calc-ex"; b.textContent = `${n} (${String(v).replace(".", ",")})`;
    b.addEventListener("click", () => { last = null; $("ph-c").value = ""; setAll(v); });
    box.appendChild(b);
  });
})();
