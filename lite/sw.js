// 轻量工作台 Service Worker - 离线可开、可安装到主屏幕
const CACHE = "lite-v1";
const FILES = [
  "./index.html",
  "./styles.css?v=1",
  "./schedule.js?v=1",
  "./app.js?v=1",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // 新闻/日报/AI 接口一律走网络（不缓存，保证最新）
  if (/aihot\.virxact\.com|60s-api\.viki\.moe|apihub\.agnes-ai\.cn|open\.bigmodel\.cn/.test(url.hostname)) {
    return;
  }
  // 其余资源：网络优先（保证每次拿到最新），离线 fallback 缓存
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() =>
        caches.match(e.request).then((cached) =>
          cached || (e.request.mode === "navigate" ? caches.match("./index.html") : null)
        )
      )
  );
});
