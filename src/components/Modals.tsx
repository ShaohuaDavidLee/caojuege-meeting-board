/**
 * 白板浮层 —— 署名 / 提问 / 删除 / 历史版本
 * 视觉：直角、发丝线、深色主按钮，无阴影无圆角
 */

import React from "react";
import {
  X,
  ArrowRight,
  Trash2,
  History,
  Clock,
  Save,
  RefreshCw,
} from "lucide-react";
import { BoardHistoryItem } from "../types";
import { COLOR_PALETTE } from "../constants";

/* ---------- 署名 ---------- */

export function NameModal({
  username,
  profileInput,
  setProfileInput,
  onSave,
  onCancel,
}: {
  username: string;
  profileInput: string;
  setProfileInput: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 modal-scrim flex items-center justify-center p-4 z-50">
      <div className="panel modal-sheet w-full max-w-sm p-6 sm:p-8 rise">
        <p className="eyebrow">Identity · 署名</p>
        <h3 className="font-serif font-normal text-[24px] sm:text-[28px] tracking-[-0.02em] text-[var(--c-ink)] mt-2 leading-snug">
          你希望被怎样<em className="font-serif italic font-normal">称呼</em>？
        </h3>
        <p className="text-[var(--fs-sm)] text-[var(--c-muted)] mt-3 leading-relaxed">
          主持人或同伴回答时，能叫出你的名字。无需登录，只是一块纸上的署名。
        </p>

        <label className="block mt-6 mb-1.5 text-[var(--fs-xs)] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)]">
          Name · 昵称
        </label>
        <input
          type="text"
          placeholder="例如：小林 / 产品研发"
          value={profileInput}
          onChange={(e) => setProfileInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          className="field"
          maxLength={15}
          autoFocus
        />

        <div className="mt-6 flex gap-0 border border-[var(--c-border-soft)]">
          {username ? (
            <button type="button" onClick={onCancel} className="btn btn-ghost flex-1 h-11 border-0 border-r border-[var(--c-border-soft)]">
              取消
            </button>
          ) : null}
          <button type="button" onClick={onSave} className="btn btn-primary flex-1 h-11 border-0 group">
            进入白板
            <ArrowRight className="w-3.5 h-3.5 arrow-nudge" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 换房 ---------- */

/* ---------- 提问 ---------- */

export function AddNoteModal({
  newNoteText,
  setNewNoteText,
  newNoteColor,
  setNewNoteColor,
  noteCreationCoords,
  submitterNameType,
  setSubmitterNameType,
  username,
  onOpenName,
  onClose,
  onSubmit,
}: {
  newNoteText: string;
  setNewNoteText: (v: string) => void;
  newNoteColor: string;
  setNewNoteColor: (v: string) => void;
  noteCreationCoords: { x: number; y: number } | null;
  submitterNameType: "self" | "anonymous";
  setSubmitterNameType: (v: "self" | "anonymous") => void;
  username: string;
  onOpenName: () => void;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 modal-scrim flex items-center justify-center p-4 z-50">
      <form
        onSubmit={onSubmit}
        className="modal-sheet w-full max-w-md rise border border-[var(--c-border-soft)] bg-[var(--c-bg)]"
      >
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-[var(--c-border-soft)] flex items-start justify-between bg-[var(--c-surface)]">
          <div>
            <p className="eyebrow">Question · 提问</p>
            <h3 className="font-serif font-normal text-[22px] sm:text-[26px] tracking-[-0.02em] text-[var(--c-ink)] mt-2 leading-snug">
              写下你的<em className="font-serif italic font-normal">疑惑</em>
            </h3>
            <p className="font-sans text-[var(--fs-xs)] text-[var(--c-muted-alt)] mt-2">
              {noteCreationCoords
                ? `落点 X ${Math.round(noteCreationCoords.x)} · Y ${Math.round(noteCreationCoords.y)}`
                : "自动落在画布中央"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-icon" title="关闭">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-8 py-5 sm:py-6 flex flex-col gap-5 bg-[var(--c-surface)]">
          <div>
            <label className="block mb-1.5 font-sans text-[var(--fs-xs)] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)]">
              Ask · 正文（限 300 字）
            </label>
            <textarea
              placeholder="有什么不明白的？写下来，同伴可点赞，主持人能实时看到。"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="field h-28 sm:h-32 leading-relaxed font-sans"
              style={{ backgroundColor: newNoteColor }}
              maxLength={300}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block mb-1.5 font-sans text-[var(--fs-xs)] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)]">
              Sign · 署名
            </label>
            <div className="grid grid-cols-2 border border-[var(--c-border-soft)] bg-[var(--c-bg)]">
              <button
                type="button"
                onClick={() => setSubmitterNameType("self")}
                className={`py-3 px-3 font-sans text-[var(--fs-xs)] transition-colors duration-300 border-r border-[var(--c-border-soft)] ${
                  submitterNameType === "self"
                    ? "bg-[var(--c-surface)] text-[var(--c-ink)]"
                    : "bg-transparent text-[var(--c-muted)] hover:text-[var(--c-ink)]"
                }`}
              >
                <span className="block">使用我自己</span>
                <span
                  className={`block mt-0.5 truncate font-serif ${
                    submitterNameType === "self"
                      ? "text-[var(--c-ink)]"
                      : "text-[var(--c-muted-alt)]"
                  }`}
                >
                  {username ? username : "需先设昵称"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSubmitterNameType("anonymous")}
                className={`py-3 px-3 font-sans text-[var(--fs-xs)] transition-colors duration-300 ${
                  submitterNameType === "anonymous"
                    ? "bg-[var(--c-surface)] text-[var(--c-ink)]"
                    : "bg-transparent text-[var(--c-muted)] hover:text-[var(--c-ink)]"
                }`}
              >
                <span className="block">神秘听众</span>
                <span
                  className={`block mt-0.5 ${
                    submitterNameType === "anonymous"
                      ? "text-[var(--c-muted)]"
                      : "text-[var(--c-muted-alt)]"
                  }`}
                >
                  匿名发表
                </span>
              </button>
            </div>
            {submitterNameType === "self" && (
              <button
                type="button"
                onClick={onOpenName}
                className="mt-2 font-sans text-[var(--fs-xs)] text-[var(--c-muted-alt)] hover:text-[var(--c-ink)] transition-colors duration-300 bg-transparent border-0 cursor-pointer p-0"
              >
                修改昵称
              </button>
            )}
          </div>

          <div>
            <label className="block mb-1.5 font-sans text-[var(--fs-xs)] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)]">
              Color · 底色
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewNoteColor(c.value)}
                  className={`w-7 h-7 border transition-colors duration-300 ${
                    newNoteColor === c.value
                      ? "border-[var(--c-ink)]"
                      : "border-[var(--c-border-soft)]"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-[var(--c-border-soft)] flex bg-[var(--c-surface)] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1 h-11 font-sans">
            取消
          </button>
          <button type="submit" className="btn btn-primary flex-1 h-11 border-l-0 group font-sans">
            发布到白板
            <ArrowRight className="w-3.5 h-3.5 arrow-nudge" />
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- 删除确认 ---------- */

export function DeleteModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 modal-scrim flex items-center justify-center p-4 z-[55]">
      <div className="panel modal-sheet w-full max-w-sm p-6 sm:p-8 rise">
        <p className="eyebrow">Delete · 删除</p>
        <h3 className="font-serif font-normal text-[22px] sm:text-[24px] tracking-[-0.02em] mt-2 flex items-center gap-2 leading-snug">
          <Trash2 className="w-5 h-5 shrink-0" />
          确认移除此便签？
        </h3>
        <p className="text-[var(--fs-sm)] text-[var(--c-muted)] mt-3 leading-relaxed">
          将从所有协作者的屏幕上同步移除，且无法撤销。
        </p>
        <div className="mt-6 flex border border-[var(--c-border-soft)]">
          <button type="button" onClick={onCancel} className="btn btn-ghost flex-1 h-11 border-0 border-r border-[var(--c-border-soft)]">
            取消
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary flex-1 h-11 border-0">
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 历史版本 ---------- */

export function HistoryModal({
  room,
  historyList,
  historyLoading,
  isSavingSnapshot,
  newSnapshotName,
  setNewSnapshotName,
  snapshotCreator,
  setSnapshotCreator,
  onClose,
  onRefresh,
  onCreate,
  onRestore,
  onDelete,
}: {
  room: string;
  historyList: BoardHistoryItem[];
  historyLoading: boolean;
  isSavingSnapshot: boolean;
  newSnapshotName: string;
  setNewSnapshotName: (v: string) => void;
  snapshotCreator: string;
  setSnapshotCreator: (v: string) => void;
  onClose: () => void;
  onRefresh: () => void;
  onCreate: (e?: React.FormEvent) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 modal-scrim flex items-center justify-center p-4 z-50">
      <div className="panel modal-sheet w-full max-w-2xl flex flex-col h-[min(520px,90dvh)] rise">
        <div className="px-5 sm:px-6 py-4 border-b border-[var(--c-border-soft)] flex items-center justify-between">
          <div>
            <p className="eyebrow">Archive · 归档</p>
            <h3 className="font-serif font-normal text-[20px] sm:text-[22px] tracking-[-0.02em] mt-1 flex items-center gap-2">
              <History className="w-5 h-5" />
              历史版本
            </h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <div className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[var(--c-border-soft)] p-4 sm:p-5 flex flex-col gap-3 bg-[var(--c-bg)]">
            <div className="flex items-center gap-1.5 kicker">
              <Save className="w-3.5 h-3.5" />
              <span>Save · 保存快照</span>
            </div>
            <p className="text-[11px] text-[var(--c-muted)] leading-relaxed">
              有改动时系统每 15 分钟自动存档；也可在此手动打包，日后一键恢复。
            </p>
            <form onSubmit={onCreate} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="block mb-1 text-[10px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)]">
                  快照名称
                </label>
                <input
                  type="text"
                  placeholder="例如：第一轮讨论结束"
                  value={newSnapshotName}
                  onChange={(e) => setNewSnapshotName(e.target.value)}
                  className="field text-xs py-1.5"
                  maxLength={40}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-[10px] tracking-[var(--ls-widest)] uppercase text-[var(--c-muted-alt)]">
                  保存人
                </label>
                <input
                  type="text"
                  placeholder="署名"
                  value={snapshotCreator}
                  onChange={(e) => setSnapshotCreator(e.target.value)}
                  className="field text-xs py-1.5"
                  maxLength={15}
                />
              </div>
              <button
                type="submit"
                disabled={isSavingSnapshot}
                className="btn btn-primary w-full h-10 text-xs mt-1"
              >
                {isSavingSnapshot ? "正在保存…" : "打包并另存"}
              </button>
            </form>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-2.5 border-b border-[var(--c-border-soft)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--c-muted)] flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                归档列表（{historyList.length}）
              </span>
              <button type="button" onClick={onRefresh} className="btn btn-icon w-7 h-7" title="刷新">
                <RefreshCw className={`w-3 h-3 ${historyLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {historyLoading && historyList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--fs-xs)] text-[var(--c-muted-alt)] gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>正在检索…</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--fs-xs)] text-[var(--c-muted-alt)] py-12 gap-2 text-center px-6">
                  <History className="w-8 h-8 stroke-[1.5] opacity-40" />
                  <span className="font-serif text-[var(--c-muted)] text-[var(--fs-sm)]">暂无历史版本</span>
                  <p className="max-w-xs text-[10px] leading-relaxed">
                    白板有改动后，约每 15 分钟会自动出现一份存档；也可左侧手动打包。
                  </p>
                </div>
              ) : (
                <div className="border-t border-[var(--c-border-soft)]">
                  {historyList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="px-5 py-3.5 border-b border-[var(--c-border-soft)] flex items-center justify-between gap-4 hover:bg-[var(--c-surface)] transition-colors duration-300"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="font-serif text-[var(--fs-sm)] text-[var(--c-muted-alt)] shrink-0 w-6">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[var(--fs-sm)] text-[var(--c-ink)] truncate">{item.name}</span>
                            <span className="shrink-0 text-[10px] text-[var(--c-muted-alt)] border border-[var(--c-border-soft)] px-1.5 py-0.5">
                              {item.kind === "auto" ? "自动" : "手动"}
                            </span>
                            <span className="shrink-0 text-[10px] text-[var(--c-muted-alt)] border border-[var(--c-border-soft)] px-1.5 py-0.5">
                              {item.notesCount} 张
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] text-[var(--c-muted-alt)]">
                            {new Date(item.timestamp).toLocaleString("zh-CN")}
                            <span className="mx-1.5">·</span>
                            {item.creator}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0 shrink-0 border border-[var(--c-border-soft)]">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `确认将看板恢复到「${item.name}」？\n当前画布将被全量覆盖，并同步给所有协作者。`
                              )
                            ) {
                              onRestore(item.id);
                            }
                          }}
                          className="btn btn-ghost h-8 px-2.5 text-[10px] border-0 border-r border-[var(--c-border-soft)]"
                        >
                          恢复
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm("确认删除此备份？")) {
                              onDelete(item.id);
                            }
                          }}
                          className="btn btn-ghost h-8 w-8 border-0 p-0"
                          title="删除版本"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="panel-dark px-6 py-2.5 flex items-center justify-between text-[10px] tracking-wide">
          <span>
            Room · <span className="font-serif">{room}</span>
            <span className="opacity-70 ml-2">有改动 · 每 15 分钟自动存档</span>
          </span>
          <span className="opacity-70">最多保留 20 份</span>
        </div>
      </div>
    </div>
  );
}
