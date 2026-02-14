"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

export default function SettingsPage() {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/notification")
      .then((res) => (res.ok ? res.json() : { enabled: false, times: ["08:00"] }))
      .then((data: { enabled?: boolean }) => {
        setNotificationEnabled(data.enabled ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveNotification = async (overrides?: { enabled?: boolean }) => {
    setSaving(true);
    setSaved(false);
    try {
      const enabled = overrides?.enabled ?? notificationEnabled;
      const res = await fetch("/api/settings/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, time: "08:00" }),
      });
      if (res.ok) {
        if (overrides?.enabled !== undefined) setNotificationEnabled(overrides.enabled);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">設定</h1>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">LINE通知</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            {loading ? (
              <p className="text-gray-500">読み込み中...</p>
            ) : (
              <>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationEnabled}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNotificationEnabled(checked);
                      handleSaveNotification({ enabled: checked });
                    }}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-gray-700">毎日お知らせを送る</span>
                </label>
                {saved && <p className="text-xs text-green-600">保存しました</p>}
                <p className="text-xs text-gray-500">
                  毎日8:00（日本時間）に、登録した単語の復習通知がLINEに届きます。
                </p>
                <p className="text-xs text-amber-600">
                  ※通知が来ない場合：LINEの設定→通知→「メッセージ通知」をONに。トーク画面右上→通知ONを確認してください。
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/settings/notification/send-now", {
                        method: "POST",
                      });
                      const data = await res.json();
                      if (res.ok) {
                        alert("LINEに送信しました！");
                      } else {
                        alert(data.error || "送信に失敗しました");
                      }
                    } catch {
                      alert("通信エラー");
                    }
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  今すぐ送信してテスト
                </button>
              </>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">アカウント</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-gray-700">LINEでログイン済み</p>
            <a
              href="/api/auth/logout"
              className="text-sm text-red-600 hover:underline"
            >
              ログアウト
            </a>
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
          <p className="text-xs text-gray-400">© 2024 BRAINCRAFT</p>
        </div>
      </main>

      <BottomNav variant="4" />
    </div>
  );
}
