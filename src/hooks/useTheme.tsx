/**
 * 主题 —— 现有的草诀歌风格（classic）是默认，硬派（hard）手动切。
 *
 * 存本机：主题是每个人自己的外观偏好，不是会议间的属性，所以不进 KV、
 * 不随会议间同步。同一块板上两个人看到不同皮肤是允许的——便签的颜色、
 * 位置与票数才是共识。决策见仓库根目录 DESIGN.md。
 *
 * 走 context 而不是各用各的 useState：顶栏的开关和首屏配图是两个消费者，
 * 各持一份状态会切一半。
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "classic" | "hard";

export const THEME_STORAGE_KEY = "caojuege-board-theme";
const HARD_FONT_ID = "hard-theme-font";

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "hard" ? "hard" : "classic";
  } catch {
    return "classic"; // 隐私模式 / 禁用存储：回到默认
  }
}

/** 硬派的标签用等宽字。只有真切过去才拉这份字体，classic 用户不付这个流量 */
function ensureHardFont() {
  if (document.getElementById(HARD_FONT_ID)) return;
  const link = document.createElement("link");
  link.id = HARD_FONT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap";
  document.head.appendChild(link);
}

interface ThemeValue {
  theme: Theme;
  isHard: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "hard") {
      ensureHardFont();
      root.setAttribute("data-theme", "hard");
    } else {
      root.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* 存不下就只在这一次会话里生效 */
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "hard" ? "classic" : "hard")),
    []
  );

  const value = useMemo(
    () => ({ theme, isHard: theme === "hard", toggleTheme }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme 必须在 ThemeProvider 里用");
  return ctx;
}
