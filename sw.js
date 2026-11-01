// Service worker: го прави сајтот да работи и без интернет.
// Кога менуваш датотеки на сајтот, смени го бројот на верзијата подолу
// (на пример v1 -> v2) за да ја добијат новата верзија сите корисници.
const VERSION = "v1";
const CACHE = "hemija-" + VERSION;

const FILES = [
  "./",
  "index.html",
  "style.css",
  "questions.js",
  "quiz.js",
  "anagram-words.js",
  "anagram.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Прво се обидува од интернет (за да добиеш најнова верзија),
// а ако нема интернет, ја зема зачуваната.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")))
  );
});
