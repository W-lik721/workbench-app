/* 通用版工作台 app.js —— 不依赖 WorkBuddy / data.json
 * 数据源：AI 日报 = aihot 公开 API（CORS 全开）；每日新闻 = 60s 公开 API（CORS 全开）
 * 本地功能：待办 / 速记 / 收藏 / 常用入口 / 番茄钟 / 课程表 / AI 助手（Agnes/GLM）全部保留
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escAttr(s) {
    return esc(s).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
  }
  // 内联 JS 字符串安全转义：onclick 里用（转 \u0027 不会被实体解码）
  function jsStr(s) {
    return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/'/g, "\\u0027");
  }
  // 共享工具命名空间：schedule.js 通过 window.WB.esc 惰性取用
  var WB = window.WB = window.WB || {};
  WB.esc = esc;

  // ---------- 复制指令（降级 + 按钮即时反馈） ----------
  function flashCopied(btn, ok) {
    if (!btn) return;
    if (!btn.dataset.origText) btn.dataset.origText = btn.textContent;
    btn.textContent = ok ? "✓ 已复制" : "❗ 请手动复制";
    btn.classList.toggle("flashed", ok);
    btn.classList.toggle("flashed-fail", !ok);
    clearTimeout(btn._flashT);
    btn._flashT = setTimeout(function () {
      btn.textContent = btn.dataset.origText;
      btn.classList.remove("flashed", "flashed-fail");
    }, 1800);
  }
  function robustCopy(t, hintId, okMsg, failMsg, btn) {
    var set = function (ok) {
      var h = document.getElementById(hintId);
      if (h) h.textContent = ok ? ("✓ " + okMsg) : ("⚠ " + failMsg);
      flashCopied(btn, ok);
    };
    var fb = function () {
      try {
        var ta = document.createElement("textarea");
        ta.value = t; ta.style.position = "fixed"; ta.style.top = "-1000px";
        document.body.appendChild(ta); ta.focus(); ta.select();
        var ok = document.execCommand("copy"); document.body.removeChild(ta); set(ok);
      } catch (e) { set(false); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { set(true); }).catch(function () { fb(); });
    } else { fb(); }
  }
  function cmd(el) {
    var c = el.getAttribute("data-cmd");
    safeFillCmdbox(c);
    robustCopy(c, "hint", "已复制，到对话框 Ctrl+V 粘贴并发送", "复制被拦截，请手动选中上方框 Ctrl+C", el);
  }
  function safeFillCmdbox(t) {
    try {
      var box = document.getElementById("cmdbox");
      if (!box) return;
      box.value = t || "";
      try { box.focus(); box.select(); } catch (e) {}
    } catch (e) {}
  }
  function cmdtext(t) {
    safeFillCmdbox(t);
    var btn = document.activeElement;
    if (!btn || btn.tagName !== "BUTTON") btn = null;
    robustCopy(t, "hint", "已复制，到对话框 Ctrl+V 粘贴并发送", "复制被拦截，请手动选中上方框 Ctrl+C", btn);
  }
  window.cmd = cmd; window.cmdtext = cmdtext;
  window.robustCopy = robustCopy;

  // ---------- 交互 ----------
  function switchTab(id) {
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-tab") === id);
    });
    document.querySelectorAll(".tabpane").forEach(function (p) {
      p.classList.toggle("active", p.id === "pane-" + id);
    });
    try { localStorage.setItem("wb_tab", id); } catch (e) {}
    if (id === "news") renderNews();
    else if (id === "dnews") renderDailyNews();
    else if (id === "ai") renderAI();
    // schedule 启动时已渲染
  }
  window.switchTab = switchTab;

  // ---------- 我的速记（localStorage，纯前端） ----------
  var NOTES_KEY = "wb_notes";
  function notesLoad() { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || "[]"); } catch (e) { return []; } }
  function notesSave(list) { try { localStorage.setItem(NOTES_KEY, JSON.stringify(list)); } catch (e) {} }
  function renderNotes() {
    var box = document.getElementById("notesList");
    if (!box) return;
    var list = notesLoad();
    box.innerHTML = list.length ? list.map(function (n, i) {
      return '<li class="note"><span class="nt">' + esc(n.text) + '</span><button class="nd" onclick="delNote(' + i + ')" title="删除">✕</button></li>';
    }).join("") : '<li class="empty">还没有速记。随手记一条想法、灵感、待查的事…</li>';
  }
  function addNote() {
    var t = document.getElementById("noteInput");
    if (!t || !t.value.trim()) return;
    var list = notesLoad(); list.unshift({ text: t.value.trim(), at: Date.now() }); notesSave(list);
    t.value = ""; renderNotes();
  }
  function delNote(i) { var list = notesLoad(); list.splice(i, 1); notesSave(list); renderNotes(); }
  window.addNote = addNote; window.delNote = delNote;

  // ---------- 我的收藏 / 稍后读（localStorage 纯前端） ----------
  var FAV_KEY = "wb_favs";
  function favsLoad() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch (e) { return []; } }
  function favsSave(list) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {} }
  function isFav(url) { return favsLoad().some(function (f) { return f.url === url; }); }
  function favToggle(btn, title, url, source) {
    var list = favsLoad();
    var idx = -1;
    list.forEach(function (f, i) { if (f.url === url) idx = i; });
    var added = idx < 0;
    if (added) {
      list.unshift({ title: title, url: url || "", source: source || "", at: Date.now() });
    } else {
      list.splice(idx, 1);
    }
    favsSave(list);
    if (btn) { btn.textContent = added ? "★" : "☆"; btn.classList.toggle("on", added); }
    renderFavs();
    var h = document.getElementById("favsHint");
    if (h) h.textContent = added ? "⭐ 已收藏" : "已取消收藏";
  }
  function fmtFavDate(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + "-" + d.getDate();
  }
  function renderFavs() {
    var box = document.getElementById("favsList");
    if (!box) return;
    var list = favsLoad();
    if (!list.length) { box.innerHTML = '<div class="empty">还没有收藏。点新闻的 ☆ 收藏，稍后在这回看</div>'; return; }
    box.innerHTML = list.map(function (f) {
      var meta = (f.source || "") + (f.at ? " · " + fmtFavDate(f.at) : "");
      return '<li class="wk">' +
        (f.url ? '<a class="wk-name fav-a" href="' + escAttr(f.url) + '" target="_blank" rel="noopener">' + esc(f.title) + "</a>" : '<span class="wk-name">' + esc(f.title) + "</span>") +
        '<span class="wk-meta">' + esc(meta) + '</span>' +
        '<button class="nd" onclick="delFav(' + list.indexOf(f) + ')" title="移除">✕</button></li>';
    }).join("");
  }
  function delFav(i) { var list = favsLoad(); list.splice(i, 1); favsSave(list); renderFavs(); }
  function clearFavs() { favsSave([]); renderFavs(); }
  window.favToggle = favToggle; window.delFav = delFav; window.clearFavs = clearFavs;

  // ---------- 主题切换 ----------
  function syncThemeColor(light) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", light ? "#f2f4f8" : "#0e0f13");
  }
  function applyTheme() {
    var light = localStorage.getItem("wb_theme") === "light";
    document.body.classList.toggle("light", light);
    syncThemeColor(light);
    var b = document.getElementById("themeBtn");
    if (b) b.textContent = light ? "☀️" : "🌙";
  }
  function toggleTheme() {
    var light = !document.body.classList.contains("light");
    document.body.classList.toggle("light", light);
    localStorage.setItem("wb_theme", light ? "light" : "dark");
    syncThemeColor(light);
    var b = document.getElementById("themeBtn");
    if (b) b.textContent = light ? "☀️" : "🌙";
  }
  window.toggleTheme = toggleTheme;

  // ---------- AI 日报（前端直连 aihot 公开 API） ----------
  var NEWS_DATA = null;
  function toggleNS(h) {
    var b = h.nextElementSibling;
    if (!b) return;
    var open = b.classList.toggle("open");
    var car = h.querySelector(".ns-car");
    if (car) car.style.transform = open ? "rotate(180deg)" : "";
  }
  function toggleNews(btn) {
    var d = btn.previousElementSibling;
    if (!d || !d.classList.contains("nw-d")) return;
    var open = d.classList.toggle("open");
    btn.textContent = open ? "收起 ▴" : "展开 ▾";
  }
  function renderNewsItem(it, opt) {
    opt = opt || {};
    var src = it.source ? '<span class="nw-s">' + esc(it.source) + "</span>"
      : (opt.defaultSrc ? '<span class="nw-s">' + esc(opt.defaultSrc) + "</span>" : "");
    var link = it.url
      ? '<a class="nw-a" href="' + escAttr(it.url) + '" target="_blank" rel="noopener">原文 ↗</a>' : "";
    var dHtml = "";
    if (it.summary) {
      var long = it.summary.length > 90;
      dHtml = '<div class="nw-d' + (long ? " clamp" : "") + '">' + esc(it.summary) + "</div>" +
        (long ? '<button class="nw-toggle" onclick="toggleNews(this)">展开 ▾</button>' : "");
    }
    var on = isFav(it.url);
    var fav = '<button class="fav-btn' + (on ? " on" : "") + '" onclick="favToggle(this,' + "'" + jsStr(it.title) + "','" + jsStr(it.url) + "','" + jsStr(it.source || "") + "'" + ')">' + (on ? "★" : "☆") + '</button>';
    var askText = opt.ask || "用大白话展开讲讲这条新闻的背景和影响，并说说对我有什么用：";
    return '<div class="nw"><div class="nw-t">' + (opt.prefix || "") + esc(it.title) + "</div>" +
      dHtml +
      '<div class="nw-f">' + src + link + fav +
      '<button class="nw-ask" onclick="aiAsk(' + "'" + jsStr(askText + it.title) + "'" + ')">☁️ 让 AI 讲讲</button>' +
      "</div></div>";
  }
  function renderNews() {
    var box = document.getElementById("col-news");
    if (!box) return;
    if (NEWS_DATA) { renderNewsBody(NEWS_DATA.date); return; }
    box.innerHTML = '<div class="card"><h2><span class="ic">🗞️</span>AI 日报</h2><div class="empty">正在抓取今日 AI 日报…</div></div>';
    fetchT("https://aihot.virxact.com/api/public/daily", {}, 20000)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (j) {
        NEWS_DATA = {
          date: j.date || "",
          count: (j.sections || []).reduce(function (n, s) { return n + (s.items || []).length; }, 0),
          fetchedAt: (j.generatedAt || "").replace("T", " ").slice(0, 16),
          source: "AI HOT",
          sections: j.sections || []
        };
        renderNewsBody(NEWS_DATA.date);
      })
      .catch(function (err) {
        box.innerHTML = '<div class="card"><h2><span class="ic">🗞️</span>AI 日报</h2><div class="empty">日报加载失败：' + esc(err.message) + '。请检查网络后刷新重试。</div></div>';
      });
  }
  function renderNewsBody(date) {
    var box = document.getElementById("col-news");
    if (!box || !NEWS_DATA) return;
    var a = NEWS_DATA;
    var day = a;
    var secs = day.sections || [];
    if (!secs.length) {
      box.innerHTML = '<div class="card"><h2><span class="ic">🗞️</span>AI 日报</h2><div class="empty">今日暂无日报数据。</div></div>';
      return;
    }
    var html = '<div class="card news-head"><h2><span class="ic">🗞️</span>' + esc(day.date || "") + ' AI 日报' +
      '<span class="news-n">' + (day.count || 0) + ' 条</span></h2>' +
      '<div class="news-meta">数据源 ' + esc(day.source || "AI HOT") + ' · 抓取于 ' + esc(day.fetchedAt || "-") + "</div></div>";
    secs.forEach(function (s) {
      html += '<div class="card news-sec"><div class="ns-h" onclick="toggleNS(this)">' +
        '<span class="ic">📌</span>' + esc(s.label) +
        '<span class="news-n">' + (s.items || []).length + '</span><span class="ns-car">▾</span></div><div class="ns-b">';
      (s.items || []).forEach(function (it) {
        html += renderNewsItem(it, { showSummary: true, ask: "用大白话展开讲讲这条 AI 新闻的背景和影响，并说说对我有什么用：" });
      });
      html += "</div></div>";
    });
    box.innerHTML = html;
  }
  window.toggleNS = toggleNS; window.toggleNews = toggleNews;

  // ---------- 每日新闻（前端直连 60s 公开 API） ----------
  var DNEWS_DATA = null;
  function renderDailyNews() {
    var box = document.getElementById("dnewsBody");
    if (!box) return;
    if (DNEWS_DATA) { renderDNewsBody(); return; }
    box.innerHTML = '<div class="card"><h2><span class="ic">📰</span>每日新闻</h2><div class="empty">正在抓取今日新闻…</div></div>';
    fetchT("https://60s-api.viki.moe/v2/60s", {}, 20000)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (j) {
        var data = (j && j.data) || {};
        var news = data.news || [];
        DNEWS_DATA = {
          date: data.date || "",
          count: news.length,
          tip: data.note || data.tip || "",
          source: "每日60秒",
          items: news.map(function (t) {
            return { title: String(t), source: "每日60秒", url: "" };
          })
        };
        renderDNewsBody();
      })
      .catch(function (err) {
        box.innerHTML = '<div class="card"><h2><span class="ic">📰</span>每日新闻</h2><div class="empty">新闻加载失败：' + esc(err.message) + '。请检查网络后刷新重试。</div></div>';
      });
  }
  function renderDNewsBody() {
    var box = document.getElementById("dnewsBody");
    if (!box || !DNEWS_DATA) return;
    var day = DNEWS_DATA;
    var items = day.items || [];
    var tip = day.tip || "";
    if (!items.length) {
      box.innerHTML = '<div class="card"><h2><span class="ic">📰</span>每日新闻</h2><div class="empty">今日暂无新闻数据。</div></div>';
      return;
    }
    var html = '<div class="card news-head"><h2><span class="ic">📰</span>' + esc(day.date || "") + ' 每日新闻' +
      '<span class="news-n">' + (day.count || 0) + ' 条</span></h2>' +
      '<div class="news-meta">数据源 ' + esc(day.source || "每日60秒") + "</div>" +
      (tip ? '<div style="margin-top:8px;color:var(--sub);font-style:italic;line-height:1.5">💡 ' + esc(tip) + "</div>" : "") + "</div>" +
      '<div class="card"><h2><span class="ic">📌</span>今日头条</h2><div class="nw-grid">';
    items.forEach(function (it, i) {
      html += renderNewsItem(it, {
        prefix: '<span style="color:var(--accent2);font-weight:700;margin-right:7px;flex:0 0 auto">' + (i + 1) + ".</span>",
        defaultSrc: "每日60秒",
        ask: "用大白话展开讲讲这条新闻的背景，并说说对我有什么影响："
      });
    });
    html += "</div></div>";
    box.innerHTML = html;
  }

  // ---------- 待办清单（可勾选，localStorage 纯前端） ----------
  var TODO_KEY = "wb_todos";
  function todosLoad() { try { return JSON.parse(localStorage.getItem(TODO_KEY) || "[]"); } catch (e) { return []; } }
  function todosSave(list) { try { localStorage.setItem(TODO_KEY, JSON.stringify(list)); } catch (e) {} }
  function renderTodos() {
    var box = document.getElementById("todosList");
    if (!box) return;
    var list = todosLoad();
    var done = list.filter(function (t) { return t.done; }).length;
    var prog = document.getElementById("todoProg");
    if (prog) prog.innerHTML = '<div class="tp-bar"><div class="tp-fill" style="width:' + (list.length ? Math.round(done / list.length * 100) : 0) + '%"></div></div>' +
      '<div class="tp-meta">' + done + '/' + list.length + ' 已完成</div>';
    box.innerHTML = list.length ? list.map(function (t, i) {
      return '<li class="todo' + (t.done ? " done" : "") + '"><label><input type="checkbox" ' + (t.done ? "checked" : "") + ' onchange="toggleTodo(' + i + ')"><span class="tt">' + esc(t.text) + '</span></label>' +
        '<button class="nd" onclick="delTodo(' + i + ')" title="删除">✕</button></li>';
    }).join("") : '<li class="empty">还没有待办。写一个今天要做的事…</li>';
  }
  function addTodo() {
    var t = document.getElementById("todoInput");
    if (!t || !t.value.trim()) return;
    var list = todosLoad(); list.unshift({ text: t.value.trim(), done: false }); todosSave(list);
    t.value = ""; renderTodos();
  }
  function toggleTodo(i) {
    var list = todosLoad(); if (i < 0 || i >= list.length) return;
    list[i].done = !list[i].done; todosSave(list); renderTodos();
    var h = document.getElementById("todosHint");
    if (h) h.textContent = list[i].done ? "✓ 完成一个，继续保持" : "";
    setTimeout(function () { if (h) h.textContent = ""; }, 2500);
  }
  function delTodo(i) { var list = todosLoad(); list.splice(i, 1); todosSave(list); renderTodos(); }
  function clearDone() {
    var list = todosLoad().filter(function (t) { return !t.done; });
    todosSave(list); renderTodos();
    var h = document.getElementById("todosHint");
    if (h) h.textContent = "✓ 已清除已完成";
  }
  window.addTodo = addTodo; window.toggleTodo = toggleTodo; window.delTodo = delTodo; window.clearDone = clearDone;

  // ---------- 🍅 专注计时（番茄钟，纯前端） ----------
  var pomoRunning = false, pomoLeft = 25 * 60, pomoTimer = null;
  function pomoRender() {
    var t = document.getElementById("pomoT");
    var bar = document.getElementById("pomoBar");
    var btn = document.getElementById("pomoBtn");
    var m = Math.floor(pomoLeft / 60), s = pomoLeft % 60;
    if (t) t.textContent = ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
    if (bar) bar.style.width = (pomoLeft / (25 * 60) * 100) + "%";
    if (btn) btn.textContent = pomoRunning ? "⏸ 暂停" : "▶ 开始专注";
  }
  function pomoToggle() {
    if (pomoRunning) {
      pomoRunning = false; clearInterval(pomoTimer); pomoTimer = null;
    } else {
      pomoRunning = true;
      pomoTimer = setInterval(function () {
        pomoLeft--;
        if (pomoLeft <= 0) {
          pomoLeft = 0; pomoRunning = false; clearInterval(pomoTimer); pomoTimer = null;
          pomoBeep();
          var h = document.getElementById("pomoHint");
          if (h) h.textContent = "🍅 专注完成！把完成的待办勾掉吧";
        }
        pomoRender();
      }, 1000);
    }
    pomoRender();
  }
  function pomoReset() {
    pomoRunning = false; clearInterval(pomoTimer); pomoTimer = null;
    pomoLeft = 25 * 60; pomoRender();
  }
  function pomoBeep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; g.gain.value = 0.3;
      o.start();
      setTimeout(function () { o.stop(); ctx.close(); }, 500);
    } catch (e) {}
  }
  window.pomoToggle = pomoToggle; window.pomoReset = pomoReset;

  // ---------- 🤖 AI 助手（Agnes / 智谱 GLM 双可选，浏览器直连，Key 存本机） ----------
  var AI_PROVIDERS = {
    agnes: { label: "Agnes 2.5 Flash", url: "https://apihub.agnes-ai.cn/v1/chat/completions", model: "agnes-2.5-flash", keyKey: "wb_ai_key_agnes" },
    glm: { label: "智谱 GLM Flash", url: "https://open.bigmodel.cn/api/paas/v4/chat/completions", model: "glm-4-flash", keyKey: "wb_ai_key_glm" }
  };
  var aiProv = localStorage.getItem("wb_ai_prov") === "glm" ? "glm" : "agnes";
  var aiMsgs = [];
  var aiBusy = false;
  function aiKeyLoad() { try { return localStorage.getItem(AI_PROVIDERS[aiProv].keyKey) || ""; } catch (e) { return ""; } }
  function aiKeySave(k) { try { localStorage.setItem(AI_PROVIDERS[aiProv].keyKey, k); } catch (e) {} }
  function aiSetProv(p) {
    aiProv = AI_PROVIDERS[p] ? p : "agnes";
    try { localStorage.setItem("wb_ai_prov", aiProv); } catch (e) {}
    renderAI();
  }
  function renderAI() {
    var box = document.getElementById("col-ai");
    if (!box) return;
    var hasKey = !!aiKeyLoad();
    var provSel = Object.keys(AI_PROVIDERS).map(function (k) {
      return '<option value="' + k + '"' + (aiProv === k ? " selected" : "") + '>' + AI_PROVIDERS[k].label + "</option>";
    }).join("");
    var hint = aiProv === "agnes"
      ? "粘贴你的 Agnes API Key（apihub.agnes-ai.cn 申请，仅存本机浏览器）"
      : "粘贴智谱 API Key（bigmodel.cn 注册免费领，仅存本机浏览器）";
    box.innerHTML = '<div class="card"><h2><span class="ic">🤖</span>AI 助手</h2>' +
      '<div class="ai-set">' +
      '<select id="aiProvSel" class="sf ai-sel" onchange="aiSetProv(this.value)">' + provSel + "</select>" +
      '<input id="aiKey" class="sf" type="password" placeholder="' + escAttr(hint) + '" value="' + escAttr(aiKeyLoad()) + '">' +
      '<button class="btn-sm" onclick="aiSaveKey()">💾 保存 Key</button>' +
      '<span id="aiKeyHint" class="empty">' + (hasKey ? "已保存" : "未设置") + '</span></div>' +
      '<div class="ai-chat" id="aiChat">' +
      '<div class="empty">输入你的问题，AI 会用大白话回答。可问它：总结今天的日报 / 帮我挑值得看的新闻 / 待办怎么安排…</div>' +
      "</div>" +
      '<div class="ai-input">' +
      '<textarea id="aiBox" rows="2" placeholder="问 AI 点什么…（Enter 发送，Shift+Enter 换行）"></textarea>' +
      '<button class="btn" onclick="aiSend()">➤ 发送</button></div>' +
      "</div>";
    var ta = document.getElementById("aiBox");
    if (ta) ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); aiSend(); }
    });
  }
  function aiSaveKey() {
    var k = document.getElementById("aiKey");
    aiKeySave(k ? k.value.trim() : "");
    var h = document.getElementById("aiKeyHint");
    if (h) h.textContent = aiKeyLoad() ? "✓ 已保存（仅本机浏览器）" : "已清除";
  }
  function aiAsk(text, autoSend) {
    switchTab("ai");
    var box = document.getElementById("aiBox");
    if (box) {
      box.value = text || "";
      try { box.focus(); } catch (e) {}
    }
    if (autoSend) {
      setTimeout(function () { aiSend(); }, 80);
    }
  }
  function aiAppend(role, text) {
    var chat = document.getElementById("aiChat");
    if (!chat) return;
    var div = document.createElement("div");
    div.className = "ai-msg " + role;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }
  function aiSend() {
    if (aiBusy) return;
    var box = document.getElementById("aiBox");
    var key = aiKeyLoad();
    var prov = AI_PROVIDERS[aiProv];
    if (!key) { alert(aiProv === "agnes" ? "请先在上方粘贴 Agnes API Key 并保存。" : "请先在上方粘贴智谱 API Key 并保存（bigmodel.cn 注册免费领）。"); return; }
    var q = (box ? box.value : "").trim();
    if (!q) return;
    if (box) box.value = "";
    aiAppend("user", q);
    aiMsgs.push({ role: "user", content: q });
    aiBusy = true;
    aiAppend("bot", "…思考中");
    fetchT(prov.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({
        model: prov.model,
        messages: [{ role: "system", content: "你是用户个人工作台的 AI 助手，用中文大白话回答，简洁、可操作。" }].concat(aiMsgs.slice(-10)),
        max_tokens: aiProv === "agnes" ? 4000 : 800
      })
    }, 60000)
      .then(function (r) {
        if (!r.ok) {
          if (r.status === 401) throw new Error("Key 无效或已过期，请重新保存");
          if (r.status === 429) throw new Error("请求太频繁（限流），稍等再试");
          throw new Error("HTTP " + r.status);
        }
        return r.json();
      })
      .then(function (j) {
        var msg = j.choices && j.choices[0] && j.choices[0].message;
        var ans = (msg && msg.content && msg.content.trim()) || (msg && msg.reasoning_content ? "（思考中：）\n" + msg.reasoning_content : "（空回复）");
        aiMsgs.push({ role: "assistant", content: ans });
        var chat = document.getElementById("aiChat");
        if (chat && chat.lastChild) chat.removeChild(chat.lastChild);
        aiAppend("bot", ans);
      })
      .catch(function (err) {
        var chat = document.getElementById("aiChat");
        if (chat && chat.lastChild) chat.removeChild(chat.lastChild);
        aiAppend("bot", "⚠️ " + err.message);
      })
      .then(function () { aiBusy = false; });
  }
  window.aiSaveKey = aiSaveKey; window.aiSend = aiSend; window.aiSetProv = aiSetProv; window.aiAsk = aiAsk;

  // ---------- 常用入口（纯前端，localStorage 存，不依赖数据文件） ----------
  var LINKS_KEY = "wb_links";
  var DEFAULT_LINKS = [
    {"label": "抖音", "url": "https://www.douyin.com"},
    {"label": "WorkBuddy 文档", "url": "https://www.workbuddy.cn/docs/"},
    {"label": "AI 日报源", "url": "https://aihot.virxact.com/daily"},
    {"label": "每日新闻源", "url": "https://60s.viki.moe"}
  ];
  function getLinks() {
    try { var v = localStorage.getItem(LINKS_KEY); if (v) return JSON.parse(v); } catch (e) {}
    return DEFAULT_LINKS.slice();
  }
  function saveLinks(a) { try { localStorage.setItem(LINKS_KEY, JSON.stringify(a)); } catch (e) {} }
  function renderLinks() {
    var g = document.getElementById("linksGrid");
    if (!g) return;
    var links = getLinks();
    if (!links.length) { g.innerHTML = '<div class="empty">还没有入口，点"加一个"添加常用链接</div>'; return; }
    g.innerHTML = links.map(function (l, i) {
      return '<a class="link-item" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
        '<span class="li-ic">🔗</span><span class="li-label">' + esc(l.label) + '</span>' +
        '<span class="li-del" data-i="' + i + '" title="删除">✕</span></a>';
    }).join("");
    Array.prototype.forEach.call(g.querySelectorAll(".li-del"), function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        delLink(parseInt(b.getAttribute("data-i"), 10));
      });
    });
  }
  function addLink() {
    var label = window.prompt("入口名称（如 抖音）：");
    if (!label) return;
    var url = window.prompt("链接地址（以 http 开头，可留空自动补 https://）：", "https://");
    if (url === null) return;
    var links = getLinks();
    links.push({ label: label.trim(), url: url.trim() || "https://" });
    saveLinks(links); renderLinks();
  }
  function delLink(i) {
    var links = getLinks(); if (i < 0 || i >= links.length) return;
    links.splice(i, 1); saveLinks(links); renderLinks();
  }
  window.addLink = addLink;

  // ---------- 一键导出（速记/待办/收藏/入口 → Markdown） ----------
  function exportAll() {
    var now = new Date();
    var p2 = function (n) { return ("0" + n).slice(-2); };
    var ds = now.getFullYear() + "-" + p2(now.getMonth() + 1) + "-" + p2(now.getDate());
    var lines = ["# 个人工作台导出 · " + ds, ""];
    var todos = todosLoad();
    if (todos.length) {
      lines.push("## 待办清单（" + todos.filter(function (t) { return t.done; }).length + "/" + todos.length + "）");
      todos.forEach(function (t) { lines.push("- [" + (t.done ? "x" : " ") + "] " + t.text); });
      lines.push("");
    }
    var notes = notesLoad();
    if (notes.length) {
      lines.push("## 我的速记");
      notes.forEach(function (n) { lines.push("- " + n.text); });
      lines.push("");
    }
    var favs = favsLoad();
    if (favs.length) {
      lines.push("## 我的收藏（稍后读）");
      favs.forEach(function (f) { lines.push("- [" + f.title + "](" + (f.url || "") + ")" + (f.source ? " · " + f.source : "")); });
      lines.push("");
    }
    var links = getLinks();
    if (links.length) {
      lines.push("## 常用入口");
      links.forEach(function (l) { lines.push("- [" + l.label + "](" + l.url + ")"); });
      lines.push("");
    }
    var blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "工作台导出_" + ds + ".md";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  window.exportAll = exportAll;

  // ---------- 头部实时时钟 ----------
  function updateClock() {
    var el = document.getElementById("clock");
    if (!el) return;
    var d = new Date();
    var wd = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    var p2 = function (n) { return ("0" + n).slice(-2); };
    el.textContent = "🕐 " + (d.getMonth() + 1) + "-" + d.getDate() + " 周" + wd + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
  }

  // ---------- 数据请求（带超时） ----------
  function fetchT(url, opts, ms) {
    opts = opts || {};
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms || 15000);
    return fetch(url, Object.assign({}, opts, { signal: ctrl.signal }))
      .then(function (r) { clearTimeout(timer); return r; })
      .catch(function (e) { clearTimeout(timer); throw e; });
  }

  // ---------- 启动 ----------
  function init() {
    applyTheme();
    renderNotes();
    renderSchedule();
    renderLinks();
    renderTodos();
    renderFavs();
    pomoRender();
    updateClock();
    setInterval(updateClock, 1000);
    // 记住上次停留的标签页
    var last = null;
    try { last = localStorage.getItem("wb_tab"); } catch (e) {}
    switchTab(last && ["ai", "news", "dnews", "schedule"].indexOf(last) >= 0 ? last : "cap");
  }
  init();
})();
