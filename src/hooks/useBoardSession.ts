/**
 * 看板会话 —— notes / 标题 / 用户 / 轮询
 * 单一真相：notes 只在这里生长；便签动作见 useNoteActions
 */

import { useState, useEffect, useRef } from "react";
import type { BoardState, StickyNote } from "../types";
import {
  DEFAULT_BOARD_TITLE,
  DEFAULT_ROOM,
  LEGACY_TITLES,
} from "../constants";
import * as api from "../api/boardApi";
import { isDefaultBoardState, shareRoomUrl } from "../utils/boardHelpers";
import type { ToastType } from "./useToast";

export type NoteFilter = "all" | "unanswered" | "answered";

type ShowToast = (message: string, type?: ToastType) => void;

export function useBoardSession(showToast: ShowToast) {
  const room = DEFAULT_ROOM;

  const [boardTitle, setBoardTitle] = useState(DEFAULT_BOARD_TITLE);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState(
    () => localStorage.getItem("qa_whiteboard_user") || ""
  );
  const [isSettingName, setIsSettingName] = useState(!username);
  const [profileInput, setProfileInput] = useState(username);

  const [filterType, setFilterType] = useState<NoteFilter>("all");

  const isEditingTitleRef = useRef(isEditingTitle);
  useEffect(() => {
    isEditingTitleRef.current = isEditingTitle;
  }, [isEditingTitle]);

  /** 由 useNoteActions 写入；轮询合并时读取，避免编辑中被服务端覆盖 */
  const editingNoteIdRef = useRef<string | null>(null);
  const roomRef = useRef(room);
  const lastWriteTimeRef = useRef(0);
  const activeDragIdRef = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("room") !== DEFAULT_ROOM) {
      const newUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(DEFAULT_ROOM)}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, []);

  const markWrite = () => {
    lastWriteTimeRef.current = Date.now();
  };

  const fetchBoardState = async (
    roomName: string,
    isSilent = false,
    activeDragId: string | null = activeDragIdRef.current
  ) => {
    if (roomName !== roomRef.current) return;
    const fetchStartTime = Date.now();
    try {
      if (!isSilent) setLoading(true);
      const data = await api.fetchBoard(roomName);
      if (roomName !== roomRef.current) return;
      if (fetchStartTime < lastWriteTimeRef.current) return;

      if (data.success && data.data) {
        let board: BoardState = data.data;

        const localBackupStr = localStorage.getItem(`board_backup_${roomName}`);
        if (localBackupStr && isDefaultBoardState(board)) {
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
                const syncResult = await api.syncFullBoard(roomName, backupBoard);
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

        if (!isDefaultBoardState(board) && board.notes.length > 0) {
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

  const setActiveDragIdTracked = (id: string | null) => {
    activeDragIdRef.current = id;
  };

  const refreshBoard = () => {
    void fetchBoardState(room, true);
  };

  useEffect(() => {
    fetchBoardState(room, false);
    const interval = setInterval(
      () => fetchBoardState(room, true, activeDragIdRef.current),
      1500
    );
    return () => clearInterval(interval);
    // 轮询读 ref，不因编辑态重启计时器
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyRoomLink = () => {
    const fullUrl = shareRoomUrl(DEFAULT_ROOM);
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => showToast("已复制分享链接"))
      .catch(() => showToast(`复制失败，链接为：${fullUrl}`, "info"));
  };

  const saveTitle = async () => {
    if (!titleInput.trim()) return;
    setIsEditingTitle(false);
    try {
      const data = await api.updateTitle(room, titleInput.trim());
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

  const applyRestoredBoard = (board: BoardState) => {
    setBoardTitle(board.title);
    setTitleInput(board.title);
    setNotes(board.notes);
  };

  const filteredNotes = notes.filter((note) => {
    if (filterType === "unanswered") return !note.answered;
    if (filterType === "answered") return note.answered;
    return true;
  });

  const unansweredCount = notes.filter((n) => !n.answered).length;
  const maxVotes = notes.length > 0 ? Math.max(...notes.map((n) => n.votes)) : 0;

  return {
    room,
    boardTitle,
    isEditingTitle,
    setIsEditingTitle,
    titleInput,
    setTitleInput,
    saveTitle,
    notes,
    setNotes,
    loading,
    username,
    isSettingName,
    setIsSettingName,
    profileInput,
    setProfileInput,
    handleSaveUsername,
    handleCopyRoomLink,
    filterType,
    setFilterType,
    filteredNotes,
    unansweredCount,
    maxVotes,
    lastWriteTimeRef,
    editingNoteIdRef,
    setActiveDragIdTracked,
    applyRestoredBoard,
    markWrite,
    refreshBoard,
  };
}
