/**
 * 草诀歌 AI Labs 会议白板 —— 常量
 */

export const PRODUCT_NAME = "草诀歌 AI Labs 会议白板";

export const BRAND_NAME = "草诀歌 AI Labs";

/** 主会议间：草诀歌 AI Labs 自己的场子。需要单独一场时可另开一间 */
export const DEFAULT_ROOM = "草诀歌 AI Labs";

/** 旧名 / 少空格写法：进来后归一到 DEFAULT_ROOM，老链接不失效 */
export const LEGACY_ROOM_ALIASES = ["共创会", "草诀歌AI Labs"];

/** 会议间名称长度上限：它同时是 URL 参数与存储键 */
export const MAX_ROOM_NAME_LENGTH = 24;

/** 有改动时自动归档间隔（毫秒） */
export const AUTO_SNAPSHOT_INTERVAL_MS = 15 * 60 * 1000;

/** 每房历史快照上限（自动 + 手动合计） */
export const MAX_HISTORY_ITEMS = 20;

/** 默认便签色（米白纸面） */
export const NOTE_SURFACE = "#ffffff";

/** 便签配色：低饱和纸感，只做区分，不当品牌强调色 */
export const COLOR_PALETTE = [
  { name: "宣纸", value: "#ffffff" },
  { name: "米色", value: "#f3efe6" },
  { name: "竹青", value: "#e4ebe3" },
  { name: "雨灰", value: "#e6eaee" },
  { name: "桃雾", value: "#f3e8e6" },
  { name: "藤黄", value: "#f2edd8" },
] as const;

export const DEFAULT_BOARD_TITLE = "草诀歌 AI Labs 会议白板";

export const LEGACY_DEFAULT_TITLE = "协作会议问题看板 🥳";

export const LEGACY_TITLES = [
  LEGACY_DEFAULT_TITLE,
  "协作会议问题看板",
  "协同会议问题看板",
];
