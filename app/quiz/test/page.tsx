"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { saveQuizProgress } from "@/lib/quiz-progress";
import { WeeklyProgressCard } from "@/components/WeeklyProgressCard";
import { useLanguage } from "@/components/LanguageProvider";

const QUIZ_SESSION_SIZE = 10;

type QuizWord = {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  question?: string;
  answer?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const listParam = searchParams.get("list") ?? "";
  const typeParam = (searchParams.get("type") ?? "both") as "word" | "idiom" | "both";
  const [status, setStatus] = useState<"loading" | "no-words" | "quiz" | "done">("loading");
  const [quizWords, setQuizWords] = useState<QuizWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const loadWords = useCallback(() => {
    setStatus("loading");
    const url = typeParam !== "both" ? `/api/words?type=${typeParam}` : "/api/words";
    fetch(url, { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { words: [] };
        }
        return res.json();
      })
      .then((data) => {
        const words = (data.words ?? []).filter((w: { learnedAt?: string; word?: string; meaning?: string }) => {
          if (w.learnedAt) return false;
          const word = (w.word ?? "").trim();
          const meaning = (w.meaning ?? "").trim();
          return word.length > 0 && meaning.length > 0;
        });
        const filtered = listParam
          ? words.filter((w: { listName?: string }) => {
              const wList = (w.listName ?? "").trim() || "未分類";
              return wList === listParam;
            })
          : words;
        if (filtered.length === 0) {
          setStatus("no-words");
          return;
        }
        const shuffled = shuffle(filtered as QuizWord[]);
        setQuizWords(shuffled.slice(0, QUIZ_SESSION_SIZE));
        setStatus("quiz");
        setCurrentIndex(0);
        setRevealed(false);
      })
      .catch(() => setStatus("no-words"));
  }, [router, listParam, typeParam]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  useEffect(() => {
    if (status === "done") {
      setShowChart(false);
      const timer = setTimeout(() => setShowChart(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowChart(false);
    }
  }, [status]);

  const currentWord = quizWords[currentIndex];
  const isLastCard = currentIndex === quizWords.length - 1;
  const total = quizWords.length;

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleNext = () => {
    if (isLastCard) {
      saveQuizProgress(total);
      setStatus("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-12 pb-20">
      <Link href="/quiz" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t("quiz.backToList")}
      </Link>

      {status === "loading" && (
        <p className="text-center text-gray-500 py-12">{t("quiz.loading")}</p>
      )}

      {status === "no-words" && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{t("quiz.noWords")}</p>
          <Link href="/quiz" className="text-blue-600 hover:underline">
            {t("quiz.backToList")}
          </Link>
        </div>
      )}

      {status === "quiz" && currentWord && (
        <div className="space-y-6 max-w-lg mx-auto">
          <p className="text-sm text-gray-500 text-center">
            {currentIndex + 1} / {total}
          </p>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm min-h-[200px] max-h-[60vh] flex flex-col">
            <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
              {currentWord.question ? (
                <div className="space-y-2">
                  {currentWord.question.split("\n").map((line, i) => (
                    <p
                      key={i}
                      className={
                        line.startsWith("（訳）")
                          ? "text-sm text-gray-500"
                          : "text-lg font-medium text-gray-800"
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-lg font-medium text-gray-800">
                  {t("quiz.meaningLabel")}: {currentWord.meaning}
                </p>
              )}

              {revealed && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <p className="text-xl font-bold text-blue-600">{currentWord.word}</p>
                  {currentWord.example && (
                    <div className="text-sm text-gray-600 space-y-1">
                      {currentWord.example.split("\n").map((line, i) => (
                        <p key={i} className={i === 0 ? "italic" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              {!revealed ? (
                <button
                  type="button"
                  onClick={handleReveal}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  {t("quiz.revealAnswer")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  {isLastCard ? t("quiz.done") : t("quiz.next")}
                </button>
              )}
            </div>
          </div>

          {revealed && !isLastCard && (
            <p className="text-center text-sm text-gray-500">
              {t("quiz.nextHint")}
            </p>
          )}
        </div>
      )}

      {status === "done" && (
        <div className="space-y-8 max-w-lg mx-auto">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900">{t("quiz.resultTitle")}</h2>
            <p className="text-gray-600 mt-2">
              {total} {t("quiz.resultCount")}
            </p>
          </div>
          <div
            className={`transition-all duration-700 ease-out ${
              showChart ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <WeeklyProgressCard />
          </div>
          <button
            type="button"
            onClick={loadWords}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
          >
            {t("quiz.another10")}
          </button>
          <Link
            href="/quiz"
            className="flex items-center justify-center gap-2 w-full py-4 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t("quiz.backToListResult")}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function QuizTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white px-4 pt-12 pb-20">
          <Link href="/quiz" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            問題に戻る
          </Link>
          <p className="text-center text-gray-500 py-12">読み込み中...</p>
        </div>
      }
    >
      <QuizTestContent />
    </Suspense>
  );
}
