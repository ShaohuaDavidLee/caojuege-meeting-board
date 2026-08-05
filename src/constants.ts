/**
 * 草诀歌 AI Labs 会议白板 —— 常量
 */

export const PRODUCT_NAME = "草诀歌 AI Labs 会议白板";

export const POETIC_WORDS = [
  "沧海", "桑田", "明月", "清风", "桃夭", "落木", "飞霜", "星河", "疏影", "暗香",
  "暮雪", "扶摇", "朝雨", "晚晴", "云舒", "卷云", "秋水", "长空", "平湖", "白鹭",
  "晴川", "芳草", "烟波", "微澜", "寒鸦", "塞下", "春泥", "折柳", "东篱", "南山",
  "悠然", "独酌", "相思", "无暇", "红豆", "绿蚁", "新醅", "晚来", "天欲", "雪落",
  "知音", "流觞", "曲水", "青箬", "绿蓑", "斜风", "细雨", "听雨", "眠云", "枕石",
  "行舟", "渡口", "晚风", "初晴", "夕照", "归雁", "孤鹜", "落霞", "渔歌", "樵苏",
  "松风", "竹露", "荷风", "桂雨", "流萤", "晓风", "残月", "醉月", "吟风", "抚琴",
  "问茶", "寻梅", "赏雪", "观澜", "卧薪", "凌云", "逐浪", "泛舟", "烟雨", "墨客",
  "词赋", "丹青", "弦歌", "雅集", "兰亭", "蓬莱", "瀛洲", "瑶池", "紫微", "太白",
];

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

export const SUGGESTED_ROOMS = ["听雨", "沧海", "落木", "疏影", "明月", "星河", "秋水", "晚晴"];
