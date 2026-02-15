"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

type ListItem = { name: string; isNotificationEnabled: boolean };

export default function QuizPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lists", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { lists: [] };
        }
        return res.ok ? res.json() : { lists: [] };
      })
      .then((data) => setLists(data.lists ?? []))
      .catch(() => setLists([]));
  }, [router]);

  useEffect(() => {
    fetch("/api/words", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { words: [] };
        }
        return res.ok ? res.json() : { words: [] };
      })
      .then((data) => {
        const words = (data.words ?? []) as { listName?: string; learnedAt?: string }[];
        const notLearned = words.filter((w) => !w.learnedAt);
        if (selectedList === "") {
          setWordCount(notLearned.length);
        } else {
          const count = notLearned.filter((w) => {
            const wList = (w.listName ?? "").trim() || "未分類";
            return wList === selectedList;
          }).length;
          setWordCount(count);
        }
      })
      .catch(() => setWordCount(0))
      .finally(() => setLoading(false));
  }, [router, selectedList]);

  const handleStartTest = () => {
    if (wordCount === 0) return;
    const params = selectedList ? `?list=${encodeURIComponent(selectedList)}` : "";
    router.push(`/quiz/test${params}`);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">問題</h1>
        <p className="text-sm text-gray-500 mt-1">
          リストを選んで、単語の復習テストを始めましょう
        </p>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        <section className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">出題するリスト</label>
            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべてのリスト</option>
              <option value="未分類">未分類</option>
              {lists.filter((l) => l.name !== "未分類").map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">読み込み中...</p>
          ) : (
            <p className="text-sm text-gray-600">
              出題可能な単語：<span className="font-bold text-blue-600">{wordCount}</span> 語
            </p>
          )}

          <button
            type="button"
            onClick={handleStartTest}
            disabled={loading || wordCount === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
          >
            テストを開始する
          </button>

          {wordCount === 0 && !loading && (
            <p className="text-sm text-amber-600">
              出題できる単語がありません。単語を登録するか、別のリストを選んでください。
            </p>
          )}
        </section>

        <Link
          href="/learned"
          className="block py-3 px-4 text-center text-sm text-gray-600 hover:text-blue-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          完了した単語を見る
        </Link>
      </main>

      <BottomNav variant="4" />
    </div>
  );
}
