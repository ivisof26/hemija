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

  const bottle = (x, y, w, h, c, o = {}) => {
    const nh = h * 0.26, nw = w * 0.42, by = y + nh, cx = x + w / 2;
    const lab = o.label ? `<rect x="${x + w * 0.1}" y="${y + h * 0.5}" width="${w * 0.8}" height="${h * 0.3}" rx="2" fill="#fff"/><text x="${cx}" y="${y + h * 0.5 + h * 0.19}" text-anchor="middle" font-size="${o.fs || 6}" font-weight="700" fill="${o.lc \vert{}\vert{} '#222'}">${o.label}</text>` : "";
    const cap = o.noCap ? "" : `<rect x="${cx - nw / 2 - 1}" y="${y}" width="${nw + 2}" height="${nh * 0.45}" rx="2" fill="${o.cap || '#3b3b3b'}"/>`;
    return `<g filter="url(#sf-sh)"${o.rot ? ` transform="rotate(${o.rot} ${cx} ${y + h})"` : ""}>
      <rect x="${cx - nw / 2}" y="${y + nh * 0.3}" width="${nw}" height="${nh * 0.9}" fill="${c}"/>
      <path d="M${cx - nw / 2} ${by} L${x + 3}
