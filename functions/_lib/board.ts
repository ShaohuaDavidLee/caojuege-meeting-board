/**
 * 兰亭白板存储 —— D1 按便签写入；KV 只在首次打开时认领旧整板
 */

export interface StickyNote {
  id: string;
  text: string;
  name: string;
  votes: number;
  answered: boolean;
  x: number;
  y: number;
  color: string;
  rotate: number;
  createdAt: string;
}

export interface BoardState {
  notes: StickyNote[];
  title: string;
}

export interface BoardHistoryItem {
  id: string;
  timestamp: string;
  name: string;
  creator: string;
  notesCount: number;
  board: BoardState;
  kind?: "auto" | "manual";
}

export type NotePatch = Partial<StickyNote>;

export const DEFAULT_BOARD_TITLE = "草诀歌 AI Labs 会议白板";
export const DEFAULT_ROOM = "草诀歌 AI Labs";

/** Faith 主房：白标皮肤的默认会议间，初始内容不带原品牌 */
export const FAITH_MAIN_ROOM = "Faith 会议室";
export const FAITH_BOARD_TITLE = "Faith 会议白板";

export const LEGACY_ROOM_NAMES = ["共创会", "草诀歌AI Labs"];
export const MAX_ROOM_KEY_LENGTH = 256;
export const MAX_HISTORY_ITEMS = 20;

interface NoteRow {
  id: string;
  text: string;
  name: string;
  votes: number;
  answered: number;
  x: number;
  y: number;
  color: string;
  rotate: number;
  created_at: string;
  seq: number;
}

export function pruneHistory(history: BoardHistoryItem[]): BoardHistoryItem[] {
  if (history.length <= MAX_HISTORY_ITEMS) return history;
  return history.slice(0, MAX_HISTORY_ITEMS);
}

function roomKey(roomId: string) {
  return `room:${encodeURIComponent(roomId)}`;
}

function historyKey(roomId: string) {
  return `history:${encodeURIComponent(roomId)}`;
}

export function createDefaultBoard(roomId?: string): BoardState {
  const now = new Date().toISOString();
  const isFaith = roomId === FAITH_MAIN_ROOM;
  return {
    title: isFaith ? FAITH_BOARD_TITLE : DEFAULT_BOARD_TITLE,
    notes: [
      {
        id: "desc-1",
        text: isFaith
          ? "欢迎来到 Faith 会议室。大家可以在这里相互提问、投票和拖拽分类。\n双击空白处可以快速新建一张便签。"
          : "欢迎来到草诀歌 AI Labs 会议白板。大家可以在这里相互提问、投票和拖拽分类。\n双击空白处可以快速新建一张便签。",
        name: "看板助手",
        votes: 3,
        answered: false,
        x: 150,
        y: 120,
        color: "#f3efe6",
        rotate: 0,
        createdAt: now,
      },
      {
        id: "desc-2",
        text: "主持人或其他人解答完后，点击便签上的对勾即可标为「已回答」。",
        name: "主持人",
        votes: 8,
        answered: false,
        x: 520,
        y: 160,
        color: "#e4ebe3",
        rotate: 0,
        createdAt: now,
      },
      {
        id: "desc-3",
        text: "支持自由拖拽排版。若需整齐网格，可用顶栏「排序」一键对齐。",
        name: isFaith ? "Faith 会议室" : "草诀歌 AI Labs",
        votes: 5,
        answered: false,
        x: 280,
        y: 350,
        color: "#e6eaee",
        rotate: 0,
        createdAt: now,
      },
    ],
  };
}

export function isRoomNameValid(roomId: string): boolean {
  const name = roomId.trim();
  return name.length > 0 && roomKey(name).length <= MAX_ROOM_KEY_LENGTH;
}

async function ensureSchema(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS boards (
        room TEXT PRIMARY KEY,
        title TEXT NOT NULL
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS notes (
        room TEXT NOT NULL,
        id TEXT NOT NULL,
        text TEXT NOT NULL,
        name TEXT NOT NULL,
        votes INTEGER NOT NULL DEFAULT 0,
        answered INTEGER NOT NULL DEFAULT 0,
        x REAL NOT NULL,
        y REAL NOT NULL,
        color TEXT NOT NULL,
        rotate REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        seq INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (room, id)
      )
    `),
    db.prepare(
      `CREATE INDEX IF NOT EXISTS idx_notes_room_seq ON notes(room, seq)`
    ),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS histories (
        room TEXT PRIMARY KEY,
        items TEXT NOT NULL
      )
    `),
  ]);
}

function rowToNote(row: NoteRow): StickyNote {
  return {
    id: row.id,
    text: row.text,
    name: row.name,
    votes: row.votes,
    answered: Boolean(row.answered),
    x: row.x,
    y: row.y,
    color: row.color,
    rotate: row.rotate,
    createdAt: row.created_at,
  };
}

function insertNoteStmt(
  db: D1Database,
  roomId: string,
  note: StickyNote,
  seq: number
) {
  return db
    .prepare(
      `INSERT INTO notes
        (room, id, text, name, votes, answered, x, y, color, rotate, created_at, seq)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      roomId,
      note.id,
      note.text,
      note.name,
      note.votes,
      note.answered ? 1 : 0,
      note.x,
      note.y,
      note.color,
      note.rotate,
      note.createdAt,
      seq
    );
}

async function runBatch(db: D1Database, stmts: D1PreparedStatement[]) {
  for (let i = 0; i < stmts.length; i += 40) {
    await db.batch(stmts.slice(i, i + 40));
  }
}

async function loadNotes(db: D1Database, roomId: string): Promise<StickyNote[]> {
  const { results } = await db
    .prepare(
      `SELECT id, text, name, votes, answered, x, y, color, rotate, created_at, seq
       FROM notes WHERE room = ? ORDER BY seq ASC, created_at ASC`
    )
    .bind(roomId)
    .all<NoteRow>();
  return (results ?? []).map(rowToNote);
}

async function readKvJson(kv: KVNamespace, key: string): Promise<unknown> {
  return kv.get(key, "json");
}

async function readKvBoard(
  kv: KVNamespace,
  roomId: string
): Promise<BoardState | null> {
  const raw = await readKvJson(kv, roomKey(roomId));
  if (raw && typeof raw === "object") return raw as BoardState;
  return null;
}

async function readKvHistory(
  kv: KVNamespace,
  roomId: string
): Promise<BoardHistoryItem[]> {
  const raw = await readKvJson(kv, historyKey(roomId));
  return Array.isArray(raw) ? (raw as BoardHistoryItem[]) : [];
}

export async function saveHistory(
  db: D1Database,
  roomId: string,
  history: BoardHistoryItem[]
): Promise<void> {
  await ensureSchema(db);
  await db
    .prepare(
      `INSERT INTO histories (room, items) VALUES (?, ?)
       ON CONFLICT(room) DO UPDATE SET items = excluded.items`
    )
    .bind(roomId, JSON.stringify(history))
    .run();
}

export async function saveRoom(
  db: D1Database,
  roomId: string,
  state: BoardState
): Promise<void> {
  await ensureSchema(db);
  const stmts = [
    db
      .prepare(
        `INSERT INTO boards (room, title) VALUES (?, ?)
         ON CONFLICT(room) DO UPDATE SET title = excluded.title`
      )
      .bind(roomId, state.title),
    db.prepare(`DELETE FROM notes WHERE room = ?`).bind(roomId),
    ...state.notes.map((note, i) => insertNoteStmt(db, roomId, note, i)),
  ];
  await runBatch(db, stmts);
}

async function adoptFromKv(
  db: D1Database,
  kv: KVNamespace,
  roomId: string
): Promise<BoardState | null> {
  const own = await readKvBoard(kv, roomId);
  if (own) {
    await saveRoom(db, roomId, own);
    const history = await readKvHistory(kv, roomId);
    if (history.length > 0) await saveHistory(db, roomId, history);
    return own;
  }

  if (roomId !== DEFAULT_ROOM) return null;

  for (const legacy of LEGACY_ROOM_NAMES) {
    const adopted = await readKvBoard(kv, legacy);
    if (!adopted) continue;
    await saveRoom(db, roomId, adopted);
    const history = await readKvHistory(kv, legacy);
    if (history.length > 0) await saveHistory(db, roomId, history);
    return adopted;
  }
  return null;
}

export async function loadRoom(
  db: D1Database,
  roomId: string,
  kv?: KVNamespace
): Promise<BoardState> {
  await ensureSchema(db);
  const row = await db
    .prepare(`SELECT title FROM boards WHERE room = ?`)
    .bind(roomId)
    .first<{ title: string }>();

  if (row) {
    return { title: row.title, notes: await loadNotes(db, roomId) };
  }

  if (kv) {
    const migrated = await adoptFromKv(db, kv, roomId);
    if (migrated) return migrated;
  }

  const fresh = createDefaultBoard(roomId);
  await saveRoom(db, roomId, fresh);
  return fresh;
}

export async function setTitle(
  db: D1Database,
  roomId: string,
  title: string
): Promise<BoardState> {
  await db
    .prepare(`UPDATE boards SET title = ? WHERE room = ?`)
    .bind(title, roomId)
    .run();
  return { title, notes: await loadNotes(db, roomId) };
}

export async function insertNote(
  db: D1Database,
  roomId: string,
  note: StickyNote
): Promise<void> {
  const row = await db
    .prepare(`SELECT COALESCE(MAX(seq), -1) AS m FROM notes WHERE room = ?`)
    .bind(roomId)
    .first<{ m: number }>();
  await insertNoteStmt(db, roomId, note, (row?.m ?? -1) + 1).run();
}

export async function patchNote(
  db: D1Database,
  roomId: string,
  id: string,
  patch: NotePatch
): Promise<StickyNote | null> {
  const sets: string[] = [];
  const binds: Array<string | number> = [];

  if (patch.text !== undefined) {
    sets.push("text = ?");
    binds.push(String(patch.text));
  }
  if (patch.name !== undefined) {
    sets.push("name = ?");
    binds.push(String(patch.name || "匿名").trim() || "匿名");
  }
  if (patch.answered !== undefined) {
    sets.push("answered = ?");
    binds.push(patch.answered ? 1 : 0);
  }
  if (typeof patch.x === "number") {
    sets.push("x = ?");
    binds.push(Math.round(patch.x));
  }
  if (typeof patch.y === "number") {
    sets.push("y = ?");
    binds.push(Math.round(patch.y));
  }
  if (patch.color !== undefined) {
    sets.push("color = ?");
    binds.push(String(patch.color));
  }
  if (typeof patch.votes === "number") {
    sets.push("votes = ?");
    binds.push(patch.votes);
  }

  if (sets.length === 0) {
    const current = await db
      .prepare(
        `SELECT id, text, name, votes, answered, x, y, color, rotate, created_at, seq
         FROM notes WHERE room = ? AND id = ?`
      )
      .bind(roomId, id)
      .first<NoteRow>();
    return current ? rowToNote(current) : null;
  }

  binds.push(roomId, id);
  const row = await db
    .prepare(
      `UPDATE notes SET ${sets.join(", ")} WHERE room = ? AND id = ?
       RETURNING id, text, name, votes, answered, x, y, color, rotate, created_at, seq`
    )
    .bind(...binds)
    .first<NoteRow>();
  return row ? rowToNote(row) : null;
}

export async function voteNote(
  db: D1Database,
  roomId: string,
  id: string,
  delta: number
): Promise<StickyNote | null> {
  const row = await db
    .prepare(
      `UPDATE notes SET votes = MAX(0, votes + ?) WHERE room = ? AND id = ?
       RETURNING id, text, name, votes, answered, x, y, color, rotate, created_at, seq`
    )
    .bind(delta, roomId, id)
    .first<NoteRow>();
  return row ? rowToNote(row) : null;
}

export async function deleteNote(
  db: D1Database,
  roomId: string,
  id: string
): Promise<boolean> {
  const row = await db
    .prepare(`DELETE FROM notes WHERE room = ? AND id = ? RETURNING id`)
    .bind(roomId, id)
    .first<{ id: string }>();
  return Boolean(row);
}

export async function clearAnswered(
  db: D1Database,
  roomId: string
): Promise<BoardState> {
  await db
    .prepare(`DELETE FROM notes WHERE room = ? AND answered = 1`)
    .bind(roomId)
    .run();
  const row = await db
    .prepare(`SELECT title FROM boards WHERE room = ?`)
    .bind(roomId)
    .first<{ title: string }>();
  return {
    title: row?.title ?? DEFAULT_BOARD_TITLE,
    notes: await loadNotes(db, roomId),
  };
}

export async function loadHistory(
  db: D1Database,
  roomId: string,
  kv?: KVNamespace
): Promise<BoardHistoryItem[]> {
  await ensureSchema(db);
  const row = await db
    .prepare(`SELECT items FROM histories WHERE room = ?`)
    .bind(roomId)
    .first<{ items: string }>();

  if (row?.items) {
    try {
      const parsed = JSON.parse(row.items);
      if (Array.isArray(parsed)) return parsed as BoardHistoryItem[];
    } catch {
      /* 坏数据当空历史，下次写入覆盖 */
    }
  }

  if (!kv) return [];

  const own = await readKvHistory(kv, roomId);
  if (own.length > 0) {
    await saveHistory(db, roomId, own);
    return own;
  }

  if (roomId !== DEFAULT_ROOM) return [];

  for (const legacy of LEGACY_ROOM_NAMES) {
    const adopted = await readKvHistory(kv, legacy);
    if (adopted.length === 0) continue;
    await saveHistory(db, roomId, adopted);
    return adopted;
  }
  return [];
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "CDN-Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
