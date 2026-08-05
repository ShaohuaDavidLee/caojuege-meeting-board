# 草诀歌 AI Labs 会议白板 · 架构

> 以产品为笔，和世界对话。视觉真相源：`设计规范.md`。

## 树

```
草诀歌会议问题白板/
├── 设计规范.md
├── ARCHITECTURE.md
├── README.md
├── wrangler.toml              # Cloudflare Pages + KV 绑定
├── index.html
├── server.ts                  # 本地 Express（.data/ JSON）
├── public/_redirects          # SPA 回退；API 放行
├── functions/
│   ├── _lib/board.ts          # KV 读写 + 默认板
│   └── api/[[path]].ts        # 线上 /api/* 
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts
    ├── constants.ts
    └── components/Modals.tsx
```

## 双运行时

| 环境 | 前端 | API | 持久化 |
|---|---|---|---|
| 本地 `npm run dev` | Vite middleware | Express `server.ts` | `.data/*.json` |
| 线上 Cloudflare | Pages 静态 `dist/` | Pages Functions | KV `BOARD_KV` |

API 路径形状两端，前端无分支。

## 依赖方向

```
浏览器 → /api/board/:room...
           ├─ 本地 → Express → .data/
           └─ 线上 → Functions → BOARD_KV
```

## 房间与归档

- 全场固定房间 `共创会`（`DEFAULT_ROOM`），不再随机开房 / 切换雅间。
- 历史：有本地写入后每 15 分钟自动存档；手动打包仍保留；每房最多 20 份。

## 变更日志

- 2026-08-05：固定默认房「共创会」；有改动时 15 分钟自动存档；去掉雅间切换。
- 2026-08-05：定名「草诀歌 AI Labs 会议白板」；接入 Cloudflare Pages + KV；准备 GitHub 联动。
- 2026-07-31：按《设计规范》重做 UI。
