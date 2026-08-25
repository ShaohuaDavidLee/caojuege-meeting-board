/**
 * Cloudflare KV 存储层 —— 草诀歌 AI Labs 会议白板
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

export const DEFAULT_BOARD_TITLE = "草诀歌 AI Labs 会议白板";

/** 主房：与 src/constants.ts 的 DEFAULT_ROOM 保持一致 */
export const DEFAULT_ROOM = "草诀歌 AI Labs";

/** 主房改名前用过的房名，按顺序认领 */
export const LEGACY_ROOM_NAMES = ["共创会", "草诀歌AI Labs"];

/** 房名同时是 KV 键，编码后不得超过这个长度 */
export const MAX_ROOM_KEY_LENGTH = 256;

/** 每房历史快照上限 */
export const MAX_HISTORY_ITEMS = 20;

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

export function createDefaultBoard(): BoardState {
  const now = new Date().toISOString();
  return {
    title: DEFAULT_BOARD_TITLE,
    notes: [
      {
        id: "desc-1",
        text: "欢迎来到草诀歌 AI Labs 会议白板。大家可以在这里相互提问、投票和拖拽分类。\n双击空白处可以快速新建一张便签。",
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
        name: "草诀歌 AI Labs",
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

/**
 * 主房从「共创会」改名到「草诀歌 AI Labs」。
 * 新键还空、老键有内容时整体搬过来，旧会议的便签与历史都不失联。
 */
async function adoptLegacyRoom(
  kv: KVNamespace,
  roomId: string
): Promise<BoardState | null> {
  for (const legacy of LEGACY_ROOM_NAMES) {
    if (legacy === roomId) continue;
    const raw = await kv.get(roomKey(legacy), "json");
    if (!raw || typeof raw !== "object") continue;

    const state = raw as BoardState;
    await saveRoom(kv, roomId, state);

    const legacyHistory = await loadHistory(kv, legacy);
    if (legacyHistory.length > 0) {
      await saveHistory(kv, roomId, legacyHistory);
    }
    return state;
  }
  return null;
}

export async function loadRoom(kv: KVNamespace, roomId: string): Promise<BoardState> {
  const raw = await kv.get(roomKey(roomId), "json");
  if (raw && typeof raw === "object") {
    return raw as BoardState;
  }

  if (roomId === DEFAULT_ROOM) {
    const adopted = await adoptLegacyRoom(kv, roomId);
    if (adopted) return adopted;
  }

  const fresh = createDefaultBoard();
  await saveRoom(kv, roomId, fresh);
  return fresh;
}

export async function saveRoom(
  kv: KVNamespace,
  roomId: string,
  state: BoardState
): Promise<void> {
  await kv.put(roomKey(roomId), JSON.stringify(state));
}

export async function loadHistory(
  kv: KVNamespace,
  roomId: string
): Promise<BoardHistoryItem[]> {
  const raw = await kv.get(historyKey(roomId), "json");
  if (Array.isArray(raw)) return raw as BoardHistoryItem[];
  return [];
}

export async function saveHistory(
  kv: KVNamespace,
  roomId: string,
  history: BoardHistoryItem[]
): Promise<void> {
  await kv.put(historyKey(roomId), JSON.stringify(history));
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
