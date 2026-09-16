/**
 * 顶栏 —— 返回 / 标题 / 会议间 / 筛选 / 工具
 */

import { useState } from "react";
import {
  Check,
  ChevronLeft,
  Grid,
  History,
  Layers,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useBrand } from "../../brand";
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
  const brand = useBrand();
  /** 主会议间是品牌的属性：classic 的主房和 Faith 的主房不是同一间 */
  const isMainRoom = room === brand.defaultRoom || isDefaultRoom(room);
  const [moreOpen, setMoreOpen] = useState(false);

  const closeMore = () => setMoreOpen(false);

  return (
    <header className="nav-bar relative shrink-0 h-20 px-3 sm:px-4 md:px-8 flex items-center justify-between z-10 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] gap-2">
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
          {brand.navEyebrow ? <p className="eyebrow">{brand.navEyebrow}</p> : null}
          {isEditingTitle ? (
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                className="field py-0.5 px-1.5 text-[length:var(--fs-sm)] font-serif w-full max-w-[280px]"
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

        <div className="seg-group hidden md:flex items-center border border-[var(--c-border-soft)] h-9 shrink-0 max-w-[46vw] sm:max-w-none">
          <span className="hidden sm:inline px-2.5 text-[10px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)] border-r border-[var(--c-border-soft)]">
            Room
          </span>
          <span
            className="font-serif px-2.5 text-[length:var(--fs-sm)] truncate"
            title={isMainRoom ? brand.mainRoomTip : `独立会议间「${room}」`}
          >
            {room}
          </span>
        </div>

        <div className="seg-group hidden md:flex items-stretch border border-[var(--c-border-soft)] h-9 shrink-0">
          {FILTERS.map(([key, label], i) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterType(key)}
              className={`seg px-3 text-[11px] tracking-wide ${
                i > 0 ? "border-l border-[var(--c-border-soft)]" : ""
              } ${filterType === key ? "is-on" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="seg-group flex items-center gap-0 border border-[var(--c-border-soft)] h-9 shrink-0">
        <ThemeToggle className="h-full px-2 sm:px-3 border-0 border-r border-[var(--c-border-soft)] hidden md:inline-flex" />
        <button
          type="button"
          onClick={onEditProfile}
          className="hidden md:inline-flex btn btn-ghost h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)] max-w-[72px] sm:max-w-none truncate"
          title="修改昵称"
        >
          <span className="truncate">{username || "昵称"}</span>
        </button>
        <button
          type="button"
          onClick={onAutoAlign}
          className="hidden md:inline-flex btn btn-ghost h-full px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)]"
          title="一键对齐"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">排序</span>
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className="hidden md:inline-flex btn btn-ghost h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)]"
          title="历史版本"
        >
          <History className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`hidden md:inline-flex btn h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)] ${
            showSidebar ? "btn-primary" : "btn-ghost"
          }`}
          title={showSidebar ? "隐藏说明" : "使用说明"}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className="md:hidden btn btn-ghost h-full px-2.5 text-[11px] border-0 border-r border-[var(--c-border-soft)]"
          title="更多"
          aria-label="更多"
          aria-expanded={moreOpen}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
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

      {moreOpen && (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 z-20 border-0 bg-transparent cursor-default"
            aria-label="关闭菜单"
            onClick={closeMore}
          />
          <div className="md:hidden absolute right-3 top-full z-30 panel min-w-[168px] -mt-px">
            <button
              type="button"
              onClick={() => {
                closeMore();
                onEditProfile();
              }}
              className="w-full text-left px-3 py-2.5 text-[12px] text-[var(--c-ink)] hover:bg-[var(--c-bg)] bg-transparent border-0 cursor-pointer"
            >
              {username || "昵称"}
            </button>
            <button
              type="button"
              onClick={() => {
                closeMore();
                onOpenHistory();
              }}
              className="w-full text-left px-3 py-2.5 text-[12px] text-[var(--c-ink)] hover:bg-[var(--c-bg)] bg-transparent border-0 border-t border-[var(--c-border-soft)] cursor-pointer"
            >
              历史版本
            </button>
            <button
              type="button"
              onClick={() => {
                closeMore();
                onToggleSidebar();
              }}
              className="w-full text-left px-3 py-2.5 text-[12px] text-[var(--c-ink)] hover:bg-[var(--c-bg)] bg-transparent border-0 border-t border-[var(--c-border-soft)] cursor-pointer"
            >
              {showSidebar ? "隐藏说明" : "使用说明"}
            </button>
            <div className="border-t border-[var(--c-border-soft)] px-2 py-2">
              <ThemeToggle className="h-9 w-full" />
            </div>
          </div>
        </>
      )}
    </header>
  );
}
