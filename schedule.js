/* schedule.js —— 课程表模块（从 app.js 拆出）
 * 依赖：window.WB.esc（由 app.js 注入，函数调用时才求值，加载顺序无关）
 * 加载顺序：schedule.js 必须在 app.js 之前（app.js 启动段会调用 window.renderSchedule）
 */
(function () {
  "use strict";

  // 与 app.js 共享同一 WB 对象（先建后挂），app.js 晚到也会往同一对象上塞 esc
  window.WB = window.WB || {};
  var WB = window.WB;
  function esc(s) { return WB.esc(s); }

  var GH_REPO = "W-lik721/personal-workbench";
  var GH_CONTENTS = "https://api.github.com/repos/" + GH_REPO + "/contents/";
  var GH_API = GH_CONTENTS + "schedule.json";
  var GH_TOKEN_KEY = "wb_gh_token";
  function ghToken() { return localStorage.getItem(GH_TOKEN_KEY) || ""; }
  function ghHeaders() {
    return {
      "Authorization": "Bearer " + ghToken(),
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }
  function ghB64ToText(b64) {
    var bin = atob(String(b64 || "").replace(/\s+/g, ""));
    try {
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder("utf-8").decode(bytes);
    } catch (e) { return decodeURIComponent(escape(bin)); }
  }
  // ---------- 私有仓数据通道（2026-09-15 方案 C）----------
  // 站点改成发布到公开仓，data.json / schedule.json 留在私有仓，
  // 由浏览器带 Token 走 Contents API 现取（api.github.com 支持 CORS）。
  // 无 Token 时 reject Error("NONTOKEN")，调用方据此给引导。
  function ghFetchJson(path, branch) {
    if (!ghToken()) return Promise.reject(new Error("NONTOKEN"));
    branch = branch || "main";
    var url = GH_CONTENTS + path + "?ref=" + encodeURIComponent(branch) + "&t=" + Date.now();
    return fetch(url, { cache: "no-store", headers: ghHeaders() })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " @" + path + "#" + branch);
        return r.json();
      })
      .then(function (meta) {
        if (meta && meta.content) {
          return { json: JSON.parse(ghB64ToText(meta.content)), sha: meta.sha || "", branch: branch };
        }
        if (meta && meta.download_url) {
          return fetch(meta.download_url, { cache: "no-store", headers: ghHeaders() })
            .then(function (rr) {
              if (!rr.ok) throw new Error("HTTP " + rr.status + " @raw " + path);
              return rr.json();
            })
            .then(function (j) { return { json: j, sha: (meta && meta.sha) || "", branch: branch }; });
        }
        throw new Error("空响应 @" + path);
      });
  }
  // 轻量变更探测：只取该文件最近一次提交的 sha，不下载正文（顶替旧的 HEAD 探测）
  function ghLatestSha(path, branch) {
    if (!ghToken()) return Promise.reject(new Error("NONTOKEN"));
    branch = branch || "main";
    var url = "https://api.github.com/repos/" + GH_REPO + "/commits?path=" +
      encodeURIComponent(path) + "&sha=" + encodeURIComponent(branch) + "&per_page=1&t=" + Date.now();
    return fetch(url, { cache: "no-store", headers: ghHeaders() })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " @commits");
        return r.json();
      })
      .then(function (arr) { return (arr && arr[0] && arr[0].sha) || ""; });
  }
  window.ghFetchJson = ghFetchJson;
  window.ghLatestSha = ghLatestSha;
  function setGhToken() {
    WB.dialog.prompt("GitHub Token", ghToken(), function (t) {
      if (t === null) return;
      if (t.trim()) localStorage.setItem(GH_TOKEN_KEY, t.trim());
      else localStorage.removeItem(GH_TOKEN_KEY);
      var h = document.getElementById("schedHint");
      if (h) h.textContent = t.trim() ? "✓ Token 已保存（仅本浏览器）" : "已清除 Token";
      // 刚填完 Token 就把数据重拉一遍，省得用户再手动刷新
      if (t.trim() && typeof window.wbReloadAfterToken === "function") window.wbReloadAfterToken();
    }, null, "需要 repo + workflow 权限，仅存本浏览器");
  }
  function b64encodeUtf8(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  // 把本地课程表推到 GitHub（schedule.json）
  function schedulePushCloud() {
    var token = ghToken();
    var hint = document.getElementById("schedHint");
    if (!token) { if (hint) hint.textContent = "请先点 设置 GitHub Token"; return; }
    var list = scheduleLoad();
    var body = b64encodeUtf8(JSON.stringify(list, null, 2));
    var put = function (sha) {
      return fetch(GH_API, {
        method: "PUT",
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "chore: update schedule from workbench", content: body, sha: sha })
      });
    };
    fetch(GH_API, { headers: { "Authorization": "Bearer " + token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (meta) { return put(meta && meta.sha ? meta.sha : undefined); })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function () { if (hint) hint.textContent = "✓ 已备份到云端（" + list.length + " 条）"; })
      .catch(function (err) { if (hint) hint.textContent = "备份失败：" + err.message; });
  }
  // 从 GitHub 拉取课程表覆盖本地
  function schedulePullCloud(silent) {
    var hint = document.getElementById("schedHint");
    // 2026-09-15：仓库转私有后 raw.githubusercontent 不能匿名读了，改走 Contents API
    ghFetchJson("schedule.json", "main")
      .then(function (res) { return res.json; })
      .then(function (list) {
        if (list && list.length) {
          scheduleSave(list); renderSchedule();
          if (hint && !silent) hint.textContent = "✓ 已从云端拉取 " + list.length + " 条";
        } else if (!silent && hint) {
          hint.textContent = "云端暂无课程表";
        }
      })
      .catch(function (err) {
        if (silent) return;
        var m = String((err && err.message) || err);
        if (!hint) return;
        hint.textContent = m === "NONTOKEN"
          ? "需要先点「Token」填入 GitHub Token，才能从云端拉取"
          : "拉取失败：" + m;
      });
  }
  window.schedulePushCloud = schedulePushCloud;
  window.schedulePullCloud = schedulePullCloud;
  window.setGhToken = setGhToken;

  var WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  var SCHED_KEY = "wb_schedule";
  function scheduleLoad() {
    try { return JSON.parse(localStorage.getItem(SCHED_KEY) || "[]"); } catch (e) { return []; }
  }
  function scheduleSave(list) {
    try { localStorage.setItem(SCHED_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function normDow(s) {
    if (s == null) return "";
    var t = String(s).trim().replace(/\s+/g, "");
    if (!t) return "";
    var cn = ["一", "二", "三", "四", "五", "六", "日"];
    var m = /(?:星期|周|礼拜)\s*([一二三四五六日天1-7])/.exec(t);
    if (m) {
      var ch = m[1];
      if (ch === "天") return "周日";
      var idx = cn.indexOf(ch);
      if (idx >= 0) return "周" + cn[idx];
      var n = parseInt(ch, 10);
      if (n >= 1 && n <= 7) return "周" + cn[n - 1];
    }
    var n2 = parseInt(t, 10);
    if (!isNaN(n2) && n2 >= 1 && n2 <= 7) return "周" + cn[n2 - 1];
    var low = t.toLowerCase();
    var en = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    var ab = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    for (var i = 0; i < 7; i++) {
      if (low === en[i] || low.indexOf(ab[i]) === 0) return "周" + cn[i];
    }
    return "";
  }
  var COL_ALIAS = {
    dow: ["星期", "周几", "星期几", "weekday", "dow"],
    time: ["时间", "节次", "时段", "time", "period"],
    name: ["课程", "课名", "科目", "名称", "course", "subject"],
    location: ["地点", "教室", "位置", "room", "location", "place", "场地"],
    teacher: ["老师", "教师", "授课", "讲师", "teacher", "instructor"],
    note: ["备注", "说明", "note", "remark", "注释", "批注"]
  };
  function detectField(header) {
    if (!header) return null;
    header = String(header).trim().toLowerCase();
    for (var f in COL_ALIAS) {
      var als = COL_ALIAS[f];
      for (var i = 0; i < als.length; i++) {
        if (header.indexOf(als[i].toLowerCase()) >= 0) return f;
      }
    }
    return null;
  }
  function headerHits(row) {
    var n = 0;
    for (var i = 0; i < row.length; i++) { if (detectField(row[i])) n++; }
    return n;
  }
  function rowToCourse(arr, headers) {
    var obj = {};
    if (headers && headers.length) {
      headers.forEach(function (h, i) {
        var f = detectField(h);
        if (f && arr[i] != null) obj[f] = String(arr[i]).trim();
      });
    } else {
      var pos = ["dow", "time", "name", "location", "teacher", "note"];
      arr.forEach(function (v, i) { if (pos[i] && v != null) obj[pos[i]] = String(v).trim(); });
    }
    obj.dow = normDow(obj.dow);
    if (!obj.name && !obj.time && !obj.dow) return null;
    if (!obj.name && arr.length === 1 && arr[0]) obj.name = String(arr[0]).trim();
    return obj;
  }
  function parseDelimited(text) {
    var lines = String(text).split(/\r?\n/).map(function (l) { return l.trim(); }).filter(function (l) { return l.length; });
    if (!lines.length) return [];
    var sep = lines[0].indexOf("\t") >= 0 ? "\t" : (lines[0].indexOf(",") >= 0 ? "," : null);
    var rows = lines.map(function (l) {
      if (sep === "\t") return l.split("\t");
      if (sep === ",") return l.split(",");
      return [l];
    });
    var hasHeader = headerHits(rows[0]) >= 2;
    var headers = hasHeader ? rows[0] : null;
    var dataRows = hasHeader ? rows.slice(1) : rows;
    return dataRows.map(function (r) { return rowToCourse(r, headers); }).filter(Boolean);
  }
  function ensureXLSX() {
    return new Promise(function (resolve, reject) {
      if (typeof XLSX !== "undefined") { resolve(); return; }
      var s = document.createElement("script");
      s.src = "xlsx.full.min.js";
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("xlsx 解析库加载失败（请检查网络后重试）")); };
      document.head.appendChild(s);
    });
  }
  function parseXLSX(file) {
    return new Promise(function (resolve, reject) {
      if (typeof XLSX === "undefined") { reject(new Error("xlsx 解析库未加载（需联网后重试）")); return; }
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
          var out = [];
          wb.SheetNames.forEach(function (sn) {
            var ws = wb.Sheets[sn];
            var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
            rows = rows.filter(function (r) { return r.some(function (c) { return c != null && String(c).trim() !== ""; }); });
            if (!rows.length) return;
            var hasHeader = headerHits(rows[0]) >= 2;
            var headers = hasHeader ? rows[0] : null;
            var dataRows = hasHeader ? rows.slice(1) : rows;
            dataRows.forEach(function (r) { var c = rowToCourse(r, headers); if (c) out.push(c); });
          });
          resolve(out);
        } catch (err) { reject(err); }
      };
      reader.onerror = function () { reject(new Error("读取文件失败")); };
      reader.readAsArrayBuffer(file);
    });
  }
  function sameCourse(a, b) {
    return normDow(a.dow) === normDow(b.dow) && (a.time || "") === (b.time || "") && (a.name || "") === (b.name || "");
  }
  // 增量合并：保留现有，跳过与现有或本次导入内重复的条目（按 星期+时间+课程名 判定）
  function mergeSchedule(list) {
    var cur = scheduleLoad();
    var added = 0, skipped = 0;
    list.forEach(function (c, idx) {
      if (cur.some(function (x) { return sameCourse(x, c); })) { skipped++; return; }
      if (list.slice(0, idx).some(function (x) { return sameCourse(x, c); })) { skipped++; return; }
      cur.push(c); added++;
    });
    scheduleSave(cur);
    return { added: added, skipped: skipped };
  }
  function scheduleFileChosen(input) {
    var f = input.files && input.files[0];
    if (!f) return;
    var hint = document.getElementById("schedHint");
    var lower = f.name.toLowerCase();
    var done = function (list) {
      if (!list.length) { if (hint) hint.textContent = "没解析出课程，检查表头或内容"; return; }
      var r = mergeSchedule(list);
      if (hint) hint.textContent = "✓ 已导入 " + r.added + " 条" + (r.skipped ? "（" + r.skipped + " 重复已跳过）" : "");
      renderSchedule();
    };
    var fail = function (err) { if (hint) hint.textContent = "导入失败：" + (err && err.message ? err.message : err); };
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      ensureXLSX().then(function () { parseXLSX(f).then(done).catch(fail); }).catch(fail);
    } else {
      var reader = new FileReader();
      reader.onload = function (e) { try { done(parseDelimited(String(e.target.result))); } catch (err) { fail(err); } };
      reader.onerror = function () { fail(new Error("读取文件失败")); };
      reader.readAsText(f, "utf-8");
    }
    input.value = "";
  }
  function importSchedulePaste() {
    var ta = document.getElementById("schedPaste");
    var hint = document.getElementById("schedHint");
    var list = parseDelimited(ta.value || "");
    if (!list.length) { if (hint) hint.textContent = "粘贴内容没解析出课程"; return; }
    var r = mergeSchedule(list);
    if (hint) hint.textContent = "✓ 已导入 " + r.added + " 条（粘贴）" + (r.skipped ? "（" + r.skipped + " 重复已跳过）" : "");
    renderSchedule();
  }
  function addCourse() {
    var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var c = { dow: normDow(g("scDow")), time: g("scTime"), name: g("scName"), location: g("scLoc"), teacher: g("scTeach"), note: g("scNote") };
    if (!c.name && !c.time && !c.dow) { var h = document.getElementById("schedHint"); if (h) h.textContent = "至少填课程名或时间"; return; }
    var list = scheduleLoad(); list.push(c); scheduleSave(list); renderSchedule();
    ["scDow", "scTime", "scName", "scLoc", "scTeach", "scNote"].forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ""; });
  }
  function delCourse(i) {
    var list = scheduleLoad(); list.splice(i, 1); scheduleSave(list); renderSchedule();
  }
  function delAllCourses() {
    if (!scheduleLoad().length) return;
    WB.dialog.confirm("确定清空全部课程表吗？此操作不可撤销。\n（如需换课表，可先清空再导入，或导入会自动跳过重复）", function () {
      scheduleSave([]); renderSchedule();
      var h = document.getElementById("schedHint");
      if (h) h.textContent = "✓ 已清空全部课程";
    });
  }
  window.delAllCourses = delAllCourses;
  function downloadFile(name, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }
  function exportSchedule(fmt) {
    var list = scheduleLoad();
    var hint = document.getElementById("schedHint");
    if (!list.length) { if (hint) hint.textContent = "没有可导出的数据"; return; }
    var fn = "课程表";
    if (fmt === "csv") {
      var head = ["星期", "时间", "课程", "地点", "老师", "备注", "周次", "学分"];
      var rows = list.map(function (c) { return [c.dow || "", c.time || "", c.name || "", c.location || "", c.teacher || "", c.note || "", c.weeks || "", c.credit || ""]; });
      var csv = "﻿" + head.join(",") + "\n" + rows.map(function (r) {
        return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
      }).join("\n");
      downloadFile(fn + ".csv", csv, "text/csv;charset=utf-8");
      if (hint) hint.textContent = "✓ 已导出 CSV";
    } else {
      downloadFile(fn + ".json", JSON.stringify(list, null, 2), "application/json");
      if (hint) hint.textContent = "✓ 已导出 JSON";
    }
  }

  // ============================================================
  //  网格课表渲染（对齐 App schedule_page.dart · 2026-09-18 全量对齐 C）
  //  节次×星期网格 / 夏冬作息 / 10·8·5 节次视图 / 周次筛选 / 当前周
  //  / 课程 HSL 着色 / 今天·当前节高亮 / 搜索高亮 / 今日概览 / 未排期面板
  // ============================================================

  // ---------- 节次表（与 App 同：仰恩大学夏/冬作息，10 节）----------
  var PERIODS_SUMMER = [
    { i: 1, l: "一", s: "08:00", e: "08:45", t: "必修" },
    { i: 2, l: "二", s: "08:55", e: "09:40", t: "必修" },
    { i: 3, l: "三", s: "10:10", e: "10:55", t: "必修" },
    { i: 4, l: "四", s: "11:05", e: "11:50", t: "必修" },
    { i: 5, l: "五", s: "14:30", e: "15:15", t: "必修" },
    { i: 6, l: "六", s: "15:20", e: "16:05", t: "必修" },
    { i: 7, l: "七", s: "16:25", e: "17:10", t: "必修" },
    { i: 8, l: "八", s: "17:15", e: "18:00", t: "必修" },
    { i: 9, l: "九", s: "19:30", e: "20:15", t: "必修" },
    { i: 10, l: "十", s: "20:25", e: "21:10", t: "必修" }
  ];
  var PERIODS_WINTER = [
    { i: 1, l: "一", s: "08:00", e: "08:45", t: "必修" },
    { i: 2, l: "二", s: "08:55", e: "09:40", t: "必修" },
    { i: 3, l: "三", s: "10:10", e: "10:55", t: "必修" },
    { i: 4, l: "四", s: "11:05", e: "11:50", t: "必修" },
    { i: 5, l: "五", s: "14:00", e: "14:45", t: "必修" },
    { i: 6, l: "六", s: "14:50", e: "15:35", t: "必修" },
    { i: 7, l: "七", s: "15:55", e: "16:40", t: "必修" },
    { i: 8, l: "八", s: "16:45", e: "17:30", t: "必修" },
    { i: 9, l: "九", s: "19:00", e: "19:45", t: "必修" },
    { i: 10, l: "十", s: "19:55", e: "20:40", t: "必修" }
  ];
  var CN5 = ["一", "二", "三", "四", "五"];
  function fullPeriods(season) { return season === "夏季" ? PERIODS_SUMMER : PERIODS_WINTER; }
  function mergeToFive(src) {
    var out = [];
    for (var i = 0; i < 5; i++) out.push({ i: i + 1, l: CN5[i], s: src[i * 2].s, e: src[i * 2 + 1].e, t: "大节" });
    return out;
  }
  function viewPeriods(season, mode) {
    var src = fullPeriods(season);
    if (mode === 5) return mergeToFive(src);
    if (mode === 8) return src.slice(0, 8);
    return src;
  }

  // ---------- 周次解析（移植 core.dart）----------
  function normWeeksText(s) {
    if (!s) return "";
    var fw = "０１２３４５６７８９";
    var b = "";
    for (var k = 0; k < s.length; k++) {
      var ch = s[k];
      var di = fw.indexOf(ch);
      if (di >= 0) { b += di; continue; }
      if ("，、；;".indexOf(ch) >= 0) b += ",";
      else if ("－–—〜~～".indexOf(ch) >= 0) b += "-";
      else if (ch === "［") b += "[";
      else if (ch === "］") b += "]";
      else if (ch === "　") b += " ";
      else b += ch;
    }
    return b;
  }
  function parseWeeks(s) {
    s = (s || "").trim();
    if (!s) return { weeks: [], odd: false, even: false };
    var re = /\[([0-9,\-]+)\]周(单|双)?/g;
    var m, set = {}, parity = null;
    while ((m = re.exec(normWeeksText(s)))) {
      var rangeStr = m[1], p = m[2];
      if (p) parity = p;
      rangeStr.split(",").forEach(function (part) {
        if (part.indexOf("-") >= 0) {
          var bits = part.split("-");
          if (bits.length === 2) {
            var a = parseInt(bits[0], 10), b = parseInt(bits[1], 10);
            if (a && b) for (var w = a; w <= b; w++) set[w] = 1;
          }
        } else {
          var w2 = parseInt(part, 10);
          if (w2) set[w2] = 1;
        }
      });
    }
    var weeks = Object.keys(set).map(Number).sort(function (x, y) { return x - y; });
    return { weeks: weeks, odd: parity === "单", even: parity === "双" };
  }
  function courseInWeek(c, week) {
    var s = (c.weeks || "").trim();
    if (!s) return true; // 空 = 全周
    var wp = parseWeeks(s);
    if (!wp.weeks.length) return true;
    if (wp.weeks.indexOf(week) < 0) return false;
    if (wp.odd && week % 2 === 0) return false;
    if (wp.even && week % 2 === 1) return false;
    return true;
  }

  // ---------- 时间 / 节次解析 ----------
  function toMin(t) {
    var m = /(\d{1,2})[:：](\d{2})/.exec(t || "");
    if (!m) return -1;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }
  function indexOfStartIn(start, periods) {
    for (var i = 0; i < periods.length; i++) {
      var ps = toMin(periods[i].s), pe = toMin(periods[i].e);
      if (start >= ps && start < pe) return i;
    }
    return -1;
  }
  // 课程落在「完整 10 小节」里的哪一节（0-based），认不出返回 -1
  function subIndexOf(time, season) {
    time = (time || "").trim();
    var start = toMin(time);
    if (start >= 0) {
      var i = indexOfStartIn(start, fullPeriods(season));
      if (i >= 0) return i;
      var other = season === "夏季" ? PERIODS_WINTER : PERIODS_SUMMER;
      return indexOfStartIn(start, other);
    }
    var m = /^第?\s*(\d+)\s*[-~–]\s*(\d+)\s*节?$|^第?\s*(\d+)\s*节?$/.exec(time);
    if (m) {
      var n = parseInt(m[1] || m[3], 10);
      if (n >= 1 && n <= 10) return n - 1;
    }
    return -1;
  }
  // 小节索引 → 当前视图行索引；-1 = 这一节不在当前视图里（如 8 节视图下的第 9、10 节）
  function rowOf(subIdx, mode) {
    if (subIdx < 0) return -1;
    if (mode === 5) return Math.floor(subIdx / 2);
    if (mode === 8) return subIdx >= 8 ? -1 : subIdx;
    return subIdx;
  }
  function periodIndexOf(time, season, mode) {
    var s = subIndexOf(time, season);
    return s < 0 ? -1 : rowOf(s, mode);
  }
  // 课程在当前视图里跨几行（按时间重叠 or 节次写法）
  function spanInView(time, season, mode) {
    var vp = viewPeriods(season, mode);
    var t = (time || "").trim();
    if (t.indexOf(":") >= 0) {
      var parts = t.split(/[-~–]/);
      if (parts.length < 2) return 1;
      var s = toMin(parts[0]), e = toMin(parts[1]);
      if (s < 0 || e < 0) return 1;
      var n = 0;
      for (var i = 0; i < vp.length; i++) {
        var ps = toMin(vp[i].s), pe = toMin(vp[i].e);
        if (e > ps && s < pe) n++;
      }
      return Math.max(1, Math.min(n, vp.length));
    }
    var m = /^第?\s*(\d+)\s*[-~–]\s*(\d+)\s*节?$|^第?\s*(\d+)\s*节?$/.exec(t);
    if (m) {
      var a = parseInt(m[1] || m[3], 10), b = parseInt(m[2] || m[3], 10);
      if (a && b) {
        var r1 = rowOf(a - 1, mode), r2 = rowOf(b - 1, mode);
        if (r1 >= 0 && r2 >= 0 && r2 >= r1) return Math.max(1, Math.min(r2 - r1 + 1, vp.length));
        if (r1 >= 0) return 1;
      }
    }
    return 1;
  }
  // 显示用时间：按当前季节作息换算钟点（切季后钟点随季变，比存值更准）
  function displayTime(time, season) {
    var fp = fullPeriods(season);
    var s = subIndexOf(time, season);
    if (s < 0) return time || "";
    var t = (time || "").trim();
    var span = 1;
    if (t.indexOf(":") >= 0) {
      var parts = t.split(/[-~–]/);
      if (parts.length >= 2) {
        var ss = toMin(parts[0]), ee = toMin(parts[1]);
        if (ss >= 0 && ee >= 0) {
          var n = 0;
          for (var i = 0; i < fp.length; i++) {
            var ps = toMin(fp[i].s), pe = toMin(fp[i].e);
            if (ee > ps && ss < pe) n++;
          }
          span = Math.max(1, Math.min(n, fp.length));
        }
      }
    } else {
      var m = /^第?\s*(\d+)\s*[-~–]\s*(\d+)\s*节?$|^第?\s*(\d+)\s*节?$/.exec(t);
      if (m) {
        var a = parseInt(m[1] || m[3], 10), b = parseInt(m[2] || m[3], 10);
        if (a && b) span = Math.max(1, Math.min(b - a + 1, fp.length));
      }
    }
    var e = s + span - 1;
    if (e >= fp.length) e = fp.length - 1;
    return fp[s].s + "-" + fp[e].e;
  }

  // ---------- 季节 / 当前周 ----------
  function seasonForDate(d) { return (d.getMonth() + 1 >= 5 && d.getMonth() + 1 <= 9) ? "夏季" : "冬季"; }
  function mondayOf(dt) {
    var x = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    var wd = x.getDay(); // 0=周日
    return new Date(x.getFullYear(), x.getMonth(), x.getDate() - (wd === 0 ? 6 : wd - 1));
  }
  // 按开学日期算「今天是第几周」：开学日所在那一周（周一起算）= 第 1 周
  function currentWeekFromTermStart() {
    var s = (localStorage.getItem("wb_term_start") || "").trim();
    if (!s) return null;
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    if (!m) return null;
    var y = parseInt(m[1], 10), mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
    if (!y || !mo || !d) return null;
    var start;
    try { start = new Date(y, mo - 1, d); } catch (_) { return null; }
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var startMon = mondayOf(start), todayMon = mondayOf(today);
    var diffWeeks = Math.floor((todayMon - startMon) / 86400000 / 7);
    return Math.max(1, Math.min(20, diffWeeks + 1));
  }
  function weekDateRange() {
    if (ST.showAll) return "";
    var ts = (localStorage.getItem("wb_term_start") || "").trim();
    if (!ts) return "";
    var p = ts.split("-");
    if (p.length !== 3) return "";
    var y = parseInt(p[0], 10), mo = parseInt(p[1], 10), d = parseInt(p[2], 10);
    if (!y || !mo || !d) return "";
    var termStart = new Date(y, mo - 1, d);
    var base = mondayOf(termStart);
    var start = new Date(base.getFullYear(), base.getMonth(), base.getDate() + (ST.week - 1) * 7);
    var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    return (start.getMonth() + 1) + "/" + start.getDate() + "–" + (end.getMonth() + 1) + "/" + end.getDate();
  }

  // ---------- 课程着色（按名恒定同色，HSL 低饱和）----------
  function courseColor(key) {
    var h = 0, s = String(key || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    var hue = h % 360;
    return { bg: "hsla(" + hue + ",50%,62%,0.28)", bd: "hsla(" + hue + ",50%,62%,0.55)" };
  }

  // ---------- 显示层清洗（学分提出 / 备注去重，不动数据）----------
  function scheduleCredit(c) {
    if (c.credit && c.credit.trim()) return c.credit.trim();
    var m = (c.note || "").match(/(\d+(?:\.\d+)?)\s*学分/);
    return m ? m[1] + "学分" : "";
  }
  function cleanNote(c) {
    var note = (c.note || "").trim();
    var cr = scheduleCredit(c);
    if (cr) note = note.replace(/(\d+(?:\.\d+)?)\s*学分/g, " ");
    return note.replace(/\s+/g, " ").trim();
  }

  // ---------- 视图状态（持久化）----------
  var ST = { season: "自动", mode: 10, showAll: false, autoWeek: true, week: 1, kw: "", termStart: "" };
  function loadSchedState() {
    ST.season = localStorage.getItem("wb_sched_season") || "自动";
    ST.mode = parseInt(localStorage.getItem("wb_sched_mode"), 10) || 10;
    if ([5, 8, 10].indexOf(ST.mode) < 0) ST.mode = 10;
    ST.showAll = localStorage.getItem("wb_sched_showall") === "1";
    ST.autoWeek = localStorage.getItem("wb_sched_autoweek") !== "0";
    ST.termStart = (localStorage.getItem("wb_term_start") || "").trim();
    var cw = currentWeekFromTermStart();
    if (ST.autoWeek && cw != null) ST.week = cw;
    else {
      var sw = parseInt(localStorage.getItem("wb_sched_week") || "", 10);
      ST.week = (sw >= 1 && sw <= 20) ? sw : (cw != null ? cw : 1);
    }
  }
  function todayKey() {
    var wd = new Date().getDay(); // 0=周日
    var idx = wd === 0 ? 6 : wd - 1;
    return WEEKDAYS[idx];
  }
  function nowIdx(vp) {
    var now = new Date();
    var nm = now.getHours() * 60 + now.getMinutes();
    for (var i = 0; i < vp.length; i++) {
      var ps = toMin(vp[i].s), pe = toMin(vp[i].e);
      if (nm >= ps && nm < pe) return i;
    }
    return -1;
  }

  // ---------- 卡片 / 工具栏 HTML ----------
  function courseCardHtml(c, season) {
    var col = courseColor(c.name || c.dow);
    var kw = (ST.kw || "").toLowerCase();
    var hit = kw && [c.name, c.location, c.teacher, c.note].some(function (s) { return (s || "").toLowerCase().indexOf(kw) >= 0; });
    var credit = scheduleCredit(c);
    var note = cleanNote(c);
    var disp = displayTime(c.time, season);
    var html = '<div class="sc-card' + (hit ? " hit" : "") + '" style="background:' + col.bg + ';border-color:' +
      (hit ? "var(--accent)" : col.bd) + '" onclick="schedEdit(' + c.__i + ')">';
    html += '<div class="scc-name">' + esc(c.name || "未命名") + "</div>";
    if (c.time) html += '<div class="scc-time">' + esc(disp) + "</div>";
    if (c.teacher || c.location) html += '<div class="scc-sub">' + esc([c.teacher, c.location].filter(Boolean).join("·")) + "</div>";
    if (c.weeks && c.weeks.trim()) html += '<div class="scc-week">' + esc(c.weeks.trim()) + "</div>";
    if (credit) html += '<div class="scc-credit">' + esc(credit) + "</div>";
    if (note) html += '<div class="scc-note">' + esc(note) + "</div>";
    html += '<button class="scc-del" title="删除" onclick="event.stopPropagation();schedDel(' + c.__i + ')">✕</button>';
    html += "</div>";
    return html;
  }
  function schedToolbar(season, vp, thisWeekCount, range, showAll) {
    var tk = todayKey();
    var noTerm = !ST.termStart;
    var html = '<div class="sched-toolbar">';
    // 周次组
    html += '<div class="st-group"><span class="st-label">周次</span>';
    html += '<button class="st-btn" onclick="schedSetWeek(-1)"' + (ST.week <= 1 ? " disabled" : "") + ">‹</button>";
    html += '<span class="st-week' + (ST.autoWeek ? " auto" : "") + '">' +
      (ST.showAll ? "全部" : ("第 " + ST.week + " 周" + (range ? (" · " + range) : ""))) + "</span>";
    html += '<button class="st-btn" onclick="schedSetWeek(1)"' + (ST.week >= 20 ? " disabled" : "") + ">›</button>";
    html += '<button class="st-btn" onclick="schedSetToday()"' + (noTerm ? ' disabled style="opacity:.4"' : "") + ">本周</button>";
    if (noTerm) {
      html += '<button class="st-btn on" onclick="schedSetTerm()" title="先设置开学日期才能按周过滤">显示全部（点此设开学日）</button></div>';
    } else {
      html += '<button class="st-btn' + (showAll ? " on" : "") + '" onclick="schedToggleAll()">' +
        (showAll ? "显示本周" : "显示全部") + "</button></div>";
    }
    // 作息组
    html += '<div class="st-group"><span class="st-label">作息</span>';
    ["自动", "夏季", "冬季"].forEach(function (sn) {
      html += '<button class="st-btn' + (ST.season === sn ? " on" : "") + '" onclick="schedSetSeason(\'' + sn + '\')">' + sn + "</button>";
    });
    html += "</div>";
    // 视图组
    html += '<div class="st-group"><span class="st-label">视图</span>';
    [{ v: 10, t: "10节" }, { v: 8, t: "8节" }, { v: 5, t: "5大节" }].forEach(function (o) {
      html += '<button class="st-btn' + (ST.mode === o.v ? " on" : "") + '" onclick="schedSetMode(' + o.v + ')">' + o.t + "</button>";
    });
    html += "</div>";
    // 搜索
    html += '<div class="st-group grow"><input id="schedSearch" class="sf" placeholder="搜索课程/老师/地点/备注" value="' +
      esc(ST.kw) + '" oninput="schedSearch(this.value)"></div>';
    // 开学日期
    html += '<button class="st-btn" onclick="schedSetTerm()" title="设置学期开学日期以自动算当前周">开学日期' +
      (ST.termStart ? "✓" : "") + "</button>";
    html += "</div>";
    return html;
  }
  function todayBanner(tk, season, showAll) {
    if (!tk) return "";
    var dayList = scheduleLoad().filter(function (c) { return normDow(c.dow) === tk && (showAll || courseInWeek(c, ST.week)); });
    var txt;
    if (!dayList.length) {
      txt = "今天（" + tk + "）没课";
    } else {
      var now = new Date();
      var nm = now.getHours() * 60 + now.getMinutes();
      var up = [];
      dayList.forEach(function (c) {
        var s = subIndexOf(c.time, season);
        if (s < 0) return;
        var sm = toMin(fullPeriods(season)[s].s);
        if (sm > nm) up.push([c, sm]);
      });
      up.sort(function (a, b) { return a[1] - b[1]; });
      txt = "今天（" + tk + "）还有 " + dayList.length + " 节";
      if (up.length) {
        var nx = up[0][0];
        txt += " · 下一节 " + (nx.name || "未命名") + " " + fullPeriods(season)[subIndexOf(nx.time, season)].s;
      } else {
        txt += " · 今日课程已结束";
      }
    }
    return '<div class="sched-banner">' + esc(txt) + "</div>";
  }

  // ---------- 主渲染 ----------
  function renderSchedule() {
    var box = document.getElementById("col-schedule");
    if (!box) return;
    loadSchedState();
    var list = scheduleLoad();
    list.forEach(function (c, i) { c.__i = i; });
    var season = ST.season === "自动" ? seasonForDate(new Date()) : ST.season;
    var vp = viewPeriods(season, ST.mode);
    var tk = todayKey();
    var ni = nowIdx(vp);
    // 未设开学日期时默认「显示全部」，避免首屏空网格；设了日期才按周过滤
    var showAll = ST.showAll || !ST.termStart;
    var pass = function (c) { return showAll || courseInWeek(c, ST.week); };

    // 工具栏上方保留：导入 / 手动加一行（原有功能不动）
    var importCard =
      '<div class="card"><h2><span class="ic">' + WB.ic("download") + '</span>导入课程表（CSV / Excel / 粘贴）</h2>' +
      '<div class="sched-imp">' +
      '<label class="sched-file">选择文件<input type="file" accept=".csv,.xlsx,.xls,.txt" onchange="scheduleFileChosen(this)"></label>' +
      '<span class="empty" style="margin:0">或</span>' +
      '<button class="btn-sm" onclick="document.getElementById(&quot;schedPaste&quot;).focus()">粘贴表格</button>' +
      '<button class="btn-sm" onclick="exportSchedule(&quot;csv&quot;)">⬇️ 导出 CSV</button>' +
      '<button class="btn-sm" onclick="exportSchedule(&quot;json&quot;)">⬇️ 导出 JSON</button>' +
      '</div>' +
      '<textarea id="schedPaste" rows="3" class="sched-paste" placeholder="把 Excel/表格里的几行复制粘贴到这里（首行写表头：星期/时间/课程/地点/老师/备注，用制表符或逗号分开），再点“解析粘贴内容”。"></textarea>' +
      '<div style="margin-top:8px;display:flex;gap:8px;align-items:center">' +
      '<button class="btn" onclick="importSchedulePaste()">解析粘贴内容</button>' +
      '<span id="schedHint" class="empty"></span></div>' +
      '<div style="margin-top:9px;display:flex;gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:9px">' +
      '<span class="empty" style="margin:0">云端同步：</span>' +
      '<button class="btn-sm" onclick="schedulePushCloud()">⬆️ 备份到云端</button>' +
      '<button class="btn-sm" onclick="schedulePullCloud(false)">⬇️ 从云端拉取</button>' +
      '<button class="btn-sm" onclick="setGhToken()">Token</button>' +
      '</div></div>';
    var addCard =
      '<div class="card"><h2><span class="ic">➕</span>手动加一行</h2>' +
      '<div class="sched-form">' +
      '<input id="scDow" class="sf" placeholder="星期（如 周一）">' +
      '<input id="scTime" class="sf" placeholder="时间（如 08:00-09:40）">' +
      '<input id="scName" class="sf" placeholder="课程名 *">' +
      '<input id="scLoc" class="sf" placeholder="地点">' +
      '<input id="scTeach" class="sf" placeholder="老师">' +
      '<input id="scNote" class="sf" placeholder="备注">' +
      '</div>' +
      '<div style="margin-top:8px"><button class="btn-sm" onclick="addCourse()">➕ 添加这一行</button></div></div>';

    var range = weekDateRange();
    var thisWeekCount = list.filter(pass).length;
    var toolbar = schedToolbar(season, vp, thisWeekCount, range, showAll);
    var banner = todayBanner(tk, season, showAll);

    // 网格
    var grid = '<div class="sched-grid"><div class="sched-period-col">';
    grid += '<div class="sph">节次</div>';
    for (var r = 0; r < vp.length; r++) {
      var p = vp[r], isNow = (r === ni);
      grid += '<div class="spc' + (isNow ? " now" : "") + '"><div class="spc-l">' + p.l + '</div>' +
        '<div class="spc-t">' + p.s + '</div><div class="spc-t">' + p.e + '</div>' +
        '<div class="spc-tag">' + p.t + "</div></div>";
    }
    grid += "</div>";
    WEEKDAYS.forEach(function (day) {
      var dayCourses = list.filter(function (c) { return normDow(c.dow) === day && pass(c); });
      var byRow = {};
      dayCourses.forEach(function (c) {
        var ri = periodIndexOf(c.time, season, ST.mode);
        if (ri < 0) return;
        (byRow[ri] = byRow[ri] || []).push(c);
      });
      var isToday = (day === tk);
      var dcol = '<div class="sched-day-col' + (isToday ? " is-today" : "") + '"><div class="sdh">' + esc(day) + "</div>" +
        '<div class="sdc" style="height:' + (vp.length * 80) + 'px">';
      for (var rr = 0; rr < vp.length; rr++) {
        dcol += '<div class="sg" style="top:' + (rr * 80) + 'px;height:80px"></div>';
      }
      for (var r2 = 0; r2 < vp.length; r2++) {
        if (!byRow[r2]) {
          dcol += '<div class="sg-add" style="top:' + (r2 * 80) + "px;height:80px\" onclick=\"schedQuickAdd('" + day + "'," + r2 + ')" title="加课">+</div>';
        }
      }
      Object.keys(byRow).forEach(function (rk) {
        var rk2 = parseInt(rk, 10);
        var arr = byRow[rk];
        var h = arr.reduce(function (a, c) { return a + spanInView(c.time, season, ST.mode); }, 0) * 80;
        var inner = "";
        arr.forEach(function (c) { inner += courseCardHtml(c, season); });
        dcol += '<div class="sc-stack" style="top:' + (rk2 * 80) + "px;height:" + h + 'px">' + inner + "</div>";
      });
      dcol += "</div></div>";
      grid += dcol;
    });
    grid += "</div>";

    // 被视图挡掉的课（8 节视图下的 9-10 节）
    var hiddenHtml = "";
    if (ST.mode !== 10) {
      var hidden = list.filter(function (c) {
        if (!pass(c)) return false;
        var s = subIndexOf(c.time, season);
        return s >= 0 && rowOf(s, ST.mode) < 0;
      }).length;
      if (hidden > 0) {
        hiddenHtml = '<div class="sched-hidden">当前 ' + ST.mode + ' 节视图隐藏了 ' + hidden +
          ' 门课（在第 9-10 节），切到 10 节可看全。' +
          '<button class="st-btn" style="margin-left:8px" onclick="schedSetMode(10)">看全</button></div>';
      }
    }

    // 未排期课程（星期/时间认不出）
    var unplaced = list.filter(function (c) {
      if (!pass(c)) return false;
      var d = normDow(c.dow);
      if (!d || WEEKDAYS.indexOf(d) < 0) return true;
      return subIndexOf(c.time, season) < 0;
    });
    var unplacedHtml = "";
    if (unplaced.length) {
      unplacedHtml = '<div class="sched-unplaced"><div class="su-title">⚠️ ' + unplaced.length +
        ' 门课没排进格子（星期/时间认不出），点开可修正</div>';
      unplaced.slice(0, 8).forEach(function (c) {
        unplacedHtml += '<div class="su-item" onclick="schedEdit(' + c.__i + ')"><span>' +
          esc((c.dow || "未填星期") + (c.time ? " " + c.time : "") + " " + (c.name || "未命名")) +
          '</span><span class="su-x">✎</span></div>';
      });
      if (unplaced.length > 8) unplacedHtml += '<div class="su-item" style="color:var(--sub)">…还有 ' + (unplaced.length - 8) + " 门</div>";
      unplacedHtml += "</div>";
    }

    var clearCard = list.length ? '<div class="card sched-clear"><button class="btn-sm danger" onclick="delAllCourses()">清空全部课程</button><span class="empty" style="margin:0">清空不可撤销；重复导入会自动跳过</span></div>' : "";
    var emptyGrid = (!list.length) ? '<div class="card"><h2><span class="ic">' + WB.ic("calendar") + '</span>课程表</h2><div class="empty">还没有课程。用上方导入，或手动加一行，或点网格里的「+」快速加课。</div></div>' : "";

    box.innerHTML = importCard + addCard + (list.length ? (toolbar + banner + grid + hiddenHtml + unplacedHtml) : emptyGrid) + clearCard;

    // 搜索命中：滚动到第一个命中卡片
    if (ST.kw) {
      var hit = box.querySelector(".sc-card.hit");
      if (hit && hit.scrollIntoView) setTimeout(function () { hit.scrollIntoView({ block: "nearest", inline: "center" }); }, 0);
    }
  }

  // ---------- 工具栏交互 ----------
  function schedSetWeek(d) {
    ST.autoWeek = false; localStorage.setItem("wb_sched_autoweek", "0");
    ST.week = Math.max(1, Math.min(20, ST.week + d));
    localStorage.setItem("wb_sched_week", ST.week);
    renderSchedule();
  }
  function schedSetToday() {
    ST.autoWeek = true; localStorage.setItem("wb_sched_autoweek", "1");
    var cw = currentWeekFromTermStart();
    if (cw != null) ST.week = cw;
    renderSchedule();
  }
  function schedToggleAll() {
    ST.showAll = !ST.showAll;
    localStorage.setItem("wb_sched_showall", ST.showAll ? "1" : "0");
    renderSchedule();
  }
  function schedSetSeason(sn) {
    ST.season = sn; localStorage.setItem("wb_sched_season", sn);
    renderSchedule();
  }
  function schedSetMode(m) {
    ST.mode = m; localStorage.setItem("wb_sched_mode", m);
    renderSchedule();
  }
  function schedSearch(v) {
    ST.kw = v; renderSchedule();
  }
  function schedSetTerm() {
    var cur = ST.termStart;
    WB.dialog.prompt("学期开学日期（YYYY-MM-DD，用于自动算当前周）", cur, function (v) {
      if (v === null) return;
      localStorage.setItem("wb_term_start", (v || "").trim());
      ST.termStart = (v || "").trim();
      if (ST.autoWeek) { var cw = currentWeekFromTermStart(); if (cw != null) ST.week = cw; }
      renderSchedule();
    }, null, "留空则按手动周次");
  }

  // ---------- 编辑 / 新增弹窗 ----------
  var EDIT_I = -1;
  function seField(id, ph) { return '<input id="' + id + '" class="sf" placeholder="' + ph + '">'; }
  function seSet(id, v) { var el = document.getElementById(id); if (el) el.value = v; }
  function seGet(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function schedEdit(i, preset) {
    var list = scheduleLoad();
    var c = (i >= 0) ? (list[i] || {}) : (preset || { dow: "", time: "", name: "", location: "", teacher: "", note: "", weeks: "", credit: "" });
    EDIT_I = i;
    var mask = document.getElementById("schedEditMask");
    if (!mask) {
      mask = document.createElement("div");
      mask.id = "schedEditMask";
      mask.className = "sched-edit-mask";
      mask.innerHTML =
        '<div class="sched-edit"><div class="se-h">编辑课程</div>' +
        '<div class="se-grid">' +
        seField("se_dow", "星期（如 周一）") + seField("se_time", "时间(08:00-09:40 或 第1-2节)") +
        seField("se_name", "课程名 *") + seField("se_loc", "地点") +
        seField("se_teach", "老师") + seField("se_weeks", "周次(如 [2-11]周双)") +
        seField("se_credit", "学分") +
        '</div>' +
        '<textarea id="se_note" class="sched-paste" rows="2" placeholder="备注"></textarea>' +
        '<div class="se-actions"><button class="btn-sm" onclick="schedEditSave()">保存</button>' +
        '<button class="btn-sm" onclick="schedEditClose()">取消</button></div></div>';
      document.body.appendChild(mask);
      mask.addEventListener("click", function (e) { if (e.target === mask) schedEditClose(); });
    }
    seSet("se_dow", c.dow || "");
    seSet("se_time", c.time || "");
    seSet("se_name", c.name || "");
    seSet("se_loc", c.location || "");
    seSet("se_teach", c.teacher || "");
    seSet("se_weeks", c.weeks || "");
    seSet("se_credit", c.credit || "");
    seSet("se_note", c.note || "");
    mask.style.display = "flex";
  }
  function schedEditSave() {
    var list = scheduleLoad();
    var c = {
      dow: normDow(seGet("se_dow")) || seGet("se_dow"),
      time: seGet("se_time"),
      name: seGet("se_name"),
      location: seGet("se_loc"),
      teacher: seGet("se_teach"),
      weeks: seGet("se_weeks"),
      credit: seGet("se_credit"),
      note: seGet("se_note")
    };
    if (!c.name && !c.time && !c.dow) {
      var h = document.getElementById("schedHint");
      if (h) h.textContent = "至少填课程名或时间";
      return;
    }
    if (EDIT_I >= 0) list[EDIT_I] = c;
    else list.push(c);
    scheduleSave(list);
    schedEditClose();
    renderSchedule();
  }
  function schedEditClose() {
    var mask = document.getElementById("schedEditMask");
    if (mask) mask.style.display = "none";
  }
  function schedQuickAdd(day, r) {
    loadSchedState();
    var season = ST.season === "自动" ? seasonForDate(new Date()) : ST.season;
    var vp = viewPeriods(season, ST.mode);
    var p = vp[r];
    if (!p) return;
    var time = (ST.mode === 5) ? ("第" + p.i + "节") : (p.s + "-" + p.e);
    schedEdit(-1, { dow: day, time: time, name: "", location: "", teacher: "", note: "", weeks: "", credit: "" });
  }

  // ---------- 导出全局 ----------
  window.renderSchedule = renderSchedule;
  window.scheduleFileChosen = scheduleFileChosen;
  window.importSchedulePaste = importSchedulePaste;
  window.addCourse = addCourse;
  window.schedDel = delCourse;
  window.delCourse = delCourse;
  window.exportSchedule = exportSchedule;
  window.ghToken = ghToken;
  window.scheduleLoad = scheduleLoad;
  window.GH_REPO = GH_REPO;
  window.schedSetWeek = schedSetWeek;
  window.schedSetToday = schedSetToday;
  window.schedToggleAll = schedToggleAll;
  window.schedSetSeason = schedSetSeason;
  window.schedSetMode = schedSetMode;
  window.schedSearch = schedSearch;
  window.schedSetTerm = schedSetTerm;
  window.schedEdit = schedEdit;
  window.schedEditSave = schedEditSave;
  window.schedEditClose = schedEditClose;
  window.schedQuickAdd = schedQuickAdd;
})();
