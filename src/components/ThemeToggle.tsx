/**
 * 主题开关 —— 落地页导航与白板顶栏共用这一个组件。
 * 显示的是「当前」皮肤，点一下换到另一套。
 */

import { useTheme } from "../hooks/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isHard = theme === "hard";
  const other = isHard ? "现在" : "硬派";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-ghost theme-toggle ${className}`}
      title={`当前皮肤：${isHard ? "硬派" : "现在"}。点击切到「${other}」`}
      aria-label={`当前皮肤：${isHard ? "硬派" : "现在"}。点击切到「${other}」`}
    >
      {isHard ? "Hard" : "Classic"}
    </button>
  );
}
