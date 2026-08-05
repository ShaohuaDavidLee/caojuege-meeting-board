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

## 部署（Cloudflare Pages）

1. 推送到 GitHub 后，在 Cloudflare Dashboard 连接该仓库  
2. Build command：`npm run build`  
3. Build output directory：`dist`  
4. 绑定 KV namespace：`BOARD_KV`  
5. 或使用 CLI：

```bash
npm run deploy
```

## 技术栈

- React + Vite + Tailwind
- 本地：Express + `.data/` JSON
- 线上：Cloudflare Pages + Functions + KV
