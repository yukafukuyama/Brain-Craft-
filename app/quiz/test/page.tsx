"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function QuizTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listParam = searchParams.get("list") ?? "";
  const [status, setStatus] = useState<"loading" | "ready" | "no-words">("loading");

  useEffect(() => {
    fetch("/api/words")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { words: [] };
        }
        return res.json();
      })
      .then((data) => {
        const words = (data.words ?? []).filter((w: { learnedAt?: string }) => !w.learnedAt);
        const filtered = listParam
          ? words.filter((w: { listName?: string }) => {
              const wList = (w.listName ?? "").trim() || "未分類";
              return wList === listParam;
            })
          : words;
        setStatus(filtered.length > 0 ? "ready" : "no-words");
      })
      .catch(() => setStatus("no-words"));
  }, [router, listParam]);

  return (
    <div className="min-h-screen bg-white px-4 pt-12 pb-20">
      <Link href="/quiz" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        問題に戻る
      </Link>

      {status === "loading" && (
        <p className="text-center text-gray-500 py-12">読み込み中...</p>
      )}

      {status === "no-words" && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">出題できる単語がありません。</p>
          <Link href="/quiz" className="text-blue-600 hover:underline">
            問題に戻る
          </Link>
        </div>
      )}

      {status === "ready" && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">テスト機能は準備中です。</p>
          <p className="text-sm text-gray-500 mb-6">
            {listParam ? `リスト「${listParam}」` : "すべてのリスト"}から出題する予定です。
          </p>
          <Link
            href="/quiz"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
          >
            問題に戻る
          </Link>
        </div>
      )}
    </div>
  );
}
