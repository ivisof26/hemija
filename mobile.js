// Долна навигација за телефони (се гради од една листа, па е иста на сите страници)
(function () {
  var items = [
    ["index.html", "🏠", "Почетна"], ["teme.html", "📚", "Теми"], ["kvizovi.html", "❓", "Квизови"],
    ["igri.html", "🎮", "Игри"], ["testovi.html", "📝", "Тестови"], ["alatki.html", "🧮", "Алатки"]
  ];
  var file = (location.pathname.split("/").pop() || "index.html");
  if (file === "test-kvalitativna.html" || file === "test-organska.html") file = "testovi.html";
  if (file === "atom.html") file = "igri.html";
  if (file === "aplikacija.html") file = "";
  var nav = document.createElement("nav");
  nav.className = "bottom-nav"; nav.setAttribute("aria-label", "Главна навигација");
  items.forEach(function (it) {
    var a = document.createElement("a"); a.href = it[0];
    if (it[0] === file) { a.className = "on"; a.setAttribute("aria-current", "page"); }
    a.innerHTML = '<span class="bn-i" aria-hidden="true">' + it[1] + '</span><span>' + it[2] + '</span>';
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
  // Активниот таб се центрира кога ќе се допре (табовите се лизгаат настрана)
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".tab, .at-tab, .chr-sub, [role=tab]");
    if (b && b.parentElement && b.parentElement.scrollWidth > b.parentElement.clientWidth) {
      setTimeout(function () { try { b.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); } catch (_) {} }, 30);
    }
  });

  // Анаграм: подели ги плочките во избалансирани редови (пр. 16 букви = 6+5+5, а не 7+7+2)
  function balance() {
    document.querySelectorAll(".ana-slots, .ana-pool").forEach(function (box) {
      var n = box.children.length; if (!n) return;
      var gap = 6, avail = box.parentElement.clientWidth - 8, w = 42, rows = 1, per = n;
      // најголема плочка (42 → 34 px) со најмалку редови
      var best = null;
      [42, 40, 38, 36, 34].forEach(function (cand) {
        var pr = Math.max(1, Math.floor((avail + gap) / (cand + gap))), r = Math.ceil(n / pr);
        if (!best || r < best.r) best = { w: cand, r: r };
      });
      if (!best || (best.w === 34 && Math.ceil(n / Math.max(1, Math.floor((avail + gap) / (42 + gap)))) === best.r)) best = { w: 42, r: Math.ceil(n / Math.max(1, Math.floor((avail + gap) / (42 + gap)))) };
      w = best.w; rows = best.r; per = Math.ceil(n / rows);
      box.style.setProperty("--tw", w + "px");
      box.style.maxWidth = (per * (w + gap) - gap + 2) + "px";
    });
  }
  var tmr; function later() { clearTimeout(tmr); tmr = setTimeout(balance, 30); }
  new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", later); window.addEventListener("orientationchange", later); later();
})();
