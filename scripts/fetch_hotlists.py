#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GitHub Actions 云端热榜抓取：百度实时热搜 + 哔哩哔哩热门。
在仓库根目录下运行：python scripts/fetch_hotlists.py，写出根目录 hotlists.json。
"""
import json, re, html, datetime
from curl_cffi import requests

TO = 15


def fetch_bili():
    r = requests.get("https://api.bilibili.com/x/web-interface/popular?ps=25&pn=1",
                     impersonate="chrome", timeout=TO)
    out = []
    for it in (r.json().get("data") or {}).get("list") or []:
        t = (it.get("title") or "").strip()
        if t:
            out.append({"t": t, "h": it.get("owner", {}).get("name", "")})
    return out


def fetch_baidu():
    r = requests.get("https://top.baidu.com/board?tab=realtime",
                     impersonate="chrome", timeout=TO)
    m = re.search(r"<!--s-data:(.*?)-->", r.text, re.S)
    if not m:
        return []
    doc = json.loads(html.unescape(m.group(1)))
    out = []
    for card in (doc.get("data") or {}).get("cards") or []:
        for it in (card.get("content") or []):
            w = (it.get("word") or "").strip()
            if w:
                out.append({"t": w, "h": str(it.get("hotScore") or "")})
            if len(out) >= 25:
                return out
    return out


def fmt(x):
    try:
        v = int(x)
    except (TypeError, ValueError):
        return ""
    return f"{v/10000:.1f}万" if v >= 10000 else str(v)


def main():
    sources = {}
    for name, fn in [("baidu", fetch_baidu), ("bilibili", fetch_bili)]:
        try:
            lst = fn()
            for it in lst:
                it["h"] = fmt(it.get("h"))
            sources[name] = lst
        except Exception as e:
            print(f"[skip] {name}: {type(e).__name__}: {e}")
            sources[name] = []

    now = datetime.datetime.now().astimezone()
    data = {"fetched_at": now.strftime("%Y-%m-%d %H:%M:%S"),
            "ts": int(now.timestamp()), "sources": sources}
    with open("hotlists.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    for k, v in sources.items():
        print(f"{k}: {len(v)} 条")


if __name__ == "__main__":
    main()