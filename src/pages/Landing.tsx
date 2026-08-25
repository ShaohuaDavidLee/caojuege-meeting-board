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

const STEPS = [
  {
    title: "打开会议间",
    body: "主会议间是「草诀歌 AI Labs」，闭门会与共创会都落在这里。链接长期有效，进来就能看到上一场留下的问题。",
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
    body: "有改动时每 15 分钟自动存档，最近 20 份留着。会散了，问题还在。",
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

          <button
            type="button"
            onClick={() => onEnterRoom(DEFAULT_ROOM)}
            className="btn btn-primary h-9 px-4 shrink-0 whitespace-nowrap group"
          >
            进入会议间
            <ArrowRight className="w-4 h-4 arrow-nudge" />
          </button>
        </div>
      </header>

      {/* ---------- 首屏 ---------- */}
      <section className="relative overflow-hidden pt-20 border-b border-[var(--c-border-soft)]">
        <span className="hero-watermark" aria-hidden="true">
          草
        </span>

        <div className="wrap relative z-10 min-h-[85vh] flex flex-col justify-center py-24">
          <p className="eyebrow rise">Caojuege AI Labs · Meeting Board</p>

          {/* 窄屏多断一次，「碰撞」不会掉成孤行 */}
          <h1 className="display-xl mt-6 rise rise-d1">
            在白板上共享<br />自由交流<br className="sm:hidden" />和<em className="font-serif italic">思想碰撞</em>
          </h1>

          <p className="lead mt-8 max-w-2xl rise rise-d2">
            一场会议真正的产出，是那些被说出口的问题。草诀歌 AI Labs
            的会议白板把提问、投票与解答放在同一张纸面上——开一个链接，所有人一起写。
          </p>

          <div className="mt-12 rise rise-d3">
            <button
              type="button"
              onClick={() => onEnterRoom(DEFAULT_ROOM)}
              className="btn btn-primary h-12 px-7 text-[var(--fs-base)] group"
            >
              进入草诀歌 AI Labs 会议间
              <ArrowRight className="w-4 h-4 arrow-nudge" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------- 白板长什么样？ ---------- */}
      <section className="section border-b border-[var(--c-border-soft)]">
        <div className="wrap">
          <SectionHead
            eyebrow="What It Looks Like"
            title="白板长"
            emphasis="什么样？"
          />

          <figure className="m-0">
            <div className="border border-[var(--c-border-soft)] bg-[var(--c-surface)] overflow-x-auto">
              <img
                src="/board-preview.png"
                width={2800}
                height={1860}
                alt="草诀歌 AI Labs 会议间：便签、投票与已解答标记"
                className="block h-auto w-full min-w-[760px] md:min-w-0"
              />
            </div>
            <figcaption className="mt-4 text-[var(--fs-xs)] leading-relaxed text-[var(--c-muted-alt)]">
              一张便签就是一个问题。右下角是票数，答完的会被划掉并标为「已解答」，顶栏可以只看还没答的那些。
              <span className="md:hidden">（窄屏可左右滑动看细节）</span>
            </figcaption>
          </figure>
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

      {/* ---------- 进哪个会议间？ ---------- */}
      <section id="rooms" className="section border-b border-[var(--c-border-soft)]">
        <div className="wrap">
          <SectionHead
            eyebrow="Enter A Room"
            title="进哪个"
            emphasis="会议间？"
          />

          <div className="grid-frame grid">
            {/* 主角：草诀歌 AI Labs 会议间 */}
            <div className="cell">
              <p className="eyebrow">Main Room · 主会议间</p>
              <h3 className="display-l mt-4">{DEFAULT_ROOM}</h3>
              <p className="lead mt-6 max-w-2xl">
                闭门会、共创会与日常提问都落在这一间。它是社区自己的场子，链接长期有效，进来就能看到上一场留下的问题。
              </p>
              <div className="mt-10">
                <button
                  type="button"
                  onClick={() => onEnterRoom(DEFAULT_ROOM)}
                  className="btn btn-primary h-12 px-7 text-[var(--fs-base)] group"
                >
                  进入会议间
                  <ArrowRight className="w-4 h-4 arrow-nudge" />
                </button>
              </div>
            </div>

            {/* 配角：需要单独一间时才用 */}
            <div className="cell cell--tight">
              <form
                onSubmit={handleCreateRoom}
                className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6"
              >
                <p className="text-[var(--fs-sm)] text-[var(--c-muted)] lg:shrink-0">
                  要单独开一场？取个名字就是一间新的会议间。
                </p>
                <div className="flex flex-1 flex-col sm:flex-row lg:max-w-md">
                  <input
                    id="room-name"
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    placeholder="会议间名称"
                    aria-label="会议间名称"
                    maxLength={MAX_ROOM_NAME_LENGTH}
                    className="field h-11 sm:border-r-0"
                  />
                  <button
                    type="submit"
                    disabled={!pendingRoom}
                    className="btn btn-ghost h-11 px-5 shrink-0 mt-2 sm:mt-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    进这一间
                  </button>
                </div>
              </form>

              {pendingRoom && (
                <p className="mt-4 text-[var(--fs-xs)] leading-relaxed text-[var(--c-muted-alt)]">
                  这一间的地址是 {readableRoomUrl(pendingRoom)}
                </p>
              )}

              {recentRooms.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[var(--c-border-soft)]">
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
