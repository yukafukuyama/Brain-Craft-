"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import type { Word } from "@/lib/words";

type LearnedWord = Word & { learnedAtDisplay?: string };

export default function LearnedPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [words, setWords] = useState<LearnedWord[]>([]);
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/words/learned")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { words: [], stats: { thisWeekCount: 0 } };
        }
        return res.json();
      })
      .then((data) => {
        setWords(data.words ?? []);
        setThisWeekCount(data.stats?.thisWeekCount ?? 0);
      })
      .catch(() => setWords([]))
      .finally(() => setLoading(false));
  }, [router]);

  const recent = words.slice(0, 3);
  const past = words.slice(3);
  const filteredPast = past.filter(
    (w) =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.includes(search)
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900 text-center">習得済み単語</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-gray-700">
            合計 <span className="font-bold text-green-600">{words.length}</span> 単語をマスターしました!
          </p>
          <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e">
              <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
            </svg>
          </span>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="習得した単語を検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Progress Card */}
      <div className="px-4 mb-6">
        <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-4">
          <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#eab308">
              <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
            </svg>
          </span>
          <div>
            <p className="font-bold text-gray-800">素晴らしい進捗です!</p>
            <p className="text-sm text-gray-600">今週は新たに{thisWeekCount}単語を習得しました。</p>
          </div>
        </div>
      </div>

      {/* Word Lists */}
      <main className="px-4 space-y-6">
        {loading ? (
          <p className="py-8 text-center text-gray-500">読み込み中...</p>
        ) : (
        <>
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">最近習得した単語</h2>
          <ul className="space-y-3">
            {recent.map((item) => (
              <li
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-gray-900">{item.word}</p>
                  <p className="text-sm text-gray-600">{item.meaning}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{item.learnedAtDisplay ?? item.learnedAt}</span>
                  <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">過去の習得</h2>
          <ul className="space-y-3">
            {filteredPast.map((item) => (
              <li
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-gray-900">{item.word}</p>
                  <p className="text-sm text-gray-600">{item.meaning}</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {words.length > 3 && (
        <button className="w-full py-3 text-green-600 font-medium flex items-center justify-center gap-2">
          さらに読み込む
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        )}
        </>
        )}
      </main>

      <BottomNav variant="4" />
    </div>
  );
}
