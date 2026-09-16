/**
 * 窄屏 —— 手机会议室用竖排，桌面仍是画布
 * 断点与 index.css 的 767px 对齐，只认宽度不认 UA
 */

import { useEffect, useState } from "react";

const NARROW_MQ = "(max-width: 767px)";

export function useNarrowScreen() {
  const [narrow, setNarrow] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(NARROW_MQ).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(NARROW_MQ);
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return narrow;
}
