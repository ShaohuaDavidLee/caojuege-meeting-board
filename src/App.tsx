/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 草诀歌 AI Labs 会议白板 —— 路由层
 * 只有两页：无 ?room= 进落地页，有 ?room= 进那一间白板
 */

import { useEffect } from "react";
import { ThemeProvider } from "./hooks/useTheme";
import { useRoute } from "./hooks/useRoute";
import { PRODUCT_NAME } from "./constants";
import { rememberRoom } from "./utils/recentRooms";
import Landing from "./pages/Landing";
import Board from "./pages/Board";

export default function App() {
  const { room, enterRoom, leaveRoom } = useRoute();

  useEffect(() => {
    document.title = room ? `${room} · ${PRODUCT_NAME}` : PRODUCT_NAME;
    if (room) rememberRoom(room);
  }, [room]);

  return (
    <ThemeProvider>
      {room ? (
        <Board key={room} room={room} onLeave={leaveRoom} />
      ) : (
        <Landing onEnterRoom={enterRoom} />
      )}
    </ThemeProvider>
  );
}
