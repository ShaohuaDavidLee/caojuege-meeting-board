/**
 * 品牌 —— 随皮肤切换的一整套名字
 *
 * 产品叫「兰亭白板」，出品方叫「草诀歌 AI Labs」，主会议间也叫「草诀歌 AI Labs」。
 * 三个名字各有各的位置，不要合并：兰亭白板是场地，草诀歌是出品方，
 * 主会议间是草诀歌在这块场地上开的那个长期的场子。所以导航上写兰亭白板，
 * 页脚署草诀歌，进门按钮进的是「草诀歌 AI Labs」那一间。
 *
 * 「礼仪」（faith）是一套白标皮肤：借这块场地开自己聚会的人，
 * 不该在他们的屏幕上看到「草诀歌」，也不该看到「兰亭白板」。品牌因此不是
 * 一份常量，而是主题的一个函数——切到礼仪皮，导航、页脚、主会议间、
 * 匿名署名、新板的默认标题全部换成 Faith。
 *
 * 内容克制：不放任何宗教符号，辨识度只交给英文经文与出处——
 * 认得的人一眼认得，不认得的人只看到一句格言。
 */

import { useTheme, type Theme } from "./hooks/useTheme";

export interface Brand {
  /** document.title / 全局产品名 */
  productName: string;
  /** 导航左上角的产品名 */
  brandName: string;
  /** 产品名后面跟的小字：谁出品的 */
  vendorName: string;
  /** 页脚那句「出品方是做什么的」 */
  vendorLine: string;
  /** 主会议间：落地页所有「进入会议间」的去处。同时是数据键，别跟着产品改名 */
  defaultRoom: string;
  /** 新板的默认标题（与服务端默认态对齐） */
  boardTitle: string;
  /** 匿名便签 / 快照的兜底署名 */
  anonName: string;
  /** 顶栏主会议间的悬浮提示 */
  mainRoomTip: string;
}

export const CLASSIC_BRAND: Brand = {
  productName: "兰亭白板",
  brandName: "兰亭白板",
  vendorName: "草诀歌出品",
  vendorLine: "草诀歌 AI Labs —— 面向非技术创作者的中文 vibe coding 社区",
  defaultRoom: "草诀歌 AI Labs",
  boardTitle: "草诀歌 AI Labs 会议白板",
  anonName: "兰亭神秘听众",
  mainRoomTip: "草诀歌 AI Labs 主会议间",
};

export const FAITH_BRAND: Brand = {
  productName: "Faith 会议室 · 会议白板",
  brandName: "Faith",
  vendorName: "会议室",
  vendorLine: "Faith 会议室 —— 两三个人，一间会议室",
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
