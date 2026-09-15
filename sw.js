// 个人工作台 Service Worker - 离线可开、可安装到主屏幕
const CACHE = "workbench-v88";
const FILES = [
  "./index.html",
  "./styles.css?v=65",
  "./schedule.js?v=3",
  "./app.js?v=72",
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
// 激进清缓存：activate 时清掉所有 CACHE 再重建（不只是非当前名），保证用户刷新后 0 旧缓存可用
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => caches.open(CACHE).then((c) => c.addAll(FILES)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // 跨域请求（例如 api.github.com 的数据通道）交给浏览器直连，SW 不插手：
  // 那些请求带 Authorization 头，缓存下来没意义还容易串键（2026-09-15 方案 C）
  if (url.origin !== self.location.origin) return;
  // 注：data.json 已不再随站点发布，离线兜底改由 app.js 的 localStorage 缓存负责
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
