"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

export default function SettingsPage() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [lists, setLists] = useState<{ name: string; isNotificationEnabled: boolean }[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/lists")
      .then((res) => (res.ok ? res.json() : { lists: [] }))
      .then((data) => setLists(data.lists ?? []))
      .catch(() => setLists([]));
  }, []);

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

  const handleLogout = () => {
    setLoggingOut(true);
    window.location.href = "/api/auth/logout";
  };
  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">設定</h1>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">LINE通知</h2>
          <Link
            href="/notification"
            className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">通知の時間設定</span>
              <span className="text-blue-600 text-sm">→</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              時刻設定・LINEお知らせ登録
            </p>
          </Link>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">リスト管理</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500 mb-2">
              通知オフにしても学習データは保持され、オンに戻すと通知が再開されます。
            </p>
            <ul className="space-y-2">
              {lists.map((list) => (
                <li
                  key={list.name}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                >
                  <span className="text-gray-800">{list.name}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="shrink-0">通知</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={list.isNotificationEnabled}
                        disabled={toggling === list.name}
                        onClick={() =>
                          handleToggleNotification(list.name, !list.isNotificationEnabled)
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                          list.isNotificationEnabled ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            list.isNotificationEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-gray-500 w-8">
                        {list.isNotificationEnabled ? "ON" : "OFF"}
                      </span>
                    </label>
                    {list.name !== "未分類" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteList(list.name)}
                        disabled={deleting === list.name}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deleting === list.name ? "削除中..." : "削除"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">アカウント</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-gray-700">LINEでログイン済み</p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              {loggingOut ? "ログアウト中..." : "ログアウト"}
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">その他</h2>
          <div className="space-y-2">
            <a href="#" className="block py-3 text-gray-700 hover:text-blue-600">
              利用規約
            </a>
            <a href="#" className="block py-3 text-gray-700 hover:text-blue-600">
              プライバシーポリシー
            </a>
          </div>
        </section>

        <div className="pt-8 flex flex-col items-center gap-2">
          <Logo size={48} />
          <p className="text-xs text-gray-400">© 2026 BRAINCRAFT</p>
          <p className="text-xs text-gray-400">YUKA FUKUYAMA</p>
        </div>
      </main>

      <BottomNav variant="4" />
    </div>
  );
}
