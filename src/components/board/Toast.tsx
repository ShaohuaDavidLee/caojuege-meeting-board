/**
 * 顶栏轻提示
 */

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 toast px-5 py-3 rise sm:left-1/2">
      {message}
    </div>
  );
}
