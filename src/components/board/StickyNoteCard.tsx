/**
 * 单张便签 —— 编辑 / 改色 / 投票 / 删除入口
 */

import type { MouseEvent, TouchEvent } from "react";
import {
  Check,
  MoreHorizontal,
  Pencil,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import type { StickyNote } from "../../types";
import { COLOR_PALETTE, NOTE_SURFACE } from "../../constants";

export interface StickyNoteCardProps {
  note: StickyNote;
  index: number;
  isLocalUpvoted: boolean;
  isBeingDragged: boolean;
  editingNoteId: string | null;
  editingText: string;
  setEditingText: (v: string) => void;
  activeMenuNoteId: string | null;
  setActiveMenuNoteId: (id: string | null) => void;
  setDeleteConfirmNoteId: (id: string | null) => void;
  onMouseDown: (e: MouseEvent<HTMLDivElement>, note: StickyNote) => void;
  onTouchStart: (e: TouchEvent<HTMLDivElement>, note: StickyNote) => void;
  onToggleAnswered: (note: StickyNote) => void;
  onStartEditing: (note: StickyNote) => void;
  onSaveText: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onUpvote: (id: string) => void;
}

export function StickyNoteCard({
  note,
  index,
  isLocalUpvoted,
  isBeingDragged,
  editingNoteId,
  editingText,
  setEditingText,
  activeMenuNoteId,
  setActiveMenuNoteId,
  setDeleteConfirmNoteId,
  onMouseDown,
  onTouchStart,
  onToggleAnswered,
  onStartEditing,
  onSaveText,
  onChangeColor,
  onUpvote,
}: StickyNoteCardProps) {
  return (
    <div
      onMouseDown={(e) => onMouseDown(e, note)}
      onTouchStart={(e) => onTouchStart(e, note)}
      className={`absolute sticky-note w-[280px] min-h-[168px] p-0 flex flex-col cursor-move ${
        note.answered ? "is-answered" : ""
      } ${isBeingDragged ? "is-dragging" : ""}`}
      style={{
        left: `${note.x}px`,
        top: `${note.y}px`,
        backgroundColor: note.color || NOTE_SURFACE,
        transition: isBeingDragged
          ? "none"
          : "left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--c-border-soft)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-serif text-[length:var(--fs-xs)] text-[var(--c-muted-alt)] shrink-0">
            {String((index % 99) + 1).padStart(2, "0")}
          </span>
          <span
            className={`text-[10px] tracking-[var(--ls-widest)] uppercase ${
              note.answered ? "text-[var(--c-muted-alt)]" : "text-[var(--c-muted)]"
            }`}
          >
            {note.answered ? "Answered" : "Open"}
          </span>
        </div>
        <div className="flex items-center gap-0 border border-[var(--c-border-soft)] bg-[var(--c-surface)]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAnswered(note);
            }}
            className={`btn h-7 w-7 border-0 p-0 ${
              note.answered ? "btn-primary" : "btn-ghost"
            }`}
            title={note.answered ? "恢复为未回答" : "标记为已回答"}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEditing(note);
              setActiveMenuNoteId(null);
            }}
            className="btn btn-ghost h-7 w-7 border-0 border-l border-[var(--c-border-soft)] p-0"
            title="编辑内容"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <div className="relative border-l border-[var(--c-border-soft)]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuNoteId(activeMenuNoteId === note.id ? null : note.id);
              }}
              className="btn btn-ghost h-7 w-7 border-0 p-0"
              title="更多"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {activeMenuNoteId === note.id && (
              <div
                className="color-picker absolute right-0 top-full mt-0 panel z-50 min-w-[148px]"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 pt-2.5 pb-2 border-b border-[var(--c-border-soft)]">
                  <p className="text-[9px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)] mb-1.5">
                    Color · 底色
                  </p>
                  <div className="flex items-center gap-1">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => onChangeColor(note.id, c.value)}
                        className={`w-4 h-4 border ${
                          (note.color || NOTE_SURFACE) === c.value
                            ? "border-[var(--c-ink)]"
                            : "border-[var(--c-border-soft)]"
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmNoteId(note.id);
                    setActiveMenuNoteId(null);
                  }}
                  className="w-full text-left px-2.5 py-2 text-[11px] text-[var(--c-muted)] hover:bg-[var(--c-bg)] hover:text-[var(--c-ink)] transition-colors duration-300 flex items-center gap-1.5 bg-transparent border-0 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 shrink-0" />
                  删除便签
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="px-3.5 py-3.5 flex-1 flex flex-col justify-center min-h-[72px]"
        onDoubleClick={() => onStartEditing(note)}
      >
        {editingNoteId === note.id ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={() => onSaveText(note.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSaveText(note.id);
                }
              }}
              className="field text-[length:var(--fs-sm)] leading-relaxed"
              rows={4}
              maxLength={300}
              autoFocus
            />
            <button
              type="button"
              onClick={() => onSaveText(note.id)}
              className="btn btn-primary self-end h-8 px-3 text-[11px]"
            >
              保存
            </button>
          </div>
        ) : (
          <p
            className={`font-sans text-[length:var(--fs-sm)] break-words whitespace-pre-wrap leading-relaxed ${
              note.answered
                ? "line-through text-[var(--c-muted)]"
                : "text-[var(--c-ink)]"
            }`}
            title="双击编辑"
          >
            {note.text}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[var(--c-border-soft)] text-[11px]">
        <div className="truncate text-[var(--c-muted-alt)]">
          <span className="mr-1">By</span>
          <span className="font-serif text-[var(--c-ink)]">{note.name}</span>
        </div>
        <button
          type="button"
          onClick={() => onUpvote(note.id)}
          className={`btn h-7 px-2 text-[11px] gap-1.5 ${
            isLocalUpvoted ? "btn-primary" : "btn-ghost"
          }`}
          title={isLocalUpvoted ? "取消表态" : "我也有同样疑惑"}
        >
          <ThumbsUp className={`w-3 h-3 ${isLocalUpvoted ? "fill-current" : ""}`} />
          <span>{note.votes}</span>
        </button>
      </div>
    </div>
  );
}
