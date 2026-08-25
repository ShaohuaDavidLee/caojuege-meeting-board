# 草诀歌 AI Labs 会议白板 · 架构

> 以产品为笔，和世界对话。视觉真相源：`设计规范.md`。

## 树

```
草诀歌会议问题白板/
├── 设计规范.md
├── ARCHITECTURE.md
├── README.md
├── wrangler.toml
├── index.html
├── server.ts                     # 本地 Express（.data/ JSON）
├── public/
│   ├── _redirects
│   └── board-preview.png         # 落地页用的白板截图
├── functions/
│   ├── _lib/board.ts             # KV 读写 + 默认板 + 历史裁剪
│   └── api/[[path]].ts           # 线上 /api/*
└── src/
    ├── main.tsx
    ├── App.tsx                   # 路由层：有没有 ?room= 决定进哪一页
    ├── index.css
    ├── types.ts
    ├── constants.ts
    ├── pages/
    │   ├── Landing.tsx           # 落地页 + 会议间入口
    │   └── Board.tsx             # 白板组装层：hooks + 视图接线
    ├── api/
    │   └── boardApi.ts           # 前端 HTTP 客户端
    ├── utils/
    │   ├── boardHelpers.ts       # 名称归一 / 默认态判断 / 网格对齐 / 分享链
    │   └── recentRooms.ts        # 本机去过的会议间
    ├── hooks/
    │   ├── useToast.ts           # 轻提示
    │   ├── useRoute.ts           # 读写 ?room=，旧名归一
    │   ├── useBoardSession.ts    # notes / 标题 / 用户 / 轮询
    │   ├── useNoteActions.ts     # 便签增删改 / 投票 / 对齐
    │   ├── useBoardHistory.ts    # 手动 + 自动归档
    │   └── useCanvasGestures.ts  # 平移 / 缩放 / 拖拽
    └── components/
        ├── Modals.tsx            # 署名 / 提问 / 删除 / 历史浮层
        └── board/
            ├── Toast.tsx
            ├── BoardNav.tsx
            ├── BoardCanvas.tsx
            ├── StickyNoteCard.tsx
            └── BoardSidebar.tsx
```

## 路由

只有两页，靠 URL 上有没有 `?room=` 分：

```
/                       → Landing   落地页 + 会议间入口
/?room=<会议间名称>      → Board     那一间的白板
```

`useRoute` 负责读写这个参数：进来先把旧名归一成正名（`共创会` / `草诀歌AI Labs` → `草诀歌 AI Labs`），
再 pushState 切页，`App` 用 `key={room}` 让换间时整块白板重挂载。

## 双运行时

| 环境 | 前端 | API | 持久化 |
|---|---|---|---|
| 本地 `npm run dev` | Vite middleware | Express `server.ts` | `.data/*.json` |
| 线上 Cloudflare | Pages 静态 `dist/` | Pages Functions | KV `BOARD_KV` |

API 路径形状一致，前端无分支。

## 依赖方向

```
App ──► useRoute ──► ?room=
 ├─ Landing（无 room）──► 进主会议间 / 另开一间 / 最近去过
 └─ Board（有 room）
     ├─ useToast
     ├─ useBoardSession ──► notes 真相源 / 轮询
     ├─ useNoteActions  ──► 写 notes（经 setNotes）
     ├─ useBoardHistory ──► 读 lastWriteTimeRef
     ├─ useCanvasGestures ──► 拖拽落点同步
     └─ components/board/* + Modals
             │
             └──► api/boardApi ──► /api/board/:room...
```

浏览器 → `/api/board/:room...`
- 本地 → Express → `.data/`
- 线上 → Functions → `BOARD_KV`

## 会议间与归档

- 主会议间 `草诀歌 AI Labs`（`DEFAULT_ROOM`）：社区自己的场子，链接长期有效。
- 需要单独一场时可在落地页另开一间：名称即地址，便签 / 投票 / 历史按间隔离。
- 名称归一：`LEGACY_ROOM_ALIASES` 里的旧写法进来即换成正名，老链接不失效。
- 主会议间迁移：`loadRoom` 发现主键还空、旧键有内容时，把便签与历史整体认领过来（KV 与本地 `.data/` 两边都做）。
- 历史：有本地写入后每 15 分钟自动存档；手动打包仍保留；每间最多 20 份。

## 变更日志

- 2026-08-25：首屏改左文右图，白板截图进 hero，去掉「白板长什么样？」一节与「草」水印；修掉全仓 38 处以 `--fs-` 变量做字号的 arbitrary value 写法——Tailwind 把它当颜色处理，既没设上字号又把文字色重置成继承色，深色按钮上文字变近黑。

- 2026-08-25：落地页改版：主标语换成「在白板上共享自由交流和思想碰撞」，加白板截图一节，去掉「社区相信什么」「社区里现在有谁」，全站「房」改称「会议间」，另开一间不再强调。
- 2026-08-25：加落地页；主会议间从「共创会」改名「草诀歌 AI Labs」，可另开会议间；组件类收进 `@layer components`，Tailwind 工具类才盖得住。
- 2026-08-05：再拆 `useNoteActions`；会话与便签动作解耦。
- 2026-08-05：拆分 `App.tsx` → hooks / api / board 组件；组装层只接线。
- 2026-08-05：固定默认房「共创会」；有改动时 15 分钟自动存档；去掉雅间切换。
- 2026-08-05：定名「草诀歌 AI Labs 会议白板」；接入 Cloudflare Pages + KV。
- 2026-07-31：按《设计规范》重做 UI。
