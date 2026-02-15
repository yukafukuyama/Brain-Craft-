"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { WeeklyProgressCard } from "@/components/WeeklyProgressCard";
import { useLanguage } from "@/components/LanguageProvider";

type ListItem = { name: string; isNotificationEnabled: boolean };
type QuizType = "word" | "idiom" | "both";

export default function QuizPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [quizType, setQuizType] = useState<QuizType>("both");
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
    const typeParam = quizType === "both" ? "" : quizType;
    const url = typeParam ? `/api/words?type=${typeParam}` : "/api/words";
    fetch(url, { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { words: [] };
        }
        return res.ok ? res.json() : { words: [] };
      })
      .then((data) => {
        const words = (data.words ?? []) as { listName?: string; learnedAt?: string; word?: string; meaning?: string }[];
        const notLearned = words.filter((w) => {
          if (w.learnedAt) return false;
          const word = (w.word ?? "").trim();
          const meaning = (w.meaning ?? "").trim();
          return word.length > 0 && meaning.length > 0;
        });
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
  }, [router, selectedList, quizType]);

  const handleStartTest = () => {
    if (wordCount === 0) return;
    const params = new URLSearchParams();
    if (selectedList) params.set("list", selectedList);
    if (quizType !== "both") params.set("type", quizType);
    const qs = params.toString() ? `?${params.toString()}` : "";
    router.push(`/quiz/test${qs}`);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">{t("quiz.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("quiz.subtitle")}
        </p>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        <section className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("quiz.typeLabel")}</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              {(["both", "word", "idiom"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setQuizType(type)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    quizType === type
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-r border-gray-200 last:border-r-0"
                  }`}
                >
                  {type === "both" ? (
                    t("quiz.typeBoth")
                  ) : type === "word" ? (
                    t("quiz.typeWord")
                  ) : (
                    <span className="whitespace-nowrap">{t("quiz.typeIdiom")}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("quiz.listLabel")}</label>
            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t("quiz.allLists")}</option>
              <option value="未分類">未分類</option>
              {lists.filter((l) => l.name !== "未分類").map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">{t("quiz.loading")}</p>
          ) : (
            <p className="text-sm text-gray-600">
              {t("quiz.availableLabel")}: <span className="font-bold text-blue-600">{wordCount}</span>
            </p>
          )}

          <button
            type="button"
            onClick={handleStartTest}
            disabled={loading || wordCount === 0}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
          >
            {t("quiz.startTest")}
          </button>

          {wordCount === 0 && !loading && (
            <p className="text-sm text-amber-600">
              {t("quiz.noItems")}
            </p>
          )}
        </section>

        <WeeklyProgressCard />
      </main>

      <BottomNav variant="4" />
    </div>
  );
}
