# 草诀歌 AI Labs 会议白板

以产品为笔，和世界对话。

实时协同的会议提问场：落便签、投票、标记已答、分享链接、历史快照（有改动时每 15 分钟自动存档）。

视觉遵循仓库内 [`DESIGN.md`](./DESIGN.md)（[`设计规范.md`](./设计规范.md) 留作历史记录）。

## 两套皮肤

默认是现有的草诀歌风格；顶栏的开关可以切到「硬派」——酸绿、粗黑框、硬投影。选择记在本机，不随会议间同步，同一块板上两个人可以看到不同皮肤。

## 两个页面

| 地址 | 是什么 |
|---|---|
| `/` | 落地页。讲清白板是什么，同时是会议间入口 |
| `/?room=<会议间名称>` | 那一间的白板 |

## 会议间

- 主会议间是 **`草诀歌 AI Labs`**，闭门会与共创会都落在这里，链接长期有效。
- 需要单独开一场时，在落地页取个名字即可另开一间：便签、投票与历史都只属于那一间。
- 旧名 `共创会` 与少空格写法 `草诀歌AI Labs` 会自动归到主会议间；主会议间第一次被打开时，会把旧的便签与历史整体认领过来，老链接不失效。

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 生产构建

```bash
npm run build
```

静态资源输出到 `dist/`；Cloudflare Pages Functions 位于 `functions/`，数据落在 KV。

## 线上地址

- **https://baiban.caojuege.com**
- 备用：https://caojuege-meeting-board.pages.dev

## 部署（Cloudflare Pages）

Pages 项目已连 Git：推送到 `main` 由 Cloudflare 自己拉代码、构建、发布到 Production，不需要 GitHub Actions，也不需要配任何仓库 Secret。构建产物目录见 `wrangler.toml` 的 `pages_build_output_dir`。

部署记录：Cloudflare Dashboard → Workers 和 Pages → `caojuege-meeting-board` → 部署。

`package.json` 里的 `npm run deploy`（wrangler 直传）不是当前的部署路径，线上每一个版本都来自上面这条 Git 链路。

DNS（`caojuege.com` zone）：

| 类型 | 名称 | 目标 | 代理 |
|---|---|---|---|
| CNAME | `baiban` | `caojuege-meeting-board.pages.dev` | 已代理 |

KV 绑定名：`BOARD_KV`（见 `wrangler.toml`）。

## 技术栈

- React + Vite + Tailwind
- 本地：Express + `.data/` JSON
- 线上：Cloudflare Pages + Functions + KV
