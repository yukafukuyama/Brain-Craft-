"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { useLanguage } from "@/components/LanguageProvider";

const LINE_ADD_FRIEND_URL = (() => {
  const url = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL?.trim();
  if (!url || !url.startsWith("https://line.me")) return "";
  return url;
})();

const LINE_DEEP_LINK = LINE_ADD_FRIEND_URL
  ? LINE_ADD_FRIEND_URL.replace(/^https:\/\/line\.me\/R?\/?/, "line://")
  : "";

const SLOT_COUNT = 5;

function isValidTime(s: string): boolean {
  return /^\d{1,2}:\d{1,2}$/.test(s.trim());
}

export default function NotificationPage() {
  const { t } = useLanguage();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [idiomNotificationsEnabled, setIdiomNotificationsEnabled] = useState(true);
  const [notificationTimes, setNotificationTimes] = useState<(string | null)[]>(
    Array(SLOT_COUNT).fill(null)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const timeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/settings/notification")
      .then((res) => (res.ok ? res.json() : { enabled: false, times: [] }))
      .then((data: { enabled?: boolean; time?: string; times?: string[]; idiomNotificationsEnabled?: boolean }) => {
        setNotificationEnabled(data.enabled ?? false);
        setIdiomNotificationsEnabled(data.idiomNotificationsEnabled !== false);
        const ts = data.times ?? (data.time ? [data.time] : []);
        const filled: (string | null)[] = Array(SLOT_COUNT).fill(null);
        ts.slice(0, SLOT_COUNT).forEach((t, i) => {
          if (t && isValidTime(t)) filled[i] = t;
        });
        setNotificationTimes(filled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getValidTimes = (times: (string | null)[]): string[] => {
    return times.filter((t): t is string => t != null && t.trim() !== "" && isValidTime(t));
  };

  const checkDuplicates = (times: (string | null)[]): string[] => {
    const valid = getValidTimes(times);
    const seen = new Set<string>();
    const dups: string[] = [];
    for (const t of valid) {
      if (seen.has(t)) dups.push(t);
      else seen.add(t);
    }
    return [...new Set(dups)];
  };

  const handleSaveNotification = async (overrides?: { enabled?: boolean; times?: (string | null)[]; idiomNotificationsEnabled?: boolean }) => {
    const times = overrides?.times ?? notificationTimes;
    const valid = getValidTimes(times);
    const dups = checkDuplicates(times);
    if (dups.length > 0) {
      setDuplicateWarning(t("notification.duplicateTimes"));
      return;
    }
    setDuplicateWarning(null);
    setSaving(true);
    setSaved(false);
    try {
      const enabled = overrides?.enabled ?? notificationEnabled;
      const res = await fetch("/api/settings/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          times: valid, // 空の場合は [] で通知なし
          idiomNotificationsEnabled: overrides?.idiomNotificationsEnabled ?? idiomNotificationsEnabled,
        }),
      });
      if (res.ok) {
        if (overrides?.enabled !== undefined) setNotificationEnabled(overrides.enabled);
        if (overrides?.times !== undefined) setNotificationTimes(overrides.times);
        if (overrides?.idiomNotificationsEnabled !== undefined) setIdiomNotificationsEnabled(overrides.idiomNotificationsEnabled);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const next = [...notificationTimes];
    next[index] = value.trim() === "" ? null : value;
    setNotificationTimes(next);
    setDuplicateWarning(null);
  };

  const handleClearSlot = (index: number) => {
    const next = [...notificationTimes];
    next[index] = null;
    setNotificationTimes(next);
    setDuplicateWarning(null);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">{t("notification.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("notification.subtitle")}
        </p>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        <section className="bg-gray-50 rounded-xl p-4 space-y-4">
          {loading ? (
            <p className="text-gray-500">{t("quiz.loading")}</p>
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
                <span className="text-gray-700 font-medium">{t("notification.dailyNotify")}</span>
              </label>

              {notificationEnabled && (
                <div className="space-y-3 pt-2 border-t border-gray-200">
                  <span className="block text-sm font-medium text-gray-700">
                    {t("notification.sendTimeLabel")}
                  </span>
                  <p className="text-xs text-gray-500">{t("notification.timeHint")}</p>

                  <div className="space-y-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 w-full min-w-0">
                        <div className="relative flex-1 min-w-0 overflow-hidden">
                          <input
                            ref={(el) => { timeInputRefs.current[i] = el; }}
                            type="time"
                            value={notificationTimes[i] ?? ""}
                            onChange={(e) => handleTimeChange(i, e.target.value)}
                            onClick={() => {
                              timeInputRefs.current[i]?.showPicker?.();
                            }}
                            className={`w-full max-w-full px-4 py-2.5 rounded-lg border text-base min-h-[42px] touch-manipulation box-border ${
                              notificationTimes[i]
                                ? "bg-white border-gray-200"
                                : "bg-white border-dashed border-gray-300"
                            }`}
                          />
                          {!notificationTimes[i] && (
                            <button
                              type="button"
                              onClick={() => {
                                timeInputRefs.current[i]?.showPicker?.();
                                timeInputRefs.current[i]?.focus();
                              }}
                              className="absolute inset-0 w-full flex items-center justify-center text-gray-400 text-base cursor-pointer rounded-lg border-0 bg-transparent touch-manipulation"
                            >
                              --:--
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleClearSlot(i)}
                          aria-label={`スロット${i + 1}をクリア`}
                          className="flex-shrink-0 min-w-[40px] min-h-[40px] w-10 h-10 p-2 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {duplicateWarning && (
                    <p className="text-sm text-amber-600">{duplicateWarning}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveNotification()}
                    disabled={saving}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? t("notification.saving") : t("notification.save")}
                  </button>
                </div>
              )}

              {saved && (
                <p className="text-sm text-green-600 font-medium">✓ {t("notification.saved")}</p>
              )}

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
                className="w-full py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50"
              >
                今すぐ送信してテスト
              </button>

              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">{t("notification.idiomLabel")}</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIdiomNotificationsEnabled(true);
                      handleSaveNotification({ enabled: notificationEnabled, times: notificationTimes, idiomNotificationsEnabled: true });
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      idiomNotificationsEnabled
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    ON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdiomNotificationsEnabled(false);
                      handleSaveNotification({ enabled: notificationEnabled, times: notificationTimes, idiomNotificationsEnabled: false });
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      !idiomNotificationsEnabled
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    OFF
                  </button>
                </div>
              </div>

              <Link
                href="/lists"
                className="flex items-center justify-between w-full py-3 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <span className="text-gray-800 font-medium">{t("settings.listsNotification")}</span>
                <span className="text-blue-600 text-sm">→</span>
              </Link>
            </>
          )}
        </section>

        {LINE_ADD_FRIEND_URL && (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500">LINE通知を受け取る</h2>
            <p className="text-sm text-gray-600">
              友だち追加すると、設定した時刻に復習通知がLINEに届きます。
            </p>
            <a
              href={LINE_ADD_FRIEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (LINE_DEEP_LINK && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                  e.preventDefault();
                  window.location.href = LINE_DEEP_LINK;
                }
              }}
              className="flex w-full items-center justify-center gap-2 py-4 bg-[#00c300] hover:bg-[#00a800] text-white font-medium rounded-xl transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755z" />
              </svg>
              LINE通知の登録（友だち追加）
            </a>
          </section>
        )}

        <div className="space-y-2 text-sm text-gray-500">
          <p>※ cron-job.org でcronを設定すると、指定時刻に自動送信されます</p>
          <p className="text-amber-600">
            通知が来ない場合：LINEの設定→通知→「メッセージ通知」をONに。トーク画面右上→通知ONを確認してください。
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/settings"
            className="text-blue-600 hover:underline text-sm"
          >
            ← 設定にもどる
          </Link>
        </div>
      </main>

      <BottomNav variant="4" />
    </div>
  );
}
