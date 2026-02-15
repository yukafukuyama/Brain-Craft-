"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

type ListItem = { name: string; isNotificationEnabled: boolean };

export default function ListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [modalList, setModalList] = useState<ListItem | null>(null);

  useEffect(() => {
    fetch("/api/lists")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { lists: [] };
        }
        return res.ok ? res.json() : { lists: [] };
      })
      .then((data) => setLists(data.lists ?? []))
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, [router]);

  const handleToggleNotification = async (name: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/lists/${encodeURIComponent(name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        setLists((prev) =>
          prev.map((l) => (l.name === name ? { ...l, isNotificationEnabled: enabled } : l))
        );
        if (modalList?.name === name) setModalList({ ...modalList, isNotificationEnabled: enabled });
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">リスト一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            各リストの通知ON/OFFを切り替えられます。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          className={`shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
            editMode
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {editMode ? "完了" : "編集"}
        </button>
      </header>

      <main className="px-4 max-w-lg mx-auto">
        {loading ? (
          <p className="py-12 text-center text-gray-500">読み込み中...</p>
        ) : lists.length === 0 ? (
          <p className="py-12 text-center text-gray-500">リストがありません</p>
        ) : (
          <div className="space-y-4">
            {lists.map((list) => (
              <div
                key={list.name}
                className={`rounded-2xl p-5 shadow-sm border transition-all ${
                  list.isNotificationEnabled
                    ? "bg-white border-gray-200"
                    : "bg-gray-50 border-gray-100 opacity-85"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div
                    className={`flex items-center gap-3 min-w-0 flex-1 ${editMode ? "cursor-pointer" : ""}`}
                    onClick={editMode ? () => setModalList(list) : undefined}
                    onKeyDown={
                      editMode
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setModalList(list);
                            }
                          }
                        : undefined
                    }
                    role={editMode ? "button" : undefined}
                    tabIndex={editMode ? 0 : undefined}
                  >
                    {!list.isNotificationEnabled && (
                      <span
                        className="shrink-0 w-7 h-7 flex items-center justify-center text-base"
                        aria-hidden
                      >
                        🔕
                      </span>
                    )}
                    <div className="min-w-0">
                      <h2 className="font-bold text-gray-900 truncate">{list.name}</h2>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {list.isNotificationEnabled ? "通知ON" : "通知OFF"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {!editMode && (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={list.isNotificationEnabled}
                        aria-label={`${list.name}の通知`}
                        onClick={() =>
                          handleToggleNotification(list.name, !list.isNotificationEnabled)
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 touch-manipulation ${
                          list.isNotificationEnabled ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                            list.isNotificationEnabled ? "left-6" : "left-0.5"
                          }`}
                        />
                      </button>
                    )}
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => setModalList(list)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        aria-label="編集"
                        title="編集"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalList && (
        <ListEditModal
          list={modalList}
          onClose={() => setModalList(null)}
          onSave={(updated) => {
            setLists((prev) =>
              prev.map((l) => (l.name === modalList.name ? updated : l))
            );
            setModalList(updated);
          }}
          onDelete={() => {
            setLists((prev) => prev.filter((l) => l.name !== modalList.name));
            setModalList(null);
          }}
        />
      )}

      <BottomNav variant="4" />
    </div>
  );
}

function ListEditModal({
  list,
  onClose,
  onSave,
  onDelete,
}: {
  list: ListItem;
  onClose: () => void;
  onSave: (updated: ListItem) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(list.name);
  const [enabled, setEnabled] = useState(list.isNotificationEnabled);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(list.name);
    setEnabled(list.isNotificationEnabled);
  }, [list.name, list.isNotificationEnabled]);

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === list.name) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/lists/${encodeURIComponent(list.name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: trimmed }),
      });
      if (res.ok) onSave({ name: trimmed, isNotificationEnabled: enabled });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    const next = !enabled;
    setEnabled(next);
    try {
      const res = await fetch(`/api/lists/${encodeURIComponent(list.name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (res.ok) onSave({ ...list, isNotificationEnabled: next });
    } catch {
      setEnabled(enabled);
    }
  };

  const handleDelete = async () => {
    if (list.name === "未分類") return;
    if (!confirm("中の単語もすべて削除されますがよろしいですか？")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/lists/${encodeURIComponent(list.name)}`, { method: "DELETE" });
      if (res.ok) onDelete();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">リストを編集</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">リスト名</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={list.name !== "未分類" ? handleSaveName : undefined}
                readOnly={list.name === "未分類"}
                disabled={list.name === "未分類"}
                className={`flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 ${
                  list.name === "未分類" ? "bg-gray-100 text-gray-500" : "bg-gray-100"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">通知</label>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                enabled ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                  enabled ? "left-6" : "left-0.5"
                }`}
              />
            </button>
            <span className="ml-2 text-sm text-gray-600">{enabled ? "ON" : "OFF"}</span>
          </div>

          {list.name !== "未分類" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "削除中..." : "リストを削除"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
