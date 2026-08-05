/**
 * 画布手势 —— 平移 / 缩放 / 便签拖拽
 */

import {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import type { StickyNote } from "../types";
import * as api from "../api/boardApi";

export function useCanvasGestures(opts: {
  room: string;
  notes: StickyNote[];
  setNotes: Dispatch<SetStateAction<StickyNote[]>>;
  editingNoteId: string | null;
  setActiveMenuNoteId: (id: string | null) => void;
  onActiveDragChange: (id: string | null) => void;
  onOpenAddAt: (coords: { x: number; y: number }) => void;
}) {
  const {
    room,
    notes,
    setNotes,
    editingNoteId,
    setActiveMenuNoteId,
    onActiveDragChange,
    onOpenAddAt,
  } = opts;

  const [zoomScale, setZoomScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, noteX: 0, noteY: 0 });

  const setDrag = (id: string | null) => {
    setActiveDragId(id);
    onActiveDragChange(id);
  };

  const beginPan = (clientX: number, clientY: number, target: HTMLElement) => {
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
    setDrag(note.id);
    dragStart.current = {
      mouseX: clientX,
      mouseY: clientY,
      noteX: note.x,
      noteY: note.y,
    };
    return true;
  };

  const handleCanvasMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    beginPan(e.clientX, e.clientY, e.target as HTMLElement);
  };

  const handleCanvasTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    beginPan(t.clientX, t.clientY, e.target as HTMLElement);
  };

  const handleNoteMouseDown = (
    e: ReactMouseEvent<HTMLDivElement>,
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
    e: ReactTouchEvent<HTMLDivElement>,
    note: StickyNote
  ) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (!beginNoteDrag(t.clientX, t.clientY, e.target as HTMLElement, note)) {
      return;
    }
    e.stopPropagation();
  };

  const handleCanvasDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".sticky-note")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panOffset.x) / zoomScale;
    const clickY = (e.clientY - rect.top - panOffset.y) / zoomScale;
    onOpenAddAt({ x: clickX - 100, y: clickY - 80 });
  };

  const handleCanvasWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = 1.05;
      const nextScale =
        e.deltaY < 0
          ? Math.min(2.0, zoomScale * zoomFactor)
          : Math.max(0.3, zoomScale / zoomFactor);
      setZoomScale(parseFloat(nextScale.toFixed(2)));
    }
  };

  const resetViewport = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
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
        setDrag(null);
        if (note) {
          try {
            await api.updateNote(room, note.id, { x: note.x, y: note.y });
          } catch (err) {
            console.error("Failed to sync note coordinates: ", err);
          }
        }
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) =>
      applyPointerMove(e.clientX, e.clientY);
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

  return {
    zoomScale,
    setZoomScale,
    panOffset,
    setPanOffset,
    isPanning,
    activeDragId,
    handleCanvasMouseDown,
    handleCanvasTouchStart,
    handleCanvasDoubleClick,
    handleCanvasWheel,
    handleNoteMouseDown,
    handleNoteTouchStart,
    resetViewport,
  };
}
