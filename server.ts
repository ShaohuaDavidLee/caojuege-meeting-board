/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { StickyNote, BoardState } from "./src/types.js"; // Note: .js extension for ESM imports or compilation

const resolvedFilename = typeof __filename !== "undefined"
  ? __filename
  : fileURLToPath(import.meta.url);

const resolvedDirname = typeof __dirname !== "undefined"
  ? __dirname
  : path.dirname(resolvedFilename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to persist room board files
const DATA_DIR = path.join(process.cwd(), ".data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache
const roomsCache: { [roomId: string]: BoardState } = {};

// Helper to get room filepath
function getRoomFilePath(roomId: string): string {
  const buffer = Buffer.from(roomId);
  const safeId = buffer.toString("hex");
  const hexPath = path.join(DATA_DIR, `room_${safeId}.json`);
  
  // Migration fallback: if hex file doesn't exist, try to copy from old sanitized name format
  if (!fs.existsSync(hexPath)) {
    const oldSafeId = roomId.replace(/[^a-zA-Z0-9_\-]/g, "_");
    const oldPath = path.join(DATA_DIR, `room_${oldSafeId}.json`);
    if (fs.existsSync(oldPath) && oldSafeId !== "_") {
      try {
        fs.copyFileSync(oldPath, hexPath);
        console.log(`Migrated room file for "${roomId}" from "${oldSafeId}" to hex`);
      } catch (err) {
        console.error("Migration error: ", err);
      }
    }
  }
  return hexPath;
}

// Helper to load room state
function loadRoom(roomId: string): BoardState {
  if (roomsCache[roomId]) {
    return roomsCache[roomId];
  }

  const filePath = getRoomFilePath(roomId);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content) as BoardState;
      roomsCache[roomId] = data;
      return data;
    } catch (e) {
      console.error(`Error reading file for room ${roomId}:`, e);
    }
  }

  // Fallback default state —— 文案与色相对齐《设计规范.md》
  const defaultState: BoardState = {
    title: "草诀歌 AI Labs 会议白板",
    notes: [
      {
        id: "desc-1",
        text: "欢迎来到草诀歌 AI Labs 会议白板。大家可以在这里相互提问、投票和拖拽分类。\n双击空白处可以快速新建一张便签。",
        name: "看板助手",
        votes: 3,
        answered: false,
        x: 150,
        y: 120,
        color: "#ffffff",
        rotate: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: "desc-2",
        text: "主持人或其他人解答完后，点击便签上的对勾即可标为「已回答」。",
        name: "主持人",
        votes: 8,
        answered: false,
        x: 520,
        y: 160,
        color: "#ffffff",
        rotate: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: "desc-3",
        text: "支持自由拖拽排版。若需整齐网格，可用顶栏「排序」一键对齐。",
        name: "草诀歌 AI Labs",
        votes: 5,
        answered: false,
        x: 280,
        y: 350,
        color: "#ffffff",
        rotate: 0,
        createdAt: new Date().toISOString(),
      }
    ],
  };

  roomsCache[roomId] = defaultState;
  saveRoom(roomId, defaultState);
  return defaultState;
}

// Helper to save room state
function saveRoom(roomId: string, state: BoardState) {
  roomsCache[roomId] = state;
  const filePath = getRoomFilePath(roomId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error saving file for room ${roomId}:`, e);
  }
}

interface BoardHistoryItem {
  id: string;
  timestamp: string;
  name: string;
  creator: string;
  notesCount: number;
  board: BoardState;
}

function getRoomHistoryFilePath(roomId: string): string {
  const buffer = Buffer.from(roomId);
  const safeId = buffer.toString("hex");
  const hexPath = path.join(DATA_DIR, `room_${safeId}_history.json`);
  
  // Migration fallback: if hex file doesn't exist, try to copy from old sanitized name format
  if (!fs.existsSync(hexPath)) {
    const oldSafeId = roomId.replace(/[^a-zA-Z0-9_\-]/g, "_");
    const oldPath = path.join(DATA_DIR, `room_${oldSafeId}_history.json`);
    if (fs.existsSync(oldPath) && oldSafeId !== "_") {
      try {
        fs.copyFileSync(oldPath, hexPath);
        console.log(`Migrated history file for "${roomId}" from "${oldSafeId}" to hex`);
      } catch (err) {
        console.error("Migration error: ", err);
      }
    }
  }
  return hexPath;
}

function loadRoomHistory(roomId: string): BoardHistoryItem[] {
  const filePath = getRoomHistoryFilePath(roomId);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as BoardHistoryItem[];
    } catch (e) {
      console.error(`Error reading history file for room ${roomId}:`, e);
    }
  }
  return [];
}

function saveRoomHistory(roomId: string, history: BoardHistoryItem[]) {
  const filePath = getRoomHistoryFilePath(roomId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error saving history for room ${roomId}:`, e);
  }
}

// REST API Endpoints

// 1. Get entire room state
app.get("/api/board/:room", (req, res) => {
  const { room } = req.params;
  const state = loadRoom(room);
  res.json({ success: true, data: state });
});

// 2. Update room title
app.put("/api/board/:room/title", (req, res) => {
  const { room } = req.params;
  const { title } = req.body;
  if (typeof title !== "string") {
    res.status(400).json({ success: false, error: "Invalid title" });
    return;
  }
  const state = loadRoom(room);
  state.title = title;
  saveRoom(room, state);
  res.json({ success: true, data: state });
});

// 3. Create a note
app.post("/api/board/:room/note", (req, res) => {
  const { room } = req.params;
  const { text, name, x, y, color, rotate } = req.body;

  if (!text) {
    res.status(400).json({ success: false, error: "Text is required" });
    return;
  }

  const state = loadRoom(room);

  const newNote: StickyNote = {
    id: "note_" + Math.random().toString(36).substring(2, 11),
    text: String(text).trim(),
    name: String(name || "匿名").trim() || "匿名",
    votes: 0,
    answered: false,
    x: typeof x === "number" ? x : 100,
    y: typeof y === "number" ? y : 100,
    color: String(color || "#ffffff"),
    rotate: typeof rotate === "number" ? rotate : 0,
    createdAt: new Date().toISOString(),
  };

  state.notes.push(newNote);
  saveRoom(room, state);

  res.json({ success: true, data: newNote });
});

// 4. Update note details (text, name, answered, coordinates, color, votes)
app.put("/api/board/:room/note/:id", (req, res) => {
  const { room, id } = req.params;
  const state = loadRoom(room);
  const noteIndex = state.notes.findIndex((n) => n.id === id);

  if (noteIndex === -1) {
    res.status(404).json({ success: false, error: "Note not found" });
    return;
  }

  const note = state.notes[noteIndex];
  const { text, name, answered, x, y, color, votes } = req.body;

  if (text !== undefined) note.text = String(text);
  if (name !== undefined) note.name = String(name || "匿名").trim() || "匿名";
  if (answered !== undefined) note.answered = Boolean(answered);
  if (x !== undefined && typeof x === "number") note.x = Math.round(x);
  if (y !== undefined && typeof y === "number") note.y = Math.round(y);
  if (color !== undefined) note.color = String(color);
  if (votes !== undefined && typeof votes === "number") note.votes = votes;

  saveRoom(room, state);
  res.json({ success: true, data: note });
});

// 5. Upvote a note
app.post("/api/board/:room/note/:id/vote", (req, res) => {
  const { room, id } = req.params;
  const { increment } = req.body; // true to add vote, false to remove/decrement
  
  const state = loadRoom(room);
  const note = state.notes.find((n) => n.id === id);

  if (!note) {
    res.status(404).json({ success: false, error: "Note not found" });
    return;
  }

  const delta = increment === false ? -1 : 1;
  note.votes = Math.max(0, note.votes + delta);

  saveRoom(room, state);
  res.json({ success: true, data: note });
});

// 6. Delete a note
app.delete("/api/board/:room/note/:id", (req, res) => {
  const { room, id } = req.params;
  const state = loadRoom(room);
  const noteIndex = state.notes.findIndex((n) => n.id === id);

  if (noteIndex === -1) {
    res.status(404).json({ success: false, error: "Note not found" });
    return;
  }

  state.notes.splice(noteIndex, 1);
  saveRoom(room, state);
  res.json({ success: true });
});

// 7. Clear answered items
app.post("/api/board/:room/clear-answered", (req, res) => {
  const { room } = req.params;
  const state = loadRoom(room);
  state.notes = state.notes.filter(n => !n.answered);
  saveRoom(room, state);
  res.json({ success: true, data: state });
});

// 7b. Full Board Sync / Restore from backup
app.put("/api/board/:room/sync-full", (req, res) => {
  const { room } = req.params;
  const { title, notes } = req.body;

  if (typeof title !== "string" || !Array.isArray(notes)) {
    res.status(400).json({ success: false, error: "Invalid board state payload" });
    return;
  }

  const state = loadRoom(room);
  state.title = title;
  state.notes = notes;

  saveRoom(room, state);
  res.json({ success: true, data: state });
});

// 8. Get history log
app.get("/api/board/:room/history", (req, res) => {
  const { room } = req.params;
  const history = loadRoomHistory(room);
  res.json({ success: true, data: history });
});

// 9. Save a new history version snapshot
app.post("/api/board/:room/history", (req, res) => {
  const { room } = req.params;
  const { name, creator } = req.body;
  const state = loadRoom(room);
  
  const history = loadRoomHistory(room);
  const newItem: BoardHistoryItem = {
    id: "hist_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    timestamp: new Date().toISOString(),
    name: String(name || `未命名版本`).trim(),
    creator: String(creator || "匿名").trim(),
    notesCount: state.notes.length,
    board: JSON.parse(JSON.stringify(state)), // Deep clone the board state
  };
  
  history.unshift(newItem); // newest first
  saveRoomHistory(room, history);
  res.json({ success: true, data: newItem });
});

// 10. Restore from snapshot
app.post("/api/board/:room/history/:id/restore", (req, res) => {
  const { room, id } = req.params;
  const history = loadRoomHistory(room);
  const version = history.find(item => item.id === id);
  
  if (!version) {
    res.status(404).json({ success: false, error: "History version not found" });
    return;
  }
  
  // Restore current board
  const state = JSON.parse(JSON.stringify(version.board));
  saveRoom(room, state);
  res.json({ success: true, data: state });
});

// 11. Delete a snapshot
app.delete("/api/board/:room/history/:id", (req, res) => {
  const { room, id } = req.params;
  let history = loadRoomHistory(room);
  const initialLength = history.length;
  history = history.filter(item => item.id !== id);
  
  if (history.length === initialLength) {
    res.status(404).json({ success: false, error: "History version not found" });
    return;
  }
  
  saveRoomHistory(room, history);
  res.json({ success: true });
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
