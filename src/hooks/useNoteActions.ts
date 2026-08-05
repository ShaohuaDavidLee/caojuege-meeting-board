/**
 * 便签操作 —— 新建 / 编辑 / 改色 / 投票 / 删除 / 对齐
 * notes 真相源仍在 useBoardSession，这里只长「动作」
 */

import {
  useState,
  useEffect,
  type Dispatch,
  type FormEvent,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { StickyNote } from "../types";
import { NOTE_SURFACE } from "../constants";
import * as api from "../api/boardApi";
import { alignNotesGrid } from "../utils/boardHelpers";
import type { ToastType } from "./useToast";

type ShowToast = (message: string, type?: ToastType) => void;

export function useNoteActions(opts: {
  room: string;
  notes: StickyNote[];
  setNotes: Dispatch<SetStateAction<StickyNote[]>>;
  username: string;
  setIsSettingName: (v: boolean) => void;
  markWrite: () => void;
  refreshBoard: () => void;
  editingNoteIdRef: MutableRefObject<string | null>;
  showToast: ShowToast;
}) {
  const {
    room,
    notes,
    setNotes,
    username,
    setIsSettingName,
    markWrite,
    refreshBoard,
    editingNoteIdRef,
    showToast,
  } = opts;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteColor, setNewNoteColor] = useState(NOTE_SURFACE);
  const [noteCreationCoords, setNoteCreationCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [submitterNameType, setSubmitterNameType] = useState<"self" | "anonymous">(
    "self"
  );

  const [activeMenuNoteId, setActiveMenuNoteId] = useState<string | null>(null);
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState<string | null>(
    null
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const [upvotedNotes, setUpvotedNotes] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("qa_whiteboard_votes") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    editingNoteIdRef.current = editingNoteId;
  }, [editingNoteId, editingNoteIdRef]);

  const handleAddNote = async (
    e: FormEvent | undefined,
    panOffset: { x: number; y: number },
    zoomScale: number
  ) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;
    markWrite();

    const finalName =
      submitterNameType === "anonymous" ? "草诀歌神秘听众" : username;
    if (!finalName) {
      setIsSettingName(true);
      showToast("请先填入你的名字", "info");
      return;
    }

    const x = noteCreationCoords
      ? noteCreationCoords.x
      : (400 - panOffset.x) / zoomScale;
    const y = noteCreationCoords
      ? noteCreationCoords.y
      : (250 - panOffset.y) / zoomScale;

    try {
      const data = await api.createNote(room, {
        text: newNoteText.trim(),
        name: finalName,
        x,
        y,
        color: newNoteColor,
        rotate: 0,
      });
      if (data.success) {
        setNotes((prev) => [...prev, data.data]);
        setNewNoteText("");
        setShowAddModal(false);
        setNoteCreationCoords(null);
        showToast("提问已发表");
      }
    } catch {
      showToast("提问失败，请重试", "info");
    }
  };

  const handleDeleteNote = async (id: string) => {
    markWrite();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      const data = await api.deleteNote(room, id);
      if (data.success) {
        showToast("便签已删除", "info");
      } else {
        showToast(`删除失败：${data.error || "未知错误"}`, "info");
        refreshBoard();
      }
    } catch {
      showToast("删除失败，请稍后重试", "info");
      refreshBoard();
    }
  };

  const handleChangeNoteColor = async (id: string, colorHex: string) => {
    markWrite();
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color: colorHex } : n)));
    try {
      await api.updateNote(room, id, { color: colorHex });
    } catch {
      showToast("更新颜色失败", "info");
    }
  };

  const handleStartEditingNote = (note: StickyNote) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const handleSaveNoteText = async (id: string) => {
    if (!editingText.trim()) return;
    markWrite();
    try {
      const data = await api.updateNote(room, id, { text: editingText.trim() });
      if (data.success) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, text: editingText.trim() } : n))
        );
        setEditingNoteId(null);
        showToast("内容已更新");
      }
    } catch {
      showToast("更新失败", "info");
    }
  };

  const handleToggleAnswered = async (note: StickyNote) => {
    markWrite();
    const updatedStatus = !note.answered;
    try {
      const data = await api.updateNote(room, note.id, { answered: updatedStatus });
      if (data.success) {
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, answered: updatedStatus } : n))
        );
        showToast(updatedStatus ? "已标记为已回答" : "已恢复为未回答");
      }
    } catch {
      showToast("操作失败", "info");
    }
  };

  const handleUpvote = async (id: string) => {
    markWrite();
    const isUpvoted = upvotedNotes.includes(id);
    const newUpvoteState = isUpvoted
      ? upvotedNotes.filter((nId) => nId !== id)
      : [...upvotedNotes, id];

    setUpvotedNotes(newUpvoteState);
    localStorage.setItem("qa_whiteboard_votes", JSON.stringify(newUpvoteState));

    try {
      const data = await api.voteNote(room, id, !isUpvoted);
      if (data.success && data.data) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, votes: data.data.votes } : n))
        );
        showToast(!isUpvoted ? "已表态" : "已取消表态");
      }
    } catch {
      setUpvotedNotes(upvotedNotes);
      localStorage.setItem("qa_whiteboard_votes", JSON.stringify(upvotedNotes));
      showToast("投票超时", "info");
    }
  };

  const handleAutoAlign = async () => {
    if (notes.length === 0) return;
    if (!window.confirm("自动排序将把便签规整为网格，是否继续？")) return;
    markWrite();
    const alignedNotes = alignNotesGrid(notes);
    setNotes(alignedNotes);
    showToast("便签已自动对齐");
    for (const note of alignedNotes) {
      try {
        await api.updateNote(room, note.id, { x: note.x, y: note.y, rotate: 0 });
      } catch (err) {
        console.error(`Failed to align note ${note.id}:`, err);
      }
    }
  };

  return {
    showAddModal,
    setShowAddModal,
    newNoteText,
    setNewNoteText,
    newNoteColor,
    setNewNoteColor,
    noteCreationCoords,
    setNoteCreationCoords,
    submitterNameType,
    setSubmitterNameType,
    handleAddNote,
    activeMenuNoteId,
    setActiveMenuNoteId,
    deleteConfirmNoteId,
    setDeleteConfirmNoteId,
    editingNoteId,
    editingText,
    setEditingText,
    handleStartEditingNote,
    handleSaveNoteText,
    handleDeleteNote,
    handleChangeNoteColor,
    handleToggleAnswered,
    handleUpvote,
    handleAutoAlign,
    upvotedNotes,
  };
}
