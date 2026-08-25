/**
 * 最近去过的房间 —— 只存在本机，方便回到自己开过的那一间
 */

import { canonicalRoomName } from "./boardHelpers";

const STORAGE_KEY = "caojuege_recent_rooms";
const MAX_RECENT = 6;

export function readRecentRooms(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .filter((item): item is string => typeof item === "string")
      .map(canonicalRoomName)
      .filter(Boolean)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function rememberRoom(room: string): void {
  const name = canonicalRoomName(room);
  if (!name) return;
  try {
    const next = [name, ...readRecentRooms().filter((r) => r !== name)].slice(
      0,
      MAX_RECENT
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 隐私模式下写不进去就算了，不影响进房
  }
}
