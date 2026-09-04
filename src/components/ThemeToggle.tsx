/**
 * 主题开关 —— 落地页导航与白板顶栏共用这一个组件。
 * 显示的是「当前」皮肤，点一下轮转到下一套（现在 → 硬派 → 礼仪）。
 */

import { useTheme, THEME_ORDER, THEME_LABELS } from "../hooks/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-ghost theme-toggle ${className}`}
      title={`当前皮肤：${THEME_LABELS[theme]}。点击切到「${THEME_LABELS[next]}」`}
      aria-label={`当前皮肤：${THEME_LABELS[theme]}。点击切到「${THEME_LABELS[next]}」`}
    >
      {theme === "faith" ? "Faith" : theme === "hard" ? "Hard" : "Classic"}
    </button>
  );
}
