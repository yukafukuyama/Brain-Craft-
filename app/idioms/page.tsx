"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { WordDetailCard } from "@/components/WordDetailCard";
import type { Word } from "@/lib/words";

export default function IdiomsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterList, setFilterList] = useState<string>("");
  const [lists, setLists] = useState<{ name: string; isNotificationEnabled: boolean }[]>([]);
  const [idioms, setIdioms] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  useEffect(() => {
    fetch("/api/words?type=idiom", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { words: [] };
        }
        return res.json();
      })
      .then((data) => setIdioms(data.words ?? []))
      .catch(() => setIdioms([]))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/lists", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { lists: [] }))
      .then((data) => setLists(data.lists ?? []))
      .catch(() => setLists([]));
  }, []);

  const filteredIdioms = idioms
    .filter((w) => !w.learnedAt)
    .filter((w) => {
      if (filterList) {
        const wList = w.listName?.trim() || "未分類";
        if (wList !== filterList) return false;
      }
      return true;
    })
    .filter(
      (w) =>
        w.word.toLowerCase().includes(search.toLowerCase()) ||
        w.meaning.includes(search)
    );

  const handleLearned = async (wordId: string) => {
    try {
      const res = await fetch(`/api/words/${wordId}/learn`, { method: "POST" });
      if (res.ok) {
        setIdioms((prev) => prev.map((w) => (w.id === wordId ? { ...w, learnedAt: new Date().toISOString().slice(0, 10) } : w)));
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">イディオム一覧</h1>
        <div className="flex items-center gap-1">
          <Link href="/home" className="p-2 text-blue-600" aria-label="イディオム登録">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
          <Link href="/notification" className="p-2 text-blue-600" aria-label="通知設定">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </Link>
          <Link href="/lists" className="p-2 text-blue-600" aria-label="リスト">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="4" cy="6" r="1.5" />
              <circle cx="4" cy="12" r="1.5" />
              <circle cx="4" cy="18" r="1.5" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="px-4 mb-4 space-y-3">
        <select
          value={filterList}
          onChange={(e) => setFilterList(e.target.value)}
          className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">すべてのリスト</option>
          {lists.map((l) => (
            <option key={l.name} value={l.name}>{l.name}</option>
          ))}
        </select>
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="イディオムを検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <main className="px-4">
        {loading ? (
          <p className="py-8 text-center text-gray-500">読み込み中...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredIdioms.map((item) => (
              <li key={item.id} className="py-4 flex items-start justify-between gap-4">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setSelectedWord(item)}
                >
                  <div className="flex items-center gap-2 flex-wrap w-full">
                    <span className="font-bold text-gray-900">{item.word}</span>
                    {(item.listName?.trim() || "未分類") !== "未分類" && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded text-gray-600">
                        {item.listName}
                      </span>
                    )}
                    {item.containedWords && item.containedWords.length > 0 && (
                      <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {item.containedWords.map((w) => (
                          <Link
                            key={w}
                            href={`/words?q=${encodeURIComponent(w)}`}
                            className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
                          >
                            {w}
                          </Link>
                        ))}
                      </div>
                    )}
                    <span onClick={(e) => e.stopPropagation()} className="ml-auto shrink-0">
                      <Link href={`/words/${item.id}/edit`} className="text-blue-600 p-1 inline-block" aria-label="編集">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{item.meaning}</p>
                  <p className="text-sm text-gray-500 mt-1 italic line-clamp-2">&quot;{item.example}&quot;</p>
                </div>
                <button
                  onClick={() => handleLearned(item.id)}
                  className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  覚えた！
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {selectedWord && (
        <WordDetailCard word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}

      <BottomNav variant="4" />
    </div>
  );
}
