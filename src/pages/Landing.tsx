/**
 * 落地页 —— 草诀歌 AI Labs 会议白板的正门
 * 严格对齐《设计规范.md》：灰度 / 发丝线 / 绝对平面 / 衬线层级 / 英文 eyebrow + 中文反问句
 */

import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import {
  BRAND_NAME,
  DEFAULT_ROOM,
  MAX_ROOM_NAME_LENGTH,
} from "../constants";
import { canonicalRoomName, readableRoomUrl } from "../utils/boardHelpers";
import { readRecentRooms } from "../utils/recentRooms";

const BELIEFS = [
  {
    title: "口诀先于天赋",
    body: "Vibe coding 是我们这个时代的草诀歌。学草书的人先背口诀歌——口诀不让你成为书法家，却让你当场写得出来。让非专家做出专家级的东西，是同一件事。",
  },
  {
    title: "作品重于产量",
    body: "AI 的真正红利不在批量制造垃圾，而在于创造独特作品。所以我们不比谁发得多，只看谁做出了别人做不出的那一件。",
  },
  {
    title: "交叉胜于同温层",
    body: "美第奇效应：画家、科学家、工程师坐到同一张桌子边上，互相授粉。会议白板想留住的，正是交叉发生的那一刻。",
  },
];

const STEPS = [
  {
    title: "开一间房",
    body: "主房叫「草诀歌 AI Labs」，闭门会与共创会都落在这里。要办自己的场，另开一间就好，两边互不打扰。",
  },
  {
    title: "把链接发出去",
    body: "不用登录，不用安装。拿到链接的人打开就能落便签，署名或匿名都行。",
  },
  {
    title: "一起提问与表态",
    body: "便签能拖、能投票、能改色分类。答完的问题点一下对勾，现场就知道还剩什么没聊。",
  },
  {
    title: "散会带得走",
    body: "有改动时每 15 分钟自动存档，每间房留最近 20 份。会散了，问题还在。",
  },
];

const GAINS = [
  {
    title: "一份问题清单",
    body: "散会时你手上是一份按票数排过序的真实问题，而不是一段没人再听第二遍的录音。",
  },
  {
    title: "一次真实的表态",
    body: "不好意思举手的人也会写便签，怕跑题的人也敢投一票。投票让沉默的多数第一次有了刻度。",
  },
  {
    title: "可回溯的现场",
    body: "每一次存档都是一张会议切片。三个月后回头看，你会看见问题是怎么长出来的。",
  },
];

const ROLES = [
  {
    mark: "草",
    name: "跨界者 · 草书者",
    body: "自由、有经验、乐于分享。写得快，是因为已经写过很多遍。",
  },
  {
    mark: "行",
    name: "造物者 · 行书者",
    body: "在动手，在造东西。产品还没做完，但已经跑起来了。",
  },
  {
    mark: "楷",
    name: "探索者 · 楷书者",
    body: "在学习，讲求精确。一笔一画，先把结构立住。",
  },
];

function SectionHead({
  eyebrow,
  title,
  emphasis,
}: {
  eyebrow: string;
  title: string;
  emphasis: string;
}) {
  return (
    <div className="mb-12 lg:mb-16 max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-l mt-4">
        {title}
        <em className="font-serif italic">{emphasis}</em>
      </h2>
    </div>
  );
}

export default function Landing({
  onEnterRoom,
}: {
  onEnterRoom: (room: string) => void;
}) {
  const [roomInput, setRoomInput] = useState("");
  const recentRooms = useMemo(
    () => readRecentRooms().filter((r) => r !== DEFAULT_ROOM),
    []
  );

  const pendingRoom = canonicalRoomName(roomInput);

  const handleCreateRoom = (e: FormEvent) => {
    e.preventDefault();
    if (!pendingRoom) return;
    onEnterRoom(pendingRoom);
  };

  return (
    <div className="min-h-dvh bg-[var(--c-bg)] text-[var(--c-ink)] font-sans">
      {/* ---------- 导航：实色 + 底线，不做毛玻璃 ---------- */}
      <header className="fixed top-0 inset-x-0 z-40 h-20 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)]">
        <div className="wrap h-full flex items-center justify-between">
          <a
            href="/"
            className="flex items-baseline gap-2.5 shrink-0 whitespace-nowrap no-underline text-[var(--c-ink)]"
          >
            <span className="font-serif text-[17px] sm:text-[19px] tracking-[0.14em]">
              草诀歌
            </span>
            <span className="eyebrow">AI Labs</span>
          </a>

          <div className="flex items-center gap-3 shrink-0">
            <a href="#rooms" className="hidden sm:inline-flex btn btn-ghost h-9 px-4">
              开一间自己的房
            </a>
            <button
              type="button"
              onClick={() => onEnterRoom(DEFAULT_ROOM)}
              className="btn btn-primary h-9 px-4 whitespace-nowrap group"
            >
              进入主房
              <ArrowRight className="w-4 h-4 arrow-nudge" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- 首屏 ---------- */}
      <section className="relative overflow-hidden pt-20 border-b border-[var(--c-border-soft)]">
        <span className="hero-watermark" aria-hidden="true">
          草
        </span>

        <div className="wrap relative z-10 min-h-[85vh] flex flex-col justify-center py-24">
          <p className="eyebrow rise">Caojuege AI Labs · Meeting Board</p>

          <h1 className="display-xl mt-6 rise rise-d1">
            以产品为笔，
            <br />
            <em className="font-serif italic">和世界对话</em>。
          </h1>

          <p className="lead mt-8 max-w-2xl rise rise-d2">
            一场会议真正的产出，是那些被说出口的问题。草诀歌 AI Labs
            的会议白板把提问、投票与解答放在同一张纸面上——开一个链接，所有人一起写。
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3 rise rise-d3">
            <button
              type="button"
              onClick={() => onEnterRoom(DEFAULT_ROOM)}
              className="btn btn-primary h-12 px-7 text-[var(--fs-base)] group"
            >
              进入草诀歌 AI Labs
              <ArrowRight className="w-4 h-4 arrow-nudge" />
            </button>
            <a href="#rooms" className="btn btn-ghost h-12 px-7 text-[var(--fs-base)]">
              开一间自己的房
            </a>
          </div>
        </div>
      </section>

      {/* ---------- 社区相信什么？ ---------- */}
      <section className="section border-b border-[var(--c-border-soft)]">
        <div className="wrap">
          <SectionHead
            eyebrow="What We Believe"
            title="社区相信"
            emphasis="什么？"
          />

          <div className="grid-frame grid md:grid-cols-3">
            {BELIEFS.map((item, i) => (
              <div key={item.title} className="cell">
                <span className="ordinal">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display-m mt-6">{item.title}</h3>
                <p className="mt-5 text-[var(--fs-sm)] leading-loose text-[var(--c-muted)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 白板怎么用？ ---------- */}
      <section className="section border-b border-[var(--c-border-soft)]">
        <div className="wrap">
          <SectionHead
            eyebrow="How It Works"
            title="白板"
            emphasis="怎么用？"
          />

          <div className="grid-frame grid md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item, i) => (
              <div key={item.title} className="cell cell--tight">
                <span className="ordinal">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-serif text-[var(--fs-lg)] tracking-[-0.02em] mt-6">
                  {item.title}
                </h3>
                <p className="mt-4 text-[var(--fs-sm)] leading-loose text-[var(--c-muted)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 你可以获得什么？ ---------- */}
      <section className="section border-b border-[var(--c-border-soft)]">
        <div className="wrap">
          <SectionHead
            eyebrow="What You Get"
            title="你可以获得"
            emphasis="什么？"
          />

          <div className="grid-frame grid md:grid-cols-3">
            {GAINS.map((item) => (
              <div key={item.title} className="cell">
                <h3 className="display-m">{item.title}</h3>
                <p className="mt-5 text-[var(--fs-sm)] leading-loose text-[var(--c-muted)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 社区里现在有谁？ ---------- */}
      <section className="section border-b border-[var(--c-border-soft)]">
        <div className="wrap">
          <SectionHead
            eyebrow="Who Is Here"
            title="社区里现在"
            emphasis="有谁？"
          />

          <div className="grid-roles grid md:grid-cols-3">
            {ROLES.map((role) => (
              <div key={role.mark} className="cell role-card">
                <span className="role-card__mark" aria-hidden="true">
                  {role.mark}
                </span>
                <div className="relative z-10">
                  <span className="role-badge">{role.mark}</span>
                  <h3 className="font-serif text-[var(--fs-lg)] tracking-[-0.02em] mt-6">
                    {role.name}
                  </h3>
                  <p className="mt-4 text-[var(--fs-sm)] leading-loose opacity-80">
                    {role.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[var(--fs-sm)] text-[var(--c-muted-alt)]">
            三种笔速，同一张纸。没有初级中级高级，只有你此刻在用哪一种笔。
          </p>
        </div>
      </section>

      {/* ---------- 进哪一间？ ---------- */}
      <section id="rooms" className="section border-b border-[var(--c-border-soft)]">
        <div className="wrap">
          <SectionHead
            eyebrow="Enter A Room"
            title="今天进"
            emphasis="哪一间？"
          />

          <div className="grid-frame grid lg:grid-cols-2">
            <div className="cell flex flex-col">
              <p className="eyebrow">Main Room · 主房</p>
              <h3 className="display-m mt-4">{DEFAULT_ROOM}</h3>
              <p className="mt-5 text-[var(--fs-sm)] leading-loose text-[var(--c-muted)] flex-1">
                闭门会、共创会与日常提问都落在这一间。它是社区自己的场子，链接长期有效，进来就能看到上一场留下的问题。
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onEnterRoom(DEFAULT_ROOM)}
                  className="btn btn-primary h-12 px-7 text-[var(--fs-base)] group"
                >
                  进入主房
                  <ArrowRight className="w-4 h-4 arrow-nudge" />
                </button>
              </div>
            </div>

            <div className="cell flex flex-col">
              <p className="eyebrow">Your Room · 自己的房</p>
              <h3 className="display-m mt-4">开一间新的</h3>
              <p className="mt-5 text-[var(--fs-sm)] leading-loose text-[var(--c-muted)]">
                其他人要开会，不必挤在主房里。取一个房名，就得到一间独立的白板：便签、投票与存档都只属于这一间。
              </p>

              <form onSubmit={handleCreateRoom} className="mt-8">
                <label htmlFor="room-name" className="eyebrow block">
                  Room Name · 房名
                </label>
                <div className="mt-3 flex flex-col sm:flex-row">
                  <input
                    id="room-name"
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    placeholder="例如：产品共创 07"
                    maxLength={MAX_ROOM_NAME_LENGTH}
                    className="field h-12 sm:border-r-0"
                  />
                  <button
                    type="submit"
                    disabled={!pendingRoom}
                    className="btn btn-primary h-12 px-7 shrink-0 mt-2 sm:mt-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    开这一间
                  </button>
                </div>
                <p className="mt-4 text-[var(--fs-xs)] leading-relaxed text-[var(--c-muted-alt)]">
                  {pendingRoom
                    ? `这一间的地址是 ${readableRoomUrl(pendingRoom)}`
                    : "房名就是地址。同名即同房，把链接发给参会者，大家看到的是同一张纸面。"}
                </p>
              </form>

              {recentRooms.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[var(--c-border-soft)]">
                  <p className="eyebrow">Recent · 你去过的</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recentRooms.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onEnterRoom(name)}
                        className="btn btn-ghost h-9 px-3.5 font-serif"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA 带 + 页脚：共用同一块深色区 ---------- */}
      <footer className="bg-[var(--c-btn)] text-[var(--c-on-dark)]">
        <div className="wrap py-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div>
            <p className="eyebrow is-on-dark">Start Here</p>
            <p className="display-l mt-4">
              以产品为笔，<em className="font-serif italic">和世界对话</em>。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEnterRoom(DEFAULT_ROOM)}
            className="btn btn-on-dark h-12 px-7 text-[var(--fs-base)] shrink-0 self-start lg:self-auto group"
          >
            进入草诀歌 AI Labs
            <ArrowRight className="w-4 h-4 arrow-nudge" />
          </button>
        </div>

        <div className="border-t border-[var(--c-border-on-dark)]">
          <div className="wrap py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[var(--fs-xs)]">
            <p className="on-dark-soft">
              {BRAND_NAME} —— 面向非技术创作者的中文 vibe coding 社区
            </p>
            <p className="on-dark-faint tracking-[var(--ls-widest)] uppercase">
              baiban.caojuege.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
