/**
 * Cloudflare Pages Function —— /api/*
 * 绑定 D1: BOARD_DB（热状态）；KV: BOARD_KV（旧数据认领）
 */

import {
  loadRoom,
  saveRoom,
  setTitle,
  insertNote,
  patchNote,
  voteNote,
  deleteNote,
  clearAnswered,
  loadHistory,
  saveHistory,
  pruneHistory,
  isRoomNameValid,
  json,
  type StickyNote,
  type BoardHistoryItem,
} from "../_lib/board";

interface Env {
  BOARD_DB: D1Database;
  BOARD_KV?: KVNamespace;
}

interface PagesContext {
  request: Request;
  env: Env;
  params: { path?: string | string[] };
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function onRequestOptions(): Promise<Response> {
  return json({ ok: true });
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env, params } = context;
  const db = env.BOARD_DB;
  const kv = env.BOARD_KV;

  if (!db) {
    return json(
      {
        success: false,
        error: "BOARD_DB 未绑定。请在 Cloudflare 项目设置中绑定 D1 数据库。",
      },
      500
    );
  }

  const segments = Array.isArray(params.path)
    ? params.path
    : params.path
      ? [params.path]
      : [];

  if (segments[0] !== "board" || !segments[1]) {
    return json({ success: false, error: "Not found" }, 404);
  }

  const room = decodeURIComponent(segments[1]);
  if (!isRoomNameValid(room)) {
    return json({ success: false, error: "房间名不合法" }, 400);
  }

  const method = request.method.toUpperCase();
  const rest = segments.slice(2);

  try {
    if (rest.length === 0 && method === "GET") {
      const state = await loadRoom(db, room, kv);
      return json({ success: true, data: state });
    }

    if (rest[0] === "title" && method === "PUT") {
      const body = await readBody(request);
      if (typeof body.title !== "string") {
        return json({ success: false, error: "Invalid title" }, 400);
      }
      await loadRoom(db, room, kv);
      const state = await setTitle(db, room, body.title);
      return json({ success: true, data: state });
    }

    if (rest[0] === "sync-full" && method === "PUT") {
      const body = await readBody(request);
      if (typeof body.title !== "string" || !Array.isArray(body.notes)) {
        return json({ success: false, error: "Invalid board state payload" }, 400);
      }
      await loadRoom(db, room, kv);
      const state = { title: body.title, notes: body.notes as StickyNote[] };
      await saveRoom(db, room, state);
      return json({ success: true, data: state });
    }

    if (rest[0] === "clear-answered" && method === "POST") {
      await loadRoom(db, room, kv);
      const state = await clearAnswered(db, room);
      return json({ success: true, data: state });
    }

    if (rest[0] === "note" && rest.length === 1 && method === "POST") {
      const body = await readBody(request);
      if (!body.text) {
        return json({ success: false, error: "Text is required" }, 400);
      }
      await loadRoom(db, room, kv);
      const newNote: StickyNote = {
        id: "note_" + Math.random().toString(36).substring(2, 11),
        text: String(body.text).trim(),
        name: String(body.name || "匿名").trim() || "匿名",
        votes: 0,
        answered: false,
        x: typeof body.x === "number" ? body.x : 100,
        y: typeof body.y === "number" ? body.y : 100,
        color: String(body.color || "#ffffff"),
        rotate: typeof body.rotate === "number" ? body.rotate : 0,
        createdAt: new Date().toISOString(),
      };
      await insertNote(db, room, newNote);
      return json({ success: true, data: newNote });
    }

    if (rest[0] === "note" && rest[1] && rest.length === 2 && method === "PUT") {
      const id = rest[1];
      const body = await readBody(request);
      await loadRoom(db, room, kv);
      const note = await patchNote(db, room, id, {
        text: body.text !== undefined ? String(body.text) : undefined,
        name: body.name !== undefined ? String(body.name) : undefined,
        answered: body.answered !== undefined ? Boolean(body.answered) : undefined,
        x: typeof body.x === "number" ? body.x : undefined,
        y: typeof body.y === "number" ? body.y : undefined,
        color: body.color !== undefined ? String(body.color) : undefined,
        votes: typeof body.votes === "number" ? body.votes : undefined,
      });
      if (!note) return json({ success: false, error: "Note not found" }, 404);
      return json({ success: true, data: note });
    }

    if (
      rest[0] === "note" &&
      rest[1] &&
      rest[2] === "vote" &&
      method === "POST"
    ) {
      const id = rest[1];
      const body = await readBody(request);
      await loadRoom(db, room, kv);
      const note = await voteNote(
        db,
        room,
        id,
        body.increment === false ? -1 : 1
      );
      if (!note) return json({ success: false, error: "Note not found" }, 404);
      return json({ success: true, data: note });
    }

    if (rest[0] === "note" && rest[1] && rest.length === 2 && method === "DELETE") {
      const id = rest[1];
      await loadRoom(db, room, kv);
      const ok = await deleteNote(db, room, id);
      if (!ok) return json({ success: false, error: "Note not found" }, 404);
      return json({ success: true });
    }

    if (rest[0] === "history" && rest.length === 1 && method === "GET") {
      const history = await loadHistory(db, room, kv);
      return json({ success: true, data: history });
    }

    if (rest[0] === "history" && rest.length === 1 && method === "POST") {
      const body = await readBody(request);
      const state = await loadRoom(db, room, kv);
      const history = await loadHistory(db, room, kv);
      const kind = body.kind === "auto" ? "auto" : "manual";
      const newItem: BoardHistoryItem = {
        id: "hist_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
        timestamp: new Date().toISOString(),
        name: String(body.name || "未命名版本").trim(),
        creator: String(body.creator || "匿名").trim(),
        notesCount: state.notes.length,
        board: JSON.parse(JSON.stringify(state)),
        kind,
      };
      history.unshift(newItem);
      await saveHistory(db, room, pruneHistory(history));
      return json({ success: true, data: newItem });
    }

    if (
      rest[0] === "history" &&
      rest[1] &&
      rest[2] === "restore" &&
      method === "POST"
    ) {
      const id = rest[1];
      const history = await loadHistory(db, room, kv);
      const version = history.find((item) => item.id === id);
      if (!version) {
        return json({ success: false, error: "History version not found" }, 404);
      }
      const state = JSON.parse(JSON.stringify(version.board)) as {
        title: string;
        notes: StickyNote[];
      };
      await saveRoom(db, room, state);
      return json({ success: true, data: state });
    }

    if (rest[0] === "history" && rest[1] && rest.length === 2 && method === "DELETE") {
      const id = rest[1];
      const history = await loadHistory(db, room, kv);
      const next = history.filter((item) => item.id !== id);
      if (next.length === history.length) {
        return json({ success: false, error: "History version not found" }, 404);
      }
      await saveHistory(db, room, next);
      return json({ success: true });
    }

    return json({ success: false, error: "Not found" }, 404);
  } catch (err) {
    console.error("API error:", err);
    return json({ success: false, error: "Internal error" }, 500);
  }
}
