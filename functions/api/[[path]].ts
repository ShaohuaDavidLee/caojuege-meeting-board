/**
 * Cloudflare Pages Function —— /api/*
 * 绑定 KV: BOARD_KV
 */

import {
  loadRoom,
  saveRoom,
  loadHistory,
  saveHistory,
  json,
  type StickyNote,
  type BoardHistoryItem,
} from "../_lib/board";

interface Env {
  BOARD_KV: KVNamespace;
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
  const kv = env.BOARD_KV;

  if (!kv) {
    return json(
      {
        success: false,
        error: "BOARD_KV 未绑定。请在 Cloudflare 项目设置中绑定 KV namespace。",
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
  const method = request.method.toUpperCase();
  const rest = segments.slice(2);

  try {
    if (rest.length === 0 && method === "GET") {
      const state = await loadRoom(kv, room);
      return json({ success: true, data: state });
    }

    if (rest[0] === "title" && method === "PUT") {
      const body = await readBody(request);
      if (typeof body.title !== "string") {
        return json({ success: false, error: "Invalid title" }, 400);
      }
      const state = await loadRoom(kv, room);
      state.title = body.title;
      await saveRoom(kv, room, state);
      return json({ success: true, data: state });
    }

    if (rest[0] === "sync-full" && method === "PUT") {
      const body = await readBody(request);
      if (typeof body.title !== "string" || !Array.isArray(body.notes)) {
        return json({ success: false, error: "Invalid board state payload" }, 400);
      }
      const state = await loadRoom(kv, room);
      state.title = body.title;
      state.notes = body.notes as StickyNote[];
      await saveRoom(kv, room, state);
      return json({ success: true, data: state });
    }

    if (rest[0] === "clear-answered" && method === "POST") {
      const state = await loadRoom(kv, room);
      state.notes = state.notes.filter((n) => !n.answered);
      await saveRoom(kv, room, state);
      return json({ success: true, data: state });
    }

    if (rest[0] === "note" && rest.length === 1 && method === "POST") {
      const body = await readBody(request);
      if (!body.text) {
        return json({ success: false, error: "Text is required" }, 400);
      }
      const state = await loadRoom(kv, room);
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
      state.notes.push(newNote);
      await saveRoom(kv, room, state);
      return json({ success: true, data: newNote });
    }

    if (rest[0] === "note" && rest[1] && rest.length === 2 && method === "PUT") {
      const id = rest[1];
      const body = await readBody(request);
      const state = await loadRoom(kv, room);
      const note = state.notes.find((n) => n.id === id);
      if (!note) return json({ success: false, error: "Note not found" }, 404);

      if (body.text !== undefined) note.text = String(body.text);
      if (body.name !== undefined)
        note.name = String(body.name || "匿名").trim() || "匿名";
      if (body.answered !== undefined) note.answered = Boolean(body.answered);
      if (typeof body.x === "number") note.x = Math.round(body.x);
      if (typeof body.y === "number") note.y = Math.round(body.y);
      if (body.color !== undefined) note.color = String(body.color);
      if (typeof body.votes === "number") note.votes = body.votes;

      await saveRoom(kv, room, state);
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
      const state = await loadRoom(kv, room);
      const note = state.notes.find((n) => n.id === id);
      if (!note) return json({ success: false, error: "Note not found" }, 404);
      const delta = body.increment === false ? -1 : 1;
      note.votes = Math.max(0, note.votes + delta);
      await saveRoom(kv, room, state);
      return json({ success: true, data: note });
    }

    if (rest[0] === "note" && rest[1] && rest.length === 2 && method === "DELETE") {
      const id = rest[1];
      const state = await loadRoom(kv, room);
      const idx = state.notes.findIndex((n) => n.id === id);
      if (idx === -1) return json({ success: false, error: "Note not found" }, 404);
      state.notes.splice(idx, 1);
      await saveRoom(kv, room, state);
      return json({ success: true });
    }

    if (rest[0] === "history" && rest.length === 1 && method === "GET") {
      const history = await loadHistory(kv, room);
      return json({ success: true, data: history });
    }

    if (rest[0] === "history" && rest.length === 1 && method === "POST") {
      const body = await readBody(request);
      const state = await loadRoom(kv, room);
      const history = await loadHistory(kv, room);
      const newItem: BoardHistoryItem = {
        id: "hist_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
        timestamp: new Date().toISOString(),
        name: String(body.name || "未命名版本").trim(),
        creator: String(body.creator || "匿名").trim(),
        notesCount: state.notes.length,
        board: JSON.parse(JSON.stringify(state)),
      };
      history.unshift(newItem);
      await saveHistory(kv, room, history);
      return json({ success: true, data: newItem });
    }

    if (
      rest[0] === "history" &&
      rest[1] &&
      rest[2] === "restore" &&
      method === "POST"
    ) {
      const id = rest[1];
      const history = await loadHistory(kv, room);
      const version = history.find((item) => item.id === id);
      if (!version) {
        return json({ success: false, error: "History version not found" }, 404);
      }
      const state = JSON.parse(JSON.stringify(version.board));
      await saveRoom(kv, room, state);
      return json({ success: true, data: state });
    }

    if (rest[0] === "history" && rest[1] && rest.length === 2 && method === "DELETE") {
      const id = rest[1];
      let history = await loadHistory(kv, room);
      const before = history.length;
      history = history.filter((item) => item.id !== id);
      if (history.length === before) {
        return json({ success: false, error: "History version not found" }, 404);
      }
      await saveHistory(kv, room, history);
      return json({ success: true });
    }

    return json({ success: false, error: "Not found" }, 404);
  } catch (err) {
    console.error("API error:", err);
    return json({ success: false, error: "Internal error" }, 500);
  }
}
