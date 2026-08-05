/**
 * 白板纯函数 —— 默认态判断 / 网格对齐
 */

import type { BoardState, StickyNote } from "../types";
import { DEFAULT_BOARD_TITLE, LEGACY_TITLES } from "../constants";

export function isDefaultBoardState(b: BoardState): boolean {
  if (!b || !b.notes) return true;
  if (b.notes.length !== 3) return false;
  const ids = b.notes.map((n) => n.id);
  const titleOk =
    LEGACY_TITLES.includes(b.title) || b.title === DEFAULT_BOARD_TITLE;
  return (
    ids.includes("desc-1") &&
    ids.includes("desc-2") &&
    ids.includes("desc-3") &&
    titleOk
  );
}

export function alignNotesGrid(notes: StickyNote[]): StickyNote[] {
  const sorted = [...notes].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    return b.votes - a.votes;
  });

  const COLUMNS = 3;
  const START_X = 120;
  const START_Y = 120;
  const SPACING_X = 320;
  const SPACING_Y = 220;

  return sorted.map((note, index) => {
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    return {
      ...note,
      x: START_X + col * SPACING_X,
      y: START_Y + row * SPACING_Y,
      rotate: 0,
    };
  });
}

export function shareRoomUrl(room: string): string {
  return `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
}
