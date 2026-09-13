# 兰亭白板

以产品为笔，和世界对话。

实时协同的会议白板：落便签、投票、标记已答、分享链接、历史快照（有改动时每 15 分钟自动存档）。

视觉遵循仓库内 [`DESIGN.md`](./DESIGN.md)（[`设计规范.md`](./设计规范.md) 留作历史记录）。

## 名字

| 名字 | 是什么 | 改不改得动 |
|---|---|---|
| **兰亭白板**（Lanting Board） | 产品名 | 改要同步 `src/brand.ts` |
| **草诀歌 AI Labs** | 出品方 | 同上 |
| `草诀歌 AI Labs` | 主会议间的房名 | **不能改**，见下 |

永和九年，四十二个人坐在曲水边，各写各的，散场合成一册《兰亭集》——多人同场、各自发声、散会带走一份合集，这正是这块板在做的事。草诀歌本身是一部草书歌诀，根在书法；兰亭是书法史的圣地，同源。

名字里留着「白板」是一次明确的取舍：「兰亭」两个字要讲一段典故才立得住，「白板」两个字让第一次看到的人零解释就知道这是什么。代价是这个品类词并不精确——这里没有自由画布，有的是提问、投票、标记已答，和一份能带走的清单。介绍时用「开一个链接，所有人一起写」把差异补上，别让人进来先找画笔。

「兰亭白板」是场地，「草诀歌 AI Labs」是在里面开会的那群人——所以产品改名时，主会议间的房名没有跟着改，而且不该跟着改。

两个数据陷阱，改名前先看：

- `DEFAULT_ROOM`（`src/constants.ts`、`server.ts`、`functions/_lib/board.ts`、`functions/_middleware.ts` 各一份）是 D1 的数据键，便签按房名落行。改这个字符串等于把现存便签全丢了。
- `LEGACY_TITLES`（`src/constants.ts`）：`isDefaultBoardState()` 靠标题判断一块板还没被人动过。每改一次 `DEFAULT_BOARD_TITLE`，旧值都必须补进 `LEGACY_TITLES`，否则线上所有还挂着旧标题的板会被当成「已改动」。

## 两套皮肤

默认是现有的草诀歌风格；顶栏的开关可以切到「硬派」——酸绿、粗黑框、硬投影。选择记在本机，不随会议间同步，同一块板上两个人可以看到不同皮肤。

## 两个页面

| 地址 | 是什么 |
|---|---|
| `/` | 落地页。讲清兰亭白板是什么，同时是会议间入口 |
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

静态资源输出到 `dist/`；Cloudflare Pages Functions 位于 `functions/`。线上热状态落在 D1（一张便签一行）；KV 只在某间第一次被打开时把旧整板认领过来。

## 线上地址

- **https://baiban.caojuege.com** — 草诀歌入口，首屏落地页，默认 classic
  - 改名后建议加 `lanting.caojuege.com` 指向同一个 Pages 项目；`baiban.*` 一直留着不撤。
    老链接不失效是这个仓库一贯的做法（见会议间旧名归一），域名也照办。DNS 见下表。
- **https://baiban.asone.ing** — Faith 白标，裸访问进「Faith 会议室」，默认礼仪皮
- 备用：https://caojuege-meeting-board.pages.dev

## 部署（Cloudflare Pages）

Pages 项目已连 Git：推送到 `main` 由 Cloudflare 自己拉代码、构建、发布到 Production，不需要 GitHub Actions，也不需要配任何仓库 Secret。构建产物目录见 `wrangler.toml` 的 `pages_build_output_dir`。

部署记录：Cloudflare Dashboard → Workers 和 Pages → `caojuege-meeting-board` → 部署。

`package.json` 里的 `npm run deploy`（wrangler 直传）不是当前的部署路径，线上每一个版本都来自上面这条 Git 链路。

DNS（`caojuege.com` zone）：

| 类型 | 名称 | 目标 | 代理 |
|---|---|---|---|
| CNAME | `baiban` | `caojuege-meeting-board.pages.dev` | 已代理 |
| CNAME | `lanting` | `caojuege-meeting-board.pages.dev` | 待加 · 改名后的新入口 |

绑定（见 `wrangler.toml`）：

| 绑定 | 资源 | 用途 |
|---|---|---|
| `BOARD_DB` | D1 `caojuege-meeting-board` | 当前白板：按便签写入 |
| `BOARD_KV` | KV `BOARD_KV` | 旧数据认领，不再当真相源 |

## 技术栈

- React + Vite + Tailwind
- 本地：Express + `.data/` JSON
- 线上：Cloudflare Pages + Functions + D1（KV 仅认领旧数据）
