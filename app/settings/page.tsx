"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";

export default function SettingsPage() {
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
