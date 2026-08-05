# 草诀歌 AI Labs 会议白板

以产品为笔，和世界对话。

实时协同的会议提问场：落便签、投票、标记已答、雅间分享、历史快照。

视觉遵循仓库内 [`设计规范.md`](./设计规范.md)。

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

推送到 `main` 将由 GitHub Actions 自动部署（需仓库 Secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`）。

本地手动：

```bash
npm run deploy
```

DNS（`caojuege.com` zone）：

| 类型 | 名称 | 目标 | 代理 |
|---|---|---|---|
| CNAME | `baiban` | `caojuege-meeting-board.pages.dev` | 已代理 |

KV 绑定名：`BOARD_KV`（见 `wrangler.toml`）。

## 技术栈

- React + Vite + Tailwind
- 本地：Express + `.data/` JSON
- 线上：Cloudflare Pages + Functions + KV
