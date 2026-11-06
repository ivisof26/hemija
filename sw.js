// Service worker: сајтот работи и без интернет откако еднаш ќе се отвори.
// Кога менувате датотеки, сменете го бројот на верзијата подолу.
const CACHE = "hemija-v9";
const FILES = [
  "./", "index.html", "kvizovi.html", "igri.html", "testovi.html", "test-kvalitativna.html", "test-organska.html", "aplikacija.html", "alatki.html", "alatki.css", "alatki.js", "ph.js", "imenuvanje.js", "imenuvanje-data.js", "imenuvanje.css", "reakcii.js", "epruveta.js", "model.js", "instrumentalna.js",
  "style.css", "app.js", "common.js", "chemists.js", "today.js",
  "questions.js", "quiz.js", "anagram-words.js", "anagram.js",
  "elements.js", "memory.js", "equations.js", "balance.js", "hangman.js",
  "qa-scheme.js", "qa-questions.js", "qa-quiz.js", "qa-scheme-answer.png", "organska-questions.js",
  "org-q1.jpg", "org-q2.png", "org-q3.jpg", "org-q4.jpg", "org-q5.jpg", "org-q6.jpg", "org-q7.jpg", "org-q8.jpg",
  "org-q9.jpg", "org-q10.jpg", "org-q12.png", "org-q14.jpg",
  "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(FILES.map(f => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Прво мрежа (за да има најнова верзија), ако нема интернет — од меморијата
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || (req.mode === "navigate" ? caches.match("index.html") : undefined)))
  );
});
