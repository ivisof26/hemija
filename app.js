// Апликација (PWA): регистрира service worker и го прикажува копчето „Инсталирај“
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  const standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  const btn = document.getElementById("install-btn");
  const status = document.getElementById("install-status");
  let deferred = null;

  // Означи ја картичката за уредот што го користи посетителот
  const ua = navigator.userAgent;
  const platform = /iphone|ipad|ipod/i.test(ua) ? "ios" : /android/i.test(ua) ? "android" : "desktop";
  const card = document.querySelector(`[data-platform="${platform}"]`);
  if (card) card.classList.add("me");

  if (standalone) {
    if (status) status.textContent = "✔ Веќе ја користите апликацијата.";
    return;
  }

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferred = e;
    if (btn) btn.hidden = false;
    if (status) status.textContent = "Кликни на копчето за да ја инсталираш апликацијата.";
  });

  if (btn) btn.addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice;
    if (status) status.textContent = choice.outcome === "accepted" ? "✔ Апликацијата се инсталира." : "Може да ја инсталираш подоцна.";
    deferred = null;
    btn.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    if (status) status.textContent = "✔ Апликацијата е инсталирана.";
    if (btn) btn.hidden = true;
  });

  if (status && !status.textContent) {
    status.textContent = platform === "ios"
      ? "На iPhone инсталацијата е рачна: следи ги чекорите подолу."
      : "Ако не се појави копче „Инсталирај“, следи ги чекорите подолу.";
  }
})();
