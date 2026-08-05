/**
 * 说明侧栏 —— 统计 + 操作提示
 */

import { X } from "lucide-react";

export function BoardSidebar({
  notesCount,
  unansweredCount,
  maxVotes,
  onClose,
}: {
  notesCount: number;
  unansweredCount: number;
  maxVotes: number;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="关闭说明"
        className="md:hidden fixed inset-0 z-20 bg-[rgba(26,26,26,0.45)] border-0 cursor-pointer"
        onClick={onClose}
      />
      <aside className="fixed md:static inset-x-0 bottom-0 md:inset-auto z-30 md:z-10 w-full md:w-80 max-h-[85dvh] md:max-h-none md:h-full shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-[var(--c-border-soft)] bg-[var(--c-bg)] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 border-b border-[var(--c-border-soft)] flex items-start justify-between">
          <div>
            <p className="eyebrow">Guide · 说明</p>
            <h2 className="font-serif text-[22px] tracking-[-0.02em] mt-1 leading-tight">
              白板如何<em className="font-serif italic">工作</em>？
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn btn-icon" title="收起">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 text-[var(--fs-sm)] text-[var(--c-muted)] leading-relaxed border-b border-[var(--c-border-soft)]">
          完全实时同步的会议收集板。开启同一链接的人，会看到你拖曳的每一次落点与每一次表态。
        </div>

        <div className="border-b border-[var(--c-border-soft)]">
          {[
            { k: "便签总计", v: `${notesCount}` },
            { k: "未标记解答", v: `${unansweredCount}` },
            { k: "赞数最高", v: `${maxVotes}` },
          ].map((row, i) => (
            <div
              key={row.k}
              className={`flex items-center justify-between px-6 py-3 text-[var(--fs-sm)] ${
                i > 0 ? "border-t border-[var(--c-border-soft)]" : ""
              }`}
            >
              <span className="text-[var(--c-muted-alt)]">{row.k}</span>
              <span className="font-serif text-[var(--c-ink)]">{row.v}</span>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 flex-1 text-[var(--fs-xs)] text-[var(--c-muted)] space-y-3">
          {[
            "点左上角「提问」：新建便签",
            "单指拖空白处：平移画布",
            "点铅笔图标：编辑提问",
            "「更多」里可改色或删除",
          ].map((tip, i) => (
            <div key={tip} className="flex gap-3">
              <span className="font-serif text-[var(--c-muted-alt)] shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>

        <div className="panel-dark px-6 py-5 text-[var(--fs-xs)] leading-relaxed pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          无需登录。复制链接分享给参会者，大家就能一起写入。
        </div>
      </aside>
    </>
  );
}
