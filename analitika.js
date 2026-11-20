// Cloudflare Web Analytics (без колачиња, не следи поединечни посетители)
(function () {
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;
  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", '{"token": "6fb66a2d44fb4b968ab62a56c48df519"}');
  document.head.appendChild(s);
})();
