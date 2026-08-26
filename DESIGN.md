---
# 草诀歌 AI Labs 会议白板 · DESIGN.md
# 规范：Google Labs design.md（Apache-2.0）· 八节固定顺序
#
# 这份文档只描述一件事：在现有风格之上，新增一套名为「硬派」的皮肤。
# 现有风格（classic）是基线，不改。凡是没有 hard- 前缀的 token 都是
# 从 src/index.css 抄过来的现状记录，不是提案——改它们要另开一次决策。

name: 草诀歌 AI Labs 会议白板
version: 0.2.0
status: proposed              # 未合并；线上仍由 设计规范.md 生效
source_ref: https://www.stylekit.top/styles/neo-brutalist/showcase
proof_sheet: design/liebin-2026-08-25/preview.html

themes:
  classic:
    label: 现在
    origin: src/index.css
    mutable: false            # 基线。只读。
  hard:
    label: 硬派
    attribute: '[data-theme="hard"]'
    scope: 只换 CSS 变量；不改 DOM、不改类名语义、不按主题分支渲染
  default: classic            # 已定：第一次打开的人看到现在这一版；硬派要手动切
  persistence: localStorage   # 每人本机偏好；不进 KV，不随会议间同步

colors:
  # ── classic · 现状记录，逐条对应 index.css ──
  primary:        '#47494B'   # --c-btn
  background:     '#E5E5E5'   # --c-bg
  foreground:     '#1A1A1A'   # --c-ink
  surface:        '#FFFFFF'   # --c-surface
  border:         'rgba(71,73,75,0.2)'   # --c-border-soft
  border-strong:  '#575757'   # --c-border
  muted:          '#5C5E60'   # --c-muted
  muted-alt:      '#8B949E'   # --c-muted-alt
  on-primary:     '#E5E5E5'   # --c-on-dark · 对比 7.19:1
  watermark:      'rgba(0,0,0,0.05)'
  # ── hard · 本次新增 ──
  hard-primary:      '#000000'
  hard-background:   '#CCF224'   # 看图估的
  hard-foreground:   '#000000'   # 看图估的（参考自称 maximum contrast）
  hard-surface:      '#FFFFFF'
  hard-border:       '#000000'   # 硬派没有「软」边框
  hard-accent:       '#FF2E7E'   # 洋红 · 看图估的 · 黑字 5.94:1
  hard-accent-2:     '#35D6F0'   # 青   · 看图估的 · 黑字 12.0:1
  hard-muted:        '#3A3A3A'
  hard-on-primary:   '#FFFFFF'
  hard-on-accent:    '#000000'   # 强制：三个强调色上只准黑字
  hard-watermark:    'rgba(0,0,0,0.07)'
  # ── 便签六色 · 数据不是皮肤，两套共用 ──
  note-xuanzhi:   '#FFFFFF'
  note-mise:      '#F3EFE6'
  note-zhuqing:   '#E4EBE3'
  note-yuhui:     '#E6EAEE'
  note-taowu:     '#F3E8E6'
  note-tenghuang: '#F2EDD8'

typography:
  # ── 字号阶梯是结构，两套共用 ──
  display-xl:
    fontFamily: '"Noto Serif SC", "Songti SC", serif'
    fontSize: 76px            # 实际是 clamp(40px, 5.4vw, 76px)，见正文
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.02em      # 现状。已知对中文是错的，但这次不动。
  display-l:
    fontFamily: '"Noto Serif SC", "Songti SC", serif'
    fontSize: 60px            # clamp(32px, 5vw, 60px)
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.02em
  display-m:
    fontFamily: '"Noto Serif SC", "Songti SC", serif'
    fontSize: 40px            # clamp(28px, 4vw, 40px)
    fontWeight: 600
    lineHeight: 1.2
  lead:
    fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: 20px
    lineHeight: 1.75
  body:
    fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: 16px
    lineHeight: 1.85
  small:
    fontSize: 14px
    lineHeight: 1.85
  caption:
    fontSize: 12px
    lineHeight: 1.7
  label:
    fontFamily: '"Inter", sans-serif'
    fontSize: 12px
    fontWeight: 500
    letterSpacing: 0.2em        # --ls-widest · 两套共用
  # ── hard 的字体皮肤 ──
  display-xl-hard:
    fontFamily: '"Noto Serif SC", "Songti SC", serif'
    fontSize: 76px            # clamp(40px, 5.4vw, 76px)
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: 0em          # 中文标题不用负字距
  lead-hard:
    fontFamily: '"JetBrains Mono", ui-monospace, monospace'
    fontSize: 15px
    lineHeight: 1.9
  label-hard:
    fontFamily: '"JetBrains Mono", ui-monospace, monospace'
    fontSize: 12px
    fontWeight: 700
    letterSpacing: 0.2em
  # ── CJK 扩展：规范原生不支持中文，这几项必须显式写死 ──
  cjk:
    fontFamily: '"Noto Serif SC", "Songti SC", serif'
    letterSpacing: 0em          # 标题最多 -0.01em
    lineHeight: 1.85            # 1.7–1.9，不是拉丁文的 1.4–1.6
    fontWeight: 400             # 只用 400/700/900；不设 300/500

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 48px
  '2xl': 96px                   # --space-24
  container-max: 1280px         # .wrap · 唯一保留绝对值的地方
  container-pad: 48px           # .wrap @lg
  nav-height: 80px              # --nav-h
  sidebar-width: 320px          # BoardSidebar md:w-80
  note-width: 280px             # StickyNoteCard
  note-min-height: 168px

rounded:                        # 全档归零就是设计意图，不是没填
  none: 0px
  sm: 0px
  DEFAULT: 0px
  lg: 0px
  full: 0px

components:
  button:
    backgroundColor: primary
    textColor: on-primary
    typography: label
    rounded: none
    height: 44px
    padding: 24px
  card:                         # 便签
    backgroundColor: surface
    textColor: foreground
    typography: small
    rounded: none
    width: 280px
    padding: 14px
  input:
    backgroundColor: surface
    textColor: foreground
    typography: small
    rounded: none
    padding: 12px
  sidebar:
    backgroundColor: background
    textColor: muted
    typography: small
    rounded: none
    width: 320px
  nav:
    backgroundColor: background
    textColor: foreground
    typography: label
    rounded: none
    height: 80px

# ─────────────────────────────────────────────────────────
# 以下三节 design.md 规范建模不到（它没有 border / elevation / motion
# 的槽位），export 命令会忽略。留在这里是给人看的，正文里有对应说明。
# ─────────────────────────────────────────────────────────
x-border-width:
  DEFAULT: 1px                  # classic 结构边框 = --c-border-soft
  hard: 0.25em                  # 16px 下 4px · 看图估的
  hairline: 1px                 # 便签内分隔线，两套都是 1px

x-shadow:
  DEFAULT: none                 # classic：绝对平面，靠发丝线分层
  hard: 0.5em 0.5em 0 #000000   # 参考页自报 SHADOW OFFSET 8px
  hard-accent: 0.5em 0.5em 0 #FF2E7E
  blur: 0
  max-stacked-notes: 40         # 超过就关投影

x-transition:
  easing: cubic-bezier(0.16, 1, 0.3, 1)   # --ease-out，两套共用
  DEFAULT: 350ms
  hard: 150ms                   # 参考页自报
  reduced-motion: respect

---

# 会议白板 · 新增「硬派」皮肤

## 1. Overview

这套设计服务于**闭门会与共创会的现场**：一个链接发出去，二三十号人不登录、不安装，各自打开就往同一块板上落便签、投票、标已答；散会后每 15 分钟一份的存档还留着。写的人常常在别人讲话的间隙单手打字，看的人多数只看不写。

> ⚠️ **这一句只写完了一半。** 上面是产品事实（`README.md` / `constants.ts`），不是使用状态。**谁、在什么设备上、什么情绪下打开它**——这一问还没有答案，文末「未决」第 3 条。在它补上之前，「默认哪套皮肤」这个决定是悬空的。

**本次的决定是：现有风格一个字不动，在它之上新增一套可切换的「硬派」皮肤。** 这句话有两个推论，都是硬约束：

> **一、现有风格是只读的。** 这份文档里 `classic` 一栏的所有值是**现状记录**，从 `src/index.css` 抄来，不是提案。包括那条我认为有问题的 `-0.02em` 中文标题字距——它记在案上，但不改。
>
> **二、硬派只准换 CSS 变量。** 不改 DOM 结构，不改类名语义，不写 `if (theme === 'hard')` 的渲染分支。任何一个组件如果在两套皮肤下需要不同的标记，说明它没设计完，回去重做，不要在实现里分叉。

所以栅格、容器宽度、字号阶梯、80px 顶栏、320px 侧栏、280px 便签、0.2em 大写字距——**这些是结构，硬派一处没动**。换掉的只有颜色、边框粗细、投影、工具字族、显示字重、中文标题字距、正文行高、过渡时长。

**默认是 classic。** 第一次打开、没有 localStorage 的人看到的是现在这一版；硬派要手动切。这条同时解掉了下面「什么时候别用硬派」里投影仪那一条——大屏场次只要没人主动切，就还是现在这一版。

样张在 `design/liebin-2026-08-25/preview.html`，左「现在」右「硬派」，可切换可并列。

### 硬派是什么

参考是 stylekit 的 neo-brutalist showcase，最显眼的特征是**酸绿满屏当底色**。硬派把它照单全收：酸绿当底、4px 黑框、8px 硬投影、等宽字当工具字体、洋红与青当强调。

这不是「更好看的白板」，是**另一种场合的白板**——一场需要让人一眼知道「今天不一样」的会。日常场次仍然可以留在现在这一版。

## 2. Colors

数值见前置 YAML。这里只写数字表达不了的部分。

**酸绿只有「当底」这一种用法。** 半屏酸绿、酸绿渐变、酸绿描边、酸绿当强调点——这四种做法都不要。它们既没有满屏的压迫感，又把 classic 那种克制也丢了，两头不靠。硬派要么整片，要么不用。

**三个强调色都只能承载黑字。** `#CCF224` / `#FF2E7E` / `#35D6F0` 配白字的对比度是 1.29 / 3.53 / 1.75，全部不合格；配黑字是 16.3 / 5.94 / 12.0，全部通过。所以规则不写成「注意对比度」，写成一句能执行的话：**强调色上，永远黑字。**

**六色便签盘是数据，不是皮肤。** 便签底色由写便签的人选，两套皮肤下必须是同一个颜色——否则「竹青那张」在两个人嘴里就不是同一张便签。代价是「雨灰」`#E6EAEE` 和「桃雾」`#F3E8E6` 落在酸绿上会发灰发脏，这一条记在「什么时候别用这套」，不靠改色解决。

**`--c-border-soft` 在硬派下变成纯黑。** classic 用 20% 墨的发丝线做柔和分层，硬派没有「柔和」这个档位——所有结构边框都是实黑，层次靠粗细和投影拉开，不靠透明度。

## 3. Typography

**两套共用同一条字号阶梯和同一个中文字族**（Noto Serif SC）。硬派换的是：工具字族（Inter → JetBrains Mono）、显示字重（600 → 900）、中文标题字距（-0.02em → 0）、正文行高（1.75 → 1.9）。

### 关于 classic 那条 -0.02em

`.display-xl` 和 `.display-l` 现在带 `letter-spacing: -0.02em`。**这对中文是错的**——拉丁文大标题用负字距制造高级感，靠的是字母之间本来就有的空隙；中文方块字之间没有多余空间，收紧只会把笔画挤到一起，在 76px 上尤其明显。

**但这次不改它。** 你说了不动现有风格，那它就留着。这里记一笔，等哪天单独决定要不要修。硬派里是 `0`。

### 中文的四条硬规则（只约束硬派）

1. **标题字距 `0`**，要收最多 `-0.01em`。
2. **正文行高 1.85–1.9**，不是拉丁文的 1.4–1.6。等宽混排还要更松。
3. **字重只用 400 / 700 / 900。** 不设 300 和 500——多数中文字体没有这两档，浏览器会退回合成加粗（把字形偏移重画一遍），在 76px 大标题上直接糊成双影。
4. **中西混排留 `0.25em`。**

### 不做描边空心字

参考里 `BRUTAL.` 用 `-webkit-text-stroke` 做描边空心字，是它最亮眼的一笔。**这一笔不能搬。** 拉丁字母三四笔，描边留得住字腔；「碰」字十三笔，3px 描边直接把字腔糊死。

硬派里对应的位置改用**反白色块**——「思想碰撞」压在黑底上用酸绿反白。这是参考自己在导航和标签上就在用的手法，气质同源，中文成立。

## 4. Layout

**全部是结构，硬派一处没动。** 数值见 YAML，全部量自仓库。

间距标尺之外的数值不许出现。这条对双皮肤系统尤其要紧：一旦某个组件在 classic 下用 16px 而在硬派下用 20px，两套就再也对不齐，切换时会跳。

前置 YAML 里三个 display 字号锁的是**上限值**（76 / 60 / 40px）——规范的 `fontSize` 只收单一 dimension，收不下 clamp。实际值是 `clamp(40px, 5.4vw, 76px)` / `clamp(32px, 5vw, 60px)` / `clamp(28px, 4vw, 40px)`，以 `src/index.css` 为准。

容器最大宽度 1280px 是唯一保留绝对像素的地方。参考里其余绝对 px（字距、内边距、圆角、投影）都已除以字号转成 em 再迁移。

## 5. Elevation & Depth

**classic 是绝对平面**，没有任何阴影，层次全靠 1px 发丝线。这是现状，不动。

**硬派新增唯一一种深度手段：硬边位移投影。** `box-shadow: 0.5em 0.5em 0 <color>`，没有模糊、没有第二层、没有半透明叠加。它在硬派里不是装饰，是结构——它在说「这张纸压在那张纸上面」。

**便签超过 40 张时关掉投影。** 一屏几十张带 8px 硬投影的便签叠在一起，投影会连成噪点墙，画布反而读不清。这是密度上限，不是可选项。

## 6. Shapes

**圆角恒为 0。** 现站《设计规范》就是 0，参考页也自报 0px——两边同意，这一条不随皮肤变、不随组件变、不留例外。这也是硬派能做成纯皮肤层的关键：如果 classic 有圆角，换皮就要改结构。

边框分两类，**这个区分现在的代码里还没有，是实现前要补的**：

| 类 | classic | hard | 用在哪 |
|---|---|---|---|
| 结构边框 `--bw` | `1px` | `0.25em` | 面板、便签、按钮、输入框、顶栏底线、侧栏左线的外框 |
| 发丝线 `--hairline` | `1px` | `1px` | 便签内部的分隔线、统计行之间的线 |

现在 `index.css` 里这两者都写死成 `1px`，靠 `--c-border-soft` 的透明度区分深浅。硬派需要把外框加粗、内部分隔线保持 1px，所以必须把 `--bw` 抽出来。**这是本次唯一必须改动 classic 代码的地方，而且 classic 设 `--bw: 1px` 后渲染结果字节级不变。**

## 7. Components

以下每一个都必须在两套皮肤下跑同一份标记。

**好消息：`index.css` 的组件层已经把颜色全部走了 CSS 变量**（`.btn` / `.btn-primary` / `.btn-ghost` / `.btn-icon` / `.field` / `.panel` / `.panel-soft` / `.panel-dark` / `.sticky-note` / `.toast` / `.modal-scrim` / `.canvas-watermark` / `.eyebrow`）。所以硬派的颜色部分是**纯叠加**：一个 `[data-theme="hard"] { --c-bg: …; --c-ink: …; … }` 变量块，组件文件一行不改。

**需要动手的只有三处：**

1. **抽出 `--bw`**（见 Shapes）。只改 `index.css` 的组件层，classic 渲染不变。
2. **补 4 个 class 钩子。** 有些结构边框写在 JSX 的 Tailwind 工具类上（`border-b border-[var(--c-border-soft)]`），CSS 够不着。已经有钩子的：`.nav-bar`、`.mobile-toolbar`、`.zoom-bar`、`.sticky-note`、`.panel`、`.panel-soft`。缺钩子的：`BoardSidebar` 的 `<aside>`、`Landing` 的 `<header>`、`Landing` 各 `<section>` 的分隔线、首屏右侧 `<figure>` 的外框。**只是加 class 名，不改任何现有样式。**
3. **加主题开关组件。** 落地页放导航右侧、白板放顶栏工具组内，同一个组件两处复用。

**逐组件的皮肤差异：**

- **便签** — 280px 宽，三段式不变。状态标签在 classic 下是纯文字（`Open` / `Answered`，大写 0.2em），硬派下是色块（`OPEN` 洋红底黑字 / `ANSWERED` 黑底酸绿字）。已答 = 正文删除线 + 透明度，classic `0.55`、硬派 `0.72`（酸绿底需要更高可读度）。
- **按钮** — 三档不变（primary / ghost / icon）。硬派给 primary 加洋红硬投影、ghost 加墨色硬投影。高度不变。
- **顶栏** — 80px 不变。classic 与页面同底加 1px 底线；硬派整条反白（黑底）。分段控件选中态：classic `--c-btn`，硬派洋红。
- **侧栏** — 320px 不变，纵向 flex 不变。底部深色条：classic `.panel-dark`（`--c-btn` + `--c-on-dark`），硬派纯黑 + 酸绿字。
- **空状态卡** — 位置与尺寸不变。标题里「提问」二字是情绪落点：classic 是衬线斜体，硬派是洋红高亮块。**这是唯一允许两套用不同手法（而非不同数值）的地方**——强调本身就属于皮肤。
- **画布水印** — 一个「问」字，半裁切。classic 5% 黑，硬派 7% 黑。全站有且只有这一处水印。
- **主题开关** — 切换只改根元素 `data-theme`，写 localStorage，不重挂载、不发请求、不写 KV。**主题是每个人自己的偏好，不是会议间的属性**：同一块板上两个人看到不同皮肤是可以接受的（便签的颜色、位置、票数才是共识）。这个取舍是我推的，不是你说的，实现前确认一次。

## 8. Do's and Don'ts

### Do's

- ✅ 硬派的强调色上永远放黑字。
- ✅ 圆角 0，无例外。
- ✅ 硬派里中文标题字距 0，正文行高 1.9。
- ✅ 深度只用硬边位移投影，一个形状走到底。
- ✅ 换皮只换 CSS 变量；组件标记两套共用。
- ✅ 参考里的绝对 px 先除字号转 em 再迁移，容器宽度除外。
- ✅ 动 classic 之前先问。它是基线，不是待改的东西。

### Don'ts

> **这一节是空的，我不会替你填。**
>
> 模型自己写的负面约束永远是「保持一致性」「避免视觉噪音」这类正确的废话，对后续生成零约束力。这一栏只能由人填，而且要逐字保留原话——「这片绿刺眼」「投影太重像贴纸」「等宽字排中文很别扭」这种句子才有约束力。
>
> **「现有风格不动 + 新增硬派」这个决定没有产生任何被否掉的东西，所以 Q2 至今没有原话。** 补法见「未决」第 2 条。

```markdown
### Don'ts
- ❌「原话」— 说这句话时在看哪一屏
- ❌「原话」— 同上
```

### 目前唯一一条有依据的禁令

- ❌ **不要把酸绿做成半屏、渐变、描边或小面积强调。** 这不是你的原话，是从两版并列里读出来的：硬派的全部说服力来自「满屏」，任何折中会让它既不硬也不静。**标注为推断，非用户原话**，在你确认之前不具备最高约束力。

## 什么时候别用硬派

规范里没有这一栏。99% 的设计事故出在这儿。

- **投影仪 / 大屏。** 会议室投影的对比度和色域都远低于屏幕，`#CCF224` 打到幕布上会糊成一片荧光，黑字边缘发晕。**默认已经定成 classic，所以这条不再是风险，而是一条使用建议**：要上大屏的那台机器别切硬派。
- **长文阅读。** JetBrains Mono 没有中文字形，中文会落回无衬线，Latin 走等宽——两套字宽对不上，行内节奏是碎的。首屏那段 88 字是上限；超过三行就该换回 classic 的 Inter。
- **要打印或截图存档的场合。** 满屏酸绿的截图贴进任何文档都会抢走全部注意力。
- **便签超过 40 张。** 硬投影连成噪点墙，此时应降级为无投影（见 Elevation）。
- **大量用到「雨灰」「桃雾」两色便签的场次。** 这两色在酸绿底上发灰发脏，是六色盘与酸绿的固有冲突，不靠改色解决——那一场就该留在 classic。

## 未决

第 1 条已经定了。剩下两条堵在这儿——第 2 条不填，Don'ts 就一直是空的。

1. ~~**第一次打开的人，默认看到哪一套？**~~ **已定：classic。** 硬派手动切，选择记在本机。
2. **硬派里有什么是你一眼就不想要的？** Don'ts 现在是空的。即使两套都留，你对硬派一定有不满意的地方；说出来，逐字进文档，我不润色。
3. **谁会在什么状态下打开它？** 什么时间、什么设备、单手还是双手、周围有没有人、情绪是松是紧。这一问决定第 1 条的答案，也决定 Overview 的第一句。

另外一条实现前要确认的：**主题存本机、不随会议间同步**（同一块板上两个人可以看到不同皮肤）——这是我按「主题是外观、便签是数据」推的，不是你说的。不同意就说。

---

**Lint 状态**（`npx @google/design.md lint DESIGN.md`）：**0 errors**。剩下的 warning 有两类，都是刻意的：`x-border-width` / `x-transition` 是规范没有槽位的扩展（它不建模边框、层级与动效），`hard-*` 与 `note-*` 色被报「没有组件引用」是因为 `components` 段表达不了主题变体。别为了消 warning 去删值。

---

*本文档由 `liebin` skill 的确认流程产出。样张：`design/liebin-2026-08-25/preview.html`。参考：stylekit neo-brutalist showcase（只学版式与气质，未使用其 logo、字体文件、图片或成段文案）。现状值全部量自 `src/index.css` 与组件源码。*
