"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/components/LanguageProvider";
import type { Locale } from "@/lib/settings-store";

export default function SettingsPage() {
  const { t, locale, setLocale } = useLanguage();
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingLang, setSavingLang] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    window.location.href = "/api/auth/logout";
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Locale;
    setSavingLang(true);
    await setLocale(value);
    setSavingLang(false);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">{t("settings.title")}</h1>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">{t("settings.language")}</h2>
          <div className="p-4 bg-gray-50 rounded-xl">
            <select
              value={locale}
              onChange={handleLanguageChange}
              disabled={savingLang}
              className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">{t("settings.lineNotification")}</h2>
          <Link
            href="/notification"
            className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">{t("settings.notificationTime")}</span>
              <span className="text-blue-600 text-sm">→</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {locale === "ja" ? "時刻設定・LINEお知らせ登録" : locale === "zh" ? "设置时间 & LINE 通知" : "Set time & LINE notifications"}
            </p>
          </Link>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">{t("settings.listManagement")}</h2>
          <Link
            href="/lists"
            className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">{t("settings.listsNotification")}</span>
              <span className="text-blue-600 text-sm">→</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("lists.notificationOnOff")}
            </p>
          </Link>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">{t("settings.account")}</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-gray-700">{t("settings.loggedIn")}</p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="font-bold text-base text-red-600 hover:underline disabled:opacity-50"
            >
              {loggingOut ? t("settings.loggingOut") : t("settings.logout")}
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-2">{t("settings.other")}</h2>
          <div className="space-y-2">
            <a href="#" className="block py-3 text-gray-700 hover:text-blue-600">
              {t("settings.terms")}
            </a>
            <a href="#" className="block py-3 text-gray-700 hover:text-blue-600">
              {t("settings.privacy")}
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
