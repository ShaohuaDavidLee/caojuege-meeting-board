/**
 * 历史归档 —— 手动打包 + 有改动时自动存档
 */

import { useState, useEffect, useRef, FormEvent, MutableRefObject } from "react";
import type { BoardHistoryItem, BoardState } from "../types";
import { AUTO_SNAPSHOT_INTERVAL_MS } from "../constants";
import * as api from "../api/boardApi";
import { useBrand } from "../brand";
import type { ToastType } from "./useToast";

type ShowToast = (message: string, type?: ToastType) => void;

export function useBoardHistory(opts: {
  room: string;
  username: string;
  lastWriteTimeRef: MutableRefObject<number>;
  showToast: ShowToast;
  onRestore: (board: BoardState) => void;
}) {
  const { room, username, lastWriteTimeRef, showToast, onRestore } = opts;

  const brand = useBrand();

  const [historyList, setHistoryList] = useState<BoardHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState("");
  const [snapshotCreator, setSnapshotCreator] = useState("");

  const lastAutoSnapshotAtRef = useRef(Date.now());
  const autoSnapshotInFlightRef = useRef(false);

  const fetchHistoryList = async () => {
    try {
      setHistoryLoading(true);
      const data = await api.fetchHistory(room);
      if (data.success && data.data) setHistoryList(data.data);
    } catch (e) {
      console.error("加载历史版本失败：", e);
      showToast("加载历史版本失败", "info");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (showHistoryModal) fetchHistoryList();
  }, [showHistoryModal]);

  useEffect(() => {
    const tick = setInterval(async () => {
      if (autoSnapshotInFlightRef.current) return;
      if (lastWriteTimeRef.current <= lastAutoSnapshotAtRef.current) return;
      autoSnapshotInFlightRef.current = true;
      try {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const data = await api.createHistory(room, {
          name: `自动存档 · ${hh}:${mm}`,
          creator: "系统",
          kind: "auto",
        });
        if (data.success) lastAutoSnapshotAtRef.current = Date.now();
      } catch (e) {
        console.error("自动存档失败：", e);
      } finally {
        autoSnapshotInFlightRef.current = false;
      }
    }, AUTO_SNAPSHOT_INTERVAL_MS);
    return () => clearInterval(tick);
  }, [room, lastWriteTimeRef]);

  const handleCreateSnapshot = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const finalName =
      newSnapshotName.trim() || `快照_${new Date().toLocaleString("zh-CN")}`;
    const finalCreator = snapshotCreator.trim() || username || brand.anonName;
    try {
      setIsSavingSnapshot(true);
      const data = await api.createHistory(room, {
        name: finalName,
        creator: finalCreator,
        kind: "manual",
      });
      if (data.success) {
        showToast("历史版本已保存");
        setNewSnapshotName("");
        setSnapshotCreator("");
        lastAutoSnapshotAtRef.current = Date.now();
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
      const data = await api.restoreHistory(room, snapshotId);
      if (data.success && data.data) {
        showToast("已恢复选定的历史版本");
        onRestore(data.data as BoardState);
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
      const data = await api.deleteHistory(room, snapshotId);
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

  const openHistory = () => {
    setSnapshotCreator(username);
    setShowHistoryModal(true);
  };

  return {
    historyList,
    showHistoryModal,
    setShowHistoryModal,
    historyLoading,
    isSavingSnapshot,
    newSnapshotName,
    setNewSnapshotName,
    snapshotCreator,
    setSnapshotCreator,
    fetchHistoryList,
    handleCreateSnapshot,
    handleRestoreSnapshot,
    handleDeleteSnapshot,
    openHistory,
  };
}
