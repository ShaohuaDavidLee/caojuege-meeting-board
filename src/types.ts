/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
  rotate: number; // degrees for natural sticky-note look
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
  /** 自动定时存档 / 手动打包；旧数据缺省视为手动 */
  kind?: "auto" | "manual";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
