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
}

export const DEFAULT_BOARD_TITLE = "草诀歌 AI Labs 会议白板";

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

export async function loadRoom(kv: KVNamespace, roomId: string): Promise<BoardState> {
  const raw = await kv.get(roomKey(roomId), "json");
  if (raw && typeof raw === "object") {
    return raw as BoardState;
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
