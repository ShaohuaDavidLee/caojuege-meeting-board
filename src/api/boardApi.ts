/**
 * 白板 HTTP 客户端 —— 路径形状与本地 Express / Pages Functions 对齐
 */

import type { BoardHistoryItem, BoardState, StickyNote } from "../types";

function boardBase(room: string) {
  return `/api/board/${encodeURIComponent(room)}`;
}

async function readJson(res: Response) {
  return res.json();
}

export async function fetchBoard(room: string) {
  return readJson(await fetch(boardBase(room)));
}

export async function syncFullBoard(room: string, board: BoardState) {
  return readJson(
    await fetch(`${boardBase(room)}/sync-full`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: board.title, notes: board.notes }),
    })
  );
}

export async function updateTitle(room: string, title: string) {
  return readJson(
    await fetch(`${boardBase(room)}/title`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
  );
}

export async function createNote(
  room: string,
  payload: Partial<StickyNote> & { text: string; name: string }
) {
  return readJson(
    await fetch(`${boardBase(room)}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function updateNote(
  room: string,
  id: string,
  patch: Partial<StickyNote>
) {
  return readJson(
    await fetch(`${boardBase(room)}/note/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function deleteNote(room: string, id: string) {
  return readJson(
    await fetch(`${boardBase(room)}/note/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  );
}

export async function voteNote(room: string, id: string, increment: boolean) {
  return readJson(
    await fetch(`${boardBase(room)}/note/${encodeURIComponent(id)}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ increment }),
    })
  );
}

export async function fetchHistory(room: string) {
  return readJson(await fetch(`${boardBase(room)}/history`));
}

export async function createHistory(
  room: string,
  payload: { name: string; creator: string; kind: "auto" | "manual" }
) {
  return readJson(
    await fetch(`${boardBase(room)}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function restoreHistory(room: string, id: string) {
  return readJson(
    await fetch(`${boardBase(room)}/history/${encodeURIComponent(id)}/restore`, {
      method: "POST",
    })
  );
}

export async function deleteHistory(room: string, id: string) {
  return readJson(
    await fetch(`${boardBase(room)}/history/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  );
}

export type { BoardHistoryItem, BoardState, StickyNote };
