"use client";

import { useEffect } from "react";
import { Logo } from "@/components/Logo";

/**
 * 中間ページ：ブラウザがドメインを認識してからLINE認証へ遷移
 * （スマホ・LINEアプリ内で1回でログインできるようにする）
 */
export default function LoginPage() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.replace("/api/auth/line?n=" + Date.now());
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Logo size={120} className="mb-4" />
      <p className="text-gray-600 animate-pulse">LINEでログイン中...</p>
    </main>
  );
}
