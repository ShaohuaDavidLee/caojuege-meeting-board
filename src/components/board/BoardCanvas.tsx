/**
 * 画布区 —— 工具条 / 筛选 / 缩放 / stage / 便签
 */

import type {
  Dispatch,
  MouseEvent,
  SetStateAction,
  TouchEvent,
  WheelEvent,
} from "react";
import { Plus, RefreshCw, Share2 } from "lucide-react";
import type { StickyNote } from "../../types";
import { COLOR_PALETTE } from "../../constants";
import type { NoteFilter } from "../../hooks/useBoardSession";
import { StickyNoteCard } from "./StickyNoteCard";

const FILTERS = [
  ["all", "全部"],
  ["unanswered", "未答"],
  ["answered", "已答"],
] as const;

export interface BoardCanvasProps {
  loading: boolean;
  notesCount: number;
  filteredNotes: StickyNote[];
  panOffset: { x: number; y: number };
  zoomScale: number;
  setZoomScale: Dispatch<SetStateAction<number>>;
  setPanOffset: Dispatch<SetStateAction<{ x: number; y: number }>>;
  isPanning: boolean;
  filterType: NoteFilter;
  setFilterType: (v: NoteFilter) => void;
  newNoteColor: string;
  setNewNoteColor: (v: string) => void;
  onOpenAdd: () => void;
  onOpenAddDefault: () => void;
  onCopyLink: () => void;
  onToast: (msg: string) => void;
  onCanvasMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
  onCanvasTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
  onCanvasDoubleClick: (e: MouseEvent<HTMLDivElement>) => void;
  onCanvasWheel: (e: WheelEvent<HTMLDivElement>) => void;
  upvotedNotes: string[];
  activeDragId: string | null;
  editingNoteId: string | null;
  editingText: string;
  setEditingText: (v: string) => void;
  activeMenuNoteId: string | null;
  setActiveMenuNoteId: (id: string | null) => void;
  setDeleteConfirmNoteId: (id: string | null) => void;
  onNoteMouseDown: (e: MouseEvent<HTMLDivElement>, note: StickyNote) => void;
  onNoteTouchStart: (e: TouchEvent<HTMLDivElement>, note: StickyNote) => void;
  onToggleAnswered: (note: StickyNote) => void;
  onStartEditing: (note: StickyNote) => void;
  onSaveText: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onUpvote: (id: string) => void;
}

export function BoardCanvas({
  loading,
  notesCount,
  filteredNotes,
  panOffset,
  zoomScale,
  setZoomScale,
  setPanOffset,
  isPanning,
  filterType,
  setFilterType,
  newNoteColor,
  setNewNoteColor,
  onOpenAdd,
  onOpenAddDefault,
  onCopyLink,
  onToast,
  onCanvasMouseDown,
  onCanvasTouchStart,
  onCanvasDoubleClick,
  onCanvasWheel,
  upvotedNotes,
  activeDragId,
  editingNoteId,
  editingText,
  setEditingText,
  activeMenuNoteId,
  setActiveMenuNoteId,
  setDeleteConfirmNoteId,
  onNoteMouseDown,
  onNoteTouchStart,
  onToggleAnswered,
  onStartEditing,
  onSaveText,
  onChangeColor,
  onUpvote,
}: BoardCanvasProps) {
  return (
    <>
      <div className="mobile-toolbar absolute top-3 left-3 sm:top-4 sm:left-4 z-10 panel flex flex-col rise">
        <button
          type="button"
          onClick={onOpenAdd}
          className="btn btn-primary w-12 h-12 sm:w-14 sm:h-14 flex-col gap-1 border-0 group"
          title="点此新建提问"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">提问</span>
        </button>
        <div className="hidden sm:flex border-t border-[var(--c-border-soft)] px-2 py-2.5 flex-col items-center gap-1.5">
          <span className="text-[8px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)]">
            Color
          </span>
          <div className="grid grid-cols-2 gap-1">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  setNewNoteColor(c.value);
                  onToast(`已选用：${c.name}`);
                }}
                className={`w-4 h-4 border transition-colors duration-300 ${
                  newNoteColor === c.value
                    ? "border-[var(--c-ink)]"
                    : "border-[var(--c-border-soft)]"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>
        <div className="hidden sm:flex border-t border-[var(--c-border-soft)] px-2 py-2.5 flex-col items-center gap-1 text-center">
          <RefreshCw
            className="w-3 h-3 text-[var(--c-muted-alt)] animate-spin"
            style={{ animationDuration: "3s" }}
          />
          <span className="text-[8px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)] leading-tight">
            Live
          </span>
        </div>
      </div>

      <div className="md:hidden absolute top-3 right-3 z-10 panel flex items-stretch h-9 rise">
        {FILTERS.map(([key, label], i) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterType(key)}
            className={`px-2.5 text-[11px] transition-colors duration-300 ${
              i > 0 ? "border-l border-[var(--c-border-soft)]" : ""
            } ${
              filterType === key
                ? "bg-[var(--c-btn)] text-[var(--c-on-dark)]"
                : "text-[var(--c-muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="zoom-bar absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 panel flex items-center text-[10px] text-[var(--c-muted)] rise rise-d1 mb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={() =>
            setZoomScale((prev) => Math.max(0.3, parseFloat((prev - 0.1).toFixed(1))))
          }
          className="btn btn-ghost h-9 w-9 sm:h-8 sm:w-8 border-0 border-r border-[var(--c-border-soft)] text-[length:var(--fs-sm)]"
        >
          −
        </button>
        <span className="px-2.5 min-w-[44px] text-center text-[var(--c-ink)]">
          {Math.round(zoomScale * 100)}%
        </span>
        <button
          type="button"
          onClick={() =>
            setZoomScale((prev) => Math.min(2.0, parseFloat((prev + 0.1).toFixed(1))))
          }
          className="btn btn-ghost h-9 w-9 sm:h-8 sm:w-8 border-0 border-l border-[var(--c-border-soft)] text-[length:var(--fs-sm)]"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setZoomScale(1.0);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="btn btn-ghost h-9 sm:h-8 px-2.5 border-0 border-l border-[var(--c-border-soft)] text-[10px]"
        >
          重置
        </button>
      </div>

      <div
        id="whiteboard-stage"
        onMouseDown={onCanvasMouseDown}
        onTouchStart={onCanvasTouchStart}
        onDoubleClick={onCanvasDoubleClick}
        onWheel={onCanvasWheel}
        className={`flex-1 overflow-hidden relative bg-[var(--c-bg)] ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div className="canvas-watermark" aria-hidden>
          问
        </div>

        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transformOrigin: "0 0",
          }}
        >
          {notesCount === 0 && !loading && (
            <div className="absolute left-4 top-24 sm:left-[280px] sm:top-[160px] panel-soft p-6 sm:p-10 w-[min(340px,calc(100vw-2rem))] max-w-md rise rise-d2">
              <p className="eyebrow">Empty · 空板</p>
              <h3 className="font-serif text-[24px] sm:text-[length:var(--fs-display-m)] tracking-[-0.02em] mt-2 leading-tight">
                这间会议室还没有人<em className="font-serif italic">提问</em>
              </h3>
              <p className="mt-3 text-[length:var(--fs-sm)] text-[var(--c-muted)] leading-relaxed">
                点击左上角「提问」，即可落下一张便签。手机上可单指拖动画布。
              </p>
              <div className="mt-6 flex flex-col sm:flex-row border border-[var(--c-border-soft)]">
                <button
                  type="button"
                  onClick={onOpenAddDefault}
                  className="btn btn-primary flex-1 h-11 border-0"
                >
                  发布首张便签
                </button>
                <button
                  type="button"
                  onClick={onCopyLink}
                  className="btn btn-ghost flex-1 h-11 border-0 sm:border-l border-t sm:border-t-0 border-[var(--c-border-soft)]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  分享
                </button>
              </div>
            </div>
          )}

          {filteredNotes.map((note, index) => (
            <StickyNoteCard
              key={note.id}
              note={note}
              index={index}
              isLocalUpvoted={upvotedNotes.includes(note.id)}
              isBeingDragged={activeDragId === note.id}
              editingNoteId={editingNoteId}
              editingText={editingText}
              setEditingText={setEditingText}
              activeMenuNoteId={activeMenuNoteId}
              setActiveMenuNoteId={setActiveMenuNoteId}
              setDeleteConfirmNoteId={setDeleteConfirmNoteId}
              onMouseDown={onNoteMouseDown}
              onTouchStart={onNoteTouchStart}
              onToggleAnswered={onToggleAnswered}
              onStartEditing={onStartEditing}
              onSaveText={onSaveText}
              onChangeColor={onChangeColor}
              onUpvote={onUpvote}
            />
          ))}
        </div>
      </div>
    </>
  );
}
