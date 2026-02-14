"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

export default function SettingsPage() {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState<string[]>(["08:00", "", ""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/notification")
      .then((res) => (res.ok ? res.json() : { enabled: false, times: ["08:00"] }))
      .then((data: { enabled?: boolean; time?: string; times?: string[] }) => {
        setNotificationEnabled(data.enabled ?? false);
        const ts = data.times ?? (data.time ? [data.time] : ["08:00"]);
        setNotificationTimes([ts[0] ?? "08:00", ts[1] ?? "", ts[2] ?? ""]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveNotification = async (overrides?: { enabled?: boolean; times?: string[] }) => {
    setSaving(true);
    setSaved(false);
    try {
      const enabled = overrides?.enabled ?? notificationEnabled;
      const times = (overrides?.times ?? notificationTimes).filter((t) => t.trim());
      const res = await fetch("/api/settings/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, times: times.length ? times : ["08:00"] }),
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
                      handleSaveNotification({ enabled: checked, times: notificationTimes });
                    }}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-gray-700">毎日お知らせを送る</span>
                </label>
                {notificationEnabled && (
                  <div className="space-y-2">
                    <span className="block text-sm text-gray-700">送信時刻（最大3つ、日本時間）</span>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2].map((i) => (
                        <input
                          key={i}
                          type="time"
                          value={notificationTimes[i] ?? ""}
                          onChange={(e) => {
                            const next = [...notificationTimes];
                            next[i] = e.target.value;
                            setNotificationTimes(next);
                          }}
                          className="px-3 py-2 bg-white rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveNotification()}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "保存中..." : "保存"}
                    </button>
                  </div>
                )}
                {saved && <p className="text-xs text-green-600">保存しました</p>}
                <p className="text-xs text-gray-500">
                  設定した時刻に、登録した単語の復習通知がLINEに届きます。（cron-job.orgの設定が必要です）
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
