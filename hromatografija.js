/* Хроматографија – школка со под-табови и заеднички помошни функции */
(function () {
  "use strict";
  const HRO = window.HRO = { mods: {} };
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  HRO.reduced = RM;
  HRO.el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  HRO.fmt = (x, d) => (isFinite(x) ? x.toFixed(d == null ? 2 : d) : "–").replace(".", ",");
  HRO.num = v => parseFloat(String(v).trim().replace(",", "."));
  HRO.rand = (a, b) => a + Math.random() * (b - a);
  HRO.pick = a => a[Math.floor(Math.random() * a.length)];
  HRO.later = (fn, ms) => setTimeout(fn, RM ? 0 : ms);
  HRO.erf = x => { const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; };
  HRO.cdf = x => 0.5 * (1 + HRO.erf(x / Math.SQRT2));
  HRO.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  HRO.NS = "http://www.w3.org/2000/svg";
  HRO.svg = (tag, attrs, parent) => { const e = document.createElementNS(HRO.NS, tag); for (const k in (attrs || {})) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  /* заедничка „јачина на елуент“ (елуотропна низа, силикагел) */
  HRO.SOLV = [
    { id: "hex", name: "n-хексан", s: 0 }, { id: "tol", name: "толуен", s: 3.0 },
    { id: "eth", name: "диетил етер", s: 4.0 }, { id: "dcm", name: "дихлорметан", s: 4.4 },
    { id: "ace", name: "ацетон", s: 5.9 }, { id: "eac", name: "етил ацетат", s: 6.1 },
    { id: "eto", name: "етанол", s: 9.2 }, { id: "met", name: "метанол", s: 10 }
  ];
  /* ретенциски фактор на силикагел: k = 10^(m(p - s)) */
  HRO.kSil = (p, s) => Math.pow(10, 0.5 * (p - s));

  /* ги собира завршените чекори: само последниот чекор е отворен (помалку скролање) */
  HRO.fold = function (box) {
    const upd = () => { const st = [...box.children].filter(c => c.classList.contains("in-step")); st.forEach((c, i) => { if (i < st.length - 1 && !c.classList.contains("keep") && !c.dataset.f) { c.dataset.f = 1; c.classList.add("done"); const h = c.querySelector("h4"); if (h) { h.tabIndex = 0; h.onclick = () => c.classList.toggle("open"); } } }); };
    new MutationObserver(upd).observe(box, { childList: true });
  };
  const TABS = [["tlc", "🧫 ТLC (тенкослојна)"], ["col", "🧪 Колонска"], ["gc", "🌫️ Гасна (GC)"]];
  function init() {
    const root = document.getElementById("chr-root"); if (!root) return;
    const bar = HRO.el("div", "chr-tabs"); bar.setAttribute("role", "tablist");
    const panels = {}, done = {};
    TABS.forEach(([id, label], i) => {
      const b = HRO.el("button", "chr-tab" + (i ? "" : " on"), label); b.type = "button"; b.dataset.k = id; bar.appendChild(b);
      const p = HRO.el("div", "chr-panel"); p.hidden = !!i; panels[id] = p;
    });
    root.appendChild(HRO.el("p", "in-hint", "Хроматографијата ги разделува компонентите од смеса, бидејќи тие различно се распределуваат помеѓу <b>мобилната</b> и <b>стационарната</b> фаза. Избери метод и пробај ја вежбата."));
    root.appendChild(bar); TABS.forEach(([id]) => root.appendChild(panels[id]));
    function show(id) {
      bar.querySelectorAll(".chr-tab").forEach(b => b.classList.toggle("on", b.dataset.k === id));
      for (const k in panels) panels[k].hidden = k !== id;
      if (!done[id] && HRO.mods[id]) { done[id] = true; HRO.mods[id](panels[id]); }
    }
    bar.addEventListener("click", e => { const b = e.target.closest(".chr-tab"); if (b) show(b.dataset.k); });
    HRO.show = show; show("tlc");
  }
  document.addEventListener("DOMContentLoaded", init);
})();
