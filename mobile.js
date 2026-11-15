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
})();
