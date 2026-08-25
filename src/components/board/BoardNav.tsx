/**
 * 顶栏 —— 返回 / 标题 / 会议间 / 筛选 / 工具
 */

import { Check, ChevronLeft, Grid, History, Layers, Share2 } from "lucide-react";
import { isDefaultRoom } from "../../utils/boardHelpers";
import type { NoteFilter } from "../../hooks/useBoardSession";

const FILTERS = [
  ["all", "全部"],
  ["unanswered", "未答"],
  ["answered", "已答"],
] as const;

export function BoardNav({
  room,
  boardTitle,
  isEditingTitle,
  titleInput,
  setTitleInput,
  setIsEditingTitle,
  saveTitle,
  filterType,
  setFilterType,
  username,
  showSidebar,
  onLeave,
  onEditProfile,
  onAutoAlign,
  onOpenHistory,
  onToggleSidebar,
  onCopyLink,
}: {
  room: string;
  boardTitle: string;
  isEditingTitle: boolean;
  titleInput: string;
  setTitleInput: (v: string) => void;
  setIsEditingTitle: (v: boolean) => void;
  saveTitle: () => void;
  filterType: NoteFilter;
  setFilterType: (v: NoteFilter) => void;
  username: string;
  showSidebar: boolean;
  onLeave: () => void;
  onEditProfile: () => void;
  onAutoAlign: () => void;
  onOpenHistory: () => void;
  onToggleSidebar: () => void;
  onCopyLink: () => void;
}) {
  return (
    <header className="nav-bar shrink-0 h-20 px-3 sm:px-4 md:px-8 flex items-center justify-between z-10 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] gap-2">
      <div className="flex items-center gap-2 sm:gap-5 min-w-0 flex-1">
        <button
          type="button"
          onClick={onLeave}
          className="btn btn-icon shrink-0"
          title="回首页 · 换会议间"
          aria-label="回首页"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col min-w-0 flex-1">
          <p className="eyebrow">Board · 白板</p>
          {isEditingTitle ? (
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                className="field py-0.5 px-1.5 text-[var(--fs-sm)] font-serif w-full max-w-[280px]"
                autoFocus
                maxLength={40}
              />
              <button type="button" onClick={saveTitle} className="btn btn-icon w-7 h-7 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <h1
              onClick={() => {
                setTitleInput(boardTitle);
                setIsEditingTitle(true);
              }}
              className="font-serif text-[14px] sm:text-[15px] md:text-lg tracking-[-0.02em] cursor-pointer truncate hover:text-[var(--c-btn)] transition-colors duration-300 mt-0.5"
              title="点击编辑标题"
            >
              {boardTitle}
            </h1>
          )}
        </div>

        <div className="flex items-center border border-[var(--c-border-soft)] h-9 shrink-0 max-w-[46vw] sm:max-w-none">
          <span className="hidden sm:inline px-2.5 text-[10px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)] border-r border-[var(--c-border-soft)]">
            Room
          </span>
          <span
            className="font-serif px-2.5 text-[var(--fs-sm)] truncate"
            title={isDefaultRoom(room) ? "草诀歌 AI Labs 主会议间" : `独立会议间「${room}」`}
          >
            {room}
          </span>
        </div>

        <div className="hidden md:flex items-stretch border border-[var(--c-border-soft)] h-9 shrink-0">
          {FILTERS.map(([key, label], i) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterType(key)}
              className={`px-3 text-[11px] tracking-wide transition-colors duration-300 ${
                i > 0 ? "border-l border-[var(--c-border-soft)]" : ""
              } ${
                filterType === key
                  ? "bg-[var(--c-btn)] text-[var(--c-on-dark)]"
                  : "text-[var(--c-muted)] hover:text-[var(--c-ink)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-0 border border-[var(--c-border-soft)] h-9 shrink-0">
        <button
          type="button"
          onClick={onEditProfile}
          className="btn btn-ghost h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)] max-w-[72px] sm:max-w-none truncate"
          title="修改昵称"
        >
          <span className="truncate">{username || "昵称"}</span>
        </button>
        <button
          type="button"
          onClick={onAutoAlign}
          className="hidden sm:inline-flex btn btn-ghost h-full px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)]"
          title="一键对齐"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden md:inline">排序</span>
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className="btn btn-ghost h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)]"
          title="历史版本"
        >
          <History className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`btn h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)] ${
            showSidebar ? "btn-primary" : "btn-ghost"
          }`}
          title={showSidebar ? "隐藏说明" : "白板说明"}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className="btn btn-primary h-full px-2.5 sm:px-3.5 text-[11px] border-0 group"
          title={`分享「${room}」`}
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
