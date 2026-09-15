# workbench-app · 网页版（自动发布，请勿手改）

这个仓库是 [personal-workbench](https://github.com/W-lik721/personal-workbench)
里网页版的**公开发布副本**，由 `publish_site.py` 按白名单自动推送，请不要直接在这里改文件
（下次发布会覆盖）。

## 它是什么

个人工作台的网页版（PWA，可「添加到主屏幕」）：

    https://w-lik721.github.io/workbench-app/

## 为什么单独开一个公开仓

源码仓是**私有**的，而 GitHub Free 的 Pages 只支持公开仓；同时源码仓根目录里放着
后端数据文件。把「站点」和「数据」分开，才能既免费、又不把个人数据挂上公网：

| 内容 | 放哪 | 公开吗 |
|---|---|---|
| 页面静态资源（HTML/CSS/JS/图标） | 本仓 | 公开 |
| `data.json`（工作台数据） | 私有仓 | 私有，浏览器带 Token 走 API 取 |
| `schedule.json`（课程表） | 私有仓 | 同上 |
| `app-data.json`（App 云备份） | 私有仓 | 同上，**从不发布** |

## 首次打开

页面需要你自己的 GitHub Token（只需 `repo` 权限）才能读到数据。
Token 只保存在你本机浏览器的 localStorage 里，不会上传到任何地方。

## 相关文件

- 发布脚本：`publish_site.py`（在私有仓里）
- 发布工作流：`.github/workflows/publish-site.yml`（在私有仓里）
