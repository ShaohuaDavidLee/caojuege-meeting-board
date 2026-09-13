# 兰亭白板 · 架构

> 以产品为笔，和世界对话。视觉真相源：`DESIGN.md`（`设计规范.md` 为历史记录）。

## 树

```
兰亭白板/
├── DESIGN.md                     # 设计语言 + 皮肤层（classic / hard）
├── 设计规范.md                    # 历史记录
├── ARCHITECTURE.md
├── README.md
├── wrangler.toml
├── index.html
├── server.ts                     # 本地 Express（.data/ JSON）
├── public/
│   ├── _redirects
│   └── board-preview.png         # 落地页用的白板截图
├── functions/
│   ├── _middleware.ts            # 爬虫 OG：按域名 / 会议间换分享卡片
│   ├── _lib/schema.sql           # D1 表结构（便签一行一条）
│   ├── _lib/board.ts             # D1 读写 + KV 认领旧板 + 历史裁剪
│   └── api/[[path]].ts           # 线上 /api/*
└── src/
    ├── main.tsx
    ├── brand.ts                  # 兰亭白板 / Faith 两套名字，随皮肤走
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
    │   ├── useTheme.tsx          # 皮肤：classic / hard / faith；asone.ing 默认礼仪
    │   ├── useToast.ts           # 轻提示
    │   ├── useRoute.ts           # 读写 ?room=；asone.ing 裸访问进 Faith 会议室
    │   ├── useBoardSession.ts    # notes / 标题 / 用户 / 轮询
    │   ├── useNoteActions.ts     # 便签增删改 / 投票 / 对齐
    │   ├── useBoardHistory.ts    # 手动 + 自动归档
    │   └── useCanvasGestures.ts  # 平移 / 缩放 / 拖拽
    └── components/
        ├── ThemeToggle.tsx       # 皮肤开关（落地页顶栏 + 白板顶栏共用）
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
| 线上 Cloudflare | Pages 静态 `dist/` | Pages Functions | D1 `BOARD_DB`（热状态）；KV `BOARD_KV`（首次打开时认领旧整板） |

API 路径形状一致，前端无分支。

线上不再把整板当一个 KV value 覆盖。改一张便签只 UPDATE 那一行；同便签后写覆盖（允许这一点误差），不同便签互不影响。客户端仍 1.5 秒轮询一次，D1 读你的写立刻可见。

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

浏览器 → `/api/board/:room...`（`Cache-Control: no-store`，前端 `cache: 'no-store'`）
- 本地 → Express → `.data/`
- 线上 → Functions → D1 便签行；空房才回头读 KV 认领

## 白标域名

同一份前端，认主机名不认参数：

| 入口 | 裸访问 | 默认皮肤 |
|---|---|---|
| `baiban.asone.ing` | 直接进「Faith 会议室」 | 礼仪（faith） |
| `baiban.caojuege.com` | 落地页 | 现在（classic） |

主题仍可手动切换，记在本机，不进数据库。

## 会议间与归档

- 主会议间 `草诀歌 AI Labs`（`DEFAULT_ROOM`）：社区自己的场子，链接长期有效。
- 需要单独一场时可在落地页另开一间：名称即地址，便签 / 投票 / 历史按间隔离。
- 名称归一：`LEGACY_ROOM_ALIASES` 里的旧写法进来即换成正名，老链接不失效。
- 主会议间迁移：D1 还空时，`loadRoom` 从 KV（含旧房名）把便签与历史认领进 D1；本地 Express 仍从 `.data/` 认领。
- 历史：有本地写入后每 15 分钟自动存档；手动打包仍保留；每间最多 20 份。

## 皮肤

两套皮肤跑**同一份 DOM**，差异全在 CSS 变量里：

| | classic（默认） | hard（硬派） |
|---|---|---|
| 落地页底 / 画布底 | `#E5E5E5` / 同 | `#CCF224` / `#EAF2C8` |
| 结构边框 `--bw` | 1px 发丝线 | 4px 纯黑 |
| 投影 `--sh` | 无 | `8px 8px 0` 硬投影 |
| 强调色 | 主按钮色兼任 | 洋红 `#FF2E7E` + 青 `#35D6F0` |

- 切换只改根元素的 `data-theme`，不重挂载组件、不发请求。
- 存 `localStorage`，**不进 KV**：主题是每人的外观偏好，不是会议间的属性。
- `index.html` 里有一小段前置脚本，在 React 挂载前就把 `data-theme` 打上，硬派用户不会先闪一帧 classic。
- 硬派的等宽标签字体按需加载，classic 用户不付这个流量。
- 数值与取舍的依据见 `DESIGN.md`。

## 变更日志

- 2026-09-13：定名「兰亭白板」（Lanting Board）。产品 = 兰亭白板，出品方 = 草诀歌 AI Labs，主会议间仍叫「草诀歌 AI Labs」——兰亭白板是场地，草诀歌是在里面开会的那群人，三个名字各有各的位置。名字里留着「白板」是取舍：兰亭要讲典故才立得住，白板零解释；代价是品类词不精确，靠文案补。`brand.ts` 因此多了 `vendorName` / `vendorLine`：页脚那句「面向非技术创作者的中文 vibe coding 社区」说的是出品方而不是产品，之前借 `brandName` 用会串味；导航左上角的名字也收进 `brand.ts`。主会议间房名、`DEFAULT_BOARD_TITLE`、`THEME_STORAGE_KEY` 等键一律没动——房名是 D1 的数据键，改了现存便签全丢；标题若要改，旧值必须补进 `LEGACY_TITLES`，否则 `isDefaultBoardState()` 会把线上挂着旧标题的板当成「已改动」。域名 `baiban.*` 不撤，`lanting.*` 待加。
- 2026-09-11：线上热状态从 KV 整板覆盖改到 D1 按便签写入。KV 最终一致会让轮询空转约一分钟，两人改不同便签还会互相盖掉；D1 后轮询才能真的秒级看见。同便签后写覆盖仍可接受。白标分流不动：`asone.ing` 默认 Faith / 礼仪，草诀歌入口默认 classic。
- 2026-09-01：新增「硬派」皮肤，可在落地页与白板顶栏切换，默认仍是现有风格。`index.css` 抽出皮肤层 token（`--bw` / `--sh` / `--c-canvas` / `--c-accent` / `--font-util`），classic 取值等于现状、渲染不变；筛选按钮的配色从 JSX 收进 `.seg` 语义类。白板画布底色与落地页分开——原话「会议室背景太绿了」。

- 2026-08-25：首屏改左文右图，白板截图进 hero，去掉「白板长什么样？」一节与「草」水印；修掉全仓 38 处以 `--fs-` 变量做字号的 arbitrary value 写法——Tailwind 把它当颜色处理，既没设上字号又把文字色重置成继承色，深色按钮上文字变近黑。

- 2026-08-25：落地页改版：主标语换成「在白板上共享自由交流和思想碰撞」，加白板截图一节，去掉「社区相信什么」「社区里现在有谁」，全站「房」改称「会议间」，另开一间不再强调。
- 2026-08-25：加落地页；主会议间从「共创会」改名「草诀歌 AI Labs」，可另开会议间；组件类收进 `@layer components`，Tailwind 工具类才盖得住。
- 2026-08-05：再拆 `useNoteActions`；会话与便签动作解耦。
- 2026-08-05：拆分 `App.tsx` → hooks / api / board 组件；组装层只接线。
- 2026-08-05：固定默认房「共创会」；有改动时 15 分钟自动存档；去掉雅间切换。
- 2026-08-05：定名「草诀歌 AI Labs 会议白板」；接入 Cloudflare Pages + KV。
- 2026-07-31：按《设计规范》重做 UI。
