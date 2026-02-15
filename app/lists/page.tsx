"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

type ListItem = { name: string; isNotificationEnabled: boolean };

export default function ListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

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
    setToggling(name);
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
      }
    } catch {
      // ignore
    } finally {
      setToggling(null);
    }
  };

  const handleDeleteList = async (name: string) => {
    if (name === "未分類") return;
    if (!confirm(`「${name}」を削除しますか？\n中の単語は「未分類」に移動します。`)) return;
    setDeleting(name);
    try {
      const res = await fetch(`/api/lists/${encodeURIComponent(name)}`, { method: "DELETE" });
      if (res.ok) setLists((prev) => prev.filter((l) => l.name !== name));
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">リスト一覧</h1>
        <p className="text-sm text-gray-500 mt-1">
          各リストの通知ON/OFFを切り替えられます。オフにしても学習データは保持されます。
        </p>
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
                  <div className="flex items-center gap-3 min-w-0">
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
                    <button
                      type="button"
                      role="switch"
                      aria-checked={list.isNotificationEnabled}
                      aria-label={`${list.name}の通知を${list.isNotificationEnabled ? "オフ" : "オン"}にする`}
                      disabled={toggling === list.name}
                      onClick={() =>
                        handleToggleNotification(list.name, !list.isNotificationEnabled)
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 touch-manipulation ${
                        list.isNotificationEnabled ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                          list.isNotificationEnabled ? "left-6" : "left-0.5"
                        }`}
                      />
                    </button>
                    {list.name !== "未分類" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteList(list.name)}
                        disabled={deleting === list.name}
                        className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 touch-manipulation"
                      >
                        {deleting === list.name ? "削除中..." : "削除"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav variant="4" />
    </div>
  );
}
