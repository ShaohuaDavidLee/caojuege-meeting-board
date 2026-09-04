/**
 * 白板页 —— 组装层
 * 视觉对齐《设计规范.md》：灰度 / 发丝线 / 绝对平面 / 衬线层级
 */

import { useState } from "react";
import { useToast } from "../hooks/useToast";
import { useBoardSession } from "../hooks/useBoardSession";
import { useNoteActions } from "../hooks/useNoteActions";
import { useBoardHistory } from "../hooks/useBoardHistory";
import { useCanvasGestures } from "../hooks/useCanvasGestures";
import { useTheme } from "../hooks/useTheme";
import { FAITH_VERSE } from "../brand";
import { Toast } from "../components/board/Toast";
import { BoardNav } from "../components/board/BoardNav";
import { BoardCanvas } from "../components/board/BoardCanvas";
import { BoardSidebar } from "../components/board/BoardSidebar";
import {
  NameModal,
  AddNoteModal,
  DeleteModal,
  HistoryModal,
} from "../components/Modals";

export default function Board({
  room,
  onLeave,
}: {
  room: string;
  onLeave: () => void;
}) {
  const { notification, showToast } = useToast();
  const { isFaith } = useTheme();
  const board = useBoardSession(room, showToast);
  const noteActions = useNoteActions({
    room: board.room,
    notes: board.notes,
    setNotes: board.setNotes,
    username: board.username,
    setIsSettingName: board.setIsSettingName,
    markWrite: board.markWrite,
    refreshBoard: board.refreshBoard,
    editingNoteIdRef: board.editingNoteIdRef,
    showToast,
  });
  const [showSidebar, setShowSidebar] = useState(false);

  const history = useBoardHistory({
    room: board.room,
    username: board.username,
    lastWriteTimeRef: board.lastWriteTimeRef,
    showToast,
    onRestore: board.applyRestoredBoard,
  });

  const canvas = useCanvasGestures({
    room: board.room,
    notes: board.notes,
    setNotes: board.setNotes,
    editingNoteId: noteActions.editingNoteId,
    setActiveMenuNoteId: noteActions.setActiveMenuNoteId,
    onActiveDragChange: board.setActiveDragIdTracked,
    onOpenAddAt: (coords) => {
      noteActions.setNoteCreationCoords(coords);
      noteActions.setShowAddModal(true);
    },
  });

  return (
    <div className="relative h-dvh w-full overflow-hidden flex flex-col select-none bg-[var(--c-bg)] text-[var(--c-ink)] font-sans">
      {notification && <Toast message={notification.message} />}

      <BoardNav
        room={board.room}
        boardTitle={board.boardTitle}
        isEditingTitle={board.isEditingTitle}
        titleInput={board.titleInput}
        setTitleInput={board.setTitleInput}
        setIsEditingTitle={board.setIsEditingTitle}
        saveTitle={board.saveTitle}
        filterType={board.filterType}
        setFilterType={board.setFilterType}
        username={board.username}
        showSidebar={showSidebar}
        onLeave={onLeave}
        onEditProfile={() => {
          board.setProfileInput(board.username);
          board.setIsSettingName(true);
        }}
        onAutoAlign={noteActions.handleAutoAlign}
        onOpenHistory={history.openHistory}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        onCopyLink={board.handleCopyRoomLink}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <BoardCanvas
          loading={board.loading}
          notesCount={board.notes.length}
          filteredNotes={board.filteredNotes}
          panOffset={canvas.panOffset}
          zoomScale={canvas.zoomScale}
          setZoomScale={canvas.setZoomScale}
          setPanOffset={canvas.setPanOffset}
          isPanning={canvas.isPanning}
          filterType={board.filterType}
          setFilterType={board.setFilterType}
          newNoteColor={noteActions.newNoteColor}
          setNewNoteColor={noteActions.setNewNoteColor}
          onOpenAdd={() => {
            noteActions.setNoteCreationCoords(null);
            noteActions.setShowAddModal(true);
          }}
          onOpenAddDefault={() => {
            noteActions.setNoteCreationCoords({ x: 80, y: 120 });
            noteActions.setShowAddModal(true);
          }}
          onCopyLink={board.handleCopyRoomLink}
          onToast={(msg) => showToast(msg)}
          onCanvasMouseDown={canvas.handleCanvasMouseDown}
          onCanvasTouchStart={canvas.handleCanvasTouchStart}
          onCanvasDoubleClick={canvas.handleCanvasDoubleClick}
          onCanvasWheel={canvas.handleCanvasWheel}
          upvotedNotes={noteActions.upvotedNotes}
          activeDragId={canvas.activeDragId}
          editingNoteId={noteActions.editingNoteId}
          editingText={noteActions.editingText}
          setEditingText={noteActions.setEditingText}
          activeMenuNoteId={noteActions.activeMenuNoteId}
          setActiveMenuNoteId={noteActions.setActiveMenuNoteId}
          setDeleteConfirmNoteId={noteActions.setDeleteConfirmNoteId}
          onNoteMouseDown={canvas.handleNoteMouseDown}
          onNoteTouchStart={canvas.handleNoteTouchStart}
          onToggleAnswered={noteActions.handleToggleAnswered}
          onStartEditing={noteActions.handleStartEditingNote}
          onSaveText={noteActions.handleSaveNoteText}
          onChangeColor={noteActions.handleChangeNoteColor}
          onUpvote={noteActions.handleUpvote}
        />

        {showSidebar && (
          <BoardSidebar
            notesCount={board.notes.length}
            unansweredCount={board.unansweredCount}
            maxVotes={board.maxVotes}
            onClose={() => setShowSidebar(false)}
          />
        )}
      </div>

      {/* 礼仪皮：白板底部一行经文，压得很低，认得的人自然会心一笑 */}
      {isFaith && (
        <footer className="verse-bar shrink-0 border-t border-[var(--c-border-soft)] bg-[var(--c-bg)] px-4 h-9 flex items-center justify-center gap-3 select-text">
          <span className="pilcrow">¶</span>
          <span className="verse-line">{FAITH_VERSE.text}</span>
          <span className="verse-ref">{FAITH_VERSE.cite}</span>
        </footer>
      )}

      {board.isSettingName && (
        <NameModal
          username={board.username}
          profileInput={board.profileInput}
          setProfileInput={board.setProfileInput}
          onSave={board.handleSaveUsername}
          onCancel={() => board.setIsSettingName(false)}
        />
      )}

      {noteActions.showAddModal && (
        <AddNoteModal
          newNoteText={noteActions.newNoteText}
          setNewNoteText={noteActions.setNewNoteText}
          newNoteColor={noteActions.newNoteColor}
          setNewNoteColor={noteActions.setNewNoteColor}
          noteCreationCoords={noteActions.noteCreationCoords}
          submitterNameType={noteActions.submitterNameType}
          setSubmitterNameType={noteActions.setSubmitterNameType}
          username={board.username}
          onOpenName={() => board.setIsSettingName(true)}
          onClose={() => {
            noteActions.setShowAddModal(false);
            noteActions.setNoteCreationCoords(null);
          }}
          onSubmit={(e) =>
            noteActions.handleAddNote(e, canvas.panOffset, canvas.zoomScale)
          }
        />
      )}

      {noteActions.deleteConfirmNoteId && (
        <DeleteModal
          onCancel={() => noteActions.setDeleteConfirmNoteId(null)}
          onConfirm={async () => {
            const idToDel = noteActions.deleteConfirmNoteId;
            noteActions.setDeleteConfirmNoteId(null);
            if (idToDel) await noteActions.handleDeleteNote(idToDel);
          }}
        />
      )}

      {history.showHistoryModal && (
        <HistoryModal
          room={board.room}
          historyList={history.historyList}
          historyLoading={history.historyLoading}
          isSavingSnapshot={history.isSavingSnapshot}
          newSnapshotName={history.newSnapshotName}
          setNewSnapshotName={history.setNewSnapshotName}
          snapshotCreator={history.snapshotCreator}
          setSnapshotCreator={history.setSnapshotCreator}
          onClose={() => history.setShowHistoryModal(false)}
          onRefresh={history.fetchHistoryList}
          onCreate={history.handleCreateSnapshot}
          onRestore={history.handleRestoreSnapshot}
          onDelete={history.handleDeleteSnapshot}
        />
      )}
    </div>
  );
}
