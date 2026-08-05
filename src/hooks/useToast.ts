/**
 * 轻提示 —— 单一通知槽，避免 Toast 队列复杂度
 */

import { useState } from "react";

export type ToastType = "success" | "info";

export function useToast() {
  const [notification, setNotification] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 1600);
  };

  return { notification, showToast };
}
