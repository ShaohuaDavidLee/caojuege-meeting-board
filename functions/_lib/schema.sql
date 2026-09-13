-- 兰亭白板：按便签落行。同便签后写覆盖；不同便签互不影响。
CREATE TABLE IF NOT EXISTS boards (
  room TEXT PRIMARY KEY,
  title TEXT NOT NULL
);

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
);

CREATE INDEX IF NOT EXISTS idx_notes_room_seq ON notes(room, seq);

CREATE TABLE IF NOT EXISTS histories (
  room TEXT PRIMARY KEY,
  items TEXT NOT NULL
);
