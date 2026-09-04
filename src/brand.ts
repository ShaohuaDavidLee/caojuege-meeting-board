/**
 * 品牌 —— 随皮肤切换的一整套名字
 *
 * 「礼仪」（faith）是一套白标皮肤：借这块白板开自己聚会的人，
 * 不该在他们的屏幕上看到「草诀歌」。品牌因此不是一份常量，
 * 而是主题的一个函数——切到礼仪皮，导航、页脚、主会议间、
 * 匿名署名、新白板的默认标题全部换成 Faith。
 *
 * 内容克制：不放任何宗教符号，辨识度只交给英文经文与出处——
 * 认得的人一眼认得，不认得的人只看到一句格言。
 */

import { useTheme, type Theme } from "./hooks/useTheme";

export interface Brand {
  /** document.title / 全局产品名 */
  productName: string;
  /** 导航与页脚的品牌名 */
  brandName: string;
  /** 主会议间：落地页所有「进入会议间」的去处 */
  defaultRoom: string;
  /** 新白板的默认标题（与服务端默认态对齐） */
  boardTitle: string;
  /** 匿名便签 / 快照的兜底署名 */
  anonName: string;
  /** 顶栏主会议间的悬浮提示 */
  mainRoomTip: string;
}

export const CLASSIC_BRAND: Brand = {
  productName: "草诀歌 AI Labs 会议白板",
  brandName: "草诀歌 AI Labs",
  defaultRoom: "草诀歌 AI Labs",
  boardTitle: "草诀歌 AI Labs 会议白板",
  anonName: "草诀歌神秘听众",
  mainRoomTip: "草诀歌 AI Labs 主会议间",
};

export const FAITH_BRAND: Brand = {
  productName: "Faith 会议室 · 会议白板",
  brandName: "Faith 会议室",
  defaultRoom: "Faith 会议室",
  boardTitle: "Faith 会议白板",
  anonName: "Faith 神秘听众",
  mainRoomTip: "Faith 主会议间",
};

/** 落地页首屏的经文卡：马太福音 18:20（英文，克制处理） */
export const FAITH_VERSE = {
  text: "For where two or three are gathered together in my name, there am I in the midst of them.",
  cite: "Matthew 18:20",
  short: "Where two or three gather, there am I with them.",
};

export function brandForTheme(theme: Theme): Brand {
  return theme === "faith" ? FAITH_BRAND : CLASSIC_BRAND;
}

export function useBrand(): Brand {
  const { theme } = useTheme();
  return brandForTheme(theme);
}
