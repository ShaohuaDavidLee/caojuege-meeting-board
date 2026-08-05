/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 草诀歌 AI Labs 会议白板 —— 编辑气质的协同提问画布
 * 视觉对齐《设计规范.md》：灰度 / 发丝线 / 绝对平面 / 衬线层级
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Share2,
  Check,
  Grid,
  ThumbsUp,
  RefreshCw,
  Layers,
  MoreHorizontal,
  History,
  Trash2,
  Pencil,
  X,
} from "lucide-react";
import { StickyNote, BoardState, BoardHistoryItem } from "./types";
import {
  POETIC_WORDS,
  NOTE_SURFACE,
  COLOR_PALETTE,
  DEFAULT_BOARD_TITLE,
  LEGACY_TITLES,
} from "./constants";
import {
  NameModal,
  RoomModal,
  AddNoteModal,
  DeleteModal,
  HistoryModal,
} from "./components/Modals";

export default function App() {
  const [room, setRoom] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get("room");
      if (roomParam) return roomParam;
    }
    return POETIC_WORDS[Math.floor(Math.random() * POETIC_WORDS.length)];
  });
  const [boardTitle, setBoardTitle] = useState<string>(DEFAULT_BOARD_TITLE);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  const [isSwitchingRoom, setIsSwitchingRoom] = useState(false);
  const [roomInput, setRoomInput] = useState("");

  const [zoomScale, setZoomScale] = useState(1.0);

  const [username, setUsername] = useState(
    () => localStorage.getItem("qa_whiteboard_user") || ""
  );
  const [isSettingName, setIsSettingName] = useState(!username);
  const [profileInput, setProfileInput] = useState(username);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteColor, setNewNoteColor] = useState<string>(NOTE_SURFACE);
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

  const isEditingTitleRef = useRef(isEditingTitle);
  useEffect(() => {
    isEditingTitleRef.current = isEditingTitle;
  }, [isEditingTitle]);

  const editingNoteIdRef = useRef(editingNoteId);
  useEffect(() => {
    editingNoteIdRef.current = editingNoteId;
  }, [editingNoteId]);

  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const lastWriteTimeRef = useRef(0);

  const [filterType, setFilterType] = useState<"all" | "unanswered" | "answered">(
    "all"
  );

  const [historyList, setHistoryList] = useState<BoardHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState("");
  const [snapshotCreator, setSnapshotCreator] = useState("");

  const [upvotedNotes, setUpvotedNotes] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("qa_whiteboard_votes") || "[]");
    } catch {
      return [];
    }
  });

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, noteX: 0, noteY: 0 });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("room") !== room) {
      const newUrl = `${window.location.origin}${window.location.pathname}?room=${room}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [room]);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 1600);
  };

  const fetchBoardState = async (roomName: string, isSilent = false) => {
    if (roomName !== roomRef.current) return;
    const fetchStartTime = Date.now();
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch(`/api/board/${roomName}`);
      const data = await res.json();

      if (roomName !== roomRef.current) return;
      if (fetchStartTime < lastWriteTimeRef.current) return;

      if (data.success && data.data) {
        let board: BoardState = data.data;

        const isDefaultState = (b: BoardState) => {
          if (!b || !b.notes) return true;
          if (b.notes.length !== 3) return false;
          const ids = b.notes.map((n) => n.id);
          return (
            ids.includes("desc-1") &&
            ids.includes("desc-2") &&
            ids.includes("desc-3") &&
            LEGACY_TITLES.includes(b.title) || b.title === DEFAULT_BOARD_TITLE
          );
        };

        const localBackupStr = localStorage.getItem(`board_backup_${roomName}`);
        if (localBackupStr && isDefaultState(board)) {
          try {
            const backupPayload = JSON.parse(localBackupStr);
            if (backupPayload?.board?.notes) {
              const backupBoard: BoardState = backupPayload.board;
              const hasCustomContent =
                backupBoard.notes.some((n) => !n.id.startsWith("desc-")) ||
                (!LEGACY_TITLES.includes(backupBoard.title) &&
                  backupBoard.title !== DEFAULT_BOARD_TITLE) ||
                backupBoard.notes.length !== 3;

              if (hasCustomContent && backupBoard.notes.length > 0) {
                const syncRes = await fetch(`/api/board/${roomName}/sync-full`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: backupBoard.title,
                    notes: backupBoard.notes,
                  }),
                });
                const syncResult = await syncRes.json();
                if (syncResult.success && syncResult.data) {
                  board = syncResult.data;
                  showToast("检测到服务重启，已从本地备份恢复会议便签", "success");
                }
              }
            }
          } catch (err) {
            console.error("Failed to restore from local backup: ", err);
          }
        }

        if (!isDefaultState(board) && board.notes.length > 0) {
          localStorage.setItem(
            `board_backup_${roomName}`,
            JSON.stringify({ board, timestamp: Date.now() })
          );
        }

        setBoardTitle(board.title);
        if (!isEditingTitleRef.current) setTitleInput(board.title);

        setNotes((prevNotes) =>
          board.notes.map((serverNote) => {
            const clientNote = prevNotes.find((n) => n.id === serverNote.id);
            if (!clientNote) return serverNote;
            const updatedNote = { ...serverNote };
            if (serverNote.id === activeDragId) {
              updatedNote.x = clientNote.x;
              updatedNote.y = clientNote.y;
            }
            if (serverNote.id === editingNoteIdRef.current) {
              updatedNote.text = clientNote.text;
              updatedNote.name = clientNote.name;
            }
            return updatedNote;
          })
        );
      }
    } catch (e) {
      console.error("Failed to load board: ", e);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleSwitchRoomTo = (newRoom: string) => {
    const trimmed = newRoom.trim();
    if (!trimmed) {
      showToast("请输入有效的房间名称", "info");
      return;
    }
    setRoom(trimmed);
    setIsSwitchingRoom(false);
    showToast(`已切换至「${trimmed}」`);
  };

  const handleCopyRoomLink = () => {
    const fullUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => showToast(`已复制「${room}」分享链接`))
      .catch(() => showToast(`复制失败，链接为：${fullUrl}`, "info"));
  };

  const handleCreateRandomPoeticRoom = () => {
    handleSwitchRoomTo(POETIC_WORDS[Math.floor(Math.random() * POETIC_WORDS.length)]);
  };

  useEffect(() => {
    if (!room) return;
    fetchBoardState(room, false);
    const interval = setInterval(() => fetchBoardState(room, true), 1500);
    return () => clearInterval(interval);
  }, [room, activeDragId, isEditingTitle, editingNoteId]);

  useEffect(() => {
    if (showHistoryModal && room) fetchHistoryList();
  }, [showHistoryModal, room]);

  const fetchHistoryList = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch(`/api/board/${room}/history`);
      const data = await res.json();
      if (data.success && data.data) setHistoryList(data.data);
    } catch (e) {
      console.error("加载历史版本失败：", e);
      showToast("加载历史版本失败", "info");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreateSnapshot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName =
      newSnapshotName.trim() || `快照_${new Date().toLocaleString("zh-CN")}`;
    const finalCreator = snapshotCreator.trim() || username || "草诀歌神秘听众";
    try {
      setIsSavingSnapshot(true);
      const res = await fetch(`/api/board/${room}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: finalName, creator: finalCreator }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("历史版本已保存");
        setNewSnapshotName("");
        setSnapshotCreator("");
        await fetchHistoryList();
      } else {
        showToast(`保存失败：${data.error || "未知错误"}`, "info");
      }
    } catch (e) {
      console.error("保存历史版本失败：", e);
      showToast("保存历史版本失败", "info");
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    try {
      setHistoryLoading(true);
      const res = await fetch(`/api/board/${room}/history/${snapshotId}/restore`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.data) {
        showToast("已恢复选定的历史版本");
        const restoredBoard: BoardState = data.data;
        setBoardTitle(restoredBoard.title);
        setTitleInput(restoredBoard.title);
        setNotes(restoredBoard.notes);
        setShowHistoryModal(false);
      } else {
        showToast(`恢复失败：${data.error || "未知错误"}`, "info");
      }
    } catch (e) {
      console.error("恢复历史版本失败：", e);
      showToast("恢复历史版本失败", "info");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    try {
      setHistoryLoading(true);
      const res = await fetch(`/api/board/${room}/history/${snapshotId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("历史版本已删除");
        await fetchHistoryList();
      } else {
        showToast(`删除失败：${data.error || "未知错误"}`, "info");
      }
    } catch (e) {
      console.error("删除历史版本失败：", e);
      showToast("删除历史版本失败", "info");
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveTitle = async () => {
    if (!titleInput.trim()) return;
    setIsEditingTitle(false);
    try {
      const res = await fetch(`/api/board/${room}/title`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setBoardTitle(titleInput.trim());
        showToast("看板标题已更新");
      }
    } catch {
      showToast("更新标题失败", "info");
    }
  };

  const handleSaveUsername = () => {
    const finalName =
      profileInput.trim() || `热心听众_${Math.floor(Math.random() * 900 + 100)}`;
    setUsername(finalName);
    setProfileInput(finalName);
    localStorage.setItem("qa_whiteboard_user", finalName);
    setIsSettingName(false);
    showToast(`你好，${finalName}`);
  };

  const handleAddNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;
    lastWriteTimeRef.current = Date.now();

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
      const res = await fetch(`/api/board/${room}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newNoteText.trim(),
          name: finalName,
          x,
          y,
          color: newNoteColor,
          rotate: 0,
        }),
      });
      const data = await res.json();
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

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".sticky-note")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panOffset.x) / zoomScale;
    const clickY = (e.clientY - rect.top - panOffset.y) / zoomScale;
    setNoteCreationCoords({ x: clickX - 100, y: clickY - 80 });
    setShowAddModal(true);
  };

  const handleDeleteNote = async (id: string) => {
    lastWriteTimeRef.current = Date.now();
    // 乐观移除，避免菜单/轮询抢状态
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      const res = await fetch(
        `/api/board/${encodeURIComponent(room)}/note/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        showToast("便签已删除", "info");
      } else {
        showToast(`删除失败：${data.error || "未知错误"}`, "info");
        fetchBoardState(room, true);
      }
    } catch {
      showToast("删除失败，请稍后重试", "info");
      fetchBoardState(room, true);
    }
  };

  const handleChangeNoteColor = async (id: string, colorHex: string) => {
    lastWriteTimeRef.current = Date.now();
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color: colorHex } : n)));
    try {
      await fetch(
        `/api/board/${encodeURIComponent(room)}/note/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ color: colorHex }),
        }
      );
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
    lastWriteTimeRef.current = Date.now();
    try {
      const res = await fetch(`/api/board/${room}/note/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingText.trim() }),
      });
      const data = await res.json();
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
    lastWriteTimeRef.current = Date.now();
    const updatedStatus = !note.answered;
    try {
      const res = await fetch(`/api/board/${room}/note/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answered: updatedStatus }),
      });
      const data = await res.json();
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
    lastWriteTimeRef.current = Date.now();
    const isUpvoted = upvotedNotes.includes(id);
    const newUpvoteState = isUpvoted
      ? upvotedNotes.filter((nId) => nId !== id)
      : [...upvotedNotes, id];

    setUpvotedNotes(newUpvoteState);
    localStorage.setItem("qa_whiteboard_votes", JSON.stringify(newUpvoteState));

    try {
      const res = await fetch(`/api/board/${room}/note/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: !isUpvoted }),
      });
      const data = await res.json();
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

  const beginPan = (clientX: number, clientY: number, target: HTMLElement) => {
    // 点在便签/控件内时绝不能先关菜单，否则「删除」的 click 会丢
    if (
      target.closest(".sticky-note") ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest(".nav-bar") ||
      target.closest(".mobile-toolbar") ||
      target.closest(".zoom-bar")
    ) {
      return false;
    }
    setActiveMenuNoteId(null);
    setIsPanning(true);
    panStart.current = { x: clientX - panOffset.x, y: clientY - panOffset.y };
    return true;
  };

  const beginNoteDrag = (
    clientX: number,
    clientY: number,
    target: HTMLElement,
    note: StickyNote
  ) => {
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest(".color-picker") ||
      editingNoteId === note.id
    ) {
      return false;
    }
    setActiveMenuNoteId(null);
    setActiveDragId(note.id);
    dragStart.current = {
      mouseX: clientX,
      mouseY: clientY,
      noteX: note.x,
      noteY: note.y,
    };
    return true;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    beginPan(e.clientX, e.clientY, e.target as HTMLElement);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    beginPan(t.clientX, t.clientY, e.target as HTMLElement);
  };

  const handleNoteMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    note: StickyNote
  ) => {
    const target = e.target as HTMLElement;
    if (!beginNoteDrag(e.clientX, e.clientY, target, note)) {
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handleNoteTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    note: StickyNote
  ) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (!beginNoteDrag(t.clientX, t.clientY, e.target as HTMLElement, note)) {
      return;
    }
    e.stopPropagation();
  };

  useEffect(() => {
    const applyPointerMove = (clientX: number, clientY: number) => {
      if (isPanning) {
        setPanOffset({
          x: clientX - panStart.current.x,
          y: clientY - panStart.current.y,
        });
      }
      if (activeDragId) {
        const deltaX = (clientX - dragStart.current.mouseX) / zoomScale;
        const deltaY = (clientY - dragStart.current.mouseY) / zoomScale;
        const nextX = dragStart.current.noteX + deltaX;
        const nextY = dragStart.current.noteY + deltaY;
        setNotes((prev) =>
          prev.map((n) => (n.id === activeDragId ? { ...n, x: nextX, y: nextY } : n))
        );
      }
    };

    const endPointer = async () => {
      if (isPanning) setIsPanning(false);
      if (activeDragId) {
        const note = notes.find((n) => n.id === activeDragId);
        setActiveDragId(null);
        if (note) {
          try {
            await fetch(
              `/api/board/${encodeURIComponent(room)}/note/${encodeURIComponent(note.id)}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x: note.x, y: note.y }),
              }
            );
          } catch (err) {
            console.error("Failed to sync note coordinates: ", err);
          }
        }
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => applyPointerMove(e.clientX, e.clientY);
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isPanning && !activeDragId) return;
      if (e.touches.length !== 1) return;
      e.preventDefault();
      applyPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", endPointer);
    window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
    window.addEventListener("touchend", endPointer);
    window.addEventListener("touchcancel", endPointer);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", endPointer);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", endPointer);
      window.removeEventListener("touchcancel", endPointer);
    };
  }, [isPanning, activeDragId, notes, room, zoomScale]);

  const handleAutoAlign = async () => {
    if (notes.length === 0) return;
    if (!window.confirm("自动排序将把便签规整为网格，是否继续？")) return;
    lastWriteTimeRef.current = Date.now();

    const curNotes = [...notes].sort((a, b) => {
      if (a.answered !== b.answered) return a.answered ? 1 : -1;
      return b.votes - a.votes;
    });

    const COLUMNS = 3;
    const START_X = 120;
    const START_Y = 120;
    const SPACING_X = 320;
    const SPACING_Y = 220;

    const alignedNotes = curNotes.map((note, index) => {
      const col = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      return {
        ...note,
        x: START_X + col * SPACING_X,
        y: START_Y + row * SPACING_Y,
        rotate: 0,
      };
    });

    setNotes(alignedNotes);
    showToast("便签已自动对齐");

    for (const note of alignedNotes) {
      try {
        await fetch(`/api/board/${room}/note/${note.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ x: note.x, y: note.y, rotate: 0 }),
        });
      } catch (err) {
        console.error(`Failed to align note ${note.id}:`, err);
      }
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (filterType === "unanswered") return !note.answered;
    if (filterType === "answered") return note.answered;
    return true;
  });

  const unansweredCount = notes.filter((n) => !n.answered).length;
  const maxVotes = notes.length > 0 ? Math.max(...notes.map((n) => n.votes)) : 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col select-none bg-[var(--c-bg)] text-[var(--c-ink)] font-sans">
      {/* Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 toast px-5 py-3 rise sm:left-1/2">
          {notification.message}
        </div>
      )}

      {/* Nav — 产品名即标题，只出现一次 */}
      <header className="nav-bar shrink-0 h-20 px-3 sm:px-4 md:px-8 flex items-center justify-between z-10 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] gap-2">
        <div className="flex items-center gap-2 sm:gap-5 min-w-0 flex-1">
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

          <button
            type="button"
            onClick={() => {
              setRoomInput(room);
              setIsSwitchingRoom(true);
            }}
            className="sm:hidden btn btn-ghost h-9 px-2.5 text-[11px] shrink-0"
            title={`雅间：${room}`}
          >
            <span className="font-serif">{room}</span>
          </button>

          <div className="hidden sm:flex items-center border border-[var(--c-border-soft)] h-9 shrink-0">
            <span className="px-2.5 text-[10px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)] border-r border-[var(--c-border-soft)]">
              Room
            </span>
            <span className="font-serif px-2.5 text-[var(--fs-sm)]" title={`当前雅间：${room}`}>
              {room}
            </span>
            <button
              type="button"
              onClick={() => {
                setRoomInput(room);
                setIsSwitchingRoom(true);
              }}
              className="btn btn-ghost h-full px-2.5 text-[11px] border-0 border-l border-[var(--c-border-soft)] rounded-none"
              title="切换雅间"
            >
              <RefreshCw className="w-3 h-3" />
              切换
            </button>
          </div>

          <div className="hidden md:flex items-stretch border border-[var(--c-border-soft)] h-9 shrink-0">
            {(
              [
                ["all", "全部"],
                ["unanswered", "未答"],
                ["answered", "已答"],
              ] as const
            ).map(([key, label], i) => (
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
            onClick={() => {
              setProfileInput(username);
              setIsSettingName(true);
            }}
            className="btn btn-ghost h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)] max-w-[72px] sm:max-w-none truncate"
            title="修改昵称"
          >
            <span className="truncate">{username || "昵称"}</span>
          </button>
          <button
            type="button"
            onClick={handleAutoAlign}
            className="hidden sm:inline-flex btn btn-ghost h-full px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)]"
            title="一键对齐"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">排序</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSnapshotCreator(username);
              setShowHistoryModal(true);
            }}
            className="btn btn-ghost h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)]"
            title="历史版本"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            className={`btn h-full px-2 sm:px-3 text-[11px] border-0 border-r border-[var(--c-border-soft)] ${
              showSidebar ? "btn-primary" : "btn-ghost"
            }`}
            title={showSidebar ? "隐藏说明" : "白板说明"}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopyRoomLink}
            className="btn btn-primary h-full px-2.5 sm:px-3.5 text-[11px] border-0 group"
            title={`分享「${room}」`}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧工具条：桌面完整 / 手机精简 */}
        <div className="mobile-toolbar absolute top-3 left-3 sm:top-4 sm:left-4 z-10 panel flex flex-col rise">
          <button
            type="button"
            onClick={() => {
              setNoteCreationCoords(null);
              setShowAddModal(true);
            }}
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
                    showToast(`已选用：${c.name}`);
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
            <RefreshCw className="w-3 h-3 text-[var(--c-muted-alt)] animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-[8px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)] leading-tight">
              Live
            </span>
          </div>
        </div>

        {/* 手机筛选条 */}
        <div className="md:hidden absolute top-3 right-3 z-10 panel flex items-stretch h-9 rise">
          {(
            [
              ["all", "全部"],
              ["unanswered", "未答"],
              ["answered", "已答"],
            ] as const
          ).map(([key, label], i) => (
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

        {/* 缩放条 */}
        <div className="zoom-bar absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 panel flex items-center text-[10px] text-[var(--c-muted)] rise rise-d1 mb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={() =>
              setZoomScale((prev) => Math.max(0.3, parseFloat((prev - 0.1).toFixed(1))))
            }
            className="btn btn-ghost h-9 w-9 sm:h-8 sm:w-8 border-0 border-r border-[var(--c-border-soft)] text-[var(--fs-sm)]"
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
            className="btn btn-ghost h-9 w-9 sm:h-8 sm:w-8 border-0 border-l border-[var(--c-border-soft)] text-[var(--fs-sm)]"
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

        {/* 画布 */}
        <div
          id="whiteboard-stage"
          onMouseDown={handleCanvasMouseDown}
          onTouchStart={handleCanvasTouchStart}
          onDoubleClick={handleCanvasDoubleClick}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const zoomFactor = 1.05;
              const nextScale =
                e.deltaY < 0
                  ? Math.min(2.0, zoomScale * zoomFactor)
                  : Math.max(0.3, zoomScale / zoomFactor);
              setZoomScale(parseFloat(nextScale.toFixed(2)));
            }
          }}
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
            {notes.length === 0 && !loading && (
              <div className="absolute left-4 top-24 sm:left-[280px] sm:top-[160px] panel-soft p-6 sm:p-10 w-[min(340px,calc(100vw-2rem))] max-w-md rise rise-d2">
                <p className="eyebrow">Empty · 空板</p>
                <h3 className="font-serif text-[24px] sm:text-[var(--fs-display-m)] tracking-[-0.02em] mt-2 leading-tight">
                  这间会议室还没有人<em className="font-serif italic">提问</em>
                </h3>
                <p className="mt-3 text-[var(--fs-sm)] text-[var(--c-muted)] leading-relaxed">
                  点击左上角「提问」，即可落下一张便签。手机上可单指拖动画布。
                </p>
                <div className="mt-6 flex flex-col sm:flex-row border border-[var(--c-border-soft)]">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteCreationCoords({ x: 80, y: 120 });
                      setShowAddModal(true);
                    }}
                    className="btn btn-primary flex-1 h-11 border-0"
                  >
                    发布首张便签
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyRoomLink}
                    className="btn btn-ghost flex-1 h-11 border-0 sm:border-l border-t sm:border-t-0 border-[var(--c-border-soft)]"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    分享
                  </button>
                </div>
              </div>
            )}

            {filteredNotes.map((note, index) => {
              const isLocalUpvoted = upvotedNotes.includes(note.id);
              const isBeingDragged = activeDragId === note.id;

              return (
                <div
                  key={note.id}
                  onMouseDown={(e) => handleNoteMouseDown(e, note)}
                  onTouchStart={(e) => handleNoteTouchStart(e, note)}
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
                      <span className="font-serif text-[var(--fs-xs)] text-[var(--c-muted-alt)] shrink-0">
                        {String((index % 99) + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[10px] tracking-[var(--ls-widest)] uppercase ${
                          note.answered
                            ? "text-[var(--c-muted-alt)]"
                            : "text-[var(--c-muted)]"
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
                          handleToggleAnswered(note);
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
                          handleStartEditingNote(note);
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
                            setActiveMenuNoteId(
                              activeMenuNoteId === note.id ? null : note.id
                            );
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
                                    onClick={() => {
                                      handleChangeNoteColor(note.id, c.value);
                                    }}
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
                    onDoubleClick={() => handleStartEditingNote(note)}
                  >
                    {editingNoteId === note.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => handleSaveNoteText(note.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveNoteText(note.id);
                            }
                          }}
                          className="field text-[var(--fs-sm)] leading-relaxed"
                          rows={4}
                          maxLength={300}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNoteText(note.id)}
                          className="btn btn-primary self-end h-8 px-3 text-[11px]"
                        >
                          保存
                        </button>
                      </div>
                    ) : (
                      <p
                        className={`font-sans text-[var(--fs-sm)] break-words whitespace-pre-wrap leading-relaxed ${
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
                      onClick={() => handleUpvote(note.id)}
                      className={`btn h-7 px-2 text-[11px] gap-1.5 ${
                        isLocalUpvoted ? "btn-primary" : "btn-ghost"
                      }`}
                      title={isLocalUpvoted ? "取消表态" : "我也有同样疑惑"}
                    >
                      <ThumbsUp
                        className={`w-3 h-3 ${isLocalUpvoted ? "fill-current" : ""}`}
                      />
                      <span>{note.votes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 侧栏：桌面贴右；手机底部浮层 */}
        {showSidebar && (
          <>
            <button
              type="button"
              aria-label="关闭说明"
              className="md:hidden fixed inset-0 z-20 bg-[rgba(26,26,26,0.45)] border-0 cursor-pointer"
              onClick={() => setShowSidebar(false)}
            />
            <aside className="fixed md:static inset-x-0 bottom-0 md:inset-auto z-30 md:z-10 w-full md:w-80 max-h-[85dvh] md:max-h-none md:h-full shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-[var(--c-border-soft)] bg-[var(--c-bg)] overflow-y-auto">
              <div className="px-6 pt-6 pb-4 border-b border-[var(--c-border-soft)] flex items-start justify-between">
                <div>
                  <p className="eyebrow">Guide · 说明</p>
                  <h2 className="font-serif text-[22px] tracking-[-0.02em] mt-1 leading-tight">
                    白板如何<em className="font-serif italic">工作</em>？
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  className="btn btn-icon"
                  title="收起"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 text-[var(--fs-sm)] text-[var(--c-muted)] leading-relaxed border-b border-[var(--c-border-soft)]">
                完全实时同步的会议收集板。开启同一链接的人，会看到你拖曳的每一次落点与每一次表态。
              </div>

              <div className="border-b border-[var(--c-border-soft)]">
                {[
                  { k: "便签总计", v: `${notes.length}` },
                  { k: "未标记解答", v: `${unansweredCount}` },
                  { k: "赞数最高", v: `${maxVotes}` },
                ].map((row, i) => (
                  <div
                    key={row.k}
                    className={`flex items-center justify-between px-6 py-3 text-[var(--fs-sm)] ${
                      i > 0 ? "border-t border-[var(--c-border-soft)]" : ""
                    }`}
                  >
                    <span className="text-[var(--c-muted-alt)]">{row.k}</span>
                    <span className="font-serif text-[var(--c-ink)]">{row.v}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 py-5 flex-1 text-[var(--fs-xs)] text-[var(--c-muted)] space-y-3">
                {[
                  "点左上角「提问」：新建便签",
                  "单指拖空白处：平移画布",
                  "点铅笔图标：编辑提问",
                  "「更多」里可改色或删除",
                ].map((tip, i) => (
                  <div key={tip} className="flex gap-3">
                    <span className="font-serif text-[var(--c-muted-alt)] shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>

              <div className="panel-dark px-6 py-5 text-[var(--fs-xs)] leading-relaxed pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                无需登录。复制链接分享给参会者，大家就能一起写入。
              </div>
            </aside>
          </>
        )}
      </div>

      {isSettingName && (
        <NameModal
          username={username}
          profileInput={profileInput}
          setProfileInput={setProfileInput}
          onSave={handleSaveUsername}
          onCancel={() => setIsSettingName(false)}
        />
      )}

      {isSwitchingRoom && (
        <RoomModal
          room={room}
          roomInput={roomInput}
          setRoomInput={setRoomInput}
          onSwitch={handleSwitchRoomTo}
          onRandom={handleCreateRandomPoeticRoom}
          onClose={() => setIsSwitchingRoom(false)}
        />
      )}

      {showAddModal && (
        <AddNoteModal
          newNoteText={newNoteText}
          setNewNoteText={setNewNoteText}
          newNoteColor={newNoteColor}
          setNewNoteColor={setNewNoteColor}
          noteCreationCoords={noteCreationCoords}
          submitterNameType={submitterNameType}
          setSubmitterNameType={setSubmitterNameType}
          username={username}
          onOpenName={() => setIsSettingName(true)}
          onClose={() => {
            setShowAddModal(false);
            setNoteCreationCoords(null);
          }}
          onSubmit={handleAddNote}
        />
      )}

      {deleteConfirmNoteId && (
        <DeleteModal
          onCancel={() => setDeleteConfirmNoteId(null)}
          onConfirm={async () => {
            const idToDel = deleteConfirmNoteId;
            setDeleteConfirmNoteId(null);
            await handleDeleteNote(idToDel);
          }}
        />
      )}

      {showHistoryModal && (
        <HistoryModal
          room={room}
          historyList={historyList}
          historyLoading={historyLoading}
          isSavingSnapshot={isSavingSnapshot}
          newSnapshotName={newSnapshotName}
          setNewSnapshotName={setNewSnapshotName}
          snapshotCreator={snapshotCreator}
          setSnapshotCreator={setSnapshotCreator}
          onClose={() => setShowHistoryModal(false)}
          onRefresh={fetchHistoryList}
          onCreate={handleCreateSnapshot}
          onRestore={handleRestoreSnapshot}
          onDelete={handleDeleteSnapshot}
        />
      )}
    </div>
  );
}
