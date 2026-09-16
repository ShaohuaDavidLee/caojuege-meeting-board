/**
 * 手机竖排 —— 同一张便签，去掉画布坐标，上下排成一条能滚的纸
 */

import { Share2 } from "lucide-react";
import type { StickyNote } from "../../types";
import { stackNotes } from "../../utils/boardHelpers";
import type { NoteFilter } from "../../hooks/useBoardSession";
import { StickyNoteCard } from "./StickyNoteCard";

const FILTERS = [
  ["all", "全部"],
  ["unanswered", "未答"],
  ["answered", "已答"],
] as const;

export function BoardNoteStack({
  loading,
  notesCount,
  filteredNotes,
  filterType,
  setFilterType,
  onOpenAdd,
  onCopyLink,
  upvotedNotes,
  editingNoteId,
  editingText,
  setEditingText,
  activeMenuNoteId,
  setActiveMenuNoteId,
  setDeleteConfirmNoteId,
  onToggleAnswered,
  onStartEditing,
  onSaveText,
  onChangeColor,
  onUpvote,
}: {
  loading: boolean;
  notesCount: number;
  filteredNotes: StickyNote[];
  filterType: NoteFilter;
  setFilterType: (v: NoteFilter) => void;
  onOpenAdd: () => void;
  onCopyLink: () => void;
  upvotedNotes: string[];
  editingNoteId: string | null;
  editingText: string;
  setEditingText: (v: string) => void;
  activeMenuNoteId: string | null;
  setActiveMenuNoteId: (id: string | null) => void;
  setDeleteConfirmNoteId: (id: string | null) => void;
  onToggleAnswered: (note: StickyNote) => void;
  onStartEditing: (note: StickyNote) => void;
  onSaveText: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onUpvote: (id: string) => void;
}) {
  const stacked = stackNotes(filteredNotes);

  return (
    <div className="note-stack flex-1 flex flex-col min-h-0 min-w-0 bg-[var(--c-canvas)]">
      <div className="shrink-0 flex items-stretch border-b border-[var(--c-border-soft)] bg-[var(--c-surface)]">
        {FILTERS.map(([key, label], i) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterType(key)}
            className={`seg flex-1 h-10 text-[12px] tracking-wide ${
              i > 0 ? "border-l border-[var(--c-border-soft)]" : ""
            } ${filterType === key ? "is-on" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 flex flex-col gap-2.5">
        {notesCount === 0 && !loading && (
          <div className="panel-soft p-6">
            <p className="eyebrow">Empty · 空板</p>
            <h3 className="font-serif text-[24px] tracking-[-0.02em] mt-2 leading-tight">
              这间会议室还没有人<em className="font-serif italic">提问</em>
            </h3>
            <p className="mt-3 text-[length:var(--fs-sm)] text-[var(--c-muted)] leading-relaxed">
              点底部「提问」，落下一张便签。
            </p>
            <div className="mt-6 flex flex-col border border-[var(--c-border-soft)]">
              <button
                type="button"
                onClick={onOpenAdd}
                className="btn btn-primary flex-1 h-11 border-0"
              >
                发布首张便签
              </button>
              <button
                type="button"
                onClick={onCopyLink}
                className="btn btn-ghost flex-1 h-11 border-0 border-t border-[var(--c-border-soft)]"
              >
                <Share2 className="w-3.5 h-3.5" />
                分享
              </button>
            </div>
          </div>
        )}

        {stacked.map((note, index) => (
          <StickyNoteCard
            key={note.id}
            note={note}
            index={index}
            layout="stack"
            isLocalUpvoted={upvotedNotes.includes(note.id)}
            isBeingDragged={false}
            editingNoteId={editingNoteId}
            editingText={editingText}
            setEditingText={setEditingText}
            activeMenuNoteId={activeMenuNoteId}
            setActiveMenuNoteId={setActiveMenuNoteId}
            setDeleteConfirmNoteId={setDeleteConfirmNoteId}
            onToggleAnswered={onToggleAnswered}
            onStartEditing={onStartEditing}
            onSaveText={onSaveText}
            onChangeColor={onChangeColor}
            onUpvote={onUpvote}
          />
        ))}
      </div>

      <div className="ask-bar shrink-0 px-3 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))] border-t border-[var(--c-border-soft)] bg-[var(--c-bg)]">
        <button
          type="button"
          onClick={onOpenAdd}
          className="btn btn-primary w-full h-11 text-[15px] font-serif border-0"
        >
          +　提问
        </button>
      </div>
    </div>
  );
}
