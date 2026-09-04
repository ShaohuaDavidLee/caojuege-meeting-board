/**
 * 路由 —— 只有两页：无 ?room= 是落地页，有 ?room= 是白板
 * 名称同时是 URL 参数与存储键，进出口都走 canonicalRoomName 归一
 */

import { useCallback, useEffect, useState } from "react";
import { canonicalRoomName, roomPath } from "../utils/boardHelpers";
import { FAITH_BRAND } from "../brand";
import { isFaithHost } from "./useTheme";

function readRoomFromUrl(): string {
  if (typeof window === "undefined") return "";
  const raw = new URLSearchParams(window.location.search).get("room") || "";
  const canonical = canonicalRoomName(raw);
  // 白标域名裸访问：直接进 Faith 主会议间，整条链路不出现原品牌
  if (!canonical && isFaithHost()) return FAITH_BRAND.defaultRoom;
  return canonical;
}

export function useRoute() {
  const [room, setRoom] = useState<string>(readRoomFromUrl);

  /** 旧名进来先把地址栏换成正名，分享出去的链接才是同一间 */
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("room") || "";
    const canonical = canonicalRoomName(raw);
    if (raw && canonical && raw !== canonical) {
      window.history.replaceState(null, "", roomPath(canonical));
    }
  }, []);

  useEffect(() => {
    const onPopState = () => setRoom(readRoomFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const enterRoom = useCallback((name: string) => {
    const canonical = canonicalRoomName(name);
    if (!canonical) return;
    window.history.pushState(null, "", roomPath(canonical));
    setRoom(canonical);
    window.scrollTo(0, 0);
  }, []);

  const leaveRoom = useCallback(() => {
    window.history.pushState(null, "", window.location.pathname);
    setRoom("");
    window.scrollTo(0, 0);
  }, []);

  return { room, enterRoom, leaveRoom };
}
