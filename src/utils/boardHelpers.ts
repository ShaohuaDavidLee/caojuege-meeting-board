/**
 * 白板纯函数 —— 名称归一 / 默认态判断 / 网格对齐 / 分享链
 */

import type { BoardState, StickyNote } from "../types";
import {
  DEFAULT_BOARD_TITLE,
  DEFAULT_ROOM,
  LEGACY_ROOM_ALIASES,
  LEGACY_TITLES,
  MAX_ROOM_NAME_LENGTH,
} from "../constants";

/** 去首尾空白、把连续空白压成一个空格、截到上限 */
export function normalizeRoomName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_ROOM_NAME_LENGTH);
}

/** 旧名与「草诀歌AI Labs」这类少空格写法，一律归到主会议间 */
export function canonicalRoomName(raw: string): string {
  const name = normalizeRoomName(raw);
  if (!name) return "";
  const flat = name.replace(/\s+/g, "").toLowerCase();
  const isAlias = LEGACY_ROOM_ALIASES.some(
    (alias) => alias.replace(/\s+/g, "").toLowerCase() === flat
  );
  return isAlias ? DEFAULT_ROOM : name;
}

export function isDefaultRoom(room: string): boolean {
  return canonicalRoomName(room) === DEFAULT_ROOM;
}

export function isDefaultBoardState(
  b: BoardState,
  extraDefaultTitles: string[] = []
): boolean {
  if (!b || !b.notes) return true;
  if (b.notes.length !== 3) return false;
  const ids = b.notes.map((n) => n.id);
  const titleOk =
    LEGACY_TITLES.includes(b.title) ||
    b.title === DEFAULT_BOARD_TITLE ||
    extraDefaultTitles.includes(b.title);
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

export function roomPath(room: string): string {
  return `${window.location.pathname}?room=${encodeURIComponent(room)}`;
}

export function shareRoomUrl(room: string): string {
  return `${window.location.origin}${roomPath(room)}`;
}

/** 给人念的地址：地址栏本来就显示解码后的样子，别把百分号编码摆到页面上 */
export function readableRoomUrl(room: string): string {
  return `${window.location.origin}${window.location.pathname}?room=${room}`;
}
