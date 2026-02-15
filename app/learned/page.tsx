"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { useLanguage } from "@/components/LanguageProvider";
import type { Word } from "@/lib/words";

type LearnedWord = Word & { learnedAtDisplay?: string };

export default function LearnedPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [words, setWords] = useState<LearnedWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/words/learned")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { words: [] };
        }
        return res.json();
      })
      .then((data) => {
        setWords(data.words ?? []);
      })
      .catch(() => setWords([]))
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (wordId: string) => {
    if (!confirm(t("learned.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/words/${wordId}`, { method: "DELETE" });
      if (res.ok) {
        setWords((prev) => prev.filter((w) => w.id !== wordId));
      }
    } catch {
      // ignore
    }
  };

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
        <h1 className="text-xl font-bold text-gray-900 text-center">{t("learned.title")}</h1>
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
            placeholder={t("learned.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Progress Card */}
      <div className="px-4 mb-6">
        <div className="bg-amber-50 rounded-2xl p-4 flex items-center justify-center gap-2">
          <p className="font-normal text-gray-800 text-center">
            {t("learned.total")} <span className="font-extrabold text-4xl text-red-600">{words.length}</span> {t("learned.mastered")}
            <span className="text-4xl ml-1">🎊</span>
          </p>
        </div>
      </div>

      {/* Word Lists */}
      <main className="px-4 space-y-6">
        {loading ? (
          <p className="py-8 text-center text-gray-500">{t("learned.loading")}</p>
        ) : (
        <>
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">{t("learned.recent")}</h2>
          <ul className="space-y-3">
            {recent.map((item) => (
              <li
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <Link href={`/words/${item.id}/edit`} className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{item.word}</p>
                  <p className="text-sm text-gray-600">{item.meaning}</p>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{item.learnedAtDisplay ?? item.learnedAt}</span>
                  <span className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(item.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600"
                    aria-label={t("words.delete")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">{t("learned.past")}</h2>
          <ul className="space-y-3">
            {filteredPast.map((item) => (
              <li
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <Link href={`/words/${item.id}/edit`} className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{item.word}</p>
                  <p className="text-sm text-gray-600">{item.meaning}</p>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(item.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600"
                    aria-label={t("words.delete")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {words.length > 3 && (
        <button className="w-full py-3 text-amber-600 font-medium flex items-center justify-center gap-2">
          {t("learned.loadMore")}
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
