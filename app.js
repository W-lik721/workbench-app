// 个人工作台 · 数据驱动渲染 + PWA
(function () {
  "use strict";

  // ---------- 线条图标库（Feather Icons，MIT，统一 stroke 风格） ----------
  var ICONS = {
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    checkSquare: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    edit2: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    barChart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    barChart2: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    trendingUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    messageCircle: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    messageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
    refreshCw: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    hardDrive: '<line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    archive: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
  };
  // 渲染一个线条图标（颜色跟随 currentColor，尺寸由 CSS 控制）
  function ic(name, extra) {
    var p = ICONS[name] || ICONS.grid;
    return '<svg class="ic-svg' + (extra ? " " + extra : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }

  // 分类中英文映射（上游英文 kebab-case，未命中回退原值）
  var CAT_ZH = {
    "academic-writing": "学术写作",
    "content": "内容创作",
    "document-generation": "文档生成",
    "通用能力": "通用能力"
  };
  function catLabel(c) { return CAT_ZH[c] || c; }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // 共享工具命名空间：schedule.js 等子模块通过 window.WB.esc 惰性取用（加载顺序无关）
  var WB = window.WB = window.WB || {};
  WB.esc = esc;
  WB.ic = ic; // 供 schedule.js 等子模块取用（必须在 WB 声明之后，否则 strict 模式抛 TypeError）
  function escAttr(s) {
    return esc(s).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
  }
  // 内联 JS 字符串安全转义：HTML 实体转义会在 onclick 里被浏览器解码成 ' 反而炸掉 JS 串，
  // 这里转成 \u0027（JS 里不冲突、不会被实体解码）
  function jsStr(s) {
    return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/'/g, "\\u0027");
  }

  // ---------- 自定义弹窗（替代原生 alert/prompt/confirm，风格统一） ----------
  WB.dialog = (function () {
    function close() {
      var m = document.querySelector(".wb-mask");
      if (m) m.remove();
      document.removeEventListener("keydown", onKey, true);
    }
    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "Enter") {
        var ok = document.querySelector('.wb-dlg [data-role="ok"]');
        if (ok) ok.click();
      }
    }
    function open(opts) {
      close();
      var mask = document.createElement("div");
      mask.className = "wb-mask";
      var dlg = document.createElement("div");
      dlg.className = "wb-dlg";
      var h = "<h3>" + esc(opts.title || "提示") + "</h3>";
      if (opts.msg) h += '<div class="wb-dlg-msg">' + esc(opts.msg) + "</div>";
      var inp = opts.input === undefined
        ? ""
        : '<input class="wb-dlg-in" value="' + escAttr(String(opts.input)) + '"' +
          (opts.placeholder ? ' placeholder="' + escAttr(opts.placeholder) + '"' : "") + ">";
      h += inp +
        '<div class="wb-dlg-acts">' +
        (opts.hideCancel ? "" : '<button class="btn-sm" data-role="cancel">取消</button>') +
        '<button class="btn" data-role="ok">' + esc(opts.okText || "确定") + "</button>" +
        "</div>";
      dlg.innerHTML = h;
      mask.appendChild(dlg);
      document.body.appendChild(mask);
      var okBtn = dlg.querySelector('[data-role="ok"]');
      var cancelBtn = dlg.querySelector('[data-role="cancel"]');
      var inputEl = dlg.querySelector(".wb-dlg-in");
      okBtn.onclick = function () {
        var v = inputEl ? inputEl.value : null;
        close();
        if (opts.onOk) opts.onOk(v);
      };
      if (cancelBtn) cancelBtn.onclick = function () { close(); if (opts.onCancel) opts.onCancel(); };
      if (inputEl) { inputEl.focus(); inputEl.select(); }
      document.addEventListener("keydown", onKey, true);
    }
    return {
      alert: function (msg, onOk) { open({ title: "提示", msg: msg, hideCancel: true, onOk: onOk }); },
      confirm: function (msg, onOk, onCancel) { open({ title: "确认", msg: msg, okText: "确定", onOk: onOk, onCancel: onCancel }); },
      prompt: function (title, defVal, onOk, onCancel, placeholder) {
        open({ title: title, input: defVal || "", okText: "保存", onOk: onOk, onCancel: onCancel, placeholder: placeholder });
      }
    };
  })();
  WB.jsStr = jsStr;

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
  // 安全填入 cmdbox 并聚焦；textarea 隐藏时 focus() 会抛错，用 try/catch 兜底
  function safeFillCmdbox(t) {
    try {
      var box = document.getElementById("cmdbox");
      if (!box) return;
      box.value = t || "";
      try { box.focus(); box.select(); } catch (e) {}
    } catch (e) { /* 静默，复制是主功能 */ }
  }
  function cmdtext(t) {
    safeFillCmdbox(t);
    // 反推调用源按钮：内联 onclick 会先把按钮 focus，所以 document.activeElement 就是按钮
    var btn = document.activeElement;
    if (!btn || btn.tagName !== "BUTTON") btn = null;
    robustCopy(t, "hint", "已复制，到对话框 Ctrl+V 粘贴并发送", "复制被拦截，请手动选中上方框 Ctrl+C", btn);
  }
  window.cmd = cmd; window.cmdtext = cmdtext;
  window.robustCopy = robustCopy;

  // ---------- 交互 ----------
  function filt() {
    var q = document.getElementById("q").value.toLowerCase();
    if (q !== "") switchTab("cap");
    var any = false;
    document.querySelectorAll("#skills .cat").forEach(function (cat) {
      var n = 0;
      cat.querySelectorAll(".skill").forEach(function (it) {
        var hit = (q === "" || it.textContent.toLowerCase().indexOf(q) >= 0);
        it.style.display = hit ? "" : "none";
        if (hit) n++;
      });
      if (q !== "") {
        cat.style.display = (n === 0) ? "none" : "";
        if (n > 0) cat.classList.add("open");
      }
      if (n > 0) any = true;
    });
    var e = document.getElementById("sempty");
    if (e) e.style.display = (q !== "" && !any) ? "block" : "none";
  }
  function toggleCat(h) { h.parentNode.classList.toggle("open"); }
  function switchTab(id) {
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-tab") === id);
    });
    document.querySelectorAll(".tabpane").forEach(function (p) {
      p.classList.toggle("active", p.id === "pane-" + id);
    });
    try { localStorage.setItem("wb_tab", id); } catch (e) {}
    if (__data) renderActiveTab(__data);
  }
  function goKPI(tab, cardId) {
    switchTab(tab);
    setTimeout(function () {
      var el = document.getElementById(cardId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }
  function openHeat(span) {
    var date = span.getAttribute("data-date");
    var count = span.getAttribute("data-count");
    var titles = (span.getAttribute("data-titles") || "").split("\n").filter(Boolean);
    document.getElementById("heat-detail-date").textContent = date + " · " + count + " 个会话";
    var body = document.getElementById("heat-detail-body");
    body.innerHTML = titles.length
      ? titles.map(function (t) {
          return '<div class="hdi" onclick="aiAsk(' + "'回顾并继续这个会话：" + jsStr(t) + "'" + ')">' + esc(t) + '<span class="hd-arrow">›</span></div>';
        }).join("")
      : '<div class="empty">这天没有会话记录</div>';
    document.getElementById("heat-detail").style.display = "flex";
  }
  function closeHeat() { document.getElementById("heat-detail").style.display = "none"; }

  // ---------- 我的速记（localStorage，纯前端） ----------
  function notesLoad() {
    try { return JSON.parse(localStorage.getItem("wb_notes") || "[]"); } catch (e) { return []; }
  }
  function notesSave(list) { try { localStorage.setItem("wb_notes", JSON.stringify(list)); } catch (e) {} }
  // ---------- 通用删除撤销（底部 toast，4 秒可撤销） ----------
  function undoSnack(msg, undoFn) {
    var old = document.querySelector(".undo-toast"); if (old && old.parentNode) old.parentNode.removeChild(old);
    var el = document.createElement("div");
    el.className = "undo-toast";
    var span = document.createElement("span");
    span.textContent = msg;
    var btn = document.createElement("button");
    btn.className = "undo-btn";
    btn.textContent = "撤销";
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      el.classList.add("hide");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
    }, 4000);
    btn.onclick = function () {
      if (done) return; done = true; clearTimeout(timer);
      try { undoFn(); } catch (e) {}
      el.classList.add("hide");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
    };
    el.appendChild(span); el.appendChild(btn);
    document.body.appendChild(el);
  }
  window.undoSnack = undoSnack;

  function renderNotes() {
    var ul = document.getElementById("notesList");
    if (!ul) return;
    var list = notesLoad();
    if (!list.length) { ul.innerHTML = '<li class="empty">还没有速记，记一笔吧～</li>'; return; }
    ul.innerHTML = list.map(function (n, i) {
      return '<li class="note"><span class="nt">' + esc(n.text) + '</span>' +
        '<button class="nd" onclick="editNote(' + i + ')" title="编辑">✎</button>' +
        '<button class="nd" onclick="delNote(' + i + ')" title="删除">✕</button></li>';
    }).join("");
  }
  function addNote() {
    var ta = document.getElementById("noteInput");
    var t = (ta.value || "").trim();
    var h = document.getElementById("notesHint");
    if (!t) { if (h) h.textContent = "先写点内容"; return; }
    var list = notesLoad();
    list.unshift({ text: t, at: Date.now() });
    notesSave(list); ta.value = ""; if (h) h.textContent = "✓ 已添加";
    renderNotes();
  }
  function delNote(i) {
    var list = notesLoad();
    if (i < 0 || i >= list.length) return;
    var removed = list[i];
    list.splice(i, 1); notesSave(list); renderNotes();
    undoSnack("已删除速记", function () {
      var l = notesLoad(); l.splice(Math.min(i, l.length), 0, removed); notesSave(l); renderNotes();
    });
  }
  function editNote(i) {
    var list = notesLoad();
    if (i < 0 || i >= list.length) return;
    WB.dialog.prompt("编辑这条速记", list[i].text || "", function (t) {
      if (t === null) return;
      t = (t || "").trim();
      if (!t) { delNote(i); return; }
      list[i].text = t; list[i].at = Date.now(); notesSave(list); renderNotes();
    });
  }

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
    if (h) h.textContent = added ? "已收藏" : "已取消收藏";
  }
  function fmtFavDate(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + "-" + d.getDate();
  }
  function renderFavs() {
    var box = document.getElementById("favList");
    if (!box) return;
    var list = favsLoad();
    var h2 = document.querySelector(".fav-card h2");
    if (h2) h2.innerHTML = '我的收藏 · 稍后读（' + list.length + '）';
    if (!list.length) { box.innerHTML = '<li class="empty" style="grid-column:1/-1">还没有收藏，去 AI 日报 / 每日新闻点 ☆ 收藏</li>'; return; }
    box.innerHTML = list.map(function (f, i) {
      var meta = [f.source, f.at ? fmtFavDate(f.at) : ""].filter(Boolean).join(" · ");
      return '<li class="wk"><span class="wk-ic"></span>' +
        '<div class="wk-b">' +
        (f.url ? '<a class="wk-name fav-a" href="' + escAttr(f.url) + '" target="_blank" rel="noopener">' + esc(f.title) + "</a>" : '<span class="wk-name">' + esc(f.title) + "</span>") +
        '<span class="wk-meta">' + esc(meta) + '</span></div>' +
        '<button class="nd" onclick="delFav(' + i + ')" title="移除">✕</button></li>';
    }).join("");
  }
  function delFav(i) {
    var list = favsLoad(); if (i < 0 || i >= list.length) return;
    var removed = list[i];
    list.splice(i, 1); favsSave(list); renderFavs();
    undoSnack("已移除收藏", function () {
      var l = favsLoad(); l.splice(Math.min(i, l.length), 0, removed); favsSave(l); renderFavs();
    });
  }
  function clearFavs() {
    if (!favsLoad().length) return;
    favsSave([]); renderFavs();
    var h = document.getElementById("favsHint"); if (h) h.textContent = "✓ 已清空";
  }

  // ---------- 主题切换（三态：深色 / 浅色 / 跟随系统，与 App 端一致） ----------
  function syncThemeColor(light) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", light ? "#f2f4f8" : "#0e0f13");
  }
  // 读取主题模式：light / dark / system（旧版本只有 dark/light，缺省按 dark）
  function _themeMode() {
    var v = localStorage.getItem("wb_theme");
    return (v === "light" || v === "dark" || v === "system") ? v : "dark";
  }
  // 算出当前是否浅色：system 模式跟随系统配色偏好
  function _themeLight(mode) {
    if (mode === "light") return true;
    if (mode === "dark") return false;
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function applyTheme() {
    var mode = _themeMode();
    var light = _themeLight(mode);
    document.body.classList.toggle("light", light);
    var b = document.getElementById("themeBtn");
    if (b) {
      b.innerHTML = ic(light ? "sun" : "moon");
      b.title = "主题：" + (mode === "system" ? "跟随系统" : (light ? "浅色" : "深色")) + "（点此切换）";
    }
    syncThemeColor(light);
  }
  function toggleTheme() {
    // 循环：深色 → 浅色 → 跟随系统 → 深色
    var cur = _themeMode();
    var next = cur === "dark" ? "light" : (cur === "light" ? "system" : "dark");
    localStorage.setItem("wb_theme", next);
    applyTheme();
  }
  // 跟随系统模式下，系统主题变化实时响应
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (_themeMode() === "system") applyTheme();
    });
  }

  function toggleNS(h) {
    var b = h.nextElementSibling;
    if (!b) return;
    var open = b.style.display !== "none";
    b.style.display = open ? "none" : "";
    h.classList.toggle("closed", open);
    var car = h.querySelector(".ns-car");
    if (car) car.textContent = open ? "▸" : "▾";
  }

  function toggleNews(btn) {
    var d = btn.previousElementSibling;
    if (!d || !d.classList.contains("nw-d")) return;
    var open = d.classList.toggle("open");
    btn.textContent = open ? "收起 ▴" : "展开 ▾";
  }

  // 单条新闻卡片渲染（AI 日报 / 每日新闻共用，避免两份重复 HTML）
  function renderNewsItem(it, opt) {
    opt = opt || {};
    var prefix = opt.prefix || "";
    var askText = opt.ask || "用大白话展开讲讲这条新闻的背景和影响，并说说对我有什么用：";
    var link = it.url
      ? '<a class="nw-a" href="' + escAttr(it.url) + '" target="_blank" rel="noopener">原文 ↗</a>' : "";
    var src = it.source
      ? '<span class="nw-s">' + esc(it.source) + "</span>"
      : (opt.defaultSrc ? '<span class="nw-s">' + esc(opt.defaultSrc) + "</span>" : "");
    var dHtml = "";
    if (opt.showSummary && it.summary) {
      var long = it.summary.length > 90;
      dHtml = '<div class="nw-d' + (long ? " clamp" : "") + '">' + esc(it.summary) + "</div>" +
        (long ? '<button class="nw-toggle" onclick="toggleNews(this)">展开 ▾</button>' : "");
    }
    var on = isFav(it.url);
    var fav = '<button class="fav-btn' + (on ? " on" : "") + '" onclick="favToggle(this,' + "'" + jsStr(it.title) + "','" + jsStr(it.url) + "','" + jsStr(it.source || "") + "'" + ')">' + (on ? "★" : "☆") + '</button>';
    return '<div class="nw"><div class="nw-t">' + prefix + esc(it.title) + "</div>" +
      dHtml +
      '<div class="nw-f">' + src + link + fav +
      '<button class="nw-ask" onclick="aiAsk(' + "'" + jsStr(askText + it.title) + "'" + ')">让 AI 讲讲</button>' +
      "</div></div>";
  }

  window.filt = filt; window.toggleCat = toggleCat; window.switchTab = switchTab; window.goKPI = goKPI;
  window.openHeat = openHeat; window.closeHeat = closeHeat;
  window.addNote = addNote; window.delNote = delNote; window.editNote = editNote; window.toggleTheme = toggleTheme;
  window.toggleNews = toggleNews;
  window.toggleNS = toggleNS; window.newsDateChanged = newsDateChanged;

  // ---------- 待办清单（可勾选，localStorage 纯前端） ----------
  var TODO_KEY = "wb_todos";
  function todosLoad() {
    try { return JSON.parse(localStorage.getItem(TODO_KEY) || "[]"); } catch (e) { return []; }
  }
  function todosSave(list) { try { localStorage.setItem(TODO_KEY, JSON.stringify(list)); } catch (e) {} }
  function renderTodos() {
    var ul = document.getElementById("todosList");
    if (!ul) return;
    var list = todosLoad();
    var done = list.filter(function (t) { return t.done; }).length;
    var prog = document.getElementById("todoProg");
    if (prog) prog.textContent = list.length ? ("已完成 " + done + " / 共 " + list.length) : "";
    if (!list.length) { ul.innerHTML = '<li class="empty">还没有待办，写一条吧～</li>'; return; }
    ul.innerHTML = list.map(function (t, i) {
      return '<li class="todo' + (t.done ? " done" : "") + '">' +
        '<input type="checkbox" class="tc" ' + (t.done ? "checked" : "") + ' onchange="toggleTodo(' + i + ')">' +
        '<span class="tt">' + esc(t.text) + '</span>' +
        '<button class="nd" onclick="delTodo(' + i + ')" title="删除">✕</button></li>';
    }).join("");
  }
  function addTodo() {
    var ta = document.getElementById("todoInput");
    var t = (ta.value || "").trim();
    var h = document.getElementById("todosHint");
    if (!t) { if (h) h.textContent = "先写点内容"; return; }
    var list = todosLoad();
    list.unshift({ text: t, done: false, at: Date.now() });
    todosSave(list); ta.value = ""; if (h) h.textContent = "✓ 已添加";
    renderTodos();
  }
  function toggleTodo(i) {
    var list = todosLoad();
    if (i < 0 || i >= list.length) return;
    list[i].done = !list[i].done;
    todosSave(list); renderTodos();
  }
  function delTodo(i) {
    var list = todosLoad();
    if (i < 0 || i >= list.length) return;
    var removed = list[i];
    list.splice(i, 1); todosSave(list); renderTodos();
    undoSnack("已删除待办", function () {
      var l = todosLoad(); l.splice(Math.min(i, l.length), 0, removed); todosSave(l); renderTodos();
    });
  }
  function clearDone() {
    var list = todosLoad().filter(function (t) { return !t.done; });
    todosSave(list); renderTodos();
    var h = document.getElementById("todosHint");
    if (h) h.textContent = "✓ 已清除已完成";
  }

  // ---------- 专注计时（番茄钟，纯前端） ----------
  var pomoTotal = 25 * 60;
  var pomoRemain = pomoTotal;
  var pomoRunning = false;
  var pomoTimer = null;
  function pomoRender() {
    var el = document.getElementById("pomoT");
    if (el) el.textContent = ("0" + Math.floor(pomoRemain / 60)).slice(-2) + ":" + ("0" + (pomoRemain % 60)).slice(-2);
    var bar = document.getElementById("pomoBar");
    if (bar) bar.style.width = Math.round(100 * pomoRemain / pomoTotal) + "%";
    var b = document.getElementById("pomoBtn");
    if (b) b.textContent = pomoRunning ? "⏸ 暂停" : "▶ 开始专注";
  }
  function pomoToggle() {
    if (pomoRunning) {
      clearInterval(pomoTimer); pomoTimer = null; pomoRunning = false;
    } else {
      pomoRunning = true;
      pomoTimer = setInterval(function () {
        pomoRemain--;
        if (pomoRemain <= 0) {
          clearInterval(pomoTimer); pomoTimer = null; pomoRunning = false;
          pomoRemain = pomoTotal;
          var h = document.getElementById("pomoHint");
          if (h) h.textContent = "专注结束！把完成的待办勾掉吧";
          pomoBeep();
        }
        pomoRender();
      }, 1000);
    }
    pomoRender();
  }
  function pomoReset() {
    clearInterval(pomoTimer); pomoTimer = null; pomoRunning = false;
    pomoRemain = pomoTotal;
    var h = document.getElementById("pomoHint"); if (h) h.textContent = "";
    pomoRender();
  }
  // 切换专注时长（未运行时同步重置倒计时；运行中保持当前进度，结束后按新时长）
  function pomoSetLen(min) {
    min = parseInt(min, 10) || 25;
    pomoTotal = min * 60;
    if (!pomoRunning) { pomoRemain = pomoTotal; }
    pomoRender();
  }
  function pomoBeep() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator(); var g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; g.gain.value = 0.15;
      o.start(); o.stop(ctx.currentTime + 0.5);
    } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
  }
  window.pomoToggle = pomoToggle; window.pomoReset = pomoReset; window.pomoSetLen = pomoSetLen;
  window.sessFilter = sessFilter; window.sessStatus = sessStatus; window.weekSet = weekSet;
  window.addTodo = addTodo; window.toggleTodo = toggleTodo; window.delTodo = delTodo; window.clearDone = clearDone;
  window.dnewsDateChanged = dnewsDateChanged;

  // ---------- 渲染 ----------
  function renderKPI(d) {
    var k = d.kpi, disk = (d.status && d.status.disk) || {};
    var items = [
      { c: "kpi-blue", i: ic("book"), v: k.knowledge, l: "知识库文件", tab: "ov", card: "card-kb" },
      { c: "kpi-green", i: ic("settings"), v: k.automations, l: "定时任务", tab: "ov", card: "card-auto" },
      { c: "kpi-purple", i: ic("hardDrive"), v: (disk.D ? disk.D.free + "G" : "-"), l: "磁盘可用 · 共 " + (disk.D ? disk.D.total + "G" : "-"), tab: "ov", card: "card-ov" },
      { c: "kpi-amber", i: ic("zap"), v: k.skills, l: "已装 Skills", tab: "cap", card: "card-skills" },
      { c: "kpi-blue", i: ic("messageSquare"), v: k.sessions, l: "近期会话", tab: "cap", card: "card-sess" },
      { c: "kpi-purple", i: ic("archive"), v: k.memory, l: "记忆库文件", tab: "ov", card: "card-ov" },
    ];
    document.getElementById("kpis").innerHTML = items.map(function (x) {
      return '<div class="kpi ' + x.c + '" onclick="goKPI(' + "'" + x.tab + "','" + x.card + "'" + ')" title="跳转到 ' + esc(x.l) + '"><div class="ki">' + x.i + '</div><div><div class="kv">' + x.v + '</div><div class="kl">' + x.l + "</div></div></div>";
    }).join("");
  }

  function renderQuick(d) {
    document.getElementById("quickbar").innerHTML = (d.quickActions || []).map(function (q) {
      return '<button class="qb" onclick="cmdtext(' + "'" + jsStr(q.cmd) + "'" + ')">' + q.icon + " " + esc(q.label) + "</button>";
    }).join("");
  }

  function renderOverview(d) {
    var a = d.aiDaily || {}, dn = d.dailyNews || {};
    var aCount = a.count || 0, dCount = dn.count || 0;
    var total = aCount + dCount;
    var aTime = String(a.fetchedAt || "").slice(11, 16) || "-";
    var dTime = String(dn.fetchedAt || "").slice(11, 16) || "-";
    var prompt = "帮我把今天工作台里的资讯划 3 条重点：AI 日报 " + aCount + " 条、每日新闻 " + dCount + " 条。请挑出 3 条对我（青灯，在自学计算机、爱折腾 AI 工具）最值得关注的，每条用大白话说明：背景是什么；为什么重要；今天能动手试什么。";
    document.getElementById("overview").innerHTML =
      '<div class="ov-hero">' +
        '<div class="ov-hero-top"><div class="ov-ttl">今日速览</div>' +
        '<div class="ov-meta">共 ' + total + ' 条资讯 · 已加载 2 个网页来源</div></div>' +
        '<div class="ov-chips">' +
          '<span class="chip"><span class="ok">✓</span> AI 日报 · ' + aCount + ' 条 · ' + aTime + '</span>' +
          '<span class="chip"><span class="ok">✓</span> 每日新闻 · ' + dCount + ' 条 · ' + dTime + '</span>' +
          '<span class="chip"><span class="ok">✓</span> 技术热榜 · App 端实时</span>' +
        '</div>' +
        '<button class="btn-cy" onclick="aiAsk(' + "'" + jsStr(prompt) + "'" + ')">AI 帮你划 3 条重点</button>' +
      '</div>';
  }

  // 今日概览统计卡（bento 内：待做 / 速记 / 收藏 本机小数据，与 App 端口径一致）
  function renderOvCard(d) {
    var box = document.getElementById("ovStats");
    if (!box) return;
    var todos = todosLoad().filter(function (t) { return !t.done; }).length;
    var notes = notesLoad().length;
    var favs = favsLoad().length;
    box.innerHTML =
      '<div class="ov-metric"><span class="rk">✅ 待做</span><span class="rv">' + todos + '</span><span class="rn">条未完成</span></div>' +
      '<div class="ov-metric"><span class="rk">速记</span><span class="rv">' + notes + '</span><span class="rn">条记录</span></div>' +
      '<div class="ov-metric"><span class="rk">收藏</span><span class="rv">' + favs + '</span><span class="rn">条稍后读</span></div>';
  }

  // 今日建议：把工作台现状拼成 prompt 发给 AI 助手
  function inspireToday() {
    var d = __data || {};
    var k = d.kpi || {};
    var cmd = "根据我的工作台现状生成今日建议：已装 " + (k.skills || 0) + " 个 skill，知识库 " + (k.knowledge || 0) +
      " 个文件，模型 " + (k.models || 0) + " 个（本机 " + (((d.status || {}).localModels || []).length) + "）。请给我：1-2 个今天可以动手的小任务点子；一条 AI agent 学习路径（结合我已装的 skill）；一个值得关注的 AI 趋势。";
    aiAsk(cmd);
  }
  window.inspireToday = inspireToday;

  function renderSkills(skills) {
    var byCat = {};
    skills.forEach(function (s) { (byCat[s.category] = byCat[s.category] || []).push(s); });
    var html = "";
    Object.keys(byCat).forEach(function (cat) {
      var list = byCat[cat].slice().sort(function (a, b) { return (b.usage || 0) - (a.usage || 0); });
      html += '<div class="cat"><div class="cat-h" onclick="toggleCat(this)"><span class="ci"></span>' + esc(catLabel(cat)) +
        '<span class="cc">' + list.length + '</span><span class="car">▶</span></div><div class="cat-b">';
      list.forEach(function (s) {
        var fire = (s.usage > 0) ? '<span class="fire">🔥' + s.usage + "</span>" : "";
        html += '<span class="skill" onclick="cmd(this)" data-cmd="' + escAttr(s.cmd) + '" title="' + escAttr(s.desc) + '">' +
          '<span class="sn">' + esc(s.name) + fire + '</span><span class="sd">' + esc(s.desc) + "</span></span>";
      });
      html += "</div></div>";
    });
    return html;
  }

  function renderSessions(sessions) {
    var groups = { "今天": [], "昨天": [], "更早": [] };
    sessions.forEach(function (s) { (groups[s.group] = groups[s.group] || []).push(s); });
    var html = "";
    ["今天", "昨天", "更早"].forEach(function (g) {
      if (!groups[g].length) return;
      html += '<div class="grp"><div class="grp-h" onclick="toggleCat(this)"><span class="ci">🟢</span>' + g +
        '<span class="cc">' + groups[g].length + '</span><span class="car">▶</span></div><div class="grp-b">';
      groups[g].forEach(function (s) {
        var disp = s.display || s.title || "";
        var badge = s.status === "working" ? '<span class="badge on">进行中</span>' : "";
        html += '<div class="auto sess" onclick="aiAsk(' + "'回顾并继续这个会话：" + jsStr(disp) + "'" + ')"><b>' +
          esc(disp) + '</b><span class="meta">' + s.updated + " " + badge + "</span></div>";
      });
      html += "</div></div>";
    });
    return html;
  }

  function renderHeat(heat) {
    var total = heat.reduce(function (a, b) { return a + b.count; }, 0);
    var html = '<div class="heat"><div class="heat-t">近 17 周会话活跃 · 合计 ' + total + ' 条记录 · 点格子看当天聊了啥</div><div class="heat-g">';
    heat.forEach(function (h) {
      var lvl = h.count === 0 ? "l0" : (h.count <= 2 ? "l1" : (h.count <= 5 ? "l2" : "l3"));
      var titles = (h.titles || []).map(function (t) { return esc(t); }).join("\n");
      html += '<span class="hc ' + lvl + '" data-date="' + h.date + '" data-count="' + h.count + '" data-titles="' + escAttr(titles) + '" onclick="openHeat(this)" title="' + h.date + " : " + h.count + ' 个会话"></span>';
    });
    html += '</div><div class="heat-lg"><span class="hc l1"></span>少 <span class="hc l2"></span>中 <span class="hc l3"></span>多</div></div>';
    return html;
  }

  function renderCap(d) {
    var skillsHtml = renderSkills(d.skills);
    var sessHtml = renderSessions(d.sessions.recent);
    var heatHtml = renderHeat(d.sessions.heatmap);
    var guideHtml = (d.guide || []).map(function (g) {
      return '<div class="guide-item' + (g.indexOf("⚠") >= 0 ? " warn" : "") + '">' + esc(g) + "</div>";
    }).join("");
    var trendItems = [];
    ((d.aiDaily && d.aiDaily.sections) || []).forEach(function (sec) {
      (sec.items || []).forEach(function (it) {
        if (trendItems.length < 3) trendItems.push(it);
      });
    });
    var trendHtml = trendItems.length ? '<div class="trend-list">' + trendItems.map(function (it) {
      return '<a class="trend" href="' + escAttr(it.url || "#") + '" target="_blank" rel="noopener">' + esc(it.title) +
        (it.source ? '<span class="ts">' + esc(it.source) + "</span>" : "") + "</a>";
    }).join("") + "</div>" : "";
    var inspireCmd = "根据我的工作台现状生成今日建议：已装 " + d.kpi.skills + " 个 skill，知识库 " + d.kpi.knowledge +
      " 个文件，模型 " + d.kpi.models + " 个（本机 " + ((d.status.localModels || []).length) + "）。请给我：1-2 个今天可以动手的小任务点子；一条 AI agent 学习路径（结合我已装的 skill）；一个值得关注的 AI 趋势。";
    document.getElementById("col-cap").innerHTML =
      '<div class="card" id="card-skills"><h2><span class="ic">' + ic("zap") + '</span>能力速达（点击复制调用指令）</h2>' +
        '<textarea id="cmdbox" rows="2" placeholder="点击上方 skill，指令会出现在这里（也可直接编辑/粘贴）"></textarea>' +
        '<div id="hint"></div><div id="sempty" class="empty" style="display:none">没有匹配的 skill</div>' +
        '<div id="skills">' + skillsHtml + "</div></div>" +
      '<div class="card" id="card-sess"><h2><span class="ic">' + ic("messageSquare") + '</span>近期会话 / 任务流</h2>' + sessHtml + heatHtml + "</div>";
    var side = document.getElementById("side-cap");
    if (side) {
      side.innerHTML =
        '<div class="side-card"><h4><span class="ic">' + ic("compass") + '</span>今日引导 / 建议 / Agent 学习</h4>' +
          '<div class="ov-res" style="grid-template-columns:repeat(2,1fr);margin-bottom:8px">' +
          '<div class="ov-metric"><span class="rk">今日引导</span><span class="rv">' + (d.guide || []).length + '</span><span class="rn">条待办 / 提醒</span></div>' +
          '<div class="ov-metric"><span class="rk">AI 日报</span><span class="rv">' + ((d.aiDaily && d.aiDaily.count) || 0) + '</span><span class="rn">条今日资讯</span></div>' +
          "</div>" +
          '<div class="guide-grid">' + guideHtml + "</div>" +
          '<div style="margin-top:12px"><button class="btn" onclick="aiAsk(' + "'" + jsStr(inspireCmd) + "'" + ')">生成建议</button></div></div>' +
        '<div class="side-card" style="margin-top:12px"><h4><span class="ic">' + ic("trendingUp") + '</span>AI 趋势 / 学习流</h4>' +
          (d.aiDaily && d.aiDaily.count
            ? '<div class="empty" style="margin:2px 0 4px">今日已抓 ' + d.aiDaily.count + ' 条 AI 资讯（' + esc(d.aiDaily.date || "") + '），每天 08:30 自动更新</div>'
            : '<div class="empty" style="margin:2px 0 4px">今日尚无日报数据</div>') +
          trendHtml +
          '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="btn" onclick="switchTab(' + "'news'" + ')">看今日 AI 日报</button>' +
          '<button class="btn-sm" onclick="cmdtext(' + "'检索最近 30 天 AI 趋势，输出一份研究笔记'" + ')">趋势研究</button></div></div>';
    }
  }

  // ---------- AI 日报（支持历史日期切换） ----------
  var NEWS_DATA = null;
  function renderNews(d) {
    NEWS_DATA = d;
    var a = d.aiDaily || {};
    var box = document.getElementById("newsBlock");
    if (!box) return;
    var dot = document.getElementById("newsDot");
    if (dot) dot.style.display = ((a.count || 0) > 0) ? "inline-block" : "none";

    // 历史日期下拉（>1 天时显示）
    var hist = a.history || [];
    var curDate = a.date || "";
    var selHtml = "";
    if (hist.length > 1) {
      selHtml = '<div class="news-sel">历史日报：' +
        '<select id="newsSel" onchange="newsDateChanged()">' +
        hist.map(function (h) {
          return '<option value="' + escAttr(h.date) + '"' + (h.date === curDate ? " selected" : "") + '>' +
            esc(h.date) + ' (' + (h.count || 0) + ' 条)</option>';
        }).join("") + '</select></div>';
    }
    box.innerHTML = selHtml + '<div id="newsBody"></div>';
    renderNewsBody(curDate);
  }
  function newsDateChanged() {
    var sel = document.getElementById("newsSel");
    if (sel) renderNewsBody(sel.value);
  }
  // 资讯 Tab（AI 日报 + 每日新闻合并渲染，红点任一有更新即亮）
  function renderInfo(d) {
    renderNews(d);
    renderDailyNews(d);
    var dot = document.getElementById("infoDot");
    if (dot) {
      var n = ((d.aiDaily || {}).count || 0) + ((d.dailyNews || {}).count || 0);
      dot.style.display = n > 0 ? "inline-block" : "none";
    }
  }
  function renderNewsBody(date) {
    var box = document.getElementById("newsBody");
    if (!box || !NEWS_DATA) return;
    var a = NEWS_DATA.aiDaily || {};
    var day = (a.history || []).filter(function (h) { return h.date === date; })[0] || a;
    var secs = day.sections || [];
    if (!secs.length) {
      box.innerHTML = '<div class="card"><h2><span class="ic">' + ic("fileText") + '</span>AI 日报</h2>' +
        '<div class="empty">这一天还没有抓到日报数据。可以点「立即刷新」让本机重新抓一次；也可以让 WorkBuddy 手动跑 <code>fetch_ai_daily.py</code>。</div>' +
        '<div style="margin-top:10px"><button class="btn" onclick="cmdtext(' + "'跑一下 personal-workbench 的 fetch_ai_daily.py 抓今天的 AI 日报，然后 export + push'" + ')">让 AI 现在抓一次</button></div></div>';
      return;
    }
    var html = '<div class="card news-head"><h2>' + esc(day.date || "") + ' AI 日报' +
      '<span class="news-n">' + (day.count || 0) + ' 条</span></h2>' +
      '<div class="news-meta">数据源 ' + esc(day.source || a.source || "AI HOT") + ' · 抓取于 ' + esc(day.fetchedAt || "-") +
      (day.canonical ? ' · <a href="' + escAttr(day.canonical) + '" target="_blank" rel="noopener">看完整日报 ↗</a>' : "") + "</div></div>" +
      '<div class="card"><h2><span class="ic">' + ic("compass") + '</span>基于日报做点什么</h2>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn" onclick="aiAsk(' + "'把今天工作台里的 AI 日报总结成 3 条对我最有用的要点，并各给一个可以今天动手试的小实验'" + ')">提炼 3 条要点</button>' +
      '<button class="btn-sm" onclick="aiAsk(' + "'把今天的 AI 日报存进 vault/ 知识库，按主题归档'" + ')">存进知识库</button>' +
      "</div></div>";

    secs.forEach(function (s) {
      html += '<div class="card news-sec"><div class="ns-h" onclick="toggleNS(this)">' +
        '' + esc(s.label) +
        '<span class="news-n">' + (s.items || []).length + '</span><span class="ns-car">▾</span></div><div class="ns-b">';
      (s.items || []).forEach(function (it) {
        html += renderNewsItem(it, { showSummary: true, ask: "用大白话展开讲讲这条 AI 新闻的背景和影响，并说说对我有什么用：" });
      });
      html += "</div></div>";
    });

    box.innerHTML = html;
  }

  // ---------- 每日新闻（国内/中文，支持历史日期切换） ----------
  var DNEWS_DATA = null;
  function renderDailyNews(d) {
    DNEWS_DATA = d;
    var a = d.dailyNews || {};
    var box = document.getElementById("dnewsBlock");
    if (!box) return;
    var dot = document.getElementById("dnewsDot");
    if (dot) dot.style.display = ((a.count || 0) > 0) ? "inline-block" : "none";

    var hist = a.history || [];
    var curDate = a.date || "";
    var selHtml = "";
    if (hist.length > 1) {
      selHtml = '<div class="news-sel">历史新闻：' +
        '<select id="dnewsSel" onchange="dnewsDateChanged()">' +
        hist.map(function (h) {
          return '<option value="' + escAttr(h.date) + '"' + (h.date === curDate ? " selected" : "") + '>' +
            esc(h.date) + ' (' + (h.count || 0) + ' 条)</option>';
        }).join("") + '</select></div>';
    }
    box.innerHTML = selHtml + '<div id="dnewsBody"></div>';
    renderDNewsBody(curDate);
  }
  function dnewsDateChanged() {
    var sel = document.getElementById("dnewsSel");
    if (sel) renderDNewsBody(sel.value);
  }
  function renderDNewsBody(date) {
    var box = document.getElementById("dnewsBody");
    if (!box || !DNEWS_DATA) return;
    var a = DNEWS_DATA.dailyNews || {};
    var day = (a.history || []).filter(function (h) { return h.date === date; })[0] || a;
    var items = day.items || [];
    var tip = day.tip || "";
    var cover = day.cover || a.cover || "";
    if (!items.length) {
      box.innerHTML = '<div class="card"><h2><span class="ic">' + ic("fileText") + '</span>每日新闻</h2>' +
        '<div class="empty">这一天还没有抓到新闻数据。可以点「立即刷新」让本机重新抓一次；也可以让 WorkBuddy 手动跑 <code>fetch_daily_news.py</code>。</div>' +
        '<div style="margin-top:10px"><button class="btn" onclick="cmdtext(' + "'跑一下 personal-workbench 的 fetch_daily_news.py 抓今天的国内新闻，然后 export + push'" + ')">让 AI 现在抓一次</button></div></div>';
      return;
    }
    var html = '<div class="card news-head">' +
      (cover ? '<div class="dnews-cover" style="display:none"><img src="' + escAttr(cover) + '" alt="每日新闻封面" loading="lazy" referrerpolicy="no-referrer" onload="if(this.naturalWidth)this.parentNode.style.display=\'block\'" onerror="this.parentNode.style.display=\'none\'"></div>' : "") +
      '<h2>' + esc(day.date || "") + ' 每日新闻' +
      '<span class="news-n">' + (day.count || 0) + ' 条</span></h2>' +
      '<div class="news-meta">数据源 ' + esc(day.source || a.source || "每日60秒") + ' · 抓取于 ' + esc(day.fetchedAt || "-") +
      (day.canonical ? ' · <a href="' + escAttr(day.canonical) + '" target="_blank" rel="noopener">看来源 ↗</a>' : "") + "</div>" +
      (tip ? '<div style="margin-top:8px;color:var(--sub);font-style:italic;line-height:1.5">' + esc(tip) + "</div>" : "") + "</div>" +
      '<div class="card"><h2><span class="ic">' + ic("compass") + '</span>基于新闻做点什么</h2>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn" onclick="aiAsk(' + "'把今天工作台里的每日新闻挑 3 条跟我最相关的，说说为什么值得关注'" + ')">挑 3 条相关的</button>' +
      '<button class="btn-sm" onclick="aiAsk(' + "'把今天的每日新闻存进 vault/ 知识库，按主题归档'" + ')">存进知识库</button>' +
      "</div></div>";

    html += '<div class="card"><h2><span class="ic">' + ic("trendingUp") + '</span>今日头条</h2><div class="nw-grid">';
    items.forEach(function (it, i) {
      html += renderNewsItem(it, {
        prefix: '<span style="color:var(--accent2);font-weight:600;margin-right:7px;flex:0 0 auto">' + (i + 1) + ".</span>",
        defaultSrc: "每日60秒",
        ask: "用大白话展开讲讲这条新闻的背景，并说说对我有什么影响："
      });
    });
    html += "</div></div>";

    box.innerHTML = html;
  }

  // 把 RRULE 风格 cron（FREQ=WEEKLY;BYDAY=MO;BYHOUR=10;BYMINUTE=0）解析成中文
  function cronZh(cron) {
    if (!cron) return "";
    var p = {};
    String(cron).split(";").forEach(function (kv) {
      var i = kv.indexOf("=");
      if (i > 0) p[kv.slice(0, i).toUpperCase()] = kv.slice(i + 1);
    });
    var freq = p.FREQ || "";
    var days = { MO: "一", TU: "二", WE: "三", TH: "四", FR: "五", SA: "六", SU: "日" };
    var when = [];
    if (p.BYHOUR) { when.push((p.BYHOUR.length === 1 ? "0" + p.BYHOUR : p.BYHOUR) + ":" + (p.BYMINUTE ? (p.BYMINUTE.length === 1 ? "0" + p.BYMINUTE : p.BYMINUTE) : "00")); }
    var hm = when.length ? " " + when[0] : "";
    if (freq.indexOf("WEEKLY") >= 0) {
      var ds = (p.BYDAY || "").split(",").filter(Boolean).map(function (d) { return days[d] || ""; }).join("、");
      return (ds ? "每周" + ds : "每周") + hm;
    }
    if (freq.indexOf("DAILY") >= 0) return "每天" + hm;
    if (freq.indexOf("HOURLY") >= 0) return "每小时";
    if (freq.indexOf("MONTHLY") >= 0) return "每月" + hm;
    return String(cron).slice(0, 30);
  }

  function renderOv(d) {
    var st = d.status;
    var modelsHtml = (st.models || []).map(function (m) {
      return '<div class="model"><span class="mn">' + esc(m.name) + '</span><span class="mm">' + esc(m.type) + "</span></div>";
    }).join("");
    var mcpHtml = (st.mcp || []).map(function (m) {
      var off = (m.online === false);
      return '<span class="mcp' + (off ? " off" : "") + '">' + esc(m.name) +
        (off ? ' <span class="mcp-badge">离线</span>' : "") + "</span>";
    }).join("");
    var disk = st.disk || {};
    var localHtml = (st.localModels || []).map(function (m) { return '<div class="model">' + esc(m) + "</div>"; }).join("");
    var ol = st.ollama || {};
    var olModels = ol.models || [];
    var olRunning = ol.running || [];
    var olHtml = ol.available === false ? '<div class="empty">Ollama 未安装</div>' :
      (olModels.length ? olModels.map(function (m) {
        var tags = m.tags || [m.name];
        var run = olRunning.some(function (r) { return tags.indexOf(r.name) >= 0; });
        var alias = tags.length > 1 ? " · 等 " + tags.length + " 个标签" : "";
        return '<div class="model ol-model"><span class="ol-dot ' + (run ? "on" : "") + '"></span><b>' + esc(tags[0]) + '</b>' +
          '<span class="meta">' + esc(m.size || "") + alias + (run ? " · 运行中" : "") + "</span></div>";
      }).join("") : '<div class="empty">Ollama 未运行 · 暂无本地模型</div>');
    var autoHtml = (st.automations || []).map(function (a) {
      var badge = a.status === "ACTIVE" || a.status === "active" ? '<span class="badge on">ACTIVE</span>' : '<span class="badge off">' + esc(a.status) + "</span>";
      var freq = cronZh(a.cron);
      return '<div class="auto">' + badge + "<b>" + esc(a.name) + '</b><span class="meta">' + (freq ? esc(freq) + " · " : "") + "下次 " + esc(a.next || "-") + "</span></div>";
    }).join("") || '<div class="empty">暂无自动化任务</div>';
    var kb = d.knowledge || { total: 0, types: {}, files: [] };
    var kbTypes = Object.keys(kb.types || {}).map(function (t) { return t + " " + kb.types[t]; }).join(" · ");
    var kbHtml = (kb.files || []).map(function (f) {
      return '<div class="auto"><b>' + esc(f.name) + '</b><span class="meta">' + esc(f.mtime) + "</span></div>";
    }).join("");

    document.getElementById("col-ov").innerHTML =
      '<div class="card" id="card-ov"><h2><span class="ic">' + ic("activity") + '</span>个人状态看板</h2>' +
        '<div class="ov-sub">已接入模型（' + (st.models || []).length + '）</div><div class="ov-models">' + modelsHtml + "</div>" +
        '<div class="ov-sub">集成与资源</div>' +
        '<div class="ov-res">' +
        '<div class="ov-mcp"><div class="ov-mcp-h"><span class="rk">MCP 集成</span><span class="rv">' + (st.mcp || []).length + '</span></div><div class="ov-mcp-chips">' + mcpHtml + "</div></div>" +
        '<div class="ov-metric"><span class="rk">记忆库</span><span class="rv">' + d.kpi.memory + '</span><span class="rn">个文件</span></div>' +
        '<div class="ov-metric"><span class="rk">磁盘 C:</span><span class="rv">' + (disk.C ? disk.C.free + "G" : "-") + '</span><span class="rn">共 ' + (disk.C ? disk.C.total + "G" : "-") + "</span></div>" +
        '<div class="ov-metric"><span class="rk">磁盘 D:</span><span class="rv">' + (disk.D ? disk.D.free + "G" : "-") + '</span><span class="rn">可用 · 共 ' + (disk.D ? disk.D.total + "G" : "-") + "</span></div>" +
        "</div></div>" +
      '<div class="card"><h2><span class="ic">' + ic("tool") + '</span>环境体检台</h2>' +
        '<div class="ov-res">' +
        '<div class="ov-metric"><span class="rk">本地模型</span><span class="rv">' + olModels.length + '</span><span class="rn">' + (ol.available === false ? "Ollama 未装" : (olRunning.length ? olRunning.length + " 运行中" : "已就绪")) + "</span></div>" +
        '<div class="ov-metric"><span class="rk">C 盘剩余</span><span class="rv">' + (disk.C ? disk.C.free + "G" : "-") + '</span><span class="rn">共 ' + (disk.C ? disk.C.total + "G" : "-") + "</span></div>" +
        '<div class="ov-metric"><span class="rk">运行时</span><span class="rv" style="font-size:14px">' + esc(st.runtime || "-") + '</span><span class="rn">Python / Node</span></div>' +
        "</div>" +
        (olModels.length ? '<div style="margin:8px 0 2px;color:var(--accent2);font-size:13px">本地 Ollama 模型（' + olModels.length + '）</div><div class="ov-ol">' + olHtml + "</div>" : "") +
      "</div>" +
      '<div class="card" id="card-auto"><h2><span class="ic">' + ic("settings") + '</span>自动化与任务编排</h2>' +
        '<div class="ov-res" style="grid-template-columns:repeat(2,1fr);margin-bottom:8px">' +
        '<div class="ov-metric"><span class="rk">自动化任务</span><span class="rv">' + (st.automations || []).length + '</span><span class="rn">WorkBuddy 内置</span></div>' +
        '<div class="ov-metric"><span class="rk">活跃中</span><span class="rv">' + (st.automations || []).filter(function (a) { return a.status === "ACTIVE" || a.status === "active"; }).length + '</span><span class="rn">ACTIVE 状态</span></div>' +
        "</div>" +
        '<div class="ov-auto-panel">' + autoHtml + "</div>" +
        '<div style="margin-top:10px"><button class="btn" onclick="cmdtext(' + "'新建定时任务：频率（如每周一10点）+ 工作区 + 任务描述'" + ')">➕ 新建定时任务</button></div></div>' +
      '<div class="card" id="card-kb"><h2><span class="ic">' + ic("book") + '</span>内容与知识生产</h2>' +
        '<div class="ov-res" style="grid-template-columns:repeat(2,1fr)">' +
        '<div class="ov-metric"><span class="rk">知识库文件</span><span class="rv">' + kb.files.length + '</span><span class="rn">篇笔记 / 资料</span></div>' +
        '<div class="ov-metric"><span class="rk">知识库类型</span><span class="rv" style="font-size:14px">' + Object.keys(kb.types || {}).length + '</span><span class="rn">' + esc(kbTypes || "未分类") + "</span></div>" +
        "</div>" +
        (kb.files.length ? '<div class="ov-kb" style="margin-top:8px">' + kbHtml + "</div>" : '<div class="empty" style="margin-top:8px">暂无知识库文件，点下方新建</div>') +
        '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn" onclick="cmdtext(' + "'在 knowledge-base/ 新建一篇笔记，主题：'" + ')">➕ 新建笔记</button>' +
        '<button class="btn" onclick="cmdtext(' + "'用 video-cangjie-distill 把以下视频转成 skill：'" + ')">蒸馏视频</button>' +
        '<button class="btn-sm" onclick="cmdtext(' + "'在 knowledge-base/ 搜索：'" + ')">🔍 搜知识库</button></div></div>';
  }

  // ---------- Skill 使用统计 ----------
  function renderStats(d) {
    var box = document.getElementById("col-stats");
    if (!box) return;
    var skills = d.skills || [];
    var used = skills.filter(function (s) { return (s.usage || 0) > 0; });
    var totalUsage = skills.reduce(function (a, s) { return a + (s.usage || 0); }, 0);
    var top = skills.slice().sort(function (a, b) { return (b.usage || 0) - (a.usage || 0); }).filter(function (s) { return (s.usage || 0) > 0; }).slice(0, 10);
    var maxU = top.length ? top[0].usage : 1;
    var byCat = {};
    skills.forEach(function (s) { (byCat[s.category] = byCat[s.category] || []).push(s); });
    var catMax = 1; Object.keys(byCat).forEach(function (c) { if (byCat[c].length > catMax) catMax = byCat[c].length; });
    var html = '<div class="card"><h2><span class="ic">' + ic("barChart2") + '</span>Skill 使用统计</h2>' +
      '<div class="ov-res" style="margin-bottom:10px">' +
      '<div class="ov-metric"><span class="rk">已装 Skills</span><span class="rv">' + skills.length + '</span><span class="rn">个能力</span></div>' +
      '<div class="ov-metric"><span class="rk">用过</span><span class="rv">' + used.length + '</span><span class="rn">占 ' + Math.round(100 * used.length / Math.max(1, skills.length)) + '%</span></div>' +
      '<div class="ov-metric"><span class="rk">累计使用</span><span class="rv">' + totalUsage + '</span><span class="rn">次调用</span></div>' +
      "</div></div>";
    html += '<div class="card"><h2><span class="ic">🔥</span>使用最多的 TOP ' + top.length + '</h2>';
    if (!top.length) html += '<div class="empty">还没有使用记录，去 能力速达 点几个 skill 试试（点一下即算一次）</div>';
    html += '<div class="stat-list">' + top.map(function (s) {
      return '<div class="stat"><span class="st-name">' + esc(s.name) + '</span>' +
        '<span class="st-bar"><span class="st-fill" style="width:' + Math.round(100 * s.usage / maxU) + '%"></span></span>' +
        '<span class="st-num">' + s.usage + '</span></div>';
    }).join("") + "</div></div>";
    html += '<div class="card"><h2>按分类分布（' + Object.keys(byCat).length + ' 类）</h2><div class="stat-list">' +
      Object.keys(byCat).map(function (c) {
        return '<div class="stat"><span class="st-name">' + esc(catLabel(c)) + '</span>' +
          '<span class="st-bar"><span class="st-fill" style="width:' + Math.round(100 * byCat[c].length / catMax) + '%"></span></span>' +
          '<span class="st-num">' + byCat[c].length + '</span></div>';
      }).join("") + "</div></div>";
    box.innerHTML = html;
  }

  // ---------- 会话档案 ----------
  function sessFilter() {
    var q = (document.getElementById("sessQ").value || "").trim().toLowerCase();
    var items = document.querySelectorAll("#sessArchiveList .sess-it");
    var n = 0;
    items.forEach(function (it) {
      var show = !q || (it.getAttribute("data-title") || "").toLowerCase().indexOf(q) >= 0;
      it.style.display = show ? "" : "none";
      if (show) n++;
    });
    var c = document.getElementById("sessCount");
    if (c) c.textContent = n + " 条";
  }
  function sessStatus(v) {
    var chips = document.querySelectorAll(".schip");
    chips.forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-v") === v); });
    var items = document.querySelectorAll("#sessRecentList .sess-it");
    items.forEach(function (it) {
      it.style.display = (v === "all" || it.getAttribute("data-status") === v) ? "" : "none";
    });
  }
  function renderSessArchive(d) {
    var box = document.getElementById("col-sess");
    if (!box) return;
    var sess = d.sessions || {};
    var recent = sess.recent || [];
    var heat = sess.heatmap || [];
    var byDate = {};
    heat.forEach(function (h) { byDate[h.date] = (h.titles || []); });
    var dates = Object.keys(byDate).sort().reverse();
    var totalTitles = 0; dates.forEach(function (dt) { totalTitles += byDate[dt].length; });
    var archiveHtml = "";
    dates.forEach(function (dt) {
      var list = byDate[dt];
      if (!list.length) return;
      archiveHtml += '<div class="sess-day">' + esc(dt) + ' <span class="cc">' + list.length + "</span></div>";
      list.forEach(function (t) {
        archiveHtml += '<div class="auto sess sess-it" data-title="' + escAttr(t) + '" onclick="aiAsk(' + "'回顾并继续这个会话：" + jsStr(t) + "'" + ')"><b>' + esc(t) + "</b></div>";
      });
    });
    var recentHtml = '<div class="card"><h2>近期会话（最近 ' + recent.length + ' 条）</h2>' +
      '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap">' +
      '<button class="schip active" data-v="all" onclick="sessStatus(\'all\')">全部</button>' +
      '<button class="schip" data-v="working" onclick="sessStatus(\'working\')">进行中</button></div>' +
      '<div id="sessRecentList">' + (recent.length ? recent.map(function (s) {
        var st = s.status || "";
        var disp = s.display || s.title || "";
        return '<div class="auto sess sess-it" data-status="' + escAttr(st) + '" onclick="aiAsk(' + "'回顾并继续这个会话：" + jsStr(disp) + "'" + ')"><b>' + esc(disp) + '</b><span class="meta">' + esc(s.updated) + (st === "working" ? ' <span class="badge on">进行中</span>' : "") + "</span></div>";
      }).join("") : '<div class="empty">暂无近期会话</div>') + "</div></div>";
    var html = '<div class="card"><h2><span class="ic">🔍</span>搜索会话</h2>' +
      '<input id="sessQ" class="sf" placeholder="按标题搜索全部会话…" oninput="sessFilter()">' +
      '<div class="empty" style="margin-top:4px">共 ' + totalTitles + ' 条历史记录 · ' + dates.length + ' 天</div></div>' +
      recentHtml +
      '<div class="card"><h2>活跃热力图 · 近 ' + heat.length + ' 天</h2>' + renderHeat(heat) + "</div>" +
      '<div class="card"><h2>全部会话档案<span class="news-n" id="sessCount">' + totalTitles + " 条</span></h2>" +
      '<div id="sessArchiveList" class="sess-arch">' + archiveHtml + '</div></div>';
    box.innerHTML = html;
  }

  // 本周动态：bento 首页卡（最近 12 条）+ 独立 tab（全部 + 类型筛选）共用渲染
  var WK_ICON = { skill: "", automation: "", kb: "", model: "" };
  var WK_LABEL = { skill: "新增/更新 skill", automation: "新建自动化任务", kb: "新增知识库文件", model: "拉取本地模型" };
  function wkItemHtml(it) {
    var dt = new Date((it.when || 0) * 1000);
    var ds = (dt.getMonth() + 1) + "-" + dt.getDate() + " " +
      ("0" + dt.getHours()).slice(-2) + ":" + ("0" + dt.getMinutes()).slice(-2);
    var scope = (it.scope || "").replace(/^[（(]|[）)]$/g, "").trim();
    return '<li class="wk">' + "•" + '</span>' +
      '<div class="wk-b"><span class="wk-name">' + esc(it.name) + '</span></div>' +
      (scope ? '<span class="wk-scope">' + esc(scope) + '</span>' : '') +
      '<span class="wk-meta">' + ds + '</span></li>';
  }
  function wkGroupHtml(items) {
    var order = ["skill", "kb", "automation", "model"];
    var html = "";
    order.forEach(function (k) {
      var list = items.filter(function (it) { return it.kind === k; });
      if (!list.length) return;
      html += '<li class="wk-grp">' + "•" + " " + esc(WK_LABEL[k] || k) +
        '<span class="cc">' + list.length + "</span></li>" + list.map(wkItemHtml).join("");
    });
    var rest = items.filter(function (it) { return order.indexOf(it.kind) < 0; });
    if (rest.length) {
      html += '<li class="wk-grp">• 其他<span class="cc">' + rest.length + "</span></li>" + rest.map(wkItemHtml).join("");
    }
    return html;
  }

  function renderWeekly(d) {
    var box = document.getElementById("wkList");
    if (!box) return;
    var items = d.weekly || [];
    var h2 = document.querySelector(".wk-card h2");
    if (h2) h2.innerHTML = '本周动态 · 近期变化（' + items.length + '）';
    if (!items.length) {
      box.innerHTML = '<li class="empty">本周暂无新增变化 · 工作台平稳运行中</li>';
      return;
    }
    var shown = items.slice(0, 12);
    box.innerHTML = wkGroupHtml(shown) + (items.length > shown.length ? '<li class="empty" style="grid-column:1/-1;padding-top:4px">本周共 ' + items.length + ' 条变化，显示最近 12 条</li>' : "");
  }

  // 本周动态全部 tab：全量 + 按类型筛选
  var weekFilter = "all";
  function weekSet(k) {
    weekFilter = k;
    var data = __data;
    if (data) renderWeekAll(data);
  }
  function renderWeekAll(d) {
    var box = document.getElementById("col-week");
    if (!box) return;
    var items = d.weekly || [];
    var kinds = ["all", "skill", "kb", "automation", "model"];
    var labels = { all: "全部", skill: "skill", kb: "知识库", automation: "自动化", model: "模型" };
    var chips = kinds.map(function (k) {
      var n = k === "all" ? items.length : items.filter(function (it) { return it.kind === k; }).length;
      return '<button class="week-chip' + (weekFilter === k ? " on" : "") + '" onclick="weekSet(' + "'" + k + "'" + ')">' + labels[k] + ' <span class="cc">' + n + "</span></button>";
    }).join("");
    var list = weekFilter === "all" ? items : items.filter(function (it) { return it.kind === weekFilter; });
    var body = list.length
      ? '<ul class="wk-list week-full">' + wkGroupHtml(list) + "</ul>"
      : '<div class="empty">该类型暂无变化</div>';
    box.innerHTML = '<div class="card"><h2>本周动态 · 全部（' + items.length + ' 条）</h2>' +
      '<div class="week-chips">' + chips + '</div>' + body + "</div>";
  }

  // ---------- AI 助手（Agnes / 智谱 GLM 双可选，浏览器直连，Key 存本机） ----------
  var AI_PROVIDERS = {
    agnes: { label: "Agnes 2.5 Flash", url: "https://apihub.agnes-ai.cn/v1/chat/completions", model: "agnes-2.5-flash", keyKey: "wb_ai_key_agnes" },
    glm: { label: "智谱 GLM Flash", url: "https://open.bigmodel.cn/api/paas/v4/chat/completions", model: "glm-4-flash", keyKey: "wb_ai_key_glm" }
  };
  var aiProv = localStorage.getItem("wb_ai_prov") === "glm" ? "glm" : "agnes";
  var aiMsgs = [];   // 会话内消息历史
  var aiBusy = false;
  function aiKeyLoad() { try { return localStorage.getItem(AI_PROVIDERS[aiProv].keyKey) || ""; } catch (e) { return ""; } }
  function aiKeySave(k) { try { localStorage.setItem(AI_PROVIDERS[aiProv].keyKey, k); } catch (e) {} }
  // 记忆：会话历史（刷新/重开不丢）长期记忆库（跨会话注入系统提示词）
  var AI_HIST_KEY = "wb_ai_history";
  var AI_MEM_KEY = "wb_ai_memory";
  function aiHistLoad() {
    try { var a = JSON.parse(localStorage.getItem(AI_HIST_KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function aiHistSave() {
    try { localStorage.setItem(AI_HIST_KEY, JSON.stringify(aiMsgs.slice(-50))); } catch (e) {}
  }
  function aiMemLoad() {
    try { var a = JSON.parse(localStorage.getItem(AI_MEM_KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function aiMemSave(arr) {
    try { localStorage.setItem(AI_MEM_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function aiMemHtml() {
    var mem = aiMemLoad();
    if (!mem.length) return '<li class="empty">还没有记忆。记一笔，AI 以后跨会话都记得。</li>';
    return mem.map(function (m) {
      return '<li><span class="ai-mem-t">' + esc(m.text) + '</span><button class="ai-mem-x" title="删除" onclick="aiMemoryDel(' + m.ts + ')">✕</button></li>';
    }).join("");
  }
  function aiSysPrompt() {
    var sys = "你是用户个人工作台的 AI 助手，用中文大白话回答，简洁、可操作。";
    var mem = aiMemLoad();
    if (mem.length) {
      sys += "\n\n以下是你记住的关于用户的信息（长期有效、跨会话，回答时自然运用，不要逐条复述）：\n" +
        mem.map(function (m) { return "• " + m.text; }).join("\n");
    }
    return sys;
  }
  function aiSetProv(p) {
    aiProv = AI_PROVIDERS[p] ? p : "agnes";
    try { localStorage.setItem("wb_ai_prov", aiProv); } catch (e) {}
    if (__data) renderAI(__data);
  }
  function renderAI(d) {
    var box = document.getElementById("col-ai");
    if (!box) return;
    aiMsgs = aiHistLoad();   // 恢复上次会话（刷新/重开不丢）
    var hasKey = !!aiKeyLoad();
    var mem = aiMemLoad();
    var memHtml = aiMemHtml();
    var provSel = Object.keys(AI_PROVIDERS).map(function (k) {
      return '<option value="' + k + '"' + (aiProv === k ? " selected" : "") + '>' + AI_PROVIDERS[k].label + "</option>";
    }).join("");
    var hint = aiProv === "agnes"
      ? "粘贴你的 Agnes API Key（apihub.agnes-ai.cn 申请，仅存本机浏览器）"
      : "粘贴智谱 API Key（bigmodel.cn 注册免费领，仅存本机浏览器）";
    box.innerHTML = '<div class="card"><h2>AI 助手</h2>' +
      '<div class="ai-set">' +
      '<select id="aiProvSel" class="sf ai-sel" onchange="aiSetProv(this.value)">' + provSel + "</select>" +
      '<input id="aiKey" class="sf" type="password" placeholder="' + escAttr(hint) + '" value="' + escAttr(aiKeyLoad()) + '">' +
      '<button class="btn-sm" onclick="aiSaveKey()">保存 Key</button>' +
      '<span id="aiKeyHint" class="empty">' + (hasKey ? "已保存" : "未设置") + '</span></div>' +
      '<div class="ai-bar">' +
      '<button class="btn-sm" onclick="aiClear()">清空对话</button>' +
      (hasKey ? "" : '<span class="ai-guide">⚠️ 还没设置 API Key，AI 暂时无法回答。在上方粘贴 Key 并点“保存”即可使用。</span>') +
      '</div>' +
      '<details class="ai-mem"><summary>长期记忆库（' + mem.length + ' 条）· 点开管理</summary>' +
      '<div class="ai-mem-add"><input id="aiMemInput" class="sf" placeholder="记一笔长期记忆，如：我偏好简洁回答 / 我在学 Flutter…">' +
      '<button class="btn-sm" onclick="aiMemoryAdd()">记下</button></div>' +
      '<ul class="ai-mem-list" id="aiMemList">' + memHtml + '</ul>' +
      '<div class="ai-mem-foot"><button class="btn-sm danger" onclick="aiMemoryClear()">清空记忆库</button>' +
      '<span class="empty">仅存本机，AI 跨会话都会看到</span></div></details>' +
      '<div class="ai-chat" id="aiChat">' +
      (aiMsgs.length ? "" : '<div class="empty">输入你的问题，AI 会用大白话回答。可问它：总结今天日报 / 帮我挑值得看的新闻 / 待办怎么安排…</div>') +
      "</div>" +
      '<div class="ai-input">' +
      '<textarea id="aiBox" rows="2" placeholder="问 AI 点什么…（Enter 发送，Shift+Enter 换行）"></textarea>' +
      '<button class="btn" onclick="aiSend()">发送</button></div>' +
      "</div>";
    var ta = document.getElementById("aiBox");
    if (ta) ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); aiSend(); }
    });
    // 恢复历史对话到聊天框
    if (aiMsgs.length) {
      aiMsgs.forEach(function (m) { aiAppend(m.role, m.content); });
    }
  }
  function aiSaveKey() {
    var k = document.getElementById("aiKey");
    aiKeySave(k ? k.value.trim() : "");
    var h = document.getElementById("aiKeyHint");
    if (h) h.textContent = aiKeyLoad() ? "✓ 已保存（仅本机浏览器）" : "已清除";
  }
  // 从其他卡片一键跳转 AI 助手：切 tab → 内容填入输入框（可选自动发送）
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
    if (role === "bot") {
      var wrap = document.createElement("div");
      wrap.className = "ai-msg bot";
      var body = document.createElement("div");
      body.className = "ai-bot-body";
      body.textContent = text;
      var cp = document.createElement("button");
      cp.className = "ai-copy";
      cp.textContent = "复制";
      cp.title = "复制这条回复";
      cp.onclick = function () {
        copyText(text);
        cp.textContent = "已复制";
        setTimeout(function () { cp.textContent = "复制"; }, 1500);
      };
      wrap.appendChild(body); wrap.appendChild(cp);
      chat.appendChild(wrap);
    } else {
      var div = document.createElement("div");
      div.className = "ai-msg " + role;
      div.textContent = text;
      chat.appendChild(div);
    }
    chat.scrollTop = chat.scrollHeight;
  }
  function copyText(t) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t);
      } else {
        var ta = document.createElement("textarea");
        ta.value = t; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
      }
    } catch (e) {}
  }
  function aiClear() {
    WB.dialog.confirm("清空当前对话？记忆库和长期记忆不受影响。", function () {
      aiMsgs = [];
      try { localStorage.removeItem(AI_HIST_KEY); } catch (e) {}
      var chat = document.getElementById("aiChat");
      if (chat) chat.innerHTML = '<div class="empty">对话已清空。输入问题，AI 会用大白话回答…</div>';
    });
  }
  function aiSend() {
    if (aiBusy) return;
    var box = document.getElementById("aiBox");
    var key = aiKeyLoad();
    var prov = AI_PROVIDERS[aiProv];
    if (!key) { WB.dialog.alert(aiProv === "agnes" ? "请先在上方粘贴 Agnes API Key 并保存。" : "请先在上方粘贴智谱 API Key 并保存（bigmodel.cn 注册免费领）。"); return; }
    var q = (box ? box.value : "").trim();
    if (!q) return;
    if (box) box.value = "";
    aiAppend("user", q);
    aiMsgs.push({ role: "user", content: q });
    aiHistSave();
    aiBusy = true;
    aiAppend("bot", "…思考中");
    fetchT(prov.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({
        model: prov.model,
        messages: [{ role: "system", content: aiSysPrompt() }].concat(aiMsgs.slice(-10)),
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
        // 推理模型可能把 token 都花在思考上：正文空时回退展示思考片段
        var ans = (msg && msg.content && msg.content.trim()) || (msg && msg.reasoning_content ? "（思考中：）\n" + msg.reasoning_content : "（空回复）");
        aiMsgs.push({ role: "assistant", content: ans });
        aiHistSave();
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
  function aiMemoryAdd() {
    var inp = document.getElementById("aiMemInput");
    if (!inp) return;
    var t = inp.value.trim();
    if (!t) return;
    var mem = aiMemLoad();
    mem.push({ ts: Date.now(), text: t });
    aiMemSave(mem);
    inp.value = "";
    if (__data) renderAI(__data);
    else { var ul = document.getElementById("aiMemList"); if (ul) ul.innerHTML = aiMemHtml(); }
  }
  function aiMemoryDel(ts) {
    var mem = aiMemLoad().filter(function (m) { return m.ts !== ts; });
    aiMemSave(mem);
    if (__data) renderAI(__data);
  }
  function aiMemoryClear() {
    WB.dialog.confirm("清空全部长期记忆？此操作不可恢复，对话不受影响。", function () {
      aiMemSave([]);
      if (__data) renderAI(__data);
    });
  }
  window.aiSaveKey = aiSaveKey; window.aiSend = aiSend; window.aiSetProv = aiSetProv; window.aiAsk = aiAsk; window.aiClear = aiClear; window.aiMemoryAdd = aiMemoryAdd; window.aiMemoryDel = aiMemoryDel; window.aiMemoryClear = aiMemoryClear;

  // 课程表模块已拆到 schedule.js（独立 IIFE，window.WB.esc 依赖注入，加载顺序在 app.js 前）
  // 对外接口：window.renderSchedule / ghToken / scheduleLoad / schedulePullCloud / setGhToken / GH_REPO

  // 头部条（KPI/同步/快捷启动/本周动态）+ tab 内容拆分渲染：省 CPU、按需
  function renderHeaderStrip(d) {
    document.getElementById("snap").textContent = "快照 · " + (d.generatedAt || "-");
    renderSync(d);
    renderFreshness(d);
    renderKPI(d);
    renderOverview(d);
    renderOvCard(d);
    renderQuick(d);
    renderWeekly(d);
  }
  function renderActiveTab(d) {
    if (!d) return;
    var a = document.querySelector(".tab.active");
    var id = a ? a.getAttribute("data-tab") : "cap";
    if (id === "cap") renderCap(d);
    else if (id === "ai") renderAI(d);
    else if (id === "info") renderInfo(d);
    else if (id === "ov") renderOv(d);
    else if (id === "stats") renderStats(d);
    else if (id === "sess") renderSessArchive(d);
    else if (id === "week") renderWeekAll(d);
    // schedule 是纯 localStorage，启动时已渲染，无需数据
  }
  // ---------- 数据规范化（兜底缺字段，避免 data.json 部分缺失/损坏导致白屏） ----------
  function normalizeData(d) {
    d = d || {};
    d.kpi = d.kpi || {};
    d.status = d.status || {};
    d.status.disk = d.status.disk || {};
    d.skills = Array.isArray(d.skills) ? d.skills : [];
    d.sessions = d.sessions || {};
    d.sessions.recent = Array.isArray(d.sessions.recent) ? d.sessions.recent : [];
    d.sessions.heatmap = Array.isArray(d.sessions.heatmap) ? d.sessions.heatmap : [];
    d.aiDaily = d.aiDaily || {};
    d.aiDaily.sections = Array.isArray(d.aiDaily.sections) ? d.aiDaily.sections : [];
    d.aiDaily.history = Array.isArray(d.aiDaily.history) ? d.aiDaily.history : [];
    d.dailyNews = d.dailyNews || {};
    d.dailyNews.items = Array.isArray(d.dailyNews.items) ? d.dailyNews.items : [];
    d.dailyNews.history = Array.isArray(d.dailyNews.history) ? d.dailyNews.history : [];
    d.weekly = Array.isArray(d.weekly) ? d.weekly : [];
    d.guide = Array.isArray(d.guide) ? d.guide : [];
    d.quickActions = Array.isArray(d.quickActions) ? d.quickActions : [];
    d.knowledge = d.knowledge || {};
    d.knowledge.types = d.knowledge.types || {};
    d.knowledge.files = Array.isArray(d.knowledge.files) ? d.knowledge.files : [];
    return d;
  }
  function render(d) {
    try {
      d = normalizeData(d);
      __data = d;
      renderHeaderStrip(d);
      renderActiveTab(d);
    } catch (err) {
      console.error("render 出错", err);
      var box = document.getElementById("col-cap");
      if (box && !box.innerHTML) {
        box.innerHTML = '<div class="card"><h2>⚠️ 渲染异常</h2><div class="empty">页面渲染遇到问题：' +
          esc(String((err && err.message) || err)) +
          '。其余内容已尽量保留，可点「立即刷新」重试。</div></div>';
      }
    }
  }

  // ---------- 同步健康度（数据新鲜度 + 失败/陈旧告警） ----------
  function renderFreshness(d) {
    var el = document.getElementById("freshness");
    if (!el) return;
    var st = (d && d.status) || {};
    var parts = [];
    var since = function (ds) {
      if (!ds) return "未知";
      var t = new Date(String(ds).slice(0, 10) + "T00:00:00").getTime();
      var days = Math.max(0, Math.round((Date.now() - t) / 86400000));
      if (days === 0) return "今天";
      if (days === 1) return "昨天";
      return days + " 天前";
    };
    if (st.skillsLastUpdate) parts.push("skills 数据 " + since(st.skillsLastUpdate));
    if (st.memoryLastUpdate) parts.push("记忆库 " + since(st.memoryLastUpdate));
    el.textContent = parts.length ? parts.join(" · ") + " · " : "";
  }
  function renderSync(d) {
    var el = document.getElementById("syncStatus");
    if (!el) return;
    var s = d.sync;
    if (!s || !s.lastRun) {
      el.className = "sync-status warn";
      el.textContent = "⚠️ 暂无同步记录，定时任务可能未运行";
      return;
    }
    var last = new Date(s.lastRun.replace(" ", "T"));
    var stale = (s.staleHours != null) ? s.staleHours : 2;
    var diffMs = Date.now() - last.getTime();
    var diffH = diffMs / 3600000;
    var hhmm = (last.getMonth() + 1) + "-" + last.getDate() + " " +
      ("0" + last.getHours()).slice(-2) + ":" + ("0" + last.getMinutes()).slice(-2);

    if (s.status === "fail" || diffH > stale) {
      el.className = "sync-status warn";
      var overdue = diffH > 0 ? "，已超时约 " + (diffH >= 1 ? diffH.toFixed(1) + " 小时" : Math.round(diffMs / 60000) + " 分钟") : "";
      el.textContent = "⚠️ 同步可能已停止（上次 " + hhmm + overdue + "）· 定时任务或网络异常";
    } else {
      el.className = "sync-status ok";
      var next = s.nextRun ? new Date(s.nextRun.replace(" ", "T")) : null;
      var nextStr = next ? (" · 下次约 " + ("0" + next.getHours()).slice(-2) + ":" + ("0" + next.getMinutes()).slice(-2)) : "";
      el.textContent = "✅ 同步正常（上次 " + hhmm + nextStr + "）";
    }
  }

  // ---------- 启动 ----------
  var __lastGen = "";
  // 私有仓里 data.json 最近一次提交的 sha（顶替旧的 Last-Modified 探测）
  var __lastSha = "";
  var __data = null;
  // 数据通道（2026-09-15 方案 C）：data.json 不再随站点发布，改从私有仓现取。
  // auto-sync 是 sync.py / daily_ai.py 每小时推送的分支（最新），main 作兜底。
  var DATA_BRANCH = "auto-sync";
  var DATA_BRANCH_FB = "main";
  var DATA_CACHE_KEY = "wb_data_cache";
  function saveDataCache(d) {
    try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
  }
  function loadDataCache() {
    try {
      var o = JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || "null");
      return (o && o.d) ? o.d : null;
    } catch (e) { return null; }
  }
  // 带超时的 fetch：防止网络挂起导致页面一直"加载中"像冻住
  function fetchT(url, opts, ms) {
    ms = ms || 15000;
    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var o = opts || {};
    if (ctrl) o.signal = ctrl.signal;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return fetch(url, o).then(
      function (r) { clearTimeout(timer); return r; },
      function (e) { clearTimeout(timer); throw e; }
    );
  }
  function loadData() {
    return ghFetchJson("data.json", DATA_BRANCH)
      .catch(function (e) {
        var m = String((e && e.message) || e);
        if (m.indexOf("HTTP 404") >= 0) return ghFetchJson("data.json", DATA_BRANCH_FB);
        throw e;
      })
      .then(function (res) {
        __lastSha = res.sha || "";
        saveDataCache(res.json);
        render(res.json);
        __lastGen = res.json.generatedAt || "";
        return res.json;
      })
      .catch(function (e) {
        var m = String((e && e.message) || e);
        // 断网/网络异常退回上次成功缓存，尽量别白屏；Token 缺失或无效不兜底，免得误以为数据是新的
        if (m !== "NONTOKEN" && m.indexOf("HTTP 401") < 0 && m.indexOf("HTTP 403") < 0) {
          var c = loadDataCache();
          if (c) { render(c); __lastGen = c.generatedAt || ""; return c; }
        }
        throw e;
      });
  }
  // 数据变化时自动重渲染：只问「data.json 最近一次提交的 sha」，变了才下载正文（省 99% 流量）
  function maybeReload() {
    if (!ghToken()) return Promise.resolve(false);
    return ghLatestSha("data.json", DATA_BRANCH)
      .catch(function () { return ghLatestSha("data.json", DATA_BRANCH_FB); })
      .then(function (sha) {
        if (!sha || sha === __lastSha) return false;
        return ghFetchJson("data.json", DATA_BRANCH)
          .catch(function () { return ghFetchJson("data.json", DATA_BRANCH_FB); })
          .then(function (res) {
            var d = normalizeData(res.json);
            __data = d;
            renderHeaderStrip(d);
            renderActiveTab(d);
            __lastGen = d.generatedAt || "";
            __lastSha = res.sha || sha;
            saveDataCache(d);
            return true;
          });
      })
      .catch(function () { return false; });
  }
  // 供 schedule.js 的 setGhToken 回调使用：刚填完 Token 立刻重拉一次
  window.wbReloadAfterToken = function () { loadData().catch(function () {}); };
  // ---------- 立即刷新：触发 GitHub Actions 同步（等同手动 Run workflow） ----------
  function refreshData() {
    var btn = document.getElementById("refreshBtn");
    var token = ghToken();
    if (!token) {
      WB.dialog.alert("首次使用需要先填 GitHub Token（只存你浏览器）。\n点「确定」后粘贴 Token（需要 repo + workflow 权限），填好再来点刷新。", function () { setGhToken(); });
      return;
    }
    var old = btn ? btn.textContent : "立即刷新";
    if (btn) { btn.disabled = true; btn.textContent = "⏳ 触发同步…"; }

    var api = "https://api.github.com/repos/" + GH_REPO + "/actions/workflows/sync.yml/dispatches";
    // 在发起请求前记录时间戳，并预留 3 秒缓冲，避免 run 创建时间早于 POST 响应导致漏检
    var afterTs = Date.now() - 3000;
    fetch(api, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({ ref: "main" })
    }).then(function (r) {
      if (r.ok) return;
      if (r.status === 401 || r.status === 403) throw new Error("Token 无效或权限不足（需要 repo + workflow 权限，HTTP " + r.status + "）");
      if (r.status === 404) throw new Error("找不到同步工作流（404），请确认仓库/分支名");
      throw new Error("触发失败：HTTP " + r.status);
    }).then(function () {
      if (btn) btn.textContent = "本机 Runner 执行中…";
      pollUntilSynced(btn, old, 0, afterTs);
    }).catch(function (err) {
      if (btn) { btn.disabled = false; btn.textContent = old; }
      WB.dialog.alert("立即刷新失败：" + err.message);
    });
  }

  // 轮询本次触发的运行，完成后等 Pages 重新部署再刷新页面
  function pollUntilSynced(btn, old, tries, afterTs) {
    var MAX = 24; // 24 × 10s ≈ 4 分钟
    if (tries >= MAX) {
      if (btn) { btn.disabled = false; btn.textContent = old; }
      WB.dialog.alert("同步任务已提交，但本机 Runner 似乎没在运行（任务一直排队）。\n请确认本机 Runner 进程已启动，或稍后手动刷新浏览器。");
      loadData().catch(function () {});
      return;
    }
    var runsApi = "https://api.github.com/repos/" + GH_REPO + "/actions/workflows/sync.yml/runs?per_page=10";
    fetch(runsApi, {
      headers: {
        "Authorization": "Bearer " + ghToken(),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }).then(function (r) { return r.json(); }).then(function (j) {
      // 取 created_at >= afterTs 的最新一次运行
      var runs = (j.workflow_runs || []).filter(function (x) {
        return new Date(x.created_at).getTime() >= afterTs;
      }).sort(function (a, b) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      var run = runs[0] || null;
      if (run && run.status === "completed") {
        if (run.conclusion === "success") {
          if (btn) btn.textContent = "✅ 同步完成，刷新中…";
          tightReload(btn, old, 0);
        } else {
          if (btn) { btn.disabled = false; btn.textContent = old; }
          WB.dialog.alert("本次同步运行失败（" + (run.conclusion || "unknown") + "），请到 GitHub Actions 看日志。");
          loadData().catch(function () {});
        }
      } else if (run && (run.status === "in_progress" || run.status === "queued" || run.status === "waiting")) {
        if (btn) btn.textContent = "本机 Runner 执行中… (" + (tries + 1) + "/" + MAX + ")";
        setTimeout(function () { pollUntilSynced(btn, old, tries + 1, afterTs); }, 10000);
      } else {
        // 列表里还没出现本次触发，继续等
        setTimeout(function () { pollUntilSynced(btn, old, tries + 1, afterTs); }, 10000);
      }
    }).catch(function () {
      setTimeout(function () { pollUntilSynced(btn, old, tries + 1, afterTs); }, 10000);
    });
  }
  // 同步完成后紧轮询：每 10s 看一次数据，直到 generatedAt 变化（新数据已上线）再复位按钮
  function tightReload(btn, old, tries) {
    if (tries >= 30) { // 30 × 10s ≈ 5 分钟，给 GitHub Pages 部署留足时间
      if (btn) { btn.disabled = false; btn.textContent = old; }
      WB.dialog.alert("本机同步已完成，但 GitHub Pages 上线略有延迟。\n页面会在后台继续检测，30 秒内若数据上线会自动刷新；也可稍后手动刷新浏览器。");
      return;
    }
    if (btn) btn.textContent = "✅ 同步完成，刷新中… (" + (tries + 1) + "/30)";
    maybeReload().then(function (reloaded) {
      if (reloaded) { if (btn) { btn.disabled = false; btn.textContent = old; } }
      else setTimeout(function () { tightReload(btn, old, tries + 1); }, 10000);
    });
  }
  window.refreshData = refreshData;

  // ---------- 功能自检：一键验证「触发 → 同步 → 自动刷新」全链路 ----------
  function setSelfCheck(cls, msg) {
    var box = document.getElementById("selfCheckResult");
    if (!box) return;
    box.className = "selfcheck" + (cls ? " " + cls : "");
    box.style.display = "block";
    box.textContent = msg;
  }
  function selfCheck() {
    var btn = document.getElementById("selfCheckBtn");
    var token = ghToken();
    if (!token) {
      setSelfCheck("warn", "⚠️ 需先填 GitHub Token（点「🌙」旁的 或首次点「立即刷新」会提示）");
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = "🔍 自检中…"; }
    setSelfCheck("run", "步骤 1/4 · 正在触发同步…");

    var api = "https://api.github.com/repos/" + GH_REPO + "/actions/workflows/sync.yml/dispatches";
    var afterTs = Date.now() - 3000;
    fetch(api, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({ ref: "main" })
    }).then(function (r) {
      if (r.ok) return;
      if (r.status === 401 || r.status === 403) throw new Error("Token 无效或权限不足（HTTP " + r.status + "）");
      if (r.status === 404) throw new Error("找不到同步工作流（404）");
      throw new Error("触发失败：HTTP " + r.status);
    }).then(function () {
      pollSelfCheck(btn, afterTs, 0);
    }).catch(function (err) {
      if (btn) { btn.disabled = false; btn.textContent = "🔍 功能自检"; }
      setSelfCheck("warn", "❌ 自检中断：" + err.message);
    });
  }
  function pollSelfCheck(btn, afterTs, tries) {
    var MAX = 24;
    if (tries >= MAX) {
      if (btn) { btn.disabled = false; btn.textContent = "🔍 功能自检"; }
      setSelfCheck("warn", "❌ 超时：本机 Runner 一直没响应，请确认 Runner 服务在运行");
      return;
    }
    var runsApi = "https://api.github.com/repos/" + GH_REPO + "/actions/workflows/sync.yml/runs?per_page=10";
    fetch(runsApi, {
      headers: {
        "Authorization": "Bearer " + ghToken(),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }).then(function (r) { return r.json(); }).then(function (j) {
      var runs = (j.workflow_runs || []).filter(function (x) {
        return new Date(x.created_at).getTime() >= afterTs;
      }).sort(function (a, b) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      var run = runs[0] || null;
      if (run && run.status === "completed") {
        if (run.conclusion === "success") {
          setSelfCheck("run", "步骤 3/4 · 同步成功 (run " + run.id + ")，等待数据上线…");
          tightReloadSelfCheck(btn, 0);
        } else {
          if (btn) { btn.disabled = false; btn.textContent = "🔍 功能自检"; }
          setSelfCheck("warn", "❌ 同步运行失败（" + (run.conclusion || "unknown") + "），请到 GitHub Actions 看日志");
        }
      } else if (run && (run.status === "in_progress" || run.status === "queued" || run.status === "waiting")) {
        setSelfCheck("run", "步骤 2/4 · Runner 执行中（" + run.status + "）…");
        setTimeout(function () { pollSelfCheck(btn, afterTs, tries + 1); }, 10000);
      } else {
        setSelfCheck("run", "步骤 2/4 · 等待 Runner 接收任务…");
        setTimeout(function () { pollSelfCheck(btn, afterTs, tries + 1); }, 10000);
      }
    }).catch(function () {
      setTimeout(function () { pollSelfCheck(btn, afterTs, tries + 1); }, 10000);
    });
  }
  function tightReloadSelfCheck(btn, tries) {
    if (tries >= 30) {
      if (btn) { btn.disabled = false; btn.textContent = "🔍 功能自检"; }
      setSelfCheck("warn", "⚠️ 同步已完成，但数据上线略有延迟，页面会在后台自动刷新");
      return;
    }
    maybeReload().then(function (reloaded) {
      if (reloaded) {
        if (btn) { btn.disabled = false; btn.textContent = "🔍 功能自检"; }
        setSelfCheck("ok", "✅ 自检通过：触发 → 同步 → 自动刷新 全链路正常");
      } else {
        setTimeout(function () { tightReloadSelfCheck(btn, tries + 1); }, 10000);
      }
    });
  }
  // ---------- 常用入口（纯前端，本机 localStorage 存，不依赖 data.json） ----------
  var LINKS_KEY = "wb_links";
  var DEFAULT_LINKS = [
    {"label": "抖音", "url": "https://www.douyin.com"},
    {"label": "WorkBuddy 文档", "url": "https://www.workbuddy.cn/docs/"},
    {"label": "本仓库源码", "url": "https://github.com/W-lik721/personal-workbench"},
    {"label": "AI 日报源", "url": "https://aihot.virxact.com/daily"},
    {"label": "每日新闻源", "url": "https://github.com/vikiboss/60s"},
    {"label": "本地 Ollama", "url": "http://localhost:11434"}
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
    if (!links.length) { g.innerHTML = '<div class="empty">还没有入口，点“加一个”添加常用链接</div>'; return; }
    g.innerHTML = links.map(function (l, i) {
      return '<a class="link-item" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
        '<span class="li-ic"></span><span class="li-label">' + esc(l.label) + '</span>' +
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
    WB.dialog.prompt("入口名称", "", function (label) {
      if (!label) return;
      label = label.trim();
      if (!label) return;
      WB.dialog.prompt("链接地址", "https://", function (url) {
        if (url === null) return;
        url = (url || "").trim();
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        var links = getLinks(); links.push({ label: label, url: url }); saveLinks(links); renderLinks();
        var h = document.getElementById("linksHint"); if (h) h.textContent = "✓ 已添加（仅存本浏览器）";
      }, null, "以 http 开头，可留空自动补 https://");
    }, null, "如：抖音");
  }
  function delLink(i) {
    var links = getLinks(); if (i < 0 || i >= links.length) return;
    links.splice(i, 1); saveLinks(links); renderLinks();
  }

  // ---------- 一键导出（速记/待办/收藏/入口 → Markdown） ----------
  // ---------- 今日概览（KPI + 头条 + 引导 → 一键发给 AI 助手） ----------
  function copyToday() {
    var d = __data;
    if (!d) { aiAsk("今日数据还没加载完，请稍等几秒再点。"); return; }
    var lines = [];
    var k = d.kpi || {};
    lines.push("今天是 " + (d.generatedAt ? String(d.generatedAt).slice(0, 10) : "") + "，我的工作台现状：");
    lines.push("- 已装 " + (k.skills || 0) + " 个 skills，知识库 " + (k.knowledge || 0) + " 个文件，定时任务 " + (k.automations || 0) + " 个，记忆库 " + (k.memory || 0) + " 个文件");
    var disk = (d.status && d.status.disk) || {};
    if (disk.D) lines.push("- D 盘可用 " + disk.D.free + "G（共 " + disk.D.total + "G）");
    var news = (d.dailyNews && d.dailyNews.items) || [];
    if (news.length) {
      lines.push("- 今日新闻 Top3：");
      news.slice(0, 3).forEach(function (n, i) { lines.push((i + 1) + ". " + n.title); });
    }
    var ai = (d.aiDaily && d.aiDaily.count) || 0;
    if (ai) lines.push("- AI 日报已抓取 " + ai + " 条");
    var guide = d.guide || [];
    if (guide.length) {
      lines.push("- 今日引导：" + guide.slice(0, 2).join("；"));
    }
    lines.push("");
    lines.push("请基于以上信息，给我今天最值得做的 3 件事（结合我的 skill 和知识库）。");
    aiAsk(lines.join("\n"));
  }
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

  // ---------- 数据备份 / 恢复（JSON，可完整还原） ----------
  function backupExport() {
    var data = { notes: notesLoad(), todos: todosLoad(), favs: favsLoad(), links: getLinks() };
    var payload = { app: "lite_workbench_web", version: 1, exportedAt: new Date().toISOString(), data: data };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    var p2 = function (n) { return ("0" + n).slice(-2); };
    var d = new Date();
    a.download = "工作台备份_" + d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function doImportBackup(m) {
    if (!m || !m.data || typeof m.data !== "object") { WB.dialog.alert("不是有效的工作台备份文件"); return; }
    WB.dialog.confirm("导入将用备份覆盖当前的 速记 / 待办 / 收藏 / 常用入口。\n确定继续吗？（建议先点“备份”存一份当前数据）", function () {
      var d = m.data;
      if (d.notes) notesSave(d.notes);
      if (d.todos) todosSave(d.todos);
      if (d.favs) favsSave(d.favs);
      if (d.links) saveLinks(d.links);
      renderNotes(); renderTodos(); renderFavs(); renderLinks();
      WB.dialog.alert("✓ 已恢复备份（速记 / 待办 / 收藏 / 常用入口）");
    });
  }
  function backupImportFromFile(input) {
    var f = input.files && input.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function (e) {
      try { doImportBackup(JSON.parse(String(e.target.result))); }
      catch (err) { WB.dialog.alert("备份文件解析失败：" + err.message); }
    };
    r.onerror = function () { WB.dialog.alert("读取文件失败"); };
    r.readAsText(f, "utf-8");
    input.value = "";
  }
  function backupImport() {
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "application/json,.json";
    inp.onchange = function () { backupImportFromFile(inp); };
    inp.click();
  }
  window.backupExport = backupExport; window.backupImport = backupImport;

  // ---------- 头部实时时钟 ----------
  function updateClock() {
    var el = document.getElementById("clock");
    if (!el) return;
    var now = new Date();
    var wd = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
    var p2 = function (n) { return ("0" + n).slice(-2); };
    el.textContent = "🕐 " + (now.getMonth() + 1) + "-" + p2(now.getDate()) + " 周" + wd + " " + p2(now.getHours()) + ":" + p2(now.getMinutes()) + ":" + p2(now.getSeconds());
  }
  window.exportAll = exportAll; window.updateClock = updateClock; window.copyToday = copyToday; window.backupExport = backupExport; window.backupImport = backupImport;
  window.favToggle = favToggle; window.delFav = delFav; window.clearFavs = clearFavs; window.renderFavs = renderFavs;
  window.addLink = addLink; window.delLink = delLink; window.renderLinks = renderLinks;

  window.selfCheck = selfCheck;
  applyTheme();
  renderNotes();
  renderSchedule();
  renderLinks();
  renderTodos();
  renderFavs();
  updateClock();
  setInterval(updateClock, 1000);
  pomoRender();
  // 本地无课程表时，自动从云端拉取一次（换设备也能看到）
  if (!scheduleLoad().length) schedulePullCloud(true);
  var ni = document.getElementById("noteInput");
  if (ni) ni.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); } });
  var ti = document.getElementById("todoInput");
  if (ti) ti.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addTodo(); } });
  loadData().catch(function (e) {
    var m = String((e && e.message) || e);
    if (m === "NONTOKEN") {
      document.getElementById("col-cap").innerHTML =
        '<div class="card"><h2>🔑 需要 GitHub Token</h2><div class="empty">' +
        "网页版已改为「站点公开、数据私有」：页面的静态文件放在公开仓，" +
        "你的 data.json / 课程表仍在私有仓，所以浏览器要带 Token 才读得到。" +
        "<br>Token 只存在你这台设备的浏览器里，不会上传到任何地方；需要 repo + workflow 权限。" +
        '<div style="margin-top:10px"><button class="btn" onclick="setGhToken()">填入 Token</button></div></div></div>';
      return;
    }
    document.getElementById("col-cap").innerHTML = '<div class="card"><h2>⚠️ 数据加载失败</h2><div class="empty">无法读取 data.json：' + esc(m) + "。10 秒后自动重试。</div></div>";
    // 网络抖动恢复：10 秒后自动重试一次
    setTimeout(function () { loadData().catch(function () {}); }, 10000);
  });
  // 恢复上次停留的标签页
  var lastTab = "";
  try { lastTab = localStorage.getItem("wb_tab") || ""; } catch (e) {}
  if (lastTab === "news" || lastTab === "dnews") lastTab = "info"; // 资讯 Tab 合并兼容
  if (lastTab && lastTab !== "cap") switchTab(lastTab);

  // 后台自动刷新：每 30s 检测数据是否更新，有变化就自动重渲染（覆盖每小时自动同步）
  // 页面不可见（切后台标签页）时暂停轮询省流量/电量，回到前台立即补查一次
  var pollTimer = setInterval(maybeReload, 30000);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    } else {
      if (!pollTimer) pollTimer = setInterval(maybeReload, 30000);
      maybeReload();
    }
  });

  // 全局键盘增强：按 / 聚焦搜索（不在输入框时）；按 Esc 关闭热力图弹窗
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var hm = document.getElementById("heat-detail");
      if (hm && hm.style.display === "flex") { closeHeat(); return; }
    }
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "")) {
      var q = document.getElementById("q");
      if (q) { e.preventDefault(); q.focus(); q.select(); }
    }
  });

  // 离线提示：断网时顶部出现提示条，恢复后自动消失（复用已有 Service Worker 离线缓存能力）
  var offlineEl = null;
  function showOffline(on) {
    if (on && !offlineEl) {
      offlineEl = document.createElement("div");
      offlineEl.className = "offline-bar";
      offlineEl.textContent = "当前离线 · 正在显示已缓存的数据";
      var hd = document.querySelector(".header");
      if (hd && hd.parentNode) hd.parentNode.insertBefore(offlineEl, hd);
    } else if (!on && offlineEl) {
      if (offlineEl.parentNode) offlineEl.parentNode.removeChild(offlineEl);
      offlineEl = null;
    }
  }
  window.addEventListener("offline", function () { showOffline(true); });
  window.addEventListener("online", function () { showOffline(false); });
  if (!navigator.onLine) showOffline(true);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  // ---------- PWA 安装引导（Android/Chrome 一键装，iOS 给说明） ----------
  var installEvt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    installEvt = e;
    var b = document.getElementById("installBtn");
    if (b) b.style.display = "";
  });
  window.addEventListener("appinstalled", function () {
    installEvt = null;
    var b = document.getElementById("installBtn");
    if (b) b.style.display = "none";
  });
  window.promptInstall = function () {
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      WB.dialog.alert("iPhone / iPad 安装方法：点浏览器底部「分享」按钮 → 「添加到主屏幕」，之后就能像 App 一样从桌面打开。");
      return;
    }
    if (!installEvt) {
      WB.dialog.alert("当前浏览器不支持一键安装。可以打开浏览器菜单 →「添加到主屏幕 / 安装应用」，效果一样。");
      return;
    }
    installEvt.prompt();
    installEvt.userChoice.then(function () { installEvt = null; });
  };
})();
