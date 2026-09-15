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
    s = String(s).trim();
    var cn = { "一": "周一", "二": "周二", "三": "周三", "四": "周四", "五": "周五", "六": "周六", "日": "周日", "天": "周日" };
    for (var k in cn) { if (s.indexOf(k) >= 0) return cn[k]; }
    var low = s.toLowerCase();
    var en = { "mon": "周一", "tue": "周二", "wed": "周三", "thu": "周四", "fri": "周五", "sat": "周六", "sun": "周日" };
    for (var e in en) { if (low.indexOf(e) === 0) return en[e]; }
    if (/^[1-7]$/.test(s)) return WEEKDAYS[parseInt(s, 10) - 1];
    return s;
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
      var head = ["星期", "时间", "课程", "地点", "老师", "备注"];
      var rows = list.map(function (c) { return [c.dow || "", c.time || "", c.name || "", c.location || "", c.teacher || "", c.note || ""]; });
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
  function renderSchedule() {
    var box = document.getElementById("col-schedule");
    if (!box) return;
    var list = scheduleLoad();
    var byDay = {}; WEEKDAYS.concat(["其他"]).forEach(function (d) { byDay[d] = []; });
    list.forEach(function (c, idx) {
      var d = WEEKDAYS.indexOf(c.dow) >= 0 ? c.dow : "其他";
      c.__i = idx; byDay[d].push(c);
    });
    Object.keys(byDay).forEach(function (d) {
      byDay[d].sort(function (a, b) { return (a.time || "").localeCompare(b.time || ""); });
    });
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
    var tableCard;
    if (!list.length) {
      tableCard = '<div class="card"><h2><span class="ic">' + WB.ic("calendar") + '</span>课程表</h2><div class="empty">还没有课程。用上方导入，或手动加一行。</div></div>';
    } else {
      var body = "";
      WEEKDAYS.concat(["其他"]).forEach(function (d) {
        var arr = byDay[d]; if (!arr.length) return;
        body += '<div class="sched-day"><div class="sched-day-h">' + esc(d) + ' <span class="cc">' + arr.length + '</span></div>';
        arr.forEach(function (c) {
          body += '<div class="sched-row">' +
            '<div class="sr-time">' + esc(c.time || "-") + '</div>' +
            '<div class="sr-main"><b>' + esc(c.name || "未命名") + '</b>' +
            (c.location ? '<span class="sr-loc">' + esc(c.location) + '</span>' : '') +
            (c.teacher ? '<span class="sr-teach">' + esc(c.teacher) + '</span>' : '') +
            (c.note ? '<span class="sr-note">' + esc(c.note) + '</span>' : '') + '</div>' +
            '<button class="nd" onclick="delCourse(' + c.__i + ')">✕</button>' +
            '</div>';
        });
        body += '</div>';
      });
      tableCard = '<div class="card"><h2><span class="ic">' + WB.ic("calendar") + '</span>我的课程表 · 共 ' + list.length + ' 节</h2>' + body + '</div>';
    }
    var clearCard = list.length ? '<div class="card sched-clear"><button class="btn-sm danger" onclick="delAllCourses()">清空全部课程</button><span class="empty" style="margin:0">清空不可撤销；重复导入会自动跳过</span></div>' : "";
    box.innerHTML = importCard + addCard + clearCard + tableCard;
  }
  window.renderSchedule = renderSchedule;
  window.scheduleFileChosen = scheduleFileChosen;
  window.importSchedulePaste = importSchedulePaste;
  window.addCourse = addCourse;
  window.delCourse = delCourse;
  window.exportSchedule = exportSchedule;
  window.ghToken = ghToken;
  window.scheduleLoad = scheduleLoad;
  window.GH_REPO = GH_REPO;
})();
